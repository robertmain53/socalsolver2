'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { FaFilePdf, FaSave, FaUndo } from 'react-icons/fa';

// --------- Tipi forti per evitare l'errore ----------
type AreaOrigine = "Europa dell'Est" | "Sud America" | "Asia" | "Africa";
type TipoAdozione = "Internazionale" | "Nazionale";

interface States {
  tipo_adozione: TipoAdozione;
  costo_ente: number;
  paese_origine: AreaOrigine;
  numero_viaggi: number;
  durata_soggiorno_totale: number;
}

// --- Icona per i Tooltip ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
            "name": "Quanto costa adottare un bambino in Italia (adozione nazionale)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'adozione nazionale è quasi gratuita. I costi si limitano a marche da bollo e spese per documenti, generalmente poche centinaia di euro. Non ci sono costi per agenzie o intermediari."
            }
          },
          {
            "@type": "Question",
            "name": "Quali sono i costi principali dell'adozione internazionale?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I costi principali dell'adozione internazionale includono la tariffa dell'Ente Autorizzato (7.000€ - 15.000€), le spese di viaggio e soggiorno nel paese del minore (voli, vitto, alloggio per diverse settimane o mesi), e le spese burocratiche per documenti e traduzioni. Il costo totale può variare tra 15.000€ e oltre 30.000€."
            }
          },
          {
            "@type": "Question",
            "name": "È possibile detrarre le spese per l'adozione?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, per l'adozione internazionale: la legge italiana prevede la deducibilità dal reddito imponibile del 50% delle spese sostenute e certificate dall'Ente Autorizzato."
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
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^### \*\*/, '').replace(/\*\*$/, '')) }} />;
        }
        if (trimmedBlock.startsWith('#### **')) {
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^#### \*\*/, '').replace(/\*\*$/, '')) }} />;
        }
        if (trimmedBlock.startsWith('*')) {
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}
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


// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "adozione-costi-e-tempi",
  "category": "Famiglia e Vita Quotidiana",
  "title": "Calcolatore Costi e Tempi per l'Adozione",
  "lang": "it",
  "inputs": [
    {
      "id": "tipo_adozione",
      "label": "Quale tipo di adozione stai considerando?",
      "type": "select",
      "options": ["Internazionale", "Nazionale"],
      "tooltip": "L'adozione internazionale comporta costi significativi ma un percorso più strutturato. Quella nazionale ha costi quasi nulli ma tempi molto incerti e non preventivabili."
    },
    {
      "id": "costo_ente",
      "label": "Costo dell'Ente Autorizzato",
      "type": "number",
      "unit": "€",
      "min": 5000,
      "step": 500,
      "defaultValue": 9000,
      "condition": "tipo_adozione == 'Internazionale'",
      "tooltip": "È il costo principale. Copre le spese dell'ente per la gestione della pratica in Italia e all'estero. Varia da ente a ente (in genere tra 7.000€ e 15.000€)."
    },
    {
      "id": "paese_origine",
      "label": "Paese di origine (indicativo)",
      "type": "select",
      "options": ["Europa dell'Est", "Sud America", "Asia", "Africa"],
      "condition": "tipo_adozione == 'Internazionale'",
      "tooltip": "La scelta del paese influisce sui costi di viaggio e soggiorno. Questa è una stima generica per categoria geografica."
    },
    {
      "id": "numero_viaggi",
      "label": "Numero di viaggi richiesti nel paese",
      "type": "number",
      "min": 1,
      "max": 5,
      "step": 1,
      "defaultValue": 2,
      "condition": "tipo_adozione == 'Internazionale'",
      "tooltip": "Alcuni paesi richiedono un solo lungo viaggio, altri due o più viaggi in fasi diverse della procedura."
    },
    {
      "id": "durata_soggiorno_totale",
      "label": "Durata totale del soggiorno all'estero",
      "type": "number",
      "unit": "giorni",
      "min": 7,
      "step": 1,
      "defaultValue": 45,
      "condition": "tipo_adozione == 'Internazionale'",
      "tooltip": "Il totale dei giorni da trascorrere nel paese straniero, sommando tutti i viaggi. La permanenza può variare da una settimana a diversi mesi."
    }
  ],
  "outputs": [
    { "id": "costo_stimato", "label": "Stima dei Costi Totali", "unit": "€" },
    { "id": "tempo_stimato", "label": "Stima dei Tempi Totali", "unit": "mesi" },
    { "id": "deduzione_fiscale", "label": "Deduzione Fiscale 50% (stimata)", "unit": "€" }
  ],
  "formulaSteps": [
    { "id": "costi_burocratici", "expr": "Spese per documenti, traduzioni, legalizzazioni (stima: 1.500€ - 3.000€)" },
    { "id": "costi_viaggio", "expr": "(CostoVoloMedio * NumeroViaggi) + (CostoGiornalieroMedio * DurataSoggiorno)" },
    { "id": "costo_totale", "expr": "CostoEnte + CostiBurocratici + CostiViaggio" },
    { "id": "tempo_totale", "expr": "TempoDecretoIdoneita (9-12 mesi) + TempoAttesaAbbinamento (12-36 mesi) + TempoPermanenzaEstero" }
  ],
  "examples": [
    {
      "inputs": {
        "tipo_adozione": "Internazionale",
        "costo_ente": 10000,
        "paese_origine": "Sud America",
        "numero_viaggi": 2,
        "durata_soggiorno_totale": 60
      },
      "outputs": {
        "costo_stimato": "18.500€ - 24.000€",
        "tempo_stimato": "24 - 48 mesi"
      }
    }
  ],
  "tags": "adozione, costi adozione, tempi adozione, adozione internazionale, adozione nazionale, ente autorizzato, decreto di idoneità, adozione bambino, famiglia",
  "content": "### **Guida Completa ai Costi e ai Tempi dell'Adozione**\n\n**Un'analisi dettagliata per orientarsi in un percorso di vita**\n\nIntraprendere il percorso dell'adozione è una delle decisioni più profonde e significative per una coppia o un singolo. Al di là dell'immenso valore umano, è un iter complesso che comporta un notevole impegno in termini di tempo ed, in alcuni casi, di risorse economiche. Questo calcolatore è stato creato per offrire una **stima realistica e informativa**, aiutando le future famiglie a pianificare e comprendere meglio le variabili in gioco.\n\n**Disclaimer fondamentale**: Nessun calcolatore può catturare la complessità emotiva e le specificità di ogni singolo percorso adottivo. Le cifre e i tempi sono **stime basate su medie e dati statistici**, e non sostituiscono in alcun modo il dialogo con i Tribunali per i Minorenni, i servizi sociali e gli Enti Autorizzati, che sono le uniche fonti ufficiali per il proprio caso specifico.\n\n### **Parte 1: Adozione Nazionale vs. Internazionale: Due Mondi a Confronto**\n\nLa prima, fondamentale scelta che determina l'intero percorso è tra adozione nazionale e internazionale.\n\n#### **Adozione Nazionale**\n\nL'adozione di un minore residente in Italia è un percorso gestito interamente dallo Stato attraverso i servizi sociali territoriali e il Tribunale per i Minorenni.\n\n* **Costi**: È **sostanzialmente gratuita**. Le uniche spese sono legate a marche da bollo e documentazione, per un totale di poche centinaia di euro. Non ci sono intermediari da pagare.\n* **Tempi**: Sono il vero fattore di incertezza. L'iter per ottenere il **Decreto di Idoneità** dura circa 6-8 mesi, ma il tempo di attesa per l'**abbinamento** con un minore è **imprevedibile**. Può variare da 1 a molti anni, a seconda del Tribunale, del numero di minori adottabili e del profilo della coppia. Questo calcolatore non può fornire una stima attendibile per l'adozione nazionale proprio a causa di questa aleatorietà.\n\n#### **Adozione Internazionale**\n\nConsiste nell'adottare un minore residente in un altro Stato. L'iter inizia in Italia per l'ottenimento dell'idoneità, ma prosegue poi all'estero con il supporto obbligatorio di un **Ente Autorizzato**.\n\n* **Costi**: Sono significativi e costituiscono l'oggetto principale di questo calcolatore. Si compongono di tre macro-voci:\n    1.  **Costi per l'Ente Autorizzato**: È la spesa più rilevante (in media 7.000€ - 15.000€) e copre l'assistenza legale e psicologica, la gestione della pratica in Italia e nel paese estero, e il supporto post-adozione.\n    2.  **Costi nel Paese d'Origine**: Includono le spese per i viaggi (voli), la permanenza (vitto, alloggio, trasporti locali per periodi che possono durare anche mesi) e i costi burocratici locali (traduzioni giurate, legalizzazioni, spese legali).\n    3.  **Costi Burocratici in Italia**: Spese per certificati, perizie mediche, ecc.\n* **Tempi**: Pur essendo lunghi, sono più strutturati e prevedibili rispetto all'adozione nazionale. In media, l'intero processo può durare **dai 2 ai 4 anni**.\n\n### **Parte 2: L'Iter dell'Adozione Internazionale Spiegato**\n\n1.  **Dichiarazione di Disponibilità**: Si presenta al Tribunale per i Minorenni della propria regione.\n2.  **Indagine dei Servizi Sociali**: Un'equipe di psicologi e assistenti sociali valuta le competenze genitoriali della coppia. (Durata: 4 mesi)\n3.  **Decreto di Idoneità**: Se l'indagine ha esito positivo, il Tribunale emette un decreto che certifica l'idoneità della coppia ad adottare. (Durata: 2 mesi)\n4.  **Scelta dell'Ente Autorizzato**: Entro 1 anno dal decreto, la coppia deve scegliere un Ente Autorizzato accreditato presso la C.A.I. (Commissione Adozioni Internazionali) per avviare la pratica nel paese estero prescelto.\n5.  **Procedura all'Estero**: L'ente segue la coppia nella preparazione dei documenti, nell'attesa della proposta di abbinamento e durante i viaggi e la permanenza nel paese del minore.\n6.  **Rientro in Italia**: Una volta ottenuta l'adozione all'estero, si rientra in Italia e il Tribunale per i Minorenni trascrive l'adozione, rendendola valida a tutti gli effetti.\n\n### **Parte 3: Aspetti Fiscali e Agevolazioni**\n\nUn aspetto fondamentale da conoscere sono le agevolazioni fiscali previste dallo Stato italiano per sostenere le coppie che intraprendono l'adozione internazionale.\n\n* **Deduzione Fiscale del 50%**: È possibile portare in **deduzione dal proprio reddito imponibile il 50% delle spese sostenute e certificate** dall'Ente Autorizzato. Questo si traduce in un significativo risparmio fiscale, che il calcolatore stima per darti un'idea del costo netto.\n* **Congedo di Maternità/Paternità**: I genitori adottivi hanno diritto agli stessi congedi parentali dei genitori biologici, a partire dall'ingresso del minore in famiglia.\n\n### **Conclusione**\n\nAffrontare l'adozione richiede preparazione, resilienza e una solida consapevolezza del percorso. Speriamo che questo strumento possa rappresentare un primo, utile passo per trasformare un sogno in un progetto di vita concreto, fornendo quella chiarezza su costi e tempi che permette di partire con maggiore serenità."
};

// Componente principale del calcolatore
const AdozioneCostiETempiCalculator: React.FC = () => {
  const { slug, title, inputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates: States = {
    tipo_adozione: "Internazionale",
    costo_ente: 9000,
    paese_origine: "Sud America",
    numero_viaggi: 2,
    durata_soggiorno_totale: 45,
  };

  const [states, setStates] = useState<States>(initialStates);

  // handler tipizzato sulle chiavi di States
  const handleStateChange = <K extends keyof States>(id: K, value: States[K]) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => setStates(initialStates);

  useEffect(() => {
    if (states.tipo_adozione === 'Nazionale') {
      // nessun input extra
    }
  }, [states.tipo_adozione]);

  const calculatedOutputs = useMemo(() => {
    if (states.tipo_adozione === 'Nazionale') {
      return {
        costo_min: 200, costo_max: 800,
        tempo_min: 24, tempo_max: 60, // Molto indicativo
        deduzione: 0,
        costi_data: [
          { name: 'Burocrazia', value: 500 }
        ]
      };
    }

    const { costo_ente, paese_origine, numero_viaggi, durata_soggiorno_totale } = states;

    // <<< QUI: mappa tipizzata per evitare l'errore di indicizzazione >>>
    const costi_viaggio_base: Record<AreaOrigine, { volo: number; giornaliero: number }> = {
      "Europa dell'Est": { volo: 500, giornaliero: 80 },
      "Sud America": { volo: 1200, giornaliero: 70 },
      "Asia": { volo: 1000, giornaliero: 90 },
      "Africa": { volo: 900, giornaliero: 80 },
    };

    const base_viaggio = costi_viaggio_base[paese_origine];

    const costo_voli = base_viaggio.volo * numero_viaggi * 2; // (per 2 persone)
    const costo_soggiorno = base_viaggio.giornaliero * durata_soggiorno_totale;
    const costo_viaggio_totale = costo_voli + costo_soggiorno;

    const costi_burocratici = { min: 1500, max: 3000 };

    const costo_min = costo_ente + costo_viaggio_totale * 0.9 + costi_burocratici.min;
    const costo_max = costo_ente + costo_viaggio_totale * 1.1 + costi_burocratici.max;

    const deduzione = (costo_ente + costi_burocratici.min) / 2;

    return {
      costo_min, costo_max,
      tempo_min: 24, tempo_max: 48,
      deduzione,
      costi_data: [
        { name: 'Ente', value: costo_ente },
        { name: 'Viaggio/Soggiorno', value: Math.round(costo_viaggio_totale) },
        { name: 'Burocrazia', value: (costi_burocratici.min + costi_burocratici.max) / 2 }
      ]
    };
  }, [states]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

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
    } catch (_e) {
      alert("Errore durante l'esportazione in PDF.");
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
      alert("Stima salvata con successo!");
    } catch {
      alert("Impossibile salvare la stima.");
    }
  }, [states, calculatedOutputs, slug, title]);

  const renderTimeline = () => {
    const { tempo_min, tempo_max } = calculatedOutputs;
    if (states.tipo_adozione === 'Nazionale') return <p className="text-sm text-center text-gray-600">I tempi per l'adozione nazionale sono altamente variabili e non preventivabili.</p>

    return (
      <div className="w-full text-center text-xs">
        <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
          <div className="w-1/3"><strong>Idoneità</strong><p>~9 mesi</p></div>
          <div className="w-1/3"><strong>Attesa Paese</strong><p>12-36 mesi</p></div>
          <div className="w-1/3"><strong>Procedura Finale</strong><p>~3 mesi</p></div>
        </div>
        <p className="mt-2 font-semibold text-gray-800">Totale Stimato: {tempo_min}-{tempo_max} mesi</p>
      </div>
    )
  };

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        {/* Colonna Principale */}
        <div className="lg:col-span-2 space-y-6" ref={calculatorRef}>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-4">Uno strumento per stimare l'impegno economico e le tempistiche di un percorso straordinario.</p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo calcolatore fornisce stime indicative a scopo informativo. Ogni percorso adottivo è unico. Consultare sempre gli enti ufficiali per informazioni precise e personalizzate.
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {inputs.map(input => {
                const conditionMet =
                  !input.condition ||
                  (input.condition.includes('==') && (states as any)[input.condition.split(' ')[0]] === input.condition.split("'")[1]);
                if (!conditionMet) return null;

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
                        value={(states as any)[input.id] as string}
                        onChange={e => {
                          const val = e.target.value;
                          if (input.id === 'tipo_adozione') {
                            handleStateChange('tipo_adozione', val as TipoAdozione);
                          } else if (input.id === 'paese_origine') {
                            handleStateChange('paese_origine', val as AreaOrigine);
                          } else {
                            handleStateChange(input.id as keyof States, val as any);
                          }
                        }}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      >
                        {input.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  )
                }

                return (
                  <div key={input.id}>
                    {inputLabel}
                    <div className="flex items-center gap-2">
                      <input
                        id={input.id}
                        type="number"
                        min={input.min}
                        step={input.step}
                        value={(states as any)[input.id] as number}
                        onChange={e => handleStateChange(input.id as keyof States, Number(e.target.value) as any)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      />
                      {input.unit && <span className="text-sm font-semibold text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Stima</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
              <div className="bg-indigo-50 border-b-4 border-indigo-500 p-3 rounded-t-md">
                <p className="text-sm text-indigo-800 font-bold">Costo Stimato</p>
                <p className="text-xl font-bold text-indigo-900">{isClient ? `${formatCurrency(calculatedOutputs.costo_min)} - ${formatCurrency(calculatedOutputs.costo_max)}` : '...'}</p>
              </div>
              <div className="bg-green-50 border-b-4 border-green-500 p-3 rounded-t-md">
                <p className="text-sm text-green-800 font-bold">Risparmio Fiscale (50%)</p>
                <p className="text-xl font-bold text-green-900">~ {isClient ? formatCurrency(calculatedOutputs.deduzione) : '...'}</p>
              </div>
              <div className="bg-gray-50 border-b-4 border-gray-400 p-3 rounded-t-md">
                <p className="text-sm text-gray-600 font-bold">Tempistiche Stimate</p>
                <p className="text-xl font-bold text-gray-800">{calculatedOutputs.tempo_min}-{calculatedOutputs.tempo_max} mesi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione Costi (Adoz. Internazionale)</h3>
                <div className="h-60 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && states.tipo_adozione === 'Internazionale' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={calculatedOutputs.costi_data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} />
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value" name="Costo Stimato" barSize={30}>
                          <Cell fill="#818cf8" />
                          <Cell fill="#a78bfa" />
                          <Cell fill="#fca5a5" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {isClient && states.tipo_adozione !== 'Internazionale' && (
                    <div className="flex items-center justify-center h-full text-gray-500">Il grafico si applica solo all'adozione internazionale.</div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Fasi e Tempistiche Indicative</h3>
                {renderTimeline()}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="flex flex-col space-y-2">
              <button onClick={handleSaveResult} className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"><FaSave /> Salva Stima</button>
              <button onClick={handleExportPDF} className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"><FaFilePdf /> Esporta PDF</button>
              <button onClick={handleReset} className="flex items-center justify-center gap-2 w-full border border-red-300 text-red-700 rounded-md px-3 py-2 text-sm hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"><FaUndo /> Reset</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida alla Comprensione</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.commissioneadozioni.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Commissione per le Adozioni Internazionali (CAI)</a> - Sito ufficiale del Governo.</li>
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1983-05-04;184!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge 4 maggio 1983, n. 184</a> - Diritto del minore ad una famiglia.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default AdozioneCostiETempiCalculator;
