#!/usr/bin/env node
// automation.js (ESM, single-file, no deps esterne)
// End-to-end: Sheet -> Spec -> TSX -> (fix-tsx.mjs) -> ESLint --fix -> next build

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// ---------- Utilità base ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

// carica .env senza dipendenze
async function loadDotEnv() {
  const envPath = path.join(cwd, '.env');
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) {
        const key = m[1];
        let val = m[2];
        // rimuovi eventuali apici
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
      }
    });
  } catch {
    // opzionale
  }
}

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.split('=');
      const key = k.replace(/^--/, '');
      args[key] = v ?? true;
    }
  }
  return args;
}

function pascalize(s) {
  return (s || '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function escapeJSXText(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

// trasforma ^ in **, valida token consentiti
function normalizeExpr(expr, knownVars) {
  const e = String(expr).trim().replace(/\^/g, '**');
  // consentiti: a-z0-9 _ . ( ) + - * / % ** spazio
  // e variabili definite
  const invalid = e.match(/[^a-zA-Z0-9_().+\-/*%\s*]/g);
  if (invalid) {
    // potremmo essere più permissivi, ma così evitiamo caratteri strani
  }
  // controlla variabili referenced
  const identifiers = [...e.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g)].map((m) => m[1]);
  for (const id of identifiers) {
    if (!knownVars.has(id) && !['Math'].includes(id)) {
      // non blocchiamo, ma segnaliamo
      // console.warn(`  - Attenzione: variabile "${id}" non definita (expr: ${expr})`);
    }
  }
  return e;
}

// very tiny Markdown -> HTML (safe-ish, minimal)
function mdToHtml(md) {
  if (!md) return '';
  let html = String(md);
  // escape base
  html = html
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  // titoli
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // grassetto/italico
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // liste
  // blocco liste - riga che inizia con "- "
  html = html.replace(/^(?:- .*(?:\r?\n|$))+?/gm, (block) => {
    const items = block
      .trim()
      .split(/\r?\n/)
      .map((l) => l.replace(/^- /, '').trim())
      .filter(Boolean)
      .map((t) => `<li>${t}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  });

  // paragrafi: doppia newline -> <p>
  html = html
    .split(/\n{2,}/)
    .map((chunk) => {
      if (chunk.match(/^<h[1-6]>/) || chunk.startsWith('<ul>')) return chunk;
      return `<p>${chunk.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}

// spawn helper
function sh(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts, shell: false });
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
    p.on('error', reject);
  });
}

// ---------- Sheet fetch & parse ----------
async function fetchSheetRows(sheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    sheetId
  )}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  console.log(`🌐 Fetch: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
  if (!m) throw new Error('Formato GVIZ non riconosciuto.');
  const payload = JSON.parse(m[1]);
  const table = payload.table;
  const headers = table.cols.map((c) => (c && c.label ? c.label : '').trim());
  const rows = table.rows.map((r) => {
    const o = {};
    r.c.forEach((cell, idx) => {
      const key = headers[idx] || `col${idx}`;
      o[key] = cell ? cell.v : '';
    });
    return o;
  });
  return { headers, rows };
}

// ---------- Spec validation (light, no deps) ----------
function safeJsonParse(s, fallback) {
  if (typeof s !== 'string') return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

function validateSpec(row, idx) {
  const required = ['slug', 'title', 'lang', 'category', 'description', 'inputs', 'outputs', 'formulaSteps', 'examples'];
  for (const k of required) {
    if (!(k in row) || row[k] === '' || row[k] == null) {
      return { ok: false, reason: `riga ${idx + 1}: campo mancante "${k}"` };
    }
  }
  const inputs = safeJsonParse(row.inputs, null);
  const outputs = safeJsonParse(row.outputs, null);
  const steps = safeJsonParse(row.formulaSteps, null);
  const examples = safeJsonParse(row.examples, null);
  if (!Array.isArray(inputs) || inputs.length === 0) return { ok: false, reason: `riga ${idx + 1}: inputs non validi` };
  if (!Array.isArray(outputs) || outputs.length === 0) return { ok: false, reason: `riga ${idx + 1}: outputs non validi` };
  if (!Array.isArray(steps) || steps.length === 0) return { ok: false, reason: `riga ${idx + 1}: formulaSteps non validi` };
  if (!Array.isArray(examples) || examples.length === 0) return { ok: false, reason: `riga ${idx + 1}: examples mancanti` };

  const inputIds = new Set(inputs.map((i) => i.id));
  const known = new Set([...inputIds, ...steps.map((s) => s.id), ...outputs.map((o) => o.id)]);

  for (const s of steps) {
    if (!s.id || !s.expr) return { ok: false, reason: `riga ${idx + 1}: formulaStep incompleto` };
    normalizeExpr(s.expr, known); // side-check
  }

  // examples check (shallow)
  for (const ex of examples) {
    if (!ex.inputs || typeof ex.inputs !== 'object') return { ok: false, reason: `riga ${idx + 1}: example.inputs mancante` };
    if (!ex.outputs || typeof ex.outputs !== 'object') return { ok: false, reason: `riga ${idx + 1}: example.outputs mancante` };
  }

  return {
    ok: true,
    spec: {
      slug: String(row.slug).trim(),
      title: String(row.title).trim(),
      lang: String(row.lang).trim(),
      category: String(row.category).trim(),
      description: String(row.description).trim(),
      tags: String(row.tags || '').trim(),
      content: String(row.content || ''),
      inputs,
      outputs,
      formulaSteps: steps,
      examples
    }
  };
}

// ---------- TSX codegen ----------
function generateComponentTSX(spec) {
  const name = `${pascalize(spec.slug)}Calculator`;
  const fileName = `${name}.tsx`;

  const title = escapeJSXText(spec.title);
  const description = escapeJSXText(spec.description);

  const lang = spec.lang || 'it';

  // prepare inputs state
  const inputStateLines = spec.inputs.map((inp) => {
    const id = inp.id;
    const t = (inp.type || 'number').toLowerCase();
    const defaultVal = t === 'number' ? (typeof inp.default === 'number' ? inp.default : '') : (inp.default ?? '');
    const union = t === 'number' ? 'number | ""' : 'string';
    const escapedDefault = t === 'number' ? (defaultVal === '' ? '""' : String(defaultVal)) : JSON.stringify(String(defaultVal));
    return `  const [${id}, set_${id}] = useState<${union}>(${escapedDefault});`;
  });

  const handleChangeLines = spec.inputs.map((inp) => {
    const id = inp.id;
    const t = (inp.type || 'number').toLowerCase();
    if (t === 'number') {
      return `          onChange={(e) => {
            const v = e.target.value === "" ? "" : Number(e.target.value);
            set_${id}(isNaN(v) ? "" : v);
          }}`;
    } else if (t === 'select' && Array.isArray(inp.options)) {
      // select handled in render
      return '';
    } else {
      return `          onChange={(e) => set_${id}(e.target.value)}`;
    }
  });

  // gather known variables for expressions
  const known = new Set([
    ...spec.inputs.map((i) => i.id),
    ...spec.formulaSteps.map((s) => s.id)
  ]);

  // compute block
  const computeLines = [];
  computeLines.push(`    const ctx: Record<string, number> = {};`);
  // parse numeric inputs
  for (const inp of spec.inputs) {
    const id = inp.id;
    const t = (inp.type || 'number').toLowerCase();
    if (t === 'number') {
      computeLines.push(`    ctx["${id}"] = typeof ${id} === "number" ? ${id} : Number(${id}) || 0;`);
    }
  }
  for (const step of spec.formulaSteps) {
    const expr = normalizeExpr(step.expr, known);
    computeLines.push(`    const ${step.id} = (() => {`);
    computeLines.push(`      try {`);
    // sostituisci variabili con ctx[...] quando sono input, altrimenti variable locale
    let jsExpr = expr.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (m, v) => {
      if (spec.inputs.some((i) => i.id === v)) return `ctx["${v}"]`;
      return v;
    });
    computeLines.push(`        return (${jsExpr});`);
    computeLines.push(`      } catch { return NaN; }`);
    computeLines.push(`    })();`);
  }
  // outputs: se coincidono con step.id usa quello, altrimenti prova a calcolare come variabile
  computeLines.push(`    const out: Record<string, number> = {};`);
  for (const out of spec.outputs) {
    if (known.has(out.id)) {
      computeLines.push(`    out["${out.id}"] = (typeof ${out.id} === "number" ? ${out.id} : Number(${out.id}) || 0);`);
    } else {
      computeLines.push(`    out["${out.id}"] = 0; // non definito in steps, fallback 0`);
    }
  }
  computeLines.push(`    return out;`);

  // formula explanation lines
  const explainLines = spec.formulaSteps.map((s) => {
    // esempio: "imposta = reddito * aliquota / 100"
    const label = escapeJSXText(s.label || s.id);
    const human = escapeJSXText(s.expr);
    return `            <li><code>${escapeJSXText(s.id)} = ${human}</code>${label ? ` – ${label}` : ''}</li>`;
  });

  // render inputs
  const inputControls = spec.inputs.map((inp, idx) => {
    const id = inp.id;
    const t = (inp.type || 'number').toLowerCase();
    const label = escapeJSXText(inp.label || id);
    const min = Number.isFinite(inp.min) ? ` min="${inp.min}"` : '';
    const max = Number.isFinite(inp.max) ? ` max="${inp.max}"` : '';
    const step = Number.isFinite(inp.step) ? ` step="${inp.step}"` : '';
    const unit = inp.unit ? `<span className="text-sm opacity-70 ml-2">${escapeJSXText(inp.unit)}</span>` : '';
    if (t === 'number') {
      return `
          <label className="block mb-2">
            <span className="block text-sm font-medium mb-1">${label}</span>
            <input
              aria-label="${label}"
              type="number"${min}${max}${step}
              className="w-full border rounded px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              value={${id} === "" ? "" : ${id}}
              ${handleChangeLines[idx]}
            />
            ${unit}
          </label>`;
    } else if (t === 'select' && Array.isArray(inp.options)) {
      const opts = inp.options.map((o) => `<option value="${escapeJSXText(o.value ?? o)}">${escapeJSXText(o.label ?? o)}</option>`).join('\n');
      return `
          <label className="block mb-2">
            <span className="block text-sm font-medium mb-1">${label}</span>
            <select
              aria-label="${label}"
              className="w-full border rounded px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              value={${id} as any}
              onChange={(e) => set_${id}(e.target.value)}
            >
              ${opts}
            </select>
          </label>`;
    } else {
      return `
          <label className="block mb-2">
            <span className="block text-sm font-medium mb-1">${label}</span>
            <input
              aria-label="${label}"
              type="text"
              className="w-full border rounded px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              value={${id} as any}
              onChange={(e) => set_${id}(e.target.value)}
            />
          </label>`;
    }
  }).join('\n');

  // outputs UI
  const outputsUI = spec.outputs.map((o) => {
    const label = escapeJSXText(o.label || o.id);
    const id = o.id;
    return `
            <div className="p-3 border rounded-md">
              <div className="text-sm opacity-70">${label}</div>
              <div className="text-xl font-semibold">{Number.isFinite(results["${id}"]) ? results["${id}"].toLocaleString(undefined, {maximumFractionDigits: 6}) : '—'}</div>
            </div>`;
  }).join('\n');

  // localized labels
  const L = {
    it: {
      calcTitle: title,
      calcDesc: description,
      stepByStep: 'Analisi passo-passo',
      save: 'Salva risultato',
      pdf: 'Esporta in PDF',
      results: 'Risultati',
      inputs: 'Input',
      savedOk: 'Risultato salvato',
      content: 'Approfondimenti'
    },
    en: {
      calcTitle: title,
      calcDesc: description,
      stepByStep: 'Step-by-step analysis',
      save: 'Save result',
      pdf: 'Export to PDF',
      results: 'Results',
      inputs: 'Inputs',
      savedOk: 'Result saved',
      content: 'Insights'
    },
    fr: {
      calcTitle: title,
      calcDesc: description,
      stepByStep: 'Analyse pas à pas',
      save: 'Enregistrer le résultat',
      pdf: 'Exporter en PDF',
      results: 'Résultats',
      inputs: 'Entrées',
      savedOk: 'Résultat enregistré',
      content: 'Approfondissements'
    },
    es: {
      calcTitle: title,
      calcDesc: description,
      stepByStep: 'Análisis paso a paso',
      save: 'Guardar resultado',
      pdf: 'Exportar a PDF',
      results: 'Resultados',
      inputs: 'Entradas',
      savedOk: 'Resultado guardado',
      content: 'Contenido'
    },
    de: {
      calcTitle: title,
      calcDesc: description,
      stepByStep: 'Schritt-für-Schritt-Analyse',
      save: 'Ergebnis speichern',
      pdf: 'Als PDF exportieren',
      results: 'Ergebnisse',
      inputs: 'Eingaben',
      savedOk: 'Ergebnis gespeichert',
      content: 'Inhalte'
    }
  }[lang] || L.it;

  const contentHTML = mdToHtml(spec.content);

  const code = `'use client';
import { useState, useMemo, useRef, useCallback } from 'react';

export default function ${name}() {
${inputStateLines.join('\n')}

  const calcRef = useRef<HTMLDivElement>(null);
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (calcRef.current) {
        const canvas = await html2canvas(calcRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight, undefined, 'FAST');
        pdf.save('${spec.slug}.pdf');
      }
    } catch (e) {
      alert('${lang === 'it' ? 'Funzione PDF non disponibile in questo ambiente' : 'PDF feature not available in this environment'}');
    }
  }, []);

  const results = useMemo(() => {
${computeLines.join('\n')}
  }, [${spec.inputs.map((i) => i.id).join(', ')}]);

  const handleSave = useCallback(() => {
    try {
      const payload = {
        slug: ${JSON.stringify(spec.slug)},
        title: ${JSON.stringify(spec.title)},
        inputs: { ${spec.inputs.map((i) => `"${i.id}": ${i.id}`).join(', ')} },
        results
      };
      const key = 'calc:'+${JSON.stringify(spec.slug)}+':results';
      const all = JSON.parse(localStorage.getItem(key) || '[]');
      all.unshift(payload);
      localStorage.setItem(key, JSON.stringify(all).slice(0, 2*1024*1024)); // limite 2MB
      alert('${escapeJSXText(L.savedOk)}');
    } catch {}
  }, [${spec.inputs.map((i) => i.id).join(', ')}, results]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div ref={calcRef} className="lg:col-span-2 p-6 border rounded shadow bg-white">
        <h1 className="text-2xl font-bold mb-2">${escapeJSXText(L.calcTitle)}</h1>
        <p className="text-sm opacity-80 mb-6">${escapeJSXText(L.calcDesc)}</p>

        <section aria-label="${escapeJSXText(L.inputs)}" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${inputControls}
          </div>
        </section>

        <section aria-label="${escapeJSXText(L.results)}" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
${outputsUI}
          </div>
        </section>

        {${JSON.stringify(Boolean(contentHTML))} ? (
          <section className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-3">${escapeJSXText(L.content)}</h2>
            <article dangerouslySetInnerHTML={{ __html: ${JSON.stringify(contentHTML)} }} />
          </section>
        ) : null}
      </div>

      <aside className="lg:col-span-1 p-6 border rounded shadow bg-white">
        <details className="mb-6">
          <summary className="cursor-pointer font-semibold">${escapeJSXText(L.stepByStep)}</summary>
          <ol className="list-decimal ml-5 mt-3 space-y-1">
${explainLines.join('\n')}
          </ol>
        </details>

        <div className="flex gap-3">
          <button
            type="button"
            aria-label="${escapeJSXText(L.save)}"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
          >
            ${escapeJSXText(L.save)}
          </button>
          <button
            type="button"
            aria-label="${escapeJSXText(L.pdf)}"
            className="px-4 py-2 rounded border"
            onClick={handleExportPDF}
          >
            ${escapeJSXText(L.pdf)}
          </button>
        </div>
      </aside>
    </div>
  );
}
`;
  return { fileName, code };
}

// ---------- Fix & Build ----------
async function runFixTSXIfPresent(targetDir, manifestFiles) {
  const fixScript = path.join(cwd, 'fix-tsx.mjs');
  try {
    await fs.access(fixScript);
  } catch {
    console.log('🧩 fix-tsx.mjs non presente: salto il passaggio.');
    return;
  }
  console.log('🛠  Eseguo fix-tsx.mjs sui file generati…');
  const args = ['fix-tsx.mjs', '--dir', targetDir, '--manifest', manifestFiles.join(',')];
  await sh('node', args, { cwd });
}

async function runESLintFixOn(files) {
  try {
    await sh('npx', ['eslint', '--fix', ...files], { cwd });
  } catch (e) {
    console.warn('⚠️  ESLint ha riportato problemi (vedi output sopra).');
  }
}

async function runNextBuild() {
  const logPath = path.join(cwd, 'build-output.log');
  const out = await new Promise((resolve) => {
    const p = spawn('npm', ['run', 'build'], { cwd, shell: false });
    let all = '';
    p.stdout.on('data', (d) => (all += d.toString()));
    p.stderr.on('data', (d) => (all += d.toString()));
    p.on('close', () => resolve(all));
  });
  await fs.writeFile(logPath, out, 'utf8');
  console.log('🏗  next build completato. Log -> build-output.log');
  const failed = /Failed to compile/i.test(out);
  if (failed) {
    console.log('❌ Build con errori (controlla il log).');
  } else {
    console.log('✅ Build OK.');
  }
}

// ---------- Main ----------
async function main() {
  await loadDotEnv();
  const args = parseArgs();

  const SHEET_ID = args.sheetId || process.env.SHEET_ID;
  const SHEET_NAME = args.sheetName || process.env.SHEET_NAME || 'calculators';
  const OUT_DIR = path.resolve(cwd, args.out || 'components/calculators');

  if (!SHEET_ID) {
    console.error('❌ SHEET_ID mancante. Passa --sheetId o definiscilo in .env');
    process.exit(1);
  }

  // prompt range righe
  let fromRow = args.from ? Number(args.from) : NaN;
  let toRow = args.to ? Number(args.to) : NaN;

  if (!Number.isInteger(fromRow) || !Number.isInteger(toRow) || fromRow <= 0 || toRow <= 0 || toRow < fromRow) {
    const rl = readline.createInterface({ input, output });
    console.log('📄 Specifica range righe da processare (intestazione è riga 1):');
    const ansFrom = await rl.question('  Da riga (es. 2): ');
    const ansTo = await rl.question('  A riga (es. 50): ');
    rl.close();
    fromRow = Number(ansFrom);
    toRow = Number(ansTo);
    if (!Number.isInteger(fromRow) || !Number.isInteger(toRow) || fromRow <= 0 || toRow <= 0 || toRow < fromRow) {
      console.error('❌ Range non valido.');
      process.exit(1);
    }
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log(`▶️  Automazione
   sheet:      ${SHEET_NAME} (${SHEET_ID})
   range:      ${fromRow}..${toRow}
   out:        ${OUT_DIR}
  `);

  const { headers, rows } = await fetchSheetRows(SHEET_ID, SHEET_NAME);

  // filtra range (escludendo header = riga 1)
  const startIdx = fromRow - 1; // 1-based -> 0-based
  const endIdx = toRow - 1;
  const selected = rows.slice(startIdx, endIdx + 1);

  const manifest = [];
  const failed = [];

  for (let i = 0; i < selected.length; i++) {
    const row = selected[i];
    const absoluteRow = startIdx + i + 1; // 1-based
    const check = validateSpec(row, absoluteRow);
    if (!check.ok) {
      console.warn(`⛔️ Skip riga ${absoluteRow}: ${check.reason}`);
      failed.push({ row: absoluteRow, reason: check.reason });
      continue;
    }
    const spec = check.spec;

    try {
      const { fileName, code } = generateComponentTSX(spec);
      const outPath = path.join(OUT_DIR, fileName);

      // Quick sanity: evita doppio 'use client' e caratteri invisibili
      const cleaned = code.replace(/^\uFEFF/, '').replace(/(['"])use client\1;\s*(['"])use client\2;/, `'use client';`);

      await fs.writeFile(outPath, cleaned, 'utf8');
      manifest.push(outPath);
      console.log(`   ✅ ${path.relative(cwd, outPath)}`);
    } catch (e) {
      console.warn(`   ❌ Generazione fallita riga ${absoluteRow}: ${e.message}`);
      failed.push({ row: absoluteRow, reason: e.message });
    }
  }

  // salva report minimale
  const reportPath = path.join(cwd, '.gen_tmp');
  await fs.mkdir(reportPath, { recursive: true });
  await fs.writeFile(path.join(reportPath, 'manifest.json'), JSON.stringify({ generated: manifest, failed }, null, 2));

  console.log(`\n📄 Manifest: ${path.join(reportPath, 'manifest.json')}`);
  console.log(`📈 Generati: ${manifest.length}  ❌ Falliti: ${failed.length}`);

  if (manifest.length === 0) {
    console.log('Nessun file generato: stop.');
    process.exit(0);
  }

  // Pass fixing opzionali
  await runFixTSXIfPresent(OUT_DIR, manifest);

  // ESLint --fix
  try {
    await runESLintFixOn(manifest);
  } catch {}

  // Build finale
  await runNextBuild();
}

main().catch((err) => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
