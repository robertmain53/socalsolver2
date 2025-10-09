'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Flat Tax Incrementale per Partite IVA (2023)",
  description: "Calcola il risparmio fiscale con la Flat Tax Incrementale del 2023. Inserisci i tuoi redditi e scopri il vantaggio della tassazione agevolata al 15%."
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
            "name": "Cos'è la Flat Tax Incrementale?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "È stata una misura fiscale valida solo per il 2023 che permetteva a imprese individuali e autonomi di tassare l'incremento di reddito (rispetto al triennio precedente) con un'imposta sostitutiva agevolata del 15%, fino a un massimo di 40.000 € di incremento."
            }
          },
          {
            "@type": "Question",
            "name": "Chi poteva accedere a questa agevolazione?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Potevano accedere le persone fisiche titolari di reddito d'impresa o di lavoro autonomo che nel 2023 non applicavano il Regime Forfettario."
            }
          },
          {
            "@type": "Question",
            "name": "La Flat Tax Incrementale è valida anche per il 2024?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, la misura non è stata prorogata. Era applicabile esclusivamente ai redditi prodotti nel periodo d'imposta 2023, da dichiarare nel 2024."
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
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// Dati di configurazione del calcolatore (self-contained)
const calculatorData = {
  "slug": "flat-tax-pi",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Flat Tax Incrementale per Partite IVA",
  "inputs": [
    { "id": "reddito_2023", "label": "Reddito complessivo 2023", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il reddito d'impresa o di lavoro autonomo conseguito nel 2023. Questo è il valore su cui verrà calcolato il beneficio." },
    { "id": "reddito_massimo_triennio", "label": "Reddito più elevato del triennio 2020-2022", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il valore più alto tra i redditi dichiarati negli anni 2020, 2021 e 2022. Questo valore serve come base di confronto." }
  ],
  "outputs": [
    { "id": "base_imponibile_incrementale", "label": "Quota di reddito tassata al 15%", "unit": "€" },
    { "id": "imposta_sostitutiva", "label": "Imposta sostitutiva dovuta (Flat Tax)", "unit": "€" },
    { "id": "reddito_soggetto_irpef", "label": "Quota di reddito tassata con IRPEF ordinaria", "unit": "€" },
    { "id": "risparmio_fiscale_stimato", "label": "Risparmio fiscale massimo stimato", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Flat Tax Incrementale 2023**\n\n**Cos'è, Come Funziona e Chi Poteva Beneficiarne: Analisi Dettagliata**\n\nLa Flat Tax Incrementale, introdotta dalla Legge di Bilancio 2023 (Legge n. 197/2022), è stata una misura fiscale straordinaria valida **esclusivamente per il periodo d'imposta 2023**. Il suo obiettivo era offrire un regime di tassazione agevolata sull'incremento di reddito per imprese individuali e lavoratori autonomi in regime di contabilità ordinaria. \n\nQuesto strumento permette di calcolare con precisione il beneficio fiscale derivante da questa misura, fornendo una stima chiara e comprensibile. **È importante sottolineare che questa agevolazione non è stata prorogata per gli anni successivi**.\n\n### **Parte 1: Il Calcolatore - Logica di Funzionamento**\n\nIl calcolatore determina il vantaggio fiscale applicando una tassazione sostitutiva del 15% su una specifica porzione del reddito 2023. La logica si basa su tre pilastri fondamentali:\n\n1.  **Reddito di Riferimento**: Si identifica il reddito più elevato conseguito nel triennio 2020-2022. Questo valore rappresenta la base di partenza.\n2.  **Calcolo della Franchigia**: A questo reddito di riferimento si applica una franchigia forfettaria del 5%. La somma ottenuta costituisce la \"soglia di non tassabilità agevolata\".\n3.  **Determinazione dell'Incremento Tassabile**: Si calcola la differenza tra il reddito del 2023 e la soglia calcolata al punto precedente. \n\nSu questo incremento, fino a un **massimo di 40.000 €**, si applica l'imposta sostitutiva del 15% in luogo delle aliquote progressive IRPEF e delle relative addizionali. La parte di reddito che non rientra in questo calcolo (la base storica + l'eventuale eccedenza oltre i 40.000 €) rimane soggetta a tassazione ordinaria.\n\n### **Parte 2: Guida Approfondita alla Misura**\n\n#### **Soggetti Beneficiari**\n\nPotevano accedere alla Flat Tax Incrementale le persone fisiche esercenti attività d'impresa, arti o professioni che rispettavano due condizioni essenziali:\n\n* **Non aver aderito al Regime Forfettario nel 2023**.\n* Essere titolari di reddito d'impresa e/o di lavoro autonomo.\n\n#### **Soggetti Esclusi**\n\nErano esplicitamente esclusi dalla misura:\n\n* I contribuenti che nel 2023 hanno applicato il **Regime Forfettario** (L. 190/2014).\n* I redditi derivanti da società di persone o società di capitali trasparenti, in quanto non prodotti direttamente dalla persona fisica.\n* I redditi non d'impresa o di lavoro autonomo (es. redditi da fabbricati o di capitale).\n\n#### **Esempio Pratico di Calcolo**\n\nAnalizziamo un caso concreto per chiarire il meccanismo:\n\n* **Reddito 2023**: 80.000 €\n* **Redditi precedenti**: 45.000 € (2020), 52.000 € (2021), 48.000 € (2022)\n\n1.  **Reddito più elevato del triennio**: 52.000 €\n2.  **Calcolo soglia con franchigia**: 52.000 € * 1,05 = 54.600 €\n3.  **Calcolo incremento lordo**: 80.000 € - 54.600 € = 25.400 €\n4.  **Base imponibile per la Flat Tax**: Poiché 25.400 € è inferiore al tetto di 40.000 €, l'intero importo è agevolabile.\n\n**Liquidazione delle Imposte:**\n\n* **Quota con Flat Tax**: 25.400 € * 15% = **3.810 € (Imposta Sostitutiva)**\n* **Quota con IRPEF ordinaria**: Il reddito rimanente (80.000 € - 25.400 € = 54.600 €) viene tassato secondo gli scaglioni IRPEF e le relative addizionali.\n\nSenza l'agevolazione, i 25.400 € sarebbero rientrati nello scaglione IRPEF più alto raggiunto dal contribuente (in questo caso, il 43% per la parte eccedente i 50.000 €), comportando un carico fiscale significativamente maggiore su quella porzione di reddito.\n\n### **Parte 3: Implicazioni e Vantaggi Fiscali**\n\nIl vantaggio principale della Flat Tax Incrementale risiedeva nel **risparmio d'imposta** generato dall'applicazione di un'aliquota fissa e ridotta (15%) su una parte di reddito che altrimenti sarebbe stata soggetta ad aliquote marginali IRPEF ben più elevate (dal 23% fino al 43%).\n\nQuesto meccanismo premiava la crescita del reddito, alleggerendo il carico fiscale sull'utile \"extra\" generato nell'anno, con un beneficio massimo potenziale calcolato sulla differenza tra l'aliquota marginale più alta (43%) e quella sostitutiva (15%) applicata sul tetto di 40.000 €.\n\n#### **Compilazione del Modello Redditi PF 2024**\n\nPer usufruire dell'agevolazione, era necessario compilare correttamente il **quadro LM del Modello Redditi PF 2024**, nella sezione II dedicata. In particolare, si dovevano indicare i redditi del triennio precedente e calcolare la base imponibile da assoggettare a imposta sostitutiva."
};

const FlatTaxPiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        reddito_2023: 75000,
        reddito_massimo_triennio: 50000,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { reddito_2023, reddito_massimo_triennio } = states;
        const soglia_riferimento = reddito_massimo_triennio * 1.05;
        const incremento_lordo = reddito_2023 - soglia_riferimento;
        const base_imponibile_incrementale = Math.max(0, Math.min(incremento_lordo, 40000));
        const imposta_sostitutiva = base_imponibile_incrementale * 0.15;
        const reddito_soggetto_irpef = reddito_2023 - base_imponibile_incrementale;

        // Stima aliquota marginale per calcolo risparmio
        let aliquotaMarginale;
        if (reddito_2023 > 50000) aliquotaMarginale = 0.43;
        else if (reddito_2023 > 28000) aliquotaMarginale = 0.35;
        else if (reddito_2023 > 15000) aliquotaMarginale = 0.25;
        else aliquotaMarginale = 0.23;

        const irpef_risparmiata = base_imponibile_incrementale * aliquotaMarginale;
        const risparmio_fiscale_stimato = irpef_risparmiata - imposta_sostitutiva;

        return {
            base_imponibile_incrementale,
            imposta_sostitutiva,
            reddito_soggetto_irpef,
            risparmio_fiscale_stimato,
            irpef_risparmiata
        };
    }, [states]);
    
    const chartData = [
        { 
            name: 'Tassazione su Incremento', 
            'IRPEF Ordinaria (stimata)': Math.max(0, calculatedOutputs.irpef_risparmiata), 
            'Flat Tax Incrementale': Math.max(0, calculatedOutputs.imposta_sostitutiva) 
        },
    ];

    const formulaUsata = `Base Imp. = MAX(0, MIN(Reddito2023 - (RedditoMax_20-22 * 1.05), 40000))`;

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
        } catch (_e) { alert("Funzione PDF non disponibile in questo ambiente."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { irpef_risparmiata, ...outputsToSave } = calculatedOutputs;
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
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md" ref={calcolatoreRef}>
                        <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">Simula il beneficio fiscale della tassazione agevolata per l'incremento di reddito del 2023.</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo calcolatore ha uno scopo puramente informativo e si basa sulla normativa fiscale per il 2023. I risultati sono una stima e non sostituiscono una consulenza professionale.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                                {inputs.map(input => (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id={input.id}
                                                aria-label={input.label}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                                type="number"
                                                min={input.min}
                                                step={input.step}
                                                value={states[input.id]}
                                                onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                                            />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'risparmio_fiscale_stimato' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'risparmio_fiscale_stimato' ? 'text-green-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Tassazione sull'Incremento</h3>
                                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                                <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                                <Bar dataKey="IRPEF Ordinaria (stimata)" fill="#fca5a5" name="IRPEF Ordinaria (stimata)" />
                                                <Bar dataKey="Flat Tax Incrementale" fill="#86efac" name="Flat Tax Incrementale" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                         <div className="mt-6 border-t p-4 bg-white rounded-b-lg">
                            <h3 className="font-semibold text-gray-700">Formula Sintetica Utilizzata</h3>
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                         <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2022-12-29;197!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge 29 dicembre 2022, n. 197</a> (Legge di Bilancio 2023), art. 1, commi 55-57.</li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/flat-tax-incrementale/scheda-informativa-flat-tax-incrementale" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Scheda Informativa - Agenzia delle Entrate</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default FlatTaxPiCalculator;