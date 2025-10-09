'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

// -------------------- Placeholder grafico (lazy) --------------------
const ChartFallback = () => (
  <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500">Cargando gráfico…</p>
  </div>
);

// Lazy load completo del pacchetto Recharts con wrapper inline (ssr: false)
const DynamicBarChart = dynamic(async () => {
  const mod = await import('recharts');
  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } = mod as any;

  const Wrapped = ({ data }: { data: Array<Record<string, number | string>> }) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v)} />
        <Legend />
        <Bar dataKey="Base general" />
        <Bar dataKey="Mínimo P+F" />
        <Bar dataKey="Base liquidable" />
        <Bar dataKey="Cuota íntegra" />
      </BarChart>
    </ResponsiveContainer>
  );
  return Wrapped;
}, { ssr: false, loading: () => <ChartFallback /> });

// -------------------- Icona Info + Tooltip --------------------
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const TooltipUI = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[18rem] p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// -------------------- Iniettore di Schema dinamico --------------------
const SchemaInjector = ({ schema }: { schema: any }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// -------------------- Renderer semplice Markdown (lightweight) --------------------
const ContentRenderer = ({ content }: { content: string }) => {
  const toHTML = (txt: string) =>
    txt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
       .replace(/_(.*?)_/g, '<em>$1</em>');
  const blocks = content.split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith('### ')) return <h3 key={i} className="text-xl font-bold" dangerouslySetInnerHTML={{ __html: toHTML(t.replace(/^###\s*/, '')) }} />;
        if (t.startsWith('#### ')) return <h4 key={i} className="text-lg font-semibold" dangerouslySetInnerHTML={{ __html: toHTML(t.replace(/^####\s*/, '')) }} />;
        if (t.startsWith('- ') || t.startsWith('* ')) {
          const items = t.split('\n').map(s => s.replace(/^[-*]\s*/, ''));
          return (
            <ul key={i} className="list-disc pl-5 space-y-2">
              {items.map((it, k) => <li key={k} dangerouslySetInnerHTML={{ __html: toHTML(it) }} />)}
            </ul>
          );
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: toHTML(t) }} />;
      })}
    </div>
  );
};

// -------------------- Dati del calcolatore (self-contained) --------------------
const calculatorData = {
  slug: "simulador-declaracion-renta",
  category: "Impuestos y trabajo autónomo",
  title: "Simulador de la Declaración de la Renta (simplificado)",
  lang: "es",
  // Tarifa estándar orientativa combinada (sin tramo autonómico)
  tramos: [
    { hasta: 12450, tipo: 0.19 },
    { hasta: 20200, tipo: 0.24 },
    { hasta: 35200, tipo: 0.30 },
    { hasta: 60000, tipo: 0.37 },
    { hasta: 300000, tipo: 0.45 },
    { hasta: null, tipo: 0.47 }
  ],
  inputs: [
    { id: "ingresos_trabajo", label: "Rendimientos del trabajo (brutos anuales)", type: "number", unit: "€", min: 0, step: 500, tooltip: "Salario bruto anual, incluyendo pagas extra y otros conceptos." },
    { id: "ss_trabajador", label: "Seguridad Social (anual)", type: "number", unit: "€", min: 0, step: 100, tooltip: "Aportaciones del trabajador a la Seguridad Social." },
    { id: "otros_gastos_trabajo", label: "Otros gastos del trabajo", type: "number", unit: "€", min: 0, step: 50, tooltip: "Cuotas colegiales obligatorias, defensa jurídica, etc." },

    { id: "rend_capital_mobiliario", label: "Capital mobiliario (intereses/dividendos)", type: "number", unit: "€", min: 0, step: 100, tooltip: "Modelo simplificado: se integra en base general." },
    { id: "ingresos_alquileres", label: "Ingresos por alquileres", type: "number", unit: "€", min: 0, step: 100, tooltip: "Ingresos brutos de arrendamientos." },
    { id: "gastos_alquileres", label: "Gastos deducibles alquiler (simpl.)", type: "number", unit: "€", min: 0, step: 100, tooltip: "Gastos vinculados al alquiler: IBI, comunidad, reparaciones, intereses." },

    { id: "aportacion_planes_pensiones", label: "Aportación a planes de pensiones", type: "number", unit: "€", min: 0, step: 100, tooltip: "Tope simplificado 1.500 €." },

    { id: "edad", label: "Edad", type: "number", unit: "años", min: 18, step: 1, tooltip: "Para el mínimo personal." },
    { id: "hijos", label: "Hijos a cargo", type: "number", unit: "nº", min: 0, step: 1, tooltip: "Modelo simplificado: 2.400 € por hijo." },
    { id: "tipo_declaracion", label: "Tipo de declaración", type: "select", options: ["Individual", "Conjunta (simpl.)"], tooltip: "Ajuste modesto al mínimo." },

    { id: "retenciones_irpf", label: "Retenciones/Pagos a cuenta", type: "number", unit: "€", min: 0, step: 100, tooltip: "Suma de retenciones y pagos ya efectuados." }
  ],
  outputs: [
    { id: "base_general", label: "Base imponible general", unit: "€" },
    { id: "minimo_personal_familiar", label: "Mínimo personal y familiar (simpl.)", unit: "€" },
    { id: "base_liquidable", label: "Base liquidable general", unit: "€" },
    { id: "cuota_integra", label: "Cuota íntegra (estándar)", unit: "€" },
    { id: "deducciones_generales", label: "Deducciones generales (simpl.)", unit: "€" },
    { id: "cuota_liquida", label: "Cuota líquida", unit: "€" },
    { id: "resultado", label: "Resultado ( + ingresar / − devolver )", unit: "€" }
  ],
  content: `### **Simulador de la Declaración de la Renta (simplificado)**
> **Aviso**: Herramienta orientativa. No sustituye Renta WEB ni constituye asesoramiento fiscal.
#### **Cómo estima el resultado**
1. Calcula rendimientos netos del trabajo (resta SS, otros gastos y 2.000 €).
2. Integra capital mobiliario (simpl.) y alquiler neto (ingresos − gastos).
3. Resta reducción por planes de pensiones (tope 1.500 €).
4. Aplica el **mínimo personal y familiar** simplificado (edad + hijos + ajuste conjunta).
5. Obtiene **base liquidable** y aplica **tarifa estándar** (sin tramo autonómico).
6. Resta retenciones/pagos a cuenta → **resultado** (positivo: a ingresar; negativo: a devolver).
#### **Recomendaciones**
- Contrasta con **Renta WEB**.
- Revisa tramos autonómicos y deducciones específicas que aquí no se aplican.`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Sustituye a Renta WEB?", "acceptedAnswer": { "@type": "Answer", "text": "No, es orientativo." } },
      { "@type": "Question", "name": "¿Incluye tramos autonómicos?", "acceptedAnswer": { "@type": "Answer", "text": "No, usa una tarifa estándar." } },
      { "@type": "Question", "name": "¿Puedo simular conjunta?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, con un ajuste simplificado del mínimo." } }
    ]
  }
} as const;

// -------------------- Meta opzionali --------------------
export const meta = {
  title: "Simulador de la Declaración de la Renta (simplificado)",
  description: "Calcula una estimación orientativa de tu IRPF con mínimos y reducciones básicas. Sin tramo autonómico."
};

// -------------------- Utilità --------------------
const euro = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

// Tarifa por tramos (estándar, sin tramo autonómico)
function cuotaPorTramos(base: number, tramos: { hasta: number | null; tipo: number }[]) {
  let restante = base;
  let anterior = 0;
  let cuota = 0;
  for (const t of tramos) {
    const limite = t.hasta ?? Infinity;
    const tramoBase = Math.max(0, Math.min(restante, limite - anterior));
    if (tramoBase <= 0) break;
    cuota += tramoBase * t.tipo;
    restante -= tramoBase;
    anterior = limite;
    if (restante <= 0) break;
  }
  return Math.max(0, Math.round(cuota));
}

// -------------------- Componente PRINCIPALE --------------------
const SimuladorDeclaracionRent: React.FC = () => {
  const { title, inputs, outputs, tramos, content, seoSchema } = calculatorData;
  const [isClient, setIsClient] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsClient(true), []);

  // Stato iniziale
  const initial = {
    ingresos_trabajo: 36000,
    ss_trabajador: 2300,
    otros_gastos_trabajo: 0,
    rend_capital_mobiliario: 300,
    ingresos_alquileres: 6000,
    gastos_alquileres: 1500,
    aportacion_planes_pensiones: 1500,
    edad: 40,
    hijos: 1,
    tipo_declaracion: 'Individual',
    retenciones_irpf: 5500
  };
  const [state, setState] = useState<Record<string, any>>(initial);

  const onChange = (id: string, value: any) => setState(s => ({ ...s, [id]: value }));

  // Calcolo memoizzato
  const calc = useMemo(() => {
    const rendTrabajoNeto = Math.max(0,
      (state.ingresos_trabajo || 0)
      - (state.ss_trabajador || 0)
      - (state.otros_gastos_trabajo || 0)
      - 2000
    );

    const rendAlquilerNeto = Math.max(0, (state.ingresos_alquileres || 0) - (state.gastos_alquileres || 0));
    const baseGeneral = Math.max(0, rendTrabajoNeto + (state.rend_capital_mobiliario || 0) + rendAlquilerNeto);

    const topePlanes = Math.min(1500, state.aportacion_planes_pensiones || 0);
    const baseTrasReducciones = Math.max(0, baseGeneral - topePlanes);

    const minimoPersonal = state.edad < 65 ? 5550 : (state.edad < 75 ? 6700 : 8150);
    const minimoDesc = (state.hijos || 0) * 2400;
    const ajusteConjunta = state.tipo_declaracion === 'Conjunta (simpl.)' ? 2150 : 0;
    const minimoPF = minimoPersonal + minimoDesc + ajusteConjunta;

    const baseLiquidable = Math.max(0, baseTrasReducciones - minimoPF);

    const cuotaIntegra = cuotaPorTramos(baseLiquidable, tramos as any);
    const deduccionesGenerales = 0; // slot para futuras deducciones
    const cuotaLiquida = Math.max(0, cuotaIntegra - deduccionesGenerales);
    const resultado = cuotaLiquida - (state.retenciones_irpf || 0);

    return {
      rendTrabajoNeto, rendAlquilerNeto, baseGeneral,
      minimoPF, baseLiquidable, cuotaIntegra,
      deduccionesGenerales, cuotaLiquida, resultado
    };
  }, [state, tramos]);

  const chartData = useMemo(() => ([
    { name: 'Valores', 'Base general': calc.baseGeneral, 'Mínimo P+F': calc.minimoPF, 'Base liquidable': calc.baseLiquidable, 'Cuota íntegra': calc.cuotaIntegra }
  ]), [calc]);

  const reset = () => setState(initial);

  const saveLocal = useCallback(() => {
    try {
      const payload = {
        slug: calculatorData.slug,
        title: calculatorData.title,
        inputs: state,
        outputs: {
          base_general: calc.baseGeneral,
          minimo_personal_familiar: calc.minimoPF,
          base_liquidable: calc.baseLiquidable,
          cuota_integra: calc.cuotaIntegra,
          deducciones_generales: calc.deduccionesGenerales,
          cuota_liquida: calc.cuotaLiquida,
          risultato: calc.resultado
        },
        ts: Date.now()
      };
      const key = 'calc_results';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([payload, ...list].slice(0, 50)));
      alert('Resultado guardado localmente.');
    } catch {
      alert('No se pudo guardar.');
    }
  }, [state, calc]);

  const exportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!boxRef.current) return;
      const canvas = await html2canvas(boxRef.current, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`${calculatorData.slug}.pdf`);
    } catch {
      alert('Exportación PDF no disponible en este entorno.');
    }
  }, []);

  return (
    <>
      <SchemaInjector schema={calculatorData.seoSchema} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6 bg-gray-50">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6" ref={boxRef}>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{meta.description}</p>

            <div className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
              <strong>Aviso:</strong> Modelo simplificado. No incluye tramo autonómico ni todas las deducciones. Úsalo como orientación.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {inputs.map((inp) => (
                <div key={inp.id} className="space-y-1">
                  <label htmlFor={inp.id} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {inp.label}
                    {inp.tooltip && (
                      <TooltipUI text={inp.tooltip}>
                        <span><InfoIcon /></span>
                      </TooltipUI>
                    )}
                  </label>

                  {inp.type === 'select' ? (
                    <select
                      id={inp.id}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white"
                      value={state[inp.id]}
                      onChange={(e) => onChange(inp.id, e.target.value)}
                    >
                      {(inp as any).options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        id={inp.id}
                        type="number"
                        inputMode="decimal"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        min={(inp as any).min}
                        step={(inp as any).step}
                        value={state[inp.id]}
                        onChange={(e) => onChange(inp.id, e.target.value === '' ? '' : Number(e.target.value))}
                        aria-label={inp.label}
                      />
                      {inp.unit && <span className="text-sm text-gray-500">{inp.unit}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Risultati */}
            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Resultados</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {outputs.map(o => {
                  const valueMap: Record<string, number> = {
                    base_general: calc.baseGeneral,
                    minimo_personal_familiar: calc.minimoPF,
                    base_liquidable: calc.baseLiquidable,
                    cuota_integra: calc.cuotaIntegra,
                    deducciones_generales: calc.deduccionesGenerales,
                    cuota_liquida: calc.cuotaLiquida,
                    resultado: calc.resultado
                  };
                  const isPrimary = o.id === 'resultado';
                  return (
                    <div key={o.id} className={`flex items-center justify-between border-l-4 rounded-r-md p-3 ${isPrimary ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'}`}>
                      <span className="text-sm text-gray-700">{o.label}</span>
                      <span className={`font-bold ${isPrimary ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {isClient ? euro(valueMap[o.id]) : '…'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grafico */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumen gráfico</h3>
              <div className="h-72 w-full">
                {isClient ? <DynamicBarChart data={chartData as any} /> : <ChartFallback />}
              </div>
            </div>
          </div>

          {/* Formula trasparente */}
          <div className="mt-6 bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800">Fórmula resumida (modelo)</h3>
            <p className="text-xs text-gray-600 mt-2 font-mono break-words">
              Base general = max(0, (Trabajo − SS − otros − 2000) + Capital mobiliario + (Alquiler − gastos))<br/>
              Base tras reducciones = max(0, Base general − min(1500, Planes))<br/>
              Mínimo P+F = (edad:{'<'}65→5550; 65–74→6700; ≥75→8150) + 2400×hijos + (conjunta→+2150)<br/>
              Base liquidable = max(0, Base tras reducciones − Mínimo P+F)<br/>
              Cuota íntegra = tarifa_estándar(Base liquidable) · (sin tramo autonómico)<br/>
              Resultado = Cuota líquida − Retenciones/Pagos a cuenta
            </p>
            <p className="text-xs text-gray-500 mt-2">Este modelo es orientativo y no sustituye la normativa ni Renta WEB.</p>
          </div>
        </div>

        {/* Aside: herramientas y contenido */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3 text-gray-900">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={saveLocal}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Guardar
              </button>
              <button onClick={exportPDF}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                PDF
              </button>
              <button onClick={() => reset()}
                      className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Reset
              </button>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-2 text-gray-900">Guía de uso</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-2 text-gray-900">Fuentes (oficiales y ayuda)</h2>
            <ul className="list-disc pl-5 text-sm text-indigo-700 space-y-2">
              <li><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://sede.agenciatributaria.gob.es/Sede/procedimientoini/ZZ08.shtml">Agencia Tributaria · Renta WEB</a></li>
              <li><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/renta-ayuda-tecnica/renta-web-open.html">Renta WEB Open (ayuda técnica)</a></li>
              <li><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://www3.agenciatributaria.gob.es/Sede/procedimientoini/ZZ08.shtml">Información general de Renta</a></li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">Consulta siempre la normativa vigente y las particularidades de tu CCAA.</p>
          </section>
        </aside>
      </div>
    </>
  );
};

export default SimuladorDeclaracionRent;
