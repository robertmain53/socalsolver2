'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

// --- DATI DI CONFIGURAZIONE (inclusi direttamente) ---
const calculatorData = {
  "slug": "calculateur-cfe",
  "category": "Fiscalité et travail indépendant",
  "title": "Calculateur de la CFE (Cotisation Foncière des Entreprises)",
  "lang": "fr",
  "inputs": [
    { "id": "chiffre_affaires", "label": "Chiffre d'affaires (CA) annuel H.T.", "type": "number", "unit": "€", "min": 0, "step": 500, "tooltip": "Indiquez votre chiffre d'affaires hors taxes encaissé sur l'année. Ce montant détermine la base minimale d'imposition et l'éligibilité à certaines exonérations." },
    { "id": "taux_cfe", "label": "Taux de CFE de votre commune", "type": "number", "unit": "%", "min": 0, "step": 0.5, "tooltip": "Ce taux est voté par votre commune ou EPCI. Vous pouvez le trouver sur un ancien avis de CFE ou en contactant votre Service des Impôts des Entreprises (SIE). Il varie fortement d'une ville à l'autre (moyenne nationale autour de 25-30%)." },
    { "id": "premiere_annee_activite", "label": "Est-ce votre première année d'activité ?", "type": "boolean", "tooltip": "Cochez cette case si vous avez créé votre entreprise cette année. Les entreprises nouvelles sont totalement exonérées de CFE pour leur première année d'existence." }
  ],
  "outputs": [
    { "id": "cfe_totale_estimee", "label": "Estimation de votre CFE totale", "unit": "€" },
    { "id": "base_imposition_estimee", "label": "Base d'imposition estimée", "unit": "€" },
    { "id": "montant_cfe_base", "label": "Montant CFE (hors taxes additionnelles)", "unit": "€" },
    { "id": "taxe_additionnelle_estimee", "label": "Taxes additionnelles estimées", "unit": "€" }
  ],
  "formulaSteps": [
    { "id": "est_exonere", "expr": "premiere_annee_activite || chiffre_affaires <= 5000" },
    { "id": "base_imposition_estimee", "expr": "(chiffre_affaires <= 10000) ? 401 : (chiffre_affaires <= 32600) ? 684 : (chiffre_affaires <= 100000) ? 1306 : 0" },
    { "id": "montant_cfe_base", "expr": "base_imposition_estimee * (taux_cfe / 100)" },
    { "id": "frais_gestion", "expr": "montant_cfe_base * 0.01" },
    { "id": "taxe_chambre_consulaire", "expr": "montant_cfe_base * 0.015" },
    { "id": "taxe_additionnelle_estimee", "expr": "frais_gestion + taxe_chambre_consulaire" },
    { "id": "cfe_totale_estimee", "expr": "est_exonere ? 0 : (montant_cfe_base + taxe_additionnelle_estimee)" }
  ],
  "content": "### **Guide Complet de la CFE (Cotisation Foncière des Entreprises)**\n\n**Estimez votre CFE et comprenez enfin cet impôt local.**\n\nLa Cotisation Foncière des Entreprises (CFE) est un impôt local dû par la quasi-totalité des entreprises et des travailleurs indépendants, y compris les micro-entrepreneurs. Son calcul peut sembler opaque car il dépend de facteurs locaux. \n\nCe simulateur est conçu pour vous donner une **estimation fiable** du montant de votre CFE, tout en vous expliquant en détail son fonctionnement. Il vous aidera à anticiper cette charge fiscale et à vérifier la cohérence de votre avis d'imposition.\n\n### **Partie 1 : Comment Fonctionne notre Estimateur ?**\n\nLe calcul de la CFE repose sur une formule simple en apparence : **CFE = Base d'imposition × Taux de CFE**. La complexité réside dans la détermination de ces deux variables.\n\n* **Chiffre d'Affaires (CA)** : Votre CA permet de vous situer dans les tranches de la **base minimale d'imposition**, un mécanisme qui s'applique à la majorité des indépendants et TPE.\n* **Taux de CFE** : C'est la **variable la plus importante**. Ce taux est fixé par votre commune (ou votre intercommunalité) et peut varier de 15% à plus de 40% sur le territoire. Pour obtenir une estimation précise, il est crucial de renseigner le bon taux.\n\n> **Où trouver votre taux de CFE ?** La meilleure source est votre dernier avis d'imposition à la CFE. Si vous n'en avez pas, vous pouvez contacter le **Service des Impôts des Entreprises (SIE)** dont vous dépendez.\n\n### **Partie 2 : Le Calcul de la CFE en Détail**\n\n#### **1. La Base d'Imposition**\n\nLa base d'imposition théorique correspond à la valeur locative des biens immobiliers que l'entreprise a utilisés pour son activité. Cependant, pour la majorité des indépendants (notamment ceux domiciliés chez eux), c'est une **base minimale** qui s'applique. Cette base est déterminée selon des tranches de chiffre d'affaires. Notre simulateur utilise une **estimation moyenne** de cette base minimale, basée sur les fourchettes prévues par la loi.\n\n| Chiffre d'Affaires (N-2) | Fourchette de la base minimale (2024) |\n| :--- | :--- |\n| CA ≤ 10 000 € | entre 237 € et 565 € |\n| 10 001 € < CA ≤ 32 600 € | entre 237 € et 1 130 € |\n| 32 601 € < CA ≤ 100 000 € | entre 237 € et 2 374 € |\n\n#### **2. Les Taxes Additionnelles**\n\nAu montant de la CFE s'ajoutent des taxes annexes :\n\n* **Taxe pour Frais de Chambre Consulaire** : Pour financer la Chambre de Commerce et d'Industrie (CCI) ou la Chambre de Métiers et de l'Artisanat (CMA).\n* **Frais de Gestion** : Prélevés par l'État pour la gestion et le recouvrement de l'impôt.\n\nNotre simulateur inclut une estimation de ces frais pour un résultat au plus proche de la réalité.\n\n### **Partie 3 : Exonérations et Cas Particuliers**\n\nDe nombreuses situations permettent d'être exonéré de CFE. Voici les cas les plus courants :\n\n* **Exonération pour la première année** : Toutes les entreprises nouvelles sont totalement exonérées de CFE l'année de leur création.\n* **Exonération pour faible CA** : Les entreprises réalisant un chiffre d'affaires annuel inférieur ou égal à **5 000 €** sont totalement exonérées.\n* **Certains artisans** : Les artisans travaillant seuls ou avec une aide limitée (famille, apprentis) peuvent être exonérés (sous conditions).\n* **Exonérations géographiques** : Les entreprises implantées dans certaines zones spécifiques (ZRR, QPV, BER...) peuvent bénéficier d'exonérations temporaires.\n\n### **Partie 4 : Guide Pratique de la CFE**\n\n* **Qui est redevable ?** Toute personne exerçant une activité professionnelle non salariée, quel que soit son statut (société, entreprise individuelle, micro-entrepreneur).\n* **Quand payer ?** La CFE est due chaque année. L'avis d'imposition est disponible en ligne sur votre espace professionnel impots.gouv.fr en novembre, pour un paiement au plus tard le **15 décembre**.\n* **Comment payer ?** Le paiement se fait obligatoirement de manière dématérialisée (paiement en ligne, prélèvement).\n\n**Disclaimer important :** Cet outil fournit une **estimation** et ne peut se substituer à l'avis d'imposition officiel émis par l'administration fiscale. Les variations locales de la base d'imposition peuvent influencer le résultat final.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Qu'est-ce que la CFE (Cotisation Foncière des Entreprises) ?", "acceptedAnswer": { "@type": "Answer", "text": "La CFE est un impôt local dû par la plupart des entreprises et travailleurs indépendants en France. Elle est basée sur la valeur locative des biens immobiliers utilisés pour l'activité professionnelle et est calculée à partir d'une base d'imposition et d'un taux voté par la commune." } }, { "@type": "Question", "name": "Comment est calculée la CFE ?", "acceptedAnswer": { "@type": "Answer", "text": "La formule de calcul est : CFE = Base d'imposition × Taux de CFE. Pour la majorité des petits entrepreneurs, la base d'imposition est une base minimale forfaitaire qui dépend de leur chiffre d'affaires. Le taux est fixé par la commune où l'entreprise est domiciliée." } }, { "@type": "Question", "name": "Qui est exonéré de CFE ?", "acceptedAnswer": { "@type": "Answer", "text": "Les entreprises sont totalement exonérées de CFE l'année de leur création. Celles dont le chiffre d'affaires est inférieur à 5 000 € le sont également. D'autres exonérations existent pour certains artisans, certaines professions ou les entreprises situées dans des zones spécifiques (ZRR, QPV)." } }, { "@type": "Question", "name": "Où trouver mon taux de CFE ?", "acceptedAnswer": { "@type": "Answer", "text": "Le taux de CFE applicable à votre entreprise est indiqué sur votre avis d'imposition à la CFE des années précédentes. Si vous n'en avez pas, vous devez contacter votre Service des Impôts des Entreprises (SIE) pour l'obtenir. Ce taux est essentiel pour une estimation précise." } } ] }
};

// --- COMPOSANTS UTILITAIRES ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-blue-500 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);

// --- COMPOSANT DE RENDU DU CONTENU MARKDOWN ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('> ')) return <blockquote key={index} className="pl-4 border-l-4 border-gray-300 italic text-gray-600" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/> /g, '')) }} />;
                if (trimmedBlock.startsWith('|')) {
                    const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
                    const headers = rows[0];
                    const body = rows.slice(2);
                    return (<div key={index} className="overflow-x-auto my-4"><table className="min-w-full border text-sm">
                        <thead className="bg-gray-100"><tr>{headers.map((h, i) => <th key={i} className="p-2 border text-left font-semibold">{h}</th>)}</tr></thead>
                        <tbody>{body.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="p-2 border">{cell}</td>)}</tr>)}</tbody>
                    </table></div>);
                }
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- COMPOSANT GRAPHIQUE (CHARGEMENT DYNAMIQUE) ---
const DynamicPieChart = dynamic(
  () => import('recharts').then(mod => {
    const COLORS = ['#4f46e5', '#f97316', '#10b981'];
    const ChartComponent = ({ data, isClient }: { data: any[], isClient: boolean }) => (
      <div className="h-56 w-full bg-gray-50 p-2 rounded-lg">
        {isClient ? (
          <mod.ResponsiveContainer width="100%" height="100%">
            <mod.PieChart>
              <mod.Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {data.map((entry, index) => <mod.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </mod.Pie>
              <mod.Tooltip formatter={(value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)} />
              <mod.Legend iconSize={10} />
            </mod.PieChart>
          </mod.ResponsiveContainer>
        ) : <p>Chargement...</p>}
      </div>
    );
    return ChartComponent;
  }),
  { ssr: false, loading: () => <div className="h-56 w-full bg-gray-50 p-2 rounded-lg flex items-center justify-center"><p>Chargement du graphique...</p></div> }
);

// --- COMPOSANT PRINCIPAL DU CALCULATEUR ---
const CalculateurCfe: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema, formulaSteps } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = { chiffre_affaires: 30000, taux_cfe: 27, premiere_annee_activite: false, };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);
    
    const handleStateChange = (id: string, value: any) => { setStates(prev => ({ ...prev, [id]: value })); };
    const handleReset = () => { setStates(initialStates); };

    const calculatedOutputs = useMemo(() => {
        const context = { ...states, Math };
        const results: { [key: string]: any } = {};
        formulaSteps.forEach(step => {
            try {
              const func = new Function(...Object.keys(context), `return ${step.expr}`);
              results[step.id] = func(...Object.values(context));
            } catch (e) {
              console.error(`Error evaluating ${step.id}`);
              results[step.id] = 0;
            }
        });
        return results;
    }, [states, formulaSteps]);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) { alert("Erreur lors de l'export PDF."); }
    }, [slug]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value);

    const { est_exonere, cfe_totale_estimee, montant_cfe_base, taxe_additionnelle_estimee } = calculatedOutputs;
    const chartData = [
      { name: 'CFE de base', value: montant_cfe_base || 0 },
      { name: 'Taxes Add.', value: taxe_additionnelle_estimee || 0 },
    ];
    
    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <main className="lg:col-span-3">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Anticipez le montant de cet impôt local grâce à notre simulateur détaillé.</p>

                        <div className="text-xs text-orange-800 bg-orange-50 border border-orange-200 rounded-md p-3 mb-6">
                            <strong>Important :</strong> Ce calculateur fournit une **estimation**. Le montant final dépend de la base d'imposition exacte et des taux votés par votre commune.
                        </div>

                        <div className="space-y-4">
                            {inputs.map(input => (
                                <div key={input.id}>
                                    {input.type === 'boolean' ? (
                                        <div className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                <Tooltip text={input.tooltip}><span className="ml-1.5 cursor-help"><InfoIcon /></span></Tooltip>
                                            </label>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                <Tooltip text={input.tooltip}><span className="ml-1.5 cursor-help"><InfoIcon /></span></Tooltip>
                                            </label>
                                            <div className="relative">
                                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 pointer-events-none">{input.unit}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <aside className="lg:col-span-2 space-y-6">
                    <section className="border rounded-lg p-5 bg-white shadow-md sticky top-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultats de l'Estimation</h2>
                        {isClient && est_exonere ? (
                            <div className="p-4 rounded-lg bg-green-50 border-green-400 border text-center">
                                <div className="text-2xl font-bold text-green-600">✅ Exonéré de CFE</div>
                                <p className="text-sm text-green-700 mt-1">
                                    {states.premiere_annee_activite ? "Vous êtes exonéré pour votre première année d'activité." : "Votre CA est inférieur à 5 000 €, vous êtes exonéré."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-indigo-50 border-indigo-500 border-l-4 text-center">
                                    <div className="text-base font-medium text-gray-700">Votre CFE totale est estimée à</div>
                                    <div className="text-4xl font-bold text-indigo-600">{isClient ? formatCurrency(cfe_totale_estimee) : '...'}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {outputs.slice(1).map(output => (
                                        <div key={output.id} className="bg-gray-50 p-2 rounded-md border">
                                            <div className="text-gray-600">{output.label}</div>
                                            <div className="font-semibold text-gray-800">{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</div>
                                        </div>
                                    ))}
                                </div>
                                {isClient && cfe_totale_estimee > 0 && <DynamicPieChart data={chartData} isClient={isClient} />}
                            </div>
                        )}
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exporter PDF</button>
                            <button onClick={handleReset} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Réinitialiser</button>
                        </div>
                    </section>
                </aside>
            </div>
            <div className="bg-white">
                <div className="max-w-4xl mx-auto p-6 md:p-8">
                    <ContentRenderer content={content} />
                    <div className="mt-8">
                        <h3 className="font-semibold mb-2 text-gray-800">Sources Officielles</h3>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://entreprendre.service-public.fr/vosdroits/F23547" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Service-Public.fr - Cotisation foncière des entreprises (CFE)</a></li>
                            <li><a href="https://www.impots.gouv.fr/professionnel/la-cotisation-fonciere-des-entreprises-cfe" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Impots.gouv.fr - Professionnel : La CFE</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CalculateurCfe;