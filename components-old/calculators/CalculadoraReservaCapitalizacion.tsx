'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Dati di configurazione del calcolatore (inclusi nel componente) ---
const calculatorData = {
  "slug": "calculadora-reserva-capitalizacion-nivelacion",
  "category": "Bienes Raíces y Vivienda",
  "title": "Calculadora de la Reserva de Capitalización y Nivelación",
  "lang": "es",
  "description": "Calcula el ahorro fiscal en el Impuesto de Sociedades aplicando los incentivos de la Reserva de Capitalización y Nivelación para PYMEs.",
  "inputs": [
    { "id": "tipo_reserva", "label": "Tipo de Incentivo a Calcular", "type": "select" as const, "options": ["Reserva de Capitalización", "Reserva de Nivelación"], "tooltip": "Elige el incentivo fiscal que deseas calcular. La Reserva de Nivelación solo está disponible para empresas de reducida dimensión." },
    { "id": "fondos_propios_inicio", "label": "Fondos Propios al Inicio del Ejercicio", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Valor de los Fondos Propios (Patrimonio Neto) a 1 de enero, extraído del balance. No incluye el resultado del ejercicio anterior.", "condition": "tipo_reserva == 'Reserva de Capitalización'" },
    { "id": "fondos_propios_fin", "label": "Fondos Propios al Cierre del Ejercicio", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Valor de los Fondos Propios a 31 de diciembre, antes de la distribución del resultado. Incluye el beneficio o pérdida del ejercicio actual.", "condition": "tipo_reserva == 'Reserva de Capitalización'" },
    { "id": "base_imponible_previa", "label": "Base Imponible Previa Positiva", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "La Base Imponible del Impuesto de Sociedades antes de aplicar esta reserva y la compensación de bases negativas. Debe ser positiva." },
    { "id": "tipo_impositivo", "label": "Tipo Impositivo de la Empresa (%)", "type": "number" as const, "unit": "%", "min": 10, "max": 30, "step": 1, "tooltip": "Tipo de gravamen del Impuesto de Sociedades que aplica tu empresa (ej. 25% general, 23% pyme, 15% nueva creación)." },
    { "id": "cifra_negocios", "label": "Cifra de Negocios del Año Anterior", "type": "number" as const, "unit": "€", "min": 0, "step": 100000, "tooltip": "Importe Neto de la Cifra de Negocios del ejercicio anterior. Si es superior a 10M€, no puedes aplicar la Reserva de Nivelación.", "condition": "tipo_reserva == 'Reserva de Nivelación'" }
  ],
  "outputs": [
    { "id": "reduccion_base_imponible", "label": "Reducción Máxima de la Base Imponible", "unit": "€" },
    { "id": "ahorro_fiscal", "label": "Ahorro Fiscal Generado", "unit": "€" },
    { "id": "base_imponible_final", "label": "Base Imponible tras aplicar la Reserva", "unit": "€" }
  ],
  "content": "### Introducción: Reduce tu Impuesto de Sociedades de Forma Inteligente\n\nEl Impuesto de Sociedades ofrece incentivos fiscales que muchas empresas, especialmente las PYMEs, desconocen o no aplican por su aparente complejidad. La **Reserva de Capitalización** y la **Reserva de Nivelación** son dos de los mecanismos más potentes para reducir la base imponible y, por tanto, la factura fiscal final.\n\nEsta calculadora está diseñada para **asesores fiscales, contables y gerentes de PYMEs** que deseen cuantificar de forma rápida y precisa el ahorro potencial que pueden obtener aplicando estas reservas. La herramienta desglosa el cálculo, verifica los límites y muestra el impacto directo en euros, convirtiendo la teoría fiscal en una decisión de negocio tangible.\n\n### Guía de Uso de la Calculadora\n\n* **Tipo de Incentivo a Calcular**: Selecciona si quieres simular la Reserva de Capitalización (disponible para todas las empresas) o la de Nivelación (solo para empresas de reducida dimensión).\n* **Fondos Propios (Inicio y Fin)**: (Para R. Capitalización) Son los datos del Patrimonio Neto de tu balance. El cálculo se basa en el **incremento** de un año a otro, que refleja la decisión de no repartir beneficios.\n* **Base Imponible Previa Positiva**: Es el beneficio fiscal de tu empresa **antes** de aplicar esta reducción y antes de compensar pérdidas de años anteriores.\n* **Tipo Impositivo de la Empresa (%)**: El tipo del Impuesto de Sociedades que te corresponde (25%, 23% o 15%).\n* **Cifra de Negocios del Año Anterior**: (Para R. Nivelación) Si tu empresa facturó más de 10 millones de euros el año pasado, no puede aplicar la Reserva de Nivelación.\n\n### Metodología de Cálculo Explicada\n\nAmbas reservas reducen la base imponible, pero su cálculo y finalidad son diferentes.\n\n**Reserva de Capitalización (Art. 25 LIS):**\nEste incentivo premia la autofinanciación. Permite reducir la base imponible en el **10% del incremento de los fondos propios** del ejercicio.\n1.  **Cálculo del Incremento**: `Incremento FP = Fondos Propios (fin) - Fondos Propios (inicio)`.\n2.  **Cálculo de la Reducción**: La reducción es el 10% de ese incremento.\n3.  **Aplicación de Límites**: La reducción calculada no puede superar el **10% de la base imponible previa** del ejercicio. La calculadora aplica el menor de estos dos valores.\n4.  **Ahorro Fiscal**: `Reducción Aplicada * Tipo Impositivo`.\n\n**Reserva de Nivelación (Art. 105 LIS):**\nEste incentivo es exclusivo para **Entidades de Reducida Dimensión** (cifra de negocios < 10M€) y permite anticipar la compensación de futuras pérdidas.\n1.  **Cálculo de la Reducción**: Se puede reducir la base imponible positiva en un **10%**, con un **límite absoluto de 1 millón de euros**.\n2.  **Ahorro Fiscal (Diferimiento)**: Se calcula el ahorro inmediato. Es importante entender que esto es un **diferimiento**: si en los 5 años siguientes no se generan pérdidas, esta cantidad reducida se deberá sumar a la base imponible del quinto año.\n\n### Análisis Profundo: ¿Capitalización o Nivelación? Estrategia y Compatibilidad\n\nUna pregunta recurrente es si se pueden aplicar ambas reservas y cuál es la estrategia óptima. La respuesta es **sí, son compatibles**, pero deben aplicarse en un orden específico y responden a lógicas diferentes.\n\n**Orden de Aplicación:**\nLa Ley del Impuesto sobre Sociedades establece que **primero se aplica la Reserva de Nivelación y después la Reserva de Capitalización**. Esto es lógico, ya que la Reserva de Nivelación minora la base imponible sobre la cual se calculará posteriormente el límite del 10% para la Reserva de Capitalización.\n\n**¿Cuándo aplicar cada una?**\n* **Reserva de Capitalización**: Es ideal para empresas **rentables y en crecimiento** que apuestan por la reinversión del beneficio. Su objetivo es fortalecer la estructura de capital y el ahorro fiscal es **definitivo** (siempre que se cumpla el requisito de mantener los fondos propios durante 5 años).\n* **Reserva de Nivelación**: Es una herramienta de **planificación y prudencia financiera** para PYMEs. Es perfecta para empresas con **beneficios volátiles o cíclicos**. Les permite pagar menos impuestos en los años buenos, creando un 'colchón fiscal' que podrán usar si tienen pérdidas en los 5 años siguientes. Su naturaleza es la de un **diferimiento fiscal**, no un ahorro definitivo a priori.\n\n**Estrategia Combinada:**\nUna PYME rentable puede y debe analizar la aplicación de ambas. Primero, usar la Reserva de Nivelación para reducir su base imponible. Luego, sobre la base imponible restante, calcular y aplicar la Reserva de Capitalización si ha incrementado sus fondos propios. Hacerlo así maximiza el ahorro fiscal en el ejercicio corriente.\n\n### Preguntas Frecuentes (FAQ)\n\n**1. ¿Qué se considera 'Fondos Propios' para la Reserva de Capitalización?**\nSe refiere al Patrimonio Neto contable (Capital, Reservas, Prima de emisión, Resultados de ejercicios anteriores, etc.), pero excluyendo ciertas partidas como las aportaciones de socios para compensar pérdidas o las ampliaciones de capital por operaciones de reestructuración.\n\n**2. ¿Qué ocurre si no cumplo el requisito de mantener el incremento de fondos propios durante 5 años?**\nSi no se cumple este requisito, se deberá regularizar la situación. Esto implica ingresar la cuota correspondiente a la reducción aplicada en su día más los intereses de demora, en la declaración del IS del año en que se produce el incumplimiento.\n\n**3. ¿La Reserva de Nivelación es siempre beneficiosa?**\nEs un diferimiento, no una exención. Si se aplica y la empresa sigue teniendo beneficios durante los 5 años siguientes, la cantidad reducida se deberá sumar a la base del quinto año, lo que implicará pagar entonces el impuesto que no se pagó en su día. Es beneficiosa si se prevén pérdidas futuras o si la empresa puede beneficiarse financieramente de aplazar el pago del impuesto.\n",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Qué se considera 'Fondos Propios' para la Reserva de Capitalización?", "acceptedAnswer": { "@type": "Answer", "text": "Se refiere al Patrimonio Neto contable (Capital, Reservas, Prima de emisión, Resultados de ejercicios anteriores, etc.), pero excluyendo ciertas partidas como las aportaciones de socios para compensar pérdidas o las ampliaciones de capital por operaciones de reestructuración." } },
      { "@type": "Question", "name": "¿Qué ocurre si no cumplo el requisito de mantener el incremento de fondos propios durante 5 años?", "acceptedAnswer": { "@type": "Answer", "text": "Si no se cumple este requisito, se deberá regularizar la situación. Esto implica ingresar la cuota correspondiente a la reducción aplicada en su día más los intereses de demora, en la declaración del Impuesto de Sociedades del año en que se produce el incumplimiento." } },
      { "@type": "Question", "name": "¿La Reserva de Nivelación es siempre beneficiosa?", "acceptedAnswer": { "@type": "Answer", "text": "Es un diferimiento, no una exención. Si se aplica y la empresa sigue teniendo beneficios durante los 5 años siguientes, la cantidad reducida se deberá sumar a la base del quinto año, lo que implicará pagar entonces el impuesto que no se pagó en su día. Es beneficiosa si se prevén pérdidas futuras o si la empresa puede beneficiarse financieramente de aplazar el pago del impuesto." } }
    ]
  }
};

// --- Importazione dinamica del grafico ---
const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip: ChartTooltip, ResponsiveContainer, Legend, LabelList } = mod;
  const ChartComponent: React.FC<{ data: any[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis
          width={80}
          tickFormatter={(value: number) =>
            new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value)
          }
          fontSize={12}
        />
        <ChartTooltip
          formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}
          cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
        />
        <Legend />
        <Bar dataKey="valor" fill="#4f46e5">
          <LabelList
            dataKey="valor"
            position="top"
            content={(props: any) => {
              const { x, y, value } = props;
              const label = new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
              }).format(Number(value || 0));
              return (
                <text x={Number(x)} y={Number(y) - 6} textAnchor="middle" fontSize={12} fill="#374151">
                  {label}
                </text>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  return ChartComponent;
}), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Cargando gráfico...</div>,
});

// --- Componenti di utilità ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// --- Lightweight Markdown renderer (client-only, no external deps) ---
const toHtml = (md: string): string => {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = md.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inUl = false;
  let inOl = false;

  const pushCloseLists = () => {
    if (inUl) { htmlParts.push('</ul>'); inUl = false; }
    if (inOl) { htmlParts.push('</ol>'); inOl = false; }
  };

  const boldify = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) { // blank line
      pushCloseLists();
      continue;
    }

    // ### Heading
    if (line.startsWith('### ')) {
      pushCloseLists();
      htmlParts.push(`<h3 class="text-xl font-bold mt-6 mb-4 text-gray-800">${boldify(esc(line.slice(4)))}</h3>`);
      continue;
    }

    // Unordered list
    if (line.startsWith('* ')) {
      if (!inUl) { pushCloseLists(); htmlParts.push('<ul class="list-disc pl-5 space-y-2 mb-4">'); inUl = true; }
      htmlParts.push(`<li>${boldify(esc(line.slice(2)))}</li>`);
      continue;
    }

    // Ordered list (e.g., "1. ...")
    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) { pushCloseLists(); htmlParts.push('<ol class="list-decimal pl-5 space-y-2 mb-4">'); inOl = true; }
      htmlParts.push(`<li>${boldify(esc(line.replace(/^\d+\.\s+/, '')))}</li>`);
      continue;
    }

    // Paragraph
    pushCloseLists();
    htmlParts.push(`<p class="mb-4 leading-relaxed">${boldify(esc(line))}</p>`);
  }

  pushCloseLists();
  return htmlParts.join('');
};

const ContentRenderer = React.memo(({ content }: { content: string }) => {
  const [htmlContent, setHtmlContent] = useState('');
  useEffect(() => { setHtmlContent(toHtml(content)); }, [content]);
  return <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
});
ContentRenderer.displayName = 'ContentRenderer';

// --- Helpers ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

const safeNum = (v: any, fallback = 0) => {
  if (v === '' || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const checkCondition = (cond: string | undefined, st: Record<string, any>) => {
  if (!cond) return true;
  const m = cond.match(/^(\w+)\s*==\s*'(.*)'$/);
  if (m) {
    const [, key, val] = m;
    return String(st[key]) === val;
  }
  // fallback: include grezzo
  return cond.includes(String(st.tipo_reserva));
};

// --- Componente Principale ---
const CalculadoraReservaCapitalizacion: React.FC = () => {
  const { slug, title, description, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    tipo_reserva: "Reserva de Capitalización",
    fondos_propios_inicio: 200000,
    fondos_propios_fin: 280000,
    base_imponible_previa: 150000,
    tipo_impositivo: 25,
    cifra_negocios: 0,
  };

  const [states, setStates] = useState(initialStates);

  // normalizza numeri/selección
  const numberIds = new Set(inputs.filter(i => i.type === 'number').map(i => i.id));
  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({
      ...prev,
      [id]: numberIds.has(id) ? (value === '' ? '' : Number(value)) : value
    }));
  };
  const handleReset = () => setStates(initialStates);

  const calculationResults = useMemo(() => {
    const tipo_reserva = String(states.tipo_reserva);
    const fondos_propios_inicio = Math.max(0, safeNum(states.fondos_propios_inicio, initialStates.fondos_propios_inicio));
    const fondos_propios_fin = Math.max(0, safeNum(states.fondos_propios_fin, initialStates.fondos_propios_fin));
    const base_imponible_previa_raw = safeNum(states.base_imponible_previa, initialStates.base_imponible_previa);
    const base_imponible_previa = Math.max(0, base_imponible_previa_raw); // debe ser positiva
    const tipo_impositivo = Math.min(30, Math.max(0, safeNum(states.tipo_impositivo, initialStates.tipo_impositivo)));
    const cifra_negocios = Math.max(0, safeNum(states.cifra_negocios, initialStates.cifra_negocios));

    let reduccion_base_imponible = 0;

    if (tipo_reserva === 'Reserva de Capitalización') {
      const incremento_fp = Math.max(0, fondos_propios_fin - fondos_propios_inicio);
      const reduccion_potencial = incremento_fp * 0.10;
      const limite_reduccion = base_imponible_previa * 0.10;
      reduccion_base_imponible = Math.max(0, Math.min(reduccion_potencial, limite_reduccion));
    } else { // Reserva de Nivelación
      if (cifra_negocios < 10_000_000 && base_imponible_previa > 0) {
        const limite_10 = base_imponible_previa * 0.10;
        reduccion_base_imponible = Math.max(0, Math.min(base_imponible_previa, limite_10, 1_000_000));
      } else {
        reduccion_base_imponible = 0;
      }
    }

    const ahorro_fiscal = reduccion_base_imponible * (tipo_impositivo / 100);
    const base_imponible_final = Math.max(0, base_imponible_previa - reduccion_base_imponible);

    const summary = {
      reduccion_base_imponible: Number(reduccion_base_imponible.toFixed(2)),
      ahorro_fiscal: Number(ahorro_fiscal.toFixed(2)),
      base_imponible_final: Number(base_imponible_final.toFixed(2)),
    };

    const chartData = [
      { name: 'B.I. Previa', valor: base_imponible_previa },
      { name: 'B.I. Final', valor: summary.base_imponible_final },
    ];

    return { summary, chartData };
  }, [states]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) { alert("Error al generar el PDF."); }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculationResults.summary, ts: Date.now() };
      const prev = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...prev].slice(0, 20)));
      alert("Resultado guardado en el navegador.");
    } catch { alert("No se pudo guardar el resultado."); }
  }, [states, calculationResults.summary, slug, title]);

  return (
    <>
      <SeoSchema schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
              {inputs.map(input => {
                const show = checkCondition((input as any).condition, states);
                if (!show) return null;

                if (input.type === 'select') {
                  return (
                    <div key={input.id} className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                        {input.label}
                        <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                      </label>
                      <select
                        id={input.id}
                        value={(states as any)[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      >
                        {(input.options as string[]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pr-12"
                        type="number"
                        min={(input as any).min}
                        step={(input as any).step}
                        value={(states as any)[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 pointer-events-none">{input.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados del Incentivo Fiscal</h2>
              {outputs.map(output => (
                <div
                  key={output.id}
                  className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${
                    output.id === 'ahorro_fiscal' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">{output.label}</div>
                  <div className={`text-lg font-bold ${output.id === 'ahorro_fiscal' ? 'text-green-600' : 'text-gray-800'}`}>
                    <span>{isClient ? formatCurrency((calculationResults.summary as any)[output.id]) : '...'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Impacto en la Base Imponible</h3>
              <div className="h-80 w-full rounded-lg bg-gray-50 p-4">
                {isClient && <DynamicBarChart data={calculationResults.chartData} />}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border border-transparent bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors">Reset</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Análisis Fiscal</h2>
            {isClient && <ContentRenderer content={content} />}
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/impuesto-sobre-sociedades-2023/capitulo-5-base-imponible/2-aplicacion-rentas-periodo-impositivo/2-3-reserva-capitalizacion.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Reserva de Capitalización (Art. 25 LIS)</a></li>
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/impuesto-sobre-sociedades-2023/capitulo-10-regimenes-tributarios-especiales-ii/regimen-especial-empresas-reducida-dimension/incentivos-fiscales/reserva-nivelacion-bases-imponibles-negativas.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Reserva de Nivelación (Art. 105 LIS)</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraReservaCapitalizacion;