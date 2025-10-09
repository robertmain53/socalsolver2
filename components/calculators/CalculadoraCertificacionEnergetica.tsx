'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// ---------- Tipi ----------
type SelectOption = { value: string; label: string };
type InputDef =
  | {
      id: 'comunidadAutonoma' | 'tipoInmueble';
      label: string;
      type: 'select';
      options: SelectOption[];
      tooltip?: string;
      unit?: never;
    }
  | {
      id: 'metrosCuadrados';
      label: string;
      type: 'number';
      unit?: string;
      tooltip?: string;
    };

type OutputDef = { id: 'honorariosTecnico' | 'tasasAdmin' | 'ivaTecnico' | 'costeTotalEstimado'; label: string };

type RegionalData = Record<
  string,
  {
    name: string;
    tax: number; // tasa administrativa fija de registro (€)
  }
>;

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

// ---------- Dati ----------
const calculatorData: CalculatorData = {
  slug: 'calculadora-certificacion-energetica',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de la Certificación Energética (costes y trámites)',
  lang: 'es',
  tags:
    'calculadora certificado energetico, precio certificado energetico, coste certificador, tasas registro certificado energetico, tramitar certificado energetico, etiqueta energetica',
  regionalData: {
    andalucia: { name: 'Andalucía', tax: 16.71 },
    catalunya: { name: 'Cataluña', tax: 11.65 },
    madrid: { name: 'Comunidad de Madrid', tax: 10 },
    valencia: { name: 'Comunidad Valenciana', tax: 10 },
    galicia: { name: 'Galicia', tax: 5 },
    pais_vasco: { name: 'País Vasco', tax: 10 },
    castilla_y_leon: { name: 'Castilla y León', tax: 29.1 },
    castilla_la_mancha: { name: 'Castilla-La Mancha', tax: 16.32 },
    canarias: { name: 'Canarias', tax: 0 },
    aragon: { name: 'Aragón', tax: 0 },
    murcia: { name: 'Murcia', tax: 23.23 },
  },
  inputs: [
    {
      id: 'comunidadAutonoma',
      label: 'Comunidad Autónoma',
      type: 'select',
      options: [
        { value: 'madrid', label: 'Comunidad de Madrid' },
        { value: 'catalunya', label: 'Cataluña' },
        { value: 'andalucia', label: 'Andalucía' },
        { value: 'valencia', label: 'Comunidad Valenciana' },
        { value: 'galicia', label: 'Galicia' },
        { value: 'pais_vasco', label: 'País Vasco' },
        { value: 'castilla_y_leon', label: 'Castilla y León' },
        { value: 'castilla_la_mancha', label: 'Castilla-La Mancha' },
        { value: 'canarias', label: 'Canarias' },
        { value: 'aragon', label: 'Aragón' },
        { value: 'murcia', label: 'Murcia' },
      ],
      tooltip: 'La tasa de registro del certificado es una competencia autonómica y varía en cada región.',
    },
    {
      id: 'tipoInmueble',
      label: 'Tipo de Inmueble',
      type: 'select',
      options: [
        { value: 'piso', label: 'Piso o Apartamento' },
        { value: 'vivienda_unifamiliar', label: 'Vivienda Unifamiliar (Chalet, Casa)' },
        { value: 'local_comercial', label: 'Local Comercial u Oficina' },
      ],
      tooltip:
        'El tipo de inmueble influye en la complejidad del trabajo del técnico y, por tanto, en sus honorarios.',
    },
    {
      id: 'metrosCuadrados',
      label: 'Superficie del inmueble',
      type: 'number',
      unit: 'm²',
      tooltip:
        'Los honorarios del técnico suelen variar en función de los metros cuadrados del inmueble.',
    },
  ],
  outputs: [
    { id: 'honorariosTecnico', label: 'Honorarios del Técnico (estimado, sin IVA)' },
    { id: 'tasasAdmin', label: 'Tasas de Registro Autonómicas' },
    { id: 'ivaTecnico', label: 'IVA (21%) sobre Honorarios' },
    { id: 'costeTotalEstimado', label: 'Coste Total Estimado' },
  ],
  content:
    "### Introduzione: Stima il Costo del Tuo Certificato Energetico\n\nIl certificato di efficienza energetica è un documento obbligatorio per vendere o affittare un immobile in Spagna. Il suo costo non è fisso, ma dipende da due componenti principali: **gli onorari del tecnico certificatore** e le **tasse di registro** della tua Comunità Autonoma. Questa calcolatrice ti offre una stima trasparente e dettagliata del costo totale, spiegando le differenze tra le varie regioni e aiutandoti a capire l'intero processo.\n\n### Guida all'Uso del Calcolatore\n\nPer ottenere una stima affidabile, hai solo bisogno di tre dati:\n\n1.  **Comunità Autonoma**: È un dato cruciale, poiché le tasse di registro del certificato sono di competenza regionale e variano notevolmente (alcune regioni non applicano alcuna tassa).\n2.  **Tipo di Immobile**: Seleziona se si tratta di un appartamento, una casa unifamiliare o un locale commerciale. Questo influisce sulla complessità del lavoro del tecnico.\n3.  **Superficie dell'Immobile**: Gli onorari del tecnico sono strettamente legati ai metri quadrati da ispezionare e calcolare.\n\n### Metodologia di Calcolo Spiegata\n\nLa nostra calcolatrice scompone il costo totale per offrirti la massima trasparenza:\n\n1.  **Stima degli Onorari del Tecnico**: Questo non è un prezzo regolamentato, ma di mercato. La nostra calcolatrice utilizza un algoritmo basato sulla superficie e sul tipo di immobile per fornirti una stima realistica di quanto potrebbe costarti l'ispezione, la raccolta dati e l'emissione del certificato da parte di un professionista qualificato (architetto, ingegnere o geometra).\n2.  **Tasse di Registro Autonomiche**: Questo è un costo fisso stabilito da ogni Comunità Autonoma per registrare il certificato nel suo registro ufficiale. La calcolatrice include le tasse aggiornate per le principali regioni.\n3.  **IVA (21%)**: L'IVA si applica solo sugli onorari del tecnico. Le tasse amministrative sono esenti da IVA.\n4.  **Costo Totale Stimato**: `Onorari del Tecnico + Tasse di Registro + IVA (sugli onorari)`.\n\n### Analisi Approfondita: Il Certificato Energetico in Dettaglio\n\n#### **Cos'è l'Etichetta Energetica e Come si Interpreta?**\n\nIl risultato del certificato è un'**etichetta energetica**, simile a quella degli elettrodomestici. Classifica l'immobile su una scala che va dalla **A (più efficiente)** alla **G (meno efficiente)**. L'etichetta fornisce informazioni su due indicatori chiave:\n\n* **Consumo di energia primaria non rinnovabile (kWh/m² anno)**: Misura l'energia necessaria per soddisfare la domanda energetica dell'edificio in condizioni normali (riscaldamento, raffreddamento, acqua calda).\n* **Emissioni di CO2 (kgCO2/m² anno)**: Indica l'impatto ambientale dell'immobile.\n\nUn immobile con una buona classificazione (es. A, B o C) non solo è più ecologico, ma ha anche bollette energetiche più basse, il che lo rende più attraente per acquirenti e inquilini.\n\n#### **Il Processo Passo a Passo per Ottenere il Certificato**\n\nIl processo è relativamente semplice e si articola in quattro fasi:\n\n1.  **Contattare un Tecnico Certificatore**: Cerca un professionista qualificato (architetto, ingegnere, geometra) nella tua zona.\n2.  **Ispezione dell'Immobile**: Il tecnico visiterà la tua casa per raccogliere dati: misurazioni, orientamento, qualità di finestre e muri, impianti di riscaldamento e raffreddamento, ecc.\n3.  **Calcolo e Emissione**: Con i dati raccolti, il tecnico utilizzerà un software ufficiale per calcolare la classe energetica ed emettere il certificato.\n4.  **Registro Autonomico**: Il tecnico (o tu stesso, a seconda del servizio contrattato) registrerà il certificato presso l'ente competente della tua Comunità Autonoma. Una volta registrato e pagate le tasse, otterrai l'etichetta ufficiale.\n\n### Domande Frequenti (FAQ)\n\n**1. Cuando es obligatorio tener el certificado energético?**\n\nEs obligatorio para **vender** cualquier inmueble o para **alquilarlo por un periodo superior a cuatro meses**. Debes tener el certificado válido y registrado antes de publicitar el inmueble, ya que la etiqueta energética debe aparecer en los anuncios inmobiliarios.\n\n**2. Cuánto dura un certificado energético?**\n\nEl certificado energético tiene una validez de **10 años**. Sin embargo, si el inmueble obtiene una calificación G (la más baja), la validez se reduce a **5 años**. Si realizas una reforma importante que mejore la eficiencia energética, es recomendable renovarlo para reflejar la nueva y mejor calificación.\n\n**3. Qué pasa si vendo o alquilo sin el certificado?**\n\nVender o alquilar un inmueble sin un certificado energético válido se considera una infracción y puede acarrear sanciones económicas. Las multas varían según la gravedad, pero pueden ir desde los 300€ hasta los 6.000€.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuándo es obligatorio tener el certificado energético?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Es obligatorio para vender cualquier inmueble o para alquilarlo por un periodo superior a cuatro meses. Debes tener el certificado válido y registrado antes de publicitar el inmueble, ya que la etiqueta energética debe aparecer en los anuncios inmobiliarios.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto dura un certificado energético?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El certificado energético tiene una validez de 10 años. Sin embargo, si el inmueble obtiene una calificación G (la más baja), la validez se reduce a 5 años. Si realizas una reforma importante que mejore la eficiencia energética, es recomendable renovarlo para reflejar la nueva y mejor calificación.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué pasa si vendo o alquilo sin el certificado?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vender o alquilar un inmueble sin un certificado energético válido se considera una infracción y puede acarrear sanciones económicas. Las multas varían según la gravedad, pero pueden ir desde los 300€ hasta los 6.000€.',
        },
      },
    ],
  },
};

// ---------- SEO Schema in-page ----------
const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
);

// ---------- Renderer contenuti semplici ----------
const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () =>
    content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h3
            key={index}
            className="text-xl font-bold mt-6 mb-4 text-gray-800"
            dangerouslySetInnerHTML={{
              __html: paragraph.replace(/^###\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
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
              __html: paragraph.replace(/^####\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        );
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li
            key={i}
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: item.replace(/^\*\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
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

// ---------- Import dinamico grafico ----------
const DynamicPieChart = dynamic(() => import('recharts').then((mod) => {
  const ChartComponent = ({ data }: { data: { name: string; value: number }[] }) => {
    const COLORS = ['#3b82f6', '#8b5cf6', '#d946ef'];
    return (
      <mod.ResponsiveContainer width="100%" height="100%">
        <mod.PieChart>
          <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
            {data.map((entry, index) => (
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
}), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div>,
});

// ---------- Componente principale ----------
const CalculadoraCertificacionEnergetica: React.FC = () => {
  const { slug, title, inputs, outputs, content, regionalData } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Valori iniziali
  const initialStates = {
    comunidadAutonoma: 'madrid',
    tipoInmueble: 'piso',
    metrosCuadrados: 90,
  } as const;

  const [states, setStates] = useState<Record<string, string | number>>({ ...initialStates });

  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

  const handleStateChange = (id: string, value: string) => {
    if (id === 'metrosCuadrados') {
      // Normalizzazione: numerico, intero, range realistico 20–1000 m²
      const parsed = Number(value.replace(',', '.'));
      const clean = Number.isFinite(parsed) ? Math.round(parsed) : 0;
      const bounded = clamp(clean, 20, 1000);
      setStates((prev) => ({ ...prev, [id]: bounded }));
      return;
    }
    setStates((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => setStates({ ...initialStates });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  // Calcoli
  const calculatedOutputs = useMemo(() => {
    const m2 = Number(states.metrosCuadrados) || 0;
    const regionKey = String(states.comunidadAutonoma) as keyof typeof regionalData;
    const regionInfo = regionalData[regionKey];
    const tipo = String(states.tipoInmueble);

    // Stima onorari: base per tipologia + componente logaritmica sulla metratura
    let baseFee = 50; // piso
    if (tipo === 'vivienda_unifamiliar') baseFee = 80;
    if (tipo === 'local_comercial') baseFee = 90;

    const extraFee = Math.log(Math.max(1, m2 / 40)) * 40; // crescita smorzata
    const honorariosTecnico = Math.max(0, baseFee + extraFee);

    const tasasAdmin = regionInfo?.tax ?? 0; // tassa fissa regionale (€)
    const ivaTecnico = honorariosTecnico * 0.21; // IVA solo sugli onorari
    const costeTotalEstimado = honorariosTecnico + tasasAdmin + ivaTecnico;

    return { honorariosTecnico, tasasAdmin, ivaTecnico, costeTotalEstimado };
  }, [states, regionalData]);

  const chartData = useMemo(
    () =>
      [
        { name: 'Honorarios Técnico', value: calculatedOutputs.honorariosTecnico },
        { name: 'Tasas Registro', value: calculatedOutputs.tasasAdmin },
        { name: 'IVA (21%)', value: calculatedOutputs.ivaTecnico },
      ].filter((item) => item.value > 0),
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

  const currentRegion = String(states.comunidadAutonoma) as keyof typeof regionalData;
  const regionInfo = regionalData[currentRegion];

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-6">
                Obtén una estimación detallada del coste total de tu certificado, incluyendo honorarios y tasas oficiales.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => (
                  <div key={input.id} className="md:col-span-2">
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

                    {input.type === 'select' ? (
                      <select
                        id={input.id}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        value={String(states[input.id])}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                      >
                        {input.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
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
                          min={20}
                          max={1000}
                          step={1}
                          value={Number(states[input.id])}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Nota regione/tassa */}
              <div className="mt-3 text-xs text-gray-600">
                {regionInfo ? (
                  <span>
                    Tasa de registro en <strong>{regionInfo.name}</strong>: {isClient ? formatCurrency(regionInfo.tax) : '...'}
                  </span>
                ) : (
                  <span>Selecciona una comunidad autónoma para ver su tasa de registro.</span>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Desglose de Costes Estimados</h2>
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between p-4 rounded-lg ${
                      output.id === 'costeTotalEstimado' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span
                      className={`text-xl md:text-2xl font-bold ${
                        output.id === 'costeTotalEstimado' ? 'text-indigo-600' : 'text-gray-800'
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
            <h2 className="font-semibold mb-3 text-gray-800">Desglose del Coste Total</h2>
            <div className="h-64 w-full">
              {isClient && calculatedOutputs.costeTotalEstimado > 0 ? (
                <DynamicPieChart data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  Introduce los datos para ver el desglose.
                </div>
              )}
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
            <h2 className="font-semibold mb-3 text-gray-800">Guía sobre el Certificado</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.idae.es/informacion-y-ayudas/certificacion-de-eficiencia-energetica"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Instituto para la Diversificación y Ahorro de la Energía (IDAE)
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2013-5946"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Real Decreto 235/2013 (regulación del certificado)
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCertificacionEnergetica;
