'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Rimborso Chilometrico ACI 2025 e Fringe Benefit",
  description: "Calcola il rimborso chilometrico per le tue trasferte o il fringe benefit per l'auto aziendale a uso promiscuo secondo le tabelle ACI 2025."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
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
            "name": "Dove trovo il costo chilometrico ACI per il mio veicolo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il costo chilometrico ACI è pubblicato annualmente in Gazzetta Ufficiale e può essere consultato sul sito ufficiale dell'Automobile Club d'Italia (ACI). È necessario cercare il proprio modello di veicolo per trovare la tariffa corretta."
            }
          },
          {
            "@type": "Question",
            "name": "Il rimborso chilometrico è tassato in busta paga?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, il rimborso chilometrico basato sulle tariffe ACI per trasferte al di fuori del comune della sede di lavoro non costituisce reddito per il dipendente e quindi è esente da tassazione IRPEF e contribuzione INPS."
            }
          },
          {
            "@type": "Question",
            "name": "Qual è la differenza tra rimborso chilometrico e fringe benefit?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il rimborso chilometrico compensa un dipendente che usa la PROPRIA auto per lavoro. Il fringe benefit è un compenso in natura tassato in busta paga per l'uso personale di un'auto AZIENDALE."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
  const blocks = content.split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        if (trimmedBlock.includes("Livello Emissioni CO₂")) {
          const rows = trimmedBlock.split('\n').slice(1);
          return (
            <div key={index} className="overflow-x-auto my-4">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border text-left">Livello Emissioni CO₂ (g/km)</th>
                    <th className="p-2 border text-left">Percentuale per Calcolo Fringe Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const cells = row.split('**');
                    return (
                      <tr key={i}>
                        <td className="p-2 border font-semibold">{cells[1]}</td>
                        <td className="p-2 border">{cells[3]}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          );
        }
        if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        return null;
      })}
    </div>
  );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "rimborso-chilometrico-aci",
  "category": "Auto e Trasporti",
  "title": "Calcolatore Rimborso Chilometrico ACI",
  "lang": "it",
  "inputs": [
    { "id": "costo_unitario_km", "label": "Costo Unitario ACI", "type": "number" as const, "unit": "€/km", "min": 0, "step": 0.01, "tooltip": "Il valore delle Tabelle ACI per il tuo veicolo. Include ammortamento, carburante, manutenzione, ecc. Puoi trovarlo sul sito ACI." },
    { "id": "km_percorsi", "label": "Chilometri Percorsi", "type": "number" as const, "unit": "km", "min": 0, "step": 1, "tooltip": "La distanza totale percorsa per la trasferta lavorativa." },
    { "id": "spese_extra", "label": "Spese di Viaggio Documentate", "type": "number" as const, "unit": "€", "min": 0, "step": 1, "tooltip": "Aggiungi qui i costi di pedaggi autostradali, parcheggi o altre spese di viaggio documentate." },
    { "id": "is_fringe_benefit", "label": "Calcola come Fringe Benefit (Auto a uso promiscuo)", "type": "boolean" as const, "tooltip": "Attiva questa opzione se stai calcolando il valore del benefit per un'auto aziendale usata anche a scopo personale, e non un rimborso per una trasferta specifica." },
    { "id": "perc_fringe_benefit", "label": "Percentuale Fringe Benefit", "type": "number" as const, "unit": "%", "min": 0, "step": 1, "condition": "is_fringe_benefit == true", "tooltip": "La percentuale dipende dalle emissioni di CO₂ del veicolo (es. 25% per ≤60g/km, 30% per 61-160g/km, ecc.). Vedi la guida per i dettagli." }
  ],
  "outputs": [
    { "id": "rimborso_base_km", "label": "Rimborso Chilometrico Puro", "unit": "€" },
    { "id": "rimborso_totale", "label": "Rimborso Totale Spettante", "unit": "€" },
    { "id": "fringe_benefit_annuo", "label": "Valore Fringe Benefit Annuo", "unit": "€" }
  ],
  "content": "### **Guida Definitiva al Rimborso Chilometrico e al Fringe Benefit\n\n**Tabelle ACI, Criteri di Calcolo, Aspetti Fiscali e Normativi per il 2025**\n\nIl rimborso chilometrico e il calcolo del fringe benefit per le auto aziendali sono due aspetti fondamentali della gestione delle trasferte e dei benefit per i dipendenti in Italia. Sebbene entrambi si basino sulle **Tabelle Nazionali dei Costi Chilometrici di Esercizio elaborate dall'ACI**, rispondono a logiche e finalità distinte. \n\nQuesto strumento offre un calcolatore dual-mode per stimare sia l'indennità per una specifica trasferta sia il valore del benefit di un'auto a uso promiscuo. La guida che segue si propone di chiarire ogni aspetto normativo e pratico, fornendo un quadro completo che superi le semplici istruzioni di calcolo.\n\n### **Parte 1: Il Calcolatore – Due Scenari a Confronto**\n\nIl nostro calcolatore permette di simulare due casistiche diverse. È cruciale comprendere quale si applica alla propria situazione.\n\n#### **Scenario A: Calcolo del Rimborso Chilometrico per Trasferta**\n\nQuesto è il caso di un dipendente (o amministratore) che utilizza il **proprio veicolo** per una trasferta di lavoro al di fuori del territorio comunale. L'azienda rimborsa i costi sostenuti basandosi su una tariffa chilometrica.\n\n* **Costo Unitario ACI (€/km)**: È il cuore del calcolo. Questo valore, reperibile sulle tabelle ACI pubblicate in Gazzetta Ufficiale entro il 31 dicembre di ogni anno, rappresenta il costo medio per percorrere un chilometro con un determinato veicolo. Comprende quote di capitale (ammortamento), carburante, pneumatici, manutenzione, riparazioni, e assicurazione RCA.\n* **Chilometri Percorsi**: La distanza totale del viaggio di lavoro.\n* **Spese di Viaggio Documentate (€)**: Costi accessori come pedaggi e parcheggi, che vengono solitamente rimborsati a parte.\n\nL'obiettivo è compensare il dipendente per l'usura e i costi del proprio veicolo messo a disposizione dell'azienda. \n\n#### **Scenario B: Calcolo del Fringe Benefit (Auto a Uso Promiscuo)**\n\nQuesto scenario si applica quando l'azienda concede un **veicolo aziendale** al dipendente, che può utilizzarlo sia per motivi lavorativi che personali (uso promiscuo). L'uso personale costituisce un *compenso in natura* (fringe benefit) che viene tassato in busta paga.\n\n* **Costo Unitario ACI (€/km)**: Anche qui si parte dalla tariffa ACI per il veicolo assegnato.\n* **Percentuale Fringe Benefit (%)**: Il calcolo non si basa sui km reali, ma su una **percorrenza convenzionale annua di 15.000 km**. Il valore imponibile è una percentuale di questo costo totale, determinata dalle emissioni di CO₂ del veicolo, come stabilito dall'Art. 51 del TUIR.\n\n### **Parte 2: Approfondimento Normativo e Fiscale**\n\n#### **Il Rimborso Chilometrico: Tassazione e Deducibilità**\n\nPer il **dipendente**, il rimborso chilometrico **non è tassato** (non costituisce reddito) se calcolato sulla base delle tariffe ACI e per trasferte effettuate al di fuori del Comune in cui si trova la sede di lavoro.\n\nPer l'**azienda**, i rimborsi sono **interamente deducibili** dal reddito d'impresa, a condizione che la trasferta sia documentata e che la potenza del veicolo non superi i 17 cavalli fiscali (o 20 se alimentato a gasolio), secondo l'Art. 95, comma 3 del TUIR.\n\n#### **Il Fringe Benefit: Un Beneficio da Tassare**\n\nIl valore del fringe benefit concorre a formare il reddito da lavoro dipendente e, pertanto, è soggetto a tassazione IRPEF e a contribuzione INPS. Il calcolo, come anticipato, si basa su una percorrenza forfettaria di 15.000 km, moltiplicata per il costo ACI e per una specifica percentuale.\n\nDi seguito la tabella valida per il 2025 basata sulle emissioni di CO₂:\n\nLivello Emissioni CO₂ (g/km)Percentuale per Calcolo Fringe Benefit\n**Fino a 60 g/km** (Veicoli ecologici: elettrici, ibridi plug-in)**25%** del costo ACI su 15.000 km\n**Da 61 a 160 g/km** (Veicoli ibridi, benzina/diesel moderni)**30%** del costo ACI su 15.000 km\n**Da 161 a 190 g/km** (Veicoli potenti o meno recenti)**50%** del costo ACI su 15.000 km\n**Oltre 190 g/km** (Veicoli molto potenti o più inquinanti)**60%** del costo ACI su 15.000 km\n\n**Esempio Pratico di Calcolo Fringe Benefit**:\n* Veicolo con costo ACI di 0,60 €/km ed emissioni di 120 g/km (rientra nello scaglione del 30%).\n* Costo forfettario annuo: 0,60 €/km * 15.000 km = 9.000 €.\n* Valore Fringe Benefit Annuo: 9.000 € * 30% = 2.700 €.\n* Questo importo (2.700 €) verrà aggiunto al reddito imponibile del dipendente e tassato di conseguenza, solitamente ripartito sulle 12 mensilità (225 €/mese in busta paga).\n\n### **Conclusione: Uno Strumento per la Consapevolezza**\n\nComprendere la differenza tra rimborso chilometrico e fringe benefit è essenziale per una corretta gestione amministrativa e per evitare errori fiscali. Questo calcolatore è progettato per fornire stime rapide e affidabili basate sulla normativa vigente, aiutando aziende e dipendenti a navigare la complessità della materia. Per l'applicazione a casi specifici, la consulenza di un commercialista o di un consulente del lavoro rimane imprescindibile."
};

const RimborsoChilometricoAciCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    costo_unitario_km: 0.58,
    km_percorsi: 350,
    spese_extra: 25.50,
    is_fringe_benefit: false,
    perc_fringe_benefit: 30
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const { costo_unitario_km, km_percorsi, spese_extra, is_fringe_benefit, perc_fringe_benefit } = states;
    const rimborso_base_km = costo_unitario_km * km_percorsi;
    const rimborso_totale = rimborso_base_km + spese_extra;
    const fringe_benefit_annuo = is_fringe_benefit ? (costo_unitario_km * 15000) * (perc_fringe_benefit / 100) : 0;
    return { rimborso_base_km, rimborso_totale, fringe_benefit_annuo };
  }, [states]);

  const chartData = [
      { name: 'Rimborso Km', value: calculatedOutputs.rimborso_base_km || 0 },
      { name: 'Spese Extra', value: states.spese_extra || 0 },
  ];
  const COLORS = ['#4f46e5', '#a5b4fc'];

  const formulaRimborso = `Rimborso Totale = (Costo Unitario ACI * Km Percorsi) + Spese Extra`;
  const formulaFringeBenefit = `Fringe Benefit Annuo = (Costo Unitario ACI * 15.000 km) * Percentuale Benefit`;

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
          <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-4">{meta.description}</p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo strumento offre stime a scopo puramente informativo e non sostituisce la consulenza di un professionista. I valori ufficiali sono quelli pubblicati dall'ACI in Gazzetta Ufficiale.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {inputs.map(input => {
                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                if (!conditionMet) return null;

                const inputLabel = (
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                  </label>
                );

                if (input.type === 'boolean') {
                  return (
                    <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-white border">
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
                    {inputLabel}
                    <div className="flex items-center gap-2">
                      <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                      {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
              {states.is_fringe_benefit ? (
                <div className="flex items-baseline justify-between border-l-4 p-4 rounded-r-lg bg-indigo-50 border-indigo-500">
                  <div className="text-sm md:text-base font-medium text-gray-700">{outputs.find(o => o.id === 'fringe_benefit_annuo')?.label}</div>
                  <div className="text-xl md:text-2xl font-bold text-indigo-600">
                    <span>{isClient ? formatCurrency(calculatedOutputs.fringe_benefit_annuo) : '...'}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between border-l-4 p-4 rounded-r-lg bg-gray-50 border-gray-300">
                    <div className="text-sm md:text-base font-medium text-gray-700">{outputs.find(o => o.id === 'rimborso_base_km')?.label}</div>
                    <div className="text-xl md:text-2xl font-bold text-gray-800">
                      <span>{isClient ? formatCurrency(calculatedOutputs.rimborso_base_km) : '...'}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between border-l-4 p-4 rounded-r-lg bg-indigo-50 border-indigo-500">
                    <div className="text-sm md:text-base font-medium text-gray-700">{outputs.find(o => o.id === 'rimborso_totale')?.label}</div>
                    <div className="text-xl md:text-2xl font-bold text-indigo-600">
                      <span>{isClient ? formatCurrency(calculatedOutputs.rimborso_totale) : '...'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {!states.is_fringe_benefit && (calculatedOutputs.rimborso_totale > 0) && (
                 <div className="mt-8">
                     <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione del Rimborso</h3>
                     <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                         {isClient && (
                             <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                     <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                         {chartData.map((entry, index) => (
                                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                         ))}
                                     </Pie>
                                     <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                     <Legend />
                                 </PieChart>
                             </ResponsiveContainer>
                         )}
                     </div>
                 </div>
             )}

            <div className="mt-6 border rounded-lg shadow-sm p-4 bg-white">
                <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{states.is_fringe_benefit ? formulaFringeBenefit : formulaRimborso}</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
              <button onClick={handleReset} className="col-span-2 text-sm w-full border border-red-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 917/1986 (TUIR), Art. 51</a> - Determinazione del reddito di lavoro dipendente.</li>
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 917/1986 (TUIR), Art. 95</a> - Spese per prestazioni di lavoro.</li>
              <li><a href="https://www.aci.it/servizi/servizi-online/costi-chilometrici.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Sito Ufficiale ACI</a> - Consultazione Tabelle Costi Chilometrici.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default RimborsoChilometricoAciCalculator;