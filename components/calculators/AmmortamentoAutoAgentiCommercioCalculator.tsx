'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

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
      "name": "Perché la deduzione dell'ammortamento auto per agenti di commercio è ridotta il primo anno?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "È una convenzione fiscale (Art. 102 del TUIR) che semplifica i calcoli. Il coefficiente di ammortamento viene ridotto alla metà (12,5%) nel primo esercizio, indipendentemente dalla data di acquisto, estendendo il periodo di ammortamento a 5 anni."
      }
    },
    {
      "@type": "Question",
      "name": "Qual è il costo massimo fiscalmente riconosciuto per l'auto di un agente di commercio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Il costo massimo sul quale è possibile calcolare l'ammortamento è fissato a € 25.822,84. Qualsiasi importo superiore a questa cifra non è fiscalmente deducibile tramite ammortamento."
      }
    },
    {
      "@type": "Question",
      "name": "Questo calcolatore vale anche per le auto in leasing o a noleggio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, questo strumento è specifico per le auto acquistate in proprietà. Il leasing e il noleggio a lungo termine seguono regole di deducibilità diverse basate sui canoni periodici, pur applicando gli stessi limiti di costo e la percentuale di deducibilità dell'80%."
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
        .replace(/_(.*?)_/g, '<em>$1</em>');
    };

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('* **')) {
                    const parts = trimmedBlock.split('**:');
                    return (<p key={index} className="mb-4">
                        <strong className="text-gray-800">{parts[0].replace('* **', '')}:</strong>
                        <span dangerouslySetInnerHTML={{ __html: processInlineFormatting(parts.slice(1).join(':')) }} />
                    </p>);
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
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

// --- Dati di configurazione del calcolatore (incollati dal JSON) ---
const calculatorData = {
  "slug": "ammortamento-auto-agenti-commercio",
  "category": "Auto e Trasporti",
  "title": "Calcolatore Ammortamento Fiscale Auto per Agenti di Commercio",
  "lang": "it",
  "inputs": [
    {
      "id": "costo_acquisto",
      "label": "Costo di Acquisto del Veicolo",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 100,
      "tooltip": "Inserire il costo di acquisto del veicolo, IVA esclusa. Gli agenti di commercio beneficiano della detraibilità totale dell'IVA, che quindi non costituisce un costo ai fini dell'ammortamento."
    }
  ],
  "outputs": [
    { "id": "quota_deducibile_anno1", "label": "Quota Deducibile - Anno 1", "unit": "€" },
    { "id": "quota_deducibile_anno2", "label": "Quota Deducibile - Anno 2", "unit": "€" },
    { "id": "quota_deducibile_anno3", "label": "Quota Deducibile - Anno 3", "unit": "€" },
    { "id": "quota_deducibile_anno4", "label": "Quota Deducibile - Anno 4", "unit": "€" },
    { "id": "quota_deducibile_anno5", "label": "Quota Deducibile - Anno 5", "unit": "€" },
    { "id": "totale_deducibile", "label": "Totale Deducibile in 5 Anni", "unit": "€" },
    { "id": "costo_non_ammortizzabile", "label": "Costo Eccedente Non Ammortizzabile", "unit": "€" }
  ],
  "content": "### **Guida Completa all'Ammortamento Fiscale dell'Auto per Agenti di Commercio**\n\n**Analisi Normativa, Criteri di Calcolo e Vantaggi Fiscali**\n\nPer un agente o rappresentante di commercio, l'automobile non è un semplice mezzo di trasporto, ma il principale **bene strumentale** per l'esercizio della propria attività. Il legislatore fiscale italiano riconosce questa specificità garantendo un regime di deducibilità dei costi auto significativamente più vantaggioso rispetto ad altre categorie di professionisti o imprese.\n\nQuesto documento offre una guida esaustiva e autorevole sul calcolo dell'ammortamento, spiegando il funzionamento del calcolatore e approfondendo i principi normativi sottostanti. L'obiettivo è fornire uno strumento chiaro e preciso, ricordando che **nessun calcolatore può sostituire una consulenza fiscale personalizzata**, ma può fungere da eccellente punto di partenza per una pianificazione consapevole.\n\n### **Parte 1: Il Calcolatore - Come Interpretare i Risultati**\n\nIl nostro strumento automatizza il calcolo del piano di ammortamento fiscale, un processo che ripartisce il costo di acquisto dell'auto su più anni, consentendo di dedurre una quota di tale costo dal reddito imponibile di ogni esercizio.\n\nI parametri fondamentali su cui si basa il calcolo sono stabiliti dall'**Art. 164 del Testo Unico delle Imposte sui Redditi (TUIR)**.\n\n* **Input Richiesto**: L'unico dato necessario è il **costo di acquisto del veicolo al netto dell'IVA**. Per gli agenti di commercio, l'IVA pagata sull'acquisto è **interamente detraibile** (100%) e, pertanto, non rappresenta un costo da ammortizzare.\n\n* **Output del Calcolo**:\n    * **Piano di Ammortamento (Anni 1-5)**: Mostra la quota di costo che è possibile dedurre fiscalmente per ciascuno dei cinque anni del processo di ammortamento.\n    * **Totale Deducibile**: La somma complessiva che verrà recuperata fiscalmente nell'arco dei cinque anni.\n    * **Costo Eccedente Non Ammortizzabile**: Indica la porzione del costo di acquisto che supera il limite massimo riconosciuto dalla legge e che, di conseguenza, non può essere dedotta.\n\n### **Parte 2: La Normativa Fiscale nel Dettaglio**\n\nIl calcolo dell'ammortamento per gli agenti di commercio si fonda su tre pilastri normativi:\n\n1.  **Costo Massimo Fiscalmente Riconosciuto**: La legge fissa un tetto massimo al costo dell'autovettura sul quale è possibile calcolare le deduzioni. Questo limite è pari a **€ 25.822,84**. Se un agente acquista un'auto da € 40.000, i calcoli per l'ammortamento verranno eseguiti come se l'auto fosse costata € 25.822,84. La differenza (€ 14.177,16) è fiscalmente irrilevante ai fini dell'ammortamento.\n\n2.  **Percentuale di Deducibilità**: Gli agenti di commercio possono dedurre l'**80%** dei costi relativi all'auto. Questa percentuale, che riconosce un uso promiscuo del veicolo (sia lavorativo che personale), si applica sia alle quote di ammortamento sia a tutte le altre spese (carburante, manutenzione, assicurazione, pedaggi).\n\n3.  **Coefficiente di Ammortamento**: Il coefficiente ordinario per le autovetture è del **25%** annuo, il che implica un periodo di ammortamento teorico di 4 anni. Tuttavia, la normativa prevede una regola specifica per il primo anno:\n    * **Primo Anno**: Il coefficiente è **ridotto alla metà (12,5%)**, indipendentemente dalla data di acquisto durante l'anno. Questa riduzione comporta che il processo di ammortamento si estenda su un totale di 5 anni per essere completato.\n\n#### **Esempio di Calcolo Manuale**\n\nIpotizziamo l'acquisto di un'auto al costo di € 30.000 (IVA esclusa).\n\n* **Base di Calcolo**: Il costo supera il limite. Si utilizza quindi il valore massimo di € 25.822,84.\n\n* **Anno 1**:\n    * *Quota Ammortamento*: € 25.822,84 * 12,5% = € 3.227,86\n    * *Quota Deducibile (80%)*: € 3.227,86 * 80% = **€ 2.582,28**\n\n* **Anno 2, 3 e 4**:\n    * *Quota Ammortamento*: € 25.822,84 * 25% = € 6.455,71\n    * *Quota Deducibile (80%)*: € 6.455,71 * 80% = **€ 5.164,57** (per ogni anno)\n\n* **Anno 5**:\n    * *Quota Ammortamento* (saldo finale): € 25.822,84 * 12,5% = € 3.227,86\n    * *Quota Deducibile (80%)*: € 3.227,86 * 80% = **€ 2.582,28**\n\n### **Parte 3: Domande Frequenti (FAQ)**\n\n* **Perché il primo anno la deduzione è ridotta?**\n    Si tratta di una convenzione fiscale stabilita dalla normativa (Art. 102, comma 2, del TUIR) che si applica a tutti i beni strumentali per semplificare i calcoli, evitando di dover ragguagliare la quota al numero di giorni di possesso del bene nel primo esercizio.\n\n* **Cosa succede se vendo l'auto prima della fine dell'ammortamento?**\n    In caso di vendita, occorre calcolare una **plusvalenza** o **minusvalenza** fiscale. Questa è data dalla differenza tra il prezzo di vendita e il valore contabile non ancora ammortizzato del bene. La gestione di questa operazione richiede l'assistenza di un commercialista.\n\n* **Le stesse regole si applicano al leasing o al noleggio a lungo termine?**\n    No. Per il leasing e il noleggio a lungo termine (NLT) esistono regole di deducibilità specifiche che riguardano i canoni periodici, sempre nel rispetto dei limiti di costo e della percentuale dell'80%. Questo calcolatore è valido **solo per veicoli acquistati in proprietà**."
};

const AmmortamentoAutoAgentiCommercioCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = { costo_acquisto: 35000 };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => { setStates(initialStates); };

    const calculatedOutputs = useMemo(() => {
        const costo_acquisto = Number(states.costo_acquisto) || 0;

        const costo_massimo_riconosciuto = 25822.84;
        const percentuale_deducibilita = 0.80;
        const coefficiente_ordinario = 0.25;
        const coefficiente_primo_anno = coefficiente_ordinario / 2;

        const base_calcolo = Math.min(costo_acquisto, costo_massimo_riconosciuto);

        const ammortamento_civilistico_anno1_5 = base_calcolo * coefficiente_primo_anno;
        const ammortamento_civilistico_anno_2_3_4 = base_calcolo * coefficiente_ordinario;

        const quota_deducibile_anno1 = ammortamento_civilistico_anno1_5 * percentuale_deducibilita;
        const quota_deducibile_anno2 = ammortamento_civilistico_anno_2_3_4 * percentuale_deducibilita;
        const quota_deducibile_anno3 = quota_deducibile_anno2;
        const quota_deducibile_anno4 = quota_deducibile_anno2;
        const quota_deducibile_anno5 = quota_deducibile_anno1;
        
        const totale_deducibile = quota_deducibile_anno1 + (quota_deducibile_anno2 * 3) + quota_deducibile_anno5;
        const costo_non_ammortizzabile = Math.max(0, costo_acquisto - base_calcolo);

        return {
            quota_deducibile_anno1,
            quota_deducibile_anno2,
            quota_deducibile_anno3,
            quota_deducibile_anno4,
            quota_deducibile_anno5,
            totale_deducibile,
            costo_non_ammortizzabile,
        };
    }, [states]);

    const chartData = [
        { name: 'Anno 1', QuotaDeducibile: calculatedOutputs.quota_deducibile_anno1 },
        { name: 'Anno 2', QuotaDeducibile: calculatedOutputs.quota_deducibile_anno2 },
        { name: 'Anno 3', QuotaDeducibile: calculatedOutputs.quota_deducibile_anno3 },
        { name: 'Anno 4', QuotaDeducibile: calculatedOutputs.quota_deducibile_anno4 },
        { name: 'Anno 5', QuotaDeducibile: calculatedOutputs.quota_deducibile_anno5 },
    ];
    
    const formulaUsata = `Quota Deducibile Anno Normale = MIN(Costo Auto, 25.822,84€) * 25% * 80%`;

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
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md" ref={calcolatoreRef}>
                        <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">Calcola il piano di ammortamento quinquennale e il vantaggio fiscale per la tua auto aziendale.</p>
                             <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale. I calcoli si basano sulla normativa vigente per agenti e rappresentanti di commercio.
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                                {inputs.map(input => (
                                    <div key={input.id} className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Piano di Ammortamento Fiscale</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {outputs.slice(0, 5).map(output => (
                                    <div key={output.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="text-sm font-medium text-gray-600">{output.label}</div>
                                        <div className="text-2xl font-bold text-indigo-600 mt-1">
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {outputs.slice(5).map(output => (
                                    <div key={output.id} className={`p-4 rounded-lg ${output.id === 'totale_deducibile' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-4`}>
                                        <div className="text-sm font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-2xl font-bold ${output.id === 'totale_deducibile' ? 'text-green-700' : 'text-red-700'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-6 bg-slate-50 rounded-b-lg">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Quote Deducibili per Anno</h3>
                            <div className="h-64 w-full pt-4">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}/>
                                            <Legend />
                                            <Bar dataKey="QuotaDeducibile" name="Quota Deducibile" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Riferimento (Anni 2-4)</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                        <p className="text-xs text-gray-500 mt-2">Nota: Per il 1° e 5° anno il coefficiente è ridotto al 12,5%.</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 917/1986 (TUIR), Art. 164</a> - Limiti di deduzione delle spese e degli altri componenti negativi relativi a taluni mezzi di trasporto.</li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 917/1986 (TUIR), Art. 102</a> - Ammortamento dei beni materiali.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default AmmortamentoAutoAgentiCommercioCalculator;