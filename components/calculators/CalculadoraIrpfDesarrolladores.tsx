'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, LabelList } from 'recharts';

// --- Icono (SVG inline) ---
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="text-gray-400 hover:text-gray-600"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Tooltip UI ---
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative inline-flex items-center group">
    {children}
    <div
      role="tooltip"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"
    >
      {text}
    </div>
  </div>
);

// --- SEO JSON-LD ---
const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// --- Markdown renderer (basic) ---
const MarkdownRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('###')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.replace(/###\s?/, '')) }}
            />
          );
        }

        if (/^\d\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').map((it) => it.replace(/^\d\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(it) }} />
              ))}
            </ol>
          );
        }

        if (trimmed.startsWith('*')) {
          const items = trimmed.split('\n').map((it) => it.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(it) }} />
              ))}
            </ul>
          );
        }

        return (
          <p
            key={index}
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed) }}
          />
        );
      })}
    </div>
  );
};

// --- Config del calculador ---
const calculatorData = {
  slug: 'calculadora-irpf-desarrolladores',
  category: 'Impuestos y trabajo autonomo',
  title: 'Calculadora de IRPF para desarrolladores de software autónomos',
  lang: 'es',
  inputs: [
    {
      id: 'ingresosAnuales',
      label: 'Ingresos Anuales Brutos',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 1000,
      tooltip:
        'Suma total de todas las facturas emitidas en el año, antes de aplicar IVA o retenciones.',
    },
    {
      id: 'gastosDeducibles',
      label: 'Gastos Deducibles Anuales',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'Suma de todos los gastos relacionados con tu actividad: cuota de autónomos, software, hardware, gestoría, etc.',
    },
    {
      id: 'retencionesPracticadas',
      label: 'Retenciones de IRPF ya pagadas',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'Suma total del IRPF que has incluido en tus facturas a clientes en España (normalmente el 7% o 15%).',
    },
  ],
  outputs: [
    { id: 'rendimientoNeto', label: 'Rendimiento Neto (Beneficio Real)', unit: '€' },
    { id: 'baseImponibleGeneral', label: 'Base Imponible General', unit: '€' },
    { id: 'cuotaIntegraTotal', label: 'Total Impuesto a Pagar (Cuota Íntegra)', unit: '€' },
    { id: 'resultadoDeclaracion', label: 'Resultado Final de la Declaración', unit: '€' },
  ],
  examples: [
    {
      title: 'Ejemplo: Desarrollador Junior (Primer año)',
      inputs: { ingresosAnuales: 35000, gastosDeducibles: 4000, retencionesPracticadas: 2450 },
      description:
        'Un desarrollador en su primer año de actividad, aplicando una retención reducida del 7%. Sus gastos incluyen la cuota de autónomos, suscripciones a software (IDE, Figma) y parte del alquiler de su vivienda.',
    },
    {
      title: 'Ejemplo: Desarrollador Senior',
      inputs: { ingresosAnuales: 75000, gastosDeducibles: 8500, retencionesPracticadas: 11250 },
      description:
        'Un desarrollador con experiencia y una base de clientes estable, aplicando la retención estándar del 15%. Sus gastos son más elevados, incluyendo amortización de equipos, viajes a conferencias y software más costoso.',
    },
  ],
  content:
    "### Introducción\n\nEsta calculadora está diseñada específicamente para **desarrolladores de software autónomos en España**. Te permite obtener una estimación clara y precisa del impuesto sobre la renta (IRPF) que deberás pagar, ayudándote a planificar tus finanzas y evitar sorpresas con Hacienda. A diferencia de las calculadoras genéricas, consideramos las deducciones y escenarios más comunes para profesionales del sector tecnológico.\n\n### Guía de Uso del Calculador\n\n* **Ingresos Anuales Brutos**: Introduce la suma total de lo que has facturado a tus clientes durante un año fiscal, sin descontar nada aún. Es tu facturación total antes de impuestos.\n\n* **Gastos Deducibles Anuales**: Aquí debes sumar todos los costes directamente relacionados con tu trabajo. Para un desarrollador, esto incluye típicamente:\n    * La **cuota de autónomos** a la Seguridad Social.\n    * Suscripciones a software: IDEs (JetBrains), control de versiones (GitHub), diseño (Figma), bases de datos, etc.\n    * Costes de hosting y dominios (AWS, Vercel, Netlify).\n    * Compra y amortización de hardware (ordenador, monitores).\n    * Servicios profesionales: gestoría, abogado, consultor.\n    * Si trabajas desde casa, una parte de los suministros (luz, internet) y del alquiler o hipoteca, según las reglas vigentes (normalmente el 30% de la proporción de tu vivienda usada para la actividad).\n\n* **Retenciones de IRPF ya pagadas**: Es el dinero que ya has adelantado a Hacienda. Se calcula aplicando un porcentaje (7% para nuevos autónomos, 15% como tipo general) en las facturas que emites a otras empresas o autónomos españoles.\n\n### Metodología de Calcolo Spiegata\n\nEl cálculo del IRPF para autónomos sigue un proceso claro que esta herramienta replica:\n\n1.  **Cálculo del Rendimiento Neto**: Primero, restamos tus **Gastos Deducibles** de tus **Ingresos Brutos**. A este resultado, se le aplica una deducción adicional por **'gastos de difícil justificación'**, que es el 7% del rendimiento neto previo, con un tope máximo de 2.000 €. El resultado es tu beneficio real o **Rendimiento Neto**.\n\n2.  **Obtención de la Base Imponible**: Para simplificar, consideramos que tu Rendimiento Neto es tu **Base Imponible General**. Sobre esta cifra se calculará el impuesto.\n\n3.  **Aplicación del Mínimo Personal**: La ley establece que una parte de tus ingresos, destinada a cubrir tus necesidades básicas, no tributa. Esta cantidad es el **mínimo personal y familiar**. Usamos el mínimo general de **5.550 €**.\n\n4.  **Cálculo de la Cuota Íntegra**: A la Base Imponible se le resta el mínimo personal. Al resultado se le aplican los **tramos progresivos del IRPF** vigentes para determinar el impuesto total a pagar.\n\n5.  **Resultado Final**: Finalmente, restamos las **Retenciones ya pagadas** de la cuota íntegra. Si el resultado es positivo, es la cantidad que debes pagar a Hacienda. Si es negativo, es la cantidad que Hacienda te devolverá.\n\n### Análisis Approfondita: Optimización Fiscal para Desarrolladores de Software\n\nComo desarrollador freelance, tienes oportunidades específicas para optimizar tu carga fiscal que otros autónomos no tienen. Más allá de los gastos obvios, considera estas estrategias:\n\n* **Amortización de Hardware**: La compra de un ordenador potente o de monitores de alta gama no se deduce de golpe. Se deduce a lo largo de varios años (su vida útil fiscal). Este proceso se llama amortización y es clave para compras de alto valor. Consulta las tablas oficiales de amortización, pero un ordenador suele amortizarse en 4 años (25% cada año).\n\n* **Software como Gasto, no como Inversión**: A diferencia del hardware, las licencias de software y las suscripciones mensuales (SaaS) se consideran un gasto corriente y son **100% deducibles en el año en que se pagan**. Esto incluye tu suscripción a GitHub Copilot, tu IDE de JetBrains, o el plan de pago de Notion.\n\n* **Formación y Conferencias**: Las entradas a conferencias de tecnología (presenciales o virtuales), los cursos de especialización (ej. en Udemy, Coursera) y la compra de libros técnicos son gastos deducibles, ya que se consideran formación necesaria para mantener y mejorar tus habilidades profesionales.\n\n* **Deducciones por trabajo en casa (Teletrabajo)**: La ley te permite deducir un porcentaje de los suministros de tu hogar (luz, agua, internet). La regla general es aplicar el 30% sobre la proporción de metros cuadrados de tu vivienda que has declarado como oficina. Por ejemplo, si tu oficina ocupa un 10% de tu casa, puedes deducir el 30% de ese 10% de tus facturas de suministros.\n\n### Domande Frequenti (FAQ)\n\n1.  **¿Qué tipo de retención de IRPF debo aplicar en mis facturas?**\n    Como norma general, es el 15%. Sin embargo, durante tu primer año de actividad y los dos siguientes, puedes optar por aplicar una retención reducida del 7% para tener más liquidez. Es una opción, no una obligación.\n\n2.  **¿Esta calculadora sirve para la declaración trimestral (Modelo 130)?**\n    No directamente, pero el concepto es el mismo. El Modelo 130 es un pago a cuenta del 20% sobre tu rendimiento neto trimestral. Puedes usar esta calculadora con tus datos trimestrales para estimar tu beneficio y luego calcular el 20% a pagar en cada trimestre.\n\n3.  **¿Puedo deducir el coste de mi conexión a Internet si trabajo desde casa?**\n    Sí. La conexión a Internet se considera un suministro fundamental para un desarrollador de software. Al igual que la luz o el agua, puedes deducir una parte según la regla de la proporción de la vivienda afecta a la actividad.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué tipo de retención de IRPF debo aplicar en mis facturas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Como norma general, es el 15%. Sin embargo, durante tu primer año de actividad y los dos siguientes, puedes optar por aplicar una retención reducida del 7% para tener más liquidez. Es una opción, no una obligación.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Esta calculadora sirve para la declaración trimestral (Modelo 130)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No directamente, pero el concepto es el mismo. El Modelo 130 es un pago a cuenta del 20% sobre tu rendimiento neto trimestral. Puedes usar esta calculadora con tus datos trimestrales para estimar tu beneficio y luego calcular el 20% a pagar en cada trimestre.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo deducir el coste de mi conexión a Internet si trabajo desde casa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí. La conexión a Internet se considera un suministro fundamental para un desarrollador de software. Al igual que la luz o el agua, puedes deducir una parte según la regla de la proporción de la vivienda afecta a la actividad.',
        },
      },
    ],
  },
} as const;

