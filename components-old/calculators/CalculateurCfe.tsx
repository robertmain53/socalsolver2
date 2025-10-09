'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// -- Icona Tooltip (inline, no deps) --
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// -- Tooltip wrapper --
const Tooltip = ({ text, children }: { text?: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    {text ? (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
        {text}
      </div>
    ) : null}
  </div>
);

// -- ContentRenderer (mini markdown subset) --
const ContentRenderer = ({ content }: { content: string }) => {
  const fmt = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
  const blocks = content.split('\n').reduce<string[]>((acc, line) => {
    if (acc.length === 0) return [line];
    const last = acc[acc.length - 1];
    if (line.trim() === '') acc.push('');
    else acc[acc.length - 1] = last === '' ? line : `${last}\n${line}`;
    return acc;
  }, []);

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: fmt(t.replace(/^##\s*/, '')) }} />;
        if (t.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-5 mb-2" dangerouslySetInnerHTML={{ __html: fmt(t.replace(/^###\s*/, '')) }} />;
        if (/^\-\s+/.test(t)) {
          const items = t.split('\n').map(l => l.replace(/^\-\s+/, ''));
          return (
            <ul key={i} className="list-disc pl-5 space-y-1 my-3">
              {items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: fmt(it) }} />)}
            </ul>
          );
        }
        return <p key={i} className="mb-3" dangerouslySetInnerHTML={{ __html: fmt(t) }} />;
      })}
    </div>
  );
};

// -- Schema injector --
const SchemaInjector = ({ schema }: { schema: any }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// -- Dati di configurazione (incorporati) --
const calculatorData = {
  slug: 'calculateur-acre',
  category: 'Fiscalité et travail indépendant',
  title: "Calculateur de l'ACRE (Aide à la Création ou à la Reprise d'une Entreprise)",
  lang: 'fr',
  inputs: [
    { id: 'regime', label: 'Régime', type: 'select', options: [{ value: 'micro', label: 'Micro-entrepreneur' }, { value: 'autres', label: 'Entreprise individuelle (réel) / Dirigeant de société' }], tooltip: 'Choisissez votre régime social au démarrage pour appliquer les règles ACRE correspondantes.' },
    { id: 'date_debut', label: "Date de début d'activité (immatriculation)", type: 'date', tooltip: 'Cette date déclenche la période d’exonération ACRE.' },
    { id: 'nature_activite', label: "Nature de l'activité (micro)", type: 'select', options: [{ value: 'vente', label: 'Vente de marchandises' }, { value: 'services_bic', label: 'Prestations de services BIC' }, { value: 'liberal_bnc', label: 'Activité libérale BNC' }], condition: "regime == 'micro'", tooltip: "Les taux de cotisations micro varient selon la nature de l’activité." },
    { id: 'ca_estime', label: "Chiffre d'affaires estimé sur 12 mois (micro)", type: 'number', unit: '€', min: 0, step: 100, condition: "regime == 'micro'", tooltip: 'Base de calcul des cotisations micro (URSSAF) — le CA et non le bénéfice.' },
    { id: 'taux_micro_vente', label: 'Taux micro — vente', type: 'number', unit: '%', min: 0, step: 0.1, default: 12.3, condition: "regime == 'micro'", tooltip: 'Taux 2025 indicatif. Modifiez si nécessaire.' },
    { id: 'taux_micro_services_bic', label: 'Taux micro — services BIC', type: 'number', unit: '%', min: 0, step: 0.1, default: 21.2, condition: "regime == 'micro'", tooltip: 'Taux 2025 indicatif. Modifiez si nécessaire.' },
    { id: 'taux_micro_liberal_bnc', label: 'Taux micro — libéral BNC', type: 'number', unit: '%', min: 0, step: 0.1, default: 24.6, condition: "regime == 'micro'", tooltip: 'Taux 2025 indicatif. Modifiez si nécessaire.' },
    { id: 'pass_annee', label: 'PASS (Plafond annuel Sécurité sociale)', type: 'number', unit: '€', min: 0, step: 50, default: 47100, condition: "regime == 'autres'", tooltip: 'Valeur 2025 indicative pour le calcul (75 % / 100 % du PASS).' },
    { id: 'revenu_professionnel', label: 'Revenu professionnel estimé (12 mois)', type: 'number', unit: '€', min: 0, step: 100, condition: "regime == 'autres'", tooltip: 'Base du test d’exonération ACRE hors micro.' },
    { id: 'cotisations_base_eligibles', label: 'Cotisations annuelles éligibles à l’ACRE', type: 'number', unit: '€', min: 0, step: 50, condition: "regime == 'autres'", tooltip: 'Montant des cotisations pouvant être exonérées (maladie, AF, vieillesse de base, invalidité-décès).'}
  ],
  outputs: [
    { id: 'duree_exo_mois', label: "Durée d'exonération ACRE (mois)", unit: 'mois' },
    { id: 'date_fin_exo', label: "Fin de période ACRE", unit: '' },
    { id: 'cotisations_sans_acre', label: 'Cotisations sur 12 mois — sans ACRE', unit: '€' },
    { id: 'cotisations_avec_acre', label: 'Cotisations sur 12 mois — avec ACRE', unit: '€' },
    { id: 'economie_totale', label: 'Économie totale liée à l’ACRE', unit: '€' },
    { id: 'taux_exoneration_autres', label: "Taux d'exonération (régimes hors micro)", unit: '%' }
  ],
  content: "## À propos de l'ACRE (mise à jour 2025)\n\n**L'ACRE** offre une exonération temporaire de cotisations sociales en début d'activité. Les règles diffèrent selon le régime :\n\n- **Micro-entrepreneur** : exonération de **50 %** des cotisations (taux micro URSSAF) **jusqu'à la fin du 3ᵉ trimestre civil suivant** la date de début d'activité. Selon la date d'immatriculation, cela représente environ **3 à ~12 mois**.\n- **Autres régimes (réel/dirigeant)** : exonération sur certaines cotisations **pendant 12 mois**. Le taux d'exonération dépend du **revenu professionnel** par rapport au **PASS** : **100 %** si ≤ 75 % du PASS, **dégressif** entre 75 % et 100 % du PASS, **0 %** au-delà.\n\n### Ce que couvre (et ne couvre pas) l'ACRE\nL'exonération porte typiquement sur : maladie-maternité, invalidité-décès, allocations familiales, vieillesse de base. Elle **n'inclut généralement pas** : **CSG-CRDS**, accidents du travail, **retraite complémentaire**, contribution à la formation professionnelle, versement transport, FNAL.\n\n### Conseils pratiques (micro)\n- Démarrer au **début d'un trimestre civil** (janvier/avril/juillet/octobre) maximise la durée.\n- Vérifiez vos **taux URSSAF** par nature d'activité ; en 2025, repères usuels : **12,3 %** (vente), **21,2 %** (services BIC), **jusqu'à 24,6 %** (libéral BNC).\n\n### ARCE vs ACRE (rappel)\nL'**ARCE** est une **aide financière** (versement d'une partie de l'ARE) ; elle **suppose l'ACRE** et suit un calendrier de versements spécifique. Ce calculateur ne simule pas l'ARCE mais vous indique l'impact ACRE sur vos cotisations.\n\n> **Avertissement** : ce simulateur fournit une **estimation**. Référez-vous aux sources officielles (URSSAF, Service-Public).",
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Combien de temps dure l'ACRE pour un micro-entrepreneur ?", "acceptedAnswer": { "@type": "Answer", "text": "Jusqu'à la fin du 3e trimestre civil suivant la date de début d'activité (≈ 3 à ~12 mois selon la date d'immatriculation)." } },
      { "@type": "Question", "name": "Quel est le taux de réduction ACRE pour le micro ?", "acceptedAnswer": { "@type": "Answer", "text": "Réduction de 50 % du taux de cotisations micro (URSSAF) sur la période d'exonération." } },
      { "@type": "Question", "name": "Comment se calcule l'ACRE hors micro ?", "acceptedAnswer": { "@type": "Answer", "text": "Sur 12 mois : exonération 100 % si le revenu professionnel est ≤ 75 % du PASS, dégressive entre 75 % et 100 %, nulle au-delà (sur certaines cotisations seulement)." } },
      { "@type": "Question", "name": "L'ACRE inclut-elle la CSG-CRDS ?", "acceptedAnswer": { "@type": "Answer", "text": "Non, la CSG-CRDS n'est pas couverte par l'ACRE." } },
      { "@type": "Question", "name": "Puis-je cumuler ACRE et ARCE ?", "acceptedAnswer": { "@type": "Answer", "text": "L'ARCE nécessite l'ACRE, mais c'est un dispositif distinct (versement d'une partie de l'ARE)." } }
    ]
  }
} as const;

// -- Helper: format & name from slug --
const toPascal = (slug: string) =>
  slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
const ComponentName = `${toPascal(calculatorData.slug)}`;

// -- Lazy chart (client-only) using dynamic import of 'recharts' --
const BarComparison: React.ComponentType<{ data: any[]; formatCurrency: (n: number) => string }> = dynamic(
  () =>
    import('recharts').then(mod => {
      const Comp = ({ data, formatCurrency }: { data: any[]; formatCurrency: (n: number) => string }) => {
        const BarChart = mod.BarChart as any;
        const Bar = mod.Bar as any;
        const XAxis = mod.XAxis as any;
        const YAxis = mod.YAxis as any;
        const TooltipR = mod.Tooltip as any;
        const ResponsiveContainer = mod.ResponsiveContainer as any;
        const Cell = mod.Cell as any;

        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 16, left: -10, bottom: 8 }}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v: number) => `€${Math.round(v / 1000)}k`} />
              <TooltipR formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="Sans ACRE" name="Sans ACRE">
                {data.map((_, i) => <Cell key={`c1-${i}`} />)}
              </Bar>
              <Bar dataKey="Avec ACRE" name="Avec ACRE">
                {data.map((_, i) => <Cell key={`c2-${i}`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      };
      return { default: Comp };
    }),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse bg-gray-100 rounded-lg" /> }
);

// -- Main component --
const DynamicAcreCalculator: React.FC = () => {
  const { title, inputs, outputs, content, seoSchema } = calculatorData;
  const [isClient, setIsClient] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // initial state
  const initial = {
    regime: 'micro',
    date_debut: new Date().toISOString().slice(0, 10),
    nature_activite: 'services_bic',
    ca_estime: 60000,
    taux_micro_vente: 12.3,
    taux_micro_services_bic: 21.2,
    taux_micro_liberal_bnc: 24.6,
    pass_annee: 47100,
    revenu_professionnel: 32000,
    cotisations_base_eligibles: 9000
  } as Record<string, any>;

  const [state, setState] = useState<Record<string, any>>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('acre_calc_state') : null;
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (isClient) localStorage.setItem('acre_calc_state', JSON.stringify(state));
  }, [isClient, state]);

  const parseDate = (s: string) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return new Date();
    return d;
  };

  const endOfQuarter = (d: Date) => {
    const q = Math.floor(d.getMonth() / 3); // 0..3
    const next3 = (q + 3) % 4;
    const yearOffset = q <= 0 ? 0 : 0; // placeholder
    let year = d.getFullYear();
    // three quarters following:
    let targetQ = q + 3;
    while (targetQ > 3) { targetQ -= 4; year += 1; }
    const monthEnd = [2, 5, 8, 11][targetQ]; // Mar, Jun, Sep, Dec
    const lastDay = new Date(year, monthEnd + 1, 0).getDate();
    return new Date(year, monthEnd, lastDay);
  };

  const monthsBetweenInclusive = (start: Date, end: Date) => {
    const s = new Date(start.getFullYear(), start.getMonth(), 1);
    const e = new Date(end.getFullYear(), end.getMonth(), 1);
    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
    return Math.max(0, months);
  };

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Math.round((n + Number.EPSILON) * 100) / 100);

  const conditionOk = (cond?: string) => {
    if (!cond) return true;
    try {
      // very small safe parser:
      // supports patterns like "regime == 'micro'"
      const [l, , r] = cond.split(' ');
      const lv = state[l];
      const rv = r?.replace(/^'|"$|^"|'$/g, '').replace(/'|"/g, '');
      return String(lv) === rv;
    } catch { return true; }
  };

  const calc = useMemo(() => {
    const regime = state.regime as 'micro' | 'autres';
    const dateDebut = parseDate(state.date_debut);
    let dureeExoMois = 0;
    let dateFinExo = '';
    let cotSans = 0;
    let cotAvec = 0;
    let tauxExoAutres = 0;

    if (regime === 'micro') {
      const fin = endOfQuarter(dateDebut); // fin du 3e trimestre suivant
      dureeExoMois = monthsBetweenInclusive(dateDebut, fin);
      dateFinExo = fin.toISOString().slice(0, 10);

      const nature = state.nature_activite as 'vente' | 'services_bic' | 'liberal_bnc';
      const taux = (nature === 'vente' ? state.taux_micro_vente : nature === 'services_bic' ? state.taux_micro_services_bic : state.taux_micro_liberal_bnc) / 100;
      const ca = Number(state.ca_estime) || 0;

      cotSans = ca * taux;
      const partExo = Math.min(1, Math.max(0, dureeExoMois / 12));
      const tauxEffectif = partExo * (taux * 0.5) + (1 - partExo) * taux;
      cotAvec = ca * tauxEffectif;

    } else {
      // 12 mois, taux exo selon PASS
      dureeExoMois = 12;
      const pass = Number(state.pass_annee) || 47100;
      const rev = Number(state.revenu_professionnel) || 0;
      const base = Number(state.cotisations_base_eligibles) || 0;

      if (rev <= 0.75 * pass) tauxExoAutres = 1;
      else if (rev >= 1 * pass) tauxExoAutres = 0;
      else tauxExoAutres = (1 * pass - rev) / (0.25 * pass); // linéaire entre 0.75 et 1 PASS

      cotSans = base;
      cotAvec = base * (1 - tauxExoAutres);
      dateFinExo = new Date(dateDebut.getFullYear(), dateDebut.getMonth() + 11, 1).toISOString().slice(0, 10);
    }

    const economie = Math.max(0, cotSans - cotAvec);

    return {
      duree_exo_mois: dureeExoMois,
      date_fin_exo: dateFinExo,
      cotisations_sans_acre: cotSans,
      cotisations_avec_acre: cotAvec,
      economie_totale: economie,
      taux_exoneration_autres: Math.round(((regime === 'autres' ? 100 * (1 - (cotAvec / (cotSans || 1))) : 0) + Number.EPSILON) * 100) / 100
    };
  }, [state]);

  const handleChange = (id: string, val: any) => setState(prev => ({ ...prev, [id]: val }));

  const handleReset = () => setState(initial);

  const handleSave = useCallback(() => {
    try {
      const payload = { ts: Date.now(), inputs: state, outputs: calc, slug: calculatorData.slug, title: calculatorData.title };
      const key = 'acre_results';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([payload, ...prev].slice(0, 50)));
      alert('Résultat sauvegardé.');
    } catch {
      alert('Impossible de sauvegarder.');
    }
  }, [state, calc]);

  const handlePDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`${calculatorData.slug}.pdf`);
    } catch {
      alert('Export PDF indisponible dans cet environnement.');
    }
  }, []);

  const chartData = useMemo(() => ([
    { name: 'Cotisations', 'Sans ACRE': calc.cotisations_sans_acre, 'Avec ACRE': calc.cotisations_avec_acre }
  ]), [calc]);

  const formulaTxt =
    "Micro: taux_effectif = (mois_exo/12)×(taux_micro×50%) + (1 - mois_exo/12)×taux_micro; " +
    "Autres: exonération = 100% si revenu ≤ 75% PASS; linéaire jusqu’à 0% à 100% PASS (12 mois).";

  return (
    <>
      <SchemaInjector schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6 bg-gray-50">
        <div className="lg:col-span-2">
          <div ref={ref} className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 mb-4">
              Estimez l’impact de l’ACRE sur vos cotisations en fonction de votre régime et de vos paramètres d’activité.
            </p>

            <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer :</strong> simulateur informatif. Les règles peuvent évoluer. Référez-vous aux textes officiels.
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
              {inputs.map((inp) => {
                if (!conditionOk((inp as any).condition)) return null;
                const label = (
                  <label htmlFor={inp.id} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    {inp.label}
                    {inp.tooltip && (
                      <Tooltip text={inp.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                    )}
                  </label>
                );

                if (inp.type === 'select') {
                  return (
                    <div key={inp.id}>
                      {label}
                      <select
                        id={inp.id}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                        value={state[inp.id]}
                        onChange={(e) => handleChange(inp.id, e.target.value)}
                      >
                        {(inp as any).options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  );
                }

                if (inp.type === 'date') {
                  return (
                    <div key={inp.id}>
                      {label}
                      <input
                        id={inp.id}
                        type="date"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                        value={state[inp.id]}
                        onChange={(e) => handleChange(inp.id, e.target.value)}
                      />
                    </div>
                  );
                }

                if (inp.type === 'number') {
                  return (
                    <div key={inp.id}>
                      {label}
                      <div className="flex items-center gap-2">
                        <input
                          id={inp.id}
                          type="number"
                          min={(inp as any).min}
                          step={(inp as any).step}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                          value={state[inp.id]}
                          onChange={(e) => handleChange(inp.id, e.target.value === '' ? '' : Number(e.target.value))}
                        />
                        {(inp as any).unit && <span className="text-sm text-gray-500">{(inp as any).unit}</span>}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Results */}
            <div className="mt-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Résultats</h2>
              {outputs.map((o) => (
                <div
                  key={o.id}
                  className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${
                    o.id === 'economie_totale' ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">{o.label}</div>
                  <div className={`text-lg font-bold ${o.id === 'economie_totale' ? 'text-emerald-700' : 'text-gray-900'}`}>
                    {isClient ? (
                      o.unit === '€'
                        ? fmtCurrency((calc as any)[o.id])
                        : o.unit === 'mois'
                          ? (calc as any)[o.id]
                          : o.id === 'taux_exoneration_autres'
                            ? `${(calc as any)[o.id].toFixed(2)} %`
                            : (calc as any)[o.id]
                    ) : '...'}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Comparaison cotisations (12 mois)</h3>
              <div className="h-64 w-full bg-gray-50 rounded-lg">
                {isClient && <BarComparison data={chartData} formatCurrency={fmtCurrency} />}
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="mt-6 border rounded-lg shadow-sm p-4 bg-white">
            <h3 className="font-semibold text-gray-800">Formule appliquée</h3>
            <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaTxt}</p>
            <p className="text-xs text-gray-500 mt-2">
              Note : simplification pédagogique des règles ACRE (micro : réduction 50 % jusqu’à fin du 3ᵉ trimestre civil suivant ; autres régimes : test PASS).
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold mb-2 text-gray-800">Outils</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleSave}
                      className="w-full border rounded-md px-3 py-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Sauvegarder
              </button>
              <button onClick={handlePDF}
                      className="w-full border rounded-md px-3 py-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Export PDF
              </button>
              <button onClick={handleReset}
                      className="col-span-2 w-full border rounded-md px-3 py-2 hover:bg-red-50 text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                Réinitialiser
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold mb-2 text-gray-800">Guide</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold mb-2 text-gray-800">Sources officielles</h2>
            <ul className="list-disc pl-5 text-sm text-indigo-700 space-y-1">
              <li><a className="hover:underline" target="_blank" rel="noopener noreferrer"
                     href="https://www.service-public.fr/particuliers/vosdroits/F11677">Service-Public : Aide à la création ou à la reprise d'une entreprise (ACRE)</a></li>
              <li><a className="hover:underline" target="_blank" rel="noopener noreferrer"
                     href="https://entreprendre.service-public.fr/vosdroits/F11677">Entreprendre.Service-Public : ACRE (fiche complète)</a></li>
              <li><a className="hover:underline" target="_blank" rel="noopener noreferrer"
                     href="https://www.urssaf.fr/accueil/exoneration-acre-createur.html">URSSAF : Exonération ACRE (créateurs)</a></li>
              <li><a className="hover:underline" target="_blank" rel="noopener noreferrer"
                     href="https://entreprendre.service-public.fr/vosdroits/F15252">Service-Public : ARCE (pour comparaison)</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

// -- Export component with dynamic name derived from slug --
const components: Record<string, React.FC> = { [ComponentName]: DynamicAcreCalculator };
export default components[ComponentName];
