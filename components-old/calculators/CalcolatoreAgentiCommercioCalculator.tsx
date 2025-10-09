'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Netto da Lordo per Agenti di Commercio (con ENASARCO)",
  description: "Stima il tuo reddito netto annuale e mensile partendo dalle provvigioni lorde. Calcolo preciso per regime forfettario e ordinario, con contributi ENASARCO e INPS."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
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
            "name": "Come si calcolano i contributi ENASARCO per un agente di commercio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I contributi ENASARCO si calcolano applicando un'aliquota del 17% (dato 2025) sulle provvigioni lorde, fino a un massimale annuo che varia se l'agente è monomandatario o plurimandatario. Il versamento è diviso a metà: 8.5% a carico dell'agente (trattenuto dalla fattura) e 8.5% a carico dell'azienda mandante. L'importo a carico dell'agente è interamente deducibile dal reddito imponibile."
            }
          },
          {
            "@type": "Question",
            "name": "Agente di commercio: meglio il Regime Forfettario o l'Ordinario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La scelta dipende dai costi reali. Il Regime Forfettario è conveniente se i costi operativi sono inferiori al 38% del fatturato, grazie alla tassazione agevolata al 5% o 15%. Se i costi deducibili (auto, carburante, ecc.) sono superiori al 38%, il Regime Ordinario diventa più vantaggioso perché permette di abbattere il reddito imponibile tramite la deduzione analitica di tali spese."
            }
          },
          {
            "@type": "Question",
            "name": "I contributi INPS sono sempre obbligatori per un agente di commercio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, l'iscrizione alla Gestione Commercianti IVS dell'INPS è obbligatoria. Esiste un contributo minimale fisso da versare in 4 rate annuali, anche in assenza di reddito. Se il reddito supera il minimale stabilito per legge, si paga un'ulteriore percentuale sulla parte eccedente."
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
                if (trimmedBlock) {
                    return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// Dati di configurazione del calcolatore
const calculatorData = {
  "slug": "calcolatore-agenti-commercio",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Netto da Lordo per Agenti di Commercio (con ENASARCO)",
  "lang": "it",
  "inputs": [
    {
      "id": "fatturato_lordo",
      "label": "Provvigioni Lorde Annuali",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 1000,
      "tooltip": "Inserisci il totale delle provvigioni fatturate nell'anno, al lordo di qualsiasi ritenuta o contributo."
    },
    {
      "id": "is_forfettario",
      "label": "Applichi il Regime Forfettario?",
      "type": "boolean" as const,
      "tooltip": "Seleziona questa opzione se aderisci al regime fiscale agevolato. Le modalità di calcolo cambieranno radicalmente."
    },
    {
      "id": "costi_deducibili",
      "label": "Costi Deducibili Annuali",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 100,
      "condition": "is_forfettario == false",
      "tooltip": "Solo per Regime Ordinario/Semplificato. Inserisci i costi inerenti all'attività (es. carburante, auto, telefono, etc.)."
    },
    {
      "id": "is_forfettario_start_up",
      "label": "Sei in Regime Forfettario Start-up?",
      "type": "boolean" as const,
      "condition": "is_forfettario == true",
      "tooltip": "Spunta se sei nei primi 5 anni di attività e hai i requisiti per l'imposta sostitutiva ridotta al 5%."
    },
    {
      "id": "contributi_inps_versati",
      "label": "Contributi INPS versati nell'anno",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 100,
      "tooltip": "Inserisci il totale dei contributi INPS pagati durante l'anno (riferiti all'anno precedente). Questi importi sono deducibili dal reddito imponibile."
    },
    {
      "id": "is_plurimandatario",
      "label": "Sei un agente plurimandatario?",
      "type": "boolean" as const,
      "tooltip": "La scelta influisce sul massimale contributivo ENASARCO. Spunta se lavori per più aziende mandanti."
    }
  ],
  "outputs": [
    { "id": "contributi_enasarco_agente", "label": "Contributi ENASARCO a tuo carico (8.5%)", "unit": "€" },
    { "id": "contributi_inps_dovuti", "label": "Contributi INPS IVS Dovuti", "unit": "€" },
    { "id": "reddito_imponibile_netto", "label": "Reddito Imponibile Fiscale Netto", "unit": "€" },
    { "id": "imposta_dovuta", "label": "Imposta Dovuta (IRPEF o Sostitutiva)", "unit": "€" },
    { "id": "reddito_netto", "label": "Reddito Netto Annuo Stimato", "unit": "€" },
    { "id": "reddito_netto_mensile", "label": "Reddito Netto Mensile Stimato", "unit": "€" }
  ],
  "content": "### **Guida Completa al Reddito Netto per Agenti di Commercio**\n\n**Analisi dei Regimi Fiscali, Contributi ENASARCO e INPS, e Metodologie di Calcolo**\n\nDeterminare il reddito netto partendo dalle provvigioni lorde è l'operazione più importante per un agente di commercio. A differenza di un dipendente, l'agente deve gestire una serie di variabili complesse: la scelta del regime fiscale, i contributi previdenziali obbligatori (INPS) e quelli di categoria (ENASARCO). \n\nQuesto strumento offre una simulazione dettagliata e trasparente per fornire una stima attendibile del proprio guadagno netto. L'obiettivo è superare un semplice calcolo, offrendo una guida autorevole per comprendere **dove finisce ogni euro fatturato**. Ricorda: questa è una simulazione; la consulenza di un commercialista è imprescindibile per la pianificazione fiscale personale.\n\n### **Parte 1: I Regimi Fiscali a Confronto**\n\nLa prima, fondamentale scelta che determina l'intero calcolo è il regime fiscale.\n\n#### **1. Regime Forfettario**\n\nÈ un regime agevolato pensato per le Partite IVA con ricavi contenuti (fino a 85.000 €). La sua forza è la semplicità:\n\n* **Tassazione Semplificata**: Non si applica l'IRPEF a scaglioni, ma un'**imposta sostitutiva** del **15%** (o del **5%** per i primi 5 anni in caso di start-up).\n* **Niente IVA**: Le fatture vengono emesse senza IVA, un vantaggio competitivo.\n* **Costi a Forfait**: Non è possibile dedurre analiticamente i costi sostenuti. Lo Stato riconosce una deduzione forfettaria basata sul **Coefficiente di Redditività**, che per gli agenti di commercio (Codice ATECO 46.1) è del **62%**. Questo significa che il reddito imponibile è calcolato come il 62% delle provvigioni lorde.\n\n**Vantaggio**: Estrema semplicità e carico fiscale potenzialmente molto basso.\n**Svantaggio**: Impossibilità di scaricare i costi reali. Se le spese operative sono elevate (superiori al 38% del fatturato), potrebbe non essere conveniente.\n\n#### **2. Regime Ordinario (o Semplificato)**\n\nÈ il regime standard. La logica è \"Ricavi - Costi = Reddito Imponibile\".\n\n* **Tassazione IRPEF**: Il reddito imponibile è soggetto agli scaglioni IRPEF, con aliquote progressive dal 23% al 43%.\n* **Gestione IVA**: Si applica l'IVA sulle fatture e si gestisce la liquidazione periodica.\n* **Deducibilità Analitica**: Tutti i costi inerenti all'attività possono essere dedotti dal fatturato, abbattendo la base imponibile. Questo include spese per l'auto, carburante, telefono, software, etc.\n\n**Vantaggio**: Piena deducibilità dei costi, ideale per chi ha spese significative.\n**Svantaggio**: Maggiore complessità contabile e tassazione potenzialmente più alta.\n\n### **Parte 2: La Giungla dei Contributi: INPS ed ENASARCO**\n\nOltre alle tasse, una parte significativa del lordo è destinata ai contributi.\n\n#### **ENASARCO: La Previdenza di Categoria**\n\nL'ENASARCO è la cassa di previdenza integrativa obbligatoria per tutti gli agenti e rappresentanti di commercio. \n\n* **Aliquota (2025)**: È del **17%** sulle provvigioni.\n* **Ripartizione**: È divisa equamente: **8,5% a carico dell'agente** (trattenuto in fattura) e 8,5% a carico dell'azienda mandante.\n* **Massimale Contributivo**: Esiste un tetto massimo annuo di provvigioni su cui calcolare i contributi. Oltre questa soglia, non si versa più. Il massimale varia se l'agente è **monomandatario** (lavora per una sola azienda) o **plurimandatario**.\n* **Deducibilità Totale**: I contributi ENASARCO a carico dell'agente sono **interamente deducibili** dal reddito imponibile in entrambi i regimi fiscali.\n\n#### **INPS: La Previdenza Obbligatoria (Gestione Commercianti IVS)**\n\nL'iscrizione all'INPS è obbligatoria per la pensione di base.\n\n* **Contributo Minimale Fisso**: Esiste un **reddito minimale** (circa 18.415 € nel 2025) sotto il quale si paga comunque un contributo fisso (circa 4.515 € annui), suddiviso in 4 rate trimestrali. \n* **Contributo a Percentuale**: Sul reddito che **eccede il minimale**, si paga un'aliquota a percentuale (circa 24,48%).\n* **Deducibilità**: I contributi INPS versati nell'anno (relativi al reddito dell'anno precedente) sono **interamente deducibili** dal reddito imponibile.\n\n### **Parte 3: Logica di Calcolo del Netto**\n\nEcco, passo dopo passo, come questo calcolatore determina il tuo netto.\n\n1.  **Calcolo Contributi ENASARCO**: Si applica l'aliquota dell'8,5% sulle provvigioni lorde, rispettando il massimale (mono o pluri). Questo è il primo costo \"reale\" che riduce la liquidità.\n\n2.  **Determinazione del Reddito Imponibile Lordo**:\n    * **Ordinario**: `Provvigioni Lorde - Costi Deducibili - Contributi ENASARCO a carico agente`.\n    * **Forfettario**: `Provvigioni Lorde * 62% (Coefficiente di Redditività)`.\n\n3.  **Calcolo Contributi INPS Dovuti**: Sulla base del reddito imponibile lordo calcolato al punto 2, si determinano i contributi INPS dovuti per l'anno in corso (minimale + eccedenza).\n\n4.  **Determinazione del Reddito Imponibile Fiscale Netto**: Dal reddito imponibile lordo (punto 2) vengono sottratti i **contributi INPS effettivamente versati** nell'anno (che si riferiscono ai redditi dell'anno precedente). Questo è il valore su cui si calcolano le tasse.\n\n5.  **Calcolo dell'Imposta**: \n    * **Ordinario**: Si applicano gli scaglioni IRPEF al reddito imponibile netto.\n    * **Forfettario**: Si applica l'imposta sostitutiva del 5% o 15% al reddito imponibile netto.\n\n6.  **Calcolo del Netto Finale**: `Provvigioni Lorde - Costi (solo in ordinario) - Contributi ENASARCO - Contributi INPS Dovuti - Imposta Dovuta = Netto in tasca`.\n"
};

const CalcolatoreAgentiCommercio: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturato_lordo: 75000,
        is_forfettario: true,
        costi_deducibili: 15000,
        is_forfettario_start_up: true,
        contributi_inps_versati: 4515,
        is_plurimandatario: true,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { fatturato_lordo, is_forfettario, costi_deducibili, is_forfettario_start_up, contributi_inps_versati, is_plurimandatario } = states;
        
        const C = {
            ENASARCO_ALIQUOTA: 0.17,
            ENASARCO_MASSIMALE_MONO: 44349,
            ENASARCO_MASSIMALE_PLURI: 29566,
            FORFETTARIO_COEFFICIENTE: 0.62,
            INPS_MINIMALE_REDDITO: 18415,
            INPS_ALIQUOTA_FISSA: 0.2448,
            INPS_ALIQUOTA_VARIABILE: 0.2548,
            INPS_MASSIMALE_REDDITO: 119650,
            IRPEF_SCAGLIONE_1_LIMITE: 28000,
            IRPEF_SCAGLIONE_2_LIMITE: 50000,
            IRPEF_ALIQUOTA_1: 0.23,
            IRPEF_ALIQUOTA_2: 0.35,
            IRPEF_ALIQUOTA_3: 0.43
        };

        const massimale_enasarco = is_plurimandatario ? C.ENASARCO_MASSIMALE_PLURI : C.ENASARCO_MASSIMALE_MONO;
        const imponibile_enasarco = Math.min(fatturato_lordo, massimale_enasarco);
        const contributi_enasarco_agente = imponibile_enasarco * (C.ENASARCO_ALIQUOTA / 2);
        
        const reddito_imponibile_lordo_inps = is_forfettario ? (fatturato_lordo * C.FORFETTARIO_COEFFICIENTE) : (fatturato_lordo - costi_deducibili - contributi_enasarco_agente);

        let contributi_inps_dovuti = C.INPS_MINIMALE_REDDITO * C.INPS_ALIQUOTA_FISSA;
        if (reddito_imponibile_lordo_inps > C.INPS_MINIMALE_REDDITO) {
            const eccedenza = Math.min(reddito_imponibile_lordo_inps, C.INPS_MASSIMALE_REDDITO) - C.INPS_MINIMALE_REDDITO;
            contributi_inps_dovuti += eccedenza * (reddito_imponibile_lordo_inps > 119650 ? C.INPS_ALIQUOTA_VARIABILE : 0.2448) ; // logic for higher rate if needed
        }

        const reddito_imponibile_netto = Math.max(0, reddito_imponibile_lordo_inps - contributi_inps_versati);

        let imposta_dovuta;
        if (is_forfettario) {
            imposta_dovuta = reddito_imponibile_netto * (is_forfettario_start_up ? 0.05 : 0.15);
        } else {
            if (reddito_imponibile_netto <= C.IRPEF_SCAGLIONE_1_LIMITE) {
                imposta_dovuta = reddito_imponibile_netto * C.IRPEF_ALIQUOTA_1;
            } else if (reddito_imponibile_netto <= C.IRPEF_SCAGLIONE_2_LIMITE) {
                imposta_dovuta = (C.IRPEF_SCAGLIONE_1_LIMITE * C.IRPEF_ALIQUOTA_1) + ((reddito_imponibile_netto - C.IRPEF_SCAGLIONE_1_LIMITE) * C.IRPEF_ALIQUOTA_2);
            } else {
                imposta_dovuta = (C.IRPEF_SCAGLIONE_1_LIMITE * C.IRPEF_ALIQUOTA_1) + ((C.IRPEF_SCAGLIONE_2_LIMITE - C.IRPEF_SCAGLIONE_1_LIMITE) * C.IRPEF_ALIQUOTA_2) + ((reddito_imponibile_netto - C.IRPEF_SCAGLIONE_2_LIMITE) * C.IRPEF_ALIQUOTA_3);
            }
        }
        imposta_dovuta = Math.max(0, imposta_dovuta);

        const costi_effettivi = is_forfettario ? 0 : costi_deducibili;
        const reddito_netto = fatturato_lordo - costi_effettivi - contributi_enasarco_agente - contributi_inps_dovuti - imposta_dovuta;
        const reddito_netto_mensile = reddito_netto / 12;

        return { contributi_enasarco_agente, contributi_inps_dovuti, reddito_imponibile_netto, imposta_dovuta, reddito_netto, reddito_netto_mensile, costi_effettivi };

    }, [states]);
    
    const chartData = [
        { name: 'Netto', value: calculatedOutputs.reddito_netto, fill: '#22c55e' },
        { name: 'Imposte', value: calculatedOutputs.imposta_dovuta, fill: '#ef4444' },
        { name: 'INPS', value: calculatedOutputs.contributi_inps_dovuti, fill: '#3b82f6' },
        { name: 'ENASARCO', value: calculatedOutputs.contributi_enasarco_agente, fill: '#eab308' },
        ...(!states.is_forfettario ? [{ name: 'Costi', value: calculatedOutputs.costi_effettivi, fill: '#6b7280' }] : [])
    ];
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Stima il tuo guadagno netto annuale e mensile partendo dalle provvigioni lorde.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo la consulenza di un commercialista qualificato. I valori contributivi e fiscali sono aggiornati al 2025.
                        </div>

                        {/* Sezione Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || 
                                  (input.condition.includes('== true') && states[input.condition.split(' ')[0]]) ||
                                  (input.condition.includes('== false') && !states[input.condition.split(' ')[0]]);

                                if (!conditionMet) return null;

                                if (input.type === 'boolean') {
                                    return (
                                      <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                        <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                        <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                      </div>
                                    );
                                }

                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sezione Risultati */}
                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id.includes('netto') ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id.includes('netto') ? 'text-green-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grafico */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato Lordo</h3>
                            <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" width={80} stroke="#374151" />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} />
                                            <Bar dataKey="value" name="Valore" barSize={35}>
                                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                           <button onClick={handleReset} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Campi</button>
                        </div>
                    </section>
                    
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Comprensione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.enasarco.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Fondazione ENASARCO</a></li>
                            <li><a href="https://www.inps.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Artigiani e Commercianti</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalcolatoreAgentiCommercio;