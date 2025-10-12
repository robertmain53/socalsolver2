'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import dynamic from 'next/dynamic';

// --- OTTIMIZZAZIONE PERFORMANCE: Lazy Loading dei Grafici ---
const DynamicBarChart = dynamic(() => Promise.resolve(BarChart), { ssr: false, loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-lg"><p>Caricamento grafico...</p></div> });

// --- DATI SELF-CONTAINED ---
const calculatorData = {
  "slug": "costo-patente-a-b-c",
  "category": "Auto e Trasporti",
  "title": "Calcolatore Costo Patente (A, B, C)",
  "lang": "it",
  "inputs": [
    { "id": "tipo_patente", "label": "Tipo di Patente", "type": "select" as const, "options": ["Patente B", "Patente A", "Patente C"], "tooltip": "Seleziona la categoria di patente che desideri conseguire. I costi variano notevolmente tra auto (B), moto (A) e mezzi pesanti (C)." },
    { "id": "percorso", "label": "Percorso Scelto", "type": "select" as const, "options": ["Autoscuola", "Privatista"], "tooltip": "Scegliere 'Autoscuola' per un pacchetto completo. 'Privatista' per risparmiare sulla teoria, ma richiede organizzazione autonoma." },
    { "id": "regione", "label": "Area Geografica", "type": "select" as const, "options": ["Nord Italia", "Centro Italia", "Sud Italia e Isole"], "tooltip": "I prezzi delle scuole guida possono variare in base alla regione. Seleziona l'area più vicina a te per una stima più accurata." },
    { "id": "numero_guide", "label": "Numero di Lezioni di Guida", "type": "number" as const, "unit": "ore", "min": 6, "step": 1, "tooltip": "Per la Patente B sono obbligatorie per legge 6 ore di guida certificate. Inserisci il numero totale di ore che prevedi di fare." },
    { "id": "costo_certificato_medico", "label": "Costo Certificato Medico", "type": "number" as const, "unit": "€", "min": 30, "step": 5, "tooltip": "Include la visita medica presso un ufficiale sanitario e il certificato anamnestico del medico di base. Il costo può variare." },
    { "id": "ripetere_esame_teoria", "label": "Prevedi di ripetere l'esame di teoria?", "type": "boolean" as const, "tooltip": "In caso di bocciatura all'esame di teoria, dovrai pagare nuovamente i bollettini per iscriverti una seconda volta." }
  ],
  "outputs": [
    { "id": "costo_burocrazia", "label": "Costi Fissi (Burocrazia e Visite)", "unit": "€" },
    { "id": "costo_formazione", "label": "Costi di Formazione (Teoria e Guide)", "unit": "€" },
    { "id": "costo_esami", "label": "Costi Esami (Presentazione e Pratica)", "unit": "€" },
    { "id": "costo_totale", "label": "Stima Costo Totale", "unit": "€" }
  ],
  "content": "### **Guida Definitiva al Costo della Patente nel 2025**\n\nOttenere la patente di guida è un traguardo importante, ma i costi possono essere significativi e poco trasparenti. Questo strumento è progettato per offrirti una stima dettagliata e realistica delle spese da affrontare, analizzando ogni singola voce di costo.\n\n### **Parte 1: La Suddivisione dei Costi**\n\nIl costo totale della patente non è una cifra singola, ma la somma di tre macro-categorie di spesa:\n\n1.  **Costi Fissi (Burocrazia e Visite Mediche)**: Questa è la base di partenza, inevitabile per chiunque. Include:\n    * **Bollettini Postali**: Versamenti obbligatori per il Ministero dei Trasporti (~58-74€).\n    * **Certificato Anamnestico**: Rilasciato dal medico di base, attesta la tua idoneità psicofisica di base (costo variabile, ~30-50€).\n    * **Visita Medica Oculistica**: Eseguita da un medico autorizzato (ASL, ACI, etc.), ha un costo che varia dai 30€ ai 60€.\n\n2.  **Costi di Formazione (Teoria e Pratica)**: Qui si trova la maggiore variabilità, legata alla scelta tra Autoscuola e Privatista.\n    * **Corso di Teoria (solo Autoscuola)**: Il costo dell'iscrizione (dai 200€ ai 600€) copre le lezioni in aula, il materiale didattico e il supporto amministrativo.\n    * **Lezioni di Guida**: La spesa più impattante. **Sono obbligatorie 6 ore di guida certificate per la Patente B**, anche per i privatisti. Il costo orario varia geograficamente (da 45€ a 65€). Il numero totale di guide necessarie è soggettivo.\n\n3.  **Costi degli Esami**: Riguardano la presentazione alle prove.\n    * **Esame di Teoria**: Solitamente incluso nel pacchetto dell'autoscuola. I privatisti pagano solo i bollettini.\n    * **Esame di Pratica**: L'autoscuola addebita un costo per la presentazione del candidato e l'utilizzo del veicolo (dai 100€ ai 150€).\n\n### **Parte 2: Autoscuola vs. Privatista: Analisi Comparativa**\n\n#### **Percorso in Autoscuola**\n\n* **Pro**: Offre un pacchetto 'chiavi in mano', gestendo tutta la burocrazia, la preparazione teorica e pratica. Ideale per chi ha poco tempo o preferisce un percorso guidato.\n* **Contro**: È la soluzione più costosa. I prezzi dei pacchetti completi per la Patente B variano **da 800€ a oltre 1.300€**.\n\n#### **Percorso da Privatista**\n\n* **Pro**: Permette un risparmio significativo, eliminando il costo del corso di teoria e dell'iscrizione. Il risparmio può arrivare a 300-400€.\n* **Contro**: Richiede maggiore impegno personale per lo studio della teoria e la gestione delle pratiche burocratiche. **Attenzione**: le 6 ore di guida obbligatorie devono comunque essere svolte presso un'autoscuola, così come l'esame di pratica.\n\n### **Parte 3: Costi Specifici per Tipo di Patente**\n\n#### **Costo Patente A (A1, A2, A)**\n\nIl costo è generalmente inferiore a quello della Patente B, specialmente se si possiede già quest'ultima (evitando l'esame di teoria). I costi si aggirano **tra i 400€ e i 900€**, a seconda del numero di guide necessarie.\n\n#### **Costo Patente C**\n\nQuesta è una patente professionale e i costi sono notevolmente più alti. Il solo conseguimento della Patente C può costare **tra i 1.500€ e i 2.500€**. A questo va spesso aggiunto il costo della **CQC (Carta di Qualificazione del Conducente)**, un'abilitazione obbligatoria per il trasporto professionale, che può costare ulteriori 800-1.500€.\n\n### **Consigli per Risparmiare**\n\n1.  **Valuta il Percorso da Privatista**: Se sei disciplinato e hai tempo, è il modo più efficace per tagliare i costi.\n2.  **Confronta più Autoscuole**: Non fermarti alla prima. Chiedi preventivi dettagliati e confronta cosa è incluso nel prezzo.\n3.  **Offerte e Pacchetti**: Alcune scuole guida offrono pacchetti 'tutto incluso' o sconti per studenti. Informati sulle promozioni attive.\n4.  **Esercitati con App Gratuite**: Per la preparazione teorica, sfrutta le numerose app di simulazione dei quiz ministeriali.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Quanto costa prendere la patente B nel 2025?", "acceptedAnswer": { "@type": "Answer", "text": "Il costo per la Patente B in autoscuola varia tipicamente da 800€ a 1.300€. Da privatista, la spesa si riduce, attestandosi tra i 500€ e i 900€. I fattori principali che influenzano il prezzo sono l'area geografica e il numero di lezioni di guida necessarie oltre le 6 obbligatorie." } }, { "@type": "Question", "name": "È davvero più economico fare la patente da privatista?", "acceptedAnswer": { "@type": "Answer", "text": "Sì, il percorso da privatista permette di risparmiare circa 300-400€ eliminando i costi del corso di teoria e dell'iscrizione in autoscuola. Tuttavia, richiede la gestione autonoma della burocrazia e lo studio individuale. Le 6 ore di guida certificate e l'esame di pratica devono comunque essere sostenuti tramite un'autoscuola." } }, { "@type": "Question", "name": "Cosa succede se vengo bocciato all'esame di guida?", "acceptedAnswer": { "@type": "Answer", "text": "In caso di bocciatura all'esame di pratica, è necessario attendere almeno un mese per poterlo ripetere. Questo comporta costi aggiuntivi: dovrai pagare nuovamente la tassa di presentazione all'esame all'autoscuola (circa 100-150€) e, molto probabilmente, acquistare ulteriori lezioni di guida per correggere gli errori." } }, { "@type": "Question", "name": "Quante guide sono obbligatorie per la patente B?", "acceptedAnswer": { "@type": "Answer", "text": "La legge impone un minimo di 6 ore di lezioni di guida certificate con un istruttore abilitato. Queste includono guida notturna e su autostrada/strade extraurbane. Tuttavia, la media nazionale per essere ben preparati all'esame si attesta intorno alle 10-12 ore totali." } } ] }
};

// --- Componenti di Utilità ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);

// --- OTTIMIZZAZIONE SEO: Dati Strutturati Dinamici ---
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);

// --- Componente per Rendering del Contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
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

// --- Componente Principale del Calcolatore ---
const CostoPatenteABCCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        tipo_patente: "Patente B",
        percorso: "Autoscuola",
        regione: "Centro Italia",
        numero_guide: 10,
        costo_certificato_medico: 80,
        ripetere_esame_teoria: false
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { tipo_patente, percorso, regione, numero_guide, costo_certificato_medico, ripetere_esame_teoria } = states;

        const moltiplicatore_regionale = regione === 'Nord Italia' ? 1.15 : (regione === 'Sud Italia e Isole' ? 0.9 : 1.0);
        const costi_base = tipo_patente === 'Patente C' ? { iscrizione: 300, teoria: 600, guida: 80, esame: 200 } : (tipo_patente === 'Patente A' ? { iscrizione: 150, teoria: 200, guida: 40, esame: 100 } : { iscrizione: 200, teoria: 250, guida: 55, esame: 120 });
        const costo_bollettini = 58.40 + (ripetere_esame_teoria ? 58.40 : 0);
        const costo_burocrazia = costo_bollettini + Number(costo_certificato_medico);
        const costo_formazione_scuola = percorso === 'Autoscuola' ? ((costi_base.iscrizione + costi_base.teoria) * moltiplicatore_regionale) : 0;
        const costo_ora_guida = costi_base.guida * moltiplicatore_regionale;
        const costo_guide_totale = Number(numero_guide) * costo_ora_guida;
        const costo_formazione = costo_formazione_scuola + costo_guide_totale;
        const costo_esami = costi_base.esame * moltiplicatore_regionale;
        const costo_totale = costo_burocrazia + costo_formazione + costo_esami;

        return { costo_burocrazia, costo_formazione, costo_esami, costo_totale };
    }, [states]);

    const chartData = [
      { name: 'Burocrazia', value: calculatedOutputs.costo_burocrazia, fill: '#818cf8' },
      { name: 'Formazione', value: calculatedOutputs.costo_formazione, fill: '#6366f1' },
      { name: 'Esami', value: calculatedOutputs.costo_esami, fill: '#4f46e5' },
    ];
    
    const formulaTrasparente = `Costo Totale = (Bollettini + Visite Mediche) + (Iscrizione Scuola Guida + Costo Guide) + Costo Esami`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2, backgroundColor: null });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) { 
            console.error("Errore esportazione PDF:", e);
            alert("Impossibile generare il PDF in questo ambiente."); 
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, timestamp: new Date().toISOString() };
            const existingResults = JSON.parse(localStorage.getItem("calculator_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 10);
            localStorage.setItem("calculator_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Errore nel salvataggio del risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Una stima completa e trasparente dei costi da sostenere per ottenere la patente di guida in Italia.</p>
                        
                        <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima basata su medie nazionali e regionali. I prezzi finali possono variare a seconda della singola scuola guida.
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inputs.map(input => (
                                <div key={input.id} className={input.type === 'boolean' ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                    {input.type === 'select' && (
                                        <select id={input.id} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                            {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )}
                                    {input.type === 'number' && (
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    )}
                                    {input.type === 'boolean' && (
                                        <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50 border">
                                            <input id={input.id} type="checkbox" checked={states[input.id]} onChange={e => handleStateChange(input.id, e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-sm font-medium text-gray-700">{input.label}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className=" -lg -md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Stima</h2>
                        <div className="space-y-4">
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'costo_totale' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'costo_totale' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione dei Costi</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <DynamicBarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(238, 242, 255, 0.5)'}} />
                                            <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                                               {chartData.map(entry => <Cell key={`cell-${entry.name}`} fill={entry.fill} />)}
                                            </Bar>
                                        </DynamicBarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-center border border-transparent rounded-md px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                      <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                      <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaTrasparente}</p>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.mit.gov.it/documentazione/patente-di-guida" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ministero delle Infrastrutture e dei Trasporti</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1992-04-30;285" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice della Strada (D.Lgs. 285/1992)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CostoPatenteABCCalculator;