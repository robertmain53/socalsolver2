'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Deposito Cauzionale e Interessi Legali",
  description: "Calcola con precisione gli interessi legali maturati sul deposito cauzionale del tuo contratto di locazione. Strumento aggiornato con i tassi storici."
};

// --- Dati Storici Tassi di Interesse Legale in Italia ---
const TASSI_INTERESSE_LEGALE = [
  { dal: "2024-01-01", tasso: 2.50 }, { dal: "2023-01-01", tasso: 5.00 },
  { dal: "2022-01-01", tasso: 1.25 }, { dal: "2021-01-01", tasso: 0.01 },
  { dal: "2020-01-01", tasso: 0.05 }, { dal: "2019-01-01", tasso: 0.80 },
  { dal: "2018-01-01", tasso: 0.30 }, { dal: "2017-01-01", tasso: 0.10 },
  { dal: "2016-01-01", tasso: 0.20 }, { dal: "2015-01-01", tasso: 0.50 },
  { dal: "2014-01-01", tasso: 1.00 }, { dal: "2012-01-01", tasso: 2.50 },
  { dal: "2011-01-01", tasso: 1.50 }, { dal: "2010-01-01", tasso: 1.00 },
  { dal: "2008-01-01", tasso: 3.00 }, { dal: "2004-01-01", tasso: 2.50 },
  { dal: "2002-01-01", tasso: 3.00 }, { dal: "2001-01-01", tasso: 3.50 },
  { dal: "2000-01-01", tasso: 2.50 }, { dal: "1999-01-01", tasso: 2.50 },
  { dal: "1997-01-01", tasso: 5.00 }, { dal: "1990-12-16", tasso: 10.00 },
  { dal: "1970-01-01", tasso: 5.00 } // Tasso base storico
].map(t => ({ ...t, data: new Date(t.dal) }));

// --- Icona per i Tooltip ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema = () => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": "A quanto ammontano gli interessi sul deposito cauzionale?",
      "acceptedAnswer": { "@type": "Answer", "text": "Gli interessi sul deposito cauzionale sono calcolati applicando il saggio di interesse legale stabilito annualmente dal Ministero dell'Economia. Poiché il tasso varia nel tempo, il calcolo deve essere effettuato per ogni periodo in cui si applica un tasso diverso." }
    }, {
      "@type": "Question",
      "name": "Il proprietario può trattenere gli interessi del deposito?",
      "acceptedAnswer": { "@type": "Answer", "text": "No, qualsiasi patto che escluda o limiti il diritto dell'inquilino a percepire gli interessi legali è nullo secondo l'art. 11 della Legge 392/78. Gli interessi devono essere corrisposti all'inquilino." }
    }, {
      "@type": "Question",
      "name": "Gli interessi sulla caparra sono tassati?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sì, sono considerati redditi di capitale. Il locatore deve applicare una ritenuta a titolo d'imposta del 26% sull'importo lordo degli interessi prima di corrisponderli all'inquilino." }
    }]
  }) }} />
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
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
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
  "slug": "deposito-cauzionale-e-interessi-legali",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Deposito Cauzionale e Interessi Legali",
  "lang": "it",
  "inputs": [
    { "id": "importo_deposito", "label": "Importo del Deposito Cauzionale", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Inserisci l'importo totale versato come caparra all'inizio del contratto di locazione." },
    { "id": "data_inizio", "label": "Data Inizio Contratto", "type": "date" as const, "tooltip": "Seleziona la data di inizio del contratto, che coincide con il versamento del deposito." },
    { "id": "data_fine", "label": "Data Fine Contratto", "type": "date" as const, "tooltip": "Seleziona la data in cui il contratto è terminato e il deposito dovrebbe essere restituito." }
  ],
  "outputs": [
    { "id": "interessi_legali_totali", "label": "Interessi Legali Totali Maturati (Lordo)", "unit": "€" },
    { "id": "importo_da_restituire", "label": "Importo Totale da Restituire (Lordo)", "unit": "€" }
  ],
  "content": "### **Guida Completa al Deposito Cauzionale e al Calcolo degli Interessi Legali**\n\n**Analisi Normativa, Metodologia di Calcolo e Aspetti Fiscali per Inquilini e Proprietari**\n\nIl deposito cauzionale è un elemento fondamentale in quasi tutti i contratti di locazione. Tuttavia, la gestione degli interessi legali che questo deposito matura è spesso fonte di dubbi e controversie. La legge italiana è chiara: il deposito non è una somma inerte, ma **deve produrre interessi** a favore dell'inquilino.\n\nQuesta guida offre una panoramica completa sulla materia, spiegando la base normativa, il funzionamento del calcolo, gli obblighi delle parti e le implicazioni fiscali. L'obiettivo è fornire uno strumento autorevole e trasparente, fermo restando che per controversie specifiche è sempre consigliabile rivolgersi a un professionista.\n\n### **Parte 1: Il Deposito Cauzionale - Cos'è e a Cosa Serve**\n\nIl deposito cauzionale, comunemente chiamato \"caparra\", è una somma di denaro che l'inquilino (conduttore) versa al proprietario (locatore) all'inizio del contratto di locazione. La sua funzione è di **garantire il locatore** contro eventuali danni all'immobile o inadempimenti contrattuali da parte del conduttore (es. mancato pagamento di canoni o oneri accessori).\n\nLa disciplina fondamentale è contenuta nell'**art. 11 della Legge n. 392 del 1978 (Legge sull'Equo Canone)**, che stabilisce due principi cardine:\n\n1.  **Limite all'Importo**: Il deposito non può superare le tre mensilità del canone di locazione.\n2.  **Obbligo di Corresponsione degli Interessi**: La stessa norma sancisce che il deposito \"*è produttivo di interessi legali che debbono essere corrisposti al conduttore alla fine di ogni anno*\".\n\n\n#### **L'Obbligo di Restituzione degli Interessi**\n\nÈ cruciale sottolineare che il diritto dell'inquilino a ricevere gli interessi è **inderogabile**. Qualsiasi clausola contrattuale che escluda o limiti tale diritto è da considerarsi nulla. Il proprietario è tenuto a corrispondere gli interessi maturati:\n\n* **Annualmente**: Alla fine di ogni anno di locazione.\n* **Alla fine del Contratto**: In un'unica soluzione al momento della riconsegna dell'immobile, insieme al capitale stesso.\n\nNella prassi, la seconda opzione è la più comune.\n\n### **Parte 2: Come Funziona il Calcolo degli Interessi Legali**\n\nIl calcolo non è complesso, ma richiede attenzione a un dettaglio fondamentale: il **saggio dell'interesse legale non è fisso**, ma viene modificato periodicamente con Decreto del Ministero dell'Economia e delle Finanze, sulla base del rendimento medio annuo lordo dei titoli di Stato e del tasso d'inflazione.\n\nQuesto significa che per un contratto pluriennale, il calcolo deve essere eseguito \"pro rata temporis\", applicando i diversi tassi d'interesse per i rispettivi periodi di competenza.\n\n#### **La Logica del Calcolo**\n\nIl nostro calcolatore automatizza questo processo, seguendo questi passaggi:\n\n1.  **Suddivisione del Periodo**: Il periodo totale di locazione (dalla data di inizio alla data di fine) viene suddiviso in base alle date in cui il saggio legale è cambiato.\n2.  **Calcolo dei Giorni**: Per ogni \"scaglione\" di tasso, si calcola il numero esatto di giorni di validità.\n3.  **Applicazione della Formula**: Per ogni scaglione, si calcola l'interesse con la formula:\n    `Interesse_Periodo = (Importo_Deposito × Tasso_Annuo_Percentuale × Giorni_Periodo) / 36500`\n4.  **Somma Finale**: Gli importi di interesse di tutti i periodi vengono sommati per ottenere il totale dovuto.\n\n**Esempio Pratico**: Se un contratto va dal 01/07/2022 al 30/06/2023 e il tasso legale è cambiato il 01/01/2023 (passando da 1,25% a 5,00%), il calcolo sarà spezzato in due parti:\n* Una per il periodo dal 01/07/2022 al 31/12/2022 al tasso dell'1,25%.\n* Una per il periodo dal 01/01/2023 al 30/06/2023 al tasso del 5,00%.\n\n### **Parte 3: Domande Frequenti (FAQ) e Aspetti Pratici**\n\n#### **Cosa succede se il proprietario non paga gli interessi?**\n\nL'inquilino ha il diritto di richiederli formalmente, tramite lettera raccomandata A/R o PEC. Se il locatore persiste nel non pagare, è possibile agire per vie legali per recuperare il credito. Il diritto a richiedere gli interessi si prescrive in **5 anni** dalla data in cui dovevano essere pagati.\n\n#### **Cosa succede se ci sono danni all'immobile?**\n\nSe alla fine della locazione vengono accertati danni all'immobile imputabili all'inquilino, il proprietario può trattenere, a titolo di risarcimento, tutto o parte del deposito cauzionale. Tuttavia, **non può decidere unilateralmente l'importo**. Se non c'è accordo tra le parti, la quantificazione del danno deve essere stabilita da un giudice. Il proprietario non può rifiutarsi di pagare gli interessi maturati fino a quel momento, anche se ha diritto a trattenere il capitale.\n\n#### **Gli interessi sul deposito cauzionale sono tassati?**\n\nSì. Gli interessi percepiti dal conduttore sono considerati \"redditi di capitale\". Il locatore, quando li corrisponde, deve operare una **ritenuta a titolo d'imposta del 26%**. Questo significa che il proprietario versa all'inquilino l'importo netto e si occupa di versare la ritenuta allo Stato tramite modello F24.\n\n**Esempio di Ritenuta**:\n* Interessi lordi maturati: 100 €\n* Ritenuta fiscale (26%): 26 €\n* Importo netto corrisposto all'inquilino: 74 €\n\nL'inquilino riceve l'importo netto e non deve inserirlo nella propria dichiarazione dei redditi, in quanto la tassazione è definitiva alla fonte."
};

const DepositoCauzionaleEInteressiLegaliCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const initialStates = {
    importo_deposito: 1200,
    data_inizio: '2021-09-01',
    data_fine: getTodayString(),
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const { importo_deposito, data_inizio, data_fine } = states;
    if (!importo_deposito || !data_inizio || !data_fine) return { interessi_legali_totali: 0, importo_da_restituire: 0, dettaglio_periodi: [] };

    let dataInizio = new Date(data_inizio);
    let dataFine = new Date(data_fine);
    if (dataInizio >= dataFine) return { interessi_legali_totali: 0, importo_da_restituire: 0, dettaglio_periodi: [] };
    
    let totaleInteressi = 0;
    const dettaglio: { anno: string, giorni: number, tasso: string, interessi: number }[] = [];
    let dataCorrente = dataInizio;

    TASSI_INTERESSE_LEGALE.forEach(tassoInfo => {
        let inizioPeriodoTasso = tassoInfo.data;
        let finePeriodoTasso = new Date('9999-12-31');
        const tassoIndex = TASSI_INTERESSE_LEGALE.indexOf(tassoInfo);
        if (tassoIndex > 0) {
            finePeriodoTasso = new Date(TASSI_INTERESSE_LEGALE[tassoIndex - 1].data);
            finePeriodoTasso.setDate(finePeriodoTasso.getDate() - 1);
        }

        const inizioCalcolo = dataCorrente > inizioPeriodoTasso ? dataCorrente : inizioPeriodoTasso;
        const fineCalcolo = dataFine < finePeriodoTasso ? dataFine : finePeriodoTasso;

        if (inizioCalcolo < fineCalcolo) {
            const diffTime = Math.abs(fineCalcolo.getTime() - inizioCalcolo.getTime());
            const giorni = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if(giorni > 0) {
              const interessiPeriodo = (importo_deposito * tassoInfo.tasso * giorni) / 36500;
              totaleInteressi += interessiPeriodo;
              
              const anno = fineCalcolo.getFullYear().toString();
              const existingEntry = dettaglio.find(d => d.anno === anno);
              if (existingEntry) {
                 existingEntry.interessi += interessiPeriodo;
              } else {
                 dettaglio.push({
                   anno: anno,
                   giorni: giorni, // Nota: i giorni sono per scaglione di tasso, non per anno solare
                   tasso: `${tassoInfo.tasso.toFixed(2)}%`,
                   interessi: interessiPeriodo
                 });
              }
            }
        }
    });

    return {
      interessi_legali_totali: totaleInteressi,
      importo_da_restituire: importo_deposito + totaleInteressi,
      dettaglio_periodi: dettaglio.sort((a,b) => parseInt(a.anno) - parseInt(b.anno))
    };
  }, [states]);
  
  const chartData = useMemo(() => {
    return calculatedOutputs.dettaglio_periodi.map(d => ({ name: d.anno, Interessi: parseFloat(d.interessi.toFixed(2)) }));
  }, [calculatedOutputs.dettaglio_periodi]);
  
  const formulaUsata = `Interesse = Σ [ (Importo Deposito × Tasso Annuo del Periodo × Giorni nel Periodo) / 36500 ]`;

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
    } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: {interessi_legali_totali: calculatedOutputs.interessi_legali_totali, importo_da_restituire: calculatedOutputs.importo_da_restituire}, ts: Date.now() };
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
          <div className="bg-white rounded-lg shadow-md p-6" ref={calcolatoreRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 my-6">
              <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima accurata basata sui tassi legali storici. Tuttavia, non sostituisce una consulenza legale e i risultati sono solo a scopo informativo.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-lg">
              {inputs.map(input => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                  </label>
                  <div className="flex items-center gap-2">
                    <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type={input.type} min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} />
                    {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
              {outputs.map(output => (
                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'importo_da_restituire' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                  <div className={`text-xl md:text-2xl font-bold ${output.id === 'importo_da_restituire' ? 'text-indigo-600' : 'text-gray-800'}`}>
                    <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Dettaglio e Grafico Interessi Annuali</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                    {isClient && chartData.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `€${value}`} />
                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="Interessi" fill="#4f46e5" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="overflow-auto max-h-64 text-sm border rounded-lg">
                      <table className="min-w-full">
                          <thead className="bg-gray-100 sticky top-0"><tr><th className="p-2 text-left font-semibold">Anno</th><th className="p-2 text-right font-semibold">Interessi Maturati</th></tr></thead>
                          <tbody>
                              {calculatedOutputs.dettaglio_periodi.map((d, i) => (
                                <tr key={i} className="border-t"><td className="p-2">{d.anno}</td><td className="p-2 text-right">{formatCurrency(d.interessi)}</td></tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                </div>
            </div>
             <div className="mt-6 border rounded-lg shadow-sm p-4 bg-white">
                <h3 className="font-semibold text-gray-700">Metodologia di Calcolo</h3>
                <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                 <p className="text-xs text-gray-500 mt-2">Il calcolo è eseguito sommando gli interessi maturati in ogni periodo in cui è stato in vigore uno specifico tasso legale (calcolo pro-rata temporis).</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Esporta PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Reset Campi</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida alla Materia</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1978-07-27;392!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge 27 luglio 1978, n. 392, Art. 11</a> - Disciplina delle locazioni di immobili urbani.</li>
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice Civile, Art. 1284</a> - Saggio degli interessi.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default DepositoCauzionaleEInteressiLegaliCalculator;