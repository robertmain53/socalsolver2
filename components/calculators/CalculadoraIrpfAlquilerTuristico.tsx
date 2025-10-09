'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

// --- TIPI E DATI DI CONFIGURAZIONE ---

type InputField = {
  id: string;
  label: string;
  type: 'number' | 'boolean' | 'select';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip: string;
  options?: string[];
};

type OutputField = {
  id: string;
  label: string;
  unit: string;
};

const calculatorData = {
  slug: "calculadora-irpf-alquiler-turistico",
  category: "Impuestos y trabajo autónomo",
  title: "Calculadora de IRPF para ingresos por alquileres turísticos",
  description:
    "Estima de forma detallada el IRPF a pagar por tu vivienda de uso turístico, considerando gastos deducibles, amortización e imputación de rentas.",
  lang: "es",
  inputs: [
    { id: "ingresos_brutos", label: "Ingresos brutos anuales", type: "number" as const, unit: "€", min: 0, step: 100, tooltip: "Suma total de todos los ingresos recibidos por el alquiler de la vivienda turística durante el año fiscal, sin descontar comisiones." },
    { id: "dias_alquilado", label: "Días que la vivienda estuvo alquilada", type: "number" as const, unit: "días", min: 0, max: 365, step: 1, tooltip: "Número total de días en el año que la propiedad estuvo efectivamente alquilada a turistas." },
    { id: "comisiones_plataformas", label: "Comisiones de plataformas (Airbnb, etc.)", type: "number" as const, unit: "€", min: 0, step: 10, tooltip: "Importe total pagado en comisiones a portales de alquiler vacacional. Este gasto es 100% deducible." },
    { id: "gastos_limpieza", label: "Gastos de limpieza y lavandería", type: "number" as const, unit: "€", min: 0, step: 10, tooltip: "Costes asociados a la limpieza de la vivienda entre estancias de huéspedes." },
    { id: "reparaciones_mantenimiento", label: "Reparaciones y mantenimiento", type: "number" as const, unit: "€", min: 0, step: 10, tooltip: "Gastos para mantener el inmueble en buen estado (pintura, etc.), que no constituyan una mejora." },
    { id: "ibi_anual", label: "IBI (Impuesto sobre Bienes Inmuebles) anual", type: "number" as const, unit: "€", min: 0, step: 5, tooltip: "Importe anual del IBI. El sistema calculará la parte proporcional deducible." },
    { id: "comunidad_anual", label: "Gastos de comunidad anuales", type: "number" as const, unit: "€", min: 0, step: 5, tooltip: "Cuotas de la comunidad de propietarios. Se calculará la parte proporcional deducible." },
    { id: "suministros_anuales", label: "Suministros (luz, agua, internet) anuales", type: "number" as const, unit: "€", min: 0, step: 10, tooltip: "Suma de todos los gastos de suministros del año. Solo la parte proporcional es deducible." },
    { id: "intereses_hipoteca_anuales", label: "Intereses de la hipoteca anuales", type: "number" as const, unit: "€", min: 0, step: 10, tooltip: "Suma de los intereses (no el capital) pagados por la hipoteca. Se prorrateará." },
    { id: "valor_adquisicion_construccion", label: "Valor de adquisición (solo construcción)", type: "number" as const, unit: "€", min: 0, step: 1000, tooltip: "Coste de adquisición de la construcción (sin contar el valor del suelo). Necesario para el cálculo de la amortización." },
    { id: "valor_catastral_total", label: "Valor catastral total", type: "number" as const, unit: "€", min: 0, step: 1000, tooltip: "Valor catastral completo del inmueble (recibo del IBI). Se usa para calcular la imputación de renta por los días que no estuvo alquilado." },
    { id: "catastro_revisado", label: "Valor catastral revisado en los últimos 10 años", type: "boolean" as const, tooltip: "Marcar si el valor catastral ha sido actualizado en los últimos 10 años. Cambia el porcentaje de imputación del 2% al 1.1%." },
    { id: "comunidad_autonoma", label: "Comunidad Autónoma para tramo IRPF", type: "select" as const, options: ["Estatal (Tipo General)", "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", "Castilla-La Mancha", "Castilla y León", "Cataluña", "Extremadura", "Galicia", "Madrid", "Murcia", "La Rioja", "Comunidad Valenciana"], tooltip: "La cuota del IRPF se compone de un tramo estatal y otro autonómico. Su selección afecta al cálculo final." }
  ],
  outputs: [
    { id: "rendimiento_neto", label: "Rendimiento Neto por Alquiler", unit: "€" },
    { id: "imputacion_renta", label: "Imputación de Renta Inmobiliaria (días vacío)", unit: "€" },
    { id: "base_imponible_total", label: "Base Imponible Total a declarar", unit: "€" },
    { id: "cuota_irpf_a_pagar", label: "Cuota de IRPF a Pagar (Estimación)", unit: "€" }
  ],
  content:
    "### Introducción\n\nEsta calculadora está diseñada para propietarios de viviendas de uso turístico (VUT) en España. Su objetivo es proporcionar una **estimación clara y detallada del impuesto sobre la renta (IRPF)** que se debe pagar por los beneficios obtenidos. A diferencia de un alquiler de vivienda habitual, el alquiler turístico tiene particularidades fiscales importantes que esta herramienta te ayudará a comprender y calcular.\n\n### Guía de Uso de la Calculadora\n\nPara obtener una estimación precisa, rellena los siguientes campos:\n\n* **Ingresos brutos anuales**: La cantidad total que has facturado a tus huéspedes a lo largo del año.\n* **Días que la vivienda estuvo alquilada**: Es el dato clave para prorratear los gastos anuales. Solo los gastos correspondientes a este periodo son deducibles.\n* **Gastos directos (Comisiones, Limpieza)**: Costes directamente relacionados con cada alquiler.\n* **Gastos anuales (IBI, Comunidad, Suministros, Intereses)**: Gastos que se soportan durante todo el año. La calculadora calculará automáticamente la parte proporcional que puedes deducir.\n* **Valor de adquisición (construcción)**: Necesario para calcular la amortización, uno de los gastos deducibles más significativos. Es el precio de compra de la edificación, excluyendo el valor del suelo.\n* **Valor catastral**: Se usa para calcular la \"renta imputada\" por los días en que la vivienda estuvo vacía y a tu disposición.\n* **Comunidad Autónoma**: Esencial para aplicar la escala de gravamen autonómica correcta, que varía significativamente en España.\n\n### Metodología de Cálculo Explicada\n\nEl cálculo del IRPF para alquileres turísticos se basa en dos conceptos clave:\n\n1.  **Rendimiento Neto del Alquiler**: Son los ingresos brutos menos todos los gastos deducibles. La clave aquí es el **prorrateo**: los gastos anuales (IBI, seguros, intereses, amortización) solo son deducibles en proporción a los días que la vivienda estuvo alquilada. A diferencia del alquiler de vivienda habitual, el alquiler turístico **no tiene derecho a la reducción del 60%** sobre el rendimiento neto.\n\n2.  **Imputación de Renta Inmobiliaria**: Durante los días en que la vivienda no está alquilada ni es tu residencia habitual, Hacienda considera que está a tu disposición y te imputa una renta \"presunta\". Esta se calcula aplicando un porcentaje (1,1% o 2%) al valor catastral, prorrateado a los días que estuvo vacía.\n\nLa **Base Imponible** final que se somete a los tramos del IRPF es la suma de ambos conceptos.\n\n### Análisis Profundo: Claves Fiscales del Alquiler Turístico\n\n#### La gran diferencia: Alquiler Turístico vs. Alquiler de Vivienda Habitual\n\nLa distinción más importante es la **no aplicabilidad de la reducción del 60%**. En un alquiler de larga estancia, después de calcular el rendimiento neto (ingresos - gastos), puedes reducir esa cifra en un 60% antes de pagar impuestos. En el alquiler turístico, se tributa sobre el 100% del rendimiento neto. Esto hace que la correcta deducción de todos los gastos permitidos sea absolutamente crucial para optimizar la carga fiscal.\n\n#### ¿Rendimientos del Capital Inmobiliario o Actividad Económica?\n\nPor defecto, los ingresos de alquileres turísticos se declaran como **rendimientos del capital inmobiliario**. Sin embargo, si para la ordenación de la actividad se utiliza, al menos, **una persona empleada con contrato laboral y a jornada completa**, se considerará una **actividad económica**. Esto cambia la forma de tributar, permitiendo deducir más gastos pero también implicando otras obligaciones (alta en IAE, posiblemente IVA, etc.). Esta calculadora se centra en el caso más común: rendimientos del capital inmobiliario.\n\n#### La importancia del Modelo 179\n\nDesde 2018, las plataformas de intermediación (Airbnb, Booking.com, etc.) están obligadas a presentar el **Modelo 179**, una declaración informativa donde detallan a la Agencia Tributaria los datos de los propietarios, los días de alquiler y los importes percibidos. Esto significa que Hacienda tiene información precisa sobre tus ingresos, por lo que es fundamental declarar correctamente tanto los ingresos como los gastos deducibles.\n\n### Preguntas Frecuentes (FAQ)\n\n1.  **¿Qué gastos puedo deducir en mi alquiler turístico?**\n    Puedes deducir todos los gastos necesarios para obtener los ingresos, siempre de forma proporcional al tiempo que ha estado alquilado. Los más comunes son: comisiones de plataformas, limpieza, suministros, IBI, tasa de basuras, comunidad, intereses de la hipoteca, seguro del hogar, reparaciones y la amortización del inmueble (3% del valor de construcción).\n\n2.  **¿Tengo que declarar algo si la vivienda ha estado vacía todo el año?**\n    Sí. Si la vivienda no es tu residencia habitual y ha estado vacía, debes declarar una imputación de renta inmobiliaria, calculada sobre su valor catastral. No pagarías por rendimientos del alquiler, pero sí por esta renta presunta.\n\n3.  **¿Qué pasa si mis gastos son superiores a mis ingresos?**\n    Si el rendimiento neto es negativo (pérdida), puedes compensarlo con otros rendimientos del capital inmobiliario positivos que hayas tenido en el mismo año. Si aún así el saldo es negativo, puedes compensarlo en los 4 años siguientes.",
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Qué gastos puedo deducir en mi alquiler turístico?", "acceptedAnswer": { "@type": "Answer", "text": "Puedes deducir todos los gastos necesarios para obtener los ingresos, siempre de forma proporcional al tiempo que ha estado alquilado. Los más comunes son: comisiones de plataformas, limpieza, suministros, IBI, tasa de basuras, comunidad, intereses de la hipoteca, seguro del hogar, reparaciones y la amortización del inmueble (3% del valor de construcción)." } },
      { "@type": "Question", "name": "¿Tengo que declarar algo si la vivienda ha estado vacía todo el año?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Si la vivienda no es tu residencia habitual y ha estado vacía, debes declarar una imputación de renta inmobiliaria, calculada sobre su valor catastral. No pagarías por rendimientos del alquiler, pero sí por esta renta presunta." } },
      { "@type": "Question", "name": "¿Qué pasa si mis gastos son superiores a mis ingresos?", "acceptedAnswer": { "@type": "Answer", "text": "Si el rendimiento neto es negativo (pérdida), puedes compensarlo con otros rendimientos del capital inmobiliario positivos que hayas tenido en el mismo año. Si aún así el saldo es negativo, puedes compensarlo en los 4 años siguientes." } }
    ]
  }
};

// --- COMPONENTI UTILITY ---

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
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
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/_(.*?)_/g, "<em>$1</em>");

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split("\n\n").map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith("### "))
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace("### ", "")) }}
            />
          );
        if (trimmedBlock.startsWith("#### "))
          return (
            <h4
              key={index}
              className="text-lg font-semibold mt-4 mb-3"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace("#### ", "")) }}
            />
          );
        if (trimmedBlock.startsWith("* "))
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {trimmedBlock.split("\n").map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, "")) }} />
              ))}
            </ul>
          );
        if (trimmedBlock.match(/^\d\.\s/))
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {trimmedBlock.split("\n").map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, "")) }} />
              ))}
            </ol>
          );
        if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        return null;
      })}
    </div>
  );
};

// --- LOGICA DI CALCOLO E TABELLE IRPF ---

const tramosEstatal = [
  { limite: 12450, tipo: 0.095 },
  { limite: 20200, tipo: 0.12 },
  { limite: 35200, tipo: 0.15 },
  { limite: 60000, tipo: 0.185 },
  { limite: 300000, tipo: 0.225 },
  { limite: Infinity, tipo: 0.245 },
];

const tramosAutonomicos: { [key: string]: { limite: number; tipo: number }[] } = {
  Madrid: [
    { limite: 13362, tipo: 0.085 }, { limite: 18972, tipo: 0.107 },
    { limite: 35052, tipo: 0.128 }, { limite: 56532, tipo: 0.174 },
    { limite: Infinity, tipo: 0.205 }
  ],
  Andalucía: [
    { limite: 13072, tipo: 0.095 }, { limite: 21272, tipo: 0.12 },
    { limite: 36472, tipo: 0.15 }, { limite: 61272, tipo: 0.185 },
    { limite: 301272, tipo: 0.225 }, { limite: Infinity, tipo: 0.245 }
  ],
  default: [
    { limite: 12450, tipo: 0.095 }, { limite: 20200, tipo: 0.12 },
    { limite: 35200, tipo: 0.15 }, { limite: 60000, tipo: 0.185 },
    { limite: 300000, tipo: 0.225 }, { limite: Infinity, tipo: 0.245 }
  ],
};

const calculateTramos = (base: number, tramos: { limite: number; tipo: number }[]): number => {
  if (base <= 0) return 0;
  let impuesto = 0;
  let baseRestante = base;
  let limiteAnterior = 0;

  for (const tramo of tramos) {
    if (baseRestante <= 0) break;
    const baseEnTramo = Math.min(baseRestante, tramo.limite - limiteAnterior);
    if (baseEnTramo > 0) {
      impuesto += baseEnTramo * tramo.tipo;
      baseRestante -= baseEnTramo;
      limiteAnterior = tramo.limite;
    }
  }
  return impuesto;
};

// --- COMPONENTE PRINCIPALE ---

const CalculadoraIrpfAlquilerTuristico: React.FC = () => {
  const { slug, title, description, inputs, outputs, content, seoSchema } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates: { [key: string]: any } = {
    ingresos_brutos: 20000, dias_alquilado: 150, comisiones_plataformas: 3000,
    gastos_limpieza: 1500, reparaciones_mantenimiento: 400, ibi_anual: 500,
    comunidad_anual: 700, suministros_anuales: 1800, intereses_hipoteca_anuales: 2500,
    valor_adquisicion_construccion: 120000, valor_catastral_total: 90000,
    catastro_revisado: true, comunidad_autonoma: 'Madrid',
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const dias_alquilado = Number(states.dias_alquilado) || 0;
    const factor_prorrateo = dias_alquilado > 0 ? dias_alquilado / 365 : 0;

    const amortizacion_anual = (Number(states.valor_adquisicion_construccion) || 0) * 0.03;
    const gastos_prorrateados = (
      (Number(states.ibi_anual) || 0) +
      (Number(states.comunidad_anual) || 0) +
      (Number(states.suministros_anuales) || 0) +
      (Number(states.intereses_hipoteca_anuales) || 0) +
      amortizacion_anual
    ) * factor_prorrateo;

    const gastos_directos =
      (Number(states.comisiones_plataformas) || 0) +
      (Number(states.gastos_limpieza) || 0) +
      (Number(states.reparaciones_mantenimiento) || 0);

    const gastos_deducibles_totales = gastos_directos + gastos_prorrateados;
    const rendimiento_neto = (Number(states.ingresos_brutos) || 0) - gastos_deducibles_totales;

    const dias_vacios = Math.max(0, 365 - dias_alquilado);
    const porcentaje_imputacion = states.catastro_revisado ? 0.011 : 0.02;
    const imputacion_renta = dias_vacios > 0
      ? (Number(states.valor_catastral_total) || 0) * porcentaje_imputacion * (dias_vacios / 365)
      : 0;

    // Manteniamo le perdite (non azzeriamo il rendimento negativo)
    const base_imponible_total = rendimiento_neto + Math.max(0, imputacion_renta);

    // La tassazione si applica solo su base >= 0
    const base_gravable = Math.max(0, base_imponible_total);

    const tramos_aut = tramosAutonomicos[states.comunidad_autonoma] || tramosAutonomicos['default'];
    const cuota_estatal = calculateTramos(base_gravable, tramosEstatal);
    const cuota_autonomica = calculateTramos(base_gravable, tramos_aut);
    const cuota_irpf_a_pagar = cuota_estatal + cuota_autonomica;

    return { rendimiento_neto, imputacion_renta, base_imponible_total, cuota_irpf_a_pagar };
  }, [states]);

  const chartData = [
    {
      name: 'Base Imponible',
      'Rendimiento Neto': Math.max(0, calculatedOutputs.rendimiento_neto),
      'Imputación Renta': Math.max(0, calculatedOutputs.imputacion_renta),
    },
  ];

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calcolatoreRef.current) return;
      const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${calculatorData.slug}.pdf`);
    } catch (_e) {
      alert("Error al generar el PDF.");
    }
  }, []);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug: calculatorData.slug, title: calculatorData.title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const prevResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...prevResults].slice(0, 10)));
      alert("Resultado guardado correctamente.");
    } catch {
      alert("No se pudo guardar el resultado.");
    }
  }, [states, calculatedOutputs]);

  const formatCurrency = (value: number) =>
    isFinite(value) ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value) : '—';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        {/* Colonna Sinistra: Calcolatore */}
        <div className="lg:col-span-2">
          <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{calculatorData.title}</h1>
            <p className="text-gray-600 mb-6">{calculatorData.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculatorData.inputs.map((input: InputField) => {
                const inputLabel = (
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                  </label>
                );

                if (input.type === 'boolean') {
                  return (
                    <div key={input.id} className="md:col-span-1 lg:col-span-3 flex items-center gap-3 p-2 rounded-md bg-gray-50 border mt-2">
                      <input
                        id={input.id}
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={!!states[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.checked)}
                      />
                      <label className="text-sm font-medium text-gray-800" htmlFor={input.id}>{input.label}</label>
                    </div>
                  );
                }

                if (input.type === 'select') {
                  return (
                    <div key={input.id} className="lg:col-span-3">
                      {inputLabel}
                      <select
                        id={input.id}
                        value={states[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      >
                        {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={input.id}>
                    {inputLabel}
                    <div className="relative">
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pr-12"
                        type="number"
                        min={input.min}
                        max={input.max}
                        step={input.step}
                        value={states[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      {input.unit && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500">
                          {input.unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados Estimados</h2>
            <div className="space-y-4">
              {calculatorData.outputs.map((output: OutputField) => (
                <div
                  key={output.id}
                  className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'cuota_irpf_a_pagar' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}
                >
                  <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                  <div className={`text-xl md:text-2xl font-bold ${output.id === 'cuota_irpf_a_pagar' ? 'text-indigo-600' : 'text-gray-800'}`}>
                    <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Composición de la Base Imponible</h3>
              <div className="h-64 w-full p-2">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `${formatCurrency(Number(v))}`} />
                      <ChartTooltip formatter={(v: any) => formatCurrency(Number(v))} />
                      <Bar dataKey="Rendimiento Neto" stackId="a" fill="#4f46e5" />
                      <Bar dataKey="Imputación Renta" stackId="a" fill="#a5b4fc" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-sm text-gray-500">Cargando gráfico…</div>
                )}
              </div>
            </div>

            {isClient && calculatedOutputs.rendimiento_neto < 0 && (
              <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                Nota: el rendimiento neto es negativo. Las pérdidas de capital inmobiliario pueden compensarse con otros rendimientos del mismo tipo en el año (con límites) y en los 4 años siguientes.
              </p>
            )}
          </div>
        </div>

        {/* Colonna Destra: Utility e Contenuto */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={saveResult}
                className="w-full bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar Resultado
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar a PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full border border-red-300 text-red-700 rounded-md px-4 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/c03-rendimientos-capital-inmobiliario.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria: Rendimientos del capital inmobiliario</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ley 35/2006, de 28 de noviembre, del IRPF</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfAlquilerTuristico;
