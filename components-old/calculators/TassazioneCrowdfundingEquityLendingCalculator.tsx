'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

export const meta = {
  title: "Calcolatore Tasse Crowdfunding | Equity & Lending 2025",
  description: "Simula la tassazione dei tuoi investimenti in Equity e Lending Crowdfunding. Calcola la deduzione del 30% e l'imposta del 26% su interessi e plusvalenze."
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

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema = () => (
  <script type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Come vengono tassati gli interessi del Lending Crowdfunding?", "acceptedAnswer": { "@type": "Answer", "text": "Le piattaforme italiane autorizzate agiscono come sostituti d'imposta, applicando una ritenuta fiscale definitiva del 26% sugli interessi. L'investitore riceve l'importo netto e non ha obblighi di dichiarazione." } },
          { "@type": "Question", "name": "Qual è il vantaggio fiscale dell'Equity Crowdfunding?", "acceptedAnswer": { "@type": "Answer", "text": "Per investimenti in startup e PMI innovative, è prevista una deduzione IRPEF del 30% dell'importo investito. Per beneficiare dell'agevolazione è necessario mantenere le quote per almeno 3 anni." } },
          { "@type": "Question", "name": "Devo dichiarare i miei investimenti in crowdfunding?", "acceptedAnswer": { "@type": "Answer", "text": "Per il Lending tramite piattaforme italiane che agiscono come sostituto d'imposta, non è necessario. Per l'Equity, la plusvalenza realizzata dalla vendita delle quote va generalmente dichiarata nel Quadro RT del Modello Redditi, a meno che non si operi in regime di risparmio amministrato." } }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock.startsWith('Caratteristica**')) {
                    const rows = trimmedBlock.split('\n');
                    const headers = rows[0].split('**').filter(h => h);
                    const bodyRows = rows.slice(1).map(row => row.split('**').filter(c => c));
                    return (
                         <div key={index} className="overflow-x-auto my-4 rounded-lg border">
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="bg-gray-50"><tr >{headers.map((header, hIndex) => <th key={hIndex} className="p-2 border-b text-left font-semibold text-gray-600">{header}</th>)}</tr></thead>
                                <tbody>{bodyRows.map((row, rIndex) => (<tr key={rIndex} className="odd:bg-white even:bg-gray-50/50">{row.map((cell, cIndex) => <td key={cIndex} className="p-2 border-t" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>))}</tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock) return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "tassazione-crowdfunding-equity-lending", "category": "Risparmio e Investimenti", "title": "Calcolatore Tassazione Crowdfunding (Equity vs. Lending)", "lang": "it",
  "inputs": [
    { "id": "crowdfundingType", "label": "Tipo di Crowdfunding", "type": "select" as const, "options": [ { "value": "lending", "label": "Lending Crowdfunding (Prestito)" }, { "value": "equity", "label": "Equity Crowdfunding (Investimento)" } ], "tooltip": "Scegli il modello di crowdfunding per visualizzare i campi e i calcoli corretti. La tassazione è radicalmente diversa tra i due." },
    { "id": "capitalePrestato", "label": "Capitale Investito (Prestato)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "crowdfundingType == 'lending'", "tooltip": "Inserisci l'importo totale che hai prestato tramite la piattaforma di P2P Lending." },
    { "id": "tassoInteresseAnnuo", "label": "Tasso di Interesse Annuo Lordo", "type": "number" as const, "unit": "%", "min": 0, "step": 0.1, "condition": "crowdfundingType == 'lending'", "tooltip": "Indica il tasso di interesse lordo annuale promesso dal progetto." },
    { "id": "isSostitutoImposta", "label": "La piattaforma agisce da Sostituto d'Imposta?", "type": "boolean" as const, "condition": "crowdfundingType == 'lending'", "tooltip": "Spunta questa casella se la piattaforma (come la maggior parte di quelle italiane) trattiene direttamente le tasse (26%) per te. In caso contrario, dovrai dichiarare i redditi." },
    { "id": "investimentoIniziale", "label": "Investimento Iniziale", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "crowdfundingType == 'equity'", "tooltip": "Inserisci l'importo totale investito per l'acquisto delle quote della società." },
    { "id": "isStartupInnovativa", "label": "L'investimento è in una Startup/PMI Innovativa?", "type": "boolean" as const, "condition": "crowdfundingType == 'equity'", "tooltip": "Seleziona se la società target rientra in questa categoria. Questo dà diritto a una deduzione fiscale del 30% sull'importo investito." },
    { "id": "irpefLordaAnnua", "label": "Tua IRPEF Lorda Annua", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "isStartupInnovativa == true", "tooltip": "Inserisci la tua imposta IRPEF lorda annuale (dal Modello Redditi o CU). La deduzione fiscale non può superare l'imposta dovuta." },
    { "id": "exitAmmontare", "label": "Importo Incassato dalla Vendita (Exit)", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "condition": "crowdfundingType == 'equity'", "tooltip": "Indica l'importo totale ricevuto dalla vendita delle tue quote. Serve a calcolare la plusvalenza." }
  ],
  "outputs": [
    { "id": "interessiLordiAnnui", "label": "Interessi Lordi Annui", "unit": "€", "condition": "crowdfundingType == 'lending'" }, { "id": "impostaAnnua", "label": "Imposta Annua Trattenuta (26%)", "unit": "€", "condition": "crowdfundingType == 'lending'" }, { "id": "interessiNettiAnnui", "label": "Interessi Netti Annui", "unit": "€", "condition": "crowdfundingType == 'lending'" }, { "id": "rendimentoNettoAnnuo", "label": "Rendimento Netto Annuo", "unit": "%", "condition": "crowdfundingType == 'lending'" }, { "id": "deduzioneFiscaleSpettante", "label": "Deduzione Fiscale Teorica (30%)", "unit": "€", "condition": "crowdfundingType == 'equity'" }, { "id": "risparmioFiscaleEffettivo", "label": "Risparmio Fiscale Effettivo (1° anno)", "unit": "€", "condition": "crowdfundingType == 'equity'" }, { "id": "plusvalenzaRealizzata", "label": "Plusvalenza Realizzata (Guadagno Lordo)", "unit": "€", "condition": "crowdfundingType == 'equity'" }, { "id": "impostaSuPlusvalenza", "label": "Imposta su Plusvalenza (26%)", "unit": "€", "condition": "crowdfundingType == 'equity'" }, { "id": "guadagnoNettoComplessivo", "label": "Guadagno Netto Totale dell'Operazione", "unit": "€", "condition": "crowdfundingType == 'equity'" }
  ],
  "content": "### **Guida Completa alla Tassazione del Crowdfunding in Italia**\n\n**Equity vs. Lending: Come Funzionano le Imposte e Come Calcolare i Rendimenti Netti**\n\nIl crowdfunding è uno strumento di investimento sempre più popolare, ma la sua fiscalità può generare confusione. Le regole, infatti, cambiano radicalmente a seconda del modello utilizzato: **Lending Crowdfunding** (prestito) o **Equity Crowdfunding** (investimento in capitale di rischio).\n\nQuesto strumento è progettato per fare chiarezza, permettendoti di simulare la tassazione per entrambi gli scenari e di comprendere gli obblighi e le opportunità fiscali. Ricorda che questa è una guida informativa e **non sostituisce la consulenza di un commercialista**, specialmente per la gestione di investimenti su piattaforme estere.\n\n### **Parte 1: Lending Crowdfunding (o Social Lending)**\n\nNel Lending Crowdfunding, presti il tuo denaro a privati o aziende attraverso una piattaforma, ricevendo in cambio un interesse. Fiscalmente, questi interessi sono considerati **redditi di capitale**.\n\n#### **La Tassazione Semplificata: Il Ruolo del Sostituto d'Imposta**\n\nPer gli investitori che operano su **piattaforme autorizzate in Italia**, la tassazione è estremamente semplice. Dal 2018, queste piattaforme agiscono come **sostituti d'imposta**:\n\n1.  Calcolano gli interessi lordi che ti spettano.\n2.  **Trattengono una ritenuta a titolo d'imposta del 26%**.\n3.  Ti accreditano direttamente l'importo netto.\n\n**Il vantaggio?** L'imposta è definitiva e assolta alla fonte. L'investitore **non deve dichiarare nulla** nel proprio modello 730 o Modello Redditi. L'obbligo fiscale è interamente gestito dalla piattaforma.\n\n#### **E le Piattaforme Estere?**\n\nSe investi tramite piattaforme estere che non agiscono da sostituto d'imposta in Italia, riceverai gli interessi al lordo. In questo caso, **sei tu responsabile** della dichiarazione di questi redditi nel Modello Redditi Persone Fisiche (solitamente nel quadro RM per l'imposta sostitutiva del 26% e nel quadro RW per il monitoraggio degli investimenti esteri).\n\n### **Parte 2: Equity Crowdfunding**\n\nNell'Equity Crowdfunding, non presti denaro, ma acquisti quote di una società (solitamente startup o PMI), diventandone socio. Il tuo guadagno non deriva da interessi, ma da un futuro aumento di valore delle quote.\n\nLa fiscalità dell'Equity Crowdfunding è caratterizzata da un **doppio binario**: un forte incentivo fiscale all'ingresso e una tassazione standard all'uscita.\n\n#### **Vantaggio Fiscale n.1: La Deduzione del 30% all'Ingresso**\n\nSe investi in **startup o PMI innovative** iscritte nell'apposita sezione del Registro delle Imprese, lo Stato ti riconosce un'importante agevolazione fiscale:\n\n* **Deduzione IRPEF del 30%**: Puoi sottrarre dalle tue imposte lorde (IRPEF) il 30% dell'importo che hai investito.\n* **Limiti**: L'investimento massimo su cui calcolare la deduzione è di 1 milione di euro all'anno.\n* **Capienza Fiscale**: La deduzione non può superare l'IRPEF lorda che dovresti pagare in un anno. L'eventuale eccedenza può essere portata in deduzione negli anni successivi, ma non oltre il terzo.\n* **Holding Period**: Per non perdere il beneficio, devi **mantenere l'investimento per almeno 3 anni**.\n\n#### **La Tassazione al 26% all'Uscita (Exit)**\n\nLe tasse si pagano solo quando realizzi un guadagno, ovvero quando vendi le tue quote (exit) a un prezzo superiore a quello di acquisto. Questo guadagno è una **plusvalenza** (o *capital gain*).\n\n* `Plusvalenza = Prezzo di Vendita - Prezzo di Acquisto`\n* Su questa plusvalenza si applica un'**imposta sostitutiva fissa del 26%**.\n\nEventuali **dividendi** distribuiti dalla società sono anch'essi tassati con una ritenuta del 26%.\n\n### **Tabella di Confronto: Lending vs. Equity**\n\nCaratteristica**Lending Crowdfunding**Equity Crowdfunding\n**Natura del Reddito**Interessi (Redditi di Capitale)Plusvalenza o Dividendi (Redditi Diversi/di Capitale)\n**Aliquota Fiscale**26% sugli interessi lordi26% sulla plusvalenza (o sui dividendi)\n**Momento della Tassazione**Periodicamente, alla maturazione degli interessi.Solo al momento della vendita delle quote (exit).\n**Incentivi Fiscali**Nessuno specifico**Deduzione IRPEF del 30%** sull'investimento iniziale (per startup/PMI innovative).\n**Obblighi Dichiarativi**Nessuno (se la piattaforma è sostituto d'imposta).La plusvalenza va dichiarata nel Quadro RT del Modello Redditi (se non si opera in regime amministrato)."
};


const TassazioneCrowdfundingEquityLendingCalculator: React.FC = () => {
    const { slug, title, inputs, content, outputs } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        crowdfundingType: "lending",
        capitalePrestato: 10000, tassoInteresseAnnuo: 7, isSostitutoImposta: true,
        investimentoIniziale: 5000, isStartupInnovativa: true, irpefLordaAnnua: 8000, exitAmmontare: 15000,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);
    
    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => {
        const currentType = states.crowdfundingType;
        setStates({...initialStates, crowdfundingType: currentType});
    };
    
    const calculatedOutputs = useMemo(() => {
        const { crowdfundingType, capitalePrestato, tassoInteresseAnnuo, isSostitutoImposta, investimentoIniziale, isStartupInnovativa, irpefLordaAnnua, exitAmmontare } = states;
        
        if (crowdfundingType === 'lending') {
            const interessiLordiAnnui = capitalePrestato * (tassoInteresseAnnuo / 100);
            const impostaAnnua = isSostitutoImposta ? interessiLordiAnnui * 0.26 : 0;
            const interessiNettiAnnui = interessiLordiAnnui - impostaAnnua;
            const rendimentoNettoAnnuo = capitalePrestato > 0 ? (interessiNettiAnnui / capitalePrestato) * 100 : 0;
            return { interessiLordiAnnui, impostaAnnua, interessiNettiAnnui, rendimentoNettoAnnuo };
        } else { // Equity
            const deduzioneFiscaleSpettante = isStartupInnovativa ? investimentoIniziale * 0.30 : 0;
            const risparmioFiscaleEffettivo = isStartupInnovativa ? Math.min(deduzioneFiscaleSpettante, irpefLordaAnnua) : 0;
            const plusvalenzaRealizzata = exitAmmontare - investimentoIniziale;
            const impostaSuPlusvalenza = plusvalenzaRealizzata > 0 ? plusvalenzaRealizzata * 0.26 : 0;
            const guadagnoNettoDaExit = plusvalenzaRealizzata - impostaSuPlusvalenza;
            const guadagnoNettoComplessivo = guadagnoNettoDaExit + risparmioFiscaleEffettivo;
            return { deduzioneFiscaleSpettante, risparmioFiscaleEffettivo, plusvalenzaRealizzata, impostaSuPlusvalenza, guadagnoNettoComplessivo };
        }
    }, [states]);

    const lendingChartData = [ { name: 'Netto', value: calculatedOutputs.interessiNettiAnnui || 0 }, { name: 'Tasse', value: calculatedOutputs.impostaAnnua || 0 } ];
    const equityChartData = [ { name: "Ripartizione Exit", "Investimento Iniziale": states.investimentoIniziale, "Guadagno Netto": Math.max(0, (calculatedOutputs.plusvalenzaRealizzata || 0) - (calculatedOutputs.impostaSuPlusvalenza || 0)), "Tasse su Guadagno": calculatedOutputs.impostaSuPlusvalenza || 0 } ];
    const COLORS = ['#22c55e', '#ef4444'];

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}-${states.crowdfundingType}.pdf`);
        } catch (e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug, states.crowdfundingType]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => `${(value || 0).toFixed(2)}%`;

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/80 font-sans">
                <main className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4 text-base">Simula il rendimento netto e le imposte per i tuoi investimenti in crowdfunding.</p>
                        
                        <div className="mb-6">
                           <div className="flex w-full p-1 bg-gray-200 rounded-lg">
                                {calculatorData.inputs[0].options?.map(opt => (
                                    <button key={opt.value} onClick={() => handleStateChange('crowdfundingType', opt.value)} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors ${states.crowdfundingType === opt.value ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {states.crowdfundingType === 'lending' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 p-4 rounded-lg border bg-slate-50">
                                    {inputs.filter(i => i.condition === "crowdfundingType == 'lending'").map(input => (
                                         <div key={input.id}>
                                             {input.type !== 'boolean' && <>
                                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                                <div className="relative"><input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"/>{input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}</div>
                                             </>}
                                             {input.type === 'boolean' && <div className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border self-center mt-4"> <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} /><label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label></div>}
                                         </div>
                                    ))}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultato Annuale (Lending)</h2>
                                    <div className="space-y-2">
                                        {outputs.filter(o => o.condition === "crowdfundingType == 'lending'").map(output => (
                                             <div key={output.id} className={`flex items-baseline justify-between p-3 rounded-lg ${output.id === 'interessiNettiAnnui' ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                                                 <div className="text-sm font-medium text-gray-700">{output.label}</div>
                                                 <div className={`text-lg font-bold ${output.id === 'interessiNettiAnnui' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                                     <span>{isClient ? (output.unit === '%' ? formatPercentage((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}</span>
                                                 </div>
                                             </div>
                                        ))}
                                    </div>
                                    <div className="h-56 mt-4"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={lendingChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} label>{lendingChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><ChartTooltip formatter={(value: number) => formatCurrency(value)} /><Legend /></PieChart></ResponsiveContainer></div>
                                </div>
                            </div>
                        )}
                        
                        {states.crowdfundingType === 'equity' && (
                             <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 p-4 rounded-lg border bg-slate-50">
                                     {inputs.filter(i => i.condition && i.condition.includes('equity') || i.condition && i.condition.includes('isStartupInnovativa')).map(input => {
                                        const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                        if(!conditionMet) return null;
                                        return (
                                            <div key={input.id} className={(input.type === 'boolean' || (input.id==='irpefLordaAnnua' && !states.isStartupInnovativa)) ? 'md:col-span-2' : ''}>
                                             {input.type !== 'boolean' && <>
                                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                                <div className="relative"><input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"/>{input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}</div>
                                             </>}
                                             {input.type === 'boolean' && <div className="flex items-center gap-3 p-2 rounded-md bg-white border self-center mt-4"> <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} /><label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label></div>}
                                            </div>
                                        )
                                     })}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultato dell'Operazione (Equity)</h2>
                                    <div className="space-y-2">
                                       {outputs.filter(o => o.condition === "crowdfundingType == 'equity'").map(output => (
                                             <div key={output.id} className={`flex items-baseline justify-between p-3 rounded-lg ${output.id === 'guadagnoNettoComplessivo' ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                                                 <div className="text-sm font-medium text-gray-700">{output.label}</div>
                                                 <div className={`text-lg font-bold ${output.id === 'guadagnoNettoComplessivo' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                                     <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                                 </div>
                                             </div>
                                        ))}
                                    </div>
                                    <div className="h-64 mt-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={equityChartData} layout="vertical" stackOffset="expand"><YAxis type="category" dataKey="name" hide /><XAxis type="number" hide /><ChartTooltip formatter={(value, name, props) => `${(props.payload.percentage * 100).toFixed(1)}%` }/><Legend /><Bar dataKey="Investimento Iniziale" stackId="a" fill="#a5b4fc" /><Bar dataKey="Guadagno Netto" stackId="a" fill="#4ade80" /><Bar dataKey="Tasse su Guadagno" stackId="a" fill="#f87171" /></BarChart></ResponsiveContainer></div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-center bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="p-4 bg-white shadow-lg rounded-2xl">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Guida alla Tassazione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="p-4 bg-white shadow-lg rounded-2xl">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                           <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2012-10-18;179" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.L. 179/2012 (Decreto Crescita 2.0)</a> - Art. 29-bis per agevolazioni fiscali.</li>
                           <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/investimenti-in-startup-innovative-cittadini" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Investimenti in Startup Innovative</a></li>
                           <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 917/1986 (TUIR)</a> - Artt. 44 e 67 per la classificazione dei redditi.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneCrowdfundingEquityLendingCalculator;