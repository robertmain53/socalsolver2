'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* ===========================
   Recharts: LineChart dinamico
   =========================== */
type ChartPoint = { unidades: number; ingresos: number; costos: number };
type LineChartProps = { data: ChartPoint[]; breakEvenUnits: number };

const DynamicLineChart = dynamic<LineChartProps>(
  () =>
    import('recharts').then((mod) => {
      const {
        LineChart,
        Line,
        XAxis,
        YAxis,
        Tooltip: ChartTooltip,
        ResponsiveContainer,
        Legend,
        ReferenceLine,
      } = mod;

      const ChartComponent: React.FC<LineChartProps> = (props) => (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={props.data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="unidades"
              type="number"
              label={{ value: 'Unidades Vendidas', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tickFormatter={(value: number) =>
                `${new Intl.NumberFormat('es-ES').format(value / 1000)}k €`
              }
            />
            <ChartTooltip
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                  value ?? 0
                ),
                name,
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ingresos"
              name="Ingresos Totales"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="costos"
              name="Costos Totales"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {props.breakEvenUnits > 0 && Number.isFinite(props.breakEvenUnits) && (
              <ReferenceLine
                x={props.breakEvenUnits}
                stroke="#4f46e5"
                strokeDasharray="3 3"
                label={{ value: 'Punto Equilibrio', fill: '#4f46e5', position: 'insideTopLeft' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
      return ChartComponent;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p>Cargando gráfico...</p>
      </div>
    ),
  }
);

/* ===========================
   UI: Icona + Tooltip
   =========================== */
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

/* ===========================
   SEO: JSON-LD
   =========================== */
const FaqSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

/* ===========================
   Content renderer (markdown-lite)
   =========================== */
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        if (trimmedBlock.startsWith('### ')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.slice(4)) }}
            />
          );
        }
        if (trimmedBlock.startsWith('#### ')) {
          return (
            <h4
              key={index}
              className="text-lg font-semibold mt-4 mb-3"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.slice(5)) }}
            />
          );
        }
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n').map((item) => item.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ul>
          );
        }
        if (/^\d\.\s/.test(trimmedBlock)) {
          const items = trimmedBlock.split('\n').map((item) => item.replace(/^\d\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ol>
          );
        }
        return (
          <p
            key={index}
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }}
          />
        );
      })}
    </div>
  );
};

/* ===========================
   Config calcolatore
   =========================== */
