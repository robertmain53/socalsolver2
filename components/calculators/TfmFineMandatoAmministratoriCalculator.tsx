'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
// Import statici per il componente grafico che verrà caricato dinamicamente
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';


// --- DATI DI CONFIGURAZIONE (dal JSON) ---
const calculatorData = {
  "slug": "tfm-fine-mandato-amministratori",
  "category": "PMI e Impresa",
  "title": "Calcolatore TFM (Trattamento di Fine Mandato) per Amministratori",
  "lang": "it",
  "inputs": [
    { "id": "compenso_annuo_amministratore", "label": "Compenso Lordo Annuo Amministratore", "type": "number" as const, "unit": "€", "min": 10000, "step": 1000, "tooltip": "Inserisci il compenso lordo annuo deliberato per l'amministratore, su cui verrà calcolato l'accantonamento TFM." },
    { "id": "percentuale_accantonamento_tfm", "label": "Percentuale di Accantonamento TFM", "type": "number" as const, "unit": "%", "min": 10, "max": 35, "step": 1, "tooltip": "La prassi consiglia una percentuale tra il 20% e il 30% del compenso annuo per essere considerata 'congrua' e non rischiare contestazioni fiscali." },
    { "id": "durata_mandato", "label": "Durata dell'Accantonamento", "type": "number" as const, "unit": "anni", "min": 2, "max": 30, "step": 1, "tooltip": "Indica il numero di anni per cui si prevede di accantonare il TFM. Questo è il fattore chiave per la crescita del capitale." },
    { "id": "rendimento_investimento_tfm", "label": "Rendimento Annuo Netto Stimato", "type": "number" as const, "unit": "%", "min": 0, "max": 10, "step": 0.5, "tooltip": "Stima il rendimento annuo netto dell'investimento in cui vengono versate le quote TFM (es. polizza assicurativa, fondo di investimento)." },
    { "id": "aliquota_media_irpef", "label": "Aliquota Media IRPEF Amministratore", "type": "number" as const, "unit": "%", "min": 23, "max": 43, "step": 1, "tooltip": "Indica l'aliquota IRPEF media presunta al momento dell'incasso. È usata per calcolare la tassazione separata sul TFM erogato." }
  ],
  "outputs": [
    { "id": "tfm_netto_incassato", "label": "TFM Netto per l'Amministratore", "unit": "€" },
    { "id": "risparmio_ires_totale", "label": "Risparmio Fiscale Totale per l'Azienda (IRES)", "unit": "€" },
    { "id": "montante_finale_lordo", "label": "Montante Lordo Finale (Capitale + Interessi)", "unit": "€" },
    { "id": "imposta_sostitutiva_tfm", "label": "Imposte Totali a Carico dell'Amministratore", "unit": "€" }
  ],
  "content": "### **Guida Strategica al TFM: il Miglior Strumento di Pianificazione Fiscale per Amministratori**\n\n**Come trasformare un costo in un doppio vantaggio fiscale per l'azienda e per l'amministratore.**\n\nIl Trattamento di Fine Mandato (TFM) è un compenso aggiuntivo e differito che una società (tipicamente una S.r.l.) può riconoscere ai propri amministratori. Se strutturato correttamente, rappresenta uno degli strumenti di pianificazione fiscale più efficaci a disposizione, generando un significativo risparmio sia per l'azienda che per il beneficiario.\n\nQuesto calcolatore non si limita a calcolare l'importo finale, ma simula l'intero ciclo di vita del TFM, evidenziando i vantaggi fiscali anno per anno e il potere dell'interesse composto nel tempo.\n\n### **Parte 1: Logica del Calcolatore e Parametri Chiave**\n\nPer comprendere il potenziale del TFM, è essenziale capire le leve che ne determinano il risultato finale:\n\n1.  **Compenso e Percentuale di Accantonamento**: L'azienda accantona annualmente una somma, di solito in percentuale sul compenso lordo. Questo importo è **interamente deducibile** dal reddito imponibile della società, generando un risparmio IRES (attualmente al 24%) immediato.\n\n2.  **Durata e Rendimento**: Il vero potenziale si sprigiona nel tempo. Le somme accantonate non rimangono ferme, ma vengono tipicamente investite (es. in polizze assicurative dedicate). Il rendimento generato, unito a una lunga durata, fa crescere il montante in modo esponenziale grazie all'**interesse composto**.\n\n3.  **Tassazione Separata**: Al termine del mandato, quando l'amministratore incassa il TFM, non viene applicata la tassazione progressiva IRPEF (che potrebbe arrivare al 43%), bensì una più vantaggiosa **tassazione separata**. L'imposta viene calcolata sulla base dell'aliquota media degli ultimi due anni, garantendo un notevole risparmio fiscale personale.\n\n### **Parte 2: Guida Approfondita al TFM**\n\n#### **Il Doppio Vantaggio Fiscale Spiegato**\n\n* **Per l'Azienda (S.r.l.)**: Ogni euro accantonato a TFM è un costo deducibile nell'anno di competenza. Su un accantonamento di 20.000 €, l'azienda risparmia immediatamente 4.800 € di IRES (20.000 € * 24%). È un modo fiscalmente efficiente per remunerare gli amministratori, trasformando un'uscita di cassa futura in un risparmio fiscale presente.\n\n* **Per l'Amministratore**: Incassare 100.000 € come compenso ordinario può costare oltre 40.000 € di IRPEF. Incassarli come TFM, con un'aliquota media del 30%, costa 30.000 €, con un risparmio di oltre 10.000 € di imposte personali.\n\n#### **Requisiti Indispensabili: L'Atto con Data Certa**\n\nPer beneficiare della deducibilità e della tassazione separata, la volontà di erogare il TFM e i criteri per il suo calcolo devono risultare da un **atto scritto con data certa anteriore all'inizio del rapporto**. Senza questo requisito formale, l'Agenzia delle Entrate può contestare l'operazione, rendendo i costi indeducibili per l'azienda e tassando l'importo con l'aliquota IRPEF massima per l'amministratore.\n\nMetodi per ottenere la data certa:\n* Firma digitale e marca temporale.\n* Invio del verbale tramite Posta Elettronica Certificata (PEC).\n* Registrazione del verbale di assemblea presso l'Agenzia delle Entrate.\n\n#### **Il Principio di Congruità**\n\nL'importo accantonato annualmente deve essere ragionevole e proporzionato al compenso dell'amministratore, al volume d'affari e alla capacità finanziaria dell'azienda. Una percentuale di accantonamento **tra il 20% e il 30% del compenso annuo** è generalmente considerata un riferimento prudente e difendibile in caso di controlli.\n\n#### **Gestione del TFM: Le Polizze Assicurative**\n\nLa soluzione più comune e sicura per la gestione degli accantonamenti è la sottoscrizione di una **polizza assicurativa (Ramo I o Unit Linked)** intestata all'azienda, con l'amministratore come beneficiario. Questo approccio offre diversi vantaggi:\n* **Separazione Patrimoniale**: Le somme sono protette da eventuali aggressioni al patrimonio aziendale.\n* **Gestione Finanziaria Professionale**: Il capitale viene investito da esperti per massimizzarne il rendimento.\n* **Coperture Aggiuntive**: Spesso includono coperture caso morte o invalidità, offrendo una protezione ulteriore all'amministratore.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Cos'è il TFM e a chi spetta?", "acceptedAnswer": { "@type": "Answer", "text": "Il TFM (Trattamento di Fine Mandato) è una forma di compenso differito per gli amministratori di società di capitali, come le S.r.l. Non è obbligatorio per legge come il TFR per i dipendenti, ma è un potente strumento di pianificazione fiscale se deliberato correttamente." } }, { "@type": "Question", "name": "Come viene tassato il TFM per l'amministratore?", "acceptedAnswer": { "@type": "Answer", "text": "Se l'erogazione del TFM risulta da un atto con data certa, l'amministratore beneficia della 'tassazione separata'. L'imposta si calcola applicando l'aliquota media IRPEF dei due anni precedenti, che è quasi sempre più bassa dell'aliquota marginale, con un notevole risparmio fiscale." } }, { "@type": "Question", "name": "Cosa significa 'atto con data certa' e perché è fondamentale?", "acceptedAnswer": { "@type": "Answer", "text": "Significa che la delibera che istituisce il TFM deve avere una data legalmente provabile e anteriore all'inizio del mandato. Si ottiene con PEC, firma digitale o registrazione dell'atto. È un requisito non negoziabile per ottenere i vantaggi fiscali: deducibilità per l'azienda e tassazione separata per l'amministratore." } } ] }
};

// --- Componenti UI Riutilizzabili ---
const InfoIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> );
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => ( <div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div> );
const SchemaInjector = ({ schema }: { schema: object }) => ( <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /> );

// --- Componente per il Rendering del Contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processLine = (line: string) => line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
        <div className="space-y-4 text-gray-700">
            {content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('### **')) { return <h3 key={index} className="text-xl font-bold mt-6 mb-2 text-gray-800" dangerouslySetInnerHTML={{ __html: processLine(paragraph.replace('### **', '').slice(0, -2)) }} />; }
                if (paragraph.startsWith('#### **')) { return <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-800" dangerouslySetInnerHTML={{ __html: processLine(paragraph.replace('#### **', '').slice(0, -2)) }} />; }
                if (paragraph.startsWith('* ')) {
                    const items = paragraph.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-1">{items.map((item, i) => <li key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: processLine(item) }} />)}</ul>
                }
                return <p key={index} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: processLine(paragraph) }} />;
            })}
        </div>
    );
};

// --- Componente Wrapper per il Grafico (per Lazy Loading) ---
const TfmChartComponent = ({ data }: { data: any[] }) => {
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="anno" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} tick={{ fontSize: 12 }} />
          <RechartsTooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="capitale" stackId="a" name="Capitale Versato" fill="#4f46e5" />
          <Bar dataKey="interessi" stackId="a" name="Interessi Maturati" fill="#a5b4fc" />
        </BarChart>
      </ResponsiveContainer>
    );
};
const DynamicTfmChart = dynamic(() => Promise.resolve(TfmChartComponent), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg"><p className="text-sm text-gray-500">Caricamento grafico...</p></div>
});


// --- COMPONENTE PRINCIPALE DEL CALCOLATORE ---
const TfmFineMandatoAmministratoriCalculator: React.FC = () => {
    const { slug, title, inputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = { compenso_annuo_amministratore: 60000, percentuale_accantonamento_tfm: 25, durata_mandato: 10, rendimento_investimento_tfm: 3, aliquota_media_irpef: 35 };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    const { calculatedOutputs, chartData } = useMemo(() => {
        const { compenso_annuo_amministratore, percentuale_accantonamento_tfm, durata_mandato, rendimento_investimento_tfm, aliquota_media_irpef } = states;
        const tfm_accantonato_annuo = (compenso_annuo_amministratore || 0) * ((percentuale_accantonamento_tfm || 0) / 100);
        const risparmio_ires_totale = tfm_accantonato_annuo * 0.24 * (durata_mandato || 0);
        const r = (rendimento_investimento_tfm || 0) / 100;
        const n = durata_mandato || 0;

        const chartDataArray: { anno: number, capitale: number, interessi: number }[] = [];
        let montante_anno_precedente = 0;
        for (let i = 1; i <= n; i++) {
            const capitale_versato_cumulato = tfm_accantonato_annuo * i;
            const montante_attuale = tfm_accantonato_annuo * (((1 + r) ** i - 1) / r);
            const interessi_maturati = montante_attuale - capitale_versato_cumulato;
            chartDataArray.push({ anno: i, capitale: parseFloat(capitale_versato_cumulato.toFixed(2)), interessi: parseFloat(interessi_maturati.toFixed(2)) });
        }
        
        const montante_finale_lordo = chartDataArray.length > 0 ? (chartDataArray[chartDataArray.length-1].capitale + chartDataArray[chartDataArray.length-1].interessi) : tfm_accantonato_annuo * n;
        const imposta_sostitutiva_tfm = montante_finale_lordo * ((aliquota_media_irpef || 0) / 100);
        const tfm_netto_incassato = montante_finale_lordo - imposta_sostitutiva_tfm;
        
        return { calculatedOutputs: { tfm_netto_incassato, risparmio_ires_totale, montante_finale_lordo, imposta_sostitutiva_tfm }, chartData: chartDataArray };
    }, [states]);

    const handleExportPDF = useCallback(async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        if (!calculatorRef.current) return;
        const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${slug}.pdf`);
    }, [slug]);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Simula il doppio vantaggio fiscale del TFM per la tua S.r.l. e per te come amministratore.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore è uno strumento di simulazione. La corretta istituzione del TFM richiede una delibera con data certa e la consulenza di un commercialista.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {inputs.map(input => (
                                <div key={input.id}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                    </label>
                                    <div className="relative">
                                        <input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id] ?? ''} onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2" />
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className=" -lg -md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Simulazione 💰</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                                <p className="text-sm font-semibold text-indigo-800">Per l'Amministratore (Netto)</p>
                                <p className="text-2xl font-bold text-indigo-600">{isClient ? formatCurrency(calculatedOutputs.tfm_netto_incassato) : '...'}</p>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                <p className="text-sm font-semibold text-green-800">Per l'Azienda (Risparmio IRES)</p>
                                <p className="text-2xl font-bold text-green-600">{isClient ? formatCurrency(calculatedOutputs.risparmio_ires_totale) : '...'}</p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                             <p><strong>Montante Lordo Finale:</strong> <span className="font-medium">{isClient ? formatCurrency(calculatedOutputs.montante_finale_lordo) : '...'}</span></p>
                             <p><strong>Tassazione Separata:</strong> <span className="font-medium">{isClient ? formatCurrency(calculatedOutputs.imposta_sostitutiva_tfm) : '...'}</span></p>
                        </div>
                        <div className="mt-6">
                             <h3 className="text-lg font-semibold text-gray-700 mb-2">Crescita del TFM nel Tempo</h3>
                             <div className="h-64 w-full pr-4">
                                {isClient && <DynamicTfmChart data={chartData} />}
                             </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <button onClick={handleExportPDF} className="w-full bg-gray-100 text-gray-700 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors">Esporta PDF</button>
                            <button onClick={() => setStates(initialStates)} className="w-full bg-red-50 text-red-700 rounded-md px-3 py-2 hover:bg-red-100 transition-colors">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Guida Strategica al TFM</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Riferimenti Normativi e Fonti</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Art. 17, c. 1, lett. c), TUIR (Tassazione Separata)</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Art. 105, TUIR (Deducibilità Accantonamenti)</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Art. 2549 Codice Civile (Associazione in partecipazione)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TfmFineMandatoAmministratoriCalculator;