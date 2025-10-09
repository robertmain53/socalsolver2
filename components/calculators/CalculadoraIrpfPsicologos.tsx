'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

/* =========================
   Icone & Tooltip
========================= */

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

/* =========================
   Dati self-contained
========================= */

const calculatorData = {
  slug: 'calculadora-irpf-psicologos',
  category: 'Impuestos y trabajo autonomo',
  title: 'Calculadora de IRPF para psicólogos autónomos',
  lang: 'es',
  tags: 'calculadora irpf psicologo, impuestos psicologo, modelo 130, iva psicologia, exencion iva sanitaria, autonomo psicologia, colegio psicologos, gastos deducibles psicologo',
  inputs: [
    {
      id: 'ingresosTrimestrales',
      label: 'Ingresos trimestrales (sanitarios, exentos de IVA)',
      type: 'number' as const, unit: '€', min: 0, step: 100,
      tooltip: 'Introduce el total facturado por tus servicios sanitarios (terapia, diagnóstico, etc.), que están exentos de IVA.'
    },
    {
      id: 'gastosDeducibles',
      label: 'Gastos deducibles del trimestre',
      type: 'number' as const, unit: '€', min: 0, step: 50,
      tooltip: 'Suma los gastos de tu actividad: alquiler de consulta, cuota colegial, seguros, supervisión de casos, formación, etc.'
    },
    {
      id: 'porcentajeRetencion',
      label: 'Tipo de retención IRPF (si aplica)',
      type: 'select' as const,
      options: [{ value: 15, label: '15% (General)' }, { value: 7, label: '7% (Nuevos autónomos)' }],
      tooltip: 'Aplica retención solo si facturas a una empresa (consultoría de RRHH, clínica, mutua), no a pacientes particulares.'
    },
    {
      id: 'ingresosConRetencion',
      label: 'Ingresos con retención (de empresas)',
      type: 'number' as const, unit: '€', min: 0, step: 100,
      tooltip: 'Introduce aquí solo los ingresos de empresas o mutuas que te hayan practicado retención. Los ingresos de pacientes particulares son 0€ en este campo.'
    }
  ],
  outputs: [
    { id: 'rendimientoNeto', label: 'Rendimiento Neto (Beneficio)', unit: '€' },
    { id: 'pagoAdelantado20', label: 'Pago a cuenta (20% sobre beneficio)', unit: '€' },
    { id: 'retencionesPracticadas', label: 'Retenciones ya adelantadas (por empresas)', unit: '€' },
    { id: 'resultadoModelo130', label: 'Resultado a pagar (Modelo 130)', unit: '€' }
  ],
  content: `### Introduzione: Benessere Finanziario per la Tua Pratica

Come psicologo autonomo, il tuo focus è la salute mentale dei tuoi pazienti. La gestione fiscale, tuttavia, non dovrebbe aggiungere stress alla tua vita. Questa calcolatrice è stata creata specificamente per professionisti della psicologia in Spagna, aiutandoti a stimare il tuo pagamento trimestrale di IRPF (Modelo 130) con precisione e a comprendere le importanti sfumature fiscali della tua professione, come l'esenzione dall'IVA.

### Guida all'Uso del Calcolatore

Per una simulazione accurata del tuo trimestre, inserisci i seguenti dati:

* **Ingressi trimestrali (sanitari, esenti da IVA)**: Somma tutti gli incassi derivanti da servizi sanitari come terapie, diagnosi o valutazioni psicologiche. Questi servizi sono esenti da IVA.
* **Spese deducibili del trimestre**: Includi tutti i costi associati alla tua attività: affitto dello studio, quota del collegio professionale, assicurazioni, supervisione di casi, test psicometrici, ecc.
* **Tipo di ritenuta IRPF (se applicabile)**: La ritenuta si applica solo se fatturi a un'azienda (ad esempio, per servizi di psicologia organizzativa, formazione in un'azienda, o a una clinica). Non si applica ai pazienti privati.
* **Ingressi con ritenuta (da aziende)**: Indica qui solo gli ingressi provenienti da quelle aziende a cui hai applicato una ritenuta in fattura.

### Metodologia di Calcolo Spiegata

La calcolatrice stima il tuo pagamento frazionato di IRPF per il regime di **stima diretta**. L'obiettivo del Modelo 130 è anticipare ad Hacienda il **20% del tuo profitto** trimestrale, tenendo conto delle ritenute che ti sono già state applicate.

1.  **Calcolo del Profitto (Rendimento Netto)**: \`Ingressi - Spese Deducibili\`.
2.  **Calcolo del Pagamento Frazionato**: \`Profitto * 20%\`.
3.  **Sottrazione delle Ritenute**: Dall'importo precedente si sottraggono le ritenute IRPF che le aziende ti hanno già praticato.
4.  **Risultato Finale**: È la cifra da versare ad Hacienda. Un risultato negativo significa che hai anticipato più del dovuto e verrà regolarizzato nella tua dichiarazione dei redditi annuale.

### Analisi Approfondita: Fiscalità Essenziale per Psicologi

#### **L'Esenzione IVA (Art. 20 LIVA): Quando si Applica (e Quando No)**

Questa è la regola fiscale più importante per la tua professione. I servizi di psicologia sono considerati assistenza sanitaria e, pertanto, sono **esenti da IVA** quando il loro scopo è la diagnosi, la prevenzione o il trattamento di malattie.

* **Servizi Esenti (Senza IVA)**: Terapia individuale, di coppia o di gruppo; valutazione psicologica; neuropsicologia; redazione di referti clinici.
* **Servizi NON Esenti (con IVA al 21%)**: Attività che non hanno finalità sanitarie. Ad esempio: psicologia applicata alle risorse umane (selezione del personale), formazione in abilità non cliniche per aziende, coaching, perizie psicologiche per processi giudiziari (non clinici) o psicologia sportiva orientata al rendimento. Se svolgi entrambe le attività, dovrai emettere fatture con e senza IVA a seconda del servizio.

#### **Spese Deducibili Chiave per la Tua Pratica**

Ottimizzare le tue spese è fondamentale. Assicurati di includere:

* **Quota del Collegio Ufficiale degli Psicologi**: Deducibile al 100%.
* **Assicurazione di Responsabilità Civile**: Essenziale e completamente deducibile.
* **Supervisione di Casi Clinici**: Le sessioni con un supervisore per discutere i tuoi casi sono una spesa professionale deducibile.
* **Affitto e Forniture dello Studio**: Inclusi elettricità, acqua, internet e riscaldamento.
* **Formazione Continua**: Costi di corsi, master, congressi e workshop per il tuo sviluppo professionale.
* **Materiale e Test**: Acquisto di test psicometrici, manuali diagnostici (DSM-5, CIE-11), libri e materiale d'ufficio.

### Domande Frequenti (FAQ)

**1. Le mie sessioni di terapia devono includere l'IVA?**

No. Se la finalità del servizio è sanitaria (diagnosi, trattamento di un disturbo o problema di salute mentale), è esente da IVA secondo la legge spagnola.

**2. E se tengo un workshop sulla gestione dello stress in un'azienda?**

In questo caso, è molto probabile che il servizio non sia considerato sanitario, ma formativo o di consultoría. Pertanto, dovresti fatturare con il 21% di IVA.

**3. Le sessioni di supervisione con un altro psicologo sono una spesa deducibile?**

Sì. La supervisione di casi clinici è considerata una spesa necessaria per il corretto svolgimento della professione e per garantire la qualità del servizio, quindi è deducibile al 100%.`,
  seoSchema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Las sesiones de terapia deben llevar IVA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Si la finalidad del servicio es sanitaria (diagnóstico, tratamiento de un trastorno o problema de salud mental), está exento de IVA según la ley española."
        }
      },
      {
        "@type": "Question",
        "name": "¿Y si imparto un taller de gestión del estrés en una empresa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En este caso, es muy probable que el servicio no se considere sanitario, sino formativo o de consultoría. Por lo tanto, deberías facturar con el 21% de IVA."
        }
      },
      {
        "@type": "Question",
        "name": "¿Las sesiones de supervisión con otro psicólogo son un gasto deducible?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí. La supervisión de casos clínicos se considera un gasto necesario para el correcto desempeño de la profesión y para garantizar la calidad del servicio, por lo que es 100% deducible."
        }
      }
    ]
  }
};

/* =========================
   SEO JSON-LD (FAQ + WebPage + Article + Speakable)
========================= */

const FaqSchema = () => (
  <script
    type="application/ld+json"
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorData.seoSchema) }}
  />
);

const WebPageArticleSchema = ({
  datePublishedISO,
  dateModifiedISO
}: {
  datePublishedISO?: string;
  dateModifiedISO?: string;
}) => {
  const base = {
    headline: calculatorData.title,
    inLanguage: calculatorData.lang,
    keywords: calculatorData.tags,
  };

  // `speakable` per rich snippet vocali (FAQ titoli e paragrafi).
  const speakable = {
    "@type": "SpeakableSpecification",
    "cssSelector": ["#faq h3", "#faq p"]
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: calculatorData.title,
    description: "Calculadora de IRPF para psicólogos autónomos: simulador del Modelo 130, guía fiscal y FAQ. Servicios sanitarios exentos de IVA.",
    inLanguage: calculatorData.lang,
    isPartOf: { "@type": "WebSite", name: "Calculadoras Autónomos" },
    speakable
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: calculatorData.title,
    description: "Cómo calcular el pago fraccionado del IRPF (Modelo 130) para psicólogos autónomos, con exención de IVA y consejos de fiscalidad.",
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://example.com/" + calculatorData.slug },
    inLanguage: calculatorData.lang,
    keywords: calculatorData.tags,
    speakable,
    ...(datePublishedISO ? { datePublished: datePublishedISO } : {}),
    ...(dateModifiedISO ? { dateModified: dateModifiedISO } : {})
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
    </>
  );
};

