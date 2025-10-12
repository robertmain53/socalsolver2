'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

// --- Placeholder di Caricamento per il Grafico ---
const ChartLoading = () => (
    <div className="flex items-center justify-center h-full w-full bg-gray-50 rounded-lg">
        <div className="text-gray-400">Caricamento grafico...</div>
    </div>
);

// --- Caricamento Dinamico del Componente Grafico ---
const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
    
    // Componente wrapper per passare i props al grafico Recharts
    const ChartComponent = (props: any) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} tick={{ fontSize: 10 }} />
                <ChartTooltip
                    formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)}
                    labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
                    itemStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{fontSize: "12px"}}/>
                <Bar dataKey="Parcella Fissa" fill="#4f46e5" />
                <Bar dataKey="Percentuale" fill="#fb923c" />
            </BarChart>
        </ResponsiveContainer>
    );
    return ChartComponent;
}), {
    ssr: false,
    loading: () => <ChartLoading />,
});


// --- Dati di configurazione del calcolatore (inclusi nel file) ---
const calculatorData = {
  "slug": "costo-consulente-finanziario",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Costo di un Consulente Finanziario (parcella vs. % gestito)",
  "lang": "it",
  "inputs": [
    { "id": "patrimonio_iniziale", "label": "Patrimonio Iniziale da Investire", "type": "number" as const, "unit": "€", "min": 10000, "step": 5000, "tooltip": "Inserisci il capitale totale che intendi affidare alla gestione del consulente. È la base su cui viene calcolata la parcella in percentuale." },
    { "id": "costo_percentuale_annua", "label": "Parcella in Percentuale Annua (% AUM)", "type": "number" as const, "unit": "%", "min": 0.1, "max": 3, "step": 0.05, "tooltip": "La commissione annua calcolata come percentuale del patrimonio gestito (Assets Under Management). Tipicamente tra 0.8% e 1.5%." },
    { "id": "costo_parcella_fissa_annua", "label": "Parcella Fissa Annua (Fee-Only)", "type": "number" as const, "unit": "€", "min": 500, "step": 100, "tooltip": "L'importo fisso annuale richiesto dal consulente, indipendente dall'andamento e dal valore del patrimonio. Tipico dei consulenti indipendenti (fee-only)." },
    { "id": "anni_investimento", "label": "Orizzonte Temporale", "type": "number" as const, "unit": "anni", "min": 1, "max": 40, "step": 1, "tooltip": "Il numero di anni per cui prevedi di mantenere l'investimento. I costi hanno un impatto maggiore sul lungo periodo." },
    { "id": "rendimento_annuo_lordo", "label": "Rendimento Annuo Lordo Stimato", "type": "number" as const, "unit": "%", "min": 0, "max": 15, "step": 0.5, "tooltip": "Il rendimento medio annuo atteso dal tuo portafoglio, al lordo dei costi di consulenza. Una stima realistica è fondamentale per il calcolo." }
  ],
  "outputs": [
    { "id": "costo_totale_percentuale", "label": "Costo Totale (Modello a %)", "unit": "€" },
    { "id": "costo_totale_parcella", "label": "Costo Totale (Modello a Parcella Fissa)", "unit": "€" },
    { "id": "patrimonio_finale_percentuale", "label": "Patrimonio Finale Netto (Modello a %)", "unit": "€" },
    { "id": "patrimonio_finale_parcella", "label": "Patrimonio Finale Netto (Modello a Parcella Fissa)", "unit": "€" },
    { "id": "vantaggio_parcella_fissa", "label": "Vantaggio Finale del Modello a Parcella Fissa", "unit": "€" }
  ],
  "content": "### **Guida Definitiva al Costo della Consulenza Finanziaria**\n\n**Analisi Comparativa tra Parcella Fissa (Fee-Only) e Percentuale sul Gestito (AUM Fee)**\n\nLa scelta di un consulente finanziario è una delle decisioni più importanti per la salute del proprio patrimonio. Tuttavia, un aspetto spesso sottovalutato è l'impatto dei costi nel lungo periodo. Le commissioni, anche se apparentemente piccole, possono erodere in modo significativo i rendimenti finali a causa dell'effetto anti-composto. Questo calcolatore è progettato per fare chiarezza, mettendo a confronto i due principali modelli di remunerazione: la **parcella fissa (fee-only)** e la **percentuale sul patrimonio gestito (AUM fee)**.\n\nL'obiettivo è fornire uno strumento pratico per capire non solo *quanto* si paga, ma *come* si paga, e quale struttura di costo è più vantaggiosa per la propria specifica situazione. **Ricorda: il costo più basso non è sempre sinonimo di servizio migliore, ma un costo ingiustificato è il primo nemico del tuo investimento.**\n\n### **Parte 1: Il Calcolatore - Come Interpretare i Dati**\n\nQuesto strumento simula la crescita del tuo capitale in due scenari paralleli, basandosi sui parametri che inserisci. Ecco cosa significano gli input e gli output.\n\n#### **Parametri di Input (I Dati Fondamentali)**\n\n* **Patrimonio Iniziale da Investire**: È il capitale di partenza. Per il modello a percentuale, è la base imponibile su cui viene calcolata la commissione annuale.\n* **Parcella in Percentuale Annua (% AUM)**: Tipica di banche, reti di promotori e alcuni consulenti. La commissione è una percentuale del patrimonio. Un vantaggio apparente è che il costo cresce con il valore del portafoglio, allineando (in teoria) gli interessi. Lo svantaggio è che su patrimoni importanti e su lunghi periodi, questo costo diventa una pesante zavorra.\n* **Parcella Fissa Annua (Fee-Only)**: Il modello adottato dai **consulenti finanziari autonomi (indipendenti)**. Si paga un importo fisso, slegato dai prodotti consigliati e dall'andamento del mercato. Il suo pregio principale è la **trasparenza** e l'**assenza di conflitti di interesse**.\n* **Orizzonte Temporale**: Il tempo è il fattore che amplifica l'impatto dei costi. Su 1-3 anni la differenza può sembrare minima, ma su 10, 20 o 30 anni diventa abissale.\n* **Rendimento Annuo Lordo Stimato**: La performance attesa del portafoglio *prima* di pagare la consulenza. È un'ipotesi cruciale: rendimenti più alti rendono i costi percentuali ancora più onerosi in termini assoluti.\n\n#### **Risultati della Simulazione (Cosa Stai Realmente Pagando)**\n\n* **Costo Totale**: La somma di tutte le commissioni pagate nell'arco dell'orizzonte temporale. Questo numero rivela l'esborso reale e spesso sorprendente del servizio.\n* **Patrimonio Finale Netto**: Il valore del tuo investimento alla fine del periodo, al netto dei costi. È la metrica più importante, perché rappresenta la ricchezza che hai effettivamente accumulato.\n* **Vantaggio Finale**: La differenza netta tra i due patrimoni finali. Ti dice esattamente quanti soldi in più avresti in tasca scegliendo il modello più efficiente.\n\n### **Parte 2: Analisi Approfondita dei Modelli di Costo**\n\n#### **Il Modello a Percentuale (% AUM): Pro e Contro**\n\nQuesto modello è il più diffuso nel settore bancario e delle reti di vendita. La commissione (es. 1.2% annuo) viene prelevata direttamente dal controvalore del portafoglio.\n\n* **Vantaggi (apparenti)**: Semplice da capire, non richiede un esborso diretto (il costo è \"invisibile\"), e sembra legare il compenso del consulente alla performance. Per patrimoni molto piccoli (es. < 50.000€), può risultare economicamente più accessibile di una parcella fissa.\n* **Svantaggi e Rischi**: \n    1.  **Costo crescente**: Se il tuo patrimonio cresce da 100.000€ a 300.000€, il costo triplica, senza che il lavoro del consulente sia necessariamente triplicato.\n    2.  **Conflitto di interessi**: Il consulente potrebbe essere incentivato a consigliare prodotti con retrocessioni (commissioni nascoste) più alte, anche se non sono i più efficienti per il cliente.\n    3.  **Erosione da interesse composto**: Anno dopo anno, la percentuale prelevata riduce la base capitale su cui si calcolano i rendimenti futuri, frenando la crescita in modo esponenziale.\n\n#### **Il Modello a Parcella Fissa (Fee-Only): Pro e Contro**\n\nQuesto modello è il pilastro della **consulenza finanziaria indipendente**, come definita dalla normativa europea (MIFID II). Il consulente è pagato unicamente dal cliente.\n\n* **Vantaggi**: \n    1.  **Trasparenza totale**: Sai esattamente quanto paghi, ogni anno. Il costo non è nascosto nel valore del portafoglio.\n    2.  **Assenza di conflitti di interesse**: Il consulente non guadagna dalla vendita di specifici prodotti. Il suo unico interesse è l'obiettivo del cliente, permettendogli di scegliere gli strumenti più efficienti sul mercato (es. ETF a basso costo).\n    3.  **Scalabilità**: Il costo non esplode al crescere del patrimonio. Una parcella di 3.000€ è la stessa sia su un capitale di 200.000€ che su uno di 800.000€, rendendola estremamente vantaggiosa per patrimoni medio-grandi.\n* **Svantaggi**: La parcella va pagata attivamente (non viene prelevata in automatico) e può sembrare un costo iniziale elevato, soprattutto per chi si approccia con capitali ridotti.\n\n### **Parte 3: Oltre il Costo - Cosa Definisce un Buon Consulente**\n\nIl costo è un fattore critico, ma non l'unico. Un consulente a basso costo che offre un servizio scadente è un pessimo affare. Quando valuti un professionista, considera anche:\n\n1.  **Indipendenza**: È iscritto all'Albo OCF come Consulente Finanziario Autonomo? Lavora per una società di consulenza finanziaria autonoma (SCA)? Questo è garanzia di assenza di conflitti di interesse.\n2.  **Processo e Pianificazione**: Il consulente parla solo di prodotti o parte dai tuoi obiettivi di vita (pianificazione finanziaria, previdenziale, successoria)? Un buon professionista offre un servizio olistico.\n3.  **Competenza e Filosofia**: Ha certificazioni riconosciute? La sua filosofia di investimento (es. gestione attiva vs passiva, diversificazione, controllo del rischio) è chiara e in linea con la tua?\n\n### **Conclusione: Prendi una Decisione Informata**\n\nUsa questo calcolatore non come un verdetto finale, ma come un punto di partenza per una discussione consapevole. Chiedi al tuo potenziale consulente di mostrarti un'analisi dei costi totali (TER dei fondi, commissioni di gestione, parcella) e confrontala con le simulazioni. Ricorda la famosa citazione di John Bogle, fondatore di Vanguard: **\"In investing, you get what you don't pay for\"** (Negli investimenti, ottieni ciò per cui non paghi). Contenere i costi è l'unica variabile che puoi controllare e che ha un impatto certo e matematico sul tuo successo finanziario a lungo termine.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Quanto costa in media un consulente finanziario?", "acceptedAnswer": { "@type": "Answer", "text": "Il costo di un consulente finanziario varia in base al modello di servizio. Con il modello a percentuale (AUM fee), il costo si aggira tipicamente tra lo 0.8% e l'1.5% annuo del patrimonio gestito. Con il modello a parcella fissa (fee-only), tipico dei consulenti indipendenti, il costo può variare da 1.500€ a oltre 10.000€ all'anno, a seconda della complessità del patrimonio e del servizio offerto. Questo calcolatore aiuta a confrontare l'impatto dei due modelli nel tempo." } }, { "@type": "Question", "name": "Quando conviene di più la parcella fissa (fee-only)?", "acceptedAnswer": { "@type": "Answer", "text": "La parcella fissa diventa quasi sempre più conveniente al crescere del patrimonio. Indicativamente, per patrimoni superiori a 100.000€ - 200.000€, il costo fisso risulta inferiore rispetto a una commissione in percentuale. Il vantaggio principale è la trasparenza e l'assenza di conflitti di interesse, poiché il consulente non è incentivato a vendere prodotti specifici." } }, { "@type": "Question", "name": "Cosa significa consulente finanziario indipendente?", "acceptedAnswer": { "@type": "Answer", "text": "Un consulente finanziario indipendente (o autonomo) è un professionista che, per legge, è remunerato esclusivamente a parcella dal proprio cliente (modello fee-only). Non riceve alcuna retrocessione o provvigione da banche o società prodotto, garantendo così un servizio privo di conflitti di interesse e finalizzato unicamente al raggiungimento degli obiettivi del cliente." } }, { "@type": "Question", "name": "I costi della consulenza finanziaria sono deducibili?", "acceptedAnswer": { "@type": "Answer", "text": "Per un investitore privato (persona fisica) in Italia, i costi per la consulenza finanziaria generalmente non sono deducibili o detraibili ai fini IRPEF. La normativa fiscale può essere complessa e soggetta a variazioni, pertanto è sempre consigliabile consultare un commercialista o un esperto fiscale per una valutazione specifica." } } ] }
};

// --- Componenti di Utility (Icon, Tooltip, Schema, Content Renderer) ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                if (trimmedBlock.match(/^\d\.\s/)) return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />)}</ol>;
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Componente Principale del Calcolatore ---
const CostoConsulenteFinanziarioCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        patrimonio_iniziale: 150000,
        costo_percentuale_annua: 1.2,
        costo_parcella_fissa_annua: 2000,
        anni_investimento: 20,
        rendimento_annuo_lordo: 5,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = useCallback((id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    }, []);

    const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const { patrimonio_iniziale, costo_percentuale_annua, costo_parcella_fissa_annua, anni_investimento, rendimento_annuo_lordo } = states;
        const R = 1 + rendimento_annuo_lordo / 100;
        const C_perc = costo_percentuale_annua / 100;

        let patrimonio_perc = patrimonio_iniziale;
        let costo_totale_percentuale = 0;
        let patrimonio_parc = patrimonio_iniziale;
        let costo_totale_parcella = 0;

        for (let i = 0; i < anni_investimento; i++) {
            const costo_annuo_perc = patrimonio_perc * C_perc;
            costo_totale_percentuale += costo_annuo_perc;
            patrimonio_perc = (patrimonio_perc * R) - costo_annuo_perc;

            costo_totale_parcella += costo_parcella_fissa_annua;
            patrimonio_parc = (patrimonio_parc * R) - costo_parcella_fissa_annua;
        }

        return {
            costo_totale_percentuale,
            costo_totale_parcella,
            patrimonio_finale_percentuale: Math.max(0, patrimonio_perc),
            patrimonio_finale_parcella: Math.max(0, patrimonio_parc),
            vantaggio_parcella_fissa: Math.max(0, patrimonio_parc) - Math.max(0, patrimonio_perc),
        };
    }, [states]);

    const chartData = useMemo(() => ([
        { name: 'Costo Totale', 'Parcella Fissa': calculatedOutputs.costo_totale_parcella, 'Percentuale': calculatedOutputs.costo_totale_percentuale },
        { name: 'Patrimonio Finale', 'Parcella Fissa': calculatedOutputs.patrimonio_finale_parcella, 'Percentuale': calculatedOutputs.patrimonio_finale_percentuale },
    ]), [calculatedOutputs]);

    const formulaUsata = "ValoreFinale = ValoreIniziale * (1 + RendimentoLordo)^Anni - Σ CostiAnnuali";
    
    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2, windowWidth: 1200 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) {
            console.error("PDF Export failed:", e);
            alert("Errore durante l'esportazione in PDF.");
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const results = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...results].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch {
            alert("Impossibile salvare il risultato.");
        }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Confronta l'impatto dei costi a lungo termine e scopri quale modello di consulenza è più vantaggioso per te.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {inputs.map(input => (
                                <div key={input.id}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id={input.id} aria-label={input.label}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2 text-right"
                                            type="number" min={input.min} max={input.max} step={input.step} value={states[input.id]}
                                            onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className=" -lg -md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Simulazione</h2>
                         <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questa è una simulazione a scopo informativo basata su un rendimento costante. I risultati non costituiscono una previsione e non sostituiscono una consulenza professionale.
                        </div>
                        <div className="space-y-4">
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'vantaggio_parcella_fissa' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'vantaggio_parcella_fissa' ? 'text-green-700' : 'text-gray-800'}`}>
                                        {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                     <div className=" -lg -md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Confronto Visivo dei Risultati</h3>
                         <div className="h-80 w-full">
                           <DynamicBarChart data={chartData} />
                         </div>
                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full bg-red-600 text-white rounded-md px-3 py-2 text-sm hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                         <div className="mt-4">
                             <h3 className="font-semibold text-gray-700 text-sm">Logica di Calcolo Utilizzata</h3>
                             <p className="text-xs text-gray-500 mt-1 p-2 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                         </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Comprensione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.alboocf.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Albo Unico dei Consulenti Finanziari (OCF)</a></li>
                            <li><a href="https://www.esma.europa.eu/policy-rules/investor-protection-and-intermediaries/mifid-ii-and-mifir" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Direttiva Europea MiFID II</a></li>
                             <li><a href="https://www.consob.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">CONSOB - Commissione Nazionale per le Società e la Borsa</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CostoConsulenteFinanziarioCalculator;