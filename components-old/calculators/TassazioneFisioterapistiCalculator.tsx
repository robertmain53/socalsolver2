'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Tassazione Fisioterapisti in Partita IVA | Forfettario & Ordinario",
  description: "Stima il tuo guadagno netto annuale e mensile come fisioterapista in regime forfettario o ordinario. Calcola tasse (IRPEF/sostitutiva) e contributi INPS in modo semplice e veloce."
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
            "name": "Quanto paga di tasse un fisioterapista in regime forfettario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Un fisioterapista in regime forfettario paga un'imposta sostitutiva del 5% (per i primi 5 anni) o del 15% sul 78% del fatturato, dopo aver dedotto i contributi INPS versati. Non paga IRPEF e non applica l'IVA."
            }
          },
          {
            "@type": "Question",
            "name": "Qual è il codice ATECO per un fisioterapista?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il codice ATECO per l'attività di fisioterapia è 86.90.21. A questo codice è associato un coefficiente di redditività del 78%, utilizzato per calcolare il reddito imponibile nel regime forfettario."
            }
          },
          {
            "@type": "Question",
            "name": "Un fisioterapista deve iscriversi all'INPS?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, il fisioterapista libero professionista che non ha una cassa di previdenza di categoria deve obbligatoriamente iscriversi alla Gestione Separata INPS per versare i contributi pensionistici."
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
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                if (trimmedBlock.startsWith('Regime Fiscale**')) {
                    const rows = trimmedBlock.split('\n');
                    const headers = rows[0].split('**').filter(h => h);
                    const bodyRows = rows.slice(1).map(row => row.split('**').filter(c => c));
                    return (
                         <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {headers.map((header, hIndex) => <th key={hIndex} className="p-2 border text-left font-semibold">{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bodyRows.map((row, rIndex) => (
                                        <tr key={rIndex}>
                                            {row.map((cell, cIndex) => <td key={cIndex} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock.match(/^\d\.\s/)) {
                     return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
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
const calculatorData = {
  "slug": "tassazione-fisioterapisti",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Fisioterapisti in Partita IVA",
  "lang": "it",
  "inputs": [
    { "id": "fatturato", "label": "Fatturato Annuo Lordo", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei ricavi o compensi incassati nell'anno, prima di qualsiasi spesa o tassa." },
    { "id": "isRegimeForfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean" as const, "tooltip": "Seleziona se aderisci al regime fiscale agevolato con imposta sostitutiva. Il limite di fatturato per rientrarvi è 85.000€." },
    { "id": "isNuovaAttivita", "label": "È una nuova attività (primi 5 anni)?", "type": "boolean" as const, "condition": "isRegimeForfettario == true", "tooltip": "Se sei in regime forfettario e hai avviato l'attività da meno di 5 anni, l'imposta sostitutiva è ridotta dal 15% al 5%." },
    { "id": "speseDeducibili", "label": "Spese Annuali Deducibili", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "isRegimeForfettario == false", "tooltip": "Solo per il regime ordinario: inserisci i costi inerenti alla tua attività (affitto studio, utenze, software, corsi, etc.)." },
    { "id": "haAltraCoperturaPrevidenziale", "label": "Hai un'altra copertura previdenziale obbligatoria?", "type": "boolean" as const, "tooltip": "Seleziona se sei anche un lavoratore dipendente o iscritto ad un'altra cassa previdenziale. Questo riduce l'aliquota INPS dovuta alla Gestione Separata." }
  ],
  "outputs": [
    { "id": "imponibileFiscale", "label": "Reddito Imponibile Fiscale", "unit": "€" },
    { "id": "contributiPrevidenziali", "label": "Contributi INPS (Gestione Separata)", "unit": "€" },
    { "id": "impostaDovuta", "label": "Imposta Fiscale Dovuta (IRPEF o Sostitutiva)", "unit": "€" },
    { "id": "nettoAnnuo", "label": "Reddito Netto Annuo Stimato", "unit": "€" },
    { "id": "nettoMensile", "label": "Reddito Netto Mensile Stimato", "unit": "€" },
    { "id": "aliquotaEffettiva", "label": "Aliquota Effettiva Totale (Tasse + Contributi)", "unit": "%" }
  ],
  "content": "### **Guida Completa alla Tassazione per Fisioterapisti con Partita IVA**\n\n**Analisi dei Regimi Fiscali, Calcolo dei Contributi e Ottimizzazione del Netto**\n\nLa gestione fiscale per un fisioterapista libero professionista è un aspetto fondamentale che impatta direttamente sul guadagno netto. Comprendere le differenze tra i regimi fiscali disponibili, calcolare correttamente i contributi previdenziali e pianificare le imposte è cruciale per la sostenibilità e la crescita della propria attività.\n\nQuesto strumento è stato progettato per offrire una **stima chiara e dettagliata** del carico fiscale e del reddito netto, ma è importante sottolineare che **non sostituisce la consulenza di un commercialista**, figura essenziale per una gestione personalizzata e ottimizzata.\n\n### **Parte 1: I Parametri del Calcolo - Come Funziona**\n\nIl calcolatore analizza i dati inseriti per simulare il calcolo delle tasse e dei contributi secondo la normativa italiana. I pilastri del calcolo sono:\n\n1. **Il Fatturato Annuo**: È la base di partenza, ovvero l'incasso totale annuale al lordo di qualsiasi costo.\n2. **Il Regime Fiscale**: La scelta più importante, che determina come verranno calcolate le imposte. Le due opzioni principali sono il **Regime Forfettario** e il **Regime Ordinario Semplificato**.\n3. **La Posizione Previdenziale**: I fisioterapisti senza un albo professionale con una cassa dedicata (la maggior parte) sono tenuti all'iscrizione alla **Gestione Separata INPS**, un fondo pensionistico per i lavoratori autonomi e i professionisti.\n\n#### **Il Codice ATECO e il Coefficiente di Redditività**\n\nAd ogni attività professionale è associato un codice ATECO. Per i fisioterapisti, il codice di riferimento è **86.90.21 - Fisioterapia**. Questo codice è fondamentale nel Regime Forfettario, poiché ad esso è legato un **coefficiente di redditività del 78%**.\n\nQuesto significa che lo Stato presume, in modo forfettario, che il 78% del tuo fatturato costituisca reddito imponibile, mentre il restante 22% rappresenti le spese sostenute, che non devono quindi essere documentate.\n\n### **Parte 2: Analisi Comparativa dei Regimi Fiscali**\n\nLa scelta del regime fiscale è il bivio che definisce l'intero percorso di tassazione. Vediamo le differenze nel dettaglio.\n\nRegime Fiscale**Vantaggi Principali**Svantaggi Principali**Ideale Per...\n**Regime Forfettario**- **Semplicità contabile**: niente IVA, niente studi di settore.\n- **Tassazione agevolata**: imposta sostitutiva del 5% (start-up) o 15%.\n- **Prevedibilità**: i costi sono una percentuale fissa del fatturato.- **Deduzione analitica impossibile**: non puoi scaricare i costi reali (affitto, software, corsi). Se le tue spese superano il 22% del fatturato, potrebbe non essere conveniente.\n- **Limite di fatturato**: non puoi superare gli 85.000€ annui.Chi ha **spese contenute** (inferiori al 22% del fatturato) e vuole la massima semplicità gestionale, specialmente all'inizio dell'attività.\n**Regime Ordinario**- **Deduzione dei costi reali**: puoi scaricare tutte le spese inerenti alla tua attività (affitto studio, attrezzature, marketing, etc.), abbattendo l'imponibile.\n- **Nessun limite di fatturato**.- **Complessità maggiore**: obbligo di tenuta della contabilità, gestione dell'IVA.\n- **Tassazione progressiva (IRPEF)**: le aliquote aumentano con il reddito (dal 23% al 43%), potendo risultare più alte dell'imposta sostitutiva.Chi ha **costi di gestione significativi** (superiori al 22% del fatturato) e un volume d'affari che potrebbe superare la soglia del forfettario.\n\n### **Parte 3: I Contributi Previdenziali INPS**\n\nL'iscrizione alla **Gestione Separata INPS** è obbligatoria. I contributi versati finanziano la tua futura pensione e sono calcolati sul reddito imponibile (lordo).\n\n* **Come si calcolano**: Si applica un'aliquota percentuale al reddito imponibile.\n* **Aliquota Piena (26,07% per il 2025-2026, indicativo)**: Si applica ai professionisti che non hanno altre forme di previdenza obbligatoria.\n* **Aliquota Ridotta (24%)**: Si applica a chi è contemporaneamente lavoratore dipendente o titolare di pensione, e quindi già versa contributi ad un'altra cassa.\n\nUn aspetto cruciale è che i **contributi INPS versati sono sempre interamente deducibili** dal reddito, riducendo così la base su cui si calcolano le imposte (sia l'imposta sostitutiva che l'IRPEF).\n\n### **Parte 4: Esempio Pratico di Calcolo**\n\nVediamo un caso concreto per un fisioterapista al suo primo anno di attività con un fatturato di **35.000€** in Regime Forfettario.\n\n1. **Reddito Imponibile Lordo (Forfettario)**: 35.000€ * 78% = 27.300€\n2. **Calcolo Contributi INPS (Aliquota Piena)**: 27.300€ * 26,07% = 7.117,11€\n3. **Reddito Imponibile Fiscale (Netto)**: 27.300€ - 7.117,11€ = 20.182,89€\n4. **Imposta Sostitutiva (Aliquota Start-up)**: 20.182,89€ * 5% = 1.009,14€\n5. **Reddito Netto Annuo**: 35.000€ - 7.117,11€ (INPS) - 1.009,14€ (Imposte) = **26.873,75€**\n6. **Netto Mensile**: 26.873,75€ / 12 = **2.239,48€**\n\n### **Conclusione: Pianificare per Massimizzare**\n\nQuesto calcolatore ti offre una fotografia realistica della tua situazione fiscale. Usalo per confrontare gli scenari e capire quale regime si adatta meglio alla tua struttura di costi e al tuo volume di affari. La pianificazione fiscale, supportata da un professionista, è il primo passo per trasformare la tua competenza professionale in un'attività di successo e finanziariamente solida."
};

const TassazioneFisioterapistiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturato: 45000,
        isRegimeForfettario: true,
        isNuovaAttivita: true,
        speseDeducibili: 5000,
        haAltraCoperturaPrevidenziale: false,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);
    
    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { fatturato, isRegimeForfettario, isNuovaAttivita, speseDeducibili, haAltraCoperturaPrevidenziale } = states;
        
        const COEFFICIENTE_REDDITIVITA = 0.78;
        const ALIQUOTA_INPS_INTERA = 0.2607;
        const ALIQUOTA_INPS_RIDOTTA = 0.24;
        
        const imponibileLordo = isRegimeForfettario ? fatturato * COEFFICIENTE_REDDITIVITA : fatturato - speseDeducibili;
        const aliquotaInpsApplicata = haAltraCoperturaPrevidenziale ? ALIQUOTA_INPS_RIDOTTA : ALIQUOTA_INPS_INTERA;
        const contributiPrevidenziali = imponibileLordo > 0 ? imponibileLordo * aliquotaInpsApplicata : 0;
        const imponibileFiscale = imponibileLordo > 0 ? imponibileLordo - contributiPrevidenziali : 0;
        
        let impostaDovuta = 0;
        if (isRegimeForfettario) {
            const aliquotaImposta = isNuovaAttivita ? 0.05 : 0.15;
            impostaDovuta = imponibileFiscale * aliquotaImposta;
        } else {
            if (imponibileFiscale <= 28000) {
                impostaDovuta = imponibileFiscale * 0.23;
            } else if (imponibileFiscale <= 50000) {
                impostaDovuta = (28000 * 0.23) + ((imponibileFiscale - 28000) * 0.35);
            } else {
                impostaDovuta = (28000 * 0.23) + (22000 * 0.35) + ((imponibileFiscale - 50000) * 0.43);
            }
        }
        impostaDovuta = Math.max(0, impostaDovuta);
        
        const totaleUscite = contributiPrevidenziali + impostaDovuta + (isRegimeForfettario ? 0 : speseDeducibili);
        const nettoAnnuo = fatturato - totaleUscite;
        const nettoMensile = nettoAnnuo / 12;
        const aliquotaEffettiva = fatturato > 0 ? (contributiPrevidenziali + impostaDovuta) / fatturato * 100 : 0;
        
        return {
            imponibileFiscale, contributiPrevidenziali, impostaDovuta, nettoAnnuo,
            nettoMensile, aliquotaEffettiva,
        };
    }, [states]);

    const chartData = [
        { 
            name: 'Ripartizione Fatturato', 
            'Netto Stimato': Math.max(0, calculatedOutputs.nettoAnnuo), 
            'Imposte': Math.max(0, calculatedOutputs.impostaDovuta), 
            'Contributi INPS': Math.max(0, calculatedOutputs.contributiPrevidenziali) 
        },
    ];
    const COLORS = ['#16a34a', '#ef4444', '#3b82f6'];

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
            pdf.save(`${slug}-simulazione.pdf`);
        } catch (e) {
            alert("Errore durante l'esportazione in PDF. Assicurati che il browser supporti questa funzione.");
        }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo nella memoria locale del browser!");
        } catch {
            alert("Impossibile salvare il risultato.");
        }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/80 font-sans">
                <main className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg p-6" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4 text-base">Simula il tuo carico fiscale e scopri il netto annuale e mensile.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale. I calcoli si basano su aliquote indicative per il 2025.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg border">
                            {inputs.map(input => {
                                let conditionMet = true;
                                if (input.condition) {
                                    const [key, , valueStr] = input.condition.split(' ');
                                    const value = valueStr === 'true';
                                    conditionMet = states[key] === value;
                                }
                                if (!conditionMet) return null;

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className={`${input.id === 'isRegimeForfettario' ? 'md:col-span-2' : ''} flex items-center gap-3 p-2 rounded-md bg-white border self-center`}>
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                            </label>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => {
                                const value = (calculatedOutputs as any)[output.id];
                                const formattedValue = output.unit === '€' ? formatCurrency(value) : formatPercentage(value);
                                const isMainResult = output.id.includes('netto');
                                
                                return(
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${isMainResult ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${isMainResult ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formattedValue : '...'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato</h3>
                            <div className="h-72 w-full bg-gray-50 p-4 rounded-lg border">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}}/>
                                            <Legend />
                                            <Bar dataKey="Netto Stimato" stackId="a" fill={COLORS[0]} />
                                            <Bar dataKey="Contributi INPS" stackId="a" fill={COLORS[2]} />
                                            <Bar dataKey="Imposte" stackId="a" fill={COLORS[1]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-center bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="p-4 bg-white shadow-lg rounded-2xl">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Guida alla Tassazione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="p-4 bg-white shadow-lg rounded-2xl">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/regime-forfetario-imprese-e-professionisti" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfetario</a></li>
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-servizi.50153.gestione-separata.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Separata</a></li>
                            <li><a href="https://www.normattiva.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Normattiva - Il portale della legge vigente</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneFisioterapistiCalculator;