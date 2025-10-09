'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Contributi PAC 2023-2027 | Stima Pagamenti",
  description: "Simula il calcolo dei contributi della Politica Agricola Comune (PAC) in base a superficie, titoli, ecoschemi e altri parametri. Ottieni una stima dettagliata."
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
            "name": "Come funziona il calcolo dei contributi PAC?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il calcolo si basa su diversi elementi: un Sostegno al Reddito di Base (BISS) legato a titoli e superficie, pagamenti volontari per pratiche ambientali (Ecoschemi), un aiuto per i giovani agricoltori e un sostegno accoppiato per settori specifici. Questo strumento stima il totale combinando questi fattori."
            }
          },
          {
            "@type": "Question",
            "name": "Cosa sono gli Ecoschemi della nuova PAC?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Gli Ecoschemi sono regimi volontari che premiano gli agricoltori per l'adozione di pratiche sostenibili che vanno oltre gli obblighi di base. Esempi includono l'inerbimento delle colture arboree, la salvaguardia di olivi paesaggistici e la gestione estensiva dei pascoli."
            }
          },
          {
            "@type": "Question",
            "name": "Questo calcolatore è uno strumento ufficiale di AGEA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, questo è uno strumento di simulazione indipendente creato a scopo informativo. Non è affiliato ad AGEA o ad altri organismi pagatori. I risultati sono una stima e per la domanda ufficiale è necessario rivolgersi a un Centro di Assistenza Agricola (CAA)."
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
        if (trimmedBlock) {
          return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        }
        return null;
      })}
    </div>
  );
};

// Dati di configurazione del calcolatore (inclusi direttamente)
const calculatorData = {
  "slug": "pac-politica-agricola-contributi",
  "category": "Agricoltura e Cibo",
  "title": "Calcolatore PAC (Politica Agricola Comune) - Stima Contributi",
  "lang": "it",
  "inputs": [
    { "id": "superficie_ha", "label": "Superficie Agricola Utilizzata (SAU)", "type": "number" as const, "unit": "ha", "min": 0, "step": 1, "tooltip": "Inserisci la superficie totale ammissibile ai pagamenti diretti, espressa in ettari." },
    { "id": "valore_titolo_base_unitario", "label": "Valore Medio Titoli PAC di Base", "type": "number" as const, "unit": "€/ha", "min": 0, "step": 1, "tooltip": "Inserisci il valore unitario medio dei tuoi titoli PAC prima della convergenza. Se non lo conosci, puoi usare il valore medio nazionale (circa 165 €/ha) come stima." },
    { "id": "giovane_agricoltore", "label": "Sei un 'Giovane Agricoltore'?", "type": "boolean" as const, "tooltip": "Spunta se possiedi i requisiti di 'Giovane Agricoltore' (meno di 40 anni, primo insediamento da meno di 5 anni)." },
    { "id": "adesione_ecoschema_2", "label": "Adesione Ecoschema 2 (Inerbimento colture arboree)", "type": "boolean" as const, "tooltip": "Spunta se applichi l'inerbimento su colture arboree come vigneti, oliveti o frutteti." },
    { "id": "superficie_ecoschema_2", "label": "Superficie Ecoschema 2", "type": "number" as const, "unit": "ha", "min": 0, "step": 1, "condition": "adesione_ecoschema_2 == true", "tooltip": "Indica quanti ettari di colture arboree sono gestiti con la pratica dell'inerbimento." },
    { "id": "adesione_ecoschema_3", "label": "Adesione Ecoschema 3 (Salvaguardia olivi)", "type": "boolean" as const, "tooltip": "Spunta se possiedi oliveti di particolare valore paesaggistico con densità tra 100 e 300 piante/ha." },
    { "id": "superficie_ecoschema_3", "label": "Superficie Ecoschema 3", "type": "number" as const, "unit": "ha", "min": 0, "step": 1, "condition": "adesione_ecoschema_3 == true", "tooltip": "Indica la superficie degli oliveti che rientrano nei criteri dell'Ecoschema 3." },
    { "id": "adesione_ecoschema_4", "label": "Adesione Ecoschema 4 (Sistemi foraggeri estensivi)", "type": "boolean" as const, "tooltip": "Spunta se pratichi sistemi foraggeri estensivi con avvicendamento e senza l'uso di diserbanti chimici." },
    { "id": "superficie_ecoschema_4", "label": "Superficie Ecoschema 4", "type": "number" as const, "unit": "ha", "min": 0, "step": 1, "condition": "adesione_ecoschema_4 == true", "tooltip": "Indica la superficie destinata a questo tipo di sistema foraggero." },
    { "id": "coltivazione_accoppiato", "label": "Coltivi colture da Sostegno Accoppiato?", "type": "boolean" as const, "tooltip": "Spunta se coltivi colture che beneficiano del sostegno accoppiato, come soia, riso, grano duro o pomodoro da industria." },
    { "id": "superficie_accoppiato", "label": "Superficie con Sostegno Accoppiato", "type": "number" as const, "unit": "ha", "min": 0, "step": 1, "condition": "coltivazione_accoppiato == true", "tooltip": "Indica la superficie totale destinata a queste colture. Il calcolatore userà un valore medio di stima." }
  ],
  "outputs": [
    { "id": "pagamento_base", "label": "Sostegno al Reddito di Base (BISS)", "unit": "€" },
    { "id": "pagamento_ecoschemi", "label": "Pagamento per Ecoschemi", "unit": "€" },
    { "id": "pagamento_giovani_agricoltori", "label": "Sostegno Giovani Agricoltori", "unit": "€" },
    { "id": "pagamento_accoppiato_stimato", "label": "Sostegno Accoppiato (Stima)", "unit": "€" },
    { "id": "contributo_totale_pac", "label": "Contributo PAC Totale Stimato", "unit": "€" }
  ],
  "content": "### **Guida Completa ai Contributi PAC 2023-2027**\n\n**Architettura, Criteri di Calcolo e Opportunità per le Aziende Agricole**\n\nLa Politica Agricola Comune (PAC) è il principale strumento con cui l'Unione Europea sostiene il settore agricolo. La programmazione 2023-2027 ha introdotto importanti novità, con un'enfasi crescente su sostenibilità ambientale, equità e supporto mirato. Questo strumento offre una **stima dei potenziali contributi**, aiutando agricoltori e consulenti a navigare la nuova architettura dei pagamenti diretti.\n\nRicorda: questo calcolatore è uno strumento di simulazione e non sostituisce la Domanda Unica ufficiale né la consulenza di un Centro di Assistenza Agricola (CAA). I valori dei pagamenti per ettaro sono basati su stime nazionali e possono variare.\n\n### **Parte 1: La Struttura dei Pagamenti Diretti PAC**\n\nLa nuova PAC si articola su diversi livelli di sostegno, concepiti per remunerare non solo la produzione, ma anche la tutela ambientale e il ricambio generazionale.\n\n#### **1. Sostegno al Reddito di Base per la Sostenibilità (BISS)**\n\nÈ il pilastro fondamentale della PAC. Sostituisce il vecchio 'pagamento di base'. Il BISS è erogato sulla base dei **titoli PAC** detenuti dall'agricoltore, associati a una superficie ammissibile. Un elemento chiave è la **convergenza**: i titoli di valore inferiore alla media nazionale vengono progressivamente aumentati, mentre quelli di valore superiore vengono ridotti, con l'obiettivo di raggiungere un valore più equo per tutti entro il 2026. Il nostro calcolatore simula questo processo per fornire una stima più accurata.\n\n#### **2. Pagamenti per gli Ecoschemi**\n\nQuesta è la novità più significativa. Gli ecoschemi sono regimi volontari che premiano gli agricoltori che adottano pratiche agricole benefiche per il clima e l'ambiente, andando oltre la condizionalità di base. L'adesione è facoltativa, ma rappresenta un'importante opportunità di reddito aggiuntivo. Il calcolatore include alcuni degli ecoschemi più comuni per le coltivazioni:\n\n* **Ecoschema 2**: Inerbimento delle colture arboree (vigneti, oliveti, frutteti). Prevede il mantenimento di una copertura vegetale spontanea o seminata tra i filari per migliorare la fertilità del suolo e ridurre l'erosione.\n* **Ecoschema 3**: Salvaguardia degli olivi di valore paesaggistico. Tutela e valorizza gli oliveti storici che sono a rischio di abbandono ma che costituiscono un elemento fondamentale del paesaggio rurale italiano.\n* **Ecoschema 4**: Sistemi foraggeri estensivi con avvicendamento. Promuove pratiche di gestione dei prati e dei pascoli che aumentano la biodiversità e lo stoccaggio di carbonio nel suolo, vietando l'uso di diserbanti.\n\nCi sono altri ecoschemi, come l'Ecoschema 1 per il benessere animale e l'Ecoschema 5 per gli impollinatori, che per la loro complessità non sono inclusi in questa simulazione.\n\n#### **3. Sostegno Complementare per i Giovani Agricoltori**\n\nPer favorire il ricambio generazionale, la PAC prevede un pagamento aggiuntivo per gli agricoltori che hanno meno di 40 anni e che si sono insediati per la prima volta come capo azienda da non più di cinque anni. Il sostegno è calcolato per ettaro, fino a un massimo di 90 ettari.\n\n#### **4. Sostegno Accoppiato al Reddito**\n\nQuesto tipo di aiuto è mirato a specifici settori o produzioni che affrontano difficoltà, per garantirne la redditività e la continuità. È 'accoppiato' perché legato a una specifica produzione (es. grano duro, riso, soia, pomodoro da industria, latte, carne bovina). Poiché gli importi variano notevolmente per settore, il calcolatore utilizza un valore medio per fornire una stima indicativa per le superfici inserite.\n\n### **Parte 2: Condizionalità e Aspetti Fondamentali**\n\n#### **La Condizionalità Rafforzata**\n\nPer poter accedere a qualsiasi pagamento PAC, è obbligatorio rispettare una serie di criteri di gestione obbligatori (CGO) e di Buone Condizioni Agronomiche e Ambientali (BCAA). Questi standard riguardano la protezione delle acque, la gestione del suolo, la biodiversità e il paesaggio. La violazione di queste norme può portare a riduzioni o all'esclusione dai pagamenti.\n\n#### **Come si Presenta la Domanda?**\n\nL'accesso ai fondi PAC avviene tramite la presentazione annuale della **Domanda Unica**. Questa domanda deve essere compilata e inviata telematicamente, di solito con il supporto di un CAA, agli organismi pagatori regionali o ad AGEA (Agenzia per le Erogazioni in Agricoltura).\n\n### **Conclusione: Uno Strumento per Orientarsi**\n\nComprendere il potenziale impatto economico della nuova PAC è fondamentale per la pianificazione aziendale. Utilizza questo calcolatore per esplorare diversi scenari, ad esempio valutando l'impatto economico dell'adesione a un nuovo ecoschema. Per una consulenza personalizzata e per procedere con la domanda, rivolgiti sempre al tuo consulente di fiducia o a un Centro di Assistenza Agricola autorizzato."
};

const PacPoliticaAgricolaContributiCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    superficie_ha: 75,
    valore_titolo_base_unitario: 155,
    giovane_agricoltore: true,
    adesione_ecoschema_2: true,
    superficie_ecoschema_2: 30,
    adesione_ecoschema_3: false,
    superficie_ecoschema_3: 0,
    adesione_ecoschema_4: true,
    superficie_ecoschema_4: 20,
    coltivazione_accoppiato: true,
    superficie_accoppiato: 15
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setStates(initialStates);
  };

  const calculatedOutputs = useMemo(() => {
    const {
      superficie_ha = 0, valore_titolo_base_unitario = 0, giovane_agricoltore = false,
      adesione_ecoschema_2 = false, superficie_ecoschema_2 = 0,
      adesione_ecoschema_3 = false, superficie_ecoschema_3 = 0,
      adesione_ecoschema_4 = false, superficie_ecoschema_4 = 0,
      coltivazione_accoppiato = false, superficie_accoppiato = 0,
    } = states;

    const VTM_NAZIONALE = 165.00;
    const valore_convergente = valore_titolo_base_unitario + (VTM_NAZIONALE - valore_titolo_base_unitario) * 0.85; // Simula convergenza parziale
    const pagamento_base = superficie_ha * valore_convergente;

    const pagamento_eco_2 = adesione_ecoschema_2 ? (superficie_ecoschema_2 || 0) * 120 : 0;
    const pagamento_eco_3 = adesione_ecoschema_3 ? (superficie_ecoschema_3 || 0) * 220 : 0;
    const pagamento_eco_4 = adesione_ecoschema_4 ? (superficie_ecoschema_4 || 0) * 110 : 0;
    const pagamento_ecoschemi = pagamento_eco_2 + pagamento_eco_3 + pagamento_eco_4;

    const pagamento_giovani_agricoltori = giovane_agricoltore ? Math.min(superficie_ha, 90) * 83.5 : 0;
    const pagamento_accoppiato_stimato = coltivazione_accoppiato ? (superficie_accoppiato || 0) * 125 : 0; // Stima media

    const contributo_totale_pac = pagamento_base + pagamento_ecoschemi + pagamento_giovani_agricoltori + pagamento_accoppiato_stimato;

    return {
      pagamento_base,
      pagamento_ecoschemi,
      pagamento_giovani_agricoltori,
      pagamento_accoppiato_stimato,
      contributo_totale_pac,
    };
  }, [states]);

  const chartData = [
    { name: 'BISS', value: calculatedOutputs.pagamento_base, fill: '#4f46e5' },
    { name: 'Ecoschemi', value: calculatedOutputs.pagamento_ecoschemi, fill: '#34d399' },
    { name: 'Giovani', value: calculatedOutputs.pagamento_giovani_agricoltori, fill: '#f59e0b' },
    { name: 'Accoppiato', value: calculatedOutputs.pagamento_accoppiato_stimato, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const formulaUsata = `Totale = (Superficie * ValoreTitoloConvergente) + PagamentiEcoschemi + BonusGiovani + SostegnoAccoppiato`;

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
    } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const savedResults = JSON.parse(localStorage.getItem("pac_calc_results") || "[]");
      const newResults = [payload, ...savedResults].slice(0, 10);
      localStorage.setItem("pac_calc_results", JSON.stringify(newResults));
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
            <p className="text-gray-600 mb-4">Stima i tuoi contributi PAC 2023-2027 in base alla nuova architettura dei pagamenti.</p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza specializzata o la Domanda Unica ufficiale.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {inputs.map(input => {
                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
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

                return (
                  <div key={input.id}>
                    {inputLabel}
                    <div className="flex items-center gap-2">
                      <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id] || ''} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                      {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
              {outputs.map(output => (
                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'contributo_totale_pac' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                  <div className={`text-xl md:text-2xl font-bold ${output.id === 'contributo_totale_pac' ? 'text-indigo-600' : 'text-gray-800'}`}>
                    <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione del Contributo Stimato</h3>
              <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" tickFormatter={(value) => `€${value / 1000}k`} />
                        <YAxis type="category" dataKey="name" width={80} />
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                        <Bar dataKey="value" name="Importo" barSize={40}>
                           {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                           ))}
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
             <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetica</h3>
                <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full border text-sm border-red-300 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida alla Nuova PAC</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.politicheagricole.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/19023" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Piano Strategico Nazionale della PAC (MASAF)</a></li>
              <li><a href="https://www.agea.gov.it/portal/page/portal/AGEAPageGroup/HomeAGEA" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia per le Erogazioni in Agricoltura (AGEA)</a></li>
              <li><a href="https://agriculture.ec.europa.eu/common-agricultural-policy/cap-strategic-plans/italy_it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">La PAC in Italia (Commissione Europea)</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default PacPoliticaAgricolaContributiCalculator;