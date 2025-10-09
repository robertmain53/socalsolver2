'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Canone Concordato e Vantaggi Fiscali",
  description: "Calcola il canone concordato (esempio su Bologna) e scopri il risparmio fiscale su IMU e Cedolare Secca al 10%. Simula la convenienza del contratto 3+2."
};

// --- Componenti UI e Icone (Self-Contained) ---
const InfoIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> );
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => ( <div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div> );

const FaqSchema = () => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": "Cos'è il canone concordato?", "acceptedAnswer": {"@type": "Answer", "text": "Il canone concordato è una tipologia di contratto d'affitto (es. 3+2) il cui importo non è libero, ma stabilito entro un minimo e un massimo definiti da Accordi Territoriali locali. In cambio, il proprietario ottiene importanti vantaggi fiscali, come la cedolare secca al 10% e la riduzione dell'IMU."}},
            {"@type": "Question", "name": "Quali sono i vantaggi della cedolare secca al 10%?", "acceptedAnswer": {"@type": "Answer", "text": "La cedolare secca al 10% è un'imposta fissa che sostituisce l'IRPEF, le addizionali, l'imposta di registro e di bollo. È significativamente più bassa della cedolare al 21% per i contratti a mercato libero e quasi sempre più conveniente della tassazione ordinaria IRPEF."}},
            {"@type": "Question", "name": "Il calcolo del canone concordato è uguale in tutta Italia?", "acceptedAnswer": {"@type": "Answer", "text": "No, assolutamente. Il calcolo dell'importo del canone dipende dagli Accordi Territoriali specifici di ogni Comune o area metropolitana. Questo calcolatore usa i dati di Bologna come esempio, ma è fondamentale consultare l'accordo valido nel proprio Comune per avere un valore corretto e poter accedere alle agevolazioni."}}
        ]
    })}} />
);

const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) { const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, '')); return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;}
                if (trimmedBlock.includes('**Canone Concordato**')) {
                    const rows = trimmedBlock.split('\n'); const headers = rows[0].split('**').filter(h => h.trim()).slice(1); const bodyRows = rows.slice(1).map(row => row.split('**').filter(c => c.trim()));
                    return (<div key={index} className="overflow-x-auto my-4"><table className="min-w-full border text-sm"><thead className="bg-gray-100"><tr><th className="p-2 border text-left">Regime Fiscale</th>{headers.map((header, hIndex) => <th key={hIndex} className="p-2 border text-left">{header}</th>)}</tr></thead><tbody>{bodyRows.map((row, rIndex) => (<tr key={rIndex}>{row.map((cell, cIndex) => <td key={cIndex} className={`p-2 border ${cIndex === 0 ? 'font-semibold' : ''}`} dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>))}</tbody></table></div>);
                }
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati di Configurazione ---
const calculatorData = {
  "slug": "canone-concordato-vantaggi-fiscali", "category": "Immobiliare e Casa", "title": "Calcolatore Canone Concordato e Vantaggi Fiscali", "lang": "it",
  "inputs": [
    { "id": "comune", "label": "Comune di Riferimento", "type": "select", "options": ["Bologna (esempio di calcolo)"], "tooltip": "Il calcolo del canone varia per ogni Comune. Questo strumento usa l'Accordo Territoriale di Bologna come modello rappresentativo. I vantaggi fiscali sono invece validi a livello nazionale." },
    { "id": "zona_territoriale", "label": "Zona Territoriale (Sub-fascia)", "type": "select", "options": ["Centrale e di Pregio", "Intermedia", "Periferia e Frazioni"], "tooltip": "Le fasce di oscillazione del canone sono definite dagli Accordi Territoriali in base alla zona. Le opzioni si riferiscono all'esempio di Bologna." },
    { "id": "superficie_convenzionale", "label": "Superficie Convenzionale", "type": "number", "unit": "m²", "min": 20, "step": 1, "tooltip": "Non è la superficie calpestabile. Si calcola sommando la superficie utile, il 25% di balconi/terrazzi, il 10% di cantine/soffitte, etc., come definito dalla normativa (D.P.R. 138/98)." },
    { "id": "is_arredato", "label": "Immobile completamente arredato", "type": "boolean", "tooltip": "Spunta se l'immobile è dotato di un arredo completo e funzionale." },
    { "id": "has_ascensore", "label": "Presenza di ascensore", "type": "boolean", "tooltip": "Spunta se l'edificio è dotato di ascensore (per immobili dal 1° piano in su)." },
    { "id": "canone_scelto_annuo", "label": "Canone Annuo Concordato Scelto", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il canone annuo che intendi applicare, che deve rientrare nella fascia calcolata per poter accedere ai benefici fiscali." },
    { "id": "rendita_catastale", "label": "Rendita Catastale (non rivalutata)", "type": "number", "unit": "€", "min": 0, "step": 10, "tooltip": "Trovi questo valore sulla visura catastale dell'immobile. È la base per il calcolo dell'IMU." },
    { "id": "aliquota_imu_ordinaria", "label": "Aliquota IMU Ordinaria Comunale", "type": "number", "unit": "%", "min": 0, "step": 0.01, "tooltip": "L'aliquota base per seconde case è 0.86%, ma i Comuni possono aumentarla. Verifica l'aliquota del tuo Comune (es. Bologna 1,06%)." },
    { "id": "scaglione_irpef_proprietario", "label": "La tua Aliquota IRPEF Marginale", "type": "select", "options": ["23%", "35%", "43%"], "tooltip": "Seleziona la tua aliquota IRPEF più alta. Serve per confrontare la tassazione ordinaria con la cedolare secca." }
  ],
  "outputs": [
    { "id": "canone_minimo_mensile", "label": "Canone Minimo Mensile Calcolato", "unit": "€" },
    { "id": "canone_massimo_mensile", "label": "Canone Massimo Mensile Calcolato", "unit": "€" },
    { "id": "risparmio_fiscale_annuo", "label": "Risparmio Fiscale Annuo Stimato", "unit": "€" },
    { "id": "tasse_concordato", "label": "Tasse Totali (IMU+Cedolare) con Concordato", "unit": "€" },
    { "id": "tasse_libero_mercato_irpef", "label": "Tasse Totali (IMU+IRPEF) a Mercato Libero", "unit": "€" }
  ],
  "content": "### **Guida Completa al Canone Concordato e ai suoi Vantaggi Fiscali**\n\n**Come Calcolarlo, Quali Tasse Risparmiare e Cosa Sapere Prima di Firmare**\n\nIl **canone concordato** è una tipologia di contratto di locazione che offre significativi vantaggi fiscali al proprietario, a fronte di un canone di affitto calmierato, il cui importo è definito da accordi tra le associazioni di proprietari e inquilini a livello locale. È una scelta strategica per chi cerca una redditività stabile e un carico fiscale ridotto.\n\n**Disclaimer fondamentale:** Il calcolo dell'importo del canone è strettamente legato agli **Accordi Territoriali specifici di ogni Comune**. Questo calcolatore utilizza i parametri del **Comune di Bologna come modello di riferimento** per illustrare il meccanismo. I **vantaggi fiscali (Cedolare Secca al 10% e riduzione IMU) sono invece validi su tutto il territorio nazionale** per i Comuni che lo prevedono. **Verifica sempre l'Accordo Territoriale in vigore nel tuo Comune.**\n\n### **Parte 1: Come Funziona il Calcolo del Canone (Esempio su Bologna)**\n\nIl canone non è libero, ma deve rientrare in una fascia di valori (minimo-massimo) calcolata secondo una formula precisa:\n\n**Canone Annuo = Superficie Convenzionale (m²) x Valore al m² della Zona x Fattori di Qualità**\n\n1.  **Individuazione della Zona Territoriale**: Ogni Comune è suddiviso in aree (es. centro, periferia) a cui corrispondono diverse fasce di prezzo.\n2.  **Calcolo della Superficie Convenzionale**: **Non è la metratura calpestabile!** Si ottiene sommando:\n    * **100%** della superficie utile dell'alloggio (SUA).\n    * **25%** della superficie di balconi, terrazzi, cantine, soffitte e altri accessori (fino a un massimo).\n    * **10%** della superficie del posto auto.\n    Il metodo di calcolo è definito nell'allegato B del D.P.R. 23 marzo 1998, n. 138.\n3.  **Applicazione degli Elementi Qualitativi**: All'importo base vengono applicate delle maggiorazioni in base a caratteristiche specifiche dell'immobile (es. presenza di arredo completo, ascensore, doppi servizi, stato di manutenzione), come previsto dall'Accordo locale.\n\nIl risultato di questo calcolo è una **forchetta di valori** (un canone minimo e uno massimo) all'interno della quale le parti possono liberamente concordare il canone definitivo.\n\n### **Parte 2: I Vantaggi Fiscali del Canone Concordato (Validi a Livello Nazionale)**\n\nScegliere un contratto a canone concordato (tipicamente 3+2, 4+2, o per studenti universitari) dà accesso a un regime fiscale di grande favore.\n\nRegime Fiscale **Canone Concordato (con Cedolare Secca)** **Mercato Libero (con Tassazione Ordinaria IRPEF)**\n**Tassazione sul Reddito** **Cedolare Secca al 10%**. Un'imposta fissa e sostitutiva. **Tassazione IRPEF progressiva (23%-43%)** sul 95% del canone annuo.\n**IMU** **Riduzione del 25%** sull'imposta dovuta. **Aliquota piena** stabilita dal Comune.\n**Altre Imposte** Esenzione da imposta di registro e di bollo. Imposta di registro (2% del canone annuo) e di bollo da pagare.\n\n#### **L'importanza dell'Asseverazione**\n\nPer poter usufruire dei vantaggi fiscali, il contratto di locazione deve essere **asseverato**. L'asseverazione è una certificazione, rilasciata da almeno una delle associazioni di categoria firmatarie dell'Accordo Territoriale, che attesta la conformità del contenuto economico e normativo del contratto all'Accordo stesso. **Senza asseverazione, le agevolazioni fiscali non sono valide.**\n\n### **Parte 3: Guida all'Uso del Calcolatore**\n\nIl nostro strumento è diviso in due sezioni:\n\n1.  **Calcolo del Canone (Esempio Bologna)**: Inserisci i dati del tuo immobile per ottenere una stima della fascia di canone applicabile secondo l'accordo di Bologna.\n2.  **Analisi di Convenienza Fiscale**: Una volta definito un canone annuo (che deve rientrare nella fascia calcolata), inserisci i dati fiscali (rendita catastale, aliquota IMU, scaglione IRPEF) per confrontare il carico di tasse totale tra canone concordato e mercato libero. Il risultato ti mostrerà il **risparmio netto annuale**.\n\nQuesta simulazione ti darà un'idea chiara e quantitativa della convenienza di questa tipologia contrattuale."
};


const CanoneConcordatoVantaggiFiscaliCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialInputs = {
        comune: "Bologna (esempio di calcolo)", zona_territoriale: "Intermedia", superficie_convenzionale: 80, is_arredato: true, has_ascensore: true, canone_scelto_annuo: 7200, rendita_catastale: 750, aliquota_imu_ordinaria: 1.06, scaglione_irpef_proprietario: "35%"
    };
    const [inputValues, setInputValues] = useState<{ [key: string]: any }>(initialInputs);

    const handleInputChange = (id: string, value: any) => setInputValues(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setInputValues(initialInputs);

    const calculatedOutputs = useMemo(() => {
        const { superficie_convenzionale, zona_territoriale, is_arredato, has_ascensore, canone_scelto_annuo, rendita_catastale, aliquota_imu_ordinaria, scaglione_irpef_proprietario } = inputValues;
        
        const data_bologna: { [key: string]: { min: number, max: number } } = {'Centrale e di Pregio': {min: 67.14, max: 130.33}, 'Intermedia': {min: 51.65, max: 92.96}, 'Periferia e Frazioni': {min: 46.48, max: 82.64}};
        const val_min_mq_anno = data_bologna[zona_territoriale]?.min || 0;
        const val_max_mq_anno = data_bologna[zona_territoriale]?.max || 0;
        const canone_base_annuo_min = superficie_convenzionale * val_min_mq_anno;
        const canone_base_annuo_max = superficie_convenzionale * val_max_mq_anno;

        const fattore_qualita = 1 + (is_arredato ? 0.15 : 0) + (has_ascensore ? 0.10 : 0);
        const canone_finale_annuo_min = canone_base_annuo_min * fattore_qualita;
        const canone_finale_annuo_max = canone_base_annuo_max * fattore_qualita;
        const canone_minimo_mensile = canone_finale_annuo_min / 12;
        const canone_massimo_mensile = canone_finale_annuo_max / 12;

        const imposta_cedolare_concordato = canone_scelto_annuo * 0.10;
        const base_imponibile_imu = (rendita_catastale * 1.05) * 160;
        const imu_ordinaria = base_imponibile_imu * (aliquota_imu_ordinaria / 100);
        const imu_concordato = imu_ordinaria * 0.75;
        const tasse_concordato = imposta_cedolare_concordato + imu_concordato;

        const aliquota_irpef_val = parseFloat(scaglione_irpef_proprietario) / 100;
        const imponibile_irpef = canone_scelto_annuo * 0.95;
        const imposta_irpef = imponibile_irpef * aliquota_irpef_val;
        const tasse_libero_mercato_irpef = imposta_irpef + imu_ordinaria;

        // For comparison, let's also calculate the cost with 21% cedolare
        const imposta_cedolare_libero = canone_scelto_annuo * 0.21;
        const tasse_libero_mercato_cedolare = imposta_cedolare_libero + imu_ordinaria;
        
        const risparmio_fiscale_annuo = tasse_libero_mercato_irpef - tasse_concordato;

        return { canone_minimo_mensile, canone_massimo_mensile, risparmio_fiscale_annuo, tasse_concordato, tasse_libero_mercato_irpef, tasse_libero_mercato_cedolare };
    }, [inputValues]);

    const chartData = [
        { name: 'Canone Concordato', 'Costo Fiscale Annuo': calculatedOutputs.tasse_concordato, fill: '#22c55e' },
        { name: 'Libero Mercato (Cedolare 21%)', 'Costo Fiscale Annuo': calculatedOutputs.tasse_libero_mercato_cedolare, fill: '#f97316' },
        { name: 'Libero Mercato (IRPEF)', 'Costo Fiscale Annuo': calculatedOutputs.tasse_libero_mercato_irpef, fill: '#ef4444' }
    ];

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    // Update canone_scelto_annuo when the calculated range changes
    useEffect(() => {
        const avg_canone = (calculatedOutputs.canone_minimo_mensile + calculatedOutputs.canone_massimo_mensile) * 12 / 2;
        if (avg_canone > 0) {
            handleInputChange('canone_scelto_annuo', Math.round(avg_canone / 100) * 100);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calculatedOutputs.canone_minimo_mensile, calculatedOutputs.canone_massimo_mensile]);
    
    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <div className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-md p-3 mb-6">
                            <strong>Attenzione:</strong> Il calcolo del canone è un **esempio basato sull'Accordo di Bologna**. Per accedere ai vantaggi fiscali è obbligatorio rispettare i parametri del proprio Comune e ottenere l'asseverazione.
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">1. Calcolo Fascia Canone (Esempio su Bologna)</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
                                    {inputs.slice(0, 5).map(input => (
                                        <div key={input.id} className={input.type === 'boolean' ? 'md:col-span-2' : ''}>
                                        {input.type === 'select' && (
                                            <><label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip></label>
                                            <select id={input.id} value={inputValues[input.id]} onChange={e => handleInputChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">{input.options?.map(o => <option key={o} value={o}>{o}</option>)}</select></>
                                        )}
                                        {input.type === 'number' && (
                                            <><label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip></label>
                                            <div className="flex items-center gap-2"><input id={input.id} type="number" className="w-full border-gray-300 rounded-md shadow-sm" value={inputValues[input.id]} onChange={e => handleInputChange(input.id, parseFloat(e.target.value) || 0)} /><span className="text-sm text-gray-500">{input.unit}</span></div></>
                                        )}
                                        {input.type === 'boolean' && (<div className="flex items-center gap-3 pt-2">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300" checked={inputValues[input.id]} onChange={e => handleInputChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip></label>
                                        </div>)}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                     <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg"><div className="text-sm text-gray-600">{outputs[0].label}</div><div className="text-xl font-bold text-blue-700">{isClient ? formatCurrency(calculatedOutputs.canone_minimo_mensile) : '...'}</div></div>
                                     <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg"><div className="text-sm text-gray-600">{outputs[1].label}</div><div className="text-xl font-bold text-blue-700">{isClient ? formatCurrency(calculatedOutputs.canone_massimo_mensile) : '...'}</div></div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">2. Calcolo Vantaggi Fiscali (Nazionale)</h2>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
                                    {inputs.slice(5).map(input => (
                                        <div key={input.id}>
                                         {input.type === 'number' && (
                                            <><label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip></label>
                                            <div className="flex items-center gap-2"><input id={input.id} type="number" className="w-full border-gray-300 rounded-md shadow-sm" value={inputValues[input.id]} onChange={e => handleInputChange(input.id, parseFloat(e.target.value) || 0)} /><span className="text-sm text-gray-500">{input.unit}</span></div></>
                                        )}
                                        {input.type === 'select' && (
                                            <><label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip></label>
                                            <select id={input.id} value={inputValues[input.id]} onChange={e => handleInputChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">{input.options?.map(o => <option key={o} value={o}>{o}</option>)}</select></>
                                        )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex justify-between items-center">
                                    <div><div className="text-base font-semibold text-gray-700">{outputs[2].label}</div><div className="text-xs text-green-700">Rispetto alla tassazione IRPEF a mercato libero</div></div>
                                    <div className="text-2xl font-bold text-green-600">{isClient ? formatCurrency(calculatedOutputs.risparmio_fiscale_annuo) : '...'}</div>
                                </div>
                            </div>
                            
                             <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Costi Fiscali Annuì</h3>
                                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                    {isClient && <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="name" fontSize={12} /><YAxis tickFormatter={(v) => `€${v/1000}k`} /><ChartTooltip formatter={(v:number) => formatCurrency(v)} /><Bar dataKey="Costo Fiscale Annuo">{chartData.map((e, i) => <Cell key={`cell-${i}`} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer>}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3"><button onClick={handleReset} className="w-full text-sm border border-red-300 bg-red-50 rounded-md px-3 py-2 text-red-700 hover:bg-red-100 transition-colors">Reset Calcolo</button></div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Canone Concordato</h2><ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.mit.gov.it/documentazione/decreto-16-gennaio-2017" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Decreto Ministeriale 16 gennaio 2017</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/fabbricatiterreni/cedolare-secca/scheda-informativa-cedolare-secca" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Cedolare Secca</a></li>
                             <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1998-03-23;138" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 138/98 - Norme per la revisione delle zone censuarie</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};
export default CanoneConcordatoVantaggiFiscaliCalculator;