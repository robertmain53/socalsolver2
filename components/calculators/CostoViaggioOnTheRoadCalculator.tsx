'use client';

import { useState } from 'react';

/**
 * Calcolatore Costo Viaggio On The Road in Italia
 */
export default function CostoViaggioOnTheRoadCalculator() {
  const [inputs, setInputs] = useState({
    value1: '',
    value2: '',
  });

  const [results, setResults] = useState<any>(null);

  const handleCalculate = () => {
    // TODO: Implement calculation logic
    const result = {
      total: (parseFloat(inputs.value1) || 0) + (parseFloat(inputs.value2) || 0),
      breakdown: {
        value1: parseFloat(inputs.value1) || 0,
        value2: parseFloat(inputs.value2) || 0,
      },
    };

    setResults(result);
  };

  const handleReset = () => {
    setInputs({ value1: '', value2: '' });
    setResults(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          Calcolatore Costo Viaggio On The Road in Italia
        </h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valore 1
            </label>
            <input
              type="number"
              value={inputs.value1}
              onChange={(e) => setInputs({ ...inputs, value1: e.target.value })}
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
              value={inputs.value2}
              onChange={(e) => setInputs({ ...inputs, value2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Calcola
          </button>
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-initial bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {results && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Risultati
          </h2>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-blue-600">
              {results.total.toFixed(2)} €
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">I risultati sono indicativi. Consulta un professionista.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
