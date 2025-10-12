'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Placeholder di Caricamento per il Grafico ---
const ChartLoadingSkeleton = () => (
  <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
    <p className="text-gray-500 text-sm">Cargando gráfico...</p>
  </div>
);

// --- Importazione Dinamica del Componente Grafico (Recharts) ---
const DynamicBarChart = dynamic(() =>
  import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
    
    // Wrapper per mantenere la coerenza delle props e lo stile
    const WrappedChart = (props: { data: any[] }) => (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value)} />
          <ChartTooltip
            cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number, name: string) => [new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value), name === 'pagoUnico' ? 'Inversión' : 'Cuotas S.S.']}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <Bar dataKey="pagoUnico" name="Pago Único (Inversión)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={60} />
          <Bar dataKey="cuotasSS" name="Para Cuotas S.S." fill="#34d399" radius={[4, 4, 0, 0]} barSize={60} />
        </BarChart>
      </ResponsiveContainer>
    );
    return WrappedChart;
  }),
  { ssr: false, loading: () => <ChartLoadingSkeleton /> }
);


// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Componente per Inserire lo Schema SEO Dinamicamente ---
const SchemaInjector = ({ schemaData }: { schemaData: object }) => {
    if (!schemaData) return null;
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
};


// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
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
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// --- Dati di configurazione del calcolatore ---
const calculatorData = { "slug": "calculadora-capitalizacion-paro", "category": "Impuestos y trabajo autónomo", "title": "Calculadora de la 'Capitalización del Paro' para emprender", "lang": "es", "inputs": [ { "id": "base_reguladora_diaria", "label": "Base Reguladora Diaria", "type": "number" as const, "unit": "€", "min": 0, "step": 1, "tooltip": "Es el promedio de tus bases de cotización de los últimos 180 días trabajados. Puedes encontrar este dato en tu resolución de prestación por desempleo del SEPE. Es el dato más importante para el cálculo." }, { "id": "dias_prestacion_restantes", "label": "Días de prestación restantes", "type": "number" as const, "unit": "días", "min": 90, "step": 1, "tooltip": "Introduce el número total de días de paro que te quedan por cobrar. El requisito mínimo es tener 3 meses (90 días) pendientes de recibir." }, { "id": "tipo_calculo", "label": "Modalidad de Capitalización", "type": "select" as const, "options": [ { "value": "pago_unico", "label": "100% en Pago Único (para inversión)" }, { "value": "solo_cuotas", "label": "100% para Cuotas de Autónomo" }, { "value": "mixto", "label": "Modalidad Mixta (Inversión + Cuotas)" } ], "tooltip": "Elige cómo quieres recibir el importe: todo de una vez para la inversión inicial, para pagar mensualmente tus cuotas a la Seguridad Social, o una combinación de ambas." }, { "id": "inversion_justificable", "label": "Inversión inicial a justificar", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "tipo_calculo == 'pago_unico' || tipo_calculo == 'mixto'", "tooltip": "Importe total de la inversión que puedes justificar con facturas (maquinaria, equipos, marketing, etc.). El pago único no podrá superar esta cantidad. Es crucial tener facturas proforma para la solicitud." }, { "id": "porcentaje_pago_unico", "label": "Porcentaje para Inversión Inicial", "type": "number" as const, "unit": "%", "min": 1, "max": 99, "step": 1, "condition": "tipo_calculo == 'mixto'", "tooltip": "Define qué porcentaje del total capitalizable quieres recibir como pago único para la inversión. El resto se destinará a pagar las cuotas de autónomo." }, { "id": "cuota_autonomo_mensual", "label": "Cuota de autónomo mensual", "type": "number" as const, "unit": "€", "min": 0, "step": 1, "condition": "tipo_calculo == 'solo_cuotas' || tipo_calculo == 'mixto'", "tooltip": "Indica tu cuota mensual prevista a la Seguridad Social (p. ej., la tarifa plana de 80€ o la cuota que te corresponda por tus ingresos reales)." } ], "outputs": [ { "id": "importe_total_capitalizable", "label": "Importe Total Capitalizable (Bruto)", "unit": "€" }, { "id": "pago_unico_recibido", "label": "Pago Único a Recibir (para inversión)", "unit": "€" }, { "id": "importe_para_cuotas", "label": "Importe para Cuotas a la S.S.", "unit": "€" }, { "id": "meses_cuota_cubiertos", "label": "Meses de Cuota de Autónomo Cubiertos", "unit": "meses" } ], "formulaSteps": [ { "id": "dias_tramo1", "expr": "Math.min(dias_prestacion_restantes, 180)" }, { "id": "dias_tramo2", "expr": "Math.max(0, dias_prestacion_restantes - 180)" }, { "id": "bruto_tramo1", "expr": "dias_tramo1 * base_reguladora_diaria * 0.70" }, { "id": "bruto_tramo2", "expr": "dias_tramo2 * base_reguladora_diaria * 0.60" }, { "id": "importe_total_capitalizable", "expr": "bruto_tramo1 + bruto_tramo2" }, { "id": "pago_unico_calculado", "expr": "tipo_calculo == 'pago_unico' ? importe_total_capitalizable : (tipo_calculo == 'mixto' ? importe_total_capitalizable * (porcentaje_pago_unico / 100) : 0)" }, { "id": "pago_unico_recibido", "expr": "Math.min(pago_unico_calculado, inversion_justificable)" }, { "id": "importe_para_cuotas", "expr": "tipo_calculo == 'solo_cuotas' ? importe_total_capitalizable : (tipo_calculo == 'mixto' ? importe_total_capitalizable - pago_unico_recibido : 0)" }, { "id": "meses_cuota_cubiertos", "expr": "cuota_autonomo_mensual > 0 ? Math.floor(importe_para_cuotas / cuota_autonomo_mensual) : 0" } ], "examples": [ { "description": "Emprendedor con 12 meses de paro (360 días) que solicita el 100% como pago único para una inversión justificada de 15.000€.", "inputs": { "base_reguladora_diaria": 45, "dias_prestacion_restantes": 360, "tipo_calculo": "pago_unico", "inversion_justificable": 15000, "porcentaje_pago_unico": 0, "cuota_autonomo_mensual": 80 }, "outputs": { "importe_total_capitalizable": 10206, "pago_unico_recibido": 10206, "importe_para_cuotas": 0, "meses_cuota_cubiertos": 0 } }, { "description": "Autónoma con 8 meses de paro (240 días) que elige la modalidad mixta: 40% para una inversión de 3.000€ y el resto para cubrir su cuota de 80€.", "inputs": { "base_reguladora_diaria": 42, "dias_prestacion_restantes": 240, "tipo_calculo": "mixto", "inversion_justificable": 3000, "porcentaje_pago_unico": 40, "cuota_autonomo_mensual": 80 }, "outputs": { "importe_total_capitalizable": 6804, "pago_unico_recibido": 2721.6, "importe_para_cuotas": 4082.4, "meses_cuota_cubiertos": 51 } } ], "tags": "capitalización paro, pago único, emprender, autónomo, SEPE, prestación desempleo, crear empresa, ayuda emprendedores, calcular paro, requisitos paro único", "content": "### **Introduzione: Trasforma il tuo Paro nel Capitale Iniziale per il Tuo Business**\n\nLa capitalizzazione del paro è una delle opportunità più potenti offerte dal sistema spagnolo per i nuovi imprenditori. Permette di ricevere in un unico pagamento (o in modalità mista) l'importo della prestazione di disoccupazione a cui si ha diritto, fornendo la liquidità necessaria per avviare un'attività autonoma o una società. Questa calcolatrice è progettata per darti una stima precisa e chiara di quanto puoi ricevere, aiutandoti a pianificare i tuoi primi passi come imprenditore con dati concreti.\n\n### **Guida all'Uso del Calcolatore: Comprendi Ogni Campo**\n\n* **Base Regolamentare Giornaliera (€)**: È l'importo più cruciale. Rappresenta la media delle tue basi di contribuzione degli ultimi 180 giorni lavorati. Troverai questo dato nella lettera di approvazione della tua prestazione che hai ricevuto dal SEPE.\n* **Giorni di prestazione rimanenti**: Inserisci il totale dei giorni di disoccupazione che ti restano da percepire. Ricorda che devi avere un minimo di 3 mesi (90 giorni) a disposizione.\n* **Modalità di Capitalizzazione**: Scegli la strategia che meglio si adatta al tuo progetto. Se hai bisogno di un forte investimento iniziale (macchinari, attrezzature), scegli '100% en Pago Único'. Se il tuo business non richiede un grande esborso iniziale, puoi destinare l'intero importo a coprire le tue quote da autonomo. La 'Modalidad Mixta' offre la massima flessibilità.\n* **Investimento iniziale giustificabile (€)**: Questo campo è fondamentale per le modalità 'Pago Único' e 'Mixta'. Devi indicare l'importo totale degli investimenti che puoi dimostrare con fatture proforma (e successivamente definitive). L'importo del pagamento unico non potrà mai superare questa cifra.\n* **Quota mensile da autonomo (€)**: Se opti per coprire le tue quote, inserisci l'importo mensile che prevedi di pagare alla Sicurezza Sociale. Ad esempio, la tariffa forfettaria (attualmente circa 80€) o la quota corrispondente ai tuoi redditi reali.\n\n### **Metodologia di Calcolo Spiegata: Trasparenza Totale**\n\nIl calcolo non è lineare, poiché l'importo della prestazione cambia nel tempo. La nostra calcolatrice segue scrupolosamente il metodo ufficiale del SEPE:\n\n1.  **Primo Scaglione (Primi 180 giorni)**: Per i primi 180 giorni di prestazione rimanente, si calcola il **70%** della tua base regolamentare giornaliera.\n2.  **Secondo Scaglione (Dal 181° giorno)**: Per i giorni rimanenti oltre i 180, l'importo scende al **60%** della base regolamentare.\n\n**Formula Applicata**: `Importo Totale = (MIN(Giorni Rimanenti, 180) * Base Regolamentare * 0.70) + (MAX(0, Giorni Rimanenti - 180) * Base Regolamentare * 0.60)`\n\nQuesto importo totale è il massimo che puoi capitalizzare. La cifra finale che riceverai come pagamento unico dipenderà anche dall'investimento che giustifichi.\n\n### **Analisi Approfondita: Requisiti, Vantaggi Fiscali e Errori da Evitare**\n\n**Requisiti Fondamentali (Checklist)**:\n* Essere beneficiario di una prestazione **contributiva** (non un sussidio) e avere almeno 3 mesi rimanenti.\n* **Non aver iniziato l'attività** prima della richiesta. L'iscrizione come autonomo deve essere successiva.\n* Non aver beneficiato di un'altra capitalizzazione negli ultimi **4 anni**.\n* Presentare una **Memoria del Progetto** dettagliata e convincente al SEPE.\n* Una volta approvata, iniziare l'attività entro un mese.\n\n**Vantaggio Fiscale Cruciale: Esenzione dall'IRPF**\nL'importo ricevuto tramite la capitalizzazione del paro è **totalmente esente dalla tassazione IRPF**. Questo è un vantaggio enorme rispetto a qualsiasi altra forma di finanziamento. **Condizione**: devi mantenere l'attività per un minimo di **5 anni**. Se cessi l'attività prima, l'Agenzia delle Entrate ti richiederà di pagare le imposte corrispondenti, con eventuali sanzioni.\n\n**Errori Comuni da Evitare**:\n1.  **Iniziare l'attività prima di presentare la domanda**: È il motivo di rigetto più comune. La richiesta al SEPE deve essere il primo passo in assoluto.\n2.  **Sottovalutare la Memoria del Progetto**: Non è un semplice modulo. Devi presentare un business plan credibile che giustifichi ogni euro di investimento richiesto. Allega sempre fatture proforma.\n3.  **Non giustificare correttamente le spese**: Conserva tutte le fatture definitive. Il SEPE può effettuare controlli e, in caso di irregolarità, richiedere la restituzione dell'intero importo.\n\n### **Domande Frequenti (FAQ)**\n\n* **Cosa succede se il mio investimento è inferiore all'importo capitalizzabile?**\n    Riceverai come pagamento unico solo l'importo che hai giustificato con le fatture. Se hai scelto la modalità 'Pago Único', perderai la differenza. Se hai scelto la 'Mixta', la differenza verrà automaticamente destinata a coprire le tue quote da autonomo.\n\n* **Posso usare i soldi per pagare l'affitto del locale o le forniture?**\n    No. I costi operativi come affitti, stipendi, luce, acqua o tasse (IVA) non sono considerati investimenti iniziali e non possono essere giustificati con il pagamento unico. La capitalizzazione deve essere usata per l'acquisto di beni e servizi necessari per *avviare* l'attività (es. macchinari, computer, creazione di un sito web, ecc.).\n\n* **Quanto tempo impiega il SEPE ad approvare la richiesta?**\n    Il termine legale è di 15 giorni per la risoluzione, ma i tempi possono variare a seconda dell'ufficio. Una volta approvata, il pagamento viene solitamente effettuato il giorno 10 del mese successivo alla data di approvazione.", "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Cosa succede se il mio investimento giustificabile è inferiore all'importo totale che potrei capitalizzare?", "acceptedAnswer": { "@type": "Answer", "text": "Riceverai come pagamento unico un importo pari all'investimento che hai giustificato. Se hai scelto la modalità 'Pago Único', la differenza andrà persa. Se hai optato per la modalità 'Mixta', l'importo non utilizzato per l'investimento verrà automaticamente destinato al pagamento delle tue quote mensili da autonomo, massimizzando così l'utilizzo della prestazione." } }, { "@type": "Question", "name": "Posso usare i soldi della capitalizzazione per pagare l'affitto o le tasse come l'IVA?", "acceptedAnswer": { "@type": "Answer", "text": "No, la capitalizzazione è destinata a finanziare l'investimento iniziale, non le spese operative correnti. Non puoi usarla per pagare affitti, stipendi, forniture (luce, acqua) o tasse (IVA, IRPF). Le spese ammesse sono quelle relative all'acquisto di beni e servizi necessari per avviare l'attività, come macchinari, attrezzature informatiche, stock iniziale o la creazione di un sito web." } }, { "@type": "Question", "name": "Il denaro ricevuto dalla capitalizzazione del paro è soggetto a imposte (IRPF)?", "acceptedAnswer": { "@type": "Answer", "text": "No, l'importo ricevuto come pagamento unico è completamente esente dalla tassazione IRPF, il che rappresenta un notevole vantaggio fiscale. Tuttavia, questa esenzione è condizionata al mantenimento dell'attività economica per un periodo minimo di 5 anni. Se cessi l'attività prima di questo termine, l'Agenzia delle Entrate ti richiederà il pagamento delle imposte corrispondenti." } } ] } };

// --- NOME DEL COMPONENTE GENERATO DINAMICAMENTE DALLO SLUG ---
const CalculadoraCapitalizacionParo: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        base_reguladora_diaria: 45,
        dias_prestacion_restantes: 360,
        tipo_calculo: 'pago_unico',
        inversion_justificable: 15000,
        porcentaje_pago_unico: 50,
        cuota_autonomo_mensual: 80
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { base_reguladora_diaria = 0, dias_prestacion_restantes = 0, tipo_calculo, inversion_justificable = 0, porcentaje_pago_unico = 0, cuota_autonomo_mensual = 0 } = states;
        
        const dias_tramo1 = Math.min(dias_prestacion_restantes, 180);
        const dias_tramo2 = Math.max(0, dias_prestacion_restantes - 180);
        const bruto_tramo1 = dias_tramo1 * base_reguladora_diaria * 0.70;
        const bruto_tramo2 = dias_tramo2 * base_reguladora_diaria * 0.60;
        const importe_total_capitalizable = bruto_tramo1 + bruto_tramo2;

        let pago_unico_recibido = 0;
        let importe_para_cuotas = 0;

        if (tipo_calculo === 'pago_unico') {
            pago_unico_recibido = Math.min(importe_total_capitalizable, inversion_justificable);
        } else if (tipo_calculo === 'solo_cuotas') {
            importe_para_cuotas = importe_total_capitalizable;
        } else if (tipo_calculo === 'mixto') {
            const pago_unico_solicitado = importe_total_capitalizable * (porcentaje_pago_unico / 100);
            pago_unico_recibido = Math.min(pago_unico_solicitado, inversion_justificable);
            importe_para_cuotas = importe_total_capitalizable - pago_unico_recibido;
        }

        const meses_cuota_cubiertos = cuota_autonomo_mensual > 0 ? Math.floor(importe_para_cuotas / cuota_autonomo_mensual) : 0;
        
        return { importe_total_capitalizable, pago_unico_recibido, importe_para_cuotas, meses_cuota_cubiertos };
    }, [states]);

    const chartData = useMemo(() => [
        { name: 'Distribución', 'pagoUnico': calculatedOutputs.pago_unico_recibido, 'cuotasSS': calculatedOutputs.importe_para_cuotas },
    ], [calculatedOutputs]);
    
    const formulaText = `Total = (MIN(Días, 180) × Base × 0.7) + (MAX(0, Días - 180) × Base × 0.6)`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            const calculatorElement = calculatorRef.current;
            if (!calculatorElement) return;

            const canvas = await html2canvas(calculatorElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (error) { 
            console.error("Error al exportar a PDF:", error);
            alert('La función de exportar a PDF no está disponible o ha fallado.'); 
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem('calc_results') || '[]');
            localStorage.setItem('calc_results', JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert('¡Resultado guardado con éxito en el almacenamiento local!');
        } catch { alert('No se pudo guardar el resultado.'); }
    }, [states, calculatedOutputs, slug, title]);

    const formatValue = (value: number, unit: string) => {
        if (typeof value !== 'number') value = 0;
        if (unit === '€') return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
        if (unit === 'meses') return `${Math.floor(value)} ${Math.floor(value) === 1 ? 'mes' : 'meses'}`;
        return `${value} ${unit}`;
    };

    const evaluateCondition = (condition: string, states: any) => {
        if (!condition) return true;
        const parts = condition.split('||').map(p => p.trim());
        return parts.some(part => {
            const [key, operator, value] = part.split(/ (==|!=) /);
            const stateValue = states[key];
            const targetValue = value.replace(/'/g, '');
            if (operator === '==') return stateValue === targetValue;
            if (operator === '!=') return stateValue !== targetValue;
            return false;
        });
    };

    return (
        <>
            <SchemaInjector schemaData={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Estima el importe que puedes recibir del SEPE para iniciar tu proyecto como autónomo.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Aviso legal:</strong> Esta calculadora ofrece una estimación y no sustituye el cálculo oficial del SEPE. Los resultados son orientativos y no tienen validez legal.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                if (!evaluateCondition(input.condition || '', states)) return null;

                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );
                                
                                if (input.type === 'select') {
                                    return (
                                        <div key={input.id} className="md:col-span-2">
                                            {inputLabel}
                                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 text-sm">
                                                {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pl-3 pr-10 py-2 text-sm" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))} />
                                            {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-3">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Resultados de la Simulación</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-center justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'importe_total_capitalizable' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <span className="text-sm font-medium text-gray-700">{output.label}</span>
                                    <span className={`text-xl font-bold ${output.id === 'importe_total_capitalizable' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        {isClient ? formatValue((calculatedOutputs as any)[output.id], output.unit) : '...'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className=" -lg -md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Distribución del Importe Capitalizado</h3>
                        <div className="h-72 w-full bg-gray-50 p-2 rounded-lg mt-4">
                            {isClient && <DynamicBarChart data={chartData} />}
                        </div>
                    </div>

                    <div className=" -lg -md p-6">
                        <h3 className="font-semibold text-gray-800">Fórmula de Cálculo Utilizada</h3>
                        <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words text-center">{formulaText}</p>
                        <p className="text-xs text-gray-500 mt-2">Nota: Esta fórmula sigue el método oficial del SEPE, distinguiendo entre los primeros 180 días (70%) y los siguientes (60%).</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Acciones</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Exportar PDF</button>
                            <button onClick={handleReset} className="col-span-2 text-sm w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Resetear Valores</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Guía Completa y FAQ</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Fuentes y Referencias Oficiales</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.sepe.es/HomeSepe/Personas/distributiva-prestaciones/pago-unico-prestacion-contributiva.html" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">SEPE - Pago Único de la prestación contributiva</a></li>
                            <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2015-8469" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Ley 31/2015, de Fomento del Trabajo Autónomo (BOE)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalculadoraCapitalizacionParo;