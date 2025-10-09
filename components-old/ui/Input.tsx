'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

/** --- 1. Proprietà aggiuntive specifiche del componente ------------------- */
interface InputOwnProps {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  unit?: string;
}

/** --- 2. Prop nativi di <input>, ma SENZA gli handler di drag ------------- */
type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd'
>;

/** --- 3. Extra di Framer-Motion (facoltativo) ----------------------------- */
type MotionExtras = HTMLMotionProps<'input'>;

/** --- 4. Prop finali che il componente accetta --------------------------- */
export type InputProps = InputOwnProps & NativeInputProps & MotionExtras;

/* ------------------------------------------------------------------------- */

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      unit,
      ...props   // NON contiene onDrag*, quindi niente conflitti di tipi
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    /* ----------------- markup ------------------------------------------------ */
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}

          {/* ------- l’input animato ------------------------------------------ */}
          <motion.input
            ref={ref}
            className={`
              block w-full rounded-lg border-2 px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-0 transition-all duration-200
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || unit ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-300 focus:border-red-500'
                  : isFocused
                  ? 'border-blue-500 shadow-colored'
                  : 'border-gray-200 hover:border-gray-300'
              }
              ${className ?? ''}
            `}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            animate={{ scale: isFocused ? 1.01 : 1 }}
            transition={{ duration: 0.2 }}
            {...props}  /* spread finale: ora sicuro */
          />

          {(rightIcon || unit) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {unit ? (
                <span className="text-gray-500 font-medium">{unit}</span>
              ) : (
                <span className="text-gray-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
          >
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
