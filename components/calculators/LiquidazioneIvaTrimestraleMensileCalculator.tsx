'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
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
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Chi può scegliere la liquidazione IVA trimestrale?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "..."
          }
        }, // Virgola qui
        {
          "@type": "Question",
          "name": "Qual è il costo della liquidazione IVA trimestrale rispetto a quella mensile?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "..."
          }
        }, // Virgola qui
        {
          "@type": "Question",
          "name": "Quando scadono i versamenti IVA trimestrali?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "..."
          }
        }, // Virgola qui
        {
          "@type": "Question",
          "name": "Questo calcolatore sostituisce la consulenza di un commercialista?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "..."
          }
        } // NESSUNA virgola qui, perché è l'ultimo elemento
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
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
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
                if (trimmedBlock.includes("| Regime")) {
                    const lines = trimmedBlock.split('\n');
                    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
                    const rows = lines.slice(2).map(line => line.split('|').map(cell => cell.trim()).filter(Boolean));
                    return (
                        <div key={index} className="overflow-x-auto my-6">
                            <table className="min-w-full border text-sm table-auto">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {headers.map((header, i) => <th key={i} className="p-2 border text-left font-semibold">{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i}>
                                            {row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
                                        </tr>
                                    ))}
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

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
    "slug": "liquidazione-iva-trimestrale-mensile",
    "category": "PMI e Impresa",
    "title": "Calcolatore Liquidazione IVA Trimestrale vs. Mensile",
    "lang": "it",
    "tags": "liquidazione IVA, calcolo IVA, IVA trimestrale, IVA mensile, scadenze IVA, F24, Partita IVA, regime fiscale, interessi IVA 1%",
    "inputs": [
        { "id": "fatturato_imponibile_trimestre", "label": "Fatturato Imponibile del Trimestre", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale imponibile delle fatture emesse nel trimestre di riferimento (es. Gen-Mar). Non includere l'IVA." },
        { "id": "iva_acquisti_detraibile_trimestre", "label": "IVA a Credito del Trimestre", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'IVA totale pagata sugli acquisti di beni e servizi inerenti all'attività, che puoi portare in detrazione." },
        { "id": "aliquota_media_applicata", "label": "Aliquota IVA Media Applicata", "type": "number" as const, "unit": "%", "min": 0, "step": 1, "tooltip": "Indica l'aliquota IVA media che applichi sulle tue vendite. L'aliquota ordinaria è del 22%." }
    ],
    "outputs": [
        { "id": "iva_a_debito_trimestrale", "label": "IVA a Debito del Trimestre", "unit": "€" },
        { "id": "versamento_mensile_stimato", "label": "Versamento Mensile Stimato (Regime Mensile)", "unit": "€" },
        { "id": "interessi_liquidazione_trimestrale", "label": "Costo Opzione Trimestrale (Interessi 1%)", "unit": "€" },
        { "id": "totale_da_versare_trimestrale", "label": "Totale da Versare (Regime Trimestrale)", "unit": "€" },
        { "id": "liquidita_extra_media", "label": "Liquidità Media Extra Mantenuta in Azienda", "unit": "€" }
    ],
    "content": `### **Guida Completa alla Liquidazione IVA: Mensile vs Trimestrale**

**Analisi Pratica per la Gestione Finanziaria della Tua Partita IVA**

La liquidazione periodica dell'IVA è uno degli adempimenti fiscali più importanti per imprese e professionisti. Consiste nel calcolare l'imposta dovuta allo Stato, data dalla differenza tra l'IVA incassata sulle vendite (IVA a debito) e l'IVA pagata sugli acquisti (IVA a credito). La normativa italiana prevede due regimi principali per questo adempimento: mensile e trimestrale.

Questo strumento è stato progettato per confrontare in modo chiaro e immediato i due regimi, aiutandoti a comprendere l'impatto finanziario di ciascuna scelta.

### **Parte 1: Il Calcolatore - Come Interpretare i Risultati**

Il nostro calcolatore simula l'onere fiscale IVA per un trimestre, evidenziando le differenze chiave tra il versamento mensile e quello trimestrale.

#### **Dati di Input Fondamentali:**

* **Fatturato Imponibile del Trimestre**: È la base su cui calcolare l'IVA a debito. Rappresenta la somma di tutti gli importi imponibili fatturati ai tuoi clienti nel periodo.
* **IVA a Credito del Trimestre**: È l'IVA che hai pagato ai tuoi fornitori per beni e servizi legati alla tua attività. Questo importo riduce l'IVA da versare.
* **Aliquota IVA Media Applicata**: L'aliquota standard è il 22%, ma a seconda del settore potresti applicare aliquote ridotte (4%, 5%, 10%). Inserisci una media ponderata se applichi aliquote diverse.

#### **Risultati e Significato:**

* **IVA a Debito del Trimestre**: Il risultato algebrico tra l'IVA sulle vendite e l'IVA sugli acquisti. Se positivo, rappresenta l'importo da versare allo Stato (al netto degli interessi per i trimestrali).
* **Versamento Mensile Stimato**: In regime mensile, l'IVA a debito del trimestre verrebbe versata in tre rate, una per ogni mese. Questo campo mostra la media di tale versamento.
* **Costo Opzione Trimestrale (Interessi 1%)**: Il "prezzo" per posticipare il pagamento è una maggiorazione dell'1% sull'IVA a debito. Questo è un costo puro per l'azienda.
* **Totale da Versare (Regime Trimestrale)**: La somma dell'IVA a debito e degli interessi dell'1%. Questo è l'importo che verserai con il modello F24 alla scadenza trimestrale.
* **Liquidità Media Extra**: Uno dei principali vantaggi del regime trimestrale è il beneficio finanziario. Questo valore stima la liquidità aggiuntiva che rimane a disposizione dell'azienda in media ogni mese, grazie al pagamento posticipato.

### **Parte 2: Analisi Dettagliata dei Regimi**

#### **Il Regime Mensile: La Regola Standard**

Il regime mensile è l'opzione di default per la maggior parte delle Partite IVA.
* **Chi**: Tutti i contribuenti, salvo opzione per il trimestrale.
* **Come**: Si calcola la differenza tra IVA a debito e a credito del mese.
* **Quando**: Il versamento va effettuato entro il giorno 16 del mese successivo a quello di riferimento (es. l'IVA di gennaio si versa entro il 16 febbraio).

#### **Il Regime Trimestrale: Un'Opzione per la Liquidità**

Il regime trimestrale permette di dilazionare i pagamenti, migliorando il flusso di cassa.
* **Chi (Contribuenti "per opzione")**: Professionisti e imprese che, nell'anno solare precedente, non hanno superato un volume d'affari di:
    * **€500.000** per prestazioni di servizi.
    * **€800.000** per le altre attività.
* **Come**: Si calcola l'IVA a debito del trimestre e si aggiunge una maggiorazione dell'1% a titolo di interessi.
* **Quando**: Le scadenze sono fisse:
    * **Primo Trimestre**: 16 Maggio
    * **Secondo Trimestre**: 20 Agosto
    * **Terzo Trimestre**: 16 Novembre
    * **Quarto Trimestre**: Il versamento confluisce nel saldo IVA annuale, da versare entro il 16 Marzo dell'anno successivo.

#### **Tabella Comparativa Riepilogativa**

| Regime | Vantaggi | Svantaggi | Scadenze Principali |
| :--- | :--- | :--- | :--- |
| **Mensile** | Nessun costo aggiuntivo (interessi).<br>Monitoraggio fiscale più frequente. | Maggiore onere amministrativo (12 liquidazioni/anno).<br>Impatto più pressante sulla liquidità. | Giorno 16 del mese successivo. |
| **Trimestrale**| Maggiore liquidità a disposizione dell'azienda.<br>Meno adempimenti periodici (4 liquidazioni/anno).| Costo aggiuntivo dell'1% sull'IVA a debito.<br>Importi da versare più elevati e concentrati. | 16/05, 20/08, 16/11, 16/03. |


### **Parte 3: Acconto IVA e Adempimenti**

Indipendentemente dal regime scelto (mensile o trimestrale), tutti i contribuenti sono tenuti al versamento dell'**Acconto IVA** entro il **27 Dicembre** di ogni anno. L'importo può essere calcolato con tre metodi (storico, previsionale, analitico). Questo calcolatore non include la stima dell'acconto.

Il versamento dell'IVA periodica si effettua tramite il **modello F24**, utilizzando specifici codici tributo:
* **Mensili**: 6001 (gennaio), 6002 (febbraio), etc., fino a 6012 (dicembre).
* **Trimestrali**: 6031 (1° trim.), 6032 (2° trim.), 6033 (3° trim.), 6034 (4° trim.).

**Disclaimer**: Questa guida e il relativo calcolatore hanno uno scopo puramente informativo e non possono sostituire una consulenza fiscale personalizzata. Per una corretta gestione della propria posizione IVA, è sempre necessario rivolgersi a un commercialista o a un consulente fiscale qualificato.`
};

const LiquidazioneIvaTrimestraleMensileCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturato_imponibile_trimestre: 25000,
        iva_acquisti_detraibile_trimestre: 2200,
        aliquota_media_applicata: 22,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { fatturato_imponibile_trimestre, iva_acquisti_detraibile_trimestre, aliquota_media_applicata } = states;

        const iva_su_vendite = fatturato_imponibile_trimestre * (aliquota_media_applicata / 100);
        const iva_a_debito_trimestrale = Math.max(0, iva_su_vendite - iva_acquisti_detraibile_trimestre);
        
        const versamento_mensile_stimato = iva_a_debito_trimestrale / 3;
        
        const interessi_liquidazione_trimestrale = iva_a_debito_trimestrale * 0.01;
        const totale_da_versare_trimestrale = iva_a_debito_trimestrale + interessi_liquidazione_trimestrale;

        // Stima della liquidità extra: nel primo mese si trattengono 2/3 dell'IVA, nel secondo 1/3.
        // Media: (2/3 + 1/3) / 2 = 1/2 dell'IVA dovuta. Un'altra metrica: (M1_trattenuto + M2_trattenuto)/3
        const liquidita_extra_media = (versamento_mensile_stimato * 2 + versamento_mensile_stimato) / 3;

        return {
            iva_a_debito_trimestrale,
            versamento_mensile_stimato,
            interessi_liquidazione_trimestrale,
            totale_da_versare_trimestrale,
            liquidita_extra_media,
        };
    }, [states]);

    const chartData = [
        { 
            name: 'Regime Mensile', 
            'IVA Versata': calculatedOutputs.iva_a_debito_trimestrale, 
            'Costi Aggiuntivi': 0 
        },
        { 
            name: 'Regime Trimestrale', 
            'IVA Versata': calculatedOutputs.iva_a_debito_trimestrale, 
            'Costi Aggiuntivi': calculatedOutputs.interessi_liquidazione_trimestrale 
        },
    ];

    const formulaUsata = `IVA Debito Trimestrale = (Fatturato * Aliquota %) - IVA Acquisti; Interessi Trimestrali = IVA Debito Trimestrale * 1%`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const pdfHeight = canvasHeight / ratio;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
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

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Confronta l'impatto finanziario e i costi per scegliere il regime più adatto alla tua impresa.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale. La scelta del regime IVA e la corretta liquidazione richiedono l'analisi di un commercialista.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => (
                                <div key={input.id} className={inputs.length === 3 && input.id === 'aliquota_media_applicata' ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id={input.id}
                                            aria-label={input.label}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2"
                                            type="number"
                                            min={input.min}
                                            step={input.step}
                                            value={states[input.id]}
                                            onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                                        />
                                        {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">{input.unit}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Confronto</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg 
                                ${output.id === 'totale_da_versare_trimestrale' ? 'bg-indigo-50 border-indigo-500' : ''}
                                ${output.id === 'interessi_liquidazione_trimestrale' ? 'bg-red-50 border-red-400' : ''}
                                ${output.id === 'liquidita_extra_media' ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold 
                                    ${output.id === 'totale_da_versare_trimestrale' ? 'text-indigo-600' : ''}
                                    ${output.id === 'interessi_liquidazione_trimestrale' ? 'text-red-600' : ''}
                                    ${output.id === 'liquidita_extra_media' ? 'text-green-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency(calculatedOutputs[output.id as keyof typeof calculatedOutputs]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Visivo Costi Trimestrali</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}/>
                                            <Legend />
                                            <Bar dataKey="IVA Versata" stackId="a" fill="#4f46e5" name="IVA a Debito" />
                                            <Bar dataKey="Costi Aggiuntivi" stackId="a" fill="#dc2626" name="Interessi 1%" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm font-medium border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm font-medium border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-sm font-medium border border-red-300 rounded-md px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Liquidazione IVA</h2>
                         <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/schede/pagamenti/f24ivap10/cosa-versivaperiodica" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Versamenti periodici IVA</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1972-10-26;633!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 633/1972 (Istituzione e disciplina dell'IVA)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default LiquidazioneIvaTrimestraleMensileCalculator;