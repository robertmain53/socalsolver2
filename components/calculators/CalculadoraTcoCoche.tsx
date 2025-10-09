'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect, type FC } from 'react';
import dynamic from 'next/dynamic';

// --- Metadatos y Tipos ---
export const meta = {
  title: 'Calculadora de Coste Total de Propiedad de un Coche (TCO) por provincia',
  description:
    'Calcula el coste real de tu coche a lo largo del tiempo, incluyendo depreciación, combustible, seguro, mantenimiento e impuestos específicos de tu provincia.',
};

type States = Record<string, string | number>;

// --- Componentes UI y Helpers ---
const InfoIcon: FC = () => (
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
    className="text-gray-400 hover:text-gray-600 transition-colors"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip: FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema: FC<{ schema: unknown }> = ({ schema }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer: FC<{ content: string }> = ({ content }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        if (trimmedBlock.startsWith('###')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^###\s*/, '')) }}
            />
          );
        }
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n').map((item) => item.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ul>
          );
        }
        if (/^\d\.\s/.test(trimmedBlock)) {
          const items = trimmedBlock.split('\n').map((item) => item.replace(/^\d\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ol>
          );
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
      })}
    </div>
  );
};

// --- Importación Dinámica del Gráfico (cliente-only) ---
const DynamicPieChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { PieChart, Pie, Cell, Tooltip: ChartTooltip, Legend, ResponsiveContainer } = mod;
      const COLORS = ['#4f46e5', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444'];

      const ChartComponent: FC<{ data: Array<{ name: string; value: number }> }> = ({ data }) => (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
              }
            />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
      return ChartComponent;
    }),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full bg-gray-50 text-sm text-gray-500">Cargando gráfico...</div>,
  }
);

// --- Datos de Configuración del Calculador (Self-Contained) ---
const calculatorData = {
  slug: 'calculadora-tco-coche',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Coste Total de Propiedad de un Coche (TCO) por provincia',
  lang: 'es',
  ivtm_data: {
    madrid: [
      { max_cvf: 8, rate: 20.0 },
      { max_cvf: 11.99, rate: 59.0 },
      { max_cvf: 15.99, rate: 129.0 },
      { max_cvf: 19.99, rate: 159.0 },
      { max_cvf: 999, rate: 224.0 },
    ],
    barcelona: [
      { max_cvf: 8, rate: 25.24 },
      { max_cvf: 11.99, rate: 68.16 },
      { max_cvf: 15.99, rate: 143.88 },
      { max_cvf: 19.99, rate: 179.22 },
      { max_cvf: 999, rate: 224.0 },
    ],
    valencia: [
      { max_cvf: 8, rate: 22.28 },
      { max_cvf: 11.99, rate: 60.52 },
      { max_cvf: 15.99, rate: 127.86 },
      { max_cvf: 19.99, rate: 158.81 },
      { max_cvf: 999, rate: 224.0 },
    ],
    sevilla: [
      { max_cvf: 8, rate: 24.09 },
      { max_cvf: 11.99, rate: 65.17 },
      { max_cvf: 15.99, rate: 137.84 },
      { max_cvf: 19.99, rate: 171.19 },
      { max_cvf: 999, rate: 213.98 },
    ],
    zamora: [
      { max_cvf: 8, rate: 12.62 },
      { max_cvf: 11.99, rate: 34.08 },
      { max_cvf: 15.99, rate: 71.94 },
      { max_cvf: 19.99, rate: 89.61 },
      { max_cvf: 999, rate: 112.0 },
    ],
    tenerife: [
      { max_cvf: 8, rate: 12.62 },
      { max_cvf: 11.99, rate: 34.08 },
      { max_cvf: 15.99, rate: 71.94 },
      { max_cvf: 19.99, rate: 89.61 },
      { max_cvf: 999, rate: 112.0 },
    ],
  },
  inputs: [
    {
      id: 'precio_compra',
      label: 'Precio de Compra del Vehículo',
      type: 'number' as const,
      unit: '€',
      min: 1000,
      step: 500,
      tooltip: 'Coste total de adquisición del vehículo, incluyendo impuestos iniciales (IVA, matriculación) y extras.',
    },
    {
      id: 'anos_propiedad',
      label: 'Años de Propiedad Estimados',
      type: 'number' as const,
      unit: 'años',
      min: 1,
      max: 20,
      step: 1,
      tooltip: 'Durante cuántos años planeas mantener el vehículo. La media en España ronda los 8-10 años.',
    },
    {
      id: 'valor_reventa',
      label: 'Valor de Reventa Estimado',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 500,
      tooltip: 'El precio al que esperas poder vender el coche al final del periodo de propiedad.',
    },
    {
      id: 'kms_anuales',
      label: 'Kilómetros Anuales Recorridos',
      type: 'number' as const,
      unit: 'km/año',
      min: 1000,
      step: 1000,
      tooltip: 'La distancia media que estimas recorrer cada año. La media nacional es de unos 12.000 km.',
    },
    {
      id: 'tipo_combustible',
      label: 'Tipo de Vehículo',
      type: 'select' as const,
      options: ['gasolina', 'diésel', 'híbrido', 'eléctrico'],
      tooltip: 'El tipo de motorización afecta directamente al coste de combustible/energía y a ciertos impuestos.',
    },
    {
      id: 'consumo_medio',
      label: 'Consumo Medio',
      type: 'number' as const,
      unit: 'l/100km',
      min: 1,
      step: 0.1,
      tooltip: 'Para eléctricos, introduce el valor en kWh/100km.',
    },
    {
      id: 'precio_combustible',
      label: 'Precio Combustible / Energía',
      type: 'number' as const,
      unit: '€/l',
      min: 0.1,
      step: 0.05,
      tooltip: 'Coste por litro (o por kWh si es eléctrico).',
    },
    {
      id: 'provincia',
      label: 'Provincia de Residencia',
      type: 'select' as const,
      options: ['madrid', 'barcelona', 'valencia', 'sevilla', 'zamora', 'tenerife'],
      tooltip:
        'Selecciona tu provincia para calcular el Impuesto de Circulación (IVTM) específico, ya que varía significativamente en España.',
    },
    {
      id: 'potencia_fiscal',
      label: 'Potencia Fiscal (CVF)',
      type: 'number' as const,
      unit: 'CVF',
      min: 1,
      step: 0.1,
      tooltip:
        'Valor técnico de la ficha ITV. Es la base para calcular el impuesto de circulación (IVTM).',
    },
    {
      id: 'seguro_anual',
      label: 'Coste Anual del Seguro',
      type: 'number' as const,
      unit: '€/año',
      min: 100,
      step: 10,
      tooltip: 'Prima anual del seguro.',
    },
    {
      id: 'mantenimiento_anual',
      label: 'Mantenimiento y Reparaciones Anual',
      type: 'number' as const,
      unit: '€/año',
      min: 50,
      step: 10,
      tooltip:
        'Revisiones, neumáticos, ITV y reparaciones. Suele ser menor en eléctricos.',
    },
  ],
  outputs: [
    { id: 'coste_total_propiedad', label: 'Coste Total de Propiedad (TCO)', unit: '€' },
    { id: 'coste_anual_promedio', label: 'Coste Anual Promedio', unit: '€' },
    { id: 'coste_por_km', label: 'Coste por Kilómetro', unit: '€/km' }, // <- consistente con formateo
  ],
  content: '...', // reemplazado abajo
  seoSchema: { /* reemplazado abajo */ },
} as const;

// Long content + schema (tal como en tu archivo original):
// (mantengo tu contenido sin cambios, solo asigno)
;(calculatorData as any).content = `### Introducción

Comprar un coche es una de las decisiones financieras más importantes para una familia. Sin embargo, el **precio de compra es solo la punta del iceberg**. El Coste Total de Propiedad o TCO (del inglés, *Total Cost of Ownership*) revela la cifra real que gastarás durante la vida útil del vehículo, incluyendo costes "invisibles" como la depreciación, los impuestos, el seguro y el mantenimiento. Esta calculadora está diseñada para darte una visión completa y personalizada, con un factor único: **calcula el impacto de tu provincia en los impuestos**, una variable que la mayoría de herramientas ignora.

### Guida all'Uso del Calcolatore

* **Depreciación (Precio de Compra y Valor de Reventa)**: Es el mayor coste oculto. La diferencia entre lo que pagas por el coche y por lo que lo vendes es un gasto real que debes asumir.
* **Tipo de Vehículo y Consumo**: Elige el tipo de motor. La etiqueta y unidad del consumo y su precio se adaptarán automáticamente. Para un eléctrico, introduce el consumo en \`kWh/100km\` y el precio por \`€/kWh\` (el coste de la carga en casa).
* **Provincia y Potencia Fiscal (CVF)**: ¡La clave de esta calculadora! El Impuesto sobre Vehículos de Tracción Mecánica (IVTM), o 'numerito', es un impuesto municipal y sus tarifas varían hasta en un 300% entre diferentes ayuntamientos de España. La **Potencia Fiscal** es un valor técnico que encontrarás en la Ficha de Inspección Técnica del vehículo y que determina el tramo del impuesto a pagar.

### Metodologia di Calcolo Spiegata

El TCO se calcula sumando todos los costes fijos y variables durante el periodo de propiedad del vehículo. La fórmula general es:

**TCO = Depreciación + Costes de Combustible/Energía + Costes de Impuestos + Costes de Seguro + Costes de Mantenimiento**

1.  **Depreciación**: \`Precio de Compra - Valor de Reventa\`.
2.  **Coste Total de Combustible/Energía**: \`(Kms Anuales / 100) * Consumo Medio * Precio * Años de Propiedad\`.
3.  **Coste Total de Impuestos**: \`IVTM Anual (según Provincia y CVF) * Años de Propiedad\`.
4.  **Coste Total de Seguro**: \`Seguro Anual * Años de Propiedad\`.
5.  **Coste Total de Mantenimiento**: \`Mantenimiento Anual * Años de Propiedad\`.

Finalmente, calculamos el **Coste Anual** (\`TCO / Años de Propiedad\`) y el **Coste por Kilómetro** (\`TCO / (Kms Anuales * Años de Propiedad)\`).

### Analisi Approfondita: El TCO en la Batalla Eléctrico vs. Combustión

* **Coste Energético**: Cargar un EV en casa puede costar entre 2 y 4 € por cada 100 km.
* **Mantenimiento**: Ahorro de un 40-60% anual en EVs.
* **Impuestos**: Bonificaciones municipales de hasta el 75% del IVTM para Cero Emisiones; exención del impuesto de matriculación.

### Domande Frequenti (FAQ)

1.  **¿Qué es la 'Potencia Fiscal' y dónde la encuentro?**
2.  **¿Por qué el impuesto de circulación (IVTM) es tan diferente entre ciudades?**
3.  **¿Es un coche eléctrico siempre más barato a largo plazo?**`;

;(calculatorData as any).seoSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "¿Qué es la 'Potencia Fiscal' y dónde la encuentro?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Es un valor tributario (no CV reales). Aparece en la ficha ITV ('P.2.1 Potencia Fiscal').",
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el impuesto de circulación (IVTM) es tan diferente entre ciudades?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es municipal. El Estado fija mínimos y cada ayuntamiento aplica su coeficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es un coche eléctrico siempre más barato a largo plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de kms/año, precio de electricidad y ayudas (p.ej., Plan MOVES).',
      },
    },
  ],
};

// --- Componente Principal ---
const CalculadoraTcoCoche: FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema, ivtm_data } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // valores consistentes con opciones en minúsculas
  const initialStates: States = {
    precio_compra: 22000,
    anos_propiedad: 8,
    valor_reventa: 8000,
    kms_anuales: 12000,
    tipo_combustible: 'gasolina',
    consumo_medio: 6.5,
    precio_combustible: 1.7,
    provincia: 'madrid',
    potencia_fiscal: 10.5,
    seguro_anual: 450,
    mantenimiento_anual: 350,
  };
  const [states, setStates] = useState<States>(initialStates);

  const handleStateChange = (id: string, value: string | number) => {
    setStates((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = useCallback(() => setStates(initialStates), []);

  const calculatedOutputs = useMemo(() => {
    const {
      precio_compra,
      anos_propiedad,
      valor_reventa,
      kms_anuales,
      consumo_medio,
      precio_combustible,
      provincia,
      potencia_fiscal,
      seguro_anual,
      mantenimiento_anual,
    } = states;

    const getIvtmRate = (): number => {
      const provinceRates = (ivtm_data as any)[String(provincia)];
      if (!provinceRates) return 0;
      // usar <= para incluir el límite superior del tramo
      const pf = Number(potencia_fiscal);
      const entry = provinceRates.find((r: { max_cvf: number }) => pf <= r.max_cvf);
      return entry ? Number(entry.rate) : 0;
    };

    const years = Number(anos_propiedad) || 0;
    const kmsY = Number(kms_anuales) || 0;
    const cons = Number(consumo_medio) || 0;
    const priceFuel = Number(precio_combustible) || 0;

    const coste_depreciacion = Number(precio_compra) - Number(valor_reventa);
    const coste_combustible_total = (kmsY / 100) * cons * priceFuel * years;
    const coste_impuestos_total = getIvtmRate() * years;
    const coste_seguro_total = Number(seguro_anual) * years;
    const coste_mantenimiento_total = Number(mantenimiento_anual) * years;

    const coste_total_propiedad =
      coste_depreciacion + coste_combustible_total + coste_impuestos_total + coste_seguro_total + coste_mantenimiento_total;

    const coste_anual_promedio = years > 0 ? coste_total_propiedad / years : 0;
    const total_km = kmsY * years;
    const coste_por_km = total_km > 0 ? coste_total_propiedad / total_km : 0;

    return {
      coste_total_propiedad,
      coste_anual_promedio,
      coste_por_km,
      breakdown: [
        { name: 'Depreciación', value: Math.max(0, coste_depreciacion) },
        { name: 'Combustible', value: Math.max(0, coste_combustible_total) },
        { name: 'Seguro', value: Math.max(0, coste_seguro_total) },
        { name: 'Impuestos', value: Math.max(0, coste_impuestos_total) },
        { name: 'Mantenimiento', value: Math.max(0, coste_mantenimiento_total) },
      ],
    };
  }, [states, ivtm_data]);

  const fuel = String(states.tipo_combustible || '').toLowerCase();
  const isElectric = fuel === 'eléctrico' || fuel === 'electrico';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

  const formatValue = (value: number, unit: string) => {
    if (unit === '€') return formatCurrency(value);
    if (unit === '€/km') return `${value.toFixed(3)} €/km`;
    return `${value}`;
  };

  return (
    <>
      <FaqSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/50 font-sans">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
            <p className="text-gray-600 mb-6">{meta.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {calculatorData.inputs.map((input: any) => {
                // unidades dinámicas según tipo de vehículo
                let unit = input.unit as string;
                if (input.id === 'consumo_medio') unit = isElectric ? 'kWh/100km' : 'l/100km';
                if (input.id === 'precio_combustible') unit = isElectric ? '€/kWh' : '€/l';

                if (input.type === 'select') {
                  const value = String(states[input.id] ?? '');
                  return (
                    <div key={input.id}>
                      <label
                        htmlFor={input.id}
                        className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                      >
                        {input.label}
                        <Tooltip text={input.tooltip}>
                          <span className="ml-1.5">
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      </label>
                      <select
                        id={input.id}
                        value={value}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 capitalize"
                      >
                        {input.options?.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                const val = states[input.id] as number | string;

                return (
                  <div key={input.id}>
                    <label
                      htmlFor={input.id}
                      className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                    >
                      {input.label}
                      <Tooltip text={input.tooltip}>
                        <span className="ml-1.5">
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    </label>
                    <div className="relative">
                      <input
                        id={input.id}
                        type="number"
                        value={val as number | string}
                        onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                        min={input.min}
                        step={input.step}
                        max={input.max}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-16"
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 pointer-events-none">
                        {unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados del TCO</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {calculatorData.outputs.map((output: any) => (
                  <div
                    key={output.id}
                    className={`p-4 rounded-lg ${
                      output.id === 'coste_total_propiedad' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    <div className="text-sm">{output.label}</div>
                    <div className="text-2xl font-bold mt-1">
                      {isClient ? formatValue((calculatedOutputs as any)[output.id], output.unit) : '...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose del Coste Total</h3>
              <div className="h-64 w-full bg-gray-50/80 p-2 rounded-lg border">
                {isClient && <DynamicPieChart data={calculatedOutputs.breakdown.filter((d: any) => d.value > 0)} />}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-lg">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-red-600 text-white rounded-md px-3 py-2 text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Resetear
              </button>
            </div>
          </section>
          <section className="border rounded-lg p-5 bg-white shadow-lg">
            <h2 className="font-semibold mb-3 text-gray-800">Guía para Entender el TCO</h2>
            <ContentRenderer content={(calculatorData as any).content} />
          </section>
          <section className="border rounded-lg p-5 bg-white shadow-lg">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2004-18384"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley Reguladora de las Haciendas Locales (IVTM)
                </a>
              </li>
              <li>
                <a
                  href="https://www.idae.es/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Instituto para la Diversificación y Ahorro de la Energía (IDAE)
                </a>
              </li>
              <li>
                <a
                  href="https://sede.dgt.gob.es/es/vehiculos/informes-de-vehiculos/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Dirección General de Tráfico (DGT)
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraTcoCoche;
