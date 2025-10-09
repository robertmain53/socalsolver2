'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* =========================
 *        Types
 * ========================= */
type InputField = {
  id: string;
  label: string;
  type: 'number';
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
};

type InputGroup = {
  group: string;
  fields: InputField[];
};

type OutputId = 'inversionTotal' | 'beneficioNetoAnual' | 'rentabilidadBruta' | 'rentabilidadNeta';

type OutputField = {
  id: OutputId;
  label: string;
  unit: '€' | '%';
};

type CalculatorData = {
  slug: string;
  category: string;
  title: string;
  lang: string;
  tags: string;
  inputs: InputGroup[];
  outputs: OutputField[];
  content: string;
  seoSchema: any;
};

/* =========================
 *     Utility Components
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

/* =========================
 *   Self-contained content
 * ========================= */

const calculatorData: CalculatorData = {
  slug: 'calculadora-rentabilidad-plaza-garaje',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Rentabilidad de una Plaza de Garaje',
  lang: 'es',
  tags:
    'calculadora rentabilidad garaje, invertir en plazas de garaje, rendimiento neto alquiler garaje, gastos plaza de garaje, iva plaza garaje, itp garaje',
  inputs: [
    {
      group: '1. Costes de Inversión',
      fields: [
        {
          id: 'precioCompra',
          label: 'Precio de compra del garaje',
          type: 'number',
          unit: '€',
          min: 0,
          tooltip: 'El precio que pagaste por la plaza de garaje.',
        },
        {
          id: 'impuestosCompra',
          label: 'Impuestos de compra (ITP o IVA)',
          type: 'number',
          unit: '%',
          step: 0.1,
          min: 0,
          tooltip:
            'Si compras a un particular es ITP (6–10% según C.A.). Si compras a una empresa y no va ligada a una vivienda, es 21% de IVA.',
        },
        {
          id: 'otrosGastosCompra',
          label: 'Otros gastos (notaría, registro)',
          type: 'number',
          unit: '€',
          min: 0,
          tooltip: 'Costes de notaría, registro de la propiedad y gestoría si aplica.',
        },
      ],
    },
    {
      group: '2. Ingresos del Alquiler',
      fields: [
        {
          id: 'alquilerMensual',
          label: 'Ingreso mensual por alquiler (sin IVA)',
          type: 'number',
          unit: '€',
          min: 0,
          tooltip:
            'Importe mensual que recibes excluido el IVA. Si facturas con IVA, no lo cuentes aquí porque es un impuesto repercutido.',
        },
      ],
    },
    {
      group: '3. Gastos Anuales de Mantenimiento',
      fields: [
        {
          id: 'ibiAnual',
          label: 'IBI (anual)',
          type: 'number',
          unit: '€',
          min: 0,
          tooltip: 'Impuesto sobre Bienes Inmuebles que pagas al ayuntamiento cada año.',
        },
        {
          id: 'comunidadAnual',
          label: 'Gastos de comunidad (anual)',
          type: 'number',
          unit: '€',
          min: 0,
          tooltip: 'Suma de las 12 cuotas mensuales de la comunidad de propietarios.',
        },
        {
          id: 'seguroAnual',
          label: 'Seguro (anual)',
          type: 'number',
          unit: '€',
          min: 0,
          tooltip: 'Coste del seguro (responsabilidad civil o multirriesgo).',
        },
        {
          id: 'mantenimientoAnual',
          label: 'Otros gastos (mantenimiento, derramas...)',
          type: 'number',
          unit: '€',
          min: 0,
          tooltip: 'Prevé imprevistos, derramas o periodos sin inquilino.',
        },
      ],
    },
  ],
  outputs: [
    { id: 'inversionTotal', label: 'Inversión Total Realizada', unit: '€' },
    { id: 'beneficioNetoAnual', label: 'Beneficio Neto Anual (antes de IRPF)', unit: '€' },
    { id: 'rentabilidadBruta', label: 'Rentabilidad Bruta', unit: '%' },
    { id: 'rentabilidadNeta', label: 'Rentabilidad Neta', unit: '%' },
  ],
  content:
    "### Introduzione: Scopri il Reale Rendimento del Tuo Posto Auto\n\nInvestire in posti auto è un'opzione sempre più popolare per la sua bassa barriera di ingresso e la gestione apparentemente semplice. Ma qual è la sua redditività reale una volta dedotte tutte le spese? Questa calcolatrice ti aiuta a determinare la **redditività netta** del tuo investimento in un posto auto, andando oltre i calcoli superficiali. Inserisci i costi di acquisto, le spese annuali (IBI, condominio) e le entrate da affitto per ottenere una visione chiara e precisa del rendimento del tuo capitale.\n\n### Guida all'Uso del Calcolatore\n\nPer un'analisi completa, inserisci i seguenti dati:\n\n1.  **Costi di Investimento**: Indica il **prezzo di acquisto** del posto auto, le **imposte** (ITP o IVA, vedi sotto) e le **altre spese** notarili e di registro. Questo calcolerà il tuo investimento totale effettivo.\n2.  **Entrate da Affitto**: L'importo **mensile** che ricevi dall'inquilino. Ricorda che questo affitto, se non è legato a un'abitazione, è soggetto a IVA.\n3.  **Spese Annuali**: Sii il più preciso possibile. Somma i costi annuali di **IBI, spese condominiali, assicurazione** (se applicabile) e una stima per **manutenzione** o imprevisti.\n\n### Metodologia di Calcolo Spiegata\n\nPer offrirti le metriche più importanti, la calcolatrice segue questi passaggi:\n\n* **Calcolo dell'Investimento Totale**: Sommiamo il prezzo di acquisto, le imposte e le spese notarili per ottenere il capitale totale che hai impiegato.\n* **Calcolo del Profitto Netto Annuale**: Dalle entrate annuali totali (affitto mensile x 12) sottraiamo la somma di tutte le spese annuali (IBI, condominio, ecc.).\n* **Redditività Lorda**: `(Entrate Annuali da Affitto / Investimento Totale) x 100`. Una metrica rapida per il confronto.\n* **Redditività Netta**: `(Profitto Netto Annuale / Investimento Totale) x 100`. Questa è la cifra più importante, che rappresenta il rendimento reale del tuo investimento.\n\n### Analisi Approfondita: La Fiscalità di un Posto Auto\n\n#### **Tasse sull'Acquisto: ITP o IVA?**\n\nQuesta è la prima grande differenza rispetto all'acquisto di un'abitazione:\n\n* **Acquisto da un privato**: Si paga l'**Imposta sulle Trasmissioni Patrimoniali (ITP)**, che varia dal 6% al 10% a seconda della Comunità Autonoma.\n* **Acquisto da un'azienda/costruttore**: Se il posto auto non è annesso a un'abitazione, l'operazione è soggetta al **21% di IVA**. Questo aumenta notevolmente l'investimento iniziale e deve essere tenuto in considerazione nel calcolo della redditività.\n\n#### **Tasse sull'Affitto: L'IVA e l'IRPF**\n\nAnche la tassazione dell'affitto è diversa da quella di un'abitazione:\n\n* **IVA**: Se affitti il posto auto separatamente da un'abitazione, devi emettere fatture con il **21% di IVA** e presentare dichiarazioni IVA trimestrali (Modelo 303).\n* **IRPF**: Il profitto netto che ottieni (entrate meno spese deducibili) deve essere dichiarato nella tua dichiarazione dei redditi annuale come *rendimiento del capital inmobiliario*. A differenza dell'affitto di un'abitazione, **non hai diritto alla riduzione del 60%** sul profitto.\n\nQuesta assenza della riduzione del 60% fa sì che, a parità di profitto, la tassazione sull'affitto di un posto auto sia significativamente più alta rispetto a quella di un'abitazione.\n\n### Domande Frequenti (FAQ)\n\n**1. Quali spese posso dedurre dall'affitto di un posto auto?**\n\nPuoi dedurre tutte le spese necessarie per l'affitto: l'IBI, le spese condominiali, gli interessi di un eventuale prestito per l'acquisto, i costi di riparazione e manutenzione, le assicurazioni e l'ammortamento del 3% sul valore di costruzione del posto auto.\n\n**2. È più redditizio investire in un posto auto o in un'abitazione?**\n\nI posti auto offrono una barriera di ingresso più bassa (investimento iniziale minore) e una gestione più semplice (meno manutenzione, meno problemi con gli inquilini). Tuttavia, la loro redditività netta è spesso inferiore a quella di un'abitazione a causa dell'assenza della riduzione fiscale del 60% e dell'impatto dell'IVA sia sull'acquisto che sull'affitto. Un posto auto può offrire tra il 3% e il 6% di redditività netta, mentre un'abitazione può superare facilmente queste cifre grazie ai benefici fiscali.\n\n**3. Devo dichiarare l'IVA ogni trimestre anche se guadagno poco?**\n\nSì. Se l'affitto del tuo posto auto è soggetto a IVA, hai l'obbligo di registrarti come operatore economico e di presentare il Modello 303 ogni trimestre, indipendentemente dall'importo delle tue entrate.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué gastos puedo deducir del alquiler de una plaza de garaje?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Puedes deducir todos los gastos necesarios para el alquiler: el IBI, los gastos de comunidad, los intereses de un posible préstamo para la compra, los costes de reparación y conservación, seguros, y la amortización del 3% sobre el valor de construcción de la plaza.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Es más rentable invertir en una plaza de garaje o en una vivienda?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Las plazas de garaje ofrecen una barrera de entrada menor (inversión inicial más baja) y una gestión más sencilla. Sin embargo, su rentabilidad neta suele ser inferior a la de una vivienda debido a la ausencia de la reducción fiscal del 60% y el impacto del IVA tanto en la compra como en el alquiler. Un garaje puede ofrecer entre un 3% y un 6% de rentabilidad neta, mientras que una vivienda puede superar esas cifras gracias a los beneficios fiscales.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Tengo que declarar el IVA cada trimestre aunque gane poco?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí. Si el alquiler de tu plaza de garaje está sujeto a IVA, tienes la obligación de darte de alta como operador económico y de presentar el Modelo 303 cada trimestre, sin importar el importe de tus ingresos.',
        },
      },
    ],
  },
};

const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

/* =========================
 *   Markdown-ish renderer
 * ========================= */
const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h3
            key={index}
            className="text-xl font-bold mt-6 mb-4 text-gray-800"
            dangerouslySetInnerHTML={{
              __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h4
            key={index}
            className="text-lg font-semibold mt-4 mb-3 text-gray-700"
            dangerouslySetInnerHTML={{
              __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
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
        <p
          key={index}
          className="mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      );
    });
  };
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

/* =========================
 *     Chart (dynamic)
 * ========================= */
const DynamicPieChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data }: { data: Array<{ name: string; value: number }> }) => {
        const COLORS = ['#22c55e', '#f97316'];
        return (
          <mod.ResponsiveContainer width="100%" height="100%">
            <mod.PieChart>
              <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {data.map((entry, index) => (
                  <mod.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </mod.Pie>
              <mod.Tooltip
                formatter={(value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)}
              />
              <mod.Legend />
            </mod.PieChart>
          </mod.ResponsiveContainer>
        );
      };
      return ChartComponent;
    }),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div>,
  }
);

/* =========================
 *     Main Component
 * ========================= */

const CalculadoraRentabilidadPlazaGaraje: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialStates: Record<string, number> = {
    precioCompra: 22000,
    impuestosCompra: 8,
    otrosGastosCompra: 750,
    alquilerMensual: 85,
    ibiAnual: 55,
    comunidadAnual: 150,
    seguroAnual: 40,
    mantenimientoAnual: 50,
  };

  const [states, setStates] = useState<Record<string, number>>(initialStates);

  const handleStateChange = (id: string, value: string) => {
    // clamp to [min, +inf) if defined; otherwise just parse
    const field = inputs.flatMap((g) => g.fields).find((f) => f.id === id);
    const v = Number(value);
    const min = field?.min ?? undefined;
    const clamped = Number.isFinite(v) ? (min !== undefined ? Math.max(min, v) : v) : 0;
    setStates((prev) => ({ ...prev, [id]: clamped }));
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const pCompra = Number(states.precioCompra) || 0;
    const iCompraPct = (Number(states.impuestosCompra) || 0) / 100;
    const oCompra = Number(states.otrosGastosCompra) || 0;
    const inversionTotal = pCompra + pCompra * iCompraPct + oCompra;

    const ingresoMensualSinIVA = Number(states.alquilerMensual) || 0; // aclarado en la etiqueta
    const ingresoAnual = ingresoMensualSinIVA * 12;

    const gastosAnuales =
      (Number(states.ibiAnual) || 0) +
      (Number(states.comunidadAnual) || 0) +
      (Number(states.seguroAnual) || 0) +
      (Number(states.mantenimientoAnual) || 0);

    const beneficioNetoAnual = ingresoAnual - gastosAnuales;

    const rentabilidadBruta = inversionTotal > 0 ? (ingresoAnual / inversionTotal) * 100 : 0;
    const rentabilidadNeta = inversionTotal > 0 ? (beneficioNetoAnual / inversionTotal) * 100 : 0;

    return {
      inversionTotal,
      beneficioNetoAnual,
      rentabilidadBruta,
      rentabilidadNeta,
      ingresoAnual,
      gastosAnuales,
    };
  }, [states]);

  const chartData = useMemo(
    () =>
      [
        { name: 'Beneficio Neto Anual', value: Math.max(0, calculatedOutputs.beneficioNetoAnual) },
        { name: 'Gastos Anuales', value: Math.max(0, calculatedOutputs.gastosAnuales) },
      ].filter((item) => item.value > 0),
    [calculatedOutputs]
  );

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const { ingresoAnual, gastosAnuales, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      // eslint-disable-next-line no-alert
      alert('Resultado guardado con éxito!');
    } catch {
      // eslint-disable-next-line no-alert
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
              <p className="text-gray-600 mb-6">
                Analiza la rentabilidad real de tu inversión en una plaza de garaje, descontando todos los gastos.
              </p>

              <div className="space-y-6">
                {inputs.map((group) => (
                  <div key={group.group} className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{group.group}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {group.fields.map((input) => (
                        <div key={input.id}>
                          <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id}>
                            {input.label}
                            {input.tooltip && (
                              <Tooltip text={input.tooltip}>
                                <span className="ml-2 cursor-help">
                                  <InfoIcon />
                                </span>
                              </Tooltip>
                            )}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id={input.id}
                              aria-label={input.label}
                              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                              type="number"
                              value={Number.isFinite(states[input.id]) ? states[input.id] : 0}
                              onChange={(e) => handleStateChange(input.id, e.target.value)}
                              step={input.step ?? 1}
                              min={input.min ?? 0}
                            />
                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Métricas Clave de tu Inversión</h2>
                {outputs.map((output) => {
                  const value = (calculatedOutputs as any)[output.id] as number;
                  const formatted = !isClient
                    ? '...'
                    : output.unit === '%'
                    ? formatPercent(value)
                    : formatCurrency(value);
                  return (
                    <div
                      key={output.id}
                      className={`flex items-baseline justify-between p-4 rounded-lg ${
                        output.id === 'rentabilidadNeta' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                      <span
                        className={`text-xl md:text-2xl font-bold ${
                          output.id === 'rentabilidadNeta' ? 'text-indigo-600' : 'text-gray-800'
                        }`}
                      >
                        {formatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Desglose del Ingreso Anual</h2>
            <div className="h-64 w-full">{isClient && <DynamicPieChart data={chartData} />}</div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={saveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Reiniciar
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía de Inversión en Garajes</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-4-rendimientos-capital-inmobiliario.html"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Rendimientos del Capital Inmobiliario
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 37/1992, del Impuesto sobre el Valor Añadido (IVA)
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraRentabilidadPlazaGaraje;
