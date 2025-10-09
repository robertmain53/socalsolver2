'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Detrazione 19% Interessi Mutuo Prima Casa | IRPEF 2025",
  description: "Calcola con precisione il risparmio fiscale (detrazione IRPEF del 19%) sugli interessi passivi del tuo mutuo prima casa. Aggiornato alle ultime normative."
};

// --- Icona per i Tooltip (SVG inline) ---
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
          "name": "A quanto ammonta la detrazione per gli interessi del mutuo prima casa?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "La detrazione è pari al 19% degli interessi passivi e degli oneri accessori pagati, calcolata su un importo massimo di 4.000 euro all'anno. Il risparmio fiscale massimo è quindi di 760 euro (19% di 4.000 €)."
          }
        },
        {
          "@type": "Question",
          "name": "Cosa succede se il mutuo è cointestato?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Se il mutuo è cointestato, il limite massimo di spesa di 4.000 euro viene suddiviso tra tutti gli intestatari. Ad esempio, con due intestatari, ciascuno può detrarre il 19% su un importo massimo di 2.000 euro."
          }
        },
        {
          "@type": "Question",
          "name": "Cosa significa la regola del 'pro-rata'?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Se l'importo del mutuo concesso dalla banca è superiore al costo di acquisto dell'immobile, è possibile detrarre solo una parte proporzionale degli interessi. La proporzione si calcola con la formula: (Costo Acquisto / Importo Mutuo)."
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
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                if (block.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/### \*\*|\*\*/g, '')) }} />;
                if (block.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/#### \*\*|\*\*/g, '')) }} />;
                if (block.match(/^\d\.\s/)) {
                    const items = block.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                    return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
                }
                if (block.startsWith('*')) {
                    const items = block.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (block) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block) }} />;
                return null;
            })}
        </div>
    );
};


// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "detrazione-interessi-mutuo-prima-casa", "category": "Immobiliare e Casa", "title": "Calcolatore Detrazione Interessi Passivi Mutuo Prima Casa", "lang": "it",
  "inputs": [
    {"id": "interessi_e_oneri_annui", "label": "Interessi Passivi e Oneri Accessori pagati nell'anno", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo totale che trovi nella certificazione annuale della banca. Include sia gli interessi passivi che gli oneri accessori detraibili."},
    {"id": "importo_mutuo_originario", "label": "Importo Totale del Mutuo Erogato", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Indica l'importo originario concesso dalla banca, come risulta dal contratto di mutuo."},
    {"id": "costo_acquisto_immobile", "label": "Costo di Acquisto dell'Immobile (incluso oneri)", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il costo totale sostenuto per l'acquisto, comprensivo di rogito notarile, imposte (IVA, registro) e altre spese accessorie."},
    {"id": "is_cointestato", "label": "Il mutuo è cointestato?", "type": "boolean" as const, "tooltip": "Seleziona se il contratto di mutuo è intestato a più persone. Questo influisce sulla ripartizione del limite di detrazione."},
    {"id": "numero_intestatari", "label": "Numero Totale Intestatari del Mutuo", "type": "number" as const, "unit": "persone", "min": 2, "step": 1, "condition": "is_cointestato == true", "tooltip": "Indica il numero totale di persone a cui è intestato il mutuo (es. 2 per una coppia)."},
    {"id": "percentuale_possesso", "label": "La tua percentuale di possesso dell'immobile", "type": "number" as const, "unit": "%", "min": 1, "max": 100, "step": 1, "tooltip": "Indica la tua quota di proprietà dell'immobile (es. 100% se sei unico proprietario, 50% se a metà con un'altra persona)."}
  ],
  "outputs": [
    {"id": "limite_massimo_spesa", "label": "Limite di Spesa Personale", "unit": "€"},
    {"id": "spesa_ammessa_detrazione", "label": "Importo Effettivo su cui si Calcola la Detrazione", "unit": "€"},
    {"id": "detrazione_irpef_annua", "label": "Detrazione IRPEF Annua (Risparmio Fiscale)", "unit": "€"},
    {"id": "risparmio_fiscale_mensile", "label": "Risparmio Fiscale Mensile Stimato", "unit": "€"}
  ],
  "content": "### **Guida Completa alla Detrazione degli Interessi del Mutuo Prima Casa**\n\n**Massimizza il Tuo Risparmio Fiscale: Criteri, Calcoli e Casi Pratici**\n\nL'acquisto di una prima casa è un passo importante, e il mutuo che lo accompagna rappresenta un impegno finanziario significativo. Fortunatamente, il sistema fiscale italiano prevede un'importante agevolazione: la **detrazione IRPEF del 19% sugli interessi passivi** e sugli oneri accessori. Capire come funziona questo meccanismo è essenziale per massimizzare il risparmio fiscale in sede di dichiarazione dei redditi (730 o Modello Redditi PF).\n\nQuesto calcolatore è stato progettato per andare oltre una semplice stima, guidandoti attraverso le regole complesse e fornendoti un risultato accurato e trasparente.\n\n**Disclaimer**: I risultati di questo calcolatore sono una simulazione basata sulla normativa vigente e non sostituiscono una consulenza fiscale professionale. Per la dichiarazione ufficiale, rivolgiti sempre a un CAF, a un commercialista o consulta le guide ufficiali dell'Agenzia delle Entrate.\n\n### **Parte 1: I Principi Fondamentali della Detrazione**\n\nPer avere diritto alla detrazione, devono essere rispettate alcune condizioni fondamentali. La logica del calcolo si basa su questi pilastri:\n\n1.  **L'Aliquota**: Puoi detrarre dall'IRPEF lorda il **19%** della spesa sostenuta.\n\n2.  **Il Limite di Spesa**: L'importo massimo di interessi passivi e oneri accessori su cui calcolare il 19% è **4.000 €** all'anno. Questo non è il risparmio, ma la base di calcolo. Il risparmio massimo è quindi 4.000 € * 19% = 760 €.\n\n3.  **L'Abitazione Principale**: L'immobile acquistato deve essere la tua \"abitazione principale\", ovvero il luogo dove tu e/o i tuoi familiari dimorate abitualmente. Hai **un anno di tempo** dalla data di acquisto per stabilirvi la residenza.\n\n4.  **Tempistiche**: Il contratto di mutuo deve essere stipulato nei **12 mesi antecedenti o successivi** alla data di acquisto dell'immobile.\n\n### **Parte 2: La Logica di Calcolo Spiegata Semplice**\n\nIl calcolo può sembrare complesso, ma segue una logica precisa per determinare la spesa effettivamente ammessa alla detrazione.\n\n#### **Caso 1: Mutuo Intestato a una Persona**\n\nIl limite di spesa è di 4.000 €. Se gli interessi pagati sono inferiori (es. 3.000 €), la detrazione sarà calcolata su 3.000 €. Se sono superiori (es. 5.000 €), la detrazione sarà calcolata sul massimo, cioè 4.000 €.\n\n#### **Caso 2: Mutuo Cointestato (es. due coniugi)**\nIl limite complessivo di 4.000 € viene suddiviso tra gli intestatari. Ad esempio, in due, il limite di spesa per ciascuno diventa **2.000 €**. Ognuno calcolerà la detrazione sulla propria quota di interessi, fino a un massimo di 2.000 €.\n\n#### **La Regola del Pro-Rata: Quando il Mutuo Supera il Costo**\n\nQuesta è la regola più importante e spesso trascurata. La detrazione spetta solo sulla parte di mutuo che ha finanziato l'acquisto dell'immobile e i suoi oneri.\n\n* **Esempio**: Hai ottenuto un mutuo di **150.000 €**, ma il costo totale dell'immobile (rogito incluso) è stato di **120.000 €**.\n\n* **Calcolo**: Si calcola il rapporto: `Costo / Mutuo` -> `120.000 / 150.000 = 0,8` (cioè l'80%).\n\n* **Conseguenza**: Potrai detrarre solo l'80% degli interessi passivi che hai pagato durante l'anno. Se hai pagato 4.000 € di interessi, la base per la detrazione diventa `4.000 * 0,8 = 3.200 €`."
};

const DetrazioneInteressiMutuoPrimaCasaCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        interessi_e_oneri_annui: 5200,
        importo_mutuo_originario: 220000,
        costo_acquisto_immobile: 200000,
        is_cointestato: true,
        numero_intestatari: 2,
        percentuale_possesso: 50
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { interessi_e_oneri_annui, importo_mutuo_originario, costo_acquisto_immobile, is_cointestato, numero_intestatari } = states;
        
        const ALIQUOTA_DETRAZIONE = 0.19;
        const LIMITE_SPESA_ASSOLUTO = 4000;
        
        const num_intestatari_effettivo = is_cointestato && numero_intestatari > 1 ? numero_intestatari : 1;

        const limite_massimo_spesa = LIMITE_SPESA_ASSOLUTO / num_intestatari_effettivo;

        const coefficiente_prorata = (importo_mutuo_originario > 0 && costo_acquisto_immobile < importo_mutuo_originario)
            ? costo_acquisto_immobile / importo_mutuo_originario
            : 1;

        const interessi_rettificati_totali = interessi_e_oneri_annui * coefficiente_prorata;
        const quota_interessi_personale = interessi_rettificati_totali / num_intestatari_effettivo;

        const spesa_ammessa_detrazione = Math.max(0, Math.min(quota_interessi_personale, limite_massimo_spesa));
        const detrazione_irpef_annua = spesa_ammessa_detrazione * ALIQUOTA_DETRAZIONE;
        const risparmio_fiscale_mensile = detrazione_irpef_annua / 12;

        return { limite_massimo_spesa, spesa_ammessa_detrazione, detrazione_irpef_annua, risparmio_fiscale_mensile, quota_interessi_personale };
    }, [states]);

    const chartData = [
        { name: 'Spesa Detraibile', 'Quota Interessi Personale': calculatedOutputs.quota_interessi_personale, 'Limite di Spesa': calculatedOutputs.limite_massimo_spesa, 'Spesa Ammessa': calculatedOutputs.spesa_ammessa_detrazione }
    ];

    const formulaUsata = `Detrazione = MIN(Quota Interessi, Limite Spesa) * 19%`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Errore durante l'esportazione PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { quota_interessi_personale, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato!");
        } catch { alert("Impossibile salvare."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6" ref={calcolatoreRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Calcola il tuo risparmio fiscale IRPEF del 19% sugli interessi del mutuo per la tua abitazione principale.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale qualificata.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                            </label>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} max={input.max} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'detrazione_irpef_annua' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'detrazione_irpef_annua' ? 'text-green-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualizzazione della Spesa Ammessa</h3>
                             <div className="h-64 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `€${value/1000}k`} />
                                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="Quota Interessi Personale" fill="#8884d8" name="Interessi di Competenza" />
                                        <Bar dataKey="Limite di Spesa" fill="#82ca9d" name="Limite di Legge" />
                                        <Bar dataKey="Spesa Ammessa" fill="#ffc658" name="Importo Usato per Detrazione" />
                                    </BarChart>
                                </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                         <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                         </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 text-red-700 rounded-md px-3 py-2 hover:bg-red-100 transition-colors">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/detrazione-interessi-mutui/scheda-informativa-interessi-mutui" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Guida Ufficiale</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">T.U.I.R. (D.P.R. 917/86), Art. 15</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default DetrazioneInteressiMutuoPrimaCasaCalculator;