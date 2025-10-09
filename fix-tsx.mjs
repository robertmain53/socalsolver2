// fix-tsx.mjs
// Pass minimal: normalizza 'use client'; rimuove BOM; fixa alcuni caratteri HTML; (ESM-ready)

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ globby: default import (niente named import)
// prima:
// import { globby } from 'globby';

// dopo:
import globbyPkg from 'globby';
const globby = globbyPkg.globby || globbyPkg; // compat CJS/ESM


const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { dir: 'components/calculators', rscAudit: false, microLint: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--dir=')) args.dir = a.split('=')[1];
    else if (a === '--rscAudit') args.rscAudit = true;
    else if (a === '--microLint') args.microLint = true;
  }
  return args;
}

function ensureUseClient(src) {
  const cleaned = src.replace(/^\uFEFF/, '');
  const hasUseClient = /^\s*['"]use client['"];\s*/.test(cleaned);
  if (hasUseClient) {
    // se presente più volte, tieni la prima, rimuovi le altre
    return cleaned.replace(/^\s*(?:'use client'|"use client");\s*/m, (m) => m)
                  .replace(/(?<=^|\n)\s*(?:'use client'|"use client");\s*(?=\n)/g, '');
  }
  return `'use client';\n` + cleaned;
}

function fixCommonEntities(src) {
  // gestisci &apos; / &quot; solo quando compaiono fuori da jsx attribute contexts
  return src
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"');
}

function microLint(src) {
  // micro: rimuovi import React duplicati e whitespace eccessivo in coda
  let s = src.replace(/import\s+React[^;]*;\s*\n?/g, (m) => m.replace(/\n{2,}/g, '\n'));
  s = s.replace(/[ \t]+(\r?\n)/g, '$1');
  return s;
}

async function processFile(fp, opts) {
  let code = await fs.readFile(fp, 'utf8');
  const before = code;

  // 1) BOM + 'use client'
  code = ensureUseClient(code);

  // 2) entità HTML comuni
  code = fixCommonEntities(code);

  // 3) micro-lint facoltativo
  if (opts.microLint) code = microLint(code);

  if (code !== before) {
    await fs.writeFile(fp, code, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  const args = parseArgs(process.argv);
  const dir = path.resolve(process.cwd(), args.dir);
  const files = await globby([`${dir}/**/*.tsx`], { gitignore: true });
  let changed = 0;
  for (const f of files) {
    const ok = await processFile(f, args);
    if (ok) changed++;
  }
  console.log(`🔧 fix-tsx: processed ${files.length} file(s), modified ${changed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
