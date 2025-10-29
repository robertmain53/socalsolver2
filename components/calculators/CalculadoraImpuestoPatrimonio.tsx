'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

// -----------------------
// Metadati (Invariato)
// -----------------------
export const meta = {
  title: "Calculadora de Impuesto sobre el Patrimonio y Grandes Fortunas (ITSGF) por CCAA",
  description:
    "Calcula el Impuesto sobre el Patrimonio (IP) y el Impuesto de Solidaridad de las Grandes Fortunas (ITSGF). Compara la cuota a pagar en todas las Comunidades Autónomas.",
};

// -----------------------
// Icone e Tooltip (Invariato)
// -----------------------
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// ----------------------------------
// JSON-LD e Markdown (Invariato)
// ----------------------------------
const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);
function mdInline(text: string): string {
  let t = text.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-100 rounded">$1</code>');
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  return t;
}
function renderMarkdownLite(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let inUl = false;
  let inOl = false;
  const closeLists = () => {
    if (inUl) { html += '</ul>'; inUl = false; }
    if (inOl) { html += '</ol>'; inOl = false; }
  };
  for (const raw of lines) {
    const line = raw.trimRight();
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inUl) { closeLists(); html += '<ul class="list-disc pl-5 space-y-2 mb-4">'; inUl = true; }
      html += `<li>${mdInline(line.replace(/^\s*[-*]\s+/, ''))}</li>`;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (!inOl) { closeLists(); html += '<ol class="list-decimal pl-5 space-y-2 mb-4">'; inOl = true; }
      html += `<li>${mdInline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`;
      continue;
    }
    if (inUl || inOl) closeLists();
    if (/^###\s+/.test(line)) html += `<h3 class="text-xl font-bold mt-6 mb-4 text-gray-800">${mdInline(line.replace(/^###\s+/, ''))}</h3>`;
    else if (/^##\s+/.test(line)) html += `<h2 class="text-2xl font-bold mt-6 mb-4 text-gray-800">${mdInline(line.replace(/^##\s+/, ''))}</h2>`;
    else if (/^#\s+/.test(line)) html += `<h1 class="text-3xl font-bold mt-6 mb-4 text-gray-800">${mdInline(line.replace(/^#\s+/, ''))}</h1>`;
    else if (line.trim() === '') { html += ''; }
    else html += `<p class="mb-4 leading-relaxed">${mdInline(line)}</p>`;
  }
  closeLists();
  return html;
}
const ContentRenderer = ({ content }: { content: string }) => {
  const [htmlContent, setHtmlContent] = useState('');
  useEffect(() => { setHtmlContent(renderMarkdownLite(content)); }, [content]);
  return <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

// ----------------------------------
// Dati e Logica: Campi di input
// ----------------------------------
const calculatorData = {
  slug: 'calculadora-impuesto-patrimonio',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Impuesto sobre el Patrimonio y Grandes Fortunas',
  lang: 'es',
  inputs: [
    // --- [CORREZIONE] --- Rimosso 'step: 10000' duplicato
    { id: 'valor_bienes', label: 'Valor total de bienes y derechos', type: 'number' as const, unit: '€', min: 0, tooltip: 'Suma el valor de todos tus activos: inmuebles (sin incluir la vivienda habitual), depósitos bancarios, fondos de inversión, acciones, seguros de vida, vehículos, etc. La vivienda habitual se introduce abajo.', step: 1 },
    // --- [CORREZIONE] --- Rimosso 'step: 5000' duplicato
    { id: 'valor_vivienda_habitual', label: 'Valor de la vivienda habitual', type: 'number' as const, unit: '€', min: 0, tooltip: 'Introduce el valor total de tu vivienda principal. La ley aplica una exención automática sobre este valor con un límite de 300.000€.', step: 1 },
    // --- [CORREZIONE] --- Rimosso 'step: 5000' duplicato
    { id: 'valor_deudas', label: 'Deudas deducibles', type: 'number' as const, unit: '€', min: 0, tooltip: 'Incluye hipotecas (incluida la parte proporcional de la vivienda habitual) o préstamos para la adquisición de bienes que forman parte del patrimonio.', step: 1 },
    { id: 'comunidad_autonoma', label: 'Comunidad Autónoma de residencia fiscal', type: 'select' as const, options: [
      'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Extremadura', 'Galicia', 'Madrid', 'Murcia', 'La Rioja', 'Comunidad Valenciana', 'Estatal (No residentes)'
    ], tooltip: 'La Comunidad Autónoma determina el mínimo exento, la tarifa aplicable y las posibles bonificaciones en la cuota.', step: 2 },
  ],
  outputs: [
    { id: 'patrimonio_bruto', label: 'Patrimonio Bruto Total', unit: '€' },
    { id: 'deudas_y_exenciones', label: '(-) Deudas y Exención Vivienda', unit: '€' },
    { id: 'base_imponible', label: '(=) Base Imponible', unit: '€' },
    { id: 'minimo_exento_aplicado', label: '(-) Mínimo Exento (Regional)', unit: '€' },
    { id: 'base_liquidable_ip', label: '(=) Base Liquidable (IP)', unit: '€' },
    { id: 'cuota_integra_ip', label: 'Cuota Íntegra (Impuesto Patrimonio)', unit: '€' },
    { id: 'bonificacion_autonomica', label: 'Bonificación Autonómica (IP)', unit: '€' },
    { id: 'total_a_pagar_ip', label: 'Total a Pagar (Impuesto Patrimonio)', unit: '€', highlight: true },
    { id: 'cuota_integra_itsgf', label: 'Cuota Íntegra (Grandes Fortunas)', unit: '€', itsgf: true },
    { id: 'itsgf_a_pagar', label: 'Total a Pagar (Grandes Fortunas)', unit: '€', itsgf: true },
    { id: 'total_impuestos', label: 'TOTAL IMPUESTOS (IP + ITSGF)', unit: '€', final: true },
  ],
  content: `### Introducción: ¿Qué es el Impuesto sobre el Patrimonio (IP)?

El Impuesto sobre el Patrimonio (IP) es un tributo estatal, cedido a las Comunidades Autónomas, que grava el **patrimonio neto** de las personas físicas.

### Innovación: IP vs. Impuesto a las Grandes Fortunas (ITSGF)

Esta calculadora incluye la innovación clave de calcular simultáneamente el Impuesto de Solidaridad de las Grandes Fortunas (ITSGF). El ITSGF funciona como un **suelo fiscal** en todo el país.
* Calculas tu impuesto de patrimonio regional (IP).
* Calculas el impuesto de grandes fortunas (ITSGF).
* Si el ITSGF es **mayor** que tu IP regional, pagas esa diferencia al Estado.
* **Resultado:** En la práctica, siempre pagas el importe más alto de los dos. Esto afecta principalmente a residentes en CCAA con bonificación del 100% (Madrid, Andalucía...) si su patrimonio es superior a ~3.7M€.

### Guía de Uso de la Calculadora

* **Paso 1: Patrimonio**: Introduce tus bienes (separando la vivienda habitual) y tus deudas.
* **Paso 2: Región**: Elige tu comunidad autónoma de residencia fiscal.
* **Paso 3: Resultados**: Analiza el desglose y la comparativa regional.

### Metodología de Cálculo Explicada

1.  **Patrimonio Neto**: Se suman todos los activos y se restan las deudas deducibles.
2.  **Base Imponible**: Al patrimonio neto se le resta la exención por vivienda habitual (máx. 300.000€).
3.  **Cálculo IP (Regional)**:
    * \`Base Liquidable (IP) = Base Imponible - Mínimo Exento (Regional)\`
    * Se aplica la tarifa regional (o estatal) per ottenere la \`Cuota Íntegra (IP)\`.
    * Se aplica la bonificación regional (ej. 100% en Madrid) per ottenere el \`Total a Pagar (IP)\`.
4.  **Cálculo ITSGF (Estatal)**:
    * \`Base Liquidable (ITSGF) = Base Imponible - 700.000€ (Mínimo estatal)\`
    * Se aplica la tarifa estatal de Grandes Fortunas per ottenere la \`Cuota Íntegra (ITSGF)\`.
    * \`ITSGF a Pagar = MAX(0, Cuota Íntegra (ITSGF) - Total a Pagar (IP))\`
5.  **Total Impuestos**: \`Total a Pagar (IP) + ITSGF a Pagar\`.

### Preguntas Frecuentes (FAQ)

**1. ¿Quién está obligado a presentar la declaración (Modelo 714)?**
Están obligados los contribuyentes con cuota a ingresar, o cuando, sin cuota, el valor de sus bienes supere los **2.000.000 de euros**.

**2. Si vivo en Madrid y mi IP es 0€, ¿puedo tener que pagar el ITSGF?**
**Sí.** Este es el propósito del ITSGF. Si tu *base imponible* (Patrimonio Neto - Exención Vivienda) supera los 3.700.000€ (aprox.), empezarás a pagar el ITSGF, aunque tu IP regional sea 0€ por la bonificación.

**3. ¿Cómo afecta el régimen de gananciales?**
Los bienes comunes se atribuyen al 50% a cada cónyuge. Esto permite que cada uno aplique por separado el mínimo exento (ej. 700.000€) y la exención por vivienda (300.000€), duplicando de facto los umbrales de no tributación para la familia.
`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '¿Quién está obligado a presentar la declaración del Impuesto sobre el Patrimonio (Modelo 714)?', acceptedAnswer: { '@type': 'Answer', text: 'Están obligados a presentar la declaración los contribuyentes cuya cuota tributaria, después de aplicar las deducciones y bonificaciones correspondientes, resulte a ingresar. También están obligados aquellos que, sin tener cuota a ingresar, posean un valor de bienes o derechos superior a los 2.000.000 de euros.' } },
      { '@type': 'Question', name: 'Si vivo en Madrid y mi IP es 0€ por la bonificación, ¿tengo que pagar el Impuesto a las Grandes Fortunas (ITSGF)?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, es posible. El ITSGF actúa como un impuesto mínimo estatal. Si tu base imponible (patrimonio neto menos exención por vivienda) supera los 3.700.000€, es probable que generes una cuota de ITSGF. A esa cuota se le resta lo que pagas de IP (que en Madrid es 0€), por lo que deberás pagar la totalidad de la cuota del ITSGF al Estado.' } },
      { '@type': 'Question', name: '¿Cómo afecta el régimen de gananciales en un matrimonio al impuesto?', acceptedAnswer: { '@type': 'Answer', text: 'En un matrimonio bajo el régimen de bienes gananciales, los activos y pasivos comunes se atribuyen al 50% a cada cónyuge a efectos del impuesto. Esto puede ser ventajoso, ya que permite aplicar el mínimo exento y la exención por vivienda habitual a cada uno por separado, duplicando de facto los umbrales de no tributación para el patrimonio familiar.' } },
    ],
  },
};

// ----------------------------------
// Database tariffe e normative
// ----------------------------------
type Tramo = { limite: number; cuota: number; tipo: number };
type Normativa = { minimo_exento: number; bonificacion: number; tarifa: Tramo[] };

// Tariffe statali e regionali
const TARIFA_ESTATAL: Tramo[] = [
  { limite: 0, cuota: 0, tipo: 0.002 },
  { limite: 167129.45, cuota: 334.26, tipo: 0.003 },
  { limite: 334252.88, cuota: 835.63, tipo: 0.005 },
  { limite: 668499.75, cuota: 2506.88, tipo: 0.009 },
  { limite: 1336999.51, cuota: 8523.38, tipo: 0.013 },
  { limite: 2673999.01, cuota: 25904.38, tipo: 0.017 },
  { limite: 5347998.03, cuota: 71362.38, tipo: 0.021 },
  { limite: 10695996.06, cuota: 183670.38, tipo: 0.035 },
];

const TARIFA_CATALUNA: Tramo[] = [
  { limite: 0, cuota: 0, tipo: 0.0021 },
  { limite: 167129.45, cuota: 351.0, tipo: 0.00315 },
  { limite: 334252.88, cuota: 882.0, tipo: 0.00525 },
  { limite: 668499.75, cuota: 2636.8, tipo: 0.00945 },
  { limite: 1336999.51, cuota: 8955.6, tipo: 0.01365 },
  { limite: 2673999.01, cuota: 27170.1, tipo: 0.01785 },
  { limite: 5347998.03, cuota: 75098.1, tipo: 0.02205 },
  { limite: 10695996.06, cuota: 193041.1, tipo: 0.0275 },
];

const TARIFA_VALENCIANA: Tramo[] = [
  { limite: 0, cuota: 0, tipo: 0.0025 },
  { limite: 167129.45, cuota: 417.82, tipo: 0.0037 },
  { limite: 334252.88, cuota: 1036.18, tipo: 0.0062 },
  { limite: 668499.75, cuota: 3108.51, tipo: 0.0112 },
  { limite: 1336999.51, cuota: 10595.71, tipo: 0.0162 },
  { limite: 2673999.01, cuota: 32255.10, tipo: 0.0212 },
  { limite: 5347998.03, cuota: 88941.88, tipo: 0.0275 },
  { limite: 10695996.06, cuota: 235901.81, tipo: 0.035 },
];

const TARIFA_BALEARES: Tramo[] = [
  { limite: 0, cuota: 0, tipo: 0.0028 },
  { limite: 175440.09, cuota: 491.23, tipo: 0.0041 },
  { limite: 350880.17, cuota: 1210.53, tipo: 0.0069 },
  { limite: 701760.35, cuota: 3631.59, tipo: 0.0124 },
  { limite: 1403520.70, cuota: 12333.42, tipo: 0.0179 },
  { limite: 2807041.39, cuota: 37408.06, tipo: 0.0235 },
  { limite: 5614082.78, cuota: 102873.53, tipo: 0.0290 },
  { limite: 11228165.57, cuota: 265681.93, tipo: 0.0345 },
];

// Tariffa per Impuesto Temporal de Solidaridad de las Grandes Fortunas (ITSGF)
const TARIFA_ITSGF: Tramo[] = [
  { limite: 0, cuota: 0, tipo: 0.0 }, // Esente fino a 3.000.000 di Base Liquidabile
  { limite: 3000000, cuota: 0, tipo: 0.017 },
  { limite: 5347998.03, cuota: 39915.97, tipo: 0.021 },
  { limite: 10695996.06, cuota: 152223.93, tipo: 0.035 },
];

// Database normativo (ampliato)
const NORMATIVAS_AUTONOMICAS: Record<string, Normativa> = {
  'Estatal (No residentes)': { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_ESTATAL },
  Andalucía: { minimo_exento: 700000, bonificacion: 1, tarifa: TARIFA_ESTATAL },
  Aragón: { minimo_exento: 400000, bonificacion: 0, tarifa: TARIFA_ESTATAL },
  Asturias: { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_ESTATAL }, // Ha tariffe proprie, ma usiamo la statale per brevità
  Baleares: { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_BALEARES },
  Canarias: { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_ESTATAL },
  Cantabria: { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_ESTATAL },
  'Castilla-La Mancha': { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_ESTATAL },
  'Castilla y León': { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_ESTATAL },
  Cataluña: { minimo_exento: 500000, bonificacion: 0, tarifa: TARIFA_CATALUNA },
  Extremadura: { minimo_exento: 500000, bonificacion: 1, tarifa: TARIFA_ESTATAL }, // Bonifica 100% dal 2024
  Galicia: { minimo_exento: 700000, bonificacion: 0.5, tarifa: TARIFA_ESTATAL }, // Bonifica 50% dal 2024
  Madrid: { minimo_exento: 700000, bonificacion: 1, tarifa: TARIFA_ESTATAL },
  Murcia: { minimo_exento: 700000, bonificacion: 1, tarifa: TARIFA_ESTATAL }, // Bonifica 100%
  'La Rioja': { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_ESTATAL },
  'Comunidad Valenciana': { minimo_exento: 500000, bonificacion: 0, tarifa: TARIFA_VALENCIANA },
};

const getNormativa = (comunidad: string): Normativa =>
  NORMATIVAS_AUTONOMICAS[comunidad] || NORMATIVAS_AUTONOMICAS['Estatal (No residentes)'];

// -----------------------
// Helper di calcolo (Invariato)
// -----------------------
const aplicarTarifa = (base: number, tarifa: Tramo[]) => {
  if (base <= 0) return 0;
  const tramo = [...tarifa].reverse().find((t) => base >= t.limite);
  return tramo ? tramo.cuota + (base - tramo.limite) * tramo.tipo : 0;
};
const fmtEUR = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

// -----------------------
// Funzione di calcolo principale
// -----------------------
const calcularImpuestos = (
  baseStates: { valor_bienes: number; valor_vivienda_habitual: number; valor_deudas: number },
  comunidad: string
) => {
  const { valor_bienes, valor_vivienda_habitual, valor_deudas } = baseStates;
  const normativa = getNormativa(comunidad);

  const patrimonio_bruto = Number(valor_bienes) + Number(valor_vivienda_habitual);
  const exencion_vivienda = Math.min(300000, Number(valor_vivienda_habitual) || 0);
  
  // Semplificazione: le deduzioni si applicano proporzionalmente. 
  // Per una stima, sottraiamo il totale.
  const patrimonio_neto = Math.max(0, patrimonio_bruto - Number(valor_deudas));
  const deudas_y_exenciones = Number(valor_deudas) + exencion_vivienda;

  const base_imponible = Math.max(0, patrimonio_neto - exencion_vivienda);
  
  // 1. Calcolo Impuesto Patrimonio (IP)
  const minimo_exento_aplicado = normativa.minimo_exento;
  const base_liquidable_ip = Math.max(0, base_imponible - minimo_exento_aplicado);
  const cuota_integra_ip = aplicarTarifa(base_liquidable_ip, normativa.tarifa);
  const bonificacion_autonomica = cuota_integra_ip * (normativa.bonificacion || 0);
  const total_a_pagar_ip = Math.max(0, cuota_integra_ip - bonificacion_autonomica);

  // 2. Calcolo Impuesto Grandes Fortunas (ITSGF)
  // Il minimo esente del ITSGF è sempre quello statale: 700.000€
  const base_liquidable_itsgf = Math.max(0, base_imponible - 700000); 
  const cuota_integra_itsgf = aplicarTarifa(base_liquidable_itsgf, TARIFA_ITSGF);
  
  // Si deduce la *cuota effettivamente pagata* di IP
  const itsgf_a_pagar = Math.max(0, cuota_integra_itsgf - total_a_pagar_ip);

  // 3. Totale
  const total_impuestos = total_a_pagar_ip + itsgf_a_pagar;

  return {
    comunidad,
    patrimonio_bruto,
    deudas_y_exenciones,
    base_imponible,
    minimo_exento_aplicado,
    base_liquidable_ip,
    cuota_integra_ip,
    bonificacion_autonomica,
    total_a_pagar_ip,
    base_liquidable_itsgf, // Aggiunto per trasparenza
    cuota_integra_itsgf,
    itsgf_a_pagar,
    total_impuestos,
  };
};

// ==================================================
// Componente principale
// ==================================================
const CalculadoraImpuestoPatrimonio: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const [step, setStep] = useState(1);

  const initialStates = {
    valor_bienes: 3500000,
    valor_vivienda_habitual: 500000,
    valor_deudas: 400000,
    comunidad_autonoma: 'Madrid',
  };

  const [states, setStates] = useState<Record<string, any>>(initialStates);
  const handleStateChange = (id: string, value: any) => setStates((prev) => ({ ...prev, [id]: value }));
  const handleReset = () => {
    setStates(initialStates);
    setStep(1); // Resetta anche il wizard
  };

  const calculatedOutputs = useMemo(() => {
    const { valor_bienes, valor_vivienda_habitual, valor_deudas, comunidad_autonoma } = states;
    return calcularImpuestos({
      valor_bienes: Number(valor_bienes) || 0,
      valor_vivienda_habitual: Number(valor_vivienda_habitual) || 0,
      valor_deudas: Number(valor_deudas) || 0,
    }, comunidad_autonoma);
  }, [states]);

  const chartData = useMemo(() => {
    const { valor_bienes, valor_vivienda_habitual, valor_deudas } = states;
    const baseStates = {
      valor_bienes: Number(valor_bienes) || 0,
      valor_vivienda_habitual: Number(valor_vivienda_habitual) || 0,
      valor_deudas: Number(valor_deudas) || 0,
    };

    return Object.keys(NORMATIVAS_AUTONOMICAS).map((ca) => {
      const result = calcularImpuestos(baseStates, ca);
      return { 
        name: ca, 
        'Impuesto Total': parseFloat(result.total_impuestos.toFixed(2)),
        'IP (Regional)': parseFloat(result.total_a_pagar_ip.toFixed(2)),
        'ITSGF (Estatal)': parseFloat(result.itsgf_a_pagar.toFixed(2)),
      };
    }).sort((a, b) => b['Impuesto Total'] - a['Impuesto Total']); // Ordina dal più caro al più economico
  }, [states.valor_bienes, states.valor_deudas, states.valor_vivienda_habitual]);

  // Funzioni di export (invariate)
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default as any;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('Error al generar el PDF.');
    }
   }, [slug]);
  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 10)));
      alert('Resultado guardado en el navegador.');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
   }, [states, calculatedOutputs, slug, title]);

  const formatCurrency = (value: number) => fmtEUR(value);

  return (
    <>
      <SeoSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">
              Estima el IP y el ITSGF (Impuesto a Grandes Fortunas) y compara la carga fiscal en toda España.
            </p>

            {/* Contenitore del Wizard */}
            <div className="border border-gray-200 rounded-lg">
              
              {/* Navigazione Wizard */}
              <div className="flex border-b border-gray-200">
                <StepTab num={1} title="Patrimonio" currentStep={step} setStep={setStep} />
                <StepTab num={2} title="Región" currentStep={step} setStep={setStep} />
                <StepTab num={3} title="Resultados" currentStep={step} setStep={setStep} />
              </div>

              {/* Contenuto dei Passi */}
              <div className="p-6">
                
                {/* --- PASSO 1: PATRIMONIO --- */}
                <div className={step === 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'hidden'}>
                  {calculatorData.inputs.filter(i => i.step === 1).map((input) => (
                    <FormInput key={input.id} input={input} state={states[input.id]} onChange={handleStateChange} />
                  ))}
                  <div className="md:col-span-2 flex justify-end">
                    <button onClick={() => setStep(2)} className="bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700 transition-colors">
                      Siguiente &rarr;
                    </button>
                  </div>
                </div>
                
                {/* --- PASSO 2: REGIONE --- */}
                <div className={step === 2 ? 'grid grid-cols-1 gap-6' : 'hidden'}>
                  {calculatorData.inputs.filter(i => i.step === 2).map((input) => (
                    <FormInput key={input.id} input={input} state={states[input.id]} onChange={handleStateChange} />
                  ))}
                  <div className="flex justify-between">
                    <button onClick={() => setStep(1)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors">
                      &larr; Anterior
                    </button>
                    <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700 transition-colors">
                      Ver Resultados &darr;
                    </button>
                  </div>
                </div>

                {/* --- PASSO 3: RISULTATI --- */}
                <div className={step === 3 ? 'space-y-8' : 'hidden'}>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Resultados para: <span className="text-indigo-600">{states.comunidad_autonoma}</span>
                    </h2>
                    <div className="space-y-3">
                      {calculatorData.outputs.map((output) => {
                        const value = (calculatedOutputs as any)[output.id];
                        const isFinal = output.final;
                        const isHighlight = output.highlight;
                        const isITSGF = output.itsgf && value > 0; // Mostra solo se ITSGF è > 0

                        let bgColor = 'bg-gray-50 border-gray-300';
                        if (isHighlight) bgColor = 'bg-blue-50 border-blue-400';
                        if (isITSGF) bgColor = 'bg-yellow-50 border-yellow-400';
                        if (isFinal) bgColor = 'bg-indigo-50 border-indigo-500';

                        let textColor = 'text-gray-800';
                        if (isHighlight) textColor = 'text-blue-600';
                        if (isITSGF) textColor = 'text-yellow-700';
                        if (isFinal) textColor = 'text-indigo-600';

                        // Nasconde i campi ITSGF se non rilevanti (per pulizia)
                        if (output.itsgf && calculatedOutputs.cuota_integra_itsgf <= 0) {
                          return null;
                        }

                        return (
                          <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${bgColor}`}>
                            <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                            <div className={`text-lg md:text-xl font-bold ${textColor}`}>
                              <span>{isClient ? formatCurrency(value) : '...'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grafico comparativo migliorato */}
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Comparativa de Impuesto Total por CCAA</h3>
                    <div className="h-96 w-full bg-gray-50 p-4 rounded-lg">
                      {isClient && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                            <XAxis type="number" fontSize={12} tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                            <YAxis type="category" dataKey="name" fontSize={10} width={100} interval={0} />
                            <ChartTooltip 
                              formatter={(value: number, name: string) => [formatCurrency(value), name]} 
                              itemSorter={(item) => (item.dataKey === 'ITSGF (Estatal)' ? 1 : 0)} // Mostra prima IP
                            />
                            <Legend />
                            <Bar dataKey="IP (Regional)" stackId="a" fill="#8884d8" />
                            <Bar dataKey="ITSGF (Estatal)" stackId="a" fill="#facc15" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <button onClick={() => setStep(2)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors">
                      &larr; Volver a Región
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar aggiornata */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border border-transparent bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
            </div>
          </section>

          {/* Sezione Affidabilità */}
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fiabilidad y Fuentes</h2>
            <p className="text-xs text-gray-600 mb-3">
              Valores actualizados a la normativa fiscal vigente (ejercicio 2024/2025).
            </p>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/patrimonio-2023.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Manual de Patrimonio</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2022-22684" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 38/2022 (Creación del ITSGF)</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1991-13998" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 19/1991 (Ley del IP)</a></li>
            </ul>
            <p className="text-xs text-gray-500 mt-4 italic">
              Esta herramienta es un simulador y no sustituye la consulta con un asesor fiscal profesional. Los cálculos son una estimación basada en la normativa estatal y autonómica pública.
            </p>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Análisis</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

        </aside>
      </div>
    </>
  );
};

// ==================================================
// Componenti UI per il Wizard
// ==================================================

// Componente per la linguetta del passo
const StepTab = ({ num, title, currentStep, setStep }: { num: number; title: string; currentStep: number; setStep: (step: number) => void }) => {
  const isActive = num === currentStep;
  const isDone = num < currentStep;
  return (
    <button
      onClick={() => setStep(num)}
      className={`flex-1 py-3 px-2 text-center text-sm font-medium border-b-4 transition-colors
        ${isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
        ${isDone ? 'text-indigo-800' : ''}
      `}
    >
      <span className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full ${isActive ? 'bg-indigo-500 text-white' : isDone ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
        {num}
      </span>
      {title}
    </button>
  );
};

// Componente per i campi di input (riutilizzabile)
const FormInput = ({ input, state, onChange }: { input: any; state: any; onChange: (id: string, value: any) => void }) => {
  const inputLabel = (
    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
      {input.label}
      <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
    </label>
  );

  if (input.type === 'select') {
    return (
      <div key={input.id} className="md:col-span-2">
        {inputLabel}
        <select
          id={input.id}
          value={state}
          onChange={(e) => onChange(input.id, e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
        >
          {input.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div key={input.id} className={input.id === 'valor_vivienda_habitual' ? 'md:col-span-2' : ''}>
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
          value={state}
          onChange={(e) => onChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
        />
        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
      </div>
    </div>
  );
};

export default CalculadoraImpuestoPatrimonio;