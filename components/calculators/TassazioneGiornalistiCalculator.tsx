'use client';

import React, { useState, FormEvent } from 'react';

// Interfaccia per strutturare i risultati del calcolo
interface ICalculationResults {
  ricaviLordi: number;
  redditoImponibileLordo: number;
  contributiObbligatori: number;
  redditoImponibileNetto: number;
  impostaSostitutiva: number;
  contributoSoggettivoDovuto: number;
  contributoMaternita: number;
  contributoIntegrativoDovuto: number;
  totaleDaVersareInpgi: number;
  guadagnoNettoAnnuo: number;
  percentualeNetto: number;
  percentualeContributi: number;
  percentualeTasse: number;
}

const TassazioneGiornalistiCalculator = () => {
  // State per gli input dell'utente
  const [ricavi, setRicavi] = useState<string>('');
  const [anzianitaPiva, setAnzianitaPiva] = useState<'startup' | 'regime'>('startup');
  const [anzianitaOrdine, setAnzianitaOrdine] = useState<'meno5' | 'piu5'>('meno5');

  // State per i risultati del calcolo e per la gestione degli errori
  const [results, setResults] = useState<ICalculationResults | null>(null);
  const [error, setError] = useState<string>('');

  // Funzione per formattare i numeri come valuta EUR
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  // Logica di calcolo principale
  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    const ricaviNum = parseFloat(ricavi);

    if (isNaN(ricaviNum) || ricaviNum < 0) {
      setError('Per favore, inserisci un valore valido per i ricavi.');
      setResults(null);
      return;
    }
    setError('');

    // --- Costanti Fiscali e Contributive per Giornalisti 2025 ---
    const COEFFICIENTE_REDDITIVITA = 0.67; // ATECO 90.03.01
    const SOGLIA_SOGGETTIVO_INPGI = 24000;
    const ALIQUOTA_SOGGETTIVO_BASE = 0.12;
    const ALIQUOTA_SOGGETTIVO_ECCEDENZA = 0.14;
    const ALIQUOTA_INTEGRATIVO = 0.04;
    const CONTRIBUTO_MATERNITA = 18.43;

    // Minimali INPGI 2025
    const MINIMALE_SOGGETTIVO_GIOVANI = 149.33;
    const MINIMALE_SOGGETTIVO_REGIME = 298.66;
    const MINIMALE_INTEGRATIVO_GIOVANI = 49.78;
    const MINIMALE_INTEGRATIVO_REGIME = 99.55;

    // --- Inizio Calcolo ---
    // 1. Reddito Imponibile Lordo (base per i contributi)
    const redditoImponibileLordo = ricaviNum * COEFFICIENTE_REDDITIVITA;

    // 2. Contributo Soggettivo INPGI con scaglioni
    let contributoSoggettivoCalcolato: number;
    if (redditoImponibileLordo <= SOGLIA_SOGGETTIVO_INPGI) {
      contributoSoggettivoCalcolato = redditoImponibileLordo * ALIQUOTA_SOGGETTIVO_BASE;
    } else {
      contributoSoggettivoCalcolato =
        SOGLIA_SOGGETTIVO_INPGI * ALIQUOTA_SOGGETTIVO_BASE +
        (redditoImponibileLordo - SOGLIA_SOGGETTIVO_INPGI) * ALIQUOTA_SOGGETTIVO_ECCEDENZA;
    }

    const minimaleSoggettivoApplicabile =
      anzianitaOrdine === 'meno5' ? MINIMALE_SOGGETTIVO_GIOVANI : MINIMALE_SOGGETTIVO_REGIME;
    const contributoSoggettivoDovuto = Math.max(contributoSoggettivoCalcolato, minimaleSoggettivoApplicabile);

    // 3. Contributi Obbligatori Deducibili
    const contributiObbligatori = contributoSoggettivoDovuto + CONTRIBUTO_MATERNITA;

    // 4. Reddito Imponibile Netto (base per le tasse)
    const redditoImponibileNetto = redditoImponibileLordo - contributiObbligatori;

    // 5. Imposta Sostitutiva
    const aliquotaFiscale = anzianitaPiva === 'startup' ? 0.05 : 0.15;
    const impostaSostitutiva = redditoImponibileNetto > 0 ? redditoImponibileNetto * aliquotaFiscale : 0;

    // 6. Contributo Integrativo INPGI
    const contributoIntegrativoCalcolato = ricaviNum * ALIQUOTA_INTEGRATIVO;
    const minimaleIntegrativoApplicabile =
      anzianitaOrdine === 'meno5' ? MINIMALE_INTEGRATIVO_GIOVANI : MINIMALE_INTEGRATIVO_REGIME;
    const contributoIntegrativoDovuto = Math.max(contributoIntegrativoCalcolato, minimaleIntegrativoApplicabile);

    // 7. Riepilogo
    const totaleDaVersareInpgi = contributiObbligatori + contributoIntegrativoDovuto;
    const guadagnoNettoAnnuo = ricaviNum - impostaSostitutiva - contributiObbligatori;

    // Percentuali per il grafico (clamp 0–100 per sicurezza UI)
    const clamp = (n: number) => Math.max(0, Math.min(100, n));
    const percentualeNetto = ricaviNum > 0 ? clamp((guadagnoNettoAnnuo / ricaviNum) * 100) : 0;
    const percentualeContributi = ricaviNum > 0 ? clamp((contributiObbligatori / ricaviNum) * 100) : 0;
    const percentualeTasse = ricaviNum > 0 ? clamp((impostaSostitutiva / ricaviNum) * 100) : 0;

    setResults({
      ricaviLordi: ricaviNum,
      redditoImponibileLordo,
      contributiObbligatori,
      redditoImponibileNetto,
      impostaSostitutiva,
      contributoSoggettivoDovuto,
      contributoMaternita: CONTRIBUTO_MATERNITA,
      contributoIntegrativoDovuto,
      totaleDaVersareInpgi,
      guadagnoNettoAnnuo,
      percentualeNetto,
      percentualeContributi,
      percentualeTasse,
    });
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Calcolatore Tasse 2025 per Giornalisti in Regime Forfettario: Lo Strumento Definitivo</h1>
        <p>
          Benvenuto nello strumento di calcolo fiscale definitivo, progettato esclusivamente per i giornalisti autonomi in Italia.
          La nostra missione è semplice: offrirti uno strumento <strong>neutrale, iper-accurato, trasparente e gratuito</strong>, il cui unico scopo è fornirti il calcolo più affidabile possibile per la tua pianificazione finanziaria.
        </p>
        <p>
          A differenza dei calcolatori generici, il nostro motore di calcolo è specializzato sul <strong>Codice ATECO 90.03.01</strong> ("Attività dei giornalisti indipendenti")
          e implementa in modo rigoroso le regole contributive della cassa previdenziale di categoria (INPGI), inclusi minimali, aliquote specifiche e massimali per il 2025.
        </p>
      </header>

      <section style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
        <h2>Sezione 1: Il Tuo Calcolatore Fiscale Intelligente</h2>
        <p>Per ottenere una stima precisa e affidabile della tua posizione fiscale e contributiva per il 2025, inserisci pochi e semplici dati.</p>
        <form onSubmit={handleCalculate}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="ricavi" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Ricavi Lordi Incassati nel 2025 (€):
            </label>
            <input
              type="number"
              id="ricavi"
              value={ricavi}
              onChange={(e) => setRicavi(e.target.value)}
              placeholder="Es. 35000"
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
            <small>
              <em>Inserisci il totale dei compensi che prevedi di incassare nell&apos;anno.</em>
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Anzianità della Partita IVA:</label>
            <select
              value={anzianitaPiva}
              onChange={(e) => setAnzianitaPiva(e.target.value as 'startup' | 'regime')}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="startup">Start-up (primi 5 anni - Aliquota 5%)</option>
              <option value="regime">A regime (più di 5 anni - Aliquota 15%)</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Anzianità di Iscrizione all&apos;Ordine dei Giornalisti:
            </label>
            <select
              value={anzianitaOrdine}
              onChange={(e) => setAnzianitaOrdine(e.target.value as 'meno5' | 'piu5')}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="meno5">Meno di 5 anni (Minimali ridotti)</option>
              <option value="piu5">5 anni o più (Minimali standard)</option>
            </select>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Calcola Ora
          </button>
        </form>
      </section>

      {results && (
        <section>
          <h2>Sezione 2: Report Fiscale Dettagliato</h2>

          <h3>1. Calcolo del Reddito Imponibile</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>Ricavi Lordi Incassati</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(results.ricaviLordi)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>Coefficiente di Redditività (67%)</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>x 0.67</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd', background: '#f2f2f2' }}>
                <td style={{ padding: '8px' }}>
                  <strong>Reddito Imponibile Lordo</strong>
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <strong>{formatCurrency(results.redditoImponibileLordo)}</strong>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>(-) Contributi INPGI 2025 Deducibili</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(results.contributiObbligatori)}</td>
              </tr>
              <tr style={{ background: '#e9e9e9' }}>
                <td style={{ padding: '8px' }}>
                  <strong>Reddito Imponibile Netto (Fiscale)</strong>
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <strong>{formatCurrency(results.redditoImponibileNetto)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <h3>2. Calcolo dell'Imposta Sostitutiva (Tasse)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>Aliquota Fiscale Applicata</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{anzianitaPiva === 'startup' ? '5%' : '15%'}</td>
              </tr>
              <tr style={{ background: '#e9e9e9' }}>
                <td style={{ padding: '8px' }}>
                  <strong>Imposta Sostitutiva Dovuta</strong>
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <strong>{formatCurrency(results.impostaSostitutiva)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <h3>3. Calcolo Dettagliato Contributi INPGI 2025</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>Contributo Soggettivo (12%/14%)</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(results.contributoSoggettivoDovuto)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>Contributo di Maternità (fisso)</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(results.contributoMaternita)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd', background: '#f2f2f2' }}>
                <td style={{ padding: '8px' }}>
                  <strong>Totale Contributi Obbligatori Deducibili</strong>
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <strong>{formatCurrency(results.contributiObbligatori)}</strong>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>Contributo Integrativo (4% sui ricavi)</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(results.contributoIntegrativoDovuto)}</td>
              </tr>
              <tr style={{ background: '#e9e9e9' }}>
                <td style={{ padding: '8px' }}>
                  <strong>Totale da Versare all'INPGI</strong>
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <strong>{formatCurrency(results.totaleDaVersareInpgi)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <h3>4. Riepilogo Finanziario: Il Tuo Netto in Tasca</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>Ricavi Lordi Incassati</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(results.ricaviLordi)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>(-) Imposta Sostitutiva</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(results.impostaSostitutiva)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>(-) Contributi a tuo carico</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(results.contributiObbligatori)}</td>
              </tr>
              <tr style={{ background: '#d4edda' }}>
                <td style={{ padding: '8px' }}>
                  <strong>Guadagno Netto Annuo</strong>
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <strong>{formatCurrency(results.guadagnoNettoAnnuo)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <h3>5. Visualizzazione Grafica del Tuo Fatturato</h3>
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <p>Ecco come vengono ripartiti i tuoi ricavi lordi:</p>
            <div style={{ background: '#28a745', color: 'white', padding: '5px', marginBottom: '5px', width: `${results.percentualeNetto}%` }}>
              Netto: {results.percentualeNetto.toFixed(1)}%
            </div>
            <div style={{ background: '#ffc107', color: 'black', padding: '5px', marginBottom: '5px', width: `${results.percentualeContributi}%` }}>
              Contributi: {results.percentualeContributi.toFixed(1)}%
            </div>
            <div style={{ background: '#dc3545', color: 'white', padding: '5px', width: `${results.percentualeTasse}%` }}>
              Tasse: {results.percentualeTasse.toFixed(1)}%
            </div>
          </div>
        </section>
      )}

      <section style={{ marginTop: '40px' }}>
        <h2>Sezione 3: Pianifica il Futuro con Strumenti Avanzati</h2>
        <ul>
          <li><strong>Simulatore Multi-Scenario:</strong> Presto potrai confrontare diversi scenari di ricavi per pianificare la tua crescita con consapevolezza.</li>
          <li><strong>Monitoraggio Soglie Forfettario:</strong> Una dashboard visiva ti mostrerà in tempo reale quanto sei vicino alle soglie critiche del Regime Forfettario (€85.000 e €100.000).</li>
          <li><strong>Report PDF:</strong> A breve potrai salvare o stampare un riepilogo dettagliato della tua simulazione.</li>
        </ul>
      </section>

      <footer style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '20px', textAlign: 'center' }}>
        <h4>La Nostra Missione: Trasparenza e Conoscenza</h4>
        <p>
          Ogni calcolo è basato sulle normative vigenti. Non siamo una &quot;scatola nera&quot;: il nostro obiettivo è darti massima chiarezza. Questo strumento è il nostro contributo alla comunità dei giornalisti freelance. È gratuito e lo sarà sempre.
        </p>
      </footer>
    </div>
  );
};

export default TassazioneGiornalistiCalculator;
