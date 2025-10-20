'use client';

import { useState, FC, ReactNode } from 'react';

// --- COMPONENTI UI AUSILIARI ---

const Tooltip: FC<{ text: string; children: ReactNode }> = ({ text, children }) => (
  <span className="group relative cursor-help">
    {children}
    <span className="absolute bottom-full mb-2 hidden w-72 rounded-lg bg-gray-800 p-3 text-center text-xs text-white group-hover:block z-10">
      {text}
    </span>
  </span>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ContentSection: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-200 pb-2">{title}</h2>
        <div className="text-gray-700 leading-relaxed space-y-3">
            {children}
        </div>
    </section>
);

// --- COMPONENTE PRINCIPALE ---

export default function TassazioneConsulentiFinanziariOcf() {
  // --- STATI INPUT ---
  const [fatturatoAnnuo, setFatturatoAnnuo] = useState<string>('');
  const [costiSostenuti, setCostiSostenuti] = useState<string>('');
  const [contributiVersati, setContributiVersati] = useState<string>('');
  const [isForfettarioStartUp, setIsForfettarioStartUp] = useState<boolean>(true);
  
  // --- STATO RISULTATI ---
  const [results, setResults] = useState<CalculationResults | null>(null);

  // --- COSTANTI E PARAMETRI FISCALI ---
  const COEFFICIENTE_REDDITIVITA = 0.78; 
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

  const calculate = () => {
    const fatturato = parseFloat(fatturatoAnnuo) || 0;
    const costi = parseFloat(costiSostenuti) || 0;
    const contributiPagati = parseFloat(contributiVersati) || 0;
    if (fatturato === 0) return;

    const redditoImponibileLordoForfettario = fatturato * COEFFICIENTE_REDDITIVITA;
    const contributiInpsDovutiForfettario = redditoImponibileLordoForfettario * ALIQUOTA_INPS_GESTIONE_SEPARATA;
    const imponibileFiscaleNettoForfettario = Math.max(0, redditoImponibileLordoForfettario - contributiPagati);
    const aliquotaSostitutiva = isForfettarioStartUp ? IMPOSTA_SOSTITUTIVA_STARTUP : IMPOSTA_SOSTITUTIVA_STANDARD;
    const imposteDovuteForfettario = imponibileFiscaleNettoForfettario * aliquotaSostitutiva;
    const totaleTasseEContributiForfettario = imposteDovuteForfettario + contributiInpsDovutiForfettario;
    const redditoNettoAnnuoForfettario = fatturato - totaleTasseEContributiForfettario;

    const redditoImponibileLordoOrdinario = Math.max(0, fatturato - costi);
    const contributiInpsDovutiOrdinario = redditoImponibileLordoOrdinario * ALIQUOTA_INPS_GESTIONE_SEPARATA;
    const imponibileFiscaleNettoOrdinario = Math.max(0, redditoImponibileLordoOrdinario - contributiPagati);
    const imposteDovuteOrdinario = calcolaIrpef(imponibileFiscaleNettoOrdinario);
    const totaleTasseEContributiOrdinario = imposteDovuteOrdinario + contributiInpsDovutiOrdinario;
    const redditoNettoAnnuoOrdinario = fatturato - costi - totaleTasseEContributiOrdinario;

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
  
  const reset = () => {
    setFatturatoAnnuo('');
    setCostiSostenuti('');
    setContributiVersati('');
    setResults(null);
    setIsForfettarioStartUp(true);
  };

  const formatCurrency = (value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

  // --- DEFINIZIONE COMPONENTE RISULTATI ---
  const ResultDisplay = ({ results }: { results: CalculationResults }) => {
    const ResultCard = ({ data }: { data: RegimeResult }) => (
        <div className={`w-full rounded-lg p-6 ${data.isConveniente ? 'border-2 border-green-500 bg-green-50' : 'border border-gray-200 bg-white'}`}>
            {data.isConveniente && <span className="mb-2 inline-block rounded-full bg-green-200 px-3 py-1 text-sm font-semibold text-green-800">Regime più Conveniente</span>}
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
                <p className={`text-3xl font-bold ${data.isConveniente ? 'text-green-600' : 'text-gray-800'}`}>{formatCurrency(data.redditoNettoAnnuo)}</p>
            </div>
        </div>
    );
    return (
        <div className="space-y-6">
            <h3 className="text-center text-2xl font-bold text-gray-900">Risultati della Simulazione</h3>
            <div className="flex flex-col items-stretch gap-6 md:flex-row">
                <ResultCard data={results.forfettario} />
                <ResultCard data={results.ordinario} />
            </div>
        </div>
    );
  };

  // --- DEFINIZIONE UI CALCOLATORE ---
  const CalculatorUI = (
    <div className="w-full mx-auto max-w-4xl space-y-8 rounded-lg bg-gray-50 p-4 sm:p-8 border-2 border-blue-500 shadow-xl my-12" id="simulatore">
        <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
            🛠️ Il Tuo Simulatore Fiscale Interattivo
            </h2>
            <p className="text-center text-gray-600 mt-2">
            Ora che conosci la teoria, mettila in pratica. Scopri il regime più adatto a te.
            </p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-md">
            <h3 className="mb-6 border-b pb-4 text-lg font-semibold text-gray-800">
            Inserisci i tuoi dati previsionali
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">Fatturato Lordo Annuo Stimato (€)<Tooltip text="L'incasso totale che prevedi di avere in un anno, al lordo di tasse e contributi."><InfoIcon /></Tooltip></label>
                    <input type="number" value={fatturatoAnnuo} onChange={(e) => setFatturatoAnnuo(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="Es. 65000" />
                </div>
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">Costi Deducibili Stimati (€)<Tooltip text="Costi legati alla tua attività (es. software, affitto ufficio, marketing). Rilevanti solo per il Regime Ordinario."><InfoIcon /></Tooltip></label>
                    <input type="number" value={costiSostenuti} onChange={(e) => setCostiSostenuti(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="Es. 8000" />
                </div>
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">Contributi INPS già versati (€)<Tooltip text="I contributi previdenziali versati nell'anno di riferimento. Sono deducibili dal reddito imponibile."><InfoIcon /></Tooltip></label>
                    <input type="number" value={contributiVersati} onChange={(e) => setContributiVersati(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500" placeholder="Es. 4000" />
                </div>
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
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button onClick={calculate} className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700">Calcola e Confronta</button>
                <button onClick={reset} className="rounded-lg border border-gray-300 px-6 py-3 font-semibold transition-colors hover:bg-gray-100">Reset</button>
            </div>
        </div>
        {results && <ResultDisplay results={results} />}
    </div>
  );
  
  // --- RENDER COMPONENTE PRINCIPALE CON CONTENUTI ---
  return (
    <div className="prose prose-lg max-w-4xl mx-auto p-4 sm:p-6">
        <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Guida Fiscale 2025 per Consulenti Finanziari: Tasse, Partita IVA e Calcolo Netto</h1>
            <p className="mt-4 text-xl text-gray-600">Scopri il regime fiscale più vantaggioso per te e calcola il tuo guadagno netto con il nostro simulatore interattivo.</p>
        </header>

        <main className="space-y-12">
            <ContentSection title="I Fondamenti: Aprire la Partita IVA da Consulente Finanziario">
                <p>Intraprendere la carriera di consulente finanziario autonomo è una sfida entusiasmante, ma richiede una solida comprensione degli obblighi fiscali. La prima domanda non è 'quanto guadagnerò?', ma 'come gestirò la mia fiscalità per massimizzare il mio netto?'. Vediamo i tre pilastri iniziali.</p>
                <ul className="list-disc space-y-2 pl-5">
                    <li><strong>Il Codice ATECO Corretto:</strong> È il DNA della tua attività. Per i consulenti finanziari, i codici principali sono il <strong>66.19.21</strong> (Consulenti finanziari abilitati all'offerta fuori sede) e il <strong>66.19.22</strong> (Agenti, mediatori e procacciatori in prodotti finanziari). La scelta corretta è fondamentale perché determina il tuo profilo fiscale.</li>
                    <li><strong>L'Iscrizione all'INPS (Gestione Separata):</strong> Non avendo una cassa professionale dedicata, i consulenti finanziari autonomi si iscrivono alla Gestione Separata INPS. Questa cassa raccoglie i tuoi contributi previdenziali, che sono obbligatori e si calcolano in percentuale sul tuo reddito imponibile.</li>
                    <li><strong>La Scelta Cruciale: Forfettario o Ordinario?</strong> Questa è la decisione più importante. Non esiste una risposta unica: dipende dal tuo livello di fatturato previsto e, soprattutto, dai costi che prevedi di sostenere. Analizziamoli nel dettaglio.</li>
                </ul>
            </ContentSection>

            <ContentSection title="📊 Approfondimento: Il Regime Forfettario">
                <p>Il Regime Forfettario è la scelta privilegiata per chi inizia, grazie alla sua incredibile semplicità. Ma come funziona?</p>
                <p>Il suo meccanismo si basa su una presunzione "a forfait" dei tuoi costi. Lo Stato non ti chiede di elencare le spese: presume che i tuoi costi siano una percentuale fissa del tuo fatturato. Per i consulenti finanziari, questa percentuale è del 22%, lasciando un imponibile del <strong>78% (il coefficiente di redditività)</strong>.</p>
                <p><strong>Formula:</strong> <code>Fatturato Lordo × 78% = Reddito Imponibile</code></p>
                <p>Su questo imponibile si applica un'imposta sostitutiva, non l'IRPEF. Questa imposta è del <strong>5% per i primi 5 anni</strong> (se sei una start-up) e del <strong>15%</strong> dopo. Semplice, vero?</p>
                <ul className="list-disc space-y-2 pl-5">
                    <li>✅ <strong>Vantaggi:</strong> Contabilità snella, niente IVA, tassazione molto bassa (specialmente all'inizio).</li>
                    <li>❌ <strong>Svantaggi:</strong> Se i tuoi costi reali (affitto ufficio, software costosi, marketing) superano il 22% del fatturato, potresti pagare tasse su guadagni che non hai.</li>
                </ul>
            </ContentSection>
            
            <ContentSection title="📈 Approfondimento: Il Regime Ordinario Semplificato">
                <p>Se prevedi costi significativi o un fatturato superiore a 85.000 €, il Regime Ordinario diventa la tua strada. Qui la logica si inverte: la tassazione è basata sul tuo utile reale.</p>
                <p><strong>Formula:</strong> <code>Fatturato Lordo – Costi Deducibili = Reddito Imponibile</code></p>
                <p>Sul reddito imponibile si applica la tassazione a <strong>scaglioni IRPEF</strong>. A differenza dell'aliquota fissa del forfettario, qui l'imposta cresce con il reddito:</p>
                <ul className="list-disc space-y-2 pl-5">
                    <li><strong>Fino a 28.000€:</strong> aliquota del 23%</li>
                    <li><strong>Da 28.001€ a 50.000€:</strong> aliquota del 35%</li>
                    <li><strong>Oltre 50.000€:</strong> aliquota del 43%</li>
                </ul>
                 <ul className="list-disc space-y-2 pl-5">
                    <li>✅ <strong>Vantaggi:</strong> Puoi scaricare tutti i costi inerenti alla tua attività, riducendo l'imponibile. Nessun limite di fatturato.</li>
                    <li>❌ <strong>Svantaggi:</strong> Maggiore complessità burocratica, gestione dell'IVA e tassazione potenzialmente più elevata.</li>
                </ul>
            </ContentSection>

            {CalculatorUI}

            <ContentSection title="🏛️ Oltre le Tasse: Gli Altri Costi del Consulente">
                <p>Il tuo guadagno netto non dipende solo da tasse e contributi. Un professionista previdente deve mettere in conto anche altre spese fisse e variabili:</p>
                <ul className="list-disc space-y-2 pl-5">
                    <li><strong>Contributo annuale OCF:</strong> La quota di iscrizione all'Organismo di Vigilanza e tenuta dell'Albo Unico dei Consulenti Finanziari è un costo fisso annuale.</li>
                    <li><strong>Assicurazione Professionale:</strong> Obbligatoria per legge, ti tutela da eventuali errori professionali. Il suo costo varia in base ai massimali scelti.</li>
                    <li><strong>Costo del Commercialista:</strong> Un partner indispensabile per la gestione fiscale. Il costo varia in base al regime fiscale e alla complessità della tua posizione.</li>
                    <li><strong>Software e Formazione:</strong> Piattaforme di analisi, CRM, corsi di aggiornamento. Costi variabili ma essenziali per rimanere competitivi.</li>
                </ul>
            </ContentSection>

            <ContentSection title="❓ Domande Frequenti (FAQ)">
                <div className="space-y-4">
                    <details className="p-4 border rounded-lg">
                        <summary className="font-semibold cursor-pointer">Posso cambiare regime fiscale da un anno all'altro?</summary>
                        <p className="mt-2">Sì, è possibile. Il cambio si effettua generalmente a inizio anno. Se sei in forfettario e superi la soglia di 85.000€, il passaggio all'ordinario è obbligatorio dall'anno successivo. Viceversa, se sei in ordinario e rientri nei requisiti, puoi optare per il forfettario.</p>
                    </details>
                    <details className="p-4 border rounded-lg">
                        <summary className="font-semibold cursor-pointer">Quali sono i principali costi che posso dedurre nel Regime Ordinario?</summary>
                        <p className="mt-2">Puoi dedurre tutti i costi "inerenti" alla tua attività. Esempi comuni includono: costi per l'affitto dell'ufficio, utenze, software professionali (es. Bloomberg, Reuters), spese di marketing, formazione, trasferte, e il compenso del commercialista.</p>
                    </details>
                     <details className="p-4 border rounded-lg">
                        <summary className="font-semibold cursor-pointer">Il contributo OCF è un costo deducibile?</summary>
                        <p className="mt-2">Sì, la quota annuale versata all'OCF è considerata un costo professionale e quindi è interamente deducibile dal reddito se operi in Regime Ordinario.</p>
                    </details>
                </div>
            </ContentSection>

            <section className="text-center bg-gray-100 p-8 rounded-lg">
                 <h2 className="text-2xl font-bold text-gray-800">Hai Bisogno di un'Analisi Personalizzata?</h2>
                 <p className="mt-2">Questo strumento è un ottimo punto di partenza, ma ogni situazione è unica. Se desideri un'analisi fiscale dettagliata e una strategia su misura per te, non esitare a contattarci.</p>
                 <button className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Richiedi una Consulenza</button>
            </section>
        </main>
        
        <footer className="mt-12 text-center text-xs text-gray-500">
            <p><strong>Disclaimer:</strong> Questo strumento fornisce una simulazione e non sostituisce una consulenza fiscale professionale. I calcoli si basano sulle aliquote e normative in vigore a <strong>{DATA_AGGIORNAMENTO}</strong>.</p>
            <p>Parametri utilizzati: Coefficiente di redditività {COEFFICIENTE_REDDITIVITA * 100}%, Aliquota Gestione Separata INPS {ALIQUOTA_INPS_GESTIONE_SEPARATA * 100}%. Le aliquote IRPEF sono aggiornate agli ultimi scaglioni.</p>
        </footer>
    </div>
  );
}