'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// Tipi robusti per i coefficienti di depreciación
type DepRow = Readonly<{ anos: number; coeficiente: number }>;
type DepTable = ReadonlyArray<DepRow>;

// --- Icona per i Tooltip ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const CalculatorSeoSchema = ({ schema }: { schema: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
  const blocks = content.split('\n\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### '))
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(4)) }} />;
        if (trimmedBlock.startsWith('#### '))
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(5)) }} />;
        if (trimmedBlock.startsWith('* ')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        if (/^\d\.\s/.test(trimmedBlock)) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
          return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
        }
        if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        return null;
      })}
    </div>
  );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "calculadora-coste-transferencia-vehiculo",
  "category": "Bienes Raíces y Vivienda",
  "title": "Calculadora de Coste de Transferencia de un Vehículo",
  "lang": "es",
  "data": {
    "tasa_dgt_coche": 55.70,
    "tasa_dgt_moto": 27.85,
    "itp_comunidades": {
      "Andalucía": 4, "Aragón": 4, "Asturias": 4, "Baleares": 5, "Canarias": 5.5,
      "Cantabria": 8, "Castilla y León": 5, "Castilla-La Mancha": 6, "Cataluña": 5,
      "Comunidad Valenciana": 6, "Extremadura": 6, "Galicia": 8, "La Rioja": 4,
      "Madrid": 4, "Murcia": 4, "Navarra": 4, "País Vasco": 4, "Ceuta y Melilla": 4
    } as const,
    "coeficientes_depreciacion": [
      { "anos": 1, "coeficiente": 1.00 },
      { "anos": 2, "coeficiente": 0.84 },
      { "anos": 3, "coeficiente": 0.67 },
      { "anos": 4, "coeficiente": 0.56 },
      { "anos": 5, "coeficiente": 0.47 },
      { "anos": 6, "coeficiente": 0.39 },
      { "anos": 7, "coeficiente": 0.34 },
      { "anos": 8, "coeficiente": 0.28 },
      { "anos": 9, "coeficiente": 0.24 },
      { "anos": 10, "coeficiente": 0.19 },
      { "anos": 11, "coeficiente": 0.17 },
      { "anos": 12, "coeficiente": 0.13 },
      { "anos": Infinity, "coeficiente": 0.10 }
    ] satisfies DepTable
  },
  "inputs": [
    { "id": "comunidad_autonoma", "label": "Comunidad Autónoma del Comprador", "type": "select", "options": ["Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", "Castilla y León", "Castilla-La Mancha", "Cataluña", "Comunidad Valenciana", "Extremadura", "Galicia", "La Rioja", "Madrid", "Murcia", "Navarra", "País Vasco", "Ceuta y Melilla"], "tooltip": "El Impuesto de Transmisiones Patrimoniales (ITP) se paga en la comunidad de residencia del comprador y varía entre un 4% y un 8%." },
    { "id": "valor_fiscal_original", "label": "Valor Fiscal Original del Vehículo (en el BOE)", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Es el valor oficial del vehículo cuando era nuevo, publicado por Hacienda en el BOE cada año. Búscalo en las tablas oficiales para tu modelo y año." },
    { "id": "ano_matriculacion", "label": "Año de Primera Matriculación", "type": "number", "unit": "año", "min": 1980, "max": 2025, "step": 1, "tooltip": "El año en que se matriculó el vehículo por primera vez. Esto determina el porcentaje de depreciación que se aplica a su valor fiscal." },
    { "id": "tipo_vehiculo", "label": "Tipo de Vehículo", "type": "select", "options": ["Turismo (Coche)", "Motocicleta"], "tooltip": "La tasa de la DGT es diferente para coches y motocicletas." }
  ] as const,
  "outputs": [
    { "id": "valor_depreciado", "label": "Base Imponible del Impuesto (Valor Actual)", "unit": "€" },
    { "id": "coste_itp", "label": "Impuesto de Transmisiones (ITP)", "unit": "€" },
    { "id": "tasa_dgt", "label": "Tasa Fija de la DGT", "unit": "€" },
    { "id": "coste_total_transferencia", "label": "Coste Total de la Transferencia", "unit": "€" }
  ] as const,
  "formulaSteps": [
    { "step": 1, "description": "Calcular la antigüedad del vehículo para determinar el coeficiente de depreciación según las tablas oficiales de Hacienda." },
    { "step": 2, "description": "Calcular la Base Imponible (valor actual del vehículo)", "formula": "Base Imponible = Valor Fiscal Original × Coeficiente de Depreciación" },
    { "step": 3, "description": "Calcular el Impuesto de Transmisiones Patrimoniales (ITP)", "formula": "ITP = Base Imponible × (% ITP de la Comunidad Autónoma)" },
    { "step": 4, "description": "Sumar la tasa fija de la DGT para obtener el coste total", "formula": "Coste Total = ITP + Tasa DGT" }
  ],
  "examples": [
    { "name": "Coche de 5 años en Madrid", "inputs": { "comunidad_autonoma": "Madrid", "valor_fiscal_original": 22000, "ano_matriculacion": 2020, "tipo_vehiculo": "Turismo (Coche)" }, "outputs": { "coste_total_transferencia": 468.30 } },
    { "name": "Moto de 10 años en Cataluña", "inputs": { "comunidad_autonoma": "Cataluña", "valor_fiscal_original": 9000, "ano_matriculacion": 2015, "tipo_vehiculo": "Motocicleta" }, "outputs": { "coste_total_transferencia": 113.35 } }
  ],
  "tags": "calculadora coste transferencia coche, calcular cambio de nombre coche, impuesto transmisiones patrimoniales, ITP vehículo, tasa DGT, trámites DGT, precio transferencia moto, España",
  "content": "### Introducción\n\nAl comprar un coche o moto de segunda mano, el precio del vehículo es solo el principio. La transferencia de titularidad conlleva dos costes obligatorios: el **Impuesto de Transmisiones Patrimoniales (ITP)**, que varía enormemente según tu Comunidad Autónoma, y la **tasa fija de la Dirección General de Tráfico (DGT)**. Esta calculadora te ofrece un desglose transparente y preciso de todos los costes para que no haya sorpresas, permitiéndote presupuestar el gasto total del cambio de nombre de tu nuevo vehículo.\n\n### Guida all'Uso del Calcolatore\n\n* **Comunidad Autónoma del Comprador**: El ITP se liquida en la región donde resides. Este es el factor más variable, con tipos impositivos que van desde el 4% hasta el 8%.\n* **Valor Fiscal Original del Vehículo**: ¡Este es el dato clave! No es el precio que pagaste por el coche. Es el valor que Hacienda le asignó al modelo cuando era nuevo. Debes consultarlo en las **tablas de valoración de vehículos** que el Gobierno publica cada año en el BOE. Busca tu marca, modelo y versión para encontrar este valor.\n* **Año de Primera Matriculación**: Lo encontrarás en el Permiso de Circulación. La antigüedad del vehículo determina qué porcentaje de su valor original se usa para calcular el impuesto (depreciación).\n* **Tipo de Vehículo**: La tasa de la DGT es más económica para las motocicletas que para los turismos.\n\n### Metodologia di Calcolo Spiegata\n\nEl cálculo se basa estrictamente en el procedimiento oficial de la Agencia Tributaria y la DGT:\n\n1.  **Cálculo de la Base Imponible**: Primero, determinamos el valor fiscal actual del vehículo. Para ello, tomamos el Valor Fiscal Original que has introducido y le aplicamos un **coeficiente de depreciación** oficial basado en sus años de antigüedad. Por ejemplo, un coche con 5 años de antigüedad conserva un 47% de su valor fiscal original.\n2.  **Cálculo del Impuesto (ITP)**: Una vez obtenida la base imponible (el valor depreciado), le aplicamos el tipo impositivo (%) correspondiente a tu Comunidad Autónoma. Este es el importe del ITP que deberás abonar a la Hacienda de tu región.\n3.  **Suma de Costes**: El coste total de la transferencia es la suma del ITP calculado y la tasa fija de la DGT por el cambio de titularidad.\n\n### Analisi Approfondita: El Proceso de Transferencia Paso a Paso: Documentación y Errores a Evitar\n\nRealizar la transferencia por tu cuenta (sin una gestoría) te ahorrará dinero, pero requiere ser metódico. Sigue estos pasos:\n\n**Paso 1: Recopilar la Documentación (Antes y durante la compra)**\n* **Del Vendedor**: DNI, Permiso de Circulación, y Ficha Técnica con la ITV en vigor.\n* **Vuestro**: Contrato de compraventa (3 copias), y el DNI del comprador.\n* **Recomendación Clave**: Antes de pagar nada, solicita un **Informe del Vehículo a la DGT**. Cuesta menos de 10€ y es tu seguro de vida: te dirá si el coche tiene multas pendientes, embargos o una **reserva de dominio**, lo que impediría la transferencia.\n\n**Paso 2: Pagar el Impuesto de Transmisiones Patrimoniales (ITP)**\n* Tienes 30 días hábiles desde la firma del contrato.\n* Debes rellenar el **Modelo 620 o 621** (según tu C.A.) online o presencialmente en la delegación de Hacienda que te corresponda. Una vez pagado, te darán un justificante (un código CET o un documento sellado).\n\n**Paso 3: Finalizar en la DGT**\n* Pide cita previa en una Jefatura de Tráfico.\n* Rellena el impreso oficial de \"Solicitud de cambio de titularidad\".\n* Paga la tasa de la DGT (puedes hacerlo online o con tarjeta en la propia oficina).\n* Presenta toda la documentación: los documentos del coche, tus papeles, el contrato y, muy importante, el justificante de haber pagado el ITP.\n\nSi todo está correcto, la DGT emitirá un nuevo Permiso de Circulación a tu nombre en el acto.\n\n### Domande Frequenti (FAQ)\n\n* **¿Quién paga la transferencia, el comprador o el vendedor?**\n    Por ley, la obligación de pagar los impuestos y tasas de la transferencia recae sobre el **comprador**. Aunque se puede llegar a un acuerdo privado para compartir gastos, la responsabilidad ante la administración es siempre del que adquiere el vehículo.\n\n* **¿Dónde encuentro el 'valor fiscal' de mi coche en el BOE?**\n    Cada mes de diciembre, el Ministerio de Hacienda publica una Orden Ministerial en el BOE con los precios fiscales para el año siguiente. Busca la orden con el título \"por la que se aprueban los precios medios de venta aplicables en la gestión del ITP\". Dentro encontrarás anexos con listados de miles de modelos. Busca la marca, el modelo y la versión exacta de tu vehículo.\n\n* **¿Qué es una 'reserva de dominio' y por qué es peligrosa?**\n    Es una cláusula que las entidades financieras incluyen cuando financian un coche. Significa que, aunque tú uses el coche, la financiera sigue siendo la propietaria legal hasta que termines de pagar el préstamo. Si compras un coche con reserva de dominio, la DGT **no te permitirá transferirlo a tu nombre**. Es imprescindible cancelarla antes de iniciar el trámite.",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Quién paga la transferencia, el comprador o el vendedor?", "acceptedAnswer": { "@type": "Answer", "text": "Por ley, la obligación de pagar los impuestos y tasas de la transferencia recae sobre el comprador. Aunque se puede llegar a un acuerdo privado para compartir gastos, la responsabilidad ante la administración es siempre del que adquiere el vehículo." } },
      { "@type": "Question", "name": "¿Qué es el 'valor fiscal' y dónde lo encuentro?", "acceptedAnswer": { "@type": "Answer", "text": "Es el valor que Hacienda le asignó al modelo cuando era nuevo. Debes consultarlo en las tablas de valoración de vehículos que el Gobierno publica cada año en el BOE. Busca la orden con el título 'por la que se aprueban los precios medios de venta aplicables en la gestión del ITP'." } },
      { "@type": "Question", "name": "¿Qué es una 'reserva de dominio' y por qué es peligrosa?", "acceptedAnswer": { "@type": "Answer", "text": "Es una cláusula que las financieras incluyen al financiar un coche. Significa que la financiera es la propietaria legal hasta que se pague el préstamo. Si compras un coche con reserva de dominio, la DGT no te permitirá transferirlo a tu nombre. Es crucial cancelarla antes de iniciar el trámite." } }
    ]
  }
} as const;

