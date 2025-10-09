'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

// --- SEO e Metadati per la Pagina ---
export const meta = {
  title: "Calcolatore Tasse Partita IVA Guida Turistica (Forfettario/Ordinario)",
  description: "Simula il calcolo di tasse e contributi INPS per guide turistiche con Partita IVA. Confronta Regime Forfettario e Ordinario e scopri il tuo reddito netto."
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
            "name": "Qual è il Codice ATECO per una guida turistica?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il Codice ATECO corretto per le attività di guide e accompagnatori turistici è 79.90.20. Questo codice determina un coefficiente di redditività del 67% nel Regime Forfettario."
            }
          },
          {
            "@type": "Question",
            "name": "Quanto paga di INPS una guida turistica in Regime Forfettario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Dipende dalla gestione scelta. In Gestione Separata, si paga il 26,07% del reddito imponibile (ricavi * 67%), senza minimali. In Gestione Commercianti, si paga un minimale fisso (circa 4.515€) con uno sconto del 35%, più una percentuale sull'eccedenza, anch'essa scontata."
            }
          },
          {
            "@type": "Question",
            "name": "Quando conviene il Regime Ordinario per una guida turistica?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il Regime Ordinario Semplificato conviene quando i costi reali e documentabili dell'attività (carburante, marketing, ammortamenti, etc.) superano il 33% del fatturato. In questo caso, la deduzione analitica dei costi può portare a un reddito imponibile inferiore rispetto a quello calcolato forfettariamente."
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
                if (trimmedBlock.startsWith('* **')) {
                    const title = trimmedBlock.match(/\*\*\s*(.*?)\s*\*\*/)?.[1] || '';
                    const text = trimmedBlock.split('**: ')[1] || '';
                    return <p key={index} className="mb-4"><strong className="text-gray-800">{title}:</strong> <span dangerouslySetInnerHTML={{__html: processInlineFormatting(text)}} /></p>;
                }
                if (trimmedBlock.startsWith('_Esempio')) {
                    const lines = trimmedBlock.split('\n').map(l => l.trim());
                    return <div key={index} className="p-3 my-4 bg-gray-100 rounded-md text-xs italic"><p className="mb-0 leading-relaxed" dangerouslySetInnerHTML={{__html: processInlineFormatting(lines.join('<br/>'))}} /></div>
                }
                if (trimmedBlock.startsWith('| Caratteristica')) {
                    const rows = trimmedBlock.split('\n').slice(1).map(row => row.split('|').map(cell => cell.trim()).filter(Boolean));
                    const headers = ["Caratteristica", "Regime Forfettario", "Regime Ordinario Semplificato"];
                     return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map(h => <th key={h} className="p-2 border text-left font-semibold">{h}</th>)}</tr>
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
                if (trimmedBlock.startsWith('1.  **') || trimmedBlock.startsWith('2.  **')) {
                     return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/\d\.\s*/, '')) }} />;
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
  "slug": "tassazione-guide-turistiche-partita-iva",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Guide Turistiche",
  "lang": "it",
  "inputs": [
    { "id": "ricaviAnnuo", "label": "Ricavi annui lordi", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei ricavi (fatturato) che prevedi di incassare in un anno, al lordo di tasse e contributi." },
    { "id": "regimeFiscale", "label": "Regime Fiscale", "type": "radio", "options": [ { "value": "forfettario", "label": "Regime Forfettario" }, { "value": "ordinario", "label": "Regime Ordinario Semplificato" } ], "tooltip": "Il Regime Forfettario è vantaggioso per ricavi fino a 85.000€, con tassazione e gestione semplificate. L'Ordinario è necessario sopra questa soglia o se hai costi deducibili elevati." },
    { "id": "isNuovaAttivita", "label": "Sei una nuova attività (primi 5 anni)?", "type": "boolean", "condition": "regimeFiscale == 'forfettario'", "tooltip": "Se hai aperto la Partita IVA da meno di 5 anni e rispetti i requisiti, l'imposta sostitutiva per il Regime Forfettario è ridotta dal 15% al 5%." },
    { "id": "costiAnnuo", "label": "Costi deducibili annui", "type": "number", "unit": "€", "min": 0, "step": 100, "condition": "regimeFiscale == 'ordinario'", "tooltip": "Solo per il Regime Ordinario: inserisci il totale dei costi sostenuti per la tua attività (es. carburante, utenze, marketing, software). Questi costi riducono la base imponibile." },
    { "id": "gestioneINPS", "label": "Gestione Previdenziale INPS", "type": "radio", "options": [ { "value": "separata", "label": "Gestione Separata" }, { "value": "commercianti", "label": "Gestione Commercianti" } ], "tooltip": "La Gestione Separata è per professionisti senza cassa. La Gestione Commercianti è spesso richiesta se l'attività è imprenditoriale e organizzata (es. con un'agenzia). Verifica con il tuo commercialista." },
    { "id": "contributiVersati", "label": "Contributi INPS già versati (acconti)", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo totale dei contributi INPS che hai già pagato durante l'anno come acconto. Verranno dedotti dal reddito imponibile." }
  ],
  "outputs": [
    { "id": "redditoImponibile", "label": "Reddito Imponibile Fiscale", "unit": "€" },
    { "id": "impostaDovuta", "label": "Imposta Sostitutiva / IRPEF", "unit": "€" },
    { "id": "contributiINPS", "label": "Contributi INPS Dovuti", "unit": "€" },
    { "id": "tasseTotali", "label": "Totale Tasse e Contributi", "unit": "€" },
    { "id": "redditoNetto", "label": "Reddito Netto Annuo", "unit": "€" },
    { "id": "percentualeTassazione", "label": "Aliquota Fiscale Effettiva", "unit": "%" }
  ],
  "content": "### **Guida Definitiva alla Tassazione per Guide Turistiche con Partita IVA**\n\n**Analisi dei Regimi Fiscali, Calcolo Contributivo e Ottimizzazione del Carico Fiscale**\n\nOperare come guida turistica in regime di lavoro autonomo richiede una chiara comprensione degli obblighi fiscali e previdenziali. La scelta del regime fiscale e della gestione INPS corretta può avere un impatto significativo sul tuo reddito netto. \n\nQuesto strumento è progettato per fornire una **simulazione accurata e trasparente** delle tasse e dei contributi dovuti, superando un semplice calcolo numerico. L'obiettivo è offrirti un quadro completo per dialogare con il tuo commercialista e prendere decisioni informate. Ricorda: nessuna calcolatrice può sostituire una consulenza professionale personalizzata.\n\n### **Parte 1: I Fondamenti - Aprire la Partita IVA come Guida Turistica**\n\nIl primo passo formale per avviare la professione è l'apertura della Partita IVA. L'elemento chiave in questa fase è la scelta del codice attività corretto.\n\n* **Codice ATECO**: Il codice di riferimento per le guide turistiche è **79.90.20 - Attività delle guide e degli accompagnatori turistici**. Questo codice non solo identifica la tua attività presso l'Agenzia delle Entrate, ma determina anche parametri fondamentali per il calcolo delle tasse, specialmente in Regime Forfettario.\n\n### **Parte 2: La Scelta Cruciale - Regime Forfettario o Ordinario?**\n\nLa decisione più importante da prendere riguarda il regime fiscale. Vediamo le due opzioni principali a confronto.\n\n#### **Il Regime Forfettario**\n\nÈ il regime fiscale agevolato, ideale per chi inizia o ha un volume d'affari contenuto. È la scelta più comune per le guide turistiche freelance.\n\n* **Requisiti**: Il requisito principale è non superare **85.000 € di ricavi annui**.\n* **Vantaggi**: \n    * **Tassazione Semplificata (Imposta Sostitutiva)**: Un'unica imposta che sostituisce IRPEF, addizionali regionali e comunali. L'aliquota è del **15%**, che scende al **5% per i primi 5 anni** di attività a determinate condizioni (nuova attività).\n    * **Niente IVA**: Non devi addebitare l'IVA in fattura, risultando più competitivo, e non devi gestire le relative liquidazioni trimestrali.\n    * **Calcolo Semplificato dei Costi**: I costi non vengono dedotti analiticamente. Lo Stato riconosce un costo forfettario basato sul **coefficiente di redditività**, che per il tuo codice ATECO è del **67%**. Questo significa che le tasse si calcolano solo sul 67% dei tuoi ricavi, mentre il restante 33% è considerato un costo esentasse.\n\n_Esempio di calcolo (Forfettario)_: \nRicavi: 30.000 €\nReddito Imponibile Lordo: 30.000 € * 67% = 20.100 €\nSu questa cifra si calcoleranno imposta e contributi.\n\n#### **Il Regime Ordinario Semplificato**\n\nDiventa obbligatorio superati gli 85.000 € di ricavi o può essere una scelta strategica se si prevedono costi deducibili molto elevati.\n\n* **Calcolo Analitico**: La base imponibile si calcola con la formula: **Ricavi - Costi Deducibili**.\n* **Tassazione IRPEF**: Il reddito imponibile è soggetto a tassazione IRPEF progressiva a scaglioni (dal 23% al 43%).\n* **Gestione IVA**: Si applica l'IVA sulle fatture e si gestiscono le relative liquidazioni e versamenti.\n* **Quando Conviene?** Quando i costi reali e documentabili superano il 33% del fatturato riconosciuto forfettariamente nel regime agevolato.\n\n| Caratteristica | Regime Forfettario | Regime Ordinario Semplificato |\n| :--- | :--- | :--- |\n| Limite Ricavi | 85.000 € | Nessuno |\n| Tassazione | Imposta Sostitutiva (5% o 15%) | IRPEF a scaglioni (23%-43%) |\n| Gestione IVA | No | Sì |\n| Calcolo Reddito | Ricavi * 67% | Ricavi - Costi reali |\n| Convenienza | Costi reali < 33% dei ricavi | Costi reali > 33% dei ricavi |\n\n### **Parte 3: La Previdenza - Contributi INPS**\n\nOltre alle tasse, è obbligatorio versare i contributi previdenziali all'INPS. Per una guida turistica, le opzioni sono principalmente due.\n\n1.  **Gestione Separata INPS**\n\nÈ la cassa previdenziale dei professionisti senza un albo specifico. \n\n* **Come funziona**: Si paga una percentuale sul reddito imponibile lordo (Ricavi * 67% per i forfettari). Non ci sono contributi minimi fissi. Se non fatturi, non paghi.\n* **Aliquota**: Per il 2024, l'aliquota è del **26,07%**.\n* **Vantaggio**: Flessibilità totale, ideale per chi ha ricavi variabili o inizia l'attività.\n\n2.  **Gestione Artigiani e Commercianti INPS**\n\nL'iscrizione a questa gestione può essere richiesta quando l'attività non è puramente intellettuale ma assume un carattere più imprenditoriale. La valutazione va fatta con un consulente.\n\n* **Come funziona**: Prevede un contributo fisso minimo obbligatorio, indipendentemente dal fatturato, più una percentuale sulla parte di reddito che eccede un minimale.\n* **Contributo Fisso (2024)**: Circa **4.515 €** annui, da pagare in 4 rate trimestrali.\n* **Contributo Variabile**: Sul reddito eccedente i 18.415 €, si paga circa il **24,48%**.\n* **Agevolazione Forfettario**: Chi è in Regime Forfettario può richiedere una **riduzione del 35%** sia sul contributo fisso che su quello variabile.\n\n### **Parte 4: Formula di Calcolo e Interpretazione dei Risultati**\n\nIl calcolatore applica le seguenti logiche per fornirti una stima precisa:\n\n1.  **Calcolo del Reddito Imponibile**:\n    * _Forfettario_: `(Ricavi * 0.67) - Contributi Versati`\n    * _Ordinario_: `(Ricavi - Costi Deducibili) - Contributi Versati`\n2.  **Calcolo dell'Imposta**:\n    * _Forfettario_: `Reddito Imponibile * 5% o 15%`\n    * _Ordinario_: Applicazione degli scaglioni IRPEF al Reddito Imponibile.\n3.  **Calcolo dei Contributi INPS**:\n    * _Gestione Separata_: `(Ricavi * 0.67) * 26.07%`\n    * _Gestione Commercianti_: Calcolo basato su minimale e eccedenza, con eventuale riduzione del 35% per i forfettari.\n4.  **Calcolo del Netto**: `Ricavi Lordi - Imposta Dovuta - Contributi INPS Dovuti`."
};

const TassazioneGuideTuristichePartitaIvaCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates: { [key: string]: any } = {
        ricaviAnnuo: 35000,
        regimeFiscale: "forfettario",
        isNuovaAttivita: true,
        costiAnnuo: 5000,
        gestioneINPS: "separata",
        contributiVersati: 0
    };
    const [states, setStates] = useState(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    const handleReset = () => setStates(initialStates);
    
    const calculatedOutputs = useMemo(() => {
        const { ricaviAnnuo, regimeFiscale, isNuovaAttivita, costiAnnuo, gestioneINPS, contributiVersati } = states;
        const COEFF_REDDITIVITA = 0.67;
        let redditoImponibileLordo = 0;
        let redditoImponibile, impostaDovuta, contributiINPS;

        if (regimeFiscale === 'forfettario') {
            redditoImponibileLordo = ricaviAnnuo * COEFF_REDDITIVITA;
            redditoImponibile = Math.max(0, redditoImponibileLordo - contributiVersati);
            const aliquota = isNuovaAttivita ? 0.05 : 0.15;
            impostaDovuta = redditoImponibile * aliquota;
        } else { // Regime Ordinario
            redditoImponibileLordo = Math.max(0, ricaviAnnuo - costiAnnuo);
            redditoImponibile = Math.max(0, redditoImponibileLordo - contributiVersati);
            // Calcolo IRPEF a scaglioni
            if (redditoImponibile <= 28000) {
                impostaDovuta = redditoImponibile * 0.23;
            } else if (redditoImponibile <= 50000) {
                impostaDovuta = (28000 * 0.23) + ((redditoImponibile - 28000) * 0.35);
            } else {
                impostaDovuta = (28000 * 0.23) + (22000 * 0.35) + ((redditoImponibile - 50000) * 0.43);
            }
        }
        
        const baseCalcoloINPS = regimeFiscale === 'forfettario' ? (ricaviAnnuo * COEFF_REDDITIVITA) : Math.max(0, ricaviAnnuo - costiAnnuo);

        if (gestioneINPS === 'separata') {
            const ALIQUOTA_SEPARATA = 0.2607;
            contributiINPS = baseCalcoloINPS * ALIQUOTA_SEPARATA;
        } else { // Gestione Commercianti
            const MINIMALE_REDDITO = 18415;
            const CONTRIBUTO_FISSO = 4515.43;
            const ALIQUOTA_ECCEDENZA = 0.2448;
            
            let contr = 0;
            if (baseCalcoloINPS <= MINIMALE_REDDITO) {
                contr = CONTRIBUTO_FISSO;
            } else {
                contr = CONTRIBUTO_FISSO + ((baseCalcoloINPS - MINIMALE_REDDITO) * ALIQUOTA_ECCEDENZA);
            }
            
            if(regimeFiscale === 'forfettario'){
                contr *= 0.65; // Sconto 35%
            }
            contributiINPS = contr;
        }

        const tasseTotali = impostaDovuta + contributiINPS;
        const redditoNetto = ricaviAnnuo - tasseTotali;
        const percentualeTassazione = ricaviAnnuo > 0 ? (tasseTotali / ricaviAnnuo) * 100 : 0;
        
        return { redditoImponibile, impostaDovuta, contributiINPS, tasseTotali, redditoNetto, percentualeTassazione };
    }, [states]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    
    const chartData = [
        { name: 'Reddito Netto', value: calculatedOutputs.redditoNetto, fill: '#34d399' },
        { name: 'Imposta', value: calculatedOutputs.impostaDovuta, fill: '#f87171' },
        { name: 'Contributi INPS', value: calculatedOutputs.contributiINPS, fill: '#60a5fa' }
    ];

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6" ref={calcolatoreRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula tasse e contributi per la tua Partita IVA come Guida Turistica.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale. I calcoli si basano sulle aliquote del 2024.
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
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            {input.options?.map(opt => (
                                                <button key={opt.value} onClick={() => handleStateChange(input.id, opt.value)}
                                                    className={`px-4 py-2 text-sm rounded-md transition-colors border ${states[input.id] === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100 border-gray-300'}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );

                                if (input.type === 'boolean') return (
                                    <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                        <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                    </div>
                                );
                                
                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-10 py-2"
                                                type="number" min={input.min} step={input.step} value={states[input.id]}
                                                onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Sezione Output */}
                        <div className="mt-8 space-y-3">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'redditoNetto' ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-gray-50'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'redditoNetto' ? 'text-emerald-600' : 'text-gray-800'}`}>
                                        <span>
                                            {isClient ? (output.unit === '€' ? formatCurrency(calculatedOutputs[output.id as keyof typeof calculatedOutputs]) : `${calculatedOutputs[output.id as keyof typeof calculatedOutputs].toFixed(2)}%`) : '...'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Sezione Grafico */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione dei Ricavi Lordi</h3>
                            <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} />
                                            <Bar dataKey="value" barSize={35} radius={[0, 4, 4, 0]}>
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
                        <h2 className="font-semibold mb-3 text-gray-800">Strumenti e Azioni</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleReset} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Tassazione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/ivacomunicazioni/regime-forfetario-agevolato" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda-prestazione.schede-servizio-strumento.50853.gestione-separata-tutti-i-servizi.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Separata</a></li>
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda-prestazione.schede-servizio-strumento.1031.contributi-dovuti-da-artigiani-e-commercianti.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Artigiani e Commercianti</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneGuideTuristichePartitaIvaCalculator;