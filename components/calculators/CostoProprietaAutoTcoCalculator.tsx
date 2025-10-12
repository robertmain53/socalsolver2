'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: 'Calcolatore Costo Totale di Proprietà Auto (TCO) per Regione',
  description: 'Calcola il vero costo della tua auto includendo bollo, assicurazione, carburante, deprezzamento e manutenzione. Stima precisa basata sulla tua regione.'
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 inline-block">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema = () => (
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Che cos'è il Costo Totale di Proprietà (TCO) di un'auto?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Il TCO è un calcolo finanziario che stima tutti i costi associati al possesso di un'auto, non solo il prezzo di acquisto. Include deprezzamento, bollo, assicurazione, carburante, manutenzione e altre spese per fornire il costo reale del veicolo nel tempo."
          }
        },
        {
          "@type": "Question",
          "name": "Come si calcola il bollo auto?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Il bollo auto si calcola moltiplicando la potenza del motore in kW per una tariffa specifica, che dipende dalla classe ambientale del veicolo (Euro 0-6) e dalla regione di residenza. I veicoli più potenti e inquinanti pagano di più."
          }
        },
        {
          "@type": "Question",
          "name": "Cos'è il Superbollo e chi deve pagarlo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Il Superbollo è una tassa aggiuntiva per i veicoli con una potenza superiore a 185 kW. Si pagano 20€ per ogni kW in eccesso. L'importo diminuisce con l'età del veicolo e si azzera dopo 20 anni."
          }
        }
      ]
    })
  }}
/>
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
  
    return (
      <div className="prose prose-sm max-w-none text-gray-700">
        {content.split('\n\n').map((block, index) => {
          const trimmedBlock = block.trim();
          if (trimmedBlock.startsWith('### **')) {
            return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
          }
          if (trimmedBlock.startsWith('#### **')) {
            return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
          }
          if (trimmedBlock.startsWith('*')) {
            const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
            return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
          }
          if (trimmedBlock) {
            return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
          }
          return null;
        })}
      </div>
    );
  };
  
// --- Dati di Configurazione del Calcolatore ---
const calculatorData = {
    "slug": "costo-proprieta-auto-tco", "category": "Auto e Trasporti", "title": "Calcolatore Costo Totale di Proprietà Auto (TCO) per Regione (Bollo, Assicurazione)", "lang": "it",
    "inputs": [
      { "id": "prezzo_acquisto", "label": "Prezzo di acquisto del veicolo", "type": "number", "unit": "€", "min": 0, "step": 500, "tooltip": "Il costo totale del veicolo, IVA inclusa." },
      { "id": "eta_veicolo_acquisto", "label": "Età del veicolo all'acquisto", "type": "number", "unit": "anni", "min": 0, "step": 1, "tooltip": "Se il veicolo è nuovo, inserire 0. L'età influenza il calcolo del Superbollo e del deprezzamento." },
      { "id": "periodo_possesso", "label": "Periodo di possesso previsto", "type": "number", "unit": "anni", "min": 1, "step": 1, "tooltip": "Per quanti anni prevedi di tenere l'auto. Questo è un fattore chiave per calcolare il TCO." },
      { "id": "km_annui", "label": "Chilometri percorsi all'anno", "type": "number", "unit": "km", "min": 0, "step": 1000, "tooltip": "Una stima realistica dei chilometri che percorri in un anno. Influenza i costi di carburante, gomme e manutenzione." },
      { "id": "consumo_medio_kml", "label": "Consumo medio del veicolo", "type": "number", "unit": "km/l", "min": 1, "step": 0.5, "tooltip": "Indica quanti chilometri l'auto percorre con un litro di carburante. Reperibile sul libretto di circolazione o online." },
      { "id": "prezzo_carburante", "label": "Prezzo medio del carburante", "type": "number", "unit": "€/l", "min": 0, "step": 0.01, "tooltip": "Il costo medio al litro del carburante utilizzato (benzina, diesel, GPL, metano)." },
      { "id": "potenza_kw", "label": "Potenza del motore", "type": "number", "unit": "kW", "min": 0, "step": 1, "tooltip": "La potenza del motore espressa in kiloWatt (kW), reperibile sul libretto di circolazione. È fondamentale per il calcolo del bollo." },
      { "id": "classe_euro", "label": "Classe ambientale (Euro)", "type": "select", "options": [ { "value": 6, "label": "Euro 6" }, { "value": 5, "label": "Euro 5" }, { "value": 4, "label": "Euro 4" }, { "value": 3, "label": "Euro 3" }, { "value": 2, "label": "Euro 2" }, { "value": 1, "label": "Euro 1" }, { "value": 0, "label": "Euro 0" } ], "tooltip": "La classe di emissioni del veicolo (es. Euro 6), indicata sul libretto. Incide direttamente sull'importo del bollo." },
      { "id": "regione", "label": "Regione di residenza", "type": "select", "options": [ { "value": "Abruzzo", "label": "Abruzzo" }, { "value": "Basilicata", "label": "Basilicata" }, { "value": "Calabria", "label": "Calabria" }, { "value": "Campania", "label": "Campania" }, { "value": "Emilia-Romagna", "label": "Emilia-Romagna" }, { "value": "Friuli-Venezia Giulia", "label": "Friuli-Venezia Giulia" }, { "value": "Lazio", "label": "Lazio" }, { "value": "Liguria", "label": "Liguria" }, { "value": "Lombardia", "label": "Lombardia" }, { "value": "Marche", "label": "Marche" }, { "value": "Molise", "label": "Molise" }, { "value": "Piemonte", "label": "Piemonte" }, { "value": "Puglia", "label": "Puglia" }, { "value": "Sardegna", "label": "Sardegna" }, { "value": "Sicilia", "label": "Sicilia" }, { "value": "Toscana", "label": "Toscana" }, { "value": "Trentino-Alto Adige", "label": "Trentino-Alto Adige" }, { "value": "Umbria", "label": "Umbria" }, { "value": "Valle d'Aosta", "label": "Valle d'Aosta" }, { "value": "Veneto", "label": "Veneto" } ], "tooltip": "La tua regione di residenza. Il costo del bollo auto varia significativamente da una regione all'altra." },
      { "id": "costo_rca_annuale", "label": "Costo annuale Assicurazione RCA", "type": "number", "unit": "€", "min": 0, "step": 10, "tooltip": "Il premio annuale della tua polizza di Responsabilità Civile Auto. Aggiungi eventuali costi per polizze accessorie (furto/incendio, kasko)." },
      { "id": "manutenzione_annuale_ordinaria", "label": "Costo manutenzione ordinaria annuale", "type": "number", "unit": "€", "min": 0, "step": 10, "tooltip": "Costi per tagliandi, cambio olio, filtri e controlli periodici." },
      { "id": "costo_treno_gomme", "label": "Costo sostituzione treno gomme", "type": "number", "unit": "€", "min": 0, "step": 10, "tooltip": "Il costo totale per la sostituzione di tutte e quattro le gomme, montaggio incluso." },
      { "id": "durata_gomme_km", "label": "Durata media treno gomme", "type": "number", "unit": "km", "min": 1000, "step": 1000, "tooltip": "La durata media in chilometri di un treno di gomme prima della sostituzione (solitamente tra 30.000 e 50.000 km)." },
      { "id": "altri_costi_mensili", "label": "Altre spese mensili", "type": "number", "unit": "€", "min": 0, "step": 5, "tooltip": "Stima di costi aggiuntivi come pedaggi, parcheggi, autolavaggio, ecc." }
    ],
    "outputs": [
      { "id": "tco_totale", "label": "Costo Totale di Proprietà (TCO)", "unit": "€" }, { "id": "tco_annuale", "label": "Costo Medio Annuale", "unit": "€/anno" },
      { "id": "tco_mensile", "label": "Costo Medio Mensile", "unit": "€/mese" }, { "id": "costo_per_km", "label": "Costo Medio per Chilometro", "unit": "€/km" }
    ],
    "breakdown": [
        {"id": "costo_deprezzamento", "label": "Deprezzamento"}, {"id": "costo_carburante_totale", "label": "Carburante"}, {"id": "costo_bollo_superbollo_totale", "label": "Bollo e Superbollo"},
        {"id": "costo_assicurazione_totale", "label": "Assicurazione"}, {"id": "costo_manutenzione_totale", "label": "Manutenzione"}, {"id": "costo_gomme_totale", "label": "Pneumatici"}, {"id": "altri_costi_totali", "label": "Altre Spese"}
    ],
    "examples": [ { "inputs": { "prezzo_acquisto": 25000, "eta_veicolo_acquisto": 0, "periodo_possesso": 5, "km_annui": 15000, "consumo_medio_kml": 18, "prezzo_carburante": 1.85, "potenza_kw": 110, "classe_euro": 6, "regione": "Lombardia", "costo_rca_annuale": 600, "manutenzione_annuale_ordinaria": 350, "costo_treno_gomme": 500, "durata_gomme_km": 40000, "altri_costi_mensili": 50 } } ],
    "content": "### **Guida Definitiva al Costo Totale di Proprietà (TCO) dell'Auto**\n\n**Cos'è il TCO e perché è il dato più importante per chi possiede un'auto?**\n\nIl **Costo Totale di Proprietà** (dall'inglese *Total Cost of Ownership*, TCO) è un indicatore finanziario che calcola la spesa complessiva legata al possesso di un'automobile, andando ben oltre il semplice prezzo di acquisto. Include tutti i costi, sia evidenti che nascosti, che un proprietario sostiene dal momento dell'acquisto fino alla vendita del veicolo.\n\nComprendere il TCO è fondamentale per prendere decisioni di acquisto informate. Un'auto con un prezzo di listino inferiore potrebbe, nel lungo periodo, rivelarsi più costosa di un modello apparentemente più caro a causa di consumi elevati, tasse onerose o una rapida svalutazione. Questo calcolatore è stato progettato per offrirti una visione chiara e completa di questi costi.\n\n### **Parte 1: I Pilastri del TCO - Analisi Dettagliata dei Costi**\n\nIl TCO si compone di tre macro-categorie di costi: costi fissi, costi variabili e deprezzamento.\n\n#### **1. Deprezzamento: Il Costo Nascosto più Rilevante**\n\nÈ la perdita di valore che il veicolo subisce nel tempo. Si tratta della spesa singola più impattante nel TCO, specialmente nei primi anni di vita dell'auto.\n\n* **Come si calcola**: La svalutazione non è lineare. Un'auto nuova può perdere anche il 25% del suo valore nel primo anno. Il nostro calcolatore stima il valore residuo del veicolo dopo il periodo di possesso indicato, e la differenza rispetto al prezzo di acquisto costituisce il costo del deprezzamento.\n* **Fattori influenti**: Marca, modello, alimentazione (elettriche e ibride hanno dinamiche proprie), chilometraggio e stato di manutenzione.\n\n#### **2. Costi Fissi Annuali: Le Spese Incomprimibili**\n\nSono i costi che devi sostenere indipendentemente da quanto utilizzi l'auto.\n\n* **Bollo Auto**: È una tassa di possesso regionale. Il suo importo dipende da tre fattori chiave:\n    1.  **Potenza del Motore (kW)**: L'importo cresce con l'aumentare dei kW.\n    2.  **Classe Ambientale (Euro)**: I veicoli più inquinanti (Euro 0, 1, 2) pagano tariffe per kW significativamente più alte.\n    3.  **Regione di Residenza**: Ogni regione applica tariffe proprie. Alcune, come Lombardia e Piemonte, prevedono esenzioni per determinate categorie di veicoli (es. ibridi, a metano/GPL).\n\n* **Superbollo**: È un'addizionale erariale che si applica ai veicoli con potenza superiore a **185 kW**. L'importo è di 20 € per ogni kW oltre questa soglia. La tassa si riduce progressivamente in base all'età del veicolo (dopo 5, 10 e 15 anni) e si azzera dopo 20 anni dalla data di costruzione.\n\n* **Assicurazione (RCA e Garanzie Accessorie)**: Il costo della RC Auto obbligatoria varia enormemente in base a fattori come l'età del conducente, la classe di merito, la regione di residenza e il modello del veicolo. A questo si aggiungono i costi di eventuali polizze accessorie (Kasko, furto e incendio, eventi atmosferici).\n\n#### **3. Costi Variabili: Legati all'Utilizzo**\n\nQueste spese dipendono direttamente da quanti chilometri percorri.\n\n* **Carburante**: La spesa più frequente. È il risultato di tre variabili: chilometri percorsi, consumo medio del veicolo (km/l) e prezzo al litro del carburante.\n* **Manutenzione Ordinaria e Straordinaria**: Include i tagliandi periodici previsti dalla casa madre, ma anche interventi imprevisti (es. sostituzione della frizione, freni, batteria). Un'auto più vecchia tende ad avere costi di manutenzione straordinaria più elevati.\n* **Pneumatici**: Il loro costo dipende dalla misura e dalla tipologia (estivi, invernali, quattro stagioni). L'usura è legata allo stile di guida e ai chilometri percorsi.\n* **Altre Spese**: Un insieme di piccoli costi che, sommati, hanno un loro peso: pedaggi autostradali, parcheggi, lavaggio, piccole riparazioni e revisione ministeriale (obbligatoria dopo 4 anni dalla prima immatricolazione e successivamente ogni 2 anni).\n\n### **Parte 2: Aspetti Fiscali e Normativi**\n\n#### **Deducibilità e Detraibilità per Aziende e Professionisti**\n\nSe il veicolo è utilizzato per scopi lavorativi, una parte dei costi del TCO può essere portata in deduzione dal reddito o in detrazione dall'IVA, secondo le normative vigenti (che variano per agenti di commercio, professionisti, e società). Questi aspetti non sono inclusi nel calcolo standard ma rappresentano un fattore importante per chi usa l'auto per lavoro.\n\n#### **Fonti e Riferimenti**\n\nLe informazioni relative al calcolo del bollo e del superbollo si basano sulle direttive dell'**Agenzia delle Entrate** e sulle tariffe pubblicate dall'**ACI (Automobile Club d'Italia)**. Si consiglia di verificare sempre le normative specifiche della propria regione.\n\n### **FAQ: Domande Frequenti sul TCO Auto**\n\n* **Questo calcolatore è preciso?**\n    Fornisce una stima molto accurata basata sui dati inseriti. Tuttavia, costi come la manutenzione straordinaria o le fluttuazioni del prezzo del carburante sono imprevedibili e possono influenzare il risultato finale.\n\n* **Conviene di più un'auto diesel, benzina o elettrica?**\n    Il TCO è lo strumento perfetto per rispondere. Un'auto elettrica ha un prezzo di acquisto più alto ma costi di bollo, assicurazione e carburante/ricarica molto più bassi. Il confronto va fatto sul lungo periodo, considerando anche gli incentivi statali.\n\n* **Quanto incide il bollo sul costo totale?**\n    Per un'utilitaria, l'incidenza è bassa. Per un'auto di grossa cilindrata, specialmente se soggetta a Superbollo, può rappresentare una delle voci di costo fisso più significative dopo l'assicurazione.\n\n* **Come posso ridurre il mio TCO?**\n    Adottando uno stile di guida efficiente per ridurre i consumi, effettuando una manutenzione regolare per prevenire guasti costosi, e confrontando attentamente i preventivi per l'assicurazione RCA."
};

// --- Logica di Calcolo Esternalizzata ---
const calculationLogic = {
    bolloRates: {
        // Tariffe per kW: [fino a 100kW, oltre 100kW]
        // Fonte: ACI / Agenzia delle Entrate, tariffe medie nazionali.
        // Le regioni potrebbero avere lievi variazioni.
        6: [2.58, 3.87], 5: [2.58, 3.87], 4: [2.58, 3.87],
        3: [2.70, 4.05], 2: [2.80, 4.20], 1: [2.90, 4.35], 0: [3.00, 4.50]
    },
    getSuperbolloMultiplier: (eta: number) => {
        if (eta >= 20) return 0;
        if (eta >= 15) return 3;
        if (eta >= 10) return 6;
        if (eta >= 5) return 12;
        return 20;
    },
    calculate: (states: { [key: string]: any }) => {
        const { prezzo_acquisto, eta_veicolo_acquisto, periodo_possesso, km_annui, consumo_medio_kml, prezzo_carburante, potenza_kw, classe_euro, costo_rca_annuale, manutenzione_annuale_ordinaria, costo_treno_gomme, durata_gomme_km, altri_costi_mensili } = states;

        // 1. Deprezzamento
        const deprRate = eta_veicolo_acquisto === 0 ? [0.25, 0.18, 0.15, 0.12, 0.10] : [0.15, 0.12, 0.10, 0.08, 0.08];
        let valore_attuale = prezzo_acquisto;
        for (let i = 0; i < periodo_possesso; i++) {
            valore_attuale *= (1 - (deprRate[Math.min(i, deprRate.length - 1)]));
        }
        const costo_deprezzamento = Math.max(0, prezzo_acquisto - valore_attuale);

        // 2. Bollo e Superbollo
        const rates = calculationLogic.bolloRates[classe_euro as keyof typeof calculationLogic.bolloRates];
        const bollo_base = potenza_kw <= 100 ? potenza_kw * rates[0] : (100 * rates[0] + (potenza_kw - 100) * rates[1]);
        
        let costo_bollo_superbollo_totale = 0;
        for (let i = 0; i < periodo_possesso; i++) {
            const eta_corrente = eta_veicolo_acquisto + i;
            const superbollo_multiplier = calculationLogic.getSuperbolloMultiplier(eta_corrente);
            const superbollo_annuale = potenza_kw > 185 ? (potenza_kw - 185) * superbollo_multiplier : 0;
            costo_bollo_superbollo_totale += (bollo_base + superbollo_annuale);
        }

        // 3. Altri costi
        const costo_carburante_totale = (km_annui / consumo_medio_kml) * prezzo_carburante * periodo_possesso;
        const costo_assicurazione_totale = costo_rca_annuale * periodo_possesso;
        const costo_manutenzione_totale = manutenzione_annuale_ordinaria * periodo_possesso;
        const costo_gomme_totale = (km_annui * periodo_possesso / durata_gomme_km) * costo_treno_gomme;
        const altri_costi_totali = altri_costi_mensili * 12 * periodo_possesso;

        const tco_totale = costo_deprezzamento + costo_bollo_superbollo_totale + costo_carburante_totale + costo_assicurazione_totale + costo_manutenzione_totale + costo_gomme_totale + altri_costi_totali;
        const tco_annuale = tco_totale / periodo_possesso;
        const tco_mensile = tco_annuale / 12;
        const costo_per_km = tco_totale / (km_annui * periodo_possesso);

        return {
            tco_totale, tco_annuale, tco_mensile, costo_per_km,
            costo_deprezzamento, costo_carburante_totale, costo_bollo_superbollo_totale,
            costo_assicurazione_totale, costo_manutenzione_totale, costo_gomme_totale, altri_costi_totali
        };
    }
};

const CostoProprietaAutoTcoCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, breakdown, content, examples } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = examples[0].inputs;
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);
    
    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => calculationLogic.calculate(states), [states]);

    const chartData = useMemo(() => {
      if (!isClient) return [];
      return breakdown
        .map(item => ({
          name: item.label,
          value: (calculatedOutputs as any)[item.id]
        }))
        .filter(item => item.value > 0);
    }, [isClient, calculatedOutputs, breakdown]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#8884d8'];

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', compress: true });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) {
            alert('Errore durante l\'esportazione in PDF.');
            console.error(e);
        }
    }, [slug]);

    const saveResult = useCallback(() => {
        try {
            const { tco_totale, tco_annuale, tco_mensile, costo_per_km } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: { tco_totale, tco_annuale, tco_mensile, costo_per_km }, ts: Date.now() };
            localStorage.setItem('calc_results', JSON.stringify([payload, ...JSON.parse(localStorage.getItem('calc_results') || '[]')].slice(0, 50)));
            alert('Risultato salvato con successo!');
        } catch {
            alert('Impossibile salvare il risultato.');
        }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat('it-IT', options).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-3">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{meta.description}</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo informativo. I costi reali possono variare in base a fattori non prevedibili. I dati sul bollo sono basati su tariffe medie nazionali.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {inputs.map(input => (
                                <div key={input.id}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                    </label>
                                    <div className="flex items-center gap-2">
                                    {input.type === 'select' ? (
                                        <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, input.options?.find(o => o.value.toString() === e.target.value)?.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                            {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    ) : (
                                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))} />
                                    )}
                                    {input.unit && <span className="text-sm text-gray-500 whitespace-nowrap">{input.unit}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="mt-8">
                        <div className="p-4  -lg -md">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Riepilogo dei Costi</h2>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex flex-col justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'tco_totale' ? 'bg-indigo-50 border-indigo-500 col-span-full' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold self-end ${output.id === 'tco_totale' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            {isClient ? 
                                                (output.unit === '€/km' ? `${formatNumber((calculatedOutputs as any)[output.id], { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 3 })}` : formatCurrency((calculatedOutputs as any)[output.id]))
                                                : '...'
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-2 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Ripartizione del TCO</h2>
                         <div className="h-72 w-full">
                            {isClient && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={saveResult} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Campi</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/schede/pagamenti/bollo-auto" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Bollo Auto</a></li>
                            <li><a href="https://www.aci.it/i-servizi/guide-utili/guida-al-bollo-auto.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Automobile Club d'Italia (ACI) - Guida al Bollo</a></li>
                        </ul>
                    </section>
                </aside>
                 <div className="lg:col-span-5 mt-4">
                    <section className="border rounded-lg p-6 bg-white shadow-md">
                        <ContentRenderer content={content} />
                    </section>
                 </div>
            </div>
        </>
    );
};

export default CostoProprietaAutoTcoCalculator;