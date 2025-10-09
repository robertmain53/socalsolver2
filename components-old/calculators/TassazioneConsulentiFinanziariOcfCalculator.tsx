'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * VERSIONE UNIFICATA
 * - Base tipizzata e UX della Versione B
 * - Aggiunto confronto tra regimi (grafico a barre) della Versione A
 * - Renderer contenuti rifinito + zebra rows
 * - Tooltip coerenti anche sui boolean
 * - Normalizzazione degli input numerici per evitare NaN
 */

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon: React.FC = () => (
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
    className="text-gray-400 hover:text-gray-600 transition-colors"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema: React.FC = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Qual è il codice ATECO per un Consulente Finanziario?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                "Il codice ATECO per i Consulenti Finanziari abilitati all'offerta fuori sede (iscritti OCF) è 66.19.21 - Promotori finanziari. Questo codice determina un coefficiente di redditività del 78% nel Regime Forfettario.",
            },
          },
          {
            '@type': 'Question',
            name: 'Come si calcolano i contributi INPS per un Consulente Finanziario?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Il Consulente Finanziario si iscrive alla Gestione Commercianti INPS. I contributi includono una quota fissa (circa 4.515€ annui per il 2024) fino a un reddito minimale e una quota variabile (circa 24.48%) sulla parte di reddito eccedente. I contributi versati sono sempre deducibili dal reddito imponibile.',
            },
          },
          {
            '@type': 'Question',
            name: 'Quando conviene il Regime Forfettario per un Consulente Finanziario?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                "Il Regime Forfettario è generalmente conveniente quando i costi reali dell'attività sono inferiori al 22% del fatturato. Il 22% è la quota di costi 'forfettizzata' (100% - 78% di coefficiente di redditività). Offre una grande semplificazione e un'aliquota fiscale ridotta (5% o 15%).",
            },
          },
        ],
      }),
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const processInlineFormatting = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

  const blocks = content.split('\n\n');

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### **')) {
          return (
            <h3
              key={index}
              className="text-xl font-bold mt-6 mb-4"
              dangerouslySetInnerHTML={{
                __html: processInlineFormatting(trimmed.replace(/### \*\*/g, '').replace(/\*\*/g, '')),
              }}
            />
          );
        }
        if (trimmed.startsWith('#### **')) {
          return (
            <h4
              key={index}
              className="text-lg font-semibold mt-4 mb-3"
              dangerouslySetInnerHTML={{
                __html: processInlineFormatting(trimmed.replace(/#### \*\*/g, '').replace(/\*\*/g, '')),
              }}
            />
          );
        }
        if (trimmed.startsWith('* ') || trimmed.startsWith('*')) {
          const items = trimmed
            .split('\n')
            .map((item) => item.replace(/^\*\s*/, ''))
            .filter(Boolean);
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              ))}
            </ul>
          );
        }
        if (trimmed.startsWith('|')) {
          const lines = trimmed.split('\n');
          const headers = lines[0].split('|').slice(1, -1).map((h) => h.trim());
          const rows = lines
            .slice(2)
            .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
          return (
            <div key={index} className="overflow-x-auto my-4">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        className="p-2 border text-left font-semibold"
                        dangerouslySetInnerHTML={{ __html: processInlineFormatting(header) }}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="p-2 border"
                          dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p
            key={index}
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmed) }}
          />
        );
      })}
    </div>
  );
};

// --- Config del calcolatore (inline, ma facilmente estraibile in JSON) ---
const calculatorData = {
  slug: 'tassazione-consulenti-finanziari-ocf',
  category: 'Fisco e Lavoro Autonomo',
  title: 'Calcolatore Tassazione per Consulenti Finanziari (OCF)',
  lang: 'it',
  inputs: [
    {
      id: 'fatturato_annuo',
      label: 'Fatturato Annuo Lordo',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 1000,
      tooltip:
        'Inserisci il totale dei ricavi annui, senza IVA, prima di qualsiasi deduzione o detrazione.',
    },
    {
      id: 'regime_fiscale',
      label: 'Regime Fiscale',
      type: 'select' as const,
      options: [
        { value: 'forfettario', label: 'Regime Forfettario' },
        { value: 'ordinario', label: 'Regime Ordinario' },
      ],
      tooltip:
        'Scegli il regime fiscale da applicare. Il Forfettario è accessibile sotto 85.000€ di ricavi e offre una tassazione agevolata.',
    },
    {
      id: 'is_start_up',
      label: 'Sei in Regime Forfettario Start-up?',
      type: 'boolean' as const,
      condition: "regime_fiscale == 'forfettario'",
      tooltip:
        'Spunta se ti trovi nei primi 5 anni di attività e rispetti i requisiti per l\'aliquota agevolata al 5%.',
    },
    {
      id: 'costi_deducibili',
      label: 'Costi Deducibili Annui',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      condition: "regime_fiscale == 'ordinario'",
      tooltip:
        "Solo per il Regime Ordinario: inserisci il totale dei costi inerenti all'attività (es. software, affitto ufficio, utenze, etc.).",
    },
    {
      id: 'contributi_previdenziali_versati',
      label: 'Contributi Previdenziali Obbligatori Versati',
      type: 'number' as const,
      unit: '€',
      min: 0,
      step: 100,
      tooltip:
        'Inserisci il totale dei contributi INPS (Gestione Commercianti) versati nell\'anno. Questi sono deducibili in entrambi i regimi.',
    },
  ],
  outputs: [
    { id: 'imponibile_fiscale', label: 'Reddito Imponibile Fiscale', unit: '€' },
    { id: 'tasse_totali', label: 'Tasse Totali Dovute (Imposte e Addizionali)', unit: '€' },
    { id: 'netto_annuo', label: 'Reddito Netto Annuo', unit: '€' },
    { id: 'netto_mensile', label: 'Stima Netto Mensile', unit: '€' },
  ],
  content: `### **Guida Completa alla Tassazione per Consulenti Finanziari Autonomi (OCF)**

**Analisi dei Regimi Fiscali, Contributi Previdenziali e Strategie di Ottimizzazione**

Operare come Consulente Finanziario autonomo iscritto all'albo OCF implica una gestione fiscale e previdenziale specifica. Comprendere le differenze tra i regimi fiscali disponibili è fondamentale per massimizzare il proprio reddito netto e garantire la conformità normativa.

Questo strumento è progettato per offrire una simulazione chiara e dettagliata della tassazione, fungendo da guida per orientarsi tra **Regime Forfettario** e **Regime Ordinario Semplificato**. Ricorda che i risultati sono una stima e non sostituiscono la consulenza di un commercialista qualificato.

### **Parte 1: Inquadramento e Codice ATECO**

L'attività di consulente finanziario autonomo e promotore finanziario è identificata dal seguente codice ATECO:

* **66.19.21 - Promotori finanziari**

Questo codice è cruciale perché determina l'accesso e le regole di calcolo per il Regime Forfettario, in particolare il **coefficiente di redditività**.

### **Parte 2: Analisi dei Regimi Fiscali**

#### **1. Il Regime Forfettario: Semplicità e Tassazione Agevolata**

Il Regime Forfettario è un'opzione molto vantaggiosa, specialmente in fase di avvio, grazie alla sua semplicità gestionale e alla tassazione ridotta. È accessibile se non si superano i **85.000 € di ricavi annui**.

* **Come si Calcola il Reddito Imponibile?**
    Non si deducono i costi analitici (fatture di acquisto), ma si applica un **coefficiente di redditività** forfettario al fatturato lordo. Per il codice ATECO 66.19.21, questo coefficiente è del **78%**.
    _Esempio_: Su 50.000 € di fatturato, il reddito imponibile lordo è 39.000 € (50.000 * 78%), mentre 11.000 € sono considerati costi forfettari.

* **Deduzione dei Contributi Previdenziali**
    Dal reddito imponibile lordo (il 78% del fatturato) è possibile dedurre interamente i contributi previdenziali obbligatori versati nell'anno.

* **Aliquota Fiscale (Imposta Sostitutiva)**
    Sul reddito imponibile netto si applica un'imposta sostitutiva unica, che rimpiazza IRPEF e addizionali.
    * **5% per i primi 5 anni (Start-up)**: a patto di rispettare specifici requisiti (es. non essere una mera prosecuzione di un'attività precedente).
    * **15% in tutti gli altri casi**.

* **Vantaggi Aggiuntivi**: Esenzione dall'IVA, dalla ritenuta d'acconto e, in molti casi, dalla fatturazione elettronica.

#### **2. Il Regime Ordinario Semplificato: Deducibilità Analitica**

Superati gli 85.000 € di fatturato o in assenza dei requisiti per il forfettario, si rientra nel Regime Ordinario Semplificato.

* **Come si Calcola il Reddito Imponibile?**
    Il reddito imponibile si ottiene dalla **differenza tra ricavi e costi effettivamente sostenuti e documentati** (principio di cassa). Sono deducibili tutti i costi inerenti all'attività (es. software di analisi, canoni OCF, formazione, spese d'ufficio).

* **Tassazione Progressiva IRPEF**
    Il reddito imponibile è soggetto a tassazione progressiva secondo gli scaglioni IRPEF (in vigore per il 2025):
    * fino a 28.000 €: **23%**
    * da 28.001 € a 50.000 €: **35%**
    * oltre 50.000 €: **43%**

* **Costi Aggiuntivi**: A differenza del forfettario, nel regime ordinario si applicano l'IVA sulle fatture emesse e le **addizionali regionali e comunali** sull'imponibile IRPEF.

### **Parte 3: La Gestione Previdenziale (INPS)**

Il Consulente Finanziario è considerato a tutti gli effetti un professionista del commercio e deve iscriversi alla **Gestione Commercianti INPS**.

La contribuzione si divide in due componenti:

* **Contributi Fissi**: Circa **4.515 € annui** (valore aggiornato annualmente), da versare in 4 rate trimestrali indipendentemente dal fatturato, fino a un reddito minimale di circa 18.415 €.
* **Contributi a Percentuale**: Sulla parte di reddito imponibile che eccede il minimale, si applica un'aliquota di circa il **24,48%**.

**Importante**: I contributi INPS versati sono **sempre deducibili** dal reddito imponibile, sia in regime forfettario che ordinario.

### **Tabella Comparativa dei Regimi**

| **Caratteristica** | **Regime Forfettario** | **Regime Ordinario Semplificato** |
| :--- | :--- | :--- |
| **Limite Ricavi** | 85.000 € | Nessun limite |
| **Calcolo Reddito** | Fatturato x 78% | Ricavi - Costi reali |
| **Tassazione** | Imposta Sostitutiva (5% o 15%) | IRPEF progressiva (23%-43%) |
| **Costi Deducibili** | Solo contributi INPS | Tutti i costi inerenti |
| **IVA** | Esente | Si applica |
| **Addizionali** | Non dovute | Dovute (Regionali e Comunali) |

### **Conclusione**

La scelta del regime fiscale è una decisione strategica. Il **Regime Forfettario** è ideale per chi inizia e ha costi operativi contenuti (inferiori al 22% del fatturato, ovvero la quota di costi forfettizzati). Il **Regime Ordinario** diventa più conveniente quando i costi reali deducibili sono significativamente più alti e il fatturato supera la soglia del forfettario.
`,
};

// --- Tipi per maggiore sicurezza ---
type Regime = 'forfettario' | 'ordinario';

type CalculatorState = {
  fatturato_annuo: number;
  regime_fiscale: Regime;
  is_start_up: boolean;
  costi_deducibili: number;
  contributi_previdenziali_versati: number;
};

// --- Helpers ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

// Condizioni supportate: "key == 'value'", "key != 'value'", "key == true/false"
function checkCondition(cond: string | undefined, state: CalculatorState): boolean {
  if (!cond) return true;
  const m = cond.match(/^(\w+)\s*(==|!=)\s*(.+)$/);
  if (!m) return true;
  const [, key, op, rawVal] = m;
  const k = key as keyof CalculatorState;
  if (!(k in state)) return true;
  // normalizza valore target: può essere 'stringa', true/false, numero
  let target: any = rawVal.trim();
  if (/^'.*'$/.test(target) || /^".*"$/.test(target)) target = target.slice(1, -1);
  else if (target === 'true') target = true;
  else if (target === 'false') target = false;
  else if (!Number.isNaN(Number(target))) target = Number(target);
  const current = state[k];
  return op === '==' ? current === target : current !== target;
}

// --- Componente Principale ---
const TassazioneConsulentiFinanziariOcfCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [mostraConfronto, setMostraConfronto] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialStates: CalculatorState = {
    fatturato_annuo: 70000,
    regime_fiscale: 'forfettario',
    is_start_up: true,
    costi_deducibili: 12000,
    contributi_previdenziali_versati: 6000,
  };

  const [states, setStates] = useState<CalculatorState>(initialStates);

  const handleStateChange = useCallback(
    <K extends keyof CalculatorState>(id: K, value: CalculatorState[K]) => {
      setStates((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setStates(initialStates);
  }, []);

  // Calcolo per un regime specifico
  const computeForRegime = useCallback(
    (regime: Regime, s: CalculatorState) => {
      if (regime === 'forfettario') {
        const COEF = 0.78;
        const imponibile_lordo = s.fatturato_annuo * COEF;
        const imponibile_fiscale = Math.max(0, imponibile_lordo - s.contributi_previdenziali_versati);
        const aliquota = s.is_start_up ? 0.05 : 0.15;
        const tasse_totali = imponibile_fiscale * aliquota;
        const netto_annuo = s.fatturato_annuo - tasse_totali - s.contributi_previdenziali_versati;
        return {
          imponibile_fiscale,
          tasse_totali,
          netto_annuo,
          netto_mensile: netto_annuo / 12,
        };
      } else {
        const imponibile_lordo = s.fatturato_annuo - s.costi_deducibili;
        const imponibile_fiscale = Math.max(0, imponibile_lordo - s.contributi_previdenziali_versati);
        let irpef_lorda = 0;
        if (imponibile_fiscale > 50000) {
          irpef_lorda = 28000 * 0.23 + (50000 - 28000) * 0.35 + (imponibile_fiscale - 50000) * 0.43;
        } else if (imponibile_fiscale > 28000) {
          irpef_lorda = 28000 * 0.23 + (imponibile_fiscale - 28000) * 0.35;
        } else {
          irpef_lorda = imponibile_fiscale * 0.23;
        }
        const addizionali = imponibile_fiscale * 0.025; // stima
        const tasse_totali = irpef_lorda + addizionali;
        const netto_annuo = s.fatturato_annuo - tasse_totali - s.contributi_previdenziali_versati - s.costi_deducibili;
        return {
          imponibile_fiscale,
          tasse_totali,
          netto_annuo,
          netto_mensile: netto_annuo / 12,
        };
      }
    },
    []
  );

  // Output del regime selezionato
  const calculatedOutputs = useMemo(() => computeForRegime(states.regime_fiscale, states), [computeForRegime, states]);

  // Output dell'altro regime per confronto
  const otherRegimeOutputs = useMemo(() => {
    const other: Regime = states.regime_fiscale === 'forfettario' ? 'ordinario' : 'forfettario';
    return computeForRegime(other, states);
  }, [computeForRegime, states]);

  // Dati grafico ripartizione (torta) per regime corrente
  const pieData = useMemo(() => {
    const data = [
      { name: 'Netto Annuo', value: calculatedOutputs.netto_annuo },
      { name: 'Tasse', value: calculatedOutputs.tasse_totali },
      { name: 'Contributi INPS', value: states.contributi_previdenziali_versati },
    ];
    if (states.regime_fiscale === 'ordinario') data.push({ name: 'Costi Deducibili', value: states.costi_deducibili });
    return data.filter((d) => d.value > 0);
  }, [calculatedOutputs, states]);

  // Dati grafico confronto (barre) tra regimi
  const barData = useMemo(
    () => [
      {
        name: 'Tasse Totali',
        Forfettario:
          states.regime_fiscale === 'forfettario'
            ? calculatedOutputs.tasse_totali
            : otherRegimeOutputs.tasse_totali,
        Ordinario:
          states.regime_fiscale === 'ordinario'
            ? calculatedOutputs.tasse_totali
            : otherRegimeOutputs.tasse_totali,
      },
      {
        name: 'Reddito Netto',
        Forfettario:
          states.regime_fiscale === 'forfettario'
            ? calculatedOutputs.netto_annuo
            : otherRegimeOutputs.netto_annuo,
        Ordinario:
          states.regime_fiscale === 'ordinario'
            ? calculatedOutputs.netto_annuo
            : otherRegimeOutputs.netto_annuo,
      },
    ],
    [calculatedOutputs, otherRegimeOutputs, states.regime_fiscale]
  );

  const COLORS = ['#16a34a', '#ef4444', '#3b82f6', '#f97316'];

  const formulaUsata =
    states.regime_fiscale === 'forfettario'
      ? `Imponibile = (Fatturato * 78%) - Contributi; Tasse = Imponibile * ${states.is_start_up ? '5%' : '15%'}`
      : 'Imponibile = Fatturato - Costi - Contributi; Tasse = Calcolo IRPEF + Addizionali';

  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      if (!calcolatoreRef.current) return;
      const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${slug}.pdf`);
    } catch (_e) {
      alert('Errore durante l\'esportazione in PDF.');
    }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = {
        slug,
        title,
        inputs: states,
        outputs: calculatedOutputs,
        confronto: mostraConfronto ? barData : undefined,
        ts: Date.now(),
      };
      const existing = JSON.parse(localStorage.getItem('calc_results') || '[]');
      const next = [payload, ...existing].slice(0, 50);
      localStorage.setItem('calc_results', JSON.stringify(next));
      alert('Risultato salvato con successo!');
    } catch {
      alert('Impossibile salvare il risultato.');
    }
  }, [states, calculatedOutputs, barData, mostraConfronto, slug, title]);

  return (
    <>
      <FaqSchema />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <div className="lg:col-span-2">
          <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-4">
              Simula la tua tassazione e confronta il Regime Forfettario con quello Ordinario.
            </p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo strumento è a scopo puramente informativo e fornisce una stima. Non sostituisce una consulenza fiscale professionale. I valori dei contributi e delle aliquote sono soggetti ad aggiornamenti normativi.
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              {inputs.map((input) => {
                const visible = checkCondition(input.condition, states);
                if (!visible) return null;

                const Label: React.FC<{ htmlFor: string }> = ({ htmlFor }) => (
                  <label
                    className="block text-sm font-medium mb-1 text-gray-700 flex items-center"
                    htmlFor={htmlFor}
                  >
                    {input.label}
                    {input.tooltip && (
                      <Tooltip text={input.tooltip}>
                        <span className="ml-2 cursor-help">
                          <InfoIcon />
                        </span>
                      </Tooltip>
                    )}
                  </label>
                );

                if (input.type === 'boolean') {
                  const checked = states[input.id as keyof CalculatorState] as boolean;
                  return (
                    <div
                      key={input.id}
                      className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-white border self-center"
                    >
                      <input
                        id={input.id}
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={!!checked}
                        onChange={(e) =>
                          handleStateChange(input.id as keyof CalculatorState, e.target.checked as any)
                        }
                      />
                      <Label htmlFor={input.id} />
                    </div>
                  );
                }

                if (input.type === 'select') {
                  const val = states[input.id as keyof CalculatorState] as string;
                  return (
                    <div key={input.id}>
                      <Label htmlFor={input.id} />
                      <select
                        id={input.id}
                        value={val}
                        onChange={(e) =>
                          handleStateChange(
                            input.id as keyof CalculatorState,
                            e.target.value as CalculatorState['regime_fiscale']
                          )
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                      >
                        {input.options?.map((opt: any) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // number
                const value = states[input.id as keyof CalculatorState] as number;
                return (
                  <div key={input.id}>
                    <Label htmlFor={input.id} />
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        {input.unit}
                      </span>
                      <input
                        id={input.id}
                        aria-label={input.label}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-8 pr-3 py-2 text-right"
                        type="number"
                        min={input.min}
                        step={input.step}
                        value={Number.isFinite(value) ? value : 0}
                        onChange={(e) =>
                          handleStateChange(
                            input.id as keyof CalculatorState,
                            e.target.value === '' ? (0 as any) : (Number(e.target.value) as any)
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Risultati */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Risultati della Simulazione ({states.regime_fiscale === 'forfettario' ? 'Regime Forfettario' : 'Regime Ordinario'})
              </h2>
              {outputs.map((output) => (
                <div
                  key={output.id}
                  className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${
                    output.id === 'netto_annuo' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="text-sm md:text-base font-medium text-gray-700">
                    {output.label}
                  </div>
                  <div
                    className={`text-xl md:text-2xl font-bold ${
                      output.id === 'netto_annuo' ? 'text-indigo-600' : 'text-gray-800'
                    }`}
                  >
                    <span>
                      {isClient ? (formatCurrency as any)((calculatedOutputs as any)[output.id]) : '...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Switch confronto */}
            <div className="mt-6 flex items-center gap-3">
              <input
                id="toggle-confronto"
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={mostraConfronto}
                onChange={(e) => setMostraConfronto(e.target.checked)}
              />
              <label htmlFor="toggle-confronto" className="text-sm text-gray-700">
                Mostra confronto con l'altro regime
              </label>
            </div>

            {/* Grafico ripartizione (torta) */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato</h3>
              <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry: any) => `${(entry.percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Grafico confronto (barre) */}
            {mostraConfronto && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Grafico: Forfettario vs. Ordinario</h3>
                <div className="h-72 w-full bg-gray-50 p-4 rounded-lg">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                        <ChartTooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend />
                        <Bar dataKey="Forfettario" fill="#4f46e5" />
                        <Bar dataKey="Ordinario" fill="#fb923c" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* Logica */}
            <div className="mt-6 border rounded-lg shadow-sm p-4 bg-white">
              <h3 className="font-semibold text-gray-700">Logica di Calcolo Applicata</h3>
              <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={salvaRisultato}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Salva Risultato
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Esporta PDF
              </button>
              <button
                onClick={handleReset}
                className="col-span-2 w-full border border-red-300 bg-red-50 text-red-700 rounded-md px-3 py-2 text-sm hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reset Calcolatore
              </button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida alla Tassazione</h2>
            <ContentRenderer content={content} />
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/regime-forfetario-art-1-commi-54-89-legge-190-2014"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Agenzia delle Entrate - Regime Forfetario
                </a>
              </li>
              <li>
                <a
                  href="https://www.inps.it/it/it/dettaglio-scheda-prestazione.schede-servizio-strumento.schede-prestazioni.50553.gestione-commercianti.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  INPS - Gestione Commercianti
                </a>
              </li>
              <li>
                <a
                  href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Testo Unico delle Imposte sui Redditi (TUIR)
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
};

export default TassazioneConsulentiFinanziariOcfCalculator;
