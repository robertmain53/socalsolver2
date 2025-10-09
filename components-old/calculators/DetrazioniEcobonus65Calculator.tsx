'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const meta = {
  title: "Calcolatore Detrazioni Fiscali per Ecobonus (65%) | Stima Online",
  description: "Calcola il beneficio fiscale netto dell'Ecobonus al 65% per la riqualificazione energetica. Simula la tua detrazione annuale e verifica la capienza fiscale."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
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
            "name": "Cosa si intende per 'capienza fiscale'?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La capienza fiscale è l'ammontare di imposta IRPEF che un contribuente deve versare. La detrazione annuale dell'Ecobonus non può superare questa cifra. Se la detrazione è superiore all'imposta, la parte eccedente viene persa e non può essere recuperata negli anni successivi."
            }
          },
          {
            "@type": "Question",
            "name": "Quali sono i principali lavori che rientrano nell'Ecobonus 65%?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I principali interventi agevolati con l'aliquota del 65% includono la coibentazione dell'involucro (cappotto termico), l'installazione di pannelli solari termici, la sostituzione degli impianti di climatizzazione invernale con sistemi più efficienti (es. pompe di calore, caldaie a condensazione in classe A+ con sistemi di termoregolazione evoluti) e l'installazione di sistemi di building automation."
            }
          },
          {
            "@type": "Question",
            "name": "È obbligatorio fare il 'bonifico parlante'?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, è un requisito fondamentale. Per beneficiare della detrazione, tutti i pagamenti devono essere effettuati tramite un bonifico bancario o postale 'parlante', che deve contenere specifiche informazioni come il riferimento normativo, il codice fiscale del beneficiario e la partita IVA della ditta che esegue i lavori."
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
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*Nota Bene:')) {
                    return <p key={index} className="text-xs italic p-2 bg-gray-50 rounded-md border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                if (trimmedBlock.startsWith('| Tipo di Intervento')) {
                    const rows = trimmedBlock.split('\n').slice(2).map(row => row.split('|').map(cell => cell.trim()));
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {trimmedBlock.split('\n')[0].split('|').map((header, hIndex) => (
                                            <th key={hIndex} className="p-2 border text-left font-semibold">{header.trim()}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, rIndex) => (
                                        <tr key={rIndex}>
                                            {row.map((cell, cIndex) => (
                                                <td key={cIndex} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }}></td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// --- Dati di configurazione del calcolatore (da file JSON) ---
const calculatorData = {
  "slug": "detrazioni-ecobonus-65",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Detrazioni Fiscali per Ecobonus (65%)",
  "lang": "it",
  "inputs": [
    { "id": "spesa_sostenuta", "label": "Spesa totale sostenuta per i lavori", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo totale delle spese ammissibili, comprensivo di IVA, costi di progettazione e prestazioni professionali." },
    { "id": "massimale_spesa", "label": "Massimale di spesa per l'intervento", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Indica il limite massimo di spesa detraibile per la tipologia di intervento eseguito (es. 60.000€ per infissi e schermature solari, 30.000€ per la caldaia)." },
    { "id": "irpef_dovuta", "label": "La tua IRPEF lorda annua", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'imposta sul reddito che versi annualmente. La detrazione non può superare l'imposta dovuta, altrimenti la parte eccedente viene persa (incapienza fiscale)." }
  ],
  "outputs": [
    { "id": "detrazione_totale_teorica", "label": "Detrazione Totale (in 10 anni)", "unit": "€" },
    { "id": "rata_annuale_teorica", "label": "Rata di detrazione annuale", "unit": "€" },
    { "id": "beneficio_fiscale_annuale_reale", "label": "Beneficio Fiscale Annuo Effettivo", "unit": "€" },
    { "id": "detrazione_persa", "label": "Importo totale non recuperabile (incapienza)", "unit": "€" }
  ],
  "content": "### **Guida Definitiva all'Ecobonus 65%: Calcolo, Interventi e Obblighi**\n\n**Analisi approfondita della detrazione fiscale per la riqualificazione energetica degli edifici, con focus sui criteri normativi e le procedure operative.**\n\nL'Ecobonus al 65% è una delle agevolazioni fiscali più importanti per chi desidera migliorare l'efficienza energetica della propria abitazione, riducendo i consumi e le emissioni. Si tratta di una detrazione dall'IRPEF (o IRES) che viene ripartita in **10 quote annuali** di pari importo.\n\nQuesto strumento di calcolo è stato progettato per offrire una stima precisa e trasparente del beneficio fiscale ottenibile, tenendo conto di variabili fondamentali come i massimali di spesa e la capienza fiscale. **Tuttavia, si ricorda che i risultati sono una simulazione e non sostituiscono il parere di un commercialista o di un tecnico abilitato.**\n\n### **Parte 1: Il Calcolatore - Comprendere le Variabili**\n\nIl nostro calcolatore si basa sui tre pilastri che determinano l'importo effettivo della detrazione.\n\n1.  **Spesa Sostenuta**: È il costo totale dei lavori ammissibili. Include non solo la fornitura e posa in opera dei materiali, ma anche le spese professionali (progettazione, direzione lavori, APE, etc.) e l'IVA.\n2.  **Massimale di Spesa**: Ogni tipologia di intervento ha un tetto massimo di spesa detraibile stabilito dalla legge. Se la spesa sostenuta supera questo limite, il calcolo della detrazione verrà effettuato sul massimale. Ad esempio, per la sostituzione di infissi il massimale è 60.000€; anche spendendo 70.000€, la detrazione si calcolerà su 60.000€.\n3.  **IRPEF Lorda Annua (Capienza Fiscale)**: Questo è un concetto cruciale. La quota annuale di detrazione non è un rimborso diretto, ma uno 'sconto' sull'imposta dovuta. Se la quota di detrazione (es. 1.500€) è superiore all'imposta che devi pagare (es. 1.000€), potrai 'scontare' solo 1.000€. I restanti 500€ di quella quota annuale andranno irrimediabilmente persi. È il principio della **capienza fiscale**.\n\n### **Parte 2: Guida Approfondita agli Interventi Ammessi**\n\nNon tutti i lavori di ristrutturazione danno diritto all'Ecobonus 65%. L'agevolazione è strettamente legata a interventi che aumentano il livello di efficienza energetica degli edifici esistenti. Gli immobili devono essere dotati di impianto di riscaldamento.\n\n#### **Tabella dei Principali Interventi e Massimali di Detrazione**\n\n| Tipo di Intervento | Aliquota Detrazione | Massimale Detrazione | Esempi Pratici |\n|---|---|---|---|\n| **Riqualificazione Globale** | 65% | 100.000 € | Interventi su tutto l'edificio per migliorare le prestazioni invernali ed estive. |\n| **Coibentazione (cappotto, tetti)** | 65% | 60.000 € | Isolamento termico di pareti, coperture e solai. |\n| **Pannelli Solari Termici** | 65% | 60.000 € | Installazione di pannelli per la produzione di acqua calda sanitaria. |\n| **Sostituzione Infissi e Serramenti** | 50% * | 60.000 € | Sostituzione di finestre comprensive di infissi, nel rispetto dei valori di trasmittanza termica. |\n| **Schermature Solari** | 50% * | 60.000 € | Installazione di tende da sole, tapparelle, persiane con determinati requisiti. |\n| **Sostituzione Impianti di Climatizzazione** | 65% | 30.000 € | Installazione di caldaie a condensazione (classe A+ con termoregolazione), pompe di calore, sistemi ibridi. |\n| **Building Automation** | 65% | 15.000 € | Installazione di sistemi domotici per il controllo a distanza degli impianti. |\n\n*Nota Bene: Dal 2024, le aliquote per infissi, schermature solari e caldaie a biomassa sono state ridotte al 50%. Il nostro calcolatore è impostato per il 65%, ideale per gli interventi principali come coibentazione e sostituzione di impianti di climatizzazione.* \n\n### **Parte 3: La Procedura Corretta: Adempimenti Burocratici**\n\nPer ottenere la detrazione è indispensabile seguire una procedura rigorosa.\n\n1.  **Asseverazione Tecnica**: Un tecnico abilitato (ingegnere, architetto, geometra) deve certificare che l'intervento rispetta i requisiti tecnici richiesti dalla legge.\n2.  **Attestato di Prestazione Energetica (APE)**: Deve essere redatto un APE prima e dopo i lavori per dimostrare il miglioramento energetico conseguito. Non è sempre obbligatorio (es. per la sola sostituzione degli infissi), ma è fortemente consigliato.\n3.  **Pagamenti Tracciabili (Bonifico Parlante)**: Tutti i pagamenti devono essere effettuati tramite bonifico bancario o postale 'parlante', che deve riportare:\n    * Causale del versamento con riferimento normativo (Legge 296/2006).\n    * Codice fiscale del beneficiario della detrazione.\n    * Codice fiscale o Partita IVA del soggetto a favore del quale il bonifico è effettuato.\n4.  **Comunicazione all'ENEA**: Entro 90 giorni dalla fine dei lavori, è obbligatorio trasmettere telematicamente all'ENEA (Agenzia nazionale per le nuove tecnologie, l'energia e lo sviluppo economico sostenibile) la scheda descrittiva degli interventi realizzati.\n\n### **Conclusione: Massimizzare il Vantaggio Fiscale**\n\nL'Ecobonus 65% è un'opportunità eccezionale per investire nel comfort e nel valore del proprio immobile, con un significativo ritorno economico garantito dallo Stato. Una pianificazione attenta, la verifica della propria capienza fiscale e il rispetto scrupoloso degli adempimenti burocratici sono i passaggi chiave per trasformare una spesa in un investimento vantaggioso. Per operazioni complesse, l'affiancamento di un tecnico e di un consulente fiscale è la scelta più sicura per evitare errori e massimizzare il beneficio."
};

const DetrazioniEcobonus65Calculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        spesa_sostenuta: 25000,
        massimale_spesa: 60000,
        irpef_dovuta: 12000,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { spesa_sostenuta, massimale_spesa, irpef_dovuta } = states;
        const spesa_ammessa = Math.min(spesa_sostenuta, massimale_spesa);
        const detrazione_totale_teorica = spesa_ammessa * 0.65;
        const rata_annuale_teorica = detrazione_totale_teorica / 10;
        const beneficio_fiscale_annuale_reale = Math.min(rata_annuale_teorica, irpef_dovuta);
        const beneficio_fiscale_totale_reale = beneficio_fiscale_annuale_reale * 10;
        const detrazione_persa = detrazione_totale_teorica - beneficio_fiscale_totale_reale;
        return {
            detrazione_totale_teorica,
            rata_annuale_teorica,
            beneficio_fiscale_annuale_reale,
            detrazione_persa,
            spesa_ammessa,
            beneficio_fiscale_totale_reale
        };
    }, [states]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    const chartData = [
        { name: 'Spesa Ammessa', value: calculatedOutputs.spesa_ammessa, fill: '#a5b4fc' },
        { name: 'Beneficio Reale', value: calculatedOutputs.beneficio_fiscale_totale_reale, fill: '#4f46e5' },
        { name: 'Importo Perso', value: calculatedOutputs.detrazione_persa, fill: '#fca5a5' },
    ];

    const formulaUsata = `Beneficio Annuo = MIN( (MIN(Spesa Sostenuta, Massimale) * 0.65) / 10, IRPEF Lorda )`;
    
    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Impossibile generare il PDF in questo ambiente."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { spesa_ammessa, beneficio_fiscale_totale_reale, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="p-0" ref={calcolatoreRef}>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">Stima il tuo vantaggio fiscale per la riqualificazione energetica.</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale o tecnica.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-lg">
                                {inputs.map(input => (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'beneficio_fiscale_annuale_reale' ? 'bg-indigo-50 border-indigo-500' : (output.id === 'detrazione_persa' && (calculatedOutputs as any)[output.id] > 0 ? 'bg-red-50 border-red-400' : 'bg-gray-50 border-gray-300')}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'beneficio_fiscale_annuale_reale' ? 'text-indigo-600' : (output.id === 'detrazione_persa' && (calculatedOutputs as any)[output.id] > 0 ? 'text-red-600' : 'text-gray-800')}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Costo e Beneficio</h3>
                                <div className="h-72 w-full bg-gray-50 p-4 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" tickFormatter={(value) => `€${value / 1000}k`} />
                                                <YAxis type="category" dataKey="name" width={100} />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(230, 230, 230, 0.5)'}} />
                                                <Bar dataKey="value" name="Valore" barSize={30} />
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
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida all'Ecobonus 65%</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/detrazione-riqualificazione-energetica-50-2021/scheda-informativa-riqualificazione-energetica-2021" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Guida Agenzia delle Entrate</a> - Riqualificazione energetica.</li>
                            <li><a href="https://www.efficienzaenergetica.enea.it/detrazioni-fiscali.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Portale ENEA</a> - Sezione dedicata alle detrazioni fiscali.</li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2006-12-27;296" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge 296/2006 (Finanziaria 2007)</a> - Art. 1, commi 344-347.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default DetrazioniEcobonus65Calculator;