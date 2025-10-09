'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

export const meta = {
  title: "Calcolatore PAC (Piano di Accumulo Capitale) con Tassazione Italiana (26%)",
  description: "Simula il tuo piano di accumulo con il nostro calcolatore avanzato. Visualizza l'impatto dell'interesse composto, dei costi (TER) e della tassazione al 26% sul tuo capitale finale."
};

// --- Helper Components ---

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

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
            "name": "Cos'è un Piano di Accumulo Capitale (PAC)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Un Piano di Accumulo del Capitale (PAC) è una strategia d'investimento che consiste nell'investire somme di denaro costanti a intervalli regolari (es. mensili) in strumenti finanziari come ETF o fondi comuni. È ideale per costruire un patrimonio nel lungo termine sfruttando l'interesse composto e la mediazione del prezzo di acquisto (cost averaging)."
            }
          },
          {
            "@type": "Question",
            "name": "Come viene tassato il guadagno di un PAC in Italia?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "In Italia, i guadagni (plusvalenze o capital gain) generati da un PAC su strumenti come ETF e fondi sono tassati con un'imposta sostitutiva del 26%. Questo calcolatore applica questa aliquota alla differenza tra il valore finale dell'investimento e il totale del capitale versato."
            }
          },
          {
            "@type": "Question",
            "name": "Qual è il vantaggio del 'Cost Averaging' in un PAC?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il 'Cost Averaging' (mediazione del prezzo di carico) consiste nell'investire una somma fissa a scadenze regolari. Questo permette di acquistare più quote quando i prezzi sono bassi e meno quote quando i prezzi sono alti, riducendo il prezzo medio di acquisto complessivo e mitigando il rischio di investire tutto il capitale in un momento sfavorevole del mercato."
            }
          }
        ]
      })
    }}
  />
);

const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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


// Dati di configurazione del calcolatore
const calculatorData = {
  "slug": "piano-di-accumulo-pac-tassazione",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore PAC (Piano di Accumulo Capitale) con tassazione italiana (26%)",
  "lang": "it",
  "inputs": [
    { "id": "versamento_iniziale", "label": "Versamento Iniziale (PIC)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "L'importo iniziale che desideri investire. Se parti da zero, lascia 0." },
    { "id": "versamento_mensile", "label": "Versamento Mensile", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "La rata mensile che prevedi di investire costantemente nel tempo." },
    { "id": "durata_investimento", "label": "Durata dell'Investimento", "type": "number" as const, "unit": "anni", "min": 1, "step": 1, "tooltip": "Il numero di anni per cui prevedi di mantenere attivo il piano di accumulo." },
    { "id": "rendimento_annuo_atteso", "label": "Rendimento Annuo Lordo Atteso", "type": "number" as const, "unit": "%", "min": 0, "step": 0.5, "tooltip": "Il tasso di rendimento medio annuo che ti aspetti dal tuo investimento, al lordo di costi e tasse." },
    { "id": "costi_annuali_ter", "label": "Costi Annuali (TER)", "type": "number" as const, "unit": "%", "min": 0, "step": 0.05, "tooltip": "I costi totali annui dello strumento finanziario (es. TER di un ETF). Vengono sottratti dal rendimento." },
    { "id": "applica_tassazione", "label": "Applica tassazione italiana del 26% sul guadagno?", "type": "boolean" as const, "tooltip": "Seleziona per calcolare il capitale finale netto, sottraendo l'imposta del 26% sulla plusvalenza (capital gain)." }
  ],
  "outputs": [
    { "id": "capitale_versato_totale", "label": "Capitale Totale Versato", "unit": "€" },
    { "id": "montante_lordo", "label": "Montante Lordo Finale", "unit": "€" },
    { "id": "plusvalenza_lorda", "label": "Plusvalenza Lorda (Guadagno)", "unit": "€" },
    { "id": "imposte_sul_guadagno", "label": "Imposte sul Guadagno (26%)", "unit": "€" },
    { "id": "montante_netto_finale", "label": "Montante Netto Finale", "unit": "€" }
  ],
  "content": "### **Guida Completa al Piano di Accumulo del Capitale (PAC)\n\n**Cos'è, Come Funziona e Perché è uno Strumento Potente per i Risparmiatori**\n\nUn Piano di Accumulo del Capitale (PAC) è una strategia di investimento che consiste nell'investire importi costanti a intervalli regolari (solitamente mensili) in strumenti finanziari come fondi comuni o ETF. È una delle modalità più accessibili ed efficaci per costruire un patrimonio nel lungo termine, anche partendo da piccole somme.\n\nQuesto strumento è progettato per offrirti una simulazione chiara e dettagliata del potenziale di crescita del tuo capitale, tenendo conto di variabili fondamentali come il rendimento atteso, i costi e la tassazione italiana sulle plusvalenze.\n\n### **Parte 1: Come Utilizzare il Calcolatore PAC**\n\nIl nostro calcolatore è stato pensato per essere intuitivo ma completo. Ecco una spiegazione di ogni campo per aiutarti a inserire i dati corretti:\n\n* **Versamento Iniziale (PIC)**: È la somma di partenza che investi subito. Se non hai un capitale iniziale, puoi tranquillamente lasciare questo campo a 0.\n* **Versamento Mensile**: L'importo che pianifichi di investire ogni mese. La costanza è la chiave del successo di un PAC.\n* **Durata dell'Investimento**: L'orizzonte temporale del tuo piano, espresso in anni. Più lungo è il periodo, maggiore sarà l'effetto dell'interesse composto.\n* **Rendimento Annuo Lordo Atteso (%)**: La performance media annua che ipotizzi per il tuo investimento. È un valore stimato; i mercati finanziari non offrono rendimenti garantiti. Ricerca i rendimenti storici di asset class simili per farti un'idea (es. un indice azionario globale ha avuto un rendimento medio storico di circa il 7-9%).\n* **Costi Annuali (TER, %)**: Il Total Expense Ratio (TER) è il costo annuo di gestione di un ETF o di un fondo. Viene sottratto direttamente dal rendimento e ha un impatto significativo sul risultato finale. Scegliere strumenti a basso costo è fondamentale.\n* **Applica Tassazione**: Selezionando questa opzione, il calcolatore applicherà l'aliquota del 26% sui guadagni (plusvalenze), mostrandoti il montante netto che effettivamente percepirai al termine del piano.\n\n### **Parte 2: La Logica dietro il Calcolo\n\n#### **L'Interesse Composto: Il Motore del PAC**\n\nLa magia del PAC risiede nell'interesse composto. Significa che gli interessi generati dal tuo investimento vengono reinvestiti, producendo a loro volta nuovi interessi. Albert Einstein lo definì 'l'ottava meraviglia del mondo'. Nel lungo periodo, questo effetto 'palla di neve' può far crescere il tuo capitale in modo esponenziale.\n\n#### **Il Cost Averaging (Mediazione del Prezzo di Carico)**\n\nInvestendo una somma fissa ogni mese, acquisti un numero variabile di quote dello strumento finanziario. Quando i prezzi sono alti, compri meno quote; quando sono bassi, ne compri di più. Questa strategia, nota come 'Dollar Cost Averaging' (o Euro Cost Averaging), riduce il prezzo medio di acquisto nel tempo e mitiga il rischio di entrare sul mercato in un momento sfavorevole.\n\n#### **L'Impatto dei Costi**\n\nAnche una piccola differenza nei costi può avere un impatto enorme sul tuo capitale finale. Un TER dello 0.2% rispetto a un 1.5% può tradursi in decine di migliaia di euro di differenza su un orizzonte di 20-30 anni. Questo calcolatore ti aiuta a visualizzare questo impatto sottraendo i costi dal rendimento annuo.\n\n### **Parte 3: La Tassazione delle Rendite Finanziarie in Italia**\n\nIn Italia, i guadagni derivanti da investimenti finanziari (plusvalenze o 'capital gain') sono soggetti a un'imposta sostitutiva. Comprendere come funziona è essenziale.\n\n* **Aliquota Standard del 26%**: La maggior parte degli strumenti finanziari, come azioni, ETF e fondi comuni, sconta un'aliquota del 26% sulla plusvalenza realizzata. La plusvalenza è la differenza tra il valore finale dell'investimento e il totale dei capitali versati.\n\n* **Aliquota Agevolata del 12.5%**: Si applica solo a specifiche categorie di investimenti, principalmente Titoli di Stato italiani (BTP, BOT, CCT) ed emessi da governi di paesi inclusi nella 'white list'.\n\n**Come funziona il calcolo delle tasse nel nostro simulatore?**\n\n1.  Si calcola il **Capitale Totale Versato** (versamento iniziale + tutti i versamenti mensili).\n2.  Si calcola il **Montante Lordo Finale** generato dagli investimenti.\n3.  Si calcola la **Plusvalenza Lorda** (Montante Lordo - Capitale Versato).\n4.  Se la plusvalenza è positiva, si applica l'aliquota del 26% per calcolare le **Imposte sul Guadagno**.\n5.  Il **Montante Netto Finale** è il Montante Lordo meno le imposte.\n\n**Nota Bene**: Questo calcolatore simula il pagamento delle tasse alla fine del periodo di investimento (regime dichiarativo). Nella realtà, con fondi ed ETF a gestione italiana, la tassazione può essere applicata in modo diverso (regime amministrato o gestito).\n\n### **Conclusione e Disclaimer**\n\nUn PAC è uno strumento straordinario per la pianificazione finanziaria a lungo termine. Questo calcolatore è uno strumento potente per comprendere i meccanismi di crescita e l'impatto di costi e tasse. Tuttavia, i risultati sono una simulazione basata su ipotesi. I rendimenti passati non sono garanzia di quelli futuri e ogni investimento comporta un grado di rischio. **Questo strumento ha uno scopo puramente informativo e non costituisce una consulenza finanziaria.**"
};

const PianoDiAccumuloPacTassazioneCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        versamento_iniziale: 5000,
        versamento_mensile: 200,
        durata_investimento: 20,
        rendimento_annuo_atteso: 7,
        costi_annuali_ter: 0.3,
        applica_tassazione: true,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const { calculatedOutputs, chartData } = useMemo(() => {
        const { versamento_iniziale, versamento_mensile, durata_investimento, rendimento_annuo_atteso, costi_annuali_ter, applica_tassazione } = states;

        const r_annuo_lordo = parseFloat(rendimento_annuo_atteso) / 100 || 0;
        const costo_annuo = parseFloat(costi_annuali_ter) / 100 || 0;
        const r_annuo_netto = r_annuo_lordo - costo_annuo;
        const r_mensile_netto = Math.pow(1 + r_annuo_netto, 1 / 12) - 1;

        const mesi_totali = parseInt(durata_investimento) * 12 || 0;
        const capitale_iniziale_val = parseFloat(versamento_iniziale) || 0;
        const versamento_mensile_val = parseFloat(versamento_mensile) || 0;

        let montante_corrente = capitale_iniziale_val;
        let capitale_versato_corrente = capitale_iniziale_val;
        const history = [{ year: 0, versato: capitale_versato_corrente, valore: montante_corrente }];

        for (let mese = 1; mese <= mesi_totali; mese++) {
            montante_corrente += versamento_mensile_val;
            montante_corrente *= (1 + r_mensile_netto);
            capitale_versato_corrente += versamento_mensile_val;
            if (mese % 12 === 0 || mese === mesi_totali) {
                history.push({
                    year: Math.ceil(mese / 12),
                    versato: capitale_versato_corrente,
                    valore: montante_corrente
                });
            }
        }
        
        const capitale_versato_totale = capitale_iniziale_val + (versamento_mensile_val * mesi_totali);
        const montante_lordo = montante_corrente;
        const plusvalenza_lorda = montante_lordo > capitale_versato_totale ? montante_lordo - capitale_versato_totale : 0;
        const imposte_sul_guadagno = applica_tassazione ? plusvalenza_lorda * 0.26 : 0;
        const montante_netto_finale = montante_lordo - imposte_sul_guadagno;
        
        const calculated = {
            capitale_versato_totale,
            montante_lordo,
            plusvalenza_lorda,
            imposte_sul_guadagno,
            montante_netto_finale
        };
        
        return { calculatedOutputs: calculated, chartData: history };

    }, [states]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

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
      } catch (_e) { alert("Funzione PDF non disponibile in questo ambiente"); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{meta.description}</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non costituisce una consulenza finanziaria. I rendimenti non sono garantiti.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
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
                            {outputs.map(output => {
                                const value = (calculatedOutputs as any)[output.id];
                                const isFinalResult = output.id === 'montante_netto_finale';
                                if (output.id === 'imposte_sul_guadagno' && !states.applica_tassazione) return null;

                                return (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${isFinalResult ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${isFinalResult ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency(value) : '...'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Proiezione di Crescita Annuale</h3>
                            <div className="h-80 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" label={{ value: "Anni", position: 'insideBottomRight', offset: -5 }}/>
                                            <YAxis tickFormatter={(value) => `${formatCurrency(value / 1000)}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="versato" name="Capitale Versato" fill="#a5b4fc" />
                                            <Line type="monotone" dataKey="valore" name="Valore Totale" stroke="#4f46e5" strokeWidth={2} dot={false} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida all'Investimento PAC</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Riferimenti Utili</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.bancaditalia.it/compiti/educazione-finanziaria/conoscenze-base/investire/index.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Banca d'Italia - L'ABC dell'investimento</a></li>
                            <li><a href="https://www.consob.it/web/investor-education/i-piani-di-accumulo-del-capitale-pac-" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">CONSOB - Guida ai Piani di Accumulo</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/pagamenti/imposta-sostitutiva-su-plusvalenze/scheda-informativa-imposta-plusvalenze" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Imposte sulle plusvalenze</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default PianoDiAccumuloPacTassazioneCalculator;