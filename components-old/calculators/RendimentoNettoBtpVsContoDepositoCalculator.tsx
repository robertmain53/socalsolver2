'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const meta = {
  title: "Calcolatore Rendimento Netto BTP vs. Conto Deposito",
  description: "Confronta il guadagno netto reale di un investimento in BTP (Buoni del Tesoro Poliennali) e in un conto deposito. Inserisci capitale, durata e tassi per scoprire quale strumento conviene di più dopo tasse e bolli."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
            "name": "Qual è la tassazione dei BTP e dei conti deposito?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I BTP godono di una tassazione agevolata al 12,5% sia sulle cedole (interessi) sia sulle plusvalenze (capital gain). I conti deposito, invece, sono soggetti all'aliquota standard del 26% sugli interessi. Entrambi pagano un'imposta di bollo dello 0,20% annuo sul capitale investito."
            }
          },
          {
            "@type": "Question",
            "name": "Conviene di più un BTP o un conto deposito?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Non c'è una risposta unica. Un BTP ha un potenziale di rendimento netto più alto grazie alla fiscalità di vantaggio, ma il suo valore può oscillare se venduto prima della scadenza. Un conto deposito offre una sicurezza del capitale quasi totale (fino a 100.000€) e un rendimento certo, ma una tassazione più alta. Questo calcolatore aiuta a confrontare i rendimenti netti a parità di condizioni."
            }
          },
          {
            "@type": "Question",
            "name": "Cos'è l'imposta di bollo sugli investimenti?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'imposta di bollo è una tassa patrimoniale proporzionale che si applica sui prodotti finanziari. Per BTP e conti deposito, l'aliquota è dello 0,20% annuo, calcolata sul valore del capitale investito o di mercato alla data di rendicontazione."
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
        if (trimmedBlock.startsWith('Tipo di Provento')) {
          const rows = trimmedBlock.split('\n');
          const headers = rows[0].split('**').filter(h => h.trim());
          const bodyRows = rows.slice(1);
          return (
            <div key={index} className="overflow-x-auto my-4">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>{headers.map((header, i) => <th key={i} className="p-2 border text-left font-semibold">{header}</th>)}</tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, i) => {
                    const cells = row.split('**').filter(c => c.trim());
                    return <tr key={i}>{cells.map((cell, j) => <td key={j} className={`p-2 border ${j === 0 ? 'font-semibold' : ''}`} dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>;
                  })}
                </tbody>
              </table>
            </div>
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
  "slug": "rendimento-netto-btp-vs-conto-deposito",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Rendimento Netto: BTP vs. Conto Deposito",
  "lang": "it",
  "inputs": [
    { "id": "capitale_investito", "label": "Capitale Iniziale da Investire", "type": "number" as const, "unit": "€", "min": 1000, "step": 100, "tooltip": "L'importo totale che intendi investire. L'importo minimo per i BTP è solitamente di 1.000 €." },
    { "id": "durata_investimento_anni", "label": "Durata dell'Investimento", "type": "number" as const, "unit": "anni", "min": 1, "step": 1, "tooltip": "L'orizzonte temporale in anni per cui manterrai l'investimento fino a scadenza." },
    { "id": "tasso_cedola_annuale_lordo_btp", "label": "Tasso Cedola Lordo Annuo (BTP)", "type": "number" as const, "unit": "%", "min": 0, "step": 0.1, "tooltip": "Il tasso di interesse lordo annuo che il BTP paga sotto forma di cedole. Lo trovi nei dettagli di emissione del titolo." },
    { "id": "prezzo_acquisto_btp", "label": "Prezzo di Acquisto del BTP", "type": "number" as const, "unit": "/100", "min": 50, "step": 0.1, "tooltip": "Il prezzo a cui acquisti il titolo. 100 = alla pari, <100 = sotto la pari (guadagno in conto capitale), >100 = sopra la pari (perdita in conto capitale)." },
    { "id": "tasso_interesse_annuale_lordo_cd", "label": "Tasso Interesse Lordo Annuo (CD)", "type": "number" as const, "unit": "%", "min": 0, "step": 0.1, "tooltip": "Il tasso di interesse lordo annuo offerto dalla banca per il conto deposito vincolato." },
    { "id": "bollo_a_carico_banca_cd", "label": "Imposta di bollo a carico della banca (Conto Deposito)?", "type": "boolean" as const, "tooltip": "Spunta questa casella se il conto deposito che stai valutando prevede, come offerta promozionale, che l'imposta di bollo (0,20%) sia pagata dalla banca anziché dall'investitore." }
  ],
  "outputs": [
    { "id": "montante_netto_btp", "label": "Montante Netto Finale (BTP)", "unit": "€" },
    { "id": "rendimento_netto_totale_btp", "label": "Guadagno Netto Totale (BTP)", "unit": "€" },
    { "id": "rendimento_netto_annuo_btp", "label": "Rendimento Netto Annuo (BTP)", "unit": "%" },
    { "id": "montante_netto_cd", "label": "Montante Netto Finale (Conto Deposito)", "unit": "€" },
    { "id": "rendimento_netto_totale_cd", "label": "Guadagno Netto Totale (Conto Deposito)", "unit": "€" },
    { "id": "rendimento_netto_annuo_cd", "label": "Rendimento Netto Annuo (Conto Deposito)", "unit": "%" }
  ],
  "content": "### **Guida Completa: BTP vs. Conto Deposito, la Scelta per il Risparmiatore**\n\n**Analisi Comparativa di Rendimento, Rischio, Tassazione e Liquidità**\n\nScegliere come impiegare i propri risparmi è una decisione fondamentale. Per chi cerca un'alternativa alla liquidità sul conto corrente, **BTP (Buoni del Tesoro Poliennali)** e **Conti Deposito** rappresentano due delle opzioni più popolari in Italia. Sebbene entrambi siano percepiti come strumenti a basso rischio, presentano differenze sostanziali in termini di struttura, tassazione e rendimento potenziale.\n\nQuesta guida offre un'analisi dettagliata per comprendere a fondo le due soluzioni e utilizzare il nostro calcolatore con piena consapevolezza, andando oltre i semplici tassi di interesse lordi.\n\n### **Parte 1: Il Calcolatore - Comprendere i Parametri**\n\nIl nostro strumento è progettato per offrire un confronto trasparente e realistico, considerando tutti i costi e le imposte che incidono sul rendimento finale. Vediamo i parametri chiave.\n\n#### **Parametri Comuni**\n\n* **Capitale Iniziale**: L'ammontare che si desidera investire. È il punto di partenza per ogni calcolo.\n* **Durata dell'Investimento**: L'orizzonte temporale. Per entrambi gli strumenti, si assume di mantenere l'investimento fino alla sua scadenza naturale per evitare costi o penalità.\n\n#### **Parametri Specifici del BTP**\n\n* **Tasso Cedola Lordo Annuo**: È l'interesse che lo Stato italiano si impegna a pagare annualmente (solitamente in due tranche semestrali) sul valore nominale del titolo. È fisso per tutta la durata del BTP.\n* **Prezzo di Acquisto**: Un fattore cruciale. I BTP, una volta emessi, vengono scambiati sul mercato secondario e il loro prezzo può variare. \n    * **Acquisto a 100 (alla pari)**: Si paga il valore nominale.\n    * **Acquisto sotto 100 (sotto la pari)**: Si paga meno del valore nominale, ottenendo un guadagno extra a scadenza (plusvalenza o *capital gain*).\n    * **Acquisto sopra 100 (sopra la pari)**: Si paga più del valore nominale, subendo una perdita a scadenza (minusvalenza o *capital loss*).\n\n#### **Parametri Specifici del Conto Deposito**\n\n* **Tasso Interesse Lordo Annuo**: L'interesse promesso dalla banca. Solitamente è più alto per i conti vincolati, dove ci si impegna a non ritirare le somme per un certo periodo.\n* **Imposta di bollo a carico della banca**: Alcune banche, per attrarre clienti, si offrono di pagare l'imposta di bollo dello 0,20% sul capitale. È un vantaggio netto per il risparmiatore.\n\n### **Parte 2: Analisi Fiscale - La Vera Differenza**\n\nLa fiscalità è l'elemento che più di ogni altro differenzia il rendimento netto di questi due strumenti.\n\nTipo di Provento**BTP (Titoli di Stato)****Conto Deposito (Prodotto Bancario)**\n**Tassazione su Interessi**Aliquota agevolata del **12,50%**.**Aliquota standard del **26,00%**.\n**Tassazione su Capital Gain**Aliquota agevolata del **12,50%**.**Non applicabile** (il capitale è garantito).\n**Imposta di Bollo**Aliquota dello **0,20% annuo** sul valore di mercato del titolo.Aliquota dello **0,20% annuo** sulla giacenza al momento della rendicontazione.\n\n**Esempio Pratico**: Su 100 € di interessi lordi, un BTP genera 87,50 € netti, mentre un conto deposito ne genera solo 74,00 €. Questa differenza è sostanziale e spesso rende un BTP con un tasso lordo inferiore più profittevole di un conto deposito con tasso lordo superiore.\n\n### **Parte 3: Rischio e Liquidità**\n\n#### **Profilo di Rischio**\n\n* **BTP**: Il rischio principale è il **rischio Paese (o di credito)**, ovvero l'eventualità che lo Stato italiano non sia in grado di rimborsare il debito. È considerato un rischio molto basso per l'Italia. Esiste anche un **rischio di mercato**: se si ha bisogno di vendere il BTP prima della scadenza, il prezzo potrebbe essere inferiore a quello di acquisto, generando una perdita.\n* **Conto Deposito**: Il rischio è quasi nullo. Le somme sono garantite dal **Fondo Interbancario di Tutela dei Depositi (FITD)** fino a 100.000 € per depositante e per banca. Il capitale è quindi protetto anche in caso di fallimento della banca.\n\n#### **Liquidità**\n\n* **BTP**: È uno strumento molto liquido. Può essere venduto sul mercato secondario (MOT) in qualsiasi giorno lavorativo, ottenendo la liquidità in due giorni. Tuttavia, come detto, il prezzo di vendita non è garantito.\n* **Conto Deposito**: La liquidità dipende dal tipo di conto. I **conti liberi** permettono di ritirare le somme in qualsiasi momento. I **conti vincolati**, che offrono tassi migliori, prevedono penali o la perdita totale degli interessi in caso di svincolo anticipato.\n\n### **Conclusioni: Quale Scegliere?**\n\nNon esiste una risposta univoca, la scelta dipende dai propri obiettivi.\n\n* **Scegli il BTP se**: Cerchi un rendimento netto potenzialmente più alto grazie alla tassazione agevolata, sei disposto a mantenere l'investimento fino a scadenza per azzerare il rischio di mercato e vuoi uno strumento facilmente liquidabile in caso di necessità (pur accettando la variabilità del prezzo).\n\n* **Scegli il Conto Deposito se**: La tua priorità assoluta è la **sicurezza del capitale**. Vuoi un rendimento certo e predefinito, senza preoccuparti delle fluttuazioni di mercato, e non prevedi di aver bisogno delle somme prima della scadenza del vincolo.\n\nUtilizza il nostro calcolatore per simulare diversi scenari e trovare la soluzione più in linea con il tuo profilo di rischio e le tue esigenze finanziarie."
};


const RendimentoNettoBtpVsContoDepositoCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    capitale_investito: 10000,
    durata_investimento_anni: 5,
    tasso_cedola_annuale_lordo_btp: 3.5,
    prezzo_acquisto_btp: 99,
    tasso_interesse_annuale_lordo_cd: 4.0,
    bollo_a_carico_banca_cd: false
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
      capitale_investito, durata_investimento_anni, tasso_cedola_annuale_lordo_btp,
      prezzo_acquisto_btp, tasso_interesse_annuale_lordo_cd, bollo_a_carico_banca_cd
    } = states;

    // --- Calcolo BTP ---
    const tassazione_btp = 0.125;
    const imposta_bollo_tasso = 0.002;

    const cedole_annue_lorde_btp = capitale_investito * (tasso_cedola_annuale_lordo_btp / 100);
    const cedole_totali_lorde_btp = cedole_annue_lorde_btp * durata_investimento_anni;
    const tassazione_cedole_btp = cedole_totali_lorde_btp * tassazione_btp;
    const cedole_totali_nette_btp = cedole_totali_lorde_btp - tassazione_cedole_btp;

    const capitale_investito_reale_btp = capitale_investito * (prezzo_acquisto_btp / 100);
    const capital_gain_lordo_btp = capitale_investito - capitale_investito_reale_btp;
    const tassazione_capital_gain_btp = Math.max(0, capital_gain_lordo_btp) * tassazione_btp;
    const capital_gain_netto_btp = capital_gain_lordo_btp - tassazione_capital_gain_btp;

    const bollo_totale_btp = capitale_investito * imposta_bollo_tasso * durata_investimento_anni;
    
    const rendimento_netto_totale_btp = cedole_totali_nette_btp + capital_gain_netto_btp - bollo_totale_btp;
    const montante_netto_btp = capitale_investito_reale_btp + rendimento_netto_totale_btp;
    const rendimento_netto_annuo_btp = capitale_investito_reale_btp > 0 ? (Math.pow(montante_netto_btp / capitale_investito_reale_btp, 1 / durata_investimento_anni) - 1) * 100 : 0;
    
    // --- Calcolo Conto Deposito ---
    const tassazione_cd = 0.26;
    
    const interessi_totali_lordi_cd = capitale_investito * (tasso_interesse_annuale_lordo_cd / 100) * durata_investimento_anni;
    const tassazione_interessi_cd = interessi_totali_lordi_cd * tassazione_cd;
    const interessi_totali_netti_cd = interessi_totali_lordi_cd - tassazione_interessi_cd;

    const bollo_totale_cd = bollo_a_carico_banca_cd ? 0 : capitale_investito * imposta_bollo_tasso * durata_investimento_anni;
    
    const rendimento_netto_totale_cd = interessi_totali_netti_cd - bollo_totale_cd;
    const montante_netto_cd = capitale_investito + rendimento_netto_totale_cd;
    const rendimento_netto_annuo_cd = capitale_investito > 0 ? (Math.pow(montante_netto_cd / capitale_investito, 1 / durata_investimento_anni) - 1) * 100 : 0;

    return {
        montante_netto_btp, rendimento_netto_totale_btp, rendimento_netto_annuo_btp,
        montante_netto_cd, rendimento_netto_totale_cd, rendimento_netto_annuo_cd
    };
  }, [states]);
  
  const chartData = [
    { name: 'Capitale Iniziale', BTP: states.capitale_investito * (states.prezzo_acquisto_btp / 100), 'Conto Deposito': states.capitale_investito },
    { name: 'Guadagno Netto', BTP: calculatedOutputs.rendimento_netto_totale_btp, 'Conto Deposito': calculatedOutputs.rendimento_netto_totale_cd },
    { name: 'Costi (Bolli + Tasse)', BTP: (states.capitale_investito * (states.tasso_cedola_annuale_lordo_btp / 100) * states.durata_investimento_anni + Math.max(0, states.capitale_investito - states.capitale_investito * (states.prezzo_acquisto_btp/100))) - calculatedOutputs.rendimento_netto_totale_btp, 'Conto Deposito': (states.capitale_investito * (states.tasso_interesse_annuale_lordo_cd / 100) * states.durata_investimento_anni) - calculatedOutputs.rendimento_netto_totale_cd },
  ];

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calcolatoreRef.current) return;
      const canvas = await html2canvas(calcolatoreRef.current, { scale: 2, windowWidth: calcolatoreRef.current.scrollWidth, windowHeight: calcolatoreRef.current.scrollHeight });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
      alert("Risultato salvato con successo!");
    } catch { alert("Impossibile salvare il risultato."); }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const formulaBTP = `Guadagno Netto BTP = (Cedole Lorde - 12,5%) + (Capital Gain - 12,5%) - (Bollo 0,20% * Anni)`;
  const formulaCD = `Guadagno Netto CD = (Interessi Lordi - 26%) - (Bollo 0,20% * Anni)`;

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        
        <div className="lg:col-span-2">
          <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-4">{meta.description}</p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non costituisce una consulenza finanziaria. I risultati sono stime basate sui dati inseriti.
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
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                         {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-auto cursor-help lg:hidden"><InfoIcon /></span></Tooltip>}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={input.id}>
                    {inputLabel}
                    <div className="relative">
                      <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                      {input.unit && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati a Confronto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Risultati BTP */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-lg text-blue-800">Risultato BTP</h3>
                  {outputs.filter(o => o.id.includes('btp')).map(output => (
                     <div key={output.id} className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-700">{output.label}</span>
                        <span className="font-bold text-blue-700 text-lg">
                          {isClient ? (output.unit === '%' ? formatPercent((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}
                        </span>
                      </div>
                  ))}
                </div>

                {/* Risultati Conto Deposito */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-lg text-green-800">Risultato Conto Deposito</h3>
                  {outputs.filter(o => o.id.includes('cd')).map(output => (
                     <div key={output.id} className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-700">{output.label}</span>
                        <span className="font-bold text-green-700 text-lg">
                          {isClient ? (output.unit === '%' ? formatPercent((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}
                        </span>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione del Montante Finale</h3>
                <div className="h-80 w-full bg-gray-50 p-2 rounded-lg">
                {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `€${value / 1000}k`} />
                        <YAxis type="category" dataKey="name" width={120} />
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(230,230,230,0.5)'}} />
                        <Legend />
                        <Bar dataKey="BTP" stackId="a" fill="#3b82f6" name="BTP" />
                        <Bar dataKey="Conto Deposito" stackId="b" fill="#22c55e" name="Conto Deposito" />
                    </BarChart>
                    </ResponsiveContainer>
                )}
                </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg shadow-md p-4 bg-white">
                <h3 className="font-semibold text-gray-700">Formula Semplificata (BTP)</h3>
                <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded font-mono break-words">{formulaBTP}</p>
            </div>
             <div className="border rounded-lg shadow-md p-4 bg-white">
                <h3 className="font-semibold text-gray-700">Formula Semplificata (CD)</h3>
                <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded font-mono break-words">{formulaCD}</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
              <button onClick={handleReset} className="w-full border border-red-300 text-red-700 bg-red-50 rounded-md px-3 py-2 text-sm hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida all'Investimento</h2>
            <ContentRenderer content={content} />
          </section>
           <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                <li><a href="https://www.dt.mef.gov.it/it/debito_pubblico/titoli_di_stato/quali_sono_titoli/btp/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">MEF - Dipartimento del Tesoro (BTP)</a></li>
                <li><a href="https://www.fitd.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Fondo Interbancario di Tutela dei Depositi</a></li>
                <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/pagamenti/imposta-di-bollo-per-prodotti-finanziari/scheda-info-ibollobfin" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Imposta di Bollo</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default RendimentoNettoBtpVsContoDepositoCalculator;