/* =========================
   Markdown renderer minimale
========================= */

const ContentRenderer = ({ content }: { content: string }) => {
  const renderContent = () => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h3
            key={index}
            className="text-xl font-bold mt-6 mb-4 text-gray-800"
            dangerouslySetInnerHTML={{ __html: paragraph.replace(/### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h4
            key={index}
            className="text-lg font-semibold mt-4 mb-3 text-gray-700"
            dangerouslySetInnerHTML={{ __html: paragraph.replace(/#### (.*)/, '$1').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
      }
      if (paragraph.startsWith('* ')) {
        const listItems = paragraph.split('\n').map((item, i) => (
          <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
        return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{listItems}</ul>;
      }
      return (
        <p
          key={index}
          className="mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      );
    });
  };
  return <div className="prose prose-sm max-w-none text-gray-700">{renderContent()}</div>;
};

/* =========================
   Grafico dinamico (Recharts)
========================= */

const DynamicChart = dynamic(() => import('recharts').then(mod => {
  const ChartComponent = ({
    data,
    formatCurrency,
    totalIncome
  }: {
    data: any[];
    formatCurrency: (value: number) => string;
    totalIncome: number;
  }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.BarChart data={data} layout="vertical" barSize={60}>
        <mod.XAxis type="number" hide />
        <mod.YAxis type="category" dataKey="name" hide />
        <mod.Tooltip
          formatter={(value: number, name: string) => [
            `${formatCurrency(value)} (${totalIncome > 0 ? ((value / totalIncome) * 100).toFixed(1) : 0}%)`,
            name
          ]}
        />
        <mod.Legend wrapperStyle={{ fontSize: '12px' }} />
        <mod.Bar dataKey="Gastos" stackId="a" fill="#fca5a5" name="Gastos Deducibles" />
        <mod.Bar dataKey="Impuestos" stackId="a" fill="#fdba74" name="Impuestos (Retenciones + Mod. 130)" />
        <mod.Bar dataKey="Beneficio" stackId="a" fill="#86efac" name="Beneficio Neto Final" />
      </mod.BarChart>
    </mod.ResponsiveContainer>
  );
  return ChartComponent;
}), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-500">Cargando gráfico...</div>
});

/* =========================
   Component principale
========================= */

type Props = {
  /** opzionali dal livello pagina/CMS per coerenza SEO */
  datePublishedISO?: string;
  dateModifiedISO?: string;
};

const CalculadoraIrpfPsicologos: React.FC<Props> = ({ datePublishedISO, dateModifiedISO }) => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const initialStates: Record<string, number> = {
    ingresosTrimestrales: 9000,
    gastosDeducibles: 2800,
    porcentajeRetencion: 15,
    ingresosConRetencion: 0
  };

  const [states, setStates] = useState<Record<string, number>>(initialStates);

  const sanitizeNumber = (v: string | number) => {
    const n = Number(v);
    if (!isFinite(n) || isNaN(n)) return 0;
    return Math.max(0, n);
  };

  const handleStateChange = (id: string, value: string | number) => {
    setStates(prev => ({ ...prev, [id]: sanitizeNumber(value) }));
  };

  const handleReset = () => setStates(initialStates);

  // Validazioni derivate
  const validation = useMemo(() => {
    const ingresos = Math.max(0, states.ingresosTrimestrales || 0);
    const gastos = Math.max(0, states.gastosDeducibles || 0);
    const retenBase = Math.max(0, states.ingresosConRetencion || 0);
    return {
      retentionExceedsIncome: retenBase > ingresos,
      negativeMargin: gastos > ingresos
    };
  }, [states]);

  const calculatedOutputs = useMemo(() => {
    const ingresos = Math.max(0, states.ingresosTrimestrales || 0);
    const gastos = Math.max(0, states.gastosDeducibles || 0);
    const porcentaje = Math.max(0, states.porcentajeRetencion || 0);

    // Clamp della base con ritenuta per coerenza contabile
    const baseRetencion = Math.min(
      Math.max(0, states.ingresosConRetencion || 0),
      ingresos
    );

    const rendimientoNeto = Math.max(0, ingresos - gastos);
    const pagoAdelantado20 = rendimientoNeto * 0.20;
    const retencionesPracticadas = baseRetencion * (porcentaje / 100);
    const resultadoModelo130 = pagoAdelantado20 - retencionesPracticadas;

    // Solo per grafico/visual: se negativo non sottraiamo due volte
    const impuestosTotales = Math.max(0, resultadoModelo130) + retencionesPracticadas;
    const beneficioNetoFinal = rendimientoNeto - Math.max(0, resultadoModelo130);

    return {
      rendimientoNeto,
      pagoAdelantado20,
      retencionesPracticadas,
      resultadoModelo130,
      impuestosTotales,
      beneficioNetoFinal,
      baseRetencion
    };
  }, [states]);

  const chartData = useMemo(() => [{
    name: 'Desglose',
    Gastos: Math.max(0, states.gastosDeducibles || 0),
    Impuestos: calculatedOutputs.impuestosTotales,
    Beneficio: calculatedOutputs.beneficioNetoFinal
  }], [states.gastosDeducibles, calculatedOutputs.impuestosTotales, calculatedOutputs.beneficioNetoFinal]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calculatorRef.current) return;
      const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch {
      alert('Error al exportar a PDF.');
    }
  }, [slug]);

  const saveResult = useCallback(() => {
    try {
      const { impuestosTotales, beneficioNetoFinal, ...outputsToSave } = calculatedOutputs;
      const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
      const results = JSON.parse(localStorage.getItem('calc_results') || '[]');
      localStorage.setItem('calc_results', JSON.stringify([payload, ...results].slice(0, 50)));
      alert('Resultado guardado con éxito!');
    } catch {
      alert('No se pudo guardar el resultado.');
    }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <FaqSchema />
      <WebPageArticleSchema datePublishedISO={datePublishedISO} dateModifiedISO={dateModifiedISO} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md" ref={calculatorRef}>
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
              <p className="text-gray-600 mb-4">
                Estima tu IRPF trimestral (Modelo 130) y aclara las dudas fiscales de tu profesión sanitaria.
              </p>

              {/* Alerts/validazioni */}
              {validation.retentionExceedsIncome && (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
                  <strong>Atención:</strong> Los <em>ingresos con retención</em> no pueden superar los <em>ingresos trimestrales</em>.
                  Para el cálculo se limitarán automáticamente a {isClient ? formatCurrency(calculatedOutputs.baseRetencion) : '...'}.
                </div>
              )}
              {validation.negativeMargin && (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
                  <strong>Aviso:</strong> Tus gastos superan a tus ingresos. El beneficio fiscal del trimestre sería 0€ y no habrá pago a cuenta.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                {inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      {input.tooltip && (
                        <Tooltip text={input.tooltip}>
                          <span className="ml-2 cursor-help"><InfoIcon /></span>
                        </Tooltip>
                      )}
                    </label>

                    {input.type === 'select' ? (
                      <select
                        id={input.id}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        value={String(states[input.id])}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                      >
                        {input.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          id={input.id}
                          aria-label={input.label}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                          type="number"
                          min={input.min}
                          step={input.step}
                          value={Number.isFinite(states[input.id]) ? states[input.id] : 0}
                          onChange={(e) => handleStateChange(input.id, e.target.value)}
                        />
                        {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Resultados del Cálculo</h2>
                {outputs.map(output => (
                  <div
                    key={output.id}
                    className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'resultadoModelo130' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}
                  >
                    <span className="text-sm md:text-base font-medium text-gray-700">{output.label}</span>
                    <span className={`text-xl md:text-2xl font-bold ${output.id === 'resultadoModelo130' ? 'text-indigo-600' : 'text-gray-800'}`}>
                      {isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}
                    </span>
                  </div>
                ))}

                {isClient && calculatedOutputs.resultadoModelo130 < 0 && (
                  <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-md p-3">
                    <strong>Resultado a tu favor:</strong> Has adelantado más IRPF del que te corresponde este trimestre.
                    Se compensará en tu declaración anual de la Renta.
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Desglose Visual de tus Ingresos</h3>
                <div className="h-24 w-full bg-gray-50 p-2 rounded-lg">
                  {isClient && (
                    <DynamicChart
                      data={chartData}
                      formatCurrency={formatCurrency}
                      totalIncome={Math.max(0, states.ingresosTrimestrales || 0)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={saveResult}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exportar PDF
              </button>
              <button
                onClick={handleReset}
                className="w-full text-sm border-transparent rounded-md px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reiniciar
              </button>
            </div>
          </section>

          <section id="faq" className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Guía Fiscal para Psicólogos</h2>
            <ContentRenderer content={content} />
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Fuentes Oficiales</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/iva-2023/capitulo-6-exenciones-operaciones-interiores/exenciones-servicios-asistencia-sanitaria.html"
                  target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline"
                >
                  Agencia Tributaria: Exenciones de IVA en Servicios Sanitarios
                </a>
              </li>
              <li>
                <a
                  href="https://www.cop.es/"
                  target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline"
                >
                  Consejo General de la Psicología de España
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default CalculadoraIrpfPsicologos;
