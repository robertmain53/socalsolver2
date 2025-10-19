'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
            "name": "Come si calcolano le tasse nel Regime Forfettario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Le tasse si calcolano applicando un'imposta sostitutiva (15% o 5% per le startup) a un reddito imponibile. Il reddito imponibile si ottiene moltiplicando il fatturato annuo per un coefficiente di redditività (specifico per ogni codice ATECO) e sottraendo i contributi previdenziali obbligatori versati."
            }
          },
          {
            "@type": "Question",
            "name": "Qual è il limite di fatturato per rimanere nel Regime Forfettario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il limite di fatturato per accedere e rimanere nel Regime Forfettario è di 85.000 € annui. Superando questa soglia ma rimanendo sotto i 100.000 € si esce dal regime dall'anno successivo. Superando i 100.000 € l'uscita è immediata."
            }
          },
          {
            "@type": "Question",
            "name": "Cosa sono gli acconti e il saldo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Gli acconti sono pagamenti anticipati delle tasse per l'anno in corso, calcolati come il 100% delle imposte dell'anno precedente e versati in due rate (generalmente entro il 1° luglio e il 30 novembre). Il saldo è il conguaglio finale che si paga l'anno successivo, calcolato come la differenza tra l'imposta effettiva dovuta e gli acconti già versati."
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
                if (trimmedBlock.startsWith('| Categoria')) {
                    const rows = trimmedBlock.split('\n').slice(2);
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 border text-left">Categoria di Attività</th>
                                        <th className="p-2 border text-left">Coefficiente di Redditività</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => {
                                        const cells = row.split('|').map(c => c.trim()).filter(c => c);
                                        if (cells.length < 2) return null;
                                        return (
                                            <tr key={i}>
                                                <td className="p-2 border">{cells[0]}</td>
                                                <td className="p-2 border font-semibold">{cells[1]}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    );
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
                    return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore (dal JSON) ---
const calculatorData = {
  "slug": "tasse-regime-forfettario",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tasse Regime Forfettario (con simulazione acconti e saldi)",
  "lang": "it",
  "inputs": [
    {
      "id": "fatturatoAnnuo",
      "label": "Fatturato annuo lordo",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 100,
      "tooltip": "Inserisci il totale dei ricavi o compensi incassati nell'anno, senza applicare l'IVA."
    },
    {
      "id": "codiceAteco",
      "label": "Coefficiente di Redditività",
      "type": "select" as const,
      "options": [
        { "label": "Attività professionali, scientifiche, tecniche, sanitarie, istruzione (78%)", "value": 0.78 },
        { "label": "Costruzioni e attività immobiliari (86%)", "value": 0.86 },
        { "label": "Intermediari del commercio e servizi finanziari (62%)", "value": 0.62 },
        { "label": "Commercio all'ingrosso e al dettaglio (40%)", "value": 0.40 },
        { "label": "Commercio di alimenti e bevande, ambulante (40%)", "value": 0.40 },
        { "label": "Servizi di alloggio e ristorazione (40%)", "value": 0.40 },
        { "label": "Altre attività economiche (67%)", "value": 0.67 }
      ],
      "tooltip": "Seleziona la categoria che meglio descrive la tua attività. Il coefficiente determina la parte del tuo fatturato che sarà tassata."
    },
    {
      "id": "contributiPrevidenziali",
      "label": "Contributi previdenziali obbligatori versati",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 50,
      "tooltip": "Inserisci il totale dei contributi INPS o della tua cassa professionale obbligatoria versati durante l'anno fiscale di riferimento."
    },
    {
      "id": "isStartup",
      "label": "Benefici del regime 'startup'?",
      "type": "boolean" as const,
      "tooltip": "Spunta questa casella se sei nei primi 5 anni di attività e rispetti i requisiti per l'aliquota agevolata al 5%."
    }
  ],
  "outputs": [
    { "id": "redditoImponibileLordo", "label": "Reddito Imponibile Lordo", "unit": "€" },
    { "id": "redditoImponibileNetto", "label": "Reddito Imponibile Netto (Base Tassabile)", "unit": "€" },
    { "id": "impostaSostitutiva", "label": "Imposta Sostitutiva Totale Annua", "unit": "€" },
    { "id": "primoAcconto", "label": "Simulazione 1° Acconto (50%)", "unit": "€" },
    { "id": "secondoAcconto", "label": "Simulazione 2° Acconto (50%)", "unit": "€" },
    { "id": "saldoDaVersare", "label": "Saldo a Giugno (ipotetico)", "unit": "€" }
  ],
  "content": "### **Guida Definitiva al Calcolo delle Tasse nel Regime Forfettario**\n\n**Analisi Pratica, Scadenze e Strategie per Lavoratori Autonomi**\n\nIl Regime Forfettario è il regime fiscale agevolato pensato per i lavoratori autonomi e le piccole imprese individuali in Italia. La sua principale attrattiva risiede nella semplicità di calcolo e in un'aliquota fissa molto vantaggiosa. Tuttavia, comprendere la logica di calcolo, specialmente per quanto riguarda acconti e saldi, è fondamentale per una corretta pianificazione finanziaria.\n\nQuesto strumento è stato progettato per offrire una simulazione chiara e dettagliata, ma ricorda: **non sostituisce la consulenza di un commercialista**, che può valutare la tua situazione specifica.\n\n### **Parte 1: Come Funziona il Calcolo - I Pilastri del Forfettario**\n\nIl calcolo delle tasse nel regime forfettario si basa su principi semplici e non analitici. Non si scaricano i costi specifici (tranne i contributi previdenziali), ma si applica una percentuale a forfait.\n\n1.  **Fatturato Lordo**: È la base di partenza. Corrisponde al totale dei compensi che hai incassato nell'anno solare, senza considerare l'IVA (che non applichi in fattura).\n\n2.  **Coefficiente di Redditività**: Questo è il cuore del regime. Lo Stato presume che una parte del tuo fatturato sia un costo a forfait. La parte rimanente, definita dal coefficiente, è il tuo **reddito imponibile lordo**. Ogni codice ATECO ha il suo coefficiente.\n\n| Categoria di Attività | Coefficiente di Redditività |\n| :--- | :--- |\n| Professionisti, Scienziati, Tecnici, etc. | 78% |\n| Costruzioni, Immobiliari | 86% |\n| Intermediari Commerciali | 62% |\n| Commercio Ingrosso/Dettaglio, Ristorazione | 40% |\n| Altre attività | 67% |\n\n3.  **Contributi Previdenziali Obbligatori**: Questa è **l'unica spesa reale che puoi dedurre**. L'importo totale dei contributi obbligatori (INPS Gestione Separata, cassa artigiani/commercianti, o cassa professionale) versati nell'anno viene sottratto dal reddito imponibile lordo per ottenere il **reddito imponibile netto**.\n\n4.  **Imposta Sostitutiva**: Sul reddito imponibile netto si applica l'imposta, che sostituisce IRPEF, addizionali regionali e comunali. L'aliquota è:\n    * **15% (Aliquota Ordinaria)**: L'aliquota standard del regime.\n    * **5% (Aliquota 'Startup')**: Riservata a chi inizia una nuova attività e rispetta specifici requisiti (non deve essere una mera prosecuzione di un'attività precedente, etc.), valida per i primi 5 anni.\n\n### **Parte 2: Acconti e Saldo - Pianificare i Pagamenti**\n\nLe tasse non si pagano tutte in un'unica soluzione. Il sistema si basa su acconti (pagamenti anticipati) e un saldo (conguaglio finale).\n\n* **Principio di Calcolo**: Gli acconti per l'anno in corso (es. 2025) sono calcolati come il **100% dell'imposta totale dovuta per l'anno precedente** (es. 2024).\n* **Come si pagano**: L'importo totale degli acconti viene versato in due rate:\n    * **Primo Acconto**: 50% del totale, solitamente entro il 1° Luglio (dato aggiornato al 2025).\n    * **Secondo Acconto**: Il restante 50%, solitamente entro il 30 Novembre.\n\n* **Il Saldo**: L'anno successivo (es. a Luglio 2026), si calcola l'imposta *definitiva* per il 2025. Il **saldo** è la differenza tra l'imposta definitiva 2025 e gli acconti che hai già versato nel corso del 2025. Se hai versato di più, avrai un credito.\n\nQuesto calcolatore **simula** gli acconti che dovrai versare basandosi sul fatturato che hai inserito per l'anno in corso, offrendoti una previsione accurata per la tua pianificazione finanziaria.\n\n### **Domande Frequenti (FAQ)**\n\n* **Chi può accedere al Regime Forfettario?**\n    Le partite IVA individuali che nell'anno precedente hanno incassato ricavi o compensi non superiori a **85.000 €** e che rispettano altri requisiti specifici (es. non avere partecipazioni in società di persone o srl che operano nello stesso settore).\n\n* **Cosa succede se supero la soglia di 85.000 €?**\n    Se incassi tra 85.001 € e 100.000 €, esci dal regime forfettario a partire dall'anno successivo. Se superi i 100.000 €, l'uscita è immediata e dovrai applicare l'IVA già dalla fattura successiva.\n\n* **Devo applicare la ritenuta d'acconto?**\n    No, i forfettari non applicano la ritenuta d'acconto in fattura e non la subiscono (previa dichiarazione al committente)."
};


const TasseRegimeForfettarioCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturatoAnnuo: 50000,
        codiceAteco: 0.78,
        contributiPrevidenziali: 8000,
        isStartup: true
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);
    
    const calculatedOutputs = useMemo(() => {
        const { fatturatoAnnuo, codiceAteco, contributiPrevidenziali, isStartup } = states;
        
        const redditoImponibileLordo = fatturatoAnnuo * codiceAteco;
        const redditoImponibileNetto = Math.max(0, redditoImponibileLordo - contributiPrevidenziali);
        const aliquota = isStartup ? 0.05 : 0.15;
        const impostaSostitutiva = redditoImponibileNetto * aliquota;
        
        const accontiTotali = impostaSostitutiva > 51.65 ? impostaSostitutiva : 0;
        const primoAcconto = accontiTotali / 2;
        const secondoAcconto = accontiTotali / 2;
        
        const saldoDaVersare = impostaSostitutiva - accontiTotali;

        const nettoInTasca = fatturatoAnnuo - contributiPrevidenziali - impostaSostitutiva;

        return {
            redditoImponibileLordo,
            redditoImponibileNetto,
            impostaSostitutiva,
            primoAcconto,
            secondoAcconto,
            saldoDaVersare,
            nettoInTasca,
            costiForfettari: fatturatoAnnuo * (1 - codiceAteco)
        };
    }, [states]);

    const chartData = [
        { name: 'Netto in Tasca', value: calculatedOutputs.nettoInTasca },
        { name: 'Imposta Sostitutiva', value: calculatedOutputs.impostaSostitutiva },
        // --- FIX APPLICATO QUI ---
        { name: 'Contributi Previdenziali', value: states.contributiPrevidenziali },
        { name: 'Costi a Forfait', value: calculatedOutputs.costiForfettari },
    ].filter(item => item.value > 0);

    const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#a8a29e'];

    const formulaUsata = `Imposta = MAX(0, (Fatturato * Coeff. Redditività) - Contributi) * (Startup ? 5% : 15%)`;

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
        } catch (_e) { alert("Impossibile generare il PDF in questo ambiente."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { nettoInTasca, costiForfettari, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
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
                {/* Colonna Principale: Calcolatore e Grafico */}
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula la tua tassazione, inclusi acconti e saldo, per una pianificazione fiscale senza sorprese.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>wwDisclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale. Le scadenze e le normative possono variare.
                        </div>

                        {/* Sezione Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-slate-50 border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            {inputLabel}
                                        </div>
                                    );
                                }
                                
                                if (input.type === 'select') {
                                     return (
                                        <div key={input.id} className="md:col-span-2">
                                            {inputLabel}
                                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, parseFloat(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    )
                                }

                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{input.unit}</span>
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-8 pr-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Sezione Risultati */}
                        <div className="mt-8 space-y-3">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'impostaSostitutiva' ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'impostaSostitutiva' ? 'text-red-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grafico */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato Lordo</h3>
                            <div className="h-72 w-full bg-slate-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                            </Pie>
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value as number)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 border rounded-lg shadow-sm p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetizzata</h3>
                            <p className="text-sm text-gray-600 mt-2 p-3 bg-white rounded font-mono break-words">{formulaUsata}</p>
                        </div>
                    </div>
                </div>

                {/* Colonna Laterale: Strumenti e Guida */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 text-red-700 rounded-md px-3 py-2 text-sm hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/ivaimpcom/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfetario</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2014-12-23;190" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge n. 190/2014, art. 1, commi 54-89</a> (Legge di Stabilità 2015)</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TasseRegimeForfettarioCalculator;