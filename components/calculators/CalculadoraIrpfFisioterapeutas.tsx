'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Componenti di Utilità ---

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Self-Contained ---
const calculatorData = { 
  "slug": "calculadora-irpf-fisioterapeutas",
  "category": "Impuestos y trabajo autonomo",
  "title": "Calculadora de IRPF para fisioterapeutas autónomos",
  "lang": "es",
  "tags": "calculadora irpf fisioterapeuta, impuestos fisioterapeuta, modelo 130 fisio, iva fisioterapia, exencion iva sanidad, autonomo fisioterapeuta, colegio fisioterapeutas",
  "inputs": [
    { "id": "ingresosTrimestrales", "label": "Ingresos trimestrales (exentos de IVA)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Introduce el total facturado por tus servicios sanitarios (sesiones, tratamientos, etc.), que están exentos de IVA." },
    { "id": "gastosDeducibles", "label": "Gastos deducibles del trimestre", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Suma los gastos de tu actividad: alquiler de clínica, material fungible, seguros, cuota colegial, formación, etc." },
    { "id": "porcentajeRetencion", "label": "Tipo de retención IRPF (si aplica)", "type": "select" as const, "options": [{ "value": 15, "label": "15% (General)" }, { "value": 7, "label": "7% (Nuevos autónomos)" }], "tooltip": "Aplica retención solo si facturas a una empresa (mutua, club deportivo, hospital), no a pacientes particulares." },
    { "id": "ingresosConRetencion", "label": "Ingresos con retención (de empresas)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Introduce aquí solo los ingresos de empresas o mutuas que te hayan practicado retención. Los ingresos de pacientes particulares son 0€ en este campo." }
  ],
  "outputs": [
    { "id": "rendimientoNeto", "label": "Rendimiento Neto (Beneficio)", "unit": "€" },
    { "id": "pagoAdelantado20", "label": "Pago a cuenta (20% sobre beneficio)", "unit": "€" },
    { "id": "retencionesPracticadas", "label": "Retenciones ya adelantadas (por empresas)", "unit": "€" },
    { "id": "resultadoModelo130", "label": "Resultado a pagar (Modelo 130)", "unit": "€" }
  ],
  "content": "### Introducción: La Salud Fiscal de tu Profesión\n\nComo fisioterapeuta autónomo, tu prioridad es la salud y el bienestar de tus pacientes. La gestión fiscal, sin embargo, no debe ser un punto doloroso. Esta calculadora está diseñada específicamente para profesionales de la fisioterapia en España, ayudándote a estimar tu pago trimestral de IRPF (Modelo 130) de forma clara y sencilla.\n\n### Guía de Uso del Calculador\n\n* **Ingresos trimestrales (exentos de IVA)**: Suma todos los importes de tus servicios sanitarios (exentos de IVA).\n* **Gastos deducibles del trimestre**: Alquiler de clínica, material fungible, seguros, cuota colegial, formación, etc.\n* **Tipo de retención IRPF (si aplica)**: Solo si facturas a empresas (mutuas, clubes, hospitales). No aplica a pacientes particulares.\n* **Ingresos con retención (de empresas)**: Solo las facturas a empresas con retención practicada.\n\n### Metodología de Cálculo\n\n1. **Beneficio (Rendimiento Neto)** = `Ingresos - Gastos`.\n2. **Pago fraccionado** = `Beneficio × 20%`.\n3. **Resta de retenciones** = Pago fraccionado - Retenciones practicadas.\n4. **Resultado**: Si es negativo, lo compensas en la Renta anual.\n\n### Claves Fiscales\n\n**Exención de IVA (Art. 20.Uno.3º LIVA)**: Los servicios sanitarios de fisioterapia están exentos de IVA. No presentas 303, y el IVA soportado en compras no es deducible (se integra como mayor gasto en IRPF).\n\n### Preguntas Frecuentes (FAQ)\n\n**1. ¿Debo añadir IVA a mis facturas?** No, están exentas por tratarse de asistencia sanitaria.\n\n**2. ¿Puedo deducir el IVA soportado?** No; el total de la compra (base + IVA) es mayor gasto deducible en IRPF.\n\n**3. ¿La cuota colegial es deducible?** Sí, al 100% cuando es obligatoria para ejercer.\n",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Debo añadir IVA a mis facturas de fisioterapia?", "acceptedAnswer": { "@type": "Answer", "text": "No. Los servicios de fisioterapia son asistencia sanitaria y están exentos de IVA." } },
      { "@type": "Question", "name": "Si no cobro IVA, ¿puedo deducir el IVA de mis compras?", "acceptedAnswer": { "@type": "Answer", "text": "No. Al ser actividad exenta, el IVA soportado no es deducible; el total se registra como mayor gasto en IRPF." } },
      { "@type": "Question", "name": "¿La cuota del Colegio de Fisioterapeutas es deducible?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, es un gasto deducible al 100% cuando la colegiación es obligatoria para ejercer." } }
    ]
  }
} as const;

// --- SEO extra: WebPage + Article con speakable ---
const SeoSchemas = ({ headline }: { headline: string }) => {
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": headline,
    "inLanguage": "es",
    "description": "Calculadora de IRPF para fisioterapeutas autónomos: estima el pago trimestral del Modelo 130 con retenciones y gastos deducibles.",
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["article h1", "#faq .faq-item h3"] }
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "inLanguage": "es",
    "author": { "@type": "Organization", "name": "Calculadoras Autónomos" },
    "publisher": { "@type": "Organization", "name": "Calculadoras Autónomos" },
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["article h1", "#faq .faq-item h3"] }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
    </>
  );
};

const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

// --- Content Renderer ---
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

// --- Importazione Dinamica del Grafico ---
const DynamicChart = dynamic(() => import('recharts').then(mod => {
  const ChartComponent = ({ data, formatCurrency, totalIncome }: { data: any[], formatCurrency: (value: number) => string, totalIncome: number }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.BarChart data={data} layout="vertical" barSize={60}>
        <mod.XAxis type="number" hide />
        <mod.YAxis type="category" dataKey="name" hide />
        <mod.Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)} (${totalIncome > 0 ? ((value / totalIncome) * 100).toFixed(1) : 0}%)`, name]} />
        <mod.Legend wrapperStyle={{fontSize: '12px'}} />
        <mod.Bar dataKey="Gastos" stackId="a" fill="#fca5a5" name="Gastos Deducibles" />
        <mod.Bar dataKey="Impuestos" stackId="a" fill="#fdba74" name="Impuestos (Retenciones + Mod. 130)" />
        <mod.Bar dataKey="Beneficio" stackId="a" fill="#86efac" name="Beneficio Neto Final" />
      </mod.BarChart>
    </mod.ResponsiveContainer>
  );
  return ChartComponent;
}), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div>
});

// --- Componente Principale ---

const CalculadoraIrpfFisioterapeutas: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates: Record<string, number> = {
    ingresosTrimestrales: 8500,
    gastosDeducibles: 2500,
    porcentajeRetencion: 15,
    ingresosConRetencion: 1500,
  };
  const [states, setStates] = useState<Record<string, number>>(initialStates);

  const handleStateChange = (id: string, value: string | number) => {
    setStates(prev => ({ ...prev, [id]: value === '' ? 0 : Number(value) }));
  };
  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const { ingresosTrimestrales, gastosDeducibles, porcentajeRetencion } = states;
    let ingresosConRetencion = states.ingresosConRetencion;

    const errors: Record<string, string> = {};
    if (ingresosConRetencion > ingresosTrimestrales) {
      errors.ingresosConRetencion = 'No puede superar los ingresos trimestrales.';
      ingresosConRetencion = ingresosTrimestrales; // clamp per coerenza
    }

    const rendimientoNeto = Math.max(0, ingresosTrimestrales - gastosDeducibles);
    const pagoAdelantado20 = rendimientoNeto * 0.20;
    const retencionesPracticadas = ingresosConRetencion * (porcentajeRetencion / 100);
    const resultadoModelo130 = pagoAdelantado20 - retencionesPracticadas;
    const impuestosTotales = Math.max(0, resultadoModelo130) + retencionesPracticadas;
    const beneficioNetoFinal = rendimientoNeto - Math.max(0, resultadoModelo130);
    
    return { rendimientoNeto, pagoAdelantado20, retencionesPracticadas, resultadoModelo130, impuestosTotales, beneficioNetoFinal, errors };
  }, [states]);

  const chartData = useMemo(() => [{
    name: 'Desglose',
    Gastos: states.gastosDeducibles,
    Impuestos: calculatedOutputs.impuestosTotales,
    Beneficio: calculatedOutputs.beneficioNetoFinal,
  }], [states.gastosDeducibles, calculatedOutputs.impuestosTotales, calculatedOutputs.beneficioNetoFinal]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

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
    } catch (e) { alert('Error al exportar a PDF.'); }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const { impuestosTotales, beneficioNetoFinal, errors, ...outputsToSave } = calculatedOutputs as any;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      alert('Resultado guardado con éxito!');
    } catch { alert('No se pudo guardar el resultado.'); }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema />
      <SeoSchemas headline={title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <article className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Estima tu IRPF trimestral (Modelo 130) y gestiona la fiscalidad de tu práctica sanitaria.</p>
              <div className="text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-md p-3 mb-6">
                <strong>Consejo Clave:</strong> Como profesional sanitario, tus servicios de fisioterapia están <strong>exentos de IVA</strong>.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {calculatorData.inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                    </label>
                    {input.type === 'select' ? (
                      <select
                        id={input.id}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        value={states[input.id]}
                        onChange={e => handleStateChange(input.id, e.target.value)}
                      >
                        {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          type="number"
                          min={input.min}
                          step={input.step}
                          value={states[input.id]}
                          onChange={e => handleStateChange(input.id, e.target.value)}
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    )}
                    {input.id === 'ingresosConRetencion' && (calculatedOutputs as any).errors?.ingresosConRetencion && (
                      <p className="text-xs mt-1 text-red-600">{(calculatedOutputs as any).errors.ingresosConRetencion}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del Cálculo</h2>
                {calculatorData.outputs.map(output => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'resultadoModelo130' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span className={`text-xl md:text-2xl font-bold ${output.id === 'resultadoModelo130' ? 'text-indigo-600' : 'text-gray-800'}`}>
                      {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                    </span>
                  </div>
                ))}

                {/* Avviso esplicito se el resultado es negativo */}
                {(calculatedOutputs as any).resultadoModelo130 < 0 && (
                  <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-md p-3">
                    <strong>Resultado a tu favor:</strong> Has adelantado más IRPF del debido este trimestre. No pagarás ahora; se compensará como saldo a tu favor en la declaración de la Renta anual.
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose Visual de tus Ingresos</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && <DynamicChart data={chartData} formatCurrency={formatCurrency} totalIncome={states.ingresosTrimestrales} />}
                </div>
              </div>

              {/* Mini FAQ visibile per i selettori speakable */}
              <section id="faq" className="mt-10">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Preguntas Frecuentes (FAQ)</h2>
                <div className="space-y-4">
                  <div className="faq-item">
                    <h3 className="font-medium text-gray-800">¿Debo añadir IVA a mis facturas de fisioterapia?</h3>
                    <p className="text-gray-700 text-sm">No, están exentas al tratarse de servicios de asistencia sanitaria (art. 20 LIVA).</p>
                  </div>
                  <div className="faq-item">
                    <h3 className="font-medium text-gray-800">Si no cobro IVA, ¿puedo deducir el IVA de mis compras?</h3>
                    <p className="text-gray-700 text-sm">No; el total pagado (base + IVA) se contabiliza como mayor gasto deducible en IRPF.</p>
                  </div>
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
            <h2 className="font-semibold mb-3 text-gray-800">Guía Fiscal para Fisioterapeutas</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/iva-2023/capitulo-6-exenciones-operaciones-interiores/exenciones-servicios-asistencia-sanitaria.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Exenciones de IVA en Servicios Sanitarios</a></li>
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-8-actividades-economicas-estimacion-directa/pagos-fraccionados-estimacion-directa/obligacion-presentar-pago-fraccionado.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Modelo 130</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfFisioterapeutas;
