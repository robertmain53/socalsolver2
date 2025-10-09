'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// ---------- Config ----------
const calculatorData = {
  slug: 'calculadora-tir',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la Tasa Interna de Retorno (TIR) de una inversión',
  lang: 'es',
  description:
    'Calcula la TIR y el VAN de un proyecto de inversión con flujos de caja dinámicos para evaluar su rentabilidad de forma precisa.',
  inputs: [
    { id: 'tasaDescuento', label: 'Tasa de Descuento (opcional)', type: 'range' as const, unit: '%', min: 0, max: 25, step: 0.5, tooltip: 'Introduce tu WACC o coste de oportunidad.' },
    { id: 'flujosCaja', label: 'Flujos de Caja (€)', type: 'dynamic_list' as const, tooltip: 'Año 0 negativo (inversión); los siguientes pueden ser ±.' }
  ],
  outputs: [
    { id: 'tir', label: 'Tasa Interna de Retorno (TIR)', unit: '%' },
    { id: 'van', label: 'Valor Actual Neto (VAN)', unit: '€' },
    { id: 'decision', label: 'Decisión Sugerida', unit: '' }
  ],
  content: `### Introducción
... (tu testo di contenuto originale) ...`,
  seoSchema: { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ /* ... */ ] }
};

// ---------- Helpers ----------
const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

const countSignChanges = (arr: number[]) => {
  let prev: number | null = null;
  let changes = 0;
  for (const x of arr) {
    if (x === 0) continue;
    if (prev !== null && Math.sign(x) !== Math.sign(prev)) changes++;
    prev = x;
  }
  return changes;
};

// NPV con tasso in DECIMALE (0.1 = 10%)
const npvDecimal = (rate: number, cashFlows: number[]) =>
  cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);

