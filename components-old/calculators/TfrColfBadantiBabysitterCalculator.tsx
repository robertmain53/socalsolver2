'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

// --- METADATI PER LA PAGINA ---
export const meta = {
  title: "Calcolatore TFR per Colf, Badanti e Babysitter | Stima Online",
  description: "Calcola online il TFR netto per colf, badanti e babysitter. Il nostro strumento gratuito ti offre una stima precisa basata sul CCNL Lavoro Domestico."
};

// --- ICONA PER I TOOLTIP (SVG INLINE) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- COMPONENTE TOOLTIP ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- DATI STRUTTURATI SEO (JSON-LD) ---
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
            "name": "Come si calcola il TFR per colf e badanti?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il TFR si calcola sommando per ciascun anno di servizio una quota pari alla retribuzione annua lorda (inclusa tredicesima e indennità di vitto/alloggio) divisa per 13,5. L'importo accantonato viene poi rivalutato annualmente."
            }
          },
          {
            "@type": "Question",
            "name": "L'indennità di vitto e alloggio rientra nel calcolo del TFR?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, il valore convenzionale del vitto e dell'alloggio per i lavoratori conviventi è un elemento della retribuzione a tutti gli effetti e deve essere incluso nel calcolo della quota TFR annuale."
            }
          },
          {
            "@type": "Question",
            "name": "Come funziona la tassazione del TFR?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il TFR è soggetto a 'tassazione separata', un regime fiscale agevolato che impedisce che la somma faccia cumulo con i redditi dell'ultimo anno, evitando un'aliquota IRPEF troppo elevata."
            }
          }
        ]
      })
    }}
  />
);

// --- COMPONENTE PER IL RENDERING DEL CONTENUTO MARKDOWN ---
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

// --- DATI DI CONFIGURAZIONE DEL CALCOLATORE (SELF-CONTAINED) ---
const calculatorData = {
  "slug": "tfr-colf-badanti-babysitter",
  "category": "Famiglia e Vita Quotidiana",
  "title": "Calcolatore TFR per Colf, Badanti e Babysitter",
  "lang": "it",
  "inputs": [
    { "id": "retribuzione_mensile", "label": "Retribuzione mensile lorda", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Inserisci la retribuzione mensile lorda concordata, comprensiva di eventuali superminimi." },
    { "id": "indennita_vitto_alloggio", "label": "Indennità mensile vitto e alloggio", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Da inserire solo se il lavoratore è convivente e non usufruisce di vitto e alloggio in natura. Il valore convenzionale viene aggiornato annualmente." },
    { "id": "numero_mensilita", "label": "Numero di mensilità totali", "type": "number" as const, "unit": "mensilità", "min": 12, "step": 1, "tooltip": "Include la tredicesima. Inserire 13 se il contratto la prevede (standard per il CCNL Lavoro Domestico)." },
    { "id": "anni_servizio", "label": "Anni totali di servizio", "type": "number" as const, "unit": "anni", "min": 0, "step": 0.5, "tooltip": "Inserisci la durata totale del rapporto di lavoro in anni. Puoi usare valori decimali (es. 5.5 per 5 anni e 6 mesi)." },
    { "id": "tasso_rivalutazione_medio", "label": "Tasso di rivalutazione medio annuo", "type": "number" as const, "unit": "%", "min": 0, "step": 0.1, "tooltip": "La rivalutazione annuale del TFR è composta da un 1,5% fisso + il 75% dell'indice di inflazione ISTAT. Un valore medio realistico negli ultimi anni si attesta tra il 2% e il 4%." },
    { "id": "anticipi_ricevuti", "label": "Eventuali anticipi sul TFR già ricevuti", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo totale di eventuali anticipazioni del TFR che il lavoratore ha già richiesto e ottenuto." }
  ],
  "outputs": [
    { "id": "tfr_totale_lordo", "label": "Stima del TFR Totale Lordo", "unit": "€" },
    { "id": "tfr_accantonato", "label": "Quota Capitale Accantonata", "unit": "€" },
    { "id": "rivalutazione_stimata", "label": "Rivalutazione Totale Stimata", "unit": "€" }
  ],
  "content": "### **Guida Completa al TFR per Lavoratori Domestici (Colf, Badanti, Babysitter)**\n\n**Criteri di Calcolo, Normativa e Aspetti Pratici**\n\nIl Trattamento di Fine Rapporto (TFR) è una componente fondamentale della retribuzione di colf, badanti e babysitter, rappresentando una somma di denaro che matura durante l'intero arco del rapporto di lavoro e viene liquidata alla sua conclusione. La sua gestione e il suo calcolo, sebbene regolati da norme precise, possono generare dubbi. \n\nQuesto strumento offre una stima accurata del TFR basata sui criteri del Contratto Collettivo Nazionale di Lavoro (CCNL) Domestico. La guida che segue approfondisce ogni aspetto del calcolo per garantire piena consapevolezza a datori di lavoro e lavoratori.\n\n**Disclaimer**: Questo calcolatore fornisce una stima attendibile a scopo informativo. Il calcolo definitivo può risentire di variabili specifiche non modellate qui. **Non sostituisce la consulenza di un professionista (Consulente del Lavoro, CAF, sindacato)**.\n\n### **Parte 1: Come Funziona il Calcolo del TFR**\n\nIl TFR per il lavoro domestico si calcola seguendo una regola precisa stabilita dall'art. 2120 del Codice Civile e specificata nel CCNL di settore.\n\nIl principio base è l'**accantonamento annuale**. Per ogni anno di servizio, si mette da parte una quota della retribuzione del lavoratore. Questa quota non è fissa, ma è pari alla **somma di tutte le retribuzioni annue divisa per 13,5**.\n\nI parametri chiave per il calcolo sono:\n\n1.  **Retribuzione Annua Utile**: È la base imponibile per il calcolo. Comprende non solo lo stipendio, ma tutti gli elementi retributivi continuativi, tra cui:\n    * **Stipendio Lordo Mensile**: La paga base concordata.\n    * **Tredicesima Mensilità**: Componente obbligatoria della retribuzione annua.\n    * **Indennità di Vitto e Alloggio**: Per i lavoratori conviventi, il valore convenzionale del vitto e alloggio (o la relativa indennità monetaria) è parte integrante della retribuzione e rientra a pieno titolo nel calcolo del TFR. Questo è un punto spesso trascurato che può fare una differenza significativa.\n\n2.  **Rivalutazione**: Il TFR non è una somma statica. Le quote accantonate ogni anno vengono rivalutate per proteggerle, almeno in parte, dall'inflazione. Al 31 dicembre di ogni anno, il fondo TFR accumulato viene rivalutato con un tasso composto da:\n    * **1,5%** (tasso fisso).\n    * **75% dell'aumento dell'indice dei prezzi al consumo (ISTAT)** per le famiglie di operai e impiegati (tasso variabile).\n\nQuesto meccanismo fa sì che il TFR accumulato cresca nel tempo, oltre le quote versate.\n\n### **Parte 2: Approfondimenti Pratici**\n\n#### **L'Anticipo del TFR**\n\nIl lavoratore, a determinate condizioni, può richiedere un'anticipazione del TFR maturato senza attendere la fine del rapporto. La legge prevede che, dopo **almeno 8 anni di servizio** presso lo stesso datore di lavoro, si possa richiedere un anticipo fino al **70% del TFR maturato**. La richiesta deve essere giustificata da:\n\n* Spese sanitarie per terapie e interventi straordinari.\n* Acquisto della prima casa di abitazione per sé o per i figli.\n\nL'anticipo, una volta concesso, viene ovviamente detratto dal saldo finale.\n\n#### **Tassazione del TFR**\n\nIl TFR liquidato è soggetto a **tassazione separata**. Questo è un regime fiscale agevolato che impedisce che la somma, maturata in più anni, venga cumulata con i redditi dell'ultimo anno, evitando così un'impennata dell'aliquota IRPEF. \n\nIl calcolo dell'imposta netta è complesso e viene effettuato dall'Agenzia delle Entrate. In sintesi, si determina un'aliquota media basata sui redditi degli anni precedenti del lavoratore. Il datore di lavoro versa il TFR al lordo di eventuali ritenute d'acconto, ma la tassazione definitiva è gestita a posteriori dal fisco.\n\n#### **Liquidazione del TFR: Quando e Come**\n\nIl TFR deve essere pagato al lavoratore **alla cessazione del rapporto di lavoro**, indipendentemente dalla causa (licenziamento, dimissioni, pensionamento). Il datore di lavoro è tenuto a corrispondere la somma maturata e a fornire un prospetto di calcolo dettagliato che illustri le quote annue, le rivalutazioni e il totale lordo.\n\n### **Domande Frequenti (FAQ)**\n\n**Come si calcola il TFR per un rapporto di lavoro durato meno di un anno?**\n*Si calcola in dodicesimi. La retribuzione utile del periodo viene divisa per 13,5, e il risultato viene riproporzionato per i mesi di servizio. Si considera come mese intero la frazione di mese pari o superiore a 15 giorni.*\n\n**La quattordicesima rientra nel calcolo del TFR?**\n*Il CCNL Lavoro Domestico non prevede la quattordicesima mensilità. Se fosse prevista da un accordo individuale (superminimo), rientrerebbe nella retribuzione utile al calcolo.*\n\n**Cosa succede al TFR in caso di morte del lavoratore?**\n*Il TFR e le altre indennità vengono liquidate agli eredi: il coniuge, i figli e, se viventi a carico, i parenti entro il terzo grado e gli affini entro il secondo.*\n"
};

// --- COMPONENTE PRINCIPALE ---
const TfrColfBadantiBabysitterCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);
  
  const initialStates = {
    retribuzione_mensile: 1200,
    indennita_vitto_alloggio: 0,
    numero_mensilita: 13,
    anni_servizio: 5,
    tasso_rivalutazione_medio: 2.5,
    anticipi_ricevuti: 0
  };

  const [states, setStates] = useState<{[key: string]: any}>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({...prev, [id]: value}));
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const { retribuzione_mensile, indennita_vitto_alloggio, numero_mensilita, anni_servizio, tasso_rivalutazione_medio, anticipi_ricevuti } = states;

    const retribuzione_annua_utile = (retribuzione_mensile * numero_mensilita) + (indennita_vitto_alloggio * 12);
    const quota_tfr_annua = retribuzione_annua_utile / 13.5;
    const tfr_accantonato = quota_tfr_annua * anni_servizio;
    
    // Formula semplificata per la rivalutazione: applica il tasso medio all'accumulo medio nel periodo
    const rivalutazione_stimata = tfr_accantonato * (tasso_rivalutazione_medio / 100) * (anni_servizio / 2);
    
    const tfr_totale_lordo = Math.max(0, tfr_accantonato + rivalutazione_stimata - anticipi_ricevuti);

    return { tfr_totale_lordo, tfr_accantonato, rivalutazione_stimata };
  }, [states]);

  const chartData = [
    { name: 'Composizione TFR', 'Quota Capitale': calculatedOutputs.tfr_accantonato, 'Rivalutazione': calculatedOutputs.rivalutazione_stimata }
  ];

  const formulaUsata = `TFR Lordo = (Quota Capitale) + (Rivalutazione) - (Anticipi)\nQuota Capitale = (Retribuzione Annua / 13.5) * Anni Servizio\nRivalutazione (stima) = Quota Capitale * (Tasso Medio / 100) * (Anni Servizio / 2)`;

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (_e) {
      alert("Errore durante l'esportazione in PDF. Questa funzione potrebbe non essere disponibile nel tuo ambiente.");
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      const newResults = [payload, ...existingResults].slice(0, 50);
      localStorage.setItem("calc_results", JSON.stringify(newResults));
      alert("Risultato salvato con successo nel browser!");
    } catch {
      alert("Impossibile salvare il risultato.");
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        
        {/* Colonna Principale: Calcolatore e Risultati */}
        <div className="lg:col-span-2">
          <div className="p-1" ref={calculatorRef}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Stima il Trattamento di Fine Rapporto per lavoratori domestici secondo il CCNL.</p>
              
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza professionale.
              </div>

              {/* Sezione Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                    </label>
                    <div className="relative">
                      <input 
                        id={input.id} 
                        aria-label={input.label} 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2" 
                        type="number" 
                        min={input.min} 
                        step={input.step} 
                        value={states[input.id]} 
                        onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} 
                      />
                      {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sezione Output */}
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                {outputs.map(output => (
                  <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'tfr_totale_lordo' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'tfr_totale_lordo' ? 'text-indigo-600' : 'text-gray-800'}`}>
                      <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Grafico */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione del TFR Lordo</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                        <Legend />
                        <Bar dataKey="Quota Capitale" stackId="a" fill="#4f46e5" />
                        <Bar dataKey="Rivalutazione" stackId="a" fill="#a5b4fc" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Formula Trasparente */}
            <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
              <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
              <div className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words whitespace-pre-wrap">{formulaUsata}</div>
              <p className="text-xs text-gray-500 mt-2">Nota: la rivalutazione è una stima basata su un tasso medio. Il calcolo reale è progressivo anno per anno.</p>
            </div>
          </div>
        </div>

        {/* Colonna Laterale: Strumenti e Guida */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
              <button onClick={handleReset} className="w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262!vig=!" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice Civile, Art. 2120</a> - Disciplina del Trattamento di Fine Rapporto.</li>
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1982-05-29;297!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge 29 maggio 1982, n. 297</a> - Norme sul TFR.</li>
              <li><a href="https://www.dominae.it/contratto-lavoro-domestico/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">CCNL Lavoro Domestico</a> - Contratto Collettivo Nazionale di settore.</li>
            </ul>
          </section>
        </aside>

      </div>
    </>
  );
};

export default TfrColfBadantiBabysitterCalculator;