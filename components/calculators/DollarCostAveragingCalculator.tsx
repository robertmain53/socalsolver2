'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
// Import recharts components normally
import { Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';


// --- PERFORMANCE OPTIMIZATION: ONLY the top-level chart component needs to be dynamic ---
const DynamicPieChart = dynamic(
  () => import('recharts').then(mod => mod.PieChart),
  { 
    ssr: false, 
    loading: () => <div className="h-full w-full flex items-center justify-center text-gray-500">Loading Chart...</div> 
  }
);

// --- SELF-CONTAINED DATA ---
const calculatorData = {
  "slug": "dollar-cost-averaging-calculator",
  "category": "Finance and Investment",
  "title": "Dollar Cost Averaging (DCA) Calculator",
  "lang": "en",
  "inputs": [
    { "id": "initialInvestment", "label": "Initial Investment", "type": "number", "unit": "$", "min": 0, "step": 100, "tooltip": "The starting lump sum amount you want to invest. Set to 0 if you're starting from scratch." },
    { "id": "regularInvestment", "label": "Regular Investment Amount", "type": "number", "unit": "$", "min": 1, "step": 10, "tooltip": "The fixed amount you will invest at regular intervals (e.g., every month)." },
    { "id": "investmentFrequency", "label": "Investment Frequency", "type": "select", "options": [{ "label": "Monthly", "value": 12 }, { "label": "Quarterly", "value": 4 }, { "label": "Annually", "value": 1 }, { "label": "Weekly", "value": 52 }], "tooltip": "How often you make the regular investment. Monthly is the most common frequency." },
    { "id": "investmentPeriod", "label": "Investment Period", "type": "number", "unit": "years", "min": 1, "step": 1, "tooltip": "The total number of years you plan to keep investing." },
    { "id": "annualReturn", "label": "Estimated Annual Rate of Return", "type": "number", "unit": "%", "min": 0, "step": 0.1, "tooltip": "The average annual return you expect from your investments. For example, the historical average for the S&P 500 is around 8-10%." }
  ],
  "outputs": [
    { "id": "futureValue", "label": "Total Future Value", "unit": "$" },
    { "id": "totalInvested", "label": "Total Principal Invested", "unit": "$" },
    { "id": "totalGains", "label": "Total Investment Gains", "unit": "$" },
    { "id": "lumpSumComparison", "label": "Value if Invested as Lump Sum", "unit": "$" }
  ],
  "content": "### **A Comprehensive Guide to Dollar Cost Averaging (DCA)**\n\n**Understanding the Strategy, Its Mathematics, and Practical Applications**\n\nDollar Cost Averaging (DCA) is an investment strategy designed to minimize the impact of volatility when purchasing assets. It involves investing a fixed amount of money at regular intervals, regardless of the asset's price. This approach avoids the risky and often impossible task of 'timing the market.'\n\nThis guide will explore the mechanics of DCA, how to use this calculator effectively, the mathematical principles behind it, and its strategic pros and cons, providing a complete resource for both novice and experienced investors.\n\n### **Part 1: How to Use the DCA Calculator**\n\nThis tool is designed to project the potential growth of your investments using the DCA strategy. To get a clear picture, you need to provide five key pieces of information:\n\n* **Initial Investment**: The lump sum amount you're starting with. If you're beginning with your first periodic investment, you can set this to $0.\n* **Regular Investment Amount**: The consistent amount you plan to invest each period (e.g., $200).\n* **Investment Frequency**: How often you'll make the investment. The most common choice is monthly, often aligned with a paycheck.\n* **Investment Period (Years)**: The total duration you plan to continue investing. Longer time horizons typically lead to more significant compounding effects.\n* **Estimated Annual Rate of Return (%)**: Your expected average return per year. This is a critical variable. Historical stock market averages (like the S&P 500) hover around 8-10%, but this is not a guarantee of future performance.\n\n#### **Interpreting Your Results**\n\n* **Total Future Value**: The projected total value of your portfolio at the end of the investment period, including both your contributions and the investment gains.\n* **Total Principal Invested**: The sum of all your contributions (initial + all regular investments). This is the total amount of money you put in.\n* **Total Investment Gains**: The profit. This is the difference between the Total Future Value and the Total Principal Invested, representing the power of compounding.\n* **Value if Invested as Lump Sum**: This figure provides a crucial point of comparison. It calculates the future value if you had invested the *entire principal amount* on day one. In a consistent bull market, a lump sum investment will almost always yield a higher return because all your money is working for you for the entire duration. However, DCA is a risk management strategy; if the market were to dip after a lump sum investment, your losses would be more significant. DCA mitigates this risk by buying more shares when prices are low and fewer when they are high.\n\n### **Part 2: The Core Principles and Mathematics of DCA**\n\n#### **The Main Advantage: Reducing Risk**\n\nThe primary goal of DCA isn't necessarily to maximize returns, but to reduce the risk of investing a large sum of money at the wrong time (i.e., just before a market downturn). By spreading out purchases, you are more likely to achieve a better average price per share over time.\n\n#### **The Formula Behind the Growth**\n\nThe calculator uses standard financial formulas to project the future value (FV):\n\n1.  **Future Value of the Initial Investment**: A standard compound interest formula.\n    `FV_initial = PV * (1 + r)^n`\n    Where `PV` is the present value (initial investment), `r` is the periodic rate, and `n` is the number of periods.\n\n2.  **Future Value of a Series of Payments (Annuity)**: This calculates the growth of your regular contributions.\n    `FV_series = Pmt * [((1 + r)^n - 1) / r]`\n    Where `Pmt` is the regular payment amount.\n\n**Total Future Value = FV_initial + FV_series**\n\n### **Part 3: Strategic Considerations**\n\n#### **Benefits of Dollar Cost Averaging**\n* **Disciplined Investing**: It automates the investment process, removing emotion and preventing impulsive decisions based on market noise.\n* **Reduces Volatility Risk**: By averaging your purchase price, you smooth out the bumps in the market.\n* **Lowers Average Cost**: In a volatile or declining market, you naturally acquire more shares when prices are low, which can significantly lower your average cost per share.\n* **Accessibility**: It's a practical strategy for those who don't have a large lump sum to invest upfront and instead invest a portion of their regular income.\n\n#### **Risks and Drawbacks**\n* **Potential for Lower Returns**: As the calculator shows, in a steadily rising market (bull market), a lump sum investment made at the beginning will generally outperform DCA.\n* **Transaction Costs**: If your brokerage charges fees per transaction, frequent investments can lead to higher costs over time. It's crucial to use a low-cost brokerage for this strategy.\n* **No Guarantee of Profit**: DCA mitigates risk but does not eliminate it. The value of your investments can still go down.\n\n### **Conclusion**\n\nDollar Cost Averaging is a powerful and time-tested strategy for building wealth over the long term. It promotes discipline, manages risk, and makes investing accessible to everyone. While it may not always produce the absolute highest returns compared to a perfectly timed lump sum investment, its ability to mitigate the risks of market volatility makes it an excellent choice for the vast majority of long-term investors.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "What is Dollar Cost Averaging (DCA)?", "acceptedAnswer": { "@type": "Answer", "text": "Dollar Cost Averaging is an investment strategy where you invest a fixed amount of money at regular intervals, regardless of the asset's price. This approach helps reduce the impact of market volatility and avoids the need to time the market." } }, { "@type": "Question", "name": "Is DCA better than investing a lump sum?", "acceptedAnswer": { "@type": "Answer", "text": "It depends on the market conditions and an investor's risk tolerance. Statistically, in a rising market, a lump sum investment tends to perform better because the money is in the market for longer. However, DCA is often considered a better strategy for risk management, as it protects against investing a large amount right before a market downturn." } }, { "@type": "Question", "name": "Does this calculator account for fees or taxes?", "acceptedAnswer": { "@type": "Answer", "text": "No, this calculator does not factor in brokerage fees, trading commissions, or capital gains taxes. The results shown are pre-tax and pre-fee projections. These costs can impact your final returns, so it's important to consider them in your financial planning." } }, { "@type": "Question", "name": "What kind of assets can I use DCA for?", "acceptedAnswer": { "@type": "Answer", "text": "DCA can be used for a wide range of assets, including stocks, ETFs (Exchange-Traded Funds), mutual funds, and cryptocurrencies. It is particularly effective for assets known for their price volatility." } }] }
};

// --- SEO OPTIMIZATION: Dynamic Schema Injector ---
const SchemaInjector: React.FC<{ schema: object }> = ({ schema }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// --- HELPER COMPONENTS ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- CONTENT RENDERER ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('* **')) { // For bullet points with bolded titles
            const [title, ...rest] = trimmedBlock.split(':');
            return <p key={index} className="mb-4"><strong dangerouslySetInnerHTML={{__html: title.replace('* **', '') + ':'}}/> {rest.join(':')}</p>
        }
        if (trimmedBlock.startsWith('* ')) { // For bullet points
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        if (trimmedBlock) {
          return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        }
        return null;
      })}
    </div>
  );
};


// --- MAIN CALCULATOR COMPONENT ---
const DollarCostAveragingCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialInputs = {
    initialInvestment: 1000,
    regularInvestment: 200,
    investmentFrequency: 12,
    investmentPeriod: 15,
    annualReturn: 8,
  };
  const [inputValues, setInputValues] = useState(initialInputs);

  const handleInputChange = (id: string, value: any) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = useCallback(() => {
    setInputValues(initialInputs);
  }, [initialInputs]);

  const calculatedOutputs = useMemo(() => {
    const { initialInvestment, regularInvestment, investmentFrequency, investmentPeriod, annualReturn } = inputValues;
    
    if (annualReturn === 0) { // Handle zero return case to avoid division by zero
        const totalInvested = initialInvestment + (regularInvestment * investmentPeriod * investmentFrequency);
        return {
            futureValue: totalInvested,
            totalInvested: totalInvested,
            totalGains: 0,
            lumpSumComparison: totalInvested
        }
    }
    
    const periodicRate = (annualReturn / 100) / investmentFrequency;
    const totalPeriods = investmentPeriod * investmentFrequency;
    const fvOfInitial = initialInvestment * Math.pow(1 + periodicRate, totalPeriods);
    const fvOfSeries = regularInvestment * ( (Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate );
    
    const futureValue = fvOfInitial + fvOfSeries;
    const totalInvested = initialInvestment + (regularInvestment * totalPeriods);
    const totalGains = futureValue - totalInvested;
    const lumpSumComparison = totalInvested * Math.pow(1 + (annualReturn / 100), investmentPeriod);

    return { futureValue, totalInvested, totalGains, lumpSumComparison };
  }, [inputValues]);
  
  const handleExportPDF = useCallback(async () => {
    try {
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).default;
        if (!calculatorRef.current) return;
        
        const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${slug}.pdf`);
    } catch (error) {
        console.error("Failed to export PDF:", error);
        alert("Sorry, there was an error exporting the PDF.");
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: inputValues, outputs: calculatedOutputs, timestamp: new Date().toISOString() };
      const savedResults = JSON.parse(localStorage.getItem("dca_results") || "[]");
      const newResults = [payload, ...savedResults].slice(0, 10); // Save last 10
      localStorage.setItem("dca_results", JSON.stringify(newResults));
      alert("Result saved successfully!");
    } catch {
      alert("Could not save the result. Local storage might be disabled.");
    }
  }, [inputValues, calculatedOutputs, slug, title]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const chartData = [
      { name: 'Total Principal', value: calculatedOutputs.totalInvested },
      { name: 'Total Gains', value: Math.max(0, calculatedOutputs.totalGains) },
  ];
  const COLORS = ['#4f46e5', '#818cf8']; // Indigo-600, Indigo-400

  return (
    <>
      <SchemaInjector schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        
        {/* Main Column */}
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">Estimate the future value of your investments with a disciplined, automated strategy.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg border">
              {inputs.map(input => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                  </label>
                  <div className="flex items-center gap-2">
                    {input.unit === '$' && <span className="text-gray-500">{input.unit}</span>}
                    {input.type === 'number' && (
                        <input id={input.id} type="number" className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            min={input.min} step={input.step} value={(inputValues as any)[input.id]}
                            onChange={(e) => handleInputChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                    )}
                    {input.type === 'select' && input.options && (
                        <select id={input.id} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            value={(inputValues as any)[input.id]}
                            onChange={(e) => handleInputChange(input.id, Number(e.target.value))}>
                            {input.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    )}
                    {input.unit !== '$' && <span className="text-sm text-gray-500">{input.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Projected Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Results Section */}
                <div className="space-y-4">
                  {outputs.map(output => (
                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'futureValue' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                      <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                      <span className={`text-xl md:text-2xl font-bold ${output.id === 'futureValue' ? 'text-indigo-600' : 'text-gray-800'}`}>
                        {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Chart Section */}
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg flex flex-col items-center justify-center">
                   <h3 className="text-sm font-medium text-gray-600 mb-2">Value Breakdown: Principal vs. Gains</h3>
                   {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <DynamicPieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#8884d8" labelLine={false}
                             label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => { // CORRECTED: Added 'index' to props
                                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                // CORRECTED: Removed unnecessary findIndex line
                                return (<text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">{`${(percent * 100).toFixed(0)}%`}</text>);
                              }}>
                          {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                      </DynamicPieChart>
                    </ResponsiveContainer>
                   )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-700">Formula Used for Future Value of a Series</h3>
            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">FV = Pmt * [((1 + r)^n - 1) / r]</p>
            <p className="text-xs text-gray-500 mt-2">Where 'Pmt' is the regular payment, 'r' is the periodic interest rate, and 'n' is the total number of periods. This calculates the growth of your regular contributions.</p>
          </div>
        </div>

        {/* Aside Column */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Result</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Export PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Fields</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guide to Dollar Cost Averaging</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Authoritative Sources</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.investopedia.com/terms/d/dollarcostaveraging.asp" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Investopedia: Dollar-Cost Averaging (DCA)</a></li>
              <li><a href="https://www.finra.org/investors/learn-to-invest/types-investments/dollar-cost-averaging" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">FINRA: Investor Guidance on DCA</a></li>
              <li><a href="https://www.sec.gov/investor/alerts/ib_dollar-cost-averaging" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">SEC.gov: Investor Bulletin on DCA</a></li>
            </ul>
          </section>
        </aside>

      </div>
    </>
  );
};

export default DollarCostAveragingCalculator;
