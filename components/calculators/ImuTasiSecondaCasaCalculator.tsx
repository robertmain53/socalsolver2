'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore IMU per seconda casa (con aliquote comunali)",
  description: "Calcola l'IMU 2025 per la tua seconda casa. Inserisci rendita catastale e aliquota comunale per ottenere l'importo dell'acconto e del saldo."
};

// --- TYPE DEFINITIONS ---
interface CalculatorInput {
    id: string;
    label: string;
    type: "number" | "boolean";
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    tooltip: string;
}

interface CalculatorOutput {
    id: string;
    label: string;
    unit: string;
}

interface CalculatorData {
    slug: string;
    title: string;
    inputs: CalculatorInput[];
    outputs: CalculatorOutput[];
    content: string;
}


// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
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
            "name": "Come si calcola l'IMU per la seconda casa?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il calcolo dell'IMU si basa sulla formula: (Rendita Catastale x 1,05) x 160 x Aliquota Comunale %. Il risultato viene poi ripartito per la percentuale e i mesi di possesso. Questo calcolatore automatizza il processo."
            }
          },
          {
            "@type": "Question",
            "name": "Dove trovo l'aliquota IMU del mio Comune?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'aliquota IMU è una delibera annuale del Comune. Puoi trovare il valore corretto sul sito istituzionale del tuo Comune o consultando il portale del Ministero dell'Economia e delle Finanze (MEF)."
            }
          },
          {
            "@type": "Question",
            "name": "La TASI si paga ancora sulla seconda casa?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, dal 1° gennaio 2020 la TASI è stata abolita e accorpata alla \"nuova IMU\". Oggi si paga un'unica imposta che comprende le componenti di entrambe."
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
                 if (trimmedBlock.match(/^\d\.\s/)) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                    return (
                        <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ol>
                    );
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
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// Dati di configurazione del calcolatore (inclusi direttamente)
const calculatorData: CalculatorData = JSON.parse('{"slug":"imu-tasi-seconda-casa","category":"Immobiliare e Casa","title":"Calcolatore IMU per seconda casa (con aliquote comunali)","lang":"it","inputs":[{"id":"rendita_catastale","label":"Rendita Catastale non rivalutata","type":"number","unit":"€","min":0,"step":10,"tooltip":"Inserisci il valore della rendita catastale come riportato sulla visura catastale del tuo immobile. È il valore di partenza per il calcolo."},{"id":"aliquota_comunale","label":"Aliquota IMU Comunale","type":"number","unit":"%","min":0,"step":0.01,"tooltip":"L\'aliquota deliberata dal tuo Comune per le seconde case. Generalmente varia tra 0,86% e 1,06%. Puoi trovarla sul sito del tuo Comune o sul portale del MEF."},{"id":"percentuale_possesso","label":"Percentuale di Possesso","type":"number","unit":"%","min":1,"max":100,"step":1,"tooltip":"La tua quota di proprietà dell\'immobile. Se sei l\'unico proprietario, inserisci 100."},{"id":"mesi_possesso","label":"Mesi di Possesso nell\'anno","type":"number","unit":"mesi","min":1,"max":12,"step":1,"tooltip":"Il numero di mesi durante i quali hai posseduto l\'immobile nell\'anno di riferimento."},{"id":"riduzione_comodato_parenti","label":"Riduzione 50% per comodato d\'uso a parenti?","type":"boolean","tooltip":"Spunta questa casella se l\'immobile è concesso in comodato d\'uso gratuito a un parente di primo grado (genitore/figlio) che lo utilizza come abitazione principale, a determinate condizioni di legge."},{"id":"riduzione_storico_inagibile","label":"Riduzione 50% per immobile storico o inagibile?","type":"boolean","tooltip":"Spunta questa casella se l\'immobile è classificato di interesse storico/artistico oppure è stato dichiarato inagibile e di fatto non utilizzato."}],"outputs":[{"id":"imu_annua_totale","label":"IMU Annua Totale Dovuta","unit":"€"},{"id":"acconto_giugno","label":"Acconto (scadenza 16 Giugno)","unit":"€"},{"id":"saldo_dicembre","label":"Saldo (scadenza 16 Dicembre)","unit":"€"},{"id":"base_imponibile","label":"Base Imponibile Calcolata","unit":"€"}],"content":"### **Guida Completa al Calcolo dell\'IMU sulla Seconda Casa**\\n\\n**Analisi dei Criteri, delle Riduzioni e delle Scadenze Fiscali**\\n\\nIl calcolo dell\'Imposta Municipale Propria (IMU) rappresenta un adempimento fiscale fondamentale per i proprietari di immobili. Se per l\'abitazione principale l\'imposta è stata in gran parte abolita, per le seconde case costituisce un onere significativo. \\n\\nQuesto strumento offre una stima precisa dell\'imposta dovuta, basandosi sui parametri ufficiali. La guida che segue si propone di fare chiarezza su ogni aspetto del calcolo, spiegando la logica, i termini tecnici e le variabili che incidono sull\'importo finale. Ricorda che questo calcolatore **fornisce una stima accurata ma non sostituisce il calcolo ufficiale** che può essere verificato presso il proprio Comune o tramite un consulente fiscale.\\n\\n### **Parte 1: Il Calcolatore - Dalla Rendita all\'Imposta**\\n\\nIl nostro calcolatore semplifica un processo che si basa su una formula precisa. Comprendere i dati che inserisci è il primo passo per un risultato corretto.\\n\\n* **Rendita Catastale**: È il valore fiscale attribuito all\'immobile. Lo trovi nella **visura catastale**, un documento ufficiale richiedibile all\'Agenzia delle Entrate. È il punto di partenza imprescindibile.\\n* **Aliquota Comunale**: È il cuore del calcolo. Ogni Comune italiano delibera annualmente la propria aliquota per le seconde case, entro un range stabilito dalla legge nazionale (l\'aliquota base è dello 0,86%, ma i Comuni possono aumentarla fino al 1,06% o oltre in determinate situazioni). È fondamentale **verificare l\'aliquota corretta sul sito istituzionale del proprio Comune** o sul portale del Ministero dell\'Economia e delle Finanze (MEF).\\n* **Percentuale e Mesi di Possesso**: L\'IMU si paga in proporzione alla quota di proprietà e al periodo di possesso durante l\'anno solare. Se hai acquistato casa a metà anno, pagherai solo per i mesi di effettivo possesso.\\n\\n### **Parte 2: La \\\"Nuova IMU\\\" - Cosa è Cambiato dal 2020?**\\n\\nÈ importante sapere che dal 1° gennaio 2020, la Legge di Bilancio 2020 (L. 160/2019) ha unificato le due precedenti imposte sulla casa, IMU e TASI (Tributo per i Servizi Indivisibili), in un unico tributo: la **\\\"nuova IMU\\\"**. \\n\\nQuesto significa che oggi **non si paga più la TASI separatamente**, in quanto le sue componenti sono state integrate nell\'IMU. Il nostro calcolatore tiene conto di questa normativa, calcolando l\'imposta unificata attualmente in vigore. Il riferimento a TASI nel titolo serve a intercettare gli utenti che ancora cercano informazioni sulla base della vecchia denominazione.\\n\\n### **Parte 3: La Formula del Calcolo Spiegata Passo-Passo**\\n\\nLa trasparenza è fondamentale. Ecco la formula matematica che sta dietro al calcolo:\\n\\n1.  **Rivalutazione della Rendita Catastale**: La rendita catastale viene prima rivalutata del 5%.\\n    _Rendita Rivalutata = Rendita Catastale x 1,05_\\n\\n2.  **Calcolo della Base Imponibile**: La rendita rivalutata viene moltiplicata per un coefficiente specifico, che per gli immobili ad uso abitativo (gruppi catastali da A/1 a A/11, escluso A/10) è **160**.\\n    _Base Imponibile = Rendita Rivalutata x 160_\\n\\n3.  **Applicazione delle Riduzioni**: Se applicabili (vedi Parte 4), la base imponibile viene ridotta del 50%.\\n\\n4.  **Calcolo dell\'Imposta Lorda**: Alla base imponibile (eventualmente ridotta) si applica l\'aliquota comunale in percentuale.\\n    _Imposta Lorda Annua = Base Imponibile x (Aliquota Comunale / 100)_\\n\\n5.  **Calcolo dell\'Imposta Finale**: L\'imposta lorda viene infine rapportata alla quota e ai mesi di possesso.\\n    _IMU Dovuta = Imposta Lorda Annua x (% Possesso / 100) x (Mesi Possesso / 12)_\\n\\n### **Parte 4: Riduzioni e Casi Particolari**\\n\\nLa legge prevede importanti agevolazioni che possono dimezzare l\'imposta dovuta.\\n\\n#### **Riduzione del 50% per Comodato d\'Uso a Parenti**\\nLa base imponibile è ridotta del 50% per gli immobili (non di lusso) concessi in comodato d\'uso gratuito a parenti in linea retta di primo grado (genitori o figli) che li utilizzano come **abitazione principale**. Per beneficiare della riduzione, devono essere soddisfatte **tutte** le seguenti condizioni:\\n* Il contratto di comodato deve essere **registrato** presso l\'Agenzia delle Entrate.\\n* Il comodante (chi concede l\'immobile) deve risiedere anagraficamente e dimorare abitualmente nello **stesso Comune** in cui si trova l\'immobile concesso.\\n* Il comodante non deve possedere altri immobili ad uso abitativo in Italia, ad eccezione della propria abitazione principale (nello stesso Comune).\\n\\n#### **Riduzione del 50% per Immobili Storici o Inagibili**\\nLa stessa riduzione del 50% si applica a:\\n* **Fabbricati di interesse storico o artistico**.\\n* **Fabbricati dichiarati inagibili o inabitabili** e di fatto non utilizzati, limitatamente al periodo dell\'anno durante il quale sussistono tali condizioni.\\n\\n### **Parte 5: Scadenze e Modalità di Pagamento (Modello F24)**\\n\\nL\'IMU si paga in due rate di pari importo:\\n* **Acconto**: entro il **16 giugno**.\\n* **Saldo**: entro il **16 dicembre**.\\n\\nÈ anche possibile pagare l\'intero importo in un\'unica soluzione entro la scadenza dell\'acconto. Il versamento si effettua tramite il **modello F24**, utilizzando gli appositi codici tributo."}');


const ImuTasiSecondaCasaCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        rendita_catastale: 650,
        aliquota_comunale: 1.06,
        percentuale_possesso: 100,
        mesi_possesso: 12,
        riduzione_comodato_parenti: false,
        riduzione_storico_inagibile: false
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const {
            rendita_catastale, aliquota_comunale, percentuale_possesso,
            mesi_possesso, riduzione_comodato_parenti, riduzione_storico_inagibile
        } = states;

        const COEFFICIENTE_SECONDA_CASA = 160;

        const valore_rivalutato = rendita_catastale * 1.05;
        const base_imponibile_iniziale = valore_rivalutato * COEFFICIENTE_SECONDA_CASA;
        
        const fattore_riduzione = (riduzione_comodato_parenti || riduzione_storico_inagibile) ? 0.5 : 1;
        const base_imponibile = base_imponibile_iniziale * fattore_riduzione;
        
        const imu_lorda = base_imponibile * (aliquota_comunale / 100);
        
        const imu_annua_totale = imu_lorda * (percentuale_possesso / 100) * (mesi_possesso / 12);
        
        const acconto_giugno = imu_annua_totale / 2;
        const saldo_dicembre = imu_annua_totale / 2;

        return {
            imu_annua_totale,
            acconto_giugno,
            saldo_dicembre,
            base_imponibile,
        };
    }, [states]);

    const chartData = [
      { name: 'Acconto', value: calculatedOutputs.acconto_giugno, fill: '#38bdf8' },
      { name: 'Saldo', value: calculatedOutputs.saldo_dicembre, fill: '#0284c7' },
    ];

    const formulaUsata = `Base Imponibile = (Rendita Catastale * 1.05 * 160) * Eventuale Riduzione 50%; IMU Annua = Base Imponibile * Aliquota % * (% Possesso / 100) * (Mesi Possesso / 12)`;

    const handleExportPDF = useCallback(async () => {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).default;
        if (!calcolatoreRef.current) return;
        const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${slug}.pdf`);
      } catch (_e) { alert("Funzione PDF non disponibile in questo ambiente"); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="p-1" ref={calcolatoreRef}>
                        <div className=" -lg -md p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">{meta.description}</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento fornisce una stima a scopo puramente informativo. I calcoli definitivi devono essere verificati con il proprio Comune o con un consulente fiscale.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg">
                                {inputs.filter(input => input.type !== 'boolean').map(input => (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id={input.id}
                                                aria-label={input.label}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 px-3 py-2"
                                                type="number"
                                                min={input.min}
                                                max={input.max}
                                                step={input.step}
                                                value={states[input.id]}
                                                onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                                            />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                ))}
                                {inputs.filter(input => input.type === 'boolean').map(input => (
                                    <div key={input.id} className="md:col-span-2 flex items-start gap-3 p-3 rounded-md bg-white border mt-2">
                                        <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500 mt-0.5" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                        <div>
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                            <p className="text-xs text-gray-500 mt-1">{input.tooltip}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'imu_annua_totale' ? 'bg-sky-50 border-sky-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'imu_annua_totale' ? 'text-sky-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione Annuale</h3>
                                <div className="h-56 w-full bg-gray-50 p-2 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" width={60} stroke="#6b7280" />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} />
                                                <Bar dataKey="value" name="Importo" barSize={40}>
                                                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetizzata</h3>
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Campi</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Calcolo IMU</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2019-12-27;160!vig=" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Legge 27 dicembre 2019, n. 160</a> (Legge di Bilancio 2020) - Istituzione della "nuova IMU".</li>
                            <li><a href="https://www.finanze.gov.it/it/fiscalita-regionale-e-locale/determinazione-delle-aliquote-e-delle-detrazioni-dell-imu-e-della-tasi/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Portale MEF</a> - Ricerca aliquote e delibere comunali.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default ImuTasiSecondaCasaCalculator;