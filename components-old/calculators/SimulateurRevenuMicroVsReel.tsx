'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

// --- SEO Metadata ---
export const meta = {
    title: "Simulateur de Revenu : Micro-entreprise vs. Régime Réel",
    description: "Comparez votre revenu net en tant qu'indépendant entre le régime micro-entreprise et le régime réel. Optimisez votre fiscalité et vos charges sociales."
};

// --- Helper Functions ---
const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

// --- Corrected Lazy Loading for Chart Component ---
// We create a single dynamic component that wraps the entire chart logic.
const DynamicChart = dynamic(() =>
    import('recharts').then(mod => {
        const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
        
        // This wrapper component receives the chart data as props
        const ChartWrapper = ({ data }: { data: any[] }) => (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis 
                        stroke="#6b7280" 
                        fontSize={12} 
                        tickFormatter={(value) => `${Math.round(value / 1000)}k€`} 
                    />
                    <ChartTooltip 
                        formatter={(value: number, name: string) => [formatCurrency(value), name.replace('_', ' ')]}
                        cursor={{fill: 'rgba(243, 244, 246, 0.5)'}}
                    />
                    <Legend formatter={(value) => value.replace('_', ' ')} wrapperStyle={{fontSize: "12px"}} />
                    <Bar dataKey="Revenu_Net" name="Revenu Net" stackId="a" fill="#22c55e" />
                    <Bar dataKey="Cotisations" name="Cotisations" stackId="a" fill="#f97316" />
                    <Bar dataKey="Impot" name="Impôt" stackId="a" fill="#ef4444" />
                </BarChart>
            </ResponsiveContainer>
        );
        return ChartWrapper;
    }),
    {
        ssr: false,
        loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Chargement du graphique...</p></div>,
    }
);


// --- Helper Components & Types ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div>
    </div>
);

const SchemaInjector = ({ schema }: { schema: object }) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                if (trimmedBlock) return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Calculator Data (Self-Contained) ---
const calculatorData = { "slug": "simulateur-revenu-micro-vs-reel", "category": "Fiscalité et travail indépendant", "title": "Simulateur de Revenu: Micro-entrepreneur vs. Régime Réel", "lang": "fr", "inputs": [{ "id": "chiffreAffaires", "label": "Chiffre d'affaires annuel HT", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Indiquez le total de vos revenus bruts annuels hors taxes que vous prévoyez de facturer à vos clients." }, { "id": "chargesReelles", "label": "Charges professionnelles annuelles", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Estimez le total de vos dépenses annuelles déductibles : achats de matériel, logiciels, loyer, assurances, etc. Uniquement pertinent pour le régime réel." }, { "id": "typeActivite", "label": "Nature de l'activité", "type": "select", "options": [{ "value": "vente", "label": "Vente de marchandises (BIC)" }, { "value": "services_bic", "label": "Prestations de services commerciales (BIC)" }, { "value": "liberal_bnc", "label": "Activités libérales (BNC)" }], "tooltip": "Le taux d'abattement forfaitaire en micro-entreprise dépend de votre type d'activité. Ce choix est crucial pour la simulation." }], "outputs": [{ "id": "revenuNetMicro", "label": "Revenu Net (Micro-entreprise)", "unit": "€" }, { "id": "revenuNetReel", "label": "Revenu Net (Régime Réel)", "unit": "€" }, { "id": "regimePlusAvantageux", "label": "Régime le plus avantageux", "unit": "" }, { "id": "economieRealisee", "label": "Économie potentielle", "unit": "€" }], "examples": [{ "inputs": { "chiffreAffaires": 70000, "chargesReelles": 18000, "typeActivite": "liberal_bnc" } }], "content": "### **Guide Complet : Choisir entre Micro-entreprise et Régime Réel**\n\n**Optimisez votre revenu d'indépendant en comprenant la fiscalité qui vous correspond.**\n\nLe choix du régime fiscal est l'une des décisions les plus importantes pour un travailleur indépendant en France. Il a un impact direct sur vos cotisations sociales, vos impôts et, in fine, sur votre revenu net. Ce simulateur est conçu pour vous aider à comparer de manière chiffrée le régime de la micro-entreprise et le régime réel simplifié d'imposition.\n\n**Avertissement** : Ce simulateur fournit une estimation à but informatif. Les calculs sont basés sur des taux standards et ne peuvent remplacer les conseils personnalisés d'un expert-comptable, qui prendra en compte toutes les spécificités de votre situation (ACRE, versement libératoire, situation familiale, etc.).\n\n### **Partie 1 : Comprendre les Deux Régimes**\n\n#### **Le Régime de la Micro-entreprise**\n\nLe régime micro-social et micro-fiscal (souvent appelé \"auto-entrepreneur\") est un régime ultra-simplifié. Sa principale caractéristique est le **calcul forfaitaire des charges**.\n\n* **Principe** : Vous ne déduisez pas vos dépenses professionnelles réelles. À la place, l'administration fiscale applique un **abattement forfaitaire** sur votre chiffre d'affaires (CA) pour estimer votre bénéfice imposable.\n* **Abattement** : Le taux dépend de votre activité :\n  * **71%** pour la vente de marchandises (BIC).\n  * **50%** pour les prestations de services commerciales (BIC).\n  * **34%** pour les activités libérales et prestations de services (BNC).\n* **Cotisations Sociales** : Elles sont calculées en appliquant un taux fixe directement sur votre chiffre d'affaires encaissé.\n* **Pour qui ?** Idéal pour les indépendants qui ont **peu de frais professionnels**. Si vos charges réelles sont inférieures à l'abattement forfaitaire, ce régime est souvent plus avantageux.\n\n#### **Le Régime Réel Simplifié (Entreprise Individuelle)**\n\nLe régime réel (ici, le régime simplifié d'imposition pour une Entreprise Individuelle) est basé, comme son nom l'indique, sur votre **résultat réel**.\n\n* **Principe** : Vous déduisez l'intégralité de vos charges professionnelles de votre chiffre d'affaires pour déterminer votre bénéfice.\n* **Bénéfice** = Chiffre d'Affaires - Charges Réelles Déductibles.\n* **Cotisations Sociales et Impôt** : Ils sont calculés sur la base de ce **bénéfice réel**. \n* **Pour qui ?** Indispensable pour les activités avec des **frais importants** (achats de matières premières, matériel coûteux, location de locaux, etc.). Si vos charges dépassent le pourcentage de l'abattement forfaitaire, le régime réel devient mathématiquement plus intéressant.\n\n### **Partie 2 : Utilisation du Simulateur**\n\nPour obtenir une comparaison pertinente, veuillez renseigner les champs suivants :\n\n1.  **Chiffre d'affaires annuel HT** : Le montant total que vous prévoyez de facturer sur une année.\n2.  **Charges professionnelles annuelles** : La somme de toutes vos dépenses liées à votre activité (ne pas inclure les cotisations sociales, elles sont calculées par le simulateur).\n3.  **Nature de l'activité** : Ce choix est crucial car il détermine le taux de l'abattement en micro-entreprise et les taux de cotisations.\n\n### **Partie 3 : Interprétation des Résultats**\n\nLe simulateur vous présente :\n\n* **Revenu Net (pour chaque régime)** : C'est ce qu'il vous reste réellement en poche après avoir payé les cotisations sociales et l'impôt sur le revenu.\n* **Régime le plus avantageux** : Le régime qui vous laisse le revenu net le plus élevé sur la base de vos informations.\n* **Économie potentielle** : La différence de revenu net annuel entre les deux options.\n\nLe graphique comparatif vous permet de visualiser la répartition de votre chiffre d'affaires entre le revenu net, les cotisations sociales et l'impôt pour chaque régime, facilitant ainsi la compréhension de la structure de vos prélèvements.\n\n### **Conclusion : Quand faut-il basculer ?**\n\nLe point de bascule dépend de votre taux de charges. Calculez le ratio `(Charges Réelles / Chiffre d'Affaires)`. Si ce ratio est supérieur au taux d'abattement de votre activité (71%, 50% ou 34%), le régime réel est presque certainement plus avantageux. N'oubliez pas que le régime réel implique des obligations comptables plus complexes (bilan, compte de résultat). Pesez donc le gain financier face à la charge administrative supplémentaire ou au coût d'un expert-comptable.", "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "Quand le régime réel est-il plus intéressant que la micro-entreprise ?", "acceptedAnswer": { "@type": "Answer", "text": "Le régime réel devient plus intéressant lorsque le montant de vos charges professionnelles réelles dépasse l'abattement forfaitaire accordé en micro-entreprise. Par exemple, pour une activité libérale (34% d'abattement), si vos charges dépassent 34% de votre chiffre d'affaires, le régime réel est généralement plus avantageux car il permet de déduire la totalité des frais et de réduire la base de calcul des impôts et cotisations." } }, { "@type": "Question", "name": "Quelles sont les charges déductibles au régime réel ?", "acceptedAnswer": { "@type": "Answer", "text": "Au régime réel, la plupart des dépenses engagées dans l'intérêt de l'entreprise sont déductibles. Cela inclut les achats de matériel et de fournitures, les frais de location d'un bureau, les abonnements logiciels, les frais de déplacement, les assurances professionnelles, les frais de comptabilité, et les cotisations sociales elles-mêmes." } }, { "@type": "Question", "name": "Comment sont calculées les cotisations sociales en micro-entreprise ?", "acceptedAnswer": { "@type": "Answer", "text": "En micro-entreprise, les cotisations sociales sont calculées en appliquant un pourcentage fixe directement sur le chiffre d'affaires encaissé. Ce taux varie selon la nature de l'activité : environ 12,3% pour la vente de marchandises, 21,2% pour les prestations de services commerciales et 21,1% pour les activités libérales (taux de 2024 hors ACRE et options spécifiques)." } }] } };

// --- Main Calculator Component ---
const SimulateurRevenuMicroVsReel: React.FC = () => {
    const { slug, title, inputs, outputs, content, examples, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const [state, setState] = useState(examples[0].inputs);

    const handleStateChange = (id: string, value: any) => {
        setState(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setState(examples[0].inputs);

    const calculateImpotProgressif = useCallback((revenu: number) => {
        if (revenu <= 0) return 0;
        // Barème 2025 sur revenus 2024
        const brackets = [
            { limit: 11294, rate: 0 },
            { limit: 28797, rate: 0.11 },
            { limit: 82341, rate: 0.30 },
            { limit: 177106, rate: 0.41 },
            { limit: Infinity, rate: 0.45 }
        ];
        let impot = 0;
        let previousLimit = 0;
        for (const bracket of brackets) {
            if (revenu > previousLimit) {
                const taxableInBracket = Math.min(revenu, bracket.limit) - previousLimit;
                impot += taxableInBracket * bracket.rate;
            }
            previousLimit = bracket.limit;
        }
        return impot;
    }, []);

    const calculatedOutputs = useMemo(() => {
        const { chiffreAffaires, chargesReelles, typeActivite } = state;
        const ca = Number(chiffreAffaires) || 0;
        const charges = Number(chargesReelles) || 0;

        // Micro-entreprise
        const abattementTaux = typeActivite === 'vente' ? 0.71 : (typeActivite === 'services_bic' ? 0.50 : 0.34);
        const cotisationsTauxMicro = typeActivite === 'vente' ? 0.123 : (typeActivite === 'services_bic' ? 0.212 : 0.211);
        const baseImposableMicro = ca * (1 - abattementTaux);
        const cotisationsSocialesMicro = ca * cotisationsTauxMicro;
        const impotMicro = calculateImpotProgressif(baseImposableMicro);
        const revenuNetMicro = ca - cotisationsSocialesMicro - impotMicro;

        // Régime Réel
        const beneficeReel = Math.max(0, ca - charges);
        const cotisationsSocialesReel = beneficeReel * 0.44; // Approximation des cotisations TNS
        const impotReel = calculateImpotProgressif(beneficeReel);
        const revenuNetReel = beneficeReel - cotisationsSocialesReel - impotReel;

        const regimePlusAvantageux = revenuNetMicro > revenuNetReel ? 'Micro-entreprise' : 'Régime Réel';
        const economieRealisee = Math.abs(revenuNetMicro - revenuNetReel);

        return { revenuNetMicro, revenuNetReel, regimePlusAvantageux, economieRealisee, cotisationsSocialesMicro, impotMicro, cotisationsSocialesReel, impotReel };
    }, [state, calculateImpotProgressif]);

    const chartData = [
        { name: 'Micro', "Revenu_Net": calculatedOutputs.revenuNetMicro, "Cotisations": calculatedOutputs.cotisationsSocialesMicro, "Impot": calculatedOutputs.impotMicro },
        { name: 'Réel', "Revenu_Net": calculatedOutputs.revenuNetReel, "Cotisations": calculatedOutputs.cotisationsSocialesReel, "Impot": calculatedOutputs.impotReel },
    ];

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = (await import('jspdf'));
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2, backgroundColor: '#f8fafc' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) {
            alert("Erreur lors de l'export PDF.");
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, inputs: state, outputs: { revenuNetMicro: calculatedOutputs.revenuNetMicro, revenuNetReel: calculatedOutputs.revenuNetReel }, timestamp: new Date().toISOString() };
            const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
            localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
            alert('Résultat sauvegardé !');
        } catch { alert('Sauvegarde impossible.'); }
    }, [state, calculatedOutputs, slug]);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-slate-50 font-sans">
                <div className="lg:col-span-3">
                    <div ref={calculatorRef} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
                        <p className="text-gray-600 mb-6">Estimez votre revenu net et choisissez le régime fiscal le plus adapté à votre activité.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {inputs.map(input => (
                                <div key={input.id} className={input.type === 'select' ? 'sm:col-span-2' : ''}>
                                    <label htmlFor={input.id} className="flex items-center text-sm font-medium text-gray-700 mb-2">{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                    {input.type === 'number' && <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">{input.unit}</span></div><input type="number" id={input.id} className="block w-full rounded-md border-gray-300 pl-8 pr-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={state[input.id as keyof typeof state]} onChange={e => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} min={input.min} step={input.step} placeholder="0" /></div>}
                                    {input.type === 'select' && <select id={input.id} className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={state[input.id as keyof typeof state]} onChange={e => handleStateChange(input.id, e.target.value)}>{(input.options || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t">
                             <h2 className="text-2xl font-semibold text-gray-800 mb-4">Résultats de la Simulation</h2>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {outputs.map(output => {
                                    const value = (calculatedOutputs as any)[output.id];
                                    const isAdvantage = output.id === 'regimePlusAvantageux';
                                    const isSaving = output.id === 'economieRealisee';
                                    const isNet = output.id.startsWith('revenuNet');
                                    return (
                                    <div key={output.id} className={`p-4 rounded-lg ${isAdvantage ? 'bg-indigo-100 text-indigo-800 sm:col-span-2 lg:col-span-4 text-center' : (isSaving ? 'bg-green-100 text-green-800' : 'bg-slate-100')} ${isNet ? 'sm:col-span-1 lg:col-span-2' : ''}`}>
                                        <div className="text-sm font-medium opacity-80">{output.label}</div>
                                        <div className={`text-2xl font-bold ${isAdvantage ? 'mt-1' : ''}`}>
                                            {isClient ? (output.unit === '€' ? formatCurrency(value) : value) : '...'}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Répartition du Chiffre d'Affaires</h3>
                            <div className="h-80 w-full rounded-lg">
                                <DynamicChart data={chartData} />
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-2 space-y-6">
                    <section className="border rounded-xl p-4 bg-white shadow-lg">
                        <h2 className="font-semibold text-lg mb-3 text-gray-800">Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3"><button onClick={handleSaveResult} className="w-full text-center rounded-lg px-4 py-2 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Sauvegarder</button><button onClick={handleExportPDF} className="w-full text-center rounded-lg px-4 py-2 bg-gray-700 text-white font-semibold hover:bg-gray-800 transition-colors">Exporter PDF</button><button onClick={handleReset} className="w-full text-center rounded-lg px-4 py-2 bg-white text-red-600 font-semibold border border-red-300 hover:bg-red-50 transition-colors">Réinitialiser</button></div>
                    </section>
                    <section className="border rounded-xl p-6 bg-white shadow-lg">
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-xl p-6 bg-white shadow-lg">
                        <h2 className="font-bold text-xl mb-3 text-gray-900">Sources et Références Officielles</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://entreprendre.service-public.fr/vosdroits/F23267" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Service-Public.fr : Le régime micro-entreprise</a></li>
                            <li><a href="https://www.urssaf.fr/portail/home/independant/je-cree-mon-entreprise/les-regimes-fiscaux/le-regime-de-la-micro-entreprise.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">URSSAF : Le régime de la micro-entreprise</a></li>
                            <li><a href="https://www.impots.gouv.fr/professionnel/le-regime-reel-dimposition" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Impots.gouv.fr : Le régime réel d'imposition</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default SimulateurRevenuMicroVsReel;