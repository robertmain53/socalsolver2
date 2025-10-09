'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

// --- Données de configuration du calculateur (directement intégrées) ---
const calculatorData = {
  "slug": "calculateur-versement-liberatoire",
  "category": "Fiscalité et travail indépendant",
  "title": "Calculateur du Versement Libératoire de l'impôt pour micro-entrepreneur",
  "lang": "fr",
  "inputs": [
    { "id": "chiffreAffairesAnnuel", "label": "Chiffre d'affaires (CA) annuel", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Indiquez le montant total de vos recettes brutes annuelles, avant tout abattement ou déduction." },
    { "id": "typeActivite", "label": "Nature de votre activité principale", "type": "select" as const, "options": [ { "label": "Vente de marchandises (BIC)", "value": "vente" }, { "label": "Prestations de services commerciales/artisanales (BIC)", "value": "bic" }, { "label": "Activités libérales et prestations de services (BNC)", "value": "bnc" } ], "tooltip": "Le taux du versement libératoire et l'abattement du régime classique dépendent de cette catégorie." },
    { "id": "revenuFiscalReferenceN2", "label": "Revenu Fiscal de Référence (RFR) de l'année N-2", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Pour une option en 2025, utilisez le RFR indiqué sur votre avis d'imposition 2024 (concernant vos revenus de 2023). C'est le critère clé pour l'éligibilité." },
    { "id": "partsQuotientFamilial", "label": "Nombre de parts de votre foyer fiscal", "type": "number" as const, "unit": "parts", "min": 1, "step": 0.5, "tooltip": "Ex: 1 pour un célibataire, 2 pour un couple marié/pacsé, +0.5 par enfant (généralement)." },
    { "id": "autresRevenusFoyer", "label": "Autres revenus nets imposables du foyer", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Salaires, revenus fonciers, etc. de toutes les personnes du foyer fiscal. Crucial pour calculer l'impôt en régime classique." },
    { "id": "marieOuPacse", "label": "Êtes-vous marié(e) ou pacsé(e) ?", "type": "boolean" as const, "tooltip": "Cochez cette case si vous déclarez vos revenus en couple. Cela influe sur le calcul de la décote pour le régime classique." }
  ],
  "outputs": [
    { "id": "decisionFinale", "label": "Option la plus avantageuse", "unit": "" },
    { "id": "economieRealisee", "label": "Économie annuelle estimée", "unit": "€" },
    { "id": "montantVersementLiberatoire", "label": "Impôt total avec le Versement Libératoire", "unit": "€" },
    { "id": "montantImpotRegimeClassique", "label": "Impôt total avec le Régime Classique", "unit": "€" }
  ],
  "content": "### **Guide Complet sur le Versement Libératoire de l'Impôt**\n\n#### **Comprendre, Calculer et Choisir la Meilleure Option Fiscale pour votre Micro-Entreprise**\n\nLe statut de micro-entrepreneur (anciennement auto-entrepreneur) offre une gestion simplifiée, notamment sur le plan fiscal. L'une des options les plus importantes à considérer est le **versement forfaitaire libératoire (VFL)**. Ce mécanisme permet de payer son impôt sur le revenu en même temps que ses cotisations sociales, à un taux fixe appliqué sur le chiffre d'affaires.\n\nMais est-ce toujours le bon choix ? Ce simulateur est conçu pour vous aider à prendre une décision éclairée en comparant précisément le coût du versement libératoire à celui du régime micro-fiscal classique (imposition au barème progressif après abattement). L'objectif est de vous donner une vision claire et chiffrée de l'option la plus avantageuse selon votre situation personnelle.\n\n### **Partie 1 : Le Versement Libératoire (VFL) - Comment ça marche ?**\n\nLe principe est simple : chaque mois ou chaque trimestre, lorsque vous déclarez votre chiffre d'affaires (CA) à l'URSSAF, un pourcentage fixe est prélevé au titre de l'impôt sur le revenu. Ce paiement est **libératoire**, ce qui signifie que le revenu de votre micro-entreprise est définitivement imposé. Il n'aura pas à être reporté dans votre déclaration de revenus annuelle (même si le CA, lui, doit y être déclaré pour le calcul de votre RFR).\n\n#### **Les Taux du Versement Libératoire**\n\nLes taux varient selon la nature de votre activité :\n\n* **1,0 %** pour les activités de vente de marchandises, de denrées à emporter ou à consommer sur place, ou de fourniture de logement (BIC).\n* **1,7 %** pour les prestations de services commerciales ou artisanales (BIC).\n* **2,2 %** pour les activités libérales et prestations de services (BNC).\n\n#### **Les Conditions d'Éligibilité : Le Revenu Fiscal de Référence (RFR)**\n\nL'accès au VFL n'est pas automatique. Il faut remplir une condition de revenus. Pour pouvoir opter pour le VFL en **année N**, votre Revenu Fiscal de Référence (RFR) de l'**année N-2** ne doit pas dépasser un certain plafond par part de quotient familial.\n\nPour une option en **2025**, le RFR de **2023** (figurant sur votre avis d'imposition 2024) ne doit pas excéder **27 478 € par part**.\n\n*Exemple : Un couple (2 parts) avec un enfant (0.5 part), soit 2.5 parts, doit avoir un RFR 2023 inférieur à 2.5 * 27 478 € = 68 695 € pour être éligible au VFL en 2025.*\n\n### **Partie 2 : Le Régime Micro-Fiscal Classique**\n\nSi vous n'optez pas pour le VFL (ou n'êtes pas éligible), vous relevez du régime micro-fiscal par défaut. Son fonctionnement est le suivant :\n\n1.  **Abattement Forfaitaire** : L'administration fiscale applique un abattement sur votre chiffre d'affaires pour frais professionnels. Cet abattement est de :\n    * **71 %** pour les activités de vente (BIC).\n    * **50 %** pour les prestations de services (BIC).\n    * **34 %** pour les activités libérales (BNC).\n    *L'abattement minimum est de 305 €.*\n\n2.  **Intégration aux Revenus du Foyer** : Le montant de votre CA **après abattement** est ajouté aux autres revenus de votre foyer fiscal (salaires, etc.).\n\n3.  **Imposition au Barème Progressif** : Le total de ces revenus est ensuite soumis au barème progressif de l'impôt sur le revenu (avec ses différentes tranches à 0%, 11%, 30%, 41% et 45%).\n\n### **Partie 3 : VFL ou Régime Classique : La Stratégie à Adopter**\n\nAlors, comment choisir ? Voici les règles générales :\n\n#### **Le Versement Libératoire est probablement plus avantageux si :**\n\n* **Vous êtes déjà imposé(e) dans des tranches élevées (30% et plus)** en raison d'autres revenus dans votre foyer (salaires élevés, revenus fonciers importants...). Le taux fixe du VFL (1% à 2.2%) sera bien plus faible que votre Taux Marginal d'Imposition (TMI).\n* Vous préférez la **simplicité et la visibilité**, en payant votre impôt au fur et à mesure sans grosse régularisation l'année suivante.\n\n#### **Le Régime Classique est probablement plus avantageux si :**\n\n* **Vous n'êtes pas imposable**. Si le total de vos revenus (après abattement) vous place dans la tranche à 0%, vous ne paierez aucun impôt avec le régime classique, alors que vous en paieriez avec le VFL.\n* Votre Taux Marginal d'Imposition (TMI) est dans la **tranche de 11%**. Le calcul est alors plus fin. Le VFL peut rester plus intéressant si votre CA est important, mais souvent, le régime classique avec abattement est plus favorable.\n\n**Ce simulateur fait ce calcul complexe pour vous et vous donne la réponse exacte pour votre situation.**\n\n### **Partie 4 : En Pratique**\n\n* **Comment opter ?** La demande doit être faite auprès de l'URSSAF. Pour une création d'activité, l'option se fait au moment de la déclaration. Pour une activité existante, elle doit être formulée au plus tard le 30 septembre de l'année N pour une application en N+1.\n* **Attention** : L'option pour le VFL est une décision importante. Ce simulateur est un outil d'aide à la décision fiable, mais ne remplace pas une analyse complète de votre situation par un professionnel.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Qu'est-ce que le versement libératoire pour un micro-entrepreneur ?", "acceptedAnswer": { "@type": "Answer", "text": "Le versement libératoire est une option fiscale permettant au micro-entrepreneur de payer son impôt sur le revenu en même temps que ses cotisations sociales. Un pourcentage fixe est appliqué directement sur le chiffre d'affaires encaissé. Ce paiement est 'libératoire', c'est-à-dire qu'il solde l'impôt dû pour les revenus de l'activité." } }, { "@type": "Question", "name": "Qui peut opter pour le versement libératoire ?", "acceptedAnswer": { "@type": "Answer", "text": "Pour opter pour le versement libératoire en année N, le revenu fiscal de référence (RFR) de l'année N-2 du foyer fiscal ne doit pas dépasser un certain seuil par part de quotient familial. Pour 2025, le RFR de 2023 doit être inférieur à 27 478 € par part." } }, { "@type": "Question", "name": "Quel est le taux du versement libératoire ?", "acceptedAnswer": { "@type": "Answer", "text": "Le taux dépend de la nature de l'activité : 1,0% pour la vente de marchandises (BIC), 1,7% pour les prestations de services commerciales et artisanales (BIC), et 2,2% pour les activités libérales et autres prestations de services (BNC)." } }, { "@type": "Question", "name": "Versement libératoire ou régime classique : que choisir ?", "acceptedAnswer": { "@type": "Answer", "text": "Le versement libératoire est généralement avantageux si votre foyer fiscal a des revenus importants qui vous placent dans les tranches d'imposition élevées (30% ou plus). Le régime classique est souvent préférable si vous n'êtes pas imposable ou si votre taux marginal d'imposition est de 11%. Ce simulateur permet de comparer précisément les deux options." } } ] }
};

// --- Lazy Loading du composant de graphique ---
const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
  const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend, Cell } = mod;
  return (props: any) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={props.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={props.tickFormatter} tick={{ fontSize: 12 }} />
        <ChartTooltip formatter={props.formatter} />
        <Legend wrapperStyle={{ fontSize: "14px" }} />
        <Bar dataKey="montant" name="Montant de l'impôt">
           {props.data.map((entry: any, index: number) => (
             <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#10b981'} />
           ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Chargement du graphique...</div>
});

// --- Composants utilitaires ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);

// --- Renderer pour le contenu Markdown-like ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                if (trimmedBlock.match(/^\d\.\s/)) return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />)}</ol>;
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Composant Principal du Calculateur ---
const CalculateurVersementLiberatoire: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        chiffreAffairesAnnuel: 35000,
        typeActivite: 'bnc',
        revenuFiscalReferenceN2: 26000,
        partsQuotientFamilial: 1,
        autresRevenusFoyer: 0,
        marieOuPacse: false
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { chiffreAffairesAnnuel, typeActivite, revenuFiscalReferenceN2, partsQuotientFamilial, autresRevenusFoyer, marieOuPacse } = states;
        
        // --- Éligibilité ---
        const seuilRFRParPart = 27478;
        const isEligible = (revenuFiscalReferenceN2 / partsQuotientFamilial) <= seuilRFRParPart;

        // --- Calcul Versement Libératoire ---
        const tauxVL = typeActivite === 'vente' ? 0.01 : (typeActivite === 'bic' ? 0.017 : 0.022);
        const montantVersementLiberatoire = isEligible ? chiffreAffairesAnnuel * tauxVL : Infinity;

        // --- Calcul Régime Classique ---
        const tauxAbattement = typeActivite === 'vente' ? 0.71 : (typeActivite === 'bic' ? 0.50 : 0.34);
        const montantAbattement = Math.max(chiffreAffairesAnnuel * tauxAbattement, 305);
        const revenuImposableMicro = chiffreAffairesAnnuel > 0 ? chiffreAffairesAnnuel - montantAbattement : 0;
        const revenuTotalImposable = (revenuImposableMicro > 0 ? revenuImposableMicro : 0) + autresRevenusFoyer;
        
        const revenuParPart = revenuTotalImposable / partsQuotientFamilial;
        let impotParPart = 0;
        if (revenuParPart > 177106) impotParPart = 51934.34 + (revenuParPart - 177106) * 0.45;
        else if (revenuParPart > 82341) impotParPart = 19868.54 + (revenuParPart - 82341) * 0.41;
        else if (revenuParPart > 28797) impotParPart = 1925.33 + (revenuParPart - 28797) * 0.30;
        else if (revenuParPart > 11294) impotParPart = (revenuParPart - 11294) * 0.11;

        const impotBrut = impotParPart * partsQuotientFamilial;

        let montantImpotRegimeClassique = impotBrut;
        const seuilDecote = marieOuPacse ? 3191 : 1929;
        const baseDecote = marieOuPacse ? 1444 : 873;
        if (impotBrut <= seuilDecote) {
            const decote = baseDecote - 0.4525 * impotBrut;
            montantImpotRegimeClassique = Math.max(0, impotBrut - decote);
        }

        // --- Comparaison ---
        const economieRealisee = Math.abs(montantImpotRegimeClassique - montantVersementLiberatoire);
        let decisionFinale = "Analyse en cours...";
        if (!isEligible) {
            decisionFinale = "Régime Classique (non éligible au VFL)";
        } else if (montantVersementLiberatoire < montantImpotRegimeClassique) {
            decisionFinale = "Versement Libératoire";
        } else {
            decisionFinale = "Régime Classique";
        }

        return {
            decisionFinale,
            economieRealisee,
            montantVersementLiberatoire,
            montantImpotRegimeClassique,
            isEligible
        };
    }, [states]);

    const chartData = [
        { name: 'Versement Libératoire', montant: calculatedOutputs.isEligible ? calculatedOutputs.montantVersementLiberatoire : 0 },
        { name: 'Régime Classique', montant: calculatedOutputs.montantImpotRegimeClassique },
    ];
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = (await import("jspdf"));
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) { console.error(e); alert("Erreur lors de la génération du PDF."); }
    }, [slug]);

    const saveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const results = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...results].slice(0, 20)));
            alert("Résultat sauvegardé !");
        } catch { alert("Sauvegarde impossible."); }
    }, [states, calculatedOutputs, slug, title]);
    
    const getDecisionStyles = () => {
        if (!calculatedOutputs.isEligible) return 'bg-yellow-50 border-yellow-400 text-yellow-800';
        if (calculatedOutputs.decisionFinale === 'Versement Libératoire') return 'bg-indigo-50 border-indigo-500 text-indigo-800';
        return 'bg-emerald-50 border-emerald-500 text-emerald-800';
    };

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                        <p className="text-gray-600 mb-6">Comparez le versement libératoire et le régime classique pour optimiser votre impôt.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {inputs.map(input => {
                                const inputLabel = (<label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>);
                                if (input.type === 'boolean') return (<div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-gray-50 border"><input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} /><label className="text-sm font-medium text-gray-800" htmlFor={input.id}>{input.label}</label></div>);
                                if (input.type === 'select') return (<div key={input.id}>{inputLabel}<select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white">{input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>);
                                return (<div key={input.id}>{inputLabel}<div className="flex items-center"><input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" /><span className="ml-2 text-sm text-gray-500">{input.unit}</span></div></div>);
                            })}
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultats de la simulation</h2>
                            {!calculatedOutputs.isEligible && <div className="text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-md p-3 mb-4"><strong>Non éligible au Versement Libératoire :</strong> Votre RFR par part dépasse le seuil. Seul le régime classique s'applique.</div>}
                            <div className="space-y-3">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'decisionFinale' ? getDecisionStyles() : 'bg-gray-50 border-gray-300'}`}>
                                        <div className={`text-base font-medium ${output.id === 'decisionFinale' ? '' : 'text-gray-700'}`}>{output.label}</div>
                                        <div className={`text-2xl font-bold ${output.id === 'decisionFinale' ? '' : 'text-gray-900'}`}>
                                           {isClient ? (output.unit === '€' ? (calculatedOutputs as any)[output.id] === Infinity ? 'N/A' : formatCurrency((calculatedOutputs as any)[output.id]) : (calculatedOutputs as any)[output.id]) : '...'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualisation comparative</h3>
                            <div className="h-72 w-full p-2 rounded-lg bg-slate-50">
                               {isClient && <DynamicBarChart data={chartData} tickFormatter={(value: number) => `€${value/1000}k`} formatter={(value: number) => formatCurrency(value)} />}
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-2 space-y-6">
                    <section className="border rounded-xl p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Outils & Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button onClick={saveResult} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Sauvegarder</button>
                            <button onClick={handleExportPDF} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exporter PDF</button>
                            <button onClick={handleReset} className="w-full text-sm font-medium border border-red-200 bg-red-50 rounded-md px-3 py-2 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Réinitialiser</button>
                        </div>
                    </section>
                    <section className="border rounded-xl p-5 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Guide d'interprétation et stratégie</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-xl p-5 bg-white shadow-lg">
                         <h2 className="font-semibold mb-3 text-gray-800">Sources & Références Officielles</h2>
                         <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://entreprendre.service-public.fr/vosdroits/F23267" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Service-Public.fr : Le versement libératoire</a></li>
                            <li><a href="https://www.urssaf.fr/portail/home/auto-entrepreneur/je-gere-mon-auto-entreprise/le-versement-liberatoire.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">URSSAF : Définition et option pour le VFL</a></li>
                            <li><a href="https://www.impots.gouv.fr/particulier/le-regime-de-la-micro-entreprise" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Impots.gouv.fr : Le régime de la micro-entreprise</a></li>
                         </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculateurVersementLiberatoire;