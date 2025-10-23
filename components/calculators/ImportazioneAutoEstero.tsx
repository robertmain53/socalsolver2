'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Icona per i Tooltip ---
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
            "name": "Quanto costa immatricolare un'auto comprata in Germania?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il costo per importare e immatricolare un'auto dalla Germania include: l'eventuale IVA al 22% (solo se l'auto è considerata 'nuova'), l'Imposta Provinciale di Trascrizione (IPT) basata sui kW e sulla provincia, i costi di agenzia e trasporto, e le spese fisse di immatricolazione. Questo calcolatore fornisce una stima dettagliata di tutti questi costi."
            }
          },
          {
            "@type": "Question",
            "name": "Si deve pagare l'IVA su un'auto usata importata da un paese UE?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, per un veicolo considerato 'usato' (con più di 6 mesi di vita E più di 6.000 km percorsi), l'IVA si assolve nel paese d'origine e non è dovuta in Italia. Se il veicolo è 'nuovo' secondo i criteri fiscali, l'IVA al 22% deve essere versata in Italia tramite modello F24."
            }
          },
          {
            "@type": "Question",
            "name": "Cosa sono i dazi doganali sull'importazione di auto?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I dazi doganali sono imposte applicate sull'importazione di beni da paesi esterni all'Unione Europea (extra-UE). Per le autovetture, l'aliquota è tipicamente del 10% e si calcola sul valore del veicolo comprensivo delle spese di trasporto. Le importazioni da paesi UE sono esenti da dazi."
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
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
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

// --- Dati di configurazione e contenuto del calcolatore ---
const calculatorData = {
    slug: "importazione-auto-estero",
    title: "Calcolatore Costo Importazione Auto dall'Estero",
    lang: "it",
    inputs: [
        { id: "prezzo_veicolo", label: "Prezzo di Acquisto del Veicolo", type: "number" as const, unit: "€", min: 0, step: 1000, tooltip: "Inserisci il prezzo di acquisto netto del veicolo indicato nel contratto o nella fattura." },
        { id: "paese_provenienza", label: "Paese di Provenienza", type: "select" as const, options: [
            {value: 'de', label: 'Germania (UE)'},
            {value: 'fr', label: 'Francia (UE)'},
            {value: 'es', label: 'Spagna (UE)'},
            {value: 'ch', label: 'Svizzera (Extra-UE)'},
            {value: 'us', label: 'Stati Uniti (Extra-UE)'},
            {value: 'other_ue', label: 'Altro Paese UE'},
            {value: 'other_extra_ue', label: 'Altro Paese Extra-UE'},
        ], tooltip: "Seleziona il paese da cui stai importando l'auto. La scelta determina il calcolo di IVA e dazi." },
        { id: "veicolo_nuovo", label: "Il veicolo è fiscalmente 'nuovo'?", type: "boolean" as const, tooltip: "Un veicolo è 'nuovo' ai fini IVA se ha meno di 6 mesi O meno di 6.000 km. In questo caso l'IVA va versata in Italia." },
        { id: "potenza_kw", label: "Potenza del Veicolo (kW)", type: "number" as const, unit: "kW", min: 0, step: 1, tooltip: "Indica la potenza del motore in kiloWatt (kW), come riportato sul libretto di circolazione. È un dato fondamentale per il calcolo dell'IPT." },
        { id: "provincia_immatricolazione", label: "Provincia di Immatricolazione", type: "select" as const, options: [
            {value: 'rm', label: 'Roma'},
            {value: 'mi', label: 'Milano'},
            {value: 'na', label: 'Napoli'},
            {value: 'to', label: 'Torino'},
            {value: 'fi', label: 'Firenze'},
            {value: 've', label: 'Venezia'},
            {value: 'altre', label: 'Altre Province (media)'},
        ], tooltip: "Seleziona la provincia italiana dove verrà immatricolato il veicolo. L'IPT varia in base alla provincia." },
        { id: "costo_trasporto", label: "Costo Stimato del Trasporto", type: "number" as const, unit: "€", min: 0, step: 50, tooltip: "Inserisci il costo per trasportare il veicolo in Italia. Questo valore incide sulla base imponibile per dazi e IVA nei paesi Extra-UE." },
        { id: "costi_agenzia", label: "Costi di Agenzia/Intermediazione", type: "number" as const, unit: "€", min: 0, step: 50, tooltip: "Spese per l'agenzia di pratiche auto che si occuperà della burocrazia dell'immatricolazione in Italia." },
    ],
    outputs: [
        { id: "dazi_doganali", label: "Dazi Doganali (solo Extra-UE)", unit: "€" },
        { id: "iva_da_versare", label: "IVA al 22% da versare in Italia", unit: "€" },
        { id: "costo_ipt", label: "Imposta Provinciale di Trascrizione (IPT)", unit: "€" },
        { id: "costi_fissi_immatricolazione", label: "Costi Fissi (Targhe, ACI, etc.)", unit: "€" },
        { id: "costo_totale_importazione", label: "Costo Totale Burocrazia e Trasporto", unit: "€" },
        { id: "prezzo_finale_chiavi_in_mano", label: "Prezzo Finale Stimato 'Chiavi in Mano'", unit: "€" }
    ],
    content: `### **Guida Completa all'Importazione di Auto Estere**\n\n**Analisi dei Costi, Burocrazia e Procedure per un Acquisto Sicuro**\n\nImportare un'auto dall'estero può offrire grandi vantaggi in termini di prezzo e scelta, ma è fondamentale comprendere a fondo tutti i costi nascosti e gli step burocratici. Questo calcolatore è uno strumento di simulazione avanzato, progettato per darti una stima realistica del costo finale "chiavi in mano".\n\n**Disclaimer**: I risultati sono una stima accurata ma non sostituiscono una consulenza professionale. L'IPT e altre tasse possono subire leggere variazioni.\n\n### **Parte 1: Le Basi - UE vs. Extra-UE**\n\nLa prima, fondamentale distinzione riguarda la provenienza del veicolo:\n\n* **Da un Paese dell'Unione Europea (UE)**: La procedura è più semplice. Non ci sono dazi doganali. La questione principale riguarda il versamento dell'IVA.\n* **Da un Paese Extra-UE (es. Svizzera, USA)**: La procedura è più complessa e costosa. Prevede il pagamento di **dazi doganali** e dell'**IVA** calcolata sul valore totale (veicolo + trasporto + dazi).\n\n### **Parte 2: L'IVA - La Variabile più Importante**\n\nL'Imposta sul Valore Aggiunto (IVA) al 22% è spesso la spesa più significativa. Le regole cambiano in base a un criterio fiscale preciso:\n\n1.  **Veicolo considerato "Nuovo"**: Un'auto è fiscalmente nuova se ha **meno di 6 mesi di vita OPPURE ha percorso meno di 6.000 km**. In questo caso, anche se l'acquisti da un paese UE, **l'IVA al 22% deve essere versata in Italia** tramite modello F24 prima dell'immatricolazione.\n\n2.  **Veicolo considerato "Usato"**: Se l'auto ha **più di 6 mesi E più di 6.000 km**, non devi versare l'IVA in Italia se proviene da un paese UE, perché si considera assolta nel paese di origine.\n\n_Attenzione_: Per le importazioni Extra-UE, l'IVA è **sempre dovuta** in dogana, indipendentemente dal fatto che il veicolo sia nuovo o usato.\n\n### **Parte 3: I Costi Burocratici in Italia**\n\nUna volta che il veicolo è in Italia, ci sono diverse tasse fisse e variabili da sostenere:\n\n1.  **Imposta Provinciale di Trascrizione (IPT)**: È la tassa più pesante dopo l'IVA. Il suo importo dipende dalla **potenza in kW** del veicolo e dalla **provincia di residenza**. Ogni provincia può applicare una maggiorazione (fino al 30%) sull'importo base nazionale.\n\n2.  **Costi Fissi di Immatricolazione**: Comprendono una serie di voci:\n    * Emolumenti ACI (circa 27 €)\n    * Imposta di bollo per iscrizione al PRA (32 €)\n    * Imposta di bollo per la carta di circolazione (32 €)\n    * Costo delle targhe (circa 45-50 €)\n\n3.  **Costi di Agenzia**: A meno di non voler gestire personalmente una complessa trafila burocratica, è quasi indispensabile affidarsi a un'agenzia di pratiche auto specializzata.\n\n### **Parte 4: Esempio di Calcolo (Importazione dalla Germania)**\n\nIpotizziamo di importare un'auto usata dalla Germania con le seguenti caratteristiche:\n\n* **Prezzo di Acquisto**: 25.000 €\n* **Caratteristiche**: Auto usata (2 anni, 30.000 km) -> IVA non dovuta in Italia.\n* **Potenza**: 110 kW\n* **Provincia**: Milano\n* **Costi Extra**: 800 € trasporto, 600 € agenzia\n\n**Stima dei Costi**: \n1. **IVA**: 0 € (veicolo usato da UE)\n2. **Dazi**: 0 € (da UE)\n3. **IPT a Milano (110 kW)**: Circa 500 €\n4. **Costi Fissi**: Circa 150 €\n5. **Totale Burocrazia e Trasporto**: 500 (IPT) + 150 (Fissi) + 800 (Trasporto) + 600 (Agenzia) = 2.050 €\n6. **Costo Finale Chiavi in Mano**: 25.000 € + 2.050 € = **27.050 €**`
};

// --- Logica di Calcolo ---
const useCalculatorLogic = (states: { [key: string]: any }) => {
    return useMemo(() => {
        const { prezzo_veicolo, paese_provenienza, veicolo_nuovo, potenza_kw, provincia_immatricolazione, costo_trasporto, costi_agenzia } = states;

        // --- Costanti e Parametri ---
        const ALIQUOTA_IVA = 0.22;
        const ALIQUOTA_DAZI_AUTO = 0.10; // Standard per auto da extra-UE
        const COSTI_FISSI_IMMATRICOLAZIONE = 150; // Stima (Bolli, ACI, Targhe)
        const isExtraUE = ['ch', 'us', 'other_extra_ue'].includes(paese_provenienza);

        // --- Calcolo Dazi Doganali (solo per Extra-UE) ---
        let dazi_doganali = 0;
        if (isExtraUE) {
            const base_dazi = prezzo_veicolo + costo_trasporto;
            dazi_doganali = base_dazi * ALIQUOTA_DAZI_AUTO;
        }

        // --- Calcolo IVA ---
        let iva_da_versare = 0;
        if (isExtraUE) {
            const base_iva_extra_ue = prezzo_veicolo + costo_trasporto + dazi_doganali;
            iva_da_versare = base_iva_extra_ue * ALIQUOTA_IVA;
        } else if (veicolo_nuovo) {
            // Per UE, l'IVA si paga solo se il veicolo è nuovo
            iva_da_versare = prezzo_veicolo * ALIQUOTA_IVA;
        }

        // --- Calcolo IPT (Imposta Provinciale di Trascrizione) ---
        let costo_ipt = 0;
        if (potenza_kw > 0) {
            const ipt_base = potenza_kw <= 53 ? 150.81 : 196.00;
            const tariffa_kw_base = potenza_kw <= 53 ? 0 : 4.57; // Euro per ogni kW sopra i 53
            
            const maggiorazioniProvinciali = {
                mi: 1.3, rm: 1.3, na: 1.3, to: 1.3, fi: 1.3, ve: 1.3, altre: 1.25
            };

            // FIX: Assert the type of provincia_immatricolazione to be a key of the object
            const key = provincia_immatricolazione as keyof typeof maggiorazioniProvinciali;
            const maggiorazione_provinciale = maggiorazioniProvinciali[key] || 1.3;
            
            const parte_variabile = potenza_kw > 53 ? (potenza_kw - 53) * tariffa_kw_base : 0;
            costo_ipt = (ipt_base + parte_variabile) * maggiorazione_provinciale;
        }

        const costo_totale_importazione = dazi_doganali + iva_da_versare + costo_ipt + COSTI_FISSI_IMMATRICOLAZIONE + costo_trasporto + costi_agenzia;
        const prezzo_finale_chiavi_in_mano = prezzo_veicolo + costo_totale_importazione;
        
        return {
            dazi_doganali,
            iva_da_versare,
            costo_ipt,
            costi_fissi_immatricolazione: COSTI_FISSI_IMMATRICOLAZIONE,
            costo_totale_importazione,
            prezzo_finale_chiavi_in_mano,
        };
    }, [states]);
};


// --- Componente Principale ---
const ImportazioneAutoEstero: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      prezzo_veicolo: 30000,
      paese_provenienza: 'de',
      veicolo_nuovo: false,
      potenza_kw: 140,
      provincia_immatricolazione: 'mi',
      costo_trasporto: 800,
      costi_agenzia: 600,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useCalculatorLogic(states);
    
    const chartData = [
      { 
        name: 'Ripartizione Costo Finale', 
        'Prezzo Veicolo': states.prezzo_veicolo, 
        'IVA e Dazi': calculatedOutputs.iva_da_versare + calculatedOutputs.dazi_doganali, 
        'Burocrazia e Trasporto': calculatedOutputs.costo_ipt + calculatedOutputs.costi_fissi_immatricolazione + states.costo_trasporto + states.costi_agenzia
      },
    ];

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
            pdf.save(`${slug}_simulazione.pdf`);
        } catch (_e) { alert("Impossibile generare il PDF in questo ambiente."); }
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
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Stima il costo finale 'chiavi in mano' per immatricolare in Italia un veicolo acquistato all'estero.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale o di un'agenzia di pratiche auto.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }
                                if (input.type === 'select') {
                                    return (
                                        <div key={input.id}>
                                            {inputLabel}
                                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    )
                                }
                                return (
                                    <div key={input.id}>
                                        {inputLabel}
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
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'prezzo_finale_chiavi_in_mano' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'prezzo_finale_chiavi_in_mano' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Costo Finale</h3>
                            <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={chartData} stackOffset="expand">
                                            <XAxis type="number" hide tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}/>
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value, name, props) => {
                                                const total = states.prezzo_veicolo + calculatedOutputs.costo_totale_importazione;
                                                return `${(props.payload.value / total * 100).toFixed(2)}% (${formatCurrency(props.payload.value)})`;
                                            }} />
                                            <Legend formatter={(value) => <span className="text-gray-700 text-sm">{value}</span>} />
                                            <Bar dataKey="Prezzo Veicolo" stackId="a" fill="#4f46e5" />
                                            <Bar dataKey="IVA e Dazi" stackId="a" fill="#fca5a5" />
                                            <Bar dataKey="Burocrazia e Trasporto" stackId="a" fill="#818cf8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida all'Importazione</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.aci.it/i-servizi/guide-utili/guida-pratiche-auto/importare-un-veicolo.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ACI - Importare un veicolo</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/acquisti-di-autoveicoli-in-ambito-ue-f24/infogen-cessione-ue-di-autoveicoli-f24" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Acquisti veicoli UE</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default ImportazioneAutoEstero;