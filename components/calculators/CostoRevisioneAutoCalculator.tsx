'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Bar, BarChart, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Pie, PieChart } from 'recharts';

// --- OTTIMIZZAZIONE: Caricamento dinamico del componente grafico ---
const DynamicPieChart = dynamic(() => Promise.resolve(PieChart), { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg"><p className="text-sm text-gray-500">Caricamento grafico...</p></div> });

// --- Icone SVG per una UI più chiara ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-indigo-500 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const CarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M14 16.5V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.5M14 16.5h4l3 3H3l3-3h4M14 16.5L12 6 6 6l-3 6h15Z"></path><circle cx="6.5" cy="11.5" r="1.5"></circle><circle cx="17.5" cy="11.5" r="1.5"></circle></svg>
);
const WrenchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
);


// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Componente Modale per Informazioni Aggiuntive ---
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="text-gray-700">{children}</div>
      </div>
    </div>
  );
};

// --- Componente per renderizzare il contenuto con HTML ---
const ContentRenderer = ({ content }: { content: { title: string; sections: { subtitle?: string; text: string; list?: string[] }[] } }) => {
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
        {content.sections.map((section, index) => (
            <div key={index} className="mb-4">
                {section.subtitle && <h3 className="font-semibold text-gray-800 !mb-1">{section.subtitle}</h3>}
                <p className="!mt-0" dangerouslySetInnerHTML={{ __html: section.text }} />
                {section.list && (
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        {section.list.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                )}
            </div>
        ))}
    </div>
  );
};


// Componente principale del calcolatore di revisione
const RevisioneCalculator: React.FC = () => {
    // Stati per gestire gli input dell'utente e i risultati
    const [tipoVeicolo, setTipoVeicolo] = useState<string>('standard');
    const [calculationMode, setCalculationMode] = useState<string>('immatricolazione');
    const [inputDate, setInputDate] = useState<string>('');
    const [scadenza, setScadenza] = useState<string | null>(null);
    const [costo, setCosto] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });
    const [showResult, setShowResult] = useState(false);

  const content = useMemo(() => {
    // Dati aggiornati al 16 Ottobre 2025
    return {
      title: "Guida Completa alla Revisione Auto 2025",
      sections: [
        {
          subtitle: "Quando effettuare la revisione?",
          text: "La normativa italiana stabilisce scadenze precise per la revisione dei veicoli, essenziale per garantire la sicurezza stradale e il rispetto dell'ambiente.",
          list: [
            "<b>Prima revisione:</b> da effettuare <b>4 anni</b> dopo la data di prima immatricolazione, entro il mese di rilascio della carta di circolazione.",
            "<b>Revisioni successive:</b> ogni <b>2 anni</b>, entro il mese in cui è stata effettuata l'ultima revisione.",
            "<b>Casi particolari:</b> Taxi, NCC, ambulanze e veicoli con massa superiore a 3.5t devono effettuare la revisione <b>annualmente</b>."
          ]
        },
        {
          subtitle: "Analisi dei costi",
          text: "Il costo della revisione è fissato per legge e si compone di diverse voci. A partire dal 2021, la tariffa è stata aggiornata.",
          list: [
            "<b>Tariffa fissa (Motorizzazione Civile):</b> 54,95 €.",
            "<b>IVA al 22%:</b> 12,09 €.",
            "<b>Diritti fissi e PFU:</b> 11,81 € (include 10,20 € per pratiche postali e 1,61 € PFU).",
            "<b>Totale:</b> Il costo finale si attesta a <b>78,85 €</b>, anche se arrotondato spesso a 79,00 €."
          ]
        },
        {
            subtitle: "Sanzioni per mancata revisione",
            text: "Circolare con un veicolo non revisionato comporta sanzioni severe, che possono aumentare in caso di recidiva o se si causa un incidente.",
            list: [
                "<b>Sanzione amministrativa:</b> da 173 € a 694 €. L'importo raddoppia in caso di revisione omessa per più di una volta.",
                "<b>Sospensione dalla circolazione:</b> il veicolo non può circolare (salvo che per recarsi in officina) fino a revisione effettuata.",
                "<b>Sanzioni accessorie:</b> In caso di incidente con revisione scaduta, la compagnia assicurativa potrebbe esercitare il diritto di rivalsa sull'assicurato."
            ]
        }
      ]
    };
  }, []);

  const resultRef = useRef<HTMLDivElement>(null);

  // Funzione per calcolare scadenza e costo
  const handleCalculate = useCallback(() => {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      openModal("Errore", "Per favore, inserisci una data valida.");
      return;
    }

    let scadenzaDate = new Date(date);
    const oggi = new Date();

    if (calculationMode === 'immatricolazione') {
      scadenzaDate.setFullYear(date.getFullYear() + 4);
    } else { // 'ultima-revisione'
      scadenzaDate.setFullYear(date.getFullYear() + 2);
    }

    // Imposta la scadenza alla fine del mese
    scadenzaDate.setMonth(scadenzaDate.getMonth() + 1, 0);

    const formattedScadenza = scadenzaDate.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
    });
    
    setScadenza(formattedScadenza);

    // Calcolo del costo
    const costoBase = 79.00; // Tariffa aggiornata
    let costoFinale = costoBase;
    if (tipoVeicolo === 'storico') {
        costoFinale = 45.00; // Esempio di costo ridotto per veicoli storici
    } else if (tipoVeicolo === 'pesante') {
        costoFinale = 95.00; // Esempio costo per veicoli pesanti
    }
    setCosto(costoFinale);
    setShowResult(true);

  }, [inputDate, calculationMode, tipoVeicolo]);

  useEffect(() => {
    if (showResult && resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showResult]);

  const handleReset = () => {
    setInputDate('');
    setTipoVeicolo('standard');
    setCalculationMode('immatricolazione');
    setShowResult(false);
    setScadenza(null);
    setCosto(null);
  };

  const handleExportPDF = () => {
    if (!showResult || !resultRef.current) {
        openModal("Attenzione", "Nessun risultato da esportare. Effettua prima un calcolo.");
        return;
    }
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
        printWindow.document.write('<html><head><title>Report Revisione Veicolo</title>');
        printWindow.document.write('<style>body{font-family: Arial, sans-serif; padding: 20px;} h1{color: #1e3a8a;} .result-section{border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-top: 20px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Report Calcolo Revisione</h1>');
        printWindow.document.write(resultRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
  };
  
  const openModal = (title: string, body: string) => {
    setModalContent({ title, body });
    setIsModalOpen(true);
  };
  
  const costData = [
    { name: 'Tariffa', value: 54.95, fill: '#4f46e5' },
    { name: 'IVA 22%', value: 12.09, fill: '#818cf8' },
    { name: 'Diritti', value: 11.81, fill: '#c7d2fe' },
  ];

  return (
    <div className="bg-slate-50 font-sans p-4 sm:p-6 md:p-8">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent.title}>
        <p>{modalContent.body}</p>
      </Modal>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Colonna Sinistra - Input */}
        <aside className="lg:col-span-2 space-y-6">
            <div className='bg-white p-6 rounded-lg shadow-lg border border-gray-200'>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Calcolatore Costo Revisione Auto</h1>
            <p className="text-sm text-gray-600 mb-6">Inserisci i dati per calcolare costo e scadenza.</p>

            <div className="space-y-5">
                <div>
                    <label htmlFor="calculationMode" className="block text-sm font-medium text-gray-700 mb-1">Calcola da</label>
                    <div className="flex bg-gray-100 rounded-md p-1">
                        <button onClick={() => setCalculationMode('immatricolazione')} className={`w-1/2 text-sm py-2 rounded ${calculationMode === 'immatricolazione' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600'}`}>Immatricolazione</button>
                        <button onClick={() => setCalculationMode('ultima-revisione')} className={`w-1/2 text-sm py-2 rounded ${calculationMode === 'ultima-revisione' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600'}`}>Ultima Revisione</button>
                    </div>
                </div>

                <div>
                    <label htmlFor="inputDate" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        Data di {calculationMode === 'immatricolazione' ? 'Immatricolazione' : 'Ultima Revisione'}
                        <Tooltip text={calculationMode === 'immatricolazione' ? 'Data in cui il veicolo è stato immatricolato per la prima volta.' : 'Data in cui è stata effettuata l\'ultima revisione periodica.'}>
                            <span className="ml-1.5"><InfoIcon /></span>
                        </Tooltip>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon /></span>
                        <input
                            type="date"
                            id="inputDate"
                            value={inputDate}
                            onChange={(e) => setInputDate(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="tipoVeicolo" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        Tipo di Veicolo
                        <Tooltip text="Seleziona la categoria del tuo veicolo. Il costo può variare.">
                            <span className="ml-1.5"><InfoIcon /></span>
                        </Tooltip>
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CarIcon /></span>
                        <select
                            id="tipoVeicolo"
                            value={tipoVeicolo}
                            onChange={(e) => setTipoVeicolo(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none"
                        >
                            <option value="standard">Auto, Moto, Furgoni (&lt;3.5t)</option>
                            <option value="pesante">Veicoli pesanti (&gt;3.5t), Taxi, NCC</option>
                            <option value="storico">Veicolo d'interesse storico</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleCalculate}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                >
                    Calcola Ora
                </button>
            </div>
          </div>
        </aside>
        
        {/* Colonna Destra - Risultati e Info */}
        <main className="lg:col-span-3 space-y-6">
            
            {showResult && (
                <section ref={resultRef} className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-6 shadow-lg animate-fade-in">
                    <h2 className="text-xl font-bold text-indigo-900 mb-4">Risultati del Calcolo</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        
                        {/* Box Scadenza */}
                        <div className="bg-white p-5 rounded-lg border">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Prossima Scadenza</h3>
                            <p className="text-2xl font-bold text-indigo-700">{scadenza}</p>
                            <p className="text-xs text-gray-500 mt-1">Entro la fine del mese indicato.</p>
                        </div>

                        {/* Box Costo */}
                        <div className="bg-white p-5 rounded-lg border">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Costo Stimato</h3>
                            <p className="text-2xl font-bold text-indigo-700">€ {costo?.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-1">Tariffa ministeriale aggiornata.</p>
                        </div>

                    </div>
                    <div className="mt-6">
                         <h3 className="text-lg font-semibold text-indigo-900 mb-3 text-center">Dettaglio Costo Standard</h3>
                         <div className='h-48 w-full'>
                            <ResponsiveContainer>
                                <DynamicPieChart>
                                    <Pie data={costData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: €${value.toFixed(2)}`}>
                                        {costData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <ChartTooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                                </DynamicPieChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button onClick={handleExportPDF} className="w-full text-sm font-medium bg-gray-700 text-white rounded-md px-4 py-2 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Esporta in PDF</button>
                      <button onClick={handleReset} className="w-full text-sm font-medium border border-gray-300 rounded-md px-4 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                    </div>
                </section>
            )}

            <section className="border rounded-lg p-6 bg-white shadow-md">
                 <h2 className="font-bold text-xl text-gray-800 mb-4">Guida Dettagliata</h2>
                 <ContentRenderer content={content} />
            </section>

            <section className="border rounded-lg p-6 bg-white shadow-md">
              <h2 className="font-bold text-xl text-gray-800 mb-4">Fonti e Riferimenti Normativi</h2>
              <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1992-04-30;285!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice della Strada, Art. 80</a> - Disciplina delle revisioni.</li>
                <li>Circolare Ministero delle Infrastrutture e dei Trasporti - Aggiornamenti tariffe.</li>
              </ul>
            </section>
        </main>
      </div>
    </div>
  );
};

export default RevisioneCalculator;

