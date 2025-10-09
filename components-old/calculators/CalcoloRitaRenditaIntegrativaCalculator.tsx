'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// --- DATI DI CONFIGURAZIONE (inclusi direttamente come richiesto) ---
const calculatorData = {
  "slug": "calcolo-rita-rendita-integrativa",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore RITA (Rendita Integrativa Temporanea Anticipata)",
  "lang": "it",
  "inputs": [
    { "id": "montante_accumulato", "label": "Capitale accumulato nel fondo", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il montante totale che hai accumulato nel tuo fondo pensione e che intendi destinare alla RITA." },
    { "id": "mesi_anticipo", "label": "Mesi di anticipo richiesti", "type": "number" as const, "unit": "mesi", "min": 1, "step": 1, "tooltip": "Indica il numero di mesi che ti separano dalla data in cui maturerai il diritto alla pensione di vecchiaia (massimo 60 o 120 mesi a seconda dei requisiti)." },
    { "id": "anni_partecipazione_fondo", "label": "Anni di partecipazione al fondo", "type": "number" as const, "unit": "anni", "min": 0, "step": 1, "tooltip": "Inserisci il numero totale di anni di iscrizione a forme di previdenza complementare. Questo dato è cruciale per calcolare l'aliquota fiscale agevolata." }
  ],
  "outputs": [
    { "id": "rata_mensile_lorda", "label": "Rata Mensile Lorda", "unit": "€" },
    { "id": "imposta_mensile", "label": "Tassazione Mensile Stimata", "unit": "€" },
    { "id": "rata_mensile_netta", "label": "Rata Mensile Netta", "unit": "€" },
    { "id": "tassazione_totale", "label": "Tassazione Totale sul Periodo", "unit": "€" }
  ],
  "formulaSteps": [
    { "id": "rata_mensile_lorda", "expr": "montante_accumulato / mesi_anticipo" },
    { "id": "aliquota_fiscale_base", "expr": "15" },
    { "id": "anni_oltre_15", "expr": "Math.max(0, anni_partecipazione_fondo - 15)" },
    { "id": "riduzione_percentuale", "expr": "anni_oltre_15 * 0.30" },
    { "id": "riduzione_massima", "expr": "Math.min(riduzione_percentuale, 6)" },
    { "id": "aliquota_fiscale_effettiva_perc", "expr": "aliquota_fiscale_base - riduzione_massima" },
    { "id": "aliquota_fiscale_effettiva", "expr": "aliquota_fiscale_effettiva_perc / 100" },
    { "id": "imposta_mensile", "expr": "rata_mensile_lorda * aliquota_fiscale_effettiva" },
    { "id": "rata_mensile_netta", "expr": "rata_mensile_lorda - imposta_mensile" },
    { "id": "tassazione_totale", "expr": "imposta_mensile * mesi_anticipo" }
  ],
  "examples": [ /* ... */ ],
  "tags": "RITA, rendita integrativa temporanea anticipata, calcolo RITA, pensione integrativa, fondo pensione, tassazione RITA, previdenza complementare, anticipo pensionistico, COVIP",
  "content": "### **Guida Completa alla RITA (Rendita Integrativa Temporanea Anticipata)**\n\n**Cos'è, Come Funziona, Requisiti e Vantaggi Fiscali**\n\nLa RITA, acronimo di **Rendita Integrativa Temporanea Anticipata**, è uno strumento di previdenza complementare introdotto dalla Legge di Bilancio 2018. Permette ai lavoratori prossimi alla pensione di ricevere in anticipo, in tutto o in parte, il capitale accumulato nel proprio fondo pensione sotto forma di una rendita mensile.\n\nQuesto strumento è stato pensato per sostenere economicamente chi cessa l'attività lavorativa prima di aver maturato i requisiti per la pensione di vecchiaia, trasformando il montante accumulato in un reddito ponte fino al raggiungimento dell'età pensionabile.\n\n### **Parte 1: I Requisiti per Accedere alla RITA**\n\nPer poter richiedere la RITA, è necessario soddisfare una serie di requisiti specifici. È importante notare che esistono due percorsi alternativi per l'accesso.\n\nUn requisito comune a entrambi i percorsi è la **cessazione dell'attività lavorativa**.\n\n**Percorso A (Lavoratori prossimi alla pensione):**\n* **Distanza dalla Pensione**: Ti devono mancare **non più di 5 anni** per maturare l'età anagrafica per la pensione di vecchiaia nel regime obbligatorio di appartenenza.\n* **Contribuzione Minima**: Devi avere un requisito contributivo minimo di **almeno 20 anni** nel regime obbligatorio.\n* **Iscrizione alla Previdenza Complementare**: Devi essere iscritto a una forma di previdenza complementare da **almeno 5 anni**.\n\n**Percorso B (Disoccupati di lunga durata):**\n* **Distanza dalla Pensione**: Ti devono mancare **non più di 10 anni** per maturare l'età anagrafica per la pensione di vecchiaia.\n* **Stato di Inoccupazione**: Devi essere inoccupato da un periodo **superiore a 24 mesi** dalla cessazione del rapporto di lavoro.\n\n### **Parte 2: Come Funziona il Calcolo e la Tassazione**\n\nIl funzionamento della RITA è semplice: il capitale che decidi di destinare alla rendita viene frazionato per il numero di mesi che ti separano dalla pensione. L'aspetto più vantaggioso, tuttavia, risiede nel suo regime fiscale agevolato.\n\n#### **Il Calcolo della Rendita**\n\nLa formula base è `Rata Mensile Lorda = Montante Richiesto / Mesi di Anticipo`. Il nostro calcolatore ti aiuta a simulare questo importo partendo dal tuo capitale totale.\n\n#### **La Tassazione Agevolata: Il Vero Vantaggio**\n\nA differenza della tassazione ordinaria, la parte imponibile della RITA è soggetta a una **ritenuta a titolo d'imposta del 15%**. Questa aliquota può essere ulteriormente ridotta.\n\n* **Meccanismo di Riduzione**: Per ogni anno di partecipazione a forme di previdenza complementare successivo al quindicesimo, l'aliquota del 15% si riduce dello 0,30%.\n* **Limite Massimo**: La riduzione massima applicabile è del 6%. Questo significa che l'aliquota **minima può scendere fino al 9%**.\n\nQuesta tassazione sostitutiva dell'IRPEF rende la RITA particolarmente conveniente rispetto ad altre forme di anticipazione del capitale, che sono tassate con un'aliquota fissa del 23%.\n\n### **Parte 3: Vantaggi e Considerazioni Strategiche**\n\n#### **Vantaggi Principali**\n\n1.  **Supporto al Reddito**: Fornisce una fonte di liquidità mensile per coprire il periodo tra la fine del lavoro e l'inizio della pensione.\n2.  **Fiscalità Privilegiata**: La tassazione separata, con un'aliquota che può scendere fino al 9%, è significativamente più bassa dell'IRPEF e di altre forme di anticipo.\n3.  **Flessibilità**: Puoi decidere di destinare alla RITA solo una parte del tuo montante, lasciando il resto a maturare nel fondo per la pensione complementare futura.\n\n#### **Cosa Considerare**\n\n* **Erosione del Capitale**: Richiedere la RITA significa erodere il capitale che altrimenti sarebbe destinato alla tua pensione complementare definitiva. È una scelta che va ponderata attentamente.\n* **Nessuna Gestione Finanziaria**: A differenza del capitale che resta nel fondo, la parte erogata come RITA non beneficia più dei rendimenti della gestione finanziaria.\n\n### **Conclusione**\n\nLa RITA è un'opzione eccellente per chi necessita di un sostegno economico nell'immediato pre-pensionamento, offrendo un ponte reddituale a condizioni fiscali molto vantaggiose. Utilizza il nostro calcolatore per ottenere una stima chiara e personalizzata, ma ricorda sempre di consultare il tuo fondo pensione e un consulente previdenziale per una decisione informata e adatta alla tua situazione specifica.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Cos'è esattamente la RITA (Rendita Integrativa Temporanea Anticipata)?", "acceptedAnswer": { "@type": "Answer", "text": "La RITA è un'opzione che permette di ricevere in anticipo il capitale accumulato nel proprio fondo pensione, sotto forma di rendita mensile, per coprire il periodo che intercorre tra la cessazione del lavoro e il raggiungimento dell'età per la pensione di vecchiaia." } }, { "@type": "Question", "name": "Come viene tassata la rendita RITA?", "acceptedAnswer": { "@type": "Answer", "text": "La RITA gode di una tassazione agevolata. Si applica una ritenuta a titolo d'imposta del 15%, che può diminuire fino a un minimo del 9% in base agli anni di partecipazione al fondo pensione. Questa tassazione è sostitutiva dell'IRPEF." } }, { "@type": "Question", "name": "Posso chiedere la RITA se sto ancora lavorando?", "acceptedAnswer": { "@type": "Answer", "text": "No, uno dei requisiti fondamentali per accedere alla RITA è la cessazione dell'attività lavorativa." } }, { "@type": "Question", "name": "Cosa succede se destino solo una parte del mio capitale alla RITA?", "acceptedAnswer": { "@type": "Answer", "text": "È una scelta comune e flessibile. La parte del montante destinata alla RITA verrà erogata come rendita mensile, mentre la parte rimanente continuerà a essere gestita dal fondo pensione e a maturare rendimenti fino al momento del pensionamento, quando verrà convertita in pensione complementare o liquidata secondo le regole del fondo." } } ] }
};

