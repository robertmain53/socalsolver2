'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// ---------- Utils ----------
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const toNumber = (raw: string | number): number => {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const normalized = raw.replace(/\./g, '').replace(',', '.'); // consente "1.234,56"
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

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

// ---------- Tipi ----------
type Calidad = 'basica' | 'estandar' | 'premium';

type CalculatorData = {
  slug: string;
  category: string;
  title: string;
  lang: 'es';
  tags: string;
  prices: {
    demoliciones: number;
    revestimientos: Record<Calidad, number>;
    bano: Record<Calidad, number>;
    cocina: Record<Calidad, number>;
    fontaneria: number;
    electricidad: number;
    carpinteriaInterior: Record<Calidad, number>;
    carpinteriaExterior: Record<Calidad, number>;
    pintura: number;
  };
  inputs: Array<
    | {
        id: 'metrosCuadrados';
        label: string;
        type: 'number';
        unit?: string;
        tooltip?: string;
        min?: number;
      }
    | {
        id: 'calidad';
        label: string;
        type: 'select';
        options: Array<{ value: Calidad; label: string }>;
        tooltip?: string;
      }
    | {
        id: 'numeroBanos' | 'numeroPuertas' | 'numeroVentanas';
        label: string;
        type: 'number';
        unit?: string;
        min?: number;
      }
  >;
  outputs: Array<
    | { id: 'costeTotal' | 'costePorM2' | 'iva' | 'costeTotalConIva'; label: string }
  >;
  breakdown: Array<
    | { id: 'demoliciones' | 'revestimientos' | 'banos' | 'cocina' | 'fontaneria' | 'electricidad' | 'carpinteriaInterior' | 'carpinteriaExterior' | 'pintura'; label: string }
  >;
  content: string;
  seoSchema: Record<string, any>;
};

// ---------- Dati Self-Contained (come nel tuo snippet) ----------
const calculatorData: CalculatorData = {
  slug: 'calculadora-coste-reforma-vivienda',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Coste de una Reforma Integral de Vivienda',
  lang: 'es',
  tags:
    'calculadora reforma integral, presupuesto reforma, coste reforma piso, precio reforma m2, reforma baño, reforma cocina, calidades reforma',
  prices: {
    demoliciones: 15,
    revestimientos: { basica: 40, estandar: 65, premium: 110 },
    bano: { basica: 3000, estandar: 4500, premium: 7000 },
    cocina: { basica: 4000, estandar: 7000, premium: 12000 },
    fontaneria: 1600,
    electricidad: 3800,
    carpinteriaInterior: { basica: 350, estandar: 500, premium: 800 },
    carpinteriaExterior: { basica: 450, estandar: 700, premium: 1200 },
    pintura: 12,
  },
  inputs: [
    {
      id: 'metrosCuadrados',
      label: 'Superficie de la vivienda',
      type: 'number',
      unit: 'm²',
      tooltip: 'Introduce los metros cuadrados totales de la vivienda a reformar.',
    },
    {
      id: 'calidad',
      label: 'Nivel de Calidad de los Acabados',
      type: 'select',
      options: [
        { value: 'basica', label: 'Básica (funcional y económica)' },
        { value: 'estandar', label: 'Estándar (buena relación calidad/precio)' },
        { value: 'premium', label: 'Premium (materiales de alta gama)' },
      ],
      tooltip: 'La elección de calidades es el factor que más influye en el presupuesto final.',
    },
    { id: 'numeroBanos', label: 'Número de baños a reformar', type: 'number', unit: 'baños', min: 0 },
    { id: 'numeroPuertas', label: 'Número de puertas interiores', type: 'number', unit: 'puertas', min: 0 },
    { id: 'numeroVentanas', label: 'Número de ventanas exteriores', type: 'number', unit: 'ventanas', min: 0 },
  ],
  outputs: [
    { id: 'costeTotal', label: 'Coste Total Estimado de la Reforma (sin IVA)' },
    { id: 'costePorM2', label: 'Coste Estimado por Metro Cuadrado' },
    { id: 'iva', label: 'IVA (10% para reforma de vivienda)' },
    { id: 'costeTotalConIva', label: 'Presupuesto Final Estimado (IVA incluido)' },
  ],
  breakdown: [
    { id: 'demoliciones', label: 'Demoliciones y Desescombro' },
    { id: 'revestimientos', label: 'Suelos y Alicatados' },
    { id: 'banos', label: 'Baño(s)' },
    { id: 'cocina', label: 'Cocina' },
    { id: 'fontaneria', label: 'Instalación de Fontanería' },
    { id: 'electricidad', label: 'Instalación Eléctrica' },
    { id: 'carpinteriaInterior', label: 'Carpintería Interior (Puertas)' },
    { id: 'carpinteriaExterior', label: 'Carpintería Exterior (Ventanas)' },
    { id: 'pintura', label: 'Pintura' },
  ],
  content: `### Introduzione: Stima il Budget per la Ristrutturazione Completa della Tua Casa

Affrontare una ristrutturazione completa è un progetto entusiasmante, ma il budget è la preoccupazione principale. Il costo finale può variare enormemente a seconda delle dimensioni, dei lavori da eseguire e, soprattutto, della **qualità dei materiali**. Questa calcolatrice ti offre una stima dettagliata e trasparente, scomponendo il costo per singole voci (cucina, bagni, pavimenti...) e permettendoti di vedere come il budget cambia in base a tre livelli di qualità: **Base, Standard e Premium**.

### Guida all'Uso del Calcolatore

Per ottenere una stima personalizzata, inserisci i dati principali del tuo progetto:

1.  **Superficie dell'Immobile**: I metri quadrati sono la base per calcolare molti dei costi (demolizioni, pavimenti, pittura).
2.  **Livello di Qualità**: Questa è la scelta più importante. **Base** per soluzioni funzionali ed economiche. **Standard** per un buon equilibrio tra qualità e prezzo (la scelta più comune). **Premium** per materiali e finiture di alta gamma.
3.  **Numero di Bagni, Porte e Finestre**: Poiché questi elementi hanno un costo unitario significativo, indicarli con precisione affina notevolmente il preventivo.

### Metodologia di Calcolo Spiegata

La nostra calcolatrice non fornisce un prezzo generico al m², ma stima il costo di ogni singola voce di lavoro, offrendo una visione chiara di dove va a finire il tuo denaro:

1.  **Stima per Voci di Lavoro**: Calcoliamo il costo di ogni fase della ristrutturazione (demolizioni, pavimenti, cucina, bagni, impianti, ecc.) in base ai metri quadrati e al livello di qualità che hai selezionato, utilizzando prezzi medi di mercato in Spagna.
2.  **Somma Totale**: Sommiamo i costi di tutte le voci per ottenere un preventivo base (imponibile).
3.  **Aggiunta dell'IVA (10%)**: Per le ristrutturazioni di abitazioni principali, si applica un'**IVA ridotta del 10%**. La nostra calcolatrice la aggiunge al totale per darti il preventivo finale, tutto compreso.

### Analisi Approfondita: Fattori Chiave in una Ristrutturazione Completa

#### **Scomposizione dei Costi: Dove Va a Finire il Tuo Denaro?**

* **Cucina e Bagni (35-45%)** …
`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Esta calculadora incluye las licencias de obra y los honorarios del arquitecto?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Esta calculadora se centra en los costes de ejecución de la obra…',
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
            dangerouslySetInnerHTML={{ __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h4
            key={index}
            className="text-lg font-semibold mt-4 mb-3 text-gray-700"
            dangerouslySetInnerHTML={{ __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
        return (
          <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
            {listItems}
          </ul>
        );
      }
      return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

// ---------- Grafico (dinamico) ----------
const DynamicPieChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const ChartComponent = ({ data }: { data: Array<{ name: string; value: number; color: string }> }) => (
        <mod.ResponsiveContainer width="100%" height="100%">
          <mod.PieChart>
            <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((entry, index) => (
                <mod.Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </mod.Pie>
            <mod.Tooltip formatter={(value: number) => formatCurrency(value)} />
            <mod.Legend />
          </mod.PieChart>
        </mod.ResponsiveContainer>
      );
      return ChartComponent;
    }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div> },
);

// ---------- Componente principale ----------
const CalculadoraCosteReformaVivienda: React.FC = () => {
  const { slug, title, inputs, outputs, content, prices, breakdown } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // Stato
  const initialStates = {
    metrosCuadrados: 90,
    calidad: 'estandar' as Calidad,
    numeroBanos: 2,
    numeroPuertas: 6,
    numeroVentanas: 5,
    reformarCocina: true,           // nuovo
    aplicarIvaReducido: true,       // nuovo (10% vs 21%)
  };
  const [states, setStates] = useState<typeof initialStates>(initialStates);

  // Gestore input: mantieni numeri come numeri
  const handleStateChange = (id: keyof typeof initialStates, value: string | number | boolean) => {
    if (id === 'calidad') {
      setStates((p) => ({ ...p, calidad: value as Calidad }));
      return;
    }
    if (typeof value === 'boolean') {
      setStates((p) => ({ ...p, [id]: value }));
      return;
    }
    // numeri
    const numeric = Math.round(toNumber(value as string));
    const bounded =
      id === 'metrosCuadrados' ? clamp(numeric, 1, 10_000) :
      id === 'numeroBanos' || id === 'numeroPuertas' || id === 'numeroVentanas' ? clamp(numeric, 0, 1_000) :
      numeric;
    setStates((p) => ({ ...p, [id]: bounded }));
  };

  const handleReset = () => setStates(initialStates);

  // Calcoli
  const calculatedOutputs = useMemo(() => {
    const m2 = Number(states.metrosCuadrados) || 0;
    const quality = states.calidad as Calidad;
    const banos = Number(states.numeroBanos) || 0;
    const puertas = Number(states.numeroPuertas) || 0;
    const ventanas = Number(states.numeroVentanas) || 0;

    const breakdownCosts = {
      demoliciones: m2 * prices.demoliciones,
      revestimientos: m2 * prices.revestimientos[quality],
      banos: banos * prices.bano[quality],
      cocina: states.reformarCocina ? prices.cocina[quality] : 0, // opzionale
      fontaneria: prices.fontaneria,
      electricidad: prices.electricidad,
      carpinteriaInterior: puertas * prices.carpinteriaInterior[quality],
      carpinteriaExterior: ventanas * prices.carpinteriaExterior[quality],
      pintura: m2 * prices.pintura,
    };

    const costeTotal = Object.values(breakdownCosts).reduce((sum, val) => sum + val, 0);
    const costePorM2 = m2 > 0 ? costeTotal / m2 : 0;

    const ivaRate = states.aplicarIvaReducido ? 0.10 : 0.21;
    const iva = costeTotal * ivaRate;
    const costeTotalConIva = costeTotal + iva;

    return { costeTotal, costePorM2, iva, costeTotalConIva, breakdown: breakdownCosts, ivaRate };
  }, [states, prices]);

  // Dati grafico
  const chartData = useMemo(() => {
    const colors = ['#0ea5e9', '#10b981', '#f97316', '#eab308', '#8b5cf6', '#d946ef', '#ef4444', '#64748b', '#65a30d'];
    return breakdown
      .map((item, index) => ({
        name: item.label,
        value: (calculatedOutputs.breakdown as any)[item.id] as number,
        color: colors[index % colors.length],
      }))
      .filter((item) => item.value > 0);
  }, [calculatedOutputs.breakdown, breakdown]);

  // Export & save
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
      const { breakdown, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      alert('¡Resultado guardado con éxito!');
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
              <p className="text-gray-600 mb-6">Obtén una estimación detallada del coste de tu reforma según superficie, calidades y partidas.</p>

              {/* Inputs principali */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map((input) => (
                  <div key={input.id} className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id}>
                      {input.label}
                      {'tooltip' in input && (input as any).tooltip ? (
                        <Tooltip text={(input as any).tooltip as string}>
                          <span className="ml-2 cursor-help"><InfoIcon /></span>
                        </Tooltip>
                      ) : null}
                    </label>

                    {input.type === 'select' ? (
                      <select
                        id={input.id}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        value={states.calidad}
                        onChange={(e) => handleStateChange('calidad', e.target.value)}
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
                          min={input.id === 'metrosCuadrados' ? 1 : (input.min ?? 0)}
                          step={1}
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id as any, e.target.value)}
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    )}
                  </div>
                ))}

                {/* Opzioni aggiunte */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={states.reformarCocina}
                      onChange={(e) => handleStateChange('reformarCocina', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">¿Reformar cocina?</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">IVA aplicado:</span>
                    <select
                      className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-2 py-1 text-sm"
                      value={states.aplicarIvaReducido ? '10' : '21'}
                      onChange={(e) => handleStateChange('aplicarIvaReducido', e.target.value === '10')}
                    >
                      <option value="10">Reducido 10%</option>
                      <option value="21">General 21%</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Output */}
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Presupuesto Estimado</h2>
                {outputs.map((output) => {
                  const val = (calculatedOutputs as any)[output.id] as number;
                  const isCostePorM2 = output.id === 'costePorM2';
                  const labelIva = output.id === 'iva'
                    ? `IVA (${Math.round(calculatedOutputs.ivaRate * 100)}% para reforma de vivienda)`
                    : output.label;

                  return (
                    <div
                      key={output.id}
                      className={`flex items-baseline justify-between p-4 rounded-lg ${
                        output.id === 'costeTotalConIva' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-sm md:text-base font-medium text-gray-700">
                        {labelIva}
                      </span>
                      <span className={`text-xl md:text-2xl font-bold ${output.id === 'costeTotalConIva' ? 'text-indigo-600' : 'text-gray-800'}`}>
                        {isClient
                          ? isCostePorM2
                            ? `${formatCurrency(val)} / m²`
                            : formatCurrency(val)
                          : '...'}
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
            <h2 className="font-semibold mb-3 text-gray-800">Desglose del Presupuesto</h2>
            <div className="h-80 w-full">
              {isClient && <DynamicPieChart data={chartData} />}
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Reiniciar</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía para tu Reforma</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-5420" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Código Técnico de la Edificación (CTE)</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley del IVA (Artículo 91)</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCosteReformaVivienda;
