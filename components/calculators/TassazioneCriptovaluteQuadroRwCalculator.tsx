'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Lazy Loading del Grafico ---
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Caricamento grafico...</div>,
});

// --- Dati di configurazione inclusi nel componente ---
const calculatorData = {
  "slug": "tassazione-criptovalute-quadro-rw",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Tassazione Criptovalute (quadro RW)",
  "lang": "it",
  "inputs": [
    { "id": "valore_fine_anno", "label": "Valore totale crypto al 31/12", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il valore totale di mercato di tutte le tue cripto-attività (su qualsiasi wallet o exchange) alla fine della giornata del 31 dicembre dell'anno fiscale di riferimento." },
    { "id": "corrispettivi_vendita", "label": "Totale incassato da vendite/conversioni", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Somma tutti gli importi in Euro (o altra valuta fiat) ricevuti dalla vendita di criptovalute o dalla loro conversione in stablecoin (es. USDT, USDC)." },
    { "id": "costi_acquisto", "label": "Costo d'acquisto delle crypto vendute", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il costo totale sostenuto per acquistare le specifiche criptovalute che hai poi venduto. Se hai effettuato più acquisti, si consiglia il metodo LIFO (Last-In, First-Out)." },
    { "id": "altri_proventi", "label": "Altri proventi (Staking, Mining, Airdrop)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Inserisci il valore in Euro, al momento della ricezione, di qualsiasi provento derivante da attività come staking, liquidity mining, airdrop, ecc." }
  ],
  "outputs": [
    { "id": "imposta_valore_crypto_dovuta", "label": "Imposta di bollo (IVACA al 0,2%)", "unit": "€" },
    { "id": "plusvalenza_tassabile", "label": "Plusvalenza tassabile (eccedenza franchigia)", "unit": "€" },
    { "id": "imposta_plusvalenze_dovuta", "label": "Imposta su plusvalenze (al 26%)", "unit": "€" },
    { "id": "tasse_totali_dovute", "label": "Totale Imposte Stimate da Versare", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione delle Criptovalute in Italia**\n\n**Analisi della Normativa, Obblighi Dichiarativi (Quadro RW) e Calcolo delle Imposte**\n\nLa normativa fiscale italiana sulle cripto-attività ha subito un'evoluzione significativa con la Legge di Bilancio 2023, introducendo maggiore chiarezza ma anche obblighi precisi per tutti i detentori. Questa guida, insieme al calcolatore, ha l'obiettivo di fornire un quadro completo per comprendere gli adempimenti fiscali, fermo restando che **non sostituisce in alcun modo una consulenza professionale da parte di un commercialista specializzato**.\n\n### **Parte 1: L'Obbligo Incondizionato del Monitoraggio Fiscale (Quadro RW)**\n\nIl primo e più importante concetto da comprendere è che **tutte le cripto-attività detenute devono essere dichiarate**, indipendentemente dal loro valore e dal fatto che si siano generate o meno delle plusvalenze. \n\nQuesto adempimento si chiama **monitoraggio fiscale** e si effettua compilando il **Quadro RW** del Modello Redditi Persone Fisiche.\n\n* **Cosa va dichiarato?**: Tutto. Criptovalute detenute su exchange (italiani o esteri come Binance, Coinbase, Kraken), wallet non custodial (come MetaMask o Trust Wallet), e hardware wallet (come Ledger o Trezor).\n* **Perché è obbligatorio?**: Le cripto-attività sono considerate \"attività estere di natura finanziaria\" e lo Stato italiano ne richiede il monitoraggio per finalità antiriciclaggio e di controllo fiscale.\n* **Conseguenze dell'omissione**: La mancata compilazione del Quadro RW comporta sanzioni amministrative che vanno dal 3% al 15% dell'importo non dichiarato.\n\n### **Parte 2: Le Imposte Dovute - Due Binari Distinti**\n\nOltre al monitoraggio, il detentore di criptovalute può essere soggetto a due tipi di imposte.\n\n#### **1. Imposta sul Valore delle Cripto-Attività (IVACA)**\n\nQuesta è un'imposta patrimoniale, simile all'imposta di bollo sui conti correnti. \n\n* **Aliquota**: È pari al **2 per mille (0,2%)**.\n* **Base Imponibile**: Si calcola sul **valore totale delle tue cripto-attività al 31 dicembre** dell'anno fiscale di riferimento. Il valore da utilizzare è quello di mercato rilevabile dalla piattaforma dove le crypto sono detenute.\n* **Come si paga**: L'importo viene liquidato direttamente nella dichiarazione dei redditi e versato tramite modello F24.\n\n#### **2. Imposta sulle Plusvalenze (Capital Gain)**\n\nQuesta imposta si applica solo sui **profitti** realizzati durante l'anno fiscale.\n\n* **Aliquota**: È pari al **26%**.\n* **Quando si applica?**: L'imposta è dovuta solo se la somma di tutte le plusvalenze e altri proventi realizzati nell'anno **supera la franchigia di 2.000 €**. Se il profitto totale è pari o inferiore a 2.000 €, non si pagano imposte su di esso (ma l'obbligo di compilare il Quadro RW rimane!).\n* **Cosa genera una plusvalenza tassabile?**:\n    1.  La **conversione di criptovaluta in valuta fiat** (es. vendere Bitcoin per ottenere Euro).\n    2.  Lo **scambio di una criptovaluta con una stablecoin** (es. scambiare Ethereum con USDT).\n    3.  L'utilizzo di criptovalute per acquistare beni o servizi.\n\n* **Come si calcola la plusvalenza?**: La formula base è: `Plusvalenza = Corrispettivo di Vendita - Costo di Acquisto`. A questo si sommano altri proventi come quelli da staking, mining, airdrop, etc.\n\n### **Parte 3: Esempio Pratico di Calcolo**\n\nMario Rossi nel 2023 ha compiuto le seguenti operazioni:\n\n1.  Al 31/12/2023, il valore totale del suo portfolio crypto è di 40.000 €.\n2.  Durante l'anno, ha venduto Ethereum incassando 10.000 €, il cui costo di acquisto era 6.000 €.\n3.  Ha ricevuto 500 € in token da attività di staking.\n\n**Calcolo Imposte:**\n\n* **IVACA (Imposta di Bollo)**: \n    `40.000 € (Valore al 31/12) * 0,002 = 80 €`\n* **Plusvalenza Totale**: \n    `(10.000 € - 6.000 €) + 500 € = 4.500 €`\n* **Imposta sulle Plusvalenze**: \n    Poiché 4.500 € > 2.000 €, l'imposta è dovuta.\n    `Plusvalenza Tassabile = 4.500 € - 2.000 € (franchigia) = 2.500 €`\n    `Imposta Dovuta = 2.500 € * 0,26 = 650 €`\n* **Totale Tasse da Versare**: \n    `80 € (IVACA) + 650 € (Plusvalenze) = 730 €`\n\nMario dovrà quindi indicare le sue attività nel Quadro RW e versare un totale di 730 € di imposte.\n\n### **Riferimenti Normativi**\n\n* **Legge di Bilancio 2023 (Legge n. 197/2022)**: Art. 1, commi da 126 a 147.\n* **Testo Unico delle Imposte sui Redditi (TUIR)**: Art. 67, comma 1, lettera c-sexies).",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "Devo sempre dichiarare le mie criptovalute?", "acceptedAnswer": { "@type": "Answer", "text": "Sì, la detenzione di criptovalute deve essere sempre indicata nel Quadro RW della dichiarazione dei redditi, a prescindere dal loro valore. Questo adempimento è obbligatorio per il monitoraggio fiscale." } }, { "@type": "Question", "name": "Quando pago le tasse sulle plusvalenze (capital gain) delle crypto?", "acceptedAnswer": { "@type": "Answer", "text": "Le tasse sulle plusvalenze (26%) sono dovute solo se la somma dei profitti realizzati in un anno fiscale (da vendite, conversioni in stablecoin, ecc.) supera la franchigia di 2.000 €. Sotto questa soglia, la plusvalenza non è tassata." } }, { "@type": "Question", "name": "Cos'è l'IVACA e come si calcola?", "acceptedAnswer": { "@type": "Answer", "text": "L'IVACA (Imposta sul Valore delle Cripto-Attività) è un'imposta di bollo patrimoniale pari al 0,2% (2 per mille) del valore totale delle tue cripto-attività detenute al 31 dicembre di ogni anno. Si calcola moltiplicando il valore totale per 0,002." } }, { "@type": "Question", "name": "Lo scambio tra due criptovalute (es. BTC per ETH) è tassato?", "acceptedAnswer": { "@type": "Answer", "text": "Generalmente, lo scambio tra criptovalute che hanno 'eguali caratteristiche e funzioni' non costituisce un evento fiscalmente rilevante e quindi non genera una plusvalenza tassabile. Tuttavia, lo scambio tra una criptovaluta e una stablecoin (es. USDC, USDT) è considerato una conversione tassabile." } }] }
};

// --- Componenti di Utilità ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);

// --- Componente per l'iniezione dello Schema SEO ---
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    return (
      <div className="prose prose-sm max-w-none text-gray-700">
        {content.split('\n\n').map((block, index) => {
          const trimmedBlock = block.trim();
          if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
          if (trimmedBlock.startsWith('* **')) {
            const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
            return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
          }
          if (trimmedBlock.match(/^\d\./)) {
             const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
             return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
          }
          if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
          return null;
        })}
      </div>
    );
};

// --- Componente Calcolatore Principale ---
const TassazioneCriptovaluteQuadroRwCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      valore_fine_anno: 25000,
      corrispettivi_vendita: 8000,
      costi_acquisto: 5000,
      altri_proventi: 200,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { valore_fine_anno, corrispettivi_vendita, costi_acquisto, altri_proventi } = states;
        const imposta_valore_crypto_dovuta = valore_fine_anno * 0.002;
        const plusvalenza_realizzata = (corrispettivi_vendita - costi_acquisto) + altri_proventi;
        const plusvalenza_tassabile = Math.max(0, plusvalenza_realizzata - 2000);
        const imposta_plusvalenze_dovuta = plusvalenza_tassabile * 0.26;
        const tasse_totali_dovute = imposta_valore_crypto_dovuta + imposta_plusvalenze_dovuta;
        
        return { imposta_valore_crypto_dovuta, plusvalenza_tassabile, imposta_plusvalenze_dovuta, tasse_totali_dovute };
    }, [states]);

    const handleExportPDF = useCallback(async () => {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).default;
        if (!calculatorRef.current) return;
        const canvas = await html2canvas(calculatorRef.current, { scale: 2, backgroundColor: null });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${slug}.pdf`);
      } catch (e) {
        console.error("PDF Export Error: ", e);
        alert("Errore durante l'esportazione in PDF.");
      }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
      try {
        const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
        const results = JSON.parse(localStorage.getItem("calc_results") || "[]");
        localStorage.setItem("calc_results", JSON.stringify([payload, ...results].slice(0, 50)));
        alert("Risultato salvato con successo nello storage locale del browser!");
      } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    
    const chartData = [
        { name: 'Imposte', 'Imposta Bollo (IVACA)': calculatedOutputs.imposta_valore_crypto_dovuta, 'Imposta Plusvalenze': calculatedOutputs.imposta_plusvalenze_dovuta },
    ];

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Stima le imposte dovute sulle tue cripto-attività secondo la normativa italiana.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima a scopo puramente informativo e non costituisce una consulenza fiscale. Consulta sempre un commercialista per la tua dichiarazione.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inputs.map(input => (
                                <div key={input.id}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{input.unit}</span>
                                        <input
                                            id={input.id}
                                            type="number"
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-8 pr-3 py-2"
                                            min={input.min}
                                            step={input.step}
                                            value={states[input.id]}
                                            onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                                            aria-label={input.label}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultati della Stima</h2>
                        <div className="space-y-4">
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'tasse_totali_dovute' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                                    <span className={`text-xl md:text-2xl font-bold ${output.id === 'tasse_totali_dovute' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione Imposte Stimate</h3>
                        <div className="h-64 w-full mt-4">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                  <XAxis type="number" hide />
                                  <YAxis type="category" dataKey="name" hide />
                                  <ChartTooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} formatter={(value: number) => formatCurrency(value)} />
                                  <Bar dataKey="Imposta Bollo (IVACA)" stackId="a" fill="#818cf8" name="Imposta Bollo (IVACA)" />
                                  <Bar dataKey="Imposta Plusvalenze" stackId="a" fill="#4f46e5" name="Imposta Plusvalenze" />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-sm text-center bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-2 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Guida alla Tassazione Crypto</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                      <h2 className="font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2>
                      <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                          <li><a href="https://www.gazzettaufficiale.it/eli/id/2022/12/29/22G00211/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge di Bilancio 2023 (n. 197/2022)</a></li>
                          <li><a href="https://www.tasse-fisco.com/tassazione-rendite-finanziarie/tassazione-bitcoin-criptovalute-nuova-guida/92807/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">TUIR - Art. 67 (Redditi diversi)</a></li>
                          <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/provvedimento-del-15-01-2024-modelli-redditi-2024" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Modello Redditi PF - Agenzia delle Entrate</a></li>
                      </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneCriptovaluteQuadroRwCalculator;