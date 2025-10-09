'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
    title: "Calcolatore Costo Infissi 2025 con Ecobonus e Bonus Casa",
    description: "Stima il costo per sostituire le tue finestre e calcola il risparmio netto con gli incentivi fiscali (Ecobonus 50%, Bonus Casa). Confronta materiali e bonus."
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
                        "name": "Qual è la differenza tra Ecobonus e Bonus Casa per gli infissi?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "L'Ecobonus 50% è specifico per la riqualificazione energetica, richiede il rispetto di limiti di trasmittanza termica e di costo al mq, ma può essere richiesto per la sola sostituzione degli infissi. Il Bonus Casa 50% si applica nel contesto di una ristrutturazione edilizia più ampia, non ha limiti di costo al mq ma richiede che la sostituzione non sia l'unico lavoro effettuato."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Cosa sono i massimali di costo al mq per l'Ecobonus?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Per accedere all'Ecobonus, il costo dei soli infissi (esclusa posa e IVA) non può superare un certo importo al metro quadro, che varia in base alla zona climatica (es. 650 €/mq per le zone D, E, F). Questo calcolatore tiene conto di questo limite per stimare la spesa ammissibile."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Lo sconto in fattura è ancora disponibile per gli infissi?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, per la maggior parte dei contribuenti privati e per gli interventi su singole unità abitative, lo sconto in fattura e la cessione del credito sono stati aboliti. Il beneficio fiscale si ottiene come detrazione dall'IRPEF in 10 anni."
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
                if (trimmedBlock.startsWith('| Zona') || trimmedBlock.startsWith('| Caratteristica')) {
                    const lines = trimmedBlock.split('\n');
                    const headerLine = lines[0];
                    const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);
                    const rows = lines.slice(2).map(rowLine => rowLine.split('|').map(c => c.trim()).filter(Boolean));
                    return (
                         <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map((header, hIndex) => <th key={hIndex} className="p-2 border text-left font-semibold">{header}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, rIndex) => (
                                        <tr key={rIndex}>
                                            {row.map((cell, cIndex) => <td key={cIndex} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
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


// --- Dati di configurazione del calcolatore (inclusi direttamente) ---
const calculatorData = {
  "slug": "costo-infissi-con-incentivi", "category": "Immobiliare e Casa", "title": "Calcolatore Costo Sostituzione Infissi (con incentivi)", "description": "Ottieni una stima dettagliata del costo per la sostituzione dei tuoi infissi e scopri l'impatto reale degli incentivi fiscali come Ecobonus e Bonus Casa sul tuo investimento.", "lang": "it",
  "inputs": [
    { "id": "numero_finestre", "label": "Numero di finestre da sostituire", "type": "number" as const, "unit": "pz", "min": 0, "step": 1, "tooltip": "Indica il numero di finestre standard (ca. 1,5 mq ciascuna). Escludi le porte-finestre." },
    { "id": "numero_porte_finestre", "label": "Numero di porte-finestre da sostituire", "type": "number" as const, "unit": "pz", "min": 0, "step": 1, "tooltip": "Indica il numero di porte-finestre (ca. 2,5 mq ciascuna)." },
    { "id": "materiale", "label": "Materiale principale degli infissi", "type": "select" as const, "options": ["PVC", "Legno", "Alluminio", "Legno-Alluminio"], "tooltip": "Il materiale è il principale fattore che determina il costo. Il PVC è il più economico, il Legno-Alluminio il più costoso." },
    { "id": "tipo_incentivo", "label": "Tipo di incentivo fiscale", "type": "select" as const, "options": ["Ecobonus 50%", "Bonus Casa 50%", "Nessun Bonus"], "tooltip": "Scegli l'incentivo a cui vuoi accedere. L'Ecobonus è specifico per il risparmio energetico e ha limiti di costo al mq. Il Bonus Casa rientra in una ristrutturazione più ampia." },
    { "id": "zona_climatica", "label": "Zona climatica dell'immobile", "type": "select" as const, "options": ["A, B, C", "D, E, F"], "condition": "tipo_incentivo == 'Ecobonus 50%'", "tooltip": "La tua zona climatica determina il massimale di costo al mq per l'Ecobonus. Puoi trovarla sulla bolletta energetica o sul sito del tuo comune." }
  ],
  "outputs": [
    { "id": "costo_totale_stimato", "label": "Costo Totale Stimato (fornitura e posa)", "unit": "€" },
    { "id": "spesa_ammissibile_detrazione", "label": "Spesa Massima Ammissibile per la Detrazione", "unit": "€" },
    { "id": "importo_detrazione_totale", "label": "Importo Totale della Detrazione Fiscale (in 10 anni)", "unit": "€" },
    { "id": "costo_finale_netto", "label": "Costo Finale Netto per Te", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Sostituzione degli Infissi: Costi, Materiali e Incentivi Fiscali\n\n**Un'analisi approfondita per un investimento consapevole, dal preventivo alla detrazione fiscale.**\n\nLa sostituzione degli infissi è uno degli interventi più efficaci per migliorare il comfort abitativo e l'efficienza energetica di un'abitazione. Tuttavia, il costo può essere significativo. Fortunatamente, gli incentivi fiscali statali permettono di recuperare una parte importante della spesa. \n\nQuesto strumento è progettato per darti una stima realistica dei costi e del risparmio ottenibile, ma va oltre: vuole essere una guida completa per comprendere ogni aspetto della scelta, dalla A alla Z. Le stime sono basate su costi medi di mercato e sui dati normativi vigenti. Per un preventivo esatto, è sempre necessario rivolgersi a un fornitore qualificato.\n\n### **Parte 1: Come Funziona il Calcolatore**\n\nIl nostro calcolatore stima il costo totale del tuo progetto e il beneficio netto che puoi ottenere grazie ai bonus fiscali. Ecco i parametri chiave:\n\n* **Dimensioni**: Per semplicità, usiamo dimensioni standard: **1,5 mq** per una finestra e **2,5 mq** per una porta-finestra. La superficie totale è cruciale per calcolare sia il costo sia i massimali di spesa dell'Ecobonus.\n* **Materiale**: È il fattore che più impatta sul prezzo. Il calcolatore usa un costo medio (€/mq) che include fornitura e posa in opera qualificata.\n* **Incentivo Fiscale**: La tua scelta qui determina il meccanismo di calcolo. L'**Ecobonus** è vincolato a limiti di costo specifici per metro quadro, mentre il **Bonus Casa** ha un massimale di spesa generale più alto e meno vincoli tecnici.\n\n#### **Interpretazione dei Risultati**\n\n* **Costo Totale Stimato**: La spesa che affronteresti senza alcun incentivo.\n* **Spesa Massima Ammissibile**: L'importo effettivo su cui verrà calcolata la detrazione. Con l'Ecobonus, potrebbe essere inferiore al costo totale se questo supera i massimali al mq.\n* **Importo Totale della Detrazione**: Il beneficio fiscale che recupererai in **10 anni** tramite la dichiarazione dei redditi.\n* **Costo Finale Netto**: La cifra che, al termine del percorso decennale di detrazione, avrai effettivamente speso di tasca tua.\n\n### **Parte 2: Guida Approfondita agli Incentivi Fiscali**\n\nLa scelta dell'incentivo corretto è fondamentale. Vediamo le differenze.\n\n#### **1. Ecobonus 50% (per Riqualificazione Energetica)**\n\nÈ il bonus specifico per la sostituzione di infissi, in quanto migliora le prestazioni energetiche dell'edificio.\n\n* **Requisiti**: L'immobile deve essere **esistente e riscaldato**. L'intervento deve configurarsi come **sostituzione** di elementi già presenti. I nuovi infissi devono rispettare precisi valori di **trasmittanza termica (Uw)**, che variano in base alla zona climatica.\n* **Il Doppio Massimale di Spesa**: Questo è il punto più importante da capire.\n    1.  **Massimale Totale**: La spesa massima detraibile per l'intervento è **60.000 €**.\n    2.  **Massimale di Costo al Metro Quadro**: Il costo della sola fornitura degli infissi (esclusi IVA, posa e opere complementari) non può superare dei limiti fissati per legge, che dipendono dalla zona climatica.\n\n| Zona Climatica | Massimale di costo per infissi (€/mq) |\n| :--- | :--- |\n| A, B, C | 550 € |\n| D, E, F | 650 € |\n\nSe il costo dei tuoi infissi supera questo limite, potrai portare in detrazione solo la parte di spesa che rientra nel massimale.\n\n#### **2. Bonus Casa 50% (per Ristrutturazione Edilizia)**\n\nQuesto bonus non è specifico per l'efficienza energetica, ma si applica a un più ampio ventaglio di lavori di ristrutturazione.\n\n* **Requisiti**: La sostituzione degli infissi deve far parte di un intervento di **manutenzione straordinaria, restauro o risanamento conservativo, o ristrutturazione edilizia**. Non è sufficiente la semplice sostituzione se non si compiono altri lavori (es. ridistribuzione di spazi interni, rifacimento impianti).\n* **Vantaggi**: Il massimale di spesa è più alto (**96.000 €** totali per l'intervento di ristrutturazione) e **non ci sono i limiti di costo al mq** né i requisiti di trasmittanza termica previsti per l'Ecobonus.\n\n| Caratteristica | Ecobonus 50% | Bonus Casa 50% |\n| :--- | :--- | :--- |\n| **Scopo** | Riqualificazione energetica | Ristrutturazione edilizia |\n| **Massimale Spesa** | 60.000 € | 96.000 € |\n| **Limiti Tecnici** | Sì (Trasmittanza Uw) | No |\n| **Limiti di Costo** | Sì (Massimali al mq) | No |\n| **Adempimenti** | Comunicazione ENEA | Nessuna comunicazione specifica |\n\n### **Parte 3: Fattori Chiave che Influenzano il Costo**\n\n* **Materiali a Confronto**:\n    * **PVC**: Ottimo isolamento, bassa manutenzione, miglior rapporto qualità/prezzo.\n    * **Legno**: Estetica pregiata, buon isolamento, richiede manutenzione periodica.\n    * **Alluminio (a taglio termico)**: Resistente, durevole, adatto a grandi vetrate. Meno isolante di PVC e legno se non di alta gamma.\n    * **Legno-Alluminio**: Combina i vantaggi di entrambi: calore del legno all'interno e resistenza dell'alluminio all'esterno. È la soluzione più costosa.\n* **Vetro**: Il vetrocamera basso-emissivo è lo standard per l'efficienza. Il triplo vetro è indicato per climi molto rigidi o per un eccellente isolamento acustico.\n* **Posa in Opera**: Una posa non qualificata può vanificare le prestazioni anche del miglior infisso. Affidarsi a installatori certificati è un investimento sulla durabilità e sull'efficienza.\n* **Burocrazia**: Per entrambi i bonus è obbligatorio il pagamento con **bonifico parlante**, che riporti il riferimento normativo, il codice fiscale del beneficiario e la partita IVA del fornitore."
};


const CostoInfissiConIncentiviCalculator: React.FC = () => {
    const { slug, title, description, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        numero_finestre: 4,
        numero_porte_finestre: 2,
        materiale: "PVC",
        tipo_incentivo: "Ecobonus 50%",
        zona_climatica: "D, E, F"
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { numero_finestre, numero_porte_finestre, materiale, tipo_incentivo, zona_climatica } = states;
        
        const costo_map: { [key: string]: number } = { 'PVC': 450, 'Legno': 600, 'Alluminio': 700, 'Legno-Alluminio': 850 };
        const costo_medio_mq_materiale = costo_map[materiale];
        const superficie_totale = (numero_finestre * 1.5) + (numero_porte_finestre * 2.5);
        const costo_totale_stimato = superficie_totale > 0 ? superficie_totale * costo_medio_mq_materiale : 0;
        
        let spesa_ammissibile_detrazione = 0;
        if (tipo_incentivo === 'Ecobonus 50%') {
            const massimale_mq_zona = zona_climatica === 'A, B, C' ? 550 : 650;
            const massimale_spesa_ecobonus = superficie_totale * massimale_mq_zona;
            spesa_ammissibile_detrazione = Math.min(costo_totale_stimato, massimale_spesa_ecobonus, 60000);
        } else if (tipo_incentivo === 'Bonus Casa 50%') {
            spesa_ammissibile_detrazione = Math.min(costo_totale_stimato, 96000);
        }

        const importo_detrazione_totale = spesa_ammissibile_detrazione * 0.5;
        const detrazione_annuale = importo_detrazione_totale / 10;
        const costo_finale_netto = costo_totale_stimato - importo_detrazione_totale;

        return { costo_totale_stimato, spesa_ammissibile_detrazione, importo_detrazione_totale, costo_finale_netto, detrazione_annuale };
    }, [states]);
    
    const chartData = [
      { name: 'Costo', 'Costo Netto a Tuo Carico': calculatedOutputs.costo_finale_netto, 'Incentivo Fiscale': calculatedOutputs.importo_detrazione_totale }
    ];

    const formulaUsata = `Costo Netto = Costo Totale - (MIN(Costo Totale, Massimale Spesa) * 50%)`;

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
            const { detrazione_annuale, ...outputsToSave } = calculatedOutputs;
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
                            <strong>Disclaimer:</strong> Questo strumento fornisce una stima basata su costi medi e dati normativi. Per un preventivo accurato e una consulenza fiscale, rivolgiti a professionisti del settore.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split(' ')[2].replace(/'/g, ''));
                                if (!conditionMet) return null;
                                
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );
                                
                                if (input.type === 'select') {
                                     return (
                                        <div key={input.id}>
                                            {inputLabel}
                                            <select id={input.id} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)}>
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
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Stima</h2>
                             {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'costo_finale_netto' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'costo_finale_netto' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Costo Totale</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Costo Netto a Tuo Carico" stackId="a" fill="#4f46e5" />
                                            <Bar dataKey="Incentivo Fiscale" stackId="a" fill="#a5b4fc" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
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
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/detrazione-riqualificazione-energetica-55" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Guida Ecobonus - Agenzia delle Entrate</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/detrristredil36" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Guida Bonus Ristrutturazioni - Agenzia delle Entrate</a></li>
                             <li><a href="https://www.enea.it/it/efficienza-energetica" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Portale Efficienza Energetica - ENEA</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CostoInfissiConIncentiviCalculator;