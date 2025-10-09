// lib/calculator-registry.ts
import { Lang } from './categories';

export interface CalculatorMetadata {
  slug: string;
  component: string; // Component file name
  category: string;
  lang: Lang;
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  hasContent?: boolean; // Whether markdown content exists
}

/**
 * Central registry of ALL calculators across all languages
 * This is the single source of truth - no more hardcoded lists!
 */
export const CALCULATOR_REGISTRY: CalculatorMetadata[] = [
  // Italian Calculators - Fisco e Lavoro Autonomo
  {
    slug: 'tasse-regime-forfettario',
    component: 'TasseRegimeForfettarioCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Tasse Regime Forfettario 2025',
    description: 'Calcola tasse, contributi INPS, acconti e saldo per il regime forfettario. Simulatore completo con aliquote 5% e 15%.',
    keywords: ['regime forfettario', 'partita iva', 'tasse', 'INPS', 'acconti'],
    hasContent: true,
  },
  {
    slug: 'tassazione-psicologi',
    component: 'TassazionePsicologiCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Tasse Psicologi con Partita IVA',
    description: 'Calcola tasse e contributi Enpap per psicologi e psicoterapeuti con partita IVA in regime forfettario o ordinario.',
    keywords: ['psicologo', 'partita iva', 'enpap', 'tasse psicologi'],
    hasContent: true,
  },
  {
    slug: 'tassazione-giornalisti',
    component: 'TasseGiornalistiCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Tasse Giornalisti e Contributi INPGI',
    description: 'Calcola tasse e contributi previdenziali INPGI per giornalisti freelance, pubblicisti e praticanti.',
    keywords: ['giornalista', 'INPGI', 'partita iva giornalista', 'pubblicista'],
    hasContent: true,
  },
  {
    slug: 'tassazione-periti-industriali-eppi',
    component: 'TassazionePeritiIndustrialiEppiCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Tasse Periti Industriali e Contributi EPPI',
    description: 'Simulatore tasse per periti industriali iscritti EPPI: calcola IRPEF, addizionali e contributi previdenziali.',
    keywords: ['perito industriale', 'EPPI', 'tasse periti', 'contributi EPPI'],
    hasContent: true,
  },
  {
    slug: 'tassazione-istruttori-palestra-partita-iva',
    component: 'TassazioneIstruttoriPalestraPartitaIvaCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Tasse Istruttori Palestra con Partita IVA',
    description: 'Calcola tasse e contributi per personal trainer e istruttori fitness con partita IVA.',
    keywords: ['personal trainer', 'istruttore palestra', 'partita iva fitness'],
    hasContent: true,
  },
  {
    slug: 'tassazione-copywriter-freelance',
    component: 'TassazioneCopywriterFreelanceCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Tasse Copywriter e Web Writer Freelance',
    description: 'Calcola tasse per copywriter, content writer e web writer freelance. Regime forfettario vs ordinario.',
    keywords: ['copywriter', 'web writer', 'content writer', 'partita iva copywriting'],
    hasContent: true,
  },
  {
    slug: 'tassazione-graphic-designer-freelance',
    component: 'TassazioneGraphicDesignerFreelanceCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Tasse Graphic Designer Freelance',
    description: 'Simulatore tasse per graphic designer, illustratori e designer freelance con partita IVA.',
    keywords: ['graphic designer', 'designer freelance', 'illustratore', 'partita iva design'],
    hasContent: true,
  },
  {
    slug: 'calcolatore-agenti-commercio',
    component: 'CalcolatoreAgentiCommercioCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Tasse e Contributi Enasarco Agenti di Commercio',
    description: 'Calcola tasse, contributi Enasarco e FIRR per agenti e rappresentanti di commercio.',
    keywords: ['agente di commercio', 'enasarco', 'FIRR', 'rappresentante'],
    hasContent: true,
  },
  {
    slug: 'contributi-previdenziali-artigiani-commercianti',
    component: 'ContributiPrevidenzialiArtigianiCommerciantiCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Contributi INPS Artigiani e Commercianti 2025',
    description: 'Calcola contributi fissi e variabili INPS per artigiani e commercianti. Minimale e massimale 2025.',
    keywords: ['contributi INPS', 'artigiani', 'commercianti', 'contributi fissi'],
    hasContent: true,
  },
  {
    slug: 'tassazione-affitti-brevi',
    component: 'TassazioneAffittiBreviCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Tasse Affitti Brevi e Cedolare Secca 21%',
    description: 'Calcola tasse per affitti brevi turistici: cedolare secca 21% o 26%, confronto con tassazione ordinaria.',
    keywords: ['affitti brevi', 'airbnb', 'cedolare secca', 'tasse affitti turistici'],
    hasContent: true,
  },
  {
    slug: 'ritenuta-dacconto-fornitori',
    component: 'RitenutaDaccontoFornitoriCalculator',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolo Ritenuta d\'Acconto 20% - Fatture Professionisti',
    description: 'Calcola ritenuta d\'acconto del 20% su fatture di professionisti. Netto da pagare e importo ritenuta.',
    keywords: ['ritenuta acconto', 'fattura professionista', 'ritenuta 20%'],
    hasContent: true,
  },

  // Italian - Immobiliare e Casa
  {
    slug: 'costi-notaio-compravendita-mutuo',
    component: 'CostiNotaioCompravenditaMutuoCalculator',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolo Costi Notaio per Acquisto Casa e Mutuo',
    description: 'Calcola onorario notaio, imposte di registro, ipotecarie e catastali per compravendita immobiliare.',
    keywords: ['notaio', 'costi notaio', 'acquisto casa', 'imposte registro'],
    hasContent: true,
  },
  {
    slug: 'imposta-registro-ipotecaria-catastale',
    component: 'ImpostaRegistroIpotecariaCatastaleCalculator',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolo Imposte Registro Ipotecaria e Catastale',
    description: 'Calcola imposta di registro, ipotecaria e catastale per acquisto prima casa e seconda casa.',
    keywords: ['imposta registro', 'imposta ipotecaria', 'imposta catastale', 'acquisto casa'],
    hasContent: true,
  },
  {
    slug: 'imposta-successione-donazione',
    component: 'ImpostaSuccessioneDonazioneCalculator',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolo Imposta di Successione e Donazione',
    description: 'Calcola imposta di successione e donazione in base al grado di parentela e patrimonio ereditario.',
    keywords: ['successione', 'donazione', 'imposta successione', 'eredità'],
    hasContent: true,
  },
  {
    slug: 'detrazioni-bonus-mobili',
    component: 'DetrazioniBonusMobiliCalculator',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolo Bonus Mobili 2025 - Detrazioni 50%',
    description: 'Calcola detrazione fiscale 50% per acquisto mobili ed elettrodomestici dopo ristrutturazione.',
    keywords: ['bonus mobili', 'detrazione mobili', 'elettrodomestici', 'ristrutturazione'],
    hasContent: true,
  },
  {
    slug: 'costo-cappotto-termico-incentivi',
    component: 'CostoCappottoTermicoIncentiviCalculator',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolo Costo Cappotto Termico con Ecobonus',
    description: 'Stima costi cappotto termico esterno/interno e calcola detrazioni fiscali con ecobonus.',
    keywords: ['cappotto termico', 'ecobonus', 'isolamento termico', 'detrazioni'],
    hasContent: true,
  },
  {
    slug: 'calcolo-tari-per-comune',
    component: 'CalcoloTariPerComuneCalculator',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolo TARI - Tassa Rifiuti per Comune',
    description: 'Calcola tassa rifiuti TARI in base a comune, superficie abitazione e numero componenti nucleo familiare.',
    keywords: ['TARI', 'tassa rifiuti', 'calcolo tari', 'tariffa comunale'],
    hasContent: true,
  },

  // Italian - Risparmio e Investimenti
  {
    slug: 'tassazione-dividendi-italiani-esteri',
    component: 'TassazioneDividendiItalianiEsteriCalculator',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolo Tassazione Dividendi Italiani ed Esteri',
    description: 'Calcola tassazione al 26% su dividendi azionari italiani ed esteri. Ritenuta alla fonte e netto percepito.',
    keywords: ['dividendi', 'tassazione dividendi', 'azioni', 'dividendi esteri'],
    hasContent: true,
  },
  {
    slug: 'rendimento-netto-btp-vs-conto-deposito',
    component: 'RendimentoNettoBtpVsContoDepositoCalculator',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'BTP vs Conto Deposito: Confronto Rendimento Netto',
    description: 'Confronta rendimento netto di BTP e conti deposito al netto di tasse e inflazione.',
    keywords: ['BTP', 'conto deposito', 'rendimento netto', 'investimenti sicuri'],
    hasContent: true,
  },
  {
    slug: 'tassazione-criptovalute-quadro-rw',
    component: 'TassazioneCriptovaluteQuadroRwCalculator',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolo Tasse Criptovalute e Quadro RW',
    description: 'Calcola tasse su plusvalenze crypto, imposta 26%, compilazione quadro RW e soglia 2000€.',
    keywords: ['criptovalute', 'crypto', 'bitcoin', 'tasse crypto', 'quadro RW'],
    hasContent: true,
  },
  {
    slug: 'tassazione-crowdfunding-equity-lending',
    component: 'TassazioneCrowdfundingEquityLendingCalculator',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Tassazione Crowdfunding Equity e Lending',
    description: 'Calcola tasse su rendimenti da crowdfunding immobiliare, equity e lending. Tassazione 26%.',
    keywords: ['crowdfunding', 'equity crowdfunding', 'lending', 'tassazione crowdfunding'],
    hasContent: true,
  },
  {
    slug: 'tassazione-polizze-vita-ramo-1-3',
    component: 'TassazionePolizzeVitaRamo13Calculator',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Tassazione Polizze Vita Ramo I e Ramo III',
    description: 'Calcola tassazione su polizze vita: 26% su unit linked (ramo III), 12.5% su gestioni separate (ramo I).',
    keywords: ['polizze vita', 'unit linked', 'ramo I', 'ramo III'],
    hasContent: true,
  },
  {
    slug: 'convenienza-fondo-pensione-vs-tfr',
    component: 'ConvenienzaFondoPensioneVsTfrCalculator',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Fondo Pensione vs TFR: Convenienza e Confronto',
    description: 'Confronta convenienza tra fondo pensione integrativo e TFR in azienda. Calcola vantaggi fiscali.',
    keywords: ['fondo pensione', 'TFR', 'previdenza complementare', 'pensione integrativa'],
    hasContent: true,
  },

  // Italian - Veicoli e Trasporti
  {
    slug: 'bollo-auto-e-superbollo',
    component: 'BolloAutoESuperbolloCalculator',
    category: 'veicoli-e-trasporti',
    lang: 'it',
    title: 'Calcolo Bollo Auto e Superbollo 2025',
    description: 'Calcola bollo auto in base a regione, kW, euro e superbollo per auto di lusso oltre 185 kW.',
    keywords: ['bollo auto', 'superbollo', 'tassa automobilistica', 'calcolo bollo'],
    hasContent: true,
  },
  {
    slug: 'passaggio-proprieta-auto',
    component: 'PassaggioProprietaAutoCalculator',
    category: 'veicoli-e-trasporti',
    lang: 'it',
    title: 'Calcolo Costi Passaggio di Proprietà Auto',
    description: 'Calcola costi PRA, IPT, imposta di trascrizione e emolumenti ACI per passaggio proprietà veicoli.',
    keywords: ['passaggio proprietà', 'PRA', 'IPT', 'costi passaggio auto'],
    hasContent: true,
  },
  {
    slug: 'leasing-vs-noleggio-vs-acquisto',
    component: 'LeasingVsNoleggioVsAcquistoCalculator',
    category: 'veicoli-e-trasporti',
    lang: 'it',
    title: 'Leasing vs Noleggio vs Acquisto Auto: Confronto',
    description: 'Confronta convenienza economica tra leasing, noleggio a lungo termine e acquisto diretto auto.',
    keywords: ['leasing auto', 'noleggio lungo termine', 'acquisto auto', 'confronto'],
    hasContent: true,
  },
  {
    slug: 'costo-revisione-auto',
    component: 'CostoRevisioneAutoCalculator',
    category: 'veicoli-e-trasporti',
    lang: 'it',
    title: 'Calcolo Costo Revisione Auto Motorizzazione',
    description: 'Calcola costo revisione auto presso Motorizzazione o centri privati autorizzati. Scadenze e tariffe.',
    keywords: ['revisione auto', 'motorizzazione', 'costo revisione', 'scadenza revisione'],
    hasContent: true,
  },
  {
    slug: 'ammortamento-auto-agenti-commercio',
    component: 'AmmortamentoAutoAgentiCommercioCalculator',
    category: 'veicoli-e-trasporti',
    lang: 'it',
    title: 'Ammortamento Auto Agenti di Commercio',
    description: 'Calcola ammortamento fiscale auto per agenti di commercio: deducibilità 80% costi e 100% IVA.',
    keywords: ['ammortamento auto', 'agenti commercio', 'deduzione auto', 'IVA auto'],
    hasContent: true,
  },
  {
    slug: 'deducibilita-costi-auto-aziendale',
    component: 'DeducibilitaCostiAutoAziendaleCalculator',
    category: 'veicoli-e-trasporti',
    lang: 'it',
    title: 'Deducibilità Costi Auto Aziendale e Partita IVA',
    description: 'Calcola deducibilità fiscale costi auto aziendale: carburante, manutenzione, ammortamento e IVA.',
    keywords: ['auto aziendale', 'deduzione auto', 'costi deducibili', 'partita iva auto'],
    hasContent: true,
  },

  // Italian - PMI e Impresa
  {
    slug: 'costo-totale-dipendente-cuneo-fiscale',
    component: 'CostoTotaleDipendenteCuneoFiscaleCalculator',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolo Costo Dipendente e Cuneo Fiscale',
    description: 'Calcola costo totale dipendente (RAL + contributi INPS), netto in busta paga e cuneo fiscale.',
    keywords: ['costo dipendente', 'cuneo fiscale', 'contributi INPS', 'RAL'],
    hasContent: true,
  },
  {
    slug: 'break-even-point',
    component: 'BreakEvenPointStartupCalculator',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolo Break Even Point e Punto di Pareggio',
    description: 'Calcola punto di pareggio (BEP): quando un\'azienda o startup copre tutti i costi con i ricavi.',
    keywords: ['break even point', 'punto pareggio', 'analisi costi', 'startup'],
    hasContent: true,
  },
  {
    slug: 'valore-azienda-multipli-ebitda',
    component: 'ValoreAziendaMultipliEbitdaCalculator',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Valutazione Azienda con Multipli EBITDA',
    description: 'Calcola valore d\'impresa con metodo multipli EBITDA per valutazione M&A e cessione azienda.',
    keywords: ['valutazione azienda', 'EBITDA', 'multipli', 'M&A', 'cessione azienda'],
    hasContent: true,
  },
  {
    slug: 'liquidazione-iva-trimestrale-mensile',
    component: 'LiquidazioneIvaTrimestraleMensileCalculator',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolo Liquidazione IVA Trimestrale e Mensile',
    description: 'Calcola liquidazione IVA periodica: IVA a debito, credito, versamento trimestrale o mensile.',
    keywords: ['liquidazione IVA', 'IVA trimestrale', 'IVA mensile', 'calcolo IVA'],
    hasContent: true,
  },
  {
    slug: 'credito-imposta-investimenti-40',
    component: 'CreditoImpostaInvestimenti40Calculator',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Credito d\'Imposta Investimenti 4.0 - Transizione Digitale',
    description: 'Calcola credito d\'imposta su investimenti in beni strumentali 4.0: software, macchinari, tecnologie.',
    keywords: ['credito imposta', 'industria 4.0', 'transizione digitale', 'beni strumentali'],
    hasContent: true,
  },
  {
    slug: 'ammortamento-beni-strumentali',
    component: 'AmmortamentoBeniStrumentaliCalculator',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolo Ammortamento Beni Strumentali',
    description: 'Calcola ammortamento fiscale e civilistico di beni strumentali: macchinari, attrezzature, software.',
    keywords: ['ammortamento', 'beni strumentali', 'coefficienti ammortamento', 'deduzione fiscale'],
    hasContent: true,
  },
  {
    slug: 'ravvedimento-operoso-f24',
    component: 'RavvedimentoOperosoF24Calculator',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolo Ravvedimento Operoso e Sanzioni',
    description: 'Calcola ravvedimento operoso per pagamenti tardivi: sanzioni ridotte e interessi legali.',
    keywords: ['ravvedimento operoso', 'sanzioni fiscali', 'F24 tardivo', 'interessi legali'],
    hasContent: true,
  },
  {
    slug: 'imposta-bollo-fatture',
    component: 'ImpostaBolloFattureCalculator',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolo Imposta di Bollo su Fatture Elettroniche',
    description: 'Calcola quando applicare marca da bollo 2€ su fatture elettroniche oltre 77,47€ senza IVA.',
    keywords: ['bollo fatture', 'marca da bollo', 'fattura elettronica', 'imposta bollo 2 euro'],
    hasContent: true,
  },

  // Italian - Famiglia e Vita Quotidiana
  {
    slug: 'assegno-mantenimento-divorzio',
    component: 'AssegnoMantenimentoDivorzioCalculator',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolo Assegno Mantenimento Figli e Coniuge',
    description: 'Calcola assegno di mantenimento per figli e ex coniuge in caso di separazione o divorzio.',
    keywords: ['mantenimento figli', 'divorzio', 'separazione', 'assegno coniuge'],
    hasContent: true,
  },
  {
    slug: 'costo-matrimonio-civile-religioso',
    component: 'CostoMatrimonioCivileReligiosoCalculator',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolo Costo Matrimonio Civile e Religioso',
    description: 'Stima budget matrimonio: location, catering, fotografo, fiori, abiti, bomboniere e servizi.',
    keywords: ['matrimonio', 'costo matrimonio', 'budget matrimonio', 'organizzazione matrimonio'],
    hasContent: true,
  },
  {
    slug: 'imposta-successione-donazione',
    component: 'ImpostaSuccessioneDonazioneCalculator',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolo Imposta di Successione e Donazione',
    description: 'Calcola imposta di successione ereditaria in base al grado di parentela e valore eredità.',
    keywords: ['successione', 'eredità', 'donazione', 'imposta successione'],
    hasContent: true,
  },
  {
    slug: 'spese-universitarie-per-citta',
    component: 'SpeseUniversitariePerCittaCalculator',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolo Costo Università per Città Studenti',
    description: 'Stima costi universitari: affitto, tasse, trasporti, vitto e spese varie per città italiana.',
    keywords: ['università', 'costo università', 'spese studenti', 'affitto studenti'],
    hasContent: true,
  },

  // Italian - Hobby e Tempo Libero
  {
    slug: 'abbonamento-stadio-vs-biglietto',
    component: 'AbbonamentoStadioVsBigliettoCalculator',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Abbonamento Stadio vs Biglietto Singolo: Convenienza',
    description: 'Confronta convenienza tra abbonamento stagionale e biglietti singoli per partite Serie A.',
    keywords: ['abbonamento stadio', 'biglietti calcio', 'serie A', 'convenienza abbonamento'],
    hasContent: true,
  },

  // Italian - Agricoltura e Cibo
  {
    slug: 'tassazione-imprenditore-agricolo-iap',
    component: 'TassazioneImprenditoreAgricoloIapCalculator',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolo Tasse Imprenditore Agricolo Professionale IAP',
    description: 'Calcola tasse e regime fiscale per imprenditore agricolo professionale: reddito agrario e dominicale.',
    keywords: ['imprenditore agricolo', 'IAP', 'reddito agrario', 'tasse agricoltura'],
    hasContent: true,
  },

  // Spanish Calculators - Impuestos y trabajo autónomo
  {
    slug: 'calculadora-cuota-autonomos-2025',
    component: 'CalculadoraCuotaAutonomos2025',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora Cuota Autónomos 2025 - Sistema de Cotización',
    description: 'Calcula tu cuota de autónomos 2025 según tus ingresos reales. Nuevo sistema de cotización por tramos.',
    keywords: ['autónomos', 'cuota autónomos', 'cotización autónomos', 'seguridad social'],
    hasContent: true,
  },
  {
    slug: 'calculadora-irpf-periodistas',
    component: 'CalculadoraIrpfPeriodistas',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora IRPF Periodistas y Comunicadores',
    description: 'Calcula IRPF y retenciones para periodistas freelance, comunicadores y redactores autónomos.',
    keywords: ['IRPF periodistas', 'periodista autónomo', 'retenciones periodistas'],
    hasContent: true,
  },
  {
    slug: 'calculadora-irpf-profesores-particulares',
    component: 'CalculadoraIrpfProfesoresParticulares',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora IRPF Profesores Particulares',
    description: 'Calcula IRPF para profesores particulares, clases privadas y academias. Gastos deducibles.',
    keywords: ['profesor particular', 'clases particulares', 'IRPF profesor', 'academia'],
    hasContent: true,
  },
  {
    slug: 'calculadora-irpf-abogados',
    component: 'CalculadoraIrpfAbogados',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora IRPF Abogados y Mutualidad',
    description: 'Calcula IRPF y cuotas de mutualidad para abogados en ejercicio libre. Gastos deducibles.',
    keywords: ['IRPF abogados', 'mutualidad abogados', 'abogado autónomo'],
    hasContent: true,
  },
  {
    slug: 'calculadora-irpf-desarrolladores',
    component: 'CalculadoraIrpfDesarrolladores',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora IRPF Desarrolladores y Programadores',
    description: 'Calcula IRPF para desarrolladores web, programadores y freelance IT. Estimación objetiva vs directa.',
    keywords: ['IRPF desarrollador', 'programador autónomo', 'freelance IT'],
    hasContent: true,
  },
  {
    slug: 'calculadora-irpf-alquiler-turistico',
    component: 'CalculadoraIrpfAlquilerTuristico',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora IRPF Alquiler Turístico Airbnb',
    description: 'Calcula IRPF por alquiler turístico y vacacional. Gastos deducibles y rendimientos capital inmobiliario.',
    keywords: ['alquiler turístico', 'airbnb', 'IRPF alquiler', 'vivienda vacacional'],
    hasContent: true,
  },
  {
    slug: 'calculadora-irpf-agentes-inmobiliarios',
    component: 'CalculadoraIrpfAgentesInmobiliarios',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora IRPF Agentes Inmobiliarios',
    description: 'Calcula IRPF para agentes inmobiliarios, API y asesores inmobiliarios autónomos.',
    keywords: ['agente inmobiliario', 'API', 'IRPF inmobiliario'],
    hasContent: true,
  },
  {
    slug: 'calculadora-irpf-agricultores-ganaderos',
    component: 'CalculadoraIrpfAgricultoresGanaderos',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora IRPF Agricultores y Ganaderos',
    description: 'Calcula IRPF para actividades agrícolas y ganaderas. Estimación objetiva y régimen especial agrario.',
    keywords: ['IRPF agricultura', 'ganadero', 'agricultor', 'estimación objetiva agraria'],
    hasContent: true,
  },
  {
    slug: 'calculadora-irpf-guias-turisticos',
    component: 'CalculadoraIrpfGuiasTuristicos',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora IRPF Guías Turísticos',
    description: 'Calcula IRPF para guías turísticos oficiales y freelance. Gastos deducibles y retenciones.',
    keywords: ['guía turístico', 'IRPF turismo', 'guía freelance'],
    hasContent: true,
  },
  {
    slug: 'calculadora-retencion-irpf-facturas',
    component: 'CalculadoraRetencionIrpfFacturas',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora Retención IRPF en Facturas',
    description: 'Calcula retención IRPF en facturas de autónomos: 15%, 7% o sin retención según actividad.',
    keywords: ['retención IRPF', 'factura autónomo', 'retención 15%', 'retención 7%'],
    hasContent: true,
  },
  {
    slug: 'calculadora-gastos-deducibles-autonomos',
    component: 'CalculadoraGastosDeduciblesAutonomos',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora Gastos Deducibles Autónomos',
    description: 'Calcula qué gastos puedes deducir como autónomo: oficina, suministros, vehículo, dietas.',
    keywords: ['gastos deducibles', 'deducciones autónomo', 'gastos autónomo'],
    hasContent: true,
  },

  // Spanish - Bienes Raíces y Vivienda
  {
    slug: 'calculadora-plusvalia-municipal',
    component: 'CalculadoraPlusvaliaMunicipal',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora Plusvalía Municipal IIVTNU',
    description: 'Calcula plusvalía municipal (IIVTNU) en venta de inmuebles según años de tenencia y valor catastral.',
    keywords: ['plusvalía municipal', 'IIVTNU', 'venta vivienda', 'impuesto municipal'],
    hasContent: true,
  },
  {
    slug: 'calculadora-ibi-municipio',
    component: 'CalculadoraIbiMunicipio',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora IBI - Impuesto sobre Bienes Inmuebles',
    description: 'Calcula IBI según valor catastral y tipo impositivo de tu municipio. Bonificaciones aplicables.',
    keywords: ['IBI', 'impuesto bienes inmuebles', 'valor catastral', 'IBI municipio'],
    hasContent: true,
  },
  {
    slug: 'simulador-hipoteca-fija-variable',
    component: 'SimuladorHipotecaFijaVariable',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Simulador Hipoteca Fija vs Variable - Comparación',
    description: 'Compara hipoteca tipo fijo vs variable. Calcula cuota mensual, intereses totales y TAE.',
    keywords: ['hipoteca fija', 'hipoteca variable', 'simulador hipoteca', 'euríbor'],
    hasContent: true,
  },
  {
    slug: 'calculadora-coste-reforma-vivienda',
    component: 'CalculadoraCosteReformaVivienda',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora Coste Reforma Integral Vivienda',
    description: 'Estima presupuesto reforma integral: albañilería, fontanería, electricidad, pintura y acabados.',
    keywords: ['reforma vivienda', 'coste reforma', 'presupuesto reforma', 'reforma integral'],
    hasContent: true,
  },
  {
    slug: 'calculadora-certificacion-energetica',
    component: 'CalculadoraCertificacionEnergetica',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora Certificado Energético Vivienda',
    description: 'Calcula coste certificado energético y estima calificación energética de tu vivienda (A-G).',
    keywords: ['certificado energético', 'eficiencia energética', 'calificación energética'],
    hasContent: true,
  },
  {
    slug: 'calculadora-coste-placas-solares',
    component: 'CalculadoraCostePlacasSolares',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora Instalación Placas Solares y Ahorro',
    description: 'Calcula coste instalación fotovoltaica, ahorro anual y años de amortización con subvenciones.',
    keywords: ['placas solares', 'energía solar', 'autoconsumo', 'fotovoltaica'],
    hasContent: true,
  },
  {
    slug: 'calculadora-division-horizontal',
    component: 'CalculadoraDivisionHorizontal',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora División Horizontal Edificio',
    description: 'Calcula costes de división horizontal de finca o edificio: notario, registro, arquitecto.',
    keywords: ['división horizontal', 'segregación vivienda', 'división propiedad'],
    hasContent: true,
  },

  // Spanish - PYMES y Empresas
  {
    slug: 'calculadora-coste-empleado',
    component: 'CalculadoraCosteEmpleado',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora Coste Real Empleado para Empresa',
    description: 'Calcula coste total empleado: salario bruto, seguridad social empresa, neto trabajador.',
    keywords: ['coste empleado', 'seguridad social empresa', 'salario bruto', 'nómina'],
    hasContent: true,
  },
  {
    slug: 'calculadora-impuesto-sociedades',
    component: 'CalculadoraImpuestoSociedades',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora Impuesto de Sociedades 2025',
    description: 'Calcula Impuesto de Sociedades: base imponible, tipo 25%, deducciones y cuota a pagar.',
    keywords: ['impuesto sociedades', 'IS', 'tipo 25%', 'deducciones fiscales'],
    hasContent: true,
  },
  {
    slug: 'calculadora-punto-equilibrio',
    component: 'CalculadoraPuntoEquilibrio',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora Punto de Equilibrio Empresarial',
    description: 'Calcula punto de equilibrio: unidades a vender para cubrir costes fijos y variables.',
    keywords: ['punto equilibrio', 'break even', 'costes fijos', 'análisis rentabilidad'],
    hasContent: true,
  },
  {
    slug: 'calculadora-amortizacion-activos',
    component: 'CalculadoraAmortizacionActivos',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora Amortización Activos Fijos',
    description: 'Calcula amortización contable y fiscal de inmovilizado: maquinaria, vehículos, equipos.',
    keywords: ['amortización', 'activos fijos', 'inmovilizado', 'tabla amortización'],
    hasContent: true,
  },

  // Spanish - Legal y Administrativo
  {
    slug: 'calculadora-sucesiones-donaciones',
    component: 'CalculadoraSucesionesDonaciones',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora Impuesto Sucesiones y Donaciones',
    description: 'Calcula impuesto sucesiones y donaciones por comunidad autónoma, parentesco y patrimonio.',
    keywords: ['sucesiones', 'donaciones', 'herencia', 'impuesto sucesiones'],
    hasContent: true,
  },
  {
    slug: 'calculadora-ley-segunda-oportunidad',
    component: 'CalculadoraLeySegundaOportunidad',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora Ley Segunda Oportunidad - Cancelación Deudas',
    description: 'Calcula si puedes acogerte a la Ley de Segunda Oportunidad para cancelar deudas insatisfechas.',
    keywords: ['segunda oportunidad', 'cancelación deudas', 'concurso acreedores', 'exoneración'],
    hasContent: true,
  },
  {
    slug: 'calculadora-coste-okupacion',
    component: 'CalculadoraCosteOkupacion',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora Coste Desalojo Okupación Vivienda',
    description: 'Estima costes de desalojo por okupación: abogado, procurador, tiempo y gastos procesales.',
    keywords: ['okupación', 'desalojo', 'desahucio', 'coste desalojo'],
    hasContent: true,
  },
  {
    slug: 'calculadora-extincion-condominio',
    component: 'CalculadoraExtincionCondominio',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora Extinción Condominio y Costes',
    description: 'Calcula costes de extinción de condominio: tasación, notario, registro, impuestos.',
    keywords: ['extinción condominio', 'disolución copropiedad', 'división cosa común'],
    hasContent: true,
  },
  {
    slug: 'calculadora-impuesto-patrimonio',
    component: 'CalculadoraImpuestoPatrimonio',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora Impuesto sobre el Patrimonio',
    description: 'Calcula Impuesto Patrimonio por CCAA. Mínimo exento, bienes, deudas y cuota a pagar.',
    keywords: ['impuesto patrimonio', 'IP', 'patrimonio neto', 'mínimo exento'],
    hasContent: true,
  },

  // Spanish - Automóviles y Transporte
  {
    slug: 'calculadora-amortizacion-vehiculo',
    component: 'CalculadoraAmortizacionVehiculo',
    category: 'automoviles-y-transporte',
    lang: 'es',
    title: 'Calculadora Amortización Vehículo Empresa',
    description: 'Calcula amortización fiscal de vehículos de empresa: turismos, furgonetas, camiones.',
    keywords: ['amortización vehículo', 'coche empresa', 'amortización fiscal'],
    hasContent: true,
  },

  // Spanish - Miscelánea y Vida Cotidiana
  {
    slug: 'calculadora-impuestos-criptomonedas',
    component: 'CalculadoraImpuestosCriptomonedas',
    category: 'miscelanea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora Impuestos Criptomonedas España',
    description: 'Calcula impuestos por trading crypto: plusvalías, IRPF, modelo 720 y declaración Hacienda.',
    keywords: ['criptomonedas', 'bitcoin', 'impuestos crypto', 'plusvalías cripto'],
    hasContent: true,
  },
  {
    slug: 'simulador-declaracion-renta',
    component: 'SimuladorDeclaracionRenta',
    category: 'miscelanea-y-vida-cotidiana',
    lang: 'es',
    title: 'Simulador Declaración Renta IRPF',
    description: 'Simula tu declaración de la renta: rendimientos trabajo, capital, deducciones y resultado.',
    keywords: ['declaración renta', 'IRPF', 'borrador renta', 'simulador renta'],
    hasContent: true,
  },
  {
    slug: 'calculadora-rendimiento-deposito',
    component: 'CalculadoraRendimientoDeposito',
    category: 'miscelanea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora Rendimiento Depósito a Plazo',
    description: 'Calcula intereses y rendimiento neto de depósitos bancarios a plazo fijo con retención IRPF.',
    keywords: ['depósito plazo', 'intereses depósito', 'depósito bancario', 'plazo fijo'],
    hasContent: true,
  },
  {
    slug: 'calculadora-rendimiento-plan-indexado',
    component: 'CalculadoraRendimientoPlanIndexado',
    category: 'miscelanea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora Rendimiento Plan de Pensiones Indexado',
    description: 'Calcula rentabilidad plan de pensiones indexado a índice bursátil con aportaciones periódicas.',
    keywords: ['plan pensiones', 'indexado', 'fondo indexado', 'rentabilidad'],
    hasContent: true,
  },
  {
    slug: 'calculadora-impuestos-venta-vivienda-heredada',
    component: 'CalculadoraImpuestosVentaViviendaHeredada',
    category: 'miscelanea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora Impuestos Venta Vivienda Heredada',
    description: 'Calcula plusvalía e IRPF por venta de vivienda heredada. Gastos deducibles y exenciones.',
    keywords: ['venta vivienda heredada', 'plusvalía herencia', 'IRPF venta herencia'],
    hasContent: true,
  },
  {
    slug: 'calculadora-deducciones-autonomicas',
    component: 'CalculadoraDeduccionesId',
    category: 'miscelanea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora Deducciones Autonómicas IRPF',
    description: 'Calcula deducciones autonómicas en IRPF: alquiler, nacimiento, discapacidad, familia numerosa.',
    keywords: ['deducciones autonómicas', 'IRPF', 'deducciones CCAA', 'alquiler vivienda'],
    hasContent: true,
  },

  // French Calculators - Fiscalité et travail indépendant
  {
    slug: 'calculateur-cotisations-urssaf',
    component: 'CalculateurCotisationsUrssaf',
    category: 'fiscalite-et-travail-independant',
    lang: 'fr',
    title: 'Calculateur Cotisations URSSAF Auto-entrepreneur',
    description: 'Calculez vos cotisations sociales URSSAF en micro-entreprise selon votre chiffre d\'affaires.',
    keywords: ['URSSAF', 'cotisations sociales', 'auto-entrepreneur', 'micro-entreprise'],
    hasContent: true,
  },
  {
    slug: 'simulateur-revenu-micro-vs-reel',
    component: 'SimulateurRevenuMicroVsReel',
    category: 'fiscalite-et-travail-independant',
    lang: 'fr',
    title: 'Simulateur Micro-entreprise vs Régime Réel',
    description: 'Comparez micro-entreprise et régime réel : charges, impôts, revenu net et optimisation fiscale.',
    keywords: ['micro-entreprise', 'régime réel', 'comparaison statut', 'optimisation fiscale'],
    hasContent: true,
  },

  // French - Épargne et investissements
  {
    slug: 'calculateur-tva',
    component: 'CalculateurTva',
    category: 'epargne-et-investissements',
    lang: 'fr',
    title: 'Calculateur TVA - Taux 20%, 10%, 5.5%',
    description: 'Calculez TVA HT, TTC et montant TVA selon les taux français 20%, 10%, 5,5% et 2,1%.',
    keywords: ['TVA', 'calcul TVA', 'HT TTC', 'taux TVA'],
    hasContent: true,
  },

  // English Calculators - Finance & Investment
  {
    slug: 'fire-calculator',
    component: 'FireCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'FIRE Calculator - Financial Independence Retire Early',
    description: 'Calculate your FIRE number, years to retirement, and financial independence based on savings rate and expenses.',
    keywords: ['FIRE', 'financial independence', 'early retirement', 'FIRE movement'],
    hasContent: true,
  },
  {
    slug: 'crypto-portfolio-calculator',
    component: 'CryptoPortfolioCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Crypto Portfolio Tracker and Calculator',
    description: 'Track cryptocurrency portfolio performance, gains/losses, and allocation across multiple coins.',
    keywords: ['crypto portfolio', 'cryptocurrency tracker', 'bitcoin calculator', 'crypto gains'],
    hasContent: true,
  },
  {
    slug: 'rental-property-cash-flow-calculator',
    component: 'RentalPropertyCashFlowCalculator',
    category: 'real-estate-and-housing',
    lang: 'en',
    title: 'Rental Property Cash Flow Calculator',
    description: 'Calculate rental property cash flow, ROI, cap rate, and net operating income for real estate investing.',
    keywords: ['rental property', 'cash flow', 'real estate investing', 'ROI property'],
    hasContent: true,
  },

  // English - Business & Marketing
  {
    slug: 'break-even-point-startup',
    component: 'BreakEvenPointStartupCalculator',
    category: 'business-and-marketing',
    lang: 'en',
    title: 'Break Even Point Calculator for Startups',
    description: 'Calculate break-even point for your startup or business: fixed costs, variable costs, and units needed.',
    keywords: ['break even', 'startup calculator', 'break even analysis', 'profitability'],
    hasContent: true,
  },

  // English - Education & Career
  {
    slug: 'severance-package-calculator',
    component: 'SeverancePackageCalculator',
    category: 'education-and-career',
    lang: 'en',
    title: 'Severance Package Calculator - Redundancy Pay',
    description: 'Calculate severance pay, redundancy package, and termination benefits based on years of service.',
    keywords: ['severance pay', 'redundancy calculator', 'termination package', 'layoff compensation'],
    hasContent: true,
  },

  // English - Tax & Freelance
  {
    slug: 'uk-vat-calculator',
    component: 'UkbVatCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK VAT Calculator - 20% VAT Rate',
    description: 'Calculate UK VAT at 20% standard rate: add VAT, remove VAT, and VAT on gross amount.',
    keywords: ['UK VAT', 'VAT calculator', '20% VAT', 'British VAT'],
    hasContent: true,
  },
];

/**
 * Get all calculators for a specific language
 */
export function getCalculatorsByLang(lang: Lang): CalculatorMetadata[] {
  return CALCULATOR_REGISTRY.filter(calc => calc.lang === lang);
}

/**
 * Get all calculators for a specific category
 */
export function getCalculatorsByCategory(category: string, lang: Lang): CalculatorMetadata[] {
  return CALCULATOR_REGISTRY.filter(
    calc => calc.category === category && calc.lang === lang
  );
}

/**
 * Get a single calculator by slug and language
 */
export function getCalculator(slug: string, lang: Lang): CalculatorMetadata | undefined {
  return CALCULATOR_REGISTRY.find(
    calc => calc.slug === slug && calc.lang === lang
  );
}

/**
 * Get related calculators in the same category (excluding current)
 */
export function getRelatedCalculators(
  currentSlug: string,
  category: string,
  lang: Lang,
  limit: number = 6
): CalculatorMetadata[] {
  const categoryCalcs = getCalculatorsByCategory(category, lang);
  const filtered = categoryCalcs.filter(calc => calc.slug !== currentSlug);

  // Shuffle and return limited results
  return filtered.sort(() => 0.5 - Math.random()).slice(0, limit);
}

/**
 * Get all unique categories for a language
 */
export function getCategoriesForLang(lang: Lang): string[] {
  const categories = new Set<string>();
  CALCULATOR_REGISTRY
    .filter(calc => calc.lang === lang)
    .forEach(calc => categories.add(calc.category));
  return Array.from(categories);
}

/**
 * Search calculators by keyword
 */
export function searchCalculators(query: string, lang: Lang): CalculatorMetadata[] {
  const lowerQuery = query.toLowerCase();
  return CALCULATOR_REGISTRY.filter(calc => {
    if (calc.lang !== lang) return false;

    return (
      calc.title.toLowerCase().includes(lowerQuery) ||
      calc.description.toLowerCase().includes(lowerQuery) ||
      calc.keywords?.some(kw => kw.toLowerCase().includes(lowerQuery))
    );
  });
}
