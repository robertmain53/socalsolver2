'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Static Data and Configuration ---
const calculatorData = {
  "slug": "calculadora-coste-asesor-financiero",
  "category": "Bienes Raíces y Vivienda",
  "title": "Calculadora de Coste de un Asesor Financiero (Robo-advisor vs. Humano)",
  "lang": "es",
  "description": "Visualiza cómo las comisiones impactan tu patrimonio a largo plazo y cuantifica la diferencia real entre un robo-advisor y un asesor tradicional.",
  "inputs": [
    { "id": "inversionInicial", "label": "Inversión Inicial", "type": "number" as const, "unit": "€", "min": 1000, "step": 1000, "tooltip": "La cantidad de dinero con la que comienzas tu inversión." },
    { "id": "aportacionAnual", "label": "Aportación Anual", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "La cantidad adicional que planeas invertir cada año. Se añade al principio de cada año." },
    { "id": "horizonteInversion", "label": "Horizonte Temporal", "type": "number" as const, "unit": "años", "min": 1, "max": 50, "step": 1, "tooltip": "El número total de años que planeas mantener la inversión. El impacto de las comisiones se magnifica con el tiempo." },
    { "id": "rentabilidadAnualBruta", "label": "Rentabilidad Anual Bruta", "type": "range" as const, "unit": "%", "min": 0, "max": 15, "step": 0.5, "tooltip": "La rentabilidad media anual esperada de la cartera ANTES de descontar cualquier tipo de comisión." },
    { "id": "comisionRoboAdvisor", "label": "Comisión Total Anual Robo-advisor", "type": "range" as const, "unit": "%", "min": 0.2, "max": 2, "step": 0.05, "tooltip": "Suma de todas las comisiones: gestión, custodia y coste medio de los fondos (TER). Un valor típico es 0.60% - 0.80%." },
    { "id": "comisionAsesorHumano", "label": "Comisión Total Anual Asesor Humano", "type": "range" as const, "unit": "%", "min": 0.5, "max": 3, "step": 0.05, "tooltip": "Comisión explícita de gestión o asesoramiento. Puede variar mucho, pero un 1.0% - 1.75% sobre el patrimonio es habitual." }
  ],
  "outputs": [
    { "id": "valorFinalNetoRobo", "label": "Patrimonio Final con Robo-advisor", "unit": "€" },
    { "id": "valorFinalNetoHumano", "label": "Patrimonio Final con Asesor Humano", "unit": "€" },
    { "id": "diferenciaPatrimonio", "label": "Coste de Oportunidad del Asesor Humano", "unit": "€" },
    { "id": "costeTotalRobo", "label": "Total Pagado en Comisiones (Robo-advisor)", "unit": "€" },
    { "id": "costeTotalHumano", "label": "Total Pagado en Comisiones (Asesor Humano)", "unit": "€" }
  ],
  "content": "### Introducción\n\nElegir cómo gestionar tus inversiones es una decisión con un impacto millonario a largo plazo. Las comisiones, por pequeñas que parezcan, actúan como un lastre que frena el poder del interés compuesto. Esta calculadora ha sido diseñada para **cuantificar de forma clara y visual** el coste real de optar por un **robo-advisor** de bajas comisiones frente a un **asesor financiero tradicional**. No se trata de decir qué opción es mejor, sino de darte los datos para que puedas valorar si el servicio personalizado de un asesor humano justifica su coste de oportunidad a lo largo de tu vida como inversor.\n\n### Guida all'Uso del Calcolatore\n\nPara visualizar el impacto de las comisiones en tu patrimonio futuro, ajusta los siguientes parámetros:\n\n* **Inversión Inicial (€)**: El capital del que partes.\n* **Aportación Anual (€)**: La suma de tus ahorros que invertirás cada año.\n* **Horizonte Temporal (años)**: El tiempo que tu dinero estará trabajando para ti.\n* **Rentabilidad Anual Bruta (%)**: El rendimiento esperado de tu cartera antes de que se aplique ninguna comisión.\n* **Comisión Total Anual Robo-advisor (%)**: Introduce el coste total del robo-advisor. Este suele ser la suma de la comisión de gestión, la de custodia y el coste medio (TER) de los fondos o ETFs en los que invierte. Un rango común en España es 0.5% - 0.9%.\n* **Comisión Total Anual Asesor Humano (%)**: La comisión de gestión o asesoramiento que te cobra un profesional. Suele ser un porcentaje sobre tu patrimonio y, a menudo, no incluye el coste de los productos que recomienda. Un rango típico es 1.0% - 2.0%.\n\n### Metodologia di Calcolo Spiegata\n\nLa herramienta proyecta el crecimiento de tu patrimonio año a año bajo dos escenarios paralelos. La fórmula clave es la **capitalización compuesta neta**:\n\n1.  **Capital al Inicio del Año**: Es el capital neto del año anterior más la nueva `Aportación Anual`.\n2.  **Crecimiento Bruto**: `Capital al Inicio del Año * (1 + Rentabilidad Bruta / 100)`\n3.  **Comisión Anual**: `Crecimiento Bruto * (Comisión Anual / 100)`\n4.  **Capital Neto al Final del Año**: `Crecimiento Bruto - Comisión Anual`\n\nEste ciclo se repite para cada año del horizonte de inversión. El **\"Coste de Oportunidad\"** no es solo la suma de las comisiones que pagas de más, sino que también incluye **todos los rendimientos futuros que ese dinero extra en comisiones nunca llegará a generar**. Es el verdadero coste oculto de una gestión más cara, y esta calculadora lo saca a la luz.\n\n### Análisis Approfondita: ¿Cuándo Merece la Pena Pagar Más por un Asesor Humano?\n\nSi la calculadora muestra una diferencia de patrimonio tan abrumadora, ¿por qué existen los asesores humanos? Porque los números no lo son todo. Un buen asesor humano aporta valor más allá de la selección de activos, que puede justificar su coste en ciertas situaciones:\n\n* **Planificación Financiera Integral**: Un asesor humano no solo invierte tu dinero. Puede ayudarte con la planificación para la jubilación, optimización fiscal (sucesiones, donaciones), estructuración de patrimonio complejo y seguros. Un robo-advisor solo gestiona una cartera de inversión.\n* **Behavioral Coaching (Entrenador Conductual)**: El mayor enemigo de un inversor es él mismo. Un asesor humano actúa como barrera contra las decisiones impulsivas durante las caídas del mercado, como vender en pánico. Este servicio puede, literalmente, salvar a un inversor de cometer errores que costarían mucho más que las comisiones de toda una vida.\n* **Situaciones Complejas y Personalizadas**: Si tienes un patrimonio elevado, estructuras empresariales, necesitas productos de inversión alternativos o tienes necesidades muy específicas, un robo-advisor se queda corto. El asesoramiento a medida es el terreno del profesional humano.\n* **Accountability y Confianza**: Para muchas personas, la tranquilidad de tener un profesional cualificado al otro lado del teléfono, alguien que conoce su situación personal y familiar, es un valor intangible por el que están dispuestas a pagar.\n\nLa elección ideal no es unánime. Si eres un inversor disciplinado con necesidades estándar, un robo-advisor es imbatible en eficiencia. Si tu situación es compleja o valoras un acompañamiento cercano, el coste de un asesor humano puede ser una inversión muy rentable en tranquilidad y resultados a largo plazo.\n\n### Domande Frequenti (FAQ)\n\n**1. ¿Las comisiones de los robo-advisors ya incluyen el coste de los fondos (TER)?**\nDepende del proveedor. La mayoría lo desglosan. Para una comparación justa, en el campo 'Comisión Total Anual Robo-advisor' debes sumar la comisión de gestión, la de custodia (si la hay) y el coste medio ponderado de los fondos (TER) de la cartera. Esta cifra final es la que realmente impacta en tu rentabilidad.\n\n**2. ¿Esta calculadora tiene en cuenta los impuestos?**\nNo, la calculadora se centra exclusivamente en el impacto de las comisiones sobre el crecimiento del patrimonio. Los impuestos sobre las plusvalías se pagarían en el momento del reembolso final y serían los mismos en ambos escenarios, por lo que no afectan a la comparación del *coste* del servicio.\n\n**3. Un asesor humano me dice que puede conseguir más rentabilidad que un robo-advisor. ¿Es posible?**\nEs posible, pero estadísticamente muy improbable a largo plazo. La mayoría de gestores activos no consiguen batir a sus índices de referencia (la estrategia que siguen los robo-advisors) de forma consistente una vez se descuentan las comisiones. La principal ventaja de un asesor no debería ser prometer una mayor rentabilidad, sino ofrecer un servicio de planificación y acompañamiento integral.\n",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "¿Las comisiones de los robo-advisors ya incluyen el coste de los fondos (TER)?", "acceptedAnswer": { "@type": "Answer", "text": "Depende del proveedor. La mayoría lo desglosan. Para una comparación justa, en el campo 'Comisión Total Anual Robo-advisor' debes sumar la comisión de gestión, la de custodia (si la hay) y el coste medio ponderado de los fondos (TER) de la cartera. Esta cifra final es la que realmente impacta en tu rentabilidad." } }, { "@type": "Question", "name": "¿Esta calculadora tiene en cuenta los impuestos?", "acceptedAnswer": { "@type": "Answer", "text": "No, la calculadora se centra exclusivamente en el impacto de las comisiones sobre el crecimiento del patrimonio. Los impuestos sobre las plusvalías se pagarían en el momento del reembolso final y serían los mismos en ambos escenarios, por lo que no afectan a la comparación del *coste* del servicio." } }, { "@type": "Question", "name": "Un asesor humano me dice que puede conseguir más rentabilidad que un robo-advisor. ¿Es posible?", "acceptedAnswer": { "@type": "Answer", "text": "Es posible, pero estadísticamente muy improbable a largo plazo. La mayoría de gestores activos no consiguen batir a sus índices de referencia (la estrategia que siguen los robo-advisors) de forma consistente una vez se descuentan las comisiones. La principal ventaja de un asesor no debería ser prometer una mayor rentabilidad, sino ofrecer un servicio de planificación y acompañamiento integral." } } ] }
};

// --- Dynamic Chart Component with Loader ---
const DynamicLineChart = dynamic(
    () => Promise.resolve(({ data }: { data: any[] }) => (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis tickFormatter={(value) => `€${Number(value / 1000).toFixed(0)}k`} />
                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="Robo-advisor" stroke="#4f46e5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Asesor Humano" stroke="#dc2626" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    )),
    { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-lg">Cargando gráfico...</div> }
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
const CalculadoraCosteAsesorFinanciero: React.FC = () => {
    const { slug, title, description, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        inversionInicial: 5000,
        aportacionAnual: 3600,
        horizonteInversion: 30,
        rentabilidadAnualBruta: 7.0,
        comisionRoboAdvisor: 0.75,
        comisionAsesorHumano: 1.5
    };

    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);
    const handleStateChange = (id: string, value: any) => { setStates(prev => ({ ...prev, [id]: value })); };
    const handleReset = () => { setStates(initialStates); };

    const { calculatedOutputs, chartData } = useMemo(() => {
        const { inversionInicial, aportacionAnual, horizonteInversion, rentabilidadAnualBruta, comisionRoboAdvisor, comisionAsesorHumano } = states;

        const R = rentabilidadAnualBruta / 100;
        const CR = comisionRoboAdvisor / 100;
        const CH = comisionAsesorHumano / 100;

        let capitalRobo = inversionInicial;
        let capitalHumano = inversionInicial;
        let costeTotalRobo = 0;
        let costeTotalHumano = 0;
        
        const newChartData = [{ año: 0, "Robo-advisor": inversionInicial, "Asesor Humano": inversionInicial }];

        for (let i = 1; i <= horizonteInversion; i++) {
            if (i > 1) {
                capitalRobo += aportacionAnual;
                capitalHumano += aportacionAnual;
            }

            const capitalBrutoRobo = capitalRobo * (1 + R);
            const comisionAnualRobo = capitalBrutoRobo * CR;
            costeTotalRobo += comisionAnualRobo;
            capitalRobo = capitalBrutoRobo - comisionAnualRobo;

            const capitalBrutoHumano = capitalHumano * (1 + R);
            const comisionAnualHumano = capitalBrutoHumano * CH;
            costeTotalHumano += comisionAnualHumano;
            capitalHumano = capitalBrutoHumano - comisionAnualHumano;
            
            newChartData.push({ año: i, "Robo-advisor": Math.round(capitalRobo), "Asesor Humano": Math.round(capitalHumano) });
        }

        return {
            calculatedOutputs: {
                valorFinalNetoRobo: capitalRobo,
                valorFinalNetoHumano: capitalHumano,
                diferenciaPatrimonio: capitalRobo - capitalHumano,
                costeTotalRobo,
                costeTotalHumano
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
                                <div key={input.id} className={input.type === 'range' ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center justify-between">
                                        <span className='flex items-center'>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                        </span>
                                        {input.type === 'range' && <span className='font-bold text-indigo-600'>{states[input.id]} {input.unit}</span>}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {input.type === 'range' ? (
                                            <input
                                                id={input.id}
                                                aria-label={input.label}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                type="range"
                                                min={input.min} max={input.max} step={input.step}
                                                value={states[input.id]}
                                                onChange={(e) => handleStateChange(input.id, parseFloat(e.target.value))}
                                            />
                                        ) : (
                                            <>
                                                <input
                                                    id={input.id}
                                                    aria-label={input.label}
                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                                    type="number"
                                                    min={input.min} step={input.step} max={input.max}
                                                    value={states[input.id]}
                                                    onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                                                />
                                                {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados Proyectados</h2>
                             {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'diferenciaPatrimonio' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'diferenciaPatrimonio' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Crecimiento del Patrimonio a lo Largo del Tiempo</h3>
                            {isClient && <DynamicLineChart data={chartData} />}
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
                            <li><a href="https://www.cnmv.es/portal/inversor/comisiones.aspx" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">CNMV: Guía sobre Comisiones</a></li>
                            <li><a href="https://www.bde.es/cliente/productos/servicios/comisiones.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Banco de España: Información sobre comisiones</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraCosteAsesorFinanciero;