'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// --- Static Data and Configuration ---
const calculatorData = {
  slug: "calculadora-regla-dos-meses",
  category: "Bienes Raíces y Vivienda",
  title: "Calculadora de la \"regla de los dos meses\" para minusvalías en bolsa",
  lang: "es",
  description:
    "Calcula la fecha exacta a partir de la cual puedes recomprar acciones tras una venta con pérdidas sin anular su beneficio fiscal.",
  inputs: [
    {
      id: "fechaVenta",
      label: "Fecha de Venta con Pérdidas",
      type: "date" as const,
      tooltip:
        "Introduce la fecha exacta en la que vendiste los activos generando una minusvalía que quieres compensar.",
    },
    {
      id: "tipoMercado",
      label: "Tipo de Mercado del Activo",
      type: "radio" as const,
      options: [
        {
          value: "2",
          label:
            "Valores admitidos en mercados secundarios oficiales (España/EEE)",
        },
        {
          value: "12",
          label:
            "No admitidos a mercados secundarios oficiales de la UE/EEE (p. ej., EEUU, OTC)",
        },
      ],
      tooltip:
        "La duración del bloqueo depende de la admisión a negociación: 2 meses para valores admitidos en mercados oficiales del EEE; 12 meses para el resto.",
    },
  ],
  outputs: [
    { id: "periodoBloqueo", label: "Periodo de Bloqueo (No recomprar)", unit: "" },
    { id: "fechaRecompraSegura", label: "Fecha Segura para Recomprar", unit: "" },
  ],
  content:
    "### Introducción\n\nLa **\"regla de los dos meses\"** es una norma anti-abuso de la fiscalidad española diseñada para evitar que los inversores generen minusvalías artificiales a final de año para reducir su factura fiscal, sin desprenderse realmente de su inversión. Conocerla y aplicarla correctamente es crucial para una planificación fiscal eficiente. Esta calculadora es una herramienta de precisión que te indica, a partir de la fecha de venta con pérdidas, el **periodo exacto de bloqueo** y la **primera fecha segura** para recomprar los mismos activos (o valores homogéneos) sin que Hacienda anule la compensación de esa minusvalía.\n\n### Guida all'Uso del Calcolatore\n\nEl funcionamiento es simple y directo para darte la respuesta que necesitas sin rodeos:\n\n1.  **Fecha de Venta con Pérdidas**: Selecciona en el calendario el día exacto en que ejecutaste la venta que resultó en una minusvalía.\n2.  **Tipo de Mercado del Activo**: Elige la opción que corresponda al activo que vendiste. Este punto es clave, ya que la ley distingue entre:\n    * **2 meses**: Para acciones, ETFs o valores **admitidos a negociación** en mercados secundarios oficiales del EEE.\n    * **12 meses**: Para valores **no admitidos a negociación** en dichos mercados (p. ej., OTC o mercados de terceros países).\n\nAutomáticamente, la herramienta calculará el periodo de bloqueo y la fecha a partir de la cual puedes volver a invertir en el mismo valor.\n\n### Metodologia di Calcolo Spiegata\n\nLa lógica de esta herramienta se basa estrictamente en el **artículo 33.5 f) y g) de la Ley 35/2006 del IRPF**. La norma estipula que:\n\n> *\"No se computarán como pérdidas patrimoniales las derivadas de las transmisiones de valores o participaciones admitidos a negociación [...] cuando el contribuyente hubiera adquirido valores homogéneos dentro de los **dos meses anteriores o posteriores** a dichas transmisiones. Para valores no admitidos a negociación, el plazo es de **un año** (doce meses).\"*\n\nEl cálculo se realiza de la siguiente manera:\n\n1.  **Periodo de Bloqueo**: Desde **dos/12 meses antes** de la fecha de venta hasta **dos/12 meses después** (ambos inclusive), según el tipo de valor.\n2.  **Fecha Segura de Recompra**: Es el **día inmediatamente posterior** al fin del periodo de bloqueo.\n\nPor ejemplo, para una venta el 15 de noviembre en un mercado regulado (2 meses), el periodo de bloqueo posterior finaliza el 15 de enero del año siguiente. Por tanto, la fecha segura para recomprar es el 16 de enero.\n\n### Análisis Approfondita: Estrategias de Tax-Loss Harvesting y la Regla de los 2 Meses\n\nEl *Tax-Loss Harvesting* consiste en vender posiciones en pérdidas para compensarlas con ganancias en la base del ahorro. La regla de los dos meses es el principal límite en España.\n\n1. **Rotación a un Activo Correlacionado (no homogéneo)**: No recomprar el mismo ISIN. Puedes usar un ETF similar (otra gestora o índice próximo) para mantener exposición sin incumplir la norma. **Consulta siempre a un asesor fiscal**.\n2. **Planificación de la Recompra**: Si quieres volver al mismo activo, marca la fecha segura. La calculadora te ayuda.\n3. **Regla FIFO**: En ventas parciales, se consideran transmitidas primero las unidades más antiguas.\n\n### Domande Frequenti (FAQ)\n\n**1. ¿Qué se considera un \"valor homogéneo\"?**\nValores prácticamente idénticos (mismo emisor, tipo, derechos). Acciones ordinarias de la misma compañía se consideran homogéneas entre sí. Un ETF del IBEX 35 y un fondo del IBEX 35 **no** suelen ser homogéneos.\n\n**2. ¿Esta regla afecta también a los fondos de inversión?**\nLos fondos permiten traspasos con diferimiento fiscal. La regla aplica si **reembolsas** un fondo con pérdidas y **suscribes** el mismo fondo dentro del periodo de bloqueo.\n\n**3. ¿Qué pasa si recompro antes de la fecha segura?**\nLa minusvalía queda **bloqueada** y no se puede compensar ese año. Se integrará cuando transmitas definitivamente las nuevas unidades adquiridas.\n",
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué se considera un \"valor homogéneo\"?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Son aquellos valores que, por su naturaleza y características (emisor, tipo, derechos), son prácticamente idénticos. Por ejemplo, acciones ordinarias de Telefónica son homogéneas entre sí. Un ETF del IBEX 35 y un fondo del IBEX 35 generalmente no se consideran homogéneos.",
        },
      },
      {
        "@type": "Question",
        name: "¿Esta regla afecta también a los fondos de inversión?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Los fondos permiten traspasos con diferimiento fiscal. La regla de los dos meses aplica si reembolsas un fondo con pérdidas y suscribes el mismo fondo dentro del periodo de bloqueo.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué pasa si recompro acciones antes de la fecha segura?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Si recompras dentro del periodo de bloqueo, la minusvalía queda bloqueada y no podrás compensarla ese año. Se integrará cuando vendas las nuevas acciones.",
        },
      },
    ],
  },
} as const;

// --- Helper & Utility Components ---
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
    className="text-gray-400"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = () => (
  <script
    type="application/ld+json"
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }}
  />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/> \*(.*?)\*/, "<blockquote><p><em>$1</em></p></blockquote>");

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split("\n\n").map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith("### "))
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: processInlineFormatting(trimmedBlock.replace("### ", "")),
              }}
            />
          );
        if (trimmedBlock.startsWith("> "))
          return (
            <blockquote
              key={index}
              className="border-l-4 border-gray-200 pl-4 italic my-4"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: processInlineFormatting(trimmedBlock.replace("> ", "")),
              }}
            />
          );
        if (trimmedBlock.startsWith("* "))
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {trimmedBlock.split("\n").map((item, i) => (
                <li
                  key={i}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: processInlineFormatting(item.replace(/^\*\s*/, "")),
                  }}
                />
              ))}
            </ul>
          );
        if (/^\d+\.\s/.test(trimmedBlock))
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {trimmedBlock.split("\n").map((item, i) => (
                <li
                  key={i}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: processInlineFormatting(item.replace(/^\d+\.\s*/, "")),
                  }}
                />
              ))}
            </ol>
          );
        if (trimmedBlock)
          return (
            <p
              key={index}
              className="mb-4"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }}
            />
          );
        return null;
      })}
    </div>
  );
};

// --- Date helpers (calendar months, end-of-month clamped) ---
function addMonthsClamped(base: Date, months: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const origDay = d.getDate();
  // Move to first day of target month to avoid rollover issues
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  // Clamp to last day of target month if needed
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(origDay, lastDay));
  return d;
}

function toYMD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// --- Main Component ---
const CalculadoraReglaDosMeses: React.FC = () => {
  const { slug, title, description, inputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Avoid hydration mismatch: set today's date only on client
  const [states, setStates] = useState<{ [key: string]: any }>({
    fechaVenta: "",
    tipoMercado: "2",
  });

  useEffect(() => {
    setIsClient(true);
    if (!states.fechaVenta) {
      const today = new Date();
      setStates((prev) => ({ ...prev, fechaVenta: toYMD(today) }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStateChange = (id: string, value: any) => {
    setStates((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setStates({
      fechaVenta: isClient ? toYMD(new Date()) : "",
      tipoMercado: "2",
    });
  };

  const calculatedOutputs = useMemo(() => {
    const { fechaVenta, tipoMercado } = states;
    if (!fechaVenta) {
      return {
        periodoBloqueo: "",
        fechaRecompraSegura: "",
        fechaInicioBloqueo: "",
        fechaFinBloqueo: "",
      };
    }

    const mesesBloqueo = Number.isFinite(parseInt(tipoMercado, 10))
      ? parseInt(tipoMercado, 10)
      : 2;

    // Work at midnight local time
    const venta = new Date(`${fechaVenta}T00:00:00`);

    // Blocking window: [venta - meses, venta + meses]
    const inicio = addMonthsClamped(venta, -mesesBloqueo);
    const fin = addMonthsClamped(venta, mesesBloqueo);

    // Safe to repurchase: day after "fin"
    const recomprarSegura = new Date(fin);
    recomprarSegura.setDate(recomprarSegura.getDate() + 1);

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const locale = "es-ES";

    return {
      periodoBloqueo: `${inicio.toLocaleDateString(locale, options)} - ${fin.toLocaleDateString(locale, options)}`,
      fechaRecompraSegura: recomprarSegura.toLocaleDateString(locale, options),
      fechaInicioBloqueo: inicio.toLocaleDateString(locale, options),
      fechaFinBloqueo: fin.toLocaleDateString(locale, options),
    };
  }, [states]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (calculatorRef.current) {
        const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${slug}.pdf`);
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo exportar el PDF. Revisa la consola.");
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        inputs: states,
        outputs: calculatedOutputs,
        ts: Date.now(),
      };
      const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
      alert("Resultado guardado correctamente.");
    } catch {
      alert("No se pudo guardar el resultado.");
    }
  }, [states, calculatedOutputs, slug, title]);

  // Today (client) for max date constraint
  const maxDate = isClient ? toYMD(new Date()) : undefined;

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
              {title}
            </h1>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="bg-slate-50 p-4 rounded-lg space-y-6">
              {inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                    {input.label}
                    {"tooltip" in input && (input as any).tooltip ? (
                      <Tooltip text={(input as any).tooltip}>
                        <span className="ml-2">
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    ) : null}
                  </label>

                  {input.type === "date" && (
                    <input
                      type="date"
                      id={input.id}
                      value={states[input.id] || ""}
                      onChange={(e) => handleStateChange(input.id, e.target.value)}
                      max={maxDate}
                      className="w-full md:w-1/2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    />
                  )}

                  {input.type === "radio" && (
                    <div className="space-y-2">
                      {(input as any).options?.map((option: any) => (
                        <div key={option.value} className="flex items-center gap-x-3">
                          <input
                            id={`${input.id}-${option.value}`}
                            name={input.id}
                            type="radio"
                            value={option.value}
                            checked={states[input.id] === option.value}
                            onChange={(e) =>
                              handleStateChange(input.id, e.target.value)
                            }
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <label
                            htmlFor={`${input.id}-${option.value}`}
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados</h2>
              <div className="bg-gray-50 border-gray-300 border-l-4 p-4 rounded-r-lg">
                <div className="text-sm font-medium text-gray-600">
                  Periodo de Bloqueo (no puedes recomprar valores homogéneos)
                </div>
                <div className="text-lg font-bold text-gray-800 mt-1">
                  {isClient ? calculatedOutputs.periodoBloqueo : '...'}
                </div>
              </div>
              <div className="bg-indigo-50 border-indigo-500 border-l-4 p-4 rounded-r-lg">
                <div className="text-base font-medium text-indigo-800">
                  Fecha más próxima para recomprar sin penalización
                </div>
                <div className="text-2xl md:text-3xl font-bold text-indigo-600 mt-1">
                  {isClient ? calculatedOutputs.fechaRecompraSegura : '...'}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Línea Temporal</h3>
              <div className="w-full text-xs text-center">
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute top-1/2 left-0 h-2 -translate-y-1/2 bg-red-400 rounded-l-full"
                    style={{ width: '49%' }}
                  />
                  <div
                    className="absolute top-1/2 right-0 h-2 -translate-y-1/2 bg-red-400 rounded-r-full"
                    style={{ width: '49%' }}
                  />
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white" />
                </div>
                <div className="relative mt-2 grid grid-cols-3">
                  <div>
                    {isClient ? calculatedOutputs.fechaInicioBloqueo : ''}
                    <br />
                    <span className="font-bold text-red-600">Inicio Bloqueo</span>
                  </div>
                  <div className="font-bold">
                    {isClient
                      ? new Date(`${states.fechaVenta || ''}T00:00:00`).toLocaleDateString('es-ES', {
                          month: 'long',
                          day: 'numeric',
                        })
                      : ''}
                    <br />
                    <span className="text-red-700 font-extrabold">VENTA</span>
                  </div>
                  <div>
                    {isClient ? calculatedOutputs.fechaFinBloqueo : ''}
                    <br />
                    <span className="font-bold text-red-600">Fin Bloqueo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSaveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Resetear
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Análisis y Metodología</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 35/2006, del IRPF — Art. 33.5 f) y g)
                </a>
              </li>
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2019/8-cumplimentacion-irpf/8_2-ganancias-perdidas-patrimoniales/8_2_1-conceptos-generales/8_2_1_1-concepto-ganancias-perdidas-patrimoniales/integracion-diferida-perdidas-patrimoniales-derivadas-transmisiones.html"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-indigo-600 hover:underline"
                >
                  AEAT — Integración diferida y recompra de valores homogéneos
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraReglaDosMeses;
