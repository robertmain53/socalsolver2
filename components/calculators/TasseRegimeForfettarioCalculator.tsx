'use client';

import React, { useState, useRef, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Info } from 'lucide-react';

// --- Icona per i Tooltip (da lucide-react) ---
const InfoIcon = () => <Info size={16} className="text-gray-400 hover:text-gray-600 transition-colors ml-1" />;

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
      <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
    </div>
  </div>
);

// Dati dei codici ATECO
const atecoData = [
    { code: "62.01.00", description: "Produzione di software, consulenza informatica", coefficient: 0.67 },
    { code: "70.22.09", description: "Altre attività di consulenza imprenditoriale", coefficient: 0.78 },
    { code: "74.10.21", description: "Attività dei disegnatori grafici", coefficient: 0.78 },
    { code: "86.90.29", description: "Altre attività sanitarie (non mediche)", coefficient: 0.78 },
    { code: "47.91.10", description: "Commercio al dettaglio via internet", coefficient: 0.40 },
    { code: "96.09.09", description: "Altri servizi alla persona n.c.a.", coefficient: 0.67 },
    { code: "43.32.02", description: "Posa in opera di infissi", coefficient: 0.86 },
    { code: "71.12.10", description: "Attività degli studi di ingegneria", coefficient: 0.78 },
];

// --- Definizione del tipo per le casse previdenziali ---
type PensionSchemeType = {
    name: string;
    rate: number;
    professional: boolean;
    fixed?: number;
    subjective?: boolean;
    minimum?: number;
    custom?: boolean;
};

// Dati delle casse previdenziali con il tipo applicato
const pensionSchemes: Record<string, PensionSchemeType> = {
    'gestione-separata-inps': { name: 'Gestione Separata INPS', rate: 0.2607, professional: true, fixed: 0 },
    'artigiani-commercianti-inps': { name: 'Artigiani e Commercianti INPS', rate: 0.24, fixed: 4515.43, professional: false },
    'inarcassa': { name: 'Inarcassa', rate: 0.145, subjective: true, minimum: 2475, professional: true },
    'cipag': { name: 'CIPAG (Geometri)', rate: 0.15, subjective: true, minimum: 3700, professional: true },
    'altre-casse-professionali': { name: 'Altre Casse Professionali', rate: 0, fixed: 0, professional: true, custom: true },
};

// Componente per il rendering del contenuto Markdown
const ContentRenderer = ({ content }: { content: string }) => (
    <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
);

export default function TasseRegimeForfettarioCalculator() {
    // --- STATI PRINCIPALI ---
    const [revenue, setRevenue] = useState<string>("");
    const [atecoCode, setAtecoCode] = useState<string>(atecoData[0].code);
    const [pensionScheme, setPensionScheme] = useState<string>('gestione-separata-inps');
    const [isNewActivity, setIsNewActivity] = useState<boolean>(true);
    const [isEmployeeOrPensioner, setIsEmployeeOrPensioner] = useState<boolean>(false);
    
    // Stati per casse personalizzate
    const [customPensionRate, setCustomPensionRate] = useState<string>("");
    const [customPensionFixed, setCustomPensionFixed] = useState<string>("");

    // Stato per la gestione dei risultati
    const [results, setResults] = useState<any>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // --- LOGICA DI CALCOLO ---
    const calculateTaxes = useCallback(() => {
        const parsedRevenue = parseFloat(revenue.replace(/,/g, ''));
        if (isNaN(parsedRevenue) || parsedRevenue <= 0) {
            setResults(null);
            return;
        }

        const selectedAteco = atecoData.find(a => a.code === atecoCode);
        if (!selectedAteco) return;

        const taxableIncome = parsedRevenue * selectedAteco.coefficient;
        
        let pensionContributions = 0;
        const selectedScheme = pensionSchemes[pensionScheme];
        
        // --- CORREZIONE: Controllo sulla chiave invece che sulla proprietà ---
        if (pensionScheme === 'altre-casse-professionali') {
            const rate = parseFloat(customPensionRate) / 100 || 0;
            const fixed = parseFloat(customPensionFixed) || 0;
            pensionContributions = (taxableIncome * rate) + fixed;
        } else if (pensionScheme === 'artigiani-commercianti-inps') {
            const minimalTaxable = 18415;
            const fixedContribution = selectedScheme.fixed || 0;
            const variablePart = taxableIncome > minimalTaxable ? (taxableIncome - minimalTaxable) * selectedScheme.rate : 0;
            pensionContributions = fixedContribution + variablePart;
        } else {
             pensionContributions = taxableIncome * selectedScheme.rate;
             // --- CORREZIONE: Controllo sull'esistenza della proprietà 'minimum' ---
             if (selectedScheme.minimum && pensionContributions < selectedScheme.minimum) {
                pensionContributions = selectedScheme.minimum;
             }
        }
       
        const deductibleContributions = pensionContributions;
        const netTaxableIncome = Math.max(0, taxableIncome - deductibleContributions);
        
        const taxRate = isNewActivity ? 0.05 : 0.15;
        const substituteTax = netTaxableIncome * taxRate;

        // Calcolo acconti
        const totalTaxAndContributions = substituteTax + pensionContributions;
        const advancePaymentPercentage = (isEmployeeOrPensioner) ? 0 : 1; 
        const firstAdvance = (totalTaxAndContributions * 0.5) * advancePaymentPercentage;
        const secondAdvance = (totalTaxAndContributions * 0.5) * advancePaymentPercentage;

        const totalDueFirstYear = substituteTax + pensionContributions + firstAdvance + secondAdvance;
        
        const netRevenue = parsedRevenue - totalDueFirstYear;
        const monthlyNet = netRevenue / 12;

        setResults({
            grossRevenue: parsedRevenue,
            profitabilityCoefficient: selectedAteco.coefficient,
            taxableIncome,
            pensionContributions,
            netTaxableIncome,
            taxRate,
            substituteTax,
            firstAdvance,
            secondAdvance,
            totalDueFirstYear,
            netRevenue,
            monthlyNet,
        });

        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

    }, [revenue, atecoCode, pensionScheme, isNewActivity, isEmployeeOrPensioner, customPensionRate, customPensionFixed]);

    const resetCalculator = () => {
        setRevenue("");
        setAtecoCode(atecoData[0].code);
        setPensionScheme('gestione-separata-inps');
        setIsNewActivity(true);
        setIsEmployeeOrPensioner(false);
        setCustomPensionRate("");
        setCustomPensionFixed("");
        setResults(null);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    };

    const pieData = useMemo(() => {
        if (!results) return [];
        return [
            { name: 'Guadagno Netto', value: results.netRevenue, color: '#22c55e' },
            { name: 'Imposta Sostitutiva', value: results.substituteTax, color: '#f97316' },
            { name: 'Contributi Previdenziali', value: results.pensionContributions, color: '#3b82f6' },
            { name: 'Acconti (Tasse e Contributi)', value: results.firstAdvance + results.secondAdvance, color: '#facc15' },
        ];
    }, [results]);

    const content = `
        <p>Il <strong>Regime Forfettario</strong> è un regime fiscale agevolato per le partite IVA individuali che rispettano determinati requisiti. Offre una tassazione semplificata con un'imposta sostitutiva e una gestione contabile più snella.</p>
        <h3 class="font-semibold text-gray-800 mt-4 mb-2">Punti Chiave:</h3>
        <ul class="list-disc pl-5 space-y-1">
            <li><strong>Imposta Sostitutiva:</strong> 15% (o 5% per i primi 5 anni in caso di nuova attività).</li>
            <li><strong>Coefficiente di Redditività:</strong> Una percentuale fissa applicata ai ricavi che determina il reddito imponibile. Varia in base al codice ATECO.</li>
            <li><strong>Contributi Previdenziali:</strong> Obbligatori e deducibili dal reddito imponibile.</li>
            <li><strong>Acconti:</strong> Per il primo anno, oltre al saldo, si devono versare gli acconti per l'anno successivo, calcolati sul reddito dell'anno in corso.</li>
        </ul>
        <p class="mt-4">Questo strumento ti aiuta a simulare il carico fiscale e contributivo per darti un'idea chiara del tuo netto annuale e mensile.</p>
    `;

    return (
        <div className="bg-gray-50 p-4 sm:p-6 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Colonna Sinistra: Input */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Calcolatore Tasse</h2>
                        <p className="text-sm text-gray-500 mb-6">Regime Forfettario 2024/2025</p>
                        
                        {/* Input Fatturato Lordo */}
                        <div className="mb-4">
                             <label htmlFor="revenue" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                Fatturato Lordo Annuo (€)
                                <Tooltip text="Inserisci i ricavi o compensi totali che prevedi di incassare in un anno, al lordo di tasse e contributi.">
                                    <InfoIcon />
                                </Tooltip>
                            </label>
                            <input 
                                type="text"
                                id="revenue"
                                value={revenue}
                                onChange={(e) => setRevenue(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
                                placeholder="Es: 45,000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>

                        {/* Select Codice ATECO */}
                        <div className="mb-4">
                             <label htmlFor="ateco" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                Codice ATECO
                                <Tooltip text="Il codice ATECO identifica la tua attività e determina il coefficiente di redditività, cioè la percentuale del tuo fatturato su cui pagherai tasse e contributi.">
                                    <InfoIcon />
                                </Tooltip>
                            </label>
                            <select
                                id="ateco"
                                value={atecoCode}
                                onChange={e => setAtecoCode(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white bg-no-repeat"
                                style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                            >
                                {atecoData.map(ateco => (
                                    <option key={ateco.code} value={ateco.code}>{ateco.code} - {ateco.description}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Select Cassa Previdenziale */}
                        <div className="mb-4">
                            <label htmlFor="pension" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                Cassa Previdenziale
                                <Tooltip text="Scegli il tuo ente previdenziale. La Gestione Separata INPS è comune per molti professionisti senza albo, mentre Artigiani e Commercianti hanno una gestione specifica. I professionisti iscritti a un albo (es. ingegneri, architetti) hanno una cassa dedicata.">
                                    <InfoIcon />
                                </Tooltip>
                            </label>
                            <select
                                id="pension"
                                value={pensionScheme}
                                onChange={e => setPensionScheme(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white"
                                style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                            >
                                {Object.entries(pensionSchemes).map(([key, value]) => (
                                    <option key={key} value={key}>{value.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Input per Cassa Personalizzata */}
                        {pensionScheme === 'altre-casse-professionali' && (
                             <div className="p-3 mb-4 bg-gray-100 rounded-md border border-gray-200">
                                <div className="mb-2">
                                    <label htmlFor="customRate" className="text-xs font-medium text-gray-600">Aliquota Contributiva (%)</label>
                                    <input type="text" id="customRate" value={customPensionRate} onChange={e => setCustomPensionRate(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Es: 14.5" className="w-full text-sm mt-1 px-2 py-1 border border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="customFixed" className="text-xs font-medium text-gray-600">Contributo Fisso/Minimo (€)</label>
                                    <input type="text" id="customFixed" value={customPensionFixed} onChange={e => setCustomPensionFixed(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Es: 2500" className="w-full text-sm mt-1 px-2 py-1 border border-gray-300 rounded-md"/>
                                </div>
                            </div>
                        )}
                        
                        {/* Checkbox */}
                        <div className="space-y-3">
                             <div className="flex items-center">
                                <input id="newActivity" type="checkbox" checked={isNewActivity} onChange={() => setIsNewActivity(!isNewActivity)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                                <label htmlFor="newActivity" className="ml-2 flex items-center text-sm text-gray-700">
                                    Nuova Attività (primi 5 anni)
                                    <Tooltip text="Se hai avviato una nuova Partita IVA e rispetti i requisiti, hai diritto a un'imposta sostitutiva ridotta al 5% per i primi 5 anni.">
                                        <InfoIcon />
                                    </Tooltip>
                                </label>
                            </div>
                             <div className="flex items-center">
                                <input id="employeePensioner" type="checkbox" checked={isEmployeeOrPensioner} onChange={() => setIsEmployeeOrPensioner(!isEmployeeOrPensioner)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                                <label htmlFor="employeePensioner" className="ml-2 flex items-center text-sm text-gray-700">
                                    Lavoratore Dipendente / Pensionato
                                     <Tooltip text="Se sei un lavoratore dipendente (a tempo indeterminato) o un pensionato, potresti non dover versare gli acconti delle imposte. Seleziona questa casella per escluderli dal calcolo del totale dovuto.">
                                        <InfoIcon />
                                    </Tooltip>
                                </label>
                            </div>
                        </div>

                        {/* Bottoni */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <button onClick={calculateTaxes} className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Calcola</button>
                            <button onClick={resetCalculator} className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">Reset</button>
                        </div>
                    </div>
                </div>

                {/* Colonna Destra: Risultati e Info */}
                <div className="lg:col-span-2 space-y-6">
                    {results ? (
                        <div ref={resultsRef} className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Risultati della Simulazione</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Dettaglio Calcolo */}
                                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Riepilogo Fiscale</h3>
                                    {[
                                        { label: "Fatturato Lordo", value: formatCurrency(results.grossRevenue) },
                                        { label: "Coefficiente di Redditività", value: `${results.profitabilityCoefficient * 100}%` },
                                        { label: "Reddito Imponibile Lordo", value: formatCurrency(results.taxableIncome) },
                                        { label: "Contributi Previdenziali", value: formatCurrency(results.pensionContributions), isDeductible: true },
                                        { label: "Reddito Imponibile Netto", value: formatCurrency(results.netTaxableIncome) },
                                        { label: "Aliquota d'imposta", value: `${results.taxRate * 100}%` },
                                        { label: "Imposta Sostitutiva (Saldo)", value: formatCurrency(results.substituteTax), isTax: true },
                                        { label: "1° Acconto (Giugno/Luglio)", value: formatCurrency(results.firstAdvance) },
                                        { label: "2° Acconto (Novembre)", value: formatCurrency(results.secondAdvance) },
                                    ].map(item => (
                                        <div key={item.label} className={`flex justify-between items-center text-sm ${item.isTax ? 'font-bold' : ''}`}>
                                            <span className="text-gray-600">{item.label}</span>
                                            <span className={`font-medium ${item.isDeductible ? 'text-red-600' : 'text-gray-800'}`}>{item.isDeductible ? `-${item.value}` : item.value}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between items-center font-bold text-base">
                                            <span className="text-indigo-700">Totale da versare (1° anno)</span>
                                            <span className="text-indigo-700">{formatCurrency(results.totalDueFirstYear)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Include saldo imposte, saldo contributi e acconti per l'anno successivo.</p>
                                    </div>
                                </div>
                                {/* Grafico e Netto */}
                                <div className="flex flex-col justify-between">
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                                    return percent > 0.05 ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px">{(percent * 100).toFixed(0)}%</text> : null;
                                                }}>
                                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend iconType="circle" iconSize={10}/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 p-4 text-center bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-sm text-green-800">Guadagno Netto Annuo Stimato</p>
                                        <p className="text-3xl font-bold text-green-700 my-1">{formatCurrency(results.netRevenue)}</p>
                                        <p className="text-lg text-green-600">({formatCurrency(results.monthlyNet)} / mese)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-lg h-full text-center">
                            <svg className="w-16 h-16 text-indigo-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            <h3 className="text-lg font-semibold text-gray-700">I tuoi risultati appariranno qui</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm">Compila i campi a sinistra per avviare una simulazione e scoprire il tuo potenziale guadagno netto.</p>
                        </div>
                    )}

                    {/* Guida e Fonti */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                         <h3 className="text-xl font-bold text-gray-800 mb-3">Guida al Regime Forfettario</h3>
                         <ContentRenderer content={content} />
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-lg">
                         <h3 className="text-xl font-bold text-gray-800 mb-3">Fonti e Riferimenti Normativi</h3>
                         <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/ivaimpcom/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-tematiche.contributi-dovuti-da-artigiani-e-commercianti.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Contributi Artigiani e Commercianti</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2014-12-23;190" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge n. 190/2014 (Legge di Stabilità 2015), art. 1, commi 54-89</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

