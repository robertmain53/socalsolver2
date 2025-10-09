'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: 'Calcolatore Retta Asilo Nido con Bonus INPS 2025',
  description: 'Calcola il rimborso mensile e la retta netta dell\'asilo nido con il Bonus INPS 2025. Include le nuove maggiorazioni per i secondi figli in base all\'ISEE.',
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
            "name": "Come si calcola il Bonus Asilo Nido 2025?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il calcolo si basa sull'ISEE Minorenni, sulla retta mensile pagata e su una nuova maggiorazione per i figli nati dal 1° gennaio 2024 se nel nucleo è presente un altro figlio sotto i 10 anni. Il nostro calcolatore automatizza questo processo."
            }
          },
          {
            "@type": "Question",
            "name": "Qual è la novità principale del Bonus Nido 2025?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La novità principale è una maggiorazione dell'importo massimo annuo a 3.600€ per le famiglie con ISEE fino a 40.000€, a condizione che il bonus sia per un figlio nato dal 1° gennaio 2024 e che ci sia un altro figlio minore di 10 anni in famiglia."
            }
          },
          {
            "@type": "Question",
            "name": "Posso ricevere il Bonus Nido e anche la detrazione fiscale?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, il Bonus Asilo Nido non è cumulabile con la detrazione IRPEF del 19% per le spese di frequenza. Per ogni mensilità, devi scegliere quale dei due benefici utilizzare."
            }
          },
          {
            "@type": "Question",
            "name": "Il Bonus Asilo Nido fa reddito?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, il Bonus Asilo Nido è una prestazione di assistenza sociale e non è considerato reddito ai fini fiscali. Pertanto, non va dichiarato nell'IRPEF."
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
                if (trimmedBlock.startsWith('|')) {
                    const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
                    const headers = rows[0];
                    const body = rows.slice(2);
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {headers.map((header, i) => <th key={i} className="p-2 border text-left font-semibold">{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {body.map((row, i) => (
                                        <tr key={i}>
                                            {row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
                                        </tr>
                                    ))}
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
  "slug": "retta-asilo-nido-con-bonus",
  "category": "Famiglia e Vita Quotidiana",
  "title": "Calcolatore Retta Asilo Nido con Bonus INPS 2025",
  "lang": "it",
  "inputs": [
    {
      "id": "isee",
      "label": "ISEE Minorenni in corso di validità",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 100,
      "tooltip": "Inserisci il valore dell'ISEE Minorenni del tuo nucleo familiare. Se non lo presenti o superi i 40.000€, ti spetta l'importo minimo."
    },
    {
      "id": "retta_mensile",
      "label": "Retta mensile dell'asilo nido",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 10,
      "tooltip": "Indica l'importo della retta mensile pagata all'asilo nido. Il bonus non può superare questa cifra."
    },
    {
      "id": "is_nato_2024",
      "label": "Il figlio è nato a partire dal 1° gennaio 2024?",
      "type": "boolean" as const,
      "tooltip": "Spunta questa casella se il bambino per cui richiedi il bonus è nato nel 2024 o dopo."
    },
    {
      "id": "has_fratello_minore_10",
      "label": "C'è un altro figlio sotto i 10 anni nel nucleo?",
      "type": "boolean" as const,
      "condition": "is_nato_2024 == true",
      "tooltip": "Seleziona se nel nucleo familiare è presente almeno un altro figlio con meno di 10 anni. Questa condizione, unita alla nuova nascita, dà diritto alla maggiorazione."
    },
    {
      "id": "numero_mensilita",
      "label": "Numero di mensilità da calcolare",
      "type": "number" as const,
      "unit": "mesi",
      "min": 1,
      "max": 11,
      "step": 1,
      "tooltip": "Indica per quanti mesi vuoi calcolare il rimborso (massimo 11)."
    }
  ],
  "outputs": [
    {
      "id": "bonus_mensile_spettante",
      "label": "Bonus Mensile Massimo Spettante",
      "unit": "€"
    },
    {
      "id": "rimborso_mensile_reale",
      "label": "Rimborso Mensile Effettivo",
      "unit": "€"
    },
    {
      "id": "retta_netta_mensile",
      "label": "Tua Spesa Mensile Netta",
      "unit": "€"
    },
    {
      "id": "rimborso_annuale_totale",
      "label": "Rimborso Totale per i Mesi Selezionati",
      "unit": "€"
    }
  ],
  "content": "### **Guida Completa al Bonus Asilo Nido 2025: Calcolo, Novità e Criteri**\n\n**Analisi dettagliata dei requisiti ISEE, della maggiorazione per i nuovi nati e delle implicazioni fiscali.**\n\nIl **Bonus Asilo Nido** è un'importante misura di sostegno economico erogata dall'INPS, pensata per aiutare le famiglie a sostenere i costi per la frequenza di asili nido pubblici e privati autorizzati. Con le novità introdotte, in particolare per il 2025, è fondamentale comprendere i meccanismi di calcolo per massimizzare il beneficio.\n\nQuesto strumento offre una **stima precisa e personalizzata** del bonus, tenendo conto di tutte le variabili previste dalla normativa. Ricorda che i risultati sono a scopo informativo e non sostituiscono le comunicazioni ufficiali dell'INPS, unico ente preposto all'erogazione.\n\n### **Parte 1: Come Utilizzare il Calcolatore**\n\nIl nostro calcolatore è progettato per essere intuitivo e guidarti passo dopo passo. Ecco i dati che ti verranno richiesti:\n\n* **ISEE Minorenni**: È il parametro più importante. L'Indicatore della Situazione Economica Equivalente specifico per le prestazioni ai minori determina la fascia di importo a cui hai diritto. Se non hai un ISEE valido o se è superiore a 40.000 €, ti verrà riconosciuto l'importo minimo.\n* **Retta Mensile**: Inserisci il costo mensile che sostieni per l'asilo nido. Il rimborso INPS non può mai superare la spesa effettivamente documentata.\n* **Condizioni del Nucleo Familiare (Novità 2025)**: Per accedere alla nuova maggiorazione, il calcolatore ti chiederà se il bambino per cui richiedi il bonus è nato a partire dal 1° gennaio 2024 e se nel nucleo è già presente un altro figlio di età inferiore a 10 anni.\n\nI risultati ti mostreranno non solo il bonus massimo a cui hai diritto, ma anche il **rimborso reale** che riceverai e la **spesa netta** che rimarrà a tuo carico.\n\n### **Parte 2: Guida Approfondita al Bonus Asilo Nido**\n\n#### **Cos'è e a Chi Spetta**\n\nIl bonus è un contributo economico che spetta a tutte le famiglie, indipendentemente dalla condizione lavorativa dei genitori, per i figli di età inferiore ai 3 anni. I requisiti fondamentali sono:\n\n* Residenza in Italia.\n* Cittadinanza italiana, di uno Stato UE o permesso di soggiorno UE per soggiornanti di lungo periodo (o status di rifugiato/protezione sussidiaria).\n* Il genitore richiedente deve essere colui che sostiene l'onere della retta.\n\n#### **Gli Importi e le Fasce ISEE per il 2025**\n\nLa struttura degli importi si basa su due scenari distinti:\n\n**Scenario 1: Caso Standard**\n\n| Fascia ISEE Minorenni         | Importo Massimo Annuo | Importo Massimo Mensile (su 11 mesi) |\n|-------------------------------|-----------------------|----------------------------------------|\n| Fino a 25.000 €               | 3.000 €               | 272,73 €                               |\n| Da 25.001 € a 40.000 €        | 2.500 €               | 227,27 €                               |\n| Oltre 40.000 € o senza ISEE   | 1.500 €               | 136,36 €                               |\n\n**Scenario 2: Caso con Maggiorazione (Nuovi Nati 2024)**\n\nQuesta maggiorazione si applica solo se nel nucleo familiare sono presenti **contemporaneamente** un nuovo nato dal 1° gennaio 2024 e almeno un altro figlio con meno di 10 anni.\n\n| Fascia ISEE Minorenni         | Importo Massimo Annuo | Importo Massimo Mensile (su 11 mesi) |\n|-------------------------------|-----------------------|----------------------------------------|\n| Fino a 40.000 €               | 3.600 €               | 327,27 €                               |\n| Oltre 40.000 € o senza ISEE   | 1.500 €               | 136,36 €                               |\n\n#### **Bonus Asilo Nido vs. Supporto Domiciliare**\n\nIl beneficio può essere richiesto in due forme alternative:\n\n1.  **Contributo per la retta dell'asilo nido**: L'oggetto di questo calcolatore.\n2.  **Contributo per il supporto domiciliare**: Per i bambini sotto i 3 anni affetti da gravi patologie croniche che non possono frequentare il nido. In questo caso, l'importo è fisso e pari a **3.600 € all'anno**, indipendentemente dall'ISEE.\n\n### **Parte 3: Aspetti Fiscali e Pratici**\n\n#### **Incumulabilità con la Detrazione Fiscale**\n\n**Attenzione**: il Bonus Asilo Nido **non è cumulabile** con la detrazione fiscale IRPEF del 19% per le spese di frequenza degli asili nido. Per le mensilità per cui si riceve il bonus, non è possibile portare in detrazione la relativa spesa nella dichiarazione dei redditi. Dovrai scegliere quale dei due benefici è più vantaggioso per te.\n\n#### **Modalità di Erogazione**\n\nIl bonus viene erogato dall'INPS mensilmente, dopo che il genitore ha presentato la documentazione che attesta l'avvenuto pagamento della retta (es. fattura, ricevuta, bollettino postale). La domanda si presenta esclusivamente online sul portale INPS.\n\n### **Conclusione**\n\nIl Bonus Asilo Nido rappresenta un aiuto concreto per le famiglie. Utilizzare questo calcolatore ti permette di pianificare con maggiore consapevolezza le tue finanze, comprendendo l'impatto reale del sostegno statale sulla retta mensile. Per ogni dettaglio e per la presentazione della domanda, il riferimento ufficiale resta il sito dell'INPS."
};

const RettaAsiloNidoConBonusCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = {
      isee: 22000,
      retta_mensile: 450,
      is_nato_2024: true,
      has_fratello_minore_10: true,
      numero_mensilita: 11
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);
    
    const handleStateChange = (id: string, value: any) => {
      setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = () => {
      setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { isee, retta_mensile, is_nato_2024, has_fratello_minore_10, numero_mensilita } = states;
        const is_maggiorazione = is_nato_2024 && has_fratello_minore_10;

        let importo_massimo_annuale;
        if (is_maggiorazione) {
            importo_massimo_annuale = (isee > 0 && isee <= 40000) ? 3600 : 1500;
        } else {
            if (isee > 0 && isee <= 25000) importo_massimo_annuale = 3000;
            else if (isee > 25000 && isee <= 40000) importo_massimo_annuale = 2500;
            else importo_massimo_annuale = 1500;
        }
        
        const bonus_mensile_spettante = importo_massimo_annuale / 11;
        const rimborso_mensile_reale = Math.min(bonus_mensile_spettante, retta_mensile);
        const retta_netta_mensile = retta_mensile - rimborso_mensile_reale;
        const rimborso_annuale_totale = rimborso_mensile_reale * numero_mensilita;
        
        return {
            bonus_mensile_spettante,
            rimborso_mensile_reale,
            retta_netta_mensile,
            rimborso_annuale_totale,
        };
    }, [states]);
    
    const chartData = [
      { 
        name: 'Costo Mensile', 
        'Tua Spesa': calculatedOutputs.retta_netta_mensile, 
        'Bonus INPS': calculatedOutputs.rimborso_mensile_reale 
      }
    ];

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = (await import('jspdf'));
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
            while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pdfHeight;
            }
            pdf.save(`${slug}.pdf`);
        } catch (e) { 
            console.error(e);
            alert("Impossibile generare il PDF."); 
        }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/50 font-sans">
                <div className="lg:col-span-2">
                    <div className="p-1 md:p-2" ref={calcolatoreRef}>
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                            <p className="text-gray-600 mb-6">Calcola il rimborso mensile e la retta netta dell'asilo nido con il Bonus INPS 2025.</p>
                            <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza o le comunicazioni ufficiali dell'INPS.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {inputs.map(input => {
                                    const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                    if (!conditionMet) return null;

                                    const inputLabel = (
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                        </label>
                                    );

                                    if (input.type === 'boolean') {
                                        return (
                                            <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                                <label className="text-sm font-medium text-gray-800" htmlFor={input.id}>{input.label}</label>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={input.id}>
                                            {inputLabel}
                                            <div className="relative flex items-center">
                                                {input.unit === '€' && <span className="pointer-events-none absolute left-3 text-gray-500">€</span>}
                                                <input 
                                                  id={input.id} 
                                                  aria-label={input.label} 
                                                  className={`w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 ${input.unit === '€' ? 'pl-7 pr-3' : 'pl-3 pr-12'}`}
                                                  type="number" min={input.min} max={input.max} step={input.step} 
                                                  value={states[input.id]} 
                                                  onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} 
                                                />
                                                {input.unit !== '€' && <span className="pointer-events-none absolute right-3 text-gray-500">{input.unit}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati del Calcolo</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {outputs.map(output => (
                                    <div key={output.id} className={`p-4 rounded-lg flex flex-col justify-between ${output.id === 'retta_netta_mensile' ? 'bg-indigo-50 border-l-4 border-indigo-500 sm:col-span-2 lg:col-span-1' : 'bg-gray-50 border-l-4 border-gray-300'}`}>
                                      <div className="text-sm font-medium text-gray-600">{output.label}</div>
                                      <div className={`text-2xl font-bold ${output.id === 'retta_netta_mensile' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                      </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ripartizione Costo Mensile</h3>
                                <div className="h-64 w-full bg-gray-50/50 p-2 rounded-lg border">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" hide />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(230, 230, 230, 0.5)'}} />
                                                <Legend />
                                                <Bar dataKey="Tua Spesa" stackId="a" fill="#4f46e5" name="Tua Spesa" />
                                                <Bar dataKey="Bonus INPS" stackId="a" fill="#a5b4fc" name="Bonus INPS" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-xl p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="flex flex-col gap-3">
                            <button onClick={salvaRisultato} className="w-full text-center border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-center border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-center border border-red-300 bg-red-50 text-red-700 rounded-md px-3 py-2 text-sm font-medium hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-xl p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-xl p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-servizi.bonus-asilo-nido-e-forme-di-supporto-presso-la-propria-abitazione-51105.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Pagina Ufficiale INPS</a> - Bonus asilo nido.</li>
                            <li><a href="https://www.gazzettaufficiale.it/eli/id/2023/12/30/23G00214/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge di Bilancio 2024</a> - (Legge 30 dicembre 2023, n. 213, art. 1, comma 177).</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default RettaAsiloNidoConBonusCalculator;