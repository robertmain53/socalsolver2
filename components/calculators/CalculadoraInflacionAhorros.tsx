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

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  slug: 'calculadora-inflacion-ahorros',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la Inflación sobre tus Ahorros',
  lang: 'es',
  description:
    'Visualiza cómo la inflación erosiona tus ahorros a lo largo del tiempo. Calcula la pérdida de poder adquisitivo y entiende la importancia de invertir.',
  inputs: [
    { id: 'ahorros_iniciales', label: 'Ahorros Iniciales', type: 'number' as const, unit: '€', min: 0, step: 1000, tooltip: 'Ahorros actuales sobre los que simular.' },
    { id: 'aportacion_anual', label: 'Aportación Anual Adicional', type: 'number' as const, unit: '€', min: 0, step: 500, tooltip: 'Ahorro adicional que planeas cada año.' },
    { id: 'anos_periodo', label: 'Periodo a Simular', type: 'number' as const, unit: 'años', min: 1, max: 50, step: 1, tooltip: 'Años de simulación.' },
    { id: 'tasa_inflacion_anual', label: 'Tasa de Inflación Anual (%)', type: 'number' as const, unit: '%', min: -2, max: 20, step: 0.1, tooltip: 'Media esperada de inflación anual.' },
    { id: 'rendimiento_anual_ahorros', label: 'Rendimiento Anual de los Ahorros (%)', type: 'number' as const, unit: '%', min: 0, max: 20, step: 0.1, tooltip: 'Interés nominal anual de tus ahorros/inversiones.' }
  ],
  outputs: [
    { id: 'valor_nominal_futuro', label: 'Valor Nominal Futuro', unit: '€' },
    { id: 'poder_adquisitivo_futuro', label: 'Poder Adquisitivo Futuro (en € de hoy)', unit: '€' },
    { id: 'perdida_poder_adquisitivo', label: 'Pérdida de Poder Adquisitivo', unit: '€' },
    { id: 'rendimiento_real_neto', label: 'Rendimiento Real Neto Anual', unit: '%' }
  ],
  content: `### Introducción: El Impuesto Silencioso que Devora tus Ahorros

La inflación reduce el **poder adquisitivo** de tu dinero. Esta herramienta te ayuda a visualizar su impacto real y a valorar estrategias para **superarla**.

### Guía de Uso
* **Ahorros Iniciales**: punto de partida.
* **Aportación Anual**: ahorro adicional cada año.
* **Periodo (años)**: horizonte temporal.
* **Inflación (%)**: usa objetivo BCE (~2%) o medias históricas.
* **Rendimiento (%)**: interés nominal de tus ahorros/inversiones.

### Metodología de Cálculo
1. **Valor nominal** año a año (aportación al **final** del año, enfoque conservador):
   \`V_n = V_{n-1} * (1 + r) + Aportación\`
2. **Poder adquisitivo (valor real)** deflactando la inflación acumulada:
   \`Real_n = V_n / (1 + i)^n\`
3. **Rendimiento real neto anual**:
   \`(1+r)/(1+i) - 1\`.
`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '¿Qué es el IPC y quién lo calcula en España?', acceptedAnswer: { '@type': 'Answer', text: 'El INE publica el IPC mensualmente.' } },
      { '@type': 'Question', name: '¿Es la inflación siempre mala?', acceptedAnswer: { '@type': 'Answer', text: 'Inflación baja y estable (~2%) suele ser compatible con crecimiento económico.' } },
      { '@type': 'Question', name: '¿Qué es la deflación y por qué es peligrosa?', acceptedAnswer: { '@type': 'Answer', text: 'La caída generalizada de precios puede frenar el consumo e inducir recesión.' } }
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
const DynamicLineChart: React.ComponentType<any> = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod as any;
      const ChartComponent = (props: any) => (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" unit=" año" fontSize={12} />
            <YAxis
              width={80}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value)
              }
              fontSize={12}
            />
            <ChartTooltip formatter={(value: number) => euro(value)} />
            <Legend />
            <Line type="monotone" dataKey="valorNominal" name="Valor Nominal" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="valorReal" name="Poder Adquisitivo Real" stroke="#4f46e5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      );
      return ChartComponent as any;
    }),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Cargando gráfico...</div>
  }
);

// --- Componente Principale ---
const CalculadoraInflacionAhorros: React.FC = () => {
  const { slug, title, description, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates: States = {
    ahorros_iniciales: 20000,
    aportacion_anual: 5000,
    anos_periodo: 15,
    tasa_inflacion_anual: 2.5,
    rendimiento_anual_ahorros: 1
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

  const calculationResults = useMemo(() => {
    const ahorros_iniciales = toNum(states.ahorros_iniciales, 0);
    const aportacion_anual = toNum(states.aportacion_anual, 0);
    const anos_periodo = Math.max(1, Math.floor(toNum(states.anos_periodo, 1)));
    const tasa_inflacion_anual = toNum(states.tasa_inflacion_anual, 0);
    const rendimiento_anual_ahorros = toNum(states.rendimiento_anual_ahorros, 0) / 100;

    let valorNominalActual = ahorros_iniciales;
    const proyeccionAnual: Array<{ ano: number; valorNominal: number; valorReal: number }> = [
      { ano: 0, valorNominal: parseFloat(valorNominalActual.toFixed(2)), valorReal: parseFloat(valorNominalActual.toFixed(2)) }
    ];

    for (let i = 1; i <= anos_periodo; i++) {
      // crecimiento del año
      valorNominalActual = valorNominalActual * (1 + rendimiento_anual_ahorros) + aportacion_anual; // aportación al final del año (conservador)
      const valorRealActual = valorNominalActual / Math.pow(1 + tasa_inflacion_anual / 100, i);
      proyeccionAnual.push({
        ano: i,
        valorNominal: parseFloat(valorNominalActual.toFixed(2)),
        valorReal: parseFloat(valorRealActual.toFixed(2))
      });
    }

    const ultimo = proyeccionAnual[proyeccionAnual.length - 1];
    const valor_nominal_futuro = ultimo.valorNominal;
    const poder_adquisitivo_futuro = ultimo.valorReal;
    const perdida_poder_adquisitivo = valor_nominal_futuro - poder_adquisitivo_futuro;
    const rendimiento_real_neto = ((1 + rendimiento_anual_ahorros) / (1 + tasa_inflacion_anual / 100) - 1) * 100;

    return {
      summary: {
        valor_nominal_futuro: Number(valor_nominal_futuro.toFixed(2)),
        poder_adquisitivo_futuro: Number(poder_adquisitivo_futuro.toFixed(2)),
        perdida_poder_adquisitivo: Number(perdida_poder_adquisitivo.toFixed(2)),
        rendimiento_real_neto: Number(rendimiento_real_neto.toFixed(2))
      },
      chartData: proyeccionAnual
    };
  }, [states]);

  const handleExportPDF = useCallback(async () => {
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
      pdf.save(`${slug}.pdf`);
    } catch { alert('Error al generar el PDF.'); }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculationResults.summary, ts: Date.now() };
      const prev = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...prev].slice(0, 10)));
      alert('Resultado guardado en el navegador.');
    } catch { alert('No se pudo guardar el resultado.'); }
  }, [states, calculationResults.summary, slug, title]);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <>
      <SeoSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
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

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Proyección de tus Ahorros</h2>
              {calculatorData.outputs.map((output) => {
                const isLoss = output.id === 'perdida_poder_adquisitivo' && (calculationResults.summary as any)[output.id] > 0;
                const isGain = output.id === 'perdida_poder_adquisitivo' && (calculationResults.summary as any)[output.id] < 0;
                return (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${
                      output.id === 'poder_adquisitivo_futuro'
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-700">{output.label}</div>
                    <div
                      className={`text-lg font-bold ${
                        isLoss ? 'text-red-600' : isGain ? 'text-green-600' :
                        output.id === 'poder_adquisitivo_futuro' ? 'text-indigo-600' : 'text-gray-800'
                      }`}
                    >
                      {isClient
                        ? (output.unit === '€'
                            ? euro((calculationResults.summary as any)[output.id])
                            : formatPercent((calculationResults.summary as any)[output.id]))
                        : '...'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Evolución del Poder Adquisitivo</h3>
              <div className="h-80 w-full rounded-lg">
                {isClient && <DynamicLineChart data={calculationResults.chartData} />}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border border-transparent bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors">Reset</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Análisis</h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(calculatorData.content) }}
            />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176802&menu=ultiDatos&idp=1254735976595" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Instituto Nacional de Estadística (INE) - IPC</a></li>
              <li><a href="https://www.bde.es/bde/es/areas/estadis/infoest/indeco/indeco.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Banco de España - Indicadores Económicos</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraInflacionAhorros;
