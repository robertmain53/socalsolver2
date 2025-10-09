'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

export const meta = {
  title: "Calculadora de Coste del Carnet de Conducir (teórico + práctico)",
  description: "Estima el coste total para sacarte el carnet de conducir tipo B en España, desglosando matrícula, clases, tasas y el coste de los suspensos."
};

// --- Helper Components & Icons ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        if (trimmedBlock.startsWith('###')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-3 text-gray-800"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^#+\s*/, '')) }}
            />
          );
        }
        if (trimmedBlock.startsWith('*')) {
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {trimmedBlock.split('\n').map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />
              ))}
            </ul>
          );
        }
        if (/^\d\.\s/.test(trimmedBlock)) {
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {trimmedBlock.split('\n').map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />
              ))}
            </ol>
          );
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
      })}
    </div>
  );
};

// --- Dynamic Chart Component (client-only, no SSR) ---
type ChartProps = {
  data: Array<{ name: string; value: number; fill: string }>;
  formatCurrency: (value: number) => string;
};

const DynamicBarChart = dynamic<ChartProps>(
  () =>
    import('recharts').then((mod) => {
      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } = mod;

      const ChartImpl: React.FC<ChartProps> = ({ data, formatCurrency }) => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => formatCurrency(Number(value))} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
            <Bar dataKey="value" name="Coste" barSize={35}>
              {data.map((entry, idx) => (
                <Cell key={`${entry.name}-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

      return ChartImpl;
    }),
  {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center text-gray-500">Cargando gráfico...</div>
  }
);

// --- Main Component Data ---
const calculatorData = {
  slug: "calculadora-coste-carnet-conducir",
  category: "Finanzas Personales",
  title: "Calculadora de Coste del Carnet de Conducir (teórico + práctico)",
  lang: "es",
  inputs: [
    { id: "coste_matricula", label: "Matrícula y Curso Teórico", type: "number", unit: "€", min: 0, step: 10, tooltip: "Coste de la inscripción en la autoescuela. Suele incluir el material de estudio, acceso a clases y tests online." },
    { id: "numero_clases_practicas", label: "Número de Clases Prácticas", type: "number", unit: "clases", min: 0, step: 1, tooltip: "El factor más variable. La media en España se sitúa entre 20 y 30 clases, pero depende de la habilidad de cada persona." },
    { id: "coste_clase_practica", label: "Coste por Clase Práctica", type: "number", unit: "€", min: 0, step: 1, tooltip: "El precio por una clase de 45-60 minutos. Varía mucho según la ciudad, con una media de 25€ a 35€." },
    { id: "coste_psicotecnico", label: "Examen Psicotécnico", type: "number", unit: "€", min: 0, step: 5, tooltip: "Coste del certificado médico obligatorio para poder presentarse a los exámenes. Suele rondar los 30-50€." },
    { id: "gastos_gestion_examen", label: "Gastos de Gestión (por examen práctico)", type: "number", unit: "€", min: 0, step: 5, tooltip: "Lo que cobra la autoescuela por la tramitación y por llevar el coche al examen. Se paga por cada intento." },
    { id: "suspensos_teorico", label: "Nº de suspensos en el teórico", type: "number", unit: "veces", min: 0, step: 1, tooltip: "La tasa de la DGT da derecho a 2 suspensos en total (teórico + práctico). Al 3er suspenso acumulado, hay que renovar tasas." },
    { id: "suspensos_practico", label: "Nº de suspensos en el práctico", type: "number", unit: "veces", min: 0, step: 1, tooltip: "Cada vez que suspendes el práctico, debes volver a pagar los gastos de gestión a la autoescuela para el siguiente intento." }
  ],
  outputs: [
    { id: "coste_formacion", label: "Coste de Formación (Matrícula + Prácticas)", unit: "€" },
    { id: "coste_tasas_gestion", label: "Coste Fijo (Tasas, Psicotécnico, Gestión)", unit: "€" },
    { id: "coste_extra_suspensos", label: "Coste Extra por Renovación de Tasas", unit: "€" },
    { id: "coste_total_estimado", label: "Coste Total Estimado del Carnet", unit: "€" }
  ],
  content: `### Introducción

Obtener el carnet de conducir tipo B es un paso importante, pero el coste total puede ser confuso y variar significativamente. Esta calculadora está diseñada para ofrecerte una **estimación clara y detallada** del desembolso que supone, desglosando cada uno de los gastos: desde la matrícula de la autoescuela y las clases prácticas hasta las tasas oficiales de la DGT y el coste real de los suspensos.

### Guida all'Uso del Calcolatore

Para obtener un presupuesto ajustado, introduce los datos de tu caso. Si desconoces algún valor, los campos ya contienen una media nacional de referencia.

* **Matrícula y Curso Teórico**: El coste inicial de inscripción en la autoescuela. Compara siempre qué incluye (material, tests online, etc.).
* **Número de Clases Prácticas**: Es el factor que más influye en el precio final. La media en España ronda las 25 clases, pero es una cifra muy personal.
* **Coste por Clase Práctica**: El precio de una lección de 45-60 minutos. Varía mucho entre grandes ciudades y zonas rurales.
* **Examen Psicotécnico**: Un pago único y obligatorio en un centro médico autorizado.
* **Gastos de Gestión**: Es lo que cobra la autoescuela por la tramitación y por acompañarte al examen práctico. **Importante**: se paga en cada intento del examen práctico.
* **Nº de Suspensos**: Sé realista. Cada suspenso no solo retrasa el proceso, sino que incrementa el coste. La calculadora aplica automáticamente la renovación de tasas de la DGT si es necesario.

### Metodologia di Calcolo Spiegata

La calculadora utiliza una fórmula transparente que suma todos los costes posibles para evitar sorpresas. El proceso se divide en tres grandes bloques:

1.  **Coste de Formación**: Es la suma de la **matrícula** y el total de **clases prácticas** (\`número de clases\` × \`coste por clase\`).
2.  **Coste Fijo (Tasas y Gestión)**: Incluye el **psicotécnico**, la **tasa oficial de la DGT** (actualmente 94,05 €) y los **gastos de gestión** de la autoescuela por cada intento en el examen práctico.
3.  **Coste Extra por Suspensos**: La tasa de la DGT te da derecho a un máximo de **dos suspensos** entre el examen teórico y el práctico. Si acumulas dos suspensos (por ejemplo, suspendes el teórico una vez y el práctico otra), al presentarte por tercera vez deberás **renovar y volver a pagar la tasa** de la DGT. La calculadora añade este coste automáticamente.

El **Coste Total Estimado** es la suma de estos tres bloques.

### Analisi Approfondita: Estrategias para Ahorrar en el Carnet de Conducir

El precio del carnet no es fijo; con una buena estrategia puedes reducirlo considerablemente.

**1. Compara Autoescuelas y Busca Packs de Ahorro**  
No te inscribas en la primera que veas. Pide presupuestos detallados y pregunta por **packs cerrados** que incluyan matrícula, un número de clases prácticas y tasas. Suelen ser más económicos que pagar cada concepto por separado.

**2. Prepara el Teórico a Conciencia**  
Aprobar el teórico a la primera es el primer gran ahorro. Utiliza las apps y tests online hasta que tengas un porcentaje de error mínimo. No te presentes con dudas. Un suspenso en el teórico consume una de las dos "vidas" que te da la tasa de la DGT.

**3. Optimiza las Clases Prácticas**  
Una clase bien aprovechada vale por dos. Mantén la concentración, pide a tu profesor que te lleve por zonas de examen y no dejes pasar mucho tiempo entre clases para no perder soltura. A veces, dar clases dobles puede ser más efectivo para consolidar el aprendizaje.

**4. El Factor Geográfico: Ahorra Cambiando de Provincia**  
El coste del carnet varía enormemente en España. Ciudades como Granada, Badajoz o A Coruña suelen ser las más baratas, mientras que San Sebastián, Barcelona o Bilbao están entre las más caras. La diferencia puede llegar a ser de cientos de euros.
`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué incluye exactamente la tasa de 94,05€ de la DGT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La tasa oficial de tráfico te da derecho a un máximo de dos suspensos entre el examen teórico y el práctico. Si apruebas el teórico a la primera, te quedan dos oportunidades para el práctico. Si suspendes el teórico, solo te queda una oportunidad para el práctico. Al acumular dos suspensos, para la tercera convocatoria necesitarás renovar y volver a pagar la tasa."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto se tarda de media en sacar el carnet de conducir en España?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Un plazo realista, con una dedicación constante, es de 3 a 6 meses. Este tiempo puede variar según la habilidad del alumno y la disponibilidad de fechas para los exámenes en la Jefatura de Tráfico de cada provincia."
        }
      },
      {
        "@type": "Question",
        "name": "¿Es más barato sacarse el carnet por libre?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aunque es una opción legal, en la práctica es muy complicado y no suele resultar más económico. Se requiere un vehículo adaptado y homologado, un seguro específico y cumplir con varios requisitos burocráticos, lo que hace que la autoescuela sea la opción más eficiente para la mayoría de las personas."
        }
      }
    ]
  }
} as const;

const CalculadoraCosteCarnetConducir: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    coste_matricula: 200,
    numero_clases_practicas: 20,
    coste_clase_practica: 30,
    coste_psicotecnico: 35,
    gastos_gestion_examen: 45,
    suspensos_teorico: 0,
    suspensos_practico: 0
  };
  const [states, setStates] = useState<Record<string, number | string>>(initialStates);

  const handleStateChange = (id: string, value: number | string) =>
    setStates((prev) => ({ ...prev, [id]: value }));
  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const {
      coste_matricula,
      numero_clases_practicas,
      coste_clase_practica,
      coste_psicotecnico,
      gastos_gestion_examen,
      suspensos_teorico,
      suspensos_practico
    } = states as Record<string, number>;

    const TASA_DGT = 94.05;

    const coste_formacion = (coste_matricula || 0) + (numero_clases_practicas || 0) * (coste_clase_practica || 0);
    const coste_tasas_gestion =
      (coste_psicotecnico || 0) + TASA_DGT + (gastos_gestion_examen || 0) * (1 + (suspensos_practico || 0));
    const coste_extra_suspensos = Math.floor(((suspensos_teorico || 0) + (suspensos_practico || 0)) / 2) * TASA_DGT;
    const coste_total_estimado = coste_formacion + coste_tasas_gestion + coste_extra_suspensos;

    return { coste_formacion, coste_tasas_gestion, coste_extra_suspensos, coste_total_estimado };
  }, [states]);

  const formatCurrency = useCallback(
    (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0),
    []
  );

  const chartData = [
    { name: 'Formación', value: calculatedOutputs.coste_formacion, fill: '#60a5fa' },
    { name: 'Tasas/Gestión', value: calculatedOutputs.coste_tasas_gestion, fill: '#34d399' },
    { name: 'Susp.', value: calculatedOutputs.coste_extra_suspensos, fill: '#f87171' }
  ];

  // --- Action Handlers ---
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new (jsPDF as any)({ orientation: "p", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) {
      alert("La exportación a PDF no está disponible en este entorno.");
      console.error(e);
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem("calc_results") || "[]");
        localStorage.setItem("calc_results", JSON.stringify([payload, ...existing].slice(0, 50)));
        alert("¡Resultado guardado con éxito!");
      }
    } catch {
      alert("No se pudo guardar el resultado.");
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{meta.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && (
                      <Tooltip text={input.tooltip}>
                        <span className="ml-2 cursor-help"><InfoIcon /></span>
                      </Tooltip>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={input.id}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      type="number"
                      value={String((states as any)[input.id] ?? '')}
                      onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                      min={input.min}
                      step={input.step}
                      inputMode="decimal"
                    />
                    {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Desglose de la Estimación</h2>
              {outputs.map((output) => (
                <div
                  key={output.id}
                  className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                    output.id === 'coste_total_estimado' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                  <div
                    className={`text-xl md:text-2xl font-bold ${
                      output.id === 'coste_total_estimado' ? 'text-indigo-600' : 'text-gray-800'
                    }`}
                  >
                    {isClient ? formatCurrency((calculatedOutputs as any)[output.id] ?? 0) : '...'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <button
                onClick={saveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar Resultado
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar a PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reiniciar
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualización del Coste</h3>
            <div className="h-64 w-full">
              {isClient ? (
                <DynamicBarChart data={chartData} formatCurrency={formatCurrency} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">Cargando gráfico...</div>
              )}
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Consejos</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.dgt.es/nuestros-servicios/permisos-de-conducir/obtener-un-permiso-o-licencia/tasas/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Dirección General de Tráfico (DGT) - Tasas
                </a>
              </li>
              <li>
                <a
                  href="https://sede.dgt.gob.es/es/permisos-de-conducir/obtencion-renovacion-duplicados-permiso/permiso-conducir/index.shtml"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Sede Electrónica DGT - Obtención Permiso
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCosteCarnetConducir;
