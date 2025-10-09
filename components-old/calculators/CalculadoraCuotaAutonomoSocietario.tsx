'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

/* ---------------------------------- META ---------------------------------- */

export const meta = {
  title: 'Calculadora de la cuota de autónomo societario',
  description:
    'Estima tu cuota mensual de autónomo societario con el nuevo sistema de cotización por ingresos reales de 2025. Incluye Tarifa Plana.',
} as const;

/* ------------------------------ UI: Tooltip etc ---------------------------- */

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

/* ----------------------------- SEO: JSON-LD FAQ ---------------------------- */

const FaqSchema = ({ schema }: { schema: Record<string, unknown> }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

/* --------------------------- Content (safe renderer) ------------------------ */

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="text-sm bg-gray-100 p-1 rounded">$1</code>');

  const blocks = content.split('\n\n');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.replace('### ', '')) }}
            />
          );
        }

        if (trimmed.startsWith('*')) {
          const items = trimmed.split('\n').map((item) => item.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ul>
          );
        }

        if (/^\d\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').map((item) => item.replace(/^\d\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ol>
          );
        }

        return (
          <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed) }} />
        );
      })}
    </div>
  );
};

/* --------------------------------- TYPES ----------------------------------- */

type NumberInputDef = {
  id: 'rendimientos_netos_mensuales';
  label: string;
  type: 'number';
  unit: '€';
  min: number;
  step: number;
  tooltip?: string;
};

type BooleanInputDef = {
  id: 'es_nuevo_autonomo';
  label: string;
  type: 'boolean';
  tooltip?: string;
};

type InputDef = NumberInputDef | BooleanInputDef;

type OutputId = 'tramo_ingresos' | 'base_cotizacion_resultante' | 'cuota_mensual';

type OutputDef = {
  id: OutputId;
  label: string;
  unit: '' | '€';
};

type States = {
  rendimientos_netos_mensuales: number;
  es_nuevo_autonomo: boolean;
};

type Tramo = {
  tramo: number;
  /** Lower bound inclusive unless special-cased for tramo 2 in finder logic */
  min: number;
  /** Upper bound inclusive; null = no upper bound */
  max: number | null;
  base_minima: number;
  base_maxima: number;
  tramo_label: string;
};

/* --------------------------- STATIC CALC DATA ------------------------------- */

const calculatorData = {
  slug: 'calculadora-cuota-autonomo-societario',
  category: 'Impuestos y trabajo autónomo',
  title: 'Calculadora de la cuota de autónomo societario',
  lang: 'es',
  tags:
    'cuota autonomo societario, calculadora autonomos 2025, RETA, seguridad social, base cotizacion, ingresos reales, autonomo societario',
  inputs: [
    {
      id: 'rendimientos_netos_mensuales',
      label: 'Rendimientos netos mensuales previstos',
      type: 'number',
      unit: '€',
      min: 0,
      step: 50,
      tooltip:
        'Introduce tu previsión de ingresos mensuales menos los gastos deducibles. Para autónomos societarios, se aplica una deducción genérica del 3% sobre los ingresos, no del 7%. Ejemplo: (Ingresos Totales - Gastos Deducibles) / 12.',
    } as NumberInputDef,
    {
      id: 'es_nuevo_autonomo',
      label: '¿Te das de alta por primera vez o no has estado de alta en los últimos 2 años?',
      type: 'boolean',
      tooltip:
        'Marca esta casilla si tienes derecho a la Cuota Reducida (o Tarifa Plana). Esto aplicará una cuota fija de 80€ durante los primeros 12 meses.',
    } as BooleanInputDef,
  ] as const satisfies Readonly<InputDef[]>,
  outputs: [
    { id: 'tramo_ingresos', label: 'Tramo de Rendimientos Netos', unit: '' },
    { id: 'base_cotizacion_resultante', label: 'Base de Cotización Mensual', unit: '€' },
    { id: 'cuota_mensual', label: 'Cuota de Autónomo Mensual a Pagar', unit: '€' },
  ] as const satisfies Readonly<OutputDef[]>,
  examples: [] as const,
  content:
    '### Introducción\n\nEste calculador te permite estimar tu cuota mensual como **autónomo societario** en el nuevo sistema de cotización basado en los ingresos reales, actualizado para 2025. Es una herramienta esencial para administradores y socios trabajadores de sociedades mercantiles que necesitan determinar su cotización a la Seguridad Social.\n\n### Guía para Usar la Calculadora\n\n- **Rendimientos netos mensuales previstos**: Es el campo más importante. Debes estimar tu beneficio neto mensual. Se calcula como `(Ingresos anuales - Gastos deducibles) / 12`. Recuerda que para los autónomos societarios y familiares colaboradores, la deducción por gastos genéricos es del **3%**, a diferencia del 7% de los autónomos personas físicas.\n- **¿Te das de alta por primera vez...?**: Marca esta opción si cumples los requisitos para la **Cuota Reducida** (conocida como "Tarifa Plana"). Esto reducirá tu cuota a un importe fijo (actualmente 80€) durante los primeros 12 meses, con posibilidad de prórroga.\n\n### Metodología de Cálculo Explicada\n\nEl cálculo se basa en el sistema de tramos de ingresos aprobado en el Real Decreto-ley 13/2022. La lógica aplicada es la siguiente:\n\n1.  **Identificación del Tramo**: Según tus rendimientos netos, te ubicamos en uno de los 15 tramos oficiales.\n2.  **Determinación de la Base Mínima**: Cada tramo tiene una base de cotización mínima y máxima. Sin embargo, para los **autónomos societarios**, existe una regla crucial: su base mínima de cotización **nunca puede ser inferior a la base mínima establecida para el grupo de cotización 1 del Régimen General**. Para 2025, esta base se sitúa en torno a 1.050 €. La calculadora compara la base mínima de tu tramo con esta base mínima absoluta y elige la más alta de las dos.\n3.  **Cálculo de la Cuota**: La cuota mensual se obtiene aplicando los tipos de cotización por contingencias comunes, profesionales, cese de actividad y formación (aproximadamente un **31,3%**) a la base de cotización resultante.\n4.  **Aplicación de la Tarifa Plana**: Si tienes derecho, la cuota calculada es reemplazada por la cuota reducida fija de 80 €.\n\n### Análisis a Fondo: Las Claves del Autónomo Societario\n\nSer autónomo societario conlleva especificidades que las calculadoras genéricas suelen ignorar. La más relevante es la **base mínima de cotización**, que actúa como un "suelo" protector para el sistema, independientemente de que se tengan ingresos muy bajos o incluso pérdidas.\n\nEsta regla deriva de que la ley presupone una mayor capacidad económica y una estructura más sólida detrás de un socio de una sociedad frente a un trabajador por cuenta propia individual. Aunque tus rendimientos netos sean de 900 €, tu base de cotización mínima será superior a la de un autónomo persona física con los mismos ingresos.\n\nOtra diferencia fundamental es la **deducción por gastos genéricos**. Mientras un autónomo estándar puede deducir un 7% de forma simplificada, para el societario este importe se limita al 3%. Es vital tenerlo en cuenta al calcular los "rendimientos netos" para no cometer errores en la estimación.\n\n### Preguntas Frecuentes (FAQ)\n\n**1. ¿Un autónomo societario puede acceder a la Tarifa Plana?**\nSí, rotundamente. Desde 2023, los autónomos societarios pueden beneficiarse de la cuota reducida de 80 €/mes en las mismas condiciones que el resto de autónomos: no haber estado de alta en el RETA en los 2 años anteriores (3 años en caso de haber disfrutado previamente de la bonificación).\n\n**2. ¿Qué pasa si mis ingresos reales son diferentes a los que he previsto?**\nEl sistema se basa en una previsión. Al finalizar el año fiscal, la Seguridad Social cruzará los datos con la Agencia Tributaria. Si has cotizado por una base inferior a la que te correspondía por tus rendimientos finales, deberás abonar la diferencia. Si cotizaste de más, la Seguridad Social te devolverá el exceso de oficio.\n\n**3. ¿Por qué mi base mínima es tan alta aunque tenga pocos ingresos?**\nEsta es la característica principal del autónomo societario. La ley establece que tu base de cotización no puede ser inferior a la del grupo 1 del Régimen General, independientemente de que tus rendimientos te sitúen en un tramo inferior. Esto garantiza una contribución mínima más elevada al sistema.',
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Un autónomo societario puede acceder a la Tarifa Plana?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, rotundamente. Desde 2023, los autónomos societarios pueden beneficiarse de la cuota reducida de 80 €/mes en las mismas condiciones que el resto de autónomos: no haber estado de alta en el RETA en los 2 años anteriores (3 años en caso de haber disfrutado previamente de la bonificación).',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué pasa si mis ingresos reales son diferentes a los que he previsto?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El sistema se basa en una previsión. Al finalizar el año fiscal, la Seguridad Social cruzará los datos con la Agencia Tributaria. Si has cotizado por una base inferior a la que te correspondía por tus rendimientos finales, deberás abonar la diferencia. Si cotizaste de más, la Seguridad Social te devolverá el exceso de oficio.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Por qué mi base mínima es tan alta aunque tenga pocos ingresos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Esta es la característica principal del autónomo societario. La ley establece que tu base de cotización no puede ser inferior a la del grupo 1 del Régimen General, independientemente de que tus rendimientos te sitúen en un tramo inferior. Esto garantiza una contribución mínima más elevada al sistema.',
        },
      },
    ],
  },
} as const;

/* ---------------------------- CONSTS & TRAMOS ------------------------------- */

const TARIFA_PLANA_EUR = 80 as const;
const TIPO_COTIZACION = 0.313 as const;
const BASE_MINIMA_SOCIETARIO = 1050 as const; // referencia 2025

// Nota: Evitamos solapamientos diseñando el "finder" con reglas de borde.
const TRAMOS_COTIZACION_2025: Tramo[] = [
  { tramo: 1, min: 0, max: 670, base_minima: 735.29, base_maxima: 735.29, tramo_label: 'Inferior o igual a 670€' },
  { tramo: 2, min: 670, max: 900, base_minima: 751.63, base_maxima: 900, tramo_label: 'Entre 670€ y 900€' },
  { tramo: 3, min: 900, max: 1166.7, base_minima: 816.99, base_maxima: 1166.7, tramo_label: 'Entre 900€ y 1.166,70€' },
  { tramo: 4, min: 1166.7, max: 1300, base_minima: 950.98, base_maxima: 1300, tramo_label: 'Entre 1.166,70€ y 1.300€' },
  { tramo: 5, min: 1300, max: 1500, base_minima: 960.78, base_maxima: 1500, tramo_label: 'Entre 1.300€ y 1.500€' },
  { tramo: 6, min: 1500, max: 1700, base_minima: 1045.75, base_maxima: 1700, tramo_label: 'Entre 1.500€ y 1.700€' },
  { tramo: 7, min: 1700, max: 1850, base_minima: 1062.09, base_maxima: 1850, tramo_label: 'Entre 1.700€ y 1.850€' },
  { tramo: 8, min: 1850, max: 2030, base_minima: 1078.43, base_maxima: 2030, tramo_label: 'Entre 1.850€ y 2.030€' },
  { tramo: 9, min: 2030, max: 2330, base_minima: 1111.11, base_maxima: 2330, tramo_label: 'Entre 2.030€ y 2.330€' },
  { tramo: 10, min: 2330, max: 2760, base_minima: 1176.47, base_maxima: 2760, tramo_label: 'Entre 2.330€ y 2.760€' },
  { tramo: 11, min: 2760, max: 3190, base_minima: 1274.51, base_maxima: 3190, tramo_label: 'Entre 2.760€ y 3.190€' },
  { tramo: 12, min: 3190, max: 3620, base_minima: 1372.55, base_maxima: 3620, tramo_label: 'Entre 3.190€ y 3.620€' },
  { tramo: 13, min: 3620, max: 4050, base_minima: 1470.59, base_maxima: 4050, tramo_label: 'Entre 3.620€ y 4.050€' },
  { tramo: 14, min: 4050, max: 6000, base_minima: 1633.99, base_maxima: 4720.59, tramo_label: 'Entre 4.050€ y 6.000€' },
  { tramo: 15, min: 6000, max: null, base_minima: 1928.1, base_maxima: 4720.59, tramo_label: 'Más de 6.000€' },
] as const;

/* ------------------------------- COMPONENT ---------------------------------- */

const CalculadoraCuotaAutonomoSocietario: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false); // keeps PDF/export/UI parity safe

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialStates: States = {
    rendimientos_netos_mensuales: 2000,
    es_nuevo_autonomo: false,
  };

  const [states, setStates] = useState<States>(initialStates);

  const handleStateChange = <K extends keyof States>(id: K, value: States[K]) => {
    setStates((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => setStates(initialStates);

  const findTramo = (rend: number): Tramo => {
    // Regla de bordes:
    // - tramo 1: rend <= 670
    // - tramo 2..14: min < rend <= max (para evitar solapamiento con el límite inferior)
    // - tramo 15: rend >= 6000
    if (rend <= 670) return TRAMOS_COTIZACION_2025[0];
    for (let i = 1; i < TRAMOS_COTIZACION_2025.length - 1; i++) {
      const t = TRAMOS_COTIZACION_2025[i];
      if (t.max !== null && rend > t.min && rend <= t.max) return t;
    }
    // tramo final (>= 6000)
    return TRAMOS_COTIZACION_2025[TRAMOS_COTIZACION_2025.length - 1];
  };

  const calculatedOutputs = useMemo(() => {
    const rn = Number(states.rendimientos_netos_mensuales);
    const rend = Number.isFinite(rn) && rn >= 0 ? rn : 0;

    if (states.es_nuevo_autonomo) {
      return {
        tramo_ingresos: 'Aplica Tarifa Plana',
        base_cotizacion_resultante: 0,
        cuota_mensual: TARIFA_PLANA_EUR,
      } as const;
    }

    const tramoSel = findTramo(rend);
    const base_minima_tramo = tramoSel.base_minima;
    const base_cotizacion_resultante = Math.max(base_minima_tramo, BASE_MINIMA_SOCIETARIO);
    const cuota_mensual = base_cotizacion_resultante * TIPO_COTIZACION;

    return {
      tramo_ingresos: tramoSel.tramo_label,
      base_cotizacion_resultante,
      cuota_mensual,
    } as const;
  }, [states.es_nuevo_autonomo, states.rendimientos_netos_mensuales]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calcolatoreRef.current) return;
      const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('La función PDF no está disponible en este entorno.');
    }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        inputs: states,
        outputs: calculatedOutputs,
        ts: Date.now(),
      };
      const prev = JSON.parse(localStorage.getItem('calc_results') || '[]') as unknown[];
      localStorage.setItem('calc_results', JSON.stringify([payload, ...prev].slice(0, 50)));
      alert('¡Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <>
      <FaqSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-0 lg:p-6" ref={calcolatoreRef}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">{meta.description}</p>
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Aviso legal:</strong> Esta herramienta ofrece una simulación con fines puramente informativos y
                no sustituye el asesoramiento profesional. Los cálculos se basan en la normativa proyectada para 2025.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => {
                  const inputLabel = (
                    <label
                      key={`${input.id}-label`}
                      className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                      htmlFor={input.id}
                    >
                      {input.label}
                      {'tooltip' in input && input.tooltip ? (
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2 cursor-help">
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      ) : null}
                    </label>
                  );

                  if (input.type === 'boolean') {
                    return (
                      <div
                        key={input.id}
                        className="md:col-span-1 flex items-center gap-3 p-3 rounded-md bg-white border"
                      >
                        <input
                          id={input.id}
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={states.es_nuevo_autonomo}
                          onChange={(e) => handleStateChange('es_nuevo_autonomo', e.target.checked)}
                        />
                        <label className="text-sm font-medium text-gray-700 flex-1" htmlFor={input.id}>
                          {input.label}
                          {input.tooltip ? (
                            <Tooltip text={input.tooltip}>
                              <span className="ml-2 inline-block lg:hidden">
                                <InfoIcon />
                              </span>
                            </Tooltip>
                          ) : null}
                        </label>
                      </div>
                    );
                  }

                  // number input
                  return (
                    <div key={input.id}>
                      {inputLabel}
                      <div className="flex items-center gap-2">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          type="number"
                          min={input.min}
                          step={input.step}
                          value={Number.isFinite(states.rendimientos_netos_mensuales)
                            ? states.rendimientos_netos_mensuales
                            : ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            // Normalize: empty -> 0; else -> Number
                            handleStateChange(
                              'rendimientos_netos_mensuales',
                              v === '' ? 0 : Number.isNaN(Number(v)) ? 0 : Number(v),
                            );
                          }}
                        />
                        {input.unit ? <span className="text-sm text-gray-500">{input.unit}</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados de la Simulación</h2>
                {outputs.map((output) => {
                  const value =
                    output.id === 'tramo_ingresos'
                      ? calculatedOutputs.tramo_ingresos
                      : output.id === 'base_cotizacion_resultante'
                      ? formatCurrency(calculatedOutputs.base_cotizacion_resultante)
                      : formatCurrency(calculatedOutputs.cuota_mensual);

                  return (
                    <div
                      key={output.id}
                      className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                        output.id === 'cuota_mensual'
                          ? 'bg-indigo-50 border-indigo-500'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                      <div
                        className={`text-xl md:text-2xl font-bold ${
                          output.id === 'cuota_mensual' ? 'text-indigo-600' : 'text-gray-800'
                        }`}
                      >
                        <span>{isClient ? value : '...'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={salvaRisultato}
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía para Entender el Cálculo</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2022-12482"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Real Decreto-ley 13/2022, de 26 de julio
                </a>{' '}
                - Reforma del sistema de cotización.
              </li>
              <li>
                <a
                  href="https://www.seg-social.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Portal de la Seguridad Social
                </a>{' '}
                - Información oficial para autónomos.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCuotaAutonomoSocietario;
