'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip as ChartTooltip, Bar, Pie, Legend } from 'recharts';

// --- TYPE DEFINITIONS (CORRECTED) ---
type CalculatorInput = {
  id: string;
  label: string;
  type: 'number' | 'boolean';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  condition?: string;
};

type CalculatorData = {
  slug: string;
  // Added missing properties to the type definition
  category: string;
  title: string;
  lang: string;
  tags: string;
  inputs: CalculatorInput[];
  outputs: { id: string; label: string; unit?: string }[];
  formulaSteps: { id: string; expr: string }[];
  content: string;
  seoSchema: any;
  examples: any[];
};

// --- DYNAMICALLY LOADED COMPONENTS FOR PERFORMANCE ---
const DynamicPieChart = dynamic(() =>
  import('recharts').then(mod => mod.PieChart), { 
    ssr: false, 
    loading: () => <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">Loading Chart...</div> 
  }
);

// --- UI HELPER COMPONENTS ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- SEO SCHEMA INJECTOR ---
const SchemaInjector = ({ schema }: { schema: any }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// --- MARKDOWN CONTENT RENDERER ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        if (block.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (block.startsWith('#### **')) {
            return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (block.startsWith('*')) {
          const items = block.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
            </ul>
          );
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block) }} />;
      })}
    </div>
  );
};


// --- CALCULATOR DATA (SELF-CONTAINED) ---
const calculatorData: CalculatorData = {
  "slug": "rental-property-cash-flow-calculator",
  "category": "Finance and Investment",
  "title": "Rental Property Cash Flow Calculator",
  "lang": "en",
  "tags": "rental property, cash flow, real estate investing, roi calculator, cap rate, noi, investment property, real estate finance, landlord tools",
  "inputs": [
    { "id": "purchasePrice", "label": "Purchase Price", "type": "number", "unit": "$", "tooltip": "Total purchase price of the property." },
    { "id": "downPaymentPercentage", "label": "Down Payment", "type": "number", "unit": "%", "min": 0, "max": 100, "step": 1, "tooltip": "Percentage of the purchase price you are paying upfront." },
    { "id": "interestRate", "label": "Interest Rate", "type": "number", "unit": "%", "min": 0, "step": 0.125, "tooltip": "The annual interest rate for your mortgage." },
    { "id": "loanTerm", "label": "Loan Term", "type": "number", "unit": "years", "min": 1, "step": 1, "tooltip": "The duration of your mortgage loan." },
    { "id": "closingCosts", "label": "Closing Costs", "type": "number", "unit": "$", "tooltip": "One-time fees paid at closing, typically 2-5% of the purchase price (e.g., appraisal, legal fees)." },
    { "id": "grossMonthlyRent", "label": "Gross Monthly Rent", "type": "number", "unit": "$", "tooltip": "Total potential rental income per month before any expenses." },
    { "id": "vacancyRate", "label": "Vacancy Rate", "type": "number", "unit": "%", "min": 0, "max": 100, "tooltip": "Percentage of time the property is expected to be unoccupied. A common estimate is 5-10%." },
    { "id": "propertyTaxes", "label": "Monthly Property Taxes", "type": "number", "unit": "$", "tooltip": "Monthly cost of property taxes." },
    { "id": "propertyInsurance", "label": "Monthly Property Insurance", "type": "number", "unit": "$", "tooltip": "Monthly cost of homeowner's or landlord insurance." },
    { "id": "maintenanceRepairs", "label": "Monthly Maintenance & Repairs", "type": "number", "unit": "$", "tooltip": "Budget for regular upkeep and unexpected repairs. A common rule of thumb is 1% of the property value annually, or 5-10% of rent." },
    { "id": "propertyManagementFees", "label": "Property Management Fees", "type": "number", "unit": "%", "min": 0, "max": 100, "tooltip": "Percentage of monthly rent paid to a property management company, typically 8-12% if you're not self-managing." },
    { "id": "hoaFees", "label": "Monthly HOA Fees", "type": "number", "unit": "$", "tooltip": "Homeowners' Association fees, if applicable." },
    { "id": "otherExpenses", "label": "Other Monthly Expenses", "type": "number", "unit": "$", "tooltip": "Include any other recurring costs like utilities (if not paid by tenant), pest control, etc." }
  ],
  "outputs": [
    { "id": "monthlyCashFlow", "label": "Monthly Cash Flow", "unit": "$" },
    { "id": "annualCashFlow", "label": "Annual Cash Flow", "unit": "$" },
    { "id": "noi", "label": "Net Operating Income (NOI)", "unit": "$/year" },
    { "id": "capRate", "label": "Capitalization Rate (Cap Rate)", "unit": "%" },
    { "id": "cashOnCashReturn", "label": "Cash-on-Cash Return (CoC)", "unit": "%" }
  ],
  "formulaSteps": [
    { "id": "downPaymentAmount", "expr": "purchasePrice * (downPaymentPercentage / 100)" },
    { "id": "loanAmount", "expr": "purchasePrice - downPaymentAmount" },
    { "id": "monthlyInterestRate", "expr": "(interestRate / 100) / 12" },
    { "id": "numberOfPayments", "expr": "loanTerm * 12" },
    { "id": "monthlyMortgagePayment", "expr": "loanAmount > 0 ? (loanAmount * monthlyInterestRate * (1 + monthlyInterestRate) ** numberOfPayments) / ((1 + monthlyInterestRate) ** numberOfPayments - 1) : 0" },
    { "id": "effectiveMonthlyRent", "expr": "grossMonthlyRent * (1 - (vacancyRate / 100))" },
    { "id": "managementFeeAmount", "expr": "grossMonthlyRent * (propertyManagementFees / 100)" },
    { "id": "totalOperatingExpenses", "expr": "propertyTaxes + propertyInsurance + maintenanceRepairs + managementFeeAmount + hoaFees + otherExpenses" },
    { "id": "monthlyNbi", "expr": "effectiveMonthlyRent - totalOperatingExpenses" },
    { "id": "monthlyCashFlow", "expr": "monthlyNbi - monthlyMortgagePayment" },
    { "id": "annualCashFlow", "expr": "monthlyCashFlow * 12" },
    { "id": "noi", "expr": "monthlyNbi * 12" },
    { "id": "totalInvestment", "expr": "downPaymentAmount + closingCosts" },
    { "id": "capRate", "expr": "purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0" },
    { "id": "cashOnCashReturn", "expr": "totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0" }
  ],
  "examples": [
    { "inputs": { "purchasePrice": 250000, "downPaymentPercentage": 20, "interestRate": 6.5, "loanTerm": 30, "closingCosts": 7500, "grossMonthlyRent": 2200, "vacancyRate": 5, "propertyTaxes": 250, "propertyInsurance": 100, "maintenanceRepairs": 150, "propertyManagementFees": 8, "hoaFees": 0, "otherExpenses": 50 } }
  ],
  "content": "### **A Comprehensive Guide to Rental Property Cash Flow**\n\nUnderstanding and accurately calculating the cash flow of a potential investment property is the most critical step for any real estate investor. It's the primary indicator of profitability and sustainability. This guide will walk you through every component of the calculation, explain key performance metrics, and help you make informed investment decisions.\n\n### **Part 1: Core Components of the Calculation**\n\nA rental property's financial performance hinges on the relationship between income and expenses. Our calculator breaks this down into three main categories: Purchase & Loan, Income, and Operating Expenses.\n\n#### **Purchase & Loan Information**\nThis section establishes your initial investment and ongoing debt obligations.\n\n* **Purchase Price**: The total cost of acquiring the property.\n* **Down Payment**: The initial, upfront portion of the purchase price. A higher down payment means a smaller loan and lower monthly mortgage payments.\n* **Interest Rate & Loan Term**: These two factors determine your monthly mortgage payment (principal and interest). A lower rate or longer term reduces your monthly payment, improving cash flow.\n* **Closing Costs**: These are one-time fees for services that finalize the real estate transaction. They are a key part of your total initial investment and are crucial for calculating your cash-on-cash return.\n\n#### **Income**\nThis is the revenue generated by the property.\n\n* **Gross Monthly Rent**: The total potential rent you could collect if the property were occupied 100% of the time.\n* **Vacancy Rate**: A crucial and often overlooked variable. No property is occupied 100% of the time. Factoring in a realistic vacancy rate (e.g., 5-10%) provides a more accurate picture of your **Effective Gross Income**.\n\n#### **Operating Expenses (OpEx)**\nThese are the recurring costs of owning and maintaining the property. They do **not** include the loan principal or interest (which are considered debt service).\n\n* **Property Taxes & Insurance**: Non-negotiable costs of ownership.\n* **Maintenance & Repairs**: Budget for both routine upkeep (landscaping, cleaning) and unexpected repairs (broken water heater, roof leak). A common guideline is to budget 1% of the property's value annually.\n* **Property Management Fees**: If you hire a company to manage the property, they typically charge 8-12% of the collected rent.\n* **HOA Fees & Other Expenses**: Include all other predictable costs associated with the property.\n\n### **Part 2: Understanding Key Performance Metrics (The Outputs)**\n\nOnce all inputs are entered, the calculator provides five essential metrics to evaluate the investment's health.\n\n1.  **Cash Flow (Monthly & Annual)**\n    * **Formula**: `Income - Operating Expenses - Mortgage Payment`\n    * **What it is**: This is the profit you have left in your pocket after all bills are paid. **Positive cash flow** is the primary goal for most buy-and-hold investors.\n\n2.  **Net Operating Income (NOI)**\n    * **Formula**: `(Gross Rent * (1 - Vacancy Rate)) - Operating Expenses`\n    * **What it is**: NOI measures the property's ability to generate income, **independent of financing**. It shows you the raw profitability of the asset itself, before considering the mortgage. This is a key metric used in commercial real-estate valuation.\n\n3.  **Capitalization Rate (Cap Rate)**\n    * **Formula**: `(Annual NOI / Purchase Price) * 100`\n    * **What it is**: The Cap Rate expresses the property's annual return as a percentage of its price, assuming you paid all cash. It's a quick way to compare the relative value of similar properties in a market, independent of their financing. A higher cap rate generally suggests higher potential returns (and often, higher risk).\n\n4.  **Cash-on-Cash Return (CoC)**\n    * **Formula**: `(Annual Cash Flow / Total Initial Investment) * 100`\n    * **What it is**: This is arguably the most important metric for an investor using leverage (a loan). It measures the return on the **actual cash you invested** (Down Payment + Closing Costs). It answers the question: \"For every dollar I put in, what percentage am I getting back each year?\"\n\n### **Part 3: Analysis & Best Practices**\n\n* **The 1% Rule**: A guideline suggesting that the gross monthly rent should be at least 1% of the purchase price. While a useful quick filter, it doesn't account for varying expenses like taxes and insurance across different markets.\n* **The 50% Rule**: An estimation tool that suggests, on average, total operating expenses (excluding mortgage) will be about 50% of the gross rental income. Use this to quickly vet a property if you don't have detailed expense figures.\n* **Be Conservative**: When estimating expenses like maintenance and vacancy, it's always better to be conservative (estimate high). This creates a margin of safety and prevents you from investing in a property that only looks good on paper.\n",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "What is a good cash-on-cash return for a rental property?", "acceptedAnswer": { "@type": "Answer", "text": "A good cash-on-cash (CoC) return is subjective and depends on your investment goals and risk tolerance. However, many real estate investors aim for a CoC return between 8% and 12%. Returns below this range may not be worth the risk and effort, while returns above it are considered excellent." } }, { "@type": "Question", "name": "How do you calculate Net Operating Income (NOI)?", "acceptedAnswer": { "@type": "Answer", "text": "Net Operating Income (NOI) is calculated by subtracting all operating expenses from the property's effective gross income. The formula is: NOI = (Gross Rental Income - Vacancy Losses) - Operating Expenses. Operating expenses include items like property taxes, insurance, maintenance, and management fees, but do not include mortgage payments (principal and interest)." } }, { "@type": "Question", "name": "What is the difference between Cap Rate and Cash-on-Cash Return?", "acceptedAnswer": { "@type": "Answer", "text": "Cap Rate measures a property's profitability independent of financing, calculated as NOI / Purchase Price. It's used to compare properties as if they were bought with cash. Cash-on-Cash Return, however, measures the return on the actual cash invested (down payment + closing costs) and is calculated as Annual Cash Flow / Total Cash Invested. It is a more relevant metric for investors using a loan." } }, { "@type": "Question", "name": "How much should I budget for maintenance and repairs?", "acceptedAnswer": { "@type": "Answer", "text": "A common rule of thumb for maintenance and repairs is to budget 1% of the property's purchase price annually. For example, a $250,000 property would require a $2,500 annual maintenance budget ($208/month). Another method is to allocate 5-10% of the gross rental income. The actual amount will depend on the age and condition of the property." } } ] }
};

// --- MAIN COMPONENT ---
const RentalPropertyCashFlowCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema, examples } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => { setIsClient(true); }, []);
    
    const [state, setState] = useState<{[key: string]: any}>(examples[0].inputs);

    const handleStateChange = (id: string, value: any) => {
        setState(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = () => setState(examples[0].inputs);
    
    const calculatedOutputs = useMemo(() => {
        const { purchasePrice, downPaymentPercentage, interestRate, loanTerm, closingCosts, grossMonthlyRent, vacancyRate, propertyTaxes, propertyInsurance, maintenanceRepairs, propertyManagementFees, hoaFees, otherExpenses } = state;
        const downPaymentAmount = purchasePrice * (downPaymentPercentage / 100);
        const loanAmount = purchasePrice - downPaymentAmount;
        const monthlyInterestRate = (interestRate / 100) / 12;
        const numberOfPayments = loanTerm * 12;
        const monthlyMortgagePayment = loanAmount > 0 && monthlyInterestRate > 0 ? (loanAmount * monthlyInterestRate * (1 + monthlyInterestRate) ** numberOfPayments) / ((1 + monthlyInterestRate) ** numberOfPayments - 1) : 0;
        const effectiveMonthlyRent = grossMonthlyRent * (1 - (vacancyRate / 100));
        const managementFeeAmount = grossMonthlyRent * (propertyManagementFees / 100);
        const totalMonthlyOperatingExpenses = propertyTaxes + propertyInsurance + maintenanceRepairs + managementFeeAmount + hoaFees + otherExpenses;
        const monthlyNbi = effectiveMonthlyRent - totalMonthlyOperatingExpenses;
        const monthlyCashFlow = monthlyNbi - monthlyMortgagePayment;
        const annualCashFlow = monthlyCashFlow * 12;
        const noi = monthlyNbi * 12;
        const totalInvestment = downPaymentAmount + closingCosts;
        const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
        const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
        return { monthlyCashFlow, annualCashFlow, noi, capRate, cashOnCashReturn, effectiveMonthlyRent, totalMonthlyOperatingExpenses, monthlyMortgagePayment };
    }, [state]);

    const expenseBreakdownData = [
      { name: 'Mortgage (P+I)', value: calculatedOutputs.monthlyMortgagePayment, fill: '#4f46e5' },
      { name: 'Taxes', value: state.propertyTaxes, fill: '#6366f1' },
      { name: 'Insurance', value: state.propertyInsurance, fill: '#818cf8' },
      { name: 'Maintenance', value: state.maintenanceRepairs, fill: '#a5b4fc' },
      { name: 'Management', value: state.grossMonthlyRent * (state.propertyManagementFees / 100), fill: '#c7d2fe' },
      { name: 'Other', value: state.hoaFees + state.otherExpenses, fill: '#e0e7ff' },
    ];
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

    const handleSaveResult = useCallback(() => {
        try {
            const { effectiveMonthlyRent, totalMonthlyOperatingExpenses, monthlyMortgagePayment, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: state, outputs: outputsToSave, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Result saved successfully!");
        } catch {
            alert("Could not save result.");
        }
    }, [state, calculatedOutputs, slug, title]);

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
        } catch (e) {
            alert("PDF export feature is not available in this environment.");
            console.error(e);
        }
    }, [slug]);

    const renderInputSection = (title: string, inputIds: string[]) => (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-600 border-b pb-2 mb-4">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {inputIds.map(id => inputs.find(i => i.id === id)).map(input => input && renderInput(input))}
            </div>
        </div>
    );
    
    const renderInput = (input: CalculatorInput) => (
        <div key={input.id}>
            <label htmlFor={input.id} className="block text-sm font-medium text-gray-700 flex items-center">
                {input.label}
                <Tooltip text={input.tooltip!}><span className="ml-1.5"><InfoIcon /></span></Tooltip>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                {input.unit === '$' && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">$</span></div>}
                <input
                    type="number"
                    id={input.id}
                    value={state[input.id]}
                    onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    className={`w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${input.unit === '$' ? 'pl-7' : ''} ${input.unit === '%' ? 'pr-8' : ''}`}
                />
                {input.unit === '%' && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 sm:text-sm">%</span></div>}
            </div>
        </div>
    );
    
    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">An advanced tool to analyze the profitability and return of a real estate investment.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> This calculator is for informational and illustrative purposes only and does not constitute financial advice. Always consult with a qualified professional before making investment decisions.
                        </div>

                        {renderInputSection("Purchase & Loan", ["purchasePrice", "downPaymentPercentage", "interestRate", "loanTerm", "closingCosts"])}
                        {renderInputSection("Income & Expenses", ["grossMonthlyRent", "vacancyRate", "propertyTaxes", "propertyInsurance", "maintenanceRepairs", "propertyManagementFees", "hoaFees", "otherExpenses"])}
                        
                        {/* Results */}
                        <div className="mt-8">
                             <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">Investment Analysis</h2>
                            {outputs.map(output => {
                                const value = (calculatedOutputs as any)[output.id];
                                const isNegative = value < 0;
                                let displayValue: string;

                                if (!isClient) {
                                    displayValue = '...';
                                } else if (output.unit === '$') {
                                    displayValue = formatCurrency(value);
                                } else if (output.unit === '$/year') {
                                    displayValue = `${formatCurrency(value)}/year`;
                                } else if (output.unit === '%') {
                                    displayValue = formatPercentage(value);
                                } else {
                                    displayValue = String(value);
                                }

                                return (
                                    <div key={output.id} className={`flex items-center justify-between p-4 rounded-lg mb-3 ${output.id === 'monthlyCashFlow' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                                        <div className="text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-2xl font-bold ${output.id === 'monthlyCashFlow' ? (isNegative ? 'text-red-600' : 'text-indigo-600') : 'text-gray-800'}`}>
                                            {displayValue}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Charts */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Income vs. Expenses</h3>
                                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                    {isClient && 
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[{ name: 'Analysis', income: calculatedOutputs.effectiveMonthlyRent, expenses: calculatedOutputs.totalMonthlyOperatingExpenses + calculatedOutputs.monthlyMortgagePayment }]} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" hide />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}/>
                                                <Bar dataKey="income" name="Effective Income" fill="#16a34a" barSize={40} />
                                                <Bar dataKey="expenses" name="Total Expenses" fill="#dc2626" barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    }
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Expense Breakdown</h3>
                                <div className="h-64 w-full bg-gray-50 rounded-lg flex items-center justify-center">
                                    {isClient && 
                                       <ResponsiveContainer width="100%" height="100%">
                                            <DynamicPieChart>
                                                <Pie data={expenseBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                            </DynamicPieChart>
                                        </ResponsiveContainer>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-2 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                         <h2 className="text-xl font-semibold mb-3 text-gray-800">Actions</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-center bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Result</button>
                            <button onClick={handleExportPDF} className="w-full text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Export as PDF</button>
                            <button onClick={handleReset} className="w-full text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset to Example</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-6 bg-white shadow-md">
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">Investor's Guide</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-6 bg-white shadow-md">
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">Authoritative Sources</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.investopedia.com/terms/c/cashflow.asp" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Investopedia: Understanding Cash Flow</a></li>
                            <li><a href="https://www.biggerpockets.com/blog/real-estate-math-beginners" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">BiggerPockets: The Beginner's Guide to Real Estate Math</a></li>
                            <li><a href="https://www.nerdwallet.com/article/mortgages/rental-property-calculator" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">NerdWallet: Rental Property Calculator Guide</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default RentalPropertyCashFlowCalculator;