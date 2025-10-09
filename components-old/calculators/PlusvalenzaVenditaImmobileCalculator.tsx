'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
    title: "Calcolatore Plusvalenza Immobiliare 2025 | Prima e Seconda Casa",
    description: "Calcola online la plusvalenza sulla vendita di un immobile e l'imposta dovuta. Simula la tassazione IRPEF o l'imposta sostitutiva al 26% e scopri i casi di esenzione."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
                        "name": "Quando non si pagano le tasse sulla plusvalenza immobiliare?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Non si pagano tasse sulla plusvalenza immobiliare in tre casi principali: 1) se l'immobile viene venduto dopo 5 anni dall'acquisto; 2) se l'immobile è stato utilizzato come abitazione principale per la maggior parte del periodo di possesso; 3) se l'immobile è stato ricevuto in eredità (successione)."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come si calcola la plusvalenza sulla vendita di una casa?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "La plusvalenza si calcola sottraendo dal prezzo di vendita il prezzo di acquisto e tutti i costi deducibili documentati, come le spese notarili, le imposte pagate all'acquisto (registro, IVA) e i costi di ristrutturazione straordinaria."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Conviene di più l'imposta sostitutiva al 26% o la tassazione IRPEF?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Generalmente, l'imposta sostitutiva al 26% è più conveniente per chi ha redditi medio-alti, perché evita che la plusvalenza si sommi al reddito principale aumentando l'aliquota IRPEF. La tassazione ordinaria IRPEF può essere vantaggiosa per chi ha redditi bassi (scaglione al 23%) o minusvalenze da compensare."
                        }
                    }
                ]
            })
        }}
    />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class=\"text-sm bg-gray-100 p-1 rounded\">$1</code>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('####')) {
                    const title = trimmedBlock.replace(/####\s*/, '');
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(title) }} />;
                }
                 if (trimmedBlock.match(/^\d\.\s/)) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                     const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore (dal JSON) ---
const calculatorData = {
  "slug": "plusvalenza-vendita-immobile", "category": "Immobiliare e Casa", "title": "Calcolatore Plusvalenza sulla Vendita di un Immobile (prima/seconda casa)", "lang": "it",
  "inputs": [
    { "id": "prezzo_vendita", "label": "Prezzo di Vendita", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Il corrispettivo incassato dalla vendita dell'immobile, come indicato nell'atto notarile." },
    { "id": "prezzo_acquisto", "label": "Prezzo di Acquisto Originario", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Il prezzo pagato per acquistare l'immobile, come indicato nel precedente atto di compravendita." },
    { "id": "costi_inerenti", "label": "Costi Deducibili Sostenuti", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Somma di tutti i costi documentati: spese notarili, imposte di registro/IVA, mediazione immobiliare e costi di ristrutturazione straordinaria." },
    { "id": "anni_possesso", "label": "Anni di Possesso dell'Immobile", "type": "number", "unit": "anni", "min": 0, "step": 1, "tooltip": "Il numero di anni trascorsi dalla data di acquisto alla data di vendita. Se sono più di 5, la plusvalenza non è tassabile." },
    { "id": "ricevuto_per_successione", "label": "L'immobile è stato ricevuto per successione?", "type": "boolean", "tooltip": "Se l'immobile è stato ereditato, la sua vendita non genera mai una plusvalenza tassabile, indipendentemente dal tempo di possesso." },
    { "id": "is_prima_casa", "label": "Era la tua abitazione principale?", "type": "boolean", "condition": "ricevuto_per_successione == false", "tooltip": "Seleziona se l'immobile venduto era la tua abitazione principale (dove avevi la residenza anagrafica)." },
    { "id": "residenza_maggior_periodo", "label": "Vi hai avuto la residenza per la maggior parte del tempo?", "type": "boolean", "condition": "is_prima_casa == true", "tooltip": "Per l'esenzione, è necessario aver mantenuto la residenza nell'immobile per più della metà del periodo di possesso." },
    { "id": "modalita_tassazione", "label": "Modalità di Tassazione", "type": "select", "options": ["Imposta Sostitutiva (26%)", "Tassazione Ordinaria (IRPEF)"], "tooltip": "Puoi scegliere una tassa fissa del 26% (imposta sostitutiva) o sommare la plusvalenza al tuo reddito annuale (tassazione IRPEF)." },
    { "id": "aliquota_irpef_personale", "label": "La tua Aliquota IRPEF Marginale", "type": "select", "options": ["23%", "35%", "43%"], "unit": "%", "condition": "modalita_tassazione == 'Tassazione Ordinaria (IRPEF)'", "tooltip": "Seleziona lo scaglione IRPEF più alto che applichi sul tuo reddito. Questo determinerà la tassazione della plusvalenza." }
  ],
  "outputs": [
    { "id": "plusvalenza_lorda", "label": "Plusvalenza Lorda Realizzata", "unit": "€" }, { "id": "plusvalenza_tassabile", "label": "Plusvalenza Tassabile", "unit": "€" }, { "id": "imposta_dovuta", "label": "Imposta Totale Dovuta", "unit": "€" }, { "id": "netto_dalla_plusvalenza", "label": "Guadagno Netto dalla Plusvalenza", "unit": "€" }, { "id": "messaggio_risultato", "label": "Esito del Calcolo", "unit": "" }
  ],
  "content": "### **Guida Completa alla Plusvalenza sulla Vendita di Immobili**\n\n**Come Calcolarla, Quando è Dovuta e Come Scegliere la Tassazione più Vantaggiosa**\n\nLa vendita di un immobile può generare un guadagno significativo, noto come **plusvalenza**, che in molti casi è soggetto a tassazione. Capire come funziona questo meccanismo è fondamentale per evitare sorprese e ottimizzare il carico fiscale. Questo calcolatore ti permette di stimare l'imposta dovuta, ma ricorda: **lo strumento ha scopo puramente informativo e non sostituisce una consulenza da parte di un notaio o di un commercialista.**\n\n### **Parte 1: Cos'è la Plusvalenza e Quando si Paga?**\n\nLa plusvalenza immobiliare è la **differenza positiva** tra il prezzo di vendita di un immobile e il suo costo d'acquisto, aumentato dei costi deducibili. In parole semplici, è il guadagno netto che si ottiene dalla vendita.\n\nLa legge (Art. 67 del TUIR) prevede che questa plusvalenza sia tassata solo se si verificano determinate condizioni. Principalmente, la tassa è dovuta quando si vende un immobile **entro 5 anni** dalla data di acquisto.\n\n### **Parte 2: I Casi di Esenzione Totale**\n\nFortunatamente, esistono importanti casi in cui la plusvalenza, anche se realizzata, **non è tassabile**. I principali sono:\n\n1.  **Vendita dopo 5 Anni**: Se vendi l'immobile dopo che sono trascorsi 5 anni dalla data di acquisto, la plusvalenza è sempre esente da tasse. Il legislatore considera l'operazione non speculativa.\n\n2.  **Abitazione Principale (Prima Casa)**: Se l'immobile venduto è stato utilizzato come tua **abitazione principale** per la maggior parte del periodo di possesso, la plusvalenza non è tassabile, anche se la vendita avviene prima dei 5 anni. Per 'abitazione principale' si intende l'immobile in cui tu o i tuoi familiari avete avuto la residenza anagrafica.\n\n3.  **Immobile Ricevuto per Successione**: Se hai ereditato l'immobile, la sua successiva vendita non genera mai plusvalenza tassabile, indipendentemente da quando decidi di venderlo.\n\n### **Parte 3: Come si Calcola la Base Imponibile**\n\nSe non rientri nei casi di esenzione, devi calcolare la plusvalenza tassabile. La formula è:\n\n`Plusvalenza Lorda = Prezzo di Vendita - (Prezzo di Acquisto + Costi Deducibili)`\n\nI **costi deducibili** sono tutte le spese documentate che hai sostenuto e che sono inerenti all'immobile. Includono:\n\n* **Costi legati all'acquisto**: Imposta di registro, IVA, spese notarili, commissioni all'agenzia immobiliare.\n* **Costi incrementativi**: Spese per interventi di manutenzione straordinaria, ristrutturazione o ampliamento che hanno aumentato il valore dell'immobile (es. rifacimento del tetto, installazione di un impianto fotovoltaico, ecc.). È fondamentale conservare fatture e ricevute di pagamento tracciabile.\n\n### **Parte 4: Le Due Opzioni di Tassazione: Quale Conviene?**\n\nUna volta calcolata la plusvalenza tassabile, hai due modi per pagare le imposte. La scelta va fatta al momento dell'atto di vendita davanti al notaio.\n\n1.  **Tassazione Ordinaria (in dichiarazione dei redditi)**\n    La plusvalenza viene cumulata con gli altri tuoi redditi (stipendio, redditi da lavoro autonomo, ecc.) e tassata secondo gli **scaglioni IRPEF**. Questa opzione può essere conveniente se hai un reddito complessivo basso e ti trovi nello scaglione più basso (23%) o se hai delle minusvalenze da compensare.\n\n2.  **Imposta Sostitutiva del 26%**\n    Puoi chiedere al notaio di applicare un'imposta fissa e separata del **26%** direttamente sulla plusvalenza. Il notaio riscuoterà l'imposta e la verserà per te. Questa è spesso la scelta più vantaggiosa per chi ha redditi medio-alti, poiché evita di far salire l'aliquota IRPEF marginale applicata sul proprio reddito principale. Inoltre, è la soluzione più semplice e definitiva."
};

const PlusvalenzaVenditaImmobileCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates: { [key: string]: any } = {
        prezzo_vendita: 220000, prezzo_acquisto: 150000, costi_inerenti: 15000, anni_possesso: 4,
        ricevuto_per_successione: false, is_prima_casa: false, residenza_maggior_periodo: false,
        modalita_tassazione: "Imposta Sostitutiva (26%)", aliquota_irpef_personale: "35%"
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { prezzo_vendita, prezzo_acquisto, costi_inerenti, anni_possesso, ricevuto_per_successione, is_prima_casa, residenza_maggior_periodo, modalita_tassazione, aliquota_irpef_personale } = states;

        const esente_per_possesso = anni_possesso >= 5;
        const esente_per_prima_casa = is_prima_casa && residenza_maggior_periodo;
        const esente_per_successione = ricevuto_per_successione;
        const is_esente = esente_per_possesso || esente_per_prima_casa || esente_per_successione;

        const costo_fiscale_immobile = prezzo_acquisto + costi_inerenti;
        const plusvalenza_lorda = prezzo_vendita - costo_fiscale_immobile;
        const plusvalenza_tassabile = is_esente ? 0 : Math.max(0, plusvalenza_lorda);
        
        const aliquota_irpef_num = parseInt(String(aliquota_irpef_personale).replace('%', '')) / 100;
        const imposta_irpef = plusvalenza_tassabile * aliquota_irpef_num;
        const imposta_sostitutiva = plusvalenza_tassabile * 0.26;
        
        const imposta_dovuta = plusvalenza_tassabile > 0 ? (modalita_tassazione === 'Imposta Sostitutiva (26%)' ? imposta_sostitutiva : imposta_irpef) : 0;
        const netto_dalla_plusvalenza = plusvalenza_lorda > 0 ? plusvalenza_lorda - imposta_dovuta : 0;

        let messaggio_risultato = "La plusvalenza è tassabile. Controlla i risultati per vedere l'imposta calcolata.";
        if (plusvalenza_lorda <= 0) {
            messaggio_risultato = "Non è stata realizzata una plusvalenza o si è verificata una minusvalenza. Nessuna imposta è dovuta.";
        } else if (is_esente) {
             let motivo = esente_per_possesso ? "per vendita dopo 5 anni." : (esente_per_successione ? "perché l'immobile è ereditato." : "perché era la tua abitazione principale.");
            messaggio_risultato = `La plusvalenza non è tassabile ${motivo}`;
        }

        return { plusvalenza_lorda, plusvalenza_tassabile, imposta_dovuta, netto_dalla_plusvalenza, messaggio_risultato, imposta_sostitutiva, imposta_irpef };
    }, [states]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    const chartData = calculatedOutputs.plusvalenza_tassabile > 0 ? [
        { name: 'Imposta Sostitutiva', 'Tassazione': calculatedOutputs.imposta_sostitutiva, fill: '#8884d8' },
        { name: 'Tassazione IRPEF', 'Tassazione': calculatedOutputs.imposta_irpef, fill: '#82ca9d' },
    ] : [];

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Scopri se la vendita del tuo immobile genera una plusvalenza tassabile e calcola l'imposta dovuta.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo informativo. La consulenza di un notaio o di un commercialista è indispensabile per una valutazione fiscale accurata e definitiva.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || 
                                    (input.condition.includes('==') && String(states[input.condition.split(' ')[0]]) === String(input.condition.split("'")[1] || input.condition.split(" ")[2]));
                                if (!conditionMet) return null;

                                const label = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border self-center">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }
                                if (input.type === 'select') {
                                    return (<div key={input.id}>
                                        {label}
                                        <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white">
                                            {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>);
                                }
                                return (<div key={input.id}>
                                    {label}
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">{input.unit}</span>
                                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-8 pr-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                    </div>
                                </div>);
                            })}
                        </div>
                        
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati del Calcolo</h2>
                            <div className="space-y-3">
                                <div className={`p-4 rounded-lg text-center font-medium ${calculatedOutputs.plusvalenza_tassabile > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                    {isClient ? calculatedOutputs.messaggio_risultato : '...'}
                                </div>
                                {outputs.filter(o => o.id !== 'messaggio_risultato').map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'netto_dalla_plusvalenza' ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                                        <div className="text-sm font-medium text-gray-600">{output.label}</div>
                                        <div className={`text-xl font-bold ${output.id === 'netto_dalla_plusvalenza' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            {isClient ? formatCurrency(calculatedOutputs[output.id as keyof typeof calculatedOutputs] as number) : '...'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {calculatedOutputs.plusvalenza_tassabile > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Confronto Modalità di Tassazione</h3>
                                <div className="h-64 w-full bg-slate-50 p-2 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <XAxis type="number" tickFormatter={formatCurrency} />
                                                <YAxis type="category" dataKey="name" width={120} />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }} />
                                                <Bar dataKey="Tassazione" barSize={40}>
                                                   {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                 <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                             <button onClick={() => {}} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Simulazione</button>
                             <button onClick={() => {}} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                             <button onClick={handleReset} className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Plusvalenza</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 917/1986 (TUIR), Art. 67-68</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default PlusvalenzaVenditaImmobileCalculator;