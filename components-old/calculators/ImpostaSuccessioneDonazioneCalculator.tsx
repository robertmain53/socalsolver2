'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Imposta di Successione e Donazione (per gradi di parentela)",
  description: "Calcola con precisione l'imposta di successione e donazione in base al valore dell'eredità e al grado di parentela. Include franchigie, aliquote e imposte sulla prima casa."
};

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
            "name": "Come si calcola l'imposta di successione?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'imposta di successione si calcola applicando un'aliquota variabile al valore dell'eredità che eccede una determinata franchigia. Sia l'aliquota che la franchigia dipendono dal grado di parentela tra il defunto e l'erede. Il nostro calcolatore automatizza questo processo."
            }
          },
          {
            "@type": "Question",
            "name": "Qual è la franchigia per figli e coniuge?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Per il coniuge e i figli (discendenti in linea retta), la franchigia sull'imposta di successione è di 1.000.000 di euro per ciascun erede. L'imposta, con aliquota al 4%, si paga solo sulla parte di eredità che supera tale importo."
            }
          },
          {
            "@type": "Question",
            "name": "Le donazioni ricevute in vita influiscono sulla successione?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, le donazioni ricevute in vita dall'erede da parte del defunto vengono sommate al valore dell'asse ereditario (meccanismo del 'coacervo') al fine di verificare il superamento della franchigia. Questo impedisce di eludere le imposte frazionando il patrimonio."
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
        if (trimmedBlock.startsWith('| Beneficiario')) {
            const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
            const headers = rows[0];
            const bodyRows = rows.slice(2);
            return (
              <div key={index} className="overflow-x-auto my-4">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>{headers.map((h, i) => <th key={i} className="p-2 border text-left font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(h) }} />)}</tr>
                  </thead>
                  <tbody>
                    {bodyRows.map((row, i) => (
                      <tr key={i}>{row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>
                    ))}
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
  "slug": "imposta-successione-donazione",
  "category": "Famiglia e Vita Quotidiana",
  "title": "Calcolatore Imposta di Successione e Donazione (per gradi di parentela)",
  "lang": "it",
  "inputs": [
    { "id": "valore_asse_ereditario", "label": "Valore totale dell'asse ereditario", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserire il valore complessivo di tutti i beni che compongono l'eredità (immobili, conti correnti, azioni, etc.), al netto delle passività deducibili." },
    { "id": "grado_parentela", "label": "Grado di parentela dell'erede", "type": "select" as const, "options": [ "Coniuge o figli (discendenti in linea retta)", "Fratelli o sorelle", "Altri parenti fino al 4° grado", "Affini in linea retta (es. suoceri)", "Altri soggetti" ], "tooltip": "Selezionare il rapporto di parentela con la persona deceduta. Questo determina l'aliquota e la franchigia applicabile." },
    { "id": "is_portatore_handicap", "label": "L'erede è portatore di handicap grave (L. 104/92)?", "type": "boolean" as const, "tooltip": "Spuntare se l'erede è una persona con handicap riconosciuto grave ai sensi della legge 104/92, art. 3, comma 3. Questo aumenta la franchigia a 1.500.000 €." },
    { "id": "include_prima_casa", "label": "L'eredità include l'immobile 'prima casa'?", "type": "boolean" as const, "tooltip": "Selezionare se tra i beni ereditati è presente un immobile che per l'erede ha i requisiti di 'prima casa'." },
    { "id": "donazioni_precedenti", "label": "Valore donazioni ricevute in vita", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserire il valore totale di eventuali donazioni ricevute in vita dal defunto. Questo valore viene sommato all'asse ereditario per calcolare la franchigia residua (coacervo)." }
  ],
  "outputs": [
    { "id": "franchigia_applicabile", "label": "Franchigia Applicabile", "unit": "€" },
    { "id": "aliquota_imposta", "label": "Aliquota d'Imposta", "unit": "%" },
    { "id": "base_imponibile", "label": "Base Imponibile per l'Imposta di Successione", "unit": "€" },
    { "id": "imposta_successione_dovuta", "label": "Imposta di Successione Dovuta", "unit": "€" },
    { "id": "imposte_ipotecaria_catastale", "label": "Imposte Ipotecaria e Catastale (Prima Casa)", "unit": "€" }
  ],
  "content": "### **Guida Definitiva all'Imposta di Successione e Donazione**\n\n**Criteri di Calcolo, Adempimenti e Strategie di Pianificazione**\n\nL'imposta di successione e donazione è un tributo che colpisce il trasferimento di beni e diritti a seguito del decesso di una persona (successione) o di un atto di liberalità tra vivi (donazione). Comprendere i meccanismi di calcolo, le aliquote, le franchigie e gli adempimenti è fondamentale per eredi e donatari. \n\nQuesto strumento offre una stima precisa e affidabile, ma è importante sottolineare che **non sostituisce una consulenza fiscale o legale professionale**, necessaria per analizzare le specificità di ogni singolo caso, specialmente in presenza di patrimoni complessi.\n\n### **Parte 1: I Principi Fondamentali del Calcolo**\n\nIl calcolo dell'imposta si basa su tre elementi chiave: l'**asse ereditario netto**, il **grado di parentela** tra il defunto e l'erede, e il sistema di **franchigie e aliquote** stabilito dalla legge.\n\n1.  **Valore dell'Asse Ereditario Netto**: È la base di partenza. Si ottiene sommando il valore di tutti i beni (immobili, liquidità, partecipazioni, etc.) e sottraendo le passività deducibili (debiti del defunto, spese mediche, spese funebri nel limite di € 1.550).\n\n2.  **Il Coacervo Successorio e Donativo**: La legge prevede che, ai soli fini di determinare se la franchigia è stata superata, al valore dell'asse ereditario si debbano sommare le donazioni fatte in vita dal defunto a favore dell'erede. Questo meccanismo, chiamato \"coacervo\", impedisce di eludere l'imposta frazionando il patrimonio con donazioni multiple sotto soglia.\n\n3.  **Grado di Parentela**: È il fattore decisivo per stabilire l'aliquota e la franchigia. Il sistema italiano favorisce nettamente i trasferimenti all'interno del nucleo familiare stretto.\n\n### **Parte 2: Aliquote e Franchigie in Dettaglio**\n\nLa normativa attuale (D.Lgs. 346/1990 e successive modifiche) prevede una struttura a scaglioni basata sulla parentela. Ecco una tabella riassuntiva e chiara:\n\n| Beneficiario | Franchigia (per erede) | Aliquota sull'eccedenza |\n|:---|:---|:---|\n| **Coniuge e discendenti in linea retta (figli, nipoti)** | € 1.000.000 | 4% |\n| **Fratelli e sorelle** | € 100.000 | 6% |\n| **Altri parenti fino al 4° grado** (zii, cugini) e **affini in linea retta** (suoceri, generi, nuore) | Nessuna | 6% |\n| **Tutti gli altri soggetti** (inclusi conviventi di fatto) | Nessuna | 8% |\n| **Erede portatore di handicap grave (L. 104/92)** | € 1.500.000 | Si applica l'aliquota del proprio grado di parentela |\n\n#### **Caso Specifico: l'Eredità della 'Prima Casa'**\n\nQuando nell'asse ereditario è incluso un immobile che per l'erede possiede i requisiti di \"prima casa\", sono previste importanti agevolazioni:\n\n* **Imposta di Successione**: L'immobile concorre normalmente alla formazione dell'attivo ereditario e all'eventuale superamento della franchigia.\n* **Imposte Ipotecaria e Catastale**: Invece di essere calcolate in percentuale sul valore dell'immobile (rispettivamente 2% e 1%), sono dovute in **misura fissa di 200 € ciascuna**, per un totale di 400 €.\n\nPer usufruire di questa agevolazione, l'erede deve dichiarare, nella dichiarazione di successione, di possedere i requisiti previsti dalla legge per l'acquisto della prima casa.\n\n### **Parte 3: Adempimenti e Scadenze**\n\n#### **La Dichiarazione di Successione**\n\nÈ il documento fiscale con cui gli eredi comunicano all'Agenzia delle Entrate la composizione del patrimonio ereditario. Deve essere presentata **entro 12 mesi dalla data di apertura della successione** (che coincide con la data del decesso).\n\n**Chi è obbligato a presentarla?**\nSono obbligati a presentare la dichiarazione:\n* I chiamati all'eredità (anche se non hanno ancora accettato).\n* I legatari.\n* I loro rappresentanti legali.\n* Gli immessi nel possesso temporaneo dei beni.\n* Gli amministratori dell'eredità e i curatori dell'eredità giacente.\n\nEsiste un **esonero** dalla presentazione se l'eredità è devoluta al coniuge e ai parenti in linea retta, ha un valore attivo non superiore a 100.000 € e non comprende beni immobili o diritti reali immobiliari.\n\n#### **Pagamento delle Imposte**\n\nUna volta presentata la dichiarazione, l'Agenzia delle Entrate liquida le imposte dovute. Il pagamento deve avvenire **entro 60 giorni** dalla data di notifica dell'avviso di liquidazione. È possibile richiedere la rateizzazione delle somme dovute.\n\n### **Conclusione**\n\nLa gestione di una successione richiede attenzione e conoscenza delle normative. Questo calcolatore fornisce un quadro chiaro e immediato del potenziale potenziale carico fiscale, aiutando a comprendere l'impatto delle imposte sul patrimonio ereditato. Per una pianificazione patrimoniale efficace e per la corretta gestione di tutti gli adempimenti burocratici, è sempre consigliabile rivolgersi a professionisti qualificati del settore."
};

const ImpostaSuccessioneDonazioneCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);
  
  const initialStates = {
    valore_asse_ereditario: 500000,
    grado_parentela: "Coniuge o figli (discendenti in linea retta)",
    is_portatore_handicap: false,
    include_prima_casa: true,
    donazioni_precedenti: 0,
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setStates(initialStates);
  };

  const calculatedOutputs = useMemo(() => {
    const { valore_asse_ereditario, grado_parentela, is_portatore_handicap, include_prima_casa, donazioni_precedenti } = states;
    
    let franchigia_base = 0;
    let aliquota_imposta = 0;

    switch (grado_parentela) {
      case "Coniuge o figli (discendenti in linea retta)":
        franchigia_base = 1000000;
        aliquota_imposta = 4;
        break;
      case "Fratelli o sorelle":
        franchigia_base = 100000;
        aliquota_imposta = 6;
        break;
      case "Altri parenti fino al 4° grado":
      case "Affini in linea retta (es. suoceri)":
        franchigia_base = 0;
        aliquota_imposta = 6;
        break;
      case "Altri soggetti":
        franchigia_base = 0;
        aliquota_imposta = 8;
        break;
    }

    const franchigia_applicabile = is_portatore_handicap ? 1500000 : franchigia_base;
    const asse_per_calcolo_franchigia = (valore_asse_ereditario || 0) + (donazioni_precedenti || 0);
    const base_imponibile = Math.max(0, asse_per_calcolo_franchigia - franchigia_applicabile);
    const imposta_successione_dovuta = base_imponibile * (aliquota_imposta / 100);
    const imposte_ipotecaria_catastale = include_prima_casa ? 400 : 0;

    return {
      franchigia_applicabile,
      aliquota_imposta,
      base_imponibile,
      imposta_successione_dovuta,
      imposte_ipotecaria_catastale,
      asse_ereditario_netto: valore_asse_ereditario || 0,
    };
  }, [states]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  
  const chartData = [
      { name: 'Quota Esente (Franchigia)', value: Math.min(calculatedOutputs.asse_ereditario_netto, calculatedOutputs.franchigia_applicabile) },
      { name: 'Quota Tassabile', value: Math.max(0, calculatedOutputs.asse_ereditario_netto - calculatedOutputs.franchigia_applicabile) },
      { name: 'Imposta Dovuta', value: calculatedOutputs.imposta_successione_dovuta },
  ].filter(d => d.value > 0);
  
  const COLORS = ['#4ade80', '#facc15', '#ef4444'];
  
  const formulaUsata = "Imposta = MAX(0, (AsseEreditario + Donazioni) - Franchigia) * Aliquota%";

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (_e) {
      alert("La funzione di esportazione PDF non è disponibile in questo ambiente.");
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const { asse_ereditario_netto, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, timestamp: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem("saved_calc_results") || "[]");
      const newResults = [payload, ...existingResults].slice(0, 50);
      localStorage.setItem("saved_calc_results", JSON.stringify(newResults));
      alert("Risultato salvato con successo!");
    } catch {
      alert("Impossibile salvare il risultato.");
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        
        {/* Colonna Principale: Calcolatore e Risultati */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Stima le imposte dovute per successioni e donazioni in base ai parametri normativi vigenti.</p>
              
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza legale o fiscale. I calcoli si basano sulla normativa attuale e non coprono tutti i casi specifici.
              </div>

              {/* Sezione Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => (
                  <div key={input.id} className={`${input.type === 'boolean' ? 'md:col-span-2' : ''}`}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                    </label>
                    {input.type === 'number' && (
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{input.unit}</span>
                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-8 pr-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                      </div>
                    )}
                    {input.type === 'select' && (
                      <select id={input.id} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)}>
                        {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                    {input.type === 'boolean' && (
                      <div className="flex items-center gap-3 p-2 rounded-md bg-white border">
                        <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                        <label className="text-sm font-medium text-gray-700 flex-1" htmlFor={input.id}>{input.label}</label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Sezione Risultati */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultati del Calcolo</h2>
                <div className="space-y-4">
                  {outputs.map(output => {
                    if (output.id === 'imposte_ipotecaria_catastale' && !states.include_prima_casa) return null;
                    const value = (calculatedOutputs as any)[output.id];
                    const isMainResult = output.id === 'imposta_successione_dovuta';
                    return (
                      <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${isMainResult ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                        <div className={`text-xl md:text-2xl font-bold ${isMainResult ? 'text-indigo-600' : 'text-gray-800'}`}>
                          {isClient ? (output.unit === '€' ? formatCurrency(value) : `${value} ${output.unit}`) : '...'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sezione Grafico */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione Asse Ereditario Tassabile</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>
                          {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t mt-6 p-4 bg-gray-50 rounded-b-lg">
              <h3 className="font-semibold text-gray-700 text-sm">Formula di Calcolo Sintetica</h3>
              <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
            </div>
          </div>
        </div>

        {/* Colonna Laterale: Utility e Contenuti */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
              <button onClick={handleReset} className="sm:col-span-2 lg:col-span-1 w-full flex items-center justify-center gap-2 border border-transparent bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida all'Imposta di Successione</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1990-10-31;346!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.Lgs. 31 ottobre 1990, n. 346</a> - Testo unico delle disposizioni concernenti l'imposta sulle successioni e donazioni.</li>
              <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/dichiarazioni/dichiarazione-di-successione/normativa-e-prassi-successione" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Normativa e Prassi</a> - Pagina ufficiale con la documentazione di riferimento.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default ImpostaSuccessioneDonazioneCalculator;