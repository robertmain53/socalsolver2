'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

/* =========================
 *        Types
 * ========================= */
type SelectOption = { value: string; label: string };

type NumberField = {
  id: string;
  label: string;
  type: 'number';
  unit?: string;
  min?: number;
  step?: number;
  tooltip?: string;
  /** Esempio: "metodoCalculo == 'valor_catastral'" */
  condition?: string;
};

type SelectField = {
  id: string;
  label: string;
  type: 'select';
  options: SelectOption[];
  tooltip?: string;
};

type BooleanField = {
  id: string;
  label: string;
  type: 'boolean';
  tooltip?: string;
  condition?: string;
};

type InputField = NumberField | SelectField | BooleanField;

type OutputField = {
  id: 'tasaAnualEstimada';
  label: string;
  unit?: '€';
};

type CalculatorData = {
  slug: string;
  category: string;
  title: string;
  lang: string;
  tags: string;
  inputs: InputField[];
  outputs: OutputField[];
  content: string;
  seoSchema: any;
};

/* =========================
 *   Self-contained data
 * ========================= */
const calculatorData: CalculatorData = {
  slug: 'calculadora-tasa-basuras',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la Tasa de Basuras por municipio',
  lang: 'es',
  tags:
    'calculadora tasa basuras, impuesto basuras, tasa municipal, cuanto se paga de basuras, ordenanza fiscal basuras, Tasa por Gestión de Residuos Urbanos',
  inputs: [
    {
      id: 'metodoCalculo',
      label: 'Método de cálculo de tu municipio',
      type: 'select',
      options: [
        { value: 'valor_catastral', label: 'Por Valor Catastral' },
        { value: 'superficie', label: 'Por Superficie (m²)' },
        { value: 'cuota_fija', label: 'Por Cuota Fija' },
      ],
      tooltip:
        'Consulta la ordenanza fiscal de tu ayuntamiento. El más común es por tramos de valor catastral.',
    },
    {
      id: 'valorCatastral',
      label: 'Valor Catastral del Inmueble',
      type: 'number',
      unit: '€',
      min: 0,
      condition: "metodoCalculo == 'valor_catastral'",
      tooltip:
        'Lo encontrarás en tu último recibo del IBI. Se usa para clasificar tu vivienda en una categoría fiscal.',
    },
    {
      id: 'metrosCuadrados',
      label: 'Superficie de la Vivienda',
      type: 'number',
      unit: 'm²',
      min: 0,
      step: 1,
      condition: "metodoCalculo == 'superficie'",
      tooltip:
        'Algunos ayuntamientos calculan la tasa según los m² de la vivienda.',
    },
    {
      id: 'cuotaFija',
      label: 'Importe de la Cuota Fija Anual',
      type: 'number',
      unit: '€',
      min: 0,
      condition: "metodoCalculo == 'cuota_fija'",
      tooltip:
        'Si tu municipio establece un importe único para todas las viviendas, introdúcelo aquí.',
    },
  ],
  outputs: [{ id: 'tasaAnualEstimada', label: 'Tasa Anual Estimada', unit: '€' }],
  content:
    "### Introduzione: Stima la Tua Tassa sui Rifiuti Municipale\n\nLa Tassa sulla Gestione dei Rifiuti Urbani, comunemente nota come **tassa sui rifiuti**, è un tributo locale che ogni proprietario di un immobile paga al proprio comune. A differenza dell'IBI, il suo calcolo non è uniforme in tutta la Spagna; al contrario, **ogni comune stabilisce i propri criteri e importi** nelle sue ordinanze fiscali. Questa calcolatrice ti aiuta a stimare il costo annuale di questa tassa, spiegando i metodi di calcolo più comuni e guidandoti a trovare le informazioni di cui hai bisogno.\n\n### Guida all'Uso del Calcolatore\n\nPer ottenere una stima, devi prima conoscere il metodo di calcolo del tuo comune:\n\n1.  **Metodo di Calcolo del Tuo Comune**: Questo è il dato più importante. Cerca nell'ordinanza fiscale del tuo comune (cerca su Google `\"ordenanza fiscal tasa de basura\" + [nome del tuo comune]`) se il calcolo si basa sul **Valore Catastale**, sulla **Superficie** o se è una **Quota Fissa**.\n2.  **Inserisci i Dati Corrispondenti**: A seconda del metodo selezionato, inserisci il valore catastale del tuo immobile (che si trova sulla ricevuta dell'IBI), la sua superficie in m² o l'importo della quota fissa.\n\n### Metodologia di Calcolo Spiegata\n\nI comuni utilizzano principalmente tre sistemi per calcolare la tassa sui rifiuti:\n\n* **Per Valore Catastale (il più comune)**: I comuni creano delle fasce (*tramos*) di valore catastale e assegnano una quota annuale a ciascuna fascia.\n* **Per Superficie**: Alcuni comuni stabiliscono le quote in base ai metri quadrati dell'immobile.\n* **Per Quota Fissa**: Il metodo più semplice. Tutti gli immobili residenziali dello stesso tipo pagano lo stesso importo.\n\n### Analisi Approfondita: La Tassa sui Rifiuti in Spagna\n\n#### **Perché l'Importo Varia Così Tanto tra i Comuni?**\n\nLa tassa sui rifiuti è una **tassa, non un'imposta**. Il suo scopo è coprire il costo del servizio prestato. L'enorme variazione di prezzo dipende da costi, efficienza e scelte politiche locale.\n\n#### **Il Nuovo Obbligo Europeo e la Legge sui Rifiuti**\n\nLa **Ley 7/2022** obbliga a coprire **il costo reale** del servizio: molti comuni dovranno crearla o aumentarla.\n\n### Domande Frequenti (FAQ)\n\n**1. Chi paga la tassa sui rifiuti?**\n\nIl **contribuente** è il **proprietario**; può essere pattuito in contratto che la paghi l'inquilino.\n\n**2. Esistono agevolazioni?**\n\nSì, per vari collettivi (pensionati, famiglie numerose, ecc.), da richiedere secondo ordinanza locale.\n\n**3. Come e quando si paga?**\n\nDi solito insieme all'**IBI**, annualmente o semestralmente; la domiciliazione può dare sconti.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Quién paga la tasa de basuras, el propietario o el inquilino?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'El contribuyente de la tasa es siempre el propietario del inmueble. No obstante, la LAU permite repercutirla al inquilino si así se pacta por escrito.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Existen bonificaciones o descuentos en la tasa de basuras?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí. Muchas ordenanzas contemplan bonificaciones para ciertos colectivos. Deben solicitarse expresamente.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo y cuándo se paga la tasa de basuras?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Habitualmente junto al IBI, de forma anual o semestral. La domiciliación bancaria suele ofrecer pequeño descuento.',
        },
      },
    ],
  },
};

/* =========================
 *   Utility components
 * ========================= */
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
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
  const renderContent = () => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
      }
      if (paragraph.startsWith('#### ')) {
        return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
        return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{listItems}</ul>;
      }
      return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });
  };
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

/* =========================
 *    Helpers & Defaults
 * ========================= */

// Parser molto semplice per condizioni del tipo: campo == 'valore' / campo == true/false
const evalCondition = (cond: string, state: Record<string, any>) => {
  try {
    const m = cond.match(/^(\w+)\s*==\s*(.+)$/);
    if (!m) return true;
    const [, field, raw] = m;
    let expected: any = raw.trim();
    if (expected === 'true') expected = true;
    else if (expected === 'false') expected = false;
    else if ((expected.startsWith("'") && expected.endsWith("'")) || (expected.startsWith('"') && expected.endsWith('"'))) {
      expected = expected.slice(1, -1);
    }
    return state[field] === expected;
  } catch {
    return true;
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

/* =========================
 *      Main component
 * ========================= */
const CalculadoraTasaBasuras: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates: Record<string, string | number | boolean> = {
    metodoCalculo: 'valor_catastral',
    valorCatastral: 110000,
    metrosCuadrados: 90,
    cuotaFija: 80,
  };

  const [states, setStates] = useState<Record<string, string | number | boolean>>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    const field = inputs.find(f => f.id === id);
    if (!field) return;

    if (field.type === 'select') {
      setStates(prev => ({ ...prev, [id]: String(value) }));
      return;
    }
    if (field.type === 'boolean') {
      setStates(prev => ({ ...prev, [id]: Boolean(value) }));
      return;
    }

    // number
    const v = Number(value);
    const min = (field as NumberField).min ?? 0;
    const step = (field as NumberField).step;
    const rounded = Number.isFinite(v) ? (step ? Math.round(v / step) * step : v) : min;
    setStates(prev => ({ ...prev, [id]: Math.max(min, rounded) }));
  };

  const handleReset = () => setStates(initialStates);

  // Stime di riferimento (facilmente modificabili)
  const estimateByValorCatastral = (vc: number) => {
    if (vc <= 18000) return 27.85;
    if (vc <= 30000) return 58.70;
    if (vc <= 60000) return 89.20;
    if (vc <= 100000) return 110.15;
    if (vc <= 150000) return 125.45;
    return 188.40;
  };

  const estimateBySuperficie = (m2: number) => {
    if (m2 <= 60) return 65;
    if (m2 <= 90) return 80;
    if (m2 <= 120) return 95;
    return 125;
    // Nota: alcuni comuni applicano €/m² (es. m2 * 0.9). Qui usiamo fasce comuni.
  };

  const calculatedOutputs = useMemo(() => {
    const metodo = String(states.metodoCalculo);
    let tasaAnualEstimada = 0;

    if (metodo === 'valor_catastral') {
      const vc = Number(states.valorCatastral) || 0;
      tasaAnualEstimada = estimateByValorCatastral(vc);
    } else if (metodo === 'superficie') {
      const m2 = Number(states.metrosCuadrados) || 0;
      tasaAnualEstimada = estimateBySuperficie(m2);
    } else {
      tasaAnualEstimada = Number(states.cuotaFija) || 0;
    }

    // Non negativo e con 2 decimali “belli”
    tasaAnualEstimada = Math.max(0, Number(tasaAnualEstimada.toFixed(2)));

    return { tasaAnualEstimada };
  }, [states]);

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
    } catch {
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
                Estima la cuota anual de la tasa de basuras según los criterios de cálculo más habituales.
              </p>

              <div className="space-y-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => {
                  const visible =
                    !('condition' in input) || !input.condition
                      ? true
                      : evalCondition(input.condition, states);

                  if (!visible) return null;

                  return (
                    <div key={input.id}>
                      <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id}>
                        {input.label}
                        {'tooltip' in input && input.tooltip ? (
                          <Tooltip text={input.tooltip}>
                            <span className="ml-2 cursor-help"><InfoIcon /></span>
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
                          {input.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                {outputs.map((output) => (
                  <div key={output.id} className="flex items-baseline justify-between p-4 rounded-lg bg-indigo-50 border-l-4 border-indigo-500">
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span className="text-xl md:text-2xl font-bold text-indigo-600">
                      {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                    </span>
                  </div>
                ))}
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <strong>Nota:</strong> Esta es una estimación basada en tramos comunes. El importe exacto puede variar. Consulta siempre la ordenanza fiscal de tu municipio para confirmar la cuota precisa.
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Reiniciar</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía sobre la Tasa de Basuras</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2022-5809" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 7/2022, de residuos y suelos contaminados</a></li>
              <li><a href="https://www.hacienda.gob.es/es-ES/Areas%20Tematicas/financiacion%20autonomica/Paginas/TributosCedidos.aspx" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ministerio de Hacienda - Tributos Locales</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraTasaBasuras;
