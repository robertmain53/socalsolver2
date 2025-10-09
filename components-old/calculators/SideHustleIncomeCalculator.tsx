'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// -------------------- Icons & Small UI --------------------
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

// -------------------- Lightweight Markdown Renderer --------------------
const ContentRenderer = ({ content }: { content: string }) => {
  const fmt = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');

  const blocks = content.split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith('### ')) {
          return (
            <h3 key={i}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: fmt(t.replace(/^###\s+/, '')) }} />
          );
        }
        if (t.startsWith('#### ')) {
          return (
            <h4 key={i}
              className="text-lg font-semibold mt-4 mb-3"
              dangerouslySetInnerHTML={{ __html: fmt(t.replace(/^####\s+/, '')) }} />
          );
        }
        if (t.startsWith('* ')) {
          const items = t.split('\n').map(li => li.replace(/^\*\s*/, ''));
          return (
            <ul key={i} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((li, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: fmt(li) }} />
              ))}
            </ul>
          );
        }
        return <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: fmt(t) }} />;
      })}
    </div>
  );
};

// -------------------- Calculator Data (self-contained) --------------------
const calculatorData = {
  slug: "side-hustle-income-calculator",
  category: "Finance and Investment",
  title: "Side Hustle Income Calculator",
  lang: "en",
  inputs: [
    { id: "monthly_revenue", label: "Average monthly gross revenue", type: "number" as const, unit: "$", min: 0, step: 50, tooltip: "Total invoices/payouts before any fees or expenses." },
    { id: "platform_fee_pct", label: "Platform/processor fees", type: "number" as const, unit: "%", min: 0, step: 0.1, tooltip: "Sum of marketplace + payment processor fee as % of revenue." },
    { id: "other_variable_cost_pct", label: "Other variable cost rate", type: "number" as const, unit: "%", min: 0, step: 0.1, tooltip: "Consumables, packaging, COGS proportional to revenue." },
    { id: "fixed_expenses_month", label: "Fixed monthly expenses", type: "number" as const, unit: "$", min: 0, step: 10, tooltip: "Subscriptions, tools, insurance and other fixed overheads." },
    { id: "has_mileage", label: "Track business mileage?", type: "boolean" as const, tooltip: "Deduct mileage at a standard rate if applicable." },
    { id: "mileage_per_month", label: "Business miles per month", type: "number" as const, unit: "mi", min: 0, step: 10, condition: "has_mileage == true", tooltip: "Average monthly business mileage travelled." },
    { id: "mileage_rate", label: "Mileage deduction rate", type: "number" as const, unit: "$/mi", min: 0, step: 0.01, condition: "has_mileage == true", tooltip: "Standard mileage deduction per mile (e.g., US IRS standard rate)." },
    { id: "has_home_office", label: "Home office deduction?", type: "boolean" as const, tooltip: "Apply a proportional portion of rent & utilities." },
    { id: "home_office_pct", label: "Home office percentage", type: "number" as const, unit: "%", min: 0, max: 50, step: 1, condition: "has_home_office == true", tooltip: "Portion of your home used regularly and exclusively for business." },
    { id: "rent_util_month", label: "Monthly rent + utilities", type: "number" as const, unit: "$", min: 0, step: 10, condition: "has_home_office == true", tooltip: "Only used to compute the home office allocation." },
    { id: "marginal_tax_rate_pct", label: "Marginal income tax rate", type: "number" as const, unit: "%", min: 0, max: 60, step: 0.5, tooltip: "Top rate that applies to your next dollar of income." },
    { id: "self_employment_rate_pct", label: "Self-employment/NI/SSC rate", type: "number" as const, unit: "%", min: 0, max: 25, step: 0.5, tooltip: "Social security / National Insurance contributions on self-employment." },
    { id: "target_monthly_takehome", label: "Target monthly take-home (after tax)", type: "number" as const, unit: "$", min: 0, step: 50, tooltip: "We’ll estimate the gross revenue needed to reach this net target." }
  ],
  outputs: [
    { id: "annual_revenue", label: "Annual revenue", unit: "$" },
    { id: "annual_expenses", label: "Annual expenses (deductible)", unit: "$" },
    { id: "annual_net_profit", label: "Annual net profit (before tax)", unit: "$" },
    { id: "annual_taxes", label: "Estimated annual taxes", unit: "$" },
    { id: "annual_take_home", label: "Annual take-home (after tax)", unit: "$" },
    { id: "monthly_take_home", label: "Monthly take-home (after tax)", unit: "$" },
    { id: "effective_tax_rate_pct", label: "Effective tax rate on profit", unit: "%" },
    { id: "required_monthly_revenue_for_target", label: "Required monthly revenue to hit target", unit: "$" }
  ],
  content: `### **Side Hustle Income & Take-Home Calculator**

This tool estimates your side-hustle **net profit and take-home pay** after fees, expenses, and taxes. It’s designed for creators, gig workers, consultants, and micro-business owners who want a transparent breakdown and a clear **revenue target** to hit a desired monthly net.

---

#### **What you can control**
* **Platform/processor fees** – % of revenue (marketplace fees, card fees).
* **Variable costs** – COGS, packaging, shipping, ad spend tied to sales.
* **Fixed costs** – software, insurance, equipment leases.
* **Mileage & home-office** – optional deductions when eligible.

#### **Tax model (conservative & adjustable)**
We use **your marginal tax rate** plus a **self-employment/NI/SSC rate** to approximate total taxes on profit. This avoids country-specific guesswork while keeping the estimate decision-grade. If you know your true effective rates, plug them in.

#### **Formulas (overview)**
* Annual revenue = monthly revenue × 12
* Variable costs = revenue × (platform fee % + other variable %)
* Annual expenses = variable costs + fixed expenses + mileage + home office
* Net profit = revenue − expenses
* Estimated taxes = net profit × (marginal + SE/NI/SSC)
* Take-home = net profit − taxes
* **Required monthly revenue** to reach a net target:
  \\( \\text{ReqRev} = \\frac{T_\\text{net}\\times 12 + \\text{fixed} + \\text{mileage} + \\text{homeOffice}}{1 - (\\text{variable\\%} + \\text{tax\\%})} / 12 \\)

> **Disclaimer**: Educational estimates only. Not tax advice. Rules and eligibility for deductions vary by jurisdiction.

---

### **How to use**
1. Enter your **average monthly revenue**.
2. Add your **fees**, **variable cost %**, and **fixed costs**.
3. Toggle **mileage/home-office** if eligible.
4. Set your **marginal tax** and **self-employment/NI/SSC** rate.
5. (Optional) Provide a **target monthly take-home** to get a **required revenue** goal.

### **Interpreting results**
* **Effective tax rate** is on **profit**, not on revenue.
* If your **required monthly revenue** seems high, reduce variable costs, renegotiate fees, or improve pricing.
* Use the chart to see the split between **Expenses**, **Taxes**, and **Net**.

### **Authoritative references**
* IRS: self-employment (Pub 334 / Schedule SE), home office (Pub 587), standard mileage.
* HMRC: Self Assessment, simplified expenses, mileage allowances.
* EU/national tax portals: allowable expenses & social contributions.
`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How is take-home calculated for my side hustle?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We estimate net profit as revenue minus fees, variable costs, fixed costs, mileage and home-office (if chosen). Estimated taxes are your marginal tax rate plus self-employment/NI/SSC applied to profit. Take-home equals net profit minus estimated taxes."
        }
      },
      {
        "@type": "Question",
        "name": "What tax rates should I use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use your personal marginal income tax rate and your country’s self-employment or social contribution rate. This avoids country-specific guesswork and improves accuracy."
        }
      },
      {
        "@type": "Question",
        "name": "Does this calculator replace a tax advisor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. It is an educational estimate. Rules for deductions and contribution rates vary by jurisdiction; consult official guidance or a licensed professional."
        }
      },
      {
        "@type": "Question",
        "name": "How do I reach a target monthly take-home?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Enter your target monthly net. The tool will back-solve the gross revenue needed based on your fee %, variable costs and tax rates. Reduce your cost rates or increase pricing to lower the required revenue."
        }
      }
    ]
  }
};

// -------------------- Dynamic Chart (lazy, client-only) --------------------
// We create a small inline component via dynamic() that imports Recharts only on client.
const RevenueSplitChart = dynamic(async () => {
  const Re = await import('recharts');
  const Comp = (props: {
    data: Array<{ name: string; value: number }>;
    height?: number;
  }) => {
    const { data, height = 260 } = props;
    return (
      <Re.ResponsiveContainer width="100%" height={height}>
        <Re.BarChart data={data} margin={{ top: 16, right: 16, left: -10, bottom: 8 }}>
          <Re.XAxis dataKey="name" />
          <Re.YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
          <Re.Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
          <Re.Legend />
          <Re.Bar dataKey="value" name="Amount">
            {data.map((_d, i) => (
              <Re.Cell key={i} />
            ))}
          </Re.Bar>
        </Re.BarChart>
      </Re.ResponsiveContainer>
    );
  };
  return { default: Comp };
}, { ssr: false, loading: () => <div className="h-64 w-full animate-pulse bg-gray-100 rounded-md" /> });

// -------------------- Helper --------------------
const fmtMoney = (v: number, locale = 'en-US', currency = 'USD') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);

function evalCondition(condition: string | undefined, state: Record<string, any>): boolean {
  if (!condition) return true;
  // Supports patterns like: field == true, field != true, field > 0
  const m = condition.match(/^\s*([a-zA-Z0-9_]+)\s*(==|!=|>=|<=|>|<)\s*(true|false|[0-9.]+)\s*$/);
  if (!m) return true;
  const [, key, op, raw] = m;
  const left = state[key];
  const right = raw === 'true' ? true : raw === 'false' ? false : Number(raw);
  switch (op) {
    case '==': return left === right;
    case '!=': return left !== right;
    case '>': return Number(left) > Number(right);
    case '<': return Number(left) < Number(right);
    case '>=': return Number(left) >= Number(right);
    case '<=': return Number(left) <= Number(right);
    default: return true;
  }
}

// -------------------- Component --------------------
const SideHustleIncomeCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Defaults chosen to be realistic yet conservative
  const initial = {
    monthly_revenue: 2500,
    platform_fee_pct: 6.0,
    other_variable_cost_pct: 4.0,
    fixed_expenses_month: 150,
    has_mileage: true,
    mileage_per_month: 120,
    mileage_rate: 0.67,
    has_home_office: true,
    home_office_pct: 10,
    rent_util_month: 1400,
    marginal_tax_rate_pct: 22,
    self_employment_rate_pct: 15.3,
    target_monthly_takehome: 1500
  };

  const [state, setState] = useState<Record<string, any>>(initial);
  useEffect(() => { setIsClient(true); }, []);

  const handleChange = (id: string, value: any) => setState(s => ({ ...s, [id]: value }));

  const reset = () => setState(initial);

  const calc = useMemo(() => {
    const monthly_revenue = Number(state.monthly_revenue) || 0;
    const annual_revenue = monthly_revenue * 12;

    const variable_cost_rate = (Number(state.platform_fee_pct) + Number(state.other_variable_cost_pct)) / 100;
    const variable_costs = annual_revenue * variable_cost_rate;

    const fixed_expenses_annual = (Number(state.fixed_expenses_month) || 0) * 12;

    const mileage_deduction = state.has_mileage
      ? (Number(state.mileage_per_month) || 0) * 12 * (Number(state.mileage_rate) || 0)
      : 0;

    const home_office_deduction = state.has_home_office
      ? (Number(state.home_office_pct) || 0) / 100 * (Number(state.rent_util_month) || 0) * 12
      : 0;

    const annual_expenses = variable_costs + fixed_expenses_annual + mileage_deduction + home_office_deduction;
    const annual_net_profit = Math.max(0, annual_revenue - annual_expenses);

    const tax_rate_total = (Number(state.marginal_tax_rate_pct) + Number(state.self_employment_rate_pct)) / 100;
    const annual_taxes = annual_net_profit * Math.max(0, Math.min(0.95, tax_rate_total)); // cap to avoid >95%
    const annual_take_home = Math.max(0, annual_net_profit - annual_taxes);
    const monthly_take_home = annual_take_home / 12;
    const effective_tax_rate_pct = annual_net_profit > 0 ? (annual_taxes / annual_net_profit) * 100 : 0;

    // Required revenue for target net (simple back-solve on linearized model)
    const target_net_annual = (Number(state.target_monthly_takehome) || 0) * 12;
    const denom = 1 - variable_cost_rate - Math.max(0, Math.min(0.95, tax_rate_total));
    const required_annual_revenue_for_target = denom > 0
      ? (target_net_annual + fixed_expenses_annual + mileage_deduction + home_office_deduction) / denom
      : Infinity;
    const required_monthly_revenue_for_target = required_annual_revenue_for_target / 12;

    return {
      annual_revenue,
      annual_expenses,
      annual_net_profit,
      annual_taxes,
      annual_take_home,
      monthly_take_home,
      effective_tax_rate_pct,
      required_monthly_revenue_for_target
    };
  }, [state]);

  const chartData = useMemo(() => ([
    { name: 'Expenses', value: calc.annual_expenses },
    { name: 'Taxes', value: calc.annual_taxes },
    { name: 'Net', value: calc.annual_take_home }
  ]), [calc]);

  const saveResult = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        inputs: state,
        outputs: calc,
        ts: Date.now()
      };
      const prev = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...prev].slice(0, 100)));
      alert('Result saved locally.');
    } catch {
      alert('Unable to save result in this environment.');
    }
  }, [state, calc, slug, title]);

  const exportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('PDF export not available here.');
    }
  }, [slug]);

  return (
    <>
      <SchemaInjector schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50">
        {/* Main */}
        <div className="lg:col-span-2" ref={ref}>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-4">Estimate your side-hustle take-home after fees, expenses and taxes — plus the gross you need to hit your target net.</p>

            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Educational estimates only. Not tax advice. Eligibility and rates vary by jurisdiction.
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {calculatorData.inputs.map((inp) => {
                if (!evalCondition((inp as any).condition, state)) return null;

                if (inp.type === 'boolean') {
                  return (
                    <div key={inp.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                      <input
                        id={inp.id}
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={!!state[inp.id]}
                        onChange={(e) => handleChange(inp.id, e.target.checked)}
                      />
                      <label htmlFor={inp.id} className="text-sm font-medium text-gray-700">
                        {inp.label}
                      </label>
                      {(inp as any).tooltip && (
                        <Tooltip text={(inp as any).tooltip}>
                          <span className="ml-1"><InfoIcon /></span>
                        </Tooltip>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={inp.id}>
                    <label htmlFor={inp.id} className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                      {inp.label}
                      {(inp as any).tooltip && (
                        <Tooltip text={(inp as any).tooltip}>
                          <span className="ml-2"><InfoIcon /></span>
                        </Tooltip>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id={inp.id}
                        type="number"
                        min={(inp as any).min}
                        step={(inp as any).step}
                        value={state[inp.id]}
                        onChange={(e) => handleChange(inp.id, e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        aria-label={inp.label}
                      />
                      {(inp as any).unit && <span className="text-sm text-gray-500">{(inp as any).unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Results */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calculatorData.outputs.map((out) => {
                  const v = (calc as any)[out.id];
                  const isPct = out.unit === '%';
                  const display = isClient
                    ? (isPct ? `${v.toFixed(1)}%` : fmtMoney(v))
                    : '…';
                  const highlight = out.id === 'monthly_take_home' || out.id === 'required_monthly_revenue_for_target';
                  return (
                    <div key={out.id}
                      className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${highlight ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="text-sm md:text-base font-medium text-gray-700">{out.label}</div>
                      <div className={`text-xl md:text-2xl font-bold ${highlight ? 'text-indigo-700' : 'text-gray-800'}`}>
                        {display}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Annual split: Expenses, Taxes, Net</h3>
              <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                {isClient && <RevenueSplitChart data={chartData} />}
              </div>
            </div>

            {/* Formula */}
            <div className="mt-6 border rounded-lg shadow-sm p-4 bg-white">
              <h3 className="font-semibold text-gray-700">Formula (simplified)</h3>
              <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">
                Net Profit = Revenue − (Revenue × (platform% + other variable%)) − Fixed − Mileage − HomeOffice
                <br />
                Taxes ≈ Net Profit × (Marginal% + SE/NI/SSC%)
                <br />
                Take-home = Net Profit − Taxes
                <br />
                Required Revenue ≈ (TargetNet×12 + Fixed + Mileage + HomeOffice) / (1 − variable% − tax%) / 12
              </p>
              <p className="text-xs text-gray-500 mt-2">This is an educational linear model; consult official guidance for your jurisdiction.</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Utilities</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={saveResult}
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Save
              </button>
              <button onClick={exportPDF}
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                PDF
              </button>
              <button onClick={reset}
                className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Reset
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">How it works</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Authoritative sources</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer"
                   href="https://www.irs.gov/forms-pubs/about-publication-587">IRS – Home Office (Pub 587)</a>
              </li>
              <li>
                <a className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer"
                   href="https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes">IRS – Self-Employment Tax</a>
              </li>
              <li>
                <a className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer"
                   href="https://www.gov.uk/expenses-if-youre-self-employed">HMRC – Expenses if you’re self-employed</a>
              </li>
              <li>
                <a className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer"
                   href="https://www.gov.uk/guidance/rates-and-allowances-mileage-allowance-payments">HMRC – Mileage allowances</a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

// --------------- Dynamic name from slug (export default) ---------------
export default SideHustleIncomeCalculator;
