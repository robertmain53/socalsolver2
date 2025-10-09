'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

// --- TIPI E DATI DI CONFIGURAZIONE ---
// Definizione dei tipi per una maggiore sicurezza e autocompletamento
type InputConfig = {
    id: string;
    label: string;
    type: 'number' | 'boolean' | 'select';
    unit?: string;
    min?: number;
    step?: number;
    tooltip?: string;
    condition?: string;
    options?: { value: string; label: string }[];
};

// Dati di configurazione del calcolatore importati direttamente nel file
const calculatorData = {
  "slug": "calculadora-cuota-autonomos-2025",
  "category": "Impuestos y trabajo autónomo",
  "title": "Calculadora Cuota de Autónomos 2025 (por tramos de ingresos reales)",
  "lang": "es",
  "inputs": [
    { "id": "ingresos_anuales", "label": "Ingresos brutos anuales", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Introduce el total de ingresos (facturación) que prevés obtener durante el año, antes de descontar gastos." },
    { "id": "gastos_deducibles_anuales", "label": "Gastos deducibles anuales", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Incluye todos los gastos relacionados con tu actividad que puedes deducir fiscalmente (ej: alquiler de oficina, suministros, compras a proveedores, etc.)." },
    { "id": "tarifa_plana", "label": "¿Te acoges a la Tarifa Plana?", "type": "boolean" as const, "tooltip": "Márcalo si estás en tu primer o segundo año de actividad como autónomo y cumples los requisitos para la cuota reducida." },
    { "id": "periodo_tarifa_plana", "label": "Periodo de la Tarifa Plana", "type": "select" as const, "options": [ { "value": "1-12", "label": "Primeros 12 meses" }, { "value": "13-24", "label": "Meses 13 al 24" } ], "condition": "tarifa_plana == true", "tooltip": "Selecciona en qué fase de la Tarifa Plana te encuentras. La cuota puede variar después del primer año si tus ingresos superan el SMI." },
    { "id": "base_superior", "label": "¿Quieres cotizar por una base superior a la mínima?", "type": "boolean" as const, "tooltip": "Puedes elegir una base de cotización más alta que la mínima de tu tramo para mejorar tus prestaciones futuras (jubilación, baja, etc.)." },
    { "id": "base_personalizada", "label": "Base de cotización mensual elegida", "type": "number" as const, "unit": "€", "min": 735.29, "step": 10, "condition": "base_superior == true", "tooltip": "Introduce la base de cotización mensual que deseas. Debe estar entre la mínima de tu tramo y la máxima legal (€4,720.50 en 2024, valor de referencia)." }
  ],
  "outputs": [
    { "id": "rendimiento_neto_mensual", "label": "Rendimiento Neto Mensual Estimado", "unit": "€" },
    { "id": "tramo_ingresos", "label": "Tramo de Ingresos Asignado", "unit": "" },
    { "id": "base_cotizacion_aplicable", "label": "Base de Cotización Mensual", "unit": "€" },
    { "id": "cuota_mensual_final", "label": "Cuota Mensual de Autónomo a Pagar", "unit": "€" }
  ],
  "content": "### **Guía Definitiva sobre la Cuota de Autónomos 2025 por Ingresos Reales**\n\nEl sistema de cotización para trabajadores autónomos en España, basado en los **rendimientos netos** (ingresos reales), se consolida en 2025. Este modelo busca que la aportación a la Seguridad Social sea más justa y proporcional a la capacidad económica de cada autónomo. Esta calculadora te permite estimar con precisión tu cuota mensual, y esta guía te explicará todos los detalles para que entiendas perfectamente cómo te afecta.\n\n### **Parte 1: Cómo Funciona el Cálculo de tu Cuota**\n\nEl cálculo de la cuota mensual se basa en una previsión de tus **rendimientos netos anuales**. A partir de esa cifra, se determina tu base de cotización y, finalmente, la cuota a pagar. El proceso se desglosa en los siguientes pasos:\n\n1.  **Cálculo del Rendimiento Neto Anual**: Es el punto de partida. Se calcula restando a tus ingresos brutos (facturación) todos los gastos fiscalmente deducibles asociados a tu actividad.\n    `Rendimiento Neto = Ingresos Totales - Gastos Deducibles`\n\n2.  **Deducción por Gastos Genéricos**: Sobre el rendimiento neto calculado, la Seguridad Social aplica una **deducción adicional fija del 7%** (o un 3% para autónomos societarios). Este porcentaje busca compensar gastos de difícil justificación.\n    `Base de Cálculo = Rendimiento Neto - (Rendimiento Neto * 0.07)`\n\n3.  **Determinación del Rendimiento Neto Mensual**: La base de cálculo anual se divide entre 12 para obtener el promedio mensual que determinará tu tramo.\n    `Rendimiento Mensual = Base de Cálculo / 12`\n\n4.  **Asignación del Tramo y Base de Cotización**: Con tu rendimiento mensual, se te asigna uno de los 15 tramos de ingresos establecidos. Cada tramo tiene una **base de cotización mínima** y una **máxima**. Por defecto, cotizarás por la mínima, pero puedes elegir una superior para mejorar tus prestaciones.\n\n5.  **Cálculo de la Cuota Mensual**: La cuota es el resultado de aplicar el **tipo de cotización (31,3% en 2025)** a tu base de cotización elegida.\n    `Cuota Mensual = Base de Cotización * 0,313`\n\n#### **Tabla de Tramos y Bases de Cotización 2025 (Oficial)**\n\nA continuación se muestra la tabla oficial que se utilizará como referencia para el cálculo de las cuotas en 2025:\n\n| Tramo | Rendimiento Neto Mensual (€) | Base Mínima (€/mes) | Base Máxima (€/mes) | Cuota Mínima (€/mes) |\n|:-----:|:----------------------------:|:--------------------:|:-------------------:|:--------------------:|\n| Red. 1| ≤ 670                        | 735,29               | 735,29              | 230,15               |\n| Red. 2| > 670 a 900                  | 751,63               | 900                 | 235,27               |\n| Red. 3| > 900 a 1.166,70             | 849,67               | 1.166,70            | 265,95               |\n| Gen. 1| > 1.166,70 a 1.300           | 950,98               | 1.300               | 297,76               |\n| Gen. 2| > 1.300 a 1.500              | 960,78               | 1.500               | 300,83               |\n| Gen. 3| > 1.500 a 1.700              | 1.000,00             | 1.700               | 313,00               |\n| Gen. 4| > 1.700 a 1.850              | 1.045,75             | 1.850               | 327,38               |\n| Gen. 5| > 1.850 a 2.030              | 1.062,09             | 2.030               | 332,49               |\n| Gen. 6| > 2.030 a 2.330              | 1.094,77             | 2.330               | 342,76               |\n| Gen. 7| > 2.330 a 2.760              | 1.143,79             | 2.760               | 358,08               |\n| Gen. 8| > 2.760 a 3.190              | 1.209,15             | 3.190               | 378,47               |\n| Gen. 9| > 3.190 a 3.620              | 1.274,51             | 3.620               | 398,97               |\n| Gen. 10| > 3.620 a 4.050             | 1.339,87             | 4.050               | 419,48               |\n| Gen. 11| > 4.050 a 6.000             | 1.454,25             | 6.000               | 455,23               |\n| Gen. 12| > 6.000                     | 1.732,03             | 4720.50             | 542,14               |\n\n### **Parte 2: Casos Especiales y Consideraciones Clave**\n\n#### **La Tarifa Plana para Nuevos Autónomos**\n\nSi es la primera vez que te das de alta como autónomo (o no lo has estado en los últimos 2 años), puedes beneficiarte de una cuota reducida:\n\n* **Primeros 12 meses**: Una **cuota fija de 80 €** mensuales, independientemente de tus ingresos.\n* **Meses 13 al 24**: Puedes mantener la cuota de 80 € siempre que tus rendimientos netos se mantengan por debajo del Salario Mínimo Interprofesional (SMI). Si lo superas, tu cuota se ajustará al tramo de ingresos que te corresponda.\n\n#### **Ajustes y Regularización a Final de Año**\n\nEl sistema se basa en una **previsión de ingresos**. Al año siguiente, la Seguridad Social cruzará tus datos con los de la Agencia Tributaria. Pueden ocurrir dos cosas:\n\n1.  **Has cotizado de menos**: Si tus ingresos reales fueron superiores a los previstos, la Seguridad Social te reclamará la diferencia. Deberás abonar la cantidad pendiente.\n2.  **Has cotizado de más**: Si tus ingresos fueron inferiores, la Seguridad Social te **devolverá de oficio** el importe que pagaste en exceso.\n\nEs crucial comunicar a la Seguridad Social cualquier cambio significativo en tu previsión de ingresos durante el año (puedes hacerlo hasta 6 veces) para ajustar tu cuota y evitar grandes desviaciones.\n\n### **Conclusión: Un Sistema más Flexible y Justo**\n\nEl sistema de cotización por ingresos reales, aunque requiere una mayor planificación por parte del autónomo, tiene como objetivo crear un marco más equitativo. Permite a quienes tienen menos ingresos pagar una cuota más baja y ajusta la contribución a la situación real de cada profesional. Utiliza esta calculadora como tu principal herramienta de planificación, revisa tus previsiones periódicamente y mantén una comunicación fluida con la Seguridad Social para optimizar tu cotización.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "¿Cómo se calcula la cuota de autónomos en 2025?", "acceptedAnswer": { "@type": "Answer", "text": "La cuota de autónomos en 2025 se calcula aplicando un tipo de cotización del 31,3% a una base de cotización. Dicha base se determina según una previsión de tus rendimientos netos mensuales (ingresos brutos menos gastos deducibles, con una deducción adicional del 7%). Existen 15 tramos de ingresos, cada uno con una base mínima y máxima." } }, { "@type": "Question", "name": "¿Qué es la Tarifa Plana de 80 euros?", "acceptedAnswer": { "@type": "Answer", "text": "La Tarifa Plana es una cuota mensual reducida de 80 euros para nuevos autónomos durante sus primeros 12 meses de actividad. Se puede prorrogar por otros 12 meses si los rendimientos netos del autónomo no superan el Salario Mínimo Interprofesional (SMI)." } }, { "@type": "Question", "name": "¿Qué pasa si mis ingresos reales son diferentes a mi previsión?", "acceptedAnswer": { "@type": "Answer", "text": "Al final del año fiscal, la Seguridad Social regularizará tu situación. Si tus ingresos reales fueron mayores a los previstos, deberás pagar la diferencia. Si fueron menores, la Seguridad Social te devolverá el exceso de cotización de oficio." } }, { "@type": "Question", "name": "¿Puedo cambiar mi base de cotización durante el año?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, puedes modificar tu base de cotización y ajustar tu previsión de ingresos hasta 6 veces al año. Esto te permite adaptar tu cuota a la evolución real de tu negocio y evitar grandes desviaciones en la regularización anual." } } ] }
};

// --- COMPONENTI DI UTILITÀ ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);

const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                if (block.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (block.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (block.startsWith('`')) return <pre key={index} className="bg-gray-100 p-2 rounded text-xs"><code>{block.replace(/`/g, '')}</code></pre>;
                if (block.startsWith('|')) {
                    const rows = block.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
                    const headers = rows[0];
                    const body = rows.slice(2);
                    return (<div key={index} className="overflow-x-auto my-4"><table className="min-w-full border text-sm">
                        <thead className="bg-gray-100"><tr>{headers.map((h, i) => <th key={i} className="p-2 border text-left font-semibold">{h}</th>)}</tr></thead>
                        <tbody>{body.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>)}</tbody>
                    </table></div>);
                }
                if (block.trim()) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.trim()) }} />;
                return null;
            })}
        </div>
    );
};

// --- DATI DI CALCOLO ---
const Tramos2025 = [
    { label: "Red. 1", min: -Infinity, max: 670, baseMin: 735.29, baseMax: 735.29 },
    { label: "Red. 2", min: 670.01, max: 900, baseMin: 751.63, baseMax: 900 },
    { label: "Red. 3", min: 900.01, max: 1166.70, baseMin: 849.67, baseMax: 1166.70 },
    { label: "Gen. 1", min: 1166.71, max: 1300, baseMin: 950.98, baseMax: 1300 },
    { label: "Gen. 2", min: 1300.01, max: 1500, baseMin: 960.78, baseMax: 1500 },
    { label: "Gen. 3", min: 1500.01, max: 1700, baseMin: 1000.00, baseMax: 1700 },
    { label: "Gen. 4", min: 1700.01, max: 1850, baseMin: 1045.75, baseMax: 1850 },
    { label: "Gen. 5", min: 1850.01, max: 2030, baseMin: 1062.09, baseMax: 2030 },
    { label: "Gen. 6", min: 2030.01, max: 2330, baseMin: 1094.77, baseMax: 2330 },
    { label: "Gen. 7", min: 2330.01, max: 2760, baseMin: 1143.79, baseMax: 2760 },
    { label: "Gen. 8", min: 2760.01, max: 3190, baseMin: 1209.15, baseMax: 3190 },
    { label: "Gen. 9", min: 3190.01, max: 3620, baseMin: 1274.51, baseMax: 3620 },
    { label: "Gen. 10", min: 3620.01, max: 4050, baseMin: 1339.87, baseMax: 4050 },
    { label: "Gen. 11", min: 4050.01, max: 6000, baseMin: 1454.25, baseMax: 6000 },
    { label: "Gen. 12", min: 6000.01, max: Infinity, baseMin: 1732.03, baseMax: 4720.50 }
];
const TIPO_COTIZACION = 0.313;
const CUOTA_TARIFA_PLANA = 80;
const SMI_2025_ESTIMADO = 1134; // Salario Mínimo Interprofesional estimado para 2025

// --- COMPONENTE PRINCIPALE ---
const CalculadoraCuotaAutonomos2025: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        ingresos_anuales: 25000,
        gastos_deducibles_anuales: 5000,
        tarifa_plana: false,
        periodo_tarifa_plana: "1-12",
        base_superior: false,
        base_personalizada: 1200
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { ingresos_anuales, gastos_deducibles_anuales, tarifa_plana, periodo_tarifa_plana, base_superior, base_personalizada } = states;

        const rendimiento_neto_anual = ingresos_anuales - gastos_deducibles_anuales;
        const rendimiento_neto_calculo = rendimiento_neto_anual * (1 - 0.07);
        const rendimiento_neto_mensual = rendimiento_neto_calculo / 12;

        const tramo = Tramos2025.find(t => rendimiento_neto_mensual >= t.min && rendimiento_neto_mensual <= t.max);
        if (!tramo) return { rendimiento_neto_mensual: 0, tramo_ingresos: "N/A", base_cotizacion_aplicable: 0, cuota_mensual_final: 0 };
        
        const tramo_ingresos = `${tramo.label} (${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(tramo.min)} - ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(tramo.max)})`;

        let base_cotizacion_aplicable = tramo.baseMin;
        if (base_superior) {
            base_cotizacion_aplicable = Math.max(tramo.baseMin, Math.min(base_personalizada, tramo.baseMax));
        }

        const cuota_estandar = base_cotizacion_aplicable * TIPO_COTIZACION;
        let cuota_tarifa_plana_calculada = CUOTA_TARIFA_PLANA;
        if (periodo_tarifa_plana === "13-24" && rendimiento_neto_mensual > SMI_2025_ESTIMADO) {
            cuota_tarifa_plana_calculada = cuota_estandar;
        }

        const cuota_mensual_final = tarifa_plana ? cuota_tarifa_plana_calculada : cuota_estandar;

        return { rendimiento_neto_mensual, tramo_ingresos, base_cotizacion_aplicable, cuota_mensual_final };
    }, [states]);

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
        } catch (e) { alert("Error al exportar a PDF."); }
    }, [slug]);
    
    const chartData = Tramos2025.map(t => ({ name: t.label, 'Cuota Mínima': t.baseMin * TIPO_COTIZACION }));
    const activeIndex = Tramos2025.findIndex(t => t.label === calculatedOutputs.tramo_ingresos?.split(" ")[0]);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-lg p-6" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Estima tu cuota mensual según el nuevo sistema de cotización por ingresos reales.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {inputs.map((input: InputConfig) => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;

                                const inputLabel = <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}{input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}</label>;

                                if (input.type === 'boolean') return <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-gray-50 border"><input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} /><label className="text-sm font-medium text-gray-800" htmlFor={input.id}>{input.label}</label></div>;
                                
                                if (input.type === 'select') return <div key={input.id}>{inputLabel}<select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">{input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
                                
                                return (<div key={input.id}>
                                    {inputLabel}
                                    <div className="relative"><input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pr-10" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} /><span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">{input.unit}</span></div>
                                </div>);
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados Estimados</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'cuota_mensual_final' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'cuota_mensual_final' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        {isClient ? (typeof (calculatedOutputs as any)[output.id] === 'number' ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format((calculatedOutputs as any)[output.id]) : (calculatedOutputs as any)[output.id] || '...') : '...'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8">
                             <h3 className="text-lg font-semibold text-gray-700 mb-2">Tu Cuota en el Contexto de los Tramos</h3>
                             <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                                 {isClient && (
                                     <ResponsiveContainer width="100%" height="100%">
                                         <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                             <XAxis dataKey="name" fontSize={10} interval={0} />
                                             <YAxis tickFormatter={(value) => `€${value.toFixed(0)}`} fontSize={10}/>
                                             <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)} />
                                             <Legend wrapperStyle={{fontSize: "12px"}}/>
                                             <Bar dataKey="Cuota Mínima" name="Cuota Mínima por Tramo">
                                                 {chartData.map((_entry, index) => (<Cell key={`cell-${index}`} fill={index === activeIndex ? '#4f46e5' : '#a5b4fc'} />))}
                                             </Bar>
                                         </BarChart>
                                     </ResponsiveContainer>
                                 )}
                             </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleExportPDF} className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm font-semibold hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Exportar a PDF</button>
                            <button onClick={handleReset} className="w-full bg-red-100 text-red-800 rounded-md px-3 py-2 text-sm font-semibold hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Resetear</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-2 text-gray-800">Guía y Documentación</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.seg-social.es" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Portal de la Seguridad Social</a></li>
                            <li><a href="https://www.boe.es" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Boletín Oficial del Estado (BOE)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraCuotaAutonomos2025;