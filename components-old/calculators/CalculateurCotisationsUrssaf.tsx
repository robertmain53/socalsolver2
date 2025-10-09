'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calculateur de Cotisations Sociales URSSAF (indépendant/profession libérale)",
  description: "Estimez vos cotisations URSSAF (maladie, retraite, CSG) en tant que professionnel libéral ou indépendant. Simulateur à jour, avec option ACRE."
};

// --- Icônes (SVG inline) ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);

// --- Composant Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Données Structurées SEO (JSON-LD) ---
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
            "name": "À quoi servent les cotisations sociales URSSAF ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Les cotisations sociales financent votre protection sociale obligatoire : assurance maladie, indemnités journalières, retraite de base et complémentaire, allocations familiales, et invalidité-décès. Elles vous ouvrent des droits personnels."
            }
          },
          {
            "@type": "Question",
            "name": "Les cotisations sociales sont-elles déductibles des impôts ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oui, toutes les cotisations sociales obligatoires versées en tant que travailleur indépendant sont entièrement déductibles de votre revenu professionnel imposable (BNC). Elles réduisent donc votre base d'imposition pour l'impôt sur le revenu."
            }
          },
          {
            "@type": "Question",
            "name": "Qu'est-ce que l'ACRE et comment affecte-t-elle mes cotisations ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'ACRE (Aide à la Création ou à la Reprise d'une Entreprise) est une exonération partielle de la plupart des cotisations sociales durant votre première année d'activité. L'exonération est totale pour les faibles revenus et diminue progressivement jusqu'à s'annuler lorsque le revenu atteint le Plafond de la Sécurité Sociale."
            }
          }
        ]
      })
    }}
  />
);

// --- Renderer pour le contenu Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('####')) {
           return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/####\s*/, '')) }} />;
        }
        if (trimmedBlock.startsWith('*')) {
          return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^\*/, '•')) }} />;
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
      })}
    </div>
  );
};

// --- Données de Configuration du Calculateur ---
const calculatorData = {
  "slug": "calculateur-cotisations-urssaf", "category": "Fiscalité et travail indépendant", "title": "Calculateur de Cotisations Sociales URSSAF (indépendant/profession libérale)", "lang": "fr",
  "inputs": [
    { "id": "revenu_bnc", "label": "Revenu annuel estimé (BNC)", "type": "number", "unit": "€", "min": 0, "step": 500, "tooltip": "Indiquez votre bénéfice non commercial (Chiffre d'Affaires - Dépenses professionnelles). C'est la base de calcul pour la majorité de vos cotisations." },
    { "id": "beneficie_acre", "label": "Bénéficiaire de l'ACRE ?", "type": "boolean", "tooltip": "Cochez si vous bénéficiez de l'Aide à la Création ou à la Reprise d'une Entreprise. Cela permet une exonération partielle de certaines cotisations la première année." },
    { "id": "est_reglementee", "label": "Profession libérale réglementée ?", "type": "boolean", "tooltip": "Cochez cette case si votre activité est réglementée (ex: avocat, médecin, architecte). Cela impacte principalement le calcul de la retraite complémentaire." }
  ],
  "outputs": [
    { "id": "total_cotisations", "label": "Total des cotisations sociales", "unit": "€" }, { "id": "revenu_net_apres_cotisations", "label": "Revenu net après cotisations", "unit": "€" },
    { "id": "maladie_maternite", "label": "Maladie-Maternité", "unit": "€" }, { "id": "allocations_familiales", "label": "Allocations Familiales", "unit": "€" },
    { "id": "csg_crds", "label": "CSG / CRDS", "unit": "€" }, { "id": "retraite_base", "label": "Retraite de Base", "unit": "€" },
    { "id": "retraite_complementaire", "label": "Retraite Complémentaire", "unit": "€" }, { "id": "invalidite_deces", "label": "Invalidité-Décès", "unit": "€" },
    { "id": "formation_professionnelle", "label": "Formation Pro. (CFP)", "unit": "€" }
  ],
  "content": "### **Guide Complet du Calcul des Cotisations Sociales pour Indépendants (Professions Libérales)**\n\n**Comprendre, Anticiper et Optimiser vos Charges Sociales**\n\nLa détermination des cotisations sociales est une étape cruciale pour tout professionnel indépendant en France. Ces prélèvements obligatoires financent votre protection sociale (santé, retraite, famille) et leur montant a un impact direct sur votre revenu net. \n\nCe guide, associé à notre calculateur, a pour vocation de démystifier ce calcul complexe. Il vise à fournir une information claire et détaillée, supérieure à une simple simulation, pour vous permettre de piloter votre activité avec sérénité. **Attention, cet outil fournit une estimation à but informatif et ne remplace pas les décomptes officiels de l'URSSAF.**\n\n### **Partie 1 : Utiliser le Calculateur - Les Paramètres Clés**\n\nNotre simulateur se base sur les principaux facteurs qui influencent le montant de vos cotisations. Voici comment interpréter chaque champ pour obtenir une estimation fiable.\n\n* **Revenu Annuel Estimé (BNC)** : C'est le cœur du calcul. Il s'agit de votre bénéfice non commercial, c'est-à-dire la différence entre vos recettes encaissées et vos dépenses professionnelles déductibles sur l'année. Pour les micro-entrepreneurs, le calcul est différent (basé sur le chiffre d'affaires) ; cet outil s'adresse principalement aux indépendants au régime de la déclaration contrôlée.\n\n* **Bénéficiaire de l'ACRE** : L'Aide à la Création ou à la Reprise d'une Entreprise est un dispositif majeur pour les nouveaux entrepreneurs. Elle offre une exonération partielle et dégressive de la plupart des cotisations sociales durant les 12 premiers mois d'activité. L'exonération est totale si votre revenu est inférieur à 75% du Plafond Annuel de la Sécurité Sociale (PASS), puis diminue pour devenir nulle à 100% du PASS. La CSG-CRDS reste due.\n\n* **Profession Libérale Réglementée** : Cette distinction est importante pour la caisse de retraite. Les professions réglementées (avocats, médecins, experts-comptables, notaires, etc.) sont généralement affiliées à une section de la CNAVPL. Les professions non réglementées (consultants, designers, développeurs web, formateurs, etc.) relèvent majoritairement de la CIPAV pour leur retraite complémentaire et invalidité-décès. Les barèmes peuvent différer.\n\n### **Partie 2 : Anatomie de vos Cotisations - À Quoi Sert Chaque Prélèvement ?**\n\nComprendre la finalité de chaque cotisation est essentiel pour appréhender votre protection sociale. Voici le détail des calculs effectués par notre simulateur (base des taux 2025).\n\n#### **1. Assurance Maladie-Maternité**\n\nElle finance vos remboursements de soins, les indemnités journalières en cas d'arrêt maladie (sous conditions) et les congés maternité/paternité. Son taux est progressif pour ne pas pénaliser les faibles revenus.\n\n#### **2. Allocations Familiales**\n\nCette cotisation contribue au financement des prestations versées par la Caisse d'Allocations Familiales (CAF). Le taux est de 0% pour les revenus sous 110% du PASS, puis augmente progressivement jusqu'à un taux plein de 3,10% pour les revenus supérieurs à 140% du PASS.\n\n#### **3. CSG-CRDS (Contribution Sociale Généralisée / Contribution au Remboursement de la Dette Sociale)**\n\nCes contributions financent une partie de la Sécurité Sociale et remboursent la dette sociale. Elles sont calculées sur une base plus large que les autres cotisations : votre revenu (BNC) + le montant de vos cotisations sociales obligatoires. Le taux est fixe (9,7%).\n\n#### **4. Retraite de Base (CNAVPL)**\n\nElle vous ouvre des droits pour votre future pension de retraite du régime de base. La cotisation est de 8,23% sur la part de votre revenu située sous le PASS.\n\n#### **5. Retraite Complémentaire**\n\nElle complète, comme son nom l'indique, votre retraite de base. C'est ici que la distinction entre profession réglementée (CNAVPL) et non-règlementée (CIPAV) est la plus marquée, avec des systèmes de calcul par points et des taux différents.\n\n#### **6. Invalidité-Décès**\n\nCe régime assure un capital ou une rente en cas d'invalidité ou de décès, protégeant ainsi vos proches. La cotisation est souvent forfaitaire, organisée par classes de revenus.\n\n#### **7. Contribution à la Formation Professionnelle (CFP)**\n\nObligatoire, elle vous donne accès à des droits à la formation pour développer vos compétences. Son montant est un faible pourcentage du PASS (0,25%).\n\n### **Partie 3 : Aspects Pratiques et Optimisation**\n\n* **Déductibilité Fiscale** : Un avantage majeur ! L'intégralité de vos cotisations sociales obligatoires est déductible de votre bénéfice imposable. Elles réduisent donc non seulement votre revenu net, mais aussi votre impôt sur le revenu.\n\n* **Déclarations et Paiements** : Vos revenus sont à déclarer chaque année via la Déclaration Sociale et Fiscale Unifiée (DSFU) sur le site impots.gouv.fr, qui transmet les informations à l'URSSAF. Les paiements sont généralement mensualisés ou trimestriels, basés sur une estimation de votre revenu de l'année en cours, avec une régularisation l'année suivante.\n\n* **Première Année d'Activité** : En l'absence de revenus antérieurs, l'URSSAF calcule vos premières cotisations sur une base forfaitaire. Il est crucial de demander à ajuster ces acomptes si vous anticipez un revenu très différent de cette base, afin d'éviter une régularisation importante.\n\n### **Conclusion**\n\nLe système de cotisations sociales français pour les indépendants, bien que complexe, est le pilier d'un modèle solidaire offrant une protection sociale robuste. Utiliser un simulateur comme celui-ci est la première étape pour une gestion éclairée. Pour des conseils personnalisés et une optimisation fine, le recours à un expert-comptable reste la meilleure stratégie."
};

// --- Nom du composant généré dynamiquement ---
const componentName = calculatorData.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'Calculator';

const CalculateurCotisationsUrssafCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    revenu_bnc: 50000,
    beneficie_acre: false,
    est_reglementee: false,
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };
  
  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const { revenu_bnc, beneficie_acre, est_reglementee } = states;
    
    const PASS = 46368;
    const coeff_acre = beneficie_acre ? (revenu_bnc < 0.75 * PASS ? 0 : (revenu_bnc < PASS ? (revenu_bnc / (0.25 * PASS)) - 3 : 1)) : 1;
    
    const taux_maladie = revenu_bnc < 0.4 * PASS ? 0.015 : (revenu_bnc < 2.5 * PASS ? 0.015 + (0.065 - 0.015) * (revenu_bnc - 0.4 * PASS) / (2.1 * PASS) : 0.065);
    const maladie_maternite = revenu_bnc * taux_maladie * coeff_acre;
    
    const taux_alloc_fam = revenu_bnc < 1.1 * PASS ? 0 : (revenu_bnc < 1.4 * PASS ? 0.031 * (revenu_bnc - 1.1 * PASS) / (0.3 * PASS) : 0.031);
    const allocations_familiales = revenu_bnc * taux_alloc_fam * coeff_acre;
    
    const retraite_base = (Math.min(revenu_bnc, PASS) * 0.0823) * coeff_acre;

    const retraite_complementaire = est_reglementee ? 
        (Math.min(revenu_bnc, PASS) * 0.07 + Math.max(0, Math.min(revenu_bnc, 3*PASS) - PASS) * 0.08) :
        (Math.min(revenu_bnc, PASS * 0.85) * 0.09); // Simplification CIPAV

    const invalidite_deces = (revenu_bnc < 0.5 * PASS ? 150 : (revenu_bnc < 1.5 * PASS ? 300 : 450)) * coeff_acre;
    
    const formation_professionnelle = 0.0025 * PASS;
    
    const cotisations_pour_base_csg = maladie_maternite + allocations_familiales + retraite_base + retraite_complementaire + invalidite_deces;
    const base_csg = revenu_bnc * 0.9825 + cotisations_pour_base_csg;
    const csg_crds = base_csg * 0.097;
    
    const total_cotisations = maladie_maternite + allocations_familiales + csg_crds + retraite_base + retraite_complementaire + invalidite_deces + formation_professionnelle;
    const revenu_net_apres_cotisations = revenu_bnc - total_cotisations;

    return { total_cotisations, maladie_maternite, allocations_familiales, csg_crds, retraite_base, retraite_complementaire, invalidite_deces, formation_professionnelle, revenu_net_apres_cotisations };
  }, [states]);

  const chartData = [
    { name: 'Maladie', value: calculatedOutputs.maladie_maternite },
    { name: 'Famille', value: calculatedOutputs.allocations_familiales },
    { name: 'CSG/CRDS', value: calculatedOutputs.csg_crds },
    { name: 'Retraite Base', value: calculatedOutputs.retraite_base },
    { name: 'Retraite Comp.', value: calculatedOutputs.retraite_complementaire },
    { name: 'Invalidité', value: calculatedOutputs.invalidite_deces },
  ].filter(d => d.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

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
    } catch (e) { alert("Erreur lors de l'export PDF."); }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
      alert("Résultat sauvegardé !");
    } catch { alert("Sauvegarde impossible."); }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/80 font-sans">
        
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 sm:p-6" ref={calculatorRef}>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
          <p className="text-gray-600 mb-6">Estimez vos charges sociales et visualisez leur impact sur votre revenu net.</p>
          
          <div className="text-sm text-amber-900 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-6">
            <strong>Avertissement :</strong> Cet outil est un simulateur à but informatif. Les calculs sont des estimations et ne peuvent remplacer les décomptes officiels de l'URSSAF.
          </div>

          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-5 bg-slate-50 rounded-lg">
            {inputs.map(input => {
              if (input.type === 'boolean') {
                return (
                  <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                    <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                    <label className="text-sm font-medium text-gray-800 flex items-center" htmlFor={input.id}>
                      {input.label}
                      <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                    </label>
                  </div>
                );
              }
              return (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                  </label>
                  <div className="relative">
                    <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-12 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Outputs Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultats de la Simulation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outputs.slice(0, 2).map(output => (
                <div key={output.id} className={`p-4 rounded-lg ${output.id.includes('total') ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-green-50 border-l-4 border-green-500'}`}>
                  <p className="text-sm font-medium text-gray-600">{output.label}</p>
                  <p className={`text-2xl font-bold ${output.id.includes('total') ? 'text-blue-700' : 'text-green-700'}`}>
                    {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Chart and Breakdown */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-gray-50 p-4 rounded-lg">
              <div className="h-64">
                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Répartition des cotisations</h3>
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-2">
                 {outputs.slice(2).map(output => (
                    <div key={output.id} className="flex justify-between items-center text-sm p-2 bg-white rounded">
                      <span className="text-gray-600">{output.label}</span>
                      <span className="font-semibold text-gray-800">{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-xl p-4 bg-white shadow-lg">
            <h2 className="font-semibold mb-3 text-gray-800">Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={handleSaveResult} className="w-full text-center bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sauvegarder</button>
              <button onClick={handleExportPDF} className="w-full text-center bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Exporter en PDF</button>
              <button onClick={handleReset} className="w-full text-center bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-2 text-sm font-medium hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Réinitialiser</button>
            </div>
          </section>

          <section className="border rounded-xl p-4 bg-white shadow-lg">
            <h2 className="font-semibold mb-3 text-gray-800">Guide de Compréhension</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-xl p-4 bg-white shadow-lg">
            <h2 className="font-semibold mb-3 text-gray-800">Sources et Références</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.urssaf.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Site officiel de l'URSSAF</a></li>
              <li><a href="https://entreprendre.service-public.fr/vosdroits/F23369" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Service-Public.fr - Cotisations sociales</a></li>
              <li><a href="https://www.economie.gouv.fr/entreprises/aides-creation-reprise-entreprise-acre" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Informations sur l'ACRE</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculateurCotisationsUrssafCalculator;