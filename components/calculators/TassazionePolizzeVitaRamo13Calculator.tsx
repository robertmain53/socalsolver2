'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// --- TIPI ---
type CalculatorData = typeof calculatorData;
type Inputs = { [key: string]: any };

// --- DATI DI CONFIGURAZIONE DEL CALCOLATORE (Self-Contained) ---
const calculatorData = {
  "slug": "tassazione-polizze-vita-ramo-1-3",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Tassazione Polizze Vita Ramo I e Ramo III",
  "lang": "it",
  "inputs": [
    {
      "id": "capitale_liquidato",
      "label": "Capitale Lordo Liquidato/Riscattato",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 1000,
      "tooltip": "Inserisci l'importo totale che hai ricevuto dalla compagnia assicurativa prima dell'applicazione di qualsiasi imposta."
    },
    {
      "id": "premi_versati",
      "label": "Totale Premi Versati",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 1000,
      "tooltip": "Inserisci la somma di tutti i premi che hai pagato nel corso della durata della polizza."
    },
    {
      "id": "data_sottoscrizione",
      "label": "Data di Sottoscrizione della Polizza",
      "type": "date" as const,
      "tooltip": "La data di inizio del contratto. È fondamentale per calcolare la tassazione corretta in base ai diversi regimi fiscali."
    },
    {
      "id": "data_riscatto",
      "label": "Data di Liquidazione/Riscatto",
      "type": "date" as const,
      "tooltip": "La data in cui il capitale è stato liquidato. Determina la fine del periodo di maturazione della plusvalenza."
    },
    {
      "id": "quota_gov_bonds",
      "label": "Quota Rendimento da Titoli di Stato",
      "type": "number" as const,
      "unit": "%",
      "min": 0,
      "max": 100,
      "step": 1,
      "tooltip": "Per polizze Ramo I (Gestioni Separate), indica la percentuale del rendimento derivante da titoli di stato (es. BTP) che beneficiano di una tassazione agevolata al 12.5%. Lascia 0 per polizze Ramo III pure."
    }
  ],
  "outputs": [
    { "id": "plusvalenza_lorda", "label": "Plusvalenza Lorda (Capital Gain)", "unit": "€" },
    { "id": "imposta_sostitutiva_totale", "label": "Imposta Sostitutiva Totale Dovuta", "unit": "€" },
    { "id": "capitale_netto_liquidato", "label": "Capitale Netto Liquidato", "unit": "€" },
    { "id": "aliquota_effettiva", "label": "Aliquota Fiscale Effettiva", "unit": "%" }
  ],
  "content": "### **Guida Completa alla Tassazione delle Polizze Vita (Ramo I e Ramo III)**\n\n**Analisi del Calcolo, Differenze tra Rami e Vantaggi Fiscali**\n\nLa tassazione dei capitali derivanti dalle polizze vita è un argomento centrale per ogni risparmiatore e investitore. Comprendere il meccanismo di calcolo non solo aiuta a prevedere il rendimento netto, ma permette anche di apprezzare le differenze strategiche tra i vari prodotti, come le polizze di Ramo I (Gestioni Separate) e Ramo III (Unit-Linked).\n\nQuesto strumento è progettato per offrire una stima precisa dell'imposta sostitutiva dovuta al momento della liquidazione o del riscatto di una polizza. Di seguito, approfondiremo la logica sottostante, i riferimenti normativi e gli aspetti chiave per una gestione consapevole dei propri investimenti assicurativi.\n\n### **Parte 1: Come Funziona il Calcolo della Tassazione**\n\nIl principio fondamentale è che **viene tassato solo il rendimento finanziario**, ovvero la plusvalenza (o *capital gain*). Questa è la differenza tra il capitale liquidato dalla compagnia e il totale dei premi versati dall'assicurato. Se non c'è rendimento (plusvalenza pari o inferiore a zero), non ci sono imposte da pagare.\n\n`Plusvalenza Lorda = Capitale Liquidato - Totale Premi Versati`\n\nL'imposta dovuta, definita \"imposta sostitutiva\", non è una percentuale fissa ma viene calcolata con un criterio *pro rata temporis*, basato sull'evoluzione delle aliquote fiscali nel tempo.\n\n#### **Le Tre Ere Fiscali del Capital Gain**\n\nL'attuale sistema di tassazione è il risultato di tre periodi normativi distinti. La plusvalenza maturata viene idealmente suddivisa in base alla sua maturazione in questi periodi, e a ciascuna porzione viene applicata la rispettiva aliquota:\n\n1.  **Fino al 31/12/2011:** I rendimenti maturati in questo periodo sono tassati con un'aliquota del **12,50%**.\n2.  **Dal 01/01/2012 al 30/06/2014:** L'aliquota per i rendimenti di questo intervallo è stata elevata al **20%**.\n3.  **Dal 01/07/2014 ad oggi:** I rendimenti maturati in questo periodo sono soggetti all'aliquota attuale del **26%**.\n\nIl calcolatore determina la durata totale in giorni della polizza e calcola la percentuale di giorni che ricade in ciascuno di questi tre scaglioni temporali. La plusvalenza totale viene quindi ripartita proporzionalmente e tassata di conseguenza, generando un'**aliquota effettiva** finale.\n\n### **Parte 2: Il Vantaggio Fiscale delle Polizze Ramo I**\n\nUna delle differenze più significative tra Ramo I e Ramo III emerge proprio nella tassazione. Le polizze di **Ramo I (Gestioni Separate)** investono prevalentemente in strumenti obbligazionari a basso rischio, tra cui Titoli di Stato (come BTP, CCT) e obbligazioni sovranazionali equiparate (es. BEI, BIRS).\n\nPer incentivare l'investimento in debito pubblico, lo Stato ha mantenuto un'**aliquota fiscale di favore del 12,50%** sulla parte di rendimento generata da questi specifici titoli.\n\n**Come funziona?**\nLa compagnia assicurativa certifica annualmente la composizione del rendimento della Gestione Separata. Se, ad esempio, il 40% del rendimento deriva da Titoli di Stato, quella porzione della plusvalenza beneficerà dell'aliquota agevolata del 12,50%, mentre il restante 60% sarà tassato secondo il criterio *pro rata temporis* visto prima. Questo meccanismo riduce l'aliquota fiscale effettiva e aumenta il capitale netto per l'investitore.\n\nLe polizze di **Ramo III (Unit-Linked)**, investendo in fondi comuni (azioni, obbligazioni corporate, etc.), non beneficiano di questa agevolazione e la loro plusvalenza è interamente soggetta al calcolo *pro rata temporis* con le aliquote standard (12.5%, 20%, 26%).\n\n### **Parte 3: Altri Aspetti Fiscali da Conoscere**\n\n#### **Imposta di Bollo**\n\nOltre all'imposta sul capital gain, i prodotti finanziari-assicurativi sono soggetti a un'**imposta di bollo annuale**. L'aliquota è dello **0,20%** (2 per mille) calcolata sul valore della polizza al 31 dicembre di ogni anno. L'imposta viene generalmente prelevata direttamente dalla compagnia assicurativa riducendo il valore della polizza. Le polizze di Ramo I sono esenti da questa imposta se il contratto non prevede la possibilità di riscatto prima di 5 anni dalla sottoscrizione.\n\n#### **Tassa di Successione**\n\nQuesto è uno dei vantaggi più rilevanti delle polizze vita. In caso di decesso dell'assicurato, le somme liquidate ai beneficiari designati sono **totalmente esenti dall'imposta di successione**. Inoltre, tali capitali non rientrano nell'asse ereditario, garantendo una trasmissione rapida ed efficiente al di fuori delle complesse procedure di successione.\n\n### **Conclusione: Perché Calcolare è Importante?**\n\nStimare la tassazione permette di:\n\n* **Confrontare Prodotti:** Valutare l'impatto fiscale su una polizza di Ramo I rispetto a una di Ramo III.\n* **Pianificare il Futuro:** Avere un'idea chiara del capitale netto che si riceverà al momento del bisogno.\n* **Comprendere i Rendimenti:** Distinguere tra rendimento lordo e netto, l'unico che conta veramente per le proprie finanze.\n\nUtilizza questo calcolatore come un simulatore per i tuoi scenari di investimento, ma ricorda che i risultati sono una stima basata sui dati inseriti e non sostituiscono il documento di liquidazione ufficiale fornito dalla tua compagnia assicurativa.",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Come viene calcolata la tassazione su una polizza vita?", "acceptedAnswer": { "@type": "Answer", "text": "La tassazione si applica solo sulla plusvalenza (capital gain), data dalla differenza tra il capitale liquidato e i premi versati. L'imposta viene calcolata applicando diverse aliquote (12.5%, 20%, 26%) in base al periodo storico in cui il rendimento è maturato, secondo un principio 'pro rata temporis'." }},
      { "@type": "Question", "name": "Qual è la differenza di tassazione tra polizze Ramo I e Ramo III?", "acceptedAnswer": { "@type": "Answer", "text": "La principale differenza è che le polizze di Ramo I (Gestioni Separate) possono beneficiare di un'aliquota agevolata del 12,5% sulla parte di rendimento derivante da Titoli di Stato e obbligazioni equiparate. Le polizze di Ramo III (Unit-Linked) non hanno questa agevolazione e l'intera plusvalenza è tassata con il metodo pro rata standard." }},
      { "@type": "Question", "name": "Il capitale di una polizza vita rientra nell'eredità?", "acceptedAnswer": { "@type": "Answer", "text": "No, uno dei maggiori vantaggi delle polizze vita è che, in caso di decesso dell'assicurato, le somme liquidate ai beneficiari designati non rientrano nell'asse ereditario e sono completamente esenti dall'imposta di successione." }},
      { "@type": "Question", "name": "Cos'è l'imposta di bollo sulle polizze vita?", "acceptedAnswer": { "@type": "Answer", "text": "È un'imposta annuale dello 0,20% (2 per mille) che si applica sul valore della polizza al 31 dicembre. Viene prelevata direttamente dalla compagnia. Le polizze Ramo I possono essere esenti in determinate condizioni contrattuali." }}
    ]
  }
};

