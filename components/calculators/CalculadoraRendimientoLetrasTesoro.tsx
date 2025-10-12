'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaInfoCircle, FaCalculator, FaFilePdf, FaSave, FaTrash } from 'react-icons/fa';

// --- TIPI E DATI ---

type CalculatorInput = {
  id: string;
  label: string;
  type: 'number' | 'select';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip: string;
  options?: { value: number; label: string }[];
};

const calculatorData = {
  "slug": "calculadora-rendimiento-letras-tesoro",
  "category": "Bienes Raíces y Vivienda",
  "title": "Calculadora de Rendimiento Neto de Letras del Tesoro",
  "lang": "es",
  "inputs": [
    { "id": "importe_nominal", "label": "Inversión Nominal", "type": "number" as const, "unit": "€", "min": 1000, "step": 1000, "tooltip": "El valor facial de las Letras que deseas comprar. La inversión mínima es de 1.000 € y debe ser en múltiplos de 1.000 €." },
    { "id": "plazo", "label": "Plazo de la Letra", "type": "select" as const, "options": [{ "value": 3, "label": "3 Meses" }, { "value": 6, "label": "6 Meses" }, { "value": 9, "label": "9 Meses" }, { "value": 12, "label": "12 Meses" }], "tooltip": "Elige el vencimiento de la Letra del Tesoro. El tipo de interés varía para cada plazo." },
    { "id": "tipo_interes_marginal", "label": "Tipo de Interés Marginal (TNA)", "type": "number" as const, "unit": "%", "min": -1, "max": 10, "step": 0.01, "tooltip": "El tipo de interés marginal resultante de la última subasta para el plazo seleccionado. Este es el rendimiento anual nominal." },
    { "id": "comisiones", "label": "Comisiones Totales", "type": "number" as const, "unit": "€", "min": 0, "step": 0.1, "tooltip": "Si operas a través de un banco o bróker, introduce las comisiones totales (compra, venta, custodia). Si compras directamente al Tesoro, la comisión es del 0,15% (1,5€ por cada 1.000€)." }
  ],
  "outputs": [
    { "id": "importe_efectivo", "label": "Importe Efectivo a Pagar", "unit": "€" },
    { "id": "rendimiento_bruto", "label": "Rendimiento Bruto Total", "unit": "€" },
    { "id": "impuestos_estimados", "label": "Impuestos Estimados (IRPF Ahorro)", "unit": "€" },
    { "id": "rendimiento_neto", "label": "Rendimiento Neto Final", "unit": "€", "main": true },
    { "id": "tae_bruta", "label": "Rentabilidad Anual Efectiva (TAE) Bruta", "unit": "%" },
    { "id": "tae_neta", "label": "Rentabilidad Anual Efectiva (TAE) Neta", "unit": "%" }
  ],
  "content": "### Introducción: ¿Cuál es tu ganancia real?\n\nInvertir en Letras del Tesoro es una de las formas más seguras de obtener rendimiento por tu dinero, pero calcular la ganancia final puede ser confuso. Entre el tipo de interés de la subasta, el precio de compra real y los impuestos, el número que realmente importa es el **rendimiento neto**. Esta calculadora está diseñada para inversores particulares en España que desean conocer con precisión su beneficio después de impuestos y comisiones, ofreciendo una visión clara y transparente de su inversión.\n\n### Guía de Uso del Calculador\n\n* **Inversión Nominal (€):** Es el valor facial de las Letras que compras. Siempre es un múltiplo de 1.000€. Aunque compres 1.000€ nominales, pagarás menos por ellos (compra con descuento) y al vencimiento recibirás los 1.000€.\n* **Plazo de la Letra:** Las subastas se realizan para vencimientos de 3, 6, 9 y 12 meses. Elige el plazo en el que quieres invertir.\n* **Tipo de Interés Marginal (%):** Es el dato clave que publica el Tesoro Público tras cada subasta. Representa el rendimiento anual (TNA) que obtendrás. Lo puedes encontrar en la web oficial del Tesoro.\n* **Comisiones Totales (€):** Un factor crucial que a menudo se olvida. Si compras a través del Banco de España, la comisión es del 0,15% sobre el nominal. Si usas un banco comercial o bróker, las comisiones pueden ser mayores. Inclúyelas para un cálculo exacto.\n\n### Metodología de Cálculo Explicada\n\nLa transparencia es clave para una buena decisión financiera. Así es como nuestra calculadora llega al resultado final:\n\n1.  **Cálculo del Precio Real:** A diferencia de un depósito, las Letras se compran 'al descuento'. Usamos el tipo de interés marginal y el plazo para calcular el precio exacto que pagarás por cada 1.000€ nominales. La fórmula convierte el tipo de interés anual a su equivalente para el plazo elegido.\n2.  **Rendimiento Bruto:** Es la diferencia simple entre lo que recibirás al vencimiento (el valor nominal) y lo que efectivamente pagaste (precio real + comisiones). Es tu ganancia antes de que Hacienda participe.\n3.  **Aplicación del IRPF (Impuestos):** ¡El punto más importante! Los beneficios de las Letras del Tesoro **no tienen retención**, pero **sí tributan** en la declaración de la Renta como rendimientos del capital mobiliario. Esta calculadora aplica los tramos impositivos del ahorro de forma progresiva (19% para los primeros 6.000€ de ganancia, 21% para el siguiente tramo, etc.), ofreciendo una estimación muy precisa del impuesto a pagar.\n4.  **Rendimiento Neto y TAE Neta:** El rendimiento neto es el dinero que te queda en el bolsillo. La TAE neta es la métrica definitiva: anualiza esa ganancia neta y te permite comparar esta inversión con otras opciones como depósitos bancarios o fondos de inversión.\n\n### Análisis: Letras del Tesoro vs. Depósitos Bancarios\n\nUna pregunta común es: ¿qué es mejor, Letras del Tesoro o un depósito a plazo fijo? Analicemos los puntos clave:\n\n* **Seguridad:** Ambos son productos de muy bajo riesgo. Las Letras están respaldadas por el Reino de España, el máximo nivel de solvencia. Los depósitos están garantizados por el Fondo de Garantía de Depósitos hasta 100.000€ por titular y entidad.\n* **Fiscalidad:** Aquí radica una diferencia clave en la experiencia del usuario. Los depósitos sufren una retención fiscal del 19% en el momento en que te pagan los intereses. Las Letras, en cambio, no tienen retención. Recibes el 100% del rendimiento bruto y al año siguiente lo declaras en la Renta. Esto te da una mayor liquidez temporal, pero requiere que seas previsor con el pago de impuestos.\n* **Rentabilidad:** Históricamente, las Letras del Tesoro, especialmente en momentos de subidas de tipos de interés por parte del BCE, suelen ofrecer rentabilidades superiores a los depósitos de la banca tradicional para plazos similares.\n* **Liquidez:** Si necesitas el dinero antes del vencimiento, las Letras se pueden vender en el mercado secundario (AIAF). El precio de venta puede ser mayor o menor al de compra, por lo que existe un riesgo de mercado. Un depósito generalmente no se puede cancelar anticipadamente sin una penalización sobre los intereses.\n\n**Conclusión del análisis:** Las Letras del Tesoro son una opción fiscalmente eficiente y a menudo más rentable, ideal para inversores que planifican su fiscalidad y no necesitarán el dinero hasta el vencimiento. Los depósitos ofrecen una mayor simplicidad operativa.\n\n### Preguntas Frecuentes (FAQ)\n\n1.  **¿Las Letras del Tesoro tienen retención de IRPF?**\n    No, no se les aplica ninguna retención a cuenta del IRPF en el momento del cobro. Sin embargo, el beneficio obtenido está sujeto a tributación y debe ser incluido en la declaración de la Renta del ejercicio correspondiente, tributando en la base imponible del ahorro.\n\n2.  **¿Qué es mejor, comprar en el Banco de España o a través de mi banco?**\n    Comprar directamente a través de la web del Tesoro o en una sucursal del Banco de España es generalmente más barato, con una comisión fija del 0,15%. Los bancos comerciales y brókeres ofrecen más comodidad al integrarlo con tus otras cuentas, pero sus comisiones de compra, custodia o transferencia suelen ser más altas, reduciendo tu rentabilidad neta.\n\n3.  **¿Qué pasa si necesito el dinero antes del vencimiento?**\n    Puedes vender tus Letras en el mercado secundario. Sin embargo, el precio de venta dependerá de los tipos de interés en ese momento. Si los tipos han subido desde tu compra, probablemente vendas con pérdidas. Si han bajado, podrías obtener una ganancia adicional. Esta opción introduce un riesgo que no existe si se mantiene la inversión hasta el vencimiento.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "¿Las Letras del Tesoro tienen retención de IRPF?", "acceptedAnswer": { "@type": "Answer", "text": "No, no se les aplica ninguna retención a cuenta del IRPF en el momento del cobro. Sin embargo, el beneficio obtenido está sujeto a tributación y debe ser incluido en la declaración de la Renta del ejercicio correspondiente, tributando en la base imponible del ahorro." } }, { "@type": "Question", "name": "¿Qué es mejor, comprar en el Banco de España o a través de mi banco?", "acceptedAnswer": { "@type": "Answer", "text": "Comprar directamente a través de la web del Tesoro o en una sucursal del Banco de España es generalmente más barato, con una comisión fija del 0,15%. Los bancos comerciales y brókeres ofrecen más comodidad al integrarlo con tus otras cuentas, pero sus comisiones de compra, custodia o transferencia suelen ser más altas, reduciendo tu rentabilidad neta." } }, { "@type": "Question", "name": "¿Qué pasa si necesito el dinero antes del vencimiento?", "acceptedAnswer": { "@type": "Answer", "text": "Puedes vender tus Letras en el mercado secundario. Sin embargo, el precio de venta dependerá de los tipos de interés en ese momento. Si los tipos han subido desde tu compra, probablemente vendas con pérdidas. Si han bajado, podrías obtener una ganancia adicional. Esta opción introduce un riesgo que no existe si se mantiene la inversión hasta el vencimiento." } }] }
};

// --- COMPONENTI HELPER ---

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }}
  />
);

const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>');
    };

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
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


// --- COMPONENTE PRINCIPALE ---

const CalculadoraRendimientoLetrasTesoro: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    importe_nominal: 10000,
    plazo: 12,
    tipo_interes_marginal: 3.5,
    comisiones: 15
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = useCallback(() => {
    setStates(initialStates);
  }, []);

  const calculatedOutputs = useMemo(() => {
    const { importe_nominal, plazo, tipo_interes_marginal, comisiones } = states;
    
    const plazo_en_dias_map: { [key: number]: number } = { 3: 91, 6: 182, 9: 273, 12: 365 };
    const dias = plazo_en_dias_map[plazo] || 365;

    const precio_adquisicion_por_100 = 100 / (1 + (tipo_interes_marginal / 100) * (dias / 365));
    const importe_efectivo_sin_comision = (importe_nominal / 100) * precio_adquisicion_por_100;
    const importe_efectivo = importe_efectivo_sin_comision + comisiones;

    const rendimiento_bruto = importe_nominal - importe_efectivo;

    const calcularImpuestos = (ganancia: number) => {
      if (ganancia <= 0) return 0;
      let impuestos = 0;
      if (ganancia > 200000) {
        impuestos += (ganancia - 200000) * 0.26;
        ganancia = 200000;
      }
      if (ganancia > 50000) {
        impuestos += (ganancia - 50000) * 0.23;
        ganancia = 50000;
      }
      if (ganancia > 6000) {
        impuestos += (ganancia - 6000) * 0.21;
        ganancia = 6000;
      }
      impuestos += ganancia * 0.19;
      return impuestos;
    };
    
    const impuestos_estimados = calcularImpuestos(rendimiento_bruto);
    const rendimiento_neto = rendimiento_bruto - impuestos_estimados;

    const tae_bruta = rendimiento_bruto > 0 ? (Math.pow(1 + (rendimiento_bruto / importe_efectivo), 365 / dias) - 1) * 100 : 0;
    const tae_neta = rendimiento_neto > 0 ? (Math.pow(1 + (rendimiento_neto / importe_efectivo), 365 / dias) - 1) * 100 : 0;

    return { importe_efectivo, rendimiento_bruto, impuestos_estimados, rendimiento_neto, tae_bruta, tae_neta };
  }, [states]);

  const chartData = [
    { name: 'Concepto', 'Importe Pagado': calculatedOutputs.importe_efectivo, 'Rendimiento Neto': calculatedOutputs.rendimiento_neto, 'Impuestos': calculatedOutputs.impuestos_estimados }
  ];

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const calculatorNode = calculatorRef.current;
      if (!calculatorNode) return;

      const canvas = await html2canvas(calculatorNode, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) {
      alert("Error al exportar a PDF. Por favor, inténtelo de nuevo.");
      console.error(e);
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: new Date().toISOString() };
      const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      const newResults = [payload, ...existingResults].slice(0, 10);
      localStorage.setItem("calc_results", JSON.stringify(newResults));
      alert("¡Resultado guardado!");
    } catch {
      alert("No se pudo guardar el resultado.");
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercentage = (value: number) => `${value.toFixed(3)}%`;

  return (
    <>
      <FaqSchema />
      <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          <main className="lg:col-span-2 space-y-6">
            <div ref={calculatorRef} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{title}</h1>
              <p className="text-gray-600 mb-6">Estima tu beneficio real al invertir en Letras del Tesoro, incluyendo impuestos y comisiones.</p>
              
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6 text-sm">
                <p><strong>Aviso Importante:</strong> Esta herramienta proporciona una estimación con fines educativos. La rentabilidad y los impuestos finales pueden variar. No constituye asesoramiento financiero.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inputs.map((input: CalculatorInput) => (
                  <div key={input.id}>
                    <label htmlFor={input.id} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      {input.label}
                      <Tooltip text={input.tooltip}><span className="ml-2 text-gray-400 hover:text-gray-600"><FaInfoCircle /></span></Tooltip>
                    </label>
                    <div className="relative">
                      {input.type === 'number' && (
                        <input
                          id={input.id}
                          type="number"
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                          min={input.min}
                          max={input.max}
                          step={input.step}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      )}
                      {input.type === 'select' && (
                        <select
                          id={input.id}
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                        >
                          {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      )}
                      {input.unit && <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 text-sm">{input.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className=" -xl -lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Resultados Detallados</h2>
                <div className="space-y-3">
                  {outputs.map(output => (
                    <div key={output.id} className={`flex justify-between items-center p-4 rounded-lg ${output.main ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                      <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                      <span className={`text-lg md:text-xl font-bold ${output.main ? 'text-indigo-600' : 'text-gray-800'}`}>
                        {isClient ? (output.unit === '€' ? formatCurrency((calculatedOutputs as any)[output.id]) : formatPercentage((calculatedOutputs as any)[output.id])) : '...'}
                      </span>
                    </div>
                  ))}
                </div>
            </div>
            
            <div className=" -xl -lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Desglose Visual de la Inversión</h3>
                <div className="h-72 w-full">
                  {isClient ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                        <Legend />
                        <Bar dataKey="Importe Pagado" stackId="a" fill="#6366f1" name="Inversión Real" />
                        <Bar dataKey="Rendimiento Neto" stackId="a" fill="#10b981" name="Beneficio Neto" />
                        <Bar dataKey="Impuestos" stackId="a" fill="#ef4444" name="Impuestos" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="flex justify-center items-center h-full text-gray-500">Cargando gráfico...</div>}
                </div>
            </div>
          </main>

          <aside className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 sticky top-6">
              <h2 className="font-bold mb-3 text-gray-800 text-lg">Herramientas</h2>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={handleSaveResult} className="w-full flex items-center justify-center gap-2 border border-indigo-500 text-indigo-500 rounded-md px-3 py-2 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"><FaSave /> Guardar</button>
                <button onClick={handleExportPDF} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"><FaFilePdf /> Exportar PDF</button>
                <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 border border-red-400 text-red-500 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"><FaTrash /> Resetear</button>
              </div>
            </section>
            
            <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="font-bold mb-4 text-gray-800 text-lg">Guía y Análisis</h2>
                <ContentRenderer content={content} />
            </section>

            <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="font-bold mb-4 text-gray-800 text-lg">Fuentes y Referencias</h2>
              <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                <li><a href="https://www.tesoro.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Tesoro Público de España</a> - Para resultados de subastas.</li>
                <li><a href="https://sede.agenciatributaria.gob.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria</a> - Para información fiscal sobre rendimientos del capital.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
};

export default CalculadoraRendimientoLetrasTesoro;