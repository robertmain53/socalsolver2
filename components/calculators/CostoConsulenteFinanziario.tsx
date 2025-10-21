'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

export const meta = {
  title: 'Calcolatore Costo Consulente Finanziario (Parcella vs %)',
  description: 'Confronta il costo di un consulente finanziario a parcella fissa contro uno a percentuale. Simula l\'impatto dei costi sui tuoi investimenti a lungo termine.'
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
            "name": "Quanto costa un consulente finanziario indipendente?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il costo di un consulente finanziario indipendente varia in base al modello di remunerazione. I due modelli principali sono la parcella a percentuale sul patrimonio gestito (solitamente tra 0.5% e 1.5%) e la parcella fissa annuale (indipendente dal patrimonio), che può variare da poche centinaia a diverse migliaia di euro a seconda della complessità del servizio."
            }
          },
          {
            "@type": "Question",
            "name": "È meglio una parcella fissa o una a percentuale?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La scelta dipende dal patrimonio. Per patrimoni piccoli o medi, una parcella a percentuale è spesso più accessibile. Per patrimoni elevati, una parcella fissa diventa quasi sempre più conveniente, poiché non cresce all'aumentare del capitale. Questo calcolatore ti aiuta a visualizzare il punto di pareggio."
            }
          },
          {
            "@type": "Question",
            "name": "Cosa sono i costi dei prodotti (TER)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il TER (Total Expense Ratio) rappresenta il costo annuale di gestione di un prodotto finanziario come un fondo comune o un ETF. Si aggiunge al costo della consulenza e impatta direttamente sul rendimento finale dell'investimento."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
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

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "costo-consulente-finanziario",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Costo Consulente Finanziario",
  "lang": "it",
  "inputs": [
    { "id": "patrimonio", "label": "Patrimonio in Gestione", "type": "number", "unit": "€", "step": 10000, "tooltip": "L'ammontare totale del capitale che affideresti al consulente." },
    { "id": "parcella_percentuale", "label": "Parcella a Percentuale (%)", "type": "number", "unit": "%", "step": 0.1, "tooltip": "La parcella annuale richiesta dal consulente come percentuale del patrimonio (es. 1.0)." },
    { "id": "parcella_fissa", "label": "Parcella Fissa Annuale (€)", "type": "number", "unit": "€", "step": 100, "tooltip": "La parcella fissa annuale richiesta da un consulente alternativo." },
    { "id": "costo_prodotti_ter", "label": "Costo Medio Prodotti (TER %)", "type": "number", "unit": "%", "step": 0.05, "tooltip": "Il costo annuo medio degli strumenti finanziari (ETF, fondi) nel tuo portafoglio (es. 0.25)." },
    { "id": "rendimento_lordo_atteso", "label": "Rendimento Lordo Atteso (%)", "type": "number", "unit": "%", "step": 0.5, "tooltip": "Il rendimento medio annuo che ti aspetti dal tuo portafoglio, al lordo di costi e tasse (es. 5.0)." },
    { "id": "orizzonte_temporale", "label": "Orizzonte Temporale (Anni)", "type": "number", "unit": "anni", "step": 1, "tooltip": "Per quanti anni prevedi di mantenere l'investimento." }
  ],
  "content": "### **Guida all'Analisi dei Costi della Consulenza Finanziaria**\n\n**Parcella Fissa vs. Percentuale: Come Scegliere e Capire l'Impatto a Lungo Termine**\n\nLa scelta di un consulente finanziario è uno dei passi più importanti per la gestione efficace dei propri risparmi. Comprendere il suo costo è fondamentale, poiché anche piccole differenze percentuali possono avere un impatto enorme sul tuo capitale nel lungo periodo.\n\nQuesto strumento è progettato per offrirti una **simulazione trasparente e dettagliata**, confrontando i due modelli di parcella più diffusi e mostrandoti l'erosione del capitale dovuta ai costi nel tempo. Ricorda, i risultati sono una stima e **non sostituiscono un'analisi personalizzata** con un professionista qualificato.\n\n### **Parte 1: I Modelli di Parcella a Confronto**\n\n1.  **Parcella a Percentuale (% sul Patrimonio)**: Il consulente percepisce una percentuale annua del capitale che gestisce. È il modello più diffuso. Il suo compenso **cresce al crescere del tuo patrimonio**, creando un potenziale allineamento di interessi, ma può diventare molto oneroso su capitali elevati.\n\n2.  **Parcella Fissa (€ Annuale)**: Il consulente chiede un compenso fisso, indipendente dall'ammontare del patrimonio. Questo modello offre **massima trasparenza e prevedibilità dei costi**. Generalmente, è più vantaggioso per patrimoni medio-grandi.\n\n#### **Il Costo Nascosto: Il TER dei Prodotti**\n\nOltre alla parcella del consulente, esiste un altro costo cruciale: il **TER (Total Expense Ratio)**. È il costo annuale di gestione degli strumenti finanziari (come ETF o fondi comuni) che compongono il tuo portafoglio. Questo costo viene prelevato direttamente dal patrimonio del fondo, riducendone il rendimento. Un buon consulente ti aiuta a scegliere prodotti efficienti con TER bassi.\n\n### **Parte 2: L'Impatto dei Costi nel Tempo**\n\nL'interesse composto è un potente motore di crescita, ma funziona anche al contrario: i costi, se non controllati, **compongono un effetto frenante** sul tuo patrimonio. Una differenza di costo dell'1% all'anno può sembrare piccola, ma su un orizzonte di 20 o 30 anni può significare decine o centinaia di migliaia di euro in meno nel tuo portafoglio.\n\nIl grafico della proiezione a lungo termine in questo calcolatore ti mostra visivamente questo effetto, confrontando l'evoluzione del tuo capitale con una parcella fissa, una a percentuale e uno scenario di base con i soli costi di prodotto.\n\n### **Parte 3: Calcolatore Inverso - Quale Valore Deve Portare il Consulente?**\n\nPagare una parcella non è solo un costo, ma l'acquisto di un servizio. Un consulente di valore non si limita a scegliere i prodotti giusti, ma offre benefici tangibili che possono ampiamente giustificare il suo onorario.\n\nIl **Calcolatore Inverso** ti aiuta a quantificare questo valore. Inserendo la parcella che pagheresti, lo strumento calcola l'**extra-rendimento annuo** che il consulente dovrebbe farti ottenere per ripagare il suo costo. Ma il valore va oltre il rendimento:\n\n* **Ottimizzazione Fiscale**: Sfruttare al meglio le normative per ridurre il carico fiscale.\n* **Pianificazione Successoria e Previdenziale**: Costruire una strategia che protegga te e la tua famiglia nel futuro.\n* **Coaching Comportamentale**: Aiutarti a non commettere errori costosi dettati dall'emotività durante le crisi di mercato.\n* **Risparmio di Tempo**: Gestire la complessità dei mercati al posto tuo, liberando il tuo tempo."
};

