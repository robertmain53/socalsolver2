'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// ---------- Dynamic Chart (client-only) ----------
const ChartLoading = () => (
  <div className="flex items-center justify-center h-full text-gray-500">Cargando gráfico...</div>
);

const DynamicBarChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const {
        BarChart,
        Bar,
        XAxis,
        YAxis,
        Tooltip: ChartTooltip,
        ResponsiveContainer,
        Cell,
        LabelList,
      } = mod as any;

      const CurrencyFmt = (v: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

      const ChartComponent = ({ data }: { data: Array<{ name: string; value: number; fill: string }> }) => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 20, bottom: 8 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={160} />
            <ChartTooltip formatter={(v: unknown) => CurrencyFmt(Number(v) || 0)} cursor={{ fill: 'rgba(239,246,255,0.5)' }} />
            <Bar dataKey="value">
              <LabelList
                dataKey="value"
                position="right"
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  const labelX = (x ?? 0) + (width ?? 0) + 6;
                  const labelY = (y ?? 0) + (height ?? 0) / 2 + 4;
                  return (
                    <text x={labelX} y={labelY} fontSize={12} fill="#374151">
                      {CurrencyFmt(Number(value) || 0)}
                    </text>
                  );
                }}
              />
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

      return ChartComponent;
    }),
  { ssr: false, loading: () => <ChartLoading /> }
);

// ---------- Icons / Tooltip ----------
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
    className="text-gray-400 hover:text-gray-600"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative inline-flex items-center group">
    {children}
    <div
      role="tooltip"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
    >
      {text}
    </div>
  </div>
);

// ---------- SEO Schema ----------
const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// ---------- Markdown Renderer (basic, safe) ----------
const MarkdownRenderer = ({ content }: { content: string }) => {
  const fmt = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, i) => {
        const b = block.trim();
        if (!b) return null;
        if (b.startsWith('###')) {
          return (
            <h3
              key={i}
              className="text-xl font-bold mt-6 mb-3"
              dangerouslySetInnerHTML={{ __html: fmt(b.replace(/###\s?/, '')) }}
            />
          );
        }
        if (/^\d\.\s/.test(b)) {
          const items = b.split('\n').map((l) => l.replace(/^\d\.\s*/, ''));
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1 mb-3">
              {items.map((it, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: fmt(it) }} />
              ))}
            </ol>
          );
        }
        if (b.startsWith('*')) {
          const items = b.split('\n').map((l) => l.replace(/^\*\s*/, ''));
          return (
            <ul key={i} className="list-disc pl-5 space-y-1 mb-3">
              {items.map((it, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: fmt(it) }} />
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mb-3" dangerouslySetInnerHTML={{ __html: fmt(b) }} />
        );
      })}
    </div>
  );
};

// ---------- Embedded config (self-contained) ----------
const calculatorData = {
  slug: "calculadora-irpf-artistas-deportistas",
  category: "Impuestos y trabajo autonomo",
  title: "Calculadora de IRPF para artistas y deportistas",
  lang: "es",
  inputs: [
    {
      id: "ingresosBrutos",
      label: "Ingresos brutos anuales",
      type: "number" as const,
      unit: "€",
      min: 0,
      step: 1000,
      tooltip:
        "Total facturado en el año natural por actuaciones, partidos, conciertos o exhibiciones, antes de impuestos."
    },
    {
      id: "gastosDeducibles",
      label: "Gastos deducibles anuales",
      type: "number" as const,
      unit: "€",
      min: 0,
      step: 500,
      tooltip:
        "Costes necesarios: viajes, dietas, material, agentes, entrenadores, vestuario, seguros, alquiler de salas, etc."
    },
    {
      id: "retencionesPracticadas",
      label: "Retenciones ya aplicadas en facturas",
      type: "number" as const,
      unit: "€",
      min: 0,
      step: 500,
      tooltip:
        "Suma de IRPF ya retenido por promotores, clubes o empresas en tus facturas."
    },
    {
      id: "tipoRetencion",
      label: "Tipo de retención aplicado",
      type: "select" as const,
      options: [
        { value: "15", label: "15% - Tipo general (residentes)" },
        { value: "7", label: "7% - Reducida (inicio actividad)" },
        { value: "24", label: "24% - No residentes (simplificado)" }
      ],
      tooltip: "Selecciona el porcentaje que sueles aplicar según tu situación."
    }
  ],
  outputs: [
    { id: "rendimientoNeto", label: "Rendimiento neto", unit: "€" },
    { id: "baseImponible", label: "Base imponible tras mínimo personal", unit: "€" },
    { id: "cuotaIntegra", label: "Cuota íntegra estimada", unit: "€" },
    { id: "resultadoDeclaracion", label: "Resultado final de la declaración", unit: "€" }
  ],
  formulaSteps: [
    "Rendimiento neto previo = Ingresos brutos - Gastos deducibles",
    "Gastos de difícil justificación = 7% del rendimiento neto previo, con tope 2.000 €",
    "Rendimiento neto = Rendimiento neto previo - gastos de difícil justificación (mínimo 0)",
    "Base imponible = max(0, Rendimiento neto - mínimo personal 5.550 €)",
    "Tramos IRPF: 19% hasta 12.450 €, 24% hasta 20.200 €, 30% hasta 35.200 €, 37% hasta 60.000 €, 45% hasta 300.000 €, 47% en adelante",
    "Cuota íntegra = suma por tramos",
    "Resultado final = Cuota íntegra - Retenciones practicadas"
  ],
  examples: [
    {
      title: "Artista en su primer año (retención 7%)",
      inputs: {
        ingresosBrutos: 25000,
        gastosDeducibles: 6000,
        retencionesPracticadas: 1750,
        tipoRetencion: "7"
      },
      outputs: {
        rendimientoNeto: 17175,
        baseImponible: 11625,
        cuotaIntegra: 2208.75,
        resultadoDeclaracion: 458.75
      },
      description:
        "Cantante novel, aplica retención reducida del 7% durante el año de inicio y los dos siguientes."
    },
    {
      title: "Deportista profesional (retención 15%)",
      inputs: {
        ingresosBrutos: 120000,
        gastosDeducibles: 30000,
        retencionesPracticadas: 18000,
        tipoRetencion: "15"
      },
      outputs: {
        rendimientoNeto: 83700,
        baseImponible: 78150,
        cuotaIntegra: 25409,
        resultadoDeclaracion: 7409
      },
      description:
        "Futbolista residente en España, retención estándar del 15%."
    }
  ],
  tags:
    "IRPF artistas, IRPF deportistas, retenciones artistas, fiscalidad deporte, calculadora IRPF España, autónomos cultura, tributación músicos actores deportistas",
  content: `### Introducción

Esta calculadora está pensada para **artistas y deportistas autónomos en España**, con casuísticas frecuentes: contratos con promotores/clubes, actuaciones internacionales, gastos elevados y retenciones variables. Te ayuda a **estimar tu IRPF anual** y el **resultado final** (a pagar o a devolver) para planificar tu liquidez.

### Guía al Uso del Calcolatore

* **Ingresos brutos anuales**: Todo lo facturado durante el año natural, antes de impuestos.
* **Gastos deducibles**: Costes necesarios y vinculados a la actividad (viajes, dietas, material, seguros, agentes, entrenadores, alquiler de salas, vestuario de escena, etc.).
* **Retenciones ya aplicadas**: Suma de las retenciones practicadas por tus pagadores.
* **Tipo de retención aplicado**: 15% general, 7% (inicio actividad) o 24% (no residentes) — selección informativa para el usuario.

### Metodología de Calcolo Spiegata

1. **Rendimiento neto**: ingresos menos gastos, y se restan los **gastos de difícil justificación (7%, tope 2.000 €)**.
2. **Mínimo personal**: se deducen **5.550 €** para obtener la base imponible.
3. **Tramos progresivos**: se aplican los tipos por tramos vigentes para estimar la **cuota íntegra**.
4. **Resultado final**: se restan las **retenciones practicadas** a lo largo del año.

### Analisi Approfondita: Particularidades de artistas y deportistas

- **Retenciones**: Habitualmente el 15% (residentes), con opción de **7%** para inicio de actividad y **24%** para no residentes (simplificado).
- **Gastos deducibles amplios**: Desplazamientos internacionales, dietas, material técnico/deportivo, honorarios de agentes/representantes, seguros médicos ligados al rendimiento.
- **Rentas exentas**: Ayudas a **deportistas de alto nivel** (art. 7 LIRPF) con límites específicos.
- **Ingresos internacionales**: Revisar **convenios de doble imposición**; si eres residente en España, tributas por renta mundial con posibles deducciones/bonificaciones.

### Domande Frequenti (FAQ)

1. **¿Puedo aplicar el 7% de retención si empiezo la actividad?** Sí, durante el año de inicio y los dos siguientes, si cumples requisitos.
2. **¿Qué gastos son más habituales en deporte profesional?** Viajes, entrenadores, fisioterapia, material, seguros, nutrición, alquiler de instalaciones.
3. **¿Cómo tributan ingresos por actuaciones fuera de España?** Depende de tu **residencia fiscal** y de los **convenios**; a menudo se declara en España con deducción por doble imposición.`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Puedo aplicar el 7% de retención si empiezo la actividad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, durante el año de inicio y los dos siguientes, si cumples requisitos."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué gastos son más habituales en deporte profesional?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Viajes, entrenadores, fisioterapia, material, seguros, nutrición, alquiler de instalaciones."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo tributan ingresos por actuaciones fuera de España?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Depende de tu residencia fiscal y de los convenios; a menudo se declara en España con deducción por doble imposición."
        }
      }
    ]
  }
} as const;

// ---------- Helpers ----------
const toNumber = (v: unknown) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

const formatEUR = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

// ---------- Component ----------
const CalculadoraIrpfArtistasDeportistas: React.FC = () => {
  const { slug, title, inputs, outputs, content, examples, seoSchema } = calculatorData;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const initialStates: Record<string, number | string | ''> = {
    ingresosBrutos: 40000,
    gastosDeducibles: 8000,
    retencionesPracticadas: 6000,
    tipoRetencion: '15'
  };

  const [states, setStates] = useState<Record<string, number | string | ''>>(initialStates);

  const handleChange = (id: string, value: string) => {
    if (id === 'tipoRetencion') return setStates((p) => ({ ...p, [id]: value }));
    setStates((p) => ({ ...p, [id]: value === '' ? '' : toNumber(value) }));
  };

  const handleReset = () => setStates(initialStates);

  const loadExample = (exInputs: Record<string, number | string>) => setStates(exInputs);

  const calculated = useMemo(() => {
    const ingresos = Math.max(0, toNumber(states.ingresosBrutos));
    const gastos = Math.max(0, toNumber(states.gastosDeducibles));
    const retPract = Math.max(0, toNumber(states.retencionesPracticadas));

    const netoPrev = Math.max(0, ingresos - gastos);
    const diffJust = Math.min(2000, netoPrev * 0.07);
    const rendimientoNeto = Math.max(0, netoPrev - diffJust);

    const minimoPersonal = 5550;
    const baseImponible = Math.max(0, rendimientoNeto - minimoPersonal);

    const tramos = [
      { limite: 12450, tipo: 0.19 },
      { limite: 20200, tipo: 0.24 },
      { limite: 35200, tipo: 0.3 },
      { limite: 60000, tipo: 0.37 },
      { limite: 300000, tipo: 0.45 },
      { limite: Infinity, tipo: 0.47 }
    ];

    let cuotaIntegra = 0;
    let resto = baseImponible;
    let prev = 0;
    for (const t of tramos) {
      if (resto <= 0) break;
      const baseTramo = Math.min(resto, t.limite - prev);
      cuotaIntegra += baseTramo * t.tipo;
      resto -= baseTramo;
      prev = t.limite;
    }

    const resultadoDeclaracion = cuotaIntegra - retPract;

    return { rendimientoNeto, baseImponible, cuotaIntegra, resultadoDeclaracion };
  }, [states]);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculated, ts: Date.now() };
      const existing = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...existing].slice(0, 50)));
      alert('Resultado guardado correctamente.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [slug, title, states, calculated]);

  const exportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!containerRef.current) return;
      const canvas = await html2canvas(containerRef.current, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('Error al exportar a PDF en este navegador.');
    }
  }, [slug]);

  const chartData = [
    { name: 'Ingresos brutos', value: toNumber(states.ingresosBrutos), fill: '#4ade80' },
    { name: 'Rendimiento neto', value: calculated.rendimientoNeto, fill: '#38bdf8' },
    { name: 'Cuota IRPF', value: calculated.cuotaIntegra, fill: '#f87171' },
    { name: 'Resultado final', value: calculated.resultadoDeclaracion, fill: '#a78bfa' }
  ];

  return (
    <>
      <SeoSchema schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={containerRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-6">
                Estima tu IRPF anual como artista o deportista y anticipa tu resultado (a pagar / a devolver).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inputs.map((input) => (
                  <div key={input.id}>
                    <label
                      htmlFor={input.id}
                      className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                    >
                      {input.label}
                      {'tooltip' in input && (input as any).tooltip ? (
                        <Tooltip text={(input as any).tooltip as string}>
                          <span className="ml-1.5">
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      ) : null}
                    </label>

                    {input.type === 'select' ? (
                      <select
                        id={input.id}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        value={(states[input.id] as string) || ''}
                        onChange={(e) => handleChange(input.id, e.target.value)}
                      >
                        {(input as any).options.map((opt: any) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          id={input.id}
                          inputMode="decimal"
                          type="number"
                          min={(input as any).min}
                          step={(input as any).step}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2"
                          value={states[input.id] as number | string}
                          onChange={(e) => handleChange(input.id, e.target.value)}
                          aria-label={input.label}
                        />
                        {'unit' in input && (input as any).unit ? (
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">
                            {(input as any).unit}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados de la simulación</h2>
              <div className="space-y-3">
                {outputs.map((o) => (
                  <div
                    key={o.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                      o.id === 'resultadoDeclaracion' ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-300'
                    }`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{o.label}</span>
                    <span
                      className={`text-xl md:text-2xl font-bold ${
                        o.id === 'resultadoDeclaracion' ? 'text-indigo-600' : 'text-gray-800'
                      }`}
                    >
                      {isClient ? formatEUR((calculated as any)[o.id]) : '…'}
                    </span>
                  </div>
                ))}
                <div className="text-center pt-2">
                  {isClient && (
                    <p
                      className={`text-sm ${
                        calculated.resultadoDeclaracion > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {calculated.resultadoDeclaracion > 0
                        ? `A PAGAR: ${formatEUR(calculated.resultadoDeclaracion)}.`
                        : `A DEVOLVER: ${formatEUR(Math.abs(calculated.resultadoDeclaracion))}.`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose visual</h3>
              <div className="h-80 w-full bg-slate-50 p-4 rounded-lg">
                {isClient ? <DynamicBarChart data={chartData} /> : <ChartLoading />}
              </div>
            </div>
          </div>

          <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-700">Fórmula / Pasos utilizados</h3>
            <ul className="mt-2 text-xs text-gray-600 list-disc pl-5">
              {calculatorData.formulaSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={saveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button
                onClick={exportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Cargar ejemplos</h2>
            <div className="space-y-3">
              {calculatorData.examples.map((ex) => (
                <div key={ex.title} className="p-3 border rounded-md hover:bg-gray-50">
                  <h4 className="font-semibold text-sm">{ex.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{ex.description}</p>
                  <button
                    onClick={() => loadExample(ex.inputs as any)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-2"
                  >
                    Cargar este caso
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y consejos</h2>
            <MarkdownRenderer content={calculatorData.content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >Manual práctico IRPF 2024 – Agencia Tributaria</a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >Ley 35/2006 del IRPF (BOE)</a>
              </li>
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/ayuda-garantias-tributarias/rentas-exentas-articulo-7-ley-irpf/ayudas-deportistas-alto-nivel-limite-euros.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >Ayudas a deportistas de alto nivel – rentas exentas (art. 7 LIRPF)</a>
              </li>

              {/* Competitor landscape (para E-E-A-T comparativo) */}
              <li><a href="https://esmonday.com/calculadora-artistas" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Esmonday – calculadora artistas</a></li>
              <li><a href="https://gotanart.com/retencion-irpf-artistas-2023/" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Gotanart – retención artistas</a></li>
              <li><a href="https://asesorexcelente.com/rentas-artistas-deportistas-no-residentes/" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Asesor Excelente – no residentes</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfArtistasDeportistas;
