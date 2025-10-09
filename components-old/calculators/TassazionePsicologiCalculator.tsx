'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: 'Calcolatore Tassazione Psicologi (Regime Forfettario e ENPAP)',
  description: 'Simula il calcolo di tasse e contributi ENPAP per psicologi in regime forfettario. Stima il tuo netto annuale e mensile in modo semplice e veloce.'
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
            "name": "Come calcola le tasse uno psicologo in regime forfettario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Uno psicologo in regime forfettario calcola le tasse applicando un'imposta sostitutiva (5% o 15%) a un reddito imponibile. Questo reddito si ottiene moltiplicando il fatturato annuo per il coefficiente di redditività del 78% e sottraendo i contributi previdenziali ENPAP versati nell'anno."
            }
          },
          {
            "@type": "Question",
            "name": "Quali sono i contributi ENPAP obbligatori?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I contributi obbligatori per gli psicologi iscritti all'ENPAP sono tre: il contributo soggettivo (10% del reddito netto, con un minimo), il contributo integrativo (2% da addebitare in fattura al cliente) e il contributo di maternità (una quota fissa annuale)."
            }
          },
          {
            "@type": "Question",
            "name": "I contributi ENPAP sono deducibili nel regime forfettario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, tutti i contributi ENPAP obbligatori versati durante l'anno fiscale sono interamente deducibili dal reddito imponibile, riducendo così la base su cui viene calcolata l'imposta sostitutiva."
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
  "slug": "tassazione-psicologi",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Psicologi (con ENPAP)",
  "lang": "it",
  "inputs": [
    { "id": "fatturato_annuo", "label": "Fatturato Lordo Annuo", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei compensi incassati nell'anno, senza IVA, al lordo delle ritenute d'acconto (se applicabili)." },
    { "id": "nuova_attivita", "label": "Sei in regime forfettario start-up (primi 5 anni)?", "type": "boolean" as const, "tooltip": "Seleziona se hai avviato l'attività da meno di 5 anni e rispetti i requisiti per l'imposta sostitutiva ridotta al 5%." },
    { "id": "contributo_soggettivo_maggiorato", "label": "Applichi l'aliquota ENPAP soggettiva maggiorata (15%)?", "type": "boolean" as const, "tooltip": "Spunta se hai scelto di versare l'aliquota facoltativa più alta per maturare una pensione maggiore. L'aliquota passerà dal 10% ad un valore da te scelto (fino al 30%). Per semplicità, il calcolatore usa un'aliquota fissa del 15%." },
    { "id": "acconti_enpap_versati", "label": "Acconti ENPAP già versati per l'anno", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci la somma degli acconti per il contributo soggettivo e integrativo che hai già pagato durante l'anno di riferimento." },
    { "id": "acconti_imposte_versati", "label": "Acconti Imposta Sostitutiva già versati", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci la somma degli acconti IRPEF (o imposta sostitutiva) che hai già pagato durante l'anno di riferimento." }
  ],
  "outputs": [
    { "id": "reddito_imponibile_fiscale", "label": "Reddito Imponibile Fiscale", "unit": "€" },
    { "id": "totale_enpap_dovuto", "label": "Totale Contributi ENPAP dovuti", "unit": "€" },
    { "id": "imposta_sostitutiva", "label": "Imposta Sostitutiva (5% o 15%)", "unit": "€" },
    { "id": "totale_tasse_e_contributi", "label": "Totale Tasse e Contributi", "unit": "€" },
    { "id": "netto_annuo", "label": "Reddito Netto Annuo Stimato", "unit": "€" },
    { "id": "netto_mensile", "label": "Reddito Netto Mensile Stimato", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione per Psicologi nel Regime Forfettario**\n\n**Analisi dei Contributi ENPAP, Calcolo dell'Imposta e Ottimizzazione Fiscale**\n\nLa gestione fiscale per uno psicologo libero professionista può sembrare complessa, ma con le giuste informazioni diventa un percorso chiaro e gestibile. Il **regime forfettario** rappresenta la scelta più comune e vantaggiosa per chi inizia e per molti professionisti affermati, grazie alla sua semplicità e alla tassazione agevolata.\n\nQuesto strumento è progettato per offrire una **stima chiara e dettagliata** del carico fiscale e previdenziale. È fondamentale ricordare che i risultati sono una simulazione e **non sostituiscono la consulenza di un commercialista**, che può analizzare la situazione personale in modo approfondito.\n\n### **Parte 1: Il Regime Forfettario per Psicologi**\n\nIl regime forfettario è un regime fiscale agevolato che prevede una tassazione semplificata, basata su un'imposta sostitutiva unica e non sull'IRPEF progressiva. Non si applica l'IVA sulle fatture e si è esonerati da diversi adempimenti contabili.\n\n#### **Coefficiente di Redditività: 78%**\n\nIl punto chiave del regime è il **coefficiente di redditività**, che per gli psicologi (codice ATECO 86.90.30) è fissato al **78%**. Questo significa che lo Stato riconosce forfettariamente il 22% del tuo fatturato come spese sostenute, senza che tu debba documentarle.\n\n_Esempio_: Su un fatturato di 30.000 €, il tuo reddito imponibile lordo (la base su cui si calcolano tasse e contributi) sarà di 23.400 € (30.000 € * 78%).\n\n#### **Imposta Sostitutiva**\n\nSul reddito imponibile, così calcolato, si applica un'imposta sostitutiva:\n\n* **5% per i primi 5 anni** (regime start-up), a patto di rispettare specifici requisiti.\n* **15% dal sesto anno in poi**.\n\n### **Parte 2: I Contributi ENPAP - La Previdenza dello Psicologo**\n\nL'ENPAP (Ente Nazionale di Previdenza ed Assistenza per gli Psicologi) è la cassa previdenziale obbligatoria. I contributi da versare sono di tre tipi:\n\n1.  **Contributo Soggettivo**: È il contributo principale per la tua pensione. Si calcola sul reddito netto e l'aliquota ordinaria è del **10%**. Esiste un contributo minimo annuale (per il 2025, la stima è di 854 €). È possibile scegliere volontariamente di versare un'aliquota maggiore (fino al 30%) per aumentare il montante pensionistico.\n\n2.  **Contributo Integrativo**: È pari al **2% del corrispettivo lordo** di ogni fattura emessa. Questo importo viene addebitato al cliente in fattura e poi versato all'ENPAP. È importante notare che questo contributo si calcola sul **fatturato totale**, non sul reddito imponibile.\n\n3.  **Contributo di Maternità/Solidarietà**: Una quota fissa annuale (per il 2025, la stima è di 130 €) che tutti gli iscritti devono versare per finanziare le indennità di maternità e altre prestazioni assistenziali.\n\n#### **La Deducibilità dei Contributi**\n\n**Un vantaggio fiscale cruciale**: Tutti i contributi ENPAP versati nell'anno (soggettivo, integrativo e di maternità) sono **interamente deducibili** dal reddito imponibile. Questo significa che abbassano la base su cui verrà calcolata l'imposta sostitutiva, riducendo di fatto le tasse da pagare.\n\n### **Parte 3: Esempio di Calcolo Passo-Passo**\n\nVediamo come funziona il calcolo con un esempio pratico (fatturato annuo di 40.000 € in regime start-up).\n\n1.  **Fatturato Annuo**: 40.000 €\n\n2.  **Calcolo Reddito Imponibile Lordo**: 40.000 € * 78% = 31.200 €\n\n3.  **Calcolo Contributi ENPAP**:\n    * _Integrativo_: 40.000 € * 2% = 800 €\n    * _Soggettivo (10%)_: 31.200 € * 10% = 3.120 € (superiore al minimo)\n    * _Maternità_: 130 €\n    * _Totale ENPAP da versare_: 800 + 3.120 + 130 = **4.050 €**\n\n4.  **Calcolo Reddito Imponibile Fiscale Netto** (dopo deduzione contributi):\n    * 31.200 € (imponibile lordo) - 4.050 € (contributi versati) = **27.150 €**\n\n5.  **Calcolo Imposta Sostitutiva** (al 5%):\n    * 27.150 € * 5% = **1.357,50 €**\n\n6.  **Riepilogo Finale**:\n    * _Totale Uscite (Tasse + Contributi)_: 4.050 € + 1.357,50 € = 5.407,50 €\n    * _Reddito Netto Effettivo_: 40.000 € - 5.407,50 € = **34.592,50 €**\n\n### **Parte 4: Acconti e Saldi**\n\nIl sistema fiscale italiano prevede il versamento di **acconti** durante l'anno, calcolati sulla base delle imposte e dei contributi dell'anno precedente. L'anno successivo si effettua la dichiarazione dei redditi, si calcola l'importo esatto dovuto (il **saldo**) e si pagano i nuovi acconti per l'anno in corso. Questo calcolatore ti aiuta a determinare il totale dovuto per l'anno; gli acconti che hai già versato andranno sottratti per determinare quanto ti resta da pagare a saldo."
};

const TassazionePsicologiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      fatturato_annuo: 45000,
      nuova_attivita: true,
      contributo_soggettivo_maggiorato: false,
      acconti_enpap_versati: 0,
      acconti_imposte_versati: 0,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, nuova_attivita, contributo_soggettivo_maggiorato } = states;

        // Constants (potrebbero essere aggiornate annualmente)
        const COEFFICIENTE_REDDITIVITA = 0.78;
        const MINIMO_SOGGETTIVO_ENPAP_2025 = 854;
        const CONTRIBUTO_MATERNITA_2025 = 130;
        
        const reddito_imponibile_lordo = fatturato_annuo * COEFFICIENTE_REDDITIVITA;
        const contributo_integrativo_enpap = fatturato_annuo * 0.02;
        const aliquota_soggettiva = contributo_soggettivo_maggiorato ? 0.15 : 0.10;
        const contributo_soggettivo_calcolato = reddito_imponibile_lordo * aliquota_soggettiva;
        const contributo_soggettivo_enpap = Math.max(contributo_soggettivo_calcolato, MINIMO_SOGGETTIVO_ENPAP_2025);
        const totale_enpap_dovuto = contributo_soggettivo_enpap + contributo_integrativo_enpap + CONTRIBUTO_MATERNITA_2025;
        const reddito_imponibile_fiscale = reddito_imponibile_lordo - totale_enpap_dovuto;
        const aliquota_imposta = nuova_attivita ? 0.05 : 0.15;
        const imposta_sostitutiva = Math.max(0, reddito_imponibile_fiscale * aliquota_imposta);
        const totale_tasse_e_contributi = totale_enpap_dovuto + imposta_sostitutiva;
        const netto_annuo = fatturato_annuo - totale_tasse_e_contributi;
        const netto_mensile = netto_annuo / 12;

        return {
            reddito_imponibile_fiscale,
            totale_enpap_dovuto,
            imposta_sostitutiva,
            totale_tasse_e_contributi,
            netto_annuo,
            netto_mensile,
        };
    }, [states]);

    const chartData = [
      { name: 'Ripartizione Fatturato', 'Netto Stimato': calculatedOutputs.netto_annuo, 'Contributi ENPAP': calculatedOutputs.totale_enpap_dovuto, 'Imposte': calculatedOutputs.imposta_sostitutiva },
    ];

    const formulaUsata = `Reddito Netto = Fatturato - (Contributi ENPAP + Imposta Sostitutiva)`;

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
                        <p className="text-gray-600 mb-4">Stima il tuo carico fiscale e previdenziale se sei uno psicologo in regime forfettario.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale. I valori dei contributi minimi e di maternità sono stime e possono variare.
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
                                            <XAxis type="number" hide tickFormatter={(tick) => `${tick * 100}%`}/>
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value, name, props) => `${(props.payload.value / states.fatturato_annuo * 100).toFixed(2)}% (${formatCurrency(props.payload.value)})`} />
                                            <Legend formatter={(value, entry) => <span className="text-gray-700 text-sm">{value}</span>} />
                                            <Bar dataKey="Netto Stimato" stackId="a" fill="#4f46e5" />
                                            <Bar dataKey="Contributi ENPAP" stackId="a" fill="#818cf8" />
                                            <Bar dataKey="Imposte" stackId="a" fill="#fca5a5" />
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
                            <li><a href="https://www.enpap.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Sito Ufficiale ENPAP</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/regime-forfetario-2019/infogen-regime-forfetario-2019" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfetario</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazionePsicologiCalculator;