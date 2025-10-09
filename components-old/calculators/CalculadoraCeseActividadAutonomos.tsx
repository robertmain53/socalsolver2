'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
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

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Componente per lo Schema SEO ---
const SeoSchema = ({ schema }: { schema: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(schema),
    }}
  />
);

// --- Componente per il rendering del Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  };

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### ')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace('### ', '')) }}
            />
          );
        }
        if (trimmedBlock.startsWith('* ')) {
          const items = trimmedBlock.split('\n').map((item) => item.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ul>
          );
        }
        if (trimmedBlock.match(/^\d+\.\s/)) {
          const items = trimmedBlock.split('\n').map((item) => item.replace(/^\d+\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ol>
          );
        }
        if (trimmedBlock) {
          return (
            <p
              key={index}
              className="mb-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

// --- Dati di Configurazione del Calcolatore ---
const calculatorData = {
  slug: 'calculadora-cese-actividad-autonomos',
  category: 'Impuestos y trabajo autónomo',
  title: 'Calculadora de la prestación por cese de actividad (paro de autónomos)',
  lang: 'es',
  inputs: [
    {
      id: 'base_cotizacion_media_12_meses',
      label: 'Base de cotización media (últimos 12 meses)',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 50,
      tooltip:
        'Introduce el promedio de tus bases de cotización en el RETA durante los 12 meses continuados e inmediatamente anteriores al cese de actividad.',
    },
    {
      id: 'meses_cotizados_cese_actividad',
      label: 'Meses cotizados por cese de actividad',
      type: 'number' as const,
      unit: 'meses',
      min: 12,
      step: 1,
      tooltip:
        'Indica el número total de meses que has cotizado por cese de actividad en los últimos 48 meses. El mínimo para acceder es de 12 meses.',
    },
    {
      id: 'numero_hijos_a_cargo',
      label: 'Número de hijos a cargo',
      type: 'number' as const,
      unit: 'hijos',
      min: 0,
      step: 1,
      tooltip:
        'El número de hijos a tu cargo influye en los importes mínimos y máximos de la prestación que puedes recibir, según el IPREM.',
    },
  ],
  outputs: [
    { id: 'prestacion_mensual_bruta', label: 'Prestación Mensual Estimada (Bruta)', unit: '€' },
    { id: 'duracion_prestacion_meses', label: 'Duración de la Prestación', unit: 'meses' },
    { id: 'limite_minimo_aplicable', label: 'Límite Mínimo Aplicable', unit: '€' },
    { id: 'limite_maximo_aplicable', label: 'Límite Máximo Aplicable', unit: '€' },
  ],
  content:
    "### Introducción: ¿Qué es la prestación por cese de actividad?\n\nLa prestación por cese de actividad, comúnmente conocida como el 'paro de los autónomos', es una protección económica destinada a los trabajadores por cuenta propia que se ven obligados a finalizar su actividad de forma involuntaria. Su objetivo es proporcionar un soporte de ingresos durante un periodo determinado mientras el autónomo busca nuevas oportunidades o reorienta su carrera profesional. Esta calculadora te permite obtener una estimación precisa y rápida tanto del importe mensual que podrías recibir como de la duración de la prestación, basándose en la normativa vigente.\n\n### Guía all'Uso del Calcolatore\n\nPara obtener tu estimación, solo necesitas tres datos clave de tu vida laboral:\n\n* **Base de cotización media (últimos 12 meses)**: Es el dato más importante. Corresponde al promedio de las bases por las que has cotizado en el Régimen Especial de Trabajadores Autónomos (RETA) durante los 12 meses justo anteriores a la fecha del cese. Puedes encontrar esta información en tus boletines de cotización o a través del portal de la Seguridad Social.\n* **Meses cotizados por cese de actividad**: Se refiere al tiempo que has estado cotizando específicamente por esta contingencia. Para acceder a la prestación, se requiere un mínimo de 12 meses de cotización continuada dentro de los 48 meses anteriores al cese.\n* **Número de hijos a cargo**: Este factor no modifica el porcentaje de cálculo, pero es crucial para determinar los límites mínimos y máximos de la prestación que la ley establece en función del Indicador Público de Renta de Efectos Múltiples (IPREM).\n\n### Metodologia di Calcolo Spiegata\n\nLa transparencia es fundamental. Así es como nuestra calculadora procesa tus datos para ofrecerte un resultado fiable, siguiendo el método oficial de la Seguridad Social:\n\n1.  **Cálculo de la Base Reguladora**: La base reguladora es simplemente el promedio de tus bases de cotización de los últimos 12 meses continuados. Esta cifra representa la referencia sobre la que se calculará tu prestación.\n\n2.  **Importe de la Prestación**: Por norma general, la cuantía de la prestación es el **70% de la base reguladora**. La calculadora aplica este porcentaje directamente.\n\n3.  **Aplicación de Límites (Topes Mínimos y Máximos)**: La ley establece unos importes máximos y mínimos para evitar prestaciones excesivamente altas o bajas. Estos límites se calculan sobre el IPREM vigente (estimado en 600 € para 2025) y dependen de tus responsabilidades familiares:\n    * **Cuantía Máxima**: 175% del IPREM sin hijos, 200% con un hijo, y 225% con dos o más hijos.\n    * **Cuantía Mínima**: 107% del IPREM si tienes hijos a cargo, u 80% si no los tienes.\n    Tu prestación mensual será el resultado de aplicar el 70% a tu base, pero siempre dentro de la horquilla definida por estos dos límites.\n\n4.  **Determinación de la Duración**: El período durante el cual recibirás la ayuda depende directamente de los meses que hayas cotizado por cese de actividad, según la siguiente tabla:\n    * De 12 a 17 meses cotizados: 4 meses de prestación.\n    * De 18 a 23 meses: 6 meses.\n    * De 24 a 29 meses: 8 meses.\n    * De 30 a 35 meses: 10 meses.\n    * De 36 a 41 meses: 12 meses.\n    * De 42 a 47 meses: 14 meses.\n    * Con 48 meses o más: 24 meses.\n\n### Analisi Approfondita: Requisitos Clave para Acceder al Paro de Autónomos\n\nCalcular el importe es solo una parte. Para tener derecho a la prestación, es imprescindible cumplir una serie de requisitos estrictos. A menudo, las denegaciones no se deben a un mal cálculo, sino al incumplimiento de alguna de estas condiciones. Asegúrate de cumplir con todo lo siguiente:\n\n1.  **Estar afiliado y en alta en el RETA**: Debes estar dado de alta como autónomo en el momento del cese.\n2.  **Tener cubierto el período mínimo de cotización**: Haber cotizado por cese de actividad un mínimo de 12 meses continuados e inmediatamente anteriores al cese.\n3.  **Encontrarse en Situación Legal de Cese de Actividad**: Este es el punto más complejo. No basta con 'darse de baja'. Debes acreditar que el cese se debe a causas económicas, técnicas, productivas u organizativas, fuerza mayor, pérdida de licencia administrativa, violencia de género, divorcio, etc. Debes poder documentar estas causas.\n4.  **No haber cumplido la edad de jubilación**: No puedes haber alcanzado la edad ordinaria para causar derecho a la pensión contributiva de jubilación, salvo que no tuvieras acreditado el período de cotización requerido para ello.\n5.  **Estar al corriente de pago de las cuotas a la Seguridad Social**: Es un requisito indispensable. Si no estás al día, se te invitará a ingresar las cuotas debidas en un plazo determinado.\n6.  **Suscribir el compromiso de actividad**: Al solicitar la prestación, te comprometes a estar disponible para la reincorporación al mercado laboral a través de actividades formativas o de orientación profesional.\n\n### Domande Frequenti (FAQ)\n\n**¿La prestación por cese de actividad cotiza para la jubilación?**\nSí. Mientras cobras la prestación, la mutua colaboradora o el ISM se encarga de ingresar la cotización a la Seguridad Social. Esto significa que el tiempo que estás en 'paro de autónomos' cuenta para tu futura pensión de jubilación.\n\n**¿Qué se considera 'situación legal de cese de actividad'?**\nEs una causa tasada por ley que demuestra la involuntariedad del cese. Las más comunes son la existencia de pérdidas económicas graves (superiores al 10% de los ingresos en un año), ejecuciones judiciales para el cobro de deudas que alcancen el 30% de los ingresos, o una declaración judicial de concurso que impida continuar con la actividad.\n\n**¿Puedo trabajar mientras cobro esta prestación?**\nNo. La prestación por cese de actividad es incompatible con cualquier trabajo por cuenta propia o ajena. Si inicias una nueva actividad, la prestación se suspenderá o extinguirá.",
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿La prestación por cese de actividad cotiza para la jubilación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            "Sí. Mientras cobras la prestación, la mutua colaboradora o el ISM se encarga de ingresar la cotización a la Seguridad Social. Esto significa que el tiempo que estás en 'paro de autónomos' cuenta para tu futura pensión de jubilación.",
        },
      },
      {
        '@type': 'Question',
        name: "¿Qué se considera 'situación legal de cese de actividad'?",
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Es una causa tasada por ley que demuestra la involuntariedad del cese. Las más comunes son la existencia de pérdidas económicas graves (superiores al 10% de los ingresos en un año), ejecuciones judiciales para el cobro de deudas que alcancen el 30% de los ingresos, o una declaración judicial de concurso que impida continuar con la actividad.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo trabajar mientras cobro esta prestación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. La prestación por cese de actividad es incompatible con cualquier trabajo por cuenta propia o ajena. Si inicias una nueva actividad, la prestación se suspenderá o extinguirá.',
        },
      },
    ],
  },
};

// ---- Stato iniziale HOISTED (per reset stabile) ----
const INITIAL_STATE = {
  base_cotizacion_media_12_meses: 960.6,
  meses_cotizados_cese_actividad: 24,
  numero_hijos_a_cargo: 0,
};

type CalcOutputs = {
  prestacion_mensual_bruta: number;
  duracion_prestacion_meses: number;
  limite_minimo_aplicable: number;
  limite_maximo_aplicable: number;
};

const CalculadoraCeseActividadAutonomos: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [states, setStates] = useState<{ [key: string]: number | '' }>(INITIAL_STATE);

  const handleStateChange = (id: string, value: number | '') => {
    setStates((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = useCallback(() => {
    setStates(INITIAL_STATE);
  }, []);

  const calculatedOutputs: CalcOutputs = useMemo(() => {
    // Coercizione sicura
    const base_cotizacion_media_12_meses = Number(states.base_cotizacion_media_12_meses) || 0;
    const meses_cotizados_cese_actividad = Number(states.meses_cotizados_cese_actividad) || 0;
    const numero_hijos_a_cargo = Number(states.numero_hijos_a_cargo) || 0;

    // IPREM 2025 (Estimado)
    const IPREM_MENSUAL = 600;

    // 1. Duración
    let duracion_prestacion_meses = 0;
    if (meses_cotizados_cese_actividad >= 48) duracion_prestacion_meses = 24;
    else if (meses_cotizados_cese_actividad >= 42) duracion_prestacion_meses = 14;
    else if (meses_cotizados_cese_actividad >= 36) duracion_prestacion_meses = 12;
    else if (meses_cotizados_cese_actividad >= 30) duracion_prestacion_meses = 10;
    else if (meses_cotizados_cese_actividad >= 24) duracion_prestacion_meses = 8;
    else if (meses_cotizados_cese_actividad >= 18) duracion_prestacion_meses = 6;
    else if (meses_cotizados_cese_actividad >= 12) duracion_prestacion_meses = 4;

    // 2. Importe inicial (70%)
    const baseReguladora = base_cotizacion_media_12_meses;
    const importeInicial = baseReguladora * 0.7;

    // 3. Límites
    const limite_minimo_aplicable = (numero_hijos_a_cargo > 0 ? 1.07 : 0.8) * IPREM_MENSUAL;
    const limite_maximo_aplicable =
      (numero_hijos_a_cargo >= 2 ? 2.25 : numero_hijos_a_cargo === 1 ? 2.0 : 1.75) * IPREM_MENSUAL;

    // 4. Aplicar límites
    const prestacion_mensual_bruta = Math.max(
      limite_minimo_aplicable,
      Math.min(importeInicial, limite_maximo_aplicable)
    );

    if (meses_cotizados_cese_actividad < 12) {
      return {
        prestacion_mensual_bruta: 0,
        duracion_prestacion_meses: 0,
        limite_minimo_aplicable,
        limite_maximo_aplicable,
      };
    }

    return {
      prestacion_mensual_bruta,
      duracion_prestacion_meses,
      limite_minimo_aplicable,
      limite_maximo_aplicable,
    };
  }, [states]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf'); // named export
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
      const newResults = [payload, ...existingResults].slice(0, 50);
      localStorage.setItem('calc_results', JSON.stringify(newResults));
      alert('Resultado guardado en el almacenamiento local de su navegador.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);

  return (
    <>
      <SeoSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">
              Estima la cuantía y duración de tu prestación por cese de actividad de forma rápida y sencilla.
            </p>

            <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-4 mb-8">
              <strong>Aviso Importante:</strong> Esta herramienta proporciona una estimación basada en la normativa actual y
              un IPREM de 600€. Los resultados son orientativos y no constituyen un derecho ni sustituyen la resolución
              oficial de la entidad gestora.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
              {inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                    {input.label}
                    {input.tooltip && (
                      <Tooltip text={input.tooltip}>
                        <span className="ml-2 cursor-help">
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      id={input.id}
                      aria-label={input.label}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                      type="number"
                      min={(input as any).min}
                      step={(input as any).step}
                      value={states[input.id] as number | ''}
                      onChange={(e) =>
                        handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))
                      }
                    />
                    {(input as any).unit && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        {(input as any).unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8" aria-live="polite">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados de la Simulación</h2>
              <div className="space-y-4">
                {calculatorData.outputs.map((output) => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                      output.id === 'prestacion_mensual_bruta'
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div
                      className={`text-xl md:text-2xl font-bold ${
                        output.id === 'prestacion_mensual_bruta' ? 'text-indigo-600' : 'text-gray-800'
                      }`}
                    >
                      <span>
                        {isClient
                          ? output.unit === '€'
                            ? formatCurrency((calculatedOutputs as any)[output.id] as number)
                            : `${(calculatedOutputs as any)[output.id]} ${output.unit}`
                          : '...'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSaveResult}
                className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full text-sm font-medium border border-red-300 bg-red-50 rounded-md px-3 py-2 text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-6 bg-white shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Guía de la Prestación</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

          <section className="border rounded-lg p-6 bg-white shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10963/28441/28442"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Seguridad Social - Cese de Actividad
                </a>
              </li>
              <li>
                <a
                  href="https://www.sepe.es/HomeSepe/autonomos/prestacion-cese-actividad.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  SEPE - Prestación por cese de actividad
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCeseActividadAutonomos;
