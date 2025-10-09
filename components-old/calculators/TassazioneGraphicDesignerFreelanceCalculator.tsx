'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: 'Calcolatore Tassazione per Graphic Designer Freelance (Forfettario)',
  description: 'Simula tasse e contributi INPS per graphic designer con Partita IVA in regime forfettario. Calcola il tuo guadagno netto annuale e mensile.'
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
            "name": "Qual è il Codice ATECO per un graphic designer freelance?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il Codice ATECO più comune per i graphic designer freelance è il 74.10.10 - 'Attività di design specializzate', che ha un coefficiente di redditività del 78% nel regime forfettario."
            }
          },
          {
            "@type": "Question",
            "name": "Dove versa i contributi un graphic designer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Un graphic designer freelance, in quanto professionista senza una cassa previdenziale dedicata, versa i propri contributi obbligatori alla Gestione Separata INPS. Questi contributi sono interamente deducibili dal reddito imponibile."
            }
          },
          {
            "@type": "Question",
            "name": "Posso dedurre i costi (software, computer) nel regime forfettario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, nel regime forfettario non è possibile dedurre analiticamente i costi sostenuti. Lo Stato riconosce una deduzione forfettaria delle spese attraverso il coefficiente di redditività. Per i designer, il 22% del fatturato è considerato costo, indipendentemente dalle spese reali."
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

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "tassazione-graphic-designer-freelance",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Graphic Designer Freelance",
  "lang": "it",
  "inputs": [
    { "id": "fatturato_annuo", "label": "Fatturato Lordo Annuo", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei compensi incassati nell'anno, senza IVA. È la somma di tutti gli importi delle fatture emesse." },
    { "id": "nuova_attivita", "label": "Applichi il regime forfettario start-up (5%)?", "type": "boolean" as const, "tooltip": "Seleziona se hai avviato la Partita IVA da meno di 5 anni e rispetti i requisiti per l'imposta sostitutiva ridotta al 5%." },
    { "id": "acconti_inps_versati", "label": "Acconti INPS già versati per l'anno", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci la somma degli acconti per la Gestione Separata INPS che hai già pagato durante l'anno di riferimento." },
    { "id": "acconti_imposte_versati", "label": "Acconti Imposta Sostitutiva già versati", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci la somma degli acconti per l'imposta sostitutiva (ex IRPEF) che hai già pagato durante l'anno di riferimento." }
  ],
  "outputs": [
    { "id": "reddito_imponibile_fiscale", "label": "Reddito Imponibile Fiscale", "unit": "€" },
    { "id": "contributi_inps_dovuti", "label": "Contributi INPS Gestione Separata", "unit": "€" },
    { "id": "imposta_sostitutiva", "label": "Imposta Sostitutiva (5% o 15%)", "unit": "€" },
    { "id": "totale_tasse_e_contributi", "label": "Totale Tasse e Contributi", "unit": "€" },
    { "id": "netto_annuo", "label": "Guadagno Netto Annuo Stimato", "unit": "€" },
    { "id": "netto_mensile", "label": "Guadagno Netto Mensile Stimato", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione per Graphic Designer Freelance**\n\n**Dal Fatturato al Netto: Calcolo Tasse e Contributi INPS nel Regime Forfettario**\n\nIntraprendere la carriera di graphic designer freelance in Italia richiede non solo talento creativo, ma anche una solida comprensione del panorama fiscale. Il **regime forfettario** è, per la maggior parte dei designer, la via più semplice e fiscalmente vantaggiosa per avviare e gestire la propria attività.\n\nQuesto calcolatore è stato creato per darti una **stima precisa e trasparente** del tuo carico fiscale e previdenziale. Ricorda, tuttavia, che ogni situazione è unica. I risultati forniti sono una simulazione e **non possono sostituire la consulenza personalizzata di un commercialista**.\n\n### **Parte 1: L'Inquadramento Fiscale del Graphic Designer**\n\nPer un graphic designer freelance, l'inquadramento standard prevede:\n\n* **Codice ATECO 74.10.10**: \"Attività di design specializzate\" - è il codice che identifica la tua professione.\n* **Regime Fiscale Forfettario**: Il regime agevolato di cui parleremo in dettaglio.\n* **Cassa Previdenziale**: Iscrizione alla **Gestione Separata INPS**, poiché non esiste un albo o una cassa specifica per i designer.\n\n#### **Il Coefficiente di Redditività al 78%**\n\nIl cuore del regime forfettario è il **coefficiente di redditività**. Per il tuo codice ATECO, è fissato al **78%**. In pratica, lo Stato presume che il 22% del tuo fatturato sia costituito da costi operativi, che non devi dimostrare. La tassazione e i contributi si calcolano solo sul 78% del fatturato incassato.\n\n_Esempio_: Se fatturi 40.000 €, il tuo reddito imponibile lordo (la base per i calcoli) sarà 31.200 € (40.000 € * 78%).\n\n### **Parte 2: Tasse e Contributi nel Dettaglio**\n\n#### **1. L'Imposta Sostitutiva**\n\nNel regime forfettario non paghi l'IRPEF, l'IRAP o le addizionali. Al loro posto, versi un'unica **imposta sostitutiva**:\n\n* **5% per i primi 5 anni di attività** (se rispetti i requisiti \"start-up\").\n* **15% dal sesto anno in poi**.\n\nQuesta imposta si applica sul reddito imponibile *dopo* aver dedotto i contributi previdenziali.\n\n#### **2. Contributi INPS Gestione Separata**\n\nEssendo un professionista senza una cassa dedicata, devi iscriverti alla Gestione Separata dell'INPS. L'aliquota contributiva (per il 2024/2025) è del **26,07%**. Questi contributi finanziano la tua pensione, maternità, malattia e altre prestazioni sociali.\n\n**Vantaggio Fiscale Fondamentale**: I contributi INPS che versi sono **interamente deducibili** dal reddito imponibile. Questo significa che prima calcoli e accantoni i contributi dovuti, e solo sulla parte rimanente del reddito imponibile calcoli l'imposta sostitutiva. L'effetto è una significativa riduzione delle tasse.\n\n### **Parte 3: Esempio di Calcolo Step-by-Step**\n\nAnalizziamo un caso pratico: un designer al suo secondo anno di attività con un fatturato di 35.000 €.\n\n1.  **Fatturato Annuo**: 35.000 €\n2.  **Calcolo Reddito Imponibile Lordo (78%)**: 35.000 € * 0.78 = **27.300 €**\n3.  **Calcolo Contributi INPS (26,07%)**: 27.300 € * 0.2607 = **7.116,21 €**\n    * _Questi sono i contributi da versare all'INPS._\n4.  **Calcolo Reddito Imponibile Fiscale (dopo deduzione)**: 27.300 € - 7.116,21 € = **20.183,79 €**\n    * _Questa è la base su cui si calcola l'imposta._\n5.  **Calcolo Imposta Sostitutiva (5% start-up)**: 20.183,79 € * 0.05 = **1.009,19 €**\n\n**Riepilogo Finale:**\n* **Totale Uscite**: 7.116,21 € (INPS) + 1.009,19 € (Imposte) = **8.125,40 €**\n* **Guadagno Netto Effettivo**: 35.000 € - 8.125,40 € = **26.874,60 €**\n* **Netto Mensile Stimato**: 26.874,60 € / 12 = **2.239,55 €**\n\n### **Parte 4: La Gestione di Acconti e Saldi**\n\nIl sistema italiano si basa su acconti e saldi. Durante l'anno in corso (es. 2025), paghi degli **acconti** basati su quanto hai dichiarato nell'anno precedente (2024). L'anno successivo (2026), presenti la dichiarazione dei redditi per il 2025, calcoli l'importo totale dovuto e versi il **saldo** (la differenza tra il dovuto e gli acconti già versati). Questo calcolatore ti aiuta a stimare il totale dovuto, fondamentale per pianificare la tua liquidità."
};


const TassazioneGraphicDesignerFreelanceCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      fatturato_annuo: 35000,
      nuova_attivita: true,
      acconti_inps_versati: 0,
      acconti_imposte_versati: 0,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, nuova_attivita } = states;

        const COEFFICIENTE_REDDITIVITA = 0.78;
        const ALIQUOTA_INPS_GESTIONE_SEPARATA = 0.2607; // Aliquota 2024/2025
        
        const reddito_imponibile_lordo = fatturato_annuo * COEFFICIENTE_REDDITIVITA;
        const contributi_inps_dovuti = reddito_imponibile_lordo * ALIQUOTA_INPS_GESTIONE_SEPARATA;
        const reddito_imponibile_fiscale = reddito_imponibile_lordo - contributi_inps_dovuti;
        const aliquota_imposta = nuova_attivita ? 0.05 : 0.15;
        const imposta_sostitutiva = Math.max(0, reddito_imponibile_fiscale * aliquota_imposta);
        const totale_tasse_e_contributi = contributi_inps_dovuti + imposta_sostitutiva;
        const netto_annuo = fatturato_annuo - totale_tasse_e_contributi;
        const netto_mensile = netto_annuo / 12;

        return {
            reddito_imponibile_fiscale,
            contributi_inps_dovuti,
            imposta_sostitutiva,
            totale_tasse_e_contributi,
            netto_annuo,
            netto_mensile,
        };
    }, [states]);

    const chartData = [
      { name: 'Ripartizione Fatturato', 'Netto Stimato': calculatedOutputs.netto_annuo, 'Contributi INPS': calculatedOutputs.contributi_inps_dovuti, 'Imposte': calculatedOutputs.imposta_sostitutiva },
    ];

    const formulaUsata = `Netto = Fatturato - ( (Fatturato * 0.78 * 0.2607) + ( (Fatturato * 0.78) - Contributi_INPS ) * Aliquota_Imposta )`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2, windowWidth: 1200 });
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
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
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
                        <p className="text-gray-600 mb-4">Simula il tuo guadagno netto come designer in regime forfettario.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale. L'aliquota INPS Gestione Separata può essere soggetta a variazioni annuali.
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
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${['netto_annuo', 'netto_mensile'].includes(output.id) ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${['netto_annuo', 'netto_mensile'].includes(output.id) ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato Lordo</h3>
                            <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={chartData} stackOffset="expand">
                                            <XAxis type="number" hide tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}/>
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value, name, props) => `${(props.payload.value / states.fatturato_annuo * 100).toFixed(2)}% (${formatCurrency(props.payload.value)})`} />
                                            <Legend formatter={(value) => <span className="text-gray-700 text-sm">{value}</span>} />
                                            <Bar dataKey="Netto Stimato" stackId="a" fill="#4f46e5" name="Guadagno Netto"/>
                                            <Bar dataKey="Contributi INPS" stackId="a" fill="#818cf8" name="Contributi INPS"/>
                                            <Bar dataKey="Imposte" stackId="a" fill="#fca5a5" name="Imposta Sostitutiva"/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetizzata</h3>
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
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Dettagliata</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-servizi.50153.gestione-separata.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Separata</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/regime-forfetario-2019/infogen-regime-forfetario-2019" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfetario</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneGraphicDesignerFreelanceCalculator;