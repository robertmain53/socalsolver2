'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

// --- Helper Components & Icons ---

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
    // This component remains the same as the previous version
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
        {content.split('\n\n').map((block, index) => {
            const trimmedBlock = block.trim();
            if (trimmedBlock.startsWith('### ')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace('### ', '')) }} />;
            if (trimmedBlock.startsWith('*')) {
            const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
            return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
            }
            if (trimmedBlock.match(/^\d\.\s/)) {
            const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
            return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
            }
            if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
            return null;
        })}
        </div>
    );
};


// --- Calculator Data (Unchanged) ---
const calculatorData = {
  // The JSON data from the first step remains identical.
  // For brevity, it's assumed to be here.
  "slug": "uk-vat-calculator", "category": "tax-and-freelance-uk-us-ca", "title": "UK VAT Calculator (Version A)", "lang": "en",
  "inputs": [{"id":"amount","label":"Amount (£)","type":"number" as const,"min":0,"step":10,"tooltip":"Enter the monetary value you want to calculate VAT on."},{"id":"calculationType","label":"Calculation Type","type":"radio" as const,"options":[{"value":"add","label":"Add VAT (from a Net amount)"},{"value":"remove","label":"Remove VAT (from a Gross amount)"}],"tooltip":"Choose whether you start from a price without VAT (Net) or a price that already includes VAT (Gross)."},{"id":"vatRate","label":"VAT Rate","type":"radio" as const,"options":[{"value":"20","label":"Standard (20%)"},{"value":"5","label":"Reduced (5%)"},{"value":"0","label":"Zero-Rated (0%)"}],"tooltip":"Select the appropriate VAT rate for the goods or services. The standard rate in the UK is 20%."}],
  "outputs": [{"id":"netAmount","label":"Net Amount (excl. VAT)","unit":"£"},{"id":"vatAmount","label":"VAT Amount","unit":"£"},{"id":"grossAmount","label":"Gross Amount (incl. VAT)","unit":"£"}],
"content": `### A Practical VAT Guide for UK Administrators

This tool is designed to speed up your calculations, but correct VAT administration is more than just numbers. This guide covers key daily tasks and compliance points for anyone managing VAT in a UK business.

### Issuing a Correct VAT Invoice

When you create an invoice for a customer, it **must** contain specific information to be legally valid. Use this as a checklist:

* **Unique invoice number** that follows a logical sequence.
* **Your company's name, address, and VAT registration number.**
* **The invoice date** and the **tax point** (the date of supply), if different.
* **The customer's name** and main address.
* A clear **description** of the goods or services provided.
* For each item, you must show the **quantity**, the **net price** (excluding VAT), and the **VAT rate** applied.
* The **total net amount** before VAT.
* The **total VAT amount**. It's not enough to just show the gross total.
* The **total gross amount** (including VAT).

### Checking Incoming Invoices

Before paying a supplier's invoice and reclaiming the VAT, you must check that it is valid. An invalid invoice from a supplier can lead to HMRC disallowing your VAT reclaim.

* **Check for a valid VAT number:** Does the supplier's VAT number look correct? You can verify it on the GOV.UK website.
* **Are all the details present?** Use the checklist above. If information is missing (like the VAT amount shown separately), request a corrected invoice before processing payment.
* **Is the VAT rate correct?** Does the 20% or 5% rate apply to the goods/services you purchased? This calculator can help you double-check their figures.

### Understanding Making Tax Digital (MTD)

Making Tax Digital for VAT is a legal requirement. It means you must:

1.  **Keep digital records:** All your VAT records and transactions must be stored digitally using compatible software (e.g., Xero, QuickBooks, Sage).
2.  **Submit via software:** Your VAT returns must be submitted to HMRC directly from your software. The old government gateway portal can no longer be used for this.

Your role is to ensure all data entry is accurate within this software, as it directly impacts the returns sent to HMRC.

### Record Keeping for HMRC

You must keep VAT records for **at least 6 years**. This includes:

* Copies of all invoices you issue.
* All original invoices you receive.
* Credit and debit notes.
* Records of any goods you've taken for personal use.
* Your **VAT account**, which is a summary of your input VAT (the VAT on your purchases) and output VAT (the VAT on your sales) for each period. Your accounting software should manage this for you.

### Common Administrative Pitfalls

* **Reclaiming VAT on non-business expenses:** You cannot reclaim VAT on items for purely personal use. For mixed-use items (like a phone), you can only reclaim the business portion.
* **Incorrectly handling customer deposits:** VAT is typically due on the date you receive a deposit, not when the final invoice is paid.
* **Late submissions:** Forgetting the quarterly deadline for VAT returns can result in penalties, so keep track of your submission dates.`,
  "seoSchema": {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What must be on a valid UK VAT invoice?","acceptedAnswer":{"@type":"Answer","text":"A valid UK VAT invoice must include a unique invoice number, your company's name, address, and VAT number, the customer's name and address, the date, a clear description of goods/services, and a breakdown of the net amount, VAT rate, VAT amount, and the total gross amount."}},{"@type":"Question","name":"What is Making Tax Digital (MTD) for VAT?","acceptedAnswer":{"@type":"Answer","text":"Making Tax Digital (MTD) for VAT requires UK businesses to keep all their VAT records digitally and submit their VAT returns to HMRC using MTD-compatible software. Manual submissions via the old government portal are no longer accepted."}},{"@type":"Question","name":"How long do I need to keep VAT records in the UK?","acceptedAnswer":{"@type":"Answer","text":"You must keep all VAT records, including invoices and your VAT account, for at least 6 years as required by HMRC."}}]}
};

// --- Types and State Definitions ---
type VatRate = '20' | '5' | '0';
type CalculationType = 'add' | 'remove';
type CalculatorMode = 'simple' | 'advanced';
type HistoryItem = { id: number; data: SimpleCalculatorState; outputs: { netAmount: number; vatAmount: number; grossAmount: number; }; };
type MultiLineItem = { id: number; amount: number | ''; vatRate: VatRate; };

type SimpleCalculatorState = {
  amount: number | '';
  calculationType: CalculationType;
  vatRate: VatRate;
  calculationDate: string;
};

// --- Helper Functions ---
const getStandardVatRateForDate = (dateStr: string): VatRate => {
    if (!dateStr) return '20';
    const date = new Date(dateStr);
    if (date >= new Date('2011-01-04')) return '20';
    if (date >= new Date('2010-01-01')) return '17.5' as any; // temp type fix
    if (date >= new Date('2008-12-01')) return '15' as any; // temp type fix
    if (date >= new Date('1991-04-01')) return '17.5' as any; // temp type fix
    return '20'; // Default for dates outside known ranges
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

// --- Main Calculator Component ---
const UkVatCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    
    // --- State Management ---
    const [mode, setMode] = useState<CalculatorMode>('simple');
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const initialSimpleState: SimpleCalculatorState = {
        amount: 100,
        calculationType: 'add',
        vatRate: '20',
        calculationDate: new Date().toISOString().split('T')[0]
    };
    const [simpleState, setSimpleState] = useState<SimpleCalculatorState>(initialSimpleState);
    
    const [multiLineState, setMultiLineState] = useState<MultiLineItem[]>([
        { id: Date.now(), amount: 100, vatRate: '20' }
    ]);

    // --- Effects ---
    useEffect(() => {
        setIsClient(true);
        // Load history from localStorage
        try {
            const savedHistory = localStorage.getItem(`${slug}-history`);
            if (savedHistory) setHistory(JSON.parse(savedHistory));
        } catch (e) { console.error("Failed to load history from localStorage", e); }

        // Load state from URL params
        const params = new URLSearchParams(window.location.search);
        const amount = params.get('amount');
        const calcType = params.get('type');
        const rate = params.get('rate');
        const date = params.get('date');
        if (amount && calcType && rate) {
            setSimpleState({
                amount: Number(amount),
                calculationType: calcType as CalculationType,
                vatRate: rate as VatRate,
                calculationDate: date || new Date().toISOString().split('T')[0]
            });
        }
    }, [slug]);

    // --- Calculation Logic ---
    const calculatedOutputs = useMemo(() => {
        let netAmount = 0, vatAmount = 0, grossAmount = 0;

        if (mode === 'simple') {
            const amount = Number(simpleState.amount) || 0;
            const historicalRate = getStandardVatRateForDate(simpleState.calculationDate);
            const rate = simpleState.vatRate === '20' ? Number(historicalRate) : Number(simpleState.vatRate);
            const multiplier = 1 + rate / 100;
            
            if (simpleState.calculationType === 'add') {
                netAmount = amount;
                grossAmount = amount * multiplier;
            } else {
                grossAmount = amount;
                netAmount = amount / multiplier;
            }
            vatAmount = grossAmount - netAmount;

        } else { // 'advanced' mode
            multiLineState.forEach(line => {
                const amount = Number(line.amount) || 0;
                const multiplier = 1 + Number(line.vatRate) / 100;
                // In advanced mode, we always assume amount is Net (Add VAT)
                const lineNet = amount;
                const lineGross = amount * multiplier;
                const lineVat = lineGross - lineNet;
                
                netAmount += lineNet;
                vatAmount += lineVat;
                grossAmount += lineGross;
            });
        }

        return { netAmount, vatAmount, grossAmount };
    }, [simpleState, multiLineState, mode]);

    // --- Handlers & Callbacks ---
    const handleSimpleStateChange = (id: keyof SimpleCalculatorState, value: any) => {
        setSimpleState(prev => {
            const newState = { ...prev, [id]: value };
            if (id === 'calculationDate') {
                const newRate = getStandardVatRateForDate(value);
                // Only update standard rate, not reduced or zero
                if (newState.vatRate === '20') {
                    newState.vatRate = newRate;
                }
            }
            return newState;
        });
    };
    
    const handleReset = useCallback(() => setSimpleState(initialSimpleState), [initialSimpleState]);
    
    const persistHistory = (newHistory: HistoryItem[]) => {
        setHistory(newHistory);
        try { localStorage.setItem(`${slug}-history`, JSON.stringify(newHistory)); } catch (e) { console.error("Failed to save history", e); }
    };
    
    const saveResult = useCallback(() => {
        if (mode !== 'simple') {
            alert("Saving is only available in Simple mode.");
            return;
        }
        const newHistoryItem: HistoryItem = { id: Date.now(), data: simpleState, outputs: calculatedOutputs };
        const newHistory = [newHistoryItem, ...history].slice(0, 5);
        persistHistory(newHistory);
        alert("Result saved to history!");
    }, [simpleState, calculatedOutputs, history, mode, slug]);

    const restoreFromHistory = (item: HistoryItem) => {
        setSimpleState(item.data);
        setMode('simple');
    };
    
    const generateShareLink = useCallback(() => {
        if (mode !== 'simple') {
            alert("Sharing is only available in Simple mode.");
            return;
        }
        const params = new URLSearchParams({
            amount: String(simpleState.amount),
            type: simpleState.calculationType,
            rate: simpleState.vatRate,
            date: simpleState.calculationDate
        });
        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url).then(() => alert("Shareable link copied to clipboard!"));
    }, [simpleState, mode]);

    const handleMultiLineChange = (id: number, field: keyof MultiLineItem, value: any) => {
        setMultiLineState(lines => lines.map(line => line.id === id ? { ...line, [field]: value } : line));
    };
    const addMultiLineRow = () => setMultiLineState(lines => [...lines, { id: Date.now(), amount: '', vatRate: '20' }]);
    const removeMultiLineRow = (id: number) => setMultiLineState(lines => lines.filter(line => line.id !== id));
    
    // --- Render ---
    if (!isClient) return <div>Loading calculator...</div>;

    return (
        <>
        <FaqSchema schema={seoSchema} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/80 font-sans">
            <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6" ref={calculatorRef}>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">Instantly add or remove UK VAT from any amount.</p>
                    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                        <button onClick={() => setMode('simple')} className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'simple' ? 'bg-white shadow' : ''}`}>Simple</button>
                        <button onClick={() => setMode('advanced')} className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'advanced' ? 'bg-white shadow' : ''}`}>Advanced</button>
                    </div>
                </div>

                {/* --- SIMPLE MODE UI --- */}
                {mode === 'simple' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="amount">Amount (£)</label>
                        <input id="amount" className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 text-lg px-3" type="number" min="0" value={simpleState.amount} onChange={(e) => handleSimpleStateChange('amount', e.target.value === "" ? "" : Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Calculation Type</label>
                        <div className="flex flex-wrap gap-2">{inputs[1].options?.map(o => <button key={o.value} onClick={() => handleSimpleStateChange('calculationType', o.value)} className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${simpleState.calculationType === o.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100'}`}>{o.label}</button>)}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">VAT Rate</label>
                        <div className="flex flex-wrap gap-2">{inputs[2].options?.map(o => <button key={o.value} onClick={() => handleSimpleStateChange('vatRate', o.value)} className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${simpleState.vatRate === o.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100'}`}>{o.label}</button>)}</div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor="calculationDate">Calculation Date <Tooltip text="Select a date to use historical VAT rates for standard calculations."><span className="ml-2"><InfoIcon/></span></Tooltip></label>
                        <input type="date" id="calculationDate" className="w-full md:w-1/2 border-gray-300 rounded-md shadow-sm" value={simpleState.calculationDate} onChange={e => handleSimpleStateChange('calculationDate', e.target.value)} />
                        {simpleState.vatRate !== '20' && <p className="text-xs text-gray-500 mt-1">Historical rate only applies to the Standard 20% rate.</p>}
                    </div>
                </div>
                )}
                
                {/* --- ADVANCED MODE UI --- */}
                {mode === 'advanced' && (
                <div>
                    <p className="text-sm text-gray-600 mb-4">Add multiple items to calculate a total VAT summary. All amounts are treated as Net (excluding VAT).</p>
                    <div className="space-y-2">
                    {multiLineState.map((line, index) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-lg">
                        <div className="col-span-5">
                            <label className="text-xs text-gray-500">Amount (£)</label>
                            <input type="number" value={line.amount} onChange={e => handleMultiLineChange(line.id, 'amount', e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm p-1.5"/>
                        </div>
                        <div className="col-span-6">
                            <label className="text-xs text-gray-500">VAT Rate</label>
                            <select value={line.vatRate} onChange={e => handleMultiLineChange(line.id, 'vatRate', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-1.5">
                                <option value="20">Standard (20%)</option><option value="5">Reduced (5%)</option><option value="0">Zero-Rated (0%)</option>
                            </select>
                        </div>
                        <div className="col-span-1 flex items-end h-full">
                            {multiLineState.length > 1 && <button onClick={() => removeMultiLineRow(line.id)} className="p-1.5"><TrashIcon/></button>}
                        </div>
                    </div>
                    ))}
                    </div>
                    <button onClick={addMultiLineRow} className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">+ Add another item</button>
                </div>
                )}

                {/* --- Results Section (Common for both modes) --- */}
                <div className="mt-8 pt-6 border-t border-dashed">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">{mode === 'simple' ? 'Calculation Results' : 'Total Summary'}</h2>
                    <div className="space-y-3">
                    {outputs.map(output => (
                        <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'grossAmount' ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                        <span className="text-base font-medium text-gray-700">{output.label}</span>
                        <span className={`text-2xl font-bold ${output.id === 'grossAmount' ? 'text-indigo-700' : 'text-gray-900'}`}>{formatCurrency((calculatedOutputs as any)[output.id])}</span>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
            </div>

            {/* Right Column: Actions & Content */}
            <aside className="lg:col-span-1 space-y-6">
            <section className="border rounded-lg p-4 bg-white shadow-lg">
                <h2 className="font-semibold mb-3 text-gray-800">Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={saveResult} disabled={mode==='advanced'} className="... ActionButton ... flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><HistoryIcon/> Save</button>
                    <button onClick={generateShareLink} disabled={mode==='advanced'} className="... ActionButton ... flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><ShareIcon/> Share</button>
                    <button onClick={handleReset} className="col-span-2 ... ResetButton ...">Reset Calculator</button>
                </div>
            </section>
            
            {history.length > 0 && (
            <section className="border rounded-lg p-4 bg-white shadow-lg">
                <h2 className="font-semibold mb-3 text-gray-800">Calculation History</h2>
                <ul className="space-y-2">
                    {history.map(item => (
                    <li key={item.id} onClick={() => restoreFromHistory(item)} className="p-2 border rounded-md hover:bg-gray-100 cursor-pointer text-sm">
                        <div className="font-semibold">{formatCurrency(item.outputs.grossAmount)} <span className="font-normal text-gray-600">({item.data.calculationType === 'add' ? 'Add' : 'Remove'} {item.data.vatRate}% on {formatCurrency(Number(item.data.amount))})</span></div>
                        <div className="text-xs text-gray-500">{new Date(item.id).toLocaleString()}</div>
                    </li>
                    ))}
                </ul>
                <button onClick={() => persistHistory([])} className="text-xs text-red-500 hover:underline mt-2">Clear History</button>
            </section>
            )}

            <section className="border rounded-lg p-4 bg-white shadow-lg">
                <h2 className="font-semibold mb-3 text-gray-800">Guide & Information</h2>
                <ContentRenderer content={calculatorData.content} />
            </section>
            </aside>
        </div>
        </>
    );
};

export default UkVatCalculator;