'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const meta = {
  title: "Calcolatore Convenienza Fondo Pensione vs. TFR in Azienda",
  description: "Simula e confronta il tuo capitale finale lasciando il TFR in azienda o versandolo in un fondo pensione. Scopri il vantaggio fiscale e il rendimento."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 inline-block">
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
            "name": "È più conveniente lasciare il TFR in azienda o metterlo in un fondo pensione?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Per la maggior parte dei lavoratori, specialmente quelli con un lungo orizzonte temporale, il fondo pensione è significativamente più conveniente grazie a tre fattori: il contributo aggiuntivo del datore di lavoro, i rendimenti potenzialmente più alti dei mercati finanziari e, soprattutto, un regime fiscale molto più vantaggioso sia durante l'accumulo che al momento della liquidazione."
            }
          },
          {
            "@type": "Question",
            "name": "Quali sono i vantaggi fiscali del fondo pensione?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I vantaggi fiscali sono tre: 1) Deducibilità dei contributi versati (escluso il TFR) fino a 5.164,57€ all'anno, che riduce l'IRPEF da pagare. 2) Tassazione agevolata sui rendimenti al 20% (o 12,5% su titoli di stato) invece del 26%. 3) Tassazione finale sulla prestazione dal 15% al 9%, contro un'aliquota minima del 23% per il TFR in azienda."
            }
          },
          {
            "@type": "Question",
            "name": "Il rendimento del fondo pensione è garantito come quello del TFR?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, il rendimento del TFR in azienda è garantito per legge (1,5% + 75% dell'inflazione). Il rendimento del fondo pensione dipende dai mercati finanziari e non è garantito, ma può essere significativamente più alto nel lungo periodo. Esistono comparti a capitale garantito per chi è avverso al rischio o vicino alla pensione."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                if (block.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (block.startsWith('| Caratteristica |')) {
                    const rows = block.split('\n').filter(r => r.includes('|'));
                    const headers = rows[0].split('|').slice(1, -1).map(h => h.trim());
                    const bodyRows = rows.slice(2).map(row => row.split('|').slice(1, -1).map(cell => cell.trim()));
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map((h, i) => <th key={i} className="p-2 border text-left font-semibold">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {bodyRows.map((row, i) => (
                                        <tr key={i}>{row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (block.trim()) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.trim()) }} />;
                return null;
            })}
        </div>
    );
};


// --- Dati di configurazione del calcolatore (inclusi direttamente) ---
const calculatorData = {
  "slug": "convenienza-fondo-pensione-vs-tfr",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Convenienza Fondo Pensione vs. TFR in Azienda",
  "lang": "it",
  "tags": "calcolatore fondo pensione, convenienza tfr, tfr in azienda, previdenza complementare, tassazione tfr, tassazione fondo pensione, rendimento fondo pensione, contributo datore di lavoro, deducibilità fiscale, riscatto fondo pensione",
  "inputs": [
    { "id": "ral", "label": "Reddito Annuo Lordo (RAL)", "type": "number" as const, "unit": "€", "min": 10000, "step": 1000, "tooltip": "Il tuo stipendio lordo annuale. È la base per calcolare la quota di TFR maturata ogni anno." },
    { "id": "eta_attuale", "label": "La tua età attuale", "type": "number" as const, "unit": "anni", "min": 18, "step": 1, "tooltip": "La tua età oggi. Serve a determinare l'orizzonte temporale fino alla pensione." },
    { "id": "eta_pensionamento", "label": "Età di pensionamento prevista", "type": "number" as const, "unit": "anni", "min": 60, "step": 1, "tooltip": "L'età in cui prevedi di andare in pensione. L'età legale attuale è 67 anni, ma puoi inserire un valore diverso." },
    { "id": "aliquota_irpef", "label": "Aliquota IRPEF marginale", "type": "number" as const, "unit": "%", "min": 23, "step": 1, "tooltip": "La tua aliquota IRPEF più alta (es. 23%, 25%, 35%, 37%, 43%). Serve a calcolare il beneficio fiscale immediato derivante dai versamenti al fondo." },
    { "id": "rendimento_fondo", "label": "Rendimento annuo netto atteso del fondo", "type": "number" as const, "unit": "%", "min": 0, "step": 0.5, "tooltip": "Il rendimento medio annuo che ti aspetti dal comparto del fondo pensione scelto (es. 2% per un comparto garantito, 4-5% per un bilanciato)." },
    { "id": "tasso_inflazione_stimato", "label": "Tasso di inflazione medio annuo stimato", "type": "number" as const, "unit": "%", "min": 0, "step": 0.1, "tooltip": "L'inflazione media annua attesa per i prossimi anni. Incide sulla rivalutazione del TFR lasciato in azienda (es. 2%)." },
    { "id": "contributo_lavoratore", "label": "Tuo contributo volontario", "type": "number" as const, "unit": "% del RAL", "min": 0, "step": 0.1, "tooltip": "La percentuale del tuo RAL che versi volontariamente al fondo. Spesso, versare una quota minima (es. 1-1.5%) 'sblocca' il contributo del datore di lavoro." },
    { "id": "contributo_datore", "label": "Contributo del datore di lavoro", "type": "number" as const, "unit": "% del RAL", "min": 0, "step": 0.1, "tooltip": "La percentuale del RAL versata dall'azienda, solitamente prevista dai CCNL se anche il lavoratore contribuisce. È un extra-stipendio a tutti gli effetti." }
  ],
  "outputs": [
    { "id": "montante_netto_totale_fondo", "label": "Risultato Netto Finale (Fondo Pensione)", "unit": "€" },
    { "id": "montante_netto_tfr", "label": "Risultato Netto Finale (TFR in Azienda)", "unit": "€" },
    { "id": "guadagno_netto_fondo_vs_tfr", "label": "Vantaggio Economico Netto del Fondo Pensione", "unit": "€" }
  ],
  "content": "### **Guida Definitiva: Scegliere tra TFR in Azienda e Fondo Pensione**\n\n**Analisi Approfondita dei Vantaggi Fiscali, dei Rendimenti e dei Rischi**\n\nLa scelta sulla destinazione del proprio Trattamento di Fine Rapporto (TFR) è una delle decisioni finanziarie più importanti nella vita di un lavoratore. Lasciarlo in azienda o versarlo a un fondo di previdenza complementare? La risposta non è univoca, ma un'analisi basata sui numeri rivela quasi sempre una netta convenienza per la seconda opzione, specialmente su un orizzonte temporale lungo.\n\nQuesto strumento è progettato per offrirti una **stima quantitativa chiara e trasparente**, aiutandoti a comprendere l'impatto reale di questa scelta sul tuo capitale futuro. **Ricorda**: questa è una simulazione basata su ipotesi e non può sostituire una consulenza finanziaria personalizzata.\n\n### **Parte 1: I Due Scenari a Confronto - Logica del Calcolatore**\n\n#### **Scenario 1: TFR Lasciato in Azienda**\n\n* **Come matura?** Ogni anno, l'azienda accantona una quota del tuo stipendio pari alla tua **RAL diviso 13,5**.\n* **Come si rivaluta?** Il capitale accumulato si rivaluta annualmente a un tasso fisso dell'**1,5%** più il **75% del tasso di inflazione** ISTAT. È un meccanismo di protezione, sicuro ma con un rendimento reale spesso basso o nullo.\n* **Come viene tassato?** Al momento della liquidazione, il TFR è soggetto a **tassazione separata**. L'aliquota è calcolata sulla media dei tuoi redditi IRPEF degli ultimi cinque anni, ma non può essere inferiore al **23%**. Questo è, nella maggior parte dei casi, uno svantaggio significativo.\n\n#### **Scenario 2: TFR Versato nel Fondo Pensione**\n\n* **Cosa si versa?** Nel fondo non finisce solo il TFR. Si aggiungono altri due flussi di denaro:\n  1.  **Il tuo contributo volontario**: Una piccola percentuale del tuo stipendio che decidi di versare.\n  2.  **Il contributo del datore di lavoro**: Se versi la tua quota, quasi tutti i CCNL prevedono un contributo aggiuntivo a carico dell'azienda. **Questi sono soldi extra che altrimenti non riceveresti**.\n* **Come cresce il capitale?** Il montante è investito sui mercati finanziari secondo la linea di investimento che scegli (da quelle più sicure a quelle più aggressive). I rendimenti non sono garantiti, ma storicamente e su orizzonti lunghi, anche un comparto bilanciato ha quasi sempre sovraperformato la rivalutazione del TFR.\n* **Quali sono i vantaggi fiscali?** Questo è il punto di svolta.\n  1.  **Deducibilità Immediata**: I contributi volontari e quelli del datore sono **deducibili dal tuo reddito imponibile** fino a 5.164,57 € all'anno. Questo significa che paghi meno tasse ogni anno, ottenendo un risparmio fiscale immediato che questo calcolatore quantifica.\n  2.  **Tassazione sui Rendimenti**: I rendimenti generati dal fondo sono tassati con un'imposta sostitutiva del **20%** (o 12,5% per la quota investita in titoli di Stato), molto più bassa del 26% applicato alla maggior parte degli altri investimenti finanziari.\n  3.  **Tassazione sulla Prestazione Finale**: Al momento della pensione, il capitale accumulato (esclusi i rendimenti già tassati) viene tassato con un'aliquota del **15%**, che si riduce dello 0,30% per ogni anno di partecipazione al fondo oltre il quindicesimo, fino a un'aliquota minima del **9%**. Un vantaggio enorme rispetto al minimo 23% del TFR.\n\n### **Parte 2: Analisi Approfondita dei Fattori Chiave**\n\n#### **L'Orizzonte Temporale è il Tuo Migliore Alleato**\n\nPiù sei giovane, più la convenienza del fondo pensione è schiacciante. L'interesse composto ha decenni per lavorare e amplificare i rendimenti, mentre i vantaggi fiscali si accumulano anno dopo anno. Per chi è vicino alla pensione, la valutazione deve essere più attenta, ma spesso il vantaggio fiscale da solo rende la scelta conveniente.\n\n#### **Il Contributo del Datore di Lavoro: Un Regalo da non Rifiutare**\n\nVersare la quota minima richiesta dal tuo CCNL per attivare il contributo del datore di lavoro è una delle mosse finanziarie più intelligenti che puoi fare. È come ricevere un piccolo aumento di stipendio che viene direttamente investito per il tuo futuro.\n\n### **Parte 3: Tabella Comparativa Dettagliata**\n\n| Caratteristica | TFR in Azienda | Fondo Pensione |\n| :--- | :--- | :--- |\n| **Fonte Capitale** | Solo TFR (RAL / 13,5) | TFR + Contributo Lavoratore + Contributo Datore |\n| **Rendimento** | Garantito: 1,5% + 75% inflazione | Legato ai mercati finanziari (variabile) |\n| **Vantaggio Fiscale** | Nessuno in fase di accumulo | Deducibilità contributi (fino a 5.164,57€/anno) |\n| **Tassazione Rendimenti** | Tassati come parte del montante | Imposta sostitutiva agevolata (max 20%) |\n| **Tassazione Finale** | Minimo **23%** (tassazione separata) | Dal **15%** al **9%** (in base agli anni di adesione) |\n| **Flessibilità** | Liquidazione solo a fine rapporto | Anticipazioni per spese sanitarie, acquisto/ristrutturazione prima casa, ulteriori esigenze |\n| **Rischio** | Rischio insolvenza azienda (con garanzia INPS) | Rischio di mercato (mitigabile con scelta comparto) |\n\n\n### **Conclusione: Una Scelta Strategica per il Tuo Futuro**\n\nPer la stragrande maggioranza dei lavoratori dipendenti, soprattutto per chi ha davanti a sé più di 10-15 anni di lavoro, la scelta di destinare il TFR a un fondo pensione non è solo conveniente, ma è una mossa strategica fondamentale. I tre pilastri – **contributo del datore, interesse composto e vantaggi fiscali** – creano un effetto valanga che il meccanismo di rivalutazione del TFR in azienda non può eguagliare. Usa questo calcolatore per visualizzare il tuo potenziale futuro e prendere una decisione informata."
};

const ConvenienzaFondoPensioneVsTfrCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        ral: 32000,
        eta_attuale: 30,
        eta_pensionamento: 67,
        aliquota_irpef: 35,
        rendimento_fondo: 4,
        tasso_inflazione_stimato: 2,
        contributo_lavoratore: 1.5,
        contributo_datore: 1.5,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);
    
    const calculatedOutputs = useMemo(() => {
        const { ral, eta_attuale, eta_pensionamento, aliquota_irpef, rendimento_fondo, tasso_inflazione_stimato, contributo_lavoratore, contributo_datore } = states;
        const anni_contribuzione = Math.max(0, eta_pensionamento - eta_attuale);
        const quota_tfr_annua = ral > 0 ? ral / 13.5 : 0;
        
        // --- TFR in Azienda ---
        const rivalutazione_tfr_annua = 0.015 + (tasso_inflazione_stimato / 100 * 0.75);
        let montante_lordo_tfr = 0;
        for (let i = 0; i < anni_contribuzione; i++) {
            montante_lordo_tfr = (montante_lordo_tfr * (1 + rivalutazione_tfr_annua)) + quota_tfr_annua;
        }
        const tassazione_tfr = montante_lordo_tfr * 0.23; // Simplificazione al 23%
        const montante_netto_tfr = montante_lordo_tfr - tassazione_tfr;

        // --- Fondo Pensione ---
        const contributo_annuo_lavoratore = ral * (contributo_lavoratore / 100);
        const contributo_annuo_datore = ral * (contributo_datore / 100);
        const contributi_deducibili_annui = Math.min(5164.57, contributo_annuo_lavoratore + contributo_annuo_datore);
        const vantaggio_fiscale_annuo = contributi_deducibili_annui * (aliquota_irpef / 100);
        const vantaggio_fiscale_totale = vantaggio_fiscale_annuo * anni_contribuzione;
        
        const versamento_annuo_fondo = quota_tfr_annua + contributo_annuo_lavoratore + contributo_annuo_datore;
        let montante_lordo_fondo = 0;
        for (let i = 0; i < anni_contribuzione; i++) {
            montante_lordo_fondo = (montante_lordo_fondo * (1 + rendimento_fondo / 100)) + versamento_annuo_fondo;
        }
        
        const aliquota_tassazione_fondo = Math.max(0.09, 0.15 - (Math.max(0, anni_contribuzione - 15) * 0.003));
        const tassazione_fondo = montante_lordo_fondo * aliquota_tassazione_fondo;
        const montante_netto_fondo = montante_lordo_fondo - tassazione_fondo;

        const montante_netto_totale_fondo = montante_netto_fondo + vantaggio_fiscale_totale;
        const guadagno_netto_fondo_vs_tfr = montante_netto_totale_fondo - montante_netto_tfr;

        return {
            montante_netto_totale_fondo,
            montante_netto_tfr,
            guadagno_netto_fondo_vs_tfr,
            vantaggio_fiscale_totale, // Extra data for chart
        };
    }, [states]);

    const chartData = [
        { 
            name: 'Scenari Finali', 
            'TFR in Azienda': calculatedOutputs.montante_netto_tfr, 
            'Fondo Pensione (Netto + Vantaggio Fiscale)': calculatedOutputs.montante_netto_totale_fondo 
        },
    ];
    
    const formulaUsata = `Vantaggio Fondo = (Montante Netto Fondo + Vantaggio Fiscale Totale) - Montante Netto TFR`;

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

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
                        <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">Simula il tuo futuro previdenziale e scopri la scelta più vantaggiosa per te.</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza finanziaria. I risultati si basano su ipotesi e semplificazioni.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {inputs.map(input => (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={input.id}>
                                            {input.label}{' '}
                                            {input.tooltip && <Tooltip text={input.tooltip}><InfoIcon /></Tooltip>}
                                        </label>
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2 text-right" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">{input.unit}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultati della Simulazione</h2>
                            <div className="space-y-4">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'guadagno_netto_fondo_vs_tfr' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'guadagno_netto_fondo_vs_tfr' ? 'text-green-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Visivo del Capitale Finale</h3>
                                <div className="h-80 w-full bg-white p-4 rounded-lg border">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                                <YAxis type="category" dataKey="name" hide />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                                <Bar dataKey="TFR in Azienda" fill="#64748b" />
                                                <Bar dataKey="Fondo Pensione (Netto + Vantaggio Fiscale)" fill="#4f46e5" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Dati</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.covip.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">COVIP</a> - Commissione di Vigilanza sui Fondi Pensione.</li>
                            <li><a href="https://www.mef.gov.it/focus/La-disciplina-della-previdenza-complementare/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Decreto Legislativo 252/2005</a> - Disciplina delle forme pensionistiche complementari.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default ConvenienzaFondoPensioneVsTfrCalculator;