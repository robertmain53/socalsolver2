'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Caricamento dinamico dei grafici ---
const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend, Cell } = mod;
    return (props: any) => (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" fontSize={12} />
          <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
          <ChartTooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)} />
          <Bar dataKey="impuesto" name="IRPF a pagar">
             {props.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#fb923c'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full w-full text-gray-500">Cargando gráfico...</div> }
);

// --- Iniezione dinamica dello Schema JSON-LD ---
const SchemaInjector: React.FC<{ schema: object }> = ({ schema }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const processInlineFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code class="text-sm bg-gray-100 text-red-600 p-1 rounded">$1</code>');
  };

  const blocks = content.split('\n\n');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('* **')) {
            const title = trimmedBlock.match(/\*\*(.*?)\*\*/)?.[1] || '';
            const text = trimmedBlock.split('**: ')[1] || '';
            return(
                <div key={index} className="mt-2">
                    <strong className="text-gray-900">{title}:</strong>
                    <p className="m-0 p-0" dangerouslySetInnerHTML={{ __html: processInlineFormatting(text) }} />
                </div>
            );
        }
        if (trimmedBlock.match(/^\d\.\s/)) {
            const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
            return (
                <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
                    {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                </ol>
            );
        }
        if (trimmedBlock) {
          return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        }
        return null;
      })}
    </div>
  );
};

// --- Dati di configurazione del calcolatore (inclusi nel componente) ---
const calculatorData = {
  "slug": "simulador-estimacion-directa-modulos",
  "category": "Impuestos y trabajo autónomo",
  "title": "Simulador Conveniencia: Estimación Directa vs. Módulos",
  "lang": "es",
  "inputs": [
    { "id": "ingresosAnuales", "label": "Previsión de Ingresos Anuales Totales", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Introduce la suma de todas las facturas que prevés emitir en un año, sin IVA. Este es el dato fundamental para el cálculo en Estimación Directa." },
    { "id": "gastosAnuales", "label": "Previsión de Gastos Anuales Deducibles", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Suma todos los gastos necesarios para tu actividad: cuota de autónomos, alquiler, suministros, compras a proveedores, gestoría, etc. Son clave en Estimación Directa." },
    { "id": "rendimientoNetoModulos", "label": "Rendimiento Neto Anual por Módulos", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Este es el rendimiento que Hacienda te asigna según los indicadores de tu actividad (metros del local, empleados, etc.), no tus ingresos reales. Consulta la Orden Ministerial o a tu gestor para obtener esta cifra." }
  ],
  "outputs": [
    { "id": "impuestoDirecta", "label": "IRPF a pagar en Estimación Directa", "unit": "€" },
    { "id": "impuestoModulos", "label": "IRPF a pagar en Módulos (Est. Objetiva)", "unit": "€" },
    { "id": "diferencia", "label": "Ahorro estimado con la opción más favorable", "unit": "€" },
    { "id": "recomendacion", "label": "Régimen fiscal más conveniente", "unit": "" }
  ],
  "formulaSteps": [
    { "id": "tramosIRPF2025", "value": [
      { "hasta": 12450, "tipo": 0.19, "base": 0 },
      { "hasta": 20200, "tipo": 0.24, "base": 12450 },
      { "hasta": 35200, "tipo": 0.30, "base": 20200 },
      { "hasta": 60000, "tipo": 0.37, "base": 35200 },
      { "hasta": 300000, "tipo": 0.45, "base": 60000 },
      { "hasta": Infinity, "tipo": 0.47, "base": 300000 }
    ]}
  ],
  "content": "### **Guía Experta para Elegir tu Régimen Fiscal: ¿Estimación Directa o Módulos?**\n\nLa elección del régimen de tributación en el IRPF es una de las decisiones fiscales más importantes para un trabajador autónomo en España. Determina no solo cuánto pagarás, sino también tus obligaciones contables y registrales. Las dos grandes opciones para personas físicas son la **Estimación Directa** (en su modalidad normal o simplificada) y la **Estimación Objetiva**, popularmente conocida como **Módulos**.\n\nEste simulador está diseñado para aportar claridad, permitiéndote proyectar el impacto fiscal de cada opción según tus números. A continuación, te ofrecemos una guía detallada para que entiendas a fondo cada sistema, cumpliendo con los más altos estándares de E-E-A-T (Experiencia, Expertise, Autoridad y Confianza).\n\n**Disclaimer:** Este simulador es una herramienta orientativa. La normativa fiscal es compleja y puede variar. La decisión final debe tomarse con el asesoramiento de un gestor o asesor fiscal profesional que conozca las particularidades de tu negocio.\n\n### **Parte 1: Régimen de Estimación Directa (Pagar por lo que Ganas)**\n\nEs el régimen más común y se basa en el principio de **beneficio real**. El cálculo del rendimiento y, por tanto, del impuesto a pagar, se obtiene de la diferencia entre los ingresos computables y los gastos deducibles.\n\n`Beneficio Real = Ingresos Reales - Gastos Deducibles Reales`\n\nExisten dos modalidades:\n\n* **Estimación Directa Simplificada**: Es la más habitual para autónomos cuya cifra de negocios no supera los 600.000 € anuales. Su gran ventaja es la simplificación contable y la aplicación de una **deducción genérica del 7%** sobre el rendimiento neto positivo en concepto de \"gastos de difícil justificación\", con un máximo de 2.000 € anuales. Nuestro simulador utiliza esta modalidad para los cálculos.\n* **Estimación Directa Normal**: Obligatoria para autónomos que superan los 600.000 € de facturación anual. Exige llevar una contabilidad más rigurosa, ajustada al Código de Comercio.\n\n**Ventajas de la Estimación Directa:**\n\n* **Justicia Fiscal**: Tributas en función de tu beneficio real. Si un año tienes pérdidas o pocos beneficios, pagarás muy poco o nada.\n* **Deducción de Gastos**: Te permite deducir todos los gastos afectos a tu actividad, lo que incentiva la inversión en el negocio.\n* **Ideal para...**: Negocios que empiezan, actividades con márgenes de beneficio ajustados o aquellas que requieren una alta inversión o gastos corrientes elevados.\n\n**Desventajas:**\n\n* **Mayor Carga Administrativa**: Requiere llevar un registro detallado de ingresos, gastos y bienes de inversión.\n\n### **Parte 2: Régimen de Estimación Objetiva o Módulos (Pagar una Cifra Fija)**\n\nEl sistema de Módulos es un régimen voluntario (siempre que cumplas los requisitos) donde **no se tienen en cuenta los ingresos y gastos reales**. En su lugar, Hacienda calcula un rendimiento neto teórico para tu actividad basándose en una serie de indicadores o \"módulos\".\n\nEstos indicadores varían según la actividad y pueden ser:\n\n* Personal empleado (asalariado y no asalariado).\n* Superficie del local.\n* Potencia eléctrica contratada.\n* Mesas (en hostelería).\n* Potencia fiscal del vehículo (en transporte).\n\nEl simulador te pide directamente el \"Rendimiento Neto Anual por Módulos\" porque calcularlo desde cero es imposible sin conocer la actividad específica y los valores de cada módulo. Esta cifra es la que tu gestor te proporcionaría tras aplicar la Orden Ministerial correspondiente.\n\n**Ventajas de los Módulos:**\n\n* **Simplicidad Máxima**: Las obligaciones contables y registrales son mínimas. No es necesario guardar todas las facturas de gastos (aunque sí las de ingresos y las de inversión).\n* **Previsibilidad**: Sabes de antemano cuánto vas a pagar, lo que facilita la planificación financiera.\n* **Ideal para...**: Negocios muy estables y con alta rentabilidad (márgenes de beneficio altos y pocos gastos), como pequeños comercios, bares o taxis en zonas de mucho tránsito.\n\n**Desventajas:**\n\n* **Pagas Siempre**: Se paga la misma cuota fiscal independientemente de si has tenido un mal mes o incluso pérdidas.\n* **No Deduce Gastos Reales**: Si tienes que hacer una gran inversión o tus gastos se disparan, no verás reducido tu pago de impuestos.\n\n### **Parte 3: ¿Quién Puede Acogerse a Módulos? Límites y Exclusiones**\n\nNo todas las actividades pueden tributar por módulos. Existe una Orden Ministerial que lista las actividades permitidas (principalmente pequeños comercios, hostelería, transporte, peluquerías, etc.). Además, hay que cumplir unos **límites estrictos**:\n\n1.  **Límite de Ingresos**: No superar los **250.000 €** de ingresos anuales en el conjunto de actividades económicas.\n2.  **Límite de Facturación a Empresas**: No superar los **125.000 €** anuales de facturación a otros empresarios o profesionales.\n3.  **Límite de Compras**: No superar los **250.000 €** en compras de bienes y servicios.\n\nSi se incumple cualquiera de estos límites, se queda excluido del régimen de módulos y se debe pasar obligatoriamente a Estimación Directa.\n\n### **Conclusión: ¿Qué Te Conviene Más?**\n\nLa respuesta depende de tu **margen de beneficio**.\n\n* **Usa la Estimación Directa si...** tus gastos deducibles son altos en proporción a tus ingresos. Es decir, si tu margen de beneficio es pequeño.\n* **Usa los Módulos si...** tus gastos son muy bajos y tu margen de beneficio es muy alto. Si el rendimiento que te asigna Hacienda por los módulos es inferior a tu beneficio real, estarás ahorrando dinero.\n\nUtiliza los resultados de este simulador como un punto de partida para una conversación informada con tu asesor fiscal.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "¿Qué es la estimación directa simplificada?", "acceptedAnswer": { "@type": "Answer", "text": "La estimación directa simplificada es el régimen de IRPF más común para autónomos. El impuesto se calcula sobre el beneficio real (ingresos menos gastos). Permite una deducción adicional del 7% del beneficio como 'gastos de difícil justificación', facilitando la gestión fiscal." } }, { "@type": "Question", "name": "¿Cuándo conviene tributar por módulos (estimación objetiva)?", "acceptedAnswer": { "@type": "Answer", "text": "Conviene tributar por módulos cuando el beneficio real de tu negocio es consistentemente superior al rendimiento neto que Hacienda calcula a través de los indicadores (módulos). Es ideal para negocios con márgenes de beneficio altos y gastos controlados y bajos." } }, { "@type": "Question", "name": "¿Puedo cambiar de estimación directa a módulos?", "acceptedAnswer": { "@type": "Answer", "text": "No, una vez que se renuncia al régimen de módulos para pasar a estimación directa, o si se queda excluido por superar los límites, no se puede volver a tributar en módulos durante un período mínimo de tres años." } }, { "@type": "Question", "name": "¿Qué límites de facturación existen para estar en módulos?", "acceptedAnswer": { "@type": "Answer", "text": "Para permanecer en el régimen de módulos, un autónomo no puede superar los 250.000€ de ingresos anuales totales, ni facturar más de 125.000€ anuales a otros empresarios o profesionales." } } ] }
};

const SimuladorEstimacionDirectaModulos: React.FC = () => {
    const { slug, title, inputs, outputs, formulaSteps, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      ingresosAnuales: 50000,
      gastosAnuales: 20000,
      rendimientoNetoModulos: 25000
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);
    
    const handleStateChange = (id: string, value: any) => {
      setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = () => setStates(initialStates);

    const calculateIRPF = useCallback((base: number) => {
      const tramos = (formulaSteps.find(s => s.id === 'tramosIRPF2025')?.value as any[]) || [];
      let impuestoTotal = 0;
      let baseRestante = base;
      let baseAcumulada = 0;

      for (const tramo of tramos) {
          if (baseRestante <= 0) break;
          const limiteTramo = tramo.hasta === Infinity ? Infinity : tramo.hasta - baseAcumulada;
          const baseEnTramo = Math.min(baseRestante, limiteTramo);
          impuestoTotal += baseEnTramo * tramo.tipo;
          baseRestante -= baseEnTramo;
          baseAcumulada += limiteTramo;
      }
      return impuestoTotal;

    }, [formulaSteps]);

    const calculatedOutputs = useMemo(() => {
        const { ingresosAnuales, gastosAnuales, rendimientoNetoModulos } = states;

        // Cálculo Estimación Directa Simplificada
        const rendimientoNetoDirecta = Math.max(0, ingresosAnuales - gastosAnuales);
        const deduccion7porciento = Math.min(2000, rendimientoNetoDirecta * 0.07);
        const baseImponibleDirecta = rendimientoNetoDirecta - deduccion7porciento;
        const impuestoDirecta = calculateIRPF(baseImponibleDirecta);
        
        // Cálculo Módulos
        const baseImponibleModulos = Math.max(0, rendimientoNetoModulos);
        const impuestoModulos = calculateIRPF(baseImponibleModulos);

        const diferencia = Math.abs(impuestoDirecta - impuestoModulos);
        const recomendacion = impuestoDirecta < impuestoModulos ? "Estimación Directa" : "Módulos (Estimación Objetiva)";
        
        return {
            impuestoDirecta,
            impuestoModulos,
            diferencia,
            recomendacion,
        };
    }, [states, calculateIRPF]);

    const chartData = [
        { name: 'Est. Directa', impuesto: calculatedOutputs.impuestoDirecta },
        { name: 'Módulos', impuesto: calculatedOutputs.impuestoModulos }
    ];

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = (await import("jspdf"));
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2, windowWidth: 1200 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save(`${slug}.pdf`);
        } catch (e) { alert("No se pudo exportar a PDF."); }
    }, [slug]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <main className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Proyecta tus impuestos y descubre qué régimen fiscal te beneficia más.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                           {inputs.map(input => (
                               <div key={input.id} className="md:col-span-2">
                                   <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                     {input.label}
                                     <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                   </label>
                                   <div className="flex items-center gap-2">
                                       <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                       {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                    <div className=" -lg -md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados de la Simulación</h2>
                         <div className="space-y-4">
                            {outputs.map(output => {
                                const isRecomendacion = output.id === 'recomendacion';
                                const value = calculatedOutputs[output.id as keyof typeof calculatedOutputs];
                                const isFavorable = value === "Estimación Directa";

                                return(
                                 <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${isRecomendacion ? (isFavorable ? 'bg-indigo-50 border-indigo-500' : 'bg-orange-50 border-orange-500') : 'bg-gray-50 border-gray-300'}`}>
                                     <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                     <div className={`text-xl md:text-2xl font-bold ${isRecomendacion ? (isFavorable ? 'text-indigo-600' : 'text-orange-600') : 'text-gray-800'}`}>
                                         <span>{isClient ? (output.unit === '€' ? formatCurrency(value as number) : value) : '...'}</span>
                                     </div>
                                 </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className=" -lg -md p-6">
                       <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparativa Visual de Impuestos</h3>
                       <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                            {isClient && <DynamicBarChart data={chartData} />}
                       </div>
                    </div>
                </main>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Resetear</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guía y Metodología</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                           <li><a href="https://sede.agenciatributaria.gob.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria (AEAT)</a></li>
                           <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ley 35/2006, de 28 de noviembre, del IRPF</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default SimuladorEstimacionDirectaModulos;