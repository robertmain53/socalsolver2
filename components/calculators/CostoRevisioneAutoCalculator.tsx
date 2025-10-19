'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

// --- OTTIMIZZAZIONE: Caricamento dinamico del componente grafico ---
const DynamicPieChart = dynamic(() => Promise.resolve(PieChart), { ssr: false, loading: () => <div className="h-48 w-full flex items-center justify-center bg-gray-100 rounded-lg"><p className="text-sm text-gray-500">Caricamento grafico...</p></div> });

// --- Icone SVG per una UI più chiara ---
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-indigo-500 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M14 16.5V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.5M14 16.5h4l3 3H3l3-3h4M14 16.5L12 6 6 6l-3 6h15Z"></path><circle cx="6.5" cy="11.5" r="1.5"></circle><circle cx="17.5" cy="11.5" r="1.5"></circle></svg>;
const CheckCircleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;

// --- Componenti UI Riutilizzabili ---
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div>
    </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-lg w-full transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

const ContentRenderer = ({ content }: { content: { title: string; sections: { subtitle?: string; text: string; list?: string[] }[] } }) => (
    <div className="prose prose-sm max-w-none text-gray-700">
        {content.sections.map((section, index) => (
            <div key={index} className="mb-4">
                {section.subtitle && <h3 className="font-semibold text-gray-800 !mb-1 !text-base">{section.subtitle}</h3>}
                <p className="!mt-0 text-sm" dangerouslySetInnerHTML={{ __html: section.text }} />
                {section.list && (
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                        {section.list.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}
                    </ul>
                )}
            </div>
        ))}
    </div>
);

// --- Componente Innovativo: Checklist Pre-Revisione ---
const ChecklistPreRevisione = () => {
    const checklistItems = useMemo(() => [
        { id: 'luci', text: 'Funzionamento di tutte le luci (posizione, anabbaglianti, abbaglianti, stop, frecce)' },
        { id: 'pneumatici', text: 'Pressione e usura del battistrada degli pneumatici (minimo 1.6 mm)' },
        { id: 'clacson', text: 'Funzionamento del clacson' },
        { id: 'tergicristalli', text: 'Integrità delle spazzole tergicristallo e liquido lavavetri' },
        { id: 'targa', text: 'Targa anteriore e posteriore pulita e leggibile' },
        { id: 'documenti', text: 'Presenza a bordo della carta di circolazione (o Documento Unico)' }
    ], []);
    
    const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
      Object.fromEntries(checklistItems.map(item => [item.id, false]))
    );

    const handleCheckboxChange = (id: string) => {
        setCheckedState(prevState => ({ ...prevState, [id]: !prevState[id] }));
    };

    const completedCount = Object.values(checkedState).filter(Boolean).length;
    const progress = (completedCount / checklistItems.length) * 100;

    return (
        <section className="border rounded-lg p-6 bg-white shadow-md">
            <h2 className="font-bold text-xl text-gray-800 mb-2">Checklist Pre-Revisione</h2>
            <p className="text-sm text-gray-600 mb-4">Evita sorprese! Esegui questi semplici controlli prima di portare il tuo veicolo in revisione.</p>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-3">
                {checklistItems.map(({ id, text }) => (
                    <label key={id} className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                        <input type="checkbox" checked={checkedState[id]} onChange={() => handleCheckboxChange(id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className={`ml-3 text-sm ${checkedState[id] ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{text}</span>
                    </label>
                ))}
            </div>
            {progress === 100 && <p className="text-center mt-4 text-green-600 font-semibold flex items-center justify-center"><CheckCircleIcon className='w-5 h-5 mr-2'/> Ottimo lavoro! Sei pronto per la revisione.</p>}
        </section>
    );
};

// --- Componente Principale del Calcolatore ---
const RevisioneCalculator: React.FC = () => {
    const [tipoVeicolo, setTipoVeicolo] = useState<string>('standard');
    const [calculationMode, setCalculationMode] = useState<string>('immatricolazione');
    const [inputDate, setInputDate] = useState<string>('');
    const [scadenza, setScadenza] = useState<string | null>(null);
    const [costo, setCosto] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    
    const [email, setEmail] = useState('');
    const [notificationStatus, setNotificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });

    const resultRef = useRef<HTMLDivElement>(null);

    const content = useMemo(() => ({
        title: "Guida Completa alla Revisione Auto 2025",
        sections: [
            { subtitle: "Scadenze: Quando effettuare la revisione?", text: "La legge stabilisce scadenze precise per garantire la sicurezza stradale.", list: ["<b>Prima revisione:</b> 4 anni dopo la prima immatricolazione, entro il mese di rilascio della carta di circolazione.", "<b>Revisioni successive:</b> ogni 2 anni, entro il mese dell'ultima revisione.", "<b>Casi particolari (Taxi, NCC, veicoli >3.5t):</b> revisione annuale."] },
            { subtitle: "Analisi dei Costi Ufficiali", text: "Il costo è fissato per legge. La tariffa ministeriale (dal 2021) è di <b>54,95 €</b>. A questo importo si aggiungono IVA, diritti e spese postali, per un totale di circa <b>79,00 €</b>." },
            { subtitle: "Cosa viene controllato durante la revisione?", text: "I tecnici verificano l'efficienza e la conformità dei principali sistemi di sicurezza del veicolo:", list: ["<b>Impianto frenante:</b> efficienza e bilanciamento.", "<b>Sterzo e sospensioni:</b> giochi anomali e usura.", "<b>Visibilità:</b> integrità di vetri e specchietti.", "<b>Impianto elettrico:</b> funzionamento di tutte le luci.", "<b>Telaio e Pneumatici:</b> usura, corrosione e conformità.", "<b>Emissioni:</b> controllo dei gas di scarico e rumorosità."] },
            { subtitle: "Esito della Revisione: Regolare, Ripetere o Sospeso?", text: "L'esito viene annotato sulla carta di circolazione:", list: ["<b>REGOLARE:</b> Veicolo idoneo.", "<b>RIPETERE:</b> Difetti da correggere entro un mese prima di una nuova revisione.", "<b>SOSPESO:</b> Difetti gravi. Il veicolo non può circolare fino a riparazione e nuova revisione."] },
            { subtitle: "Sanzioni per mancata revisione", text: "Circolare con revisione scaduta comporta una multa da 173 € a 694 €, il raddoppio in caso di recidiva e il ritiro della carta di circolazione." },
            { subtitle: "Revisione Impianti GPL e Metano", text: "Oltre alla revisione standard, questi veicoli devono revisionare separatamente le bombole: ogni 10 anni per il GPL, ogni 4 o 5 per il Metano." },
        ]
    }), []);
    
    const handleCalculate = useCallback(() => {
        const date = new Date(inputDate);
        if (isNaN(date.getTime())) { openModal("Errore", "Per favore, inserisci una data valida."); return; }

        let scadenzaDate = new Date(date);
        calculationMode === 'immatricolazione' ? scadenzaDate.setFullYear(date.getFullYear() + 4) : scadenzaDate.setFullYear(date.getFullYear() + 2);
        scadenzaDate.setMonth(scadenzaDate.getMonth() + 1, 0);

        setScadenza(scadenzaDate.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' }));
        setCosto(tipoVeicolo === 'storico' ? 45.00 : 79.00); // Semplificato
        setShowResult(true);
        setNotificationStatus('idle');
        setEmail('');

    }, [inputDate, calculationMode, tipoVeicolo]);

    useEffect(() => {
        if (showResult) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [showResult]);

    const handleReset = () => {
        setShowResult(false);
        setInputDate('');
    };

    const handleSetReminder = useCallback(async () => {
      if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        openModal("Errore", "Inserisci un indirizzo email valido.");
        setNotificationStatus('error');
        return;
      }
      // Simulazione chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotificationStatus('success');
    }, [email]);

    const openModal = (title: string, body: string) => {
        setModalContent({ title, body });
        setIsModalOpen(true);
    };
    
    const costData = [{ name: 'Tariffa', value: 54.95, fill: '#4f46e5' }, { name: 'IVA 22%', value: 12.09, fill: '#818cf8' }, { name: 'Diritti e Spese', value: 11.96, fill: '#c7d2fe' }];

    return (
        <div className="bg-slate-50 font-sans p-4 sm:p-6 md:p-8">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent.title}><p>{modalContent.body}</p></Modal>
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
                <aside className="lg:col-span-2 space-y-6">
                    <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-8'>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Assistente Revisione</h1>
                        <p className="text-sm text-gray-600 mb-6">Calcola, pianifica e preparati alla revisione.</p>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Calcola da</label>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button onClick={() => setCalculationMode('immatricolazione')} className={`w-1/2 text-sm py-2 rounded-md transition-all ${calculationMode === 'immatricolazione' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Immatricolazione</button>
                                    <button onClick={() => setCalculationMode('ultima-revisione')} className={`w-1/2 text-sm py-2 rounded-md transition-all ${calculationMode === 'ultima-revisione' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Ultima Revisione</button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="inputDate" className="flex items-center text-sm font-medium text-gray-700 mb-1 group">Data di {calculationMode === 'immatricolazione' ? 'Immatricolazione' : 'Ultima Revisione'} <Tooltip text={calculationMode === 'immatricolazione' ? 'Data di prima immatricolazione del veicolo.' : 'Data dell\'ultima revisione effettuata.'}><span className="ml-1.5"><InfoIcon /></span></Tooltip></label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon /></span>
                                    <input type="date" id="inputDate" value={inputDate} onChange={e => setInputDate(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="tipoVeicolo" className="flex items-center text-sm font-medium text-gray-700 mb-1 group">Tipo di Veicolo <Tooltip text="Il costo standard è ~79€. Quello per veicoli storici iscritti ASI/FIVS è ridotto."><span className="ml-1.5"><InfoIcon /></span></Tooltip></label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CarIcon /></span>
                                    <select id="tipoVeicolo" value={tipoVeicolo} onChange={e => setTipoVeicolo(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none">
                                        <option value="standard">Auto, Moto, Furgoni (&lt;3.5t)</option>
                                        <option value="storico">Veicolo d'interesse storico (ASI/FIVS)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button onClick={handleCalculate} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">Calcola Scadenza e Costo</button>
                        </div>
                    </div>
                </aside>
                <main className="lg:col-span-3 space-y-6">
                    {showResult && (
                        <section ref={resultRef} className="border-2 border-indigo-200 bg-white rounded-lg p-6 shadow-lg">
                            <h2 className="text-xl font-bold text-indigo-900 mb-4">Risultati del Calcolo</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Prossima Scadenza</h3>
                                    <p className="text-2xl font-bold text-indigo-700">{scadenza}</p>
                                </div>
                                <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Costo Ufficiale</h3>
                                    <p className="text-2xl font-bold text-indigo-700">€ {costo?.toFixed(2)}</p>
                                </div>
                            </div>
                            
                            {/* Innovazione: Sistema di Notifica */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-800">Non dimenticartene!</h3>
                                <p className="text-sm text-gray-600 mb-3">Imposta un promemoria gratuito. Ti invieremo un'email un mese prima della scadenza.</p>
                                {notificationStatus === 'success' ? (
                                    <div className="text-green-600 font-semibold flex items-center p-3 bg-green-50 rounded-md"><CheckCircleIcon className='w-5 h-5 mr-2'/>Promemoria impostato per {email}!</div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="relative flex-grow">
                                            <MailIcon />
                                            <input type="email" placeholder="La tua email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm" />
                                        </div>
                                        <button onClick={handleSetReminder} className="bg-gray-800 text-white font-semibold text-sm py-2 px-4 rounded-md hover:bg-gray-900 transition-colors">Imposta Promemoria</button>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4"><button onClick={handleReset} className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-800">Effettua un nuovo calcolo</button></div>
                        </section>
                    )}
                    
                    <ChecklistPreRevisione />

                    <section className="border rounded-lg p-6 bg-white shadow-md">
                        <h2 className="font-bold text-xl text-gray-800 mb-4">Guida Completa alla Revisione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    
                    <section className="border rounded-lg p-6 bg-white shadow-md">
                        <h2 className="font-bold text-xl text-gray-800 mb-4">Verifica Ufficiale e Fonti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><b>Verifica l'ultima revisione:</b> Controlla i dati ufficiali di qualsiasi veicolo sul <a href="https://www.ilportaledellautomobilista.it/web/portale-automobilista/verifica-revisioni-effettuate-ms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Portale dell'Automobilista</a>.</li>
                            <li><b>Normativa di riferimento:</b> <a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1992-04-30;285!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Art. 80 del Codice della Strada</a>.</li>
                        </ul>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default RevisioneCalculator;

