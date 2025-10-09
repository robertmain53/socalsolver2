'use client';

import React, { useState, useRef, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Imposta di Bollo su Conto Corrente e Deposito Titoli",
  description: "Calcola l'imposta di bollo annuale (34,20€ o 100€) sul conto corrente e quella proporzionale (2 per mille) su azioni, ETF e investimenti. Verifica le esenzioni."
};

// --- Componenti UI e Icone (Self-Contained) ---
const InfoIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> );
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => ( <div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div> );

const FaqSchema = () => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": "Come si calcola il bollo sul conto corrente?", "acceptedAnswer": {"@type": "Answer", "text": "Il bollo sul conto corrente è un'imposta fissa: 34,20€ per le persone fisiche e 100€ per le persone giuridiche. Si paga solo se la giacenza media annua supera i 5.000€. Al di sotto di questa soglia, l'imposta non è dovuta."}},
            {"@type": "Question", "name": "Quando non si paga l'imposta di bollo sul conto?", "acceptedAnswer": {"@type": "Answer", "text": "Non si paga il bollo sul conto corrente se la giacenza media annua è inferiore a 5.000€. Le persone fisiche sono esenti anche se hanno un ISEE inferiore a 7.500€, a prescindere dalla giacenza."}},
            {"@type": "Question", "name": "A quanto ammonta l'imposta di bollo sul deposito titoli?", "acceptedAnswer": {"@type": "Answer", "text": "L'imposta di bollo su investimenti come azioni, obbligazioni, ETF e fondi è proporzionale e ammonta al 2 per mille (0,20%) del loro valore di mercato, calcolata in base ai giorni di possesso. Per le persone giuridiche esiste un tetto massimo di 14.000€."}}
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
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati di Configurazione ---
const calculatorData = {
  "slug": "imposta-bollo-conto-e-titoli", "category": "Risparmio e Investimenti", "title": "Calcolatore Imposta di Bollo su Conto Corrente e Deposito Titoli", "lang": "it",
  "inputs": [
    { "id": "is_persona_fisica", "label": "Titolare del Conto", "type": "select", "options": ["Persona Fisica", "Persona Giuridica (Azienda, etc.)"], "tooltip": "L'importo del bollo sul conto corrente e il massimale sul deposito titoli variano in base alla tipologia di intestatario." },
    { "id": "giacenza_media_annua_cc", "label": "Giacenza Media Annua del Conto", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "È la media dei saldi giornalieri del conto durante l'anno. Il bollo si applica solo se questo valore supera i 5.000 €." },
    { "id": "has_isee_basso", "label": "Hai un ISEE inferiore a 7.500 €?", "type": "boolean", "condition": "is_persona_fisica == true", "tooltip": "Solo per le persone fisiche: spunta se il tuo nucleo familiare ha un ISEE in corso di validità sotto la soglia di 7.500 €, che dà diritto all'esenzione." },
    { "id": "valore_totale_investimenti", "label": "Valore del Deposito Titoli/Investimenti", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il valore di mercato totale di tutti gli strumenti finanziari (azioni, obbligazioni, ETF, fondi) alla data di rendicontazione." },
    { "id": "giorni_possesso_investimenti", "label": "Giorni di possesso nell'anno", "type": "number", "unit": "gg", "min": 1, "max": 365, "step": 1, "tooltip": "L'imposta sul deposito titoli è calcolata in proporzione al periodo di possesso durante l'anno. Lascia 365 per un intero anno." }
  ],
  "outputs": [
    { "id": "bollo_conto_corrente_annuo", "label": "Bollo Annuo su Conto Corrente / Deposito", "unit": "€" },
    { "id": "bollo_deposito_titoli_annuo", "label": "Bollo Annuo su Deposito Titoli / Investimenti", "unit": "€" },
    { "id": "bollo_totale_annuo", "label": "Imposta di Bollo Totale Annua", "unit": "€" }
  ],
  "content": "### **Guida Completa all'Imposta di Bollo su Conti e Investimenti**\n\n**Come si Calcola, Quando si Paga e Come Risparmiare**\n\nL'**imposta di bollo** è una tassa indiretta che colpisce i rapporti finanziari intrattenuti con banche e intermediari. Capire come funziona è essenziale per gestire consapevolmente i propri risparmi e investimenti, evitando sorprese sull'estratto conto.\n\nQuesto calcolatore ti permette di stimare con precisione l'importo dovuto sia per i conti correnti e di deposito, sia per gli investimenti finanziari, tenendo conto di tutte le variabili e le esenzioni previste dalla legge.\n\n### **Parte 1: Imposta di Bollo su Conti Correnti e Conti Deposito**\n\nQuesta imposta si applica a conti correnti, conti di deposito e libretti di risparmio. La sua caratteristica principale è di essere un'**imposta fissa**, non proporzionale al saldo.\n\n* **Persone Fisiche**: L'imposta è pari a **34,20 € all'anno**.\n* **Persone Giuridiche** (aziende, ditte, etc.): L'imposta è pari a **100,00 € all'anno**.\n\n#### **La Condizione Fondamentale: La Giacenza Media**\n\nL'imposta di bollo **NON è dovuta** se la **giacenza media annua** del conto è **inferiore o uguale a 5.000 €**. Attenzione: se la giacenza media è anche solo di 5.001 €, l'imposta è dovuta per intero (34,20 € o 100 €), non in misura ridotta. La giacenza media è la media dei saldi giornalieri del conto durante l'anno.\n\n#### **Le Esenzioni Principali**\n\nOltre alla soglia di giacenza, esistono altre importanti esenzioni:\n\n1.  **ISEE Basso**: I titolari (persone fisiche) con un ISEE (Indicatore della Situazione Economica Equivalente) in corso di validità **inferiore a 7.500 €** sono esenti dal pagamento, a prescindere dalla giacenza media.\n2.  **Conti Base**: I cosiddetti \"conti di base\" (offerti secondo il D.L. 201/2011) sono sempre esenti.\n3.  **Conti presso Istituti di Pagamento**: I conti aperti presso Istituti di Pagamento (IP) o Istituti di Moneta Elettronica (IMEL) sono generalmente esenti da questa imposta.\n\n### **Parte 2: Imposta di Bollo su Deposito Titoli e Prodotti Finanziari**\n\nQuesta imposta è **proporzionale** e si applica al valore totale degli investimenti detenuti in un deposito titoli. Colpisce un'ampia gamma di strumenti, tra cui:\n\n* Azioni e Obbligazioni\n* ETF e Fondi Comuni di Investimento\n* Polizze Vita di tipo finanziario (Ramo I e III) se non hanno finalità previdenziali\n\nSono invece **esclusi** i fondi pensione e i fondi sanitari.\n\n#### **Come si Calcola**\n\nL'aliquota è del **2 per mille (0,20%)** del valore di mercato degli strumenti finanziari alla data di rendicontazione (solitamente il 31 dicembre o la data di chiusura del rapporto).\n\n* **Formula**: Valore di Mercato x 0,002\n\n* **Calcolo Pro-Rata**: L'imposta è dovuta in proporzione al periodo di detenzione durante l'anno. Se un investimento è stato mantenuto per 180 giorni, l'imposta sarà calcolata sull'intero anno e poi riproporzionata: (Imposta Annua / 365) \\* 180.\n\n* **Massimale per le Persone Giuridiche**: Per i soggetti diversi dalle persone fisiche, l'importo massimo del bollo sul deposito titoli è fissato a **14.000 € all'anno**. Questo limite **non si applica** alle persone fisiche.\n\n### **Parte 3: Domande Frequenti (FAQ)**\n\n* **Come avviene il pagamento?** La banca o l'intermediario finanziario agisce come sostituto d'imposta, prelevando l'importo direttamente dal conto del cliente, di solito con cadenza trimestrale o annuale.\n* **Cosa succede se ho più conti?** La soglia dei 5.000 € di giacenza media si applica a **ciascun singolo conto**. Se hai due conti con una giacenza media di 4.000 € ciascuno, non pagherai il bollo su nessuno dei due. Se uno ha 6.000 € e l'altro 3.000 €, pagherai il bollo solo sul primo.\n* **E se ho più depositi titoli?** L'imposta del 2 per mille si calcola separatamente per ogni deposito titoli detenuto presso diversi intermediari."
};

const ImpostaBolloContoETitoliCalculator: React.FC = () => {
    const { title } = calculatorData;
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialInputs = {
        is_persona_fisica: true, giacenza_media_annua_cc: 6000, has_isee_basso: false, valore_totale_investimenti: 50000, giorni_possesso_investimenti: 365
    };
    const [inputValues, setInputValues] = useState<{ [key: string]: any }>(initialInputs);
    
    const handleInputChange = (id: string, value: any) => {
        if (id === "is_persona_fisica" && value === false) {
             setInputValues(prev => ({ ...prev, [id]: value, has_isee_basso: false }));
        } else {
            setInputValues(prev => ({ ...prev, [id]: value }));
        }
    };
    const handleReset = () => setInputValues(initialInputs);

    const calculatedOutputs = useMemo(() => {
        const { is_persona_fisica, giacenza_media_annua_cc, has_isee_basso, valore_totale_investimenti, giorni_possesso_investimenti } = inputValues;
        
        const IMPORTO_BOLLO_PF = 34.20; const IMPORTO_BOLLO_PG = 100.00; const SOGLIA_GIACENZA_MEDIA = 5000; const ALIQUOTA_BOLLO_TITOLI = 0.002; const MASSIMALE_BOLLO_TITOLI_PG = 14000;

        const bollo_base_cc = is_persona_fisica ? IMPORTO_BOLLO_PF : IMPORTO_BOLLO_PG;
        const is_esente_per_giacenza = giacenza_media_annua_cc <= SOGLIA_GIACENZA_MEDIA;
        const is_esente_per_isee = is_persona_fisica && has_isee_basso;
        const bollo_conto_corrente_annuo = (is_esente_per_giacenza || is_esente_per_isee) ? 0 : bollo_base_cc;

        const bollo_titoli_lordo = valore_totale_investimenti * ALIQUOTA_BOLLO_TITOLI;
        const bollo_titoli_prorata = bollo_titoli_lordo * (giorni_possesso_investimenti / 365);
        const bollo_deposito_titoli_annuo = is_persona_fisica ? bollo_titoli_prorata : Math.min(bollo_titoli_prorata, MASSIMALE_BOLLO_TITOLI_PG);

        const bollo_totale_annuo = bollo_conto_corrente_annuo + bollo_deposito_titoli_annuo;

        return { bollo_conto_corrente_annuo, bollo_deposito_titoli_annuo, bollo_totale_annuo };
    }, [inputValues]);

    const chartData = [
        { name: 'Bollo Conto Corrente', value: calculatedOutputs.bollo_conto_corrente_annuo },
        { name: 'Bollo Deposito Titoli', value: calculatedOutputs.bollo_deposito_titoli_annuo },
    ].filter(d => d.value > 0);
    const CHART_COLORS = ['#3b82f6', '#f97316'];

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Calcola l'imposta fissa sui conti e quella proporzionale sugli investimenti.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Sezione Conto Corrente */}
                            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Conto Corrente / Deposito</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor="is_persona_fisica">{calculatorData.inputs[0].label}<Tooltip text={calculatorData.inputs[0].tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip></label>
                                    <select id="is_persona_fisica" value={inputValues.is_persona_fisica ? "Persona Fisica" : "Persona Giuridica (Azienda, etc.)"} onChange={e => handleInputChange("is_persona_fisica", e.target.value === "Persona Fisica")} className="w-full border-gray-300 rounded-md shadow-sm">{calculatorData.inputs[0].options?.map(o=><option key={o} value={o}>{o}</option>)}</select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor="giacenza_media_annua_cc">{calculatorData.inputs[1].label}<Tooltip text={calculatorData.inputs[1].tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip></label>
                                    <div className="flex items-center gap-2"><input id="giacenza_media_annua_cc" type="number" className="w-full border-gray-300 rounded-md shadow-sm" value={inputValues.giacenza_media_annua_cc} onChange={e => handleInputChange("giacenza_media_annua_cc", parseFloat(e.target.value) || 0)} /><span className="text-sm text-gray-500">€</span></div>
                                </div>
                                {inputValues.is_persona_fisica && <div>
                                    <div className="flex items-center gap-3 p-2 rounded-md bg-white border">
                                        <input id="has_isee_basso" type="checkbox" className="h-5 w-5 rounded border-gray-300" checked={inputValues.has_isee_basso} onChange={e => handleInputChange("has_isee_basso", e.target.checked)} />
                                        <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="has_isee_basso">{calculatorData.inputs[2].label}<Tooltip text={calculatorData.inputs[2].tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip></label>
                                    </div>
                                </div>}
                            </div>
                            
                            {/* Sezione Deposito Titoli */}
                            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Deposito Titoli / Investimenti</h2>
                                 <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor="valore_totale_investimenti">{calculatorData.inputs[3].label}<Tooltip text={calculatorData.inputs[3].tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip></label>
                                    <div className="flex items-center gap-2"><input id="valore_totale_investimenti" type="number" className="w-full border-gray-300 rounded-md shadow-sm" value={inputValues.valore_totale_investimenti} onChange={e => handleInputChange("valore_totale_investimenti", parseFloat(e.target.value) || 0)} /><span className="text-sm text-gray-500">€</span></div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor="giorni_possesso_investimenti">{calculatorData.inputs[4].label}<Tooltip text={calculatorData.inputs[4].tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip></label>
                                    <div className="flex items-center gap-2"><input id="giorni_possesso_investimenti" type="number" className="w-full border-gray-300 rounded-md shadow-sm" min="1" max="365" value={inputValues.giorni_possesso_investimenti} onChange={e => handleInputChange("giorni_possesso_investimenti", parseInt(e.target.value) || 1)} /><span className="text-sm text-gray-500">gg</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Risultati */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg"><div className="text-sm text-gray-600">{calculatorData.outputs[0].label}</div><div className="text-2xl font-bold text-blue-700">{isClient ? formatCurrency(calculatedOutputs.bollo_conto_corrente_annuo) : '...'}</div></div>
                                <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg"><div className="text-sm text-gray-600">{calculatorData.outputs[1].label}</div><div className="text-2xl font-bold text-orange-700">{isClient ? formatCurrency(calculatedOutputs.bollo_deposito_titoli_annuo) : '...'}</div></div>
                                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg sm:col-span-2 lg:col-span-1"><div className="text-sm text-gray-600">{calculatorData.outputs[2].label}</div><div className="text-2xl font-bold text-green-700">{isClient ? formatCurrency(calculatedOutputs.bollo_totale_annuo) : '...'}</div></div>
                            </div>
                        </div>

                        {/* Grafico */}
                        {calculatedOutputs.bollo_totale_annuo > 0 && <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione dell'Imposta</h3>
                            <div className="h-56 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={(entry) => `${(entry.percent * 100).toFixed(0)}%`}>
                                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <ChartTooltip formatter={(v:number) => formatCurrency(v)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>}
                            </div>
                        </div>}
                    </div>
                </div>
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3"><button onClick={handleReset} className="w-full text-sm border border-red-300 bg-red-50 rounded-md px-3 py-2 text-red-700 hover:bg-red-100 transition-colors">Reset Calcolo</button></div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida all'Imposta di Bollo</h2><ContentRenderer content={calculatorData.content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1972-10-26;642" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 642/1972 - Disciplina dell'imposta di bollo</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/imposta-di-bollo/infogen-imposta-bollo" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Imposta di Bollo</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};
export default ImpostaBolloContoETitoliCalculator;