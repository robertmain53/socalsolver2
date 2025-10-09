'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './VatThresholdGuide.module.css';

interface ThresholdScenario {
  businessType: string;
  turnover: string;
  recommendation: 'Mandatory' | 'Consider Early' | 'Monitor' | 'Voluntary Strategy';
  reasoning: string;
  action: string;
}

interface RegistrationStep {
  step: number;
  title: string;
  description: string;
  timeframe: string;
  tip: string;
}

const VatThresholdGuide: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeScenario, setActiveScenario] = useState(0);
  const [thresholdCalculator, setThresholdCalculator] = useState({
    month1: 0, month2: 0, month3: 0, month4: 0, month5: 0, month6: 0,
    month7: 0, month8: 0, month9: 0, month10: 0, month11: 0, month12: 0
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setReadingProgress(Math.min(scrolled, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const calculateTotal = () => {
    return Object.values(thresholdCalculator).reduce((sum, value) => sum + value, 0);
  };

  const thresholdScenarios: ThresholdScenario[] = [
    {
      businessType: "Growing SaaS Startup",
      turnover: "£65,000 (projected £90,000 next year)",
      recommendation: "Consider Early",
      reasoning: "Rapid growth trajectory indicates threshold breach likely within 6 months",
      action: "Register voluntarily now to avoid compliance scramble during critical growth phase"
    },
    {
      businessType: "Freelance Consultant",
      turnover: "£45,000 (stable for 3 years)",
      recommendation: "Monitor",
      reasoning: "Below threshold with stable income, but client mix changing toward larger corporate accounts",
      action: "Track monthly revenue and prepare registration materials for quick deployment if needed"
    },
    {
      businessType: "E-commerce Retailer",
      turnover: "£88,000 (exceeded last month)",
      recommendation: "Mandatory",
      reasoning: "Already exceeded threshold - registration is legally required",
      action: "Register immediately to avoid penalties and begin VAT-compliant pricing"
    },
    {
      businessType: "Professional Services Firm",
      turnover: "£30,000 (targeting corporate clients)",
      recommendation: "Voluntary Strategy",
      reasoning: "Corporate clients prefer VAT-registered suppliers for credibility and administrative simplicity",
      action: "Consider voluntary registration to enhance professional positioning and competitive advantage"
    }
  ];

  const registrationSteps: RegistrationStep[] = [
    {
      step: 1,
      title: "Prepare Required Information",
      description: "Gather business details, expected turnover, business activities, and bank account information",
      timeframe: "1-2 days",
      tip: "Have your business bank statements and expected turnover calculations ready before starting"
    },
    {
      step: 2,
      title: "Complete Online Application",
      description: "Use HMRC's online VAT registration service via Government Gateway",
      timeframe: "30-60 minutes",
      tip: "Complete the application in one session - you cannot save progress midway"
    },
    {
      step: 3,
      title: "Submit Supporting Documents",
      description: "Provide business registration documents, bank statements, and turnover evidence",
      timeframe: "1-3 days",
      tip: "Scan documents at high quality to avoid delays in processing"
    },
    {
      step: 4,
      title: "Receive VAT Number",
      description: "HMRC processes application and issues VAT registration number",
      timeframe: "2-6 weeks",
      tip: "You can start charging VAT from your registration date, not when you receive the number"
    },
    {
      step: 5,
      title: "Update Business Systems",
      description: "Configure invoicing, accounting software, and inform customers/suppliers",
      timeframe: "1-2 weeks",
      tip: "Update all marketing materials and contracts to include VAT registration number"
    },
    {
      step: 6,
      title: "Submit First VAT Return",
      description: "Complete and submit your initial quarterly VAT return to HMRC",
      timeframe: "Quarterly deadline",
      tip: "Set up calendar reminders for quarterly return deadlines from day one"
    }
  ];

  const handleMonthChange = (month: keyof typeof thresholdCalculator, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setThresholdCalculator(prev => ({
      ...prev,
      [month]: numericValue
    }));
  };

  const total = calculateTotal();
  const isOverThreshold = total > 85000;

  return (
    <div>
      <div 
        className={styles.progressBar}
        style={{ width: `${readingProgress}%` }}
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>To Register or Not? Understanding the £85,000 VAT Threshold</h1>
          <p className={styles.subtitle}>Strategic Decision-Making for Growing UK Businesses at the Critical Inflection Point</p>
        </header>

        <main className={styles.content}>
          <section className={styles.audienceBox}>
            <h2>Who Is This Guide For?</h2>
            <p>This strategic guide serves UK business owners, freelancers, and growth-stage companies approaching or considering the £85,000 VAT registration threshold. Whether you&apos;re experiencing rapid growth, evaluating voluntary registration, or planning future expansion, this guide provides the strategic framework to make informed decisions about one of the most critical compliance and business development choices you&apos;ll face.</p>
          </section>

          <section className={styles.executiveSummary}>
            <h2>Executive Summary</h2>
            <p>The £85,000 VAT registration threshold represents far more than a tax compliance requirement—it&apos;s a strategic inflection point that fundamentally changes your business operations, competitive positioning, and growth trajectory. This threshold decision affects cash flow, customer relationships, administrative complexity, and market perception in ways that can either accelerate or constrain business development.</p>
            
            <div className={styles.keyTakeaways}>
              <strong>Critical Success Factors:</strong>
              <ul>
                <li>🎯 The threshold calculation uses rolling 12-month periods, not calendar years—requiring continuous monitoring</li>
                <li>💰 Registration transforms your relationship with cash flow, suppliers, and customer pricing strategies</li>
                <li>⚡ Early voluntary registration can provide competitive advantages that outweigh administrative burdens</li>
                <li>📊 Strategic planning around the threshold can accelerate growth rather than constrain it</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>Understanding the £85,000 Threshold: More Than Just a Number</h2>
            <p>The current VAT registration threshold of <strong>£85,000</strong> represents the government&apos;s attempt to balance administrative efficiency with economic fairness. This figure isn&apos;t arbitrary—it reflects economic modeling designed to capture significant business activity while protecting smaller enterprises from disproportionate compliance burdens.</p>

            <div className={styles.thresholdInsight}>
              <h4>💡 Strategic Insight</h4>
              <p>From a business strategy perspective, the threshold creates what economists call a <strong>&quot;cliff effect&quot;</strong>—a sudden change in operating conditions that can dramatically impact business decisions. Smart businesses anticipate this cliff rather than stumble over it.</p>
            </div>

            <h3>What Counts Toward the Threshold?</h3>
            <p>Understanding <strong>VAT taxable turnover</strong> calculation is crucial for accurate threshold monitoring:</p>

            <div className={styles.turnoverExplanation}>
              <div className={styles.includeExclude}>
                <div className={styles.includeSection}>
                  <h4>✅ INCLUDES (VAT Taxable Turnover)</h4>
                  <ul>
                    <li>💼 All standard-rated sales (20%)</li>
                    <li>🏥 All reduced-rate sales (5%)</li>
                    <li>📚 All zero-rated sales (0%)</li>
                    <li>🌍 Exports and international services</li>
                    <li>🎁 Goods given away for business purposes</li>
                  </ul>
                </div>
                <div className={styles.excludeSection}>
                  <h4>❌ EXCLUDES (Not VAT Taxable)</h4>
                  <ul>
                    <li>🏦 VAT exempt sales (financial services, insurance)</li>
                    <li>💰 Capital asset sales (equipment, property)</li>
                    <li>🎯 Sales outside the scope of UK VAT</li>
                    <li>📋 VAT itself (always calculate on net amounts)</li>
                    <li>🔄 Reverse charge transactions</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3>The Rolling 12-Month Calculation</h3>
            <p>The threshold operates on a <strong>rolling 12-month basis</strong>—not calendar years or financial years. This means you must monitor your cumulative turnover continuously, looking back 12 months from any given date.</p>

            <div className={styles.calculatorSection}>
              <h4>🧮 Interactive Threshold Calculator</h4>
              <p>Enter your monthly VAT taxable turnover to see your rolling 12-month position:</p>
              
              <div className={styles.monthlyInputs}>
                {Object.keys(thresholdCalculator).map((month, index) => (
                  <div key={month} className={styles.monthInput}>
                    <label>Month {index + 1}</label>
                    <input
                      type="number"
                      placeholder="£0"
                      onChange={(e) => handleMonthChange(month as keyof typeof thresholdCalculator, e.target.value)}
                      className={styles.turnoverInput}
                    />
                  </div>
                ))}
              </div>
              
              <div className={styles.calculatorResult}>
                <div className={styles.totalDisplay}>
                  <span className={styles.totalLabel}>Rolling 12-Month Total:</span>
                  <span className={`${styles.totalAmount} ${isOverThreshold ? styles.overThreshold : styles.underThreshold}`}>
                    £{total.toLocaleString()}
                  </span>
                </div>
                <div className={styles.thresholdStatus}>
                  {isOverThreshold ? (
                    <div className={styles.mandatoryAlert}>
                      🚨 <strong>Registration Required:</strong> You have exceeded the £85,000 threshold and must register for VAT
                    </div>
                  ) : (
                    <div className={styles.optionalAlert}>
                      ✅ <strong>Below Threshold:</strong> Registration is voluntary - consider the strategic implications
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Mandatory vs. Voluntary Registration: The Strategic Matrix</h2>
            <p>The registration decision isn&apos;t simply about legal compliance—it&apos;s about strategic positioning, operational efficiency, and competitive advantage. Different business models and market positions create different optimal strategies.</p>

            <div className={styles.registrationMatrix}>
              <div className={styles.matrixHeader}>
                <h3>Registration Decision Framework</h3>
                <p>Analyze your position using multiple strategic dimensions:</p>
              </div>

              <div className={styles.matrixGrid}>
                <div className={styles.matrixQuadrant}>
                  <h4>🎯 High-Growth B2B</h4>
                  <div className={styles.quadrantContent}>
                    <strong>Scenario:</strong> Rapid growth, corporate clients<br/>
                    <strong>Strategy:</strong> Early voluntary registration<br/>
                    <strong>Benefit:</strong> Credibility + input VAT recovery
                  </div>
                </div>
                
                <div className={styles.matrixQuadrant}>
                  <h4>🏪 Stable B2C Retail</h4>
                  <div className={styles.quadrantContent}>
                    <strong>Scenario:</strong> Consumer-focused, price-sensitive market<br/>
                    <strong>Strategy:</strong> Delay until mandatory<br/>
                    <strong>Benefit:</strong> Maintain pricing advantage
                  </div>
                </div>
                
                <div className={styles.matrixQuadrant}>
                  <h4>⚡ Digital Nomad</h4>
                  <div className={styles.quadrantContent}>
                    <strong>Scenario:</strong> Service-based, international clients<br/>
                    <strong>Strategy:</strong> Consider voluntary based on client mix<br/>
                    <strong>Benefit:</strong> Professional credibility
                  </div>
                </div>
                
                <div className={styles.matrixQuadrant}>
                  <h4>🏗️ Capital-Intensive Business</h4>
                  <div className={styles.quadrantContent}>
                    <strong>Scenario:</strong> High equipment/premises costs<br/>
                    <strong>Strategy:</strong> Early registration beneficial<br/>
                    <strong>Benefit:</strong> Significant input VAT recovery
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Business Scenario Analysis</h2>
            <p>Explore real-world threshold decisions through detailed business scenarios:</p>
            
            <div className={styles.scenarioNavigator}>
              <div className={styles.scenarioTabs}>
                {thresholdScenarios.map((scenario, index) => (
                  <button 
                    key={index}
                    className={`${styles.scenarioTab} ${activeScenario === index ? styles.active : ''}`}
                    onClick={() => setActiveScenario(index)}
                  >
                    {scenario.businessType}
                  </button>
                ))}
              </div>
              
              <div className={styles.scenarioContent}>
                <div className={styles.scenarioCard}>
                  <h3>{thresholdScenarios[activeScenario].businessType}</h3>
                  
                  <div className={styles.scenarioDetails}>
                    <div className={styles.scenarioMetric}>
                      <strong>📊 Current Turnover:</strong>
                      <span>{thresholdScenarios[activeScenario].turnover}</span>
                    </div>
                    
                    <div className={styles.scenarioRecommendation}>
                      <strong>🎯 Recommendation:</strong>
                      <span className={styles.recommendationBadge}>
                        {thresholdScenarios[activeScenario].recommendation}
                      </span>
                    </div>
                    
                    <div className={styles.scenarioReasoning}>
                      <strong>💭 Strategic Reasoning:</strong>
                      <p>{thresholdScenarios[activeScenario].reasoning}</p>
                    </div>
                    
                    <div className={styles.scenarioAction}>
                      <strong>⚡ Recommended Action:</strong>
                      <p>{thresholdScenarios[activeScenario].action}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>The Benefits of VAT Registration: Beyond Compliance</h2>
            <p>VAT registration unlocks strategic advantages that extend far beyond legal compliance. Understanding these benefits enables businesses to view registration as an investment in growth rather than a regulatory burden.</p>

            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <h4>💸 Input VAT Recovery</h4>
                <div className={styles.benefitContent}>
                  <p><strong>Immediate Impact:</strong> Reclaim VAT on all business purchases</p>
                  <p><strong>Strategic Value:</strong> Reduces effective costs of equipment, supplies, and services by up to 20%</p>
                  <div className={styles.benefitExample}>
                    <strong>Example:</strong> A £12,000 equipment purchase costs only £10,000 net after VAT recovery
                  </div>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <h4>🏆 Enhanced Credibility</h4>
                <div className={styles.benefitContent}>
                  <p><strong>Market Perception:</strong> VAT registration signals substantial, professional operations</p>
                  <p><strong>B2B Advantage:</strong> Corporate clients often prefer VAT-registered suppliers for administrative simplicity</p>
                  <div className={styles.benefitExample}>
                    <strong>Real Impact:</strong> Consulting firms report 30% higher success rates with corporate tenders when VAT-registered
                  </div>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <h4>💰 Cash Flow Optimization</h4>
                <div className={styles.benefitContent}>
                  <p><strong>Timing Advantage:</strong> Collect VAT from customers before paying HMRC</p>
                  <p><strong>Working Capital:</strong> Use collected VAT as short-term financing for operations</p>
                  <div className={styles.benefitExample}>
                    <strong>Calculation:</strong> £100k quarterly turnover provides ~£20k temporary working capital
                  </div>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <h4>🎯 Competitive Positioning</h4>
                <div className={styles.benefitContent}>
                  <p><strong>Market Access:</strong> Participate in tenders requiring VAT registration</p>
                  <p><strong>Supply Chain:</strong> Access to VAT-registered supplier networks and wholesale markets</p>
                  <div className={styles.benefitExample}>
                    <strong>Opportunity:</strong> Government contracts often require VAT registration for eligibility
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>The Administrative Reality: What Registration Actually Involves</h2>
            <p>Understanding the true administrative burden of VAT registration enables realistic planning and resource allocation. Modern business systems and professional support can significantly reduce complexity.</p>

            <div className={styles.adminBreakdown}>
              <div className={styles.adminCategory}>
                <h4>📋 Quarterly Responsibilities</h4>
                <div className={styles.adminDetails}>
                  <ul>
                    <li><strong>VAT Return Submission:</strong> 15-30 minutes with good accounting software</li>
                    <li><strong>Payment/Refund Processing:</strong> Automatic with direct debit setup</li>
                    <li><strong>Record Reconciliation:</strong> Monthly review prevents quarter-end rushes</li>
                  </ul>
                  <div className={styles.adminTip}>
                    💡 <strong>Efficiency Tip:</strong> Cloud accounting software like Xero or QuickBooks automates most VAT calculations
                  </div>
                </div>
              </div>

              <div className={styles.adminCategory}>
                <h4>📊 Record-Keeping Requirements</h4>
                <div className={styles.adminDetails}>
                  <ul>
                    <li><strong>Sales Records:</strong> All invoices with correct VAT treatment</li>
                    <li><strong>Purchase Records:</strong> Valid VAT receipts for all business expenses</li>
                    <li><strong>Digital Compliance:</strong> Making Tax Digital (MTD) compatible software required</li>
                  </ul>
                  <div className={styles.adminTip}>
                    💡 <strong>Best Practice:</strong> Digital-first processes from day one reduce long-term administrative burden
                  </div>
                </div>
              </div>

              <div className={styles.adminCategory}>
                <h4>💳 Invoice and Pricing Changes</h4>
                <div className={styles.adminDetails}>
                  <ul>
                    <li><strong>VAT Invoices:</strong> Must show VAT registration number and amount</li>
                    <li><strong>Pricing Updates:</strong> Decide between inclusive or exclusive VAT pricing</li>
                    <li><strong>Customer Communication:</strong> Explain pricing changes clearly to maintain relationships</li>
                  </ul>
                  <div className={styles.adminTip}>
                    💡 <strong>Communication Strategy:</strong> Frame VAT registration as business growth milestone to customers
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Step-by-Step Registration Process</h2>
            <p>Navigate the HMRC registration process efficiently with this detailed strategic roadmap:</p>
            
            <div className={styles.processTimeline}>
              {registrationSteps.map((step, index) => (
                <div key={index} className={styles.timelineStep}>
                  <div className={styles.stepNumber}>{step.step}</div>
                  <div className={styles.stepContent}>
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                    <div className={styles.stepMeta}>
                      <span className={styles.timeframe}>⏱️ {step.timeframe}</span>
                      <div className={styles.stepTip}>💡 {step.tip}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Strategic Timing: When to Register</h2>
            <p>The timing of VAT registration can significantly impact business operations and competitive position. Strategic businesses plan registration timing around growth phases, seasonal cycles, and market opportunities.</p>

            <div className={styles.timingStrategies}>
              <div className={styles.timingCard}>
                <h4>🎯 Proactive Strategy (Recommended)</h4>
                <div className={styles.timingContent}>
                  <p><strong>When:</strong> Register when approaching 70-80% of threshold</p>
                  <p><strong>Benefits:</strong> Controlled transition, system setup time, staff training</p>
                  <p><strong>Risk Mitigation:</strong> Avoids emergency registration during busy periods</p>
                </div>
              </div>
              
              <div className={styles.timingCard}>
                <h4>⚖️ Threshold Strategy</h4>
                <div className={styles.timingContent}>
                  <p><strong>When:</strong> Register exactly when threshold is breached</p>
                  <p><strong>Benefits:</strong> Maximum time without VAT complexity</p>
                  <p><strong>Risks:</strong> Rushed implementation, potential compliance issues</p>
                </div>
              </div>
              
              <div className={styles.timingCard}>
                <h4>🚀 Growth Strategy</h4>
                <div className={styles.timingContent}>
                  <p><strong>When:</strong> Register early to support expansion plans</p>
                  <p><strong>Benefits:</strong> Professional credibility, input VAT recovery for growth investments</p>
                  <p><strong>Consideration:</strong> Higher administrative burden during critical growth phase</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Industry-Specific Threshold Strategies</h2>
            <p>Different industries face unique threshold considerations based on their business models, customer bases, and operational characteristics:</p>

            <div className={styles.industryStrategies}>
              <div className={styles.industryStrategy}>
                <h4>💻 Technology & SaaS</h4>
                <div className={styles.strategyDetails}>
                  <p><strong>Threshold Approach:</strong> Early voluntary registration typically beneficial</p>
                  <p><strong>Reasoning:</strong> B2B customer preference, credibility requirements, equipment VAT recovery</p>
                  <p><strong>Implementation:</strong> Integrate VAT into subscription pricing models from launch</p>
                </div>
              </div>

              <div className={styles.industryStrategy}>
                <h4>🏪 Retail & E-commerce</h4>
                <div className={styles.strategyDetails}>
                  <p><strong>Threshold Approach:</strong> Delay until mandatory unless significant input VAT</p>
                  <p><strong>Reasoning:</strong> Consumer price sensitivity, administrative complexity</p>
                  <p><strong>Implementation:</strong> Prepare dual pricing systems for smooth transition</p>
                </div>
              </div>

              <div className={styles.industryStrategy}>
                <h4>🔧 Professional Services</h4>
                <div className={styles.strategyDetails}>
                  <p><strong>Threshold Approach:</strong> Consider voluntary registration with corporate clients</p>
                  <p><strong>Reasoning:</strong> Professional credibility, client administrative preferences</p>
                  <p><strong>Implementation:</strong> Position as business maturity milestone</p>
                </div>
              </div>

              <div className={styles.industryStrategy}>
                <h4>🏗️ Construction & Trades</h4>
                <div className={styles.strategyDetails}>
                  <p><strong>Threshold Approach:</strong> Early registration for materials VAT recovery</p>
                  <p><strong>Reasoning:</strong> High input VAT on materials, tools, and vehicles</p>
                  <p><strong>Implementation:</strong> Factor into project pricing and quotation systems</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Financial Impact Analysis: The Real Numbers</h2>
            <p>Understanding the quantitative impact of VAT registration enables data-driven decisions rather than emotional reactions to compliance requirements.</p>

            <div className={styles.impactAnalysis}>
              <div className={styles.impactScenario}>
                <h4>📊 Scenario A: Service Business (£90k turnover)</h4>
                <div className={styles.scenarioCalculation}>
                  <div className={styles.calcRow}>
                    <span>Annual turnover:</span>
                    <span>£90,000</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>VAT to collect:</span>
                    <span>£18,000</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>Business expenses (with VAT):</span>
                    <span>£24,000</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>Input VAT to recover:</span>
                    <span>£4,000</span>
                  </div>
                  <div className={styles.calcResult}>
                    <span><strong>Net VAT to pay HMRC:</strong></span>
                    <span><strong>£14,000</strong></span>
                  </div>
                  <div className={styles.calcInsight}>
                    <strong>Cash Flow Benefit:</strong> Up to 90 days free use of £14,000 collected from customers
                  </div>
                </div>
              </div>

              <div className={styles.impactScenario}>
                <h4>🏪 Scenario B: Retail Business (£100k turnover)</h4>
                <div className={styles.scenarioCalculation}>
                  <div className={styles.calcRow}>
                    <span>Annual turnover:</span>
                    <span>£100,000</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>VAT to collect:</span>
                    <span>£20,000</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>Stock purchases (with VAT):</span>
                    <span>£60,000</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>Input VAT to recover:</span>
                    <span>£10,000</span>
                  </div>
                  <div className={styles.calcResult}>
                    <span><strong>Net VAT to pay HMRC:</strong></span>
                    <span><strong>£10,000</strong></span>
                  </div>
                  <div className={styles.calcInsight}>
                    <strong>Consideration:</strong> Higher input VAT recovery offsets pricing complexity
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Common Threshold Mistakes & How to Avoid Them</h2>
            <p>Learn from the costly errors that trip up many businesses approaching the VAT threshold:</p>

            <div className={styles.mistakesGrid}>
              <div className={styles.mistakeCard}>
                <h4>📅 Calendar Year Confusion</h4>
                <div className={styles.mistakeContent}>
                  <p><strong>The Error:</strong> Assuming threshold resets on January 1st</p>
                  <p><strong>The Reality:</strong> Rolling 12-month calculation means daily monitoring required</p>
                  <p><strong>Solution:</strong> Set up monthly turnover tracking and automated threshold alerts</p>
                </div>
              </div>

              <div className={styles.mistakeCard}>
                <h4>💰 Including VAT in Calculations</h4>
                <div className={styles.mistakeContent}>
                  <p><strong>The Error:</strong> Counting gross (VAT-inclusive) sales toward threshold</p>
                  <p><strong>The Reality:</strong> Only net (VAT-exclusive) amounts count</p>
                  <p><strong>Solution:</strong> Always track and report net turnover figures</p>
                </div>
              </div>

              <div className={styles.mistakeCard}>
                <h4>⏰ Late Registration</h4>
                <div className={styles.mistakeContent}>
                  <p><strong>The Error:</strong> Delaying registration hoping to avoid detection</p>
                  <p><strong>The Reality:</strong> HMRC has sophisticated monitoring systems</p>
                  <p><strong>Solution:</strong> Register within 30 days of threshold breach to avoid penalties</p>
                </div>
              </div>

              <div className={styles.mistakeCard}>
                <h4>🎯 Ignoring Voluntary Benefits</h4>
                <div className={styles.mistakeContent}>
                  <p><strong>The Error:</strong> Viewing registration purely as compliance burden</p>
                  <p><strong>The Reality:</strong> Strategic registration timing can provide competitive advantages</p>
                  <p><strong>Solution:</strong> Analyze industry-specific benefits before threshold approach</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.relatedResources}>
            <h2>Related Resources</h2>
            <p>Continue your VAT mastery journey with our comprehensive guide series:</p>
            
            <div className={styles.resourceGrid}>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-explained-guide">VAT Explained: A Strategic Guide for UK Businesses</Link>
                <p>Master the foundational concepts and strategic implications of VAT</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-rates-2025">UK VAT Rates 2025: Your Strategic Pricing Compass</Link>
                <p>Understand how different VAT rates affect your business strategy</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-flat-rate-scheme">The Flat Rate Scheme: Simplify Your VAT</Link>
                <p>Explore simplified VAT accounting options for small businesses</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-return-guide">Your First VAT Return: Step-by-Step Guide</Link>
                <p>Navigate your initial VAT return submission with confidence</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-reclaim-guide">Maximizing VAT Recovery on Business Expenses</Link>
                <p>Optimize your input VAT recovery strategies post-registration</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/uk-vat-calculator">UK VAT Calculator</Link>
                <p>Calculate VAT amounts and analyze threshold implications</p>
              </div>
            </div>
          </section>

          <section className={styles.externalResources}>
            <h4>External Resources</h4>
            <p>For official guidance and professional support:</p>
            <ul>
              <li><a href="https://www.gov.uk/vat-registration" target="_blank" rel="noopener noreferrer">HMRC VAT Registration Service</a> - Official registration portal and guidance</li>
              <li><a href="https://ifs.org.uk/" target="_blank" rel="noopener noreferrer">Institute for Fiscal Studies</a> - Independent research on VAT policy and business impacts</li>
            </ul>
          </section>

          <section className={styles.conclusion}>
            <h2>Conclusion: The Threshold as Strategic Opportunity</h2>
            <p>The £85,000 VAT registration threshold represents one of the most significant strategic decision points in UK business development. Rather than viewing it as a compliance burden, successful businesses leverage threshold planning as an opportunity to optimize operations, enhance credibility, and accelerate growth.</p>
            
            <p>The most successful threshold transitions are those planned strategically—where businesses anticipate the change, prepare systems and processes, and communicate the transition as a positive business development to stakeholders.</p>
            
            <div className={styles.actionChecklist}>
              <h4>📋 Your Threshold Action Plan</h4>
              <p>Take these concrete steps to master your threshold strategy:</p>
              <ul className={styles.checklistItems}>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Set up monthly VAT taxable turnover tracking system</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Calculate projected 12-month rolling turnover based on current growth trends</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Analyze your customer base: B2B vs B2C mix and VAT registration preferences</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Evaluate input VAT recovery potential from your current expense categories</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Research industry competitors&apos; VAT strategies and positioning</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Prepare registration documentation and choose optimal timing strategy</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Plan customer communication strategy for pricing changes (if applicable)</label>
                </li>
              </ul>
            </div>
          </section>

          <div className={styles.disclaimer}>
            <p><em>This guide provides strategic insights into VAT registration decisions. Business circumstances vary significantly. Always consult qualified tax professionals for business-specific advice and verify current requirements with HMRC. Use our <Link href="/en/tax-and-freelance-uk-us-ca/uk-vat-calculator">UK VAT Calculator</Link> for precise calculations.</em></p>
          </div>

          <div className={styles.authorBio}>
            <p><strong>Author: U. Candido, MBA</strong><br />
            <strong>Background:</strong> MBA from MIB Trieste School of Management (2009-2010). Experienced operational manager with 10+ years demonstrated history as project manager and head of project management function across different industries in Italian, Chinese, and US companies. Proven leadership ability to effectively work with diverse functional teams across several lines of business.<br />
            <strong>Specialization:</strong> Strategic Tax Planning and Business Development<br />
            <strong>Date:</strong> August 2025</p>
          </div>
        </main>
      </div>

      {showScrollTop && (
        <button 
          className={styles.scrollToTop}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default VatThresholdGuide;