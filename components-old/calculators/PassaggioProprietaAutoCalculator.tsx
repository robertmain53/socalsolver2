'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Costo Passaggio di Proprietà Auto 2025",
  description: "Calcola online il costo esatto del passaggio di proprietà per la tua auto usata. Inserisci kW e provincia per ottenere un preventivo immediato e dettagliato."
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2.5 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
            "name": "Come si calcola il costo del passaggio di proprietà auto?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il costo si calcola sommando l'Imposta Provinciale di Trascrizione (IPT), che dipende dai kW del veicolo e dalla provincia dell'acquirente, e una serie di costi fissi come emolumenti ACI, imposte di bollo e diritti della Motorizzazione. Questo calcolatore automatizza il processo per darti una stima precisa."
            }
          },
          {
            "@type": "Question",
            "name": "Cos'è l'Imposta Provinciale di Trascrizione (IPT)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'IPT è la tassa più importante nel calcolo del passaggio di proprietà. Si basa sulla potenza del veicolo (espressa in kW) e varia a seconda della provincia di residenza dell'acquirente, che può applicare una maggiorazione fino al 30% sulla tariffa nazionale."
            }
          },
          {
            "@type": "Question",
            "name": "Posso risparmiare facendo il passaggio di proprietà da solo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, gestendo la pratica autonomamente presso uno sportello ACI-PRA o della Motorizzazione si possono risparmiare i costi di intermediazione di un'agenzia, che si aggirano in media tra i 100 e i 200 euro. I costi fissi e l'IPT, invece, sono obbligatori."
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
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc list-outside pl-5 space-y-2 mb-4">
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


// Dati di configurazione del calcolatore (dal JSON)
const calculatorData = {
  "slug": "passaggio-proprieta-auto",
  "category": "Auto e Trasporti",
  "title": "Calcolatore Costo Passaggio di Proprietà Auto",
  "lang": "it",
  "inputs": [
    { "id": "kw", "label": "Potenza del veicolo (kW)", "type": "number" as const, "unit": "kW", "min": 0, "step": 1, "tooltip": "Trovi questo valore sul libretto di circolazione alla voce (P.2). È fondamentale per il calcolo dell'Imposta Provinciale di Trascrizione (IPT)." },
    { "id": "province", "label": "Provincia di residenza dell'acquirente", "type": "select" as const, "tooltip": "L'importo dell'IPT varia in base alla provincia, che può applicare una maggiorazione sull'imposta base." },
    { "id": "is_historic", "label": "È un veicolo storico con più di 30 anni?", "type": "boolean" as const, "tooltip": "I veicoli ultratrentennali non sono soggetti al pagamento dell'IPT in base alla potenza, ma pagano un'imposta fissa ridotta." },
    { "id": "use_agency", "label": "Ti affidi a un'agenzia di pratiche auto?", "type": "boolean" as const, "tooltip": "Seleziona questa opzione per includere una stima dei costi di intermediazione dell'agenzia nel calcolo totale." }
  ],
  "outputs": [
    { "id": "ipt_cost", "label": "Imposta Provinciale di Trascrizione (IPT)" },
    { "id": "fixed_fees", "label": "Costi Fissi (Bolli, ACI, Motorizzazione)" },
    { "id": "agency_fees", "label": "Costo Servizio di Agenzia (Stima)" },
    { "id": "total_cost", "label": "Costo Totale Stimato del Passaggio" }
  ],
  "content": "### **Guida Completa al Calcolo del Passaggio di Proprietà Auto**\n\n**Analisi Dettagliata dei Costi, Procedure e Consigli per Risparmiare**\n\nIl passaggio di proprietà è l'atto burocratico che sancisce il trasferimento della titolarità di un veicolo da un soggetto a un altro. Il suo costo non è un valore fisso, ma una somma di diverse voci di spesa, alcune fisse e altre variabili. Comprendere come viene calcolato è essenziale per evitare sorprese e valutare le opzioni disponibili.\n\nQuesto strumento offre una stima precisa e trasparente, ma è importante sottolineare che **nessun calcolatore può sostituire la documentazione ufficiale rilasciata dagli uffici competenti (PRA e Motorizzazione) o da un'agenzia di pratiche auto.**\n\n### **Parte 1: Le Voci di Costo nel Dettaglio**\n\nIl costo totale del passaggio di proprietà si compone di costi fissi e costi variabili. Vediamo quali sono.\n\n#### **Costi Variabili: L'Imposta Provinciale di Trascrizione (IPT)**\n\nL'IPT è la componente più significativa e variabile del costo. Il suo importo dipende da due fattori principali:\n\n1.  **La Potenza del Veicolo (kW)**: L'imposta cresce con l'aumentare dei kilowatt (kW) del motore, che trovi indicati alla voce (P.2) del libretto di circolazione.\n2.  **La Provincia di Residenza dell'Acquirente**: La normativa nazionale fissa una tariffa base, ma lascia alle singole province la facoltà di applicare una **maggiorazione fino al 30%**. La maggior parte delle province applica l'aliquota massima.\n\nIl calcolo standard prevede una tariffa base di **€3,5119 per ogni kW**. Tuttavia, per i veicoli con potenza fino a 53 kW, si applica un importo minimo forfettario di **€150,81**, a cui va poi sommata l'eventuale maggiorazione provinciale.\n\n#### **Costi Fissi: Le Spese Incomprimibili**\n\nQuesti importi sono stabiliti per legge e non variano, indipendentemente dal veicolo o dalla provincia:\n\n* **Emolumenti ACI**: **€27,00** da versare al Pubblico Registro Automobilistico (PRA) per la registrazione dell'atto.\n* **Imposta di Bollo per il Documento Unico (DU)**: **€32,00** per l'aggiornamento del Documento Unico di Circolazione e di Proprietà.\n* **Diritti ex MCTC (Motorizzazione)**: **€10,20** per l'aggiornamento della carta di circolazione.\n\nLa somma di questi costi fissi ammonta a **€69,20**.\n\n#### **Costi Accessori: Il Servizio di Agenzia**\n\nSe decidi di affidarti a un'agenzia di pratiche auto (come uno Sportello Telematico dell'Automobilista - STA), dovrai aggiungere al totale il costo del loro servizio. Questo compenso, che remunera l'agenzia per la gestione di tutta la burocrazia, è libero e varia in genere **tra i 100 e i 200 euro**.\n\n### **Parte 2: Casi Particolari e Agevolazioni**\n\n#### **Veicoli Storici (Ultr trentennali)**\n\nPer le auto costruite da più di 30 anni, la legge prevede un'importante agevolazione. L'IPT non si calcola più in base alla potenza, ma si paga un'imposta fissa e ridotta pari a **€51,65**.\n\n#### **Vendita da Concessionario (Minivoltura)**\n\nQuando un privato vende la propria auto a un concessionario, si applica la cosiddetta \"minivoltura\". Si tratta di una procedura agevolata con costi fissi ridotti e IPT dimezzata, a condizione che il concessionario inserisca il veicolo nel registro di carico e scarico per la rivendita.\n\n### **Parte 3: Procedura: Fai da Te o Agenzia?**\n\n* **Tramite Agenzia (STA)**: È la soluzione più comoda. L'agenzia si occupa di tutto: verifica dei documenti, compilazione, versamenti e autentica della firma sull'atto di vendita. Il costo è maggiore, ma il risparmio di tempo e la sicurezza della procedura sono garantiti.\n* **\"Fai da Te\" presso PRA o Motorizzazione**: È la via più economica. L'acquirente e il venditore devono recarsi insieme presso uno sportello ACI-PRA o della Motorizzazione Civile per autenticare la firma e completare la pratica. Richiede più tempo e attenzione per evitare errori, ma permette di risparmiare completamente i costi di intermediazione.\n\n#### **Documenti Necessari**\n\nIndipendentemente dalla modalità scelta, assicurati di avere:\n\n1.  **Documento Unico di Circolazione e di Proprietà (o libretto e CdP)**\n2.  **Documento d'identità e codice fiscale** di acquirente e venditore.\n3.  **Modulo TT2119** per la richiesta di aggiornamento del DU.\n4.  **Atto di vendita** correttamente compilato e firmato.\n\n### **Conclusione**\n\nCalcolare in anticipo il costo del passaggio di proprietà è un passo fondamentale per una compravendita serena. Utilizza questo strumento per ottenere una stima affidabile e per comprendere l'impatto di ogni singola voce di costo sulla spesa finale."
};

const provinces = [
    { name: 'Agrigento', code: 'AG', surcharge: 0.3 }, { name: 'Alessandria', code: 'AL', surcharge: 0.2 }, { name: 'Ancona', code: 'AN', surcharge: 0.2 },
    { name: 'Aosta', code: 'AO', surcharge: 0.2 }, { name: 'Arezzo', code: 'AR', surcharge: 0.3 }, { name: 'Ascoli Piceno', code: 'AP', surcharge: 0.3 },
    { name: 'Asti', code: 'AT', surcharge: 0.2 }, { name: 'Avellino', code: 'AV', surcharge: 0.3 }, { name: 'Bari', code: 'BA', surcharge: 0.3 },
    { name: 'Barletta-Andria-Trani', code: 'BT', surcharge: 0.3 }, { name: 'Belluno', code: 'BL', surcharge: 0.25 }, { name: 'Benevento', code: 'BN', surcharge: 0.3 },
    { name: 'Bergamo', code: 'BG', surcharge: 0.2 }, { name: 'Biella', code: 'BI', surcharge: 0.2 }, { name: 'Bologna', code: 'BO', surcharge: 0.2 },
    { name: 'Bolzano', code: 'BZ', surcharge: 0 }, { name: 'Brescia', code: 'BS', surcharge: 0.2 }, { name: 'Brindisi', code: 'BR', surcharge: 0.3 },
    { name: 'Cagliari', code: 'CA', surcharge: 0.25 }, { name: 'Caltanissetta', code: 'CL', surcharge: 0.3 }, { name: 'Campobasso', code: 'CB', surcharge: 0.25 },
    { name: 'Caserta', code: 'CE', surcharge: 0.3 }, { name: 'Catania', code: 'CT', surcharge: 0.3 }, { name: 'Catanzaro', code: 'CZ', surcharge: 0.3 },
    { name: 'Chieti', code: 'CH', surcharge: 0.3 }, { name: 'Como', code: 'CO', surcharge: 0.2 }, { name: 'Cosenza', code: 'CS', surcharge: 0.3 },
    { name: 'Cremona', code: 'CR', surcharge: 0.2 }, { name: 'Crotone', code: 'KR', surcharge: 0.3 }, { name: 'Cuneo', code: 'CN', surcharge: 0.2 },
    { name: 'Enna', code: 'EN', surcharge: 0.3 }, { name: 'Fermo', code: 'FM', surcharge: 0.3 }, { name: 'Ferrara', code: 'FE', surcharge: 0.2 },
    { name: 'Firenze', code: 'FI', surcharge: 0.3 }, { name: 'Foggia', code: 'FG', surcharge: 0.3 }, { name: 'Forlì-Cesena', code: 'FC', surcharge: 0.2 },
    { name: 'Frosinone', code: 'FR', surcharge: 0.3 }, { name: 'Genova', code: 'GE', surcharge: 0.25 }, { name: 'Gorizia', code: 'GO', surcharge: 0.2 },
    { name: 'Grosseto', code: 'GR', surcharge: 0.3 }, { name: 'Imperia', code: 'IM', surcharge: 0.25 }, { name: 'Isernia', code: 'IS', surcharge: 0.25 },
    { name: 'L\'Aquila', code: 'AQ', surcharge: 0.3 }, { name: 'La Spezia', code: 'SP', surcharge: 0.25 }, { name: 'Latina', code: 'LT', surcharge: 0.3 },
    { name: 'Lecce', code: 'LE', surcharge: 0.3 }, { name: 'Lecco', code: 'LC', surcharge: 0.2 }, { name: 'Livorno', code: 'LI', surcharge: 0.3 },
    { name: 'Lodi', code: 'LO', surcharge: 0.2 }, { name: 'Lucca', code: 'LU', surcharge: 0.3 }, { name: 'Macerata', code: 'MC', surcharge: 0.3 },
    { name: 'Mantova', code: 'MN', surcharge: 0.2 }, { name: 'Massa-Carrara', code: 'MS', surcharge: 0.3 }, { name: 'Matera', code: 'MT', surcharge: 0.25 },
    { name: 'Messina', code: 'ME', surcharge: 0.3 }, { name: 'Milano', code: 'MI', surcharge: 0.3 }, { name: 'Modena', code: 'MO', surcharge: 0.2 },
    { name: 'Monza e Brianza', code: 'MB', surcharge: 0.3 }, { name: 'Napoli', code: 'NA', surcharge: 0.3 }, { name: 'Novara', code: 'NO', surcharge: 0.2 },
    { name: 'Nuoro', code: 'NU', surcharge: 0.25 }, { name: 'Oristano', code: 'OR', surcharge: 0.25 }, { name: 'Padova', code: 'PD', surcharge: 0.25 },
    { name: 'Palermo', code: 'PA', surcharge: 0.3 }, { name: 'Parma', code: 'PR', surcharge: 0.2 }, { name: 'Pavia', code: 'PV', surcharge: 0.2 },
    { name: 'Perugia', code: 'PG', surcharge: 0.3 }, { name: 'Pesaro e Urbino', code: 'PU', surcharge: 0.3 }, { name: 'Pescara', code: 'PE', surcharge: 0.3 },
    { name: 'Piacenza', code: 'PC', surcharge: 0.2 }, { name: 'Pisa', code: 'PI', surcharge: 0.3 }, { name: 'Pistoia', code: 'PT', surcharge: 0.3 },
    { name: 'Pordenone', code: 'PN', surcharge: 0.2 }, { name: 'Potenza', code: 'PZ', surcharge: 0.25 }, { name: 'Prato', code: 'PO', surcharge: 0.3 },
    { name: 'Ragusa', code: 'RG', surcharge: 0.3 }, { name: 'Ravenna', code: 'RA', surcharge: 0.2 }, { name: 'Reggio Calabria', code: 'RC', surcharge: 0.3 },
    { name: 'Reggio Emilia', code: 'RE', surcharge: 0.2 }, { name: 'Rieti', code: 'RI', surcharge: 0.3 }, { name: 'Rimini', code: 'RN', surcharge: 0.2 },
    { name: 'Roma', code: 'RM', surcharge: 0.2 }, { name: 'Rovigo', code: 'RO', surcharge: 0.25 }, { name: 'Salerno', code: 'SA', surcharge: 0.3 },
    { name: 'Sassari', code: 'SS', surcharge: 0.25 }, { name: 'Savona', code: 'SV', surcharge: 0.25 }, { name: 'Siena', code: 'SI', surcharge: 0.3 },
    { name: 'Siracusa', code: 'SR', surcharge: 0.3 }, { name: 'Sondrio', code: 'SO', surcharge: 0.2 }, { name: 'Sud Sardegna', code: 'SU', surcharge: 0.25 },
    { name: 'Taranto', code: 'TA', surcharge: 0.3 }, { name: 'Teramo', code: 'TE', surcharge: 0.3 }, { name: 'Terni', code: 'TR', surcharge: 0.3 },
    { name: 'Torino', code: 'TO', surcharge: 0.2 }, { name: 'Trapani', code: 'TP', surcharge: 0.3 }, { name: 'Trento', code: 'TN', surcharge: 0 },
    { name: 'Treviso', code: 'TV', surcharge: 0.25 }, { name: 'Trieste', code: 'TS', surcharge: 0.2 }, { name: 'Udine', code: 'UD', surcharge: 0.2 },
    { name: 'Varese', code: 'VA', surcharge: 0.2 }, { name: 'Venezia', code: 'VE', surcharge: 0.25 }, { name: 'Verbano-Cusio-Ossola', code: 'VB', surcharge: 0.2 },
    { name: 'Vercelli', code: 'VC', surcharge: 0.2 }, { name: 'Verona', code: 'VR', surcharge: 0.25 }, { name: 'Vibo Valentia', code: 'VV', surcharge: 0.3 },
    { name: 'Vicenza', code: 'VI', surcharge: 0.25 }, { name: 'Viterbo', code: 'VT', surcharge: 0.3 },
];

const PassaggioProprietaAutoCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        kw: 70,
        province: 'MI',
        is_historic: false,
        use_agency: true,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { kw, province, is_historic, use_agency } = states;
        
        const base_ipt_rate = 3.5119;
        const min_ipt_amount = 150.81;
        const historic_ipt_amount = 51.65;
        const fixed_fees = 27.00 + 32.00 + 10.20; // ACI + Bollo + Motorizzazione
        const agency_fee_estimate = 150.00;
        
        const selectedProvince = provinces.find(p => p.code === province);
        const surcharge = selectedProvince ? selectedProvince.surcharge : 0.3;

        let ipt_cost = 0;
        if (is_historic) {
            ipt_cost = historic_ipt_amount;
        } else {
            const calculated_base = Math.max(min_ipt_amount, (kw || 0) * base_ipt_rate);
            ipt_cost = calculated_base * (1 + surcharge);
        }

        const agency_fees = use_agency ? agency_fee_estimate : 0;
        const total_cost = ipt_cost + fixed_fees + agency_fees;

        return {
            ipt_cost,
            fixed_fees,
            agency_fees,
            total_cost,
        };
    }, [states]);

    const chartData = [
        { name: 'Costo Totale', 'IPT': calculatedOutputs.ipt_cost, 'Costi Fissi': calculatedOutputs.fixed_fees, 'Agenzia': calculatedOutputs.agency_fees },
    ];
    
    const formulaUsata = `Costo Totale = IPT + Costi Fissi ${states.use_agency ? '+ Costo Agenzia' : ''}`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const saveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const results = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...results].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden" ref={calculatorRef}>
                        <div className="p-6 md:p-8">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                            <p className="text-gray-600 mb-6">Uno strumento completo per stimare con precisione tutti i costi del passaggio di proprietà della tua prossima auto usata.</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-8">
                                <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima accurata basata sulle tariffe nazionali e provinciali. I valori definitivi sono quelli calcolati al momento della pratica presso gli uffici competenti (STA, PRA, Motorizzazione).
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {inputs.map(input => {
                                    const inputLabel = (
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                    );

                                    if (input.type === 'boolean') {
                                      return (
                                        <div key={input.id} className="md:col-span-1 flex items-center justify-start h-full mt-4">
                                            <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                                                <input id={input.id} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                                <label className="text-sm font-medium text-gray-800" htmlFor={input.id}>{input.label}</label>
                                                {input.tooltip && <Tooltip text={input.tooltip}><span className="cursor-help"><InfoIcon /></span></Tooltip>}
                                            </div>
                                        </div>
                                      );
                                    }
                                    
                                    if(input.type === 'select') {
                                        return (
                                            <div key={input.id} className="md:col-span-2">
                                                {inputLabel}
                                                <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
                                                </select>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div key={input.id} className={`${input.id === 'kw' ? 'md:col-span-2' : ''}`}>
                                            {inputLabel}
                                            <div className="relative">
                                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                                {input.unit && <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-500">{input.unit}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-10 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">Risultati del Calcolo</h2>
                                {outputs.map(output => (
                                   calculatedOutputs[output.id as keyof typeof calculatedOutputs] > 0 && (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'total_cost' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'total_cost' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '€...'}</span>
                                        </div>
                                    </div>
                                  )
                                ))}
                            </div>

                            <div className="mt-10">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Ripartizione dei Costi</h3>
                                <div className="h-72 w-full bg-gray-50 p-4 rounded-lg border">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" hide />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}} />
                                                <Legend />
                                                <Bar dataKey="IPT" stackId="a" fill="#4f46e5" name="IPT" />
                                                <Bar dataKey="Costi Fissi" stackId="a" fill="#818cf8" name="Costi Fissi" />
                                                <Bar dataKey="Agenzia" stackId="a" fill="#fbbf24" name="Costo Agenzia" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>

                         <div className="mt-2 border-t bg-gray-50 p-4">
                            <h3 className="font-semibold text-sm text-gray-700">Formula di Calcolo Utilizzata</h3>
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-white rounded border font-mono break-words">{formulaUsata}</p>
                        </div>
                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                            <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="sm:col-span-2 lg:col-span-1 w-full text-sm border border-red-200 bg-red-50 rounded-md px-3 py-2 text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 md:p-6 bg-white shadow-lg">
                        <h2 className="font-semibold mb-4 text-gray-800 text-lg">Guida alla Comprensione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 md:p-6 bg-white shadow-lg">
                        <h2 className="font-semibold mb-4 text-gray-800 text-lg">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="http://www.aci.it/i-servizi/guide-utili/guida-pratiche-auto/passaggio-di-proprieta.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ACI - Guida al Passaggio di Proprietà</a></li>
                            <li><a href="https://www.ilportaledellautomobilista.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Il Portale dell'Automobilista</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-15;446" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.Lgs. 446/1997, Art. 56</a> - Istituzione dell'IPT.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default PassaggioProprietaAutoCalculator;