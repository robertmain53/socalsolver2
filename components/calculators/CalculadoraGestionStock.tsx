'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// --- Icona per i Tooltip ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip (UI) ---
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const SeoSchema = ({ schema }: { schema: object }) => (
  <script
    type="application/ld+json"
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// --- Componente per il rendering del contenuto Markdown (subset sicuro) ---
const ContentRenderer = ({ content }: { content: string }) => {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const processInlineFormatting = (text: string) =>
    escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');

  const blocks = content.split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-bold mt-6 mb-4"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.substring(4)) }} />
          );
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={index} className="text-lg font-semibold mt-4 mb-3"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.substring(5)) }} />
          );
        }
        if (trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').map(item => item.replace(/^\d+\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ol>
          );
        }
        return (
          <p key={index} className="mb-4"
             // eslint-disable-next-line react/no-danger
             dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed) }} />
        );
      })}
    </div>
  );
};

// ---- Config del calcolatore (immutabile) ----
const calculatorData = {
  slug: 'calculadora-gestion-stock',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la Gestión de "Stock" (coste y rotación)',
  lang: 'es',
  inputs: [
    {
      id: 'stock_inicial',
      label: 'Valor del Stock Inicial',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'El valor monetario de tu inventario al comienzo del período que quieres analizar (ej. 1 de enero).',
    },
    {
      id: 'stock_final',
      label: 'Valor del Stock Final',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'El valor monetario de tu inventario al final del período analizado (ej. 31 de diciembre).',
    },
    {
      id: 'coste_mercancias_vendidas',
      label: 'Coste de las Mercancías Vendidas (CMV)',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'El coste directo de producción o compra de los bienes que has vendido en el período. Es más preciso que usar los ingresos por ventas.',
    },
    {
      id: 'dias_periodo',
      label: 'Duración del Período',
      type: 'number' as const,
      unit: 'días',
      min: 1,
      step: 1,
      tooltip:
        'El número de días en el período de análisis. Por ejemplo, 365 para un año completo o 90 para un trimestre.',
    },
  ],
  outputs: [
    { id: 'stock_promedio', label: 'Valor del Stock Promedio', unit: '€' },
    { id: 'indice_rotacion', label: 'Índice de Rotación de Stock (IRS)', unit: 'veces/período' },
    { id: 'dias_inventario', label: 'Período Medio de Inventario (PMI)', unit: 'días' },
    { id: 'interpretacion_rotacion', label: 'Análisis del Resultado', unit: '' },
  ],
  formulaSteps: [
    { step: 1, description: 'Calcular el Stock Promedio', formula: 'Stock Promedio = (Stock Inicial + Stock Final) / 2' },
    { step: 2, description: 'Calcular el Índice de Rotación de Stock (IRS)', formula: 'IRS = Coste de Mercancías Vendidas / Stock Promedio' },
    { step: 3, description: 'Calcular el Período Medio de Inventario (días)', formula: 'PMI = Duración del Período / IRS' },
  ],
  examples: [
    {
      name: 'Ejemplo 1: Tienda de Moda Rápida (Alta Rotación)',
      inputs: { stock_inicial: 20000, stock_final: 25000, coste_mercancias_vendidas: 180000, dias_periodo: 365 },
      outputs: { indice_rotacion: 8, dias_inventario: 45.6 },
    },
    {
      name: 'Ejemplo 2: Concesionario de Coches de Lujo (Baja Rotación)',
      inputs: { stock_inicial: 500000, stock_final: 550000, coste_mercancias_vendidas: 1200000, dias_periodo: 365 },
      outputs: { indice_rotacion: 2.29, dias_inventario: 159.4 },
    },
  ],
  tags:
    'calculadora gestión de stock, rotación de inventario, índice de rotación, coste de mercancías vendidas, stock promedio, días de inventario, KPI logística, optimización de almacén, control de existencias',
  content:
    "### Introducción\n\nUna gestión de stock eficiente es la columna vertebral de cualquier negocio que maneje productos físicos. Esta calculadora es una herramienta estratégica para directores de logística, gerentes de operaciones y dueños de pymes, diseñada para medir la eficiencia con la que una empresa gestiona su inventario. Calcula los KPIs más importantes: el **Índice de Rotación de Stock (IRS)** y el **Período Medio de Inventario (PMI)**, ofreciendo una visión clara de la salud financiera y operativa de tu almacén.\n\n### Guida all'Uso del Calcolatore\n\nPara obtener un análisis preciso, completa los siguientes campos:\n\n* **Valor del Stock Inicial y Final**: Corresponden al valor de tu inventario al principio y al final del período que deseas analizar. La media de ambos nos dará una visión equilibrada.\n* **Coste de las Mercancías Vendidas (CMV)**: Este es el coste directo de los productos vendidos. Es preferible al 'volumen de ventas' porque elimina el margen de beneficio, ofreciendo un dato de coste puro que refleja con mayor precisión el flujo de inventario.\n* **Duración del Período**: El número de días que abarca tu análisis. Usar 365 días es común para una visión anual, pero puedes ajustarlo a trimestres (90) o meses (30) para un control más granular.\n\n### Metodologia di Calcolo Spiegata\n\nNuestra herramienta se basa en fórmulas estándar de la contabilidad de costes y la gestión logística para garantizar resultados transparentes y fiables:\n\n1.  **Stock Promedio**: Se calcula como `(Stock Inicial + Stock Final) / 2`. Este promedio suaviza las fluctuaciones y ofrece una base de cálculo más estable que usar un único punto en el tiempo.\n2.  **Índice de Rotación de Stock (IRS)**: La fórmula es `CMV / Stock Promedio`. El resultado indica cuántas veces la empresa ha vendido y repuesto su inventario completo durante el período. Un número alto generalmente indica una gestión eficiente y ventas robustas.\n3.  **Período Medio de Inventario (PMI)**: Calculado como `Días del Período / IRS`. Este KPI traduce el índice de rotación a una medida de tiempo: los días que, en promedio, un producto permanece en tu almacén antes de ser vendido. Un número bajo es ideal, ya que implica que el capital invertido en stock se recupera rápidamente.\n\n### Analisi Approfondita: Estrategias para Optimizar la Rotación de Stock\n\nUn buen índice de rotación no es un accidente, es el resultado de una estrategia deliberada. Mientras que un IRS bajo puede señalar obsolescencia y exceso de capital inmovilizado, uno demasiado alto podría indicar riesgo de roturas de stock y pérdida de ventas. El equilibrio es clave. Aquí hay estrategias avanzadas para optimizarlo:\n\n**1. Análisis ABC (Principio de Pareto):**\nNo todo el stock es igual. Clasifica tus productos:\n* **Categoría A**: El 20% de tus productos que generan el 80% de tus ingresos. Requieren un control exhaustivo, previsiones de demanda precisas y un seguimiento constante.\n* **Categoría B**: Productos de importancia media. Requieren un control estándar.\n* **Categoría C**: El grueso de tus productos, pero con bajo impacto en los ingresos. Se puede permitir un control más laxo y mayores niveles de stock de seguridad sin inmovilizar demasiado capital.\n\n**2. Definir un Stock de Seguridad Dinámico:**\nEl stock de seguridad es tu colchón contra la incertidumbre de la demanda y los retrasos de proveedores. En lugar de un número fijo, utiliza una fórmula que considere la variabilidad de la demanda y el *lead time* (tiempo de entrega) del proveedor. `Stock de Seguridad = (Venta Máxima Diaria × Lead Time Máximo) - (Venta Media Diaria × Lead Time Medio)`.\n\n**3. Mejorar la Previsión de la Demanda:**\nUtiliza datos históricos de ventas, pero enriquécelos con factores externos. Analiza la estacionalidad, las tendencias del mercado, las campañas de marketing planificadas y las acciones de la competencia. El uso de software de gestión de inventario (SGI) que integre modelos de pronóstico puede automatizar y mejorar drásticamente la precisión.\n\n**4. Optimizar el Proceso de Compra:**\nEn lugar de grandes pedidos esporádicos, considera un modelo de **Just-In-Time (JIT)** o pedidos más pequeños y frecuentes si tus proveedores son fiables. Esto reduce el stock promedio y los costes de almacenamiento, aumentando directamente tu índice de rotación. Negocia plazos de entrega más cortos con tus proveedores clave.\n\n### Domande Frequenti (FAQ)\n\n* **¿Cuál es un buen Índice de Rotación de Stock (IRS)?**\n    No hay un número mágico; depende totalmente de la industria. Un supermercado puede tener un IRS de 15 o más, mientras que una joyería de lujo podría tener un IRS de 1-2. La clave es comparar tu IRS con el promedio de tu sector y, sobre todo, monitorizar su evolución en el tiempo.\n\n* **¿Por qué usar el 'Coste de Mercancías Vendidas' (CMV) en lugar de las 'Ventas'?**\n    Porque el CMV refleja el coste real del inventario. Las ventas incluyen el margen de beneficio, lo que inflaría artificialmente el índice de rotación. Usar el CMV te da una medida pura de la eficiencia operativa, sin la distorsión de la estrategia de precios.\n\n* **¿Tener un PMI de 15 días es siempre mejor que uno de 40 días?**\n    Generalmente sí, ya que significa que el dinero invertido en stock se recupera en 15 días en lugar de 40. Sin embargo, un PMI extremadamente bajo podría ser una señal de alerta. Podrías estar comprando en cantidades tan pequeñas que pierdes descuentos por volumen o, peor aún, estás sufriendo roturas de stock frecuentes y perdiendo ventas por no tener producto disponible.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuál es un buen Índice de Rotación de Stock (IRS)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No hay un número mágico; depende totalmente de la industria. Un supermercado puede tener un IRS de 15 o más, mientras que una joyería de lujo podría tener un IRS de 1-2. La clave es comparar tu IRS con el promedio de tu sector y, sobre todo, monitorizar su evolución en el tiempo.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Por qué usar el \'Coste de Mercancías Vendidas\' (CMV) en lugar de las \'Ventas\'?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Porque el CMV refleja el coste real del inventario. Las ventas incluyen el margen de beneficio, lo que inflaría artificialmente el índice de rotación. Usar el CMV te da una medida pura de la eficiencia operativa, sin la distorsión de la estrategia de precios.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Tener un PMI de 15 días es siempre mejor que uno de 40 días?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Generalmente sí, ya que significa que el dinero invertido en stock se recupera en 15 días en lugar de 40. Sin embargo, un PMI extremadamente bajo podría ser una señal de alerta. Podrías estar comprando en cantidades tan pequeñas que pierdes descuentos por volumen o, peor aún, estás sufriendo roturas de stock frecuentes y perdiendo ventas por no tener producto disponible.',
        },
      },
    ],
  },
} as const;

type InputDef = (typeof calculatorData.inputs)[number];
type OutputDef = (typeof calculatorData.outputs)[number];
type States = Record<string, number | ''>;

// --- Client-only Chart wrapper (sidesteps next/dynamic typing issues) ---
const ChartSection = ({
  data,
  formatCurrency,
}: {
  data: Array<Record<string, number | string>>;
  formatCurrency: (n: number) => string;
}) => {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return <div className="h-64 w-full bg-gray-50 p-4 rounded-lg flex items-center justify-center"><p>Cargando gráfico...</p></div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Recharts = require('recharts') as any;
  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } = Recharts;

  return (
    <div className="h-64 w-full bg-gray-50 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v: number) => `€${Number(v) / 1000}k`} />
          <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
          <Legend />
          <Bar dataKey="Stock Promedio" name="Stock Promedio" />
          <Bar dataKey="Coste de Mercancías Vendidas" name="Coste Ventas (CMV)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CalculadoraGestionStock: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates: States = {
    stock_inicial: 50000,
    stock_final: 70000,
    coste_mercancias_vendidas: 400000,
    dias_periodo: 365,
  };
  const [states, setStates] = useState<States>(initialStates);

  const parseNum = (v: number | '') => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

  const handleStateChange = (id: string, value: string) => {
    const def = inputs.find(i => i.id === id) as InputDef | undefined;
    if (value === '') {
      setStates(prev => ({ ...prev, [id]: '' }));
      return;
    }
    const n = Number(value);
    const safe = Number.isFinite(n) ? n : 0;
    const clamped = def?.min != null ? Math.max(def.min, safe) : safe;
    setStates(prev => ({ ...prev, [id]: clamped }));
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const stock_inicial = parseNum(states.stock_inicial);
    const stock_final = parseNum(states.stock_final);
    const coste_mercancias_vendidas = parseNum(states.coste_mercancias_vendidas);
    const dias_periodo = parseNum(states.dias_periodo);

    const stock_promedio = (stock_inicial + stock_final) / 2;
    const indice_rotacion = stock_promedio > 0 ? coste_mercancias_vendidas / stock_promedio : 0;
    const dias_inventario = indice_rotacion > 0 ? dias_periodo / indice_rotacion : 0;

    let interpretacion_rotacion = 'Introduce datos para ver el análisis.';
    let color: 'red' | 'green' | 'blue' | 'gray' = 'gray';
    if (stock_promedio > 0 && coste_mercancias_vendidas > 0) {
      if (indice_rotacion < 3) {
        interpretacion_rotacion =
          'Rotación Lenta: Riesgo de obsolescencia y capital inmovilizado. Considera liquidar stock antiguo.';
        color = 'red';
      } else if (indice_rotacion <= 6) {
        interpretacion_rotacion =
          'Rotación Saludable: Buen equilibrio entre el nivel de stock y la demanda. Continúa monitorizando.';
        color = 'green';
      } else {
        interpretacion_rotacion =
          'Rotación Rápida: Excelente flujo de caja. Vigila el riesgo de roturas de stock.';
        color = 'blue';
      }
    }

    return {
      stock_promedio,
      indice_rotacion,
      dias_inventario,
      interpretacion_rotacion,
      interpretacion_color: color,
    };
  }, [states]);

  const chartData = useMemo(
    () => [
      {
        name: 'Flujo de Stock',
        'Stock Promedio': calculatedOutputs.stock_promedio,
        'Coste de Mercancías Vendidas': parseNum(states.coste_mercancias_vendidas),
      },
    ],
    [calculatedOutputs.stock_promedio, states.coste_mercancias_vendidas],
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatNumber = (value: number, decimals = 2) =>
    new Intl.NumberFormat('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

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
    } catch (e) {
      console.error(e);
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const { interpretacion_color, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: {
        stock_inicial: parseNum(states.stock_inicial),
        stock_final: parseNum(states.stock_final),
        coste_mercancias_vendidas: parseNum(states.coste_mercancias_vendidas),
        dias_periodo: parseNum(states.dias_periodo),
      }, outputs: outputsToSave, ts: Date.now() };
      const existingResults = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('calc_results') || '[]' : '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...existingResults].slice(0, 50)));
      alert('Resultado guardado localmente.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <SeoSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">
                Mide la eficiencia de tu inventario con los KPIs clave para la logística y finanzas.
              </p>
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Aviso:</strong> Esta herramienta proporciona estimaciones para fines informativos y de planificación.
                No reemplaza un análisis contable profesional.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {calculatorData.inputs.map((input: InputDef) => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      <Tooltip text={input.tooltip}>
                        <span className="ml-2 cursor-help"><InfoIcon /></span>
                      </Tooltip>
                    </label>
                    <div className="relative">
                      {input.unit === '€' && (
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                      )}
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className={`w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${input.unit === '€' ? 'pl-8' : 'pl-3'} pr-3 py-2 text-right`}
                        type="number"
                        min={input.min}
                        step={input.step}
                        value={states[input.id] as number | ''}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                      />
                      {input.unit !== '€' && (
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">
                          {input.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">KPIs de Gestión de Stock</h2>
                {calculatorData.outputs.map((output: OutputDef) => {
                  if (output.id === 'interpretacion_rotacion') {
                    const color = calculatedOutputs.interpretacion_color;
                    const bg =
                      color === 'red' ? 'bg-red-50 border-red-500' :
                      color === 'green' ? 'bg-green-50 border-green-500' :
                      color === 'blue' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300';
                    const tx =
                      color === 'red' ? 'text-red-800' :
                      color === 'green' ? 'text-green-800' :
                      color === 'blue' ? 'text-blue-800' : 'text-gray-800';
                    return (
                      <div key={output.id} className={`p-4 rounded-r-lg border-l-4 ${bg}`}>
                        <div className="font-semibold text-base mb-1 text-gray-800">{output.label}</div>
                        <div className={`font-normal text-sm ${tx}`}>
                          {isClient ? calculatedOutputs.interpretacion_rotacion : '...'}
                        </div>
                      </div>
                    );
                  }
                  const rawVal = (calculatedOutputs as any)[output.id] as number;
                  const formatted = output.unit === '€' ? formatCurrency(rawVal) : formatNumber(rawVal);
                  return (
                    <div key={output.id} className="flex items-baseline justify-between bg-gray-50 border-l-4 p-4 rounded-r-lg border-gray-300">
                      <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                      <div className="text-xl md:text-2xl font-bold text-gray-800">
                        <span>{isClient ? formatted : '...'}</span>
                        <span className="text-sm font-normal text-gray-500 ml-2">{output.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Relación Coste vs. Stock Promedio</h3>
                <ChartSection data={chartData} formatCurrency={formatCurrency} />
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-2 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={saveResult} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Guardar
              </button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                PDF
              </button>
              <button onClick={handleReset} className="col-span-2 w-full border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía de Optimización</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.icac.gob.es/principios-y-normas-contables/pgc" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Plan General de Contabilidad (PGC)</a> - Marco normativo para la contabilidad en España.</li>
              <li>Heizer, J., & Render, B. (2014). <em>Principles of Operations Management</em>. Pearson. - Referencia académica en gestión de operaciones.</li>
              <li>Chase, R. B., & Jacobs, F. R. (2013). <em>Operations and Supply Chain Management</em>. McGraw-Hill. - Texto clave en logística.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraGestionStock;
