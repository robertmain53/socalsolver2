'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

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
    // eslint-disable-next-line react/no-danger
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
        if (!trimmedBlock) return null;
        if (trimmedBlock.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(4)) }} />;
        }
        if (trimmedBlock.startsWith('#### ')) {
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.substring(5)) }} />;
        }
        if (trimmedBlock.startsWith('* ')) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
          return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        if (/^\d+\.\s/.test(trimmedBlock)) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d+\.\s*/, ''));
          return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
        }
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
      })}
    </div>
  );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "calculadora-ivtm",
  "category": "Bienes Raíces y Vivienda",
  "title": "Calculadora del Impuesto de Circulación (IVTM) por municipio",
  "lang": "es",
  "data": {
    "turismos_tarifas_base": [
      { "max_cvf": 7.99, "cuota": 12.62 },
      { "max_cvf": 11.99, "cuota": 34.08 },
      { "max_cvf": 15.99, "cuota": 71.94 },
      { "max_cvf": 19.99, "cuota": 107.81 },
      { "max_cvf": Infinity, "cuota": 134.71 }
    ],
    "motos_tarifas_base": [
      { "max_cc": 125, "cuota": 4.55 },
      { "max_cc": 250, "cuota": 7.78 },
      { "max_cc": 500, "cuota": 15.58 },
      { "max_cc": 1000, "cuota": 31.11 },
      { "max_cc": Infinity, "cuota": 62.21 }
    ],
    "municipios": [
      { "nombre": "Madrid", "coeficiente": 2.00 },
      { "nombre": "Barcelona", "coeficiente": 2.00 },
      { "nombre": "Valencia", "coeficiente": 1.94 },
      { "nombre": "Sevilla", "coeficiente": 2.00 },
      { "nombre": "Zaragoza", "coeficiente": 2.00 },
      { "nombre": "Málaga", "coeficiente": 1.99 },
      { "nombre": "Palma de Mallorca", "coeficiente": 2.00 },
      { "nombre": "Bilbao", "coeficiente": 1.90 },
      { "nombre": "Alicante", "coeficiente": 1.80 },
      { "nombre": "Murcia", "coeficiente": 1.98 }
    ]
  },
  "inputs": [
    { "id": "municipio", "label": "Municipio de Residencia", "type": "select", "options": ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Palma de Mallorca", "Bilbao", "Alicante", "Murcia"], "tooltip": "Selecciona el municipio donde el vehículo está registrado. El impuesto varía significativamente entre ayuntamientos." },
    { "id": "tipo_vehiculo", "label": "Tipo de Vehículo", "type": "select", "options": ["Turismo", "Motocicleta"], "tooltip": "El tipo de vehículo determina la tabla de tarifas base que se aplica." },
    { "id": "potencia_fiscal_cvf", "label": "Potencia Fiscal", "type": "number", "unit": "CVF", "min": 0, "step": 0.1, "condition": "tipo_vehiculo == 'Turismo'", "tooltip": "Encuentra este valor en la Ficha Técnica (Tarjeta ITV) de tu coche. No son los CV de potencia del motor." },
    { "id": "cilindrada_cc", "label": "Cilindrada", "type": "number", "unit": "cc", "min": 0, "step": 1, "condition": "tipo_vehiculo == 'Motocicleta'", "tooltip": "Encuentra la cilindrada en la Ficha Técnica (Tarjeta ITV) de tu motocicleta." }
  ],
  "outputs": [
    { "id": "cuota_base", "label": "Cuota Base Estatal", "unit": "€" },
    { "id": "coeficiente_municipal", "label": "Coeficiente del Municipio", "unit": "x" },
    { "id": "impuesto_final", "label": "Impuesto de Circulación (IVTM) a Pagar", "unit": "€" }
  ],
  "formulaSteps": [
    { "step": 1, "description": "Identificar la cuota base estatal según la potencia fiscal (CVF) o cilindrada (cc) del vehículo, según lo estipulado en el RDL 2/2004." },
    { "step": 2, "description": "Obtener el coeficiente multiplicador aprobado por la ordenanza fiscal del municipio seleccionado. Este coeficiente puede ir de 1 a 2." },
    { "step": 3, "description": "Calcular el impuesto final.", "formula": "IVTM = Cuota Base Estatal × Coeficiente Municipal" }
  ],
  "examples": [
    { "name": "Coche compacto en Madrid", "inputs": { "municipio": "Madrid", "tipo_vehiculo": "Turismo", "potencia_fiscal_cvf": 11.5, "cilindrada_cc": 0 }, "outputs": { "impuesto_final": 68.16 } },
    { "name": "Motocicleta media en Valencia", "inputs": { "municipio": "Valencia", "tipo_vehiculo": "Motocicleta", "potencia_fiscal_cvf": 0, "cilindrada_cc": 600 }, "outputs": { "impuesto_final": 60.35 } }
  ],
  "tags": "calculadora impuesto de circulación, IVTM, sello del coche, impuesto municipal vehículo, potencia fiscal, ayuntamiento, Madrid, Barcelona, Valencia, España",
  "content": "### Introducción\n\nEl Impuesto sobre Vehículos de Tracción Mecánica (IVTM), comúnmente conocido como el **'sello' o impuesto de circulación**, es un tributo anual obligatorio que todos los propietarios de vehículos deben pagar a su ayuntamiento. Su coste varía drásticamente dependiendo de dos factores clave: las características de tu vehículo y, sobre todo, el municipio donde esté registrado. Esta calculadora te permite estimar de forma precisa y rápida el importe anual del IVTM para los principales municipios de España.\n\n### Guida all'Uso del Calcolatore\n\n* **Municipio de Residencia**: Elige el ayuntamiento en el que tu vehículo está dado de alta. Es el factor que más influye en el precio final.\n* **Tipo de Vehículo**: Selecciona si tu vehículo es un turismo (coche) o una motocicleta, ya que las tablas de cálculo son diferentes.\n* **Potencia Fiscal (CVF)** para coches: Este es un valor fiscal, **no son los caballos de vapor (CV) del motor**. Lo encontrarás en la Ficha Técnica de tu vehículo (Tarjeta de ITV) bajo el epígrafe \"Potencia Fiscal (C.V.F.)\".\n* **Cilindrada (cc)** para motos: Corresponde a la cilindrada del motor, que también figura en la Ficha Técnica.\n\n### Metodologia di Calcolo Spiegata\n\nEl cálculo del IVTM es un proceso de dos pasos regulado por ley a nivel nacional y municipal:\n\n1.  **Cuota Base Estatal**: El gobierno central, a través del Real Decreto Legislativo 2/2004, establece unas tarifas mínimas para toda España. Estas tarifas se organizan en tramos según la potencia fiscal (para coches) o la cilindrada (para motos). Nuestra calculadora identifica automáticamente en qué tramo se encuentra tu vehículo.\n2.  **Coeficiente Municipal**: La ley permite a cada ayuntamiento aplicar un coeficiente multiplicador sobre esa cuota base, con un máximo de 2. La mayoría de las grandes capitales aplican el coeficiente máximo o uno muy cercano para aumentar su recaudación. Nuestra herramienta contiene los coeficientes actualizados de los principales municipios.\n\nLa fórmula final es sencilla: **IVTM a Pagar = Cuota Base Estatal × Coeficiente del Municipio**.\n\n### Analisi Approfondita: De la Potencia Fiscal a las Bonificaciones\n\n**¿Qué es exactamente la Potencia Fiscal (CVF)?**\nEs una fórmula matemática que no tiene una relación directa con la potencia real del motor (CV o kW). Su único propósito es fiscal. La fórmula, definida en el Anexo V del Reglamento General de Vehículos, es:\n* **Motores de 4 tiempos (gasolina/diésel):** `CVF = 0,08 × (0,785 × D² × R)^0,6 × N`\n* **Motores eléctricos:** `CVF = Pe / 5,152`\nDonde `D` es el diámetro del cilindro, `R` la carrera del pistón, `N` el número de cilindros y `Pe` la potencia efectiva en kW.\n\nNo necesitas calcular esto; el valor siempre viene dado en la documentación del vehículo. Sin embargo, entenderlo aclara por qué coches con potencias muy diferentes pueden tener una potencia fiscal similar.\n\n**Bonificaciones y Exenciones: ¡Puedes Ahorrar Dinero!**\nMuchos ayuntamientos ofrecen importantes descuentos para incentivar una movilidad más sostenible. ¡Comprueba la ordenanza fiscal de tu municipio! Las bonificaciones más comunes son:\n* **Vehículos CERO y ECO**: Descuentos de **hasta el 75%** en la cuota del IVTM durante los primeros años para vehículos eléctricos, híbridos o que usan combustibles limpios. Esta es la bonificación más extendida.\n* **Vehículos Históricos**: Exención del **100%** para vehículos con matrícula histórica o con más de 25-30 años de antigüedad (según el municipio), siempre que cumplan ciertos requisitos.\n* **Personas con Movilidad Reducida**: Exención del **100%** para vehículos matriculados a nombre de personas con un grado de discapacidad reconocido igual o superior al 33%.\n\nNuestra calculadora te da el importe bruto. Si crees que puedes acogerte a una bonificación, contacta con tu ayuntamiento para solicitarla.\n\n### Domande Frequenti (FAQ)\n\n* **¿Dónde encuentro la potencia fiscal (CVF) o la cilindrada de mi vehículo?**\n    Ambos datos figuran de forma clara en la **Ficha Técnica** del vehículo (también llamada Tarjeta de ITV). La potencia fiscal también suele aparecer en el **Permiso de Circulación**.\n\n* **¿Quién está obligado a pagar el IVTM?**\n    El titular del vehículo a fecha de **1 de enero** del año en curso. Aunque vendas el coche el 2 de enero, legalmente te corresponde a ti pagar el impuesto de todo ese año, a no ser que pactes lo contrario con el comprador.\n\n* **¿Qué ocurre si no pago el impuesto de circulación?**\n    El ayuntamiento iniciará un procedimiento de recaudación ejecutiva. Esto implica recargos, intereses de demora y, en última instancia, puede llevar al embargo de tus cuentas bancarias o incluso del propio vehículo. Además, no podrás realizar trámites como la venta del vehículo si el IVTM no está al día.",
  "seoSchema": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "¿Dónde encuentro la potencia fiscal (CVF) o la cilindrada de mi vehículo?", "acceptedAnswer": { "@type": "Answer", "text": "Ambos datos figuran de forma clara en la Ficha Técnica del vehículo (también llamada Tarjeta de ITV). La potencia fiscal también suele aparecer en el Permiso de Circulación." } },
      { "@type": "Question", "name": "¿Quién está obligado a pagar el IVTM?", "acceptedAnswer": { "@type": "Answer", "text": "El titular del vehículo a fecha de 1 de enero del año en curso. Aunque vendas el coche el 2 de enero, legalmente te corresponde a ti pagar el impuesto de todo ese año, a no ser que pactes lo contrario con el comprador." } },
      { "@type": "Question", "name": "¿Qué ocurre si no pago el impuesto de circulación?", "acceptedAnswer": { "@type": "Answer", "text": "El ayuntamiento iniciará un procedimiento de recaudación ejecutiva. Esto implica recargos, intereses de demora y, en última instancia, puede llevar al embargo de tus cuentas bancarias o incluso del propio vehículo. Además, no podrás realizar trámites como la venta del vehículo si el IVTM no está al día." } }
    ]
  }
};

// --- Grafico: import lazy di Recharts (no import a livello modulo) ---
const ComparisonChart: React.FC<{ data: Array<{ municipio: string; impuesto: number }> }> = ({ data }) => {
  const [R, setR] = useState<any | null>(null);
  useEffect(() => {
    let mounted = true;
    import('recharts').then(mod => { if (mounted) setR(mod); });
    return () => { mounted = false; };
  }, []);

  if (!R) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg">
        <p>Cargando gráfico...</p>
      </div>
    );
  }

  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip: RTooltip, CartesianGrid } = R;

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v ?? 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(value: number) => fmtCurrency(value)} />
        <YAxis type="category" dataKey="municipio" width={110} interval={0} />
        <RTooltip formatter={(value: number) => fmtCurrency(value)} />
        <Bar dataKey="impuesto" name="IVTM" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const DynamicComparisonChart = dynamic(async () => ComparisonChart, {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg"><p>Cargando gráfico...</p></div>,
});

// --- Helpers ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number.isFinite(value) ? value : 0);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);

// Valuta "tipo_vehiculo == 'Turismo'" ecc.
const evaluateCondition = (expr: string, state: Record<string, unknown>): boolean => {
  const m = expr.match(/^(\w+)\s*([=!]=)\s*'([^']+)'$/);
  if (!m) return true;
  const [, key, op, val] = m;
  const cur = String(state[key]);
  return op === '==' ? cur === val : cur !== val;
};

const CalculadoraIvtm: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema, data } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = {
    municipio: "Madrid",
    tipo_vehiculo: "Turismo",
    potencia_fiscal_cvf: 11.5,
    cilindrada_cc: 249,
  };
  const [states, setStates] = useState<{ [key: string]: string | number }>(initialStates);

  const clampNum = (v: number, min = 0) => Number.isFinite(v) ? Math.max(min, v) : min;

  const handleStateChange = useCallback((id: string, value: any) => {
    let next: string | number = value;
    if (typeof initialStates[id as keyof typeof initialStates] === 'number') {
      next = clampNum(Number(value), 0);
      if (id === 'potencia_fiscal_cvf') next = Math.round((next as number) * 100) / 100;
      if (id === 'cilindrada_cc') next = Math.round(next as number);
    }
    setStates(prev => ({ ...prev, [id]: next }));
  }, []);

  const handleReset = useCallback(() => {
    setStates(initialStates);
  }, []);

  const calculatedOutputs = useMemo(() => {
    const municipio = String(states.municipio);
    const tipo_vehiculo = String(states.tipo_vehiculo);
    const potencia_fiscal_cvf = Number(states.potencia_fiscal_cvf);
    const cilindrada_cc = Number(states.cilindrada_cc);

    let cuota_base = 0;

    if (tipo_vehiculo === 'Turismo') {
      // IMPORTANTE: usare <= sul limite superiore di scaglione
      const tramo = data.turismos_tarifas_base.find(t => potencia_fiscal_cvf <= t.max_cvf);
      cuota_base = tramo?.cuota ?? 0;
    } else {
      const tramo = data.motos_tarifas_base.find(t => cilindrada_cc <= t.max_cc);
      cuota_base = tramo?.cuota ?? 0;
    }

    const coeficiente_municipal = data.municipios.find(m => m.nombre === municipio)?.coeficiente ?? 1;
    const impuesto_final = cuota_base * coeficiente_municipal;

    return { cuota_base, coeficiente_municipal, impuesto_final };
  }, [states, data]);

  const comparisonChartData = useMemo(() => {
    const tipo_vehiculo = String(states.tipo_vehiculo);
    const potencia_fiscal_cvf = Number(states.potencia_fiscal_cvf);
    const cilindrada_cc = Number(states.cilindrada_cc);

    let cuota_base = 0;
    if (tipo_vehiculo === 'Turismo') {
      const tramo = data.turismos_tarifas_base.find(t => potencia_fiscal_cvf <= t.max_cvf);
      cuota_base = tramo?.cuota ?? 0;
    } else {
      const tramo = data.motos_tarifas_base.find(t => cilindrada_cc <= t.max_cc);
      cuota_base = tramo?.cuota ?? 0;
    }

    return data.municipios
      .map(m => ({ municipio: m.nombre, impuesto: cuota_base * m.coeficiente }))
      .sort((a, b) => a.impuesto - b.impuesto);
  }, [states, data]);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { default: jsPDF } = await import("jspdf");
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) {
      // eslint-disable-next-line no-console
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
      <CalculatorSeoSchema schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{calculatorData.title}</h1>
              <p className="text-gray-600 mb-4">Estima cuánto pagarás por el 'sello' del coche o moto en las principales ciudades de España.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {calculatorData.inputs.map(input => {
                  const conditionMet = !input.condition || evaluateCondition(String(input.condition), states);
                  if (!conditionMet) return null;

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
                          value={String(states[input.id])}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-8"
                        >
                          {input.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={input.id}>
                      <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                        {input.label}
                        <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                      </label>
                      <div className="relative">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-10 text-right"
                          type="number"
                          min={input.min}
                          step={input.step}
                          value={Number(states[input.id])}
                          onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">{input.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Desglose del Impuesto</h2>
                {calculatorData.outputs.map(output => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'impuesto_final' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  >
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'impuesto_final' ? 'text-blue-600' : 'text-gray-800'}`}>
                      <span>
                        {isClient
                          ? (output.unit === '€'
                            ? formatCurrency((calculatedOutputs as any)[output.id])
                            : formatNumber((calculatedOutputs as any)[output.id]))
                          : '...'}
                      </span>
                      {output.unit !== '€' && <span className="text-sm font-normal text-gray-500 ml-1">{output.unit}</span>}
                    </div>
                  </div>
                ))}
                <div className="text-xs text-green-800 bg-green-50 border border-green-200 rounded-md p-3">
                  <strong>Nota sobre bonificaciones:</strong> Tu ayuntamiento puede ofrecer descuentos de hasta el 75% para vehículos ECO/CERO y del 100% para vehículos históricos. Este cálculo no los incluye.
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparativa de IVTM en otras ciudades</h3>
                <p className="text-sm text-gray-600 mb-2">Precio para un vehículo de las mismas características en los principales municipios.</p>
                <div className="h-96 w-full bg-gray-50 p-4 rounded-lg">
                  <DynamicComparisonChart data={comparisonChartData} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-2 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={saveResult} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
              <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Resetear</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía del IVTM</h2>
            <ContentRenderer content={calculatorData.content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Real Decreto Legislativo 2/2004, Haciendas Locales (Art. 92-99)</a></li>
              <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-1999-1826" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">RD 2822/1998, Reglamento General de Vehículos (Anexo V)</a></li>
              <li><a href="https://www.dgt.es/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Dirección General de Tráfico (DGT)</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIvtm;
