'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

// --- Icona per i Tooltip ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const CalculatorSeoSchema = ({ schema }: { schema: object }) => (
  <script
    type="application/ld+json"
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
  const blocks = content.split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;
        if (trimmedBlock.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(4)) }} />;
        }
        if (trimmedBlock.startsWith('#### ')) {
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(5)) }} />;
        }
        if (trimmedBlock.startsWith('* ')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        if (/^\d+\.\s/.test(trimmedBlock)) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d+\.\s*/, ''));
          return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
      })}
    </div>
  );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "calculadora-coche-electrico-vs-combustion",
  "category": "Bienes Raíces y Vivienda",
  "title": "Calculadora de Conveniencia Coche Eléctrico vs. Combustión (con Plan MOVES)",
  "lang": "es",
  "inputs": [
    { "section": "Datos Comunes", "fields": [
      { "id": "km_anuales", "label": "Kilómetros Anuales Recorridos", "type": "number", "unit": "km", "min": 0, "step": 1000, "tooltip": "La distancia total que estimas recorrer en un año. Es el factor más importante para calcular el ahorro." }
    ]},
    { "section": "Vehículo Eléctrico (EV)", "fields": [
      { "id": "precio_compra_ev", "label": "Precio de Compra del EV", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Precio de venta al público (PVP) del coche eléctrico, incluyendo IVA." },
      { "id": "consumo_electrico", "label": "Consumo Medio del EV", "type": "number", "unit": "kWh/100km", "min": 0, "step": 0.5, "tooltip": "Eficiencia del vehículo eléctrico. Un valor típico es 15-20 kWh/100km. Consúltalo en la ficha técnica." },
      { "id": "precio_kwh_casa", "label": "Coste de Carga en Casa", "type": "number", "unit": "€/kWh", "min": 0, "step": 0.01, "tooltip": "Precio del kilovatio-hora en tu tarifa de luz doméstica (ej. 0.15 €/kWh)." },
      { "id": "coste_mantenimiento_ev", "label": "Mantenimiento Anual Estimado del EV", "type": "number", "unit": "€", "min": 0, "step": 10, "tooltip": "Coste aproximado de revisiones anuales. Suele ser más bajo que en un coche de combustión (ej. 150€)." }
    ]},
    { "section": "Vehículo de Combustión", "fields": [
      { "id": "precio_compra_comb", "label": "Precio de Compra del Coche de Combustión", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Precio de venta al público (PVP) de un coche de gasolina o diésel comparable." },
      { "id": "consumo_combustible", "label": "Consumo Medio de Combustible", "type": "number", "unit": "L/100km", "min": 0, "step": 0.1, "tooltip": "Eficiencia del vehículo de combustión. Un valor típico es 5-8 L/100km." },
      { "id": "precio_combustible", "label": "Precio del Combustible", "type": "number", "unit": "€/L", "min": 0, "step": 0.01, "tooltip": "Precio actual del litro de gasolina o diésel (ej. 1.60 €/L)." },
      { "id": "coste_mantenimiento_comb", "label": "Mantenimiento Anual Estimado", "type": "number", "unit": "€", "min": 0, "step": 10, "tooltip": "Coste aproximado de revisiones, cambios de aceite, etc. (ej. 300€)." }
    ]},
    { "section": "Ayudas del Plan MOVES III", "fields": [
      { "id": "aplica_moves", "label": "Solicitar ayuda del Plan MOVES III", "type": "boolean", "tooltip": "Marca esta casilla si el coche eléctrico es elegible para las ayudas del Plan MOVES (precio < 45.000€ sin IVA)." },
      { "id": "con_achatarramiento", "label": "Entregas un coche antiguo para achatarrar", "type": "boolean", "condition": "aplica_moves == true", "tooltip": "Si achatarras un vehículo de más de 7 años, la ayuda aumenta de 4.500€ a 7.000€." },
      { "id": "tipo_irpf", "label": "Tu Tipo Marginal de IRPF", "type": "number", "unit": "%", "min": 0, "max": 50, "step": 1, "condition": "aplica_moves == true", "tooltip": "¡Importante! La ayuda del MOVES se debe declarar como ganancia patrimonial. Indica tu tramo de IRPF para calcular el coste fiscal (un 30% es una buena estimación)." }
    ]}
  ],
  "outputs": [
    { "id": "coste_total_ev", "label": "Coste Total de Propiedad (5 años) - Eléctrico", "unit": "€" },
    { "id": "coste_total_comb", "label": "Coste Total de Propiedad (5 años) - Combustión", "unit": "€" },
    { "id": "ahorro_total_5_anos", "label": "Ahorro Total con el Eléctrico en 5 Años", "unit": "€" },
    { "id": "punto_equilibrio_anos", "label": "Punto de Equilibrio (Amortización)", "unit": "años" }
  ],
  "formulaSteps": [
    { "step": 1, "description": "Calcular Coste de Adquisición Neto del EV", "formula": "Coste Adquisición EV = Precio Compra EV - Ayuda MOVES + (Ayuda MOVES × % IRPF)" },
    { "step": 2, "description": "Calcular Coste Anual por Energía/Combustible", "formula": "Coste Anual = (km anuales / 100) × Consumo Medio × Precio Energía/Combustible" },
    { "step": 3, "description": "Calcular Coste Anual de Funcionamiento", "formula": "Coste Anual Funcionamiento = Coste Anual Energía/Combustible + Mantenimiento Anual" },
    { "step": 4, "description": "Calcular Coste Total de Propiedad (TCO) a 5 años", "formula": "TCO = Coste Adquisición + (5 × Coste Anual Funcionamiento)" },
    { "step": 5, "description": "Calcular Punto de Equilibrio en años", "formula": "Años = (Diferencia Coste Adquisición) / (Ahorro Anual en Funcionamiento)" }
  ],
  "examples": [
    { "name": "Conductor con alto kilometraje (25.000 km/año)", "inputs": { "km_anuales": 25000, "precio_compra_ev": 38000, "consumo_electrico": 16, "precio_kwh_casa": 0.15, "coste_mantenimiento_ev": 150, "precio_compra_comb": 30000, "consumo_combustible": 6.5, "precio_combustible": 1.6, "coste_mantenimiento_comb": 300, "aplica_moves": true, "con_achatarramiento": true, "tipo_irpf": 30 } },
    { "name": "Conductor urbano (10.000 km/año), sin achatarrar", "inputs": { "km_anuales": 10000, "precio_compra_ev": 32000, "consumo_electrico": 15, "precio_kwh_casa": 0.15, "coste_mantenimiento_ev": 120, "precio_compra_comb": 22000, "consumo_combustible": 5.5, "precio_combustible": 1.6, "coste_mantenimiento_comb": 250, "aplica_moves": true, "con_achatarramiento": false, "tipo_irpf": 24 } }
  ],
  "tags": "calculadora coche eléctrico vs combustión, plan moves, ahorro coche eléctrico, TCO coche eléctrico, ayudas coche eléctrico, punto de equilibrio, coste por km, España",
  "content": "### Introducción\n\n¿Es realmente rentable comprar un coche eléctrico? ... (testo omesso per brevità, usa il tuo originale) ...",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿La ayuda del Plan MOVES paga impuestos?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, rotundamente. ..." } },
      { "@type": "Question", "name": "¿Es rentable un coche eléctrico si no tengo garaje?", "acceptedAnswer": { "@type": "Answer", "text": "Depende. ..." } },
      { "@type": "Question", "name": "¿Por qué el mantenimiento de un EV es más barato?", "acceptedAnswer": { "@type": "Answer", "text": "Por su simplicidad mecánica. ..." } }
    ]
  }
};

// --- Grafico: import *lazy* di Recharts per evitare problemi SSR/hydration ---
const TcoChart: React.FC<{ data: Array<{ year: number; Eléctrico: number; Combustión: number }> }> = ({ data }) => {
  const [R, setR] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    import('recharts').then(mod => { if (mounted) setR(mod); });
    return () => { mounted = false; };
  }, []);

  if (!R) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg">
        <p>Cargando gráfico...</p>
      </div>
    );
  }

  const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip: RTooltip, Legend, CartesianGrid } = R;

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v ?? 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" label={{ value: 'Años', position: 'insideBottom', offset: -5 }} />
        <YAxis tickFormatter={(value: number) => `€${Number(value) / 1000}k`} />
        <RTooltip formatter={(value: number) => fmtCurrency(value)} />
        <Legend />
        <Line type="monotone" dataKey="Eléctrico" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Combustión" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const DynamicTcoChart = dynamic(async () => TcoChart, {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg"><p>Cargando gráfico...</p></div>,
});

// --- Helpers di formattazione ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number.isFinite(value) ? value : 0);

const formatNumber1d = (value: number) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Number.isFinite(value) ? value : 0);

const evaluateCondition = (expr: string, state: Record<string, unknown>): boolean => {
  // Supporta "aplica_moves == true"
  const m = expr.match(/^(\w+)\s*([=!]=)\s*(true|false)$/);
  if (!m) return true;
  const [, key, op, val] = m;
  const cur = Boolean(state[key]);
  const target = val === 'true';
  return op === '==' ? cur === target : cur !== target;
};

const CalculadoraCocheElectricoVsCombustion: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    km_anuales: 20000,
    precio_compra_ev: 35000,
    consumo_electrico: 15,
    precio_kwh_casa: 0.15,
    coste_mantenimiento_ev: 150,
    precio_compra_comb: 28000,
    consumo_combustible: 6,
    precio_combustible: 1.6,
    coste_mantenimiento_comb: 300,
    aplica_moves: true,
    con_achatarramiento: true,
    tipo_irpf: 30,
  };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  // Clamp/sanitizzazione input
  const clampValue = (id: string, raw: any) => {
    if (typeof states[id] === 'boolean') return Boolean(raw);
    const v = Number(raw);
    const nonNeg = Number.isFinite(v) ? Math.max(0, v) : 0;
    switch (id) {
      case 'km_anuales': return Math.round(nonNeg);
      case 'consumo_electrico':
      case 'consumo_combustible':
      case 'precio_kwh_casa':
      case 'precio_combustible': return nonNeg;
      case 'coste_mantenimiento_ev':
      case 'coste_mantenimiento_comb':
      case 'precio_compra_ev':
      case 'precio_compra_comb': return Math.round(nonNeg);
      case 'tipo_irpf': return Math.max(0, Math.min(50, Math.round(nonNeg)));
      default: return nonNeg;
    }
  };

  const handleStateChange = useCallback((id: string, value: any) => {
    const next = clampValue(id, value);
    setStates(prev => ({ ...prev, [id]: next }));
  }, []);

  const handleCheckbox = useCallback((id: string, checked: boolean) => {
    setStates(prev => ({ ...prev, [id]: checked }));
  }, []);

  const handleReset = useCallback(() => {
    setStates(initialStates);
  }, []);

  const calculatedOutputs = useMemo(() => {
    const {
      km_anuales,
      precio_compra_ev, consumo_electrico, precio_kwh_casa, coste_mantenimiento_ev,
      precio_compra_comb, consumo_combustible, precio_combustible, coste_mantenimiento_comb,
      aplica_moves, con_achatarramiento, tipo_irpf
    } = states as Record<string, number | boolean>;

    // Estimación de elegibilidad por precio: la norma usa PVP sin IVA < 45.000 €
    // Convertimos PVP con IVA a sin IVA asumiendo IVA 21% (aprox; puede variar en Canarias, etc.)
    const precio_sin_iva_estim = (precio_compra_ev as number) / 1.21;
    const elegible_por_precio = precio_sin_iva_estim <= 45000;

    const ayuda_moves_bruta =
      (aplica_moves as boolean) && elegible_por_precio
        ? ((con_achatarramiento as boolean) ? 7000 : 4500)
        : 0;

    const impacto_fiscal_moves = ayuda_moves_bruta * ((tipo_irpf as number) / 100);
    const coste_adquisicion_ev = (precio_compra_ev as number) - ayuda_moves_bruta + impacto_fiscal_moves;

    const coste_anual_energia_ev = ((km_anuales as number) / 100) * (consumo_electrico as number) * (precio_kwh_casa as number);
    const coste_anual_comb = ((km_anuales as number) / 100) * (consumo_combustible as number) * (precio_combustible as number);

    const coste_funcionamiento_ev = coste_anual_energia_ev + (coste_mantenimiento_ev as number);
    const coste_funcionamiento_comb = coste_anual_comb + (coste_mantenimiento_comb as number);

    const TCO_YEARS = 5;
    const coste_total_ev = coste_adquisicion_ev + (TCO_YEARS * coste_funcionamiento_ev);
    const coste_total_comb = (precio_compra_comb as number) + (TCO_YEARS * coste_funcionamiento_comb);
    const ahorro_total_5_anos = coste_total_comb - coste_total_ev;

    const diferencia_adquisicion = coste_adquisicion_ev - (precio_compra_comb as number);
    const ahorro_anual_funcionamiento = coste_funcionamiento_comb - coste_funcionamiento_ev;

    // Break-even:
    // - si la diferencia inicial <= 0 → amortiza desde el día 1 (0 años)
    // - si el ahorro anual <= 0 y la diferencia > 0 → no se amortiza (Infinity)
    // - si ambos >0 → años = dif / ahorro
    let punto_equilibrio_anos: number = 0;
    if (diferencia_adquisicion > 0) {
      punto_equilibrio_anos = (ahorro_anual_funcionamiento > 0)
        ? (diferencia_adquisicion / ahorro_anual_funcionamiento)
        : Infinity;
    } else {
      punto_equilibrio_anos = 0;
    }

    return {
      coste_total_ev,
      coste_total_comb,
      ahorro_total_5_anos,
      punto_equilibrio_anos,
      coste_adquisicion_ev,
      coste_funcionamiento_ev,
      coste_funcionamiento_comb,
      ayuda_moves_bruta,
      elegible_por_precio
    };
  }, [states]);

  const chartData = useMemo(() => {
    const data: Array<{ year: number; Eléctrico: number; Combustión: number }> = [];
    const { precio_compra_comb } = states as any;
    const { coste_adquisicion_ev, coste_funcionamiento_ev, coste_funcionamiento_comb } = calculatedOutputs;

    for (let i = 0; i <= 10; i++) {
      data.push({
        year: i,
        Eléctrico: (coste_adquisicion_ev ?? 0) + (i * (coste_funcionamiento_ev ?? 0)),
        Combustión: (precio_compra_comb ?? 0) + (i * (coste_funcionamiento_comb ?? 0)),
      });
    }
    return data;
  }, [states, calculatedOutputs]);

  const formatBreakeven = (value: number) => {
    if (!Number.isFinite(value)) return "No se amortiza";
    if (value <= 0) return "0 (desde el día 1)";
    return `${formatNumber1d(value)} años`;
  };

  return (
    <>
      <CalculatorSeoSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Descubre el coste total real y en cuántos años amortizarás un coche eléctrico frente a uno de combustión.</p>

              <div className="space-y-6">
                {inputs.map(section => (
                  <div key={section.section}>
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{section.section}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {section.fields.map(input => {
                        const conditionMet = !('condition' in input) || evaluateCondition(String((input as any).condition), states);
                        if (!conditionMet) return null;

                        if (input.type === 'boolean') {
                          return (
                            <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                              <input
                                id={input.id}
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={!!states[input.id]}
                                onChange={(e) => handleCheckbox(input.id, e.target.checked)}
                              />
                              <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                {input.label}
                                <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                              </label>
                            </div>
                          );
                        }

                        return (
                          <div key={input.id}>
                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                              {input.label}
                              <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                            </label>
                            <div className="relative">
                              {input.unit === '€' && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>}
                              <input
                                id={input.id}
                                aria-label={input.label}
                                className={`w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 ${input.unit === '€' ? 'pl-7 pr-3' : 'pl-3 pr-12'} text-right`}
                                type="number"
                                min={input.min}
                                step={input.step}
                                value={states[input.id]}
                                onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))}
                              />
                              {input.unit !== '€' && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">{input.unit}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Nota de elegibilidad MOVES por precio */}
                    {section.section === 'Ayudas del Plan MOVES III' && states.aplica_moves && isClient && calculatedOutputs && !calculatedOutputs.elegible_por_precio && (
                      <div className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
                        <strong>Aviso:</strong> Según tu PVP con IVA, el precio estimado sin IVA supera 45.000€; he supuesto que <em>no</em> aplica la ayuda MOVES (0 €).
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Resultados: ¿Qué opción es más rentable?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outputs.map(output => {
                    const id = output.id as keyof typeof calculatedOutputs;
                    const isEuro = output.unit === '€';
                    const isBreakEven = output.id === 'punto_equilibrio_anos';

                    let mainText = '...';
                    if (isClient) {
                      if (isBreakEven) {
                        mainText = formatBreakeven((calculatedOutputs as any)[id]);
                      } else if (isEuro) {
                        mainText = formatCurrency((calculatedOutputs as any)[id]);
                      } else {
                        mainText = formatNumber1d((calculatedOutputs as any)[id]) + (output.unit ? ` ${output.unit}` : '');
                      }
                    }

                    return (
                      <div key={output.id} className={`p-4 rounded-lg ${output.id === 'ahorro_total_5_anos' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'} border-l-4`}>
                        <div className="text-sm font-medium text-gray-700">{output.label}</div>
                        <div className={`text-2xl font-bold mt-1 ${output.id === 'ahorro_total_5_anos' ? 'text-green-600' : 'text-gray-800'}`}>
                          {mainText}
                          {/* Evita doppio "€": lo aggiungiamo solo nei non-currency sopra */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Evolución del Coste Acumulado y Punto de Equilibrio</h3>
                <p className="text-sm text-gray-600 mb-2">El gráfico muestra cómo el coste total del coche eléctrico (verde) crece más lentamente que el de combustión (ámbar). La intersección indica la amortización.</p>
                <div className="h-96 w-full bg-gray-50 p-4 rounded-lg">
                  <DynamicTcoChart data={chartData} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-2 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => {
                try {
                  const payload = { slug: calculatorData.slug, title: calculatorData.title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
                  const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
                  localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
                  alert("Resultado guardado localmente.");
                } catch {
                  alert("No se pudo guardar el resultado.");
                }
              }} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>

              <button onClick={async () => {
                try {
                  const html2canvas = (await import("html2canvas")).default;
                  const { default: jsPDF } = await import("jspdf");
                  if (!calculatorRef.current) return;
                  const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
                  const imgData = canvas.toDataURL("image/png");
                  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                  pdf.save(`${calculatorData.slug}.pdf`);
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error(e);
                  alert("Error al exportar a PDF.");
                }
              }} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>

              <button onClick={() => setStates(initialStates)} className="col-span-2 w-full border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Resetear</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía de Análisis</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.idae.es/ayudas-y-financiacion/para-movilidad-y-vehiculos/plan-moves-iii" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Plan MOVES III - IDAE</a></li>
              <li><a href="https://www.agenciatributaria.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria</a> - Tributación de ayudas públicas.</li>
              <li><a href="https://ec.europa.eu/eurostat" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Eurostat</a> - Precios medios de la energía.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCocheElectricoVsCombustion;
