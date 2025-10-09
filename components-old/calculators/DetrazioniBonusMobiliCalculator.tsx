'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
    title: "Calcolatore Bonus Mobili 2024/2025: Calcolo Detrazione Fiscale",
    description: "Calcola la detrazione IRPEF del 50% per l'acquisto di mobili ed elettrodomestici. Strumento aggiornato con i massimali 2024 e 2025."
};

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
                        "name": "Qual è il massimale di spesa per il Bonus Mobili nel 2024 e 2025?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Per gli anni 2024 e 2025, il limite massimo di spesa su cui calcolare la detrazione del 50% è fissato a 5.000 euro per unità immobiliare. Per il 2023, il limite era di 8.000 euro."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "È necessario fare una ristrutturazione per avere il Bonus Mobili?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sì, è un requisito indispensabile. Per accedere al Bonus Mobili, è necessario aver realizzato un intervento di manutenzione straordinaria, restauro, risanamento conservativo o ristrutturazione edilizia. La data di inizio lavori deve essere precedente a quella dell'acquisto dei mobili."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come si paga per ottenere la detrazione?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I pagamenti devono essere tracciabili. Sono validi bonifici bancari o postali e pagamenti con carta di credito o di debito. Non sono ammessi pagamenti in contanti o con assegni bancari."
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
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                }
                if (trimmedBlock.startsWith('| Anno')) { // Rileva l'inizio della tabella
                    const rows = trimmedBlock.split('\n').slice(2); // Salta header e linea di separazione
                    return (
                         <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr><th className="p-2 border text-left">Anno di Sostenimento Spesa</th><th className="p-2 border text-left">Massimale di Spesa Detraibile</th></tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, rIndex) => {
                                        const cells = row.split('|').map(c => c.trim()).filter(c => c);
                                        return <tr key={rIndex}><td className="p-2 border">{cells[0]}</td><td className="p-2 border font-semibold">{cells[1]}</td></tr>
                                    })}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore (inclusi direttamente) ---
const calculatorData = {
  "slug": "detrazioni-bonus-mobili",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Detrazioni Fiscali per Bonus Mobili",
  "description": "Verifica la detrazione IRPEF a cui hai diritto per l'acquisto di mobili e grandi elettrodomestici. Aggiornato con i massimali di spesa più recenti.",
  "lang": "it",
  "inputs": [
    { "id": "importo_speso", "label": "Importo totale speso per mobili/elettrodomestici", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci la spesa totale sostenuta per l'acquisto di mobili e grandi elettrodomestici, comprensiva di IVA, trasporto e montaggio." },
    { "id": "anno_spesa", "label": "Anno di sostenimento della spesa", "type": "select" as const, "options": [2025, 2024, 2023], "tooltip": "Seleziona l'anno in cui hai effettuato i pagamenti. Il massimale di spesa varia in base all'anno." },
    { "id": "spese_anni_precedenti_stesso_immobile", "label": "Hai già usufruito del Bonus Mobili per lo stesso immobile?", "type": "boolean" as const, "tooltip": "Spunta questa casella se, in anni precedenti, hai già richiesto il Bonus Mobili per la stessa unità immobiliare oggetto di ristrutturazione." },
    { "id": "importo_gia_usufruito", "label": "Importo già portato in detrazione in anni precedenti", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "spese_anni_precedenti_stesso_immobile == true", "tooltip": "Indica l'ammontare totale delle spese per mobili già ammesse al bonus per questo immobile negli anni passati. Il limite di spesa è cumulativo." }
  ],
  "outputs": [
    { "id": "massimale_anno_corrente", "label": "Massimale di spesa per l'anno selezionato", "unit": "€" },
    { "id": "spesa_ammissibile_calcolata", "label": "Spesa massima detraibile per l'acquisto attuale", "unit": "€" },
    { "id": "detrazione_totale_irpef", "label": "Detrazione IRPEF totale (50% della spesa ammissibile)", "unit": "€" },
    { "id": "detrazione_annuale", "label": "Importo detraibile annualmente (per 10 anni)", "unit": "€" }
  ],
  "content": "### **Guida Completa al Bonus Mobili e Grandi Elettrodomestici\n\n**Un'analisi dettagliata dei requisiti, delle spese ammissibili e delle procedure per massimizzare il risparmio fiscale.**\n\nIl \"Bonus Mobili\" è una delle agevolazioni fiscali più apprezzate in Italia, ma la sua corretta applicazione dipende da requisiti specifici legati a interventi di ristrutturazione edilizia. Questo documento offre una guida esaustiva per comprendere il funzionamento del bonus, utilizzando il nostro calcolatore come strumento pratico per una stima precisa.\n\nL'obiettivo è fornire una risorsa autorevole e chiara, superando le semplici nozioni di base. Ricordiamo che questo strumento ha scopo informativo e **non sostituisce la consulenza di un professionista qualificato** (commercialista, CAF) per la gestione della propria posizione fiscale.\n\n### **Parte 1: Il Calcolatore - Come Interpretare i Risultati**\n\nIl nostro calcolatore è progettato per simulare il calcolo della detrazione fiscale basandosi sui parametri chiave definiti dall'Agenzia delle Entrate.\n\n* **Importo Totale Speso**: È la base di partenza. Include il costo dei beni, l'IVA, le spese di trasporto e quelle di montaggio.\n* **Anno della Spesa**: Parametro cruciale, poiché il **massimale di spesa** detraibile è cambiato negli anni. Il calcolatore è aggiornato con i limiti ufficiali.\n* **Spese Anni Precedenti**: Il bonus è legato all'immobile. Se hai già usufruito dell'agevolazione per la stessa unità immobiliare, il massimale non si \"resetta\", ma deve tenere conto delle somme già ammesse in detrazione.\n\n#### **Output del Calcolo Spiegati**\n\n* **Spesa Massima Detraibile**: È l'importo effettivo su cui verrà calcolata la detrazione del 50%. Corrisponde alla spesa sostenuta, ma non può mai superare il massimale di legge (al netto di eventuali spese precedenti).\n* **Detrazione IRPEF Totale**: Il beneficio fiscale complessivo, pari al 50% della spesa ammissibile.\n* **Importo Detraibile Annualmente**: La detrazione totale viene ripartita in **10 rate annuali** di pari importo, che andranno a ridurre l'IRPEF dovuta in ciascun anno.\n\n### **Parte 2: Guida Approfondita alla Normativa**\n\n#### **Cos'è Esattamente il Bonus Mobili?**\n\nÈ una **detrazione dall'IRPEF del 50%** per l'acquisto di mobili e di grandi elettrodomestici destinati ad arredare un immobile oggetto di specifici interventi di recupero del patrimonio edilizio. L'agevolazione è disciplinata dall'art. 16, comma 2, del DL 63/2013.\n\n#### **Requisito Fondamentale: l'Intervento di Ristrutturazione**\n\nPer accedere al Bonus Mobili è **indispensabile** aver realizzato un intervento di ristrutturazione edilizia su singole unità immobiliari o su parti comuni di edifici residenziali. La data di inizio dei lavori deve essere **anteriore** a quella in cui si sostengono le spese per i mobili.\n\n**Interventi su singole unità immobiliari che danno diritto al bonus:**\n\n* **Manutenzione straordinaria**: es. installazione di ascensori, realizzazione di servizi igienici, rifacimento di scale, sostituzione di infissi esterni con modifica del materiale o della tipologia.\n* **Restauro e risanamento conservativo**: interventi volti a conservare l'organismo edilizio e ad assicurarne la funzionalità.\n* **Ristrutturazione edilizia**: es. modifica della facciata, realizzazione di una mansarda, apertura di nuove finestre.\n\n**Interventi su parti comuni condominiali:**\n\n* Anche la **manutenzione ordinaria** (es. tinteggiatura pareti, rifacimento pavimenti) sulle parti comuni (es. guardiole, appartamento del portiere) dà diritto al bonus per i singoli condòmini, ma solo per l'acquisto di arredi destinati a tali parti comuni.\n\n#### **Spese Ammissibili: Cosa si Può Acquistare?**\n\n* **Mobili Nuovi**: Letti, armadi, cassettiere, librerie, scrivanie, tavoli, sedie, comodini, divani, poltrone, credenze, materassi, apparecchi di illuminazione.\n* **Grandi Elettrodomestici Nuovi**: Frigoriferi, congelatori, lavatrici, lavasciuga, asciugatrici, lavastoviglie, apparecchi di cottura, stufe elettriche, forni a microonde, piastre riscaldanti elettriche, apparecchi elettrici di riscaldamento, ventilatori elettrici, condizionatori. Per questi, sono previste delle **classi energetiche minime**:\n    * **A** per i forni.\n    * **E** per lavatrici, lavasciugatrici e lavastoviglie.\n    * **F** per frigoriferi e congelatori.\n\nSono incluse le spese di **trasporto** e di **montaggio** dei beni acquistati.\n\n#### **Massimali di Spesa: Un Quadro Storico**\n\nIl limite di spesa su cui calcolare la detrazione è stato più volte modificato. È fondamentale riferirsi al massimale in vigore nell'anno di sostenimento della spesa.\n\n| Anno di Sostenimento Spesa | Massimale di Spesa Detraibile |\n| :--- | :--- |\n| 2023 | 8.000 € |\n| 2024 | 5.000 € |\n| 2025 (previsione) | 5.000 € |\n\n**Importante**: Il massimale si riferisce alla singola unità immobiliare, comprensiva delle pertinenze, o alla parte comune dell'edificio oggetto di ristrutturazione. Questo significa che se si eseguono lavori su più unità immobiliari, si ha diritto a più di un bonus.\n\n#### **Come Effettuare i Pagamenti**\n\nPer avere diritto alla detrazione è obbligatorio effettuare i pagamenti con metodi **tracciabili**. Non sono ammessi contanti o assegni bancari.\n\n* **Bonifico bancario o postale**: (Non è necessario utilizzare il bonifico specifico per le ristrutturazioni edilizie).\n* **Carte di debito o credito**.\n\nLa data del pagamento è quella che conta ai fini dell'imputazione della spesa all'anno corretto.\n\n### **Parte 3: Aspetti Fiscali e Documentali**\n\n#### **Gestione della Detrazione**\n\nLa detrazione del 50% viene ripartita in **10 quote annuali** di pari importo. Ad esempio, su una spesa ammissibile di 5.000 €, la detrazione totale è di 2.500 €, che si traduce in una riduzione dell'IRPEF di **250 € all'anno per 10 anni**.\nLa detrazione va indicata nel **Modello 730** (Quadro E, rigo E57) o nel **Modello Redditi Persone Fisiche**.\n\n#### **Documenti da Conservare con Cura**\n\n* **Ricevuta del bonifico** o ricevuta di avvenuta transazione per i pagamenti con carta.\n* **Estratto conto** della banca o della società emittente della carta.\n* **Fatture di acquisto** dei beni, che riportino la natura, la qualità e la quantità dei beni e dei servizi acquisiti.\n* **Titolo abilitativo** per l'intervento edilizio (es. CILA, SCIA) o dichiarazione sostitutiva di atto di notorietà se non previsto."
};


const DetrazioniBonusMobiliCalculator: React.FC = () => {
    const { slug, title, description, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        importo_speso: 7500,
        anno_spesa: 2024,
        spese_anni_precedenti_stesso_immobile: false,
        importo_gia_usufruito: 0
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { importo_speso, anno_spesa, spese_anni_precedenti_stesso_immobile, importo_gia_usufruito } = states;
        
        const massimale_anno_corrente = anno_spesa == 2023 ? 8000 : 5000;
        const massimale_residuo = spese_anni_precedenti_stesso_immobile ? massimale_anno_corrente - importo_gia_usufruito : massimale_anno_corrente;
        const spesa_ammissibile_calcolata = Math.max(0, Math.min(importo_speso, massimale_residuo));
        const detrazione_totale_irpef = spesa_ammissibile_calcolata * 0.5;
        const detrazione_annuale = detrazione_totale_irpef / 10;
        const spesa_non_ammissibile = Math.max(0, importo_speso - spesa_ammissibile_calcolata);

        return {
            massimale_anno_corrente,
            spesa_ammissibile_calcolata,
            detrazione_totale_irpef,
            detrazione_annuale,
            spesa_non_ammissibile,
            importo_speso
        };
    }, [states]);

    const chartData = [
        { name: 'Spesa', 'Spesa Ammissibile': calculatedOutputs.spesa_ammissibile_calcolata, 'Spesa non Ammissibile': calculatedOutputs.spesa_non_ammissibile },
    ];

    const formulaUsata = `Spesa Ammissibile = MIN( Spesa Sostenuta, Massimale Anno - Spese Anni Precedenti )`;

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
        } catch (_e) { alert("Funzione PDF non disponibile."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { spesa_non_ammissibile, importo_speso, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-white rounded-lg shadow-md" ref={calcolatoreRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{description}</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo. Per la dichiarazione fiscale, consulta un CAF o un commercialista.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;
                                
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }
                                
                                if (input.type === 'select') {
                                     return (
                                        <div key={input.id}>
                                            {inputLabel}
                                            <select id={input.id} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" value={states[input.id]} onChange={(e) => handleStateChange(input.id, Number(e.target.value))}>
                                                {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'detrazione_annuale' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'detrazione_annuale' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione della Spesa</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Spesa Ammissibile" stackId="a" fill="#4f46e5" />
                                            <Bar dataKey="Spesa non Ammissibile" stackId="a" fill="#ef4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                        <p className="text-xs text-gray-500 mt-2">Questa formula rappresenta la logica di base per determinare la spesa massima su cui applicare la detrazione del 50%.</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-red-200 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                         <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Ufficiali</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/schede/agevolazioni/detrristredil36/bonus-mobili-detrristredil36" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Guida al Bonus Mobili - Agenzia delle Entrate</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2013-06-04;63" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Decreto Legge 63/2013, Art. 16</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default DetrazioniBonusMobiliCalculator;