'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

export const meta = {
  title: "Calculadora del Impuesto de Sucesiones por Comunidad Autónoma",
  description: "Estima el impuesto de sucesiones a pagar en España. Compara la cuota tributaria entre Madrid, Andalucía, Asturias y la normativa estatal."
};

// --- Helper Components & Icons ---
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400 hover:text-gray-600 transition-colors"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
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
  const fmt = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/_(.*?)_/g, "<em>$1</em>");

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split("\n\n").map((block, i) => {
        const b = block.trim();
        if (!b) return null;

        if (b.startsWith("###")) {
          return (
            <h3
              key={i}
              className="text-xl font-bold mt-6 mb-3 text-gray-800"
              dangerouslySetInnerHTML={{ __html: fmt(b.replace(/^#+\s*/, "")) }}
            />
          );
        }
        if (b.startsWith("|")) {
          const rows = b.split("\n").map((r) => r.split("|").map((c) => c.trim()).slice(1, -1));
          if (rows.length < 3) return <p key={i}>{b}</p>;
          const [headers, , ...body] = rows;
          return (
            <div key={i} className="overflow-x-auto my-4">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {headers.map((h, j) => (
                      <th
                        key={j}
                        className="p-2 border text-left font-semibold"
                        dangerouslySetInnerHTML={{ __html: fmt(h) }}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((r, j) => (
                    <tr key={j} className="border-b">
                      {r.map((c, k) => (
                        <td
                          key={k}
                          className="p-2 border"
                          dangerouslySetInnerHTML={{ __html: fmt(c) }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (b.startsWith("*")) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-2 mb-4">
              {b.split("\n").map((it, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: fmt(it.replace(/^\*\s*/, "")) }} />
              ))}
            </ul>
          );
        }
        if (/^\d\.\s/.test(b)) {
          return (
            <ol key={i} className="list-decimal pl-5 space-y-2 mb-4">
              {b.split("\n").map((it, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: fmt(it.replace(/^\d\.\s*/, "")) }} />
              ))}
            </ol>
          );
        }
        return <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: fmt(b) }} />;
      })}
    </div>
  );
};

// --- Dynamic Chart (client-only; nessun import di Recharts al top) ---
type ChartProps = {
  data: Array<{ name: string; impuesto: number }>;
  formatCurrency: (v: number) => string;
};

const DynamicBarChart = dynamic<ChartProps>(
  () =>
    import("recharts").then((mod) => {
      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip: RTooltip, Cell } = mod;
      const ChartImpl: React.FC<ChartProps> = ({ data, formatCurrency }) => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={50} interval={0} />
            <YAxis tickFormatter={(value: number) => `€${(value / 1000).toLocaleString()}k`} />
            <RTooltip formatter={(v: number) => formatCurrency(Number(v))} cursor={{ fill: "rgba(239, 246, 255, 0.7)" }} />
            <Bar dataKey="impuesto" name="Impuesto a Pagar">
              {data.map((d, idx) => (
                <Cell key={d.name + idx} fill={d.name === "Selección Actual" ? "#4f46e5" : "#a5b4fc"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
      return ChartImpl;
    }),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-gray-500">Cargando gráfico...</div> }
);

// --- Tipi & Dati ---
type Grupo = "Grupo I" | "Grupo II" | "Grupo III" | "Grupo IV";
type CalcState = {
  comunidad_autonoma: string;
  valor_herencia: number;
  grupo_parentesco: Grupo;
  edad_heredero: number;
  patrimonio_preexistente: number;
  heredero_discapacidad: boolean;
};
type TarifaTramo = { hasta: number; cuota: number; tipo: number };
type CoefRule = { coef: number; hasta2M: number; hasta4M: number; mas4M: number };

// Config del calcolatore (content inline: nessuna riassegnazione)
const calculatorData = {
  slug: "calculadora-sucesiones-donaciones",
  category: "Impuestos y Fiscalidad",
  title: "Calculadora del Impuesto de Sucesiones y Donaciones por Comunidad Autónoma",
  lang: "es",
  inputs: [
    {
      id: "comunidad_autonoma",
      label: "Comunidad Autónoma del Causante",
      type: "select",
      options: [
        "Andalucía",
        "Aragón",
        "Asturias",
        "Cantabria",
        "Castilla y León",
        "Castilla-La Mancha",
        "Cataluña",
        "Comunidad de Madrid",
        "Comunidad Valenciana",
        "Extremadura",
        "Galicia",
        "Islas Baleares",
        "Islas Canarias",
        "La Rioja",
        "Navarra",
        "País Vasco",
        "Región de Murcia",
        "Normativa Estatal"
      ],
      tooltip: "Selecciona la CA de residencia habitual del causante (mayor parte de los últimos 5 años)."
    },
    {
      id: "valor_herencia",
      label: "Valor Real de los Bienes Heredados",
      type: "number",
      unit: "€",
      min: 0,
      step: 1000,
      tooltip: "Suma de inmuebles, cuentas, acciones, seguros, etc."
    },
    {
      id: "grupo_parentesco",
      label: "Grupo de Parentesco del Heredero",
      type: "select",
      options: ["Grupo I", "Grupo II", "Grupo III", "Grupo IV"],
      tooltip:
        "I: Desc. <21; II: Desc. ≥21, cónyuge, ascend.; III: hermanos/tíos; IV: colaterales lejanos y no parientes."
    },
    {
      id: "edad_heredero",
      label: "Edad del Heredero",
      type: "number",
      unit: "años",
      min: 0,
      step: 1,
      condition: "grupo_parentesco === 'Grupo I'",
      tooltip: "Solo si <21 años para reducción adicional estatal."
    },
    {
      id: "patrimonio_preexistente",
      label: "Patrimonio Preexistente del Heredero",
      type: "number",
      unit: "€",
      min: 0,
      step: 10000,
      tooltip: "Afecta al coeficiente multiplicador."
    },
    {
      id: "heredero_discapacidad",
      label: "¿El heredero tiene alguna discapacidad?",
      type: "boolean",
      tooltip: "≥33% aplica reducción estatal simplificada en este modelo."
    }
  ],
  content: `### Introducción

El Impuesto de Sucesiones y Donaciones (ISD) varía mucho por comunidad autónoma. Este cálculo reproduce, de forma simplificada, la cadena: **Base Imponible → Reducciones → Base Liquidable → Tarifa → Coeficiente → Bonificaciones** (CA).

### Guía para Usar la Calculadora

* **Comunidad Autónoma**: residencia habitual del causante (mayor parte de los últimos 5 años).
* **Valor de los Bienes**: suma total real.
* **Grupo de Parentesco**: define reducciones y coeficientes.
* **Edad**: solo para Grupo I (<21).
* **Patrimonio Preexistente**: afecta el coeficiente multiplicador.
* **Discapacidad**: aplica reducción estatal adicional (simplificada).

### Metodología de Cálculo
1. **Base Imponible** = valor_herencia.
2. **Reducciones** (parentesco, edad, discapacidad) → **Base Liquidable**.
3. **Cuota Íntegra** aplicando tarifa por tramos (cuota fija + tipo marginal sobre el exceso).
4. **Coeficiente** según grupo y patrimonio preexistente.
5. **Bonificación CA** (p.ej., Madrid 99% para GI/GII) → **Total a Pagar**.

> Modelo didáctico: implementado **Estatal**, reglas resumidas para **Madrid**, **Andalucía** (exención hasta 1M para GI/GII), y **Asturias** (tarifa propia abreviada). Puede diferir de la normativa vigente completa.

### Tabla ejemplo (herencia 400.000€, hijo 30 años, patrimonio 50.000€)

| Comunidad Autónoma | Impuesto a Pagar (Estimado) |
| :--- | :--- |
| **Andalucía** | 0 € |
| **Asturias** | 62.977 € |
| **Cantabria** | 0 € |
| **Cataluña** | 11.235 € |
| **Galicia** | 0 € |
| **Comunidad de Madrid** | 811 € |
| **Región de Murcia** | 811 € |
`,
  seoSchema: { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [] }
} as const;

// Tabelle tariffarie come array (non tuple) per evitare mismatch
const tarifaEstatal: ReadonlyArray<TarifaTramo> = [
  { hasta: 0, cuota: 0, tipo: 0.0765 },
  { hasta: 7993.46, cuota: 611.5, tipo: 0.085 },
  { hasta: 15980.91, cuota: 1290.43, tipo: 0.0935 },
  { hasta: 23968.36, cuota: 2037.3, tipo: 0.102 },
  { hasta: 31955.81, cuota: 2851.98, tipo: 0.1105 },
  { hasta: 39943.26, cuota: 3734.19, tipo: 0.119 },
  { hasta: 47930.72, cuota: 4683.9, tipo: 0.1275 },
  { hasta: 55918.17, cuota: 5699.96, tipo: 0.136 },
  { hasta: 63905.62, cuota: 6783.55, tipo: 0.1445 },
  { hasta: 71893.07, cuota: 7933.55, tipo: 0.153 },
  { hasta: 79880.52, cuota: 9148.83, tipo: 0.1615 },
  { hasta: 119757.67, cuota: 15606.22, tipo: 0.187 },
  { hasta: 159634.83, cuota: 23063.25, tipo: 0.2125 },
  { hasta: 239389.13, cuota: 39876.84, tipo: 0.255 },
  { hasta: 398777.54, cuota: 80815.76, tipo: 0.2975 },
  { hasta: 797555.08, cuota: 199291.4, tipo: 0.34 }
];

const tarifaAsturias: ReadonlyArray<TarifaTramo> = [
  { hasta: 0, cuota: 0, tipo: 0.08 },
  { hasta: 7993.46, cuota: 639.48, tipo: 0.0888 },
  // … tramos intermedios no detallados en este modelo resumido …
  { hasta: 797555.08, cuota: 207310.82, tipo: 0.365 }
];

const taxData = {
  estatal: {
    reducciones: {
      grupoI: 15956.87,
      porAnoMenos21: 3990.72,
      grupoII: 15956.87,
      grupoIII: 7993.46,
      discapacidad33: 47859.59,
      discapacidad65: 229726.05
    },
    tarifa: tarifaEstatal,
    coeficientes: {
      "Grupo I": { coef: 1.0, hasta2M: 1.05, hasta4M: 1.1, mas4M: 1.2 },
      "Grupo II": { coef: 1.0, hasta2M: 1.05, hasta4M: 1.1, mas4M: 1.2 },
      "Grupo III": { coef: 1.5882, hasta2M: 1.6676, hasta4M: 1.7471, mas4M: 1.9059 },
      "Grupo IV": { coef: 2.0, hasta2M: 2.1, hasta4M: 2.2, mas4M: 2.4 }
    },
    bonificacion: 0
  },
  madrid: { bonificacion: 0.99 }, // GI/GII
  andalucia: {
    reducciones: { grupoI: 1000000, grupoII: 1000000 }, // simplificación
    bonificacion: 0
  },
  asturias: { tarifa: tarifaAsturias, bonificacion: 0 }
} as const;

// Utils
const toNum = (v: unknown) => (typeof v === "number" ? v : Number(v)) || 0;

function evalCondition(cond: string, states: Record<string, any>): boolean {
  // soporta: campo === 'Texto'  |  campo == true/false
  const m1 = cond.match(/^\s*([a-zA-Z0-9_]+)\s*===\s*'(.*)'\s*$/);
  if (m1) return String(states[m1[1]]) === m1[2];
  const m2 = cond.match(/^\s*([a-zA-Z0-9_]+)\s*==\s*(true|false)\s*$/i);
  if (m2) return Boolean(states[m2[1]]) === (m2[2].toLowerCase() === "true");
  return true;
}

// --- Motore di calcolo ---
function calculateTax(state: CalcState) {
  const base_imponible = Math.max(0, toNum(state.valor_herencia));
  if (!state.comunidad_autonoma || base_imponible <= 0) return {};

  const norm = taxData.estatal;

  // Selezione tariffa per CA (array uniformi -> niente tuple)
  const tarifa: ReadonlyArray<TarifaTramo> =
    state.comunidad_autonoma === "Asturias" ? taxData.asturias.tarifa : norm.tarifa;

  // Bonificaciones/Reglas CA (modello semplificato)
  let bonif = 0;
  if (state.grupo_parentesco === "Grupo I" || state.grupo_parentesco === "Grupo II") {
    if (state.comunidad_autonoma === "Comunidad de Madrid") bonif = taxData.madrid.bonificacion;
    if (state.comunidad_autonoma === "Andalucía") {
      if (base_imponible <= taxData.andalucia.reducciones.grupoI) {
        return {
          base_imponible,
          reducciones_aplicadas: base_imponible,
          base_liquidable: 0,
          cuota_integra: 0,
          cuota_tributaria: 0,
          total_a_pagar: 0
        };
      }
    }
  }

  // Reducciones estatales (simplificadas)
  let reduccion_parentesco = 0;
  if (state.grupo_parentesco === "Grupo I") {
    const anos = Math.max(0, 21 - toNum(state.edad_heredero));
    reduccion_parentesco = norm.reducciones.grupoI + norm.reducciones.porAnoMenos21 * anos;
  } else if (state.grupo_parentesco === "Grupo II") {
    reduccion_parentesco = norm.reducciones.grupoII;
  } else if (state.grupo_parentesco === "Grupo III") {
    reduccion_parentesco = norm.reducciones.grupoIII;
  }
  const reduccion_discapacidad = state.heredero_discapacidad ? norm.reducciones.discapacidad33 : 0;

  const reducciones_aplicadas = Math.max(0, reduccion_parentesco + reduccion_discapacidad);
  const base_liquidable = Math.max(0, base_imponible - reducciones_aplicadas);

  // Tarifa por tramos: cuota fija + marginal sobre el exceso desde el límite inferior ("hasta")
  const tramo = [...tarifa].reverse().find((t) => base_liquidable >= t.hasta);
  const cuota_integra = tramo ? tramo.cuota + (base_liquidable - tramo.hasta) * tramo.tipo : 0;

  // Coeficiente multiplicador (estatal)
  const cr = norm.coeficientes[state.grupo_parentesco] as CoefRule;
  const pre = toNum(state.patrimonio_preexistente);

  let coef: number = cr.coef;
  if (pre > 402_678.11 && pre <= 2_007_380.43) coef = cr.hasta2M;
  else if (pre > 2_007_380.43 && pre <= 4_020_770.98) coef = cr.hasta4M;
  else if (pre > 4_020_770.98) coef = cr.mas4M;

  const cuota_tributaria = cuota_integra * coef;

  const total_a_pagar = Math.max(0, cuota_tributaria * (1 - bonif));

  return { base_imponible, reducciones_aplicadas, base_liquidable, cuota_integra, cuota_tributaria, total_a_pagar };
}

// --- Componente ---
const CalculadoraSucesionesDonaciones: React.FC = () => {
  const { slug, title, inputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialStates: CalcState = {
    comunidad_autonoma: "Comunidad de Madrid",
    valor_herencia: 800000,
    grupo_parentesco: "Grupo II",
    edad_heredero: 30,
    patrimonio_preexistente: 100000,
    heredero_discapacidad: false
  };
  const [states, setStates] = useState<CalcState>(initialStates);

  const handleStateChange = (id: keyof CalcState, value: any) =>
    setStates((prev) => ({ ...prev, [id]: value }));

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => calculateTax(states), [states]);

  const chartData = useMemo(() => {
    const baseScenario = {
      ...states,
      patrimonio_preexistente: Math.min(states.patrimonio_preexistente, 400000)
    };
    const madridTax = (calculateTax({ ...baseScenario, comunidad_autonoma: "Comunidad de Madrid" }) as any)
      .total_a_pagar || 0;
    const andaluciaTax = (calculateTax({ ...baseScenario, comunidad_autonoma: "Andalucía" }) as any)
      .total_a_pagar || 0;
    const asturiasTax = (calculateTax({ ...baseScenario, comunidad_autonoma: "Asturias" }) as any)
      .total_a_pagar || 0;
    const estatalTax = (calculateTax({ ...baseScenario, comunidad_autonoma: "Normativa Estatal" }) as any)
      .total_a_pagar || 0;

    return [
      { name: "Selección Actual", impuesto: (calculatedOutputs as any).total_a_pagar || 0 },
      { name: "Madrid", impuesto: madridTax },
      { name: "Andalucía", impuesto: andaluciaTax },
      { name: "Asturias", impuesto: asturiasTax },
      { name: "Estatal", impuesto: estatalTax }
    ];
  }, [states, (calculatedOutputs as any).total_a_pagar]);

  const formatCurrency = useCallback(
    (v: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v || 0),
    []
  );

  // --- Actions ---
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
    } catch (e) {
      alert("La exportación a PDF no está disponible.");
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existing = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existing].slice(0, 50)));
      alert("¡Resultado guardado con éxito!");
    } catch {
      alert("No se pudo guardar el resultado.");
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{meta.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {calculatorData.inputs.map((input: any) => {
                const show = !input.condition || evalCondition(input.condition, states as any);
                if (!show) return null;

                if (input.type === "select") {
                  return (
                    <div key={input.id}>
                      <label
                        className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                        htmlFor={input.id}
                      >
                        {input.label}
                        {input.tooltip && (
                          <Tooltip text={input.tooltip}>
                            <span className="ml-2 cursor-help">
                              <InfoIcon />
                            </span>
                          </Tooltip>
                        )}
                      </label>
                      <select
                        id={input.id}
                        value={(states as any)[input.id]}
                        onChange={(e) => handleStateChange(input.id as keyof CalcState, e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      >
                        {(input.options as string[])?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (input.type === "boolean") {
                  return (
                    <div
                      key={input.id}
                      className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-white border self-end"
                    >
                      <input
                        id={input.id}
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={Boolean((states as any)[input.id])}
                        onChange={(e) => handleStateChange(input.id as keyof CalcState, e.target.checked)}
                      />
                      <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>
                        {input.label}
                      </label>
                    </div>
                  );
                }

                return (
                  <div key={input.id}>
                    <label
                      className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                      htmlFor={input.id}
                    >
                      {input.label}
                      {input.tooltip && (
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2 cursor-help">
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={input.id}
                        type="number"
                        value={String((states as any)[input.id] ?? "")}
                        onChange={(e) =>
                          handleStateChange(
                            input.id as keyof CalcState,
                            e.target.value === "" ? ("" as any) : Number(e.target.value)
                          )
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      />
                      {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-2">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Desglose del Cálculo</h2>
              {["base_imponible", "reducciones_aplicadas", "base_liquidable", "cuota_integra", "cuota_tributaria", "total_a_pagar"].map(
                (key) => {
                  const val = (calculatedOutputs as any)[key] ?? 0;
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  const isTotal = key === "total_a_pagar";
                  return (
                    <div
                      key={key}
                      className={`flex items-baseline justify-between p-3 rounded-r-lg ${
                        isTotal ? "bg-indigo-50 border-l-4 border-indigo-500" : "bg-gray-50"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-600">{label}</div>
                      <div className={`text-lg font-bold ${isTotal ? "text-indigo-600" : "text-gray-800"}`}>
                        {isClient ? formatCurrency(val) : "..."}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <button
                onClick={saveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar Resultado
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar a PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reiniciar
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparativa de Impuestos</h3>
            <div className="h-72 w-full">
              {isClient ? (
                <DynamicBarChart data={chartData} formatCurrency={formatCurrency} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">Cargando gráfico...</div>
              )}
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía del Impuesto y Comparativa</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/impuesto-sucesiones-donaciones-2018.html"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  AEAT - Sucesiones
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 29/1987 (BOE)
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraSucesionesDonaciones;
