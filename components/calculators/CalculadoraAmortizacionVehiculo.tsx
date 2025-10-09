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

const lastUpdated = '2025-09-03';

// ---------- Helpers UI ----------
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative inline-flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-2 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
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

// ---------- Tipi ----------
type Regimen = 'directa_normal' | 'directa_simplificada' | 'objetiva';
type Categoria = {
  id: string;
  familia: string;          // es. "Vehículos", "Informática", "Maquinaria", "Mobiliario", ecc.
  nombre: string;           // es. "Turismo", "Autocamión", "Equipos informáticos", ...
  rateMax: number;          // % massimo annuo secondo tabella
  periodoMax: number;       // anni massimo
  aplicaEco?: boolean;      // true se applica libertà/accelerata eco (solo veicoli)
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
  const [valorResidual, setValorResidual] = useState<number>(0);              // NUEVO
  const [fechaPuesta, setFechaPuesta] = useState<string>(getTodayISO());
  const [esUsado, setEsUsado] = useState<boolean>(false);
  const [esEco, setEsEco] = useState<boolean>(false);
  const [ecoLibertadPct, setEcoLibertadPct] = useState<number>(100);
  const [irpfExclusiva, setIrpfExclusiva] = useState<boolean>(false);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans" ref={refMain}>
      {/* --- Colonna principale --- */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow p-5 md:p-6">
          {/* Header brand */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{meta.title}</h1>
              <p className="text-gray-600">{meta.description}</p>
            </div>
            <div className="text-right text-[11px] text-gray-500">
              <div className="font-semibold">SoCalSolver</div>
              <div>Actualizado: {lastUpdated}</div>
            </div>
          </div>

          {/* Inputs */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Régimen</label>
              <select className="w-full border rounded px-3 py-2" value={regimen} onChange={(e) => setRegimen(e.target.value as Regimen)}>
                <option value="directa_normal">Estimación Directa Normal</option>
                <option value="directa_simplificada">Estimación Directa Simplificada</option>
                <option value="objetiva">Estimación Objetiva (Módulos)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Familia</label>
              <select className="w-full border rounded px-3 py-2" value={familiaSel} onChange={(e) => setFamiliaSel(e.target.value)}>
                {familias.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Categoría de activo</label>
              <select className="w-full border rounded px-3 py-2" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                {categoriasFamily.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} — {c.rateMax}% / {c.periodoMax} a.</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valor de compra (sin IVA)</label>
              <input type="number" className="w-full border rounded px-3 py-2" min={0}
                     value={valor} onChange={(e) => setValor(Number(e.target.value) || 0)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Valor residual (opcional) <Tooltip text="Valor contable que no se amortiza. Base contable = Valor - Residual."><span className="ml-1"><InfoIcon/></span></Tooltip>
              </label>
              <input type="number" className="w-full border rounded px-3 py-2" min={0}
                     value={valorResidual} onChange={(e) => setValorResidual(Number(e.target.value) || 0)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha de puesta en funcionamiento</label>
              <input type="date" className="w-full border rounded px-3 py-2"
                     value={fechaPuesta} onChange={(e) => setFechaPuesta(e.target.value)} />
            </div>

            <div className="flex items-center gap-3">
              <input id="usado" type="checkbox" className="h-5 w-5" checked={esUsado} onChange={(e)=>setEsUsado(e.target.checked)} />
              <label htmlFor="usado" className="text-sm">Bien de segunda mano (coeficiente hasta ×2)</label>
            </div>

            <div className="flex items-center gap-3">
              <input id="eco" type="checkbox" className="h-5 w-5" checked={esEco} onChange={(e)=>setEsEco(e.target.checked)} />
              <label htmlFor="eco" className="text-sm">Eco (libertad 2024–25 / acelerada 2023, si aplica en la categoría)</label>
            </div>

            {categoria?.aplicaEco && esEco && (new Date(fechaPuesta).getFullYear() === 2024 || new Date(fechaPuesta).getFullYear() === 2025) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">% a deducir el 1º año (libertad eco)</label>
                <input type="range" min={0} max={100} step={5} value={ecoLibertadPct}
                       onChange={(e)=>setEcoLibertadPct(Number(e.target.value))} className="w-full" />
                <div className="text-xs text-gray-600 mt-1">Primer año: {ecoLibertadPct}% del coste contable; resto con coeficiente AEAT.</div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input id="irpf" type="checkbox" className="h-5 w-5" checked={irpfExclusiva} onChange={(e)=>setIrpfExclusiva(e.target.checked)} />
              <label htmlFor="irpf" className="text-sm">IRPF – Afectación exclusiva (100%)</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">IVA aplicado (%)</label>
              <input type="number" className="w-full border rounded px-3 py-2" min={0} max={100}
                     value={tipoIVA} onChange={(e) => setTipoIVA(Number(e.target.value) || 0)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">IVA deducible (%)</label>
              <input type="number" className="w-full border rounded px-3 py-2" min={0} max={100}
                     value={ivaDedPorc} onChange={(e) => setIvaDedPorc(Number(e.target.value) || 0)} />
            </div>
          </div>

          {/* Alert */}
          {errores.length > 0 && (
            <div className="mt-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded p-3">
              <ul className="list-disc pl-5 space-y-1">{errores.map((e,i)=><li key={i}>{e}</li>)}</ul>
            </div>
          )}

          {/* Resumen */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded p-4">
              <h3 className="font-semibold text-gray-800 mb-2">IRPF — Resumen</h3>
              <div className="text-sm space-y-1">
                <div>Base amortizable: <strong>{fmtEUR(baseIRPF)}</strong></div>
                <div>Coef. máx. AEAT: <strong>{rateMax}%</strong> · Período máx.: <strong>{periodoMax} años</strong></div>
                <div>Tasa aplicable actual: <strong>{(rateAplicable).toFixed(2)}%</strong> · Vida útil ~ <strong>{vidaUtilEstim}</strong> a.</div>
                <div>Total amortizado (plan): <strong>{fmtEUR(totalAmortizado)}</strong></div>
                {notas.map((n,i)=><div key={i} className="text-amber-700">{n}</div>)}
              </div>
            </div>
            <div className="bg-white border rounded p-4">
              <h3 className="font-semibold text-gray-800 mb-2">IVA — Resumen</h3>
              <div className="text-sm space-y-1">
                <div>IVA soportado: <strong>{fmtEUR((valor)*(tipoIVA/100))}</strong></div>
                <div>IVA deducible: <strong>{fmtEUR((valor)*(tipoIVA/100)*(ivaDedPorc/100))}</strong></div>
              </div>
            </div>
          </div>

          {/* Tabla plan */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Plan de amortización (IRPF)</h3>
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
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
                    <tr><td colSpan={5} className="p-3 text-center text-gray-500">Sin amortización deducible.</td></tr>
                  ) : plan.map((r,i)=>(
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.anio}</td>
                      <td className="p-2 text-right">{fmtEUR(r.baseInicial)}</td>
                      <td className="p-2 text-right text-green-700">{fmtEUR(r.cuota)}</td>
                      <td className="p-2 text-right">{fmtEUR(r.residuo)}</td>
                      <td className="p-2">{r.nota ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart interattivo */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Evolución</h3>
              <div className="flex items-center gap-3">
                <label className="text-sm flex items-center gap-1">
                  <input type="checkbox" checked={showCuota} onChange={(e)=>setShowCuota(e.target.checked)} /> Cuota
                </label>
                <label className="text-sm flex items-center gap-1">
                  <input type="checkbox" checked={showResiduo} onChange={(e)=>setShowResiduo(e.target.checked)} /> Residuo
                </label>
                <select className="border rounded px-2 py-1 text-sm" value={chartMode} onChange={(e)=>setChartMode(e.target.value as any)}>
                  <option value="bars">Barras</option>
                  <option value="lines">Líneas</option>
                </select>
              </div>
            </div>
            <div className="h-64 bg-gray-50 rounded">
              {isClient ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === 'bars' ? (
                    <BarChart data={chartData} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v:any)=>`${Math.round((v as number)/1000)}k€`} />
                      <TooltipChart formatter={(v:number)=>fmtEUR(v)} />
                      <Legend />
                      {showCuota && <Bar dataKey="cuota" name="Cuota anual" fill="#8884d8" />}
                      {showResiduo && <Bar dataKey="residuo" name="Residuo" fill="#82ca9d" />}
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v:any)=>`${Math.round((v as number)/1000)}k€`} />
                      <TooltipChart formatter={(v:number)=>fmtEUR(v)} />
                      <Legend />
                      {showCuota && <Line type="monotone" dataKey="cuota" name="Cuota anual" stroke="#8884d8" dot={false} />}
                      {showResiduo && <Line type="monotone" dataKey="residuo" name="Residuo" stroke="#82ca9d" dot={false} />}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              ) : <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">Cargando gráfico…</div>}
            </div>
          </div>

          {/* Azioni */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={()=>downloadCSV(false)} className="border rounded px-3 py-2 text-sm hover:bg-gray-100">Exportar CSV (plan)</button>
            <button onClick={()=>downloadCSV(true)}  className="border rounded px-3 py-2 text-sm hover:bg-gray-100">Exportar CSV (+ parámetros)</button>
            <button onClick={exportPDF} className="border rounded px-3 py-2 text-sm hover:bg-gray-100">Exportar PDF (brand)</button>
          </div>
        </div>

        {/* Comparador de escenarios */}
        <div className="bg-white rounded-lg shadow p-5 md:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Escenarios — guardar y comparar</h2>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <input className="border rounded px-3 py-2 text-sm" placeholder="Nombre del escenario" value={nombreEsc} onChange={(e)=>setNombreEsc(e.target.value)} />
            <button onClick={guardarEscenario} className="border rounded px-3 py-2 text-sm hover:bg-gray-100">Guardar escenario</button>
          </div>
          {escenarios.length === 0 ? (
            <div className="text-sm text-gray-500">Aún no hay escenarios guardados.</div>
          ) : (
            <>
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="p-2">Sel.</th>
                      <th className="p-2">Nombre</th>
                      <th className="p-2">Régimen</th>
                      <th className="p-2">Familia</th>
                      <th className="p-2">Categoría</th>
                      <th className="p-2 text-right">Valor</th>
                      <th className="p-2 text-right">Residual</th>
                      <th className="p-2 text-right">Base IRPF</th>
                      <th className="p-2 text-right">Tasa</th>
                      <th className="p-2 text-right">Vida ~</th>
                      <th className="p-2 text-right">IVA ded.</th>
                      <th className="p-2 text-right">Total amort.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escenarios.map(e => (
                      <tr key={e.id} className="border-t">
                        <td className="p-2 text-center">
                          <input type="checkbox" checked={!!seleccion[e.id]} onChange={(ev)=>setSeleccion(s=>({...s, [e.id]: ev.target.checked}))} />
                        </td>
                        <td className="p-2">{e.nombre}</td>
                        <td className="p-2">{e.params.regimen}</td>
                        <td className="p-2">{e.params.familia}</td>
                        <td className="p-2">{catalogo[e.params.regimen]?.find(c=>c.id===e.params.categoriaId)?.nombre ?? e.params.categoriaId}</td>
                        <td className="p-2 text-right">{fmtEUR(e.params.valor)}</td>
                        <td className="p-2 text-right">{fmtEUR(e.params.valorResidual)}</td>
                        <td className="p-2 text-right">{fmtEUR(e.resumen.baseIRPF)}</td>
                        <td className="p-2 text-right">{e.resumen.rateAplicable.toFixed(2)}%</td>
                        <td className="p-2 text-right">{e.resumen.vidaUtilEstim} a.</td>
                        <td className="p-2 text-right">{fmtEUR(e.resumen.ivaDeducible)}</td>
                        <td className="p-2 text-right">{fmtEUR(e.resumen.totalAmortizado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {seleccionados.length > 0 && (
                <div className="mt-3 text-sm text-gray-700">
                  <strong>Comparación:</strong> {seleccionados.map((s, i) => <React.Fragment key={s.id}>{i > 0 && ' vs '}{s.nombre}</React.Fragment>)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- Colonna laterale: Catálogo AEAT y Admin --- */}
      <aside className="lg:col-span-1 space-y-6">
        <section className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Catálogo AEAT — vista</h3>
          <div className="flex items-center gap-2 mb-2">
            <select className="border rounded px-2 py-1 text-sm" value={regimen} onChange={(e)=>setRegimen(e.target.value as Regimen)}>
              <option value="directa_normal">Directa Normal</option>
              <option value="directa_simplificada">Directa Simplificada</option>
              <option value="objetiva">Objetiva</option>
            </select>
            <input className="border rounded px-2 py-1 text-sm w-full" placeholder="Buscar familia/categoría" value={qCat} onChange={(e)=>setQCat(e.target.value)} />
          </div>
          <div className="max-h-64 overflow-auto border rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2 text-left">Familia</th>
                  <th className="p-2 text-left">Categoría</th>
                  <th className="p-2 text-right">Coef. máx.</th>
                  <th className="p-2 text-right">Período</th>
                </tr>
              </thead>
              <tbody>
                {catalogoFiltrado.map((c,i)=>(
                  <tr key={c.id + i} className="border-t">
                    <td className="p-2">{c.familia}</td>
                    <td className="p-2">{c.nombre}</td>
                    <td className="p-2 text-right">{c.rateMax}%</td>
                    <td className="p-2 text-right">{c.periodoMax} a.</td>
                  </tr>
                ))}
                {catalogoFiltrado.length === 0 && (
                  <tr><td colSpan={4} className="p-2 text-center text-gray-500">No hay entradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Importa el catálogo oficial completo para hacerlo universal. Las categorías de vehículos están preconfiguradas.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Administrador de tablas AEAT</h3>
          <p className="text-xs text-gray-600 mb-2">
            Pega un JSON con el formato:
            <code className="ml-1 bg-gray-50 border rounded px-1">{"{ directa_normal: Categoria[], directa_simplificada: Categoria[], objetiva: Categoria[] }"}</code>
          </p>
          <textarea className="w-full border rounded p-2 text-xs font-mono h-32"
                    value={rawJson} onChange={(e)=>setRawJson(e.target.value)} placeholder='{\n  "directa_normal": [ { "id": "...", "familia": "Informática", "nombre": "Equipos informáticos", "rateMax": 26, "periodoMax": 8 } ],\n  "directa_simplificada": [ ... ],\n  "objetiva": [ ... ]\n}' />
          <div className="flex items-center gap-2 mt-2">
            <button onClick={importarCatalogo} className="border rounded px-3 py-2 text-sm hover:bg-gray-100">Importar/Actualizar</button>
            <button onClick={()=>{ setCatalogo(PRESET_CATALOGO); setRawJson(''); }} className="border rounded px-3 py-2 text-sm hover:bg-gray-100">Restaurar preset vehículos</button>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
          <ul className="text-sm list-disc pl-5 text-gray-700 space-y-1">
            <li>Los coeficientes/periodos son máximos: puedes deducir menos, nunca más.</li>
            <li>Bien usado: coeficiente hasta el doble del máximo de la categoría.</li>
          	<li>Eco 2024–25: libertad el 1º año si la categoría lo permite.</li>
          	<li>IRPF: la amortización exige afectación exclusiva.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
};

export default CalculadoraAmortizacionVehiculo;
