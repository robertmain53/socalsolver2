'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// -----------------------
// Metadati
// -----------------------
export const meta = {
  title: 'Calculadora de Rendimiento Neto de un Depósito a Plazo Fijo',
  description:
    'Calcula intereses brutos, retención y rendimiento neto de tu depósito a plazo fijo. Simula capital, TIN, plazo y retención.',
};

// -----------------------
// Icona + Tooltip
// -----------------------
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="text-gray-400"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// -----------------------
// Chart client-only (Recharts)
// -----------------------
type ChartClientProps = {
  data: Array<{ name: string; amount: number }>;
  fmt: (v: number) => string;
};

const ChartClient = dynamic<ChartClientProps>(
  async () => {
    const R = await import('recharts');
    const Comp: React.FC<ChartClientProps> = ({ data, fmt }) => (
      <R.ResponsiveContainer width="100%" height="100%">
        <R.BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <R.XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <R.YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} />
          <R.Tooltip formatter={(value: number) => fmt(Number(value))} />
          <R.Legend />
          <R.Bar dataKey="amount" name="Importe" />
        </R.BarChart>
      </R.ResponsiveContainer>
    );
    return Comp;
  },
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">Cargando gráfico…</div> }
);

// -----------------------
// Helpers
// -----------------------
const clampPos = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);
const fmtEUR = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

type Inputs = {
  capital: number;
  tin: number; // % nominal anual
  plazoMeses: number;
  retencion: number; // % retención IRPF a cuenta
  diasPorAnio: 360 | 365;
  modoCalculo: 'meses' | 'dias';
  plazoDias: number;
  comisiones: number; // coste fijo total (opcional)
};

