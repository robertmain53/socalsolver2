'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

// --- Placeholder per il grafico durante il caricamento ---
const ChartLoading = () => <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg"><p className="text-gray-500">Caricamento grafico...</p></div>;

// --- Caricamento dinamico del componente grafico ---
const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
  const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend, Cell } = mod;
  
  const CustomBarChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
        <XAxis type="number" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
        <YAxis type="category" dataKey="name" width={80} />
        <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)} />
        <Legend />
        <Bar dataKey="Costo" name="Costo Totale Stimato">
           {data.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  return CustomBarChart;
}), {
  ssr: false,
  loading: () => <ChartLoading />,
});


// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-indigo-500 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Componente per l'iniezione dello Schema SEO ---
const SchemaInjector = ({ schema }: { schema: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('|')) {
                    const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
                    const headers = rows[0];
                    const body = rows.slice(2);
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map((header, i) => <th key={i} className="p-2 border text-left font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(header) }} />)}</tr>
                                </thead>
                                <tbody>
                                    {body.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>)}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// --- Dati di Configurazione del Calcolatore ---
const calculatorData = {
  "slug": "leasing-vs-noleggio-vs-acquisto",
  "category": "Auto e Trasporti",
  "title": "Calcolatore Leasing vs. Noleggio a Lungo Termine vs. Acquisto",
  "lang": "it",
  "inputs": [
    {"id": "prezzo_veicolo", "label": "Prezzo di listino del veicolo (IVA incl.)", "type": "number", "unit": "€", "min": 1000, "step": 500, "tooltip": "Il costo totale del veicolo, comprensivo di IVA e messa su strada. Questo è il punto di partenza per il calcolo dell'acquisto e del leasing."},
    {"id": "durata_confronto", "label": "Durata del confronto", "type": "number", "unit": "mesi", "min": 12, "step": 12, "tooltip": "Il periodo di tempo (in mesi) su cui vuoi basare il confronto dei costi totali. Tipicamente 36, 48 o 60 mesi."},
    {"id": "valore_rivendita", "label": "Valore residuo stimato del veicolo", "type": "number", "unit": "€", "min": 0, "step": 500, "tooltip": "Il valore di mercato che prevedi l'auto avrà alla fine del periodo di confronto. Questo importo viene sottratto dal costo totale dell'acquisto."},
    {"id": "anticipo", "label": "Anticipo / Maxicanone iniziale", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "L'importo versato all'inizio del contratto per tutte e tre le opzioni (se applicabile). Inserisci l'importo medio se diverso."},
    {"id": "canone_nlt_mensile", "label": "Canone mensile (Noleggio a L.T.)", "type": "number", "unit": "€", "min": 0, "step": 10, "tooltip": "Il canone mensile 'tutto incluso' per il Noleggio a Lungo Termine (assicurazione, bollo, manutenzione)."},
    {"id": "canone_leasing_mensile", "label": "Canone mensile (Leasing)", "type": "number", "unit": "€", "min": 0, "step": 10, "tooltip": "Il canone mensile per il leasing finanziario. Generalmente non include i costi operativi come bollo e assicurazione."},
    {"id": "costo_assicurazione_annuo", "label": "Costo assicurazione annua (RCA + F/I/K)", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Costo annuale totale per le coperture assicurative. Non necessario per il NLT, dove è già incluso nel canone."},
    {"id": "costo_bollo_manutenzione_annuo", "label": "Costo Bollo + Manutenzione annua", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Somma del bollo auto annuale e dei costi stimati per la manutenzione ordinaria e straordinaria (tagliandi, gomme, etc.)."},
    {"id": "is_business_user", "label": "Sei un'azienda o un professionista? (Attiva calcolo fiscale)", "type": "boolean", "tooltip": "Seleziona questa opzione per visualizzare i campi relativi alla fiscalità e calcolare i benefici derivanti dalla deducibilità dei costi."},
    {"id": "aliquota_fiscale", "label": "Aliquota fiscale marginale (IRPEF/IRES)", "type": "number", "unit": "%", "min": 0, "max": 50, "step": 1, "condition": "is_business_user == true", "tooltip": "La tua aliquota fiscale più alta. Serve per calcolare il risparmio fiscale effettivo. Es: 24% per IRES, oppure lo scaglione IRPEF più alto."},
    {"id": "percentuale_deducibilita", "label": "Percentuale di deducibilità del costo", "type": "number", "unit": "%", "min": 0, "max": 100, "step": 10, "condition": "is_business_user == true", "tooltip": "Percentuale del costo che puoi scaricare. Esempi: 20% per professionisti, 70% per agenti di commercio, 100% per uso strumentale esclusivo."}
  ],
  "outputs": [
    {"id": "costo_totale_nlt", "label": "Costo Totale Noleggio", "unit": "€"},
    {"id": "costo_totale_leasing", "label": "Costo Totale Leasing", "unit": "€"},
    {"id": "costo_totale_acquisto", "label": "Costo Totale Acquisto", "unit": "€"}
  ],
  "content": "### **Guida Definitiva: Acquisto, Leasing o Noleggio a Lungo Termine?**\n\nLa scelta della modalità di possesso di un veicolo è una decisione strategica fondamentale, sia per i privati che per le aziende. Ognuna delle tre opzioni principali – Acquisto, Leasing e Noleggio a Lungo Termine (NLT) – presenta vantaggi e svantaggi specifici in termini di costi, flessibilità, gestione e implicazioni fiscali. Questo strumento è progettato per offrirti una stima chiara e personalizzata del costo totale di ciascuna opzione, aiutandoti a prendere una decisione informata.\n\n### **Come Interpretare i Campi del Calcolatore**\n\nPer ottenere una stima accurata, è essenziale comprendere il ruolo di ogni parametro:\n\n* **Dati del Veicolo**: Il **prezzo di listino** e il **valore residuo stimato** definiscono il costo di ammortamento, ovvero la perdita di valore del bene nel tempo, che rappresenta la spesa maggiore nell'opzione di acquisto.\n* **Parametri Finanziari**: L'**anticipo** e i **canoni mensili** (per NLT e Leasing) sono i flussi di cassa diretti. La **durata del confronto** è cruciale per standardizzare l'analisi su un orizzonte temporale comune.\n* **Costi Operativi**: L'**assicurazione** e i costi di **bollo e manutenzione** sono spese vive che nell'acquisto e nel leasing sono a carico dell'utilizzatore, mentre nel NLT sono consolidate nel canone, offrendo prevedibilità.\n* **Fiscalità (per Aziende e P.IVA)**: Attivando questa sezione, il calcolatore stima il **risparmio fiscale**. La deducibilità dei costi (limitata da normative specifiche come il tetto di spesa e la percentuale di inerenza) riduce l'imponibile, generando un beneficio netto che può alterare significativamente la convenienza di un'opzione rispetto a un'altra.\n\n### **Analisi Dettagliata delle Opzioni**\n\n#### **1. Acquisto: Proprietà e Libertà**\n\n* **Come funziona**: Diventi proprietario del veicolo pagandolo interamente o tramite finanziamento. Hai la massima libertà su chilometraggio e personalizzazioni.\n* **Costi**: L'esborso iniziale è significativo. Tutti i costi operativi (bollo, assicurazione, manutenzione ordinaria e straordinaria) e il rischio di svalutazione sono a tuo carico.\n* **Vantaggi Fiscali**: Le aziende possono ammortizzare il costo del veicolo (entro un limite di €18.075,99) in 4 anni e dedurre le spese operative secondo la percentuale di inerenza.\n* **Ideale per**: Chi percorre molti km, desidera tenere l'auto per un lungo periodo (> 5-6 anni) o vuole la piena proprietà del bene.\n\n#### **2. Leasing Finanziario: Un Ponte verso la Proprietà**\n\n* **Come funziona**: Una società finanziaria acquista il veicolo per te e te lo concede in uso per un periodo definito (es. 24-60 mesi) a fronte di un canone mensile e un anticipo (maxicanone). Alla fine, puoi scegliere di riscattare il bene pagando una rata finale, restituirlo o sostituirlo.\n* **Costi**: I canoni sono generalmente più bassi rispetto a una rata di finanziamento, ma i costi operativi (bollo, assicurazione, manutenzione) sono quasi sempre a carico dell'utilizzatore.\n* **Vantaggi Fiscali**: Aziende e professionisti possono dedurre i canoni di leasing (sia la quota capitale che quella interessi) rispettando i limiti normativi (stesso tetto di €18.075,99 distribuito sulla durata del contratto).\n* **Ideale per**: Aziende e P.IVA che necessitano di un veicolo nuovo senza immobilizzare capitale e desiderano mantenere l'opzione di acquisto finale.\n\n#### **3. Noleggio a Lungo Termine (NLT): La Scelta della Tranquillità**\n\n* **Come funziona**: Paghi un canone mensile fisso che include tutti i servizi: veicolo, assicurazione completa (RCA, Kasko), bollo, manutenzione ordinaria e straordinaria, e spesso anche il cambio gomme.\n* **Costi**: L'unico costo è il canone mensile (più un eventuale anticipo). Nessuna spesa imprevista e nessun rischio legato alla svalutazione o alla rivendita del veicolo.\n* **Vantaggi Fiscali**: Il canone di noleggio è deducibile secondo le stesse percentuali di inerenza dell'acquisto, con un limite specifico per la quota di noleggio puro (attualmente €3.615,20 annui).\n* **Ideale per**: Aziende, professionisti e sempre più privati che cercano la massima prevedibilità dei costi, non vogliono gestire le scadenze e le incombenze burocratiche e preferiscono cambiare auto frequentemente (ogni 3-4 anni).\n\n### **Tabella Comparativa Fiscale (Semplificata)**\n\n| Caratteristica | Acquisto | Leasing | Noleggio a Lungo Termine |\n| :--- | :--- | :--- | :--- |\n| **Deducibilità Costo** | Ammortamento su max €18.076 | Canoni su valore max €18.076 | Canoni noleggio su max €3.615/anno |\n| **Deducibilità Servizi** | Deducibili (es. carburante, manut.) | Deducibili | Inclusi nel canone e deducibili |\n| **IVA** | Detraibile (solitamente al 40%) | Detraibile (solitamente al 40%) | Detraibile (solitamente al 40%) |\n| **Gestione** | A carico del proprietario | A carico dell'utilizzatore | A carico della società di noleggio |\n\n**Disclaimer**: La normativa fiscale è complessa e soggetta a variazioni. I calcoli forniti sono una stima e non sostituiscono il parere di un consulente fiscale qualificato.",
  "seoSchema": {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Cosa conviene di più tra acquisto, leasing e noleggio a lungo termine?", "acceptedAnswer": {"@type": "Answer", "text": "Non esiste una risposta unica. L'acquisto conviene a chi tiene l'auto a lungo e fa tanti km. Il leasing è ideale per aziende che vogliono l'opzione di riscatto. Il noleggio a lungo termine è perfetto per chi cerca costi fissi, zero pensieri e un'auto sempre nuova, sia per aziende che per privati."}}, {"@type": "Question", "name": "Quali sono i vantaggi fiscali del noleggio a lungo termine per una Partita IVA?", "acceptedAnswer": {"@type": "Answer", "text": "Per una Partita IVA (libero professionista), il noleggio a lungo termine permette di dedurre il 20% del costo del canone, con un limite massimo di deducibilità di 3.615,20 euro all'anno. Anche l'IVA è detraibile al 40%. Questo rende il NLT una soluzione fiscalmente vantaggiosa per ridurre l'imponibile."}}, {"@type": "Question", "name": "Cosa include il canone di noleggio a lungo termine?", "acceptedAnswer": {"@type": "Answer", "text": "Il canone 'all-inclusive' del NLT copre tipicamente: l'utilizzo del veicolo, la tassa di proprietà (bollo), l'assicurazione completa (RCA, furto/incendio, Kasko), la manutenzione ordinaria (tagliandi) e straordinaria (guasti), e spesso il soccorso stradale e la gestione dei sinistri. Alcuni contratti includono anche il cambio pneumatici."}}, {"@type": "Question", "name": "Alla fine del leasing, cosa succede?", "acceptedAnswer": {"@type": "Answer", "text": "Alla scadenza di un contratto di leasing finanziario, l'utilizzatore ha tre possibilità: 1) Riscattare il veicolo pagando la maxi-rata finale concordata e diventarne proprietario. 2) Restituire il veicolo alla società di leasing. 3) Sostituire l'auto con un nuovo modello, stipulando un nuovo contratto di leasing."}}]}
};

const LeasingVsNoleggioVsAcquisto: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        prezzo_veicolo: 35000,
        durata_confronto: 48,
        valore_rivendita: 15000,
        anticipo: 4000,
        canone_nlt_mensile: 550,
        canone_leasing_mensile: 450,
        costo_assicurazione_annuo: 1500,
        costo_bollo_manutenzione_annuo: 800,
        is_business_user: true,
        aliquota_fiscale: 24,
        percentuale_deducibilita: 20,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const {
            prezzo_veicolo, durata_confronto, valore_rivendita, anticipo,
            canone_nlt_mensile, canone_leasing_mensile,
            costo_assicurazione_annuo, costo_bollo_manutenzione_annuo,
            is_business_user, aliquota_fiscale, percentuale_deducibilita
        } = states;

        const costi_operativi_totali = ((Number(costo_assicurazione_annuo) || 0) + (Number(costo_bollo_manutenzione_annuo) || 0)) * ((Number(durata_confronto) || 0) / 12);
        
        // Acquisto
        const costo_lordo_acquisto = (Number(prezzo_veicolo) || 0) - (Number(valore_rivendita) || 0) + costi_operativi_totali;
        const limite_deducibilita_costo = 18075.99;
        const base_deducibile_acquisto = Math.min(Number(prezzo_veicolo) || 0, limite_deducibilita_costo) * ((Number(percentuale_deducibilita) || 0) / 100);
        const beneficio_fiscale_acquisto = is_business_user ? (base_deducibile_acquisto * (Math.min(Number(durata_confronto), 48) / 48)) * ((Number(aliquota_fiscale) || 0) / 100) : 0;
        const costo_totale_acquisto = costo_lordo_acquisto - beneficio_fiscale_acquisto;
        
        // Leasing
        const costo_lordo_leasing = (Number(anticipo) || 0) + ((Number(canone_leasing_mensile) || 0) * (Number(durata_confronto) || 0)) + costi_operativi_totali;
        const costo_totale_leasing_canoni = (Number(anticipo) || 0) + ((Number(canone_leasing_mensile) || 0) * (Number(durata_confronto) || 0));
        const beneficio_fiscale_leasing = is_business_user ? (costo_totale_leasing_canoni * ((Number(percentuale_deducibilita) || 0) / 100)) * ((Number(aliquota_fiscale) || 0) / 100) : 0;
        const costo_totale_leasing = costo_lordo_leasing - beneficio_fiscale_leasing;

        // NLT
        const costo_lordo_nlt = (Number(anticipo) || 0) + ((Number(canone_nlt_mensile) || 0) * (Number(durata_confronto) || 0));
        const limite_deducibilita_nlt_annuo = 3615.20;
        const costo_annuo_nlt = ((Number(anticipo) || 0) / ((Number(durata_confronto) || 12) / 12)) + ((Number(canone_nlt_mensile) || 0) * 12);
        const base_deducibile_nlt = Math.min(costo_annuo_nlt, limite_deducibilita_nlt_annuo) * ((Number(percentuale_deducibilita) || 0) / 100);
        const beneficio_fiscale_nlt = is_business_user ? (base_deducibile_nlt * ((Number(durata_confronto) || 0) / 12)) * ((Number(aliquota_fiscale) || 0) / 100) : 0;
        const costo_totale_nlt = costo_lordo_nlt - beneficio_fiscale_nlt;

        return { costo_totale_acquisto, costo_totale_leasing, costo_totale_nlt };
    }, [states]);

    const chartData = [
        { name: 'Noleggio', Costo: calculatedOutputs.costo_totale_nlt || 0, color: '#38bdf8' },
        { name: 'Leasing', Costo: calculatedOutputs.costo_totale_leasing || 0, color: '#4ade80' },
        { name: 'Acquisto', Costo: calculatedOutputs.costo_totale_acquisto || 0, color: '#fbbf24' }
    ].sort((a,b) => a.Costo - b.Costo);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}-simulazione.pdf`);
        } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <main className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Confronta i costi totali delle tre principali opzioni per avere un'auto e scopri la soluzione più vantaggiosa per te.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;
                                
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-indigo-50 border border-indigo-200">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-800 flex-grow" htmlFor={input.id}>{input.label}</label>
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="cursor-help"><InfoIcon /></span></Tooltip>}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-8  -lg -md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati del Confronto</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-3">
                                {outputs.sort((a, b) => (calculatedOutputs as any)[a.id] - (calculatedOutputs as any)[b.id]).map((output, index) => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${index === 0 ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-base font-medium text-gray-700 flex items-center">
                                            {output.label}
                                            {index === 0 && <span className="ml-2 text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">PIÙ CONVENIENTE</span>}
                                        </div>
                                        <div className={`text-2xl font-bold ${index === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualizzazione Costi</h3>
                                <div className="h-48 w-full p-2 rounded-lg">
                                    {isClient && <DynamicBarChart data={chartData} />}
                                </div>
                            </div>
                        </div>
                         <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mt-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale o finanziaria. I calcoli fiscali sono semplificati.
                        </div>
                    </div>

                </main>
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Dati</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Scelta</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Art. 164 del TUIR</a> - Limiti di deduzione delle spese per i veicoli.</li>
                            <li><a href="https://www.agenziaentrate.gov.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate</a> - Per circolari e approfondimenti ufficiali.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default LeasingVsNoleggioVsAcquisto;