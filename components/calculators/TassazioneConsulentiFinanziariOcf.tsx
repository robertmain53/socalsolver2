'use client';

import { useState, useMemo } from 'react';

// Componente per i tooltip informativi
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <span className="group relative">
    {children}
    <span className="absolute bottom-full mb-2 hidden w-64 rounded-lg bg-gray-800 p-2 text-center text-xs text-white group-hover:block">
      {text}
    </span>
  </span>
);

export default function TassazioneConsulentiFinanziariOcf() {
  // --- STATI INPUT ---
  const [fatturatoAnnuo, setFatturatoAnnuo] = useState<string>('');
  const [costiSostenuti, setCostiSostenuti] = useState<string>('');
  const [contributiVersati, setContributiVersati] = useState<string>('');
  const [isForfettarioStartUp, setIsForfettarioStartUp] = useState<boolean>(true);
  
  // --- STATO RISULTATI ---
  const [results, setResults] = useState<CalculationResults | null>(null);

  // --- COSTANTI E PARAMETRI FISCALI ---
  // Nota: questi valori dovrebbero essere aggiornati annualmente.
  const COEFFICIENTE_REDDITIVITA = 0.78; // Per Codice ATECO 66.19.21 e 66.19.22
  const ALIQUOTA_INPS_GESTIONE_SEPARATA = 0.2607;
  const IMPOSTA_SOSTITUTIVA_STARTUP = 0.05;
  const IMPOSTA_SOSTITUTIVA_STANDARD = 0.15;
  const DATA_AGGIORNAMENTO = "Ottobre 2025";

  interface RegimeResult {
    regime: string;
    redditoImponibileLordo: number;
    contributiInpsDovuti: number;
    imponibileFiscaleNetto: number;
    imposteDovute: number;
    totaleTasseEContributi: number;
    redditoNettoAnnuo: number;
    isConveniente: boolean;
  }

  interface CalculationResults {
    forfettario: RegimeResult;
    ordinario: RegimeResult;
  }
  
  // --- LOGICA DI CALCOLO IRPEF A SCAGLIONI ---
  const calcolaIrpef = (imponibile: number): number => {
    if (imponibile <= 0) return 0;
  
    const scaglioni = [
      { limite: 28000, aliquota: 0.23 },
      { limite: 50000, aliquota: 0.35 },
      { limite: Infinity, aliquota: 0.43 },
    ];
  
    let irpef = 0;
    let redditoResiduo = imponibile;
    let sogliaPrecedente = 0;
  
    for (const scaglione of scaglioni) {
      if (redditoResiduo > 0) {
        const importoNelloScaglione = Math.min(redditoResiduo, scaglione.limite - sogliaPrecedente);
        irpef += importoNelloScaglione * scaglione.aliquota;
        redditoResiduo -= importoNelloScaglione;
        sogliaPrecedente = scaglione.limite;
      }
    }
    return irpef;
  };

  // --- FUNZIONE PRINCIPALE DI CALCOLO ---
  const calculate = () => {
    const fatturato = parseFloat(fatturatoAnnuo) || 0;
    const costi = parseFloat(costiSostenuti) || 0;
    const contributiPagati = parseFloat(contributiVersati) || 0;

    if (fatturato === 0) {
      return;
    }

    // --- CALCOLO REGIME FORFETTARIO ---
    const redditoImponibileLordoForfettario = fatturato * COEFFICIENTE_REDDITIVITA;
    const contributiInpsDovutiForfettario = redditoImponibileLordoForfettario * ALIQUOTA_INPS_GESTIONE_SEPARATA;
    const imponibileFiscaleNettoForfettario = Math.max(0, redditoImponibileLordoForfettario - contributiPagati);
    const aliquotaSostitutiva = isForfettarioStartUp ? IMPOSTA_SOSTITUTIVA_STARTUP : IMPOSTA_SOSTITUTIVA_STANDARD;
    const imposteDovuteForfettario = imponibileFiscaleNettoForfettario * aliquotaSostitutiva;
    const totaleTasseEContributiForfettario = imposteDovuteForfettario + contributiInpsDovutiForfettario;
    const redditoNettoAnnuoForfettario = fatturato - totaleTasseEContributiForfettario;

    // --- CALCOLO REGIME ORDINARIO SEMPLIFICATO ---
    const redditoImponibileLordoOrdinario = Math.max(0, fatturato - costi);
    const contributiInpsDovutiOrdinario = redditoImponibileLordoOrdinario * ALIQUOTA_INPS_GESTIONE_SEPARATA;
    const imponibileFiscaleNettoOrdinario = Math.max(0, redditoImponibileLordoOrdinario - contributiPagati);
    const imposteDovuteOrdinario = calcolaIrpef(imponibileFiscaleNettoOrdinario);
    const totaleTasseEContributiOrdinario = imposteDovuteOrdinario + contributiInpsDovutiOrdinario;
    const redditoNettoAnnuoOrdinario = fatturato - costi - totaleTasseEContributiOrdinario;

    // --- IMPOSTA RISULTATI ---
    setResults({
      forfettario: {
        regime: 'Forfettario',
        redditoImponibileLordo: redditoImponibileLordoForfettario,
        contributiInpsDovuti: contributiInpsDovutiForfettario,
        imponibileFiscaleNetto: imponibileFiscaleNettoForfettario,
        imposteDovute: imposteDovuteForfettario,
        totaleTasseEContributi: totaleTasseEContributiForfettario,
        redditoNettoAnnuo: redditoNettoAnnuoForfettario,
        isConveniente: redditoNettoAnnuoForfettario >= redditoNettoAnnuoOrdinario,
      },
      ordinario: {
        regime: 'Ordinario Semplificato',
        redditoImponibileLordo: redditoImponibileLordoOrdinario,
        contributiInpsDovuti: contributiInpsDovutiOrdinario,
        imponibileFiscaleNetto: imponibileFiscaleNettoOrdinario,
        imposteDovute: imposteDovuteOrdinario,
        totaleTasseEContributi: totaleTasseEContributiOrdinario,
        redditoNettoAnnuo: redditoNettoAnnuoOrdinario,
        isConveniente: redditoNettoAnnuoOrdinario > redditoNettoAnnuoForfettario,
      },
    });
  };
  
  // --- FUNZIONE DI RESET ---
  const reset = () => {
    setFatturatoAnnuo('');
    setCostiSostenuti('');
    setContributiVersati('');
    setResults(null);
    setIsForfettarioStartUp(true);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Memoize il componente dei risultati per evitare ricalcoli inutili
  const ResultDisplay = useMemo(() => {
    if (!results) return null;

    const ResultCard = ({ data }: { data: RegimeResult }) => (
      <div
        className={`w-full rounded-lg p-6 ${
          data.isConveniente
            ? 'border-2 border-green-500 bg-green-50'
            : 'border border-gray-200 bg-white'
        }`}
      >
        {data.isConveniente && (
          <span className="mb-2 inline-block rounded-full bg-green-200 px-3 py-1 text-sm font-semibold text-green-800">
            Regime più Conveniente
          </span>
        )}
        <h3 className="mb-4 text-xl font-bold text-gray-800">{data.regime}</h3>
        <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Reddito Imponibile Lordo:</span> <span className="font-medium">{formatCurrency(data.redditoImponibileLordo)}</span></p>
            <p className="flex justify-between"><span>Contributi INPS Dovuti:</span> <span className="font-medium">{formatCurrency(data.contributiInpsDovuti)}</span></p>
            <p className="flex justify-between"><span>Imposte Dovute ({data.regime === 'Forfettario' ? 'Sostitutiva' : 'IRPEF'}):</span> <span className="font-medium">{formatCurrency(data.imposteDovute)}</span></p>
            <hr className="my-2"/>
            <p className="flex justify-between text-base"><span>Totale Tasse e Contributi:</span> <span className="font-semibold text-red-600">{formatCurrency(data.totaleTasseEContributi)}</span></p>
        </div>
        <div className="mt-4 rounded-lg bg-gray-100 p-4 text-center">
          <p className="text-sm font-semibold uppercase text-gray-600">Reddito Netto Annuale</p>
          <p className={`text-3xl font-bold ${data.isConveniente ? 'text-green-600' : 'text-gray-800'}`}>
            {formatCurrency(data.redditoNettoAnnuo)}
          </p>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">Risultati della Simulazione</h2>
        <div className="flex flex-col items-stretch gap-6 md:flex-row">
          <ResultCard data={results.forfettario} />
          <ResultCard data={results.ordinario} />
        </div>
      </div>
    );
  }, [results]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 rounded-lg bg-gray-50 p-4 sm:p-8">
      <div>
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Simulatore Fiscale per Consulenti Finanziari
        </h1>
        <p className="text-center text-gray-600">
          Confronta il Regime Forfettario e Ordinario per la tua Partita IVA.
        </p>
      </div>
      
      {/* --- SEZIONE INPUT --- */}
      <div className="rounded-lg border bg-white p-6 shadow-md">
        <h3 className="mb-6 border-b pb-4 text-lg font-semibold text-gray-800">
          Inserisci i tuoi dati previsionali
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Fatturato Annuo */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              Fatturato Lordo Annuo Stimato (€)
              <Tooltip text="L'incasso totale che prevedi di avere in un anno, al lordo di tasse e contributi.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              value={fatturatoAnnuo}
              onChange={(e) => setFatturatoAnnuo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Es. 65000"
            />
          </div>

          {/* Costi Sostenuti */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              Costi Deducibili Stimati (€)
              <Tooltip text="Costi legati alla tua attività (es. software, affitto ufficio, marketing). Rilevanti solo per il Regime Ordinario.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              value={costiSostenuti}
              onChange={(e) => setCostiSostenuti(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Es. 8000"
            />
          </div>
          
           {/* Contributi Versati */}
           <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              Contributi INPS già versati (€)
              <Tooltip text="I contributi previdenziali versati nell'anno di riferimento. Sono deducibili dal reddito imponibile.">
                <InfoIcon />
              </Tooltip>
            </label>
            <input
              type="number"
              value={contributiVersati}
              onChange={(e) => setContributiVersati(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Es. 4000"
            />
          </div>

          {/* Opzione Forfettario Start-up */}
          <div className="flex items-center justify-center rounded-lg bg-gray-50 p-4">
              <label htmlFor="startup-toggle" className="flex cursor-pointer items-center">
                  <span className="mr-3 text-sm font-medium text-gray-900">Sei in Forfettario Start-up? (Tasse al 5%)</span>
                  <div className="relative">
                      <input type="checkbox" id="startup-toggle" className="sr-only" checked={isForfettarioStartUp} onChange={() => setIsForfettarioStartUp(!isForfettarioStartUp)} />
                      <div className="block h-8 w-14 rounded-full bg-gray-300"></div>
                      <div className={`dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${isForfettarioStartUp ? 'translate-x-6 !bg-blue-600' : ''}`}></div>
                  </div>
              </label>
          </div>
        </div>

        {/* --- PULSANTI AZIONE --- */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={calculate}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Calcola e Confronta
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold transition-colors hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>

      {/* --- SEZIONE RISULTATI --- */}
      {results && ResultDisplay}
      
      {/* --- DISCLAIMER E NOTE --- */}
      <div className="mt-8 text-center text-xs text-gray-500">
          <p>
              <strong>Disclaimer:</strong> Questo strumento fornisce una simulazione e non sostituisce una consulenza fiscale professionale.
              I calcoli si basano sulle aliquote e normative in vigore a <strong>{DATA_AGGIORNAMENTO}</strong>.
          </p>
          <p>
              Parametri utilizzati: Coefficiente di redditività {COEFFICIENTE_REDDITIVITA * 100}%, Aliquota Gestione Separata INPS {ALIQUOTA_INPS_GESTIONE_SEPARATA * 100}%.
          </p>
      </div>
    </div>
  );
}

// Icona per i tooltip
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);