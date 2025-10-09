'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

export const meta = {
  title: 'Calculadora de IRPF para consultores de marketing autónomos',
  description:
    'Estima tu IRPF anual como consultor de marketing freelance en España. Incluye gastos deducibles específicos del sector (software, publicidad, etc.) para 2025.',
};

/* =========================
   Tipi
========================= */

type NumberInput = {
  id:
    | 'ingresos_anuales_brutos'
    | 'cuotas_seguridad_social'
    | 'gastos_software_herramientas'
    | 'gastos_publicidad'
    | 'otros_gastos_deducibles';
  label: string;
  type: 'number';
  unit: '€';
  min: number;
  step: number;
  tooltip: string;
};

type OutputDef = {
  id: 'rendimiento_neto' | 'base_liquidable' | 'irpf_a_pagar_anual' | 'tipo_efectivo';
  label: string;
  unit: '€' | '%';
};

type CalculatorData = {
  slug: string;
  category: string;
  title: string;
  lang: string;
  tags: string;
  inputs: NumberInput[];
  outputs: OutputDef[];
  formulaSteps: unknown;
  examples: unknown;
  content: string;
  seoSchema: Record<string, unknown>;
};

type ChartPoint = {
  name: string;
  'Beneficio Neto': number;
  'Gastos Totales': number;
  'Impuestos (IRPF)': number;
};

type Calculated = {
  gastos_totales: number;
  rendimiento_neto: number;
  base_liquidable: number;
  irpf_a_pagar_anual: number;
  tipo_efectivo: number;
};

/* =========================
   Dynamic import Recharts
========================= */

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
        Legend,
      } = mod;

      const ChartComponent: React.FC<{ data: ChartPoint[] }> = ({ data }) => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(value: number) => `${value / 1000}k`}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                  value,
                ),
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Beneficio Neto" stackId="a" fill="#4f46e5" name="Beneficio Neto" />
            <Bar dataKey="Gastos Totales" stackId="a" fill="#fbbf24" name="Gastos Totales" />
            <Bar dataKey="Impuestos (IRPF)" stackId="a" fill="#ef4444" name="Impuestos (IRPF)" />
          </BarChart>
        </ResponsiveContainer>
      );

      return ChartComponent;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-gray-50 text-sm text-gray-500">
        Cargando gráfico...
      </div>
    ),
  },
);

/* =========================
   UI helpers
========================= */

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
    className="text-gray-400"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="text-sm bg-gray-100 p-1 rounded">$1</code>');

  const blocks = content.split('\n\n');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### ')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{
                __html: processInlineFormatting(trimmedBlock.replace('### ', '')),
              }}
            />
          );
        }
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n').map((item) => item.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ul>
          );
        }
        if (/^\d\.\s/.test(trimmedBlock)) {
          const items = trimmedBlock.split('\n').map((item) => item.replace(/^\d\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ol>
          );
        }
        if (trimmedBlock) {
          return (
            <p
              key={index}
              className="mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

/* =========================
   Config tipizzata
========================= */

const calculatorData: CalculatorData = JSON.parse(
  '{"slug":"calculadora-irpf-consultores-marketing","category":"Impuestos y trabajo autonomo","title":"Calculadora de IRPF para consultores de marketing autónomos","lang":"es","tags":"calculadora irpf, autonomos, consultor marketing, freelance, impuestos españa, declaracion renta, modelo 130, gastos deducibles marketing, irpf 2025","inputs":[{"id":"ingresos_anuales_brutos","label":"Ingresos Anuales Brutos (sin IVA)","type":"number","unit":"€","min":0,"step":1000,"tooltip":"Suma todas las facturas emitidas en un año, excluyendo el IVA. Esta es tu facturación total."},{"id":"cuotas_seguridad_social","label":"Cuotas Anuales de Seguridad Social","type":"number","unit":"€","min":0,"step":100,"tooltip":"La suma de todas las cuotas de autónomo que has pagado durante el año. Es uno de los gastos deducibles más importantes."},{"id":"gastos_software_herramientas","label":"Gastos Anuales en Software y Herramientas","type":"number","unit":"€","min":0,"step":50,"tooltip":"Incluye suscripciones a herramientas de SEO (Ahrefs, SEMrush), CRM, software de diseño (Adobe), hosting, dominios, etc."},{"id":"gastos_publicidad","label":"Inversión Anual en Publicidad","type":"number","unit":"€","min":0,"step":100,"tooltip":"Suma todo lo invertido en plataformas como Google Ads, Meta Ads, LinkedIn Ads, etc., para promocionar tu propio negocio."},{"id":"otros_gastos_deducibles","label":"Otros Gastos Anuales Deducibles","type":"number","unit":"€","min":0,"step":100,"tooltip":"Aquí puedes incluir gastos de gestoría, material de oficina, teléfono, internet (la parte proporcional), servicios de otros profesionales, etc."}],"outputs":[{"id":"rendimiento_neto","label":"Beneficio Neto Anual (Rendimiento Neto)","unit":"€"},{"id":"base_liquidable","label":"Base Liquidable del Impuesto","unit":"€"},{"id":"irpf_a_pagar_anual","label":"Total IRPF a Pagar en la Renta","unit":"€"},{"id":"tipo_efectivo","label":"Tipo Efectivo sobre Ingresos","unit":"%"}],"formulaSteps":["..."],"examples":[{},{}],"content":"### ¿Cómo calculamos tu IRPF?\\n\\n1. **Rendimiento neto previo** = Ingresos brutos - *gastos deducibles declarados*.\\n2. **Gastos de difícil justificación** (DJ): 7% del rendimiento neto previo con **límite 2.000 €** (si tributas en *estimación directa simplificada*).\\n3. **Rendimiento neto** = Rendimiento neto previo - DJ.\\n4. **Base liquidable** = max(0, Rendimiento neto - *mínimo personal* de 5.550 €).\\n5. **IRPF** mediante tramos estatales+autonómicos estándar (aproximación).\\n\\n*Nota:* Esta es una simulación general. Ajusta con tu asesor según tus circunstancias y normativa autonómica vigente.","seoSchema":{}}',
);

/* =========================
   Component
========================= */

const CalculadoraIrpfConsultoresMarketing: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const initialStates: Record<NumberInput['id'], number> = {
    ingresos_anuales_brutos: 55_000,
    cuotas_seguridad_social: 3_840,
    gastos_software_herramientas: 2_500,
    gastos_publicidad: 5_000,
    otros_gastos_deducibles: 2_000,
  };

  const [states, setStates] = useState<Record<NumberInput['id'], number | ''>>(initialStates);

  const handleStateChange = (id: NumberInput['id'], value: string) => {
    if (value === '') return setStates((p) => ({ ...p, [id]: '' }));
    const n = Number(value);
    setStates((p) => ({ ...p, [id]: Number.isFinite(n) ? n : p[id] }));
  };

  const handleReset = () => setStates(initialStates);

  const calculated: Calculated = useMemo(() => {
    const ingresos_anuales_brutos = Number(states.ingresos_anuales_brutos || 0);
    const cuotas_seguridad_social = Number(states.cuotas_seguridad_social || 0);
    const gastos_software_herramientas = Number(states.gastos_software_herramientas || 0);
    const gastos_publicidad = Number(states.gastos_publicidad || 0);
    const otros_gastos_deducibles = Number(states.otros_gastos_deducibles || 0);

    const gastos_totales =
      cuotas_seguridad_social +
      gastos_software_herramientas +
      gastos_publicidad +
      otros_gastos_deducibles;

    const rendimiento_neto_previo = ingresos_anuales_brutos - gastos_totales;

    // DJ: 7% del rendimiento neto previo (>=0), tope 2.000 €
    const gastos_dificil_justificacion = Math.min(
      Math.max(0, rendimiento_neto_previo) * 0.07,
      2000,
    );

    const rendimiento_neto = rendimiento_neto_previo - gastos_dificil_justificacion;

    const minimo_personal = 5550;
    const base_liquidable = Math.max(0, rendimiento_neto - minimo_personal);

    const tramos = [
      { limite: 12_450, tipo: 0.19 },
      { limite: 20_200, tipo: 0.24 },
      { limite: 35_200, tipo: 0.3 },
      { limite: 60_000, tipo: 0.37 },
      { limite: 300_000, tipo: 0.45 },
      { limite: Infinity, tipo: 0.47 },
    ];

    let irpf_a_pagar_anual = 0;
    let base_restante = base_liquidable;
    let limite_anterior = 0;

    for (const tramo of tramos) {
      if (base_restante <= 0) break;
      const base_en_tramo = Math.min(base_restante, tramo.limite - limite_anterior);
      irpf_a_pagar_anual += base_en_tramo * tramo.tipo;
      base_restante -= base_en_tramo;
      limite_anterior = tramo.limite;
    }

    const tipo_efectivo =
      ingresos_anuales_brutos > 0 ? (irpf_a_pagar_anual / ingresos_anuales_brutos) * 100 : 0;

    return {
      gastos_totales,
      rendimiento_neto,
      base_liquidable,
      irpf_a_pagar_anual,
      tipo_efectivo,
    };
  }, [states]);

  const chartData: ChartPoint[] = useMemo(
    () => [
      {
        name: 'Distribución de Ingresos',
        'Beneficio Neto': Math.max(0, calculated.rendimiento_neto - calculated.irpf_a_pagar_anual),
        'Gastos Totales': Math.max(0, calculated.gastos_totales),
        'Impuestos (IRPF)': Math.max(0, calculated.irpf_a_pagar_anual),
      },
    ],
    [calculated],
  );

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const el = calcolatoreRef.current;
      if (!el) return;

      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('La función PDF no está disponible.');
    }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const { gastos_totales, ...outputsToSave } = calculated;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const prevResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...prevResults].slice(0, 50)));
      alert('¡Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculated, slug, title]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <>
      <FaqSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-0 lg:p-6" ref={calcolatoreRef}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">{meta.description}</p>
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Aviso:</strong> Esta es una simulación. El cálculo final puede variar según tus
                circunstancias personales y deducciones autonómicas. No sustituye el consejo de un asesor
                fiscal profesional.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input: NumberInput) => (
                  <div key={input.id}>
                    <label
                      className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                      htmlFor={input.id}
                    >
                      {input.label}
                      <Tooltip text={input.tooltip}>
                        <span className="ml-2 cursor-help">
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        type="number"
                        inputMode="decimal"
                        min={input.min}
                        step={input.step}
                        value={states[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                      />
                      <span className="text-sm text-gray-500">{input.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Resultados de la Simulación Anual
                </h2>
                {outputs.map((output: OutputDef) => {
                  const v =
                    output.id === 'tipo_efectivo'
                      ? formatPercent(calculated.tipo_efectivo)
                      : output.id === 'base_liquidable'
                      ? formatCurrency(calculated.base_liquidable)
                      : output.id === 'irpf_a_pagar_anual'
                      ? formatCurrency(calculated.irpf_a_pagar_anual)
                      : formatCurrency(calculated.rendimiento_neto);

                  return (
                    <div
                      key={output.id}
                      className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                        output.id === 'irpf_a_pagar_anual'
                          ? 'bg-indigo-50 border-indigo-500'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="text-sm md:text-base font-medium text-gray-700">
                        {output.label}
                      </div>
                      <div
                        className={`text-xl md:text-2xl font-bold ${
                          output.id === 'irpf_a_pagar_anual' ? 'text-indigo-600' : 'text-gray-800'
                        }`}
                      >
                        <span>{isClient ? v : '...'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Distribución de tus Ingresos
                </h3>
                <div className="h-64 w-full p-2 rounded-lg bg-white border">
                  {isClient && <DynamicBarChart data={chartData} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={salvaRisultato}
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía para Entender el Cálculo</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/capitulo-2-esquema-general-liquidacion-irpf/esquema-liquidacion.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Esquema Liquidación IRPF
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
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

export default CalculadoraIrpfConsultoresMarketing;
