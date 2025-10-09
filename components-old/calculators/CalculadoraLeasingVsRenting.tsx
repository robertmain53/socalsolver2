'use client';

import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

/** -------------------------- Small helpers -------------------------- */
const eur = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number.isFinite(v) ? v : 0);

const safeNum = (v: any, fb = 0) => {
  if (v === '' || v === null || v === undefined) return fb;
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};

const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

/** -------------------------- Tiny UI bits -------------------------- */
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative inline-flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

/** -------------------------- Chart (recharts) -------------------------- */
const BarChartCmp = dynamic(async () => {
  const mod = await import('recharts');
  const { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LabelList } = mod as any;

  const C: React.FC<{ data: { name: string; valor: number }[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis
          width={80}
          tickFormatter={(v: number) =>
            new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(v)
          }
          fontSize={12}
        />
        <Tooltip formatter={(v: number) => eur(v)} />
        <Legend />
        <Bar dataKey="valor" fill="#4f46e5">
          <LabelList
            dataKey="valor"
            position="top"
            content={(props: any) => {
              const { x, y, value } = props;
              return (
                <text x={Number(x)} y={Number(y) - 6} textAnchor="middle" fontSize={12} fill="#374151">
                  {eur(Number(value || 0))}
                </text>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  return C;
}, { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-gray-500">Cargando gráfico…</div> });

/** -------------------------- Types & defaults -------------------------- */
type Inputs = {
  precioBien: number;         // Precio del bien (sin IVA)
  entrada: number;            // Pago inicial (leasing)
  valorResidual: number;      // Balloon / residual al final (leasing)
  duracionMeses: number;      // Duración en meses
  tipoAnual: number;          // TIN anual %
  cuotaRenting: number;       // Cuota mensual del renting (sin IVA)
  mantenimientoMensual: number; // Costes mensuales si no incluidos
  ivaPorc: number;            // IVA %
  deducISPorc: number;        // % de deducción en IS (aprox. impacto fiscal efectivo)
  seguroMensual: number;      // Seguro (si aplica) mensual
};

const DEFAULTS: Inputs = {
  precioBien: 30000,
  entrada: 3000,
  valorResidual: 9000,
  duracionMeses: 36,
  tipoAnual: 6,
  cuotaRenting: 520,
  mantenimientoMensual: 0,
  ivaPorc: 21,
  deducISPorc: 25,  // % ahorro fiscal efectivo (aprox) aplicable a cuotas (empresa)
  seguroMensual: 0,
};

/** -------------------------- Core finance helpers -------------------------- */
// Cuota de préstamo con residual (balloon) al final:
// payment = (PV - FV/(1+i)^n) * i / (1 - (1+i)^-n)
function leasingMonthlyPayment(pv: number, fv: number, i: number, n: number) {
  if (n <= 0) return 0;
  if (i === 0) return (pv - fv) / n;
  const discFV = fv / Math.pow(1 + i, n);
  const numer = (pv - discFV) * i;
  const denom = 1 - Math.pow(1 + i, -n);
  return numer / denom;
}

/** -------------------------- Component -------------------------- */
const CalculadoraLeasingVsRenting: React.FC = () => {
  const [inp, setInp] = useState<Inputs>(DEFAULTS);
  const [isClient, setIsClient] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setIsClient(true), []);

  const set = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = safeNum(e.target.value, (DEFAULTS as any)[k]);
    setInp(s => ({ ...s, [k]: v }));
  };

  const results = useMemo(() => {
    const precio = clamp(inp.precioBien, 0, 1_000_000);
    const entrada = clamp(inp.entrada, 0, precio);
    const residual = clamp(inp.valorResidual, 0, precio);
    const n = clamp(inp.duracionMeses, 1, 120);
    const tin = clamp(inp.tipoAnual, 0, 40) / 100;
    const i = tin / 12;

    const iva = clamp(inp.ivaPorc, 0, 30) / 100;
    const deduc = clamp(inp.deducISPorc, 0, 45) / 100;

    const seguro = clamp(inp.seguroMensual, 0, 2000);
    const mant = clamp(inp.mantenimientoMensual, 0, 2000);
    const cuotaRenting = clamp(inp.cuotaRenting, 0, 10000);

    // --- Leasing ---
    const pv = precio - entrada; // capital financiado
    const cuotaLeasingSinIVA = leasingMonthlyPayment(pv, residual, i, n);
    const cuotaLeasingConExtras = cuotaLeasingSinIVA + seguro + mant;
    const cuotaLeasingConIVA = cuotaLeasingConExtras * (1 + iva);

    const totalLeasingBruto = entrada + cuotaLeasingConIVA * n + residual; // si decides pagar el residual para quedarte el bien
    const ahorroFiscalLeasingAprox = (cuotaLeasingConExtras * n) * deduc;   // aproximación: deducción sobre gasto antes de IVA
    const totalLeasingNeto = totalLeasingBruto - ahorroFiscalLeasingAprox;

    // --- Renting ---
    const cuotaRentingSinIVA = cuotaRenting + seguro + mant; // si las cuotas ya incluyen, pon 0 en extras
    const cuotaRentingConIVA = cuotaRentingSinIVA * (1 + iva);
    const totalRentingBruto = cuotaRentingConIVA * n;
    const ahorroFiscalRentingAprox = (cuotaRentingSinIVA * n) * deduc;
    const totalRentingNeto = totalRentingBruto - ahorroFiscalRentingAprox;

    // Para comparar también sin IVA (opcional)
    const totalLeasingSinIVA = entrada + (cuotaLeasingConExtras * n) + residual;
    const totalRentingSinIVA = cuotaRentingSinIVA * n;

    return {
      detalle: {
        cuotaLeasingSinIVA, cuotaLeasingConExtras, cuotaLeasingConIVA,
        cuotaRentingSinIVA, cuotaRentingConIVA,
      },
      totales: {
        totalLeasingBruto, totalLeasingNeto, ahorroFiscalLeasingAprox,
        totalRentingBruto, totalRentingNeto, ahorroFiscalRentingAprox,
        totalLeasingSinIVA, totalRentingSinIVA,
      },
      chart: [
        { name: 'Leasing (neto)', valor: totalLeasingNeto },
        { name: 'Renting (neto)', valor: totalRentingNeto },
      ],
    };
  }, [inp]);

  const exportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('calculadora-leasing-vs-renting.pdf');
    } catch {
      alert('No se pudo generar el PDF.');
    }
  }, []);

  const reset = () => setInp(DEFAULTS);

  return (
    <div className="p-4 md:p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div ref={ref} className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Calculadora: Leasing vs Renting (empresa, es-ES)
            </h1>
            <p className="text-gray-600 mb-6">
              Compara el coste total neto (tras IVA y un ahorro fiscal aproximado en IS) entre un contrato de{' '}
              <strong>leasing</strong> con valor residual y un <strong>renting</strong> con cuota mensual.
            </p>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 rounded-lg p-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="precioBien">
                  Precio del bien (sin IVA)
                  <Tooltip text="Precio de lista sin IVA.">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <div className="relative">
                  <input id="precioBien" type="number" min={0} step={500} value={inp.precioBien}
                         onChange={set('precioBien')}
                         className="w-full px-3 py-2 pr-12 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">€</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="entrada">
                  Entrada (leasing)
                  <Tooltip text="Pago inicial del leasing.">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <div className="relative">
                  <input id="entrada" type="number" min={0} step={500} value={inp.entrada}
                         onChange={set('entrada')}
                         className="w-full px-3 py-2 pr-12 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">€</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="valorResidual">
                  Valor residual (leasing)
                  <Tooltip text="Pago final si te quedas el bien.">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <div className="relative">
                  <input id="valorResidual" type="number" min={0} step={500} value={inp.valorResidual}
                         onChange={set('valorResidual')}
                         className="w-full px-3 py-2 pr-12 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">€</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="duracionMeses">
                  Duración (meses)
                  <Tooltip text="Número de cuotas mensuales.">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <input id="duracionMeses" type="number" min={1} max={120} step={1} value={inp.duracionMeses}
                       onChange={set('duracionMeses')}
                       className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="tipoAnual">
                  Tipo anual (TIN, %)
                  <Tooltip text="Tipo de interés nominal anual del leasing.">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <input id="tipoAnual" type="number" min={0} max={40} step={0.1} value={inp.tipoAnual}
                       onChange={set('tipoAnual')}
                       className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="cuotaRenting">
                  Cuota mensual renting (sin IVA)
                  <Tooltip text="Introduce la cuota ofrecida por la empresa de renting, sin IVA.">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <div className="relative">
                  <input id="cuotaRenting" type="number" min={0} step={10} value={inp.cuotaRenting}
                         onChange={set('cuotaRenting')}
                         className="w-full px-3 py-2 pr-12 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">€</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="mantenimientoMensual">
                  Mantenimiento mensual
                  <Tooltip text="Pon 0 si ya está incluido en las cuotas.">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <div className="relative">
                  <input id="mantenimientoMensual" type="number" min={0} step={10} value={inp.mantenimientoMensual}
                         onChange={set('mantenimientoMensual')}
                         className="w-full px-3 py-2 pr-12 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">€</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="seguroMensual">
                  Seguro mensual
                  <Tooltip text="Pon 0 si ya está incluido.">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <div className="relative">
                  <input id="seguroMensual" type="number" min={0} step={10} value={inp.seguroMensual}
                         onChange={set('seguroMensual')}
                         className="w-full px-3 py-2 pr-12 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">€</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="ivaPorc">
                  IVA (%)
                  <Tooltip text="IVA general en España (21%).">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <input id="ivaPorc" type="number" min={0} max={30} step={1} value={inp.ivaPorc}
                       onChange={set('ivaPorc')}
                       className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="deducISPorc">
                  Ahorro fiscal efectivo en IS (%)
                  <Tooltip text="Aproximación del efecto IS deducible sobre gasto antes de IVA. Ajusta según tu caso.">
                    <span className="ml-2"><InfoIcon/></span>
                  </Tooltip>
                </label>
                <input id="deducISPorc" type="number" min={0} max={45} step={1} value={inp.deducISPorc}
                       onChange={set('deducISPorc')}
                       className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
            </div>

            {/* Outputs */}
            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Resultados</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border-l-4 border-indigo-500 bg-indigo-50 p-3 rounded-r-lg">
                  <div className="text-sm text-gray-700">Leasing — coste total neto</div>
                  <div className="text-lg font-bold text-indigo-700">
                    {isClient ? eur(results.totales.totalLeasingNeto) : '...'}
                  </div>
                </div>

                <div className="border-l-4 border-emerald-500 bg-emerald-50 p-3 rounded-r-lg">
                  <div className="text-sm text-gray-700">Renting — coste total neto</div>
                  <div className="text-lg font-bold text-emerald-700">
                    {isClient ? eur(results.totales.totalRentingNeto) : '...'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <div className="text-sm text-gray-600 mb-1">Cuota leasing (sin IVA)</div>
                  <div className="font-semibold">{eur(results.detalle.cuotaLeasingSinIVA)}</div>
                  <div className="text-sm text-gray-600 mt-2">Cuota leasing (con IVA + extras)</div>
                  <div className="font-semibold">{eur(results.detalle.cuotaLeasingConIVA)}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-sm text-gray-600 mb-1">Cuota renting (sin IVA)</div>
                  <div className="font-semibold">{eur(results.detalle.cuotaRentingSinIVA)}</div>
                  <div className="text-sm text-gray-600 mt-2">Cuota renting (con IVA)</div>
                  <div className="font-semibold">{eur(results.detalle.cuotaRentingConIVA)}</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Comparativa neta</h3>
              <div className="h-80 w-full bg-gray-50 rounded-lg p-4">
                {isClient && <BarChartCmp data={results.chart} />}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar actions */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="bg-white border rounded-lg p-4 shadow">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button onClick={exportPDF}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">
                Exportar PDF
              </button>
              <button onClick={reset}
                      className="w-full text-sm bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors">
                Reset
              </button>
            </div>
          </section>

          <section className="bg-white border rounded-lg p-4 shadow">
            <h2 className="font-semibold mb-2 text-gray-800">Notas rápidas</h2>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2">
              <li>El cálculo del ahorro fiscal es <strong>aproximado</strong> y depende de tu régimen y deducibilidad real.</li>
              <li>En renting, muchas veces mantenimiento y seguro ya están incluidos: pon 0 si procede.</li>
              <li>En leasing, el valor residual se paga si decides adquirir el bien al final.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default CalculadoraLeasingVsRenting;
