'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* =========================
 *  Types
 * ========================= */
type OutputId =
  | 'ganancia_patrimonial'
  | 'impuestos_a_pagar'
  | 'capital_neto_operacion'
  | 'tipo_efectivo';

type BreakdownRow = { tramo: string; base: number; tipo: number; cuota: number };
type CalculatedOutputs = {
  ganancia_patrimonial: number;
  impuestos_a_pagar: number;
  capital_neto_operacion: number;
  tipo_efectivo: number; // percentage number, e.g. 18.5
  marginal_rate: number; // e.g. 0.21
  marginal_label: string;
  breakdown: BreakdownRow[];
};

type OutputSpec = {
  id: OutputId;
  label: string;
  unit: '€' | '%';
  isPrimary?: boolean;
};

/* =========================
 *  Dynamic Pie (SSR-safe)
 * ========================= */
const ChartLoader = () => (
  <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">
    Cargando gráfico...
  </div>
);

const DynamicPie = dynamic(
  () =>
    import('recharts').then((mod) => {
      const PieBundle = ({
        data,
        colors,
        formatCurrency,
      }: {
        data: { name: string; value: number }[];
        colors: string[];
        formatCurrency: (n: number) => string;
      }) => (
        <mod.ResponsiveContainer width="100%" height="100%">
          <mod.PieChart>
            <mod.Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, i) => (
                <mod.Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </mod.Pie>
            <mod.Tooltip formatter={(v: number) => formatCurrency(v)} />
            <mod.Legend />
          </mod.PieChart>
        </mod.ResponsiveContainer>
      );
      return { default: PieBundle };
    }),
  { ssr: false, loading: () => <ChartLoader /> }
);

const COLORS = ['#0088FE', '#FF8042'];

/* =========================
 *  Component Metadata
 * ========================= */
export const meta = {
  title: 'Calculadora de Fiscalidad de Fondos de Inversión (regla de traspaso)',
  description:
    'Calcula los impuestos (IRPF) al vender un fondo de inversión en España y comprueba la ventaja fiscal de los traspasos para optimizar tu rentabilidad.',
};

/* =========================
 *  Helper Components
 * ========================= */
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = ({ schema }: { schema: any }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="text-sm bg-gray-200 text-red-600 rounded px-1 py-0.5">$1</code>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### '))
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace('### ', '')) }}
            />
          );
        if (trimmedBlock.match(/^\d\.\s/)) {
          const items = trimmedBlock.split('\n');
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />
              ))}
            </ol>
          );
        }
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n');
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />
              ))}
            </ul>
          );
        }
        if (trimmedBlock)
          return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        return null;
      })}
    </div>
  );
};

/* =========================
 *  Calculator Data (Self-Contained)
 * ========================= */
const calculatorData = {
  slug: 'calculadora-fiscalidad-fondos-inversion',
  category: 'Finanzas Personales e Inversiones',
  title: 'Calculadora de Fiscalidad de Fondos de Inversión (regla de traspaso)',
  lang: 'es',
  inputs: [
    {
      id: 'importe_invertido',
      label: 'Importe total invertido',
      type: 'number',
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'La suma de todo el dinero que has aportado al fondo de inversión. Es tu coste de adquisición.',
    },
    {
      id: 'valor_actual',
      label: 'Valor actual del fondo',
      type: 'number',
      unit: '€',
      min: 0,
      step: 100,
      tooltip: 'El valor de mercado de todas tus participaciones en el fondo a día de hoy.',
    },
    {
      id: 'operacion',
      label: 'Tipo de operación a simular',
      type: 'select',
      options: ['Reembolso (Venta)', 'Traspaso entre fondos'],
      tooltip:
        "Elige 'Reembolso' para calcular los impuestos de una venta. Elige 'Traspaso' para ver la ventaja fiscal de mover tu dinero a otro fondo sin vender.",
    },
  ],
  outputs: [
    { id: 'ganancia_patrimonial', label: 'Ganancia/Pérdida Patrimonial', unit: '€' },
    { id: 'impuestos_a_pagar', label: 'Impuestos a pagar (IRPF)', unit: '€', isPrimary: true },
    { id: 'capital_neto_operacion', label: 'Capital neto después de la operación', unit: '€' },
    { id: 'tipo_efectivo', label: 'Tipo efectivo sobre la ganancia', unit: '%' },
  ] as OutputSpec[],
  formulaSteps: [
    {
      step: 'Cálculo de la Ganancia Patrimonial',
      description:
        'Ganancia = Valor Actual - Importe Invertido. Si el resultado es negativo, es una pérdida patrimonial y no se pagan impuestos.',
    },
    {
      step: 'Aplicación de la Exención por Traspaso',
      description:
        "Si la operación es un 'Traspaso entre fondos', la ganancia patrimonial está exenta de tributación. El impuesto a pagar es 0€. El 100% del capital se reinvierte.",
    },
    {
      step: 'Cálculo de Impuestos (en caso de Reembolso)',
      description:
        'La ganancia se integra en la Base Imponible del Ahorro del IRPF y tributa por tramos progresivos: 19% por los primeros 6.000€, 21% entre 6.000,01€ y 50.000€, 23% entre 50.000,01€ y 200.000€, 27% entre 200.000,01€ y 300.000€, y 28% para cantidades superiores a 300.000€.',
    },
    {
      step: 'Resultado Final',
      description:
        'Capital Neto = Valor Actual - Impuestos a Pagar. El Tipo Efectivo = (Impuestos a Pagar / Ganancia Patrimonial) * 100.',
    },
  ],
  examples: [
    {
      name: 'Ejemplo 1: Reembolso con Ganancias',
      inputs: { importe_invertido: 20000, valor_actual: 35000, operacion: 'Reembolso (Venta)' },
    },
    {
      name: 'Ejemplo 2: Traspaso con las Mismas Ganancias',
      inputs: { importe_invertido: 20000, valor_actual: 35000, operacion: 'Traspaso entre fondos' },
    },
  ],
  tags:
    'fiscalidad fondos de inversión, impuestos fondos, traspaso fondos, tributación IRPF, ganancia patrimonial, base imponible del ahorro, calculadora IRPF, fiscalidad inversiones, regla traspaso',
  content:
    "### Introducción\n\nEntender la fiscalidad de los fondos de inversión es clave para maximizar tu rentabilidad a largo plazo. ...",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué es el criterio FIFO y cómo me afecta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            "FIFO son las siglas de 'First-In, First-Out'. Significa que cuando vendes una parte de tu fondo, fiscalmente se considera que estás vendiendo las participaciones más antiguas que compraste. La calculadora asume una venta total, pero si hicieras una venta parcial, la ganancia se calcularía sobre el precio de compra de esas primeras participaciones.",
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué pasa si tengo pérdidas en lugar de ganancias?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Si al vender tienes una pérdida patrimonial (el valor actual es menor que el importe invertido), no pagas impuestos. Además, puedes compensar esa pérdida con otras ganancias patrimoniales que hayas tenido en el mismo año o en los 4 años siguientes.',
        },
      },
      {
        '@type': 'Question',
        name: '¿La exención por traspaso es ilimitada?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí, puedes realizar tantos traspasos como quieras entre fondos de inversión comercializados en España y acogidos a esta normativa. La tributación solo se produce en el reembolso final.',
        },
      },
    ],
  },
} as const;

/* =========================
 *  Main Component
 * ========================= */
const CalculadoraFiscalidadFondosInversion: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialStates = {
    importe_invertido: 50000,
    valor_actual: 75000,
    operacion: 'Reembolso (Venta)',
  } as const;
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => setStates((prev) => ({ ...prev, [id]: value }));
  const handleReset = () => setStates(initialStates);

  // Utilidad de cálculo IRPF para "Reembolso"
  const calcReembolso = useCallback((inv: number, val: number): CalculatedOutputs => {
    const ganancia_patrimonial = val - inv;
    if (ganancia_patrimonial <= 0) {
      return {
        ganancia_patrimonial,
        impuestos_a_pagar: 0,
        capital_neto_operacion: val,
        tipo_efectivo: 0,
        marginal_rate: 0,
        marginal_label: 'No aplicable',
        breakdown: [],
      };
    }

    const brackets = [
      { limit: 6000, rate: 0.19, label: '0–6.000€' },
      { limit: 50000, rate: 0.21, label: '6.000–50.000€' },
      { limit: 200000, rate: 0.23, label: '50.000–200.000€' },
      { limit: 300000, rate: 0.27, label: '200.000–300.000€' },
      { limit: Infinity, rate: 0.28, label: '>300.000€' },
    ] as const;

    let restante = ganancia_patrimonial;
    let impuestos_a_pagar = 0;
    let prevLimit = 0;
    const breakdown: BreakdownRow[] = [];

    for (const b of brackets) {
      if (restante <= 0) break;
      const anchoTramo = b.limit === Infinity ? Infinity : b.limit - prevLimit;
      const baseEnTramo = Math.min(restante, anchoTramo);
      const cuota = baseEnTramo * b.rate;
      impuestos_a_pagar += cuota;
      breakdown.push({ tramo: b.label, base: baseEnTramo, tipo: b.rate, cuota });
      restante -= baseEnTramo;
      if (b.limit !== Infinity) prevLimit = b.limit;
    }

    // Tipo marginal en base a ganancia total
    let marginal_rate = 0;
    let marginal_label = '0–6.000€';
    if (ganancia_patrimonial <= 6000) {
      marginal_rate = 0.19;
      marginal_label = '0–6.000€';
    } else if (ganancia_patrimonial <= 50000) {
      marginal_rate = 0.21;
      marginal_label = '6.000–50.000€';
    } else if (ganancia_patrimonial <= 200000) {
      marginal_rate = 0.23;
      marginal_label = '50.000–200.000€';
    } else if (ganancia_patrimonial <= 300000) {
      marginal_rate = 0.27;
      marginal_label = '200.000–300.000€';
    } else {
      marginal_rate = 0.28;
      marginal_label = '>300.000€';
    }

    const capital_neto_operacion = val - impuestos_a_pagar;
    const tipo_efectivo = (impuestos_a_pagar / ganancia_patrimonial) * 100;

    return {
      ganancia_patrimonial,
      impuestos_a_pagar,
      capital_neto_operacion,
      tipo_efectivo,
      marginal_rate,
      marginal_label,
      breakdown,
    };
  }, []);

  const calcTraspaso = useCallback((inv: number, val: number): CalculatedOutputs => {
    const ganancia_patrimonial = Math.max(0, val - inv);
    return {
      ganancia_patrimonial,
      impuestos_a_pagar: 0,
      capital_neto_operacion: val,
      tipo_efectivo: 0,
      marginal_rate: 0,
      marginal_label: 'No aplicable (traspaso)',
      breakdown: [],
    };
  }, []);

  // Cálculos normalizados (evita NaN)
  const { calculatedOutputs, reembolsoAlt, traspasoAlt } = useMemo(() => {
    const inv = Number(states.importe_invertido) || 0;
    const val = Number(states.valor_actual) || 0;
    const op = String(states.operacion || '');

    const current: CalculatedOutputs =
      op === 'Traspaso entre fondos' ? calcTraspaso(inv, val) : calcReembolso(inv, val);

    // Para el “Diagnóstico”: comparar siempre Reembolso vs Traspaso con mismos inputs
    const reembolso = calcReembolso(inv, val);
    const traspaso = calcTraspaso(inv, val);

    return { calculatedOutputs: current, reembolsoAlt: reembolso, traspasoAlt: traspaso };
  }, [states, calcReembolso, calcTraspaso]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercentage = (value: number) =>
    `${Math.max(0, Number.isFinite(value) ? value : 0).toFixed(2)}%`;

  const chartData = useMemo(() => {
    if (!calculatedOutputs || calculatedOutputs.impuestos_a_pagar <= 0) return [];
    return [
      { name: 'Capital Neto', value: calculatedOutputs.capital_neto_operacion },
      { name: 'Impuestos', value: calculatedOutputs.impuestos_a_pagar },
    ];
  }, [calculatedOutputs]);

  const handleExportPDF = useCallback(async () => {
    if (!calculatorRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', putOnlyUsedFonts: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) {
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const savedResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...savedResults].slice(0, 10)));
      alert('Resultado guardado en el almacenamiento local.');
    } catch (e) {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{meta.description}</p>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
              {inputs.map((input) => (
                <div key={input.id} className={input.type === 'select' ? 'md:col-span-2' : ''}>
                  <label
                    className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                    htmlFor={input.id}
                  >
                    {input.label}
                    <Tooltip text={input.tooltip}>
                      <span className="ml-2">
                        <InfoIcon />
                      </span>
                    </Tooltip>
                  </label>

                  {input.type === 'number' && (
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                      <input
                        id={input.id}
                        type="number"
                        min={input.min as number | undefined}
                        step={input.step as number | undefined}
                        value={states[input.id]}
                        onChange={(e) =>
                          handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-7 pr-3 py-2"
                      />
                    </div>
                  )}

                  {input.type === 'select' && (
                    <select
                      id={input.id}
                      value={states[input.id]}
                      onChange={(e) => handleStateChange(input.id, e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 font-medium"
                    >
                      {input.options?.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            {/* Resultados */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Resultados de la Simulación</h2>

              {states.operacion === 'Traspaso entre fondos' ? (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg">
                  <h3 className="font-bold">Ventaja Fiscal Activada (Diferimiento Fiscal)</h3>
                  <p className="text-sm mt-1">
                    Al realizar un traspaso, la ganancia patrimonial de{' '}
                    <strong>
                      {isClient ? formatCurrency(calculatedOutputs.ganancia_patrimonial) : '...'}
                    </strong>{' '}
                    está exenta de impuestos. El <strong>100% de tu capital</strong> (
                    {isClient ? formatCurrency(Number(states.valor_actual) || 0) : '...'})
                    {' '}se reinvierte en el nuevo fondo, maximizando el interés compuesto.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outputs.map((output) => {
                    const value = calculatedOutputs[output.id];
                    return (
                      <div
                        key={output.id}
                        className={`flex items-baseline justify-between p-4 rounded-lg ${
                          output.isPrimary
                            ? 'bg-indigo-50 border-l-4 border-indigo-500'
                            : 'bg-gray-50 border-l-4 border-gray-300'
                        }`}
                      >
                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                        <div
                          className={`text-xl md:text-2xl font-bold ${
                            output.isPrimary ? 'text-indigo-600' : 'text-gray-800'
                          }`}
                        >
                          <span>
                            {isClient
                              ? output.unit === '%'
                                ? formatPercentage(value)
                                : formatCurrency(value)
                              : '...'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Diagnóstico */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🩺 Diagnóstico</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Tramo marginal aplicado</div>
                  <div className="text-base font-semibold text-gray-800">
                    {states.operacion === 'Traspaso entre fondos' || calculatedOutputs.ganancia_patrimonial <= 0
                      ? 'No aplicable'
                      : `${(calculatedOutputs.marginal_rate * 100).toFixed(0)}% (${calculatedOutputs.marginal_label})`}
                  </div>
                </div>
                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Tipo efectivo sobre la ganancia</div>
                  <div className="text-base font-semibold text-gray-800">
                    {formatPercentage(calculatedOutputs.tipo_efectivo)}
                  </div>
                </div>
                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Ahorro inmediato por traspaso</div>
                  <div className="text-base font-semibold text-emerald-700">
                    {formatCurrency(reembolsoAlt.impuestos_a_pagar - traspasoAlt.impuestos_a_pagar)}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-50 border rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-2">Comparativa inmediata</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-white border rounded">
                    <div className="font-medium text-gray-700 mb-1">Reembolso (Venta)</div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Impuestos:</span>
                      <span className="font-semibold">{formatCurrency(reembolsoAlt.impuestos_a_pagar)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capital neto reinvertible hoy:</span>
                      <span className="font-semibold">{formatCurrency(reembolsoAlt.capital_neto_operacion)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white border rounded">
                    <div className="font-medium text-gray-700 mb-1">Traspaso entre fondos</div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Impuestos:</span>
                      <span className="font-semibold">{formatCurrency(traspasoAlt.impuestos_a_pagar)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capital reinvertible hoy:</span>
                      <span className="font-semibold">{formatCurrency(traspasoAlt.capital_neto_operacion)}</span>
                    </div>
                  </div>
                </div>
                {/* Breakdown (solo se muestra si hay impuestos) */}
                {reembolsoAlt.impuestos_a_pagar > 0 && reembolsoAlt.breakdown?.length > 0 && (
                  <div className="mt-4">
                    <details className="group">
                      <summary className="cursor-pointer select-none text-gray-700 hover:text-indigo-600 font-medium">
                        Ver desglose por tramos
                      </summary>
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="py-2 pr-4">Tramo</th>
                              <th className="py-2 pr-4">Base</th>
                              <th className="py-2 pr-4">Tipo</th>
                              <th className="py-2 pr-4">Cuota</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reembolsoAlt.breakdown.map((r: BreakdownRow, i: number) => (
                              <tr key={i} className="border-t">
                                <td className="py-2 pr-4">{r.tramo}</td>
                                <td className="py-2 pr-4">{formatCurrency(r.base)}</td>
                                <td className="py-2 pr-4">{formatPercentage(r.tipo * 100)}</td>
                                <td className="py-2 pr-4">{formatCurrency(r.cuota)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pie solo si es Reembolso con impuestos */}
          {states.operacion === 'Reembolso (Venta)' && calculatedOutputs.impuestos_a_pagar > 0 && (
            <div className=" -lg -md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualización del Impacto Fiscal</h3>
              {isClient && chartData.length > 0 && (
                <div className="h-64 w-full">
                  <DynamicPie data={chartData} colors={COLORS} formatCurrency={formatCurrency} />
                </div>
              )}
            </div>
          )}
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleSaveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                💾 Guardar Resultado
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                📄 Exportar a PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                🔄 Resetear Calculadora
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía de Comprensión</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-11-ganancias-perdidas-patrimoniales/reglas-integracion-compensacion-rentas/base-imponible-ahorro.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Base Imponible del Ahorro
                </a>
              </li>
              <li>
                <a
                  href="https://www.cnmv.es/portal/inversor/fondos-de-inversion.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  CNMV: Guía sobre Fondos de Inversión
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraFiscalidadFondosInversion;
