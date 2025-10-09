'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Assegno Unico Universale per Figli a Carico 2025",
  description: "Simula il calcolo del tuo Assegno Unico Universale. Inserisci ISEE e composizione familiare per una stima precisa dell'importo mensile, incluse tutte le maggiorazioni."
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
            "name": "Come si calcola l'Assegno Unico Universale?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il calcolo si basa principalmente sul valore ISEE del nucleo familiare. L'importo è composto da una quota base per ogni figlio, che decresce all'aumentare dell'ISEE, a cui si sommano varie maggiorazioni (per famiglie numerose, figli con disabilità, genitori lavoratori, madri giovani)."
            }
          },
          {
            "@type": "Question",
            "name": "L'Assegno Unico va dichiarato nel 730?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, l'Assegno Unico è un reddito esente da imposte (IRPEF) e non va dichiarato nel modello 730 o Redditi Persone Fisiche. Sostituisce le precedenti detrazioni per figli a carico."
            }
          },
          {
            "@type": "Question",
            "name": "Cosa succede se non presento l'ISEE?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Se non si presenta un ISEE in corso di validità, si ha comunque diritto all'Assegno Unico, ma verrà erogato l'importo minimo previsto per la soglia ISEE più alta (superiore a 45.574,96 €)."
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
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('#### **')) {
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('*')) {
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}
            </ul>
          );
        }
        if (trimmedBlock.match(/^\d\.\s/)) {
            return (
              <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
                {trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />)}
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

// --- Dati di configurazione del calcolatore (dal file JSON) ---
const calculatorData = {
  "slug": "assegno-unico-universale-figli",
  "category": "Famiglia e Vita Quotidiana",
  "title": "Calcolatore Assegno Unico Universale per Figli a Carico",
  "lang": "it",
  "inputs": [
    { "id": "isee", "label": "Valore ISEE del nucleo familiare", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il valore dell'Indicatore della Situazione Economica Equivalente. Se non lo possiedi o supera i 45.575€, l'importo calcolato sarà quello minimo." },
    { "id": "numero_figli_minori", "label": "Numero figli minori (0-17 anni)", "type": "number" as const, "min": 0, "step": 1, "tooltip": "Numero di figli a carico con meno di 18 anni." },
    { "id": "numero_figli_maggiorenni", "label": "Numero figli maggiorenni (18-21 anni)", "type": "number" as const, "min": 0, "step": 1, "tooltip": "Numero di figli a carico tra 18 e 21 anni non compiuti che rispettano almeno un requisito (studio, tirocinio, reddito basso, etc.)." },
    { "id": "numero_figli_disabili_minori", "label": "Numero figli minori con disabilità", "type": "number" as const, "min": 0, "step": 1, "tooltip": "Numero di figli disabili con meno di 18 anni. La maggiorazione è fissa e non dipende dall'ISEE." },
    { "id": "numero_figli_disabili_18_21", "label": "Numero figli 18-21 anni con disabilità", "type": "number" as const, "min": 0, "step": 1, "tooltip": "Numero di figli disabili tra 18 e 21 anni. La maggiorazione è fissa." },
    { "id": "numero_figli_disabili_oltre_21", "label": "Numero figli con disabilità (21+ anni)", "type": "number" as const, "min": 0, "step": 1, "tooltip": "Numero di figli disabili con 21 anni o più. L'importo è calcolato in base all'ISEE." },
    { "id": "entrambi_genitori_reddito", "label": "Entrambi i genitori hanno un reddito da lavoro?", "type": "boolean" as const, "tooltip": "Spunta se entrambi i genitori lavorano. Questa condizione dà diritto a una maggiorazione specifica, decrescente con l'ISEE." },
    { "id": "madre_under_21", "label": "La madre ha meno di 21 anni?", "type": "boolean" as const, "tooltip": "Spunta se la madre del/dei figlio/i ha un'età inferiore a 21 anni. Questa condizione dà diritto a una maggiorazione." }
  ],
  "outputs": [
    { "id": "importo_base_mensile", "label": "Importo Base Mensile", "unit": "€" },
    { "id": "totale_maggiorazioni_mensili", "label": "Totale Maggiorazioni Mensili", "unit": "€" },
    { "id": "importo_totale_mensile", "label": "Assegno Unico Mensile Stimato", "unit": "€" },
    { "id": "importo_totale_annuale", "label": "Assegno Unico Annuale Stimato", "unit": "€" }
  ],
  "content": "### **Guida Completa all'Assegno Unico e Universale per Figli a Carico**\n\n**Cos'è, come si calcola e quali sono i requisiti per ottenerlo.**\n\nL'Assegno Unico e Universale è un sostegno economico fondamentale per le famiglie con figli a carico, introdotto per riordinare e potenziare le misure a supporto della genitorialità. Viene erogato dal settimo mese di gravidanza fino al compimento dei 21 anni del figlio (a determinate condizioni), e senza limiti di età per i figli con disabilità.\n\nQuesto strumento offre una **simulazione accurata e aggiornata** basata sulle normative vigenti. L'obiettivo è fornire una stima chiara e comprensibile dell'importo a cui si potrebbe avere diritto, ma si ricorda che **il calcolo non sostituisce la valutazione ufficiale dell'INPS**, l'unico ente preposto all'erogazione.\n\n### **Parte 1: Come Utilizzare il Calcolatore**\n\nPer ottenere una stima precisa, è necessario inserire alcuni dati chiave relativi alla composizione e alla situazione economica del nucleo familiare.\n\n* **Valore ISEE**: È il parametro più importante. L'importo dell'assegno è calcolato su base progressiva: più basso è l'ISEE, più alto sarà l'assegno. In assenza di ISEE valido o con un valore superiore alla soglia massima, viene erogato l'importo minimo.\n* **Numero e Tipologia di Figli**: Il calcolo distingue tra figli minorenni, maggiorenni (fino a 21 anni) e con disabilità, poiché a ogni categoria corrispondono importi e maggiorazioni differenti.\n* **Condizioni Particolari del Nucleo**: La presenza di entrambi i genitori con reddito da lavoro o di una madre di età inferiore a 21 anni dà diritto a specifiche maggiorazioni.\n\nI risultati mostrano non solo l'importo finale, ma anche la scomposizione tra la quota base e le varie maggiorazioni, per una totale trasparenza sul calcolo.\n\n### **Parte 2: Guida Approfondita ai Criteri di Calcolo**\n\nL'importo dell'Assegno Unico è determinato da una quota base, variabile in funzione dell'ISEE, a cui si sommano diverse maggiorazioni.\n\n#### **La Quota Base: Il Ruolo dell'ISEE**\n\nLa quota base per ogni figlio viene calcolata tramite una funzione lineare decrescente in base all'ISEE. Le soglie principali (aggiornate al 2024/2025) sono:\n\n* **ISEE fino a 17.090,61 €**: Si ha diritto all'importo massimo.\n    * **199,40 €** per ogni figlio minorenne.\n    * **96,90 €** per ogni figlio maggiorenne (18-21 anni).\n* **ISEE da 17.090,61 € a 45.574,96 €**: L'importo si riduce progressivamente.\n* **ISEE oltre 45.574,96 € (o non presentato)**: Si ha diritto all'importo minimo.\n    * **57,00 €** per ogni figlio minorenne.\n    * **28,50 €** per ogni figlio maggiorenne (18-21 anni).\n\n#### **Le Maggiorazioni: Come Aumentare l'Importo**\n\nAlle quote base si aggiungono le seguenti maggiorazioni, cumulabili tra loro:\n\n1.  **Per Figli Numerosi**:\n    * Per il **terzo figlio e successivi**, è prevista una maggiorazione che varia da **96,90 €** (ISEE bassi) a **17,00 €** (ISEE alti) per ciascun figlio.\n    * Per i nuclei con **4 o più figli**, è prevista un'ulteriore maggiorazione forfettaria di **171,00 €** mensili.\n\n2.  **Per Figli con Disabilità** (senza limiti di età):\n    * Figli **minorenni**: Maggiorazione fissa di **119,60 €**.\n    * Figli **tra 18 e 21 anni**: Maggiorazione fissa di **85,70 €**.\n    * Figli **con 21 anni o più**: L'importo base varia da **91,90 €** (ISEE bassi) a **28,50 €** (ISEE alti).\n\n3.  **Per Genitori Lavoratori**:\n    * Se **entrambi i genitori** sono titolari di reddito da lavoro, spetta una maggiorazione per ciascun figlio che varia da **34,10 €** a zero, riducendosi all'aumentare dell'ISEE (si azzera sopra i 45.575 €).\n    * Questa maggiorazione spetta anche ai **nuclei vedovili** con un solo genitore lavoratore, per i 5 anni successivi al decesso del partner.\n\n4.  **Per Madri Giovani**:\n    * Se la madre ha **meno di 21 anni**, spetta una maggiorazione fissa di **22,60 €** mensili per ciascun figlio.\n\n#### **Aspetti Fiscali: Un Vantaggio Importante**\n\nL'Assegno Unico e Universale **non concorre alla formazione del reddito imponibile** ai fini IRPEF. È una somma netta, completamente esentasse. Ha sostituito le precedenti detrazioni fiscali per i figli a carico minori di 21 anni, che non sono più in vigore.\n\n### **Parte 3: Informazioni Pratiche**\n\n#### **Chi ha Diritto e Requisiti**\n\nL'assegno spetta a tutti i nuclei familiari con figli a carico, a prescindere dalla condizione lavorativa (dipendenti, autonomi, disoccupati). I requisiti principali sono:\n* Cittadinanza italiana o di uno Stato UE, o permesso di soggiorno UE per soggiornanti di lungo periodo.\n* Residenza e domicilio in Italia.\n* Essere o essere stato residente in Italia per almeno due anni, anche non continuativi, oppure essere titolare di un contratto di lavoro a tempo indeterminato o determinato di durata almeno semestrale.\n\nPer i **figli maggiorenni (18-21 anni)**, è richiesto che il figlio stesso soddisfi una delle seguenti condizioni:\n* Frequenti un corso di formazione scolastica, professionale o di laurea.\n* Svolga un tirocinio o un'attività lavorativa con reddito complessivo inferiore a 8.000 € annui.\n* Sia registrato come disoccupato e in cerca di lavoro presso i servizi pubblici per l'impiego.\n* Svolga il servizio civile universale.\n\n#### **Come e Quando Fare Domanda**\n\nLa domanda si presenta **online** attraverso il portale dell'INPS (con SPID, CIE o CNS) oppure rivolgendosi a un CAF o a un patronato. La domanda va presentata una sola volta e vale per il periodo marzo-febbraio dell'anno successivo. L'ISEE va rinnovato ogni anno per non ricevere l'importo minimo."
};

const AssegnoUnicoUniversaleFigliCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    isee: 25000,
    numero_figli_minori: 1,
    numero_figli_maggiorenni: 0,
    numero_figli_disabili_minori: 0,
    numero_figli_disabili_18_21: 0,
    numero_figli_disabili_oltre_21: 0,
    entrambi_genitori_reddito: true,
    madre_under_21: false,
  };
  const [states, setStates] = useState<{[key: string]: any}>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({...prev, [id]: value}));
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const { isee, numero_figli_minori, numero_figli_maggiorenni, numero_figli_disabili_minori, numero_figli_disabili_18_21, numero_figli_disabili_oltre_21, entrambi_genitori_reddito, madre_under_21 } = states;

    const safeIsse = isee || 99999;
    
    const calculateLinear = (val: number, minIsee: number, maxIsee: number, maxVal: number, minVal: number): number => {
        if (val <= minIsee) return maxVal;
        if (val >= maxIsee) return minVal;
        return minVal + (maxVal - minVal) * ((maxIsee - val) / (maxIsee - minIsee));
    };

    const numero_figli_totali = numero_figli_minori + numero_figli_maggiorenni + numero_figli_disabili_minori + numero_figli_disabili_18_21 + numero_figli_disabili_oltre_21;
    
    const importo_base_figlio_minore = calculateLinear(safeIsse, 17090.61, 45574.96, 199.4, 57.0);
    const importo_base_figlio_maggiorenne = calculateLinear(safeIsse, 17090.61, 45574.96, 96.9, 28.5);
    const importo_base_disabile_oltre_21 = calculateLinear(safeIsse, 17090.61, 45574.96, 91.9, 28.5);

    const importo_base_mensile = 
      (numero_figli_minori * importo_base_figlio_minore) + 
      (numero_figli_maggiorenni * importo_base_figlio_maggiorenne) + 
      (numero_figli_disabili_minori * importo_base_figlio_minore) + 
      (numero_figli_disabili_18_21 * importo_base_figlio_maggiorenne) +
      (numero_figli_disabili_oltre_21 * importo_base_disabile_oltre_21);

    const maggiorazione_figli_numerosi = numero_figli_totali > 2 ? calculateLinear(safeIsse, 17090.61, 45574.96, 96.9, 17.0) * (numero_figli_totali - 2) : 0;
    const maggiorazione_forfettaria_4_figli = numero_figli_totali >= 4 ? 171 : 0;
    const maggiorazione_disabilita = (numero_figli_disabili_minori * 119.6) + (numero_figli_disabili_18_21 * 85.7);
    const maggiorazione_genitori_lavoratori = entrambi_genitori_reddito ? calculateLinear(safeIsse, 17090.61, 45574.96, 34.1, 0) * numero_figli_totali : 0;
    const maggiorazione_madre_giovane = madre_under_21 ? 22.6 * numero_figli_totali : 0;

    const totale_maggiorazioni_mensili = maggiorazione_figli_numerosi + maggiorazione_forfettaria_4_figli + maggiorazione_disabilita + maggiorazione_genitori_lavoratori + maggiorazione_madre_giovane;
    const importo_totale_mensile = importo_base_mensile + totale_maggiorazioni_mensili;
    const importo_totale_annuale = importo_totale_mensile * 12;

    return { importo_base_mensile, totale_maggiorazioni_mensili, importo_totale_mensile, importo_totale_annuale };
  }, [states]);

  const chartData = [
    { name: 'Composizione Assegno', 'Importo Base': calculatedOutputs.importo_base_mensile, 'Maggiorazioni': calculatedOutputs.totale_maggiorazioni_mensili },
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
      pdf.save(`${slug}.pdf`);
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
        {/* Colonna Principale */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calcolatoreRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">{meta.description}</p>
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una valutazione ufficiale dell'INPS. I valori sono basati sulle normative più recenti.
              </div>

              {/* Sezione Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {inputs.map(input => {
                  const inputLabel = (
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                    </label>
                  );
                  if (input.type === 'boolean') {
                    return (
                      <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2.5 rounded-md bg-gray-50 border mt-2">
                        <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                      </div>
                    );
                  }
                  return (
                    <div key={input.id}>
                      {inputLabel}
                      <div className="relative">
                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                        {input.unit && <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Separatore */}
            <hr className="my-4"/>

            {/* Sezione Output e Grafico */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Simulazione</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risultati Numerici */}
                <div className="space-y-4">
                  {outputs.map(output => (
                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${output.id === 'importo_totale_mensile' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                      <span className="text-sm font-medium text-gray-700">{output.label}</span>
                      <span className={`text-xl font-bold ${output.id === 'importo_totale_mensile' ? 'text-indigo-600' : 'text-gray-800'}`}>
                        {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Grafico */}
                <div className="h-64 w-full bg-slate-50 p-2 rounded-lg">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}/>
                        <Legend iconType="circle" iconSize={10} />
                        <Bar dataKey="Importo Base" stackId="a" fill="#818cf8" />
                        <Bar dataKey="Maggiorazioni" stackId="a" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonna Laterale */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
              <button onClick={handleReset} className="w-full border border-red-300 text-red-700 rounded-md px-3 py-2 text-sm hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Campi</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida alla Comprensione</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-strumenti.assegno-unico-e-universale-per-i-figli-a-carico.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Pagina Ufficiale INPS Assegno Unico</a></li>
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2021-12-21;230!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Decreto Legislativo 230/2021</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default AssegnoUnicoUniversaleFigliCalculator;