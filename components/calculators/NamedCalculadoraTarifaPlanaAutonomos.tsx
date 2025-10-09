'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import brackets from './brackets-es-ccaa.json';

// ==============================
// Tipi e config
// ==============================
type Tramo = { hasta: number | null; tipo: number };
type BracketsFile = {
  tramosEstatales: Tramo[];
  tramosAutonomicos: Record<string, Tramo[]>;
};

// Limite configurabile per piani pensione (puoi spostarlo in .env o config)
const CAP_APORTACIONES_PENSIONES = 1500;

// ==============================
// Icona Info & Tooltip
// ==============================
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative inline-flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// ==============================
// Injector JSON-LD
// ==============================
const SchemaInjector = ({ schema }: { schema: any }) => {
  useEffect(() => {
    if (!schema) return;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(schema);
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, [schema]);
  return null;
};

// ==============================
// Markdown-lite renderer
// ==============================
const ContentRenderer = ({ content }: { content: string }) => {
  const htmlize = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
     .replace(/_(.*?)_/g, '<em>$1</em>');
  const blocks = (content || '').split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: htmlize(t.replace(/^###\s+/, '')) }} />;
        if (t.startsWith('#### ')) return <h4 key={i} className="text-lg font-semibold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: htmlize(t.replace(/^####\s+/, '')) }} />;
        if (t.startsWith('- ') || t.startsWith('* ')) {
          const items = t.split('\n').map(x => x.replace(/^[-*]\s+/, ''));
          return (
            <ul key={i} className="list-disc pl-5 space-y-1 mb-3">
              {items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: htmlize(it) }} />)}
            </ul>
          );
        }
        return <p key={i} className="mb-3" dangerouslySetInnerHTML={{ __html: htmlize(t) }} />;
      })}
    </div>
  );
};

// ==============================
// Helper calcolo tramos (con desglose)
// ==============================
const aplicarTramos = (base: number, tramos: Tramo[]) => {
  let restante = Math.max(0, base);
  let cuota = 0;
  let marginal = 0;
  let limiteAnterior = 0;
  const desglose: { rango: string; base: number; tipo: number; cuota: number }[] = [];
  for (const t of tramos) {
    const limite = t.hasta ?? Infinity;
    const imponibleTramo = Math.max(0, Math.min(restante, limite - limiteAnterior));
    if (imponibleTramo > 0) {
      const c = imponibleTramo * (t.tipo / 100);
      cuota += c;
      marginal = t.tipo;
      desglose.push({
        rango: `${limiteAnterior.toLocaleString('es-ES')} - ${isFinite(limite) ? limite.toLocaleString('es-ES') : '∞'}`,
        base: imponibleTramo,
        tipo: t.tipo,
        cuota: c
      });
      restante -= imponibleTramo;
    }
    limiteAnterior = limite;
    if (restante <= 0) break;
  }
  return { cuota, marginal, desglose };
};

// ==============================
// Lazy chart (typed) — Recharts caricato solo client-side
// ==============================
type ChartDatum = { name: string; Estatal: number; ['Autonómica']?: number; ['Autonómica']?: number; Total: number }; // <-- placeholder to avoid TS error
// OOPS above line incorrect; Let's correct:

