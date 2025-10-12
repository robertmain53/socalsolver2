'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
// Removed: import { v4 as uuidv4 } from 'uuid'; // This line caused the error.

// --- DYNAMICALLY LOADED CHART COMPONENT ---
const DynamicPieChart = dynamic(() =>
  import('recharts').then(mod => {
    const { PieChart, Pie, Cell, Tooltip: ChartTooltip, Legend, ResponsiveContainer } = mod;

    const CustomPieChart = ({ data }: { data: any[] }) => {
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF5733'];
        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    };
    return CustomPieChart;
}), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full"><p className="text-gray-500">Loading Chart...</p></div>,
});


// --- HELPER COMPONENTS ---

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 cursor-help">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
    // A simple markdown to HTML renderer
    const renderContent = () => {
        return content
            .split('\n\n')
            .map((paragraph, index) => {
                if (paragraph.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: paragraph.replace(/### \*\*/g, '').replace(/\*\*/g, '') }} />;
                }
                if (paragraph.startsWith('* ')) {
                    const items = paragraph.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item.replace('* ', '') }} />);
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items}</ul>;
                }
                return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: paragraph }} />;
            });
    };
    return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};


// --- CONFIGURATION DATA ---

const calculatorData = {
  "slug": "crypto-portfolio-calculator",
  "category": "Finance and Investment",
  "title": "Crypto Portfolio Calculator",
  "lang": "en",
  "inputs": [
    { "id": "assetName", "label": "Cryptocurrency Name", "type": "text" as const, "placeholder": "e.g., Bitcoin", "tooltip": "Enter the name or ticker of the cryptocurrency (e.g., BTC)." },
    { "id": "amountBought", "label": "Amount Bought", "type": "number" as const, "min": 0, "step": "any", "placeholder": "e.g., 0.5", "tooltip": "The total quantity of the coin you purchased." },
    { "id": "buyPrice", "label": "Buy Price per Coin", "type": "number" as const, "unit": "$", "min": 0, "step": "any", "placeholder": "e.g., 40000", "tooltip": "The price of a single coin at the time of purchase." },
    { "id": "currentPrice", "label": "Current Price per Coin", "type": "number" as const, "unit": "$", "min": 0, "step": "any", "placeholder": "e.g., 65000", "tooltip": "The current market price of a single coin. You can get this from exchanges like Coinbase or sites like CoinMarketCap." },
    { "id": "fees", "label": "Total Fees (Optional)", "type": "number" as const, "unit": "$", "min": 0, "step": "any", "placeholder": "e.g., 25", "tooltip": "Include any trading fees, gas fees, or other costs associated with this purchase." }
  ],
  "outputs": [
    { "id": "totalInvestment", "label": "Total Investment" },
    { "id": "currentPortfolioValue", "label": "Current Portfolio Value" },
    { "id": "totalProfitLoss", "label": "Total Profit / Loss" },
    { "id": "totalRoi", "label": "Portfolio ROI" }
  ],
  "formulaSteps": [
    { "id": "investmentPerAsset", "expr": "(amountBought * buyPrice) + fees" },
    { "id": "currentValuePerAsset", "expr": "amountBought * currentPrice" },
    { "id": "totalInvestment", "expr": "SUM(investmentPerAsset for all assets)" },
    { "id": "currentPortfolioValue", "expr": "SUM(currentValuePerAsset for all assets)" },
    { "id": "totalProfitLoss", "expr": "currentPortfolioValue - totalInvestment" },
    { "id": "totalRoi", "expr": "(totalProfitLoss / totalInvestment) * 100" }
  ],
  "content": "### **A Comprehensive Guide to Calculating Your Crypto Portfolio's Performance**\n\nUnderstanding the true performance of your cryptocurrency investments is crucial for making informed decisions. While exchanges show you the current value, a dedicated calculator provides a clearer picture of your actual profit or loss by factoring in your initial costs and fees. This guide will walk you through the essential metrics and how to use this tool effectively.\n\n### **Part 1: How the Calculator Works**\n\nThis calculator is designed to provide a consolidated view of your entire crypto portfolio. Instead of tracking single trades, you can add multiple assets to see your overall performance at a glance.\n\nThe core function is to compare your **Total Investment** (what you paid) against the **Current Portfolio Value** (what it's worth now).\n\n**Key Parameters Explained:**\n\n* **Amount Bought**: The quantity of the specific cryptocurrency you hold. For example, 0.5 BTC.\n* **Buy Price per Coin**: The price of a single unit of the cryptocurrency when you made the purchase. This is the foundation of your cost basis.\n* **Current Price per Coin**: The live market price of the coin. This determines the current market value of your holdings.\n* **Total Fees**: Often overlooked, fees can significantly impact your net profit. This includes exchange trading fees, network (gas) fees, and any other transaction costs.\n\n### **Part 2: Understanding the Results**\n\nOnce you've entered your assets, the calculator provides four key outputs:\n\n1.  **Total Investment**: This is your total cost basis. It's the sum of the purchase cost (`Amount Bought` * `Buy Price`) plus any `Fees` for all assets in your portfolio. It represents the total capital you have put at risk.\n\n2.  **Current Portfolio Value**: This is the real-time market value of all your holdings. It's calculated by summing up the current value (`Amount Bought` * `Current Price`) of each asset.\n\n3.  **Total Profit / Loss (P/L)**: The most straightforward indicator of performance. It's the difference between the *Current Portfolio Value* and your *Total Investment*. A positive number indicates an **unrealized gain**, while a negative number shows an **unrealized loss**.\n\n4.  **Portfolio ROI (%)**: Return on Investment provides a percentage-based measure of profitability, making it easy to compare performance against other investments. It's calculated as `(Total Profit / Loss) / Total Investment * 100`.\n\n#### **Unrealized vs. Realized Gains**\n\nIt's crucial to understand that this calculator tracks **unrealized** gains and losses. This means the profits or losses exist on paper but have not been 'locked in' by selling the asset. A gain only becomes **realized** when you sell the cryptocurrency for fiat currency (like USD) or trade it for another crypto. Realized gains are typically taxable events.\n\n### **Part 3: Strategic Portfolio Management**\n\nUsing a portfolio calculator is the first step in effective crypto management.\n\n* **Regularly Update Prices**: The crypto market is volatile. Update the 'Current Price' fields regularly to maintain an accurate view of your portfolio's health.\n* **Diversification**: The visual pie chart helps you see your portfolio's allocation. It can reveal if you are overly concentrated in a single asset, which might indicate a need to diversify to manage risk.\n* **Tax Planning**: By tracking your cost basis and unrealized gains, you can make more strategic decisions about when to sell assets to manage your tax obligations. Always consult with a tax professional for advice specific to your jurisdiction.\n\n### **Disclaimer**\n\nThis tool is for informational purposes only and does not constitute financial or tax advice. The calculations are based on the data you provide. The cryptocurrency market is extremely volatile, and investing carries a high level of risk. Always conduct your own research and/or consult a qualified financial advisor before making investment decisions.",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How do I calculate my crypto portfolio's total value?", "acceptedAnswer": { "@type": "Answer", "text": "To calculate your portfolio's total value, you multiply the amount of each coin you own by its current market price. Then, you sum the values of all the different coins in your portfolio. This calculator automates that process for you." } },
      { "@type": "Question", "name": "What's the difference between Profit/Loss and ROI?", "acceptedAnswer": { "@type": "Answer", "text": "Profit/Loss (P/L) is the absolute monetary gain or loss on your investment (e.g., +$5,000). Return on Investment (ROI) expresses this P/L as a percentage of your initial investment (e.g., +50%), which helps to standardize and compare the performance of different investments." } },
      { "@type": "Question", "name": "Are the profits shown by this calculator taxable?", "acceptedAnswer": { "@type": "Answer", "text": "This calculator shows 'unrealized' profits, which are not typically taxable events. A taxable event usually occurs when you 'realize' the profit by selling or trading your cryptocurrency. Tax laws vary significantly by country, so you should always consult a certified tax professional for advice." } },
      { "@type": "Question", "name": "Does this calculator account for staking rewards or airdrops?", "acceptedAnswer": { "@type": "Answer", "text": "No, this calculator is designed for direct purchases. To account for staking rewards or airdrops, you would typically add them as a new asset with a buy price of $0 (or the market price at the time of receipt, depending on tax regulations in your jurisdiction)." } }
    ]
  }
};


// --- TYPE DEFINITIONS ---
type PortfolioAsset = {
    id: string;
    assetName: string;
    amountBought: number;
    buyPrice: number;
    currentPrice: number;
    fees: number;
};

const initialNewAssetState = {
    assetName: '',
    amountBought: '',
    buyPrice: '',
    currentPrice: '',
    fees: ''
};

// --- MAIN COMPONENT ---
const CryptoPortfolioCalculator: React.FC = () => {
    const { slug, title, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
    const [newAsset, setNewAsset] = useState(initialNewAssetState);

    const handleNewAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewAsset(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAsset = useCallback(() => {
        const { assetName, amountBought, buyPrice, currentPrice } = newAsset;
        if (!assetName || !amountBought || !buyPrice || !currentPrice) {
            alert('Please fill in all required fields to add an asset.');
            return;
        }
        
        const assetToAdd: PortfolioAsset = {
            // FIX: Replaced uuidv4() with a native JS solution for unique IDs.
            id: `${Date.now()}-${Math.random()}`,
            assetName,
            amountBought: parseFloat(amountBought),
            buyPrice: parseFloat(buyPrice),
            currentPrice: parseFloat(currentPrice),
            fees: newAsset.fees ? parseFloat(newAsset.fees) : 0,
        };
        
        setPortfolio(prev => [...prev, assetToAdd]);
        setNewAsset(initialNewAssetState); // Reset form
    }, [newAsset]);

    const handleRemoveAsset = useCallback((id: string) => {
        setPortfolio(prev => prev.filter(asset => asset.id !== id));
    }, []);

    const handleReset = useCallback(() => {
        setPortfolio([]);
        setNewAsset(initialNewAssetState);
    }, []);

    const calculatedOutputs = useMemo(() => {
        let totalInvestment = 0;
        let currentPortfolioValue = 0;

        portfolio.forEach(asset => {
            totalInvestment += (asset.amountBought * asset.buyPrice) + asset.fees;
            currentPortfolioValue += asset.amountBought * asset.currentPrice;
        });

        const totalProfitLoss = currentPortfolioValue - totalInvestment;
        const totalRoi = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

        return { totalInvestment, currentPortfolioValue, totalProfitLoss, totalRoi };
    }, [portfolio]);

    const chartData = useMemo(() => {
        return portfolio.map(asset => ({
            name: asset.assetName,
            value: asset.amountBought * asset.currentPrice,
        })).filter(item => item.value > 0);
    }, [portfolio]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Left Column: Input and Portfolio List */}
                <div className="lg:col-span-2  -lg -md p-6 h-fit">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Asset</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {calculatorData.inputs.map(input => (
                            <div key={input.id} className={input.id === 'assetName' ? 'md:col-span-2' : ''}>
                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                    {input.label}
                                    <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>
                                </label>
                                <div className="flex items-center">
                                    {input.unit && <span className="text-gray-500 bg-gray-100 p-2 rounded-l-md border border-r-0 border-gray-300">{input.unit}</span>}
                                    <input
                                        id={input.id}
                                        name={input.id}
                                        aria-label={input.label}
                                        className={`w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 ${input.unit ? 'rounded-r-md' : 'rounded-md'}`}
                                        type={input.type}
                                        min={input.min}
                                        step={input.step}
                                        placeholder={input.placeholder}
                                        value={(newAsset as any)[input.id]}
                                        onChange={handleNewAssetChange}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddAsset} className="mt-4 w-full bg-indigo-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Add to Portfolio
                    </button>
                    
                    <hr className="my-6" />

                    <h3 className="text-lg font-bold mb-3 text-gray-800">Your Portfolio</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {portfolio.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Your portfolio is empty. Add an asset to begin.</p>
                        ) : (
                            portfolio.map(asset => (
                                <div key={asset.id} className="bg-gray-50 border rounded-md p-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{asset.assetName}</p>
                                        <p className="text-xs text-gray-500">{asset.amountBought} @ {formatCurrency(asset.buyPrice)}</p>
                                    </div>
                                    <button onClick={() => handleRemoveAsset(asset.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">REMOVE</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Results and Content */}
                <div className="lg:col-span-3 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> This tool is for informational purposes only and does not constitute financial advice. Market data is not live; please update current prices manually.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Key Metrics */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Portfolio Summary</h2>
                                {calculatorData.outputs.map(output => {
                                    const value = (calculatedOutputs as any)[output.id];
                                    const isProfit = output.id === 'totalProfitLoss' && value >= 0;
                                    const isLoss = output.id === 'totalProfitLoss' && value < 0;
                                    
                                    let formattedValue = '...';
                                    if (isClient) {
                                        if (output.id === 'totalRoi') formattedValue = formatPercent(value);
                                        else formattedValue = formatCurrency(value);
                                    }

                                    return (
                                        <div key={output.id} className="flex items-baseline justify-between border-b pb-2">
                                            <div className="text-sm font-medium text-gray-600">{output.label}</div>
                                            <div className={`text-xl font-bold ${isProfit ? 'text-green-600' : ''} ${isLoss ? 'text-red-600' : 'text-gray-800'}`}>
                                                <span>{formattedValue}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Chart */}
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                <h3 className="text-center font-semibold text-gray-600 text-sm mb-2">Portfolio Allocation</h3>
                                {isClient && portfolio.length > 0 && <DynamicPieChart data={chartData} />}
                                {portfolio.length === 0 && <p className="text-center text-sm text-gray-400 pt-20">Chart will appear here.</p>}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button onClick={handleReset} className="border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Portfolio</button>
                        </div>
                    </div>
                    
                    <section className="bg-white rounded-lg p-6 shadow-md">
                        <ContentRenderer content={content} />
                    </section>
                    
                    <section className="bg-white rounded-lg p-6 shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Authoritative Sources</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://coinmarketcap.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">CoinMarketCap</a> - For live price data and market capitalization.</li>
                            <li><a href="https://www.coinbase.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Coinbase</a> - A leading exchange for buying and selling cryptocurrencies.</li>
                            <li><a href="https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">IRS Guidance on Virtual Currency</a> - For U.S. tax information.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </>
    );
};

export default CryptoPortfolioCalculator;