// triage-build-health.mjs
// Riassume build-health.json: top error signatures, top files e campioni.
// ESM compatibile con "type": "module"

import fs from 'fs';

const INPUT = process.argv[2] || 'build-health.json';
if (!fs.existsSync(INPUT)) {
  console.error(`❌ ${INPUT} non trovato. Esegui prima "node extract-build-health.mjs" o passa un path JSON come argomento.`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
} catch (e) {
  console.error(`❌ Impossibile leggere/parsing ${INPUT}:`, e.message);
  process.exit(1);
}

const issues = Array.isArray(data.issues) ? data.issues : [];
if (!issues.length) {
  console.log(`ℹ️ Nessuna issue in ${INPUT}.`);
  process.exit(0);
}

const byLevel = issues.reduce((m, i) => {
  const k = i.level || 'unknown';
  m[k] = (m[k] || 0) + 1;
  return m;
}, {});

const byFile = issues.reduce((m, i) => {
  const k = i.file || 'unknown';
  m[k] = (m[k] || 0) + 1;
  return m;
}, {});

// normalizza per raggruppare messaggi simili
const normalizeMsg = (s) =>
  String(s || '')
    .replace(/\d+/g, '#')                     // numeri -> #
    .replace(/\/[A-Za-z0-9._/-]+/g, '<path>') // path -> <path>
    .replace(/'[^']*'/g, "'…'")               // stringhe in apici
    .replace(/"[^"]*"/g, '"…"')               // stringhe in doppi apici
    .replace(/\s+/g, ' ')
    .trim();

const byMsg = new Map();
for (const i of issues) {
  const key = normalizeMsg(i.message);
  const bucket = byMsg.get(key) || { count: 0, samples: [] };
  bucket.count++;
  if (bucket.samples.length < 5) bucket.samples.push(i);
  byMsg.set(key, bucket);
}

const topEntries = (obj, n = 15) =>
  Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

const topMsgs = [...byMsg.entries()]
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 15);

const topFiles = topEntries(byFile, 15);

const lines = [];
lines.push(`Build Health Summary (${INPUT})`);
lines.push(`Total issues: ${issues.length}`);
lines.push(`By level: ${Object.entries(byLevel).map(([k,v])=>`${k}=${v}`).join('  ')}`);
lines.push('');

lines.push(`Top 15 error signatures:`);
for (const [msg, info] of topMsgs) {
  lines.push(`  • ${String(info.count).padStart(4)}×  ${msg}`);
}
lines.push('');

lines.push(`Top 15 files by issue count:`);
for (const [f, c] of topFiles) {
  lines.push(`  • ${String(c).padStart(4)}×  ${f}`);
}
lines.push('');

lines.push(`Samples per top 5 error signatures:`);
for (const [msg, info] of topMsgs.slice(0, 5)) {
  lines.push(`\n▶ ${msg}  (${info.count}×)`);
  for (const s of info.samples) {
    const file = s.file || 'unknown';
    const line = s.line ?? '?';
    const col  = s.col ?? '?';
    const lvl  = s.level || 'unknown';
    lines.push(`   - ${file}:${line}:${col}  ${lvl}`);
  }
}

const out = lines.join('\n');
fs.writeFileSync('build-health-summary.txt', out, 'utf8');
console.log(out);
console.log('\n📄 Salvato: build-health-summary.txt');
