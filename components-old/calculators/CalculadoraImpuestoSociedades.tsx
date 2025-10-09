'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* =========================
   Types & helpers
   ========================= */

type CalculatorInput =
  | {
      id:
        | 'resultado_contable'
        | 'ajustes_positivos'
        | 'ajustes_negativos'
        | 'bases_negativas_anteriores'
        | 'deducciones_bonificaciones'
        | 'pagos_fraccionados'
        | 'cifra_negocios';
      label: string;
      type: 'number';
      unit?: string;
      min?: number;
      max?: number;
      step?: number;
      tooltip: string;
    }
  | {
      id: 'es_nueva_empresa';
      label: string;
      type: 'boolean';
      tooltip: string;
    };

type NumericKey =
  | 'resultado_contable'
  | 'ajustes_positivos'
  | 'ajustes_negativos'
  | 'bases_negativas_anteriores'
  | 'deducciones_bonificaciones'
  | 'pagos_fraccionados'
  | 'cifra_negocios';

type BooleanKey = 'es_nueva_empresa';

type State = Record<NumericKey, number | string> & Record<BooleanKey, boolean>;

const euro = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

const toNum = (v: number | string, fallback = 0): number => {
  if (v === '' || v === null || v === undefined) return fallback;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n: number, min?: number, max?: number) => {
  if (typeof min === 'number' && n < min) return min;
  if (typeof max === 'number' && n > max) return max;
  return n;
};

const isNumericKey = (k: string): k is NumericKey =>
  [
    'resultado_contable',
    'ajustes_positivos',
    'ajustes_negativos',
    'bases_negativas_anteriores',
    'deducciones_bonificaciones',
    'pagos_fraccionados',
    'cifra_negocios',
  ].includes(k);

const isBooleanKey = (k: string): k is BooleanKey => k === 'es_nueva_empresa';

/* =========================
   Config
   ========================= */

const calculatorData = {
  slug: 'calculadora-impuesto-sociedades',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Impuesto de Sociedades (general y reducido)',
  lang: 'es',
  description:
    'Calcula el Impuesto sobre Sociedades (Modelo 200) en España. Herramienta precisa que incluye ajustes, tipos reducidos, y compensación de pérdidas.',
  inputs: [
    {
      id: 'resultado_contable',
      label: 'Resultado Contable (Beneficio antes de Impuestos)',
      type: 'number' as const,
      unit: '€',
      min: -10_000_000,
      step: 1000,
      tooltip: 'Beneficio/pérdida antes del IS.',
    },
    {
      id: 'ajustes_positivos',
      label: 'Ajustes Extracontables Positivos',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip: 'Gastos contables no deducibles (multas, IS, etc.).',
    },
    {
      id: 'ajustes_negativos',
      label: 'Ajustes Extracontables Negativos',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip: 'Ingresos exentos o ya gravados.',
    },
    {
      id: 'bases_negativas_anteriores',
      label: 'Bases Imponibles Negativas de Años Anteriores',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 500,
      tooltip: 'BINs disponibles para compensar.',
    },
    {
      id: 'deducciones_bonificaciones',
      label: 'Deducciones y Bonificaciones',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip: 'Se restan de la cuota (no de la base).',
    },
    {
      id: 'pagos_fraccionados',
      label: 'Pagos Fraccionados Realizados',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip: 'Modelos 202 ingresados a cuenta.',
    },
    {
      id: 'cifra_negocios',
      label: 'Importe Neto de la Cifra de Negocios',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 10_000,
      tooltip: 'Determina límites y tipos.',
    },
    {
      id: 'es_nueva_empresa',
      label: '¿Es una empresa de nueva creación?',
      type: 'boolean' as const,
      tooltip: 'Tipo 15% en el primer período con base positiva y el siguiente.',
    },
  ] satisfies CalculatorInput[],
  outputs: [
    { id: 'base_imponible_previa', label: 'Base Imponible Previa', unit: '€' },
    { id: 'base_imponible', label: 'Base Imponible Final', unit: '€' },
    { id: 'tipo_gravamen_aplicado', label: 'Tipo de Gravamen Aplicado', unit: '%' },
    { id: 'cuota_integra', label: 'Cuota Íntegra', unit: '€' },
    { id: 'cuota_liquida', label: 'Cuota Líquida', unit: '€' },
    { id: 'resultado_declaracion', label: 'Resultado de la Declaración (Modelo 200)', unit: '€' },
  ],
  content: `### Introducción: Domina el Impuesto Clave para tu Empresa

El IS grava los beneficios de las entidades en España. El cálculo parte del resultado contable, aplica **ajustes**, compensa **pérdidas (BINs)** con límites y, finalmente, aplica el **tipo** correspondiente.

### Guía de Uso
- **Resultado Contable**: BAI contable.
- **Ajustes**: Positivos/negativos fiscales.
- **BINs**: Pérdidas a compensar.
- **Deducciones**: Restan de la cuota.
- **Pagos fraccionados**: A cuenta.
- **Cifra de negocios**/**Empresa nueva**: Influyen en tipo y límites.

### Esquema de Cálculo
1) **Base previa**: \`BAI + ajustes (+) – ajustes (–)\`.
2) **Compensación BINs** (si base previa > 0):
   - Límite general por cifra de negocios:
     - < 20M: **70%**; 20–60M: **50%**; ≥ 60M: **25%**.
   - En todo caso, **mínimo compensable 1.000.000 €**.
   - La base no puede quedar negativa por la compensación.
3) **Tipo**: 15% (nueva empresa), 23% (INCN < 1M), 25% (general).
4) **Cuota líquida** = cuota íntegra – deducciones.
5) **Resultado** = cuota líquida – pagos fraccionados.
`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuándo se presenta el Modelo 200 del IS?',
        acceptedAnswer: { '@type': 'Answer', text: 'Para ejercicio natural, 1–25 de julio del año siguiente.' },
      },
      {
        '@type': 'Question',
        name: '¿Es deducible el propio gasto del IS?',
        acceptedAnswer: { '@type': 'Answer', text: 'No: es un ajuste extracontable positivo.' },
      },
      {
        '@type': 'Question',
        name: '¿Condición para el 23% reducido?',
        acceptedAnswer: { '@type': 'Answer', text: 'INCN del periodo anterior < 1.000.000 €.' },
      },
    ],
  },
};

/* =========================
   Minimal markdown
   ========================= */

function simpleMarkdownToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  let inList = false;
  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };
  for (const raw of lines) {
    if (/^\s*[-*]\s+/.test(raw)) {
      if (!inList) {
        html += '<ul class="list-disc pl-5 space-y-2 mb-4">';
        inList = true;
      }
      const item = esc(raw.replace(/^\s*[-*]\s+/, ''))
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100">$1</code>');
      html += `<li>${item}</li>`;
      continue;
    } else closeList();

    const h3 = raw.match(/^\s*###\s+(.*)$/);
    const h2 = raw.match(/^\s*##\s+(.*)$/);
    const h1 = raw.match(/^\s*#\s+(.*)$/);
    if (h3) {
      html += `<h3 class="text-xl font-bold mt-6 mb-4 text-gray-800">${esc(h3[1])}</h3>`;
      continue;
    }
    if (h2) {
      html += `<h2 class="text-2xl font-bold mt-6 mb-4 text-gray-800">${esc(h2[1])}</h2>`;
      continue;
    }
    if (h1) {
      html += `<h1 class="text-3xl font-bold mt-6 mb-4 text-gray-800">${esc(h1[1])}</h1>`;
      continue;
    }
    if (raw.trim() === '') continue;

    const p = esc(raw)
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100">$1</code>');
    html += `<p class="mb-4 leading-relaxed">${p}</p>`;
  }
  closeList();
  return html;
}

const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

/* =========================
   Chart (client only)
   ========================= */

const DynamicBarChart: React.ComponentType<any> = dynamic(
  () =>
    import('recharts').then((mod: any) => {
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
      const ChartComponent = (props: any) => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis
              width={80}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  notation: 'compact',
                }).format(value)
              }
              fontSize={12}
            />
            <ChartTooltip formatter={(value: number) => euro(value)} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
            <Legend />
            <Bar dataKey="valor" name="Importe" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      );
      return ChartComponent as any;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Cargando gráfico...</div>
    ),
  }
);

/* =========================
   UI bits
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

/* =========================
   Component
   ========================= */

const initialState: State = {
  resultado_contable: 100_000,
  ajustes_positivos: 10_000,
  ajustes_negativos: 5_000,
  bases_negativas_anteriores: 15_000,
  deducciones_bonificaciones: 3_000,
  pagos_fraccionados: 12_000,
  cifra_negocios: 900_000,
  es_nueva_empresa: false,
};

const CalculadoraImpuestoSociedades: React.FC = () => {
  const { slug, title, description, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [state, setState] = useState<State>(initialState);

  const getNum = (k: NumericKey, fb = 0) => toNum(state[k], fb);
  const getBool = (k: BooleanKey) => Boolean(state[k]);

  const getInputCfg = (id: string) => (inputs as CalculatorInput[]).find((i) => i.id === id);

  const handleStateChange = (id: string, value: number | string | boolean) => {
    const cfg = getInputCfg(id);
    if (!cfg) return;

    if (isBooleanKey(id)) {
      setState((prev) => ({ ...prev, [id]: Boolean(value) }));
      return;
    }

    // Numeric path
    let num: number;
    if (value === '') {
      // allow empty string to keep input controlled (as string)
      setState((prev) => ({ ...prev, [id]: '' }));
      return;
    } else if (typeof value === 'string' || typeof value === 'number') {
      num = toNum(value, 0);
    } else {
      // if a boolean accidentally arrives, ignore it safely
      num = getNum(id as NumericKey, 0);
    }

    const clamped = clamp(num, (cfg as Extract<CalculatorInput, { type: 'number' }>).min, (cfg as any).max);
    setState((prev) => ({ ...prev, [id]: clamped }));
  };

  const handleReset = () => setState(initialState);

  const calculationResults = useMemo(() => {
    const resultado_contable = getNum('resultado_contable', 0);
    const ajustes_positivos = getNum('ajustes_positivos', 0);
    const ajustes_negativos = getNum('ajustes_negativos', 0);
    const bases_negativas_anteriores = getNum('bases_negativas_anteriores', 0);
    const deducciones_bonificaciones = getNum('deducciones_bonificaciones', 0);
    const pagos_fraccionados = getNum('pagos_fraccionados', 0);
    const cifra_negocios = getNum('cifra_negocios', 0);
    const es_nueva_empresa = getBool('es_nueva_empresa');

    const base_imponible_previa = resultado_contable + ajustes_positivos - ajustes_negativos;

    // Compensación de BINs (solo si base previa > 0)
    let compensacionAplicada = 0;
    if (base_imponible_previa > 0 && bases_negativas_anteriores > 0) {
      const porcentaje = cifra_negocios >= 60_000_000 ? 0.25 : cifra_negocios >= 20_000_000 ? 0.5 : 0.7;
      const limitePorcentaje = base_imponible_previa * porcentaje;
      const limiteConMinimo = Math.max(1_000_000, limitePorcentaje);
      const maxCompensable = Math.min(base_imponible_previa, limiteConMinimo);
      compensacionAplicada = Math.min(bases_negativas_anteriores, maxCompensable);
    }

    // Base final
    const base_imponible =
      base_imponible_previa > 0 ? Math.max(0, base_imponible_previa - compensacionAplicada) : base_imponible_previa;

    // Tipo (solo si base final > 0)
    let tipo_gravamen_aplicado = 0;
    if (base_imponible > 0) {
      if (es_nueva_empresa) tipo_gravamen_aplicado = 15;
      else if (cifra_negocios < 1_000_000) tipo_gravamen_aplicado = 23;
      else tipo_gravamen_aplicado = 25;
    }

    const cuota_integra = base_imponible > 0 ? base_imponible * (tipo_gravamen_aplicado / 100) : 0;
    const cuota_liquida = Math.max(0, cuota_integra - deducciones_bonificaciones);
    const resultado_declaracion = cuota_liquida - pagos_fraccionados;

    const summary = {
      base_imponible_previa: Number(base_imponible_previa.toFixed(2)),
      base_imponible: Number(base_imponible.toFixed(2)),
      tipo_gravamen_aplicado: Number(tipo_gravamen_aplicado.toFixed(2)),
      cuota_integra: Number(cuota_integra.toFixed(2)),
      cuota_liquida: Number(cuota_liquida.toFixed(2)),
      resultado_declaracion: Number(resultado_declaracion.toFixed(2)),
    };

    const chartData = [
      { name: 'Res. Contable', valor: resultado_contable },
      { name: 'B.I. Previa', valor: summary.base_imponible_previa },
      { name: 'B.I. Final', valor: summary.base_imponible },
      { name: 'Cuota Íntegra', valor: summary.cuota_integra },
      { name: 'Cuota Líquida', valor: summary.cuota_liquida },
      { name: 'Resultado', valor: summary.resultado_declaracion },
    ];

    return { summary, chartData };
  }, [state]);

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
    } catch {
      alert('Error al generar el PDF.');
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: state, outputs: calculationResults.summary, ts: Date.now() };
      const prev = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...prev].slice(0, 10)));
      alert('Resultado guardado en el navegador.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [state, calculationResults.summary, slug, title]);

  return (
    <>
      <SeoSchema schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
              {(calculatorData.inputs as CalculatorInput[])
                .filter((i) => i.type === 'number')
                .map((input) => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      <span className="ml-2 cursor-help">
                        <Tooltip text={input.tooltip}>
                          <span>
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pr-12"
                        type="number"
                        min={input.min}
                        max={input.max}
                        step={input.step}
                        value={state[input.id as NumericKey]}
                        onChange={(e) =>
                          handleStateChange(
                            input.id,
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                      {input.unit && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 pointer-events-none">
                          {input.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

              {(calculatorData.inputs as CalculatorInput[])
                .filter((i) => i.type === 'boolean')
                .map((input) => (
                  <div
                    key={input.id}
                    className="md:col-span-2 lg:col-span-3 flex items-center gap-3 p-3 rounded-md bg-white border mt-2"
                  >
                    <input
                      id={input.id}
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={Boolean(state[input.id as BooleanKey])}
                      onChange={(e) => handleStateChange(input.id, e.target.checked)}
                    />
                    <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      <span className="ml-2 cursor-help">
                        <Tooltip text={input.tooltip}>
                          <span>
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      </span>
                    </label>
                  </div>
                ))}
            </div>

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Liquidación del Impuesto</h2>
              {outputs.map((output) => (
                <div
                  key={output.id}
                  className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${
                    output.id === 'resultado_declaracion'
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">{output.label}</div>
                  <div
                    className={`text-lg font-bold ${
                      output.id === 'resultado_declaracion'
                        ? calculationResults.summary.resultado_declaracion >= 0
                          ? 'text-red-600'
                          : 'text-green-600'
                        : 'text-gray-800'
                    }`}
                  >
                    {isClient
                      ? output.unit === '€'
                        ? euro((calculationResults.summary as any)[output.id])
                        : `${(calculationResults.summary as any)[output.id]}%`
                      : '...'}
                  </div>
                </div>
              ))}
              {isClient && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  {calculationResults.summary.resultado_declaracion >= 0
                    ? 'Resultado a ingresar en la declaración.'
                    : 'Resultado a devolver en la declaración.'}
                </p>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualización del Cálculo</h3>
              <div className="h-80 w-full rounded-lg">
                {isClient && <DynamicBarChart data={calculationResults.chartData} />}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button
                onClick={handleSaveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border border-transparent bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Análisis Fiscal</h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(calculatorData.content) }}
            />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/impuesto-sobre-sociedades-2023.html"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Manual práctico del IS
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 27/2014, del Impuesto sobre Sociedades
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraImpuestoSociedades;
