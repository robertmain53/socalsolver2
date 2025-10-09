'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// ==== Small UI bits ====
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// ==== SEO JSON-LD ====
const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// ==== Lightweight Markdown-ish renderer (safe subset) ====
const ContentRenderer = ({ content }: { content: string }) => {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const processInlineFormatting = (text: string) =>
    escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

  const blocks = content.split('\n\n');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const b = block.trim();
        if (!b) return null;

        if (b.startsWith('#### ')) {
          return (
            <h4 key={index} className="text-lg font-semibold mt-4 mb-3"
                dangerouslySetInnerHTML={{ __html: processInlineFormatting(b.slice(5)) }} />
          );
        }
        if (b.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-bold mt-6 mb-4"
                dangerouslySetInnerHTML={{ __html: processInlineFormatting(b.slice(4)) }} />
          );
        }
        if (b.startsWith('* ')) {
          const items = b.split('\n').map(it => it.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(it) }} />
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(b)) {
          const items = b.split('\n').map(it => it.replace(/^\d+\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((it, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(it) }} />
              ))}
            </ol>
          );
        }

        return (
          <p key={index} className="mb-4"
             dangerouslySetInnerHTML={{ __html: processInlineFormatting(b) }} />
        );
      })}
    </div>
  );
};

// ==== Calculator config/data ====
const calculatorData = {
  slug: 'calculadora-liquidacion-sl',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la Liquidación de una Sociedad Limitada (SL)',
  lang: 'es',
  inputs: [
    {
      id: 'valor_activos',
      label: 'Valor Total de los Activos',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 1000,
      tooltip:
        'Suma del valor de mercado de todos los bienes y derechos de la empresa (dinero en banco, inmuebles, maquinaria, existencias, deudas de clientes, etc.).',
    },
    {
      id: 'total_pasivos',
      label: 'Total de Pasivos (Deudas)',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 1000,
      tooltip:
        'Suma de todas las deudas y obligaciones pendientes de la empresa (con bancos, proveedores, Hacienda, Seguridad Social, etc.).',
    },
    {
      id: 'gastos_liquidacion',
      label: 'Gastos Estimados de Liquidación',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'Costes asociados al proceso de cierre: notaría, Registro Mercantil, honorarios de gestores o abogados, etc.',
    },
    {
      id: 'capital_aportado',
      label: 'Capital Social Aportado por los Socios',
      type: 'number' as const,
      unit: '€',
      min: 1,
      step: 100,
      tooltip:
        'Importe total que los socios invirtieron inicialmente para constituir la sociedad. Es clave para calcular la ganancia patrimonial.',
    },
  ],
  outputs: [
    { id: 'patrimonio_neto_liquidable', label: 'Patrimonio Neto Liquidable (Haber Social)', unit: '€' },
    { id: 'coste_tpo', label: 'Impuesto de Operaciones Societarias (TPO - 1%)', unit: '€' },
    { id: 'importe_bruto_socios', label: 'Importe Bruto a Repartir entre Socios', unit: '€' },
    { id: 'plusvalia_socios', label: 'Ganancia Patrimonial de los Socios (Base IRPF)', unit: '€' },
    { id: 'coste_irpf_estimado', label: 'Coste Estimado en IRPF (Rentas del Ahorro)', unit: '€' },
    { id: 'importe_neto_final_socios', label: 'Importe Neto Final para los Socios', unit: '€' },
  ],
  content:
    "### Introducción\n\nCerrar una Sociedad Limitada (SL) es un proceso formal que culmina con el reparto del patrimonio restante entre los socios. Nuestra calculadora está diseñada para ayudarte a **estimar el resultado económico final de la liquidación**, incluyendo los impuestos clave que afectan a la operación. Se dirige a socios, administradores y asesores que buscan una visión clara y rápida de las cifras finales.\n\n### Guía all'Uso del Calcolatore\n\nPara obtener una estimación precisa, introduce los siguientes datos:\n\n* **Valor Total de los Activos**: Es el valor de mercado realista que esperas obtener por todos los bienes de la empresa. No es necesariamente el valor contable.\n* **Total de Pasivos (Deudas)**: Incluye todas las deudas pendientes. Es fundamental saldar todas las deudas antes de repartir nada a los socios.\n* **Gastos Estimados de Liquidación**: Son los costes directos del cierre (notaría, registro, gestoría). Una estimación conservadora es clave.\n* **Capital Social Aportado por los Socios**: Es la suma del dinero que los socios pusieron para crear la empresa. Este dato es crucial para determinar la ganancia (o pérdida) patrimonial y su tributación en el IRPF.\n\n### Metodologia di Calcolo Spiegata\n\nEl proceso de cálculo sigue los pasos lógicos y fiscales que se aplican en una liquidación real en España:\n\n1.  **Cálculo del Haber Social**: Primero, determinamos el patrimonio neto a liquidar restando todas las deudas y gastos del valor de los activos. A esta cifra se le conoce como \"haber social repartible\".\n2.  **Impuesto sobre Operaciones Societarias (TPO)**: Sobre el haber social, se aplica un impuesto del **1%** en concepto de Transmisiones Patrimoniales Onerosas (TPO). Este impuesto lo paga la sociedad antes de repartir el dinero.\n3.  **Importe Bruto para los Socios**: Restando el TPO, obtenemos la cantidad final que se distribuirá entre los socios en proporción a sus participaciones.\n4.  **Ganancia Patrimonial en IRPF**: Cada socio debe tributar en su IRPF por la ganancia obtenida. Esta se calcula restando el capital que aportó en su día del dinero que ahora recibe. Si el resultado es negativo, se genera una pérdida patrimonial.\n5.  **Tributación en la Base del Ahorro**: La ganancia patrimonial tributa en la base imponible del ahorro del IRPF, con tipos progresivos que van del 19% al 28%. Nuestra calculadora aplica estos tramos para estimar el impacto fiscal final.\n\n### Análisis Approfondita: Las 3 Fases Clave para Cerrar una SL\n\nEl cierre de una sociedad es un maratón, no un sprint. Se divide en tres fases legalmente establecidas en la Ley de Sociedades de Capital (LSC):\n\n**1. Disolución:** Es el acto de \"apretar el botón\". La Junta General de Socios acuerda formalmente iniciar el proceso de cierre por una causa legal (pérdidas, inactividad, etc.) o por simple voluntad. Desde este momento, la sociedad entra en \"estado de liquidación\" y debe añadir esta expresión a su denominación social. El órgano de administración cesa y se nombran los liquidadores.\n\n**2. Liquidación:** Es la fase más larga y operativa. Los liquidadores asumen el control total para:\n* **Formular un inventario y balance** inicial.\n* **Vender los activos** de la empresa (cobrar deudas de clientes, vender existencias, inmuebles, etc.).\n* **Pagar a los acreedores** (proveedores, bancos, Hacienda, Seguridad Social). Este es un paso prioritario; no se puede repartir nada a los socios sin haber satisfecho antes todas las deudas.\n* **Elaborar el Balance Final de Liquidación** y proponer la \"cuota de liquidación\" a repartir.\n\n**3. Extinción:** Una vez aprobado el balance final y repartido el haber social, los liquidadores otorgan la escritura pública de extinción ante notario y la inscriben en el Registro Mercantil. Con este último paso, la personalidad jurídica de la sociedad se extingue definitivamente y se cancelan sus asientos registrales.\n\nUn error común es subestimar las deudas contingentes (ej. una posible inspección fiscal futura). Los socios son responsables solidarios de las deudas sociales hasta el límite de su cuota de liquidación. Por ello, una gestión diligente por parte de los liquidadores es fundamental.\n\n### Domande Frequenti (FAQ)\n\n* **¿Cuál es la diferencia entre disolución y liquidación?**\n    La disolución es la decisión de iniciar el cierre. La liquidación es el conjunto de operaciones para convertir los activos en dinero, pagar deudas y repartir el sobrante. La disolución abre la puerta a la liquidación.\n\n* **¿Quién paga los impuestos, la empresa o los socios?**\n    Ambos. La **empresa** paga el 1% de TPO sobre el haber social. Los **socios**, a título personal, pagan el IRPF por la ganancia patrimonial que obtienen al recibir su parte, comparándola con lo que invirtieron inicialmente.\n\n* **¿Es posible que los socios pierdan dinero en una liquidación?**\n    Sí. Si el valor de los activos no es suficiente para cubrir las deudas y los gastos, no habrá nada que repartir (haber social cero o negativo). Además, si el importe que reciben es inferior al capital que aportaron, habrán materializado una pérdida patrimonial, que podrán compensar fiscalmente en su IRPF con otras ganancias.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuál es la diferencia entre disolución y liquidación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'La disolución es la decisión de iniciar el cierre. La liquidación es el conjunto de operaciones para convertir los activos en dinero, pagar deudas y repartir el sobrante. La disolución abre la puerta a la liquidación.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Quién paga los impuestos, la empresa o los socios?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Ambos. La empresa paga el 1% de TPO sobre el haber social. Los socios, a título personal, pagan el IRPF por la ganancia patrimonial que obtienen al recibir su parte, comparándola con lo que invirtieron inicialmente.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Es posible que los socios pierdan dinero en una liquidación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí. Si el valor de los activos no es suficiente para cubrir las deudas y los gastos, no habrá nada que repartir (haber social cero o negativo). Además, si el importe que reciben es inferior al capital que aportaron, habrán materializado una pérdida patrimonial, que podrán compensar fiscalmente en su IRPF con otras ganancias.',
        },
      },
    ],
  },
} as const;

// ==== Component ====
type InputDef = (typeof calculatorData.inputs)[number];
type OutputDef = (typeof calculatorData.outputs)[number];
type States = Record<string, number | ''>;

// Client-only chart wrapper using runtime require to avoid dynamic() typing issues
const ChartSection = ({
  data,
  formatCurrency,
}: {
  data: Array<Record<string, number | string>>;
  formatCurrency: (n: number) => string;
}) => {
  // Only render on client
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="h-64 w-full bg-gray-50 p-2 rounded-lg" />;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Recharts = require('recharts') as any;
  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } = Recharts;

  return (
    <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" tickFormatter={(v: number) => `€${Number(v) / 1000}k`} />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} cursor={{ fill: 'rgba(239,246,255,0.5)' }} />
          <Legend />
          <Bar dataKey="Capital Aportado" name="Capital Aportado" />
          <Bar dataKey="Importe Bruto Socios" name="Importe Bruto" />
          <Bar dataKey="Importe Neto Final" name="Importe Neto Final" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CalculadoraLiquidacionSl: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates: States = {
    valor_activos: 250000,
    total_pasivos: 80000,
    gastos_liquidacion: 7500,
    capital_aportado: 10000,
  };

  const [states, setStates] = useState<States>(initialStates);

  const parseNum = (v: number | '') => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);

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
    const valor_activos = parseNum(states.valor_activos);
    const total_pasivos = parseNum(states.total_pasivos);
    const gastos_liquidacion = parseNum(states.gastos_liquidacion);
    const capital_aportado = parseNum(states.capital_aportado);

    const patrimonio_neto_liquidable = Math.max(0, valor_activos - total_pasivos - gastos_liquidacion);
    const coste_tpo = patrimonio_neto_liquidable * 0.01;
    const importe_bruto_socios = Math.max(0, patrimonio_neto_liquidable - coste_tpo);
    const plusvalia_socios = Math.max(0, importe_bruto_socios - capital_aportado);

    const calculateIrpfAhorro = (gain: number): number => {
      if (gain <= 0) return 0;
      let tax = 0;
      const tramos = [
        { limit: 6_000, rate: 0.19 },
        { limit: 50_000, rate: 0.21 },
        { limit: 200_000, rate: 0.23 },
        { limit: 300_000, rate: 0.27 },
        { limit: Infinity, rate: 0.28 },
      ];
      let remaining = gain;
      let prev = 0;
      for (const t of tramos) {
        if (remaining <= 0) break;
        const span = Math.min(remaining, t.limit - prev);
        if (span > 0) {
          tax += span * t.rate;
          remaining -= span;
        }
        prev = t.limit;
      }
      return tax;
    };

    const coste_irpf_estimado = calculateIrpfAhorro(plusvalia_socios);
    const importe_neto_final_socios = Math.max(0, importe_bruto_socios - coste_irpf_estimado);

    return {
      patrimonio_neto_liquidable,
      coste_tpo,
      importe_bruto_socios,
      plusvalia_socios,
      coste_irpf_estimado,
      importe_neto_final_socios,
    };
  }, [states]);

  const chartData = useMemo(
    () => [
      {
        name: 'Distribución Financiera',
        'Capital Aportado': parseNum(states.capital_aportado),
        'Importe Bruto Socios': calculatedOutputs.importe_bruto_socios,
        'Importe Neto Final': calculatedOutputs.importe_neto_final_socios,
      },
    ],
    [states, calculatedOutputs],
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

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
    } catch (e) {
      console.error(e);
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        inputs: {
          valor_activos: parseNum(states.valor_activos),
          total_pasivos: parseNum(states.total_pasivos),
          gastos_liquidacion: parseNum(states.gastos_liquidacion),
          capital_aportado: parseNum(states.capital_aportado),
        },
        outputs: calculatedOutputs,
        ts: Date.now(),
      };
      const existing = JSON.parse(typeof window !== 'undefined'
        ? localStorage.getItem('calc_results') || '[]'
        : '[]');
      const newResults = [payload, ...existing].slice(0, 50);
      localStorage.setItem('calc_results', JSON.stringify(newResults));
      alert('Resultado guardado localmente.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <SeoSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        {/* Main (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calcolatoreRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">
                Estima el resultado económico final para los socios tras liquidar una SL, incluyendo los impuestos clave.
              </p>
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Disclaimer:</strong> Esta calculadora ofrece una estimación con fines informativos. No sustituye el
                asesoramiento profesional de un abogado o un gestor fiscal.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input: InputDef) => (
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
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">{input.unit}</span>
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-8 pr-3 py-2"
                        type="number"
                        min={input.min}
                        step={input.step}
                        value={states[input.id] as number | ''} // allow '' for UX
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados de la Liquidación</h2>
                {outputs.map((o: OutputDef) => (
                  <div
                    key={o.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                      o.id === 'importe_neto_final_socios' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="text-sm md:text-base font-medium text-gray-700">{o.label}</div>
                    <div
                      className={`text-xl md:text-2xl font-bold ${
                        o.id === 'importe_neto_final_socios' ? 'text-green-600' : 'text-gray-800'
                      }`}
                    >
                      <span>
                        {isClient ? formatCurrency((calculatedOutputs as any)[o.id]) : '...'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparativa Financiera para los Socios</h3>
                <ChartSection data={chartData} formatCurrency={formatCurrency} />
              </div>
            </div>
          </div>
        </div>

        {/* Aside (1 col) */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-2 text-gray-800">Acciones</h2>
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
                className="col-span-2 w-full border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía del Proceso</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Real Decreto Legislativo 1/2010, Ley de Sociedades de Capital
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 27/2014, del Impuesto sobre Sociedades
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 35/2006, del IRPF
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraLiquidacionSl;
