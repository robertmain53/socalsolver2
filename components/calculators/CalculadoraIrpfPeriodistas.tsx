'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useSearchParams, useRouter } from 'next/navigation';

// =====================
// Config base
// =====================
const SITE_ORIGIN = 'https://socalsolver.com';
const LOCALE = 'es-ES';
const PATHNAME = '/es/calculadora-irpf-periodistas'; // <-- aggiorna se la rotta è diversa

const calculatorData = {
  slug: 'calculadora-irpf-periodistas',
  title: 'Calculadora de IRPF para periodistas y redactores autónomos',
  description:
    'Calcula el pago trimestral del IRPF (Modelo 130) para periodistas autónomos. Incluye retenciones 7%/15%, validaciones y exportación a PDF pro-forma.',
  keywords:
    'calculadora irpf, irpf autonomos, modelo 130, impuestos periodistas, redactor freelance, retencion irpf 7%, retencion irpf 15%',
  inputs: [
    { id: 'ingresosTrimestrales', label: 'Ingresos trimestrales (sin IVA)', type: 'number' as const, unit: '€', min: 0, step: 100, tooltip: 'Total base imponible facturas emitidas en el trimestre.' },
    { id: 'gastosDeducibles', label: 'Gastos deducibles (sin IVA)', type: 'number' as const, unit: '€', min: 0, step: 50, tooltip: 'Cuota autónomos, gestoría, software, material, etc.' },
    { id: 'porcentajeRetencion', label: 'Retención IRPF', type: 'select' as const, options: [{ value: 15, label: '15% (General)' }, { value: 7, label: '7% (Nuevos autónomos)' }], tooltip: 'Tipo de retención aplicado en facturas.' },
    { id: 'ingresosConRetencion', label: 'Ingresos con retención', type: 'number' as const, unit: '€', min: 0, step: 100, tooltip: 'Parte de los ingresos con IRPF retenido.' }
  ],
  outputs: [
    { id: 'rendimientoNeto', label: 'Rendimiento Neto', unit: '€' },
    { id: 'pagoAdelantado20', label: '20% sobre Rendimiento Neto', unit: '€' },
    { id: 'retencionesPracticadas', label: 'Retenciones practicadas', unit: '€' },
    { id: 'resultadoModelo130', label: 'Resultado Modelo 130', unit: '€' }
  ],
  faq: [
    {
      q: '¿Qué pasa si el resultado del Modelo 130 es negativo?',
      a: 'Si tus retenciones superan el 20% de tu beneficio, el resultado será negativo. No pagas ese trimestre; se regulariza en tu Renta anual.'
    },
    {
      q: '¿Esta calculadora incluye el IVA?',
      a: 'No, se centra en IRPF (Modelo 130). El IVA se liquida aparte con el Modelo 303.'
    },
    {
      q: '¿Las facturas a clientes extranjeros llevan retención de IRPF?',
      a: 'No. Solo llevan retención las facturas a empresas/profesionales con sede fiscal en España.'
    }
  ]
} as const;

// =====================
// UI helpers
// =====================
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="text-gray-400">
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

// =====================
// Utils & dynamic chart
// =====================
const toNum = (v: any) => (isNaN(Number(v)) ? 0 : Number(v));
const clamp = (v: number, min = 0, max = Infinity) => Math.min(Math.max(v, min), max);
const formatCurrency = (value: number) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' }).format(value);

const DynamicBars = dynamic(async () => {
  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } = await import('recharts');
  const Chart = ({ data, formatter }: { data: any[]; formatter: (v: number) => string }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip formatter={(v: number) => formatter(v)} />
        <Legend />
        <Bar dataKey="Gastos" stackId="a" name="Gastos Deducibles" />
        <Bar dataKey="Impuestos" stackId="a" name="Impuestos (Ret+130)" />
        <Bar dataKey="Beneficio" stackId="a" name="Beneficio Neto" />
      </BarChart>
    </ResponsiveContainer>
  );
  return Chart;
}, { ssr: false });

// =====================
// JSON-LD builders
// =====================
const buildCanonical = () => `${SITE_ORIGIN}${PATHNAME}`;

const SoftwareAppJsonLd = (canonical: string) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: calculatorData.title,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  url: canonical,
  inLanguage: LOCALE,
  description: calculatorData.description,
  keywords: calculatorData.keywords
});

const FaqPageJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: calculatorData.faq.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a }
  }))
});

const BreadcrumbJsonLd = (canonical: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_ORIGIN}/es/` },
    { '@type': 'ListItem', position: 2, name: 'Impuestos y trabajo autónomo', item: `${SITE_ORIGIN}/es/impuestos-trabajo-autonomo` },
    { '@type': 'ListItem', position: 3, name: calculatorData.title, item: canonical }
  ]
});

const OrganizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SoCalSolver',
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/favicon-512x512.png`
});

// WebPage / Article con speakable
const WebPageJsonLd = (canonical: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  url: canonical,
  name: calculatorData.title,
  inLanguage: LOCALE,
  description: calculatorData.description,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'section[aria-label="FAQ"] li']
  }
});

const ArticleJsonLd = (canonical: string, datePublishedISO: string, dateModifiedISO: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: calculatorData.title,
  description: calculatorData.description,
  mainEntityOfPage: canonical,
  inLanguage: LOCALE,
  author: { '@type': 'Organization', name: 'SoCalSolver' },
  publisher: {
    '@type': 'Organization',
    name: 'SoCalSolver',
    logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/favicon-512x512.png` }
  },
  datePublished: datePublishedISO,
  dateModified: dateModifiedISO,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'section[aria-label="FAQ"] li']
  }
});

// =====================
// Props
// =====================
interface CalculadoraProps {
  datePublishedISO: string;  // es. "2025-08-01"
  dateModifiedISO: string;   // es. "2025-08-29T10:30:00Z"
}

// =====================
// Component
// =====================
const CalculadoraIrpfPeriodistas: React.FC<CalculadoraProps> = ({ datePublishedISO, dateModifiedISO }) => {
  const { slug, title, description, inputs, outputs } = calculatorData;
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // iniziali (o da querystring)
  const initialStates = {
    ingresosTrimestrales: toNum(searchParams.get('ingresos')) || 6000,
    gastosDeducibles: toNum(searchParams.get('gastos')) || 1200,
    porcentajeRetencion: toNum(searchParams.get('ret')) || 15,
    ingresosConRetencion: toNum(searchParams.get('conret')) || 5000,
    cliente: '',
    proveedor: '',
    periodo: '',
    fecha: ''
  };

  const [states, setStates] = useState(initialStates);

  useEffect(() => { setIsClient(true); }, []);

  // sync querystring (solo i param calc)
  useEffect(() => {
    const q = new URLSearchParams({
      ingresos: String(states.ingresosTrimestrales),
      gastos: String(states.gastosDeducibles),
      ret: String(states.porcentajeRetencion),
      conret: String(states.ingresosConRetencion)
    });
    router.replace(`?${q.toString()}`);
  }, [states.ingresosTrimestrales, states.gastosDeducibles, states.porcentajeRetencion, states.ingresosConRetencion, router]);

  const {
    rendimientoNeto,
    pagoAdelantado20,
    retencionesPracticadas,
    risultato130, // alias interno per chiarezza
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
    const pagoAdelantado20 = rendimientoNeto * 0.2;
    const retencionesPracticadas = conret * (ret / 100);
    const resultadoModelo130 = pagoAdelantado20 - retencionesPracticadas;
    const pagoEfectivo = Math.max(0, resultadoModelo130);
    const beneficioNetoFinal = rendimientoNeto - pagoEfectivo;

    return {
      rendimientoNeto,
      pagoAdelantado20,
      retencionesPracticadas,
      risultato130: resultadoModelo130,
      beneficioNetoFinal,
      errors
    };
  }, [states]);

  const chartData = [
    { name: 'Trimestre', Gastos: states.gastosDeducibles, Impuestos: Math.max(0, risultato130) + retencionesPracticadas, Beneficio: beneficioNetoFinal }
  ];

  // Export PDF pro-forma
  const handleExportPDF = useCallback(async () => {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

    pdf.setFontSize(14);
    pdf.text(`Cliente: ${states.cliente || '-'}`, 40, 40);
    pdf.text(`Proveedor: ${states.proveedor || '-'}`, 40, 60);
    pdf.text(`Periodo: ${states.periodo || '-'}`, 40, 80);
    pdf.text(`Fecha: ${states.fecha || '-'}`, 40, 100);

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 120, pdfWidth, pdfHeight - 120);
    pdf.save(`${slug}.pdf`);
  }, [slug, states]);

  const setPreset = (ret: number) => setStates(s => ({ ...s, porcentajeRetencion: ret }));

  // Canonical e JSON-LD
  const canonical = buildCanonical();

  return (
    <>
      <Head>
        <title>{title} | SoCalSolver</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={calculatorData.keywords} />
        <link rel="canonical" href={canonical} />
        {/* hreflang base */}
        <link rel="alternate" hrefLang="es" href={canonical} />
        <link rel="alternate" hrefLang="x-default" href={canonical} />
        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={LOCALE} />
        <meta property="og:site_name" content="SoCalSolver" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | SoCalSolver`} />
        <meta name="twitter:description" content={description} />
        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SoftwareAppJsonLd(canonical)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FaqPageJsonLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BreadcrumbJsonLd(canonical)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(OrganizationJsonLd()) }} />
        {/* WebPage / Article con speakable (date da props CMS) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WebPageJsonLd(canonical)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ArticleJsonLd(canonical, datePublishedISO, dateModifiedISO)) }} />
        {/* Robots-safe defaults */}
        <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
      </Head>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={ref}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
              <p className="text-gray-600 mb-4">Estima tu pago trimestral de IRPF (Modelo 130). URL compartible, validaciones y exportación a PDF.</p>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setPreset(7)} className="px-3 py-1 text-sm bg-amber-100 rounded">Preset 7%</button>
                <button onClick={() => setPreset(15)} className="px-3 py-1 text-sm bg-indigo-100 rounded">Preset 15%</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {calculatorData.inputs.map(input => {
                  const inputLabel = (
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {(input as any).tooltip && (
                        <Tooltip text={(input as any).tooltip}>
                          <span className="ml-2 cursor-help"><InfoIcon /></span>
                        </Tooltip>
                      )}
                    </label>
                  );

                  if (input.type === 'select') {
                    return (
                      <div key={input.id}>
                        {inputLabel}
                        <select
                          id={input.id}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          value={(states as any)[input.id]}
                          onChange={(e) => setStates(s => ({ ...s, [input.id]: Number(e.target.value) }))}
                        >
                          {input.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={input.id}>
                      {inputLabel}
                      <input
                        id={input.id}
                        type="number"
                        min={(input as any).min}
                        step={(input as any).step}
                        value={(states as any)[input.id]}
                        onChange={(e) => setStates(s => ({ ...s, [input.id]: e.target.value === '' ? '' : Number(e.target.value) }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      />
                      {/* Validazioni inline */}
                      {input.id === 'ingresosConRetencion' && states.ingresosConRetencion > states.ingresosTrimestrales && (
                        <p className="text-xs text-red-600 mt-1">No puede superar los ingresos totales</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dati pro-forma */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                {['cliente', 'proveedor', 'periodo', 'fecha'].map((f) => (
                  <input
                    key={f}
                    placeholder={f}
                    value={(states as any)[f]}
                    onChange={(e) => setStates(s => ({ ...s, [f]: e.target.value }))}
                    className="border rounded px-2 py-1 text-sm"
                  />
                ))}
              </div>

              {/* Risultati */}
              <div className="mt-8 space-y-4">
                {calculatorData.outputs.map(o => (
                  <div
                    key={o.id}
                    className={`flex justify-between border-l-4 p-4 rounded ${o.id === 'resultadoModelo130' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}
                  >
                    <span className="text-gray-700">{o.label}</span>
                    <span className={`font-bold ${o.id === 'resultadoModelo130' ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {isClient ? formatCurrency(
                        (o.id === 'rendimientoNeto' && rendimientoNeto) ||
                        (o.id === 'pagoAdelantado20' && pagoAdelantado20) ||
                        (o.id === 'retencionesPracticadas' && retencionesPracticadas) ||
                        (o.id === 'resultadoModelo130' && risultato130) || 0
                      ) : '...'}
                    </span>
                  </div>
                ))}
                {risultato130 < 0 && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
                    Resultado negativo: has adelantado más de lo debido. Se regularizará en la Renta anual.
                  </div>
                )}
              </div>

              {/* Grafico */}
              <div className="mt-8 h-64 bg-gray-50 p-2 rounded">
                {isClient ? <DynamicBars data={chartData} formatter={formatCurrency} /> : <div>Cargando gráfico…</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3">Acciones</h2>
            <div className="grid gap-2">
              <button onClick={handleExportPDF} className="px-3 py-2 border rounded hover:bg-gray-100">Exportar PDF Pro-forma</button>
              <button onClick={() => setStates(initialStates)} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Reiniciar</button>
            </div>
          </section>

          <section className="border rounded p-4 bg-white shadow-md" aria-label="FAQ">
            <h2 className="font-semibold mb-2">FAQ</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              {calculatorData.faq.map((f, i) => (
                <li key={i}><strong>{f.q}</strong><br />{f.a}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfPeriodistas;
