'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Icona Tooltip ---
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

// --- Dati di configurazione ---
const calculatorData = {
  slug: 'calculadora-gastos-compraventa-vivienda',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Gastos de Compraventa de Vivienda (ITP vs. IVA por C.A.)',
  lang: 'es',
  taxRates: {
    andalucia: { name: 'Andalucía', itp_general: 7, itp_reducido: 3.5, ajd: 1.2 },
    catalunya: { name: 'Cataluña', itp_general: 10, itp_reducido: 5, ajd: 1.5 },
    madrid: { name: 'Comunidad de Madrid', itp_general: 6, itp_reducido: 4, ajd: 0.75 },
    valencia: { name: 'Comunidad Valenciana', itp_general: 10, itp_reducido: 4, ajd: 1.5 },
    galicia: { name: 'Galicia', itp_general: 8, itp_reducido: 3, ajd: 1.5 },
  },
  inputs: [
    { id: 'precioVivienda', label: 'Precio de la vivienda', type: 'number' as const, unit: '€', min: 0, step: 5000, tooltip: 'Introduce el precio de venta acordado para el inmueble.' },
    {
      id: 'tipoVivienda',
      label: 'Tipo de vivienda',
      type: 'select' as const,
      options: [
        { value: 'segunda_mano', label: 'Segunda Mano (paga ITP)' },
        { value: 'nueva', label: 'Nueva (paga IVA + AJD)' },
      ],
      tooltip: 'Selecciona si es una vivienda nueva (primera transmisión de un promotor) o de segunda mano.',
    },
    {
      id: 'comunidadAutonoma',
      label: 'Comunidad Autónoma',
      type: 'select' as const,
      options: [
        { value: 'andalucia', label: 'Andalucía' },
        { value: 'catalunya', label: 'Cataluña' },
        { value: 'madrid', label: 'Comunidad de Madrid' },
        { value: 'valencia', label: 'Comunidad Valenciana' },
        { value: 'galicia', label: 'Galicia' },
      ],
      tooltip: 'El impuesto principal (ITP o AJD) varía significativamente según la comunidad autónoma.',
    },
    {
      id: 'cumpleRequisitosReducida',
      label: '¿Cumples requisitos para el tipo reducido (solo ITP)?',
      type: 'boolean' as const,
      tooltip: 'Marca esta opción si cumples las condiciones para un ITP reducido (ej. menor de 35 años, VPO, etc.). Varía por C.A.',
    },
    {
      id: 'ivaReducidaVPO',
      label: '¿Vivienda protegida (VPO) con IVA reducido 4%?',
      type: 'boolean' as const,
      tooltip: 'Marca esta opción si la vivienda nueva es una VPO (aplica IVA 4% en lugar de 10%).',
    },
  ],
  outputs: [
    { id: 'impuestos', label: 'Impuestos (ITP o IVA + AJD)' },
    { id: 'notaria', label: 'Gastos de Notaría (estimado)' },
    { id: 'registro', label: 'Gastos de Registro (estimado)' },
    { id: 'gestoria', label: 'Gastos de Gestoría (estimado)' },
    { id: 'gastosTotales', label: 'Total de Gastos e Impuestos' },
    { id: 'precioFinal', label: 'Coste Total de la Operación' },
  ],
  content: '### Introducción: Calcular todos los costes de la compra de tu vivienda...\n\n...',
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuándo se paga ITP y cuándo se paga IVA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Se paga el ITP al comprar una vivienda de segunda mano a un particular. Se paga el IVA al comprar una vivienda nueva directamente al promotor.',
        },
      },
    ],
  },
};

const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

// --- Grafico dinamico (Pie) ---
const DynamicPieChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data }: { data: any[] }) => {
        const COLORS = ['#0ea5e9', '#f97316', '#84cc16'];
        return (
          <mod.ResponsiveContainer width="100%" height="100%">
            <mod.PieChart>
              <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((entry, index) => (
                  <mod.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </mod.Pie>
              <mod.Tooltip formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value))} />
              <mod.Legend />
            </mod.PieChart>
          </mod.ResponsiveContainer>
        );
      };
      return ChartComponent;
    }),
  { ssr: false }
);

// --- Componente principale ---
const CalculadoraGastosCompraventaVivienda: React.FC = () => {
  const { slug, title, inputs, outputs, taxRates } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const initialStates = {
    precioVivienda: 250000,
    tipoVivienda: 'segunda_mano',
    comunidadAutonoma: 'madrid',
    cumpleRequisitosReducida: false,
    ivaReducidaVPO: false,
  };
  const [states, setStates] = useState<Record<string, any>>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    if (typeof states[id] === 'boolean') {
      setStates((prev) => ({ ...prev, [id]: Boolean(value) }));
    } else if (typeof states[id] === 'number') {
      setStates((prev) => ({ ...prev, [id]: Number(value) }));
    } else {
      setStates((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const precio = Number(states.precioVivienda) || 0;
    const region = states.comunidadAutonoma as keyof typeof taxRates;
    const rates = taxRates[region];
    let impuestos = 0;

    if (states.tipoVivienda === 'nueva') {
      const ivaRate = states.ivaReducidaVPO ? 0.04 : 0.10;
      const iva = precio * ivaRate;
      const ajd = precio * (rates.ajd / 100);
      impuestos = iva + ajd;
    } else {
      const itpRate = states.cumpleRequisitosReducida ? rates.itp_reducido : rates.itp_general;
      impuestos = precio * (itpRate / 100);
    }

    const notaria = Math.max(300, precio * 0.003);
    const registro = Math.max(200, precio * 0.002);
    const gestoria = 450;

    const gastosTotales = impuestos + notaria + registro + gestoria;
    const precioFinal = precio + gastosTotales;

    return { impuestos, notaria, registro, gestoria, gastosTotales, precioFinal };
  }, [states, taxRates]);

  const chartData = [
    { name: 'Precio Vivienda', value: Number(states.precioVivienda) },
    { name: 'Impuestos', value: calculatedOutputs.impuestos },
    { name: 'Otros Gastos', value: calculatedOutputs.notaria + calculatedOutputs.registro + calculatedOutputs.gestoria },
  ];

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value));

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Estima el coste total de comprar tu vivienda, incluyendo impuestos por C.A. y otros gastos.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => {
                  if (input.id === 'cumpleRequisitosReducida' && states.tipoVivienda !== 'segunda_mano') return null;
                  if (input.id === 'ivaReducidaVPO' && states.tipoVivienda !== 'nueva') return null;

                  if (input.type === 'select') {
                    return (
                      <div key={input.id}>
                        <label className="block text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                          {input.label}
                          {input.tooltip && (
                            <Tooltip text={input.tooltip}>
                              <span className="ml-2 cursor-help">
                                <InfoIcon />
                              </span>
                            </Tooltip>
                          )}
                        </label>
                        <select
                          id={input.id}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 mt-1"
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                        >
                          {input.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (input.type === 'boolean') {
                    return (
                      <div key={input.id} className="md:col-span-2 flex items-center gap-2">
                        <input
                          id={input.id}
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={Boolean(states[input.id])}
                          onChange={(e) => handleStateChange(input.id, e.target.checked)}
                        />
                        <label htmlFor={input.id} className="text-sm font-medium text-gray-700">
                          {input.label}
                        </label>
                        {input.tooltip && (
                          <Tooltip text={input.tooltip}>
                            <span className="ml-2 cursor-help">
                              <InfoIcon />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={input.id}>
                      <label className="block text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                        {input.label}
                        {input.tooltip && (
                          <Tooltip text={input.tooltip}>
                            <span className="ml-2 cursor-help">
                              <InfoIcon />
                            </span>
                          </Tooltip>
                        )}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          id={input.id}
                          type="number"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          value={states[input.id]}
                          min={input.min}
                          step={input.step}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Desglose de Gastos</h2>
                <div className="space-y-4">
                  {outputs.map((output) => (
                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'precioFinal' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                      <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                      <span className={`text-xl md:text-2xl font-bold ${output.id === 'precioFinal' ? 'text-indigo-600' : 'text-gray-800'}`}>
                        {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
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
            <h2 className="font-semibold mb-3 text-gray-800">Visualización del Coste Total</h2>
            <div className="h-64 w-full">{isClient && <DynamicPieChart data={chartData} />}</div>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraGastosCompraventaVivienda;
