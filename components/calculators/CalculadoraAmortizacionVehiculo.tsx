'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';

// ✅ IMPORT STATICI DA RECHARTS (no next/dynamic)
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip as TooltipChart,
  Legend,
  CartesianGrid,
} from 'recharts';

// ---------- Meta ----------
export const meta = {
  title: 'Calculadora Universal de Amortización (AEAT) — SoCalSolver',
  description:
    'Amortización IRPF/IS con tablas AEAT: categorías extendibles, vehículo usado ×2, eco 2024–2025 (libertad), pro-rata, plan anual, gráficos interactivos, export PDF/CSV y comparador de escenarios.'
};

const lastUpdated = '2025-02-15';

// ---------- Helpers UI ----------
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="group relative inline-flex items-center">
    {children}
    <div
      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      style={{ maxWidth: 'min(18rem, calc(100vw - 3rem))', width: 'max-content' }}
    >
      {text}
    </div>
  </div>
);

const getTodayISO = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};
const daysInYear = (y: number) => ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365;
const fmtEUR = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v || 0);
const inputClasses = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200';
const smallSelectClasses = 'rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200';
const checkboxClasses = 'h-5 w-5 rounded border border-slate-300 text-slate-700 focus:ring-slate-400 focus:ring-offset-0';
const buttonGhostClasses = 'rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50';
const buttonPrimaryClasses = 'rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800';

// ---------- Tipi ----------
type Regimen = 'directa_normal' | 'directa_simplificada' | 'objetiva';
type Categoria = {
  id: string;
  familia: string;          // es. "Vehículos", "Informática", "Maquinaria", "Mobiliario", ecc.
  nombre: string;           // es. "Turismo", "Autocamión", "Equipos informáticos", ...
  rateMax: number;          // % massimo annuo secondo tabella
  periodoMax: number;       // anni massimo
  aplicaEco?: boolean;      // true se applica libertà/accelerata eco (solo veicoli)
};

// ---------- Catalogo AEAT (estendibile via UI) ----------
const PRESET_CATALOGO: Record<Regimen, Categoria[]> = {
  directa_normal: [
    { id: 'veh_turismo', familia: 'Vehículos', nombre: 'Turismo / Vehículo ligero', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_mixto', familia: 'Vehículos', nombre: 'Mixto para mercancías', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_furgoneta', familia: 'Vehículos', nombre: 'Furgoneta', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_trans_personas', familia: 'Vehículos', nombre: 'Transporte de personas (taxi/VTC/bus)', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_ensenanza', familia: 'Vehículos', nombre: 'Enseñanza de conducción', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_autocamion', familia: 'Vehículos', nombre: 'Autocamión', rateMax: 20, periodoMax: 10, aplicaEco: true }
  ],
  directa_simplificada: [
    { id: 'veh_turismo', familia: 'Vehículos', nombre: 'Turismo / Vehículo ligero', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_mixto', familia: 'Vehículos', nombre: 'Mixto para mercancías', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_furgoneta', familia: 'Vehículos', nombre: 'Furgoneta', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_trans_personas', familia: 'Vehículos', nombre: 'Transporte de personas (taxi/VTC/bus)', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_ensenanza', familia: 'Vehículos', nombre: 'Enseñanza de conducción', rateMax: 16, periodoMax: 14, aplicaEco: true },
    { id: 'veh_autocamion', familia: 'Vehículos', nombre: 'Autocamión', rateMax: 20, periodoMax: 10, aplicaEco: true }
  ],
  objetiva: [
    { id: 'veh_generico_obj', familia: 'Vehículos', nombre: 'Elementos de transporte (Objetiva)', rateMax: 25, periodoMax: 8, aplicaEco: true }
  ]
};

// ---------- Componente ----------
const CalculadoraAmortizacionVehiculo: React.FC = () => {
  const refMain = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // Stato del catalogo AEAT (modificabile da UI)
  const [catalogo, setCatalogo] = useState<Record<Regimen, Categoria[]>>(() => {
    if (typeof window === 'undefined') return PRESET_CATALOGO;
    const cached = localStorage.getItem('aeat_catalogo_extendido');
    return cached ? JSON.parse(cached) : PRESET_CATALOGO;
  });
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('aeat_catalogo_extendido', JSON.stringify(catalogo)); }, [catalogo]);

  // ---- Inputs principali ----
  const [regimen, setRegimen] = useState<Regimen>('directa_simplificada');
const familias = useMemo(() => Array.from(new Set((catalogo[regimen] ?? []).map(c => c.familia))), [catalogo, regimen]);
  const [familiaSel, setFamiliaSel] = useState<string>('Vehículos');
  const categoriasFamily = useMemo(() => (catalogo[regimen] ?? []).filter(c => c.familia === familiaSel), [catalogo, regimen, familiaSel]);
  const [categoriaId, setCategoriaId] = useState<string>(categoriasFamily[0]?.id ?? 'veh_turismo');

  useEffect(() => {
    const first = (catalogo[regimen] ?? []).find(c => c.familia === familiaSel);
    if (first) setCategoriaId(first.id);
  }, [familiaSel, regimen, catalogo]);

  const categoria = useMemo(() => (catalogo[regimen] ?? []).find(c => c.id === categoriaId), [catalogo, regimen, categoriaId]);

  // Dati economici
  const [valor, setValor] = useState<number>(28000);
  const [valorResidual, setValorResidual] = useState<number>(0);              // NUEVO
  const [fechaPuesta, setFechaPuesta] = useState<string>(getTodayISO());
  const [esUsado, setEsUsado] = useState<boolean>(false);
  const [esEco, setEsEco] = useState<boolean>(false);
  const [ecoLibertadPct, setEcoLibertadPct] = useState<number>(100);
  const [irpfExclusiva, setIrpfExclusiva] = useState<boolean>(true);
  const [tipoIVA, setTipoIVA] = useState<number>(21);
  const [ivaDedPorc, setIvaDedPorc] = useState<number>(50);

  useEffect(() => {
    // preset IVA deducible per veicoli
    if (familiaSel === 'Vehículos') {
      const cat = categoria?.nombre.toLowerCase() || '';
      const tipico100 = ['autocamión', 'transporte de personas', 'ensenanza', 'mixto'].some(k => cat.includes(k));
      setIvaDedPorc(p => (p === 50 || p === 100) ? (tipico100 ? 100 : 50) : p);
    }
  }, [familiaSel, categoria?.nombre]);

  // ---- Calcolo piano ----
  const {
    baseIRPF,
    ivaSoportado,
    ivaDeducible,
    rateMax,
    periodoMax,
    rateAplicable,
    vidaUtilEstim,
    plan,
    totalAmortizado,
    chartData,
    notas
  } = useMemo(() => {
    const notas: string[] = [];
    const VA = Math.max(0, valor);
    const RES = Math.max(0, Math.min(valorResidual || 0, VA)); // clamp
    const baseContabile = Math.max(0, VA - RES);
    const baseIRPF = irpfExclusiva ? baseContabile : 0;

    const IVA_TIPO = Math.min(100, Math.max(0, Number(tipoIVA)));
    const IVA_DED = Math.min(100, Math.max(0, Number(ivaDedPorc)));
    const ivaSoportado = VA * (IVA_TIPO / 100);
    const ivaDeducible = ivaSoportado * (IVA_DED / 100);

    const yearStart = new Date(fechaPuesta).getFullYear() || new Date().getFullYear();

    // Parametri AEAT dalla categoria
    const rateBase = categoria ? categoria.rateMax : 16;
    const periodoBase = categoria ? categoria.periodoMax : 14;

    // Usato: ×2 del coefficiente massimo
    let rate = Math.min(100, rateBase * (esUsado ? 2 : 1));

    // Eco: libertad (2024-25) o acelerada (2023) — solo se la categoria lo consente
    const aplicaEco = !!categoria?.aplicaEco;
    const ecoLibertadActiva = aplicaEco && esEco && (yearStart === 2024 || yearStart === 2025);
    const ecoAcelerada2023 = aplicaEco && esEco && yearStart === 2023;
    if (ecoAcelerada2023) rate = Math.min(rate * 2, 100);

    // Vita utile stimata
    const vidaUtilEstim = rate > 0 ? Math.max(1, Math.ceil(100 / rate)) : 0;
    const periodoMax = periodoBase;

    // Generazione piano
    const plan: { anio: number; baseInicial: number; cuota: number; residuo: number; nota?: string }[] = [];
    let residuo = baseIRPF;
    let anio = yearStart;

    if (!irpfExclusiva) notas.push('IRPF: sin afectación exclusiva → la amortización no es deducible.');
    if (RES > 0) notas.push(`Valor residual aplicado: ${fmtEUR(RES)} (base contable = ${fmtEUR(baseContabile)}).`);

    // Año 1
    if (baseIRPF > 0) {
      let cuota1 = 0;
      let nota1 = '';
      if (ecoLibertadActiva) {
        const pct = Math.min(100, Math.max(0, ecoLibertadPct));
        cuota1 = (baseIRPF * pct) / 100;
        nota1 = `Libertad eco ${yearStart}: ${pct}% del coste contable.`;
      } else {
        // pro-rata per giorni
        const di = daysInYear(yearStart);
        const start = new Date(fechaPuesta);
        const sVal = isNaN(start.getTime()) ? new Date(yearStart, 0, 1) : start;
        const dayOfYear = Math.floor((Date.UTC(sVal.getFullYear(), sVal.getMonth(), sVal.getDate()) - Date.UTC(yearStart, 0, 1)) / 86400000) + 1;
        const diasRest = Math.max(0, di - Math.max(1, dayOfYear) + 1);
        const cuotaMax = (baseIRPF * rate) / 100;
        cuota1 = Math.min(cuotaMax * (diasRest / di), residuo);
        nota1 = `Pro-rata ${diasRest}/${di} días.`;
      }
      cuota1 = Math.max(0, Math.min(cuota1, residuo));
      residuo -= cuota1;
      plan.push({ anio, baseInicial: baseIRPF, cuota: cuota1, residuo: Math.max(0, residuo), nota: nota1 });
    }

    // Años successivi con "rate"
    const cuotaMax = (baseIRPF * rate) / 100;
    let guard = 0;
    while (residuo > 0 && guard < 120) {
      anio += 1;
      const cuota = Math.min(cuotaMax, residuo);
      plan.push({ anio, baseInicial: plan[plan.length - 1]?.residuo ?? baseIRPF, cuota, residuo: Math.max(0, residuo - cuota) });
      residuo -= cuota;
      guard++;
    }

    const chartData = plan.map(r => ({ name: String(r.anio), cuota: Math.round(r.cuota), residuo: Math.round(r.residuo) }));

    return {
      baseIRPF,
      ivaSoportado,
      ivaDeducible,
      rateMax: rateBase,
      periodoMax,
      rateAplicable: rate,
      vidaUtilEstim,
      plan,
      totalAmortizado: baseIRPF - residuo,
      chartData,
      notas
    };
  }, [valor, valorResidual, fechaPuesta, categoria, esUsado, esEco, ecoLibertadPct, irpfExclusiva, tipoIVA, ivaDedPorc]);

  // ---------- Export CSV ----------
  const downloadCSV = useCallback((incluirParametros: boolean) => {
    const headers = ['Año', 'Base inicial', 'Cuota', 'Residuo', 'Nota'];
    const rows = plan.map(r => [r.anio, r.baseInicial, r.cuota, r.residuo, r.nota ?? '']);
    const lines: string[] = [];

    if (incluirParametros) {
      lines.push('# Parámetros');
      lines.push(`# Régimen,${regimen}`);
      lines.push(`# Familia,${familiaSel}`);
      lines.push(`# Categoría,${categoria?.nombre ?? ''}`);
      lines.push(`# Valor,${valor.toFixed(2)}`);
      lines.push(`# Valor residual,${valorResidual.toFixed(2)}`);
      lines.push(`# Fecha puesta,${fechaPuesta}`);
      lines.push(`# Usado,${esUsado}`);
      lines.push(`# Eco,${esEco} (libertad ${ecoLibertadPct}%)`);
      lines.push(`# IRPF exclusiva,${irpfExclusiva}`);
      lines.push(`# IVA %,${tipoIVA}`);
      lines.push(`# IVA deducible %,${ivaDedPorc}`);
      lines.push('');
    }

    lines.push(headers.join(','));
rows.forEach(r => lines.push(r.map(x => (typeof x === 'number' ? x.toFixed(2) : `"${String(x)}"`)).join(',')));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'amortizacion_aeat.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [plan, regimen, familiaSel, categoria?.nombre, valor, valorResidual, fechaPuesta, esUsado, esEco, ecoLibertadPct, irpfExclusiva, tipoIVA, ivaDedPorc]);

  // ---------- Export PDF (brand + resumen) ----------
  const exportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!refMain.current) return;

      // Header brandizzato temporaneo
      const brand = document.createElement('div');
      brand.setAttribute('id', 'pdf-brand-header');
      brand.setAttribute('style', 'padding:16px 20px;border:1px solid #e5e7eb;margin-bottom:12px;border-radius:10px;background:#0f172a;color:#fff;');
      brand.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="font-weight:800;font-size:18px;letter-spacing:0.3px">SoCalSolver — Calculadora AEAT</div>
        <div style="font-size:12px;opacity:0.9">Actualizado: ${lastUpdated}</div>
      </div>
      <div style="font-size:12px;margin-top:6px;opacity:0.9">
        Régimen: ${regimen} · Familia: ${familiaSel} · Categoría: ${categoria?.nombre ?? ''} · Valor: €${valor.toLocaleString('es-ES')}
        ${valorResidual>0 ? ` · Residual: €${valorResidual.toLocaleString('es-ES')}` : ''} · Puesta: ${fechaPuesta}
      </div>`;
      refMain.current.prepend(brand);

      const canvas = await html2canvas(refMain.current, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;

      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save('SoCalSolver_AmortizacionAEAT.pdf');

      brand.remove();
    } catch (e) {
      alert('Export PDF no disponible en este entorno.');
      console.error(e);
    }
  }, [regimen, familiaSel, categoria?.nombre, valor, valorResidual, fechaPuesta]);

  // ---------- Scenari: salva, lista, confronto ----------
  type Escenario = {
    id: string;
    nombre: string;
    ts: number;
    params: {
      regimen: Regimen; familia: string; categoriaId: string;
      valor: number; valorResidual: number; fechaPuesta: string;
      esUsado: boolean; esEco: boolean; ecoLibertadPct: number;
      irpfExclusiva: boolean; tipoIVA: number; ivaDedPorc: number;
    };
    resumen: {
      baseIRPF: number; rateMax: number; periodoMax: number; rateAplicable: number;
      vidaUtilEstim: number; totalAmortizado: number; ivaDeducible: number;
    };
  };

  const [nombreEsc, setNombreEsc] = useState<string>('Escenario 1');
  const [escenarios, setEscenarios] = useState<Escenario[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem('amort_aeat_scenarios');
    return raw ? JSON.parse(raw) : [];
  });
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('amort_aeat_scenarios', JSON.stringify(escenarios)); }, [escenarios]);

  const guardarEscenario = useCallback(() => {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
    const nuevo: Escenario = {
      id,
      nombre: nombreEsc || `Escenario ${new Date().toLocaleString('es-ES')}`,
      ts: Date.now(),
      params: { regimen, familia: familiaSel, categoriaId, valor, valorResidual, fechaPuesta, esUsado, esEco, ecoLibertadPct, irpfExclusiva, tipoIVA, ivaDedPorc },
      resumen: { baseIRPF, rateMax, periodoMax, rateAplicable, vidaUtilEstim, totalAmortizado, ivaDeducible }
    };
    setEscenarios(prev => [nuevo, ...prev].slice(0, 20));
  }, [nombreEsc, regimen, familiaSel, categoriaId, valor, valorResidual, fechaPuesta, esUsado, esEco, ecoLibertadPct, irpfExclusiva, tipoIVA, ivaDedPorc, baseIRPF, rateMax, periodoMax, rateAplicable, vidaUtilEstim, totalAmortizado, ivaDeducible]);

  const [seleccion, setSeleccion] = useState<Record<string, boolean>>({});
  const seleccionados = escenarios.filter(e => seleccion[e.id]).slice(0, 3);

  // ---------- Grafica interattiva ----------
  const [chartMode, setChartMode] = useState<'bars' | 'lines'>('bars');
  const [showCuota, setShowCuota] = useState(true);
  const [showResiduo, setShowResiduo] = useState(true);

  // ---------- Validazioni ----------
  const errores: string[] = [];
  if (valor < 0) errores.push('El valor de compra no puede ser negativo.');
  if (valorResidual < 0) errores.push('El valor residual no puede ser negativo.');
  if (valorResidual > valor) errores.push('El valor residual no puede superar el valor de compra.');
  if (!fechaPuesta) errores.push('Introduce la fecha de puesta en funcionamiento.');
  if (!irpfExclusiva) errores.push('IRPF: sin afectación exclusiva, la amortización no es deducible.');

  // ---------- Ricerca catalogo ----------
  const [qCat, setQCat] = useState('');
  const catalogoFiltrado = useMemo(() => {
    const list = catalogo[regimen] ?? [];
    if (!qCat.trim()) return list;
    const k = qCat.toLowerCase();
    return list.filter(c => (c.familia + ' ' + c.nombre).toLowerCase().includes(k));
  }, [catalogo, regimen, qCat]);

  // ---------- Admin tabelle (JSON import) ----------
  const [rawJson, setRawJson] = useState<string>('');
  const importarCatalogo = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed.directa_normal || !parsed.directa_simplificada || !parsed.objetiva) throw new Error('Formato inválido');
      setCatalogo(parsed);
      setRawJson('');
      alert('Catálogo AEAT actualizado correctamente.');
    } catch (e) {
      alert('JSON inválido. Asegúrate del formato.');
      console.error(e);
    }
  };

  return (
    <div
      ref={refMain}
      className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1.75fr_1fr] lg:gap-8"
    >
      <div className="space-y-6 lg:space-y-8">
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{meta.title}</h1>
              <p className="text-sm text-slate-600 sm:text-base">{meta.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Tablas AEAT 2025</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Eco libertad 2024–2025</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Export CSV / PDF</span>
              </div>
            </div>
            <div className="shrink-0 text-right text-xs text-slate-500">
              <div className="font-semibold uppercase tracking-wide text-slate-700">SoCalSolver</div>
              <div>Actualizado: {lastUpdated}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 sm:grid-cols-2 sm:p-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="regimen">Régimen</label>
              <select id="regimen" className={inputClasses} value={regimen} onChange={(e) => setRegimen(e.target.value as Regimen)}>
                <option value="directa_normal">Estimación Directa Normal</option>
                <option value="directa_simplificada">Estimación Directa Simplificada</option>
                <option value="objetiva">Estimación Objetiva (Módulos)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="familia">Familia</label>
              <select id="familia" className={inputClasses} value={familiaSel} onChange={(e) => setFamiliaSel(e.target.value)}>
                {familias.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="categoria">Categoría de activo</label>
              <select id="categoria" className={inputClasses} value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                {categoriasFamily.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} — {c.rateMax}% / {c.periodoMax} a.</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="valor">Valor de compra (sin IVA)</label>
              <input id="valor" type="number" className={inputClasses} min={0} value={valor} onChange={(e) => setValor(Number(e.target.value) || 0)} />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="valorResidual">Valor residual (opcional) <Tooltip text="Valor contable que no se amortiza. Base contable = Valor - Residual."><span className="ml-1 inline-flex"><InfoIcon /></span></Tooltip></label>
              <input id="valorResidual" type="number" className={inputClasses} min={0} value={valorResidual} onChange={(e) => setValorResidual(Number(e.target.value) || 0)} />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="fechaPuesta">Fecha de puesta en funcionamiento</label>
              <input id="fechaPuesta" type="date" className={inputClasses} value={fechaPuesta} onChange={(e) => setFechaPuesta(e.target.value)} />
            </div>

            <label htmlFor="usado" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-slate-300">
              <input id="usado" type="checkbox" className={checkboxClasses} checked={esUsado} onChange={(e)=>setEsUsado(e.target.checked)} />
              <span>Bien de segunda mano (coeficiente hasta ×2)</span>
            </label>

            <label htmlFor="eco" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-slate-300">
              <input id="eco" type="checkbox" className={checkboxClasses} checked={esEco} onChange={(e)=>setEsEco(e.target.checked)} />
              <span>Eco (libertad 2024–25 / acelerada 2023, si aplica)</span>
            </label>

            {categoria?.aplicaEco && esEco && (new Date(fechaPuesta).getFullYear() === 2024 || new Date(fechaPuesta).getFullYear() === 2025) && (
              <div className="sm:col-span-2 space-y-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700" htmlFor="ecoLibertadPct">
                  % a deducir el 1º año (libertad eco)
                  <span className="text-xs text-slate-500">Primer año: {ecoLibertadPct}%</span>
                </label>
                <input id="ecoLibertadPct" type="range" min={0} max={100} step={5} value={ecoLibertadPct} onChange={(e)=>setEcoLibertadPct(Number(e.target.value))} className="w-full accent-slate-700" />
                <p className="text-xs text-slate-500">El resto del valor seguirá las tablas AEAT para la categoría seleccionada.</p>
              </div>
            )}

            <label htmlFor="irpf" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-slate-300">
              <input id="irpf" type="checkbox" className={checkboxClasses} checked={irpfExclusiva} onChange={(e)=>setIrpfExclusiva(e.target.checked)} />
              <span>IRPF – Afectación exclusiva (100%)</span>
            </label>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="tipoIVA">IVA aplicado (%)</label>
              <input id="tipoIVA" type="number" className={inputClasses} min={0} max={100} value={tipoIVA} onChange={(e) => setTipoIVA(Number(e.target.value) || 0)} />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="ivaDed">IVA deducible (%)</label>
              <input id="ivaDed" type="number" className={inputClasses} min={0} max={100} value={ivaDedPorc} onChange={(e) => setIvaDedPorc(Number(e.target.value) || 0)} />
            </div>
          </div>

          {errores.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-3 text-sm text-amber-900 shadow-sm">
              <ul className="list-disc space-y-1 pl-5">{errores.map((e,i)=><li key={i}>{e}</li>)}</ul>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                <span>IRPF</span>
                <span>Plan oficial AEAT</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Resumen fiscal</h3>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <div>Base amortizable: <strong>{fmtEUR(baseIRPF)}</strong></div>
                <div>Coef. máx.: <strong>{rateMax}%</strong> · Período máx.: <strong>{periodoMax} años</strong></div>
                <div>Tasa aplicada: <strong>{(rateAplicable).toFixed(2)}%</strong> · Vida útil estimada: <strong>{vidaUtilEstim} a.</strong></div>
                <div>Total amortizado: <strong>{fmtEUR(totalAmortizado)}</strong></div>
                {notas.map((n,i)=><div key={i} className="text-sm text-amber-600">{n}</div>)}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                <span>IVA</span>
                <span>Uso profesional</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Resumen IVA</h3>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <div>IVA soportado: <strong>{fmtEUR(valor * (tipoIVA / 100))}</strong></div>
                <div>IVA deducible: <strong>{fmtEUR(valor * (tipoIVA / 100) * (ivaDedPorc / 100))}</strong></div>
                <div>Proporción deducible aplicada: <strong>{ivaDedPorc}%</strong></div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Plan de amortización (IRPF)</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Coeficiente máximo</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-700">
                <thead className="bg-slate-100/90 text-slate-600">
                  <tr>
                    <th className="p-2 text-left">Año</th>
                    <th className="p-2 text-right">Base inicial</th>
                    <th className="p-2 text-right">Cuota</th>
                    <th className="p-2 text-right">Residuo</th>
                    <th className="p-2 text-left">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.length === 0 ? (
                    <tr><td colSpan={5} className="p-3 text-center text-slate-500">Sin amortización deducible.</td></tr>
                  ) : plan.map((r,i)=>(
                    <tr key={i} className="border-t border-slate-100 odd:bg-slate-50/40">
                      <td className="p-2">{r.anio}</td>
                      <td className="p-2 text-right">{fmtEUR(r.baseInicial)}</td>
                      <td className="p-2 text-right text-emerald-700">{fmtEUR(r.cuota)}</td>
                      <td className="p-2 text-right">{fmtEUR(r.residuo)}</td>
                      <td className="p-2">{r.nota ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Evolución de cuota y residuo</h3>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className={checkboxClasses} checked={showCuota} onChange={(e)=>setShowCuota(e.target.checked)} /> Cuota
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className={checkboxClasses} checked={showResiduo} onChange={(e)=>setShowResiduo(e.target.checked)} /> Residuo
                </label>
                <select className={smallSelectClasses} value={chartMode} onChange={(e)=>setChartMode(e.target.value as any)}>
                  <option value="bars">Barras</option>
                  <option value="lines">Líneas</option>
                </select>
              </div>
            </div>
            <div className="mt-4 h-64 rounded-xl bg-slate-50/80">
              {isClient ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === 'bars' ? (
                    <BarChart data={chartData} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}k€`} />
                      <TooltipChart formatter={(v:number)=>fmtEUR(v)} />
                      <Legend />
                      {showCuota && <Bar dataKey="cuota" name="Cuota anual" fill="#6366F1" radius={[6,6,0,0]} />}
                      {showResiduo && <Bar dataKey="residuo" name="Residuo" fill="#0EA5E9" radius={[6,6,0,0]} />}
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}k€`} />
                      <TooltipChart formatter={(v:number)=>fmtEUR(v)} />
                      <Legend />
                      {showCuota && <Line type="monotone" dataKey="cuota" name="Cuota anual" stroke="#6366F1" strokeWidth={2} dot={false} />}
                      {showResiduo && <Line type="monotone" dataKey="residuo" name="Residuo" stroke="#0EA5E9" strokeWidth={2} dot={false} />}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              ) : <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">Cargando gráfico…</div>}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={()=>downloadCSV(false)} className={buttonGhostClasses}>Descargar CSV (plan)</button>
            <button onClick={()=>downloadCSV(true)} className={buttonGhostClasses}>CSV con parámetros</button>
            <button onClick={exportPDF} className={buttonGhostClasses}>Exportar PDF</button>
            <button onClick={guardarEscenario} className={buttonPrimaryClasses}>Guardar escenario</button>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Escenarios guardados</h3>
                <p className="text-sm text-slate-500">Guarda combinaciones de coeficientes y compara hasta 3 escenarios.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input className={inputClasses} placeholder="Nombre escenario" value={nombreEsc} onChange={(e)=>setNombreEsc(e.target.value)} />
                <button onClick={()=>setEscenarios([])} className="text-xs font-medium text-rose-600 hover:underline">Vaciar todo</button>
              </div>
            </div>

            {escenarios.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Sin escenarios guardados todavía.</p>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {escenarios.map(e=>(
                    <div key={e.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{e.nombre}</h4>
                          <p className="text-xs text-slate-500">{new Date(e.ts).toLocaleString('es-ES')}</p>
                        </div>
                        <input type="checkbox" className={checkboxClasses} checked={!!seleccion[e.id]} onChange={(ev)=>setSeleccion(prev => ({ ...prev, [e.id]: ev.target.checked }))} />
                      </div>
                      <ul className="text-xs text-slate-600">
                        <li>Reg.: {e.params.regimen} · {e.params.familia}</li>
                        <li>Valor: {fmtEUR(e.params.valor)} · IVA ded.: {e.params.ivaDedPorc}%</li>
                        <li>Coef. aplicado: {e.resumen.rateAplicable.toFixed(2)}% · Vida útil: {e.resumen.vidaUtilEstim} a.</li>
                      </ul>
                    </div>
                  ))}
                </div>
                {seleccionados.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full text-xs text-slate-700">
                      <thead className="bg-slate-100/80 text-slate-600">
                        <tr>
                          <th className="p-2 text-left">Escenario</th>
                          <th className="p-2 text-right">Coef. aplic.</th>
                          <th className="p-2 text-right">Vida útil</th>
                          <th className="p-2 text-right">IVA deducible</th>
                          <th className="p-2 text-right">Total amortizado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seleccionados.map(e => (
                          <tr key={e.id} className="border-t border-slate-100">
                            <td className="p-2">{e.nombre}</td>
                            <td className="p-2 text-right">{e.resumen.rateAplicable.toFixed(2)}%</td>
                            <td className="p-2 text-right">{e.resumen.vidaUtilEstim} a.</td>
                            <td className="p-2 text-right">{fmtEUR(e.resumen.ivaDeducible)}</td>
                            <td className="p-2 text-right">{fmtEUR(e.resumen.totalAmortizado)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-2 text-xs text-slate-500">Selecciona hasta 3 escenarios para comparar.</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6">
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-semibold text-slate-900">Catálogo AEAT — vista</h3>
          <p className="mt-1 text-sm text-slate-500">Consulta rápidamente coeficientes y plazos oficiales. Cambia entre regímenes o filtra por familia.</p>
          <div className="mt-4 flex flex-col gap-2">
            <select className={smallSelectClasses} value={regimen} onChange={(e)=>setRegimen(e.target.value as Regimen)}>
              <option value="directa_normal">Estimación Directa Normal</option>
              <option value="directa_simplificada">Estimación Directa Simplificada</option>
              <option value="objetiva">Estimación Objetiva (Módulos)</option>
            </select>
            <input className={inputClasses} placeholder="Buscar familia o categoría" value={qCat} onChange={(e)=>setQCat(e.target.value)} />
          </div>
          <div className="mt-4 max-h-64 overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-xs text-slate-600">
              <thead className="bg-slate-100/90 text-slate-500">
                <tr>
                  <th className="p-2 text-left">Familia</th>
                  <th className="p-2 text-left">Categoría</th>
                  <th className="p-2 text-right">Coef. máx.</th>
                  <th className="p-2 text-right">Período</th>
                </tr>
              </thead>
              <tbody>
                {catalogoFiltrado.map((c,i)=>(
                  <tr key={c.id + i} className="border-t border-slate-100">
                    <td className="p-2">{c.familia}</td>
                    <td className="p-2">{c.nombre}</td>
                    <td className="p-2 text-right">{c.rateMax}%</td>
                    <td className="p-2 text-right">{c.periodoMax} a.</td>
                  </tr>
                ))}
                {catalogoFiltrado.length === 0 && (
                  <tr><td colSpan={4} className="p-3 text-center text-slate-500">No hay entradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-semibold text-slate-900">Importar catálogo AEAT</h3>
          <p className="mt-1 text-sm text-slate-500">Extiende la calculadora con tus propias tablas. Usa el formato oficial y pégalo en el siguiente campo.</p>
          <textarea className="mt-3 h-32 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono leading-5 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" value={rawJson} onChange={(e)=>setRawJson(e.target.value)} placeholder='{"directa_normal": [{"id": "veh_nuevo", "familia": "Vehículos", "nombre": "Turismo", "rateMax": 16, "periodoMax": 14}]}' />
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={importarCatalogo} className={buttonPrimaryClasses}>Importar / actualizar</button>
            <button onClick={()=>{ setCatalogo(PRESET_CATALOGO); setRawJson(''); }} className={buttonGhostClasses}>Restaurar preset vehículos</button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-semibold text-slate-900">Notas rápidas</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>Los coeficientes publicados son máximos: puedes amortizar menos, nunca más.</li>
            <li>Bien usado: coeficiente hasta el doble del máximo de la categoría.</li>
            <li>Eco 2024–25: libertad de amortización el primer año si la categoría lo permite.</li>
            <li>IRPF: exige afectación exclusiva y registro contable coherente.</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">Referencia: Orden ETD/1217/2023 (Tablas coeficientes AEAT) y Ley 28/2022 de Startups.</p>
        </section>
      </aside>
    </div>
  );
};

export default CalculadoraAmortizacionVehiculo;
