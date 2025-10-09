'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* ---------------------------------------------
   Small UI helpers (fixes the Tooltip not found)
---------------------------------------------- */

// Inline info icon for tooltips
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
    aria-hidden="true"
    className="text-gray-400"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// Accessible tooltip (appears on hover/focus)
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <span className="relative inline-flex items-center group">
    {children}
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-pre-line rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
    >
      {text}
    </span>
  </span>
);

/* ----------------
   Utility helpers
----------------- */
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const toNumber = (raw: string | number): number => {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

/* -------------
   Type models
-------------- */
type Bracket =
  | { upTo: number; rate: number }
  | { over: number; rate: number };

type GroupField =
  | { id: 'valorTransmision' | 'valorAdquisicion' | 'gastosHerencia' | 'gastosVenta'; label: string; type: 'number'; unit?: string; tooltip?: string }
  | { id: 'esAnterior1995'; label: string; type: 'boolean'; tooltip?: string };

type InputGroup = { group: string; fields: GroupField[] };
type OutputId = 'valorAdquisicionActualizado' | 'gananciaPatrimonial' | 'impuestoIRPF';

type CalculatorData = {
  slug: string;
  category: string;
  title: string;
  lang: 'es';
  tags: string;
  taxBrackets: Bracket[];
  inputs: InputGroup[];
  outputs: { id: OutputId; label: string }[];
  content: string;
  seoSchema: Record<string, any>;
};

/* ---------------------------------------
   Self-contained dataset / configuration
---------------------------------------- */
const calculatorData: CalculatorData = {
  slug: 'calculadora-impuestos-venta-vivienda-heredada',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Impuestos por Venta de Vivienda Heredada',
  lang: 'es',
  tags:
    'calculadora irpf venta vivienda heredada, ganancia patrimonial herencia, impuesto sucesiones, plusvalia municipal herencia, valor de adquisicion herencia, gastos deducibles venta piso heredado',
  taxBrackets: [
    { upTo: 6000, rate: 19 },
    { upTo: 50000, rate: 21 },
    { upTo: 200000, rate: 23 },
    { upTo: 300000, rate: 27 },
    { over: 300000, rate: 28 },
  ],
  inputs: [
    {
      group: '1. Valores de la Transmisión',
      fields: [
        { id: 'valorTransmision', label: 'Valor de Venta del Inmueble', type: 'number', unit: '€', tooltip: 'El precio final por el que has vendido la vivienda.' },
        { id: 'valorAdquisicion', label: 'Valor de Adquisición (en la herencia)', type: 'number', unit: '€', tooltip: 'Valor declarado en el Impuesto de Sucesiones.' },
      ],
    },
    {
      group: '2. Gastos Deducibles Asociados',
      fields: [
        { id: 'gastosHerencia', label: 'Gastos y Tributos de la Herencia', type: 'number', unit: '€', tooltip: 'ISD, plusvalía de la herencia, notaría y registro de la adjudicación.' },
        { id: 'gastosVenta', label: 'Gastos y Tributos de la Venta', type: 'number', unit: '€', tooltip: 'Plusvalía municipal de la venta, comisión inmobiliaria, etc.' },
      ],
    },
    {
      group: '3. Coeficientes (Opcional, para viviendas antiguas)',
      fields: [{ id: 'esAnterior1995', label: '¿Adquirió el fallecido la vivienda antes del 31/12/1994?', type: 'boolean', tooltip: 'Podrías tener reducción fiscal (estimación orientativa).' }],
    },
  ],
  outputs: [
    { id: 'valorAdquisicionActualizado', label: 'Valor de Adquisición Actualizado' },
    { id: 'gananciaPatrimonial', label: 'Ganancia Patrimonial Neta (Base Imponible)' },
    { id: 'impuestoIRPF', label: 'Impuesto a Pagar en la Renta (IRPF)' },
  ],
  content: `### Introduzione: Calcola le Tasse sulla Vendita di una Casa Ereditata
...`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [],
  },
};

/* --------------
   SEO schema
--------------- */
const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

/* ------------------------
   Simple content renderer
------------------------- */
const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () =>
    content.split('\n\n').map((paragraph, index) => {
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
          <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
        return (
          <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
            {listItems}
          </ul>
        );
      }
      return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

/* -------------------------
   Dynamic mini bar chart
-------------------------- */
const DynamicBarChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data, formatCurrency }: { data: any[]; formatCurrency: (value: number) => string }) => (
        <mod.ResponsiveContainer width="100%" height="100%">
          <mod.BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <mod.XAxis type="number" hide />
            <mod.YAxis type="category" dataKey="name" hide />
            <mod.Tooltip formatter={(value: number) => formatCurrency(value)} />
            <mod.Bar dataKey="adquisicion" stackId="a" name="Valor de Adquisición Actualizado" />
            <mod.Bar dataKey="ganancia" stackId="a" name="Ganancia Patrimonial" />
            <mod.Bar dataKey="impuestos" stackId="a" name="Impuestos (IRPF)" />
          </mod.BarChart>
        </mod.ResponsiveContainer>
      );
      return ChartComponent;
    }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div> },
);

/* -------------
   Main view
-------------- */
const CalculadoraImpuestosVentaViviendaHeredada: React.FC = () => {
  const { slug, title, inputs, outputs, content, taxBrackets } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // Initial state
  const initialStates = {
    valorTransmision: 280000,
    valorAdquisicion: 150000,
    gastosHerencia: 12000,
    gastosVenta: 15000,
    esAnterior1995: false,
  };
  const [states, setStates] = useState<typeof initialStates>(initialStates);

  // Input handling
  const handleStateChange = (id: keyof typeof initialStates, value: string | number | boolean) => {
    if (typeof value === 'boolean') {
      setStates((p) => ({ ...p, [id]: value }));
      return;
    }
    const n = clamp(Math.round(toNumber(value as string)), 0, 10_000_000_000);
    setStates((p) => ({ ...p, [id]: n }));
  };

  const handleReset = () => setStates(initialStates);

  // ---- Calculations ----
  const calculated = useMemo(() => {
    const vTransmision = states.valorTransmision;
    const vAdquisicion = states.valorAdquisicion;
    const gHerencia = states.gastosHerencia;
    const gVenta = states.gastosVenta;

    const valorAdquisicionActualizado = Math.max(0, vAdquisicion + gHerencia);
    const valorTransmisionNeto = Math.max(0, vTransmision - gVenta);
    let gananciaPatrimonial = Math.max(0, valorTransmisionNeto - valorAdquisicionActualizado);

    if (states.esAnterior1995 && gananciaPatrimonial > 0) {
      gananciaPatrimonial = gananciaPatrimonial * 0.85; // orientación simple
    }

    // Sort brackets by threshold
    const sorted = [...taxBrackets].sort((a, b) => {
      const ax = 'upTo' in a ? a.upTo : Number.POSITIVE_INFINITY;
      const bx = 'upTo' in b ? b.upTo : Number.POSITIVE_INFINITY;
      return ax - bx;
    });

    let impuestoIRPF = 0;
    let restante = gananciaPatrimonial;
    let baseAnterior = 0;

    for (const b of sorted) {
      if (restante <= 0) break;
      if ('upTo' in b) {
        const tramo = Math.max(0, b.upTo - baseAnterior);
        const baseEnTramo = Math.min(restante, tramo);
        impuestoIRPF += baseEnTramo * (b.rate / 100);
        restante -= baseEnTramo;
        baseAnterior = b.upTo;
      } else {
        impuestoIRPF += restante * (b.rate / 100);
        restante = 0;
      }
    }

    return {
      valorAdquisicionActualizado,
      valorTransmisionNeto,
      gananciaPatrimonial,
      impuestoIRPF,
    };
  }, [states, taxBrackets]);

  // Chart data
  const chartData = useMemo(() => {
    const base = calculated.valorAdquisicionActualizado;
    const impuestos = calculated.impuestoIRPF;
    const gananciaLimpia = Math.max(0, calculated.gananciaPatrimonial - impuestos);

    return [
      {
        name: 'Desglose Transmisión Neta',
        adquisicion: Math.max(0, base),
        ganancia: Math.max(0, gananciaLimpia),
        impuestos,
      },
    ];
  }, [calculated]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-6">Estima el IRPF a pagar por la ganancia patrimonial obtenida al vender una vivienda heredada.</p>

              {/* Inputs */}
              <div className="space-y-6">
                {inputs.map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{group.group}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {group.fields.map((input) => (
                        <div key={input.id}>
                          <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id}>
                            {input.label}
                            {'tooltip' in input && input.tooltip ? (
                              <Tooltip text={input.tooltip}>
                                <span className="ml-2 cursor-help" tabIndex={0}><InfoIcon /></span>
                              </Tooltip>
                            ) : null}
                          </label>

                          {input.type === 'boolean' ? (
                            <input
                              id={input.id}
                              type="checkbox"
                              className="h-5 w-5 rounded border-gray-300 text-indigo-600"
                              checked={states.esAnterior1995}
                              onChange={(e) => handleStateChange('esAnterior1995', e.target.checked)}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                id={input.id}
                                aria-label={input.label}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 px-3 py-2"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                step={1}
                                value={states[input.id as keyof typeof initialStates] as number}
                                onChange={(e) => handleStateChange(input.id as keyof typeof initialStates, e.target.value)}
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

              {/* Output */}
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del Cálculo de IRPF</h2>
                {outputs.map((output) => {
                  const raw = ((): number => {
                    switch (output.id) {
                      case 'valorAdquisicionActualizado': return calculated.valorAdquisicionActualizado;
                      case 'gananciaPatrimonial': return calculated.gananciaPatrimonial;
                      case 'impuestoIRPF': return calculated.impuestoIRPF;
                    }
                  })();
                  return (
                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'impuestoIRPF' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                      <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                      <span className={`text-xl md:text-2xl font-bold ${output.id === 'impuestoIRPF' ? 'text-indigo-600' : 'text-gray-800'}`}>
                        {isClient ? formatCurrency(raw) : '...'}
                      </span>
                    </div>
                  );
                })}
                <p className="text-xs text-gray-500">
                  Nota: si marcaste adquisición anterior a 31/12/1994, se aplica una <em>reducción estimada</em> del 15% sobre la ganancia. El cálculo real de coeficientes es más complejo y puede requerir asesoramiento.
                </p>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Desglose de la Transmisión Neta</h2>
            <div className="h-40 w-full">
              {isClient && <DynamicBarChart data={chartData} formatCurrency={formatCurrency} />}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              La suma del <strong>Valor de Adquisición</strong>, <strong>Ganancia</strong> e <strong>Impuestos</strong> equivale al <strong>valor de transmisión neto</strong> (venta menos gastos de venta).
            </p>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  try {
                    const payload = {
                      slug: calculatorData.slug,
                      title: calculatorData.title,
                      inputs: states,
                      outputs: {
                        valorAdquisicionActualizado: calculated.valorAdquisicionActualizado,
                        gananciaPatrimonial: calculated.gananciaPatrimonial,
                        impuestoIRPF: calculated.impuestoIRPF,
                      },
                      ts: Date.now(),
                    };
                    const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
                    localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
                    alert('¡Resultado guardado con éxito!');
                  } catch {
                    alert('No se pudo guardar el resultado.');
                  }
                }}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Guardar
              </button>
              <PDFButton slug={calculatorData.slug} calculatorRef={calculatorRef} />
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">
                Reiniciar
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía Fiscal de la Venta</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-11-ganancias-perdidas-patrimoniales/imputacion-temporal/reglas-generales/transmisiones-titulo-oneroso-lucrativo.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Ganancias y Pérdidas Patrimoniales</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 35/2006 del IRPF</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

/* -----------------
   PDF export btn
------------------ */
const PDFButton = ({ slug, calculatorRef }: { slug: string; calculatorRef: React.RefObject<HTMLDivElement> }) => {
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
  }, [slug, calculatorRef]);

  return (
    <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">
      Exportar PDF
    </button>
  );
};

export default CalculadoraImpuestosVentaViviendaHeredada;
