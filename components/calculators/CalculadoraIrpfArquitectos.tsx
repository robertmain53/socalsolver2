'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* =========================
   Types
========================= */
type NumberInputSpec = {
  id: string;
  label: string;
  type: 'number';
  unit: string;
  min: number;
  step: number;
  tooltip: string;
};
type OutputSpec = { id: string; label: string; unit: '€' | '%'; };

type CalculatorData = {
  slug: string;
  category: string;
  title: string;
  lang: string;
  inputs: NumberInputSpec[];
  outputs: OutputSpec[];
  content: string;
  seoSchema: Record<string, unknown>;
};

/* =========================
   Loading placeholder
========================= */
const ChartLoader = () => (
  <div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-sm text-gray-500">
    Cargando gráfico...
  </div>
);

/* =========================
   Safe dynamic chart wrapper
   (we return our own component)
========================= */
const DynamicPieChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { PieChart, Pie, Cell, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;

      const PieWrapper: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
        const COLORS = ['#4ade80', '#facc15', '#ef4444']; // neto, gastos, IRPF

        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
              >
                {data.map((_, i) => (
                  <Cell key={i} />
                ))}
              </Pie>
              <ChartTooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
                }
              />
              <Legend />
              {/* Apply colors via style attribute on <g> cells to avoid SSR type hiccups */}
              <style>{COLORS.map((c, i) => `.recharts-pie-sector:nth-of-type(${i + 1}){fill:${c};}`).join('')}</style>
            </PieChart>
          </ResponsiveContainer>
        );
      };

      return PieWrapper;
    }),
  { ssr: false, loading: () => <ChartLoader /> }
);

/* =========================
   Icons & Tooltip
========================= */
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16" height="16"
    viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

/* =========================
   SEO Schema
========================= */
const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

/* =========================
   Lightweight Markdown renderer
========================= */
const ContentRenderer = ({ content }: { content: string }) => {
  const fmt = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');

  const isOLBlock = (t: string) => /^\d+\.\s/m.test(t.trimStart());
  const isULBlock = (t: string) => /^\*\s/m.test(t.trimStart());

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, i) => {
        const b = block.trim();
        if (!b) return null;

        if (b.startsWith('### ')) {
          return (
            <h3
              key={i}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: fmt(b.replace(/^###\s+/, '')) }}
            />
          );
        }

        if (isULBlock(b)) {
          const items = b.split('\n').filter(Boolean).map((line) => line.replace(/^\*\s+/, ''));
          return (
            <ul key={i} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: fmt(item) }} />
              ))}
            </ul>
          );
        }

        if (isOLBlock(b)) {
          const items = b.split('\n').filter(Boolean).map((line) => line.replace(/^\d+\.\s+/, ''));
          return (
            <ol key={i} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: fmt(item) }} />
              ))}
            </ol>
          );
        }

        return (
          <p key={i} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: fmt(b) }} />
        );
      })}
    </div>
  );
};

/* =========================
   Embedded calculator content (same as your draft)
========================= */
const calculatorData: CalculatorData = {
  slug: "calculadora-irpf-arquitectos",
  category: "Impuestos y trabajo autónomo",
  title: "Calculadora de IRPF para arquitectos y aparejadores autónomos",
  lang: "es",
  inputs: [
    { id: "ingresos_anuales_brutos", label: "Ingresos Anuales Brutos", type: "number", unit: "€", min: 0, step: 1000, tooltip: "Suma total de todas las facturas emitidas en el año fiscal, sin descontar gastos y sin incluir el IVA." },
    { id: "cuota_autonomos_anual", label: "Cuota de Autónomos Anual", type: "number", unit: "€", min: 0, step: 100, tooltip: "El total de las cuotas mensuales pagadas a la Seguridad Social durante el año. Es un gasto 100% deducible." },
    { id: "gastos_colegio_profesional", label: "Cuotas del Colegio Profesional", type: "number", unit: "€", min: 0, step: 10, tooltip: "Cuotas anuales pagadas al Colegio de Arquitectos o Aparejadores. Deducibles con un límite de 500€/año." },
    { id: "gastos_seguro_rc", label: "Seguro de Responsabilidad Civil", type: "number", unit: "€", min: 0, step: 10, tooltip: "Coste anual de la póliza de seguro de RC profesional, un gasto esencial y totalmente deducible para tu actividad." },
    { id: "gastos_software_licencias", label: "Software y Licencias (Anual)", type: "number", unit: "€", min: 0, step: 50, tooltip: "Coste anual de suscripciones a software como AutoCAD, Revit, CYPE, Adobe Creative Cloud, etc., necesarios para tu trabajo." },
    { id: "otros_gastos_deducibles", label: "Otros Gastos Deducibles", type: "number", unit: "€", min: 0, step: 100, tooltip: "Incluye aquí otros gastos directamente relacionados con tu actividad: material de oficina, marketing, teléfono, servicios de gestoría, etc." }
  ],
  outputs: [
    { id: "rendimiento_neto", label: "Rendimiento Neto (Beneficio Real)", unit: "€" },
    { id: "base_liquidable_general", label: "Base Liquidable (Importe sujeto a IRPF)", unit: "€" },
    { id: "total_irpf_a_pagar", label: "Total IRPF Anual a Pagar", unit: "€" },
    { id: "tipo_efectivo_medio", label: "Tipo Efectivo Medio", unit: "%" },
    { id: "ingresos_netos_despues_irpf", label: "Ingresos Netos Reales (Después de IRPF)", unit: "€" }
  ],
  // content & seoSchema trimmed here for brevity — use your original (they're rendered below)
  content: `### Introducción: Tu IRPF, optimizado para tu profesión

Como arquitecto o aparejador autónomo... (usa el texto completo de tu versión)`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Cómo se aplica la retención del 15% en mis facturas?", "acceptedAnswer": { "@type": "Answer", "text": "..." } },
      { "@type": "Question", "name": "¿Puedo deducir el IVA de mis gastos?", "acceptedAnswer": { "@type": "Answer", "text": "..." } },
      { "@type": "Question", "name": "¿Qué es el régimen de Estimación Directa Simplificada?", "acceptedAnswer": { "@type": "Answer", "text": "..." } }
    ]
  }
};

/* =========================
   Component
========================= */
const CalculadoraIrpfArquitectos: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;

  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const initialStates = useMemo(
    () => ({
      ingresos_anuales_brutos: 60000,
      cuota_autonomos_anual: 3864,
      gastos_colegio_profesional: 450,
      gastos_seguro_rc: 500,
      gastos_software_licencias: 1200,
      otros_gastos_deducibles: 2500
    }),
    []
  );
  const [states, setStates] = useState<Record<string, number>>(initialStates);

  const onChangeNumber = (id: string, raw: string) => {
    const v = raw === '' ? NaN : Number(raw);
    setStates((prev) => ({ ...prev, [id]: Number.isFinite(v) ? Math.max(0, v) : 0 }));
  };

  const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

  const calculated = useMemo(() => {
    const {
      ingresos_anuales_brutos = 0,
      cuota_autonomos_anual = 0,
      gastos_colegio_profesional = 0,
      gastos_seguro_rc = 0,
      gastos_software_licencias = 0,
      otros_gastos_deducibles = 0
    } = states;

    // Parámetros
    const MINIMO_PERSONAL = 5550;

    // Tramos (límites inferiores de cada tramo)
    const TRAMOS = [
      { limite: 0, tipo: 0.19 },
      { limite: 12450, tipo: 0.24 },
      { limite: 20200, tipo: 0.30 },
      { limite: 35200, tipo: 0.37 },
      { limite: 60000, tipo: 0.45 },
      { limite: 300000, tipo: 0.47 }
    ];

    // Límite colegial
    const gastosColegioCap = Math.min(gastos_colegio_profesional, 500);

    // Total gastos
    const total_gastos_deducibles =
      cuota_autonomos_anual +
      gastosColegioCap +
      gastos_seguro_rc +
      gastos_software_licencias +
      otros_gastos_deducibles;

    // Rendimiento neto previo
    const rendimiento_neto_previo = ingresos_anuales_brutos - total_gastos_deducibles;

    // Reducción 7% (máx 2.000) — solo si RN previo > 0
    const reduccion_general = rendimiento_neto_previo > 0 ? Math.min(rendimiento_neto_previo * 0.07, 2000) : 0;

    // Rendimiento neto
    const rendimiento_neto = Math.max(0, rendimiento_neto_previo - reduccion_general);

    // Base imponible = rendimiento neto (sin mínimos personales/familiares)
    const base_imponible = rendimiento_neto;

    // Base liquidable (mínimo personal)
    const base_liquidable_general = Math.max(0, base_imponible - MINIMO_PERSONAL);

    // Cálculo progresivo por tramos (usando límites inferiores)
    let cuota_integra = 0;
    let base_restante = base_liquidable_general;

    for (let i = TRAMOS.length - 1; i >= 0; i--) {
      const li = TRAMOS[i].limite;
      if (base_restante > li) {
        const base_en_tramo = base_restante - li;
        cuota_integra += base_en_tramo * TRAMOS[i].tipo;
        base_restante = li;
      }
    }

    const total_irpf_a_pagar = Math.max(0, cuota_integra);

    const ingresos_netos_despues_irpf = Math.max(0, rendimiento_neto - total_irpf_a_pagar);

    const tipo_efectivo_medio =
      base_imponible > 0 ? (total_irpf_a_pagar / base_imponible) * 100 : 0;

    return {
      rendimiento_neto,
      base_liquidable_general,
      total_irpf_a_pagar,
      tipo_efectivo_medio,
      ingresos_netos_despues_irpf,
      total_gastos_deducibles
    };
  }, [states]);

  const chartData = useMemo(
    () =>
      [
        { name: 'Beneficio Neto', value: calculated.ingresos_netos_despues_irpf },
        { name: 'Gastos Deducibles', value: calculated.total_gastos_deducibles },
        { name: 'IRPF a Pagar', value: calculated.total_irpf_a_pagar }
      ].filter((d) => d.value > 0),
    [calculated]
  );

  const exportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${calculatorData.slug}.pdf`);
    } catch {
      alert('Error al generar el PDF.');
    }
  }, []);

  const saveResult = useCallback(() => {
    try {
      const { total_gastos_deducibles, ...outputsToSave } = calculated;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const existing = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...existing].slice(0, 50)));
      alert('Resultado guardado en el almacenamiento local.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [calculated, slug, states, title]);

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);
  const fmtPercent = (v: number) => `${v.toFixed(2).replace('.', ',')}%`;

  return (
    <>
      <SeoSchema schema={calculatorData.seoSchema} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">
              Optimiza tu declaración anual con una simulación precisa y específica para tu profesión.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
              {inputs.map((inp) => (
                <div key={inp.id}>
                  <label
                    htmlFor={inp.id}
                    className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center"
                  >
                    {inp.label}
                    {inp.tooltip && (
                      <Tooltip text={inp.tooltip}>
                        <span className="ml-2 cursor-help">
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id={inp.id}
                      aria-label={inp.label}
                      inputMode="decimal"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                      type="number"
                      min={inp.min}
                      step={inp.step}
                      value={Number.isFinite(states[inp.id]) ? states[inp.id] : ''}
                      onChange={(e) => onChangeNumber(inp.id, e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      {inp.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen Fiscal Anual</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {outputs.map((o) => {
                    const val =
                      o.unit === '€'
                        ? fmtCurrency((calculated as any)[o.id] ?? 0)
                        : fmtPercent((calculated as any)[o.id] ?? 0);

                    const isIRPF = o.id === 'total_irpf_a_pagar';
                    const isNeto = o.id === 'ingresos_netos_despues_irpf';

                    return (
                      <div
                        key={o.id}
                        className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                          isIRPF
                            ? 'bg-red-50 border-red-500'
                            : isNeto
                            ? 'bg-green-50 border-green-500'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="text-sm md:text-base font-medium text-gray-700">{o.label}</div>
                        <div
                          className={`text-lg md:text-xl font-bold ${
                            isIRPF ? 'text-red-600' : isNeto ? 'text-green-600' : 'text-gray-800'
                          }`}
                        >
                          <span>{isClient ? val : '...'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                    Distribución de Ingresos
                  </h3>
                  {isClient ? <DynamicPieChart data={chartData} /> : <ChartLoader />}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={saveResult}
                className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button
                onClick={exportPDF}
                className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full text-sm font-medium border border-red-300 bg-red-50 rounded-md px-3 py-2 text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-6 bg-white shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Guía y Fiscalidad</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-6 bg-white shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/c10-rendimientos-actividades-economicas.html"
                  target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Manual de IRPF
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764"
                  target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline"
                >
                  Ley 35/2006, de 28 de noviembre, del IRPF
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfArquitectos;
