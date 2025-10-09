'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

export const meta = {
  title: "Calculadora de IRPF por Comunidad Autónoma",
  description: "Calcula tu IRPF según tu comunidad de residencia. Compara tramos estatales y autonómicos para optimizar tu tributación."
};

// --- Componente de gráfico con carga dinámica ---
const ChartComponent = dynamic(() => import('recharts').then(mod => {
  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = mod;
  return {
    default: ({ data }: { data: any[] }) => (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
          <YAxis tickFormatter={(value) => `€${Math.abs(value / 1000)}k`} />
          <Tooltip formatter={(value: number) => [new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Math.abs(value)), '']} />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  };
}), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Cargando gráfico...</div>
});

// --- Icona informativa ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
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

// --- Componente para inyección de schema SEO ---
const SchemaInjector = ({ schemaData }: { schemaData: any }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [schemaData]);
  
  return null;
};

// --- Componente para renderizado de contenido Markdown ---
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
        if (trimmedBlock.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-8 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^# /, '')) }} />;
        }
        if (trimmedBlock.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^## /, '')) }} />;
        }
        if (trimmedBlock.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^### /, '')) }} />;
        }
        if (trimmedBlock.startsWith('- ')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^- /, ''));
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
            </ul>
          );
        }
        if (trimmedBlock.match(/^\d\. /)) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\. /, ''));
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

