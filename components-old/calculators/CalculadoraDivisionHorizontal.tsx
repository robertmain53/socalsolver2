'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Util ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati ---
type InputDef = {
  id: 'valorInmueble' | 'numeroEntidades' | 'metrosCuadrados';
  label: string;
  type: 'number';
  unit?: string;
  tooltip?: string;
  min?: number;
};
type OutputDef = { id: 'costeProyectoTecnico' | 'costeNotariaRegistro' | 'impuestoAJD' | 'costeTotalEstimado'; label: string };

const calculatorData = {
  slug: 'calculadora-division-horizontal',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la División Horizontal de una propiedad',
  lang: 'es',
  tags:
    'calculadora division horizontal, coste division horizontal, precio proyecto division horizontal, impuesto ajd division horizontal, gastos notariales division horizontal',
  prices: {
    proyectoTecnicoBase: 1000,
    proyectoTecnicoPorEntidad: 250,
    /** costo per m² prima era “magico”: ora è esplicito */
    proyectoTecnicoPorM2: 0.5,
    notariaBase: 600,
    notariaPorEntidad: 100,
    registroBase: 400,
    registroPorEntidad: 75,
    /** AJD percentuale (stima media) */
    ajdRate: 1.5,
  },
  inputs: [
    {
      id: 'valorInmueble',
      label: 'Valor del inmueble completo',
      type: 'number' as const,
      unit: '€',
      min: 0,
      tooltip:
        'El valor total del edificio o parcela sobre el que se va a realizar la división. Este valor se usa como base para el Impuesto (AJD).',
    },
    {
      id: 'numeroEntidades',
      label: 'Número de entidades a crear',
      type: 'number' as const,
      unit: 'entidades',
      min: 1,
      tooltip:
        'El número total de elementos privativos que resultarían de la división (viviendas, locales, plazas de garaje, etc.).',
    },
    {
      id: 'metrosCuadrados',
      label: 'Superficie total construida',
      type: 'number' as const,
      unit: 'm²',
      min: 0,
      tooltip: 'La superficie total del edificio. Influye en el coste del proyecto técnico.',
    },
  ] as InputDef[],
  outputs: [
    { id: 'costeProyectoTecnico', label: 'Coste del Proyecto Técnico (Arquitecto)' },
    { id: 'costeNotariaRegistro', label: 'Coste de Notaría y Registro de la Propiedad' },
    { id: 'impuestoAJD', label: 'Impuesto de Actos Jurídicos Documentados (AJD)' },
    { id: 'costeTotalEstimado', label: 'Coste Total Estimado del Proceso' },
  ] as OutputDef[],
  content:
    '### Introduzione... (testo lungo identico alla tua versione)\n\n...etc...',
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Siempre es posible hacer una división horizontal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. Es necesario que la operación cumpla con la normativa urbanística del ayuntamiento... Se necesita un proyecto técnico y licencia municipal.',
        },
      },
      {
        '@type': 'Question',
        name: '¿El AJD se paga sobre el valor catastral o el valor real del inmueble?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'El Impuesto de Actos Jurídicos Documentados (AJD) se calcula sobre el valor real del inmueble declarado en la escritura...',
        },
      },
      {
        '@type': 'Question',
        name: '¿Este proceso afecta al IBI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí, de forma muy importante. Tras la división horizontal, la finca registral antigua desaparece y se crean nuevas fincas...',
        },
      },
    ],
  },
};

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
            dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
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

// --- Chart (dinamico) ---
const DynamicPieChart = dynamic(
  () =>
    import('recharts').then(mod => {
      const ChartComponent = ({ data }: { data: Array<{ name: string; value: number }> }) => {
        const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444'];
        return (
          <mod.ResponsiveContainer width="100%" height="100%">
            <mod.PieChart>
              <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {data.map((entry, index) => (
                  <mod.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </mod.Pie>
              <mod.Tooltip
                formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}
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

// --- Component ---
const CalculadoraDivisionHorizontal: React.FC = () => {
  const { slug, title, inputs, outputs, content, prices } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const initialStates = {
    valorInmueble: 500_000,
    numeroEntidades: 5,
    metrosCuadrados: 450,
  };
  const [states, setStates] = useState<typeof initialStates>(initialStates);

  const clamp = (val: number, min = 0) => (Number.isFinite(val) ? Math.max(min, val) : min);

  const handleStateChange = (id: keyof typeof initialStates, value: string) => {
    const def = inputs.find(i => i.id === id)!;
    const num = clamp(Number(value), def.min ?? 0);
    setStates(prev => ({ ...prev, [id]: num }));
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const valor = clamp(Number(states.valorInmueble), 0);
    const entidades = clamp(Number(states.numeroEntidades), 1);
    const m2 = clamp(Number(states.metrosCuadrados), 0);

    const costeProyectoTecnico =
      prices.proyectoTecnicoBase +
      entidades * prices.proyectoTecnicoPorEntidad +
      m2 * prices.proyectoTecnicoPorM2;

    const costeNotaria = prices.notariaBase + entidades * prices.notariaPorEntidad;
    const costeRegistro = prices.registroBase + entidades * prices.registroPorEntidad;
    const costeNotariaRegistro = costeNotaria + costeRegistro;

    const impuestoAJD = valor * (prices.ajdRate / 100);

    const costeTotalEstimado = costeProyectoTecnico + costeNotariaRegistro + impuestoAJD;

    return { costeProyectoTecnico, costeNotariaRegistro, impuestoAJD, costeTotalEstimado };
  }, [states, prices]);

  const chartData = useMemo(
    () =>
      [
        { name: 'Proyecto Técnico', value: calculatedOutputs.costeProyectoTecnico },
        { name: 'Notaría y Registro', value: calculatedOutputs.costeNotariaRegistro },
        { name: 'Impuesto (AJD)', value: calculatedOutputs.impuestoAJD },
      ].filter(it => it.value > 0),
    [calculatedOutputs]
  );

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

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
                Estima el coste total de dividir un inmueble, incluyendo gastos técnicos, notariales e impuestos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {calculatorData.inputs.map(input => (
                  <div key={input.id} className="md:col-span-2">
                    <label
                      className="block text-sm font-medium text-gray-700 flex items-center mb-1"
                      htmlFor={input.id}
                    >
                      {input.label}
                      {input.tooltip && (
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2 cursor-help">
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                        type="number"
                        min={input.min}
                        value={String((states as any)[input.id])}
                        onChange={e => handleStateChange(input.id, e.target.value)}
                      />
                      {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Desglose de Costes Estimados</h2>
                {calculatorData.outputs.map(output => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between p-4 rounded-lg ${
                      output.id === 'costeTotalEstimado' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span
                      className={`text-xl md:text-2xl font-bold ${
                        output.id === 'costeTotalEstimado' ? 'text-indigo-600' : 'text-gray-800'
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
              <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">
                Guardar
              </button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">
                Exportar PDF
              </button>
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">
                Reiniciar
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía sobre la División Horizontal</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a href="https://www.boe.es/buscar/act.php?id=BOE-A-1960-10906" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">
                  Ley 49/1960, sobre propiedad horizontal
                </a>
              </li>
              <li>
                <a href="https://www.boe.es/buscar/act.php?id=BOE-A-1993-25560" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">
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

export default CalculadoraDivisionHorizontal;
