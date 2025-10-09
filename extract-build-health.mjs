// codegen.mjs
// Genera componenti TSX 2-colonne "client" conformi, con testo JSX wrappato in {"..."}, lazy PDF import,
// salvataggio localStorage e validazioni base. ESM.

import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';

const SPEC_DIR = process.env.SPEC_DIR || 'specs';
const OUT_DIR  = process.env.OUT_DIR  || 'components/calculators';

const sanitizeIdentifier = (raw) => {
  const base = raw.replace(/\.[tj]sx?$/i, '');
  let cleaned = base
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  if (!cleaned.endsWith('Calculator')) cleaned += 'Calculator';
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(cleaned)) cleaned = 'Calculator' + cleaned.replace(/[^A-Za-z0-9_]/g, '');
  return cleaned;
};

const fileNameForSpec = (spec) => {
  // priorità: spec.componentName | spec.slug | "Row{rowIndex}Calculator"
  const hint = spec.componentName || spec.slug || `Row${spec.rowIndex || ''}Calculator`;
  return sanitizeIdentifier(hint) + '.tsx';
};

const safeJsxText = (s = '') => {
  // niente entità HTML: usiamo {"..."}; escapiamo \ e "
  return `{"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"}`;
};

const i18n = (lang, en, it, fr, es, de) => {
  const map = { en, it, fr, es, de };
  return map[lang] || en;
};

const calcStateInit = (inputs=[]) => {
  // crea un oggetto iniziale con valori vuoti
  const pairs = inputs.map(inp => `${inp.name}: ${typeof inp.default === 'number' ? inp.default : (inp.default ? JSON.stringify(inp.default) : "''")}`);
  return `{\n    ${pairs.join(',\n    ')}\n  }`;
};

const inputControl = (inp, lang) => {
  const label = safeJsxText(inp.label?.[lang] || inp.label?.en || inp.name);
  const help  = inp.helpText ? `<p className="text-sm text-gray-500 mt-1">${safeJsxText(inp.helpText?.[lang] || inp.helpText?.en || '')}</p>` : '';
  const min   = Number.isFinite(inp.min) ? ` min="${inp.min}"` : '';
  const step  = Number.isFinite(inp.step) ? ` step="${inp.step}"` : '';
  const type  = inp.type === 'select'
    ? 'select'
    : (inp.type === 'number' ? 'number' : 'text');
  const commonProps = `id="${inp.name}" name="${inp.name}" aria-label="${inp.name}"`;
  if (type === 'select') {
    const opts = (inp.options || []).map(o =>
      `<option value="${o.value}">${safeJsxText(o.label?.[lang] || o.label?.en || String(o.value))}</option>`
    ).join('\n                ');
    return `
            <label htmlFor="${inp.name}" className="block text-sm font-medium text-gray-700">${label}</label>
            <select ${commonProps} className="mt-1 block w-full rounded border p-2"
                    value={String(input.${inp.name} ?? '')}
                    onChange={(e) => setInput(i => ({ ...i, ${inp.name}: e.target.value }))}>
              ${opts}
            </select>
            ${help}`;
  }
  // number/text
  return `
            <label htmlFor="${inp.name}" className="block text-sm font-medium text-gray-700">${label}</label>
            <input ${commonProps} type="${type}"${min}${step}
                   className={"mt-1 block w-full rounded border p-2 " + (errors.${inp.name} ? "border-red-500" : "border-gray-300")}
                   value={String(input.${inp.name} ?? '')}
                   onChange={(e) => setInput(i => ({ ...i, ${inp.name}: ${type === 'number' ? 'Number(e.target.value)' : 'e.target.value'} }))} />
            {errors.${inp.name} ? <p className="text-sm text-red-600 mt-1">{errors.${inp.name}}</p> : null}
            ${help}`;
};

const buildComponent = (spec) => {
  const compName = sanitizeIdentifier(spec.componentName || spec.slug || `Row${spec.rowIndex || ''}Calculator`);
  const lang = (spec.lang || 'en').toLowerCase();
  const title = safeJsxText(spec.title?.[lang] || spec.title?.en || compName);
  const descr = safeJsxText(spec.description?.[lang] || spec.description?.en || '');

  const inputs = spec.inputs || [];
  const outputs = spec.outputs || [];

  const inputsUI = inputs.map(i => `<div>${inputControl(i, lang)}</div>`).join('\n          ');
  const outputsUI = outputs.map(o => {
    const label = safeJsxText(o.label?.[lang] || o.label?.en || o.name);
    return `
            <div className="flex justify-between">
              <span>${label}</span>
              <strong>{results.${o.name} ?? '-'}</strong>
            </div>`;
  }).join('\n          ');

  const calcBody = spec.formula?.js || 'return {};'; // mini-DSL JS fornita dallo spec (NO eval su stringhe utente altrove)
  const validateBody = spec.validation?.js || 'return {};';

  const stepsExplained = safeJsxText((spec.formulaStepsText?.[lang] || spec.formulaStepsText?.en || '').trim());

  return `'use client';
import { useState, useRef, useMemo, useCallback } from 'react';

export default function ${compName}() {
  const [input, setInput] = useState(() => (${calcStateInit(inputs)}));
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState({});

  const calcRef = useRef(null);

  const validate = useCallback((i) => {
    // deve restituire mappa { field: "errore" }
${validateBody.startsWith('return') ? '    ' + validateBody : '    ' + 'return (function(){ ' + validateBody + ' })();'}
  }, []);

  const compute = useCallback((i) => {
    // deve restituire { outputName: value, ... }
${calcBody.startsWith('return') ? '    ' + calcBody : '    ' + 'return (function(){ ' + calcBody + ' })();'}
  }, []);

  const handleCalculate = useCallback(() => {
    const e = validate(input);
    setErrors(e || {});
    if (e && Object.keys(e).length > 0) return;
    const r = compute(input);
    setResults(r || {});
  }, [input, validate, compute]);

  const handleSave = useCallback(() => {
    try {
      const key = '${compName}-results';
      const item = { input, results, ts: Date.now() };
      localStorage.setItem(key, JSON.stringify(item));
      alert(${safeJsxText(i18n(lang, 'Saved locally.', 'Salvato in locale.', 'Enregistré localement.', 'Guardado localmente.', 'Lokal gespeichert.'))});
    } catch {}
  }, [input, results]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (calcRef.current) {
        const canvas = await html2canvas(calcRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const ratio = Math.min(pageWidth / canvas.width, 1);
        pdf.addImage(imgData, 'PNG', 20, 20, canvas.width * ratio, canvas.height * ratio);
        pdf.save('${compName}.pdf');
      }
    } catch {
      alert(${safeJsxText(i18n(lang, 'PDF not available in this environment', 'PDF non disponibile in questo ambiente', 'PDF non disponible dans cet environnement', 'PDF no disponible en este entorno', 'PDF in dieser Umgebung nicht verfügbar'))});
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <div ref={calcRef} className="lg:col-span-2 p-6 border rounded shadow bg-white">
        <h1 className="text-2xl font-bold mb-2">${title}</h1>
        <p className="text-gray-600 mb-6">${descr}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          ${inputsUI}
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleCalculate}
            aria-label="calculate"
          >${safeJsxText(i18n(lang, 'Calculate', 'Calcola', 'Calculer', 'Calcular', 'Berechnen'))}</button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-3">${safeJsxText(i18n(lang, 'Results', 'Risultati', 'Résultats', 'Resultados', 'Ergebnisse'))}</h2>
          <div className="space-y-2">
          ${outputsUI}
          </div>
        </div>
      </div>

      <aside className="lg:col-span-1 space-y-4">
        <details className="border rounded p-4">
          <summary className="cursor-pointer font-medium">${safeJsxText(i18n(lang, 'Step-by-step analysis', 'Analisi passo-passo', 'Analyse étape par étape', 'Análisis paso a paso', 'Schritt-für-Schritt-Analyse'))}</summary>
          <div className="mt-2 text-sm text-gray-700">
            ${stepsExplained}
          </div>
        </details>

        <div className="border rounded p-4 space-y-3">
          <button type="button" className="w-full px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>
            ${safeJsxText(i18n(lang, 'Save result', 'Salva risultato', 'Enregistrer le résultat', 'Guardar resultado', 'Ergebnis speichern'))}
          </button>
          <button type="button" className="w-full px-3 py-2 rounded bg-slate-700 hover:bg-slate-800 text-white" onClick={handleExportPDF}>
            ${safeJsxText(i18n(lang, 'Export PDF', 'Esporta PDF', 'Exporter en PDF', 'Exportar PDF', 'PDF exportieren'))}
          </button>
        </div>
      </aside>
    </div>
  );
}
`;
};

const main = async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = await globby([path.join(SPEC_DIR, '*.json')]);

  const written = [];
  for (const f of files) {
    const spec = JSON.parse(await fs.readFile(f, 'utf8'));
    const outName = fileNameForSpec(spec);
    const outPath = path.join(OUT_DIR, outName);

    const code = buildComponent(spec);

    // scrivi UTF-8 senza BOM
    await fs.writeFile(outPath, code, 'utf8');
    written.push(outPath);
    console.log(`   ✅ ${outPath}`);
  }

  // manifest
  await fs.mkdir('.gen_tmp', { recursive: true });
  await fs.writeFile('.gen_tmp/manifest.txt', written.join('\n') + '\n', 'utf8');
  console.log(`\n📄 Manifest: ${path.resolve('.gen_tmp/manifest.txt')}`);
  console.log(`📈 Generati: ${written.length}`);
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