// IRR robusta: bracketing + bisezione (+ rifinitura Newton)
function irrRobusta(cashFlows: number[], opts?: { maxIter?: number; tol?: number }): number | null {
  const maxIter = opts?.maxIter ?? 200;
  const tol = opts?.tol ?? 1e-7;

  if (cashFlows.length < 2) return null;
  if (!(cashFlows[0] < 0)) return null;                 // investimento iniziale deve essere negativo
  if (!cashFlows.slice(1).some(v => v > 0)) return null; // serve almeno un flusso positivo

  // prova a trovare un intervallo [lo, hi] con cambio di segno del VAN
  let lo = -0.9999; // non può essere <= -1
  let hi = 0.1;     // 10% iniziale
  let fLo = npvDecimal(lo, cashFlows);
  let fHi = npvDecimal(hi, cashFlows);

  let expandCount = 0;
  while (fLo * fHi > 0 && hi < 1000 && expandCount < 60) {
    hi *= 1.8; // espansione graduale
    fHi = npvDecimal(hi, cashFlows);
    expandCount++;
  }
  if (fLo * fHi > 0) return null; // non brackettabile → possibili IRR multiple o nessuna reale

  // bisezione
  let mid = 0;
  for (let i = 0; i < maxIter; i++) {
    mid = (lo + hi) / 2;
    const fMid = npvDecimal(mid, cashFlows);
    if (Math.abs(fMid) < tol) break;
    if (fLo * fMid < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }

  // rifinitura Newton (pochi passi)
  let x = mid;
  for (let i = 0; i < 8; i++) {
    const f = npvDecimal(x, cashFlows);
    if (Math.abs(f) < tol) break;
    // derivata: d/dx Σ cf_t (1+x)^(-t) = Σ -t*cf_t (1+x)^(-t-1)
    let df = 0;
    for (let t = 1; t < cashFlows.length; t++) {
      df += -t * cashFlows[t] / Math.pow(1 + x, t + 1);
    }
    if (!Number.isFinite(df) || Math.abs(df) < 1e-12) break;
    const x1 = x - f / df;
    if (!Number.isFinite(x1)) break;
    if (Math.abs(x1 - x) < tol) { x = x1; break; }
    x = x1;
  }

  if (!Number.isFinite(x)) return null;
  return x * 100; // restituiamo in %
}

// ---------- Dynamic Chart (client-only) ----------
const DynamicBarChart = dynamic(
  () => import('recharts').then((mod) => {
    const {
      BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip,
      ResponsiveContainer, Legend, CartesianGrid, Cell, ReferenceLine
    } = mod as any;

    const ChartComponent = ({ data }: { data: any[] }) => (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v: number) => `€${Number(v / 1000).toFixed(0)}k`} />
          <ChartTooltip formatter={(v: number) => formatCurrency(v)} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
          <Legend />
          <Bar dataKey="value" name="Flujo de Caja">
            {data.map((d, i) => (
              <Cell key={i} fill={d.value < 0 ? '#ef4444' : '#22c55e'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );

    return ChartComponent;
  }),
  { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-lg">Cargando gráfico...</div> }
);

// ---------- Lightweight content renderer ----------
const ContentRenderer = ({ content }: { content: string }) => {
  const fmt = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
     .replace(/_(.*?)_/g, '<em>$1</em>')
     .replace(/`([^`]+)`/g, '<code class="text-sm bg-gray-100 p-1 rounded">$1</code>');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, i) => {
        const s = block.trim();
        if (!s) return null;
        if (s.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: fmt(s.slice(4)) }} />;
        if (s.startsWith('* ')) return <ul key={i} className="list-disc pl-5 space-y-2 mb-4">{s.split('\n').map((li, j) => <li key={j} dangerouslySetInnerHTML={{ __html: fmt(li.replace(/^\*\s*/, '')) }} />)}</ul>;
        if (/^\d\.\s/.test(s)) return <ol key={i} className="list-decimal pl-5 space-y-2 mb-4">{s.split('\n').map((li, j) => <li key={j} dangerouslySetInnerHTML={{ __html: fmt(li.replace(/^\d\.\s*/, '')) }} />)}</ol>;
        return <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: fmt(s) }} />;
      })}
    </div>
  );
};
const FaqSchema = () => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />);

// ---------- Main ----------
const CalculadoraTir: React.FC = () => {
  const { slug, title, description, content } = calculatorData;
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const [tasaDescuento, setTasaDescuento] = useState<number>(10);
  const [cashFlows, setCashFlows] = useState<(number | string)[]>([-50000, 15000, 20000, 25000, 15000]);

  const handleCashFlowChange = (index: number, value: string) => {
    const next = [...cashFlows];
    next[index] = value;
    setCashFlows(next);
  };
  const addCashFlow = () => setCashFlows((cf) => [...cf, '']);
  const removeCashFlow = (index: number) => {
    if (cashFlows.length > 2) setCashFlows(cashFlows.filter((_, i) => i !== index));
  };
  const handleReset = () => {
    setTasaDescuento(10);
    setCashFlows([-50000, 15000, 20000, 25000, 15000]);
  };

  const numericCashFlows = useMemo(
    () => cashFlows.map((cf) => (cf === '' ? 0 : Number(cf) || 0)),
    [cashFlows]
  );

  const { tir, van, decision, multiIrrWarning } = useMemo(() => {
    const tirPct = irrRobusta(numericCashFlows);                     // % o null
    const vanVal = npvDecimal(tasaDescuento / 100, numericCashFlows); // VAN in €
    const changes = countSignChanges(numericCashFlows);
    const multi = changes > 1;

    let dec = 'Introduce datos para evaluar';
    if (isClient) {
      if (tirPct === null) {
        dec = 'No se puede calcular la TIR (revisa los flujos / posibles múltiples TIR).';
      } else {
        dec = tirPct > tasaDescuento
          ? `Aceptar. La TIR (${tirPct.toFixed(2)}%) es mayor que la Tasa de Descuento (${tasaDescuento}%).`
          : `Rechazar. La TIR (${tirPct.toFixed(2)}%) es menor que la Tasa de Descuento (${tasaDescuento}%).`;
      }
    }
    return { tir: tirPct, van: vanVal, decision: dec, multiIrrWarning: multi };
  }, [numericCashFlows, tasaDescuento, isClient]);

  const chartData = numericCashFlows.map((v, i) => ({ name: `Año ${i}`, value: v }));

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="bg-slate-50 p-6 rounded-lg space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center justify-between">
                  <span className='flex items-center'>
                    Tasa de Descuento
                    <span title="Introduce tu WACC o coste de oportunidad." className="ml-2 inline-flex"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>
                  </span>
                  <span className='font-bold text-indigo-600'>{tasaDescuento.toFixed(1)} %</span>
                </label>
                <input
                  type="range" min={0} max={25} step={0.5}
                  value={tasaDescuento}
                  onChange={e => setTasaDescuento(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Flujos de Caja</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cashFlows.map((flow, index) => (
                    <div key={index} className="relative">
                      <span className="absolute -left-1 -top-1.5 text-xs font-semibold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">{index}</span>
                      <input
                        type="number" step="100"
                        value={flow}
                        onChange={e => handleCashFlowChange(index, e.target.value)}
                        className={`w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-8 pr-2 py-2 ${index > 0 && cashFlows.length > 2 ? 'pr-8' : ''}`}
                        placeholder={`Año ${index}`}
                      />
                      {index > 0 && cashFlows.length > 2 && (
                        <button onClick={() => removeCashFlow(index)} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1" aria-label="Eliminar flujo">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addCashFlow} className="mt-4 w-full text-sm border-2 border-dashed border-gray-300 text-gray-500 rounded-md px-3 py-2 hover:bg-gray-100 hover:border-gray-400 transition-colors">
                  + Añadir Periodo
                </button>
                {isClient && countSignChanges(numericCashFlows) > 1 && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded mt-3 p-2">
                    Aviso: hay múltiples cambios de signo en los flujos; pueden existir **varias TIR**. Prioriza el VAN para la decisión.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del Análisis</h2>
              <div className="bg-indigo-50 border-indigo-500 border-l-4 p-4 rounded-r-lg">
                <div className="text-sm font-medium text-indigo-800">Tasa Interna de Retorno (TIR)</div>
                <div className="text-2xl md:text-3xl font-bold text-indigo-600 mt-1">
                  {isClient ? (tir !== null ? `${tir.toFixed(2)} %` : 'Inválida') : '...'}
                </div>
              </div>
              <div className="bg-gray-50 border-gray-300 border-l-4 p-4 rounded-r-lg">
                <div className="text-sm font-medium text-gray-600">Valor Actual Neto (VAN)</div>
                <div className="text-xl font-bold text-gray-800 mt-1">{isClient ? formatCurrency(van) : '...'}</div>
              </div>
              <div className={`p-4 rounded-lg ${van > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className={`text-sm font-medium ${van > 0 ? 'text-emerald-800' : 'text-red-800'}`}>Decisión Sugerida</div>
                <div className={`text-base font-semibold ${van > 0 ? 'text-emerald-700' : 'text-red-700'} mt-1`}>
                  {isClient ? decision : '...'}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Visualización de Flujos de Caja</h3>
              {isClient && <DynamicBarChart data={chartData} />}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Análisis y Metodología</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.investopedia.com/terms/i/irr.asp" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Investopedia: Internal Rate of Return (IRR)</a></li>
              <li><a href="https://www.icjce.es/" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Instituto de Censores Jurados de Cuentas de España</a></li>
            </ul>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <button onClick={handleReset} className="w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Resetear</button>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraTir;