// Helpers
const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

// --- Componente principal ---
const CalculadoraIrpfDesarrolladores: React.FC = () => {
  const { slug, title, inputs, outputs, content, examples, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const initialStates = {
    ingresosAnuales: 65000,
    gastosDeducibles: 7000,
    retencionesPracticadas: 9750,
  };
  const [states, setStates] = useState<Record<string, number | ''>>(initialStates);

  const handleStateChange = (id: string, value: string) => {
    // Allow temporary empty state for UX; compute with 0
    setStates((prev) => ({ ...prev, [id]: value === '' ? '' : toNumber(value) }));
  };

  const handleReset = () => setStates(initialStates);

  const loadExample = (exampleInputs: Record<string, number>) => setStates(exampleInputs);

  const calculatedOutputs = useMemo(() => {
    const ingresosAnuales = toNumber(states.ingresosAnuales);
    const gastosDeducibles = Math.max(0, toNumber(states.gastosDeducibles));
    const retencionesPracticadas = Math.max(0, toNumber(states.retencionesPracticadas));

    const rendimientoNetoPrevio = Math.max(0, ingresosAnuales - gastosDeducibles);
    const gastosDificilJustificacion = Math.min(2000, rendimientoNetoPrevio * 0.07);
    const rendimientoNeto = Math.max(0, rendimientoNetoPrevio - gastosDificilJustificacion);

    const baseImponibleGeneral = rendimientoNeto;

    const minimoPersonal = 5550;
    const baseLiquidable = Math.max(0, baseImponibleGeneral - minimoPersonal);

    // Tramos (estatal+autonómico simplificados)
    const tramos = [
      { limite: 12450, tipo: 0.19 },
      { limite: 20200, tipo: 0.24 },
      { limite: 35200, tipo: 0.3 },
      { limite: 60000, tipo: 0.37 },
      { limite: 300000, tipo: 0.45 },
      { limite: Infinity, tipo: 0.47 },
    ];

    let cuotaIntegraTotal = 0;
    let baseRestante = baseLiquidable;
    let baseAnterior = 0;

    for (const tramo of tramos) {
      if (baseRestante <= 0) break;
      const topeTramo = tramo.limite - baseAnterior;
      const baseEnTramo = Math.max(0, Math.min(baseRestante, topeTramo));
      cuotaIntegraTotal += baseEnTramo * tramo.tipo;
      baseRestante -= baseEnTramo;
      baseAnterior = tramo.limite;
    }

    const resultadoDeclaracion = cuotaIntegraTotal - retencionesPracticadas;

    return {
      rendimientoNeto,
      baseImponibleGeneral,
      cuotaIntegraTotal,
      resultadoDeclaracion,
    };
  }, [states]);

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
      alert('Error al exportar a PDF. Esta función puede no estar disponible en todos los navegadores.');
      console.error(e);
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        inputs: states,
        outputs: calculatedOutputs,
        ts: Date.now(),
      };
      const existingResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      const newResults = [payload, ...existingResults].slice(0, 50);
      localStorage.setItem('calc_results', JSON.stringify(newResults));
      alert('Resultado guardado en el almacenamiento local de tu navegador.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  const chartData = [
    { name: 'Ingresos Brutos', value: toNumber(states.ingresosAnuales), fill: '#4ade80' },
    { name: 'Beneficio Neto', value: calculatedOutputs.rendimientoNeto, fill: '#38bdf8' },
    { name: 'Impuestos', value: calculatedOutputs.cuotaIntegraTotal, fill: '#f87171' },
    {
      name: 'Salario Neto Anual',
      value: calculatedOutputs.rendimientoNeto - calculatedOutputs.cuotaIntegraTotal,
      fill: '#a78bfa',
    },
  ];

  return (
    <>
      <SeoSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-6">
                Estima tu IRPF anual para planificar tus finanzas y evitar sorpresas con Hacienda.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {inputs.map((input) => (
                  <div key={input.id}>
                    <label
                      className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                      htmlFor={input.id}
                    >
                      {input.label}
                      <Tooltip text={input.tooltip}>
                        <span className="ml-1.5" aria-hidden="true">
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    </label>
                    <div className="relative">
                      <input
                        id={input.id}
                        inputMode="decimal"
                        type="number"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-10 py-2"
                        min={input.min}
                        step={input.step}
                        value={states[input.id] === '' ? '' : states[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                        aria-label={input.label}
                      />
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">
                        {input.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados de la Simulación</h2>
              <div className="space-y-4">
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                      output.id === 'resultadoDeclaracion'
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">
                      {output.label}
                    </span>
                    <span
                      className={`text-xl md:text-2xl font-bold ${
                        output.id === 'resultadoDeclaracion' ? 'text-indigo-600' : 'text-gray-800'
                      }`}
                    >
                      {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '…'}
                    </span>
                  </div>
                ))}
                <div className="text-center pt-2">
                  {isClient && (
                    <p
                      className={`text-sm ${
                        calculatedOutputs.resultadoDeclaracion > 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {calculatedOutputs.resultadoDeclaracion > 0
                        ? `A PAGAR: Deberás abonar ${formatCurrency(
                            calculatedOutputs.resultadoDeclaracion
                          )} a Hacienda.`
                        : `A DEVOLVER: Hacienda deberá devolverte ${formatCurrency(
                            Math.abs(calculatedOutputs.resultadoDeclaracion)
                          )}.`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose Visual</h3>
              <div className="h-80 w-full bg-slate-50 p-4 rounded-lg">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                      <ChartTooltip
                        formatter={(val: unknown) => formatCurrency(toNumber(val))}
                        cursor={{ fill: 'rgba(239,246,255,0.5)' }}
                      />
                      <Bar dataKey="value" name="Valor">
                        <LabelList
                          dataKey="value"
                          position="right"
                          content={(props: any) => {
                            const { x, y, width, height, value } = props;
                            // Position a bit to the right of the bar end
                            const labelX = (x ?? 0) + (width ?? 0) + 6;
                            const labelY = (y ?? 0) + (height ?? 0) / 2 + 4;
                            return (
                              <text x={labelX} y={labelY} fontSize={12} fill="#374151">
                                {formatCurrency(toNumber(value))}
                              </text>
                            );
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Cargando gráfico...
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
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
                PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Cargar Ejemplos</h2>
            <div className="space-y-3">
              {examples.map((ex) => (
                <div key={ex.title} className="p-3 border rounded-md hover:bg-gray-50">
                  <h4 className="font-semibold text-sm">{ex.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{ex.description}</p>
                  <button
                    onClick={() => loadExample(ex.inputs)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-2"
                  >
                    Cargar este caso
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Consejos</h2>
            <MarkdownRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Manual práctico de Renta 2023 (Agencia Tributaria)
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 35/2006, de 28 de noviembre, del IRPF
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfDesarrolladores;
