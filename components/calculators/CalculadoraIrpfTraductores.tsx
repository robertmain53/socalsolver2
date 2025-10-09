'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

/* =========================
   Types
   ========================= */
type InputType = "number" | "select"; // removed "boolean" since unused

interface BaseInput {
  id: string;
  label: string;
  type: InputType;
  tooltip: string;
  unit?: string;
  condition?: string;
}
interface NumberInput extends BaseInput {
  type: "number";
  min: number;
  step: number;
}
interface SelectOption { value: string; label: string }
interface SelectInput extends BaseInput {
  type: "select";
  options: SelectOption[];
}
type CalculatorInput = NumberInput | SelectInput;

interface CalculatorOutput {
  id: string;
  label: string;
  unit: string;
}
interface CalculatorData {
  slug: string;
  category: string;
  title: string;
  lang: string;
  inputs: CalculatorInput[];
  outputs: CalculatorOutput[];
  content: string;
  seoSchema: any;
}

/* =========================
   Client-only Chart (safe dynamic)
   ========================= */
// We return a ready-to-use React component from the dynamic import.
// This pattern avoids the common TS mismatches when importing subcomponents individually.
const BarsViz = dynamic(async () => {
  const mod = await import('recharts');
  const {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
  } = mod;

  const C: React.FC<{
    data: { name: string; value: number; fill?: string }[];
    formatCurrency: (n: number) => string;
  }> = ({ data, formatCurrency }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 20, left: -10, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(v) => formatCurrency(Number(v))}
          width={80}
        />
        <Tooltip
          formatter={(value: any) => [formatCurrency(Number(value)), '']}
          cursor={{ fill: 'rgba(243,244,246,0.6)' }}
        />
        <Bar dataKey="value" background={{ fill: '#eee' }} />
      </BarChart>
    </ResponsiveContainer>
  );
  return C;
}, { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">Cargando gráfico…</p></div> });

/* =========================
   UI bits
   ========================= */
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-gray-400 hover:text-gray-600 transition-colors">
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

const FaqSchema = ({ schema }: { schema: any }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

/* Simple inline MD-ish renderer for small content blocks */
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="text-sm bg-amber-100 text-amber-800 rounded px-1 py-0.5">$1</code>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('###')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4 text-gray-800"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.replace(/###\s*/, '')) }}
            />
          );
        }
        if (trimmed.startsWith('*')) {
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {trimmed.split('\n').map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="mb-4 leading-relaxed"
             dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed) }} />
        );
      })}
    </div>
  );
};

/* =========================
   Data
   ========================= */
const calculatorData: CalculatorData = {
  slug: "calculadora-irpf-traductores",
  category: "Impuestos y trabajo autonomo",
  title: "Calculadora de IRPF para traductores e intérpretes autónomos",
  lang: "es",
  inputs: [
    {
      id: "ingresos_anuales",
      label: "Ingresos Brutos Anuales",
      type: "number",
      unit: "€",
      min: 0,
      step: 100,
      tooltip: "Suma de todas las facturas emitidas en el año, sin incluir el IVA y antes de restar cualquier gasto."
    },
    {
      id: "cuota_autonomos_mensual",
      label: "Cuota Mensual de Autónomos (Seguridad Social)",
      type: "number",
      unit: "€",
      min: 0,
      step: 1,
      tooltip: "Importe mensual a la Seguridad Social. Gasto 100% deducible. Introduce el promedio mensual."
    },
    {
      id: "otros_gastos_deducibles",
      label: "Otros Gastos Deducibles Anuales",
      type: "number",
      unit: "€",
      min: 0,
      step: 50,
      tooltip: "Software (CAT), marketing, membresías (Asetrad, APTIC), gestoría, etc."
    },
    {
      id: "retenciones_soportadas",
      label: "Retenciones de IRPF ya Aplicadas",
      type: "number",
      unit: "€",
      min: 0,
      step: 50,
      tooltip: "Suma del IRPF retenido en tus facturas por clientes españoles (15% o 7% nuevos autónomos)."
    },
    {
      id: "situacion_familiar",
      label: "Situación Familiar y Personal",
      type: "select",
      options: [
        { value: "soltero_sin_hijos", label: "Soltero/a, viudo/a, divorciado/a sin hijos" },
        { value: "casado_unica_declaracion", label: "Casado/a (declaración individual)" },
        { value: "casado_conjunta", label: "Casado/a (declaración conjunta)" }
      ],
      tooltip: "Afecta al mínimo personal y familiar."
    },
    {
      id: "edad",
      label: "Edad del Contribuyente",
      type: "number",
      unit: "años",
      min: 18,
      step: 1,
      tooltip: "A partir de 65 años, aumenta el mínimo exento."
    },
    {
      id: "descendientes_menores_25",
      label: "Nº de Hijos < 25 años a cargo",
      type: "number",
      unit: "",
      min: 0,
      step: 1,
      tooltip: "Hijos convivientes con rentas < 8.000 €/año."
    }
  ],
  outputs: [
    { id: "rendimiento_neto", label: "Rendimiento Neto (Beneficio Real)", unit: "€" },
    { id: "base_imponible_general", label: "Base Imponible General", unit: "€" },
    { id: "total_irpf_anual", label: "Total IRPF a Pagar (Cuota Íntegra)", unit: "€" },
    { id: "resultado_declaracion", label: "Resultado Final de la Declaración", unit: "€" },
    { id: "pago_trimestral_estimado", label: "Pago Trimestral Estimado (Modelo 130)", unit: "€" },
    { id: "tipo_efectivo", label: "Tipo Efectivo de IRPF", unit: "%" }
  ],
  content: `### Introducción

Esta calculadora está diseñada específicamente para **traductores e intérpretes autónomos en España** que tributan en estimación directa simplificada.

### Guía all'Uso del Calcolatore

* **Ingresos Brutos Anuales**: total facturado (base imponible) sin IVA.
* **Cuota Autónomos**: gasto deducible.
* **Otros Gastos Deducibles**: software CAT, gestoría, etc.
* **Retenciones**: 15%/7% practicadas por clientes españoles.
* **Situación Familiar**: ajusta el mínimo personal y familiar.

### Metodologia di Calcolo Spiegata

1. **Rendimiento Neto** = Ingresos - Gastos deducibles.
2. **Reducción gastos difícil justificación**: 7% (tope 2.000 €) aplicable sobre beneficio positivo.
3. **Base Imponible** = Rendimiento Neto - Mínimo personal y familiar.
4. **Tramos progresivos** (estatal+autonómico genéricos).
5. **Resultado final** = Cuota Íntegra - Retenciones.

### Gastos Deducibles Clave

* **Software y suscripciones** (CAT, ofimática).
* **Afiliaciones profesionales** (Asetrad, APTIC…).
* **Formación y eventos**.
* **Marketing y web**.
* **Suministros del home office** (proporción).
* **Gestoría y otros profesionales**.

### FAQ

**¿Incluye el IVA?** No, solo IRPF.

**¿Qué es el Modelo 130?** Pago a cuenta trimestral (≈20% rendimiento neto acumulado).

**Clientes extranjeros y retenciones**: no se retiene; la cuota anual ≈ resultado final.`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Esta calculadora incluye el IVA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, esta calculadora se centra exclusivamente en el IRPF."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué es el Modelo 130 y por qué es importante?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pago a cuenta trimestral del 20% del rendimiento neto acumulado."
        }
      }
    ]
  }
};

/* =========================
   Component
   ========================= */
const CalculadoraIrpfTraductores: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // Keep initial state stable across renders
  const initialStates = useMemo(() => ({
    ingresos_anuales: 45000,
    cuota_autonomos_mensual: 294,
    otros_gastos_deducibles: 4500,
    retenciones_soportadas: 5000,
    situacion_familiar: 'soltero_sin_hijos',
    edad: 35,
    descendientes_menores_25: 0
  }), []);

  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

  const formatCurrency = useCallback(
    (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0),
    []
  );

  const calculatedOutputs = useMemo(() => {
    const {
      ingresos_anuales,
      cuota_autonomos_mensual,
      otros_gastos_deducibles,
      retenciones_soportadas,
      situacion_familiar,
      edad,
      descendientes_menores_25
    } = states;

    const ingresos = Number(ingresos_anuales) || 0;
    const cuotaMensual = Number(cuota_autonomos_mensual) || 0;
    const otrosGastos = Number(otros_gastos_deducibles) || 0;
    const retenciones = Number(retenciones_soportadas) || 0;
    const edadNum = Number(edad) || 0;
    const hijos = Math.max(0, Number(descendientes_menores_25) || 0);

    // Gastos
    const gastosAutonomosAnual = cuotaMensual * 12;
    const totalGastos = gastosAutonomosAnual + otrosGastos;

    // Beneficio previo
    const beneficioPrevio = ingresos - totalGastos;

    // Reducción 7% (tope 2.000€) solo si hay beneficio positivo
    const reduccionGeneral = beneficioPrevio > 0 ? Math.min(2000, beneficioPrevio * 0.07) : 0;

    const rendimiento_neto = Math.max(0, beneficioPrevio - reduccionGeneral); // no negativo a efectos simplificados

    // Mínimos (simplificados genéricos)
    let minimo_personal = 5550;
    if (edadNum >= 65) minimo_personal += 1150;
    if (edadNum >= 75) minimo_personal += 1400;

    let minimo_descendientes = 0;
    if (hijos >= 1) minimo_descendientes = 2400;
    if (hijos >= 2) minimo_descendientes = 2700;
    if (hijos >= 3) minimo_descendientes = 4000;
    if (hijos >= 4) minimo_descendientes = 4500;

    // (Opcional) ajuste de conjunta (muy simplificado)
    if (situacion_familiar === 'casado_conjunta') {
      minimo_personal += 3400; // aproximación para conjunta (simplificada)
    }

    const minimo_total = minimo_personal + minimo_descendientes;

    const base_imponible_general = Math.max(0, rendimiento_neto - minimo_total);

    // Tramos IRPF genéricos (estatal+autonómico promedio)
    const tramos_irpf = [
      { limite: 12450, tipo: 0.19 },
      { limite: 20200, tipo: 0.24 },
      { limite: 35200, tipo: 0.30 },
      { limite: 60000, tipo: 0.37 },
      { limite: 300000, tipo: 0.45 },
      { limite: Infinity, tipo: 0.47 },
    ];

    let cuota_integra = 0;
    let base_restante = base_imponible_general;
    let limite_anterior = 0;

    for (const tramo of tramos_irpf) {
      if (base_restante <= 0) break;
      const base_en_tramo = Math.min(base_restante, tramo.limite - limite_anterior);
      if (base_en_tramo > 0) {
        cuota_integra += base_en_tramo * tramo.tipo;
        base_restante -= base_en_tramo;
        limite_anterior = tramo.limite;
      }
    }

    const resultado_declaracion = cuota_integra - retenciones;

    // Modelo 130 aproximado: 20% del rendimiento neto *positivo* acumulado/4
    const pago_trimestral_estimado = Math.max(0, (rendimiento_neto * 0.20) / 4);

    // Tipo efectivo: sobre ingresos (alternativa sería sobre rendimiento_neto)
    const tipo_efectivo = ingresos > 0 ? (cuota_integra / ingresos) * 100 : 0;

    return {
      rendimiento_neto,
      base_imponible_general,
      total_irpf_anual: cuota_integra,
      resultado_declaracion,
      pago_trimestral_estimado,
      tipo_efectivo
    };
  }, [states]);

  const handleExportPDF = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const element = calculatorRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${calculatorData.slug}.pdf`);
  }, []);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = {
        slug: calculatorData.slug,
        title: calculatorData.title,
        inputs: states,
        outputs: calculatedOutputs,
        ts: Date.now()
      };
      const existing = JSON.parse(localStorage.getItem("calc_results") || "[]");
      const next = [payload, ...existing].slice(0, 10);
      localStorage.setItem("calc_results", JSON.stringify(next));
      alert("Resultado guardado en el almacenamiento local.");
    } catch {
      alert("No se pudo guardar el resultado.");
    }
  }, [states, calculatedOutputs]);

  const chartData = useMemo(() => ([
    { name: 'Ingresos',  value: Number(states.ingresos_anuales) || 0, fill: '#4ade80' },
    { name: 'Beneficio', value: Number(calculatedOutputs.rendimiento_neto) || 0, fill: '#38bdf8' },
    { name: 'Impuestos', value: Number(calculatedOutputs.total_irpf_anual) || 0, fill: '#f87171' },
  ]), [states.ingresos_anuales, calculatedOutputs.rendimiento_neto, calculatedOutputs.total_irpf_anual]);

  return (
    <>
      <FaqSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-slate-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
            <p className="text-gray-600 mb-4">
              Una herramienta esencial para estimar tus impuestos y optimizar tu fiscalidad como profesional de la traducción.
            </p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Aviso Legal:</strong> Estimación orientativa. Puede variar por CCAA y circunstancias personales. No sustituye asesoramiento profesional.
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg border">
              {inputs.map(input => {
                const labelEl = (
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    <Tooltip text={input.tooltip}><span className="ml-1.5 cursor-help"><InfoIcon /></span></Tooltip>
                  </label>
                );

                if (input.type === 'select') {
                  const s = input as SelectInput;
                  return (
                    <div key={input.id} className="md:col-span-2">
                      {labelEl}
                      <select
                        id={input.id}
                        value={states[input.id]}
                        onChange={e => handleStateChange(input.id, e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-sm"
                      >
                        {s.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  );
                }

                const n = input as NumberInput;
                return (
                  <div key={input.id}>
                    {labelEl}
                    <div className="flex items-center">
                      <input
                        id={input.id}
                        type="number"
                        min={n.min}
                        step={n.step}
                        value={states[input.id]}
                        onChange={e => handleStateChange(
                          input.id,
                          e.target.value === '' ? '' : Number(e.target.value)
                        )}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-sm"
                      />
                      {input.unit && <span className="ml-2 text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Outputs */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados Estimados</h2>
              {outputs.map(output => {
                const raw = (calculatedOutputs as any)[output.id] as number;
                const isFinal = output.id === 'resultado_declaracion';
                const isPositive = isFinal && raw >= 0;
                const isNegative = isFinal && raw < 0;

                const bgColor = isPositive ? 'bg-red-50 border-red-500'
                  : isNegative ? 'bg-green-50 border-green-500'
                  : 'bg-gray-50 border-gray-300';
                const textColor = isPositive ? 'text-red-600'
                  : isNegative ? 'text-green-600'
                  : 'text-indigo-600';

                return (
                  <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${bgColor}`}>
                    <div className="text-sm md:text-base font-medium text-gray-700">
                      {output.label} {isPositive ? '(a pagar)' : isNegative ? '(a devolver)' : ''}
                    </div>
                    <div className={`text-xl md:text-2xl font-bold ${textColor}`}>
                      {isClient ? (
                        output.unit === '€' ? formatCurrency(raw) : `${(Number(raw) || 0).toFixed(2)}%`
                      ) : '…'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Desglose Visual</h3>
              <div className="h-64 w-full bg-gray-50 p-2 rounded-lg border">
                {isClient && <BarsViz data={chartData} formatCurrency={formatCurrency} />}
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSaveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 text-sm w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reiniciar
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-5 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía y Consejos Fiscales</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/c03-actividades-economicas/regimen-estimacion-directa-simplificada.html"
                  target="_blank" rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Estimación directa simplificada
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764"
                  target="_blank" rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 35/2006 (IRPF)
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfTraductores;
