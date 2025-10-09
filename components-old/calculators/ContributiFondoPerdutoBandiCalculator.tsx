'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
// Le importazioni statiche ora includono solo i componenti usati come "children" del grafico
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';

// --- TIPI PER I DATI ---
type Input = { id: string; label: string; type: 'number'; unit?: string; min?: number; max?: number; step?: number; tooltip?: string; };
type Output = { id: string; label: string; unit?: string; };
type SeoSchema = { '@context': string; '@type': string; mainEntity: any[]; };

// --- DATI DI CONFIGURAZIONE DEL CALCOLATORE ---
const calculatorData: {
  slug: string; category: string; title: string; lang: string;
  inputs: Input[]; outputs: Output[]; formulaSteps: any[];
  examples: { inputs: { [key: string]: number } }[];
  tags: string; content: string; seoSchema: SeoSchema;
} = {
  "slug": "contributi-fondo-perduto-bandi",
  "category": "PMI e Impresa",
  "title": "Calcolatore Contributi a Fondo Perduto (per bandi specifici)",
  "lang": "it",
  "inputs": [
    { "id": "costo_progetto", "label": "Costo Totale del Progetto (Spese Ammissibili)", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci l'importo totale delle spese considerate ammissibili dal bando specifico (es. acquisto macchinari, software, consulenze). L'IVA è generalmente esclusa." },
    { "id": "percentuale_copertura", "label": "Percentuale di Copertura a Fondo Perduto", "type": "number", "unit": "%", "min": 0, "max": 100, "step": 5, "tooltip": "Indica la percentuale di aiuto (intensità di aiuto) prevista dal bando. Ad esempio, per un contributo del 50%, inserire '50'." },
    { "id": "massimale_contributo", "label": "Massimale di Contributo Erogabile", "type": "number", "unit": "€", "min": 0, "step": 5000, "tooltip": "Inserisci l'importo massimo del contributo che il bando può erogare, indipendentemente dal costo del progetto. Se non specificato, lascia un valore molto alto." },
    { "id": "de_minimis_residuo", "label": "Plafond 'de minimis' Residuo", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Indica l'importo di aiuti 'de minimis' che la tua impresa può ancora ricevere. Dal 1° gennaio 2024, il limite è 300.000 € su tre esercizi finanziari. Verifica il tuo residuo sul Registro Nazionale Aiuti di Stato (RNA)." }
  ],
  "outputs": [
    { "id": "contributo_potenziale_lordo", "label": "Contributo Lordo (calcolato su spese e %)", "unit": "€" },
    { "id": "contributo_effettivo", "label": "Contributo Effettivo Ottenibile", "unit": "€" },
    { "id": "quota_autofinanziamento", "label": "Quota di Autofinanziamento Richiesta", "unit": "€" }
  ],
  "formulaSteps": [
    { "id": "contributo_potenziale_lordo", "expr": "costo_progetto * (percentuale_copertura / 100)" },
    { "id": "contributo_limitato_da_massimale", "expr": "Math.min(contributo_potenziale_lordo, massimale_contributo)" },
    { "id": "contributo_effettivo", "expr": "Math.min(contributo_limitato_da_massimale, de_minimis_residuo)" },
    { "id": "quota_autofinanziamento", "expr": "costo_progetto - contributo_effettivo" }
  ],
  "examples": [
    { "inputs": { "costo_progetto": 150000, "percentuale_copertura": 50, "massimale_contributo": 80000, "de_minimis_residuo": 250000 } }
  ],
  "tags": "calcolatore contributi fondo perduto, finanziamenti a fondo perduto, bandi pmi, agevolazioni imprese, de minimis, calcolo contributo, incentivi statali, fondi europei, bando invitalia, registro nazionale aiuti di stato",
  "content": "### **Guida Strategica ai Contributi a Fondo Perduto**\n\n**Come Simulare, Comprendere e Ottenere le Agevolazioni per la Tua Impresa**\n\nI contributi a fondo perduto rappresentano una delle opportunità più preziose per le PMI che desiderano investire, innovare e crescere. Si tratta di sovvenzioni pubbliche, erogate da enti statali, regionali o europei, che non richiedono restituzione. Tuttavia, ogni bando ha regole precise e la comprensione di meccanismi come il regime 'de minimis' è fondamentale per il successo.\n\nQuesto calcolatore è uno strumento di simulazione progettato per aiutarti a stimare il potenziale contributo ottenibile da un bando specifico, inserendo i parametri chiave che ne regolano il funzionamento.\n\n### **Parte 1: I Parametri del Calcolatore Spiegati**\n\nPer usare questo simulatore, è essenziale aver letto attentamente il bando di tuo interesse ed estrapolare i seguenti dati:\n\n* **Costo Totale del Progetto (Spese Ammissibili)**: Non tutte le spese sono finanziabili. Ogni bando elenca in modo tassativo le categorie di costo ammissibili (es. macchinari, licenze software, opere murarie, consulenze strategiche). L'IVA, salvo eccezioni, non è mai una spesa ammissibile.\n* **Percentuale di Copertura**: Chiamata anche 'intensità di aiuto', è la percentuale delle spese ammissibili che il contributo andrà a coprire. Può variare in base alla dimensione dell'impresa o alla sua localizzazione geografica.\n* **Massimale di Contributo**: È il tetto massimo dell'agevolazione. Anche se il calcolo percentuale desse un risultato superiore, il contributo non potrà mai eccedere questo importo.\n* **Plafond 'de minimis' Residuo**: Questo è un parametro cruciale per la quasi totalità dei bandi. Ogni impresa ha un 'tesoretto' di aiuti di stato che può ricevere senza violare le norme sulla concorrenza. È fondamentale conoscerlo prima di partecipare.\n\n### **Parte 2: Il Regime 'de minimis' - Una Regola da Conoscere (E-E-A-T)**\n\nIl regime 'de minimis' è una regola stabilita dall'Unione Europea per semplificare l'erogazione di aiuti di stato di piccola entità, presumendo che non falsino la concorrenza sul mercato unico. La comprensione di questa regola è un chiaro segnale di competenza e autorevolezza.\n\n**Cosa è cambiato dal 2024?**\n\nCon il nuovo regolamento UE 2023/2831, in vigore dal **1° gennaio 2024**, il massimale degli aiuti 'de minimis' che un'impresa unica può ricevere è stato **innalzato da 200.000 € a 300.000 €** nell'arco di tre esercizi finanziari.\n\n* **Impresa Unica**: Include tutte le imprese controllate (di diritto o di fatto) dalla stessa entità. Se fai parte di un gruppo, il plafond è condiviso.\n* **Periodo di Riferimento**: È 'mobile'. Si considerano l'esercizio finanziario in corso al momento della concessione dell'aiuto e i due esercizi precedenti.\n\n**Come Verificare il Tuo Plafond Residuo?**\n\nL'unico modo autorevole per verificare gli aiuti già ricevuti e calcolare il proprio plafond residuo è consultare la propria visura sul **Registro Nazionale degli Aiuti di Stato (RNA)**. È un'operazione che il tuo commercialista può fare in pochi minuti.\n\n### **Parte 3: Guida Pratica alla Partecipazione a un Bando**\n\n1.  **Monitoraggio e Selezione**: Tieni monitorate le fonti ufficiali (Invitalia, siti delle Regioni, Camere di Commercio) per individuare i bandi più adatti al tuo progetto.\n2.  **Lettura Analitica del Bando**: Leggi ogni singola pagina del testo del bando, prestando attenzione ai requisiti soggettivi (chi può partecipare), oggettivi (cosa finanzia) e alle scadenze.\n3.  **Preparazione della Documentazione**: Generalmente sono richiesti un business plan dettagliato, preventivi per le spese da sostenere e la documentazione aziendale (visura camerale, bilanci).\n4.  **Invio della Domanda**: Le domande vengono quasi sempre presentate tramite portali telematici. Assicurati di avere le credenziali necessarie (SPID, CNS) e di rispettare le procedure.\n\n### **Conclusione: Da Simulazione a Strategia**\n\nQuesto calcolatore è il punto di partenza per trasformare un'idea progettuale in una richiesta di contributo consapevole. Usalo per simulare diversi scenari e per capire l'impatto finanziario di un'agevolazione. Ricorda sempre che il testo ufficiale del bando è l'unica fonte che fa fede e, per progetti complessi, l'affiancamento di un consulente specializzato può fare la differenza.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Cosa sono i contributi a fondo perduto?", "acceptedAnswer": { "@type": "Answer", "text": "I contributi a fondo perduto sono erogazioni finanziarie da parte di un ente pubblico (Stato, Regione, UE) a favore di imprese o altri soggetti, che non prevedono l'obbligo di restituzione del capitale ricevuto. Sono concessi per incentivare specifici tipi di investimenti, come l'innovazione tecnologica, la transizione ecologica o lo sviluppo di nuove attività." } }, { "@type": "Question", "name": "Cos'è il nuovo regime 'de minimis' 2024?", "acceptedAnswer": { "@type": "Answer", "text": "Dal 1° gennaio 2024 è in vigore il nuovo regolamento 'de minimis' (UE 2023/2831) che ha elevato il massimale di aiuti di stato che un'impresa può ricevere senza notifica alla Commissione Europea. Il limite è passato da 200.000 € a 300.000 € nell'arco di tre esercizi finanziari. È fondamentale verificare il proprio plafond residuo prima di richiedere un nuovo aiuto." } }, { "@type": "Question", "name": "Tutte le spese di un progetto sono ammissibili per un contributo?", "acceptedAnswer": { "@type": "Answer", "text": "No. Ogni bando definisce in modo dettagliato le categorie di 'spese ammissibili'. Tipicamente includono l'acquisto di beni strumentali nuovi (macchinari, attrezzature), software, brevetti, licenze e consulenze specialistiche. Spese come l'IVA, i costi di funzionamento ordinario (es. utenze, stipendi del personale non dedicato al progetto) sono quasi sempre escluse." } }, { "@type": "Question", "name": "Dove posso trovare i bandi per i contributi a fondo perduto?", "acceptedAnswer": { "@type": "Answer", "text": "Le fonti più autorevoli per trovare bandi attivi sono i siti istituzionali come Invitalia (l'agenzia nazionale per lo sviluppo d'impresa), i portali della propria Regione, i siti delle Camere di Commercio e il portale nazionale 'Incentivi.gov.it'. Esistono anche piattaforme private che aggregano e notificano le nuove opportunità." } } ] }
};

// --- COMPONENTI HELPER ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const SchemaInjector = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
        {blocks.map((block, index) => {
            const trimmedBlock = block.trim();
            if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
            if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
            if (trimmedBlock.startsWith('*')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
            if (trimmedBlock.match(/^\d\.\s/)) return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />)}</ol>;
            if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
            return null;
        })}
        </div>
    );
};

// --- OTTIMIZZAZIONE PERFORMANCE: Caricamento Dinamico Grafico (FIXED) ---
const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart), // Corretto: fa riferimento al nome di esportazione 'BarChart'
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500">Caricamento grafico...</div> }
);

// --- COMPONENTE PRINCIPALE ---
const ContributiFondoPerdutoBandiCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content, examples, seoSchema } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [states, setStates] = useState(examples[0].inputs);

  useEffect(() => { setIsClient(true); }, []);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => setStates(examples[0].inputs);

  const calculatedOutputs = useMemo(() => {
    const { costo_progetto, percentuale_copertura, massimale_contributo, de_minimis_residuo } = states;
    const contributo_potenziale_lordo = costo_progetto * (percentuale_copertura / 100);
    const contributo_limitato_da_massimale = Math.min(contributo_potenziale_lordo, massimale_contributo);
    const contributo_effettivo = Math.min(contributo_limitato_da_massimale, de_minimis_residuo);
    const quota_autofinanziamento = costo_progetto - contributo_effettivo;
    
    return { contributo_potenziale_lordo, contributo_effettivo, quota_autofinanziamento };
  }, [states]);
  
  const chartData = [
      { 
        name: 'Piano Finanziario', 
        'Contributo Ottenibile': calculatedOutputs.contributo_effettivo, 
        'Autofinanziamento': calculatedOutputs.quota_autofinanziamento,
        'total': states.costo_progetto
      }
  ];

  const formulaUsata = `Contributo = MIN( (Costo Progetto * %), Massimale, De Minimis Residuo )`;

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calcolatoreRef.current) return;
      const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) { alert("Errore durante l'esportazione in PDF."); console.error(e); }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
      alert("Risultato salvato con successo!");
    } catch { alert("Impossibile salvare il risultato."); }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

  return (
    <>
      <SchemaInjector schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-4">Simula il potenziale contributo per la tua impresa in base ai parametri del bando.</p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo è un simulatore. L'unico testo che fa fede per l'ottenimento di un contributo è quello ufficiale del bando di riferimento.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                  </label>
                  <div className="relative">
                    <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2 text-right" type="number" min={input.min} max={input.max} step={input.step} value={states[input.id as keyof typeof states]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
              {outputs.map((output) => (
                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'contributo_effettivo' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                  <div className={`text-xl md:text-2xl font-bold ${output.id === 'contributo_effettivo' ? 'text-indigo-600' : 'text-gray-800'}`}>
                    <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                  </div>
                </div>
              ))}
            </div>

             <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione Finanziaria del Progetto</h3>
                <div className="h-48 w-full bg-gray-50 p-2 rounded-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <DynamicBarChart data={chartData} layout="vertical" stackOffset="expand">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" hide />
                      <ChartTooltip formatter={(value, name, props) => `${((props.payload[name] / props.payload.total) * 100).toFixed(2)}% (${formatCurrency(props.payload[name])})`} />
                      <Bar dataKey="Contributo Ottenibile" stackId="a" fill="#4f46e5" />
                      <Bar dataKey="Autofinanziamento" stackId="a" fill="#a5b4fc" />
                    </DynamicBarChart>
                  </ResponsiveContainer>
                </div>
             </div>

            <div className="mt-6 border rounded-lg shadow-sm p-4 bg-slate-50">
                <h3 className="font-semibold text-gray-700">Logica di Calcolo Applicata</h3>
                <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-200 rounded font-mono break-words">{formulaUsata}</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={salvaRisultato} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Simulazione</button>
              <button onClick={handleExportPDF} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
              <button onClick={handleReset} className="w-full text-sm font-medium border border-red-200 rounded-md px-3 py-2 text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Dati</button>
            </div>
          </section>
          
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Guida Strategica ai Bandi</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Fonti e Riferimenti Autorevoli</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.rna.gov.it/sites/RNA/it_IT/home" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Registro Nazionale Aiuti di Stato (RNA)</a></li>
              <li><a href="https://www.invitalia.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Invitalia - Agenzia nazionale per lo sviluppo</a></li>
              <li><a href="https://competition-policy.ec.europa.eu/state-aid/legislation/de-minimis-regulation_it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Commissione Europea - Normativa 'de minimis'</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default ContributiFondoPerdutoBandiCalculator;