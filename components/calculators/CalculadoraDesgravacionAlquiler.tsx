'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* ============ Utilidades UI ============ */

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

/* ============ Datos (es-ES) ============ */

const calculatorData = {
  slug: 'calculadora-desgravacion-alquiler',
  category: 'Bienes raíces y vivienda',
  title: 'Calculadora de desgravación por alquiler de vivienda habitual',
  lang: 'es',
  inputs: [
    {
      group: '1. Ingresos anuales',
      fields: [
        {
          id: 'ingresosAlquiler',
          label: 'Ingresos íntegros del alquiler (anual)',
          type: 'number' as const,
          unit: '€',
          tooltip: 'Suma de todas las mensualidades cobradas en el año, sin incluir fianzas ni otros conceptos.',
          min: 0,
          max: 1000000,
          step: 0.01,
        },
      ],
    },
    {
      group: '2. Gastos deducibles anuales',
      fields: [
        {
          id: 'interesesHipoteca',
          label: 'Intereses de préstamos/hipoteca',
          type: 'number' as const,
          unit: '€',
          tooltip: 'Sólo la parte de intereses. El capital amortizado no es deducible.',
          min: 0, max: 1000000, step: 0.01,
        },
        {
          id: 'gastosConservacion',
          label: 'Reparación y conservación',
          type: 'number' as const,
          unit: '€',
          tooltip:
            'Pintura, arreglos, mantenimiento ordinario. No incluye mejoras que aumenten el valor del inmueble.',
          min: 0, max: 1000000, step: 0.01,
        },
        {
          id: 'ibi',
          label: 'IBI y otras tasas',
          type: 'number' as const,
          unit: '€',
          tooltip: 'IBI, tasa de basuras y otros tributos locales soportados por el propietario.',
          min: 0, max: 1000000, step: 0.01,
        },
        {
          id: 'gastosComunidad',
          label: 'Gastos de comunidad',
          type: 'number' as const,
          unit: '€',
          tooltip: 'Cuotas de la comunidad de propietarios.',
          min: 0, max: 1000000, step: 0.01,
        },
        {
          id: 'seguros',
          label: 'Seguros del inmueble',
          type: 'number' as const,
          unit: '€',
          tooltip: 'Hogar, RC, impago, etc.',
          min: 0, max: 1000000, step: 0.01,
        },
        {
          id: 'suministros',
          label: 'Suministros (si los paga el propietario)',
          type: 'number' as const,
          unit: '€',
          tooltip: 'Agua, luz, gas… sólo si figuran a tu nombre y los pagas tú.',
          min: 0, max: 1000000, step: 0.01,
        },
        {
          id: 'amortizacionInmueble',
          label: 'Amortización del inmueble',
          type: 'number' as const,
          unit: '€',
          tooltip: 'Normalmente, el 3% anual sobre el mayor entre el coste de la construcción y el valor catastral de la construcción (sin suelo).',
          min: 0, max: 1000000, step: 0.01,
        },
        {
          id: 'otrosGastos',
          label: 'Otros gastos deducibles',
          type: 'number' as const,
          unit: '€',
          tooltip: 'Agencia, anuncios, certificaciones, etc.',
          min: 0, max: 1000000, step: 0.01,
        },
      ],
    },
    {
      group: '3. Arrastres pendientes (límite intereses + reparación)',
      fields: [
        {
          id: 'arrastrePendiente',
          label: 'Arrastres de años anteriores (pendiente de aplicar)',
          type: 'number' as const,
          unit: '€',
          tooltip:
            'Excesos no deducidos en ejercicios previos del grupo “intereses + reparación/conservación”. Se podrán aplicar con el mismo límite durante un máximo de 4 años.',
          min: 0, max: 1000000, step: 0.01,
        },
      ],
    },
  ],
  outputs: [
    { id: 'totalGastosDeducibles', label: 'Total gastos deducibles' },
    { id: 'grupoAplicado', label: 'Grupo aplicado este año (intereses + reparación)' },
    { id: 'arrastreAplicado', label: 'Arrastre aplicado (ejercicios previos)' },
    { id: 'nuevoArrastre', label: 'Nuevo arrastre pendiente' },
    { id: 'rendimientoNetoPrevio', label: 'Rendimiento neto previo (Ingresos − Gastos)' },
    { id: 'reduccionAplicada', label: 'Regla de reducción aplicada' },
    { id: 'reduccionImporte', label: 'Importe de la reducción' },
    { id: 'rendimientoNetoFinal', label: 'Rendimiento neto reducido (base imponible)' },
  ],
  content: `### Objetivo
Calcula tu **base imponible** por alquiler de vivienda habitual, aplicando correctamente:
- Deducciones permitidas (intereses, reparación/conservación, IBI, comunidad, seguros, suministros, amortización, otros).
- **Límite conjunto** de *intereses + reparación/conservación*: no puede exceder los **ingresos íntegros**; el exceso **se arrastra** hasta 4 años.
- Reducciones vigentes según **año fiscal** y condiciones.

### Cómo usarla
1) Introduce tus **ingresos íntegros** y **gastos** del año.  
2) Si tienes **arrastres pendientes** del grupo (intereses + reparación), añádelos.  
3) Configura el **año fiscal** y, si procede, las condiciones para 2024+.  

### Metodología (resumen)
1. *Rendimiento neto previo* = Ingresos − Gastos deducibles (aplicando el **tope del grupo** y arrastres).  
2. *Reducción* (si vivienda habitual y rendimiento > 0):  
   - **2023**: 60%.  
   - **2024+**: base 50%; 60% si mejoras eficiencia; 70% si nuevo contrato en zona tensionada a joven (18–35); 90% si rebaja de renta ≥ 5%.  
3. *Rendimiento neto final* = Previo − Reducción.`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué gastos puedo deducir en el alquiler?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Los necesarios para la obtención de la renta: intereses de préstamos, reparación y conservación, IBI, comunidad, seguros, suministros si los pagas tú, amortización del inmueble y otros gastos vinculados.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo funciona el límite de intereses + reparación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'La suma de intereses y reparación/conservación no puede superar los ingresos íntegros del inmueble. El exceso no deducido se puede arrastrar hasta 4 años, respetando siempre el mismo límite.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuándo se aplica la reducción?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Si el arrendamiento es de vivienda habitual y hay rendimiento neto positivo. En 2023 es el 60%. En 2024+ la reducción base es 50% con incrementos según condiciones legales.',
        },
      },
    ],
  },
} as const;

/* ============ SEO JSON-LD ============ */

const FaqSchema = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }}
  />
);

/* ============ Render de contenido (markdown simple) ============ */

const ContentRenderer = ({ content }: { content: string }) => {
  const render = () =>
    content.split('\n\n').map((p, i) => {
      if (p.startsWith('### ')) {
        return (
          <h3 key={i} className="text-xl font-bold mt-6 mb-4 text-gray-800"
            dangerouslySetInnerHTML={{ __html: p.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        );
      }
      if (p.startsWith('- ') || p.startsWith('* ')) {
        const items = p.split('\n').map((li, j) => (
          <li key={j} className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: li.replace(/^[-*] /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
        return <ul key={i} className="list-disc pl-5 space-y-2 mb-4">{items}</ul>;
      }
      return (
        <p key={i} className="mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      );
    });
  return <div className="prose prose-sm max-w-none text-gray-700">{render()}</div>;
};

/* ============ Gráfico (dinámico) ============ */

const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
  const Chart = ({ data, formatCurrency }: { data: any[]; formatCurrency: (v: number) => string }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <mod.XAxis type="number" hide />
        <mod.YAxis type="category" dataKey="name" hide />
        <mod.Tooltip formatter={(v: number) => formatCurrency(v)} />
        <mod.Bar dataKey="gastosNoLimit" stackId="a" fill="#c7d2fe" name="Gastos sin límite" />
        <mod.Bar dataKey="grupoAplicado" stackId="a" fill="#fca5a5" name="Grupo intereses+reparación" />
        <mod.Bar dataKey="arrastreAplicado" stackId="a" fill="#fde68a" name="Arrastre aplicado" />
        <mod.Bar dataKey="reduccion" stackId="a" fill="#a78bfa" name="Reducción" />
        <mod.Bar dataKey="baseImponible" stackId="a" fill="#86efac" name="Rendimiento final" />
      </mod.BarChart>
    </mod.ResponsiveContainer>
  );
  return Chart;
}), { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico…</div> });

/* ============ Componente principal ============ */

type YearOption = '2023' | '2024+';

type FieldDef = {
  id: string;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  type: 'number';
};

const CalculadoraDesgravacionAlquiler: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // Valores por defecto
  const initial: Record<string, number> = {
    ingresosAlquiler: 12000,
    interesesHipoteca: 2500,
    gastosConservacion: 400,
    ibi: 500,
    gastosComunidad: 720,
    seguros: 300,
    suministros: 0,
    amortizacionInmueble: 3000,
    otrosGastos: 150,
    arrastrePendiente: 0,
  };

  const [states, setStates] = useState<Record<string, number>>(initial);

  // Parámetros reducción
  const [year, setYear] = useState<YearOption>('2023');
  const [viviendaHabitual, setViviendaHabitual] = useState<boolean>(true);
  const [contratoNuevo2024, setContratoNuevo2024] = useState<boolean>(false);
  const [zonaTensionada, setZonaTensionada] = useState<boolean>(false);
  const [arrendatarioJoven, setArrendatarioJoven] = useState<boolean>(false);
  const [mejorasEficiencia, setMejorasEficiencia] = useState<boolean>(false);
  const [rebajaRenta5, setRebajaRenta5] = useState<boolean>(false);

  // Normalización y clamping
  const toPosNumber = (v: string) => {
    const n = parseFloat(v.replace(',', '.'));
    if (!isFinite(n) || isNaN(n)) return 0;
    return Math.max(0, n);
  };

  const clamp = (n: number, min?: number, max?: number) => {
    let x = n;
    if (typeof min === 'number') x = Math.max(min, x);
    if (typeof max === 'number') x = Math.min(max, x);
    return x;
  };

  const handleChange = (field: FieldDef, raw: string) => {
    const val = toPosNumber(raw);
    const clamped = clamp(val, field.min, field.max);
    setStates(prev => ({ ...prev, [field.id]: clamped }));
  };

  const handleReset = () => {
    setStates(initial);
    setYear('2023');
    setViviendaHabitual(true);
    setContratoNuevo2024(false);
    setZonaTensionada(false);
    setArrendatarioJoven(false);
    setMejorasEficiencia(false);
    setRebajaRenta5(false);
  };

  // Cálculos con tope grupo (intereses + reparación) y arrastre
  const calc = useMemo(() => {
    const ingresos = states.ingresosAlquiler ?? 0;

    // Gastos sin límite específico
    const gastosNoLimit =
      (states.ibi ?? 0) +
      (states.gastosComunidad ?? 0) +
      (states.seguros ?? 0) +
      (states.suministros ?? 0) +
      (states.amortizacionInmueble ?? 0) +
      (states.otrosGastos ?? 0);

    // Grupo con límite y arrastre
    const intereses = states.interesesHipoteca ?? 0;
    const reparacion = states.gastosConservacion ?? 0;
    const arrastrePrevio = states.arrastrePendiente ?? 0;

    const capacidadGrupo = Math.max(0, ingresos); // límite legal: no exceder ingresos íntegros
    const grupoAnual = intereses + reparacion;

    // Se prioriza aplicar el gasto del año y después el arrastre previo
    const grupoAplicado = Math.min(capacidadGrupo, grupoAnual);
    const capacidadRestante = Math.max(0, capacidadGrupo - grupoAplicado);
    const arrastreAplicado = Math.min(capacidadRestante, arrastrePrevio);

    // Nuevo arrastre pendiente para ejercicios futuros (hasta 4 años)
    const excesoAnualNoDeducido = Math.max(0, grupoAnual - grupoAplicado);
    const nuevoArrastre = excesoAnualNoDeducido + Math.max(0, arrastrePrevio - arrastreAplicado);

    const gastosTotales = gastosNoLimit + grupoAplicado + arrastreAplicado;
    const rendimientoNetoPrevio = ingresos - gastosTotales;

    // Reducción (si vivienda habitual y rendimiento positivo)
    let ratio = 0;
    let regla = 'Sin reducción';
    if (viviendaHabitual && rendimientoNetoPrevio > 0) {
      if (year === '2023') {
        ratio = 0.60; regla = '60% (régimen 2023)';
      } else {
        if (rebajaRenta5) { ratio = 0.90; regla = '90% (rebaja renta ≥ 5%)'; }
        else if (contratoNuevo2024 && zonaTensionada && arrendatarioJoven) { ratio = 0.70; regla = '70% (nuevo contrato, zona tensionada, joven 18–35)'; }
        else if (mejorasEficiencia) { ratio = 0.60; regla = '60% (mejoras eficiencia)'; }
        else { ratio = 0.50; regla = '50% (régimen base 2024+)'; }
      }
    }
    const reduccionImporte = Math.max(0, rendimientoNetoPrevio) * ratio;
    const rendimientoNetoFinal = rendimientoNetoPrevio - reduccionImporte;

    return {
      ingresos,
      gastosNoLimit,
      grupoAplicado,
      arrastreAplicado,
      nuevoArrastre,
      totalGastosDeducibles: gastosTotales,
      rendimientoNetoPrevio,
      reduccionAplicada: regla,
      reduccionImporte,
      rendimientoNetoFinal,
      ratio,
    };
  }, [
    states,
    year,
    viviendaHabitual,
    contratoNuevo2024,
    zonaTensionada,
    arrendatarioJoven,
    mejorasEficiencia,
    rebajaRenta5,
  ]);

  const chartData = useMemo(() => ([
    {
      name: 'Desglose',
      gastosNoLimit: calc.gastosNoLimit,
      grupoAplicado: calc.grupoAplicado,
      arrastreAplicado: calc.arrastreAplicado,
      reduccion: calc.reduccionImporte,
      baseImponible: calc.rendimientoNetoFinal,
    }
  ]), [calc]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

  const exportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`${calculatorData.slug}.pdf`);
    } catch { alert('No se pudo exportar a PDF.'); }
  }, []);

  const saveLocal = useCallback(() => {
    try {
      const payload = { slug: calculatorData.slug, title, inputs: states, opciones: { year, viviendaHabitual, contratoNuevo2024, zonaTensionada, arrendatarioJoven, mejorasEficiencia, rebajaRenta5 }, outputs: calc, ts: Date.now() };
      const prev = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...prev].slice(0, 50)));
      alert('¡Resultado guardado!');
    } catch { alert('No se pudo guardar.'); }
  }, [states, calc, year, viviendaHabitual, contratoNuevo2024, zonaTensionada, arrendatarioJoven, mejorasEficiencia, rebajaRenta5, title]);

  /* ============ UI ============ */

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-6">
                Calcula la base imponible del alquiler (IRPF) aplicando límites legales y reducciones vigentes.
              </p>

              {/* Parámetros de reducción */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                <h3 className="text-base font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  Parámetros de reducción
                  <Tooltip text="Configura el año fiscal y las condiciones para determinar la reducción aplicable.">
                    <span className="ml-1 cursor-help"><InfoIcon /></span>
                  </Tooltip>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="year" className="text-sm text-gray-700 mb-1">Año fiscal</label>
                    <select id="year" value={year} onChange={e => setYear(e.target.value as YearOption)}
                            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500">
                      <option value="2023">2023 (60% vivienda habitual)</option>
                      <option value="2024+">2024+ (50/60/70/90 según condiciones)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input id="vh" type="checkbox" className="h-4 w-4"
                           checked={viviendaHabitual} onChange={e => setViviendaHabitual(e.target.checked)} />
                    <label htmlFor="vh" className="text-sm text-gray-700">Arrendamiento de vivienda habitual</label>
                  </div>

                  {/* Opciones 2024+ */}
                  <div className="flex items-center gap-2">
                    <input id="cn" type="checkbox" className="h-4 w-4"
                           checked={contratoNuevo2024} onChange={e => setContratoNuevo2024(e.target.checked)}
                           disabled={year !== '2024+'} />
                    <label htmlFor="cn" className="text-sm text-gray-700">Nuevo contrato (2024+)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="zt" type="checkbox" className="h-4 w-4"
                           checked={zonaTensionada} onChange={e => setZonaTensionada(e.target.checked)}
                           disabled={year !== '2024+'} />
                    <label htmlFor="zt" className="text-sm text-gray-700">Zona tensionada</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="jy" type="checkbox" className="h-4 w-4"
                           checked={arrendatarioJoven} onChange={e => setArrendatarioJoven(e.target.checked)}
                           disabled={year !== '2024+'} />
                    <label htmlFor="jy" className="text-sm text-gray-700">Inquilino joven (18–35)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="me" type="checkbox" className="h-4 w-4"
                           checked={mejorasEficiencia} onChange={e => setMejorasEficiencia(e.target.checked)}
                           disabled={year !== '2024+'} />
                    <label htmlFor="me" className="text-sm text-gray-700">Mejoras de eficiencia</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="rr" type="checkbox" className="h-4 w-4"
                           checked={rebajaRenta5} onChange={e => setRebajaRenta5(e.target.checked)}
                           disabled={year !== '2024+'} />
                    <label htmlFor="rr" className="text-sm text-gray-700">Rebaja del alquiler ≥ 5%</label>
                  </div>

                  <div className="md:col-span-2">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-white border border-indigo-200 text-indigo-700">
                      Regla aplicada: {calc.reduccionAplicada}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inputs con horquillas y etiqueta “interpretado correctamente” */}
              <div className="space-y-6">
                {inputs.map((group, gi) => (
                  <div key={gi} className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{group.group}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {group.fields.map((f: any) => {
                        const field = f as FieldDef;
                        const val = Number.isFinite(states[field.id]) ? states[field.id] : 0;
                        return (
                          <div key={field.id}>
                            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                              {field.label}
                              {field.tooltip && (
                                <Tooltip text={field.tooltip}>
                                  <span className="ml-2 cursor-help"><InfoIcon /></span>
                                </Tooltip>
                              )}
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                id={field.id}
                                type="number"
                                inputMode="decimal"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500"
                                min={field.min ?? 0}
                                max={field.max ?? undefined}
                                step={field.step ?? 0.01}
                                value={val}
                                onChange={(e) => handleChange(field, e.target.value)}
                                aria-describedby={`${field.id}-hint`}
                              />
                              {field.unit && <span className="text-sm text-gray-500">{field.unit}</span>}
                            </div>
                            <p id={`${field.id}-hint`} className="mt-1 text-xs text-gray-500">
                              Estás introduciendo: <strong>{isClient ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val) : val}</strong> (interpretado correctamente)
                              {typeof field.min === 'number' || typeof field.max === 'number' ? (
                                <> · Rango permitido: {field.min ?? 0}–{field.max ?? '∞'}</>
                              ) : null}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resultados */}
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del cálculo fiscal</h2>
                {outputs.map(o => {
                  const key = o.id as keyof typeof calc;
                  const isMoney = !['reduccionAplicada'].includes(o.id);
                  const value: any = (calc as any)[key];
                  return (
                    <div key={o.id}
                      className={`flex items-baseline justify-between p-4 rounded-lg ${
                        o.id === 'rendimientoNetoFinal' ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'
                      }`}>
                      <span className="text-sm md:text-base font-medium text-gray-700">{o.label}</span>
                      <span className={`text-base md:text-lg font-bold ${
                        o.id === 'rendimientoNetoFinal' ? 'text-indigo-600'
                          : o.id === 'reduccionImporte' ? 'text-green-600' : 'text-gray-800'
                      }`}>
                        {o.id === 'reduccionAplicada'
                          ? String(value)
                          : isClient ? formatCurrency(Number(value) || 0) : '...'}
                      </span>
                    </div>
                  );
                })}
                <p className="text-xs text-gray-500">
                  Nota: el nuevo arrastre pendiente integra el exceso del año y lo no aplicado de ejercicios previos. Su aprovechamiento está limitado a 4 años, respetando siempre el tope del grupo.
                </p>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Visualización</h2>
            <div className="h-48 w-full">
              {isClient && <DynamicBarChart data={chartData} formatCurrency={formatCurrency} />}
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={saveLocal} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <button onClick={exportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Reiniciar</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía rápida</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria</a></li>
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-4-rendimientos-capital-inmobiliario.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Manual IRPF – Rendimientos del capital inmobiliario</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraDesgravacionAlquiler;
