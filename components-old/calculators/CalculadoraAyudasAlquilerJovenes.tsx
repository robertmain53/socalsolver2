'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// ---------- Tipi ----------
type RegionKey = 'estatal' | 'madrid' | 'catalunya' | 'andalucia' | 'valencia' | 'galicia' | 'pais_vasco';

type RegionInfo = {
  name: string;
  rentLimit: number;          // límite estándar (€)
  rentLimitExtended: number;  // límite ampliado (€) para zonas/grandes ciudades
  incomeLimit: number;        // límite de ingresos brutos anuales (€)
};

type RegionalData = Record<RegionKey, RegionInfo>;

type SelectOption = { value: Exclude<RegionKey, 'estatal'>; label: string };

type InputDef =
  | {
      id: 'comunidadAutonoma';
      label: string;
      type: 'select';
      options: SelectOption[];
      tooltip?: string;
      unit?: never;
    }
  | {
      id: 'edad' | 'ingresosAnuales' | 'alquilerMensual';
      label: string;
      type: 'number';
      unit?: string;
      tooltip?: string;
    };

type OutputId = 'cumpleRequisitos' | 'ayudaMensualEstimada' | 'alquilerFinal' | 'detalles';
type OutputDef = { id: OutputId; label: string };

type CalculatorData = {
  slug: string;
  category: string;
  title: string;
  lang: 'es';
  tags: string;
  regionalData: RegionalData;
  inputs: InputDef[];
  outputs: OutputDef[];
  content: string;
  seoSchema: Record<string, any>;
};

