'use client';
import { useState, useCallback, useMemo } from 'react';

export interface CalculatorState {
  inputs: Record<string, any>;
  results: Record<string, number>;
  errors: Record<string, string>;
  isCalculating: boolean;
}

export interface CalculatorConfig {
  defaultInputs?: Record<string, any>;
  validators?: Record<string, (value: any) => string | null>;
  calculator: (inputs: Record<string, any>) => Record<string, number>;
}

export function useCalculator(config: CalculatorConfig) {
  const [state, setState] = useState<CalculatorState>({
    inputs: config.defaultInputs || {},
    results: {},
    errors: {},
    isCalculating: false,
  });

  const updateInput = useCallback((key: string, value: any) => {
    setState(prev => {
      const newInputs = { ...prev.inputs, [key]: value };
      const errors = { ...prev.errors };
      
      // Validazione
      if (config.validators?.[key]) {
        const error = config.validators[key](value);
        if (error) {
          errors[key] = error;
        } else {
          delete errors[key];
        }
      }
      
      // Calcolo automatico se non ci sono errori
      let results = prev.results;
      if (Object.keys(errors).length === 0) {
        try {
          results = config.calculator(newInputs);
        } catch (e) {
          console.error('Calculation error:', e);
        }
      }
      
      return {
        ...prev,
        inputs: newInputs,
        errors,
        results,
      };
    });
  }, [config]);

  const recalculate = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCalculating: true,
    }));

    setTimeout(() => {
      setState(prev => {
        try {
          const results = config.calculator(prev.inputs);
          return {
            ...prev,
            results,
            isCalculating: false,
          };
        } catch (e) {
          return {
            ...prev,
            isCalculating: false,
          };
        }
      });
    }, 100);
  }, [config]);

  const reset = useCallback(() => {
    setState({
      inputs: config.defaultInputs || {},
      results: {},
      errors: {},
      isCalculating: false,
    });
  }, [config]);

  const isValid = useMemo(() => {
    return Object.keys(state.errors).length === 0;
  }, [state.errors]);

  return {
    inputs: state.inputs,
    results: state.results,
    errors: state.errors,
    isCalculating: state.isCalculating,
    isValid,
    updateInput,
    recalculate,
    reset,
  };
}
