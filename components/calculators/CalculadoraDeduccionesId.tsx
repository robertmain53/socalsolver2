'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

// --- Static Data and Configuration ---
const calculatorData = {
  "slug": "calculadora-deducciones-id",
  "category": "Bienes Raíces y Vivienda",
  "title": "Calculadora de Deducciones por I+D+i en el Impuesto de Sociedades",
  "lang": "es",
  "description": "Estima el crédito fiscal y el ahorro en el Impuesto de Sociedades que tu empresa puede generar por sus inversiones en Investigación, Desarrollo e Innovación Tecnológica.",
  "inputs": [
    { "id": "gastoID", "label": "Gasto Total en I+D del Ejercicio", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Introduce los gastos totales incurridos en actividades de Investigación y Desarrollo durante el ejercicio fiscal actual." },
    { "id": "gastoMedioID", "label": "Gasto Medio en I+D (2 años anteriores)", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "El promedio de los gastos en I+D de los dos ejercicios fiscales anteriores. Si es el primer año, introduce 0." },
    { "id": "gastoPersonalID", "label": "Gasto de Personal Investigador Cualificado", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Del gasto total en I+D, indica la parte que corresponde a sueldos y salarios de personal investigador con dedicación exclusiva." },
    { "id": "gastoIT", "label": "Gasto Total en Innovación Tecnológica (IT)", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Introduce los gastos totales en actividades de Innovación Tecnológica (mejora de procesos, nuevos productos, etc.)." }
  ],
  "outputs": [
    { "id": "deduccionTotal", "label": "Deducción Fiscal Total Generada", "unit": "€" },
    { "id": "deduccionID", "label": "Desglose: Deducción por I+D", "unit": "€" },
    { "id": "deduccionIT", "label": "Desglose: Deducción por Innovación (IT)", "unit": "€" }
  ],
  "content": "### Introducción\n\nLa deducción por actividades de Investigación y Desarrollo e Innovación Tecnológica (I+D+i) es uno de los **incentivos fiscales más potentes y estratégicos** del sistema tributario español. Permite a las empresas reducir significativamente su factura en el Impuesto sobre Sociedades, fomentando la competitividad y la creación de valor. Sin embargo, su cálculo puede ser complejo. Esta calculadora está diseñada para directores financieros, CEOs y responsables de proyectos, para que puedan estimar de forma rápida y precisa el importe de la deducción fiscal que su empresa puede generar, entendiendo claramente de dónde proviene cada euro de ahorro.\n\n### Guida all'Uso del Calcolatore\n\nPara obtener una simulación precisa del crédito fiscal, introduce los gastos anuales de tu empresa en las siguientes categorías:\n\n* **Gasto Total en I+D del Ejercicio**: La inversión total del año en proyectos de Investigación y Desarrollo.\n* **Gasto Medio en I+D (2 años anteriores)**: El promedio de gasto en I+D de los dos ejercicios previos. Es clave para calcular la deducción incremental.\n* **Gasto de Personal Investigador Cualificado**: La parte del gasto en I+D que corresponde a los salarios de tu equipo investigador con dedicación exclusiva.\n* **Gasto Total en Innovación Tecnológica (IT)**: La inversión en mejoras de procesos o productos que no llegan a calificarse como I+D.\n\nLa herramienta desglosará la deducción por cada concepto y te mostrará el ahorro fiscal total potencial.\n\n### Metodologia di Calcolo Spiegata\n\nEl cálculo se basa estrictamente en lo dispuesto en el **Artículo 35 de la Ley del Impuesto sobre Sociedades (LIS)**.\n\nLa deducción total es la suma de dos componentes principales:\n\n1.  **Deducción por Investigación y Desarrollo (I+D)**:\n    * **25%** sobre el gasto total de I+D del ejercicio.\n    * **42%** sobre el exceso de gasto de I+D respecto a la media de los dos años anteriores. Este es un potente incentivo al crecimiento de la inversión.\n    * **17%** adicional sobre los gastos de personal investigador cualificado dedicado exclusivamente a I+D.\n\n2.  **Deducción por Innovación Tecnológica (IT)**:\n    * **12%** sobre los gastos del ejercicio en proyectos de innovación.\n\nEl resultado es el **crédito fiscal** que la empresa puede aplicar contra su cuota del Impuesto de Sociedades. Es una de las deducciones más altas de Europa y una palanca clave de financiación indirecta.\n\n### Análisis Approfondita: Maximizando el Retorno de la I+D+i\n\nObtener la deducción es más que un simple cálculo; es un proceso estratégico que requiere una correcta planificación y justificación.\n\n**¿Qué se considera gasto de I+D+i?**\nNo cualquier mejora es innovación. La **Investigación** implica descubrir nuevos conocimientos, mientras que el **Desarrollo** es la aplicación de esos conocimientos en un nuevo producto o proceso. La **Innovación Tecnológica** se refiere a la mejora sustancial de productos o procesos ya existentes. Los gastos elegibles incluyen salarios del personal, costes de materiales, amortización de equipos, colaboraciones externas con universidades o centros tecnológicos, etc.\n\n**La importancia de la Seguridad Jurídica: Informes Motivados Vinculantes (IMV)**\nPara evitar incertidumbre ante una posible inspección de Hacienda, las empresas pueden solicitar un **Informe Motivado Vinculante (IMV)** al Ministerio de Ciencia e Innovación. Este documento certifica que las actividades realizadas son efectivamente I+D+i, blindando la deducción aplicada. Aunque tiene un coste, proporciona una seguridad jurídica total y es altamente recomendable para importes significativos.\n\n**¿Y si mi empresa no tiene beneficios? La Monetización**\nUna de las grandes ventajas de esta deducción es que si la empresa no genera suficiente cuota íntegra para aplicarla (por ejemplo, si tiene pérdidas), la ley permite solicitar a Hacienda el **abono del 80% del importe de la deducción** (con ciertos límites y condiciones). Esto convierte el crédito fiscal en una inyección de liquidez directa, una herramienta de financiación no bancaria extremadamente valiosa para startups y pymes en crecimiento.\n\n### Domande Frequenti (FAQ)\n\n**1. ¿Cuál es la principal diferencia entre I+D e Innovación Tecnológica (IT) a efectos fiscales?**\nLa I+D implica la creación de una novedad objetiva a nivel sectorial, es decir, algo que resuelve una incertidumbre técnica no resuelta hasta el momento. La IT, en cambio, implica una novedad subjetiva para la propia empresa, como la implementación de una tecnología ya existente pero nueva para ella que mejora sus procesos. Los porcentajes de deducción son significativamente mayores para la I+D (25%-42%) que para la IT (12%).\n\n**2. ¿Cuánto tiempo tengo para aplicar la deducción si no puedo usarla toda en un año?**\nSi no puedes aplicar la totalidad de la deducción por falta de cuota, puedes arrastrarla y aplicarla en los **18 años siguientes**. Esto da un margen muy amplio para aprovechar el incentivo fiscal generado.\n\n**3. ¿Necesito una certificación externa para aplicar la deducción?**\nNo es estrictamente obligatorio, pero es **altamente recomendable**. Contar con un informe de una entidad certificadora acreditada por ENAC y, posteriormente, con un Informe Motivado Vinculante (IMV), te proporciona la máxima seguridad jurídica y facilita enormemente la aplicación de la deducción sin riesgos.\n",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "¿Cuál es la principal diferencia entre I+D e Innovación Tecnológica (IT) a efectos fiscales?", "acceptedAnswer": { "@type": "Answer", "text": "La I+D implica la creación de una novedad objetiva a nivel sectorial, es decir, algo que resuelve una incertidumbre técnica no resuelta hasta el momento. La IT, en cambio, implica una novedad subjetiva para la propia empresa, como la implementación de una tecnología ya existente pero nueva para ella que mejora sus procesos. Los porcentajes de deducción son significativamente mayores para la I+D (25%-42%) que para la IT (12%)." } }, { "@type": "Question", "name": "¿Cuánto tiempo tengo para aplicar la deducción si no puedo usarla toda en un año?", "acceptedAnswer": { "@type": "Answer", "text": "Si no puedes aplicar la totalidad de la deducción por falta de cuota, puedes arrastrarla y aplicarla en los 18 años siguientes. Esto da un margen muy amplio para aprovechar el incentivo fiscal generado." } }, { "@type": "Question", "name": "¿Necesito una certificación externa para aplicar la deducción?", "acceptedAnswer": { "@type": "Answer", "text": "No es estrictamente obligatorio, pero es altamente recomendable. Contar con un informe de una entidad certificadora acreditada por ENAC y, posteriormente, con un Informe Motivado Vinculante (IMV), te proporciona la máxima seguridad jurídica y facilita enormemente la aplicación de la deducción sin riesgos." } } ] }
};

// --- Dynamic Chart Component with Loader ---
const DynamicBarChart = dynamic(
    () => Promise.resolve(({ data }: { data: any[] }) => (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `€${Number(value / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={120} />
                <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                <Bar dataKey="Deducción" fill="#4f46e5" />
            </BarChart>
        </ResponsiveContainer>
    )),
    { ssr: false, loading: () => <div className="h-[250px] w-full flex items-center justify-center bg-gray-100 rounded-lg">Cargando gráfico...</div> }
);

// --- Helper & Utility Components ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);
const FaqSchema = () => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />);
const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### ')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace('### ', '')) }} />;
                if (trimmedBlock.startsWith('* ')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                if (trimmedBlock.match(/^\d\.\s/)) return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />)}</ol>;
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Main Component ---
const CalculadoraDeduccionesId: React.FC = () => {
    const { slug, title, description, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        gastoID: 150000,
        gastoMedioID: 100000,
        gastoPersonalID: 70000,
        gastoIT: 50000,
    };

    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);
    const handleStateChange = (id: string, value: any) => { setStates(prev => ({ ...prev, [id]: value })); };
    const handleReset = () => { setStates(initialStates); };

    const { calculatedOutputs, chartData } = useMemo(() => {
        const { gastoID, gastoMedioID, gastoPersonalID, gastoIT } = states;
        
        // Deducción por IT
        const deduccionIT = gastoIT * 0.12;

        // Deducción por I+D
        const deduccionBaseID = gastoID * 0.25;
        const excesoGastoID = Math.max(0, gastoID - gastoMedioID);
        const deduccionIncrementalID = excesoGastoID * 0.42;
        const gastoPersonalEfectivo = Math.min(gastoID, gastoPersonalID);
        const deduccionPersonalID = gastoPersonalEfectivo * 0.17;
        const deduccionID = deduccionBaseID + deduccionIncrementalID + deduccionPersonalID;

        const deduccionTotal = deduccionIT + deduccionID;

        const newChartData = [
            { name: 'I+D (Base 25%)', Deducción: deduccionBaseID },
            { name: 'I+D (Incremental 42%)', Deducción: deduccionIncrementalID },
            { name: 'I+D (Personal 17%)', Deducción: deduccionPersonalID },
            { name: 'Innovación (12%)', Deducción: deduccionIT },
        ].filter(item => item.Deducción > 0);
        
        return {
            calculatedOutputs: {
                deduccionTotal,
                deduccionID,
                deduccionIT
            },
            chartData: newChartData
        };

    }, [states]);
    
    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (calculatorRef.current) {
                const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${slug}.pdf`);
            }
        } catch (error) { console.error(error); }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Resultado guardado correctamente.");
        } catch { alert("No se pudo guardar el resultado."); }
    }, [states, calculatedOutputs, slug, title]);
    
    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">{description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-slate-50 p-6 rounded-lg">
                            {inputs.map(input => (
                                <div key={input.id}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id={input.id} aria-label={input.label}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                            type="number" min={input.min} step={input.step}
                                            value={states[input.id]}
                                            onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                                        />
                                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Resultados de la Deducción</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between p-4 mb-3 rounded-lg ${output.id === 'deduccionTotal' ? 'bg-indigo-50 border-indigo-500 border-l-4' : 'bg-gray-50'}`}>
                                    <div className="text-sm font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl font-bold ${output.id === 'deduccionTotal' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Composición de la Deducción Total</h3>
                            {isClient && chartData.length > 0 && <DynamicBarChart data={chartData} />}
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Resetear</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Análisis y Metodología</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 27/2014, de 27 de noviembre, del Impuesto sobre Sociedades (Ver Art. 35)</a></li>
                            <li><a href="https://www.ciencia.gob.es/es/portada" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ministerio de Ciencia, Innovación y Universidades</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraDeduccionesId;