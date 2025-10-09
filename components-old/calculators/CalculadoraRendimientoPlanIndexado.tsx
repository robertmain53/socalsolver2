'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Tipi per maggiore sicurezza ---
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

type States = {
  [key: string]: number | string;
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  slug: 'calculadora-rendimiento-plan-indexado',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Rendimiento de un Plan de Inversión Indexado',
  lang: 'es',
  description:
    'Proyecta el crecimiento de tu patrimonio con fondos indexados. Calcula el valor final, el impacto de los costes (TER) y la inflación para obtener una visión realista de tu futuro financiero.',
  inputs: [
    { id: 'inversion_inicial', label: 'Inversión Inicial', type: 'number' as const, unit: '€', min: 0, step: 500, tooltip: 'La cantidad de dinero con la que empiezas tu plan de inversión.' },
    { id: 'aportacion_mensual', label: 'Aportación Mensual', type: 'number' as const, unit: '€', min: 0, step: 50, tooltip: 'La cantidad que planeas invertir de forma recurrente cada mes.' },
    { id: 'anos_inversion', label: 'Horizonte de Inversión', type: 'number' as const, unit: 'años', min: 1, max: 50, step: 1, tooltip: 'El número total de años que mantendrás la inversión. El largo plazo es clave para el interés compuesto.' },
    { id: 'rendimiento_anual', label: 'Rendimiento Anual Estimado (%)', type: 'number' as const, unit: '%', min: 0, max: 20, step: 0.5, tooltip: 'Rentabilidad media anual esperada. Históricamente, 8–10% para grandes índices; el pasado no garantiza el futuro.' },
    { id: 'coste_anual_ter', label: 'Coste Anual (TER) (%)', type: 'number' as const, unit: '%', min: 0, max: 5, step: 0.01, tooltip: 'Total Expense Ratio del fondo. En indexados, idealmente < 0,25%.' },
    { id: 'inflacion_anual', label: 'Inflación Anual Estimada (%)', type: 'number' as const, unit: '%', min: 0, max: 10, step: 0.1, tooltip: 'Tasa de inflación media esperada. Suele apuntarse a ~2%.' }
  ],
  outputs: [
    { id: 'valor_final_bruto', label: 'Valor Final del Plan (Nominal)', unit: '€' },
    { id: 'total_aportado', label: 'Total Aportado de tu Bolsillo', unit: '€' },
    { id: 'intereses_generados', label: 'Rendimiento Total Generado', unit: '€' },
    { id: 'valor_final_real', label: 'Valor Final en Dinero de Hoy (Real)', unit: '€' }
  ],
  content: `### Introducción: Visualiza tu Futuro Financiero

El interés compuesto es la fuerza más poderosa del universo financiero, y la inversión indexada es uno de los vehículos más eficientes para aprovecharla. Esta calculadora está diseñada para ayudarte a **proyectar el crecimiento de tu patrimonio** a largo plazo de una manera realista y transparente.

A diferencia de otras herramientas, aquí no solo verás cuánto dinero podrías tener, sino que entenderás **el impacto real de los costes y la inflación**. Es ideal tanto para inversores principiantes que quieren ver el potencial de empezar a ahorrar hoy, como para inversores experimentados que desean ajustar sus planes de futuro.

### Guía de Uso de la Calculadora

* **Inversión Inicial**: El capital del que partes. Puede ser cero.
* **Aportación Mensual**: La clave de la constancia. Pequeñas cantidades periódicas crecen enormemente con el tiempo.
* **Horizonte de Inversión**: El número de años que tu dinero trabajará para ti.
* **Rendimiento Anual Estimado (%)**: Sé conservador y realista.
* **Coste Anual (TER) (%)**: ¡Crucial! Un 1% de diferencia en costes puede suponer decenas de miles de euros a largo plazo.
* **Inflación Anual Estimada (%)**: Ajustamos para mostrar poder adquisitivo real.

### Metodología de Cálculo

**Simulación mensual** para máxima precisión:
1. **Rendimiento neto**: \`r_net = (rendimiento_anual - TER)/100\`.
2. **Tasa mensual equivalente**: \`r_m = (1 + r_net)^{1/12} - 1\`.
3. Para cada mes: primero crece el saldo \`saldo *= (1 + r_m)\`, luego se añade la aportación mensual.
4. El **valor real** se obtiene deflactando por inflación anual acumulada: \`Valor Real = Valor Nominal / (1 + infl)^{años}\`.

### Preguntas Frecuentes (FAQ)

**1. ¿Qué rentabilidad anual es realista?**  
Índices globales han promediado ~8–10% a muy largo plazo. Simula 6–8% para prudencia.

**2. ¿Por qué la inversión indexada?**  
**Costes bajos (TER)**, **diversificación amplia** y **simplicidad**.

**3. ¿Se incluyen impuestos?**  
No. Proyectamos el crecimiento bruto; la fiscalidad depende del país y situación personal.
`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué rentabilidad anual es realista esperar de un fondo indexado?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Índices diversificados globalmente como MSCI World o S&P 500 han promediado ~8–10% anual a muy largo plazo; simular 6–8% es prudente.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Por qué se recomienda la inversión indexada para esta estrategia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Por sus bajísimos costes (TER), máxima diversificación y simplicidad.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Esta calculadora tiene en cuenta los impuestos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Proyecta el crecimiento bruto. La fiscalidad se aplica al vender.'
        }
      }
    ]
  }
};

// --- Import dinamico del grafico (solo client) ---
const DynamicAreaChart: React.ComponentType<any> = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod as any;
      const ChartComponent = (props: any) => (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" unit=" año" fontSize={12} />
            <YAxis
              width={80}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value)
              }
              fontSize={12}
            />
            <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)} />
            <Legend />
            <Area type="monotone" dataKey="total_aportado" stackId="1" name="Total Aportado" stroke="#4f46e5" fill="#818cf8" />
            <Area type="monotone" dataKey="intereses_generados" stackId="1" name="Rendimiento Generado" stroke="#16a34a" fill="#4ade80" />
          </AreaChart>
        </ResponsiveContainer>
      );
      return ChartComponent as any;
    }),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Cargando gráfico...</div>
  }
);

// --- Utils ---
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

const getInputCfg = (id: string) => (calculatorData.inputs as CalculatorInput[]).find((i) => i.id === id);

// --- Markdown minimale (no deps) ---
function simpleMarkdownToHtml(md: string): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw;

    // lista
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        html += '<ul class="list-disc pl-5 space-y-2 mb-4">';
        inList = true;
      }
      const item = esc(line.replace(/^\s*[-*]\s+/, ''));
      let itemHtml = item.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
      itemHtml = itemHtml.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100">$1</code>');
      html += `<li>${itemHtml}</li>`;
      continue;
    } else {
      closeList();
    }

    // headings
    const h3 = line.match(/^\s*###\s+(.*)$/);
    const h2 = line.match(/^\s*##\s+(.*)$/);
    const h1 = line.match(/^\s*#\s+(.*)$/);
    if (h3) {
      html += `<h3 class="text-xl font-bold mt-6 mb-4 text-gray-800">${esc(h3[1])}</h3>`;
      continue;
    }
    if (h2) {
      html += `<h2 class="text-2xl font-bold mt-6 mb-4 text-gray-800">${esc(h2[1])}</h2>`;
      continue;
    }
    if (h1) {
      html += `<h1 class="text-3xl font-bold mt-6 mb-4 text-gray-800">${esc(h1[1])}</h1>`;
      continue;
    }

    if (line.trim() === '') {
      // separatore di paragrafo
      continue;
    }

    // paragrafo
    let p = esc(line);
    p = p.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    p = p.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100">$1</code>');
    html += `<p class="mb-4 leading-relaxed">${p}</p>`;
  }
  closeList();
  return html;
}

const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = React.memo(({ content }: { content: string }) => {
  // render sincrono (SSR-safe) per evitare hydration mismatch
  const htmlContent = useMemo(() => simpleMarkdownToHtml(content), [content]);
  return <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
});
ContentRenderer.displayName = 'ContentRenderer';

// --- Componente Principale ---
const CalculadoraRendimientoPlanIndexado: React.FC = () => {
  const { slug, title, description, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialStates: States = {
    inversion_inicial: 1000,
    aportacion_mensual: 200,
    anos_inversion: 30,
    rendimiento_anual: 8,
    coste_anual_ter: 0.2,
    inflacion_anual: 2.5
  };

  const [states, setStates] = useState<States>(initialStates);

  const handleStateChange = (id: string, value: string | number) => {
    const cfg = getInputCfg(id);
    if (value === '') {
      setStates((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const num = toNum(value);
    const clamped = clamp(num, cfg?.min, cfg?.max);
    setStates((prev) => ({ ...prev, [id]: clamped }));
  };

  const calculationResults = useMemo(() => {
    const inversion_inicial = toNum(states.inversion_inicial, 0);
    const aportacion_mensual = toNum(states.aportacion_mensual, 0);
    const anos_inversion = Math.max(1, Math.floor(toNum(states.anos_inversion, 1)));
    const rendimiento_anual = toNum(states.rendimiento_anual, 0);
    const coste_anual_ter = toNum(states.coste_anual_ter, 0);
    const inflacion_anual = toNum(states.inflacion_anual, 0);

    // Tasa neta anual después de TER
    const rNet = (rendimiento_anual - coste_anual_ter) / 100;
    // Equivalente mensual
    const rM = Math.pow(1 + rNet, 1 / 12) - 1;

    let saldo = inversion_inicial;
    let totalAportado = inversion_inicial;

    const mesesTotales = anos_inversion * 12;
    const proyeccionAnual: Array<{ ano: number; valor_final_bruto: number; total_aportado: number; intereses_generados: number }> = [
      {
        ano: 0,
        valor_final_bruto: parseFloat(saldo.toFixed(2)),
        total_aportado: totalAportado,
        intereses_generados: 0
      }
    ];

    for (let m = 1; m <= mesesTotales; m++) {
      saldo *= 1 + rM; // crecimiento del mes
      saldo += aportacion_mensual; // aportación al final del mes
      totalAportado += aportacion_mensual;

      if (m % 12 === 0) {
        const ano = m / 12;
        const intereses = saldo - totalAportado;
        proyeccionAnual.push({
          ano,
          valor_final_bruto: parseFloat(saldo.toFixed(2)),
          total_aportado: parseFloat(totalAportado.toFixed(2)),
          intereses_generados: parseFloat(intereses.toFixed(2))
        });
      }
    }

    const ultimo = proyeccionAnual[proyeccionAnual.length - 1];
    const valor_final_bruto = ultimo.valor_final_bruto;
    const total_aportado = ultimo.total_aportado;
    const intereses_generados = ultimo.intereses_generados;

    const valor_final_real = valor_final_bruto / Math.pow(1 + inflacion_anual / 100, anos_inversion);

    return {
      summary: {
        valor_final_bruto: parseFloat(valor_final_bruto.toFixed(2)),
        total_aportado: parseFloat(total_aportado.toFixed(2)),
        intereses_generados: parseFloat(intereses_generados.toFixed(2)),
        valor_final_real: parseFloat(valor_final_real.toFixed(2))
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
    } catch (e) {
      console.error(e);
      alert('Error al generar el PDF.');
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculationResults.summary, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 10)));
      alert('Resultado guardado en el navegador.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculationResults.summary, slug, title]);

  return (
    <>
      {/* Schema.org */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{calculatorData.title}</h1>
            <p className="text-gray-600 mb-6">{calculatorData.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
              {(calculatorData.inputs as CalculatorInput[]).map((input) => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    <span className="ml-2 cursor-help" title={input.tooltip}>
                      {/* InfoIcon inline per semplicità */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </span>
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
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados Proyectados</h2>
              {calculatorData.outputs.map((output) => (
                <div
                  key={output.id}
                  className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${
                    output.id === 'valor_final_bruto' || output.id === 'valor_final_real'
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                  <div
                    className={`text-lg md:text-xl font-bold ${
                      output.id === 'valor_final_bruto' || output.id === 'valor_final_real' ? 'text-indigo-600' : 'text-gray-800'
                    }`}
                  >
                    <span>{isClient ? euro((calculationResults.summary as any)[output.id]) : '...'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Proyección Anual del Crecimiento</h3>
              <div className="h-80 w-full rounded-lg">{isClient && <DynamicAreaChart data={calculationResults.chartData} />}</div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button
                onClick={handleSaveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar PDF
              </button>
              <button
                onClick={() => setStates(initialStates)}
                className="w-full text-sm border border-transparent bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Análisis de Inversión</h2>
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
                  href="https://www.cnmv.es/portal/inversor/es/guias-y-documentacion.htm"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  CNMV: Guías para el Inversor
                </a>
              </li>
              <li>
                <a
                  href="https://www.bogleheads.org/wiki/Bogleheads®_investment_philosophy"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Filosofía de Inversión Bogleheads
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};


export default CalculadoraRendimientoPlanIndexado;
