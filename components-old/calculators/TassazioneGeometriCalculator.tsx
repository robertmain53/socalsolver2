'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Tassazione Geometri con CIPAG (Forfettario/Ordinario)",
  description: "Simula il calcolo di tasse, IRPEF e contributi CIPAG per geometri con Partita IVA in regime forfettario o ordinario. Stima il tuo netto annuale."
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
          "name": "Come calcola le tasse un geometra in regime forfettario?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Un geometra in regime forfettario calcola il reddito imponibile applicando un coefficiente di redditività del 78% al suo fatturato. Da questo reddito, deduce i contributi CIPAG versati l'anno precedente. Sull'importo rimanente, paga un'imposta sostitutiva del 5% (per i primi 5 anni) o del 15%."
          }
        },
        {
          "@type": "Question",
          "name": "Quali sono i contributi obbligatori per un geometra iscritto a CIPAG?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "I contributi obbligatori sono tre: il contributo soggettivo (18% del reddito professionale, con minimale), il contributo integrativo (5% del fatturato, a carico del cliente, con minimale) e un contributo fisso di maternità."
          }
        },
        {
          "@type": "Question",
          "name": "Questo calcolatore sostituisce un commercialista?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, questo strumento fornisce una stima a scopo puramente informativo. La consulenza di un commercialista è fondamentale per una corretta pianificazione fiscale, la gestione degli adempimenti e l'applicazione di tutte le deduzioni e detrazioni personali."
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
  "slug": "tassazione-geometri", "category": "Fisco e Lavoro Autonomo", "title": "Calcolatore Tassazione per Geometri (con CIPAG)", "lang": "it",
  "inputs": [
    {"id": "fatturato_annuo", "label": "Fatturato Annuo Lordo", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei ricavi o compensi incassati nell'anno, al lordo di IVA e altre spese."},
    {"id": "is_forfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean" as const, "tooltip": "Seleziona questa opzione se aderisci al regime fiscale agevolato. In caso contrario, si assumerà l'applicazione del regime ordinario."},
    {"id": "is_prima_attivita_forfettario", "label": "Sei nei primi 5 anni di attività (Startup)?", "type": "boolean" as const, "condition": "is_forfettario == true", "tooltip": "Se sei in regime forfettario e questa è una nuova attività, puoi beneficiare di un'imposta sostitutiva ridotta al 5% per i primi 5 anni."},
    {"id": "spese_deducibili", "label": "Costi Deducibili Sostenuti", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "is_forfettario == false", "tooltip": "Solo per il regime ordinario: inserisci il totale delle spese documentate e inerenti alla tua attività professionale (es. software, affitto ufficio, materiali)."},
    {"id": "contributi_versati_anno_precedente", "label": "Contributi CIPAG versati l'anno scorso", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il totale dei contributi obbligatori (soggettivo e integrativo) versati alla Cassa Geometri nell'anno precedente, poiché sono deducibili dal reddito imponibile di quest'anno."},
    {"id": "is_giovane", "label": "Benefici per neo-iscritti under 30?", "type": "boolean" as const, "tooltip": "Se sei iscritto alla Cassa da meno di 5 anni e avevi meno di 30 anni all'iscrizione, hai diritto a una riduzione sul contributo soggettivo."},
    {"id": "is_pensionato", "label": "Sei un geometra pensionato e ancora attivo?", "type": "boolean" as const, "tooltip": "I geometri pensionati che continuano a esercitare la professione beneficiano di un'aliquota ridotta per il contributo soggettivo."}
  ],
  "outputs": [
    {"id": "reddito_imponibile_fiscale", "label": "Reddito Imponibile Fiscale", "unit": "€"},
    {"id": "contributo_soggettivo", "label": "CIPAG: Contributo Soggettivo", "unit": "€"},
    {"id": "contributo_integrativo", "label": "CIPAG: Contributo Integrativo (5%)", "unit": "€"},
    {"id": "contributo_maternita", "label": "CIPAG: Contributo Maternità", "unit": "€"},
    {"id": "imposta_dovuta", "label": "Imposta sul Reddito Dovuta (IRPEF/Sostitutiva)", "unit": "€"},
    {"id": "totale_tasse_e_contributi", "label": "Totale Tasse e Contributi", "unit": "€"},
    {"id": "netto_annuale", "label": "Reddito Netto Annuale Stimato", "unit": "€"},
    {"id": "aliquota_effettiva", "label": "Aliquota Effettiva (Tasse/Fatturato)", "unit": "%"}
  ],
  "content": "### **Guida Completa alla Tassazione per Geometri (CIPAG)**\n\n**Analisi dei Regimi Fiscali, Calcolo Contributivo e Ottimizzazione del Carico Fiscale**\n\nLa gestione fiscale e contributiva è un aspetto fondamentale per ogni geometra libero professionista. Comprendere come vengono calcolate le imposte e i contributi previdenziali non solo garantisce la conformità normativa, ma permette anche di pianificare strategicamente la propria attività. \n\nQuesto strumento è progettato per offrire una **stima chiara e dettagliata** del carico fiscale e contributivo per i geometri iscritti alla CIPAG (Cassa Italiana di Previdenza e Assistenza Geometri). L'analisi si basa sui due principali regimi fiscali: l'Ordinario e il Forfettario.\n\n**Disclaimer**: I risultati forniti da questo calcolatore sono una simulazione a scopo puramente informativo. Non possono sostituire una consulenza professionale personalizzata da parte di un commercialista, che rimane essenziale per una corretta gestione fiscale. Le aliquote e i valori minimi sono aggiornati alle normative più recenti disponibili.\n\n### **Parte 1: Regime Forfettario vs. Regime Ordinario: Quale Scegliere?**\n\nLa scelta del regime fiscale è la decisione più impattante sulla tassazione di un geometra. Vediamo le differenze chiave.\n\n| Caratteristica | Regime Forfettario | Regime Ordinario |\n| :--- | :--- | :--- |\n| **Determinazione Reddito** | Fatturato x **78%** (coefficiente di redditività) | Fatturato - Costi Deducibili Analitici |\n| **Tassazione** | Imposta Sostitutiva: **5%** (startup) o **15%** | IRPEF progressiva a scaglioni (23%, 35%, 43%) |\n| **IVA** | Non si applica in fattura (esente) | Si applica in fattura e si versa allo Stato |\n| **Costi Deducibili** | Deducibilità forfettaria del 22%. Si deducono solo i contributi previdenziali versati. | Si deducono tutti i costi inerenti all'attività (software, ufficio, auto, etc.) |\n| **Adatto a...** | Professionisti a inizio attività o con bassi costi di gestione. | Professionisti con costi significativi o fatturati elevati (superiori a 85.000 €). |\n\n### **Parte 2: La Contribuzione CIPAG: Come Funziona**\n\nL'iscrizione alla CIPAG è obbligatoria per i geometri liberi professionisti. La contribuzione si basa su tre pilastri fondamentali:\n\n1.  **Contributo Soggettivo**: È il contributo principale ai fini pensionistici. \n    * **Aliquota Standard**: **18%** del reddito professionale imponibile.\n    * **Aliquota Ridotta**: **9%** per neo-iscritti under 30 (per i primi 5 anni) e per i pensionati attivi.\n    * **Minimale**: Esiste un contributo minimo da versare (circa 2.430 €), indipendentemente dal reddito prodotto. I neo-iscritti beneficiano di una riduzione del 50% sul minimale.\n\n2.  **Contributo Integrativo**: È un contributo di solidarietà, a carico del cliente. \n    * **Aliquota**: **5%** del fatturato lordo, da addebitare in fattura al cliente.\n    * **Minimale**: Anche qui è previsto un versamento minimo (circa 1.215 €). I neo-iscritti beneficiano di una riduzione del 50%.\n    * **Deducibilità**: A differenza del soggettivo, il contributo integrativo versato non è deducibile dal reddito del professionista.\n\n3.  **Contributo di Maternità**: Un importo fisso (attualmente 60 €) che tutti gli iscritti devono versare per sostenere le indennità di maternità delle colleghe.\n\n### **Parte 3: Logica di Calcolo Dettagliata**\n\nIl calcolatore segue questi passaggi logici:\n\n1.  **Calcolo del Reddito Lordo**: \n    * _Forfettario_: Si applica il coefficiente del 78% al fatturato annuo.\n    * _Ordinario_: Si sottraggono i costi deducibili documentati dal fatturato.\n\n2.  **Calcolo Contributi CIPAG**: Vengono calcolati i contributi soggettivo e integrativo sulla base del reddito e del fatturato, applicando le aliquote e i minimali corretti (con eventuali riduzioni).\n\n3.  **Calcolo del Reddito Imponibile Fiscale**: Dal reddito lordo calcolato al punto 1, si sottraggono i **contributi previdenziali obbligatori versati nell'anno precedente**. Questo è un punto chiave: la deduzione avviene per cassa.\n\n4.  **Calcolo dell'Imposta**: \n    * _Forfettario_: Si applica l'aliquota del 5% o 15% al reddito imponibile fiscale.\n    * _Ordinario_: Si calcola l'IRPEF utilizzando gli scaglioni progressivi sul reddito imponibile fiscale.\n\n#### **Scaglioni IRPEF (riferimento 2024/2025)**\n\n* Fino a 28.000 €: **23%**\n* Da 28.001 € a 50.000 €: **35%**\n* Oltre 50.000 €: **43%**"
};


const TassazioneGeometriCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturato_annuo: 50000,
        is_forfettario: true,
        is_prima_attivita_forfettario: true,
        spese_deducibili: 8000,
        contributi_versati_anno_precedente: 4500,
        is_giovane: true,
        is_pensionato: false
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, is_forfettario, spese_deducibili, contributi_versati_anno_precedente, is_giovane, is_pensionato, is_prima_attivita_forfettario } = states;

        const COEFFICIENTE_REDDITIVITA = 0.78;
        const MINIMO_SOGGETTIVO_CIPAG = 2430;
        const MINIMO_INTEGRATIVO_CIPAG = 1215;
        const CONTRIBUTO_FISSO_MATERNITA = 60;

        const reddito_lordo_imponibile = is_forfettario ? fatturato_annuo * COEFFICIENTE_REDDITIVITA : Math.max(0, fatturato_annuo - spese_deducibili);
        const aliquota_soggettivo = is_giovane || is_pensionato ? 0.09 : 0.18;
        const minimale_soggettivo_applicato = MINIMO_SOGGETTIVO_CIPAG * (is_giovane ? 0.5 : 1);
        const contributo_soggettivo = Math.max(reddito_lordo_imponibile * aliquota_soggettivo, minimale_soggettivo_applicato);
        
        const minimale_integrativo_applicato = MINIMO_INTEGRATIVO_CIPAG * (is_giovane ? 0.5 : 1);
        const contributo_integrativo = Math.max(fatturato_annuo * 0.05, minimale_integrativo_applicato);
        
        const contributo_maternita = CONTRIBUTO_FISSO_MATERNITA;
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
        
        const totale_contributi = contributo_soggettivo + contributo_integrativo + contributo_maternita;
        const totale_tasse_e_contributi = totale_contributi + imposta_dovuta;
        const netto_annuale = fatturato_annuo - totale_tasse_e_contributi;
        const aliquota_effettiva = fatturato_annuo > 0 ? (totale_tasse_e_contributi / fatturato_annuo) * 100 : 0;
        
        return {
            reddito_imponibile_fiscale, contributo_soggettivo, contributo_integrativo, contributo_maternita,
            imposta_dovuta, totale_tasse_e_contributi, netto_annuale, aliquota_effettiva
        };
    }, [states]);

    const chartData = [
        {
            name: 'Composizione Fatturato',
            'Netto Stimato': Math.max(0, calculatedOutputs.netto_annuale),
            'Imposta (IRPEF/Sost.)': Math.max(0, calculatedOutputs.imposta_dovuta),
            'Contributi CIPAG': Math.max(0, calculatedOutputs.totale_tasse_e_contributi - calculatedOutputs.imposta_dovuta)
        }
    ];

    const formulaUsata = states.is_forfettario
        ? `Reddito Lordo = Fatturato * 78%; Imposta = (Reddito Lordo - Contributi Versati) * ${states.is_prima_attivita_forfettario ? '5%' : '15%'}`
        : `Reddito Lordo = Fatturato - Spese; Imposta = Calcolo IRPEF(Reddito Lordo - Contributi Versati)`;

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
                        <p className="text-gray-600 mb-4">Stima il tuo carico fiscale e contributivo in regime forfettario o ordinario.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza professionale.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]) || (input.condition.includes('== false') && !states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-1 flex items-center gap-3 p-2 rounded-md bg-white border">
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
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'netto_annuale' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'netto_annuale' ? 'text-green-600' : 'text-gray-800'}`}>
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
                                        <Bar dataKey="Imposta (IRPEF/Sost.)" stackId="a" fill="#ef4444" />
                                        <Bar dataKey="Contributi CIPAG" stackId="a" fill="#3b82f6" />
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
                            <li><a href="https://www.cassageometri.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">CIPAG - Cassa Geometri</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/iva-e-fatturazione/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                            <li><a href="https://www.normattiva.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Normattiva - Il portale della legge vigente</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneGeometriCalculator;