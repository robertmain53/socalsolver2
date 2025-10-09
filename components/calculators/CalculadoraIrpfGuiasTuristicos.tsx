'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Icona e Tooltip ---

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
  slug: "calculadora-irpf-guias-turisticos",
  category: "Impuestos y trabajo autonomo",
  title: "Calculadora de IRPF para guías turísticos autónomos",
  lang: "es",
  tags: "calculadora irpf guia turistico, impuestos guia freelance, modelo 130, iva guias turisticos, gastos deducibles guia, autonomo turismo, fiscalidad guias",
  inputs: [
    { id: "ingresosTrimestrales", label: "Ingresos trimestrales (sin IVA)", type: "number" as const, unit: "€", min: 0, step: 100, tooltip: "Introduce el total de la base imponible de tus servicios (tours, visitas, etc.) facturados en el trimestre." },
    { id: "gastosDeducibles", label: "Gastos deducibles del trimestre", type: "number" as const, unit: "€", min: 0, step: 50, tooltip: "Suma los gastos de tu actividad: transporte, entradas a monumentos, marketing, seguros, gestoría, etc." },
    { id: "porcentajeRetencion", label: "Tipo de retención IRPF (si aplica)", type: "select" as const, options: [{ value: 15, label: "15% (General)" }, { value: 7, label: "7% (Nuevos autónomos)" }], tooltip: "Aplica retención solo si facturas a una agencia de viajes o empresa, no a turistas particulares." },
    { id: "ingresosConRetencion", label: "Ingresos con retención (de agencias)", type: "number" as const, unit: "€", min: 0, step: 100, tooltip: "Introduce aquí solo los ingresos de agencias de viajes u otras empresas que te hayan practicado retención." }
  ],
  outputs: [
    { id: "rendimientoNeto", label: "Rendimiento Neto (Beneficio)", unit: "€" },
    { id: "pagoAdelantado20", label: "Pago a cuenta (20% sobre beneficio)", unit: "€" },
    { id: "retencionesPracticadas", label: "Retenciones ya adelantadas (por agencias)", unit: "€" },
    { id: "resultadoModelo130", label: "Resultado a pagar (Modelo 130)", unit: "€" }
  ],
  content: `### Introducción: Tu Ruta Fiscal, Clara y Sencilla

Como guía turístico autónomo, tu oficina es la calle, la historia es tu producto y tu pasión es conectar a la gente con la cultura. La gestión fiscal no debería ser un laberinto... (testo invariato)

### Guía de Uso del Calculador

* **Ingresos trimestrales (sin IVA)**: ...
* **Gastos deducibles del trimestre**: ...
* **Tipo de retención IRPF (si aplica)**: ...
* **Ingresos con retención (de agencias)**: ...

### Metodología de Cálculo Explicada

1.  **Cálculo del Beneficio (Rendimiento Neto)**: \`Ingresos - Gastos Deducibles\`.
2.  **Cálculo del Pago a Cuenta**: \`Beneficio * 20%\`.
3.  **Resta de Retenciones**: ...
4.  **Resultado Final**: ...

### Análisis Profundo: Fiscalidad para Guías Turísticos

#### **El IVA en tus Servicios: La Regla General del 21%**
...
#### **Gastos Deducibles Clave en tu Profesión**
...

### Preguntas Frecuentes (FAQ)
`,
  // FAQPage esistente
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Tengo que cobrar IVA por mis tours?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Por regla general, los servicios prestados por guías turísticos en España están sujetos al tipo general de IVA, que es del 21%..." } },
      { "@type": "Question", "name": "Si hago un 'free tour' y recibo propinas, ¿cómo lo declaro?", "acceptedAnswer": { "@type": "Answer", "text": "Las propinas ... deben sumarse a tus ingresos trimestrales..." } },
      { "@type": "Question", "name": "¿Puedo deducir una comida con un colaborador o agente de viajes?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, con límites y correcta justificación..." } }
    ]
  }
} as const;

// --- SEO Schemas extra (WebPage + Article con speakable) ---
const SeoSchemas = ({ headline }: { headline: string }) => {
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": headline,
    "description": "Calculadora de IRPF para guías turísticos autónomos: estima pago trimestral Modelo 130 con retenciones y gastos deducibles.",
    "inLanguage": "es",
    "isPartOf": { "@type": "Website", "name": "Calculadoras Autónomos" },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["article h1", "#faq h3"]
    }
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "inLanguage": "es",
    "author": { "@type": "Organization", "name": "Calculadoras Autónomos" },
    "publisher": { "@type": "Organization", "name": "Calculadoras Autónomos" },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["article h1", "#faq h3"]
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
    </>
  );
};

const FaqSchema = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }}
  />
);

// --- Content renderer (markdown-lite) ---
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

// --- Utils (sanitizzazione & formattazione) ---
const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const clamp = (v: number, min = 0, max = Number.POSITIVE_INFINITY) => Math.min(Math.max(v, min), max);
const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(toNum(value));

// --- Grafico (dynamic, ssr:false) ---
const DynamicChart = dynamic(() => import('recharts').then(mod => {
  const ChartComponent = ({ data, formatCurrency, totalIncome }: { data: any[]; formatCurrency: (v: number) => string; totalIncome: number }) => (
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
  return ChartComponent;
}), { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div> });

// --- Component ---

const CalculadoraIrpfGuiasTuristicos: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const initialStates = {
    ingresosTrimestrales: 6500,
    gastosDeducibles: 1200,
    porcentajeRetencion: 15,
    ingresosConRetencion: 2000
  };

  // supporta '' durante la digitazione; calcolo sempre con numeri
  const [states, setStates] = useState<Record<string, number | ''>>(initialStates);

  useEffect(() => { setIsClient(true); }, []);

  // ===== Querystring <-> Stato =====
  const QS_KEYS = ["ingresosTrimestrales", "gastosDeducibles", "porcentajeRetencion", "ingresosConRetencion"] as const;

  // parse da URL on mount
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const next: Record<string, number | ''> = { ...states };
      let changed = false;
      QS_KEYS.forEach(k => {
        const val = url.searchParams.get(k);
        if (val !== null) {
          const n = Number(val);
          if (!Number.isNaN(n)) {
            next[k] = n;
            changed = true;
          }
        }
      });
      if (changed) setStates(next);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce update
  useEffect(() => {
    const handle = setTimeout(() => {
      try {
        const url = new URL(window.location.href);
        QS_KEYS.forEach(k => {
          const v = states[k];
          const n = v === '' ? '' : String(v);
          if (n === '') url.searchParams.delete(k);
          else url.searchParams.set(k, n);
        });
        window.history.replaceState({}, '', url.toString());
      } catch {}
    }, 300);
    return () => clearTimeout(handle);
  }, [states]);

  const handleStateChange = (id: string, value: string | number) => {
    setStates(prev => ({ ...prev, [id]: value === '' ? '' : Number(value) }));
  };

  const setPreset = (pct: 7 | 15) => {
    setStates(prev => ({ ...prev, porcentajeRetencion: pct }));
  };

  const handleReset = () => setStates(initialStates);

  // ===== Calcoli =====
  const calc = useMemo(() => {
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

    // Impuestos realmente adelantados en el trimestre
    const impuestosTotales = Math.max(0, resultadoModelo130) + retencionesPracticadas;

    // Coerenza stacked: Gastos + Impuestos + Beneficio = Ingresos
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
  } = calc;

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
      {/* Schemi SEO */}
      <FaqSchema />
      <SeoSchemas headline={title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <article className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Estima tu IRPF trimestral (Modelo 130) y gestiona las finanzas de tu actividad turística.</p>
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Aviso Importante:</strong> Esta calculadora es para autónomos en el régimen de <strong>estimación directa</strong>. Consulta con un asesor si crees que podrías pertenecer al régimen de módulos.
              </div>

              {/* Preset ritenuta */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-gray-700">Presets retención:</span>
                <button
                  type="button"
                  onClick={() => setPreset(7)}
                  className={`text-xs px-2 py-1 rounded border ${porcentajeRetencion === 7 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  7% Nuevos autónomos
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(15)}
                  className={`text-xs px-2 py-1 rounded border ${porcentajeRetencion === 15 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  15% General
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => (
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

                    {input.id === 'ingresosConRetencion' && (
                      <p className="text-xs mt-1">
                        {errors.ingresosConRetencion ? <span className="text-red-600">{errors.ingresosConRetencion}</span> : null}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del Cálculo</h2>
                {outputs.map(output => (
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
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose Visual de tus Ingresos</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient ? (
                    <DynamicChart
                      data={chartData}
                      formatCurrency={formatCurrency}
                      totalIncome={ingresosTrimestrales}
                    />
                  ) : <div>Cargando gráfico...</div>}
                </div>
              </div>

              {/* Blocco FAQ visibile (per speakable selectors) */}
              <section id="faq" className="mt-10">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Preguntas Frecuentes (FAQ)</h2>
                <div className="space-y-3">
                  <h3 className="faq-question font-medium text-gray-800">¿Tengo que cobrar IVA por mis tours?</h3>
                  <p className="text-gray-700 text-sm">Por regla general, sí: tipo general del 21% en España, salvo regímenes específicos del sector.</p>
                  <h3 className="faq-question font-medium text-gray-800">Si hago un “free tour” y recibo propinas, ¿cómo lo declaro?</h3>
                  <p className="text-gray-700 text-sm">Como ingresos de actividad económica; regístralas y declara en IRPF e IVA según proceda.</p>
                  <h3 className="faq-question font-medium text-gray-800">¿Puedo deducir una comida con un colaborador?</h3>
                  <p className="text-gray-700 text-sm">Sí, como gasto de representación con límites y justificación documental adecuada.</p>
                </div>
              </section>
            </div>
          </article>
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
            <h2 className="font-semibold mb-3 text-gray-800">Guía Fiscal para Guías Turísticos</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-8-actividades-economicas-estimacion-directa/pagos-fraccionados-estimacion-directa/obligacion-presentar-pago-fraccionado.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Modelo 130</a></li>
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/iva-2023/capitulo-8-tipos-impositivos/tipos-impositivos-general.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Tipos impositivos de IVA</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfGuiasTuristicos;
