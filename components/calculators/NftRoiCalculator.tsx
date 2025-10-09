'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- DYNAMICALLY IMPORT THE SINGLE CHART WRAPPER COMPONENT ---
const CostBreakdownChart = dynamic(() => import('./CostBreakdownChart'), { 
    ssr: false, 
    loading: () => (
        <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-500">Loading Chart...</p>
        </div>
    ) 
});


// --- INLINE SVG ICONS ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- REUSABLE COMPONENTS ---
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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


// --- CONFIGURATION DATA ---
const calculatorData = {
  "slug": "nft-roi-calculator",
  "category": "Finance and Investment",
  "title": "NFT ROI Calculator",
  "lang": "en",
  "description": "Calculate the real profit and ROI of your NFT trades by accounting for purchase price, gas fees, marketplace commissions, and creator royalties.",
  "inputs": [
    { "id": "purchasePrice", "label": "NFT Purchase Price", "type": "number", "unit": "ETH", "min": 0, "step": 0.01, "tooltip": "Enter the original price you paid for the NFT in its native currency (e.g., ETH)." },
    { "id": "salePrice", "label": "NFT Sale Price", "type": "number", "unit": "ETH", "min": 0, "step": 0.01, "tooltip": "Enter the price at which you sold or plan to sell the NFT." },
    { "id": "purchaseGasFee", "label": "Purchase Gas Fee", "type": "number", "unit": "ETH", "min": 0, "step": 0.001, "tooltip": "The blockchain transaction fee (gas) paid when you bought the NFT." },
    { "id": "saleGasFee", "label": "Sale & Listing Gas Fees", "type": "number", "unit": "ETH", "min": 0, "step": 0.001, "tooltip": "The total transaction fees for listing and completing the sale of the NFT." },
    { "id": "marketplaceFee", "label": "Marketplace Fee", "type": "number", "unit": "%", "min": 0, "step": 0.1, "tooltip": "The platform's commission on the sale price. For example, OpenSea typically charges 2.5%." },
    { "id": "creatorRoyalty", "label": "Creator Royalty", "type": "number", "unit": "%", "min": 0, "step": 0.1, "tooltip": "The percentage of the sale price that is automatically paid to the original creator of the NFT." }
  ],
  "outputs": [
    { "id": "netProfit", "label": "Net Profit / Loss", "unit": "ETH" },
    { "id": "roi", "label": "Return on Investment (ROI)", "unit": "%" },
    { "id": "totalCosts", "label": "Total Costs & Fees", "unit": "ETH" }
  ],
  "content": "### **A Comprehensive Guide to Calculating NFT Return on Investment (ROI)**\n\n**Understanding the True Costs and Profits of Your Digital Assets**\n\nThe world of Non-Fungible Tokens (NFTs) offers exciting investment opportunities, but calculating your actual profit can be more complex than simply subtracting the purchase price from the sale price. Transaction fees, marketplace commissions, and creator royalties can significantly impact your bottom line. \n\nThis guide will break down every component of an NFT transaction, explain how this calculator works, and provide insights to help you make more informed investment decisions. Our goal is to provide a tool and a resource that offers unparalleled clarity and authority.\n\n### **Part 1: How The NFT ROI Calculator Works**\n\nThis calculator provides a clear picture of your investment's performance by accounting for all associated costs. Here’s a detailed look at each input field:\n\n* **NFT Purchase Price**: This is the initial cost of the asset, the price you paid to acquire the NFT. \n* **NFT Sale Price**: The final price at which you sold the NFT on a marketplace. This is the gross revenue from your sale.\n* **Purchase Gas Fee**: Every transaction on a blockchain, including buying an NFT, requires a computational fee known as a \"gas fee.\" This is a mandatory cost for securing the network and processing your purchase.\n* **Sale & Listing Gas Fees**: Selling an NFT often involves multiple transactions (e.g., approving the collection, listing the item, and the final sale), each potentially incurring a gas fee. It's crucial to sum all these costs to get an accurate picture.\n* **Marketplace Fee**: Centralized and decentralized marketplaces (like OpenSea, LooksRare, or Magic Eden) charge a service fee, which is a percentage of the final sale price. This is their revenue for providing the platform.\n* **Creator Royalty**: A defining feature of NFTs, this is a percentage of the sale price automatically paid to the original creator of the artwork or collectible. This mechanism ensures artists continue to benefit from their work's growing value in the secondary market.\n\n### **Part 2: A Deeper Dive into NFT Transaction Costs**\n\nTo master NFT trading, you must understand the nuances of its costs.\n\n* **Gas Fees**: Gas fees are paid in the native currency of the blockchain (e.g., ETH on Ethereum). They fluctuate based on network congestion. A high volume of transactions means higher fees. \n* **Marketplace Fees**: Different platforms have different fee structures. For example, OpenSea typically charges a flat 2.5% fee on every sale.\n* **Creator Royalties**: While royalties reduce a seller's profit, they are vital for a healthy and sustainable creator economy.\n\n### **Part 3: Risks and Disclaimer**\n\nThe NFT market is highly volatile and speculative. Prices can change dramatically, and there is a significant risk of losing your entire investment. This calculator is an informational tool, not financial advice. Always conduct your own research (DYOR) and never invest more than you can afford to lose.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "What is NFT ROI and how is it calculated?", "acceptedAnswer": { "@type": "Answer", "text": "NFT Return on Investment (ROI) measures the profitability of an NFT trade. It's calculated by dividing the net profit (Sale Price minus all costs, including purchase price, gas fees, and royalties) by the total initial investment, and then multiplying by 100 to get a percentage." } }, { "@type": "Question", "name": "How are NFT marketplace fees calculated?", "acceptedAnswer": { "@type": "Answer", "text": "Marketplace fees are almost always calculated as a percentage of the final sale price. For example, if you sell an NFT for 2 ETH on a platform with a 2.5% fee, the marketplace will take 0.05 ETH (2 * 0.025) as its commission." } }, { "@type": "Question", "name": "Are profits from selling NFTs taxable?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, in most jurisdictions, profits from selling NFTs are considered taxable events, often treated as capital gains or income. Tax laws vary significantly by country. It is highly recommended to consult with a qualified tax professional in your region to ensure compliance." } }] }
};

const NftRoiCalculator: React.FC = () => {
    const { slug, title, description, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        purchasePrice: 0.5,
        salePrice: 1.5,
        purchaseGasFee: 0.01,
        saleGasFee: 0.02,
        marketplaceFee: 2.5,
        creatorRoyalty: 7.5
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { purchasePrice, salePrice, purchaseGasFee, saleGasFee, marketplaceFee, creatorRoyalty } = states;
        const totalInvestment = purchasePrice + purchaseGasFee;
        const platformCut = salePrice * (marketplaceFee / 100);
        const creatorCut = salePrice * (creatorRoyalty / 100);
        const totalCosts = totalInvestment + saleGasFee + platformCut + creatorCut;
        const netProfit = salePrice - totalCosts;
        const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
        return { netProfit, roi, totalCosts, platformCut, creatorCut };
    }, [states]);

    const formatNumber = (value: number, unit: string) => {
        const isPercentage = unit === '%';
        const options: Intl.NumberFormatOptions = {
            maximumFractionDigits: isPercentage ? 2 : 4,
            minimumFractionDigits: isPercentage ? 2 : 2,
        };
        const formatted = new Intl.NumberFormat('en-US', options).format(value);
        return isPercentage ? `${formatted}%` : `${formatted} ${unit}`;
    };
    
    const formula = `Net Profit = Sale Price - (Purchase Price + All Gas Fees + Marketplace Fee + Creator Royalty)`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (calculatorRef.current) {
                const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'pt', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${slug}-results.pdf`);
            }
        } catch (error) {
            console.error("PDF export failed:", error);
            alert("Could not export to PDF. Please try again.");
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const { platformCut, creatorCut, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, timestamp: new Date().toISOString() };
            const existingResults = JSON.parse(localStorage.getItem("nft_calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 10); // Keep last 10
            localStorage.setItem("nft_calc_results", JSON.stringify(newResults));
            alert("Result saved successfully!");
        } catch {
            alert("Failed to save result.");
        }
    }, [states, calculatedOutputs, slug, title]);

    const costBreakdownData = useMemo(() => [
      { name: 'Initial Price', value: states.purchasePrice || 0 },
      { name: 'Gas Fees', value: (states.purchaseGasFee || 0) + (states.saleGasFee || 0) },
      { name: 'Marketplace Fee', value: calculatedOutputs.platformCut || 0 },
      { name: 'Creator Royalty', value: calculatedOutputs.creatorCut || 0 },
    ].filter(item => item.value > 0), [states, calculatedOutputs]);
    
    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/50 font-sans">
                
                <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6" ref={calculatorRef}>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                    <p className="text-gray-600 mb-6">{description}</p>

                    <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                        <strong>Disclaimer:</strong> This calculator is for informational purposes only and does not constitute financial advice. The NFT market is highly volatile.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {inputs.map(input => (
                            <div key={input.id}>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                                    {input.label}
                                    <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                </label>
                                <div className="relative">
                                    <input
                                        id={input.id}
                                        type="number"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2"
                                        min={input.min}
                                        step={input.step}
                                        value={states[input.id]}
                                        onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : parseFloat(e.target.value))}
                                    />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 pointer-events-none">{input.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Calculation Results</h2>
                        {outputs.map(output => {
                             const value = (calculatedOutputs as any)[output.id];
                             const isProfit = output.id === 'netProfit' && value >= 0;
                             const isLoss = output.id === 'netProfit' && value < 0;
                             const isROI = output.id === 'roi';

                            return (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${isProfit ? 'bg-green-50 border-green-500' : isLoss ? 'bg-red-50 border-red-500' : isROI ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${isProfit ? 'text-green-600' : isLoss ? 'text-red-600' : isROI ? 'text-indigo-600' : 'text-gray-900'}`}>
                                        {isClient ? formatNumber(value, output.unit) : '...'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Costs Breakdown</h3>
                        <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                            <CostBreakdownChart data={costBreakdownData} />
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-sm p-4 bg-gray-50/80">
                        <h3 className="font-semibold text-gray-700">Formula Used</h3>
                        <p className="text-xs text-gray-600 mt-2 p-3 bg-white rounded font-mono break-words shadow-inner">{formula}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Result</button>
                            <button onClick={handleExportPDF} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Export PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm font-medium border border-red-200 bg-red-50 rounded-md px-3 py-2 text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calculator</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-5 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Guide & Insights</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-5 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Authoritative Sources</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://etherscan.io/gastracker" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Etherscan Gas Tracker</a></li>
                            <li><a href="https://support.opensea.io/hc/en-us/articles/360062142753-What-fees-do-I-pay-on-OpenSea-" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">OpenSea Fee Policy</a></li>
                            <li><a href="https://www.coinbase.com/learn/crypto-basics/what-is-an-nft" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">What is an NFT? (Coinbase)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default NftRoiCalculator;