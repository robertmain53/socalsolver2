// codegen.mjs
// Generatore TSX robusto da SPEC normalizzate (spec.schema.mjs).
// Correzioni chiave:
//  - NO variabili con trattini: toIdentifier() -> snake_case valido
//  - Output unit: NIENTE costrutti tipo {0}{ + " €"}. Usiamo <span> separati.
//  - ESM, senza dipendenze extra.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { readAndNormalizeSpec, shouldSkipSpecFile, slugify } from './spec.schema.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = {
    specsDir: 'specs',
    outDir: 'components/calculators',
    concurrency: 4,
    rscAudit: false,
    microLint: false,
    fixTsx: false,
    eslintFix: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--specsDir=')) args.specsDir = a.split('=')[1];
    else if (a.startsWith('--outDir=')) args.outDir = a.split('=')[1];
    else if (a.startsWith('--concurrency=')) args.concurrency = parseInt(a.split('=')[1], 10) || 4;
    else if (a === '--rscAudit') args.rscAudit = true;
    else if (a === '--microLint') args.microLint = true;
    else if (a === '--fixTsx') args.fixTsx = true;
    else if (a === '--eslintFix') args.eslintFix = true;
  }
  return args;
}

function pascalCase(str) {
  return String(str)
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

// ✅ Trasforma nomi input → identificatori JS/TS validi (snake_case)
function toIdentifier(name) {
  let s = String(name || '')
    .trim()
    .replace(/[\s\-\.\/]+/g, '_') // trattini, spazi, punti → _
    .replace(/[^\w]/g, '_');      // tutto ciò che non è [a-zA-Z0-9_]
  if (!s) s = 'val';
  if (/^\d/.test(s)) s = '_' + s; // niente inizio con cifra
  // evita parole chiave comuni
  const reserved = new Set(['default', 'class', 'const', 'var', 'let', 'function', 'import', 'export', 'new', 'return', 'case', 'switch']);
  if (reserved.has(s)) s = s + '_v';
  return s;
}

function setterName(id) {
  return 'set' + id.replace(/^_*/, '').replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

// Evita problemi ESLint con backtick in testo
function jsxText(s) {
  if (!s) return '';
  return String(s).replace(/`/g, '\\`');
}

function buildComponent(spec) {
  const compName = pascalCase(spec.slug || spec.title || 'Calculator');
  const title = jsxText(spec.title);
  const description = jsxText(spec.description);
  const asideAnalysis = spec.formulaSteps?.length
    ? spec.formulaSteps.map((s) => `- ${s}`).join('\\n')
    : '';

  // Prepara mappa input -> identifiers sicuri
  const safeInputs = spec.inputs.map((inp) => {
    const id = toIdentifier(inp.name || inp.label || 'val');
    const setId = setterName(id);
    return { ...inp, __id: id, __set: setId };
  });

  // State iniziali
  const stateInit = safeInputs.map((inp) => {
    let defVal = '""';
    if (typeof inp.default === 'number' || typeof inp.default === 'boolean') defVal = JSON.stringify(inp.default);
    else if (typeof inp.default === 'string') defVal = JSON.stringify(inp.default);
    else if (inp.type === 'select' && Array.isArray(inp.options) && inp.options.length) {
      const first = inp.options[0];
      defVal = JSON.stringify(typeof first === 'object' ? first.value : first);
    } else if (inp.type === 'number') {
      defVal = '0';
    }
    return `  const [${inp.__id}, ${inp.__set}] = useState(${defVal});`;
  }).join('\n');

  // Input controls
  const renderInputs = safeInputs.map((inp) => {
    const htmlId = inp.name || inp.__id;
    const label = jsxText(inp.label || inp.name || inp.__id);
    const min = Number.isFinite(inp.min) ? ` min={${inp.min}}` : '';
    const max = Number.isFinite(inp.max) ? ` max={${inp.max}}` : '';
    const step = Number.isFinite(inp.step) ? ` step={${inp.step}}` : '';
    const unitSpan = inp.unit ? `<span className="text-sm text-gray-500">${'${'}${JSON.stringify(' ' + inp.unit)}${'}'}</span>` : ``;

    if (inp.type === 'select') {
      const options = (inp.options ?? []).map((o, i) => {
        if (typeof o === 'object' && o && 'label' in o) {
          return `<option key="${i}" value={${JSON.stringify(o.value)}}>${'${'}${JSON.stringify(String(o.label))}${'}'}</option>`;
        }
        return `<option key="${i}" value={${JSON.stringify(o)}}>${'${'}${JSON.stringify(String(o))}${'}'}</option>`;
      }).join('\n              ');
      return `
            <label className="block text-sm font-medium mb-1" htmlFor="${htmlId}">${'${'}${JSON.stringify(label)}${'}'}</label>
            <select
              id="${htmlId}"
              aria-label="${label}"
              className="w-full border rounded px-3 py-2"
              value={${inp.__id} as any}
              onChange={(e) => ${inp.__set}(e.target.value)}
            >
              ${options}
            </select>`;
    }

    if (inp.type === 'boolean') {
      return `
            <label className="inline-flex items-center gap-2">
              <input
                id="${htmlId}"
                aria-label="${label}"
                type="checkbox"
                className="h-4 w-4"
                checked={Boolean(${inp.__id})}
                onChange={(e) => ${inp.__set}(e.target.checked)}
              />
              <span>${'${'}${JSON.stringify(label)}${'}'}</span>
            </label>`;
    }

    // number / text
    const typeAttr = inp.type === 'text' ? 'text' : 'number';
    const parseVal = inp.type === 'text'
      ? 'e.target.value'
      : '(e.target.value === "" ? "" : Number(e.target.value))';

    return `
            <label className="block text-sm font-medium mb-1" htmlFor="${htmlId}">${'${'}${JSON.stringify(label)}${'}'}</label>
            <div className="flex items-center gap-2">
              <input
                id="${htmlId}"
                aria-label="${label}"
                className="w-full border rounded px-3 py-2"
                type="${typeAttr}"${min}${max}${step}
                value={${inp.__id} as any}
                onChange={(e) => ${inp.__set}(${parseVal})}
              />
              ${unitSpan}
            </div>`;
  }).join('\n            <hr className="my-3" />\n');

  // Outputs con unità in <span> separato (niente espressioni invalide)
  const renderOutputs = (spec.outputs || []).map((out) => {
    const label = jsxText(out.label || out.name);
    const unit = out.unit ? String(out.unit) : '';
    const unitSpan = unit ? `<span>&nbsp;${unit}</span>` : '';
    return `
            <div className="flex items-baseline justify-between border rounded p-3">
              <div className="text-sm text-gray-600">${'${'}${JSON.stringify(label)}${'}'}</div>
              <div className="text-xl font-semibold">
                <span>{/* TODO: formula */}{0}</span>${unitSpan}
              </div>
            </div>`;
  }).join('\n            ');

  // payload inputs -> mantieni le chiavi originali, valori dalle var sicure
  const payloadInputs = safeInputs.map((i) => `"${i.name}": ${i.__id}`).join(',\n          ');

  const lang = spec.lang || 'it';
  const i18n = {
    tools: lang === 'en' ? 'Tools' : 'Strumenti',
    save: lang === 'en' ? 'Save result' : 'Salva risultato',
    analysis: lang === 'en' ? 'Step-by-step analysis' : 'Analisi passo-passo',
    showhide: lang === 'en' ? 'Show/Hide' : 'Mostra/Nascondi',
  };

  return `'use client';
import React, { useState, useRef, useCallback } from "react";

interface InputSpec {
  name: string;
  label: string;
  type: "number" | "select" | "text" | "boolean";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  options?: Array<string | number | { label: string; value: string | number }>;
  __id?: string;  // interno
  __set?: string; // interno
}

interface OutputSpec {
  name: string;
  label: string;
  unit?: string;
  decimals?: number;
}

interface CalculatorProps {
  titolo?: string;
  descrizione?: string;
  categoria?: string;
  slug?: string;
  lingua?: "it" | "en" | "fr" | "es" | "de";
}

const inputsSpec: InputSpec[] = ${JSON.stringify(safeInputs, null, 2)};
const outputsSpec: OutputSpec[] = ${JSON.stringify(spec.outputs || [], null, 2)};

const ${compName}: React.FC<CalculatorProps> = () => {
  const calcolatoreRef = useRef<HTMLDivElement>(null);

${stateInit}

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calcolatoreRef.current) return;
      const canvas = await html2canvas(calcolatoreRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(imgData, "PNG", (pageWidth - w) / 2, 40, w, h);
      pdf.save(${JSON.stringify(`${spec.slug || 'calculator'}.pdf`)});
    } catch (_e) {
      alert("Funzione PDF non disponibile in questo ambiente");
    }
  }, []);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = {
        slug: ${JSON.stringify(spec.slug)},
        title: ${JSON.stringify(spec.title)},
        inputs: {
          ${payloadInputs}
        },
        outputs: {}, // TODO: valorizza quando avremo il motore di formula
        ts: Date.now(),
      };
      const key = "calc_results";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.unshift(payload);
      localStorage.setItem(key, JSON.stringify(prev.slice(0, 50)));
      alert(${JSON.stringify(lang === 'en' ? 'Saved' : 'Risultato salvato')});
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <div className="lg:col-span-2 border rounded shadow p-6" ref={calcolatoreRef}>
        <h1 className="text-2xl font-bold mb-2">${'${'}${JSON.stringify(title)}${'}'}</h1>
        <p className="text-gray-600 mb-6">${'${'}${JSON.stringify(description)}${'}'}</p>

        <div className="space-y-4">
          ${renderInputs}
        </div>

        <div className="mt-8 space-y-3">
          ${renderOutputs}
        </div>
      </div>

      <aside className="lg:col-span-1 space-y-6">
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">${'${'}${JSON.stringify(i18n.analysis)}${'}'}</h2>
          <details className="text-sm text-gray-700 whitespace-pre-wrap">
            <summary className="cursor-pointer mb-2">${'${'}${JSON.stringify(i18n.showhide)}${'}'}</summary>
            ${'${'}${JSON.stringify(asideAnalysis)}${'}'}
          </details>
        </section>

        <section className="border rounded p-4 space-y-3">
          <h2 className="font-semibold">${'${'}${JSON.stringify(i18n.tools)}${'}'}</h2>
          <button onClick={salvaRisultato} className="w-full border rounded px-3 py-2 hover:bg-gray-50">
            ${'${'}${JSON.stringify(i18n.save)}${'}'}
          </button>
          <button onClick={handleExportPDF} className="w-full border rounded px-3 py-2 hover:bg-gray-50">
            PDF
          </button>
        </section>
      </aside>
    </div>
  );
};

export default ${compName};
`;
}

async function main() {
  const args = parseArgs(process.argv);
  const specsDir = path.resolve(process.cwd(), args.specsDir);
  const outDir = path.resolve(process.cwd(), args.outDir);
  await fs.mkdir(outDir, { recursive: true });

  const files = (await fs.readdir(specsDir)).filter((f) => !shouldSkipSpecFile(f));
  if (files.length === 0) {
    console.log(`ℹ️ Nessuna SPEC valida in ${specsDir}`);
    return;
  }

  let ok = 0, ko = 0;
  const errors = [];

  for (const f of files) {
    const full = path.join(specsDir, f);
    try {
      const spec = await readAndNormalizeSpec(full);
      const comp = buildComponent(spec);
      const compName = pascalCase(spec.slug || spec.title || path.basename(f, '.json'));
      const outFile = path.join(outDir, `${compName}.tsx`);
      await fs.writeFile(outFile, comp, 'utf8');
      ok++;
      console.log(`✅ ${outFile}`);
    } catch (e) {
      ko++;
      errors.push({ file: f, issues: e?._issues ?? [{ error: e?.message || String(e) }] });
      console.error(`❌ ${f}`);
    }
  }

  const tmp = path.join(process.cwd(), '.gen_tmp');
  await fs.mkdir(tmp, { recursive: true });
  await fs.writeFile(path.join(tmp, 'codegen-validate-report.json'), JSON.stringify(errors, null, 2), 'utf8');

  console.log(`\n📈 Generati: ${ok}  ❌ Falliti: ${ko}`);
  if (ko) {
    console.log(`📝 Dettagli: ${path.join('.gen_tmp', 'codegen-validate-report.json')}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
