'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Bar, BarChart, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Pie, PieChart } from 'recharts';

// --- OTTIMIZZAZIONE: Caricamento dinamico del componente grafico ---
const DynamicPieChart = dynamic(() => Promise.resolve(PieChart), { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg"><p className="text-sm text-gray-500">Caricamento grafico...</p></div> });

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-indigo-500 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Componente per l'iniezione dinamica dello Schema SEO ---
const SchemaInjector = ({ schema }: { schema: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  };

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('|')) {
          const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
          const headers = rows[0];
          const body = rows.slice(2);
          return (
            <div key={index} className="overflow-x-auto my-4">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>{headers.map((h, i) => <th key={i} className="p-2 border text-left font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(h) }} />)}</tr>
                </thead>
                <tbody>
                  {body.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className={`p-2 border ${j > 0 ? 'text-center' : ''}`} dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>)}
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

// --- Dati di Configurazione del Calcolatore ---
const calculatorData = { "slug": "costo-revisione-auto", "category": "Auto e Trasporti", "title": "Calcolatore Costo Revisione Auto", "lang": "it", "inputs": [{ "id": "tipo_veicolo", "label": "Tipo di Veicolo", "type": "select" as const, "options": [{ "label": "Autoveicoli, Motoveicoli, Ciclomotori, Ape", "value": "standard" }, { "label": "Veicoli pesanti (> 3.5t), Taxi, Ambulanze", "value": "pesante" }], "tooltip": "La tariffa base della revisione è la stessa per auto, moto e ciclomotori. I veicoli pesanti o ad uso speciale seguono una periodicità diversa." }, { "id": "luogo_revisione", "label": "Dove vuoi fare la revisione?", "type": "select" as const, "options": [{ "label": "Centro Privato Autorizzato", "value": "privato" }, { "label": "Motorizzazione Civile", "value": "motorizzazione" }], "tooltip": "La maggior parte degli utenti sceglie i centri privati per la rapidità del servizio. La Motorizzazione ha costi inferiori ma procedure più lunghe." }, { "id": "revisione_scaduta", "label": "La revisione è già scaduta?", "type": "boolean" as const, "tooltip": "Seleziona questa opzione se stai circolando con la revisione scaduta per visualizzare le possibili sanzioni economiche." }], "outputs": [{ "id": "costo_revisione", "label": "Costo Totale Revisione", "unit": "€" }, { "id": "sanzione_minima", "label": "Sanzione Minima per Ritardo", "unit": "€", "condition": "revisione_scaduta == true" }, { "id": "costo_complessivo", "label": "Costo Totale (Revisione + Sanzione Minima)", "unit": "€", "condition": "revisione_scaduta == true" }], "formulaSteps": [{ "id": "costo_base_privato", "expr": "54.95" }, { "id": "iva_privato", "expr": "costo_base_privato * 0.22" }, { "id": "diritti_motorizzazione", "expr": "10.20" }, { "id": "commissione_postale", "expr": "1.78" }, { "id": "costo_totale_privato", "expr": "costo_base_privato + iva_privato + diritti_motorizzazione + commissione_postale" }, { "id": "costo_totale_motorizzazione", "expr": "45.00" }, { "id": "costo_revisione", "expr": "luogo_revisione == 'privato' ? costo_totale_privato : costo_totale_motorizzazione" }, { "id": "sanzione_minima", "expr": "revisione_scaduta ? 173 : 0" }, { "id": "costo_complessivo", "expr": "costo_revisione + sanzione_minima" }], "examples": [{ "inputs": { "tipo_veicolo": "standard", "luogo_revisione": "privato", "revisione_scaduta": false }, "outputs": { "costo_revisione": 79.02, "sanzione_minima": 0, "costo_complessivo": 79.02 } }], "tags": "costo revisione auto, calcolo revisione, tariffa revisione 2025, revisione scaduta, prezzo revisione moto, Motorizzazione Civile, centro revisioni, multa revisione, scadenza revisione", "content": "### **Guida Completa al Costo della Revisione Auto**\n\n**Analisi dei Costi, Scadenze e Sanzioni per non essere mai impreparato**\n\nLa revisione periodica del veicolo è un obbligo di legge fondamentale per garantire la sicurezza stradale e il rispetto delle normative antinquinamento. Comprendere i costi, le scadenze e le conseguenze di una mancata revisione è essenziale per ogni automobilista. \n\nQuesto strumento offre un calcolo preciso dei costi ufficiali e una guida dettagliata per affrontare questo importante adempimento con serenità e consapevolezza, evidenziando le differenze tra i vari canali disponibili.\n\n### **Parte 1: Il Calcolatore - Come Interpretare i Costi**\n\nIl nostro calcolatore scompone il costo della revisione basandosi sulle due opzioni principali a disposizione dell'utente, come previsto dalla normativa vigente.\n\n* **Centro Privato Autorizzato**: La scelta più comune, rapida e capillare sul territorio. Il costo è standardizzato a livello nazionale e include diverse voci.\n* **Motorizzazione Civile (UMC)**: L'opzione statale, più economica ma che richiede generalmente tempi più lunghi e una prenotazione diretta da parte del cittadino.\n\nL'output principale, il **Costo Totale Revisione**, rappresenta la spesa che dovrai sostenere. Includiamo anche una stima della **sanzione minima** in caso di revisione scaduta, per darti un quadro completo dei rischi economici.\n\n### **Parte 2: Analisi Dettagliata dei Costi (Tariffe 2025)**\n\nIl costo finale della revisione non è un importo arbitrario, ma la somma di voci ben definite dalla legge. Ecco una tabella chiara che illustra la composizione dei prezzi.\n\n| Voce di Costo | Centro Privato Autorizzato | Motorizzazione Civile (UMC) |\n| :--- | :---: | :---: |\n| **Tariffa di revisione** | 54,95 € | 45,00 € |\n| **IVA (22% sulla tariffa)**| + 12,09 € | N/A |\n| **Diritti fissi Motorizzazione** | + 10,20 € | N/A |\n| **Commissione bollettino** | + 1,78 € | Costo variabile (PagoPA) |\n| **COSTO FINALE** | **79,02 €** | **45,00 €** |\n\nCome si evince, la revisione presso un **centro privato ha un costo fisso di 79,02 €**. Presso la **Motorizzazione Civile, il costo è di 45,00 €**, da versare tramite il sistema PagoPA, a cui si aggiunge una piccola commissione di transazione.\n\n### **Parte 3: Scadenze e Sanzioni - Cosa Dice la Legge**\n\nConoscere le scadenze è fondamentale per evitare pesanti sanzioni. Le regole sono dettate dall'articolo 80 del Codice della Strada.\n\n#### **Quando va fatta la revisione?**\n\n1.  **Prima Revisione**: Va effettuata **dopo 4 anni** dalla prima immatricolazione, entro la fine del mese di rilascio della carta di circolazione.\n2.  **Revisioni Successive**: Devono essere fatte **ogni 2 anni**, entro la fine del mese in cui è stata effettuata la revisione precedente.\n\n*Eccezioni*: Veicoli come taxi, ambulanze, autobus e rimorchi superiori a 3,5t devono essere revisionati **annualmente**.\n\n#### **Cosa succede se la revisione è scaduta?**\n\nCircolare con un veicolo non revisionato comporta conseguenze severe:\n\n* **Sanzione Amministrativa**: Una multa che va **da 173 € a 694 €**. In caso di recidiva (mancata revisione per più di una volta), l'importo della multa raddoppia.\n* **Sospensione dalla Circolazione**: Il veicolo viene sospeso e può circolare solo per recarsi a fare la revisione. La violazione di questa disposizione comporta una multa aggiuntiva da 1.998 € a 7.993 € e il fermo amministrativo del veicolo per 90 giorni.\n* **Implicazioni Assicurative**: In caso di incidente con revisione scaduta, la compagnia assicurativa potrebbe esercitare il diritto di rivalsa, chiedendoti il rimborso delle somme pagate per i danni.\n\n### **Parte 4: Cosa Viene Controllato Durante la Revisione?**\n\nLa revisione è un check-up completo del veicolo per verificarne l'efficienza e la sicurezza. I controlli principali includono:\n\n* **Impianto Frenante**: Efficienza di frenata, freno a mano.\n* **Sterzo e Sospensioni**: Gioco dello sterzo, usura dei componenti.\n* **Impianto Elettrico**: Funzionamento di luci, indicatori di direzione, clacson.\n* **Telaio e Carrozzeria**: Integrità strutturale, assenza di corrosione grave.\n* **Pneumatici e Ruote**: Usura del battistrada, conformità delle misure.\n* **Emissioni Inquinanti**: Controllo dei gas di scarico (il vecchio 'bollino blu').\n* **Equipaggiamenti di Sicurezza**: Cinture, triangolo, identificazione del veicolo (numero di telaio).\n", "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "Quanto costa la revisione auto nel 2025?", "acceptedAnswer": { "@type": "Answer", "text": "Il costo della revisione auto nel 2025 è fisso e dipende da dove la si effettua. Presso un centro privato autorizzato il costo è di 79,02 €. Presso la Motorizzazione Civile (UMC) il costo è di 45,00 €, da pagare tramite PagoPA." } }, { "@type": "Question", "name": "Ogni quanto si fa la revisione auto?", "acceptedAnswer": { "@type": "Answer", "text": "La prima revisione va fatta 4 anni dopo la prima immatricolazione del veicolo. Successivamente, la revisione deve essere ripetuta ogni 2 anni. Per alcune categorie di veicoli, come taxi e ambulanze, la revisione è annuale." } }, { "@type": "Question", "name": "Cosa succede se circolo con la revisione scaduta?", "acceptedAnswer": { "@type": "Answer", "text": "Circolare con la revisione scaduta comporta una sanzione amministrativa da 173 € a 694 €, oltre alla sospensione del veicolo dalla circolazione. In caso di incidente, l'assicurazione potrebbe applicare il diritto di rivalsa." } }] } };

const CostoRevisioneAutoCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    tipo_veicolo: 'standard',
    luogo_revisione: 'privato',
    revisione_scaduta: false
  };

  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setStates(initialStates);
  };

  const calculatedOutputs = useMemo(() => {
    const { luogo_revisione, revisione_scaduta } = states;
    
    const costo_base_privato = 54.95;
    const iva_privato = costo_base_privato * 0.22;
    const diritti_motorizzazione = 10.20;
    const commissione_postale = 1.78;
    const costo_totale_privato = costo_base_privato + iva_privato + diritti_motorizzazione + commissione_postale;
    const costo_totale_motorizzazione = 45.00;
    
    const costo_revisione = luogo_revisione === 'privato' ? costo_totale_privato : costo_totale_motorizzazione;
    const sanzione_minima = revisione_scaduta ? 173 : 0;
    const costo_complessivo = costo_revisione + sanzione_minima;
    
    return {
      costo_revisione,
      sanzione_minima,
      costo_complessivo,
      // Dati extra per grafico
      breakdown: {
        tariffa: luogo_revisione === 'privato' ? costo_base_privato : costo_totale_motorizzazione,
        iva: luogo_revisione === 'privato' ? iva_privato : 0,
        diritti: luogo_revisione === 'privato' ? diritti_motorizzazione : 0,
        commissione: luogo_revisione === 'privato' ? commissione_postale : 0
      }
    };
  }, [states]);

  const pieChartData = [
      { name: 'Tariffa Base', value: calculatedOutputs.breakdown.tariffa, fill: '#4f46e5' },
      { name: 'IVA 22%', value: calculatedOutputs.breakdown.iva, fill: '#818cf8' },
      { name: 'Diritti MCTC', value: calculatedOutputs.breakdown.diritti, fill: '#a5b4fc' },
      { name: 'Commissioni', value: calculatedOutputs.breakdown.commissione, fill: '#c7d2fe' },
  ].filter(d => d.value > 0);


  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const calculatorEl = calculatorRef.current;
      if (!calculatorEl) return;
      const canvas = await html2canvas(calculatorEl, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) {
      console.error("Errore esportazione PDF:", e);
      alert("La funzione di esportazione in PDF non è disponibile o si è verificato un errore.");
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const { breakdown, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const savedResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...savedResults].slice(0, 50)));
      alert('Risultato salvato con successo!');
    } catch {
      alert('Impossibile salvare il risultato.');
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <>
      <SchemaInjector schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        
        {/* Colonna Principale */}
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">Calcola il costo ufficiale della revisione per il tuo veicolo e scopri le sanzioni in caso di ritardo.</p>
            
            <div className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo calcolatore si basa sulle tariffe ufficiali del 2025. L'importo non include eventuali costi per riparazioni necessarie a superare la revisione ('pre-revisione').
            </div>

            {/* Sezione Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputs.map(input => {
                const inputLabel = (
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                  </label>
                );

                if (input.type === 'select') {
                    return (
                        <div key={input.id}>
                            {inputLabel}
                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                    )
                }

                if (input.type === 'boolean') {
                    return (
                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-gray-50 border">
                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                            {input.tooltip && <Tooltip text={input.tooltip}><span className="cursor-help"><InfoIcon /></span></Tooltip>}
                        </div>
                    );
                }
                
                return null;
              })}
            </div>

            {/* Sezione Risultati */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Risultati</h2>
              {outputs.map(output => {
                const conditionMet = !output.condition || (output.condition.includes('== true') && states[output.condition.split(' ')[0]]);
                if (!conditionMet) return null;
                
                const isMainOutput = output.id === 'costo_revisione';
                const isWarningOutput = output.id.includes('sanzione') || output.id.includes('complessivo');

                return (
                  <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${isMainOutput ? 'bg-indigo-50 border-indigo-500' : (isWarningOutput ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300')}`}>
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${isMainOutput ? 'text-indigo-600' : (isWarningOutput ? 'text-red-600' : 'text-gray-800')}`}>
                      <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Sezione Grafico */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione del Costo</h3>
                <div className="h-64 w-full p-2">
                    {isClient && (
                         <ResponsiveContainer width="100%" height="100%">
                            <DynamicPieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}>
                                </Pie>
                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                            </DynamicPieChart>
                         </ResponsiveContainer>
                    )}
                </div>
            </div>

          </div>
        </div>

        {/* Colonna Laterale */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={saveResult} className="w-full text-sm font-medium border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full text-sm font-medium border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
              <button onClick={handleReset} className="w-full text-sm font-medium border border-gray-300 rounded-md px-4 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
             <h2 className="font-semibold mb-2 text-gray-800">Guida Dettagliata</h2>
             <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1992-04-30;285!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice della Strada, Art. 80</a> - Revisioni.</li>
              <li><a href="https://www.mit.gov.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ministero delle Infrastrutture e dei Trasporti</a></li>
            </ul>
          </section>
        </aside>

      </div>
    </>
  );
};

export default CostoRevisioneAutoCalculator;