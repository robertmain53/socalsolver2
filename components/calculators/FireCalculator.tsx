'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// -------------------- Minimal meta (optional) --------------------
export const meta = {
  title: 'FIRE Calculator',
  description:
    'Plan your Financial Independence (FIRE). Transparent formulas, real-term modeling, Coast FIRE, and a year-by-year projection.'
};

// -------------------- Inline JSON configuration --------------------
const calculatorData = {
  slug: 'fire-calculator',
  category: 'finance-and-investment',
  title: 'FIRE Calculator',
  lang: 'en',
  inputs: [
    { id: 'current_age', label: 'Current age', type: 'number' as const, unit: 'years', min: 16, step: 1, tooltip: 'Your current age in years.' },
    { id: 'retirement_spend_year', label: "Target annual spending in retirement (real, today's €/$)", type: 'number' as const, unit: 'currency', min: 0, step: 500, tooltip: 'Your planned annual spending during retirement, expressed in today’s money (inflation-adjusted).' },
    { id: 'withdrawal_rate', label: 'Safe withdrawal rate', type: 'number' as const, unit: '%', min: 2, step: 0.1, tooltip: 'Annual percentage you plan to withdraw from your portfolio in retirement (e.g., 4%).' },
    { id: 'current_nest_egg', label: 'Current invested assets', type: 'number' as const, unit: 'currency', min: 0, step: 1000, tooltip: 'Liquid, invested assets earmarked for retirement (exclude primary residence unless you plan to draw from it).' },
    { id: 'annual_gross_income', label: 'Annual gross income (real)', type: 'number' as const, unit: 'currency', min: 0, step: 1000, tooltip: 'Your total annual income expressed in today’s money. Used to derive savings contributions.' },
    { id: 'savings_rate', label: 'Savings rate (of income)', type: 'number' as const, unit: '%', min: 0, max: 100, step: 1, tooltip: 'Percent of income you invest each year toward retirement.' },
    { id: 'real_return', label: 'Expected real annual return', type: 'number' as const, unit: '%', min: -10, max: 15, step: 0.25, tooltip: 'Annual portfolio return net of inflation (long-term real return assumption).' },

    { id: 'show_advanced', label: 'Show advanced options', type: 'boolean' as const, tooltip: 'Toggle to reveal advanced levers.' },
    { id: 'income_real_growth', label: 'Real income growth per year', type: 'number' as const, unit: '%', min: -10, max: 15, step: 0.25, condition: 'show_advanced == true', tooltip: 'Annual real growth of income (e.g., promotions). Affects yearly contributions.' },
    { id: 'spend_real_growth', label: 'Real spending growth per year (pre-retirement)', type: 'number' as const, unit: '%', min: -10, max: 15, step: 0.25, condition: 'show_advanced == true', tooltip: 'If your desired retirement lifestyle cost changes over time in real terms.' },
    { id: 'one_time_windfall', label: 'One-time windfall (in year 1)', type: 'number' as const, unit: 'currency', min: 0, step: 1000, condition: 'show_advanced == true', tooltip: 'Optional lump sum you expect to invest once (real terms).' },
    { id: 'existing_passive_income', label: 'Existing reliable passive income (real, per year)', type: 'number' as const, unit: 'currency', min: 0, step: 500, condition: 'show_advanced == true', tooltip: 'Repeatable, inflation-adjusted income you can rely on in retirement (e.g., inflation-linked annuity, rental NOI).' }
  ],
  outputs: [
    { id: 'target_nest_egg', label: 'Target nest egg for FI', unit: 'currency' },
    { id: 'years_to_fi', label: 'Years to reach FI', unit: 'years' },
    { id: 'retirement_age', label: 'Retirement age (FI age)', unit: 'years' },
    { id: 'annual_expenses', label: 'Annual expenses used (real)', unit: 'currency' },
    { id: 'annual_contribution', label: 'Annual contribution (starting)', unit: 'currency' },
    { id: 'coast_fire_age', label: 'Coast FIRE age (stop contributing now)', unit: 'years' },
    { id: 'portfolio_at_fi', label: 'Portfolio value at FI (≈ target)', unit: 'currency' }
  ],
  formulaSteps: [
    { id: 'expenses_net_passive', expr: 'annual_expenses = max(0, retirement_spend_year - existing_passive_income)' },
    { id: 'fi_target', expr: 'target_nest_egg = annual_expenses / (withdrawal_rate / 100)' },
    { id: 'contribution_0', expr: 'annual_contribution_0 = annual_gross_income * (savings_rate / 100)' },
    { id: 'contrib_path', expr: 'annual_contribution_t = annual_contribution_0 * (1 + income_real_growth/100)^(t-1)' },
    { id: 'spend_path', expr: 'annual_expenses_t = annual_expenses * (1 + spend_real_growth/100)^(t-1)' },
    { id: 'portfolio_iter', expr: 'W_0 = current_nest_egg + one_time_windfall; W_t = (W_{t-1} + annual_contribution_t) * (1 + real_return/100)' },
    { id: 'fi_condition', expr: 'First t where W_t >= (annual_expenses_t / (withdrawal_rate/100)) → years_to_fi = t' },
    { id: 'retire_age', expr: 'retirement_age = current_age + years_to_fi' },
    { id: 'coast_fire', expr: 'Solve t for (current_nest_egg * (1 + real_return/100)^t >= target_nest_egg) → coast_fire_age = current_age + t' }
  ],
  examples: [
    {
      inputs: {
        current_age: 35,
        retirement_spend_year: 36000,
        withdrawal_rate: 4,
        current_nest_egg: 100000,
        annual_gross_income: 60000,
        savings_rate: 40,
        real_return: 5,
        show_advanced: false,
        income_real_growth: 0,
        spend_real_growth: 0,
        one_time_windfall: 0,
        existing_passive_income: 0
      },
      outputs: {
        target_nest_egg: 900000,
        years_to_fi: 18,
        retirement_age: 53,
        annual_expenses: 36000,
        annual_contribution: 24000,
        coast_fire_age: 80,
        portfolio_at_fi: 900000
      }
    }
  ],
  tags: 'FIRE calculator, financial independence, retire early, safe withdrawal rate, savings rate, Coast FIRE, Lean FIRE, Fat FIRE, retirement planning, real return',
  content: `# FIRE Calculator: a complete, professional guide

**Model:** real (inflation-adjusted) terms. All inputs and outputs reflect today's purchasing power.

## What this calculator does
- Estimates **years to Financial Independence (FI)** given your income, savings rate, expected real return, and desired retirement spending.
- Computes the **target nest egg** via the Safe Withdrawal framework (spending ÷ withdrawal rate).
- Shows a transparent **year-by-year projection** and an interactive chart.
- Estimates your **Coast FIRE age**—the age at which current assets compound to FI with no further contributions.

## Key assumptions (and why)
1. **Real return**: We model returns net of inflation to keep numbers intuitive and stable across time.
2. **Withdrawal rate**: You pick it (e.g., 3.5–4.0%). Lower rates → bigger nest egg.
3. **Contributions**: Start from income × savings rate and can grow at a chosen *real* pace.
4. **Spending**: You can model real spending drift prior to FI.
5. **Passive income**: Repeatable, inflation-linked income reduces the nest egg required.

## Reading the results
- **Target nest egg** = (retirement spending − passive income) ÷ withdrawal rate.
- **Years to FI** = first year portfolio ≥ target given contributions and real returns.
- **Coast FIRE age** = age if you stopped contributing now and let compounding do the rest.

## Strengths & limitations
This is a planning tool, not a crystal ball. Markets are volatile; sequences of returns, taxes, fees, and personal risk tolerance matter. Use conservative inputs, add margin of safety, and revisit annually.

## Pro tips for better planning
- Stress-test with **lower returns and higher spending**.
- Consider **taxes and fees** (advisory, fund expense ratios, trading).
- Hold a **cash buffer** for downturns to avoid selling at lows.
- Diversify globally; keep costs low; rebalance periodically.

## Glossary
- **Real return**: Return after subtracting inflation.
- **SWR (safe withdrawal rate)**: The sustainable annual draw as a percent of portfolio, historically 3–4% depending on horizon and risk.
- **Coast FIRE**: You have enough now to reach FI without further contributions.

> **Disclaimer**: Educational purposes only. Not investment, tax, or legal advice. Performance is not guaranteed.
`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How is the FI target calculated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'FI target = (retirement spending − reliable passive income) ÷ safe withdrawal rate. All figures are modeled in real (inflation-adjusted) terms.'
        }
      },
      {
        '@type': 'Question',
        name: 'What withdrawal rate should I use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Common planning ranges are 3.0%–4.0% depending on horizon, risk tolerance, fees, and flexibility. Lower rates increase the required nest egg and margin of safety.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is Coast FIRE?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Coast FIRE is the point where your current invested assets, left alone to compound at your assumed real return, will reach your FI target by your desired age without further contributions.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does this include taxes and fees?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'The model uses pre-tax income and real returns. For a conservative plan, reduce expected returns to account for fees/taxes and model spending net of taxes.'
        }
      }
    ]
  }
} as const;

// -------------------- Icons & Tooltip --------------------
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// -------------------- Schema Injector --------------------
const SchemaInjector = ({ schema }: { schema: any }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// -------------------- Content Renderer (basic Markdown to HTML) --------------------
const ContentRenderer = ({ content }: { content: string }) => {
  const html = useMemo(() => {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // super-lightweight Markdown handling
    return content
      .replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold mb-3">$1</h1>')
      .replace(/^## (.*)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^\- (.*)$/gm, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded">$1</code>')
      .replace(/(^|\n)> (.*)/g, '$1<blockquote class="border-l-4 pl-3 text-gray-600 italic my-3">$2</blockquote>')
      .replace(/\n\n/g, '<br/><br/>');
  }, [content]);
  return <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: html }} />;
};

// -------------------- Lazy-loaded Chart (no SSR) --------------------
type Point = { year: number; portfolio: number; target: number; contrib: number };
const GrowthChart = dynamic(async () => {
  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip: RTooltip, Legend, ReferenceLine } = await import('recharts');
  const ChartComp = ({ data }: { data: Point[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 18, bottom: 4, left: -8 }}>
        <XAxis dataKey="year" />
        <YAxis tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
        <RTooltip formatter={(v: any) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(v))} />
        <Legend />
        <Area type="monotone" dataKey="portfolio" name="Portfolio" fillOpacity={0.2} strokeWidth={2} />
        <Area type="monotone" dataKey="target" name="Target" fillOpacity={0.1} strokeWidth={2} />
        <ReferenceLine y={0} />
      </AreaChart>
    </ResponsiveContainer>
  );
  return ChartComp;
}, { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">Loading chart…</div> });

// -------------------- Utils --------------------
const toCurrency = (value: number, currency: string = 'EUR') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const parseCondition = (condition: string | undefined, state: Record<string, any>) => {
  if (!condition) return true;
  // supports patterns like "show_advanced == true"
  const [key, , rawVal] = condition.split(/\s+/);
  if (!(key in state)) return false;
  const wanted = rawVal === 'true' ? true : rawVal === 'false' ? false : rawVal;
  return state[key] === wanted;
};

// -------------------- Component --------------------
function GeneratedCalculator(): JSX.Element {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;

  // client-only hydration guard
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // sensible defaults
  const initial = {
    current_age: 35,
    retirement_spend_year: 36000,
    withdrawal_rate: 4,
    current_nest_egg: 100000,
    annual_gross_income: 60000,
    savings_rate: 40,
    real_return: 5,
    show_advanced: false,
    income_real_growth: 0,
    spend_real_growth: 0,
    one_time_windfall: 0,
    existing_passive_income: 0
  };
  const [state, setState] = useState<any>(initial);
  const ref = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((id: string, value: any) => {
    setState((prev: any) => ({ ...prev, [id]: value }));
  }, []);

  const handleReset = useCallback(() => setState(initial), []);

  const results = useMemo(() => {
    const current_age = Number(state.current_age) || 0;
    const retirement_spend_year = Math.max(0, Number(state.retirement_spend_year) || 0);
    const withdrawal_rate = Math.max(0.1, Number(state.withdrawal_rate) || 0.1);
    const current_nest_egg = Math.max(0, Number(state.current_nest_egg) || 0);
    const annual_gross_income = Math.max(0, Number(state.annual_gross_income) || 0);
    const savings_rate = Math.min(100, Math.max(0, Number(state.savings_rate) || 0));
    const real_return = Number(state.real_return) || 0;
    const income_real_growth = Number(state.income_real_growth) || 0;
    const spend_real_growth = Number(state.spend_real_growth) || 0;
    const one_time_windfall = Math.max(0, Number(state.one_time_windfall) || 0);
    const existing_passive_income = Math.max(0, Number(state.existing_passive_income) || 0);

    const annual_expenses_0 = Math.max(0, retirement_spend_year - existing_passive_income);
    const target_nest_egg_0 = annual_expenses_0 / (withdrawal_rate / 100);
    const contrib0 = annual_gross_income * (savings_rate / 100);

    // iterate year by year (max 120 years to be safe)
    let W = current_nest_egg + (one_time_windfall || 0);
    let t = 0;
    const maxYears = 120;
    let hitFIYear: number | null = null;

    const series: Point[] = [];
    while (t <= maxYears) {
      const yearIndex = t + 1;
      const contrib_t = contrib0 * Math.pow(1 + income_real_growth / 100, Math.max(0, t)); // t=0 → year1
      const spend_t = annual_expenses_0 * Math.pow(1 + spend_real_growth / 100, Math.max(0, t));
      const target_t = spend_t / (withdrawal_rate / 100);

      series.push({ year: t, portfolio: W, target: target_t, contrib: contrib_t });

      if (W >= target_t && hitFIYear === null && t > 0) {
        hitFIYear = t;
        break;
      }

      // next year wealth
      W = (W + contrib_t) * (1 + real_return / 100);
      t += 1;
    }

    // Coast FIRE solution (stop contributing now)
    let coastAge: number | null = null;
    if (current_nest_egg > 0 && real_return !== 0) {
      const tCoast = Math.log(target_nest_egg_0 / Math.max(1e-9, current_nest_egg)) / Math.log(1 + real_return / 100);
      if (isFinite(tCoast) && tCoast >= 0) {
        coastAge = current_age + tCoast;
      }
    } else if (current_nest_egg >= target_nest_egg_0) {
      coastAge = current_age;
    }

    const years_to_fi = hitFIYear ?? null;
    const retirement_age = years_to_fi !== null ? current_age + years_to_fi : null;

    return {
      chart: series,
      computed: {
        target_nest_egg: target_nest_egg_0,
        years_to_fi,
        retirement_age,
        annual_expenses: annual_expenses_0,
        annual_contribution: contrib0,
        coast_fire_age: coastAge,
        portfolio_at_fi: years_to_fi !== null ? series[years_to_fi]?.portfolio ?? W : W
      }
    };
  }, [state]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('PDF export is unavailable in this environment.');
    }
  }, [slug]);

  const handleSave = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        ts: Date.now(),
        inputs: state,
        outputs: results.computed
      };
      const key = 'calc_results';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([payload, ...prev].slice(0, 50)));
      alert('Result saved locally.');
    } catch {
      alert('Unable to save locally.');
    }
  }, [state, results, slug, title]);

  const currency = 'EUR'; // adjust to project setting or user locale

  // handy renderer
  const renderValue = (id: string) => {
    const v = (results.computed as any)[id];
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    if (['target_nest_egg', 'annual_expenses', 'annual_contribution', 'portfolio_at_fi'].includes(id)) {
      return isClient ? toCurrency(Number(v), currency) : '…';
    }
    if (['years_to_fi'].includes(id)) {
      return Number.isFinite(v) ? `${v}` : '—';
    }
    if (['retirement_age', 'coast_fire_age'].includes(id)) {
      return Number.isFinite(v) ? `${v.toFixed(1).replace(/\\.0$/, '')}` : '—';
    }
    return `${v}`;
  };

  return (
    <>
      <SchemaInjector schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-6" ref={ref}>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
              <p className="text-gray-600 mb-4">{meta.description}</p>

              <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Disclaimer:</strong> Educational tool only. Not investment, tax, or legal advice. Returns, inflation and spending can differ materially from assumptions.
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border">
                {inputs.map((input) => {
                  const visible = parseCondition((input as any).condition, state);
                  if (!visible) return null;

                  const commonLabel = (
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {(input as any).tooltip && (
                        <span className="ml-2">
                          <Tooltip text={(input as any).tooltip}>
                            <span><InfoIcon /></span>
                          </Tooltip>
                        </span>
                      )}
                    </label>
                  );

                  if (input.type === 'boolean') {
                    return (
                      <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                        <input
                          id={input.id}
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={!!state[input.id]}
                          onChange={(e) => handleChange(input.id, e.target.checked)}
                        />
                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                      </div>
                    );
                  }

                  return (
                    <div key={input.id}>
                      {commonLabel}
                      <div className="flex items-center gap-2">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          type="number"
                          min={(input as any).min}
                          step={(input as any).step}
                          value={state[input.id]}
                          onChange={(e) => handleChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                        />
                        {(input as any).unit && <span className="text-sm text-gray-500">{(input as any).unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Outputs */}
              <div className="mt-8 space-y-3">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Results</h2>
                {outputs.map((o) => (
                  <div
                    key={o.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${o.id === 'years_to_fi' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}
                  >
                    <div className="text-sm md:text-base font-medium text-gray-700">{o.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${o.id === 'years_to_fi' ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {renderValue(o.id)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Portfolio vs Target (real terms)</h3>
                <div className="h-72 w-full bg-gray-50 p-2 rounded-xl border">
                  {isClient ? <GrowthChart data={results.chart} /> : <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">Preparing chart…</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="mt-6 border rounded-xl shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-800">Formula (transparent)</h3>
            <pre className="text-xs text-gray-700 mt-2 p-3 bg-gray-50 rounded overflow-auto">
{`annual_expenses = max(0, retirement_spend_year - existing_passive_income)
target_nest_egg = annual_expenses / (withdrawal_rate / 100)
annual_contribution_t = (annual_gross_income * savings_rate/100) * (1 + income_real_growth/100)^(t-1)
annual_expenses_t = annual_expenses * (1 + spend_real_growth/100)^(t-1)
W_0 = current_nest_egg + one_time_windfall
W_t = (W_{t-1} + annual_contribution_t) * (1 + real_return/100)
First t with W_t >= (annual_expenses_t / (withdrawal_rate/100)) → Years to FI`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              All values are modeled in real, inflation-adjusted terms.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-xl p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-900">Utilities</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleSave} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
            </div>
          </section>

          <section className="border rounded-xl p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-900">Guide</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

          <section className="border rounded-xl p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-900">Further reading (authoritative)</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.bogleheads.org/wiki/Safe_withdrawal_rates" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Bogleheads Wiki – Safe withdrawal rates</a></li>
              <li><a href="https://www.cfainstitute.org/en/research/foundation/2018/retirement-security-in-a-world-of-inequality" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">CFA Institute – Retirement research</a></li>
              <li><a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=56686" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Bengen (1994) – Initial withdrawal rates</a></li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">Links are for context; this tool does not endorse any provider.</p>
          </section>
        </aside>
      </div>
    </>
  );
}

// Programmatic component name from slug (for devtools/readability)
const componentName = calculatorData.slug
  .split('-')
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join('');
(GeneratedCalculator as any).displayName = componentName;

export default GeneratedCalculator;
