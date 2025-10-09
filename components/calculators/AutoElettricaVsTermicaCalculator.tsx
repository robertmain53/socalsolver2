'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const meta = {
  title: "Calcolatore Convenienza Auto Elettrica vs. Termica (con incentivi)",
  description: "Confronta il costo totale di possesso (TCO) di un'auto elettrica e una termica. Scopri il risparmio e il punto di pareggio con il nostro calcolatore interattivo."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
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
            "name": "L'auto elettrica conviene davvero?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La convenienza di un'auto elettrica dipende da molti fattori, tra cui il chilometraggio annuo, la possibilità di ricaricare a casa e gli incentivi disponibili. Generalmente, più chilometri si percorrono, più velocemente si ammortizza il costo iniziale maggiore grazie al risparmio su carburante e manutenzione."
            }
          },
          {
            "@type": "Question",
            "name": "Cos'è il Costo Totale di Possesso (TCO)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il TCO (Total Cost of Ownership) è un calcolo finanziario che include non solo il prezzo di acquisto di un'auto, ma anche tutti i costi operativi durante il suo ciclo di vita: carburante/energia, bollo, assicurazione, manutenzione e svalutazione. È l'indicatore più accurato per confrontare la convenienza reale tra due veicoli."
            }
          },
          {
            "@type": "Question",
            "name": "Dopo quanti anni si raggiunge il punto di pareggio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il punto di pareggio (break-even point) è il momento in cui il risparmio accumulato con l'auto elettrica eguaglia il suo maggior costo d'acquisto. Questo calcolatore stima il tempo necessario. Tipicamente, può variare da 3 a 7 anni, a seconda dell'uso e dei modelli confrontati."
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

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                 if (trimmedBlock.match(/^\d\.\s/)) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                    return (
                        <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ol>
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
  "slug": "auto-elettrica-vs-termica",
  "category": "Auto e Trasporti",
  "title": "Calcolatore Convenienza Auto Elettrica vs. Termica (con incentivi)",
  "lang": "it",
  "inputs": [
    { "id": "anni_possesso", "label": "Periodo di analisi", "type": "number" as const, "unit": "anni", "min": 1, "step": 1, "tooltip": "Per quanti anni prevedi di tenere l'auto? Questo è il fattore chiave per calcolare il costo totale di possesso (TCO)." },
    { "id": "km_annui", "label": "Chilometri percorsi all'anno", "type": "number" as const, "unit": "km", "min": 1000, "step": 1000, "tooltip": "Una stima realistica dei km che percorri annualmente. Influirà notevolmente sui costi di carburante ed energia." },
    { "id": "prezzo_acquisto_termica", "label": "Prezzo di listino auto termica", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Il prezzo di listino del veicolo a benzina, diesel o ibrido che stai considerando, IVA inclusa." },
    { "id": "prezzo_acquisto_elettrica", "label": "Prezzo di listino auto elettrica", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Il prezzo di listino del veicolo 100% elettrico (BEV), IVA inclusa, prima di applicare gli incentivi." },
    { "id": "incentivi_statali", "label": "Incentivi statali (Ecobonus)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "L'importo dell'Ecobonus statale a cui hai diritto. Varia in base all'ISEE e alla rottamazione. Inserisci 0 se non applicabile." },
    { "id": "consumo_termica", "label": "Consumo medio auto termica", "type": "number" as const, "unit": "l/100km", "min": 1, "step": 0.1, "tooltip": "Il consumo di carburante dichiarato o reale del veicolo termico. Esempio: 5.5 l/100km." },
    { "id": "costo_carburante", "label": "Costo medio carburante", "type": "number" as const, "unit": "€/l", "min": 0.1, "step": 0.01, "tooltip": "Il prezzo medio alla pompa per un litro di benzina o diesel." },
    { "id": "consumo_elettrica", "label": "Consumo medio auto elettrica", "type": "number" as const, "unit": "kWh/100km", "min": 1, "step": 0.1, "tooltip": "Il consumo energetico dichiarato o reale del veicolo elettrico. Esempio: 15.5 kWh/100km." },
    { "id": "percentuale_ricarica_casa", "label": "% ricarica domestica", "type": "number" as const, "unit": "%", "min": 0, "max": 100, "step": 5, "tooltip": "La percentuale di ricariche che prevedi di fare a casa, dove il costo dell'energia è inferiore." },
    { "id": "costo_energia_casa", "label": "Costo energia domestica", "type": "number" as const, "unit": "€/kWh", "min": 0.01, "step": 0.01, "tooltip": "Il costo di un kWh dalla tua bolletta elettrica, tutto compreso. Generalmente tra 0.15€ e 0.30€." },
    { "id": "costo_energia_colonnina", "label": "Costo energia colonnine pubbliche", "type": "number" as const, "unit": "€/kWh", "min": 0.01, "step": 0.01, "tooltip": "Il costo medio di un kWh presso le stazioni di ricarica pubbliche (AC e DC). Generalmente tra 0.40€ e 0.90€." },
    { "id": "costo_bollo_termica", "label": "Costo bollo annuale (Termica)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "L'importo annuale della tassa di possesso per il veicolo termico." },
    { "id": "costo_manutenzione_termica", "label": "Costo manutenzione annuale (Termica)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Costo medio annuale per tagliandi, cambi olio e manutenzione ordinaria del veicolo termico." },
    { "id": "costo_assicurazione_termica", "label": "Costo assicurazione annuale (Termica)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Il premio annuale della polizza RC Auto per il veicolo termico." },
    { "id": "costo_manutenzione_elettrica", "label": "Costo manutenzione annuale (Elettrica)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Costo medio annuale per controlli e manutenzione ordinaria del veicolo elettrico (solitamente inferiore del 30-40%)." },
    { "id": "costo_assicurazione_elettrica", "label": "Costo assicurazione annuale (Elettrica)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Il premio annuale della polizza RC Auto. Molte compagnie offrono sconti per le auto elettriche." },
    { "id": "installazione_wallbox", "label": "Costo installazione Wallbox", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Costo una tantum per l'acquisto e l'installazione di una stazione di ricarica domestica. Inserisci 0 se non prevista." }
  ],
  "outputs": [
    { "id": "costo_totale_termica", "label": "Costo Totale di Possesso (Termica)", "unit": "€" },
    { "id": "costo_totale_elettrica", "label": "Costo Totale di Possesso (Elettrica)", "unit": "€" },
    { "id": "risparmio_totale_elettrica", "label": "Risparmio Totale con l'Elettrica", "unit": "€" },
    { "id": "break_even_point", "label": "Punto di Pareggio (Break-Even)", "unit": "anni" }
  ],
  "content": "### **Guida Definitiva: L'Auto Elettrica Conviene Davvero?**\n\n**Un'analisi completa dei costi, dei vantaggi e del punto di pareggio per una scelta consapevole.**\n\nIl passaggio alla mobilità elettrica è una delle decisioni più dibattute dagli automobilisti oggi. Se da un lato l'assenza di emissioni locali e i minori costi di \"rifornimento\" sono un forte richiamo, dall'altro il prezzo d'acquisto più elevato e l'ansia da autonomia generano dubbi. L'obiettivo di questo strumento e di questa guida è andare oltre le opinioni, fornendo un'analisi quantitativa basata sui dati per rispondere alla domanda: **nel tuo caso specifico, l'auto elettrica conviene?**\n\nQuesto calcolatore analizza il **Costo Totale di Possesso (TCO - Total Cost of Ownership)**, l'unico vero indicatore per confrontare due veicoli. Il TCO non si limita al prezzo d'acquisto, ma include tutte le spese che sosterrai durante il ciclo di vita dell'auto: carburante/energia, bollo, assicurazione, manutenzione e incentivi.\n\n### **Parte 1: I Fattori Chiave del Calcolo - Spiegazione dei Parametri**\n\nPer ottenere una stima accurata, è fondamentale comprendere il peso di ogni variabile.\n\n* **Prezzo di Listino e Incentivi**: L'ostacolo maggiore per l'elettrico è il costo iniziale. Gli **incentivi statali (Ecobonus)** e, talvolta, regionali, sono cruciali per ridurre questo divario. Il loro importo varia in base a fasce di prezzo, emissioni e alla rottamazione di un vecchio veicolo.\n\n* **Chilometraggio Annuo**: È il fattore più importante. **Più chilometri percorri, più il risparmio sul costo per km dell'elettrico diventa significativo**, accelerando il raggiungimento del punto di pareggio.\n\n* **Costo del \"Pieno\"**: Qui si gioca la partita principale. \n    * **Termica**: Il costo è legato al prezzo (volatile) del carburante alla pompa.\n    * **Elettrica**: Il costo dipende da *dove* ricarichi. La **ricarica domestica** è la soluzione più economica, con un costo per kWh definito dalla propria tariffa energetica. Le **colonnine pubbliche** hanno costi maggiori, specialmente quelle ultra-veloci (HPC), ma sono indispensabili per i lunghi viaggi.\n\n* **Costi Fissi Annuali**:\n    * **Bollo Auto**: Le auto elettriche godono di un'**esenzione totale dal bollo per i primi 5 anni** in tutta Italia. In alcune regioni (es. Lombardia, Piemonte) l'esenzione è permanente.\n    * **Assicurazione**: Molte compagnie assicurative offrono **sconti sulla polizza RC Auto** per i veicoli elettrici, riconoscendone la minor incidentalità statistica.\n    * **Manutenzione**: L'architettura più semplice di un'auto elettrica (assenza di olio, filtri, cinghie di distribuzione, scarico) si traduce in costi di **manutenzione ordinaria inferiori del 30-40%** rispetto a un'auto termica.\n\n### **Parte 2: Analisi Approfondita - Oltre i Numeri**\n\nLa convenienza non è solo economica. Esistono vantaggi e svantaggi che il nostro calcolatore non può quantificare ma che sono determinanti nella scelta.\n\n#### **Vantaggi Aggiuntivi dell'Auto Elettrica**\n\n1.  **Accesso a Zone a Traffico Limitato (ZTL)**: Molti comuni italiani consentono l'accesso gratuito alle ZTL per i veicoli elettrici.\n2.  **Parcheggio Gratuito**: Diverse città offrono la sosta gratuita sulle strisce blu.\n3.  **Piacere di Guida**: La silenziosità, l'assenza di vibrazioni e l'accelerazione istantanea (coppia motrice subito disponibile) offrono un'esperienza di guida superiore.\n4.  **Sostenibilità Ambientale**: Le auto elettriche azzerano le emissioni di inquinanti locali (PM10, NOx) e riducono drasticamente le emissioni di CO2 complessive, specialmente se ricaricate con energia da fonti rinnovabili.\n\n#### **Considerazioni e Svantaggi**\n\n1.  **Infrastruttura di Ricarica**: Se non hai la possibilità di installare una wallbox a casa o in garage, dipendere esclusivamente dalle colonnine pubbliche può essere più costoso e meno pratico.\n2.  **Autonomia e Lunghi Viaggi**: Sebbene le autonomie medie siano in costante aumento (oggi 300-400 km reali sono la norma), i lunghi viaggi richiedono una pianificazione delle soste per la ricarica, che sono più lunghe di un rifornimento di benzina.\n3.  **Valore Residuo**: Il mercato dell'usato elettrico è ancora in evoluzione. La rapida progressione tecnologica potrebbe portare a una svalutazione più veloce dei modelli più vecchi, anche se la tenuta del valore sta migliorando.\n\n### **Parte 3: Il Punto di Pareggio (Break-Even Point)**\n\nIl risultato più interessante del calcolatore è il **punto di pareggio**: il momento (espresso in anni) in cui il risparmio accumulato sui costi di gestione dell'auto elettrica ha completamente compensato il suo maggior costo d'acquisto. \n\n**Se il tuo periodo di possesso previsto è superiore al break-even point, la scelta dell'elettrico è economicamente vantaggiosa.**\n\n### **Conclusione: A Chi Conviene l'Auto Elettrica Oggi?**\n\nBasandosi su un'analisi TCO, l'auto elettrica è particolarmente conveniente per:\n\n* Chi percorre **molti chilometri all'anno** (es. pendolari, agenti di commercio).\n* Chi ha la possibilità di **ricaricare prevalentemente a casa**, sfruttando una tariffa energetica conveniente (magari abbinata a un impianto fotovoltaico).\n* Chi intende **tenere l'auto per un periodo medio-lungo** (superiore ai 4-5 anni), permettendo di ammortizzare il costo iniziale.\n* Chi vive o lavora in grandi città e può beneficiare di **accessi a ZTL e parcheggi gratuiti**.\n\nQuesto calcolatore è un punto di partenza. Usalo per simulare diversi scenari, confronta i modelli e prendi una decisione informata e basata sui dati che meglio si adatta alle tue esigenze di mobilità."
};


const AutoElettricaVsTermicaCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        anni_possesso: 8,
        km_annui: 15000,
        prezzo_acquisto_termica: 22000,
        prezzo_acquisto_elettrica: 35000,
        incentivi_statali: 6000,
        consumo_termica: 6,
        costo_carburante: 1.9,
        consumo_elettrica: 16,
        percentuale_ricarica_casa: 80,
        costo_energia_casa: 0.25,
        costo_energia_colonnina: 0.6,
        costo_bollo_termica: 250,
        costo_manutenzione_termica: 350,
        costo_assicurazione_termica: 500,
        costo_manutenzione_elettrica: 150,
        costo_assicurazione_elettrica: 400,
        installazione_wallbox: 1500
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { anni_possesso, km_annui, prezzo_acquisto_termica, prezzo_acquisto_elettrica, incentivi_statali, consumo_termica, costo_carburante, consumo_elettrica, percentuale_ricarica_casa, costo_energia_casa, costo_energia_colonnina, costo_bollo_termica, costo_manutenzione_termica, costo_assicurazione_termica, costo_manutenzione_elettrica, costo_assicurazione_elettrica, installazione_wallbox } = states;

        const costo_acquisto_effettivo_termica = prezzo_acquisto_termica;
        const costo_acquisto_effettivo_elettrica = prezzo_acquisto_elettrica - incentivi_statali;
        
        const costo_carburante_annuo = (km_annui / 100) * consumo_termica * costo_carburante;
        const costo_energia_annuo = ((km_annui / 100) * consumo_elettrica) * ((percentuale_ricarica_casa / 100 * costo_energia_casa) + ((100 - percentuale_ricarica_casa) / 100 * costo_energia_colonnina));
        
        const costo_gestione_annuale_termica = costo_carburante_annuo + costo_bollo_termica + costo_manutenzione_termica + costo_assicurazione_termica;
        const costo_gestione_annuale_elettrica = costo_energia_annuo + costo_manutenzione_elettrica + costo_assicurazione_elettrica;
        
        const costo_totale_termica = costo_acquisto_effettivo_termica + (costo_gestione_annuale_termica * anni_possesso);
        const costo_totale_elettrica = costo_acquisto_effettivo_elettrica + installazione_wallbox + (costo_gestione_annuale_elettrica * anni_possesso);

        const risparmio_totale_elettrica = costo_totale_termica - costo_totale_elettrica;

        const differenza_costo_acquisto = (costo_acquisto_effettivo_elettrica + installazione_wallbox) - costo_acquisto_effettivo_termica;
        const differenza_costo_gestione_annuale = costo_gestione_annuale_termica - costo_gestione_annuale_elettrica;

        const break_even_point = differenza_costo_gestione_annuale > 0 ? (differenza_costo_acquisto / differenza_costo_gestione_annuale) : -1;

        return {
            costo_totale_termica,
            costo_totale_elettrica,
            risparmio_totale_elettrica,
            break_even_point
        };
    }, [states]);

    const chartData = useMemo(() => {
        return [
            { name: 'Acquisto', Termica: states.prezzo_acquisto_termica, Elettrica: states.prezzo_acquisto_elettrica - states.incentivi_statali + states.installazione_wallbox },
            { name: 'Costi Gestione Totali', Termica: (calculatedOutputs.costo_totale_termica - states.prezzo_acquisto_termica), Elettrica: (calculatedOutputs.costo_totale_elettrica - (states.prezzo_acquisto_elettrica - states.incentivi_statali + states.installazione_wallbox)) },
        ]
    }, [states, calculatedOutputs]);
    

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4", putOnlyUsedFonts:true });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Impossibile generare il PDF in questo ambiente."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo nel browser!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatNumber = (value: number, decimalPlaces: number) => new Intl.NumberFormat('it-IT', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-lg" ref={calcolatoreRef}>
                        <div className="p-6 md:p-8">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-6">Analizza il costo totale di possesso (TCO) e scopri quando l'auto elettrica diventa più conveniente.</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-8">
                                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non costituisce una consulenza finanziaria. I costi reali possono variare.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {inputs.map(input => (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id={input.id}
                                                aria-label={input.label}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                                type="number"
                                                min={input.min}
                                                max={input.max}
                                                step={input.step}
                                                value={states[input.id]}
                                                onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                                            />
                                            {input.unit && <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 pointer-events-none">{input.unit}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Risultati della Simulazione</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'risparmio_totale_elettrica' && calculatedOutputs.risparmio_totale_elettrica > 0 ? 'bg-green-50 border-l-4 border-green-500' : (output.id === 'risparmio_totale_elettrica' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50 border-l-4 border-gray-300')}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'risparmio_totale_elettrica' && calculatedOutputs.risparmio_totale_elettrica > 0 ? 'text-green-600' : (output.id === 'risparmio_totale_elettrica' ? 'text-red-600' : 'text-gray-800')}`}>
                                            {isClient ? (
                                                output.unit === '€' ? formatCurrency(Math.abs((calculatedOutputs as any)[output.id])) :
                                                (calculatedOutputs as any)[output.id] < 0 || (calculatedOutputs as any)[output.id] > 100 ? 'Mai' : `${formatNumber((calculatedOutputs as any)[output.id], 1)} ${output.unit}`
                                            ) : '...'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Confronto Costi Totali (Acquisto + Gestione)</h3>
                                <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                                <YAxis type="category" dataKey="name" width={80} />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                                <Bar dataKey="Termica" fill="#f87171" />
                                                <Bar dataKey="Elettrica" fill="#60a5fa" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800 text-lg">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-center bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-center bg-gray-700 text-white rounded-md px-4 py-2 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-center bg-white border border-red-500 text-red-600 rounded-md px-4 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Campi</button>
                        </div>
                    </section>
                     <section className="border rounded-lg p-6 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800 text-lg">Guida alla Comprensione</h2>
                         <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-6 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800 text-lg">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://ecobonus.mise.gov.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ecobonus - Ministero delle Imprese e del Made in Italy</a></li>
                            <li><a href="https://www.aci.it/i-servizi/guide-utili/guida-al-bollo-auto/regioni-e-province-autonome-convenzionate-con-aci/esenzioni-per-veicoli-ecologici.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ACI - Esenzioni Bollo Auto per Veicoli Ecologici</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default AutoElettricaVsTermicaCalculator;