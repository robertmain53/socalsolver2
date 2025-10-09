'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

/* =========================
 *  Placeholder while loading
 * ========================= */
const ChartLoader = () => (
  <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">
    Cargando gráfico...
  </div>
);

/* =========================
 *  Dynamic Recharts wrapper (SSR-safe)
 * ========================= */
const DynamicRecharts = dynamic(
  () =>
    import('recharts').then((mod) => {
      const RechartsChart = (props: any) => {
        const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } = mod;
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...props}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value: number) => `€${value / 1000}k`} />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value || 0))
                }
              />
              <Legend />
              {/* Construcción */}
              <Bar dataKey="Excavación" stackId="a" />
              <Bar dataKey="Estructura" stackId="a" />
              <Bar dataKey="Equipamiento" stackId="a" />
              <Bar dataKey="Relleno inicial" stackId="a" />
              {/* Mantenimiento */}
              <Bar dataKey="Químicos" stackId="b" />
              <Bar dataKey="Electricidad" stackId="b" />
              <Bar dataKey="Agua" stackId="b" />
            </BarChart>
          </ResponsiveContainer>
        );
      };
      return { default: RechartsChart };
    }),
  { ssr: false, loading: () => <ChartLoader /> }
);

/* =========================
 *  Component Metadata
 * ========================= */
export const meta = {
  title: 'Calculadora de Coste de una Piscina (construcción y mantenimiento)',
  description:
    'Estima de forma precisa el coste total de construir y mantener una piscina. Compara materiales, equipamiento y calcula los gastos anuales.',
};

/* =========================
 *  Helper Components
 * ========================= */
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = ({ schema }: { schema: any }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### '))
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace('### ', '')) }}
            />
          );
        if (trimmedBlock.startsWith('1.') || trimmedBlock.startsWith('2.') || trimmedBlock.startsWith('3.')) {
          const items = trimmedBlock.split('\n');
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />
              ))}
            </ol>
          );
        }
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n');
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />
              ))}
            </ul>
          );
        }
        if (trimmedBlock)
          return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        return null;
      })}
    </div>
  );
};

/* =========================
 *  Calculator Data
 * ========================= */
type InputSpec =
  | {
      id: string;
      label: string;
      type: 'number';
      unit?: string;
      min?: number;
      max?: number;
      step?: number;
      tooltip: string;
      section: 'construccion' | 'mantenimiento';
    }
  | {
      id: string;
      label: string;
      type: 'select';
      options: string[];
      tooltip: string;
      section: 'construccion' | 'mantenimiento';
    }
  | {
      id: 'extras';
      label: string;
      type: 'checkbox';
      options: { id: 'luces_led' | 'bomba_calor' | 'cubierta'; label: string }[];
      tooltip: string;
      section: 'construccion';
    };

const calculatorData = {
  slug: 'calculadora-coste-piscina',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Coste de una Piscina (construcción y mantenimiento)',
  lang: 'es',
  inputs: [
    {
      id: 'largo',
      label: 'Largo de la piscina',
      type: 'number',
      unit: 'm',
      min: 2,
      step: 0.5,
      tooltip:
        'Introduce el largo interior de la piscina en metros. El tamaño estándar suele ser de 8 metros.',
      section: 'construccion',
    },
    {
      id: 'ancho',
      label: 'Ancho de la piscina',
      type: 'number',
      unit: 'm',
      min: 2,
      step: 0.5,
      tooltip:
        'Introduce el ancho interior de la piscina en metros. El tamaño estándar suele ser de 4 metros.',
      section: 'construccion',
    },
    {
      id: 'profundidad_media',
      label: 'Profundidad media',
      type: 'number',
      unit: 'm',
      min: 1,
      step: 0.1,
      tooltip:
        'Introduce la profundidad media. Si tiene fondo inclinado, calcula: (profundidad mínima + profundidad máxima) / 2. Un valor común es 1.5 metros.',
      section: 'construccion',
    },
    {
      id: 'tipo_piscina',
      label: 'Tipo de estructura',
      type: 'select',
      options: ['Hormigón proyectado (gunitado)', 'Poliéster prefabricado', 'Paneles de acero con liner'],
      tooltip:
        'Elige el material principal de la estructura. El hormigón es el más duradero y personalizable, mientras que el poliéster es más rápido de instalar.',
      section: 'construccion',
    },
    {
      id: 'tipo_revestimiento',
      label: 'Tipo de revestimiento',
      type: 'select',
      options: ['Gresite', 'Liner', 'Porcelánico', 'Microcemento'],
      tooltip:
        'Selecciona el acabado interior. El gresite es el más común. El liner es obligatorio para piscinas de acero. El porcelánico y el microcemento son opciones premium.',
      section: 'construccion',
    },
    {
      id: 'tipo_cloracion',
      label: 'Sistema de desinfección',
      type: 'select',
      options: ['Cloración salina', 'Cloro tradicional (pastillas/líquido)'],
      tooltip:
        'La cloración salina tiene un coste inicial mayor pero un mantenimiento más económico y agradable. El cloro tradicional es más barato de instalar pero requiere más atención.',
      section: 'construccion',
    },
    {
      id: 'extras',
      label: 'Equipamiento y extras',
      type: 'checkbox',
      options: [
        { id: 'luces_led', label: 'Iluminación LED (2 focos)' },
        { id: 'bomba_calor', label: 'Bomba de calor (para alargar temporada)' },
        { id: 'cubierta', label: 'Cubierta de seguridad/invierno' },
      ],
      tooltip: 'Selecciona los elementos adicionales que deseas incluir en el presupuesto de construcción.',
      section: 'construccion',
    },
    {
      id: 'precio_relleno_inicial',
      label: 'Precio de relleno inicial (€/m³)',
      type: 'number',
      unit: '€/m³',
      min: 0.3,
      step: 0.1,
      tooltip:
        'Coste del agua para el llenado inicial de la piscina. Se incluye en el coste total de construcción.',
      section: 'construccion',
    },
    {
      id: 'meses_uso',
      label: 'Meses de uso al año',
      type: 'number',
      unit: 'meses',
      min: 1,
      max: 12,
      step: 1,
      tooltip:
        'Indica cuántos meses al año planeas usar la piscina. Esto afecta directamente al coste de electricidad y productos químicos.',
      section: 'mantenimiento',
    },
    {
      id: 'precio_kwh',
      label: 'Coste de la electricidad',
      type: 'number',
      unit: '€/kWh',
      min: 0.05,
      step: 0.01,
      tooltip:
        'Introduce el precio por kilovatio-hora que pagas en tu factura de la luz. El precio medio en España ronda los 0.15 - 0.25 €/kWh.',
      section: 'mantenimiento',
    },
    {
      id: 'precio_m3_agua',
      label: 'Coste del agua (mantenimiento)',
      type: 'number',
      unit: '€/m³',
      min: 0.5,
      step: 0.1,
      tooltip:
        'Precio del agua para reposiciones anuales (evaporación, limpieza). No incluye el llenado inicial.',
      section: 'mantenimiento',
    },
  ] as InputSpec[],
  outputs: [
    { id: 'coste_excavacion', label: 'Coste estimado de excavación y permisos', unit: '€' },
    { id: 'coste_estructura', label: 'Coste estimado de vaso y revestimiento', unit: '€' },
    { id: 'coste_equipamiento', label: 'Coste estimado de filtración y extras', unit: '€' },
    { id: 'coste_construccion_total', label: 'COSTE TOTAL DE CONSTRUCCIÓN (ESTIMADO)', unit: '€', isPrimary: true },
    { id: 'coste_quimicos_anual', label: 'Coste anual en productos químicos', unit: '€/año' },
    { id: 'coste_electricidad_anual', label: 'Coste anual de electricidad (filtración)', unit: '€/año' },
    { id: 'coste_agua_anual', label: 'Coste anual de agua (rellenado)', unit: '€/año' },
    { id: 'coste_mantenimiento_anual', label: 'COSTE DE MANTENIMIENTO ANUAL (ESTIMADO)', unit: '€/año', isPrimary: true },
    { id: 'coste_total_primer_ano', label: 'INVERSIÓN TOTAL PRIMER AÑO', unit: '€', isPrimary: true },
  ],
  content: '...',
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Necesito una licencia de obra para construir una piscina?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí, en la gran mayoría de los municipios españoles se requiere una Licencia de Obra Menor. El proceso y coste varían, pero es un trámite obligatorio. Nuestra calculadora incluye una estimación para este concepto.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto se tarda en construir una piscina?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Depende del tipo. Una piscina de poliéster puede estar lista en menos de una semana. Una de hormigón requiere entre 8 y 12 semanas.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cloración salina o cloro tradicional? ¿Cuál es mejor?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'La cloración salina tiene un coste inicial más alto pero el mantenimiento es más barato y el agua más agradable. A largo plazo suele ser más económica.',
        },
      },
    ],
  },
};

calculatorData.content = `### Introducción

(omesso per brevità: mantieni il tuo testo lungo qui)
`;

/* =========================
 *  Main Component
 * ========================= */
type States = {
  largo: number;
  ancho: number;
  profundidad_media: number;
  tipo_piscina: string;
  tipo_revestimiento: string;
  tipo_cloracion: 'Cloración salina' | 'Cloro tradicional (pastillas/líquido)';
  extras: { luces_led: boolean; bomba_calor: boolean; cubierta: boolean };
  precio_relleno_inicial: number;
  meses_uso: number;
  precio_kwh: number;
  precio_m3_agua: number;
};

const CalculadoraCostePiscina: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const initialStates: States = {
    largo: 8,
    ancho: 4,
    profundidad_media: 1.5,
    tipo_piscina: 'Hormigón proyectado (gunitado)',
    tipo_revestimiento: 'Gresite',
    tipo_cloracion: 'Cloración salina',
    extras: { luces_led: true, bomba_calor: false, cubierta: false },
    precio_relleno_inicial: 1.8,
    meses_uso: 5,
    precio_kwh: 0.2,
    precio_m3_agua: 2.0,
  };

  const [states, setStates] = useState<States>(initialStates);
  const [compareBoth, setCompareBoth] = useState<boolean>(true);

  const handleStateChange = (id: string, value: any) => setStates((prev) => ({ ...prev, [id]: value }));
  const handleCheckboxChange = (id: 'luces_led' | 'bomba_calor' | 'cubierta', checked: boolean) => {
    setStates((prev) => ({ ...prev, extras: { ...prev.extras, [id]: checked } }));
  };
  const handleReset = () => {
    setStates(initialStates);
    setCompareBoth(true);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);

  // --- Cálculo centralizado: evita el patrón useMemo({...}, [deps]) que te rompía el parser ---
  const computeFor = (sistema: States['tipo_cloracion']) => {
    const {
      largo,
      ancho,
      profundidad_media,
      tipo_piscina,
      tipo_revestimiento,
      extras,
      meses_uso,
      precio_kwh,
      precio_m3_agua,
      precio_relleno_inicial,
    } = states;

    const PRECIOS = {
      excavacion_m3: 45,
      permiso_obra: 800,
      estructura: {
        'Hormigón proyectado (gunitado)': 160,
        'Poliéster prefabricado': 130,
        'Paneles de acero con liner': 110,
      } as Record<string, number>,
      revestimiento: { Gresite: 55, Liner: 35, Porcelánico: 80, Microcemento: 90 } as Record<string, number>,
      equipamiento: {
        base_filtracion: 1200,
        'Cloración salina': 1000,
        'Cloro tradicional (pastillas/líquido)': 150,
      } as Record<string, number>,
      extras: { luces_led: 600, bomba_calor: 2000, cubierta: 1500 },
      mantenimiento: { quimicos_cloro_m3_ano: 5, quimicos_sal_m3_ano: 2, potencia_bomba_kw: 0.75 },
    };

    // Dimensiones
    const volumen = Math.max(0, Number(largo) * Number(ancho) * Number(profundidad_media));
    const superficie_suelo = Math.max(0, Number(largo) * Number(ancho));
    const superficie_paredes = Math.max(0, 2 * (Number(largo) + Number(ancho)) * Number(profundidad_media));
    const superficie_total = superficie_suelo + superficie_paredes;

    // Construcción
    const coste_excavacion = volumen * PRECIOS.excavacion_m3 + PRECIOS.permiso_obra;
    const coste_estructura_base = superficie_total * (PRECIOS.estructura[tipo_piscina] ?? 150);
    const coste_revestimiento_base = superficie_total * (PRECIOS.revestimiento[tipo_revestimiento] ?? 50);
    const coste_estructura = coste_estructura_base + coste_revestimiento_base;

    let coste_extras = 0;
    if (extras?.luces_led) coste_extras += PRECIOS.extras.luces_led;
    if (extras?.bomba_calor) coste_extras += PRECIOS.extras.bomba_calor;
    if (extras?.cubierta) coste_extras += PRECIOS.extras.cubierta;

    const coste_equipamiento =
      PRECIOS.equipamiento.base_filtracion + (PRECIOS.equipamiento[sistema] ?? 150) + coste_extras;

    // Relleno inicial (en construcción)
    const coste_relleno_inicial_total = volumen * (Number(precio_relleno_inicial) || 0);

    const coste_construccion_total = coste_excavacion + coste_estructura + coste_equipamiento + coste_relleno_inicial_total;

    // Mantenimiento
    const factor_quimico =
      sistema === 'Cloración salina'
        ? PRECIOS.mantenimiento.quimicos_sal_m3_ano
        : PRECIOS.mantenimiento.quimicos_cloro_m3_ano;

    const mesesUsoClamped = Math.min(12, Math.max(1, Number(meses_uso) || 1));
    const coste_quimicos_anual = volumen * factor_quimico * (mesesUsoClamped / 12);

    // Filtración: 4–12 h/día
    const horas_filtracion_dia = Math.min(12, Math.max(4, volumen / 15));
    const coste_electricidad_anual =
      PRECIOS.mantenimiento.potencia_bomba_kw *
      horas_filtracion_dia *
      30 *
      mesesUsoClamped *
      (Number(precio_kwh) || 0);

    // Reposición de agua anual ≈ 25% del volumen
    const coste_agua_anual = volumen * 0.25 * (Number(precio_m3_agua) || 0);

    const coste_mantenimiento_anual = coste_quimicos_anual + coste_electricidad_anual + coste_agua_anual;
    const coste_total_primer_ano = coste_construccion_total + coste_mantenimiento_anual;

    const fix = (n: number) => Math.max(0, Number((n ?? 0).toFixed(2)));

    return {
      volumen,
      coste_excavacion: fix(coste_excavacion),
      coste_estructura: fix(coste_estructura),
      coste_equipamiento: fix(coste_equipamiento),
      coste_relleno_inicial: fix(coste_relleno_inicial_total),
      coste_construccion_total: fix(coste_construccion_total),
      coste_quimicos_anual: fix(coste_quimicos_anual),
      coste_electricidad_anual: fix(coste_electricidad_anual),
      coste_agua_anual: fix(coste_agua_anual),
      coste_mantenimiento_anual: fix(coste_mantenimiento_anual),
      coste_total_primer_ano: fix(coste_total_primer_ano),
    };
  };

  // Resultados memoizados por estado (sintaxis segura)
  const outputsSal = useMemo(() => computeFor('Cloración salina'), [states]);
  const outputsCloro = useMemo(
    () => computeFor('Cloro tradicional (pastillas/líquido)'),
    [states]
  );
  const outputsSelected =
    states.tipo_cloracion === 'Cloración salina' ? outputsSal : outputsCloro;

  // Datos para gráfico
  const chartData = useMemo(() => {
    if (compareBoth) {
      return [
        {
          name: 'Construcción (Sal)',
          Excavación: outputsSal.coste_excavacion,
          Estructura: outputsSal.coste_estructura,
          Equipamiento: outputsSal.coste_equipamiento,
          'Relleno inicial': outputsSal.coste_relleno_inicial,
        },
        {
          name: 'Mantenimiento (Sal)',
          Químicos: outputsSal.coste_quimicos_anual,
          Electricidad: outputsSal.coste_electricidad_anual,
          Agua: outputsSal.coste_agua_anual,
        },
        {
          name: 'Construcción (Cloro)',
          Excavación: outputsCloro.coste_excavacion,
          Estructura: outputsCloro.coste_estructura,
          Equipamiento: outputsCloro.coste_equipamiento,
          'Relleno inicial': outputsCloro.coste_relleno_inicial,
        },
        {
          name: 'Mantenimiento (Cloro)',
          Químicos: outputsCloro.coste_quimicos_anual,
          Electricidad: outputsCloro.coste_electricidad_anual,
          Agua: outputsCloro.coste_agua_anual,
        },
      ];
    }
    return [
      {
        name: 'Construcción',
        Excavación: outputsSelected.coste_excavacion,
        Estructura: outputsSelected.coste_estructura,
        Equipamiento: outputsSelected.coste_equipamiento,
        'Relleno inicial': outputsSelected.coste_relleno_inicial,
      },
      {
        name: 'Mantenimiento Anual',
        Químicos: outputsSelected.coste_quimicos_anual,
        Electricidad: outputsSelected.coste_electricidad_anual,
        Agua: outputsSelected.coste_agua_anual,
      },
    ];
  }, [compareBoth, outputsSal, outputsCloro, outputsSelected]);

  const handleExportPDF = useCallback(async () => {
    if (!calculatorRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', putOnlyUsedFonts: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('Error al exportar a PDF. Por favor, inténtelo de nuevo.');
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        inputs: { ...states, compareBoth },
        outputs: compareBoth ? { sal: outputsSal, cloro: outputsCloro } : outputsSelected,
        ts: Date.now(),
      };
      const savedResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...savedResults].slice(0, 10)));
      alert('Resultado guardado en el almacenamiento local.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, outputsSal, outputsCloro, outputsSelected, compareBoth, slug, title]);

  // Cards de resultado
  const ResultCards = ({ data, title }: { data: any; title: string }) => (
    <div className="space-y-3">
      <div className="text-sm uppercase tracking-wide text-gray-500">{title}</div>
      {outputs.map((output: any) => (
        <div
          key={output.id}
          className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
            output.isPrimary ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'
          }`}
        >
          <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
          <div className={`text-xl md:text-2xl font-bold ${output.isPrimary ? 'text-blue-600' : 'text-gray-800'}`}>
            <span>{isClient ? formatCurrency(data[output.id]) : '...'}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <FaqSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{meta.description}</p>

            <div className="space-y-8">
              {/* --- SECCIÓN CONSTRUCCIÓN --- */}
              <div>
                <h2 className="text-xl font-bold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4">
                  🏗️ 1. Costes de Construcción
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
                  {inputs
                    .filter((i) => i.section === 'construccion')
                    .map((input: InputSpec) => (
                      <div key={input.id} className={(input as any).type === 'checkbox' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                          {input.label}
                          <Tooltip text={(input as any).tooltip}>
                            <span className="ml-2">
                              <InfoIcon />
                            </span>
                          </Tooltip>
                        </label>

                        {input.type === 'number' && (
                          <div className="flex items-center gap-2">
                            <input
                              id={input.id}
                              type="number"
                              min={input.min}
                              step={input.step}
                              value={(states as any)[input.id]}
                              onChange={(e) => handleStateChange(input.id, Number(e.target.value))}
                              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            />
                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                          </div>
                        )}

                        {input.type === 'select' && (
                          <select
                            id={input.id}
                            value={(states as any)[input.id]}
                            onChange={(e) => handleStateChange(input.id, e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          >
                            {input.options?.map((opt: string) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {input.type === 'checkbox' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-white border rounded-md">
                            {input.options?.map((opt) => (
                              <div key={opt.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={opt.id}
                                  checked={!!states.extras[opt.id]}
                                  onChange={(e) => handleCheckboxChange(opt.id, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={opt.id} className="text-sm text-gray-600">
                                  {opt.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* --- SECCIÓN MANTENIMIENTO --- */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-teal-700 border-b-2 border-teal-200 pb-2 mb-4">
                    ⚙️ 2. Costes de Mantenimiento
                  </h2>
                  {/* Switch confronto */}
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                      checked={compareBoth}
                      onChange={(e) => setCompareBoth(e.target.checked)}
                    />
                    Comparar cloración salina vs cloro
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
                  {inputs
                    .filter((i) => i.section === 'mantenimiento')
                    .map((input: any) => (
                      <div key={input.id}>
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                          {input.label}
                          <Tooltip text={input.tooltip}>
                            <span className="ml-2">
                              <InfoIcon />
                            </span>
                          </Tooltip>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id={input.id}
                            type="number"
                            min={input.min}
                            max={input.max}
                            step={input.step}
                            value={(states as any)[input.id]}
                            onChange={(e) => handleStateChange(input.id, Number(e.target.value))}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          />
                          {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* --- RESULTADOS --- */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Resultados de la Estimación</h2>

              {compareBoth ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResultCards data={outputsSal} title="Cloración salina" />
                  <ResultCards data={outputsCloro} title="Cloro tradicional" />
                </div>
              ) : (
                <div className="space-y-3">
                  {outputs.map((output: any) => (
                    <div
                      key={output.id}
                      className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                        output.isPrimary ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                      <div className={`text-xl md:text-2xl font-bold ${output.isPrimary ? 'text-blue-600' : 'text-gray-800'}`}>
                        <span>{isClient ? formatCurrency((outputsSelected as any)[output.id]) : '...'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- GRÁFICO --- */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose Visual de Costes</h3>
              <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                {isClient && <DynamicRecharts data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }} />}
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleSaveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                💾 Guardar Resultado
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                📄 Exportar a PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                🔄 Resetear Calculadora
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía de Comprensión</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a href="https://www.codigotecnico.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Código Técnico de la Edificación (CTE)
                </a>{' '}
                - Normativa que regula la construcción en España.
              </li>
              <li>
                <a href="https://www.ocu.org/vivienda-y-energia/gas-luz/informe/tarifas-luz" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  OCU - Tarifas de luz y agua
                </a>{' '}
                - Para consultar precios actualizados de suministros.
              </li>
              <li>
                <a href="https://www.aso-fap.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  ASOFAP
                </a>{' '}
                - Asociación Española de Profesionales del Sector Piscinas.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCostePiscina;
