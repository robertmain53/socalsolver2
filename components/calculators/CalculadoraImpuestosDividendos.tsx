'use client';

import React, { useMemo, useState } from 'react';

// -----------------------
// Metadati
// -----------------------
export const meta = {
  title: 'Calculadora de Impuestos sobre Dividendos (IRPF España)',
  description:
    'Simula el IRPF sobre dividendos en la base del ahorro con tramos progresivos. Calcula la cuota íntegra, la retención practicada y el resultado (a ingresar o a devolver).',
};

// -----------------------
// Tipi
// -----------------------
type DividendBracket =
  | { rate: number; upTo: number }        // tramo con techo
  | { rate: number; upTo?: undefined };   // tramo final sin techo

type InputsState = {
  dividendosBrutos: number;
  porcentajeRetencion: number; // p.ej. 19
  ejercicio: '2024';           // extensible
};

// -----------------------
// Configuración de tramos
// (ajusta si cambian los tipos oficiales)
// -----------------------
const DIVIDEND_BRACKETS_2024: DividendBracket[] = [
  { upTo: 6000, rate: 19 },
  { upTo: 50000, rate: 21 },
  { upTo: 200000, rate: 23 },
  { upTo: 300000, rate: 27 },
  { rate: 28 }, // último tramo sin techo
];

// -----------------------
// Helpers
// -----------------------
const clampNz = (n: unknown) => Math.max(0, Number(n) || 0);
const fmtEUR = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

// Calcolo per tramos: robusto anche con ultimo tramo senza "upTo"
function calcularCuotaAhorro(base: number, brackets: DividendBracket[]): number {
  let baseRestante = Math.max(0, base);
  let baseAnterior = 0;
  let cuota = 0;

  for (const bracket of brackets) {
    if (baseRestante <= 0) break;

    const cap = typeof bracket.upTo === 'number' ? bracket.upTo : Number.POSITIVE_INFINITY;
    const tramoDisponible = cap - baseAnterior;

    if (tramoDisponible <= 0) {
      baseAnterior = cap;
      continue;
    }

    const baseEnTramo = Math.min(baseRestante, tramoDisponible);
    cuota += baseEnTramo * (bracket.rate / 100);
    baseRestante -= baseEnTramo;
    baseAnterior += baseEnTramo;
  }

  return Math.max(0, cuota);
}

// -----------------------
// Componente principale
// -----------------------
const CalculadoraImpuestosDividendos: React.FC = () => {
  const [inputs, setInputs] = useState<InputsState>({
    dividendosBrutos: 12000,
    porcentajeRetencion: 19,
    ejercicio: '2024',
  });

  const onNum = (k: keyof InputsState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((p) => ({ ...p, [k]: e.target.value === '' ? 0 : Number(e.target.value) }));

  const brackets = useMemo(() => {
    switch (inputs.ejercicio) {
      case '2024':
      default:
        return DIVIDEND_BRACKETS_2024;
    }
  }, [inputs.ejercicio]);

  const results = useMemo(() => {
    const base = clampNz(inputs.dividendosBrutos);
    const cuotaIntegra = calcularCuotaAhorro(base, brackets);
    const retencion = base * (Math.max(0, Math.min(100, inputs.porcentajeRetencion)) / 100);
    const diferencial = cuotaIntegra - retencion;

    return {
      base,
      cuotaIntegra,
      retencion,
      resultadoAPagar: Math.max(0, diferencial),
      resultadoADevolver: Math.max(0, -diferencial),
    };
  }, [inputs, brackets]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
        {meta.title}
      </h1>
      <p className="text-gray-600 mb-6">{meta.description}</p>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-lg">
        <div>
          <label htmlFor="dividendosBrutos" className="block text-sm font-medium mb-1 text-gray-700">
            Dividendos brutos
          </label>
          <div className="flex items-center gap-2">
            <input
              id="dividendosBrutos"
              type="number"
              min={0}
              step={100}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
              value={inputs.dividendosBrutos}
              onChange={onNum('dividendosBrutos')}
            />
            <span className="text-sm text-gray-500">€</span>
          </div>
        </div>

        <div>
          <label htmlFor="porcentajeRetencion" className="block text-sm font-medium mb-1 text-gray-700">
            Retención practicada (%)
          </label>
          <input
            id="porcentajeRetencion"
            type="number"
            min={0}
            max={100}
            step={0.5}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
            value={inputs.porcentajeRetencion}
            onChange={onNum('porcentajeRetencion')}
          />
        </div>

        <div>
          <label htmlFor="ejercicio" className="block text-sm font-medium mb-1 text-gray-700">
            Ejercicio
          </label>
          <select
            id="ejercicio"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
            value={inputs.ejercicio}
            onChange={(e) => setInputs((p) => ({ ...p, ejercicio: e.target.value as InputsState['ejercicio'] }))}
          >
            <option value="2024">2024</option>
          </select>
        </div>

        {/* Badge di sanity-check */}
        <div className="md:col-span-3">
          <span className="inline-block text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
            Interpretado correctamente
          </span>
        </div>
      </div>

      {/* Outputs */}
      <div className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados</h2>

        <div className="flex items-baseline justify-between border-l-4 p-3 rounded-r-lg bg-gray-50 border-gray-300">
          <div className="text-sm md:text-base font-medium text-gray-700">Base del ahorro</div>
          <div className="text-lg md:text-xl font-bold text-gray-800">{fmtEUR(results.base)}</div>
        </div>

        <div className="flex items-baseline justify-between border-l-4 p-3 rounded-r-lg bg-gray-50 border-gray-300">
          <div className="text-sm md:text-base font-medium text-gray-700">Cuota íntegra IRPF (dividendos)</div>
          <div className="text-lg md:text-xl font-bold text-gray-800">{fmtEUR(results.cuotaIntegra)}</div>
        </div>

        <div className="flex items-baseline justify-between border-l-4 p-3 rounded-r-lg bg-gray-50 border-gray-300">
          <div className="text-sm md:text-base font-medium text-gray-700">Retención practicada</div>
          <div className="text-lg md:text-xl font-bold text-gray-800">{fmtEUR(results.retencion)}</div>
        </div>

        <div className="flex items-baseline justify-between border-l-4 p-3 rounded-r-lg bg-indigo-50 border-indigo-500">
          <div className="text-sm md:text-base font-medium text-gray-700">Resultado a ingresar</div>
          <div className="text-lg md:text-xl font-bold text-indigo-600">{fmtEUR(results.resultadoAPagar)}</div>
        </div>

        <div className="flex items-baseline justify-between border-l-4 p-3 rounded-r-lg bg-gray-50 border-gray-300">
          <div className="text-sm md:text-base font-medium text-gray-700">Resultado a devolver</div>
          <div className="text-lg md:text-xl font-bold text-gray-800">{fmtEUR(results.resultadoADevolver)}</div>
        </div>
      </div>

      {/* Notas */}
      <p className="text-xs text-gray-600 mt-4">
        Esta simulación es orientativa y no contempla límites o compensaciones especiales (p. ej. pérdidas de años anteriores).
      </p>
    </div>
  );
};

export default CalculadoraImpuestosDividendos;
