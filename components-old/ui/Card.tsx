'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

export default function Card({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  padding = 'md'
}: CardProps) {
  return (
    <motion.div
      className={`
        bg-white rounded-2xl shadow-lg
        ${gradient ? 'bg-gradient-to-br from-white to-blue-50' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      whileHover={hover ? { 
        y: -4, 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
