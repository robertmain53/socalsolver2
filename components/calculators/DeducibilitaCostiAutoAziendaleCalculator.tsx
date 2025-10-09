'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

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
        "name": "Qual è la deducibilità standard per un'auto aziendale non strumentale?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Per un'auto aziendale non assegnata a dipendenti e non utilizzata da agenti/rappresentanti (ad esempio, a disposizione dell'amministratore o per uso promiscuo da parte del professionista/imprenditore individuale), la deducibilità dei costi è del 20% con un limite massimo sul costo di acquisto fiscalmente riconosciuto di 18.075,99 €. La detraibilità dell'IVA è del 40%."
        }
      },
      {
        "@type": "Question",
        "name": "Come funziona la deducibilità per agenti e rappresentanti di commercio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gli agenti e rappresentanti di commercio godono di un regime agevolato. Possono dedurre l'80% dei costi, con un limite massimo sul costo di acquisto fiscalmente riconosciuto di 25.822,84 €. La detraibilità dell'IVA è del 100%."
        }
      },
      {
        "@type": "Question",
        "name": "Cosa significa 'uso promiscuo' per un dipendente e come influisce sulla deducibilità?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "L'uso promiscuo si ha quando l'auto aziendale viene concessa al dipendente sia per esigenze lavorative che personali. Per l'azienda, i costi sono deducibili al 70% (senza limiti sul valore del veicolo), a condizione che l'uso promiscuo sia per la maggior parte del periodo d'imposta. L'IVA è detraibile al 40%. Sul dipendente, invece, viene tassato un 'fringe benefit' calcolato in base alle tabelle ACI."
        }
      },
      {
        "@type": "Question",
        "name": "Un veicolo 'strumentale per natura' (es. autocarro) ha le stesse limitazioni?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. I veicoli definiti 'strumentali per natura' (come autocarri, furgoni, ecc.) o quelli utilizzati esclusivamente come beni strumentali nell'attività propria dell'impresa (es. auto per le scuole guida) non sono soggetti ai limiti di deducibilità e detraibilità. I costi e l'IVA sono interamente deducibili e detraibili al 100%."
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
    const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1)); // Remove outer empty cells
    if (rows.length < 3) return null; // Header, separator, and at least one body row
    const headers = rows[0];
    const bodyRows = rows.slice(2);
    return (
        <div key={index} className="overflow-x-auto my-6">
            <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {headers.map((header, i) => (
                            <th key={i} className="p-2 border text-left font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(header) }} />
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bodyRows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            {row.map((cell, j) => (
                                <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />
                            ))}
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
"slug": "deducibilita-costi-auto-aziendale",
"category": "PMI e Impresa",
"title": "Calcolatore Deducibilità Costi Auto Aziendale",
"lang": "it",
"inputs": [
{
    "id": "tipo_utilizzo",
    "label": "Tipologia di Utilizzo / Assegnatario",
    "type": "select" as const,
    "options": [
        { "value": "professionista", "label": "Libero Professionista / Impresa Individuale" },
        { "value": "agente", "label": "Agente o Rappresentante di Commercio" },
        { "value": "promiscuo_dipendente", "label": "Uso promiscuo a Dipendente (maggior parte periodo d'imposta)" },
        { "value": "non_assegnata", "label": "Aziendale non assegnata (es. a disposizione Amministratore)" },
        { "value": "strumentale", "label": "Veicolo esclusivamente strumentale (es. scuola guida)" },
        { "value": "autocarro", "label": "Autocarro (N1) o veicolo strumentale per natura" }
    ],
    "tooltip": "Seleziona la categoria che descrive come il veicolo viene utilizzato. Questa scelta determina le percentuali di deducibilità e i limiti di costo applicabili."
},
{ "id": "costo_acquisto", "label": "Costo di Acquisto del Veicolo (IVA inclusa)", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserire il costo totale di acquisto del veicolo, comprensivo di IVA e oneri accessori." },
{ "id": "costi_esercizio", "label": "Costi di Esercizio Annuali (IVA inclusa)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserire la somma di tutti i costi annuali: carburante, manutenzione, assicurazione, bollo, pedaggi, etc." },
{ "id": "aliquota_iva", "label": "Aliquota IVA applicata", "type": "number" as const, "unit": "%", "min": 22, "step": 1, "tooltip": "Aliquota IVA pagata sull'acquisto e sui costi di esercizio. Generalmente è il 22%." },
{ "id": "aliquota_imposta", "label": "Aliquota Imposte sui Redditi (IRPEF/IRES)", "type": "number" as const, "unit": "%", "min": 23, "step": 1, "tooltip": "Inserire l'aliquota marginale IRPEF o l'aliquota IRES (tipicamente 24%) per stimare il risparmio fiscale." }
],
"outputs": [
{ "id": "costo_fiscalmente_rilevante", "label": "Costo di Acquisto Fiscalmente Rilevante", "unit": "€" },
{ "id": "quota_ammortamento_deducibile", "label": "Quota Ammortamento Annua Deducibile", "unit": "€" },
{ "id": "costi_esercizio_deducibili", "label": "Costi di Esercizio Annuali Deducibili", "unit": "€" },
{ "id": "costo_annuale_deducibile_totale", "label": "Costo Annuale Totale Deducibile (ai fini IRPEF/IRES)", "unit": "€" },
{ "id": "iva_detraibile_acquisto", "label": "IVA Detraibile sull'Acquisto", "unit": "€" },
{ "id": "iva_detraibile_esercizio", "label": "IVA Detraibile sui Costi di Esercizio Annuali", "unit": "€" },
{ "id": "risparmio_fiscale_annuo", "label": "Risparmio Fiscale Annuo Stimato", "unit": "€" }
],
"content": `### **Guida Definitiva alla Deducibilità dei Costi Auto Aziendali (2025)**

**Analisi, Esempi Pratici e Logiche di Calcolo per Professionisti e Imprese**

La gestione dei veicoli aziendali rappresenta una delle aree di maggiore complessità fiscale per imprese e professionisti. Le normative, contenute principalmente nell'**Art. 164 del Testo Unico delle Imposte sui Redditi (TUIR)**, stabiliscono limiti e percentuali precise che variano drasticamente in base al tipo di veicolo, al soggetto utilizzatore e alla modalità d'uso.

Questo strumento non si limita a fornire un calcolo, ma intende essere una guida completa per comprendere la logica sottostante, ottimizzare le scelte e massimizzare i benefici fiscali. **Ricordiamo che i risultati sono una simulazione e non sostituiscono una consulenza fiscale professionale**, indispensabile per analizzare le specificità di ogni singola situazione.

### **Parte 1: Le Variabili Chiave del Calcolo**

Per determinare correttamente la deducibilità dei costi e la detraibilità dell'IVA, è fondamentale classificare correttamente il veicolo secondo tre criteri principali:

1.  **Soggetto Utilizzatore**: L'auto è usata da un libero professionista, un'impresa individuale, un agente di commercio, un dipendente o un amministratore?
2.  **Modalità di Utilizzo**: L'uso è esclusivamente strumentale all'attività, promiscuo (sia aziendale che privato) o non strumentale?
3.  **Tipo di Veicolo**: Si tratta di un'autovettura, un motociclo o un autocarro (veicolo strumentale "per natura")?

Il nostro calcolatore si concentra sulle autovetture, che presentano la casistica più articolata.

#### **I Pilastri della Normativa: Deducibilità e Detraibilità**

* **Deducibilità (Imposte sui Redditi - IRPEF/IRES)**: È la percentuale del costo che può essere sottratta dal reddito imponibile, riducendo così le tasse da pagare. Si applica sia al costo di acquisto (tramite ammortamento) sia ai costi di esercizio.
* **Detraibilità (IVA)**: È la percentuale dell'IVA pagata sull'acquisto e sui costi di gestione che può essere recuperata, ovvero portata in detrazione dall'IVA a debito dell'azienda o del professionista.

### **Parte 2: Analisi Dettagliata per Tipologia di Utilizzo**

La tabella seguente riassume le regole principali applicate dal calcolatore, come previsto dall'Art. 164 del TUIR.

| Tipologia di Utilizzo / Soggetto | Deducibilità Costi | Limite Costo Acquisto Rilevante | Detraibilità IVA |
| :--- | :--- | :--- | :--- |
| **Autocarro / Veicolo Strumentale per Natura** | **100%** | Nessun limite | **100%** |
| **Veicolo Esclusivamente Strumentale** (es. Scuola Guida) | **100%** | Nessun limite | **100%** |
| **Agente o Rappresentante di Commercio** | **80%** | 25.822,84 € | **100%** |
| **Uso promiscuo a Dipendente** (per la maggior parte del periodo d'imposta) | **70%** | Nessun limite | **40%** |
| **Professionista / Impresa Individuale (Uso Promiscuo)** | **20%** | 18.075,99 € | **40%** |
| **Aziendale non assegnata** (es. a disposizione Amministratore) | **20%** | 18.075,99 € | **40%** |

#### **Spiegazione delle Voci**

* **Limite Costo Acquisto Rilevante**: La percentuale di deducibilità non si applica al costo totale del veicolo, ma a un valore massimo stabilito dalla legge. Ad esempio, per un professionista che acquista un'auto da 40.000 €, il calcolo del 20% si applicherà solo su 18.075,99 €. La parte eccedente è totalmente indeducibile.
* **Ammortamento**: Il costo di acquisto viene dedotto gradualmente in più anni. La quota di ammortamento ordinaria è del 25% annuo. Il nostro calcolatore stima la quota di ammortamento deducibile per un singolo anno.
* **Costi di Esercizio**: Rientrano in questa categoria tutte le spese di gestione del veicolo: carburante, bollo, assicurazione, manutenzione, riparazioni, pedaggi. La deducibilità per queste spese segue la stessa percentuale applicata al veicolo, ma senza un limite massimo in valore assoluto.

### **Parte 3: Casi Specifici e Approfondimenti**

#### **Uso Promiscuo a Dipendenti: Un'Analisi Dettagliata**

Questo è un caso di grande interesse per le aziende. Quando un veicolo viene dato in uso promiscuo a un dipendente, si verificano due effetti fiscali distinti:

1.  **Per l'Azienda**: I costi (ammortamento e spese di gestione) sono **deducibili al 70%**. Un grande vantaggio è che in questo caso **non si applica il limite massimo** sul costo di acquisto (i 18.075,99 € non valgono). La detraibilità IVA rimane al 40%.
2.  **Per il Dipendente**: L'uso privato del veicolo costituisce un **"fringe benefit"**, ovvero una forma di retribuzione in natura. Questo benefit viene tassato in busta paga e si calcola in modo forfettario. Il valore è pari al 30% dell'importo corrispondente a una percorrenza convenzionale di 15.000 km, calcolato sulla base del costo chilometrico indicato nelle **tabelle ACI** per quel modello specifico.

#### **Noleggio a Lungo Termine (NLT) e Leasing**

Le regole di deducibilità si applicano anche ai canoni di noleggio e leasing, con limiti specifici:

* **Noleggio a Lungo Termine**: Per professionisti e aziende (nel caso del 20%), il limite di deducibilità del canone annuo è **3.615,20 €**. Per gli agenti (80%), il limite sale a **5.164,57 €**.
* **Leasing**: I limiti sul costo di acquisto (18.075,99 € o 25.822,84 €) si applicano anche ai canoni di leasing, che sono deducibili entro tali soglie e nel rispetto della durata minima fiscale del contratto.

### **Conclusione: Pianificare con Consapevolezza**

La scelta del veicolo aziendale e della sua modalità di utilizzo deve essere il risultato di un'attenta pianificazione che consideri non solo le esigenze operative, ma anche l'impatto fiscale. Un veicolo strumentale per natura (autocarro) offre la massima deducibilità, mentre l'assegnazione in uso promiscuo a un dipendente può essere più vantaggiosa rispetto all'acquisto di un'auto di lusso lasciata a disposizione generica, grazie all'eliminazione del tetto massimo di costo. Utilizzate questo calcolatore per simulare i diversi scenari e discutete i risultati con il vostro consulente fiscale per prendere la decisione più informata.`,
"tags": "deducibilità auto, costi auto aziendale, fringe benefit, IVA auto, calcolo deduzione auto, auto agenti commercio, auto professionisti, auto uso promiscuo, art 164 tuir"
};

const DeducibilitaCostiAutoAziendaleCalculator: React.FC = () => {
const { slug, title, inputs, outputs, content } = calculatorData;
const calcolatoreRef = useRef<HTMLDivElement>(null);
const [isClient, setIsClient] = useState(false);

useEffect(() => { setIsClient(true); }, []);

const initialStates: { [key: string]: any } = {
tipo_utilizzo: 'professionista',
costo_acquisto: 35000,
costi_esercizio: 4000,
aliquota_iva: 22,
aliquota_imposta: 24,
};

const [states, setStates] = useState<{[key: string]: any}>(initialStates);

const handleStateChange = (id: string, value: any) => {
setStates(prev => ({...prev, [id]: value}));
};

const handleReset = () => {
setStates(initialStates);
};

const calculatedOutputs = useMemo(() => {
const { tipo_utilizzo, costo_acquisto, costi_esercizio, aliquota_iva, aliquota_imposta } = states;
const costo_imponibile_acquisto = costo_acquisto / (1 + aliquota_iva / 100);
const iva_su_acquisto = costo_acquisto - costo_imponibile_acquisto;
const costo_imponibile_esercizio = costi_esercizio / (1 + aliquota_iva / 100);
const iva_su_esercizio = costi_esercizio - costo_imponibile_esercizio;

let perc_deducibilita = 0.20;
let perc_detraibilita_iva = 0.40;
let limite_costo_acquisto = 18075.99;

switch (tipo_utilizzo) {
    case 'autocarro':
    case 'strumentale':
        perc_deducibilita = 1.0;
        perc_detraibilita_iva = 1.0;
        limite_costo_acquisto = costo_imponibile_acquisto; // Nessun limite
        break;
    case 'agente':
        perc_deducibilita = 0.80;
        perc_detraibilita_iva = 1.0;
        limite_costo_acquisto = 25822.84;
        break;
    case 'promiscuo_dipendente':
        perc_deducibilita = 0.70;
        perc_detraibilita_iva = 0.40;
        limite_costo_acquisto = costo_imponibile_acquisto; // Nessun limite
        break;
    case 'professionista':
    case 'non_assegnata':
        perc_deducibilita = 0.20;
        perc_detraibilita_iva = 0.40;
        limite_costo_acquisto = 18075.99;
        break;
}

const costo_fiscalmente_rilevante = Math.min(costo_imponibile_acquisto, limite_costo_acquisto);
const quota_ammortamento_annua = costo_fiscalmente_rilevante * 0.25; // Ammortamento al 25%
const quota_ammortamento_deducibile = quota_ammortamento_annua * perc_deducibilita;
const costi_esercizio_deducibili = costo_imponibile_esercizio * perc_deducibilita;
const costo_annuale_deducibile_totale = quota_ammortamento_deducibile + costi_esercizio_deducibili;

const iva_detraibile_acquisto = iva_su_acquisto * perc_detraibilita_iva;
const iva_detraibile_esercizio = iva_su_esercizio * perc_detraibilita_iva;

const risparmio_fiscale_annuo = costo_annuale_deducibile_totale * (aliquota_imposta / 100);

return {
    costo_fiscalmente_rilevante,
    quota_ammortamento_deducibile,
    costi_esercizio_deducibili,
    costo_annuale_deducibile_totale,
    iva_detraibile_acquisto,
    iva_detraibile_esercizio,
    risparmio_fiscale_annuo
};
}, [states]);

const chartData = useMemo(() => {
    const costoImponibileAmmortamento = (states.costo_acquisto / (1 + states.aliquota_iva / 100)) * 0.25;
    const costoImponibileEsercizio = states.costi_esercizio / (1 + states.aliquota_iva / 100);
    const risparmioAmmortamento = calculatedOutputs.quota_ammortamento_deducibile * (states.aliquota_imposta / 100) + (calculatedOutputs.iva_detraibile_acquisto * 0.25);
    const risparmioEsercizio = calculatedOutputs.costi_esercizio_deducibili * (states.aliquota_imposta / 100) + calculatedOutputs.iva_detraibile_esercizio;

    return [
        { name: 'Quota Ammortamento', 'Costo Sostenuto': costoImponibileAmmortamento, 'Risparmio Fiscale': risparmioAmmortamento },
        { name: 'Costi Esercizio', 'Costo Sostenuto': costoImponibileEsercizio, 'Risparmio Fiscale': risparmioEsercizio },
    ];
}, [states, calculatedOutputs]);

const formulaUsata = `Risparmio Fiscale = ( (MIN(CostoAcquisto; Limite) * 25% * %Deducibilità) + (CostiEsercizio * %Deducibilità) ) * AliquotaImposta`;

const handleExportPDF = useCallback(async () => {
try {
const html2canvas = (await import("html2canvas")).default;
const jsPDF = (await import("jspdf")).default;
const elementToCapture = calcolatoreRef.current;
if (!elementToCapture) return;

const canvas = await html2canvas(elementToCapture, { scale: 2 });
const imgData = canvas.toDataURL("image/png");
const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
const pdfWidth = pdf.internal.pageSize.getWidth();
const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
pdf.save(`${slug}.pdf`);
} catch (e) {
  console.error(e);
  alert("Impossibile generare il PDF in questo ambiente.");
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

const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);


return (
<>
<FaqSchema />
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
<div className="lg:col-span-2">
<div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
<div>
<h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
<p className="text-gray-600 mb-4">Simula la deducibilità e il risparmio fiscale per il tuo veicolo aziendale secondo la normativa vigente.</p>
<div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
<strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e didattico. I calcoli si basano su normative fiscali complesse e non sostituiscono in alcun modo una consulenza professionale da parte di un commercialista o un consulente fiscale qualificato.
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
{inputs.map(input => {
    const inputLabel = (
        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
        {input.label}
        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
        </label>
    );

    if (input.type === 'select') {
        return (
            <div key={input.id} className="md:col-span-2">
                {inputLabel}
                <select
                    id={input.id}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    value={states[input.id]}
                    onChange={(e) => handleStateChange(input.id, e.target.value)}
                >
                    {input.options?.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div key={input.id}>
            {inputLabel}
            <div className="flex items-center gap-2">
                <input
                    id={input.id}
                    aria-label={input.label}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    type="number"
                    min={input.min}
                    step={input.step}
                    value={states[input.id]}
                    onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                />
                {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
            </div>
        </div>
    );
})}
</div>

<div className="mt-8 space-y-4">
<h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione Annuale</h2>
{outputs.map(output => {
    const isMainResult = output.id === 'risparmio_fiscale_annuo';
    return(
        <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${isMainResult ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
            <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
            <div className={`text-xl md:text-2xl font-bold ${isMainResult ? 'text-indigo-600' : 'text-gray-800'}`}>
                <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id as keyof typeof calculatedOutputs]) : '...'}</span>
            </div>
        </div>
    );
})}
</div>

<div className="mt-8">
<h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione Costi e Benefici Fiscali Annuali</h3>
<div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
    {isClient && (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} layout="vertical">
            <XAxis type="number" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
            <YAxis type="category" dataKey="name" width={120} interval={0} />
            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="Costo Sostenuto" stackId="a" fill="#a5b4fc" name="Costo al netto del Risparmio Fiscale" />
            <Bar dataKey="Risparmio Fiscale" stackId="a" fill="#4f46e5" name="Risparmio Fiscale (Imposte + IVA)" />
        </BarChart>
    </ResponsiveContainer>
    )}
</div>
</div>
</div>
<div className="mt-6 border rounded-lg shadow-md p-4 bg-gray-50">
<h3 className="font-semibold text-gray-700">Formula di Calcolo Semplificata</h3>
<p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
</div>
</div>
</div>

<aside className="lg:col-span-1 space-y-6">
<section className="border rounded-lg p-4 bg-white shadow-md">
<h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
<div className="grid grid-cols-2 gap-3">
<button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
<button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
<button onClick={handleReset} className="col-span-2 w-full border border-red-300 text-red-700 rounded-md px-3 py-2 text-sm hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
</div>
</section>
<section className="border rounded-lg p-4 bg-white shadow-md">
<h2 className="font-semibold mb-2 text-gray-800">Guida alla Deducibilità</h2>
<ContentRenderer content={content} />
</section>
<section className="border rounded-lg p-4 bg-white shadow-md">
<h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
<ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
<li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 917/1986 (TUIR), Art. 164</a> - Limiti di deduzione delle spese e degli altri componenti negativi relativi a taluni mezzi di trasporto.</li>
<li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/fringe-benefit/fringe-benefit-calcolo-e-tabelle-aci" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Fringe benefit</a> - Calcolo e tabelle ACI.</li>
</ul>
</section>
</aside>
</div>
</>
);
};

export default DeducibilitaCostiAutoAziendaleCalculator;