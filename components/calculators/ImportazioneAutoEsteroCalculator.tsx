'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "importazione-auto-estero",
  "category": "Auto e Trasporti",
  "title": "Calcolatore Costo Importazione Auto dall'Estero",
  "lang": "it",
  "inputs": [
    { "id": "prezzo_veicolo", "label": "Prezzo di Acquisto del Veicolo", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Il costo effettivo dell'auto pagato al venditore estero." },
    { "id": "costo_trasporto", "label": "Costo del Trasporto in Italia", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Spese per trasportare il veicolo fino al tuo domicilio o al porto/dogana di arrivo." },
    { "id": "paese_provenienza_ue", "label": "Il veicolo è acquistato in un Paese UE?", "type": "boolean" as const, "tooltip": "Spunta se l'acquisto avviene in un paese membro dell'Unione Europea (es. Germania, Francia). Lascia non spuntato per Svizzera, USA, UK, etc." },
    { "id": "veicolo_nuovo", "label": "Il veicolo è considerato 'Nuovo'?", "type": "boolean" as const, "tooltip": "Un veicolo è 'nuovo' se ha meno di 6.000 km OPPURE meno di 6 mesi di vita. Questo è cruciale per il calcolo dell'IVA." },
    { "id": "auto_prodotta_in_ue", "label": "L'auto è stata PRODOTTA in un Paese UE?", "type": "boolean" as const, "condition": "paese_provenienza_ue == false", "tooltip": "Importante per i dazi: se un'auto è prodotta in UE (es. una BMW) e la acquisti in Svizzera, con la documentazione corretta (EUR.1) il dazio è zero." },
    { "id": "costi_burocratici", "label": "Costi di Immatricolazione e Agenzia", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Costi stimati per immatricolazione, targhe, traduzioni, pratiche in Motorizzazione e l'eventuale compenso di un'agenzia specializzata. Include l'IPT." }
  ],
  "outputs": [
    { "id": "dettaglio_dazio", "label": "Dazio Doganale Stimato (10%)", "unit": "€" },
    { "id": "dettaglio_iva", "label": "IVA da Versare in Italia (22%)", "unit": "€" },
    { "id": "costo_totale_importazione", "label": "Costo Totale Stimato per l'Importazione", "unit": "€" },
    { "id": "costo_finale_veicolo", "label": "Costo Finale 'Chiavi in Mano' del Veicolo", "unit": "€" }
  ],
  "content": "### **Guida Definitiva all'Importazione di Auto dall'Estero (2025)**\n\n**Analisi dei Costi, Procedure Burocratiche e Consigli Pratici**\n\nL'acquisto di un'automobile all'estero può rappresentare un'opportunità vantaggiosa, ma nasconde complessità e costi che, se non correttamente valutati, possono trasformare un affare in un problema. Questa guida completa, abbinata al nostro calcolatore interattivo, ha l'obiettivo di fare chiarezza su ogni singola voce di spesa e su ogni passaggio burocratico.\n\nL'analisi si basa sui tre pilastri fondamentali dell'importazione: **Provenienza (UE / Extra-UE)**, **Stato del Veicolo (Nuovo / Usato)** e **Tassazione (IVA e Dazi)**.\n\n### **Parte 1: La Distinzione Chiave - UE vs. Extra-UE**\n\nIl fattore più importante che determina costi e procedure è il paese di acquisto del veicolo.\n\n#### **A) Importazione da un Paese dell'Unione Europea (es. Germania, Francia, Spagna)**\n\nGrazie al mercato unico, l'importazione intra-comunitaria è notevolmente semplificata e **non prevede dazi doganali**. Tuttavia, la discriminante principale diventa l'IVA (Imposta sul Valore Aggiunto).\n\n* **Auto Usata**: Se il veicolo ha più di 6 mesi di vita **E** ha percorso più di 6.000 km, è considerato 'usato'. In questo caso, l'IVA si paga nel paese d'acquisto (generalmente inclusa nel prezzo esposto dal venditore) e **non è dovuta una seconda volta in Italia**. Questa è la situazione più comune e vantaggiosa.\n* **Auto Nuova**: Se il veicolo ha meno di 6 mesi **O** meno di 6.000 km, è considerato 'nuovo' ai fini fiscali. L'IVA (al 22%) **deve essere versata in Italia**, calcolata sul prezzo di acquisto. Solitamente si acquista all'estero a un prezzo netto (senza l'IVA locale) per poi regolarizzare la posizione con l'Agenzia delle Entrate.\n\n#### **B) Importazione da un Paese Extra-UE (es. Svizzera, USA, Regno Unito, Principato di Monaco)**\n\nQuesta procedura è significativamente più complessa e onerosa, in quanto il veicolo deve essere 'sdoganato' per essere immesso nel mercato europeo.\n\nI costi principali sono:\n\n1.  **Dazio Doganale**: Solitamente pari al **10%** del valore del veicolo AUMENTATO dei costi di trasporto. **Eccezione cruciale**: se l'auto è stata **PRODOTTA** nell'UE (es. un'Audi acquistata in Svizzera) e si dispone del certificato di origine preferenziale (modello EUR.1), il dazio non è dovuto. In assenza di tale prova, il dazio si applica.\n2.  **IVA (22%)**: L'IVA si calcola sul valore del veicolo + costi di trasporto + l'importo del dazio stesso. Si paga quindi 'tassa sulla tassa'. Questa regola si applica **indistintamente a veicoli nuovi e usati**.\n\n### **Parte 2: La Burocrazia - Documenti e Immatricolazione**\n\nOltre ai costi fiscali, è necessario affrontare un iter burocratico per poter circolare legalmente in Italia.\n\n* **Certificato di Conformità (COC)**: È il documento più importante, rilasciato dal costruttore, che attesta la conformità del veicolo alle normative europee. Per le auto provenienti dall'UE è quasi sempre disponibile. Per i veicoli extra-UE (specialmente USA), potrebbe non esistere o richiedere costosi adeguamenti tecnici (es. fari, frecce) e un collaudo specifico presso la Motorizzazione Civile ('omologazione in esemplare unico').\n* **Immatricolazione Italiana**: Una volta superati i controlli tecnici, si procede con l'immatricolazione presso la Motorizzazione e l'iscrizione al Pubblico Registro Automobilistico (PRA). I costi includono:\n    * **Imposta Provinciale di Trascrizione (IPT)**: Varia in base alla potenza del veicolo (kW) e alla provincia di residenza. È una delle voci di spesa più significative.\n    * **Emolumenti ACI e Imposte di Bollo**.\n    * **Costo delle Targhe**.\n\nPer semplificare questo processo, molti si affidano ad agenzie di pratiche auto specializzate, il cui costo va aggiunto al totale.\n\n### **Parte 3: Casi Pratici e Consigli**\n\n#### **Caso Studio 1: BMW 320d Usata (2020) dalla Germania**\n\n* **Provenienza**: UE\n* **Stato**: Usato (>6.000 km e >6 mesi)\n* **Costi Fiscali**: Dazio = 0€. IVA in Italia = 0€ (già pagata in Germania e inclusa nel prezzo).\n* **Costi Burocratici**: Trasporto + Immatricolazione/IPT.\n* **Verdetto**: Procedura relativamente semplice e fiscalmente vantaggiosa.\n\n#### **Caso Studio 2: Ford Mustang Nuovo dagli USA**\n\n* **Provenienza**: Extra-UE\n* **Stato**: Nuovo\n* **Costi Fiscali**: Dazio = 10% (su prezzo + trasporto). IVA = 22% (su prezzo + trasporto + dazio).\n* **Costi Burocratici**: Trasporto intercontinentale + omologazione tecnica (potenzialmente costosa) + Immatricolazione/IPT.\n* **Verdetto**: Operazione complessa e molto onerosa, da valutare solo per modelli di particolare interesse non disponibili in Europa.\n\n### **Conclusione**\n\nImportare un'auto può essere conveniente, specialmente per modelli specifici o se si cerca nel mercato dell'usato tedesco. Tuttavia, è fondamentale utilizzare uno strumento come questo calcolatore per avere una stima realistica dei costi totali. **La regola d'oro è: per le importazioni extra-UE, i costi fiscali e doganali possono facilmente aggiungere un 35-40% al prezzo iniziale del veicolo.**\n\nSi raccomanda sempre di consultare un'agenzia specializzata prima di procedere con l'acquisto per evitare sorprese.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Quanto costa importare un'auto dalla Germania?", "acceptedAnswer": { "@type": "Answer", "text": "Per un'auto usata dalla Germania non si pagano dazi né IVA in Italia. I costi principali sono il trasporto (500-1000€), l'immatricolazione e l'IPT, che varia in base ai kW del veicolo (800-2000€ circa). Il nostro calcolatore fornisce una stima precisa." } }, { "@type": "Question", "name": "Si paga il dazio per un'auto importata dalla Svizzera?", "acceptedAnswer": { "@type": "Answer", "text": "Dipende dal paese di produzione dell'auto. Se l'auto è stata prodotta in UE (es. Mercedes, Fiat) e si ha il certificato d'origine EUR.1, il dazio è zero. Se è prodotta fuori UE (es. Toyota, Ford), si paga un dazio del 10%. In entrambi i casi, si paga sempre l'IVA al 22% in Italia." } }, { "@type": "Question", "name": "Come si calcola l'IVA su un'auto nuova comprata all'estero?", "acceptedAnswer": { "@type": "Answer", "text": "Se l'auto è considerata 'nuova' (meno di 6 mesi o 6.000 km), l'IVA al 22% si paga in Italia. Se acquistata in UE, si calcola sul prezzo di fattura. Se acquistata fuori UE, la base imponibile per l'IVA è più alta: (Prezzo Veicolo + Costo Trasporto + Dazio)." } }, { "@type": "Question", "name": "Cos'è il Certificato di Conformità (COC)?", "acceptedAnswer": { "@type": "Answer", "text": "Il Certificato di Conformità (COC) è un documento rilasciato dal costruttore che attesta che il veicolo è conforme agli standard tecnici e di omologazione dell'Unione Europea. È essenziale per poter immatricolare un veicolo importato in Italia senza dover ricorrere a un costoso collaudo tecnico ('esemplare unico')." } } ] }
};

// --- Caricamento Asincrono del Componente Grafico ---
const DynamicPieChart = dynamic(() => import('recharts').then(mod => {
    const CustomPieChart = ({ data }: { data: any[] }) => {
        const { PieChart, Pie, Cell, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
        const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#ef4444', '#8b5cf6'];
        return (
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={false}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    };
    return CustomPieChart;
}), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-[250px] w-full bg-gray-100 rounded-lg text-sm text-gray-500">Caricamento grafico...</div>
});

// --- Componenti di Utilità (Icone, Tooltip, SEO, etc.) ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('####')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/####/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Componente Principale del Calcolatore ---
const ImportazioneAutoEsteroCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = {
        prezzo_veicolo: 25000,
        costo_trasporto: 800,
        paese_provenienza_ue: true,
        veicolo_nuovo: false,
        auto_prodotta_in_ue: true,
        costi_burocratici: 1200
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { prezzo_veicolo, costo_trasporto, paese_provenienza_ue, veicolo_nuovo, auto_prodotta_in_ue, costi_burocratici } = states;
        
        const base_imponibile_dogana = prezzo_veicolo + costo_trasporto;
        const dettaglio_dazio = paese_provenienza_ue || auto_prodotta_in_ue ? 0 : base_imponibile_dogana * 0.10;
        const base_imponibile_iva = base_imponibile_dogana + dettaglio_dazio;
        const dettaglio_iva = paese_provenienza_ue ? (veicolo_nuovo ? prezzo_veicolo * 0.22 : 0) : base_imponibile_iva * 0.22;
        const costo_totale_importazione = dettaglio_dazio + dettaglio_iva + costo_trasporto + costi_burocratici;
        const costo_finale_veicolo = prezzo_veicolo + costo_totale_importazione;
        
        return { dettaglio_dazio, dettaglio_iva, costo_totale_importazione, costo_finale_veicolo };
    }, [states]);
    
    const chartData = [
        { name: 'Prezzo Veicolo', value: states.prezzo_veicolo },
        { name: 'IVA', value: calculatedOutputs.dettaglio_iva },
        { name: 'Dazio', value: calculatedOutputs.dettaglio_dazio },
        { name: 'Trasporto', value: states.costo_trasporto },
        { name: 'Burocrazia', value: states.costi_burocratici },
    ].filter(item => item.value > 0);

    const formulaUsata = `Costo Totale = Dazio + IVA + Trasporto + Burocrazia`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4", putOnlyUsedFonts: true });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) { console.error(e); alert("Errore durante la creazione del PDF."); }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Sinistra - Calcolatore */}
                <div className="lg:col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Stima i costi totali per nazionalizzare un veicolo acquistato fuori Italia.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima accurata ma non può sostituire la consulenza di un professionista. I costi finali possono variare.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inputs.map(input => {
                                const isVisible = !input.condition || (input.condition.includes('== false') && !states[input.condition.split(' ')[0]]);
                                if (!isVisible) return null;
                                
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-gray-50 border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            {inputLabel}
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8">
                             <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Riepilogo dei Costi</h2>
                             <div className="space-y-3">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'costo_finale_veicolo' ? 'bg-sky-50 border-l-4 border-sky-500' : 'bg-gray-50'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'costo_finale_veicolo' ? 'text-sky-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        <div className="mt-8">
                             <h3 className="text-lg font-semibold text-gray-700 mb-2">Analisi Grafica dei Costi</h3>
                             <div className="w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && <DynamicPieChart data={chartData} />}
                             </div>
                        </div>

                        <div className="mt-6 border rounded-lg shadow-sm p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-white rounded font-mono break-words">{formulaUsata}</p>
                        </div>
                    </div>
                </div>

                {/* Colonna Destra - Contenuti e Utility */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 rounded-md px-3 py-2 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida all'Importazione</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.adm.gov.it/portale/dogane" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Agenzia delle Dogane e dei Monopoli</a></li>
                            <li><a href="https://www.aci.it/i-servizi/guide-utili/guida-pratiche-auto/importare-un-veicolo.html" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Automobile Club d'Italia (ACI)</a></li>
                             <li><a href="https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32006L0112" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Direttiva UE 2006/112/CE (Sistema IVA)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default ImportazioneAutoEsteroCalculator;