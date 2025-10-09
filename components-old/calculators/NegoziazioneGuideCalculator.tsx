"use client";

import React, { useEffect } from 'react';
// Aggiunte icone per la nuova sezione
import { TrendingUp, Calculator, Target, Users, BookOpen, ExternalLink, Clock, Award, DollarSign, BarChart3, Brain, Shield, Zap, MessageSquare, Info, MessageCircleQuestion } from 'lucide-react';

const NegoziazioneGuide = () => {
  const relatedArticles = [
    { title: "Come Leggere la Tua Busta Paga: Guida Completa", url: "#", icon: <BookOpen />, completed: true },
    { title: "Guida alle Aliquote IRPEF e al Taglio del Cuneo Fiscale 2025", url: "#", icon: <BarChart3 />, completed: true },
    { title: "Dalla RAL al Potere d'Acquisto: Confrontare Offerte di Lavoro", url: "#", icon: <Target /> },
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
      <div className="bg-gradient-to-r from-[var(--color-golden-yellow)] to-[var(--color-golden-yellow-dark)] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="bg-[var(--color-sunset-orange)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 mb-6 text-sm font-semibold">
              <Clock size={16} />
              Ultimo aggiornamento: 4 Settembre 2025 | Serie: Articolo 3 di 10
            </div>
            
            <div className="inline-flex items-center gap-3 mb-6">
              <TrendingUp size={40} className="text-[var(--color-sunset-orange)]" />
              <span className="text-[var(--color-sunset-orange)] text-lg font-semibold tracking-wide">STRATEGIA PROFESSIONALE</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-[var(--color-dark-brown)]">
              Negoziazione Salariale: Come Chiedere (e Ottenere) un Aumento
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-[var(--color-dark-brown)] max-w-4xl mx-auto">
              La Scienza della Persuasione Applicata alla Crescita Economica Professionale
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-[var(--color-dark-brown)]">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Lettura: 25 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} />
                <span>Livello: Strategico</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-[var(--color-golden-yellow)]">
          <h2 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6">L&apos;Arte della Persuasione Economica: Da Carnegie a Cialdini</h2>
          <p className="text-lg text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            Nel 1936, Dale Carnegie scriveva: <em>&quot;Il successo nella gestione delle relazioni umane dipende dalla capacità di ottenere cooperazione&quot;</em>. Ottant&apos;anni dopo, Robert Cialdini ha codificato i <strong>principi della persuasione</strong> che governano ogni interazione umana - incluse le negoziazioni salariali. La negoziazione non è manipolazione, è <strong>comunicazione strategica basata su valore reciproco</strong>.
          </p>
          <p className="text-lg text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            Oggi, armato della comprensione profonda della tua busta paga e del sistema fiscale italiano, sei pronto per il passo evolutivo successivo: <strong>monetizzare questa conoscenza</strong>. Come sosteneva Peter Drucker, &quot;il management è fare le cose bene, la leadership è fare le cose giuste&quot; - e chiedere quello che meriti è sempre la cosa giusta da fare.
          </p>
          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6 border-l-4 border-[var(--color-sunset-orange)]">
            <p className="text-[var(--color-dark-brown)] font-semibold mb-2">🎯 Obiettivo di questa guida:</p>
            <p className="text-[var(--color-dark-brown-light)]">
              Trasformare la tua conoscenza fiscale in potere contrattuale concreto, fornendoti framework sistematici, strumenti di calcolo precision-based e strategie psicologicamente fondate per ottenere la crescita salariale che meriti.
            </p>
          </div>
        </div>

        {/* Value Calculator Tool */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--color-golden-yellow)] rounded-full flex items-center justify-center text-white font-bold text-sm">💰</div>
              Value Calculator: Quantifica il Tuo Business Impact
            </h3>
            <div className="relative group">
              <Info size={20} className="text-gray-400 cursor-pointer"/>
              <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-800 text-white text-xs rounded p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <strong>Nota Metodologica:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Il calcolo annuale si basa su 50 settimane lavorative.</li>
                  <li>L'aumento suggerito è una stima conservativa del 4% del valore totale creato.</li>
                  <li>Il costo orario del team è il costo totale aziendale per dipendente (RAL * ~1.6) diviso per le ore lavorative.</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            Il primo passo per una negoziazione vincente è quantificare il valore che apporti all&apos;azienda. Non basta essere bravi, bisogna dimostrare quanto si vale in euro e centesimi.
          </p>
          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6">
            <h4 className="font-bold text-[var(--color-dark-brown)] mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Calcola il Valore Monetario dei Tuoi Contributi
            </h4>
            {/* Input fields remain the same */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Ore risparmiate al team/settimana</label>
                <input type="number" placeholder="10" className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]" id="timeSaved" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Dimensione team impattato</label>
                <input type="number" placeholder="5" className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]" id="teamSize" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Costo orario medio team (€)</label>
                <input type="number" placeholder="45" className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]" id="hourlyCost" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Revenue/savings extra (€/anno)</label>
                <input type="number" placeholder="50000" className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]" id="extraValue" />
              </div>
            </div>
            <button className="bg-[var(--color-golden-yellow)] text-[var(--color-dark-brown)] px-6 py-3 rounded-lg hover:bg-[var(--color-golden-yellow-light)] font-semibold w-full" onClick={() => { /* JS logic remains the same */ const timeSavedInput = document.getElementById('timeSaved') as HTMLInputElement; const teamSizeInput = document.getElementById('teamSize') as HTMLInputElement; const hourlyCostInput = document.getElementById('hourlyCost') as HTMLInputElement; const extraValueInput = document.getElementById('extraValue') as HTMLInputElement; const result = document.getElementById('valueResult'); if (timeSavedInput && teamSizeInput && hourlyCostInput && extraValueInput && result && timeSavedInput.value && teamSizeInput.value && hourlyCostInput.value) { const timeSaved = parseFloat(timeSavedInput.value); const teamSize = parseFloat(teamSizeInput.value); const hourlyCost = parseFloat(hourlyCostInput.value); const extraValue = parseFloat(extraValueInput.value) || 0; const weeklyValue = timeSaved * teamSize * hourlyCost; const annualEfficiency = weeklyValue * 50; const totalValue = annualEfficiency + extraValue; const suggestedIncrease = Math.round(totalValue * 0.04); const roi = ((totalValue / suggestedIncrease - 1) * 100).toFixed(0); result.innerHTML = `<div class="grid md:grid-cols-2 gap-4 mb-4"><div class="bg-white p-4 rounded-lg"><p class="text-xs text-[var(--color-dark-brown-light)] mb-1">Efficienza Annua</p><p class="text-2xl font-bold text-[var(--color-ocean-teal)]">€${annualEfficiency.toLocaleString()}</p><p class="text-xs">Time saved monetizzato</p></div><div class="bg-white p-4 rounded-lg"><p class="text-xs text-[var(--color-dark-brown-light)] mb-1">Valore Totale Creato</p><p class="text-2xl font-bold text-[var(--color-sunset-orange)]">€${totalValue.toLocaleString()}</p><p class="text-xs">Efficienza + revenue extra</p></div></div><div class="bg-[var(--color-golden-yellow)] bg-opacity-20 p-4 rounded-lg"><div class="grid md:grid-cols-2 gap-4"><div><p class="font-bold text-[var(--color-dark-brown)] mb-1">💡 Aumento Suggerito:</p><p class="text-xl font-bold text-[var(--color-sunset-orange)]">€${suggestedIncrease.toLocaleString()}</p><p class="text-xs text-[var(--color-dark-brown-light)]">4% del valore creato (conservative)</p></div><div><p class="font-bold text-[var(--color-dark-brown)] mb-1">📈 ROI per Azienda:</p><p class="text-xl font-bold text-green-600">${roi}%</p><p class="text-xs text-[var(--color-dark-brown-light)]">Return on investment dell'aumento</p></div></div><div class="mt-3 p-3 bg-white bg-opacity-50 rounded text-center"><p class="text-sm"><strong>Pitch vincente:</strong> "I miei contributi hanno generato €${totalValue.toLocaleString()} di valore. Chiedo €${suggestedIncrease.toLocaleString()} di aumento, garantendo all'azienda un ROI del ${roi}%."</p></div></div>`; } }}>
              Calcola il Tuo Business Impact
            </button>
            <div id="valueResult" className="mt-4 bg-[var(--color-cream-bg)] rounded p-4 min-h-[120px] flex items-center justify-center text-[var(--color-dark-brown-light)]">La quantificazione del tuo valore apparirà qui</div>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--color-dark-brown)] rounded-full flex items-center justify-center text-white font-bold text-sm">🛠️</div>
              ROI Calculator: Vale la Pena Negoziare?
            </h3>
            <div className="relative group">
              <Info size={20} className="text-gray-400 cursor-pointer"/>
              <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-800 text-white text-xs rounded p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <strong>Nota Metodologica:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Assume una crescita salariale annua composta del 3% (inflazione/progressione).</li>
                  <li>Quantifica il costo della preparazione in 20 ore al costo opportunità di 50€/ora (1000€ totali).</li>
                  <li>L'aumento mensile è calcolato su 14 mensilità.</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            Calcola il lifetime value di una negoziazione salariale di successo per capire se vale la pena investire tempo ed energie nella preparazione.
          </p>
          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6">
            <h4 className="font-bold text-[var(--color-dark-brown)] mb-4 flex items-center gap-2">
              <Target size={20} />
              Calcola il Lifetime ROI della Negoziazione
            </h4>
            {/* Input fields remain the same */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">RAL Attuale (€)</label><input type="number" placeholder="50000" className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]" id="currentRal" /></div>
              <div><label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Aumento Richiesto (€)</label><input type="number" placeholder="8000" className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]" id="requestedIncrease" /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Probabilità Successo (%)</label><select className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]" id="successProbability"><option value="30">30% - Preparation minima</option><option value="50">50% - Preparation media</option><option value="70">70% - Preparation buona</option><option value="85">85% - Preparation eccellente</option></select></div>
              <div><label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">Anni Rimanenti Carriera</label><input type="number" placeholder="15" className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]" id="careerYears" /></div>
            </div>
            <button className="bg-[var(--color-dark-brown)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-dark-brown-light)] font-semibold w-full" onClick={() => { /* JS logic remains the same */ const currentRalInput = document.getElementById('currentRal') as HTMLInputElement; const requestedIncreaseInput = document.getElementById('requestedIncrease') as HTMLInputElement; const successProbabilitySelect = document.getElementById('successProbability') as HTMLSelectElement; const careerYearsInput = document.getElementById('careerYears') as HTMLInputElement; const result = document.getElementById('roiResult'); if (currentRalInput && requestedIncreaseInput && successProbabilitySelect && careerYearsInput && result && currentRalInput.value && requestedIncreaseInput.value && careerYearsInput.value) { const currentRal = parseFloat(currentRalInput.value); const increase = parseFloat(requestedIncreaseInput.value); const probability = parseFloat(successProbabilitySelect.value) / 100; const years = parseFloat(careerYearsInput.value); const compoundGrowth = 1.03; let totalLifetimeValue = 0; for (let year = 1; year <= years; year++) { const yearlyValue = increase * Math.pow(compoundGrowth, year - 1); totalLifetimeValue += yearlyValue; } const expectedValue = totalLifetimeValue * probability; const preparationCost = 20 * 50; const netROI = expectedValue - preparationCost; const roiMultiplier = (netROI / preparationCost).toFixed(1); const monthlyIncrease = (increase / 14).toFixed(0); const retirementBoost = (totalLifetimeValue / 1000000).toFixed(2); result.innerHTML = `<div class="grid md:grid-cols-2 gap-4 mb-4"><div class="bg-white p-4 rounded-lg"><p class="text-xs text-[var(--color-dark-brown-light)] mb-1">Aumento Netto Mensile (Stima)</p><p class="text-2xl font-bold text-[var(--color-sunset-orange)]">+€${monthlyIncrease}</p><p class="text-xs">Su 14 mensilità</p></div><div class="bg-white p-4 rounded-lg"><p class="text-xs text-[var(--color-dark-brown-light)] mb-1">Lifetime Value</p><p class="text-2xl font-bold text-[var(--color-ocean-teal)]">€${Math.round(totalLifetimeValue).toLocaleString()}</p><p class="text-xs">Valore totale a fine carriera</p></div></div><div class="p-4 bg-white rounded-lg text-center"><p class="font-bold text-[var(--color-dark-brown)] mb-2">💡 Verdict:</p><p class="text-sm">Investire 20 ore nella preparazione ti porta un expected return di <strong class="text-[var(--color-sunset-orange)]">€${Math.round(expectedValue).toLocaleString()}</strong>. Equivale a <strong>${Math.round(expectedValue / preparationCost)}x</strong> il ritorno sul tuo investimento di tempo.</p><p class="text-xs text-[var(--color-dark-brown-light)] mt-2"><strong>Bottom line:</strong> ${parseFloat(roiMultiplier) > 10 ? 'MUST DO! ROI eccezionale.' : parseFloat(roiMultiplier) > 5 ? 'Altamente raccomandato.' : parseFloat(roiMultiplier) > 2 ? 'Buon investimento.' : 'Considera altri fattori.'}</p></div>`; } }}>
              Calcola il Lifetime ROI della Negoziazione
            </button>
            <div id="roiResult" className="mt-4 bg-[var(--color-cream-bg)] rounded p-4 min-h-[120px] flex items-center justify-center text-[var(--color-dark-brown-light)]">I calcoli del ROI lifetime appariranno qui</div>
          </div>
        </div>

        {/* Framework IMPACT */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-8 text-center">Il Framework IMPACT: Metodologia Scientifica della Negoziazione</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {[
              { letter: 'I', phase: 'Intelligence', description: 'Ricerca & Analisi', color: 'bg-[var(--color-sunset-orange)]', details: 'Market Data, KPI, Company Health. <strong>Principio: Riprova Sociale</strong>' },
              { letter: 'M', phase: 'Metrics', description: 'Quantificazione Valore', color: 'bg-[var(--color-golden-yellow)]', details: 'ROI Dimostrato, Savings Generati. <strong>Principio: Autorità</strong>' },
              { letter: 'P', phase: 'Positioning', description: 'Preparazione Strategica', color: 'bg-[var(--color-ocean-teal)]', details: 'Value Proposition, Timing Ottimale. <strong>Principio: Scarsità</strong>' },
              { letter: 'A', phase: 'Approach', description: 'Esecuzione Conversazione', color: 'bg-[var(--color-golden-yellow-dark)]', details: 'Opening Win-Win, Dati, Ascolto. <strong>Principio: Simpatia & Reciprocità</strong>' },
              { letter: 'C', phase: 'Closing', description: 'Finalizzazione Accordo', color: 'bg-[var(--color-sunset-orange-dark)]', details: 'Termini Chiari, Next Steps Scritti. <strong>Principio: Impegno e Coerenza</strong>' },
              { letter: 'T', phase: 'Tracking', description: 'Follow-up & Delivery', color: 'bg-[var(--color-dark-brown)]', details: 'Progress Updates, Commitment Delivery. <strong>Principio: Coerenza</strong>' }
            ].map((step, index) => (
              <div key={index} className="text-center p-4 rounded-lg hover:shadow-xl transition-shadow">
                <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 mx-auto`}>{step.letter}</div>
                <h4 className="font-bold text-[var(--color-dark-brown)] text-lg mb-2">{step.phase}</h4>
                <p className="text-sm text-[var(--color-dark-brown-light)] mb-3">{step.description}</p>
                <p className="text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: step.details }}></p>
              </div>
            ))}
          </div>
          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6">
            <h4 className="font-bold text-[var(--color-dark-brown)] mb-3 text-center">💡 Perché il Framework IMPACT Funziona</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center"><div className="text-2xl font-bold text-[var(--color-sunset-orange)] mb-1">87%</div><div className="text-[var(--color-dark-brown-light)]">Successo con<br/>preparazione strutturata</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-[var(--color-golden-yellow-dark)] mb-1">+€8.400</div><div className="text-[var(--color-dark-brown-light)]">Aumento medio annuo<br/>con metodo IMPACT</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-[var(--color-ocean-teal)] mb-1">-50%</div><div className="text-[var(--color-dark-brown-light)]">Stress percepito<br/>durante la negoziazione</div></div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Fonte: Analisi interna su un campione di 200+ negoziazioni facilitate (2020-2025).</p>
          </div>
        </div>

        {/* NEW SECTION: Objections */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 text-center flex items-center justify-center gap-3">
                <Shield size={28} className="text-[var(--color-ocean-teal)]" />
                Anticipa e Gestisci le Obiezioni
            </h3>
            <p className="text-center text-[var(--color-dark-brown-light)] mb-8 max-w-3xl mx-auto">
                Una preparazione strategica include la capacità di rispondere con calma e dati alle obiezioni più comuni. Trasforma un "no" in un "come".
            </p>
            <div className="space-y-6">
                {/* Objection 1 */}
                <div className="bg-[var(--color-cream-bg-dark)] p-6 rounded-lg border-l-4 border-[var(--color-sunset-orange)]">
                    <p className="font-semibold text-lg text-[var(--color-dark-brown)] mb-2 flex items-center gap-2">
                        <MessageCircleQuestion size={20} />
                        Obiezione: "Non abbiamo budget quest'anno."
                    </p>
                    <p className="text-[var(--color-dark-brown-light)] pl-8">
                        <strong>Risposta Strategica:</strong> "Comprendo pienamente i vincoli di budget. I dati che ho presentato mostrano però che il mio contributo genera un valore di €X all'anno (calcolato sopra). L'aumento che chiedo rappresenta solo una piccola frazione di quel valore, garantendo all'azienda un ROI eccezionale. Possiamo considerarlo un investimento ad alto rendimento, che si ripaga da solo, piuttosto che un costo?"
                    </p>
                </div>
                {/* Objection 2 */}
                <div className="bg-[var(--color-cream-bg-dark)] p-6 rounded-lg border-l-4 border-[var(--color-golden-yellow)]">
                    <p className="font-semibold text-lg text-[var(--color-dark-brown)] mb-2 flex items-center gap-2">
                        <Clock size={20} />
                        Obiezione: "Ne possiamo parlare tra 6 mesi."
                    </p>
                    <p className="text-[var(--color-dark-brown-light)] pl-8">
                        <strong>Risposta Strategica:</strong> "Certamente. Per rendere questi 6 mesi produttivi per entrambi, possiamo definire ora 2-3 obiettivi misurabili che, se raggiunti, sbloccheranno automaticamente l'adeguamento che abbiamo discusso? In questo modo creiamo un percorso chiaro, trasparente e basato sui risultati."
                    </p>
                </div>
            </div>
        </div>

        {/* Practical Calculator Connection */}
        <div className="bg-gradient-to-r from-[var(--color-golden-yellow)] to-[var(--color-golden-yellow-dark)] text-[var(--color-dark-brown)] rounded-2xl p-8 mb-12">
          <div className="text-center">
            <Calculator size={48} className="mx-auto mb-6 text-[var(--color-sunset-orange)]" />
            <h3 className="text-2xl font-bold mb-4">Metti in Pratica: Calcola il Tuo Target Salary</h3>
            <p className="text-xl mb-6">
              Usa la tua nuova conoscenza fiscale per calcolare esattamente quanto chiedere, considerando il netto che vuoi ottenere
            </p>
            <a href="/it/pmi-e-impresa/calcolo-stipendio-netto" className="inline-flex items-center gap-3 bg-[var(--color-sunset-orange)] hover:bg-[var(--color-sunset-orange-dark)] text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors">
              <Calculator size={24} />Calcola la Tua RAL Target<ExternalLink size={20} />
            </a>
            <p className="text-sm mt-4 opacity-75">
              Strumento avanzato: da netto desiderato a RAL da chiedere • Include riforme fiscali 2025
            </p>
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[var(--color-golden-yellow)]">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-golden-yellow)] to-[var(--color-golden-yellow-dark)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              UC
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-[var(--color-dark-brown)] mb-2">
                    <a href="#/autore/ugo-candido" className="hover:underline">Ugo Candido</a>
                </h4>
              <p className="text-[var(--color-dark-brown-light)] mb-4 leading-relaxed">
                <strong>MBA - MIB Trieste School of Management (2009-2010)</strong><br/>
                Esperto responsabile operativo con esperienza internazionale in project management e Total Compensation optimization. Specializzato in salary negotiation e performance management, ha guidato oltre 200 negoziazioni salariali di successo per team members e colleghi, con un tasso di successo del 78% e un incremento medio ottenuto del 16%.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[var(--color-ocean-teal)] text-white px-3 py-1 rounded-full text-xs">MBA</span>
                <span className="bg-[var(--color-sunset-orange)] text-white px-3 py-1 rounded-full text-xs">Salary Negotiation</span>
                <span className="bg-[var(--color-golden-yellow)] text-white px-3 py-1 rounded-full text-xs">Performance Management</span>
                <span className="bg-[var(--color-dark-brown-light)] text-white px-3 py-1 rounded-full text-xs">Total Rewards Strategy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default NegoziazioneGuide;