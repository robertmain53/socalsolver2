'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// --- TIPI E DATI ---

type CalculatorInput = {
  id: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  unit?: string;
  min?: number;
  step?: number;
  condition?: string;
  tooltip?: string;
  options?: { value: string; label: string }[];
};

const calculatorData = {
  "slug": "spese-universitarie-per-citta",
  "category": "Famiglia e Vita Quotidiana",
  "title": "Calcolatore Spese Universitarie (tasse, affitto, libri) per città",
  "lang": "it",
  "inputs": [
    { "id": "citta", "label": "Città degli studi", "type": "select" as const, "options": [ { "value": "Milano", "label": "Milano" }, { "value": "Roma", "label": "Roma" }, { "value": "Bologna", "label": "Bologna" }, { "value": "Torino", "label": "Torino" }, { "value": "Firenze", "label": "Firenze" }, { "value": "Padova", "label": "Padova" }, { "value": "Napoli", "label": "Napoli" }, { "value": "Pisa", "label": "Pisa" }, { "value": "Altra", "label": "Altra città" } ], "tooltip": "La città influisce principalmente sul costo dell'affitto e dei trasporti." },
    { "id": "tipo_studente", "label": "Tipo di studente", "type": "select" as const, "options": [ { "value": "fuorisede", "label": "Fuorisede" }, { "value": "pendolare", "label": "Pendolare" }, { "value": "in_sede", "label": "In sede" } ], "tooltip": "Il 'fuorisede' ha i costi maggiori (affitto, utenze), il 'pendolare' sostiene spese di trasporto, 'in sede' vive con la famiglia d'origine." },
    { "id": "tipo_ateneo", "label": "Tipo di ateneo", "type": "select" as const, "options": [ { "value": "pubblico", "label": "Pubblico" }, { "value": "privato", "label": "Privato" } ], "tooltip": "Gli atenei privati hanno rette significativamente più alte e spesso non dipendenti dall'ISEE." },
    { "id": "fascia_isee", "label": "Fascia ISEE Universitaria", "type": "select" as const, "options": [ { "value": "bassa", "label": "Fino a 24.000 €" }, { "value": "media", "label": "Da 24.000 € a 50.000 €" }, { "value": "alta", "label": "Oltre 50.000 €" } ], "condition": "tipo_ateneo == 'pubblico'", "tooltip": "L'Indicatore della Situazione Economica Equivalente (ISEE) è il criterio principale per calcolare le tasse nelle università pubbliche." },
    { "id": "affitto_mensile", "label": "Affitto mensile (stanza/posto letto)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "condition": "tipo_studente == 'fuorisede'", "tooltip": "Costo medio di una stanza singola o posto letto. Il valore è pre-compilato in base alla città scelta, ma puoi modificarlo." },
    { "id": "trasporti_mensili", "label": "Trasporti mensili", "type": "number" as const, "unit": "€", "min": 0, "step": 5, "condition": "tipo_studente != 'in_sede'", "tooltip": "Costo dell'abbonamento ai mezzi pubblici o altre spese di viaggio." },
    { "id": "libri_annuali", "label": "Libri e materiale didattico (annuale)", "type": "number" as const, "unit": "€", "min": 0, "step": 20, "tooltip": "Stima del costo per libri di testo, fotocopie, cancelleria, software, ecc." },
    { "id": "spese_mensili_extra", "label": "Altre spese mensili (vitto, tempo libero)", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "condition": "tipo_studente == 'fuorisede'", "tooltip": "Include cibo, utenze (se non comprese nell'affitto), e spese per attività sociali." }
  ],
  "outputs": [ { "id": "costo_annuale_totale", "label": "Costo Annuale Totale Stimato" }, { "id": "costo_mensile_totale", "label": "Costo Mensile Medio Stimato" } ],
  "content": "### **Guida Completa alle Spese Universitarie in Italia**\n\n**Come Pianificare il Budget per Tasse, Affitto, Libri e Vita Quotidiana**\n\nIntraprendere il percorso universitario è un investimento fondamentale per il proprio futuro, ma comporta una pianificazione economica attenta. Le spese da sostenere variano enormemente in base alla città, al tipo di ateneo e allo stile di vita. Questo calcolatore è progettato per offrire una stima realistica e dettagliata dei costi che uno studente deve affrontare, aiutando famiglie e futuri universitari a prepararsi in modo consapevole.\n\nL'obiettivo è fornire una panoramica chiara, superando una semplice somma di cifre, per spiegare *perché* e *come* questi costi si compongono. Ricorda che questo strumento è una simulazione: i valori reali possono variare.\n\n### **Parte 1: Le Voci di Costo Fondamentali**\n\nAnalizziamo nel dettaglio ogni parametro utilizzato dal calcolatore, che rappresenta una delle principali categorie di spesa.\n\n#### **1. Tasse Universitarie e Contributo Unico**\n\nLa spesa più diretta è il contributo onnicomprensivo annuale, comunemente noto come \"tasse universitarie\".\n\n* **Atenei Pubblici**: Il costo non è fisso. La legge prevede un sistema progressivo basato sull'**ISEE (Indicatore della Situazione Economica Equivalente)** del nucleo familiare. Le università definiscono scaglioni di contribuzione: più basso è l'ISEE, più basse sono le tasse. Esiste una **\"No Tax Area\"** (generalmente sotto i 22.000-24.000 € di ISEE) che esonera quasi totalmente dal pagamento, fatta eccezione per la tassa regionale per il diritto allo studio (solitamente 120-160 €) e l'imposta di bollo.\n* **Atenei Privati**: Le rette sono stabilite autonomamente dall'istituto e sono notevolmente più elevate. Sebbene alcune università private offrano riduzioni basate sul reddito o sul merito, il loro importo medio si attesta tra i 5.000 € e i 15.000 € annui, o anche di più per corsi specialistici.\n\n#### **2. Costo dell'Alloggio: La Spesa Maggiore per i Fuorisede**\n\nPer chi studia lontano da casa (**studente fuorisede**), l'affitto rappresenta la voce di spesa più impattante.\n\n* **Stanza Singola vs. Posto Letto**: I costi variano sensibilmente. Una stanza singola offre privacy ma ha un costo maggiore; un posto letto in doppia è più economico.\n* **Disparità Territoriali**: Le metropoli del Nord (es. **Milano, Bologna**) presentano i canoni di locazione più alti d'Italia, superando spesso i 600 € per una singola. Al Centro (es. **Roma, Firenze**) i prezzi sono leggermente inferiori ma comunque alti. Al Sud e nelle città di medie dimensioni, i costi si riducono notevolmente.\n* **Utenze e Spese Condominiali**: Bisogna sempre verificare se sono incluse nel canone o da pagare a parte, poiché possono aggiungere 50-100 € mensili al totale.\n\n#### **3. Trasporti: Il Costo Quotidiano per Pendolari e Fuorisede**\n\n* **Studenti Pendolari**: Per loro, questa è una delle spese fisse principali. Il costo dipende dalla distanza e dal mezzo (treno, autobus).\n* **Studenti Fuorisede**: Anche vivendo nella stessa città, è quasi sempre necessario un abbonamento ai mezzi pubblici locali, il cui costo varia da circa 25 € a oltre 40 € al mese, a seconda delle agevolazioni comunali.\n\n#### **4. Materiale Didattico e Libri**\n\nQuesta spesa è spesso sottovalutata. A seconda della facoltà, il costo per libri di testo, manuali, fotocopie, software e cancelleria può variare **dai 300 € ai 900 € all'anno**. Le facoltà scientifiche e di architettura possono avere costi iniziali più alti per attrezzature specifiche.\n\n#### **5. Vitto e Spese Personali**\n\nPer un fuorisede, questa categoria include la spesa al supermercato, i pasti fuori casa (mense universitarie offrono un'alternativa economica), e le uscite per il tempo libero. Un budget realistico per questa voce si aggira tra i 300 € e i 450 € mensili.\n\n### **Parte 2: Strategie di Risparmio e Opportunità**\n\nGestire le finanze all'università è una lezione di vita. Ecco alcuni consigli pratici:\n\n* **Borse di Studio e Diritto allo Studio (DSU)**: La prima cosa da fare è informarsi presso l'ufficio DSU del proprio ateneo. Esistono borse di studio basate su reddito (ISEE) e merito (CFU conseguiti) che possono coprire le tasse, offrire un contributo monetario, e dare accesso a mense e alloggi a tariffe agevolate.\n* **Mercato dell'Usato per i Libri**: Acquistare libri di seconda mano o utilizzare le risorse delle biblioteche universitarie può dimezzare i costi.\n* **Agevolazioni Studenti**: Sfrutta sempre gli sconti per studenti su trasporti, musei, cinema, software e tecnologia.\n* **Lavoro Part-Time**: Molti studenti lavorano per sostenere parte delle spese. Le università spesso offrono collaborazioni retribuite (le \"150 ore\").\n\n### **Conclusione**\n\nIl costo di un percorso universitario è un mosaico complesso. Usare questo calcolatore è il primo passo per avere un quadro d'insieme, personalizzare la stima sulla propria situazione e iniziare a pianificare con serenità il proprio futuro accademico. L'investimento in istruzione è il più importante, e una buona pianificazione lo rende più sostenibile.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Qual è il costo medio annuale per uno studente universitario in Italia?", "acceptedAnswer": { "@type": "Answer", "text": "Il costo varia notevolmente. Per uno studente 'in sede' in un'università pubblica, il costo può limitarsi alle tasse (da 200 € a 3.000 €). Per uno studente 'fuorisede', il costo totale annuo può variare da 8.000 € nelle città più economiche a oltre 15.000 € in città come Milano, considerando affitto, tasse, vitto e altre spese." } }, { "@type": "Question", "name": "Come influisce l'ISEE sulle tasse universitarie?", "acceptedAnswer": { "@type": "Answer", "text": "Nelle università pubbliche, l'ISEE è il principale strumento per determinare l'importo delle tasse. Esiste una 'No Tax Area' per gli ISEE più bassi (solitamente sotto i 24.000 €), che permette un esonero quasi totale. Al di sopra di questa soglia, le tasse aumentano progressivamente in base a scaglioni definiti da ogni singolo ateneo." } }, { "@type": "Question", "name": "Quali sono le città universitarie più costose per gli studenti fuorisede?", "acceptedAnswer": { "@type": "Answer", "text": "Generalmente, le città più costose per l'affitto di una stanza per studenti sono Milano, Bologna, Roma e Firenze, dove il costo di una stanza singola può facilmente superare i 500-600 € mensili. Questo le rende le città con il costo della vita più alto per i fuorisede." } } ] }
};

// --- COMPONENTI DI UTILITÀ ---

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 inline">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const ContentRenderer = ({ content }: { content: string }) => {
    // Semplice parser Markdown per titoli, liste e grassetto/corsivo
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('####')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/####/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// Componente per l'iniezione dinamica dello schema JSON-LD
const SchemaInjector = ({ schema }: { schema: object }) => (
    <Head>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    </Head>
);

// --- LAZY LOADING PER IL GRAFICO ---
const DynamicPieChart = dynamic(
    () => import('recharts').then(mod => {
        const ChartComponent = ({ data }: { data: any[] }) => (
            <mod.ResponsiveContainer width="100%" height="100%">
                <mod.PieChart>
                    <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.map((_entry, index) => (
                            <mod.Cell key={`cell-${index}`} fill={['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe'][index % 4]} />
                        ))}
                    </mod.Pie>
                    <mod.Tooltip formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)} />
                </mod.PieChart>
            </mod.ResponsiveContainer>
        );
        return ChartComponent;
    }),
    {
        ssr: false,
        loading: () => <div className="flex items-center justify-center h-full w-full text-gray-500">Caricamento grafico...</div>
    }
);


// --- COMPONENTE PRINCIPALE DEL CALCOLATORE ---

const SpeseUniversitariePerCittaCalculator: React.FC = () => {
    const { slug, title, inputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = {
        citta: "Milano",
        tipo_studente: "fuorisede",
        tipo_ateneo: "pubblico",
        fascia_isee: "media",
        affitto_mensile: 620,
        trasporti_mensili: 40,
        libri_annuali: 400,
        spese_mensili_extra: 350,
    };
    
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);
    
    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const averageRent: { [key: string]: number } = { Milano: 620, Roma: 550, Bologna: 480, Torino: 400, Firenze: 500, Padova: 450, Napoli: 350, Pisa: 420, Altra: 380 };
    const averageTransport: { [key: string]: number } = { Milano: 40, Roma: 35, Bologna: 30, Torino: 25, Firenze: 30, Padova: 25, Napoli: 30, Pisa: 25, Altra: 20 };

    useEffect(() => {
        if (states.tipo_studente === 'fuorisede') {
            setStates(prev => ({ ...prev, affitto_mensile: averageRent[prev.citta] || 380 }));
        }
        if (states.tipo_studente !== 'in_sede') {
            setStates(prev => ({ ...prev, trasporti_mensili: averageTransport[prev.citta] || 20 }));
        }
    }, [states.citta, states.tipo_studente]);


    const calculatedOutputs = useMemo(() => {
        const { tipo_ateneo, fascia_isee, tipo_studente, affitto_mensile, spese_mensili_extra, trasporti_mensili, libri_annuali } = states;
        
        const tasse_annuali = tipo_ateneo === 'privato' ? 8000 : (fascia_isee === 'bassa' ? 450 : (fascia_isee === 'media' ? 1500 : 2800));
        const costi_abitativi_annuali = tipo_studente === 'fuorisede' ? (Number(affitto_mensile) * 12) + (Number(spese_mensili_extra) * 12) : 0;
        const costi_trasporti_annuali = tipo_studente !== 'in_sede' ? Number(trasporti_mensili) * 12 : 0;
        
        const costo_annuale_totale = tasse_annuali + costi_abitativi_annuali + costi_trasporti_annuali + Number(libri_annuali);
        const costo_mensile_totale = costo_annuale_totale / 12;

        return {
            costo_annuale_totale,
            costo_mensile_totale,
            tasse: tasse_annuali,
            alloggio: tipo_studente === 'fuorisede' ? (Number(affitto_mensile) * 12) : 0,
            vittoExtra: tipo_studente === 'fuorisede' ? (Number(spese_mensili_extra) * 12) : 0,
            trasporti: costi_trasporti_annuali,
            libri: Number(libri_annuali)
        };
    }, [states]);
    
    const chartData = [
        { name: 'Tasse', value: calculatedOutputs.tasse },
        { name: 'Alloggio', value: calculatedOutputs.alloggio + calculatedOutputs.vittoExtra },
        { name: 'Trasporti', value: calculatedOutputs.trasporti },
        { name: 'Libri', value: calculatedOutputs.libri },
    ].filter(item => item.value > 0);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (calculatorRef.current) {
                const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${slug}-report.pdf`);
            }
        } catch (error) {
            console.error("Errore esportazione PDF:", error);
            alert("Impossibile generare il PDF in questo ambiente.");
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const { tasse, alloggio, vittoExtra, trasporti, libri, ...outputsToSave } = calculatedOutputs;
            const result = { slug, title, inputs: states, outputs: outputsToSave, timestamp: new Date().toISOString() };
            const history = JSON.parse(localStorage.getItem('calc_history') || '[]');
            history.unshift(result);
            localStorage.setItem('calc_history', JSON.stringify(history.slice(0, 10)));
            alert("Risultato salvato nello storico del browser!");
        } catch (error) {
            alert("Impossibile salvare il risultato.");
        }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    
    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Una stima completa per pianificare il tuo budget universitario in base alle tue scelte.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo basata su costi medi. Le spese reali possono variare.
                        </div>

                        {/* Sezione Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inputs.map(input => {
                                let conditionMet = true;
                                if (input.condition) {
                                    const [key, , value] = input.condition.split(' ');
                                    conditionMet = value.includes("'") ? states[key] === value.replace(/'/g, "") : states[key] !== value.replace(/'/g, "");
                                }
                                if (!conditionMet) return null;
                                
                                const InputField = () => {
                                    if (input.type === 'select') {
                                        return (
                                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        );
                                    }
                                    return (
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    );
                                };

                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon/></span></Tooltip>}
                                        </label>
                                        <InputField />
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Sezione Output */}
                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Risultati della Stima</h2>
                            {calculatorData.outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'costo_annuale_totale' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                                    <span className="text-base font-medium text-gray-700">{output.label}</span>
                                    <span className={`text-2xl font-bold ${output.id === 'costo_annuale_totale' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        {isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        {/* Grafico */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione dei Costi Annuali</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && <DynamicPieChart data={chartData} />}
                            </div>
                        </div>
                    </div>
                     <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">Costo Totale = Tasse Annuali + (Affitto + Extra) * 12 + Trasporti * 12 + Libri</p>
                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full border text-sm border-red-200 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                         <h2 className="font-semibold mb-2 text-gray-800">Guida e Approfondimenti</h2>
                         <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.miur.gov.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ministero dell'Istruzione, Università e Ricerca (MIUR)</a></li>
                            <li><a href="https://www.almalaurea.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Consorzio Interuniversitario AlmaLaurea</a></li>
                            <li><a href="https://www.inps.it/prestazioni-servizi/come-compilare-la-dsu-e-richiedere-l-isee" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Guida alla compilazione DSU per ISEE (INPS)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default SpeseUniversitariePerCittaCalculator;