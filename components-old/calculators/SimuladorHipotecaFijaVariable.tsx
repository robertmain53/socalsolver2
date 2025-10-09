'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Util ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
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

// --- Dati ---
const calculatorData = {
  slug: 'simulador-hipoteca-fija-variable',
  category: 'Bienes Raíces y Vivienda',
  title: 'Simulador Hipoteca Fija vs. Variable (con evolución del Euríbor)',
  lang: 'es',
  tags:
    'simulador hipoteca, hipoteca fija vs variable, calculadora euribor, comparador hipotecas, cuota hipoteca, interes fijo, interes variable, amortizacion hipoteca',
  inputs: [
    {
      group: '1. Datos Comunes del Préstamo',
      fields: [
        { id: 'montoPrestamo', label: 'Importe del préstamo', type: 'number' as const, unit: '€', tooltip: 'Cantidad total solicitada al banco.' },
        { id: 'plazoAnos', label: 'Plazo en años', type: 'number' as const, unit: 'años', tooltip: 'Años para devolver (habitual 30).' },
      ],
    },
    {
      group: '2. Condiciones de Cada Hipoteca',
      fields: [
        { id: 'tipoInteresFijo', label: 'Tipo de Interés Fijo (TIN)', type: 'number' as const, unit: '%', tooltip: 'Interés anual fijo.' },
        { id: 'diferencialVariable', label: 'Diferencial sobre Euríbor', type: 'number' as const, unit: '%', tooltip: 'Margen fijo sobre Euríbor. Ej: E + 0,60%.' },
        { id: 'euriborInicial', label: 'Euríbor actual de partida', type: 'number' as const, unit: '%', tooltip: 'Euríbor 12m en la simulación.' },
      ],
    },
    {
      group: '3. Simulación del Euríbor a Futuro',
      fields: [
        {
          id: 'escenarioEuribor',
          label: 'Elige un escenario',
          type: 'select' as const,
          options: [
            { value: 'optimista', label: 'Optimista (Euríbor baja)' },
            { value: 'neutral', label: 'Neutral (Euríbor estable)' },
            { value: 'pesimista', label: 'Pesimista (Euríbor sube)' },
          ],
          tooltip: 'Evolución hipotética del Euríbor con revisión anual.',
        },
      ],
    },
  ],
  outputs: [
    { id: 'cuotaInicialFija', label: 'Cuota Mensual Inicial (Fija)' },
    { id: 'cuotaInicialVariable', label: 'Cuota Mensual Inicial (Variable)' },
    { id: 'totalInteresesFija', label: 'Total Intereses Pagados (Fija)' },
    { id: 'totalInteresesVariable', label: 'Total Intereses Pagados (Variable)' },
  ],
};

const FaqSchema = () => (
  <script
    type="application/ld+json"
    // Mantén el JSON “self-contained”
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Qué es el diferencial en una hipoteca variable?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'El diferencial es el margen fijo que el banco añade al Euríbor. Si tu hipoteca es "Euríbor + 0,50%", el 0,50% es el diferencial.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Puedo cambiar de variable a fija?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Sí, mediante novación o subrogación. Ambas tienen costes y dependen de las condiciones del mercado.',
            },
          },
        ],
      }),
    }}
  />
);

// --- Chart dinamico ---
const DynamicLineChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data, formatCurrency }: { data: any[]; formatCurrency: (v: number) => string }) => (
        <mod.ResponsiveContainer width="100%" height="100%">
          <mod.LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <mod.CartesianGrid strokeDasharray="3 3" />
            <mod.XAxis dataKey="ano" />
            <mod.YAxis tickFormatter={formatCurrency} />
            <mod.Tooltip formatter={(value: number) => formatCurrency(value)} />
            <mod.Legend />
            <mod.Line type="monotone" dataKey="cuotaFija" name="Cuota Fija" stroke="#8884d8" strokeWidth={2} dot={false} />
            <mod.Line type="monotone" dataKey="cuotaVariable" name="Cuota Variable" stroke="#82ca9d" strokeWidth={2} dot={false} />
          </mod.LineChart>
        </mod.ResponsiveContainer>
      );
      return ChartComponent;
    }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Generando simulación...</div> }
);

// --- Helpers ---
const toNumber = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const clampMin = (n: number, min = 0) => (n < min ? min : n);
const currencyES = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

// --- Componente ---
const SimuladorHipotecaFijaVariable: React.FC = () => {
  const { slug, title, inputs, outputs } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const initialStates: Record<string, any> = {
    montoPrestamo: 180000,
    plazoAnos: 30,
    tipoInteresFijo: 3.0,
    diferencialVariable: 0.6,
    euriborInicial: 3.5,
    escenarioEuribor: 'neutral',
  };
  const [states, setStates] = useState<Record<string, any>>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    // Numerici clampati a >=0 dove ha senso
    if (['montoPrestamo', 'plazoAnos', 'tipoInteresFijo', 'diferencialVariable', 'euriborInicial'].includes(id)) {
      const n = clampMin(toNumber(value));
      setStates((p) => ({ ...p, [id]: n }));
    } else {
      setStates((p) => ({ ...p, [id]: value }));
    }
  };
  const handleReset = () => setStates(initialStates);

  const simulationData = useMemo(() => {
    const Vraw = toNumber(states.montoPrestamo);
    const V = clampMin(Vraw);
    const yearsRaw = toNumber(states.plazoAnos);
    const years = clampMin(Math.floor(yearsRaw));
    const n = years * 12;

    // Guardrail: input impossibili
    if (V <= 0 || years <= 0) {
      return {
        cuotaInicialFija: 0,
        cuotaInicialVariable: 0,
        totalInteresesFija: 0,
        totalInteresesVariable: 0,
        chartData: Array.from({ length: Math.max(1, years) + 1 }, (_, ano) => ({ ano, cuotaFija: 0, cuotaVariable: 0 })),
        warning: 'Introduce un importe y plazo válidos (mayores que 0).',
      };
    }

    // ---- Fija ----
    const iFijoAnual = clampMin(toNumber(states.tipoInteresFijo)) / 100;
    const iFijo = iFijoAnual / 12;
    const cuotaFija = iFijo > 0 ? (V * iFijo) / (1 - Math.pow(1 + iFijo, -n)) : V / n;
    const totalInteresesFija = Math.max(0, cuotaFija * n - V);

    // ---- Variable con revisión anual ----
    let capitalPendiente = V;
    let totalInteresesVariable = 0;
    let euriborActual = toNumber(states.euriborInicial); // puede ser < 0 históricamente

    const diff = clampMin(toNumber(states.diferencialVariable)) / 100;
    const tasaMensual = (E: number) => (Math.max(-0.05, E / 100) + diff) / 12; // capping mínimo razonable (-5% anual) para evitar NaN

    const iVar0 = tasaMensual(euriborActual);
    const cuotaInicialVariable = iVar0 > 0 ? (V * iVar0) / (1 - Math.pow(1 + iVar0, -n)) : V / n;
    let cuotaVariableActual = cuotaInicialVariable;

    const evolucionEuribor = (esc: string, yearIdx: number, cur: number) => {
      switch (esc) {
        case 'optimista': return Math.max(-1.0, cur - 0.25); // puede bajar hasta -1%
        case 'pesimista': return Math.min(8.0, cur + 0.35);
        default: return cur + (yearIdx < 3 ? 0.05 : yearIdx < 8 ? -0.10 : 0.0); // suave subida y corrección
      }
    };

    const chartData: Array<{ ano: number; cuotaFija: number; cuotaVariable: number }> = [];

    for (let ano = 0; ano <= years; ano++) {
      if (ano > 0) {
        euriborActual = evolucionEuribor(states.escenarioEuribor, ano, euriborActual);
        const nRestante = n - ano * 12;
        const iVarNuevo = tasaMensual(euriborActual);

        if (nRestante > 0 && capitalPendiente > 0) {
          cuotaVariableActual =
            iVarNuevo > 0
              ? (capitalPendiente * iVarNuevo) / (1 - Math.pow(1 + iVarNuevo, -nRestante))
              : capitalPendiente / nRestante;
        }
      }

      // 12 meses de pagos o lo que quede
      for (let mes = 1; mes <= 12; mes++) {
        const pagoIndex = ano * 12 + mes;
        if (pagoIndex > n || capitalPendiente <= 0) break;

        const iMes = tasaMensual(euriborActual);
        const interesMes = capitalPendiente * iMes;
        totalInteresesVariable += Math.max(0, interesMes);

        // Última cuota puede necesitar ajuste para no pasar de 0 por redondeos
        const amortizacionTeorica = cuotaVariableActual - interesMes;
        const amortizacionReal = Math.min(amortizacionTeorica, capitalPendiente);
        capitalPendiente = Math.max(0, capitalPendiente - amortizacionReal);
      }

      chartData.push({
        ano,
        cuotaFija: Math.round(cuotaFija * 100) / 100,
        cuotaVariable: Math.round(cuotaVariableActual * 100) / 100,
      });
      if (capitalPendiente <= 0) {
        // rellenamos años restantes con 0 para visual limpio
        for (let k = ano + 1; k <= years; k++) chartData.push({ ano: k, cuotaFija: Math.round(cuotaFija * 100) / 100, cuotaVariable: 0 });
        break;
      }
    }

    return {
      cuotaInicialFija: cuotaFija,
      cuotaInicialVariable: cuotaInicialVariable,
      totalInteresesFija,
      totalInteresesVariable: Math.max(0, totalInteresesVariable),
      chartData,
      warning: '',
    };
  }, [states]);

  const formatCurrency = currencyES;

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
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      // Evita salvar la serie completa para no crecer storage
      const { chartData, ...outputsToSave } = simulationData;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      alert('Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, simulationData, slug, title]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-6">Visualiza el impacto a largo plazo de cada tipo de hipoteca y toma una decisión informada.</p>

              {simulationData.warning && (
                <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                  ⚠️ {simulationData.warning}
                </div>
              )}

              <div className="space-y-6">
                {inputs.map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{group.group}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {group.fields.map((input) => (
                        <div key={input.id}>
                          <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id}>
                            {input.label}
                            {input.tooltip && (
                              <Tooltip text={input.tooltip}>
                                <span className="ml-2 cursor-help">
                                  <InfoIcon />
                                </span>
                              </Tooltip>
                            )}
                          </label>
                          {input.type === 'select' ? (
                            <select
                              id={input.id}
                              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                              value={states[input.id]}
                              onChange={(e) => handleStateChange(input.id, e.target.value)}
                            >
                              {input.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                id={input.id}
                                aria-label={input.label}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={states[input.id]}
                                onChange={(e) => handleStateChange(input.id, e.target.value)}
                              />
                              {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Resultados de la Simulación</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {outputs.map((output) => (
                    <div key={output.id} className={`p-4 rounded-lg ${output.id.includes('Fija') ? 'bg-indigo-50' : 'bg-green-50'}`}>
                      <span className="text-sm text-gray-600 block">{output.label}</span>
                      <span className="text-2xl font-bold text-gray-800">
                        {isClient ? currencyES((simulationData as any)[output.id]) : '...'}
                        {output.id.includes('Cuota') && <span className="text-base font-normal"> /mes</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Evolución de la Cuota Mensual</h2>
            <div className="h-64 w-full">{isClient && <DynamicLineChart data={simulationData.chartData} formatCurrency={currencyES} />}</div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">
                Guardar
              </button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">
                Exportar PDF
              </button>
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">
                Reiniciar
              </button>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
};

export default SimuladorHipotecaFijaVariable;
