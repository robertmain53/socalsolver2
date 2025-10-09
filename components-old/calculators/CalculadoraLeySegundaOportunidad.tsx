'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// ---------- Tipi ----------
type NumberField = {
  id:
    | 'deudaHipotecaria'
    | 'valorVivienda'
    | 'cuotaHipotecaMensual'
    | 'otrasDeudas'
    | 'ingresosMensuales'
    | 'gastosFijosMensuales';
  label: string;
  type: 'number';
  unit?: string;
  tooltip?: string;
};

type InputGroup = {
  group: string;
  fields: NumberField[];
};

type OutputId =
  | 'deudaPrivilegiada'
  | 'deudaExcedente'
  | 'capacidadPagoMensual'
  | 'porcentajeDeudaCubiertoPlan'
  | 'resultadoViabilidad';

type OutputDef = { id: OutputId; label: string };

type CalculatorData = {
  slug: string;
  category: string;
  title: string;
  lang: 'es';
  tags: string;
  inputs: InputGroup[];
  outputs: OutputDef[];
  content: string;
  seoSchema: Record<string, any>;
};

// ---------- Icona info ----------
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

// ---------- Tooltip ----------
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// ---------- Dati Self-Contained ----------
const calculatorData: CalculatorData = {
  slug: 'calculadora-ley-segunda-oportunidad',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la "Ley de Segunda Oportunidad" para deudas hipotecarias',
  lang: 'es',
  tags:
    'calculadora ley segunda oportunidad, lso, cancelar deudas, deuda hipotecaria, salvar vivienda habitual, concurso de acreedores, exoneracion deudas, ley 16/2022',
  inputs: [
    {
      group: '1. Tu Vivienda e Hipoteca',
      fields: [
        {
          id: 'deudaHipotecaria',
          label: 'Deuda hipotecaria pendiente',
          type: 'number',
          unit: '€',
          tooltip: 'La cantidad total que te queda por pagar de tu hipoteca sobre la vivienda habitual.',
        },
        {
          id: 'valorVivienda',
          label: 'Valor actual de tu vivienda',
          type: 'number',
          unit: '€',
          tooltip: 'Una estimación realista del precio de mercado de tu vivienda habitual.',
        },
        {
          id: 'cuotaHipotecaMensual',
          label: 'Cuota mensual de la hipoteca',
          type: 'number',
          unit: '€',
          tooltip: 'La cuota que pagas al banco cada mes por tu hipoteca.',
        },
      ],
    },
    {
      group: '2. Otras Deudas (No hipotecarias)',
      fields: [
        {
          id: 'otrasDeudas',
          label: 'Suma de otras deudas',
          type: 'number',
          unit: '€',
          tooltip:
            'Suma el total de préstamos personales, tarjetas de crédito, microcréditos, etc. (Excluye la hipoteca de tu vivienda habitual).',
        },
      ],
    },
    {
      group: '3. Tu Situación Económica Mensual',
      fields: [
        {
          id: 'ingresosMensuales',
          label: 'Ingresos mensuales de la unidad familiar',
          type: 'number',
          unit: '€',
          tooltip: 'Suma todos los ingresos netos mensuales (nóminas, ayudas, rentas, etc.).',
        },
        {
          id: 'gastosFijosMensuales',
          label: 'Gastos fijos mensuales (sin deudas)',
          type: 'number',
          unit: '€',
          tooltip:
            'Suma tus gastos esenciales: alquiler (si aplica), comida, suministros (luz, agua), transporte, etc. NO incluyas las cuotas de préstamos o tarjetas.',
        },
      ],
    },
  ],
  outputs: [
    { id: 'deudaPrivilegiada', label: 'Deuda Hipotecaria Cubierta por la Vivienda' },
    { id: 'deudaExcedente', label: 'Deuda Hipotecaria No Cubierta (Excedente)' },
    { id: 'capacidadPagoMensual', label: 'Capacidad de Pago Mensual para Otras Deudas' },
    { id: 'porcentajeDeudaCubiertoPlan', label: '% de Otras Deudas que Podrías Pagar en 5 años' },
    { id: 'resultadoViabilidad', label: 'Análisis de Viabilidad Preliminar' },
  ],
  content:
    "### Introduzione: Scopri se la Legge della Seconda Opportunità può aiutarti\n\nLa Legge della Seconda Opportunità (LSO) è un meccanismo legale in Spagna che permette a privati e autonomi in stato di insolvenza di ristrutturare o cancellare i propri debiti. Uno dei suoi aspetti più importanti è la possibilità di **salvare la propria abitazione principale** anche in una situazione finanziaria difficile. Questa calcolatrice è uno strumento di **simulazione** progettato per darti una prima idea della tua idoneità e di come potrebbe essere un piano di pagamento per conservare la tua casa, basandosi sulla riforma del 2022.\n\n**AVVISO**: Questo strumento è puramente informativo e non costituisce consulenza legale. Il processo della LSO è complesso e richiede l'assistenza obbligatoria di un avvocato.\n\n### Guida all'Uso del Simulatore\n\nPer una valutazione preliminare, fornisci i dati sulla tua situazione patrimoniale e finanziaria:\n\n1.  **Abitazione e Mutuo**: Indica il valore attuale della tua casa e il debito ipotecario residuo, oltre alla rata mensile.\n2.  **Altri Debiti**: Somma tutti gli altri debiti che possiedi (prestiti personali, carte di credito, ecc.), escludendo il mutuo della tua abitazione principale.\n3.  **Situazione Economica**: Inserisci le entrate nette mensili totali del tuo nucleo familiare e le tue spese fisse mensili (senza contare le rate dei debiti).\n\n### Metodologia di Calcolo Spiegata\n\nLa calcolatrice analizza la tua situazione secondo la logica della riforma della Legge Concorsuale (Legge 16/2022) per l'abitazione principale:\n\n1.  **Divisione del Debito Ipotecario**: La legge distingue due parti del tuo mutuo:\n    * **Debito Privilegiato**: La parte del mutuo coperta dal valore attuale della casa. Questa parte deve continuare a essere pagata per conservare l'immobile.\n    * **Debito Ordinario**: Se il tuo debito ipotecario è superiore al valore della casa (patrimonio netto negativo o \"underwater\"), la parte eccedente viene trattata come un debito normale.\n2.  **Calcolo della Capacità di Pagamento**: Sottraiamo le tue spese fisse e la rata del mutuo dalle tue entrate mensili. L'importo rimanente è la tua **capacità teorica** di far fronte a un piano di pagamento per il resto dei debiti.\n3.  **Stima del Piano di Pagamento**: Calcoliamo quanto del tuo debito non privilegiato potresti coprire con la tua capacità di pagamento in un piano di 3 o 5 anni. Il resto potrebbe essere cancellato (*esonerato*) da un giudice.\n4.  **Analisi di Fattibilità**: In base alla tua capacità di pagamento rispetto ai tuoi debiti, ti offriamo una valutazione preliminare della fattibilità di un piano di pagamento per salvare la tua casa.\n\n### Analisi Approfondita: La Legge della Seconda Opportunità per i Proprietari di Casa\n\n#### **Posso Davvero Salvare la Mia Casa con la LSO?**\n\nSì, la riforma del 2022 ha rafforzato la possibilità di salvare l'abitazione principale. La chiave è dimostrare di poter continuare a pagare la rata del mutuo e, inoltre, proporre un **piano di pagamento** credibile per il resto dei creditori, utilizzando la parte del tuo reddito che non è essenziale per vivere (reddito disponibile). Se il giudice approva il piano e tu lo rispetti (solitamente per 3 o 5 anni), alla fine del periodo potrai ottenere la cancellazione (*esdebitazione*) del debito rimanente non pagato, conservando la tua casa.\n\n#### **Debito Esonerabile vs. Debito Non Esonerabile**\n\nLa LSO non cancella tutti i debiti allo stesso modo. È importante distinguere:\n\n* **Debiti Esonerabili**: La maggior parte dei debiti privati, come prestiti personali, carte di credito, microcrediti e il debito ipotecario eccedente il valore dell'immobile.\n* **Debiti Non Esonerabili (o con limiti)**: Debiti per alimenti, debiti derivanti da responsabilità civile extracontrattuale e **debiti pubblici** (Agenzia delle Entrate e Previdenza Sociale). Questi ultimi possono essere cancellati solo fino a un massimo di 10.000 € per ogni amministrazione.\n\n### Domande Frequenti (FAQ)\n\n**1. Cosa succede se non riesco a rispettare il piano di pagamento?**\n\nSe non riesci a rispettare il piano di pagamento approvato, il giudice potrebbe revocarlo. In questo scenario, l'opzione di salvare la casa potrebbe andare persa e l'immobile potrebbe essere liquidato. Tuttavia, potresti comunque accedere alla cancellazione dei debiti attraverso la via della liquidazione del patrimonio.\n\n**2. Devo avere debiti con più creditori per accedere alla LSO?**\n\nSì. Uno dei requisiti fondamentali è trovarsi in una situazione di insolvenza e avere debiti con **almeno due creditori diversi** (ad esempio, la banca del mutuo e una società finanziaria di una carta di credito).\n\n**3. Ho bisogno di un avvocato per questo processo?**\n\nSì, assolutamente. La Legge della Seconda Opportunità è un procedimento giudiziario complesso che richiede **obbligatoriamente l'intervento di un avvocato e di un procuratore**. Questa calcolatrice serve solo come strumento di orientamento iniziale.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué pasa si no puedo cumplir el plan de pagos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Si no puedes cumplir el plan de pagos aprobado, el juez podría revocarlo. En ese escenario, la opción de salvar la vivienda podría perderse y el inmueble podría liquidarse. No obstante, aún podrías acceder a la exoneración de deudas por la vía de la liquidación de patrimonio.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Tengo que tener deudas con varios acreedores para acogerme a la LSO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí. Uno de los requisitos fundamentales es encontrarse en una situación de insolvencia y tener deudas con al menos dos acreedores distintos (por ejemplo, el banco de la hipoteca y una financiera de una tarjeta de crédito).',
        },
      },
      {
        '@type': 'Question',
        name: '¿Necesito un abogado para este proceso?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, absolutamente. La Ley de la Segunda Oportunidad es un procedimiento judicial complejo que requiere obligatoriamente la intervención de abogado y procurador. Esta calculadora solo sirve como una herramienta de orientación inicial.',
        },
      },
    ],
  },
};

// ---------- SEO Schema ----------
const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

// ---------- Renderer contenuti ----------
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
          dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      );
    });
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

// ---------- Grafico (dinamico) ----------
const DynamicPieChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data }: { data: { name: string; value: number }[] }) => {
        const COLORS = ['#22c55e', '#f97316', '#ef4444'];
        return (
          <mod.ResponsiveContainer width="100%" height="100%">
            <mod.PieChart>
              <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {data.map((_, index) => (
                  <mod.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </mod.Pie>
              <mod.Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
                }
              />
              <mod.Legend />
            </mod.PieChart>
          </mod.ResponsiveContainer>
        );
      };
      return ChartComponent;
    }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div> },
);

// ---------- Util ----------
const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const toNumber = (raw: string | number): number => {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const normalized = raw.replace(/\./g, '').replace(',', '.'); // accetta "1.234,56"
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
};

// ---------- Componente principale ----------
const CalculadoraLeySegundaOportunidad: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const initialStates = {
    deudaHipotecaria: 180000,
    valorVivienda: 150000,
    cuotaHipotecaMensual: 650,
    otrasDeudas: 40000,
    ingresosMensuales: 2400,
    gastosFijosMensuales: 1300,
  } as const;

  const [states, setStates] = useState<Record<string, number>>({ ...initialStates });

  const handleStateChange = (id: string, value: string) => {
    // Euro ≥ 0, limite realistico fino a 5 milioni
    const parsed = clamp(Math.round(toNumber(value)), 0, 5_000_000);
    setStates((prev) => ({ ...prev, [id]: parsed }));
  };

  const handleReset = () => setStates({ ...initialStates });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercent = (value: number) => `${clamp(value, 0, 100).toFixed(1)}%`;

  // ---- Calcoli principali ----
  const calculated = useMemo(() => {
    const dHipotecaria = Number(states.deudaHipotecaria) || 0;
    const vVivienda = Number(states.valorVivienda) || 0;
    const oDeudas = Number(states.otrasDeudas) || 0;
    const ingresos = Number(states.ingresosMensuales) || 0;
    const gastos = Number(states.gastosFijosMensuales) || 0;
    const cuotaHipoteca = Number(states.cuotaHipotecaMensual) || 0;

    // 1) Partizione ipoteca
    const deudaPrivilegiada = Math.min(dHipotecaria, vVivienda); // coperta dal valore casa
    const deudaExcedente = Math.max(0, dHipotecaria - vVivienda); // parte "ordinaria"
    const totalDeudasNoPrivilegiadas = oDeudas + deudaExcedente;

    // 2) Capacità di pagamento: reddito disponibile dopo spese essenziali + rata mutuo
    const capacidadPagoMensual = Math.max(0, ingresos - gastos - cuotaHipoteca);

    // 3) Quota copribile in 5 anni (60 mesi)
    const totalPagadoEn5Anos = capacidadPagoMensual * 60;

    // 4) % copertura (limitata 0–100)
    const porcentajeDeudaCubiertoPlan =
      totalDeudasNoPrivilegiadas > 0 ? (totalPagadoEn5Anos / totalDeudasNoPrivilegiadas) * 100 : 100;

    // 5) Esito qualitativo (preliminare)
    let resultadoViabilidad = 'Requiere análisis profesional';
    if (ingresos < gastos + cuotaHipoteca) {
      resultadoViabilidad = 'Viabilidad difícil (ingresos insuficientes)';
    } else if (capacidadPagoMensual > 0) {
      resultadoViabilidad = 'Caso potencialmente viable para un plan de pagos';
    }

    return {
      deudaPrivilegiada,
      deudaExcedente,
      capacidadPagoMensual,
      porcentajeDeudaCubiertoPlan,
      resultadoViabilidad,
      otrasDeudas: oDeudas,
    };
  }, [states]);

  const chartData = useMemo(
    () =>
      [
        { name: 'Deuda Hipotecaria Cubierta', value: calculated.deudaPrivilegiada },
        { name: 'Deuda Hipotecaria Excedente', value: calculated.deudaExcedente },
        { name: 'Otras Deudas', value: calculated.otrasDeudas },
      ].filter((item) => item.value > 0),
    [calculated],
  );

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
    } catch {
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const { otrasDeudas, ...outputsToSave } = calculated;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const existing = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...existing].slice(0, 50)));
      alert('¡Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculated, slug, title]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">
                Simula si cumples los requisitos para acogerte a la LSO y salvar tu vivienda habitual.
              </p>
              <div className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-md p-3 mb-6">
                <strong>Atención:</strong> Esta herramienta es una simulación con fines orientativos y no constituye
                asesoramiento legal. La LSO es un proceso judicial complejo que requiere la intervención de un abogado.
              </div>

              <div className="space-y-6">
                {inputs.map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{group.group}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {group.fields.map((input) => (
                        <div key={input.id}>
                          <label
                            className="block text-sm font-medium text-gray-700 flex items-center mb-1"
                            htmlFor={input.id}
                          >
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
                              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 px-3 py-2"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              step={1}
                              value={Number(states[input.id])}
                              onChange={(e) => handleStateChange(input.id, e.target.value)}
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
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados de la Simulación</h2>
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between p-4 rounded-lg ${
                      output.id === 'resultadoViabilidad' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span
                      className={`text-xl md:text-2xl font-bold ${
                        output.id === 'resultadoViabilidad' ? 'text-indigo-600' : 'text-gray-800'
                      }`}
                    >
                      {isClient ? (
                        output.id === 'resultadoViabilidad' ? (
                          calculated.resultadoViabilidad
                        ) : output.id === 'porcentajeDeudaCubiertoPlan' ? (
                          formatPercent(calculated.porcentajeDeudaCubiertoPlan)
                        ) : (
                          formatCurrency((calculated as any)[output.id])
                        )
                      ) : (
                        '...'
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Desglose de tu Deuda Total</h2>
            <div className="h-64 w-full">{isClient ? <DynamicPieChart data={chartData} /> : null}</div>
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
            <h2 className="font-semibold mb-3 text-gray-800">Guía sobre la Ley de Segunda Oportunidad</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2022-14292"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 16/2022, de reforma de la Ley Concursal
                </a>
              </li>
              <li>
                <a
                  href="https://www.poderjudicial.es/cgpj/es/Temas/Ley-de-la-Segunda-Oportunidad/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Consejo General del Poder Judicial - LSO
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraLeySegundaOportunidad;

