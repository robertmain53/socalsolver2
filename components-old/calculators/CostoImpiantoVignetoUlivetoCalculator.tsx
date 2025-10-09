'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Costo Impianto Vigneto/Uliveto per ettaro",
  description: "Stima il costo dettagliato per ettaro per impiantare un nuovo vigneto o uliveto. Analizza i costi di materiali, manodopera e operazioni preliminari."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
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
            "name": "Quanto costa impiantare un ettaro di vigneto?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il costo di impianto di un ettaro di vigneto varia ampiamente, generalmente tra 25.000€ e 50.000€, a seconda della densità d'impianto, dei materiali scelti per la struttura (pali, fili) e del livello di meccanizzazione. Questo calcolatore fornisce una stima dettagliata basata su questi fattori."
            }
          },
          {
            "@type": "Question",
            "name": "È necessario avere dei 'diritti di impianto' per un nuovo vigneto?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, per impiantare un nuovo vigneto in Italia è obbligatorio possedere un'autorizzazione, comunemente nota come 'diritto di impianto'. Questi possono essere richiesti tramite bandi regionali o acquistati da altre aziende agricole."
            }
          },
          {
            "@type": "Question",
            "name": "Quali sono i principali incentivi per un nuovo impianto agricolo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Gli investimenti in agricoltura, come un nuovo impianto, possono beneficiare di contributi a fondo perduto tramite i PSR (Piani di Sviluppo Rurale) regionali e, per il settore vitivinicolo, l'OCM Vino (misura Ristrutturazione e Riconversione Vigneti)."
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

  const blocks = content.split('\n\n');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
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
  "slug": "costo-impianto-vigneto-uliveto",
  "category": "Agricoltura e Cibo",
  "title": "Calcolatore Costo Impianto Vigneto/Uliveto per ettaro",
  "lang": "it",
  "inputs": [
    {
      "id": "tipo_coltura",
      "label": "Tipo di Coltura",
      "type": "select" as const,
      "options": [
        { "value": "vigneto", "label": "Vigneto" },
        { "value": "uliveto", "label": "Uliveto" }
      ],
      "tooltip": "Scegli se stai pianificando un vigneto (per uva da vino o da tavola) o un uliveto. La scelta determina i costi relativi alla struttura di sostegno (pali, fili), assente nell'uliveto."
    },
    { "id": "distanza_tra_filari", "label": "Distanza tra i filari", "type": "number" as const, "unit": "m", "min": 1.5, "step": 0.1, "tooltip": "La distanza tra un filare e l'altro. Influisce sulla meccanizzazione, l'insolazione e la densità totale. Valori tipici per il vigneto: 2.2-3.0 metri. Per l'uliveto: 5-7 metri." },
    { "id": "distanza_sulla_fila", "label": "Distanza sulla fila", "type": "number" as const, "unit": "m", "min": 0.7, "step": 0.1, "tooltip": "La distanza tra una pianta e l'altra lungo lo stesso filare. Determina la competizione tra le piante. Valori tipici per il vigneto: 0.8-1.2 metri. Per l'uliveto: 4-6 metri." },
    { "id": "costo_singola_pianta", "label": "Costo singola pianta", "type": "number" as const, "unit": "€", "min": 0, "step": 0.1, "tooltip": "Il prezzo di una singola barbatella (vite) o di un astoncino (olivo). Il costo varia in base alla varietà, al portainnesto e alla certificazione sanitaria." },
    { "id": "costo_lavorazioni_terreno", "label": "Costo lavorazioni terreno", "type": "number" as const, "unit": "€/ha", "min": 0, "step": 100, "tooltip": "Costo per le operazioni preliminari come scasso, aratura profonda, livellamento e squadro del terreno. Fondamentale per un corretto sviluppo radicale." },
    { "id": "costo_concimazione_fondo", "label": "Costo concimazione di fondo", "type": "number" as const, "unit": "€/ha", "min": 0, "step": 50, "tooltip": "Costo per l'apporto di sostanza organica (letame, compost) e concimi minerali (fosforo, potassio) prima dell'impianto, basato sull'analisi del terreno." },
    { "id": "costo_manodopera_impianto", "label": "Costo manodopera per l'impianto", "type": "number" as const, "unit": "€/ha", "min": 0, "step": 100, "tooltip": "Costo totale della manodopera per la messa a dimora delle piante, l'installazione dei sostegni (per il vigneto) e altre operazioni manuali." },
    { "id": "costo_pali_testata", "label": "Costo palo di testata", "type": "number" as const, "unit": "€/cad.", "min": 0, "step": 1, "condition": "tipo_coltura == 'vigneto'", "tooltip": "Costo di un singolo palo di testata (o capofila), più robusto di quelli intermedi. Generalmente in legno, acciaio o cemento precompresso." },
    { "id": "costo_pali_intermedi", "label": "Costo palo intermedio", "type": "number" as const, "unit": "€/cad.", "min": 0, "step": 0.5, "condition": "tipo_coltura == 'vigneto'", "tooltip": "Costo di un singolo palo intermedio, posto lungo il filare per sostenere i fili. Solitamente più economici di quelli di testata." },
    { "id": "distanza_pali_intermedi", "label": "Distanza tra pali intermedi", "type": "number" as const, "unit": "m", "min": 3, "step": 0.5, "condition": "tipo_coltura == 'vigneto'", "tooltip": "Distanza a cui vengono posizionati i pali intermedi lungo il filare. Valori comuni sono tra 4 e 6 metri." },
    { "id": "costo_fili_accessori", "label": "Costo fili e accessori", "type": "number" as const, "unit": "€/ha", "min": 0, "step": 100, "condition": "tipo_coltura == 'vigneto'", "tooltip": "Costo complessivo per ettaro dei fili di sostegno (es. zinco-alluminio), tendifilo, ganci e ancoraggi necessari per la struttura del vigneto." },
    { "id": "impianto_irrigazione", "label": "Prevedi impianto di irrigazione?", "type": "boolean" as const, "tooltip": "Spunta se intendi installare un sistema di irrigazione a goccia, fondamentale in molte aree per la sopravvivenza delle giovani piante e la stabilità produttiva." },
    { "id": "costo_impianto_irrigazione", "label": "Costo impianto di irrigazione", "type": "number" as const, "unit": "€/ha", "min": 0, "step": 100, "condition": "impianto_irrigazione == true", "tooltip": "Costo per ettaro per l'acquisto e l'installazione di ali gocciolanti, tubazioni principali, filtri e raccordi." }
  ],
  "outputs": [
    { "id": "costo_totale_ha", "label": "Costo Totale Stimato per Ettaro", "unit": "€" },
    { "id": "costo_materiali_ha", "label": "Suddivisione: Costo Materiali", "unit": "€" },
    { "id": "costo_operazioni_ha", "label": "Suddivisione: Costo Operazioni e Manodopera", "unit": "€" },
    { "id": "num_piante_ha", "label": "Densità d'Impianto", "unit": "piante/ha" }
  ],
  "content": "### **Guida Completa al Costo di Impianto per Vigneti e Uliveti**\n\n**Analisi dei Fattori di Costo, Strategie di Ottimizzazione e Accesso ai Finanziamenti**\n\nL'installazione di un nuovo vigneto o uliveto è un investimento significativo che pone le basi per decenni di produzione agricola. Calcolare con precisione il costo per ettaro è un passo cruciale per la pianificazione finanziaria, la richiesta di finanziamenti e la sostenibilità a lungo termine dell'azienda. Questo strumento offre una stima dettagliata, ma è fondamentale comprendere ogni singola voce di costo.\n\nQuesto documento funge da guida approfondita, spiegando i parametri del calcolatore e fornendo un contesto più ampio che include aspetti burocratici, incentivi e strategie agronomiche. Ricorda: **nessun calcolatore automatico può sostituire un'analisi agronomica dettagliata e un business plan redatto da un professionista**.\n\n### **Parte 1: Il Calcolatore - Interpretazione dei Parametri**\n\nIl nostro calcolatore scompone l'investimento totale in due macro-categorie: **Costi dei Materiali** (piante, pali, fili, etc.) e **Costi delle Operazioni** (lavorazioni, manodopera). Vediamo ogni input in dettaglio.\n\n* **Tipo di Coltura**: La differenza economica principale risiede nella **struttura di sostegno** (spalliera), indispensabile per il vigneto ma assente nell'uliveto tradizionale. Questo rende l'impianto di un vigneto intrinsecamente più costoso.\n\n* **Sesto d'Impianto (Distanze)**: La combinazione tra la distanza _tra i filari_ e quella _sulla fila_ determina la **densità** di piante per ettaro. Un impianto più denso aumenta il costo delle piante ma può portare a una produzione di maggiore qualità e a una più rapida entrata in produzione. Le distanze devono essere scelte in funzione della vigoria del portainnesto, della fertilità del suolo e, soprattutto, delle macchine agricole che verranno utilizzate.\n\n* **Costo Pianta**: Il prezzo di barbatelle (viti) e olivi varia enormemente in base alla varietà, alla selezione clonale, al portainnesto e alle certificazioni fitosanitarie (es. Virus Esente). Risparmiare sulla qualità del materiale vivaistico è quasi sempre una cattiva idea.\n\n* **Lavorazioni e Concimazione**: Prima di piantare, il terreno deve essere preparato. Lo **scasso** o l'**aratura profonda** (a 80-100 cm) sono fondamentali per garantire un buon drenaggio e sviluppo radicale. La **concimazione di fondo**, basata su un'analisi chimico-fisica del terreno, corregge le carenze e apporta sostanza organica, un investimento per la fertilità futura.\n\n* **Struttura di Sostegno (Vigneto)**: È una delle voci di costo più impattanti. La scelta dei materiali ne determina durata e costo: i **pali in acciaio corten** o in **cemento precompresso** hanno una vita utile maggiore rispetto al legno, ma un costo iniziale più alto. Anche la qualità dei **fili** (es. zinco-alluminio) e degli **ancoraggi** è cruciale per resistere alle tensioni e agli agenti atmosferici.\n\n* **Impianto di Irrigazione**: L'irrigazione a goccia è ormai considerata un'operazione colturale indispensabile in quasi tutti gli areali per superare lo stress idrico delle giovani piante (barbatelle) e per garantire produzioni costanti. Il costo include ali gocciolanti, tubazioni, filtri e pozzetti.\n\n### **Parte 2: Oltre il Calcolo - Aspetti Strategici e Finanziari**\n\n#### **Autorizzazioni e Burocrazia: i Diritti di Impianto**\n\nPer impiantare un nuovo vigneto è necessario possedere un'**autorizzazione al reimpianto o un'autorizzazione da nuovo impianto**. Queste autorizzazioni, comunemente note come \"diritti di impianto\", sono contingentate a livello europeo e nazionale (1% della superficie vitata nazionale ogni anno). La loro acquisizione può avvenire tramite bandi regionali gratuiti o attraverso la compravendita da altre aziende, rappresentando un costo aggiuntivo non inserito nel calcolatore.\n\n#### **Ammortamento dell'Investimento**\n\nIl costo di impianto è un **costo pluriennale**. Deve essere ammortizzato lungo la vita utile del vigneto (tipicamente 20-25 anni) o dell'uliveto (oltre 50 anni). Un vigneto da 40.000 €/ha, ammortizzato in 25 anni, rappresenta un costo annuo di 1.600 €/ha, a cui si aggiungeranno i costi di gestione.\n\n#### **Finanziamenti e Contributi a Fondo Perduto**\n\nL'agricoltura beneficia di importanti aiuti pubblici che possono abbattere notevolmente l'investimento iniziale. Le principali fonti di finanziamento sono:\n\n* **PSR (Piano di Sviluppo Rurale)**: Erogato dalle Regioni, prevede misure specifiche per gli investimenti nelle aziende agricole, con contributi a fondo perduto che possono coprire dal 40% al 75% della spesa ammissibile, con premialità per giovani agricoltori e zone svantaggiate.\n\n* **OCM Vino (Organizzazione Comune di Mercato)**: Misura specifica per il settore vitivinicolo che finanzia la \"Ristrutturazione e Riconversione dei Vigneti\". Copre gran parte dei costi di impianto (estirpo, preparazione, pali, barbatelle, etc.) con un contributo a fondo perduto fino al 50% della spesa.\n\n### **FAQ - Domande Frequenti**\n\n**Quanto tempo ci vuole prima che un impianto entri in produzione?**\nUn vigneto inizia a produrre uve in modo significativo dal terzo anno dall'impianto. Un uliveto richiede generalmente più tempo, a partire dal quarto-quinto anno, a seconda del sistema di allevamento.\n\n**Qual è il costo di gestione annuale di un ettaro di vigneto/uliveto?**\nOltre al costo di impianto, bisogna considerare i costi annuali di gestione (potatura, trattamenti fitosanitari, concimazione, gestione del suolo, vendemmia/raccolta), che possono variare da 2.500 a oltre 6.000 €/ha a seconda del livello di meccanizzazione e del tipo di agricoltura (convenzionale, biologica).\n\n**Conviene di più un impianto denso o uno rado?**\nNon esiste una risposta unica. L'alta densità (oltre 5.000 piante/ha) è spesso associata a vini di alta qualità ma richiede più manodopera e investimenti iniziali. La bassa densità è più adatta a una meccanizzazione spinta e a costi di gestione inferiori. La scelta dipende dal modello di business e dagli obiettivi enologici o oleari."
};

const CostoImpiantoVignetoUlivetoCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    tipo_coltura: "vigneto",
    distanza_tra_filari: 2.5,
    distanza_sulla_fila: 0.9,
    costo_singola_pianta: 2.2,
    costo_lavorazioni_terreno: 1800,
    costo_concimazione_fondo: 900,
    costo_manodopera_impianto: 4500,
    costo_pali_testata: 25,
    costo_pali_intermedi: 12,
    distanza_pali_intermedi: 5,
    costo_fili_accessori: 3500,
    impianto_irrigazione: true,
    costo_impianto_irrigazione: 4000
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };
  
  const handleReset = () => {
    setStates(initialStates);
  };

  const calculatedOutputs = useMemo(() => {
    const { tipo_coltura, distanza_tra_filari, distanza_sulla_fila, costo_singola_pianta, costo_lavorazioni_terreno, costo_concimazione_fondo, costo_manodopera_impianto, costo_pali_testata, costo_pali_intermedi, distanza_pali_intermedi, costo_fili_accessori, impianto_irrigazione, costo_impianto_irrigazione } = states;
    
    const num_piante_ha = 10000 / (distanza_tra_filari * distanza_sulla_fila);
    const costo_piante_ha = num_piante_ha * costo_singola_pianta;

    const num_filari_ha = 100 / distanza_tra_filari;
    const num_pali_testata_ha = num_filari_ha * 2;
    const num_pali_intermedi_ha = Math.max(0, ((100 / distanza_pali_intermedi) - 1)) * num_filari_ha;
    
    const costo_pali_ha = (num_pali_testata_ha * costo_pali_testata) + (num_pali_intermedi_ha * costo_pali_intermedi);
    const costo_struttura_vigneto_ha = tipo_coltura === 'vigneto' ? (costo_pali_ha || 0) + (costo_fili_accessori || 0) : 0;
    
    const costo_irrigazione_ha = impianto_irrigazione ? costo_impianto_irrigazione : 0;
    
    const costo_materiali_ha = costo_piante_ha + costo_struttura_vigneto_ha + costo_irrigazione_ha;
    const costo_operazioni_ha = costo_lavorazioni_terreno + costo_concimazione_fondo + costo_manodopera_impianto;
    
    const costo_totale_ha = costo_materiali_ha + costo_operazioni_ha;

    return {
      costo_totale_ha,
      costo_materiali_ha,
      costo_operazioni_ha,
      num_piante_ha,
      costo_piante_ha,
      costo_struttura_vigneto_ha,
      costo_irrigazione_ha
    };
  }, [states]);

  const chartData = [
    { name: 'Piante', value: calculatedOutputs.costo_piante_ha, fill: '#4ade80' },
    { name: 'Struttura', value: calculatedOutputs.costo_struttura_vigneto_ha, fill: '#facc15' },
    { name: 'Irrigazione', value: calculatedOutputs.costo_irrigazione_ha, fill: '#60a5fa' },
    { name: 'Operazioni', value: calculatedOutputs.costo_operazioni_ha, fill: '#f87171' },
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
    } catch (_e) { alert("Impossibile esportare in PDF."); }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const { costo_piante_ha, costo_struttura_vigneto_ha, costo_irrigazione_ha, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
      alert("Risultato salvato con successo!");
    } catch { alert("Impossibile salvare il risultato."); }
  }, [states, calculatedOutputs, slug, title]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  const formatNumber = (value: number) => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(value);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-4">{meta.description}</p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo informativo. I costi reali possono variare in base ai fornitori, alla localizzazione e alle condizioni specifiche del terreno. Consultare sempre un agronomo o un tecnico specializzato.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
              {inputs.map(input => {
                let conditionMet = true;
                if (input.condition) {
                   const [key, value] = input.condition.replace(/'/g, "").split(' == ');
                   conditionMet = states[key] === value;
                }
                if (!conditionMet) return null;

                const inputLabel = (
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                  </label>
                );

                if (input.type === 'boolean') {
                  return (
                    <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                      <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                      <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                    </div>
                  );
                }

                if (input.type === 'select') {
                    return (
                        <div key={input.id} className="md:col-span-2">
                            {inputLabel}
                            <select id={input.id} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
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
                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'costo_totale_ha' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                  <div className={`text-xl md:text-2xl font-bold ${output.id === 'costo_totale_ha' ? 'text-indigo-600' : 'text-gray-800'}`}>
                    <span>
                      {isClient 
                        ? (output.unit === '€' ? formatCurrency((calculatedOutputs as any)[output.id]) : formatNumber((calculatedOutputs as any)[output.id])) 
                        : '...'}
                      {output.unit !== '€' && <span className="text-sm font-normal text-gray-500 ml-1">{output.unit}</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione dei Costi Stimati</h3>
              <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} stroke="#374151" />
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                        <Bar dataKey="value" name="Costo" background={{ fill: '#eee' }}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={salvaRisultato} className="w-full text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
              <button onClick={handleReset} className="w-full text-center border border-red-300 text-red-700 rounded-md px-4 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
            </div>
          </section>
          
          <div className="space-y-6">
            <section className="border rounded-lg p-4 bg-white shadow-md">
              <h2 className="font-semibold mb-2 text-gray-800">Guida all'Impianto</h2>
              <ContentRenderer content={content} />
            </section>
            <section className="border rounded-lg p-4 bg-white shadow-md">
              <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Utili</h2>
              <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                <li><a href="https://www.ismea.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ISMEA - Istituto di Servizi per il Mercato Agricolo Alimentare</a></li>
                <li><a href="https://www.reterurale.it/psr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Rete Rurale Nazionale - Piani di Sviluppo Rurale (PSR)</a></li>
                <li><a href="https://www.politicheagricole.it/flex/main/Home/Home.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ministero dell'agricoltura, della sovranità alimentare e delle foreste</a></li>
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </>
  );
};

export default CostoImpiantoVignetoUlivetoCalculator;