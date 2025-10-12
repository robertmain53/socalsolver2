'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

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
            "name": "Cosa succede se non posso andare a una partita con l'abbonamento?",
            "acceptedAnswer": {
            "@type": "Answer",
            "text": "Se non puoi assistere a una partita, il costo di quell'evento è generalmente perso. Tuttavia, molti club offrono opzioni come il cambio nominativo per cedere il posto a un'altra persona o piattaforme ufficiali per la rivendita del biglietto, che permettono di recuperare parte del valore."
            }
        },
        {
            "@type": "Question",
            "name": "L'abbonamento allo stadio include le partite di coppa?",
            "acceptedAnswer": {
            "@type": "Answer",
            "text": "Di solito, l'abbonamento standard copre esclusivamente le partite casalinghe del campionato (es. Serie A). Le partite di Coppa Italia o delle coppe europee richiedono l'acquisto di un biglietto a parte, ma gli abbonati hanno quasi sempre diritto a una fase di prelazione e a prezzi scontati."
            }
        },
        {
            "@type": "Question",
            "name": "Qual è il 'punto di pareggio'?",
            "acceptedAnswer": {
            "@type": "Answer",
            "text": "Il punto di pareggio è il numero minimo di partite a cui devi assistere affinché il costo totale dei biglietti singoli eguagli il costo dell'abbonamento. Se prevedi di vedere più partite di quelle indicate dal punto di pareggio, l'abbonamento diventa economicamente conveniente."
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


// Dati di configurazione del calcolatore (incollati dal JSON)
const calculatorData = {
    "slug": "abbonamento-stadio-vs-biglietto",
    "category": "Hobby e Tempo Libero",
    "title": "Calcolatore Costo Abbonamento Stadio vs. Biglietto Singolo",
    "lang": "it",
    "inputs": [
        { "id": "costo_abbonamento", "label": "Costo totale dell'abbonamento", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Inserisci il prezzo completo dell'abbonamento per l'intera stagione." },
        { "id": "costo_biglietto_singolo", "label": "Costo medio di un singolo biglietto", "type": "number" as const, "unit": "€", "min": 0, "step": 1, "tooltip": "Indica il prezzo medio che pagheresti per un biglietto singolo nello stesso settore." },
        { "id": "numero_partite_previste", "label": "N° di partite che pensi di vedere", "type": "number" as const, "unit": "partite", "min": 0, "step": 1, "tooltip": "Sii realistico: quante partite prevedi effettivamente di frequentare durante la stagione?" },
        { "id": "numero_partite_abbonamento", "label": "Partite incluse nell'abbonamento", "type": "number" as const, "unit": "partite", "min": 1, "step": 1, "tooltip": "Indica il numero totale di partite coperte dall'abbonamento (solitamente 19)." },
        { "id": "costi_aggiuntivi_biglietto", "label": "Costi extra per biglietto (opzionale)", "type": "number" as const, "unit": "€", "min": 0, "step": 0.5, "tooltip": "Aggiungi eventuali costi di prevendita, commissioni online o altre spese fisse per biglietto." },
        { "id": "valore_benefit_abbonato", "label": "Valore benefit extra (opzionale)", "type": "number" as const, "unit": "€", "min": 0, "step": 5, "tooltip": "Stima il valore di vantaggi come sconti sul merchandising, prelazioni, ecc." }
    ],
    "outputs": [
        { "id": "risparmio_con_abbonamento", "label": "Risparmio Stimato con l'Abbonamento", "unit": "€" },
        { "id": "costo_totale_biglietti", "label": "Costo Totale con Biglietti Singoli", "unit": "€" },
        { "id": "punto_di_pareggio", "label": "Punto di Pareggio", "unit": "partite" },
        { "id": "costo_medio_partita_abbonamento", "label": "Costo Effettivo per Partita (Abbonato)", "unit": "€" }
    ],
    "content": "### **Guida Completa: Abbonamento Stadio o Biglietti Singoli? La Scelta Definitiva**\n\n**Analisi dei Costi, Fattori Nascosti e Strategie per il Tifoso Intelligente**\n\nOgni inizio stagione, il tifoso si trova di fronte a un dilemma classico: sottoscrivere l'abbonamento e legarsi alla propria squadra per un anno intero, o mantenere la flessibilità acquistando i biglietti partita per partita? La risposta non è mai scontata e va oltre una semplice operazione matematica.\n\nQuesto strumento è progettato per offrirti una **valutazione numerica chiara e immediata**, ma la nostra guida ti accompagnerà anche nell'analisi di tutti quei **fattori qualitativi** che possono spostare l'ago della bilancia. L'obiettivo è trasformare un dubbio amletico in una scelta consapevole e vantaggiosa.\n\n### **Parte 1: Il Calcolatore - Come Interpretare i Dati**\n\nIl nostro calcolatore utilizza i dati che fornisci per simulare i due scenari e offrirti un confronto diretto. Ecco cosa significa ogni campo:\n\n* **Input del Calcolatore**\n    * **Costo Abbonamento e Biglietto Singolo**: I dati di partenza fondamentali. Sii preciso per ottenere una stima accurata.\n    * **Numero di Partite Previste**: Questo è il dato più importante. Una valutazione onesta della tua reale disponibilità a frequentare lo stadio è cruciale per la simulazione.\n    * **Partite Incluse**: Solitamente le gare di campionato casalinghe. È il divisore che ci aiuta a calcolare il costo medio per evento.\n    * **Costi Extra e Benefit**: Spesso trascurati, questi valori possono alterare significativamente il costo reale. Pensa alle commissioni di prevendita o al valore di uno sconto del 15% sul merchandising grazie alla tessera.\n\n* **Risultati della Simulazione**\n    * **Risparmio Stimato**: Il risultato principale. Un valore positivo indica la convenienza dell'abbonamento; un valore negativo suggerisce che i biglietti singoli sono la scelta migliore per te.\n    * **Costo Totale Biglietti**: La spesa complessiva che sosterresti senza abbonamento, in base alle partite che prevedi di vedere.\n    * **Punto di Pareggio**: Un indicatore potentissimo. Ti dice esattamente **dopo quante partite l'abbonamento inizia a farti risparmiare**. Se prevedi di andare a un numero di partite superiore a questo valore, l'abbonamento è quasi certamente la scelta giusta.\n    * **Costo Effettivo per Partita**: Rivela il vero prezzo di ogni singola partita se sei un abbonato. Confrontare questo valore con il costo del biglietto singolo ti dà una percezione immediata del valore.\n\n### **Parte 2: Analisi Qualitativa - I Pro e i Contro Oltre i Numeri**\n\nLa scelta non è solo una questione di euro. Considera attentamente questi aspetti che il calcolatore non può misurare.\n\n#### **Vantaggi dell'ABBONAMENTO (Il Cuore del Tifoso)**\n\n* **Posto Garantito**: Nessuna ansia da \"sold-out\" per i big match. Il tuo posto è lì che ti aspetta.\n* **Risparmio di Tempo e Stress**: Dimentica le code online o al botteghino ogni due settimane.\n* **Senso di Appartenenza**: Essere un abbonato è uno status. Rafforza il legame con il club e con la comunità di tifosi del tuo settore.\n* **Diritto di Prelazione**: Spesso gli abbonati hanno la priorità per l'acquisto di biglietti per coppe o trasferte, un vantaggio inestimabile nelle occasioni che contano.\n* **Programmi Fedeltà**: Molti club premiano gli abbonati con sconti, eventi esclusivi o accumulo punti.\n\n#### **Vantaggi del BIGLIETTO SINGOLO (La Libertà del Tifoso)**\n\n* **Massima Flessibilità**: Impegni di lavoro, weekend fuori porta, una semplice influenza? Non perdi soldi se salti una partita.\n* **Minor Esborso Iniziale**: Non devi affrontare una spesa importante tutta in una volta a inizio stagione.\n* **Libertà di Scelta**: Puoi decidere di vedere partite diverse da settori diversi, o magari portare un amico in un posto vicino al tuo.\n* **Ideale per Tifosi Lontani**: Se vivi in un'altra città, l'acquisto singolo è l'unica opzione praticabile.\n\n### **Parte 3: Strategie Avanzate per il Tifoso**\n\n#### **Il Mercato Secondario (Secondary Ticketing)**\n\nMolti club moderni permettono di rimettere in vendita il proprio posto per le partite a cui non si può assistere. Se la tua squadra lo consente, questo fattore **aumenta drasticamente il valore dell'abbonamento**. Anche se recuperi solo una parte del costo del biglietto, stai di fatto abbassando il costo totale del tuo abbonamento. Informati sulle policy del tuo club: è un elemento che può cambiare completamente il risultato del calcolo.\n\n#### **L'Analisi del Calendario**\n\nPrima di decidere, dai un'occhiata al calendario. Ci sono molte partite infrasettimanali difficili da frequentare per un lavoratore? La tua squadra gioca in casa durante le festività o in periodi in cui sei solitamente in vacanza? Una rapida analisi può rendere la tua stima sul \"numero di partite previste\" molto più accurata.\n\n### **FAQ - Domande Frequenti**\n\n* **Cosa succede se non posso andare a una partita?**\n    * Con il biglietto singolo, non hai problemi. Con l'abbonamento, il costo di quella partita è perso, a meno che il tuo club non permetta il cambio nominativo o la rivendita del posto.\n\n* **L'abbonamento include le partite di coppa (Coppa Italia, Coppe Europee)?**\n    * Generalmente no. L'abbonamento standard copre solo le partite casalinghe di campionato. Tuttavia, quasi sempre garantisce una fase di prevendita con sconti o priorità per le altre competizioni.\n\n* **Posso cedere il mio abbonamento a un amico?**\n    * Dipende dalle regole del club. Molti permettono il \"cambio nominativo\" per un numero limitato di partite a stagione, spesso tramite una procedura online. Verifica sempre sul sito ufficiale della tua squadra.\n\n### **Conclusione**\n\nLa scelta tra abbonamento e biglietto singolo è un mix di calcolo economico e stile di vita. Usa questo strumento come punto di partenza solido per la tua analisi finanziaria, ma poi aggiungi le tue considerazioni personali, la tua passione e le tue abitudini. Che tu scelga la fedeltà dell'abbonamento o la libertà del biglietto singolo, l'importante è sostenere la tua squadra."
};

const AbbonamentoStadioVsBigliettoCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        costo_abbonamento: 380,
        costo_biglietto_singolo: 30,
        numero_partite_previste: 16,
        numero_partite_abbonamento: 19,
        costi_aggiuntivi_biglietto: 2,
        valore_benefit_abbonato: 25
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const {
            costo_abbonamento, costo_biglietto_singolo, numero_partite_previste,
            numero_partite_abbonamento, costi_aggiuntivi_biglietto, valore_benefit_abbonato
        } = states;

        const costo_unitario_biglietto = Number(costo_biglietto_singolo) + Number(costi_aggiuntivi_biglietto);
        const costo_totale_biglietti = costo_unitario_biglietto * Number(numero_partite_previste);
        const costo_reale_abbonamento = Number(costo_abbonamento) - Number(valore_benefit_abbonato);
        const risparmio_con_abbonamento = costo_totale_biglietti - costo_reale_abbonamento;
        const punto_di_pareggio = costo_unitario_biglietto > 0 ? Math.ceil(costo_reale_abbonamento / costo_unitario_biglietto) : 0;
        const costo_medio_partita_abbonamento = Number(numero_partite_abbonamento) > 0 ? costo_reale_abbonamento / Number(numero_partite_abbonamento) : 0;

        return {
            risparmio_con_abbonamento,
            costo_totale_biglietti,
            punto_di_pareggio,
            costo_medio_partita_abbonamento,
            costo_reale_abbonamento, // Aggiunto per il grafico
        };
    }, [states]);

    const chartData = [
        { name: 'Costi a Confronto', 'Costo Abbonamento': calculatedOutputs.costo_reale_abbonamento, 'Costo Biglietti Singoli': calculatedOutputs.costo_totale_biglietti },
    ];
    
    const formulaUsata = `Punto Pareggio = ARROTONDA.PER.ECC( (CostoAbbonamento - ValoreBenefit) / (CostoBiglietto + CostiExtra) )`;

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
        } catch (_e) { alert("Funzione PDF non disponibile in questo ambiente"); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { costo_reale_abbonamento, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatNumber = (value: number) => new Intl.NumberFormat('it-IT').format(value);
    
    const risparmioPositivo = calculatedOutputs.risparmio_con_abbonamento > 0;

    return (
        <>
        <FaqSchema />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
            <div className="lg:col-span-2">
            <div className="p-0 md:p-6" ref={calcolatoreRef}>
                <div className=" -lg -md p-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                    <p className="text-gray-600 mb-4">Scopri se per te è più vantaggioso l'abbonamento stagionale o l'acquisto dei singoli biglietti.</p>
                    <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
                        <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo. La convenienza reale dipende da molti fattori personali.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                        {inputs.map(input => (
                            <div key={input.id}>
                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                    {input.label}
                                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                </label>
                                <div className="flex items-center gap-2">
                                    <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                    {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                        {outputs.map(output => {
                             const value = (calculatedOutputs as any)[output.id];
                             const isRisparmio = output.id === 'risparmio_con_abbonamento';
                             const bgColor = isRisparmio ? (risparmioPositivo ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500') : 'bg-gray-50 border-gray-300';
                             const textColor = isRisparmio ? (risparmioPositivo ? 'text-green-600' : 'text-red-600') : 'text-gray-800';

                            return (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${bgColor}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${textColor}`}>
                                        <span>
                                            {isClient ? 
                                                (output.unit === '€' ? formatCurrency(value) : `${formatNumber(value)} ${output.unit}`) : 
                                                '...'
                                            }
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Visivo dei Costi</h3>
                         <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                            {isClient && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" tickFormatter={(value) => `€${value}`} />
                                <YAxis type="category" dataKey="name" hide />
                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="Costo Abbonamento" name="Costo Abbonamento (Netto)" fill="#4f46e5" />
                                <Bar dataKey="Costo Biglietti Singoli" name={`Costo per ${states.numero_partite_previste} Partite`} fill="#a5b4fc" />
                                </BarChart>
                            </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 border rounded-lg shadow-md p-4 bg-white self-start">
                <h3 className="font-semibold text-gray-700">Formula del Punto di Pareggio</h3>
                <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                <p className="text-xs text-gray-500 mt-2">Questa formula indica il numero di partite da vedere per rendere l'abbonamento conveniente.</p>
            </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
                <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                    <div className="grid grid-cols-2 gap-3">
                    <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                    <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
                    <button onClick={handleReset} className="col-span-2 w-full border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                    </div>
                </section>
                <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Guida alla Scelta</h2>
                     <ContentRenderer content={content} />
                </section>
            </aside>
        </div>
        </>
    );
};

export default AbbonamentoStadioVsBigliettoCalculator;