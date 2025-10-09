'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tooltip as ChartTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

// --- DATOS DE CONFIGURACIÓN DEL CALCULADOR (INCRUSTADOS) ---
const calculatorData = {
  "slug": "calculadora-gastos-deducibles-autonomos",
  "category": "Impuestos y trabajo autónomo",
  "title": "Calculadora de Gastos Deducibles para Autónomos",
  "description": "Estima tu IRPF y beneficio neto anual calculando tus gastos deducibles según la normativa fiscal española.",
  "lang": "es",
  "inputs": [
    { "id": "ingresos_anuales_brutos", "label": "Ingresos Anuales Brutos", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Introduce el total de ingresos facturados durante el año, antes de aplicar cualquier gasto, IVA o retención de IRPF." },
    { "id": "cuota_autonomos_mensual", "label": "Cuota de Autónomos Mensual", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "La cuota mensual que pagas a la Seguridad Social. Es uno de los gastos deducibles más importantes." },
    { "id": "consumos_explotacion", "label": "Consumos de Explotación", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Compra de mercancías, materias primas y otros materiales necesarios para generar tus ingresos." },
    { "id": "alquileres_canones", "label": "Alquiler de Oficina o Local", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Coste anual del alquiler de tu espacio de trabajo (oficina, local, taller, espacio de coworking)." },
    { "id": "suministros", "label": "Suministros (Luz, Agua, Internet)", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Gastos de electricidad, agua, gas, telefonía e internet. Si trabajas desde casa, la ley permite deducir el 30% de la parte proporcional de la vivienda afecta a la actividad." },
    { "id": "servicios_profesionales", "label": "Servicios de Profesionales Independientes", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Honorarios pagados a gestores, abogados, auditores, notarios, etc." },
    { "id": "marketing_publicidad", "label": "Marketing y Publicidad", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Inversión en anuncios online (Google Ads, redes sociales), creación de contenido, diseño de folletos, etc." },
    { "id": "seguros_salud", "label": "Seguro de Salud", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Las primas de seguro de enfermedad para ti, tu cónyuge e hijos menores de 25 que convivan contigo. Límite: 500€ por persona al año (1.500€ con discapacidad)." },
    { "id": "otros_gastos", "label": "Otros Gastos Deducibles", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Incluye otros gastos fiscalmente deducibles como software, transporte, dietas (con límites), formación relacionada con la actividad, etc." },
    { "id": "estimacion_directa_simplificada", "label": "Aplicar deducción por gastos de difícil justificación", "type": "boolean" as const, "tooltip": "Si tributas en el régimen de Estimación Directa Simplificada, puedes deducir un 7% adicional (anteriormente 5%) sobre el rendimiento neto previo, con un límite máximo de 2.000€ anuales." }
  ],
  "outputs": [
    { "id": "total_gastos_deducibles", "label": "Total Gastos Deducibles", "unit": "€" },
    { "id": "base_imponible", "label": "Rendimiento Neto (Base Imponible)", "unit": "€" },
    { "id": "cuota_irpf_estimada", "label": "Cuota IRPF Estimada", "unit": "€" },
    { "id": "beneficio_neto_final", "label": "Beneficio Neto Anual (Después de IRPF)", "unit": "€" }
  ],
  "content": "### **Guía Definitiva sobre Gastos Deducibles para Autónomos en España**\n\nComprender y aplicar correctamente los gastos deducibles es fundamental para la salud financiera de cualquier trabajador autónomo. Una gestión adecuada no solo optimiza tu carga fiscal, sino que también te proporciona una visión clara de la rentabilidad real de tu negocio. Esta calculadora está diseñada para ofrecerte una estimación precisa, pero también para ser una herramienta educativa que te ayude a tomar mejores decisiones financieras.\n\n**El principio de oro: ¿Qué hace que un gasto sea deducible?**\n\nPara que la Agencia Tributaria acepte un gasto como deducible en el cálculo de tu IRPF, este debe cumplir simultáneamente tres requisitos indispensables:\n\n1.  **Afectación a la actividad**: El gasto debe estar directamente y exclusivamente relacionado con tu actividad económica. No puede ser un gasto personal o privado.\n2.  **Justificación documental**: Debes poseer una factura completa y formal a tu nombre que respalde el gasto. Los tickets o albaranes no suelen ser suficientes.\n3.  **Registro contable**: El gasto debe estar debidamente registrado en tu libro de gastos e inversiones.\n\n### **Desglose de los Gastos Deducibles más Comunes**\n\n#### **1. Cotizaciones a la Seguridad Social (Cuota de Autónomos)**\n\nEs el gasto deducible por excelencia. La totalidad de las cuotas mensuales pagadas al Régimen Especial de Trabajadores Autónomos (RETA) es 100% deducible.\n\n#### **2. Consumos de Explotación**\n\nSe refiere a la compra de bienes necesarios para tu proceso productivo. Incluye materias primas, mercancías, envases, material de oficina, etc.\n\n#### **3. Alquileres y Suministros**\n\n* **Local u Oficina**: Si alquilas un espacio dedicado exclusivamente a tu actividad, el alquiler y los gastos asociados (comunidad, IBI si lo pagas tú) son deducibles.\n* **Trabajo desde casa**: Si trabajas desde tu vivienda habitual, puedes deducir los gastos de suministros (agua, luz, gas, internet). La ley establece que puedes deducir el **30% de la proporción de la vivienda que utilizas para tu actividad**. Por ejemplo, si tu casa mide 100 m² y usas una habitación de 20 m² (el 20%), podrás deducir el 30% de ese 20% del total de tus facturas de suministros.\n\n#### **4. Servicios de Profesionales Independientes**\n\nLos honorarios pagados a otros profesionales por servicios prestados a tu actividad son deducibles. Esto incluye a tu gestor, abogados, consultores de marketing, diseñadores web, etc.\n\n#### **5. Marketing y Publicidad**\n\nToda inversión destinada a promocionar tu negocio es deducible: campañas en Google Ads o redes sociales, servicios de SEO, impresión de tarjetas de visita o folletos, etc.\n\n#### **6. Seguros de Salud**\n\nPuedes deducir las primas de tu seguro de salud, así como las de tu cónyuge e hijos menores de 25 años que convivan contigo y no tengan ingresos superiores a un límite. El máximo deducible es de **500 € por persona al año** (1.500 € en caso de discapacidad).\n\n#### **7. Gastos de Difícil Justificación (Régimen de Estimación Directa Simplificada)**\n\nSi tu facturación no supera los 600.000 € anuales, lo más probable es que tributes en este régimen. La ley te permite una deducción genérica del **7% sobre tu rendimiento neto previo**, con un límite máximo absoluto de **2.000 € anuales**. Esta deducción busca compensar gastos de difícil justificación documental, como el transporte urbano o pequeñas compras.\n\n### **Fiscalidad: Del Rendimiento Neto al Beneficio Final**\n\n* **Rendimiento Neto (Base Imponible)**: Es la cifra que resulta de restar todos tus gastos deducibles a tus ingresos brutos. Esta es la cantidad sobre la que se calculará el impuesto.\n* **Cuota de IRPF**: El Impuesto sobre la Renta de las Personas Físicas (IRPF) es un impuesto progresivo. Esto significa que pagas un porcentaje mayor cuanto más ganas. Se aplica por tramos sobre tu base imponible.\n* **Beneficio Neto Final**: Es el dinero que realmente te queda después de pagar todos los gastos de tu actividad y el IRPF correspondiente.\n\n\n",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "¿Qué es un gasto deducible para un autónomo?", "acceptedAnswer": { "@type": "Answer", "text": "Un gasto deducible es aquel que está directamente relacionado con la actividad económica del autónomo, se puede justificar con una factura oficial y está registrado en la contabilidad. Deducir estos gastos permite reducir la base imponible y, por tanto, pagar menos IRPF." } }, { "@type": "Question", "name": "¿Puedo deducir los gastos del coche si soy autónomo?", "acceptedAnswer": { "@type": "Answer", "text": "La deducción de los gastos del vehículo (compra, combustible, reparaciones) es compleja. Para deducir el 100%, la Agencia Tributaria exige que el vehículo se utilice EXCLUSIVAMENTE para la actividad profesional, algo que solo se suele aceptar para agentes comerciales, transportistas, taxistas, etc. Para el resto de profesionales, la deducción es muy difícil de justificar." } }, { "@type": "Question", "name": "¿Cómo se calculan los gastos de mi oficina en casa?", "acceptedAnswer": { "@type": "Answer", "text": "Para los suministros (luz, agua, internet, gas) de tu vivienda habitual, puedes deducir el porcentaje resultante de aplicar el 30% a la proporción de tu vivienda destinada a la actividad. Por ejemplo, si usas un 15% de tu casa para trabajar, puedes deducir el 30% de ese 15% del total de las facturas." } }, { "@type": "Question", "name": "Esta calculadora sustituye a un asesor fiscal?", "acceptedAnswer": { "@type": "Answer", "text": "No. Esta herramienta proporciona una estimación muy útil para la planificación financiera, pero no reemplaza el consejo personalizado de un asesor fiscal profesional, quien puede analizar las particularidades de tu caso y garantizar el cumplimiento de todas las normativas vigentes." } } ] }
};

// --- COMPONENTES AUXILIARES ---

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {text}
        </div>
    </div>
);

const SchemaInjector = ({ schema }: { schema: object }) => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
);

const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('####')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/####\s*/, '')) }} />;
                }
                if (trimmedBlock.match(/^\d\.\s/)) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                    return (
                        <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ol>
                    );
                }
                if (trimmedBlock.startsWith('*')) {
                     const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                     return (
                         <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                         </ul>
                     );
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DEL CALCULADOR ---

const CalculadoraGastosDeduciblesAutonomos: React.FC = () => {
    const { slug, title, description, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialInputs = {
        ingresos_anuales_brutos: 65000,
        cuota_autonomos_mensual: 320,
        consumos_explotacion: 4500,
        alquileres_canones: 7200,
        suministros: 1800,
        servicios_profesionales: 1500,
        marketing_publicidad: 2500,
        seguros_salud: 500,
        otros_gastos: 3000,
        estimacion_directa_simplificada: true
    };
    const [inputValues, setInputValues] = useState<{[key: string]: any}>(initialInputs);

    const handleInputChange = (id: string, value: any) => {
        setInputValues(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => {
        setInputValues(initialInputs);
    };

    const calculatedOutputs = useMemo(() => {
        const {
            ingresos_anuales_brutos, cuota_autonomos_mensual, consumos_explotacion,
            alquileres_canones, suministros, servicios_profesionales,
            marketing_publicidad, seguros_salud, otros_gastos,
            estimacion_directa_simplificada
        } = inputValues;

        const cuota_autonomos_anual = cuota_autonomos_mensual * 12;
        const gastos_operativos = consumos_explotacion + alquileres_canones + suministros + servicios_profesionales + marketing_publicidad + seguros_salud + otros_gastos;
        const rendimiento_neto_previo = ingresos_anuales_brutos - (cuota_autonomos_anual + gastos_operativos);
        const gastos_dificil_justificacion = estimacion_directa_simplificada ? Math.max(0, Math.min(2000, rendimiento_neto_previo * 0.07)) : 0;
        const total_gastos_deducibles = cuota_autonomos_anual + gastos_operativos + gastos_dificil_justificacion;
        const base_imponible = Math.max(0, ingresos_anuales_brutos - total_gastos_deducibles);
        
        const calculateIRPF = (base: number) => {
            const tramos = [
                { limite: 12450, tipo: 0.19 },
                { limite: 20200, tipo: 0.24 },
                { limite: 35200, tipo: 0.30 },
                { limite: 60000, tipo: 0.37 },
                { limite: 300000, tipo: 0.45 },
                { limite: Infinity, tipo: 0.47 },
            ];
            let impuesto = 0;
            let baseRestante = base;
            let limiteAnterior = 0;

            for (const tramo of tramos) {
                if (baseRestante > 0) {
                    const baseEnTramo = Math.min(baseRestante, tramo.limite - limiteAnterior);
                    impuesto += baseEnTramo * tramo.tipo;
                    baseRestante -= baseEnTramo;
                    limiteAnterior = tramo.limite;
                }
            }
            return impuesto;
        };
        
        const cuota_irpf_estimada = calculateIRPF(base_imponible);
        const beneficio_neto_final = base_imponible - cuota_irpf_estimada;
        
        return {
            total_gastos_deducibles,
            base_imponible,
            cuota_irpf_estimada,
            beneficio_neto_final,
            cuota_autonomos_anual,
            gastos_operativos,
            gastos_dificil_justificacion
        };
    }, [inputValues]);

    const chartData = [
        { name: 'Cuota Autónomos', value: calculatedOutputs.cuota_autonomos_anual },
        { name: 'Alquiler', value: inputValues.alquileres_canones },
        { name: 'Suministros', value: inputValues.suministros },
        { name: 'Servicios Profesionales', value: inputValues.servicios_profesionales },
        { name: 'Marketing', value: inputValues.marketing_publicidad },
        { name: 'Otros Gastos', value: inputValues.consumos_explotacion + inputValues.seguros_salud + inputValues.otros_gastos },
        { name: 'Difícil Justificación', value: calculatedOutputs.gastos_dificil_justificacion },
    ].filter(item => item.value > 0);
    const chartColors = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff'];

    const formulaUsada = `Beneficio Neto = Ingresos Brutos - Total Gastos Deducibles - IRPF(Ingresos Brutos - Total Gastos Deducibles)`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("La función PDF no está disponible en este entorno."); }
    }, [slug]);

    const saveResult = useCallback(() => {
        try {
            const { cuota_autonomos_anual, gastos_operativos, gastos_dificil_justificacion, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: inputValues, outputs: outputsToSave, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("¡Resultado guardado con éxito!");
        } catch { alert("No se pudo guardar el resultado."); }
    }, [inputValues, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">{description}</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Aviso legal:</strong> Esta herramienta ofrece una simulación con fines informativos. Los cálculos se basan en los tramos de IRPF generales y no sustituyen el asesoramiento de un profesional fiscal.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border mt-2">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={inputValues[input.id]} onChange={(e) => handleInputChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-10 py-2" type="number" min={input.min} step={input.step} value={inputValues[input.id]} onChange={(e) => handleInputChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados Estimados</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'beneficio_neto_final' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                                    <span className={`text-xl md:text-2xl font-bold ${output.id === 'beneficio_neto_final' ? 'text-green-700' : 'text-gray-900'}`}>
                                        {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Desglose de Gastos Deducibles</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                 {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                 ))}
                                            </Pie>
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Fórmula de Cálculo Simplificada</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsada}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Resetear</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guía de Comprensión</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-8-rendimientos-actividades-economicas/metodo-estimacion-directa/gastos-fiscalmente-deducibles.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Gastos fiscalmente deducibles</a></li>
                            <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 35/2006, de 28 de noviembre, del IRPF</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraGastosDeduciblesAutonomos;