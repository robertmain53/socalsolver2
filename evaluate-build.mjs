#!/usr/bin/env node
/**
 * evaluate-build.mjs
 * -
 * Runs (optionally) your fix script, then counts ESLint + Next build errors.
 * Produces a machine-readable JSON report + a concise console summary.
 */

import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
const exec = promisify(execCb);

const CONFIG = {
  calculatorsDir: 'components/calculators',
  fixScriptPath: './fix-tsx.mjs', // change if needed
  runFix: true,
  runNextBuild: true,
  runEslint: true,
  eslintGlobs: ['components/calculators/**/*.tsx', 'app/**/*.tsx'], // adjust globs if desired
  reportFile: 'build-health-report.json',
  concurrency: 4,
};

function parseArgFlags() {
  const argv = process.argv.slice(2);
  for (const a of argv) {
    if (a === '--no-fix') CONFIG.runFix = false;
    if (a === '--no-build') CONFIG.runNextBuild = false;
    if (a === '--no-eslint') CONFIG.runEslint = false;
    if (a.startsWith('--fix-script=')) CONFIG.fixScriptPath = a.split('=')[1];
    if (a.startsWith('--concurrency=')) CONFIG.concurrency = Math.max(1, parseInt(a.split('=')[1], 10) || 4);
  }
}
parseArgFlags();

async function runCmd(cmd, opts = {}) {
  try {
    const { stdout, stderr } = await exec(cmd, {
      ...opts,
      maxBuffer: 1024 * 1024 * 64,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', CI: '1' },
    });
    return { code: 0, stdout, stderr };
  } catch (err) {
    return {
      code: typeof err.code === 'number' ? err.code : 1,
      stdout: err.stdout || '',
      stderr: err.stderr || String(err.message || ''),
    };
  }
}

function summarizeFixReport(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (Array.isArray(data)) {
      // older version might be an array of entries
      const total = data.length;
      const successes = data.filter((r) =>
        ['fixed_autofix', 'fixed_eslint', 'rsc_fixed'].includes(r.status)
      ).length;
      return { total, successes };
    }
    // newer version is an object with details
    const details = Array.isArray(data.details) ? data.details : [];
    const total = details.length || data.totalFiles || 0;
    const successes = details.filter((d) =>
      ['fixed_autofix', 'fixed_eslint', 'rsc_fixed', 'fixed'].includes(d.action || d.status)
    ).length;
    return { total, successes };
  } catch {
    return null;
  }
}

async function runFixScript() {
  console.log('🔧 Running fix script…');
  const cmd = `node "${CONFIG.fixScriptPath}" --all --concurrency=${CONFIG.concurrency}`;
  const res = await runCmd(cmd);
  process.stdout.write(res.stdout || '');
  process.stderr.write(res.stderr || '');
  // Try to read its report if present
  let fixSummary = null;
  try {
    const reportPath = path.join(process.cwd(), 'tsx-fix-report.json');
    const text = await fs.readFile(reportPath, 'utf8');
    fixSummary = summarizeFixReport(text);
  } catch { /* ignore */ }
  return { ok: res.code === 0, fixSummary };
}

async function runESLint() {
  console.log('🔎 Running ESLint…');
  const globs = CONFIG.eslintGlobs.map((g) => `"${g}"`).join(' ');
  const cmd = `npx eslint -f json ${globs}`;
  const res = await runCmd(cmd);
  // Even with errors ESLint exits non-zero; we still parse JSON from stdout
  let parsed = [];
  try {
    parsed = JSON.parse(res.stdout || '[]');
  } catch {
    // If formatter crashed, try unix formatter fallback just to count lines
    const fallback = await runCmd(`npx eslint -f unix ${globs}`);
    const lines = (fallback.stdout || '').split('\n').filter(Boolean);
    return {
      ok: false,
      totals: { files: 0, errors: lines.length, warnings: 0 },
      byRule: {},
      raw: fallback.stdout + '\n' + fallback.stderr,
    };
  }

  // Aggregate
  let files = 0;
  let errors = 0;
  let warnings = 0;
  const byRule = {}; // { ruleId: { errors, warnings } }

  for (const file of parsed) {
    files++;
    for (const m of file.messages) {
      if (m.severity === 2) errors++;
      else warnings++;
      const id = m.ruleId || 'unknown';
      if (!byRule[id]) byRule[id] = { errors: 0, warnings: 0 };
      if (m.severity === 2) byRule[id].errors++;
      else byRule[id].warnings++;
    }
  }

  return {
    ok: res.code === 0,
    totals: { files, errors, warnings },
    byRule,
    raw: res.stdout || res.stderr,
  };
}

function parseNextBuildOutput(all) {
  const lines = all.split('\n');

  const failed = lines.some((l) => l.includes('Failed to compile.'));
  const compileMarkers = lines.filter((l) => l.trimStart().startsWith('x ')).length;

  // Parse rule lines like:
  // "  83:25  Error: ...  react/no-unescaped-entities"
  const ruleCounts = {};
  let ruleErrors = 0;
  let ruleWarnings = 0;

  for (const l of lines) {
    const m = l.match(/\b(Error|Warning): .*?\s{2,}([@a-z0-9\-_/]+)$/i);
    if (m) {
      const type = m[1];
      const rule = m[2];
      if (!ruleCounts[rule]) ruleCounts[rule] = { errors: 0, warnings: 0 };
      if (/error/i.test(type)) {
        ruleCounts[rule].errors++;
        ruleErrors++;
      } else {
        ruleCounts[rule].warnings++;
        ruleWarnings++;
      }
    }
  }

  return {
    failed,
    compileMarkers,
    ruleTotals: { errors: ruleErrors, warnings: ruleWarnings },
    ruleCounts,
  };
}

async function runNextBuild() {
  console.log('🏗️  Running next build (this may fail; that is expected)…');
  const res = await runCmd('npm run build');
  // We parse both stdout & stderr so we don't miss anything
  const parsed = parseNextBuildOutput((res.stdout || '') + '\n' + (res.stderr || ''));
  return { ok: res.code === 0, parsed, raw: res.stdout + '\n' + res.stderr };
}

function topRules(byRule, limit = 10) {
  const entries = Object.entries(byRule).map(([k, v]) => [k, v.errors + v.warnings, v]);
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, limit).map(([rule, total, v]) => ({ rule, total, errors: v.errors, warnings: v.warnings }));
}

(async () => {
  const report = {
    startedAt: new Date().toISOString(),
    fix: null,
    eslint: null,
    nextBuild: null,
  };

  if (CONFIG.runFix) {
    const { ok, fixSummary } = await runFixScript();
    report.fix = { ok, summary: fixSummary || null };
  }

  if (CONFIG.runEslint) {
    const eslintRes = await runESLint();
    report.eslint = {
      ok: eslintRes.ok,
      totals: eslintRes.totals,
      topRules: topRules(eslintRes.byRule),
    };
  }

  if (CONFIG.runNextBuild) {
    const buildRes = await runNextBuild();
    report.nextBuild = {
      ok: buildRes.ok,
      failed: buildRes.parsed.failed,
      compileMarkers: buildRes.parsed.compileMarkers,
      ruleTotals: buildRes.parsed.ruleTotals,
      topRules: topRules(buildRes.parsed.ruleCounts),
    };
  }

  report.finishedAt = new Date().toISOString();

  const outPath = path.join(process.cwd(), CONFIG.reportFile);
  await fs.writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');

  // Console summary
  console.log('\n📊 Build Health Summary');
  if (report.fix?.summary) {
    console.log(`   Fix script: ${report.fix.summary.successes}/${report.fix.summary.total} changes applied`);
  }
  if (report.eslint) {
    const { totals } = report.eslint;
    console.log(`   ESLint: ${totals.errors} errors, ${totals.warnings} warnings across ${totals.files} files`);
    if (report.eslint.topRules?.length) {
      console.log('   Top ESLint rules:');
      for (const r of report.eslint.topRules) {
        console.log(`     • ${r.rule} — ${r.total} (${r.errors}E/${r.warnings}W)`);
      }
    }
  }
  if (report.nextBuild) {
    console.log(
      `   Next build: ${report.nextBuild.ok ? 'OK' : 'FAILED'} — compile markers: ${report.nextBuild.compileMarkers}`
    );
    if (report.nextBuild.topRules?.length) {
      console.log('   Top Next build rule hits (from lint during build):');
      for (const r of report.nextBuild.topRules) {
        console.log(`     • ${r.rule} — ${r.total} (${r.errors}E/${r.warnings}W)`);
      }
    }
  }
  console.log(`\n📝 Report written to: ${CONFIG.reportFile}`);
})();
