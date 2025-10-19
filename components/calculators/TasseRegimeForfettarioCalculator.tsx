import React, { useState, useMemo } from 'react';

// --- TIPI E DATI DI CONFIGURAZIONE ---

// Tipizzazione per i risultati del calcolo
type CalculationResults = {
  ricaviLlordi: number;
  coefficienteRedditivita: number;
  redditoImponibileLordo: number;
  contributiPagatiAnnoPrecedente: number;
  redditoImponibileNetto: number;
  aliquotaImposta: number;
  impostaSostitutiva: number;
  contributiDovuti: number;
  redditoNettoAnnuale: number;
  incidenzaFiscalePercentuale: number;
};

type PaymentTimeline = {
  giugno30: {
    saldoImposta: number;
    primoAccontoImposta: number;
    saldoContributi: number;
    primoAccontoContributi: number;
    totale: number;
  };
  novembre30: {
    secondoAccontoImposta: number;
    secondoAccontoContributi: number;
    totale: number;
  };
};

// Dati dei codici ATECO (subset rappresentativo)
const atecoData =;

// Dati delle casse previdenziali
const pensionSchemes = {
  gestioneSeparata: { name: 'Gestione Separata INPS', rate: 0.2607 },
  artigiani: { name: 'Artigiani INPS', minimal: 4427.04, excessRate: 0.24 },
  commercianti: { name: 'Commercianti INPS', minimal: 4515.43, excessRate: 0.2448 },
  // Aggiungere altre casse professionali qui
  inarcassa: { name: 'INARCASSA (Ingegneri/Architetti)', rate: 0.145 }, // Esempio semplificato
};

// --- COMPONENTE PRINCIPALE ---

const SocalSolverCalculator: React.FC = () => {
  // --- STATO DEL COMPONENTE ---

  // Modalità: 'quick' per il calcolatore rapido, 'advanced' per il simulatore completo
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  
  // Input Utente
  const = useState<number | ''>('');
  const [atecoCode, setAtecoCode] = useState<string>(atecoData.code);
  const = useState<'under5' | 'over5'>('under5');
  const = useState<keyof typeof pensionSchemes>('gestioneSeparata');
  const [prevContributionsPaid, setPrevContributionsPaid] = useState<number | ''>('');
  const = useState<boolean>(false);
  
  // Input per la simulazione acconti
  const [calculationMethod, setCalculationMethod] = useState<'storico' | 'previsionale'>('storico');
  const = useState<number | ''>('');

  // Output
  const = useState<CalculationResults | null>(null);
  const = useState<PaymentTimeline | null>(null);
  const [viewMonthly, setViewMonthly] = useState<boolean>(false);

  // --- LOGICA DI CALCOLO ---

  const selectedAteco = useMemo(() => atecoData.find(a => a.code === atecoCode)!, [atecoCode]);

  const calculateTaxes = (
    currentRevenue: number,
    currentAteco: typeof selectedAteco,
    currentPensionScheme: keyof typeof pensionSchemes,
    currentInpsReduction: boolean,
    currentPrevContributionsPaid: number,
    currentYearsInActivity: 'under5' | 'over5'
  ): { baseResults: CalculationResults; baseContributi: number; baseImposta: number } => {
    
    const redditoImponibileLordo = currentRevenue * currentAteco.coefficient;
    
    let contributiDovuti = 0;
    const scheme = pensionSchemes;
    
    if (currentPensionScheme === 'gestioneSeparata' |

| currentPensionScheme === 'inarcassa') {
      contributiDovuti = redditoImponibileLordo * scheme.rate;
    } else if (currentPensionScheme === 'artigiani' |

| currentPensionScheme === 'commercianti') {
      const redditoMinimale = 18415; // Soglia di reddito minimale per il 2024
      let minimalContribution = scheme.minimal;
      if (currentInpsReduction) {
        minimalContribution *= 0.65; // Riduzione del 35%
      }
      
      if (redditoImponibileLordo <= redditoMinimale) {
        contributiDovuti = minimalContribution;
      } else {
        const eccedenza = redditoImponibileLordo - redditoMinimale;
        let contributiEccedenza = eccedenza * scheme.excessRate;
        if (currentInpsReduction) {
          contributiEccedenza *= 0.65;
        }
        contributiDovuti = minimalContribution + contributiEccedenza;
      }
    }

    // L'unico costo deducibile nel forfettario sono i contributi versati nell'anno precedente [1]
    const redditoImponibileNetto = Math.max(0, redditoImponibileLordo - currentPrevContributionsPaid);
    
    const aliquotaImposta = currentYearsInActivity === 'under5'? 0.05 : 0.15;
    const impostaSostitutiva = redditoImponibileNetto * aliquotaImposta;
    
    const redditoNettoAnnuale = currentRevenue - impostaSostitutiva - contributiDovuti;
    const incidenzaFiscalePercentuale = currentRevenue > 0? ((impostaSostitutiva + contributiDovuti) / currentRevenue) * 100 : 0;

    const baseResults: CalculationResults = {
      ricaviLlordi: currentRevenue,
      coefficienteRedditivita: currentAteco.coefficient,
      redditoImponibileLordo,
      contributiPagatiAnnoPrecedente: currentPrevContributionsPaid,
      redditoImponibileNetto,
      aliquotaImposta,
      impostaSostitutiva,
      contributiDovuti,
      redditoNettoAnnuale,
      incidenzaFiscalePercentuale,
    };

    return { baseResults, baseContributi: contributiDovuti, baseImposta: impostaSostitutiva };
  };

  const handleCalculate = () => {
    if (revenue === '') return;

    // Calcolo per l'anno di riferimento (saldo)
    const { baseResults, baseContributi, baseImposta } = calculateTaxes(
      revenue,
      selectedAteco,
      pensionScheme,
      inpsReduction,
      prevContributionsPaid |

| 0,
      yearsInActivity
    );
    setResults(baseResults);

    // Calcolo per la simulazione acconti
    let accontiRevenue = revenue;
    if (mode === 'advanced' && calculationMethod === 'previsionale' && forecastRevenue!== '') {
      accontiRevenue = forecastRevenue;
    }

    const { baseContributi: accontiContributi, baseImposta: accontiImposta } = calculateTaxes(
      accontiRevenue,
      selectedAteco,
      pensionScheme,
      inpsReduction,
      // Per il previsionale, i contributi dell'anno precedente sono quelli appena calcolati
      calculationMethod === 'previsionale'? baseContributi : (prevContributionsPaid |

| 0),
      yearsInActivity
    );

    // Gli acconti sono il 100% dell'imposta/contributi dell'anno di riferimento [2]
    const totaleAccontoImposta = accontiImposta;
    const totaleAccontoContributi = accontiContributi;

    // Suddivisione acconti: 50% a giugno, 50% a novembre (logica aggiornata)
    const primoAccontoImposta = totaleAccontoImposta * 0.5;
    const secondoAccontoImposta = totaleAccontoImposta * 0.5;
    const primoAccontoContributi = totaleAccontoContributi * 0.5;
    const secondoAccontoContributi = totaleAccontoContributi * 0.5;

    const newTimeline: PaymentTimeline = {
      giugno30: {
        saldoImposta: baseImposta,
        primoAccontoImposta: primoAccontoImposta,
        saldoContributi: baseContributi,
        primoAccontoContributi: primoAccontoContributi,
        totale: baseImposta + primoAccontoImposta + baseContributi + primoAccontoContributi,
      },
      novembre30: {
        secondoAccontoImposta: secondoAccontoImposta,
        secondoAccontoContributi: secondoAccontoContributi,
        totale: secondoAccontoImposta + secondoAccontoContributi,
      },
    };
    setTimeline(newTimeline);
  };
  
  // --- FUNZIONI HELPER PER LA UI ---
  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  // --- RENDER DEL COMPONENTE ---
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Calcolatore Tasse Regime Forfettario</h1>
        <p style={{ fontSize: '1.1em', color: '#555' }}>
          Simula la tua tassazione, inclusi acconti e saldo, per una pianificazione fiscale senza sorprese. [3]
        </p>
      </header>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        {/* --- SEZIONE INPUT --- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Colonna Sinistra */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
              Ricavi Annuali Lordi (€)
              <span title="Inserisci i ricavi effettivamente incassati nell'anno (principio di cassa)." style={{ cursor: 'help', marginLeft: '5px', color: 'blue' }}>
                (?)
              </span>
            </label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value === ''? '' : parseFloat(e.target.value))}
              placeholder="Es. 45000"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', marginTop: '15px' }}>
              Tipo di Attività (Codice ATECO)
              <span title="Seleziona il settore che meglio descrive la tua attività per determinare il coefficiente di redditività." style={{ cursor: 'help', marginLeft: '5px', color: 'blue' }}>
                (?)
              </span>
            </label>
            <select
              value={atecoCode}
              onChange={(e) => setAtecoCode(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              {atecoData.map(ateco => (
                <option key={ateco.code} value={ateco.code}>{ateco.description}</option>
              ))}
            </select>
          </div>

          {/* Colonna Destra */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
              Anni di Attività
              <span title="Seleziona se sei nei primi 5 anni di una nuova attività per l'aliquota agevolata al 5%." style={{ cursor: 'help', marginLeft: '5px', color: 'blue' }}>
                (?)
              </span>
            </label>
            <select
              value={yearsInActivity}
              onChange={(e) => setYearsInActivity(e.target.value as 'under5' | 'over5')}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="under5">Nuova attività (primi 5 anni - Aliquota 5%)</option>
              <option value="over5">Oltre 5 anni (Aliquota 15%)</option>
            </select>

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', marginTop: '15px' }}>
              Cassa Previdenziale
            </label>
            <select
              value={pensionScheme}
              onChange={(e) => setPensionScheme(e.target.value as keyof typeof pensionSchemes)}
              style={{ width: '100%', padding: '8px' }}
            >
              {Object.entries(pensionSchemes).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- SWITCH A SIMULATORE AVANZATO --- */}
        {mode === 'quick' && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={() => setMode('advanced')} style={{ padding: '10px 20px', border: 'none', background: '#007bff', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
              Pianifica il Tuo Anno Fiscale Completo →
            </button>
          </div>
        )}

        {/* --- SEZIONE AVANZATA --- */}
        {mode === 'advanced' && (
          <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#0056b3' }}>Simulatore Finanziario Avanzato</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Contributi Versati Anno Precedente (€)
                  <span title="L'unico costo deducibile dal reddito imponibile lordo." style={{ cursor: 'help', marginLeft: '5px', color: 'blue' }}>
                    (?)
                  </span>
                </label>
                <input
                  type="number"
                  value={prevContributionsPaid}
                  onChange={(e) => setPrevContributionsPaid(e.target.value === ''? '' : parseFloat(e.target.value))}
                  placeholder="Es. 4000"
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
                {(pensionScheme === 'artigiani' |

| pensionScheme === 'commercianti') && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      type="checkbox"
                      id="inpsReduction"
                      checked={inpsReduction}
                      onChange={(e) => setInpsReduction(e.target.checked)}
                    />
                    <label htmlFor="inpsReduction" style={{ marginLeft: '5px' }}>
                      Applica riduzione INPS 35% [2]
                    </label>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Metodo Calcolo Acconti
                  <span title="Storico: basato sui dati dell'anno corrente. Previsionale: basato su una stima dei ricavi per l'anno successivo." style={{ cursor: 'help', marginLeft: '5px', color: 'blue' }}>
                    (?)
                  </span>
                </label>
                <select
                  value={calculationMethod}
                  onChange={(e) => setCalculationMethod(e.target.value as 'storico' | 'previsionale')}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="storico">Metodo Storico</option>
                  <option value="previsionale">Metodo Previsionale</option>
                </select>
                {calculationMethod === 'previsionale' && (
                  <input
                    type="number"
                    value={forecastRevenue}
                    onChange={(e) => setForecastRevenue(e.target.value === ''? '' : parseFloat(e.target.value))}
                    placeholder="Ricavi previsti per il prossimo anno"
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '10px' }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button onClick={handleCalculate} style={{ padding: '12px 25px', fontSize: '1.2em', border: 'none', background: '#28a745', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
            Calcola
          </button>
        </div>
      </div>

      {/* --- SEZIONE RISULTATI --- */}
      {results && (
        <div style={{ marginTop: '30px', background: '#e9f7ef', padding: '20px', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
          <h2 style={{ textAlign: 'center', color: '#155724' }}>Risultati della Simulazione</h2>
          
          {/* Risultato Principale */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <span style={{ fontSize: '1.2em', color: '#333' }}>
              {viewMonthly? 'Reddito Netto Mensile Stimato' : 'Reddito Netto Annuale Stimato'}
            </span>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#155724', margin: '10px 0' }}>
              {formatCurrency(viewMonthly? results.redditoNettoAnnuale / 12 : results.redditoNettoAnnuale)}
            </div>
            <button onClick={() => setViewMonthly(!viewMonthly)} style={{ padding: '5px 10px', border: '1px solid #ccc', background: 'white', borderRadius: '5px', cursor: 'pointer' }}>
              {viewMonthly? 'Vedi Annuale' : 'Vedi Mensile'}
            </button>
          </div>

          {/* Dettaglio Calcolo */}
          <div style={{ borderTop: '1px solid #c3e6cb', paddingTop: '15px' }}>
            <h3 style={{ color: '#155724' }}>Dettaglio del Calcolo</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}><span>Ricavi Lordi</span> <strong>{formatCurrency(results.ricaviLlordi)}</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}><span>Coefficiente di Redditività</span> <strong>{(results.coefficienteRedditivita * 100).toFixed(0)}%</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}><span>Reddito Imponibile Lordo</span> <strong>{formatCurrency(results.redditoImponibileLordo)}</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}><span>(-) Contributi Versati Anno Precedente</span> <strong>{formatCurrency(results.contributiPagatiAnnoPrecedente)}</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}><span>Reddito Imponibile Netto (per imposta)</span> <strong>{formatCurrency(results.redditoImponibileNetto)}</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}><span>Imposta Sostitutiva (Aliquota {(results.aliquotaImposta * 100)}%)</span> <strong>{formatCurrency(results.impostaSostitutiva)}</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}><span>Contributi Previdenziali Dovuti</span> <strong>{formatCurrency(results.contributiDovuti)}</strong></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', background: '#c3e6cb', borderRadius: '4px', marginTop: '5px' }}><span>Incidenza Fiscale Totale</span> <strong>{results.incidenzaFiscalePercentuale.toFixed(2)}%</strong></li>
            </ul>
          </div>

          {/* Timeline Pagamenti */}
          {timeline && mode === 'advanced' && (
            <div style={{ borderTop: '1px solid #c3e6cb', paddingTop: '15px', marginTop: '20px' }}>
              <h3 style={{ color: '#155724' }}>Timeline Scadenze Fiscali</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'white', padding: '15px', borderRadius: '5px' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Scadenza: 30 Giugno</h4>
                  <p>Saldo Imposta: {formatCurrency(timeline.giugno30.saldoImposta)}</p>
                  <p>Saldo Contributi: {formatCurrency(timeline.giugno30.saldoContributi)}</p>
                  <p>1° Acconto Imposta: {formatCurrency(timeline.giugno30.primoAccontoImposta)}</p>
                  <p>1° Acconto Contributi: {formatCurrency(timeline.giugno30.primoAccontoContributi)}</p>
                  <hr/>
                  <p><strong>Totale: {formatCurrency(timeline.giugno30.totale)}</strong></p>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '5px' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Scadenza: 30 Novembre</h4>
                  <p>2° Acconto Imposta: {formatCurrency(timeline.novembre30.secondoAccontoImposta)}</p>
                  <p>2° Acconto Contributi: {formatCurrency(timeline.novembre30.secondoAccontoContributi)}</p>
                  <hr/>
                  <p><strong>Totale: {formatCurrency(timeline.novembre30.totale)}</strong></p>
                </div>
              </div>
              {calculationMethod === 'previsionale' && <p style={{fontSize: '0.9em', color: '#555', marginTop: '10px'}}><i>Attenzione: una sottostima dei ricavi nel metodo previsionale può comportare sanzioni. [4]</i></p>}
            </div>
          )}

          {/* Soft Gate e CTA */}
          <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px solid #c3e6cb', paddingTop: '20px' }}>
            <button style={{ padding: '10px 20px', border: '1px solid #007bff', background: 'white', color: '#007bff', borderRadius: '5px', cursor: 'pointer' }}>
              Scarica Report Completo in PDF
            </button>
            <div style={{ marginTop: '20px', background: 'white', padding: '15px', borderRadius: '5px' }}>
              <p style={{ margin: 0 }}>
                In base alla tua simulazione, potresti risparmiare tempo ed evitare errori.
                <br/>
                <strong>Scopri il nostro servizio di contabilità a prezzo fisso per professionisti come te.</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocalSolverCalculator;
