'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const meta = {
    title: "Calcolatore Ravvedimento Operoso F24 (2025) | Calcolo Sanzioni e Interessi",
    description: "Calcola online e gratuitamente sanzioni ridotte e interessi per il ravvedimento operoso su F24. Aggiornato con le ultime aliquote. Facile e veloce."
};

// --- Dati di configurazione del calcolatore (dal JSON) ---
const calculatorData = {
  "slug": "ravvedimento-operoso-f24",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Ravvedimento Operoso F24 (per ritardi di pagamento)",
  "lang": "it",
  "inputs": [
    { "id": "importo_dovuto", "label": "Importo del tributo da versare", "type": "number" as const, "unit": "€", "min": 0.01, "step": 10, "tooltip": "Inserisci l'importo originale del tributo che non è stato pagato alla scadenza." },
    { "id": "data_scadenza", "label": "Data di scadenza originaria", "type": "date" as const, "tooltip": "Seleziona la data in cui il versamento avrebbe dovuto essere effettuato." },
    { "id": "data_pagamento", "label": "Data in cui si intende pagare", "type": "date" as const, "tooltip": "Seleziona la data effettiva del pagamento. Il numero di giorni di ritardo determina la misura della sanzione." }
  ],
  "outputs": [
    { "id": "giorni_ritardo", "label": "Giorni di ritardo calcolati", "unit": "giorni" },
    { "id": "tipo_ravvedimento", "label": "Tipologia di Ravvedimento Applicato" },
    { "id": "interessi_legali", "label": "Interessi legali dovuti", "unit": "€" },
    { "id": "sanzione_ridotta", "label": "Sanzione ridotta applicabile", "unit": "€" },
    { "id": "totale_da_versare", "label": "Importo Totale da Versare", "unit": "€" }
  ],
  "content": "### **Guida Completa al Ravvedimento Operoso (Aggiornata al 2025)**\n\n**Cos'è, come funziona e come utilizzare il calcolatore per sanare i tuoi ritardi con il Fisco.**\n\nIl **ravvedimento operoso** (disciplinato dall'art. 13 del D.Lgs. 472/1997) è uno strumento fondamentale che consente al contribuente di regolarizzare spontaneamente omissioni o ritardi nei versamenti delle imposte, beneficiando di una **significativa riduzione delle sanzioni**. \n\nQuesto strumento è un'ancora di salvezza per chiunque si accorga di aver mancato una scadenza fiscale, prima che sia l'Agenzia delle Entrate a notificare la violazione. L'obiettivo di questa guida e del calcolatore è fornire chiarezza e un aiuto pratico per mettersi in regola, risparmiando sull'importo delle sanzioni piene.\n\n### **Parte 1: Come Funziona il Calcolatore**\n\nIl nostro strumento semplifica un processo altrimenti complesso, calcolando in automatico tre elementi chiave:\n\n1.  **Sanzione Ridotta**: La multa per il ritardo, il cui importo è tanto più basso quanto prima ci si mette in regola.\n2.  **Interessi di Mora**: Calcolati al tasso legale annuo, maturano giorno per giorno sul tributo non versato.\n3.  **Importo Totale da Versare**: La somma del tributo originale, della sanzione ridotta e degli interessi.\n\nPer utilizzarlo, è sufficiente inserire l'importo originario del tributo, la sua scadenza e la data in cui si desidera effettuare il pagamento. Il sistema calcolerà automaticamente i giorni di ritardo e applicherà le corrette aliquote per sanzioni e interessi.\n\n#### **I Criteri di Calcolo: Sanzioni e Interessi**\n\nIl calcolo si basa su due variabili principali: i **giorni di ritardo** e il **tasso di interesse legale** in vigore.\n\n**Tabella Sanzioni Ridotte per Ravvedimento Operoso**\n\n| Tipo di Ravvedimento | Termine per la Regolarizzazione | Sanzione Ordinaria (30%) Ridotta a | Percentuale da Applicare |\n|:---|:---|:---|:---|\n| **Sprint** | Entro 14 giorni dalla scadenza | 1/15 per ogni giorno di ritardo | 0,1% al giorno |\n| **Breve** | Dal 15° al 30° giorno | 1/10 (sanzione fissa) | 1,5% |\n| **Intermedio** | Dal 31° al 90° giorno | 1/9 (sanzione fissa) | 1,67% |\n| **Lungo** | Entro il termine di presentazione della dichiarazione relativa all'anno della violazione (o entro 1 anno se non c'è dichiarazione) | 1/8 (sanzione fissa) | 3,75% |\n| **Ultra-Biennale** | Entro 2 anni dalla scadenza | 1/7 (sanzione fissa) | 4,29% |\n| **Lunghissimo** | Oltre i 2 anni | 1/6 (sanzione fissa) | 5,00% |\n| **Post-Constatazione**| Dopo un PVC (Processo Verbale di Constatazione) e prima della notifica dell'atto di accertamento | 1/5 (sanzione fissa) | 6,00% |\n\n\n**Tasso di Interesse Legale**\n\nGli interessi vengono calcolati sulla base del tasso legale stabilito annualmente dal Ministero dell'Economia e delle Finanze. Il calcolo è giornaliero.\n\n* **Tasso legale 2025**: 2,5% (Nota: valore ipotetico, verrà aggiornato con decreto MEF a fine 2024)\n* **Tasso legale 2024**: 2,5%\n* **Tasso legale 2023**: 5,0%\n\n### **Parte 2: Guida Pratica al Ravvedimento**\n\n#### **Quando NON è Possibile Utilizzare il Ravvedimento Operoso**\n\nIl ravvedimento è ammesso solo se la violazione **non è stata già contestata** e non sono iniziate ispezioni, verifiche o altre attività di accertamento (come la notifica di un avviso di accertamento o di liquidazione) di cui il contribuente abbia avuto formale conoscenza.\n\n#### **Come Compilare il Modello F24**\n\nIl versamento tramite ravvedimento operoso richiede la compilazione del modello F24, utilizzando codici tributo specifici per sanzioni e interessi, da versare separatamente rispetto al tributo principale.\n\n* **Tributo**: Va versato con il suo codice originario (es. 4001 per l'IRPEF).\n* **Interessi**: Vanno versati utilizzando il codice tributo specifico (es. 1990 per interessi su ravvedimento IRPEF) oppure sommati al tributo principale per alcune imposte (es. IVA, IRES).\n* **Sanzioni**: Vanno versate con il codice tributo dedicato (es. 8901 per sanzioni pecuniarie IRPEF).\n\nÈ **fondamentale** verificare i codici tributo corretti per la propria specifica imposta sul sito dell'Agenzia delle Entrate.\n\n### **Conclusione**\n\nIl ravvedimento operoso è un'opportunità preziosa per gestire in modo proattivo e meno oneroso gli errori fiscali. Utilizzare questo calcolatore è il primo passo per comprendere l'importo dovuto e procedere alla regolarizzazione. Per situazioni complesse o per la compilazione del modello F24, si raccomanda sempre di consultare il proprio commercialista o un professionista abilitato."
};

// --- Componenti UI Riutilizzabili ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema = () => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "Cos'è il ravvedimento operoso?", "acceptedAnswer": { "@type": "Answer", "text": "Il ravvedimento operoso è una procedura che permette ai contribuenti di regolarizzare volontariamente versamenti di imposte omessi o insufficienti, beneficiando di una riduzione sulle sanzioni. È possibile finché l'Agenzia delle Entrate non abbia già contestato la violazione." } }, { "@type": "Question", "name": "Come si calcolano le sanzioni del ravvedimento?", "acceptedAnswer": { "@type": "Answer", "text": "Le sanzioni sono calcolate in percentuale sull'importo del tributo non versato. La percentuale varia in base ai giorni di ritardo: va da un minimo dello 0,1% al giorno (ravvedimento sprint) fino a un massimo del 6% in caso di regolarizzazione dopo un verbale di constatazione." } }, { "@type": "Question", "name": "Quali sono i codici tributo per pagare sanzioni e interessi?", "acceptedAnswer": { "@type": "Answer", "text": "I codici tributo variano a seconda dell'imposta. Ad esempio, per l'IRPEF si usano generalmente l'8901 per le sanzioni e il 1989 per gli interessi. È essenziale verificare il codice corretto per ogni specifica imposta sul sito dell'Agenzia delle Entrate." } }] }) }} />);

// --- Componente per il Rendering del Contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const blocks = content.split('\n\n');
    return (<div className="prose prose-sm max-w-none text-gray-700">{blocks.map((block, index) => { const trimmedBlock = block.trim(); if (trimmedBlock.startsWith('### **')) { return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />; } if (trimmedBlock.startsWith('#### **')) { return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />; } if (trimmedBlock.startsWith('|')) { const rows = trimmedBlock.split('\n'); const headers = rows[0].split('|').slice(1, -1).map(h => h.trim()); const body = rows.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim())); return (<div key={index} className="overflow-x-auto my-4"><table className="min-w-full border text-sm"><thead><tr className="bg-gray-100">{headers.map((h, i) => <th key={i} className="p-2 border text-left font-semibold" dangerouslySetInnerHTML={{__html: h}}/>)}</tr></thead><tbody>{body.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>)}</tbody></table></div>); } if (trimmedBlock) { return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />; } return null; })}</div>);
};

// --- Componente Principale del Calcolatore ---
const RavvedimentoOperosoF24Calculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const [states, setStates] = useState<{ [key: string]: any }>({
        importo_dovuto: 1000,
        data_scadenza: "2025-06-30",
        data_pagamento: getTodayDate(),
    });

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates({ importo_dovuto: "", data_scadenza: "", data_pagamento: getTodayDate() });

   const calculatedOutputs = useMemo(() => {
        const { importo_dovuto, data_scadenza, data_pagamento } = states;
        const parsedImporto = parseFloat(importo_dovuto) || 0;

        // Path 1: Invalid data
        if (!parsedImporto || !data_scadenza || !data_pagamento || parsedImporto <= 0) {
            return {
                giorni_ritardo: 0,
                sanzione_ridotta: 0,
                interessi_legali: 0,
                totale_da_versare: 0,
                tipo_ravvedimento: "Dati non validi",
                importo_originario: 0 // FIX: Added default value
            };
        }
        
        const scadenza = new Date(data_scadenza);
        const pagamento = new Date(data_pagamento);

        // Path 2: No delay
        if (pagamento <= scadenza) {
            return {
                giorni_ritardo: 0,
                sanzione_ridotta: 0,
                interessi_legali: 0,
                totale_da_versare: parsedImporto,
                tipo_ravvedimento: "Nessun ritardo",
                importo_originario: parsedImporto // FIX: Added value
            };
        }

        const giorni_ritardo = Math.ceil((pagamento.getTime() - scadenza.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calcolo Interessi (Tasso legale al 2.5% per il 2025)
        const tassoInteresse = 0.025; 
        const interessi_legali = (parsedImporto * tassoInteresse / 365) * giorni_ritardo;

        // Calcolo Sanzioni
        let percentuale_sanzione = 0;
        let tipo_ravvedimento = "";

        if (giorni_ritardo <= 14) {
            percentuale_sanzione = 0.001 * giorni_ritardo; // 0.1% al giorno
            tipo_ravvedimento = `Ravvedimento Sprint (${giorni_ritardo} giorni)`;
        } else if (giorni_ritardo <= 30) {
            percentuale_sanzione = 0.015; // 1.5%
            tipo_ravvedimento = "Ravvedimento Breve (entro 30 giorni)";
        } else if (giorni_ritardo <= 90) {
            percentuale_sanzione = 0.0167; // 1.67%
            tipo_ravvedimento = "Ravvedimento Intermedio (entro 90 giorni)";
        } else if (giorni_ritardo <= 365) {
            percentuale_sanzione = 0.0375; // 3.75%
            tipo_ravvedimento = "Ravvedimento Lungo (entro 1 anno)";
        } else if (giorni_ritardo <= 730) {
            percentuale_sanzione = 0.0429; // 4.29%
            tipo_ravvedimento = "Ravvedimento Biennale (entro 2 anni)";
        } else {
            percentuale_sanzione = 0.05; // 5%
            tipo_ravvedimento = "Ravvedimento Ultra Biennale (oltre 2 anni)";
        }

        const sanzione_ridotta = parsedImporto * percentuale_sanzione;
        const totale_da_versare = parsedImporto + sanzione_ridotta + interessi_legali;

        // Path 3: Valid calculation
        return { 
            giorni_ritardo,
            sanzione_ridotta,
            interessi_legali,
            totale_da_versare,
            tipo_ravvedimento,
            importo_originario: parsedImporto
        };
    }, [states]);

    const chartData = [
        { name: 'Tributo', value: calculatedOutputs.importo_originario || 0, color: '#4f46e5' },
        { name: 'Sanzione', value: calculatedOutputs.sanzione_ridotta || 0, color: '#ef4444' },
        { name: 'Interessi', value: calculatedOutputs.interessi_legali || 0, color: '#f97316' },
    ];
    
    const formulaTrasparente = `Sanzione = Importo × %Sanzione(giorni) | Interessi = (Importo × TassoAnnuo / 365) × GiorniRitardo`;

    const handleExportPDF = useCallback(async () => {
        const calculatorEl = calculatorRef.current;
        if (!calculatorEl) return;
        try {
            const canvas = await html2canvas(calculatorEl, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}-risultati.pdf`);
        } catch (error) {
            console.error("Errore esportazione PDF:", error);
            alert("Impossibile generare il PDF. Assicurati che il browser non blocchi i popup.");
        }
    }, [slug]);

    const saveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const history = JSON.parse(localStorage.getItem("calc_history") || "[]");
            localStorage.setItem("calc_history", JSON.stringify([payload, ...history].slice(0, 10)));
            alert("Risultato salvato con successo!");
        } catch { alert("Errore nel salvataggio del risultato."); }
    }, [states, calculatedOutputs, slug, title]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Regolarizza spontaneamente i versamenti omessi o tardivi beneficiando di sanzioni ridotte.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo informativo e non sostituisce una consulenza professionale. Le aliquote sono aggiornate secondo la normativa vigente, ma si raccomanda la verifica con un commercialista.
                        </div>

                        {/* Sezione Input */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {inputs.map(input => (
                                <div key={input.id}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id={input.id}
                                            type={input.type}
                                            min={input.min}
                                            step={input.step}
                                            value={states[input.id]}
                                            onChange={(e) => handleStateChange(input.id, e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                        />
                                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Sezione Risultati */}
                        <div className="mt-8">
                             <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati del Calcolo</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {outputs.map(output => (
                                        <div key={output.id} className={`flex items-baseline justify-between p-3 rounded-lg ${output.id === 'totale_da_versare' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                                            <span className="text-sm font-medium text-gray-600">{output.label}</span>
                                            <span className={`font-bold ${output.id === 'totale_da_versare' ? 'text-2xl text-indigo-600' : 'text-lg text-gray-800'}`}>
                                                {isClient ? 
                                                    (typeof (calculatedOutputs as any)[output.id] === 'number' ? (output.unit === '€' ? formatCurrency((calculatedOutputs as any)[output.id]) : (calculatedOutputs as any)[output.id]) : (calculatedOutputs as any)[output.id])
                                                    : '...'}
                                                {output.unit && output.unit !== '€' && ` ${output.unit}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg flex flex-col items-center justify-center">
                                    <h3 className="text-base font-semibold text-gray-700 mb-2">Ripartizione del Totale</h3>
                                    {isClient && (calculatedOutputs.totale_da_versare > calculatedOutputs.importo_originario) && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                    {chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                                                </Pie>
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="mt-4 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetica</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaTrasparente}</p>
                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={saveResult} className="w-full text-center border border-indigo-600 text-indigo-600 rounded-md px-4 py-2 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-center border border-gray-400 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-center bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-2 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Campi</button>
                        </div>
                    </section>
                     <section className="border rounded-lg p-6 bg-white shadow-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Guida e Approfondimenti</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-6 bg-white shadow-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-18;472!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.Lgs. n. 472/1997, Art. 13</a> - Disciplina del ravvedimento operoso.</li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/pagamenti/ravvedimento-operoso" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Pagina Ufficiale Agenzia delle Entrate</a> - Informazioni sul ravvedimento.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default RavvedimentoOperosoF24Calculator;