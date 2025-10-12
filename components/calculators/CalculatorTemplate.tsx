'use client';

import React from 'react';

/**
 * Standard Calculator Template
 * This ensures all calculators have consistent layout and styling
 */

// --- Info Icon Component ---
export const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400 hover:text-gray-600 transition-colors"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Tooltip Component ---
export const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Input Field Component ---
export const InputField = ({
  label,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step,
  tooltip,
  unit,
  placeholder
}: {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  type?: 'number' | 'text';
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  unit?: string;
  placeholder?: string;
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {label}
      {tooltip && (
        <Tooltip text={tooltip}>
          <InfoIcon />
        </Tooltip>
      )}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      {unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
          {unit}
        </span>
      )}
    </div>
  </div>
);

// --- Select Field Component ---
export const SelectField = ({
  label,
  value,
  onChange,
  options,
  tooltip
}: {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  options: { value: string | number; label: string }[];
  tooltip?: string;
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {label}
      {tooltip && (
        <Tooltip text={tooltip}>
          <InfoIcon />
        </Tooltip>
      )}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// --- Result Card Component ---
export const ResultCard = ({
  label,
  value,
  variant = 'default',
  className = ''
}: {
  label: string;
  value: string | number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}) => {
  const variants = {
    default: 'bg-gray-50 text-gray-900',
    primary: 'bg-blue-50 text-blue-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-orange-50 text-orange-600',
    danger: 'bg-red-50 text-red-600'
  };

  return (
    <div className={`p-4 rounded-lg ${variants[variant]} ${className}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

// --- Calculator Container Component ---
export const CalculatorContainer = ({
  title,
  children,
  className = ''
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`w-full max-w-4xl mx-auto ${className}`}>
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
        {title}
      </h1>
      {children}
    </div>
  </div>
);

// --- Section Component ---
export const Section = ({
  title,
  children,
  className = ''
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-4 ${className}`}>
    {title && (
      <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
        {title}
      </h2>
    )}
    {children}
  </div>
);

// --- Results Grid Component ---
export const ResultsGrid = ({
  children,
  columns = 2
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4`}>
      {children}
    </div>
  );
};

// --- Note/Warning Component ---
export const Note = ({
  children,
  variant = 'info'
}: {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'danger';
}) => {
  const variants = {
    info: 'bg-blue-50 border-blue-400 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    success: 'bg-green-50 border-green-400 text-green-800',
    danger: 'bg-red-50 border-red-400 text-red-800'
  };

  return (
    <div className={`p-4 border-l-4 rounded ${variants[variant]}`}>
      <p className="text-sm">{children}</p>
    </div>
  );
};

// --- Utility function for currency formatting ---
export const formatCurrency = (value: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// --- Utility function for number formatting ---
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

// --- Utility function for percentage formatting ---
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};
