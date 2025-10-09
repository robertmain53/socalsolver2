'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
    title: "Calcolatore Dettagliato Costo Matrimonio (Civile vs. Religioso)",
    description: "Crea un budget analitico per il tuo matrimonio. Stima i costi di cerimonia, ricevimento, fornitori e imprevisti per un rito civile, religioso o simbolico."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
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
                        "name": "Quanto costa in media un matrimonio in Italia?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il costo medio di un matrimonio in Italia varia notevolmente, ma si attesta generalmente tra i 20.000€ e i 40.000€ per circa 100 invitati. Questo calcolatore aiuta a ottenere una stima personalizzata basata sulle proprie scelte."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Costa di più un matrimonio civile o religioso?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I costi burocratici di base sono simili. Un matrimonio religioso può avere costi aggiuntivi come l'offerta alla chiesa, ma un matrimonio civile in una location esclusiva autorizzata dal comune può risultare molto più costoso di una cerimonia in parrocchia. La vera differenza di costo dipende dalla location del rito e del ricevimento, non tanto dal rito in sé."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come si può risparmiare sui costi del matrimonio?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Si può risparmiare scegliendo la bassa stagione o un giorno infrasettimanale, riducendo il numero di invitati, optando per fiori di stagione, e valutando fornitori emergenti. Il nostro calcolatore permette di simulare diversi scenari per vedere l'impatto di queste scelte sul budget totale."
                        }
                    }
                ]
            })
        }}
    />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (trimmed.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: trimmed.replace(/### \*\*/g, '').replace(/\*\*/g, '') }} />;
                }
                if (trimmed.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: trimmed.replace(/#### \*\*/g, '').replace(/\*\*/g, '') }} />;
                }
                if (trimmed.startsWith('*')) {
                    const items = trimmed.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}</ul>;
                }
                 if (trimmed.startsWith('1.')) {
                    const items = trimmed.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                    return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}</ol>;
                }
                return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
            })}
        </div>
    );
};

// Dati di configurazione del calcolatore (inclusi direttamente)
const calculatorData = { "slug": "costo-matrimonio-civile-religioso", "category": "Famiglia e Vita Quotidiana", "title": "Calcolatore Costo Matrimonio (civile vs. religioso)", "lang": "it", "tags": "costo matrimonio, budget matrimonio, calcolatore matrimonio, matrimonio civile costi, matrimonio religioso costi, spese matrimonio, quanto costa sposarsi, wedding budget calculator", "inputs": [{ "id": "tipo_cerimonia", "label": "Tipo di Cerimonia", "type": "select", "options": ["religioso", "civile", "simbolico"], "tooltip": "Scegli il tipo di rito. Questa scelta influenzerà i costi burocratici e della cerimonia." }, { "id": "numero_invitati", "label": "Numero di Invitati", "type": "number", "min": 1, "step": 1, "tooltip": "Il numero di invitati è il fattore che più influenza il costo totale, specialmente per catering e bomboniere." }, { "id": "costo_chiesa_offerte", "label": "Offerta per la Chiesa e Corso Prematrimoniale", "type": "number", "unit": "€", "min": 0, "step": 50, "condition": "tipo_cerimonia == 'religioso'", "tooltip": "Include l'offerta liberale per la parrocchia, le spese per il libretto e il costo del corso prematrimoniale." }, { "id": "costo_comune_sala", "label": "Costo Sala Comunale o Location Autorizzata", "type": "number", "unit": "€", "min": 0, "step": 50, "condition": "tipo_cerimonia == 'civile'", "tooltip": "Costo per l'affitto della sala comunale o di una location esterna autorizzata (es. villa, castello). Può variare molto in base al giorno e all'orario." }, { "id": "costo_celebrante_simbolico", "label": "Compenso Celebrante Simbolico", "type": "number", "unit": "€", "min": 0, "step": 50, "condition": "tipo_cerimonia == 'simbolico'", "tooltip": "Compenso per un celebrante professionista che ofici il rito simbolico." }, { "id": "documenti_burocrazia", "label": "Spese Burocratiche (marche da bollo, etc.)", "type": "number", "unit": "€", "min": 0, "step": 5, "tooltip": "Costo per le marche da bollo necessarie per le pubblicazioni e altri documenti ufficiali." }, { "id": "costo_location", "label": "Affitto Location Ricevimento", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Il costo per l'affitto in esclusiva della villa, ristorante, agriturismo o altra struttura per il ricevimento." }, { "id": "costo_catering_per_invitato", "label": "Costo Catering per Invitato", "type": "number", "unit": "€", "min": 0, "step": 5, "tooltip": "Il prezzo a persona per il menù del ricevimento (aperitivo, pranzo/cena). È una delle voci di spesa più importanti." }, { "id": "abito_sposa", "label": "Abito da Sposa", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Costo dell'abito, incluse eventuali modifiche sartoriali." }, { "id": "abito_sposo", "label": "Abito da Sposo", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Costo dell'abito dello sposo, completo di accessori." }, { "id": "trucco_acconciatura", "label": "Trucco e Acconciatura Sposa", "type": "number", "unit": "€", "min": 0, "step": 20, "tooltip": "Include le prove e il servizio il giorno del matrimonio." }, { "id": "fedi_nuziali", "label": "Fedi Nuziali", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Il costo varia molto in base al materiale (oro, platino) e alla lavorazione." }, { "id": "fiori_allestimenti", "label": "Addobbi Floreali e Allestimenti", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Include bouquet, fiori per la cerimonia, centrotavola per il ricevimento e altri allestimenti." }, { "id": "servizio_foto_video", "label": "Servizio Fotografico e Video", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Compenso per fotografi e videomaker per coprire l'intera giornata, la post-produzione e la consegna degli album/video." }, { "id": "partecipazioni_bomboniere", "label": "Partecipazioni, Bomboniere e Confetti", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Spese per la stampa delle partecipazioni, l'acquisto delle bomboniere per gli invitati e la confettata." }, { "id": "musica_intrattenimento", "label": "Musica e Intrattenimento (DJ/Band, SIAE)", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Compenso per musicisti, DJ, animatori e il costo per il permesso SIAE, obbligatorio per la diffusione di musica." }, { "id": "wedding_planner", "label": "Ingaggiare una Wedding Planner?", "type": "boolean", "tooltip": "Spunta se prevedi di avvalerti di un professionista per l'organizzazione. Può avere un costo fisso o una percentuale sul totale." }, { "id": "costo_wedding_planner", "label": "Costo Wedding Planner", "type": "number", "unit": "€", "min": 0, "step": 100, "condition": "wedding_planner == true", "tooltip": "Inserisci il compenso fisso o una stima del costo della wedding planner." }, { "id": "viaggio_nozze", "label": "Viaggio di Nozze", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Budget dedicato alla luna di miele. Spesso è una voce a parte, ma è utile includerla per una visione completa." }, { "id": "fondo_imprevisti_percentuale", "label": "Percentuale per Fondo Imprevisti", "type": "number", "unit": "%", "min": 0, "step": 1, "tooltip": "È saggio accantonare una percentuale (consigliato 10-15%) per spese inaspettate o extra." }], "outputs": [{ "id": "costo_totale_ricevimento", "label": "Costo Totale Ricevimento", "unit": "€" }, { "id": "costo_totale_fornitori", "label": "Costo Totale Fornitori e Servizi", "unit": "€" }, { "id": "costo_totale_cerimonia", "label": "Costo Totale Cerimonia e Burocrazia", "unit": "€" }, { "id": "costo_imprevisti", "label": "Fondo per Imprevisti", "unit": "€" }, { "id": "costo_totale_matrimonio", "label": "STIMA COSTO TOTALE MATRIMONIO", "unit": "€" }, { "id": "costo_per_invitato", "label": "Costo Medio per Invitato", "unit": "€" }], "formulaSteps": [{ "id": "costo_cerimonia_specifico", "expr": "(tipo_cerimonia == 'religioso' ? costo_chiesa_offerte : (tipo_cerimonia == 'civile' ? costo_comune_sala : costo_celebrante_simbolico))" }, { "id": "costo_totale_cerimonia", "expr": "costo_cerimonia_specifico + documenti_burocrazia" }, { "id": "costo_totale_catering", "expr": "costo_catering_per_invitato * numero_invitati" }, { "id": "costo_totale_ricevimento", "expr": "costo_location + costo_totale_catering" }, { "id": "costo_planner", "expr": "wedding_planner ? costo_wedding_planner : 0" }, { "id": "costo_totale_fornitori", "expr": "abito_sposa + abito_sposo + trucco_acconciatura + fedi_nuziali + fiori_allestimenti + servizio_foto_video + partecipazioni_bomboniere + musica_intrattenimento + costo_planner + viaggio_nozze" }, { "id": "subtotale", "expr": "costo_totale_cerimonia + costo_totale_ricevimento + costo_totale_fornitori" }, { "id": "costo_imprevisti", "expr": "subtotale * (fondo_imprevisti_percentuale / 100)" }, { "id": "costo_totale_matrimonio", "expr": "subtotale + costo_imprevisti" }, { "id": "costo_per_invitato", "expr": "numero_invitati > 0 ? (costo_totale_matrimonio / numero_invitati) : 0" }], "examples": [{ "inputs": { "tipo_cerimonia": "religioso", "numero_invitati": 100, "costo_chiesa_offerte": 300, "costo_comune_sala": 200, "costo_celebrante_simbolico": 500, "documenti_burocrazia": 32, "costo_location": 4000, "costo_catering_per_invitato": 130, "abito_sposa": 2500, "abito_sposo": 800, "trucco_acconciatura": 450, "fedi_nuziali": 700, "fiori_allestimenti": 1500, "servizio_foto_video": 2500, "partecipazioni_bomboniere": 1200, "musica_intrattenimento": 800, "wedding_planner": false, "costo_wedding_planner": 2000, "viaggio_nozze": 5000, "fondo_imprevisti_percentuale": 10 }, "outputs": { "costo_totale_ricevimento": 17000, "costo_totale_fornitori": 15450, "costo_totale_cerimonia": 332, "costo_imprevisti": 3278.2, "costo_totale_matrimonio": 36060.2, "costo_per_invitato": 360.60 } }], "content": "### **Guida Definitiva al Budget del Matrimonio: Civile, Religioso o Simbolico?**\n\nOrganizzare il matrimonio dei propri sogni richiede passione, tempo e, soprattutto, una pianificazione finanziaria attenta. Capire **quanto costa un matrimonio** è il primo passo per trasformare un desiderio in un progetto concreto e senza stress. Questo calcolatore è stato progettato per darti una stima dettagliata e realistica, aiutandoti a navigare tra le diverse voci di spesa e a comprendere le differenze chiave tra i vari tipi di cerimonia.\n\nUsa questo strumento come una base solida per costruire il tuo budget. Inserisci i costi stimati per ogni voce e osserva come il totale si aggiorna in tempo reale. Ricorda, ogni matrimonio è unico: i valori sono indicativi, ma la metodologia di calcolo ti fornirà una consapevolezza indispensabile.\n\n### **Parte 1: Le Macrocategorie di Spesa di un Matrimonio**\n\nPer pianificare con efficacia, è utile raggruppare le spese in categorie principali. Il nostro calcolatore le suddivide in:\n\n1.  **Cerimonia e Burocrazia**: I costi direttamente legati al rito, che variano significativamente in base alla tua scelta.\n2.  **Ricevimento**: La voce di spesa più impattante, che include l'affitto della location e il catering, strettamente legata al numero di invitati.\n3.  **Fornitori e Servizi**: Comprende tutti i professionisti e i dettagli che rendono speciale il tuo giorno: abiti, fiori, foto, musica e molto altro.\n4.  **Extra e Imprevisti**: Include voci come il viaggio di nozze e un fondo di emergenza, cruciale per gestire qualsiasi spesa inaspettata.\n\n### **Parte 2: Analisi dei Costi: Matrimonio Civile vs. Religioso**\n\nLa scelta del rito non ha solo un valore simbolico e legale, ma anche un impatto economico specifico. Vediamo le differenze.\n\n#### **Il Matrimonio con Rito Civile**\n\n* **Validità**: Ha esclusiva validità legale per lo Stato Italiano.\n* **Location**: Si può celebrare gratuitamente (o quasi) nella **Casa Comunale** nei giorni e orari d'ufficio. Tuttavia, sempre più coppie scelgono **location esterne autorizzate** dal Comune (ville, castelli, agriturismi), il cui costo di affitto può variare da poche centinaia a diverse migliaia di euro.\n* **Burocrazia**: Il costo principale è legato alle **marche da bollo** (solitamente due da 16,00 €) per le pubblicazioni di matrimonio. Se gli sposi risiedono in comuni diversi, le marche da bollo raddoppiano.\n* **Flessibilità**: Offre ampia libertà di personalizzazione della cerimonia con letture, musiche e promesse personali.\n\n#### **Il Matrimonio con Rito Religioso (Concordatario)**\n\n* **Validità**: Grazie al Concordato tra Stato e Chiesa, ha una **doppia validità**: religiosa e civile. Il parroco si occupa della trascrizione dell'atto nei registri civili.\n* **Location**: La celebrazione avviene in chiesa.\n* **Costi Specifici**: Non si paga un 'prezzo' per il sacramento, ma è consuetudine lasciare un'**offerta libera** alla parrocchia (indicativamente 200-400 €) per le spese di gestione. A questo si aggiunge il costo del **corso prematrimoniale** (spesso un'offerta libera) e le spese per il disbrigo delle pratiche ecclesiastiche (es. nulla osta del Vescovo se ci si sposa fuori diocesi).\n* **Tradizione**: Segue una liturgia precisa, ma anche qui c'è spazio per personalizzare alcuni aspetti come canti e letture.\n\n#### **Il Matrimonio con Rito Simbolico**\n\n* **Validità**: Non ha alcun valore legale. Deve essere sempre preceduto o seguito da un rito civile per ufficializzare l'unione.\n* **Costi**: Il costo principale è il compenso del **celebrante professionista** (300-700 €), che creerà una cerimonia completamente su misura per la coppia.\n* **Location e Flessibilità**: Massima libertà. Può essere celebrato ovunque (spiaggia, bosco, giardino di casa) e in qualsiasi modo si desideri.\n\n### **Parte 3: Guida al Risparmio per Ogni Voce di Spesa**\n\nUn budget ben gestito non significa rinunciare alla qualità. Ecco alcuni consigli pratici:\n\n* **Numero Invitati**: La via più efficace per ridurre i costi. Create una lista ponderata, dividendo tra 'indispensabili' e 'desiderati'.\n* **Data del Matrimonio**: Sposarsi in **bassa stagione** (da ottobre ad aprile) o in un **giorno feriale** può portare a sconti significativi su location e fornitori.\n* **Location e Catering**: Valutate soluzioni 'tutto incluso' che spesso sono più convenienti. Un agriturismo con cucina interna può costare meno di una villa più un catering esterno.\n* **Abiti**: Considerate abiti da cerimonia di collezioni passate, campionari o il noleggio. Anche gli atelier sartoriali possono offrire soluzioni su misura a prezzi competitivi.\n* **Fiori**: Scegliete fiori di stagione e riutilizzate gli allestimenti della cerimonia per il ricevimento.\n* **Fai-da-te (con cautela)**: Partecipazioni, bomboniere o tableau mariage possono essere realizzati in casa, ma solo se avete tempo e abilità. Un fai-da-te mal eseguito può costare più di un acquisto.\n* **Musica**: Un DJ è generalmente più economico di una band dal vivo. Assicuratevi di calcolare il costo della **SIAE**, che è obbligatorio.\n\n### **Parte 4: Aspetti Burocratici e Legali**\n\nIndipendentemente dal rito, ci sono passaggi burocratici obbligatori.\n\n1.  **Pubblicazioni**: La richiesta va fatta all'Ufficiale di Stato Civile del Comune di residenza di uno dei due sposi almeno 2-3 mesi prima della data prevista. Le pubblicazioni restano affisse per 8 giorni consecutivi.\n2.  **Scelta del Regime Patrimoniale**: Al momento delle pubblicazioni, dovrete comunicare la vostra scelta tra **comunione dei beni** (il regime standard, dove gli acquisti post-matrimonio sono di entrambi) o **separazione dei beni** (ognuno resta proprietario dei beni che acquista). È una decisione importante con implicazioni legali significative.\n\n**Disclaimer**: Questo calcolatore fornisce una stima accurata basata sui dati inseriti, ma non può sostituire i preventivi reali dei fornitori. Usatelo come punto di partenza per una pianificazione finanziaria consapevole.\n" };

const CostoMatrimonioCivileReligiosoCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = calculatorData.examples[0].inputs;
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = useCallback(() => {
        setStates(initialStates);
    }, [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const s = states;
        const results: { [key: string]: number } = {};
        
        const costo_cerimonia_specifico = (s.tipo_cerimonia === 'religioso' ? Number(s.costo_chiesa_offerte) : (s.tipo_cerimonia === 'civile' ? Number(s.costo_comune_sala) : Number(s.costo_celebrante_simbolico)));
        results.costo_totale_cerimonia = costo_cerimonia_specifico + Number(s.documenti_burocrazia);
        
        const costo_totale_catering = Number(s.costo_catering_per_invitato) * Number(s.numero_invitati);
        results.costo_totale_ricevimento = Number(s.costo_location) + costo_totale_catering;
        
        const costo_planner = s.wedding_planner ? Number(s.costo_wedding_planner) : 0;
        results.costo_totale_fornitori = Number(s.abito_sposa) + Number(s.abito_sposo) + Number(s.trucco_acconciatura) + Number(s.fedi_nuziali) + Number(s.fiori_allestimenti) + Number(s.servizio_foto_video) + Number(s.partecipazioni_bomboniere) + Number(s.musica_intrattenimento) + costo_planner + Number(s.viaggio_nozze);

        const subtotale = results.costo_totale_cerimonia + results.costo_totale_ricevimento + results.costo_totale_fornitori;
        results.costo_imprevisti = subtotale * (Number(s.fondo_imprevisti_percentuale) / 100);
        results.costo_totale_matrimonio = subtotale + results.costo_imprevisti;
        results.costo_per_invitato = Number(s.numero_invitati) > 0 ? (results.costo_totale_matrimonio / Number(s.numero_invitati)) : 0;
        
        return results;
    }, [states]);

    const chartData = [
        { name: 'Ricevimento', value: calculatedOutputs.costo_totale_ricevimento },
        { name: 'Fornitori/Servizi', value: calculatedOutputs.costo_totale_fornitori },
        { name: 'Cerimonia', value: calculatedOutputs.costo_totale_cerimonia },
        { name: 'Viaggio di Nozze', value: states.viaggio_nozze },
        { name: 'Imprevisti', value: calculatedOutputs.costo_imprevisti },
    ];
    const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    const handleExportPDF = useCallback(async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        
        const element = calculatorRef.current;
        if (!element) return;
        
        const canvas = await html2canvas(element, { scale: 2, logging: false, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        pdf.save(`${slug}.pdf`);
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch {
            alert("Impossibile salvare il risultato.");
        }
    }, [states, calculatedOutputs, slug, title]);


    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Sinistra: Inputs */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                    <p className="text-gray-600 mb-4">Usa questo strumento per creare una stima dettagliata del budget per il tuo matrimonio.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {inputs.map(input => {
                            const conditionMet = !input.condition || 
                                (input.condition.includes('== true') && states[input.condition.split(' ')[0]]) ||
                                (input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split("'")[1]);

                            if (!conditionMet) return null;

                            const inputLabel = (
                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                    {input.label}
                                    {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                </label>
                            );

                            if (input.type === 'boolean') {
                                return (
                                    <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-gray-50 border mt-2">
                                        <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                        <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                         {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                    </div>
                                );
                            }
                            
                             if (input.type === 'select') {
                                return (
                                     <div key={input.id} className="md:col-span-2">
                                        {inputLabel}
                                        <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 capitalize">
                                            {input.options?.map(opt => <option key={opt} value={opt} className="capitalize">{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                                        </select>
                                    </div>
                                )
                            }

                            return (
                                <div key={input.id}>
                                    {inputLabel}
                                    <div className="flex items-center">
                                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : parseFloat(e.target.value))} />
                                        {input.unit && <span className="text-sm text-gray-500 ml-2">{input.unit}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Colonna Destra: Risultati e Azioni */}
                <aside className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="border rounded-lg p-6 bg-white shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Riepilogo Costi</h2>
                         <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce preventivi reali.
                        </div>

                        {outputs.map(output => (
                             <div key={output.id} className={`flex items-baseline justify-between py-3 border-b ${output.id === 'costo_totale_matrimonio' ? 'flex-col items-start' : ''}`}>
                                <p className="text-sm text-gray-600">{output.label}</p>
                                <p className={`font-bold ${output.id === 'costo_totale_matrimonio' ? 'text-3xl text-indigo-600 mt-1' : 'text-lg text-gray-800'}`}>
                                    {isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}
                                </p>
                            </div>
                        ))}
                         <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Distribuzione del Budget</h3>
                             <div className="h-56 w-full">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend iconSize={10} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                             </div>
                         </div>
                    </div>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors text-sm">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors text-sm">Esporta PDF</button>
                            <button onClick={handleReset} className="w-full border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors text-sm">Reset</button>
                        </div>
                    </section>
                </aside>

                {/* Sezione Contenuti Approfonditi */}
                <div className="lg:col-span-5 bg-white rounded-lg shadow-md p-6">
                     <section>
                        <ContentRenderer content={content} />
                    </section>
                    <hr className="my-6"/>
                    <section>
                        <h3 className="text-xl font-bold mt-6 mb-4 text-gray-800">Fonti e Riferimenti Normativi</h3>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                             <li><a href="https://www.governo.it/it/articolo/il-matrimonio/10452" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Presidenza del Consiglio dei Ministri - Il Matrimonio</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice Civile, Artt. 79-230</a> - Norme sul matrimonio.</li>
                            <li><a href="https://www.siae.it/it/servizi-online-term/permessi-feste-private" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">SIAE - Permessi per Feste Private</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </>
    );
};

export default CostoMatrimonioCivileReligiosoCalculator;