'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Come si calcola la tassazione sulle plusvalenze (capital gain)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La plusvalenza si calcola come differenza tra il prezzo di vendita e il prezzo di acquisto di uno strumento finanziario. A questa plusvalenza lorda si applica un'imposta sostitutiva, che in Italia è generalmente del 26%. I costi di transazione (commissioni) possono essere dedotti."
            }
          },
          {
            "@type": "Question",
            "name": "Le minusvalenze possono ridurre le tasse sulle plusvalenze?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, le minusvalenze (capital loss) realizzate possono essere utilizzate per compensare le plusvalenze della stessa natura realizzate nello stesso anno fiscale o nei quattro anni successivi. Questo riduce la base imponibile e, di conseguenza, l'imposta dovuta."
            }
          },
          {
            "@type": "Question",
            "name": "Come si calcola il prezzo medio di carico (PMC)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "In caso di acquisti multipli dello stesso titolo a prezzi diversi, il prezzo di acquisto da utilizzare per il calcolo della plusvalenza è il 'prezzo medio di carico'. Si calcola dividendo il costo totale di acquisto (somma di quantità * prezzo per ogni acquisto) per il numero totale di quote o azioni possedute."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>');
    };
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                 if (trimmedBlock.match(/^\d\.\s/)) {
                     const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                     return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
                }
                if (trimmedBlock.startsWith('- **')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^- \*\*/, '').replace(/\*\*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i}><strong dangerouslySetInnerHTML={{__html: processInlineFormatting(item.split(':')[0] + ':')}}/> <span dangerouslySetInnerHTML={{__html: processInlineFormatting(item.split(':').slice(1).join(':'))}}/></li>)}</ul>;
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "tassazione-plusvalenze-capital-gain",
  "title": "Calcolatore Tassazione Plusvalenze (Capital Gain)",
  "lang": "it",
  "content": `### **Guida Completa al Calcolo del Capital Gain**

**Dalla Plusvalenza Lorda al Netto Realizzato, con Simulazione Minusvalenze e Guida alla Dichiarazione**

Il calcolo della tassazione sulle plusvalenze finanziarie (Capital Gain) è un passaggio cruciale per ogni investitore. Comprendere il meccanismo permette di ottimizzare il carico fiscale e pianificare con maggiore consapevolezza le proprie strategie di investimento.

Questo strumento avanzato è stato creato per offrirti una **simulazione precisa e dettagliata**, superando i limiti dei calcolatori tradizionali. Ricorda che i risultati sono una stima e **non sostituiscono una consulenza fiscale professionale**.

### **Parte 1: I Concetti Fondamentali**

#### **Cos'è la Plusvalenza (Capital Gain)?**
La plusvalenza è il **guadagno** ottenuto dalla vendita di uno strumento finanziario (azioni, ETF, obbligazioni, cripto-asset, ecc.) a un prezzo superiore a quello di acquisto. Se il prezzo di vendita è inferiore, si genera una **minusvalenza** (Capital Loss).

#### **Prezzo Medio di Carico (PMC)**
Quando si acquistano quote dello stesso strumento in momenti diversi e a prezzi diversi, non si può usare un singolo prezzo di acquisto. È necessario calcolare il **Prezzo Medio di Carico**, che rappresenta il costo medio di tutte le quote possedute.

_Esempio_: Acquisto 10 quote a 10€ e poi 10 quote a 12€. Il costo totale è (10*10€ + 10*12€) = 220€. Il PMC è 220€ / 20 quote = 11€ per quota.

#### **Aliquota Fiscale: 26%**
In Italia, la maggior parte delle plusvalenze finanziarie è soggetta a un'**imposta sostitutiva del 26%**. Esistono eccezioni, come per i titoli di Stato (tassati al 12,5%), ma questo calcolatore utilizza l'aliquota ordinaria del 26%.

### **Parte 2: La Compensazione delle Minusvalenze [Funzione Innovativa]**

Un vantaggio fiscale fondamentale è la possibilità di **compensare le plusvalenze con le minusvalenze pregresse**.

- **Regola Temporale**: Le minusvalenze realizzate possono essere usate per ridurre le plusvalenze generate nello **stesso anno fiscale** o nei **quattro anni successivi**.
- **Funzionamento**: L'importo della minusvalenza viene sottratto dalla plusvalenza, riducendo la base imponibile su cui si calcola il 26%.

Questo calcolatore ti permette di simulare questo scenario, inserendo le tue minusvalenze a disposizione nel cassetto fiscale.

### **Parte 3: Guida alla Dichiarazione dei Redditi (Regime Dichiarativo)**

Se operi in regime dichiarativo (tipico di broker esteri), hai l'obbligo di riportare le plusvalenze e le minusvalenze nella tua dichiarazione dei redditi annuale.

#### **Il Quadro RT del Modello Redditi PF**
Le plusvalenze di natura finanziaria vanno dichiarate nel **Quadro RT - Plusvalenze di natura finanziaria**. Ecco come interpretare i risultati del calcolatore per la compilazione:

- **Sezione II, Rigo RT21 - Corrispettivi**: Qui va inserito l'incasso totale dalla vendita. Il nostro calcolatore lo mostra come "Totale Corrispettivo di Vendita".
- **Sezione II, Rigo RT22 - Costi**: Qui va inserito il costo totale sostenuto per l'acquisto (calcolato usando il PMC) più le commissioni. Il nostro calcolatore lo indica come "Costo Fiscale Totale".
- **Sezione II, Rigo RT23 - Plusvalenze e Minusvalenze**: La differenza tra RT21 e RT22. Corrisponde alla nostra "Plusvalenza Lorda".
- **Sezione II, Rigo RT26 - Imposta Sostitutiva**: Qui va indicata l'imposta finale da versare, che il calcolatore mostra come "Imposta Sostitutiva Dovuta (26%)".

Questo strumento ti fornisce già i valori aggregati, semplificando enormemente la compilazione del modello.
`
};

type Acquisto = {
    id: number;
    quantita: string;
    prezzo: string;
};

export default function TassazionePlusvalenzeCapitalGain() {
    const { slug, title, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    // --- State per i lotti di acquisto ---
    const [acquisti, setAcquisti] = useState<Acquisto[]>([{ id: 1, quantita: '100', prezzo: '10' }]);
    
    // --- State per gli altri input ---
    const [vendita, setVendita] = useState({ quantita: '100', prezzo: '15' });
    const [commissioni, setCommissioni] = useState('10');
    const [minusvalenze, setMinusvalenze] = useState({ importo: '0', valide: true });
    
    const handleAcquistoChange = (id: number, field: 'quantita' | 'prezzo', value: string) => {
        setAcquisti(acquisti.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const aggiungiAcquisto = () => {
        setAcquisti([...acquisti, { id: Date.now(), quantita: '', prezzo: '' }]);
    };

    const rimuoviAcquisto = (id: number) => {
        if (acquisti.length > 1) {
            setAcquisti(acquisti.filter(a => a.id !== id));
        }
    };
    
    const handleReset = () => {
        setAcquisti([{ id: 1, quantita: '100', prezzo: '10' }]);
        setVendita({ quantita: '100', prezzo: '15' });
        setCommissioni('10');
        setMinusvalenze({ importo: '0', valide: true });
    };

    const calculatedOutputs = useMemo(() => {
        const acquistiValidi = acquisti.filter(a => parseFloat(a.quantita) > 0 && parseFloat(a.prezzo) >= 0);
        
        if (acquistiValidi.length === 0) return {};

        const costoTotaleAcquisti = acquistiValidi.reduce((sum, a) => sum + (parseFloat(a.quantita) * parseFloat(a.prezzo)), 0);
        const quantitaTotaleAcquistata = acquistiValidi.reduce((sum, a) => sum + parseFloat(a.quantita), 0);
        
        const prezzoMedioDiCarico = quantitaTotaleAcquistata > 0 ? costoTotaleAcquisti / quantitaTotaleAcquistata : 0;
        
        const qtaVenduta = parseFloat(vendita.quantita) || 0;
        const przVendita = parseFloat(vendita.prezzo) || 0;
        const comm = parseFloat(commissioni) || 0;

        const costoFiscaleDellavendita = prezzoMedioDiCarico * qtaVenduta;
        const costoFiscaleTotale = costoFiscaleDellavendita + comm;
        const corrispettivoVendita = qtaVenduta * przVendita;
        const plusvalenzaLorda = corrispettivoVendita - costoFiscaleTotale;

        const minusvalenzePregresse = minusvalenze.valide ? (parseFloat(minusvalenze.importo) || 0) : 0;
        const minusvalenzeUtilizzate = plusvalenzaLorda > 0 ? Math.min(plusvalenzaLorda, minusvalenzePregresse) : 0;

        const imponibileFiscale = plusvalenzaLorda - minusvalenzeUtilizzate;
        const impostaSostitutiva = imponibileFiscale > 0 ? imponibileFiscale * 0.26 : 0;
        
        const nettoRealizzato = corrispettivoVendita - costoFiscaleDellavendita - comm - impostaSostitutiva;

        return {
            prezzoMedioDiCarico,
            corrispettivoVendita,
            costoFiscaleTotale,
            plusvalenzaLorda,
            minusvalenzeUtilizzate,
            imponibileFiscale,
            impostaSostitutiva,
            nettoRealizzato
        };
    }, [acquisti, vendita, commissioni, minusvalenze]);
    
    const chartData = [
      { 
        name: 'Ripartizione Incasso', 
        'Netto Realizzato': Math.max(0, calculatedOutputs.nettoRealizzato || 0),
        'Costo Fiscale': Math.max(0, (calculatedOutputs.costoFiscaleTotale || 0) - (parseFloat(commissioni) || 0)),
        'Commissioni': Math.max(0, parseFloat(commissioni) || 0),
        'Imposta Dovuta': Math.max(0, calculatedOutputs.impostaSostitutiva || 0)
      },
    ];

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 5 }).format(value);

    // --- Funzioni Azioni (PDF, Salva) ---
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
            pdf.save(`${slug}_simulazione.pdf`);
        } catch (_e) { alert("Impossibile generare il PDF in questo ambiente."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: {acquisti, vendita, commissioni, minusvalenze}, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [acquisti, vendita, commissioni, minusvalenze, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula la tassazione dei tuoi investimenti, calcola il prezzo medio di carico e ottimizza il carico fiscale usando le minusvalenze.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale professionale. L'aliquota usata è quella ordinaria del 26%.
                        </div>

                        {/* --- Sezione Acquisti --- */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                                1. Dati di Acquisto (Prezzo Medio di Carico)
                                <Tooltip text="Inserisci una o più operazioni di acquisto per calcolare correttamente il costo medio. Clicca 'Aggiungi Lotto' se hai comprato lo stesso strumento in più momenti.">
                                    <span className="ml-2 cursor-help"><InfoIcon /></span>
                                </Tooltip>
                            </h3>
                            {acquisti.map((acquisto, index) => (
                                <div key={acquisto.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                                    <div className="col-span-5">
                                        <label className="block text-xs font-medium text-gray-600">Quantità</label>
                                        <input type="number" placeholder="Es. 100" value={acquisto.quantita} onChange={e => handleAcquistoChange(acquisto.id, 'quantita', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                                    </div>
                                    <div className="col-span-5">
                                        <label className="block text-xs font-medium text-gray-600">Prezzo Unitario (€)</label>
                                        <input type="number" placeholder="Es. 10.50" value={acquisto.prezzo} onChange={e => handleAcquistoChange(acquisto.id, 'prezzo', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                                    </div>
                                    <div className="col-span-2 flex items-end h-full">
                                        <button onClick={() => rimuoviAcquisto(acquisto.id)} disabled={acquisti.length <= 1} className="w-full h-[38px] text-red-600 bg-red-100 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={aggiungiAcquisto} className="mt-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800">+ Aggiungi Lotto di Acquisto</button>
                        </div>
                        
                        {/* --- Sezione Vendita e Commissioni --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg mt-4">
                           <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">2. Dati di Vendita</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" placeholder="Quantità" value={vendita.quantita} onChange={e => setVendita({...vendita, quantita: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2"/>
                                    <input type="number" placeholder="Prezzo (€)" value={vendita.prezzo} onChange={e => setVendita({...vendita, prezzo: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2"/>
                                </div>
                           </div>
                           <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                                    3. Commissioni Totali
                                    <Tooltip text="Inserisci il costo totale delle commissioni di acquisto e vendita. Questi costi sono deducibili."><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                </label>
                                <input type="number" placeholder="Es. 10" value={commissioni} onChange={e => setCommissioni(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2"/>
                           </div>
                        </div>

                         {/* --- Sezione Innovativa: Minusvalenze --- */}
                        <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg mt-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                                4. Simulatore Compensazione Minusvalenze
                                 <Tooltip text="Inserisci qui eventuali minusvalenze pregresse (perdite) che hai nel tuo 'zainetto fiscale' per vedere come abbattono la tassazione sulla plusvalenza attuale. Devono essere state generate negli ultimi 4 anni."><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Importo Minusvalenze Pregresse (€)</label>
                                    <input type="number" placeholder="0" value={minusvalenze.importo} onChange={e => setMinusvalenze({...minusvalenze, importo: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-md bg-white border mt-5">
                                    <input id="minusvalide" type="checkbox" className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500" checked={minusvalenze.valide} onChange={e => setMinusvalenze({...minusvalenze, valide: e.target.checked})} />
                                    <label htmlFor="minusvalide" className="text-sm font-medium text-gray-700">Sono state generate negli ultimi 4 anni?</label>
                                </div>
                            </div>
                        </div>


                        {/* --- Risultati --- */}
                        <div className="mt-8 space-y-3">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {[
                                {id: 'prezzoMedioDiCarico', label: 'Prezzo Medio di Carico (PMC) Unitario', value: calculatedOutputs.prezzoMedioDiCarico, note: 'Il costo medio per singola quota/azione.'},
                                {id: 'corrispettivoVendita', label: 'Totale Corrispettivo di Vendita (RT21)', value: calculatedOutputs.corrispettivoVendita, note: 'L\'incasso lordo dalla vendita.'},
                                {id: 'costoFiscaleTotale', label: 'Costo Fiscale Totale (RT22)', value: calculatedOutputs.costoFiscaleTotale, note: 'Costo d\'acquisto + commissioni.'},
                                {id: 'plusvalenzaLorda', label: 'Plusvalenza / Minusvalenza Lorda', value: calculatedOutputs.plusvalenzaLorda, note: 'Il guadagno o la perdita prima delle tasse e compensazioni.'},
                                {id: 'minusvalenzeUtilizzate', label: 'Minusvalenze Pregresse Utilizzate', value: calculatedOutputs.minusvalenzeUtilizzate, note: 'L\'importo delle perdite usate per abbattere l\'imponibile.'},
                                {id: 'imponibileFiscale', label: 'Imponibile Fiscale Netto', value: calculatedOutputs.imponibileFiscale, note: 'La base su cui viene calcolata l\'imposta.'},
                                {id: 'impostaSostitutiva', label: 'Imposta Sostitutiva Dovuta (26%)', value: calculatedOutputs.impostaSostitutiva, highlight: true, note: 'Le tasse effettive da pagare sulla plusvalenza.'},
                                {id: 'nettoRealizzato', label: 'Netto Realizzato dall\'Operazione', value: calculatedOutputs.nettoRealizzato, highlight: true, note: 'Il guadagno finale che ti rimane in tasca.'}
                            ].map(out => (
                                <div key={out.id} className={`flex flex-col md:flex-row md:items-baseline justify-between border-l-4 p-3 rounded-r-lg ${out.highlight ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">{out.label}</div>
                                        <p className="text-xs text-gray-500 md:hidden">{out.note}</p>
                                    </div>
                                    <div className="flex items-baseline gap-4">
                                       <p className="text-xs text-gray-500 hidden md:block">{out.note}</p>
                                       <div className={`text-xl font-bold ${out.highlight ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            <span>{isClient && typeof out.value === 'number' ? formatCurrency(out.value) : '...'}</span>
                                       </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Grafico */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Corrispettivo di Vendita</h3>
                            <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={chartData} stackOffset="expand">
                                            <XAxis type="number" hide tickFormatter={(tick) => `${tick * 100}%`}/>
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value, name, props) => `${(props.payload.value / (calculatedOutputs.corrispettivoVendita || 1) * 100).toFixed(2)}% (${formatCurrency(props.payload.value)})`} />
                                            <Legend formatter={(value, entry) => <span className="text-gray-700 text-sm">{value}</span>} />
                                            <Bar dataKey="Netto Realizzato" stackId="a" fill="#4f46e5" />
                                            <Bar dataKey="Costo Fiscale" stackId="a" fill="#818cf8" />
                                            <Bar dataKey="Commissioni" stackId="a" fill="#a5b4fc" />
                                            <Bar dataKey="Imposta Dovuta" stackId="a" fill="#fca5a5" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Calcolo e alla Dichiarazione</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/dichiarazioni/redditi-persone-fisiche-2024/modello-e-istruzioni-pf-2024" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Modello Redditi PF</a></li>
                             <li><a href="https://www.tesoro.it/debitopubblico/approfondimenti/fisco-imposte-titoli-di-stato.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">MEF - Tassazione Rendite Finanziarie</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
}