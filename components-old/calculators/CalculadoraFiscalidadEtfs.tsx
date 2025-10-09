'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// ---------------------------------------------
// Static Data and Configuration (es-ES, cleaned)
// ---------------------------------------------
const calculatorData = {
  slug: 'calculadora-fiscalidad-etfs',
  category: 'Inversiones y Finanzas',
  title: 'Calculadora de Fiscalidad de ETFs (acumulación vs. distribución)',
  lang: 'es',
  description:
    'Visualiza el impacto de los impuestos en tus ETFs y descubre qué estrategia optimiza tu patrimonio a largo plazo en España.',
  inputs: [
    {
      id: 'inversionInicial',
      label: 'Inversión inicial',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 1000,
      tooltip: 'Capital con el que comienzas la inversión.',
    },
    {
      id: 'aportacionAnual',
      label: 'Aportación anual',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 500,
      tooltip: 'Importe añadido al principio de cada año del horizonte.',
    },
    {
      id: 'horizonteInversion',
      label: 'Horizonte temporal',
      type: 'number' as const,
      unit: 'años',
      min: 1,
      step: 1,
      tooltip: 'Número total de años que mantendrás la inversión.',
    },
    {
      id: 'rentabilidadAnual',
      label: 'Rentabilidad anual bruta',
      type: 'number' as const,
      unit: '%',
      min: 0,
      max: 20,
      step: 0.5,
      tooltip:
        'Rentabilidad media anual esperada del ETF (apreciación + dividendos) antes de comisiones e impuestos.',
    },
    {
      id: 'porcentajeDividendo',
      label: 'Tasa de dividendo',
      type: 'number' as const,
      unit: '%',
      min: 0,
      max: 10,
      step: 0.1,
      tooltip:
        'Del total de la rentabilidad anual, porcentaje que corresponde a dividendos.',
    },
  ],
  outputs: [
    { id: 'valorFinalNetoAcumulacion', label: 'Valor final neto (ETF acumulación)', unit: '€' },
    { id: 'valorFinalNetoDistribucion', label: 'Valor final neto (ETF distribución)', unit: '€' },
    { id: 'ventajaFiscalAcumulacion', label: 'Ventaja fiscal de acumulación', unit: '€' },
    { id: 'totalImpuestosPagadosDistribucion', label: 'Impuestos totales pagados (distribución)', unit: '€' },
    { id: 'totalImpuestosPagadosAcumulacion', label: 'Impuestos totales pagados (acumulación)', unit: '€' },
  ],
  content: `### Introducción

Elegir entre un **ETF de acumulación** y uno de **distribución** impacta directamente en la fiscalidad y en el resultado final. Esta calculadora cuantifica el **“lastre fiscal” (tax drag)** bajo normativa española para comparar ambas estrategias de forma transparente.

### Guía de uso de la calculadora

* **Inversión inicial (€)**: Capital con el que empiezas.
* **Aportación anual (€)**: Importe que añades al principio de cada año.
* **Horizonte temporal (años)**: Duración total de la inversión.
* **Rentabilidad anual bruta (%)**: Suma de apreciación del precio y dividendos.
* **Tasa de dividendo (%)**: Porción de la rentabilidad total que se reparte como dividendo.

### Metodología de cálculo

1. **Tramos del ahorro (IRPF)**: Se aplican los tipos progresivos vigentes sobre rentas del ahorro (dividendos y plusvalías).
2. **ETF de acumulación**: Capital crece con la rentabilidad bruta. Se difieren impuestos hasta la venta final, gravando la plusvalía total.
3. **ETF de distribución**: Cada año el dividendo tributa y el **dividendo neto** se reinvierte. Al final también se tributa por plusvalía. Para el **cálculo de plusvalías**, el **coste de adquisición** incluye inversión inicial, **todas las aportaciones anuales y los dividendos netos reinvertidos**.

**Nota**: La simulación aplica los tipos por tramos al flujo anual de dividendos de forma aislada (aproximación neutra). No contempla compensaciones entre rendimientos del ahorro ni otras rentas del contribuyente.

### Análisis en profundidad: el poder del diferimiento fiscal

El *tax drag* nace de pagar impuestos cada año sobre dividendos (distribución), en vez de difirlos hasta el final (acumulación). A largo plazo, el efecto compuesto del capital **no retirado** para impuestos suele favorecer la acumulación.

### Preguntas frecuentes (FAQ)

**1. ¿Supero 6.000 € de dividendos anuales?**  
Se aplican tipos progresivos por tramos dentro del año simulado.

**2. ¿Incluye comisiones (TER, bróker)?**  
No. Ajusta la rentabilidad bruta restando el TER y considera comisiones de compraventa aparte.

**3. ¿Es igual la fiscalidad para todos los ETFs?**  
La fiscalidad de rentas del ahorro (dividendos y plusvalías) es común. Los **traspasos sin peaje fiscal** aplican a fondos españoles (no a la mayoría de ETFs).`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Supero 6.000 € de dividendos anuales?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Se aplican tipos progresivos por tramos dentro del año simulado.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Incluye comisiones (TER, bróker)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Ajusta la rentabilidad bruta restando el TER y considera comisiones de compraventa aparte.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Es igual la fiscalidad para todos los ETFs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La fiscalidad de las rentas del ahorro es común; los traspasos sin peaje fiscal aplican a fondos españoles, no a la mayoría de ETFs.',
        },
      },
    ],
  },
};

// ---------------------------
// Dynamic Chart (SSR-safe)
// ---------------------------
const DynamicLineChart = dynamic(
  async () => {
    const mod = await import('recharts');
    const {
      ResponsiveContainer,
      LineChart,
      CartesianGrid,
      XAxis,
      YAxis,
      Tooltip,
      Legend,
      Line,
    } = mod as any;

    const Chart: React.FC<{ data: any[] }> = ({ data }) => (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="año" />
          <YAxis tickFormatter={(v: number) => `€${Math.round(v / 1000)}k`} />
          <Tooltip formatter={(v: number) => formatCurrency(Number(v))} />
          <Legend />
          <Line type="monotone" dataKey="Acumulación" stroke="#4f46e5" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Distribución" stroke="#dc2626" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
    return Chart;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
        Cargando gráfico...
      </div>
    ),
  }
);

// ---------------------------
// Helper UI
// ---------------------------
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

const TooltipUI = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = () => (
  <script
    type="application/ld+json"
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }}
  />
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');

  const blocks = content.split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const t = block.trim();
        if (!t) return null;
        if (t.startsWith('### '))
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(t.replace('### ', '')) }}
            />
          );
        if (t.startsWith('* '))
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {t.split('\n').map((item, i) => (
                <li
                  key={i}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: processInlineFormatting(item.replace(/^\*\s*/, '')),
                  }}
                />
              ))}
            </ul>
          );
        if (/^\d\.\s/.test(t))
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {t.split('\n').map((item, i) => (
                <li
                  key={i}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')),
                  }}
                />
              ))}
            </ol>
          );
        return (
          <p
            key={index}
            className="mb-4"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: processInlineFormatting(t) }}
          />
        );
      })}
    </div>
  );
};

// ---------------------------
// Core Calculation Utilities
// ---------------------------

/**
 * IRPF - Rentas del Ahorro (2025):
 *  0–6.000€: 19%
 *  6.000–50.000€: 21%
 *  50.000–200.000€: 23%
 *  200.000–300.000€: 27%
 *  >300.000€: 30%
 *
 * Nota: aquí se aplica por simplicidad sobre el flujo anual simulado.
 */
const calculateSavingsTax = (amount: number): number => {
  if (amount <= 0 || !isFinite(amount)) return 0;

  let base = amount;
  let tax = 0;

  const apply = (limit: number, rate: number) => {
    const slice = Math.max(0, Math.min(base, limit));
    tax += slice * rate;
    base -= slice;
  };

  apply(6000, 0.19);
  apply(44000, 0.21); // 50.000 - 6.000
  apply(150000, 0.23); // 200.000 - 50.000
  apply(100000, 0.27); // 300.000 - 200.000
  if (base > 0) tax += base * 0.30;

  return tax;
};

const clamp = (v: number, min?: number, max?: number) => {
  if (!isFinite(v)) return 0;
  if (min != null && v < min) return min;
  if (max != null && v > max) return max;
  return v;
};

const parseNum = (raw: string) => (raw === '' ? '' : Number(raw));

// ---------------------------
// Main Component
// ---------------------------
type State = {
  inversionInicial: number | '';
  aportacionAnual: number | '';
  horizonteInversion: number | '';
  rentabilidadAnual: number | '';
  porcentajeDividendo: number | '';
};

const initialStates: State = {
  inversionInicial: 10000,
  aportacionAnual: 5000,
  horizonteInversion: 20,
  rentabilidadAnual: 7,
  porcentajeDividendo: 2,
};

const CalculadoraFiscalidadEtfs: React.FC = () => {
  const { slug, title, description, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [states, setStates] = useState<State>(initialStates);

  const handleStateChange = (id: keyof State, value: any) => {
    setStates((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => setStates(initialStates);

  const { calculatedOutputs, chartData } = useMemo(() => {
    const invIni = Number(states.inversionInicial || 0);
    const aportAnual = Number(states.aportacionAnual || 0);
    const N = Math.max(0, Math.floor(Number(states.horizonteInversion || 0)));
    const R = Number(states.rentabilidadAnual || 0) / 100;
    const D = Number(states.porcentajeDividendo || 0) / 100;
    const C = Math.max(0, R - D); // tasa de apreciación del precio (no negativa)

    // Capitales iniciales
    let capAcum = invIni;
    let capDist = invIni;

    // Seguimiento de impuestos
    let impuestosDividendoAcum = 0;
    let impuestosDividendoDist = 0;

    // Muy importante: para distribución, el coste de adquisición incluye
    // inversión inicial + TODAS las aportaciones + dividendos netos reinvertidos.
    let dividendosNetosReinvertidos = 0;

    const chart: Array<{ año: number; Acumulación: number; Distribución: number }> = [
      { año: 0, Acumulación: invIni, Distribución: invIni },
    ];

    for (let i = 1; i <= N; i++) {
      // Aportación al inicio de cada año
      capAcum += aportAnual;
      capDist += aportAnual;

      // --- Acumulación ---
      capAcum *= 1 + R;

      // --- Distribución ---
      // Dividendo del año sobre capital al inicio del año (tras aportar)
      const dividendoBruto = capDist * D;
      const impuestoDiv = calculateSavingsTax(dividendoBruto);
      const dividendoNeto = dividendoBruto - impuestoDiv;

      impuestosDividendoDist += impuestoDiv;
      dividendosNetosReinvertidos += Math.max(0, dividendoNeto);

      // Apreciación de precio + reinversión del dividendo neto
      capDist = capDist * (1 + C) + Math.max(0, dividendoNeto);

      chart.push({
        año: i,
        Acumulación: Math.round(capAcum),
        Distribución: Math.round(capDist),
      });
    }

    // Total aportado (aportaciones anuales incluidas los N años)
    const totalAportado = invIni + aportAnual * N;

    // Venta final: plusvalía
    const plusvaliaAcum = capAcum - totalAportado;
    const impuestoFinalAcum = calculateSavingsTax(plusvaliaAcum);
    const valorFinalNetoAcum = capAcum - impuestoFinalAcum;

    // En distribución, la base de coste incluye la reinversión de dividendos netos
    const baseCosteDist = totalAportado + dividendosNetosReinvertidos;
    const plusvaliaDist = capDist - baseCosteDist;
    const impuestoFinalDist = calculateSavingsTax(plusvaliaDist);
    const valorFinalNetoDist = capDist - impuestoFinalDist;

    const totalImpuestosAcum = impuestoFinalAcum + impuestosDividendoAcum; // (acum no paga dividendos)
    const totalImpuestosDist = impuestosDividendoDist + impuestoFinalDist;

    const ventajaFiscalAcumulacion = valorFinalNetoAcum - valorFinalNetoDist;

    return {
      calculatedOutputs: {
        valorFinalNetoAcumulacion: valorFinalNetoAcum,
        valorFinalNetoDistribucion: valorFinalNetoDist,
        ventajaFiscalAcumulacion,
        totalImpuestosPagadosDistribucion: totalImpuestosDist,
        totalImpuestosPagadosAcumulacion: totalImpuestosAcum,
      },
      chartData: chart,
    };
  }, [states]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (calculatorRef.current) {
        const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${calculatorData.slug}.pdf`);
      }
    } catch (error) {
      alert('Error al exportar a PDF. Intente de nuevo.');
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, []);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = {
        slug: calculatorData.slug,
        title: calculatorData.title,
        inputs: states,
        outputs: calculatedOutputs,
        ts: Date.now(),
      };
      const existingResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      const newResults = [payload, ...existingResults].slice(0, 50);
      localStorage.setItem('calc_results', JSON.stringify(newResults));
      alert('Resultado guardado correctamente.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {calculatorData.inputs.map((input) => (
                <div key={input.id}>
                  <label
                    className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                    htmlFor={input.id}
                  >
                    {input.label}
                    {'tooltip' in input && input.tooltip ? (
                      <TooltipUI text={input.tooltip}>
                        <span className="ml-2">
                          <InfoIcon />
                        </span>
                      </TooltipUI>
                    ) : null}
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      id={input.id}
                      aria-label={input.label}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      type="number"
                      min={input.min as number | undefined}
                      max={(input as any).max as number | undefined}
                      step={input.step}
                      value={states[input.id as keyof State]}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') return handleStateChange(input.id as keyof State, '');
                        let v = parseNum(raw) as number;
                        v = clamp(
                          v,
                          (input as any).min as number | undefined,
                          (input as any).max as number | undefined
                        );
                        handleStateChange(input.id as keyof State, v);
                      }}
                    />
                    {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados de la simulación</h2>
              {calculatorData.outputs.map((output) => (
                <div
                  key={output.id}
                  className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                    output.id === 'ventajaFiscalAcumulacion'
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="text-sm md:text-base font-medium text-gray-700">
                    {output.label}
                  </div>
                  <div
                    className={`text-xl md:text-2xl font-bold ${
                      output.id === 'ventajaFiscalAcumulacion' ? 'text-indigo-600' : 'text-gray-800'
                    }`}
                  >
                    <span>
                      {isClient
                        ? formatCurrency((calculatedOutputs as any)[output.id])
                        : '...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Proyección de crecimiento</h3>
              {isClient && <DynamicLineChart data={chartData} />}
            </div>
          </div>
        </div>

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
                className="col-span-2 w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Análisis y metodología</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria — IRPF (base del ahorro)
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 35/2006, del IRPF
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraFiscalidadEtfs;
