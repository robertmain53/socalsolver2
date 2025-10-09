'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Icone & Tooltip ---

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
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

// --- Dati ---

type Module = { id: string; label: string; unit: string; index: number };

const calculatorData = {
  slug: 'calculadora-irpf-agricultores-ganaderos',
  category: 'Impuestos y trabajo autonomo',
  title: 'Calculadora de IRPF para agricultores y ganaderos (régimen especial)',
  lang: 'es',
  tags: 'calculadora irpf modulos, estimacion objetiva, regimen especial agrario, reagyp, impuestos agricultores, irpf ganaderos, indices agrarios, modelo 131',
  modules: [
    { id: 'trigo', label: 'Trigo y cebada (secano)', unit: 'hectáreas', index: 99 },
    { id: 'olivar', label: 'Olivar (aceite)', unit: 'hectáreas', index: 122 },
    { id: 'vacunoLeche', label: 'Bovino de leche', unit: 'cabezas', index: 218 },
    { id: 'porcinoCebo', label: 'Porcino de cebo', unit: 'cabezas', index: 33 },
  ] as Module[],
  // Nuovi input per precisione del 131
  inputs: [
    {
      id: 'ingresosTrimestrales',
      label: 'Ingresos del trimestre (reales)',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip: 'Importe real del trimestre. Se usa para el pago fraccionado (2% Modelo 131). Si lo dejas vacío/0, se estimará con ingresos anuales / 4.',
    },
    {
      id: 'ingresosTotales',
      label: 'Ingresos totales del año anterior',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 1000,
      tooltip: 'Solo para estimar el trimestre si no informas ingresos reales.',
    },
    {
      id: 'ventasConRetencionTrimestre',
      label: 'Ingresos del trimestre con retención IRPF',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip: 'Parte de los ingresos trimestrales facturados a empresas con retención IRPF.',
    },
    {
      id: 'porcentajeRetencionAgraria',
      label: 'Tipo de retención agraria aplicado',
      type: 'select' as const,
      options: [
        { value: 2, label: '2% (General agrario/ganadero)' },
        { value: 1, label: '1% (Engorde porcino y avícola)' },
      ],
      tooltip: 'Tipo de retención IRPF aplicable sobre las ventas con retención.',
    },
    {
      id: 'indiceJovenAgricultor',
      label: '¿Eres un joven agricultor?',
      type: 'boolean' as const,
      tooltip: 'Reducción del 25% sobre el rendimiento neto previo (si procede).',
    },
  ],
  outputs: [
    { id: 'rendimientoPrevio', label: 'Rendimiento Neto Previo (Suma de Módulos)', unit: '€' },
    { id: 'rendimientoNetoFinal', label: 'Rendimiento Neto Final Anual (Base Imponible)', unit: '€' },
    { id: 'pagoFraccionadoTrimestral', label: 'Pago Fraccionado Trimestral (Modelo 131)', unit: '€' },
  ],
  content:
    '### Introducción rápida\nEsta calculadora orientativa aplica módulos (€/unidad) para estimar el **rendimiento neto anual** y calcula el **Modelo 131** como el **2% de los ingresos reales del trimestre**, menos las **retenciones IRPF** efectivamente soportadas ese trimestre.',
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo se calcula el Modelo 131 en actividades agrarias por módulos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Como regla general, el pago fraccionado es el 2% de los ingresos reales del trimestre, del que se restan las retenciones IRPF practicadas.',
        },
      },
    ],
  },
};

const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h3
            key={index}
            className="text-xl font-bold mt-6 mb-4 text-gray-800"
            dangerouslySetInnerHTML={{ __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h4
            key={index}
            className="text-lg font-semibold mt-4 mb-3 text-gray-700"
            dangerouslySetInnerHTML={{ __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li
            key={i}
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        ));
        return (
          <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
            {listItems}
          </ul>
        );
      }
      return (
        <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      );
    });
  };
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

// --- Grafico dinamico ---

const DynamicChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data, formatCurrency }: { data: any[]; formatCurrency: (value: number) => string }) => (
        <mod.ResponsiveContainer width="100%" height="100%">
          <mod.BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <mod.XAxis dataKey="name" />
            <mod.YAxis />
            <mod.Tooltip formatter={(value: number) => formatCurrency(value)} />
            <mod.Bar dataKey="value" name="Importe (€)" fill="#8884d8" />
          </mod.BarChart>
        </mod.ResponsiveContainer>
      );
      return ChartComponent;
    }),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div>,
  }
);

// --- Componente principale ---

type States = Record<string, number | boolean>;

const CalculadoraIrpfAgricultoresGanaderos: React.FC = () => {
  const { slug, title, modules, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Stati iniziali
  const moduleInitialStates = modules.reduce<Record<string, number>>((acc, mod) => {
    acc[mod.id] = 0;
    return acc;
  }, {});
  const initialStates: States = {
    ...moduleInitialStates,
    ingresosTrimestrales: 0,
    ingresosTotales: 50000,
    ventasConRetencionTrimestre: 0,
    porcentajeRetencionAgraria: 2,
    indiceJovenAgricultor: false,
  };

  const [states, setStates] = useState<States>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    // Normalizza numeri/boolean
    if (typeof value === 'boolean') {
      setStates((prev) => ({ ...prev, [id]: value }));
      return;
    }
    // gli input "number" arrivano come stringhe -> converti
    const num = value === '' ? 0 : Number(value);
    setStates((prev) => ({ ...prev, [id]: Number.isFinite(num) ? num : 0 }));
  };

  const handleReset = () => setStates(initialStates);

  // Calcoli
  const calculatedOutputs = useMemo(() => {
    // 1) Rendimiento previo por módulos (€/unidad * unidades)
    const rendimientoPrevio = modules.reduce((acc, mod) => {
      const units = Number(states[mod.id]) || 0;
      return acc + units * mod.index;
    }, 0);

    // 2) Joven agricultor (-25%)
    const rendimientoNetoFinal = (states.indiceJovenAgricultor ? 0.75 : 1) * rendimientoPrevio;

    // 3) Modelo 131 (trimestral)
    const ingresosTrimestre =
      (Number(states.ingresosTrimestrales) || 0) > 0
        ? Number(states.ingresosTrimestrales)
        : (Number(states.ingresosTotales) || 0) / 4;

    // Pago previo 2% del trimestre
    const pagoPrevio = Math.max(0, ingresosTrimestre * 0.02);

    // Retenciones IRPF efectivas del trimestre (ventas con retención * tipo)
    const ventasConRet = Number(states.ventasConRetencionTrimestre) || 0;
    const tipoRet = (Number(states.porcentajeRetencionAgraria) || 0) / 100;
    const retencionesTrimestre = Math.max(0, ventasConRet * tipoRet);

    const pagoFraccionadoTrimestral = Math.max(0, pagoPrevio - retencionesTrimestre);

    return { rendimientoPrevio, rendimientoNetoFinal, pagoFraccionadoTrimestral };
  }, [states, modules]);

  const chartData = useMemo(
    () => [
      { name: 'Rendimiento anual', value: calculatedOutputs.rendimientoNetoFinal },
      { name: 'Pago fraccionado T', value: calculatedOutputs.pagoFraccionadoTrimestral },
    ],
    [calculatedOutputs]
  );

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

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
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      alert('Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Estimación de rendimiento anual (módulos) y pago fraccionado trimestral (Modelo 131).</p>

              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Importante:</strong> Esta calculadora es orientativa para el régimen de <strong>estimación objetiva (módulos)</strong>. El pago fraccionado del Modelo 131 se calcula como el
                <strong> 2% de los ingresos reales del trimestre</strong>, menos <strong>retenciones IRPF efectivas</strong> (p. ej., 2% general agrario). La compensación REAGYP es de IVA y no afecta al 131.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                <h3 className="md:col-span-2 text-lg font-semibold text-gray-700">1. Define tus Módulos (€/unidad)</h3>
                {modules.map((mod) => (
                  <div key={mod.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={mod.id}>
                      {mod.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={mod.id}
                        aria-label={mod.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min={0}
                        value={String(states[mod.id] ?? 0)}
                        onChange={(e) => handleStateChange(mod.id, e.target.value)}
                      />
                      <span className="text-sm text-gray-500">{mod.unit}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Índice: {formatCurrency(mod.index)} / {mod.unit.replace(/s$/, '')}</div>
                  </div>
                ))}

                <h3 className="md:col-span-2 text-lg font-semibold text-gray-700 mt-4">2. Ajustes y Datos del Trimestre</h3>
                {inputs.map((input) => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && (
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2 cursor-help">
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      )}
                    </label>
                    {input.type === 'boolean' ? (
                      <input
                        id={input.id}
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={Boolean(states[input.id])}
                        onChange={(e) => handleStateChange(input.id, e.target.checked)}
                      />
                    ) : input.type === 'select' ? (
                      <select
                        id={input.id}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        value={String(states[input.id] ?? '')}
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
                          min={input.min ?? 0}
                          step={input.step ?? 'any'}
                          value={String(states[input.id] ?? 0)}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados Estimados</h2>
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                      output.id === 'pagoFraccionadoTrimestral' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span className={`text-xl md:text-2xl font-bold ${output.id === 'pagoFraccionadoTrimestral' ? 'text-indigo-600' : 'text-gray-800'}`}>
                      {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualización de Resultados</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && <DynamicChart data={chartData} formatCurrency={formatCurrency} />}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={saveResult}
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
                className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reiniciar
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía del Régimen Agrario</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024.html"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Manual práctico IRPF
                </a>
              </li>
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/iva/regimen-especial-agricultura-ganaderia-pesca.html"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Régimen Especial IVA (REAGYP)
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfAgricultoresGanaderos;
