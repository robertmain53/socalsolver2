'use client';

import React, { useState } from 'react';

export const meta = {
  title: 'Calcolo Tasse Giornalisti e Contributi INPGI',
  description: 'Calcola tasse e contributi previdenziali INPGI per giornalisti freelance, pubblicisti e praticanti.'
};

export default function TasseGiornalistiCalculator() {
  const [fatturato, setFatturato] = useState<number>(30000);
  const [aliquota, setAliquota] = useState<number>(15);

  // Coefficiente di redditività per giornalisti
  const coefficienteRedditivita = 0.78;

  // Calcolo reddito imponibile
  const redditoImponibile = fatturato * coefficienteRedditivita;

  // Contributi INPGI (semplificato)
  const contributoSoggettivo = redditoImponibile * 0.10; // 10% del reddito
  const contributoIntegrativo = fatturato * 0.04; // 4% del fatturato

  // Reddito dopo contributi
  const redditoDopoContributi = redditoImponibile - contributoSoggettivo;

  // Imposta sostitutiva
  const impostaSostitutiva = redditoDopoContributi * (aliquota / 100);

  // Netto annuale
  const nettoAnnuale = fatturato - contributoSoggettivo - contributoIntegrativo - impostaSostitutiva;
  const nettoMensile = nettoAnnuale / 12;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Calcolo Tasse Giornalisti e Contributi INPGI
      </h1>

      <div className="space-y-6">
        {/* Input Fatturato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fatturato Annuo (€)
          </label>
          <input
            type="number"
            value={fatturato}
            onChange={(e) => setFatturato(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="1000"
          />
        </div>

        {/* Aliquota */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aliquota Imposta Sostitutiva
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="5"
                checked={aliquota === 5}
                onChange={() => setAliquota(5)}
                className="mr-2"
              />
              5% (primi 5 anni)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="15"
                checked={aliquota === 15}
                onChange={() => setAliquota(15)}
                className="mr-2"
              />
              15% (ordinaria)
            </label>
          </div>
        </div>

        {/* Risultati */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Riepilogo</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Fatturato Annuo</p>
              <p className="text-2xl font-bold text-gray-900">
                €{fatturato.toLocaleString('it-IT')}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Reddito Imponibile</p>
              <p className="text-2xl font-bold text-gray-900">
                €{redditoImponibile.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Contributo Soggettivo INPGI</p>
              <p className="text-2xl font-bold text-orange-600">
                €{contributoSoggettivo.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Contributo Integrativo INPGI</p>
              <p className="text-2xl font-bold text-orange-600">
                €{contributoIntegrativo.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Imposta Sostitutiva ({aliquota}%)</p>
              <p className="text-2xl font-bold text-red-600">
                €{impostaSostitutiva.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Netto Annuale</p>
              <p className="text-2xl font-bold text-green-600">
                €{nettoAnnuale.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Guadagno Netto Mensile Stimato</p>
            <p className="text-4xl font-bold text-blue-600">
              €{nettoMensile.toLocaleString('it-IT', { maximumFractionDigits: 0 })}/mese
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-700">
            <strong>Nota:</strong> Questo calcolatore fornisce una stima semplificata.
            I contributi INPGI effettivi possono variare in base alla categoria di iscrizione
            (giornalista professionista, pubblicista, praticante) e ad altri fattori.
            Consultare sempre un commercialista per un calcolo preciso.
          </p>
        </div>
      </div>
    </div>
  );
}
