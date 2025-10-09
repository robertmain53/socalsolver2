'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './VatRatesGuide.module.css';

interface VatRateExample {
  category: string;
  items: string[];
  rate: string;
  businessImplication: string;
}

const VatRatesGuide: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'standard' | 'reduced' | 'zero' | 'exempt'>('standard');

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

  const vatRateData: Record<string, VatRateExample[]> = {
    standard: [
      {
        category: "Most Goods & Services",
        items: ["Office equipment", "Professional services", "Software licenses", "Marketing materials"],
        rate: "20%",
        businessImplication: "Standard pricing strategies apply - build VAT into customer pricing models"
      },
      {
        category: "Business Services",
        items: ["Consulting", "Legal services", "Accounting", "Web development"],
        rate: "20%",
        businessImplication: "B2B clients can reclaim - focus on net pricing in proposals"
      },
      {
        category: "Hospitality & Entertainment",
        items: ["Restaurant meals", "Hotels", "Event venues", "Corporate entertainment"],
        rate: "20%",
        businessImplication: "Consider inclusive pricing for consumer appeal, net pricing for corporate clients"
      }
    ],
    reduced: [
      {
        category: "Energy & Utilities",
        items: ["Domestic gas & electricity", "Heating oil", "Solar panel installation"],
        rate: "5%",
        businessImplication: "Energy-intensive businesses benefit from reduced input costs"
      },
      {
        category: "Child Safety",
        items: ["Children's car seats", "Child safety equipment", "Baby monitors"],
        rate: "5%",
        businessImplication: "Family-focused businesses can leverage lower VAT burden in pricing"
      },
      {
        category: "Public Health",
        items: ["Contraceptives", "Nicotine replacement therapy", "Medical aids"],
        rate: "5%",
        businessImplication: "Healthcare businesses benefit from reduced administrative costs"
      }
    ],
    zero: [
      {
        category: "Essential Foods",
        items: ["Fresh fruit & vegetables", "Meat & fish", "Bread & cereals", "Milk & dairy"],
        rate: "0%",
        businessImplication: "Food businesses can reclaim input VAT while charging 0% - significant cash flow advantage"
      },
      {
        category: "Transportation",
        items: ["Public transport", "Air travel", "Shipping services", "Taxi services"],
        rate: "0%",
        businessImplication: "Transport businesses maintain competitive pricing while recovering input costs"
      },
      {
        category: "Publishing & Education",
        items: ["Books", "Newspapers", "Educational courses", "Training materials"],
        rate: "0%",
        businessImplication: "Knowledge businesses can invest recovered VAT into content development"
      }
    ],
    exempt: [
      {
        category: "Financial Services",
        items: ["Bank charges", "Insurance premiums", "Investment management", "Currency exchange"],
        rate: "Exempt",
        businessImplication: "Cannot charge or reclaim VAT - factor into pricing strategies and margin calculations"
      },
      {
        category: "Healthcare",
        items: ["Medical treatments", "Dental services", "Hospital care", "Prescription medicines"],
        rate: "Exempt",
        businessImplication: "Healthcare providers must absorb VAT costs - impacts service pricing and profitability"
      },
      {
        category: "Education & Property",
        items: ["School fees", "Property rentals", "Land sales", "Postage stamps"],
        rate: "Exempt",
        businessImplication: "Property and education businesses cannot recover VAT on related expenses"
      }
    ]
  };

  return (
    <div>
      <div 
        className={styles.progressBar}
        style={{ width: `${readingProgress}%` }}
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>UK VAT Rates 2025: Your Strategic Pricing Compass</h1>
          <p className={styles.subtitle}>Mastering Standard, Reduced, Zero-Rated, and Exempt Classifications for Competitive Advantage</p>
        </header>

        <main className={styles.content}>
          <section className={styles.audienceBox}>
            <h2>Who Is This Guide For?</h2>
            <p>This comprehensive guide serves UK business owners, financial managers, and pricing strategists who need to understand not just <em>what</em> VAT rates apply, but <em>how</em> to leverage this knowledge for competitive positioning, cash flow optimization, and strategic decision-making. Whether you&apos;re setting prices, choosing suppliers, or planning product launches, understanding VAT rate implications is crucial for business success.</p>
          </section>

          <section className={styles.executiveSummary}>
            <h2>Executive Summary</h2>
            <p>VAT rates in the UK represent far more than administrative categories—they constitute a strategic framework that influences pricing power, competitive positioning, and cash flow dynamics across different industries. Understanding these rates enables businesses to optimize their value propositions while maintaining compliance.</p>
            
            <div className={styles.keyTakeaways}>
              <strong>Strategic Insights:</strong>
              <ul>
                <li>VAT rate classification directly impacts your pricing strategy and competitive position in the market</li>
                <li>Zero-rated businesses gain significant cash flow advantages through input VAT recovery without output charges</li>
                <li>Exempt status requires careful margin calculation as businesses cannot recover input VAT costs</li>
                <li>Mixed-rate businesses need sophisticated accounting systems to optimize their VAT position</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>VAT Rates at a Glance</h2>
            <p>Quick reference for understanding the four main VAT categories and their core principles:</p>
            
            <table className={styles.quickReferenceTable}>
              <thead>
                <tr>
                  <th>Rate Category</th>
                  <th>Rate</th>
                  <th>Core Principle</th>
                  <th>Business Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Standard</strong></td>
                  <td>20%</td>
                  <td>The default rate for most goods and services</td>
                  <td>💰 Standard cash flow cycle</td>
                </tr>
                <tr>
                  <td><strong>Reduced</strong></td>
                  <td>5%</td>
                  <td>Applied to specific, socially important items</td>
                  <td>📈 Pricing advantage in targeted sectors</td>
                </tr>
                <tr>
                  <td><strong>Zero-Rated</strong></td>
                  <td>0%</td>
                  <td>Charge 0% but can still reclaim input VAT (Advantageous)</td>
                  <td>⚡ Maximum cash flow benefit</td>
                </tr>
                <tr>
                  <td><strong>Exempt</strong></td>
                  <td>N/A</td>
                  <td>Cannot charge VAT and cannot reclaim input VAT (Restrictive)</td>
                  <td>⚖️ Requires careful margin management</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>The Strategic Framework of VAT Rates</h2>
            <p>The UK&apos;s multi-tiered VAT system reflects sophisticated economic policy designed to balance revenue generation with social objectives. Each rate category creates distinct business environments that savvy entrepreneurs can leverage for competitive advantage.</p>

            <p>From a <strong>game theory perspective</strong>, VAT rates create different competitive landscapes. Businesses operating in zero-rated sectors enjoy cash flow advantages that can be reinvested for growth, while exempt businesses must build VAT costs into their pricing strategies, potentially affecting market positioning.</p>

            <div className={styles.strategicInsight}>
              <strong>Strategic Principle:</strong> Your VAT rate classification isn&apos;t just a compliance matter—it&apos;s a fundamental factor in your business model that affects everything from pricing strategies to cash flow management and competitive positioning.
            </div>
          </section>

          <section>
            <h2>The Standard Rate (20%): The Competitive Baseline</h2>
            <p>The 20% standard rate applies to most business activities and represents the <strong>competitive baseline</strong> against which other rates create advantages or disadvantages. Understanding how to navigate this rate strategically separates sophisticated businesses from mere compliance followers.</p>

            <h3>Strategic Applications of Standard Rate</h3>
            <div className={styles.rateExplanation}>
              <div className={styles.rateHeader}>
                <span className={styles.ratePercentage}>20%</span>
                <div>
                  <h4>Standard Rate Coverage</h4>
                  <p>Applies to most goods and services unless specifically classified otherwise</p>
                </div>
              </div>
              
              <div className={styles.businessStrategy}>
                <h4>Business Strategy Implications:</h4>
                <ul>
                  <li>💰 <strong>B2B Pricing:</strong> Emphasize net prices since business customers can reclaim VAT</li>
                  <li>🎯 <strong>B2C Pricing:</strong> Consider psychological pricing points that include VAT</li>
                  <li>💵 <strong>Cash Flow:</strong> Use the collection-to-remittance period for working capital optimization</li>
                  <li>⚖️ <strong>Competitive Analysis:</strong> Ensure like-for-like comparisons include VAT treatment</li>
                </ul>
              </div>
            </div>

            <div className={styles.corporateExample}>
              <strong>Strategic Example:</strong> Microsoft&apos;s UK operations demonstrate sophisticated VAT management. Their enterprise software licenses (standard rated) are priced strategically for B2B customers who recover VAT, while consumer products factor VAT into psychological pricing points like £99.99.
            </div>

            <h3>Industry Applications</h3>
            <div className={styles.industryGrid}>
              <div className={styles.industryCard}>
                <h4>Professional Services</h4>
                <p>Consulting, legal, accounting services benefit from net pricing strategies with corporate clients</p>
              </div>
              <div className={styles.industryCard}>
                <h4>Technology</h4>
                <p>Software and hardware sales can leverage B2B VAT recovery in enterprise pricing models</p>
              </div>
              <div className={styles.industryCard}>
                <h4>Manufacturing</h4>
                <p>Industrial equipment and components allow for strategic supplier selection based on VAT treatment</p>
              </div>
            </div>
          </section>

          <section>
            <h2>The Reduced Rate (5%): Strategic Sector Advantages</h2>
            <p>The 5% reduced rate creates <strong>competitive advantages</strong> for businesses in specific sectors deemed socially or economically important. This rate represents government policy designed to make essential services more affordable while maintaining market functionality.</p>

            <div className={styles.rateExplanation}>
              <div className={styles.rateHeader}>
                <span className={styles.reducedRatePercentage}>5%</span>
                <div>
                  <h4>Reduced Rate Benefits</h4>
                  <p>Applied to socially important goods and services for affordability</p>
                </div>
              </div>
              
              <div className={styles.businessStrategy}>
                <h4>Strategic Opportunities:</h4>
                <ul>
                  <li>💰 <strong>Cost Advantage:</strong> Lower VAT burden enables competitive pricing</li>
                  <li>🚀 <strong>Market Entry:</strong> Reduced barriers for price-sensitive consumers</li>
                  <li>📈 <strong>Margin Enhancement:</strong> Lower tax burden can improve profitability</li>
                  <li>🌟 <strong>Social Positioning:</strong> Association with essential services enhances brand perception</li>
                </ul>
              </div>
            </div>

            <h3>Key Sectors and Applications</h3>
            <div className={styles.sectorExamples}>
              <div className={styles.sectorCard}>
                <h4>🔥 Energy Sector</h4>
                <div className={styles.sectorItems}>
                  <strong>Covered:</strong> Domestic gas, electricity, heating oil, coal
                  <br/>
                  <strong>Strategy:</strong> Energy companies can offer more competitive rates to domestic customers while maintaining margins
                </div>
              </div>
              
              <div className={styles.sectorCard}>
                <h4>👶 Child Safety</h4>
                <div className={styles.sectorItems}>
                  <strong>Covered:</strong> Car seats, cycle helmets, child safety equipment
                  <br/>
                  <strong>Strategy:</strong> Family-focused retailers gain pricing advantages over general retailers
                </div>
              </div>
              
              <div className={styles.sectorCard}>
                <h4>🏠 Home Improvements</h4>
                <div className={styles.sectorItems}>
                  <strong>Covered:</strong> Solar panels, insulation, energy-saving materials
                  <br/>
                  <strong>Strategy:</strong> Green technology companies benefit from government sustainability incentives
                </div>
              </div>
            </div>

            <div className={styles.corporateExample}>
              <strong>Industry Example:</strong> British Gas leverages the 5% domestic energy rate to offer competitive pricing packages while maintaining healthy margins. This rate advantage becomes particularly pronounced during energy price volatility, providing pricing flexibility unavailable to standard-rated competitors.
            </div>

            <div className={styles.smallBusinessSpotlight}>
              <strong>Small Business Spotlight:</strong> A local electrician installing solar panels benefits from the 5% reduced rate on installations. This allows them to quote more competitively against larger contractors while maintaining better margins, especially when combined with government green energy incentives.
            </div>
          </section>

          <section>
            <h2>Zero-Rated (0%): The Cash Flow Advantage</h2>
            <p>Zero-rated goods and services represent the most strategically advantageous VAT position—businesses can <strong>reclaim input VAT</strong> while charging 0% to customers. This creates powerful cash flow and competitive advantages that sophisticated businesses leverage for growth.</p>

            <div className={styles.rateExplanation}>
              <div className={styles.rateHeader}>
                <span className={styles.zeroRatePercentage}>0%</span>
                <div>
                  <h4>Zero-Rated Advantages</h4>
                  <p>Charge 0% VAT while recovering all input VAT costs</p>
                </div>
              </div>
              
              <div className={styles.businessStrategy}>
                <h4>Strategic Benefits:</h4>
                <ul>
                  <li>💵 <strong>Cash Flow Boost:</strong> Regular VAT refunds from HMRC improve working capital</li>
                  <li>🎯 <strong>Competitive Pricing:</strong> Lower consumer prices without sacrificing margins</li>
                  <li>🚀 <strong>Reinvestment Opportunity:</strong> VAT savings can fund business development</li>
                  <li>⭐ <strong>Market Positioning:</strong> Association with essential goods enhances brand value</li>
                </ul>
              </div>
            </div>

            <h3>Critical Distinction: Zero-Rated vs. VAT Exempt</h3>
            <div className={styles.videoExplainerNote}>
              <h4>🎥 Visual Learning Recommendation</h4>
              <p>This is the most critical and often confusing concept in VAT. Consider watching a short animated explanation of money and VAT flow for zero-rated vs. exempt businesses to make this distinction crystal clear. <em>Visual demonstrations of cash flow differences are particularly effective for understanding these complex relationships.</em></p>
            </div>
            
            <div className={styles.comparisonBox}>
              <div className={styles.comparisonSide}>
                <h4>✅ Zero-Rated (Advantageous)</h4>
                <ul>
                  <li>Can reclaim input VAT</li>
                  <li>Charge 0% to customers</li>
                  <li>Often receive VAT refunds</li>
                  <li>Strong cash flow position</li>
                </ul>
              </div>
              <div className={styles.comparisonSide}>
                <h4>❌ VAT Exempt (Restrictive)</h4>
                <ul>
                  <li>Cannot reclaim input VAT</li>
                  <li>Cannot charge VAT</li>
                  <li>Absorb VAT costs internally</li>
                  <li>Weaker cash flow position</li>
                </ul>
              </div>
            </div>

            <h3>Zero-Rated Categories and Business Implications</h3>
            <div className={styles.zeroRatedGrid}>
              <div className={styles.zeroRatedCard}>
                <h4>🥬 Food & Agriculture</h4>
                <p><strong>Items:</strong> Fresh food, agricultural products, animal feed</p>
                <p><strong>Strategy:</strong> Food retailers and producers benefit from significant cost advantages through VAT recovery on supplies, equipment, and logistics while maintaining consumer-friendly pricing.</p>
                <div className={styles.smallBusinessSpotlight}>
                  <strong>Small Business Example:</strong> An independent bakery can reclaim VAT on its new ovens, flour purchases, and delivery van, giving it a direct cash-flow advantage to compete with larger supermarket chains while keeping bread prices affordable for customers.
                </div>
              </div>
              
              <div className={styles.zeroRatedCard}>
                <h4>🚌 Transport</h4>
                <p><strong>Items:</strong> Public transport, international flights, ship transport</p>
                <p><strong>Strategy:</strong> Transport companies can invest recovered VAT into service improvements and fleet expansion while maintaining competitive ticket prices.</p>
              </div>
              
              <div className={styles.zeroRatedCard}>
                <h4>📚 Knowledge & Culture</h4>
                <p><strong>Items:</strong> Books, newspapers, educational materials</p>
                <p><strong>Strategy:</strong> Publishers and educational providers can reinvest VAT savings into content development and technology upgrades.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>VAT Exempt: Navigating the Strategic Challenge</h2>
            <p>VAT exempt goods and services present unique strategic challenges—businesses cannot charge VAT <em>or</em> reclaim input VAT. This creates a need for sophisticated financial planning and margin management that many businesses overlook.</p>

            <div className={styles.rateExplanation}>
              <div className={styles.rateHeader}>
                <span className={styles.exemptRatePercentage}>EXEMPT</span>
                <div>
                  <h4>Exempt Status Implications</h4>
                  <p>Cannot charge VAT or reclaim input VAT costs</p>
                </div>
              </div>
              
              <div className={styles.businessStrategy}>
                <h4>Strategic Considerations:</h4>
                <ul>
                  <li>💸 <strong>Cost Absorption:</strong> Must build VAT costs into pricing structures</li>
                  <li>📊 <strong>Margin Planning:</strong> Factor unrecoverable VAT into profitability calculations</li>
                  <li>🔍 <strong>Supplier Selection:</strong> Prioritize VAT-efficient supply chains where possible</li>
                  <li>📦 <strong>Service Bundling:</strong> Consider mixing exempt and taxable services strategically</li>
                </ul>
              </div>
            </div>

            <h3>Major Exempt Sectors</h3>
            <div className={styles.exemptGrid}>
              <div className={styles.exemptCard}>
                <h4>🏦 Financial Services</h4>
                <p><strong>Coverage:</strong> Banking, insurance, investment management</p>
                <p><strong>Impact:</strong> Financial institutions must factor VAT costs into fee structures and operational budgets</p>
              </div>
              
              <div className={styles.exemptCard}>
                <h4>🏥 Healthcare</h4>
                <p><strong>Coverage:</strong> Medical treatments, dental care, healthcare services</p>
                <p><strong>Impact:</strong> Healthcare providers cannot recover VAT on equipment and supplies, affecting service pricing</p>
              </div>
              
              <div className={styles.exemptCard}>
                <h4>🏠 Property & Education</h4>
                <p><strong>Coverage:</strong> Property rentals, educational services, land transactions</p>
                <p><strong>Impact:</strong> Property and education businesses must carefully manage unrecoverable VAT costs</p>
              </div>
            </div>

            <div className={styles.corporateExample}>
              <strong>Strategic Example:</strong> Lloyds Banking Group manages VAT exempt status by carefully structuring services and optimizing supplier relationships. They focus on VAT-efficient procurement and factor unrecoverable VAT into comprehensive pricing models, demonstrating how exempt businesses can maintain competitiveness through strategic planning.
            </div>

            <div className={styles.smallBusinessSpotlight}>
              <strong>Small Business Spotlight:</strong> A private dental practice cannot reclaim VAT on its expensive equipment and materials. To remain competitive, the practice carefully negotiates with suppliers, factors all VAT costs into treatment pricing, and considers offering some standard-rated services (like cosmetic treatments) to partially recover input VAT.
            </div>
          </section>

          <section>
            <h2>Visual VAT Rate Decision Tree</h2>
            <p>Follow this interactive flowchart to quickly determine the correct VAT rate for your products or services:</p>
            
            <div className={styles.visualDecisionTree}>
              <div className={styles.startNode}>
                <div className={styles.nodeHeader}>🎯 START</div>
                <div className={styles.nodeContent}>
                  <strong>What are you selling?</strong><br/>
                  Product or Service Classification
                </div>
                <div className={styles.nodeArrow}>↓</div>
              </div>

              <div className={styles.decisionStep}>
                <div className={styles.questionNode}>
                  <div className={styles.nodeHeader}>❓ STEP 1</div>
                  <div className={styles.nodeContent}>
                    Is it specifically listed as <strong>zero-rated</strong>?<br/>
                    <small>(Food, books, transport, children&apos;s clothing)</small>
                  </div>
                </div>
                <div className={styles.decisionBranches}>
                  <div className={styles.branchYes}>
                    <div className={styles.branchArrow}>YES →</div>
                    <div className={styles.outcomeNode}>
                      <div className={styles.zeroOutcome}>0% ZERO-RATED</div>
                      <div className={styles.outcomeDetail}>✅ Charge 0%, reclaim input VAT</div>
                    </div>
                  </div>
                  <div className={styles.branchNo}>
                    <div className={styles.branchArrow}>NO ↓</div>
                  </div>
                </div>
              </div>

              <div className={styles.decisionStep}>
                <div className={styles.questionNode}>
                  <div className={styles.nodeHeader}>❓ STEP 2</div>
                  <div className={styles.nodeContent}>
                    Is it specifically listed as <strong>reduced rate</strong>?<br/>
                    <small>(Domestic energy, child car seats, contraceptives)</small>
                  </div>
                </div>
                <div className={styles.decisionBranches}>
                  <div className={styles.branchYes}>
                    <div className={styles.branchArrow}>YES →</div>
                    <div className={styles.outcomeNode}>
                      <div className={styles.reducedOutcome}>5% REDUCED</div>
                      <div className={styles.outcomeDetail}>📈 Lower rate advantage</div>
                    </div>
                  </div>
                  <div className={styles.branchNo}>
                    <div className={styles.branchArrow}>NO ↓</div>
                  </div>
                </div>
              </div>

              <div className={styles.decisionStep}>
                <div className={styles.questionNode}>
                  <div className={styles.nodeHeader}>❓ STEP 3</div>
                  <div className={styles.nodeContent}>
                    Is it specifically <strong>VAT exempt</strong>?<br/>
                    <small>(Financial services, healthcare, education, insurance)</small>
                  </div>
                </div>
                <div className={styles.decisionBranches}>
                  <div className={styles.branchYes}>
                    <div className={styles.branchArrow}>YES →</div>
                    <div className={styles.outcomeNode}>
                      <div className={styles.exemptOutcome}>EXEMPT</div>
                      <div className={styles.outcomeDetail}>❌ No VAT charge/recovery</div>
                    </div>
                  </div>
                  <div className={styles.branchNo}>
                    <div className={styles.branchArrow}>NO ↓</div>
                  </div>
                </div>
              </div>

              <div className={styles.finalNode}>
                <div className={styles.nodeHeader}>✅ DEFAULT</div>
                <div className={styles.nodeContent}>
                  <div className={styles.standardOutcome}>20% STANDARD RATE</div>
                  <div className={styles.outcomeDetail}>💰 Most goods & services</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Common Pitfalls & Gray Areas</h2>
            <p>VAT classification is notorious for its nuances and unexpected traps. These common mistakes can lead to costly errors and HMRC penalties:</p>

            <div className={styles.pitfallsGrid}>
              <div className={styles.pitfallCard}>
                <h4>🍪 The Biscuit Trap</h4>
                <div className={styles.pitfallExample}>
                  <strong>The Rule:</strong> Plain biscuits are zero-rated, but chocolate-covered biscuits are standard-rated (20%).
                </div>
                <div className={styles.pitfallImplication}>
                  <strong>Business Impact:</strong> A bakery selling both must separate these in their accounting systems and charge different rates to consumers.
                </div>
              </div>

              <div className={styles.pitfallCard}>
                <h4>📚 Publications Confusion</h4>
                <div className={styles.pitfallExample}>
                  <strong>The Rule:</strong> Books and magazines are zero-rated, but stationery items (even printed ones like calendars or greeting cards) are standard-rated.
                </div>
                <div className={styles.pitfallImplication}>
                  <strong>Business Impact:</strong> Publishers must carefully classify different products and may need separate point-of-sale systems.
                </div>
              </div>

              <div className={styles.pitfallCard}>
                <h4>🏠 Construction Complexities</h4>
                <div className={styles.pitfallExample}>
                  <strong>The Rule:</strong> New home construction is zero-rated, but repairs and maintenance are standard-rated. The line between &quot;improvement&quot; and &quot;repair&quot; is often disputed.
                </div>
                <div className={styles.pitfallImplication}>
                  <strong>Business Impact:</strong> Construction firms need clear project classification procedures and detailed documentation for HMRC audits.
                </div>
              </div>

              <div className={styles.pitfallCard}>
                <h4>👕 Clothing Complications</h4>
                <div className={styles.pitfallExample}>
                  <strong>The Rule:</strong> Children&apos;s clothing is zero-rated up to certain sizes, but adult clothing is standard-rated—even if it fits a child.
                </div>
                <div className={styles.pitfallImplication}>
                  <strong>Business Impact:</strong> Retailers need size-based inventory management systems and staff training on classification rules.
                </div>
              </div>

              <div className={styles.pitfallCard}>
                <h4>🚲 Transport & Delivery</h4>
                <div className={styles.pitfallExample}>
                  <strong>The Rule:</strong> Public transport is zero-rated, but private hire vehicles and delivery services are standard-rated.
                </div>
                <div className={styles.pitfallImplication}>
                  <strong>Business Impact:</strong> Transport businesses must clearly define their service type and cannot switch classifications for competitive advantage.
                </div>
              </div>

              <div className={styles.pitfallCard}>
                <h4>🎓 Education Boundaries</h4>
                <div className={styles.pitfallExample}>
                  <strong>The Rule:</strong> School education is exempt, but vocational training can be standard-rated. The distinction often depends on accreditation and course structure.
                </div>
                <div className={styles.pitfallImplication}>
                  <strong>Business Impact:</strong> Training providers must structure courses carefully and maintain detailed records of educational credentials.
                </div>
              </div>
            </div>

            <div className={styles.pitfallAdvice}>
              <h4>💡 Expert Advice</h4>
              <p>When in doubt, always obtain a written ruling from HMRC before launching new products or services. The cost of professional VAT advice is minimal compared to penalties for misclassification, especially for businesses near the registration threshold.</p>
            </div>
          </section>

          <section>
            <h2>Interactive Rate Navigator</h2>
            <p>Explore specific VAT rates and their business implications using our interactive guide:</p>
            
            <div className={styles.rateNavigator}>
              <div className={styles.navigationTabs}>
                <button 
                  className={`${styles.navTab} ${activeTab === 'standard' ? styles.active : ''}`}
                  onClick={() => setActiveTab('standard')}
                >
                  Standard (20%)
                </button>
                <button 
                  className={`${styles.navTab} ${activeTab === 'reduced' ? styles.active : ''}`}
                  onClick={() => setActiveTab('reduced')}
                >
                  Reduced (5%)
                </button>
                <button 
                  className={`${styles.navTab} ${activeTab === 'zero' ? styles.active : ''}`}
                  onClick={() => setActiveTab('zero')}
                >
                  Zero-Rated (0%)
                </button>
                <button 
                  className={`${styles.navTab} ${activeTab === 'exempt' ? styles.active : ''}`}
                  onClick={() => setActiveTab('exempt')}
                >
                  Exempt
                </button>
              </div>
              
              <div className={styles.tabContent}>
                {vatRateData[activeTab].map((example, index) => (
                  <div key={index} className={styles.exampleCard}>
                    <h4>{example.category}</h4>
                    <div className={styles.exampleItems}>
                      <strong>Examples:</strong> {example.items.join(', ')}
                    </div>
                    <div className={styles.exampleRate}>
                      <strong>Rate:</strong> {example.rate}
                    </div>
                    <div className={styles.exampleImplication}>
                      <strong>Business Implication:</strong> {example.businessImplication}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2>Advanced VAT Rate Strategies</h2>
            
            <h3>Mixed Rate Business Optimization & Partial Exemption</h3>
            <p>Businesses offering services across different VAT categories must navigate <strong>partial exemption</strong> rules—the official HMRC methodology for calculating VAT recovery when you have both taxable and exempt income streams.</p>
            
            <div className={styles.partialExemptionExample}>
              <h4>🏛️ Mixed-Rate Business Case Study: Local Museum</h4>
              <div className={styles.caseStudyBreakdown}>
                <div className={styles.revenueStream}>
                  <strong>Ticket Sales:</strong> <span className={styles.exemptLabel}>VAT Exempt</span><br/>
                  <small>Cannot charge VAT, cannot reclaim related input VAT</small>
                </div>
                <div className={styles.revenueStream}>
                  <strong>Museum Shop (Books):</strong> <span className={styles.zeroLabel}>Zero-Rated</span><br/>
                  <small>0% VAT charged, can reclaim all input VAT</small>
                </div>
                <div className={styles.revenueStream}>
                  <strong>Café Sales:</strong> <span className={styles.standardLabel}>Standard-Rated (20%)</span><br/>
                  <small>20% VAT charged, can reclaim all input VAT</small>
                </div>
              </div>
              
              <div className={styles.partialExemptionCalc}>
                <h5>Partial Exemption Calculation for Overhead Costs:</h5>
                <p>For shared costs like electricity, accounting fees, and building maintenance, the museum must use HMRC&apos;s partial exemption method to calculate how much input VAT can be recovered based on the proportion of taxable vs. exempt income.</p>
                
                <div className={styles.calculationExample}>
                  <strong>Example:</strong> If 60% of revenue comes from taxable activities (shop + café) and 40% from exempt activities (tickets), the museum can typically recover 60% of the VAT on shared overhead costs.
                </div>
              </div>
            </div>
            
            <div className={styles.strategyCard}>
              <h4>🎯 Advanced Portfolio Optimization Strategies</h4>
              <ul>
                <li><strong>🔄 Service Bundling:</strong> Combine zero-rated and standard-rated services to optimize overall VAT burden while maintaining customer value</li>
                <li><strong>🏢 Separate Trading:</strong> Consider separate legal entities for different VAT treatments when partial exemption becomes disadvantageous</li>
                <li><strong>⏰ Timing Strategies:</strong> Coordinate purchases and sales to maximize cash flow benefits and minimize partial exemption restrictions</li>
                <li><strong>📊 Monitoring Systems:</strong> Implement robust accounting systems to track different revenue streams and optimize partial exemption calculations</li>
              </ul>
            </div>

            <h3>International Trade Considerations</h3>
            <p>VAT rates interact with international trade rules, creating additional strategic opportunities:</p>
            
            <div className={styles.internationalBox}>
              <div className={styles.tradeStrategy}>
                <h4>Export Strategy</h4>
                <p>Most exports are zero-rated, providing cash flow advantages for international businesses. <Link href="/en/tax-and-freelance-uk-us-ca/vat-international-guide" className={styles.internalLink}>Learn more about international VAT implications</Link>.</p>
              </div>
              <div className={styles.tradeStrategy}>
                <h4>Import Optimization</h4>
                <p>Import VAT can be optimized through strategic timing and accounting methods to improve working capital position.</p>
              </div>
            </div>
          </section>

          <section className={styles.relatedResources}>
            <h2>Related Resources</h2>
            <p>Deepen your VAT knowledge with our comprehensive guide series:</p>
            
            <div className={styles.resourceGrid}>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-explained-guide">VAT Explained: A Strategic Guide for UK Businesses</Link>
                <p>Master the foundational concepts and strategic implications of VAT</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-threshold-guide">Understanding the £85,000 VAT Threshold</Link>
                <p>Navigate registration decisions and their strategic implications</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-flat-rate-scheme">The Flat Rate Scheme: Simplify Your VAT</Link>
                <p>Explore simplified VAT accounting for small businesses</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-reclaim-guide">Maximizing VAT Recovery on Business Expenses</Link>
                <p>Optimize your input VAT reclaim strategies</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/vat-mistakes-guide">Top 10 Common VAT Mistakes to Avoid</Link>
                <p>Prevent costly errors and penalties with expert insights</p>
              </div>
              <div className={styles.resourceItem}>
                <Link href="/en/tax-and-freelance-uk-us-ca/uk-vat-calculator">UK VAT Calculator</Link>
                <p>Calculate VAT amounts instantly with our professional tool</p>
              </div>
            </div>
          </section>

          <section className={styles.externalResources}>
            <h4>External Resources</h4>
            <p>For current rates and official guidance:</p>
            <ul>
              <li><a href="https://www.gov.uk/vat-rates" target="_blank" rel="noopener noreferrer">HMRC Official VAT Rates</a> - Current rates and classifications</li>
              <li><a href="https://ifs.org.uk/" target="_blank" rel="noopener noreferrer">Institute for Fiscal Studies</a> - Independent tax policy research and analysis</li>
            </ul>
          </section>

          <section className={styles.conclusion}>
            <h2>Conclusion: VAT Rates as Strategic Instruments</h2>
            <p>Understanding UK VAT rates transcends compliance—it&apos;s about recognizing and leveraging the strategic opportunities embedded within the tax system. Each rate category creates distinct competitive environments that astute businesses can exploit for market advantage.</p>
            
            <p>The most successful businesses don&apos;t simply apply the correct VAT rate; they understand how rate classifications affect cash flow, pricing strategies, and competitive positioning. This knowledge becomes a source of sustainable competitive advantage in increasingly complex markets.</p>
            
            <div className={styles.quarterlyChecklist}>
              <h4>📋 Quarterly VAT Rate Review Checklist</h4>
              <p>Use this practical checklist every quarter to ensure you&apos;re maximizing your VAT position:</p>
              <ul className={styles.checklistItems}>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Have we launched any new products/services? Verify their correct VAT rate classification</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Have the rules changed for any of our existing classifications? (Check latest HMRC guidance)</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Are we correctly separating sales from different rate categories in our accounting systems?</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>If we have mixed rates, is our partial exemption calculation optimized?</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Are we maximizing input VAT recovery opportunities within our rate classifications?</label>
                </li>
                <li>
                  <input type="checkbox" className={styles.checklistBox} />
                  <label>Do our pricing strategies reflect the competitive advantages of our VAT position?</label>
                </li>
              </ul>
            </div>
          </section>

          <div className={styles.disclaimer}>
            <p><em>This guide provides strategic insights into VAT rate applications. VAT rates and classifications can change. Always verify current rates with HMRC or consult qualified tax professionals for business-specific advice. Use our <Link href="/en/tax-and-freelance-uk-us-ca/uk-vat-calculator">UK VAT Calculator</Link> for accurate calculations.</em></p>
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

export default VatRatesGuide;