const calculatorData = {
  slug: 'calculadora-punto-equilibrio',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Punto de Equilibrio (Break-Even) para un negocio',
  lang: 'es',
  inputs: [
    {
      id: 'costos_fijos_mensuales',
      label: 'Costos Fijos Totales (Mensual)',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'Suma de todos los gastos que no cambian con el volumen de producción o ventas (ej: alquiler, salarios fijos, seguros).',
    },
    {
      id: 'precio_venta_unidad',
      label: 'Precio de Venta por Unidad',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 1,
      tooltip: 'El precio al que vendes un solo producto o servicio.',
    },
    {
      id: 'costo_variable_unidad',
      label: 'Costo Variable por Unidad',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 0.5,
      tooltip:
        'El costo directo de producir una sola unidad (ej: materia prima, comisiones por venta, costos de envío).',
    },
    {
      id: 'objetivo_beneficio_mensual',
      label: 'Objetivo de Beneficio (Mensual)',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'Introduce una cifra de beneficio deseada para calcular cuántas unidades necesitas vender para alcanzarla.',
    },
  ],
  outputs: [
    { id: 'punto_equilibrio_unidades', label: 'Punto de Equilibrio (en Unidades)', unit: 'unidades' },
    { id: 'punto_equilibrio_ingresos', label: 'Punto de Equilibrio (en Ingresos)', unit: '€' },
    { id: 'margen_contribucion_unidad', label: 'Margen de Contribución por Unidad', unit: '€' },
    {
      id: 'unidades_para_beneficio',
      label: 'Unidades para alcanzar el Beneficio Objetivo',
      unit: 'unidades',
    },
  ],
  content:
    '### Introducción: Descubre Cuándo Tu Negocio Empieza a Ser Rentable\n\nEl **punto de equilibrio** (o *break-even point*) es una de las métricas financieras más cruciales para cualquier emprendedor, gerente o estudiante de negocios. Representa el momento exacto en que los ingresos totales de una empresa igualan a sus costos totales; en otras palabras, el punto en el que no se gana ni se pierde dinero. Conocer esta cifra es fundamental para la planificación estratégica, la fijación de precios y la toma de decisiones. Esta calculadora te permite determinar con precisión cuántas unidades necesitas vender o cuántos ingresos debes generar para cubrir todos tus costos y empezar a obtener beneficios.\n\n### Guía all\'Uso del Calcolatore: Definiendo los Conceptos Clave\n\nPara usar la calculadora de forma efectiva, es vital clasificar correctamente tus costos:\n\n* **Costos Fijos Totales**: Son los gastos que tu negocio debe pagar cada mes, independientemente de cuánto vendas. **Ejemplos**: el alquiler de la oficina, los sueldos del personal administrativo, las suscripciones a software, los seguros o la amortización de maquinaria.\n* **Precio de Venta por Unidad**: Es simplemente el precio que cobra un cliente por un único producto o servicio.\n* **Costo Variable por Unidad**: Son los costos que están directamente ligados a la producción o venta de una unidad. Si no vendes nada, este costo es cero. **Ejemplos**: la materia prima, el packaging, los costos de envío por unidad, las comisiones de venta.\n* **Objetivo de Beneficio**: Una función avanzada que te permite ir un paso más allá y calcular las ventas necesarias para no solo cubrir costos, sino alcanzar una meta de rentabilidad específica.\n\n### Metodologia di Calcolo Spiegata: La Lógica Detrás de los Números\n\nEl cálculo se basa en el **Margen de Contribución**:\n\n1. **Margen de Contribución** = Precio de Venta por Unidad − Costo Variable por Unidad.\n2. **Punto de Equilibrio (unidades)** = Costos Fijos Totales ÷ Margen de Contribución por Unidad.\n\n### Analisi Approfondita y FAQ\n\nConsulta la sección de guía estratégica y preguntas frecuentes para casos límite (margen negativo, sensibilidad, etc.).',
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué pasa si mi costo variable por unidad es mayor que mi precio de venta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'El margen de contribución sería negativo. Es imposible alcanzar el punto de equilibrio: debes subir precio o bajar costos variables.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo puedo reducir mi punto de equilibrio de forma efectiva?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Aumenta el precio (si el mercado lo acepta), reduce costos variables (proveedores, eficiencia) o reduce costos fijos (alquiler, gastos indirectos).',
        },
      },
      {
        '@type': 'Question',
        name: '¿Este cálculo incluye impuestos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. Es un análisis operativo **antes de impuestos**. Los tributos se aplican sobre beneficios una vez superado el umbral.',
        },
      },
    ],
  },
} as const;

/* ===========================
   Helpers robusti
   =========================== */
const clampMin = (v: number, min: number) => (Number.isFinite(v) ? Math.max(v, min) : min);
const parseNum = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/* ===========================
   Componente principale
   =========================== */
const CalculadoraPuntoEquilibrio: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const initialStates = {
    costos_fijos_mensuales: 1500,
    precio_venta_unidad: 25,
    costo_variable_unidad: 10,
    objetivo_beneficio_mensual: 2000,
  };
  const [states, setStates] = useState<Record<string, number | ''>>(initialStates);

  const handleStateChange = (id: string, value: string) => {
    const def = calculatorData.inputs.find((i) => i.id === id);
    const min = def?.min ?? 0;
    if (value === '') return setStates((p) => ({ ...p, [id]: '' }));
    const num = Number(value);
    setStates((p) => ({ ...p, [id]: clampMin(num, min) }));
  };

  const handleReset = () => setStates(initialStates);
  const n = (k: keyof typeof initialStates) => parseNum(states[k]);

  const { calculatedOutputs, chartData } = useMemo(() => {
    const costos_fijos_mensuales = n('costos_fijos_mensuales');
    const precio_venta_unidad = n('precio_venta_unidad');
    const costo_variable_unidad = n('costo_variable_unidad');
    const objetivo_beneficio_mensual = n('objetivo_beneficio_mensual');

    const margen_contribucion_unidad = precio_venta_unidad - costo_variable_unidad;

    // Break-even in unidades (solo se calcula con margen > 0)
    const punto_equilibrio_unidades =
      margen_contribucion_unidad > 0
        ? costos_fijos_mensuales / margen_contribucion_unidad
        : 0;

    const punto_equilibrio_ingresos = punto_equilibrio_unidades * precio_venta_unidad;

    const unidades_para_beneficio =
      margen_contribucion_unidad > 0
        ? (costos_fijos_mensuales + objetivo_beneficio_mensual) / margen_contribucion_unidad
        : 0;

    const co = {
      punto_equilibrio_unidades,
      punto_equilibrio_ingresos,
      margen_contribucion_unidad,
      unidades_para_beneficio,
    };

    // Generazione punti grafico
    const baseMax = Math.max(50, Math.ceil(punto_equilibrio_unidades), Math.ceil(unidades_para_beneficio));
    const chartMaxUnits = Math.ceil(baseMax * 1.5);
    const step = Math.max(1, Math.ceil(chartMaxUnits / 20));
    const data: ChartPoint[] = Array.from({ length: 21 }, (_, i) => {
      const unidades = i * step;
      const ingresos = unidades * precio_venta_unidad;
      const costos = costos_fijos_mensuales + unidades * costo_variable_unidad;
      return { unidades, ingresos, costos };
    });

    return { calculatedOutputs: co, chartData: data };
  }, [states]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('La función de exportar a PDF no está disponible.');
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      const newResults = [payload, ...existingResults].slice(0, 50);
      localStorage.setItem('calc_results', JSON.stringify(newResults));
      alert('Resultado guardado correctamente.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v || 0);
  const formatNumber = (v: number) =>
    new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(v || 0);

  const marginOK =
    parseNum(states.precio_venta_unidad) > 0 &&
    parseNum(states.costo_variable_unidad) < parseNum(states.precio_venta_unidad);

  return (
    <>
      <FaqSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-4">
              Calcula las unidades e ingresos necesarios para cubrir tus costos y empezar a generar
              beneficios.
            </p>

            <div className="flex items-center gap-2 text-xs mb-4">
              <span
                className={`px-2 py-1 rounded border ${
                  marginOK
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}
              >
                {marginOK ? 'Interpretado correctamente' : 'Revisa precio y costos variables'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
              {inputs.map((input) => (
                <div key={input.id}>
                  <label
                    className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                    htmlFor={input.id}
                  >
                    {input.label}
                    <Tooltip text={input.tooltip}>
                      <span className="ml-2 cursor-help">
                        <InfoIcon />
                      </span>
                    </Tooltip>
                  </label>
                  <div className="relative">
                    <input
                      id={input.id}
                      aria-label={input.label}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      type="number"
                      min={input.min}
                      step={input.step}
                      value={states[input.id] as number | ''}
                      onChange={(e) => handleStateChange(input.id, e.target.value)}
                      onBlur={(e) => {
                        if (e.currentTarget.value === '') {
                          const min = input.min ?? 0;
                          setStates((prev) => ({ ...prev, [input.id]: min }));
                        }
                      }}
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                      {input.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {!marginOK && parseNum(states.precio_venta_unidad) > 0 && (
              <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3 my-4">
                <strong>Atención:</strong> El costo variable por unidad es igual o mayor que el
                precio de venta. Con esta estructura de costos, es imposible alcanzar la
                rentabilidad.
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados del Análisis</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`p-4 rounded-lg ${
                      output.id.includes('punto_equilibrio')
                        ? 'bg-indigo-50 border-l-4 border-indigo-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-600">{output.label}</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {isClient ? (
                        output.unit === '€'
                          ? formatCurrency((calculatedOutputs as any)[output.id] || 0)
                          : formatNumber((calculatedOutputs as any)[output.id] || 0)
                      ) : (
                        '...'
                      )}
                      <span className="text-sm font-medium text-gray-500 ml-2">{output.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Gráfico de Costos vs. Ingresos
              </h3>
              <div className="h-80 w-full p-2">
                {isClient && (
                  <DynamicLineChart
                    data={chartData}
                    breakEvenUnits={calculatedOutputs.punto_equilibrio_unidades}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <button
                onClick={saveResult}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar Simulación
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar a PDF
              </button>
              <button
                onClick={handleReset}
                className="sm:col-span-2 lg:col-span-1 w-full border border-transparent rounded-md px-3 py-2 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reiniciar Valores
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía Estratégica</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.investopedia.com/terms/b/breakevenpoint.asp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Investopedia: Break-Even Point (BEP)
                </a>
              </li>
              <li>
                <a
                  href="https://hbr.org/1975/09/break-even-analysis-a-decision-making-tool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Harvard Business Review: Break-Even Analysis
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraPuntoEquilibrio;
