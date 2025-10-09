'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Cell } from 'recharts';

// --- DYNAMICALLY LOADED CHART COMPONENT (for performance) ---
const DynamicBarChart = dynamic(() =>
  import('recharts').then(mod => mod.BarChart),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-md"><p className="text-sm text-gray-500">Loading Chart...</p></div>
  }
);

// --- HELPER & UTILITY COMPONENTS ---

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-xs text-white bg-gray-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const SchemaInjector = ({ schema }: { schema: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

const ContentRenderer = ({ content }: { content: string }) => {
    // A simple markdown-to-HTML renderer
    const processInlineFormatting = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    };

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (trimmed.startsWith('### **')) {
                    return <h3 key={index} className="text-lg font-bold mt-5 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmed.startsWith('#### **')) {
                    return <h4 key={index} className="text-base font-semibold mt-4 mb-2 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmed.startsWith('*')) {
                  const items = trimmed.split('\n').map(item => item.replace(/^\*\s*/, ''));
                  return (
                    <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                      {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                    </ul>
                  );
                }
                return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed) }} />;
            })}
        </div>
    );
};

// --- CONFIGURATION DATA ---
const calculatorData = {
  "slug": "severance-package-calculator",
  "category": "Finance and Investment",
  "title": "Severance Package Calculator",
  "lang": "en",
  "inputs": [
    { "id": "years_of_service", "label": "Total Years of Service", "type": "number" as const, "unit": "years", "min": 0, "step": 1, "tooltip": "Enter the total number of full years you have worked for the company. This is the primary multiplier for most severance calculations." },
    { "id": "weekly_gross_salary", "label": "Average Weekly Gross Salary", "type": "number" as const, "unit": "$", "min": 0, "step": 50, "tooltip": "Enter your average gross (pre-tax) weekly pay. To calculate from annual salary, divide by 52." },
    { "id": "weeks_pay_per_year", "label": "Weeks of Pay per Year of Service", "type": "number" as const, "unit": "weeks", "min": 0, "step": 1, "tooltip": "This is the number of weeks' salary the company offers for each year you worked. Common policies range from 1 to 4 weeks." },
    { "id": "unused_vacation_days", "label": "Unused Accrued Vacation Days", "type": "number" as const, "unit": "days", "min": 0, "step": 1, "tooltip": "Enter any remaining paid time off (PTO) or vacation days you have. Many jurisdictions require companies to pay this out." },
    { "id": "is_executive", "label": "Are you in a senior or executive role?", "type": "boolean" as const, "tooltip": "Senior management or executive-level employees often receive more generous severance packages due to longer job search times and contractual obligations." }
  ],
  "outputs": [
    { "id": "base_severance_pay", "label": "Base Severance Pay", "unit": "$" },
    { "id": "vacation_payout", "label": "Accrued Vacation Payout", "unit": "$" },
    { "id": "total_gross_severance", "label": "Total Gross Severance Package", "unit": "$" },
    { "id": "estimated_tax_withholding", "label": "Estimated Tax Withholding (22%)", "unit": "$" },
    { "id": "net_severance_payout", "label": "Estimated Net (Take-Home) Payout", "unit": "$" }
  ],
  "content": "### **A Comprehensive Guide to Understanding and Calculating Severance Pay**\n\nNavigating a job loss is challenging, and understanding the financial cushion a severance package provides is a critical step. This guide breaks down the components of severance pay, explains the key factors that influence the amount, and details the functionality of our calculator to give you an accurate, authoritative estimate.\n\nThis tool is designed to provide a close approximation based on common industry standards. However, it is not a substitute for legal advice. Severance agreements are legally binding documents, and consulting with an employment lawyer is always recommended.\n\n### **Part 1: How the Severance Package Calculator Works**\n\nOur calculator simplifies a complex process into a few key inputs to deliver a clear financial picture. The goal is to estimate your total compensation package following a layoff or termination.\n\n#### **Core Calculation Factors**\n\n* **Years of Service**: This is the bedrock of most severance formulas. The longer your tenure, the more substantial the package typically is. It reflects a company's acknowledgment of your long-term contribution.\n* **Weekly Gross Salary**: The calculation uses your gross (pre-tax) salary as the baseline for determining the value of each week of severance pay.\n* **Weeks of Pay per Year of Service**: This multiplier is determined by company policy or negotiation. A standard, informal rule of thumb is often one to two weeks of pay for every year of service, but this can vary significantly.\n* **Unused Accrued Vacation Days (PTO)**: In many states and countries, companies are legally required to pay out any unused paid time off. This is calculated based on your daily pay rate.\n* **Role Seniority (Executive Status)**: Senior leaders or executives often have employment contracts that stipulate a more generous severance formula (e.g., a higher multiplier or a longer base period) due to the greater difficulty and time involved in finding a comparable new role.\n\n### **Part 2: A Deeper Dive into Severance Packages**\n\n#### **What is Severance Pay?**\n\nSeverance pay is compensation and/or benefits that an employer may offer to an employee upon termination of their employment. It is not always legally required. Its primary purpose is to provide a financial bridge while the former employee searches for new work. It is often offered in exchange for the employee signing a release of claims against the company.\n\n#### **Is Severance Pay Legally Required?**\n\nIn the United States, the Fair Labor Standards Act (FLSA) **does not** mandate severance pay. It is largely a matter of agreement between an employer and an employee. However, there are exceptions:\n\n1.  **Employment Contract**: If your employment agreement or offer letter explicitly promises severance pay.\n2.  **Company Policy**: If an official employee handbook details a specific severance policy.\n3.  **The WARN Act**: The Worker Adjustment and Retraining Notification (WARN) Act requires employers with 100 or more employees to provide 60 days' advance notice of mass layoffs or plant closings. If they fail to do so, they may be required to provide pay in lieu of notice, which functions like severance.\n\n#### **Beyond the Paycheck: Other Components of a Severance Package**\n\nA strong severance package often includes more than just money. When reviewing an offer, look for:\n\n* **Healthcare**: Continuation of health insurance coverage, often through COBRA, where the company may subsidize premiums for a set period.\n* **Outplacement Services**: Career counseling, resume assistance, and job search support to help you land your next role faster.\n* **Equity**: Information on the status of stock options, restricted stock units (RSUs), and any vesting acceleration.\n* **Letter of Recommendation**: A formal letter or agreement on how the company will handle reference checks.\n\n### **Part 3: Tax Implications and Negotiation**\n\n#### **How is Severance Pay Taxed?**\n\nIt's crucial to understand that the IRS views severance pay as taxable income. It is typically taxed as 'supplemental wages' and subject to federal, state, and local income taxes, as well as Social Security and Medicare taxes. The default federal supplemental withholding rate is a flat **22%** (which this calculator uses as an estimate), though your actual tax liability may be higher or lower depending on your total annual income.\n\n#### **Can You Negotiate Your Severance Package?**\n\nYes. In many cases, the initial severance offer is a starting point. If you believe the offer is insufficient based on your tenure, role, or industry standards, you have the right to negotiate. It is highly advisable to consult with an employment attorney before signing any severance agreement, as it involves waiving your right to sue the company.\n\n**Key Negotiation Points:**\n\n* Increase the number of weeks of pay.\n* Request a lump-sum payment versus salary continuation.\n* Ask for extended healthcare coverage subsidies.\n* Negotiate for outplacement services if not offered.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "What is a standard severance package?", "acceptedAnswer": { "@type": "Answer", "text": "A widely accepted rule of thumb is one to two weeks of pay for every year of service. However, this can vary greatly based on company policy, the employee's role and seniority, and the reason for termination. Executive packages are often significantly more generous." } }, { "@type": "Question", "name": "Is severance pay taxable?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, severance pay is considered taxable income by the IRS and is subject to federal, state, and local taxes, just like regular wages. The federal government often taxes it at a flat 'supplemental wage' rate of 22%." } }, { "@type": "Question", "name": "Can I collect unemployment if I receive severance pay?", "acceptedAnswer": { "@type": "Answer", "text": "This depends on your state's laws. Some states consider severance pay as 'wages' and may delay your unemployment benefits until the severance period ends. Other states do not. It is critical to check with your state's unemployment office." } }, { "@type": "Question", "name": "Should I consult a lawyer before signing a severance agreement?", "acceptedAnswer": { "@type": "Answer", "text": "It is highly recommended. A severance agreement is a legal contract where you typically waive your right to file a lawsuit against your former employer. An employment lawyer can help you understand the terms, negotiate a better package, and ensure your rights are protected." } } ] }
};


// --- MAIN CALCULATOR COMPONENT ---

const SeverancePackageCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        years_of_service: 10,
        weekly_gross_salary: 1200,
        weeks_pay_per_year: 2,
        unused_vacation_days: 15,
        is_executive: false
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = useCallback(() => {
        setStates(initialStates);
    }, []);

    const calculatedOutputs = useMemo(() => {
        const { years_of_service, weekly_gross_salary, weeks_pay_per_year, unused_vacation_days, is_executive } = states;
        
        const executive_multiplier = is_executive ? 1.5 : 1.0;
        const base_severance_pay = years_of_service * weeks_pay_per_year * weekly_gross_salary * executive_multiplier;
        const daily_rate = weekly_gross_salary / 5;
        const vacation_payout = unused_vacation_days * daily_rate;
        const total_gross_severance = base_severance_pay + vacation_payout;
        const estimated_tax_withholding = total_gross_severance * 0.22;
        const net_severance_payout = total_gross_severance - estimated_tax_withholding;
        
        return { base_severance_pay, vacation_payout, total_gross_severance, estimated_tax_withholding, net_severance_payout };
    }, [states]);

    const chartData = [
      { name: 'Base Pay', value: calculatedOutputs.base_severance_pay, fill: '#4f46e5' },
      { name: 'Vacation', value: calculatedOutputs.vacation_payout, fill: '#818cf8' },
      { name: 'Taxes', value: -calculatedOutputs.estimated_tax_withholding, fill: '#fca5a5' },
    ];
    
    const formulaText = `Gross Severance = (Years of Service × Weeks per Year × Weekly Salary) + (Unused Vacation Days × Daily Rate)`;

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
            pdf.save(`${slug}_results.pdf`);
        } catch (error) {
            console.error("PDF Export failed:", error);
            alert("Could not export to PDF. This feature may not be available in all environments.");
        }
    }, [slug]);
    
    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, timestamp: new Date().toISOString() };
            const existingResults = JSON.parse(localStorage.getItem("calculator_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 20); // Save latest 20
            localStorage.setItem("calculator_results", JSON.stringify(newResults));
            alert("Result saved successfully!");
        } catch {
            alert("Failed to save the result. Local storage might be disabled.");
        }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                
                {/* Main Content: Calculator and Results */}
                <div className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                        <p className="text-gray-600 mb-5">Estimate your potential severance package based on common factors.</p>
                        
                        <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                           <strong>Disclaimer:</strong> This calculator provides an estimate for informational purposes only and does not constitute legal or financial advice. Always consult a qualified professional.
                        </div>

                        {/* --- Inputs Section --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium text-gray-700 flex items-center mb-1.5" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}>
                                          <span className="ml-2 cursor-help"><InfoIcon /></span>
                                        </Tooltip>
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-800" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* --- Outputs Section --- */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Calculation Results</h2>
                        <div className="space-y-3">
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'net_severance_payout' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                                    <span className="text-base font-medium text-gray-700">{output.label}</span>
                                    <span className={`text-xl font-bold ${output.id === 'net_severance_payout' ? 'text-indigo-600' : 'text-gray-900'}`}>
                                      {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Chart & Formula Section --- */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Package Breakdown</h3>
                        <p className="text-sm text-gray-600 mb-4">This chart visualizes the components of your gross package and estimated taxes.</p>
                        <div className="h-72 w-full">
                            {isClient && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <DynamicBarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} />
                                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} />
                                        <Bar dataKey="value" barSize={40} radius={[0, 8, 8, 0]}>
                                          {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                        </Bar>
                                    </DynamicBarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                         <div className="mt-6 border-t pt-4">
                            <h3 className="font-semibold text-gray-700">Calculation Formula Used</h3>
                            <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaText}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Actions and Content */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Actions</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-center font-semibold border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Result</button>
                            <button onClick={handleExportPDF} className="w-full text-center font-semibold border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Export as PDF</button>
                            <button onClick={handleReset} className="w-full text-center font-semibold border border-red-200 text-red-700 rounded-md px-4 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calculator</button>
                        </div>
                    </section>
                    
                    <section className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                         <h2 className="text-lg font-bold text-gray-800 mb-3">Guide & Information</h2>
                         <ContentRenderer content={content} />
                    </section>

                    <section className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Authoritative Sources</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.dol.gov/general/topic/termination/severancepay" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">U.S. Department of Labor: Severance Pay</a></li>
                            <li><a href="https://www.irs.gov/pub/irs-pdf/p525.pdf" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">IRS Publication 525: Taxable and Nontaxable Income</a></li>
                            <li><a href="https://www.dol.gov/agencies/eta/layoffs/warn" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">The Worker Adjustment and Retraining Notification (WARN) Act</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default SeverancePackageCalculator;