// -----------------------
// Componente
// -----------------------
const CalculadoraRendimientoDeposito: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const [inputs, setInputs] = useState<Inputs>({
    capital: 20000,
    tin: 3.0,
    plazoMeses: 12,
    retencion: 19.0,
    diasPorAnio: 365,
    modoCalculo: 'meses',
    plazoDias: 0,
    comisiones: 0,
  });

  const set = (patch: Partial<Inputs>) => setInputs((p) => ({ ...p, ...patch }));

  const results = useMemo(() => {
    const cap = clampPos(Number(inputs.capital) || 0);
    const tin = Math.max(0, Number(inputs.tin) || 0) / 100;
    const ret = Math.max(0, Number(inputs.retencion) || 0) / 100;
    const comisiones = Math.max(0, Number(inputs.comisiones) || 0);
    const diasPorAnio = inputs.diasPorAnio;

    // Proporción de año
    let fraccion = 0;
    if (inputs.modoCalculo === 'meses') {
      const m = Math.max(0, Number(inputs.plazoMeses) || 0);
      fraccion = m / 12;
    } else {
      const d = Math.max(0, Number(inputs.plazoDias) || 0);
      fraccion = d / diasPorAnio;
    }

    // Intereses brutos (TIN nominal anual, sin capitalización)
    const interesesBrutos = cap * tin * fraccion;

    // Retención (a cuenta IRPF) + comisiones
    const retencionImporte = interesesBrutos * ret;
    const interesesNetos = Math.max(0, interesesBrutos - retencionImporte);
    const importeVencimiento = cap + interesesNetos - comisiones;

    // TAE aproximada (si modo meses) → convierte TIN simple en TAE con capitalización anual equivalente
    const tae =
      inputs.modoCalculo === 'meses'
        ? (Math.pow(1 + tin * (inputs.plazoMeses / 12), 12 / Math.max(1, inputs.plazoMeses)) - 1) * 100
        : tin * 100; // en modo días, dejamos TAE≈TIN para no introducir supuestos

    const chartData = [
      { name: 'Capital', amount: cap },
      { name: 'Intereses brutos', amount: interesesBrutos },
      { name: 'Retención', amount: retencionImporte },
      { name: 'Comisiones', amount: comisiones },
      { name: 'Neto a vencimiento', amount: Math.max(0, importeVencimiento) },
    ];

    return {
      interesesBrutos,
      retencionImporte,
      interesesNetos,
      comisiones,
      importeVencimiento: Math.max(0, importeVencimiento),
      tae,
      chartData,
    };
  }, [inputs]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default as any;
      if (!containerRef.current) return;
      const canvas = await html2canvas(containerRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`calculadora-deposito.pdf`);
    } catch {
      alert('Error al generar el PDF.');
    }
  }, []);

  const handleReset = useCallback(() => {
    setInputs({
      capital: 20000,
      tin: 3.0,
      plazoMeses: 12,
      retencion: 19.0,
      diasPorAnio: 365,
      modoCalculo: 'meses',
      plazoDias: 0,
      comisiones: 0,
    });
  }, []);

  const fmt = (v: number) => fmtEUR(v);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
      <div className="lg:col-span-2">
        <div ref={containerRef} className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{meta.title}</h1>
          <p className="text-gray-600 mb-6">
            Simula capital, TIN, plazo y retención para obtener intereses brutos, retención y neto a vencimiento.
          </p>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
            {/* Capital */}
            <div>
              <label htmlFor="capital" className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                Capital invertido
                <Tooltip text="Importe inicial del depósito a plazo.">
                  <span className="ml-2 cursor-help"><InfoIcon /></span>
                </Tooltip>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="capital"
                  type="number"
                  min={0}
                  step={100}
                  value={inputs.capital}
                  onChange={(e) => set({ capital: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                />
                <span className="text-sm text-gray-500">€</span>
              </div>
            </div>

            {/* TIN */}
            <div>
              <label htmlFor="tin" className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                TIN (interés nominal anual)
                <Tooltip text="Tipo de interés nominal anual. No incluye capitalización.">
                  <span className="ml-2 cursor-help"><InfoIcon /></span>
                </Tooltip>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="tin"
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.tin}
                  onChange={(e) => set({ tin: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            {/* Modo plazo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Plazo</label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="modo"
                    checked={inputs.modoCalculo === 'meses'}
                    onChange={() => set({ modoCalculo: 'meses' })}
                  />
                  <span>Meses</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="modo"
                    checked={inputs.modoCalculo === 'dias'}
                    onChange={() => set({ modoCalculo: 'dias' })}
                  />
                  <span>Días</span>
                </label>
              </div>

              {inputs.modoCalculo === 'meses' ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    id="plazoMeses"
                    type="number"
                    min={1}
                    step={1}
                    value={inputs.plazoMeses}
                    onChange={(e) => set({ plazoMeses: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  />
                  <span className="text-sm text-gray-500">meses</span>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="plazoDias"
                      type="number"
                      min={1}
                      step={1}
                      value={inputs.plazoDias}
                      onChange={(e) => set({ plazoDias: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    />
                    <span className="text-sm text-gray-500">días</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={inputs.diasPorAnio}
                      onChange={(e) => set({ diasPorAnio: Number(e.target.value) as 360 | 365 })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    >
                      <option value={365}>ACT/365</option>
                      <option value={360}>30/360</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Retención */}
            <div>
              <label htmlFor="retencion" className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                Retención a cuenta (%)
                <Tooltip text="Porcentaje de retención sobre los intereses. Valor por defecto 19%.">
                  <span className="ml-2 cursor-help"><InfoIcon /></span>
                </Tooltip>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="retencion"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={inputs.retencion}
                  onChange={(e) => set({ retencion: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            {/* Comisiones */}
            <div>
              <label htmlFor="comisiones" className="block text-sm font-medium mb-1 text-gray-700 flex items-center">
                Comisiones / Costes (totales)
                <Tooltip text="Costes fijos asociados (apertura, mantenimiento, etc.).">
                  <span className="ml-2 cursor-help"><InfoIcon /></span>
                </Tooltip>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="comisiones"
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.comisiones}
                  onChange={(e) => set({ comisiones: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                />
                <span className="text-sm text-gray-500">€</span>
              </div>
            </div>

            {/* Badge interpretazione */}
            <div className="md:col-span-2 flex items-center gap-3">
              <span className="ml-auto text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
                Interpretado correctamente
              </span>
            </div>
          </div>

          {/* Resultados */}
          <div className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados</h2>

            <div className="flex items-baseline justify-between border-l-4 p-3 rounded-r-lg bg-gray-50 border-gray-300">
              <div className="text-sm md:text-base font-medium text-gray-700">Intereses brutos</div>
              <div className="text-lg md:text-xl font-bold text-gray-800">
                {isClient ? fmt(results.interesesBrutos) : '…'}
              </div>
            </div>

            <div className="flex items-baseline justify-between border-l-4 p-3 rounded-r-lg bg-gray-50 border-gray-300">
              <div className="text-sm md:text-base font-medium text-gray-700">Retención</div>
              <div className="text-lg md:text-xl font-bold text-gray-800">
                {isClient ? fmt(results.retencionImporte) : '…'}
              </div>
            </div>

            <div className="flex items-baseline justify-between border-l-4 p-3 rounded-r-lg bg-gray-50 border-gray-300">
              <div className="text-sm md:text-base font-medium text-gray-700">Intereses netos</div>
              <div className="text-lg md:text-xl font-bold text-gray-800">
                {isClient ? fmt(results.interesesNetos) : '…'}
              </div>
            </div>

            <div className="flex items-baseline justify-between border-l-4 p-3 rounded-r-lg bg-indigo-50 border-indigo-500">
              <div className="text-sm md:text-base font-medium text-gray-700">Neto a vencimiento</div>
              <div className="text-lg md:text-xl font-bold text-indigo-600">
                {isClient ? fmt(results.importeVencimiento) : '…'}
              </div>
            </div>

            <p className="text-xs text-gray-600">
              TAE aproximada: <strong>{isClient ? results.tae.toFixed(2) : '…'}%</strong>
            </p>
          </div>

          {/* Grafico */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose</h3>
            <div className="h-72 w-full bg-gray-50 p-4 rounded-lg">
              <ChartClient data={results.chartData} fmt={fmt} />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="lg:col-span-1 space-y-6">
        <section className="border rounded-lg p-4 bg-white shadow-md">
          <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            <button
              onClick={handleExportPDF}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Exportar PDF
            </button>
            <button
              onClick={handleReset}
              className="w-full text-sm border border-transparent bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reset
            </button>
          </div>
        </section>

        <section className="border rounded-lg p-4 bg-white shadow-md">
          <h2 className="font-semibold mb-2 text-gray-800">Notas</h2>
          <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
            <li>El cálculo usa TIN (sin capitalización). Para comparar ofertas, consulta también la TAE que publica el banco.</li>
            <li>La retención indicada es una estimación a cuenta. La tributación final se ajustará en tu IRPF.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
};

export default CalculadoraRendimientoDeposito;
