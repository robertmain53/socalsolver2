'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './FlatRateSchemeGuide.module.css';

interface FlatRateCategory {
  category: string;
  rate: number;
  description: string;
  examples: string[];
  suitability: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

interface ComparisonScenario {
  businessType: string;
  annualTurnover: number;
  businessExpenses: number;
  flatRate: number;
  savings: number;
  recommendation: string;
}

const FlatRateSchemeGuide: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [calculatorValues, setCalculatorValues] = useState({
    turnover: 100000,
    expenses: 20000,
    flatRate: 16.5
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

  const flatRateCategories: FlatRateCategory[] = [
    {
      category: "Accountancy or book-keeping",
      rate: 14.5,
      description: "Professional accounting and bookkeeping services",
      examples: ["Chartered accountants", "Bookkeeping services", "Tax preparation", "Payroll services"],
      suitability: "High",
      reasoning: "Low physical costs, high-margin services ideal for flat rate benefits"
    },
    {
      category: "Advertising",
      rate: 11.0,
      description: "Marketing, advertising, and promotional services",
      examples: ["Digital marketing", "Print advertising", "PR agencies", "Social media management"],
      suitability: "Medium",
      reasoning: "Depends on media buying vs. service delivery ratio"
    },
    {
      category: "Agricultural services", 
      rate: 11.0,
      description: "Farming and agricultural support services",
      examples: ["Farm management", "Agricultural consulting", "Crop spraying", "Livestock services"],
      suitability: "Medium",
      reasoning: "Variable based on equipment intensity and seasonal patterns"
    },
    {
      category: "Any other activity",
      rate: 16.5,
      description: "Default rate for businesses not fitting specific categories",
      examples: ["General consulting", "Mixed services", "New business models", "Undefined activities"],
      suitability: "Medium",
      reasoning: "Default rate requires careful analysis against specific industry rates"
    },
    {
      category: "Architect, civil and structural engineer",
      rate: 14.5,
      description: "Professional design and engineering services",
      examples: ["Architectural design", "Structural engineering", "Civil engineering", "Building design"],
      suitability: "High",
      reasoning: "Professional services with low material costs benefit significantly"
    },
    {
      category: "Computer and IT consultancy or data processing",
      rate: 14.5,
      description: "Technology consulting and digital services", 
      examples: ["Software development", "IT consulting", "Data analysis", "System integration"],
      suitability: "High",
      reasoning: "High-margin digital services with minimal physical inputs"
    },
    {
      category: "Wholesaling of food",
      rate: 7.5,
      description: "Food distribution and wholesale operations",
      examples: ["Food distribution", "Wholesale groceries", "Restaurant supply", "Catering supplies"],
      suitability: "Low",
      reasoning: "Low margins and high input costs make flat rate usually disadvantageous"
    },
    {
      category: "General building or construction services",
      rate: 16.5,
      description: "Construction and building work",
      examples: ["Building contractors", "Renovation", "Construction", "Building maintenance"],
      suitability: "Low", 
      reasoning: "High material costs mean standard VAT usually more beneficial"
    },
    {
      category: "Hotel or accommodation",
      rate: 10.5,
      description: "Hospitality and accommodation services",
      examples: ["Hotels", "B&Bs", "Holiday rentals", "Serviced apartments"],
      suitability: "Medium",
      reasoning: "Depends on property costs vs. service elements"
    }
  ];

  const comparisonScenarios: ComparisonScenario[] = [
    {
      businessType: "IT Consultancy",
      annualTurnover: 80000,
      businessExpenses: 8000,
      flatRate: 14.5,
      savings: 2267,
      recommendation: "Flat Rate Recommended - Significant savings on low-cost business model"
    },
    {
      businessType: "Construction Business", 
      annualTurnover: 120000,
      businessExpenses: 70000,
      flatRate: 16.5,
      savings: -7520,
      recommendation: "Standard VAT Recommended - High input costs make flat rate expensive"
    },
    {
      businessType: "Marketing Agency",
      annualTurnover: 95000,
      businessExpenses: 25000,
      flatRate: 11.0,
      savings: 1325,
      recommendation: "Marginal Advantage - Consider other factors like simplicity preference"
    }
  ];

  // Calculate standard VAT vs flat rate
  const calculateComparison = () => {
    const { turnover, expenses, flatRate } = calculatorValues;
    const outputVAT = turnover * 0.2;
    const inputVAT = expenses * 0.2;
    const standardVATPayable = outputVAT - inputVAT;
    
    const flatRateVATPayable = turnover * (flatRate / 100);
    const difference = standardVATPayable - flatRateVATPayable;
    
    return {
      standard: standardVATPayable,
      flatRate: flatRateVATPayable,
      savings: difference,
      percentage: (difference / standardVATPayable) * 100
    };
  };

  const comparison = calculateComparison();

  return (
    <div>
      <div 
        className={styles.progressBar}
        style={{ width: `${readingProgress}%` }}
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>The Flat Rate Scheme: Could It Simplify Your VAT?</h1>
          <p className={styles.subtitle}>Strategic Analysis of HMRC's Alternative VAT Calculation Method for Small Businesses</p>
        </header>

        <main className={styles.content}>
          <section className={styles.audienceBox}>
            <h2>Who Is This Guide For?</h2>
            <p>This strategic analysis serves VAT-registered small businesses with annual turnover under £150,000 who want to understand whether the Flat Rate Scheme could reduce their administrative burden while potentially saving money. Whether you&apos;re newly registered for VAT, overwhelmed by quarterly returns, or seeking to optimize your tax position, this guide provides the analytical framework to make informed decisions about this alternative VAT calculation method.</p>
          </section>

          <section className={styles.executiveSummary}>
            <h2>Executive Summary</h2>
            <p>The VAT Flat Rate Scheme represents a strategic trade-off between administrative simplicity and financial optimization. Rather than calculating VAT on individual transactions, businesses apply a fixed percentage to their total turnover, eliminating the need to track input VAT recovery. This apparent simplification can either generate significant savings or impose hidden costs, depending on your business model and industry classification.</p>
            
            <div className={styles.keyTakeaways}>
              <strong>Strategic Decision Points:</strong>
              <ul>
                <li>🎯 Flat rate percentages vary dramatically by industry—choosing the right classification is crucial</li>
                <li>💰 Service-based businesses with low input costs typically benefit most from the scheme</li>
                <li>🏗️ High-cost businesses (construction, retail) usually pay more under flat rate than standard VAT</li>
                <li>⚡ Administrative simplification can justify modest financial costs for time-constrained businesses</li>
                <li>📊 The scheme includes automatic leaving triggers that require continuous monitoring</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>Understanding the Flat Rate Scheme: Strategic Mechanics</h2>
            <p>The Flat Rate Scheme fundamentally changes your relationship with VAT from a <strong>transaction-based system</strong> to a <strong>turnover-based calculation</strong>. This shift represents more than accounting convenience—it reflects different approaches to business operation and strategic planning.</p>

            <div className={styles.schemeComparison}>
              <div className={styles.comparisonSide}>
                <h4>📊 Standard VAT Method</h4>
                <div className={styles.methodDetails}>
                  <ul>
                    <li><strong>Calculate:</strong> Output VAT - Input VAT</li>
                    <li><strong>Track:</strong> Every purchase and sale individually</li>
                    <li><strong>Recover:</strong> VAT on all allowable business expenses</li>
                    <li><strong>Complexity:</strong> High record-keeping requirements</li>
                    <li><strong>Accuracy:</strong> Precisely reflects actual VAT position</li>
                  </ul>
                </div>
              </div>
              <div className={styles.comparisonSide}>
                <h4>⚡ Flat Rate Method</h4>
                <div className={styles.methodDetails}>
                  <ul>
                    <li><strong>Calculate:</strong> Total turnover × flat rate %</li>
                    <li><strong>Track:</strong> Only total sales figures</li>
                    <li><strong>Recover:</strong> No input VAT (except capital purchases over £2,000)</li>
                    <li><strong>Complexity:</strong> Minimal record-keeping</li>
                    <li><strong>Simplicity:</strong> Predictable, straightforward calculation</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3>The Economic Logic</h3>
            <p>From a <strong>behavioral economics perspective</strong>, the Flat Rate Scheme addresses the cognitive burden of complex VAT calculations by trading financial precision for operational simplicity. This trade-off reflects broader business strategy principles about resource allocation and competitive focus.</p>

            <div className={styles.strategicInsight}>
              <strong>Strategic Principle:</strong> The Flat Rate Scheme works best for businesses where VAT administration distracts from core value creation activities. Time saved on VAT compliance can be redirected toward revenue-generating activities, potentially offsetting modest financial costs.
            </div>
          </section>

          <section>
            <h2>Eligibility and Entry Requirements</h2>
            <p>Understanding Flat Rate Scheme eligibility requirements enables strategic timing of entry and exit decisions to maximize business benefits.</p>

            <div className={styles.eligibilityFramework}>
              <div className={styles.eligibilityCriteria}>
                <h4>✅ Eligibility Requirements</h4>
                <ul>
                  <li><strong>💼 VAT Registration:</strong> Must already be VAT registered (or registering)</li>
                  <li><strong>📈 Turnover Limit:</strong> Annual VAT taxable turnover under £150,000</li>
                  <li><strong>⏰ Clean History:</strong> No VAT penalties in previous 12 months</li>
                  <li><strong>🎯 Single Business:</strong> Cannot be part of VAT group registration</li>
                </ul>
              </div>

              <div className={styles.strategicTiming}>
                <h4>⏱️ Strategic Entry Timing</h4>
                <ul>
                  <li><strong>🚀 At Registration:</strong> Join immediately when first registering for VAT</li>
                  <li><strong>📅 Quarterly Reviews:</strong> Switch at start of new VAT period for clean transition</li>
                  <li><strong>💡 Business Changes:</strong> Reassess when business model or cost structure evolves</li>
                  <li><strong>🎁 First Year Bonus:</strong> 1% discount in year one (where applicable)</li>
                </ul>
              </div>
            </div>

            <div className={styles.firstYearBonus}>
              <h4>🎁 First Year Advantage</h4>
              <p><strong>New businesses benefit from a 1% reduction</strong> in their flat rate percentage during the first year of VAT registration. This incentive makes the scheme particularly attractive for startups and new VAT registrants.</p>
              
              <div className={styles.bonusExample}>
                <strong>Example:</strong> A consultancy with 14.5% standard flat rate pays only 13.5% in year one, saving an additional £1,000 on £100,000 turnover.
              </div>
            </div>
          </section>

          <section>
            <h2>Interactive Flat Rate Finder</h2>
            <p>Select your business category to discover your applicable flat rate percentage and strategic analysis:</p>
            
            <div className={styles.categoryFinder}>
              <div className={styles.categoryGrid}>
                {flatRateCategories.map((category, index) => (
                  <div 
                    key={index}
                    className={`${styles.categoryCard} ${selectedCategory === category.category ? styles.selected : ''}`}
                    onClick={() => setSelectedCategory(category.category)}
                  >
                    <div className={styles.categoryHeader}>
                      <h4>{category.category}</h4>
                      <span className={styles.rateDisplay}>{category.rate}%</span>
                    </div>
                    <p className={styles.categoryDesc}>{category.description}</p>
                  </div>
                ))}
              </div>
              
              {selectedCategory && (
                <div className={styles.categoryDetails}>
                  {flatRateCategories
                    .filter(cat => cat.category === selectedCategory)
                    .map((category, index) => (
                      <div key={index} className={styles.detailCard}>
                        <h4>{category.category} - {category.rate}%</h4>
                        
                        <div className={styles.categoryAnalysis}>
                          <div className={styles.examplesSection}>
                            <strong>📋 Typical Businesses:</strong>
                            <ul>
                              {category.examples.map((example, i) => (
                                <li key={i}>{example}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className={styles.suitabilitySection}>
                            <strong>🎯 Suitability:</strong>
                            <span className={`${styles.suitabilityBadge} ${styles[category.suitability.toLowerCase()]}`}>
                              {category.suitability}
                            </span>
                          </div>
                          
                          <div className={styles.reasoningSection}>
                            <strong>💭 Strategic Analysis:</strong>
                            <p>{category.reasoning}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>

          <section>
            <h2>Interactive Cost-Benefit Calculator</h2>
            <p>Compare standard VAT accounting with the Flat Rate Scheme using your business figures:</p>
            
            <div className={styles.calculator}>
              <div className={styles.calculatorInputs}>
                <div className={styles.inputGroup}>
                  <label>Annual Turnover (excluding VAT)</label>
                  <input
                    type="number"
                    value={calculatorValues.turnover}
                    onChange={(e) => setCalculatorValues(prev => ({
                      ...prev,
                      turnover: parseInt(e.target.value) || 0
                    }))}
                    className={styles.calculatorInput}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Annual Business Expenses (including VAT)</label>
                  <input
                    type="number"
                    value={calculatorValues.expenses}
                    onChange={(e) => setCalculatorValues(prev => ({
                      ...prev,
                      expenses: parseInt(e.target.value) || 0
                    }))}
                    className={styles.calculatorInput}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Your Flat Rate Percentage (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={calculatorValues.flatRate}
                    onChange={(e) => setCalculatorValues(prev => ({
                      ...prev,
                      flatRate: parseFloat(e.target.value) || 0
                    }))}
                    className={styles.calculatorInput}
                  />
                </div>
              </div>
              
              <div className={styles.calculatorResults}>
                <div className={styles.resultComparison}>
                  <div className={styles.methodResult}>
                    <h4>📊 Standard VAT Method</h4>
                    <div className={styles.calculation}>
                      <div className={styles.calcStep}>
                        <span>Output VAT (20% of £{calculatorValues.turnover.toLocaleString()}):</span>
                        <span>£{(calculatorValues.turnover * 0.2).toLocaleString()}</span>
                      </div>
                      <div className={styles.calcStep}>
                        <span>Input VAT (on £{calculatorValues.expenses.toLocaleString()}):</span>
                        <span>-£{(calculatorValues.expenses * 0.2).toLocaleString()}</span>
                      </div>
                      <div className={styles.calcTotal}>
                        <span><strong>VAT Payable:</strong></span>
                        <span><strong>£{comparison.standard.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.methodResult}>
                    <h4>⚡ Flat Rate Scheme</h4>
                    <div className={styles.calculation}>
                      <div className={styles.calcStep}>
                        <span>Turnover × {calculatorValues.flatRate}%:</span>
                        <span>£{comparison.flatRate.toLocaleString()}</span>
                      </div>
                      <div className={styles.calcStep}>
                        <span>Input VAT Recovery:</span>
                        <span>£0</span>
                      </div>
                      <div className={styles.calcTotal}>
                        <span><strong>VAT Payable:</strong></span>
                        <span><strong>£{comparison.flatRate.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.savingsDisplay}>
                  <div className={`${styles.savingsResult} ${comparison.savings >= 0 ? styles.positive : styles.negative}`}>
                    <h4>
                      {comparison.savings >= 0 ? '💰 Annual Savings' : '💸 Additional Cost'}
                    </h4>
                    <div className={styles.savingsAmount}>
                      £{Math.abs(comparison.savings).toLocaleString()}
                    </div>
                    <div className={styles.savingsPercent}>
                      ({comparison.percentage >= 0 ? '+' : ''}{comparison.percentage.toFixed(1)}% vs standard VAT)
                    </div>
                  </div>
                  
                  <div className={styles.recommendation}>
                    <strong>📋 Recommendation:</strong>
                    <p>
                      {comparison.savings >= 1000 ? 
                        "Strong financial case for Flat Rate Scheme - significant savings justify any complexity trade-offs." :
                        comparison.savings >= 0 ?
                        "Marginal financial advantage - consider administrative benefits and business priorities." :
                        comparison.savings >= -1000 ?
                        "Small additional cost - may be worthwhile for administrative simplification." :
                        "Standard VAT recommended - significant financial disadvantage under Flat Rate Scheme."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Strategic Advantages of the Flat Rate Scheme</h2>
            <p>Beyond simple cost calculation, the Flat Rate Scheme offers strategic benefits that can enhance business operations and competitive positioning:</p>

            <div className={styles.advantagesGrid}>
              <div className={styles.advantageCard}>
                <h4>⚡ Administrative Simplification</h4>
                <div className={styles.advantageContent}>
                  <p><strong>Time Savings:</strong> Eliminate detailed input VAT tracking and calculation</p>
                  <p><strong>Resource Allocation:</strong> Redirect administrative time toward revenue-generating activities</p>
                  <div className={styles.advantageExample}>
                    <strong>Quantified Benefit:</strong> Average time saving of 4-6 hours per quarter for typical small business
                  </div>
                </div>
              </div>

              <div className={styles.advantageCard}>
                <h4>💰 Predictable Cash Flow</h4>
                <div className={styles.advantageContent}>
                  <p><strong>Fixed Percentage:</strong> VAT liability becomes predictable percentage of turnover</p>
                  <p><strong>Planning Benefits:</strong> Easier cash flow forecasting and budgeting</p>
                  <div className={styles.advantageExample}>
                    <strong>Planning Value:</strong> Finance teams can predict quarterly VAT payments with simple multiplication
                  </div>
                </div>
              </div>

              <div className={styles.advantageCard}>
                <h4>📈 Potential Cost Savings</h4>
                <div className={styles.advantageContent}>
                  <p><strong>Service Businesses:</strong> Often pay less VAT than under standard calculation</p>
                  <p><strong>Low-Cost Models:</strong> Businesses with minimal input costs benefit most</p>
                  <div className={styles.advantageExample}>
                    <strong>Typical Savings:</strong> Consultancies and digital services can save 15-25% on VAT liability
                  </div>
                </div>
              </div>

              <div className={styles.advantageCard}>
                <h4>🛡️ Reduced Audit Risk</h4>
                <div className={styles.advantageContent}>
                  <p><strong>Simplified Records:</strong> Fewer detailed transactions to explain during inspections</p>
                  <p><strong>Clear Calculation:</strong> Transparent percentage-based calculation reduces disputes</p>
                  <div className={styles.advantageExample}>
                    <strong>Risk Reduction:</strong> Lower probability of calculation errors and penalty assessments
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Strategic Disadvantages and Risk Factors</h2>
            <p>Understanding the limitations and potential costs of the Flat Rate Scheme is essential for informed decision-making:</p>

            <div className={styles.disadvantagesGrid}>
              <div className={styles.disadvantageCard}>
                <h4>💸 No Input VAT Recovery</h4>
                <div className={styles.disadvantageContent}>
                  <p><strong>Lost Opportunity:</strong> Cannot reclaim VAT on business purchases</p>
                  <p><strong>Impact:</strong> High-cost businesses lose significant recovery opportunities</p>
                  <div className={styles.disadvantageExample}>
                    <strong>Cost Example:</strong> £50,000 in business expenses means £10,000 lost VAT recovery annually
                  </div>
                </div>
              </div>

              <div className={styles.disadvantageCard}>
                <h4>📊 Fixed Rate Inflexibility</h4>
                <div className={styles.disadvantageContent}>
                  <p><strong>Market Changes:</strong> Cannot adjust for seasonal cost variations</p>
                  <p><strong>Growth Impact:</strong> Rate doesn&apos;t reflect changing business efficiency</p>
                  <div className={styles.disadvantageExample}>
                    <strong>Risk Scenario:</strong> Improved supplier terms reduce costs but flat rate percentage remains unchanged
                  </div>
                </div>
              </div>

              <div className={styles.disadvantageCard}>
                <h4>🎯 Incorrect Classification Risk</h4>
                <div className={styles.disadvantageContent}>
                  <p><strong>Rate Selection:</strong> Wrong business category leads to inappropriate percentage</p>
                  <p><strong>Compliance Risk:</strong> HMRC may challenge business classification</p>
                  <div className={styles.disadvantageExample}>
                    <strong>Penalty Risk:</strong> Incorrect rate application can result in underpayment penalties and interest
                  </div>
                </div>
              </div>

              <div className={styles.disadvantageCard}>
                <h4>📈 Mandatory Exit Triggers</h4>
                <div className={styles.disadvantageContent}>
                  <p><strong>Growth Limits:</strong> Must leave scheme if turnover exceeds £230,000</p>
                  <p><strong>Monitoring Burden:</strong> Requires continuous turnover tracking despite simplification benefits</p>
                  <div className={styles.disadvantageExample}>
                    <strong>Transition Complexity:</strong> Leaving scheme requires systems changes and recalculation of VAT position
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Industry-Specific Strategic Analysis</h2>
            <p>Different business models and industry characteristics create vastly different outcomes under the Flat Rate Scheme:</p>

            <div className={styles.industryAnalysis}>
              <div className={styles.industryWinner}>
                <h4>🏆 Flat Rate Winners: Service Industries</h4>
                <div className={styles.winnerCategories}>
                  <div className={styles.winnerCategory}>
                    <h5>💻 Technology & Consulting (14.5%)</h5>
                    <p><strong>Why They Win:</strong> High-margin services with minimal physical inputs</p>
                    <p><strong>Typical Savings:</strong> 20-30% reduction in VAT liability</p>
                    <div className={styles.winnerExample}>
                      <strong>Case Study:</strong> A software consultancy with £100k turnover and £8k expenses saves £2,900 annually vs. standard VAT
                    </div>
                  </div>
                  
                  <div className={styles.winnerCategory}>
                    <h5>📊 Accounting Services (14.5%)</h5>
                    <p><strong>Why They Win:</strong> Professional services with low overhead costs</p>
                    <p><strong>Typical Savings:</strong> 15-25% VAT reduction</p>
                    <div className={styles.winnerExample}>
                      <strong>Strategic Insight:</strong> Accounting firms can offer more competitive pricing while maintaining margins
                    </div>
                  </div>
                  
                  <div className={styles.winnerCategory}>
                    <h5>🎨 Creative Services (13.0%)</h5>
                    <p><strong>Why They Win:</strong> Talent-based businesses with minimal equipment costs</p>
                    <p><strong>Typical Savings:</strong> 25-35% VAT reduction</p>
                    <div className={styles.winnerExample}>
                      <strong>Competitive Edge:</strong> Lower VAT burden enables more aggressive pricing against larger agencies
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.industryLoser}>
                <h4>⚠️ Flat Rate Challenges: High-Input Businesses</h4>
                <div className={styles.loserCategories}>
                  <div className={styles.loserCategory}>
                    <h5>🏗️ Construction (16.5%)</h5>
                    <p><strong>Why It&apos;s Challenging:</strong> High material costs and equipment purchases</p>
                    <p><strong>Typical Loss:</strong> 15-25% increase in VAT costs</p>
                    <div className={styles.loserExample}>
                      <strong>Alternative Strategy:</strong> Most construction businesses benefit more from standard VAT with full input recovery
                    </div>
                  </div>
                  
                  <div className={styles.loserCategory}>
                    <h5>🛒 Retail Trading (7.5%)</h5>
                    <p><strong>Why It&apos;s Complex:</strong> Low margins but high stock purchase costs</p>
                    <p><strong>Analysis Required:</strong> Depends heavily on markup percentages</p>
                    <div className={styles.loserExample}>
                      <strong>Decision Factor:</strong> Retailers with markup below 40% typically lose money on flat rate
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Real Business Scenarios: Strategic Decision Framework</h2>
            <p>Analyze these comprehensive business scenarios to understand how the Flat Rate Scheme impacts different business models:</p>

            <div className={styles.scenariosGrid}>
              {comparisonScenarios.map((scenario, index) => (
                <div key={index} className={styles.scenarioAnalysis}>
                  <h4>{scenario.businessType}</h4>
                  
                  <div className={styles.scenarioMetrics}>
                    <div className={styles.metric}>
                      <span>Annual Turnover:</span>
                      <span>£{scenario.annualTurnover.toLocaleString()}</span>
                    </div>
                    <div className={styles.metric}>
                      <span>Business Expenses:</span>
                      <span>£{scenario.businessExpenses.toLocaleString()}</span>
                    </div>
                    <div className={styles.metric}>
                      <span>Flat Rate:</span>
                      <span>{scenario.flatRate}%</span>
                    </div>
                    <div className={`${styles.savingsMetric} ${scenario.savings >= 0 ? styles.positive : styles.negative}`}>
                      <span><strong>Annual Impact:</strong></span>
                      <span><strong>{scenario.savings >= 0 ? '+' : ''}£{scenario.savings.toLocaleString()}</strong></span>
                    </div>
                  </div>
                  
                  <div className={styles.scenarioRecommendation}>
                    <strong>💡 Strategic Recommendation:</strong>
                    <p>{scenario.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Advanced Strategic Considerations</h2>
            
            <h3>The Capital Purchase Exception</h3>
            <p>One of the Flat Rate Scheme&apos;s most important features is the <strong>capital purchase exception</strong>—you can still reclaim VAT on individual purchases over £2,000. This creates strategic opportunities for timing major purchases.</p>

            <div className={styles.capitalPurchaseStrategy}>
              <h4>💡 Strategic Capital Purchase Planning</h4>
              <div className={styles.purchaseStrategies}>
                <div className={styles.purchaseStrategy}>
                  <h5>🖥️ Technology Upgrades</h5>
                  <p><strong>Strategy:</strong> Bundle software licenses and hardware to exceed £2,000 threshold</p>
                  <p><strong>Benefit:</strong> Reclaim VAT while maintaining flat rate scheme benefits</p>
                </div>
                
                <div className={styles.purchaseStrategy}>
                  <h5>🚗 Vehicle Purchases</h5>
                  <p><strong>Strategy:</strong> Time vehicle purchases to maximize VAT recovery</p>
                  <p><strong>Consideration:</strong> Vehicle VAT rules apply regardless of scheme membership</p>
                </div>
                
                <div className={styles.purchaseStrategy}>
                  <h5>🏢 Office Equipment</h5>
                  <p><strong>Strategy:</strong> Coordinate equipment purchases to meet £2,000 threshold</p>
                  <p><strong>Planning:</strong> Annual equipment budgets can optimize VAT recovery timing</p>
                </div>
              </div>
            </div>

            <h3>Exit Strategy Planning</h3>
            <p>Understanding when and how to leave the Flat Rate Scheme is as important as the entry decision:</p>

            <div className={styles.exitStrategies}>
              <div className={styles.exitTrigger}>
                <h4>🚨 Mandatory Exit Triggers</h4>
                <ul>
                  <li><strong>📈 Turnover Limit:</strong> Annual turnover exceeds £230,000</li>
                  <li><strong>⏰ Time Limit:</strong> Cannot remain longer than the time limit (if applicable)</li>
                  <li><strong>📋 Business Changes:</strong> Fundamental change in business activities</li>
                </ul>
              </div>
              
              <div className={styles.voluntaryExit}>
                <h4>🎯 Strategic Exit Reasons</h4>
                <ul>
                  <li><strong>💸 Cost Increases:</strong> Business expenses rise significantly, making standard VAT more beneficial</li>
                  <li><strong>🔄 Model Changes:</strong> Business model evolves toward higher input costs</li>
                  <li><strong>📊 Periodic Reviews:</strong> Annual analysis reveals standard VAT would be more advantageous</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>Common Flat Rate Scheme Mistakes</h2>
            <p>Learn from costly errors that businesses make when implementing or managing the Flat Rate Scheme:</p>

            <div className={styles.mistakesAnalysis}>
              <div className={styles.mistakeCategory}>
                <h4>🎯 Classification Errors</h4>
                <div className={styles.mistakeDetails}>
                  <p><strong>The Error:</strong> Choosing &quot;Any other activity&quot; (16.5%) when specific lower rate available</p>
                  <p><strong>Cost Impact:</strong> Can increase VAT liability by 2-5% unnecessarily</p>
                  <p><strong>Solution:</strong> Research all applicable categories before selecting rate</p>
                </div>
              </div>

              <div className={styles.mistakeCategory}>
                <h4>📊 Calculation Mistakes</h4>
                <div className={styles.mistakeDetails}>
                  <p><strong>The Error:</strong> Applying flat rate to VAT-inclusive turnover instead of VAT-exclusive</p>
                  <p><strong>Cost Impact:</strong> Overpaying VAT by approximately 20%</p>
                  <p><strong>Solution:</strong> Always calculate flat rate on net (excluding VAT) turnover figures</p>
                </div>
              </div>

              <div className={styles.mistakeCategory}>
                <h4>💰 Capital Purchase Oversights</h4>
                <div className={styles.mistakeDetails}>
                  <p><strong>The Error:</strong> Failing to claim VAT on purchases over £2,000</p>
                  <p><strong>Cost Impact:</strong> Lost recovery opportunities worth hundreds or thousands</p>
                  <p><strong>Solution:</strong> Set up systems to identify and track capital purchase opportunities</p>
                </div>
              </div>

              <div className={styles.mistakeCategory}>
                <h4>📈 Exit Timing Errors</h4>
                <div className={styles.mistakeDetails}>
                  <p><strong>The Error:</strong> Staying in scheme too long when circumstances change</p>
                  <p><strong>Cost Impact:</strong> Continued overpayment when standard VAT becomes more beneficial</p>
                  <p><strong>Solution:</strong> Annual review process comparing both methods</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Decision Framework: Should You Join?</h2>
            <p>Use this comprehensive decision matrix to evaluate whether the Flat Rate Scheme aligns with your business strategy:</p>

            <div className={styles.decisionMatrix}>
              <div className={styles.decisionCriteria}>
                <h4>📋 Evaluation Criteria</h4>
                
                <div className={styles.criteriaGroup}>
                  <h5>💰 Financial Analysis</h5>
                  <div className={styles.criteriaChecklist}>
                    <div className={styles.criteriaItem}>
                      <input type="checkbox" />
                      <label>Annual business expenses less than 30% of turnover</label>
                    </div>
                    <div className={styles.criteriaItem}>
                      <input type="checkbox" />
                      <label>Service-based business model with low physical costs</label>
                    </div>
                    <div className={styles.criteriaItem}>
                      <input type="checkbox" />
                      <label>Flat rate calculation shows savings or break-even</label>
                    </div>
                  </div>
                </div>
                
                <div className={styles.criteriaGroup}>
                  <h5>⚡ Operational Benefits</h5>
                  <div className={styles.criteriaChecklist}>
                    <div className={styles.criteriaItem}>
                      <input type="checkbox" />
                      <label>Limited administrative resources for complex VAT tracking</label>
                    </div>
                    <div className={styles.criteriaItem}>
                      <input type="checkbox" />
                      <label>Value administrative simplicity over precision</label>
                    </div>
                    <div className={styles.criteriaItem}>
                      <input type="checkbox" />
                      <label>Prefer predictable VAT calculations for financial planning</label>
                    </div>
                  </div>
                </div>
                
                <div className={styles.criteriaGroup}>
                  <h5>🎯 Strategic Factors</h5>
                  <div className={styles.criteriaChecklist}>
                    <div className={styles.criteriaItem}>
                      <input type="checkbox" />
                      <label>Business model unlikely to change significantly</label>
                    </div>
                    <div className={styles.criteriaItem}>
                      <input type="checkbox" />
                      <label>Growth plans keep turnover under £150k for foreseeable future</label>
                    </div>
                    <div className={styles.criteriaItem}>
                      <input type="checkbox" />
                      <label>Focus on core business activities rather than tax optimization</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.decisionGuidance}>
                <h4>🧭 Decision Guidance</h4>
                <div className={styles.guidanceRules}>
                  <div className={styles.guidanceRule}>
                    <strong>7-9 checkboxes:</strong> <span className={styles.strongRecommend}>Flat Rate Highly Recommended</span>
                  </div>
                  <div className={styles.guidanceRule}>
                    <strong>4-6 checkboxes:</strong> <span className={styles.mediumRecommend}>Consider Based on Primary Priorities</span>
                  </div>
                  <div className={styles.guidanceRule}>
                    <strong>0-3 checkboxes:</strong> <span className={styles.weakRecommend}>Standard VAT Likely Better</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Implementation Strategy: Making the Transition</h2>
            <p>Successfully implementing the Flat Rate Scheme requires careful planning and systematic execution:</p>

            <div className={styles.implementationPlan}>
              <div className={styles.planningPhase}>
                <h4>📋 Planning Phase (Week 1-2)</h4>
                <div className={styles.phaseActivities}>
                  <ul>
                    <li><strong>🔍 Rate Research:</strong> Confirm correct flat rate percentage for your business category</li>
                    <li><strong>📊 Financial Analysis:</strong> Complete detailed comparison calculation with historical data</li>
                    <li><strong>💼 System Assessment:</strong> Evaluate current accounting software compatibility</li>
                    <li><strong>📅 Timing Planning:</strong> Choose optimal VAT period start date for transition</li>
                  </ul>
                </div>
              </div>

              <div className={styles.applicationPhase}>
                <h4>📝 Application Phase (Week 3)</h4>
                <div className={styles.phaseActivities}>
                  <ul>
                    <li><strong>🌐 Online Application:</strong> Submit application through HMRC online services</li>
                    <li><strong>📋 Documentation:</strong> Provide business activity details and turnover evidence</li>
                    <li><strong>⏰ Confirmation:</strong> Receive acceptance confirmation and effective date</li>
                    <li><strong>🔄 Process Setup:</strong> Configure new calculation method in business systems</li>
                  </ul>
                </div>
              </div>

              <div className={styles.transitionPhase}>
                <h4>🚀 Transition Phase (Week 4-8)</h4>
                <div className={styles.phaseActivities}>
                  <ul>
                    <li><strong>💻 System Updates:</strong> Update accounting software settings and templates</li>
                    <li><strong>👥 Team Training:</strong> Train staff on new VAT calculation method</li>
                    <li><strong>📄 Invoice Changes:</strong> Update invoice templates to reflect scheme membership</li>
                    <li><strong>📈 Monitoring Setup:</strong> Establish turnover tracking for exit trigger monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.relatedResources}>
            <h2>Related Resources</h2>
            <p>Master all aspects of VAT strategy with our comprehensive guide series:</p>
            
            <div className={styles.resourceGrid}>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-explained-guide">VAT Explained: A Strategic Guide for UK Businesses</Link>
                <p>Build foundational understanding of VAT principles and strategic applications</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-rates-2025">UK VAT Rates 2025: Your Strategic Pricing Compass</Link>
                <p>Understand how different VAT rates impact business strategy and competitive positioning</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-threshold-guide">Understanding the £85,000 VAT Threshold</Link>
                <p>Navigate registration decisions and timing strategies for optimal business outcomes</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-return-guide">Your First VAT Return: Step-by-Step Guide</Link>
                <p>Master VAT return submission whether using standard or flat rate methods</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-mistakes-guide">Top 10 Common VAT Mistakes to Avoid</Link>
                <p>Prevent costly errors in both standard and flat rate VAT calculations</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/uk-vat-calculator">UK VAT Calculator</Link>
                <p>Calculate and compare standard VAT vs flat rate implications for your business</p>
              </div>
            </div>
          </section>

          <section className={styles.externalResources}>
            <h4>External Resources</h4>
            <p>For official guidance and current flat rates:</p>
            <ul>
              <li><a href="https://www.gov.uk/vat-flat-rate-scheme" target="_blank" rel="noopener noreferrer">HMRC Flat Rate Scheme Guide</a> - Official scheme rules and current rate tables</li>
              <li><a href="https://ifs.org.uk/" target="_blank" rel="noopener noreferrer">Institute for Fiscal Studies</a> - Independent analysis of small business tax policy</li>
            </ul>
          </section>

          <section className={styles.conclusion}>
            <h2>Conclusion: Simplicity vs. Optimization</h2>
            <p>The VAT Flat Rate Scheme represents a fundamental choice between administrative simplicity and financial optimization. For many service-based businesses, it offers both cost savings and operational benefits. For others, particularly those with significant input costs, it represents an expensive convenience.</p>
            
            <p>The most successful scheme participants are those who make informed decisions based on comprehensive analysis rather than assumptions about simplicity or savings. Regular review ensures the scheme continues to serve business objectives as operations evolve.</p>
            
            <div className={styles.finalStrategy}>
              <h4>🎯 Your Flat Rate Strategy Framework</h4>
              <p>Implement this systematic approach to flat rate decision-making:</p>
              <ul className={styles.strategySteps}>
                <li>
                  <input type="checkbox" className={styles.strategyBox} />
                  <label><strong>Calculate:</strong> Compare both methods using 12 months of actual business data</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.strategyBox} />
                  <label><strong>Classify:</strong> Research and confirm your correct business category and flat rate</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.strategyBox} />
                  <label><strong>Consider:</strong> Value administrative time savings against financial costs/benefits</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.strategyBox} />
                  <label><strong>Plan:</strong> Identify capital purchase opportunities to maximize VAT recovery</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.strategyBox} />
                  <label><strong>Implement:</strong> Choose optimal timing for scheme entry and system updates</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.strategyBox} />
                  <label><strong>Monitor:</strong> Set up annual reviews to assess continued suitability</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.strategyBox} />
                  <label><strong>Exit Plan:</strong> Establish criteria and processes for leaving scheme if beneficial</label>
                </li>
              </ul>
            </div>
          </section>

          <div className={styles.disclaimer}>
            <p><em>This guide provides strategic analysis of the VAT Flat Rate Scheme based on current HMRC rules and rates. Business circumstances vary significantly, and flat rates can change. Always verify current rates with HMRC and consult qualified tax professionals for business-specific advice. Use our <Link href="/en/tax-and-freelance-uk-us-ca/uk-vat-calculator">UK VAT Calculator</Link> for precise comparisons.</em></p>
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

export default FlatRateSchemeGuide;