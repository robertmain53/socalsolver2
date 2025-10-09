'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Tipi / helper ---
type CalculatorInput = {
  id: string;
  label: string;
  type: 'number' | 'select';
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip: string;
};
type States = { [key: string]: number | string };

const euro = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);
const toNum = (v: string | number, fallback = 0) => {
  if (v === '' || v === null || v === undefined) return fallback;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const clamp = (n: number, min?: number, max?: number) => {
  if (typeof min === 'number' && n < min) return min;
  if (typeof max === 'number' && n > max) return max;
  return n;
};

// --- Dati configurazione ---
const calculatorData = {
  slug: 'calculadora-fiscalidad-crowdlending',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Fiscalidad de Crowdlending',
  lang: 'es',
  description:
    'Calcula el impuesto (IRPF) sobre tus ganancias de crowdlending en España. Incluye retenciones, compensación de pérdidas y otras rentas del ahorro.',
  inputs: [
    { id: 'ingresos_brutos', label: 'Ingresos Brutos por Crowdlending', type: 'number' as const, unit: '€', min: 0, step: 100, tooltip: 'Intereses ganados durante el año fiscal (antes de retenciones).' },
    { id: 'retenciones_soportadas', label: 'Retenciones Soportadas', type: 'number' as const, unit: '€', min: 0, step: 10, tooltip: 'Importe ya ingresado a Hacienda por la plataforma (normalmente 19%).' },
    { id: 'otros_rendimientos_ahorro', label: 'Otras Rentas del Ahorro', type: 'number' as const, unit: '€', min: 0, step: 100, tooltip: 'Intereses de depósitos, dividendos, etc. (positivos).' },
    { id: 'perdidas_a_compensar', label: 'Pérdidas Patrimoniales a Compensar', type: 'number' as const, unit: '€', min: 0, step: 100, tooltip: 'Pérdidas compensables (venta de activos). Límite: 25% de rendimientos positivos.' }
  ],
  outputs: [
    { id: 'base_imponible_ahorro', label: 'Base Imponible del Ahorro', unit: '€' },
    { id: 'impuesto_total', label: 'Cuota Íntegra (Impuesto Total)', unit: '€' },
    { id: 'resultado_declaracion', label: 'Resultado de la Declaración', unit: '€' },
    { id: 'ingresos_netos_finales', label: 'Ingresos Netos (Tras Impuestos)', unit: '€' }
  ],
  content: `### Introducción: Entiende la Fiscalidad de tu Inversión

El crowdlending es popular, pero los intereses **tributan** en IRPF (base del ahorro). Esta calculadora estima tu impuesto considerando retenciones, otras rentas y **compensación de pérdidas** (límite 25%).

### Guía de Uso
* **Ingresos Brutos**: Intereses antes de retenciones.
* **Retenciones**: Pagos a cuenta (p.ej. 19% en España).
* **Otras Rentas del Ahorro**: Intereses de depósitos, dividendos, etc.
* **Pérdidas a Compensar**: Pérdidas patrimoniales compensables (límite 25% de rendimientos positivos).

### Metodología (resumen)
1. **Integración y compensación**: (Ingresos + Otras rentas) − min(Pérdidas, 25% de rendimientos positivos).
2. **Escala ahorros** 2024/2025:
   - 0–6.000 € → 19%
   - 6.000–50.000 € → 21%
   - 50.000–200.000 € → 23%
   - 200.000–300.000 € → 27%
   - >300.000 € → 28%
3. **Resultado**: Cuota íntegra − retenciones.
`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿En qué casilla se declaran los ingresos de crowdlending?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "En 'Rendimientos del capital mobiliario' del Modelo 100 (IRPF)."
        }
      },
      {
        '@type': 'Question',
        name: '¿Puedo deducir gastos de plataforma?',
        acceptedAnswer: { '@type': 'Answer', text: 'Para persona física, no: los ingresos brutos se integran en la base.' }
      },
      {
        '@type': 'Question',
        name: '¿Qué pasa con impagos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pueden ser pérdida patrimonial si se acredita (plazos y documentación).'
        }
      }
    ]
  }
};

// --- Markdown minimale (senza dipendenze) ---
function simpleMarkdownToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  let inList = false;
  const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };
  for (const raw of lines) {
    if (/^\s*[-*]\s+/.test(raw)) {
      if (!inList) { html += '<ul class="list-disc pl-5 space-y-2 mb-4">'; inList = true; }
      const item = esc(raw.replace(/^\s*[-*]\s+/, ''))
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100">$1</code>');
      html += `<li>${item}</li>`;
      continue;
    } else closeList();

    const h3 = raw.match(/^\s*###\s+(.*)$/);
    const h2 = raw.match(/^\s*##\s+(.*)$/);
    const h1 = raw.match(/^\s*#\s+(.*)$/);
    if (h3) { html += `<h3 class="text-xl font-bold mt-6 mb-4 text-gray-800">${esc(h3[1])}</h3>`; continue; }
    if (h2) { html += `<h2 class="text-2xl font-bold mt-6 mb-4 text-gray-800">${esc(h2[1])}</h2>`; continue; }
    if (h1) { html += `<h1 class="text-3xl font-bold mt-6 mb-4 text-gray-800">${esc(h1[1])}</h1>`; continue; }
    if (raw.trim() === '') continue;

    let p = esc(raw).replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100">$1</code>');
    html += `<p class="mb-4 leading-relaxed">${p}</p>`;
  }
  closeList();
  return html;
}

const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// --- Grafico (solo client) ---
const DynamicPieChart: React.ComponentType<any> = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { PieChart, Pie, Cell, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod as any;
      const COLORS = ['#16a34a', '#ef4444']; // verde = neto, rojo = impuestos
      const ChartComponent = (props: any) => (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie {...props}>
              {(props.data || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <ChartTooltip formatter={(value: number) => euro(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
      return ChartComponent as any;
    }),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Cargando gráfico...</div>
  }
);

// --- Componente ---
const CalculadoraFiscalidadCrowdlending: React.FC = () => {
  const { slug, title, description, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates: States = {
    ingresos_brutos: 2500,
    retenciones_soportadas: 475,
    otros_rendimientos_ahorro: 500,
    perdidas_a_compensar: 200
  };
  const [states, setStates] = useState<States>(initialStates);

  const getInputCfg = (id: string) => (inputs as CalculatorInput[]).find(i => i.id === id);
  const handleStateChange = (id: string, value: number | string) => {
    const cfg = getInputCfg(id);
    if (value === '') { setStates(prev => ({ ...prev, [id]: '' })); return; }
    const num = toNum(value);
    setStates(prev => ({ ...prev, [id]: clamp(num, cfg?.min, cfg?.max) }));
  };
  const handleReset = () => setStates(initialStates);

  // IRPF ahorro: tramos progresivos
  const cuotaAhorro = (base: number) => {
    const brackets = [
      { upTo: 6000, rate: 0.19 },
      { upTo: 50000, rate: 0.21 },
      { upTo: 200000, rate: 0.23 },
      { upTo: 300000, rate: 0.27 },
      { upTo: Infinity, rate: 0.28 }
    ];
    let remaining = Math.max(0, base);
    let last = 0;
    let tax = 0;
    for (const b of brackets) {
      const span = Math.min(remaining, b.upTo - last);
      if (span <= 0) { last = b.upTo; continue; }
      tax += span * b.rate;
      remaining -= span;
      last = b.upTo;
      if (remaining <= 0) break;
    }
    return tax;
  };

  const calculationResults = useMemo(() => {
    const ingresos_brutos = toNum(states.ingresos_brutos, 0);
    const retenciones_soportadas = toNum(states.retenciones_soportadas, 0);
    const otras = toNum(states.otros_rendimientos_ahorro, 0);
    const perdidas = toNum(states.perdidas_a_compensar, 0);

    const rendimientosPositivos = Math.max(0, ingresos_brutos + otras);
    const limiteComp = rendimientosPositivos * 0.25;
    const perdidasAplicadas = Math.min(perdidas, limiteComp);
    const base_imponible_ahorro = Math.max(0, rendimientosPositivos - perdidasAplicadas);

    const impuesto_total = cuotaAhorro(base_imponible_ahorro);
    const resultado_declaracion = impuesto_total - retenciones_soportadas;

    const tipoEfectivo = base_imponible_ahorro > 0 ? impuesto_total / base_imponible_ahorro : 0;
    const share = rendimientosPositivos > 0 ? ingresos_brutos / rendimientosPositivos : 0;
    const baseCrowdlendingNeta = Math.max(0, ingresos_brutos - perdidasAplicadas * share);
    const impuestoCrowdlending = baseCrowdlendingNeta * tipoEfectivo;

    const ingresos_netos_finales = Math.max(0, ingresos_brutos - impuestoCrowdlending);

    return {
      summary: {
        base_imponible_ahorro: Number(base_imponible_ahorro.toFixed(2)),
        impuesto_total: Number(impuesto_total.toFixed(2)),
        resultado_declaracion: Number(resultado_declaracion.toFixed(2)),
        ingresos_netos_finales: Number(ingresos_netos_finales.toFixed(2))
      },
      pieData: [
        { name: 'Ingreso Neto', value: Number(ingresos_netos_finales.toFixed(2)) },
        { name: 'Impuestos', value: Number(impuestoCrowdlending.toFixed(2)) }
      ]
    };
  }, [states]);

  return (
    <>
      <SeoSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
              {(calculatorData.inputs as CalculatorInput[]).map(input => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={input.id}>
                    {input.label}
                  </label>
                  <div className="relative">
                    <input
                      id={input.id}
                      aria-label={input.label}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pr-12"
                      type="number"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={states[input.id] as number | string}
                      onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 pointer-events-none">
                      {input.unit}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{input.tooltip}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados Fiscales</h2>
                {calculatorData.outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${
                      output.id === 'resultado_declaracion' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-700">{output.label}</div>
                    <div
                      className={`text-lg font-bold ${
                        output.id === 'resultado_declaracion'
                          ? (calculationResults.summary.resultado_declaracion >= 0 ? 'text-red-600' : 'text-green-600')
                          : 'text-gray-800'
                      }`}
                    >
                      {isClient ? euro((calculationResults.summary as any)[output.id]) : '...'}
                    </div>
                  </div>
                ))}
                {isClient && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    {calculationResults.summary.resultado_declaracion >= 0
                      ? 'Resultado a pagar en la declaración.'
                      : 'Resultado a devolver en la declaración.'}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Desglose de Ingresos Brutos</h3>
                <div className="h-56 w-full">
                  {isClient && (
                    <DynamicPieChart
                      data={calculationResults.pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button
                onClick={() => {
                  try {
                    const payload = { slug: calculatorData.slug, title: calculatorData.title, inputs: states, outputs: calculationResults.summary, ts: Date.now() };
                    const prev = JSON.parse(localStorage.getItem('calc_results') || '[]');
                    localStorage.setItem('calc_results', JSON.stringify([payload, ...prev].slice(0, 10)));
                    alert('Resultado guardado en el navegador.');
                  } catch { alert('No se pudo guardar el resultado.'); }
                }}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={async () => {
                  try {
                    const html2canvas = (await import('html2canvas')).default;
                    const jsPDF = (await import('jspdf')).default;
                    if (!calculatorRef.current) return;
                    const canvas = await html2canvas(calculatorRef.current, { scale: 2, backgroundColor: '#ffffff' });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`${calculatorData.slug}.pdf`);
                  } catch { alert('Error al generar el PDF.'); }
                }}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border border-transparent bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Análisis Fiscal</h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(calculatorData.content) }}
            />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023.html"
                  target="_blank" rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Manual práctico de Renta
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764"
                  target="_blank" rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 35/2006 del IRPF
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraFiscalidadCrowdlending;
