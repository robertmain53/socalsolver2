'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export const meta = {
  title: "Simulatore Tassazione per Lavoratori Sportivi (Post-Riforma)",
  description: "Calcola il tuo stipendio netto, tasse e contributi INPS come lavoratore sportivo dilettante (co.co.co) o con Partita IVA forfettaria, secondo le nuove regole della Riforma dello Sport."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
            "name": "Cosa cambia per i lavoratori sportivi con la Riforma dello Sport?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La Riforma (D.Lgs. 36/2021) introduce un nuovo quadro fiscale e previdenziale. I punti chiave sono una franchigia fiscale fino a 15.000€ e una previdenziale fino a 5.000€ per i dilettanti. Anche i forfettari beneficiano della franchigia di 15.000€, applicata prima del coefficiente di redditività."
            }
          },
          {
            "@type": "Question",
            "name": "Chi è considerato lavoratore sportivo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "È considerato lavoratore sportivo l'atleta, l'allenatore, l'istruttore, il direttore tecnico, il direttore sportivo, il preparatore atletico e il direttore di gara che, senza alcuna distinzione di genere e indipendentemente dal settore professionistico o dilettantistico, esercita l'attività sportiva verso un corrispettivo."
            }
          },
          {
            "@type": "Question",
            "name": "Come si calcolano i contributi INPS per un dilettante?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I contributi INPS si calcolano solo sulla parte di compenso che supera i 5.000€. Su questa eccedenza, la base imponibile viene ridotta del 50% (fino al 2027) e si applica l'aliquota della Gestione Separata INPS. Il costo è ripartito: 1/3 a carico del lavoratore e 2/3 del committente."
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
                if (trimmedBlock.startsWith('| Caratteristica')) {
                    const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
                    const headers = rows[0];
                    const bodyRows = rows.slice(2);
                    return (
                        <div key={index} className="overflow-x-auto my-6">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {headers.map((header, hIndex) => <th key={hIndex} className="p-3 border text-left font-semibold text-gray-700">{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bodyRows.map((row, rIndex) => (
                                        <tr key={rIndex} className="even:bg-white odd:bg-gray-50">
                                            {row.map((cell, cIndex) => <td key={cIndex} className="p-3 border text-gray-600" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
  "slug": "tassazione-sportivi",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Simulatore Tassazione per Lavoratori Sportivi",
  "lang": "it",
  "inputs": [
    {
      "id": "compenso_annuo_lordo",
      "label": "Compenso Annuo Lordo",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 500,
      "tooltip": "Inserisci il compenso totale annuo lordo percepito per l'attività sportiva, prima di qualsiasi trattenuta."
    },
    {
      "id": "has_forfettario",
      "label": "Operi con Partita IVA in Regime Forfettario?",
      "type": "boolean" as const,
      "tooltip": "Seleziona se sei un lavoratore autonomo con Partita IVA che applica il regime forfettario. In caso contrario, si assume che tu sia un lavoratore sportivo dilettantistico con contratto di collaborazione coordinata e continuativa (co.co.co)."
    },
    {
      "id": "is_iscritto_altra_previdenza",
      "label": "Sei già iscritto a un'altra forma di previdenza obbligatoria?",
      "type": "boolean" as const,
      "condition": "has_forfettario == false",
      "tooltip": "Seleziona se versi già contributi obbligatori ad un'altra cassa (es. come lavoratore dipendente). Questo riduce l'aliquota INPS dovuta."
    },
    {
      "id": "coefficiente_redditivita",
      "label": "Coefficiente di Redditività (ATECO)",
      "type": "number" as const,
      "unit": "%",
      "min": 40,
      "step": 1,
      "condition": "has_forfettario == true",
      "tooltip": "Percentuale di ricavi considerata come reddito imponibile nel regime forfettario. Esempio: 78% per istruttori, 67% per altre attività sportive."
    },
    {
      "id": "is_startup_forfettario",
      "label": "Applichi l'imposta sostitutiva al 5% (startup)?",
      "type": "boolean" as const,
      "condition": "has_forfettario == true",
      "tooltip": "Seleziona se rispetti i requisiti per l'aliquota ridotta al 5% per i primi 5 anni di attività, altrimenti si applica l'aliquota standard del 15%."
    },
    {
      "id": "contributi_versati_anno_precedente",
      "label": "Contributi INPS versati nell'anno precedente",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 100,
      "condition": "has_forfettario == true",
      "tooltip": "I contributi previdenziali obbligatori versati l'anno precedente sono deducibili dal reddito imponibile. Inserisci l'importo per una stima più accurata."
    }
  ],
  "outputs": [
    { "id": "netto_annuo", "label": "Netto Annuo in Tasca", "unit": "€" },
    { "id": "tasse_totali", "label": "Tasse e Contributi Totali a Tuo Carico", "unit": "€" },
    { "id": "imponibile_fiscale", "label": "Reddito Imponibile Fiscale", "unit": "€" },
    { "id": "irpef_o_imposta_sostitutiva", "label": "IRPEF / Imposta Sostitutiva", "unit": "€" },
    { "id": "contributi_inps_lavoratore", "label": "Contributi INPS a Carico Lavoratore", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione dei Lavoratori Sportivi (Post-Riforma)**\n\n**Analisi dei Regimi Fiscali, Calcolo dei Contributi e Imposte**\n\nLa Riforma dello Sport (D.Lgs. 36/2021) ha ridisegnato il quadro legale e fiscale per i lavoratori del settore sportivo dilettantistico, introducendo nuove regole per la tassazione dei compensi. L'obiettivo è superare il vecchio regime dei \"compensi sportivi ex art. 67 TUIR\" e ricondurre queste prestazioni nell'alveo del lavoro, pur con importanti agevolazioni.\n\nQuesto strumento di simulazione ti aiuta a calcolare l'impatto fiscale e previdenziale sui tuoi compensi, sia che tu operi come collaboratore coordinato e continuativo (co.co.co) sia come lavoratore autonomo con Partita IVA in regime forfettario. **Ricorda che i risultati sono una stima e non sostituiscono una consulenza fiscale professionale.**\n\n### **Parte 1: Il Lavoratore Sportivo Dilettantistico (Co.co.co)**\n\nQuesta è la figura più comune in Associazioni (ASD) e Società Sportive Dilettantistiche (SSD). La riforma qualifica questi rapporti, se di natura non occasionale, come **collaborazioni coordinate e continuative (co.co.co)**.\n\n#### **La Doppia Franchigia: Fiscale e Previdenziale**\n\nIl cuore del nuovo sistema per i dilettanti è una doppia soglia di esenzione:\n\n1.  **Franchigia Fiscale (IRPEF) fino a 15.000 €**: I compensi fino a 15.000 € annui sono completamente **esenti da imposte**. L'IRPEF si applica solo sulla parte di compenso che supera questa soglia.\n2.  **Franchigia Previdenziale (INPS) fino a 5.000 €**: I contributi INPS non sono dovuti per i compensi fino a 5.000 € annui. Sulla parte eccedente, si applica la contribuzione alla **Gestione Separata INPS**.\n\n#### **Calcolo dei Contributi INPS**\n\nSulla quota di compenso che supera i 5.000 €, si calcolano i contributi INPS. Esistono due importanti specifiche:\n\n* **Abbattimento del 50%**: Fino al 31 dicembre 2027, la base imponibile su cui calcolare i contributi è ridotta del 50%.\n* **Ripartizione del Carico**: I contributi totali sono per **2/3 a carico del committente** (ASD/SSD) e per **1/3 a carico del lavoratore**.\n\nL'aliquota INPS è del **25%** (+ oneri accessori, circa 27,03% totale) se il lavoratore non ha un'altra copertura previdenziale, oppure del **24%** se è già iscritto a un'altra gestione (es. lavoratore dipendente a tempo pieno).\n\n**Esempio Pratico (Dilettante):**\n- Compenso: 20.000 €\n- Base Imponibile Fiscale (IRPEF): 20.000 - 15.000 = 5.000 €\n- Base Imponibile Previdenziale (INPS): 20.000 - 5.000 = 15.000 €\n- Base Calcolo INPS (con riduzione 50%): 15.000 * 0.5 = 7.500 €\n- Contributi INPS totali (al 27%): 7.500 * 0.27 = 2.025 €\n- Contributi a carico del lavoratore (1/3): 675 €\n- IRPEF (primo scaglione 23%): 5.000 * 0.23 = 1.150 €\n- Netto in tasca: 20.000 - 675 - 1.150 = 18.175 €\n\n### **Parte 2: Il Lavoratore Sportivo con Partita IVA Forfettaria**\n\nMolti professionisti dello sport (es. istruttori, personal trainer) operano con Partita IVA in regime forfettario. Anche per loro, la Riforma ha introdotto un'importante novità, estendendo la franchigia fiscale.\n\n#### **Come si Applica la Franchigia di 15.000 €**\n\nLa soglia di esenzione di 15.000 € si applica **prima** del calcolo del reddito imponibile tramite il coefficiente di redditività. Questo rappresenta un vantaggio fiscale significativo.\n\nLa logica di calcolo è la seguente:\n\n1.  **Si parte dal Fatturato Annuo.**\n2.  **Si sottrae la franchigia di 15.000 €.**\n3.  **Sull'eccedenza, si applica il coefficiente di redditività** (es. 78% per cod. ATECO 85.51.00 - Corsi sportivi e ricreativi).\n4.  Si ottiene così il **Reddito Imponibile Lordo**, su cui si calcolano i contributi INPS (Gestione Separata al 26,23% circa).\n5.  Dal Reddito Imponibile Lordo si deducono i contributi INPS versati nell'anno precedente, ottenendo il **Reddito Imponibile Netto**.\n6.  Su quest'ultimo si applica l'**imposta sostitutiva** del 5% (startup) o 15%.\n\n**Esempio Pratico (Forfettario):**\n- Fatturato: 40.000 €\n- Coefficiente: 78%\n- Base di calcolo dopo franchigia: 40.000 - 15.000 = 25.000 €\n- Reddito Imponibile Lordo: 25.000 * 0.78 = 19.500 €\n- Contributi INPS (al 26,23%): 19.500 * 0.2623 = 5.115 €\n- Imposta Sostitutiva (al 5%, assumendo zero contributi pregressi): 19.500 * 0.05 = 975 €\n- Netto in tasca: 40.000 - 5.115 - 975 = 33.910 €\n\n### **Tabella Comparativa dei Regimi**\n\n| Caratteristica | Lavoratore Dilettante (Co.co.co) | Lavoratore con P.IVA Forfettaria |\n| :--- | :--- | :--- |\n| **Soglia Esenzione Fiscale** | 15.000 € | 15.000 € (applicata prima del coefficiente) |\n| **Soglia Esenzione INPS** | 5.000 € | Non presente (si applica la franchigia di 15.000€ anche per l'INPS) |\n| **Calcolo Tasse** | IRPEF a scaglioni sull'eccedenza | Imposta Sostitutiva (5% o 15%) sul reddito imponibile |\n| **Calcolo Contributi** | Sull'eccedenza di 5.000 € (con abbattimento 50%) | Sul reddito imponibile (fatturato - 15.000€) * coeff. |\n| **Carico Contributivo** | 1/3 lavoratore, 2/3 committente | 100% a carico del lavoratore |\n| **Adempimenti** | Gestiti dal committente (sostituto d'imposta) | Gestione autonoma (dichiarazione, versamenti) |\n"
};

const TassazioneSportiviCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        compenso_annuo_lordo: 25000,
        has_forfettario: false,
        is_iscritto_altra_previdenza: false,
        coefficiente_redditivita: 78,
        is_startup_forfettario: true,
        contributi_versati_anno_precedente: 0
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const {
            compenso_annuo_lordo, has_forfettario, is_iscritto_altra_previdenza,
            coefficiente_redditivita, is_startup_forfettario, contributi_versati_anno_precedente
        } = states;

        let imponibile_fiscale = 0, irpef_o_imposta_sostitutiva = 0, contributi_inps_lavoratore = 0;

        if (!has_forfettario) {
            // Calcolo per Lavoratore Sportivo Dilettante (co.co.co)
            const franchigia_fiscale = 15000;
            const franchigia_previdenziale = 5000;
            
            imponibile_fiscale = Math.max(0, compenso_annuo_lordo - franchigia_fiscale);
            
            const imponibile_previdenziale = Math.max(0, compenso_annuo_lordo - franchigia_previdenziale);
            const base_calcolo_inps = imponibile_previdenziale * 0.5; // Abbattimento 50%
            const aliquota_inps = is_iscritto_altra_previdenza ? 0.24 : 0.2703; // ~25% + 2.03%
            const contributi_inps_totali = base_calcolo_inps * aliquota_inps;
            contributi_inps_lavoratore = contributi_inps_totali / 3;

            // Calcolo IRPEF semplificato a 2 scaglioni (23% fino a 28k, 35% oltre)
            if (imponibile_fiscale <= 28000) {
                irpef_o_imposta_sostitutiva = imponibile_fiscale * 0.23;
            } else {
                irpef_o_imposta_sostitutiva = (28000 * 0.23) + ((imponibile_fiscale - 28000) * 0.35);
            }

        } else {
            // Calcolo per Partita IVA Forfettaria
            const franchigia_fiscale = 15000;
            const base_imponibile = Math.max(0, compenso_annuo_lordo - franchigia_fiscale);
            const reddito_imponibile_lordo = base_imponibile * (coefficiente_redditivita / 100);
            
            const aliquota_inps_forfettario = 0.2623;
            contributi_inps_lavoratore = reddito_imponibile_lordo * aliquota_inps_forfettario;
            
            imponibile_fiscale = Math.max(0, reddito_imponibile_lordo - contributi_versati_anno_precedente);
            
            const aliquota_sostitutiva = is_startup_forfettario ? 0.05 : 0.15;
            irpef_o_imposta_sostitutiva = imponibile_fiscale * aliquota_sostitutiva;
        }

        const tasse_totali = irpef_o_imposta_sostitutiva + contributi_inps_lavoratore;
        const netto_annuo = compenso_annuo_lordo - tasse_totali;

        return {
            netto_annuo,
            tasse_totali,
            imponibile_fiscale,
            irpef_o_imposta_sostitutiva,
            contributi_inps_lavoratore
        };
    }, [states]);

    const chartData = [
        { name: 'Distribuzione', 'Netto in Tasca': calculatedOutputs.netto_annuo, 'Tasse e Contributi': calculatedOutputs.tasse_totali },
    ];
    
    const formulaUsata = states.has_forfettario 
        ? `Reddito Imponibile = MAX(0, Compenso - 15000€) * Coeff. Redditività`
        : `Imponibile Fiscale = MAX(0, Compenso - 15000€)\nImponibile INPS = MAX(0, Compenso - 5000€) * 50%`;

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
            pdf.save(`${slug}-simulazione.pdf`);
        } catch (e) { 
            console.error("PDF Export Error: ", e);
            alert("Errore durante l'esportazione in PDF."); 
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
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl shadow-lg" ref={calcolatoreRef}>
                        <div className="p-6 md:p-8">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                            <p className="text-gray-600 mb-6">Stima il tuo netto annuale secondo la Riforma dello Sport (D.Lgs. 36/2021).</p>
                            
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale qualificata. I calcoli sono basati su aliquote standard e potrebbero non includere tutte le variabili del tuo caso specifico.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {inputs.map(input => {
                                    let conditionMet = true;
                                    if (input.condition) {
                                      const [key, , value] = input.condition.split(' ');
                                      conditionMet = states[key] === (value === 'true');
                                    }
                                    if (!conditionMet) return null;

                                    if (input.type === 'boolean') {
                                        return (
                                            <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-slate-50 border">
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                                <label className="text-sm font-medium text-gray-800 flex items-center" htmlFor={input.id}>
                                                    {input.label}
                                                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                                </label>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={input.id}>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                            </label>
                                            <div className="relative">
                                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2.5" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                                {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sezione Risultati */}
                        <div className="bg-gray-50/70 p-6 md:p-8 rounded-b-xl">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Simulazione</h2>
                            <div className="space-y-4">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'netto_annuo' ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200'}`}>
                                        <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                                        <span className={`text-xl md:text-2xl font-bold ${output.id === 'netto_annuo' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '€...'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Compenso Lordo</h3>
                                <div className="h-64 w-full bg-white p-2 rounded-lg border">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" hide />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                                                <Legend />
                                                <Bar dataKey="Netto in Tasca" stackId="a" fill="#4f46e5" />
                                                <Bar dataKey="Tasse e Contributi" stackId="a" fill="#fca5a5" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className=" -xl -lg p-6">
                        <h3 className="font-semibold text-gray-800">Formula Chiave Utilizzata</h3>
                        <pre className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded-lg font-mono break-words whitespace-pre-wrap">{formulaUsata}</pre>
                        <p className="text-xs text-gray-500 mt-2">Nota: Questa è una rappresentazione semplificata della logica di calcolo, che non include tutti i passaggi intermedi (es. calcolo IRPEF a scaglioni).</p>
                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-xl p-5 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-center bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-center bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full bg-red-50 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="rounded-xl bg-white shadow-lg">
                        <div className="p-5 border-b">
                          <h2 className="font-semibold text-gray-800">Guida alla Comprensione</h2>
                        </div>
                        <div className="p-5">
                          <ContentRenderer content={content} />
                        </div>
                    </section>
                    <section className="border rounded-xl p-5 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2021-02-28;36!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.Lgs. 28 febbraio 2021, n. 36</a> (Testo della Riforma).</li>
                            <li><a href="https://www.inps.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Circolari INPS</a> per la Gestione Separata.</li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Sito dell'Agenzia delle Entrate</a> per le aliquote IRPEF.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneSportiviCalculator;