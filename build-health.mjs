#!/usr/bin/env node
/**
 * build-health.mjs
 * One place to see ALL errors:
 *  - optional: run your fix script
 *  - ESLint (JSON)
 *  - TypeScript (tsc --noEmit)
 *  - optional: next build (for completeness)
 * Aggregates to JSON + HTML so you can watch the numbers go down.
 */

import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
const exec = promisify(execCb);

const CONFIG = {
  fixScript: './fix-tsx.mjs',
  runFix: true,
  runESLint: true,
  runTSC: true,
  runNextBuild: false, // keep false for speed; turn on if you want bundler-level snapshot
  eslintGlobs: ['components/calculators/**/*.tsx'], // focus area; add more if you want
  outDir: 'reports',
  outJson: 'build-health.json',
  outHtml: 'build-health.html',
  concurrency: 4,
};

function parseArgs() {
  const argv = process.argv.slice(2);
  for (const a of argv) {
    if (a === '--no-fix') CONFIG.runFix = false;
    if (a === '--no-eslint') CONFIG.runESLint = false;
    if (a === '--no-tsc') CONFIG.runTSC = false;
    if (a === '--build') CONFIG.runNextBuild = true;
    if (a.startsWith('--eslint-glob=')) {
      const g = a.split('=')[1];
      CONFIG.eslintGlobs = g.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (a.startsWith('--fix-script=')) CONFIG.fixScript = a.split('=')[1];
    if (a.startsWith('--concurrency=')) CONFIG.concurrency = Math.max(1, parseInt(a.split('=')[1], 10) || 4);
    if (a.startsWith('--out-dir=')) CONFIG.outDir = a.split('=')[1];
  }
}
parseArgs();

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

async function runFixScript() {
  console.log('🔧 Running fix script…');
  const cmd = `node "${CONFIG.fixScript}" --all --concurrency=${CONFIG.concurrency}`;
  const res = await runCmd(cmd);
  process.stdout.write(res.stdout || '');
  process.stderr.write(res.stderr || '');
  // Try to read tsx-fix-report.json if produced
  try {
    const text = await fs.readFile(path.join(process.cwd(), 'tsx-fix-report.json'), 'utf8');
    return { ok: res.code === 0, report: JSON.parse(text) };
  } catch {
    return { ok: res.code === 0, report: null };
  }
}

async function runESLint() {
  console.log('🔎 Running ESLint…');
  const globs = CONFIG.eslintGlobs.map(g => `"${g}"`).join(' ');
  const cmd = `npx eslint -f json ${globs}`;
  const res = await runCmd(cmd);
  // ESLint returns non-zero on errors; parse stdout anyway
  let parsed = [];
  try {
    parsed = JSON.parse(res.stdout || '[]');
  } catch {
    // Fallback to unix formatter to at least count lines
    const fb = await runCmd(`npx eslint -f unix ${globs}`);
    const lines = (fb.stdout || '').split('\n').filter(Boolean);
    return {
      ok: false,
      totals: { files: 0, errors: lines.length, warnings: 0 },
      byRule: {},
      byFile: {},
      raw: fb.stdout,
    };
  }

  // Aggregate by rule & file
  let files = 0;
  let errors = 0;
  let warnings = 0;
  const byRule = {}; // ruleId -> { errors, warnings }
  const byFile = {}; // filePath -> { errors, warnings, issues: [{line,col,severity,ruleId,msg}] }

  for (const file of parsed) {
    files++;
    const filePath = file.filePath;
    if (!byFile[filePath]) byFile[filePath] = { errors: 0, warnings: 0, issues: [] };
    for (const m of file.messages) {
      const sev = m.severity === 2 ? 'errors' : 'warnings';
      if (sev === 'errors') errors++; else warnings++;
      const rule = m.ruleId || 'unknown';
      if (!byRule[rule]) byRule[rule] = { errors: 0, warnings: 0 };
      byRule[rule][sev]++;

      byFile[filePath][sev]++;
      byFile[filePath].issues.push({
        line: m.line, column: m.column, ruleId: rule,
        severity: m.severity, message: m.message
      });
    }
  }
  return {
    ok: res.code === 0,
    totals: { files, errors, warnings },
    byRule, byFile
  };
}

async function runTSC() {
  console.log('🧠 Running TypeScript (no emit)…');
  const res = await runCmd('npx tsc -p tsconfig.json --noEmit --pretty false');
  // Parse tsc diagnostics: path(line,col): error TSnnnn: message
  const output = (res.stdout + '\n' + res.stderr).trim();
  const lines = output.split('\n').filter(Boolean);
  const diag = [];
  const re = /^(.*)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.*)$/i;

  for (const line of lines) {
    const m = line.match(re);
    if (m) {
      diag.push({
        file: m[1],
        line: Number(m[2]),
        column: Number(m[3]),
        code: `TS${m[4]}`,
        message: m[5],
      });
    }
  }
  // Aggregate by file and code
  const byFile = {};
  const byCode = {};
  for (const d of diag) {
    if (!byFile[d.file]) byFile[d.file] = [];
    byFile[d.file].push(d);
    if (!byCode[d.code]) byCode[d.code] = 0;
    byCode[d.code]++;
  }
  return {
    ok: res.code === 0,
    total: diag.length,
    byFile, byCode,
    raw: output,
  };
}

function topEntries(obj, pick, limit = 15) {
  const arr = Object.entries(obj).map(([k, v]) => [k, pick(v)]);
  arr.sort((a, b) => b[1] - a[1]);
  return arr.slice(0, limit).map(([k, n]) => ({ key: k, count: n }));
}

async function runNextBuild() {
  console.log('🏗️  Running next build (snapshot)…');
  const res = await runCmd('npm run build');
  const out = (res.stdout || '') + '\n' + (res.stderr || '');
  return { ok: res.code === 0, raw: out };
}

function htmlEscape(s) {
  return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function generateHTML(report) {
  const css = `
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;line-height:1.45}
  h1{margin:0 0 8px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin:16px 0}
  .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px}
  .muted{color:#6b7280}
  table{border-collapse:collapse;width:100%}
  th,td{border-bottom:1px solid #e5e7eb;padding:8px;text-align:left;vertical-align:top}
  code{background:#f3f4f6;padding:2px 6px;border-radius:6px}
  .bad{color:#b91c1c}
  .warn{color:#b45309}
  .good{color:#065f46}
  `;

  const topEslintRules = report.eslint?.topRules || [];
  const topTscCodes = topEntries(report.tsc?.byCode || {}, (n)=>n, 20);
  const topEslintFiles = topEntries(report.eslint?.byFile || {}, v => v.errors + v.warnings, 20);
  const topTscFiles = topEntries(report.tsc?.byFile || {}, v => v.length, 20);

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Build Health</title><style>${css}</style></head>
<body>
  <h1>Build Health</h1>
  <div class="muted">Started: ${htmlEscape(report.startedAt)} &nbsp;•&nbsp; Finished: ${htmlEscape(report.finishedAt)}</div>

  <div class="grid">
    <div class="card">
      <h3>Fix Script</h3>
      <div>${report.fix?.ok ? 'OK' : 'Ran'} ${report.fix?.summary ? `— changes: ${report.fix.summary.successes}/${report.fix.summary.total}` : ''}</div>
    </div>
    <div class="card">
      <h3>ESLint</h3>
      <div><b class="bad">${report.eslint?.totals?.errors ?? 0} errors</b>, <b class="warn">${report.eslint?.totals?.warnings ?? 0} warnings</b> across ${report.eslint?.totals?.files ?? 0} files</div>
    </div>
    <div class="card">
      <h3>TypeScript</h3>
      <div><b class="bad">${report.tsc?.total ?? 0} diagnostics</b> (${report.tsc?.ok ? 'OK' : 'HAS ERRORS'})</div>
    </div>
    <div class="card">
      <h3>Next Build</h3>
      <div>${report.nextBuild ? (report.nextBuild.ok ? '<span class="good">OK</span>' : '<span class="bad">FAILED</span>') : 'Skipped'}</div>
    </div>
  </div>

  <h2>Top ESLint Rules</h2>
  <table><thead><tr><th>Rule</th><th>Total</th><th>Errors</th><th>Warnings</th></tr></thead><tbody>
  ${
    (report.eslint ? Object.entries(report.eslint.byRule || {})
      .map(([rule, v]) => ({ rule, total: (v.errors||0)+(v.warnings||0), errors: v.errors||0, warnings: v.warnings||0 }))
      .sort((a,b)=>b.total-a.total).slice(0,20) : []
    ).map(r => `<tr><td><code>${htmlEscape(r.rule)}</code></td><td>${r.total}</td><td>${r.errors}</td><td>${r.warnings}</td></tr>`).join('')
  }
  </tbody></table>

  <h2>Top TypeScript Codes</h2>
  <table><thead><tr><th>Code</th><th>Count</th></tr></thead><tbody>
  ${topTscCodes.map(e => `<tr><td><code>${htmlEscape(e.key)}</code></td><td>${e.count}</td></tr>`).join('')}
  </tbody></table>

  <h2>Files with Most ESLint Issues</h2>
  <table><thead><tr><th>File</th><th>Total</th></tr></thead><tbody>
  ${topEslintFiles.map(e => `<tr><td><code>${htmlEscape(e.key)}</code></td><td>${e.count}</td></tr>`).join('')}
  </tbody></table>

  <h2>Files with Most TypeScript Diagnostics</h2>
  <table><thead><tr><th>File</th><th>Count</th></tr></thead><tbody>
  ${topTscFiles.map(e => `<tr><td><code>${htmlEscape(e.key)}</code></td><td>${e.count}</td></tr>`).join('')}
  </tbody></table>
</body>
</html>`;
}

function summarizeFixReport(data) {
  try {
    if (!data) return null;
    if (Array.isArray(data)) {
      const total = data.length;
      const successes = data.filter(r =>
        ['fixed', 'fixed_autofix', 'fixed_eslint', 'rsc_fixed'].includes(r.action || r.status)
      ).length;
      return { total, successes };
    }
    const details = Array.isArray(data.details) ? data.details : [];
    const total = details.length || data.totalFiles || 0;
    const successes = details.filter(d =>
      ['fixed', 'fixed_autofix', 'fixed_eslint', 'rsc_fixed'].includes(d.action || d.status)
    ).length;
    return { total, successes };
  } catch {
    return null;
  }
}

(async () => {
  const startedAt = new Date().toISOString();
  await fs.mkdir(CONFIG.outDir, { recursive: true });

  const report = { startedAt };

  // 0) Fix script
  if (CONFIG.runFix) {
    const fx = await runFixScript();
    report.fix = { ok: fx.ok, summary: summarizeFixReport(fx.report) };
  }

  // 1) ESLint
  if (CONFIG.runESLint) {
    const es = await runESLint();
    report.eslint = es;
  }

  // 2) TSC
  if (CONFIG.runTSC) {
    const ts = await runTSC();
    report.tsc = ts;
  }

  // 3) Next build (optional snapshot)
  if (CONFIG.runNextBuild) {
    const nb = await runNextBuild();
    report.nextBuild = { ok: nb.ok };
  }

  const finishedAt = new Date().toISOString();
  report.finishedAt = finishedAt;

  // write JSON
  const jsonPath = path.join(CONFIG.outDir, CONFIG.outJson);
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  // write HTML
  const html = generateHTML(report);
  const htmlPath = path.join(CONFIG.outDir, CONFIG.outHtml);
  await fs.writeFile(htmlPath, html, 'utf8');

  // console summary
  console.log('\n📊 Build Health Summary');
  if (report.fix) {
    const s = report.fix.summary;
    console.log(`   Fix script: ${s ? `${s.successes}/${s.total} changes` : 'ran'}`);
  }
  if (report.eslint) {
    const t = report.eslint.totals;
    console.log(`   ESLint: ${t.errors} errors, ${t.warnings} warnings across ${t.files} files`);
  }
  if (report.tsc) {
    console.log(`   TypeScript: ${report.tsc.total} diagnostics`);
  }
  if (report.nextBuild) {
    console.log(`   Next build: ${report.nextBuild.ok ? 'OK' : 'FAILED'}`);
  }
  console.log(`\n📝 JSON: ${jsonPath}`);
  console.log(`🖥️  HTML: ${htmlPath}`);
})();
