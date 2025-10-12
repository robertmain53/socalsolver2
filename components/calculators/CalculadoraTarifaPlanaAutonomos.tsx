'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const meta = {
  title: "Calculadora de la \"Tarifa Plana\" para nuevos autónomos",
  description: "Calcula tu ahorro con la tarifa plana de autónomos. Simula cuotas, bonificaciones y beneficios para nuevos trabajadores por cuenta propia en España."
};

// --- Icona para los Tooltip (SVG inline para evitar dependencias) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const TooltipComponent = ({ text, children }: { text: string, children: React.ReactNode }) => (
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
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
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
        
        if (trimmedBlock.startsWith('# **')) {
          return <h1 key={index} className="text-2xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/# \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('## **')) {
          return <h2 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/## \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('#### **')) {
          return <h4 key={index} className="text-base font-semibold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('* ')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\* /, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-1 mb-4">
              {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
            </ul>
          );
        }
        if (trimmedBlock.match(/^\d\. /)) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\. /, ''));
          return (
            <ol key={index} className="list-decimal pl-5 space-y-1 mb-4">
              {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
            </ol>
          );
        }
        if (trimmedBlock) {
          return <p key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        }
        return null;
      })}
    </div>
  );
};

// Datos de configuración del calculador
const calculatorData = {
  "slug": "calculadora-tarifa-plana-autonomos",
  "category": "impuestos-y-trabajo-autonomo", 
  "title": "Calculadora de la \"Tarifa Plana\" para nuevos autónomos",
  "lang": "es",
  "inputs": [
    {
      "id": "fecha_alta_autonomo",
      "label": "Fecha prevista de alta como autónomo",
      "type": "date" as const,
      "tooltip": "Introduce la fecha en la que planeas darte de alta como autónomo. Esta fecha determinará los beneficios aplicables."
    },
    {
      "id": "es_menor_30",
      "label": "¿Eres menor de 30 años?",
      "type": "boolean" as const,
      "tooltip": "Los menores de 30 años tienen acceso a beneficios adicionales en la tarifa plana de autónomos."
    },
    {
      "id": "es_mujer",
      "label": "¿Eres mujer?",
      "type": "boolean" as const,
      "tooltip": "Las mujeres pueden acceder a beneficios adicionales y extensiones de la tarifa plana."
    },
    {
      "id": "primera_vez_autonomo",
      "label": "¿Es tu primera vez como autónomo?",
      "type": "boolean" as const,
      "tooltip": "Para acceder a la tarifa plana, no debes haber estado dado de alta como autónomo en los últimos 2 años (salvo excepciones)."
    },
    {
      "id": "base_cotizacion_deseada",
      "label": "Base de cotización deseada",
      "type": "number" as const,
      "unit": "€",
      "min": 1166.70,
      "max": 4495.50,
      "step": 50,
      "tooltip": "Elige la base de cotización sobre la que deseas cotizar. Afecta a tus prestaciones futuras y a la cuota a pagar."
    },
    {
      "id": "actividad_economica",
      "label": "Tipo de actividad económica",
      "type": "select" as const,
      "options": [
        {"value": "comercial", "label": "Actividad comercial"},
        {"value": "servicios", "label": "Prestación de servicios"},
        {"value": "profesional", "label": "Actividad profesional"},
        {"value": "artesanal", "label": "Actividad artesanal"}
      ],
      "tooltip": "Selecciona el tipo de actividad que vas a desarrollar como autónomo."
    },
    {
      "id": "ingresos_estimados_anuales",
      "label": "Ingresos brutos anuales estimados",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 1000,
      "tooltip": "Estima tus ingresos brutos anuales. Esto ayudará a calcular tu rentabilidad con la tarifa plana."
    },
    {
      "id": "gastos_deducibles_anuales",
      "label": "Gastos deducibles anuales estimados",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 500,
      "tooltip": "Incluye gastos como material de oficina, formación, combustible, dietas, etc. que podrás deducir."
    }
  ],
  "outputs": [
    {
      "id": "cuota_mes_1_12",
      "label": "Cuota mensual (meses 1-12)",
      "unit": "€"
    },
    {
      "id": "cuota_mes_13_24", 
      "label": "Cuota mensual (meses 13-24)",
      "unit": "€"
    },
    {
      "id": "cuota_mes_25_36",
      "label": "Cuota mensual (meses 25-36)",
      "unit": "€"
    },
    {
      "id": "cuota_normal",
      "label": "Cuota mensual normal (sin tarifa plana)",
      "unit": "€"
    },
    {
      "id": "ahorro_total_24_meses",
      "label": "Ahorro total en 24 meses",
      "unit": "€"
    },
    {
      "id": "ahorro_total_36_meses",
      "label": "Ahorro total en 36 meses (si aplica)",
      "unit": "€"
    },
    {
      "id": "beneficio_neto_anual_estimado",
      "label": "Beneficio neto anual estimado",
      "unit": "€"
    }
  ],
  "content": `# **Guía Completa de la Tarifa Plana para Nuevos Autónomos en España**

## **¿Qué es la Tarifa Plana de Autónomos?**

La **Tarifa Plana de Autónomos** es una bonificación que permite a los nuevos trabajadores por cuenta propia pagar una cuota reducida a la Seguridad Social durante sus primeros años de actividad. Esta medida, diseñada para fomentar el emprendimiento, puede representar un **ahorro significativo** en los costes iniciales de establecerse como autónomo.

### **Requisitos para Acceder a la Tarifa Plana**

Para beneficiarte de esta bonificación, debes cumplir los siguientes requisitos:

* **No haber estado de alta** como autónomo en los 2 años anteriores (existen excepciones)
* **Estar al corriente** de las obligaciones con la Seguridad Social y Hacienda
* **No deber** cuotas pendientes de otros regímenes de la Seguridad Social
* **Solicitar la bonificación** en el momento del alta o dentro del mes siguiente

### **Estructura de la Tarifa Plana 2025**

#### **Todos los Nuevos Autónomos**
* **Primeros 12 meses**: 80€/mes (cuota fija)
* **Meses 13 a 24**: 50% de descuento sobre la cuota normal

#### **Bonificaciones Adicionales para Colectivos Específicos**

**Menores de 30 años y mujeres:**
* **Meses 25 a 36**: 30% de descuento adicional

**Autónomos en municipios rurales:**
* Pueden acceder a **extensiones adicionales** de la bonificación

## **Cálculo de las Cuotas de Autónomos**

### **Base de Cotización**

La base de cotización es el importe sobre el que se calculan tanto las cuotas como las prestaciones futuras. En 2025:

* **Mínima**: 1.166,70€/mes
* **Máxima**: 4.495,50€/mes

### **Tipos de Cotización**

Los autónomos cotizan por:

* **Contingencias comunes**: 28,30%
* **Accidentes de trabajo y enfermedades profesionales**: 0,65%
* **Cese de actividad**: 0,90%
* **Formación profesional**: 0,10%
* **FOGASA**: 0,05%

**Total**: 30,60% sobre la base de cotización elegida

## **Estrategias para Maximizar el Beneficio**

### **Elección de la Base de Cotización**

**Factores a considerar:**

1. **Prestaciones futuras**: Una base mayor resulta en mejores prestaciones (jubilación, incapacidad temporal, etc.)
2. **Situación financiera actual**: Durante la tarifa plana, el coste adicional por base más alta es menor
3. **Perspectivas de ingresos**: Si esperas ingresos altos, una base mayor puede ser estratégica

### **Planificación Fiscal**

**Gastos deducibles comunes:**
* Material de oficina y equipos informáticos
* Gastos de formación y desarrollo profesional
* Combustible y dietas (con límites)
* Alquiler de oficina o parte proporcional del domicilio
* Seguros profesionales
* Cuotas de colegios profesionales`,
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto se paga de autónomo con la tarifa plana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Con la tarifa plana de autónomos, los primeros 12 meses se pagan 80€ mensuales. Del mes 13 al 24 se aplica un 50% de descuento sobre la cuota normal. Los menores de 30 años y mujeres pueden tener descuentos adicionales hasta el mes 36."
        }
      },
      {
        "@type": "Question", 
        "name": "¿Quién puede acceder a la tarifa plana de autónomos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pueden acceder los nuevos autónomos que no hayan estado dados de alta en los últimos 2 años, estén al corriente de pagos con Seguridad Social y Hacienda, y soliciten la bonificación en el momento del alta."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto puedo ahorrar con la tarifa plana de autónomos?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "El ahorro depende de la base de cotización elegida. Con la base mínima, puedes ahorrar aproximadamente 3.300€ el primer año y 2.100€ el segundo año. Los menores de 30 años y mujeres pueden ahorrar hasta 1.300€ adicionales en el tercer año."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué pasa después de la tarifa plana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Una vez terminado el período de bonificación, deberás pagar la cuota completa según la base de cotización elegida. Es importante planificar financieramente esta transición."
        }
      }
    ]
  }
};

const CalculadoraTarifaPlanaAutonomos: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculadoraRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    fecha_alta_autonomo: "2025-01-01",
    es_menor_30: false,
    es_mujer: false,
    primera_vez_autonomo: true,
    base_cotizacion_deseada: 1166.70,
    actividad_economica: "servicios",
    ingresos_estimados_anuales: 30000,
    gastos_deducibles_anuales: 5000
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
      es_menor_30, es_mujer, primera_vez_autonomo,
      base_cotizacion_deseada, ingresos_estimados_anuales,
      gastos_deducibles_anuales
    } = states;

    // Cálculo de la cuota normal (30.60% de la base)
    const cuota_normal = base_cotizacion_deseada * 0.3060;
    
    // Cálculos de cuotas con tarifa plana
    const cuota_mes_1_12 = primera_vez_autonomo ? 80 : cuota_normal;
    const cuota_mes_13_24 = primera_vez_autonomo ? (cuota_normal * 0.50) : cuota_normal;
    const cuota_mes_25_36 = (es_menor_30 || es_mujer) && primera_vez_autonomo ? (cuota_normal * 0.70) : cuota_normal;
    
    // Cálculos de ahorros
    const ahorro_total_24_meses = (cuota_normal - cuota_mes_1_12) * 12 + (cuota_normal - cuota_mes_13_24) * 12;
    const ahorro_total_36_meses = ahorro_total_24_meses + ((es_menor_30 || es_mujer) ? (cuota_normal - cuota_mes_25_36) * 12 : 0);
    
    // Estimación de impuestos (aproximación simple)
    const base_imponible = Math.max(0, ingresos_estimados_anuales - gastos_deducibles_anuales);
    const impuestos_estimados = base_imponible * 0.19; // IRPF aproximado
    
    const beneficio_neto_anual_estimado = base_imponible - (cuota_mes_1_12 * 12) - impuestos_estimados;

    return {
      cuota_mes_1_12: Math.round(cuota_mes_1_12 * 100) / 100,
      cuota_mes_13_24: Math.round(cuota_mes_13_24 * 100) / 100,
      cuota_mes_25_36: Math.round(cuota_mes_25_36 * 100) / 100,
      cuota_normal: Math.round(cuota_normal * 100) / 100,
      ahorro_total_24_meses: Math.round(ahorro_total_24_meses * 100) / 100,
      ahorro_total_36_meses: Math.round(ahorro_total_36_meses * 100) / 100,
      beneficio_neto_anual_estimado: Math.round(beneficio_neto_anual_estimado * 100) / 100
    };
  }, [states]);

  const chartData = [
    { name: 'Cuota Normal', value: calculatedOutputs.cuota_normal, color: '#ef4444' },
    { name: 'Meses 1-12', value: calculatedOutputs.cuota_mes_1_12, color: '#22c55e' },
    { name: 'Meses 13-24', value: calculatedOutputs.cuota_mes_13_24, color: '#f59e0b' },
    ...(states.es_menor_30 || states.es_mujer ? [{ name: 'Meses 25-36', value: calculatedOutputs.cuota_mes_25_36, color: '#8b5cf6' }] : [])
  ];

  const formulaUsada = `Cuota Normal = Base de Cotización × 30,60%
Tarifa Plana Año 1 = 80€ fijos
Tarifa Plana Año 2 = Cuota Normal × 50%
Tarifa Plana Año 3* = Cuota Normal × 70% (*solo menores 30 años y mujeres)`;

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

  const salvarResultado = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existing = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existing].slice(0, 50)));
      alert("¡Resultado guardado con éxito!");
    } catch { alert("Imposible guardar el resultado."); }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <>
      <SchemaInjector schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-6" ref={calculadoraRef}>
            <div className=" -lg -md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">{meta.description}</p>
              
              <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
                <strong>Aviso importante:</strong> Este calculador ofrece una estimación orientativa basada en la normativa vigente. Los resultados pueden variar según tu situación específica. Para asesoramiento personalizado, consulta con un gestor especializado.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => {
                  const inputLabel = (
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <TooltipComponent text={input.tooltip}><span className="ml-2"><InfoIcon /></span></TooltipComponent>}
                    </label>
                  );

                  if (input.type === 'boolean') {
                    return (
                      <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                        <input 
                          id={input.id} 
                          type="checkbox" 
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                          checked={states[input.id]} 
                          onChange={(e) => handleStateChange(input.id, e.target.checked)} 
                        />
                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                      </div>
                    );
                  }

                  if (input.type === 'select') {
                    return (
                      <div key={input.id}>
                        {inputLabel}
                        <select
                          id={input.id}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                        >
                          {input.options?.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (input.type === 'date') {
                    return (
                      <div key={input.id}>
                        {inputLabel}
                        <input 
                          id={input.id} 
                          type="date" 
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2" 
                          value={states[input.id]} 
                          onChange={(e) => handleStateChange(input.id, e.target.value)} 
                        />
                      </div>
                    );
                  }
                  
                  return (
                    <div key={input.id}>
                      {inputLabel}
                      <div className="flex items-center gap-2">
                        <input 
                          id={input.id} 
                          aria-label={input.label} 
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2" 
                          type="number" 
                          min={input.min} 
                          max={input.max}
                          step={input.step} 
                          value={states[input.id]} 
                          onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} 
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados de la Simulación</h2>
                {outputs.map(output => {
                  const shouldShow = output.id !== 'cuota_mes_25_36' && output.id !== 'ahorro_total_36_meses' || 
                                   (states.es_menor_30 || states.es_mujer);
                  
                  if (!shouldShow) return null;
                  
                  return (
                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                      output.id.includes('ahorro') ? 'bg-green-50 border-green-500' : 
                      output.id === 'cuota_normal' ? 'bg-red-50 border-red-500' :
                      'bg-blue-50 border-blue-500'
                    }`}>
                      <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                      <div className={`text-xl md:text-2xl font-bold ${
                        output.id.includes('ahorro') ? 'text-green-600' : 
                        output.id === 'cuota_normal' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparativa de Cuotas Mensuales</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `€${value}`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-700">Fórmulas de Cálculo Utilizadas</h3>
            <pre className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono whitespace-pre-wrap">{formulaUsada}</pre>
            <p className="text-xs text-gray-500 mt-2">Nota: Estas fórmulas son simplificaciones de los cálculos reales y sirven únicamente como referencia orientativa.</p>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvarResultado} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Guardar</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Exportar PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Restablecer</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía Completa</h2>
            <div className="max-h-96 overflow-y-auto">
              <ContentRenderer content={content} />
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10817/31190" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Seguridad Social - Tarifa Plana Autónomos</a></li>
              <li><a href="https://www.hacienda.gob.es/Documentacion/Publico/NormativaDoctrina/Tributaria/IRPF/Guias/Guia_IRPF_2024.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Agencia Tributaria - Guía IRPF</a></li>
              <li><a href="https://www.boe.es/buscar/doc.php?id=BOE-A-2022-21820" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">BOE - Ley General de la Seguridad Social</a></li>
              <li><a href="https://www.sepe.es/HomeSepe/autonomos" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SEPE - Información para Autónomos</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraTarifaPlanaAutonomos;