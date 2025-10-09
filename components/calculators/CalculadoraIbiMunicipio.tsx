'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* ===========================
   Icone & Tooltip
   =========================== */

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

/* ===========================
   Tipi & Dati
   =========================== */

type NumberInput = {
  id: string;
  label: string;
  type: 'number';
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
};

type SelectOption = { value: string; label: string };

type SelectInput = {
  id: string;
  label: string;
  type: 'select';
  options: SelectOption[];
  tooltip?: string;
};

type CalculatorInput = NumberInput | SelectInput;

type CalculatorOutput = { id: string; label: string };

const calculatorData: {
  slug: string;
  category: string;
  title: string;
  lang: string;
  tags: string;
  inputs: CalculatorInput[];
  outputs: CalculatorOutput[];
  content: string;
  seoSchema: any;
} = {
  slug: 'calculadora-ibi-municipio',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Impuesto sobre Bienes Inmuebles (IBI) por municipio',
  lang: 'es',
  tags:
    'calculadora ibi, impuesto bienes inmuebles, calcular ibi, valor catastral, tipo impositivo ibi, bonificaciones ibi, ibi madrid, ibi barcelona',
  inputs: [
    {
      id: 'naturalezaInmueble',
      label: 'Naturaleza del inmueble',
      type: 'select',
      options: [
        { value: 'urbano', label: 'Urbano' },
        { value: 'rustico', label: 'Rústico' },
      ],
      tooltip:
        'El tipo impositivo legal varía por naturaleza: urbano (0,40%–1,10%), rústico (0,30%–0,90%).',
    },
    {
      id: 'valorCatastral',
      label: 'Valor Catastral del Inmueble',
      type: 'number',
      unit: '€',
      tooltip:
        'El valor administrativo de tu vivienda. Lo encontrarás en el último recibo del IBI o en la Sede Electrónica del Catastro.',
    },
    {
      id: 'tipoImpositivo',
      label: 'Tipo Impositivo de tu Municipio',
      type: 'number',
      unit: '%',
      step: 0.001,
      tooltip:
        'Introduce el TIPO en formato porcentual. Ejemplos válidos: 0,45 · 0.45 · 0,450. El sistema interpretará 0,45 como 0,45%.',
    },
    {
      id: 'bonificacionPorcentual',
      label: 'Bonificaciones en Porcentaje',
      type: 'number',
      unit: '%',
      min: 0,
      max: 95,
      tooltip:
        'Suma de las bonificaciones (familia numerosa, VPO, paneles solares…).',
    },
  ],
  outputs: [
    { id: 'cuotaIntegra', label: 'Cuota Íntegra (IBI sin bonificar)' },
    { id: 'totalBonificaciones', label: 'Ahorro por Bonificaciones' },
    { id: 'cuotaFinal', label: 'Cuota Final a Pagar (IBI Neto)' },
  ],
  content:
    "### Introduzione: Calcola con Precisione l'IBI della Tua Casa\n\nL'Imposta sui Beni Immobili (IBI) è una tassa annuale che ogni proprietario di un immobile paga al proprio comune. Calcolarla può sembrare semplice, ma l'importo finale dipende da fattori specifici del tuo comune e dalle tue circostanze personali. Questa calcolatrice ti aiuta a stimare non solo la quota base dell'IBI, ma anche a capire come le **agevolazioni e gli sconti** (*bonificaciones*) possono ridurre significativamente l'importo finale che devi pagare.\n\n### Guida all'Uso del Calcolatore\n\nPer calcolare il tuo IBI, avrai bisogno solo di tre dati:\n\n1.  **Valore Catastale**: È il valore amministrativo del tuo immobile, non il prezzo di mercato. Puoi trovarlo facilmente nell'ultimo scontrino dell'IBI o consultando la Sede Elettronica del Catasto.\n2.  **Aliquota Fiscale del Tuo Comune**: Questa è la percentuale che il tuo comune applica al valore catastale. Poiché varia per ogni comune, devi cercarla nell'ordinanza fiscale del tuo municipio (cerca su Google `\"ordenanza fiscal IBI\" + [nome del tuo comune]`).\n3.  **Agevolazioni in Percentuale**: Se hai diritto a sconti (per famiglia numerosa, casa popolare, pannelli solari, ecc.), somma le percentuali e inserisci il totale qui. Consulta l'ordinanza del tuo comune per conoscere gli sconti disponibili.\n\n### Metodologia di Calcolo Spiegata\n\nIl calcolo dell'IBI segue una formula ufficiale molto chiara, che abbiamo implementato:\n\n1.  **Calcolo della Quota Integra**: È l'importo lordo dell'imposta, prima di qualsiasi sconto. Si ottiene moltiplicando il **Valore Catastale** per l'**Aliquota Fiscale** del tuo comune. \n    `Quota Integra = Valore Catastale x (Aliquota Fiscale / 100)`\n2.  **Calcolo degli Sconti**: L'importo risparmiato si calcola applicando la percentuale di sconto alla Quota Integra.\n    `Risparmio = Quota Integra x (% di Sconto / 100)`\n3.  **Calcolo della Quota Finale**: È l'importo netto che effettivamente pagherai.\n    `Quota Finale da Pagare = Quota Integra - Risparmio`\n\n### Domande Frequenti (FAQ)\n\n**Dove trovo il valore catastale?** Nel tuo ultimo IBI o nella Sede Elettronica del Catasto.\n",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Dónde encuentro el valor catastral de mi vivienda?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'La forma más sencilla es mirar un recibo antiguo del IBI. Ahí encontrarás el valor catastral total y su desglose en valor de suelo y construcción.',
        },
      },
    ],
  },
};

/* ===========================
   SEO JSON-LD
   =========================== */

const FaqSchema = () => (
  <script
    type="application/ld+json"
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }}
  />
);

/* ===========================
   Content renderer
   =========================== */

const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h3
            key={index}
            className="text-xl font-bold mt-6 mb-4 text-gray-800"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: paragraph
                .replace(/### (.*)/, '$1')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h4
            key={index}
            className="text-lg font-semibold mt-4 mb-3 text-gray-700"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: paragraph
                .replace(/#### (.*)/, '$1')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        );
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li
            key={i}
            className="leading-relaxed"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
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
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
          }}
        />
      );
    });
  };
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

/* ===========================
   Recharts (dinamico)
   =========================== */

const DynamicBarChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({
        data,
        formatCurrency,
      }: {
        data: any[];
        formatCurrency: (value: number) => string;
      }) => (
        <mod.ResponsiveContainer width="100%" height="100%">
          <mod.BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <mod.XAxis type="number" hide />
            <mod.YAxis type="category" dataKey="name" hide />
            <mod.Tooltip formatter={(value: number) => formatCurrency(value)} />
            <mod.Bar dataKey="value" stackId="a" fill="#3b82f6" name="Cuota Final a Pagar" />
            <mod.Bar dataKey="saved" stackId="a" fill="#a78bfa" name="Ahorro por Bonificación" />
          </mod.BarChart>
        </mod.ResponsiveContainer>
      );
      return ChartComponent;
    }),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div>,
  }
);

/* ===========================
   Type guards
   =========================== */

function isSelectInput(i: CalculatorInput): i is SelectInput {
  return (i as SelectInput).type === 'select' && Array.isArray((i as SelectInput).options);
}
function isNumberInput(i: CalculatorInput): i is NumberInput {
  return (i as NumberInput).type === 'number';
}

/* ===========================
   Helpers percentuali
   =========================== */

// Forchette legali (linea base)
const RANGES = {
  urbano: { min: 0.4, max: 1.1 }, // %
  rustico: { min: 0.3, max: 0.9 }, // %
};

// Normalizza stringhe con virgola e ritorna numero
function normalizeNumericInput(raw: string | number): number {
  if (typeof raw === 'number') return raw;
  const replaced = raw.replace(',', '.').trim();
  const n = Number(replaced);
  return Number.isFinite(n) ? n : 0;
}

// Clampa un valore a [min, max]
function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

// Format % con virgola
function formatPercentLabel(v: number) {
  return v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}

/* ===========================
   Component principale
   =========================== */

const CalculadoraIbiMunicipio: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialStates = {
    naturalezaInmueble: 'urbano', // 'urbano' | 'rustico'
    valorCatastral: 160000,
    tipoImpositivo: 0.55, // in percento "puro", es. 0.55 = 0,55%
    bonificacionPorcentual: 0,
  };

  const [states, setStates] = useState<Record<string, any>>(initialStates);

  // bounds dinamici in base alla natura
  const bounds = useMemo(() => {
    const nat = (states.naturalezaInmueble as 'urbano' | 'rustico') || 'urbano';
    return RANGES[nat];
  }, [states.naturalezaInmueble]);

  const handleStateChange = (id: string, value: any) => {
    setStates((prev) => {
      // normalizzazione virgole per number
      if (id === 'tipoImpositivo' || id === 'bonificacionPorcentual' || id === 'valorCatastral') {
        const v = normalizeNumericInput(value);
        // clamp dinamico per tipoImpositivo
        if (id === 'tipoImpositivo') {
          const clamped = clamp(v, bounds.min, bounds.max);
          return { ...prev, [id]: clamped };
        }
        // clamp fisso per bonificaciones (0-95)
        if (id === 'bonificacionPorcentual') {
          const clamped = clamp(v, 0, 95);
          return { ...prev, [id]: clamped };
        }
        // valor catastral >= 0
        return { ...prev, [id]: Math.max(0, v) };
      }

      // select: passthrough
      return { ...prev, [id]: value };
    });
  };

  const handleReset = () => setStates(initialStates);

  // Etichetta live per il tipoImpositivo
  const interpretedPercentLabel = useMemo(() => {
    const p = Number(states.tipoImpositivo) || 0;
    const ok = p >= bounds.min && p <= bounds.max;
    return {
      text: `Stai inserendo: ${formatPercentLabel(p)} ${ok ? '(interpretato correttamente)' : '(fuori forchetta)'} `,
      ok,
    };
  }, [states.tipoImpositivo, bounds]);

  // Tooltip automatico “hint percentuale”
  const autoTooltipTipo = useMemo(() => {
    const nat = states.naturalezaInmueble === 'rustico' ? 'rústico' : 'urbano';
    return `Formato consigliato: 0,45 (interpreta 0,45%). Forchetta legale ${nat}: ${bounds.min.toFixed(
      2
    )}% – ${bounds.max.toFixed(2)}%. I valori fuori forchetta vengono bloccati.`;
  }, [states.naturalezaInmueble, bounds]);

  const calculatedOutputs = useMemo(() => {
    const vCat = Number(states.valorCatastral) || 0;
    const tipoPercent = (Number(states.tipoImpositivo) || 0) / 100; // es. 0.55% => 0.0055
    const bonifPercent = (Number(states.bonificacionPorcentual) || 0) / 100;

    const cuotaIntegra = vCat * tipoPercent;
    const totalBonificaciones = cuotaIntegra * bonifPercent;
    const cuotaFinal = Math.max(0, cuotaIntegra - totalBonificaciones);

    return { cuotaIntegra, totalBonificaciones, cuotaFinal };
  }, [states]);

  const chartData = useMemo(
    () => [{ name: 'Desglose IBI', value: calculatedOutputs.cuotaFinal, saved: calculatedOutputs.totalBonificaciones }],
    [calculatedOutputs]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

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
                Estima la cuota anual de tu IBI, incluyendo las bonificaciones aplicables en tu caso.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => (
                  <div
                    key={input.id}
                    className={input.id === 'bonificacionPorcentual' ? 'md:col-span-2' : ''}
                  >
                    <label
                      className="block text-sm font-medium text-gray-700 flex items-center mb-1"
                      htmlFor={input.id}
                    >
                      {input.label}
                      {!!input.tooltip && (
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2 cursor-help">
                            <InfoIcon />
                          </span>
                        </Tooltip>
                      )}
                    </label>

                    {isSelectInput(input) ? (
                      <select
                        id={input.id}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        value={String(states[input.id] ?? '')}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                      >
                        {input.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      isNumberInput(input) && (
                        <>
                          <div className="flex items-center gap-2">
                            <input
                              id={input.id}
                              aria-label={input.label}
                              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                              type="number"
                              value={String(states[input.id] ?? '')}
                              step={input.step}
                              min={input.id === 'tipoImpositivo' ? RANGES[(states.naturalezaInmueble as 'urbano' | 'rustico') || 'urbano'].min : input.min}
                              max={input.id === 'tipoImpositivo' ? RANGES[(states.naturalezaInmueble as 'urbano' | 'rustico') || 'urbano'].max : input.max}
                              onChange={(e) => handleStateChange(input.id, e.target.value)}
                            />
                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                          </div>

                          {input.id === 'tipoImpositivo' && (
                            <div className="mt-1 flex items-center gap-2 text-xs">
                              <span
                                className={`px-2 py-1 rounded ${
                                  interpretedPercentLabel.ok
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                                title={autoTooltipTipo}
                              >
                                {interpretedPercentLabel.text}
                              </span>
                              <Tooltip text={autoTooltipTipo}>
                                <span className="cursor-help">
                                  <InfoIcon />
                                </span>
                              </Tooltip>
                            </div>
                          )}
                        </>
                      )
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del Cálculo Anual</h2>
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between p-4 rounded-lg ${
                      output.id === 'cuotaFinal' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span
                      className={`text-xl md:text-2xl font-bold ${
                        output.id === 'cuotaFinal'
                          ? 'text-indigo-600'
                          : output.id === 'totalBonificaciones' && calculatedOutputs.totalBonificaciones > 0
                          ? 'text-green-600'
                          : 'text-gray-800'
                      }`}
                    >
                      {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Desglose de la Cuota Íntegra</h2>
            <div className="h-24 w-full">
              {isClient && <DynamicBarChart data={chartData} formatCurrency={formatCurrency} />}
            </div>
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
            <h2 className="font-semibold mb-3 text-gray-800">Guía sobre el IBI</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.catastro.gob.es/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Dirección General del Catastro
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley Reguladora de las Haciendas Locales
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIbiMunicipio;
