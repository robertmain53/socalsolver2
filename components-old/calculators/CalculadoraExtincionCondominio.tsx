'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* ========= Types ========= */
type RegionalData = Record<string, { name: string; ajd: number }>;

type NumberInputId = 'valorVivienda' | 'porcentajeCedido' | 'hipotecaPendiente';
type SelectInputId = 'comunidadAutonoma';

type NumberInputSpec = {
  id: NumberInputId;
  label: string;
  type: 'number';
  unit?: string;
  min?: number;
  max?: number; // <-- optional
  step?: number;
  tooltip?: string;
};

type SelectOption = { value: string; label: string };
type SelectInputSpec = {
  id: SelectInputId;
  label: string;
  type: 'select';
  options: SelectOption[];
  tooltip?: string;
};

type InputSpec = NumberInputSpec | SelectInputSpec;

type OutputSpec = {
  id: 'compensacionEconomica' | 'impuestoAJD' | 'gastosNotariaRegistro' | 'costeTotalAdjudicatario';
  label: string;
};

/* ========= Icon & Tooltip ========= */
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text?: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    {!!text && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        {text}
      </div>
    )}
  </div>
);

/* ========= Content & FAQ ========= */
const calculatorData = {
  slug: 'calculadora-extincion-condominio',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la Extinción de Condominio',
  lang: 'es',
  tags:
    'calculadora extincion condominio, gastos extincion condominio, impuesto ajd extincion condominio, disolucion condominio, cuanto cuesta una extincion de condominio, notaria registro extincion',
  regionalData: {
    aragon: { name: 'Aragón', ajd: 1.5 },
    andalucia: { name: 'Andalucía', ajd: 1.2 },
    catalunya: { name: 'Cataluña', ajd: 1.5 },
    madrid: { name: 'Comunidad de Madrid', ajd: 0.75 },
    valencia: { name: 'Comunidad Valenciana', ajd: 1.5 },
    galicia: { name: 'Galicia', ajd: 1.5 },
  } as RegionalData,
  inputs: [
    {
      id: 'valorVivienda',
      label: 'Valor actual de la vivienda',
      type: 'number',
      unit: '€',
      min: 0,
      step: 1000,
      tooltip: 'El valor de mercado actual acordado por las partes para el inmueble.',
    },
    {
      id: 'porcentajeCedido',
      label: 'Porcentaje de propiedad que se cede',
      type: 'number',
      unit: '%',
      min: 0,
      max: 100,
      step: 0.1,
      tooltip:
        'Normalmente, si hay dos propietarios al 50%, se cede el 50%. Si hay tres al 33.3%, se podría ceder el 33.3% o el 66.6%.',
    },
    {
      id: 'hipotecaPendiente',
      label: 'Hipoteca pendiente',
      type: 'number',
      unit: '€',
      min: 0,
      step: 500,
      tooltip:
        'La cantidad total que queda por pagar de la hipoteca. Esta deuda se resta de la compensación.',
    },
    {
      id: 'comunidadAutonoma',
      label: 'Comunidad Autónoma',
      type: 'select',
      options: [
        { value: 'madrid', label: 'Comunidad de Madrid' },
        { value: 'catalunya', label: 'Cataluña' },
        { value: 'andalucia', label: 'Andalucía' },
        { value: 'valencia', label: 'Comunidad Valenciana' },
        { value: 'galicia', label: 'Galicia' },
        { value: 'aragon', label: 'Aragón' },
      ],
      tooltip: 'El Impuesto de Actos Jurídicos Documentados (AJD) varía en cada comunidad autónoma.',
    },
  ] as InputSpec[],
  outputs: [
    { id: 'compensacionEconomica', label: 'Compensación Económica a Pagar' },
    { id: 'impuestoAJD', label: 'Impuesto de Actos Jurídicos Documentados (AJD)' },
    { id: 'gastosNotariaRegistro', label: 'Gastos de Notaría y Registro (Estimado)' },
    { id: 'costeTotalAdjudicatario', label: 'Coste Total para quien se queda con el Inmueble' },
  ] as OutputSpec[],
  content: `### Introduzione: Calcola i Costi per Sciogliere una Comproprietà
  ... (tuo contenuto originale invariato) ...`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué pasa si no hay hipoteca pendiente?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Si no hay hipoteca, el cálculo de la compensación es más sencillo...',
        },
      },
      {
        '@type': 'Question',
        name: '¿Esta operación paga Plusvalía Municipal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Generalmente, la extinción de condominio no paga Plusvalía Municipal...',
        },
      },
      {
        '@type': 'Question',
        name: '¿Es obligatorio hacer una extinción de condominio en un divorcio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No es obligatorio...',
        },
      },
    ],
  },
} as const;

type RegionalKey = keyof typeof calculatorData.regionalData;

const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () =>
    content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### '))
        return (
          <h3
            key={index}
            className="text-xl font-bold mt-6 mb-4 text-gray-800"
            dangerouslySetInnerHTML={{
              __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        );
      if (paragraph.startsWith('#### '))
        return (
          <h4
            key={index}
            className="text-lg font-semibold mt-4 mb-3 text-gray-700"
            dangerouslySetInnerHTML={{
              __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        );
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li
            key={i}
            className="leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        ));
        return (
          <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
            {listItems}
          </ul>
        );
      }
      return (
        <p
          key={index}
          className="mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      );
    });
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

/* ========= Chart (dynamic, SSR-safe) ========= */
const DynamicPieChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data }: { data: Array<{ name: string; value: number }> }) => {
        const COLORS = ['#22c55e', '#ef4444', '#8b5cf6'];
        return (
          <mod.ResponsiveContainer width="100%" height="100%">
            <mod.PieChart>
              <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((entry, index) => (
                  <mod.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </mod.Pie>
              <mod.Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
                }
              />
              <mod.Legend />
            </mod.PieChart>
          </mod.ResponsiveContainer>
        );
      };
      return ChartComponent;
    }),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div>,
  }
);

/* ========= Main ========= */
const CalculadoraExtincionCondominio: React.FC = () => {
  const { slug, title, inputs, outputs, content, regionalData } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialStates = {
    valorVivienda: 280_000,
    porcentajeCedido: 50,
    hipotecaPendiente: 120_000,
    comunidadAutonoma: 'madrid' as RegionalKey,
  };
  const [states, setStates] = useState(initialStates);

  const clamp = (n: number, min = -Infinity, max = Infinity) =>
    Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min > -Infinity ? min : 0;

  const handleNumberChange = (id: NumberInputId, raw: string) => {
    const def = inputs.find((i) => i.id === id) as NumberInputSpec | undefined;
    const min = def?.min ?? 0;
    const max = def?.max ?? Infinity;
    const val = clamp(Number(raw), min, max);
    setStates((prev) => ({ ...prev, [id]: val }));
  };

  const handleSelectChange = (id: SelectInputId, value: string) => {
    const key = (value in regionalData ? value : 'madrid') as RegionalKey;
    setStates((prev) => ({ ...prev, [id]: key }));
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const valor = clamp(Number(states.valorVivienda), 0);
    const porcentaje = clamp(Number(states.porcentajeCedido), 0, 100) / 100;
    const hipoteca = clamp(Number(states.hipotecaPendiente), 0);
    const region = regionalData[states.comunidadAutonoma] ?? regionalData.madrid;

    const valorParteCedida = valor * porcentaje;

    // La deuda asumida reduce la compensación económica, no la base del AJD.
    const deudaAsumida = hipoteca * porcentaje;

    const compensacionEconomica = Math.max(0, valorParteCedida - deudaAsumida);

    const impuestoAJD = valorParteCedida * (region.ajd / 100);

    // Estimación simple de notaría/registro: fija + 0,1% del valor total.
    const gastosNotariaRegistro = 800 + valor * 0.001;

    const costeTotalAdjudicatario = compensacionEconomica + impuestoAJD + gastosNotariaRegistro;

    return { compensacionEconomica, impuestoAJD, gastosNotariaRegistro, costeTotalAdjudicatario };
  }, [states, regionalData]);

  const chartData = useMemo(
    () =>
      [
        { name: 'Compensación', value: calculatedOutputs.compensacionEconomica },
        { name: 'Impuesto AJD', value: calculatedOutputs.impuestoAJD },
        { name: 'Notaría y Registro', value: calculatedOutputs.gastosNotariaRegistro },
      ].filter((item) => item.value > 0),
    [calculatedOutputs]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

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
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      alert('Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-6">
                Estima el coste total para la persona que se adjudica el 100% de un inmueble en copropiedad.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {calculatorData.inputs.map((input) => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id}>
                      {input.label}
                      <Tooltip text={input.tooltip}>
                        <span className="ml-2 cursor-help">
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    </label>

                    {input.type === 'select' ? (
                      <select
                        id={input.id}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                        value={states.comunidadAutonoma}
                        onChange={(e) => handleSelectChange('comunidadAutonoma', e.target.value)}
                      >
                        {input.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                          type="number"
                          min={input.min}
                          max={input.max}
                          step={input.step}
                          value={String((states as any)[input.id])}
                          onChange={(e) => handleNumberChange(input.id, e.target.value)}
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Desglose de Costes para el Adjudicatario</h2>
                {calculatorData.outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between p-4 rounded-lg ${
                      output.id === 'costeTotalAdjudicatario'
                        ? 'bg-indigo-50 border-l-4 border-indigo-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span
                      className={`text-xl md:text-2xl font-bold ${
                        output.id === 'costeTotalAdjudicatario' ? 'text-indigo-600' : 'text-gray-800'
                      }`}
                    >
                      {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Desglose del Coste Total</h2>
            <div className="h-64 w-full">{isClient && <DynamicPieChart data={chartData} />}</div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={saveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Reiniciar
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía sobre la Extinción de Condominio</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Código Civil (Art. 400 y siguientes)
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-1993-25560"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley del Impuesto sobre Actos Jurídicos Documentados (AJD)
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraExtincionCondominio;
