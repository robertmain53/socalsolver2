/**
 * Utilità matematiche per calcolatori professionali
 */

export const formatCurrency = (value: number, currency = 'EUR', locale = 'it-IT'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  periods: number
): number => {
  return principal * Math.pow(1 + rate, periods);
};
