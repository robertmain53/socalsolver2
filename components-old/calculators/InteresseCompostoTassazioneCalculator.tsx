'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import dynamic from 'next/dynamic';

// --- Dati di Configurazione (inclusi direttamente nel file) ---
const calculatorData = {
  "slug": "interesse-composto-tassazione",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Interesse Composto (con tassazione 26%)",
  "lang": "it",
  "inputs": [
    { "id": "capitale_iniziale", "label": "Capitale Iniziale", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "L'importo di partenza del tuo investimento. Se parti da zero, lascia 0." },
    { "id": "contributo_mensile", "label": "Contributo Mensile", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "L'importo che prevedi di aggiungere al tuo investimento ogni mese." },
    { "id": "tasso_interesse_annuo", "label": "Tasso di Rendimento Annuo Lordo", "type": "number" as const, "unit": "%", "min": 0, "step": 0.5, "tooltip": "Il rendimento medio annuo previsto dal tuo investimento, prima di tasse e costi." },
    { "id": "durata_investimento", "label": "Durata dell'Investimento", "type": "number" as const, "unit": "anni", "min": 1, "step": 1, "tooltip": "Il numero di anni per cui prevedi di mantenere l'investimento." }
  ],
  "outputs": [
    { "id": "capitale_finale_netto", "label": "Capitale Finale Netto (Dopo Tasse)", "unit": "€" },
    { "id": "capitale_investito", "label": "Totale Capitale Investito", "unit": "€" },
    { "id": "interessi_guadagnati_lordi", "label": "Interessi Lordi Guadagnati", "unit": "€" },
    { "id": "tasse_totali_pagate", "label": "Tasse Totali Stimate (26%)", "unit": "€" }
  ],
  "content": "### **Guida Definitiva all'Interesse Composto e alla Tassazione del 26%**\n\n**Massimizza i tuoi rendimenti comprendendo il vero impatto delle tasse.**\n\nL'interesse composto è stato definito da Albert Einstein come l'ottava meraviglia del mondo. È il motore che può trasformare piccoli risparmi costanti in un patrimonio significativo nel lungo termine. Tuttavia, per pianificare efficacemente i propri investimenti in Italia, è fondamentale comprendere l'impatto della **tassazione sulle rendite finanziarie**, fissata al 26% sulla maggior parte dei guadagni.\n\nQuesto calcolatore non si limita a mostrarti la magia della capitalizzazione composta, ma ti offre una **stima realistica del tuo capitale finale netto**, simulando l'applicazione annuale dell'imposta sostitutiva del 26% sui guadagni.\n\n### **Parte 1: Come Funziona il Calcolatore**\n\nLo strumento simula la crescita di un investimento anno per anno, applicando la seguente logica:\n\n1.  **Crescita Annuale**: All'inizio di ogni anno, il capitale accumulato viene incrementato dai nuovi versamenti (il tuo contributo mensile moltiplicato per 12).\n2.  **Calcolo del Rendimento**: Su questo nuovo totale, viene calcolato il rendimento lordo annuale in base al tasso che hai inserito.\n3.  **Applicazione delle Tasse**: Il rendimento generato in quell'anno (la plusvalenza) viene tassato al 26%. Questo importo viene sottratto.\n4.  **Reinvestimento Netto**: Il capitale rimanente, comprensivo del guadagno netto, diventa la base di calcolo per l'anno successivo. È questo il cuore dell'interesse composto: anche i guadagni già tassati generano nuovi guadagni.\n\n#### **Interpretazione dei Risultati**\n\n* **Capitale Finale Netto**: La cifra più importante. È la stima di quanto avrai a disposizione alla fine del periodo, dopo aver pagato tutte le tasse sui guadagni.\n* **Totale Capitale Investito**: La somma del tuo capitale iniziale e di tutti i contributi mensili. Ti aiuta a visualizzare quanto hai messo di tasca tua.\n* **Interessi Lordi Guadagnati**: Il totale dei rendimenti generati prima dell'applicazione delle tasse. Mostra la piena potenza del tuo investimento.\n* **Tasse Totali Stimate**: La stima dell'imposta complessiva versata allo Stato. Comprendere questo valore è essenziale per una pianificazione finanziaria consapevole.\n\n### **Parte 2: Approfondimento sulla Tassazione delle Rendite Finanziarie**\n\nIn Italia, i profitti derivanti da investimenti finanziari (azioni, obbligazioni, ETF, fondi, etc.) sono definiti **\"redditi diversi di natura finanziaria\"** e sono soggetti a un'imposta sostitutiva. Dal 2014, l'aliquota standard è del **26%** (fanno eccezione i titoli di stato e strumenti equiparati, tassati al 12.5%).\n\n#### **Cos'è la Plusvalenza (Capital Gain)?**\n\nLa plusvalenza è semplicemente il **guadagno** ottenuto. Si calcola come:\n\n`Plusvalenza = Prezzo di Vendita - Prezzo di Acquisto`\n\nLa tassa del 26% si applica solo su questo importo positivo. Se non c'è guadagno, non c'è tassa.\n\n#### **Quando si Pagano le Tasse?**\n\nIl momento del pagamento dipende dal regime fiscale e dallo strumento finanziario:\n\n* **Regime Amministrato**: Il più comune per i piccoli investitori. È l'intermediario (la banca o il broker) a calcolare e versare le imposte per tuo conto, al momento della vendita (realizzo) dell'asset.\n* **Regime Dichiarativo**: L'investitore deve calcolare e dichiarare le plusvalenze nel Modello Redditi Persone Fisiche.\n* **Fondi ed ETF**: Per gli OICR (Organismi di Investimento Collettivo del Risparmio), la tassazione avviene sui proventi realizzati al momento del rimborso, ma il nostro calcolatore **simula un pagamento annuale** per mostrare l'effetto di erosione fiscale nel tempo e rendere più accurata la stima della capitalizzazione netta.\n\n### **Parte 3: La Formula e la Strategia**\n\nLa formula base dell'interesse composto è `FV = P(1+r)^n`. Tuttavia, con versamenti periodici (PMT) e tassazione (T), il calcolo diventa un processo iterativo, come quello implementato in questo strumento.\n\n`Capitale(t) = (Capitale(t-1) + Versamenti(t)) * (1 + Rendimento * (1 - Tassa))`\n\n**Implicazioni Strategiche:**\n\n* **Orizzonte Temporale**: Il tempo è il tuo più grande alleato. Più a lungo lasci i tuoi soldi investiti, più l'effetto composto diventa esponenziale.\n* **Costi**: Questo calcolatore non include i costi di gestione degli strumenti finanziari (es. TER di un ETF). Ricorda che un costo dell'1% annuo può ridurre drasticamente il tuo capitale finale. Scegli sempre strumenti efficienti e a basso costo.\n* **Consistenza**: Versare contributi regolari (PAC - Piano di Accumulo del Capitale) è una strategia potente per mitigare la volatilità del mercato e costruire il capitale con disciplina.\n\n**Disclaimer**: Questo calcolatore è uno strumento di simulazione a scopo educativo e informativo. I risultati sono stime basate sui dati inseriti e non costituiscono una previsione di rendimento reale né una consulenza finanziaria. I rendimenti passati non sono indicativi di quelli futuri. La normativa fiscale può cambiare.",
  "seoSchema": {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Come funziona l'interesse composto?", "acceptedAnswer": { "@type": "Answer", "text": "L'interesse composto è il processo attraverso il quale gli interessi guadagnati su un investimento vengono reinvestiti, generando a loro volta nuovi interessi. Questo crea un effetto di crescita esponenziale, o 'effetto valanga', specialmente su orizzonti temporali lunghi." } },
      { "@type": "Question", "name": "Come viene tassato il guadagno da un investimento in Italia?", "acceptedAnswer": { "@type": "Answer", "text": "In Italia, la maggior parte dei guadagni derivanti da investimenti finanziari (plusvalenze o capital gain) è soggetta a un'imposta sostitutiva del 26%. Questa tassa si applica solo sul profitto netto generato. Alcuni strumenti, come i titoli di Stato, beneficiano di un'aliquota agevolata del 12.5%." } },
      { "@type": "Question", "name": "Cosa significa 'capitalizzazione netta'?", "acceptedAnswer": { "@type": "Answer", "text": "La capitalizzazione netta si riferisce alla crescita del capitale tenendo conto dell'impatto delle tasse. Questo calcolatore simula la capitalizzazione netta applicando annualmente l'imposta del 26% sui guadagni generati, fornendo una stima più realistica del montante finale rispetto a un calcolo al lordo." } },
      { "@type": "Question", "name": "Questo calcolatore considera i costi dello strumento finanziario (es. TER)?", "acceptedAnswer": { "@type": "Answer", "text": "No, questo strumento non tiene conto dei costi di gestione (come il TER di un ETF o le commissioni di un fondo). Per una stima più precisa, dovresti sottrarre i costi annui dal 'Tasso di Rendimento Annuo Lordo' prima di inserirlo nel calcolatore." } }
    ]
  }
};

// --- Componenti di utilità ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 cursor-pointer"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);

// --- Componente per l'iniezione dello Schema SEO ---
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/, '').replace(/\*\*$/, '')) }} />;
                if (trimmedBlock.startsWith('* ')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                if (trimmedBlock.startsWith('`')) return <pre key={index} className="bg-gray-100 p-3 rounded-md text-xs font-mono break-words">{trimmedBlock.replace(/`/g, '')}</pre>;
                return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
            })}
        </div>
    );
};

// --- Grafico Caricato Dinamicamente ---
const DynamicChart = dynamic(
    () => Promise.resolve(({ data }: { data: any[] }) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="anno" />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value)} />
                <ChartTooltip
                    formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)}
                    labelFormatter={(label) => `Anno ${label}`}
                />
                <Legend />
                <Bar dataKey="capitaleInvestito" stackId="a" name="Capitale Investito" fill="#60a5fa" />
                <Bar dataKey="interessiNetti" stackId="a" name="Interessi Netti (post-tasse)" fill="#2563eb" />
            </BarChart>
        </ResponsiveContainer>
    )),
    {
        ssr: false,
        loading: () => <div className="flex items-center justify-center h-full w-full text-gray-500">Caricamento grafico...</div>,
    }
);


const InteresseCompostoTassazioneCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        capitale_iniziale: 10000,
        contributo_mensile: 200,
        tasso_interesse_annuo: 7,
        durata_investimento: 20,
    };
    const [states, setStates] = useState(initialStates);
    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);
    
    const { calculatedOutputs, chartData } = useMemo(() => {
        const { capitale_iniziale, contributo_mensile, tasso_interesse_annuo, durata_investimento } = states;
        const rate = tasso_interesse_annuo / 100;
        const contributoAnnuo = contributo_mensile * 12;

        let capitaleCorrente = Number(capitale_iniziale);
        let totaleTasse = 0;
        let totaleInteressiLordi = 0;
        const yearlyData: { anno: number; capitaleInvestito: number; interessiNetti: number; capitaleFinale: number }[] = [];

        for (let year = 1; year <= durata_investimento; year++) {
            const capitaleAInizioAnno = capitaleCorrente;
            const capitalePerCalcoloInteressi = capitaleAInizioAnno + contributoAnnuo;
            const interessiAnno = capitalePerCalcoloInteressi * rate;
            const tasseAnno = interessiAnno * 0.26;
            const interessiNettiAnno = interessiAnno - tasseAnno;

            capitaleCorrente += contributoAnnuo + interessiNettiAnno;
            totaleTasse += tasseAnno;
            totaleInteressiLordi += interessiAnno;
            
            yearlyData.push({
                anno: year,
                capitaleInvestito: Number(capitale_iniziale) + (contributoAnnuo * year),
                interessiNetti: capitaleCorrente - (Number(capitale_iniziale) + (contributoAnnuo * year)),
                capitaleFinale: capitaleCorrente
            });
        }
        
        const capitale_investito = Number(capitale_iniziale) + (contributoAnnuo * durata_investimento);
        return {
            calculatedOutputs: {
                capitale_finale_netto: capitaleCorrente,
                capitale_investito: capitale_investito,
                interessi_guadagnati_lordi: totaleInteressiLordi,
                tasse_totali_pagate: totaleTasse,
            },
            chartData: yearlyData
        };
    }, [states]);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("Impossibile esportare in PDF in questo ambiente.");
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, timestamp: new Date().toISOString() };
            const results = JSON.parse(localStorage.getItem('calculator_results') || '[]');
            results.unshift(payload);
            localStorage.setItem('calculator_results', JSON.stringify(results.slice(0, 50)));
            alert('Risultato salvato con successo!');
        } catch {
            alert('Impossibile salvare il risultato.');
        }
    }, [slug, title, states, calculatedOutputs]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    
    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6" ref={calculatorRef}>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                    <p className="text-gray-600 mb-6">Simula la crescita del tuo capitale nel tempo, includendo l'impatto realistico della tassazione al 26% sui guadagni.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {inputs.map(input => (
                            <div key={input.id}>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                                    {input.label}
                                    <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                </label>
                                <div className="relative">
                                    <input
                                        id={input.id}
                                        type="number"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2"
                                        value={(states as any)[input.id]}
                                        min={input.min}
                                        step={input.step}
                                        onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">{input.unit}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Risultati della Simulazione</h2>
                        {outputs.map(output => (
                            <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'capitale_finale_netto' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                                <span className="text-base font-medium text-gray-700">{output.label}</span>
                                <span className={`text-xl md:text-2xl font-bold ${output.id === 'capitale_finale_netto' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                    {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '€...'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Crescita dell'Investimento nel Tempo</h3>
                        <div className="h-80 w-full bg-gray-50 p-2 rounded-lg border">
                            {isClient && <DynamicChart data={chartData} />}
                        </div>
                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-2 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="w-full bg-red-50 border border-red-200 rounded-md px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-6 bg-white shadow-lg">
                        <h2 className="font-semibold text-xl mb-4 text-gray-800">Guida e Approfondimenti</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/imposta-sostitutiva-sui-redditi-di-capitale-e-sui-redditi-diversi" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Imposta sostitutiva sui redditi</a></li>
                            <li><a href="https://www.gazzettaufficiale.it/eli/id/2013/12/23/13G00171/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge di Stabilità 2014 (aumento aliquota al 26%)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default InteresseCompostoTassazioneCalculator;