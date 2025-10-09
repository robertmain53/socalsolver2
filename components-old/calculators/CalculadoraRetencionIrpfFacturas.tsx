'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

// Lazy loading del componente de gráficos completo
const DynamicChart = dynamic(
  () => import('recharts').then((recharts) => {
    const ChartComponent = ({ data }: { data: any[] }) => {
      const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = recharts;
      
      const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Math.abs(value));
      
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `€${Math.abs(value)}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="Base Imponible" fill="#3b82f6" name="Base Imponible" />
            <Bar dataKey="IVA" fill="#10b981" name="IVA" />
            <Bar dataKey="Retención IRPF" fill="#ef4444" name="Retención IRPF" />
          </BarChart>
        </ResponsiveContainer>
      );
    };
    return { default: ChartComponent };
  }),
  { 
    ssr: false, 
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-500">Cargando gráfico...</div> 
  }
);

export const meta = {
  title: "Calculadora de Retenciones IRPF para Facturas Profesionales",
  description: "Calcula de forma precisa el IVA y las retenciones IRPF en tus facturas como autónomo profesional en España."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Schema Injector para SEO ---
const SchemaInjector = ({ schema }: { schema: any }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);
  
  return null;
};

// --- Componente para el rendering del contenido Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  };

  const blocks = content.split('\n\n');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('#### **')) {
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
            </ul>
          );
        }
        if (trimmedBlock.match(/^\d\.\s/)) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
            </ol>
          );
        }
        if (trimmedBlock) {
          return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        }
        return null;
      })}
    </div>
  );
};

// Dati di configurazione del calcolatore
const calculatorData = {
  "slug": "calculadora-retencion-irpf-facturas",
  "category": "impuestos-y-trabajo-autonomo", 
  "title": "Calculadora de Retenciones IRPF para Facturas Profesionales",
  "lang": "es",
  "inputs": [
    {
      "id": "base_imponible",
      "label": "Base Imponible (sin IVA)",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 0.01,
      "tooltip": "Introduce el importe de tu factura antes de aplicar el IVA. Esta es la cantidad sobre la que se calculan tanto el IVA como la retención de IRPF."
    },
    {
      "id": "tipo_actividad", 
      "label": "Tipo de Actividad",
      "type": "select" as const,
      "options": [
        {"value": "profesional", "label": "Actividad Profesional/Artística (15%)"},
        {"value": "empresarial", "label": "Actividad Empresarial (0%)"},
        {"value": "modulos", "label": "Estimación por Módulos (1%)"},
        {"value": "agricola", "label": "Actividad Agrícola/Forestal (2%)"},
        {"value": "ganadera", "label": "Ganadería (Engorde/Avicultura) (1%)"}
      ],
      "tooltip": "Selecciona el tipo de actividad según tu epígrafe de IAE. Las actividades profesionales y artísticas están obligadas a retener IRPF del 15%."
    },
    {
      "id": "nuevo_autonomo",
      "label": "Nuevo autónomo (primeros 3 años)",
      "type": "boolean" as const,
      "condition": "tipo_actividad == 'profesional'",
      "tooltip": "Marca esta casilla si estás en tus primeros 3 años de actividad como autónomo. En este caso, la retención IRPF se reduce al 7%."
    },
    {
      "id": "tipo_cliente",
      "label": "Tipo de Cliente",
      "type": "select" as const,
      "options": [
        {"value": "empresa", "label": "Empresa o Profesional"},
        {"value": "particular", "label": "Particular"}
      ],
      "tooltip": "Solo se aplica retención IRPF cuando facturas a empresas u otros profesionales. No se retiene IRPF en facturas a particulares."
    },
    {
      "id": "tipo_iva",
      "label": "Tipo de IVA",
      "type": "select" as const,
      "options": [
        {"value": 21, "label": "IVA General (21%)"},
        {"value": 10, "label": "IVA Reducido (10%)"},
        {"value": 4, "label": "IVA Superreducido (4%)"},
        {"value": 0, "label": "Exento de IVA (0%)"}
      ],
      "tooltip": "Selecciona el tipo de IVA aplicable a tu servicio o producto. El 21% es el tipo general para la mayoría de servicios profesionales."
    }
  ],
  "outputs": [
    {
      "id": "base_imponible_resultado",
      "label": "Base Imponible",
      "unit": "€"
    },
    {
      "id": "importe_iva", 
      "label": "IVA",
      "unit": "€"
    },
    {
      "id": "porcentaje_irpf",
      "label": "% Retención IRPF",
      "unit": "%"
    },
    {
      "id": "importe_irpf",
      "label": "Retención IRPF", 
      "unit": "€"
    },
    {
      "id": "total_factura",
      "label": "Total Factura (Base + IVA)",
      "unit": "€"
    },
    {
      "id": "total_cobrar",
      "label": "Total a Cobrar (después de IRPF)",
      "unit": "€"
    }
  ],
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage", 
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué autónomos deben aplicar retención IRPF en sus facturas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Deben aplicar retención IRPF los autónomos que realizan actividades profesionales y artísticas (15% general, 7% para nuevos autónomos), actividades en estimación objetiva por módulos (1%), actividades agrícolas y forestales (2%), y ganadería de engorde (1%). Las actividades empresariales no aplican retención."
        }
      },
      {
        "@type": "Question", 
        "name": "¿Se aplica retención IRPF cuando facturo a particulares?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, la retención IRPF solo se aplica cuando facturas a empresas u otros profesionales. Cuando facturas a particulares no debes incluir retención, independientemente de tu tipo de actividad."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo se calcula la retención IRPF en una factura?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "La retención IRPF se calcula aplicando el porcentaje correspondiente sobre la base imponible (no sobre el total con IVA). Por ejemplo, para una base de 1.000€ con retención del 15%, serían 150€ de retención."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué porcentaje de IRPF debo aplicar como nuevo autónomo?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Los nuevos autónomos que realizan actividades profesionales pueden aplicar una retención reducida del 7% durante su primer año de actividad y los dos años siguientes, en lugar del 15% general."
        }
      },
      {
        "@type": "Question",
        "name": "¿Quién ingresa la retención IRPF a Hacienda?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El cliente que recibe la factura es quien debe ingresar la retención IRPF a Hacienda mediante el modelo 111 (trimestral) y proporcionar el certificado de retenciones al profesional mediante el modelo 190."
        }
      }
    ]
  },
  "content": `### **Guía Completa de Retenciones IRPF para Profesionales Autónomos**

**Todo lo que necesitas saber sobre el cálculo de retenciones en tus facturas**

Como profesional autónomo en España, es fundamental que comprendas cómo funcionan las retenciones de IRPF en tus facturas. Esta guía te explica de forma clara y detallada todo lo que necesitas saber para cumplir correctamente con tus obligaciones fiscales.

### **¿Qué es la retención de IRPF en facturas?**

La retención de IRPF es un adelanto del Impuesto sobre la Renta de las Personas Físicas que se descuenta directamente de tus facturas. Funciona como un **pago a cuenta** que se deduce de tu declaración anual de la renta.

Cuando emites una factura con retención, tu cliente actúa como **agente retenedor**: te paga el importe total menos el porcentaje de IRPF retenido, que él mismo ingresa a Hacienda en tu nombre.

### **¿Quién debe aplicar retenciones IRPF en sus facturas?**

No todos los autónomos tienen la obligación de aplicar retenciones. Depende principalmente de tu **tipo de actividad** según el epígrafe de IAE:

#### **Actividades Profesionales y Artísticas (Retención 15%)**

* Consultores, asesores y profesionales liberales
* Arquitectos, ingenieros y profesionales técnicos
* Abogados, economistas, gestores administrativos
* Médicos, psicólogos y profesionales sanitarios
* Diseñadores, artistas y creativos
* Traductores, formadores y profesores
* Periodistas y profesionales de la comunicación

#### **Nuevos Profesionales (Retención 7%)**

Si es tu **primer año de actividad** y durante los **dos años siguientes**, puedes aplicar una retención reducida del **7%** en lugar del 15% general.

### **Cómo calcular tu factura con IVA y retención IRPF**

#### **Paso a paso del cálculo:**

1. **Determina la base imponible**: El importe de tu servicio sin impuestos

2. **Calcula el IVA**: 
   * IVA = Base Imponible × (% IVA / 100)
   * Tipos habituales: 21% (general), 10% (reducido), 4% (superreducido)

3. **Determina el % de retención IRPF**:
   * Según tu tipo de actividad y antigüedad
   * Solo si facturas a empresa/profesional

4. **Calcula la retención IRPF**:
   * IRPF = Base Imponible × (% IRPF / 100)
   * **Importante**: Se calcula sobre la base imponible, NO sobre el total con IVA

5. **Total de la factura**:
   * Total Factura = Base Imponible + IVA

6. **Total a cobrar**:
   * Total a Cobrar = Total Factura - Retención IRPF

### **Errores frecuentes a evitar**

* **No aplicar retención** cuando es obligatorio según tu actividad
* **Aplicar retención a particulares** (solo se aplica a empresas/profesionales)
* **Calcular el IRPF** sobre el total con IVA en lugar de sobre la base imponible
* **Confundir los porcentajes** según el tipo de actividad y antigüedad`
};

const CalculadoraRetencionIrpfFacturas: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculadoraRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    base_imponible: 1000,
    tipo_actividad: "profesional",
    nuevo_autonomo: false,
    tipo_cliente: "empresa",
    tipo_iva: 21
  };
  const [states, setStates] = useState<{[key: string]: any}>(initialStates);

  const handleStateChange = (id: string, value: any) => {
    setStates(prev => ({...prev, [id]: value}));
  };
  
  const handleReset = () => {
    setStates(initialStates);
  };

  const calculatedOutputs = useMemo(() => {
    const {
      base_imponible, tipo_actividad, nuevo_autonomo, tipo_cliente, tipo_iva
    } = states;

    // Calcular IVA
    const importe_iva = base_imponible * (tipo_iva / 100);

    // Determinar porcentaje IRPF
    let porcentaje_irpf = 0;
    if (tipo_cliente === 'empresa') {
      switch (tipo_actividad) {
        case 'profesional':
          porcentaje_irpf = nuevo_autonomo ? 7 : 15;
          break;
        case 'empresarial':
          porcentaje_irpf = 0;
          break;
        case 'modulos':
          porcentaje_irpf = 1;
          break;
        case 'agricola':
          porcentaje_irpf = 2;
          break;
        case 'ganadera':
          porcentaje_irpf = 1;
          break;
        default:
          porcentaje_irpf = 0;
      }
    }

    // Calcular IRPF
    const importe_irpf = base_imponible * (porcentaje_irpf / 100);

    // Calcular totales
    const total_factura = base_imponible + importe_iva;
    const total_cobrar = total_factura - importe_irpf;

    return {
      base_imponible_resultado: base_imponible,
      importe_iva,
      porcentaje_irpf,
      importe_irpf,
      total_factura,
      total_cobrar
    };
  }, [states]);

  const chartData = [
    { 
      name: 'Desglose', 
      'Base Imponible': calculatedOutputs.base_imponible_resultado,
      'IVA': calculatedOutputs.importe_iva,
      'Retención IRPF': -calculatedOutputs.importe_irpf
    }
  ];

  const formulaUsada = `Base Imponible: ${calculatedOutputs.base_imponible_resultado}€ | IVA (${states.tipo_iva}%): ${calculatedOutputs.importe_iva.toFixed(2)}€ | IRPF (${calculatedOutputs.porcentaje_irpf}%): ${calculatedOutputs.importe_irpf.toFixed(2)}€ | Total a Cobrar: ${calculatedOutputs.total_cobrar.toFixed(2)}€`;

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculadoraRef.current) return;
      const canvas = await html2canvas(calculadoraRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`${slug}.pdf`);
    } catch (_e) { alert("Función PDF no disponible en este ambiente"); }
  }, [slug]);

  const salvaResultado = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
      alert("Resultado guardado con éxito!");
    } catch { alert("Imposible guardar el resultado."); }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <>
      <SchemaInjector schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-6" ref={calculadoraRef}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Calcula de forma precisa el IVA y las retenciones IRPF en tus facturas profesionales</p>
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Aviso Legal:</strong> Esta calculadora proporciona estimaciones orientativas basadas en la normativa fiscal vigente. Para casos específicos, consulta siempre con tu asesor fiscal.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => {
                  const conditionMet = !input.condition || (input.condition.includes("== 'profesional'") && states[input.condition.split(' ')[0]] === 'profesional');
                  if (!conditionMet) return null;

                  const inputLabel = (
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                    </label>
                  );

                  if (input.type === 'boolean') {
                    return (
                      <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                        <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                      </div>
                    );
                  }

                  if (input.type === 'select') {
                    return (
                      <div key={input.id} className={input.id === 'tipo_actividad' ? 'md:col-span-2' : ''}>
                        {inputLabel}
                        <select id={input.id} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2" value={states[input.id]} onChange={(e) => handleStateChange(input.id, input.options ? (isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)) : e.target.value)}>
                          {input.options?.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={input.id}>
                      {inputLabel}
                      <div className="flex items-center gap-2">
                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Desglose de la Factura</h2>
                {outputs.map(output => (
                  <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'total_cobrar' ? 'bg-green-50 border-green-500' : output.id === 'importe_irpf' ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'total_cobrar' ? 'text-green-600' : output.id === 'importe_irpf' ? 'text-red-600' : 'text-gray-800'}`}>
                      <span>{isClient ? (output.unit === '%' ? `${(calculatedOutputs as any)[output.id]}%` : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualización del Desglose</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && <DynamicChart data={chartData} />}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-700">Resumen del Cálculo</h3>
            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded break-words">{formulaUsada}</p>
            <p className="text-xs text-gray-500 mt-2">El IRPF se calcula sobre la base imponible, no sobre el total con IVA.</p>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvaResultado} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Guardar</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía Completa</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ContentRenderer content={content} />
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Enlaces de Referencia</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Agencia Tributaria</a> - Información oficial sobre IRPF e IVA</li>
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/iva/calculo-iva-repercutido-clientes/tipos-impositivos-iva.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Tipos de IVA 2025</a> - Tipos impositivos actualizados</li>
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/Retenciones.shtml" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Retenciones IRPF</a> - Normativa sobre retenciones profesionales</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraRetencionIrpfFacturas;