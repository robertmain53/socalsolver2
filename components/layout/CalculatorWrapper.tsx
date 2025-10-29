/**
 * Universal Calculator Wrapper
 * Ensures all calculators have consistent styling and layout
 */

import React from 'react';

interface CalculatorWrapperProps {
  children: React.ReactNode;
}

export default function CalculatorWrapper({ children }: CalculatorWrapperProps) {
  return (
    <div className="calculator-card w-full bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="calculator-card__inner p-4 sm:p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
