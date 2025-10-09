'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Tassazione per Social Media Manager Freelance",
  description: "Simula tasse, contributi INPS e reddito netto per un Social Media Manager in regime forfettario o ordinario. Pianifica la tua fiscalità in modo semplice."
};

// --- Componenti UI e Icone (Self-Contained) ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {text}
        </div>
    </div>
);

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
                        "name": "Che Codice ATECO usa un Social Media Manager?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I codici ATECO più comuni per un Social Media Manager sono 73.11.01 (Ideazione di campagne pubblicitarie) o 73.11.02 (Conduzione di campagne di marketing). Entrambi hanno un coefficiente di redditività del 78% nel Regime Forfettario."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quante tasse paga un Social Media Manager in Forfettario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Un Social Media Manager in Forfettario paga un'imposta sostitutiva del 5% (per i primi 5 anni) o del 15% sul 78% del suo fatturato, a cui si aggiungono i contributi INPS Gestione Separata. Il nostro calcolatore fornisce una stima precisa."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come funzionano i contributi INPS per un SMM freelance?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il Social Media Manager freelance si iscrive alla Gestione Separata INPS. I contributi si pagano in percentuale sul reddito imponibile (senza un minimale fisso). L'aliquota è del 26,07% o ridotta al 24% se si ha già un'altra copertura previdenziale (es. lavoro dipendente)."
                        }
                    }
                ]
            })
        }}
    />
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
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock.includes('**Regime Forfettario**')) {
                    const rows = trimmedBlock.split('\n');
                    const headers = rows[0].split('**').filter(h => h.trim()).slice(1);
                    const bodyRows = rows.slice(1).map(row => row.split('**').filter(c => c.trim()));
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr><th className="p-2 border text-left">Caratteristica</th>{headers.map((header, hIndex) => <th key={hIndex} className="p-2 border text-left">{header}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {bodyRows.map((row, rIndex) => (
                                        <tr key={rIndex}>{row.map((cell, cIndex) => <td key={cIndex} className={`p-2 border ${cIndex === 0 ? 'font-semibold' : ''}`} dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati di Configurazione ---
const calculatorData = {
  "slug": "tassazione-social-media-manager-freelance", "category": "Fisco e Lavoro Autonomo", "title": "Calcolatore Tassazione per Social Media Manager Freelance", "lang": "it",
  "inputs": [
    { "id": "fatturato_annuo", "label": "Fatturato Annuo Lordo", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei compensi incassati nell'anno, al lordo di qualsiasi spesa. Questo è il tuo volume d'affari." },
    { "id": "regime_forfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean", "tooltip": "Seleziona se la tua Partita IVA rientra nel regime fiscale agevolato (forfettario)." },
    { "id": "is_nuova_attivita_forfettario", "label": "Sei una nuova attività in Forfettario (primi 5 anni)?", "type": "boolean", "condition": "regime_forfettario == true", "tooltip": "Spunta se rispetti i requisiti per l'aliquota ridotta al 5%, riservata alle startup." },
    { "id": "costi_deducibili", "label": "Costi Deducibili Sostenuti", "type": "number", "unit": "€", "min": 0, "step": 100, "condition": "regime_forfettario == false", "tooltip": "Solo per Regime Ordinario: inserisci il totale delle spese professionali (es. software, advertising, formazione)." },
    { "id": "ha_altra_copertura_previdenziale", "label": "Hai un'altra copertura previdenziale obbligatoria?", "type": "boolean", "tooltip": "Spunta se sei anche un lavoratore dipendente, un pensionato o iscritto ad un'altra cassa. Questo riduce l'aliquota INPS da versare." }
  ],
  "outputs": [
    { "id": "reddito_imponibile_lordo", "label": "Reddito Imponibile Lordo", "unit": "€" },
    { "id": "contributi_inps_dovuti", "label": "Contributi INPS Gestione Separata Dovuti", "unit": "€" },
    { "id": "imposta_dovuta", "label": "Imposta Fiscale Dovuta (IRPEF o Sostitutiva)", "unit": "€" },
    { "id": "reddito_netto_finale", "label": "Reddito Netto Finale", "unit": "€" },
    { "id": "tassazione_effettiva", "label": "Aliquota Effettiva (Tasse+Contributi)", "unit": "%" }
  ],
  "content": "### **Guida Completa alla Tassazione per Social Media Manager Freelance**\n\n**Dal Codice ATECO al Calcolo del Netto: Tutto ciò che Devi Sapere**\n\nL'attività di Social Media Manager (SMM) come freelance è una delle professioni digitali più in crescita. Tuttavia, districarsi tra Partita IVA, regime fiscale e contributi previdenziali può sembrare complesso. Questa guida, insieme al nostro calcolatore interattivo, ha l'obiettivo di fare chiarezza e fornirti gli strumenti per una gestione consapevole della tua attività.\n\n**Disclaimer:** Questo calcolatore è uno strumento di simulazione e non sostituisce in alcun modo la consulenza di un commercialista, che rimane essenziale per analizzare la tua situazione specifica.\n\n### **Parte 1: L'Inquadramento Fiscale e Previdenziale del SMM**\n\n#### **Il Codice ATECO Corretto**\n\nIl primo passo per aprire la Partita IVA è la scelta del Codice ATECO, che identifica la tua attività. Per un Social Media Manager, le opzioni più comuni sono:\n\n* **73.11.01 - Ideazione di campagne pubblicitarie**\n* **73.11.02 - Conduzione di campagne di marketing e altri servizi pubblicitari**\n\nEntrambi questi codici classificano l'attività come **professionale** e, in Regime Forfettario, prevedono un **coefficiente di redditività del 78%**. Questo significa che lo Stato considera il 78% del tuo fatturato come reddito imponibile, mentre il restante 22% è una deduzione forfettaria per le spese.\n\n#### **La Previdenza: INPS Gestione Separata**\n\nIl Social Media Manager è un professionista **senza una cassa previdenziale specifica** (come Inarcassa per gli architetti o la Cassa Forense per gli avvocati). Pertanto, l'iscrizione è obbligatoria alla **Gestione Separata dell'INPS**.\n\nCaratteristiche principali:\n\n* **Nessun Contributo Minimo**: A differenza di artigiani e commercianti, i professionisti in Gestione Separata pagano i contributi solo in percentuale sul reddito effettivamente prodotto. Se il reddito è zero, i contributi sono zero.\n* **Aliquote Percentuali**: L'aliquota contributiva cambia in base alla tua situazione:\n    * **Aliquota Piena (26,07% per il 2025)**: Si applica se la Partita IVA è la tua unica fonte di reddito e non hai altre forme di previdenza obbligatoria.\n    * **Aliquota Ridotta (24% per il 2025)**: Si applica se sei contemporaneamente un lavoratore dipendente o un pensionato.\n\n### **Parte 2: Regime Forfettario vs. Ordinario: Cosa Scegliere?**\n\nQuesta è la decisione più importante per l'impatto che ha sulla tassazione e sulla gestione contabile.\n\nCaratteristica **Regime Forfettario** **Regime Ordinario (Semplificato)**\n**Calcolo Reddito** Fatturato x **78%** Fatturato - Costi Reali Deducibili\n**Tassazione** Imposta Sostitutiva **5%** (startup) o **15%** Tassazione progressiva **IRPEF** (dal 23% al 43%)\n**Contributi INPS** Si calcolano sul reddito calcolato al 78% Si calcolano sul reddito (Fatturato - Costi)\n**Deducibilità Contributi** **SÌ**, i contributi versati sono deducibili dal reddito imponibile. **SÌ**, i contributi versati sono deducibili dal reddito imponibile.\n**IVA** Non si applica in fattura. Si applica e si gestisce trimestralmente.\n\n#### **Quando conviene il Regime Forfettario per un SMM?**\n\nIl Regime Forfettario è **estremamente vantaggioso** se le tue spese reali (software, abbonamenti, pubblicità, computer, etc.) sono **inferiori al 22%** del tuo fatturato. Per molti SMM, che spesso hanno costi contenuti, questo regime si traduce in un notevole risparmio fiscale e in una gestione molto più semplice.\n\nSe invece prevedi di sostenere costi elevati (es. ufficio in affitto, collaboratori, grandi budget pubblicitari a tuo nome), il Regime Ordinario potrebbe diventare più conveniente perché ti permette di dedurre analiticamente tutte le spese.\n\n### **Parte 3: Guida Pratica all'Uso del Calcolatore**\n\nIl nostro strumento ti permette di simulare entrambi gli scenari:\n\n1.  **Inserisci il tuo fatturato annuo previsto**.\n2.  **Scegli il regime fiscale** che vuoi analizzare.\n3.  Se in Forfettario, indica se sei una **nuova attività** per applicare l'aliquota del 5%.\n4.  Se in Ordinario, inserisci una **stima dei tuoi costi professionali**.\n5.  Indica se hai **altre forme di previdenza** per applicare la corretta aliquota INPS.\n\nIl calcolatore ti mostrerà una chiara ripartizione tra contributi, imposte e il tuo guadagno netto finale, aiutandoti a pianificare con maggiore serenità."
};

const TassazioneSocialMediaManagerFreelanceCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialInputs = {
        fatturato_annuo: 45000,
        regime_forfettario: true,
        is_nuova_attivita_forfettario: true,
        costi_deducibili: 9000,
        ha_altra_copertura_previdenziale: false
    };
    const [inputValues, setInputValues] = useState<{[key: string]: any}>(initialInputs);

    const handleInputChange = (id: string, value: any) => setInputValues(prev => ({...prev, [id]: value}));
    const handleReset = () => setInputValues(initialInputs);

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, regime_forfettario, is_nuova_attivita_forfettario, costi_deducibili, ha_altra_copertura_previdenziale } = inputValues;
        
        const COEFFICIENTE_FORFETTARIO = 0.78;
        const ALIQUOTA_INPS_PIENA = 0.2607;
        const ALIQUOTA_INPS_RIDOTTA = 0.24;
        const MASSIMALE_INPS = 119650;

        const reddito_imponibile_lordo = regime_forfettario ? fatturato_annuo * COEFFICIENTE_FORFETTARIO : Math.max(0, fatturato_annuo - costi_deducibili);
        const aliquota_inps_applicata = ha_altra_copertura_previdenziale ? ALIQUOTA_INPS_RIDOTTA : ALIQUOTA_INPS_PIENA;
        const imponibile_inps_effettivo = Math.min(reddito_imponibile_lordo, MASSIMALE_INPS);
        const contributi_inps_dovuti = imponibile_inps_effettivo * aliquota_inps_applicata;

        const reddito_imponibile_fiscale = regime_forfettario ? Math.max(0, reddito_imponibile_lordo - contributi_inps_dovuti) : reddito_imponibile_lordo;
        
        let imposta_dovuta = 0;
        if (regime_forfettario) {
            imposta_dovuta = reddito_imponibile_fiscale * (is_nuova_attivita_forfettario ? 0.05 : 0.15);
        } else {
            if (reddito_imponibile_fiscale <= 28000) imposta_dovuta = reddito_imponibile_fiscale * 0.23;
            else if (reddito_imponibile_fiscale <= 50000) imposta_dovuta = 6440 + (reddito_imponibile_fiscale - 28000) * 0.35;
            else imposta_dovuta = 14140 + (reddito_imponibile_fiscale - 50000) * 0.43;
        }
        
        const reddito_netto_finale = fatturato_annuo - (regime_forfettario ? 0 : costi_deducibili) - contributi_inps_dovuti - imposta_dovuta;
        const tassazione_effettiva = fatturato_annuo > 0 ? ((contributi_inps_dovuti + imposta_dovuta) / fatturato_annuo) * 100 : 0;

        return { reddito_imponibile_lordo, contributi_inps_dovuti, imposta_dovuta, reddito_netto_finale, tassazione_effettiva };
    }, [inputValues]);

    const chartData = [{ name: 'Distribuzione Fatturato', 'Reddito Netto': Math.max(0, calculatedOutputs.reddito_netto_finale), 'Contributi INPS': calculatedOutputs.contributi_inps_dovuti, 'Imposte': calculatedOutputs.imposta_dovuta }];

    const handleExportPDF = useCallback(async () => {
        try {
            const { default: html2canvas } = await import("html2canvas");
            const { default: jsPDF } = await import("jspdf");
            if (calculatorRef.current) {
                const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'pt', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${slug}.pdf`);
            }
        } catch(e) { console.error(e); alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: inputValues, outputs: calculatedOutputs, ts: Date.now() };
            const history = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...history].slice(0, 10)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [inputValues, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercent = (value: number) => `${value.toFixed(2)} %`;

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo informativo e non sostituisce una consulenza fiscale professionale, necessaria per una valutazione accurata della tua situazione.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const isVisible = !input.condition || (inputValues.regime_forfettario === (input.condition.includes("true")));
                                if (!isVisible) return null;
                                return (
                                    <div key={input.id} className={input.type === 'boolean' ? 'md:col-span-2' : ''}>
                                        {input.type === 'number' && (<>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip></label>
                                            <div className="flex items-center gap-2">
                                                <input id={input.id} type="number" className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" min={input.min} step={input.step} value={inputValues[input.id]} onChange={(e) => handleInputChange(input.id, e.target.value === "" ? 0 : parseFloat(e.target.value))} />
                                                {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                            </div>
                                        </>)}
                                        {input.type === 'boolean' && (<div className="flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={inputValues[input.id]} onChange={(e) => handleInputChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip></label>
                                        </div>)}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-8 space-y-4">
                             <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                             {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'reddito_netto_finale' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'reddito_netto_finale' ? 'text-green-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? (output.unit === '€' ? formatCurrency((calculatedOutputs as any)[output.id]) : formatPercent((calculatedOutputs as any)[output.id])) : '...'}</span>
                                    </div>
                                </div>
                             ))}
                        </div>
                         <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={chartData} stackOffset="expand">
                                            <XAxis type="number" hide tickFormatter={(tick) => `${tick * 100}%`} />
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value: number, name: string) => [`${(value * 100).toFixed(2)}%`, name]} />
                                            <Bar dataKey="Reddito Netto" stackId="a" fill="#22c55e" />
                                            <Bar dataKey="Contributi INPS" stackId="a" fill="#3b82f6" />
                                            <Bar dataKey="Imposte" stackId="a" fill="#ef4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm">
                                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Reddito Netto</div>
                                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Contributi INPS</div>
                                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Imposte Fiscali</div>
                            </div>
                         </div>
                    </div>
                </div>
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Salva</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 bg-red-50 rounded-md px-3 py-2 text-red-700 hover:bg-red-100 transition-colors">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Tassazione SMM</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-contributi.gestione-separata-aliquote-contributive-e-massimale-2025.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Separata</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/regime-forfettario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneSocialMediaManagerFreelanceCalculator;