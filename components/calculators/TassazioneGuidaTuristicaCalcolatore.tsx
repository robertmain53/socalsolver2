'use client';

import { useState } from 'react';

export default function TassazioneGuidaTuristicaCalcolatore() {
  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);

    if (isNaN(v1) || isNaN(v2)) {
      return;
    }

    // TODO: Implement actual calculation logic
    const calculatedResult = v1 + v2;
    setResult(calculatedResult);
  };

  const reset = () => {
    setValue1('');
    setValue2('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className=" p-6 -lg -md">
        <h3 className="text-lg font-semibold mb-4">Inserisci i valori</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valore 1
            </label>
            <input
              type="number"
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valore 2
            </label>
            <input
              type="number"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={calculate}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Calcola
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {result !== null && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Risultato</h3>
          <p className="text-3xl font-bold text-green-600">
            {result.toLocaleString('it-IT', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} €
          </p>
        </div>
      )}
    </div>
  );
}
