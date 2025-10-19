'use client';
import React, { useState, createContext, useContext } from 'react';
import ToolsSidebar from './ToolsSidebar';

// Context per  condividere dati tra calcolatore e sidebar
interface CalculatorContextType {
  results: Record<string, number>;
  inputs: Record<string, any>;
  updateResults: (results: Record<string, number>) => void;
  updateInputs: (inputs: Record<string, any>) => void;
}

const CalculatorContext = createContext<CalculatorContextType>({
  results: {},
  inputs: {},
  updateResults: () => {},
  updateInputs: () => {},
});

export const useCalculator = () => useContext(CalculatorContext);

interface CalculatorWrapperProps {
  children: React.ReactNode;
  calculatorName: string;
  category?: string;
  slug?: string;
  lang?: string;
}

export default function CalculatorWrapper({ 
  children, 
  calculatorName,
  lang = 'it'
}: CalculatorWrapperProps) {
  const [results, setResults] = useState<Record<string, number>>({});
  const [inputs, setInputs] = useState<Record<string, any>>({});

  const updateResults = (newResults: Record<string, number>) => {
    setResults(newResults);
  };

  const updateInputs = (newInputs: Record<string, any>) => {
    setInputs(newInputs);
  };

  const contextValue: CalculatorContextType = {
    results,
    inputs,
    updateResults,
    updateInputs,
  };

  return (
    <CalculatorContext.Provider value={contextValue}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg">
          {children}
        </div>
        
        {/* Enhanced Sidebar */}
        <ToolsSidebar 
          calculatorName={calculatorName}
          results={results}
          inputs={inputs}
          lang={lang}
        />
      </div>
    </CalculatorContext.Provider>
  );
}
