'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Bollo Auto e Superbollo 2025: Calcolo Online",
  description: "Calcola l'importo esatto del bollo auto e del superbollo in base a kW, classe Euro e anno. Guida completa a tariffe, scadenze e riduzioni."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
            "name": "Dove trovo i kW e la classe Euro della mia auto?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Trovi la potenza in kilowatt (kW) alla voce P.2 del libretto di circolazione. La classe ambientale (es. Euro 6) è indicata alla voce V.9."
            }
          },
          {
            "@type": "Question",
            "name": "Cosa succede se pago il bollo auto in ritardo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "In caso di pagamento tardivo, si applica una sanzione crescente in base ai giorni di ritardo, più gli interessi legali. È possibile regolarizzare la propria posizione tramite il 'ravvedimento operoso' per ottenere sanzioni ridotte."
            }
          },
          {
            "@type": "Question",
            "name": "Le auto elettriche o ibride pagano il bollo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Le auto elettriche sono esenti dal bollo per i primi 5 anni dall'immatricolazione a livello nazionale, dopodiché pagano un quarto dell'importo. Molte regioni offrono esenzioni più lunghe o permanenti. Anche le auto ibride godono di agevolazioni regionali variabili (solitamente 3 o 5 anni di esenzione)."
            }
          },
          {
            "@type": "Question",
            "name": "Come si calcola la riduzione del Superbollo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il Superbollo si riduce progressivamente con l'età del veicolo. La riduzione è del 40% dopo 5 anni, del 70% dopo 10 anni e del 85% dopo 15 anni. Dopo 20 anni dall'immatricolazione, il Superbollo non è più dovuto."
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
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
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
                if (trimmedBlock.startsWith('|')) {
                    const rows = trimmedBlock.split('\n').map(row => row.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()));
                    const header = rows[0];
                    const body = rows.slice(2);
                    return (
                         <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {header.map((th, i) => <th key={i} className="p-2 border text-left font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(th) }} />)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {body.map((row, i) => (
                                        <tr key={i}>
                                            {row.map((td, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(td) }} />)}
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

// Dati di configurazione del calcolatore
const calculatorData = {
  "slug": "bollo-auto-e-superbollo",
  "category": "Auto e Trasporti",
  "title": "Calcolatore Bollo Auto e Superbollo",
  "lang": "it",
  "inputs": [
    {
      "id": "potenza_kw", "label": "Potenza del Veicolo (kW)", "type": "number" as const, "unit": "kW", "min": 1, "step": 1,
      "tooltip": "Inserisci la potenza in kilowatt (kW) come riportata alla voce P.2 del libretto di circolazione."
    },
    {
      "id": "classe_euro", "label": "Classe Ambientale", "type": "select" as const, "options": ["Euro 0", "Euro 1", "Euro 2", "Euro 3", "Euro 4", "Euro 5", "Euro 6"],
      "tooltip": "Seleziona la classe ambientale (es. Euro 6), indicata alla voce V.9 del libretto di circolazione."
    },
    {
      "id": "data_immatricolazione", "label": "Data di Prima Immatricolazione", "type": "date" as const,
      "tooltip": "Inserisci la data completa per calcolare l'anzianità del veicolo e la riduzione del Superbollo (se applicabile)."
    }
  ],
  "outputs": [
    { "id": "importo_bollo", "label": "Importo Bollo Auto", "unit": "€" },
    { "id": "importo_superbollo", "label": "Importo Superbollo (se applicabile)", "unit": "€" },
    { "id": "totale_dovuto", "label": "Totale Annuo Dovuto", "unit": "€" }
  ],
  "content": "### **Guida Completa al Bollo Auto e Superbollo\n\n**Analisi dei Criteri di Calcolo, Scadenze e Normative Vigenti**\n\nIl bollo auto è una tassa di possesso regionale che grava su tutti i veicoli a motore immatricolati in Italia. A questa, per i veicoli di maggiore potenza, si aggiunge il Superbollo, un'addizionale erariale statale. La complessità del calcolo deriva da diversi fattori, tra cui la potenza del motore, la classe ambientale e l'anzianità del veicolo.\n\nQuesto strumento offre un calcolo preciso e immediato basato sulle normative nazionali, fornendo al contempo una guida completa per comprendere ogni aspetto della tassa automobilistica. **Ricorda che il calcolo ha valore puramente informativo** e non sostituisce una verifica ufficiale tramite i servizi ACI o dell'Agenzia delle Entrate, che possono tenere conto di specifiche normative regionali.\n\n### **Parte 1: Come Funziona il Calcolatore**\n\nIl nostro calcolatore utilizza i dati fondamentali del veicolo per determinare l'importo esatto del bollo e dell'eventuale superbollo. I parametri richiesti sono essenziali e si trovano tutti nel libretto di circolazione.\n\n* **Potenza del Veicolo (kW)**: È il valore più importante. Lo trovi alla **voce P.2** del libretto. Il costo del bollo è calcolato per ogni singolo kilowatt di potenza.\n* **Classe Ambientale (Euro)**: Indica il livello di emissioni del veicolo (es. Euro 6). Questo dato, presente alla **voce V.9**, determina la tariffa applicata per kW. Veicoli più inquinanti pagano di più.\n* **Data di Prima Immatricolazione**: Indicata alla **voce B** del libretto, è cruciale per il calcolo del Superbollo, il cui importo si riduce progressivamente con l'invecchiare del veicolo.\n\n### **Parte 2: Il Calcolo del Bollo Auto nel Dettaglio**\n\nIl bollo si calcola moltiplicando la potenza in kW per una tariffa unitaria che varia in base alla classe ambientale. Per potenze superiori a 100 kW, la tariffa per i kW eccedenti è maggiorata.\n\n#### **Tabella Tariffe Nazionali Bollo Auto (€/kW)**\n\n| Classe Euro | Fino a 100 kW | Oltre 100 kW |\n| :--- | :--- | :--- |\n| Euro 0 | 3,00 € | 4,50 € |\n| Euro 1 | 2,90 € | 4,35 € |\n| Euro 2 | 2,80 € | 4,20 € |\n| Euro 3 | 2,70 € | 4,05 € |\n| Euro 4, 5, 6 | 2,58 € | 3,87 € |\n\n**Esempio di Calcolo**: Un'auto Euro 6 da 120 kW pagherà (100 kW * 2,58 €) + (20 kW * 3,87 €) = 258 € + 77,40 € = 335,40 €.\n\n#### **Esenzioni e Riduzioni**\n\nEsistono diverse forme di esenzione dal pagamento del bollo, tra cui:\n\n1.  **Veicoli per disabili**: Esenzione totale per veicoli intestati a persone con disabilità o a chi se ne prende cura fiscalmente (Legge 104).\n2.  **Veicoli ecologici**: Molte regioni prevedono esenzioni temporanee (3 o 5 anni) o permanenti per auto elettriche, a GPL o metano.\n3.  **Veicoli storici**: Le auto con più di 30 anni sono esenti. Se circolanti, pagano una tassa di circolazione forfettaria. Per i veicoli tra 20 e 29 anni con certificato di rilevanza storica, la riduzione è del 50%.\n\n### **Parte 3: Il Superbollo, la Tassa sulle Alte Potenze**\n\nIl Superbollo è un'addizionale statale introdotta per i veicoli con potenza superiore a **185 kW**.\n\n* **Costo**: Si pagano **20 € per ogni kW** che eccede la soglia di 185 kW.\n* **Calcolo**: (Potenza in kW - 185) * 20 €.\n\nL'importo del Superbollo non è fisso, ma si riduce in base all'anzianità del veicolo, calcolata a partire dall'anno di costruzione (che si fa coincidere con l'anno di immatricolazione).\n\n#### **Schema di Riduzione del Superbollo**\n\n| Anzianità del veicolo | Riduzione | Importo per kW extra |\n| :--- | :--- | :--- |\n| Dopo 5 anni | 40% | 12,00 € |\n| Dopo 10 anni | 70% | 6,00 € |\n| Dopo 15 anni | 85% | 3,00 € |\n| Dopo 20 anni | 100% | **Non è più dovuto** |\n\n**Esempio di Calcolo**: Un'auto da 221 kW immatricolata da 6 anni pagherà un superbollo su (221 - 185) = 36 kW. L'importo pieno sarebbe 36 * 20€ = 720€. Con la riduzione del 40%, l'importo dovuto è 720€ * 60% = 432€.\n\n### **Parte 4: Scadenze, Pagamenti e Sanzioni**\n\nIl bollo auto deve essere pagato entro l'ultimo giorno del mese successivo a quello di scadenza (es. scadenza Aprile, pagamento entro il 31 Maggio). Per i veicoli nuovi, il primo bollo va pagato entro il mese di immatricolazione.\n\nIl pagamento può essere effettuato tramite:\n* Servizi online (ACI, Satispay, home banking)\n* Tabaccherie e ricevitorie Lottomatica\n* Uffici postali\n\nIn caso di **pagamento tardivo**, si applica il meccanismo del **ravvedimento operoso**, che prevede sanzioni e interessi ridotti in base al ritardo. Un ritardo di oltre un anno comporta l'applicazione della sanzione piena del 30% dell'importo, oltre agli interessi legali."
};

const BolloAutoESuperbolloCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const getInitialDate = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 4);
        return date.toISOString().split('T')[0];
    };

    const initialStates = {
        potenza_kw: 110,
        classe_euro: "Euro 6",
        data_immatricolazione: getInitialDate()
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { potenza_kw, classe_euro, data_immatricolazione } = states;

        const tariffeBollo: { [key: string]: { fino100: number; oltre100: number } } = {
            "Euro 0": { fino100: 3.00, oltre100: 4.50 },
            "Euro 1": { fino100: 2.90, oltre100: 4.35 },
            "Euro 2": { fino100: 2.80, oltre100: 4.20 },
            "Euro 3": { fino100: 2.70, oltre100: 4.05 },
            "Euro 4": { fino100: 2.58, oltre100: 3.87 },
            "Euro 5": { fino100: 2.58, oltre100: 3.87 },
            "Euro 6": { fino100: 2.58, oltre100: 3.87 }
        };

        // Calcolo Bollo
        const tariffa = tariffeBollo[classe_euro] || tariffeBollo["Euro 6"];
        const kw = Number(potenza_kw) || 0;
        const bolloFino100 = Math.min(kw, 100) * tariffa.fino100;
        const bolloOltre100 = Math.max(0, kw - 100) * tariffa.oltre100;
        const importo_bollo = bolloFino100 + bolloOltre100;

        // Calcolo Superbollo
        let importo_superbollo = 0;
        if (kw > 185) {
            const immatricolazione = new Date(data_immatricolazione);
            const oggi = new Date();
            const anni = oggi.getFullYear() - immatricolazione.getFullYear();

            let moltiplicatoreSuperbollo = 1;
            if (anni >= 20) moltiplicatoreSuperbollo = 0;
            else if (anni >= 15) moltiplicatoreSuperbollo = 0.15; // Riduzione 85%
            else if (anni >= 10) moltiplicatoreSuperbollo = 0.30; // Riduzione 70%
            else if (anni >= 5) moltiplicatoreSuperbollo = 0.60;  // Riduzione 40%

            const kwExtra = kw - 185;
            importo_superbollo = kwExtra * 20 * moltiplicatoreSuperbollo;
        }

        const totale_dovuto = importo_bollo + importo_superbollo;

        return { importo_bollo, importo_superbollo, totale_dovuto };
    }, [states]);

    const chartData = [
        { name: 'Tasse', 'Bollo': calculatedOutputs.importo_bollo, 'Superbollo': calculatedOutputs.importo_superbollo },
    ];

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4", putOnlyUsedFonts: true });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) {
            alert("Errore durante l'esportazione in PDF.");
        }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch {
            alert("Impossibile salvare il risultato.");
        }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Calcola l'importo della tassa automobilistica e dell'addizionale erariale per i veicoli potenti.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima a scopo puramente informativo basata sulle tariffe nazionali. Le normative regionali potrebbero prevedere variazioni. Verificare sempre gli importi ufficiali sui portali ACI e Agenzia delle Entrate.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'select') {
                                    return (
                                        <div key={input.id}>
                                            {inputLabel}
                                            <select
                                                id={input.id}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                                value={states[input.id]}
                                                onChange={(e) => handleStateChange(input.id, e.target.value)}
                                            >
                                                {input.options?.map(option => <option key={option} value={option}>{option}</option>)}
                                            </select>
                                        </div>
                                    );
                                }
                                
                                 return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="flex items-center gap-2">
                                            <input
                                                id={input.id}
                                                aria-label={input.label}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                                type={input.type}
                                                min={input.min}
                                                step={input.step}
                                                value={states[input.id]}
                                                onChange={(e) => handleStateChange(input.id, input.type === 'date' ? e.target.value : (e.target.value === "" ? "" : Number(e.target.value)))}
                                            />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8 space-y-4">
                             <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'totale_dovuto' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'totale_dovuto' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8">
                             <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione Costi</h3>
                            <div className="h-64 w-full bg-gray-50/80 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                            <XAxis type="number" tickFormatter={(value) => `€${value}`} />
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(230, 230, 230, 0.4)'}}/>
                                            <Legend />
                                            <Bar dataKey="Bollo" stackId="a" fill="#4f46e5" name="Bollo Auto" />
                                            <Bar dataKey="Superbollo" stackId="a" fill="#dc2626" name="Superbollo" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Guida alla Tassa Automobilistica</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/pagamenti/bollo-auto" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Bollo Auto</a></li>
                            <li><a href="http://www.aci.it/i-servizi/guide-utili/guida-al-bollo-auto.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ACI - Guida al Bollo Auto</a></li>
                             <li><a href="https://www.gazzettaufficiale.it/eli/id/2011/12/06/011G0256/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Decreto Legge n. 201/2011 (Salva Italia)</a> - Art. 16, per l'istituzione del Superbollo.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default BolloAutoESuperbolloCalculator;