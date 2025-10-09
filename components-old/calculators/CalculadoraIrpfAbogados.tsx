'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* =========================
   Types
   ========================= */
type InputType = {
  id: string;
  label: string;
  type: 'number' | 'boolean';
  unit?: string;
  min?: number;
  step?: number;
  tooltip: string;
  condition?: string;
};

type OutputType = {
  id: string;
  label: string;
  unit: string;
};

type CalculatorDataType = {
  slug: string;
  category: string;
  title: string;
  lang: string;
  inputs: InputType[];
  outputs: OutputType[];
  content: string;
  seoSchema: any;
};

/* =========================
   Dynamic Recharts wrapper
   ========================= */
const DynamicBarChart = dynamic<{
  data: { name: string; value: number }[];
}>(() =>
  import('recharts').then((mod) => {
    const {
      BarChart,
      Bar,
      XAxis,
      YAxis,
      Tooltip: ChartTooltip,
      ResponsiveContainer,
      Legend,
    } = mod;

    const ChartComponent = ({ data }: { data: { name: string; value: number }[] }) => (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(value: number) => `€${(Number(value) / 1000).toFixed(1)}k`}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                Number(value || 0)
              )
            }
            cursor={{ fill: 'rgba(230, 230, 230, 0.4)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="value" name="Desglose anual" />
        </BarChart>
      </ResponsiveContainer>
    );

    return ChartComponent;
  }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-gray-50 text-sm text-gray-500">
        Cargando gráfico...
      </div>
    ),
  }
);

/* =========================
   Small helpers
   ========================= */
const InfoIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400 hover:text-gray-600"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div
      role="tooltip"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"
    >
      {text}
    </div>
  </div>
);

const FaqSchema = ({ schema }: { schema: any }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.substring(4)) }}
            />
          );
        }
        if (trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').map((i) => i.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ul>
          );
        }
        if (/^\d\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').map((i) => i.replace(/^\d\.\s*/, ''));
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
            dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed) }}
          />
        );
      })}
    </div>
  );
};

/* =========================
   Calculator data
   ========================= */
const calculatorData: CalculatorDataType = {
  slug: 'calculadora-irpf-abogados',
  category: 'Impuestos y trabajo autónomo',
  title: 'Calculadora de IRPF para abogados y procuradores autónomos',
  lang: 'es',
  inputs: [
    {
      id: 'ingresos_anuales',
      label: 'Ingresos Anuales Brutos',
      type: 'number',
      unit: '€',
      min: 0,
      step: 1000,
      tooltip:
        'Introduce el total de ingresos facturados en un año fiscal, antes de aplicar retenciones o descontar gastos.',
    },
    {
      id: 'gastos_deducibles',
      label: 'Gastos Anuales Deducibles',
      type: 'number',
      unit: '€',
      min: 0,
      step: 500,
      tooltip:
        'Suma todos los gastos relacionados con tu actividad: cuota de autónomos, colegio profesional, RC, alquiler de despacho, software, etc.',
    },
    {
      id: 'es_nuevo_autonomo',
      label: '¿Aplicas la retención reducida para nuevos autónomos?',
      type: 'boolean',
      tooltip:
        'Marca si estás en el año de inicio de actividad o en los dos siguientes. Retención del 7% en lugar del 15% general.',
    },
  ],
  outputs: [
    { id: 'rendimiento_neto', label: 'Rendimiento Neto (Base Imponible)', unit: '€' },
    { id: 'retenciones_anuales', label: 'Total Retenido en Facturas (7% o 15%)', unit: '€' },
    { id: 'cuota_irpf_final', label: 'Cuota IRPF a Pagar (Según tramos)', unit: '€' },
    { id: 'resultado_declaracion', label: 'Resultado de la Declaración', unit: '€' },
    { id: 'beneficio_neto_real', label: 'Beneficio Neto Anual Real (Take-Home)', unit: '€' },
  ],
  content:
    "### Introducción\n\nEsta calculadora está diseñada específicamente para **abogados y procuradores autónomos** que ejercen en España. Su objetivo es proporcionar una estimación clara y precisa del Impuesto sobre la Renta de las Personas Físicas (IRPF) anual, permitiéndote planificar tu fiscalidad, entender el resultado de tu futura declaración de la renta y conocer tu beneficio neto real. A diferencia de las calculadoras de facturas, esta herramienta se enfoca en la visión anual completa.\n\n### Guía de Uso del Calculador\n\n* **Ingresos Anuales Brutos**: Suma de todas las bases imponibles de facturas (sin IVA, sin descontar gastos).\n* **Gastos Anuales Deducibles**: Incluye todos los gastos necesarios para ejercer. Más abajo listamos los más comunes.\n* **¿Retención reducida 7%?**: Para nuevos autónomos (año de alta y dos siguientes). Ajusta las retenciones adelantadas.\n\n### Metodología de Cálculo\n\n1. **Rendimiento neto** = Ingresos - Gastos.\n2. **Tramos IRPF** aplicados de forma progresiva.\n3. **Ajuste por retenciones** (7% o 15%) practicadas en factura a lo largo del año.\n\n### Gastos deducibles clave\n\n* **Cuota de autónomos**, **colegios profesionales**, **RC**, **alquiler y suministros**, **software jurídico**, **publicidad**, **material**, **desplazamientos**.\n\n### FAQ\n\n**¿Diferencia entre retención y tipo final?** La retención es un pago a cuenta (7% o 15%). El tipo final es progresivo sobre tu beneficio.\n\n**¿Incluye la cuota de autónomos?** No automáticamente: súmala a tus gastos.\n\n**¿Resultado negativo?** Indica cantidad **a pagar** a Hacienda.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuál es la diferencia entre la retención (7% o 15%) y el tipo final de IRPF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La retención es un pago a cuenta (7% o 15%). El tipo final es progresivo sobre tu beneficio (ingresos menos gastos).',
        },
      },
      {
        '@type': 'Question',
        name: '¿Esta calculadora incluye la cuota de autónomos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "No automáticamente. Debes sumar la cuota anual de autónomos a tus gastos e introducir el total en 'Gastos Anuales Deducibles'.",
        },
      },
      {
        '@type': 'Question',
        name: 'Si el resultado de la declaración es negativo, ¿qué significa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Que tienes que abonar esa diferencia a Hacienda (resultado a pagar).',
        },
      },
    ],
  },
};

/* =========================
   Component
   ========================= */
const CalculadoraIrpfAbogados: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialStates = {
    ingresos_anuales: 65000,
    gastos_deducibles: 12000,
    es_nuevo_autonomo: false,
  };
  const [states, setStates] = useState<Record<string, number | boolean>>(initialStates);

  const handleStateChange = (id: string, value: number | boolean | '') => {
    setStates((prev) => ({ ...prev, [id]: value as any }));
  };

  const handleReset = useCallback(() => {
    setStates(initialStates);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);

  const calculatedOutputs = useMemo(() => {
    // Coerce to numbers defensively
    const ingresos = Number(states.ingresos_anuales ?? 0) || 0;
    const gastos = Number(states.gastos_deducibles ?? 0) || 0;
    const esNuevo = Boolean(states.es_nuevo_autonomo);

    const rendimiento_neto = Math.max(0, ingresos - gastos);

    // Retenciones practicadas en factura
    const tipo_retencion = esNuevo ? 0.07 : 0.15;
    const retenciones_anuales = ingresos * tipo_retencion;

    // Tramos IRPF (base general). Ajusta si cambian por ejercicio fiscal.
    const tramos: { limite: number; tipo: number }[] = [
      { limite: 12450, tipo: 0.19 },
      { limite: 20200, tipo: 0.24 },
      { limite: 35200, tipo: 0.30 },
      { limite: 60000, tipo: 0.37 },
      { limite: 300000, tipo: 0.45 },
      { limite: Infinity, tipo: 0.47 },
    ];

    let cuota_irpf_final = 0;
    let base_restante = rendimiento_neto;
    let base_anterior = 0;

    for (const tramo of tramos) {
      if (base_restante <= 0) break;
      const limiteTramo = tramo.limite - base_anterior;
      const base_en_tramo = Math.max(0, Math.min(base_restante, limiteTramo));
      if (base_en_tramo > 0) {
        cuota_irpf_final += base_en_tramo * tramo.tipo;
        base_restante -= base_en_tramo;
        base_anterior = tramo.limite;
      }
    }

    // Resultado declaración: positivo => a devolver; negativo => a pagar
    const resultado_declaracion = retenciones_anuales - cuota_irpf_final;

    // Beneficio neto real (post IRPF, sin IVA)
    const beneficio_neto_real = rendimiento_neto - cuota_irpf_final;

    return {
      rendimiento_neto,
      retenciones_anuales,
      cuota_irpf_final,
      resultado_declaracion,
      beneficio_neto_real,
    };
  }, [states]);

  const chartData = useMemo(
    () => [
      { name: 'Ingresos brutos', value: Number(states.ingresos_anuales) || 0 },
      { name: 'Gastos', value: Number(states.gastos_deducibles) || 0 },
      { name: 'Impuestos (IRPF)', value: calculatedOutputs.cuota_irpf_final || 0 },
      { name: 'Beneficio neto', value: calculatedOutputs.beneficio_neto_real || 0 },
    ],
    [states, calculatedOutputs]
  );

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
    } catch (e) {
      // Avoid noisy logs in production; keep a user-friendly message
      alert(
        'Error al exportar a PDF. Esta función puede no estar disponible en todos los navegadores.'
      );
      // console.error(e);
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        inputs: states,
        outputs: calculatedOutputs,
        ts: Date.now(),
      };
      const existingResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      const newResults = [payload, ...existingResults].slice(0, 50);
      localStorage.setItem('calc_results', JSON.stringify(newResults));
      alert('Resultado guardado en el almacenamiento local.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema schema={seoSchema} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/80 font-sans">
        {/* Calculadora */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
            <p className="text-gray-600 mb-6">
              Herramienta de planificación fiscal anual para profesionales del derecho en España.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {inputs.map((input) => {
                if (input.type === 'boolean') {
                  return (
                    <div
                      key={input.id}
                      className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-white border"
                    >
                      <input
                        id={input.id}
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={Boolean(states[input.id])}
                        onChange={(e) => handleStateChange(input.id, e.target.checked)}
                        aria-label={input.label}
                      />
                      <label
                        className="text-sm font-medium text-gray-700 flex items-center"
                        htmlFor={input.id}
                      >
                        {input.label}
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2 cursor-help" aria-hidden="true">
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      </label>
                    </div>
                  );
                }

                return (
                  <div key={input.id}>
                    <label
                      className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center"
                      htmlFor={input.id}
                    >
                      {input.label}
                      <Tooltip text={input.tooltip}>
                        <span className="ml-2 cursor-help" aria-hidden="true">
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    </label>
                    <div className="relative">
                      <input
                        id={input.id}
                        type="number"
                        min={input.min}
                        step={input.step}
                        value={states[input.id] as number}
                        onChange={(e) =>
                          handleStateChange(
                            input.id,
                            e.target.value === '' ? 0 : Number(e.target.value)
                          )
                        }
                        inputMode="decimal"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        aria-describedby={`${input.id}-unit`}
                      />
                      {input.unit && (
                        <span
                          id={`${input.id}-unit`}
                          className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
                        >
                          {input.unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados anuales</h2>
              {outputs.map((output) => {
                const value = (calculatedOutputs as any)[output.id] as number;
                const isNegativeResult = output.id === 'resultado_declaracion' && value < 0;
                const isPositiveResult = output.id === 'resultado_declaracion' && value >= 0;
                const isNetoReal = output.id === 'beneficio_neto_real';

                return (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between p-4 rounded-lg ${
                      isNetoReal
                        ? 'bg-emerald-50 border-l-4 border-emerald-500'
                        : 'bg-gray-50 border-l-4 border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="text-sm md:text-base font-medium text-gray-700">
                        {output.label}
                      </div>
                      {output.id === 'resultado_declaracion' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {isNegativeResult ? 'A pagar a Hacienda' : 'A devolver por Hacienda'}
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-xl md:text-2xl font-bold ${
                        isNegativeResult
                          ? 'text-red-600'
                          : isPositiveResult
                          ? 'text-green-600'
                          : isNetoReal
                          ? 'text-emerald-700'
                          : 'text-gray-900'
                      }`}
                    >
                      <span>{isClient ? formatCurrency(Math.abs(value || 0)) : '...'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Desglose visual de ingresos
              </h3>
              <div className="h-64 w-full bg-gray-50/50 p-2 rounded-lg border">
                {isClient && <DynamicBarChart data={chartData} />}
              </div>
            </div>
          </div>

          <div className="mt-6 border rounded-lg shadow-lg p-4 bg-white">
            <h3 className="font-semibold text-gray-700">Aviso sobre la metodología</h3>
            <p className="text-xs text-gray-600 mt-2">
              Esta calculadora usa los tramos estatales de IRPF y no contempla mínimos personales,
              deducciones autonómicas u otras circunstancias. Es una **estimación orientativa** y no
              constituye asesoramiento fiscal.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-lg">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={saveResult}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full bg-red-600 text-white rounded-md px-3 py-2 text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-lg">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y análisis</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-lg">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/c13-actividades-economicas/estimacion-directa-regimen-general/gastos-fiscalmente-deducibles.html"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Gastos Deducibles
                </a>
              </li>
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/c01-impuesto-sobre-renta-personas-fisicas/esquema-general-liquidacin-del-impuesto/base-liquidable-general-ahorro.html"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Tramos IRPF
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfAbogados;
