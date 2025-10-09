'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- TIPI E INTERFACCE ---
type CalculatorInput = {
  id: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  options?: (string | number)[];
  unit?: string;
  condition?: string;
  tooltip: string;
};

// --- ICONE E COMPONENTI UI MINIMALISTI ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- COMPONENTE PER INIEZIONE DINAMICA DELLO SCHEMA SEO ---
const SchemaInjector = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// --- COMPONENTE PER IL RENDERING DEL CONTENUTO MARKDOWN ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('####')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/####\s*/, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- LAZY LOADING PER I GRAFICI ---
const DynamicPieChart = dynamic(() => import('recharts').then(mod => {
  const { PieChart, Pie, Cell, Tooltip: ChartTooltip, Legend, ResponsiveContainer } = mod;
  interface ChartProps { data: { name: string, value: number }[]; }
  const COLORS = ['#3b82f6', '#84cc16', '#f97316'];
  return ({ data }: ChartProps) => (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[250px] bg-gray-100 rounded-lg"><p className="text-sm text-gray-500">Caricamento grafico...</p></div>
});


// --- DATI DI CONFIGURAZIONE DEL CALCOLATORE ---
const calculatorData = { "slug": "ritenuta-dacconto-fornitori", "category": "PMI e Impresa", "title": "Calcolatore Ritenuta d'Acconto per Fornitori", "lang": "it", "inputs": [ { "id": "tipo_calcolo", "label": "Modalità di Calcolo", "type": "select", "options": ["Da Imponibile a Netto", "Da Netto a Imponibile (Scorporo)"], "tooltip": "Scegli se partire dall'imponibile della prestazione per calcolare il netto da pagare, o se partire dal netto che vuoi pagare per calcolare l'imponibile da indicare in fattura." }, { "id": "importo", "label": "Importo di Partenza", "type": "number", "unit": "€", "min": 0, "step": 10, "tooltip": "Inserisci il valore da cui iniziare il calcolo (imponibile o netto a pagare, a seconda della modalità scelta)." }, { "id": "aliquota_ritenuta", "label": "Aliquota Ritenuta", "type": "select", "options": [20, 4, 23], "unit": "%", "tooltip": "Seleziona l'aliquota corretta: 20% per professionisti, 4% per prestazioni a condomini, 23% per agenti e rappresentanti (calcolata su base ridotta)." }, { "id": "includi_cassa_previdenziale", "label": "Includi Cassa Previdenziale?", "type": "boolean", "tooltip": "Attiva se la fattura include il contributo per la cassa previdenziale del professionista (es. INARCASSA, CNP, etc.)." }, { "id": "aliquota_cassa", "label": "Aliquota Cassa Previdenziale", "type": "number", "unit": "%", "min": 0, "step": 0.5, "condition": "includi_cassa_previdenziale == true", "tooltip": "Inserisci l'aliquota del contributo integrativo (es. 4% per Ingegneri/Architetti/Commercialisti, 2% per Avvocati)." }, { "id": "cassa_imponibile_ritenuta", "label": "La cassa è soggetta a ritenuta?", "type": "boolean", "condition": "includi_cassa_previdenziale == true", "tooltip": "Attiva solo se il contributo cassa rientra nella base imponibile della ritenuta. Generalmente non è soggetta, ma verifica le regole della cassa specifica." }, { "id": "includi_iva", "label": "Includi IVA?", "type": "boolean", "tooltip": "Attiva se la prestazione è soggetta a IVA. Disattiva per operazioni esenti o fuori campo IVA (es. contribuenti minimi/forfettari)." }, { "id": "aliquota_iva", "label": "Aliquota IVA", "type": "select", "options": [22, 10, 4], "unit": "%", "condition": "includi_iva == true", "tooltip": "Seleziona l'aliquota IVA applicabile alla prestazione: 22% (ordinaria), 10% o 4% (ridotte)." } ], "outputs": [ { "id": "imponibile_fiscale", "label": "Imponibile Fiscale (Compenso)", "unit": "€" }, { "id": "rivalsa_cassa", "label": "Rivalsa Cassa Previdenziale", "unit": "€" }, { "id": "imponibile_iva", "label": "Base Imponibile IVA", "unit": "€" }, { "id": "importo_iva", "label": "Importo IVA", "unit": "€" }, { "id": "totale_fattura", "label": "Totale Fattura", "unit": "€" }, { "id": "importo_ritenuta", "label": "Importo Ritenuta d'Acconto", "unit": "€" }, { "id": "netto_a_pagare", "label": "Netto a Pagare al Fornitore", "unit": "€" } ], "examples": [ { "name": "Fattura Avvocato", "inputs": { "tipo_calcolo": "Da Imponibile a Netto", "importo": 1000, "aliquota_ritenuta": 20, "includi_cassa_previdenziale": true, "aliquota_cassa": 4, "cassa_imponibile_ritenuta": false, "includi_iva": true, "aliquota_iva": 22 } } ], "content": "...", "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Chi è obbligato a versare la ritenuta d'acconto?", "acceptedAnswer": { "@type": "Answer", "text": "La ritenuta d'acconto deve essere versata dal cliente, che agisce come 'sostituto d'imposta'. I soggetti obbligati sono tipicamente imprese, società, enti commerciali e non, professionisti con dipendenti, e i condomini. Il fornitore che emette la fattura subisce la trattenuta." } }, { "@type": "Question", "name": "Qual è il codice tributo per il versamento della ritenuta su fattura di un professionista?", "acceptedAnswer": { "@type": "Answer", "text": "Il codice tributo da utilizzare nel modello F24 per versare la ritenuta d'acconto sui compensi di lavoro autonomo e professionale è il **1040**." } }, { "@type": "Question", "name": "La Cassa Previdenziale (es. 4%) è soggetta a ritenuta d'acconto?", "acceptedAnswer": { "@type": "Answer", "text": "Generalmente no. Il contributo integrativo alla cassa previdenziale (es. 4% per commercialisti, ingegneri) è soggetto a IVA ma escluso dalla base imponibile su cui si calcola la ritenuta d'acconto del 20%. La ritenuta si applica solo sul compenso professionale." } }, { "@type": "Question", "name": "Cosa significa 'scorporo' o 'calcolo inverso' della ritenuta?", "acceptedAnswer": { "@type": "Answer", "text": "Significa partire da un importo netto che si è concordato di pagare al fornitore e, applicando le formule inverse, calcolare a ritroso quale deve essere l'imponibile da indicare in fattura affinché, dopo l'aggiunta di cassa, IVA e la sottrazione della ritenuta, il risultato sia esattamente quel netto." } } ] }};
calculatorData.content = `### **Guida Completa alla Ritenuta d'Acconto per Fornitori**\n\nLa ritenuta d'acconto è un meccanismo fiscale fondamentale nei rapporti tra imprese/professionisti e i loro fornitori di servizi. In pratica, il cliente (sostituto d'imposta) trattiene una parte del compenso dovuto al fornitore (sostituito) e la versa direttamente allo Stato come anticipo (acconto) sulle imposte sui redditi del fornitore stesso. \n\nQuesto calcolatore avanzato è progettato per gestire con precisione ogni variabile, inclusa la Cassa Previdenziale, l'IVA e il calcolo inverso (scorporo), offrendo uno strumento più completo rispetto ai calcolatori standard e fornendo una guida autorevole per un corretto adempimento fiscale.\n\n### **Parte 1: I Protagonisti e i Concetti Chiave**\n\n* **Sostituto d'Imposta**: Il soggetto che paga il compenso (es. un'azienda, un condominio, un professionista con dipendenti) e che è obbligato per legge a operare la ritenuta e a versarla.\n* **Sostituito**: Il soggetto che riceve il compenso e subisce la trattenuta (es. un professionista, un agente di commercio).\n* **Imponibile Fiscale**: È il compenso pattuito per la prestazione professionale, al netto di IVA e Cassa Previdenziale.\n* **Cassa Previdenziale**: Contributo integrativo obbligatorio per molti professionisti iscritti ad albi (es. Avvocati, Ingegneri, Commercialisti). Solitamente **non** rientra nella base di calcolo della ritenuta, ma è imponibile ai fini IVA.\n\n### **Parte 2: Come Funziona il Calcolo (Standard e Inverso)**\n\n#### **Calcolo Standard: Dall'Imponibile al Netto a Pagare**\n\nÈ il caso più comune: si parte dal compenso pattuito e si calcolano le varie componenti della fattura.\n\n1.  **Si calcola la Rivalsa Previdenziale**: \`Imponibile Fiscale * Aliquota Cassa %\`\n2.  **Si calcola la Base Imponibile IVA**: \`Imponibile Fiscale + Rivalsa Previdenziale\`\n3.  **Si calcola l'IVA**: \`Base Imponibile IVA * Aliquota IVA %\`\n4.  **Si determina il Totale Fattura**: \`Base Imponibile IVA + IVA\`\n5.  **Si calcola la Ritenuta d'Acconto**: \`Imponibile Fiscale * Aliquota Ritenuta %\`. **Attenzione**: la base di calcolo della ritenuta è, di norma, solo il compenso, escludendo la cassa.\n6.  **Si calcola il Netto a Pagare**: \`Totale Fattura - Ritenuta d'Acconto\`\n\n#### **Calcolo Inverso (Scorporo): Dal Netto a Pagare all'Imponibile**\n\nScenario meno comune ma cruciale: ci si accorda su una cifra netta da pagare al fornitore e si deve 'scorporare' tutto per determinare l'imponibile corretto da inserire in fattura. Questo calcolatore risolve l'equazione complessa per trovare l'imponibile di partenza.\n\n### **Parte 3: Aliquote Comuni e Adempimenti**\n\n* **20%**: L'aliquota standard per le prestazioni di lavoro autonomo (professionisti, consulenti, freelance).\n* **4%**: Si applica ai corrispettivi per contratti di appalto di opere o servizi resi a **condomini**.\n* **23% (su base imponibile ridotta)**: Per le provvigioni di agenti e rappresentanti di commercio. La ritenuta si calcola sul 50% delle provvigioni (o sul 20% se si avvalgono di dipendenti o collaboratori).\n\n#### **Versamento e Certificazione**\n\n* **Versamento**: La ritenuta va versata dal sostituto d'imposta tramite **modello F24**, entro il giorno 16 del mese successivo a quello del pagamento della fattura. \n* **Codice Tributo 1040**: È il codice più comune, usato per i compensi di lavoro autonomo.\n* **Certificazione Unica (CU)**: Entro il 16 Marzo dell'anno successivo, il sostituto d'imposta deve inviare all'Agenzia delle Entrate e consegnare al fornitore la Certificazione Unica, che riepiloga tutte le ritenute operate nell'anno precedente. Questo documento è fondamentale per la dichiarazione dei redditi del fornitore.`;

// --- COMPONENTE PRINCIPALE ---
const RitenutaDaccontoFornitoriCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema, examples } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = examples[0].inputs;
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const { tipo_calcolo, importo, aliquota_ritenuta, includi_cassa_previdenziale, aliquota_cassa, cassa_imponibile_ritenuta, includi_iva, aliquota_iva } = states;

        let imponibile_fiscale = 0;

        const cassa_perc = includi_cassa_previdenziale ? Number(aliquota_cassa) / 100 : 0;
        const iva_perc = includi_iva ? Number(aliquota_iva) / 100 : 0;
        const ritenuta_perc = Number(aliquota_ritenuta) / 100;
        
        if (tipo_calcolo === 'Da Imponibile a Netto') {
            imponibile_fiscale = Number(importo) || 0;
        } else { // Da Netto a Imponibile (Scorporo)
            const base_ritenuta_factor = aliquota_ritenuta == 23 ? 0.5 : (cassa_imponibile_ritenuta ? (1 + cassa_perc) : 1);
            const denominatore = (1 + cassa_perc) * (1 + iva_perc) - (base_ritenuta_factor * ritenuta_perc);
            imponibile_fiscale = (denominatore !== 0) ? (Number(importo) || 0) / denominatore : 0;
        }

        const rivalsa_cassa = includi_cassa_previdenziale ? imponibile_fiscale * cassa_perc : 0;
        const base_imponibile_ritenuta = aliquota_ritenuta == 23 ? imponibile_fiscale * 0.5 : (cassa_imponibile_ritenuta ? imponibile_fiscale + rivalsa_cassa : imponibile_fiscale);
        const importo_ritenuta = base_imponibile_ritenuta * ritenuta_perc;
        const imponibile_iva = imponibile_fiscale + rivalsa_cassa;
        const importo_iva = includi_iva ? imponibile_iva * iva_perc : 0;
        const totale_fattura = imponibile_iva + importo_iva;
        const netto_a_pagare = totale_fattura - importo_ritenuta;
        
        return { imponibile_fiscale, rivalsa_cassa, imponibile_iva, importo_iva, totale_fattura, importo_ritenuta, netto_a_pagare };
    }, [states]);

    const chartData = [
        { name: 'Compenso', value: calculatedOutputs.imponibile_fiscale },
        { name: 'Cassa', value: calculatedOutputs.rivalsa_cassa },
        { name: 'IVA', value: calculatedOutputs.importo_iva },
    ].filter(item => item.value > 0);

    const handleExportPDF = useCallback(async () => { /* ... implementazione PDF ... */ }, [slug]);
    const handleSaveResult = useCallback(() => { /* ... implementazione salvataggio ... */ }, [states, calculatedOutputs]);
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Calcolatore e Risultati */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-lg p-6" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                        <p className="text-gray-600 mb-6">Calcola o scorpora la ritenuta per fatture a professionisti, agenti e condomini.</p>
                        
                        <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                            <strong>Disclaimer:</strong> Questo strumento ha scopo puramente informativo e non sostituisce una consulenza fiscale professionale. Verificare sempre le normative vigenti.
                        </div>

                        <div className="space-y-6">
                            {(inputs as CalculatorInput[]).map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;

                                const label = (
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                    </label>
                                );

                                if (input.id === 'tipo_calcolo') {
                                    return (
                                        <div key={input.id}>
                                            {label}
                                            <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
                                                {input.options?.map(opt => (
                                                    <button key={String(opt)} onClick={() => handleStateChange(input.id, String(opt))} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors text-center ${states[input.id] === opt ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                                                        {String(opt)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                
                                if(input.type === 'boolean') {
                                    return (
                                      <div key={input.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                                          {label}
                                          <label htmlFor={input.id} className="relative inline-flex items-center cursor-pointer">
                                              <input type="checkbox" id={input.id} className="sr-only peer" checked={states[input.id]} onChange={e => handleStateChange(input.id, e.target.checked)} />
                                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                          </label>
                                      </div>
                                    )
                                }

                                return (
                                    <div key={input.id}>
                                        {label}
                                        <div className="relative">
                                            {input.type === 'select' ? (
                                                <select id={input.id} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5">
                                                    {input.options?.map(opt => <option key={String(opt)} value={String(opt)}>{String(opt)}</option>)}
                                                </select>
                                            ) : (
                                                <input id={input.id} type="number" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-12 py-2" value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))} />
                                            )}
                                            {input.unit && <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 text-sm pointer-events-none">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-10">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati del Calcolo</h2>
                            <div className="space-y-3">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'netto_a_pagare' ? 'bg-blue-50 border-l-4 border-blue-500' : (output.id === 'totale_fattura' ? 'bg-green-50' : 'bg-gray-50')}`}>
                                        <span className="font-medium text-gray-700">{output.label}</span>
                                        <span className={`text-xl font-bold ${output.id === 'netto_a_pagare' ? 'text-blue-600' : 'text-gray-900'}`}>
                                            {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '€...'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-10">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Composizione Totale Fattura</h3>
                            {isClient && <DynamicPieChart data={chartData} />}
                        </div>
                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-2 space-y-6">
                    <section className="bg-white border rounded-lg p-5 shadow-lg">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Guida alla Ritenuta</h2>
                        <ContentRenderer content={calculatorData.content} />
                    </section>

                    <section className="bg-white border rounded-lg p-5 shadow-lg">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/pagamenti/f24/modello-e-istruzioni-f24" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Agenzia delle Entrate - Modello F24</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1973-09-29;600" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">D.P.R. 600/1973 - Artt. 25 e 25-bis</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default RitenutaDaccontoFornitoriCalculator;