// --- OTTIMIZZAZIONE PERFORMANCE: Lazy Loading dei Grafici ---
const DynamicPieChart = dynamic(() => import('recharts').then(mod => {
  const { PieChart, Pie, Cell, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
  
  const CustomPieChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
        </Pie>
        <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
  return CustomPieChart;
}), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Caricamento grafico...</div>
});

// --- ICONE E COMPONENTI DI UI ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);

// --- OTTIMIZZAZIONE SEO: Dati Strutturati Dinamici ---
const SchemaInjector = ({ schema }: { schema: object }) => (
  <Head>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
  </Head>
);

// --- COMPONENTE PER IL RENDERING DEL CONTENUTO ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code class=\"text-sm bg-gray-100 p-1 rounded\">$1</code>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                if (trimmedBlock.match(/^\d\.\s/)) return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />)}</ol>;
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- NOME DEL COMPONENTE DINAMICO ---
const generateComponentName = (slug: string) => {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'Calculator';
};

// --- COMPONENTE PRINCIPALE DEL CALCOLATORE ---
const TassazionePolizzeVitaRamo13Calculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const initialStates: Inputs = {
        capitale_liquidato: 150000,
        premi_versati: 100000,
        data_sottoscrizione: '2010-01-01',
        data_riscatto: getTodayDate(),
        quota_gov_bonds: 30,
    };
    const [states, setStates] = useState<Inputs>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { capitale_liquidato, premi_versati, data_sottoscrizione, data_riscatto, quota_gov_bonds } = states;
        
        if (!data_sottoscrizione || !data_riscatto || new Date(data_riscatto) <= new Date(data_sottoscrizione)) {
          return { plusvalenza_lorda: 0, imposta_sostitutiva_totale: 0, capitale_netto_liquidato: capitale_liquidato, aliquota_effettiva: 0 };
        }
        
        const plusvalenza_lorda = Math.max(0, capitale_liquidato - premi_versati);
        if (plusvalenza_lorda === 0) {
           return { plusvalenza_lorda: 0, imposta_sostitutiva_totale: 0, capitale_netto_liquidato: capitale_liquidato, aliquota_effettiva: 0 };
        }

        const plusvalenza_gov_bonds = plusvalenza_lorda * (quota_gov_bonds / 100);
        const imposta_gov_bonds = plusvalenza_gov_bonds * 0.125;
        const plusvalenza_ordinaria = plusvalenza_lorda - plusvalenza_gov_bonds;
        
        const ONE_DAY_MS = 1000 * 60 * 60 * 24;
        const start = new Date(data_sottoscrizione).getTime();
        const end = new Date(data_riscatto).getTime();
        
        const d_2011 = new Date('2011-12-31').getTime();
        const d_2012 = new Date('2012-01-01').getTime();
        const d_2014_mid = new Date('2014-06-30').getTime();
        const d_2014_post = new Date('2014-07-01').getTime();

        const giorni_totali = Math.max(1, (end - start) / ONE_DAY_MS);
        
        const giorni_fino_2011 = (Math.min(end, d_2011) - start) / ONE_DAY_MS;
        const giorni_2012_2014 = (Math.min(end, d_2014_mid) - Math.max(start, d_2012)) / ONE_DAY_MS;
        const giorni_post_2014 = (end - Math.max(start, d_2014_post)) / ONE_DAY_MS;
        
        const imposta_fino_2011 = plusvalenza_ordinaria * (Math.max(0, giorni_fino_2011) / giorni_totali) * 0.125;
        const imposta_2012_2014 = plusvalenza_ordinaria * (Math.max(0, giorni_2012_2014) / giorni_totali) * 0.20;
        const imposta_post_2014 = plusvalenza_ordinaria * (Math.max(0, giorni_post_2014) / giorni_totali) * 0.26;
        
        const imposta_sostitutiva_totale = imposta_gov_bonds + imposta_fino_2011 + imposta_2012_2014 + imposta_post_2014;
        const capitale_netto_liquidato = capitale_liquidato - imposta_sostitutiva_totale;
        const aliquota_effettiva = (imposta_sostitutiva_totale / plusvalenza_lorda) * 100;

        return { plusvalenza_lorda, imposta_sostitutiva_totale, capitale_netto_liquidato, aliquota_effettiva };
    }, [states]);

    const chartData = [
        { name: 'Plusvalenza Netta', value: Math.max(0, calculatedOutputs.plusvalenza_lorda - calculatedOutputs.imposta_sostitutiva_totale), color: '#4ade80' },
        { name: 'Imposta Totale', value: calculatedOutputs.imposta_sostitutiva_totale, color: '#f87171' },
    ];
    
    const formulaTrasparente = "Imposta = Σ (Quota Parte Plusvalenza * Aliquota di Periodo)";

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (calculatorRef.current) {
                const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'pt', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${slug}-simulazione.pdf`);
            }
        } catch (error) {
            alert("Errore durante l'esportazione in PDF.");
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const result = { slug, title, inputs: states, outputs: calculatedOutputs, timestamp: new Date().toISOString() };
            const history = JSON.parse(localStorage.getItem('calculator_history') || '[]');
            history.unshift(result);
            localStorage.setItem('calculator_history', JSON.stringify(history.slice(0, 50)));
            alert("Risultato salvato nello storico del browser!");
        } catch (error) {
            alert("Impossibile salvare il risultato.");
        }
    }, [slug, title, states, calculatedOutputs]);
    
    const formatValue = (value: number, unit: string) => {
        if (unit === '€') return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
        if (unit === '%') return `${value.toFixed(2)} %`;
        return value.toString();
    };

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="font-sans bg-slate-50">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto p-4 md:p-6">
                    <main className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-lg p-6" ref={calculatorRef}>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-800">{title}</h1>
                            <p className="text-slate-600 mb-6">Stima l'imposta sul capital gain della tua polizza vita in base ai diversi regimi fiscali.</p>
                            
                            <div className="text-xs text-orange-800 bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento fornisce una stima a scopo puramente informativo e didattico. I calcoli si basano sui dati inseriti e non possono sostituire la documentazione ufficiale della compagnia assicurativa o la consulenza di un professionista.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {inputs.map(input => (
                                    <div key={input.id} className={input.type === 'date' ? 'md:col-span-1' : 'md:col-span-2'}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon/></span></Tooltip>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                id={input.id}
                                                type={input.type}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                                value={states[input.id] || ''}
                                                min={input.min}
                                                max={input.max}
                                                step={input.step}
                                                onChange={(e) => handleStateChange(input.id, input.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                            />
                                            {input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className=" -xl -lg p-6 mt-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Risultati della Simulazione</h2>
                            <div className="space-y-4">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'imposta_sostitutiva_totale' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-slate-50'}`}>
                                        <div className="text-sm md:text-base font-medium text-slate-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'imposta_sostitutiva_totale' ? 'text-indigo-600' : 'text-slate-800'}`}>
                                           {isClient ? formatValue((calculatedOutputs as any)[output.id], output.unit) : '...'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className=" -xl -lg p-6 mt-8">
                           <h3 className="text-lg font-semibold text-gray-700 mb-2">Scomposizione Plusvalenza Lorda</h3>
                           <div className="h-64 w-full">
                               {isClient && calculatedOutputs.plusvalenza_lorda > 0 ? (
                                   <DynamicPieChart data={chartData} />
                               ) : (
                                   <div className="flex items-center justify-center h-full w-full bg-gray-50 rounded-lg text-gray-500">
                                       {isClient ? 'Nessuna plusvalenza da visualizzare.' : 'Caricamento...'}
                                   </div>
                               )}
                           </div>
                           <div className="mt-4 border-t pt-4">
                                <h3 className="font-semibold text-gray-700">Logica di Calcolo</h3>
                                <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaTrasparente}</p>
                                <p className="text-xs text-gray-500 mt-2">La formula rappresenta il principio *pro rata temporis*: la plusvalenza viene ripartita e tassata con aliquote diverse (12.5%, 20%, 26%) in base al periodo di maturazione.</p>
                           </div>
                        </div>
                    </main>

                    <aside className="lg:col-span-2 space-y-6">
                        <section className="border rounded-xl p-4 bg-white shadow-lg sticky top-6">
                            <h2 className="font-semibold mb-3 text-gray-800 text-lg">Azioni Rapide</h2>
                            <div className="grid grid-cols-1 gap-3">
                                <button onClick={handleSaveResult} className="w-full text-center bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                                <button onClick={handleExportPDF} className="w-full text-center bg-white border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                                <button onClick={handleReset} className="w-full text-center bg-white border border-red-300 text-red-700 rounded-md px-4 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Campi</button>
                            </div>
                        </section>
                        <section className="border rounded-xl p-6 bg-white shadow-lg">
                            <h2 className="font-semibold mb-3 text-gray-800 text-lg">Guida al Calcolo</h2>
                            <ContentRenderer content={content} />
                        </section>
                         <section className="border rounded-xl p-6 bg-white shadow-lg">
                            <h2 className="font-semibold mb-3 text-gray-800 text-lg">Fonti e Riferimenti</h2>
                            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                                <li><a href="https://www.gazzettaufficiale.it/eli/id/2011/12/06/011A15212/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.L. 6 dicembre 2011, n. 201 (Decreto "Salva Italia")</a></li>
                                <li><a href="https://www.gazzettaufficiale.it/eli/id/2014/06/24/14A04646/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.L. 24 aprile 2014, n. 66</a></li>
                                <li><a href="https://www.mef.gov.it/focus/Tassazione-delle-rendite-finanziarie-le-novita-del-Decreto-legge-n.662014/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Comunicazione MEF su tassazione rendite finanziarie</a></li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>
        </>
    );
};

// Assegna il nome dinamico al componente per l'export
Object.defineProperty(TassazionePolizzeVitaRamo13Calculator, "name", {
  value: generateComponentName(calculatorData.slug),
  configurable: true,
});

export default TassazionePolizzeVitaRamo13Calculator;