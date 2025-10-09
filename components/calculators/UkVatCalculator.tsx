'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";

// --- Service Worker Registration for PWA (Offline Functionality) ---
const PwaInstaller = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then(reg => console.log("Service Worker registered successfully:", reg.scope))
        .catch(err => console.error("Service Worker registration failed:", err));
    }
  }, []);
  return null;
};

// --- Data Types ---
type VatRateOption = '20' | '5' | '0' | 'custom';
type CalculationType = 'add' | 'remove';
type HistoryItem = {
    id: number;
    amount: number;
    vatRate: string;
    type: CalculationType;
    gross: number;
};

// --- Utility Functions ---
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);

// --- Contextual Content (Guides) ---
const contextualContent: Record<string, string> = {
  "20": "The standard VAT rate in the UK is **20%**. Most goods and services fall under this category.",
  "5": "A **5% reduced VAT rate** applies to some items, such as children's car seats and home energy.",
  "0": "**Zero-rated VAT (0%)** applies to essential items like most food, books, and children's clothes.",
  "custom": "You selected a **custom VAT rate**. Ensure this aligns with HMRC guidance or a special scheme.",
};

// --- CSS Styles (inline for artifact) ---
const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    background: 'white',
    boxShadow: '0 4px 20px rgba(58, 42, 26, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #F26B2E 0%, #3C9DA7 100%)',
    color: 'white',
    padding: '3rem 2rem 2rem',
    textAlign: 'center' as const
  },
  title: {
    fontSize: '2.4rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.95,
    fontWeight: '300',
    marginBottom: '1.5rem'
  },
  content: {
    padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: 1.6,
    color: '#3A2A1A',
    background: '#FFFEF7'
  },
  calculatorSection: {
    background: 'white',
    border: '2px solid #3C9DA7',
    borderRadius: '16px',
    padding: '2rem',
    margin: '2rem 0',
    boxShadow: '0 6px 25px rgba(60, 157, 167, 0.1)'
  },
  audienceBox: {
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF4E6 100%)',
    borderLeft: '4px solid #F26B2E',
    padding: '1.5rem',
    margin: '2rem 0',
    borderRadius: '0 8px 8px 0'
  },
  executiveSummary: {
    background: '#FBFDF9',
    border: '2px solid #A8E6CF',
    borderRadius: '12px',
    padding: '2rem',
    margin: '2rem 0'
  },
  keyTakeaways: {
    background: 'white',
    borderLeft: '4px solid #F9B934',
    padding: '1.5rem',
    margin: '1.5rem 0',
    boxShadow: '0 2px 8px rgba(58, 42, 26, 0.08)',
    borderRadius: '0 8px 8px 0'
  },
  sectionHeading: {
    color: '#C4622D',
    fontSize: '1.6rem',
    margin: '2.5rem 0 1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #E8DCC0',
    fontWeight: '600'
  },
  subHeading: {
    color: '#2D5861',
    fontSize: '1.3rem',
    margin: '2rem 0 1rem',
    fontWeight: '600'
  },
  infoBox: {
    background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
    border: '2px solid #F9B934',
    borderRadius: '12px',
    padding: '2rem',
    margin: '2rem 0'
  },
  warningBox: {
    background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
    border: '2px solid #EF4444',
    borderRadius: '12px',
    padding: '2rem',
    margin: '2rem 0'
  },
  successBox: {
    background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
    border: '2px solid #10B981',
    borderRadius: '12px',
    padding: '2rem',
    margin: '2rem 0'
  },
  rateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    margin: '2rem 0'
  },
  rateCard: {
    background: 'white',
    border: '2px solid #E8DCC0',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(58, 42, 26, 0.08)'
  },
  disclaimer: {
    fontSize: '0.9rem',
    color: '#6B5B47',
    fontStyle: 'italic',
    textAlign: 'center' as const,
    margin: '2rem 0',
    padding: '1rem',
    background: '#F5F3F0',
    borderRadius: '8px'
  }
};

// --- Main Component ---
const UkVatCalculator: React.FC = () => {
  // --- State Management ---
  const [amount, setAmount] = useState<number | ''>(100);
  const [vatRate, setVatRate] = useState<VatRateOption>('20');
  const [customVatRate, setCustomVatRate] = useState<number | ''>('');
  const [calcType, setCalcType] = useState<CalculationType>('add');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // --- Effects ---
  useEffect(() => {
    setIsClient(true);
    try {
      const savedHistory = localStorage.getItem('vat-calc-history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Could not load history from localStorage", error);
    }
  }, []);

  // --- Calculation Logic ---
  const effectiveVatRate = useMemo(() => {
    return vatRate === 'custom' ? Number(customVatRate) || 0 : Number(vatRate);
  }, [vatRate, customVatRate]);

  const results = useMemo(() => {
    const numAmount = Number(amount) || 0;
    const multiplier = 1 + effectiveVatRate / 100;
    let net = 0, gross = 0, vat = 0;

    if (calcType === 'add') {
      net = numAmount;
      gross = numAmount * multiplier;
    } else {
      gross = numAmount;
      net = isFinite(numAmount / multiplier) ? numAmount / multiplier : 0;
    }
    vat = gross - net;

    return { net, gross, vat };
  }, [amount, effectiveVatRate, calcType]);

  // --- Formula for Transparency ---
  const formulaDisplay = useMemo(() => {
    const ratePercent = `${effectiveVatRate.toFixed(2)}%`;
    if (calcType === 'add') {
      return `Net Amount × (1 + ${ratePercent}) = Gross Amount`;
    }
    return `Gross Amount ÷ (1 + ${ratePercent}) = Net Amount`;
  }, [effectiveVatRate, calcType]);

  // --- Event Handlers ---
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value === '' ? '' : parseFloat(e.target.value));
  };

  const addToHistory = useCallback(() => {
    const newEntry: HistoryItem = {
        id: Date.now(),
        amount: Number(amount) || 0,
        vatRate: `${effectiveVatRate}%`,
        type: calcType,
        gross: results.gross,
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    try {
      localStorage.setItem('vat-calc-history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Could not save history to localStorage", error);
    }
  }, [amount, effectiveVatRate, calcType, results, history]);

  const restoreFromHistory = (item: HistoryItem) => {
    setAmount(item.amount);
    setCalcType(item.type);
    const rate = parseFloat(item.vatRate);
    if ([20, 5, 0].includes(rate)) {
        setVatRate(String(rate) as VatRateOption);
    } else {
        setVatRate('custom');
        setCustomVatRate(rate);
    }
  };

  if (!isClient) {
    return <div style={{padding: '1.5rem', textAlign: 'center'}}>Loading calculator...</div>;
  }

  return (
    <>
      <PwaInstaller />
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>UK VAT Calculator & Complete Guide</h1>
          <p style={styles.subtitle}>Professional VAT calculations with comprehensive business guidance</p>
        </header>

        <main style={styles.content}>
          <section style={styles.audienceBox}>
            <h2 style={{color: '#C4622D', marginBottom: '1rem', fontSize: '1.3rem'}}>Professional VAT Management Tool</h2>
            <p>This comprehensive tool combines instant VAT calculations with strategic business guidance. Perfect for UK business owners, financial managers, accountants, and anyone who needs to understand VAT's impact on pricing, profits, and cash flow management.</p>
          </section>

          {/* Calculator Section */}
          <section style={styles.calculatorSection}>
            <h2 style={{color: '#2D5861', marginBottom: '2rem', fontSize: '1.4rem', textAlign: 'center'}}>VAT Calculator</h2>
            
            <div style={{maxWidth: '500px', margin: '0 auto'}}>
              <div style={{marginBottom: '1rem'}}>
                <label htmlFor="amount" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Amount</label>
                <div style={{position: 'relative'}}>
                  <div style={{pointerEvents: 'none', position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)'}}>
                    <span style={{color: '#6B7280', fontSize: '0.875rem'}}>£</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    style={{
                      width: '100%',
                      paddingLeft: '1.75rem',
                      paddingRight: '3rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.375rem',
                      fontSize: '1.25rem',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                <button 
                  onClick={() => setCalcType('add')} 
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: calcType === 'add' ? '#3C9DA7' : '#E5E7EB',
                    color: calcType === 'add' ? 'white' : '#374151'
                  }}
                >
                  Add VAT
                </button>
                <button 
                  onClick={() => setCalcType('remove')} 
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: calcType === 'remove' ? '#3C9DA7' : '#E5E7EB',
                    color: calcType === 'remove' ? 'white' : '#374151'
                  }}
                >
                  Remove VAT
                </button>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>VAT Rate</label>
                <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem'}}>
                  {(['20', '5', '0', 'custom'] as VatRateOption[]).map(rate => (
                    <button 
                      key={rate} 
                      onClick={() => setVatRate(rate)} 
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #D1D5DB',
                        cursor: 'pointer',
                        backgroundColor: vatRate === rate ? '#3C9DA7' : 'white',
                        color: vatRate === rate ? 'white' : '#374151',
                        textTransform: 'capitalize'
                      }}
                    >
                      {rate === 'custom' ? 'Custom' : `${rate}%`}
                    </button>
                  ))}
                  {vatRate === 'custom' && (
                    <div style={{position: 'relative'}}>
                      <input 
                        type="number" 
                        placeholder="e.g., 17.5" 
                        value={customVatRate} 
                        onChange={e => setCustomVatRate(e.target.value === '' ? '' : parseFloat(e.target.value))} 
                        style={{
                          width: '7rem',
                          border: '1px solid #D1D5DB',
                          borderRadius: '0.375rem',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          paddingRight: '1.5rem'
                        }} 
                      />
                      <span style={{position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '0.875rem'}}>%</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{...styles.successBox, marginBottom: '1rem'}}>
                <h3 style={{fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.5rem', color: '#047857'}}>Results</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#374151', marginBottom: '0.5rem'}}>
                  <span>Net Amount</span>
                  <span style={{fontFamily: 'monospace', fontSize: '1.125rem'}}>{formatCurrency(results.net)}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#374151', marginBottom: '0.5rem'}}>
                  <span>VAT Amount</span>
                  <span style={{fontFamily: 'monospace', fontSize: '1.125rem'}}>{formatCurrency(results.vat)}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#047857', fontWeight: 'bold'}}>
                  <span>Gross Amount</span>
                  <span style={{fontFamily: 'monospace', fontSize: '1.25rem'}}>{formatCurrency(results.gross)}</span>
                </div>
              </div>

              <div style={{textAlign: 'center', fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#F3F4F6', borderRadius: '0.375rem', fontFamily: 'monospace'}}>
                {formulaDisplay}
              </div>

              <button 
                onClick={addToHistory} 
                style={{
                  width: '100%',
                  backgroundColor: '#3C9DA7',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Save Calculation
              </button>

              {history.length > 0 && (
                <div style={{borderTop: '1px solid #E5E7EB', paddingTop: '1rem', marginTop: '1.5rem'}}>
                  <h3 style={{fontWeight: '600', marginBottom: '0.5rem'}}>Recent History</h3>
                  <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                    {history.map(item => (
                      <li 
                        key={item.id} 
                        onClick={() => restoreFromHistory(item)} 
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.375rem',
                          marginBottom: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#F9FAFB'
                        }}
                      >
                        <div>
                          <span style={{fontWeight: '600'}}>{formatCurrency(item.gross)}</span>
                          <span style={{color: '#6B7280', marginLeft: '0.5rem'}}>
                            ({item.type === 'add' ? 'Add' : 'Remove'} {item.vatRate} on {formatCurrency(item.amount)})
                          </span>
                        </div>
                        <span style={{fontSize: '0.75rem', color: '#9CA3AF'}}>{new Date(item.id).toLocaleTimeString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{borderTop: '1px solid #E5E7EB', paddingTop: '1rem', marginTop: '1.5rem'}}>
                <h3 style={{fontWeight: '600', marginBottom: '0.5rem'}}>Quick Guide</h3>
                <p style={{fontSize: '0.875rem', color: '#374151'}} dangerouslySetInnerHTML={{ __html: contextualContent[vatRate] || '' }} />
              </div>
            </div>
          </section>

          <section style={styles.executiveSummary}>
            <h2 style={{color: '#2D5861', marginBottom: '1rem', fontSize: '1.4rem'}}>Beyond the Calculation: Comprehensive VAT Guide</h2>
            <p>Understanding Value Added Tax (VAT) is a critical skill for anyone doing business in the United Kingdom. It's more than just adding or subtracting a percentage—it's a system that impacts pricing, profits, and cash flow. This guide transforms a tax obligation into a strategic management tool.</p>
            
            <div style={styles.keyTakeaways}>
              <strong>Key Strategic Benefits:</strong>
              <ul style={{listStyle: 'none', paddingLeft: 0}}>
                <li style={{margin: '0.8rem 0', paddingLeft: '1.5rem', position: 'relative'}}>
                  <span style={{content: '"•"', color: '#F9B934', fontWeight: 'bold', position: 'absolute', left: 0, fontSize: '1.2rem'}}>•</span>
                  Professional offline-capable PWA for instant calculations anywhere
                </li>
                <li style={{margin: '0.8rem 0', paddingLeft: '1.5rem', position: 'relative'}}>
                  <span style={{content: '"•"', color: '#F9B934', fontWeight: 'bold', position: 'absolute', left: 0, fontSize: '1.2rem'}}>•</span>
                  Flexible rates including custom options for special schemes
                </li>
                <li style={{margin: '0.8rem 0', paddingLeft: '1.5rem', position: 'relative'}}>
                  <span style={{content: '"•"', color: '#F9B934', fontWeight: 'bold', position: 'absolute', left: 0, fontSize: '1.2rem'}}>•</span>
                  Calculation history for record-keeping and pattern analysis
                </li>
                <li style={{margin: '0.8rem 0', paddingLeft: '1.5rem', position: 'relative'}}>
                  <span style={{content: '"•"', color: '#F9B934', fontWeight: 'bold', position: 'absolute', left: 0, fontSize: '1.2rem'}}>•</span>
                  Comprehensive business guidance integrated with practical calculations
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 style={styles.sectionHeading}>Understanding UK VAT: Strategic Framework</h2>
            
            <h3 style={styles.subHeading}>What is VAT?</h3>
            <p>Value Added Tax (VAT) is a consumption tax applied to nearly all goods and services sold by VAT-registered businesses. Businesses act as tax collectors for HMRC (Her Majesty's Revenue and Customs): they charge VAT to customers (called <strong>Output Tax</strong>) and pay VAT to their suppliers (called <strong>Input Tax</strong>). Periodically, they pay the difference to HMRC.</p>

            <h3 style={styles.subHeading}>The VAT Rates Explained</h3>
            <p>Knowing which rate to apply is essential for strategic business management:</p>

            <div style={styles.rateGrid}>
              <div style={styles.rateCard}>
                <h4 style={{color: '#F26B2E', marginBottom: '1rem'}}>Standard Rate (20%)</h4>
                <p><strong>Coverage:</strong> The default rate for most goods and services.</p>
                <p><strong>Examples:</strong> Consultancy services, electronics, adult clothing, restaurant meals.</p>
                <p><strong>Strategy:</strong> Standard cash flow cycle - emphasize net prices for B2B customers.</p>
              </div>

              <div style={styles.rateCard}>
                <h4 style={{color: '#F26B2E', marginBottom: '1rem'}}>Reduced Rate (5%)</h4>
                <p><strong>Coverage:</strong> Specific goods and services for social or health reasons.</p>
                <p><strong>Examples:</strong> Domestic energy (gas and electricity), children's car seats, smoking cessation products.</p>
                <p><strong>Strategy:</strong> Pricing advantage in targeted sectors - leverage government policy.</p>
              </div>

              <div style={styles.rateCard}>
                <h4 style={{color: '#F26B2E', marginBottom: '1rem'}}>Zero Rate (0%)</h4>
                <p><strong>Coverage:</strong> Still VAT-taxable but at 0% - can reclaim input VAT.</p>
                <p><strong>Examples:</strong> Most food items, books, newspapers, children's clothing and footwear.</p>
                <p><strong>Strategy:</strong> Maximum cash flow benefit - reinvest VAT savings into growth.</p>
              </div>
            </div>

            <div style={styles.warningBox}>
              <h4 style={{color: '#B91C1C', marginBottom: '1rem'}}>Critical Distinction: Zero-Rated vs. VAT Exempt</h4>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                <div>
                  <h5 style={{color: '#10B981', marginBottom: '0.5rem'}}>Zero-Rated (Advantageous)</h5>
                  <ul>
                    <li>Can reclaim input VAT</li>
                    <li>Charge 0% to customers</li>
                    <li>Often receive VAT refunds</li>
                    <li>Strong cash flow position</li>
                  </ul>
                </div>
                <div>
                  <h5 style={{color: '#EF4444', marginBottom: '0.5rem'}}>VAT Exempt (Restrictive)</h5>
                  <ul>
                    <li>Cannot reclaim input VAT</li>
                    <li>Cannot charge VAT</li>
                    <li>Must absorb VAT costs internally</li>
                    <li>Weaker cash flow position</li>
                  </ul>
                  <p style={{fontSize: '0.875rem', fontStyle: 'italic', marginTop: '1rem'}}>Examples: Financial services, insurance, healthcare, education</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 style={styles.sectionHeading}>VAT Registration: Strategic Decision Making</h2>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
              <div style={styles.infoBox}>
                <h4 style={{color: '#B45309', marginBottom: '1rem'}}>Compulsory Registration</h4>
                <p>You <strong>must</strong> register for VAT if your VAT-taxable turnover in the last 12 months has exceeded the <strong>£90,000</strong> threshold (2024/2025 tax year).</p>
                <p style={{fontSize: '0.9rem', marginTop: '1rem', fontStyle: 'italic'}}>This is a rolling threshold—monitor it constantly, not just at year-end.</p>
              </div>
              
              <div style={styles.successBox}>
                <h4 style={{color: '#047857', marginBottom: '1rem'}}>Voluntary Registration</h4>
                <p><strong>Pros:</strong> Reclaim VAT on business purchases; professional image for B2B clients.</p>
                <p><strong>Cons:</strong> Administrative burden; 20% price increase for consumer customers.</p>
                <p style={{fontSize: '0.9rem', marginTop: '1rem', fontStyle: 'italic'}}>Strategic consideration: Analyze your customer base before deciding.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 style={styles.sectionHeading}>Practical Business Implementation</h2>

            <h3 style={styles.subHeading}>Making Tax Digital (MTD) Compliance</h3>
            <div style={styles.warningBox}>
              <p><strong>MTD is mandatory, not optional.</strong> To remain compliant:</p>
              <ul>
                <li><strong>Keep Digital Records:</strong> All VAT-related accounting must be kept digitally using compatible software (Xero, QuickBooks, Sage).</li>
                <li><strong>Submit via Software:</strong> Quarterly VAT returns must be submitted through your software, not the old government gateway.</li>
                <li><strong>Administrator Responsibility:</strong> Ensure every transaction is entered promptly and accurately.</li>
              </ul>
            </div>

            <h3 style={styles.subHeading}>VAT Invoice Requirements</h3>
            <p>An incorrect invoice can invalidate VAT reclaim rights. Every VAT invoice must include:</p>
            
            <div style={styles.rateCard}>
              <ul>
                <li>Unique, sequential invoice number</li>
                <li>Company name, address, and VAT registration number</li>
                <li>Invoice date and time of supply (tax point)</li>
                <li>Customer's name and address</li>
                <li>Clear description of goods or services</li>
                <li>For each line: quantity, net price, VAT rate</li>
                <li>Total net amount, VAT amount, and gross total</li>
              </ul>
            </div>

            <h3 style={styles.subHeading}>VAT Reclaim Strategy: The Golden Rules</h3>
            <div style={styles.infoBox}>
              <p>You can only reclaim VAT on goods and services used <strong>wholly and exclusively for business purposes</strong>.</p>
              
              <h5 style={{color: '#B45309', marginTop: '1rem', marginBottom: '0.5rem'}}>Special Cases:</h5>
              <ul>
                <li><strong>Company Cars:</strong> Generally cannot reclaim VAT on purchase, but can reclaim on maintenance and business fuel</li>
                <li><strong>Business Entertainment:</strong> VAT on entertaining UK clients is almost never reclaimable</li>
                <li><strong>Mixed-Use Expenses:</strong> Only reclaim the business portion (e.g., business use percentage of phone bills)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 style={styles.sectionHeading}>International Trade Considerations</h2>
            <p>VAT rates interact significantly with international trade rules post-Brexit:</p>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
              <div style={styles.successBox}>
                <h4 style={{color: '#047857', marginBottom: '1rem'}}>Export Strategy</h4>
                <p>Most exports are zero-rated, providing cash flow advantages for international businesses. This creates opportunities for competitive global pricing while maintaining domestic profitability.</p>
              </div>
              
              <div style={styles.infoBox}>
                <h4 style={{color: '#B45309', marginBottom: '1rem'}}>Import Optimization</h4>
                <p>Import VAT can be optimized through strategic timing and accounting methods to improve working capital position. Consider monthly VAT returns for import-heavy businesses.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 style={styles.sectionHeading}>Frequently Asked Questions</h2>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div style={styles.rateCard}>
                <h4 style={{color: '#2D5861', marginBottom: '0.5rem'}}>How is VAT actually calculated?</h4>
                <p>The formulas are straightforward but must be applied correctly:</p>
                <ul>
                  <li><strong>To add VAT:</strong> <code>Gross Amount = Net Amount × (1 + VAT Rate / 100)</code></li>
                  <li><strong>To remove VAT:</strong> <code>Net Amount = Gross Amount ÷ (1 + VAT Rate / 100)</code></li>
                </ul>
              </div>
              
              <div style={styles.rateCard}>
                <h4 style={{color: '#2D5861', marginBottom: '0.5rem'}}>What happens if I make a mistake on my VAT return?</h4>
                <p>If the error is less than £10,000, you can usually correct it on your next VAT return. For larger errors, report immediately to HMRC using form VAT652.</p>
              </div>
              
              <div style={styles.rateCard}>
                <h4 style={{color: '#2D5861', marginBottom: '0.5rem'}}>Can I reclaim VAT I paid before registration?</h4>
                <p>Yes, within limits:</p>
                <ul>
                  <li><strong>Goods:</strong> Up to 4 years before registration (if you still have them)</li>
                  <li><strong>Services:</strong> Up to 6 months before registration</li>
                </ul>
              </div>
              
              <div style={styles.rateCard}>
                <h4 style={{color: '#2D5861', marginBottom: '0.5rem'}}>How does VAT work for international trade after Brexit?</h4>
                <p>Rules have changed significantly. Imports are subject to import VAT. Exports are generally zero-rated with proof of export. Digital services and EU trade involve complex "place of supply" rules requiring specialist advice.</p>
              </div>
            </div>
          </section>

          <div style={styles.disclaimer}>
            <p><em>This calculator and guide are for informational purposes only and do not constitute tax or legal advice. VAT rates and regulations can change. Always verify current rates with HMRC or consult qualified tax professionals for business-specific advice.</em></p>
          </div>
        </main>
      </div>
    </>
  );
};

export default UkVatCalculator;