'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Tasse per Videomaker Freelance | Forfettario & Ordinario",
  description: "Stima il tuo guadagno netto come videomaker professionista o artigiano. Calcola tasse (IRPEF/sostitutiva) e contributi INPS (Gestione Separata o Artigiani)."
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
            "name": "Che Codice ATECO deve usare un videomaker?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Dipende dalla natura dell'attività. Per attività di ripresa, montaggio o come operatore (inquadramento da professionista), si usa solitamente il 74.20.19. Per attività di produzione completa di video e programmi (inquadramento artigiano/commerciale), si usa il 59.11.00. La scelta impatta il regime fiscale e la cassa previdenziale."
            }
          },
          {
            "@type": "Question",
            "name": "Un videomaker paga l'INPS Gestione Separata o Artigiani?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Dipende dall'inquadramento. I professionisti (ATECO 74.20.19) si iscrivono alla Gestione Separata INPS. Gli artigiani (ATECO 59.11.00) si iscrivono alla Gestione Artigiani e Commercianti INPS, che prevede contributi fissi e variabili."
            }
          },
          {
            "@type": "Question",
            "name": "Conviene il Regime Forfettario per un videomaker?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, è molto conveniente se le spese reali (noleggio attrezzatura, software, etc.) sono basse. Se i costi superano il 22% (professionista) o il 33% (artigiano) del fatturato, il Regime Ordinario con deduzione analitica dei costi potrebbe essere più vantaggioso."
            }
          }
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
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock.startsWith('Inquadramento**')) {
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
  "slug": "tassazione-videomaker-freelance", "category": "Fisco e Lavoro Autonomo", "title": "Calcolatore Tassazione per Videomaker Freelance", "lang": "it",
  "inputs": [
    { "id": "fatturato", "label": "Fatturato Annuo Lordo", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei ricavi o compensi incassati nell'anno, prima di qualsiasi spesa o tassa." },
    { "id": "isArtigiano", "label": "Inquadramento Fiscale", "type": "select" as const, "options": [ { "value": "false", "label": "Professionista (es. Riprese, Montaggio)" }, { "value": "true", "label": "Artigiano/Impresa (es. Produzione Completa)" } ], "tooltip": "La scelta determina il Codice ATECO prevalente, il coefficiente di redditività (Forfettario) e la gestione INPS. 'Professionista' usa ATECO 74.20.19 e INPS Gestione Separata. 'Artigiano' usa ATECO 59.11.00 e INPS Gestione Artigiani." },
    { "id": "isRegimeForfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean" as const, "tooltip": "Seleziona se aderisci al regime fiscale agevolato con imposta sostitutiva. Il limite di fatturato è 85.000€." },
    { "id": "isNuovaAttivita", "label": "È una nuova attività (primi 5 anni)?", "type": "boolean" as const, "condition": "isRegimeForfettario == true", "tooltip": "Se sei in Forfettario e hai avviato da meno di 5 anni, l'imposta è ridotta al 5%. Come Artigiano, hai anche diritto a una riduzione contributiva INPS del 35%." },
    { "id": "speseDeducibili", "label": "Spese Annuali Deducibili", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "isRegimeForfettario == false", "tooltip": "Solo per il regime ordinario: inserisci i costi inerenti alla tua attività (noleggio attrezzatura, software, collaboratori, affitto studio, etc.)." },
    { "id": "haAltraCoperturaPrevidenziale", "label": "Svolgi anche un lavoro dipendente full-time?", "type": "boolean" as const, "tooltip": "Se sei anche un lavoratore dipendente a tempo pieno (> 24h/sett), l'aliquota INPS Gestione Separata si riduce. Se sei Artigiano, potresti non dover versare i contributi fissi." }
  ],
  "outputs": [
    { "id": "imponibileFiscale", "label": "Reddito Imponibile Fiscale", "unit": "€" }, { "id": "contributiPrevidenziali", "label": "Contributi INPS Dovuti", "unit": "€" }, { "id": "impostaDovuta", "label": "Imposta Fiscale Dovuta (IRPEF o Sostitutiva)", "unit": "€" }, { "id": "nettoAnnuo", "label": "Reddito Netto Annuo Stimato", "unit": "€" }, { "id": "nettoMensile", "label": "Reddito Netto Mensile Stimato", "unit": "€" }, { "id": "aliquotaEffettiva", "label": "Aliquota Effettiva Totale (Tasse + Contributi)", "unit": "%" }
  ],
  "content": "### **Guida Fiscale Completa per Videomaker Freelance**\n\n**Dall'Inquadramento ATECO al Calcolo del Netto: La Mappa per la Tua Attività**\n\nIl mondo della produzione video è creativo e dinamico, ma la gestione fiscale può essere complessa. La prima, fondamentale scelta per un videomaker con Partita IVA riguarda il suo **inquadramento fiscale e contributivo**: sei un professionista o un artigiano? La risposta a questa domanda cambia radicalmente il modo in cui vengono calcolate tasse e contributi.\n\nQuesto calcolatore è uno strumento avanzato progettato per simulare entrambi gli scenari, offrendoti una stima precisa del tuo guadagno netto. Ricorda, tuttavia, che **la consulenza di un commercialista esperto nel settore creativo è insostituibile** per definire la strategia migliore per te.\n\n### **Parte 1: La Scelta Cruciale - Professionista o Artigiano?**\n\nDiversamente da altre professioni, il videomaker si trova a un bivio. La scelta dipende dalla natura specifica della tua attività.\n\nInquadramento**Codice ATECO**Attività Tipica**Coeff. Redditività (Forfettario)**Gestione INPS\n**Professionista**`74.20.19` (Altre attività di riprese)Riprese, montaggio, color correction, operatore di camera. Attività prevalentemente intellettuale e personale.**78%**Gestione Separata\n**Artigiano/Impresa**`59.11.00` (Produzione cinematografica)Produzione completa di video corporate, spot, documentari. Attività organizzata con mezzi e capitali.**67%**Gestione Artigiani\n\n* **Coefficiente di Redditività**: In Regime Forfettario, è la percentuale del tuo fatturato su cui si calcolano tasse e contributi. Un coefficiente più alto (78%) è vantaggioso se hai poche spese; uno più basso (67%) è migliore se i tuoi costi impliciti sono più alti.\n* **Gestione INPS**: È la differenza più importante. La Gestione Separata è puramente a percentuale, mentre la Gestione Artigiani prevede contributi fissi minimali più una parte variabile.\n\n### **Parte 2: Le Gestioni INPS a Confronto**\n\n#### **INPS Gestione Separata (Professionista)**\n\n* **Come funziona**: Paghi una percentuale diretta sul tuo reddito imponibile. Se non fatturi, non paghi nulla.\n* **Aliquote (indicative 2025)**: **26,07%** se è la tua unica previdenza; **24%** se sei anche lavoratore dipendente o pensionato.\n* **Vantaggi**: Semplice, flessibile, proporzionale al fatturato.\n* **Svantaggi**: L'aliquota è mediamente più alta rispetto a quella variabile degli artigiani.\n\n#### **INPS Gestione Artigiani**\n\n* **Come funziona**: È un sistema a due livelli basato su un 'reddito minimale' (circa 18.415€ nel 2025).\n    1.  **Contributi Fissi**: Paghi un importo fisso di circa 4.450€ all'anno per coprire il minimale, indipendentemente dal tuo fatturato (anche se fatturi zero). *Non sono dovuti se hai già un lavoro dipendente full-time*.\n    2.  **Contributi Variabili**: Se il tuo reddito supera il minimale, paghi una percentuale (circa il 24%) solo sulla parte eccedente.\n* **Agevolazione Forfettario**: Se sei in Regime Forfettario, puoi richiedere uno **sconto del 35%** su tutti i contributi INPS dovuti (sia fissi che variabili).\n* **Vantaggi**: L'aliquota variabile è più bassa. Può essere più conveniente per redditi molto alti.\n* **Svantaggi**: I contributi fissi sono dovuti anche con basso fatturato, rappresentando un costo iniziale significativo.\n\n### **Parte 3: I Regimi Fiscali (Forfettario vs. Ordinario)**\n\n* **Regime Forfettario**: Ideale se hai **spese reali contenute** (inferiori al 22% del fatturato come Professionista, o al 33% come Artigiano). La tassazione è semplice (5% o 15% di imposta sostitutiva) e non hai l'IVA. Il limite di fatturato è 85.000€.\n* **Regime Ordinario**: Indispensabile se **superi i limiti del forfettario** o se hai **costi deducibili elevati**. Pensa a noleggio di attrezzature costose, acquisto di software, costi per collaboratori, affitto di uno studio. In questo regime, scarichi i costi reali e paghi l'IRPEF (imposta progressiva dal 23% al 43%) sul tuo utile effettivo.\n\n### **Conclusione: Simula e Pianifica**\n\nUsa questo calcolatore per esplorare i diversi scenari. Prova a cambiare l'inquadramento da Professionista ad Artigiano per vedere come cambiano i contributi e il netto finale. Una scelta informata oggi, basata su una previsione realistica di fatturato e costi, può farti risparmiare migliaia di euro e darti la serenità per concentrarti su ciò che ami: creare video straordinari."
};


const TassazioneVideomakerFreelanceCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturato: 60000,
        isArtigiano: false,
        isRegimeForfettario: true,
        isNuovaAttivita: true,
        speseDeducibili: 10000,
        haAltraCoperturaPrevidenziale: false,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);
    
    const handleStateChange = (id: string, value: any) => {
        // Convert string from select to boolean
        if (id === 'isArtigiano') {
            value = value === 'true';
        }
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { fatturato, isArtigiano, isRegimeForfettario, isNuovaAttivita, speseDeducibili, haAltraCoperturaPrevidenziale } = states;

        // --- Constants ---
        const COEFF_PROFESSIONISTA = 0.78;
        const COEFF_ARTIGIANO = 0.67;
        const REDDITO_MINIMALE_ARTIGIANI = 18415;
        const ALIQUOTA_INPS_ARTIGIANI = 0.24;
        const CONTRIBUTI_FISSI_ARTIGIANI = REDDITO_MINIMALE_ARTIGIANI * ALIQUOTA_INPS_ARTIGIANI; // ~4419.6
        const ALIQUOTA_INPS_GS_PIENA = 0.2607;
        const ALIQUOTA_INPS_GS_RIDOTTA = 0.24;

        // --- Calculation Logic ---
        const coefficiente = isArtigiano ? COEFF_ARTIGIANO : COEFF_PROFESSIONISTA;
        const redditoPrevidenziale = isRegimeForfettario ? fatturato * coefficiente : fatturato - speseDeducibili;
        
        let contributiPrevidenziali = 0;
        if (redditoPrevidenziale > 0) {
            if (isArtigiano) {
                const contributiFissiDovuti = haAltraCoperturaPrevidenziale ? 0 : CONTRIBUTI_FISSI_ARTIGIANI;
                const eccedenzaMinimale = Math.max(0, redditoPrevidenziale - REDDITO_MINIMALE_ARTIGIANI);
                const contributiVariabili = eccedenzaMinimale * ALIQUOTA_INPS_ARTIGIANI;
                const contributiTotali = contributiFissiDovuti + contributiVariabili;
                contributiPrevidenziali = isRegimeForfettario ? contributiTotali * 0.65 : contributiTotali;
            } else { // Professionista Gestione Separata
                const aliquotaGS = haAltraCoperturaPrevidenziale ? ALIQUOTA_INPS_GS_RIDOTTA : ALIQUOTA_INPS_GS_PIENA;
                contributiPrevidenziali = redditoPrevidenziale * aliquotaGS;
            }
        }

        const imponibileFiscale = Math.max(0, redditoPrevidenziale - contributiPrevidenziali);
        
        let impostaDovuta = 0;
        if (isRegimeForfettario) {
            impostaDovuta = imponibileFiscale * (isNuovaAttivita ? 0.05 : 0.15);
        } else {
            if (imponibileFiscale <= 28000) impostaDovuta = imponibileFiscale * 0.23;
            else if (imponibileFiscale <= 50000) impostaDovuta = 6440 + (imponibileFiscale - 28000) * 0.35;
            else impostaDovuta = 14140 + (imponibileFiscale - 50000) * 0.43;
        }
        
        const totaleUscite = contributiPrevidenziali + impostaDovuta + (isRegimeForfettario ? 0 : speseDeducibili);
        const nettoAnnuo = fatturato - totaleUscite;
        const nettoMensile = nettoAnnuo / 12;
        const aliquotaEffettiva = fatturato > 0 ? (contributiPrevidenziali + impostaDovuta) / fatturato * 100 : 0;
        
        return { imponibileFiscale, contributiPrevidenziali, impostaDovuta, nettoAnnuo, nettoMensile, aliquotaEffettiva };
    }, [states]);
    
    const chartData = [ { name: 'Ripartizione', 'Netto Stimato': Math.max(0, calculatedOutputs.nettoAnnuo), 'Imposte': Math.max(0, calculatedOutputs.impostaDovuta), 'Contributi INPS': Math.max(0, calculatedOutputs.contributiPrevidenziali) } ];
    const COLORS = ['#16a34a', '#ef4444', '#3b82f6'];

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
            pdf.save(`${slug}.pdf`);
        } catch (e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

    const formulaTrasparente = states.isArtigiano
      ? "INPS Artigiani: Contributi Fissi (~4.450€/anno) + 24% sulla parte di reddito eccedente 18.415€. Riduzione del 35% in Forfettario."
      : "INPS Gestione Separata: 26.07% (o 24% se hai altra previdenza) del reddito imponibile (Fatturato x Coeff. o Fatturato - Spese).";


    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/80 font-sans">
                <main className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4 text-base">Simula il tuo carico fiscale in base al tuo inquadramento: Professionista o Artigiano.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce una consulenza fiscale. Le aliquote sono indicative per il 2025.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg border">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;

                                if (input.type === 'select') {
                                    return (
                                        <div key={input.id} className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center">{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon/></span></Tooltip></label>
                                            <select id={input.id} value={states.isArtigiano.toString()} onChange={e => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    );
                                }
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="flex items-center gap-3 p-2 rounded-md bg-white border self-center">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultati della Simulazione</h2>
                            <div className="space-y-4">
                            {outputs.map(output => {
                                const value = (calculatedOutputs as any)[output.id];
                                const formattedValue = output.unit === '€' ? formatCurrency(value) : formatPercentage(value);
                                return(
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'nettoAnnuo' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'nettoAnnuo' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formattedValue : '...'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato</h3>
                        <div className="h-72 w-full bg-gray-50/80 p-4 rounded-lg border">
                            {isClient && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" hide />
                                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}}/>
                                        <Legend />
                                        <Bar dataKey="Netto Stimato" stackId="a" fill={COLORS[0]} />
                                        <Bar dataKey="Contributi INPS" stackId="a" fill={COLORS[2]} />
                                        <Bar dataKey="Imposte" stackId="a" fill={COLORS[1]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="mt-4 border rounded-lg p-3 bg-slate-50">
                          <h4 className="font-semibold text-gray-700 text-sm">Formula Contributi INPS Applicata</h4>
                          <p className="text-xs text-gray-600 mt-1 font-mono">{formulaTrasparente}</p>
                        </div>
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
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.istat.it/it/archivio/17888" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ISTAT - Classificazione ATECO</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/regime-forfetario-imprese-e-professionisti" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfetario</a></li>
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-servizi.50153.gestione-separata.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Separata</a></li>
                             <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-servizi.49957.artigiani.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Artigiani</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneVideomakerFreelanceCalculator;