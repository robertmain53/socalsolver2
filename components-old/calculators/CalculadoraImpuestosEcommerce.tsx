'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- DATA FROM JSON ---
const calculatorData = {"slug":"calculadora-impuestos-ecommerce","category":"Impuestos y trabajo autónomo","title":"Calculadora de Impuestos para un e-commerce en España","lang":"es","inputs":[{"id":"ingresos_trimestrales","label":"Ingresos del Trimestre (sin IVA)","type":"number","unit":"€","min":0,"step":100,"tooltip":"Introduce la suma de las bases imponibles de todas las facturas emitidas en el trimestre."},{"id":"gastos_deducibles","label":"Gastos Deducibles del Trimestre (sin IVA)","type":"number","unit":"€","min":0,"step":50,"tooltip":"Suma las bases imponibles de todos los gastos de tu actividad: proveedores, software, marketing, gestoría, etc."},{"id":"tipo_iva_repercutido","label":"Tipo de IVA Aplicado en Ventas","type":"number","unit":"%","min":0,"step":1,"tooltip":"El tipo general en España es del 21%. Introduce el porcentaje de IVA que cobras a tus clientes."},{"id":"tipo_iva_soportado_promedio","label":"Tipo de IVA Pagado en Gastos (Promedio)","type":"number","unit":"%","min":0,"step":1,"tooltip":"El tipo general para la mayoría de gastos profesionales es del 21%. Ajústalo si tienes gastos con tipos diferentes."},{"id":"en_recargo_equivalencia","label":"¿Estás en el Régimen de Recargo de Equivalencia?","type":"boolean","tooltip":"Márcalo si eres comerciante minorista (persona física) que vende al cliente final sin transformar los productos. Esto cambia radicalmente el cálculo del IVA."}],"outputs":[{"id":"resultado_iva","label":"Resultado IVA Trimestral (Mod. 303)","unit":"€"},{"id":"pago_fraccionado_irpf","label":"Pago a Cuenta IRPF (Mod. 130)","unit":"€"},{"id":"total_impuestos_trimestre","label":"Total Impuestos a Pagar este Trimestre","unit":"€"},{"id":"beneficio_neto","label":"Beneficio Neto Trimestral (Después de Impuestos)","unit":"€"}],"formulaSteps":[{"id":"iva_repercutido","expr":"ingresos_trimestrales * (tipo_iva_repercutido / 100)"},{"id":"iva_soportado","expr":"gastos_deducibles * (tipo_iva_soportado_promedio / 100)"},{"id":"resultado_iva","expr":"en_recargo_equivalencia ? 0 : iva_repercutido - iva_soportado"},{"id":"base_imponible_irpf","expr":"ingresos_trimestrales - gastos_deducibles"},{"id":"pago_fraccionado_irpf","expr":"base_imponible_irpf > 0 ? base_imponible_irpf * 0.20 : 0"},{"id":"total_impuestos_trimestre","expr":"(resultado_iva > 0 ? resultado_iva : 0) + pago_fraccionado_irpf"},{"id":"beneficio_neto","expr":"base_imponible_irpf - pago_fraccionado_irpf"}],"examples":[{"description":"E-commerce de servicios digitales (Régimen General)","inputs":{"ingresos_trimestrales":15000,"gastos_deducibles":4000,"tipo_iva_repercutido":21,"tipo_iva_soportado_promedio":21,"en_recargo_equivalencia":false},"outputs":{"resultado_iva":2310,"pago_fraccionado_irpf":2200,"total_impuestos_trimestre":4510,"beneficio_neto":8800}},{"description":"E-commerce de reventa de productos (Recargo Equivalencia)","inputs":{"ingresos_trimestrales":25000,"gastos_deducibles":16000,"tipo_iva_repercutido":21,"tipo_iva_soportado_promedio":21,"en_recargo_equivalencia":true},"outputs":{"resultado_iva":0,"pago_fraccionado_irpf":1800,"total_impuestos_trimestre":1800,"beneficio_neto":7200}}],"tags":"calculadora impuestos ecommerce, iva autonomo, irpf autonomo, modelo 303, modelo 130, recargo de equivalencia, españa, hacienda, agencia tributaria","content":"### **Introducción: Planifica tus Impuestos con Precisión**\n\nEsta calculadora está diseñada para autónomos y propietarios de e-commerce en España que operan bajo el régimen de estimación directa. Su objetivo es proporcionar una estimación clara y rápida de los dos principales impuestos trimestrales: el IVA (a través del Modelo 303) y el pago a cuenta del IRPF (a través del Modelo 130). A diferencia de otras herramientas, esta calculadora tiene en cuenta el crucial Régimen de Recargo de Equivalencia, un factor determinante para muchos comercios minoristas online.\n\n### **Guida all'Uso del Calcolatore: I Tuoi Dati**\n\n* **Ingresos del Trimestre (sin IVA)**: La suma total de lo que has facturado, sin contar el IVA.\n* **Gastos Deducibles del Trimestre (sin IVA)**: El total de costes directamente relacionados con tu actividad que puedes desgravar (proveedores, marketing, software, etc.), sin contar el IVA.\n* **Tipo de IVA Aplicado en Ventas**: El % de IVA que añades a tus productos o servicios. El tipo general es el 21%.\n* **Tipo de IVA Pagado en Gastos (Promedio)**: El % de IVA que tus proveedores te cobran. Suele ser también el 21%.\n* **Régimen de Recargo de Equivalencia**: Activa esta opción solo si eres un comerciante minorista (persona física) que vende al cliente final sin transformar el producto. Si dudas, consulta a un asesor.\n\n### **Metodologia di Calcolo Spiegata: Trasparenza Totale**\n\nLa lógica de la calculadora sigue los procedimientos estándar de la Agencia Tributaria para autónomos:\n\n1.  **Cálculo del IVA (Modelo 303)**: Se calcula la diferencia entre el IVA que has cobrado (`IVA Repercutido`) y el IVA que has pagado (`IVA Soportado`). La fórmula es: `Resultado IVA = IVA Repercutido - IVA Soportado`. Si estás en Recargo de Equivalencia, este resultado es 0, ya que no presentas este modelo.\n2.  **Cálculo del IRPF (Modelo 130)**: Se determina tu beneficio (`Ingresos - Gastos`). Sobre este beneficio se aplica un 20% para calcular el pago a cuenta que debes adelantar a Hacienda para tu declaración de la renta anual. La fórmula es: `Pago IRPF = (Ingresos - Gastos) * 0.20`.\n\nEl **Total de Impuestos a Pagar** es la suma del resultado del IVA (si es positivo) y el pago del IRPF.\n\n### **Analisi Approfondita: Régimen General vs. Recargo de Equivalencia**\n\nLa elección o adscripción a uno de estos dos regímenes de IVA es la decisión fiscal más importante para un e-commerce minorista. \n\n**Régimen General**\n* **Para quién es**: E-commerce de servicios, fabricantes, o cualquiera que transforme productos.\n* **Cómo funciona**: Cobras IVA a tus clientes, deduces el IVA de tus gastos y pagas la diferencia a Hacienda cada trimestre (Modelo 303). Tienes más control sobre el flujo de caja del IVA.\n* **Ventaja**: Puedes deducir el 100% del IVA de tus inversiones y gastos, lo que puede resultar en devoluciones si tienes más gastos que ingresos (típico al empezar).\n* **Desventaja**: Requiere una contabilidad más rigurosa y la presentación trimestral del Modelo 303.\n\n**Recargo de Equivalencia (R.E.)**\n* **Para quién es**: Obligatorio para comerciantes minoristas (autónomos) que venden productos al cliente final sin modificarlos (ej. dropshipping, reventa de ropa, etc.).\n* **Cómo funciona**: Simplifica radicalmente la gestión del IVA. No tienes que presentar el Modelo 303. A cambio, tus proveedores te cobrarán el tipo de IVA correspondiente MÁS un recargo (ej. 21% IVA + 5.2% Recargo). Este recargo es el 'IVA' que pagas directamente a través de tus proveedores.\n* **Ventaja**: Simplicidad administrativa inmensa al no haber declaraciones de IVA.\n* **Desventaja**: No puedes deducir el IVA soportado en tus gastos (ni el recargo). Este IVA se convierte en un coste mayor, lo que puede afectar a tus márgenes de beneficio.\n\nEn resumen, el R.E. ofrece simplicidad a cambio de un coste fiscal potencialmente mayor, mientras que el Régimen General ofrece más control y potencial de deducción a cambio de más burocracia.\n\n### **Domande Frequenti (FAQ)**\n\n1.  **¿Qué es el Modelo 303 y el 130?**\n    El Modelo 303 es la autoliquidación trimestral del IVA, donde declaras el IVA cobrado y pagado. El Modelo 130 es el pago fraccionado del IRPF, un adelanto del 20% de tus beneficios para la declaración de la renta anual.\n2.  **¿Esta calculadora sirve para una sociedad (SL)?**\n    No. Esta calculadora está optimizada para autónomos (personas físicas). Las Sociedades Limitadas tienen una tributación diferente (Impuesto de Sociedades en lugar de IRPF) y no aplican al Recargo de Equivalencia.\n3.  **¿Qué pasa si el resultado del IVA es negativo?**\n    Si tu IVA Soportado es mayor que el Repercutido, el resultado del Modelo 303 es 'a compensar'. Puedes usar ese saldo a tu favor para reducir lo que tengas que pagar en los siguientes trimestres. Normalmente, solo puedes pedir la devolución del dinero en la declaración del último trimestre del año.","seoSchema":{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"¿Qué es el Modelo 303 y el 130?","acceptedAnswer":{"@type":"Answer","text":"El Modelo 303 es la autoliquidación trimestral del IVA, donde declaras el IVA cobrado y pagado. El Modelo 130 es el pago fraccionado del IRPF, un adelanto del 20% de tus beneficios para la declaración de la renta anual."}},{"@type":"Question","name":"¿Esta calculadora sirve para una sociedad (SL)?","acceptedAnswer":{"@type":"Answer","text":"No. Esta calculadora está optimizada para autónomos (personas físicas). Las Sociedades Limitadas tienen una tributación diferente (Impuesto de Sociedades en lugar de IRPF) y no aplican al Recargo de Equivalencia."}},{"@type":"Question","name":"¿Qué pasa si el resultado del IVA es negativo?","acceptedAnswer":{"@type":"Answer","text":"Si tu IVA Soportado es mayor que el Repercutido, el resultado del Modelo 303 es 'a compensar'. Puedes usar ese saldo a tu favor para reducir lo que tengas que pagar en los siguientes trimestres. Normalmente, solo puedes pedir la devolución del dinero en la declaración del último trimestre del año."}}]}};

// --- DYNAMIC CHART COMPONENT ---
const PieChartComponent = dynamic(() => import('recharts').then(mod => {
    const { PieChart, Pie, Cell, Tooltip: ChartTooltip, Legend, ResponsiveContainer } = mod;
    // eslint-disable-next-line react/display-name
    return ({ data }: { data: any[] }) => {
        const COLORS = ['#22c55e', '#ef4444', '#a3a3a3']; // Net Profit, Taxes, Expenses
        return (
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <ChartTooltip
                        formatter={(value: number, name: string) => [`${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}`, name]}
                    />
                    <Legend iconType="circle" />
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        );
    };
}), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-[250px] w-full text-gray-500 bg-gray-50 rounded-lg">Cargando gráfico...</div>,
});


// --- HELPER COMPONENTS ---
const InfoIcon = () => (<svg xmlns="http://www.w.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code class=\"bg-gray-100 text-red-500 px-1 py-0.5 rounded\">$1</code>');
    const blocks = content.split('\n\n');
    return (<div className="prose prose-sm max-w-none text-gray-700">{blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) { return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />; }
        if (trimmedBlock.startsWith('*')) { const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, '')); return (<ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>); }
        if (trimmedBlock.match(/^\d\.\s/)) { const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, '')); return (<ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>); }
        if (trimmedBlock) { return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />; }
        return null;
    })}</div>);
};

// --- MAIN COMPONENT ---
const CalculadoraImpuestosEcommerce: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema, examples } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = examples[0].inputs;
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);
    const loadExample = (exampleInputs: any) => setStates(exampleInputs);

    const calculatedOutputs = useMemo(() => {
        const { ingresos_trimestrales = 0, gastos_deducibles = 0, tipo_iva_repercutido = 0, tipo_iva_soportado_promedio = 0, en_recargo_equivalencia = false } = states;
        const iva_repercutido = ingresos_trimestrales * (tipo_iva_repercutido / 100);
        const iva_soportado = gastos_deducibles * (tipo_iva_soportado_promedio / 100);
        const resultado_iva_calc = iva_repercutido - iva_soportado;
        const resultado_iva = en_recargo_equivalencia ? 0 : resultado_iva_calc;
        const base_imponible_irpf = ingresos_trimestrales - gastos_deducibles;
        const pago_fraccionado_irpf = base_imponible_irpf > 0 ? base_imponible_irpf * 0.20 : 0;
        const total_impuestos_trimestre = (resultado_iva > 0 ? resultado_iva : 0) + pago_fraccionado_irpf;
        const beneficio_neto = base_imponible_irpf - pago_fraccionado_irpf;
        return { resultado_iva, pago_fraccionado_irpf, total_impuestos_trimestre, beneficio_neto, resultado_iva_calc };
    }, [states]);

    const chartData = [
        { name: 'Beneficio Neto', value: Math.max(0, calculatedOutputs.beneficio_neto) },
        { name: 'Total Impuestos', value: Math.max(0, calculatedOutputs.total_impuestos_trimestre) },
        { name: 'Gastos Deducibles', value: Math.max(0, states.gastos_deducibles) }
    ];

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            const element = calculatorRef.current;
            if (!element) return;
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}-resultados.pdf`);
        } catch (e) { console.error(e); alert("Error al exportar a PDF."); }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const { resultado_iva_calc, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, date: new Date().toISOString() };
            const results = JSON.parse(localStorage.getItem("calculator_results") || "[]");
            localStorage.setItem("calculator_results", JSON.stringify([payload, ...results].slice(0, 10)));
            alert("Resultado guardado en el almacenamiento local.");
        } catch (e) { console.error(e); alert("No se pudo guardar el resultado."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/50 font-sans">
                <main className="lg:col-span-2 bg-white rounded-lg shadow-lg">
                    <div ref={calculatorRef}>
                        <div className="p-6 md:p-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
                            <p className="mt-2 text-gray-600">Estima tus obligaciones fiscales trimestrales como autónomo en España.</p>
                            <div className="mt-6 text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <strong>Disclaimer:</strong> Esta herramienta ofrece una estimación con fines informativos. No sustituye el asesoramiento de un profesional fiscal cualificado.
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {inputs.map(input => (
                                    <div key={input.id} className={input.type === 'boolean' ? 'md:col-span-2' : ''}>
                                        {input.type === 'boolean' ? (
                                            <div className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border">
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={!!states[input.id]} onChange={e => handleStateChange(input.id, e.target.checked)} />
                                                <label htmlFor={input.id} className="block text-sm font-medium text-gray-700 flex items-center">{input.label}<Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip></label>
                                            </div>
                                        ) : (
                                            <div>
                                                <label htmlFor={input.id} className="block text-sm font-medium text-gray-700 flex items-center">{input.label}<Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip></label>
                                                <div className="mt-1 flex items-center">
                                                    <input id={input.id} type="number" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2" value={states[input.id] ?? ''} onChange={e => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))} min={input.min} step={input.step} />
                                                    {input.unit && <span className="ml-3 text-gray-500">{input.unit}</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 bg-gray-50 p-6 md:p-8 rounded-b-lg">
                            <h2 className="text-xl font-semibold text-gray-800">Resultados Estimados</h2>
                            <div className="mt-4 space-y-3">
                                {outputs.map(output => {
                                    const value = (calculatedOutputs as any)[output.id];
                                    const isTotal = output.id === 'total_impuestos_trimestre';
                                    const note = output.id === 'resultado_iva' ? (states.en_recargo_equivalencia ? ' (No aplica en R.E.)' : (calculatedOutputs.resultado_iva_calc < 0 ? ' (A compensar)' : '')) : '';
                                    return (<div key={output.id} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${isTotal ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'}`}>
                                        <span className="font-medium text-gray-700">{output.label}<span className="text-gray-500 text-xs ml-1">{note}</span></span>
                                        <span className={`font-bold text-xl ${isTotal ? 'text-blue-600' : 'text-gray-800'}`}>{isClient ? formatCurrency(value) : '...'}</span>
                                    </div>);
                                })}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mt-8">Desglose de Ingresos</h3>
                            <div className="mt-2">{isClient && <PieChartComponent data={chartData} />}</div>
                        </div>
                    </div>
                </main>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Acciones</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                {examples.map((ex, idx) => (
                                    <button key={idx} onClick={() => loadExample(ex.inputs)} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">{`Ejemplo ${idx + 1}`}</button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Guardar</button>
                                <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">PDF</button>
                            </div>
                            <button onClick={handleReset} className="w-full text-sm border border-red-300 bg-red-50 text-red-700 rounded-md px-3 py-2 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Resetear al Ejemplo 1</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-5 bg-white shadow-lg">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Guía y Metodología</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-5 bg-white shadow-lg">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-practico-iva-2023/capitulo-11-regimenes-especiales/regimen-especial-recargo-equivalencia.html" target="_blank" rel="noopener noreferrer nofollow" className="text-blue-600 hover:underline">Agencia Tributaria: Régimen de Recargo de Equivalencia</a></li>
                            <li><a href="https://sede.agenciatributaria.gob.es/Sede/todos-tramites/impuestos-tasas/iva/modelo-303-iva-autoliquidacion.html" target="_blank" rel="noopener noreferrer nofollow" className="text-blue-600 hover:underline">Agencia Tributaria: Información sobre el Modelo 303</a></li>
                            <li><a href="https://sede.agenciatributaria.gob.es/Sede/todos-tramites/impuestos-tasas/irpf/modelo-130-irpf-empresarios-profesionales.html" target="_blank" rel="noopener noreferrer nofollow" className="text-blue-600 hover:underline">Agencia Tributaria: Información sobre el Modelo 130</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraImpuestosEcommerce;