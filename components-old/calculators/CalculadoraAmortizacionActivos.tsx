'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// ---------- Helpers ----------
type NumInput = {
  id: string; label: string; type: 'number'|'select'; unit?: string;
  min?: number; max?: number; step?: number; tooltip: string;
  options?: {value:string;label:string}[];
};
type States = { [k: string]: number | string };

const euro = (v: number) => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v);
const toNum = (v: number|string, def=0) => (v=== '' || v===null || v===undefined) ? def : (Number.isFinite(Number(v)) ? Number(v) : def);
const clamp = (n:number, min?:number, max?:number) => typeof min==='number' && n<min ? min : (typeof max==='number' && n>max ? max : n);
const round2 = (n:number) => Math.round((n + Number.EPSILON) * 100) / 100;

// ---------- Static Data ----------
const calculatorData = {
  slug: 'calculadora-amortizacion-activos',
  category: 'Bienes Raíces y Vivienda',
  title: 'Calculadora de Amortización de Activos para empresas',
  lang: 'es',
  description: 'Simula la amortización de un activo con los métodos lineal, decreciente y suma de dígitos. Genera la tabla y visualiza la depreciación.',
  inputs: [
    { id:'valorActivo', label:'Coste de Adquisición del Activo', type:'number' as const, unit:'€', min:0, step:100, tooltip:'Coste total del bien.' },
    { id:'valorResidual', label:'Valor Residual', type:'number' as const, unit:'€', min:0, step:100, tooltip:'Valor estimado al final de la vida útil.' },
    { id:'vidaUtil', label:'Vida Útil del Activo', type:'number' as const, unit:'años', min:1, max:50, step:1, tooltip:'Años de uso previsto.' },
    { id:'metodoAmortizacion', label:'Método de Amortización', type:'select' as const, options:[
      {value:'lineal',label:'Lineal o de Cuotas Fijas'},
      {value:'decreciente',label:'Decreciente sobre Saldo'},
      {value:'digitos',label:'Suma de Dígitos (decreciente)'}
    ], tooltip:'Método contable.' }
  ] as NumInput[],
  tableHeaders: ['Año','Cuota de Amortización','Amortización Acumulada','Valor Neto Contable'],
  content: `### Introducción
... (tu testo originale, omesso qui per brevità) ...`,
  seoSchema: { "@context":"https://schema.org","@type":"FAQPage","mainEntity":[ /* ... */ ] }
};

// ---------- Chart (client-only, no SSR) ----------
const DynamicLineChart = dynamic(
  () => import('recharts').then(mod => {
    const { LineChart, Line, XAxis, YAxis, Tooltip:ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } = mod as any;
    const ChartComponent = ({ data }: { data: any[] }) => (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="año" />
          <YAxis tickFormatter={(v:number) => `€${Number(v/1000).toFixed(0)}k`} />
          <ChartTooltip formatter={(value:number) => euro(value)} />
          <Legend />
          <Line type="monotone" dataKey="Valor Neto Contable" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
    return ChartComponent;
  }),
  { ssr:false, loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-lg">Cargando gráfico...</div> }
);

// ---------- Lightweight Markdown renderer ----------
const ContentRenderer = ({ content }: { content: string }) => {
  const fmt = (t:string)=>t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/_(.*?)_/g,'<em>$1</em>');
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((b,i)=>{
        const t=b.trim();
        if(!t) return null;
        if(t.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{__html:fmt(t.slice(4))}}/>;
        if(t.startsWith('* ')) return <ul key={i} className="list-disc pl-5 space-y-2 mb-4">{t.split('\n').map((li,j)=><li key={j} dangerouslySetInnerHTML={{__html:fmt(li.replace(/^\*\s*/,''))}}/>)}</ul>;
        if(/^\d+\.\s/.test(t)) return <ol key={i} className="list-decimal pl-5 space-y-2 mb-4">{t.split('\n').map((li,j)=><li key={j} dangerouslySetInnerHTML={{__html:fmt(li.replace(/^\d+\.\s*/,''))}}/>)}</ol>;
        return <p key={i} className="mb-4" dangerouslySetInnerHTML={{__html:fmt(t)}}/>;
      })}
    </div>
  );
};
const FaqSchema = () => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />);

// ---------- Main ----------
const CalculadoraAmortizacionActivos: React.FC = () => {
  const { slug, title, description, inputs, tableHeaders, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(()=>{ setIsClient(true); },[]);

  const initialStates: States = { valorActivo: 20000, valorResidual: 2000, vidaUtil: 5, metodoAmortizacion: 'lineal' };
  const [states, setStates] = useState<States>(initialStates);

  const getCfg = (id:string) => (inputs as NumInput[]).find(i=>i.id===id);
  const handleStateChange = (id:string, value:any) => {
    const cfg = getCfg(id);
    if (cfg?.type === 'select') { setStates(p=>({...p,[id]:String(value)})); return; }
    if (value === '') { setStates(p=>({...p,[id]:''})); return; }
    const n = clamp(toNum(value,0), cfg?.min, cfg?.max);
    setStates(p=>({...p,[id]:n}));
  };
  const handleReset = () => setStates(initialStates);

  type Row = { año:number; cuota:number; acumulada:number; neto:number };

  const amortizationTable: Row[] = useMemo(() => {
    const valorActivo = toNum(states.valorActivo,0);
    const valorResidual = toNum(states.valorResidual,0);
    const vidaUtil = Math.max(1, Math.floor(toNum(states.vidaUtil,1)));
    const metodo = String(states.metodoAmortizacion || 'lineal') as 'lineal'|'decreciente'|'digitos';

    if (valorActivo < 0 || valorResidual < 0 || valorActivo < valorResidual) return [];
    const base = valorActivo - valorResidual;
    const table: Row[] = [{ año:0, cuota:0, acumulada:0, neto: round2(valorActivo) }];

    if (base === 0) return table; // nada que amortizar

    let acumulada = 0;

    if (metodo === 'lineal') {
      const cuota = round2(base / vidaUtil);
      for (let i=1;i<=vidaUtil;i++){
        // última cuota ajustada para cerrar al residual
        const restanteBase = round2(base - acumulada);
        const cuotaAnio = (i===vidaUtil) ? restanteBase : Math.min(cuota, restanteBase);
        acumulada = round2(acumulada + cuotaAnio);
        const neto = round2(valorActivo - acumulada);
        table.push({ año:i, cuota:cuotaAnio, acumulada, neto });
      }
      return table;
    }

    if (metodo === 'decreciente') {
      const tasaLineal = 1/vidaUtil;
      const coef = vidaUtil < 5 ? 1.5 : (vidaUtil < 8 ? 2 : 2.5);
      const tasa = tasaLineal * coef;
      let neto = valorActivo;

      for (let i=1;i<=vidaUtil;i++){
        let cuota = round2(neto * tasa);
        // Si excede, forzar cierre a residual
        if (round2(neto - cuota) < valorResidual) cuota = round2(neto - valorResidual);
        acumulada = round2(acumulada + cuota);
        neto = round2(neto - cuota);
        table.push({ año:i, cuota, acumulada, neto });
      }
      // Garantía final exacta
      const last = table[table.length-1];
      if (last && last.neto !== round2(valorResidual)) {
        const diff = round2(last.neto - valorResidual);
        last.cuota = round2(last.cuota + diff);
        last.acumulada = round2(last.acumulada + diff);
        last.neto = round2(valorResidual);
      }
      return table;
    }

    // método 'digitos'
    const sumDig = (vidaUtil*(vidaUtil+1))/2;
    for (let i=1;i<=vidaUtil;i++){
      const peso = (vidaUtil - i + 1)/sumDig;
      // última cuota ajustada
      const restanteBase = round2(base - acumulada);
      const cuota = (i===vidaUtil) ? restanteBase : round2(base * peso);
      acumulada = round2(acumulada + cuota);
      const neto = round2(valorActivo - acumulada);
      table.push({ año:i, cuota, acumulada, neto });
    }
    // corrección por redondeos
    const last = table[table.length-1];
    if (last && last.neto !== round2(valorResidual)) {
      const diff = round2(last.neto - valorResidual);
      last.cuota = round2(last.cuota + diff);
      last.acumulada = round2(last.acumulada + diff);
      last.neto = round2(valorResidual);
    }
    return table;
  }, [states]);

  // ----- Export / Save -----
  const handleExportPDF = useCallback(async ()=>{
    try{
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current,{ scale:2, backgroundColor:'#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation:'p', unit:'px', format:'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData,'PNG',0,0,w,h);
      pdf.save(`${calculatorData.slug}.pdf`);
    }catch(e){ alert('Error al generar el PDF.'); }
  },[]);

  const handleSaveResult = useCallback(()=>{
    try{
      const payload = { slug: calculatorData.slug, title: calculatorData.title, inputs: states, outputs: { amortizationTable }, ts: Date.now() };
      const prev = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...prev].slice(0,50)));
      alert('Resultado guardado correctamente.');
    }catch{ alert('No se pudo guardar el resultado.'); }
  },[states, amortizationTable]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{calculatorData.title}</h1>
            <p className="text-gray-600 mb-6">{calculatorData.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-slate-50 p-6 rounded-lg">
              {calculatorData.inputs.map(input=>(
                <div key={input.id} className={input.id==='metodoAmortizacion' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium mb-1 text-gray-700">{input.label}</label>
                  {input.type==='select' ? (
                    <select
                      id={input.id}
                      value={String(states[input.id]??'')}
                      onChange={e=>handleStateChange(input.id, e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    >
                      {input.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        id={input.id}
                        type="number"
                        min={input.min} max={input.max} step={input.step}
                        value={String(states[input.id] ?? '')}
                        onChange={e=>handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      />
                      {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  )}
                  {input.tooltip && <p className="text-xs text-gray-500 mt-1">{input.tooltip}</p>}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Tabla de Amortización</h2>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full text-sm text-left text-gray-500">
                  <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                    <tr>{calculatorData.tableHeaders.map(h=> <th key={h} className="px-6 py-3">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {isClient && amortizationTable.map((r,i)=>(
                      <tr key={i} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{r.año}</td>
                        <td className="px-6 py-4">{euro(r.cuota)}</td>
                        <td className="px-6 py-4">{euro(r.acumulada)}</td>
                        <td className="px-6 py-4 font-bold">{euro(r.neto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Evolución del Valor Neto Contable</h3>
              {isClient && <DynamicLineChart data={amortizationTable.map(r=>({ ...r, 'Valor Neto Contable': r.neto }))} />}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Guardar</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Exportar PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full text-sm border border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">Resetear</button>
            </div>
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Análisis y Metodología</h2>
            <ContentRenderer content={calculatorData.content}/>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraAmortizacionActivos;
