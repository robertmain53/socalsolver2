'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Tassazione Plusvalenze (Capital Gain) 2025",
  description: "Calcola l'imposta del 26% su plusvalenze da azioni, immobili e crypto. Simula il guadagno netto e la compensazione con minusvalenze."
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
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Qual è l'aliquota standard per la tassazione del capital gain in Italia?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'aliquota standard per le plusvalenze di natura finanziaria (es. da azioni, ETF, criptovalute) è del 26%. Esistono eccezioni, come per i titoli di Stato italiani, tassati al 12,5%."
            }
          },
          {
            "@type": "Question",
            "name": "Posso usare le perdite (minusvalenze) per ridurre le tasse sui guadagni?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, il sistema fiscale italiano permette di compensare le plusvalenze con minusvalenze pregresse della stessa natura, realizzate nell'anno in corso o nei quattro anni precedenti. Questo meccanismo è noto come 'zainetto fiscale'."
            }
          },
          {
            "@type": "Question",
            "name": "Quando si paga la plusvalenza sulla vendita di una casa?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La plusvalenza sulla vendita di un immobile è tassabile solo se la vendita avviene entro 5 anni dall'acquisto. La tassazione non è dovuta se l'immobile è stato usato come abitazione principale o se è stato ricevuto in eredità."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('####')) {
                     return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/####/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                if (trimmedBlock.includes("Tipo di Regime")) {
                    const lines = trimmedBlock.split('\n');
                    const headers = lines[0].split('**');
                    const rows = lines.slice(1);
                    return (
                        <div key={index} className="overflow-x-auto my-6">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {headers.map((header, hIndex) => header && <th key={hIndex} className="p-2 border text-left font-semibold">{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, rIndex) => (
                                        <tr key={rIndex}>
                                            {row.split('**').map((cell, cIndex) => cell && <td key={cIndex} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// Dati di configurazione del calcolatore (dal file JSON)
const calculatorData = {
  "slug": "tassazione-plusvalenze-capital-gain",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Tassazione Plusvalenze (Capital Gain)",
  "lang": "it",
  "inputs": [
    { "id": "tipo_asset", "label": "Quale tipo di asset hai venduto?", "type": "select" as const, "options": ["Azioni, ETF, Obbligazioni, Fondi", "Immobile (es. seconda casa)", "Criptovalute"], "tooltip": "La tipologia di bene venduto determina le regole di tassazione specifiche da applicare." },
    { "id": "prezzo_vendita", "label": "Prezzo di Vendita (o Corrispettivo)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "L'importo totale incassato dalla vendita dell'asset." },
    { "id": "prezzo_acquisto", "label": "Prezzo di Acquisto (o Costo Fiscale)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Il costo originario sostenuto per l'acquisto dell'asset, incluse le commissioni iniziali." },
    { "id": "costi_inerenti", "label": "Costi Aggiuntivi Deducibili", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Includi qui le commissioni di vendita, costi notarili, imposte di successione o donazione, e altri oneri documentabili legati all'operazione." },
    { "id": "minusvalenze_pregresse", "label": "Minusvalenze Pregresse da Compensare", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci eventuali perdite (minusvalenze) realizzate in precedenza e ancora valide per la compensazione (solitamente negli ultimi 4 anni)." },
    { "id": "periodo_detenzione_immobile", "label": "Periodo di detenzione dell'immobile", "type": "number" as const, "unit": "anni", "min": 0, "step": 1, "condition": "tipo_asset == 'Immobile (es. seconda casa)'", "tooltip": "Numero di anni trascorsi tra l'acquisto e la vendita dell'immobile. Superati i 5 anni la plusvalenza non è generalmente tassabile." },
    { "id": "immobile_prima_casa", "label": "L'immobile era la tua abitazione principale?", "type": "boolean" as const, "condition": "tipo_asset == 'Immobile (es. seconda casa)'", "tooltip": "Spunta se l'immobile venduto è stato la tua residenza principale per la maggior parte del periodo di possesso. In tal caso, la plusvalenza è esente da imposte." }
  ],
  "outputs": [
    { "id": "plusvalenza_lorda", "label": "Plusvalenza Lorda Realizzata", "unit": "€" },
    { "id": "plusvalenza_imponibile", "label": "Plusvalenza Imponibile (dopo compensazione)", "unit": "€" },
    { "id": "imposta_dovuta", "label": "Imposta sul Capital Gain (Stima)", "unit": "€" },
    { "id": "netto_realizzato", "label": "Incasso Netto dalla Vendita", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione delle Plusvalenze (Capital Gain) in Italia**\n\n**Analisi Approfondita dei Criteri di Calcolo, delle Aliquote e dei Regimi Fiscali per Investitori e Risparmiatori**\n\nLa tassazione delle plusvalenze, comunemente nota come *capital gain*, è un aspetto fondamentale della fiscalità per chiunque investa in strumenti finanziari, immobili o criptovalute. Comprendere come si calcola e quali sono gli obblighi dichiarativi è essenziale per una corretta pianificazione finanziaria e per evitare errori con il Fisco. \n\nQuesto documento offre una guida esaustiva, partendo dalla logica del nostro calcolatore per poi esplorare in dettaglio le normative vigenti, le differenze tra le varie tipologie di asset e le strategie di ottimizzazione fiscale, come la compensazione delle minusvalenze. L'obiettivo è fornire uno strumento chiaro e autorevole, ricordando sempre che **nessun calcolatore può sostituire una consulenza personalizzata da parte di un commercialista o di un consulente fiscale qualificato.**\n\n### **Parte 1: Il Calcolatore - Logica di Funzionamento e Variabili Chiave**\n\nIl nostro strumento è progettato per simulare il calcolo dell'imposta sul capital gain in base ai parametri fiscali italiani. Fornisce una stima accurata basata sui dati inseriti, aiutandoti a comprendere l'impatto fiscale di un'operazione di vendita.\n\nLa plusvalenza è definita come la **differenza positiva** tra il prezzo di vendita e il prezzo di acquisto di un bene. I parametri fondamentali per il calcolo sono:\n\n* **Prezzo di Vendita e Acquisto**: Rappresentano il corrispettivo incassato e il costo storico sostenuto. Il costo di acquisto deve essere documentato e include eventuali commissioni pagate all'inizio.\n* **Costi Inerenti**: Sono tutti i costi direttamente collegati all'operazione che riducono la base imponibile. Esempi tipici sono le commissioni di transazione (trading), le spese notarili per gli immobili o le imposte di successione.\n* **Minusvalenze Pregresse**: Il sistema fiscale italiano permette di 'compensare' le plusvalenze con le perdite (minusvalenze) realizzate in precedenza. Questo meccanismo, noto come **zainetto fiscale**, è uno strumento cruciale di efficienza fiscale.\n\n#### **Interpretazione dei Risultati**\n\n* **Plusvalenza Lorda**: Il guadagno puro, prima di ogni considerazione fiscale.\n* **Plusvalenza Imponibile**: La base su cui verrà effettivamente calcolata l'imposta, al netto delle minusvalenze compensate.\n* **Imposta sul Capital Gain**: L'importo stimato da versare al Fisco. Generalmente corrisponde al **26%** della plusvalenza imponibile.\n* **Incasso Netto**: La somma che rimane a tua disposizione dopo aver pagato l'imposta.\n\n### **Parte 2: Analisi Dettagliata per Tipologia di Asset**\n\nLe regole di tassazione variano significativamente in base alla natura del bene venduto.\n\n#### 1. Strumenti Finanziari (Azioni, ETF, Obbligazioni, Fondi)\n\nPer questa categoria, la plusvalenza rientra tra i **'redditi diversi di natura finanziaria'**. L'aliquota standard è del **26%**. \n\n* **Titoli di Stato**: Un'eccezione importante riguarda i titoli di Stato italiani (BTP, BOT, CCT) ed equiparati (es. obbligazioni di enti sovranazionali come la BEI), la cui plusvalenza è tassata con un'aliquota agevolata del **12,5%**.\n* **Compensazione Minusvalenze**: Le plusvalenze realizzate su azioni, ETF e obbligazioni possono essere compensate con minusvalenze della stessa natura. **Attenzione**: non è possibile compensare plusvalenze da Fondi Comuni ed ETF (redditi di capitale) con minusvalenze da altri strumenti (redditi diversi).\n\n#### 2. Immobili (es. Seconde Case)\n\nLa plusvalenza immobiliare è tassata solo se la vendita avviene **entro 5 anni** dalla data di acquisto. Superato questo limite temporale, la plusvalenza non è tassabile. \n\nCi sono due importanti **eccezioni** che rendono la plusvalenza non tassabile anche prima dei 5 anni:\n\n1.  Se l'immobile è stato acquisito per **successione**.\n2.  Se l'immobile è stato adibito ad **abitazione principale** del venditore o dei suoi familiari per la maggior parte del periodo di possesso.\n\nSe la plusvalenza è tassabile, il contribuente può scegliere tra due opzioni:\n* **Tassazione ordinaria IRPEF**: La plusvalenza si somma agli altri redditi e viene tassata secondo gli scaglioni di reddito.\n* **Imposta sostitutiva del 26%**: Si può richiedere al notaio, al momento del rogito, di applicare un'imposta fissa del 26% che salda definitivamente il debito fiscale.\n\n#### 3. Criptovalute\n\nCon la Legge di Bilancio 2023, la normativa sulle criptovalute è stata chiarita. Le plusvalenze derivanti dalla vendita di cripto-attività sono tassate con un'imposta sostitutiva del **26%**. Esiste una **franchigia**: la tassazione si applica solo sulla parte di plusvalenza che eccede i **2.000 euro** per periodo d'imposta.\n\n### **Parte 3: I Regimi Fiscali per gli Investimenti Finanziari**\n\nPer la gestione degli adempimenti fiscali legati agli investimenti finanziari, esistono tre regimi.\n\nTipo di Regime**Come Funziona**Chi lo Gestisce**Pro**Contro\n**Regime Amministrato**L'intermediario (banca, broker) agisce come sostituto d'imposta, calcolando e versando le imposte per ogni operazione.**Banca o Broker italiano**Semplicità massima per l'investitore. Privacy sulle strategie di investimento.**Impossibilità di compensare minus/plus tra conti diversi. Costi di gestione più alti.\n**Regime Dichiarativo**L'investitore è responsabile di calcolare tutte le plusvalenze e minusvalenze dell'anno e riportarle nella propria dichiarazione dei redditi (Modello Redditi PF).**Investitore (o il suo commercialista)**Massima efficienza fiscale (compensazione tra conti diversi). Accesso a broker esteri più economici.**Complessità di calcolo. Obbligo di monitoraggio fiscale (quadro RW).\n**Regime Gestito**L'investitore delega la gestione del portafoglio a un intermediario, che si occupa anche degli aspetti fiscali a fine anno.**Società di Gestione del Risparmio (SGR)**Delega totale sia delle scelte di investimento sia della fiscalità.**Costo elevato. Meno controllo diretto sul portafoglio.\n\n### **Conclusione**\n\nIl calcolo della tassazione sulle plusvalenze richiede attenzione ai dettagli, dalla corretta imputazione dei costi alla scelta del regime fiscale più adatto. Questo calcolatore è uno strumento potente per ottenere una stima rapida e affidabile, fondamentale per prendere decisioni di investimento informate. Per la dichiarazione fiscale effettiva e per casi complessi, si raccomanda sempre di consultare un professionista.\n"
};

const TassazionePlusvalenzeCapitalGainCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        tipo_asset: "Azioni, ETF, Obbligazioni, Fondi",
        prezzo_vendita: 25000,
        prezzo_acquisto: 18000,
        costi_inerenti: 150,
        minusvalenze_pregresse: 1200,
        periodo_detenzione_immobile: 3,
        immobile_prima_casa: false,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const {
            prezzo_vendita, prezzo_acquisto, costi_inerenti, minusvalenze_pregresse,
            tipo_asset, periodo_detenzione_immobile, immobile_prima_casa
        } = states;

        const plusvalenza_lorda = Math.max(0, prezzo_vendita - prezzo_acquisto - costi_inerenti);
        const plusvalenza_imponibile = Math.max(0, plusvalenza_lorda - minusvalenze_pregresse);
        
        let aliquota = 0.26;
        if (tipo_asset === 'Immobile (es. seconda casa)' && (periodo_detenzione_immobile > 5 || immobile_prima_casa)) {
            aliquota = 0;
        }

        const imposta_dovuta = plusvalenza_imponibile * aliquota;
        const netto_realizzato = prezzo_vendita - costi_inerenti - imposta_dovuta;

        return { plusvalenza_lorda, plusvalenza_imponibile, imposta_dovuta, netto_realizzato };
    }, [states]);

    const chartData = [
        { name: 'Dettaglio', 'Costo Iniziale': states.prezzo_acquisto, 'Plusvalenza': calculatedOutputs.plusvalenza_lorda, 'Imposta': calculatedOutputs.imposta_dovuta },
    ];
    
    const formulaUsata = `Imposta = MAX(0, (Prezzo Vendita - Prezzo Acquisto - Costi) - Minusvalenze) * Aliquota`;

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
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-lg p-6" ref={calcolatoreRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Simula la tassazione sui tuoi guadagni da investimenti e vendite immobiliari.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale professionale. I calcoli si basano sulla normativa vigente e potrebbero non coprire tutti i casi specifici.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split("'")[1]);
                                if (!conditionMet) return null;

                                const inputLabel = (
                                    <label className="block text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'select') {
                                    return (
                                        <div key={input.id} className="md:col-span-2">
                                            {inputLabel}
                                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                                {input.options?.map(opt => <option key={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    );
                                }
                                
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-gray-50 border mt-2">
                                            <input id={input.id} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="relative mt-1">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-gray-500 sm:text-sm">{input.unit}</span>
                                            </div>
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-8 pr-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Simulazione</h2>
                            <div className="space-y-3">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'imposta_dovuta' ? 'bg-red-50' : (output.id === 'netto_realizzato' ? 'bg-green-50' : 'bg-gray-50')}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'imposta_dovuta' ? 'text-red-600' : (output.id === 'netto_realizzato' ? 'text-green-700' : 'text-gray-900')}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione del Prezzo di Vendita</h3>
                            <div className="h-72 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Costo Iniziale" stackId="a" fill="#60a5fa" name="Costo d'Acquisto" />
                                            <Bar dataKey="Plusvalenza" stackId="a" fill="#34d399" name="Plusvalenza Lorda" />
                                            <Bar dataKey="Imposta" stackId="a" fill="#f87171" name="Imposta Dovuta" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                         <div className="mt-8 border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                            <p className="text-xs text-gray-600 mt-2 p-3 bg-white rounded font-mono break-words shadow-sm">{formulaUsata}</p>
                            <p className="text-xs text-gray-500 mt-2">Nota: L'aliquota (26% o 0% per casi di esenzione immobiliare) viene applicata alla base imponibile.</p>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="flex flex-col space-y-2">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-red-200 text-red-700 rounded-md px-4 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-5 bg-white shadow-lg">
                        <h2 className="font-bold mb-4 text-gray-800 text-lg">Guida Approfondita</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-5 bg-white shadow-lg">
                        <h2 className="font-bold mb-4 text-gray-800 text-lg">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/comunicazioni/redditi-diversi-pf/capital-gain-e-altri-redditi-diversi" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Redditi diversi (Capital Gain)</a></li>
                            <li><a href="https://def.finanze.it/DocTrib/Testo-unico-delle-imposte-sui-redditi/document.html#art67" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Art. 67 TUIR - Redditi diversi</a></li>
                            <li><a href="https://www.gazzettaufficiale.it/eli/id/2022/12/29/22G00211/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge di Bilancio 2023 (197/2022)</a> - per la normativa sulle cripto-attività.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazionePlusvalenzeCapitalGainCalculator;