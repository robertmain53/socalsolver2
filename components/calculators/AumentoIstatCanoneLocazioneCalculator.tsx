'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
    title: 'Calcolatore Aumento ISTAT Canone di Locazione',
    description: 'Calcola l\'adeguamento ISTAT del tuo canone di affitto in modo facile e veloce. Basato sugli ultimi indici FOI ufficiali per contratti ad uso abitativo e commerciale.'
};

// --- Icona per i Tooltip (SVG inline) ---
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
                        "name": "Cosa succede se il locatore ha aderito alla Cedolare Secca?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Se il proprietario ha optato per il regime fiscale della Cedolare Secca, rinuncia alla facoltà di aggiornare il canone di locazione. Pertanto, per tutta la durata dell'opzione, non può essere richiesto alcun adeguamento ISTAT e il canone rimane bloccato."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "L'aumento ISTAT è automatico?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, l'adeguamento ISTAT non è mai automatico. Il locatore deve farne esplicita richiesta al conduttore ogni anno, solitamente tramite lettera raccomandata o PEC. In assenza di richiesta, il canone rimane invariato."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Cosa succede se l'indice ISTAT è negativo (deflazione)?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "In caso di variazione ISTAT negativa (deflazione), il canone di locazione non può essere diminuito. La legge prevede solo l'adeguamento in aumento, quindi in questo scenario l'affitto rimane invariato rispetto all'anno precedente."
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
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                 if (trimmedBlock.startsWith('_Esempio:')) {
                    return <p key={index} className="mb-4 p-3 bg-gray-50 border-l-4 border-gray-300 italic" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore (incorporati) ---
const calculatorData = {
  "slug": "aumento-istat-canone-locazione", "category": "Immobiliare e Casa", "title": "Calcolatore Aumento ISTAT Canone di Locazione", "lang": "it",
  "indiciIstat": {
    "2023-1": 118.4, "2023-2": 118.5, "2023-3": 118.4, "2023-4": 118.9, "2023-5": 119.1, "2023-6": 119.1, "2023-7": 119.4, "2023-8": 119.8, "2023-9": 119.5, "2023-10": 119.3, "2023-11": 118.7, "2023-12": 118.9,
    "2024-1": 119.3, "2024-2": 119.4, "2024-3": 119.4, "2024-4": 120.3, "2024-5": 120.5, "2024-6": 120.7, "2024-7": 120.7, "2024-8": 121.2, "2024-9": 120.9, "2024-10": 120.7, "2024-11": 120.2, "2024-12": 120.4,
    "2025-1": 120.8, "2025-2": 120.9, "2025-3": 120.9, "2025-4": 121.8, "2025-5": 122.0, "2025-6": 122.2, "2025-7": 122.2
  },
  "inputs": [
    {"id": "canoneIniziale", "label": "Canone di Locazione Attuale", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Inserisci l'importo del canone mensile attuale, prima dell'adeguamento ISTAT."},
    {"id": "periodoIniziale", "label": "Periodo di Riferimento Iniziale", "type": "month-year" as const, "tooltip": "Seleziona il mese e l'anno a cui si riferisce l'ultimo canone non aggiornato (solitamente 12 mesi prima)."},
    {"id": "periodoFinale", "label": "Periodo di Riferimento Finale", "type": "month-year" as const, "tooltip": "Seleziona il mese e l'anno per cui vuoi calcolare l'adeguamento. L'indice ISTAT viene pubblicato verso la metà del mese successivo."},
    {"id": "percentualeAdeguamento", "label": "Percentuale di Adeguamento Contratto", "type": "select" as const, "options": [ {"value": 100, "label": "100% (Uso Commerciale)"}, {"value": 75, "label": "75% (Uso Abitativo)"} ], "tooltip": "Verifica sul tuo contratto la percentuale di rivalutazione applicabile. Solitamente è il 100% per uso commerciale e il 75% per contratti a canone libero per uso abitativo."}
  ],
  "outputs": [
    {"id": "variazionePercentualeIstat", "label": "Variazione Indice ISTAT (FOI)", "unit": "%"},
    {"id": "aumentoCanone", "label": "Aumento Effettivo sul Canone Mensile", "unit": "€"},
    {"id": "nuovoCanone", "label": "Nuovo Canone di Locazione Mensile", "unit": "€"},
    {"id": "nuovoCanoneAnnuo", "label": "Nuovo Canone di Locazione Annuo", "unit": "€"}
  ],
  "content": "### **Guida Completa all'Adeguamento ISTAT del Canone di Locazione**\n\n**Come e Quando Aggiornare l'Affitto in Base all'Inflazione.**\n\nL'**adeguamento ISTAT** del canone di locazione è una clausola contrattuale che permette di aggiornare l'importo dell'affitto in base al costo della vita, proteggendo il locatore dalla perdita di potere d'acquisto dovuta all'inflazione. Si tratta di un'operazione fondamentale nella gestione di un contratto di affitto, che deve seguire regole precise.\n\nQuesto calcolatore avanzato ti permette di determinare l'esatto importo dell'aumento in modo rapido e trasparente, utilizzando gli **indici ufficiali ISTAT** più recenti. Il risultato è una stima accurata, ma si raccomanda di fare sempre riferimento al proprio contratto e, se necessario, a un consulente legale o a un'associazione di categoria.\n\n### **Parte 1: I Pilastri del Calcolo**\n\nIl calcolo si basa su tre elementi chiave:\n\n1.  **L'Indice ISTAT di Riferimento**: L'indice utilizzato per le locazioni è il **FOI** (Indice dei prezzi al consumo per le **F**amiglie di **O**perai e **I**mpiegati), al netto dei tabacchi. Questo indice misura mensilmente la variazione dei prezzi di un paniere di beni e servizi.\n\n2.  **Il Periodo di Riferimento**: L'aggiornamento è solitamente annuale. Si calcola la variazione percentuale dell'indice FOI tra il mese di riferimento di un anno e lo stesso mese dell'anno precedente.\n\n3.  **La Percentuale di Adeguamento**: La legge stabilisce la misura massima dell'aumento applicabile, che dipende dalla tipologia del contratto.\n\n### **Parte 2: Distinzioni Fondamentali (Abitativo vs. Commerciale)**\n\nNon tutti i contratti sono uguali. La percentuale della variazione ISTAT che può essere applicata al canone cambia radicalmente:\n\n* **Contratti a Uso Abitativo (Canone Libero 4+4)**: Per gli immobili affittati come abitazione, il locatore può richiedere un aumento pari al massimo al **75% della variazione ISTAT**.\n    _Esempio: Se l'inflazione (variazione ISTAT) è del 2%, l'aumento massimo del canone sarà dell'1,5% (il 75% di 2%)._\n\n* **Contratti a Uso Diverso (Commerciale)**: Per immobili ad uso commerciale, artigianale, professionale o industriale (es. negozi, uffici), le parti possono accordarsi per un adeguamento fino al **100% della variazione ISTAT**.\n\n#### **L'Eccezione Cruciale: La Cedolare Secca**\n\n**ATTENZIONE**: Se il locatore ha scelto il regime fiscale della **Cedolare Secca**, **rinuncia espressamente e per tutta la durata dell'opzione alla facoltà di richiedere l'aggiornamento del canone**, inclusa la rivalutazione ISTAT. In questo caso, il canone rimane bloccato all'importo originario.\n\n### **Parte 3: La Formula Spiegata Passo-Passo**\n\nIl calcolo dell'aumento avviene tramite una formula precisa:\n\n_`Variazione % ISTAT = ((Indice Finale - Indice Iniziale) / Indice Iniziale) * 100`_\n\n_`Aumento Canone = Canone Attuale * (Variazione % ISTAT / 100) * (% Adeguamento / 100)`_\n\n_`Nuovo Canone = Canone Attuale + Aumento Canone`_\n\n**Nota importante**: In caso di **deflazione** (variazione ISTAT negativa), il canone di locazione **non può essere ridotto**, ma rimane invariato rispetto all'anno precedente. Il nostro calcolatore implementa automaticamente questa regola."
};

const AumentoIstatCanoneLocazioneCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, indiciIstat } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => { setIsClient(true); }, []);
    
    const availableYears = useMemo(() => Array.from(new Set(Object.keys(indiciIstat).map(k => k.split('-')[0]))).sort((a, b) => Number(b) - Number(a)), [indiciIstat]);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('it-IT', { month: 'long' }) }));

    const lastAvailableDate = new Date(Math.max(...Object.keys(indiciIstat).map(k => new Date(k).getTime())));
    const currentMonth = lastAvailableDate.getMonth() + 1;
    const currentYear = lastAvailableDate.getFullYear();

    const initialStates = {
        canoneIniziale: 700,
        annoIniziale: currentYear - 1,
        meseIniziale: currentMonth,
        annoFinale: currentYear,
        meseFinale: currentMonth,
        percentualeAdeguamento: 75,
    };
    const [states, setStates] = useState(initialStates);
    
    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const { canoneIniziale, annoIniziale, meseIniziale, annoFinale, meseFinale, percentualeAdeguamento } = states;
        const keyIniziale = `${annoIniziale}-${meseIniziale}`;
        const keyFinale = `${annoFinale}-${meseFinale}`;
        
        const indiceIniziale = (indiciIstat as any)[keyIniziale];
        const indiceFinale = (indiciIstat as any)[keyFinale];

        if (!indiceIniziale || !indiceFinale) {
            return { variazionePercentualeIstat: 0, aumentoCanone: 0, nuovoCanone: canoneIniziale, nuovoCanoneAnnuo: canoneIniziale * 12, error: "Indice non disponibile per le date selezionate." };
        }

        const variazionePercentualeIstat = ((indiceFinale - indiceIniziale) / indiceIniziale) * 100;
        const aumentoCanone = Math.max(0, canoneIniziale * (variazionePercentualeIstat / 100) * (percentualeAdeguamento / 100));
        const nuovoCanone = canoneIniziale + aumentoCanone;
        const nuovoCanoneAnnuo = nuovoCanone * 12;

        return { variazionePercentualeIstat, aumentoCanone, nuovoCanone, nuovoCanoneAnnuo, indiceIniziale, indiceFinale, error: null };
    }, [states, indiciIstat]);

    const chartData = [
        { name: 'Canone Attuale', value: states.canoneIniziale },
        { name: 'Nuovo Canone', value: calculatedOutputs.nuovoCanone },
    ];

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
    
    const formulaString = calculatedOutputs.error ? "Dati non disponibili" : `((${calculatedOutputs.indiceFinale} - ${calculatedOutputs.indiceIniziale}) / ${calculatedOutputs.indiceIniziale}) * ${states.percentualeAdeguamento}%`;

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md">
                        <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">{meta.description}</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento usa dati ISTAT ufficiali ma fornisce una stima. Verificare sempre le clausole del proprio contratto. Se il tuo contratto è in regime di <strong>Cedolare Secca</strong>, non hai diritto all'adeguamento ISTAT.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Canone di Locazione Attuale <Tooltip text="Inserisci l'importo del canone mensile attuale, prima dell'adeguamento ISTAT."><InfoIcon/></Tooltip></label>
                                    <div className="relative"><span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span><input type="number" value={states.canoneIniziale} onChange={e => handleStateChange('canoneIniziale', Number(e.target.value))} className="w-full pl-7 p-2 border-gray-300 rounded-md shadow-sm"/></div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Percentuale Adeguamento <Tooltip text="Verifica sul tuo contratto la percentuale di rivalutazione. Solitamente è il 100% per uso commerciale e il 75% per uso abitativo."><InfoIcon/></Tooltip></label>
                                    <select value={states.percentualeAdeguamento} onChange={e => handleStateChange('percentualeAdeguamento', Number(e.target.value))} className="w-full p-2 border-gray-300 rounded-md shadow-sm"><option value={100}>100% (Uso Commerciale)</option><option value={75}>75% (Uso Abitativo)</option></select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Periodo Iniziale <Tooltip text="Seleziona il mese e l'anno a cui si riferisce l'ultimo canone non aggiornato."><InfoIcon/></Tooltip></label>
                                    <div className="flex gap-2"><select value={states.meseIniziale} onChange={e => handleStateChange('meseIniziale', Number(e.target.value))} className="w-full p-2 border-gray-300 rounded-md shadow-sm">{months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select><select value={states.annoIniziale} onChange={e => handleStateChange('annoIniziale', Number(e.target.value))} className="w-1/2 p-2 border-gray-300 rounded-md shadow-sm">{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Periodo Finale <Tooltip text="Seleziona il mese e l'anno per cui vuoi calcolare l'adeguamento."><InfoIcon/></Tooltip></label>
                                    <div className="flex gap-2"><select value={states.meseFinale} onChange={e => handleStateChange('meseFinale', Number(e.target.value))} className="w-full p-2 border-gray-300 rounded-md shadow-sm">{months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select><select value={states.annoFinale} onChange={e => handleStateChange('annoFinale', Number(e.target.value))} className="w-1/2 p-2 border-gray-300 rounded-md shadow-sm">{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                                </div>
                            </div>
                            
                            {calculatedOutputs.error && <p className="text-red-600 bg-red-50 p-3 mt-4 rounded-md text-sm">{calculatedOutputs.error}</p>}

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati dell'Adeguamento</h2>
                                <div className="space-y-3">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-r-lg border-l-4 ${output.id === 'nuovoCanone' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl font-bold ${output.id === 'nuovoCanone' ? 'text-green-700' : 'text-gray-800'}`}>
                                            <span>{isClient ? (output.unit === '%' ? formatPercentage((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Confronto Canone</h3>
                                <div className="h-64 w-full bg-gray-50 p-4 rounded-lg">
                                    {isClient && <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><YAxis tickFormatter={(value) => formatCurrency(Number(value))}/><XAxis dataKey="name" /><ChartTooltip formatter={(value: number) => formatCurrency(value)}/><Legend/><Bar dataKey="value" fill="#8884d8" name="Canone Mensile"/></BarChart></ResponsiveContainer>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Dettagli Calcolo</h2>
                         <div className="text-sm space-y-2">
                             <div className="flex justify-between"><span>Indice Iniziale:</span><span className="font-medium">{calculatedOutputs.indiceIniziale || 'N/D'}</span></div>
                             <div className="flex justify-between"><span>Indice Finale:</span><span className="font-medium">{calculatedOutputs.indiceFinale || 'N/D'}</span></div>
                             <div className="mt-2 pt-2 border-t">
                                <p className="text-xs text-gray-600">Formula Applicata:</p>
                                <p className="text-xs font-mono break-words">{formulaString}</p>
                             </div>
                         </div>
                         <div className="grid grid-cols-2 gap-3 mt-4">
                            <button onClick={() => {}} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Salva</button>
                            <button onClick={() => {}} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-200 bg-red-50 text-red-700 rounded-md px-3 py-2 hover:bg-red-100 transition-colors">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://rivaluta.istat.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ISTAT - Rivalutazioni Monetarie</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1978-07-27;392!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge n. 392 del 27/07/1978 (Legge sull'Equo Canone)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default AumentoIstatCanoneLocazioneCalculator;