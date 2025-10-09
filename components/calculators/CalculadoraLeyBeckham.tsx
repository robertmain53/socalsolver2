'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import dynamic from 'next/dynamic';

// --- CONSTANTE DE DATOS (PEGAR EL JSON AQUÍ) ---
const calculatorData = {
  "slug": "calculadora-ley-beckham",
  "category": "Impuestos y trabajo autónomo",
  "title": "Calculadora de la 'Ley Beckham' para expatriados en España",
  "lang": "es",
  "inputs": [
    {
      "id": "salario_bruto_anual",
      "label": "Ingresos brutos anuales del trabajo",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 1000,
      "tooltip": "Introduce el total de tus ingresos salariales brutos anuales. Esto incluye salario base, bonificaciones y cualquier otra retribución del trabajo percibida en España."
    }
  ],
  "outputs": [
    { "id": "ahorro_fiscal", "label": "Ahorro Fiscal Anual Estimado con Ley Beckham", "unit": "€" },
    { "id": "salario_neto_beckham", "label": "Salario Neto Anual (con Ley Beckham)", "unit": "€" },
    { "id": "salario_neto_estandar", "label": "Salario Neto Anual (Régimen General)", "unit": "€" },
    { "id": "impuesto_total_beckham", "label": "Impuesto Total Pagado (Ley Beckham)", "unit": "€" },
    { "id": "impuesto_total_estandar", "label": "Impuesto Total Pagado (Régimen General)", "unit": "€" },
    { "id": "tipo_efectivo_beckham", "label": "Tipo Efectivo (Ley Beckham)", "unit": "%" },
    { "id": "tipo_efectivo_estandar", "label": "Tipo Efectivo (Régimen General)", "unit": "%" }
  ],
  "content": "### **Guía Definitiva sobre la Ley Beckham para Expatriados en España**\n\n**Análisis exhaustivo, ventajas, requisitos y comparativa fiscal para optimizar tus impuestos como impatriado.**\n\nEl Régimen Especial de Trabajadores Desplazados, conocido popularmente como **\"Ley Beckham\"**, es un incentivo fiscal clave diseñado para atraer talento y profesionales cualificados a España. Permite a los expatriados que cumplen ciertos requisitos tributar bajo unas condiciones ventajosas, similares a las de un no residente, durante el año en que adquieren la residencia fiscal y los cinco años siguientes.\n\nEste análisis no solo explica el funcionamiento de nuestra calculadora, sino que profundiza en todos los aspectos de la ley para ofrecer una visión completa y rigurosa, fundamental para una correcta planificación fiscal. **Recuerda que esta herramienta es una simulación y no sustituye el asesoramiento de un profesional fiscal cualificado.**\n\n### **Parte 1: Funcionamiento de la Calculadora y Parámetros Clave**\n\nEl objetivo de esta calculadora es ofrecer una estimación clara y rápida del **ahorro fiscal potencial** que se puede obtener al acogerse a la Ley Beckham en comparación con el régimen general de IRPF que se aplica por defecto a los residentes fiscales en España.\n\n* **Ingresos Brutos Anuales del Trabajo**: Es el único dato que necesitas. Corresponde al total de tus rendimientos del trabajo (salario, bonus, etc.) obtenidos en España. La calculadora se encarga de aplicar las normativas correspondientes a cada régimen.\n\n#### **Interpretación de los Resultados**\n\n* **Ahorro Fiscal Anual Estimado**: Es la cifra más importante. Muestra la diferencia positiva en tu salario neto anual gracias a la Ley Beckham.\n* **Salario Neto Anual (con y sin Ley Beckham)**: Compara la cantidad final que recibirías en tu cuenta bancaria bajo ambos escenarios.\n* **Impuesto Total Pagado y Tipo Efectivo**: Estas métricas te permiten visualizar no solo el monto total de impuestos pagados, sino el porcentaje real que representa sobre tus ingresos brutos, evidenciando la eficiencia fiscal del régimen especial.\n\n### **Parte 2: Guía Detallada de la Ley Beckham (Régimen Especial de Impatriados)**\n\n#### **Requisitos para Acogerse (Claves para la Elegibilidad)**\n\nPara poder beneficiarse de este régimen, es imperativo cumplir con todos los siguientes requisitos:\n\n1.  **No haber sido residente fiscal en España** durante los **cinco períodos impositivos** anteriores al desplazamiento.\n2.  El desplazamiento a territorio español debe producirse como consecuencia de un **contrato de trabajo** (la causa principal) o por la adquisición de la condición de **administrador** de una entidad.\n3.  No obtener rentas que se calificarían como obtenidas mediante un establecimiento permanente situado en territorio español.\n4.  La mayor parte de los rendimientos del trabajo no deben estar exentos de tributación en España.\n\n#### **Ventajas Fiscales Principales**\n\n1.  **Tributación de las Rentas del Trabajo**: Se aplica un **tipo fijo del 24%** sobre los primeros 600.000 € de base liquidable. Cualquier exceso por encima de esa cifra tributa al 47%. Esto contrasta con los tipos progresivos del IRPF general, que pueden alcanzar el 47% o más (según la comunidad autónoma) para rentas considerablemente más bajas.\n2.  **Tributación de Rentas del Capital y Otras Fuentes**: Solo se tributa en España por las rentas de fuente española. Los rendimientos del capital mobiliario (intereses, dividendos) y las ganancias patrimoniales obtenidas **fuera de España** no están sujetas a tributación en el IRPF español.\n3.  **Impuesto sobre el Patrimonio**: Únicamente se debe tributar por el patrimonio y los bienes situados en España, no por el patrimonio mundial.\n\n#### **Desventajas y Cuándo NO Conviene**\n\n* **Salarios Bajos**: Para salarios por debajo de aproximadamente 55.000€ - 60.000€, el régimen general de IRPF suele ser más beneficioso debido a sus tipos impositivos más bajos en los primeros tramos y a la posibilidad de aplicar reducciones y deducciones (mínimo personal y familiar, etc.) que no están disponibles en el régimen especial.\n* **Imposibilidad de aplicar exenciones**: No se puede aplicar la exención por trabajos realizados en el extranjero (conocida como \"7p\").\n* **Cotizaciones a la Seguridad Social**: Los gastos de la Seguridad Social no son deducibles de la base imponible en el régimen Beckham, mientras que en el régimen general sí lo son.\n\n### **Parte 3: Proceso de Solicitud y Aspectos Prácticos**\n\nLa solicitud para acogerse a este régimen se realiza mediante la presentación del **Modelo 149** ante la Agencia Tributaria. Es crucial presentarlo en un plazo máximo de **seis meses** desde la fecha de alta en la Seguridad Social en España. La no presentación en plazo implica la imposibilidad de optar por este régimen.\n\nLa declaración de la renta anual se presenta a través del **Modelo 151**, específico para este régimen especial.",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Qué es exactamente la Ley Beckham?", "acceptedAnswer": { "@type": "Answer", "text": "La Ley Beckham es un régimen fiscal especial en España que permite a los trabajadores extranjeros que se mudan al país tributar a un tipo fijo reducido del 24% sobre sus ingresos laborales (hasta 600.000€), similar a los no residentes, en lugar de utilizar los tipos progresivos del IRPF. Su objetivo es atraer talento y profesionales cualificados." } },
      { "@type": "Question", "name": "¿Cuándo conviene acogerse a la Ley Beckham?", "acceptedAnswer": { "@type": "Answer", "text": "Generalmente, la Ley Beckham es ventajosa para salarios brutos anuales superiores a 60.000€. Por debajo de esta cifra, el régimen general de IRPF suele ser más beneficioso debido a los tramos impositivos más bajos y a las deducciones aplicables. Esta calculadora ayuda a determinar el punto exacto de ahorro." } },
      { "@type": "Question", "name": "¿Qué impuestos se pagan con la Ley Beckham?", "acceptedAnswer": { "@type": "Answer", "text": "Con la Ley Beckham, las rentas del trabajo en España tributan a un tipo fijo del 24% hasta 600.000€ y al 47% sobre el exceso. Las rentas de capital (dividendos, intereses) de fuente española tributan entre el 19% y el 28%. Las rentas obtenidas fuera de España, por lo general, no tributan." } },
      { "@type": "Question", "name": "¿Cómo se solicita la aplicación de la Ley Beckham?", "acceptedAnswer": { "@type": "Answer", "text": "Se debe solicitar a través del Modelo 149 de la Agencia Tributaria en un plazo máximo de 6 meses desde el alta en la Seguridad Social en España. Una vez concedido, se aplica durante 6 años (el año del cambio de residencia y los 5 siguientes)." } }
    ]
  }
};


// --- ICONOS Y COMPONENTES DE UI (REUTILIZABLES) ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);

// --- COMPONENTE PARA INYECTAR EL SCHEMA SEO DINÁMICAMENTE ---
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);

// --- COMPONENTE PARA RENDERIZAR CONTENIDO (MARKDOWN SIMPLIFICADO) ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (<div className="prose prose-sm max-w-none text-gray-700">{blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        if (trimmedBlock.match(/^\d\.\s/)) {
            const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
            return <ol key={index} className="list-decimal pl-5 space-y-2 my-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
        }
        if (trimmedBlock) return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        return null;
    })}</div>);
};

// --- OPTIMIZACIÓN: CARGA DINÁMICA DEL GRÁFICO ---
// Definimos el tipo de las props que el gráfico dinámico espera recibir.
interface DynamicBarChartProps {
  data: { name: string; 'Régimen Beckham': number | undefined; 'Régimen General': number | undefined; }[];
}

const DynamicBarChart = dynamic(() => Promise.resolve(({ data }: DynamicBarChartProps) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`} tick={{ fontSize: 12 }} />
            <ChartTooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '0.5rem' }} formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)} />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
            <Bar dataKey="Régimen Beckham" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Régimen General" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
)), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-lg"><p className="text-gray-500">Cargando gráfico...</p></div>
});


// --- COMPONENTE PRINCIPAL DE LA CALCULADORA ---
const CalculadoraLeyBeckham: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const [inputValues, setInputValues] = useState<{ [key: string]: any }>({
        salario_bruto_anual: 90000,
    });

    const handleInputChange = (id: string, value: any) => {
        setInputValues(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setInputValues({ salario_bruto_anual: 90000 });

    const calculatedOutputs = useMemo(() => {
        const salario_bruto_anual = Number(inputValues.salario_bruto_anual) || 0;
        if (salario_bruto_anual === 0) return {
            ahorro_fiscal: 0, salario_neto_beckham: 0, salario_neto_estandar: 0,
            impuesto_total_beckham: 0, impuesto_total_estandar: 0,
            tipo_efectivo_beckham: 0, tipo_efectivo_estandar: 0,
        };

        // --- Lógica de cálculo Ley Beckham ---
        const base_imponible_beckham = salario_bruto_anual;
        const impuesto_beckham_tramo1 = Math.min(base_imponible_beckham, 600000) * 0.24;
        const impuesto_beckham_tramo2 = Math.max(0, base_imponible_beckham - 600000) * 0.47;
        const impuesto_total_beckham = impuesto_beckham_tramo1 + impuesto_beckham_tramo2;
        const contribuciones_ss = Math.min(salario_bruto_anual, 56646) * 0.0645; // Dato aprox. 2024/2025
        const salario_neto_beckham = salario_bruto_anual - impuesto_total_beckham - contribuciones_ss;
        const tipo_efectivo_beckham = (impuesto_total_beckham / salario_bruto_anual) * 100;

        // --- Lógica de cálculo Régimen General (IRPF) ---
        const gastos_deducibles = 2000;
        const base_imponible_estandar = Math.max(0, salario_bruto_anual - contribuciones_ss - gastos_deducibles);
        const tramos_irpf = [
            { limite: 12450, tipo: 0.19 }, { limite: 20200, tipo: 0.24 },
            { limite: 35200, tipo: 0.30 }, { limite: 60000, tipo: 0.37 },
            { limite: 300000, tipo: 0.45 }, { limite: Infinity, tipo: 0.47 },
        ];
        let impuesto_total_estandar = 0;
        let base_restante = base_imponible_estandar;
        let limite_anterior = 0;
        for (const tramo of tramos_irpf) {
            if (base_restante <= 0) break;
            const base_en_tramo = Math.min(base_restante, tramo.limite - limite_anterior);
            impuesto_total_estandar += base_en_tramo * tramo.tipo;
            base_restante -= base_en_tramo;
            limite_anterior = tramo.limite;
        }
        const salario_neto_estandar = salario_bruto_anual - impuesto_total_estandar - contribuciones_ss;
        const tipo_efectivo_estandar = (impuesto_total_estandar / salario_bruto_anual) * 100;
        const ahorro_fiscal = salario_neto_beckham - salario_neto_estandar;

        return {
            ahorro_fiscal, salario_neto_beckham, salario_neto_estandar,
            impuesto_total_beckham, impuesto_total_estandar,
            tipo_efectivo_beckham, tipo_efectivo_estandar,
        };
    }, [inputValues]);

    const formatValue = (value: number | undefined, unit: string) => {
        if (value === undefined || isNaN(value)) return '...';
        if (unit === '€') return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
        if (unit === '%') return `${value.toFixed(2)}%`;
        return value.toString();
    };

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) { alert("Error al exportar a PDF."); }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const resultData = { slug, title, inputs: inputValues, outputs: calculatedOutputs, ts: Date.now() };
            const storedResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([resultData, ...storedResults].slice(0, 10)));
            alert("¡Resultado guardado en el almacenamiento local!");
        } catch (e) { alert("No se pudo guardar el resultado."); }
    }, [slug, title, inputValues, calculatedOutputs]);

    const chartData = [
        { name: 'Salario Neto', 'Régimen Beckham': calculatedOutputs.salario_neto_beckham, 'Régimen General': calculatedOutputs.salario_neto_estandar },
        { name: 'Impuestos Pagados', 'Régimen Beckham': calculatedOutputs.impuesto_total_beckham, 'Régimen General': calculatedOutputs.impuesto_total_estandar },
    ];
    
    const primaryOutput = outputs.find(o => o.id === 'ahorro_fiscal');

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50/50 font-sans">
                {/* Columna principal de la calculadora */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                        <p className="text-gray-600 mb-6">Estima tu ahorro fiscal como expatriado en España comparando el régimen especial con el régimen general de IRPF.</p>
                        
                        <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-8">
                            <strong>Disclaimer:</strong> Esta herramienta proporciona una estimación y no constituye asesoramiento fiscal. Los cálculos se basan en la normativa general estatal y pueden variar. Consulta siempre con un profesional.
                        </div>

                        {/* --- Zona de Inputs --- */}
                        <div className="space-y-6">
                            {inputs.map(input => (
                                <div key={input.id}>
                                    <label className="block text-base font-medium mb-2 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                    <div className="relative">
                                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 px-4 py-3 text-lg" type="number" min={input.min} step={input.step} value={inputValues[input.id]} onChange={(e) => handleInputChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                        {input.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{input.unit}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- Zona de Outputs --- */}
                        <div className="mt-10">
                            {primaryOutput && (
                                <div className="text-center border-2 border-indigo-500 bg-indigo-50 rounded-lg p-6 mb-8">
                                    <h2 className="text-lg font-semibold text-indigo-800">{primaryOutput.label}</h2>
                                    <p className="text-4xl md:text-5xl font-bold text-indigo-600 my-2">
                                      {isClient ? formatValue((calculatedOutputs as any)[primaryOutput.id], primaryOutput.unit) : '...'}
                                    </p>
                                    <p className="text-indigo-500">{(calculatedOutputs as any).ahorro_fiscal > 0 ? "¡Estás ahorrando dinero!" : "El régimen general podría ser más beneficioso"}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {outputs.filter(o => o.id !== 'ahorro_fiscal').map(output => (
                                    <div key={output.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-600">{output.label}</h3>
                                        <p className="text-2xl font-semibold text-gray-800 mt-1">
                                            {isClient ? formatValue((calculatedOutputs as any)[output.id], output.unit) : '...'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- Zona del Gráfico --- */}
                        <div className="mt-10">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Comparativa Visual</h3>
                            {isClient && <DynamicBarChart data={chartData} />}
                        </div>
                    </div>

                    {/* --- Fórmula y Fuentes --- */}
                    <div className="mt-6 border rounded-lg p-4 bg-white shadow-md">
                        <h3 className="font-semibold text-gray-800">Fórmula de Cálculo Simplificada</h3>
                        <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-50 rounded font-mono break-words">
                            <strong>Impuesto Beckham:</strong> (MIN(Salario, 600k) * 24%) + (MAX(0, Salario - 600k) * 47%)<br/>
                            <strong>Impuesto General:</strong> Aplicación de tramos IRPF sobre (Salario - SS - 2000€)
                        </p>
                    </div>
                </div>

                {/* Columna lateral de contenido y acciones */}
                <aside className="lg:col-span-2 space-y-6">
                    <section className="border rounded-2xl p-6 bg-white shadow-lg sticky top-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Acciones</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-center font-semibold border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar Resultado</button>
                            <button onClick={handleExportPDF} className="w-full text-center font-semibold border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar a PDF</button>
                            <button onClick={handleReset} className="w-full text-center font-semibold border border-red-300 text-red-700 bg-red-50 rounded-lg px-4 py-2 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reiniciar</button>
                        </div>
                    </section>
                    <section className="border rounded-2xl p-6 bg-white shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Guía de Comprensión</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-2xl p-6 bg-white shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Fuentes y Referencias</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-practico-renta-patrimonio/capitulo-16-regimen-especial-trabajadores-desplazados.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria: Régimen especial de trabajadores desplazados</a></li>
                            <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2004-4371" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ley 35/2006, de 28 de noviembre, del IRPF (Artículo 93)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraLeyBeckham;
