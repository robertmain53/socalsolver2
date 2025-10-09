'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

export const meta = {
  title: "Calculadora de Consumo de Combustible (l/100km)",
  description: "Calcula el consumo medio real de tu coche (l/100km) y estima el coste total en combustible para cualquier viaje."
};

// --- Helper Components & Icons ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('###')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.replace(/^#+\s*/, '')) }} />;
        }
        if (trimmed.startsWith('*')) {
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {trimmed.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}
            </ul>
          );
        }
        if (/^\d\.\s/.test(trimmed)) {
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {trimmed.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />)}
            </ol>
          );
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed) }} />;
      })}
    </div>
  );
};

// --- Dynamic Chart (client-only, no SSR, no top-level recharts import) ---
type ChartProps = {
  data: Array<{ name: string; Coste: number; "Ahorro Potencial": number }>;
  formatCurrency: (v: number) => string;
};

const DynamicBarChart = dynamic<ChartProps>(
  () =>
    import('recharts').then((mod) => {
      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } = mod;
      const ChartImpl: React.FC<ChartProps> = ({ data, formatCurrency }) => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `€${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(Number(value))} cursor={{ fill: 'rgba(239,246,255,0.5)' }} />
            <Legend />
            <Bar dataKey="Coste" />
            <Bar dataKey="Ahorro Potencial" />
          </BarChart>
        </ResponsiveContainer>
      );
      return ChartImpl;
    }),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-gray-500">Cargando gráfico...</div> }
);

// --- Main Component Data ---
const calculatorData = {
  slug: "calculadora-consumo-combustible",
  category: "Automóvil y Transporte",
  title: "Calculadora de Consumo de Combustible (l/100km)",
  lang: "es",
  inputs: [
    { id: "distancia_recorrida", label: "Distancia Recorrida", type: "number", unit: "km", min: 0, step: 10, tooltip: "Introduce los kilómetros que has conducido desde el último repostaje completo. Puedes usar el cuentakilómetros parcial de tu coche." },
    { id: "combustible_usado", label: "Combustible Repostado", type: "number", unit: "litros", min: 0, step: 1, tooltip: "Introduce la cantidad de litros que has echado para volver a llenar el depósito. Este dato aparece en el ticket de la gasolinera." },
    { id: "distancia_viaje", label: "Distancia del Viaje", type: "number", unit: "km", min: 0, step: 10, tooltip: "Introduce la distancia total que planeas recorrer en tu viaje." },
    { id: "consumo_medio_vehiculo", label: "Consumo Medio de tu Vehículo", type: "number", unit: "l/100km", min: 0, step: 0.1, tooltip: "Introduce el consumo medio de tu coche. Si no lo sabes, puedes calcularlo primero con la otra pestaña de esta calculadora." },
    { id: "precio_combustible", label: "Precio del Combustible", type: "number", unit: "€/litro", min: 0, step: 0.01, tooltip: "Introduce el precio actual por litro del combustible que usas (Gasolina, Diésel, etc.)." }
  ],
  outputs: [
    { id: "consumo_calculado", label: "Consumo Medio Calculado", unit: "l/100km" },
    { id: "coste_por_km", label: "Coste por Kilómetro", unit: "€/km" },
    { id: "combustible_necesario", label: "Combustible Necesario para el Viaje", unit: "litros" },
    { id: "coste_total_viaje", label: "Coste Total del Viaje", unit: "€" }
  ],
  content: `### Introducción

¿Quieres saber exactamente cuánto consume tu coche o planificar el coste de un próximo viaje? Esta calculadora de consumo de combustible es la herramienta perfecta. Te permite calcular el **consumo medio real (l/100km)** y **estimar el coste total** de un trayecto.

### Guía para Usar la Calculadora

**1. Calcular Consumo Medio**
* Llena el depósito y pon a cero el parcial.
* Conduce y vuelve a llenar.
* Introduce **km recorridos** y **litros repostados**.

**2. Estimar Coste de Viaje**
* Introduce **distancia del viaje**, **consumo medio (l/100km)** y **precio por litro**.

### Metodología de Cálculo
* **Consumo (l/100km)** = (Litros / Km) × 100
* **Combustible necesario (L)** = (Distancia × Consumo) / 100
* **Coste total (€)** = Combustible necesario × Precio/L
* **Coste/km (€/km)** = Coste total / Distancia

### Consejos de Ahorro
* Mantén velocidad uniforme y neumáticos con presión correcta.
* Evita peso y resistencias aerodinámicas innecesarias.
`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿El uso del aire acondicionado aumenta el consumo?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, puede incrementar el consumo entre un 5% y un 20%." } },
      { "@type": "Question", "name": "¿Qué es el consumo homologado WLTP y por qué mi coche consume más?", "acceptedAnswer": { "@type": "Answer", "text": "El WLTP es un ciclo en laboratorio; la conducción real suele ser más exigente." } },
      { "@type": "Question", "name": "¿Influye el octanaje (95 vs 98) en el consumo?", "acceptedAnswer": { "@type": "Answer", "text": "En motores estándar, no suele compensar la diferencia de precio." } }
    ]
  }
} as const;

const CalculadoraConsumoCombustible: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  type Mode = 'consumo' | 'coste';
  const [mode, setMode] = useState<Mode>('consumo');

  const initialStates = {
    distancia_recorrida: 550,
    combustible_usado: 35,
    distancia_viaje: 400,
    consumo_medio_vehiculo: 6.5,
    precio_combustible: 1.65
  };
  const [states, setStates] = useState<Record<string, number | string>>(initialStates);

  const toNum = (v: unknown) => (typeof v === 'number' ? v : Number(v)) || 0;

  const handleStateChange = (id: string, value: number | string) =>
    setStates(prev => ({ ...prev, [id]: value }));

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const distancia_recorrida = toNum(states.distancia_recorrida);
    const combustible_usado = toNum(states.combustible_usado);
    const distancia_viaje = toNum(states.distancia_viaje);
    const consumo_medio_vehiculo = toNum(states.consumo_medio_vehiculo);
    const precio_combustible = toNum(states.precio_combustible);

    let consumo_calculado = 0, coste_total_viaje = 0, coste_por_km = 0, combustible_necesario = 0;

    if (mode === 'consumo' && distancia_recorrida > 0) {
      consumo_calculado = (combustible_usado / distancia_recorrida) * 100;
      // coste_total_viaje: coste real del tramo medido (aprox. lo repostado * precio)
      coste_total_viaje = combustible_usado * precio_combustible;
      coste_por_km = coste_total_viaje / distancia_recorrida;
    } else if (mode === 'coste' && distancia_viaje > 0) {
      combustible_necesario = (distancia_viaje * consumo_medio_vehiculo) / 100;
      coste_total_viaje = combustible_necesario * precio_combustible;
      coste_por_km = coste_total_viaje / distancia_viaje;
    }

    // Clamp a 0 per evitare -0 o NaN
    const clamp = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
    return {
      consumo_calculado: clamp(consumo_calculado),
      coste_total_viaje: clamp(coste_total_viaje),
      coste_por_km: clamp(coste_por_km),
      combustible_necesario: clamp(combustible_necesario)
    };
  }, [states, mode]);

  const formatCurrency = useCallback((value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0), []);

  const chartData = useMemo(() => {
    const costeActual = calculatedOutputs.coste_total_viaje;
    const ahorro = costeActual * 0.10; // Ahorro potencial del 10%
    return [{ name: "Coste del Viaje", "Coste": Math.max(costeActual - ahorro, 0), "Ahorro Potencial": Math.max(ahorro, 0) }];
  }, [calculatedOutputs.coste_total_viaje]);

  // --- Action Handlers ---
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new (jsPDF as any)({ orientation: "p", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) { alert("La exportación a PDF no está disponible."); console.error(e); }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug, title, mode, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem("calc_results") || "[]");
        localStorage.setItem("calc_results", JSON.stringify([payload, ...existing].slice(0, 50)));
        alert("¡Resultado guardado con éxito!");
      }
    } catch { alert("No se pudo guardar el resultado."); }
  }, [states, calculatedOutputs, slug, title, mode]);

  const renderInput = (id: string) => {
    const input = calculatorData.inputs.find(i => i.id === id);
    if (!input) return null;
    return (
      <div key={input.id}>
        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
          {input.label}
          {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={input.id}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
            type="number"
            value={String(states[input.id] ?? '')}
            onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
            min={input.min} step={input.step} inputMode="decimal"
          />
          {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
        </div>
      </div>
    );
  };

  const renderOutput = (id: string) => {
    const output = calculatorData.outputs.find(o => o.id === id);
    if (!output) return null;
    const value = (calculatedOutputs as any)[id] ?? 0;
    let display = '...';
    if (isClient) {
      if (output.unit === "€") display = formatCurrency(value);
      else if (output.unit === "€/km") display = `${value.toFixed(3)} ${output.unit}`;
      else display = `${value.toFixed(2)} ${output.unit}`;
    }
    return (
      <div key={output.id} className="flex items-baseline justify-between bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-lg">
        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
        <div className="text-xl md:text-2xl font-bold text-gray-800">{display}</div>
      </div>
    );
  };

  return (
    <>
      <FaqSchema schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{meta.description}</p>

            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button onClick={() => setMode('consumo')} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'consumo' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Calcular Consumo Medio
                </button>
                <button onClick={() => setMode('coste')} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'coste' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Estimar Coste de Viaje
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {mode === 'consumo' && (<>{renderInput('distancia_recorrida')}{renderInput('combustible_usado')}</>)}
              {mode === 'coste' && (<>{renderInput('distancia_viaje')}{renderInput('consumo_medio_vehiculo')}</>)}
              <div className="md:col-span-2">{renderInput('precio_combustible')}</div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Resultados</h2>
              {mode === 'consumo' && (<>{renderOutput('consumo_calculado')}{renderOutput('coste_por_km')}</>)}
              {mode === 'coste' && (<>{renderOutput('combustible_necesario')}<div className="!mt-6">{renderOutput('coste_total_viaje')}</div>{renderOutput('coste_por_km')}</>)}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar Resultado</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar a PDF</button>
              <button onClick={handleReset} className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reiniciar</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ahorro con Conducción Eficiente</h3>
            <div className="h-64 w-full">
              {isClient ? <DynamicBarChart data={chartData} formatCurrency={formatCurrency} /> : <div className="h-full flex items-center justify-center text-gray-500">Cargando gráfico...</div>}
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Consejos de Ahorro</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.idae.es/conduccion-eficiente-vehiculos-turismos" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">IDAE - Guía de Conducción Eficiente</a></li>
              <li><a href="https://www.autofacil.es/consejos/como-calcular-consumo-real-coche/197594.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Guía práctica para calcular el consumo</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraConsumoCombustible;
