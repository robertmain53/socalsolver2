'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';

/***********************************
 * Calcolatore Convenienza Auto Elettrica vs Termica
 * Stile e layout ispirati al template "Calcolatore Tassazione per Psicologi (con ENPAP)"
 * Funzioni chiave aggiunte:
 * - Simulatore dinamico con slider (aggiornamento istantaneo)
 * - Confronto multiplo: Elettrica vs Termica vs Ibrida Plug‑in
 * - CO₂ evitata con visualizzazione in "alberi salvati/anno"
 * - Grafici TCO e ripartizione costi
 * - Sezione formule, ipotesi e fonti (E-E-A-T)
 ***********************************/

// ---- ICON & TOOLTIP ----
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// ---- JSON-LD (FAQ) ----
const FaqSchema = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Come viene stimata la convenienza tra auto elettrica e termica?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Il confronto si basa sul TCO (Total Cost of Ownership) in un orizzonte di N anni: prezzo di acquisto (meno incentivi) + energia/carburante + manutenzione + assicurazione + bollo + altri costi ricorrenti − valore residuo. I parametri sono personalizzabili e aggiornano i risultati in tempo reale.'
            }
          },
          {
            '@type': 'Question',
            name: 'Come viene calcolata la CO₂ evitata?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Si stimano le emissioni operative: elettrica (kWh × intensità CO₂ del mix elettrico) contro termica/ibrida (litri × fattore di emissione della benzina/diesel). La differenza indica la CO₂ evitata. A fini divulgativi, si converte anche in alberi equivalenti/anno.'
            }
          }
        ]
      })
    }}
  />
);

// ---- HELPERS ----
const fmtEUR = (v: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v || 0);
const fmtNUM = (v: number, d = 2) => new Intl.NumberFormat('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v || 0);

// Tipo carburante per ICE/PHEV
type Fuel = 'benzina' | 'diesel';

// ---- COMPONENTE PRINCIPALE ----
export default function AutoElettricaVsTermica() {
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // ----------------------
  // STATE (valori di default realistici ma modificabili)
  // ----------------------
  const [years, setYears] = useState(5); // orizzonte TCO
  const [kmYear, setKmYear] = useState(15000);

  // Prezzi energia
  const [homeKWhPrice, setHomeKWhPrice] = useState(0.28); // €/kWh domestico
  const [publicKWhPrice, setPublicKWhPrice] = useState(0.55); // €/kWh pubblico
  const [homeShare, setHomeShare] = useState(70); // % ricariche a casa

  // Consumi veicoli
  const [ev_kWh_100km, setEv_kWh_100km] = useState(16); // kWh/100km
  const [ice_L_100km, setIce_L_100km] = useState(6.5); // l/100km termico
  const [phev_L_100km, setPhev_L_100km] = useState(3.5); // l/100km PHEV (media reale)
  const [phev_kWh_100km, setPhev_kWh_100km] = useState(10); // kWh/100km PHEV (uso elettrico)

  // Prezzi carburante
  const [fuelType, setFuelType] = useState<Fuel>('benzina');
  const [fuelPrice, setFuelPrice] = useState(1.85); // €/l

  // Efficienza/Perdite di ricarica
  const [chargeLoss, setChargeLoss] = useState(8); // % perdite

  // Manutenzione + Assicurazione + Bollo (€/anno)
  const [maintEV, setMaintEV] = useState(350);
  const [maintICE, setMaintICE] = useState(650);
  const [maintPHEV, setMaintPHEV] = useState(550);
  const [insEV, setInsEV] = useState(500);
  const [insICE, setInsICE] = useState(600);
  const [insPHEV, setInsPHEV] = useState(580);
  const [bolloEV, setBolloEV] = useState(0); // spesso esente per 3-5 anni, poi ridotto
  const [bolloICE, setBolloICE] = useState(250);
  const [bolloPHEV, setBolloPHEV] = useState(200);

  // Prezzi acquisto e incentivi
  const [priceEV, setPriceEV] = useState(35000);
  const [priceICE, setPriceICE] = useState(25000);
  const [pricePHEV, setPricePHEV] = useState(32000);
  const [incentiveEV, setIncentiveEV] = useState(3000); // ecobonus/rottamazione
  const [incentivePHEV, setIncentivePHEV] = useState(1500);

  // Valore residuo (percentuale del prezzo iniziale)
  const [resEV, setResEV] = useState(45);
  const [resICE, setResICE] = useState(40);
  const [resPHEV, setResPHEV] = useState(42);

  // CO2 factors
  const [co2_per_kWh, setCO2_per_kWh] = useState(0.27); // kg CO2/kWh mix elettrico
  const [co2_per_l_benzina, setCO2_per_l_benzina] = useState(2.31); // kg CO2/l
  const [co2_per_l_diesel, setCO2_per_l_diesel] = useState(2.68); // kg CO2/l
  const [tree_kg_per_year, setTreeKgPerYear] = useState(21); // kg CO2 assorbiti/anno da un albero maturo (stima divulgativa)

  const priceMix_kWh = useMemo(() => (homeKWhPrice * homeShare + publicKWhPrice * (100 - homeShare)) / 100, [homeKWhPrice, publicKWhPrice, homeShare]);

  // ----------------------
  // CALCOLI CORE (istante)
  // ----------------------
  const results = useMemo(() => {
    const km = kmYear;
    const yrs = Math.max(1, years);

    // --- Consumi annuali ---
    const ev_kWh_year = (km * ev_kWh_100km) / 100 * (1 + chargeLoss / 100);
    const ice_L_year = (km * ice_L_100km) / 100;
    const phev_L_year = (km * phev_L_100km) / 100;
    const phev_kWh_year = (km * phev_kWh_100km) / 100 * (1 + chargeLoss / 100);

    // --- Costi energia/carburante ---
    const ev_energy_cost_year = ev_kWh_year * priceMix_kWh;
    const ice_fuel_cost_year = ice_L_year * fuelPrice;
    const phev_energy_cost_year = phev_kWh_year * priceMix_kWh + phev_L_year * fuelPrice;

    // --- Costi ricorrenti (manutenzione, assicurazione, bollo) ---
    const ev_recurring_year = maintEV + insEV + bolloEV;
    const ice_recurring_year = maintICE + insICE + bolloICE;
    const phev_recurring_year = maintPHEV + insPHEV + bolloPHEV;

    // --- Valore residuo ---
    const ev_residual = (priceEV - incentiveEV) * (resEV / 100);
    const ice_residual = priceICE * (resICE / 100);
    const phev_residual = (pricePHEV - incentivePHEV) * (resPHEV / 100);

    // --- TCO su orizzonte yrs ---
    const ev_tco = (priceEV - incentiveEV) + (ev_energy_cost_year + ev_recurring_year) * yrs - ev_residual;
    const ice_tco = priceICE + (ice_fuel_cost_year + ice_recurring_year) * yrs - ice_residual;
    const phev_tco = (pricePHEV - incentivePHEV) + (phev_energy_cost_year + phev_recurring_year) * yrs - phev_residual;

    // --- Emissioni annue ---
    const ice_co2_factor = fuelType === 'benzina' ? co2_per_l_benzina : co2_per_l_diesel;
    const ev_co2_year = ev_kWh_year * co2_per_kWh;
    const ice_co2_year = ice_L_year * ice_co2_factor;
    const phev_co2_year = phev_kWh_year * co2_per_kWh + phev_L_year * ice_co2_factor;

    // --- CO2 evitata vs ICE ---
    const saved_vs_ICE = Math.max(0, ice_co2_year - ev_co2_year); // kg/anno
    const trees_saved_year = tree_kg_per_year > 0 ? saved_vs_ICE / tree_kg_per_year : 0;

    // Serie TCO per grafico (anno 0..yrs)
    const tco_series: Array<{ year: number; EV: number; ICE: number; PHEV: number }> = [];
    for (let y = 0; y <= yrs; y++) {
      const ev = (priceEV - incentiveEV) + (ev_energy_cost_year + ev_recurring_year) * y - (ev_residual * (y / yrs));
      const ice = priceICE + (ice_fuel_cost_year + ice_recurring_year) * y - (ice_residual * (y / yrs));
      const phev = (pricePHEV - incentivePHEV) + (phev_energy_cost_year + phev_recurring_year) * y - (phev_residual * (y / yrs));
      tco_series.push({ year: y, EV: ev, ICE: ice, PHEV: phev });
    }

    // Ripartizione costi annui per stack chart
    const breakdownAnnual = [
      { name: 'Elettrica', Energia: ev_energy_cost_year, Ricorrenti: ev_recurring_year },
      { name: 'Termica', Energia: ice_fuel_cost_year, Ricorrenti: ice_recurring_year },
      { name: 'Ibrida PHEV', Energia: phev_energy_cost_year, Ricorrenti: phev_recurring_year }
    ];

    // CO2 chart (kg/anno)
    const co2Chart = [
      { name: 'Elettrica', CO2: ev_co2_year },
      { name: 'Termica', CO2: ice_co2_year },
      { name: 'Ibrida PHEV', CO2: phev_co2_year }
    ];

    return {
      ev_kWh_year,
      ice_L_year,
      phev_kWh_year,
      phev_L_year,
      ev_energy_cost_year,
      ice_fuel_cost_year,
      phev_energy_cost_year,
      ev_recurring_year,
      ice_recurring_year,
      phev_recurring_year,
      ev_tco,
      ice_tco,
      phev_tco,
      ev_co2_year,
      ice_co2_year,
      phev_co2_year,
      saved_vs_ICE,
      trees_saved_year,
      tco_series,
      breakdownAnnual,
      co2Chart
    };
  }, [
    years,
    kmYear,
    ev_kWh_100km,
    ice_L_100km,
    phev_L_100km,
    phev_kWh_100km,
    fuelType,
    fuelPrice,
    homeKWhPrice,
    publicKWhPrice,
    homeShare,
    chargeLoss,
    maintEV,
    maintICE,
    maintPHEV,
    insEV,
    insICE,
    insPHEV,
    bolloEV,
    bolloICE,
    bolloPHEV,
    priceEV,
    priceICE,
    pricePHEV,
    incentiveEV,
    incentivePHEV,
    resEV,
    resICE,
    resPHEV,
    co2_per_kWh,
    co2_per_l_benzina,
    co2_per_l_diesel,
    tree_kg_per_year,
    priceMix_kWh
  ]);

  // --- Azioni Rapide ---
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calcolatoreRef.current) return;
      const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('auto-elettrica-vs-termica_simulazione.pdf');
    } catch (e) {
      alert('Impossibile generare il PDF in questo ambiente.');
    }
  }, []);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = {
        slug: 'pmi-e-impresa/auto-elettrica-vs-termica',
        inputs: {
          years,
          kmYear,
          homeKWhPrice,
          publicKWhPrice,
          homeShare,
          ev_kWh_100km,
          ice_L_100km,
          phev_L_100km,
          phev_kWh_100km,
          fuelType,
          fuelPrice,
          chargeLoss,
          maintEV,
          maintICE,
          maintPHEV,
          insEV,
          insICE,
          insPHEV,
          bolloEV,
          bolloICE,
          bolloPHEV,
          priceEV,
          priceICE,
          pricePHEV,
          incentiveEV,
          incentivePHEV,
          resEV,
          resICE,
          resPHEV,
          co2_per_kWh,
          co2_per_l_benzina,
          co2_per_l_diesel,
          tree_kg_per_year
        },
        outputs: results,
        ts: Date.now()
      };
      const existingResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      const newResults = [payload, ...existingResults].slice(0, 50);
      localStorage.setItem('calc_results', JSON.stringify(newResults));
      alert('Risultato salvato con successo!');
    } catch {
      alert('Impossibile salvare il risultato.');
    }
  }, [results, years, kmYear, homeKWhPrice, publicKWhPrice, homeShare, ev_kWh_100km, ice_L_100km, phev_L_100km, phev_kWh_100km, fuelType, fuelPrice, chargeLoss, maintEV, maintICE, maintPHEV, insEV, insICE, insPHEV, bolloEV, bolloICE, bolloPHEV, priceEV, priceICE, pricePHEV, incentiveEV, incentivePHEV, resEV, resICE, resPHEV, co2_per_kWh, co2_per_l_benzina, co2_per_l_diesel, tree_kg_per_year]);

  const resetAll = useCallback(() => {
    setYears(5);
    setKmYear(15000);
    setHomeKWhPrice(0.28);
    setPublicKWhPrice(0.55);
    setHomeShare(70);
    setEv_kWh_100km(16);
    setIce_L_100km(6.5);
    setPhev_L_100km(3.5);
    setPhev_kWh_100km(10);
    setFuelType('benzina');
    setFuelPrice(1.85);
    setChargeLoss(8);
    setMaintEV(350);
    setMaintICE(650);
    setMaintPHEV(550);
    setInsEV(500);
    setInsICE(600);
    setInsPHEV(580);
    setBolloEV(0);
    setBolloICE(250);
    setBolloPHEV(200);
    setPriceEV(35000);
    setPriceICE(25000);
    setPricePHEV(32000);
    setIncentiveEV(3000);
    setIncentivePHEV(1500);
    setResEV(45);
    setResICE(40);
    setResPHEV(42);
    setCO2_per_kWh(0.27);
    setCO2_per_l_benzina(2.31);
    setCO2_per_l_diesel(2.68);
    setTreeKgPerYear(21);
  }, []);

  // ---- UI HELPER ----
  const Range = ({ id, label, value, min, max, step, onChange, tooltip }: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; tooltip?: string }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
        {label}
        {tooltip && (
          <Tooltip text={tooltip}>
            <span className="ml-2 cursor-help"><InfoIcon /></span>
          </Tooltip>
        )}
      </label>
      <div className="flex items-center gap-3">
        <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
        <div className="w-24 text-right text-sm text-gray-700">{fmtNUM(value)}</div>
      </div>
    </div>
  );

  const NumberField = ({ id, label, value, onChange, step = 1, min = 0, suffix, tooltip }: { id: string; label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; suffix?: string; tooltip?: string }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
        {label}
        {tooltip && (
          <Tooltip text={tooltip}>
            <span className="ml-2 cursor-help"><InfoIcon /></span>
          </Tooltip>
        )}
      </label>
      <div className="flex items-center gap-2">
        <input id={id} type="number" step={step} min={min} value={isFinite(value) ? value : 0} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
    </div>
  );

  const Select = ({ id, label, value, onChange, options, tooltip }: { id: string; label: string; value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }>; tooltip?: string }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
        {label}
        {tooltip && (
          <Tooltip text={tooltip}>
            <span className="ml-2 cursor-help"><InfoIcon /></span>
          </Tooltip>
        )}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  // ---- LAYOUT ----
  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">Calcolatore Convenienza Auto Elettrica vs. Termica</h1>
            <p className="text-gray-600 mb-4">Simula il TCO (Total Cost of Ownership) e le emissioni su un orizzonte temporale, confrontando <strong>Elettrica</strong>, <strong>Termica</strong> e <strong>Ibrida Plug‑in</strong>. I risultati si aggiornano in tempo reale.</p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> stime indicative a scopo informativo. Il risultato dipende da abitudini di guida, prezzi energia/carburanti e politiche locali (incentivi, esenzioni bollo). Verificare sempre le condizioni aggiornate.
            </div>

            {/* INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {/* Orizzonte e percorrenza */}
              <Range id="years" label="Orizzonte di possesso (anni)" value={years} min={1} max={10} step={1} onChange={setYears} tooltip="Numero di anni considerati per il TCO." />
              <NumberField id="km" label="Percorrenza annua" value={kmYear} onChange={setKmYear} step={500} suffix="km/anno" tooltip="Km medi percorsi in un anno." />

              {/* Energia e ricarica */}
              <NumberField id="homePrice" label="Prezzo energia domestica" value={homeKWhPrice} onChange={setHomeKWhPrice} step={0.01} suffix="€/kWh" tooltip="Prezzo lordo stimato per kWh in casa." />
              <NumberField id="pubPrice" label="Prezzo energia pubblica" value={publicKWhPrice} onChange={setPublicKWhPrice} step={0.01} suffix="€/kWh" tooltip="Prezzo medio kWh in ricarica pubblica." />
              <Range id="homeShare" label="Quota ricarica a casa" value={homeShare} min={0} max={100} step={1} onChange={setHomeShare} tooltip="Percentuale di ricariche effettuate in ambito domestico." />
              <Range id="loss" label="Perdite di ricarica" value={chargeLoss} min={0} max={20} step={1} onChange={setChargeLoss} tooltip="Perdite dal contatore alla batteria." />

              {/* Consumi */}
              <NumberField id="evCons" label="Consumo EV" value={ev_kWh_100km} onChange={setEv_kWh_100km} step={0.5} suffix="kWh/100 km" />
              <NumberField id="iceCons" label="Consumo Termica" value={ice_L_100km} onChange={setIce_L_100km} step={0.1} suffix="l/100 km" />
              <NumberField id="phevL" label="Consumo PHEV (benzina/diesel)" value={phev_L_100km} onChange={setPhev_L_100km} step={0.1} suffix="l/100 km" />
              <NumberField id="phevK" label="Consumo PHEV (elettrico)" value={phev_kWh_100km} onChange={setPhev_kWh_100km} step={0.5} suffix="kWh/100 km" />

              {/* Carburante */}
              <Select id="fuelType" label="Tipo carburante" value={fuelType} onChange={(v) => setFuelType(v as Fuel)} options={[{ label: 'Benzina', value: 'benzina' }, { label: 'Diesel', value: 'diesel' }]} />
              <NumberField id="fuelPrice" label="Prezzo carburante" value={fuelPrice} onChange={setFuelPrice} step={0.01} suffix="€/l" />

              {/* Costi ricorrenti */}
              <NumberField id="maintEV" label="Manutenzione EV" value={maintEV} onChange={setMaintEV} step={10} suffix="€/anno" />
              <NumberField id="maintICE" label="Manutenzione Termica" value={maintICE} onChange={setMaintICE} step={10} suffix="€/anno" />
              <NumberField id="maintPHEV" label="Manutenzione PHEV" value={maintPHEV} onChange={setMaintPHEV} step={10} suffix="€/anno" />
              <NumberField id="insEV" label="Assicurazione EV" value={insEV} onChange={setInsEV} step={10} suffix="€/anno" />
              <NumberField id="insICE" label="Assicurazione Termica" value={insICE} onChange={setInsICE} step={10} suffix="€/anno" />
              <NumberField id="insPHEV" label="Assicurazione PHEV" value={insPHEV} onChange={setInsPHEV} step={10} suffix="€/anno" />
              <NumberField id="bolloEV" label="Bollo EV" value={bolloEV} onChange={setBolloEV} step={10} suffix="€/anno" />
              <NumberField id="bolloICE" label="Bollo Termica" value={bolloICE} onChange={setBolloICE} step={10} suffix="€/anno" />
              <NumberField id="bolloPHEV" label="Bollo PHEV" value={bolloPHEV} onChange={setBolloPHEV} step={10} suffix="€/anno" />

              {/* Prezzi e incentivi */}
              <NumberField id="priceEV" label="Prezzo EV" value={priceEV} onChange={setPriceEV} step={500} suffix="€" />
              <NumberField id="priceICE" label="Prezzo Termica" value={priceICE} onChange={setPriceICE} step={500} suffix="€" />
              <NumberField id="pricePHEV" label="Prezzo PHEV" value={pricePHEV} onChange={setPricePHEV} step={500} suffix="€" />
              <NumberField id="incEV" label="Incentivo EV" value={incentiveEV} onChange={setIncentiveEV} step={100} suffix="€" />
              <NumberField id="incPHEV" label="Incentivo PHEV" value={incentivePHEV} onChange={setIncentivePHEV} step={100} suffix="€" />

              {/* Valori residui */}
              <Range id="resEV" label="Valore residuo EV" value={resEV} min={20} max={60} step={1} onChange={setResEV} tooltip="% del prezzo (al netto incentivi) al termine dell'orizzonte." />
              <Range id="resICE" label="Valore residuo Termica" value={resICE} min={20} max={60} step={1} onChange={setResICE} />
              <Range id="resPHEV" label="Valore residuo PHEV" value={resPHEV} min={20} max={60} step={1} onChange={setResPHEV} />

              {/* CO2 */}
              <NumberField id="co2kwh" label="CO₂ mix elettrico" value={co2_per_kWh} onChange={setCO2_per_kWh} step={0.01} suffix="kg/kWh" />
              <NumberField id="co2benz" label="CO₂ benzina" value={co2_per_l_benzina} onChange={setCO2_per_l_benzina} step={0.01} suffix="kg/l" />
              <NumberField id="co2dies" label="CO₂ diesel" value={co2_per_l_diesel} onChange={setCO2_per_l_diesel} step={0.01} suffix="kg/l" />
              <NumberField id="treekg" label="Assorbimento albero" value={tree_kg_per_year} onChange={setTreeKgPerYear} step={1} suffix="kg CO₂/anno" tooltip="Parametro divulgativo per la conversione in alberi equivalenti." />
            </div>

            {/* RISULTATI */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Riepilogo e Confronto</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                  <div className="text-sm font-medium text-gray-700">TCO Elettrica ({years} anni)</div>
                  <div className="text-2xl font-bold text-indigo-700">{isClient ? fmtEUR(results.ev_tco) : '…'}</div>
                </div>
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                  <div className="text-sm font-medium text-gray-700">TCO Termica ({years} anni)</div>
                  <div className="text-2xl font-bold text-emerald-700">{isClient ? fmtEUR(results.ice_tco) : '…'}</div>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <div className="text-sm font-medium text-gray-700">TCO Ibrida PHEV ({years} anni)</div>
                  <div className="text-2xl font-bold text-amber-700">{isClient ? fmtEUR(results.phev_tco) : '…'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Costo energia EV (annuo)</div>
                  <div className="text-xl font-semibold">{isClient ? fmtEUR(results.ev_energy_cost_year) : '…'}</div>
                </div>
                <div className="bg-white border p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Costo carburante Termica (annuo)</div>
                  <div className="text-xl font-semibold">{isClient ? fmtEUR(results.ice_fuel_cost_year) : '…'}</div>
                </div>
                <div className="bg-white border p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Costo energia+carburante PHEV (annuo)</div>
                  <div className="text-xl font-semibold">{isClient ? fmtEUR(results.phev_energy_cost_year) : '…'}</div>
                </div>
              </div>

              {/* CO2 e Alberi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border p-4 rounded-lg">
                  <div className="text-sm text-gray-600">CO₂ EV (kg/anno)</div>
                  <div className="text-xl font-semibold">{isClient ? fmtNUM(results.ev_co2_year) : '…'}</div>
                </div>
                <div className="bg-white border p-4 rounded-lg">
                  <div className="text-sm text-gray-600">CO₂ Termica (kg/anno)</div>
                  <div className="text-xl font-semibold">{isClient ? fmtNUM(results.ice_co2_year) : '…'}</div>
                </div>
                <div className="bg-white border p-4 rounded-lg">
                  <div className="text-sm text-gray-600">CO₂ evitata vs Termica (kg/anno)</div>
                  <div className="text-xl font-semibold">{isClient ? fmtNUM(results.saved_vs_ICE) : '…'}</div>
                  <div className="text-xs text-emerald-700 mt-1">≈ {isClient ? fmtNUM(results.trees_saved_year) : '…'} alberi/anno 🌳</div>
                </div>
              </div>

              {/* Grafico ripartizione costi annui */}
              <h3 className="text-lg font-semibold text-gray-700 mt-6">Ripartizione costi annui</h3>
              <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.breakdownAnnual}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip formatter={(v: any) => fmtEUR(v as number)} />
                      <Legend />
                      <Bar dataKey="Energia" stackId="a" />
                      <Bar dataKey="Ricorrenti" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Grafico TCO nel tempo */}
              <h3 className="text-lg font-semibold text-gray-700 mt-6">TCO nel tempo</h3>
              <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.tco_series}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <ChartTooltip formatter={(v: any) => fmtEUR(v as number)} />
                      <Legend />
                      <Line type="monotone" dataKey="EV" />
                      <Line type="monotone" dataKey="ICE" />
                      <Line type="monotone" dataKey="PHEV" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Grafico CO2 */}
              <h3 className="text-lg font-semibold text-gray-700 mt-6">Emissioni operative (kg CO₂/anno)</h3>
              <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.co2Chart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip formatter={(v: any) => `${fmtNUM(v as number)} kg`} />
                      <Legend />
                      <Bar dataKey="CO2" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Formulae & Note */}
          <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-700">Formule e Ipotesi</h3>
            <div className="text-xs text-gray-600 mt-2 space-y-2">
              <p><strong>TCO</strong> = Prezzo iniziale − Incentivi + (Costi energia/carburante + Ricorrenti) × anni − Valore residuo</p>
              <p><strong>Consumo EV annuo</strong> = km_annui × (kWh/100km) ÷ 100 × (1 + perdite)</p>
              <p><strong>Consumo ICE annuo</strong> = km_annui × (l/100km) ÷ 100</p>
              <p><strong>Consumo PHEV annuo</strong> = kWh_annui (elettrico) + litri_annui (termico)</p>
              <p><strong>CO₂ EV</strong> = kWh_annui × fattore_CO₂_mix_elettrico</p>
              <p><strong>CO₂ ICE/PHEV (parte termica)</strong> = litri_annui × fattore_CO₂_carburante</p>
              <p><strong>Alberi equivalenti/anno</strong> = CO₂ evitata / (kg CO₂ assorbiti per albero/anno)</p>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
              <button onClick={resetAll} className="col-span-2 w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida all'uso</h2>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2">
              <li>Regola gli <strong>slider</strong> e i campi numerici per personalizzare il tuo scenario.</li>
              <li>Confronta i <strong>costi totali</strong> e le <strong>emissioni</strong> dei tre powertrain.</li>
              <li>La conversione in <strong>alberi/anno</strong> ha valore divulgativo.</li>
            </ul>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>Parametri CO₂ carburanti: letteratura tecnica (es. ~2.31 kg/l benzina; ~2.68 kg/l diesel).</li>
              <li>Intensità CO₂ mix elettrico: valori medi nazionali; personalizzabile dall'utente.</li>
              <li>Politiche locali (bollo/esenzioni/incentivi): verificare normative regionali/annuali.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
