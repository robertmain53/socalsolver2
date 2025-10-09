// triage-build-health.mjs (ESM)
// Scopo: sintetizzare gli errori principali dai log di build e/o ESLint *testuali*.
// Uso tipico:
//   node triage-build-health.mjs --build build-output.log --eslint eslint-output.log
//
// Argomenti:
//   --build  percorso al log testo del `next build` (default: build-output.log)
//   --eslint percorso a un log testuale di ESLint (opzionale; se non c'è, ignora)
//   --top    quanti errori/warning mostrare in classifica (default: 20)
//   --html   (opzionale) percorso per un mini report HTML
//
// Nota: NON fa JSON.parse dei log. Lavora su testo libero con regex robuste.

import fs from "fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import process from "node:process";

const args = parseArgs({
  options: {
    build: { type: "string", default: "build-output.log" },
    eslint: { type: "string", default: "" },
    top: { type: "string", default: "20" },
    html: { type: "string", default: "" },
  },
});
const BUILD_LOG = args.values.build;
const ESLINT_LOG = args.values.eslint;
const TOP_N = Math.max(1, parseInt(args.values.top || "20", 10)) || 20;
const HTML_OUT = args.values.html;

function safeRead(file) {
  return fs.readFile(file, "utf8").catch(() => "");
}

function normalizePath(p) {
  if (!p) return p;
  // normalizza ./ e backslash
  let out = p.trim().replace(/\\/g, "/");
  // rimuovi prefisso progetto se ripetuto
  out = out.replace(process.cwd().replace(/\\/g, "/") + "/", "");
  return out;
}

// Parser ESLint "stylish" o testo simile:
// Esempio:
// /abs/path/Row1Calculator.tsx
//   5:0  error  Parsing error: '}' expected
// Oppure su una sola riga:
// /abs/path/Row1Calculator.tsx  5:0  error  Parsing error: '}' expected
function parseEslintLike(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let currentFile = "";

  const singleLine = /^\s*(?<file>[\w./\-:\\ ]+\.tsx)\s+(?<line>\d+):(?<col>\d+)\s+(?<level>error|warning)\s+(?<msg>.+?)\s*$/i;
  const headerOnly = /^\s*(?<file>[\w./\-:\\ ]+\.tsx)\s*$/i;
  const detailLine = /^\s*(?<line>\d+):(?<col>\d+)\s+(?<level>error|warning)\s+(?<msg>.+?)\s*$/i;

  for (const ln of lines) {
    let m = ln.match(singleLine);
    if (m && m.groups) {
      out.push({
        file: normalizePath(m.groups.file),
        level: m.groups.level.toLowerCase(),
        msg: m.groups.msg.trim(),
      });
      continue;
    }
    m = ln.match(headerOnly);
    if (m && m.groups) {
      currentFile = normalizePath(m.groups.file);
      continue;
    }
    if (currentFile) {
      m = ln.match(detailLine);
      if (m && m.groups) {
        out.push({
          file: currentFile,
          level: m.groups.level.toLowerCase(),
          msg: m.groups.msg.trim(),
        });
      }
    }
  }
  return out;
}

// Parser build Next/Webpack testuale (molto best-effort):
// Cattura blocchi tipo:
// ./components/..../File.tsx
// Error:
//   x Expression expected
// e li associa al file precedente.
function parseNextBuild(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let currentFile = "";

  const fileLine = /^\s*(\.{0,2}\/[\w./\-]+\.tsx)\s*$/i;
  const xLine = /^\s*\x1B\[[0-9;]*m?\s*[xX]\s+(?<msg>.+?)\s*$/; // supporto ansi
  const errorWord = /^\s*Error\b[:\s]?/i;

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    // rileva linee con path file
    const fm = ln.match(fileLine);
    if (fm) {
      currentFile = normalizePath(fm[1]);
      continue;
    }

    // dopo "Error:" prova a prendere la riga con "x Message"
    if (errorWord.test(ln) && i + 1 < lines.length) {
      // scandisci un po' di righe finché trovi "x ..."
      for (let k = i + 1; k < Math.min(i + 6, lines.length); k++) {
        const xm = lines[k].match(xLine);
        if (xm && xm.groups) {
          out.push({
            file: currentFile || "(unknown file)",
            level: "error",
            msg: xm.groups.msg.trim(),
          });
          break;
        }
      }
      continue;
    }
  }
  return out;
}

function aggregate(items) {
  // Raggruppa per messaggio
  const byMsg = new Map();
  for (const it of items) {
    const key = `${it.level}::${it.msg}`;
    if (!byMsg.has(key)) {
      byMsg.set(key, { level: it.level, msg: it.msg, count: 0, files: new Set() });
    }
    const acc = byMsg.get(key);
    acc.count++;
    if (it.file) acc.files.add(it.file);
  }
  return [...byMsg.values()].sort((a, b) => b.count - a.count);
}

function toHtmlSummary(topIssues) {
  const esc = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  let html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Build Health</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial,sans-serif;padding:24px;line-height:1.4}
h1{font-size:20px;margin:0 0 12px}
h2{font-size:16px;margin:20px 0 8px}
code{background:#f6f8fa;padding:2px 6px;border-radius:4px}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:12px;color:#fff}
.badge.error{background:#d32f2f}
.badge.warning{background:#ed6c02}
.small{color:#555;font-size:12px}
li{margin-bottom:8px}
</style>
</head><body>
<h1>Build Health — Top issues</h1>
<ol>`;
  for (const t of topIssues) {
    const files = [...t.files].slice(0, 6).map(esc).join("<br>");
    const more = t.files.size > 6 ? `… +${t.files.size - 6} altri file` : "";
    html += `<li><span class="badge ${t.level}">${t.level}</span> x${t.count} — <code>${esc(
      t.msg
    )}</code><div class="small">${files} ${esc(more)}</div></li>`;
  }
  html += `</ol></body></html>`;
  return html;
}

async function main() {
  const [buildText, eslintText] = await Promise.all([safeRead(BUILD_LOG), ESLINT_LOG ? safeRead(ESLINT_LOG) : ""]);

  if (!buildText && !eslintText) {
    console.error(
      `❌ Nessun log leggibile. Verifica i percorsi:
- build:  ${path.resolve(BUILD_LOG)}
- eslint: ${ESLINT_LOG ? path.resolve(ESLINT_LOG) : "(non fornito)"}`
    );
    process.exit(1);
  }

  const fromBuild = buildText ? parseNextBuild(buildText) : [];
  const fromEslint = eslintText ? parseEslintLike(eslintText) : [];

  const all = [...fromBuild, ...fromEslint];

  if (all.length === 0) {
    console.log("✅ Nessun errore riconosciuto nei log (o formati non riconosciuti).");
    process.exit(0);
  }

  const top = aggregate(all).slice(0, TOP_N);

  console.log("== TOP ERRORI/WARNING ==");
  for (const t of top) {
    console.log(`- [${t.level}] x${t.count}  ${t.msg}`);
    const few = [...t.files].slice(0, 5);
    for (const f of few) console.log(`    · ${f}`);
    if (t.files.size > few.length) console.log(`    … +${t.files.size - few.length} altri file`);
  }

  if (HTML_OUT) {
    const html = toHtmlSummary(top);
    await fs.writeFile(HTML_OUT, html, "utf8");
    console.log(`\n📝 Report HTML: ${path.resolve(HTML_OUT)}`);
  }
}

main().catch((e) => {
  console.error("❌ Errore triage:", e?.message || e);
  process.exit(1);
});
