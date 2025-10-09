'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const meta = {
  title: "Calcolatore Rendita Orto Urbano: Stima Guadagni e ROI",
  description: "Simula i costi, i ricavi e il punto di pareggio del tuo orto urbano. Uno strumento pratico per pianificare la tua attività di agricoltura a km 0."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 inline-block">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
            "name": "Quanto si può guadagnare con un orto urbano?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il guadagno (rendita) di un orto urbano varia enormemente in base a superficie, tipo di colture, costi di gestione e canali di vendita. Un piccolo orto ben gestito può generare un reddito integrativo interessante, con rendite che possono andare da 5 a oltre 20 € per metro quadrato all'anno. Questo calcolatore aiuta a stimare il potenziale specifico del tuo progetto."
            }
          },
          {
            "@type": "Question",
            "name": "È necessaria la Partita IVA per vendere i prodotti dell'orto?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Dipende dalla continuità e dal volume d'affari. Per vendite occasionali e ricavi contenuti (sotto i 5.000 € annui), spesso non è richiesta la Partita IVA, ma i proventi vanno dichiarati come 'redditi diversi'. Se l'attività diventa abituale e professionale, è necessario aprire una Partita IVA come imprenditore agricolo. Si consiglia di consultare un commercialista."
            }
          },
          {
            "@type": "Question",
            "name": "Quali sono le coltivazioni più redditizie per un orto urbano?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Le coltivazioni più redditizie sono quelle ad alto valore aggiunto e con cicli colturali brevi. Esempi includono erbe aromatiche, micro-ortaggi (microgreens), fiori eduli, varietà di pomodori particolari, e insalate speciali. La chiave è puntare su prodotti freschissimi che la grande distribuzione non può offrire con la stessa qualità."
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
                 if (trimmedBlock.match(/^\d\.\s/)) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                    return (
                        <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ol>
                    );
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// --- Dati di Configurazione ---
const calculatorData = {
  "slug": "rendita-orto-urbano",
  "category": "Agricoltura e Cibo",
  "title": "Calcolatore Rendita di un Orto Urbano",
  "lang": "it",
  "inputs": [
    { "id": "superficie", "label": "Superficie coltivabile", "type": "number" as const, "unit": "m²", "min": 1, "step": 5, "tooltip": "Inserisci l'area netta dedicata alla coltivazione in metri quadrati. Escludi camminamenti e aree non produttive." },
    { "id": "costo_impianto", "label": "Costo iniziale di impianto", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Indica l'investimento totale per avviare l'orto: preparazione del terreno, acquisto attrezzi, impianto di irrigazione, sementi iniziali, etc." },
    { "id": "costo_gestione_annuo", "label": "Costi di gestione annui", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Stima i costi operativi per un anno: acqua, sementi/piantine, fertilizzanti, manutenzione, eventuali quote associative o affitto del terreno." },
    { "id": "resa_mq_annua", "label": "Resa media annua per m²", "type": "number" as const, "unit": "kg/m²", "min": 0.5, "step": 0.5, "tooltip": "Stima la quantità di prodotto raccolto in un anno per ogni metro quadrato. Varia molto in base alla coltura (es. pomodori: 4-8 kg/m², insalata: 2-4 kg/m²)." },
    { "id": "prezzo_vendita_kg", "label": "Prezzo medio di vendita", "type": "number" as const, "unit": "€/kg", "min": 0.1, "step": 0.1, "tooltip": "Indica il prezzo medio al quale prevedi di vendere i tuoi prodotti. Considera la vendita diretta, mercati a km 0, etc." },
    { "id": "certificazione_biologica", "label": "Possiedi una certificazione biologica?", "type": "boolean" as const, "tooltip": "Spunta questa casella se hai ottenuto una certificazione biologica ufficiale. Questo può giustificare un prezzo di vendita più alto (premium price)." }
  ],
  "outputs": [
    { "id": "reddito_operativo_annuo", "label": "Reddito Operativo Annuo Stimato", "unit": "€" },
    { "id": "anni_rientro_investimento", "label": "Anni per il Rientro dell'Investimento (Payback Period)", "unit": "anni" },
    { "id": "rendita_mq", "label": "Rendita Annua per Metro Quadrato", "unit": "€/m²" }
  ],
  "content": "### **Guida Definitiva alla Rendita di un Orto Urbano**\n\n**Dall'Hobby alla Micro-Imprenditorialità: Analisi, Calcolo e Ottimizzazione**\n\nL'agricoltura urbana è una realtà in crescita, capace di rigenerare spazi, produrre cibo a km 0 e creare nuove opportunità di reddito. Tuttavia, trasformare un pezzo di terra in un'attività profittevole richiede pianificazione e un'analisi accurata dei costi e dei ricavi. A differenza della valutazione di un terreno agricolo tradizionale, basata su valori catastali ed ettari, la rendita di un orto urbano dipende da fattori microeconomici e dalla capacità di valorizzare la produzione.\n\nQuesto strumento è progettato per aiutarti a stimare il potenziale economico del tuo orto, fornendo una base solida per il tuo progetto. **Ricorda: i risultati sono una stima** e il successo dipende dalla tua abilità, dalle condizioni climatiche e dalle dinamiche del mercato locale.\n\n### **Parte 1: Il Calcolatore - Comprendere le Variabili Chiave**\n\nIl nostro calcolatore si basa su un modello di conto economico semplificato, focalizzato sui parametri essenziali per un orto urbano. Vediamo ogni voce nel dettaglio.\n\n* **Superficie Coltivabile (m²)**: È il cuore produttivo del tuo orto. Una misurazione precisa è fondamentale. Maggiore è la superficie, maggiori saranno la produzione potenziale e i costi di gestione.\n\n* **Costo Iniziale di Impianto (€)**: Rappresenta l'investimento una tantum (CAPEX). Include tutto ciò che serve per partire: acquisto di attrezzi di qualità, sistemi di irrigazione a goccia (per efficienza idrica), creazione di aiuole rialzate, acquisto di compost e terra di buona qualità. Un buon impianto iniziale riduce i costi di gestione futuri.\n\n* **Costi di Gestione Annui (€)**: Sono i costi operativi (OPEX) che sosterrai ogni anno. La voce più importante è spesso l'acqua, seguita da sementi/piantine, fertilizzanti naturali, prodotti per la difesa delle colture (se necessari) e l'eventuale affitto del terreno o quote per orti comunali.\n\n* **Resa Media Annua (kg/m²)**: Questo è un parametro cruciale e molto variabile. Dipende da:\n    * **Tipo di Coltura**: Ortaggi a frutto come pomodori o zucchine hanno rese elevate. Ortaggi a foglia come l'insalata hanno rese inferiori in peso ma cicli più veloci. Le erbe aromatiche hanno una resa bassa ma un prezzo di vendita molto alto.\n    * **Tecnica Coltivata**: Tecniche come la coltivazione verticale o l'associazione di colture possono aumentare significativamente la resa per metro quadrato.\n\n* **Prezzo Medio di Vendita (€/kg)**: La tua capacità di vendere bene è tanto importante quanto la capacità di produrre bene. I canali di vendita diretta (mercati contadini, gruppi di acquisto solidale, vendita diretta in loco) permettono di spuntare prezzi più alti rispetto alla vendita a intermediari.\n\n* **Certificazione Biologica**: Ottenere una certificazione biologica ufficiale ha un costo e richiede il rispetto di un disciplinare rigido, ma permette di accedere a una fascia di mercato disposta a pagare un *premium price* (generalmente dal 20% al 40% in più).\n\n#### **Interpretazione dei Risultati**\n\n* **Reddito Operativo Annuo (€)**: È il profitto generato dalla sola gestione, prima di considerare l'investimento iniziale. Un valore positivo indica che l'attività è sostenibile su base annua.\n* **Anni per il Rientro dell'Investimento**: Indica in quanto tempo il reddito operativo riuscirà a coprire il costo iniziale di impianto. Un valore basso (es. 2-4 anni) è indice di un investimento molto efficiente.\n* **Rendita Annua per Metro Quadrato (€/m²)**: Questo è l'indicatore di efficienza più importante. Ti permette di confrontare la performance del tuo orto con altri progetti o con diverse scelte colturali.\n\n### **Parte 2: Aspetti Normativi e Fiscali per l'Orto Urbano**\n\nPrima di iniziare a vendere i prodotti, è fondamentale comprendere il quadro normativo. La legislazione può variare a livello comunale e regionale.\n\n#### **Distinzione Chiave: Attività Hobbistica vs. Attività Imprenditoriale**\n\n1.  **Coltivatore Diretto Hobbista**: Se la coltivazione è occasionale e i ricavi sono marginali (generalmente sotto una certa soglia annua, spesso indicata in 5.000 €), l'attività può non richiedere l'apertura di una Partita IVA. I ricavi vanno comunque dichiarati come \"redditi diversi\".\n2.  **Imprenditore Agricolo**: Se l'attività è svolta in modo abituale e professionale, è necessario aprire una Partita IVA agricola. Questo comporta obblighi contabili e fiscali, ma anche l'accesso a specifici regimi agevolati e incentivi.\n\n#### **Regolamenti Comunali sugli Orti Urbani**\n\nMolti comuni italiani si sono dotati di un \"Regolamento per la gestione degli Orti Urbani\". Questi regolamenti disciplinano l'assegnazione dei terreni pubblici, le tecniche di coltivazione ammesse (spesso con un focus sul biologico e sul risparmio idrico), e le modalità di gestione degli spazi comuni. È essenziale consultare il regolamento del proprio comune.\n\n### **Parte 3: Strategie per Massimizzare la Rendita**\n\n* **Scegliere Colture ad Alto Valore**: Concentrarsi su prodotti di nicchia, varietà antiche, erbe aromatiche o ortaggi molto richiesti dai ristoranti locali può aumentare significativamente i ricavi.\n* **Diversificare l'Offerta**: Non puntare su una sola coltura. La diversificazione riduce i rischi legati a malattie o andamenti di mercato e permette di offrire una cassetta mista settimanale, un prodotto molto apprezzato.\n* **Trasformazione del Prodotto**: Laddove consentito, una semplice trasformazione (es. produzione di conserve, salse, erbe essiccate) può aumentare enormemente il valore aggiunto del raccolto.\n* **Marketing e Vendita Diretta**: Creare un brand, usare i social media per raccontare la storia del proprio orto e stabilire un rapporto di fiducia con i clienti sono attività cruciali per spuntare un prezzo migliore e fidelizzare la clientela.\n\n### **Conclusione**\n\nUn orto urbano può essere molto più di un passatempo. Con una pianificazione attenta, una gestione efficiente e una buona strategia di vendita, può diventare una fonte di reddito sostenibile e un progetto di grande soddisfazione personale. Usa questo calcolatore come punto di partenza per costruire il tuo business plan e trasformare il tuo pollice verde in un'opportunità concreta."
};

const RenditaOrtoUrbanoCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      superficie: 50,
      costo_impianto: 1500,
      costo_gestione_annuo: 400,
      resa_mq_annua: 5,
      prezzo_vendita_kg: 3.5,
      certificazione_biologica: true
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { superficie, resa_mq_annua, prezzo_vendita_kg, certificazione_biologica, costo_gestione_annuo, costo_impianto } = states;
        
        const produzione_annua_kg = superficie * resa_mq_annua;
        const ricavi_annui_lordi = produzione_annua_kg * prezzo_vendita_kg;
        const fattore_premio_bio = certificazione_biologica ? 1.20 : 1;
        const ricavi_effettivi = ricavi_annui_lordi * fattore_premio_bio;
        const reddito_operativo_annuo = ricavi_effettivi - costo_gestione_annuo;
        const anni_rientro_investimento = costo_impianto > 0 && reddito_operativo_annuo > 0 ? costo_impianto / reddito_operativo_annuo : 0;
        const rendita_mq = superficie > 0 ? reddito_operativo_annuo / superficie : 0;

        return {
            reddito_operativo_annuo,
            anni_rientro_investimento,
            rendita_mq,
            ricavi_effettivi,
            costo_gestione_annuo
        };
    }, [states]);

    const chartData = [
        { name: 'Analisi Annua', Ricavi: calculatedOutputs.ricavi_effettivi, Costi: calculatedOutputs.costo_gestione_annuo, Profitto: calculatedOutputs.reddito_operativo_annuo },
    ];

    const formulaUsata = `Reddito Annuo = (Superficie * Resa/m² * Prezzo/kg * FattoreBio) - Costi Gestione`;

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
      } catch (e) { 
        alert("Errore durante l'esportazione in PDF."); 
        console.error(e);
      }
    }, [slug]);

    const saveResult = useCallback(() => {
      try {
        const { ricavi_effettivi, costo_gestione_annuo, ...outputsToSave } = calculatedOutputs;
        const payload = { slug, title, inputs: states, outputs: outputsToSave, timestamp: new Date().toISOString() };
        const history = JSON.parse(localStorage.getItem("calculator_history") || "[]");
        history.unshift(payload);
        localStorage.setItem("calculator_history", JSON.stringify(history.slice(0, 10)));
        alert("Risultato salvato nello storico locale del browser!");
      } catch { 
        alert("Impossibile salvare il risultato. Spazio di archiviazione locale potrebbe essere pieno o non disponibile.");
      }
    }, [states, calculatedOutputs, slug, title]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat('it-IT', options).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{meta.description}</p>
                        <div className="text-xs text-orange-800 bg-orange-50 border border-orange-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non può sostituire un business plan professionale o una consulenza agronomica e fiscale.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg border">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border self-center">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="relative">
                                            <input 
                                              id={input.id} 
                                              aria-label={input.label} 
                                              className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2" 
                                              type="number" 
                                              min={input.min} 
                                              step={input.step} 
                                              value={states[input.id]} 
                                              onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} 
                                            />
                                            {input.unit && <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 pointer-events-none">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'reddito_operativo_annuo' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'reddito_operativo_annuo' ? 'text-green-700' : 'text-gray-800'}`}>
                                      {isClient ? (
                                        <>
                                          {output.unit === '€' && formatCurrency((calculatedOutputs as any)[output.id])}
                                          {output.unit === '€/m²' && `${formatCurrency((calculatedOutputs as any)[output.id])}/m²`}
                                          {output.unit === 'anni' && (
                                            (calculatedOutputs as any)[output.id] > 0
                                            ? `${formatNumber((calculatedOutputs as any)[output.id], { maximumFractionDigits: 2 })} anni`
                                            : 'N/A'
                                          )}
                                        </>
                                      ) : '...'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Analisi Economica Annua</h3>
                            <div className="h-72 w-full bg-gray-50 p-4 rounded-lg border">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 12 }} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                                            <Legend wrapperStyle={{fontSize: "14px"}} />
                                            <Bar dataKey="Ricavi" fill="#22c55e" />
                                            <Bar dataKey="Costi" fill="#ef4444" />
                                            <Bar dataKey="Profitto" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                         <div className="mt-6 border rounded-lg shadow-sm p-4 bg-white">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                            <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={saveResult} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full border text-sm font-medium border-red-300 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
                        </div>
                    </section>

                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida all'Uso e Approfondimenti</h2>
                        <ContentRenderer content={content} />
                    </section>
                    
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Utili</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.gazzettaufficiale.it/eli/id/2015/03/18/15G00037/sg" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Legge sull'Agricoltura Sociale (L. 141/2015)</a></li>
                            <li><a href="https://www.mise.gov.it/it/impresa/competitivita-e-nuove-imprese/startup-e-pmi-innovative" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Incentivi per Startup e PMI Innovative (potenzialmente applicabili)</a></li>
                            <li><a href="https://www.crea.gov.it/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Consiglio per la ricerca in agricoltura (CREA)</a> - Per dati tecnici e ricerche.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default RenditaOrtoUrbanoCalculator;