'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Dynamic import (build-safe) del grafico ---
const ChartLoader = () => (
  <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-500">
    Cargando gráfico...
  </div>
);

const DistributionPie = dynamic(
  () =>
    import('recharts').then(mod => {
      const PieComponent = ({
        data,
        colors,
        formatCurrency,
      }: {
        data: Array<{ name: string; value: number }>;
        colors: string[];
        formatCurrency: (v: number) => string;
      }) => (
        <mod.ResponsiveContainer width="100%" height="100%">
          <mod.PieChart>
            <mod.Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, i) => (
                <mod.Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </mod.Pie>
            <mod.Tooltip formatter={(v: number) => formatCurrency(v)} />
            <mod.Legend />
          </mod.PieChart>
        </mod.ResponsiveContainer>
      );
      return PieComponent;
    }),
  { ssr: false, loading: () => <ChartLoader /> }
);

// --- Metadati componente ---
export const meta = {
  title: 'Calculadora de Impuestos sobre Plusvalías en Criptomonedas',
  description:
    'Calcula los impuestos (IRPF) por la venta de Bitcoin y otras criptomonedas en España usando el método FIFO. Estima tu plusvalía y la tasa a pagar.',
};

// --- Tipi ---
type Compra = { id: number; cantidad: string; precio_compra: string };

// --- Helper Components ---
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

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const FaqSchema = ({ schema }: { schema: any }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="text-sm bg-gray-200 text-red-600 rounded px-1 py-0.5">$1</code>');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### '))
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace('### ', '')) }}
            />
          );
        if (/^\d\.\s/.test(trimmedBlock)) {
          const items = trimmedBlock.split('\n');
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\d\.\s*/, '')) }} />
              ))}
            </ol>
          );
        }
        if (trimmedBlock.startsWith('*')) {
          const items = trimmedBlock.split('\n');
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />
              ))}
            </ul>
          );
        }
        if (trimmedBlock)
          return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        return null;
      })}
    </div>
  );
};

// --- Dati self-contained ---
const calculatorData = {
  slug: 'calculadora-impuestos-criptomonedas',
  category: 'Finanzas Personales e Inversiones',
  title: 'Calculadora de Impuestos sobre Plusvalías en Criptomonedas',
  lang: 'es',
  outputs: [
    { id: 'ganancia_patrimonial', label: 'Ganancia Patrimonial (Plusvalía)', unit: '€' },
    { id: 'impuestos_a_pagar', label: 'IMPUESTOS A PAGAR (ESTIMACIÓN IRPF)', unit: '€', isPrimary: true },
    { id: 'valor_neto_venta', label: 'Dinero neto recibido (tras impuestos)', unit: '€' },
    { id: 'coste_adquisicion_aplicado', label: 'Coste de adquisición (según FIFO)', unit: '€' },
  ],
  content: '...',
  seoSchema: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Tengo que declarar mis criptomonedas si no las he vendido?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No, mientras mantengas tus criptomonedas (HODL), no se genera ninguna ganancia o pérdida, por lo que no hay nada que incluir en tu declaración de la renta. La obligación nace cuando las vendes, las permutas por otra cripto, o las usas para comprar un bien o servicio.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué pasa si tengo pérdidas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Si el resultado de la venta es una pérdida patrimonial, no pagas impuestos. Además, puedes utilizar esa pérdida para compensarla con otras ganancias patrimoniales del mismo año o de los 4 siguientes.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Se pueden deducir las comisiones (fees) de las operaciones?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Sí. Las comisiones de compra se suman al valor de adquisición y las de venta se restan del valor de transmisión, reduciendo la ganancia final.',
        },
      },
    ],
  },
} as const;

// Contenuto descrittivo (come nel tuo messaggio)
;(calculatorData as any).content = `### Introducción

La declaración de ganancias obtenidas con criptomonedas...
(usa aquí el mismo contenido largo que ya tenías)
`;

// --- Utils numerici ---
const toNum = (v: string) => {
  // supporta "0,5" e "0.5"
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

// --- Componente principale ---
const CalculadoraImpuestosCriptomonedas: React.FC = () => {
  const { slug, title, outputs, content, seoSchema } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [compras, setCompras] = useState<Compra[]>([
    { id: Date.now(), cantidad: '1', precio_compra: '20000' },
  ]);
  const [venta, setVenta] = useState({ cantidad_vendida: '0.5', precio_venta: '40000' });

  const handleCompraChange = (id: number, field: keyof Omit<Compra, 'id'>, value: string) => {
    setCompras(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };
  const addCompra = () =>
    setCompras(prev => [...prev, { id: Date.now() + Math.random(), cantidad: '', precio_compra: '' }]);
  const removeCompra = (id: number) => setCompras(prev => prev.filter(c => c.id !== id));

  const handleVentaChange = (field: keyof typeof venta, value: string) => {
    setVenta(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setCompras([{ id: Date.now(), cantidad: '1', precio_compra: '20000' }]);
    setVenta({ cantidad_vendida: '0.5', precio_venta: '40000' });
  };

  const calculated = useMemo(() => {
    const comprasParsed = compras
      .map(c => ({ cantidad: toNum(c.cantidad), precio_compra: toNum(c.precio_compra) }))
      .filter(c => c.cantidad > 0 && c.precio_compra >= 0);

    const cantidadVendida = toNum(venta.cantidad_vendida);
    const precioVenta = toNum(venta.precio_venta);

    if (cantidadVendida <= 0 || precioVenta <= 0) {
      return {
        ganancia_patrimonial: 0,
        impuestos_a_pagar: 0,
        valor_neto_venta: 0,
        coste_adquisicion_aplicado: 0,
        error: '',
      };
    }

    const totalHoldings = comprasParsed.reduce((s, c) => s + c.cantidad, 0);
    if (cantidadVendida - totalHoldings > 1e-12) {
      // oversell: vendo più di quanto possiedo
      return {
        ganancia_patrimonial: 0,
        impuestos_a_pagar: 0,
        valor_neto_venta: 0,
        coste_adquisicion_aplicado: 0,
        error:
          'La cantidad vendida excede tus existencias totales (FIFO). Ajusta las compras o reduce la cantidad a vender.',
      };
    }

    // Valor de venta total
    const valorVentaTotal = cantidadVendida * precioVenta;

    // FIFO: consumiamo le compras in ordine dato (debe ser cronológico)
    let coste_adquisicion_aplicado = 0;
    let restante = cantidadVendida;
    for (const compra of comprasParsed) {
      if (restante <= 0) break;
      const usar = Math.min(restante, compra.cantidad);
      coste_adquisicion_aplicado += usar * compra.precio_compra;
      restante -= usar;
    }

    const ganancia_patrimonial = valorVentaTotal - coste_adquisicion_aplicado;

    // IRPF Base del Ahorro (tramos 19/21/23/27/28 con anchos: 6k/44k/150k/100k/resto)
    let impuestos_a_pagar = 0;
    if (ganancia_patrimonial > 0) {
      let base = ganancia_patrimonial;
      const brackets = [
        { span: 6_000, rate: 0.19 },
        { span: 44_000, rate: 0.21 }, // hasta 50k
        { span: 150_000, rate: 0.23 }, // hasta 200k
        { span: 100_000, rate: 0.27 }, // hasta 300k
        { span: Infinity, rate: 0.28 },
      ];
      for (const b of brackets) {
        if (base <= 0) break;
        const take = Math.min(base, b.span);
        impuestos_a_pagar += take * b.rate;
        base -= take;
      }
    }

    const valor_neto_venta = valorVentaTotal - impuestos_a_pagar;

    return {
      ganancia_patrimonial,
      impuestos_a_pagar,
      valor_neto_venta,
      coste_adquisicion_aplicado,
      error: '',
    };
  }, [compras, venta]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);

  const chartData = useMemo(() => {
    if (calculated.ganancia_patrimonial <= 0) return [];
    return [
      { name: 'Coste de Adquisición', value: calculated.coste_adquisicion_aplicado },
      { name: 'Ganancia Neta', value: calculated.ganancia_patrimonial - calculated.impuestos_a_pagar },
      { name: 'Impuestos', value: calculated.impuestos_a_pagar },
    ];
  }, [calculated]);

  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

  const handleExportPDF = useCallback(async () => {
    if (!calculatorRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', putOnlyUsedFonts: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (e) {
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const handleSaveResult = useCallback(() => {
    try {
      const payload = { slug, title, inputs: { compras, venta }, outputs: calculated, ts: Date.now() };
      const saved = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...saved].slice(0, 10)));
      alert('Resultado guardado en el almacenamiento local.');
    } catch (e) {
      alert('No se pudo guardar el resultado.');
    }
  }, [compras, venta, calculated, slug, title]);

  return (
    <>
      <FaqSchema schema={calculatorData.seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calculatorRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6">{meta.description}</p>

            {/* --- INPUTS --- */}
            <div className="space-y-6">
              {/* Compras */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <label className="block text-lg font-semibold mb-3 text-gray-700">
                  🛒 Operaciones de Compra (FIFO)
                </label>
                <div className="space-y-3">
                  {compras.map((compra, index) => (
                    <div key={compra.id} className="grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-1 text-sm font-medium text-gray-500 text-center">
                        {index + 1}.
                      </span>
                      <div className="col-span-5">
                        <label className="text-xs text-gray-500">Cantidad</label>
                        <input
                          type="number"
                          placeholder="Ej: 0.5"
                          value={compra.cantidad}
                          onChange={e => handleCompraChange(compra.id, 'cantidad', e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="text-xs text-gray-500">Precio/unidad (€)</label>
                        <input
                          type="number"
                          placeholder="Ej: 30000"
                          value={compra.precio_compra}
                          onChange={e =>
                            handleCompraChange(compra.id, 'precio_compra', e.target.value)
                          }
                          className="w-full border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div className="col-span-1">
                        {compras.length > 1 && (
                          <button
                            onClick={() => removeCompra(compra.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addCompra}
                  className="mt-4 w-full text-sm text-indigo-600 font-semibold border-2 border-dashed border-indigo-200 rounded-md py-2 hover:bg-indigo-50 transition-colors"
                >
                  + Añadir Compra
                </button>
              </div>

              {/* Venta */}
              <div className="p-4 bg-sky-50 rounded-lg">
                <label className="block text-lg font-semibold mb-3 text-gray-700">
                  💸 Operación de Venta
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cantidad Vendida</label>
                    <input
                      type="text"
                      placeholder="Ej: 1.25"
                      value={venta.cantidad_vendida}
                      onChange={e => handleVentaChange('cantidad_vendida', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Precio Venta/unidad (€)</label>
                    <input
                      type="text"
                      placeholder="Ej: 50000"
                      value={venta.precio_venta}
                      onChange={e => handleVentaChange('precio_venta', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Warning oversell */}
            {calculated.error && (
              <div className="mt-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
                <strong>Atención:</strong> {calculated.error}
              </div>
            )}

            {/* --- OUTPUTS --- */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 Resultados Fiscales</h2>
              <div className="space-y-3">
                {calculatorData.outputs.map(output => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between p-4 rounded-lg ${
                      (output as any).isPrimary
                        ? 'bg-red-50 border-l-4 border-red-500'
                        : 'bg-gray-50 border-l-4 border-gray-300'
                    }`}
                  >
                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                    <div
                      className={`text-xl md:text-2xl font-bold ${
                        (output as any).isPrimary ? 'text-red-600' : 'text-gray-800'
                      }`}
                    >
                      <span>{isClient ? formatCurrency((calculated as any)[output.id]) : '...'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {calculated.ganancia_patrimonial > 0 && !calculated.error && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose del Valor de Venta</h3>
              <div className="h-64 w-full">
                {isClient && (
                  <DistributionPie
                    data={[
                      { name: 'Coste de Adquisición', value: calculated.coste_adquisicion_aplicado },
                      { name: 'Ganancia Neta', value: calculated.ganancia_patrimonial - calculated.impuestos_a_pagar },
                      { name: 'Impuestos', value: calculated.impuestos_a_pagar },
                    ]}
                    colors={['#0088FE', '#00C49F', '#FF8042']}
                    formatCurrency={formatCurrency}
                  />
                )}
              </div>
            </div>
          )}
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleSaveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                💾 Guardar Resultado
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                📄 Exportar a PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors"
              >
                🔄 Resetear Calculadora
              </button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guía de Comprensión</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fuentes y Referencias Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/capitulo-11-ganancias-perdidas-patrimoniales/imputacion-temporal/operaciones-a-plazos-o-precio-aplazado/criterios-generales.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Ganancias Patrimoniales
                </a>
              </li>
              <li>
                <a
                  href="https://www.boe.es/buscar/doc.php?id=BOE-A-2021-21352"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Ley 11/2021 (Fraude fiscal)
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraImpuestosCriptomonedas;
