'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Static Data and Configuration ---
const calculatorData = {
  slug: "calculadora-coste-empleado",
  category: "Bienes Raíces y Vivienda",
  title: "Calculadora de Coste Total de un Empleado (Seguridad Social a cargo de la empresa)",
  lang: "es",
  description:
    "Desglosa el coste real de un empleado para la empresa, incluyendo salario bruto y las cotizaciones obligatorias a la Seguridad Social.",
  inputs: [
    { id: "salarioBrutoAnual", label: "Salario Bruto Anual del Empleado", type: "number" as const, unit: "€", min: 15876, step: 1000, tooltip: "Introduce el salario bruto anual pactado con el empleado, antes de cualquier retención." },
    { id: "tipoContrato", label: "Tipo de Contrato", type: "select" as const, options: [
      { value: "indefinido", label: "Indefinido General" },
      { value: "temporal", label: "Temporal / Duración Determinada" },
      { value: "formativo", label: "Formativo / Prácticas" }
    ], tooltip: "El tipo de contrato afecta directamente al porcentaje de cotización por desempleo." }
  ],
  outputs: [
    { id: "costeTotalEmpresa", label: "Coste Total Anual para la Empresa", unit: "€" },
    { id: "costeSeguridadSocialEmpresa", label: "Total Cotizaciones a cargo de la Empresa", unit: "€" },
    { id: "salarioBrutoMensual", label: "Salario Bruto Mensual (según pagas)", unit: "€" },
    { id: "salarioNetoMensualEstimado", label: "Salario Neto Mensual Estimado", unit: "€" }
  ],
  content: "### Introducción\n\nContratar a un nuevo empleado es una de las decisiones más importantes para una empresa, y entender su coste real es fundamental para una planificación financiera sólida. El salario bruto es solo una parte: el coste total incluye cotizaciones que suelen superar el 30% del salario.\n\n### Guida all'Uso del Calcolatore\n\n1) Salario Bruto Anual. 2) Tipo de contrato. **Opciones avanzadas**: número de pagas (12/14, con prorrateo), CNAE simplificado para AT/EP (editable), y una proyección de **base máxima** por **IPC** y **año de cálculo**.\n\n### Metodologia di Calcolo Spiegata\n\nTipos de 2025 (Régimen General). **No** se incluye cuota de solidaridad 2025 ni beneficios/indemnizaciones. AT/EP se modela por CNAE (editable). La **base máxima** se proyecta aplicando IPC anual desde 2025 al año indicado (solo para el tope).",
  seoSchema: { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
    { "@type": "Question", "name": "¿Por qué el coste para la empresa es tan superior al salario bruto?", "acceptedAnswer": { "@type": "Answer", "text": "Porque el sistema es contributivo y las empresas aportan un porcentaje elevado sobre la base de cotización." } },
    { "@type": "Question", "name": "¿Es exacto el neto mensual?", "acceptedAnswer": { "@type": "Answer", "text": "Es orientativo: no contempla circunstancias personales o autonómicas de IRPF, ni pagas extras con reglas especiales." } }
  ] }
} as const;

// --- Dynamic Chart Component (client-only) ---
const COLORS = ['#1e3a8a', '#3b82f6'];
const DynamicPieChart = dynamic(
  async () => {
    const R = await import('recharts');
    const Chart: React.FC<{ data: Array<{ name: string; value: number }> }> = ({ data }) => (
      <R.ResponsiveContainer width="100%" height={250}>
        <R.PieChart>
          <R.Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              const rad = innerRadius + (outerRadius - innerRadius) * 1.2;
              const x = Number(cx) + rad * Math.cos(-midAngle * (Math.PI / 180));
              const y = Number(cy) + rad * Math.sin(-midAngle * (Math.PI / 180));
              return (
                <text x={x} y={y} fill="currentColor" textAnchor={x > Number(cx) ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            {data.map((_, i) => <R.Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </R.Pie>
          <R.Tooltip formatter={(v: number) => formatCurrency(v)} />
          <R.Legend />
        </R.PieChart>
      </R.ResponsiveContainer>
    );
    return Chart;
  },
  { ssr: false, loading: () => <div className="h-[250px] w-full flex items-center justify-center bg-gray-100 rounded-lg">Cargando gráfico...</div> }
);

// --- Helper & Utility Components ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);
const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/_(.*?)_/g, "<em>$1</em>");
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split("\n\n").map((block, index) => {
        const t = block.trim();
        if (t.startsWith("### ")) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(t.replace("### ", "")) }} />;
        if (t.startsWith("* ")) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{t.split("\n").map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, "")) }} />)}</ul>;
        if (/^\d+\.\s/.test(t)) return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{t.split("\n").map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d+\.\s*/, "")) }} />)}</ol>;
        if (t) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(t) }} />;
        return null;
      })}
    </div>
  );
};

// --- Core Calculation Logic & Constants (2025 base) ---
// Tipos (2025)
const RATES = {
  empresa: {
    contingenciasComunes: 0.236,
    desempleo: { indefinido: 0.055, temporal: 0.067, formativo: 0.055 },
    formacionProfesional: 0.006,
    fogasa: 0.002,
    mei: 0.0067, // 0,67% empresa (MEI 2025)
    // AT/EP vendrá del estado (según CNAE/tasa editable)
  },
  empleado: {
    contingenciasComunes: 0.047,
    desempleo: { indefinido: 0.0155, temporal: 0.0160, formativo: 0.0155 },
    formacionProfesional: 0.001,
    mei: 0.0013 // 0,13% trabajador (MEI 2025)
  }
};

// Base máxima 2025 (€/mes y €/año)
const BASE_MAXIMA_MENSUAL_2025 = 4909.5;
const BASE_MAXIMA_ANUAL_2025 = BASE_MAXIMA_MENSUAL_2025 * 12;

// CNAE simplificado → tasa AT/EP (%)
const CNAE_PRESETS: Array<{ value: string; label: string; ratePct: number }> = [
  { value: 'oficinas', label: 'Oficinas y servicios administrativos', ratePct: 0.9 },
  { value: 'comercio', label: 'Comercio minorista', ratePct: 1.5 },
  { value: 'hosteleria', label: 'Hostelería', ratePct: 1.8 },
  { value: 'manufactura', label: 'Industria manufacturera (media)', ratePct: 2.0 },
  { value: 'transporte', label: 'Transporte por carretera', ratePct: 3.3 },
  { value: 'construccion', label: 'Construcción', ratePct: 6.7 },
  { value: 'personalizado', label: 'Personalizado…', ratePct: 1.5 }
];

// IRPF orientativo (total estándar)
const estimateIRPF = (grossSalary: number) => {
  let taxable = Math.max(0, grossSalary - 2000); // deducción simple
  const brackets = [
    { limit: 12450, rate: 0.19 },
    { limit: 20200, rate: 0.24 },
    { limit: 35200, rate: 0.30 },
    { limit: 60000, rate: 0.37 },
    { limit: 300000, rate: 0.45 },
    { limit: Infinity, rate: 0.47 }
  ];
  let irpf = 0, last = 0;
  for (const b of brackets) {
    if (taxable > last) {
      const inBracket = Math.min(taxable - last, b.limit - last);
      irpf += inBracket * b.rate;
      last = b.limit;
    }
  }
  return irpf;
};

// Proyección del tope por IPC anual desde 2025
function projectedBaseMaxAnnual(añoCalculo: number, ipcPctAnual: number) {
  const years = Math.max(0, Math.floor(añoCalculo - 2025));
  const factor = Math.pow(1 + ipcPctAnual / 100, years);
  return BASE_MAXIMA_ANUAL_2025 * factor;
}

// --- Main Component ---
type TipoContrato = 'indefinido' | 'temporal' | 'formativo';

const CalculadoraCosteEmpleado: React.FC = () => {
  const { slug, title, description, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // Stato base
  const [salarioBrutoAnual, setSalarioBrutoAnual] = useState<number>(30000);
  const [tipoContrato, setTipoContrato] = useState<TipoContrato>('indefinido');

  // --- Nuevas opciones ---
  const [pagas, setPagas] = useState<12 | 14>(14);
  const [prorratearExtras, setProrratearExtras] = useState<boolean>(true); // si 14 pagas y prorrateado → /12
  const [cnae, setCnae] = useState<string>('oficinas');
  const [tasaATEPpct, setTasaATEPpct] = useState<number>(CNAE_PRESETS.find(c => c.value === 'oficinas')!.ratePct);
  const [añoCalculo, setAñoCalculo] = useState<number>(2025);
  const [ipcAnualPct, setIpcAnualPct] = useState<number>(2.0);

  // Sincroniza tasa cuando cambia el CNAE, salvo "personalizado"
  useEffect(() => {
    const preset = CNAE_PRESETS.find(p => p.value === cnae);
    if (preset && cnae !== 'personalizado') setTasaATEPpct(preset.ratePct);
  }, [cnae]);

  const { calculatedOutputs, chartData, baseMaxUsada } = useMemo(() => {
    const salario = Math.max(0, Number(salarioBrutoAnual) || 0);
    const topAnual = projectedBaseMaxAnnual(añoCalculo, ipcAnualPct);
    const base = Math.min(salario, topAnual);

    // Empresa
    const costeCC = base * RATES.empresa.contingenciasComunes;
    const costeDes = base * (RATES.empresa.desempleo as any)[tipoContrato];
    const costeFP = base * RATES.empresa.formacionProfesional;
    const costeFOG = base * RATES.empresa.fogasa;
    const costeMEI = base * RATES.empresa.mei;
    const costeATEP = base * (Math.max(0, tasaATEPpct) / 100);
    const costeSeguridadSocialEmpresa = costeCC + costeDes + costeFP + costeFOG + costeMEI + costeATEP;
    const costeTotalEmpresa = salario + costeSeguridadSocialEmpresa;

    // Trabajador
    const dedCC = base * RATES.empleado.contingenciasComunes;
    const dedDes = base * (RATES.empleado.desempleo as any)[tipoContrato];
    const dedFP = base * RATES.empleado.formacionProfesional;
    const dedMEI = base * RATES.empleado.mei;
    const totalSSTrabajador = dedCC + dedDes + dedFP + dedMEI;

    const retencionIRPF = estimateIRPF(salario);
    const salarioNetoAnual = Math.max(0, salario - totalSSTrabajador - retencionIRPF);

    // Mensuales según pagas/prorrata
    const divisorMensual = pagas === 14 && !prorratearExtras ? 14 : 12;
    const salarioBrutoMensual = salario / divisorMensual;
    const salarioNetoMensualEstimado = salarioNetoAnual / divisorMensual;

    const chartData = [
      { name: 'Salario Bruto', value: Math.round(salario) },
      { name: 'S.S. Empresa', value: Math.round(costeSeguridadSocialEmpresa) }
    ];

    return {
      calculatedOutputs: {
        costeTotalEmpresa: Math.round(costeTotalEmpresa),
        costeSeguridadSocialEmpresa: Math.round(costeSeguridadSocialEmpresa),
        salarioBrutoMensual: Math.round(salarioBrutoMensual),
        salarioNetoMensualEstimado: Math.round(salarioNetoMensualEstimado)
      },
      chartData,
      baseMaxUsada: Math.round(topAnual)
    };
  }, [salarioBrutoAnual, tipoContrato, tasaATEPpct, pagas, prorratearExtras, añoCalculo, ipcAnualPct]);

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
    } catch (e) { console.error(e); alert("No se pudo exportar el PDF."); }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        inputs: {
          salarioBrutoAnual,
          tipoContrato,
          pagas,
          prorratearExtras,
          cnae,
          tasaATEPpct,
          añoCalculo,
          ipcAnualPct
        },
        outputs: calculatedOutputs,
        ts: Date.now()
      };
      const existing = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existing].slice(0, 50)));
      alert("Resultado guardado correctamente.");
    } catch { alert("No se pudo guardar el resultado."); }
  }, [slug, title, salarioBrutoAnual, tipoContrato, pagas, prorratearExtras, cnae, tasaATEPpct, añoCalculo, ipcAnualPct, calculatedOutputs]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>

            {/* Bloque principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-slate-50 p-6 rounded-lg">
              {/* Salario */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                  Salario Bruto Anual del Empleado
                  <Tooltip text="Importe bruto anual pactado, antes de IRPF y cotizaciones.">
                    <span className="ml-2"><InfoIcon /></span>
                  </Tooltip>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="salarioBrutoAnual"
                    aria-label="Salario Bruto Anual del Empleado"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    type="number"
                    min={15876}
                    step={1000}
                    value={salarioBrutoAnual}
                    onChange={(e) => setSalarioBrutoAnual(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                  <span className="text-sm text-gray-500">€</span>
                </div>
              </div>

              {/* Tipo contrato */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                  Tipo de Contrato
                  <Tooltip text="Afecta al tipo de desempleo (empresa y trabajador).">
                    <span className="ml-2"><InfoIcon /></span>
                  </Tooltip>
                </label>
                <select
                  id="tipoContrato"
                  value={tipoContrato}
                  onChange={(e) => setTipoContrato(e.target.value as TipoContrato)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                >
                  <option value="indefinido">Indefinido General</option>
                  <option value="temporal">Temporal / Duración Determinada</option>
                  <option value="formativo">Formativo / Prácticas</option>
                </select>
              </div>
            </div>

            {/* Opciones avanzadas */}
            <div className="mt-6 bg-white border rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Opciones avanzadas</h3>

              {/* Pagas y prorrata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Número de pagas
                  </label>
                  <select
                    value={pagas}
                    onChange={(e) => setPagas((Number(e.target.value) as 12 | 14))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  >
                    <option value={12}>12 pagas</option>
                    <option value={14}>14 pagas</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center mt-6">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={prorratearExtras}
                      onChange={(e) => setProrratearExtras(e.target.checked)}
                      disabled={pagas === 12}
                    />
                    <span className={`ml-2 text-sm ${pagas === 12 ? 'text-gray-400' : 'text-gray-700'}`}>
                      Prorratear pagas extra (si 14 → mensual = anual / 12)
                    </span>
                  </label>
                </div>
              </div>

              {/* CNAE y AT/EP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                    Actividad (CNAE simplificado)
                    <Tooltip text="Selecciona una categoría aproximada; la tasa AT/EP se rellena automáticamente (editable).">
                      <span className="ml-2"><InfoIcon /></span>
                    </Tooltip>
                  </label>
                  <select
                    value={cnae}
                    onChange={(e) => setCnae(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  >
                    {CNAE_PRESETS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Tasa AT/EP (%) <span className="text-gray-400">(editable)</span>
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    value={tasaATEPpct}
                    onChange={(e) => setTasaATEPpct(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  />
                </div>

                {/* Proyección IPC base máxima */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                    Año de cálculo (tope)
                    <Tooltip text="Proyecta la base máxima desde 2025 aplicando IPC anual. No modifica salarios ni tipos.">
                      <span className="ml-2"><InfoIcon /></span>
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    min={2025}
                    max={2050}
                    value={añoCalculo}
                    onChange={(e) => setAñoCalculo(e.target.value === "" ? 2025 : Number(e.target.value))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    IPC anual esperado (%)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={-5}
                    max={10}
                    value={ipcAnualPct}
                    onChange={(e) => setIpcAnualPct(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <p className="text-sm text-gray-600">
                    Tope usado para el cálculo: <strong>{isClient ? formatCurrency(baseMaxUsada) : '...'}</strong>/año
                    {añoCalculo !== 2025 && <> (proyección {ipcAnualPct}% anual hasta {añoCalculo})</>}
                  </p>
                </div>
              </div>
            </div>

            {/* Resultados */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Desglose del Coste para la Empresa</h2>
                {outputs.slice(0, 2).map(output => (
                  <div key={output.id} className={`flex items-baseline justify-between p-4 mb-3 rounded-lg ${output.id === 'costeTotalEmpresa' ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                    <div className="text-sm font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl font-bold ${output.id === 'costeTotalEmpresa' ? 'text-indigo-600' : 'text-gray-800'}`}>
                      <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                    </div>
                  </div>
                ))}
                <div className="mt-4">{isClient && <DynamicPieChart data={[
                  { name: 'Salario Bruto', value: (calculatedOutputs as any).costeTotalEmpresa - (calculatedOutputs as any).costeSeguridadSocialEmpresa },
                  { name: 'S.S. Empresa', value: (calculatedOutputs as any).costeSeguridadSocialEmpresa }
                ]} />}</div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Estimación para el Empleado</h2>
                {outputs.slice(2).map(output => (
                  <div key={output.id} className={`flex items-baseline justify-between p-4 mb-3 rounded-lg ${output.id === 'salarioNetoMensualEstimado' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                    <div className="text-sm font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl font-bold ${output.id === 'salarioNetoMensualEstimado' ? 'text-emerald-600' : 'text-gray-800'}`}>
                      <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  Nota: el neto es orientativo; no contempla circunstancias personales ni autonómicas de IRPF. Las pagas extra pueden tener reglas específicas.
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleSaveResult} className="text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <button onClick={handleExportPDF} className="text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Análisis y Metodología</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><span className="text-gray-700">Régimen General 2025 — bases y tipos principales (CC, Desempleo, FP, FOGASA, MEI).</span></li>
              <li><span className="text-gray-700">Tarifa de primas AT/EP (CNAE) — valores aproximados por actividad; confirmar tabla oficial para el CNAE exacto.</span></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCosteEmpleado;
