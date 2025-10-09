'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {text}
        </div>
    </div>
);

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "calculadora-irpf-medicos",
  "category": "Impuestos y trabajo autonomo",
  "title": "Calculadora de IRPF para médicos y profesionales sanitarios autónomos",
  "description": "Estima el IRPF anual a pagar como profesional sanitario autónomo en España bajo el régimen de estimación directa.",
  "lang": "es",
  "inputs": [
    { "id": "ingresosAnualesBrutos", "label": "Ingresos brutos anuales", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Introduce el total de ingresos facturados en un año, antes de aplicar cualquier gasto o impuesto." },
    { "id": "cuotaAutonomosMensual", "label": "Cuota de autónomos mensual", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "La cuota mensual que pagas a la Seguridad Social. Es uno de los gastos deducibles más importantes." },
    { "id": "otrosGastosDeducibles", "label": "Otros gastos deducibles anuales", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Suma anual de otros gastos relacionados con tu actividad: seguro de responsabilidad civil, colegio profesional, congresos, material, etc." }
  ],
  "outputs": [
    { "id": "irpfAPagar", "label": "Total IRPF a pagar", "unit": "€" },
    { "id": "tipoEfectivo", "label": "Tipo efectivo medio", "unit": "%" },
    { "id": "ingresosNetosAnuales", "label": "Ingresos netos anuales (después de IRPF)", "unit": "€" },
    { "id": "ingresosNetosMensuales", "label": "Ingresos netos mensuales (después de IRPF)", "unit": "€" }
  ],
  "content": "### Introducción\n\nEsta calculadora está diseñada específicamente para **médicos, fisioterapeutas, psicólogos, dentistas y otros profesionales sanitarios** que trabajan como autónomos en España. Te permite obtener una estimación precisa y rápida del Impuesto sobre la Renta de las Personas Físicas (IRPF) que deberás pagar, basándose en el régimen de **estimación directa simplificada**, el más común para este colectivo. Comprender tu carga fiscal es el primer paso para una planificación financiera eficaz y para optimizar tus obligaciones tributarias.\n\n### Guía de Uso de la Calculadora\n\nPara obtener tu estimación, simplemente completa los siguientes campos:\n\n* **Ingresos brutos anuales**: Es la suma total de todas las facturas que has emitido a tus pacientes o clientes durante un año fiscal, sin descontar ningún gasto. Es tu facturación total.\n* **Cuota de autónomos mensual**: El importe que abonas cada mes a la Seguridad Social. Este es un gasto deducible fundamental en tu declaración.\n* **Otros gastos deducibles anuales**: Aquí debes sumar todos los demás gastos directamente relacionados con tu actividad profesional. Más abajo, en la sección de análisis, detallamos cuáles son los más importantes para el sector sanitario.\n\n### Metodología de Cálculo Explicada\n\nLa calculadora sigue los pasos que la Agencia Tributaria establece para el cálculo del IRPF en estimación directa simplificada, ofreciendo total transparencia sobre el proceso:\n\n1.  **Cálculo del Rendimiento Neto**: Primero, se suman todos tus gastos deducibles (la cuota de autónomos anualizada más los otros gastos) y se restan de tus ingresos brutos. Esto nos da el 'Rendimiento Neto Previo'.\n2.  **Reducción por Gastos Genéricos**: Sobre el Rendimiento Neto Previo, la ley permite una deducción adicional del 7% en concepto de 'gastos de difícil justificación', con un tope máximo de 2.000 € anuales. Este beneficio simplifica la gestión de pequeños gastos no documentados.\n3.  **Obtención de la Base Imponible**: Al restar esta reducción del 7%, obtenemos la Base Imponible General. Esta es la cantidad sobre la cual se aplicarán los impuestos.\n4.  **Aplicación de Tramos Progresivos**: El IRPF es un impuesto progresivo. La Base Imponible se divide en 'tramos', y a cada tramo se le aplica un porcentaje diferente. Nuestra calculadora utiliza los **tramos generales del IRPF vigentes** (suma del tipo estatal y el autonómico teórico) para calcular la cuota a pagar.\n\n_**Nota Importante**_: Esta herramienta no tiene en cuenta deducciones personales o familiares (por hijos, ascendientes, planes de pensiones, hipoteca, etc.), que podrían reducir tu cuota final. Es una simulación centrada exclusivamente en los rendimientos de la actividad económica.\n\n### Análisis Profundo: Gastos Deducibles Clave para Profesionales Sanitarios\n\nOptimizar tu declaración de IRPF pasa por conocer y aplicar correctamente todos los gastos deducibles permitidos. Para un profesional sanitario, los más relevantes son:\n\n* **Cuotas de Colegios Profesionales**: La cuota anual del Colegio de Médicos, Fisioterapeutas, etc., es 100% deducible.\n* **Seguro de Responsabilidad Civil Profesional**: Imprescindible en el sector y totalmente deducible.\n* **Formación y Congresos**: Cursos, másteres, seminarios y congresos directamente relacionados con tu especialidad. Incluye matrículas, desplazamientos, alojamiento y dietas con los límites legales.\n* **Compra de Material Sanitario**: Amortización de equipos médicos (ecógrafos, camillas), material fungible (guantes, jeringuillas) y vestuario profesional.\n* **Suministros de la Consulta u Oficina**: Si tienes una consulta, puedes deducir gastos como alquiler, electricidad, agua, internet y teléfono. Si trabajas desde casa, puedes deducir un porcentaje de los suministros del hogar (normalmente el 30% de la parte de la vivienda afecta a la actividad).\n* **Publicidad y Marketing**: Gastos en publicidad online, creación de página web o marketing para atraer pacientes.\n* **Software y Suscripciones**: Programas de gestión de pacientes, bases de datos médicas o suscripciones a revistas científicas especializadas.\n\nUna correcta contabilidad de estos gastos es crucial para no pagar más impuestos de los necesarios.\n\n### Preguntas Frecuentes (FAQ)\n\n1.  **¿Esta calculadora sirve si tributo por módulos (estimación objetiva)?**\n    No. Esta calculadora está diseñada para el régimen de estimación directa, que se basa en ingresos y gastos reales. La gran mayoría de los profesionales sanitarios cualificados tributan por este régimen.\n2.  **¿Tengo que presentar declaraciones trimestrales?**\n    Sí. Como autónomo, estás obligado a adelantar parte de tu IRPF a Hacienda cada trimestre a través del **Modelo 130**. Debes ingresar el 20% de tu rendimiento neto acumulado. El resultado de esta calculadora es el total anual; los pagos trimestrales son anticipos a cuenta de esta cifra final.\n3.  **¿Qué diferencia hay entre el tipo efectivo y el tipo marginal?**\n    El **tipo marginal** es el porcentaje que pagas por el último euro que ganas (el del tramo más alto que alcanzas). El **tipo efectivo medio** (que te muestra la calculadora) es el porcentaje real que representa el impuesto sobre el total de tus ingresos brutos. Es una medida mucho más fiel de tu carga fiscal real.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "¿Esta calculadora sirve si tributo por módulos (estimación objetiva)?", "acceptedAnswer": { "@type": "Answer", "text": "No. Esta calculadora está diseñada para el régimen de estimación directa, que se basa en ingresos y gastos reales. La gran mayoría de los profesionales sanitarios cualificados tributan por este régimen." } }, { "@type": "Question", "name": "¿Tengo que presentar declaraciones trimestrales?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Como autónomo, estás obligado a adelantar parte de tu IRPF a Hacienda cada trimestre a través del Modelo 130. Debes ingresar el 20% de tu rendimiento neto acumulado. El resultado de esta calculadora es el total anual; los pagos trimestrales son anticipos a cuenta de esta cifra final." } }, { "@type": "Question", "name": "¿Qué diferencia hay entre el tipo efectivo y el tipo marginal?", "acceptedAnswer": { "@type": "Answer", "text": "El tipo marginal es el porcentaje que pagas por el último euro que ganas (el del tramo más alto que alcanzas). El tipo efectivo medio (que te muestra la calculadora) es el porcentaje real que representa el impuesto sobre el total de tus ingresos brutos. Es una medida mucho más fiel de tu carga fiscal real." } } ] }
};

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema = () => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }}
    />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace('### ', '')) }} />;
                }
                if (trimmedBlock.startsWith('* ')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
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
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Importazione dinamica del grafico ---
const DynamicBarChart = dynamic(
    () => import('recharts').then(mod => {
        const ChartComponent = ({ data }: { data: any[] }) => (
            <mod.ResponsiveContainer width="100%" height="100%">
                <mod.BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <mod.XAxis type="number" hide />
                    <mod.YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <mod.Tooltip
                        cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                        formatter={(value: number, name: string) => [
                            new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value),
                            name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                    />
                    <mod.Bar dataKey="valor" name="Valor" barSize={30}>
                        {data.map((entry) => (
                            <mod.Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                    </mod.Bar>
                </mod.BarChart>
            </mod.ResponsiveContainer>
        );
        return ChartComponent;
    }),
    {
        loading: () => <div className="flex items-center justify-center h-full w-full text-gray-500">Cargando gráfico...</div>,
        ssr: false
    }
);


// --- Componente Principale del Calcolatore ---
const CalculadoraIrpfMedicos: React.FC = () => {
    const { slug, title, description, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        ingresosAnualesBrutos: 75000,
        cuotaAutonomosMensual: 350,
        otrosGastosDeducibles: 8000
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { ingresosAnualesBrutos, cuotaAutonomosMensual, otrosGastosDeducibles } = states;

        const gastosAutonomosAnual = cuotaAutonomosMensual * 12;
        const gastosTotalesDeducibles = gastosAutonomosAnual + otrosGastosDeducibles;
        const rendimientoNetoPrevio = ingresosAnualesBrutos - gastosTotalesDeducibles;

        if (rendimientoNetoPrevio <= 0) {
            return { irpfAPagar: 0, tipoEfectivo: 0, ingresosNetosAnuales: rendimientoNetoPrevio, ingresosNetosMensuales: rendimientoNetoPrevio / 12, rendimientoNetoPrevio, gastosTotalesDeducibles };
        }

        const reduccionGastosGenericos = Math.min(rendimientoNetoPrevio * 0.07, 2000);
        const baseImponible = rendimientoNetoPrevio - reduccionGastosGenericos;

        const tramos = [
            { limite: 12450, tipo: 0.19 },
            { limite: 20200, tipo: 0.24 },
            { limite: 35200, tipo: 0.30 },
            { limite: 60000, tipo: 0.37 },
            { limite: 300000, tipo: 0.45 },
            { limite: Infinity, tipo: 0.47 }
        ];

        let irpfAPagar = 0;
        let baseRestante = baseImponible;
        let limiteAnterior = 0;

        for (const tramo of tramos) {
            if (baseRestante > 0) {
                const baseEnTramo = Math.min(baseRestante, tramo.limite - limiteAnterior);
                irpfAPagar += baseEnTramo * tramo.tipo;
                baseRestante -= baseEnTramo;
                limiteAnterior = tramo.limite;
            } else {
                break;
            }
        }

        const ingresosNetosAnuales = rendimientoNetoPrevio - irpfAPagar;
        const ingresosNetosMensuales = ingresosNetosAnuales / 12;
        const tipoEfectivo = (ingresosAnualesBrutos > 0) ? (irpfAPagar / ingresosAnualesBrutos) * 100 : 0;

        return { irpfAPagar, tipoEfectivo, ingresosNetosAnuales, ingresosNetosMensuales, rendimientoNetoPrevio, gastosTotalesDeducibles };
    }, [states]);

    const chartData = [
        { name: 'Ingresos Brutos', valor: states.ingresosAnualesBrutos, color: '#4f46e5' },
        { name: 'Gastos Deducibles', valor: calculatedOutputs.gastosTotalesDeducibles, color: '#fca5a5' },
        { name: 'Rendimiento Neto', valor: calculatedOutputs.rendimientoNetoPrevio, color: '#a5b4fc' },
        { name: 'Impuesto (IRPF)', valor: calculatedOutputs.irpfAPagar, color: '#ef4444' },
        { name: 'Ingreso Neto Final', valor: calculatedOutputs.ingresosNetosAnuales, color: '#22c55e' },
    ];

    const formulaUsata = `Base Imponible = (Ingresos Brutos - Gastos Totales) - MIN( (Ingresos Brutos - Gastos Totales) * 0.07, 2000€ )`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            const element = calcolatoreRef.current;
            if (!element) return;

            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            
            const pdf = new jsPDF({ orientation: "p", unit: "px", format: [canvas.width, canvas.height] });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`${slug}.pdf`);
        } catch (e) { 
            console.error(e);
            alert("Error al exportar a PDF."); 
        }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { rendimientoNetoPrevio, gastosTotalesDeducibles, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results_es") || "[]");
            localStorage.setItem("calc_results_es", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Resultado guardado con éxito!");
        } catch { alert("No se pudo guardar el resultado."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => new Intl.NumberFormat('es-ES', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + '%';

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="p-1" ref={calcolatoreRef}>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">{description}</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Aviso legal:</strong> Esta herramienta ofrece una simulación con fines informativos y no sustituye el asesoramiento de un gestor fiscal. No considera deducciones personales.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-lg">
                                {inputs.map(input => (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        <div className="relative">
                                            <input 
                                                id={input.id} 
                                                aria-label={input.label} 
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-10 py-2 text-right" 
                                                type="number" 
                                                min={input.min} 
                                                step={input.step} 
                                                value={states[input.id]} 
                                                onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} 
                                            />
                                            {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados Estimados</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'irpfAPagar' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'irpfAPagar' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            <span>
                                                {isClient
                                                    ? output.unit === '%'
                                                        ? formatPercentage((calculatedOutputs as any)[output.id])
                                                        : formatCurrency((calculatedOutputs as any)[output.id])
                                                    : '...'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose Visual de Ingresos</h3>
                                <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                                    {isClient && <DynamicBarChart data={chartData} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Fórmula de Cálculo Simplificada</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Herramientas</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guía para Entender el IRPF</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-8-regimenes-especiales/estimacion-directa-simplificada.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Régimen de estimación directa simplificada</a></li>
                            <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 35/2006, de 28 de noviembre, del IRPF</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraIrpfMedicos;