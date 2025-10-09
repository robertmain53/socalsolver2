
'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
                        "name": "Come si calcolano IRES e IRAP per una SRL?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "L'IRES si calcola applicando un'aliquota del 24% sull'utile fiscale della società (ricavi meno tutti i costi deducibili). L'IRAP si calcola applicando un'aliquota standard del 3.9% sul Valore della Produzione Netta, una base imponibile diversa che esclude, tra le altre cose, il costo del personale e gli oneri finanziari."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Le SRL Semplificate (SRLS) pagano meno tasse?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, a livello di imposte sul reddito (IRES) e regionali (IRAP), non c'è alcuna differenza tra una SRL ordinaria e una SRL Semplificata. Il regime fiscale e le aliquote sono identici."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Qual è la differenza principale tra la base imponibile IRES e quella IRAP?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "La differenza cruciale è che la base imponibile IRES considera deducibili quasi tutti i costi aziendali, inclusi personale, ammortamenti e interessi. La base imponibile IRAP, invece, è calcolata sottraendo dai ricavi solo i costi operativi della produzione, escludendo quindi come regola generale il costo del personale e gli oneri finanziari."
                        }
                    }
                ]
            })
        }}
    />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                 if (trimmedBlock.match(/^\d\.\s/)) {
                     const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                     return (
                        <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ol>
                     );
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// Dati di configurazione del calcolatore (incollati dal file JSON)
const calculatorData = {
  "slug": "calcolo-ires-irap-srl-srls",
  "category": "PMI e Impresa",
  "title": "Calcolatore IRES e IRAP per SRL e SRLS",
  "lang": "it",
  "inputs": [
    { "id": "fatturato_annuo", "label": "Fatturato Annuo (Ricavi)", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserire il totale dei ricavi derivanti dalla vendita di beni e dalla prestazione di servizi, al netto dell'IVA." },
    { "id": "costi_operativi", "label": "Costi Operativi della Produzione", "type": "number", "unit": "€", "min": 0, "step": 500, "tooltip": "Includere tutti i costi sostenuti per l'attività (es. materie prime, servizi, affitti, utenze). Escludere il costo del personale, gli ammortamenti e gli interessi passivi, da inserire nei campi appositi." },
    { "id": "costo_personale", "label": "Costo Totale del Personale", "type": "number", "unit": "€", "min": 0, "step": 500, "tooltip": "Inserire il costo complessivo sostenuto dall'azienda per i dipendenti (salari, stipendi, contributi previdenziali, TFR, etc.)." },
    { "id": "ammortamenti", "label": "Ammortamenti Deducibili", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Quota annua di ammortamento per i beni strumentali (macchinari, attrezzature, etc.) deducibile ai fini IRES." },
    { "id": "interessi_passivi", "label": "Interessi Passivi e Oneri Finanziari", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Inserire gli interessi passivi su finanziamenti e prestiti. La loro deducibilità ai fini IRES è soggetta a limiti (ROL), ma questo calcolatore li considera interamente deducibili per semplicità." },
    { "id": "perdite_pregresse_utilizzabili", "label": "Perdite Fiscali Pregresse Utilizzabili", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Importo delle perdite fiscali accumulate negli esercizi precedenti che possono essere utilizzate per ridurre il reddito imponibile IRES di quest'anno." },
    { "id": "numero_dipendenti_indeterminati", "label": "Numero Dipendenti a Tempo Indeterminato", "type": "number", "unit": "n°", "min": 0, "step": 1, "tooltip": "Numero di lavoratori assunti con contratto a tempo indeterminato. Questo dato è fondamentale per il calcolo delle deduzioni IRAP." },
    { "id": "acconto_ires_versato", "label": "Acconto IRES già versato", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Importo degli acconti IRES pagati durante l'anno fiscale di riferimento." },
    { "id": "acconto_irap_versato", "label": "Acconto IRAP già versato", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Importo degli acconti IRAP pagati durante l'anno fiscale di riferimento." }
  ],
  "outputs": [
    { "id": "utile_lordo_bilancio", "label": "Utile Lordo di Bilancio (Ante Imposte)", "unit": "€" },
    { "id": "base_imponibile_ires", "label": "Base Imponibile IRES", "unit": "€" },
    { "id": "ires_dovuta", "label": "IRES Dovuta (24%)", "unit": "€" },
    { "id": "base_imponibile_irap", "label": "Base Imponibile IRAP", "unit": "€" },
    { "id": "irap_dovuta", "label": "IRAP Dovuta (aliquota standard 3.9%)", "unit": "€" },
    { "id": "totale_imposte", "label": "Totale Imposte (IRES + IRAP)", "unit": "€" },
    { "id": "utile_netto", "label": "Utile Netto d'Esercizio", "unit": "€" },
    { "id": "saldo_ires", "label": "Saldo IRES da versare", "unit": "€" },
    { "id": "saldo_irap", "label": "Saldo IRAP da versare", "unit": "€" },
    { "id": "tax_rate_effettivo", "label": "Aliquota Fiscale Effettiva (Tax Rate)", "unit": "%" }
  ],
  "content": "### **Guida Completa al Calcolo delle Imposte per SRL e SRLS**\n\n**Analisi Approfondita di IRES e IRAP, Metodologie di Calcolo e Strategie di Ottimizzazione Fiscale**\n\nLa gestione fiscale di una Società a Responsabilità Limitata (SRL o SRLS) è un'attività complessa che richiede una profonda comprensione delle due principali imposte dirette: l'**IRES** (Imposta sul Reddito delle Società) e l'**IRAP** (Imposta Regionale sulle Attività Produttive). Sebbene spesso vengano considerate insieme, queste due imposte si basano su presupposti e basi imponibili differenti.\n\nQuesto documento offre una guida esaustiva, partendo dalla logica del nostro calcolatore per arrivare a un'analisi dettagliata dei meccanismi fiscali. L'obiettivo è fornire a imprenditori, manager e professionisti uno strumento potente per la simulazione e la pianificazione. **Si ricorda che questo calcolatore fornisce una stima e non può sostituire una consulenza fiscale professionale, indispensabile per gestire le specificità di ogni singola azienda.**\n\n### **Parte 1: Il Calcolatore - Guida ai Campi di Input**\n\nPer ottenere una stima accurata, è fondamentale comprendere il significato di ogni dato richiesto. La trasparenza nel processo di calcolo è il primo passo per una gestione consapevole.\n\n* **Fatturato Annuo**: Rappresenta il totale dei ricavi generati nell'anno fiscale. È il punto di partenza per entrambi i calcoli.\n* **Costi Operativi della Produzione**: Include tutti i costi direttamente collegati all'attività produttiva (materie prime, servizi esterni, affitti, utenze). Per il calcolo IRAP, questi sono i costi principali che vengono sottratti dal fatturato.\n* **Costo Totale del Personale**: È una delle voci di costo più significative. Ai fini IRES, è un costo interamente deducibile. Ai fini IRAP, invece, la regola generale è la sua indeducibilità, mitigata però da specifiche deduzioni (come quelle per i dipendenti a tempo indeterminato).\n* **Ammortamenti e Interessi Passivi**: Costi deducibili ai fini IRES che riducono l'utile imponibile. La loro deducibilità ai fini IRAP è generalmente esclusa.\n* **Perdite Fiscali Pregresse**: Le perdite IRES generate in anni precedenti possono essere utilizzate per abbattere il reddito imponibile degli esercizi futuri, un importante strumento di pianificazione fiscale.\n* **Numero Dipendenti a Tempo Indeterminato**: Questo dato consente di applicare una delle più importanti deduzioni IRAP, il cosiddetto 'cuneo fiscale', che riduce la base imponibile in base al numero di lavoratori stabili.\n\n### **Parte 2: Meccanismo di Calcolo dell'IRES (Imposta sul Reddito delle Società)**\n\nL'IRES è un'imposta nazionale proporzionale che colpisce il reddito d'impresa. La sua aliquota è attualmente fissata al **24%**.\n\nIl percorso per determinarla è il seguente:\n\n1.  **Determinazione dell'Utile Lordo di Bilancio**: Si parte dal risultato economico civilistico (Ricavi - Costi).\n2.  **Rettifiche Fiscali (Variazioni in aumento e in diminuzione)**: L'utile di bilancio viene 'rettificato' per ottenere il reddito imponibile fiscale. Il nostro calcolatore semplifica questo passaggio, assumendo che i costi inseriti siano già fiscalmente deducibili.\n3.  **Utilizzo delle Perdite Pregresse**: Dal reddito imponibile si sottraggono le perdite fiscali degli anni precedenti.\n4.  **Calcolo dell'Imposta**: Si applica l'aliquota del 24% alla base imponibile così ottenuta.\n\nL'IRES è versata tramite un sistema di **acconti** (due, durante l'anno) e un **saldo** (l'anno successivo).\n\n### **Parte 3: Meccanismo di Calcolo dell'IRAP (Imposta Regionale sulle Attività Produttive)**\n\nL'IRAP è un'imposta locale con un'aliquota standard del **3.9%** (che le Regioni possono variare). La sua peculiarità è che non colpisce l'utile netto, ma il **Valore della Produzione Netta**.\n\nLa base imponibile IRAP si calcola in modo molto diverso dall'IRES:\n\n* **Componenti Positivi**: Fatturato e altri ricavi della produzione.\n* **Componenti Negativi**: Solo i costi operativi della produzione (materie prime, servizi, etc.).\n\nLe differenze fondamentali sono che, di norma, **non sono deducibili dalla base imponibile IRAP**: \n* Il costo del personale.\n* Gli interessi passivi.\n* Gli ammortamenti finanziari.\n\nPer mitigare l'impatto di queste indeducibilità, la normativa prevede delle **deduzioni**, la più comune delle quali è legata all'impiego di personale a tempo indeterminato.\n\n### **Parte 4: Ottimizzazione Fiscale e Pianificazione per SRL**\n\nUna gestione fiscale efficiente non si limita al calcolo delle imposte, ma implica una pianificazione strategica per ottimizzare il carico fiscale in modo legale. Alcune leve includono:\n\n* **Compensi Amministratori**: Deducibili per la società (IRES) ma tassati in capo all'amministratore (IRPEF). La loro corretta determinazione è cruciale.\n* **Trattamento di Fine Mandato (TFM)**: Un accantonamento deducibile per la società che rappresenta una forma di retribuzione differita per gli amministratori, con vantaggi fiscali.\n* **Welfare Aziendale**: Erogazione di beni e servizi ai dipendenti che godono di un regime fiscale e contributivo agevolato.\n* **Marchi e Brevetti**: La concessione in uso di un marchio di proprietà personale dell'imprenditore alla propria SRL può generare royalties deducibili per la società.\n\n### **FAQ - Domande Frequenti su IRES e IRAP**\n\n1.  **Le SRLS (Semplificate) pagano meno tasse delle SRL Ordinarie?**\n    No, dal punto di vista fiscale non c'è alcuna differenza. Le regole di calcolo di IRES e IRAP e le aliquote sono identiche per entrambe le forme societarie.\n\n2.  **Quando si pagano le imposte?**\n    Il sistema prevede il versamento di due acconti (solitamente entro il 30 giugno e il 30 novembre) e un saldo (entro il 30 giugno dell'anno successivo a quello di riferimento).\n\n3.  **Questo calcolatore tiene conto delle variazioni regionali IRAP?**\n    No, il calcolatore utilizza l'aliquota nazionale standard del 3.9%. È importante verificare l'aliquota specifica applicata dalla propria Regione, che potrebbe essere maggiore o minore."
};


const CalcoloIresIrapSrlSrlsCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturato_annuo: 500000,
        costi_operativi: 250000,
        costo_personale: 80000,
        ammortamenti: 15000,
        interessi_passivi: 5000,
        perdite_pregresse_utilizzabili: 0,
        numero_dipendenti_indeterminati: 3,
        acconto_ires_versato: 10000,
        acconto_irap_versato: 3000
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const {
            fatturato_annuo, costi_operativi, costo_personale, ammortamenti, interessi_passivi,
            perdite_pregresse_utilizzabili, numero_dipendenti_indeterminati,
            acconto_ires_versato, acconto_irap_versato
        } = states;

        const utile_lordo_bilancio = fatturato_annuo - costi_operativi - costo_personale - ammortamenti - interessi_passivi;
        const base_imponibile_ires = Math.max(0, utile_lordo_bilancio - perdite_pregresse_utilizzabili);
        const ires_dovuta = base_imponibile_ires * 0.24;

        const valore_produzione_netta = fatturato_annuo - costi_operativi;
        const deduzione_lavoratori_irap = numero_dipendenti_indeterminati * 7500;
        const base_imponibile_irap = Math.max(0, valore_produzione_netta - deduzione_lavoratori_irap);
        const irap_dovuta = base_imponibile_irap * 0.039;

        const totale_imposte = ires_dovuta + irap_dovuta;
        const utile_netto = utile_lordo_bilancio - totale_imposte;
        const saldo_ires = ires_dovuta - acconto_ires_versato;
        const saldo_irap = irap_dovuta - acconto_irap_versato;
        const tax_rate_effettivo = utile_lordo_bilancio > 0 ? (totale_imposte / utile_lordo_bilancio) * 100 : 0;

        return {
            utile_lordo_bilancio, base_imponibile_ires, ires_dovuta, base_imponibile_irap,
            irap_dovuta, totale_imposte, utile_netto, saldo_ires, saldo_irap, tax_rate_effettivo
        };
    }, [states]);

    const chartData = [
        { name: 'Composizione Risultato', 'Costi Totali': states.costi_operativi + states.costo_personale + states.ammortamenti + states.interessi_passivi, 'Imposte (IRES+IRAP)': calculatedOutputs.totale_imposte, 'Utile Netto': calculatedOutputs.utile_netto },
    ];

    const formulaIres = `Base IRES = MAX(0, (Fatturato - Tutti i Costi) - Perdite Pregresse); IRES = Base IRES * 24%`;
    const formulaIrap = `Base IRAP = MAX(0, (Fatturato - Costi Operativi) - Deduzioni); IRAP = Base IRAP * 3.9%`;
    
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
        } catch (e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
    
    return (
        <>
        <FaqSchema />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
            <div className="lg:col-span-2">
                <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                    <p className="text-gray-600 mb-4">Simula il carico fiscale della tua SRL o SRLS basandoti sui dati di bilancio.</p>
                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                        <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale. Le aliquote e le deduzioni sono basate su normative standard e possono variare.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
                        {inputs.map(input => (
                            <div key={input.id}>
                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                    {input.label}
                                    <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-sm" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                    {input.unit && <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">{input.unit}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                        {outputs.map(output => (
                             <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${(output.id === 'totale_imposte' || output.id === 'utile_netto') ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                <div className={`text-xl md:text-2xl font-bold ${(output.id === 'totale_imposte' || output.id === 'utile_netto') ? 'text-indigo-600' : 'text-gray-800'}`}>
                                    <span>
                                        {isClient
                                            ? output.unit === '%'
                                                ? formatPercentage((calculatedOutputs as any)[output.id])
                                                : formatCurrency((calculatedOutputs as any)[output.id])
                                            : '...'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Analisi Grafica: dal Fatturato all'Utile Netto</h3>
                        <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                             {isClient && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" tickFormatter={(value) => `${value / 1000}k`} />
                                        <YAxis type="category" dataKey="name" width={10} />
                                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="Costi Totali" stackId="a" fill="#fca5a5" name="Costi" />
                                        <Bar dataKey="Imposte (IRES+IRAP)" stackId="a" fill="#f97316" name="Imposte" />
                                        <Bar dataKey="Utile Netto" stackId="a" fill="#4ade80" name="Utile Netto" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
                 <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                    <h3 className="font-semibold text-gray-700">Formule di Calcolo Semplificate</h3>
                    <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words"><strong>IRES:</strong> {formulaIres}</p>
                    <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words"><strong>IRAP:</strong> {formulaIrap}</p>
                </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
                <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={salvaRisultato} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                        <button onClick={handleExportPDF} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                        <button onClick={handleReset} className="w-full text-sm font-medium border border-red-300 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
                    </div>
                </section>
                <section className="border rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Guida Approfondita</h2>
                    <ContentRenderer content={content} />
                </section>
                 <section className="border rounded-lg p-6 bg-white shadow-md">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Riferimenti Normativi</h2>
                    <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                        <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 917/1986 (TUIR)</a> - Testo Unico delle Imposte sui Redditi (per IRES).</li>
                        <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-15;446" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.Lgs. n. 446/1997</a> - Istituzione dell'Imposta Regionale sulle Attività Produttive (IRAP).</li>
                    </ul>
                </section>
            </aside>
        </div>
        </>
    );
};

export default CalcoloIresIrapSrlSrlsCalculator;