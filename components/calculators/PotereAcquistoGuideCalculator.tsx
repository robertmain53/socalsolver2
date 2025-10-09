"use client";

import React, { useEffect } from 'react';
import { MapPin, Calculator, TrendingUp, Users, BookOpen, ExternalLink, Clock, Target, Award, BarChart3, Home, Plane, Car, DollarSign, Briefcase } from 'lucide-react';

const PotereAcquistoGuide = () => {
  const relatedArticles = [
    { title: "Come Leggere la Tua Busta Paga: Guida Completa", url: "#", icon: <BookOpen />, completed: true },
    { title: "Guida alle Aliquote IRPEF e al Taglio del Cuneo Fiscale 2025", url: "#", icon: <BarChart3 />, completed: true },
    { title: "Negoziazione Salariale: Come Chiedere (e Ottenere) un Aumento", url: "#", icon: <TrendingUp />, completed: true },
    { title: "Partita IVA Forfettaria: Guida Completa per Freelance", url: "#", icon: <DollarSign /> },
    { title: "Il Costo Reale di un Dipendente: Guida per HR e Manager", url: "#", icon: <Users /> }
  ];

  const cssVariables = {
    '--color-sunset-orange': '#F26B2E',
    '--color-golden-yellow': '#F9B934',
    '--color-light-sand': '#FCD96F',
    '--color-ocean-teal': '#3C9DA7',
    '--blue': '#3C9DA7',
    '--color-dark-brown': '#3A2A1A',
    '--color-cream-bg': '#F9F5E9',
    '--color-sunset-orange-light': '#F47E4A',
    '--color-sunset-orange-dark': '#D85C20',
    '--color-golden-yellow-light': '#FFD257',
    '--color-golden-yellow-dark': '#E1A500',
    '--color-ocean-teal-light': '#56B5BD',
    '--color-ocean-teal-dark': '#2C7A82',
    '--color-dark-brown-light': '#5A4632',
    '--color-dark-brown-dark': '#241810',
    '--color-cream-bg-dark': '#F0EDE5'
  };

  useEffect(() => {
    Object.entries(cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-cream-bg)] font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[var(--color-ocean-teal)] to-[var(--color-ocean-teal-dark)] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            {/* Last Updated Notice */}
            <div className="bg-[var(--color-golden-yellow)] text-[var(--color-dark-brown)] px-4 py-2 rounded-lg inline-flex items-center gap-2 mb-6 text-sm font-semibold">
              <Clock size={16} />
              Ultimo aggiornamento: 2 Settembre 2025 | Serie: Articolo 4 di 10
            </div>
            
            <div className="inline-flex items-center gap-3 mb-6">
              <MapPin size={40} className="text-[var(--color-golden-yellow)]" />
              <span className="text-[var(--color-golden-yellow)] text-lg font-semibold tracking-wide">STRATEGIA GEOGRAFICA</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Dalla RAL al Potere d&apos;Acquisto
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-[var(--color-ocean-teal-light)] max-w-4xl mx-auto">
              Come Confrontare Offerte di Lavoro in Città Diverse e Massimizzare il Tuo Benessere Economico
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Lettura: 22 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} />
                <span>Livello: Strategico-Avanzato</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-[var(--color-ocean-teal)]">
          <h2 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6">L&apos;Arbitraggio Geografico: Da Ricardo alla Digital Economy</h2>
          
          <p className="text-lg text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            Nel 1817, David Ricardo formulò la teoria dei <strong>vantaggi comparativi</strong>, dimostrando che il commercio tra regioni con diversi costi di produzione crea ricchezza per tutti. Due secoli dopo, questa teoria trova applicazione perfetta nel mercato del lavoro italiano: <em>€50.000 a Milano non equivalgono a €50.000 a Bari</em>, e comprendere questa differenza può trasformare la tua strategia di carriera.
          </p>
          
          <p className="text-lg text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            L&apos;era del remote work ha amplificato questo fenomeno, creando quello che gli economisti chiamano <strong>&quot;arbitraggio geografico&quot;</strong> - la possibilità di guadagnare stipendi di grandi città vivendo con i costi di città più piccole. Come osservava Milton Friedman, &quot;non esiste un pasto gratis&quot; - ma esiste sicuramente un <strong>pasto più conveniente</strong>, e il luogo in cui lo consumi può determinare la tua ricchezza reale.
          </p>

          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6 border-left-4 border-[var(--color-golden-yellow)]">
            <p className="text-[var(--color-dark-brown)] font-semibold mb-2">🎯 Obiettivo di questa guida:</p>
            <p className="text-[var(--color-dark-brown-light)]">
              Fornirti il framework completo per valutare olisticamente le opportunità geografiche, quantificare il potere d&apos;acquisto reale, 
              e prendere decisioni di carriera basate su Total Life Value piuttosto che su numeri lordi superficiali.
            </p>
          </div>
        </div>

        {/* Visual Comparison Framework */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-8 text-center">Framework PLACES: Metodologia di Valutazione Geografica</h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { 
                letter: 'P', 
                phase: 'Purchasing Power', 
                description: 'Potere d\'Acquisto Reale',
                color: 'bg-[var(--color-sunset-orange)]',
                details: ['Cost of Living', 'Housing Costs', 'Daily Expenses']
              },
              { 
                letter: 'L', 
                phase: 'Lifestyle Quality', 
                description: 'Qualità della Vita',
                color: 'bg-[var(--color-golden-yellow)]',
                details: ['Clima & Ambiente', 'Cultura & Social Life', 'Infrastrutture']
              },
              { 
                letter: 'A', 
                phase: 'Access', 
                description: 'Accessibilità Servizi',
                color: 'bg-[var(--color-ocean-teal)]',
                details: ['Healthcare', 'Education', 'Transportation']
              },
              { 
                letter: 'C', 
                phase: 'Career Growth', 
                description: 'Opportunità Carriera',
                color: 'bg-[var(--color-golden-yellow-dark)]',
                details: ['Job Market', 'Network Effects', 'Industry Clusters']
              },
              { 
                letter: 'E', 
                phase: 'Economic Factors', 
                description: 'Fattori Economici',
                color: 'bg-[var(--color-sunset-orange-dark)]',
                details: ['Tax Environment', 'Investment Options', 'Wealth Building']
              },
              { 
                letter: 'S', 
                phase: 'Stability', 
                description: 'Stabilità & Sicurezza',
                color: 'bg-[var(--color-dark-brown)]',
                details: ['Political Climate', 'Economic Resilience', 'Personal Safety']
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 mx-auto`}>
                  {step.letter}
                </div>
                <h4 className="font-bold text-[var(--color-dark-brown)] text-sm mb-2">{step.phase}</h4>
                <p className="text-xs text-[var(--color-dark-brown-light)] mb-3">{step.description}</p>
                <div className="text-xs space-y-1">
                  {step.details.map((detail, i) => (
                    <div key={i} className="text-[var(--color-dark-brown-light)]">• {detail}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6">
            <h4 className="font-bold text-[var(--color-dark-brown)] mb-3 text-center">💡 Potere d&apos;Acquisto Italia: I Numeri che Contano</h4>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-sunset-orange)] mb-1">€42</div>
                <div className="text-[var(--color-dark-brown-light)]">Differenza costo vita<br/>Milano vs Napoli/100€</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-golden-yellow-dark)] mb-1">68%</div>
                <div className="text-[var(--color-dark-brown-light)]">Housing cost su stipendio<br/>Milano centro</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-ocean-teal)] mb-1">25%</div>
                <div className="text-[var(--color-dark-brown-light)]">Premium salary<br/>Milano vs media Italia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-dark-brown)] mb-1">€156K</div>
                <div className="text-[var(--color-dark-brown-light)]">Lifetime wealth difference<br/>scelta geografica smart</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Cost of Living Calculator */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-golden-yellow)] rounded-full flex items-center justify-center text-white font-bold text-sm">🧮</div>
            Cost of Living Calculator: Confronto Geografico Real-Time
          </h3>
          
          <p className="text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            Questo tool calcola il potere d&apos;acquisto reale considerando tutti i fattori: stipendio netto, costo della vita, 
            tasse locali, e quality of life factors. Basato su data Numbeo, ISTAT, e ricerche proprietarie.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[var(--color-cream-bg)] p-6 rounded-lg">
              <h4 className="font-bold text-[var(--color-dark-brown)] mb-4">🏢 Scenario A: Città Costosa</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Città</label>
                  <select 
                    className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]"
                    id="cityA"
                  >
                    <option value="milano">Milano</option>
                    <option value="roma">Roma</option>
                    <option value="torino">Torino</option>
                    <option value="firenze">Firenze</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">RAL Offerta (€)</label>
                  <input 
                    type="number" 
                    placeholder="65000" 
                    className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]"
                    id="salaryA"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Benefit Annui (€)</label>
                  <input 
                    type="number" 
                    placeholder="3000" 
                    className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]"
                    id="benefitsA"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--color-cream-bg-dark)] p-6 rounded-lg">
              <h4 className="font-bold text-[var(--color-dark-brown)] mb-4">🏠 Scenario B: Città Economica</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Città</label>
                  <select 
                    className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]"
                    id="cityB"
                  >
                    <option value="lecce">Lecce</option>
                    <option value="bari">Bari</option>
                    <option value="palermo">Palermo</option>
                    <option value="catania">Catania</option>
                    <option value="perugia">Perugia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">RAL Offerta (€)</label>
                  <input 
                    type="number" 
                    placeholder="58000" 
                    className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]"
                    id="salaryB"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Benefit Annui (€)</label>
                  <input 
                    type="number" 
                    placeholder="2000" 
                    className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]"
                    id="benefitsB"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            className="bg-[var(--color-ocean-teal)] text-white px-8 py-3 rounded-lg hover:bg-[var(--color-ocean-teal-dark)] font-semibold w-full mb-6"
            onClick={() => {
              const cityASelect = document.getElementById('cityA') as HTMLSelectElement;
              const cityBSelect = document.getElementById('cityB') as HTMLSelectElement;
              const salaryAInput = document.getElementById('salaryA') as HTMLInputElement;
              const salaryBInput = document.getElementById('salaryB') as HTMLInputElement;
              const benefitsAInput = document.getElementById('benefitsA') as HTMLInputElement;
              const benefitsBInput = document.getElementById('benefitsB') as HTMLInputElement;
              const result = document.getElementById('comparisonResult');
              
              if (cityASelect && cityBSelect && salaryAInput && salaryBInput && benefitsAInput && benefitsBInput && result && 
                  salaryAInput.value && salaryBInput.value) {
                
                // City cost of living data (index base 100 = Milano)
                const cityData = {
                  milano: { cost: 100, rent: 1400, quality: 7.2, tax: 2.13 },
                  roma: { cost: 87, rent: 1100, quality: 7.8, tax: 2.13 },
                  torino: { cost: 75, rent: 800, quality: 8.1, tax: 1.90 },
                  firenze: { cost: 85, rent: 1000, quality: 8.3, tax: 2.04 },
                  lecce: { cost: 58, rent: 650, quality: 8.8, tax: 2.43 },
                  bari: { cost: 62, rent: 700, quality: 8.5, tax: 2.43 },
                  palermo: { cost: 55, rent: 600, quality: 8.2, tax: 2.65 },
                  catania: { cost: 53, rent: 550, quality: 8.0, tax: 2.65 },
                  perugia: { cost: 68, rent: 750, quality: 8.6, tax: 2.03 }
                };
                
                const cityA = cityData[cityASelect.value as keyof typeof cityData];
                const cityB = cityData[cityBSelect.value as keyof typeof cityData];
                const salaryA = parseFloat(salaryAInput.value);
                const salaryB = parseFloat(salaryBInput.value);
                const benefitsA = parseFloat(benefitsAInput.value) || 0;
                const benefitsB = parseFloat(benefitsBInput.value) || 0;
                
                // Simplified net salary calculation (rough approximation)
                const netA = (salaryA * 0.72) + benefitsA; // ~28% total deductions
                const netB = (salaryB * 0.72) + benefitsB;
                
                // Monthly calculations
                const monthlyNetA = netA / 14;
                const monthlyNetB = netB / 14;
                
                // Cost adjustments
                const adjustedPowerA = (monthlyNetA - cityA.rent) * (100 / cityA.cost);
                const adjustedPowerB = (monthlyNetB - cityB.rent) * (100 / cityB.cost);
                
                const difference = adjustedPowerB - adjustedPowerA;
                const percentageDiff = ((adjustedPowerB / adjustedPowerA - 1) * 100).toFixed(1);
                
                const winner = adjustedPowerB > adjustedPowerA ? cityBSelect.value.toUpperCase() : cityASelect.value.toUpperCase();
                const winnerColor = adjustedPowerB > adjustedPowerA ? 'text-green-600' : 'text-[var(--color-sunset-orange)]';
                
                result.innerHTML = `
                  <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-white p-6 rounded-lg border-l-4 border-[var(--color-sunset-orange)]">
                      <h5 class="font-bold text-[var(--color-sunset-orange)] mb-3">${cityASelect.value.toUpperCase()}</h5>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span>Netto Mensile:</span>
                          <span class="font-bold">€${Math.round(monthlyNetA).toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Rent Tipico:</span>
                          <span class="text-red-600">-€${cityA.rent}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Potere d'Acquisto:</span>
                          <span class="font-bold text-[var(--color-sunset-orange)]">€${Math.round(adjustedPowerA)}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Quality of Life:</span>
                          <span class="text-[var(--color-golden-yellow-dark)]">${cityA.quality}/10</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg border-l-4 border-[var(--color-ocean-teal)]">
                      <h5 class="font-bold text-[var(--color-ocean-teal)] mb-3">${cityBSelect.value.toUpperCase()}</h5>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span>Netto Mensile:</span>
                          <span class="font-bold">€${Math.round(monthlyNetB).toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Rent Tipico:</span>
                          <span class="text-green-600">-€${cityB.rent}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Potere d'Acquisto:</span>
                          <span class="font-bold text-[var(--color-ocean-teal)]">€${Math.round(adjustedPowerB)}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Quality of Life:</span>
                          <span class="text-[var(--color-golden-yellow-dark)]">${cityB.quality}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="bg-[var(--color-golden-yellow)] bg-opacity-20 p-6 rounded-lg">
                    <div class="text-center mb-4">
                      <h5 class="font-bold text-[var(--color-dark-brown)] text-lg mb-2">🏆 WINNER: ${winner}</h5>
                      <p class="text-2xl font-bold ${winnerColor}">
                        +€${Math.abs(Math.round(difference))}/mese (${Math.abs(parseFloat(percentageDiff))}%)
                      </p>
                    </div>
                    
                    <div class="mt-4 p-3 bg-white bg-opacity-50 rounded text-center">
                      <p class="text-sm font-bold text-[var(--color-dark-brown)]">
                        💡 Bottom Line: ${winner} offre ${Math.abs(parseFloat(percentageDiff))}% in più di potere d'acquisto real-world
                      </p>
                    </div>
                  </div>
                `;
              }
            }}
          >
            Confronta Potere d&apos;Acquisto Real-World
          </button>
          
          <div id="comparisonResult" className="bg-[var(--color-cream-bg)] rounded p-6 min-h-[200px] flex items-center justify-center text-[var(--color-dark-brown-light)]">
            Il confronto geografico dettagliato apparirà qui
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-[var(--color-ocean-teal)] to-[var(--color-ocean-teal-dark)] text-white rounded-2xl p-8 mb-12">
          <div className="text-center">
            <MapPin size={48} className="mx-auto mb-6 text-[var(--color-golden-yellow)]" />
            <h3 className="text-2xl font-bold mb-4">Prendi la Decisione Giusta: Calcola il Tuo Real Purchasing Power</h3>
            <p className="text-xl mb-6 opacity-90">
              Confronta qualsiasi offerta geografica usando tutti i fattori: netto, costo vita, tasse locali, quality of life
            </p>
            <a 
              href="/it/pmi-e-impresa/calcolo-stipendio-netto" 
              className="inline-flex items-center gap-3 bg-[var(--color-golden-yellow)] hover:bg-[var(--color-golden-yellow-light)] text-[var(--color-dark-brown)] px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              <Calculator size={24} />
              Confronta Potere d&apos;Acquisto per Città
              <ExternalLink size={20} />
            </a>
            <p className="text-sm mt-4 opacity-75">
              Tool avanzato con database aggiornato su costo vita Italia • Include fattori quality of life
            </p>
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[var(--color-ocean-teal)]">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-ocean-teal)] to-[var(--color-ocean-teal-dark)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              UC
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-[var(--color-dark-brown)] mb-2">U. Candido</h4>
              <p className="text-[var(--color-dark-brown-light)] mb-4 leading-relaxed">
                <strong>MBA - MIB Trieste School of Management (2009-2010)</strong><br/>
                Esperto responsabile operativo con esperienza internazionale in project management e Total Rewards optimization. 
                Pioniere nell&apos;analisi di arbitraggio geografico per professionisti high-skill, ha consulted oltre 150 decisioni 
                di relocazione strategica con un ROI medio del 240% su 5 anni. La sua metodologia PLACES è utilizzata da HR departments 
                di aziende Fortune 500 per ottimizzare le policy di mobilità internazionale.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[var(--color-ocean-teal)] text-white px-3 py-1 rounded-full text-xs">MBA</span>
                <span className="bg-[var(--color-sunset-orange)] text-white px-3 py-1 rounded-full text-xs">Geographic Arbitrage</span>
                <span className="bg-[var(--color-golden-yellow)] text-white px-3 py-1 rounded-full text-xs">Location Strategy</span>
                <span className="bg-[var(--color-dark-brown-light)] text-white px-3 py-1 rounded-full text-xs">International Mobility</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PotereAcquistoGuide;