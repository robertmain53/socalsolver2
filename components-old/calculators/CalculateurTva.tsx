'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// -------------------- Tipi --------------------
type SelectInputDef = {
  id: string;
  label: string;
  type: 'select';
  options: Array<string | number>;
  labels?: Record<string, string>;
  unit?: string;
  default?: string | number;
  tooltip?: string;
  condition?: string;
  valueType?: 'number' | 'string'; // opzionale: forza il parsing
};

type NumberInputDef = {
  id: string;
  label: string;
  type: 'number';
  unit?: string;
  min?: number;
  step?: number;
  default?: number;
  tooltip?: string;
  condition?: string;
};

type InputDef = NumberInputDef | SelectInputDef;

type StateMap = Record<string, any>;

// -------------------- Data Configuration --------------------
const calculatorData = {
  slug: 'calculateur-tva',
  category: 'Fiscalité et travail indépendant',
  title: 'Calculateur de TVA (franchise, réel simplifié/normal)',
  lang: 'fr',
  inputs: [
    { id: 'montant', label: 'Montant de base', type: 'number' as const, min: 0, step: 10, tooltip: "Saisissez le montant de votre transaction, hors taxes (HT) ou toutes taxes comprises (TTC)." },
    { id: 'type_montant', label: 'Le montant est en', type: 'select' as const, options: ['HT', 'TTC'], tooltip: "Précisez si le montant que vous avez saisi est HT ou TTC pour que le calcul s'effectue dans le bon sens." },
    { id: 'taux_tva', label: 'Taux de TVA applicable', type: 'select' as const, options: [20, 10, 5.5, 2.1], unit: '%', tooltip: 'Choisissez le taux de TVA correspondant à votre activité. 20% est le taux normal.', valueType: 'number' },
    {
      id: 'regime_imposition',
      label: "Régime d'imposition à la TVA",
      type: 'select' as const,
      options: ['franchise', 'reel_simplifie', 'reel_normal'],
      labels: { franchise: 'Franchise en base', reel_simplifie: 'Réel Simplifié', reel_normal: 'Réel Normal' },
      tooltip: "Le régime détermine si vous facturez et déclarez la TVA. La 'Franchise' vous exonère, tandis que les régimes 'Réel' impliquent une déclaration."
    },
    {
      id: 'type_activite',
      label: "Nature de l'activité principale",
      type: 'select' as const,
      options: ['services', 'ventes'],
      labels: { services: 'Prestations de services / Activités libérales', ventes: 'Ventes de marchandises / Hébergement' },
      condition: "regime_imposition == 'franchise' || regime_imposition == 'reel_simplifie'",
      tooltip: "Le seuil de chiffre d'affaires pour chaque régime dépend de la nature de votre activité."
    },
    {
      id: 'chiffre_affaires_annuel',
      label: "Chiffre d'affaires annuel (HT)",
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 1000,
      condition: "regime_imposition == 'franchise' || regime_imposition == 'reel_simplifie'",
      tooltip: "Votre chiffre d'affaires annuel permet de vérifier votre éligibilité au régime de franchise ou simplifié."
    },
    {
      id: 'tva_deductible',
      label: 'TVA déductible sur les frais',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 5,
      condition: "regime_imposition == 'reel_simplifie' || regime_imposition == 'reel_normal'",
      tooltip: "Montant total de la TVA que vous avez payée sur vos achats et frais professionnels pour la période concernée."
    }
  ] as InputDef[],
  outputs: [
    { id: 'montant_ht', label: 'Montant Hors Taxes (HT)', unit: '€' },
    { id: 'montant_tva_collectee', label: 'Montant de la TVA', unit: '€' },
    { id: 'montant_ttc', label: 'Montant Toutes Taxes Comprises (TTC)', unit: '€' },
    { id: 'tva_a_declarer', label: "TVA à déclarer à l'État", unit: '€' },
    { id: 'eligibilite_regime', label: 'Éligibilité au régime choisi', unit: '' }
  ],
  content:
    "### **Guide Complet sur la TVA : Calcul, Régimes et Déclaration**\n\nLa Taxe sur la Valeur Ajoutée (TVA) est un impôt indirect sur la consommation qui représente une part majeure des recettes fiscales en France. Sa gestion est une obligation pour la quasi-totalité des entreprises. Ce guide, couplé à notre calculateur, a pour but de démystifier le fonctionnement de la TVA, de vous aider à choisir le régime adapté et à anticiper le montant à déclarer.\n\n#### **1. Comment Utiliser le Calculateur de TVA ?**\n\nNotre outil est conçu pour vous fournir une estimation précise en quelques clics :\n\n1.  **Montant de base et type** : Saisissez le montant d'une vente ou prestation et spécifiez s'il est Hors Taxes (HT) ou Toutes Taxes Comprises (TTC).\n2.  **Taux de TVA** : Sélectionnez le taux de TVA qui s'applique. Le taux normal est de 20%, mais des taux réduits existent pour certains secteurs (restauration, culture, etc.).\n3.  **Régime d'imposition** : C'est le paramètre le plus important. Il définit vos obligations en matière de TVA.\n4.  **Informations complémentaires** : Selon le régime, des informations comme votre chiffre d'affaires annuel ou le montant de la TVA déductible seront nécessaires pour affiner le calcul et vérifier votre éligibilité.\n\n#### **2. Comprendre les Régimes de TVA en Profondeur**\n\nLe choix du régime de TVA n'est pas anodin et dépend de votre chiffre d'affaires et de la nature de votre activité. Voici une analyse comparative pour vous éclairer.\n\n| Critère | Franchise en base | Régime Réel Simplifié (RSI) | Régime Réel Normal (RSN) |\n| :--- | :--- | :--- | :--- |\n| **Seuils CA (HT)** | Services : **< 36 800 €** <br> Ventes : **< 91 900 €** | Services : **< 254 000 €** <br> Ventes : **< 840 000 €** | Au-delà des seuils du RSI ou sur option |\n| **Facturation** | Sans TVA. Mention obligatoire : 'TVA non applicable, art. 293 B du CGI' | Avec TVA | Avec TVA |\n| **Déduction de la TVA** | Non | Oui | Oui |\n| **Déclaration** | Aucune (sauf dépassement) | 1 déclaration annuelle (CA12) + 2 acomptes semestriels | 1 déclaration mensuelle (CA3) ou trimestrielle |\n\n##### **A. La Franchise en Base de TVA**\n\n**Pour qui ?** Idéal pour les micro-entrepreneurs et petites entreprises qui souhaitent une gestion administrative allégée.\n\n* **Avantages** : Vous ne facturez pas la TVA, ce qui peut vous donner un avantage concurrentiel sur les prix si vos clients sont des particuliers. La comptabilité est simplifiée.\n* **Inconvénients** : Vous ne pouvez pas récupérer la TVA sur vos propres achats professionnels (matériel, matières premières, etc.). Cela peut être pénalisant si vous avez des investissements importants.\n\n##### **B. Le Régime Réel Simplifié (RSI)**\n\n**Pour qui ?** C'est le régime par défaut pour les entreprises qui dépassent les seuils de la franchise, mais restent sous les seuils du réel normal.\n\n* **Fonctionnement** : Vous collectez la TVA sur vos ventes et déduisez celle de vos dépenses. La régularisation se fait via une déclaration annuelle (formulaire CA12). Vous versez deux acomptes en juillet et décembre, basés sur la TVA due l'année précédente.\n\n##### **C. Le Régime Réel Normal (RSN)**\n\n**Pour qui ?** Obligatoire pour les grandes entreprises, il est aussi accessible sur option pour les plus petites qui y trouveraient un avantage.\n\n* **Avantages** : Permet un suivi très précis de la trésorerie liée à la TVA. Si vous êtes souvent en situation de crédit de TVA (plus de TVA déductible que collectée), ce régime permet d'en demander le remboursement plus rapidement.\n* **Inconvénients** : La gestion est plus lourde et demande une comptabilité rigoureuse avec des déclarations mensuelles (ou trimestrielles si la TVA due annuellement est inférieure à 4 000 €).\n\n#### **3. Concepts Clés de la TVA**\n\n* **TVA Collectée** : C'est la TVA que vous facturez à vos clients sur vos ventes de biens ou de services. Vous la 'collectez' pour le compte de l'État.\n* **TVA Déductible** : C'est la TVA que vous payez sur vos achats et frais professionnels. Vous avez le droit de la déduire de la TVA que vous avez collectée.\n* **TVA à Payer (ou à décaisser)** : C'est la différence entre votre TVA collectée et votre TVA déductible. Si le résultat est positif, vous devez verser la différence à l'État. `TVA à Payer = TVA Collectée - TVA Déductible`.\n* **Crédit de TVA** : Si votre TVA déductible est supérieure à votre TVA collectée, vous avez un crédit de TVA. Vous pouvez choisir de le reporter sur les prochaines déclarations ou d'en demander le remboursement (sous conditions).\n\n**Disclaimer** : Ce calculateur fournit des estimations à but informatif. Il ne remplace pas les conseils d'un expert-comptable ou d'un professionnel de la fiscalité. Les seuils et réglementations sont susceptibles d'évoluer.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment calculer la TVA rapidement ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            "Pour un calcul de TVA, la formule est : Montant HT * (Taux de TVA / 100) = Montant TVA. Pour obtenir le prix TTC, ajoutez la TVA au prix HT. Pour inverser le calcul à partir d'un prix TTC, la formule est : Montant TTC / (1 + Taux de TVA / 100) = Montant HT. Notre calculateur automatise ce processus pour vous."
        }
      },
      {
        '@type': 'Question',
        name: 'Qu\'est-ce que la franchise en base de TVA ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            "La franchise en base de TVA est un régime qui exonère les entreprises de la déclaration et du paiement de la TVA sur leurs ventes ou prestations. En contrepartie, elles ne peuvent pas récupérer la TVA sur leurs dépenses. Ce régime est accessible sous conditions de chiffre d'affaires."
        }
      },
      {
        '@type': 'Question',
        name: 'Quand passe-t-on du régime simplifié au régime normal de TVA ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Une entreprise passe obligatoirement au régime réel normal de TVA lorsque son chiffre d\'affaires annuel HT dépasse 254 000 € pour les prestations de services ou 840 000 € pour les activités de vente. Il est également possible d\'opter volontairement pour le régime normal même sans atteindre ces seuils.'
        }
      },
      {
        '@type': 'Question',
        name: 'Comment fonctionne la TVA déductible ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            "La TVA déductible est la TVA que vous payez sur vos achats professionnels (fournitures, services, immobilisations). Les entreprises assujetties à un régime réel (simplifié ou normal) peuvent soustraire ce montant de la TVA qu'elles ont collectée auprès de leurs clients. La somme à verser à l'État est donc la différence entre la TVA collectée et la TVA déductible."
        }
      }
    ]
  }
};

// -------------------- Helper Components --------------------
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="text-gray-400 inline-block"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const SchemaInjector = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInline = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return (
    <div
      className="prose prose-sm max-w-none text-gray-700"
      dangerouslySetInnerHTML={{
        __html: content
          .split('\n\n')
          .map((block) => {
            if (block.startsWith('### **'))
              return `<h3 class="text-xl font-bold mt-6 mb-4">${processInline(block.replace(/### \*\*/, '').replace(/\*\*$/, ''))}</h3>`;
            if (block.startsWith('####'))
              return `<h4 class="text-lg font-semibold mt-4 mb-3">${processInline(block.replace(/####/, ''))}</h4>`;
            if (block.startsWith('|')) {
              const rows = block.split('\n');
              const header = rows[0]
                .split('|')
                .slice(1, -1)
                .map((h) => `<th>${h.trim()}</th>`)
                .join('');
              const body = rows
                .slice(2)
                .map(
                  (row) =>
                    `<tr>${row
                      .split('|')
                      .slice(1, -1)
                      .map((cell) => `<td>${cell.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/<br>/g, '<br/>')}</td>`)
                      .join('')}</tr>`
                )
                .join('');
              return `<div class="overflow-x-auto my-4"><table class="min-w-full border text-sm"><thead><tr class="bg-gray-100">${header}</tr></thead><tbody>${body}</tbody></table></div>`;
            }
            if (block.startsWith('*')) return `<li class="mb-2">${processInline(block.substring(1).trim())}</li>`;
            if (block.trim()) return `<p class="mb-4">${processInline(block)}</p>`;
            return '';
          })
          .join('')
      }}
    />
  );
};

// -------------------- Grafico (lazy, nessun import statico da recharts) --------------------
const TvaChart = dynamic(async () => {
  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip: RTooltip, Legend } = await import('recharts');
  const Comp: React.FC<{ data: Array<Record<string, number | string>> }> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" hide />
        <RTooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)} />
        <Legend />
        <Bar dataKey="Montant HT" stackId="a" />
        <Bar dataKey="Montant TVA" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
  return Comp;
}, {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-400">Chargement du graphique...</div>
});

// -------------------- Main Calculator Component --------------------
const CalculateurTva: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates: StateMap = {
    montant: 1000,
    type_montant: 'HT',
    taux_tva: 20,
    regime_imposition: 'reel_simplifie',
    type_activite: 'services',
    chiffre_affaires_annuel: 70000,
    tva_deductible: 80
  };
  const [states, setStates] = useState<StateMap>(initialStates);

  const handleStateChange = (id: string, value: any) => setStates((prev) => ({ ...prev, [id]: value }));
  const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

  const calculatedOutputs = useMemo(() => {
    const { montant, type_montant, taux_tva, regime_imposition, type_activite, chiffre_affaires_annuel, tva_deductible } = states;
    const taux_decimal = Number(taux_tva) / 100;
    const base_ht = type_montant === 'HT' ? Number(montant) : Number(montant) / (1 + taux_decimal);
    const base_ttc = type_montant === 'TTC' ? Number(montant) : Number(montant) * (1 + taux_decimal);

    const montant_ht = base_ht;
    const montant_ttc = base_ttc;
    const montant_tva_collectee = regime_imposition === 'franchise' ? 0 : base_ttc - base_ht;
    const tva_a_declarer = regime_imposition === 'franchise' ? 0 : montant_tva_collectee - (Number(tva_deductible) || 0);

    const seuil_franchise = type_activite === 'services' ? 36800 : 91900;
    const seuil_majore_franchise = type_activite === 'services' ? 39100 : 101000;
    const seuil_reel_simplifie = type_activite === 'services' ? 254000 : 840000;

    let eligibilite_regime = 'Applicable par défaut ou sur option';
    if (regime_imposition === 'franchise') {
      if (chiffre_affaires_annuel <= seuil_franchise) eligibilite_regime = '✅ Éligible';
      else if (chiffre_affaires_annuel <= seuil_majore_franchise) eligibilite_regime = '⚠️ Éligible (seuil de tolérance)';
      else eligibilite_regime = '❌ Non éligible (dépassement)';
    } else if (regime_imposition === 'reel_simplifie') {
      if (chiffre_affaires_annuel > seuil_franchise && chiffre_affaires_annuel <= seuil_reel_simplifie) eligibilite_regime = '✅ Éligible';
      else eligibilite_regime = '❌ Non éligible';
    }

    return { montant_ht, montant_tva_collectee, montant_ttc, tva_a_declarer, eligibilite_regime };
  }, [states]);

  const chartData = [
    { name: 'Répartition', 'Montant HT': calculatedOutputs.montant_ht, 'Montant TVA': calculatedOutputs.montant_tva_collectee }
  ];

  const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  const handleExportPDF = useCallback(async () => {
    alert('La génération de PDF est en cours de développement.');
    // jsPDF + html2canvas si/quando necessario
  }, []);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...existingResults].slice(0, 50)));
      alert('Résultat sauvegardé !');
    } catch {
      alert('Impossible de sauvegarder le résultat.');
    }
  }, [slug, title, states, calculatedOutputs]);

  return (
    <>
      <SchemaInjector schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">Estimez la TVA à facturer et à déclarer selon votre régime d'imposition.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {(inputs as InputDef[]).map((input) => {
                // Condizione semplice (supporto OR)
                const conditionMet =
                  !('condition' in input && input.condition) ||
                  (input.condition as string).includes('||')
                    ? (input.condition as string | undefined)
                        ?.split(' || ')
                        .some((cond) => {
                          const [field, , raw] = cond.split(' ');
                          const value = raw?.replace(/'/g, '');
                          return states[field] === value;
                        }) ?? true
                    : (() => {
                        const [field, , raw] = (input as any).condition.split(' ');
                        const value = raw?.replace(/'/g, '');
                        return states[field] === value;
                      })();

                if (!conditionMet) return null;

                const inputLabel = (
                  <label className="block text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {'tooltip' in input && (input as any).tooltip ? (
                      <span className="ml-2">
                        <Tooltip text={(input as any).tooltip as string}>
                          <InfoIcon />
                        </Tooltip>
                      </span>
                    ) : null}
                  </label>
                );

                if (input.type === 'select') {
                  const sel = input as SelectInputDef;
                  const isNumberSelect = sel.valueType === 'number' || (sel.options?.length ? typeof sel.options[0] === 'number' : false);
                  return (
                    <div key={sel.id}>
                      {inputLabel}
                      <select
                        id={sel.id}
                        value={String(states[sel.id])}
                        onChange={(e) => {
                          const raw = e.target.value;
                          handleStateChange(sel.id, isNumberSelect ? Number(raw) : raw);
                        }}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        {sel.options.map((opt) => {
                          const val = String(opt);
                          const label = (sel.labels && sel.labels[val]) ? sel.labels[val] : val;
                          return (
                            <option key={val} value={val}>
                              {label}{sel.unit || ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                }

                // number
                const num = input as NumberInputDef;
                return (
                  <div key={num.id}>
                    {inputLabel}
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        id={num.id}
                        type="number"
                        min={num.min}
                        step={num.step}
                        value={states[num.id] ?? ''}
                        onChange={(e) => handleStateChange(num.id, e.target.value === '' ? '' : Number(e.target.value))}
                        className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={String((states as any)[num.id] ?? '')}
                      />
                      {num.unit && (
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          {num.unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Résultats du Calcul</h2>
              <div className="space-y-3">
                {calculatorData.outputs.map((output) => {
                  const value = (calculatedOutputs as any)[output.id];
                  const isMainResult = output.id === 'tva_a_declarer';
                  return (
                    <div
                      key={output.id}
                      className={`flex items-baseline justify-between p-4 rounded-lg ${
                        isMainResult ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-base font-medium text-gray-700">{output.label}</span>
                      <span className={`text-xl font-bold ${isMainResult ? 'text-indigo-600' : 'text-gray-800'}`}>
                        {isClient ? (typeof value === 'number' ? formatCurrency(value) : value) : '...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualisation HT / TVA</h3>
              <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                <TvaChart data={chartData} />
              </div>
            </div>

            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mt-8">
              <strong>Disclaimer :</strong> Cet outil fournit des estimations à but informatif. Il ne remplace pas l'avis d'un professionnel.
              Les seuils sont basés sur les données pour 2023-2025 et peuvent évoluer.
            </div>
          </div>
        </main>

        <aside className="lg:col-span-2 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button
                onClick={handleSaveResult}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sauvegarder
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exporter PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Réinitialiser
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guide et Explications</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Sources et Références</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a href="https://entreprendre.service-public.fr/vosdroits/F23566" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Service-Public.fr - Régimes d'imposition à la TVA
                </a>
              </li>
              <li>
                <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006292353" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Légifrance - Art. 293 B du Code Général des Impôts
                </a>
              </li>
              <li>
                <a href="https://www.impots.gouv.fr/professionnel/les-regimes-dimposition-la-tva" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Impots.gouv.fr - Les régimes de TVA
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculateurTva;