// --- Datos de configuración del calculador ---
const calculatorData = {
  "slug": "calculadora-irpf-comunidad-autonoma",
  "category": "impuestos-y-trabajo-autonomo",
  "title": "Calculadora de IRPF por Comunidad Autónoma",
  "lang": "es",
  "inputs": [
    {
      "id": "ingresos_anuales_brutos",
      "label": "Ingresos anuales brutos",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 100,
      "tooltip": "Introduce tus ingresos brutos anuales antes de deducciones (salario, pensión, actividades económicas, etc.)"
    },
    {
      "id": "comunidad_autonoma",
      "label": "Comunidad Autónoma de residencia",
      "type": "select" as const,
      "options": [
        { "value": "madrid", "label": "Madrid" },
        { "value": "andalucia", "label": "Andalucía" },
        { "value": "catalunya", "label": "Cataluña" },
        { "value": "valencia", "label": "Comunidad Valenciana" },
        { "value": "galicia", "label": "Galicia" },
        { "value": "aragon", "label": "Aragón" },
        { "value": "asturias", "label": "Principado de Asturias" },
        { "value": "baleares", "label": "Islas Baleares" },
        { "value": "canarias", "label": "Canarias" },
        { "value": "cantabria", "label": "Cantabria" },
        { "value": "castilla_la_mancha", "label": "Castilla-La Mancha" },
        { "value": "castilla_leon", "label": "Castilla y León" },
        { "value": "extremadura", "label": "Extremadura" },
        { "value": "murcia", "label": "Región de Murcia" },
        { "value": "la_rioja", "label": "La Rioja" }
      ],
      "tooltip": "Selecciona tu comunidad autónoma de residencia fiscal para aplicar los tramos autonómicos correspondientes"
    },
    {
      "id": "edad_contribuyente",
      "label": "Edad del contribuyente",
      "type": "number" as const,
      "unit": "años",
      "min": 16,
      "max": 120,
      "step": 1,
      "tooltip": "La edad afecta al mínimo personal: +1.150€ si tienes más de 65 años, +1.400€ adicionales si tienes más de 75 años"
    },
    {
      "id": "hijos_cargo",
      "label": "Número de hijos a cargo",
      "type": "number" as const,
      "min": 0,
      "max": 10,
      "step": 1,
      "tooltip": "Hijos menores de 25 años o con discapacidad que convivan contigo y no tengan ingresos superiores a 1.800€ anuales"
    },
    {
      "id": "hijos_menores_3",
      "label": "Hijos menores de 3 años",
      "type": "number" as const,
      "min": 0,
      "max": 10,
      "step": 1,
      "condition": "hijos_cargo > 0",
      "tooltip": "Los hijos menores de 3 años tienen un mínimo adicional de 2.800€ anuales"
    },
    {
      "id": "discapacidad_contribuyente",
      "label": "¿Tienes discapacidad?",
      "type": "boolean" as const,
      "tooltip": "Si tienes discapacidad del 33% al 65%: +3.000€. Si es superior al 65%: +9.000€ adicionales"
    },
    {
      "id": "grado_discapacidad",
      "label": "Grado de discapacidad",
      "type": "select" as const,
      "options": [
        { "value": "33_65", "label": "Del 33% al 65%" },
        { "value": "mas_65", "label": "Superior al 65%" }
      ],
      "condition": "discapacidad_contribuyente == true",
      "tooltip": "El grado de discapacidad determina el importe del mínimo adicional aplicable"
    },
    {
      "id": "cotizaciones_seguridad_social",
      "label": "Cotizaciones a la Seguridad Social",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 10,
      "tooltip": "Importe anual de las cotizaciones a la Seguridad Social (deducibles al 100%)"
    },
    {
      "id": "aportaciones_planes_pensiones",
      "label": "Aportaciones a planes de pensiones",
      "type": "number" as const,
      "unit": "€",
      "min": 0,
      "step": 100,
      "tooltip": "Aportaciones anuales a planes de pensiones (máximo deducible: 1.500€ para menores de 50 años, 8.500€ para mayores de 50)"
    }
  ],
  "outputs": [
    {
      "id": "base_imponible",
      "label": "Base imponible",
      "unit": "€"
    },
    {
      "id": "base_liquidable",
      "label": "Base liquidable (tras reducciones)",
      "unit": "€"
    },
    {
      "id": "cuota_estatal",
      "label": "Cuota estatal",
      "unit": "€"
    },
    {
      "id": "cuota_autonomica",
      "label": "Cuota autonómica",
      "unit": "€"
    },
    {
      "id": "cuota_total",
      "label": "Cuota total IRPF",
      "unit": "€"
    },
    {
      "id": "tipo_efectivo",
      "label": "Tipo efectivo",
      "unit": "%"
    },
    {
      "id": "tipo_marginal",
      "label": "Tipo marginal",
      "unit": "%"
    }
  ],
  "content": `# Calculadora de IRPF por Comunidad Autónoma 2025

**Calcula tu Impuesto sobre la Renta de las Personas Físicas según tu comunidad de residencia**

El Impuesto sobre la Renta de las Personas Físicas (IRPF) es un tributo personal y progresivo que grava los ingresos de las personas residentes en España. Una característica fundamental de este impuesto es que está parcialmente cedido a las comunidades autónomas, lo que significa que cada autonomía puede establecer sus propios tipos impositivos autonómicos, creando importantes diferencias fiscales entre territorios.

## ¿Cómo Funciona el IRPF en España?

### Estructura Dual del Impuesto

El IRPF se compone de dos partes:

1. **Tramo Estatal**: Igual para todo el territorio español
2. **Tramo Autonómico**: Variable según la comunidad autónoma de residencia

Los tramos estatales para 2025 son: hasta 12.450€ (19%), de 12.450€ a 20.200€ (24%), de 20.200€ a 35.200€ (30%), de 35.200€ a 60.000€ (37%), de 60.000€ a 300.000€ (45%) y más de 300.000€ (47%).

### Diferencias Entre Comunidades Autónomas

Las diferencias fiscales entre comunidades son significativas. Madrid presenta el tipo máximo más reducido (45%), mientras que Valencia y Cataluña pueden llegar hasta el 54% para las rentas más altas. Esto puede suponer diferencias de miles de euros anuales para contribuyentes con ingresos similares.

## El Mínimo Personal y Familiar

El mínimo personal y familiar cuantifica aquella parte de la renta que, por destinarse a satisfacer las necesidades básicas personales y familiares del contribuyente, no se somete a tributación. En 2025 el mínimo personal base es de 5.550 euros.

## Cómo Utilizar Esta Calculadora

Esta herramienta te permite comparar el impacto fiscal entre diferentes comunidades autónomas, calcular tu cuota exacta según tu situación personal y familiar, y planificar estrategias fiscales legales para optimizar tu tributación.`,
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cómo varía el IRPF según la comunidad autónoma?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El IRPF se compone de un tramo estatal (igual para toda España) y un tramo autonómico que varía según la comunidad. Madrid tiene los tipos más bajos (máximo 45%), mientras que Valencia y Cataluña pueden llegar al 54% para rentas altas."
        }
      }
    ]
  }
};

// --- Tramos fiscales ---
const tramosEstatales = [
  { hasta: 12450, tipo: 9.5 },
  { hasta: 20200, tipo: 12 },
  { hasta: 35200, tipo: 15 },
  { hasta: 60000, tipo: 18.5 },
  { hasta: 300000, tipo: 22.5 },
  { hasta: Infinity, tipo: 23.5 }
];

const tramosAutonomicos: { [key: string]: Array<{ hasta: number, tipo: number }> } = {
  madrid: [
    { hasta: 12450, tipo: 9 },
    { hasta: 17707, tipo: 11 },
    { hasta: 33007, tipo: 15 },
    { hasta: 53407, tipo: 18.5 },
    { hasta: 120000, tipo: 22.5 },
    { hasta: Infinity, tipo: 21 }
  ],
  andalucia: [
    { hasta: 12450, tipo: 9.5 },
    { hasta: 20200, tipo: 12 },
    { hasta: 35200, tipo: 15 },
    { hasta: 60000, tipo: 18.5 },
    { hasta: Infinity, tipo: 22.5 }
  ],
  catalunya: [
    { hasta: 12450, tipo: 10.5 },
    { hasta: 17707, tipo: 12 },
    { hasta: 33007, tipo: 16 },
    { hasta: 53407, tipo: 21.5 },
    { hasta: 120000, tipo: 25.5 },
    { hasta: 175000, tipo: 25.5 },
    { hasta: 300000, tipo: 25.5 },
    { hasta: Infinity, tipo: 25.5 }
  ],
  valencia: [
    { hasta: 12450, tipo: 9 },
    { hasta: 17707, tipo: 11 },
    { hasta: 33007, tipo: 15 },
    { hasta: 53407, tipo: 19.5 },
    { hasta: 120000, tipo: 24.5 },
    { hasta: 175000, tipo: 25.5 },
    { hasta: 300000, tipo: 27.5 },
    { hasta: Infinity, tipo: 29.5 }
  ],
  galicia: [
    { hasta: 12450, tipo: 9 },
    { hasta: 20200, tipo: 11 },
    { hasta: 35200, tipo: 13 },
    { hasta: 60000, tipo: 16.5 },
    { hasta: Infinity, tipo: 22.5 }
  ],
  aragon: [
    { hasta: 12450, tipo: 9.5 },
    { hasta: 17707, tipo: 11.5 },
    { hasta: 28000, tipo: 13.5 },
    { hasta: 40000, tipo: 16.5 },
    { hasta: 55000, tipo: 18.5 },
    { hasta: 70000, tipo: 20.5 },
    { hasta: 80000, tipo: 22.5 },
    { hasta: 150000, tipo: 24.5 },
    { hasta: Infinity, tipo: 25.5 }
  ],
  asturias: [
    { hasta: 12450, tipo: 10 },
    { hasta: 17707, tipo: 12 },
    { hasta: 33007, tipo: 16 },
    { hasta: 53407, tipo: 21 },
    { hasta: 70000, tipo: 23 },
    { hasta: 90000, tipo: 24 },
    { hasta: 130000, tipo: 25 },
    { hasta: Infinity, tipo: 25.5 }
  ],
  baleares: [
    { hasta: 12450, tipo: 9 },
    { hasta: 20200, tipo: 11.5 },
    { hasta: 30000, tipo: 13.75 },
    { hasta: 42000, tipo: 16.25 },
    { hasta: 60000, tipo: 19.5 },
    { hasta: 90000, tipo: 21.5 },
    { hasta: 130000, tipo: 23.5 },
    { hasta: 200000, tipo: 24.5 },
    { hasta: Infinity, tipo: 24.75 }
  ],
  canarias: [
    { hasta: 12450, tipo: 9 },
    { hasta: 20200, tipo: 11 },
    { hasta: 35200, tipo: 13 },
    { hasta: 53400, tipo: 17 },
    { hasta: 70000, tipo: 21 },
    { hasta: 125000, tipo: 23 },
    { hasta: Infinity, tipo: 26 }
  ],
  cantabria: [
    { hasta: 12450, tipo: 9.5 },
    { hasta: 20200, tipo: 12 },
    { hasta: 35200, tipo: 15 },
    { hasta: 60000, tipo: 18.5 },
    { hasta: 120000, tipo: 22.5 },
    { hasta: 175000, tipo: 24.5 },
    { hasta: Infinity, tipo: 25.5 }
  ],
  castilla_la_mancha: [
    { hasta: 12450, tipo: 9.5 },
    { hasta: 20200, tipo: 12 },
    { hasta: 35200, tipo: 15 },
    { hasta: 60000, tipo: 18.5 },
    { hasta: Infinity, tipo: 22.5 }
  ],
  castilla_leon: [
    { hasta: 12450, tipo: 9 },
    { hasta: 20200, tipo: 11 },
    { hasta: 35200, tipo: 13 },
    { hasta: 60000, tipo: 16.5 },
    { hasta: Infinity, tipo: 21.5 }
  ],
  extremadura: [
    { hasta: 12450, tipo: 9.5 },
    { hasta: 20200, tipo: 12 },
    { hasta: 35200, tipo: 15 },
    { hasta: 60000, tipo: 18.5 },
    { hasta: 120000, tipo: 22.5 },
    { hasta: Infinity, tipo: 24.5 }
  ],
  murcia: [
    { hasta: 12450, tipo: 9.5 },
    { hasta: 20200, tipo: 11.5 },
    { hasta: 35200, tipo: 14.5 },
    { hasta: 60000, tipo: 17.5 },
    { hasta: Infinity, tipo: 22.5 }
  ],
  la_rioja: [
    { hasta: 12450, tipo: 8 },
    { hasta: 17707, tipo: 9.75 },
    { hasta: 33007, tipo: 13.25 },
    { hasta: 53407, tipo: 16.75 },
    { hasta: 65000, tipo: 20.25 },
    { hasta: 90000, tipo: 23.75 },
    { hasta: Infinity, tipo: 27 }
  ]
};

// --- Función para calcular cuota progresiva ---
const calcularCuotaProgresiva = (base: number, tramos: Array<{ hasta: number, tipo: number }>) => {
  let cuota = 0;
  let baseAnterior = 0;

  for (const tramo of tramos) {
    if (base <= baseAnterior) break;
    
    const baseTramo = Math.min(base, tramo.hasta) - baseAnterior;
    cuota += baseTramo * (tramo.tipo / 100);
    baseAnterior = tramo.hasta;
    
    if (base <= tramo.hasta) break;
  }

  return cuota;
};

const CalculadoraIrpfComunidadAutonoma: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    ingresos_anuales_brutos: 35000,
    comunidad_autonoma: "madrid",
    edad_contribuyente: 35,
    hijos_cargo: 0,
    hijos_menores_3: 0,
    discapacidad_contribuyente: false,
    grado_discapacidad: "33_65",
    cotizaciones_seguridad_social: 2275,
    aportaciones_planes_pensiones: 1000
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
      ingresos_anuales_brutos, comunidad_autonoma, edad_contribuyente,
      hijos_cargo, hijos_menores_3, discapacidad_contribuyente, grado_discapacidad,
      cotizaciones_seguridad_social, aportaciones_planes_pensiones
    } = states;

    // Calcular base imponible
    const maxAportacionPensiones = edad_contribuyente < 50 ? 1500 : 8500;
    const aportacionDeducible = Math.min(aportaciones_planes_pensiones || 0, maxAportacionPensiones);
    const base_imponible = Math.max(0, (ingresos_anuales_brutos || 0) - (cotizaciones_seguridad_social || 0) - aportacionDeducible);

    // Calcular mínimo personal y familiar
    let minimo_personal = 5550;
    if (edad_contribuyente >= 65) minimo_personal += 1150;
    if (edad_contribuyente >= 75) minimo_personal += 1400;

    let minimo_familiar = (hijos_cargo || 0) * 2400;
    minimo_familiar += (hijos_menores_3 || 0) * 2800;
    
    if (discapacidad_contribuyente) {
      minimo_familiar += grado_discapacidad === "mas_65" ? 9000 : 3000;
    }

    const minimo_total = minimo_personal + minimo_familiar;
    const base_liquidable = Math.max(0, base_imponible - minimo_total);

    // Calcular cuotas
    const cuota_estatal = calcularCuotaProgresiva(base_liquidable, tramosEstatales);
    const tramos_ca = tramosAutonomicos[comunidad_autonoma] || tramosAutonomicos.madrid;
    const cuota_autonomica = calcularCuotaProgresiva(base_liquidable, tramos_ca);
    const cuota_total = cuota_estatal + cuota_autonomica;

    // Calcular tipos
    const tipo_efectivo = ingresos_anuales_brutos > 0 ? (cuota_total / ingresos_anuales_brutos) * 100 : 0;
    
    // Tipo marginal (último tramo aplicado)
    let tipo_marginal = 0;
    let baseAcumulada = 0;
    for (const tramoEstatal of tramosEstatales) {
      if (base_liquidable > baseAcumulada) {
        const tramoCA = tramos_ca.find(t => t.hasta >= tramoEstatal.hasta) || tramos_ca[tramos_ca.length - 1];
        tipo_marginal = tramoEstatal.tipo + tramoCA.tipo;
      }
      baseAcumulada = tramoEstatal.hasta;
      if (base_liquidable <= tramoEstatal.hasta) break;
    }

    return {
      base_imponible,
      base_liquidable,
      cuota_estatal,
      cuota_autonomica,
      cuota_total,
      tipo_efectivo,
      tipo_marginal,
      minimo_total
    };
  }, [states]);

  const chartData = [
    { name: 'Ingresos Brutos', value: states.ingresos_anuales_brutos || 0, fill: '#e5e7eb' },
    { name: 'Cotizaciones SS', value: -(states.cotizaciones_seguridad_social || 0), fill: '#fbbf24' },
    { name: 'Planes Pensiones', value: -(Math.min(states.aportaciones_planes_pensiones || 0, states.edad_contribuyente < 50 ? 1500 : 8500)), fill: '#fb923c' },
    { name: 'Mínimo Personal/Familiar', value: -calculatedOutputs.minimo_total, fill: '#34d399' },
    { name: 'IRPF Total', value: -calculatedOutputs.cuota_total, fill: '#ef4444' },
    { name: 'Ingresos Netos', value: (states.ingresos_anuales_brutos || 0) - (states.cotizaciones_seguridad_social || 0) - calculatedOutputs.cuota_total, fill: '#22c55e' }
  ];

  const formulaUsada = `Base Liquidable = MAX(0, Ingresos Brutos - Cotizaciones SS - MIN(Planes Pensiones, ${states.edad_contribuyente < 50 ? '1.500' : '8.500'}€) - Mínimo Personal (${5550 + (states.edad_contribuyente >= 65 ? 1150 : 0) + (states.edad_contribuyente >= 75 ? 1400 : 0)}€) - Mínimo Familiar (${(states.hijos_cargo || 0) * 2400 + (states.hijos_menores_3 || 0) * 2800}€))

IRPF = Cuota Estatal + Cuota Autonómica (${states.comunidad_autonoma?.toUpperCase() || 'MADRID'})`;

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
    } catch (_e) { alert("Función PDF no disponible en este ambiente"); }
  }, [slug]);

  const salvarResultado = useCallback(() => {
    try {
      const { minimo_total, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
      alert("Resultado guardado con éxito!");
    } catch { alert("Imposible guardar el resultado."); }
  }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercentage = (value: number) => new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 2 }).format(value / 100);

  return (
    <>
      <SchemaInjector schemaData={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="p-6" ref={calculatorRef}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Calcula tu IRPF según tu comunidad de residencia y compara tramos estatales y autonómicos</p>
              
              <div className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-md p-3 mb-6">
                <strong>Disclaimer:</strong> Esta calculadora ofrece estimaciones orientativas basadas en la normativa vigente. Los cálculos reales pueden variar por circunstancias específicas o cambios normativos. Para casos complejos, consulta con un asesor fiscal profesional.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => {
                  const conditionMet = !input.condition || 
                    (input.condition === "hijos_cargo > 0" && states.hijos_cargo > 0) ||
                    (input.condition === "discapacidad_contribuyente == true" && states.discapacidad_contribuyente);
                  
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
                        <input 
                          id={input.id} 
                          type="checkbox" 
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                          checked={states[input.id] || false} 
                          onChange={(e) => handleStateChange(input.id, e.target.checked)} 
                        />
                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                      </div>
                    );
                  }

                  if (input.type === 'select') {
                    return (
                      <div key={input.id} className={input.id === 'comunidad_autonoma' ? "md:col-span-2" : ""}>
                        {inputLabel}
                        <select
                          id={input.id}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          value={states[input.id] || (input.options?.[0]?.value || '')}
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
                          max={input.max}
                          step={input.step} 
                          value={states[input.id] || ""} 
                          onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} 
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del Cálculo</h2>
                {outputs.map(output => (
                  <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                    output.id === 'cuota_total' ? 'bg-red-50 border-red-500' : 
                    output.id === 'base_liquidable' ? 'bg-blue-50 border-blue-500' :
                    'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${
                      output.id === 'cuota_total' ? 'text-red-600' : 
                      output.id === 'base_liquidable' ? 'text-blue-600' :
                      'text-gray-800'
                    }`}>
                      <span>
                        {isClient ? (
                          output.unit === '%' ? 
                            formatPercentage((calculatedOutputs as any)[output.id]) :
                            formatCurrency((calculatedOutputs as any)[output.id])
                        ) : '...'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose de Ingresos y Cargas Fiscales</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && <ChartComponent data={chartData} />}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
            <h3 className="font-semibold text-gray-700">Fórmula de Cálculo Utilizada</h3>
            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words whitespace-pre-line">{formulaUsada}</p>
            <p className="text-xs text-gray-500 mt-2">Los tramos se aplican de forma progresiva. El tipo marginal indica el porcentaje del último euro ganado.</p>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Herramientas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvarResultado} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
            </div>
          </section>
          
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Información Fiscal</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ContentRenderer content={content} />
            </div>
          </section>
          
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Referencias Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/irpf.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria - IRPF</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ley 35/2006 del IRPF</a></li>
              <li><a href="https://www.hacienda.gob.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ministerio de Hacienda</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfComunidadAutonoma;