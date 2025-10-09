'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Switch } from '@headlessui/react';

/* ===========================
   Tipi + helpers  🔧
   =========================== */
type NumberInputDef = {
  id: string;
  label: string;
  type: 'number';
  unit: string;
  min?: number;
  step?: number;
  tooltip?: string;
  condition?: string;
};
type BooleanInputDef = {
  id: string;
  label: string;
  type: 'boolean';
  tooltip?: string;
};
type InputDef = NumberInputDef | BooleanInputDef;

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const clamp = (v: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Number.isFinite(v) ? Math.min(Math.max(v, min), max) : min;
const toNumber = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/* ===========================
   Recharts: PieChart dinamico
   =========================== */
type PieDatum = { name: string; value: number };
type PieChartProps = {
  data: PieDatum[];
  legendPercents?: Record<string, number>;
};

const DynamicPieChart = dynamic<PieChartProps>(
  () =>
    import('recharts').then((mod) => {
      const {
        PieChart,
        Pie,
        Cell,
        Tooltip: ChartTooltip,
        ResponsiveContainer,
        Legend,
      } = mod;

      const COLORS = ['#4f46e5', '#a5b4fc'];

      const CustomLegend: React.FC<any> = (props) => {
        const payload = (props?.payload ?? []) as Array<{ value: string; color: string }>;
        const perc = (name: string) =>
          props?.legendPercents && Number.isFinite(props.legendPercents[name])
            ? ` — ${new Intl.NumberFormat('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(props.legendPercents[name])}%`
            : '';
        return (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-sm">
            {payload.map((entry, i) => (
              <li key={`legend-${i}`} className="flex items-center">
                <span
                  className="inline-block w-3 h-3 rounded-sm mr-2"
                  style={{ background: entry.color }}
                />
                <span className="text-gray-700">
                  {entry.value}
                  {perc(entry.value)}
                </span>
              </li>
            ))}
          </ul>
        );
      };

      const ChartComponent: React.FC<PieChartProps> = (props) => (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={props.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              isAnimationActive={false}
            >
              {props.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                  value ?? 0
                )
              }
            />
            <Legend content={<CustomLegend legendPercents={props.legendPercents} />} />
          </PieChart>
        </ResponsiveContainer>
      );

      return ChartComponent;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p>Cargando gráfico...</p>
      </div>
    ),
  }
);

/* ===========================
   UI: Icona + Tooltip
   =========================== */
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

/* ===========================
   SEO + Content (come prima)
   =========================== */
const FaqSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('### '))
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.slice(4)) }} />;
        if (trimmed.startsWith('#### '))
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.slice(5)) }} />;
        if (trimmed.startsWith('*')) {
          const items = trimmed.split('\n').map((it) => it.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(it) }} />)}</ul>;
        }
        if (/^\d\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').map((it) => it.replace(/^\d\.\s*/, ''));
          return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(it) }} />)}</ol>;
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed) }} />;
      })}
    </div>
  );
};

/* ===========================
   Config calcolatore (immutabile)
   =========================== */
const calculatorData: {
  slug: string;
  category: string;
  title: string;
  lang: string;
  inputs: ReadonlyArray<InputDef>; // 🔧
  outputs: ReadonlyArray<{ id: string; label: string; unit: string }>;
  content: string;
  seoSchema: object;
} = {
  // ... (tieni invariati i tuoi dati; solo il tipo di `inputs` cambia)
  slug: "calculadora-wacc",
  category: "Bienes Raíces y Vivienda",
  title: "Calculadora de la Tasa de Descuento para Valoración de Proyectos (WACC)",
  lang: "es",
  inputs: [
    { id: "valor_mercado_equity", label: "Valor de Mercado de Fondos Propios (E)", type: "number", unit: "€", min: 0, tooltip: "..." },
    { id: "valor_mercado_deuda", label: "Valor de Mercado de la Deuda (D)", type: "number", unit: "€", min: 0, tooltip: "..." },
    { id: "costo_deuda_kd", label: "Costo de la Deuda (Kd)", type: "number", unit: "%", min: 0, step: 0.1, tooltip: "..." },
    { id: "tasa_impuestos", label: "Tasa Impositiva Corporativa (T)", type: "number", unit: "%", min: 0, step: 1, tooltip: "..." },
    { id: "usar_capm", label: "Calcular Costo de Fondos Propios (Ke) con el modelo CAPM", type: "boolean", tooltip: "..." },
    { id: "costo_equity_ke", label: "Costo de Fondos Propios (Ke)", type: "number", unit: "%", min: 0, step: 0.1, condition: "usar_capm == false", tooltip: "..." },
    { id: "tasa_libre_riesgo_rf", label: "Tasa Libre de Riesgo (Rf)", type: "number", unit: "%", min: 0, step: 0.01, condition: "usar_capm == true", tooltip: "..." },
    { id: "beta_activo", label: "Beta del Activo (β)", type: "number", unit: "", min: 0, step: 0.01, condition: "usar_capm == true", tooltip: "..." },
    { id: "retorno_mercado_rm", label: "Rentabilidad Esperada del Mercado (Rm)", type: "number", unit: "%", min: 0, step: 0.1, condition: "usar_capm == true", tooltip: "..." }
  ],
  outputs: [
    { id: "wacc_resultado", label: "WACC (Costo Promedio Ponderado de Capital)", unit: "%" },
    { id: "costo_equity_calculado", label: "Costo de Fondos Propios (Ke) Utilizado", unit: "%" },
    { id: "peso_equity", label: "Ponderación de Fondos Propios (We)", unit: "%" },
    { id: "peso_deuda", label: "Ponderación de Deuda (Wd)", unit: "%" }
  ],
  content: `... (tuo testo) ...`,
  seoSchema: { /* ... */ },
};

/* ===========================
   Component principale
   =========================== */
const CalculadoraWacc: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const MAX_PERCENT = 100;
  const MAX_BETA = 5;

  const initialStates = {
    valor_mercado_equity: 500000000,
    valor_mercado_deuda: 150000000,
    costo_deuda_kd: 4.5,
    tasa_impuestos: 25,
    usar_capm: true,
    costo_equity_ke: 10,
    tasa_libre_riesgo_rf: 3.5,
    beta_activo: 1.2,
    retorno_mercado_rm: 8.5,
  };
  const [states, setStates] = useState<Record<string, number | boolean | ''>>(initialStates);

  const handleStateChange = (id: string, value: string | number | boolean) => {
    if (typeof value === 'boolean') {
      setStates((p) => ({ ...p, [id]: value }));
      return;
    }
    if (value === '') {
      setStates((p) => ({ ...p, [id]: '' }));
      return;
    }
    const def = inputs.find((i) => i.id === id);
    const min =
      def && def.type === 'number' && typeof def.min === 'number' ? def.min : 0; // 🔧

    const isPercent =
      id === 'costo_deuda_kd' ||
      id === 'tasa_impuestos' ||
      id === 'tasa_libre_riesgo_rf' ||
      id === 'retorno_mercado_rm' ||
      id === 'costo_equity_ke';
    const isBeta = id === 'beta_activo';

    const num = Number(value);
    const clamped = clamp(
      num,
      min,
      isPercent ? MAX_PERCENT : isBeta ? MAX_BETA : Number.POSITIVE_INFINITY
    );

    setStates((p) => ({ ...p, [id]: clamped }));
  };

  const onBlurNormalize = (id: string) => {
    const def = inputs.find((i) => i.id === id);
    const min =
      def && def.type === 'number' && typeof def.min === 'number' ? def.min : 0; // 🔧
    if (states[id] === '') {
      setStates((p) => ({ ...p, [id]: min }));
    }
  };

  const handleReset = () => setStates(initialStates);

  const { calculatedOutputs, pieChartData, legendPercents } = useMemo(() => {
    const E = toNumber(states.valor_mercado_equity);
    const D = toNumber(states.valor_mercado_deuda);
    const V = E + D;

    const Kd = clamp(toNumber(states.costo_deuda_kd) / 100, 0, 1);
    const T = clamp(toNumber(states.tasa_impuestos) / 100, 0, 1);

    let Ke = clamp(toNumber(states.costo_equity_ke) / 100, 0, 1);
    if (states.usar_capm) {
      const Rf = clamp(toNumber(states.tasa_libre_riesgo_rf) / 100, 0, 1);
      const Beta = clamp(toNumber(states.beta_activo), 0, MAX_BETA);
      const Rm = clamp(toNumber(states.retorno_mercado_rm) / 100, 0, 1);
      Ke = Rf + Beta * (Rm - Rf);
    }

    const peso_equity = V > 0 ? clamp(E / V, 0, 1) : 0;
    const peso_deuda = V > 0 ? clamp(D / V, 0, 1) : 0;

    const wacc_resultado = peso_equity * Ke + peso_deuda * Kd * (1 - T);

    return {
      calculatedOutputs: {
        wacc_resultado: wacc_resultado * 100,
        costo_equity_calculado: Ke * 100,
        peso_equity: peso_equity * 100,
        peso_deuda: peso_deuda * 100,
      },
      pieChartData: [
        { name: 'Fondos Propios', value: E },
        { name: 'Deuda', value: D },
      ],
      legendPercents: V > 0 ? { 'Fondos Propios': (E / V) * 100, Deuda: (D / V) * 100 } : { 'Fondos Propios': 0, Deuda: 0 },
    };
  }, [states]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('La función de exportar a PDF no está disponible.');
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existing = JSON.parse(localStorage.getItem('calc_results') || '[]');
      const next = [payload, ...existing].slice(0, 50);
      localStorage.setItem('calc_results', JSON.stringify(next));
      alert('Resultado guardado correctamente.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatPercentage = (value: number) =>
    `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)}%`;

  /* ===========================
     UI
     =========================== */
  return (
    <>
      {/* ... header e avviso come prima ... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            {/* Titolo/descrizione */}

            {/* Estructura de Capital — type guard su number  🔧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputs
                .filter((i): i is NumberInputDef => i.type === 'number' && i.id.includes('valor_'))
                .map((input) => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {'tooltip' in input && input.tooltip && (
                        <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        type="number"
                        min={input.min}
                        value={states[input.id] as number | ''}
                        onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                        onBlur={() => onBlurNormalize(input.id)}
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Switch CAPM */}
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <div className="flex items-center justify-between">
                <label htmlFor="usar_capm" className="text-sm font-medium text-gray-900 flex items-center">
                  {inputs.find((i) => i.id === 'usar_capm')?.label}
                  <Tooltip text={(inputs.find((i) => i.id === 'usar_capm') as BooleanInputDef)?.tooltip || ''}>
                    <span className="ml-2 cursor-help"><InfoIcon /></span>
                  </Tooltip>
                </label>
                <Switch
                  checked={Boolean(states.usar_capm)}
                  onChange={(checked) => handleStateChange('usar_capm', checked)}
                  id="usar_capm"
                  className={`${states.usar_capm ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span className={`${states.usar_capm ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                </Switch>
              </div>

              {/* CAPM inputs — type guard su number  🔧 */}
              {states.usar_capm ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {inputs
                    .filter((i): i is NumberInputDef => i.type === 'number' && i.condition === 'usar_capm == true')
                    .map((input) => (
                      <div key={input.id}>
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                          {input.label}
                          {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                        </label>
                        <div className="relative">
                          <input
                            id={input.id}
                            aria-label={input.label}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            type="number"
                            step={input.step}
                            min={input.min}
                            value={states[input.id] as number | ''}
                            onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                            onBlur={() => onBlurNormalize(input.id)}
                          />
                          <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="mt-4">
                  {inputs
                    .filter((i): i is NumberInputDef => i.type === 'number' && i.condition === 'usar_capm == false')
                    .map((input) => (
                      <div key={input.id}>
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                          {input.label}
                          {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                        </label>
                        <div className="relative">
                          <input
                            id={input.id}
                            aria-label={input.label}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            type="number"
                            step={input.step}
                            min={input.min}
                            value={states[input.id] as number | ''}
                            onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                            onBlur={() => onBlurNormalize(input.id)}
                          />
                          <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Kd e T — type guard su number  🔧 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputs
                .filter((i): i is NumberInputDef => i.type === 'number' && (i.id.includes('costo_deuda') || i.id.includes('tasa_impuestos')))
                .map((input) => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                    </label>
                    <div className="relative">
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        type="number"
                        step={input.step}
                        min={input.min}
                        value={states[input.id] as number | ''}
                        onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                        onBlur={() => onBlurNormalize(input.id)}
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Risultati */}
            {/* ... (sezione risultati come nella tua versione migliorata) ... */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados del Cálculo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 bg-indigo-600 text-white p-6 rounded-lg text-center">
                  <div className="text-base font-medium uppercase tracking-wider opacity-80">WACC (Costo Promedio Ponderado de Capital)</div>
                  <div className="text-5xl font-bold my-2">{isClient ? formatPercentage((calculatedOutputs as any).wacc_resultado || 0) : '...'}</div>
                </div>
                {outputs.filter(o => o.id !== 'wacc_resultado').map(output => (
                  <div key={output.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">{output.label}</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {isClient ? formatPercentage((calculatedOutputs as any)[output.id] || 0) : '...'}
                    </div>
                  </div>
                ))}
                <div className="bg-gray-50 p-4 rounded-lg h-48">
                  <h4 className="text-sm font-medium text-gray-600 text-center mb-2">Estructura de Capital</h4>
                  {isClient && <DynamicPieChart data={pieChartData} legendPercents={legendPercents} />}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={saveResult} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar Simulación</button>
                <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar a PDF</button>
                <button onClick={handleReset} className="w-full border border-transparent rounded-md px-3 py-2 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reiniciar Valores</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar con guida e fonti come prima */}
      </div>
    </>
  );
};

export default CalculadoraWacc;
