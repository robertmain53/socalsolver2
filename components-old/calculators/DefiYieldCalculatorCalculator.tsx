'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export const meta = {
  title: "DeFi Yield & Impermanent Loss Calculator",
  description: "Calculate your potential earnings from DeFi staking and liquidity pools, including a detailed analysis of impermanent loss (IL) and other factors."
};

// --- Helper Components ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 inline-block">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

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
            "name": "What is the difference between APY and APR?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "APR (Annual Percentage Rate) is the simple interest rate earned in a year. APY (Annual Percentage Yield) includes the effects of compound interest, meaning you earn interest on your interest. APY will always be higher than APR if compounding occurs more than once per year."
            }
          },
          {
            "@type": "Question",
            "name": "Can you lose money with Impermanent Loss?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Impermanent Loss (IL) is the opportunity cost of providing liquidity versus simply holding the assets in your wallet. If the IL is greater than the trading fees and rewards you earn, you would have been better off just holding the assets. This calculator helps you model this scenario."
            }
          },
          {
            "@type": "Question",
            "name": "How accurate is this DeFi calculator?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "This calculator provides a mathematical estimate based on the inputs you provide. It is a powerful tool for forecasting but cannot predict actual market behavior, volatility, smart contract risks, or sudden changes in reward rates. Use it as a guide, not as a guarantee of returns."
            }
          }
        ]
      })
    }}
  />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
      })}
    </div>
  );
};

// --- Calculator Data ---
const calculatorData = { "slug": "defi-yield-calculator", "category": "Finance and Investment", "title": "DeFi Yield & Impermanent Loss Calculator", "lang": "en", "inputs": [{ "id": "initialInvestment", "label": "Initial Investment", "type": "number", "unit": "$", "min": 0, "step": 100, "tooltip": "The total value in USD of your initial capital." }, { "id": "apy", "label": "Stated APY", "type": "number", "unit": "%", "min": 0, "step": 1, "tooltip": "The Annual Percentage Yield advertised by the platform. This rate includes the effect of compounding." }, { "id": "investmentDuration", "label": "Investment Duration", "type": "number", "unit": "days", "min": 1, "step": 1, "tooltip": "For how many days you plan to keep your investment staked." }, { "id": "compoundsPerYear", "label": "Compounding Frequency", "type": "number", "unit": "per year", "min": 1, "step": 1, "tooltip": "How many times the yield is compounded annually. E.g., Daily = 365, Weekly = 52, Monthly = 12." }, { "id": "totalGasFees", "label": "Total Estimated Gas Fees", "type": "number", "unit": "$", "min": 0, "step": 5, "tooltip": "Sum of all expected network fees (gas) for transactions like staking, harvesting, and unstaking." }, { "id": "stakingRewardsTax", "label": "Tax Rate on Earnings", "type": "number", "unit": "%", "min": 0, "step": 1, "tooltip": "Your estimated tax rate on investment gains. This varies significantly by jurisdiction." }, { "id": "isLpPair", "label": "Calculate Impermanent Loss for a Liquidity Pool?", "type": "boolean", "tooltip": "Check this to activate the Impermanent Loss (IL) calculation for LP token pairs." }, { "id": "tokenA_initialPrice", "label": "Token A - Initial Price", "type": "number" as const, "unit": "$", "min": 0, "step": 1, "condition": "isLpPair == true", "tooltip": "The price of the first token in the pair at the time of investment." }, { "id": "tokenA_futurePrice", "label": "Token A - Expected Future Price", "type": "number" as const, "unit": "$", "min": 0, "step": 1, "condition": "isLpPair == true", "tooltip": "The anticipated price of Token A at the end of the investment duration." }, { "id": "tokenB_initialPrice", "label": "Token B - Initial Price", "type": "number" as const, "unit": "$", "min": 0, "step": 1, "condition": "isLpPair == true", "tooltip": "The price of the second token in the pair at the time of investment." }, { "id": "tokenB_futurePrice", "label": "Token B - Expected Future Price", "type": "number" as const, "unit": "$", "min": 0, "step": 1, "condition": "isLpPair == true", "tooltip": "The anticipated price of Token B at the end of the investment duration." }], "outputs": [{ "id": "finalBalance", "label": "Final Balance (with yield)", "unit": "$" }, { "id": "netProfit", "label": "Net Profit (after fees & taxes)", "unit": "$" }, { "id": "roi", "label": "Net ROI", "unit": "%" }, { "id": "impermanentLoss", "label": "Impermanent Loss (IL)", "unit": "$", "condition": "isLpPair == true" }, { "id": "finalBalanceWithIL", "label": "Final Balance (including IL)", "unit": "$", "condition": "isLpPair == true" }], "content": "### **A Comprehensive Guide to DeFi Yield Calculation**\n\n**Understanding Yield, Impermanent Loss, and Maximizing Your Returns**\n\nDecentralized Finance (DeFi) offers unprecedented opportunities for earning yield on digital assets. However, understanding the mechanics behind the advertised returns is crucial for accurate forecasting and risk management. This guide breaks down the core concepts used in our calculator, empowering you to make more informed investment decisions.\n\nThis tool is designed for informational purposes and provides an estimate based on your inputs. It **cannot replace professional financial advice** or account for extreme market volatility and smart contract risks.\n\n### **Part 1: How the Calculator Works - Core Inputs**\n\nOur calculator models the potential growth of your investment by considering the key variables that affect your final return.\n\n* **Initial Investment**: The starting capital for your venture.\n* **Stated APY (%)**: This is the Annual Percentage Yield. Crucially, APY **includes** the effects of compounding, while APR (Annual Percentage Rate) does not. Most DeFi protocols advertise the APY.\n* **Compounding Frequency**: This determines how often your earned rewards are added to your principal to begin earning rewards themselves. Daily compounding (365) results in a higher effective return than monthly compounding (12).\n* **Investment Duration**: The length of time your assets are staked. Longer durations allow the power of compounding to have a greater effect.\n* **Gas Fees & Taxes**: Often overlooked, these are real costs that eat into your profits. Gas fees are network costs for every transaction (staking, claiming, unstaking). Taxes on crypto gains vary by jurisdiction but are a critical consideration for calculating your true net profit.\n\n### **Part 2: The Elephant in the Room - Impermanent Loss (IL)**\n\nWhen you provide liquidity to a Liquidity Pool (LP) with two different assets (e.g., ETH/USDC), you are exposed to a unique risk known as Impermanent Loss.\n\n#### **What is Impermanent Loss?**\n\nImpermanent Loss is the difference in value between holding two assets in your wallet versus providing them as liquidity in an LP. It occurs when the prices of the two assets diverge from the price they were at when you deposited them.\n\nThe 'impermanent' part can be misleading; the loss becomes permanent only when you withdraw your liquidity. If the prices of the assets return to their original ratio, the loss is minimized.\n\n**How it's Calculated:**\n\nThe calculator uses the standard constant product formula (`x * y = k`) to determine IL:\n`IL = (Value of tokens in LP) - (Value of tokens if held in wallet)`\n\nA key takeaway is that the **higher the divergence in price between the two assets, the greater the impermanent loss**. The yield (trading fees, token rewards) you earn from being a liquidity provider is meant to offset this potential loss.\n\n### **Part 3: Interpreting Your Results**\n\n* **Net Profit**: This is your bottom line—the total earnings after subtracting all fees and estimated taxes.\n* **Net ROI**: The Return on Investment, expressed as a percentage of your initial capital. It's the most straightforward measure of your investment's performance.\n* **Impermanent Loss (IL)**: This figure (always zero or negative) shows the potential loss in value due to price divergence compared to just holding the assets.\n* **Final Balance (including IL)**: This is the most realistic estimate of your portfolio's value at the end of the investment period when providing liquidity, as it accounts for yield, fees, taxes, AND impermanent loss.\n\n### **Part 4: Risks and Advanced Considerations**\n\nDeFi is not risk-free. This calculator models market variables, but it cannot account for:\n\n1.  **Smart Contract Risk**: The risk of a bug or exploit in the protocol's code.\n2.  **Protocol Risk**: The risk of the team abandoning the project ('rug pull').\n3.  **Token Price Collapse**: The native reward token you are earning could crash to zero, making your yield worthless.\n\nAlways do your own research (DYOR) before investing in any DeFi protocol. Diversify your investments and never invest more than you are willing to lose."
};

const DefiYieldCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    initialInvestment: 5000, apy: 45, investmentDuration: 180, compoundsPerYear: 365,
    totalGasFees: 50, stakingRewardsTax: 20, isLpPair: true, tokenA_initialPrice: 2000,
    tokenA_futurePrice: 2500, tokenB_initialPrice: 1, tokenB_futurePrice: 1
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const {
      initialInvestment, apy, investmentDuration, compoundsPerYear, totalGasFees,
      stakingRewardsTax, isLpPair, tokenA_initialPrice, tokenA_futurePrice,
      tokenB_initialPrice, tokenB_futurePrice
    } = states;

    // Yield calculation
    const apr = compoundsPerYear * (Math.pow(1 + apy / 100, 1 / compoundsPerYear) - 1);
    const dailyRate = apr / 365;
    const grossEarnings = initialInvestment * (Math.pow(1 + dailyRate, investmentDuration) - 1);
    const profitAfterFees = grossEarnings - totalGasFees;
    const taxesPaid = profitAfterFees > 0 ? profitAfterFees * (stakingRewardsTax / 100) : 0;
    const netProfit = profitAfterFees - taxesPaid;
    const finalBalance = initialInvestment + netProfit;
    const roi = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;

    // IL calculation
    let impermanentLoss = 0;
    let finalBalanceWithIL = finalBalance;
    let hodlValue = initialInvestment * ( (0.5 * tokenA_futurePrice / tokenA_initialPrice) + (0.5 * tokenB_futurePrice / tokenB_initialPrice) );

    if (isLpPair && tokenA_initialPrice > 0 && tokenB_initialPrice > 0 && tokenA_futurePrice > 0 && tokenB_futurePrice > 0) {
      const initialAmountTokenA = (initialInvestment / 2) / tokenA_initialPrice;
      const initialAmountTokenB = (initialInvestment / 2) / tokenB_initialPrice;
      const constantProduct = initialAmountTokenA * initialAmountTokenB;
      const futureAmountTokenA = Math.sqrt(constantProduct * tokenB_futurePrice / tokenA_futurePrice);
      const futureAmountTokenB = Math.sqrt(constantProduct * tokenA_futurePrice / tokenB_futurePrice);
      const lpValue = (futureAmountTokenA * tokenA_futurePrice) + (futureAmountTokenB * tokenB_futurePrice);
      impermanentLoss = lpValue - hodlValue;
      finalBalanceWithIL = finalBalance + impermanentLoss;
    }
    
    return { finalBalance, netProfit, roi, impermanentLoss, finalBalanceWithIL, hodlValue };
  }, [states]);

  const chartData = [
    { name: 'Initial', Value: states.initialInvestment },
    { name: 'HODL', Value: states.isLpPair ? calculatedOutputs.hodlValue : states.initialInvestment },
    { name: 'LP + Yield', Value: calculatedOutputs.finalBalance },
    { name: 'LP + Yield + IL', Value: states.isLpPair ? calculatedOutputs.finalBalanceWithIL : calculatedOutputs.finalBalance },
  ];
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4", putOnlyUsedFonts: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (_e) { alert("PDF export is not available in this environment."); }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const { hodlValue, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
      alert("Result saved successfully!");
    } catch { alert("Could not save the result."); }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 my-6">
              <strong>Disclaimer:</strong> This tool provides an estimate for informational purposes only. It is not financial advice. DeFi investments carry significant risks, including smart contract vulnerabilities and market volatility.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {inputs.map(input => {
                // ✅ CORRECTED LOGIC
                if (input.condition && !states[input.condition.split(' ')[0]]) {
                  return null;
                }

                const inputLabel = (
                  <label className="block text-sm font-medium text-gray-700" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                  </label>
                );

                if (input.type === 'boolean') {
                  return (
                    <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-indigo-50 border border-indigo-200 my-2">
                      <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                      <label className="text-sm font-bold text-indigo-800" htmlFor={input.id}>{input.label}</label>
                    </div>
                  );
                }

                return (
                  <div key={input.id}>
                    {inputLabel}
                    <div className="mt-1 flex items-center gap-2">
                      <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                      {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Simulation Results</h2>
              {outputs.map(output => {
                // ✅ CORRECTED LOGIC
                 if (output.condition && !states[output.condition.split(' ')[0]]) {
                   return null;
                 }

                const value = (calculatedOutputs as any)[output.id];
                const isProfit = ['netProfit', 'roi'].includes(output.id) && value > 0;
                const isLoss = ['netProfit', 'impermanentLoss'].includes(output.id) && value < 0;

                return(
                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'finalBalanceWithIL' || output.id === 'finalBalance' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                  <div className={`text-xl md:text-2xl font-bold ${isProfit ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-800'}`}>
                    <span>{isClient ? (output.unit === '%' ? formatPercent(value) : formatCurrency(value)) : '...'}</span>
                  </div>
                </div>
                )
              })}
            </div>
             <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Portfolio Value Comparison</h3>
                <div className="h-72 w-full bg-gray-50 p-4 rounded-lg">
                    {isClient && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                                <ChartTooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #ddd'}} formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="Value" name="Portfolio Value">
                                    {chartData.map((_entry, index) => (<Cell key={`cell-${index}`} fill={['#a5b4fc', '#7dd3fc', '#86efac', '#fca5a5'][index % 4]} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={saveResult} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Result</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Export PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 rounded-md px-3 py-2 text-sm text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guide & Concepts</h2>
            <ContentRenderer content={content} />
          </section>
           <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Authoritative Sources</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                <li><a href="https://www.coingecko.com/learn/what-is-impermanent-loss" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">CoinGecko: What Is Impermanent Loss?</a></li>
                <li><a href="https://finematics.com/impermanent-loss-explained/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Finematics: Impermanent Loss Explained</a></li>
                <li><a href="https://www.investopedia.com/terms/a/annual-percentage-yield-apy.asp" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Investopedia: Annual Percentage Yield (APY)</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default DefiYieldCalculator;