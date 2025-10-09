'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

// Tipi per Recharts caricati lato client
type RechartsNS = typeof import('recharts');

// --- Meta per Pages Router ---
export const meta = {
  title: "Simulador de Plan de Pensiones (ventajas fiscales IRPF)",
  description: "Calcule las ventajas fiscales de su plan de pensiones y optimice sus aportaciones según la normativa IRPF 2025."
};

// --- Icona Tooltip ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- FAQ JSON-LD ---
const FaqSchema = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Cuál es el límite máximo que puedo aportar a un plan de pensiones en 2025?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Empleados: 1.500€ individual + 8.500€ empresa (10.000€). Autónomos: 1.500€ individual + 4.250€ simplificado (5.750€). Cónyuge con ingresos < 8.000€: hasta 1.000€ adicionales."
            }
          },
          {
            "@type": "Question",
            "name": "¿Cuándo puedo rescatar mi plan de pensiones?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Desde 2025: aportaciones con más de 10 años, o en jubilación, incapacidad, dependencia, enfermedad grave, fallecimiento, desempleo de larga duración."
            }
          },
          {
            "@type": "Question",
            "name": "¿Cómo tributa el rescate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tributa como rendimiento del trabajo. El rescate en renta permite mejor control fiscal; aportaciones pre-2007 tienen reducción del 40% si se rescatan en capital (condiciones aplicables)."
            }
          }
        ]
      })
    }}
  />
);

// --- Renderer contenuti con sanitizzazione minimale (escape + bold/italic) ---
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;")
   .replace(/'/g, "&#039;");

const applyInlineFormatting = (safe: string) =>
  safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

const ContentRenderer = ({ content }: { content: string }) => {
  const blocks = content.split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          const html = applyInlineFormatting(escapeHtml(trimmed.replace(/^###\s*/, '')));
          return <h3 key={idx} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: html }} />;
        }
        if (trimmed.startsWith('#### ')) {
          const html = applyInlineFormatting(escapeHtml(trimmed.replace(/^####\s*/, '')));
          return <h4 key={idx} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: html }} />;
        }
        if (trimmed.startsWith('- ')) {
          const items = trimmed.split('\n').map(i => i.replace(/^- /, ''));
          return (
            <ul key={idx} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((it, i) => {
                const html = applyInlineFormatting(escapeHtml(it));
                return <li key={i} dangerouslySetInnerHTML={{ __html: html }} />;
              })}
            </ul>
          );
        }
        if (/^\d\. /.test(trimmed)) {
          const items = trimmed.split('\n').map(i => i.replace(/^\d\. */, ''));
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((it, i) => {
                const html = applyInlineFormatting(escapeHtml(it));
                return <li key={i} dangerouslySetInnerHTML={{ __html: html }} />;
              })}
            </ol>
          );
        }
        const html = applyInlineFormatting(escapeHtml(trimmed));
        return <p key={idx} className="mb-4" dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
};

// --- Dati configurazione
const calculatorData = {
  slug: "simulador-plan-pensiones",
  title: "Simulador de Plan de Pensiones (ventajas fiscales IRPF)",
  inputs: [
    { id: "salario_bruto_anual", label: "Salario bruto anual", type: "number" as const, unit: "€", min: 0, step: 1000, tooltip: "Incluya todas las percepciones del trabajo (pagas extra, bonus, etc.)." },
    { id: "edad", label: "Edad actual", type: "number" as const, unit: "años", min: 18, max: 67, step: 1, tooltip: "Edad para proyecciones orientativas de ahorro." },
    { id: "situacion_laboral", label: "Situación laboral", type: "select" as const, options: [{ value: "empleado", label: "Empleado por cuenta ajena" }, { value: "autonomo", label: "Autónomo" }, { value: "funcionario", label: "Funcionario" }], tooltip: "Determina límites y plan disponible." },
    { id: "tiene_plan_empresa", label: "¿Su empresa tiene plan de pensiones?", type: "boolean" as const, condition: "situacion_laboral == 'empleado'", tooltip: "Permite +8.500€ adicionales." },
    { id: "aportacion_deseada", label: "Aportación anual deseada", type: "number" as const, unit: "€", min: 0, step: 100, tooltip: "Cantidad que desea aportar en el año." },
    { id: "tiene_conyuge", label: "¿Tiene cónyuge con bajos ingresos?", type: "boolean" as const, tooltip: "Si su cónyuge tiene rendimientos < 8.000€, puede aportar hasta 1.000€ a su plan." },
    { id: "aportacion_conyuge", label: "Aportación anual para el cónyuge", type: "number" as const, unit: "€", min: 0, max: 1000, step: 100, condition: "tiene_conyuge == true", tooltip: "Máximo 1.000€ si cumple requisitos." },
    { id: "comunidad_autonoma", label: "Comunidad Autónoma", type: "select" as const, options: [
      { value: "madrid", label: "Madrid" }, { value: "cataluna", label: "Cataluña" }, { value: "valencia", label: "Comunidad Valenciana" },
      { value: "andalucia", label: "Andalucía" }, { value: "galicia", label: "Galicia" }, { value: "castilla_leon", label: "Castilla y León" },
      { value: "pais_vasco", label: "País Vasco" }, { value: "castilla_mancha", label: "Castilla-La Mancha" }, { value: "canarias", label: "Canarias" },
      { value: "murcia", label: "Región de Murcia" }, { value: "aragon", label: "Aragón" }, { value: "extremadura", label: "Extremadura" },
      { value: "asturias", label: "Principado de Asturias" }, { value: "navarra", label: "Navarra" }, { value: "cantabria", label: "Cantabria" },
      { value: "baleares", label: "Islas Baleares" }, { value: "rioja", label: "La Rioja" }
    ], tooltip: "Tipos autonómicos aproximados para el cálculo del IRPF." }
  ],
  outputs: [
    { id: "limite_aportacion_individual", label: "Límite de aportación individual", unit: "€" },
    { id: "limite_aportacion_empresa", label: "Límite adicional plan de empresa/autónomo", unit: "€" },
    { id: "limite_aportacion_total", label: "Límite de aportación total", unit: "€" },
    { id: "aportacion_desgravable", label: "Aportación desgravable", unit: "€" },
    { id: "tipo_marginal_irpf", label: "Su tipo marginal de IRPF", unit: "%" },
    { id: "ahorro_fiscal_anual", label: "Ahorro fiscal anual", unit: "€" },
    { id: "ahorro_fiscal_proyectado_10_anos", label: "Ahorro fiscal proyectado (10 años)", unit: "€" }
  ],
  content: `### Introducción

El **Simulador de Plan de Pensiones** estima el ahorro fiscal de sus aportaciones según la normativa IRPF 2025. Este simulador es **orientativo**: simplifica el 30% sobre rendimientos netos y aplica tipos autonómicos aproximados.

### Metodología de Cálculo (resumen)
- **Límite individual**: MIN(1.500€, 30% rendimientos netos del trabajo).
- **Límite empleo**: +8.500€ (si plan de empresa).
- **Límite autónomo**: +4.250€ (plan simplificado).
- **Cónyuge**: +1.000€ si ingresos < 8.000€.
- **Ahorro fiscal**: Aportación desgravable × tipo marginal IRPF (tramos estatales + aproximación autonómica).

### Nota Legal
Resultados **no vinculantes**. Consulte a un asesor fiscal para su caso concreto.`
};

// --- Funzioni helper querystring ---
const encodeStateToQuery = (s: Record<string, any>) => {
  const params = new URLSearchParams();
  Object.entries(s).forEach(([k, v]) => {
    if (v !== "" && v !== undefined && v !== null) params.set(k, String(v));
  });
  return params.toString();
};

const parseStateFromQuery = (search: string, initial: Record<string, any>) => {
  const params = new URLSearchParams(search);
  const out: Record<string, any> = { ...initial };
  params.forEach((v, k) => {
    if (k in initial) {
      const base = initial[k];
      if (typeof base === "number") out[k] = Number(v);
      else if (typeof base === "boolean") out[k] = v === "true";
      else out[k] = v;
    }
  });
  return out;
};

const SimuladorPlanPensiones: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculadorRef = useRef<HTMLDivElement>(null);

  const [isClient, setIsClient] = useState(false);
  const [R, setR] = useState<RechartsNS | null>(null); // namespace Recharts caricato lato client

  // Stati iniziali
  const initialStates = {
    salario_bruto_anual: 35000,
    edad: 35,
    situacion_laboral: "empleado",
    tiene_plan_empresa: false,
    aportacion_deseada: 1500,
    tiene_conyuge: false,
    aportacion_conyuge: 0,
    comunidad_autonoma: "madrid"
  };
  const [states, setStates] = useState<Record<string, any>>(initialStates);

  // Load lato client + Recharts + deep-link dallo URL
  useEffect(() => {
    setIsClient(true);
    // deep-link: carica stato da querystring
    if (typeof window !== "undefined") {
      const parsed = parseStateFromQuery(window.location.search, initialStates);
      setStates(prev => ({ ...prev, ...parsed }));
    }
    // Carico Recharts solo al client per evitare errori di build/hydration
    import('recharts')
      .then((mod) => setR(mod))
      .catch(() => setR(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync stato -> querystring (URL condivisibile), con semplice debounce
  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      const qs = encodeStateToQuery(states);
      const url = `${window.location.pathname}?${qs}`;
      window.history.replaceState(null, "", url);
    }, 300);
    return () => window.clearTimeout(id);
  }, [states, isClient]);

  // Cambio stato con clamp min/max
  const handleStateChange = (id: string, value: any, min?: number, max?: number) => {
    let v: any = value;
    if (typeof v === "number" && !Number.isNaN(v)) {
      if (min !== undefined && v < min) v = min;
      if (max !== undefined && v > max) v = max;
    }
    setStates(prev => ({ ...prev, [id]: v }));
  };

  const handleReset = () => setStates(initialStates);

  // Tipo marginal IRPF aproximado (tramos estatales + autonómico por CCAA)
  const calcularTipoMarginalIRPF = (salario: number, comunidad: string): number => {
    let tipoEstatal = 19;
    if (salario > 12450 && salario <= 20200) tipoEstatal = 24;
    else if (salario > 20200 && salario <= 35200) tipoEstatal = 30;
    else if (salario > 35200 && salario <= 60000) tipoEstatal = 37;
    else if (salario > 60000 && salario <= 300000) tipoEstatal = 45;
    else if (salario > 300000) tipoEstatal = 47;

    const plusPorCCAA: Record<string, number> = {
      madrid: 0.5, cataluna: 1.5, valencia: 1.1, andalucia: 0.6, galicia: 1.0,
      castilla_leon: 0.7, pais_vasco: 3.0, castilla_mancha: 0.8, canarias: 0.5,
      murcia: 0.9, aragon: 1.2, extremadura: 1.2, asturias: 1.3, navarra: 2.0,
      cantabria: 0.9, baleares: 1.0, rioja: 0.7
    };
    const plus = plusPorCCAA[comunidad] ?? 0.8;
    return tipoEstatal + plus;
  };

  // Calcoli principali
  const calculated = useMemo(() => {
    const {
      salario_bruto_anual, situacion_laboral, tiene_plan_empresa,
      aportacion_deseada, tiene_conyuge, aportacion_conyuge, comunidad_autonoma, edad
    } = states;

    const limite_individual = Math.min(1500, (Number(salario_bruto_anual) || 0) * 0.30); // aprox. rend. netos
    let limite_empresa = 0;
    if (situacion_laboral === "empleado" && tiene_plan_empresa) limite_empresa = 8500;
    else if (situacion_laboral === "autonomo") limite_empresa = 4250;

    const limite_total = limite_individual + limite_empresa + (tiene_conyuge ? 1000 : 0);

    const aport_total_deseada = (Number(aportacion_deseada) || 0) + (tiene_conyuge ? (Number(aportacion_conyuge) || 0) : 0);
    const aportacion_desgravable = Math.min(aport_total_deseada, limite_total);

    // tipo marginal y plus autonómico (para transparencia UI)
    const plusPorCCAA: Record<string, number> = {
      madrid: 0.5, cataluna: 1.5, valencia: 1.1, andalucia: 0.6, galicia: 1.0,
      castilla_leon: 0.7, pais_vasco: 3.0, castilla_mancha: 0.8, canarias: 0.5,
      murcia: 0.9, aragon: 1.2, extremadura: 1.2, asturias: 1.3, navarra: 2.0,
      cantabria: 0.9, baleares: 1.0, rioja: 0.7
    };
    const plusAut = plusPorCCAA[String(comunidad_autonoma)] ?? 0.8;
    const tipo_marginal = calcularTipoMarginalIRPF(Number(salario_bruto_anual) || 0, String(comunidad_autonoma));
    const ahorro_fiscal_anual = aportacion_desgravable * (tipo_marginal / 100);
    const ahorro_fiscal_proyectado_10_anos = ahorro_fiscal_anual * 10;

    // stato validazione
    const warnings: string[] = [];
    if (aport_total_deseada > limite_total) {
      warnings.push("La aportación deseada supera el límite desgravable.");
    }
    if (tiene_conyuge && (Number(aportacion_conyuge) || 0) > 1000) {
      warnings.push("La aportación al cónyuge no puede exceder 1.000€.");
    }
    if (Number(edad) < 18 || Number(edad) > 67) {
      warnings.push("Edad fuera de rango (18–67).");
    }

    const interpretadoCorrectamente =
      warnings.length === 0 &&
      aportacion_desgravable === aport_total_deseada;

    return {
      limite_aportacion_individual: Math.round(limite_individual),
      limite_aportacion_empresa: limite_empresa,
      limite_aportacion_total: Math.round(limite_total),
      aportacion_desgravable: Math.round(aportacion_desgravable),
      tipo_marginal_irpf: Math.round(tipo_marginal * 10) / 10,
      ahorro_fiscal_anual: Math.round(ahorro_fiscal_anual),
      ahorro_fiscal_proyectado_10_anos: Math.round(ahorro_fiscal_proyectado_10_anos),
      warnings,
      interpretadoCorrectamente,
      plusAut // per badge CCAA
    };
  }, [states]);

  // Dati grafici
  const chartDataLimites = useMemo(() => ([
    { name: 'Individual', valor: calculated.limite_aportacion_individual },
    { name: 'Empresa/Autónomo', valor: calculated.limite_aportacion_empresa },
    { name: 'Cónyuge', valor: states.tiene_conyuge ? 1000 : 0 }
  ].filter(d => d.valor > 0)), [calculated.limite_aportacion_individual, calculated.limite_aportacion_empresa, states.tiene_conyuge]);

  const chartDataProyeccion = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      año: i + 1,
      'Ahorro Acumulado': calculated.ahorro_fiscal_anual * (i + 1)
    })), [calculated.ahorro_fiscal_anual]);

  const formulaUsada = `Límite Individual = MIN(1.500€, salario × 30%)  [aprox. rend. netos]
Límite Empleo = +8.500€ (empleados con plan empresa)
Límite Autónomo = +4.250€ (plan simplificado)
Cónyuge = +1.000€ si ingresos < 8.000€
Tipo IRPF = Tramos estatales (19–47%) + autonómico aprox. por CCAA
Ahorro Fiscal = Aportación Desgravable × (Tipo IRPF / 100)`;

  // Export PDF
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculadorRef.current) return;
      const canvas = await html2canvas(calculadorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`${calculatorData.slug}.pdf`);
    } catch {
      alert("Función PDF no disponible en este ambiente");
    }
  }, []);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const rows = [
      ["Campo", "Valor"],
      ...Object.entries(states),
      ...Object.entries({
        limite_aportacion_individual: calculated.limite_aportacion_individual,
        limite_aportacion_empresa: calculated.limite_aportacion_empresa,
        limite_aportacion_total: calculated.limite_aportacion_total,
        aportacion_desgravable: calculated.aportacion_desgravable,
        tipo_marginal_irpf: calculated.tipo_marginal_irpf,
        ahorro_fiscal_anual: calculated.ahorro_fiscal_anual,
        ahorro_fiscal_proyectado_10_anos: calculated.ahorro_fiscal_proyectado_10_anos
      })
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${calculatorData.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [states, calculated]);

  // Export XLSX (import solo client al click)
  const handleExportXLSX = useCallback(async () => {
    try {
      const XLSX = await import("xlsx");
      const sheetData = [
        ["Campo", "Valor"],
        ...Object.entries(states),
        ["limite_aportacion_individual", calculated.limite_aportacion_individual],
        ["limite_aportacion_empresa", calculated.limite_aportacion_empresa],
        ["limite_aportacion_total", calculated.limite_aportacion_total],
        ["aportacion_desgravable", calculated.aportacion_desgravable],
        ["tipo_marginal_irpf", calculated.tipo_marginal_irpf],
        ["ahorro_fiscal_anual", calculated.ahorro_fiscal_anual],
        ["ahorro_fiscal_proyectado_10_anos", calculated.ahorro_fiscal_proyectado_10_anos]
      ];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Simulación");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${calculatorData.slug}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Exportación XLSX no disponible.");
    }
  }, [states, calculated]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = { slug: calculatorData.slug, title: calculatorData.title, inputs: states, outputs: calculated, ts: Date.now() };
      const prev = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...prev].slice(0, 50)));
      alert("Resultado guardado con éxito!");
    } catch {
      alert("Imposible guardar el resultado.");
    }
  }, [states, calculated]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  // label CCAA per trasparenza
  const ccaaOptions = (inputs.find(i => i.id === "comunidad_autonoma") as any)?.options || [];
  const ccaaLabel = ccaaOptions.find((o: any) => o.value === states.comunidad_autonoma)?.label || String(states.comunidad_autonoma);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-6" ref={calculadorRef}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                  <p className="text-gray-600 mb-2">
                    Calcule las ventajas fiscales de su plan de pensiones y optimice sus aportaciones según la normativa IRPF 2025.
                  </p>
                </div>
                {calculated.interpretadoCorrectamente ? (
                  <span className="inline-flex items-center whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                    ✓ interpretado correctamente
                  </span>
                ) : (
                  <span className="inline-flex items-center whitespace-nowrap rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                    ⚠ revisar entradas
                  </span>
                )}
              </div>

              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Aviso Legal:</strong> Simulaciones orientativas. El 30% se aplica sobre <em>rendimientos netos</em> (aprox. con salario bruto × 30%). Tipos autonómicos aproximados. Consulte a un asesor.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => {
                  const conditionMet =
                    !input.condition ||
                    (input.condition.includes("== 'empleado'") && states.situacion_laboral === 'empleado') ||
                    (input.condition.includes("== true") && states[input.condition.split(' ')[0]]);
                  if (!conditionMet) return null;

                  const inputLabel = (
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                    </label>
                  );

                  if (input.type === 'boolean') {
                    return (
                      <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                        <input
                          id={input.id}
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={!!states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.checked)}
                        />
                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                      </div>
                    );
                  }

                  if (input.type === 'select') {
                    return (
                      <div key={input.id} className="md:col-span-2">
                        {inputLabel}
                        <select
                          id={input.id}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                        >
                          {input.options?.map((option: any) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={input.id}>
                      {inputLabel}
                      <div className="flex items-center gap-2">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          type="number"
                          min={input.min as number | undefined}
                          max={input.max as number | undefined}
                          step={input.step as number | undefined}
                          value={states[input.id]}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const numeric = raw === "" ? "" : Number(raw);
                            handleStateChange(input.id, numeric, input.min as number | undefined, input.max as number | undefined);
                          }}
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {calculated.warnings.length > 0 && (
                <div className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <strong>Avisos:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {calculated.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              <div className="mt-8 space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-700">Resultados de la Simulación</h2>
                  <span className="ml-2 inline-flex items-center whitespace-nowrap rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                    CCAA aplicada: {ccaaLabel} (+{calculated.plusAut.toFixed(1)}%)
                  </span>
                </div>

                {outputs.map(output => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                      output.id === 'ahorro_fiscal_anual' ? 'bg-green-50 border-green-500' :
                      output.id === 'aportacion_desgravable' ? 'bg-indigo-50 border-indigo-500' :
                      'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${
                      output.id === 'ahorro_fiscal_anual' ? 'text-green-600' :
                      output.id === 'aportacion_desgravable' ? 'text-indigo-600' :
                      'text-gray-800'
                    }`}>
                      <span>
                        {isClient
                          ? (output.unit === '€'
                              ? formatCurrency((calculated as any)[output.id])
                              : `${(calculated as any)[output.id]}${output.unit}`)
                          : '...'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Límites de Aportación por Tipo</h3>
                  <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                    {isClient && R && (
                      <R.ResponsiveContainer width="100%" height="100%">
                        <R.BarChart data={chartDataLimites} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                          <R.XAxis dataKey="name" />
                          <R.YAxis tickFormatter={(value: any) => `${value}€`} />
                          <R.Tooltip formatter={(value: number) => [`${value}€`, '']} />
                          <R.Bar dataKey="valor" fill="#4f46e5">
                            <R.LabelList dataKey="valor" position="top" />
                          </R.Bar>
                        </R.BarChart>
                      </R.ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Proyección Ahorro Fiscal (10 años)</h3>
                  <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                    {isClient && R && (
                      <R.ResponsiveContainer width="100%" height="100%">
                        <R.LineChart data={chartDataProyeccion} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                          <R.XAxis dataKey="año" />
                          <R.YAxis tickFormatter={(value: any) => `${value}€`} />
                          <R.Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                          <R.Line type="monotone" dataKey="Ahorro Acumulado" stroke="#10b981" strokeWidth={3} dot />
                        </R.LineChart>
                      </R.ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-700">Metodología de Cálculo</h3>
            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words whitespace-pre-line">{formulaUsada}</p>
            <p className="text-xs text-gray-500 mt-2">Nota: Cálculos orientativos. Los límites exactos dependen de su base imponible y la normativa autonómica vigente.</p>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
              <button onClick={handleExportCSV} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">CSV</button>
              <button onClick={handleExportXLSX} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">XLSX</button>
              <button onClick={handleReset} className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reiniciar</button>
            </div>
            <p className="text-[11px] text-gray-500 mt-3">
              URL compartible (estado en querystring) — copie la URL del navegador para guardar/compartir su simulación.
            </p>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía Completa</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ContentRenderer content={content} />
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Referencias Legales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ley 35/2006, del IRPF</a> — Deducciones por aportaciones a planes de pensiones.</li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1987-25730" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ley 8/1987 de Planes y Fondos de Pensiones</a> — Marco normativo.</li>
              <li><a href="https://sede.agenciatributaria.gob.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria</a> — Información oficial.</li>
              <li><a href="https://www.dgsfp.mineco.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">DGSFP</a> — Supervisión de planes y fondos.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default SimuladorPlanPensiones;
