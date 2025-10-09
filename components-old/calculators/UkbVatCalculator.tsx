'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

// ============== UI bits ==============
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <span className="relative inline-flex items-center group">
    {children}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
      {text}
    </span>
  </span>
);

// ============== Types & helpers ==============
type PriceType = 'net' | 'gross';
type RoundingMode = 'per_line' | 'on_total';

type Row = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  priceType: PriceType;
  vatRate: number;     // e.g. 0.20
  discountPct: number; // 0..100
  rc?: boolean;        // reverse charge on this line
};

const GBP = (v: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
    .format(Number.isFinite(v) ? v : 0);

const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;

// FRS preset (categorie comuni) — valori indicativi
// NB: applicheremo opzionalmente lo sconto -1% “first year” sull'aliquota scelta
const FRS_PRESETS: { key: string; label: string; rate: number }[] = [
  { key: 'it_consultancy', label: 'IT consultancy / Computer services', rate: 0.145 },
  { key: 'accountancy', label: 'Accountancy / Book-keeping', rate: 0.145 },
  { key: 'advertising', label: 'Advertising businesses', rate: 0.11 },
  { key: 'photography', label: 'Photography', rate: 0.11 },
  { key: 'hairdressing', label: 'Hairdressing / Beauty', rate: 0.13 },
  { key: 'hotels', label: 'Hotels & accommodation', rate: 0.105 },
  { key: 'pubs', label: 'Pubs', rate: 0.065 },
  { key: 'retail_non_food', label: 'Retailers (non-food)', rate: 0.075 },
  { key: 'catering', label: 'Catering / Restaurants (general)', rate: 0.125 },
  { key: 'other', label: 'Any other activity (not listed elsewhere)', rate: 0.12 },
];

// ============== Component ==============
const UkbVatCalculator: React.FC = () => {
  // hydration-safe
  const [isClient, setIsClient] = useState(false);
  const [now, setNow] = useState<string>('');
  useEffect(() => { setIsClient(true); setNow(new Date().toLocaleString('en-GB')); }, []);

  // PDF
  const pdfRef = useRef<HTMLDivElement>(null);

  // global options
  const [roundingMode, setRoundingMode] = useState<RoundingMode>('per_line');
  const [reverseChargeAll, setReverseChargeAll] = useState(false);

  // FRS
  const [frsEnabled, setFrsEnabled] = useState<boolean>(false);
  const [frsPresetKey, setFrsPresetKey] = useState<string>('it_consultancy');
  const [frsFirstYearMinus1, setFrsFirstYearMinus1] = useState<boolean>(false);
  const [frsCustomPct, setFrsCustomPct] = useState<string>(''); // as percent string, e.g. "12.5"

  const frsPresetRate = useMemo(() => {
    const found = FRS_PRESETS.find(p => p.key === frsPresetKey);
    return found ? found.rate : 0.12;
  }, [frsPresetKey]);

  const frsBaseRate = useMemo(() => {
    // priority: custom > preset
    if (frsCustomPct !== '' && !Number.isNaN(Number(frsCustomPct))) {
      return Math.max(Number(frsCustomPct) / 100, 0);
    }
    return frsPresetRate;
  }, [frsCustomPct, frsPresetRate]);

  const frsEffectiveRate = useMemo(() => {
    // -1% "first year" ding on the percentage (absolute: 1 percentage point)
    if (!frsFirstYearMinus1) return frsBaseRate;
    return Math.max(frsBaseRate - 0.01, 0);
  }, [frsBaseRate, frsFirstYearMinus1]);

  // pro-forma header (supplier / customer)
  const [supplierName, setSupplierName] = useState('');
  const [supplierVat, setSupplierVat] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerVat, setCustomerVat] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState(''); // yyyy-mm-dd

  // rows
  const [rows, setRows] = useState<Row[]>([
    { id: 'r1', description: 'Consulting services', qty: 1, unitPrice: 100, priceType: 'net', vatRate: 0.20, discountPct: 0, rc: false },
  ]);

  // --------- Row ops ---------
  const addRow = () => {
    setRows(prev => [
      ...prev,
      { id: `r_${Date.now()}`, description: '', qty: 1, unitPrice: 0, priceType: 'net', vatRate: 0.20, discountPct: 0, rc: false }
    ]);
  };
  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const updateRow = (id: string, patch: Partial<Row>) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  const clearAll = () => setRows([]);

  // --------- Line calcs (with per-line RC + global RC) ---------
  const lineCalcs = useMemo(() => {
    return rows.map(r => {
      const qty = r.qty > 0 ? r.qty : 0;
      const rate = r.vatRate >= 0 ? r.vatRate : 0;
      const disc = Math.min(Math.max(r.discountPct, 0), 100) / 100;

      let net: number, vat: number, gross: number;
      if (r.priceType === 'net') {
        const unitNet = r.unitPrice * (1 - disc);
        net = unitNet * qty;
        vat = net * rate;
        gross = net + vat;
      } else {
        const unitGross = r.unitPrice * (1 - disc);
        gross = unitGross * qty;
        net = gross / (1 + rate);
        vat = gross - net;
      }

      // reverse charge handling: if global RC OR line RC -> no VAT charged on that line
      if (reverseChargeAll || r.rc) {
        vat = 0;
        gross = net; // since no VAT is added
      }

      return { id: r.id, net, vat, gross };
    });
  }, [rows, reverseChargeAll]);

  const totals = useMemo(() => {
    const sumField = (f: 'net'|'vat'|'gross') =>
      lineCalcs.reduce((acc, l) => acc + (roundingMode === 'per_line' ? round2(l[f]) : l[f]), 0);

    const net = sumField('net');
    const vat = sumField('vat'); // already 0 for RC lines/global RC
    const gross = sumField('gross');

    return { net: round2(net), vat: round2(vat), gross: round2(gross) };
  }, [lineCalcs, roundingMode]);

  // FRS amount due (if enabled): calculated on VAT-inclusive turnover (gross)
  const frsVatDue = useMemo(
    () => (frsEnabled ? round2(totals.gross * frsEffectiveRate) : null),
    [frsEnabled, totals.gross, frsEffectiveRate]
  );

  // --------- URL share (encode/decode) ---------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get('state');
    if (s) {
      try {
        const parsed = JSON.parse(atob(s));
        if (parsed.rows) setRows(parsed.rows);
        if (parsed.roundingMode) setRoundingMode(parsed.roundingMode);
        if (typeof parsed.reverseChargeAll === 'boolean') setReverseChargeAll(parsed.reverseChargeAll);

        if (typeof parsed.frsEnabled === 'boolean') setFrsEnabled(parsed.frsEnabled);
        if (typeof parsed.frsPresetKey === 'string') setFrsPresetKey(parsed.frsPresetKey);
        if (typeof parsed.frsFirstYearMinus1 === 'boolean') setFrsFirstYearMinus1(parsed.frsFirstYearMinus1);
        if (typeof parsed.frsCustomPct === 'string') setFrsCustomPct(parsed.frsCustomPct);

        setSupplierName(parsed.supplierName ?? '');
        setSupplierVat(parsed.supplierVat ?? '');
        setSupplierAddress(parsed.supplierAddress ?? '');
        setCustomerName(parsed.customerName ?? '');
        setCustomerVat(parsed.customerVat ?? '');
        setCustomerAddress(parsed.customerAddress ?? '');
        setDocNumber(parsed.docNumber ?? '');
        setIssueDate(parsed.issueDate ?? '');
      } catch { /* ignore malformed */ }
    }
  }, []);

  const copyUrl = () => {
    const payload = {
      rows, roundingMode, reverseChargeAll,
      frsEnabled, frsPresetKey, frsFirstYearMinus1, frsCustomPct,
      supplierName, supplierVat, supplierAddress,
      customerName, customerVat, customerAddress,
      docNumber, issueDate
    };
    const base64 = btoa(JSON.stringify(payload));
    const url = `${window.location.origin}${window.location.pathname}?state=${base64}`;
    navigator.clipboard.writeText(url);
    alert('Sharable URL copied to clipboard!');
  };

  // --------- CSV / XLSX ---------
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `uk-vat-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (file: File) => {
    const text = await file.text();
    const wb = XLSX.read(text, { type: 'string' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<any>(ws);
    const mapped: Row[] = json.map((r: any, i: number) => ({
      id: r.id ? String(r.id) : `r${i}`,
      description: String(r.description ?? ''),
      qty: Number(r.qty ?? 0),
      unitPrice: Number(r.unitPrice ?? 0),
      priceType: (r.priceType === 'gross' ? 'gross' : 'net') as PriceType,
      vatRate: Number(r.vatRate ?? 0),
      discountPct: Number(r.discountPct ?? 0),
      rc: Boolean(r.rc ?? false),
    }));
    setRows(mapped);
  };

  const handleExportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VAT');
    XLSX.writeFile(wb, 'uk-vat.xlsx');
  };

  const handleImportXLSX = async (file: File) => {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<any>(ws);
    const mapped: Row[] = json.map((r: any, i: number) => ({
      id: r.id ? String(r.id) : `r${i}`,
      description: String(r.description ?? ''),
      qty: Number(r.qty ?? 0),
      unitPrice: Number(r.unitPrice ?? 0),
      priceType: (r.priceType === 'gross' ? 'gross' : 'net') as PriceType,
      vatRate: Number(r.vatRate ?? 0),
      discountPct: Number(r.discountPct ?? 0),
      rc: Boolean(r.rc ?? false),
    }));
    setRows(mapped);
  };

  // --------- Local scenarios ---------
  type SavedScenario = {
    name: string;
    rows: Row[];
    roundingMode: RoundingMode;
    reverseChargeAll: boolean;
    frsEnabled: boolean;
    frsPresetKey: string;
    frsFirstYearMinus1: boolean;
    frsCustomPct: string;
    supplierName: string;
    supplierVat: string;
    supplierAddress: string;
    customerName: string;
    customerVat: string;
    customerAddress: string;
    docNumber: string;
    issueDate: string;
    ts: number;
  };

  const [scenarioName, setScenarioName] = useState('');
  const [saved, setSaved] = useState<SavedScenario[]>([]);

  useEffect(() => {
    if (!isClient) return;
    try {
      const raw = localStorage.getItem('uk_vat_calc_scenarios') || '[]';
      setSaved(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [isClient]);

  const persist = (list: SavedScenario[]) => {
    setSaved(list);
    try {
      localStorage.setItem('uk_vat_calc_scenarios', JSON.stringify(list.slice(0, 100)));
    } catch { /* ignore */ }
  };

  const saveScenario = () => {
    const name = scenarioName.trim() || `Scenario ${new Date().toLocaleString('en-GB')}`;
    const entry: SavedScenario = {
      name, rows, roundingMode, reverseChargeAll,
      frsEnabled, frsPresetKey, frsFirstYearMinus1, frsCustomPct,
      supplierName, supplierVat, supplierAddress,
      customerName, customerVat, customerAddress,
      docNumber, issueDate,
      ts: Date.now()
    };
    const list = [entry, ...saved.filter(s => s.name !== name)];
    persist(list);
    alert('Scenario saved.');
  };

  const loadScenario = (s: SavedScenario) => {
    setRows(s.rows);
    setRoundingMode(s.roundingMode);
    setReverseChargeAll(s.reverseChargeAll);
    setFrsEnabled(s.frsEnabled);
    setFrsPresetKey(s.frsPresetKey);
    setFrsFirstYearMinus1(s.frsFirstYearMinus1);
    setFrsCustomPct(s.frsCustomPct);
    setSupplierName(s.supplierName);
    setSupplierVat(s.supplierVat);
    setSupplierAddress(s.supplierAddress);
    setCustomerName(s.customerName);
    setCustomerVat(s.customerVat);
    setCustomerAddress(s.customerAddress);
    setDocNumber(s.docNumber);
    setIssueDate(s.issueDate);
  };

  const deleteScenario = (name: string) => {
    persist(saved.filter(s => s.name !== name));
  };

  // --------- PDF export ---------
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDFmod = (await import('jspdf')).default;
      if (!pdfRef.current) return;
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, useCORS: true, windowWidth: pdfRef.current.scrollWidth
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDFmod({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const ratio = canvas.width / canvas.height;
      const imgWidth = pageWidth;
      const imgHeight = imgWidth / ratio;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('uk-vat-proforma.pdf');
    } catch {
      alert('PDF export not available in this environment.');
    }
  }, []);

  // ============== UI ==============
  return (
    <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">UK VAT Calculator — Multi-line</h1>
            <p className="text-gray-600 text-sm md:text-base">
              Edit rates, per-line Reverse Charge, and compare Standard vs FRS (with first-year -1%).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={copyUrl} className="px-3 py-2 border rounded hover:bg-gray-50 text-sm">Copy URL</button>
          </div>
        </header>

        {/* Pro-forma header inputs */}
        <section className="bg-white border rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Pro-forma header</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Supplier</h3>
              <input className="border rounded px-3 py-2 w-full" placeholder="Supplier name"
                     value={supplierName} onChange={e=>setSupplierName(e.target.value)} />
              <input className="border rounded px-3 py-2 w-full" placeholder="Supplier VAT no."
                     value={supplierVat} onChange={e=>setSupplierVat(e.target.value)} />
              <textarea className="border rounded px-3 py-2 w-full" rows={3} placeholder="Supplier address"
                        value={supplierAddress} onChange={e=>setSupplierAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Customer</h3>
              <input className="border rounded px-3 py-2 w-full" placeholder="Customer name"
                     value={customerName} onChange={e=>setCustomerName(e.target.value)} />
              <input className="border rounded px-3 py-2 w-full" placeholder="Customer VAT no."
                     value={customerVat} onChange={e=>setCustomerVat(e.target.value)} />
              <textarea className="border rounded px-3 py-2 w-full" rows={3} placeholder="Customer address"
                        value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="border rounded px-3 py-2 w-full" placeholder="Document number"
                   value={docNumber} onChange={e=>setDocNumber(e.target.value)} />
            <input className="border rounded px-3 py-2 w-full" type="date"
                   value={issueDate} onChange={e=>setIssueDate(e.target.value)} />
            <div className="text-xs text-gray-500 flex items-center">Generated: {now || '…'}</div>
          </div>
        </section>

        {/* Global options */}
        <section className="bg-white border rounded-lg p-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="font-medium text-sm">Rounding</span>
            <Tooltip text="Per line: arrotonda ogni riga a 2 decimali. On totals: somma precise e arrotonda solo i totali.">
              <span><InfoIcon /></span>
            </Tooltip>
            <select
              value={roundingMode}
              onChange={e => setRoundingMode(e.target.value as RoundingMode)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="per_line">Per line</option>
              <option value="on_total">On totals</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={reverseChargeAll} onChange={e => setReverseChargeAll(e.target.checked)} />
            <span className="text-sm">Reverse charge (global)</span>
          </label>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={frsEnabled} onChange={e=>setFrsEnabled(e.target.checked)} />
              <span className="text-sm font-medium">FRS compare</span>
            </label>
            <select
              value={frsPresetKey}
              onChange={e=>setFrsPresetKey(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              disabled={!frsEnabled}
              title="FRS preset category"
            >
              {FRS_PRESETS.map(p => (
                <option key={p.key} value={p.key}>{p.label} ({(p.rate*100).toFixed(1)}%)</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-sm">
              <span>Custom %</span>
              <input
                type="number" step="0.1" inputMode="decimal"
                className="border rounded px-2 py-1 w-20"
                value={frsCustomPct}
                onChange={e=>setFrsCustomPct(e.target.value)}
                disabled={!frsEnabled}
                title="Override preset (percent)"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={frsFirstYearMinus1}
                     onChange={e=>setFrsFirstYearMinus1(e.target.checked)} disabled={!frsEnabled} />
              <span>First year: -1%</span>
            </label>
            {frsEnabled && (
              <div className="text-sm text-gray-700">
                Effective FRS: <strong>{(frsEffectiveRate*100).toFixed(1)}%</strong>
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <section className="bg-white border rounded-lg p-4 flex flex-wrap gap-3">
          <button onClick={addRow} className="px-3 py-2 border rounded hover:bg-gray-50">+ Add row</button>
          <button onClick={clearAll} className="px-3 py-2 border rounded hover:bg-red-50 text-red-600">Clear</button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (!f) return;
              (async () => {
                try {
                  if (f.name.toLowerCase().endsWith('.csv')) await handleImportCSV(f);
                  else await handleImportXLSX(f);
                } finally {
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
              })();
            }}
          />
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 border rounded">Import</button>
          <button onClick={handleExportCSV} className="px-3 py-2 border rounded">Export CSV</button>
          <button onClick={handleExportXLSX} className="px-3 py-2 border rounded">Export XLSX</button>
          <button onClick={handleExportPDF} className="px-3 py-2 border rounded">Export PDF</button>
          <button onClick={saveScenario} className="px-3 py-2 border rounded">Save scenario</button>
        </section>

        {/* Table */}
        <section className="bg-white border rounded-lg p-4 overflow-x-auto">
          <table className="min-w-[1040px] w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Unit price</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">VAT rate</th>
                <th className="p-2 text-right">Disc%</th>
                <th className="p-2 text-center">RC</th>
                <th className="p-2 text-right">Line Net</th>
                <th className="p-2 text-right">Line VAT</th>
                <th className="p-2 text-right">Line Gross</th>
                <th className="p-2 text-center">—</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-4 text-center text-gray-500">No rows. Add one to start.</td>
                </tr>
              )}
              {rows.map((r, idx) => {
                const lc = lineCalcs[idx] || { net: 0, vat: 0, gross: 0 };
                const net = roundingMode === 'per_line' ? round2(lc.net) : lc.net;
                const vat = roundingMode === 'per_line' ? round2(lc.vat) : lc.vat;
                const gross = roundingMode === 'per_line' ? round2(lc.gross) : lc.gross;

                return (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-2">
                      <input
                        value={r.description}
                        onChange={e => updateRow(r.id, { description: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number" min={0} step={1}
                        value={r.qty}
                        onChange={e => updateRow(r.id, { qty: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className="w-24 border rounded px-2 py-1 text-right"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number" min={0} step="0.01"
                        value={r.unitPrice}
                        onChange={e => updateRow(r.id, { unitPrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className="w-28 border rounded px-2 py-1 text-right"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={r.priceType}
                        onChange={e => updateRow(r.id, { priceType: e.target.value as PriceType })}
                        className="border rounded px-2 py-1"
                      >
                        <option value="net">Net</option>
                        <option value="gross">Gross</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number" step="0.01" inputMode="decimal"
                          value={r.vatRate}
                          onChange={e => updateRow(r.id, { vatRate: e.target.value === '' ? 0 : Number(e.target.value) })}
                          className="w-24 border rounded px-2 py-1 text-right"
                          title="VAT rate as decimal (0.20 = 20%)"
                        />
                        <span className="text-xs text-gray-500 w-12 text-right">{(r.vatRate * 100).toFixed(1)}%</span>
                        <div className="flex gap-1">
                          {[0, 0.05, 0.20].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => updateRow(r.id, { vatRate: v })}
                              className="px-1 border rounded text-xs hover:bg-gray-50"
                              title={`Set ${v * 100}%`}
                            >
                              {(v * 100).toFixed(0)}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number" min={0} max={100} step="0.1"
                        value={r.discountPct}
                        onChange={e => updateRow(r.id, { discountPct: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className="w-20 border rounded px-2 py-1 text-right"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(r.rc)}
                        onChange={e => updateRow(r.id, { rc: e.target.checked })}
                        title="Reverse charge on this line"
                      />
                    </td>
                    <td className="p-2 text-right font-medium">{isClient ? GBP(net) : '…'}</td>
                    <td className="p-2 text-right font-medium">{isClient ? (r.rc || reverseChargeAll ? '—' : GBP(vat)) : '…'}</td>
                    <td className="p-2 text-right font-medium">{isClient ? GBP(gross) : '…'}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeRow(r.id)}
                        className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                        aria-label="Remove row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="p-2" colSpan={7}>
                  <span className="text-sm text-gray-600">
                    Totals ({roundingMode === 'per_line' ? 'rounded per line' : 'rounded on totals'})
                    {reverseChargeAll && ' — Global Reverse charge active'}
                  </span>
                </td>
                <td className="p-2 text-right font-semibold">{isClient ? GBP(totals.net) : '…'}</td>
                <td className="p-2 text-right font-semibold">{isClient ? (reverseChargeAll ? '—' : GBP(totals.vat)) : '…'}</td>
                <td className="p-2 text-right font-semibold">{isClient ? GBP(totals.gross) : '…'}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Save / Load (local) */}
        <section className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-gray-800 mb-2">Save scenarios (local)</h2>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              className="border rounded px-3 py-2 w-full md:w-80"
              placeholder="Scenario name (e.g., Client A — April)"
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
            />
            <button onClick={saveScenario} className="px-3 py-2 border rounded hover:bg-gray-50">Save</button>
          </div>
          <div className="mt-4">
            {saved.length === 0 ? (
              <p className="text-sm text-gray-500">No saved scenarios yet.</p>
            ) : (
              <ul className="divide-y">
                {saved.map(s => (
                  <li key={s.ts} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">{new Date(s.ts).toLocaleString('en-GB')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => loadScenario(s)} className="px-2 py-1 border rounded hover:bg-gray-50 text-sm">Load</button>
                      <button onClick={() => deleteScenario(s.name)} className="px-2 py-1 border rounded hover:bg-red-50 text-red-600 text-sm">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* PDF (pro-forma layout) */}
        <section ref={pdfRef} className="bg-white border rounded-lg p-6">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Pro-forma Invoice / Calculation Summary</h2>
            <div className="text-xs text-gray-500">Generated: {now || '…'}</div>
          </div>

          {/* Header block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded p-3">
              <div className="text-sm font-semibold text-gray-700 mb-2">Supplier</div>
              <div className="text-sm text-gray-800">{supplierName || '—'}</div>
              <div className="text-xs text-gray-600">VAT: {supplierVat || '—'}</div>
              <div className="text-xs text-gray-600 whitespace-pre-line mt-1">{supplierAddress || '—'}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm font-semibold text-gray-700 mb-2">Customer</div>
              <div className="text-sm text-gray-800">{customerName || '—'}</div>
              <div className="text-xs text-gray-600">VAT: {customerVat || '—'}</div>
              <div className="text-xs text-gray-600 whitespace-pre-line mt-1">{customerAddress || '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-sm">
            <div className="border rounded p-2">
              <div className="text-gray-500 text-xs">Document no.</div>
              <div className="font-medium">{docNumber || '—'}</div>
            </div>
            <div className="border rounded p-2">
              <div className="text-gray-500 text-xs">Issue date</div>
              <div className="font-medium">{issueDate || '—'}</div>
            </div>
            <div className="border rounded p-2">
              <div className="text-gray-500 text-xs">Rounding mode</div>
              <div className="font-medium">{roundingMode === 'per_line' ? 'Per line' : 'On totals'}</div>
            </div>
            <div className="border rounded p-2">
              <div className="text-gray-500 text-xs">Reverse charge</div>
              <div className="font-medium">{reverseChargeAll ? 'Global' : 'Per line / None'}</div>
            </div>
          </div>

          {/* Lines */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border text-left">#</th>
                  <th className="p-2 border text-left">Description</th>
                  <th className="p-2 border text-right">Qty</th>
                  <th className="p-2 border text-right">Unit</th>
                  <th className="p-2 border text-left">Type</th>
                  <th className="p-2 border text-right">VAT</th>
                  <th className="p-2 border text-right">Disc%</th>
                  <th className="p-2 border text-center">RC</th>
                  <th className="p-2 border text-right">Net</th>
                  <th className="p-2 border text-right">VAT</th>
                  <th className="p-2 border text-right">Gross</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const lc = lineCalcs[idx] || { net: 0, vat: 0, gross: 0 };
                  const net = roundingMode === 'per_line' ? round2(lc.net) : lc.net;
                  const vat = roundingMode === 'per_line' ? round2(lc.vat) : lc.vat;
                  const gross = roundingMode === 'per_line' ? round2(lc.gross) : lc.gross;

                  return (
                    <tr key={r.id}>
                      <td className="p-2 border">{idx + 1}</td>
                      <td className="p-2 border">{r.description || '-'}</td>
                      <td className="p-2 border text-right">{r.qty}</td>
                      <td className="p-2 border text-right">{GBP(r.unitPrice)}</td>
                      <td className="p-2 border">{r.priceType}</td>
                      <td className="p-2 border text-right">{(r.vatRate * 100).toFixed(1)}%</td>
                      <td className="p-2 border text-right">{r.discountPct || 0}%</td>
                      <td className="p-2 border text-center">{(reverseChargeAll || r.rc) ? '✓' : '—'}</td>
                      <td className="p-2 border text-right">{GBP(net)}</td>
                      <td className="p-2 border text-right">{(reverseChargeAll || r.rc) ? '—' : GBP(vat)}</td>
                      <td className="p-2 border text-right">{GBP(gross)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="p-2 border text-right" colSpan={8}><strong>Totals</strong></td>
                  <td className="p-2 border text-right"><strong>{GBP(totals.net)}</strong></td>
                  <td className="p-2 border text-right"><strong>{reverseChargeAll ? '—' : GBP(totals.vat)}</strong></td>
                  <td className="p-2 border text-right"><strong>{GBP(totals.gross)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* FRS compare */}
          {frsEnabled && (
            <div className="mt-4 text-sm text-gray-800">
              <div>
                Standard VAT due (charged): <strong>{reverseChargeAll ? '—' : GBP(totals.vat)}</strong>
              </div>
              <div>
                FRS VAT due @ <strong>{(frsEffectiveRate * 100).toFixed(1)}%</strong> of gross turnover:{" "}
                <strong>{GBP(frsVatDue ?? 0)}</strong>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Under FRS, VAT due is computed on VAT-inclusive turnover (gross). First-year reduction is 1 percentage point.
              </div>
            </div>
          )}
        </section>

        {/* Footer help */}
        <section className="text-xs text-gray-500">
          Import: <code>.csv</code> o <code>.xlsx</code>.  
          Campi supportati per le righe: <code>{`{ id?, description, qty, unitPrice, priceType ("net"|"gross"), vatRate (0..1), discountPct (0..100), rc (true|false) }`}</code>.
        </section>
      </div>
    </div>
  );
};

export default UkbVatCalculator;