// --- OTTIMIZZAZIONE SEO: Componente per Iniezione Dati Strutturati ---
const SchemaInjector: React.FC<{ schema: object }> = ({ schema }) => (
  <Head>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  </Head>
);

// --- OTTIMIZZAZIONE PERFORMANCE: Caricamento Dinamico dei Grafici ---
const DynamicPieChart = dynamic(
  () => import('recharts').then(mod => {
    const CustomPieChart = ({ data }: { data: any[] }) => (
      <mod.ResponsiveContainer width="100%" height="100%">
        <mod.PieChart>
          <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((entry, index) => (
              <mod.Cell key={`cell-${index}`} fill={entry.name === 'Rendita Netta' ? '#4f46e5' : '#ef4444'} />
            ))}
          </mod.Pie>
          <mod.Tooltip formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)} />
          <mod.Legend />
        </mod.PieChart>
      </mod.ResponsiveContainer>
    );
    return CustomPieChart;
  }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full w-full text-gray-500">Caricamento grafico...</div> }
);

// --- Componenti UI Helper ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);

// --- Componente per il Rendering del Contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        return null;
      })}
    </div>
  );
};

// --- Componente Principale del Calcolatore ---
const CalcoloRitaRenditaIntegrativaCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    montante_accumulato: 85000,
    mesi_anticipo: 48,
    anni_partecipazione_fondo: 28,
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const { montante_accumulato, mesi_anticipo, anni_partecipazione_fondo } = states;
    if (!montante_accumulato || !mesi_anticipo) return {};

    const rata_mensile_lorda = montante_accumulato / mesi_anticipo;
    const aliquota_fiscale_base = 15;
    const anni_oltre_15 = Math.max(0, anni_partecipazione_fondo - 15);
    const riduzione_percentuale = anni_oltre_15 * 0.30;
    const riduzione_massima = Math.min(riduzione_percentuale, 6);
    const aliquota_fiscale_effettiva_perc = aliquota_fiscale_base - riduzione_massima;
    const aliquota_fiscale_effettiva = aliquota_fiscale_effettiva_perc / 100;
    const imposta_mensile = rata_mensile_lorda * aliquota_fiscale_effettiva;
    const rata_mensile_netta = rata_mensile_lorda - imposta_mensile;
    const tassazione_totale = imposta_mensile * mesi_anticipo;

    return { rata_mensile_lorda, imposta_mensile, rata_mensile_netta, tassazione_totale, aliquota_fiscale_effettiva_perc };
  }, [states]);

  const chartData = useMemo(() => [
    { name: 'Rendita Netta', value: (calculatedOutputs.rata_mensile_netta || 0) * states.mesi_anticipo },
    { name: 'Tassazione', value: calculatedOutputs.tassazione_totale || 0 },
  ], [calculatedOutputs, states.mesi_anticipo]);
  
  const formulaUsata = `Tassazione = MAX(9%, 15% - (MAX(0, AnniFondo - 15) * 0.3%))`;

  const handleExportPDF = useCallback(async () => {
    if (!calcolatoreRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (error) {
      console.error("Errore esportazione PDF:", error);
      alert("Impossibile esportare in PDF. La funzione potrebbe non essere supportata dal browser.");
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const { aliquota_fiscale_effettiva_perc, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...results].slice(0, 50)));
      alert("Risultato salvato con successo!");
    } catch {
      alert("Impossibile salvare il risultato. Lo spazio di archiviazione locale potrebbe essere pieno o disabilitato.");
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);

  return (
    <>
      <SchemaInjector schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calcolatoreRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">Simula la tua rendita mensile e scopri il vantaggio fiscale di questa opzione di previdenza complementare.</p>
            
            <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima a scopo puramente informativo e non costituisce una consulenza finanziaria o previdenziale. Le condizioni e i calcoli finali dipendono dal regolamento del tuo fondo pensione.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputs.map(input => (
                <div key={input.id} className={inputs.length % 2 !== 0 && input.id === inputs[inputs.length - 1].id ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                  </label>
                  <div className="relative">
                    <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Simulazione</h2>
            <div className="space-y-4">
              {outputs.map(output => (
                <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'rata_mensile_netta' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                  <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                  <span className={`text-xl md:text-2xl font-bold ${output.id === 'rata_mensile_netta' ? 'text-indigo-600' : 'text-gray-800'}`}>
                    {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                  </span>
                </div>
              ))}
              <div className="flex items-baseline justify-between bg-gray-50 p-4 rounded-lg">
                <span className="text-sm md:text-base font-medium text-gray-700">Aliquota Fiscale Effettiva</span>
                <span className="text-xl md:text-2xl font-bold text-gray-800">
                  {isClient && calculatedOutputs.aliquota_fiscale_effettiva_perc ? `${calculatedOutputs.aliquota_fiscale_effettiva_perc.toFixed(2)}%` : '...'}
                </span>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione Totale del Capitale</h3>
              <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                <DynamicPieChart data={chartData} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700">Formula Tassazione Utilizzata</h3>
            <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={handleSaveResult} className="w-full text-sm font-medium border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full text-sm font-medium border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
              <button onClick={handleReset} className="w-full text-sm font-medium border border-red-300 text-red-700 rounded-md px-4 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
            </div>
          </section>
          
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida alla RITA</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.covip.it/per-il-cittadino/faq/le-prestazioni/la-rendita-integrativa-temporanea-anticipata-rita" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">COVIP - Commissione di Vigilanza sui Fondi Pensione</a></li>
              <li><a href="https://www.mef.gov.it/focus/La-Rendita-Integrativa-Temporanea-Anticipata-cd.-RITA/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ministero dell'Economia e delle Finanze (MEF)</a></li>
              <li>Legge 11 dicembre 2016, n. 232 (Legge di Bilancio 2017) e successive modifiche.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalcoloRitaRenditaIntegrativaCalculator;