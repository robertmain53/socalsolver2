'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Icona & Tooltip ---

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="text-gray-400"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati ---

const calculatorData = {
  slug: "calculadora-plusvalia-municipal",
  category: "Bienes Raíces y Vivienda",
  title: "Calculadora de Plusvalía Municipal (IIVTNU)",
  lang: "es",
  tags: "calculadora plusvalia municipal, iivtnu, plusvalia ayuntamiento, calcular plusvalia venta piso, impuesto plusvalia, plusvalia real, plusvalia objetiva, real decreto 26/2021",
  coefficients: {
    "1": 0.14, "2": 0.13, "3": 0.15, "4": 0.17, "5": 0.17,
    "6": 0.16, "7": 0.12, "8": 0.10, "9": 0.09, "10": 0.08,
    "11": 0.08, "12": 0.08, "13": 0.08, "14": 0.10, "15": 0.12,
    "16": 0.16, "17": 0.20, "18": 0.26, "19": 0.36, "20": 0.45
  },
  inputs: [
    { id: "fechaAdquisicion", label: "Fecha de adquisición", type: "date" as const, tooltip: "Fecha en la que compraste o heredaste el inmueble." },
    { id: "fechaTransmision", label: "Fecha de transmisión", type: "date" as const, tooltip: "Fecha en la que vendes o donas el inmueble." },
    { id: "valorAdquisicion", label: "Valor de adquisición", type: "number" as const, unit: "€", tooltip: "Precio que pagaste por el inmueble en su día." },
    { id: "valorTransmision", label: "Valor de transmisión", type: "number" as const, unit: "€", tooltip: "Precio por el que vendes el inmueble ahora." },
    { id: "valorCatastralSuelo", label: "Valor catastral del SUELO", type: "number" as const, unit: "€", tooltip: "Lo encontrarás en el último recibo del IBI. Es solo el valor del suelo, no el total." },
    { id: "valorCatastralTotal", label: "Valor catastral TOTAL", type: "number" as const, unit: "€", tooltip: "El valor catastral completo del inmueble (suelo + construcción), también en el recibo del IBI." },
    { id: "tipoImpositivo", label: "Tipo impositivo de tu ayuntamiento", type: "number" as const, unit: "%", min: 0, max: 30, step: 0.1, tooltip: "Porcentaje que aplica tu ayuntamiento a la base imponible. Búscalo en la ordenanza fiscal municipal. El máximo legal es el 30%." }
  ],
  outputs: [
    { id: "resultadoMetodoObjetivo", label: "Cuota a pagar (Método Objetivo)" },
    { id: "resultadoMetodoReal", label: "Cuota a pagar (Método Real)" },
    { id: "cuotaFinal", label: "Importe final a liquidar (el más bajo)" }
  ],
  content: `### Introduzione: Calcola la Tua Plusvalenza Municipale Aggiornata al 2024

L'Imposta sull'Incremento del Valore dei Terreni di Natura Urbana (IIVTNU)... (omesso qui per brevità, tieni il tuo testo originale)`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Tengo que pagar la plusvalía si he vendido mi casa con pérdidas?", "acceptedAnswer": { "@type": "Answer", "text": "No. ..."} },
      { "@type": "Question", "name": "¿Qué método de cálculo me conviene más?", "acceptedAnswer": { "@type": "Answer", "text": "No hay una regla fija..."} },
      { "@type": "Question", "name": "¿Quién paga la plusvalía, el comprador o el vendedor?", "acceptedAnswer": { "@type": "Answer", "text": "En una compraventa, la paga siempre el vendedor..."} }
    ]
  }
} as const;

const FaqSchema = () => (
  <script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }}
  />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index}
              className="text-xl font-bold mt-6 mb-4 text-gray-800"
              dangerouslySetInnerHTML={{ __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h4 key={index}
              className="text-lg font-semibold mt-4 mb-3 text-gray-700"
              dangerouslySetInnerHTML={{ __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        );
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li key={i} className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
        return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{listItems}</ul>;
      }
      return (
        <p key={index} className="mb-4 leading-relaxed"
           dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      );
    });
  };
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

// --- Helpers ---

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const toNumber = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const formatEUR = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(toNumber(v));

const parseDateOrNull = (s: string | undefined): Date | null => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const yearsBetween = (from: Date, to: Date): number => {
  // anni interi trascorsi (floor)
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
};

// --- Grafico dinamico ---

const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
  const ChartComponent = ({ data, formatCurrency }: { data: any[], formatCurrency: (value: number) => string }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <mod.XAxis type="number" tickFormatter={formatCurrency} />
        <mod.YAxis type="category" dataKey="name" width={120} />
        <mod.Tooltip formatter={(value: number) => formatCurrency(value)} />
        <mod.Bar dataKey="cuota" fill="#3b82f6" name="Cuota a Pagar" />
      </mod.BarChart>
    </mod.ResponsiveContainer>
  );
  return ChartComponent;
}), { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div> });

// --- Componente principale ---

const CalculadoraPlusvaliaMunicipal: React.FC = () => {
  const { slug, title, inputs, outputs, content, coefficients } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const today = new Date().toISOString().split('T')[0];
  const fiveYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0];

  type State = {
    fechaAdquisicion: string;
    fechaTransmision: string;
    valorAdquisicion: number | string;
    valorTransmision: number | string;
    valorCatastralSuelo: number | string;
    valorCatastralTotal: number | string;
    tipoImpositivo: number | string;
  };

  const initialStates: State = {
    fechaAdquisicion: fiveYearsAgo,
    fechaTransmision: today,
    valorAdquisicion: 180000,
    valorTransmision: 240000,
    valorCatastralSuelo: 70000,
    valorCatastralTotal: 150000,
    tipoImpositivo: 28,
  };

  const [states, setStates] = useState<State>(initialStates);

  const handleStateChange = (id: keyof State, value: any) => {
    // per number fields, manteniamo stringa ma calcoliamo sempre con toNumber
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => setStates(initialStates);

  const {
    resultadoMetodoObjetivo,
    resultadoMetodoReal,
    cuotaFinal,
    noHayGanancia,
    hasInputError,
    inputErrorMsg
  } = useMemo(() => {
    const dateAdq = parseDateOrNull(states.fechaAdquisicion);
    const dateTrans = parseDateOrNull(states.fechaTransmision);

    // Numeri (NaN-safe)
    const vAdq = toNumber(states.valorAdquisicion);
    const vTrans = toNumber(states.valorTransmision);
    const vCatSuelo = toNumber(states.valorCatastralSuelo);
    const vCatTotalRaw = toNumber(states.valorCatastralTotal);
    const tipoImpPct = clamp(toNumber(states.tipoImpositivo), 0, 30); // 0..30%
    const tipoImp = tipoImpPct / 100;

    // Validazioni base
    if (!dateAdq || !dateTrans) {
      return { resultadoMetodoObjetivo: 0, resultadoMetodoReal: 0, cuotaFinal: 0, noHayGanancia: false, hasInputError: true, inputErrorMsg: 'Fechas inválidas.' };
    }
    if (dateAdq > dateTrans) {
      return { resultadoMetodoObjetivo: 0, resultadoMetodoReal: 0, cuotaFinal: 0, noHayGanancia: false, hasInputError: true, inputErrorMsg: 'La fecha de adquisición no puede ser posterior a la de transmisión.' };
    }
    if (vCatSuelo <= 0) {
      return { resultadoMetodoObjetivo: 0, resultadoMetodoReal: 0, cuotaFinal: 0, noHayGanancia: false, hasInputError: true, inputErrorMsg: 'El valor catastral del suelo debe ser mayor que 0.' };
    }
    if (vCatTotalRaw <= 0) {
      return { resultadoMetodoObjetivo: 0, resultadoMetodoReal: 0, cuotaFinal: 0, noHayGanancia: false, hasInputError: true, inputErrorMsg: 'El valor catastral TOTAL debe ser mayor que 0.' };
    }

    // Calcolo anni & coefficienti
    const yearsRaw = yearsBetween(dateAdq, dateTrans);
    const yearsCapped = clamp(yearsRaw, 1, 20);
    const coefficient = coefficients[String(yearsCapped) as keyof typeof coefficients] ?? 0;

    // Metodo Objetivo
    const baseImponibleObjetivo = vCatSuelo * coefficient;
    const resultadoMetodoObjetivo = Math.max(0, baseImponibleObjetivo * tipoImp);

    // Metodo Real
    const gananciaReal = vTrans - vAdq;
    const noHayGanancia = gananciaReal <= 0;

    // percentuale suolo (clamp 0..1 per protezione dati incongruenti)
    const vCatTotal = Math.max(vCatTotalRaw, vCatSuelo); // evita rapporto >1
    const porcentajeSuelo = clamp(vCatSuelo / vCatTotal, 0, 1);

    let resultadoMetodoReal = 0;
    if (!noHayGanancia) {
      const baseImponibleReal = Math.max(0, gananciaReal * porcentajeSuelo);
      resultadoMetodoReal = Math.max(0, baseImponibleReal * tipoImp);
    }

    // Risultato finale (più basso)
    const cuotaFinal = noHayGanancia ? 0 : Math.min(resultadoMetodoObjetivo, resultadoMetodoReal);

    return { resultadoMetodoObjetivo, resultadoMetodoReal, cuotaFinal, noHayGanancia, hasInputError: false, inputErrorMsg: '' };
  }, [states, coefficients]);

  const chartData = useMemo(() => ([
    { name: 'Método Objetivo', cuota: resultadoMetodoObjetivo },
    { name: 'Método Real', cuota: resultadoMetodoReal }
  ]), [resultadoMetodoObjetivo, resultadoMetodoReal]);

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
      pdf.save(`${calculatorData.slug}.pdf`);
    } catch {
      alert('Error al exportar a PDF.');
    }
  }, []);

  const saveResult = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const payload = {
        slug: calculatorData.slug,
        title: calculatorData.title,
        inputs: states,
        outputs: { resultadoMetodoObjetivo, resultadoMetodoReal, cuotaFinal, noHayGanancia },
        ts: Date.now()
      };
      const prev = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...prev].slice(0, 50)));
      alert('Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, resultadoMetodoObjetivo, resultadoMetodoReal, cuotaFinal, noHayGanancia]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Calcula la plusvalía con los dos métodos legales y elige el más favorable.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {calculatorData.inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && (
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2 cursor-help"><InfoIcon /></span>
                        </Tooltip>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        type={input.type}
                        value={states[input.id as keyof State] as any}
                        onChange={e => handleStateChange(input.id as keyof State, e.target.value)}
                        min={(input as any).min}
                        max={(input as any).max}
                        step={(input as any).step}
                      />
                      {('unit' in input) && (input as any).unit && (
                        <span className="text-sm text-gray-500">{(input as any).unit}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                {hasInputError && (
                  <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-4">
                    <strong>Revisa los datos:</strong> {inputErrorMsg}
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del Cálculo</h2>

                {(!hasInputError && noHayGanancia) ? (
                  <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-md p-4">
                    <strong>¡No hay que pagar!</strong> Según los datos introducidos, no ha habido un incremento de valor real del terreno, por lo que la operación no está sujeta a este impuesto.
                  </div>
                ) : (
                  !hasInputError && (
                    <>
                      {calculatorData.outputs.map(output => (
                        <div key={output.id}
                             className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'cuotaFinal' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                          <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                          <span className={`text-xl md:text-2xl font-bold ${output.id === 'cuotaFinal' ? 'text-indigo-600' : 'text-gray-800'}`}>
                            {isClient ? formatEUR(({
                              resultadoMetodoObjetivo,
                              resultadoMetodoReal,
                              cuotaFinal
                            } as any)[output.id]) : '...'}
                          </span>
                        </div>
                      ))}
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Comparativa de Métodos</h2>
            <div className="h-48 w-full">
              {isClient && !hasInputError && !noHayGanancia && (
                <DynamicBarChart data={chartData} formatCurrency={formatEUR} />
              )}
              {isClient && (hasInputError || noHayGanancia) && (
                <div className="text-xs text-gray-600">
                  {hasInputError
                    ? 'Introduce datos válidos para ver la comparativa.'
                    : 'No hay comparativa porque no se devenga el impuesto.'}
                </div>
              )}
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Reiniciar</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía sobre la Plusvalía Municipal</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2021-18276" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Real Decreto-ley 26/2021</a></li>
              <li><a href="https://www.catastro.meh.es/" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Sede Electrónica del Catastro</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraPlusvaliaMunicipal;
