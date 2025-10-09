'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Tasse per Istruttori di Palestra in Partita IVA [2025]",
  description: "Simula la tassazione per personal trainer e istruttori sportivi con Partita IVA in regime forfettario o ordinario. Calcola imposte, contributi INPS e reddito netto."
};

// --- Helper Components ---

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

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
            "name": "Quale Codice ATECO deve usare un istruttore di palestra?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il Codice ATECO più comune e appropriato per istruttori di palestra e personal trainer è 85.51.00 - Corsi sportivi e ricreativi, che in Regime Forfettario ha un coefficiente di redditività del 78%."
            }
          },
          {
            "@type": "Question",
            "name": "Posso dedurre i costi delle attrezzature in Regime Forfettario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, nel Regime Forfettario i costi non sono deducibili analiticamente. Viene riconosciuta una spesa forfettaria pari al 22% dei ricavi (100% - 78% del coefficiente di redditività), indipendentemente dai costi reali sostenuti."
            }
          },
          {
            "@type": "Question",
            "name": "Quando conviene il Regime Ordinario per un personal trainer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il Regime Ordinario Semplificato può essere più conveniente del Forfettario solo se i costi deducibili reali e documentabili superano significativamente la quota forfettaria del 22% dei ricavi."
            }
          }
        ]
      })
    }}
  />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('#### **')) {
            return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        if (trimmedBlock.includes("Tipo di Calcolo")) {
          const rows = trimmedBlock.split('\n').slice(1);
          const headers = trimmedBlock.split('\n')[0].split('**').filter(h => h.trim());
          return (
            <div key={index} className="overflow-x-auto my-4">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>{headers.map((header, hIndex) => <th key={hIndex} className="p-2 border text-left">{header}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((row, rIndex) => {
                    const cells = row.split('**').filter(c => c.trim());
                    return (
                        <tr key={rIndex}>
                            <td className="p-2 border font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cells[0]) }} />
                            <td className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cells[1] || '') }} />
                            <td className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cells[2] || '') }} />
                        </tr>
                    );
                  })}
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

// --- Dati di Configurazione ---
const calculatorData = {
  "slug": "tassazione-istruttori-palestra-partita-iva", "category": "Fisco e Lavoro Autonomo", "title": "Calcolatore Tassazione per Istruttori di Palestra in Partita IVA", "lang": "it",
  "inputs": [
    { "id": "ricaviAnnuì", "label": "Ricavi Lordi Annuali", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei compensi che prevedi di incassare in un anno, al lordo di tasse e contributi." },
    { "id": "isForfettario", "label": "Scegli il Regime Fiscale", "type": "select", "options": [{ "label": "Regime Forfettario", "value": true }, { "label": "Regime Ordinario Semplificato", "value": false }], "tooltip": "Il Regime Forfettario è spesso la scelta più vantaggiosa per iniziare, grazie a una tassazione agevolata e meno adempimenti." },
    { "id": "isNuovaAttivita", "label": "Sei una startup? (primi 5 anni)", "type": "boolean", "condition": "isForfettario == true", "tooltip": "Se hai appena aperto la Partita IVA e rispetti i requisiti, hai diritto a un'imposta sostitutiva ridotta al 5% per i primi 5 anni." },
    { "id": "costiSostenuti", "label": "Costi Deducibili Sostenuti", "type": "number", "unit": "€", "min": 0, "step": 100, "condition": "isForfettario == false", "tooltip": "In Regime Ordinario, puoi dedurre i costi reali legati alla tua attività (es. affitto sala, acquisto attrezzature, software, etc.)." },
    { "id": "haAltraCoperturaPrevidenziale", "label": "Hai un'altra copertura previdenziale obbligatoria?", "type": "boolean", "tooltip": "Spunta questa casella se sei anche un lavoratore dipendente a tempo pieno o un pensionato. Questo riduce l'aliquota INPS da versare." },
    { "id": "contributiVersati", "label": "Contributi INPS già versati nell'anno", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo dei contributi INPS che hai già pagato durante l'anno (saldi e acconti). Questi sono deducibili dal reddito imponibile." }
  ],
  "outputs": [
    { "id": "redditoNetto", "label": "Reddito Netto Annuale Stimato", "unit": "€" }, { "id": "totaleTasseEContributi", "label": "Totale Tasse e Contributi", "unit": "€" }, { "id": "imposteDovute", "label": "Imposte Dovute (IRPEF o Sostitutiva)", "unit": "€" }, { "id": "contributiInpsDovuti", "label": "Contributi INPS Dovuti", "unit": "€" }, { "id": "redditoImponibileFiscale", "label": "Reddito Imponibile Fiscale", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione per Istruttori di Palestra e Personal Trainer**\n\n**Analisi dei Regimi Fiscali, Calcolo di Imposte e Contributi INPS, e Strategie di Ottimizzazione**\n\nAprire una Partita IVA come istruttore di palestra, personal trainer o professionista del fitness è un passo importante verso l'autonomia professionale. Comprendere il carico fiscale e previdenziale è fondamentale per gestire la propria attività con serenità e profitto. Questa guida, insieme al calcolatore interattivo, ha lo scopo di fornire un quadro chiaro e dettagliato delle opzioni disponibili, superando le semplici nozioni di base.\n\n**Disclaimer**: Questo strumento fornisce una stima accurata basata sulla normativa vigente, ma non sostituisce la consulenza di un commercialista qualificato. Ogni situazione individuale può presentare specificità che richiedono un'analisi professionale.\n\n### **Parte 1: I Fondamenti - Codice ATECO e Gestione Previdenziale**\n\n#### **Il Codice ATECO Corretto**\n\nIl primo passo formale nell'apertura della Partita IVA è la scelta del **Codice ATECO**, che identifica la tipologia di attività svolta. Per istruttori e personal trainer, il codice più appropriato è:\n\n* **85.51.00 - Corsi sportivi e ricreativi**: Questo codice include l'istruzione in discipline sportive, sia a livello di gruppo che individuale.\n\nLa scelta di questo codice ha un'implicazione diretta e fondamentale per chi aderisce al Regime Forfettario: determina il **coefficiente di redditività**, che per questa categoria è fissato al **78%**.\n\n#### **La Cassa Previdenziale: INPS Gestione Separata**\n\nGli istruttori sportivi, in quanto professionisti senza un albo o una cassa previdenziale specifica, hanno l'obbligo di iscriversi alla **Gestione Separata dell'INPS**. Questo comporta il versamento di contributi calcolati in percentuale sul reddito imponibile. Le aliquote principali per il 2025 sono:\n\n* **26,07%**: Aliquota piena, per chi non ha altra forma di previdenza obbligatoria.\n* **24%**: Aliquota ridotta, per chi è anche titolare di pensione o è iscritto ad altre gestioni previdenziali (es. lavoratore dipendente full-time).\n\nA differenza di artigiani e commercianti, i professionisti iscritti alla Gestione Separata **non sono soggetti al versamento di contributi minimali obbligatori**. I contributi si pagano solo se si produce reddito.\n\n### **Parte 2: Regime Forfettario vs. Regime Ordinario - La Scelta Cruciale**\n\nLa decisione più importante riguarda il regime fiscale da adottare. Vediamo un confronto dettagliato.\n\n#### **Il Regime Forfettario: Semplicità e Vantaggi**\n\nÈ il regime naturale per chi inizia, pensato per semplificare la gestione fiscale. \n\n**Requisiti**: Il requisito principale è non superare **85.000 € di ricavi annui**.\n\n**Come funziona il calcolo delle tasse?**\n1.  **Reddito Imponibile Lordo**: Non si calcola sottraendo i costi reali, ma applicando il coefficiente di redditività ai ricavi. \n    `Formula: Ricavi Lordi * 78%`\n    Lo Stato riconosce forfettariamente il 22% dei tuoi ricavi come costi, indipendentemente da quanto hai speso realmente.\n2.  **Reddito Imponibile Fiscale**: Dal reddito lordo si deducono i contributi INPS versati nell'anno di imposta.\n    `Formula: Reddito Imponibile Lordo - Contributi INPS Versati`\n3.  **Imposta Sostitutiva**: Sul reddito imponibile fiscale si applica un'imposta unica che sostituisce IRPEF, addizionali regionali e comunali.\n    * **5% per i primi 5 anni** (se si rispettano i requisiti di novità dell'attività).\n    * **15% dal sesto anno in poi**.\n\n**Vantaggi**: Nessun obbligo di IVA in fattura, contabilità semplificata, tassazione ridotta.\n**Svantaggi**: Impossibilità di dedurre i costi reali. Se hai spese molto elevate (superiori al 22% dei ricavi), potrebbe non essere conveniente.\n\n#### **Il Regime Ordinario Semplificato**\n\nQuesto regime diventa una valida alternativa quando il Forfettario non è accessibile o conveniente.\n\n**Come funziona il calcolo delle tasse?**\n1.  **Reddito Imponibile Lordo**: Si calcola in modo analitico.\n    `Formula: Ricavi Lordi - Costi Deducibili Reali`\n    Puoi scaricare tutte le spese inerenti alla tua attività: affitto di spazi, acquisto di attrezzature, software, corsi di aggiornamento, etc.\n2.  **Reddito Imponibile Fiscale**: Anche qui, si deducono i contributi INPS versati.\n    `Formula: Reddito Imponibile Lordo - Contributi INPS Versati`\n3.  **Tassazione IRPEF**: Il reddito è soggetto all'Imposta sul Reddito delle Persone Fisiche (IRPEF), con un sistema a scaglioni progressivi (aliquote dal 23% al 43%).\n\n**Vantaggi**: Possibilità di dedurre tutti i costi e di recuperare l'IVA sugli acquisti.\n**Svantaggi**: Tassazione potenzialmente più alta (IRPEF), gestione più complessa, obbligo di applicare l'IVA.\n\n### **Parte 3: Esempio Pratico a Confronto**\n\nIpotizziamo un personal trainer al suo primo anno di attività con ricavi per 30.000 €.\n\nTipo di Calcolo**Regime Forfettario (5%)** **Regime Ordinario (costi 5.000 €)**\n**Ricavi**30.000 €30.000 €\n**Reddito Imponibile Lordo**`30.000 * 78% = 23.400 €``30.000 - 5.000 = 25.000 €`\n**Contributi INPS (26,07%)**`23.400 * 26,07% = 6.100 €``25.000 * 26,07% = 6.517 €`\n**Imposte Dovute**`23.400 * 5% = 1.170 €``25.000 * 23% = 5.750 €`\n**Totale Uscite**`6.100 + 1.170 = 7.270 €``6.517 + 5.750 = 12.267 €`\n**Reddito Netto**`30.000 - 7.270 = 22.730 €``30.000 - 5.000 (costi) - 12.267 = 12.733 €`\n\nCome si evince, nel caso di costi contenuti, il Regime Forfettario offre un vantaggio economico schiacciante.\n\n### **Parte 4: FAQ - Domande Frequenti**\n\n* **Posso dedurre l'acquisto di manubri e tappetini nel Regime Forfettario?**\n    No. Nel Forfettario i costi sono determinati da una percentuale fissa (il 22% dei ricavi) e non è possibile dedurre analiticamente alcuna spesa, nemmeno quelle strettamente professionali.\n\n* **Quando si pagano le tasse e i contributi?**\n    Il sistema italiano si basa sul meccanismo di **saldi e acconti**. Generalmente, le scadenze principali sono il 30 Giugno (per il saldo dell'anno precedente e il primo acconto dell'anno in corso) e il 30 Novembre (per il secondo acconto).\n\n* **Cosa cambia se lavoro per una ASD/SSD?**\n    Lavorare con Associazioni o Società Sportive Dilettantistiche può aprire a regimi fiscali speciali (es. compensi sportivi fino a 15.000 € esenti), ma le regole sono complesse e dipendono dal tipo di contratto. È fondamentale distinguere tra lavoro autonomo con Partita IVA e collaborazione sportiva."
};


const TassazioneIstruttoriPalestraPartitaIvaCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        ricaviAnnuì: 35000,
        isForfettario: true,
        isNuovaAttivita: true,
        costiSostenuti: 4000,
        haAltraCoperturaPrevidenziale: false,
        contributiVersati: 0
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { ricaviAnnuì, isForfettario, isNuovaAttivita, costiSostenuti, haAltraCoperturaPrevidenziale, contributiVersati } = states;

        const coefficienteRedditivita = 0.78;
        const aliquotaInpsPiena = 0.2607;
        const aliquotaInpsRidotta = 0.24;

        const redditoImponibileLordo = isForfettario
            ? ricaviAnnuì * coefficienteRedditivita
            : Math.max(0, ricaviAnnuì - costiSostenuti);
        
        const aliquotaInpsApplicata = haAltraCoperturaPrevidenziale ? aliquotaInpsRidotta : aliquotaInpsPiena;
        const contributiInpsDovuti = redditoImponibileLordo * aliquotaInpsApplicata;
        const redditoImponibileFiscale = Math.max(0, redditoImponibileLordo - contributiVersati);

        let imposteDovute = 0;
        if (isForfettario) {
            imposteDovute = redditoImponibileFiscale * (isNuovaAttivita ? 0.05 : 0.15);
        } else {
            const income = redditoImponibileFiscale;
            if (income <= 28000) imposteDovute = income * 0.23;
            else if (income <= 50000) imposteDovute = (28000 * 0.23) + ((income - 28000) * 0.35);
            else imposteDovute = (28000 * 0.23) + (22000 * 0.35) + ((income - 50000) * 0.43);
        }

        const totaleTasseEContributi = imposteDovute + contributiInpsDovuti;
        const redditoNetto = ricaviAnnuì - totaleTasseEContributi;

        return {
            redditoNetto,
            totaleTasseEContributi,
            imposteDovute,
            contributiInpsDovuti,
            redditoImponibileFiscale
        };
    }, [states]);

    const chartData = [
      { name: 'Ripartizione', 'Reddito Netto': calculatedOutputs.redditoNetto, 'Imposte': calculatedOutputs.imposteDovute, 'Contributi INPS': calculatedOutputs.contributiInpsDovuti },
    ];
    const COLORS = ['#22c55e', '#f97316', '#3b82f6'];

    const formulaUsata = useMemo(() => {
      if (states.isForfettario) {
        return `Netto = Ricavi - ( (Ricavi * 78% - ContributiVersati) * ${states.isNuovaAttivita ? '5%' : '15%'} + (Ricavi * 78%) * ${states.haAltraCoperturaPrevidenziale ? '24%' : '26.07%'} )`;
      }
      return `Netto = Ricavi - ( IRPEF(Ricavi - Costi - ContributiVersati) + (Ricavi - Costi) * ${states.haAltraCoperturaPrevidenziale ? '24%' : '26.07%'} )`;
    }, [states]);

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
      } catch (e) {
        alert("Errore durante l'esportazione in PDF.");
      }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
      try {
        const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
        const results = JSON.parse(localStorage.getItem("calc_results") || "[]");
        localStorage.setItem("calc_results", JSON.stringify([payload, ...results].slice(0, 50)));
        alert("Risultato salvato con successo!");
      } catch {
        alert("Impossibile salvare il risultato.");
      }
    }, [states, calculatedOutputs, slug, title]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

    return (
      <>
        <FaqSchema />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg" ref={calculatorRef}>
              <div className="p-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                <p className="text-gray-600 mb-4">Simula il tuo carico fiscale e previdenziale come professionista del fitness.</p>
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                  <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale.
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border">
                  {inputs.map(input => {
                    const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]) || (input.condition.includes('== false') && !states[input.condition.split(' ')[0]]);
                    if (!conditionMet) return null;

                    const label = (
                      <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                        {input.label}
                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                      </label>
                    );

                    if (input.type === 'boolean') {
                      return <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border self-center"><input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} /><label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label></div>;
                    }

                    if (input.type === 'select') {
                        return <div key={input.id} className="md:col-span-2">{label}<select id={input.id} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={String(states[input.id])} onChange={(e) => handleStateChange(input.id, e.target.value === 'true')}><option value="true">Regime Forfettario</option><option value="false">Regime Ordinario</option></select></div>
                    }

                    return (
                      <div key={input.id}>
                        {label}
                        <div className="flex items-center gap-2">
                          <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                          {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                  {outputs.map(output => (
                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'redditoNetto' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                      <div className={`text-xl md:text-2xl font-bold ${output.id === 'redditoNetto' ? 'text-green-600' : 'text-gray-800'}`}>
                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione dei Ricavi Lordi</h3>
                  <div className="h-80 w-full bg-gray-50 p-4 rounded-lg border">
                    {isClient && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" hide />
                          <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}}/>
                          <Legend />
                          <Bar dataKey="Reddito Netto" stackId="a" fill={COLORS[0]} />
                          <Bar dataKey="Imposte" stackId="a" fill={COLORS[1]} />
                          <Bar dataKey="Contributi INPS" stackId="a" fill={COLORS[2]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                 <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetica</h3>
                  <p className="text-xs text-gray-600 mt-2 p-3 bg-white rounded font-mono break-words border">{formulaUsata}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
              <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                <button onClick={handleReset} className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
              </div>
            </section>
            <section className="border rounded-lg p-4 bg-white shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Guida Approfondita</h2>
              <ContentRenderer content={content} />
            </section>
            <section className="border rounded-lg p-4 bg-white shadow-lg">
              <h2 className="font-semibold mb-3 text-gray-800">Fonti e Riferimenti Normativi</h2>
              <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/iva-e-imposte-indirette/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfetario</a></li>
                <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-servizi.50165.gestione-separata.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">INPS - Gestione Separata</a></li>
              </ul>
            </section>
          </aside>
        </div>
      </>
    );
};

export default TassazioneIstruttoriPalestraPartitaIvaCalculator;