'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// ---------- Utils ----------
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const toNumber = (raw: string | number): number => {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

// --- Componenti di Utilità ---

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

// --- Dati Self-Contained ---
const calculatorData = {
  slug: 'calculadora-coste-okupacion',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la "Okupación": costes legales y de recuperación',
  lang: 'es',
  tags:
    'calculadora okupacion, coste desokupacion, gastos juicio desahucio, cuanto cuesta echar a un okupa, lucro cesante okupacion, seguro anti okupas',
  inputs: [
    {
      id: 'tipoProcedimiento',
      label: 'Vía de recuperación elegida',
      type: 'select' as const,
      options: [
        { value: 'civil', label: 'Vía Civil (desahucio por precario)' },
        { value: 'penal', label: 'Vía Penal (delito de usurpación)' },
      ],
      tooltip:
        'La vía civil suele ser más rápida para la recuperación. La vía penal busca castigar el delito, pero puede ser más lenta.',
    },
    {
      id: 'valorAlquilerMensual',
      label: 'Renta mensual que podrías obtener',
      type: 'number' as const,
      unit: '€/mes',
      tooltip:
        'Estima el alquiler de mercado de tu vivienda. Se usará para calcular el lucro cesante (lo que dejas de ganar).',
    },
    {
      id: 'mesesOcupacion',
      label: 'Tiempo estimado del proceso',
      type: 'number' as const,
      unit: 'meses',
      tooltip:
        'El tiempo medio de un procedimiento judicial de desahucio en España. Puede variar mucho según el juzgado.',
    },
    {
      id: 'necesitaReparaciones',
      label: '¿Estimas que necesitarás reparaciones importantes?',
      type: 'boolean' as const,
      tooltip:
        'Marca esta opción si prevés que la vivienda sufrirá daños que requieran una reforma o rehabilitación.',
    },
    {
      id: 'costeReparaciones',
      label: 'Coste estimado de las reparaciones',
      type: 'number' as const,
      unit: '€',
      condition: 'necesitaReparaciones == true',
      tooltip:
        'Introduce un presupuesto aproximado para reparar los posibles desperfectos en la vivienda.',
    },
  ],
  costesFijos: { abogado: 1200, procurador: 350, cerrajero: 250, poderGeneral: 50 },
  outputs: [
    { id: 'costesLegales', label: 'Costes Legales Estimados (Abogado, Procurador...)' },
    { id: 'lucroCesante', label: 'Lucro Cesante (Alquileres perdidos)' },
    { id: 'costeReparacionesPost', label: 'Coste de Reparaciones Post-desalojo' },
    { id: 'costeTotal', label: 'Coste Total Estimado de la Recuperación' },
  ],
  content: `### Introduzione: Comprendi i Costi Reali per Recuperare la Tua Casa
...`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      // (tuo schema invariato)
    ],
  },
};

const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h3
            key={index}
            className="text-xl font-bold mt-6 mb-4 text-gray-800"
            dangerouslySetInnerHTML={{ __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h4
            key={index}
            className="text-lg font-semibold mt-4 mb-3 text-gray-700"
            dangerouslySetInnerHTML={{ __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
        return (
          <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
            {listItems}
          </ul>
        );
      }
      return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });
  };
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

// --- Importazione Dinamica del Grafico ---
const DynamicPieChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data }: { data: any[] }) => {
        const COLORS = ['#ef4444', '#f97316', '#eab308'];
        return (
          <mod.ResponsiveContainer width="100%" height="100%">
            <mod.PieChart>
              <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((entry, index) => (
                  <mod.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </mod.Pie>
              <mod.Tooltip formatter={(value: number) => formatCurrency(value)} />
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
  },
);

// --- Componente Principale del Calcolatore ---
const CalculadoraCosteOkupacion: React.FC = () => {
  const { slug, title, inputs, outputs, content, costesFijos } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    tipoProcedimiento: 'civil' as 'civil' | 'penal',
    valorAlquilerMensual: 900,
    mesesOcupacion: 18,
    necesitaReparaciones: true,
    costeReparaciones: 8000,
  };

  const [states, setStates] = useState<typeof initialStates>(initialStates);

  // Normalizza input: numeri come numeri, boolean ok, select come string
  const handleStateChange = (id: keyof typeof initialStates, value: any) => {
    if (id === 'tipoProcedimiento') {
      setStates((p) => ({ ...p, tipoProcedimiento: value as 'civil' | 'penal' }));
      return;
    }
    if (id === 'necesitaReparaciones') {
      setStates((p) => ({ ...p, necesitaReparaciones: Boolean(value) }));
      return;
    }
    // numeri
    const n = toNumber(value);
    // clamp per campi specifici
    const bounded =
      id === 'mesesOcupacion' ? clamp(Math.round(n), 0, 120) :
      id === 'valorAlquilerMensual' || id === 'costeReparaciones' ? clamp(n, 0, 10_000_000) :
      n;
    setStates((p) => ({ ...p, [id]: bounded }));
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const alquiler = Number(states.valorAlquilerMensual) || 0;
    const meses = Number(states.mesesOcupacion) || 0;

    // se non servono riparazioni, costo = 0 anche se rimane un numero nello state
    const reparaciones = states.necesitaReparaciones ? (Number(states.costeReparaciones) || 0) : 0;

    // (facoltativo) differenziazione futura per tipo di procedura
    // es.: potresti aggiungere otras partidas según 'civil'/'penal'
    const costesLegales = Object.values(costesFijos).reduce((sum: number, val: any) => sum + Number(val || 0), 0);

    const lucroCesante = alquiler * meses;
    const costeReparacionesPost = reparaciones;

    const costeTotal = costesLegales + lucroCesante + costeReparacionesPost;

    return { costesLegales, lucroCesante, costeReparacionesPost, costeTotal };
  }, [states, costesFijos]);

  const chartData = useMemo(
    () =>
      [
        { name: 'Costes Legales', value: calculatedOutputs.costesLegales },
        { name: 'Lucro Cesante', value: calculatedOutputs.lucroCesante },
        { name: 'Reparaciones', value: calculatedOutputs.costeReparacionesPost },
      ].filter((item) => item.value > 0),
    [calculatedOutputs],
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
              <p className="text-gray-600 mb-4">Estima el impacto económico total de un proceso de ocupación ilegal para recuperar tu vivienda.</p>
              <div className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-md p-3 mb-6">
                <strong>Atención:</strong> Esta herramienta ofrece una estimación con fines informativos y no constituye asesoramiento legal. Los costes y plazos pueden variar significativamente.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => {
                  const show =
                    !('condition' in input) ||
                    (input as any).condition === 'necesitaReparaciones == true' ? states.necesitaReparaciones : true;
                  if (!show) return null;

                  return (
                    <div key={input.id as string}>
                      <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id as string}>
                        {input.label}
                        {'tooltip' in input && (input as any).tooltip ? (
                          <Tooltip text={(input as any).tooltip}>
                            <span className="ml-2 cursor-help"><InfoIcon /></span>
                          </Tooltip>
                        ) : null}
                      </label>

                      {input.type === 'select' ? (
                        <select
                          id={input.id as string}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                          value={states.tipoProcedimiento}
                          onChange={(e) => handleStateChange('tipoProcedimiento', e.target.value)}
                        >
                          {input.options?.map((opt: any) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : input.type === 'boolean' ? (
                        <input
                          id={input.id as string}
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600"
                          checked={states.necesitaReparaciones}
                          onChange={(e) => handleStateChange('necesitaReparaciones', e.target.checked)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            id={input.id as string}
                            aria-label={input.label}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={input.id === 'mesesOcupacion' ? 1 : 0.01}
                            value={states[input.id as keyof typeof states] as number}
                            onChange={(e) => handleStateChange(input.id as keyof typeof states, e.target.value)}
                          />
                          {(input as any).unit && <span className="text-sm text-gray-500">{(input as any).unit}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Desglose de Costes Estimados</h2>
                {calculatorData.outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between p-4 rounded-lg ${
                      output.id === 'costeTotal' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span className={`text-xl md:text-2xl font-bold ${output.id === 'costeTotal' ? 'text-red-600' : 'text-gray-800'}`}>
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
            <div className="h-64 w-full">
              {isClient && <DynamicPieChart data={chartData} />}
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Reiniciar</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía sobre la Ocupación Ilegal</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2000-323" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley de Enjuiciamiento Civil (desahucio por precario)</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Código Penal (delito de usurpación)</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCosteOkupacion;

