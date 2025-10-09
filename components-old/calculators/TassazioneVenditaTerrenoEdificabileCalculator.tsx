'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Tasse Vendita Terreno Edificabile | Plusvalenza 2025",
  description: "Calcola la plusvalenza e le tasse (IRPEF o Imposta Sostitutiva 26%) sulla vendita di un terreno edificabile. Simula il vantaggio della rivalutazione."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema = () => (
  <script type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Come è tassata la plusvalenza dalla vendita di un terreno edificabile?", "acceptedAnswer": { "@type": "Answer", "text": "Puoi scegliere tra due regimi: la Tassazione Ordinaria, dove la plusvalenza si somma al tuo reddito e sconta l'IRPEF progressiva (23%-43%), oppure l'Imposta Sostitutiva, un'aliquota fissa del 26% applicata solo sulla plusvalenza, da richiedere in atto notarile." } },
          { "@type": "Question", "name": "Quando la vendita di un terreno edificabile non è tassata?", "acceptedAnswer": { "@type": "Answer", "text": "La plusvalenza generata dalla vendita di un terreno edificabile non è mai tassabile se il terreno è stato acquisito tramite successione ereditaria." } },
          { "@type": "Question", "name": "Cos'è e come funziona la rivalutazione di un terreno?", "acceptedAnswer": { "@type": "Answer", "text": "La rivalutazione è una procedura legale che permette di 'aggiornare' il valore fiscale di un terreno a quello di mercato tramite una perizia giurata, pagando un'imposta sostitutiva (es. 16%) su tale valore. Questo riduce o azzera la plusvalenza tassabile al momento della vendita." } }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock.startsWith('Criterio**')) {
                    const rows = trimmedBlock.split('\n');
                    const headers = rows[0].split('**').filter(h => h);
                    const bodyRows = rows.slice(1).map(row => row.split('**').filter(c => c));
                    return (
                         <div key={index} className="overflow-x-auto my-4 rounded-lg border">
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="bg-gray-50"><tr >{headers.map((header, hIndex) => <th key={hIndex} className="p-2 border-b text-left font-semibold text-gray-600">{header}</th>)}</tr></thead>
                                <tbody>{bodyRows.map((row, rIndex) => (<tr key={rIndex} className="odd:bg-white even:bg-gray-50/50">{row.map((cell, cIndex) => <td key={cIndex} className="p-2 border-t" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>))}</tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock) return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "tassazione-vendita-terreno-edificabile", "category": "Immobiliare e Casa", "title": "Calcolatore Tassazione Vendita Terreno Edificabile", "lang": "it",
  "inputs": [
    { "id": "prezzoVendita", "label": "Prezzo di Vendita", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il corrispettivo totale che incasserai dalla vendita del terreno, come indicato nell'atto notarile." },
    { "id": "costoAcquistoOriginario", "label": "Costo di Acquisto Originario", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il prezzo pagato al momento dell'acquisto del terreno. Se ricevuto in donazione, inserisci il valore indicato nell'atto di donazione." },
    { "id": "costiAggiuntivi", "label": "Costi Aggiuntivi Deducibili", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Somma tutti i costi documentati inerenti all'acquisto e al miglioramento: imposte pagate (registro, ipotecaria, catastale), onorario del notaio, spese di urbanizzazione, costi di mediazione." },
    { "id": "terrenoEreditato", "label": "Il terreno è stato ricevuto in eredità?", "type": "boolean" as const, "tooltip": "Seleziona questa opzione se la proprietà del terreno deriva da una successione. In questo caso, l'eventuale plusvalenza non è tassabile." },
    { "id": "haRivalutato", "label": "Hai effettuato una rivalutazione con perizia giurata?", "type": "boolean" as const, "tooltip": "Seleziona se hai usufruito delle leggi di rivalutazione per adeguare il valore fiscale del terreno pagando l'imposta sostitutiva (es. 16%)." },
    { "id": "valorePeriziato", "label": "Valore del Terreno da Perizia", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "condition": "haRivalutato == true", "tooltip": "Inserisci il valore asseverato nella perizia di stima giurata, che diventa il nuovo costo di acquisto fiscale." },
    { "id": "costoPerizia", "label": "Costo della Perizia e Imposta Sostitutiva", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "haRivalutato == true", "tooltip": "Inserisci i costi totali sostenuti per la rivalutazione: l'onorario del perito e l'imposta sostitutiva versata (es. 16% del valore periziato)." },
    { "id": "redditoAnnuoIrpef", "label": "Tuo Reddito Annuo Complessivo (IRPEF)", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il tuo reddito imponibile annuale (es. da lavoro, pensione), escludendo la plusvalenza. Serve a calcolare l'impatto della Tassazione Ordinaria." }
  ],
  "outputs": [
    { "id": "costoFiscaleRiconosciuto", "label": "Costo Fiscale Riconosciuto", "unit": "€" }, { "id": "plusvalenzaImponibile", "label": "Plusvalenza Imponibile", "unit": "€" }, { "id": "impostaSostitutiva", "label": "Tassa con Imposta Sostitutiva (26%)", "unit": "€" }, { "id": "impostaOrdinariaIrpef", "label": "Tassa con Tassazione Ordinaria (IRPEF)", "unit": "€" }, { "id": "opzioneConsigliata", "label": "Opzione più Conveniente", "unit": "" }, { "id": "risparmioFiscale", "label": "Risparmio Fiscale Stimato", "unit": "€" }, { "id": "nettoIncassato", "label": "Netto Stimato dalla Vendita", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione sulla Vendita di Terreni Edificabili**\n\n**Come Calcolare la Plusvalenza, Scegliere il Regime Fiscale e Ottimizzare le Imposte**\n\nLa vendita di un terreno edificabile genera quasi sempre una **plusvalenza**, ovvero un guadagno dato dalla differenza tra il prezzo di vendita e il costo di acquisto. Questo guadagno è considerato un \"reddito diverso\" e, come tale, è soggetto a tassazione. Comprendere come si calcola e quali opzioni fiscali esistono è fondamentale per massimizzare il netto incassato.\n\nQuesto strumento ti permette di simulare con precisione il carico fiscale, confrontare le opzioni disponibili e comprendere l'impatto strategico della rivalutazione. **Nota bene: questa guida non sostituisce la consulenza di un notaio o di un commercialista**, figure chiave in una compravendita immobiliare.\n\n### **Parte 1: Il Calcolo della Plusvalenza Imponibile**\n\nIl primo passo è determinare il guadagno tassabile. La formula è:\n\n`Plusvalenza = Prezzo di Vendita - Costo Fiscale di Acquisto`\n\nIl **Costo Fiscale di Acquisto** non è solo il prezzo pagato, ma la somma di più elementi:\n\n1.  **Prezzo di Acquisto Originario**: Il costo sostenuto per acquisire il terreno, come da atto notarile.\n2.  **Costi Aggiuntivi Deducibili**: Qualsiasi spesa **inerente** e documentata, sostenuta sia al momento dell'acquisto che successivamente. I più importanti sono:\n    * **Imposte pagate all'acquisto**: Imposta di registro, ipotecaria e catastale.\n    * **Spese Notarili**: L'onorario del notaio per l'atto di acquisto.\n    * **Costi di mediazione immobiliare** (se presenti).\n    * **Spese per rendere il terreno edificabile**: Oneri di urbanizzazione, costi per opere di miglioria, compensi a professionisti (geometri, architetti) per pratiche edilizie.\n\n### **Parte 2: Le Due Opzioni di Tassazione a Confronto**\n\nUna volta calcolata la plusvalenza, il venditore (persona fisica) ha due modi per pagare le tasse. La scelta è cruciale e va ponderata attentamente.\n\nCriterio**Tassazione Ordinaria (in dichiarazione IRPEF)**Imposta Sostitutiva (in atto notarile)\n**Come Funziona**La plusvalenza viene **sommata agli altri tuoi redditi** (lavoro, pensione, etc.) e tassata secondo gli scaglioni IRPEF.La plusvalenza viene **tassata separatamente** con un'aliquota fissa, senza fare cumulo con gli altri redditi.\n**Aliquota**Progressiva per scaglioni IRPEF: **dal 23% al 43%** (in base al reddito totale).**Fissa al 26%**.\n**Quando Conviene****Quasi mai**. Solo se sei in uno scaglione IRPEF molto basso (reddito imponibile totale, inclusa la plusvalenza, inferiore a 28.000€) o se hai minusvalenze o crediti d'imposta da compensare.**Quasi sempre**. È la scelta d'elezione se il tuo scaglione IRPEF marginale (quello in cui ricadrebbe la plusvalenza) è superiore al 26%.\n**Come si Sceglie**È il regime di default. Si applica se non si esprime una scelta diversa.La scelta va fatta **espressamente davanti al notaio** al momento della firma dell'atto di vendita.\n\n### **Parte 3: Lo Strumento Strategico: la Rivalutazione del Terreno**\n\nLa legge offre periodicamente la possibilità di \"azzerare\" la plusvalenza tassabile attraverso la **rivalutazione**. È un'opzione potentissima.\n\n* **Come Funziona**: Un tecnico abilitato (geometra, ingegnere, etc.) redige una **perizia di stima giurata** che attesta il valore di mercato del terreno a una data specifica. Il proprietario versa un'**imposta sostitutiva** (attualmente al **16%**) calcolata su questo valore periziato. \n* **Il Vantaggio Fiscale**: Una volta pagata l'imposta del 16%, il valore periziato diventa a tutti gli effetti il **nuovo costo fiscale di acquisto**. \n\n**Esempio Pratico:**\n- Costo storico: 20.000€\n- Prezzo di vendita: 150.000€\n- *Plusvalenza senza rivalutazione*: 130.000€ (Tasse ≈ 33.800€ con imposta sostitutiva al 26%)\n\n**Scenario con Rivalutazione:**\n- Si effettua una perizia che stima il valore del terreno a 140.000€.\n- Si pagano 22.400€ (il 16% di 140.000€).\n- Il nuovo costo fiscale è ora 140.000€.\n- *Plusvalenza alla vendita*: 150.000€ - 140.000€ = 10.000€ (Tasse ≈ 2.600€)\n\nIn questo caso, si sono spesi 22.400€ di imposta di rivalutazione per ottenere un risparmio fiscale di oltre 11.000€.\n\n### **Parte 4: Casi di Esenzione dalla Tassazione**\n\nLa plusvalenza sulla vendita di un terreno edificabile **NON è mai tassabile** nel seguente caso:\n\n* **Terreno Acquisito per Successione Ereditaria**: Se hai ereditato il terreno, sei sempre esente dal pagamento delle imposte sulla plusvalenza, indipendentemente dal prezzo di vendita.\n\nPer i terreni ricevuti in **donazione**, il calcolo è più complesso e si fa riferimento al costo di acquisto sostenuto dal donante."
};

const TassazioneVenditaTerrenoEdificabileCalculator: React.FC = () => {
    const { slug, title, inputs, content, outputs } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        prezzoVendita: 200000, costoAcquistoOriginario: 80000, costiAggiuntivi: 10000,
        terrenoEreditato: false, haRivalutato: false, valorePeriziato: 180000, costoPerizia: 29300,
        redditoAnnuoIrpef: 40000,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);
    
    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);
    
    const calculateIrpef = (reddito: number): number => {
        if (reddito <= 0) return 0;
        if (reddito <= 28000) return reddito * 0.23;
        if (reddito <= 50000) return 6440 + (reddito - 28000) * 0.35;
        return 14140 + (reddito - 50000) * 0.43;
    };

    const calculatedOutputs = useMemo(() => {
        const { prezzoVendita, costoAcquistoOriginario, costiAggiuntivi, terrenoEreditato, haRivalutato, valorePeriziato, costoPerizia, redditoAnnuoIrpef } = states;
        
        const costoAcquistoEffettivo = costoAcquistoOriginario + costiAggiuntivi;
        const costoFiscaleRiconosciuto = haRivalutato ? valorePeriziato + costoPerizia : costoAcquistoEffettivo;
        
        let plusvalenzaImponibile = terrenoEreditato ? 0 : prezzoVendita - costoFiscaleRiconosciuto;
        plusvalenzaImponibile = Math.max(0, plusvalenzaImponibile);

        const impostaSostitutiva = plusvalenzaImponibile * 0.26;
        
        const irpefBase = calculateIrpef(redditoAnnuoIrpef);
        const irpefTotale = calculateIrpef(redditoAnnuoIrpef + plusvalenzaImponibile);
        const impostaOrdinariaIrpef = irpefTotale - irpefBase;
        
        const risparmioFiscale = impostaOrdinariaIrpef - impostaSostitutiva;
        const opzioneConsigliata = plusvalenzaImponibile === 0 ? "Nessuna Tassa Dovuta" : (risparmioFiscale > 0 ? "Imposta Sostitutiva" : "Tassazione Ordinaria");
        const tassaMinima = Math.min(impostaSostitutiva, impostaOrdinariaIrpef);
        const nettoIncassato = prezzoVendita - tassaMinima - (haRivalutato ? costoPerizia : 0);

        return { costoFiscaleRiconosciuto, plusvalenzaImponibile, impostaSostitutiva, impostaOrdinariaIrpef, opzioneConsigliata, risparmioFiscale, nettoIncassato };
    }, [states]);

    const chartData = [
        { name: 'Imposta Sostitutiva (26%)', "Tassa da Pagare": calculatedOutputs.impostaSostitutiva },
        { name: 'Tassazione Ordinaria (IRPEF)', "Tassa da Pagare": calculatedOutputs.impostaOrdinariaIrpef },
    ];

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    
    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/80 font-sans">
                <main className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4 text-base">Calcola la plusvalenza e confronta le opzioni fiscali per la vendita del tuo terreno.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima a scopo informativo. La materia è complessa e le normative possono cambiare. Consulta sempre un notaio o un commercialista.
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                               <h2 className="text-lg font-semibold text-gray-700 border-b-2 border-indigo-500 pb-2 mb-4">Dati della Compravendita</h2>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    {inputs.slice(0, 3).map(input => (
                                         <div key={input.id}>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                            <div className="relative">
                                                <input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"/>
                                                {input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border self-center">
                                       <input id={inputs[3].id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[inputs[3].id]} onChange={(e) => handleStateChange(inputs[3].id, e.target.checked)} />
                                       <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={inputs[3].id}>{inputs[3].label}<Tooltip text={inputs[3].tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                    </div>
                               </div>
                            </div>
                             <div>
                               <h2 className="text-lg font-semibold text-gray-700 border-b-2 border-indigo-500 pb-2 mb-4">Opzioni Fiscali e Dati Personali</h2>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    <div className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border self-center">
                                       <input id={inputs[4].id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[inputs[4].id]} onChange={(e) => handleStateChange(inputs[4].id, e.target.checked)} />
                                       <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={inputs[4].id}>{inputs[4].label}<Tooltip text={inputs[4].tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                    </div>
                                    {states.haRivalutato && inputs.slice(5, 7).map(input => (
                                         <div key={input.id}>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                            <div className="relative"><input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"/>{input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}</div>
                                        </div>
                                    ))}
                                    <div className={!states.haRivalutato ? 'md:col-span-2' : ''}>
                                       <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={inputs[7].id}>{inputs[7].label}<Tooltip text={inputs[7].tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                       <div className="relative"><input id={inputs[7].id} type="number" min={inputs[7].min} step={inputs[7].step} value={states[inputs[7].id]} onChange={(e) => handleStateChange(inputs[7].id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"/>{inputs[7].unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{inputs[7].unit}</span>}</div>
                                    </div>
                               </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultato della Simulazione</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="text-sm text-gray-600">{outputs[0].label}</p>
                                    <p className="text-2xl font-bold text-gray-800">{isClient ? formatCurrency(calculatedOutputs.costoFiscaleRiconosciuto) : '...'}</p>
                                  </div>
                                  <div className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="text-sm text-gray-600">{outputs[1].label}</p>
                                    <p className="text-2xl font-bold text-gray-800">{isClient ? formatCurrency(calculatedOutputs.plusvalenzaImponibile) : '...'}</p>
                                  </div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border-2 border-dashed">
                                    <h3 className="text-lg font-semibold text-center mb-4">Confronto Tassazione</h3>
                                    <div className="h-64 w-full">
                                       {isClient && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                                    <XAxis dataKey="name" fontSize={12} />
                                                    <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} fontSize={12} />
                                                    <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                    <Bar dataKey="Tassa da Pagare">
                                                        <Cell fill="#818cf8" />
                                                        <Cell fill="#f87171" />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                       )}
                                    </div>
                                </div>

                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                  <p className="text-sm font-medium text-green-800">{outputs[4].label}: <span className="font-bold">{calculatedOutputs.opzioneConsigliata}</span></p>
                                  <p className="text-2xl font-bold text-green-700 mt-1">{isClient ? formatCurrency(calculatedOutputs.risparmioFiscale) : '...'} <span className="text-base font-medium">di Risparmio</span></p>
                                </div>
                                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                                  <p className="text-sm font-medium text-indigo-800">{outputs[6].label}</p>
                                  <p className="text-3xl font-bold text-indigo-600 mt-1">{isClient ? formatCurrency(calculatedOutputs.nettoIncassato) : '...'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                 <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-center bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="p-4 bg-white shadow-lg rounded-2xl">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Guida alla Tassazione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="p-4 bg-white shadow-lg rounded-2xl">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 917/1986 (TUIR), Art. 67-68</a> - Testo Unico delle Imposte sui Redditi.</li>
                             <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/aree-tematiche/fabbricati-e-terreni" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Fabbricati e Terreni</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneVenditaTerrenoEdificabileCalculator;