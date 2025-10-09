'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Icona per i Tooltip ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {text}
        </div>
    </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const CalculatorSeoSchema = ({ schema }: { schema: object }) => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### ')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(4)) }} />;
                if (trimmedBlock.startsWith('#### ')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(5)) }} />;
                if (trimmedBlock.startsWith('* ')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock.match(/^\d\.\s/)) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                    return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
                }
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = { "slug": "calculadora-coste-importacion-coche", "category": "Bienes Raíces y Vivienda", "title": "Calculadora de Coste de Importación de un Coche", "lang": "es", "data": { "iva_general": 21, "arancel_general": 10, "impuesto_matriculacion": [ { "max_co2": 119, "tasa": 0 }, { "max_co2": 159, "tasa": 4.75 }, { "max_co2": 199, "tasa": 9.75 }, { "max_co2": Infinity, "tasa": 14.75 } ], "coeficientes_depreciacion": [ { "anos": 1, "coeficiente": 1.00 }, { "anos": 2, "coeficiente": 0.84 }, { "anos": 3, "coeficiente": 0.67 }, { "anos": 4, "coeficiente": 0.56 }, { "anos": 5, "coeficiente": 0.47 }, { "anos": 6, "coeficiente": 0.39 }, { "anos": 7, "coeficiente": 0.34 }, { "anos": 8, "coeficiente": 0.28 }, { "anos": 9, "coeficiente": 0.24 }, { "anos": 10, "coeficiente": 0.19 }, { "anos": 11, "coeficiente": 0.17 }, { "anos": 12, "coeficiente": 0.13 }, { "anos": Infinity, "coeficiente": 0.10 } ] }, "inputs": [ { "id": "origen_coche", "label": "Origen del Vehículo", "type": "select", "options": ["UE (Unión Europea)", "Fuera de la UE"], "tooltip": "La procedencia del coche es el factor más importante. Importar desde fuera de la UE implica pagar Aranceles de aduana y el IVA completo." }, { "id": "valor_neto_original", "label": "Valor del Vehículo Nuevo (sin impuestos)", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Es el valor oficial del vehículo cuando era nuevo (sin IVA), publicado por Hacienda en el BOE cada año. Este valor se usa como base para calcular los impuestos." }, { "id": "ano_matriculacion", "label": "Año de Primera Matriculación", "type": "number", "unit": "año", "min": 1980, "max": 2025, "step": 1, "tooltip": "El año en que se matriculó el vehículo por primera vez. Esto determina el porcentaje de depreciación que se aplica a su valor fiscal." }, { "id": "emisiones_co2", "label": "Emisiones de CO2", "type": "number", "unit": "g/km", "min": 0, "step": 1, "tooltip": "Las emisiones de CO2 del vehículo, que encontrarás en su ficha técnica. Este dato determina el porcentaje del Impuesto de Matriculación (0%, 4.75%, 9.75% o 14.75%)." }, { "id": "coste_transporte", "label": "Coste Estimado de Transporte", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Coste aproximado de traer el coche a España. Varía mucho según la distancia y el método (camión, barco)." }, { "id": "coste_homologacion", "label": "Coste ITV y Homologación", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Coste de la ITV para vehículos de importación, ficha técnica reducida y posibles gastos de homologación. Unos 150-300€ para coches con CoC europeo, mucho más si requieren homologación individual." } ], "outputs": [ { "id": "base_imponible", "label": "Base Imponible (Valor Actual del Coche)", "unit": "€" }, { "id": "coste_arancel", "label": "Aranceles de Aduana (10%)", "unit": "€" }, { "id": "coste_iva", "label": "IVA (21%)", "unit": "€" }, { "id": "coste_impuesto_matriculacion", "label": "Impuesto de Matriculación", "unit": "€" }, { "id": "coste_total_impuestos", "label": "Total Impuestos y Tasas", "unit": "€" }, { "id": "coste_final_matriculado", "label": "Coste Total del Coche Matriculado", "unit": "€" } ], "formulaSteps": [ { "step": 1, "description": "Calcular la Base Imponible actual del vehículo aplicando el coeficiente de depreciación oficial al valor original.", "formula": "Base Imponible = Valor Original × Coeficiente de Depreciación" }, { "step": 2, "description": "Calcular Aranceles (solo para coches de fuera de la UE).", "formula": "Aranceles = Base Imponible × 10%" }, { "step": 3, "description": "Calcular el IVA (sobre la Base Imponible + Aranceles si aplica).", "formula": "IVA = (Base Imponible + Aranceles) × 21%" }, { "step": 4, "description": "Calcular el Impuesto de Matriculación según las emisiones de CO2.", "formula": "Impuesto Mat. = Base Imponible × % Tasa por CO2" }, { "step": 5, "description": "Sumar todos los costes para obtener el precio final.", "formula": "Coste Total = Base Imponible + Aranceles + IVA + Impuesto Mat. + Transporte + Homologación" } ], "examples": [ { "name": "Coche de 3 años desde Alemania (UE)", "inputs": { "origen_coche": "UE (Unión Europea)", "valor_neto_original": 30000, "ano_matriculacion": 2022, "emisiones_co2": 150, "coste_transporte": 800, "coste_homologacion": 200 }, "outputs": { "coste_final_matriculado": 25350.5 } }, { "name": "Coche de 2 años desde EE.UU. (Fuera de la UE)", "inputs": { "origen_coche": "Fuera de la UE", "valor_neto_original": 40000, "ano_matriculacion": 2023, "emisiones_co2": 210, "coste_transporte": 2500, "coste_homologacion": 1000 }, "outputs": { "coste_final_matriculado": 53744.8 } } ], "tags": "calculadora importar coche, coste importación vehículo, impuestos coche alemania, impuesto de matriculación, IVA coche importado, aranceles aduana coche, matricular coche extranjero, ficha reducida, España", "content": "### Introducción\n\nImportar un coche de países como Alemania puede ser una excelente forma de acceder a un mercado más amplio y a mejores precios. Sin embargo, el proceso implica una serie de impuestos y trámites que pueden convertir una aparente ganga en una pesadilla económica. Esta calculadora está diseñada para ofrecerte una **estimación completa y transparente de TODOS los costes asociados** a la importación y matriculación de un vehículo en España, diferenciando claramente entre importaciones desde la UE y desde fuera de la UE.\n\n### Guida all'Uso del Calcolatore\n\n* **Origen del Vehículo**: Es el paso más importante. Si el coche viene de la **UE** (ej. Alemania), no pagarás aranceles de aduana. Si es de **fuera de la UE** (ej. Suiza, EE.UU., Andorra), deberás pagar un 10% de aranceles y un 21% de IVA.\n* **Valor Neto Original**: Es el valor que tenía el coche nuevo sin impuestos. Este dato es crucial y se encuentra en las tablas oficiales que publica Hacienda en el BOE cada año.\n* **Año de Matriculación**: Determina la depreciación del vehículo. Cuanto más antiguo, menor será la base sobre la que se calculan los impuestos.\n* **Emisiones de CO2**: Determina el tramo del Impuesto de Matriculación. ¡Un coche con 0 emisiones (eléctrico) no paga este impuesto!\n* **Coste Transporte y Homologación**: Son costes variables pero necesarios. Inclúyelos para tener una visión del gasto total real.\n\n### Metodologia di Calcolo Spiegata\n\nEl coste de importar un coche se compone de varios impuestos que se calculan en cascada:\n\n1.  **Base Imponible (Valor Actual)**: No pagas impuestos sobre el valor original, sino sobre el valor actual. Se calcula aplicando un **porcentaje de depreciación oficial** (según la antigüedad) al valor del coche nuevo.\n2.  **Aranceles (Solo Fuera de la UE)**: Si el coche no es comunitario, se aplica un **10%** sobre la Base Imponible.\n3.  **IVA (21%)**: El IVA se calcula sobre la suma de la Base Imponible más los Aranceles (si los hubiera). Para coches usados de la UE comprados a un particular, en lugar de IVA se pagaría ITP, pero el escenario más común (compra a profesional) implica el pago del IVA en España.\n4.  **Impuesto de Matriculación**: Este impuesto depende de las emisiones de CO2 del coche y se calcula sobre la Base Imponible. Los tramos van del 0% al 14,75%.\n5.  **Coste Total**: Es la suma del valor original del coche más todos los impuestos, el transporte y los gastos de homologación.\n\n### Analisi Approfondita: El Proceso de Matriculación: Placas Verdes, Ficha Reducida y Homologación Unitaria\n\nUna vez el coche llega a España, comienza el laberinto burocrático para poder circular legalmente. Estos son los pasos y documentos clave que debes conocer:\n\n**1. La ITV y la 'Ficha Reducida'**\nEl primer paso en suelo español es pasar una ITV específica para vehículos de importación. Para ello, necesitarás una **'Ficha Técnica Reducida'**. Este es un documento elaborado por un ingeniero colegiado que certifica que las características técnicas de tu vehículo se corresponden con una homologación existente en España. Es un trámite esencial para obtener la documentación española.\n\n**2. El Certificado de Conformidad (CoC) y la Homologación Unitaria**\n* **Si tu coche tiene CoC**: El Certificado de Conformidad europeo demuestra que el vehículo cumple con las normativas de la UE. Si lo tienes, el proceso es relativamente sencillo.\n* **Si no tiene CoC**: Esto es común en coches de fuera de la UE (americanos, japoneses, etc.). En este caso, necesitarás una **'Homologación Unitaria'**. Este es un proceso mucho más caro y complejo donde un laboratorio certifica individualmente tu vehículo. Los costes pueden dispararse a miles de euros.\n\n**3. Las 'Placas Verdes' Temporales**\nEl proceso completo de matriculación puede tardar semanas o meses. Para poder usar el coche mientras tanto, puedes solicitar unas **placas de matrícula temporales de color verde**. Te permiten circular legalmente por todo el territorio nacional mientras esperas la matrícula definitiva.\n\n### Domande Frequenti (FAQ)\n\n* **¿Tengo que pagar IVA en España si ya lo pagué en Alemania?**\n    Depende. Si compras un coche **nuevo** (menos de 6 meses o 6.000 km) a un profesional en la UE, pagarás el coche sin el IVA local y luego abonarás el 21% de IVA en España. Si compras un coche **usado** a un profesional, la operación suele llevar el IVA incluido en origen (Régimen Especial de Bienes Usados), por lo que no tendrías que volver a pagarlo en España, pero sí el ITP. Nuestra calculadora se centra en el escenario de importación que sí requiere liquidar impuestos en España, el más complejo.\n\n* **¿Los coches eléctricos importados pagan Impuesto de Matriculación?**\n    No. El Impuesto de Matriculación se basa en las emisiones de CO2. Como los vehículos 100% eléctricos tienen 0 g/km de emisiones, están en el tramo del **0%**, por lo que están exentos de pagar este impuesto, lo que supone un ahorro muy significativo.\n\n* **¿Cuánto se tarda en matricular un coche importado?**\n    Si tienes toda la documentación en regla y el coche tiene CoC, el proceso puede durar entre 2 y 4 semanas. Si el coche requiere una homologación unitaria, el plazo puede extenderse a varios meses.", "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "¿Tengo que pagar IVA en España si ya lo pagué en Alemania?", "acceptedAnswer": { "@type": "Answer", "text": "Depende del régimen de la compra. Si compras un coche nuevo a un profesional en la UE, pagas el 21% de IVA en España. Para coches usados comprados a un profesional bajo el régimen especial (REBU), el IVA ya está incluido en el precio y no se vuelve a pagar, pero en otros casos sí puede ser necesario. Esta calculadora se centra en los escenarios que requieren liquidación de impuestos en España." } }, { "@type": "Question", "name": "¿Los coches eléctricos importados pagan Impuesto de Matriculación?", "acceptedAnswer": { "@type": "Answer", "text": "No. El Impuesto de Matriculación se basa en las emisiones de CO2. Como los vehículos 100% eléctricos tienen 0 g/km de emisiones, están en el tramo del 0%, por lo que están exentos de pagar este impuesto." } }, { "@type": "Question", "name": "¿Cuánto se tarda en matricular un coche importado?", "acceptedAnswer": { "@type": "Answer", "text": "Si tienes toda la documentación en regla y el coche tiene Certificado de Conformidad (CoC), el proceso puede durar entre 2 y 4 semanas. Si el coche requiere una homologación unitaria, el plazo puede extenderse a varios meses." } } ] } };

// --- Definizione del componente grafico per l'importazione dinamica ---
const CostBreakdownChart = ({ data }: { data: { name: string; value: number }[] }) => {
    const COLORS = ['#60a5fa', '#3b82f6', '#1d4ed8', '#fbbf24', '#f97316'];
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {data.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

// --- Importazione dinamica del componente grafico ---
const DynamicCostBreakdownChart = dynamic(() => Promise.resolve(CostBreakdownChart), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg"><p>Cargando gráfico...</p></div>,
});


const CalculadoraCosteImportacionCoche: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema, data } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const currentYear = new Date().getFullYear();
    const initialStates = {
        origen_coche: "UE (Unión Europea)",
        valor_neto_original: 25000,
        ano_matriculacion: currentYear - 4,
        emisiones_co2: 140,
        coste_transporte: 800,
        coste_homologacion: 250,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = useCallback((id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    }, []);

    const handleReset = useCallback(() => {
        setStates(initialStates);
    }, []);
    
    const calculatedOutputs = useMemo(() => {
        const { origen_coche, valor_neto_original, ano_matriculacion, emisiones_co2, coste_transporte, coste_homologacion } = states;
        
        const anos_antiguedad = new Date().getFullYear() - ano_matriculacion;
        const coef_depreciacion = data.coeficientes_depreciacion.find(c => anos_antiguedad <= c.anos)?.coeficiente || 0.10;
        const base_imponible = valor_neto_original * coef_depreciacion;

        const coste_arancel = origen_coche === 'Fuera de la UE' ? base_imponible * (data.arancel_general / 100) : 0;
        const base_iva = base_imponible + coste_arancel;
        const coste_iva = base_iva * (data.iva_general / 100);

        const tasa_matriculacion = data.impuesto_matriculacion.find(i => emisiones_co2 <= i.max_co2)?.tasa || 14.75;
        const coste_impuesto_matriculacion = base_imponible * (tasa_matriculacion / 100);
        
        const coste_total_impuestos = coste_arancel + coste_iva + coste_impuesto_matriculacion;
        const coste_final_matriculado = base_imponible + coste_total_impuestos + coste_transporte + coste_homologacion;

        return { base_imponible, coste_arancel, coste_iva, coste_impuesto_matriculacion, coste_total_impuestos, coste_final_matriculado };
    }, [states, data]);
    
    const chartData = useMemo(() => [
        { name: 'Valor del Coche', value: calculatedOutputs.base_imponible },
        { name: 'Aranceles', value: calculatedOutputs.coste_arancel },
        { name: 'IVA', value: calculatedOutputs.coste_iva },
        { name: 'Imp. Matriculación', value: calculatedOutputs.coste_impuesto_matriculacion },
        { name: 'Otros Gastos', value: states.coste_transporte + states.coste_homologacion },
    ], [calculatedOutputs, states]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

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
        } catch (e) { console.error(e); alert("Error al exportar a PDF."); }
    }, [slug]);

    const saveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Resultado guardado localmente.");
        } catch { alert("No se pudo guardar el resultado."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <CalculatorSeoSchema schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
                        <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">Estima de forma transparente todos los impuestos y gastos para matricular en España un coche importado.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                                {inputs.map(input => {
                                    if (input.type === 'select') {
                                        return (
                                            <div key={input.id} className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                                    {input.label}
                                                    <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                                </label>
                                                <select id={input.id} name={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-8">
                                                    {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={input.id}>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                            </label>
                                            <div className="relative">
                                                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">{input.unit === '€' ? '€' : ''}</span>
                                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-7 pr-12 text-right" type="number" min={input.min} max={input.max} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">{input.unit}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Desglose de Costes de Importación</h2>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    {outputs.map(output => {
                                        if (output.id === 'coste_arancel' && states.origen_coche === 'UE (Unión Europea)') return null;
                                        return (
                                        <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg text-sm ${output.id === 'coste_final_matriculado' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
                                            <div className="font-medium text-gray-700">{output.label}</div>
                                            <div className={`font-bold ${output.id === 'coste_final_matriculado' ? 'text-blue-600 text-lg' : 'text-gray-800'}`}>
                                                <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                            </div>
                                        </div>
                                        );
                                    })}
                                  </div>
                                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center items-center">
                                      <h3 className="text-base font-medium text-gray-700 mb-2">Composición del Coste Final</h3>
                                      <div className="h-48 w-full">
                                          <DynamicCostBreakdownChart data={chartData.filter(d => d.value > 0)} />
                                      </div>
                                  </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Acciones</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={saveResult} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Resetear</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guía de Matriculación</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://sede.agenciatributaria.gob.es/Sede/vehiculos-embarcaciones-aeronaves/impuesto-especial-sobre-determinados-medios-transporte/informacion-general-del-impuesto/base-imponible-tipo-impositivo.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria - Impuesto de Matriculación</a></li>
                            <li><a href="https://www.dgt.es/nuestros-servicios/vehiculos/matriculacion-de-vehiculos/matricular-un-vehiculo-que-procede-del-extranjero/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">DGT - Matricular Vehículo Extranjero</a></li>
                            <li><a href="https://www.boe.es" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Boletín Oficial del Estado (BOE)</a> - Para consultar tablas de valoración anuales.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraCosteImportacionCoche;