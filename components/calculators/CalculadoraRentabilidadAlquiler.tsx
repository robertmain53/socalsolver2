'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* ============================== Types ============================== */

type NumberField = {
  id: string;
  label: string;
  type: 'number';
  unit: string;
  tooltip?: string; // optional -> prevents union error
};

type InputGroup = {
  group: string;
  fields: NumberField[];
};

type OutputId =
  | 'rentabilidadBruta'
  | 'rentabilidadNeta'
  | 'cashFlowMensual'
  | 'beneficioNetoAnual';

type OutputDef = {
  id: OutputId;
  label: string;
  unit: '%' | '€';
};

interface CalculatorData {
  slug: string;
  category: string;
  title: string;
  lang: string;
  tags: string;
  inputs: InputGroup[];
  outputs: OutputDef[];
  content: string;
}

/* ============================== UI bits ============================== */

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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

/* ============================== Data ============================== */

const calculatorData: CalculatorData = {
  slug: 'calculadora-rentabilidad-alquiler',
  category: 'Bienes Raíces y Vivienda',
  title:
    'Calculadora de Rentabilidad Neta de Alquiler (descontando IBI, comunidad, etc.)',
  lang: 'es',
  tags:
    'calculadora rentabilidad alquiler, rendimiento neto alquiler, cash flow inmobiliario, invertir en vivienda, gastos alquiler propietario, ibi, comunidad propietarios, rentabilidad neta',
  inputs: [
    {
      group: '1. Costes de Inversión',
      fields: [
        {
          id: 'precioCompra',
          label: 'Precio de compra de la vivienda',
          type: 'number',
          unit: '€',
          tooltip: 'El precio pagado por el inmueble (sin incluir gastos).',
        },
        {
          id: 'gastosCompra',
          label: 'Gastos de compraventa (ITP/IVA, notaría, gestoría, etc.)',
          type: 'number',
          unit: '€',
          tooltip: 'Suelen rondar el 10-12% del precio de compra (orientativo).',
        },
      ],
    },
    {
      group: '2. Ingresos del Alquiler',
      fields: [
        {
          id: 'alquilerMensual',
          label: 'Ingreso mensual por alquiler',
          type: 'number',
          unit: '€',
          tooltip: 'La renta mensual que paga el inquilino.',
        },
      ],
    },
    {
      group: '3. Gastos Anuales de Mantenimiento',
      fields: [
        { id: 'ibiAnual', label: 'IBI (anual)', type: 'number', unit: '€' },
        {
          id: 'comunidadAnual',
          label: 'Gastos de comunidad (anual)',
          type: 'number',
          unit: '€',
        },
        {
          id: 'seguroHogarAnual',
          label: 'Seguro de hogar (anual)',
          type: 'number',
          unit: '€',
        },
        {
          id: 'mantenimientoAnual',
          label: 'Otros gastos / mantenimiento (anual)',
          type: 'number',
          unit: '€',
        },
      ],
    },
    {
      group: '4. Financiación (Opcional)',
      fields: [
        {
          id: 'pagoHipotecaMensual',
          label: 'Cuota de la hipoteca (mensual)',
          type: 'number',
          unit: '€',
        },
        {
          id: 'interesesAnuales',
          label: 'Intereses anuales de la hipoteca',
          type: 'number',
          unit: '€',
        },
      ],
    },
  ],
  outputs: [
    { id: 'rentabilidadBruta', label: 'Rentabilidad Bruta', unit: '%' },
    { id: 'rentabilidadNeta', label: 'Rentabilidad Neta (sin hipoteca)', unit: '%' },
    { id: 'cashFlowMensual', label: 'Cash Flow Mensual', unit: '€' },
    {
      id: 'beneficioNetoAnual',
      label: 'Beneficio Neto Anual (antes de IRPF)',
      unit: '€',
    },
  ],
  content: '### Guía: Cómo calcular tu rentabilidad neta...\n\n[...]',
};

/* ============================== SEO JSON-LD ============================== */

const WebPageJsonLd = (canonical: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  url: canonical,
  name: calculatorData.title,
  inLanguage: 'es',
  description:
    'Calcula la rentabilidad bruta y neta de tu alquiler descontando todos los gastos.',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', "section[aria-label='FAQ'] li"],
  },
});

const ArticleJsonLd = (
  canonical: string,
  datePublishedISO: string,
  dateModifiedISO: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: calculatorData.title,
  description: 'Calculadora online para estimar rentabilidad neta del alquiler.',
  mainEntityOfPage: canonical,
  inLanguage: 'es',
  author: { '@type': 'Organization', name: 'SoCalSolver' },
  publisher: {
    '@type': 'Organization',
    name: 'SoCalSolver',
    logo: { '@type': 'ImageObject', url: '/favicon-512x512.png' },
  },
  datePublished: datePublishedISO,
  dateModified: dateModifiedISO,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', "section[aria-label='FAQ'] li"],
  },
});

/* ============================== Dynamic Chart (CSR) ============================== */

const DynamicPieChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({
        data,
      }: {
        data: Array<{ name: string; value: number }>;
      }) => {
        const COLORS = ['#22c55e', '#f97316', '#ef4444', '#3b82f6'];
        return (
          <mod.ResponsiveContainer width="100%" height="100%">
            <mod.PieChart>
              <mod.Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, index) => (
                  <mod.Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </mod.Pie>
              <mod.Tooltip
                formatter={(v: number) =>
                  new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(v)
                }
              />
              <mod.Legend />
            </mod.PieChart>
          </mod.ResponsiveContainer>
        );
      };
      return ChartComponent;
    }),
  { ssr: false }
);

/* ============================== Component ============================== */

const CalculadoraRentabilidadAlquiler: React.FC = () => {
  const { title, inputs, outputs } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Avoid SSR/CSR mismatches on formatted values
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const todayISO = new Date().toISOString().split('T')[0];

  const [states, setStates] = useState<Record<string, number>>({
    precioCompra: 200_000,
    gastosCompra: 20_000,
    alquilerMensual: 950,
    ibiAnual: 450,
    comunidadAnual: 720,
    seguroHogarAnual: 300,
    mantenimientoAnual: 800,
    pagoHipotecaMensual: 750,
    interesesAnuales: 4_000,
  });

  const handleStateChange = (id: string, value: string | number) => {
    const num = Number(value);
    setStates((prev) => ({
      ...prev,
      [id]: Number.isFinite(num) ? Math.max(0, num) : 0,
    }));
  };

  const calculated = useMemo(() => {
    const pCompra = states.precioCompra || 0;
    const gCompra = states.gastosCompra || 0;
    const inversionTotal = pCompra + gCompra;

    const iMensual = states.alquilerMensual || 0;
    const iAnual = iMensual * 12;

    const gAnualesBase =
      (states.ibiAnual || 0) +
      (states.comunidadAnual || 0) +
      (states.seguroHogarAnual || 0) +
      (states.mantenimientoAnual || 0);

    const intereses = states.interesesAnuales || 0;
    const gAnualesTotales = gAnualesBase + intereses;

    const beneficioNetoAnual = iAnual - gAnualesTotales;

    const rentabilidadBruta =
      inversionTotal > 0 ? (iAnual / inversionTotal) * 100 : 0;
    const rentabilidadNeta =
      inversionTotal > 0 ? (beneficioNetoAnual / inversionTotal) * 100 : 0;

    const gMensuales = gAnualesBase / 12;
    const hipotecaMensual = states.pagoHipotecaMensual || 0;
    const cashFlowMensual = iMensual - gMensuales - hipotecaMensual;

    return {
      rentabilidadBruta,
      rentabilidadNeta,
      cashFlowMensual,
      beneficioNetoAnual,
      inversionTotal,
      gastosAnualesTotales: gAnualesTotales,
      gastosAnualesBase: gAnualesBase,
    };
  }, [states]);

  const chartData = useMemo(
    () =>
      [
        {
          name: 'Beneficio Neto',
          value: Math.max(0, calculated.beneficioNetoAnual),
        },
        {
          name: 'Gastos + Intereses',
          value: calculated.gastosAnualesTotales,
        },
      ].filter((d) => d.value > 0),
    [calculated.beneficioNetoAnual, calculated.gastosAnualesTotales]
  );

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(v);

  const formatPercent = (v: number) =>
    `${(Number.isFinite(v) ? v : 0).toFixed(2)}%`;

  const canonical = `https://socalsolver.com/${calculatorData.slug}`;
  const datePublishedISO = '2025-08-29';
  const dateModifiedISO = todayISO;

  return (
    <>
      {/* SEO Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(WebPageJsonLd(canonical)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            ArticleJsonLd(canonical, datePublishedISO, dateModifiedISO)
          ),
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
                {title}
              </h1>
              <p className="text-gray-600 mb-6">
                Analiza la rentabilidad real de tu inversión inmobiliaria.
              </p>

              {calculated.inversionTotal === 0 && (
                <div className="bg-yellow-50 text-yellow-800 border border-yellow-300 rounded-md p-3 mb-4 text-sm">
                  ⚠️ Debes introducir un precio de compra y gastos de compraventa
                  válidos.
                </div>
              )}

              <div className="space-y-6">
                {inputs.map((group) => (
                  <div key={group.group} className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      {group.group}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {group.fields.map((input) => {
                        const hasTooltip =
                          'tooltip' in input &&
                          typeof input.tooltip === 'string' &&
                          input.tooltip.length > 0;

                        return (
                          <div key={input.id}>
                            <label
                              htmlFor={input.id}
                              className="block text-sm font-medium text-gray-700 flex items-center mb-1"
                            >
                              {input.label}
                              {hasTooltip && (
                                <Tooltip text={input.tooltip!}>
                                  <span className="ml-2 cursor-help">
                                    <InfoIcon />
                                  </span>
                                </Tooltip>
                              )}
                            </label>

                            <div className="flex items-center gap-2">
                              <input
                                id={input.id}
                                type="number"
                                value={
                                  Number.isFinite(states[input.id])
                                    ? states[input.id]
                                    : 0
                                }
                                onChange={(e) =>
                                  handleStateChange(input.id, e.target.value)
                                }
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                inputMode="decimal"
                              />
                              {input.unit && (
                                <span className="text-sm text-gray-500">
                                  {input.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Métricas Clave
                </h2>
                <div className="space-y-4">
                  {outputs.map((output) => (
                    <div
                      key={output.id}
                      className={`flex items-baseline justify-between p-4 rounded-lg ${
                        output.id === 'rentabilidadNeta'
                          ? 'bg-indigo-50 border-l-4 border-indigo-500'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-sm md:text-base font-medium text-gray-700">
                        {output.label}
                      </span>
                      <span
                        className={`text-xl md:text-2xl font-bold ${
                          output.id === 'rentabilidadNeta'
                            ? 'text-indigo-600'
                            : output.id === 'cashFlowMensual' &&
                              calculated.cashFlowMensual < 0
                            ? 'text-red-600'
                            : 'text-gray-800'
                        }`}
                      >
                        {isClient
                          ? output.unit === '%'
                            ? formatPercent((calculated as any)[output.id])
                            : formatCurrency((calculated as any)[output.id])
                          : '...'}
                      </span>
                    </div>
                  ))}
                </div>

                {calculated.cashFlowMensual < 0 && (
                  <div className="bg-red-50 text-red-700 border border-red-300 rounded-md p-3 mt-4 text-sm">
                    ⚠️ Tu inversión genera un <strong>cash flow mensual negativo</strong>.
                    Eso significa que cada mes deberás aportar dinero adicional.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Desglose Anual</h2>
            <div className="h-64 w-full">{isClient && <DynamicPieChart data={chartData} />}</div>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraRentabilidadAlquiler;
