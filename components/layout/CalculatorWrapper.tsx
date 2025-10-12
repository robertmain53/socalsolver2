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
    <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}
