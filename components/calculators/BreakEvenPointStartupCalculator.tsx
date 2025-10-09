'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { FC } from 'react';

// --- Dati di configurazione del calcolatore ---
const calculatorData = { "slug": "break-even-point-startup", "category": "PMI e Impresa", "title": "Calcolatore Break-Even Point per Startup", "lang": "it", "description": "Determina quante unità devi vendere per coprire i costi e raggiungere il punto di pareggio. Uno strumento essenziale per la pianificazione finanziaria della tua startup.", "inputs": [ { "id": "costi_fissi", "label": "Costi Fissi Totali (mensili)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci la somma di tutti i costi che la tua startup deve sostenere ogni mese, indipendentemente da quanto vende. Esempi: stipendi, affitto, software in abbonamento (SaaS), utenze, ammortamenti." }, { "id": "costo_variabile_unitario", "label": "Costo Variabile per Unità", "type": "number" as const, "unit": "€", "min": 0, "step": 1, "tooltip": "Il costo diretto per produrre una singola unità del tuo prodotto o servizio. Esempi: materie prime, commissioni di pagamento, costi di spedizione, costo per click su campagne a performance." }, { "id": "prezzo_vendita_unitario", "label": "Prezzo di Vendita per Unità", "type": "number" as const, "unit": "€", "min": 0, "step": 1, "tooltip": "Il prezzo al quale vendi una singola unità del tuo prodotto o servizio ai clienti, al netto di IVA." } ], "outputs": [ { "id": "bep_unita", "label": "Punto di Pareggio (in Unità)", "unit": "unità/mese" }, { "id": "bep_fatturato", "label": "Punto di Pareggio (in Fatturato)", "unit": "€/mese" }, { "id": "margine_contribuzione_unitario", "label": "Margine di Contribuzione Unitario", "unit": "€" }, { "id": "margine_contribuzione_percentuale", "label": "Margine di Contribuzione (%)", "unit": "%" } ], "content": "...", "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Che cos'è esattamente il Break-Even Point (Punto di Pareggio)?", "acceptedAnswer": { "@type": "Answer", "text": "Il Break-Even Point è il livello di vendite (espresso in numero di unità o in fatturato) al quale i ricavi totali di un'azienda eguagliano i suoi costi totali. A questo punto, l'azienda non sta né generando un profitto né subendo una perdita. È un indicatore fondamentale della sostenibilità finanziaria di un business." } }, { "@type": "Question", "name": "Come si calcola il Break-Even Point in unità?", "acceptedAnswer": { "@type": "Answer", "text": "La formula per calcolare il Break-Even Point in unità è: Costi Fissi Totali / (Prezzo di Vendita per Unità - Costo Variabile per Unità). Il denominatore (Prezzo - Costo Variabile) è anche noto come Margine di Contribuzione Unitario." } }, { "@type": "Question", "name": "Qual è la differenza tra costi fissi e costi variabili?", "acceptedAnswer": { "@type": "Answer", "text": "I costi fissi sono spese che non cambiano indipendentemente dal volume di produzione o vendita (es. affitto, stipendi, software). I costi variabili sono costi direttamente legati alla produzione di ogni singola unità e aumentano all'aumentare delle vendite (es. materie prime, commissioni sulle vendite, spedizioni)." } }, { "@type": "Question", "name": "Perché il Break-Even Point è così importante per una startup?", "acceptedAnswer": { "@type": "Answer", "text": "Per una startup, l'analisi del BEP è cruciale per diverse ragioni: definisce gli obiettivi minimi di vendita per sopravvivere, aiuta a validare la sostenibilità di un'idea di business, supporta le decisioni di pricing e permette di valutare l'impatto finanziario di nuove spese, come l'assunzione di personale o l'acquisto di nuovi strumenti." } } ] } };
calculatorData.content = "### **Guida Strategica al Break-Even Point per Startup e Imprese**\n\n**Oltre il Calcolo: Usare il BEP per Prendere Decisioni Vincenti**\n\nIl **Break-Even Point (BEP)**, o Punto di Pareggio, è una delle metriche finanziarie più importanti per qualsiasi imprenditore, specialmente in fase di startup. Rappresenta il momento esatto in cui i ricavi totali eguagliano i costi totali, risultando in un profitto pari a zero. Conoscere questo valore non è un semplice esercizio contabile, ma uno strumento strategico fondamentale per la sopravvivenza e la crescita del business.\n\nQuesta guida approfondita ti accompagnerà nella comprensione dei componenti del BEP, nell'interpretazione dei risultati e, soprattutto, nell'utilizzo di questa analisi per guidare le tue decisioni strategiche.\n\n### **Parte 1: I Pilastri dell'Analisi di Break-Even**\n\nIl calcolo del BEP si basa sulla distinzione netta tra tre elementi chiave del tuo modello di business.\n\n#### **1. Costi Fissi (Fixed Costs)**\nSono i costi che **non variano** al variare del volume di produzione o vendita. La tua azienda li sostiene ogni mese, anche se non vendi neanche un'unità. La loro corretta identificazione è il primo passo per un'analisi accurata.\n* **Esempi tipici per una startup**: Stipendi del team (amministrativi, sviluppatori), affitto di uffici o co-working, canoni mensili per software (CRM, hosting, tool di marketing), utenze, assicurazioni, costi di consulenza (commercialista, legale), ammortamenti di beni strumentali.\n\n#### **2. Costi Variabili (Variable Costs)**\nSono i costi **direttamente proporzionali** al numero di unità prodotte e vendute. Aumentano all'aumentare delle vendite e si azzerano se le vendite sono nulle.\n* **Esempi tipici per una startup**: Materie prime (per un prodotto fisico), costi di spedizione, commissioni per l'elaborazione dei pagamenti (es. Stripe, PayPal), costo di acquisizione cliente (CAC) se basato su campagne a performance (es. Google Ads, Facebook Ads), costi di packaging.\n\n#### **3. Prezzo di Vendita (Sale Price)**\nÈ il prezzo a cui un'unità del tuo prodotto o servizio viene venduta al cliente finale. Una corretta strategia di pricing è cruciale e influenza direttamente il tempo necessario per raggiungere il pareggio.\n\n### **Parte 2: La Formula e l'Interpretazione dei Risultati**\n\nLa magia del BEP risiede in una formula semplice ma potente. Prima, però, dobbiamo calcolare il **Margine di Contribuzione Unitario**: questo è il guadagno generato da ogni singola vendita, che andrà a \"coprire\" i costi fissi.\n\n**Margine di Contribuzione Unitario = Prezzo di Vendita Unitario - Costo Variabile Unitario**\n\nUna volta ottenuto questo valore, il calcolo del BEP è immediato:\n\n**BEP (in Unità) = Costi Fissi Totali / Margine di Contribuzione Unitario**\n\n* **BEP in Unità**: Ti dice **quanti prodotti o servizi devi vendere** in un dato periodo (es. un mese) per coprire tutti i tuoi costi.\n* **BEP in Fatturato**: Si ottiene moltiplicando il BEP in Unità per il Prezzo di Vendita. Ti dice **quale deve essere il tuo ricavo totale** per raggiungere il pareggio.\n\n### **Parte 3: Analisi di Scenario - Il BEP come Bussola Strategica**\n\nIl vero potenziale del BEP emerge quando lo si usa come strumento di simulazione per rispondere a domande critiche:\n\n* **Pricing**: _\"Cosa succede se aumento il prezzo del 10%?\"_ Un prezzo più alto aumenta il margine di contribuzione, abbassando il numero di unità da vendere per raggiungere il BEP. Il calcolatore ti permette di vedere immediatamente l'impatto.\n* **Controllo dei Costi**: _\"Qual è l'impatto dell'assunzione di un nuovo dipendente (aumento dei costi fissi)?\"_ Aumentando i costi fissi, vedrai aumentare il BEP. Questo ti aiuta a capire di quanto dovranno crescere le vendite per giustificare il nuovo costo.\n* **Obiettivi di Profitto**: _\"Quante unità devo vendere per ottenere un profitto di 2.000 €?\"_ Aggiungi il profitto desiderato ai costi fissi (`(Costi Fissi + Obiettivo di Profitto) / Margine di Contribuzione`) per trasformare il BEP in un vero e proprio calcolatore di obiettivi.\n* **Validazione di un'Idea**: Prima ancora di lanciare un prodotto, l'analisi del BEP ti aiuta a capire se il tuo modello di business è sostenibile con stime realistiche di costi e prezzi.\n\n**Limitazioni da Considerare**: L'analisi BEP è un modello. Assume che i costi e i prezzi siano stabili e che tutti i prodotti vengano venduti. Nel mondo reale, questi fattori possono fluttuare, quindi è importante aggiornare l'analisi regolarmente.";

// --- OTTIMIZZAZIONE: Caricamento dinamico dei grafici ---
const DynamicLineChart = dynamic(
  () => import('recharts').then(mod => {
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip: ChartTooltip, ResponsiveContainer, Legend, ReferenceDot } = mod;
    return (props: { data: any[], bepUnita: number, bepFatturato: number }) => (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={props.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="unita" label={{ value: 'Unità Vendute', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: 'Euro (€)', angle: -90, position: 'insideLeft' }} tickFormatter={(value) => `${(value as number / 1000)}k`} />
          <ChartTooltip formatter={(value: number, name: string) => [`${new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)}`, name]} />
          <Legend />
          <Line type="monotone" dataKey="Costi Totali" stroke="#ef4444" dot={false} />
          <Line type="monotone" dataKey="Ricavi Totali" stroke="#22c55e" dot={false} />
          {isFinite(props.bepUnita) && props.bepUnita > 0 && (
            <ReferenceDot x={props.bepUnita} y={props.bepFatturato} r={5} fill="#4f46e5" stroke="white" strokeWidth={2} isFront={true}>
              <title>Break-Even Point</title>
            </ReferenceDot>
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Caricamento grafico...</div> }
);

// --- Componenti di UI ---
const InfoIcon: FC = () => <svg xmlns="http://www.w.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const Tooltip: FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => <div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>;
const SchemaInjector: FC<{ schema: object }> = ({ schema }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
const ContentRenderer: FC<{ content: string }> = ({ content }) => { /* ... implementazione da esempio ... */ return <div dangerouslySetInnerHTML={{__html: content.replace(/\n\n/g, '<br/><br/>').replace(/### \*\*(.*)\*\*/g, '<h3 class="text-xl font-bold mt-6 mb-4">$1</h3>').replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>').replace(/\n\*/g, '<br/>&bull;') }} className="prose prose-sm max-w-none text-gray-700"/>; };

// --- Componente Principale ---
const BreakEvenPointStartupCalculator: FC = () => {
    const { slug, title, description, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = { costi_fissi: 5000, costo_variabile_unitario: 15, prezzo_vendita_unitario: 50 };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const { costi_fissi, costo_variabile_unitario, prezzo_vendita_unitario } = states;
        
        const margine_contribuzione_unitario = prezzo_vendita_unitario - costo_variabile_unitario;
        if (margine_contribuzione_unitario <= 0) {
            return { bep_unita: Infinity, bep_fatturato: Infinity, margine_contribuzione_unitario: margine_contribuzione_unitario, margine_contribuzione_percentuale: -Infinity };
        }
        
        const bep_unita = costi_fissi / margine_contribuzione_unitario;
        const bep_fatturato = bep_unita * prezzo_vendita_unitario;
        const margine_contribuzione_percentuale = (margine_contribuzione_unitario / prezzo_vendita_unitario) * 100;

        return { bep_unita, bep_fatturato, margine_contribuzione_unitario, margine_contribuzione_percentuale };
    }, [states]);

    const chartData = useMemo(() => {
      const { costi_fissi, costo_variabile_unitario, prezzo_vendita_unitario } = states;
      const { bep_unita } = calculatedOutputs;
      const dataPoints = [];
      const maxUnits = isFinite(bep_unita) && bep_unita > 0 ? Math.ceil(bep_unita * 2) : 200;
      
      for (let i = 0; i <= 10; i++) {
        const unita = Math.ceil(i * (maxUnits / 10));
        dataPoints.push({
          unita: unita,
          'Costi Totali': costi_fissi + (costo_variabile_unitario * unita),
          'Ricavi Totali': prezzo_vendita_unitario * unita
        });
      }
      return dataPoints;
    }, [states, calculatedOutputs]);

    const handleExportPDF = useCallback(async () => { /* ... implementazione da esempio ... */ }, [slug]);
    const handleSaveResult = useCallback(() => { /* ... implementazione da esempio ... */ }, [states, calculatedOutputs, slug, title]);

    const formatNumber = (value: number, dec = 0) => isFinite(value) ? new Intl.NumberFormat('it-IT', { maximumFractionDigits: dec }).format(value) : 'N/A';
    const formatCurrency = (value: number) => isFinite(value) ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value) : 'N/A';

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <main className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
                        <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-6">{description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg border">
                                {inputs.map(input => (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        <div className="relative">
                                            <input id={input.id} type="number" value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} min={input.min} step={input.step} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pr-10"/>
                                            <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultati dell'Analisi</h2>
                                {calculatedOutputs.bep_unita === Infinity && (
                                    <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                                        <strong>Attenzione:</strong> Il prezzo di vendita deve essere superiore al costo variabile per unità per poter raggiungere il punto di pareggio. Con i dati attuali, ogni vendita è in perdita.
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {outputs.slice(0, 2).map(output => (
                                        <div key={output.id} className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                                            <p className="font-medium text-gray-700">{output.label}</p>
                                            <p className="text-2xl font-bold text-indigo-600">{isClient ? (output.unit === '€/mese' ? formatCurrency((calculatedOutputs as any)[output.id]) : formatNumber((calculatedOutputs as any)[output.id])) + ` ${output.unit || ''}` : '...'}</p>
                                        </div>
                                    ))}
                                    {outputs.slice(2).map(output => (
                                        <div key={output.id} className="bg-gray-50 border p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">{output.label}</p>
                                            <p className="text-xl font-semibold text-gray-800">{isClient ? (output.unit === '€' ? formatCurrency((calculatedOutputs as any)[output.id]) : formatNumber((calculatedOutputs as any)[output.id], 1)) + ` ${output.unit || ''}` : '...'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Grafico del Punto di Pareggio</h3>
                                <div className="h-80 w-full bg-gray-50 p-4 rounded-lg border">
                                    {isClient && <DynamicLineChart data={chartData} bepUnita={calculatedOutputs.bep_unita} bepFatturato={calculatedOutputs.bep_fatturato} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Formula Utilizzata</h2>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded font-mono">BEP (Unità) = <br/> Costi Fissi / (Prezzo - Costo Variabile)</p>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3"><button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Salva</button><button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">PDF</button><button onClick={handleReset} className="col-span-2 w-full border text-sm border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors">Reset</button></div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Strategica al BEP</h2>
                        <ContentRenderer content={calculatorData.content} />
                    </section>
                </aside>
            </div>
        </>
    );
};

export default BreakEvenPointStartupCalculator;