const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const formatPercentage = (value: number) => `${(value).toFixed(2).replace('.', ',')}%`;


const CostoConsulenteFinanziario: React.FC = () => {
    const { slug, title, inputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      patrimonio: 150000,
      parcella_percentuale: 1.0,
      parcella_fissa: 1500,
      costo_prodotti_ter: 0.25,
      rendimento_lordo_atteso: 6.0,
      orizzonte_temporale: 20,
      // Stato per il calcolatore inverso
      parcella_inversa: 2000,
      patrimonio_inverso: 200000,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { patrimonio, parcella_percentuale, parcella_fissa, costo_prodotti_ter, rendimento_lordo_atteso, orizzonte_temporale } = states;
        
        // --- Calcoli Annuali ---
        const costo_annuo_percentuale = patrimonio * (parcella_percentuale / 100);
        const costo_annuo_prodotti = patrimonio * (costo_prodotti_ter / 100);
        
        const totale_costi_percentuale = costo_annuo_percentuale + costo_annuo_prodotti;
        const totale_costi_fisso = parcella_fissa + costo_annuo_prodotti;
        
        const impatto_percentuale = (totale_costi_percentuale / patrimonio) * 100;
        const impatto_fisso = (totale_costi_fisso / patrimonio) * 100;

        // --- Proiezione a Lungo Termine ---
        const projectionData = [];
        let capitale_percentuale = patrimonio;
        let capitale_fisso = patrimonio;
        let capitale_base = patrimonio; // Solo costi prodotto

        for (let i = 0; i <= orizzonte_temporale; i++) {
            projectionData.push({
                anno: i,
                'Con Parcella %': Math.round(capitale_percentuale),
                'Con Parcella Fissa': Math.round(capitale_fisso),
                'Senza Consulenza (solo TER)': Math.round(capitale_base),
            });
            
            // Calcolo per l'anno successivo
            const rendimento_percentuale = capitale_percentuale * (rendimento_lordo_atteso / 100);
            const costo_cons_perc = capitale_percentuale * (parcella_percentuale / 100);
            const costo_prod_perc = capitale_percentuale * (costo_prodotti_ter / 100);
            capitale_percentuale += rendimento_percentuale - costo_cons_perc - costo_prod_perc;

            const rendimento_fisso = capitale_fisso * (rendimento_lordo_atteso / 100);
            const costo_prod_fisso = capitale_fisso * (costo_prodotti_ter / 100);
            capitale_fisso += rendimento_fisso - parcella_fissa - costo_prod_fisso;
            
            const rendimento_base = capitale_base * (rendimento_lordo_atteso / 100);
            const costo_prod_base = capitale_base * (costo_prodotti_ter / 100);
            capitale_base += rendimento_base - costo_prod_base;
        }
        
        // --- Calcolatore Inverso ---
        const { parcella_inversa, patrimonio_inverso } = states;
        const extra_rendimento_necessario = patrimonio_inverso > 0 ? (parcella_inversa / patrimonio_inverso) * 100 : 0;


        return {
            costo_annuo_percentuale,
            costo_annuo_fisso: parcella_fissa,
            costo_annuo_prodotti,
            totale_costi_percentuale,
            totale_costi_fisso,
            impatto_percentuale,
            impatto_fisso,
            projectionData,
            extra_rendimento_necessario,
            punto_pareggio: parcella_percentuale > 0 ? parcella_fissa / (parcella_percentuale / 100) : 0
        };
    }, [states]);

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
            pdf.save(`${slug}_simulazione.pdf`);
        } catch (_e) { alert("Impossibile generare il PDF in questo ambiente."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { projectionData, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);
    
    const renderComparisonCard = (title: string, costoConsulenza: number, costoProdotti: number, costoTotale: number, impatto: number) => (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Costo Consulenza</span>
                <span className="font-medium text-gray-900">{isClient ? formatCurrency(costoConsulenza) : '...'}</span>
            </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Costo Prodotti (TER)</span>
                <span className="font-medium text-gray-900">{isClient ? formatCurrency(costoProdotti) : '...'}</span>
            </div>
            <hr className="my-2"/>
             <div className="flex justify-between items-center text-base">
                <span className="font-semibold text-gray-700">Costo Totale Annuo</span>
                <span className="font-bold text-indigo-600">{isClient ? formatCurrency(costoTotale) : '...'}</span>
            </div>
             <div className="flex justify-between items-center text-base">
                <span className="font-semibold text-gray-700">Impatto sul Patrimonio</span>
                <span className="font-bold text-indigo-600">{isClient ? formatPercentage(impatto) : '...'}</span>
            </div>
        </div>
    );

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Confronta i modelli di parcella, visualizza i costi a lungo termine e calcola il valore aggiunto del tuo consulente.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo. I rendimenti non sono garantiti. I risultati non sostituiscono in alcun modo una consulenza finanziaria professionale.
                        </div>

                        {/* --- SEZIONE INPUT --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => (
                                <div key={input.id} className={input.id === 'patrimonio' ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- SEZIONE RISULTATI ANNUALI --- */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Confronto Costo Annuale</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderComparisonCard('Modello a Percentuale', calculatedOutputs.costo_annuo_percentuale, calculatedOutputs.costo_annuo_prodotti, calculatedOutputs.totale_costi_percentuale, calculatedOutputs.impatto_percentuale)}
                                {renderComparisonCard('Modello a Parcella Fissa', calculatedOutputs.costo_annuo_fisso, calculatedOutputs.costo_annuo_prodotti, calculatedOutputs.totale_costi_fisso, calculatedOutputs.impatto_fisso)}
                            </div>
                            {calculatedOutputs.punto_pareggio > 0 && (
                                <div className="mt-4 text-center text-sm text-gray-700 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                    Con questi parametri, la parcella fissa diventa più conveniente della percentuale per patrimoni superiori a **{isClient ? formatCurrency(calculatedOutputs.punto_pareggio) : '...'}**.
                                </div>
                            )}
                        </div>

                        {/* --- SEZIONE PROIEZIONE A LUNGO TERMINE --- */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Proiezione del Patrimonio a {states.orizzonte_temporale} Anni</h2>
                            <p className="text-sm text-gray-600 mb-4">Il grafico mostra come i diversi modelli di costo impattano sulla crescita del tuo capitale nel tempo.</p>
                            <div className="h-96 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={calculatedOutputs.projectionData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis dataKey="anno" label={{ value: 'Anni', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 12 }} />
                                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('it-IT', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} tick={{ fontSize: 12 }} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend wrapperStyle={{fontSize: "12px"}} />
                                            <Line type="monotone" dataKey="Senza Consulenza (solo TER)" stroke="#4ade80" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="Con Parcella Fissa" stroke="#4f46e5" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="Con Parcella %" stroke="#f87171" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                         {/* --- SEZIONE CALCOLATORE INVERSO --- */}
                        <div className="mt-8">
                             <h2 className="text-xl font-semibold text-gray-700 mb-4">Calcolatore Inverso: Il Valore del Consulente</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="parcella_inversa">Parcella Annuale Pagata</label>
                                    <div className="flex items-center gap-2">
                                        <input id="parcella_inversa" className="w-full border-gray-300 rounded-md" type="number" step={100} value={states.parcella_inversa} onChange={(e) => handleStateChange('parcella_inversa', e.target.value === "" ? "" : Number(e.target.value))} />
                                        <span className="text-sm text-gray-500">€</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="patrimonio_inverso">Sul Patrimonio di</label>
                                    <div className="flex items-center gap-2">
                                        <input id="patrimonio_inverso" className="w-full border-gray-300 rounded-md" type="number" step={10000} value={states.patrimonio_inverso} onChange={(e) => handleStateChange('patrimonio_inverso', e.target.value === "" ? "" : Number(e.target.value))} />
                                        <span className="text-sm text-gray-500">€</span>
                                    </div>
                                </div>
                             </div>
                             <div className="mt-4 p-4 rounded-lg bg-indigo-50 border-l-4 border-indigo-500">
                                <p className="text-sm md:text-base font-medium text-gray-700">Per giustificare il suo costo, il tuo consulente dovrebbe generare un valore aggiunto (extra-rendimento, risparmio fiscale, ecc.) pari ad almeno:</p>
                                <div className="text-2xl md:text-3xl font-bold text-indigo-600 mt-2">
                                    <span>{isClient ? formatPercentage(calculatedOutputs.extra_rendimento_necessario) : '...'}</span> all'anno
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Calcolo</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.consob.it/web/investor-education/costi-e-benefici" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">CONSOB - L'educazione finanziaria</a></li>
                            <li><a href="https://www.bancaditalia.it/compiti/tutela-clienti/educazione-finanziaria/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Banca d'Italia - Educazione Finanziaria</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CostoConsulenteFinanziario;