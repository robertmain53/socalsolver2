'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import Head from 'next/head';

// --- Helper & Type Definitions ---
type CalculatorData = typeof calculatorData;
type Inputs = CalculatorData['inputs'][number];
type SchemaData = CalculatorData['seoSchema'];

// --- Dynamically Imported Chart Component with a loading placeholder ---
const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
    
    // Custom component wrapper to pass required components
    const ChartComponent = (props: any) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <ChartTooltip
                    formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                    cursor={{fill: 'rgba(230, 230, 230, 0.4)'}}
                />
                <Legend wrapperStyle={{fontSize: "12px"}} />
                <Bar dataKey="Total Paid" stackId="a" fill="#4f46e5" />
                <Bar dataKey="Total Forgiven" stackId="a" fill="#818cf8" />
            </BarChart>
        </ResponsiveContainer>
    );
    return ChartComponent;
}), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Loading Chart...</div>
});


// --- Icon Component ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Reusable Tooltip Component ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            {text}
        </div>
    </div>
);

// --- Component to dynamically inject JSON-LD Schema ---
const SchemaInjector = ({ schema }: { schema: SchemaData }) => (
    <Head>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    </Head>
);

// --- Component for rendering Markdown content ---
const ContentRenderer = ({ content }: { content: string }) => {
    // A simple markdown to HTML converter
    const toHtml = (text: string) => text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (trimmed.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: toHtml(trimmed.replace(/### \*\*/, '').replace(/\*\*$/, '')) }} />;
                }
                if (trimmed.startsWith('#### **')) {
                     return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: toHtml(trimmed.replace(/#### \*\*/, '').replace(/\*\*$/, '')) }} />;
                }
                if (trimmed.startsWith('*')) {
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmed.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: toHtml(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                }
                return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: toHtml(trimmed) }} />;
            })}
        </div>
    );
};

// --- Main Calculator Data ---
const calculatorData = {
  "slug": "student-loan-forgiveness-calculator",
  "category": "Finance and Investment",
  "title": "Student Loan Forgiveness Calculator",
  "lang": "en",
  "inputs": [
    { "id": "loanBalance", "label": "Total Student Loan Balance", "type": "number" as const, "unit": "$", "min": 0, "step": 1000, "tooltip": "Enter the total current principal balance of all your federal student loans." },
    { "id": "interestRate", "label": "Average Interest Rate", "type": "number" as const, "unit": "%", "min": 0, "max": 15, "step": 0.1, "tooltip": "Enter the weighted average interest rate for your loans. You can find this on your loan servicer's website." },
    { "id": "adjustedGrossIncome", "label": "Your Adjusted Gross Income (AGI)", "type": "number" as const, "unit": "$", "min": 0, "step": 1000, "tooltip": "Your AGI from your most recent federal tax return. This is the primary factor in calculating your monthly payment on an IDR plan." },
    { "id": "annualIncomeGrowth", "label": "Expected Annual Income Growth", "type": "number" as const, "unit": "%", "min": 0, "max": 20, "step": 0.5, "tooltip": "Estimate how much you expect your income to increase each year. A typical estimate is 2-4%." },
    { "id": "familySize", "label": "Family Size", "type": "number" as const, "unit": "people", "min": 1, "step": 1, "tooltip": "The number of people in your household, including yourself, your spouse, and your children or other dependents." },
    { "id": "stateOfResidence", "label": "Your State of Residence", "type": "select" as const, "options": ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"], "tooltip": "Select your state of residence. This is used to estimate potential state taxes on the forgiven loan amount (IDR forgiveness is not always tax-free at the state level)." },
    { "id": "isPublicService", "label": "Do you work for a qualifying public service employer?", "type": "boolean" as const, "tooltip": "Check this box if you are employed full-time by a government organization or a not-for-profit organization." },
    { "id": "paymentsMade", "label": "Qualifying payments already made", "type": "number" as const, "unit": "payments", "min": 0, "step": 1, "tooltip": "Enter the number of qualifying payments you have already made towards either PSLF (max 120) or IDR forgiveness (max 300)." }
  ],
  "outputs": [
    { "id": "monthlyPayment", "label": "Estimated Monthly Payment (SAVE Plan)", "unit": "$" },
    { "id": "pslfForgiveness", "label": "Total Forgiven with PSLF", "unit": "$" },
    { "id": "pslfForgivenessDate", "label": "Estimated PSLF Forgiveness Date", "unit": "" },
    { "id": "idrForgiveness", "label": "Total Forgiven with IDR (SAVE Plan)", "unit": "$" },
    { "id": "idrForgivenessDate", "label": "Estimated IDR Forgiveness Date", "unit": "" },
    { "id": "idrTaxBomb", "label": "Potential 'Tax Bomb' on IDR Forgiveness", "unit": "$" }
  ],
  "content": "### **A Comprehensive Guide to Understanding and Calculating Student Loan Forgiveness**\n\nNavigating the world of student loan forgiveness can be complex. Programs like Public Service Loan Forgiveness (PSLF) and Income-Driven Repayment (IDR) plan forgiveness offer pathways to debt relief, but eligibility and potential outcomes vary significantly. This calculator is designed to provide a clear, data-driven estimate to help you understand your options.\n\nOur goal is to provide a tool that is more than just a calculator; it's an educational resource. We aim to empower you with the information needed to make strategic decisions about your financial future. **Remember, this tool provides estimates for informational purposes only and is not a substitute for financial advice or the official tools provided by the U.S. Department of Education.**\n\n### **Part 1: How the Calculator Works & Key Inputs Explained**\n\nThis calculator simulates your loan repayment journey on the **SAVE (Saving on a Valuable Education)** plan, the newest and most generous IDR plan, to estimate your potential forgiveness under two major programs: PSLF and standard IDR forgiveness.\n\n* **Total Student Loan Balance**: The starting point of your debt.\n* **Average Interest Rate**: This determines how quickly your loan balance grows. The SAVE plan includes a crucial interest subsidy, which this calculator models.\n* **Adjusted Gross Income (AGI)**: This is the key figure used to calculate your monthly payment. It's your gross income minus specific deductions.\n* **Family Size**: Your family size determines the poverty line guideline used in your payment calculation. A larger family size leads to a lower monthly payment.\n* **Public Service Employer**: This is the central requirement for PSLF. If you work for a government or eligible non-profit entity, you could have your loans forgiven after 10 years of payments.\n* **Qualifying Payments Made**: If you've already been making payments on an eligible plan, entering them here will shorten your estimated time to forgiveness.\n\n### **Part 2: Understanding Your Forgiveness Results**\n\n#### **Public Service Loan Forgiveness (PSLF)**\n\nPSLF is a powerful program for those in public service careers. The core requirements are:\n\n1.  **Qualifying Employer**: Full-time employment with a U.S. federal, state, local, or tribal government or a not-for-profit organization.\n2.  **Qualifying Loans**: Only Direct Loans are eligible.\n3.  **Qualifying Repayment Plan**: You must be on an Income-Driven Repayment plan (like SAVE).\n4.  **120 Qualifying Payments**: You must make 120 on-time monthly payments.\n\nAfter 120 qualifying payments, the remaining balance on your loan is forgiven. Crucially, **forgiveness under PSLF is not considered taxable income by the federal government.**\n\n#### **Income-Driven Repayment (IDR) Forgiveness**\n\nIf you are not eligible for PSLF, you can still receive forgiveness through an IDR plan like SAVE. After making payments for a set period—typically **20 years for undergraduate loans and 25 years for graduate loans**—any remaining balance is forgiven.\n\n* **The SAVE Plan Advantage**: The SAVE plan prevents your loan balance from growing due to unpaid interest. If your monthly payment doesn't cover the accrued interest, the government subsidizes (waives) the rest. This calculator incorporates that benefit.\n\n#### **The 'Tax Bomb': A Critical Consideration for IDR Forgiveness**\n\nThe most significant difference between PSLF and IDR forgiveness is taxation. While PSLF forgiveness is tax-free, the amount forgiven under an IDR plan is generally treated as taxable income.\n\nUnder the American Rescue Plan Act, this federal tax has been waived through the end of 2025. However, it is set to return unless Congress extends it. Furthermore, some states may still consider the forgiven amount as taxable income. Our calculator provides a rough estimate of this potential tax liability to ensure you are aware of this future cost.\n\n### **Part 3: Strategic Considerations & Next Steps**\n\n* **Certify Your Employment**: If you believe you are eligible for PSLF, you should use the official PSLF Help Tool on StudentAid.gov to certify your employment annually.\n* **Choose the Right Plan**: The SAVE plan is often the best choice, but using the official Loan Simulator at StudentAid.gov is the best way to compare all your options.\n* **Plan for the Future**: If you are on a path to IDR forgiveness, start planning for the potential tax bomb. Setting money aside in a savings or investment account can mitigate the financial shock when the time comes.\n\nThis calculator is your first step. Use the results to ask informed questions and take decisive action toward managing and ultimately eliminating your student debt.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "What is the difference between PSLF and IDR forgiveness?", "acceptedAnswer": { "@type": "Answer", "text": "PSLF (Public Service Loan Forgiveness) is for people working in government or non-profit jobs and offers tax-free forgiveness after 120 qualifying payments (10 years). IDR (Income-Driven Repayment) forgiveness is available to any federal borrower on an IDR plan and offers forgiveness after 20-25 years, but the forgiven amount is typically considered taxable income." } }, { "@type": "Question", "name": "How is my monthly payment calculated on the SAVE plan?", "acceptedAnswer": { "@type": "Answer", "text": "Your payment on the SAVE plan is based on your 'discretionary income.' This is calculated as your Adjusted Gross Income (AGI) minus 225% of the federal poverty guideline for your family size. Your monthly payment is typically 10% of your discretionary income, divided by 12. This will be reduced to 5% for undergraduate loans in July 2024." } }, { "@type": "Question", "name": "Is the forgiven student loan amount taxable?", "acceptedAnswer": { "@type": "Answer", "text": "It depends on the program. Forgiveness received through PSLF is NOT considered taxable income. Forgiveness received through an IDR plan is generally taxable at the federal and sometimes state level, although federal taxes on this forgiveness are currently paused through the end of 2025." } }, { "@type": "Question", "name": "What is the SAVE plan interest subsidy?", "acceptedAnswer": { "@type": "Answer", "text": "A major benefit of the SAVE plan is that if your monthly payment is not enough to cover the interest that accrues that month, the government will waive the remaining unpaid interest. This prevents your loan balance from increasing over time, a problem known as negative amortization." } }] }
};

// --- The Main Calculator Component ---
const StudentLoanForgivenessCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        loanBalance: 65000,
        interestRate: 6.5,
        adjustedGrossIncome: 70000,
        annualIncomeGrowth: 3,
        familySize: 2,
        stateOfResidence: "CA",
        isPublicService: true,
        paymentsMade: 24
    };

    const [states, setStates] = useState<{[key: string]: any}>(initialStates);
    
    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { loanBalance, interestRate, adjustedGrossIncome, annualIncomeGrowth, familySize, isPublicService, paymentsMade } = states;
        
        // Constants (2024 HHS Poverty Guidelines for 48 contiguous states)
        const POVERTY_BASE = 15060;
        const POVERTY_PER_PERSON = 5380;
        const PSLF_TERM = 120;
        const IDR_TERM = 300; // Assuming grad debt for 25-year term

        const povertyLine = POVERTY_BASE + (Math.max(1, familySize) - 1) * POVERTY_PER_PERSON;
        
        const calculateMonthlyPayment = (agi: number) => {
            const discretionaryIncome = Math.max(0, agi - povertyLine * 2.25);
            return (discretionaryIncome / 12) * 0.10; // Using 10% for blended loans
        };
        
        const initialMonthlyPayment = calculateMonthlyPayment(adjustedGrossIncome);

        let pslfBalance = loanBalance;
        let pslfTotalPaid = 0;
        let idrBalance = loanBalance;
        let idrTotalPaid = 0;

        let currentAgi = adjustedGrossIncome;
        
        // PSLF Simulation
        if (isPublicService) {
            const remainingPslfPayments = Math.max(0, PSLF_TERM - paymentsMade);
            for (let i = 1; i <= remainingPslfPayments; i++) {
                if (i > 1 && (i - 1) % 12 === 0) {
                    currentAgi *= (1 + annualIncomeGrowth / 100);
                }
                const monthlyPayment = calculateMonthlyPayment(currentAgi);
                const interest = (pslfBalance * (interestRate / 100)) / 12;
                pslfBalance += interest - monthlyPayment;
                pslfTotalPaid += monthlyPayment;
            }
        }

        // IDR Simulation
        currentAgi = adjustedGrossIncome;
        const remainingIdrPayments = Math.max(0, IDR_TERM - paymentsMade);
         for (let i = 1; i <= remainingIdrPayments; i++) {
            if (i > 1 && (i - 1) % 12 === 0) {
                currentAgi *= (1 + annualIncomeGrowth / 100);
            }
            const monthlyPayment = calculateMonthlyPayment(currentAgi);
            const interest = (idrBalance * (interestRate / 100)) / 12;
            // SAVE plan subsidy: unpaid interest is waived
            const unpaidInterest = Math.max(0, interest - monthlyPayment);
            const principalPaid = monthlyPayment - (interest - unpaidInterest);
            idrBalance -= principalPaid;
            idrTotalPaid += monthlyPayment;
        }

        const getDateInFuture = (months: number) => {
            if (months <= 0) return "N/A";
            const date = new Date();
            date.setMonth(date.getMonth() + months);
            return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        };
        
        const pslfForgiveness = isPublicService && pslfBalance > 0 ? pslfBalance : 0;
        const idrForgiveness = idrBalance > 0 ? idrBalance : 0;

        // Simplified tax bomb calculation (e.g., 24% federal + 8% state average)
        const idrTaxBomb = idrForgiveness * 0.32;
        
        return {
            monthlyPayment: initialMonthlyPayment,
            pslfForgiveness,
            pslfTotalPaid,
            pslfForgivenessDate: isPublicService ? getDateInFuture(PSLF_TERM - paymentsMade) : "N/A",
            idrForgiveness,
            idrTotalPaid,
            idrForgivenessDate: getDateInFuture(IDR_TERM - paymentsMade),
            idrTaxBomb
        };

    }, [states]);

    const chartData = [
      { name: 'PSLF', 'Total Paid': calculatedOutputs.pslfTotalPaid, 'Total Forgiven': calculatedOutputs.pslfForgiveness, },
      { name: 'IDR', 'Total Paid': calculatedOutputs.idrTotalPaid, 'Total Forgiven': calculatedOutputs.idrForgiveness, },
    ];
    
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
        } catch (e) { alert("PDF export failed. This feature may not be available in all browsers."); }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const { pslfTotalPaid, idrTotalPaid, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, timestamp: new Date().toISOString() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 10)));
            alert("Result saved successfully!");
        } catch { alert("Could not save result."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    
    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <main className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
                         <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-6">Estimate your potential forgiveness under the PSLF and SAVE (IDR) plans.</p>
                           
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {inputs.map(input => {
                                    const InputField = () => {
                                        switch (input.type) {
                                            case 'boolean':
                                                return (
                                                     <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-gray-50 border">
                                                        <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                                    </div>
                                                );
                                            case 'select':
                                                return (
                                                    <select id={input.id} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)}>
                                                        {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                );
                                            default:
                                                return (
                                                    <div className="relative">
                                                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>
                                                    </div>
                                                );
                                        }
                                    };
                                    
                                    return (
                                        <div key={input.id} className={input.type === 'boolean' ? 'md:col-span-2' : ''}>
                                             <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                            </label>
                                            <InputField />
                                        </div>
                                    );
                                })}
                            </div>
                         </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                         <h2 className="text-xl font-semibold text-gray-800 mb-4">Simulation Results</h2>
                         <div className="space-y-4">
                            {outputs.map(output => {
                                const value = (calculatedOutputs as any)[output.id];
                                if (output.id.startsWith('pslf') && !states.isPublicService) return null;
                                if (value === "N/A" || value === 0 && output.id.includes('Forgiveness')) return null;

                                return (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'monthlyPayment' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'monthlyPayment' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            {isClient ? (output.unit === '$' ? formatCurrency(value) : value) : '...'}
                                        </div>
                                    </div>
                                )
                            })}
                         </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Paid vs. Total Forgiven</h3>
                        <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                            {isClient && <DynamicBarChart data={chartData} />}
                        </div>
                    </div>
                </main>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Result</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Export PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                        </div>
                    </section>
                    
                     <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
                        <strong>Disclaimer:</strong> This is an informational tool, not financial advice. The calculations are estimates based on current program rules, which are subject to change. Always consult the official U.S. Department of Education resources for definitive information.
                    </div>
                    
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Understanding Forgiveness</h2>
                        <ContentRenderer content={content} />
                    </section>
                    
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Authoritative Sources</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://studentaid.gov/loan-simulator/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Official Loan Simulator</a></li>
                            <li><a href="https://studentaid.gov/pslf/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Public Service Loan Forgiveness (PSLF) Info</a></li>
                            <li><a href="https://studentaid.gov/announcements-events/save-plan" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">About the SAVE Repayment Plan</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default StudentLoanForgivenessCalculator;