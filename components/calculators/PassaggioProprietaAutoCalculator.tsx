'use client';

import { useState } from 'react';

// --- Tipi di Dati ---
// Definiamo le interfacce per i nostri dati per un codice più pulito

interface Provincia {
  sigla: string;
  nome: string;
  maggiorazioneIPT: number; // Es. 1.30 per il 30% di maggiorazione
}

interface CostiFissi {
  emolumentiACI: number;
  impostaBolloCdP: number;
  impostaBolloLibretto: number;
  dirittiMotorizzazione: number;
}

interface CostiVariabili {
  ipt: number;
}

interface RisultatoCalcolo {
  totale: number;
  costiFissi: CostiFissi;
  costiVariabili: CostiVariabili;
  dettagliIPT: string; // Per spiegare come è stata calcolata l'IPT
}

// --- Database (Simulato) ---
// TODO: Questo elenco deve essere completato e mantenuto aggiornato.
// La maggiorazione è (1 + perc_maggiorazione), es. 30% = 1.30
const BASE_MAGGIORAZIONE_IPT = 1.3;

const provinceData: Array<{ sigla: string; nome: string; maggiorazioneIPT?: number }> = [
  { sigla: 'AG', nome: 'Agrigento' },
  { sigla: 'AL', nome: 'Alessandria' },
  { sigla: 'AN', nome: 'Ancona' },
  { sigla: 'AO', nome: "Aosta (Valle d'Aosta)", maggiorazioneIPT: 1.0 },
  { sigla: 'AR', nome: 'Arezzo' },
  { sigla: 'AP', nome: 'Ascoli Piceno' },
  { sigla: 'AT', nome: 'Asti' },
  { sigla: 'AV', nome: 'Avellino' },
  { sigla: 'BA', nome: 'Bari' },
  { sigla: 'BT', nome: 'Barletta-Andria-Trani' },
  { sigla: 'BL', nome: 'Belluno' },
  { sigla: 'BN', nome: 'Benevento' },
  { sigla: 'BG', nome: 'Bergamo' },
  { sigla: 'BI', nome: 'Biella' },
  { sigla: 'BO', nome: 'Bologna' },
  { sigla: 'BZ', nome: 'Bolzano', maggiorazioneIPT: 1.0 },
  { sigla: 'BS', nome: 'Brescia' },
  { sigla: 'BR', nome: 'Brindisi' },
  { sigla: 'CA', nome: 'Cagliari' },
  { sigla: 'CL', nome: 'Caltanissetta' },
  { sigla: 'CB', nome: 'Campobasso' },
  { sigla: 'CE', nome: 'Caserta' },
  { sigla: 'CT', nome: 'Catania' },
  { sigla: 'CZ', nome: 'Catanzaro' },
  { sigla: 'CH', nome: 'Chieti' },
  { sigla: 'CO', nome: 'Como' },
  { sigla: 'CS', nome: 'Cosenza' },
  { sigla: 'CR', nome: 'Cremona' },
  { sigla: 'KR', nome: 'Crotone' },
  { sigla: 'CN', nome: 'Cuneo' },
  { sigla: 'EN', nome: 'Enna' },
  { sigla: 'FM', nome: 'Fermo' },
  { sigla: 'FE', nome: 'Ferrara' },
  { sigla: 'FI', nome: 'Firenze' },
  { sigla: 'FG', nome: 'Foggia' },
  { sigla: 'FC', nome: 'Forlì-Cesena' },
  { sigla: 'FR', nome: 'Frosinone' },
  { sigla: 'GE', nome: 'Genova' },
  { sigla: 'GO', nome: 'Gorizia' },
  { sigla: 'GR', nome: 'Grosseto' },
  { sigla: 'IM', nome: 'Imperia' },
  { sigla: 'IS', nome: 'Isernia' },
  { sigla: 'AQ', nome: "L'Aquila" },
  { sigla: 'SP', nome: 'La Spezia' },
  { sigla: 'LT', nome: 'Latina' },
  { sigla: 'LE', nome: 'Lecce' },
  { sigla: 'LC', nome: 'Lecco' },
  { sigla: 'LI', nome: 'Livorno' },
  { sigla: 'LO', nome: 'Lodi' },
  { sigla: 'LU', nome: 'Lucca' },
  { sigla: 'MC', nome: 'Macerata' },
  { sigla: 'MN', nome: 'Mantova' },
  { sigla: 'MS', nome: 'Massa-Carrara' },
  { sigla: 'MT', nome: 'Matera' },
  { sigla: 'ME', nome: 'Messina' },
  { sigla: 'MI', nome: 'Milano' },
  { sigla: 'MO', nome: 'Modena' },
  { sigla: 'MB', nome: 'Monza e Brianza' },
  { sigla: 'NA', nome: 'Napoli' },
  { sigla: 'NO', nome: 'Novara' },
  { sigla: 'NU', nome: 'Nuoro' },
  { sigla: 'OR', nome: 'Oristano' },
  { sigla: 'PD', nome: 'Padova' },
  { sigla: 'PA', nome: 'Palermo' },
  { sigla: 'PR', nome: 'Parma' },
  { sigla: 'PV', nome: 'Pavia' },
  { sigla: 'PG', nome: 'Perugia' },
  { sigla: 'PU', nome: 'Pesaro e Urbino' },
  { sigla: 'PE', nome: 'Pescara' },
  { sigla: 'PC', nome: 'Piacenza' },
  { sigla: 'PI', nome: 'Pisa' },
  { sigla: 'PT', nome: 'Pistoia' },
  { sigla: 'PN', nome: 'Pordenone' },
  { sigla: 'PZ', nome: 'Potenza' },
  { sigla: 'PO', nome: 'Prato' },
  { sigla: 'RG', nome: 'Ragusa' },
  { sigla: 'RA', nome: 'Ravenna' },
  { sigla: 'RC', nome: 'Reggio Calabria' },
  { sigla: 'RE', nome: 'Reggio Emilia' },
  { sigla: 'RI', nome: 'Rieti' },
  { sigla: 'RN', nome: 'Rimini' },
  { sigla: 'RM', nome: 'Roma' },
  { sigla: 'RO', nome: 'Rovigo' },
  { sigla: 'SA', nome: 'Salerno' },
  { sigla: 'SS', nome: 'Sassari' },
  { sigla: 'SV', nome: 'Savona' },
  { sigla: 'SI', nome: 'Siena' },
  { sigla: 'SR', nome: 'Siracusa' },
  { sigla: 'SO', nome: 'Sondrio' },
  { sigla: 'SU', nome: 'Sud Sardegna' },
  { sigla: 'TA', nome: 'Taranto' },
  { sigla: 'TE', nome: 'Teramo' },
  { sigla: 'TR', nome: 'Terni' },
  { sigla: 'TP', nome: 'Trapani' },
  { sigla: 'TN', nome: 'Trento', maggiorazioneIPT: 1.0 },
  { sigla: 'TV', nome: 'Treviso' },
  { sigla: 'TS', nome: 'Trieste' },
  { sigla: 'TO', nome: 'Torino' },
  { sigla: 'UD', nome: 'Udine' },
  { sigla: 'VA', nome: 'Varese' },
  { sigla: 'VE', nome: 'Venezia' },
  { sigla: 'VB', nome: 'Verbano-Cusio-Ossola' },
  { sigla: 'VC', nome: 'Vercelli' },
  { sigla: 'VR', nome: 'Verona' },
  { sigla: 'VV', nome: 'Vibo Valentia' },
  { sigla: 'VI', nome: 'Vicenza' },
  { sigla: 'VT', nome: 'Viterbo' },
];

const provinceList: Provincia[] = provinceData.map((provincia) => ({
  sigla: provincia.sigla,
  nome: provincia.nome,
  maggiorazioneIPT: provincia.maggiorazioneIPT ?? BASE_MAGGIORAZIONE_IPT,
}));

// Costanti di base per il calcolo (Tariffe ACI 2024/2025)
const IPT_BASE_FINO_53KW = 150.81;
const IPT_TARIFFA_BASE_PER_KW_EXTRA = 3.5119;
const IPT_FISSA_STORICHE = 51.65;
const IPT_FISSA_MINIPASSAGGIO = 51.65;

export default function PassaggioProprietaAuto() {
  // --- State Hooks ---
  const [targa, setTarga] = useState<string>('');
  const [isLoadingTarga, setIsLoadingTarga] = useState<boolean>(false);

  const [potenzaKW, setPotenzaKW] = useState<string>('');
  const [provincia, setProvincia] = useState<string>('RM'); // Default 'Roma'
  const [tipoVeicolo, setTipoVeicolo] = useState<string>('autovettura');

  // Checkbox per casi speciali
  const [isVeicoloStorico, setIsVeicoloStorico] = useState<boolean>(false);
  const [isEredita, setIsEredita] = useState<boolean>(false);
  const [isMinipassaggio, setIsMinipassaggio] = useState<boolean>(false);

  const [result, setResult] = useState<RisultatoCalcolo | null>(null);

  // --- Funzioni Logiche ---

  /**
   * SIMULAZIONE "Calcolo da Targa"
   * Nella realtà, qui faresti una chiamata a un servizio API (es. Visurenet)
   */
  const handleRecuperaDatiTarga = () => {
    setIsLoadingTarga(true);
    setResult(null);

    // Simuliamo una chiamata API
    setTimeout(() => {
      // Per test, simuliamo che 'GA123BB' sia un'auto da 110kW
      if (targa.toUpperCase().startsWith('GA')) {
        setPotenzaKW('110');
        setTipoVeicolo('autovettura');
        // Potresti anche recuperare la provincia del VECCHIO proprietario
        // ma per il calcolo serve quella del NUOVO.
      } else {
        alert('Targa non trovata (simulazione). Inserisci i dati manualmente.');
      }
      setIsLoadingTarga(false);
    }, 1200);
  };

  /**
   * Logica di Calcolo Principale
   */
  const calculate = () => {
    const kw = parseFloat(potenzaKW);
    const provSelezionata = provinceList.find((p) => p.sigla === provincia);

    if (isNaN(kw) || !provSelezionata || kw <= 0) {
      alert(
        'Per favore, inserisci una potenza (kW) valida e seleziona una provincia.'
      );
      return;
    }

    let costiFissi: CostiFissi;
    let costiVariabili: CostiVariabili = { ipt: 0 };
    let dettagliIPT = '';

    // --- 1. Calcolo Costi Fissi ---
    // Questi variano per tipo veicolo e casi speciali
    switch (tipoVeicolo) {
      case 'motociclo':
        costiFissi = {
          emolumentiACI: 27.0,
          impostaBolloCdP: 32.0, // Fissa se non è eredità
          impostaBolloLibretto: 16.0,
          dirittiMotorizzazione: 10.2,
        };
        // Per i motocicli, l'IPT è fissa e ridotta (es. €26,00)
        // Qui semplifichiamo, ma andrebbe gestita
        break;
      case 'autovettura':
      default:
        costiFissi = {
          emolumentiACI: 27.0,
          impostaBolloCdP: 32.0, // Aumenta a 48.00 per eredità
          impostaBolloLibretto: 16.0,
          dirittiMotorizzazione: 10.2,
        };
        break;
    }

    // Gestione casi speciali che modificano i fissi
    if (isEredita) {
      costiFissi.impostaBolloCdP = 48.0; // Bollo raddoppiato per eredità
    }

    // --- 2. Calcolo Costi Variabili (IPT) ---
    // Questo è il cuore del calcolo
    const { maggiorazioneIPT } = provSelezionata;

    if (isVeicoloStorico) {
      costiVariabili.ipt = IPT_FISSA_STORICHE;
      dettagliIPT = `IPT fissa per veicoli storici (con CRS): € ${IPT_FISSA_STORICHE.toFixed(
        2
      )}`;
    } else if (isMinipassaggio) {
      costiVariabili.ipt = IPT_FISSA_MINIPASSAGGIO;
      dettagliIPT = `IPT fissa per minipassaggio (Art. 56): € ${IPT_FISSA_MINIPASSAGGIO.toFixed(
        2
      )}`;
    } else {
      // Calcolo IPT standard
      let iptCalcolata = 0;

      if (kw <= 53) {
        iptCalcolata = IPT_BASE_FINO_53KW * maggiorazioneIPT;
        dettagliIPT = `Fino a 53 kW: (€ ${IPT_BASE_FINO_53KW.toFixed(
          2
        )} x ${maggiorazioneIPT * 100}%)`;
      } else {
        const costoBase = IPT_BASE_FINO_53KW * maggiorazioneIPT;
        const kwExtra = kw - 53;
        const costoExtra =
          kwExtra * IPT_TARIFFA_BASE_PER_KW_EXTRA * maggiorazioneIPT;
        iptCalcolata = costoBase + costoExtra;

        dettagliIPT = `Quota base: (€ ${IPT_BASE_FINO_53KW.toFixed(
          2
        )} x ${maggiorazioneIPT * 100}%) + Quota extra: (${kwExtra.toFixed(
          0
        )} kW x € ${IPT_TARIFFA_BASE_PER_KW_EXTRA.toFixed(
          4
        )} x ${maggiorazioneIPT * 100}%)`;
      }
      costiVariabili.ipt = iptCalcolata;
    }

    // --- 3. Calcolo Totale ---
    const totale =
      costiFissi.emolumentiACI +
      costiFissi.impostaBolloCdP +
      costiFissi.impostaBolloLibretto +
      costiFissi.dirittiMotorizzazione +
      costiVariabili.ipt;

    // --- 4. Imposta Risultato ---
    setResult({
      totale,
      costiFissi,
      costiVariabili,
      dettagliIPT,
    });
  };

  /**
   * Reset
   */
  const reset = () => {
    setTarga('');
    setPotenzaKW('');
    setProvincia('RM');
    setTipoVeicolo('autovettura');
    setIsVeicoloStorico(false);
    setIsEredita(false);
    setIsMinipassaggio(false);
    setResult(null);
  };

  // Funzione helper per formattare valuta
  const formatCurrency = (value: number) =>
    value.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR',
    });

  return (
    <div className="space-y-6">
      {/* Sezione Calcolo da Targa (Simulato) */}
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          🚀 Calcolo Rapido da Targa (Simulazione)
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Inserisci una targa (prova con "GA123BB") per recuperare
          automaticamente i dati del veicolo.
        </p>
        <div className="flex gap-4">
          <input
            type="text"
            value={targa}
            onChange={(e) => setTarga(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase"
            placeholder="GA123BB"
          />
          <button
            onClick={handleRecuperaDatiTarga}
            disabled={isLoadingTarga}
            className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isLoadingTarga ? 'Carico...' : 'Cerca'}
          </button>
        </div>
      </div>

      {/* Sezione Calcolo Manuale */}
      <div className="p-6 rounded-lg border border-gray-200 shadow-md bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Calcolo Manuale Preventivo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Colonna 1: Dati Veicolo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Potenza (kW)
            </label>
            <input
              type="number"
              value={potenzaKW}
              onChange={(e) => setPotenzaKW(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Es. 85"
            />
            <p className="text-xs text-gray-500 mt-1">
              Trovi i kW al punto (P.2) del libretto di circolazione.
            </p>
          </div>

          {/* Colonna 2: Provincia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provincia Acquirente
            </label>
            <select
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {provinceList
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map((p) => (
                  <option key={p.sigla} value={p.sigla}>
                    {p.nome} ({p.sigla})
                  </option>
                ))}
            </select>
          </div>

          {/* Colonna 3: Tipo Veicolo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Veicolo
            </label>
            <select
              value={tipoVeicolo}
              onChange={(e) => setTipoVeicolo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="autovettura">Autovettura</option>
              <option value="motociclo">Motociclo</option>
              {/* TODO: Aggiungere logica per altri tipi (Autocarro, Rimorchio) */}
              <option value="autocarro" disabled>
                Autocarro (Logica non ancora implementata)
              </option>
            </select>
          </div>
        </div>

        {/* Checkbox Casi Speciali */}
        <div className="mt-6 border-t pt-4 space-y-3">
          <h4 className="text-base font-semibold text-gray-700">
            Casi Particolari
          </h4>
          <div className="flex items-center">
            <input
              id="isVeicoloStorico"
              type="checkbox"
              checked={isVeicoloStorico}
              onChange={(e) => setIsVeicoloStorico(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor="isVeicoloStorico"
              className="ml-2 block text-sm text-gray-900"
            >
              Veicolo Storico (con Certificato di Rilevanza Storica - CRS)
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="isEredita"
              type="checkbox"
              checked={isEredita}
              onChange={(e) => setIsEredita(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor="isEredita"
              className="ml-2 block text-sm text-gray-900"
            >
              Passaggio di proprietà per Eredità
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="isMinipassaggio"
              type="checkbox"
              checked={isMinipassaggio}
              onChange={(e) => setIsMinipassaggio(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor="isMinipassaggio"
              className="ml-2 block text-sm text-gray-900"
            >
              Minipassaggio (Vendita a concessionario, Art. 56)
            </label>
          </div>
        </div>

        {/* Pulsanti Azione */}
        <div className="flex gap-4 mt-6 border-t pt-6">
          <button
            onClick={calculate}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Calcola Costo
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Sezione Risultati Dettagliati */}
      {result !== null && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Stima Costo Passaggio di Proprietà
          </h3>
          
          <div className="text-center mb-6">
            <p className="text-sm text-gray-700">Costo Totale Stimato</p>
            <p className="text-5xl font-bold text-blue-600">
              {formatCurrency(result.totale)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (Costo Fai-da-te presso STA, esclusi compensi agenzia)
            </p>
          </div>

          <div className="border-t border-blue-200 pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              Dettaglio Costi
            </h4>
            <ul className="space-y-1 text-sm">
              {/* Costi Fissi */}
              <li className="flex justify-between">
                <span>Costi Fissi</span>
                <span className="font-medium">
                  {formatCurrency(
                    result.costiFissi.emolumentiACI +
                    result.costiFissi.impostaBolloCdP +
                    result.costiFissi.impostaBolloLibretto +
                    result.costiFissi.dirittiMotorizzazione
                  )}
                </span>
              </li>
              <li className="flex justify-between pl-4 text-gray-600">
                <span>- Emolumenti ACI</span>
                <span>{formatCurrency(result.costiFissi.emolumentiACI)}</span>
              </li>
              <li className="flex justify-between pl-4 text-gray-600">
                <span>- Imposta Bollo (Trascrizione PRA)</span>
                <span>
                  {formatCurrency(result.costiFissi.impostaBolloCdP)}
                  {isEredita && ' (Raddoppiato per eredità)'}
                </span>
              </li>
              <li className="flex justify-between pl-4 text-gray-600">
                <span>- Imposta Bollo (Agg. Libretto)</span>
                <span>
                  {formatCurrency(result.costiFissi.impostaBolloLibretto)}
                </span>
              </li>
              <li className="flex justify-between pl-4 text-gray-600">
                <span>- Diritti Motorizzazione (DT)</span>
                <span>
                  {formatCurrency(result.costiFissi.dirittiMotorizzazione)}
                </span>
              </li>

              {/* Costi Variabili */}
              <li className="flex justify-between mt-2 pt-2 border-t border-dotted border-blue-300">
                <span>Costi Variabili</span>
                <span className="font-medium">
                  {formatCurrency(result.costiVariabili.ipt)}
                </span>
              </li>
              <li className="flex justify-between pl-4 text-gray-600">
                <span>- Imposta Provinciale (IPT)</span>
                <span>{formatCurrency(result.costiVariabili.ipt)}</span>
              </li>
              <li className="pl-4">
                <p className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                  {result.dettagliIPT}
                </p>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
