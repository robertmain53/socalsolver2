'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
// Correzione: Aggiunto 'Cell' all'importazione da recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Detrazioni Fiscali per Ristrutturazione (50%)",
  description: "Calcola la detrazione IRPEF del 50% per i tuoi lavori di ristrutturazione. Stima il rimborso totale e la rata annuale in pochi secondi."
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
            "name": "Qual è il limite di spesa per il bonus ristrutturazione?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il limite massimo di spesa su cui è possibile calcolare la detrazione del 50% è di 96.000 euro per singola unità immobiliare. La spesa eccedente questo importo non dà diritto ad alcun beneficio fiscale."
            }
          },
          {
            "@type": "Question",
            "name": "In quanti anni si recupera la detrazione per ristrutturazione?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La detrazione fiscale totale, pari al 50% della spesa ammessa, viene ripartita in 10 rate annuali di pari importo. Ogni rata riduce l'IRPEF dovuta per l'anno di riferimento."
            }
          },
          {
            "@type": "Question",
            "name": "Cosa succede se la mia IRPEF è più bassa della rata annuale?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Se l'imposta lorda IRPEF di un anno è inferiore all'importo della rata di detrazione, la parte della rata che eccede l'imposta (incapienza) viene persa. Non può essere rimborsata né utilizzata negli anni successivi."
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


// Dati di configurazione del calcolatore
const calculatorData = {
  "slug": "detrazioni-ristrutturazione-50",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Detrazioni Fiscali per Ristrutturazione (50%)",
  "lang": "it",
  "inputs": [
    {
      "id": "importo_spesa",
      "label": "Importo totale dei lavori di ristrutturazione",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 100,
      "tooltip": "Inserisci l'importo totale delle spese sostenute per i lavori, comprensivo di IVA. Il limite massimo di spesa su cui calcolare la detrazione è di 96.000 € per unità immobiliare."
    }
  ],
  "outputs": [
    {
      "id": "spesa_ammessa",
      "label": "Spesa massima detraibile",
      "unit": "€",
      "tooltip": "È l'importo massimo su cui è possibile calcolare la detrazione. Corrisponde alla spesa sostenuta, fino a un tetto massimo di 96.000 €."
    },
    {
      "id": "detrazione_totale",
      "label": "Detrazione IRPEF totale (50%)",
      "unit": "€",
      "tooltip": "L'importo totale che verrà rimborsato come credito d'imposta, pari al 50% della spesa massima detraibile."
    },
    {
      "id": "rata_annuale",
      "label": "Detrazione annuale per 10 anni",
      "unit": "€",
      "tooltip": "La detrazione totale viene ripartita in 10 rate annuali di pari importo, che andranno a ridurre l'IRPEF dovuta ogni anno."
    }
  ],
  "content": "### **Guida Completa al Bonus Ristrutturazione 50%\n\n**Tutto ciò che devi sapere per calcolare e ottenere la detrazione fiscale per i lavori in casa: criteri, spese ammesse, adempimenti e novità normative.**\n\nIl **Bonus Ristrutturazione** è una delle agevolazioni fiscali più importanti e utilizzate in Italia, permettendo di recuperare una parte significativa delle spese sostenute per interventi di recupero del patrimonio edilizio. Questa guida, insieme al nostro calcolatore interattivo, ha lo scopo di fornire un quadro chiaro e autorevole per navigare tra le regole e massimizzare il beneficio fiscale.\n\n**Il nostro strumento offre una stima precisa e immediata della detrazione, ma non sostituisce la consulenza di un professionista qualificato (commercialista, CAF) che possa valutare le specificità del singolo caso.**\n\n### **Parte 1: Il Calcolo della Detrazione - Come Funziona**\n\nLa logica di calcolo è diretta ma basata su tre pilastri fondamentali stabiliti dalla normativa fiscale:\n\n1.  **L'Importo della Spesa**: Si considerano tutte le spese idonee sostenute.\n2.  **Il Limite Massimo di Spesa**: La detrazione si calcola su un ammontare massimo di spesa di **96.000 €** per singola unità immobiliare. Questo significa che anche se si spendono 120.000 €, il calcolo verrà effettuato solo sui primi 96.000 €.\n3.  **L'Aliquota della Detrazione**: L'aliquota è fissata al **50%** della spesa ammessa.\n4.  **La Ripartizione Temporale**: Il beneficio fiscale totale viene suddiviso in **10 rate annuali** di pari importo.\n\nIl calcolatore applica esattamente questa logica: prende l'importo da te inserito, lo confronta con il tetto di 96.000 €, calcola il 50% del valore più basso tra i due, e infine divide il risultato per 10 per mostrarti il beneficio netto annuale sull'IRPEF.\n\n### **Parte 2: Guida Approfondita all'Agevolazione**\n\n#### **Chi può beneficiare della detrazione? (Soggetti Ammessi)**\n\nL'agevolazione non è riservata solo ai proprietari degli immobili. Possono usufruirne tutti i contribuenti IRPEF che possiedono o detengono l'immobile sulla base di un titolo idoneo e che sostengono le spese. Tra questi rientrano:\n\n* **Proprietari** o nudi proprietari.\n* Titolari di un diritto reale di godimento (usufrutto, uso, abitazione).\n* **Inquilini** (locatari) o comodatari.\n* Soci di cooperative.\n* Imprenditori individuali (per gli immobili non strumentali).\n* Familiari conviventi del possessore o detentore dell'immobile, a condizione che sostengano le spese e che le fatture e i bonifici siano a loro intestati.\n\n#### **Quali lavori rientrano nel bonus? (Spese Ammissibili)**\n\nLe tipologie di intervento che danno diritto al bonus sono chiaramente definite dall'Agenzia delle Entrate e riguardano:\n\n* **Manutenzione Straordinaria**: Rinnovo e sostituzione di parti anche strutturali degli edifici (es. rifacimento di un bagno, sostituzione infissi con modifica di materiale o tipologia, realizzazione di un vespaio).\n* **Restauro e Risanamento Conservativo**: Interventi volti a conservare l'organismo edilizio e ad assicurarne la funzionalità.\n* **Ristrutturazione Edilizia**: Trasformazione di un organismo edilizio che può portare a un organismo in tutto o in parte diverso dal precedente (es. demolizione e ricostruzione, ampliamento).\n* Interventi su **parti comuni di edifici residenziali** (condomini): in questo caso sono ammesse anche le spese per **manutenzione ordinaria** (es. tinteggiatura delle scale, riparazione ascensore).\n* Altri interventi specifici come quelli per la **rimozione delle barriere architettoniche**, la **prevenzione di atti illeciti** (installazione di porte blindate, allarmi), la **bonifica dall'amianto** e la **riduzione dell'inquinamento acustico**.\n\n#### **Come effettuare i pagamenti: il Bonifico Parlante**\n\nQuesto è un adempimento cruciale. Per non perdere il diritto alla detrazione, tutte le spese devono essere pagate tramite **bonifico bancario o postale \"parlante\"**. Questo bonifico deve contenere obbligatoriamente:\n\n1.  **Causale del versamento**: con riferimento alla norma (art. 16-bis del Dpr 917/1986).\n2.  **Codice fiscale** del beneficiario della detrazione.\n3.  **Codice fiscale o Partita IVA** del soggetto a favore del quale il bonifico è effettuato (l'impresa o il professionista).\n\nMolte banche offrono una modalità specifica per \"bonifici per ristrutturazione edilizia\" che precompila parte di questi dati.\n\n#### **Documenti da conservare con cura**\n\nL'Agenzia delle Entrate può richiedere la documentazione per controlli futuri. È fondamentale conservare per almeno 10 anni:\n\n* Fatture e ricevute fiscali relative alle spese.\n* Ricevute dei bonifici parlanti.\n* Eventuali abilitazioni amministrative richieste dalla normativa edilizia (CILA, SCIA, Permesso di Costruire).\n* Domanda di accatastamento (se l'immobile non è ancora censito).\n* Delibera assembleare di approvazione dei lavori (per gli interventi condominiali).\n\n### **Parte 3: Domande Frequenti (FAQ)**\n\n* **Cosa succede se la mia IRPEF è inferiore alla rata annuale?**\n    La parte della rata che supera l'imposta dovuta per quell'anno (la cosiddetta \"incapienza\") viene persa. Non è possibile chiedere un rimborso né riportarla all'anno successivo.\n\n* **Posso avere il Bonus Ristrutturazione insieme al Bonus Mobili?**\n    Sì. La realizzazione di un intervento di ristrutturazione che dà diritto al bonus 50% è il presupposto per poter accedere anche al **Bonus Mobili ed Elettrodomestici**, un'ulteriore detrazione del 50% (su un tetto di spesa specifico e inferiore) per l'acquisto di arredi.\n\n* **Cosa succede se vendo l'immobile prima dei 10 anni?**\n    Salvo diverso accordo tra le parti, la detrazione non ancora fruita viene trasferita all'acquirente dell'immobile (per le quote rimanenti). È possibile, tuttavia, specificare nell'atto di compravendita che il venditore manterrà il diritto alle quote residue.\n\n* **Cessione del credito e sconto in fattura sono ancora validi?**\n    No. A partire da febbraio 2023 (e con ulteriori restrizioni nel 2024), le opzioni per la cessione del credito e lo sconto in fattura sono state abrogate per la maggior parte dei bonus edilizi, incluso quello per le ristrutturazioni. La modalità standard per fruire del beneficio è la detrazione in dichiarazione dei redditi in 10 anni."
};

const DetrazioniRistrutturazione50Calculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    importo_spesa: 50000,
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setStates(initialStates);
  };

  const calculatedOutputs = useMemo(() => {
    const importo_spesa = Number(states.importo_spesa) || 0;
    
    const spesa_ammessa = Math.min(importo_spesa, 96000);
    const detrazione_totale = spesa_ammessa * 0.50;
    const rata_annuale = detrazione_totale / 10;

    return {
      spesa_ammessa,
      detrazione_totale,
      rata_annuale,
    };
  }, [states]);
  
  const chartData = [
    { name: 'Spesa Sostenuta', value: Number(states.importo_spesa) || 0, fill: '#8884d8' },
    { name: 'Spesa Ammessa', value: calculatedOutputs.spesa_ammessa, fill: '#82ca9d' },
    { name: 'Detrazione Totale', value: calculatedOutputs.detrazione_totale, fill: '#ffc658' },
  ];

  const formulaUsata = `Detrazione Totale = MIN(Importo Spesa; 96.000€) * 50%`;

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
    } catch (_e) { alert("Funzione PDF non disponibile in questo ambiente"); }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
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
            <p className="text-gray-600 mb-4">{meta.description}</p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale o legale. La validità dei calcoli dipende dalla correttezza dei dati inseriti e dalla normativa vigente.
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              {inputs.map(input => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                  </label>
                  <div className="flex items-center gap-2">
                    <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-lg" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                    {input.unit && <span className="text-lg text-gray-500 font-semibold">{input.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
              {outputs.map(output => (
                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'rata_annuale' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="text-sm md:text-base font-medium text-gray-700 flex items-center">
                    {output.label}
                    {(output as any).tooltip && <Tooltip text={(output as any).tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                  </div>
                  <div className={`text-xl md:text-2xl font-bold ${output.id === 'rata_annuale' ? 'text-indigo-600' : 'text-gray-800'}`}>
                    <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualizzazione Grafica</h3>
              <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                        <YAxis type="category" dataKey="name" width={120} />
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}/>
                        <Bar dataKey="value" name="Valore" barSize={30}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
            <div className="mt-6 border rounded-lg shadow-sm p-4 bg-white">
                <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800 text-lg">Azioni Rapide</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 rounded-md px-3 py-2 text-sm text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>
          
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800 text-lg">Guida e Approfondimenti</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800 text-lg">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.agenziaentrate.gov.it/portale/schede/agevolazioni/detrristredil36/schinfodetrristredil36" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Guida Ufficiale Agenzia delle Entrate</a> - Ristrutturazioni edilizie.</li>
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Art. 16-bis del D.P.R. 917/1986 (TUIR)</a> - Testo Unico delle Imposte sui Redditi.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default DetrazioniRistrutturazione50Calculator;