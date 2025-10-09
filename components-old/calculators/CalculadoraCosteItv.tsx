'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

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
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
  const blocks = content.split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;
        if (trimmedBlock.startsWith('### ')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(4)) }} />;
        if (trimmedBlock.startsWith('#### ')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(5)) }} />;
        if (trimmedBlock.startsWith('* ')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        if (/^\d+\.\s/.test(trimmedBlock)) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d+\.\s*/, ''));
          return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
      })}
    </div>
  );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "calculadora-coste-itv",
  "category": "Bienes Raíces y Vivienda",
  "title": "Calculadora de Coste de la ITV (Inspección Técnica de Vehículos) por C.A.",
  "lang": "es",
  "data": {
    "tasa_dgt": 4.18,
    "precios_itv_2025": {
      "Andalucía": { "turismo_gasolina": 33.50, "turismo_diesel": 38.00, "moto": 25.00, "electrico": 20.60 },
      "Aragón": { "turismo_gasolina": 39.50, "turismo_diesel": 47.50, "moto": 27.00, "electrico": 32.00 },
      "Asturias": { "turismo_gasolina": 38.00, "turismo_diesel": 38.00, "moto": 25.00, "electrico": 38.00 },
      "Baleares": { "turismo_gasolina": 32.10, "turismo_diesel": 45.90, "moto": 20.50, "electrico": 30.00 },
      "Canarias": { "turismo_gasolina": 36.30, "turismo_diesel": 44.80, "moto": 22.10, "electrico": 36.30 },
      "Cantabria": { "turismo_gasolina": 43.40, "turismo_diesel": 50.90, "moto": 30.10, "electrico": 43.40 },
      "Castilla y León": { "turismo_gasolina": 41.80, "turismo_diesel": 49.30, "moto": 28.50, "electrico": 41.80 },
      "Castilla-La Mancha": { "turismo_gasolina": 34.50, "turismo_diesel": 42.50, "moto": 20.00, "electrico": 34.50 },
      "Cataluña": { "turismo_gasolina": 40.20, "turismo_diesel": 45.50, "moto": 21.30, "electrico": 38.10 },
      "Comunidad Valenciana": { "turismo_gasolina": 47.70, "turismo_diesel": 61.50, "moto": 28.30, "electrico": 47.70 },
      "Extremadura": { "turismo_gasolina": 29.25, "turismo_diesel": 29.25, "moto": 18.50, "electrico": 29.25 },
      "Galicia": { "turismo_gasolina": 38.80, "turismo_diesel": 45.30, "moto": 25.50, "electrico": 38.80 },
      "La Rioja": { "turismo_gasolina": 36.00, "turismo_diesel": 44.00, "moto": 22.00, "electrico": 36.00 },
      "Madrid": { "turismo_gasolina": 58.50, "turismo_diesel": 65.00, "moto": 45.00, "electrico": 58.50 },
      "Murcia": { "turismo_gasolina": 38.90, "turismo_diesel": 50.10, "moto": 26.50, "electrico": 38.90 },
      "Navarra": { "turismo_gasolina": 44.10, "turismo_diesel": 51.60, "moto": 29.80, "electrico": 44.10 },
      "País Vasco": { "turismo_gasolina": 51.50, "turismo_diesel": 55.70, "moto": 35.20, "electrico": 51.50 },
      "Ceuta": { "turismo_gasolina": 52.80, "turismo_diesel": 60.50, "moto": 38.10, "electrico": 52.80 },
      "Melilla": { "turismo_gasolina": 42.30, "turismo_diesel": 50.20, "moto": 30.90, "electrico": 42.30 }
    }
  },
  "inputs": [
    { "id": "comunidad_autonoma", "label": "Comunidad Autónoma", "type": "select", "options": ["Andalucía","Aragón","Asturias","Baleares","Canarias","Cantabria","Castilla y León","Castilla-La Mancha","Cataluña","Comunidad Valenciana","Extremadura","Galicia","La Rioja","Madrid","Murcia","Navarra","País Vasco","Ceuta","Melilla"], "tooltip": "Selecciona la comunidad donde pasarás la inspección. Los precios están regulados por cada gobierno autonómico." },
    { "id": "tipo_vehiculo", "label": "Tipo de Vehículo", "type": "select", "options": ["Turismo","Motocicleta"], "tooltip": "El tipo de vehículo es uno de los factores principales para determinar la tarifa." },
    { "id": "tipo_motor", "label": "Tipo de Motor", "type": "select", "options": ["Gasolina (catalizado)","Diésel","Eléctrico / Cero Emisiones"], "tooltip": "El tipo de motorización afecta al precio debido a las diferentes pruebas de emisiones." }
  ],
  "outputs": [
    { "id": "precio_base_inspeccion", "label": "Precio Base de la Inspección", "unit": "€" },
    { "id": "tasa_dgt", "label": "Tasa de Tráfico (DGT)", "unit": "€" },
    { "id": "precio_final_itv", "label": "Coste Total Estimado de la ITV", "unit": "€" },
    { "id": "media_nacional", "label": "Media Nacional (para este vehículo)", "unit": "€" }
  ],
  "formulaSteps": [
    { "step": 1, "description": "Seleccionar la tarifa base..." },
    { "step": 2, "description": "Añadir la tasa fija de la DGT..." },
    { "step": 3, "description": "Calcular el precio final.", "formula": "Coste Total = Tarifa Base + Tasa DGT" },
    { "step": 4, "description": "Calcular la media nacional..." }
  ],
  "examples": [
    { "name": "Turismo diésel en Madrid", "inputs": { "comunidad_autonoma": "Madrid", "tipo_vehiculo": "Turismo", "tipo_motor": "Diésel" }, "outputs": { "precio_final_itv": 69.18 } },
    { "name": "Turismo gasolina en Extremadura", "inputs": { "comunidad_autonoma": "Extremadura", "tipo_vehiculo": "Turismo", "tipo_motor": "Gasolina (catalizado)" }, "outputs": { "precio_final_itv": 33.43 } }
  ],
  "tags": "calculadora precio ITV, ...",
  "content": "### Introducción\n\n... (usa il tuo testo originale) ...",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ /* ... */ ] }
} as const;

// --- Tipi utili ---
type PriceKey = 'turismo_gasolina' | 'turismo_diesel' | 'moto' | 'electrico';
type PricesByCA = Record<string, Record<PriceKey, number>>;

// --- Grafico: import *lazy* di Recharts per evitare problemi SSR/hydration ---
const ItvPriceChart: React.FC<{ data: Array<{ name: string; price: number }>; selectedCA: string }> = ({ data, selectedCA }) => {
  const [R, setR] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    import('recharts').then(mod => { if (mounted) setR(mod); });
    return () => { mounted = false; };
  }, []);

  if (!R) {
    return <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg"><p>Cargando gráfico...</p></div>;
  }

  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip: RTooltip, Cell } = R;

  const fmtEUR = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v ?? 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis type="number" tickFormatter={(value: number) => fmtEUR(value)} />
        <YAxis type="category" dataKey="name" width={120} interval={0} tick={{ fontSize: 12 }} />
        <RTooltip formatter={(value: number) => fmtEUR(value)} />
        <Bar dataKey="price" name="Coste ITV">
          {data.map((entry: { name: string }) => (
            <Cell key={`cell-${entry.name}`} fill={entry.name === selectedCA ? '#3b82f6' : '#a5b4fc'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const DynamicItvPriceChart = dynamic(async () => ItvPriceChart, {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg"><p>Cargando gráfico...</p></div>,
});

const CalculadoraCosteItv: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema, data } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    comunidad_autonoma: "Madrid",
    tipo_vehiculo: "Turismo",
    tipo_motor: "Diésel",
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = useCallback((id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setStates(initialStates);
  }, []);

  const getPriceKey = (vehicle: string, motor: string): PriceKey => {
    if (vehicle === 'Motocicleta') return 'moto';
    if (motor === 'Diésel') return 'turismo_diesel';
    if (motor === 'Eléctrico / Cero Emisiones') return 'electrico';
    return 'turismo_gasolina';
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const calculatedOutputs = useMemo(() => {
    const { comunidad_autonoma, tipo_vehiculo, tipo_motor } = states;
    const priceKey = getPriceKey(tipo_vehiculo, tipo_motor);

    const precios: PricesByCA = data.precios_itv_2025 as unknown as PricesByCA;

    const precio_base_inspeccion = precios[comunidad_autonoma]?.[priceKey] ?? 0;
    const tasa_dgt = data.tasa_dgt;
    const precio_final_itv = precio_base_inspeccion + tasa_dgt;

    const allBases = Object.values(precios).map(region => region[priceKey]);
    const media_nacional = (allBases.reduce((a, b) => a + b, 0) / allBases.length) + tasa_dgt;

    return { precio_base_inspeccion, tasa_dgt, precio_final_itv, media_nacional };
  }, [states, data]);

  const chartData = useMemo(() => {
    const { tipo_vehiculo, tipo_motor } = states;
    const priceKey = getPriceKey(tipo_vehiculo, tipo_motor);
    const precios: PricesByCA = data.precios_itv_2025 as unknown as PricesByCA;

    return Object.entries(precios)
      .map(([name, prices]) => ({ name, price: prices[priceKey] + data.tasa_dgt }))
      .sort((a, b) => a.price - b.price);
  }, [states, data]);

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
              <p className="text-gray-600 mb-4">Descubre el precio oficial y actualizado de la ITV para tu vehículo en cualquier Comunidad Autónoma de España.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                    </label>
                    <select
                      id={input.id}
                      name={input.id}
                      value={states[input.id]}
                      onChange={(e) => handleStateChange(input.id, e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-8"
                    >
                      {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Desglose de la Tarifa</h2>
                {outputs.map(output => (
                  <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'precio_final_itv' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'precio_final_itv' ? 'text-blue-600' : 'text-gray-800'}`}>
                      <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparativa de Precios por C.A.</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Coste para un {states.tipo_vehiculo.toLowerCase()} con motor {states.tipo_motor.toLowerCase()} en toda España (de más barata a más cara).
                </p>
                <div className="h-[450px] w-full bg-gray-50 p-4 rounded-lg">
                  <DynamicItvPriceChart data={chartData} selectedCA={states.comunidad_autonoma} />
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
            <h2 className="font-semibold mb-2 text-gray-800">Guía para la ITV</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.dgt.es/nuestros-servicios/vehiculos/inspeccion-tecnica-de-vehiculos/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Dirección General de Tráfico (DGT) - ITV</a></li>
              <li><a href="https://www.consumidores.org/informes/los-precios-de-itv-varian-hasta-un-153-segun-la-comunidad-autonoma/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">FACUA - Informes de precios</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2017-5643" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Manual de Procedimiento de Inspección ITV</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCosteItv;
