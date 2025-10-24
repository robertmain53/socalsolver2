'use client';

import React from 'react';

interface ComparaContiPageProps {
  title: string;
  description: string;
  content: string; // The parsed markdown content
  // Add any other props that the calculator might need from the markdown or registry
}

const ComparaContiPage: React.FC<ComparaContiPageProps> = ({ title, description, content }) => {
  return (
    <div className="p-4 md:p-6 bg-gray-50 font-sans">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
        <p className="text-gray-600 mb-4">{description}</p>

        {/* Render the markdown content */}
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />

        {/* Placeholder for the actual calculator UI */}
        <div className="mt-8 p-4 border rounded-lg bg-blue-50 border-blue-200 text-blue-800">
          <p className="font-semibold">Placeholder per il comparatore di conti.</p>
          <p>Qui verrà implementata la logica per confrontare conti correnti e conti deposito.</p>
          {/* Example input fields could go here */}
          {/*
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">Tipo di Conto</label>
              <select id="accountType" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option>Conto Corrente</option>
                <option>Conto Deposito</option>
              </select>
            </div>
            <div>
              <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700">Importo da depositare (€)</label>
              <input type="number" id="depositAmount" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Compara</button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default ComparaContiPage;