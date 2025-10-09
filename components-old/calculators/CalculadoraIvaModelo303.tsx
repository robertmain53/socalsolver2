'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

// --- Placeholder for loading chart ---
const ChartLoading = () => <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-lg"><p className="text-sm text-gray-500">Cargando gráfico...</p></div>;

// --- Dynamically import chart component ---
const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
    return (props: any) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value.toLocaleString('es-ES')}`} />
                <ChartTooltip
                    cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="repercutido" name="IVA Repercutido" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="soportado" name="IVA Soportado" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}), {
    ssr: false,
    loading: () => <ChartLoading />,
});


// --- SEO Schema Injector Component ---
const SchemaInjector = ({ schema }: { schema: object }) => {
    if (!schema) return null;
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
};

// --- Tooltip Icon ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Tooltip Component ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {text}
        </div>
    </div>
);

// --- Markdown Content Renderer ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^### \*\*|\*\*$/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('* ')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4 text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Calculator Data (Self-Contained) ---
const calculatorData = { "slug": "calculadora-iva-modelo-303", "category": "Impuestos y trabajo autónomo", "title": "Calculadora de IVA trimestral (Modelo 303)", "lang": "es", "inputs": [ { "id": "ingresos_base_21", "label": "Base imponible de ingresos (21%)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Suma de las bases imponibles de todas tus facturas emitidas al tipo general del 21% durante el trimestre." }, { "id": "ingresos_base_10", "label": "Base imponible de ingresos (10%)", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Suma de las bases imponibles de tus facturas emitidas al tipo reducido del 10% (ej. hostelería, algunos alimentos)." }, { "id": "ingresos_base_4", "label": "Base imponible de ingresos (4%)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Suma de las bases imponibles de tus facturas emitidas al tipo superreducido del 4% (ej. libros, productos de primera necesidad)." }, { "id": "gastos_base_21", "label": "Base imponible de gastos deducibles (21%)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Suma de las bases imponibles de todas tus facturas de gastos deducibles (relacionados con tu actividad) al 21%." }, { "id": "gastos_base_10", "label": "Base imponible de gastos deducibles (10%)", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Suma de las bases imponibles de tus facturas de gastos deducibles al 10%." }, { "id": "gastos_base_4", "label": "Base imponible de gastos deducibles (4%)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Suma de las bases imponibles de tus facturas de gastos deducibles al 4%." }, { "id": "iva_a_compensar_previo", "label": "IVA a compensar de trimestres anteriores", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Si en la declaración anterior el resultado fue negativo, introduce aquí la cantidad a compensar (casilla 72 del Modelo 303 anterior)." } ], "outputs": [ { "id": "total_iva_repercutido", "label": "Total IVA Repercutido (Ingresos)", "unit": "€" }, { "id": "total_iva_soportado", "label": "Total IVA Soportado Deducible (Gastos)", "unit": "€" }, { "id": "resultado_final", "label": "Resultado de la autoliquidación", "unit": "€" } ], "content": "### **Guía Completa para el Cálculo del IVA Trimestral y el Modelo 303**\n\n**Domina la autoliquidación del IVA: conceptos clave, cálculo paso a paso y plazos de presentación.**\n\nEl Modelo 303 es la declaración trimestral mediante la cual autónomos y empresas liquidan el Impuesto sobre el Valor Añadido (IVA) con la Agencia Tributaria. Comprender su funcionamiento es fundamental para la salud financiera de cualquier negocio. Esta guía, junto con nuestra calculadora, tiene como objetivo desmitificar el proceso y proporcionar una herramienta precisa para la gestión de tus obligaciones fiscales.\n\nRecuerda que esta herramienta ofrece una simulación y **no sustituye el criterio de un asesor fiscal profesional**, quien puede analizar las particularidades de tu actividad.\n\n### **Parte 1: Cómo Funciona la Calculadora y los Conceptos Clave del IVA**\n\nEl cálculo del IVA trimestral se basa en un principio sencillo: la diferencia entre el IVA que cobras a tus clientes y el IVA que pagas en tus gastos de empresa.\n\n1.  **IVA Repercutido (o Devengado)**: Es el IVA que incluyes en tus facturas de venta de bienes o servicios. Actúas como un recaudador para Hacienda. Se calcula aplicando el tipo de IVA correspondiente (21%, 10% o 4%) a la base imponible de tus ingresos.\n\n2.  **IVA Soportado (o Deducible)**: Es el IVA que pagas al adquirir bienes y servicios necesarios para tu actividad profesional (ej. material de oficina, software, suministros). Este IVA es deducible, lo que significa que puedes restarlo del IVA que has recaudado.\n\nLa calculadora automatiza esta operación, permitiéndote introducir las bases imponibles (el importe antes de impuestos) de tus ingresos y gastos para obtener el resultado final de tu declaración.\n\n### **Parte 2: Desglose del Cálculo del Modelo 303**\n\nEl resultado final de la declaración se obtiene con la siguiente fórmula:\n\n`Resultado = Total IVA Repercutido - Total IVA Soportado Deducible - IVA a Compensar de periodos anteriores`\n\n#### **Tipos de IVA en España**\n* **Tipo General (21%)**: Se aplica por defecto a la mayoría de productos y servicios.\n* **Tipo Reducido (10%)**: Aplicable a ciertos sectores como hostelería, transporte de viajeros o algunos alimentos.\n* **Tipo Superreducido (4%)**: Reservado para bienes de primera necesidad como pan, leche, libros o medicamentos.\n\n#### **¿Qué gastos tienen IVA deducible?**\nPara que el IVA de un gasto sea deducible, debe cumplir tres requisitos indispensables:\n1.  Estar **directamente relacionado** con tu actividad económica.\n2.  Estar justificado con una **factura completa** y correcta (no valen tickets).\n3.  Estar **registrado en tu contabilidad** (libro de gastos e inversiones).\n\n### **Parte 3: Interpretando el Resultado de tu Declaración**\n\nEl resultado final de la calculadora puede tener tres interpretaciones:\n\n* **Resultado Positivo (> 0): A Ingresar**: Has recaudado más IVA del que has pagado. Debes ingresar esa diferencia a la Agencia Tributaria.\n* **Resultado Negativo (< 0): A Compensar**: Has pagado más IVA del que has recaudado. Puedes solicitar que ese saldo negativo se reste del resultado de las siguientes declaraciones del mismo año.\n* **Resultado Negativo (4º Trimestre): A Devolver o A Compensar**: Si el resultado del último trimestre es negativo, tienes dos opciones: solicitar la devolución de ese importe a Hacienda o seguir compensándolo en el siguiente ejercicio.\n\n### **Parte 4: Plazos de Presentación del Modelo 303**\n\nLa presentación del Modelo 303 es trimestral. Es crucial cumplir con los plazos para evitar sanciones.\n\n* **Primer Trimestre** (Enero, Febrero, Marzo): Del 1 al 20 de abril.\n* **Segundo Trimestre** (Abril, Mayo, Junio): Del 1 al 20 de julio.\n* **Tercer Trimestre** (Julio, Agosto, Septiembre): Del 1 al 20 de octubre.\n* **Cuarto Trimestre** (Octubre, Noviembre, Diciembre): Del 1 al 30 de enero del año siguiente.\n\nAdemás, en enero también se presenta el **Modelo 390**, que es el resumen anual informativo de todas las operaciones de IVA del año anterior.", "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "¿Qué es el Modelo 303 y para qué sirve?", "acceptedAnswer": { "@type": "Answer", "text": "El Modelo 303 es el formulario oficial de la Agencia Tributaria que utilizan autónomos y empresas en España para declarar y liquidar el IVA de forma trimestral. Sirve para calcular la diferencia entre el IVA cobrado en las ventas (repercutido) y el IVA pagado en las compras y gastos (soportado) y, en consecuencia, determinar si se debe pagar a Hacienda, solicitar una devolución o dejar un saldo a compensar." } }, { "@type": "Question", "name": "¿Cómo se calcula el IVA trimestral a pagar?", "acceptedAnswer": { "@type": "Answer", "text": "El cálculo es una resta: (Total del IVA de tus facturas de ingresos) - (Total del IVA deducible de tus facturas de gastos). Si el resultado es positivo, esa es la cantidad a ingresar. Si es negativo, es una cantidad que puedes compensar en futuros trimestres." } }, { "@type": "Question", "name": "¿Qué gastos puedo deducirme en el IVA?", "acceptedAnswer": { "@type": "Answer", "text": "Puedes deducir el IVA de los gastos que estén directamente y exclusivamente relacionados con tu actividad económica. Debes tener una factura completa a tu nombre que justifique el gasto, y este debe estar registrado en tu contabilidad. Gastos personales o no justificados con factura no son deducibles." } }, { "@type": "Question", "name": "¿Cuándo se presenta el Modelo 303?", "acceptedAnswer": { "@type": "Answer", "text": "El Modelo 303 se presenta trimestralmente. Los plazos son: Primer trimestre hasta el 20 de abril, segundo trimestre hasta el 20 de julio, tercer trimestre hasta el 20 de octubre, y cuarto trimestre hasta el 30 de enero del año siguiente." } } ] } };

// Main Component
const CalculadoraIvaModelo303: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        ingresos_base_21: 5000, ingresos_base_10: 0, ingresos_base_4: 0,
        gastos_base_21: 1200, gastos_base_10: 0, gastos_base_4: 0,
        iva_a_compensar_previo: 0
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { ingresos_base_21, ingresos_base_10, ingresos_base_4, gastos_base_21, gastos_base_10, gastos_base_4, iva_a_compensar_previo } = states;
        const total_iva_repercutido = (ingresos_base_21 * 0.21) + (ingresos_base_10 * 0.10) + (ingresos_base_4 * 0.04);
        const total_iva_soportado = (gastos_base_21 * 0.21) + (gastos_base_10 * 0.10) + (gastos_base_4 * 0.04);
        const resultado_final = total_iva_repercutido - total_iva_soportado - iva_a_compensar_previo;
        return { total_iva_repercutido, total_iva_soportado, resultado_final };
    }, [states]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
    
    const chartData = [{ name: 'IVA', repercutido: calculatedOutputs.total_iva_repercutido, soportado: calculatedOutputs.total_iva_soportado }];
    const formulaUsada = `Resultado = IVA Repercutido - IVA Soportado - IVA a Compensar`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) { alert("Error al generar el PDF."); }
    }, [slug]);

    const saveResult = useCallback(() => {
        try {
            const result = { slug, title, inputs: states, outputs: calculatedOutputs, date: new Date().toISOString() };
            const history = JSON.parse(localStorage.getItem('calculator_history') || '[]');
            history.unshift(result);
            localStorage.setItem('calculator_history', JSON.stringify(history.slice(0, 10)));
            alert("Resultado guardado en el historial local de su navegador.");
        } catch { alert("No se pudo guardar el resultado."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-md">
                        <div ref={calculatorRef} className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                            <p className="text-gray-600 mb-4">Calcula el resultado de tu autoliquidación de IVA trimestral de forma rápida y sencilla.</p>
                            
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 my-6">
                                <strong>Disclaimer:</strong> Esta calculadora es una herramienta de simulación y no reemplaza el asesoramiento de un profesional fiscal. Los resultados son orientativos.
                            </div>
                            
                            {/* Inputs Sections */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">IVA Repercutido (Tus Ingresos)</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {inputs.slice(0, 3).map(input => (
                                            <div key={input.id}>
                                                <label htmlFor={input.id} className="block text-sm font-medium mb-1 text-gray-700 flex items-center">{input.label} <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                                <div className="relative"><input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-7" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">{input.unit}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">IVA Soportado (Tus Gastos Deducibles)</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {inputs.slice(3, 6).map(input => (
                                            <div key={input.id}>
                                                <label htmlFor={input.id} className="block text-sm font-medium mb-1 text-gray-700 flex items-center">{input.label} <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                                <div className="relative"><input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-7" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">{input.unit}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Ajustes y Compensaciones</h2>
                                    <div className="max-w-xs">
                                        <label htmlFor={inputs[6].id} className="block text-sm font-medium mb-1 text-gray-700 flex items-center">{inputs[6].label} <Tooltip text={inputs[6].tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                        <div className="relative"><input id={inputs[6].id} type="number" min={inputs[6].min} step={inputs[6].step} value={states[inputs[6].id]} onChange={(e) => handleStateChange(inputs[6].id, e.target.value === "" ? 0 : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-7" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">{inputs[6].unit}</span></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Outputs */}
                            <div className="mt-8 space-y-3">
                                <h2 className="text-xl font-semibold text-gray-800">Resultados del Trimestre</h2>
                                <div className="flex items-baseline justify-between bg-gray-50 p-3 rounded-md">
                                    <p className="font-medium text-gray-700">{outputs[0].label}</p><p className="font-bold text-lg text-gray-800">{isClient ? formatCurrency(calculatedOutputs.total_iva_repercutido) : '...'}</p>
                                </div>
                                <div className="flex items-baseline justify-between bg-gray-50 p-3 rounded-md">
                                    <p className="font-medium text-gray-700">{outputs[1].label}</p><p className="font-bold text-lg text-gray-800">{isClient ? formatCurrency(calculatedOutputs.total_iva_soportado) : '...'}</p>
                                </div>
                                <div className={`p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between ${calculatedOutputs.resultado_final >= 0 ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-50 border-l-4 border-green-500'}`}>
                                    <div>
                                        <p className="font-bold text-lg">{outputs[2].label}</p>
                                        <p className={`text-sm font-semibold ${calculatedOutputs.resultado_final >= 0 ? 'text-red-700' : 'text-green-700'}`}>{calculatedOutputs.resultado_final >= 0 ? "A INGRESAR" : "A COMPENSAR O DEVOLVER"}</p>
                                    </div>
                                    <p className={`font-bold text-3xl ${calculatedOutputs.resultado_final >= 0 ? 'text-red-600' : 'text-green-600'}`}>{isClient ? formatCurrency(Math.abs(calculatedOutputs.resultado_final)) : '...'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-b-lg border-t"><p className="text-xs text-center text-gray-600 font-mono tracking-wider">{formulaUsada}</p></div>
                    </div>
                    {/* Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Visualización del IVA</h3>
                        <p className="text-sm text-gray-500 mb-4">Compara el total de IVA que has cobrado frente al que has pagado.</p>
                        <div className="h-64 w-full">{isClient && <DynamicBarChart data={chartData} />}</div>
                    </div>
                </div>
                {/* Sidebar Column */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={saveResult} className="w-full text-sm font-medium text-center border border-indigo-600 text-indigo-600 rounded-md px-3 py-2 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar Resultado</button>
                            <button onClick={handleExportPDF} className="w-full text-sm font-medium text-center border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar a PDF</button>
                            <button onClick={handleReset} className="w-full text-sm font-medium text-center border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reiniciar</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-6 bg-white shadow-md">
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-6 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Fuentes y Referencias Oficiales</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G414.shtml" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria: Modelo 303</a></li>
                            <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ley 37/1992, de 28 de diciembre, del IVA</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraIvaModelo303;