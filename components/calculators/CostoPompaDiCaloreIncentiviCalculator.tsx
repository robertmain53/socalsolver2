'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

// --- SEO e Metadati per la Pagina ---
export const meta = {
  title: "Calcolatore Costo Pompa di Calore con Incentivi (Conto Termico, Ecobonus)",
  description: "Simula il costo reale di una pompa di calore aria-acqua o geotermica. Calcola il valore degli incentivi Conto Termico ed Ecobonus 65% e scopri il ritorno dell'investimento."
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
            "name": "Quanto costa una pompa di calore da 10 kW 'chiavi in mano'?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il costo totale per una pompa di calore aria-acqua da 10 kW, inclusa l'installazione, varia tipicamente tra 9.000€ e 14.000€. Questo calcolatore ti aiuta a stimare un costo più preciso e a vedere l'impatto degli incentivi."
            }
          },
          {
            "@type": "Question",
            "name": "È meglio il Conto Termico o l'Ecobonus 65% per una pompa di calore?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il Conto Termico è spesso più vantaggioso perché fornisce un contributo economico diretto in 2-5 anni, migliorando la liquidità. L'Ecobonus 65% è una detrazione fiscale in 10 anni, adatta a chi ha un'imposta IRPEF sufficientemente alta da poterla sfruttare appieno. La scelta dipende dalla situazione finanziaria e fiscale personale."
            }
          },
          {
            "@type": "Question",
            "name": "In quanto tempo si ripaga una pompa di calore?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il tempo di rientro dell'investimento (payback period) per una pompa di calore, grazie agli incentivi, si è notevolmente ridotto. Solitamente varia tra i 5 e gli 8 anni, a seconda del risparmio energetico ottenuto e del costo finale netto dell'impianto."
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
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('* **')) {
                    const title = trimmedBlock.match(/\*\*\s*(.*?)\s*\*\*/)?.[1] || '';
                    const text = trimmedBlock.split('**: ')[1] || '';
                    return <p key={index} className="mb-4"><strong className="text-gray-800">{title}:</strong> <span dangerouslySetInnerHTML={{__html: processInlineFormatting(text)}} /></p>;
                }
                 if (trimmedBlock.startsWith('| Caratteristica')) {
                    const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).filter(Boolean));
                    const headers = rows.shift() || [];
                     return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map(h => <th key={h} className="p-2 border text-left font-semibold">{processInlineFormatting(h)}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {rows.filter(row => row.length > 1 && !row[0].startsWith('---')).map((row, rIndex) => (
                                        <tr key={rIndex}>
                                            {row.map((cell, cIndex) => <td key={cIndex} className={`p-2 border ${cIndex === 0 ? 'font-semibold' : ''}`} dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock.startsWith('1.') || trimmedBlock.startsWith('2.') || trimmedBlock.startsWith('3.') || trimmedBlock.startsWith('4.')) {
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
  "slug": "costo-pompa-di-calore-incentivi",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Costo Pompa di Calore",
  "lang": "it",
  "inputs": [
    { "id": "tipoImpianto", "label": "Tipologia Pompa di Calore", "type": "radio", "options": [{ "value": "aria_acqua", "label": "Aria-Acqua" }, { "value": "aria_aria", "label": "Aria-Aria (Climatizzatore)" }, { "value": "geotermica", "label": "Geotermica" }], "tooltip": "Aria-Acqua: la più comune per riscaldare e produrre acqua calda sanitaria. Aria-Aria: per riscaldamento/raffrescamento ad aria (climatizzatori). Geotermica: altissima efficienza ma costi di installazione maggiori." },
    { "id": "potenza", "label": "Potenza termica nominale", "type": "number", "unit": "kW", "min": 2, "max": 100, "step": 1, "tooltip": "La potenza (kW) necessaria dipende dalla grandezza e dall'isolamento della casa. Un valore tipico per 100mq è 8-10 kW. Chiedi a un tecnico per un dimensionamento preciso." },
    { "id": "tipoIncentivo", "label": "Scegli l'incentivo da simulare", "type": "radio", "options": [{ "value": "conto_termico", "label": "Conto Termico 2.0" }, { "value": "ecobonus_65", "label": "Ecobonus 65%" }], "tooltip": "Conto Termico: contributo diretto erogato in 2-5 anni, ideale per liquidità. Ecobonus 65%: detrazione fiscale IRPEF ripartita in 10 anni." },
    { "id": "zonaClimatica", "label": "Zona climatica del comune", "type": "radio", "options": [{ "value": "A/B", "label": "A / B" }, { "value": "C", "label": "C" }, { "value": "D", "label": "D" }, { "value": "E", "label": "E" }, { "value": "F", "label": "F" }], "condition": "tipoIncentivo == 'conto_termico'", "tooltip": "L'Italia è divisa in zone climatiche (dalla A, più calda, alla F, più fredda). L'importo del Conto Termico aumenta nelle zone più fredde. Esempio: Roma è zona D, Milano è zona E." },
    { "id": "costoManuale", "label": "Costo personalizzato (opzionale)", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Se hai già un preventivo, inserisci qui il costo totale (fornitura e posa) per una stima più precisa. Altrimenti, il calcolatore userà un costo standard." },
    { "id": "costoRiscaldamentoAttuale", "label": "Costo annuo riscaldamento attuale", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Indica quanto spendi ogni anno per il riscaldamento con il tuo impianto attuale (es. gas metano). Questo dato è essenziale per calcolare il risparmio e il tempo di rientro." }
  ],
  "outputs": [
    { "id": "costoStimatoImpianto", "label": "Costo Stimato dell'Impianto", "unit": "€", "description": "Costo 'chiavi in mano' comprensivo di fornitura e installazione, prima degli incentivi." },
    { "id": "importoIncentivo", "label": "Valore Totale dell'Incentivo", "unit": "€", "description": "L'ammontare totale del bonus. Nota: le modalità di erogazione cambiano (contributo diretto per Conto Termico, detrazione fiscale in 10 anni per Ecobonus)." },
    { "id": "costoFinaleNetto", "label": "Costo Finale al Netto dell'Incentivo", "unit": "€", "description": "La spesa effettiva che sosterrai, considerando il valore totale del bonus." },
    { "id": "risparmioAnnuoStimato", "label": "Risparmio Annuo Stimato in Bolletta", "unit": "€", "description": "La riduzione annuale stimata sulla tua spesa per il riscaldamento, passando a una pompa di calore." },
    { "id": "rientroInvestimento", "label": "Tempo di Rientro dell'Investimento", "unit": "anni", "description": "In quanti anni il risparmio generato coprirà il costo iniziale dell'impianto." }
  ],
  "content": "### **Guida Completa al Costo e agli Incentivi per la Pompa di Calore**\n\n**Dall'analisi dei costi all'ottimizzazione degli incentivi: tutto quello che devi sapere.**\n\nInstallare una pompa di calore è una delle scelte più efficaci per migliorare l'efficienza energetica della propria casa, ridurre le bollette e l'impatto ambientale. Tuttavia, il costo iniziale può sembrare un ostacolo. Grazie ai generosi incentivi statali, l'investimento diventa molto più accessibile e profittevole nel tempo.\n\nQuesto strumento è stato creato per offrire una **simulazione trasparente e dettagliata** dei costi e dei benefici, aiutandoti a navigare tra le diverse opzioni tecnologiche e fiscali. Utilizzalo per ottenere una stima affidabile e per prepararti a dialogare con tecnici e installatori.\n\n### **Parte 1: Cos'è e Come Funziona una Pompa di Calore?**\n\nUna pompa di calore è un macchinario che trasferisce calore da una fonte naturale (aria, acqua o suolo) a un ambiente interno. Funziona in modo simile a un frigorifero, ma al contrario: estrae calore dall'esterno, anche quando fa freddo, e lo immette in casa. In estate, il ciclo può essere invertito per raffrescare gli ambienti.\n\n* **Tipi Principali**:\n  * **Aria-Acqua**: La più diffusa. Preleva calore dall'aria esterna e lo trasferisce all'acqua dell'impianto di riscaldamento (termosifoni, pannelli radianti) e per l'acqua calda sanitaria. È la soluzione ideale per sostituire le vecchie caldaie.\n  * **Aria-Aria**: Preleva calore dall'aria esterna e lo immette nell'ambiente tramite split interni (i classici climatizzatori). Molti modelli offrono sia riscaldamento che raffrescamento.\n  * **Geotermica (Acqua-Acqua)**: Sfrutta la temperatura costante del sottosuolo tramite sonde. Ha la massima efficienza ma richiede lavori di installazione più invasivi e costosi.\n\n### **Parte 2: Analisi Dettagliata dei Costi**\n\nIl costo 'chiavi in mano' di una pompa di calore non si limita al prezzo dell'unità esterna. È fondamentale considerare tutte le voci di spesa:\n\n1.  **Costo dell'unità (interna ed esterna)**: Varia enormemente in base a marca, potenza (kW) e tecnologia.\n2.  **Costo dell'installazione**: Include la manodopera, le opere murarie, i collegamenti elettrici e idraulici.\n3.  **Accessori necessari**: Spesso si aggiunge un bollitore/accumulo per l'acqua calda sanitaria, un puffer (accumulo termico) per ottimizzare il funzionamento, e valvole e filtri.\n4.  **Pratiche burocratiche**: La gestione della pratica per ottenere gli incentivi ha un costo.\n\n**Costi indicativi (fornitura e posa)**:\n- **Pompa di calore Aria-Acqua**: 900 - 1.400 € per kW\n- **Pompa di calore Aria-Aria (monosplit)**: 1.500 - 2.500 € totali\n- **Pompa di calore Geotermica**: 1.800 - 2.500 € per kW (escluse le opere di perforazione)\n\n### **Parte 3: Guida agli Incentivi Statali (Aggiornata 2024/2025)**\n\nLo Stato supporta la transizione energetica con diversi meccanismi. Per le pompe di calore, i più importanti sono il Conto Termico e l'Ecobonus.\n\n#### **Conto Termico 2.0**\n\nÈ l'incentivo più vantaggioso per chi desidera liquidità. Non è una detrazione fiscale, ma un **bonifico diretto sul conto corrente** erogato dal GSE (Gestore Servizi Energetici) in 2 o 5 anni (2 anni per impianti sotto i 35 kW).\n\n* **Come si calcola**: La formula è `Incentivo = Pn * Ci * Ce`. \n    * **Pn**: Potenza nominale della pompa.\n    * **Ci**: Coefficiente di incentivo (€/kW) che dipende dall'efficienza della macchina (COP/SCOP).\n    * **Ce**: Coefficiente di maggiorazione basato sulla zona climatica (più la zona è fredda, più alto è l'incentivo).\n* **Limite**: L'incentivo **non può superare il 65%** della spesa totale sostenuta.\n* **Vantaggio principale**: Rientro rapido di una parte consistente della spesa.\n\n#### **Ecobonus 65%**\n\nÈ una **detrazione fiscale IRPEF**. Lo Stato ti 'restituisce' il 65% della spesa sostenuta, scalandolo dalle tasse che dovresti pagare, in **10 rate annuali** di pari importo.\n\n* **Requisito**: È accessibile per interventi di riqualificazione energetica, come la sostituzione di un vecchio impianto di climatizzazione invernale.\n* **Limite**: La spesa massima detraibile per questo intervento è di 30.000 €.\n* **Vantaggio principale**: Adatto a chi ha una capienza fiscale sufficiente per assorbire la detrazione annuale. Non richiede la complessa documentazione del GSE.\n\n| Caratteristica | Conto Termico 2.0 | Ecobonus 65% |\n| :--- | :--- | :--- |\n| **Tipo di Beneficio** | Bonifico diretto su C/C | Detrazione fiscale (meno tasse) |\n| **Tempi di Erogazione** | 2-5 anni | 10 anni (in rate annuali) |\n| **Percentuale Max** | Fino al 65% della spesa | 65% della spesa |\n| **Chi lo Eroga** | GSE | Agenzia delle Entrate |\n| **Ideale per** | Chi cerca liquidità e un rientro veloce | Chi ha buona capienza fiscale (IRPEF) |\n\n### **Parte 4: Risparmio e Ritorno dell'Investimento (ROI)**\n\nIl vero vantaggio di una pompa di calore si vede nel tempo. Sostituire una vecchia caldaia a metano può portare a un **risparmio in bolletta dal 40% al 70%** sui costi di riscaldamento.\n\n* **COP (Coefficient of Performance)**: È l'indicatore chiave dell'efficienza. Un COP di 4 significa che per ogni 1 kWh di energia elettrica consumata, la pompa di calore produce 4 kWh di energia termica. Più alto è il COP, maggiore è il risparmio.\n* **Ritorno dell'Investimento**: Dividendo il costo finale dell'impianto (al netto degli incentivi) per il risparmio annuo in bolletta, si ottiene il numero di anni necessari per ammortizzare la spesa. Con gli incentivi, questo periodo si riduce drasticamente, spesso a soli 5-8 anni."
};

const CostoPompaDiCaloreIncentiviCalculator: React.FC = () => {
    const { slug, title, inputs, outputs } = calculatorData;
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates: { [key: string]: any } = {
        tipoImpianto: "aria_acqua", potenza: 10, tipoIncentivo: "conto_termico", zonaClimatica: "E", costoManuale: 0, costoRiscaldamentoAttuale: 2000
    };
    const [states, setStates] = useState(initialStates);
    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { tipoImpianto, potenza, tipoIncentivo, zonaClimatica, costoManuale, costoRiscaldamentoAttuale } = states;
        
        const costiPerKW: { [key: string]: number } = { aria_acqua: 1250, aria_aria: 0, geotermica: 2100 };
        const costoStimatoImpianto = costoManuale > 0 ? costoManuale : (tipoImpianto === 'aria_aria' ? 2200 : potenza * costiPerKW[tipoImpianto]);

        let importoIncentivo = 0;
        if (tipoIncentivo === 'ecobonus_65') {
            importoIncentivo = costoStimatoImpianto * 0.65;
        } else { // Conto Termico
            const coeffCe: { [key: string]: number } = { "A/B": 0.6, "C": 0.8, "D": 1.0, "E": 1.2, "F": 1.5 };
            const coeffCi: { [key: string]: number } = { aria_acqua: 200, aria_aria: 180, geotermica: 250 };
            const incentivoTeorico = potenza * (coeffCi[tipoImpianto] || 0) * (coeffCe[zonaClimatica] || 0);
            const limite65 = costoStimatoImpianto * 0.65;
            importoIncentivo = Math.min(incentivoTeorico, limite65);
        }
        
        const costoFinaleNetto = costoStimatoImpianto - importoIncentivo;
        const risparmioAnnuoStimato = costoRiscaldamentoAttuale > 0 ? costoRiscaldamentoAttuale * 0.55 : 0;
        const rientroInvestimento = (risparmioAnnuoStimato > 0 && costoFinaleNetto > 0) ? costoFinaleNetto / risparmioAnnuoStimato : 0;

        return { costoStimatoImpianto, importoIncentivo, costoFinaleNetto, risparmioAnnuoStimato, rientroInvestimento };
    }, [states]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    
    const chartData = [
        { name: 'Costo Totale', value: calculatedOutputs.costoStimatoImpianto, fill: '#f87171' },
        { name: 'Incentivo', value: calculatedOutputs.importoIncentivo, fill: '#60a5fa' },
        { name: 'Costo Netto', value: calculatedOutputs.costoFinaleNetto, fill: '#34d399' },
    ];

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Stima il costo, il valore degli incentivi e il rientro del tuo nuovo impianto.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo. I costi e i valori degli incentivi sono stime basate su dati medi di mercato e sulla normativa vigente. Per un preventivo preciso e una consulenza sugli incentivi, rivolgiti a un professionista qualificato.
                        </div>

                        {/* Sezione Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (
                                    input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split("'")[1]
                                );
                                if (!conditionMet) return null;
                                
                                const inputLabel = (
                                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                      {input.label}
                                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                  </label>
                                );

                                if (input.type === 'radio') return (
                                    <div key={input.id} className="md:col-span-2">
                                        {inputLabel}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {input.options?.map(opt => (
                                                <button key={opt.value} onClick={() => handleStateChange(input.id, opt.value)}
                                                    className={`px-3 py-2 text-sm rounded-md transition-colors border ${states[input.id] === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100 border-gray-300'}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                                
                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2"
                                                type="number" min={input.min} step={input.step} value={states[input.id] || ''}
                                                onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                            {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Sezione Output */}
                        <div className="mt-8 space-y-3">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'costoFinaleNetto' ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-gray-50'}`}>
                                    <div>
                                        <p className="text-sm md:text-base font-medium text-gray-700">{output.label}</p>
                                        <p className="text-xs text-gray-500 mt-1">{output.description}</p>
                                    </div>
                                    <div className={`text-xl md:text-2xl font-bold whitespace-nowrap pl-4 ${output.id === 'costoFinaleNetto' ? 'text-emerald-600' : 'text-gray-800'}`}>
                                        <span>
                                            {isClient ? (output.unit === '€' ? formatCurrency(calculatedOutputs[output.id as keyof typeof calculatedOutputs]) : `${calculatedOutputs[output.id as keyof typeof calculatedOutputs].toFixed(1)} ${output.unit}`) : '...'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Sezione Grafico */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione dei Costi e Incentivi</h3>
                            <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} />
                                            <Bar dataKey="value" barSize={50} radius={[4, 4, 0, 0]}>
                                               {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                            </Bar>
                                        </BarChart>
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
                        <h2 className="font-semibold mb-2 text-gray-800">Guida all'Installazione</h2>
                        <ContentRenderer content={calculatorData.content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.gse.it/servizi-per-te/efficienza-energetica/conto-termico" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">GSE - Conto Termico 2.0</a></li>
                            <li><a href="https://www.efficienzaenergetica.enea.it/detrazioni-fiscali/ecobonus.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ENEA - Ecobonus</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Agevolazioni</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CostoPompaDiCaloreIncentiviCalculator;