// ---------- Icona info ----------
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
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
  slug: 'calculadora-ayudas-alquiler-jovenes',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Ayudas al Alquiler para Jóvenes',
  lang: 'es',
  tags:
    'calculadora bono alquiler joven, ayuda alquiler jovenes, bono joven alquiler, requisitos bono alquiler, ayuda 250 euros alquiler, plan estatal vivienda',
  regionalData: {
    estatal:    { name: 'Marco Estatal',           rentLimit: 600, rentLimitExtended: 900, incomeLimit: 25200 },
    madrid:     { name: 'Comunidad de Madrid',     rentLimit: 600, rentLimitExtended: 900, incomeLimit: 25200 },
    catalunya:  { name: 'Cataluña',                rentLimit: 650, rentLimitExtended: 950, incomeLimit: 24318.84 },
    andalucia:  { name: 'Andalucía',               rentLimit: 600, rentLimitExtended: 900, incomeLimit: 25200 },
    valencia:   { name: 'Comunidad Valenciana',    rentLimit: 600, rentLimitExtended: 770, incomeLimit: 25200 },
    galicia:    { name: 'Galicia',                 rentLimit: 500, rentLimitExtended: 600, incomeLimit: 25200 },
    pais_vasco: { name: 'País Vasco',              rentLimit: 750, rentLimitExtended: 800, incomeLimit: 39000 },
  },
  inputs: [
    {
      id: 'comunidadAutonoma',
      label: 'Comunidad Autónoma donde resides',
      type: 'select',
      options: [
        { value: 'madrid', label: 'Comunidad de Madrid' },
        { value: 'catalunya', label: 'Cataluña' },
        { value: 'andalucia', label: 'Andalucía' },
        { value: 'valencia', label: 'Comunidad Valenciana' },
        { value: 'galicia', label: 'Galicia' },
        { value: 'pais_vasco', label: 'País Vasco' },
      ],
      tooltip: 'Los límites de renta e ingresos varían en cada comunidad autónoma.',
    },
    { id: 'edad',             label: 'Tu edad',                 type: 'number', unit: 'años', tooltip: 'Debes tener entre 18 y 35 años (inclusive) para poder optar a la ayuda.' },
    { id: 'ingresosAnuales',  label: 'Ingresos brutos anuales',  type: 'number', unit: '€',     tooltip: 'Rendimientos del trabajo y actividades económicas (brutos anuales).' },
    { id: 'alquilerMensual',  label: 'Renta mensual del alquiler', type: 'number', unit: '€',   tooltip: 'La cantidad que pagas mensualmente por el alquiler de tu vivienda o habitación.' },
  ],
  outputs: [
    { id: 'cumpleRequisitos',       label: 'Resultado de la Simulación' },
    { id: 'ayudaMensualEstimada',   label: 'Ayuda Mensual Estimada' },
    { id: 'alquilerFinal',          label: 'Tu Alquiler Final Estimado' },
    { id: 'detalles',               label: 'Observaciones' },
  ],
  content:
    "### Introduzione: Scopri se Puoi Accedere al Bonus Affitto Giovani\n\nIl **Bono Alquiler Joven** è un aiuto di 250 € al mese destinato a facilitare l'accesso all'affitto per i giovani in Spagna. Tuttavia, i requisiti di reddito e il prezzo massimo dell'affitto per poter beneficiare del bonus **variano in ogni Comunità Autonoma**. Questa calcolatrice ti aiuta a verificare in modo rapido e semplice se soddisfi i criteri specifici della tua regione e a calcolare come questo aiuto potrebbe ridurre il costo del tuo affitto mensile.\n\n### Guida all'Uso del Calcolatore\n\nPer verificare la tua idoneità, inserisci i seguenti dati:\n\n1.  **Comunità Autonoma**: Seleziona la regione in cui risiedi. Questo è fondamentale, poiché i limiti cambiano.\n2.  **La tua Età**: Devi avere tra i 18 e i 35 anni (inclusi).\n3.  **Reddito Lordo Annuo**: Indica il tuo reddito lordo annuo. In generale, non deve superare 3 volte l'IPREM (Indicatore Pubblico di Reddito a Effetti Multipli), ma alcune comunità stabiliscono limiti diversi.\n4.  **Canone di Affitto Mensile**: L'importo che paghi per l'affitto della tua casa o stanza.\n\n### Metodologia di Calcolo Spiegata\n\nLa calcolatrice applica la logica del **Real Decreto 42/2022** che regola il Bono Alquiler Joven, adattandola ai limiti stabiliti da ogni Comunità Autonoma:\n\n1.  **Verifica dei Requisiti**: Lo strumento controlla simultaneamente i quattro criteri principali:\n    * **Età**: Che tu abbia tra 18 e 35 anni.\n    * **Limite di Reddito**: Che il tuo reddito lordo annuo sia inferiore al limite massimo della tua Comunità.\n    * **Limite del Canone di Affitto**: Che il canone che paghi non superi il massimo consentito nella tua regione.\n    * **Residenza Abituale**: Si presume che l'immobile sia la tua residenza abituale e permanente.\n2.  **Calcolo dell'Aiuto**: Se soddisfi **tutti** i requisiti, l'aiuto concesso è di **250 € al mese**.\n3.  **Risultato**: Ti mostriamo un risultato chiaro (\"Soddisfi i Requisiti\" o \"Non Soddisfi i Requisiti\") e, in caso negativo, ti specifichiamo quale o quali condizioni non soddisfi.\n\n### Analisi Approfondita: Il Bono Alquiler Joven e le Sue Particolarità\n\n#### **Le Differenze tra Comunità Autonome: La Chiave di Volta**\n\nAnche se il bonus è di 250 € a livello statale, la sua applicazione è gestita da ogni Comunità Autonoma, che ha il potere di adattare i limiti. Questo è fondamentale:\n\n* **Limiti di Affitto**: Un affitto di 700 € può essere ammissibile a Madrid ma non in Galizia. Le grandi città come Barcellona o Palma hanno limiti più alti.\n* **Limiti di Reddito**: Sebbene il limite generale sia di 3 volte l'IPREM (circa 25.200 € nel 2025), alcune comunità come la Catalogna hanno stabilito limiti basati su altri indicatori (IRSC), e i Paesi Baschi hanno i propri sistemi di aiuto con limiti di reddito molto più elevati.\n* **Convocatorie**: L'aiuto non è automatico. Ogni Comunità apre delle **convocatorie pubbliche** con un budget limitato. È fondamentale essere attenti alle date di apertura per presentare la domanda in tempo.\n\n#### **Compatibilità con Altri Aiuti**\n\nIl Bono Alquiler Joven è compatibile con altri aiuti all'affitto, come quelli previsti dal Piano Statale per l'Accesso all'Abitazione, a condizione che la somma di entrambi gli aiuti non superi il 75% del costo dell'affitto. Tuttavia, **non è compatibile** con aiuti della stessa finalità erogati dalla stessa Comunità Autonoma. È sempre consigliabile consultare le basi della convocazione specifica della tua regione.\n\n### Domande Frequenti (FAQ)\n\n**1. Cosa succede se condivido un appartamento con altre persone?**\n\nL'aiuto è individuale, non per immobile. Se condividi un appartamento, puoi richiedere il bonus per la tua parte dell'affitto. I limiti di prezzo si applicano all'intero contratto di affitto (es. 900 €), non alla tua parte individuale.\n\n**2. Devo dichiarare questo aiuto nella dichiarazione dei redditi (IRPF)?**\n\nSì. Il Bono Alquiler Joven è considerato un guadagno patrimoniale e deve essere incluso nella tua dichiarazione dei redditi annuale. A seconda del resto dei tuoi redditi, potrebbe comportare il pagamento di una parte dell'importo ricevuto in tasse.\n\n**3. Dove e quando posso richiedere il bonus?**\n\nDevi richiederlo presso l'organo competente in materia di edilizia abitativa della tua **Comunità Autonoma**. Le scadenze non sono fisse; ogni regione pubblica la propria convocazione quando dispone di budget. È fondamentale consultare regolarmente i siti web ufficiali del tuo governo regionale.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué pasa si comparto piso con otras personas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La ayuda es individual, no por vivienda. Si compartes piso, puedes solicitar el bono para tu parte del alquiler. Los límites de precio se aplican sobre el contrato de alquiler completo (ej. 900€), no sobre tu parte individual.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Tengo que declarar esta ayuda en la Renta (IRPF)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí. El Bono Alquiler Joven se considera una ganancia patrimonial y debe incluirse en tu declaración de la Renta anual.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Dónde y cuándo puedo solicitar el bono?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Debes solicitarlo en el organismo de vivienda de tu Comunidad Autónoma. Los plazos no son fijos; cada región publica su convocatoria cuando dispone de presupuesto.',
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
          <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        );
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
        return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{listItems}</ul>;
      }
      return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

// ---------- Utils ----------
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const toNumber = (raw: string | number): number => {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const normalized = raw.replace(/\./g, '').replace(',', '.'); // accetta "1.234,56"
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};
const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

// ---------- Grafico (dinamico) ----------
const DynamicBarChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data, formatCurrency }: { data: Array<{ name: string; alquiler: number; ayuda: number }>; formatCurrency: (v: number) => string }) => (
        <mod.ResponsiveContainer width="100%" height="100%">
          <mod.BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <mod.XAxis type="number" hide />
            <mod.YAxis type="category" dataKey="name" hide />
            <mod.Tooltip formatter={(value: number) => formatCurrency(value)} />
            <mod.Bar dataKey="ayuda" stackId="a" name="Ayuda Recibida" />
            <mod.Bar dataKey="alquiler" stackId="a" name="Alquiler Pagado por ti" />
          </mod.BarChart>
        </mod.ResponsiveContainer>
      );
      return ChartComponent;
    }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div> },
);

// ---------- Componente principale ----------
const CalculadoraAyudasAlquilerJovenes: React.FC = () => {
  const { slug, title, inputs, outputs, content, regionalData } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    comunidadAutonoma: 'madrid' as Exclude<RegionKey, 'estatal'>,
    edad: 27,
    ingresosAnuales: 21000,
    alquilerMensual: 800,
  };

  const [states, setStates] = useState<typeof initialStates>(initialStates);

  const handleStateChange = (id: keyof typeof initialStates, value: string) => {
    if (id === 'comunidadAutonoma') {
      setStates((p) => ({ ...p, comunidadAutonoma: value as typeof p.comunidadAutonoma }));
      return;
    }
    // normalizza numeri, range sensati
    const parsed = clamp(Math.round(toNumber(value)), 0, id === 'edad' ? 120 : 10_000_000);
    setStates((p) => ({ ...p, [id]: parsed as any }));
  };

  const handleReset = () => setStates(initialStates);

  // ---- Calcoli principali ----
  const calculatedOutputs = useMemo(() => {
    const { comunidadAutonoma, edad, ingresosAnuales, alquilerMensual } = states;
    const region = regionalData[comunidadAutonoma];

    // Requisiti principali
    const okEdad = edad >= 18 && edad <= 35;
    const okIngresos = ingresosAnuales <= region.incomeLimit; // <= per includere il limite
    // Nota: senza informazione su "zona ampliada", usiamo il limite EXTENDIDO come massimo prudenziale
    const okAlquiler = alquilerMensual <= region.rentLimitExtended;

    const cumple = okEdad && okIngresos && okAlquiler;

    // Aiuto teorico (250€/mese) ma mai superiore al canone
    const ayudaTeorica = 250;
    const ayudaMensualEstimada = cumple ? Math.min(ayudaTeorica, alquilerMensual) : 0;

    // Alquiler final non negativo
    const alquilerFinal = Math.max(0, alquilerMensual - ayudaMensualEstimada);

    let detalles = 'Todos los requisitos parecen cumplirse. ¡Podrías tener derecho a la ayuda!';
    if (!cumple) {
      const errors: string[] = [];
      if (!okEdad)     errors.push('La edad está fuera del rango (18–35 años).');
      if (!okIngresos) errors.push(`Tus ingresos (${formatCurrency(ingresosAnuales)}) superan el límite de ${region.name} (${formatCurrency(region.incomeLimit)}).`);
      if (!okAlquiler) errors.push(`Tu alquiler (${formatCurrency(alquilerMensual)}) supera el límite máximo de ${region.name} (${formatCurrency(region.rentLimitExtended)}).`);
      detalles = errors.join(' ');
    }

    return {
      cumpleRequisitos: cumple ? 'Cumples los Requisitos' : 'No Cumples los Requisitos',
      ayudaMensualEstimada,
      alquilerFinal,
      detalles,
      alquilerMensualOriginal: alquilerMensual, // per grafico
    };
  }, [states, regionalData]);

  // Dati grafico: stack = ayuda + alquilerFinal = alquiler original
  const chartData = useMemo(
    () => [{ name: 'Coste del Alquiler', alquiler: calculatedOutputs.alquilerFinal, ayuda: calculatedOutputs.ayudaMensualEstimada }],
    [calculatedOutputs],
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
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      alert('¡Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  const isOk = calculatedOutputs.cumpleRequisitos === 'Cumples los Requisitos';

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-6">Comprueba si cumples los requisitos para el Bono Alquiler Joven en tu Comunidad Autónoma.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => (
                  <div key={input.id} className="md:col-span-2">
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
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        value={states.comunidadAutonoma}
                        onChange={(e) => handleStateChange('comunidadAutonoma', e.target.value)}
                      >
                        {input.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 px-3 py-2"
                          type="number"
                          inputMode="numeric"
                          min={input.id === 'edad' ? 0 : 0}
                          max={input.id === 'edad' ? 120 : 1_000_000}
                          step={1}
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados de la Simulación</h2>
                {outputs.map((output) => {
                  const val = (calculatedOutputs as any)[output.id];
                  const isString = typeof val === 'string';
                  return (
                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${isOk ? 'bg-green-50' : 'bg-red-50'}`}>
                      <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                      <span className={`text-xl md:text-2xl font-bold ${isOk ? 'text-green-700' : 'text-red-700'}`}>
                        {isClient ? (isString ? val : formatCurrency(val)) : '...'}
                      </span>
                    </div>
                  );
                })}
                {/* Nota limiti adottati */}
                <p className="text-xs text-gray-500">
                  Nota: si adopta el <em>límite ampliado</em> de renta como referencia máxima por defecto. Algunas convocatorias pueden aplicar el límite estándar o condicionarlo a zonas específicas.
                </p>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Desglose del Alquiler Mensual</h2>
            <div className="h-24 w-full">
              {isClient && <DynamicBarChart data={chartData} formatCurrency={formatCurrency} />}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              El gráfico muestra tu alquiler original como suma de <strong>Ayuda</strong> + <strong>Alquiler pagado por ti</strong>.
            </p>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <PDFButton slug={slug} calculatorRef={calculatorRef} />
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Reiniciar</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía sobre el Bono Joven</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.boe.es/buscar/doc.php?id=BOE-A-2022-802" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Real Decreto 42/2022 (Bono Alquiler Joven)</a></li>
              <li><a href="https://www.mivau.gob.es/vivienda/bono-alquiler-joven" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ministerio de Vivienda y Agenda Urbana</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

// Botón PDF separado (evita recrear callback en cada render)
const PDFButton = ({ slug, calculatorRef }: { slug: string; calculatorRef: React.RefObject<HTMLDivElement> }) => {
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
  }, [slug, calculatorRef]);

  return (
    <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">
      Exportar PDF
    </button>
  );
};

export default CalculadoraAyudasAlquilerJovenes;
