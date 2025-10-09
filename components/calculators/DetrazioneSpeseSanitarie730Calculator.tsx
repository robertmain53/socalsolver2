'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

// --- Dati di configurazione del calcolatore (inclusi nel componente) ---
const calculatorData = {
  "slug": "detrazione-spese-sanitarie-730",
  "category": "Famiglia e Vita Quotidiana",
  "title": "Calcolatore Detrazioni Spese Mediche e Sanitarie (730)",
  "lang": "it",
  "inputs": [
    {
      "id": "spese_mediche_ordinarie",
      "label": "Spese mediche e sanitarie ordinarie",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 10,
      "tooltip": "Inserisci il totale delle spese mediche sostenute (visite, farmaci, analisi, ecc.). Usa pagamenti tracciabili."
    },
    {
      "id": "spese_per_disabili",
      "label": "Spese per persone con disabilità",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 10,
      "tooltip": "Inserisci le spese mediche per persone con disabilità riconosciuta. Queste spese sono interamente detraibili senza franchigia."
    },
    {
      "id": "spese_rimborsate",
      "label": "Spese rimborsate da assicurazioni o enti",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 10,
      "tooltip": "Indica l'importo delle spese che ti è stato rimborsato da un'assicurazione sanitaria o da un ente. Questo importo non è detraibile."
    }
  ],
  "outputs": [
    {
      "id": "detrazione_irpef",
      "label": "Detrazione IRPEF Lorda (19%)",
      "unit": "€"
    },
    {
      "id": "spesa_detraibile",
      "label": "Importo Totale su cui si calcola la detrazione",
      "unit": "€"
    },
    {
      "id": "costo_netto_effettivo",
      "label": "Costo Netto Effettivo a tuo carico",
      "unit": "€"
    }
  ],
  "content": "### **Guida Completa alla Detrazione delle Spese Mediche e Sanitarie**\n\n**Come Massimizzare il Risparmio Fiscale con il Modello 730**\n\nLa detrazione per le spese mediche è una delle agevolazioni fiscali più importanti per i contribuenti italiani. Permette di recuperare una parte dei costi sostenuti per la propria salute e quella dei familiari a carico, riducendo l'imposta lorda (IRPEF) da versare.\n\nQuesto strumento è progettato per offrire una stima precisa e immediata della detrazione spettante, ma è fondamentale comprendere i principi che la regolano. **Questa guida e il calcolatore non sostituiscono la consulenza di un professionista qualificato (CAF o commercialista)**, ma forniscono una base solida e autorevole per orientarsi.\n\n### **Parte 1: Come Funziona il Calcolatore e la Detrazione**\n\nIl principio base è semplice: lo Stato consente di **detrarre dall'IRPEF il 19%** delle spese sanitarie sostenute. Tuttavia, il calcolo non si applica sull'intero importo, ma sulla parte che eccede una **franchigia fissa di 129,11 €**.\n\n#### **Parametri Fondamentali del Calcolo**\n\n1.  **Spese Mediche Ordinarie**: Qui va inserita la somma di tutte le spese detraibili (farmaci, visite specialistiche, ticket, analisi, ecc.). È essenziale che queste spese siano state pagate con **metodi tracciabili** (carta di credito/debito, bonifico, assegno). Le uniche eccezioni riguardano l'acquisto di medicinali e dispositivi medici, e le prestazioni sanitarie rese da strutture pubbliche o private accreditate.\n\n2.  **Spese per Persone con Disabilità**: Le spese mediche e di assistenza specifica per persone con disabilità (riconosciuta ai sensi della Legge 104/92) godono di un regime fiscale più favorevole. Sono **interamente deducibili dal reddito complessivo o, in alcuni casi, detraibili al 19% senza applicare la franchigia**. Il nostro calcolatore le considera detraibili al 19% senza franchigia, un caso molto comune e vantaggioso.\n\n3.  **Spese Rimborsate**: Se hai un'assicurazione sanitaria o un fondo che ti ha rimborsato parte delle spese, tale importo va sottratto dal totale perché non è rimasto a tuo carico e quindi non è detraibile.\n\n#### **La Formula Spiegata**\n\n`Detrazione Lorda = ( ( (Spese Ordinarie - Spese Rimborsate) - 129,11 € ) + Spese per Disabili ) * 19% )`\n\nSe il risultato di `(Spese Ordinarie - Spese Rimborsate)` è inferiore alla franchigia, quella parte del calcolo è pari a zero.\n\n### **Parte 2: Quali Spese Sono Detraibili? Un Elenco Dettagliato**\n\nL'Agenzia delle Entrate fornisce un elenco preciso delle spese ammesse. Ecco le categorie principali:\n\n* **Prestazioni Mediche**: Visite specialistiche (dentista, oculista, cardiologo, ecc.), prestazioni chirurgiche, analisi di laboratorio, prestazioni rese da psicologi e psicoterapeuti.\n* **Farmaci**: Sia quelli con prescrizione che i farmaci da banco (SOP e OTC). È indispensabile conservare lo **\"scontrino parlante\"** che riporta il codice fiscale dell'acquirente, la natura e la quantità del farmaco.\n* **Dispositivi Medici**: Occhiali da vista, lenti a contatto, apparecchi acustici, macchine per aerosol, materassi ortopedici, ecc. Devono avere la marcatura CE.\n* **Ticket Sanitari**: I pagamenti effettuati per prestazioni ricevute nell'ambito del Servizio Sanitario Nazionale (SSN).\n* **Assistenza Specifica**: Prestazioni di infermieri, fisioterapisti, e altre figure professionali sanitarie.\n* **Spese per Familiari a Carico**: È possibile detrarre anche le spese sostenute nell'interesse dei familiari fiscalmente a carico (es. coniuge, figli) per la parte non detratta da loro.\n\n### **Parte 3: Aspetti Chiave e Domande Frequenti (FAQ)**\n\n#### **Tracciabilità dei Pagamenti: Quando è Obbligatoria?**\n\nDal 1° gennaio 2020, l'obbligo di pagamento con mezzi tracciabili è un requisito fondamentale per la detrazione del 19%. Fanno eccezione:\n* Acquisto di medicinali e dispositivi medici.\n* Prestazioni sanitarie rese da strutture sanitarie pubbliche.\n* Prestazioni sanitarie rese da strutture sanitarie private accreditate al SSN.\n\n#### **Come Conservare i Documenti?**\n\nÈ obbligatorio conservare tutti i documenti fiscali (fatture, ricevute, scontrini parlanti) e le prove di pagamento tracciabile per 5 anni, in caso di controlli da parte dell'Agenzia delle Entrate.\n\n#### **Le Spese Veterinarie Sono Incluse?**\n\nNo. Le spese veterinarie hanno una detrazione separata, con un limite di spesa e regole diverse. Non vanno sommate in questo calcolatore.\n\n### **Conclusione: Un Beneficio da Non Sottovalutare**\n\nCalcolare correttamente la detrazione per spese mediche può portare a un significativo risparmio fiscale. Utilizza questo strumento per avere una stima affidabile, raccogli con cura tutta la documentazione e, per la dichiarazione finale, affidati a un intermediario abilitato per garantire la correttezza di ogni dato.",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "A quanto ammonta la franchigia per le spese mediche nel 730?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La franchigia per le spese mediche e sanitarie è fissata a 129,11 €. La detrazione IRPEF del 19% si applica solo sulla parte di spesa che supera questa soglia."
        }
      },
      {
        "@type": "Question",
        "name": "Quali documenti servono per detrarre i farmaci?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Per detrarre l'acquisto di farmaci è necessario lo 'scontrino parlante', che deve riportare la natura ('farmaco' o 'medicinale'), la quantità, il nome del prodotto e il codice fiscale del destinatario."
        }
      },
      {
        "@type": "Question",
        "name": "Posso detrarre le spese mediche pagate in contanti?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, come regola generale dal 2020 le spese mediche devono essere pagate con metodi tracciabili (es. carte, bonifici) per essere detratte. Fanno eccezione solo l'acquisto di medicinali, dispositivi medici e le prestazioni rese da strutture sanitarie pubbliche o private accreditate."
        }
      },
      {
        "@type": "Question",
        "name": "Le spese per il dentista sono detraibili?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sì, le spese odontoiatriche sono pienamente detraibili al 19%, sempre al netto della franchigia di 129,11 €. Rientrano tra le spese specialistiche e devono essere documentate da fattura."
        }
      }
    ]
  }
};

// --- Componenti UI ausiliari ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div>
  </div>
);

// --- Componente per l'iniezione dinamica dei dati strutturati ---
const SchemaInjector = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
        {blocks.map((block, index) => {
            const trimmedBlock = block.trim();
            if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
            if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
            if (trimmedBlock.startsWith('*')) {
                const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
            }
            if (trimmedBlock.match(/^\d\.\s/)) {
                const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
            }
            if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
            return null;
        })}
        </div>
    );
};

// --- [NUOVO] Componente specifico per il Grafico ---
const ExpensesPieChart = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
        </ResponsiveContainer>
    );
};

// --- [MODIFICATO] Caricamento dinamico del solo componente grafico ---
const DynamicExpensesChart = dynamic(() => Promise.resolve(ExpensesPieChart), {
    ssr: false,
    loading: () => <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg"><p className="text-sm text-gray-500">Caricamento grafico...</p></div>
});


// --- Componente Principale del Calcolatore ---
const DetrazioneSpeseSanitarie730: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        spese_mediche_ordinarie: 2500,
        spese_per_disabili: 800,
        spese_rimborsate: 300,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);
    
    const calculatedOutputs = useMemo(() => {
        const { spese_mediche_ordinarie, spese_per_disabili, spese_rimborsate } = states;
        const FRANCHIGIA = 129.11;
        
        const spese_ordinarie_nette = Math.max(0, spese_mediche_ordinarie - spese_rimborsate);
        const base_calcolo_ordinaria = Math.max(0, spese_ordinarie_nette - FRANCHIGIA);
        const spesa_detraibile = base_calcolo_ordinaria + spese_per_disabili;
        const detrazione_irpef = spesa_detraibile * 0.19;
        const spesa_totale_sostenuta = spese_mediche_ordinarie + spese_per_disabili;
        const costo_netto_effettivo = spesa_totale_sostenuta - detrazione_irpef;

        return { detrazione_irpef, spesa_detraibile, costo_netto_effettivo, spesa_totale_sostenuta, FRANCHIGIA };
    }, [states]);
    
    const chartData = [
      { name: 'Risparmio Fiscale (Detrazione)', value: calculatedOutputs.detrazione_irpef > 0 ? calculatedOutputs.detrazione_irpef : 0, color: '#4ade80' },
      { name: 'Costo Netto a Tuo Carico', value: calculatedOutputs.costo_netto_effettivo > 0 ? calculatedOutputs.costo_netto_effettivo : 0, color: '#60a5fa' },
      { name: 'Spesa non detraibile (Franchigia e Rimborsi)', value: Math.min(states.spese_mediche_ordinarie, calculatedOutputs.FRANCHIGIA) + states.spese_rimborsate, color: '#f87171' },
    ];

    const formulaUsata = `Detrazione = (MAX(0, Spese Ordinarie - Spese Rimborsate - 129.11€) + Spese Disabili) * 19%`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = (await import('jspdf'));
            if (!calculatorRef.current) return;
            
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', compress: true });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) {
            alert("Errore durante l'esportazione in PDF.");
            console.error(e);
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const { spesa_totale_sostenuta, FRANCHIGIA, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, timestamp: new Date().toISOString() };
            const existingResults = JSON.parse(localStorage.getItem("saved_calcs") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 10);
            localStorage.setItem("saved_calcs", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch {
            alert("Impossibile salvare il risultato.");
        }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <main className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Calcola il risparmio fiscale IRPEF del 19% sulle tue spese sanitarie, al netto della franchigia.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo. I calcoli non hanno valore legale e non sostituiscono una consulenza professionale.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => (
                                <div key={input.id} className={inputs.length % 2 !== 0 && inputs.indexOf(input) === 0 ? "md:col-span-2" : ""}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">€</span></div>
                                        <input
                                            id={input.id} aria-label={input.label}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-7 pr-3 py-2"
                                            type="number" min={input.min} step={input.step}
                                            value={states[input.id]}
                                            onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'detrazione_irpef' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'detrazione_irpef' ? 'text-green-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                         
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione della Spesa Totale</h3>
                             <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && <DynamicExpensesChart data={chartData} />}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata (E-E-A-T)</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </main>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita (E-E-A-T)</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti (E-E-A-T)</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/aree-tematiche/imposte/irpef/le-spese-sanitarie" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Guida alle Spese Sanitarie - Agenzia delle Entrate</a></li>
                            <li><a href="https://www.gazzettaufficiale.it/eli/id/1986/09/29/086G0413/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Art. 15, c. 1, lett. c), TUIR (DPR 917/86)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default DetrazioneSpeseSanitarie730;