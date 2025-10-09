'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const meta = {
  title: "Calcolatore Dettagliato Costi di Gestione Agriturismo",
  description: "Stima i costi fissi, variabili e l'utile del tuo agriturismo. Uno strumento essenziale per il tuo business plan e per ottimizzare la gestione."
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
            "name": "Quali sono i principali costi di gestione di un agriturismo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I costi principali includono il personale (stipendi, contributi), le materie prime per la ristorazione (food cost), le utenze (energia, acqua, gas), l'affitto o mutuo della struttura, le spese di manutenzione, il marketing e le commissioni ai portali di prenotazione, le tasse e le consulenze professionali."
            }
          },
          {
            "@type": "Question",
            "name": "Qual è la redditività media di un agriturismo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La redditività varia ampiamente in base a posizione, dimensioni, servizi offerti e qualità della gestione. Un utile lordo (EBIT) ben gestito può variare dal 15% al 30% del fatturato totale. Questo calcolatore aiuta a stimare questo valore per il tuo caso specifico."
            }
          },
          {
            "@type": "Question",
            "name": "Che regime fiscale si applica agli agriturismi in Italia?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Gli agriturismi, se rispettano i requisiti della Legge 96/2006, possono accedere a un regime fiscale forfettario agevolato. Il reddito imponibile viene calcolato applicando un coefficiente di redditività del 25% ai ricavi, rendendolo molto vantaggioso rispetto al regime ordinario."
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
        if (trimmedBlock.startsWith('**Esempio Pratico**:')) {
             return (
                <div key={index} className="bg-gray-100 p-3 my-4 border-l-4 border-gray-400">
                    <p className="font-semibold">Esempio Pratico:</p>
                    <p className="text-xs" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.split('\n')[1])}}></p>
                </div>
             )
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
  "slug": "costi-gestione-agriturismo",
  "category": "Agricoltura e Cibo",
  "title": "Calcolatore Costi di Gestione di un Agriturismo",
  "lang": "it",
  "inputs": [
    { "id": "numero_camere", "label": "Numero di camere/alloggi", "type": "number", "min": 0, "step": 1, "tooltip": "Il numero totale di unità abitative (camere, appartamenti) che l'agriturismo offre." },
    { "id": "prezzo_medio_camera", "label": "Prezzo medio per camera/notte", "type": "number", "unit": "€", "min": 0, "step": 5, "tooltip": "La tariffa media giornaliera per camera, tenendo conto della stagionalità e delle diverse tipologie di alloggio." },
    { "id": "tasso_occupazione", "label": "Tasso di occupazione medio", "type": "number", "unit": "%", "min": 0, "max": 100, "step": 1, "tooltip": "La percentuale media di camere occupate su base annua. Una stima realistica è tra il 40% e il 60%." },
    { "id": "numero_pasti_mese", "label": "Numero medio di pasti serviti al mese", "type": "number", "min": 0, "step": 10, "tooltip": "Il numero totale di coperti (pranzi e cene) che prevedi di servire in un mese medio." },
    { "id": "prezzo_medio_pasto", "label": "Prezzo medio di un pasto", "type": "number", "unit": "€", "min": 0, "step": 1, "tooltip": "L'incasso medio per coperto, bevande escluse o incluse a seconda del tuo modello di business." },
    { "id": "costo_personale_mese", "label": "Costo del personale (stipendi e contributi)", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Il costo mensile totale per tutto il personale (cuochi, camerieri, addetti alle pulizie, reception), inclusi stipendi, contributi (INPS, INAIL), TFR, etc." },
    { "id": "affitto_mutuo_mese", "label": "Affitto o rata del mutuo", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "La spesa fissa mensile per l'immobile in cui ha sede l'attività." },
    { "id": "utenze_fisse_variabili_mese", "label": "Utenze (luce, acqua, gas, rifiuti)", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Una stima del costo mensile totale per le utenze. Questo costo ha una componente fissa e una variabile legata all'occupazione." },
    { "id": "costo_materie_prime_percentuale", "label": "Costo materie prime (Food Cost)", "type": "number", "unit": "%", "min": 0, "max": 100, "step": 1, "tooltip": "La percentuale del ricavo da ristorazione che viene spesa per l'acquisto di cibo e bevande. Un valore tipico è tra il 25% e il 40%." },
    { "id": "costi_servizi_camera_giorno", "label": "Costi variabili per camera occupata", "type": "number", "unit": "€", "min": 0, "step": 1, "tooltip": "Il costo giornaliero per la pulizia, la lavanderia, i prodotti di cortesia e le piccole manutenzioni per ogni camera occupata." },
    { "id": "marketing_commissioni_mese", "label": "Marketing e commissioni OTA", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "La spesa mensile per pubblicità, social media, e le commissioni pagate ai portali di prenotazione online (es. Booking, Expedia)." },
    { "id": "tasse_consulenze_mese", "label": "Tasse, imposte e consulenze", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Una stima mensile per commercialista, consulente del lavoro, e imposte fisse come IMU, TARI (tassa rifiuti), escludendo le imposte sul reddito." },
    { "id": "altri_costi_fissi_mese", "label": "Altri costi fissi mensili", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Una voce per includere altre spese fisse non elencate, come assicurazioni, software gestionali, manutenzione ordinaria, etc." }
  ],
  "outputs": [
    { "id": "ricavi_totali_mese", "label": "Ricavi Totali Mensili Stimati", "unit": "€" },
    { "id": "costi_totali_mese", "label": "Costi di Gestione Totali Mensili", "unit": "€" },
    { "id": "utile_lordo_mese", "label": "Utile Lordo Mensile (EBIT)", "unit": "€" },
    { "id": "punto_pareggio_fatturato", "label": "Punto di Pareggio (Fatturato Mensile)", "unit": "€" }
  ],
  "content": "### **Guida Completa al Calcolo dei Costi di Gestione di un Agriturismo**\n\n**Analisi, Pianificazione e Ottimizzazione per un Business Sostenibile**\n\nGestire un agriturismo è un'impresa che unisce la passione per l'ospitalità e l'agricoltura a una necessaria e solida pianificazione economica. Comprendere a fondo la struttura dei costi è il primo passo per garantire la redditività e la sostenibilità a lungo termine del proprio progetto. \n\nQuesto strumento è progettato per offrire una **stima realistica e dettagliata** dei costi di gestione mensili, aiutandoti a trasformare la tua visione in un business plan concreto. **Ricorda**: i risultati sono una simulazione e non sostituiscono l'analisi di un commercialista o di un consulente esperto del settore.\n\n### **Parte 1: Il Calcolatore - Guida alla Compilazione dei Campi**\n\nPer ottenere una stima accurata, è fondamentale inserire dati il più possibile vicini alla realtà del tuo progetto. Ogni campo del calcolatore rappresenta una componente chiave del tuo bilancio.\n\n* **Dati Strutturali e di Ricavo**: Questa sezione definisce il potenziale di guadagno della tua attività. Si basa sul numero di alloggi, sui coperti del ristorante, sui prezzi medi e sul tasso di occupazione, che è uno degli indicatori più importanti per la salute del business.\n* **Costi del Personale**: Spesso la voce di spesa più significativa. Include non solo gli stipendi netti, ma anche i contributi previdenziali e assistenziali, il TFR e le imposte a carico dell'azienda.\n* **Costi Fissi Operativi**: Comprendono tutte quelle spese che devi sostenere indipendentemente dal numero di ospiti, come l'affitto o il mutuo, le consulenze (commercialista), le assicurazioni e i software gestionali.\n* **Costi Variabili**: Questi costi sono direttamente proporzionali al volume di attività. I più importanti sono il *food cost* (il costo delle materie prime per la ristorazione), i costi di pulizia e lavanderia per le camere, le utenze energetiche e le commissioni da versare ai portali di prenotazione online (OTA).\n\n### **Parte 2: Analisi Approfondita dei Risultati**\n\nIl calcolatore fornisce quattro metriche fondamentali per valutare la salute economica del tuo agriturismo.\n\n#### **Utile Lordo Mensile (EBIT)**\nL'Utile Lordo (o EBIT - Earnings Before Interest and Taxes) rappresenta il profitto generato dall'attività operativa, prima di considerare gli interessi passivi (es. sul mutuo) e le imposte sul reddito. È l'indicatore più veritiero della performance della gestione: un EBIT positivo e robusto segnala che l'attività è intrinsecamente profittevole.\n\n#### **Punto di Pareggio (Break-Even Point)**\nQuesto valore è cruciale: indica **il fatturato minimo mensile che devi generare per coprire tutti i tuoi costi (fissi e variabili)**. Al di sopra di questa soglia, inizi a generare un profitto; al di sotto, sei in perdita. Conoscere il proprio punto di pareggio è fondamentale per fissare obiettivi di vendita realistici e per prendere decisioni strategiche (es. promozioni nei periodi di bassa stagione per raggiungere almeno il pareggio).\n\n### **Parte 3: Aspetti Normativi e Fiscali Chiave**\n\nL'attività agrituristica in Italia è regolata da una normativa specifica che offre importanti vantaggi, ma impone anche precisi requisiti.\n\n#### **Definizione Legale di Agriturismo**\n\n Secondo la legge quadro nazionale (Legge n. 96 del 20 febbraio 2006), per essere definito \"agriturismo\", l'attività di ospitalità deve essere **connessa e complementare** a quella agricola principale, che deve rimanere prevalente. Ciò significa che l'imprenditore deve essere prima di tutto un agricoltore (Imprenditore Agricolo Professionale - IAP, o Coltivatore Diretto). I prodotti serviti a tavola, inoltre, devono provenire in misura prevalente dalla propria azienda agricola.\n\n#### **Il Regime Fiscale Agevolato**\nUno dei maggiori vantaggi è il regime fiscale forfettario. A differenza delle imprese turistiche tradizionali, il reddito imponibile non viene calcolato come differenza tra ricavi e costi, ma applicando un **coefficiente di redditività** (attualmente al 25%) ai ricavi, al netto dell'IVA. \n\n**Esempio Pratico**:\nSu 100.000 € di ricavi annui, la base imponibile su cui calcolare le imposte sarà solo di 25.000 €. Questo regime semplifica la contabilità e riduce notevolmente il carico fiscale, a patto di rispettare tutti i vincoli normativi.\n\n### **Parte 4: Strategie di Ottimizzazione dei Costi**\n\nPer aumentare la redditività, è possibile agire sia sul fronte dei ricavi che su quello dei costi.\n\n* **Controllo del Food Cost**: Monitora attentamente i costi delle materie prime, riduci gli sprechi, prediligi menù stagionali basati sui prodotti della tua azienda agricola.\n* **Disintermediazione**: Incentiva le prenotazioni dirette tramite il tuo sito web o canali social per ridurre le costose commissioni delle OTA (che possono arrivare fino al 15-20% del prezzo della camera).\n* **Efficienza Energetica**: Investi in soluzioni per il risparmio energetico (es. pannelli solari, illuminazione a LED, infissi isolanti). Le utenze rappresentano un costo variabile significativo che può essere ottimizzato.\n* **Marketing Mirato**: Focalizza le tue campagne di marketing su nicchie di clientela specifiche (famiglie, amanti del trekking, enoturisti) per massimizzare il ritorno sull'investimento pubblicitario.\n\n**Conclusione:**\nAvviare e gestire un agriturismo di successo richiede una pianificazione meticolosa. Usa questo calcolatore come punto di partenza per costruire il tuo business plan, validare le tue ipotesi e prendere decisioni informate. Buona fortuna!"
};

const CostiGestioneAgriturismoCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);
  
  const initialStates = {
    numero_camere: 6,
    prezzo_medio_camera: 90,
    tasso_occupazione: 50,
    numero_pasti_mese: 400,
    prezzo_medio_pasto: 35,
    costo_personale_mese: 4500,
    affitto_mutuo_mese: 1500,
    utenze_fisse_variabili_mese: 1200,
    costo_materie_prime_percentuale: 30,
    costi_servizi_camera_giorno: 12,
    marketing_commissioni_mese: 800,
    tasse_consulenze_mese: 700,
    altri_costi_fissi_mese: 500
  };
  const [states, setStates] = useState<{[key: string]: any}>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({...prev, [id]: value}));
  };

  const handleReset = () => {
    setStates(initialStates);
  };

  const calculatedOutputs = useMemo(() => {
    const {
      numero_camere, prezzo_medio_camera, tasso_occupazione, numero_pasti_mese, prezzo_medio_pasto,
      costo_personale_mese, affitto_mutuo_mese, tasse_consulenze_mese, altri_costi_fissi_mese,
      costo_materie_prime_percentuale, costi_servizi_camera_giorno, utenze_fisse_variabili_mese,
      marketing_commissioni_mese
    } = states;

    const giorni_mese = 30.4;
    const ricavi_alloggio = numero_camere * prezzo_medio_camera * (tasso_occupazione / 100) * giorni_mese;
    const ricavi_ristorazione = numero_pasti_mese * prezzo_medio_pasto;
    const ricavi_totali_mese = ricavi_alloggio + ricavi_ristorazione;

    const costi_fissi_mese = costo_personale_mese + affitto_mutuo_mese + tasse_consulenze_mese + altri_costi_fissi_mese;
    
    const costi_variabili_ristorazione = ricavi_ristorazione * (costo_materie_prime_percentuale / 100);
    const costi_variabili_alloggio = numero_camere * (tasso_occupazione / 100) * giorni_mese * costi_servizi_camera_giorno;
    const costi_variabili_generali = utenze_fisse_variabili_mese + marketing_commissioni_mese;
    const costi_variabili_totali_mese = costi_variabili_ristorazione + costi_variabili_alloggio + costi_variabili_generali;

    const costi_totali_mese = costi_fissi_mese + costi_variabili_totali_mese;
    const utile_lordo_mese = ricavi_totali_mese - costi_totali_mese;

    const margine_contribuzione = ricavi_totali_mese > 0 ? (ricavi_totali_mese - costi_variabili_totali_mese) / ricavi_totali_mese : 0;
    const punto_pareggio_fatturato = margine_contribuzione > 0 ? costi_fissi_mese / margine_contribuzione : 0;

    return {
      ricavi_totali_mese,
      costi_totali_mese,
      utile_lordo_mese,
      punto_pareggio_fatturato,
      costi_fissi_mese,
      costi_variabili_totali_mese
    };
  }, [states]);

  const chartData = [
    { name: 'Analisi Mensile', Ricavi: calculatedOutputs.ricavi_totali_mese, 'Costi Totali': calculatedOutputs.costi_totali_mese, 'Utile Lordo': calculatedOutputs.utile_lordo_mese > 0 ? calculatedOutputs.utile_lordo_mese : 0 },
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
    } catch (_e) { alert("Funzione PDF non disponibile in questo ambiente"); }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const { costi_fissi_mese, costi_variabili_totali_mese, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
      alert("Risultato salvato con successo!");
    } catch { alert("Impossibile salvare il risultato."); }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-1 md:p-6" ref={calcolatoreRef}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 my-6">
                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale o legale. I risultati sono una stima basata sui dati inseriti.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inputs.map(input => {
                  const inputLabel = (
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                    </label>
                  );

                  return (
                    <div key={input.id}>
                      {inputLabel}
                      <div className="relative">
                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-10 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                        {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                {outputs.map(output => (
                  <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'utile_lordo_mese' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'utile_lordo_mese' ? (calculatedOutputs.utile_lordo_mese >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-800'}`}>
                      <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Riepilogo Grafico Mensile</h3>
                <div className="h-80 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="Ricavi" fill="#4f46e5" />
                        <Bar dataKey="Costi Totali" fill="#fca5a5" />
                        <Bar dataKey="Utile Lordo" fill="#16a34a" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
              <button onClick={handleReset} className="w-full border border-red-300 text-red-700 rounded-md px-3 py-2 text-sm hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida e Approfondimenti</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2006-02-20;96" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge Quadro n. 96/2006</a> - Disciplina dell'agriturismo.</li>
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">TUIR (D.P.R. 917/86)</a> - Testo Unico delle Imposte sui Redditi (per i regimi fiscali).</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CostiGestioneAgriturismoCalculator;