// Alias utili
type Comunidad = keyof typeof calculatorData.data.itp_comunidades;

// --- Definizione del componente grafico per l'importazione dinamica ---
const CostPieChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const COLORS = ['#3b82f6', '#9ca3af']; // Blue, Gray
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip
          formatter={(value: number, name: string) => [
            new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value),
            name
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// --- Importazione dinamica del componente grafico ---
const DynamicCostPieChart = dynamic(() => Promise.resolve(CostPieChart), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg">
      <p>Cargando gráfico...</p>
    </div>
  ),
});

const CalculadoraCosteTransferenciaVehiculo: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema, data } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const currentYear = new Date().getFullYear();
  const initialStates = {
    comunidad_autonoma: "Madrid" as Comunidad,
    valor_fiscal_original: 20000,
    ano_matriculacion: currentYear - 5,
    tipo_vehiculo: "Turismo (Coche)",
  };
  const [states, setStates] = useState<Record<string, any>>(initialStates);

  const handleStateChange = useCallback((id: string, value: any) => {
    setStates(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setStates(initialStates);
  }, [currentYear]); // currentYear stabile su mount

  const calculatedOutputs = useMemo(() => {
    const comunidad = (states.comunidad_autonoma || initialStates.comunidad_autonoma) as Comunidad;
    const valor_fiscal_original = Number(states.valor_fiscal_original) || 0;
    const ano_matriculacion = Number(states.ano_matriculacion) || currentYear;
    const tipo_vehiculo = String(states.tipo_vehiculo || initialStates.tipo_vehiculo);

    const years = Math.max(0, currentYear - ano_matriculacion);

    // Array readonly, nessun cast a mutabile
    const depRows = data.coeficientes_depreciacion; // DepTable
    const coef_depreciacion = depRows.find(r => years <= r.anos)?.coeficiente ?? 0.10;

    const valor_depreciado = valor_fiscal_original * coef_depreciacion;

    const itp_rate = calculatorData.data.itp_comunidades[comunidad] / 100;
    const coste_itp = valor_depreciado * itp_rate;

    const tasa_dgt = tipo_vehiculo === 'Motocicleta' ? data.tasa_dgt_moto : data.tasa_dgt_coche;
    const coste_total_transferencia = coste_itp + tasa_dgt;

    return { valor_depreciado, coste_itp, tasa_dgt, coste_total_transferencia };
  }, [states, data, currentYear]);

  const chartData = useMemo(() => ([
    { name: 'Impuesto (ITP)', value: calculatedOutputs.coste_itp },
    { name: 'Tasa DGT', value: calculatedOutputs.tasa_dgt },
  ]), [calculatedOutputs]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error al exportar a PDF.");
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
      localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
      alert("Resultado guardado localmente.");
    } catch {
      alert("No se pudo guardar el resultado.");
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <CalculatorSeoSchema schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">Calcula de forma transparente el coste total de impuestos y tasas para el cambio de nombre de un vehículo.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => {
                  if (input.type === 'select') {
                    return (
                      <div key={input.id}>
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                          {input.label}
                          <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                        </label>
                        <select
                          id={input.id}
                          name={input.id}
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-8"
                        >
                          {input.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  }
                  // numero
                  const hasMin = 'min' in input;
                  const hasMax = 'max' in input;
                  const hasStep = 'step' in input;
                  return (
                    <div key={input.id}>
                      <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                        {input.label}
                        <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                          {('unit' in input && input.unit === '€') ? '€' : ''}
                        </span>
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-7 pr-3 text-right"
                          type="number"
                          {...(hasMin ? { min: (input as any).min } : {})}
                          {...(hasMax ? { max: (input as any).max } : {})}
                          {...(hasStep ? { step: (input as any).step } : {})}
                          value={states[input.id]}
                          onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Desglose de Costes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {outputs.map(output => (
                      <div
                        key={output.id}
                        className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'coste_total_transferencia' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                      >
                        <div className="text-sm font-medium text-gray-700">{output.label}</div>
                        <div className={`text-lg font-bold ${output.id === 'coste_total_transferencia' ? 'text-blue-600' : 'text-gray-800'}`}>
                          <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center items-center">
                    <h3 className="text-base font-medium text-gray-700 mb-2">Composición del Coste Total</h3>
                    <div className="h-48 w-full">
                      <DynamicCostPieChart data={chartData} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={saveResult} className="border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
                <button onClick={handleExportPDF} className="border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
                <button onClick={handleReset} className="border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Resetear</button>
              </div>

            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía del Proceso</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.dgt.es/nuestros-servicios/vehiculos/transferencia-de-vehiculos/cambio-de-titularidad-de-un-vehiculo/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">DGT - Cambio de Titularidad de un Vehículo</a></li>
              <li><a href="https://www.boe.es/biblioteca_juridica/codigos/codigo.php?id=015_Impuesto_sobre_Transmisiones_Patrimoniales_y_Actos_Juridicos_Documentados" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">BOE - Ley del ITP y AJD</a></li>
              <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-practico-impuestos-especiales-medioambientales/anexo-iv-valoracion-vehiculos-usados.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria - Valoración de Vehículos Usados</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraCosteTransferenciaVehiculo;
