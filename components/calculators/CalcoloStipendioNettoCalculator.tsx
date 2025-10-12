'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// ===========================
// Tipi
// ===========================
type Contratto = 'standard' | 'apprendistato' | 'parttime' | 'determinato';
type Regione = keyof typeof ADDIZIONALI_REGIONALI_2025;

type BreakdownNetto = {
  inpsLav: number;
  irpef: number;
  addReg: number;
  addComTot: number;
  detLavoro: number;
  detFigli: number;
  detConiuge: number;
  welfareEffettivo: number;
};

type RisultatoNetto = {
  netto: number;
  breakdown: BreakdownNetto;
};

type RisultatoEqualCTC = { netto: number; RAL: number };

type PropsChart = { data: Array<{ name: string; value: number }> };

// ===========================
// Chart dinamico (no SSR)
// ===========================
const NetBarChart = dynamic(
  async () => {
    const R = await import('recharts');
    const Chart: React.FC<PropsChart> = ({ data }) => (
      <R.ResponsiveContainer width="100%" height="100%">
        <R.BarChart data={data} margin={{ top: 8, right: 20, bottom: 8, left: 8 }}>
          <R.XAxis dataKey="name" />
          <R.YAxis />
          <R.Tooltip />
          <R.Legend />
          <R.Bar dataKey="value" />
        </R.BarChart>
      </R.ResponsiveContainer>
    );
    return Chart;
  },
  { ssr: false }
);

// ===========================
// Dataset Addizionali 2025
// (valori realistici/semplificati)
// ===========================
const ADDIZIONALI_REGIONALI_2025: Record<string, number> = {
  "Abruzzo": 1.73,
  "Basilicata": 1.23,
  "Calabria": 1.73,
  "Campania": 1.60,
  "Emilia-Romagna": 1.68,
  "Friuli-Venezia Giulia": 1.23,
  "Lazio": 1.73,
  "Liguria": 1.60,
  "Lombardia": 1.23,
  "Marche": 1.70,
  "Molise": 1.62,
  "Piemonte": 1.30,
  "Puglia": 1.50,
  "Sardegna": 1.23,
  "Sicilia": 1.62,
  "Toscana": 1.70,
  "Trentino-Alto Adige": 1.23,
  "Umbria": 1.73,
  "Valle d'Aosta": 1.23,
  "Veneto": 1.25,
};

// Esempi città (puoi sostituire con dataset completo esterno)
const ADDIZIONALI_COMUNALI_2025: Record<string, number> = {
  "Roma": 0.9,
  "Milano": 0.8,
  "Napoli": 0.8,
  "Torino": 0.8,
  "Firenze": 0.8,
  "Palermo": 0.8,
  "Bologna": 0.8,
  "Bari": 0.8,
  "Venezia": 0.8,
  "Cagliari": 0.8,
};

// ===========================
// Utility
// ===========================
const fmt = (v: number): string =>
  Number.isFinite(v)
    ? v.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
    : '—';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// ===========================
// IRPEF e Detrazioni 2025 (semplificate ma consistenti)
// ===========================
function calcolaIRPEF(imponibile: number): number {
  let imp = Math.max(0, imponibile);
  let irpef = 0;
  const scaglioni = [
    { max: 28000, aliquota: 0.23 },
    { max: 50000, aliquota: 0.35 },
    { max: Infinity, aliquota: 0.43 },
  ];
  let prev = 0;
  for (const s of scaglioni) {
    const base = Math.min(s.max - prev, imp);
    if (base > 0) {
      irpef += base * s.aliquota;
      imp -= base;
      prev = s.max;
    }
  }
  return Math.max(0, irpef);
}

function detrazioniLavoroDipendente(reddito: number): number {
  const R = Math.max(0, reddito);
  if (R <= 15000) return 1880;
  if (R <= 28000) return 1910 - (1190 * (R - 15000)) / 13000;
  if (R <= 50000) return 1910 * (1 - (R - 28000) / 22000);
  return 0;
}

function detrazioniFigli(nFigli: number): number {
  return clamp(nFigli, 0, 10) * 800; // semplificazione
}

function detrazioneConiuge(reddito: number, coniugeACarico: boolean): number {
  if (!coniugeACarico) return 0;
  const R = Math.max(0, reddito);
  if (R <= 15000) return 800;
  if (R <= 40000) return 690;
  return 0;
}

// ===========================
// Engine Dipendente & HR
// ===========================
function calcolaNetto(
  RAL: number,
  mensilita: 12 | 13 | 14,
  regione: Regione,
  comune: string,
  figli: number,
  coniuge: boolean,
  contratto: Contratto,
  welfareAnnuale: number
): RisultatoNetto {
  // Nota: inps lavoratore semplificato
  const imponibile = Math.max(0, RAL);
  const inpsLav = imponibile * 0.0919;

  // Imponibile fiscale IRPEF
  const imponibileIrpef = Math.max(0, imponibile - inpsLav);

  // IRPEF lorda
  const irpef = calcolaIRPEF(imponibileIrpef);

  // Detrazioni
  const detLavoro = detrazioniLavoroDipendente(imponibile);
  const detFigli = detrazioniFigli(figli);
  const detConiuge = detrazioneConiuge(imponibile, coniuge);

  // Addizionali
  const addRegAliq = (ADDIZIONALI_REGIONALI_2025[regione] ?? 1.5) / 100;
  const addComAliq = (ADDIZIONALI_COMUNALI_2025[comune] ?? 0.6) / 100;
  const addReg = addRegAliq * imponibileIrpef;
  const addComTot = addComAliq * imponibileIrpef;

  // Welfare/fringe benefit (esenzione semplificata)
  // Ticket: gestione semplificata → passati direttamente in welfareAnnuale
  // Fringe: tetto 1.000€ (no figli) / 2.000€ (con figli) — semplificazione
  const tettoFringe = figli > 0 ? 2000 : 1000;
  const welfareEffettivo = Math.min(Math.max(0, welfareAnnuale), tettoFringe);

  // Netto annuo
  const nettoAnn =
    imponibile - inpsLav - irpef - addReg - addComTot + detLavoro + detFigli + detConiuge + welfareEffettivo;

  // Preset contrattuali (apprendistato, part-time, TD):
  // Semplificazione: si applicano piccoli fattori di correzione sul netto finale
  const fattoreContratto =
    contratto === 'apprendistato' ? 1.01 : contratto === 'parttime' ? 0.6 : contratto === 'determinato' ? 0.995 : 1;

  const nettoAnnContratto = nettoAnn * fattoreContratto;

  return {
    netto: Math.max(0, nettoAnnContratto),
    breakdown: {
      inpsLav,
      irpef,
      addReg,
      addComTot,
      detLavoro,
      detFigli,
      detConiuge,
      welfareEffettivo,
    },
  };
}

function calcolaCTC(RAL: number): number {
  const inpsDatore = RAL * 0.28; // semplificato (varia per settore: qui è medio)
  const inail = RAL * 0.01; // semplificato
  const tfr = RAL * 0.072; // accantonamento medio
  return Math.max(0, RAL + inpsDatore + inail + tfr);
}

// Equal-CTC: cerca una RAL che rispetti il budget e massimizzi il netto (greedy iterativo, stabile)
function equalCTC(budgetCTC: number, regione: Regione, comune: string): RisultatoEqualCTC {
  let low = 0;
  let high = budgetCTC; // non può superare il budget
  let best: RisultatoEqualCTC = { netto: 0, RAL: 0 };

  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    const ctc = calcolaCTC(mid);
    if (ctc > budgetCTC) {
      high = mid;
    } else {
      // calcolo netto con mid
      const { netto } = calcolaNetto(mid, 13, regione, comune, 0, false, 'standard', 0);
      if (netto > best.netto) best = { netto, RAL: mid };
      low = mid;
    }
  }
  return best;
}

// Impatriati: IRPEF/Addizionali su imponibile ridotto, INPS su RAL piena (anni slider, qui 1 anno a display)
function calcolaImpatriati(
  RAL: number,
  anni: number,
  conFigliMinori: boolean,
  regione: Regione,
  comune: string
): RisultatoNetto {
  const percent = conFigliMinori ? 0.4 : 0.5;
  const imponibileRidotto = Math.max(0, RAL * percent);
  const inpsLav = Math.max(0, RAL * 0.0919);
  const imponibileIrpef = Math.max(0, imponibileRidotto - inpsLav);

  const irpef = calcolaIRPEF(imponibileIrpef);
  const detLavoro = detrazioniLavoroDipendente(imponibileRidotto);

  const addRegAliq = (ADDIZIONALI_REGIONALI_2025[regione] ?? 1.5) / 100;
  const addComAliq = (ADDIZIONALI_COMUNALI_2025[comune] ?? 0.6) / 100;
  const addReg = addRegAliq * imponibileIrpef;
  const addComTot = addComAliq * imponibileIrpef;

  const nettoAnn = Math.max(0, RAL - inpsLav - irpef - addReg - addComTot + detLavoro);

  return {
    netto: nettoAnn,
    breakdown: {
      inpsLav,
      irpef,
      addReg,
      addComTot,
      detLavoro,
      detFigli: 0,
      detConiuge: 0,
      welfareEffettivo: 0,
    },
  };
}

// ===========================
// Component
// ===========================
export default function CalcoloStipendioNettoCalculator() {
  // Stato
  const [RAL, setRAL] = useState<number>(30000);
  const [mensilita, setMensilita] = useState<12 | 13 | 14>(13);
  const [regione, setRegione] = useState<Regione>('Lombardia');
  const [comune, setComune] = useState<string>('Milano');
  const [figli, setFigli] = useState<number>(0);
  const [coniuge, setConiuge] = useState<boolean>(false);
  const [contratto, setContratto] = useState<Contratto>('standard');
  const [welfare, setWelfare] = useState<number>(0);
  const [impatriatiAnni, setImpatriatiAnni] = useState<number>(1);
  const [impatriatiFigli, setImpatriatiFigli] = useState<boolean>(false);
  const [budgetCTC, setBudgetCTC] = useState<number>(40000);

  // Hydrate da querystring (share URL) — solo client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const usp = new URLSearchParams(window.location.search);
    const r = usp.get('RAL');
    const reg = usp.get('regione');
    const com = usp.get('comune');
    if (r) setRAL(Math.max(0, Number(r)));
    if (reg && (reg in ADDIZIONALI_REGIONALI_2025)) setRegione(reg as Regione);
    if (com) setComune(com);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aggiorna URL (share) — solo client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams({
      RAL: String(RAL),
      regione,
      comune,
    });
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [RAL, regione, comune]);

  const risultato = useMemo(
    () => calcolaNetto(RAL, mensilita, regione, comune, figli, coniuge, contratto, welfare),
    [RAL, mensilita, regione, comune, figli, coniuge, contratto, welfare]
  );
  const ctc = useMemo(() => calcolaCTC(RAL), [RAL]);
  const eq = useMemo(() => equalCTC(budgetCTC, regione, comune), [budgetCTC, regione, comune]);
  const imp = useMemo(
    () => calcolaImpatriati(RAL, impatriatiAnni, impatriatiFigli, regione, comune),
    [RAL, impatriatiAnni, impatriatiFigli, regione, comune]
  );

  // Export PDF (import dinamici → no errori in build/SSR se non presenti)
  const exportPDF = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Voce', 'Importo']],
      body: [
        ['RAL', fmt(RAL)],
        ['INPS Lavoratore', fmt(risultato.breakdown.inpsLav)],
        ['IRPEF', fmt(risultato.breakdown.irpef)],
        ['Addizionale Regionale', fmt(risultato.breakdown.addReg)],
        ['Addizionale Comunale', fmt(risultato.breakdown.addComTot)],
        ['Detrazioni lavoro', fmt(risultato.breakdown.detLavoro)],
        ['Detrazioni figli', fmt(risultato.breakdown.detFigli)],
        ['Detrazione coniuge', fmt(risultato.breakdown.detConiuge)],
        ['Welfare/fringe', fmt(risultato.breakdown.welfareEffettivo)],
        ['Netto annuo', fmt(risultato.netto)],
        ['Costo azienda (CTC)', fmt(ctc)],
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
    });
    doc.save('calcolo-stipendio.pdf');
  };

  // Export XLSX (import dinamico)
  const exportXLSX = async () => {
    const [{ utils, writeFile }, { saveAs }] = await Promise.all([
      import('xlsx'),
      import('file-saver'),
    ]);

    const rows = [
      { Voce: 'RAL', Importo: RAL },
      { Voce: 'INPS Lavoratore', Importo: risultato.breakdown.inpsLav },
      { Voce: 'IRPEF', Importo: risultato.breakdown.irpef },
      { Voce: 'Add. Regionale', Importo: risultato.breakdown.addReg },
      { Voce: 'Add. Comunale', Importo: risultato.breakdown.addComTot },
      { Voce: 'Detrazioni lavoro', Importo: risultato.breakdown.detLavoro },
      { Voce: 'Detrazioni figli', Importo: risultato.breakdown.detFigli },
      { Voce: 'Detrazione coniuge', Importo: risultato.breakdown.detConiuge },
      { Voce: 'Welfare/fringe', Importo: risultato.breakdown.welfareEffettivo },
      { Voce: 'Netto annuo', Importo: risultato.netto },
      { Voce: 'CTC', Importo: ctc },
    ];
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Calcolo');
    // In Next 13/14 è più affidabile scrivere su Blob e poi saveAs
    const wbout = await (async () => {
      // scrivi su array buffer
       const arr = await import('xlsx').then((X) => X.write(wb, { bookType: 'xlsx', type: 'array' }));
      return arr as ArrayBuffer;
    })();
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'calcolo-stipendio.xlsx');
  };

  // Dati per chart
  const chartData = useMemo(
    () => [
      { name: 'RAL', value: RAL },
      { name: 'Netto annuo', value: Math.max(0, risultato.netto) },
      { name: 'Costo azienda (CTC)', value: Math.max(0, ctc) },
    ],
    [RAL, risultato.netto, ctc]
  );

  // UI
  return (
    <div className="p-4 md:p-6  dark:bg-gray-900 text-gray-900 dark:text-gray-100 -xl  space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold">Calcolo Stipendio Netto</h1>
        <p className="text-sm opacity-80">Lordo↔Netto, addizionali Regione/Comune, Equal-CTC, Impatriati, Welfare, Export, Share URL.</p>
      </header>

      {/* Inputs principali */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span>RAL (€)</span>
          <input
            type="number"
            inputMode="decimal"
            className="px-3 py-2 rounded border bg-transparent"
            value={RAL}
            onChange={(e) => setRAL(Math.max(0, Number(e.target.value || 0)))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>Mensilità</span>
          <select
            className="px-3 py-2 rounded border bg-transparent"
            value={mensilita}
            onChange={(e) => setMensilita(Number(e.target.value) as 12 | 13 | 14)}
          >
            <option value={12}>12</option>
            <option value={13}>13</option>
            <option value={14}>14</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span>Regione</span>
          <select
            className="px-3 py-2 rounded border bg-transparent"
            value={regione}
            onChange={(e) => setRegione(e.target.value as Regione)}
          >
            {Object.keys(ADDIZIONALI_REGIONALI_2025).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span>Comune</span>
          <select
            className="px-3 py-2 rounded border bg-transparent"
            value={comune}
            onChange={(e) => setComune(e.target.value)}
          >
            {Object.keys(ADDIZIONALI_COMUNALI_2025).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <small className="opacity-70">Puoi estendere con dataset completo (~7900 comuni) senza cambiare codice.</small>
        </label>

        <label className="flex flex-col gap-1">
          <span>Figli a carico (n.)</span>
          <input
            type="number"
            inputMode="numeric"
            className="px-3 py-2 rounded border bg-transparent"
            value={figli}
            onChange={(e) => setFigli(Math.max(0, Math.floor(Number(e.target.value || 0))))}
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={coniuge}
            onChange={(e) => setConiuge(e.target.checked)}
          />
          <span>Coniuge a carico</span>
        </label>

        <label className="flex flex-col gap-1">
          <span>Contratto</span>
          <select
            className="px-3 py-2 rounded border bg-transparent"
            value={contratto}
            onChange={(e) => setContratto(e.target.value as Contratto)}
          >
            <option value="standard">Tempo indeterminato</option>
            <option value="apprendistato">Apprendistato</option>
            <option value="parttime">Part-time</option>
            <option value="determinato">Tempo determinato</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span>Welfare / Fringe annuale (€)</span>
          <input
            type="number"
            inputMode="decimal"
            className="px-3 py-2 rounded border bg-transparent"
            value={welfare}
            onChange={(e) => setWelfare(Math.max(0, Number(e.target.value || 0)))}
          />
          <small className="opacity-70">Applicato tetto semplificato: {figli > 0 ? '2.000€' : '1.000€'}.</small>
        </label>
      </section>

      {/* Risultati principali */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border">
          <div className="text-sm opacity-70">Netto annuo</div>
          <div className="text-2xl font-semibold">{fmt(risultato.netto)}</div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm opacity-70">Netto mensile</div>
          <div className="text-2xl font-semibold">
            {fmt(risultato.netto / mensilita)}
          </div>
        </div>
        <div className="p-4 rounded-lg border">
          <div className="text-sm opacity-70">Costo azienda (CTC)</div>
          <div className="text-2xl font-semibold">{fmt(ctc)}</div>
        </div>
      </section>

      {/* Breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border space-y-2">
          <h3 className="font-semibold">Scomposizione</h3>
          <ul className="text-sm space-y-1">
            <li>INPS lavoratore: <b>{fmt(risultato.breakdown.inpsLav)}</b></li>
            <li>IRPEF: <b>{fmt(risultato.breakdown.irpef)}</b></li>
            <li>Addizionale Regionale: <b>{fmt(risultato.breakdown.addReg)}</b></li>
            <li>Addizionale Comunale: <b>{fmt(risultato.breakdown.addComTot)}</b></li>
            <li>Detrazioni lavoro dip.: <b>{fmt(risultato.breakdown.detLavoro)}</b></li>
            <li>Detrazioni figli: <b>{fmt(risultato.breakdown.detFigli)}</b></li>
            <li>Detrazione coniuge: <b>{fmt(risultato.breakdown.detConiuge)}</b></li>
            <li>Welfare/Fringe: <b>{fmt(risultato.breakdown.welfareEffettivo)}</b></li>
          </ul>
          <div className="flex gap-2 pt-3">
            <button onClick={exportPDF} className="px-3 py-2 rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900">
              Export PDF
            </button>
            <button onClick={exportXLSX} className="px-3 py-2 rounded border">
              Export XLSX
            </button>
          </div>
        </div>

        <div className="p-4 rounded-lg border h-64">
          <NetBarChart data={chartData} />
        </div>
      </section>

      {/* Equal CTC */}
      <section className="p-4 rounded-lg border space-y-2">
        <h3 className="font-semibold">Equal-CTC (modalità HR)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <label className="flex flex-col gap-1">
            <span>Budget CTC (€)</span>
            <input
              type="number"
              inputMode="decimal"
              className="px-3 py-2 rounded border bg-transparent"
              value={budgetCTC}
              onChange={(e) => setBudgetCTC(Math.max(0, Number(e.target.value || 0)))}
            />
          </label>
          <div className="md:col-span-2 text-sm">
            Con budget <b>{fmt(budgetCTC)}</b> → RAL ottimale <b>{fmt(eq.RAL)}</b> • Netto stimato <b>{fmt(eq.netto)}</b>
          </div>
        </div>
      </section>

      {/* Impatriati */}
      <section className="p-4 rounded-lg border space-y-2">
        <h3 className="font-semibold">Regime Impatriati (v2)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <label className="flex flex-col gap-1">
            <span>Anni</span>
            <input
              type="number"
              min={1}
              max={5}
              className="px-3 py-2 rounded border bg-transparent"
              value={impatriatiAnni}
              onChange={(e) => setImpatriatiAnni(clamp(Math.floor(Number(e.target.value || 1)), 1, 5))}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={impatriatiFigli}
              onChange={(e) => setImpatriatiFigli(e.target.checked)}
            />
            <span>Con figli minori</span>
          </label>
          <div className="md:col-span-2 text-sm">
            Netto (anno 1): <b>{fmt(imp.netto)}</b> — INPS su RAL piena, IRPEF/Addizionali su imponibile ridotto ({impatriatiFigli ? '40%' : '50%'}).
          </div>
        </div>
      </section>

      {/* Note tecniche */}
      <footer className="text-xs opacity-70">
        <p>
          Modello semplificato per scopi informativi. Le aliquote e le detrazioni sono coerenti con il quadro 2025 ma possono
          variare per normativa/CCNL/settore. Per massima precisione: integra dataset completo addizionali comunali e regole
          specifiche CCNL/PA.
        </p>
      </footer>
    </div>
  );
}
