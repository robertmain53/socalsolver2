'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export const meta = {
  title: "UK VAT Calculator - Add & Remove VAT Instantly",
  description: "Professional UK VAT calculator for businesses. Instantly add or remove VAT at 20%, 5%, 0% rates. Accurate calculations following HMRC guidelines."
};

// --- Info Icon for Tooltips (SVG inline to avoid dependencies) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Tooltip Component ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- SEO Schema for FAQ (JSON-LD) ---
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
            "name": "How do I know which VAT rate applies to my business?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The VAT rate depends on the type of goods or services you provide. Most standard business services are subject to the 20% standard rate. Check HMRC's VAT rates guidance or consult a tax professional for complex cases."
            }
          },
          {
            "@type": "Question",
            "name": "When do I need to register for VAT in the UK?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You must register for VAT if your taxable turnover exceeds £90,000 in any 12-month period, or you expect it to exceed this threshold in the next 30 days."
            }
          },
          {
            "@type": "Question",
            "name": "Can I reclaim VAT on business expenses if I'm not VAT registered?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, only VAT-registered businesses can reclaim VAT on their purchases and expenses. This is one of the key benefits of VAT registration."
            }
          }
        ]
      })
    }}
  />
);

// --- Markdown Content Renderer ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  };

  const blocks = content.split('\n\n');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **') || trimmedBlock.startsWith('###')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-blue-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#{3,4}\s*\**/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('#### **') || trimmedBlock.startsWith('####')) {
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-blue-600" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#{3,4}\s*\**/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('**') && trimmedBlock.includes('**:')) {
          return <h5 key={index} className="text-base font-semibold mt-3 mb-2 text-blue-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        }
        if (trimmedBlock.startsWith('- ')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^-\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
            </ul>
          );
        }
        if (trimmedBlock.match(/^\d\.\s/) || trimmedBlock.startsWith('1.')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d+\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
            </ol>
          );
        }
        if (trimmedBlock) {
          return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        }
        return null;
      })}
    </div>
  );
};

// Calculator data configuration
const calculatorData = {
  "slug": "ukc-vat-calculator",
  "category": "Tax and Freelance UK US CA",
  "title": "UK VAT Calculator (Version C)",
  "lang": "en",
  "inputs": [
    {
      "id": "amount",
      "label": "Amount",
      "type": "number" as const,
      "unit": "£",
      "min": 0,
      "step": 0.01,
      "tooltip": "Enter the monetary amount you want to calculate VAT for. This can be either the net amount (excluding VAT) or gross amount (including VAT)."
    },
    {
      "id": "vat_rate",
      "label": "VAT Rate",
      "type": "select" as const,
      "options": [
        { "value": 20, "label": "20% - Standard Rate" },
        { "value": 5, "label": "5% - Reduced Rate" },
        { "value": 0, "label": "0% - Zero Rate" },
        { "value": "custom", "label": "Custom Rate" }
      ],
      "tooltip": "Select the appropriate VAT rate. Standard rate (20%) applies to most goods and services. Reduced rate (5%) applies to items like domestic fuel. Zero rate (0%) applies to exports and books."
    },
    {
      "id": "custom_rate",
      "label": "Custom VAT Rate",
      "type": "number" as const,
      "unit": "%",
      "min": 0,
      "max": 100,
      "step": 0.1,
      "condition": "vat_rate == 'custom'",
      "tooltip": "Enter a custom VAT rate between 0% and 100%. This is useful for historical calculations or international VAT rates."
    },
    {
      "id": "calculation_type",
      "label": "Calculation Type",
      "type": "radio" as const,
      "options": [
        { "value": "add", "label": "Add VAT (Net → Gross)" },
        { "value": "remove", "label": "Remove VAT (Gross → Net)" }
      ],
      "tooltip": "Choose whether to add VAT to a net amount or remove VAT from a gross amount. 'Add VAT' calculates the total including VAT."
    }
  ],
  "outputs": [
    {
      "id": "net_amount",
      "label": "Net Amount (Excluding VAT)",
      "unit": "£"
    },
    {
      "id": "vat_amount",
      "label": "VAT Amount",
      "unit": "£"
    },
    {
      "id": "gross_amount",
      "label": "Gross Amount (Including VAT)",
      "unit": "£"
    },
    {
      "id": "effective_rate",
      "label": "Effective VAT Rate",
      "unit": "%"
    }
  ],
  "content": `### Introduction

The UK VAT Calculator is an essential tool designed for businesses, freelancers, accountants, and individuals who need to calculate Value Added Tax quickly and accurately. Whether you're preparing invoices, processing receipts, or managing VAT returns, this calculator provides instant, precise calculations for all UK VAT rates including the standard rate (20%), reduced rate (5%), and zero rate (0%).

This calculator is particularly valuable for SMEs (Small and Medium Enterprises) navigating UK tax obligations, international businesses trading with the UK, and professionals handling multiple VAT calculations daily. With the current VAT registration threshold at £90,000 (increased from £85,000 in April 2024), understanding VAT calculations is crucial for business compliance.

### How to Use the VAT Calculator

**Amount Field**: Enter the monetary value you want to calculate VAT for. This can be either net amount (excluding VAT) if you want to add VAT, or gross amount (including VAT) if you want to remove VAT.

**VAT Rate Selection**: Choose the appropriate rate for your goods or services:
- **20% Standard Rate**: Applies to most goods and services including electronics, clothing (adult), professional services, and restaurant meals
- **5% Reduced Rate**: Applied to domestic fuel and power, children's car seats, women's sanitary products, and certain energy-saving materials
- **0% Zero Rate**: Covers exports, books, newspapers, children's clothing and footwear, and most food items
- **Custom Rate**: Use for historical calculations, international rates, or special circumstances

**Calculation Type**: Select whether to add VAT to a net amount or remove VAT from a gross amount. The calculator instantly shows all relevant figures including the VAT amount, net amount, gross amount, and effective rate.

### VAT Calculation Methodology Explained

Our calculator uses the official HMRC-approved formulas for UK VAT calculations:

**Adding VAT Formula**:
Gross Amount = Net Amount × (1 + VAT Rate ÷ 100)
VAT Amount = Gross Amount - Net Amount

**Removing VAT Formula**:
Net Amount = Gross Amount ÷ (1 + VAT Rate ÷ 100)
VAT Amount = Gross Amount - Net Amount

**Rounding**: All calculations follow UK accounting standards with amounts rounded to two decimal places. The calculator uses standard rounding rules where .5 and above rounds up.

### Comprehensive UK VAT Guide 2025

**Current VAT Rates and Applications**:

The UK operates a multi-rate VAT system with four distinct categories:

**Standard Rate (20%)**:
- Most goods and services fall under this category
- Adult clothing and footwear
- Electronics and technology
- Professional services (legal, accounting, consultancy)
- Restaurant and hospitality services

**Reduced Rate (5%)**:
- Domestic fuel and electricity
- Children's car seats
- Women's sanitary products
- Certain energy-saving materials

**Zero Rate (0%)**:
- Exports to non-EU countries
- Books, newspapers, and magazines
- Children's clothing and footwear
- Most food items (excluding hot food, alcohol, confectionery)

**VAT Registration Requirements**:

Businesses must register for VAT if annual taxable turnover exceeds £90,000 (2025 threshold) or they expect to exceed the threshold within the next 30 days.

### Frequently Asked Questions (FAQ)

**Q: How do I know which VAT rate applies to my business?**
A: The VAT rate depends on the type of goods or services you provide. Most standard business services are subject to the 20% standard rate. Check HMRC's VAT rates guidance or consult a tax professional for complex cases.

**Q: When do I need to register for VAT in the UK?**
A: You must register for VAT if your taxable turnover exceeds £90,000 in any 12-month period, or you expect it to exceed this threshold in the next 30 days.

**Q: Can I reclaim VAT on business expenses if I'm not VAT registered?**
A: No, only VAT-registered businesses can reclaim VAT on their purchases and expenses. This is one of the key benefits of VAT registration.

**Q: How accurate is this calculator for official VAT returns?**
A: This calculator uses official HMRC formulas and rounding methods, making it highly accurate for standard VAT calculations. However, always verify complex calculations for unusual circumstances.`
};

const UkcVatCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  // Initial states
  const initialStates = {
    amount: 1000,
    vat_rate: 20,
    custom_rate: 10,
    calculation_type: "add"
  };

  const [states, setStates] = useState<{[key: string]: any}>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({...prev, [id]: value}));
  };

  const handleReset = () => {
    setStates(initialStates);
  };

  // Calculate outputs
  const calculatedOutputs = useMemo(() => {
    const { amount, vat_rate, custom_rate, calculation_type } = states;
    
    if (!amount || amount <= 0) {
      return {
        net_amount: 0,
        vat_amount: 0,
        gross_amount: 0,
        effective_rate: 0
      };
    }

    const rate = vat_rate === 'custom' ? custom_rate : vat_rate;
    const rateDecimal = rate / 100;

    let netAmount: number, vatAmount: number, grossAmount: number;

    if (calculation_type === 'add') {
      // Adding VAT: amount is net
      netAmount = amount;
      vatAmount = netAmount * rateDecimal;
      grossAmount = netAmount + vatAmount;
    } else {
      // Removing VAT: amount is gross
      grossAmount = amount;
      netAmount = grossAmount / (1 + rateDecimal);
      vatAmount = grossAmount - netAmount;
    }

    return {
      net_amount: Math.round(netAmount * 100) / 100,
      vat_amount: Math.round(vatAmount * 100) / 100,
      gross_amount: Math.round(grossAmount * 100) / 100,
      effective_rate: rate
    };
  }, [states]);

  // Chart data for visualization
  const pieChartData = calculatedOutputs.net_amount > 0 ? [
    { name: 'Net Amount', value: calculatedOutputs.net_amount, color: '#3b82f6' },
    { name: 'VAT Amount', value: calculatedOutputs.vat_amount, color: '#ef4444' }
  ] : [];

  const comparisonData = [
    { rate: '0%', amount: calculatedOutputs.net_amount },
    { rate: '5%', amount: calculatedOutputs.net_amount * 1.05 },
    { rate: '20%', amount: calculatedOutputs.net_amount * 1.20 }
  ];

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`${slug}-results.pdf`);
    } catch (_e) { alert("PDF export not available in this environment"); }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = { 
        slug, 
        title, 
        inputs: states, 
        outputs: calculatedOutputs, 
        timestamp: Date.now() 
      };
      const saved = JSON.parse(localStorage.getItem("vat_calc_results") || "[]");
      localStorage.setItem("vat_calc_results", JSON.stringify([payload, ...saved].slice(0, 50)));
      alert("Calculation saved successfully!");
    } catch { 
      alert("Unable to save calculation."); 
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { 
    style: 'currency', 
    currency: 'GBP' 
  }).format(value);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
        <div className="lg:col-span-2">
          <div className="p-6" ref={calculatorRef}>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-6 text-lg">
                Professional VAT calculator for UK businesses. Instantly add or remove VAT at current HMRC rates.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">i</span>
                  </div>
                  <strong className="text-blue-800">Current UK VAT Rates 2025:</strong>
                </div>
                <p className="text-blue-700 mt-1 text-sm">
                  Standard: 20% | Reduced: 5% | Zero: 0% | Registration threshold: £90,000
                </p>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg mb-6">
                {inputs.map(input => {
                  const conditionMet = !input.condition || (input.condition.includes("== 'custom'") && states[input.condition.split(' ')[0]] === 'custom');
                  if (!conditionMet) return null;

                  const inputLabel = (
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && (
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2"><InfoIcon /></span>
                        </Tooltip>
                      )}
                    </label>
                  );

                  if (input.type === 'select') {
                    return (
                      <div key={input.id} className="md:col-span-1">
                        {inputLabel}
                        <select
                          id={input.id}
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
                        >
                          {input.options?.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (input.type === 'radio') {
                    return (
                      <div key={input.id} className="md:col-span-2">
                        {inputLabel}
                        <div className="flex space-x-6">
                          {input.options?.map(option => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="radio"
                                name={input.id}
                                value={option.value}
                                checked={states[input.id] === option.value}
                                onChange={(e) => handleStateChange(input.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={input.id} className={input.id === 'amount' ? 'md:col-span-2' : ''}>
                      {inputLabel}
                      <div className="flex items-center space-x-2">
                        {input.unit === '£' && <span className="text-gray-500 font-medium">£</span>}
                        <input
                          id={input.id}
                          type="number"
                          min={input.min}
                          max={input.max}
                          step={input.step}
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                        />
                        {input.unit === '%' && <span className="text-gray-500 font-medium">%</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Calculation Results</h2>
                {outputs.map((output, index) => (
                  <div key={output.id} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                    index === 1 ? 'bg-red-50 border-red-500' : 
                    index === 2 ? 'bg-green-50 border-green-500' : 
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="font-medium text-gray-800">{output.label}</div>
                    <div className={`text-2xl font-bold ${
                      index === 1 ? 'text-red-600' : 
                      index === 2 ? 'text-green-600' : 
                      'text-blue-600'
                    }`}>
                      {isClient ? (
                        output.unit === '£' ? 
                        formatCurrency((calculatedOutputs as any)[output.id]) : 
                        `${(calculatedOutputs as any)[output.id]}${output.unit}`
                      ) : '...'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visualization */}
              {isClient && calculatedOutputs.net_amount > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">VAT Breakdown</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Rate Comparison</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
                          <XAxis dataKey="rate" />
                          <YAxis tickFormatter={(value) => `£${Math.round(value)}`} />
                          <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="amount" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Formula Section */}
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Calculation Formula</h3>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                {states.calculation_type === 'add' ? (
                  <div>
                    <p><strong>Adding VAT:</strong></p>
                    <p>Gross Amount = Net Amount × (1 + VAT Rate ÷ 100)</p>
                    <p>VAT Amount = Gross Amount - Net Amount</p>
                  </div>
                ) : (
                  <div>
                    <p><strong>Removing VAT:</strong></p>
                    <p>Net Amount = Gross Amount ÷ (1 + VAT Rate ÷ 100)</p>
                    <p>VAT Amount = Gross Amount - Net Amount</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Tools Section */}
          <section className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Calculator Tools</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={saveResult}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                💾 Save Calculation
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                📄 Export PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                🔄 Reset Calculator
              </button>
            </div>
          </section>

          {/* Guide Section */}
          <section className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Complete VAT Guide</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ContentRenderer content={content} />
            </div>
          </section>

          {/* Sources Section */}
          <section className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Official Sources & References</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://www.gov.uk/vat-rates" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  🏛️ HMRC VAT Rates - Official Government Guidelines
                </a>
              </li>
              <li>
                <a 
                  href="https://www.gov.uk/vat-registration-thresholds" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  📊 VAT Registration Thresholds 2025
                </a>
              </li>
              <li>
                <a 
                  href="https://www.gov.uk/guidance/making-tax-digital-for-vat" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  💻 Making Tax Digital for VAT
                </a>
              </li>
              <li>
                <a 
                  href="https://www.gov.uk/guidance/rates-and-allowances-excise-duty" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  📋 HMRC VAT Guidance for Businesses
                </a>
              </li>
              <li>
                <a 
                  href="https://www.gov.uk/vat-returns" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  📝 VAT Returns and Deadlines
                </a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Disclaimer:</strong> This calculator provides estimates for informational purposes. 
                Always consult HMRC guidelines or a qualified tax professional for official VAT advice.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
};

export default UkcVatCalculator;