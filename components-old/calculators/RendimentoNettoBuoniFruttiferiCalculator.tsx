'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- SEO e Metadati per la Pagina ---
export const meta = {
  title: "Calcolatore Rendimento Netto Buoni Fruttiferi Postali | CDP",
  description: "Simula il rendimento netto del tuo investimento in Buoni Fruttiferi Postali. Confronta Buono Ordinario, 3 Anni Plus e altri. Calcolo con tassazione al 12.5%."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
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

// --- Dati Strutturati SEO (JSON-LD) ---
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
            "name": "Qual è la tassazione dei Buoni Fruttiferi Postali?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I Buoni Fruttiferi Postali godono di una tassazione agevolata. La ritenuta fiscale sugli interessi è del 12.5%, molto più bassa del 26% applicato sulla maggior parte degli altri strumenti finanziari. Sono inoltre esenti da imposta di successione."
            }
          },
          {
            "@type": "Question",
            "name": "I Buoni Fruttiferi Postali sono sicuri?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, sono considerati uno degli investimenti più sicuri disponibili in Italia. Sono emessi da Cassa Depositi e Prestiti S.p.A. e sono garantiti direttamente dallo Stato Italiano. Il capitale investito è sempre rimborsabile."
            }
          },
          {
            "@type": "Question",
            "name": "Posso ritirare i soldi prima della scadenza del Buono?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, puoi chiedere il rimborso del tuo Buono in qualsiasi momento. Ti verrà restituito il 100% del capitale investito. Tuttavia, a seconda del tipo di Buono e di quanto tempo è trascorso dalla sottoscrizione, potresti non aver diritto agli interessi maturati."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il Rendering del Contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    };
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('* **')) {
                  const title = trimmedBlock.match(/\*\*\s*(.*?)\s*\*\*/)?.[1] || '';
                  const text = trimmedBlock.split('**: ')[1] || '';
                  return <div key={index} className="mt-3"><dt className="font-bold text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(title) }}/><dd className="mt-1" dangerouslySetInnerHTML={{__html: processInlineFormatting(text)}}></dd></div>
                }
                if (trimmedBlock.match(/^\d\./)) {
                  return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// --- Dati di Configurazione del Calcolatore ---
const calculatorData = {
  "slug": "rendimento-netto-buoni-fruttiferi", "category": "Risparmio e Investimenti", "title": "Calcolatore Rendimento Netto Buoni Fruttiferi Postali", "lang": "it",
  "bondData": {
    "ordinario": { "name": "Buono Ordinario", "maxDuration": 20, "yields": [{ "year": 1, "rate": 0.0050 }, { "year": 2, "rate": 0.0050 }, { "year": 3, "rate": 0.0100 }, { "year": 4, "rate": 0.0125 }, { "year": 5, "rate": 0.0125 }, { "year": 6, "rate": 0.0150 }, { "year": 7, "rate": 0.0175 }, { "year": 8, "rate": 0.0175 }, { "year": 9, "rate": 0.0175 }, { "year": 10, "rate": 0.0200 }, { "year": 11, "rate": 0.0200 }, { "year": 12, "rate": 0.0200 }, { "year": 13, "rate": 0.0225 }, { "year": 14, "rate": 0.0225 }, { "year": 15, "rate": 0.0225 }, { "year": 16, "rate": 0.0250 }, { "year": 17, "rate": 0.0250 }, { "year": 18, "rate": 0.0250 }, { "year": 19, "rate": 0.0275 }, { "year": 20, "rate": 0.0275 }] },
    "3_anni_plus": { "name": "Buono 3 Anni Plus", "maxDuration": 3, "yields": [{ "year": 1, "rate": 0.0 }, { "year": 2, "rate": 0.0 }, { "year": 3, "rate": 0.0200 }] },
    "rinnova": { "name": "Buono Rinnova", "maxDuration": 6, "yields": [{ "year": 1, "rate": 0.0 }, { "year": 2, "rate": 0.0 }, { "year": 3, "rate": 0.0200 }, { "year": 4, "rate": 0.0200 }, { "year": 5, "rate": 0.0200 }, { "year": 6, "rate": 0.0300 }] },
    "minori": { "name": "Buono per i minori", "maxDuration": 18, "yields": [{ "year": 1, "rate": 0.0250 }, { "year": 2, "rate": 0.0250 }, { "year": 3, "rate": 0.0250 }, { "year": 4, "rate": 0.0250 }, { "year": 5, "rate": 0.0250 }, { "year": 6, "rate": 0.0300 }, { "year": 7, "rate": 0.0300 }, { "year": 8, "rate": 0.0300 }, { "year": 9, "rate": 0.0300 }, { "year": 10, "rate": 0.0300 }, { "year": 11, "rate": 0.0300 }, { "year": 12, "rate": 0.0400 }, { "year": 13, "rate": 0.0400 }, { "year": 14, "rate": 0.0400 }, { "year": 15, "rate": 0.0400 }, { "year": 16, "rate": 0.0400 }, { "year": 17, "rate": 0.0400 }, { "year": 18, "rate": 0.0600 }] }
  },
  "inputs": [
    { "id": "tipoBuono", "label": "Tipologia di Buono", "type": "radio", "options": [{ "value": "ordinario", "label": "Ordinario" }, { "value": "3_anni_plus", "label": "3 Anni Plus" }, { "value": "rinnova", "label": "Rinnova" }, { "value": "minori", "label": "Per i minori" }], "tooltip": "Scegli il tipo di Buono che vuoi sottoscrivere. Ogni Buono ha durate e rendimenti diversi, pensati per obiettivi di risparmio differenti." },
    { "id": "importo", "label": "Importo da investire", "type": "number", "unit": "€", "min": 50, "step": 50, "tooltip": "Inserisci il capitale che intendi investire. L'importo minimo per la sottoscrizione è di 50 €." },
    { "id": "durata", "label": "Durata dell'investimento", "type": "slider", "unit": "anni", "min": 1, "step": 1, "tooltip": "Indica per quanti anni prevedi di mantenere l'investimento. Il rendimento dei Buoni aumenta con il passare del tempo." }
  ],
  "outputs": [
    { "id": "valoreRimborsoLordo", "label": "Valore di Rimborso Lordo", "unit": "€" }, { "id": "interessiLordi", "label": "Interessi Lordi Maturati", "unit": "€" },
    { "id": "ritenutaFiscale", "label": "Ritenuta Fiscale (12.5%)", "unit": "€" }, { "id": "valoreRimborsoNetto", "label": "Valore di Rimborso Netto", "unit": "€" },
    { "id": "rendimentoAnnuoNetto", "label": "Rendimento Annuo Effettivo Netto", "unit": "%" }
  ],
  "content": "..." // Contenuto omesso per brevità, sarà inserito nel componente
};

const RendimentoNettoBuoniFruttiferiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, bondData, content } = calculatorData;
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates: { [key: string]: any } = {
        tipoBuono: "ordinario", importo: 5000, durata: 10
    };
    const [states, setStates] = useState(initialStates);

    const activeBond = useMemo(() => bondData[states.tipoBuono as keyof typeof bondData], [states.tipoBuono]);

    useEffect(() => {
        if (states.durata > activeBond.maxDuration) {
            handleStateChange('durata', activeBond.maxDuration);
        }
    }, [states.tipoBuono]);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const { calculatedOutputs, chartData } = useMemo(() => {
        const { importo, durata } = states;
        const tassoAnnuo = activeBond.yields.find(y => y.year === durata)?.rate ?? 0;
        
        const valoreRimborsoLordo = importo * Math.pow(1 + tassoAnnuo, durata);
        const interessiLordi = valoreRimborsoLordo - importo;
        const ritenutaFiscale = interessiLordi * 0.125;
        const valoreRimborsoNetto = valoreRimborsoLordo - ritenutaFiscale;
        const rendimentoAnnuoNetto = importo > 0 && durata > 0 ? (Math.pow(valoreRimborsoNetto / importo, 1 / durata) - 1) * 100 : 0;
        
        const generatedChartData = Array.from({ length: activeBond.maxDuration }, (_, i) => {
          const year = i + 1;
          const rate = activeBond.yields.find(y => y.year === year)?.rate ?? 0;
          const lordo = importo * Math.pow(1 + rate, year);
          const netto = lordo - ((lordo - importo) * 0.125);
          return { name: `Anno ${year}`, "Valore Netto": netto };
        });

        return { 
          calculatedOutputs: { valoreRimborsoLordo, interessiLordi, ritenutaFiscale, valoreRimborsoNetto, rendimentoAnnuoNetto },
          chartData: generatedChartData
        };
    }, [states, activeBond]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula il guadagno netto dei tuoi risparmi con i Buoni Postali.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore si basa sui Fogli Informativi dei Buoni in emissione ad **Agosto 2025** e ha solo scopo informativo. Per calcoli ufficiali, specialmente su Buoni storici, fare riferimento esclusivamente al <a href="https://www.cdp.it/sitointernet/it/calcolo_dei_rendimenti.page" target="_blank" rel="noopener noreferrer" className="underline font-semibold">sito di Cassa Depositi e Prestiti</a>.
                        </div>

                        {/* Sezione Input */}
                        <div className="space-y-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const inputLabel = (<label className="block text-sm font-medium mb-2 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}{input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}</label>);
                                if (input.type === 'radio') return (<div key={input.id}> {inputLabel} <div className="flex flex-wrap gap-2"> {input.options?.map(opt => (<button key={opt.value} onClick={() => handleStateChange(input.id, opt.value)} className={`px-4 py-2 text-sm rounded-md transition-colors border ${states[input.id] === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100 border-gray-300'}`}>{opt.label}</button>))}</div></div>);
                                if (input.type === 'number') return (<div key={input.id}> {inputLabel} <div className="relative"><input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id] || ''} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2" /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">{input.unit}</span></div></div>);
                                if (input.type === 'slider') return (<div key={input.id}> {inputLabel} <div className="flex items-center gap-4"><input id={input.id} type="range" min={input.min} max={activeBond.maxDuration} step={input.step} value={states.durata} onChange={e => handleStateChange(input.id, Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" /><div className="font-bold text-indigo-600 text-lg w-24 text-center">{states.durata} {input.unit}</div></div></div>);
                                return null;
                            })}
                        </div>
                        
                        {/* Sezione Output */}
                        <div className="mt-8 space-y-3">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'valoreRimborsoNetto' ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-gray-50'}`}>
                                    <p className="text-sm md:text-base font-medium text-gray-700">{output.label}</p>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'valoreRimborsoNetto' ? 'text-emerald-600' : 'text-gray-800'}`}>
                                      <span>{isClient ? (output.unit === '€' ? formatCurrency(calculatedOutputs[output.id as keyof typeof calculatedOutputs]) : `${(calculatedOutputs[output.id as keyof typeof calculatedOutputs]).toFixed(2)}%`) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Sezione Grafico */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Crescita dell'Investimento nel Tempo</h3>
                            <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Line type="monotone" dataKey="Valore Netto" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <button onClick={handleReset} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida ai Buoni Postali</h2>
                        <ContentRenderer content={content.replace("### **Guida Completa al Rendimento dei Buoni Fruttiferi Postali**\n\n**Uno strumento chiaro per pianificare i tuoi risparmi in modo sicuro e trasparente.**\n\nI Buoni Fruttiferi Postali (BFP) sono uno degli strumenti di risparmio più amati dagli italiani, grazie alla loro sicurezza, semplicità e a un regime fiscale vantaggioso. Emessi da **Cassa Depositi e Prestiti (CDP)**, sono garantiti direttamente dallo Stato Italiano e collocati in esclusiva da Poste Italiane.\n\nQuesto calcolatore è stato progettato per offrirti una **simulazione chiara e immediata** del rendimento netto dei Buoni attualmente disponibili per la sottoscrizione, aiutandoti a confrontare le diverse soluzioni e a capire quale si adatta meglio ai tuoi obiettivi.", "")} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti Ufficiali</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.cdp.it/sitointernet/it/risparmio_postale.page" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Cassa Depositi e Prestiti - Risparmio Postale</a></li>
                            <li><a href="https://www.poste.it/prodotti/buoni-fruttiferi-postali.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Poste Italiane - Offerta Buoni</a></li>
                             <li><a href="https://www.mef.gov.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ministero dell'Economia e delle Finanze</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default RendimentoNettoBuoniFruttiferiCalculator;