'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: 'Calcolatore Imposta di Bollo su Conto Corrente e Deposito Titoli',
  description: 'Calcola facilmente l\'imposta di bollo per persone fisiche e giuridiche su conti correnti e depositi titoli. Stima il costo annuale in pochi secondi.'
};

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
            "name": "Come si calcola l'imposta di bollo sul conto corrente?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Per le persone fisiche, l'imposta di bollo è di 34,20 € all'anno solo se la giacenza media supera i 5.000 €. Per le persone giuridiche (aziende, partite IVA), l'imposta è fissa a 100 € all'anno, indipendentemente dalla giacenza."
            }
          },
          {
            "@type": "Question",
            "name": "A quanto ammonta l'imposta di bollo sul deposito titoli?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'imposta di bollo sul deposito titoli è proporzionale e corrisponde al 2 per mille (0,20%) del valore di mercato degli strumenti finanziari detenuti. Per le persone fisiche è previsto un massimo di 14.000 €."
            }
          },
          {
            "@type": "Question",
            "name": "Quando si paga l'imposta di bollo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'imposta di bollo viene generalmente addebitata dalla banca con la stessa periodicità con cui viene inviato l'estratto conto (trimestrale, semestrale o annuale). L'importo viene calcolato pro-rata in base al periodo di rendicontazione."
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
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">$1</a>');
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

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "imposta-bollo-conto-e-titoli",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Imposta di Bollo su Conto e Titoli",
  "lang": "it",
  "inputs": [
    { "id": "giacenza_media_cc", "label": "Giacenza Media Conto Corrente", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci la giacenza media annua del tuo conto corrente. L'imposta per le persone fisiche scatta solo se questo valore supera i 5.000 €." },
    { "id": "valore_deposito_titoli", "label": "Valore Deposito Titoli", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il valore totale di mercato (o nominale, se non disponibile) dei tuoi strumenti finanziari alla data di rendicontazione." },
    { "id": "is_persona_giuridica", "label": "Sei una persona giuridica (azienda, P.IVA)?", "type": "boolean" as const, "tooltip": "Spunta questa casella se il conto è intestato a una società, un'impresa o un professionista con Partita IVA. Le regole di calcolo cambiano." }
  ],
  "outputs": [
    { "id": "bollo_conto_corrente", "label": "Imposta di Bollo su Conto Corrente", "unit": "€" },
    { "id": "bollo_deposito_titoli", "label": "Imposta di Bollo su Deposito Titoli", "unit": "€" },
    { "id": "totale_imposta_bollo", "label": "Totale Imposta di Bollo Annuale", "unit": "€" }
  ],
  "content": "### **Guida Completa all'Imposta di Bollo**\n\n**Come funziona per Conti Correnti, Conti Deposito e Investimenti Finanziari**\n\nL'imposta di bollo è una tassa indiretta che colpisce diversi atti e documenti, inclusi gli estratti conto bancari e le comunicazioni relative ai prodotti finanziari. Comprendere come funziona è essenziale per gestire al meglio i propri risparmi e investimenti.\n\nQuesto strumento ti aiuta a **stimare l'importo annuo** che dovrai versare, ma ricorda che il risultato è una simulazione e non sostituisce una consulenza professionale.\n\n### **Parte 1: Imposta di Bollo sul Conto Corrente**\n\nL'imposta sul conto corrente varia in base alla tipologia di intestatario.\n\n#### **Persone Fisiche**\nPer i privati cittadini, l'imposta è fissa e ammonta a **34,20 € all'anno**. Tuttavia, c'è un'importante esenzione: **non è dovuta se la giacenza media annua complessiva di tutti i conti e libretti intestati alla stessa persona presso la stessa banca è inferiore a 5.000 €**.\n\n_Esempio_: Se la tua giacenza media è 4.999 €, non paghi nulla. Se è 5.001 €, paghi 34,20 €.\n\n#### **Persone Giuridiche**\nPer le aziende, le ditte individuali e i professionisti con Partita IVA, l'imposta di bollo è fissa e pari a **100,00 € all'anno**, indipendentemente dall'importo della giacenza media.\n\n### **Parte 2: Imposta di Bollo sul Deposito Titoli**\n\nQuesta imposta si applica a tutti gli strumenti e prodotti finanziari (azioni, obbligazioni, fondi comuni, ETF, polizze vita, etc.).\n\n#### **Aliquota e Calcolo**\nL'imposta è proporzionale e corrisponde al **2 per mille (0,20%)** del valore di mercato del tuo portafoglio alla data di rendicontazione (solitamente il 31 dicembre).\n\n_Esempio_: Su un deposito titoli del valore di 50.000 €, l'imposta annuale sarà di 100 € (50.000 € * 0,20%).\n\n#### **Tetti Massimi (Plafond)**\nPer le **persone fisiche**, l'imposta massima che può essere pagata su tutti i depositi titoli è di **14.000 € all'anno**. Questo tetto non si applica invece alle persone giuridiche.\n\n### **Parte 3: Ottimizza la tua Gestione Finanziaria**\n\nConoscere l'impatto dell'imposta di bollo è il primo passo. Il secondo è scegliere gli strumenti giusti. Un conto corrente con canone zero può essere reso meno conveniente da un'imposta di bollo elevata su un deposito titoli associato.\n\nPer questo motivo, è fondamentale confrontare le offerte sul mercato. Abbiamo creato uno strumento apposito che ti aiuta a valutare costi e benefici.\n\n**Scopri i migliori conti per le tue esigenze e confronta i costi, inclusa l'imposta di bollo, sulla nostra pagina dedicata: [Confronta Conti Correnti e Deposito](https://socalsolver.com/it/risparmio-e-investimenti/compara-conti).**"
};

const ImpostaBolloContoETitoli: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      giacenza_media_cc: 15000,
      valore_deposito_titoli: 50000,
      is_persona_giuridica: false,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { giacenza_media_cc, valore_deposito_titoli, is_persona_giuridica } = states;

        // Calcolo bollo Conto Corrente
        let bollo_conto_corrente = 0;
        if (is_persona_giuridica) {
            bollo_conto_corrente = 100;
        } else {
            if (giacenza_media_cc > 5000) {
                bollo_conto_corrente = 34.20;
            }
        }
        
        // Calcolo bollo Deposito Titoli
        const ALIQUOTA_DEPOSITO_TITOLI = 0.002; // 2 per mille
        const MAX_BOLLO_PERSONE_FISICHE = 14000;
        
        let bollo_deposito_titoli = valore_deposito_titoli * ALIQUOTA_DEPOSITO_TITOLI;

        if (!is_persona_giuridica) {
           if (bollo_deposito_titoli > MAX_BOLLO_PERSONE_FISICHE) {
               bollo_deposito_titoli = MAX_BOLLO_PERSONE_FISICHE;
           }
        }
        // Per persone giuridiche non c'è cap massimo

        const totale_imposta_bollo = bollo_conto_corrente + bollo_deposito_titoli;

        return {
            bollo_conto_corrente,
            bollo_deposito_titoli,
            totale_imposta_bollo,
        };
    }, [states]);

    const chartData = [
      { name: 'Ripartizione Imposta', 'Conto Corrente': calculatedOutputs.bollo_conto_corrente, 'Deposito Titoli': calculatedOutputs.bollo_deposito_titoli },
    ];
    
    const formulaUsata = `Imposta Totale = Bollo Conto Corrente + Bollo Deposito Titoli`;

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
                        <p className="text-gray-600 mb-4">Stima il costo annuale dell'imposta di bollo sui tuoi conti e investimenti.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale o finanziaria professionale.
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
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'totale_imposta_bollo' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'totale_imposta_bollo' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione dell'Imposta Annuale</h3>
                            <div className="h-24 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value) => formatCurrency(value as number)} />
                                            <Legend formatter={(value, entry) => <span className="text-gray-700 text-sm">{value}</span>} />
                                            <Bar dataKey="Conto Corrente" stackId="a" fill="#818cf8" />
                                            <Bar dataKey="Deposito Titoli" stackId="a" fill="#fca5a5" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
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
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Calcolo</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                             <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/pagamenti/imposta-di-bollo/imposta-di-bollo-prodotti-finanziari" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Imposta di Bollo</a></li>
                             <li>D.P.R. 26 ottobre 1972, n. 642</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default ImpostaBolloContoETitoli;