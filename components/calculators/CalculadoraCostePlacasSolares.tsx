'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* =========================
 *        Types
 * ========================= */
type NumberField = {
  id: string;
  label: string;
  type: 'number';
  unit?: string;
  min?: number;
  step?: number;
  tooltip?: string;
  // campo opzionale di visibilità (es. "incluirBateria == true")
  condition?: string;
};

type SelectField = {
  id: string;
  label: string;
  type: 'select';
  options: { value: string; label: string }[];
  tooltip?: string;
};

type BooleanField = {
  id: string;
  label: string;
  type: 'boolean';
  tooltip?: string;
};

type InputField = NumberField | SelectField | BooleanField;

type CalculatorData = {
  slug: string;
  category: string;
  title: string;
  lang: string;
  tags: string;
  prices: {
    costePorWp: number; // €/Wp
    costeBateriaPorKwh: number; // €/kWh
    subvencionPorKwp: number; // €/kWp
    subvencionBateriaPorKwh: number; // €/kWh
  };
  inputs: InputField[];
  outputs: { id: OutputId; label: string; unit?: '€' | 'kWp' | 'años' }[];
  content: string;
  seoSchema: any;
};

type OutputId =
  | 'potenciaRecomendada'
  | 'costeInstalacionBruto'
  | 'subvencionNextGen'
  | 'deduccionIRPF'
  | 'costeFinalNeto'
  | 'ahorroAnualEstimado'
  | 'amortizacionAnos';

/* =========================
 *   Self-contained data
 * ========================= */
const calculatorData: CalculatorData = {
  slug: 'calculadora-coste-placas-solares',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Coste de Instalación de Placas Solares (con subvenciones)',
  lang: 'es',
  tags:
    'calculadora placas solares, precio instalacion fotovoltaica, coste placas solares, subvenciones placas solares, next generation eu, deduccion irpf fotovoltaica, autoconsumo',
  prices: { costePorWp: 1.45, costeBateriaPorKwh: 700, subvencionPorKwp: 600, subvencionBateriaPorKwh: 490 },
  inputs: [
    {
      id: 'consumoElectricoMensual',
      label: 'Gasto eléctrico mensual medio',
      type: 'number',
      unit: '€',
      min: 0,
      tooltip:
        'Introduce la media de lo que pagas en tu factura de la luz cada mes. Esto nos ayuda a dimensionar la instalación.',
    },
    {
      id: 'tipoInmueble',
      label: 'Tipo de Inmueble',
      type: 'select',
      options: [
        { value: 'vivienda_unifamiliar', label: 'Vivienda Unifamiliar (Chalet, Casa)' },
        { value: 'comunidad_vecinos', label: 'Comunidad de Vecinos' },
        { value: 'empresa', label: 'Empresa' },
      ],
      tooltip: 'El tipo de inmueble puede influir en la complejidad y el coste de la instalación.',
    },
    {
      id: 'incluirBateria',
      label: '¿Deseas incluir baterías en la instalación?',
      type: 'boolean',
      tooltip:
        'Las baterías permiten almacenar la energía excedente para usarla por la noche o en días nublados, aumentando tu autoconsumo.',
    },
    {
      id: 'capacidadBateria',
      label: 'Capacidad de la batería (si aplica)',
      type: 'number',
      unit: 'kWh',
      min: 0,
      condition: 'incluirBateria == true',
      tooltip:
        'Selecciona la capacidad de almacenamiento. Una referencia común es el doble de la potencia de los paneles (ej. 4.5 kWp de paneles -> 10 kWh de batería).',
    },
  ],
  outputs: [
    { id: 'potenciaRecomendada', label: 'Potencia Fotovoltaica Recomendada', unit: 'kWp' },
    { id: 'costeInstalacionBruto', label: 'Coste Bruto de la Instalación (sin ayudas)', unit: '€' },
    { id: 'subvencionNextGen', label: 'Subvención Next Generation (Estimada)', unit: '€' },
    { id: 'deduccionIRPF', label: 'Deducción en IRPF (Estimada)', unit: '€' },
    { id: 'costeFinalNeto', label: 'Coste Final Neto de la Inversión', unit: '€' },
    { id: 'ahorroAnualEstimado', label: 'Ahorro Anual en Factura de Luz', unit: '€' },
    { id: 'amortizacionAnos', label: 'Años para Amortizar la Inversión', unit: 'años' },
  ],
  content:
    "### Introduzione: Calcola il Reale Costo e Risparmio dei Tuoi Pannelli Solari\n\nInstallare pannelli solari è uno degli investimenti più intelligenti per la tua casa, ma qual è il costo reale una volta considerati tutti gli aiuti disponibili? Questa calcolatrice va oltre un semplice preventivo. Stima il costo della tua installazione fotovoltaica e, cosa più importante, calcola l'impatto delle **sovvenzioni dei fondi europei Next Generation** e delle **detrazioni fiscali nell'IRPF**. Scopri il tuo investimento netto finale, il risparmio annuale sulla bolletta della luce e in quanti anni ammortizzerai il costo.\n\n### Guida all'Uso del Calcolatore\n\nPer ottenere una stima completa, inserisci i seguenti dati:\n\n1.  **Spesa Elettrica Mensile Media**: L'importo medio della tua bolletta della luce. È il dato più importante per dimensionare correttamente l'impianto di cui hai bisogno.\n2.  **Tipo di Immobile**: Seleziona se si tratta di una casa unifamiliare, una comunità di proprietari o un'azienda.\n3.  **Includere Batterie?**: Le batterie ti permettono di immagazzinare l'energia che non consumi durante il giorno per utilizzarla di notte, massimizzando il tuo autoconsumo. Sono un extra consigliato ma opzionale.\n4.  **Capacità della Batteria**: Se hai scelto di includerle, indica la capacità. Un buon punto di partenza è circa il doppio della potenza dei pannelli (ad es., per 5 kWp di pannelli, una batteria da 10 kWh).\n\n### Metodologia di Calcolo Spiegata\n\nLa nostra calcolatrice esegue un'analisi completa in diversi passaggi:\n\n1.  **Dimensionamento dell'Impianto**: In base alla tua spesa mensile, stimiamo la potenza fotovoltaica (in kWp) necessaria per coprire gran parte del tuo consumo.\n2.  **Calcolo del Costo Lordo**: Moltiplichiamo la potenza raccomandata per i costi medi di mercato attuali (€/Wp) e aggiungiamo il costo delle batterie se selezionate.\n3.  **Calcolo degli Aiuti e delle Detrazioni**:\n    * **Sovvenzioni Next Generation**: Applichiamo gli importi ufficiali (es. 600€ per kWp per impianti residenziali) al tuo impianto per calcolare la sovvenzione diretta.\n    * **Detrazione IRPF**: Si può detrarre tra il 20% e il 60% dell'investimento nella dichiarazione dei redditi. La nostra calcolatrice utilizza una stima media del 40% per calcolare questo beneficio fiscale aggiuntivo.\n4.  **Calcolo del Costo Netto e dell'Ammortamento**: Sottraiamo tutti gli aiuti dal costo lordo per ottenere l'**investimento finale reale**. Successivamente, dividiamo questo costo per il **risparmio annuale stimato** sulla tua bolletta per calcolare in quanti anni recupererai il tuo investimento.\n\n### Analisi Approfondita: Incentivi per l'Autoconsumo\n\n#### **Sovvenzioni Europee Next Generation: Un'Opportunità Unica**\n\nI fondi europei Next Generation hanno stanziato un budget significativo per promuovere l'autoconsumo in Spagna. Per gli impianti residenziali, gli importi principali sono:\n\n* **600 € per ogni kWp** di potenza nei pannelli.\n* **490 € per ogni kWh** di capacità nella batteria.\n\nQuesti aiuti diretti riducono drasticamente il costo iniziale e sono il principale motore che ha ridotto i tempi di ammortamento a meno di 5 anni in molti casi. È importante notare che queste sovvenzioni sono **limitate nel tempo** fino all'esaurimento dei fondi di ogni Comunità Autonoma.\n\n#### **Detrazioni Fiscali nell'IRPF: Un Ulteriore Risparmio**\n\nOltre alle sovvenzioni dirette, il governo offre importanti detrazioni fiscali nella dichiarazione dei redditi annuale per le installazioni di autoconsumo. Puoi dedurre una percentuale del costo totale dell'impianto in base al miglioramento dell'efficienza energetica ottenuto:\n\n* **Detrazione del 20%**: Se riduci il tuo consumo di energia primaria non rinnovabile del 7%.\n* **Detrazione del 40%**: Se riduci il consumo del 30% o se l'immobile ottiene una classe energetica 'A' o 'B'.\n* **Detrazione del 60%**: Per ristrutturazioni energetiche di edifici residenziali completi (più comune per le comunità di proprietari).\n\nPer una casa unifamiliare, l'obiettivo più realistico e comune è la **detrazione del 40%**, che è quella che utilizziamo per la nostra stima.\n\n### Domande Frequenti (FAQ)\n\n**1. Cosa succede all'energia che i miei pannelli producono e che non consumo?**\n\nL'energia in eccesso viene immessa nella rete elettrica. La tua compagnia elettrica ti compenserà per questa energia, applicando uno sconto sulla parte della tua bolletta relativa al consumo. Questo meccanismo si chiama \"compensazione semplificata degli eccedenti\".\n\n**2. Ho bisogno di un permesso di costruzione per installare i pannelli solari?**\n\nNella maggior parte dei comuni, grazie alle semplificazioni amministrative, per le installazioni residenziali su tetto **non è più necessario un permesso di costruzione**. Solitamente è sufficiente una **comunicazione previa** al comune. Tuttavia, è sempre consigliabile verificarlo presso il tuo municipio.\n\n**3. Le sovvenzioni e le detrazioni fiscali sono compatibili tra loro?**\n\nSì. Puoi beneficiare sia delle sovvenzioni dirette Next Generation sia della detrazione fiscale nell'IRPF. Tuttavia, è importante sapere che l'importo ricevuto come sovvenzione deve essere dichiarato nella dichiarazione dei redditi dell'anno successivo come guadagno patrimoniale.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué pasa con la energía que mis placas producen y no consumo?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            "La energía sobrante se vierte a la red eléctrica. Tu compañía eléctrica te compensará por esa energía, aplicando un descuento en la parte de consumo de tu factura. Este mecanismo se conoce como 'compensación simplificada de excedentes'.",
        },
      },
      {
        '@type': 'Question',
        name: '¿Necesito licencia de obras para instalar placas solares?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'En la mayoría de municipios, para instalaciones residenciales sobre tejado ya no es necesaria una licencia de obras. Suele ser suficiente con una comunicación previa al ayuntamiento.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Son compatibles las subvenciones y las deducciones de IRPF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí. Son compatibles, pero la subvención recibida se declara como ganancia patrimonial en la Renta del año siguiente.',
        },
      },
    ],
  },
};

/* =========================
 *   Utility components
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

const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () =>
    content.split('\n\n').map((paragraph, index) => {
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
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

/* =========================
 *   Chart (dynamic)
 * ========================= */
const DynamicBarChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({
        data,
        formatCurrency,
      }: {
        data: Array<{ name: string; costeNeto: number; ayudas: number }>;
        formatCurrency: (value: number) => string;
      }) => (
        <mod.ResponsiveContainer width="100%" height="100%">
          <mod.BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <mod.XAxis type="number" hide />
            <mod.YAxis type="category" dataKey="name" hide />
            <mod.Tooltip formatter={(value: number) => formatCurrency(value)} />
            <mod.Bar dataKey="costeNeto" stackId="a" fill="#3b82f6" name="Coste Final Neto" />
            <mod.Bar dataKey="ayudas" stackId="a" fill="#86efac" name="Ayudas Totales (Subvención + IRPF)" />
          </mod.BarChart>
        </mod.ResponsiveContainer>
      );
      return ChartComponent;
    }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div> }
);

/* =========================
 *       Main component
 * ========================= */
const CalculadoraCostePlacasSolares: React.FC = () => {
  const { slug, title, inputs, outputs, content, prices } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const initialStates: Record<string, number | string | boolean> = {
    consumoElectricoMensual: 150,
    tipoInmueble: 'vivienda_unifamiliar',
    incluirBateria: true,
    capacidadBateria: 5,
  };

  const [states, setStates] = useState<Record<string, number | string | boolean>>(initialStates);

  const handleStateChange = (id: string, value: string | number | boolean) => {
    const field = inputs.find((f) => f.id === id);
    if (!field) return;

    if (field.type === 'boolean') {
      setStates((prev) => ({ ...prev, [id]: Boolean(value) }));
      return;
    }
    if (field.type === 'select') {
      setStates((prev) => ({ ...prev, [id]: String(value) }));
      return;
    }

    // number
    const v = Number(value);
    const min = (field as NumberField).min ?? 0;
    const step = (field as NumberField).step ?? undefined;
    const rounded = step ? Math.round(v / step) * step : v;
    const safe = Number.isFinite(rounded) ? Math.max(min, rounded) : min;
    setStates((prev) => ({ ...prev, [id]: safe }));
  };

  const handleReset = () => setStates(initialStates);

  // Helper: condition parser (very simple, only "foo == true")
  const isConditionMet = (cond?: string) => {
    if (!cond) return true;
    const [field, , literal] = cond.split(' ').map((s) => s.trim());
    if (!field) return true;
    const val = states[field];
    if (literal === 'true') return Boolean(val) === true;
    if (literal === 'false') return Boolean(val) === false;
    return true;
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatKwp = (value: number) => `${value.toFixed(1)} kWp`;
  const formatYears = (value: number) => `${value.toFixed(1)} años`;

  const calculatedOutputs = useMemo(() => {
    const consumo = Number(states.consumoElectricoMensual) || 0;
    const incluirBateria = Boolean(states.incluirBateria);
    const capacidadBateria = incluirBateria ? Math.max(0, Number(states.capacidadBateria) || 0) : 0;

    // Dimensionamiento: eur/mes → kWp (assunzione semplice: ≈50 €/mes per kWp)
    // clamp per evitare zero: minimo 0.5 kWp
    const potenciaRecomendadaRaw = consumo / 50;
    const potenciaRecomendada = Math.max(0.5, Math.round(potenciaRecomendadaRaw * 10) / 10);

    // Coste bruto
    const costePaneles = potenciaRecomendada * 1000 * prices.costePorWp; // kWp→Wp
    const costeBateria = capacidadBateria * prices.costeBateriaPorKwh;
    const costeInstalacionBruto = costePaneles + costeBateria;

    // Subvenciones (sin topes por CCAA en esta versión)
    const subvencionPaneles = potenciaRecomendada * prices.subvencionPorKwp;
    const subvencionBateria = capacidadBateria * prices.subvencionBateriaPorKwh;
    const subvencionNextGen = Math.max(0, subvencionPaneles + subvencionBateria);

    // Deducción IRPF: se estima sobre base después de restar subvención
    const baseDeduccion = Math.max(0, costeInstalacionBruto - subvencionNextGen);
    const deduccionIRPF = baseDeduccion * 0.4; // stima media 40%

    // Coste final neto (non negativo)
    const costeFinalNeto = Math.max(0, costeInstalacionBruto - subvencionNextGen - deduccionIRPF);

    // Ahorro anual: 80% della spesa attuale (consumo * 12)
    const ahorroAnualEstimado = Math.max(0, consumo * 12 * 0.8);

    const amortizacionAnos = ahorroAnualEstimado > 0 ? costeFinalNeto / ahorroAnualEstimado : 0;

    return {
      potenciaRecomendada,
      costeInstalacionBruto,
      subvencionNextGen,
      deduccionIRPF,
      costeFinalNeto,
      ahorroAnualEstimado,
      amortizacionAnos,
    };
  }, [states, prices]);

  const chartData = useMemo(
    () => [
      {
        name: 'Escenario',
        costeNeto: calculatedOutputs.costeFinalNeto,
        ayudas: calculatedOutputs.subvencionNextGen + calculatedOutputs.deduccionIRPF,
      },
    ],
    [calculatedOutputs]
  );

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
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      alert('Resultado guardado con éxito!');
    } catch {
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
                Estima el coste real de tu instalación fotovoltaica y el tiempo de amortización con las ayudas actuales.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => {
                  const visible = isConditionMet((input as NumberField).condition);
                  if (!visible) return null;

                  return (
                    <div key={input.id}>
                      <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id}>
                        {input.label}
                        {'tooltip' in input && input.tooltip ? (
                          <Tooltip text={input.tooltip}>
                            <span className="ml-2 cursor-help">
                              <InfoIcon />
                            </span>
                          </Tooltip>
                        ) : null}
                      </label>

                      {input.type === 'select' ? (
                        <select
                          id={input.id}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                          value={String(states[input.id])}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                        >
                          {input.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : input.type === 'boolean' ? (
                        <input
                          id={input.id}
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600"
                          checked={Boolean(states[input.id])}
                          onChange={(e) => handleStateChange(input.id, e.target.checked)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            id={input.id}
                            aria-label={input.label}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                            type="number"
                            value={Number(states[input.id]) ?? 0}
                            onChange={(e) => handleStateChange(input.id, e.target.value)}
                            step={input.step ?? 1}
                            min={input.min ?? 0}
                          />
                          {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados de la Simulación</h2>
                {outputs.map((output) => {
                  const value = (calculatedOutputs as any)[output.id] as number;
                  let display = '...';
                  if (isClient) {
                    if (output.unit === '€') display = formatCurrency(value);
                    else if (output.unit === 'kWp') display = formatKwp(value);
                    else if (output.unit === 'años') display = formatYears(value);
                    else display = String(value);
                  }

                  return (
                    <div
                      key={output.id}
                      className={`flex items-baseline justify-between p-4 rounded-lg ${
                        output.id === 'costeFinalNeto' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                      <span
                        className={`text-xl md:text-2xl font-bold ${
                          output.id === 'costeFinalNeto' ? 'text-indigo-600' : 'text-gray-800'
                        }`}
                      >
                        {display}
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
            <h2 className="font-semibold mb-3 text-gray-800">Desglose del Coste y Ayudas</h2>
            <div className="h-40 w-full">{isClient && <DynamicBarChart data={chartData} formatCurrency={formatCurrency} />}</div>
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
            <h2 className="font-semibold mb-3 text-gray-800">Guía de Autoconsumo Solar</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.idae.es/ayudas-y-financiacion/para-autoconsumo-almacenamiento-y-termicas-renovables-sector-residencial-prtr"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  IDAE - Ayudas al Autoconsumo (Fondos Next Generation)
                </a>
              </li>
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-16-deducciones-inversion-vivienda-habitual/deduccion-obras-mejora-eficiencia-energetica-viviendas.html"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria - Deducción IRPF por Eficiencia Energética
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCostePlacasSolares;
