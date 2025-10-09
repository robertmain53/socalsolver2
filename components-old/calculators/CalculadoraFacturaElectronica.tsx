'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export const meta = {
  title: "Calculadora de la Factura Electrónica (coste de implementación)",
  description: "Calcula los costes reales de implementar facturación electrónica en tu negocio. Incluye ROI, subvenciones Kit Digital y fechas límite de cumplimiento normativo."
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

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question", 
            "name": "¿Cuándo debo implementar la facturación electrónica?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AHORA es el mejor momento. Tienes acceso al Kit Digital hasta octubre 2025, precios competitivos de implementación, y tiempo suficiente para una transición sin estrés antes de que sea obligatorio en 2026-2027."
            }
          },
          {
            "@type": "Question",
            "name": "¿Qué pasa si no cumplo con la obligación de facturación electrónica?", 
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Las sanciones van desde €150 hasta €6,000 por infracción, pero el verdadero coste es la pérdida de eficiencia operativa y competitividad. Muchos clientes grandes ya exigen facturación electrónica."
            }
          },
          {
            "@type": "Question",
            "name": "¿El Kit Digital cubre todos los costes de implementación?",
            "acceptedAnswer": {
              "@type": "Answer", 
              "text": "En la mayoría de casos SÍ. Para autónomos cubre hasta €2,000, microPYMEs hasta €6,000, y PYME pequeñas hasta €12,000. Suele cubrir el 80-100% de los costes totales de implementación."
            }
          },
          {
            "@type": "Question",
            "name": "¿Puedo usar el sistema gratuito VERIFACTU de Hacienda?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "VERIFACTU permite emitir hasta 100 facturas anuales gratuitamente. Es perfecto para autónomos con muy poco volumen, pero si emites más de 8-10 facturas al mes, necesitarás software privado más robusto."
            }
          },
          {
            "@type": "Question", 
            "name": "¿La implementación de facturación electrónica es complicada?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Con la herramienta adecuada, NO. Los software modernos se configuran en 1-2 días, la migración es automática, y con buen soporte técnico el proceso es muy sencillo."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente para el rendering del contenuto Markdown ---
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
        if (trimmedBlock.startsWith('**') && trimmedBlock.endsWith(':**')) {
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/\*\*/g, '')) }} />;
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
        if (trimmedBlock.includes('✅') || trimmedBlock.includes('❌')) {
          return (
            <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />
            </div>
          );
        }
        if (trimmedBlock.startsWith('```')) {
          const codeContent = trimmedBlock.replace(/```[\s\S]*?\n/, '').replace(/```$/, '');
          return (
            <div key={index} className="bg-gray-100 p-4 rounded-md mb-4 font-mono text-sm overflow-x-auto">
              <pre>{codeContent}</pre>
            </div>
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
  "slug": "calculadora-factura-electronica",
  "category": "bienes-raices-y-vivienda",
  "title": "Calculadora de la Factura Electrónica (coste de implementación)",
  "lang": "es",
  "inputs": [
    {
      "id": "tipo_negocio",
      "label": "Tipo de negocio",
      "type": "select" as const,
      "options": [
        {"value": "autonomo", "label": "Autónomo (trabajador independiente)"},
        {"value": "micropyme", "label": "MicroPYME (1-9 empleados)"},
        {"value": "pyme_pequena", "label": "PYME Pequeña (10-49 empleados)"},
        {"value": "pyme_mediana", "label": "PYME Mediana (50-249 empleados)"}
      ],
      "tooltip": "Selecciona el tipo de negocio según el número de empleados. Esto afecta a los costes y ayudas disponibles."
    },
    {
      "id": "facturacion_anual",
      "label": "Facturación anual",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 1000,
      "tooltip": "Ingresos anuales totales del negocio. Determina las obligaciones normativas y ayudas disponibles."
    },
    {
      "id": "facturas_mensuales",
      "label": "Número de facturas emitidas al mes",
      "type": "number" as const,
      "unit": "facturas",
      "min": 1,
      "step": 5,
      "tooltip": "Número aproximado de facturas que emites mensualmente. Afecta al coste del software y tiempo de procesamiento."
    },
    {
      "id": "facturas_recibidas_mensuales",
      "label": "Número de facturas recibidas al mes",
      "type": "number" as const,
      "unit": "facturas",
      "min": 0,
      "step": 5,
      "tooltip": "Facturas que recibes de proveedores. También deben procesarse digitalmente para máxima eficiencia."
    },
    {
      "id": "tiene_software_actual",
      "label": "¿Tienes actualmente software de facturación?",
      "type": "boolean" as const,
      "tooltip": "Indica si ya utilizas algún programa informático para facturar o si facturas manualmente."
    },
    {
      "id": "nivel_digitalizacion",
      "label": "Nivel de digitalización actual",
      "type": "select" as const,
      "options": [
        {"value": "basico", "label": "Básico (facturas en papel/Word/Excel)"},
        {"value": "intermedio", "label": "Intermedio (software básico sin integración)"},
        {"value": "avanzado", "label": "Avanzado (software integrado con contabilidad)"}
      ],
      "tooltip": "Tu nivel actual de digitalización determina los costes de migración y formación necesarios."
    },
    {
      "id": "necesita_integracion_erp",
      "label": "¿Necesitas integración con ERP/Contabilidad?",
      "type": "boolean" as const,
      "tooltip": "La integración con sistemas de gestión empresarial reduce errores pero aumenta el coste inicial."
    },
    {
      "id": "requiere_formacion",
      "label": "¿Necesitas formación para el equipo?",
      "type": "boolean" as const,
      "tooltip": "La formación es crucial para maximizar los beneficios de la digitalización."
    },
    {
      "id": "elegible_kit_digital",
      "label": "¿Eres elegible para el Kit Digital?",
      "type": "boolean" as const,
      "tooltip": "El Kit Digital subvenciona hasta €12,000 para digitalización. Disponible hasta octubre 2025."
    },
    {
      "id": "tiempo_procesamiento_actual",
      "label": "Tiempo actual por factura (minutos)",
      "type": "number" as const,
      "unit": "minutos",
      "min": 1,
      "step": 1,
      "tooltip": "Tiempo que tardas actualmente en crear, enviar y archivar cada factura. Incluye gestión administrativa."
    }
  ],
  "outputs": [
    {
      "id": "coste_implementacion_total",
      "label": "Coste Total de Implementación",
      "unit": "€"
    },
    {
      "id": "coste_anual_operativo",
      "label": "Coste Operativo Anual",
      "unit": "€"
    },
    {
      "id": "ahorro_anual_estimado",
      "label": "Ahorro Anual Estimado",
      "unit": "€"
    },
    {
      "id": "roi_meses",
      "label": "Retorno de la Inversión (ROI)",
      "unit": "meses"
    },
    {
      "id": "subvencion_kit_digital",
      "label": "Subvención Kit Digital Disponible",
      "unit": "€"
    },
    {
      "id": "coste_neto_implementacion",
      "label": "Coste Neto (tras subvención)",
      "unit": "€"
    },
    {
      "id": "cumplimiento_normativo",
      "label": "Fecha Límite de Cumplimiento",
      "unit": "fecha"
    },
    {
      "id": "ahorro_tiempo_mensual",
      "label": "Ahorro de Tiempo Mensual",
      "unit": "horas"
    }
  ],
  "content": "### Introducción\n\nLa facturación electrónica será **obligatoria en España entre 2026 y 2027** para todas las empresas y autónomos, según la Ley Crea y Crece y el reglamento VERIFACTU. Este cambio normativo representa una oportunidad única para digitalizar tu negocio, reducir costes operativos y mejorar la eficiencia.\n\nNuestra **Calculadora de Costes de Implementación de Facturación Electrónica** es la primera herramienta específica del mercado español que te permite:\n\n* **Calcular el coste total real** de implementar la facturación electrónica\n* **Estimar el ROI** y tiempo de recuperación de la inversión  \n* **Conocer las subvenciones disponibles** (Kit Digital hasta €12,000)\n* **Planificar la transición** antes de las fechas límite obligatorias\n* **Comparar diferentes opciones** de software y servicios\n\nA diferencia de las calculadoras genéricas de IVA o procesamiento de facturas, nuestra herramienta considera **todos los costes reales**: software, implementación, formación, integración, hardware y mantenimiento, así como los **beneficios específicos** de cada tipo de negocio.\n\n### Guía de Uso del Calculador\n\n**Datos del Negocio:**\n\n* **Tipo de Negocio**: Selecciona entre Autónomo, MicroPYME, PYME Pequeña o Mediana. Esto determina las ayudas disponibles y complejidad de implementación.\n* **Facturación Anual**: Ingresos totales anuales. Empresas con >€8M tienen plazos diferentes y >€85,000 están obligadas (salvo excepciones).\n* **Volumen de Facturas**: Número de facturas emitidas y recibidas mensualmente. Afecta directamente al coste del software.\n\n**Situación Actual:**\n\n* **Software Actual**: Si ya tienes software de facturación, los costes de migración serán menores.\n* **Nivel de Digitalización**: Determina la complejidad y coste del cambio. Negocios más digitalizados requieren menor inversión.\n* **Tiempo por Factura**: Tu tiempo actual de procesamiento manual para calcular el ahorro en productividad.\n\n**Necesidades Adicionales:**\n\n* **Integración ERP**: Conexión con sistemas de contabilidad o gestión empresarial (recomendable para >50 facturas/mes).\n* **Formación**: Capacitación del equipo para maximizar los beneficios de la digitalización.\n* **Kit Digital**: Subvenciones gubernamentales disponibles hasta octubre 2025 (¡actúa rápido!).\n\n### Metodología de Cálculo Explicada\n\nNuestra calculadora utiliza **datos reales del mercado español** y metodología transparente basada en:\n\n**Análisis de Costes Directos:**\n\n* **Software de Facturación**: €6-50/mes según volumen y funcionalidades\n* **Implementación e Instalación**: €200-2,000 según complejidad\n* **Formación del Personal**: €100-500 por persona\n* **Hardware Adicional**: €0-1,000 (tablets, lectores, equipos)\n\n**Cálculo de Subvenciones:**\n\n* **Kit Digital Segmento I** (10-49 empleados): hasta €12,000\n* **Kit Digital Segmento II** (3-9 empleados): hasta €6,000  \n* **Kit Digital Segmento III** (0-2 empleados): hasta €2,000\n\n**Estimación de Ahorros:**\n\n* **Reducción de Tiempo**: 50-80% menos tiempo por factura\n* **Ahorro en Papel y Envíos**: €0.50-2.00 por factura\n* **Reducción de Errores**: Hasta 90% menos errores administrativos\n* **Mejora en Cobros**: Reducción de morosidad del 15-30%\n\n**Fórmula ROI:**\n```\nROI (meses) = Coste Neto Implementación / (Ahorro Mensual)\nCoste Neto = Coste Total - Subvenciones Kit Digital\nAhorro Mensual = (Reducción Tiempo × Coste/Hora) + Ahorro Operativo\n```\n\n### Análisis Profundo: Facturación Electrónica Obligatoria en España\n\n**Cronología Normativa Definitiva:**\n\n* **Julio 2025**: Los fabricantes de software deben certificar sus programas con VERIFACTU\n* **Enero 2026**: Empresas (personas jurídicas) deben usar software certificado\n* **Julio 2026**: Autónomos deben usar software certificado  \n* **2026-2027**: Implementación completa del intercambio electrónico B2B\n\n**¿Quién Está Obligado?**\n\n✅ **OBLIGADOS:**\n* Empresas con facturación >€8M (desde 2023)\n* Todas las empresas y autónomos (desde 2026-2027)\n* Operaciones B2B superiores a €400\n\n❌ **EXENTOS:**\n* Autónomos con facturación <€85,000/año (en ciertos casos)\n* Régimen de módulos (con limitaciones)\n* Facturas a consumidores finales <€400\n* Operaciones internacionales\n\n**Beneficios Estratégicos Únicos:**\n\n1. **Ventaja Competitiva**: Ser early adopter te posiciona mejor ante clientes\n2. **Acceso a Financiación**: Bancos valoran positivamente la digitalización\n3. **Reducción de Morosidad**: Control automático de pagos y seguimiento\n4. **Escalabilidad**: Crecimiento sin aumentar costes administrativos proporcionalmente\n5. **Compliance Automático**: Cumplimiento normativo sin esfuerzo adicional\n\n**Errores Comunes a Evitar:**\n\n* **Esperar hasta el último momento**: Las mejores subvenciones y precios están disponibles ahora\n* **Elegir solo por precio**: El software más barato puede costar más a largo plazo\n* **No considerar la integración**: Sistemas aislados crean más trabajo\n* **Subestimar la formación**: El factor humano es clave para el éxito\n\n**Sectores con Mayor Impacto:**\n\n* **Construcción e Inmobiliario**: Facturas complejas con múltiples partidas\n* **Consultoría y Servicios Profesionales**: Alto volumen de facturas B2B\n* **Comercio B2B**: Intercambio intensivo entre empresas\n* **Industria Manufacturera**: Cadenas de suministro complejas\n\n### Preguntas Frecuentes (FAQ)\n\n**¿Cuándo debo implementar la facturación electrónica?**\n\n**¡AHORA ES EL MEJOR MOMENTO!** Las razones son claras: (1) Tienes acceso al Kit Digital hasta octubre 2025, (2) Los precios de implementación están en mínimos históricos por la demanda anticipada, (3) Tu competencia aún no se ha movido, y (4) Tienes tiempo suficiente para una transición sin estrés.\n\n**¿Qué pasa si no cumplo con la obligación?**\n\nLas sanciones van desde €150 hasta €6,000 por infracción, pero el verdadero coste es la pérdida de eficiencia operativa. Además, muchos clientes grandes ya exigen facturación electrónica para trabajar con proveedores.\n\n**¿El Kit Digital cubre todos los costes?**\n\nEn la mayoría de casos SÍ. Para autónomos (hasta €2,000) y microPYMEs (hasta €6,000), el Kit Digital suele cubrir el 100% de los costes de implementación. Para PYME mayores, cubre entre el 50-80% del coste total.\n\n**¿Puedo usar el sistema gratuito VERIFACTU de Hacienda?**\n\nVERIFACTU permite emitir hasta 100 facturas anuales gratuitamente. Es perfecto para autónomos con muy poco volumen, pero si emites más de 8-10 facturas al mes, necesitarás un software privado más robusto.\n\n**¿La implementación es complicada?**\n\nCon la herramienta adecuada y planificación, NO. Los software modernos se configuran en 1-2 días y la migración de datos es automática. La clave es elegir un proveedor con buen soporte técnico y formación incluida."
};

const CalculadoraFacturaElectronica: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    tipo_negocio: 'autonomo',
    facturacion_anual: 50000,
    facturas_mensuales: 25,
    facturas_recibidas_mensuales: 15,
    tiene_software_actual: false,
    nivel_digitalizacion: 'basico',
    necesita_integracion_erp: false,
    requiere_formacion: true,
    elegible_kit_digital: true,
    tiempo_procesamiento_actual: 12
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
      tipo_negocio, facturacion_anual, facturas_mensuales, facturas_recibidas_mensuales,
      tiene_software_actual, nivel_digitalizacion, necesita_integracion_erp,
      requiere_formacion, elegible_kit_digital, tiempo_procesamiento_actual
    } = states;

    // Calcular coste del software mensual
    let coste_software_mensual = 0;
    const total_facturas = facturas_mensuales + facturas_recibidas_mensuales;
    
    if (total_facturas <= 10) coste_software_mensual = 8;
    else if (total_facturas <= 50) coste_software_mensual = 15;
    else if (total_facturas <= 200) coste_software_mensual = 30;
    else coste_software_mensual = 50;

    // Ajuste por tipo de negocio
    const multiplicador_tipo = {
      'autonomo': 0.8,
      'micropyme': 1.0,
      'pyme_pequena': 1.3,
      'pyme_mediana': 1.8
    };
    coste_software_mensual *= multiplicador_tipo[tipo_negocio as keyof typeof multiplicador_tipo] || 1;

    // Coste de implementación
    let coste_implementacion = 300;
    
    if (!tiene_software_actual) coste_implementacion += 200;
    if (nivel_digitalizacion === 'basico') coste_implementacion += 300;
    else if (nivel_digitalizacion === 'intermedio') coste_implementacion += 150;
    
    if (necesita_integracion_erp) coste_implementacion += 800;
    if (requiere_formacion) {
      const num_empleados = {
        'autonomo': 1,
        'micropyme': 3,
        'pyme_pequena': 8,
        'pyme_mediana': 15
      };
      coste_implementacion += (num_empleados[tipo_negocio as keyof typeof num_empleados] || 1) * 150;
    }

    // Coste hardware (si es muy básico)
    let coste_hardware = 0;
    if (nivel_digitalizacion === 'basico' && facturas_mensuales > 20) {
      coste_hardware = 400;
    }

    const coste_implementacion_total = coste_implementacion + coste_hardware;
    const coste_anual_operativo = coste_software_mensual * 12;

    // Subvención Kit Digital
    let subvencion_kit_digital = 0;
    if (elegible_kit_digital) {
      const kit_digital_montos = {
        'autonomo': 2000,
        'micropyme': 6000,
        'pyme_pequena': 12000,
        'pyme_mediana': 12000
      };
      subvencion_kit_digital = kit_digital_montos[tipo_negocio as keyof typeof kit_digital_montos] || 0;
    }

    // Ahorros anuales
    const ahorro_tiempo_por_factura = tiempo_procesamiento_actual * 0.6; // 60% reducción
    const coste_hora = 25; // €25/hora promedio
    const ahorro_tiempo_mensual = (facturas_mensuales * ahorro_tiempo_por_factura) / 60;
    const ahorro_tiempo_anual = ahorro_tiempo_mensual * 12 * coste_hora;
    
    const ahorro_papel_envios = (facturas_mensuales * 1.2 * 12); // €1.20 por factura
    const ahorro_errores = facturacion_anual * 0.02; // 2% reducción errores
    const ahorro_morosidad = facturacion_anual * 0.05; // 5% mejora cobros
    
    const ahorro_anual_estimado = ahorro_tiempo_anual + ahorro_papel_envios + ahorro_errores + ahorro_morosidad;

    // ROI
    const coste_neto_implementacion = Math.max(0, coste_implementacion_total - subvencion_kit_digital);
    const ahorro_mensual = ahorro_anual_estimado / 12;
    const roi_meses = ahorro_mensual > 0 ? Math.ceil(coste_neto_implementacion / ahorro_mensual) : 999;

    // Fecha límite de cumplimiento
    let cumplimiento_normativo = "";
    if (facturacion_anual > 8000000) {
      cumplimiento_normativo = "Ya obligatorio desde 2023";
    } else if (tipo_negocio === 'autonomo') {
      cumplimiento_normativo = "Julio 2026";
    } else {
      cumplimiento_normativo = "Enero 2026";
    }

    return {
      coste_implementacion_total,
      coste_anual_operativo,
      ahorro_anual_estimado,
      roi_meses: Math.min(roi_meses, 999),
      subvencion_kit_digital,
      coste_neto_implementacion,
      cumplimiento_normativo,
      ahorro_tiempo_mensual: Math.round(ahorro_tiempo_mensual * 10) / 10,
      // Datos adicionales para gráficos
      coste_software_mensual,
      ahorro_tiempo_anual,
      ahorro_papel_envios,
      ahorro_errores,
      ahorro_morosidad
    };
  }, [states]);

  // Datos para gráficos
  const costesData = [
    { name: 'Implementación', coste: calculatedOutputs.coste_implementacion_total, color: '#dc2626' },
    { name: 'Operativo Anual', coste: calculatedOutputs.coste_anual_operativo, color: '#f97316' },
    { name: 'Kit Digital', coste: -calculatedOutputs.subvencion_kit_digital, color: '#059669' }
  ];

  const ahorrosData = [
    { name: 'Ahorro Tiempo', value: calculatedOutputs.ahorro_tiempo_anual, color: '#3b82f6' },
    { name: 'Papel/Envíos', value: calculatedOutputs.ahorro_papel_envios, color: '#10b981' },
    { name: 'Menos Errores', value: calculatedOutputs.ahorro_errores, color: '#f59e0b' },
    { name: 'Mejor Cobro', value: calculatedOutputs.ahorro_morosidad, color: '#8b5cf6' }
  ];

  const roiData = [
    { name: 'Año 1', inversion: -calculatedOutputs.coste_neto_implementacion, ahorro: calculatedOutputs.ahorro_anual_estimado },
    { name: 'Año 2', inversion: -calculatedOutputs.coste_anual_operativo, ahorro: calculatedOutputs.ahorro_anual_estimado },
    { name: 'Año 3', inversion: -calculatedOutputs.coste_anual_operativo, ahorro: calculatedOutputs.ahorro_anual_estimado }
  ];

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`${slug}.pdf`);
    } catch (_e) { 
      alert("Función PDF no disponible en este ambiente"); 
    }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const { coste_software_mensual, ahorro_tiempo_anual, ahorro_papel_envios, ahorro_errores, ahorro_morosidad, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      const newResults = [payload, ...existingResults].slice(0, 50);
      localStorage.setItem("calc_results", JSON.stringify(newResults));
      alert("Resultado guardado con éxito!");
    } catch { 
      alert("Imposible guardar el resultado."); 
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Math.abs(value));

  const getRoiColor = (meses: number) => {
    if (meses <= 6) return 'text-green-600 bg-green-50 border-green-500';
    if (meses <= 12) return 'text-yellow-600 bg-yellow-50 border-yellow-500';
    if (meses <= 24) return 'text-orange-600 bg-orange-50 border-orange-500';
    return 'text-red-600 bg-red-50 border-red-500';
  };

  const getRoiMessage = (meses: number) => {
    if (meses <= 6) return 'Excelente - Recuperación muy rápida';
    if (meses <= 12) return 'Bueno - Recuperación en menos de un año';
    if (meses <= 24) return 'Aceptable - Recuperación a medio plazo';
    return 'Revisar - Considera optimizar la implementación';
  };

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-6" ref={calculatorRef}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">
                Calcula los costes reales de implementar facturación electrónica. Incluye ROI, subvenciones Kit Digital y fechas límite normativas.
              </p>
              
              {/* Alerta de urgencia */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">¡Tiempo limitado para el Kit Digital!</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Las subvenciones del Kit Digital terminan en <strong>octubre 2025</strong>. La facturación electrónica será obligatoria en <strong>2026-2027</strong>. ¡Actúa ahora para conseguir implementación gratuita!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg mb-6">
                {inputs.map(input => {
                  const inputLabel = (
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                    </label>
                  );

                  if (input.type === 'boolean') {
                    return (
                      <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-white border">
                        <input
                          id={input.id}
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.checked)}
                        />
                        <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                          {input.label}
                          {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                        </label>
                      </div>
                    );
                  }

                  if (input.type === 'select') {
                    return (
                      <div key={input.id} className="md:col-span-2">
                        {inputLabel}
                        <select
                          id={input.id}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
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
                  
                  return (
                    <div key={input.id}>
                      {inputLabel}
                      <div className="flex items-center gap-2">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          type="number"
                          min={input.min}
                          step={input.step}
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))}
                        />
                        {input.unit && <span className="text-sm text-gray-500 min-w-max">{input.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resultados principales */}
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Resultados del Análisis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${getRoiColor(calculatedOutputs.roi_meses)}`}>
                    <div>
                      <div className="text-sm font-medium text-gray-700">ROI - Recuperación de Inversión</div>
                      <div className="text-xs text-gray-500 mt-1">{getRoiMessage(calculatedOutputs.roi_meses)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {isClient ? (calculatedOutputs.roi_meses > 999 ? '∞' : `${calculatedOutputs.roi_meses} meses`) : '...'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between border-l-4 p-4 rounded-r-lg bg-green-50 border-green-500">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Fecha Límite Cumplimiento</div>
                      <div className="text-xs text-gray-500 mt-1">Según normativa vigente</div>
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {calculatedOutputs.cumplimiento_normativo}
                    </div>
                  </div>
                </div>

                {outputs.filter(o => !['roi_meses', 'cumplimiento_normativo'].includes(o.id)).map(output => (
                  <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                    output.id === 'coste_neto_implementacion' ? 'bg-indigo-50 border-indigo-500' :
                    output.id === 'ahorro_anual_estimado' ? 'bg-green-50 border-green-500' :
                    output.id === 'subvencion_kit_digital' ? 'bg-purple-50 border-purple-500' :
                    'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${
                      output.id === 'coste_neto_implementacion' ? 'text-indigo-600' :
                      output.id === 'ahorro_anual_estimado' ? 'text-green-600' :
                      output.id === 'subvencion_kit_digital' ? 'text-purple-600' :
                      'text-gray-800'
                    }`}>
                      {isClient ? (
                        output.unit === '€' ? formatCurrency((calculatedOutputs as any)[output.id]) :
                        output.unit === 'horas' ? `${(calculatedOutputs as any)[output.id]} h` :
                        (calculatedOutputs as any)[output.id]
                      ) : '...'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráficos */}
              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-semibold text-gray-700">Análisis Visual</h3>
                
                {/* Gráfico de costes vs beneficios */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Costes de Implementación</h4>
                  <div className="h-64 w-full">
                    {isClient && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costesData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `€${Math.abs(value)}`} />
                          <ChartTooltip formatter={(value: number) => [formatCurrency(value), '']} />
                          <Bar dataKey="coste" fill="#dc2626">
                            {costesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Gráfico de ahorros */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Desglose de Ahorros Anuales</h4>
                  <div className="h-64 w-full">
                    {isClient && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ahorrosData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {ahorrosData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value: number) => [formatCurrency(value), '']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Proyección ROI 3 años */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Proyección ROI - 3 Años</h4>
                  <div className="h-64 w-full">
                    {isClient && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={roiData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `€${Math.abs(value)}`} />
                          <ChartTooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'inversion' ? 'Inversión' : 'Ahorro']} />
                          <Bar dataKey="inversion" fill="#dc2626" name="Inversión" />
                          <Bar dataKey="ahorro" fill="#059669" name="Ahorro" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Recomendaciones personalizadas */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">💡 Recomendaciones Personalizadas</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  {calculatedOutputs.roi_meses <= 12 && (
                    <p>• <strong>Excelente oportunidad:</strong> Tu ROI es muy favorable. Procede con la implementación cuanto antes.</p>
                  )}
                  {states.elegible_kit_digital && calculatedOutputs.subvencion_kit_digital > 0 && (
                    <p>• <strong>¡Urgente!</strong> Solicita el Kit Digital antes de octubre 2025 para obtener {formatCurrency(calculatedOutputs.subvencion_kit_digital)} de subvención.</p>
                  )}
                  {states.facturas_mensuales > 50 && !states.necesita_integracion_erp && (
                    <p>• <strong>Considera integración ERP:</strong> Con tu volumen de facturas, la integración reducirá errores significativamente.</p>
                  )}
                  {states.nivel_digitalizacion === 'basico' && states.facturas_mensuales > 20 && (
                    <p>• <strong>Prioriza la formación:</strong> Tu equipo necesitará capacitación para maximizar los beneficios.</p>
                  )}
                  {calculatedOutputs.ahorro_tiempo_mensual > 20 && (
                    <p>• <strong>Gran impacto en productividad:</strong> Ahorrarás {calculatedOutputs.ahorro_tiempo_mensual}h/mes, considera reinvertir este tiempo en crecimiento.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Metodología */}
          <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-700 mb-2">📊 Metodología de Cálculo</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Costes Software:</strong> €8-50/mes según volumen (0-10: €8, 11-50: €15, 51-200: €30, +200: €50)</p>
              <p><strong>Implementación:</strong> Base €300 + ajustes por migración, digitalización, ERP y formación</p>
              <p><strong>Kit Digital:</strong> Autónomos €2K, MicroPYME €6K, PYME €12K (hasta oct 2025)</p>
              <p><strong>Ahorros:</strong> 60% reducción tiempo + €1.20/factura papel + 2% menos errores + 5% mejor cobro</p>
              <p><strong>ROI:</strong> Coste neto ÷ ahorro mensual = meses recuperación</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">🛠️ Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={salvaRisultato}
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
              >
                💾 Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
              >
                📄 PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"
              >
                🔄 Reset
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">📚 Guía Completa</h2>
            <div className="prose prose-sm max-w-none text-gray-700 max-h-96 overflow-y-auto">
              <ContentRenderer content={content} />
            </div>
          </section>
          
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">🔗 Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2 text-xs">
              <li>
                <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2022-17655" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Ley 18/2022 Crea y Crece - Facturación electrónica obligatoria
                </a>
              </li>
              <li>
                <a href="https://www.hacienda.gob.es/es-ES/Areas%20Tematicas/Impuestos/VERIFACTU/Paginas/default.aspx" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Sistema VERIFACTU - Agencia Tributaria
                </a>
              </li>
              <li>
                <a href="https://www.acelerapyme.gob.es/kit-digital" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Kit Digital - Subvenciones para digitalización PYME
                </a>
              </li>
              <li>
                <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-21653" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Orden HAC/1177/2024 - Especificaciones técnicas software facturación
                </a>
              </li>
              <li>
                <a href="https://www.cnmc.es/facil-para-ti" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  CNMC - Herramientas para el consumidor
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraFacturaElectronica;