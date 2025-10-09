'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

export const meta = {
  title: "Calculadora de la Valoración de una Startup (método Venture Capital)",
  description: "Calcula la valoración pre-money y post-money de tu startup usando el método VC estándar de la industria. Incluye ajustes por dilución y análisis de TIR."
};

// Icona para los Tooltip (SVG inline para evitar dependencias)
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// Componente Tooltip
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// Componente de gráfico simple para barras
const SimpleBarChart = ({ data, formatCurrency }: { data: any[], formatCurrency: (n: number) => string }) => (
  <div className="space-y-2 p-4">
    {data.map((item, index) => (
      <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
        <span className="text-sm font-medium text-gray-700">{item.name}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 min-w-24 text-right">{formatCurrency(item.Valoración)}</span>
          <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(item.Valoración / Math.max(...data.map(d => d.Valoración))) * 100}%` }}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Componente de gráfico simple para torta
const SimplePieChart = ({ data, formatPercentage }: { data: any[], formatPercentage: (n: number) => string }) => (
  <div className="space-y-3 p-4">
    {data.map((item, index) => (
      <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: item.fill }}
          />
          <span className="text-sm font-medium text-gray-700">{item.name}</span>
        </div>
        <span className="text-lg font-bold text-gray-800">{formatPercentage(item.value)}</span>
      </div>
    ))}
  </div>
);

// Dati Strutturati per SEO (JSON-LD)
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
            "name": "¿Cómo afecta la dilución a mi valoración como fundador?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La dilución es inevitable pero gestionable. Cada ronda de financiación reduce tu porcentaje de propiedad, pero idealmente aumenta el valor absoluto de tu participación. Una dilución del 20-30% por ronda es normal si el valor de la empresa crece proporcionalmente más."
            }
          },
          {
            "@type": "Question", 
            "name": "¿Qué múltiplos de salida son realistas para mi industria?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Los múltiplos varían significativamente por sector y ciclo económico. Las empresas SaaS con crecimiento >100% anual pueden alcanzar múltiplos de 15-20x ingresos, mientras que e-commerce tradicional raramente supera 4-6x. Investiga exits recientes en tu sector para calibrar expectativas."
            }
          },
          {
            "@type": "Question",
            "name": "¿Cuándo es apropiado usar el método VC versus otros métodos de valoración?", 
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "El método VC es ideal para startups en etapas Seed, Serie A y Serie B con modelos de negocio escalables y horizontes de exit claros. Para empresas más maduras con flujos de caja positivos, considera métodos como DCF (flujos descontados) o valoración por múltiplos de empresas comparables."
            }
          },
          {
            "@type": "Question",
            "name": "¿Cómo negocio una valoración con inversores?",
            "acceptedAnswer": {
              "@type": "Answer", 
              "text": "La valoración es solo un componente de la negociación. Factores como términos de liquidación, derechos de veto, y composición del board pueden ser igual de importantes. Enfócate en encontrar inversores que aporten valor más allá del capital (smart money) y considera valoraciones múltiples según diferentes escenarios de desempeño."
            }
          },
          {
            "@type": "Question",
            "name": "¿Qué pasa si mi startup no logra el exit proyectado?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Las proyecciones son estimaciones, no garantías. Aproximadamente 90% de las startups no alcanzan los retornos proyectados inicialmente. Por eso los inversores VC diversifican en múltiples startups, esperando que las pocas exitosas compensen las que no lo logran. Como fundador, enfócate en construir un negocio sostenible independientemente de las proyecciones de exit."
            }
          }
        ]
      })
    }}
  />
);

// Componente para el rendering del contenido Markdown
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
        if (trimmedBlock.startsWith('**') && trimmedBlock.endsWith('**')) {
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('- **')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^- \*\*/g, '').replace(/\*\*/g, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
            </ul>
          );
        }
        if (trimmedBlock.match(/^\d\.\s\*\*/)) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s\*\*/g, '').replace(/\*\*/g, ''));
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

// Datos de configuración del calculador
const calculatorData = {
  "slug": "calculadora-valoracion-startup",
  "category": "finanzas-e-inversiones", 
  "title": "Calculadora de la Valoración de una Startup (método Venture Capital)",
  "lang": "es",
  "inputs": [
    {
      "id": "valor_terminal_estimado",
      "label": "Valor Terminal Estimado (Exit Value)",
      "type": "number" as const,
      "unit": "€",
      "min": 10000,
      "step": 100000,
      "tooltip": "Valor esperado de la startup en el momento de la salida (IPO, adquisición, etc.), típicamente en 5-7 años. Se calcula aplicando múltiplos de industria a los ingresos o EBITDA proyectados."
    },
    {
      "id": "inversion_requerida",
      "label": "Inversión Requerida",
      "type": "number" as const,
      "unit": "€",
      "min": 1000,
      "step": 10000,
      "tooltip": "Cantidad de capital que la startup necesita captar en esta ronda de financiación para alcanzar sus objetivos de crecimiento."
    },
    {
      "id": "roi_esperado",
      "label": "ROI Esperado por el Inversor",
      "type": "number" as const,
      "unit": "x",
      "min": 2,
      "max": 100,
      "step": 1,
      "tooltip": "Múltiplo de retorno que espera el inversor. Por ejemplo, 10x significa que espera recuperar 10 veces su inversión inicial. Típicamente entre 5x-20x para startups tempranas."
    },
    {
      "id": "anos_hasta_exit",
      "label": "Años hasta el Exit",
      "type": "number" as const,
      "unit": "años",
      "min": 3,
      "max": 15,
      "step": 1,
      "tooltip": "Tiempo estimado hasta que ocurra un evento de liquidez (venta de la empresa, IPO, etc.). Normalmente entre 5-7 años para startups tecnológicas."
    },
    {
      "id": "considerar_dilucion",
      "label": "¿Considerar dilución futura?",
      "type": "boolean" as const,
      "tooltip": "Si se activa, el cálculo incluirá el efecto de futuras rondas de inversión que diluirán la participación actual."
    },
    {
      "id": "dilucion_estimada",
      "label": "Dilución Futura Estimada",
      "type": "number" as const,
      "unit": "%",
      "min": 10,
      "max": 80,
      "step": 5,
      "condition": "considerar_dilucion == true",
      "tooltip": "Porcentaje de dilución esperada por futuras rondas de financiación. Una startup típica puede diluirse entre 20%-50% adicional antes del exit."
    },
    {
      "id": "multiple_revenue",
      "label": "Múltiplo de Ingresos para Exit",
      "type": "number" as const,
      "unit": "x",
      "min": 1,
      "max": 20,
      "step": 0.5,
      "tooltip": "Múltiplo de ingresos anuales usado para calcular el valor terminal. Varía por industria: SaaS (8-15x), E-commerce (2-6x), Fintech (5-12x)."
    },
    {
      "id": "ingresos_proyectados_exit",
      "label": "Ingresos Proyectados en el Exit",
      "type": "number" as const,
      "unit": "€",
      "min": 100000,
      "step": 50000,
      "tooltip": "Ingresos anuales proyectados para el año del exit. Se multiplica por el múltiplo de ingresos para obtener el valor terminal."
    }
  ],
  "outputs": [
    {
      "id": "valoracion_pre_money",
      "label": "Valoración Pre-Money", 
      "unit": "€"
    },
    {
      "id": "valoracion_post_money",
      "label": "Valoración Post-Money",
      "unit": "€"
    },
    {
      "id": "participacion_inversor",
      "label": "% Participación del Inversor",
      "unit": "%"
    },
    {
      "id": "tir_implicita",
      "label": "TIR Implícita",
      "unit": "%"
    },
    {
      "id": "valor_terminal_calculado",
      "label": "Valor Terminal (calculado por múltiplos)",
      "unit": "€"
    }
  ],
  "content": `### Introducción: ¿Qué es la Valoración de Startups por el Método Venture Capital?

La valoración de startups representa uno de los desafíos más complejos en el mundo de las inversiones, especialmente cuando se trata de empresas en etapas tempranas sin historial financiero extenso. El **Método Venture Capital (VC)**, desarrollado por el profesor Bill Sahlman de Harvard Business School en 1987, se ha convertido en la herramienta estándar para determinar el valor de startups de alto potencial.

Este calculadora está diseñada para emprendedores, inversores y asesores financieros que necesitan una estimación rápida y fundamentada de la valoración de una startup. A diferencia de los métodos tradicionales de valoración empresarial (como el descuento de flujos de caja), que resultan inadecuados para empresas sin flujos positivos, **el método VC se enfoca en las expectativas de retorno futuro y trabaja "hacia atrás" desde un escenario de salida proyectado.**

### Guía de Uso del Calculador: Parámetros Esenciales

Para obtener una valoración precisa, es fundamental comprender cada parámetro de entrada:

**Valor Terminal Estimado**: Representa el valor proyectado de la startup en el momento de la "salida" o exit (IPO, adquisición, fusión). Este es quizás el parámetro más crítico y debe basarse en análisis comparables de la industria. Para calcularlo correctamente, multiplique los ingresos proyectados por el múltiplo típico de su sector.

**Inversión Requerida**: La cantidad de capital que la startup necesita captar. Este monto debe estar justificado por un plan de negocio detallado que demuestre cómo se utilizarán los fondos para alcanzar los hitos de crecimiento.

**ROI Esperado**: El múltiplo de retorno que espera el inversor. Este varía significativamente según la etapa: Seed (15-25x), Serie A (8-15x), Serie B (5-10x). Un ROI alto refleja tanto el riesgo elevado como las expectativas de crecimiento exponencial típicas del ecosistema startup.

**Años hasta el Exit**: El horizonte temporal hasta la salida. La mayoría de fondos VC planifican salidas entre 5-7 años, aunque esto puede variar por industria y condiciones de mercado.

**Consideración de Dilución**: Factor crítico a menudo ignorado en calculaciones simplificadas. Las startups típicamente requieren múltiples rondas de financiación, cada una diluyendo las participaciones existentes. Una estimación conservadora es del 20-40% de dilución adicional antes del exit.

### Metodología de Cálculo: La Ciencia detrás de los Números

**Paso 1: Estimación del Valor Terminal**
El valor terminal se calcula mediante múltiplos de industria aplicados a métricas financieras proyectadas:
- **SaaS/Software**: 8-15x ingresos recurrentes (ARR)
- **E-commerce**: 2-6x ingresos anuales
- **Fintech**: 5-12x ingresos
- **Biotech**: Basado en valor presente neto de pipeline de productos

**Paso 2: Aplicación del ROI Esperado**
La valoración post-money se obtiene dividiendo el valor terminal entre el múltiplo de retorno esperado:

Valoración Post-Money = Valor Terminal ÷ ROI Esperado

Este cálculo refleja el valor presente de los flujos futuros, descontado por el alto riesgo inherente a las startups.

**Paso 3: Ajuste por Dilución Futura**
Si se considera dilución, la fórmula se ajusta:

Valoración Ajustada = Valoración Post-Money ÷ (1 + % Dilución Esperada)

**Paso 4: Cálculo de la Valoración Pre-Money**
Finalmente:

Valoración Pre-Money = Valoración Post-Money - Inversión Requerida

### Análisis Profundo: Factores que Determinan una Valoración Exitosa

**Múltiplos de Industria: La Base de la Valoración**
Los múltiplos no son arbitrarios; reflejan las características fundamentales de cada sector:

- **Recurring Revenue Models (SaaS)**: Comandean múltiplos altos por la predictibilidad de ingresos
- **Marketplace Models**: Valorados por la escalabilidad de efectos de red
- **Deep Tech**: Múltiplos basados en potencial de mercado total direccionable (TAM)

**Factores de Riesgo que Afectan el ROI Esperado**:

1. **Riesgo Tecnológico**: ¿Está probada la tecnología?
2. **Riesgo de Mercado**: ¿Existe demanda validada?
3. **Riesgo de Equipo**: ¿Tiene el equipo fundador experiencia relevante?
4. **Riesgo Competitivo**: ¿Qué tan defendible es la posición?
5. **Riesgo de Escalabilidad**: ¿Puede crecer sin incrementos proporcionales de costos?

**El Timing del Exit: Factor Crítico**
El momento de salida afecta dramáticamente la valoración:
- **Exits tempranos (3-4 años)**: Requieren crecimiento muy acelerado
- **Exits estándar (5-7 años)**: Permiten consolidación y optimización
- **Exits tardíos (8+ años)**: Pueden indicar dificultades para encontrar comprador

**Comparación Internacional de Métodos de Valoración**
Mientras que el método VC domina en Silicon Valley, otros ecosistemas emplean enfoques complementarios:
- **Europa**: Mayor énfasis en múltiplos de EBITDA
- **Asia**: Consideración de factores regulatorios locales
- **Mercados emergentes**: Descuentos por riesgo país

### Preguntas Frequentes (FAQ)

**¿Cómo afecta la dilución a mi valoración como fundador?**
La dilución es inevitable pero gestionable. Cada ronda de financiación reduce tu porcentaje de propiedad, pero idealmente aumenta el valor absoluto de tu participación. Una dilución del 20-30% por ronda es normal si el valor de la empresa crece proporcionalmente más.

**¿Qué múltiplos de salida son realistas para mi industria?**
Los múltiplos varían significativamente por sector y ciclo económico. Las empresas SaaS con crecimiento >100% anual pueden alcanzar múltiplos de 15-20x ingresos, mientras que e-commerce tradicional raramente supera 4-6x. Investiga exits recientes en tu sector para calibrar expectativas.

**¿Cuándo es apropiado usar el método VC versus otros métodos de valoración?**
El método VC es ideal para startups en etapas Seed, Serie A y Serie B con modelos de negocio escalables y horizontes de exit claros. Para empresas más maduras con flujos de caja positivos, considera métodos como DCF (flujos descontados) o valoración por múltiplos de empresas comparables.

**¿Cómo negocio una valoración con inversores?**
La valoración es solo un componente de la negociación. Factores como términos de liquidación, derechos de veto, y composición del board pueden ser igual de importantes. Enfócate en encontrar inversores que aporten valor más allá del capital ("smart money") y considera valoraciones múltiples según diferentes escenarios de desempeño.

**¿Qué pasa si mi startup no logra el exit proyectado?**
Las proyecciones son estimaciones, no garantías. Aproximadamente 90% de las startups no alcanzan los retornos proyectados inicialmente. Por eso los inversores VC diversifican en múltiples startups, esperando que las pocas exitosas compensen las que no lo logran. Como fundador, enfócate en construir un negocio sostenible independientemente de las proyecciones de exit.`
};

const CalculadoraValoracionStartup: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { 
    setIsClient(true); 
  }, []);

  const initialStates = {
    valor_terminal_estimado: 20000000,
    inversion_requerida: 1000000,
    roi_esperado: 10,
    anos_hasta_exit: 5,
    considerar_dilucion: true,
    dilucion_estimada: 30,
    multiple_revenue: 8,
    ingresos_proyectados_exit: 2500000
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
      valor_terminal_estimado,
      inversion_requerida,
      roi_esperado,
      anos_hasta_exit,
      considerar_dilucion,
      dilucion_estimada,
      multiple_revenue,
      ingresos_proyectados_exit
    } = states;

    // Calcular valor terminal usando múltiplos si están disponibles
    const valor_terminal_calculado = ingresos_proyectados_exit && multiple_revenue 
      ? ingresos_proyectados_exit * multiple_revenue 
      : valor_terminal_estimado;

    // Valoración post-money básica
    let valoracion_post_money = valor_terminal_calculado / roi_esperado;

    // Ajuste por dilución si está habilitado
    if (considerar_dilucion && dilucion_estimada > 0) {
      valoracion_post_money = valoracion_post_money / (1 + dilucion_estimada / 100);
    }

    // Valoración pre-money
    const valoracion_pre_money = Math.max(0, valoracion_post_money - inversion_requerida);

    // Participación del inversor
    const participacion_inversor = valoracion_post_money > 0 ? (inversion_requerida / valoracion_post_money) * 100 : 0;

    // TIR implícita
    const tir_implicita = anos_hasta_exit > 0 && inversion_requerida > 0 
      ? (Math.pow(valor_terminal_calculado * (participacion_inversor / 100) / inversion_requerida, 1 / anos_hasta_exit) - 1) * 100
      : 0;

    return {
      valoracion_pre_money,
      valoracion_post_money,
      participacion_inversor,
      tir_implicita,
      valor_terminal_calculado
    };
  }, [states]);

  const chartData = [
    { name: 'Pre-Money', Valoración: calculatedOutputs.valoracion_pre_money },
    { name: 'Inversión', Valoración: states.inversion_requerida },
    { name: 'Post-Money', Valoración: calculatedOutputs.valoracion_post_money },
    { name: 'Valor Terminal', Valoración: calculatedOutputs.valor_terminal_calculado },
  ];

  const pieData = [
    { name: 'Fundadores', value: 100 - calculatedOutputs.participacion_inversor, fill: '#3b82f6' },
    { name: 'Inversor', value: calculatedOutputs.participacion_inversor, fill: '#ef4444' }
  ];

  const formulaUsada = `
    1. Valor Terminal = Ingresos Proyectados × Múltiplo (o valor directo)
    2. Valoración Post-Money = Valor Terminal ÷ ROI Esperado
    3. Ajuste por Dilución = Valoración ÷ (1 + % Dilución) [si aplica]
    4. Valoración Pre-Money = Valoración Post-Money - Inversión
    5. % Participación = (Inversión ÷ Valoración Post-Money) × 100
    6. TIR = (Retorno Final ÷ Inversión)^(1/años) - 1
  `;

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calcolatoreRef.current) return;
      const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
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
      const payload = { 
        slug, 
        title, 
        inputs: states, 
        outputs: calculatedOutputs, 
        ts: Date.now() 
      };
      const existing = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existing].slice(0, 50)));
      alert("¡Resultado guardado con éxito!");
    } catch { 
      alert("Imposible guardar el resultado."); 
    }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-6" ref={calcolatoreRef}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">{meta.description}</p>
              
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                <strong>Disclaimer:</strong> Esta herramienta proporciona estimaciones orientativas basadas en el método VC estándar. La valoración real puede variar según múltiples factores cualitativos y condiciones de mercado específicas.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => {
                  const conditionMet = !input.condition || 
                    (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                  if (!conditionMet) return null;

                  const inputLabel = (
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && (
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2"><InfoIcon /></span>
                        </Tooltip>
                      )}
                    </label>
                  );

                  if (input.type === 'boolean') {
                    return (
                      <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                        <input 
                          id={input.id} 
                          type="checkbox" 
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                          checked={states[input.id]} 
                          onChange={(e) => handleStateChange(input.id, e.target.checked)} 
                        />
                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>
                          {input.label}
                        </label>
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
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados de la Valoración</h2>
                {outputs.map(output => (
                  <div 
                    key={output.id} 
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                      output.id === 'valoracion_pre_money' ? 'bg-indigo-50 border-indigo-500' : 
                      output.id === 'valoracion_post_money' ? 'bg-green-50 border-green-500' :
                      output.id === 'participacion_inversor' ? 'bg-red-50 border-red-500' :
                      'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${
                      output.id === 'valoracion_pre_money' ? 'text-indigo-600' :
                      output.id === 'valoracion_post_money' ? 'text-green-600' :
                      output.id === 'participacion_inversor' ? 'text-red-600' :
                      'text-gray-800'
                    }`}>
                      {isClient ? (
                        output.unit === '€' ? 
                          formatCurrency((calculatedOutputs as any)[output.id]) :
                        output.unit === '%' ? 
                          formatPercentage((calculatedOutputs as any)[output.id]) :
                          `${((calculatedOutputs as any)[output.id]).toFixed(1)}${output.unit}`
                      ) : '...'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparación de Valoraciones</h3>
                  <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                    {isClient ? (
                      <SimpleBarChart 
                        data={chartData}
                        formatCurrency={formatCurrency}
                      />
                    ) : (
                      <div className="h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-500">
                        Cargando gráfico...
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Distribución de Participación</h3>
                  <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                    {isClient ? (
                      <SimplePieChart
                        data={pieData}
                        formatPercentage={formatPercentage}
                      />
                    ) : (
                      <div className="h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-500">
                        Cargando gráfico...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-700">Metodología de Cálculo Utilizada</h3>
            <pre className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono overflow-x-auto whitespace-pre-wrap">
              {formulaUsada}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              Nota: Esta implementación sigue el método VC estándar desarrollado por Bill Sahlman (Harvard Business School, 1987) 
              con ajustes contemporáneos para dilución futura.
            </p>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={salvaRisultato} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button 
                onClick={handleExportPDF} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar PDF
              </button>
              <button 
                onClick={handleReset} 
                className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reiniciar
              </button>
            </div>
          </section>
          
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía Completa de Valoración</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ContentRenderer content={content} />
            </div>
          </section>
          
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Referencias y Fuentes Académicas</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a 
                  href="https://hbr.org/product/method-for-valuing-high-risk-long-term-investments-the-venture-capital-method/288006-PDF-ENG" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 hover:underline"
                >
                  Sahlman, W.A. (1987). "Method for Valuing High-Risk Long-Term Investments" - Harvard Business School
                </a>
              </li>
              <li>
                <a 
                  href="https://nvca.org/research/nvca-yearbook/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 hover:underline"
                >
                  National Venture Capital Association Yearbook
                </a> - Datos estadísticos de la industria VC
              </li>
              <li>
                <a 
                  href="https://pitchbook.com/news/reports/q4-2024-pitchbook-nvca-venture-monitor" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 hover:underline"
                >
                  PitchBook-NVCA Venture Monitor
                </a> - Análisis trimestral de tendencias de valoración
              </li>
              <li>
                <a 
                  href="https://site.warrington.ufl.edu/ritter/files/IPO-Statistics.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 hover:underline"
                >
                  Prof. Jay Ritter's IPO Data (University of Florida)
                </a> - Estadísticas históricas de salidas públicas
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraValoracionStartup;