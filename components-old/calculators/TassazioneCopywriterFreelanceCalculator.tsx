'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Tasse per Copywriter Freelance (Forfettario/Ordinario)",
  description: "Simula il calcolo di tasse, IRPEF e contributi INPS per copywriter con Partita IVA. Scopri il tuo netto annuale e mensile in pochi click."
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
          "name": "Quanto paga di tasse un copywriter in regime forfettario?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Un copywriter in regime forfettario paga un'imposta sostitutiva del 5% (per i primi 5 anni di attività) o del 15% sul 78% del suo fatturato, a cui vengono sottratti i contributi INPS versati l'anno precedente. A questo si aggiungono i contributi INPS (circa 26,07%) calcolati sul 78% del fatturato dell'anno in corso."
          }
        },
        {
          "@type": "Question",
          "name": "Quali contributi paga un copywriter freelance?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Un copywriter freelance, non avendo una cassa professionale dedicata, è obbligato a iscriversi alla Gestione Separata INPS. L'aliquota è circa del 26,07% sul reddito imponibile, senza minimali fissi."
          }
        },
        {
          "@type": "Question",
          "name": "Quando conviene il regime ordinario a un copywriter?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Il regime ordinario conviene quando i costi deducibili reali superano il 22% del fatturato (la percentuale di costi forfettizzata nel regime forfettario), oppure quando il fatturato annuo supera stabilmente la soglia degli 85.000 euro."
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
                if (block.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/### \*\*|\*\*/g, '')) }} />;
                if (block.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/#### \*\*|\*\*/g, '')) }} />;
                 if (block.startsWith('| Caratteristica |')) {
                    const rows = block.split('\n').slice(2);
                    const headers = block.split('\n')[0].split('|').slice(1, -1).map(h => h.trim());
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map((h, i) => <th key={i} className="p-2 border text-left">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i}>{row.split('|').slice(1, -1).map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell.trim()) }} />)}</tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (block.match(/^\d\.\s/)) {
                    const items = block.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                    return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
                }
                if (block.startsWith('*')) {
                    const items = block.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (block) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block) }} />;
                return null;
            })}
        </div>
    );
};


// --- Dati di configurazione del calcolatore (dal file JSON) ---
const calculatorData = {
  "slug": "tassazione-copywriter-freelance", "category": "Fisco e Lavoro Autonomo", "title": "Calcolatore Tassazione per Copywriter Freelance", "lang": "it",
  "inputs": [
    {"id": "fatturato_annuo", "label": "Fatturato Annuo Lordo", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei compensi incassati nell'anno, al lordo di qualsiasi spesa o imposta. È la base di partenza per ogni calcolo."},
    {"id": "is_forfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean" as const, "tooltip": "Seleziona questa opzione se aderisci al regime fiscale agevolato. In caso contrario, si assumerà l'applicazione del regime ordinario semplificato."},
    {"id": "is_prima_attivita_forfettario", "label": "Sei nei primi 5 anni di attività (Startup)?", "type": "boolean" as const, "condition": "is_forfettario == true", "tooltip": "Se sei in regime forfettario e hai avviato una nuova attività, puoi beneficiare dell'imposta sostitutiva ridotta al 5% per i primi 5 anni."},
    {"id": "spese_deducibili", "label": "Costi Deducibili Sostenuti", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "is_forfettario == false", "tooltip": "Solo per il regime ordinario: inserisci il totale delle spese documentate e inerenti alla tua attività (es. software, formazione, computer, marketing)."},
    {"id": "contributi_versati_anno_precedente", "label": "Contributi INPS versati l'anno scorso", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il totale dei contributi obbligatori versati alla Gestione Separata INPS nell'anno precedente (principio di cassa). Sono deducibili dal reddito imponibile di quest'anno."}
  ],
  "outputs": [
    {"id": "reddito_imponibile_fiscale", "label": "Reddito Imponibile Fiscale", "unit": "€"},
    {"id": "contributi_inps", "label": "Contributi INPS Gestione Separata", "unit": "€"},
    {"id": "imposta_dovuta", "label": "Imposta sul Reddito Dovuta (IRPEF/Sostitutiva)", "unit": "€"},
    {"id": "totale_tasse_e_contributi", "label": "Totale Tasse e Contributi", "unit": "€"},
    {"id": "netto_annuale", "label": "Reddito Netto Annuale Stimato", "unit": "€"},
    {"id": "netto_mensile", "label": "Reddito Netto Mensile Stimato", "unit": "€"},
    {"id": "aliquota_effettiva", "label": "Aliquota Effettiva (Tasse/Fatturato)", "unit": "%"}
  ],
  "content": "### **Guida Definitiva alla Tassazione per Copywriter Freelance**\n\n**Dal Regime Fiscale alla Gestione INPS: Tutto Quello che Devi Sapere per Ottimizzare il Tuo Guadagno**\n\nSe sei un copywriter freelance, padroneggiare i numeri della tua attività è tanto importante quanto creare testi persuasivi. Capire come funziona la tassazione, quale regime fiscale adottare e come si calcolano i contributi previdenziali è la chiave per una carriera sostenibile e senza sorprese.\n\nQuesto calcolatore interattivo è stato creato per darti una **stima precisa e trasparente** del tuo carico fiscale e contributivo. Ti guiderà attraverso le complessità del sistema italiano, permettendoti di confrontare scenari diversi e pianificare con consapevolezza.\n\n**Disclaimer**: Questo strumento è un simulatore e fornisce stime a scopo puramente informativo. Le normative fiscali possono cambiare. La consulenza di un commercialista qualificato è imprescindibile per la gestione accurata della tua posizione fiscale e contributiva.\n\n### **Parte 1: Inquadramento e Contributi - La Gestione Separata INPS**\n\nPrima di parlare di tasse, parliamo di previdenza. Un copywriter freelance, non avendo un albo professionale con una cassa dedicata, ha l'obbligo di iscriversi alla **Gestione Separata dell'INPS**.\n\n* **Come funziona?**: È un fondo pensionistico per i professionisti senza cassa (come te!).\n* **Quanto si versa?**: L'aliquota per i professionisti non iscritti ad altre forme di previdenza obbligatoria è del **26,07%** (aliquota di riferimento per il 2024/2025). Questa percentuale si applica sul tuo reddito lordo imponibile.\n* **C'è un minimale?**: A differenza di artigiani e commercianti, **non ci sono contributi minimi fissi**. Versi in proporzione a quanto guadagni. Se un anno non fatturi, non versi nulla.\n* **Massimale**: Esiste un tetto massimo di reddito (circa 119.650 €) oltre il quale non si versano più contributi.\n\n### **Parte 2: Regime Forfettario vs. Ordinario - La Scelta Cruciale**\n\nLa decisione più importante per un copywriter freelance è la scelta del regime fiscale. Ecco un confronto diretto.\n\n| Caratteristica | Regime Forfettario | Regime Ordinario Semplificato |\n| :--- | :--- | :--- |\n| **Determinazione Reddito** | Fatturato x **78%** (coefficiente di redditività) | Fatturato Lordo - Costi Analitici Deducibili |\n| **Tassazione** | Imposta Sostitutiva: **5%** (startup, 5 anni) o **15%** | IRPEF progressiva a scaglioni (23%, 35%, 43%) |\n| **Limite Fatturato** | **85.000 €** annui | Nessun limite specifico (fino a 500.000 € per servizi) |\n| **IVA** | Non si applica in fattura (esente) | Si applica in fattura, si liquida e si versa allo Stato |\n| **Costi Deducibili** | I costi sono forfettizzati al 22%. Si possono dedurre **solo** i contributi INPS versati nell'anno precedente. | Si deducono tutti i costi documentati inerenti all'attività (software, formazione, marketing, etc.) |\n| **Ideale per...** | Chi inizia, ha costi contenuti e vuole la massima semplicità gestionale. | Chi ha spese elevate, fatturati superiori al limite forfettario, o vuole fare investimenti significativi nell'attività. |"
};


const TassazioneCopywriterFreelanceCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturato_annuo: 35000,
        is_forfettario: true,
        is_prima_attivita_forfettario: true,
        spese_deducibili: 4000,
        contributi_versati_anno_precedente: 3000
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, is_forfettario, spese_deducibili, contributi_versati_anno_precedente, is_prima_attivita_forfettario } = states;
        
        const COEFFICIENTE_REDDITIVITA = 0.78;
        const ALIQUOTA_INPS_GS = 0.2607;
        const MASSIMALE_INPS = 119650;

        const reddito_lordo_imponibile = is_forfettario ? fatturato_annuo * COEFFICIENTE_REDDITIVITA : Math.max(0, fatturato_annuo - spese_deducibili);
        const reddito_imponibile_inps = Math.min(reddito_lordo_imponibile, MASSIMALE_INPS);
        const contributi_inps = reddito_imponibile_inps * ALIQUOTA_INPS_GS;
        const reddito_imponibile_fiscale = Math.max(0, reddito_lordo_imponibile - contributi_versati_anno_precedente);

        let imposta_dovuta = 0;
        if (is_forfettario) {
            imposta_dovuta = reddito_imponibile_fiscale * (is_prima_attivita_forfettario ? 0.05 : 0.15);
        } else {
            if (reddito_imponibile_fiscale <= 28000) {
                imposta_dovuta = reddito_imponibile_fiscale * 0.23;
            } else if (reddito_imponibile_fiscale <= 50000) {
                imposta_dovuta = 6440 + (reddito_imponibile_fiscale - 28000) * 0.35;
            } else {
                imposta_dovuta = 14140 + (reddito_imponibile_fiscale - 50000) * 0.43;
            }
        }
        
        const totale_tasse_e_contributi = contributi_inps + imposta_dovuta;
        const netto_annuale = fatturato_annuo - totale_tasse_e_contributi;
        const netto_mensile = netto_annuale / 12;
        const aliquota_effettiva = fatturato_annuo > 0 ? (totale_tasse_e_contributi / fatturato_annuo) * 100 : 0;

        return { reddito_imponibile_fiscale, contributi_inps, imposta_dovuta, totale_tasse_e_contributi, netto_annuale, netto_mensile, aliquota_effettiva };
    }, [states]);

    const chartData = [
        { name: 'Ripartizione Fatturato', 'Netto Stimato': Math.max(0, calculatedOutputs.netto_annuale), 'Imposta Dovuta': Math.max(0, calculatedOutputs.imposta_dovuta), 'Contributi INPS': Math.max(0, calculatedOutputs.contributi_inps) }
    ];

    const formulaUsata = states.is_forfettario
        ? `Imponibile = (Fatturato * 78%) - Contributi Versati; Imposta = Imponibile * ${states.is_prima_attivita_forfettario ? '5%' : '15%'}`
        : `Imponibile = (Fatturato - Spese) - Contributi Versati; Imposta = Calcolo IRPEF(Imponibile)`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            const element = calcolatoreRef.current;
            if (!element) return;
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6" ref={calcolatoreRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula il tuo carico fiscale e contributivo e scopri il tuo netto reale come copywriter freelance.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore offre una stima a scopo puramente informativo e non sostituisce la consulenza di un commercialista.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]) || (input.condition.includes('== false') && !states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                            </label>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'netto_annuale' ? 'bg-green-50 border-green-500' : (output.id === 'netto_mensile' ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300')}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'netto_annuale' ? 'text-green-600' : (output.id === 'netto_mensile' ? 'text-blue-600' : 'text-gray-800')}`}>
                                        <span>{isClient ? (output.unit === '%' ? formatPercent((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato</h3>
                            <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                               {isClient && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" hide />
                                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="Netto Stimato" stackId="a" fill="#22c55e" />
                                        <Bar dataKey="Imposta Dovuta" stackId="a" fill="#ef4444" />
                                        <Bar dataKey="Contributi INPS" stackId="a" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                               )}
                            </div>
                        </div>

                         <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetizzata</h3>
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                         </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 text-red-700 rounded-md px-3 py-2 hover:bg-red-100 transition-colors">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Istituto Nazionale Previdenza Sociale</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate</a></li>
                            <li><a href="https://www.normattiva.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Normattiva - Il portale della legge vigente</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneCopywriterFreelanceCalculator;