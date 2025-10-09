'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export const meta = {
    title: "Calcolatore Tassazione Affitti Brevi (Cedolare Secca 21% e 26%) | Guida 2025",
    description: "Calcola le tasse sui tuoi affitti brevi con le nuove aliquote 21% e 26%. Confronta la convenienza della cedolare secca rispetto alla tassazione IRPEF e ottimizza il tuo guadagno netto."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
                        "name": "Cosa succede se affitto più di 4 appartamenti?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "L'attività di locazione breve si presume svolta in forma imprenditoriale. È obbligatorio aprire una Partita IVA e non è più possibile usufruire del regime della cedolare secca."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Le commissioni pagate ad Airbnb o Booking.com sono un costo deducibile?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, se si sceglie il regime della cedolare secca. Questo è uno dei principali svantaggi. Tutti i costi (commissioni, pulizie, utenze) non possono essere scaricati."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "La ritenuta del 21% applicata dal portale è la mia tassa finale?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, è un acconto. Se il tuo reddito da affitti brevi ricade nell'aliquota del 26% (per immobili successivi al primo), dovrai versare la differenza del 5% in sede di dichiarazione dei redditi. Se invece affitti solo un immobile, la ritenuta coincide con l'imposta finale."
                        }
                    }
                ]
            })
        }}
    />
);

// --- Componente per il rendering del contenuto Markdown ---
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
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                 if (trimmedBlock.startsWith('**D:')) {
                    const parts = trimmedBlock.split('*R:');
                    return (
                        <div key={index} className="my-4">
                            <p className="font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(parts[0]) }} />
                            <p dangerouslySetInnerHTML={{ __html: processInlineFormatting(parts[1]) }} />
                        </div>
                    );
                }
                if (trimmedBlock.includes("Tipo di Tassazione")) {
                    const rows = trimmedBlock.split('\n').slice(1);
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 border text-left">Tipo di Tassazione</th>
                                        <th className="p-2 border text-left">Vantaggi</th>
                                        <th className="p-2 border text-left">Svantaggi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => {
                                        const cells = row.split('- ');
                                        return (
                                        <tr key={i}>
                                            <td className="p-2 border font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cells[0]) }} />
                                            <td className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cells.slice(1, 4).join('<br>- ')) }} />
                                            <td className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cells.slice(4).join('<br>- ')) }} />
                                        </tr>
                                    )})}
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

// Dati di configurazione del calcolatore
const calculatorData = {
    "slug": "tassazione-affitti-brevi",
    "category": "Fisco e Lavoro Autonomo",
    "title": "Calcolatore Tassazione per Redditi da Affitti Brevi (Cedolare Secca 21% e 26%)",
    "lang": "it",
    "inputs": [
        { "id": "reddito_primo_immobile", "label": "Reddito Lordo Annuo 1° Immobile", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il reddito lordo totale incassato dagli ospiti per il primo immobile (o l'unico). L'aliquota agevolata del 21% si applica solo su questo." },
        { "id": "reddito_altri_immobili", "label": "Reddito Lordo Altri Immobili (2°-4°)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il reddito lordo totale degli altri immobili destinati ad affitti brevi (fino a un massimo di 4 in totale). Su questi si applica l'aliquota del 26%." },
        { "id": "vuoi_confronto_irpef", "label": "Mostra confronto con Tassazione IRPEF?", "type": "boolean" as const, "tooltip": "Seleziona per confrontare la convenienza della Cedolare Secca rispetto al regime di tassazione ordinaria IRPEF." },
        { "id": "altri_redditi_irpef", "label": "Altri Redditi IRPEF Annuali", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "condition": "vuoi_confronto_irpef == true", "tooltip": "Inserisci il tuo reddito imponibile totale da altre fonti (lavoro dipendente, pensione, etc.) per calcolare l'aliquota IRPEF marginale corretta." },
        { "id": "costi_deducibili_irpef", "label": "Costi Deducibili su Affitti", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "condition": "vuoi_confronto_irpef == true", "tooltip": "Solo per il confronto IRPEF. Inserisci i costi deducibili legati all'immobile (es. quote di ristrutturazione, interessi passivi mutuo). Nota: le commissioni dei portali non sono direttamente deducibili in questo regime." }
    ],
    "outputs": [
        { "id": "imposta_cedolare", "label": "Imposta Totale con Cedolare Secca", "unit": "€" },
        { "id": "netto_cedolare", "label": "Reddito Netto con Cedolare Secca", "unit": "€" },
        { "id": "imposta_irpef", "label": "Stima Imposta con Tassazione IRPEF", "unit": "€", "condition": "vuoi_confronto_irpef == true" },
        { "id": "netto_irpef", "label": "Stima Reddito Netto con IRPEF", "unit": "€", "condition": "vuoi_confronto_irpef == true" },
        { "id": "risparmio_cedolare", "label": "Risparmio Stimato con Cedolare Secca", "unit": "€", "condition": "vuoi_confronto_irpef == true" }
    ],
    "content": "### **Guida Completa alla Cedolare Secca per Affitti Brevi (Aliquote 21% e 26%)**\n\n**Analisi Normativa, Criteri di Calcolo e Confronto di Convenienza con il Regime IRPEF**\n\nLa tassazione dei redditi derivanti dalle locazioni brevi è un tema centrale per migliaia di proprietari in Italia. La Legge di Bilancio 2024 ha introdotto importanti novità, modificando il panorama della **cedolare secca**, il regime fiscale agevolato più diffuso. \n\nQuesto strumento di calcolo, aggiornato alle ultime normative, non solo quantifica l'imposta dovuta ma funge da guida autorevole per comprendere a fondo le regole, i vantaggi e gli svantaggi di questa opzione fiscale. L'obiettivo è fornire una risorsa superiore per chiarezza e completezza, fermo restando che **nessun calcolatore può sostituire una consulenza fiscale personalizzata**.\n\n### **Parte 1: Il Calcolatore - Logica e Parametri Essenziali**\n\nIl calcolatore simula l'impatto fiscale della cedolare secca e lo confronta con la tassazione ordinaria IRPEF, basandosi sui dati inseriti. I parametri fondamentali riflettono le novità normative.\n\n* **Reddito da Primo Immobile (Aliquota 21%)**: La normativa prevede un'aliquota agevolata al 21% sul reddito generato da **una singola unità immobiliare** scelta dal contribuente.\n* **Reddito da Altri Immobili (Aliquota 26%)**: Per i redditi derivanti da locazioni brevi di immobili successivi al primo (dal secondo al quarto), l'aliquota dell'imposta sostitutiva sale al 26%.\n* **Confronto con l'IRPEF**: Per valutare la convenienza, il calcolatore stima la tassazione ordinaria. Questa include l'IRPEF calcolata per scaglioni progressivi sul reddito imponibile (ridotto forfettariamente del 5%), sommata agli altri redditi, e le addizionali regionali e comunali.\n\n### **Parte 2: Guida Approfondita alla Cedolare Secca**\n\n#### **Cos'è la Cedolare Secca per Affitti Brevi?**\n\nÈ un regime di tassazione facoltativo che sostituisce l'IRPEF e le relative addizionali. Il proprietario paga un'imposta fissa (appunto, del 21% o 26%) sul 100% del canone di locazione lordo incassato. Scegliendo questo regime, si rinuncia alla possibilità di dedurre qualsiasi costo relativo all'immobile (es. commissioni dei portali, spese di pulizia, utenze, manutenzione).\n\n#### **Chi Può Accedere e a Quali Condizioni**\n\n1.  **Soggetti Ammessi**: Solo le persone fisiche che agiscono al di fuori dell'esercizio di attività d'impresa.\n2.  **Numero di Immobili**: È possibile applicare la cedolare secca per un massimo di **4 appartamenti** locati per periodo d'imposta. Superata questa soglia, l'attività è considerata imprenditoriale e richiede l'apertura di una Partita IVA.\n3.  **Tipo di Contratto**: Contratti di locazione di immobili a uso abitativo di durata non superiore a 30 giorni.\n4.  **Intermediari Immobiliari e Portali Online**: La legge (art. 4 del D.L. 50/2017) obbliga gli intermediari – inclusi i portali come Airbnb e Booking.com – ad operare una **ritenuta del 21%** a titolo di acconto sull'imposta dovuta e a trasmettere i dati all'Agenzia delle Entrate. Il proprietario dovrà poi versare il saldo (se l'aliquota finale è del 26%) o potrà recuperare l'eventuale eccesso in dichiarazione dei redditi.\n\n### **Parte 3: Cedolare Secca vs. Tassazione Ordinaria IRPEF: Un Confronto**\n\nLa scelta del regime fiscale è cruciale e dipende dalla situazione reddituale complessiva del contribuente.\n\nTipo di Tassazione- Vantaggi- Svantaggi\n**Cedolare Secca**- **Semplicità**: Aliquota fissa sul 100% del reddito.- **Nessuna Addizionale**: Non si pagano addizionali regionali e comunali.- **Isolamento del Reddito**: Il reddito da locazione non si cumula con altri redditi, evitando di far scattare scaglioni IRPEF più alti.- **Impossibilità di dedurre i costi**: Il principale svantaggio. Tutti i costi (commissioni, utenze, manutenzione) restano a carico del proprietario e non riducono la base imponibile.\n**Tassazione Ordinaria IRPEF**- **Deduzione Forfettaria**: La base imponibile è il 95% del canone (deduzione forfettaria del 5%).- **Deduzione Altri Costi**: Possibilità di dedurre specifici oneri (es. interessi passivi del mutuo, spese di ristrutturazione).- **Complessità**: Il reddito si cumula con gli altri, ed è tassato secondo gli scaglioni IRPEF progressivi (dal 23% al 43%).- **Pagamento Addizionali**: Si applicano le addizionali regionali e comunali.- **Impatto su Altri Benefici**: L'aumento del reddito complessivo può influenzare il diritto ad altre detrazioni o benefici fiscali.\n\n### **FAQ - Domande Frequenti (Schema.org)**\n\n**D: Se affitto più di 4 appartamenti cosa succede?**\n*R: L'attività di locazione breve si presume svolta in forma imprenditoriale. È obbligatorio aprire una Partita IVA e non è più possibile usufruire del regime della cedolare secca.*\n\n**D: Le commissioni pagate ad Airbnb o Booking.com sono un costo deducibile?**\n*R: No, se si sceglie il regime della cedolare secca. Questa è una delle principali ragioni per cui è necessario fare un calcolo di convenienza. Con la tassazione ordinaria IRPEF, la questione è complessa e generalmente non sono deducibili per le locazioni non imprenditoriali, salvo la deduzione forfettaria del 5% sul canone.*\n\n**D: La ritenuta del 21% applicata dal portale è la mia tassa finale?**\n*R: No, è un acconto. Se il tuo reddito da affitti brevi ricade nell'aliquota del 26% (per immobili successivi al primo), dovrai versare la differenza del 5% in sede di dichiarazione dei redditi. Se invece affitti solo un immobile, la ritenuta coincide con l'imposta finale.*"
};

const TassazioneAffittiBreviCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates: { [key: string]: any } = {
        reddito_primo_immobile: 8000,
        reddito_altri_immobili: 0,
        vuoi_confronto_irpef: true,
        altri_redditi_irpef: 30000,
        costi_deducibili_irpef: 500,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculateIRPEF = (reddito: number): number => {
        if (reddito <= 0) return 0;
        // Scaglioni IRPEF 2024/2025 (3 scaglioni)
        if (reddito <= 28000) {
            return reddito * 0.23;
        } else if (reddito <= 50000) {
            return 28000 * 0.23 + (reddito - 28000) * 0.35;
        } else {
            return 28000 * 0.23 + 22000 * 0.35 + (reddito - 50000) * 0.43;
        }
    };
    
    const calculatedOutputs = useMemo(() => {
        const { reddito_primo_immobile, reddito_altri_immobili, vuoi_confronto_irpef, altri_redditi_irpef, costi_deducibili_irpef } = states;

        const reddito_totale_affitti = Number(reddito_primo_immobile) + Number(reddito_altri_immobili);
        const imposta_cedolare_primo = Number(reddito_primo_immobile) * 0.21;
        const imposta_cedolare_altri = Number(reddito_altri_immobili) * 0.26;
        const imposta_cedolare = imposta_cedolare_primo + imposta_cedolare_altri;
        const netto_cedolare = reddito_totale_affitti - imposta_cedolare;

        let imposta_irpef = 0, netto_irpef = 0, risparmio_cedolare = 0;

        if (vuoi_confronto_irpef) {
            const base_imponibile_irpef = Math.max(0, (reddito_totale_affitti * 0.95) - Number(costi_deducibili_irpef));
            const reddito_complessivo_irpef = Number(altri_redditi_irpef) + base_imponibile_irpef;
            
            const irpef_su_totale = calculateIRPEF(reddito_complessivo_irpef);
            const irpef_su_altri_redditi = calculateIRPEF(Number(altri_redditi_irpef));
            
            const irpef_incrementale = irpef_su_totale - irpef_su_altri_redditi;
            const addizionali_stimate = base_imponibile_irpef * 0.025; // Stima media 2.5%

            imposta_irpef = irpef_incrementale + addizionali_stimate;
            netto_irpef = reddito_totale_affitti - imposta_irpef;
            risparmio_cedolare = imposta_irpef - imposta_cedolare;
        }
        
        return { imposta_cedolare, netto_cedolare, imposta_irpef, netto_irpef, risparmio_cedolare, reddito_totale_affitti };
    }, [states]);

    const chartData = [
        { name: 'Netto Cedolare', value: calculatedOutputs.netto_cedolare, fill: '#4f46e5' },
        ...(states.vuoi_confronto_irpef ? [{ name: 'Netto IRPEF', value: calculatedOutputs.netto_irpef, fill: '#ef4444' }] : []),
    ];

    const formulaUsata = `Imposta Cedolare = (Reddito 1° Imm. * 0.21) + (Reddito Altri Imm. * 0.26)`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { reddito_totale_affitti, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
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
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Calcola le imposte sui tuoi affitti brevi con le aliquote 2025 e confronta i regimi fiscali.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale professionale. Le aliquote IRPEF e le normative sono soggette a modifiche.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                              {input.label}
                                              {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                            </label>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => {
                                const conditionMet = !output.condition || (output.condition.includes('== true') && states[output.condition.split(' ')[0]]);
                                if (!conditionMet) return null;
                                
                                const isPositiveSaving = output.id === 'risparmio_cedolare' && (calculatedOutputs as any)[output.id] > 0;
                                const isNegativeSaving = output.id === 'risparmio_cedolare' && (calculatedOutputs as any)[output.id] < 0;

                                return (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'risparmio_cedolare' ? (isPositiveSaving ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500') : (output.id === 'imposta_cedolare' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300')}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'risparmio_cedolare' ? (isPositiveSaving ? 'text-green-600' : 'text-red-600') : (output.id === 'imposta_cedolare' ? 'text-indigo-600' : 'text-gray-800')}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Guadagno Netto</h3>
                             <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <XAxis type="number" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                            <YAxis type="category" dataKey="name" width={100} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(230, 230, 230, 0.5)'}} />
                                            <Bar dataKey="value" barSize={35}>
                                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 border rounded-lg shadow-inner p-4 bg-slate-50">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-white rounded font-mono break-words">{formulaUsata}</p>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/le-locazioni-brevi-e-la-cedolare-secca" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Locazioni Brevi</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2017-04-24;50!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Art. 4, D.L. 24 aprile 2017, n. 50</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneAffittiBreviCalculator;