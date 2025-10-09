'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- DATA & METADATA ---
export const meta = {
  title: "DeFi Yield Calculator | APR, APY & Impermanent Loss",
  description: "Accurately forecast DeFi returns. Calculate APY from APR with compounding and simulate impermanent loss for liquidity pools (LPs)."
};

// --- DATA CONFIGURATION (from JSON) ---
const calculatorData = {
  "slug": "defi-yield-calculator",
  "category": "Finance and Investment",
  "title": "DeFi Yield Calculator",
  "lang": "en",
  "inputs": [
    { "id": "principalAmount", "label": "Principal Amount", "type": "number" as const, "unit": "$", "min": 0, "step": 100, "tooltip": "The initial capital you are investing. This is the base amount on which all returns will be calculated." },
    { "id": "apr", "label": "Annual Percentage Rate (APR)", "type": "number" as const, "unit": "%", "min": 0, "step": 0.1, "tooltip": "The quoted annual interest rate before taking compounding into account. This is the base yield from the protocol." },
    { "id": "compoundingFrequency", "label": "Compounding Periods per Year", "type": "number" as const, "unit": "times/year", "min": 1, "step": 1, "tooltip": "How many times per year the earned rewards are reinvested. For example: Daily = 365, Weekly = 52, Monthly = 12." },
    { "id": "investmentDuration", "label": "Investment Duration", "type": "number" as const, "unit": "days", "min": 1, "step": 1, "tooltip": "The total length of time you plan to keep your capital invested." },
    { "id": "includeImpermanentLoss", "label": "Calculate Impermanent Loss (for Liquidity Pools)?", "type": "boolean" as const, "tooltip": "Enable this to simulate the potential Impermanent Loss (IL) for a two-asset liquidity pool (LP) position." },
    { "id": "assetAPriceChange", "label": "Asset A Price Change", "type": "number" as const, "unit": "%", "step": 1, "condition": "includeImpermanentLoss == true", "tooltip": "The forecasted percentage price change for the first asset in the LP over the investment duration. E.g., for ETH, you might forecast a 20% increase." },
    { "id": "assetBPriceChange", "label": "Asset B Price Change", "type": "number" as const, "unit": "%", "step": 1, "condition": "includeImpermanentLoss == true", "tooltip": "The forecasted percentage price change for the second asset. If it's a stablecoin like USDC, this value would be 0%." }
  ],
  "outputs": [
    { "id": "apy", "label": "Calculated APY", "unit": "%" },
    { "id": "totalReturn", "label": "Total Balance before IL", "unit": "$" },
    { "id": "netProfit", "label": "Net Profit from Yield", "unit": "$" },
    { "id": "impermanentLoss", "label": "Impermanent Loss (IL)", "unit": "%" },
    { "id": "finalBalanceAfterIL", "label": "Final Balance (after IL)", "unit": "$" }
  ],
  "content": "### **A Comprehensive Guide to DeFi Yield Calculation**\n\n**Understanding Yield Metrics, Compounding Effects, and Liquidity Pool Risks**\n\nDecentralized Finance (DeFi) offers powerful opportunities for earning yield on crypto assets, but understanding the mechanics is crucial for success. This guide breaks down the core concepts behind yield calculation, helping you use this tool effectively and make informed investment decisions.\n\n### **Part 1: How the DeFi Yield Calculator Works**\n\nThis calculator is a simulation tool designed to forecast potential returns from staking or liquidity provision. It models the key variables that determine your final profit, moving beyond simple rates to give you a clearer picture of your investment's growth potential.\n\n1.  **Core Inputs**: The calculation starts with your **Principal Amount**, the **Annual Percentage Rate (APR)** offered by the protocol, and your planned **Investment Duration**.\n2.  **The Power of Compounding**: The **Compounding Frequency** is a critical factor. It determines how often your earned rewards are reinvested, which significantly boosts your returns over time. The calculator uses this to convert the simple APR into the more accurate Annual Percentage Yield (APY).\n3.  **Liquidity Pool Simulation**: For advanced users, the calculator can model **Impermanent Loss (IL)**, a unique risk for liquidity providers. By inputting the expected price changes of the two assets in a pool, you can see how IL might impact your overall profitability.\n\n### **Part 2: Core Concepts Explained in Detail**\n\n#### **APR vs. APY: The Critical Difference**\n\n* **APR (Annual Percentage Rate)**: This is the simple, non-compounded interest rate you earn over a year. If you invest $100 at 20% APR, you'll have $120 after one year, assuming you don't reinvest any earnings.\n* **APY (Annual Percentage Yield)**: This is the **true rate of return** because it includes the effect of compounding. If you reinvest your earnings (e.g., daily), your principal amount grows slightly each day, and the next day's interest is calculated on this larger amount. This exponential growth means APY is always higher than APR for any compounding frequency greater than once a year.\n\nThe formula to convert APR to APY is: `APY = (1 + APR / n)^n - 1`, where 'n' is the number of times you compound per year.\n\n#### **Advanced Concept: Impermanent Loss (IL)**\n\nImpermanent Loss is a risk specific to providing liquidity in a 50/50 two-asset pool (e.g., ETH/USDC).\n\n* **What is it?** It's the difference in value between holding two assets in your wallet versus depositing them into a liquidity pool. If the prices of the two assets diverge significantly, the value of your holdings in the pool can be less than if you had simply held them. The 'impermanent' term suggests the loss is only realized when you withdraw your liquidity, and it could be reversed if prices return to their original ratio.\n* **Why does it happen?** Automated Market Makers (AMMs) must maintain a constant value balance between the two assets in a pool. As traders buy and sell, the AMM rebalances the pool by selling the asset that is appreciating and buying the one that is depreciating (relative to each other). This leaves the liquidity provider with more of the less valuable asset and less of the more valuable one.\n* **Is it still profitable?** Often, yes. The trading fees you earn as a liquidity provider are your reward. If the APR from these fees is high enough, it can more than offset any potential impermanent loss.\n\n### **Part 3: Common Risks in DeFi Yield Farming**\n\nWhile potentially lucrative, DeFi is not without risks. Always do your own research (DYOR).\n\n* **Smart Contract Risk**: A bug or exploit in a protocol's code could lead to a complete loss of funds.\n* **Market Volatility**: The value of your principal and your rewards can fluctuate dramatically.\n* **Rug Pulls**: Malicious developers can abandon a project and run away with investors' funds.\n* **Regulatory Risk**: The legal landscape for DeFi is still evolving globally.\n\n### **Conclusion**\n\nThis calculator is a powerful tool for estimating potential DeFi returns. By understanding the interplay between APR, compounding, and risks like impermanent loss, you can develop more effective yield farming strategies. However, always treat these calculations as forecasts, not guarantees, and never invest more than you are willing to lose.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "What is the difference between APR and APY in DeFi?", "acceptedAnswer": { "@type": "Answer", "text": "APR (Annual Percentage Rate) is the simple interest rate earned annually. APY (Annual Percentage Yield) accounts for the effect of compound interest, where earnings are reinvested to generate their own earnings. Because of compounding, APY provides a more accurate measure of the actual return on an investment." } }, { "@type": "Question", "name": "What is Impermanent Loss?", "acceptedAnswer": { "@type": "Answer", "text": "Impermanent Loss (IL) is a risk for liquidity providers in DeFi. It's the difference in value between holding assets in a liquidity pool versus holding them in a wallet. It occurs when the relative prices of the assets in the pool diverge. The trading fees earned can often compensate for this potential loss." } }, { "@type": "Question", "name": "How is APY calculated from APR?", "acceptedAnswer": { "@type": "Answer", "text": "The formula to calculate APY from APR is: APY = (1 + APR / n)^n - 1, where 'n' is the number of compounding periods in a year. The more frequent the compounding, the higher the APY will be compared to the APR." } } ] }
};

// --- HELPER COMPONENTS ---

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const SchemaInjector = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
    // A simple markdown to HTML converter
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
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

// --- DYNAMIC CHART COMPONENT ---
const DynamicPieChart = dynamic(
    () => Promise.resolve(({ data }: { data: any[] }) => {
        const COLORS = ['#0ea5e9', '#10b981', '#ef4444']; // Sky, Green, Red
        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    }),
    { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading Chart...</div> }
);


// --- MAIN CALCULATOR COMPONENT ---

const DefiYieldCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        principalAmount: 1000,
        apr: 20,
        compoundingFrequency: 365,
        investmentDuration: 365,
        includeImpermanentLoss: false,
        assetAPriceChange: 10,
        assetBPriceChange: 0,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { principalAmount, apr, compoundingFrequency, investmentDuration, includeImpermanentLoss, assetAPriceChange, assetBPriceChange } = states;
        const r = apr / 100; // Annual rate as decimal
        const n = compoundingFrequency;
        const t = investmentDuration / 365; // Time in years

        const calculatedApy = n > 0 ? ((1 + r / n) ** n) - 1 : r;
        const totalReturn = principalAmount * ((1 + r / n) ** (n * t));
        const netProfit = totalReturn - principalAmount;

        let impermanentLoss = 0;
        if (includeImpermanentLoss) {
            const priceRatioK = (1 + assetAPriceChange / 100) / (1 + assetBPriceChange / 100);
            impermanentLoss = ((2 * Math.sqrt(priceRatioK)) / (1 + priceRatioK)) - 1;
        }

        const finalBalanceAfterIL = totalReturn * (1 + impermanentLoss);
        
        return {
            apy: calculatedApy * 100,
            totalReturn,
            netProfit,
            impermanentLoss: impermanentLoss * 100,
            finalBalanceAfterIL,
        };
    }, [states]);

    const chartData = useMemo(() => {
        const ilValue = states.includeImpermanentLoss ? calculatedOutputs.totalReturn - calculatedOutputs.finalBalanceAfterIL : 0;
        return [
            { name: 'Principal', value: states.principalAmount },
            { name: 'Yield Profit', value: Math.max(0, calculatedOutputs.netProfit - ilValue) },
            ...(ilValue > 0 ? [{ name: 'Impermanent Loss', value: ilValue }] : [])
        ];
    }, [states.principalAmount, states.includeImpermanentLoss, calculatedOutputs]);
    
    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) {
            alert("Error exporting to PDF. This feature may not be available in all browsers.");
            console.error(e);
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Result saved successfully!");
        } catch {
            alert("Could not save result. Local storage may be disabled.");
        }
    }, [states, calculatedOutputs, slug, title]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                
                {/* Main Content: Calculator + Results */}
                <div className="lg:col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{meta.description}</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> This tool is for informational purposes only. The projected returns are not guaranteed. DeFi involves significant risks—always do your own research (DYOR).
                        </div>

                        {/* Inputs Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const isConditionMet = !input.condition || (states.includeImpermanentLoss);
                                if (!isConditionMet) return null;

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500" checked={states[input.id]} onChange={e => handleStateChange(input.id, e.target.checked)} />
                                            <label htmlFor={input.id} className="text-sm font-medium text-gray-700 flex items-center cursor-pointer">
                                                {input.label}
                                                <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                            </label>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                        </label>
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500 px-3 py-2 pr-12" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 pointer-events-none">{input.unit}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Outputs Section */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Projected Results</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {outputs.map(output => {
                                    const value = (calculatedOutputs as any)[output.id];
                                    const isIlField = output.id.toLowerCase().includes('impermanent');
                                    const isFinalBalance = output.id === 'finalBalanceAfterIL';
                                    if (isIlField && !states.includeImpermanentLoss) return null;
                                    if (isFinalBalance && !states.includeImpermanentLoss) return null;
                                    if (output.id === 'totalReturn' && states.includeImpermanentLoss) return null;

                                    const isHighlighted = isFinalBalance || (!states.includeImpermanentLoss && output.id === 'totalReturn') || output.id === 'apy';
                                    
                                    return (
                                        <div key={output.id} className={`p-4 rounded-lg flex justify-between items-center border-l-4 ${isHighlighted ? 'bg-sky-50 border-sky-500' : 'bg-gray-50 border-gray-300'} ${isIlField ? 'bg-red-50 border-red-400' : ''}`}>
                                            <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                                            <span className={`text-xl font-bold ${isHighlighted ? 'text-sky-600' : 'text-gray-800'} ${isIlField ? 'text-red-600' : ''}`}>
                                                {isClient ? (output.unit === '$' ? formatCurrency(value) : formatPercent(value)) : '...'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="mt-8">
                           <h3 className="text-lg font-semibold text-gray-700 mb-2">Final Balance Composition</h3>
                           <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && <DynamicPieChart data={chartData} />}
                           </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Actions + Content */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Actions</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Save Result</button>
                            <button onClick={handleExportPDF} className="w-full text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Export PDF</button>
                            <button onClick={handleReset} className="w-full text-center border border-red-300 rounded-md px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guide to DeFi Yield</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Authoritative Sources</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://ethereum.org/en/defi/" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Ethereum.org on DeFi</a></li>
                            <li><a href="https://academy.binance.com/en/articles/what-is-yield-farming-in-decentralized-finance-defi" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Binance Academy: Yield Farming</a></li>
                            <li><a href="https://academy.binance.com/en/articles/impermanent-loss-explained" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Binance Academy: Impermanent Loss</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default DefiYieldCalculator;