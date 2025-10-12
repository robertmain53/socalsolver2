'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Contributi Gestione Separata INPS vs. Cassa Professionale",
  description: "Simula e confronta l'onere contributivo tra Gestione Separata INPS e Cassa di categoria per liberi professionisti. Ottimizza la tua scelta previdenziale."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 inline-block ml-1">
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
            "name": "Chi deve iscriversi alla Gestione Separata INPS?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Devono iscriversi i liberi professionisti che non hanno una Cassa di previdenza di categoria specifica (es. consulenti, designer, freelance digitali), oltre a collaboratori coordinati e continuativi e altre figure di lavoratori autonomi."
            }
          },
          {
            "@type": "Question",
            "name": "Posso scegliere tra Cassa Professionale e Gestione Separata?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, la scelta non è libera. Se la tua professione è regolamentata da un Albo che prevede una Cassa di previdenza autonoma (es. Inarcassa per ingegneri/architetti), l'iscrizione a tale Cassa è obbligatoria. La Gestione Separata è residuale, per chi non ha una Cassa di riferimento."
            }
          },
          {
            "@type": "Question",
            "name": "Qual è il vantaggio principale di una Cassa Professionale?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Generalmente, le Casse Professionali offrono aliquote contributive soggettive più basse rispetto alla Gestione Separata INPS. Inoltre, forniscono prestazioni di welfare integrativo (sussidi, assicurazioni) e prospettive pensionistiche tendenzialmente migliori."
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
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore (dal JSON) ---
const calculatorData = { "slug": "contributi-gestione", "category": "Fisco e Lavoro Autonomo", "title": "Calcolatore Contributi Gestione Separata INPS vs. Cassa Professionale (es. Inarcassa, CNPADC)", "lang": "it", "inputs": [{ "id": "reddito_professionale_netto", "label": "Reddito Professionale Netto", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Inserisci il tuo reddito imponibile netto, ovvero il totale dei ricavi meno i costi deducibili. Per il regime forfettario, è il fatturato moltiplicato per il coefficiente di redditività." }, { "id": "is_altra_previdenza", "label": "Hai un'altra copertura previdenziale obbligatoria?", "type": "boolean" as const, "tooltip": "Spunta questa casella se sei anche un lavoratore dipendente o un pensionato. Questo riduce l'aliquota dovuta alla Gestione Separata INPS." }, { "id": "cassa_aliquota_soggettiva", "label": "Aliquota Contributo Soggettivo Cassa (%)", "type": "number" as const, "unit": "%", "min": 0, "step": 0.5, "tooltip": "L'aliquota percentuale che la tua Cassa applica sul reddito netto per il calcolo del contributo soggettivo (es. 14,5% per Inarcassa)." }, { "id": "cassa_minimale_soggettivo", "label": "Minimale Contributo Soggettivo Cassa", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "L'importo minimo del contributo soggettivo che devi versare annualmente alla tua Cassa, indipendentemente dal reddito." }, { "id": "cassa_maternita", "label": "Contributo Maternità/Paternità Cassa", "type": "number" as const, "unit": "€", "min": 0, "step": 1, "tooltip": "L'importo fisso annuale richiesto dalla tua Cassa a titolo di contributo di maternità/paternità." }], "outputs": [{ "id": "contributi_gestione_separata", "label": "Totale Contributi Gestione Separata INPS", "unit": "€" }, { "id": "contributi_cassa_professionale", "label": "Totale Contributi Cassa Professionale", "unit": "€" }, { "id": "differenza", "label": "Risparmio/Maggior Costo con Cassa", "unit": "€" }], "formulaSteps": [{ "id": "constants", "expr": "Definizione Costanti 2024/2025: Aliquota GS Piena = 26.07%, Aliquota GS Ridotta = 24%, Massimale GS = 119650€, Minimale Reddito GS = 18415€" }, { "id": "calcolo_gs", "expr": "Contributo Lordo GS = MIN(Reddito, Massimale GS) * Aliquota GS (piena o ridotta). Contributo Minimo GS = Minimale Reddito GS * Aliquota GS Piena. Contributi GS Finali = Reddito > 0 ? MAX(Contributo Lordo GS, Contributo Minimo GS) : 0" }, { "id": "calcolo_cassa", "expr": "Contributo Soggettivo Cassa = MAX(Reddito * Aliquota Cassa, Minimale Cassa). Contributi Cassa Finali = Contributo Soggettivo Cassa + Contributo Maternità" }, { "id": "differenza", "expr": "Differenza = Contributi GS - Contributi Cassa" }], "examples": [{ "inputs": { "reddito_professionale_netto": 50000, "is_altra_previdenza": false, "cassa_aliquota_soggettiva": 14.5, "cassa_minimale_soggettivo": 2695, "cassa_maternita": 66 }, "outputs": { "contributi_gestione_separata": 13035, "contributi_cassa_professionale": 7316, "differenza": 5719 } }], "tags": "contributi inps, gestione separata, cassa professionale, inarcassa, cnpadc, partita iva, regime forfettario, calcolo tasse, libero professionista, previdenza", "content": "### **Guida Completa: Gestione Separata INPS vs. Cassa Professionale**\n\n**Analisi Comparativa dei Regimi Previdenziali per Liberi Professionisti**\n\nLa scelta del regime previdenziale è una delle decisioni più strategiche per un libero professionista in Italia. Coinvolge non solo l'onere contributivo attuale, ma anche la qualità della futura pensione e delle tutele assistenziali. Questo strumento è progettato per confrontare in modo chiaro e trasparente i due percorsi principali: l'iscrizione alla **Gestione Separata INPS** e l'adesione a una **Cassa Professionale** di categoria (come Inarcassa per ingegneri e architetti, o CNPADC per dottori commercialisti).\n\nL'obiettivo è fornire una stima accurata dei costi e mettere in luce le differenze sostanziali, per aiutare professionisti e consulenti a prendere decisioni informate. **Ricorda: questo calcolatore è uno strumento di simulazione e non sostituisce la consulenza di un commercialista o di un consulente del lavoro.**\n\n### **Parte 1: Il Calcolatore - Logica di Funzionamento**\n\nIl nostro calcolatore confronta l'onere contributivo totale partendo da un unico dato fondamentale: il **Reddito Professionale Netto**. Da qui, applica le regole specifiche di ciascun regime.\n\n#### **Parametri Chiave del Calcolo**\n\n* **Reddito Professionale Netto**: È la base imponibile su cui vengono calcolati i contributi. Per i professionisti in regime ordinario, corrisponde ai ricavi meno i costi deducibili. Per chi adotta il **regime forfettario**, si ottiene applicando il coefficiente di redditività al fatturato annuo.\n* **Copertura Previdenziale Aggiuntiva**: La presenza di un'altra forma di previdenza obbligatoria (es. lavoro dipendente) riduce significativamente l'aliquota della Gestione Separata INPS, rendendola più vantaggiosa.\n* **Parametri della Cassa**: Ogni Cassa ha le sue regole. Le variabili chiave sono:\n    * **Aliquota Soggettiva**: La percentuale principale applicata al reddito per il calcolo dei contributi pensionistici.\n    * **Minimale Soggettivo**: Una soglia minima di contributo da versare, anche in caso di reddito basso o nullo. Questo è un punto di divergenza cruciale rispetto alla Gestione Separata, che (per i professionisti) è puramente proporzionale al reddito prodotto (pur con un minimale per l'accredito dell'annualità).\n    * **Contributo di Maternità/Paternità**: Un importo fisso annuale per finanziare le relative indennità.\n\n### **Parte 2: Analisi Approfondita dei Regimi**\n\n#### **La Gestione Separata INPS**\n\nNata per includere categorie di lavoratori autonomi sprovvisti di una Cassa specifica (i cosiddetti \"professionisti senza Cassa\"), è caratterizzata da flessibilità ma anche da aliquote elevate.\n\n* **Chi si iscrive?** Consulenti, freelance, amministratori di società e tutti i professionisti le cui attività non prevedono un Albo con Cassa autonoma.\n* **Come funziona?** Si basa su un calcolo puramente proporzionale al reddito. Non produci reddito? Non versi contributi (ma non maturi anzianità contributiva). Per ottenere l'accredito di un intero anno contributivo è necessario versare un importo almeno pari al contributo calcolato sul **reddito minimale** (stabilito annualmente dall'INPS).\n* **Aliquote (dati indicativi 2024)**:\n    * **Aliquota Piena**: **26,07%** per i professionisti non iscritti ad altre forme di previdenza.\n    * **Aliquota Ridotta**: **24%** per i professionisti già coperti da altra previdenza (es. dipendenti part-time) o pensionati.\n* **Massimale**: Esiste un tetto massimo di reddito (€119.650 per il 2024) oltre il quale non sono più dovuti contributi.\n\n**Vantaggi**: Flessibilità (paghi in base a quanto guadagni), nessun minimale obbligatorio per redditi bassi.\n**Svantaggi**: Aliquota molto elevata, tutele e pensione futura potenzialmente inferiori rispetto a una Cassa di categoria.\n\n#### **Le Casse Professionali (es. Inarcassa)**\n\nSono enti di diritto privato che gestiscono la previdenza e l'assistenza per specifiche categorie di professionisti iscritti a un Albo (ingegneri, architetti, avvocati, medici, etc.).\n\n* **Come funziona?** Si basano su un sistema a capitalizzazione e ripartizione. Prevedono diversi tipi di contributi:\n    * **Contributo Soggettivo**: È il contributo pensionistico vero e proprio, calcolato in percentuale sul reddito netto. È sempre previsto un **minimale** da versare.\n    * **Contributo Integrativo**: Una percentuale (solitamente il 4% o 5%) che il professionista addebita in fattura al cliente e poi riversa alla Cassa. Non rappresenta un costo diretto per il professionista, ma contribuisce al montante pensionistico.\n    * **Contributo di Maternità/Paternità**: Un importo fisso annuo.\n\n**Vantaggi**: Aliquote soggettive più basse della Gestione Separata, pensioni tendenzialmente più elevate, maggiori tutele e servizi di welfare (sussidi, borse di studio, assicurazioni sanitarie).\n**Svantaggi**: Obbligo di versare un contributo minimale anche con reddito zero, che può essere oneroso in fase di avvio dell'attività.\n\n### **Parte 3: Criteri di Scelta e Aspetti Fiscali**\n\nLa scelta dipende da molti fattori: il livello di reddito previsto, la stabilità dell'attività e la propensione al rischio.\n\n* **Redditi Bassi/Instabili**: La Gestione Separata può risultare meno onerosa, non avendo un minimale soggettivo fisso da migliaia di euro.\n* **Redditi Medio/Alti e Stabili**: Una Cassa professionale è quasi sempre più vantaggiosa. A fronte di un contributo totale spesso inferiore, offre una migliore prospettiva pensionistica e maggiori tutele.\n\n#### **Trattamento Fiscale**\n\nUn punto fondamentale accomuna entrambi i regimi: **i contributi previdenziali obbligatori sono interamente deducibili dal reddito complessivo**. Questo significa che abbattono la base imponibile su cui si calcola l'IRPEF, generando un significativo risparmio fiscale." };

const ContributiGestioneCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, formulaSteps } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        reddito_professionale_netto: 45000,
        is_altra_previdenza: false,
        cassa_aliquota_soggettiva: 14.5,
        cassa_minimale_soggettivo: 2695,
        cassa_maternita: 66
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { reddito_professionale_netto, is_altra_previdenza, cassa_aliquota_soggettiva, cassa_minimale_soggettivo, cassa_maternita } = states;
        
        // Costanti INPS (indicative 2024)
        const ALIQUOTA_GS_PIENA = 0.2607;
        const ALIQUOTA_GS_RIDOTTA = 0.24;
        const MASSIMALE_GS = 119650;
        const MINIMALE_REDDITO_GS = 18415;

        // Calcolo Gestione Separata INPS
        const aliquotaGS = is_altra_previdenza ? ALIQUOTA_GS_RIDOTTA : ALIQUOTA_GS_PIENA;
        const redditoMassimale = Math.min(reddito_professionale_netto, MASSIMALE_GS);
        const contributoLordoGS = redditoMassimale * aliquotaGS;
        const contributoMinimoGS = MINIMALE_REDDITO_GS * ALIQUOTA_GS_PIENA; // Il minimale si calcola sempre su aliquota piena
        const contributi_gestione_separata = reddito_professionale_netto > 0 ? Math.max(contributoLordoGS, contributoMinimoGS) : 0;
        
        // Calcolo Cassa Professionale
        const contributoSoggettivoCalcolato = reddito_professionale_netto * (cassa_aliquota_soggettiva / 100);
        const contributoSoggettivo = Math.max(contributoSoggettivoCalcolato, cassa_minimale_soggettivo);
        const contributi_cassa_professionale = contributoSoggettivo + cassa_maternita;
        
        const differenza = contributi_gestione_separata - contributi_cassa_professionale;

        return {
            contributi_gestione_separata,
            contributi_cassa_professionale,
            differenza,
        };
    }, [states]);

    const chartData = [
        { name: 'Gestione Separata', value: calculatedOutputs.contributi_gestione_separata, fill: '#6366f1' },
        { name: 'Cassa Professionale', value: calculatedOutputs.contributi_cassa_professionale, fill: '#22c55e' },
    ];
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

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
        } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const saveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2" ref={calculatorRef}>
                    <div className=" -lg -md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula e confronta l'onere contributivo tra i due principali regimi previdenziali per professionisti.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce la consulenza di un professionista. Le aliquote e i parametri sono basati su dati aggiornati ma potrebbero subire variazioni.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={input.id}>
                                       {input.label}
                                       {input.tooltip && <Tooltip text={input.tooltip}><InfoIcon /></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            {inputLabel}
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
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg 
                                    ${output.id === 'contributi_gestione_separata' ? 'bg-indigo-50 border-indigo-500' : ''}
                                    ${output.id === 'contributi_cassa_professionale' ? 'bg-green-50 border-green-500' : ''}
                                    ${output.id === 'differenza' ? 'bg-gray-50 border-gray-300' : ''}
                                `}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold 
                                        ${output.id === 'contributi_gestione_separata' ? 'text-indigo-600' : ''}
                                        ${output.id === 'contributi_cassa_professionale' ? 'text-green-600' : ''}
                                        ${output.id === 'differenza' ? (calculatedOutputs.differenza > 0 ? 'text-red-600' : 'text-green-600') : ''}
                                    `}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Visivo dei Contributi</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Bar dataKey="value" name="Contributi Totali" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                            <h3 className="font-semibold text-gray-700">Logica di Calcolo Utilizzata</h3>
                            <ul className="text-xs text-gray-600 mt-2 p-3 bg-gray-50 rounded space-y-1 font-mono">
                                {formulaSteps.map(step => <li key={step.id}><strong>{step.id}:</strong> {step.expr}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={saveResult} className="text-sm w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                            <button onClick={handleExportPDF} className="text-sm w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-300 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Campi</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida e Approfondimenti</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-tematiche.gestione-separata-tutti-i-contributi-dovuti.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Separata</a></li>
                            <li><a href="https://www.inarcassa.it/site/home/contributi.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Inarcassa - Guida ai Contributi</a></li>
                            <li><a href="https://www.cnpadc.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">CNPADC - Cassa Dottori Commercialisti</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default ContributiGestioneCalculator;