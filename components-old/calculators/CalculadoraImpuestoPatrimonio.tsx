'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// -----------------------
// Metadati
// -----------------------
export const meta = {
  title: "Calculadora de Impuesto sobre el Patrimonio por Comunidad Autónoma",
  description:
    "Calcula el Impuesto sobre el Patrimonio en España. Estima la cuota a pagar según la normativa de tu Comunidad Autónoma, incluyendo mínimos exentos y bonificaciones.",
};

// -----------------------
// Icona per i Tooltip
// -----------------------
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// -----------------------
// Tooltip UI
// -----------------------
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// ----------------------------------
// JSON-LD per SEO
// ----------------------------------
const SeoSchema = ({ schema }: { schema: object }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

// ----------------------------------
// Markdown "lite" renderer (no deps)
// ----------------------------------
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

// -----------------------
// Dati e Logica
// -----------------------
const calculatorData = {
  slug: 'calculadora-impuesto-patrimonio',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Impuesto sobre el Patrimonio por Comunidad Autónoma',
  lang: 'es',
  inputs: [
    { id: 'valor_bienes', label: 'Valor total de bienes y derechos', type: 'number' as const, unit: '€', min: 0, step: 10000, tooltip: 'Suma el valor de todos tus activos: inmuebles, depósitos bancarios, fondos de inversión, acciones, seguros de vida, vehículos, etc.' },
    { id: 'valor_deudas', label: 'Deudas deducibles', type: 'number' as const, unit: '€', min: 0, step: 5000, tooltip: 'Incluye principalmente hipotecas sobre inmuebles o préstamos para la adquisición de bienes que forman parte del patrimonio.' },
    { id: 'exencion_vivienda_habitual', label: 'Valor exento de la vivienda habitual', type: 'number' as const, unit: '€', min: 0, max: 300000, step: 5000, tooltip: 'Introduce el valor de tu vivienda principal. Está exenta hasta un máximo de 300.000 euros.' },
    { id: 'comunidad_autonoma', label: 'Comunidad Autónoma de residencia fiscal', type: 'select' as const, options: ['Estatal (No residentes)', 'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Extremadura', 'Galicia', 'Madrid', 'Murcia', 'La Rioja', 'Comunidad Valenciana'], tooltip: 'La Comunidad Autónoma determina el mínimo exento, la tarifa aplicable y las posibles bonificaciones en la cuota.' },
  ],
  outputs: [
    { id: 'patrimonio_neto', label: 'Patrimonio Neto', unit: '€' },
    { id: 'base_imponible', label: 'Base Imponible', unit: '€' },
    { id: 'base_liquidable', label: 'Base Liquidable (Sujeta a gravamen)', unit: '€' },
    { id: 'cuota_integra', label: 'Cuota Íntegra (Impuesto bruto)', unit: '€' },
    { id: 'bonificacion_autonomica', label: 'Bonificación Autonómica', unit: '€' },
    { id: 'total_a_pagar', label: 'Total a Pagar (Impuesto sobre el Patrimonio)', unit: '€' },
  ],
  content: `### Introducción: ¿Qué es el Impuesto sobre el Patrimonio?

El Impuesto sobre el Patrimonio (IP) es un tributo de carácter **estatal**, cedido a las Comunidades Autónomas, que grava el **patrimonio neto** de las personas físicas. Es decir, valora el conjunto de bienes y derechos económicos (inmuebles, cuentas, acciones, etc.) una vez deducidas las deudas. Su objetivo es tanto recaudatorio como de control fiscal, complementando al IRPF.

Esta calculadora te permite obtener una **estimación precisa** de la cuota a pagar en función de tu comunidad de residencia, considerando las normativas autonómicas que son clave para determinar el resultado final. Se dirige a residentes fiscales en España con un patrimonio neto que se aproxime o supere los 700.000€.

### Guía de Uso de la Calculadora

* **Valor total de bienes y derechos**: Es la suma de todo tu activo. Incluye el valor de mercado de tus inmuebles (valor catastral, de adquisición o el comprobado por la Administración, el mayor), el saldo de tus cuentas y depósitos, el valor de acciones o participaciones, fondos de inversión, seguros de vida y rentas, vehículos, joyas y objetos de arte.
* **Deudas deducibles**: Son las cargas y gravámenes que disminuyen el valor de tus bienes, como préstamos hipotecarios o personales para la adquisición de los mismos. No se pueden deducir deudas genéricas.
* **Valor exento de la vivienda habitual**: La vivienda principal del contribuyente está exenta de tributación hasta un máximo de 300.000 euros. Si tu casa vale 500.000€, en este campo debes introducir 300.000€.
* **Comunidad Autónoma de residencia fiscal**: Este es el campo más importante. La CA establece el mínimo exento, la escala de gravamen (tramos) y, crucialmente, las bonificaciones sobre la cuota. Un mismo patrimonio puede suponer un pago de miles de euros o de cero, dependiendo de la región.

### Metodología de Cálculo Explicada

El cálculo del impuesto sigue un proceso estandarizado en varios pasos, aunque el resultado varía enormemente según la normativa autonómica aplicada:

1.  **Cálculo del Patrimonio Neto**: Se suman todos los activos y se restan las deudas deducibles.
    \`Patrimonio Neto = Valor de Bienes - Deudas\`

2.  **Obtención de la Base Imponible**: Al patrimonio neto se le resta la exención por vivienda habitual (máx. 300.000€).
    \`Base Imponible = Patrimonio Neto - Exención Vivienda Habitual\`

3.  **Determinación de la Base Liquidable**: A la base imponible se le resta el mínimo exento. El mínimo estatal es de **700.000€**, pero algunas comunidades lo modifican (ej. Aragón 400.000€, Cataluña 500.000€).
    \`Base Liquidable = Base Imponible - Mínimo Exento\`

4.  **Cálculo de la Cuota Íntegra**: Sobre la base liquidable se aplica una tarifa progresiva por tramos. Cada CA puede tener su propia tarifa o aplicar la estatal por defecto.

5.  **Aplicación de Bonificaciones**: Este es el paso final y más decisivo. Comunidades como **Madrid y Andalucía** aplican una **bonificación del 100%**, lo que significa que, aunque se calcule la cuota, el resultado a pagar es cero. Otras no tienen bonificación alguna.

### Preguntas Frecuentes (FAQ)

**1. ¿Quién está obligado a presentar la declaración (Modelo 714)?**
Están obligados a presentar la declaración los contribuyentes cuya cuota tributaria (después de deducciones y bonificaciones) resulte a ingresar, o cuando, no dándose esa circunstancia, el valor de sus bienes o derechos supere los **2.000.000 de euros**.

**2. Si vivo en Madrid y mi impuesto es 0€, ¿tengo que declararlo?**
Sí. Si tu patrimonio bruto (sin contar deudas ni exenciones) supera los 2 millones de euros, estás obligado a presentar el Modelo 714 aunque la cuota a pagar sea cero debido a la bonificación.

**3. ¿Cómo afecta el régimen de gananciales en un matrimonio?**
En un matrimonio en régimen de gananciales, los bienes comunes se atribuyen al 50% a cada cónyuge. Esto significa que un matrimonio con un patrimonio conjunto de 2.000.000€ puede no tener que tributar, ya que a cada uno le correspondería 1.000.000€, y tras aplicar el mínimo exento de 700.000€ y la exención por vivienda, la base liquidable podría ser cero o muy baja para ambos.
`,
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '¿Quién está obligado a presentar la declaración del Impuesto sobre el Patrimonio (Modelo 714)?', acceptedAnswer: { '@type': 'Answer', text: 'Están obligados a presentar la declaración los contribuyentes cuya cuota tributaria, después de aplicar las deducciones y bonificaciones correspondientes, resulte a ingresar. También están obligados aquellos que, sin tener cuota a ingresar, posean un valor de bienes o derechos superior a los 2.000.000 de euros.' } },
      { '@type': 'Question', name: 'Si vivo en Madrid y mi impuesto es 0€ por la bonificación, ¿tengo que declararlo?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. Aunque la cuota a pagar sea cero gracias a la bonificación del 100%, si tu patrimonio bruto (el valor total de tus bienes sin descontar deudas ni exenciones) supera los 2.000.000 de euros, sigues estando obligado a presentar el Modelo 714.' } },
      { '@type': 'Question', name: '¿Cómo afecta el régimen de gananciales en un matrimonio al impuesto?', acceptedAnswer: { '@type': 'Answer', text: 'En un matrimonio bajo el régimen de bienes gananciales, los activos y pasivos comunes se atribuyen al 50% a cada cónyuge a efectos del impuesto. Esto puede ser ventajoso, ya que permite aplicar el mínimo exento y la exención por vivienda habitual a cada uno por separado, duplicando de facto los umbrales de no tributación para el patrimonio familiar.' } },
    ],
  },
};

// --- Tipi e tariffe ---
type Tramo = { limite: number; cuota: number; tipo: number };
type Normativa = { minimo_exento: number; bonificacion: number; tarifa: Tramo[] };

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

const NORMATIVAS_AUTONOMICAS: Record<string, Normativa> = {
  'Estatal (No residentes)': { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_ESTATAL },
  Andalucía: { minimo_exento: 700000, bonificacion: 1, tarifa: TARIFA_ESTATAL },
  Aragón: { minimo_exento: 400000, bonificacion: 0, tarifa: TARIFA_ESTATAL },
  Cataluña: { minimo_exento: 500000, bonificacion: 0, tarifa: TARIFA_CATALUNA },
  Madrid: { minimo_exento: 700000, bonificacion: 1, tarifa: TARIFA_ESTATAL },
  // ... completa altre CCAA se necessario
};

const getNormativa = (comunidad: string): Normativa =>
  NORMATIVAS_AUTONOMICAS[comunidad] || { minimo_exento: 700000, bonificacion: 0, tarifa: TARIFA_ESTATAL };

// -----------------------
// Helpers
// -----------------------
const aplicarTarifa = (base: number, tarifa: Tramo[]) => {
  if (base <= 0) return 0;
  const tramo = [...tarifa].reverse().find((t) => base >= t.limite);
  return tramo ? tramo.cuota + (base - tramo.limite) * tramo.tipo : 0;
};
const fmtEUR = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

// ==================================================
// Componente principale
// ==================================================
const CalculadoraImpuestoPatrimonio: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    valor_bienes: 3000000,
    valor_deudas: 400000,
    exencion_vivienda_habitual: 300000,
    comunidad_autonoma: 'Madrid',
  };

  const [states, setStates] = useState<Record<string, any>>(initialStates);
  const handleStateChange = (id: string, value: any) => setStates((prev) => ({ ...prev, [id]: value }));
  const handleReset = () => setStates(initialStates);

  const calculatedOutputs = useMemo(() => {
    const { valor_bienes, valor_deudas, exencion_vivienda_habitual, comunidad_autonoma } = states;
    const normativa = getNormativa(comunidad_autonoma);

    const patrimonio_neto = Math.max(0, Number(valor_bienes) - Number(valor_deudas));
    const base_imponible = Math.max(0, patrimonio_neto - Math.min(300000, Number(exencion_vivienda_habitual) || 0));
    const base_liquidable = Math.max(0, base_imponible - normativa.minimo_exento);

    let cuota_integra = 0;
    if (base_liquidable > 0) {
      const tramo = [...normativa.tarifa].reverse().find((t) => base_liquidable >= t.limite);
      if (tramo) {
        cuota_integra = tramo.cuota + (base_liquidable - tramo.limite) * tramo.tipo;
      }
    }

    const bonificacion_autonomica = cuota_integra * (normativa.bonificacion || 0);
    const total_a_pagar = Math.max(0, cuota_integra - bonificacion_autonomica);

    return { patrimonio_neto, base_imponible, base_liquidable, cuota_integra, bonificacion_autonomica, total_a_pagar };
  }, [states]);

  const chartData = useMemo(() => {
    const patrimonio_neto = Math.max(0, Number(states.valor_bienes) - Number(states.valor_deudas));
    const base_imponible = Math.max(0, patrimonio_neto - Math.min(300000, Number(states.exencion_vivienda_habitual) || 0));

    return ['Madrid', 'Cataluña', 'Comunidad Valenciana', 'Aragón'].map((ca) => {
      const normativa = getNormativa(ca);
      const base_liquidable = Math.max(0, base_imponible - normativa.minimo_exento);
      const cuota = aplicarTarifa(base_liquidable, normativa.tarifa);
      const impuestoFinal = Math.max(0, cuota * (1 - (normativa.bonificacion || 0)));
      return { name: ca, 'Impuesto a Pagar': parseFloat(impuestoFinal.toFixed(2)) };
    });
  }, [states.valor_bienes, states.valor_deudas, states.exencion_vivienda_habitual]);

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
              Estima la cuota a pagar según la normativa de tu Comunidad Autónoma, incluyendo mínimos exentos y bonificaciones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {calculatorData.inputs.map((input) => {
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
                        value={states[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      >
                        {input.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
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
                        value={states[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                      />
                      {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados de la Simulación</h2>
              {calculatorData.outputs.map((output) => (
                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${output.id === 'total_a_pagar' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                  <div className={`text-lg md:text-xl font-bold ${output.id === 'total_a_pagar' ? 'text-indigo-600' : 'text-gray-800'}`}>
                    <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparativa de Impuesto por Comunidad Autónoma</h3>
              <div className="h-72 w-full bg-gray-50 p-4 rounded-lg">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                      <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="Impuesto a Pagar" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar PDF</button>
              <button onClick={handleReset} className="w-full text-sm border border-transparent bg-red-600 text-white rounded-md px-3 py-2 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía y Análisis</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/patrimonio-2023.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agencia Tributaria: Manual práctico de Patrimonio</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1991-13998" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 19/1991, de 6 de junio, del Impuesto sobre el Patrimonio</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraImpuestoPatrimonio;
