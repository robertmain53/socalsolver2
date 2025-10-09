'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: 'Calcolatore Imposte Acquisto Casa (Registro, Ipotecaria, Catastale)',
  description: 'Calcola con precisione le imposte di registro, ipotecaria, catastale e l\'eventuale IVA per l\'acquisto della tua prima o seconda casa.'
};

// --- Icona per i Tooltip (SVG inline) ---
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
            "name": "Come si calcolano le imposte sull'acquisto di una casa da un privato?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Se si acquista da un privato, si paga l'imposta di registro (2% per la prima casa, 9% per la seconda), calcolata sul valore catastale rivalutato (regola del 'prezzo-valore'), più le imposte ipotecaria e catastale in misura fissa di 50€ ciascuna. L'imposta di registro ha un minimo di 1.000€."
            }
          },
          {
            "@type": "Question",
            "name": "Quali tasse si pagano comprando casa da un'impresa costruttrice?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Acquistando da un costruttore (cessione soggetta a IVA), si paga l'IVA sul prezzo di vendita (4% per prima casa, 10% per seconda, 22% per lusso), più le imposte di registro, ipotecaria e catastale in misura fissa di 200€ ciascuna."
            }
          },
          {
            "@type": "Question",
            "name": "Cos'è il sistema 'prezzo-valore' e quando si applica?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il sistema 'prezzo-valore' è un grande vantaggio fiscale che permette di calcolare l'imposta di registro sulla base del valore catastale rivalutato, anziché sul prezzo di acquisto. Si applica solo alle compravendite tra privati (persone fisiche) e per immobili ad uso abitativo."
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
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('|')) {
                    const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()));
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


// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "imposta-registro-ipotecaria-catastale",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Imposta di Registro, Ipotecaria e Catastale per acquisto casa",
  "lang": "it",
  "inputs": [
    { "id": "tipo_venditore", "label": "Chi è il venditore?", "type": "select" as const, "options": [{ "value": "privato", "label": "Un privato o un'impresa (esente IVA)" }, { "value": "costruttore_iva", "label": "Un'impresa costruttrice (soggetto a IVA)" }], "tooltip": "Questa scelta è fondamentale. Cambia completamente il regime di tassazione: Imposta di Registro (proporzionale) se compri da un privato, o IVA se compri da un costruttore." },
    { "id": "prima_casa", "label": "È la tua prima casa?", "type": "boolean" as const, "tooltip": "Seleziona se possiedi i requisiti per le agevolazioni 'prima casa' (es. non possedere altri immobili nello stesso comune, trasferire la residenza entro 18 mesi, etc.). Questo riduce drasticamente le imposte." },
    { "id": "prezzo_immobile", "label": "Prezzo di Acquisto dell'Immobile", "type": "number" as const, "unit": "€", "min": 0, "step": 5000, "tooltip": "Inserisci il prezzo di vendita concordato e riportato nell'atto di compravendita." },
    { "id": "rendita_catastale", "label": "Rendita Catastale non rivalutata", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "condition": "tipo_venditore == 'privato'", "tooltip": "Trovi questo valore nella visura catastale. Se compri da un privato, le tasse si calcolano su questo importo rivalutato (regola del 'prezzo-valore'), che è quasi sempre più basso del prezzo di acquisto." },
    { "id": "tipo_immobile", "label": "L'immobile è di lusso (A/1, A/8, A/9)?", "type": "boolean" as const, "tooltip": "Spunta se l'immobile appartiene alle categorie catastali A/1, A/8 o A/9. Gli immobili di lusso non possono beneficiare delle agevolazioni 'prima casa'." }
  ],
  "outputs": [
    { "id": "base_imponibile", "label": "Base Imponibile Calcolata", "unit": "€" },
    { "id": "iva_o_registro", "label": "IVA o Imposta di Registro", "unit": "€" },
    { "id": "imposta_ipotecaria", "label": "Imposta Ipotecaria", "unit": "€" },
    { "id": "imposta_catastale", "label": "Imposta Catastale", "unit": "€" },
    { "id": "totale_imposte", "label": "Totale Imposte e Tasse Dovute", "unit": "€" }
  ],
  "content": "### **Guida Completa alle Imposte sull'Acquisto della Casa**\n\n**Analisi Dettagliata di Imposta di Registro, IVA, Imposte Ipotecaria e Catastale**\n\nL'acquisto di un immobile è un passo importante, e comprendere il carico fiscale è essenziale per una pianificazione finanziaria accurata. Le imposte sulla compravendita immobiliare in Italia variano significativamente in base a pochi, ma cruciali, fattori.\n\nQuesto calcolatore è uno strumento avanzato per fornirti una **stima precisa delle imposte dovute**. Tuttavia, data la complessità della materia, le informazioni qui presenti non sostituiscono la consulenza di un notaio, l'unica figura in grado di certificare i calcoli e gestire l'atto di compravendita.\n\n### **Parte 1: I Protagonisti Fiscali**\n\nQuando si acquista una casa, le imposte principali sono tre (o quattro, in alternativa):\n\n1.  **Imposta di Registro**: Tassa la registrazione dell'atto di trasferimento della proprietà. Si applica in misura **proporzionale** (una percentuale sul valore) quando si acquista da un privato.\n2.  **Imposta Ipotecaria**: Dovuta per le formalità di trascrizione dell'atto nei registri immobiliari.\n3.  **Imposta Catastale**: Dovuta per le volture catastali, ovvero l'aggiornamento dei dati dell'immobile al catasto.\n4.  **IVA (Imposta sul Valore Aggiunto)**: Questa imposta **sostituisce** quella di Registro. Si applica quando si acquista da un'impresa costruttrice (o di ristrutturazione) entro 5 anni dalla fine dei lavori, o anche dopo se il venditore sceglie di assoggettare la vendita a IVA.\n\n### **Parte 2: Le Due Strade: Privato o Costruttore?**\n\nLa prima domanda da porsi è: **chi è il venditore?** La risposta determina il regime fiscale.\n\n**Caso A: Acquisto da un Privato (o da impresa in esenzione IVA)**\n- **Principio**: Si applica l'Imposta di Registro proporzionale.\n- **Vantaggio chiave**: Si può utilizzare la regola del **'prezzo-valore'**. Le imposte non si calcolano sul prezzo di acquisto, ma sul **valore catastale**, che è quasi sempre molto più basso. Questo porta a un notevole risparmio.\n- **Imposte Fisse**: Ipotecaria e Catastale sono in misura fissa di 50 € ciascuna.\n\n**Caso B: Acquisto da un'Impresa Costruttrice (soggetto a IVA)**\n- **Principio**: Si paga l'IVA sul prezzo di acquisto.\n- **Base di Calcolo**: Il prezzo di vendita dichiarato in atto.\n- **Imposte Fisse**: Registro, Ipotecaria e Catastale sono in misura fissa di 200 € ciascuna.\n\n### **Parte 3: L'Agevolazione 'Prima Casa'**\n\nLo Stato offre importanti sconti fiscali a chi acquista la sua abitazione principale. Per accedere ai benefici, l'acquirente non deve essere proprietario di altri immobili ad uso abitativo nello stesso Comune e deve stabilire la residenza entro 18 mesi. L'immobile non deve essere di lusso (categorie A/1, A/8, A/9).\n\nEcco come cambiano le aliquote:\n\n| Tipo di Acquisto | Tassazione SENZA Agevolazioni | Tassazione CON Agevolazioni 'Prima Casa' |\n| :--- | :--- | :--- |\n| **Da Privato** | Imposta Registro: **9%** | Imposta Registro: **2%** |\n| | Ipotecaria: 50 € | Ipotecaria: 50 € |\n| | Catastale: 50 € | Catastale: 50 € |\n| **Da Costruttore (con IVA)** | IVA: **10%** (o 22% per lusso) | IVA: **4%** |\n| | Registro: 200 € | Registro: 200 € |\n| | Ipotecaria: 200 € | Ipotecaria: 200 € |\n| | Catastale: 200 € | Catastale: 200 € |\n\n### **Parte 4: Come Funziona il 'Prezzo-Valore'**\n\nQuando acquisti da un privato, puoi chiedere al notaio di applicare questa regola. La base imponibile per l'imposta di registro si calcola così:\n\n**Base Imponibile = Rendita Catastale * 1,05 * Coefficiente**\n\n- La **Rendita Catastale** si trova sulla visura catastale.\n- **1,05** è il fattore di rivalutazione della rendita.\n- Il **Coefficiente** è **110** per la prima casa e **120** per la seconda casa.\n\nQuesto valore è la base su cui applicare l'aliquota del 2% o del 9%.\n\n### **Oltre le Imposte: Altri Costi da Considerare**\n\nRicorda che il costo totale dell'operazione include altre spese significative non calcolate qui:\n\n* **Onorario del Notaio**: Varia in base al prezzo dell'immobile e alla città.\n* **Spese di Agenzia Immobiliare**: Solitamente una percentuale sul prezzo di vendita (es. 3-4% + IVA).\n* **Spese di Mutuo**: Se richiedi un finanziamento, ci saranno costi di perizia, istruttoria e un'imposta sostitutiva sul mutuo."
};


const ImpostaRegistroIpotecariaCatastaleCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      tipo_venditore: "privato",
      prima_casa: true,
      prezzo_immobile: 250000,
      rendita_catastale: 750,
      tipo_immobile: false,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { tipo_venditore, prima_casa, prezzo_immobile, rendita_catastale, tipo_immobile } = states;

        const is_prima_casa_applicabile = prima_casa && !tipo_immobile;

        let base_imponibile = 0, iva_o_registro = 0, imposta_ipotecaria = 0, imposta_catastale = 0, totale_imposte = 0;
        let imposta_registro_fissa_costruttore = 0;

        if (tipo_venditore === 'privato') {
            const coefficiente_catastale = is_prima_casa_applicabile ? 115.5 : 126;
            base_imponibile = rendita_catastale * coefficiente_catastale;
            const imposta_registro_calcolata = base_imponibile * (is_prima_casa_applicabile ? 0.02 : 0.09);
            iva_o_registro = Math.max(imposta_registro_calcolata, 1000);
            imposta_ipotecaria = 50;
            imposta_catastale = 50;
        } else { // costruttore_iva
            base_imponibile = prezzo_immobile;
            const aliquota_iva = is_prima_casa_applicabile ? 0.04 : (tipo_immobile ? 0.22 : 0.10);
            iva_o_registro = prezzo_immobile * aliquota_iva;
            imposta_registro_fissa_costruttore = 200;
            imposta_ipotecaria = 200;
            imposta_catastale = 200;
        }

        totale_imposte = iva_o_registro + imposta_registro_fissa_costruttore + imposta_ipotecaria + imposta_catastale;

        return { base_imponibile, iva_o_registro, imposta_ipotecaria, imposta_catastale, totale_imposte };
    }, [states]);

    const chartData = [
      { name: 'Imposta Principale', value: calculatedOutputs.iva_o_registro, fill: '#4f46e5', label: states.tipo_venditore === 'privato' ? 'Imposta di Registro' : 'IVA' },
      { name: 'Imposta Ipotecaria', value: calculatedOutputs.imposta_ipotecaria, fill: '#818cf8' },
      { name: 'Imposta Catastale', value: calculatedOutputs.imposta_catastale, fill: '#a5b4fc' },
    ];
    if (states.tipo_venditore === 'costruttore_iva') {
      chartData.splice(1, 0, { name: 'Imposta di Registro (Fissa)', value: 200, fill: '#c7d2fe' });
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula i costi fiscali per la compravendita del tuo immobile in pochi click.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza notarile, necessaria per la certificazione dei calcoli e la stipula dell'atto.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
                           {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split("'")[1]);
                                if (!conditionMet) return null;

                                const inputLabel = (
                                    <label className="block text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'select') {
                                    return (
                                        <div key={input.id} className="md:col-span-2">
                                            {inputLabel}
                                            <select id={input.id} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                                {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    );
                                }

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="flex items-center gap-3 p-2 rounded-md h-full">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            {inputLabel}
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="mt-1 flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'totale_imposte' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'totale_imposte' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione delle Imposte</h3>
                            <div className="h-72 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                       <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12 }} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Bar dataKey="value" background={{ fill: '#eee' }}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => alert("Funzionalità non implementata in questo esempio.")} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={() => alert("Funzionalità non implementata in questo esempio.")} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Dettagliata al Calcolo</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/fabbricatiterreni/imposte-compravendita-abitazione/scheda-informativa-imposte-compravendita-abitazione" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Guida alle Imposte</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-04-26;131" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 131/1986 - Testo Unico Imposta di Registro</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default ImpostaRegistroIpotecariaCatastaleCalculator;