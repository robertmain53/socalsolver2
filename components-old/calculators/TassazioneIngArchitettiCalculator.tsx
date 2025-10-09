'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Tassazione per Ingegneri e Architetti (con Inarcassa)",
  description: "Simula il tuo carico fiscale e previdenziale con Inarcassa. Calcola tasse, contributi e reddito netto per regime forfettario e ordinario."
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
                        "name": "Come si calcolano i contributi Inarcassa?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I contributi Inarcassa si basano su un contributo soggettivo (14,5% del reddito professionale netto, con un minimo), un contributo integrativo (4% del volume d'affari, a carico del cliente) e un contributo di maternità fisso. Questo calcolatore simula il calcolo basato su questi parametri."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quando conviene il regime forfettario per un ingegnere o architetto?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il regime forfettario è conveniente quando i costi reali dell'attività sono inferiori al 22% del fatturato, che è la percentuale di costi riconosciuta a forfait. È ideale per i professionisti all'inizio dell'attività o con una struttura di costi snella."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "I contributi Inarcassa sono deducibili?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sì, il contributo soggettivo e il contributo di maternità/paternità sono interamente deducibili dal reddito imponibile, sia in regime forfettario che in regime ordinario. Il contributo integrativo, essendo addebitato al cliente, non è un costo per il professionista e quindi non è deducibile."
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
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                // Basic Table Renderer
                if (trimmedBlock.includes('**Regime Forfettario**')) {
                    const rows = trimmedBlock.split('\n');
                    const headers = rows[0].split('**').filter(h => h.trim()).slice(1);
                    const bodyRows = rows.slice(1).map(row => row.split('**').filter(c => c.trim()));

                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map((header, hIndex) => <th key={hIndex} className="p-2 border text-left">{header}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {bodyRows.map((row, rIndex) => (
                                        <tr key={rIndex}>
                                            {row.map((cell, cIndex) => <td key={cIndex} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
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


// --- Dati di Configurazione ---
const calculatorData = {
  "slug": "tassazione-ing-architetti", "category": "Fisco e Lavoro Autonomo", "title": "Calcolatore Tassazione per Ingegneri e Architetti (con Inarcassa)", "lang": "it",
  "inputs": [
    { "id": "fatturato_annuo", "label": "Fatturato Annuo Lordo", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei ricavi o compensi incassati nell'anno, al lordo di IVA e di qualsiasi spesa." },
    { "id": "regime_forfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean", "tooltip": "Seleziona se la tua Partita IVA rientra nel regime fiscale forfettario." },
    { "id": "is_nuova_attivita_forfettario", "label": "Sei una nuova attività in Forfettario?", "type": "boolean", "condition": "regime_forfettario == true", "tooltip": "Spunta se sei nei primi 5 anni di attività e rispetti i requisiti per l'aliquota ridotta al 5%." },
    { "id": "costi_deducibili", "label": "Costi Deducibili Sostenuti", "type": "number", "unit": "€", "min": 0, "step": 100, "condition": "regime_forfettario == false", "tooltip": "Solo per Regime Ordinario: inserisci il totale delle spese professionali deducibili (es. acquisto software, affitto ufficio, utenze)." },
    { "id": "is_under_35", "label": "Hai meno di 35 anni?", "type": "boolean", "tooltip": "Gli iscritti con meno di 35 anni possono beneficiare di una riduzione sul contributo soggettivo minimo." },
    { "id": "is_pensionato", "label": "Sei un pensionato iscritto a Inarcassa?", "type": "boolean", "tooltip": "I pensionati iscritti che continuano a esercitare la professione beneficiano di un dimezzamento del contributo soggettivo." }
  ],
  "outputs": [
    { "id": "reddito_imponibile_lordo", "label": "Reddito Imponibile Lordo", "unit": "€" },
    { "id": "contributi_inarcassa_totali", "label": "Totale Contributi Inarcassa Dovuti", "unit": "€" },
    { "id": "imposta_dovuta", "label": "Imposta Fiscale Dovuta (IRPEF/Sostitutiva)", "unit": "€" },
    { "id": "reddito_netto_finale", "label": "Reddito Netto Finale", "unit": "€" },
    { "id": "tassazione_effettiva", "label": "Aliquota di Tassazione Effettiva", "unit": "%" }
  ],
  "content": "### **Guida Definitiva alla Tassazione per Ingegneri e Architetti con Inarcassa**\n\n**Analisi dei Regimi Fiscali, Calcolo dei Contributi e Ottimizzazione del Carico Fiscale**\n\nLa gestione fiscale e previdenziale è un pilastro fondamentale per la sostenibilità della libera professione di ingegnere e architetto. Comprendere il funzionamento di Inarcassa e scegliere il regime fiscale più adatto sono decisioni strategiche che impattano direttamente sul proprio reddito netto. \n\nQuesto strumento è progettato per offrire una **simulazione chiara e dettagliata** del carico fiscale e contributivo. L'obiettivo è fornire una base solida per dialogare con il proprio commercialista e prendere decisioni informate. **Ricorda: questo calcolatore è uno strumento di stima e non sostituisce una consulenza professionale personalizzata.**\n\n### **Parte 1: Il Calcolatore - Interpretare Input e Output**\n\nIl nostro simulatore si basa sulle normative fiscali e previdenziali in vigore. Ecco una guida ai parametri richiesti:\n\n* **Fatturato Annuo Lordo**: È il totale dei compensi incassati nell'anno solare, prima di ogni deduzione o applicazione di imposte e contributi. Per Inarcassa, è la base per il calcolo del contributo integrativo.\n* **Regime Fiscale**: La scelta tra Regime Forfettario e Ordinario è il bivio principale. Il Forfettario offre una tassazione semplificata su un reddito calcolato a forfait, mentre l'Ordinario si basa sulla differenza analitica tra ricavi e costi.\n* **Costi Deducibili (Solo Ordinario)**: Include tutte le spese inerenti all'attività professionale (es. software, corsi di aggiornamento, affitto studio, materiali) che possono essere sottratte dal fatturato per determinare il reddito imponibile.\n* **Agevolazioni**: Il calcolatore tiene conto delle principali riduzioni previste da Inarcassa per i giovani sotto i 35 anni e per i professionisti già titolari di pensione.\n\n### **Parte 2: Inarcassa - La Previdenza Obbligatoria Spiegata**\n\nInarcassa è l'ente di previdenza e assistenza obbligatorio per tutti gli ingegneri e architetti liberi professionisti iscritti ai rispettivi Albi e titolari di Partita IVA.\n\nLa contribuzione si articola in tre voci principali:\n\n1.  **Contributo Soggettivo**: È il contributo obbligatorio calcolato in percentuale sul reddito professionale netto. Finanzia direttamente la futura pensione.\n    * **Aliquota**: **14,5%** sul reddito imponibile.\n    * **Minimo Obbligatorio**: Esiste un importo minimo da versare annualmente, anche in assenza di reddito. Per i giovani under 35, questo minimo è ridotto a un terzo per i primi 5 anni di iscrizione.\n    * **Pensionati**: I professionisti pensionati che continuano l'attività versano un'aliquota dimezzata (7,25%).\n\n2.  **Contributo Integrativo**: Ha una funzione di solidarietà e finanziamento delle spese operative dell'ente. È obbligatorio per tutti i professionisti.\n    * **Aliquota**: **4%** da applicare sul volume d'affari lordo e da addebitare in fattura al cliente (rivalsa).\n    * **Minimo Obbligatorio**: Anche per questo contributo è previsto un versamento minimo annuale.\n    * **Deducibilità**: Non è deducibile ai fini IRPEF, in quanto è a carico del committente.\n\n3.  **Contributo di Maternità/Paternità**: Un importo fisso annuale, versato da tutti gli iscritti, che finanzia l'indennità per la genitorialità.\n\n### **Parte 3: Regime Forfettario vs. Regime Ordinario - Quale Scegliere?**\n\nLa scelta del regime fiscale è determinante. Ecco un confronto diretto per ingegneri e architetti.\n\nRegime Fiscale **Regime Forfettario** **Regime Ordinario (Semplificato)**\n**Come si calcola il Reddito** Fatturato Annuo x **78%** (Coefficiente di Redditività). I costi sono forfettizzati al 22%. Fatturato Annuo - Costi Deducibili Analitici.\n**Tassazione** Imposta Sostitutiva del **15%** (o **5%** per nuove attività) sul reddito imponibile fiscale. Tassazione progressiva **IRPEF** (scaglioni dal 23% al 43%) sul reddito imponibile.\n**Deducibilità Contributi** I contributi previdenziali obbligatori (Soggettivo e Maternità) sono **deducibili** dal reddito imponibile. I contributi previdenziali obbligatori sono **deducibili** dal reddito imponibile.\n**IVA** Non si applica l'IVA in fattura (esente). Si applica l'IVA (attualmente al 22%) e si gestisce la relativa liquidazione periodica.\n**Pro** Semplificazione contabile, tassazione bassa e certa, esenzione IVA. Deducibilità di tutti i costi reali, possibilità di recuperare l'IVA sugli acquisti.\n**Contro** Impossibilità di dedurre i costi reali (svantaggioso se superano il 22% del fatturato), limite di fatturato (85.000€). Maggiore complessità contabile, tassazione potenzialmente più elevata, gestione dell'IVA.\n\n#### **Quando conviene il Regime Forfettario?**\n\nIl Forfettario è generalmente vantaggioso per i professionisti all'inizio della carriera o con **costi operativi reali inferiori al 22% del fatturato**. La bassa aliquota fiscale (soprattutto il 5% startup) lo rende molto competitivo. È ideale per chi lavora principalmente da casa o con attrezzature a basso costo.\n\n### **Conclusione e Passi Successivi**\n\nUtilizza questo calcolatore per esplorare diversi scenari di fatturato e costi. Comprendere l'impatto di ogni variabile ti permetterà di pianificare meglio la tua attività. \n\nIl passo successivo è sempre una consulenza con un commercialista specializzato in professioni tecniche. Solo un professionista può analizzare la tua situazione specifica, considerare tutte le variabili personali e familiari e consigliarti la strategia fiscale e previdenziale ottimale per il tuo futuro."
};

const TassazioneIngArchitettiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialInputs = {
        fatturato_annuo: 65000,
        regime_forfettario: true,
        is_nuova_attivita_forfettario: false,
        costi_deducibili: 15000,
        is_under_35: true,
        is_pensionato: false
    };
    const [inputValues, setInputValues] = useState<{[key: string]: any}>(initialInputs);

    const handleInputChange = (id: string, value: any) => {
        setInputValues(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setInputValues(initialInputs);

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, regime_forfettario, is_nuova_attivita_forfettario, costi_deducibili, is_under_35, is_pensionato } = inputValues;
        
        const COEFFICIENTE_FORFETTARIO = 0.78;
        const MINIMO_SOGGETTIVO_INTERO = 2695;
        const MINIMO_SOGGETTIVO_RIDOTTO_GIOVANI = MINIMO_SOGGETTIVO_INTERO / 3;
        const MINIMO_INTEGRATIVO = 815;
        const CONTRIBUTO_MATERNITA = 60;
        const ALIQUOTA_SOGGETTIVO = 0.145;
        const ALIQUOTA_INTEGRATIVO = 0.04;

        const reddito_imponibile_lordo = regime_forfettario ? fatturato_annuo * COEFFICIENTE_FORFETTARIO : Math.max(0, fatturato_annuo - costi_deducibili);
        const minimo_soggettivo_applicabile = is_under_35 ? MINIMO_SOGGETTIVO_RIDOTTO_GIOVANI : MINIMO_SOGGETTIVO_INTERO;
        const contributo_soggettivo_calcolato = reddito_imponibile_lordo * ALIQUOTA_SOGGETTIVO;
        const contributo_soggettivo_finale = is_pensionato ? (contributo_soggettivo_calcolato / 2) : Math.max(minimo_soggettivo_applicabile, contributo_soggettivo_calcolato);
        const contributo_integrativo_calcolato = fatturato_annuo * ALIQUOTA_INTEGRATIVO;
        const contributo_integrativo_finale = Math.max(MINIMO_INTEGRATIVO, contributo_integrativo_calcolato);
        const contributi_inarcassa_totali = contributo_soggettivo_finale + contributo_integrativo_finale + CONTRIBUTO_MATERNITA;
        
        const reddito_imponibile_fiscale = regime_forfettario ? Math.max(0, reddito_imponibile_lordo - contributo_soggettivo_finale - CONTRIBUTO_MATERNITA) : reddito_imponibile_lordo;

        let imposta_dovuta = 0;
        if (regime_forfettario) {
            const aliquota_imposta_sostitutiva = is_nuova_attivita_forfettario ? 0.05 : 0.15;
            imposta_dovuta = reddito_imponibile_fiscale * aliquota_imposta_sostitutiva;
        } else { // IRPEF 2024+
            if (reddito_imponibile_fiscale <= 28000) {
                imposta_dovuta = reddito_imponibile_fiscale * 0.23;
            } else if (reddito_imponibile_fiscale <= 50000) {
                imposta_dovuta = 6440 + (reddito_imponibile_fiscale - 28000) * 0.35;
            } else {
                imposta_dovuta = 14140 + (reddito_imponibile_fiscale - 50000) * 0.43;
            }
        }
        
        const reddito_netto_finale = fatturato_annuo - (regime_forfettario ? 0 : costi_deducibili) - contributi_inarcassa_totali - imposta_dovuta;
        const tassazione_effettiva = fatturato_annuo > 0 ? ((contributi_inarcassa_totali + imposta_dovuta) / fatturato_annuo) * 100 : 0;

        return { reddito_imponibile_lordo, contributi_inarcassa_totali, imposta_dovuta, reddito_netto_finale, tassazione_effettiva };
    }, [inputValues]);
    
    const chartData = [
        { 
            name: 'Distribuzione Fatturato', 
            'Reddito Netto': Math.max(0, calculatedOutputs.reddito_netto_finale), 
            'Contributi': calculatedOutputs.contributi_inarcassa_totali, 
            'Imposte': calculatedOutputs.imposta_dovuta 
        }
    ];

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
                pdf.save(`${slug}-simulazione.pdf`);
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
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce una consulenza fiscale professionale, necessaria per una valutazione accurata della propria situazione.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const isVisible = !input.condition || (inputValues.regime_forfettario === (input.condition.includes("true")) );
                                if (!isVisible) return null;
                                
                                return (
                                    <div key={input.id} className={input.type === 'boolean' ? 'md:col-span-2' : ''}>
                                        {input.type === 'number' && (
                                            <>
                                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                                    {input.label}
                                                    <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={inputValues[input.id]} onChange={(e) => handleInputChange(input.id, e.target.value === "" ? 0 : parseFloat(e.target.value))} />
                                                    {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                                </div>
                                            </>
                                        )}
                                        {input.type === 'boolean' && (
                                            <div className="flex items-center gap-3 p-2 rounded-md bg-white border">
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={inputValues[input.id]} onChange={(e) => handleInputChange(input.id, e.target.checked)} />
                                                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                                    {input.label}
                                                    <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>
                                                </label>
                                            </div>
                                        )}
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
                                            <ChartTooltip formatter={(value: number, name: string, props) => [`${(value * 100).toFixed(2)}%`, name]} />
                                            <Bar dataKey="Reddito Netto" stackId="a" fill="#22c55e" />
                                            <Bar dataKey="Contributi" stackId="a" fill="#3b82f6" />
                                            <Bar dataKey="Imposte" stackId="a" fill="#ef4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                         </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Legenda del Grafico</h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Reddito Netto</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Contributi Inarcassa</div>
                            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Imposte Fiscali</div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 bg-red-50 rounded-md px-3 py-2 text-red-700 hover:bg-red-100 transition-colors">Reset Calcolo</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Calcolo</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inarcassa.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Sito Ufficiale Inarcassa</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/regime-forfettario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneIngArchitettiCalculator;