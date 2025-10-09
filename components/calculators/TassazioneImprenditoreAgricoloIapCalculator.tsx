'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
    title: "Calcolatore Tassazione per Imprenditore Agricolo (IAP)",
    description: "Calcola l'IRPEF e verifica le esenzioni IMU per i terreni agricoli. Simula la differenza fiscale tra IAP/Coltivatore Diretto e altri proprietari."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
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
                        "name": "Come si calcola l'IRPEF sui terreni agricoli?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "La base imponibile si ottiene rivalutando il reddito dominicale dell'80% e quello agrario del 70%. Tuttavia, gli Imprenditori Agricoli Professionali (IAP) e i Coltivatori Diretti (CD) sono esenti dal pagamento dell'IRPEF su questi redditi."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "L'imprenditore agricolo paga l'IMU sui terreni?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, i terreni agricoli posseduti e condotti da IAP e Coltivatori Diretti sono esenti dall'IMU. L'esenzione si applica anche a tutti i terreni situati in comuni classificati come montani."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Questo calcolatore vale per tutti i regimi fiscali agricoli?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. Questo strumento si basa esclusivamente sulla tassazione secondo i redditi catastali (dominicale e agrario). Non copre regimi fiscali basati sul fatturato reale, come il regime forfettario o la contabilità ordinaria."
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
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                 if (/^\d\.\s/.test(trimmedBlock)) {
                    const listItems = trimmedBlock.split('\n').map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />
                    ));
                    return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{listItems}</ol>;
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
  "slug": "tassazione-imprenditore-agricolo-iap",
  "category": "Agricoltura e Cibo",
  "title": "Calcolatore Tassazione per Imprenditore Agricolo (IAP)",
  "lang": "it",
  "inputs": [
    {
      "id": "reddito_dominicale",
      "label": "Reddito Dominicale",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 10,
      "tooltip": "Inserire il reddito dominicale del terreno come risulta dalla visura catastale. È il reddito legato alla proprietà del terreno."
    },
    {
      "id": "reddito_agrario",
      "label": "Reddito Agrario",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 10,
      "tooltip": "Inserire il reddito agrario del terreno come risulta dalla visura catastale. È il reddito legato all'esercizio dell'attività agricola."
    },
    {
      "id": "possesso_percentuale",
      "label": "Percentuale di Possesso",
      "type": "number" as const,
      "unit": "%",
      "min": 1,
      "max": 100,
      "step": 1,
      "tooltip": "Indicare la propria quota di proprietà del terreno. Se si è l'unico proprietario, inserire 100."
    },
    {
      "id": "is_iap_o_cd",
      "label": "Qualifica di IAP o Coltivatore Diretto",
      "type": "boolean" as const,
      "tooltip": "Spuntare se si è un Imprenditore Agricolo Professionale (IAP) o un Coltivatore Diretto (CD) iscritti alla previdenza agricola. Questa qualifica dà diritto a importanti agevolazioni fiscali."
    },
    {
      "id": "is_comune_montano",
      "label": "Terreno in Comune Montano",
      "type": "boolean" as const,
      "tooltip": "Spuntare se il terreno si trova in un comune classificato come 'totalmente montano' secondo l'elenco ISTAT. Questo comporta l'esenzione dall'IMU."
    }
  ],
  "outputs": [
    {
      "id": "base_imponibile_irpef",
      "label": "Base Imponibile IRPEF",
      "unit": "€"
    },
    {
      "id": "irpef_lorda",
      "label": "IRPEF Lorda Dovuta",
      "unit": "€"
    },
    {
      "id": "imu_esenzione",
      "label": "Esenzione IMU",
      "unit": ""
    }
  ],
  "content": "### **Guida Completa alla Tassazione dei Terreni Agricoli per IAP e Altri Soggetti**\n\nLa fiscalità agricola in Italia è un sistema complesso, caratterizzato da regimi speciali e agevolazioni significative volte a sostenere il settore primario. La tassazione del reddito prodotto dai terreni si basa su valori catastali – il **reddito dominicale** e il **reddito agrario** – e non sempre sul reddito effettivo. Questo calcolatore è progettato per offrire una stima chiara della tassazione IRPEF e delle esenzioni IMU, mettendo in evidenza le differenze cruciali tra un **Imprenditore Agricolo Professionale (IAP)** o **Coltivatore Diretto (CD)** e un proprietario non qualificato.\n\n**Disclaimer:** Questo strumento ha scopo puramente informativo. I risultati sono una simulazione e non sostituiscono una consulenza fiscale professionale, necessaria per valutare la situazione specifica e tutti i fattori personali.\n\n### **Parte 1: I Concetti Chiave del Calcolo**\n\nPer utilizzare correttamente il calcolatore, è fondamentale comprendere i dati di input:\n\n* **Reddito Dominicale (R.D.)**: È il reddito teorico attribuito al proprietario del terreno. Rappresenta la rendita catastale del fondo e dipende dalla qualità e classe del terreno. È, in sostanza, il reddito della \"terra nuda\".\n* **Reddito Agrario (R.A.)**: Rappresenta il reddito teorico derivante dall'esercizio dell'attività agricola sul fondo. È attribuito a chi coltiva il terreno (che può essere il proprietario o l'affittuario) e remunera il capitale di esercizio e il lavoro di organizzazione.\n* **Qualifica di IAP o Coltivatore Diretto**: È il fattore più importante. Gli IAP e i CD, iscritti alla previdenza agricola, beneficiano di un regime di favore che, come vedremo, azzera di fatto l'IRPEF sui redditi catastali.\n* **Comune Montano**: La localizzazione del terreno in un'area montana può comportare l'esenzione totale dal pagamento dell'IMU.\n\n### **Parte 2: La Logica Fiscale Spiegata Passo Passo**\n\nLa determinazione delle imposte segue un percorso preciso, che cambia radicalmente in base alla qualifica del contribuente.\n\n#### **A) Tassazione per Proprietari NON IAP / CD**\n\nPer un soggetto che possiede un terreno agricolo ma non ha le qualifiche di IAP o CD, la tassazione IRPEF si calcola come segue:\n\n1.  **Rivalutazione delle Rendite**: La base di partenza non sono i valori catastali puri, ma le loro rivalutazioni. La legge prevede:\n    * Rivalutazione del **Reddito Dominicale dell'80%**. (Formula: `RD * 1,80`)\n    * Rivalutazione del **Reddito Agrario del 70%**. (Formula: `RA * 1,70`)\n2.  **Calcolo della Base Imponibile**: La base imponibile IRPEF è la somma dei due redditi rivalutati, rapportata alla percentuale di possesso.\n    * Formula: `(RD * 1,80 + RA * 1,70) * (% Possesso / 100)`\n3.  **Applicazione degli Scaglioni IRPEF**: Sulla base imponibile così calcolata, si applicano le aliquote progressive IRPEF in vigore.\n\n#### **B) Tassazione per Imprenditori Agricoli Professionali (IAP) e Coltivatori Diretti (CD)**\n\nQui interviene la principale agevolazione. Per gli IAP e i CD iscritti alla previdenza agricola, i redditi dominicali e agrari **non concorrono alla formazione della base imponibile IRPEF** (ai sensi della Legge di Bilancio 2017, art. 1, c. 44, e successive proroghe).\n\n* **Base Imponibile IRPEF**: 0 € (limitatamente ai redditi catastali)\n* **IRPEF Lorda Dovuta**: 0 €\n\nQuesto significa che il reddito \"teorico\" del terreno è fiscalmente irrilevante ai fini IRPEF per chi fa dell'agricoltura la propria professione.\n\n#### **Imposta Municipale Unica (IMU)**\n\nAnche per l'IMU esistono importanti esenzioni:\n\n* **Esenzione per IAP e CD**: I terreni agricoli posseduti e condotti da IAP e CD sono esenti da IMU.\n* **Esenzione per Comuni Montani**: I terreni agricoli situati in comuni classificati come 'totalmente montani' sono esenti, indipendentemente da chi li possiede.\n\nSe non si rientra in queste categorie, l'IMU è dovuta e va calcolata applicando le aliquote stabilite dal Comune in cui si trova il terreno.\n\n### **Parte 3: Approfondimenti e Contesti**\n\n#### **Chi è l'Imprenditore Agricolo Professionale (IAP)?**\n\nÈ colui che dedica all'attività agricola almeno il 50% del proprio tempo di lavoro complessivo e che ricava da tale attività almeno il 50% del proprio reddito globale da lavoro. Deve possedere competenze professionali riconosciute.\n\n#### **Reddito Catastale vs. Reddito d'Impresa**\n\nÈ fondamentale non confondere il regime di tassazione basato sulle rendite catastali con la tassazione basata sul reddito d'impresa (regime di contabilità ordinaria o semplificata) o con il regime forfettario in agricoltura (basato sui ricavi). Questo calcolatore si applica **esclusivamente alla tassazione su base catastale**, che è la più comune per le persone fisiche e le società semplici.\n\nLe società di capitali (Srl, Spa) in agricoltura, invece, producono sempre reddito d'impresa e sono soggette a IRES."
};

const TassazioneImprenditoreAgricoloIapCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        reddito_dominicale: 500,
        reddito_agrario: 1000,
        possesso_percentuale: 100,
        is_iap_o_cd: true,
        is_comune_montano: false,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { reddito_dominicale, reddito_agrario, possesso_percentuale, is_iap_o_cd, is_comune_montano } = states;
        
        const rd_rivalutato = reddito_dominicale * 1.80;
        const ra_rivalutato = reddito_agrario * 1.70;
        const reddito_catastale_totale = (rd_rivalutato + ra_rivalutato) * (possesso_percentuale / 100);

        const base_imponibile_non_iap = reddito_catastale_totale;
        
        const calcolaIrpef = (base: number) => {
            if (base <= 28000) return base * 0.23;
            if (base <= 50000) return 6440 + (base - 28000) * 0.35;
            return 14140 + (base - 50000) * 0.43;
        };

        const irpef_lorda_non_iap = calcolaIrpef(base_imponibile_non_iap);
        const base_imponibile_irpef = is_iap_o_cd ? 0 : base_imponibile_non_iap;
        const irpef_lorda = is_iap_o_cd ? 0 : irpef_lorda_non_iap;
        const imu_esenzione = is_iap_o_cd || is_comune_montano;

        return { base_imponibile_irpef, irpef_lorda, imu_esenzione, irpef_lorda_non_iap };
    }, [states]);

    const chartData = [
        { name: 'Senza Qualifiche', IRPEF: calculatedOutputs.irpef_lorda_non_iap },
        { name: 'Con Qualifiche (IAP/CD)', IRPEF: 0 },
    ];
    
    const formulaUsata = states.is_iap_o_cd 
        ? "Esente: i redditi dominicale e agrario non concorrono alla base imponibile IRPEF."
        : "Base IRPEF = ((Reddito Dominicale * 1.80) + (Reddito Agrario * 1.70)) * % Possesso";
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

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
        } catch (_e) { alert("Funzione PDF non disponibile."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { irpef_lorda_non_iap, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{meta.description}</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale.
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
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-white border self-center">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'irpef_lorda' ? 'bg-teal-50 border-teal-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'irpef_lorda' ? 'text-teal-600' : 'text-gray-800'}`}>
                                        <span>
                                            {isClient ? 
                                                (output.id === 'imu_esenzione' ? ((calculatedOutputs as any)[output.id] ? 'Sì' : 'No') : formatCurrency((calculatedOutputs as any)[output.id])) 
                                                : '...'
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Vantaggio Fiscale (IRPEF) per IAP/CD</h3>
                            <div className="h-64 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="IRPEF" name="IRPEF Lorda">
                                                <Cell fill="#a78bfa" /> 
                                                <Cell fill="#14b8a6" /> 
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 border rounded-lg shadow-md p-4 bg-white">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                            <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-300 rounded-md px-3 py-2 text-sm hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Campi</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Tassazione Agricola</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">D.P.R. n. 917/1986 (TUIR)</a> - Artt. 25-35, Redditi Fondiari.</li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2016-12-11;232" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Legge n. 232/2016, Art. 1, c. 44</a> - Esenzione IRPEF per IAP/CD.</li>
                             <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2001-05-18;228" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">D.Lgs. n. 228/2001</a> - Orientamento e modernizzazione del settore agricolo.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneImprenditoreAgricoloIapCalculator;