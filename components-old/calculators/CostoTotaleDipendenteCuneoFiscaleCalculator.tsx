"use client";
import React, { useState } from 'react';

interface CalculatorState {
  stipendioLordo: number;
  contributiPrevidenziali: number;
  impostaIrpef: number;
  costoTotale: number;
}

const CostoTotaleDipendenteCuneoFiscaleCalculator: React.FC = () => {
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    stipendioLordo: 0,
    contributiPrevidenziali: 0,
    impostaIrpef: 0,
    costoTotale: 0,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCalculatorState((prevState) => ({
      ...prevState,
      [name]: parseFloat(value),
    }));
  };

  React.useEffect(() => {
    const costoTotale = 
      calculatorState.stipendioLordo +
      calculatorState.contributiPrevidenziali +
      calculatorState.impostaIrpef;
    setCalculatorState((prevState) => ({ ...prevState, costoTotale }));
  }, [calculatorState.stipendioLordo, calculatorState.contributiPrevidenziali, calculatorState.impostaIrpef]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h1>Calcolatore Costo Totale Dipendente (Cuneo Fiscale)</h1>
      <p>Calcola il costo totale di un dipendente, considerando stipendio lordo, contributi previdenziali e imposta IRPEF.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="stipendioLordo" className="block text-gray-700 font-bold mb-2">
            Stipendio lordo:
          </label>
          <input
            type="number"
            id="stipendioLordo"
            name="stipendioLordo"
            value={calculatorState.stipendioLordo}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label htmlFor="contributiPrevidenziali" className="block text-gray-700 font-bold mb-2">
            Contributi previdenziali:
          </label>
          <input
            type="number"
            id="contributiPrevidenziali"
            name="contributiPrevidenziali"
            value={calculatorState.contributiPrevidenziali}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label htmlFor="impostaIrpef" className="block text-gray-700 font-bold mb-2">
            Imposta IRPEF:
          </label>
          <input
            type="number"
            id="impostaIrpef"
            name="impostaIrpef"
            value={calculatorState.impostaIrpef}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>
      <div className="mt-4">
        <p className="font-bold">Costo totale: {calculatorState.costoTotale.toFixed(2)} €</p>
      </div>
    </div>
  );
};

export default CostoTotaleDipendenteCuneoFiscaleCalculator;
