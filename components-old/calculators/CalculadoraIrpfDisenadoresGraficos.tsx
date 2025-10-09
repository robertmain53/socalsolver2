'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Icona / Tooltip ---------------------------------------------------------
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

// --- Dati self-contained ------------------------------------------------------
const calculatorData = {
  slug: "calculadora-irpf-disenadores-graficos",
  category: "Impuestos y trabajo autonomo",
  title: "Calculadora de IRPF para diseñadores gráficos autónomos",
  lang: "es",
  tags: "calculadora irpf diseñador, impuestos freelance, modelo 130 diseñador, iva diseño grafico, gastos deducibles diseñador, retencion irpf, autonomo diseñador grafico",
  inputs: [
    { id: "ingresosTrimestrales", label: "Ingresos trimestrales (sin IVA)", type: "number" as const, unit: "€", min: 0, step: 100, tooltip: "Introduce la suma de las bases imponibles de todos tus proyectos del trimestre: branding, UI/UX, diseño web, etc." },
    { id: "gastosDeducibles", label: "Gastos deducibles del trimestre (sin IVA)", type: "number" as const, unit: "€", min: 0, step: 50, tooltip: "Suma todos los gastos de tu actividad: Adobe CC, Figma, fuentes, hosting, gestoría, amortización de hardware, etc." },
    { id: "porcentajeRetencion", label: "Tipo de retención IRPF aplicada", type: "select" as const, options: [{ value: 15, label: "15% (General)" }, { value: 7, label: "7% (Nuevos autónomos)" }], tooltip: "Elige el % de IRPF que aplicas en facturas a empresas o profesionales en España. No aplica si tu cliente es un particular." },
    { id: "ingresosConRetencion", label: "Ingresos con retención en el trimestre", type: "number" as const, unit: "€", min: 0, step: 100, tooltip: "Indica qué parte de tus ingresos trimestrales provenían de facturas a empresas que incluían retención de IRPF." }
  ],
  outputs: [
    { id: "rendimientoNeto", label: "Rendimiento Neto (Beneficio)", unit: "€" },
    { id: "pagoAdelantado20", label: "Pago a cuenta (20% sobre beneficio)", unit: "€" },
    { id: "retencionesPracticadas", label: "Retenciones ya adelantadas en facturas", unit: "€" },
    { id: "resultadoModelo130", label: "Resultado a pagar (Modelo 130)", unit: "€" }
  ],
  content: `### Introducción: Tu Lienzo Fiscal, en Orden
(…contenuto invariato, omesso qui per brevità…)`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Puedo deducir la compra de mi nuevo MacBook Pro?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, pero no como un gasto directo..." } },
      { "@type": "Question", "name": "Mi suscripción a la suite de Adobe, ¿es deducible?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutamente. Es un gasto 100% necesario..." } },
      { "@type": "Question", "name": "Si vendo un logo a una empresa en EE. UU., ¿la factura lleva IRPF o IVA?", "acceptedAnswer": { "@type": "Answer", "text": "No lleva retención de IRPF ... Modelo 303." } }
    ]
  }
} as const;

// --- JSON-LD FAQ (UNICA definizione) -----------------------------------------
const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

// --- Markdown renderer semplice ----------------------------------------------
const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
      }
      if (paragraph.startsWith('#### ')) {
        return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
        return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{listItems}</ul>;
      }
      return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });
  };
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

// --- Utils -------------------------------------------------------------------
const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const clamp = (v: number, min = 0, max = Number.POSITIVE_INFINITY) => Math.min(Math.max(v, min), max);
const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(toNum(value));

// --- Grafico (dynamic, ssr:false). NIENTE simboli “nudi” ---------------------
const DynamicChart = dynamic(async () => {
  const mod = await import('recharts');
  const Chart = ({ data, totalIncome, formatCurrency }: { data: any[]; totalIncome: number; formatCurrency: (v: number) => string }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.BarChart data={data} layout="vertical" barSize={60}>
        <mod.XAxis type="number" hide />
        <mod.YAxis type="category" dataKey="name" hide />
        <mod.Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)}${totalIncome > 0 ? ` (${((value / totalIncome) * 100).toFixed(1)}%)` : ''}`, name]} />
        <mod.Legend wrapperStyle={{ fontSize: '12px' }} />
        <mod.Bar dataKey="Gastos" stackId="a" name="Gastos Deducibles" />
        <mod.Bar dataKey="Impuestos" stackId="a" name="Impuestos (Retenciones + Mod. 130)" />
        <mod.Bar dataKey="Beneficio" stackId="a" name="Beneficio Neto Final" />
      </mod.BarChart>
    </mod.ResponsiveContainer>
  );
  return Chart;
}, { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div> });

// --- Componente principale ----------------------------------------------------
const CalculadoraIrpfDisenadoresGraficos: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    ingresosTrimestrales: 9500,
    gastosDeducibles: 2500,
    porcentajeRetencion: 15,
    ingresosConRetencion: 8000
  };

  // consenti '' nel form, ma calcola con 0
  const [states, setStates] = useState<Record<string, number | ''>>(initialStates);

  const handleStateChange = (id: string, value: string | number) => {
    setStates(prev => ({ ...prev, [id]: value === '' ? '' : Number(value) }));
  };

  const handleReset = () => setStates(initialStates);

  const {
    ingresosTrimestrales,
    gastosDeducibles,
    porcentajeRetencion,
    ingresosConRetencion,
    rendimientoNeto,
    pagoAdelantado20,
    retencionesPracticadas,
    resultadoModelo130,
    impuestosTotales,
    beneficioNetoFinal,
    errors
  } = useMemo(() => {
    const errors: Record<string, string> = {};

    const ingresos = clamp(toNum(states.ingresosTrimestrales));
    const gastos = clamp(toNum(states.gastosDeducibles));
    const ret = clamp(toNum(states.porcentajeRetencion), 0, 100);
    let conret = clamp(toNum(states.ingresosConRetencion));

    if (conret > ingresos) {
      errors.ingresosConRetencion = 'No puede superar los ingresos totales';
      conret = ingresos;
    }

    const rendimientoNeto = Math.max(0, ingresos - gastos);
    const pagoAdelantado20 = rendimientoNeto * 0.20;
    const retencionesPracticadas = conret * (ret / 100);
    const resultadoModelo130 = pagoAdelantado20 - retencionesPracticadas;
    const impuestosTotales = Math.max(0, resultadoModelo130) + retencionesPracticadas;
    const beneficioNetoFinal = ingresos - gastos - impuestosTotales;

    return {
      ingresosTrimestrales: ingresos,
      gastosDeducibles: gastos,
      porcentajeRetencion: ret,
      ingresosConRetencion: conret,
      rendimientoNeto,
      pagoAdelantado20,
      retencionesPracticadas,
      resultadoModelo130,
      impuestosTotales,
      beneficioNetoFinal,
      errors
    };
  }, [states]);

  const chartData = useMemo(() => ([
    { name: 'Desglose', Gastos: gastosDeducibles, Impuestos: impuestosTotales, Beneficio: beneficioNetoFinal }
  ]), [gastosDeducibles, impuestosTotales, beneficioNetoFinal]);

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
      const payload = {
        slug,
        title,
        inputs: { ingresosTrimestrales, gastosDeducibles, porcentajeRetencion, ingresosConRetencion },
        outputs: { rendimientoNeto, pagoAdelantado20, retencionesPracticadas, resultadoModelo130 },
        ts: Date.now()
      };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      alert('Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [slug, title, ingresosTrimestrales, gastosDeducibles, porcentajeRetencion, ingresosConRetencion, rendimientoNeto, pagoAdelantado20, retencionesPracticadas, resultadoModelo130]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Calcula tu pago trimestral de IRPF (Modelo 130) y toma el control de tus finanzas.</p>
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Aviso Legal:</strong> Esta es una herramienta de simulación con fines informativos. No reemplaza el asesoramiento de un profesional fiscal.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {calculatorData.inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {(input as any).tooltip && (
                        <Tooltip text={(input as any).tooltip}>
                          <span className="ml-2 cursor-help"><InfoIcon /></span>
                        </Tooltip>
                      )}
                    </label>

                    {input.type === 'select' ? (
                      <select
                        id={input.id}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        value={states[input.id] as number | ''}
                        onChange={e => handleStateChange(input.id, Number(e.target.value))}
                      >
                        {(input.options ?? []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          type="number"
                          min={(input as any).min}
                          step={(input as any).step}
                          value={states[input.id] as number | ''}
                          onChange={e => handleStateChange(input.id, e.target.value)}
                        />
                        {(input as any).unit && <span className="text-sm text-gray-500">{(input as any).unit}</span>}
                      </div>
                    )}

                    {input.id === 'ingresosConRetencion' && (errors.ingresosConRetencion) && (
                      <p className="text-xs text-red-600 mt-1">{errors.ingresosConRetencion}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del Cálculo</h2>
                {calculatorData.outputs.map(output => (
                  <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'resultadoModelo130' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span className={`text-xl md:text-2xl font-bold ${output.id === 'resultadoModelo130' ? 'text-indigo-600' : 'text-gray-800'}`}>
                      {isClient ? formatCurrency(
                        (output.id === 'rendimientoNeto' && rendimientoNeto) ||
                        (output.id === 'pagoAdelantado20' && pagoAdelantado20) ||
                        (output.id === 'retencionesPracticadas' && retencionesPracticadas) ||
                        (output.id === 'resultadoModelo130' && resultadoModelo130) || 0
                      ) : '...'}
                    </span>
                  </div>
                ))}

                {isClient && resultadoModelo130 < 0 && (
                  <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-md p-3">
                    <strong>Resultado a tu favor:</strong> Has adelantado más IRPF del que te corresponde. Este importe se regularizará en tu declaración de la Renta anual.
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose Visual de tus Ingresos</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient ? (
                    <DynamicChart data={chartData} formatCurrency={formatCurrency} totalIncome={ingresosTrimestrales} />
                  ) : (
                    <div>Cargando gráfico...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reiniciar</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía Fiscal para Diseñadores</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-8-actividades-economicas-estimacion-directa/pagos-fraccionados-estimacion-directa/obligacion-presentar-pago-fraccionado.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Modelo 130</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 35/2006, del IRPF</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfDisenadoresGraficos;
