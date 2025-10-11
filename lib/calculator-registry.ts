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

  // Additional calculators from CSV (201-400)
  {
    slug: 'adozione-costi-e-tempi',
    component: 'AdozioneCostiETempi',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Adozione (costi e tempi)',
    description: 'Calcolatore Adozione (costi e tempi)',
    hasContent: true,
  },

  {
    slug: 'tassazione-consulenti-finanziari-ocf',
    component: 'TassazioneConsulentiFinanziariOcf',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Consulenti Finanziari (con OCF)',
    description: 'Calcolatore Tassazione per Consulenti Finanziari (con OCF)',
    hasContent: true,
  },

  {
    slug: 'tassazione-agenti-immobiliari-inps',
    component: 'TassazioneAgentiImmobiliariInps',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Agenti Immobiliari (con INPS Commercianti)',
    description: 'Calcolatore Tassazione per Agenti Immobiliari (con INPS Commercianti)',
    hasContent: true,
  },

  {
    slug: 'cuneo-fiscale',
    component: 'CuneoFiscale',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolatore Costo Totale Dipendente (Cuneo Fiscale)',
    description: 'Calcolatore Costo Totale Dipendente (Cuneo Fiscale)',
    hasContent: true,
  },

  {
    slug: 'calcolo-ires-irap-srl-srls',
    component: 'CalcoloIresIrapSrlSrls',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolatore IRES e IRAP per SRL e SRLS',
    description: 'Calcolatore IRES e IRAP per SRL e SRLS',
    hasContent: true,
  },

  {
    slug: 'imu-tasi-seconda-casa',
    component: 'ImuTasiSecondaCasa',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore IMU/TASI per seconda casa (con aliquote comunali)',
    description: 'Calcolatore IMU/TASI per seconda casa (con aliquote comunali)',
    hasContent: true,
  },

  {
    slug: 'cedolare-secca-vs-tassazione-ordinaria',
    component: 'CedolareSeccaVsTassazioneOrdinaria',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Cedolare Secca vs. Tassazione Ordinaria per affitti',
    description: 'Calcolatore Cedolare Secca vs. Tassazione Ordinaria per affitti',
    hasContent: true,
  },

  {
    slug: 'detrazioni-ristrutturazione-50',
    component: 'DetrazioniRistrutturazione50',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Detrazioni Fiscali per Ristrutturazione (50%)',
    description: 'Calcolatore Detrazioni Fiscali per Ristrutturazione (50%)',
    hasContent: true,
  },

  {
    slug: 'detrazioni-ecobonus-65',
    component: 'DetrazioniEcobonus65',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Detrazioni Fiscali per Ecobonus (65%)',
    description: 'Calcolatore Detrazioni Fiscali per Ecobonus (65%)',
    hasContent: true,
  },

  {
    slug: 'piano-di-accumulo-pac-tassazione',
    component: 'PianoDiAccumuloPacTassazione',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore PAC (Piano di Accumulo Capitale) con tassazione italiana (26%)',
    description: 'Calcolatore PAC (Piano di Accumulo Capitale) con tassazione italiana (26%)',
    hasContent: true,
  },

  {
    slug: 'tassazione-etf-armonizzati-non',
    component: 'TassazioneEtfArmonizzatiNon',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione ETF (armonizzati vs. non armonizzati)',
    description: 'Calcolatore Tassazione ETF (armonizzati vs. non armonizzati)',
    hasContent: true,
  },

  {
    slug: 'costo-proprieta-auto-tco',
    component: 'CostoProprietaAutoTco',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Totale di Proprietà Auto (TCO) per Regione (Bollo, Assicurazione)',
    description: 'Calcolatore Costo Totale di Proprietà Auto (TCO) per Regione (Bollo, Assicurazione)',
    hasContent: true,
  },

  {
    slug: 'auto-elettrica-vs-termica',
    component: 'AutoElettricaVsTermica',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Convenienza Auto Elettrica vs. Termica (con incentivi)',
    description: 'Calcolatore Convenienza Auto Elettrica vs. Termica (con incentivi)',
    hasContent: true,
  },

  {
    slug: 'rimborso-chilometrico-aci',
    component: 'RimborsoChilometricoAci',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Rimborso Chilometrico ACI',
    description: 'Calcolatore Rimborso Chilometrico ACI',
    hasContent: true,
  },

  {
    slug: 'assegno-unico-universale-figli',
    component: 'AssegnoUnicoUniversaleFigli',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Assegno Unico Universale per Figli a Carico',
    description: 'Calcolatore Assegno Unico Universale per Figli a Carico',
    hasContent: true,
  },

  {
    slug: 'retta-asilo-nido-con-bonus',
    component: 'RettaAsiloNidoConBonus',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Retta Asilo Nido con Bonus INPS',
    description: 'Calcolatore Retta Asilo Nido con Bonus INPS',
    hasContent: true,
  },

  {
    slug: 'tfr-colf-badanti-babysitter',
    component: 'TfrColfBadantiBabysitter',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore TFR per Colf, Badanti e Babysitter',
    description: 'Calcolatore TFR per Colf, Badanti e Babysitter',
    hasContent: true,
  },

  {
    slug: 'costi-gestione-agriturismo',
    component: 'CostiGestioneAgriturismo',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Costi di Gestione di un Agriturismo',
    description: 'Calcolatore Costi di Gestione di un Agriturismo',
    hasContent: true,
  },

  {
    slug: 'pac-politica-agricola-contributi',
    component: 'PacPoliticaAgricolaContributi',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore PAC (Politica Agricola Comune) - Stima Contributi',
    description: 'Calcolatore PAC (Politica Agricola Comune) - Stima Contributi',
    hasContent: true,
  },

  {
    slug: 'costo-impianto-vigneto-uliveto',
    component: 'CostoImpiantoVignetoUliveto',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Costo Impianto Vigneto/Uliveto per ettaro',
    description: 'Calcolatore Costo Impianto Vigneto/Uliveto per ettaro',
    hasContent: true,
  },

  {
    slug: 'rendita-orto-urbano',
    component: 'RenditaOrtoUrbano',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Rendita di un Orto Urbano',
    description: 'Calcolatore Rendita di un Orto Urbano',
    hasContent: true,
  },

  {
    slug: 'calculateur-versement-liberatoire',
    component: 'CalculateurVersementLiberatoire',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du Versement Libératoire de l\'impôt pour micro-entrepreneur',
    description: 'Calculateur du Versement Libératoire de l\'impôt pour micro-entrepreneur',
    hasContent: true,
  },

  {
    slug: 'calculateur-acre',
    component: 'CalculateurAcre',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de l\'ACRE (Aide à la Création ou à la Reprise d\'une Entreprise)',
    description: 'Calculateur de l\'ACRE (Aide à la Création ou à la Reprise d\'une Entreprise)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cfe',
    component: 'CalculateurCfe',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la CFE (Cotisation Foncière des Entreprises)',
    description: 'Calculateur de la CFE (Cotisation Foncière des Entreprises)',
    hasContent: true,
  },

  {
    slug: 'gestione-separata',
    component: 'GestioneSeparata',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Simulatore Convenienza: Forfettario vs. Semplificato',
    description: 'Simulatore Convenienza: Forfettario vs. Semplificato',
    hasContent: true,
  },

  {
    slug: 'contributi-gestione',
    component: 'ContributiGestione',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Contributi Gestione Separata INPS vs. Cassa Professionale (es. Inarcassa, CNPADC)',
    description: 'Calcolatore Contributi Gestione Separata INPS vs. Cassa Professionale (es. Inarcassa, CNPADC)',
    hasContent: true,
  },

  {
    slug: 'flat-tax-pi',
    component: 'FlatTaxPi',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Flat Tax Incrementale per Partite IVA',
    description: 'Calcolatore Flat Tax Incrementale per Partite IVA',
    hasContent: true,
  },

  {
    slug: 'tassazione-sportivi',
    component: 'TassazioneSportivi',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Simulatore Tassazione per Lavoratori Sportivi',
    description: 'Simulatore Tassazione per Lavoratori Sportivi',
    hasContent: true,
  },

  {
    slug: 'tassazione-medici',
    component: 'TassazioneMedici',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Medici in Partita IVA (con ENPAM)',
    description: 'Calcolatore Tassazione per Medici in Partita IVA (con ENPAM)',
    hasContent: true,
  },

  {
    slug: 'tassazione-avvocati',
    component: 'TassazioneAvvocati',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Avvocati (con Cassa Forense)',
    description: 'Calcolatore Tassazione per Avvocati (con Cassa Forense)',
    hasContent: true,
  },

  {
    slug: 'tassazione-musicisti-artisti',
    component: 'TassazioneMusicistiArtisti',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Musicisti e Artisti (con ENPALS)',
    description: 'Calcolatore Tassazione per Musicisti e Artisti (con ENPALS)',
    hasContent: true,
  },

  {
    slug: 'tassazione-fisioterapisti',
    component: 'TassazioneFisioterapisti',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Fisioterapisti in Partita IVA',
    description: 'Calcolatore Tassazione per Fisioterapisti in Partita IVA',
    hasContent: true,
  },

  {
    slug: 'tassazione-ing-architetti',
    component: 'TassazioneIngArchitetti',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Ingegneri e Architetti (con Inarcassa)',
    description: 'Calcolatore Tassazione per Ingegneri e Architetti (con Inarcassa)',
    hasContent: true,
  },

  {
    slug: 'tassazione-geometri',
    component: 'TassazioneGeometri',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Geometri (con CIPAG)',
    description: 'Calcolatore Tassazione per Geometri (con CIPAG)',
    hasContent: true,
  },

  {
    slug: 'tassazione-sviluppatori-software-freelance',
    component: 'TassazioneSviluppatoriSoftwareFreelance',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Sviluppatori Software Freelance',
    description: 'Calcolatore Tassazione per Sviluppatori Software Freelance',
    hasContent: true,
  },

  {
    slug: 'tassazione-traduttori-freelance',
    component: 'TassazioneTraduttoriFreelance',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Traduttori Freelance',
    description: 'Calcolatore Tassazione per Traduttori Freelance',
    hasContent: true,
  },

  {
    slug: 'tassazione-fotografi-freelance',
    component: 'TassazioneFotografiFreelance',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Fotografi Freelance',
    description: 'Calcolatore Tassazione per Fotografi Freelance',
    hasContent: true,
  },

  {
    slug: 'tassazione-videomaker-freelance',
    component: 'TassazioneVideomakerFreelance',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Videomaker Freelance',
    description: 'Calcolatore Tassazione per Videomaker Freelance',
    hasContent: true,
  },

  {
    slug: 'tassazione-social-media-manager-freelance',
    component: 'TassazioneSocialMediaManagerFreelance',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Social Media Manager Freelance',
    description: 'Calcolatore Tassazione per Social Media Manager Freelance',
    hasContent: true,
  },

  {
    slug: 'tassazione-guide-turistiche-partita-iva',
    component: 'TassazioneGuideTuristichePartitaIva',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Guide Turistiche in Partita IVA',
    description: 'Calcolatore Tassazione per Guide Turistiche in Partita IVA',
    hasContent: true,
  },

  {
    slug: 'plusvalenza-vendita-immobile',
    component: 'PlusvalenzaVenditaImmobile',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Plusvalenza sulla Vendita di un Immobile (prima/seconda casa)',
    description: 'Calcolatore Plusvalenza sulla Vendita di un Immobile (prima/seconda casa)',
    hasContent: true,
  },

  {
    slug: 'rendita-e-valore-catastale',
    component: 'RenditaEValoreCatastale',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Rendita Catastale e Valore Catastale',
    description: 'Calcolatore Rendita Catastale e Valore Catastale',
    hasContent: true,
  },

  {
    slug: 'canone-concordato-vantaggi-fiscali',
    component: 'CanoneConcordatoVantaggiFiscali',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Canone Concordato e relativi vantaggi fiscali',
    description: 'Calcolatore Canone Concordato e relativi vantaggi fiscali',
    hasContent: true,
  },

  {
    slug: 'detrazione-interessi-mutuo-prima-casa',
    component: 'DetrazioneInteressiMutuoPrimaCasa',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Detrazione Interessi Passivi Mutuo Prima Casa',
    description: 'Calcolatore Detrazione Interessi Passivi Mutuo Prima Casa',
    hasContent: true,
  },

  {
    slug: 'costo-pannelli-fotovoltaici-incentivi',
    component: 'CostoPannelliFotovoltaiciIncentivi',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Installazione Pannelli Fotovoltaici (con incentivi)',
    description: 'Calcolatore Costo Installazione Pannelli Fotovoltaici (con incentivi)',
    hasContent: true,
  },

  {
    slug: 'costo-pompa-di-calore-incentivi',
    component: 'CostoPompaDiCaloreIncentivi',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Installazione Pompa di Calore (con incentivi)',
    description: 'Calcolatore Costo Installazione Pompa di Calore (con incentivi)',
    hasContent: true,
  },

  {
    slug: 'costo-infissi-con-incentivi',
    component: 'CostoInfissiConIncentivi',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Sostituzione Infissi (con incentivi)',
    description: 'Calcolatore Costo Sostituzione Infissi (con incentivi)',
    hasContent: true,
  },

  {
    slug: 'spese-condominiali-millesimi',
    component: 'SpeseCondominialiMillesimi',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Spese Condominiali per millesimi',
    description: 'Calcolatore Spese Condominiali per millesimi',
    hasContent: true,
  },

  {
    slug: 'aumento-istat-canone-locazione',
    component: 'AumentoIstatCanoneLocazione',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Aumento ISTAT Canone di Locazione',
    description: 'Calcolatore Aumento ISTAT Canone di Locazione',
    hasContent: true,
  },

  {
    slug: 'deposito-cauzionale-e-interessi-legali',
    component: 'DepositoCauzionaleEInteressiLegali',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Deposito Cauzionale e Interessi Legali',
    description: 'Calcolatore Deposito Cauzionale e Interessi Legali',
    hasContent: true,
  },

  {
    slug: 'tassazione-vendita-terreno-edificabile',
    component: 'TassazioneVenditaTerrenoEdificabile',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione Vendita Terreno Edificabile',
    description: 'Calcolatore Tassazione Vendita Terreno Edificabile',
    hasContent: true,
  },

  {
    slug: 'imposta-bollo-conto-e-titoli',
    component: 'ImpostaBolloContoETitoli',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Imposta di Bollo su Conto Corrente e Deposito Titoli',
    description: 'Calcolatore Imposta di Bollo su Conto Corrente e Deposito Titoli',
    hasContent: true,
  },

  {
    slug: 'tassazione-plusvalenze-capital-gain',
    component: 'TassazionePlusvalenzeCapitalGain',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione Plusvalenze (Capital Gain)',
    description: 'Calcolatore Tassazione Plusvalenze (Capital Gain)',
    hasContent: true,
  },

  {
    slug: 'rendimento-netto-buoni-fruttiferi',
    component: 'RendimentoNettoBuoniFruttiferi',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Rendimento Netto Buoni Fruttiferi Postali',
    description: 'Calcolatore Rendimento Netto Buoni Fruttiferi Postali',
    hasContent: true,
  },

  {
    slug: 'tassazione-p2p-lending',
    component: 'TassazioneP2pLending',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione P2P Lending',
    description: 'Calcolatore Tassazione P2P Lending',
    hasContent: true,
  },

  {
    slug: 'interesse-composto-tassazione',
    component: 'InteresseCompostoTassazione',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Interesse Composto (con tassazione 26%)',
    description: 'Calcolatore Interesse Composto (con tassazione 26%)',
    hasContent: true,
  },

  {
    slug: 'calcolo-rita-rendita-integrativa',
    component: 'CalcoloRitaRenditaIntegrativa',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore RITA (Rendita Integrativa Temporanea Anticipata)',
    description: 'Calcolatore RITA (Rendita Integrativa Temporanea Anticipata)',
    hasContent: true,
  },

  {
    slug: 'costo-consulente-finanziario',
    component: 'CostoConsulenteFinanziario',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Costo di un Consulente Finanziario (parcella vs. % gestito)',
    description: 'Calcolatore Costo di un Consulente Finanziario (parcella vs. % gestito)',
    hasContent: true,
  },

  {
    slug: 'defi-yield-calculator',
    component: 'DefiYieldCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'DeFi Yield Calculator',
    description: 'DeFi Yield Calculator',
    hasContent: true,
  },

  {
    slug: 'nft-roi-calculator',
    component: 'NftRoiCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'NFT ROI Calculator',
    description: 'NFT ROI Calculator',
    hasContent: true,
  },

  {
    slug: 'dollar-cost-averaging-calculator',
    component: 'DollarCostAveragingCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Dollar Cost Averaging Calculator',
    description: 'Dollar Cost Averaging Calculator',
    hasContent: true,
  },

  {
    slug: 'student-loan-forgiveness-calculator',
    component: 'StudentLoanForgivenessCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Student Loan Forgiveness Calculator',
    description: 'Student Loan Forgiveness Calculator',
    hasContent: true,
  },

  {
    slug: 'side-hustle-income-calculator',
    component: 'SideHustleIncomeCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Side Hustle Income Calculator',
    description: 'Side Hustle Income Calculator',
    hasContent: true,
  },

  {
    slug: 'tfm-fine-mandato-amministratori',
    component: 'TfmFineMandatoAmministratori',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolatore TFM (Trattamento di Fine Mandato) per Amministratori',
    description: 'Calcolatore TFM (Trattamento di Fine Mandato) per Amministratori',
    hasContent: true,
  },

  {
    slug: 'margine-di-contribuzione',
    component: 'MargineDiContribuzione',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolatore Margine di Contribuzione',
    description: 'Calcolatore Margine di Contribuzione',
    hasContent: true,
  },

  {
    slug: 'finanziamento-resto-al-sud',
    component: 'FinanziamentoRestoAlSud',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolatore Finanziamento "Resto al Sud"',
    description: 'Calcolatore Finanziamento "Resto al Sud"',
    hasContent: true,
  },

  {
    slug: 'contributi-fondo-perduto-bandi',
    component: 'ContributiFondoPerdutoBandi',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolatore Contributi a Fondo Perduto (per bandi specifici)',
    description: 'Calcolatore Contributi a Fondo Perduto (per bandi specifici)',
    hasContent: true,
  },

  {
    slug: 'fatturato-qualifica-pmi',
    component: 'FatturatoQualificaPmi',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolatore Fatturato per Mantenere la Qualifica di PMI',
    description: 'Calcolatore Fatturato per Mantenere la Qualifica di PMI',
    hasContent: true,
  },

  {
    slug: 'cash-flow-operativo',
    component: 'CashFlowOperativo',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolatore Cash Flow Operativo',
    description: 'Calcolatore Cash Flow Operativo',
    hasContent: true,
  },

  {
    slug: 'importazione-auto-estero',
    component: 'ImportazioneAutoEstero',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Importazione Auto dall\'Estero',
    description: 'Calcolatore Costo Importazione Auto dall\'Estero',
    hasContent: true,
  },

  {
    slug: 'costo-patente-a-b-c',
    component: 'CostoPatenteABC',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Patente (A, B, C)',
    description: 'Calcolatore Costo Patente (A, B, C)',
    hasContent: true,
  },

  {
    slug: 'detrazione-spese-sanitarie-730',
    component: 'DetrazioneSpeseSanitarie730',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Detrazioni Spese Mediche e Sanitarie (730)',
    description: 'Calcolatore Detrazioni Spese Mediche e Sanitarie (730)',
    hasContent: true,
  },

  {
    slug: 'detrazione-spese-veterinarie-730',
    component: 'DetrazioneSpeseVeterinarie730',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Detrazioni Spese Veterinarie (730)',
    description: 'Calcolatore Detrazioni Spese Veterinarie (730)',
    hasContent: true,
  },

  {
    slug: 'costo-animale-domestico',
    component: 'CostoAnimaleDomestico',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Animale Domestico (cane/gatto)',
    description: 'Calcolatore Costo Animale Domestico (cane/gatto)',
    hasContent: true,
  },

  {
    slug: 'isee-semplificato',
    component: 'IseeSemplificato',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore ISEE (Indicatore della Situazione Economica Equivalente) Semplificato',
    description: 'Calcolatore ISEE (Indicatore della Situazione Economica Equivalente) Semplificato',
    hasContent: true,
  },

  {
    slug: 'quota-ereditaria-legittima',
    component: 'QuotaEreditariaLegittima',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Quota Ereditaria Legittima',
    description: 'Calcolatore Quota Ereditaria Legittima',
    hasContent: true,
  },

  {
    slug: 'costo-funerale',
    component: 'CostoFunerale',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Funerale',
    description: 'Calcolatore Costo Funerale',
    hasContent: true,
  },

  {
    slug: 'risparmio-pannelli-solari',
    component: 'RisparmioPannelliSolari',
    category: 'famiglia-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Risparmio con Pannelli Solari Domestici',
    description: 'Calcolatore Risparmio con Pannelli Solari Domestici',
    hasContent: true,
  },

  {
    slug: 'costo-produzione-olio-vino',
    component: 'CostoProduzioneOlioVino',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Costo Produzione Olio d\'Oliva/Vino',
    description: 'Calcolatore Costo Produzione Olio d\'Oliva/Vino',
    hasContent: true,
  },

  {
    slug: 'tassazione-vendita-prodotti-agricoli',
    component: 'TassazioneVenditaProdottiAgricoli',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Tassazione Vendita Diretta Prodotti Agricoli',
    description: 'Calcolatore Tassazione Vendita Diretta Prodotti Agricoli',
    hasContent: true,
  },

  {
    slug: 'costo-allevamento-galline-api',
    component: 'CostoAllevamentoGallineApi',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Costo Allevamento (es. galline ovaiole, api)',
    description: 'Calcolatore Costo Allevamento (es. galline ovaiole, api)',
    hasContent: true,
  },

  {
    slug: 'diritto-prelazione-agraria',
    component: 'DirittoPrelazioneAgraria',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Diritto di Prelazione Agraria',
    description: 'Calcolatore Diritto di Prelazione Agraria',
    hasContent: true,
  },

  {
    slug: 'spreco-alimentare-costo-impatto',
    component: 'SprecoAlimentareCostoImpatto',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Spreco Alimentare Familiare (costo e impatto)',
    description: 'Calcolatore Spreco Alimentare Familiare (costo e impatto)',
    hasContent: true,
  },

  {
    slug: 'costo-attrezzatura-sci-noleggio',
    component: 'CostoAttrezzaturaSciNoleggio',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Attrezzatura da Sci/Snowboard (acquisto vs. noleggio)',
    description: 'Calcolatore Costo Attrezzatura da Sci/Snowboard (acquisto vs. noleggio)',
    hasContent: true,
  },

  {
    slug: 'costo-brevetto-sub',
    component: 'CostoBrevettoSub',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Brevetto da Sub',
    description: 'Calcolatore Costo Brevetto da Sub',
    hasContent: true,
  },

  {
    slug: 'costo-mantenimento-barca',
    component: 'CostoMantenimentoBarca',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Mantenimento Barca a Vela/Motore',
    description: 'Calcolatore Costo Mantenimento Barca a Vela/Motore',
    hasContent: true,
  },

  {
    slug: 'costo-palestra-piscina',
    component: 'CostoPalestraPiscina',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Iscrizione e Tesseramento Palestra/Piscina',
    description: 'Calcolatore Costo Iscrizione e Tesseramento Palestra/Piscina',
    hasContent: true,
  },

  {
    slug: 'costo-collezionismo-fumetti-vinili',
    component: 'CostoCollezionismoFumettiVinili',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Collezionismo (es. fumetti, vinili)',
    description: 'Calcolatore Costo Collezionismo (es. fumetti, vinili)',
    hasContent: true,
  },

  {
    slug: 'costo-strumentazione-musicale',
    component: 'CostoStrumentazioneMusicale',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Strumentazione Musicale (chitarra, pianoforte)',
    description: 'Calcolatore Costo Strumentazione Musicale (chitarra, pianoforte)',
    hasContent: true,
  },

  {
    slug: 'costo-attrezzatura-fotografica',
    component: 'CostoAttrezzaturaFotografica',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Attrezzatura Fotografica Professionale',
    description: 'Calcolatore Costo Attrezzatura Fotografica Professionale',
    hasContent: true,
  },

  {
    slug: 'costo-viaggio-on-the-road',
    component: 'CostoViaggioOnTheRoad',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Viaggio On The Road in Italia',
    description: 'Calcolatore Costo Viaggio On The Road in Italia',
    hasContent: true,
  },

  {
    slug: 'costo-hobby-giardinaggio',
    component: 'CostoHobbyGiardinaggio',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Hobby del Giardinaggio (annuale)',
    description: 'Calcolatore Costo Hobby del Giardinaggio (annuale)',
    hasContent: true,
  },

  {
    slug: 'costo-produzione-olio-vino',
    component: 'CostoProduzioneOlioVino',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Costo Produzione Olio d\'Oliva/Vino',
    description: 'Calcolatore Costo Produzione Olio d\'Oliva/Vino',
    hasContent: true,
  },

  {
    slug: 'tassazione-vendita-prodotti-agricoli',
    component: 'TassazioneVenditaProdottiAgricoli',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Tassazione Vendita Diretta Prodotti Agricoli',
    description: 'Calcolatore Tassazione Vendita Diretta Prodotti Agricoli',
    hasContent: true,
  },

  {
    slug: 'costo-allevamento-galline-api',
    component: 'CostoAllevamentoGallineApi',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Costo Allevamento (es. galline ovaiole, api)',
    description: 'Calcolatore Costo Allevamento (es. galline ovaiole, api)',
    hasContent: true,
  },

  {
    slug: 'diritto-prelazione-agraria',
    component: 'DirittoPrelazioneAgraria',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Diritto di Prelazione Agraria',
    description: 'Calcolatore Diritto di Prelazione Agraria',
    hasContent: true,
  },

  {
    slug: 'spreco-alimentare-costo-impatto',
    component: 'SprecoAlimentareCostoImpatto',
    category: 'agricoltura-e-cibo',
    lang: 'it',
    title: 'Calcolatore Spreco Alimentare Familiare (costo e impatto)',
    description: 'Calcolatore Spreco Alimentare Familiare (costo e impatto)',
    hasContent: true,
  },

  {
    slug: 'costo-attrezzatura-sci-noleggio',
    component: 'CostoAttrezzaturaSciNoleggio',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Attrezzatura da Sci/Snowboard (acquisto vs. noleggio)',
    description: 'Calcolatore Costo Attrezzatura da Sci/Snowboard (acquisto vs. noleggio)',
    hasContent: true,
  },

  {
    slug: 'costo-brevetto-sub',
    component: 'CostoBrevettoSub',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Brevetto da Sub',
    description: 'Calcolatore Costo Brevetto da Sub',
    hasContent: true,
  },

  {
    slug: 'costo-mantenimento-barca',
    component: 'CostoMantenimentoBarca',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Mantenimento Barca a Vela/Motore',
    description: 'Calcolatore Costo Mantenimento Barca a Vela/Motore',
    hasContent: true,
  },

  {
    slug: 'costo-palestra-piscina',
    component: 'CostoPalestraPiscina',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Iscrizione e Tesseramento Palestra/Piscina',
    description: 'Calcolatore Costo Iscrizione e Tesseramento Palestra/Piscina',
    hasContent: true,
  },

  {
    slug: 'costo-collezionismo-fumetti-vinili',
    component: 'CostoCollezionismoFumettiVinili',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Collezionismo (es. fumetti, vinili)',
    description: 'Calcolatore Costo Collezionismo (es. fumetti, vinili)',
    hasContent: true,
  },

  {
    slug: 'costo-strumentazione-musicale',
    component: 'CostoStrumentazioneMusicale',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Strumentazione Musicale (chitarra, pianoforte)',
    description: 'Calcolatore Costo Strumentazione Musicale (chitarra, pianoforte)',
    hasContent: true,
  },

  {
    slug: 'costo-attrezzatura-fotografica',
    component: 'CostoAttrezzaturaFotografica',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Attrezzatura Fotografica Professionale',
    description: 'Calcolatore Costo Attrezzatura Fotografica Professionale',
    hasContent: true,
  },

  {
    slug: 'costo-viaggio-on-the-road',
    component: 'CostoViaggioOnTheRoad',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Viaggio On The Road in Italia',
    description: 'Calcolatore Costo Viaggio On The Road in Italia',
    hasContent: true,
  },

  {
    slug: 'costo-hobby-giardinaggio',
    component: 'CostoHobbyGiardinaggio',
    category: 'hobby-e-tempo-libero',
    lang: 'it',
    title: 'Calcolatore Costo Hobby del Giardinaggio (annuale)',
    description: 'Calcolatore Costo Hobby del Giardinaggio (annuale)',
    hasContent: true,
  },

  {
    slug: 'calcolo-stipendio-netto',
    component: 'CalcoloStipendioNetto',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Calcolo Stipendio Netto',
    description: 'Calcolo Stipendio Netto',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-comunidad-autonoma',
    component: 'CalculadoraIrpfComunidadAutonoma',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de IRPF por Comunidad Autónoma',
    description: 'Calculadora de IRPF por Comunidad Autónoma',
    hasContent: true,
  },

  {
    slug: 'simulador-estimacion-directa-modulos',
    component: 'SimuladorEstimacionDirectaModulos',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Simulador Conveniencia: Estimación Directa vs. Módulos',
    description: 'Simulador Conveniencia: Estimación Directa vs. Módulos',
    hasContent: true,
  },

  {
    slug: 'calculadora-iva-modelo-303',
    component: 'CalculadoraIvaModelo303',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de IVA trimestral (Modelo 303)',
    description: 'Calculadora de IVA trimestral (Modelo 303)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tarifa-plana-autonomos',
    component: 'CalculadoraTarifaPlanaAutonomos',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la "Tarifa Plana" para nuevos autónomos',
    description: 'Calculadora de la "Tarifa Plana" para nuevos autónomos',
    hasContent: true,
  },

  {
    slug: 'calculadora-ley-beckham',
    component: 'CalculadoraLeyBeckham',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la "Ley Beckham" para expatriados',
    description: 'Calculadora de la "Ley Beckham" para expatriados',
    hasContent: true,
  },

  {
    slug: 'calculadora-capitalizacion-paro',
    component: 'CalculadoraCapitalizacionParo',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la "Capitalización del Paro" para emprender',
    description: 'Calculadora de la "Capitalización del Paro" para emprender',
    hasContent: true,
  },

  {
    slug: 'calculadora-impuestos-ecommerce',
    component: 'CalculadoraImpuestosEcommerce',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de Impuestos para un e-commerce en España',
    description: 'Calculadora de Impuestos para un e-commerce en España',
    hasContent: true,
  },

  {
    slug: 'calculadora-cuota-autonomo-societario',
    component: 'CalculadoraCuotaAutonomoSocietario',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de la cuota de autónomo societario',
    description: 'Calculadora de la cuota de autónomo societario',
    hasContent: true,
  },

  {
    slug: 'calculadora-cese-actividad-autonomos',
    component: 'CalculadoraCeseActividadAutonomos',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de la prestación por cese de actividad (paro de autónomos)',
    description: 'Calculadora de la prestación por cese de actividad (paro de autónomos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-artistas-deportistas',
    component: 'CalculadoraIrpfArtistasDeportistas',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de IRPF para artistas y deportistas',
    description: 'Calculadora de IRPF para artistas y deportistas',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-traductores',
    component: 'CalculadoraIrpfTraductores',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de IRPF para traductores e intérpretes autónomos',
    description: 'Calculadora de IRPF para traductores e intérpretes autónomos',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-consultores-marketing',
    component: 'CalculadoraIrpfConsultoresMarketing',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de IRPF para consultores de marketing autónomos',
    description: 'Calculadora de IRPF para consultores de marketing autónomos',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-arquitectos',
    component: 'CalculadoraIrpfArquitectos',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de IRPF para arquitectos y aparejadores autónomos',
    description: 'Calculadora de IRPF para arquitectos y aparejadores autónomos',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-medicos',
    component: 'CalculadoraIrpfMedicos',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de IRPF para médicos y profesionales sanitarios autónomos',
    description: 'Calculadora de IRPF para médicos y profesionales sanitarios autónomos',
    hasContent: true,
  },

  {
    slug: 'uka-vat-calculator',
    component: 'UkaVatCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK VAT Calculator',
    description: 'UK VAT Calculator',
    hasContent: true,
  },

  {
    slug: 'ukb-vat-calculator',
    component: 'UkbVatCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK VAT Calculator',
    description: 'UK VAT Calculator',
    hasContent: true,
  },

  {
    slug: 'ukc-vat-calculator',
    component: 'UkcVatCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK VAT Calculator',
    description: 'UK VAT Calculator',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-fotografos',
    component: 'CalculadoraIrpfFotografos',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de IRPF para fotógrafos autónomos',
    description: 'Calculadora de IRPF para fotógrafos autónomos',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-disenadores-graficos',
    component: 'CalculadoraIrpfDisenadoresGraficos',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de IRPF para diseñadores gráficos autónomos',
    description: 'Calculadora de IRPF para diseñadores gráficos autónomos',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-fisioterapeutas',
    component: 'CalculadoraIrpfFisioterapeutas',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de IRPF para fisioterapeutas autónomos',
    description: 'Calculadora de IRPF para fisioterapeutas autónomos',
    hasContent: true,
  },

  {
    slug: 'calculadora-irpf-psicologos',
    component: 'CalculadoraIrpfPsicologos',
    category: 'impuestos-y-trabajo-autonomo',
    lang: 'es',
    title: 'Calculadora de IRPF para psicólogos autónomos',
    description: 'Calculadora de IRPF para psicólogos autónomos',
    hasContent: true,
  },

  {
    slug: 'calculadora-gastos-compraventa-vivienda',
    component: 'CalculadoraGastosCompraventaVivienda',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de Gastos de Compraventa de Vivienda (ITP vs. IVA por C.A.)',
    description: 'Calculadora de Gastos de Compraventa de Vivienda (ITP vs. IVA por C.A.)',
    hasContent: true,
  },

  {
    slug: 'calculadora-rentabilidad-alquiler',
    component: 'CalculadoraRentabilidadAlquiler',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de Rentabilidad Neta de Alquiler (descontando IBI, comunidad, etc.)',
    description: 'Calculadora de Rentabilidad Neta de Alquiler (descontando IBI, comunidad, etc.)',
    hasContent: true,
  },

  {
    slug: 'calculadora-desgravacion-alquiler',
    component: 'CalculadoraDesgravacionAlquiler',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de Desgravación por Alquiler de Vivienda Habitual',
    description: 'Calculadora de Desgravación por Alquiler de Vivienda Habitual',
    hasContent: true,
  },

  {
    slug: 'calculadora-costes-notaria-registro',
    component: 'CalculadoraCostesNotariaRegistro',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de Costes de Notaría y Registro para compraventa',
    description: 'Calculadora de Costes de Notaría y Registro para compraventa',
    hasContent: true,
  },

  {
    slug: 'calculadora-cedula-habitabilidad',
    component: 'CalculadoraCedulaHabitabilidad',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Cédula de Habitabilidad (costes y trámites)',
    description: 'Calculadora de la Cédula de Habitabilidad (costes y trámites)',
    hasContent: true,
  }
,

  // Additional calculators from CSV (400-700)
  {
    slug: 'calculateur-budget-potager',
    component: 'CalculateurBudgetPotager',
    category: 'agriculture-et-alimentation',
    lang: 'fr',
    title: 'Calculateur du Budget pour un Potager Familial',
    description: 'Calculateur du Budget pour un Potager Familial',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-saison-ski',
    component: 'CalculateurCoutSaisonSki',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Coût d\'une Saison de Ski (forfait, matériel, logement)',
    description: 'Calculateur du Coût d\'une Saison de Ski (forfait, matériel, logement)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-cheval',
    component: 'CalculateurCoutCheval',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Coût d\'un Cheval (pension, soins)',
    description: 'Calculateur du Coût d\'un Cheval (pension, soins)',
    hasContent: true,
  },

  {
    slug: 'calculateur-budget-tour-de-france',
    component: 'CalculateurBudgetTourDeFrance',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Budget pour le Tour de France (spectateur)',
    description: 'Calculateur du Budget pour le Tour de France (spectateur)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-licence-sportive',
    component: 'CalculateurCoutLicenceSportive',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Coût d\'une Licence Sportive',
    description: 'Calculateur du Coût d\'une Licence Sportive',
    hasContent: true,
  },

  {
    slug: 'calculateur-pass-culture',
    component: 'CalculateurPassCulture',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Pass Culture',
    description: 'Calculateur du Pass Culture',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-instrument-musique',
    component: 'CalculateurCoutInstrumentMusique',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Coût d\'un Instrument de Musique (achat vs. location)',
    description: 'Calculateur du Coût d\'un Instrument de Musique (achat vs. location)',
    hasContent: true,
  },

  {
    slug: 'calculateur-budget-festival-musique',
    component: 'CalculateurBudgetFestivalMusique',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Budget pour un Festival de Musique (billet, transport, logement)',
    description: 'Calculateur du Budget pour un Festival de Musique (billet, transport, logement)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-rentree-litteraire',
    component: 'CalculateurCoutRentreeLitteraire',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Coût de la Rentrée Littéraire',
    description: 'Calculateur du Coût de la Rentrée Littéraire',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-salle-sport',
    component: 'CalculateurCoutSalleSport',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Coût d\'un Abonnement à une Salle de Sport',
    description: 'Calculateur du Coût d\'un Abonnement à une Salle de Sport',
    hasContent: true,
  },

  {
    slug: 'calculateur-bilan-carbone-voyage',
    component: 'CalculateurBilanCarboneVoyage',
    category: 'loisirs-et-temps-libre',
    lang: 'fr',
    title: 'Calculateur du Bilan Carbone d\'un Voyage',
    description: 'Calculateur du Bilan Carbone d\'un Voyage',
    hasContent: true,
  },

  {
    slug: 'uk-self-assessment-tax-calculator',
    component: 'UkSelfAssessmentTaxCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK Self-Assessment Tax Calculator (Income Tax & Class 2/4 NI)',
    description: 'UK Self-Assessment Tax Calculator (Income Tax & Class 2/4 NI)',
    hasContent: true,
  },

  {
    slug: 'us-self-employment-tax-calculator',
    component: 'UsSelfEmploymentTaxCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US Self-Employment Tax Calculator (Schedule C & SE Tax)',
    description: 'US Self-Employment Tax Calculator (Schedule C & SE Tax)',
    hasContent: true,
  },

  {
    slug: 'canada-self-employment-tax-calculator',
    component: 'CanadaSelfEmploymentTaxCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'Canada Self-Employment Tax Calculator (CPP & EI Premiums)',
    description: 'Canada Self-Employment Tax Calculator (CPP & EI Premiums)',
    hasContent: true,
  },

  {
    slug: 'uk-ir35-deemed-salary-calculator',
    component: 'UkIr35DeemedSalaryCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK IR35 "Deemed Salary" Calculator for Contractors',
    description: 'UK IR35 "Deemed Salary" Calculator for Contractors',
    hasContent: true,
  },

  {
    slug: 'us-quarterly-estimated-tax-calculator',
    component: 'UsQuarterlyEstimatedTaxCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US Quarterly Estimated Tax Calculator (Form 1040-ES)',
    description: 'US Quarterly Estimated Tax Calculator (Form 1040-ES)',
    hasContent: true,
  },

  {
    slug: 'us-foreign-earned-income-calculator',
    component: 'UsForeignEarnedIncomeCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US Foreign Earned Income Exclusion Calculator for Expats',
    description: 'US Foreign Earned Income Exclusion Calculator for Expats',
    hasContent: true,
  },

  {
    slug: 'uk-stamp-duty-land-calculator',
    component: 'UkStampDutyLandCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK Stamp Duty Land Tax (SDLT) Calculator',
    description: 'UK Stamp Duty Land Tax (SDLT) Calculator',
    hasContent: true,
  },

  {
    slug: 'us-state-income-tax-calculator',
    component: 'UsStateIncomeTaxCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US State Income Tax Calculator (comparison across states)',
    description: 'US State Income Tax Calculator (comparison across states)',
    hasContent: true,
  },

  {
    slug: 'canada-gsthst-small-businesses-calculator',
    component: 'CanadaGsthstSmallBusinessesCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'Canada GST/HST Calculator for Small Businesses',
    description: 'Canada GST/HST Calculator for Small Businesses',
    hasContent: true,
  },

  {
    slug: 'uk-payment-account-calculator',
    component: 'UkPaymentAccountCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK "Payment on Account" Calculator',
    description: 'UK "Payment on Account" Calculator',
    hasContent: true,
  },

  {
    slug: 'us-pass-through-business-deduction-calculator',
    component: 'UsPassThroughBusinessDeductionCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US "Pass-Through" Business Deduction Calculator (QBI)',
    description: 'US "Pass-Through" Business Deduction Calculator (QBI)',
    hasContent: true,
  },

  {
    slug: 'uk-vat-registration-threshold-calculator',
    component: 'UkVatRegistrationThresholdCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK VAT Registration Threshold Calculator',
    description: 'UK VAT Registration Threshold Calculator',
    hasContent: true,
  },

  {
    slug: 'us-hobby-business-income-calculator',
    component: 'UsHobbyBusinessIncomeCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US "Hobby vs. Business" Income Tax Calculator',
    description: 'US "Hobby vs. Business" Income Tax Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-business-number-personal-calculator',
    component: 'CanadaBusinessNumberPersonalCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'Canada Business Number (BN) vs. Personal Tax Number Calculator',
    description: 'Canada Business Number (BN) vs. Personal Tax Number Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-making-tax-digital-calculator',
    component: 'UkMakingTaxDigitalCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK "Making Tax Digital" (MTD) Cost Calculator',
    description: 'UK "Making Tax Digital" (MTD) Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'us-llc-s-corp-tax-calculator',
    component: 'UsLlcSCorpTaxCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US LLC vs. S-Corp Tax Savings Calculator',
    description: 'US LLC vs. S-Corp Tax Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-capital-gains-tax-calculator',
    component: 'UkCapitalGainsTaxCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK "Capital Gains Tax on Property" Calculator',
    description: 'UK "Capital Gains Tax on Property" Calculator',
    hasContent: true,
  },

  {
    slug: 'us-home-office-deduction-calculator',
    component: 'UsHomeOfficeDeductionCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US "Home Office Deduction" Calculator (simplified vs. actual expense)',
    description: 'US "Home Office Deduction" Calculator (simplified vs. actual expense)',
    hasContent: true,
  },

  {
    slug: 'canada-home-office-expenses-calculator',
    component: 'CanadaHomeOfficeExpensesCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'Canada "Home Office Expenses" Calculator for Employees/Self-Employed',
    description: 'Canada "Home Office Expenses" Calculator for Employees/Self-Employed',
    hasContent: true,
  },

  {
    slug: 'uk-mileage-allowance-calculator',
    component: 'UkMileageAllowanceCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK "Mileage Allowance" Calculator',
    description: 'UK "Mileage Allowance" Calculator',
    hasContent: true,
  },

  {
    slug: 'us-mileage-deduction-calculator',
    component: 'UsMileageDeductionCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US "Mileage Deduction" Calculator (standard vs. actual)',
    description: 'US "Mileage Deduction" Calculator (standard vs. actual)',
    hasContent: true,
  },

  {
    slug: 'canada-vehicle-expenses-deduction-calculator',
    component: 'CanadaVehicleExpensesDeductionCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'Canada "Vehicle Expenses" Deduction Calculator',
    description: 'Canada "Vehicle Expenses" Deduction Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-dividend-tax-calculator',
    component: 'UkDividendTaxCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK "Dividend Tax" Calculator (for company directors)',
    description: 'UK "Dividend Tax" Calculator (for company directors)',
    hasContent: true,
  },

  {
    slug: 'us-qualified-dividends-ordinary-calculator',
    component: 'UsQualifiedDividendsOrdinaryCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US "Qualified Dividends" vs. "Ordinary Dividends" Tax Calculator',
    description: 'US "Qualified Dividends" vs. "Ordinary Dividends" Tax Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-eligible-ineligible-dividends-calculator',
    component: 'CanadaEligibleIneligibleDividendsCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'Canada "Eligible vs. Ineligible Dividends" Tax Calculator',
    description: 'Canada "Eligible vs. Ineligible Dividends" Tax Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-child-benefit-high-calculator',
    component: 'UkChildBenefitHighCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK "Child Benefit High Income Charge" Calculator',
    description: 'UK "Child Benefit High Income Charge" Calculator',
    hasContent: true,
  },

  {
    slug: 'us-child-tax-credit-calculator',
    component: 'UsChildTaxCreditCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US "Child Tax Credit" (CTC) Phase-Out Calculator',
    description: 'US "Child Tax Credit" (CTC) Phase-Out Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-child-benefit-calculator',
    component: 'CanadaChildBenefitCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'Canada "Child Benefit" (CCB) Calculator',
    description: 'Canada "Child Benefit" (CCB) Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-marriage-allowance-calculator',
    component: 'UkMarriageAllowanceCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK "Marriage Allowance" Calculator',
    description: 'UK "Marriage Allowance" Calculator',
    hasContent: true,
  },

  {
    slug: 'us-married-filing-jointly-calculator',
    component: 'UsMarriedFilingJointlyCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'US "Married Filing Jointly vs. Separately" Tax Calculator  ',
    description: 'US "Married Filing Jointly vs. Separately" Tax Calculator  ',
    hasContent: true,
  },

  {
    slug: 'uk-buy-to-let-yield-roi-calculator',
    component: 'UkBuyToLetYieldRoiCalculator',
    category: 'tax-and-freelance-uk-us-ca',
    lang: 'en',
    title: 'UK Buy-to-Let Yield & ROI Calculator (incl. Section 24 mortgage interest changes)',
    description: 'UK Buy-to-Let Yield & ROI Calculator (incl. Section 24 mortgage interest changes)',
    hasContent: true,
  },

  {
    slug: 'us-property-tax-estimator',
    component: 'UsPropertyTaxEstimator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'US Property Tax Estimator (by state and county)',
    description: 'US Property Tax Estimator (by state and county)',
    hasContent: true,
  },

  {
    slug: 'canada-land-transfer-tax-calculator',
    component: 'CanadaLandTransferTaxCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'Canada Land Transfer Tax Calculator (by province)',
    description: 'Canada Land Transfer Tax Calculator (by province)',
    hasContent: true,
  },

  {
    slug: 'uk-help-buy-shared-calculator',
    component: 'UkHelpBuySharedCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'UK "Help to Buy" vs. "Shared Ownership" Scheme Calculator',
    description: 'UK "Help to Buy" vs. "Shared Ownership" Scheme Calculator',
    hasContent: true,
  },

  {
    slug: 'us-heloc-cash-out-refinance-calculator',
    component: 'UsHelocCashOutRefinanceCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'US HELOC (Home Equity Line of Credit) vs. Cash-Out Refinance Calculator',
    description: 'US HELOC (Home Equity Line of Credit) vs. Cash-Out Refinance Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-first-time-home-buyers-calculator',
    component: 'CanadaFirstTimeHomeBuyersCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'Canada "First-Time Home Buyers\' Incentive" Calculator',
    description: 'Canada "First-Time Home Buyers\' Incentive" Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-right-buy-discount-calculator',
    component: 'UkRightBuyDiscountCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'UK "Right to Buy" Discount Calculator',
    description: 'UK "Right to Buy" Discount Calculator',
    hasContent: true,
  },

  {
    slug: 'us-house-hacking-profitability-calculator',
    component: 'UsHouseHackingProfitabilityCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'US "House Hacking" Profitability Calculator',
    description: 'US "House Hacking" Profitability Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-rental-income-tax-calculator',
    component: 'CanadaRentalIncomeTaxCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'Canada "Rental Income" Tax Calculator',
    description: 'Canada "Rental Income" Tax Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-lease-extension-cost-calculator',
    component: 'UkLeaseExtensionCostCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'UK "Lease Extension" Cost Calculator',
    description: 'UK "Lease Extension" Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'us-fix-flip-profit-calculator',
    component: 'UsFixFlipProfitCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'US "Fix and Flip" Profit Calculator',
    description: 'US "Fix and Flip" Profit Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-principal-residence-exemption-calculator',
    component: 'CanadaPrincipalResidenceExemptionCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'Canada "Principal Residence Exemption" Calculator',
    description: 'Canada "Principal Residence Exemption" Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-ground-rent-service-estimator',
    component: 'UkGroundRentServiceEstimator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'UK "Ground Rent" and "Service Charge" Estimator',
    description: 'UK "Ground Rent" and "Service Charge" Estimator',
    hasContent: true,
  },

  {
    slug: 'us-mortgage-points-break-even-calculator',
    component: 'UsMortgagePointsBreakEvenCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'US "Mortgage Points" (Discount Points) Break-Even Calculator',
    description: 'US "Mortgage Points" (Discount Points) Break-Even Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-mortgage-stress-test-calculator',
    component: 'CanadaMortgageStressTestCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'Canada "Mortgage Stress Test" Calculator',
    description: 'Canada "Mortgage Stress Test" Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-council-tax-band-calculator',
    component: 'UkCouncilTaxBandCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'UK "Council Tax" Band Calculator',
    description: 'UK "Council Tax" Band Calculator',
    hasContent: true,
  },

  {
    slug: 'us-closing-costs-estimator',
    component: 'UsClosingCostsEstimator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'US "Closing Costs" Estimator',
    description: 'US "Closing Costs" Estimator',
    hasContent: true,
  },

  {
    slug: 'canada-home-buyers-plan-calculator',
    component: 'CanadaHomeBuyersPlanCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'Canada "Home Buyers\' Plan" (HBP) RRSP Withdrawal Calculator',
    description: 'Canada "Home Buyers\' Plan" (HBP) RRSP Withdrawal Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-energy-performance-certificate-calculator',
    component: 'UkEnergyPerformanceCertificateCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'UK "Energy Performance Certificate" (EPC) Improvement Cost Calculator',
    description: 'UK "Energy Performance Certificate" (EPC) Improvement Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'us-va-loan-funding-calculator',
    component: 'UsVaLoanFundingCalculator',
    category: 'real-estate-&-housing',
    lang: 'en',
    title: 'US "VA Loan" Funding Fee Calculator',
    description: 'US "VA Loan" Funding Fee Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-isa-portfolio-allowance-tracker',
    component: 'UkIsaPortfolioAllowanceTracker',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'UK ISA (Individual Savings Account) Portfolio & Allowance Tracker',
    description: 'UK ISA (Individual Savings Account) Portfolio & Allowance Tracker',
    hasContent: true,
  },

  {
    slug: 'us-401-roth-ira-calculator',
    component: 'Us401RothIraCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'US 401(k) vs. Roth IRA Contribution Calculator',
    description: 'US 401(k) vs. Roth IRA Contribution Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-rrsp-tfsa-contribution-optimizer',
    component: 'CanadaRrspTfsaContributionOptimizer',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'Canada RRSP vs. TFSA Contribution Optimizer',
    description: 'Canada RRSP vs. TFSA Contribution Optimizer',
    hasContent: true,
  },

  {
    slug: 'uk-capital-gains-tax-calculator',
    component: 'UkCapitalGainsTaxCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'UK "Capital Gains Tax" on Shares/Investments Calculator',
    description: 'UK "Capital Gains Tax" on Shares/Investments Calculator',
    hasContent: true,
  },

  {
    slug: 'us-fire-calculator',
    component: 'UsFireCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'US FIRE (Financial Independence, Retire Early) Calculator',
    description: 'US FIRE (Financial Independence, Retire Early) Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-registered-education-savings-calculator',
    component: 'CanadaRegisteredEducationSavingsCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'Canada "Registered Education Savings Plan" (RESP) Grant Calculator',
    description: 'Canada "Registered Education Savings Plan" (RESP) Grant Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-sipp-tax-relief-calculator',
    component: 'UkSippTaxReliefCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'UK "SIPP" (Self-Invested Personal Pension) Tax Relief Calculator',
    description: 'UK "SIPP" (Self-Invested Personal Pension) Tax Relief Calculator',
    hasContent: true,
  },

  {
    slug: 'us-hsa-triple-tax-calculator',
    component: 'UsHsaTripleTaxCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'US "HSA" (Health Savings Account) Triple Tax Advantage Calculator',
    description: 'US "HSA" (Health Savings Account) Triple Tax Advantage Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-lira-unlocking-calculator',
    component: 'CanadaLiraUnlockingCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'Canada "LIRA" (Locked-In Retirement Account) Unlocking Calculator',
    description: 'Canada "LIRA" (Locked-In Retirement Account) Unlocking Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-premium-bonds-chance-calculator',
    component: 'UkPremiumBondsChanceCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'UK "Premium Bonds" Prize Chance Calculator',
    description: 'UK "Premium Bonds" Prize Chance Calculator',
    hasContent: true,
  },

  {
    slug: 'us-social-security-benefit-estimator',
    component: 'UsSocialSecurityBenefitEstimator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'US "Social Security" Benefit Estimator',
    description: 'US "Social Security" Benefit Estimator',
    hasContent: true,
  },

  {
    slug: 'canada-cpp-pension-estimator',
    component: 'CanadaCppPensionEstimator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'Canada "Pension Plan" (CPP) Estimator',
    description: 'Canada "Pension Plan" (CPP) Estimator',
    hasContent: true,
  },

  {
    slug: 'uk-pension-lifetime-allowance-calculator',
    component: 'UkPensionLifetimeAllowanceCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'UK "Pension Lifetime Allowance" (LTA) Calculator (historical)',
    description: 'UK "Pension Lifetime Allowance" (LTA) Calculator (historical)',
    hasContent: true,
  },

  {
    slug: 'us-required-minimum-distribution-calculator',
    component: 'UsRequiredMinimumDistributionCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'US "Required Minimum Distribution" (RMD) Calculator for retirement accounts',
    description: 'US "Required Minimum Distribution" (RMD) Calculator for retirement accounts',
    hasContent: true,
  },

  {
    slug: 'canada-oas-clawback-calculator',
    component: 'CanadaOasClawbackCalculator',
    category: 'savings-&-investment',
    lang: 'en',
    title: 'Canada "Old Age Security" (OAS) Clawback Calculator',
    description: 'Canada "Old Age Security" (OAS) Clawback Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-corporation-tax-calculator',
    component: 'UkCorporationTaxCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'UK "Corporation Tax" Calculator',
    description: 'UK "Corporation Tax" Calculator',
    hasContent: true,
  },

  {
    slug: 'us-s-corp-c-corp-tax-calculator',
    component: 'UsSCorpCCorpTaxCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'US "S-Corp vs. C-Corp" Tax Comparison Calculator',
    description: 'US "S-Corp vs. C-Corp" Tax Comparison Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-small-business-deduction-calculator',
    component: 'CanadaSmallBusinessDeductionCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'Canada "Small Business Deduction" (SBD) Calculator',
    description: 'Canada "Small Business Deduction" (SBD) Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-rd-tax-credit-estimator',
    component: 'UkRdTaxCreditEstimator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'UK "R&D Tax Credit" Estimator',
    description: 'UK "R&D Tax Credit" Estimator',
    hasContent: true,
  },

  {
    slug: 'us-ppp-loan-forgiveness-calculator',
    component: 'UsPppLoanForgivenessCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'US "Paycheck Protection Program" (PPP) Loan Forgiveness Calculator (historical)',
    description: 'US "Paycheck Protection Program" (PPP) Loan Forgiveness Calculator (historical)',
    hasContent: true,
  },

  {
    slug: 'canada-ceba-loan-repayment-calculator',
    component: 'CanadaCebaLoanRepaymentCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'Canada "Emergency Business Account" (CEBA) Loan Repayment Calculator',
    description: 'Canada "Emergency Business Account" (CEBA) Loan Repayment Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-business-rates-calculator',
    component: 'UkBusinessRatesCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'UK "Business Rates" Calculator',
    description: 'UK "Business Rates" Calculator',
    hasContent: true,
  },

  {
    slug: 'us-net-operating-loss-calculator',
    component: 'UsNetOperatingLossCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'US "Net Operating Loss" (NOL) Carryforward Calculator',
    description: 'US "Net Operating Loss" (NOL) Carryforward Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-scientific-research-experimental-calculator',
    component: 'CanadaScientificResearchExperimentalCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'Canada "Scientific Research & Experimental Development" (SR&ED) Tax Incentive Calculator',
    description: 'Canada "Scientific Research & Experimental Development" (SR&ED) Tax Incentive Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-annual-investment-allowance-calculator',
    component: 'UkAnnualInvestmentAllowanceCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'UK "Annual Investment Allowance" (AIA) Calculator',
    description: 'UK "Annual Investment Allowance" (AIA) Calculator',
    hasContent: true,
  },

  {
    slug: 'us-employee-retention-credit-estimator',
    component: 'UsEmployeeRetentionCreditEstimator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'US "Employee Retention Credit" (ERC) Estimator (historical)',
    description: 'US "Employee Retention Credit" (ERC) Estimator (historical)',
    hasContent: true,
  },

  {
    slug: 'canada-wage-subsidy-calculator',
    component: 'CanadaWageSubsidyCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'Canada "Wage Subsidy" (CEWS) Calculator (historical)',
    description: 'Canada "Wage Subsidy" (CEWS) Calculator (historical)',
    hasContent: true,
  },

  {
    slug: 'saas-churn-rate-calculator',
    component: 'SaasChurnRateCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'SaaS Churn Rate Calculator',
    description: 'SaaS Churn Rate Calculator',
    hasContent: true,
  },

  {
    slug: 'customer-lifetime-value-customer-calculator',
    component: 'CustomerLifetimeValueCustomerCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'Customer Lifetime Value (CLV) to "Customer Acquisition Cost" (CAC) Ratio Calculator',
    description: 'Customer Lifetime Value (CLV) to "Customer Acquisition Cost" (CAC) Ratio Calculator',
    hasContent: true,
  },

  {
    slug: 'monthly-recurring-revenue-annual-calculator',
    component: 'MonthlyRecurringRevenueAnnualCalculator',
    category: 'sme-&-business',
    lang: 'en',
    title: 'Monthly Recurring Revenue (MRR) & "Annual Recurring Revenue" (ARR) Calculator',
    description: 'Monthly Recurring Revenue (MRR) & "Annual Recurring Revenue" (ARR) Calculator',
    hasContent: true,
  },

  {
    slug: 'uk-student-loan-repayment-calculator',
    component: 'UkStudentLoanRepaymentCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'UK "Student Loan Repayment" Calculator (Plan 1, 2, 4, 5 & Postgraduate)',
    description: 'UK "Student Loan Repayment" Calculator (Plan 1, 2, 4, 5 & Postgraduate)',
    hasContent: true,
  },

  {
    slug: 'us-student-loan-forgiveness-calculator',
    component: 'UsStudentLoanForgivenessCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'US "Student Loan Forgiveness" (PSLF, SAVE) Calculator',
    description: 'US "Student Loan Forgiveness" (PSLF, SAVE) Calculator',
    hasContent: true,
  },

  {
    slug: 'canada-student-loan-repayment-calculator',
    component: 'CanadaStudentLoanRepaymentCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Canada "Student Loan Repayment Assistance Plan" (RAP) Calculator',
    description: 'Canada "Student Loan Repayment Assistance Plan" (RAP) Calculator',
    hasContent: true,
  },

  {
    slug: 'salary-freelance-net-income-calculator',
    component: 'SalaryFreelanceNetIncomeCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Salary vs. Freelance Net Income Comparison Calculator',
    description: 'Salary vs. Freelance Net Income Comparison Calculator',
    hasContent: true,
  },

  {
    slug: 'cost-a-masters-degree-calculator',
    component: 'CostAMastersDegreeCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Cost of a Master\'s Degree ROI Calculator',
    description: 'Cost of a Master\'s Degree ROI Calculator',
    hasContent: true,
  },

  {
    slug: 'job-offer-comparison-calculator',
    component: 'JobOfferComparisonCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Job Offer Comparison Calculator (salary, benefits, commute)',
    description: 'Job Offer Comparison Calculator (salary, benefits, commute)',
    hasContent: true,
  },

  {
    slug: 'salary-negotiation-range-calculator',
    component: 'SalaryNegotiationRangeCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Salary Negotiation Range Calculator',
    description: 'Salary Negotiation Range Calculator',
    hasContent: true,
  },

  {
    slug: 'career-change-financial-impact-calculator',
    component: 'CareerChangeFinancialImpactCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Career Change Financial Impact Calculator',
    description: 'Career Change Financial Impact Calculator',
    hasContent: true,
  },

  {
    slug: 'coding-bootcamp-roi-calculator',
    component: 'CodingBootcampRoiCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Coding Bootcamp ROI Calculator',
    description: 'Coding Bootcamp ROI Calculator',
    hasContent: true,
  },

  {
    slug: 'unpaid-internship-opportunity-cost-calculator',
    component: 'UnpaidInternshipOpportunityCostCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Unpaid Internship Opportunity Cost Calculator',
    description: 'Unpaid Internship Opportunity Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'electric-vehicle-tco-calculator',
    component: 'ElectricVehicleTcoCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Electric Vehicle (EV) Total Cost of Ownership Calculator (incl. local grants/credits)',
    description: 'Electric Vehicle (EV) Total Cost of Ownership Calculator (incl. local grants/credits)',
    hasContent: true,
  },

  {
    slug: 'digital-nomad-tax-residency-calculator',
    component: 'DigitalNomadTaxResidencyCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Digital Nomad Tax Residency Calculator (183-day rule tracker)',
    description: 'Digital Nomad Tax Residency Calculator (183-day rule tracker)',
    hasContent: true,
  },

  {
    slug: 'cost-of-living-comparison-calculator',
    component: 'CostOfLivingComparisonCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Cost of Living Comparison Calculator (City A vs. City B)',
    description: 'Cost of Living Comparison Calculator (City A vs. City B)',
    hasContent: true,
  },

  {
    slug: 'pet-ownership-lifetime-cost-calculator',
    component: 'PetOwnershipLifetimeCostCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Pet Ownership Lifetime Cost Calculator (by breed/country)',
    description: 'Pet Ownership Lifetime Cost Calculator (by breed/country)',
    hasContent: true,
  },

  {
    slug: 'wedding-budget-calculator',
    component: 'WeddingBudgetCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Wedding Budget Calculator (by location/guest count)',
    description: 'Wedding Budget Calculator (by location/guest count)',
    hasContent: true,
  },

  {
    slug: 'subscription-service-audit-calculator',
    component: 'SubscriptionServiceAuditCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Subscription Service Audit & Cost Calculator',
    description: 'Subscription Service Audit & Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'diy-professional-renovation-calculator',
    component: 'DiyProfessionalRenovationCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'DIY vs. Professional Home Renovation Cost Calculator',
    description: 'DIY vs. Professional Home Renovation Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'brew-your-own-beer-cost-calculator',
    component: 'BrewYourOwnBeerCostCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Brewing Your Own Beer Cost vs. Buying Calculator',
    description: 'Brewing Your Own Beer Cost vs. Buying Calculator',
    hasContent: true,
  },

  {
    slug: 'streaming-service-bundle-calculator',
    component: 'StreamingServiceBundleCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Streaming Service Bundle Cost Optimizer',
    description: 'Streaming Service Bundle Cost Optimizer',
    hasContent: true,
  },

  {
    slug: 'gym-membership-home-gym-calculator',
    component: 'GymMembershipHomeGymCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Gym Membership vs. "Home Gym" Cost Calculator',
    description: 'Gym Membership vs. "Home Gym" Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'meal-kit-grocery-comparison-calculator',
    component: 'MealKitGroceryComparisonCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Meal Kit vs. "Grocery Shopping" Cost Comparison',
    description: 'Meal Kit vs. "Grocery Shopping" Cost Comparison',
    hasContent: true,
  },

  {
    slug: 'coffee-shop-spending-calculator',
    component: 'CoffeeShopSpendingCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Coffee Shop Spending Calculator',
    description: 'Coffee Shop Spending Calculator',
    hasContent: true,
  },

  {
    slug: 'fast-fashion-cost-calculator',
    component: 'FastFashionCostCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Fast Fashion Environmental & Financial Cost Calculator',
    description: 'Fast Fashion Environmental & Financial Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'minimalism-challenge-savings-calculator',
    component: 'MinimalismChallengeSavingsCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Minimalism Challenge Savings Calculator',
    description: 'Minimalism Challenge Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'zero-waste-savings-calculator',
    component: 'ZeroWasteSavingsCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Zero-Waste Lifestyle Savings Calculator',
    description: 'Zero-Waste Lifestyle Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'adsense-revenues',
    component: 'AdsenseRevenues',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'YouTube AdSense Revenue Estimator (by niche/CPM)',
    description: 'YouTube AdSense Revenue Estimator (by niche/CPM)',
    hasContent: true,
  },

  {
    slug: 'twitch-income-calculator',
    component: 'TwitchIncomeCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Twitch Streamer Income Calculator (subs, bits, ads)',
    description: 'Twitch Streamer Income Calculator (subs, bits, ads)',
    hasContent: true,
  },

  {
    slug: 'patreon-substack-earnings-calculator',
    component: 'PatreonSubstackEarningsCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Patreon/Substack Creator Earnings Calculator',
    description: 'Patreon/Substack Creator Earnings Calculator',
    hasContent: true,
  },

  {
    slug: 'podcast-sponsorship-rate-calculator',
    component: 'PodcastSponsorshipRateCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Podcast Sponsorship Rate Calculator',
    description: 'Podcast Sponsorship Rate Calculator',
    hasContent: true,
  },

  {
    slug: 'influencer-brand-deal-calculator',
    component: 'InfluencerBrandDealCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Influencer Brand Deal Rate Calculator',
    description: 'Influencer Brand Deal Rate Calculator',
    hasContent: true,
  },

  {
    slug: 'etsy-profit-margin-calculator',
    component: 'EtsyProfitMarginCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Etsy Seller Profit Margin Calculator',
    description: 'Etsy Seller Profit Margin Calculator',
    hasContent: true,
  },

  {
    slug: 'amazon-fba-profit-calculator',
    component: 'AmazonFbaProfitCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Amazon FBA Seller Profit Calculator (by EU/NA marketplace)',
    description: 'Amazon FBA Seller Profit Calculator (by EU/NA marketplace)',
    hasContent: true,
  },

  {
    slug: 'shopify-dropshipping-profit-calculator',
    component: 'ShopifyDropshippingProfitCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Shopify Dropshipping Profit Calculator',
    description: 'Shopify Dropshipping Profit Calculator',
    hasContent: true,
  },

  {
    slug: 'nft-creator-fee-calculator',
    component: 'NftCreatorFeeCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'NFT Creator Gas Fee & Royalty Calculator',
    description: 'NFT Creator Gas Fee & Royalty Calculator',
    hasContent: true,
  },

  {
    slug: 'self-publishing-royalties-calculator',
    component: 'SelfPublishingRoyaltiesCalculator',
    category: 'lifestyle-&-niche',
    lang: 'en',
    title: 'Self-Publishing (KDP) Royalties Calculator',
    description: 'Self-Publishing (KDP) Royalties Calculator',
    hasContent: true,
  },

  {
    slug: 'health-insurance-plan-comparison-calculator',
    component: 'HealthInsurancePlanComparisonCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'Health Insurance Plan Comparison Calculator (deductible, premium, out-of-pocket max)',
    description: 'Health Insurance Plan Comparison Calculator (deductible, premium, out-of-pocket max)',
    hasContent: true,
  },

  {
    slug: 'co2-footprint-calculator',
    component: 'Co2FootprintCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'CO2 Footprint Calculator (travel, diet, energy)',
    description: 'CO2 Footprint Calculator (travel, diet, energy)',
    hasContent: true,
  },

  {
    slug: 'solar-panel-roi-calculator',
    component: 'SolarPanelRoiCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'Solar Panel Installation ROI Calculator (incl. local incentives)',
    description: 'Solar Panel Installation ROI Calculator (incl. local incentives)',
    hasContent: true,
  },

  {
    slug: 'rainwater-harvesting-savings-calculator',
    component: 'RainwaterHarvestingSavingsCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'Rainwater Harvesting Savings Calculator',
    description: 'Rainwater Harvesting Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'composting-savings-calculator',
    component: 'CompostingSavingsCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'Composting Waste Reduction & Savings Calculator',
    description: 'Composting Waste Reduction & Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'vegan-diet-savings-calculator',
    component: 'VeganDietSavingsCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'Vegan Diet Cost Savings Calculator',
    description: 'Vegan Diet Cost Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'bicycle-commuting-savings-calculator',
    component: 'BicycleCommutingSavingsCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'Bicycle Commuting Savings Calculator (fuel, maintenance, health)',
    description: 'Bicycle Commuting Savings Calculator (fuel, maintenance, health)',
    hasContent: true,
  },

  {
    slug: 'therapy-cost-insurance-calculator',
    component: 'TherapyCostInsuranceCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'Therapy/Counseling Cost & Insurance Calculator',
    description: 'Therapy/Counseling Cost & Insurance Calculator',
    hasContent: true,
  },

  {
    slug: 'ivf-treatment-cost-calculator',
    component: 'IvfTreatmentCostCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'IVF Treatment Cost Estimator',
    description: 'IVF Treatment Cost Estimator',
    hasContent: true,
  },

  {
    slug: 'elder-care-cost-calculator',
    component: 'ElderCareCostCalculator',
    category: 'health-&-sustainability',
    lang: 'en',
    title: 'Elder Care Cost Calculator (in-home vs. facility)',
    description: 'Elder Care Cost Calculator (in-home vs. facility)',
    hasContent: true,
  },

  {
    slug: 'tassazione-agente-immobiliare-calcolatore',
    component: 'TassazioneAgenteImmobiliareCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Agente Immobiliare (con INPS Commercianti)',
    description: 'Calcolatore Tassazione per Agente Immobiliare (con INPS Commercianti)',
    hasContent: true,
  },

  {
    slug: 'tassazione-amministratore-condominio-calcolatore',
    component: 'TassazioneAmministratoreCondominioCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Amministratore di Condominio',
    description: 'Calcolatore Tassazione per Amministratore di Condominio',
    hasContent: true,
  },

  {
    slug: 'tassazione-guida-turistica-calcolatore',
    component: 'TassazioneGuidaTuristicaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Guida Turistica',
    description: 'Calcolatore Tassazione per Guida Turistica',
    hasContent: true,
  },

  {
    slug: 'tassazione-istruttore-palestra-calcolatore',
    component: 'TassazioneIstruttorePalestraCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Istruttore di Palestra',
    description: 'Calcolatore Tassazione per Istruttore di Palestra',
    hasContent: true,
  },

  {
    slug: 'tassazione-nomade-digitale-calcolatore',
    component: 'TassazioneNomadeDigitaleCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Nomade Digitale (residenza fiscale in Italia)',
    description: 'Calcolatore Tassazione per Nomade Digitale (residenza fiscale in Italia)',
    hasContent: true,
  },

  {
    slug: 'tassazione-onlyfans-patreon-calcolatore',
    component: 'TassazioneOnlyfansPatreonCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Redditi da OnlyFans/Patreon',
    description: 'Calcolatore Tassazione per Redditi da OnlyFans/Patreon',
    hasContent: true,
  },

  {
    slug: 'tassazione-twitchyoutube-calcolatore',
    component: 'TassazioneTwitchyoutubeCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Redditi da Twitch/YouTube',
    description: 'Calcolatore Tassazione per Redditi da Twitch/YouTube',
    hasContent: true,
  },

  {
    slug: 'tassazione-vinteddepop-calcolatore',
    component: 'TassazioneVinteddepopCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Vendite su Vinted/Depop (sotto soglia 5.000€)',
    description: 'Calcolatore Tassazione per Vendite su Vinted/Depop (sotto soglia 5.000€)',
    hasContent: true,
  },

  {
    slug: 'tassazione-etsyebay-calcolatore',
    component: 'TassazioneEtsyebayCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Vendite su Etsy/eBay',
    description: 'Calcolatore Tassazione per Vendite su Etsy/eBay',
    hasContent: true,
  },

  {
    slug: 'tassazione-dropshipping-calcolatore',
    component: 'TassazioneDropshippingCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Dropshipping',
    description: 'Calcolatore Tassazione per Dropshipping',
    hasContent: true,
  },

  {
    slug: 'tassazione-lavoratori-impatriati-calcolatore',
    component: 'TassazioneLavoratoriImpatriatiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Lavoratori Impatriati (Legge Beckham italiana)',
    description: 'Calcolatore Tassazione per Lavoratori Impatriati (Legge Beckham italiana)',
    hasContent: true,
  },

  {
    slug: 'tassazione-lavoratori-frontalieri-calcolatore',
    component: 'TassazioneLavoratoriFrontalieriCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Lavoratori Frontalieri (Svizzera/Austria/Francia)',
    description: 'Calcolatore Tassazione per Lavoratori Frontalieri (Svizzera/Austria/Francia)',
    hasContent: true,
  },

  {
    slug: 'contributi-minimi-eccedenti-calcolatore',
    component: 'ContributiMinimiEccedentiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Contributi Minimi vs. Eccedenti per Artigiani/Commercianti',
    description: 'Calcolatore Contributi Minimi vs. Eccedenti per Artigiani/Commercianti',
    hasContent: true,
  },

  {
    slug: 'riduzione-contributi-inps-calcolatore',
    component: 'RiduzioneContributiInpsCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Riduzione Contributi INPS del 35% per Forfettari',
    description: 'Calcolatore Riduzione Contributi INPS del 35% per Forfettari',
    hasContent: true,
  },

  {
    slug: 'riscatto-laurea-convenienza-calcolatore',
    component: 'RiscattoLaureaConvenienzaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Convenienza Riscatto Laurea (agevolato vs. ordinario)',
    description: 'Calcolatore Convenienza Riscatto Laurea (agevolato vs. ordinario)',
    hasContent: true,
  },

  {
    slug: 'tassazione-prestazione-occasionale-calcolatore',
    component: 'TassazionePrestazioneOccasionaleCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Prestazione Occasionale (con e senza ritenuta)',
    description: 'Calcolatore Tassazione per Prestazione Occasionale (con e senza ritenuta)',
    hasContent: true,
  },

  {
    slug: 'limite-5000-prestazione-occasionale-calcolatore',
    component: 'Limite5000PrestazioneOccasionaleCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Limite 5.000€ per Prestazione Occasionale',
    description: 'Calcolatore Limite 5.000€ per Prestazione Occasionale',
    hasContent: true,
  },

  {
    slug: 'tassazione-cessione-diritto-autore-calcolatore',
    component: 'TassazioneCessioneDirittoAutoreCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Cessione Diritto d\'Autore',
    description: 'Calcolatore Tassazione per Cessione Diritto d\'Autore',
    hasContent: true,
  },

  {
    slug: 'tassazione-insegnanti-privati-calcolatore',
    component: 'TassazioneInsegnantiPrivatiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Insegnanti Privati/Ripetizioni',
    description: 'Calcolatore Tassazione per Insegnanti Privati/Ripetizioni',
    hasContent: true,
  },

  {
    slug: 'tassazione-host-airbnb-calcolatore',
    component: 'TassazioneHostAirbnbCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Host Airbnb (locazione breve vs. attività imprenditoriale)',
    description: 'Calcolatore Tassazione per Host Airbnb (locazione breve vs. attività imprenditoriale)',
    hasContent: true,
  },

  {
    slug: 'tassazione-vendita-nft-calcolatore',
    component: 'TassazioneVenditaNftCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Vendita di NFT',
    description: 'Calcolatore Tassazione per Vendita di NFT',
    hasContent: true,
  },

  {
    slug: 'tassazione-staking-farming-cripto-calcolatore',
    component: 'TassazioneStakingFarmingCriptoCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Staking/Farming Criptovalute',
    description: 'Calcolatore Tassazione per Staking/Farming Criptovalute',
    hasContent: true,
  },

  {
    slug: 'tassazione-redditi-trading-calcolatore',
    component: 'TassazioneRedditiTradingCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Redditi da Trading Online (regime amministrato vs. dichiarativo)',
    description: 'Calcolatore Tassazione per Redditi da Trading Online (regime amministrato vs. dichiarativo)',
    hasContent: true,
  },

  {
    slug: 'tassazione-dividendi-esteri-calcolatore',
    component: 'TassazioneDividendiEsteriCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Redditi da Dividendi Esteri (con credito d\'imposta)',
    description: 'Calcolatore Tassazione per Redditi da Dividendi Esteri (con credito d\'imposta)',
    hasContent: true,
  },

  {
    slug: 'tassazione-interessi-esteri-calcolatore',
    component: 'TassazioneInteressiEsteriCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Redditi da Interessi Esteri (es. conti P2P)',
    description: 'Calcolatore Tassazione per Redditi da Interessi Esteri (es. conti P2P)',
    hasContent: true,
  },

  {
    slug: 'ivafe-calcolatore',
    component: 'IvafeCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore IVAFE (Imposta sul valore delle attività finanziarie detenute all\'estero)',
    description: 'Calcolatore IVAFE (Imposta sul valore delle attività finanziarie detenute all\'estero)',
    hasContent: true,
  },

  {
    slug: 'ivie-calcolatore',
    component: 'IvieCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore IVIE (Imposta sul valore degli immobili situati all\'estero)',
    description: 'Calcolatore IVIE (Imposta sul valore degli immobili situati all\'estero)',
    hasContent: true,
  },

  {
    slug: 'tassazione-lavoratori-domestici-calcolatore',
    component: 'TassazioneLavoratoriDomesticiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Lavoratori Domestici (Colf/Badanti)',
    description: 'Calcolatore Tassazione per Lavoratori Domestici (Colf/Badanti)',
    hasContent: true,
  },

  {
    slug: 'contributi-inps-lavoratori-domestici-calcolatore',
    component: 'ContributiInpsLavoratoriDomesticiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Contributi INPS per Lavoratori Domestici',
    description: 'Calcolatore Contributi INPS per Lavoratori Domestici',
    hasContent: true,
  },

  {
    slug: 'tassazione-lavoratori-agricoli-tempo-determinato-calcolatore',
    component: 'TassazioneLavoratoriAgricoliTempoDeterminatoCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Lavoratori Agricoli a Tempo Determinato',
    description: 'Calcolatore Tassazione per Lavoratori Agricoli a Tempo Determinato',
    hasContent: true,
  },

  {
    slug: 'tassazione-lavoratori-spettacolo-calcolatore',
    component: 'TassazioneLavoratoriSpettacoloCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Lavoratori dello Spettacolo (ex-ENPALS)',
    description: 'Calcolatore Tassazione per Lavoratori dello Spettacolo (ex-ENPALS)',
    hasContent: true,
  },

  {
    slug: 'tassazione-lavoratori-marittimi-calcolatore',
    component: 'TassazioneLavoratoriMarittimiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Lavoratori Marittimi',
    description: 'Calcolatore Tassazione per Lavoratori Marittimi',
    hasContent: true,
  },

  {
    slug: 'tassazione-lavoratori-edili-calcolatore',
    component: 'TassazioneLavoratoriEdiliCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Lavoratori Edili (con Cassa Edile)',
    description: 'Calcolatore Tassazione per Lavoratori Edili (con Cassa Edile)',
    hasContent: true,
  },

  {
    slug: 'tassazione-lavoratori-chiamata-calcolatore',
    component: 'TassazioneLavoratoriChiamataCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Lavoratori a Chiamata (Intermittenti)',
    description: 'Calcolatore Tassazione per Lavoratori a Chiamata (Intermittenti)',
    hasContent: true,
  },

  {
    slug: 'tassazione-stage-tirocinio-calcolatore',
    component: 'TassazioneStageTirocinioCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Stage/Tirocinio',
    description: 'Calcolatore Tassazione per Stage/Tirocinio',
    hasContent: true,
  },

  {
    slug: 'tassazione-borse-studio-dottorato-calcolatore',
    component: 'TassazioneBorseStudioDottoratoCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Borse di Studio/Dottorato',
    description: 'Calcolatore Tassazione per Borse di Studio/Dottorato',
    hasContent: true,
  },

  {
    slug: 'tassazione-premi-produttivita-calcolatore',
    component: 'TassazionePremiProduttivitaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Premi di Produttività (detassazione)',
    description: 'Calcolatore Tassazione per Premi di Produttività (detassazione)',
    hasContent: true,
  },

  {
    slug: 'tassazione-welfare-aziendale-calcolatore',
    component: 'TassazioneWelfareAziendaleCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Welfare Aziendale (fringe benefit)',
    description: 'Calcolatore Tassazione per Welfare Aziendale (fringe benefit)',
    hasContent: true,
  },

  {
    slug: 'tassazione-buoni-pasto-calcolatore',
    component: 'TassazioneBuoniPastoCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Buoni Pasto (elettronici vs. cartacei)',
    description: 'Calcolatore Tassazione per Buoni Pasto (elettronici vs. cartacei)',
    hasContent: true,
  },

  {
    slug: 'tassazione-indennita-trasferta-calcolatore',
    component: 'TassazioneIndennitaTrasfertaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Indennità di Trasferta (Italia/Estero)',
    description: 'Calcolatore Tassazione per Indennità di Trasferta (Italia/Estero)',
    hasContent: true,
  },

  {
    slug: 'tassazione-indennita-cassa-calcolatore',
    component: 'TassazioneIndennitaCassaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Indennità di Cassa/Maneggio Denaro',
    description: 'Calcolatore Tassazione per Indennità di Cassa/Maneggio Denaro',
    hasContent: true,
  },

  {
    slug: 'tassazione-indennita-volo-calcolatore',
    component: 'TassazioneIndennitaVoloCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Indennità di Volo/Navigazione',
    description: 'Calcolatore Tassazione per Indennità di Volo/Navigazione',
    hasContent: true,
  },

  {
    slug: 'tassazione-indennita-reperibilita-calcolatore',
    component: 'TassazioneIndennitaReperibilitaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Indennità di Reperibilità',
    description: 'Calcolatore Tassazione per Indennità di Reperibilità',
    hasContent: true,
  },

  {
    slug: 'tassazione-lavoro-notturno-festivo-calcolatore',
    component: 'TassazioneLavoroNotturnoFestivoCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Lavoro Notturno/Festivo',
    description: 'Calcolatore Tassazione per Lavoro Notturno/Festivo',
    hasContent: true,
  },

  {
    slug: 'tassazione-straordinari-calcolatore',
    component: 'TassazioneStraordinariCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Straordinari',
    description: 'Calcolatore Tassazione per Straordinari',
    hasContent: true,
  },

  {
    slug: 'tassazione-tfr-calcolatore',
    component: 'TassazioneTfrCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per TFR (Trattamento di Fine Rapporto)',
    description: 'Calcolatore Tassazione per TFR (Trattamento di Fine Rapporto)',
    hasContent: true,
  },

  {
    slug: 'tassazione-naspi-calcolatore',
    component: 'TassazioneNaspiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per NASpI (Indennità di Disoccupazione)',
    description: 'Calcolatore Tassazione per NASpI (Indennità di Disoccupazione)',
    hasContent: true,
  },

  {
    slug: 'tassazione-cassa-integrazione-calcolatore',
    component: 'TassazioneCassaIntegrazioneCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Cassa Integrazione (CIG)',
    description: 'Calcolatore Tassazione per Cassa Integrazione (CIG)',
    hasContent: true,
  },

  {
    slug: 'tassazione-pensione-vecchiaia-calcolatore',
    component: 'TassazionePensioneVecchiaiaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Pensione di Vecchiaia/Anticipata',
    description: 'Calcolatore Tassazione per Pensione di Vecchiaia/Anticipata',
    hasContent: true,
  },

  {
    slug: 'tassazione-pensione-invalidita-calcolatore',
    component: 'TassazionePensioneInvaliditaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Pensione di Invalidità/Inabilità',
    description: 'Calcolatore Tassazione per Pensione di Invalidità/Inabilità',
    hasContent: true,
  },

  {
    slug: 'tassazione-pensione-reversibilita-calcolatore',
    component: 'TassazionePensioneReversibilitaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Pensione di Reversibilità',
    description: 'Calcolatore Tassazione per Pensione di Reversibilità',
    hasContent: true,
  },

  {
    slug: 'tassazione-assegno-sociale-calcolatore',
    component: 'TassazioneAssegnoSocialeCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Assegno Sociale',
    description: 'Calcolatore Tassazione per Assegno Sociale',
    hasContent: true,
  },

  {
    slug: 'tassazione-rendite-inail-calcolatore',
    component: 'TassazioneRenditeInailCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Rendite INAIL',
    description: 'Calcolatore Tassazione per Rendite INAIL',
    hasContent: true,
  },

  {
    slug: 'tassazione-indennita-accompagnamento-calcolatore',
    component: 'TassazioneIndennitaAccompagnamentoCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Indennità di Accompagnamento',
    description: 'Calcolatore Tassazione per Indennità di Accompagnamento',
    hasContent: true,
  },

  {
    slug: 'tassazione-fabbricati-non-locati-calcolatore',
    component: 'TassazioneFabbricatiNonLocatiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Redditi da Fabbricati (non locati)',
    description: 'Calcolatore Tassazione per Redditi da Fabbricati (non locati)',
    hasContent: true,
  },

  {
    slug: 'tassazione-redditi-diversi-calcolatore',
    component: 'TassazioneRedditiDiversiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Redditi Diversi (es. vincite)',
    description: 'Calcolatore Tassazione per Redditi Diversi (es. vincite)',
    hasContent: true,
  },

  {
    slug: 'tassazione-royalties-brevetti-calcolatore',
    component: 'TassazioneRoyaltiesBrevettiCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Royalties e Brevetti',
    description: 'Calcolatore Tassazione per Royalties e Brevetti',
    hasContent: true,
  },

  {
    slug: 'tassazione-asd-calcolatore',
    component: 'TassazioneAsdCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Associazioni Sportive Dilettantistiche (ASD)',
    description: 'Calcolatore Tassazione per Associazioni Sportive Dilettantistiche (ASD)',
    hasContent: true,
  },

  {
    slug: 'tassazione-ets-calcolatore',
    component: 'TassazioneEtsCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Enti del Terzo Settore (ETS)',
    description: 'Calcolatore Tassazione per Enti del Terzo Settore (ETS)',
    hasContent: true,
  },

  {
    slug: 'tassazione-societa-semplice-calcolatore',
    component: 'TassazioneSocietaSempliceCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Società Semplice (SS)',
    description: 'Calcolatore Tassazione per Società Semplice (SS)',
    hasContent: true,
  },

  {
    slug: 'tassazione-snc-calcolatore',
    component: 'TassazioneSncCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Società in Nome Collettivo (SNC)',
    description: 'Calcolatore Tassazione per Società in Nome Collettivo (SNC)',
    hasContent: true,
  },

  {
    slug: 'tassazione-sas-calcolatore',
    component: 'TassazioneSasCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Società in Accomandita Semplice (SAS)',
    description: 'Calcolatore Tassazione per Società in Accomandita Semplice (SAS)',
    hasContent: true,
  },

  {
    slug: 'tassazione-srl-calcolatore',
    component: 'TassazioneSrlCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Società a Responsabilità Limitata (SRL) - Trasparenza vs. Ordinario',
    description: 'Calcolatore Tassazione per Società a Responsabilità Limitata (SRL) - Trasparenza vs. Ordinario',
    hasContent: true,
  },

  {
    slug: 'tassazione-dividendi-srl-calcolatore',
    component: 'TassazioneDividendiSrlCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Dividendi da SRL',
    description: 'Calcolatore Tassazione per Dividendi da SRL',
    hasContent: true,
  },

  {
    slug: 'tassazione-finanziamento-soci-calcolatore',
    component: 'TassazioneFinanziamentoSociCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Finanziamento Soci',
    description: 'Calcolatore Tassazione per Finanziamento Soci',
    hasContent: true,
  },

  {
    slug: 'tassazione-cessione-quote-calcolatore',
    component: 'TassazioneCessioneQuoteCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Cessione di Quote Sociali',
    description: 'Calcolatore Tassazione per Cessione di Quote Sociali',
    hasContent: true,
  },

  {
    slug: 'tassazione-startup-innovative-calcolatore',
    component: 'TassazioneStartupInnovativeCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per Startup Innovative (agevolazioni)',
    description: 'Calcolatore Tassazione per Startup Innovative (agevolazioni)',
    hasContent: true,
  },

  {
    slug: 'tassazione-pmi-innovative-calcolatore',
    component: 'TassazionePmiInnovativeCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Tassazione per PMI Innovative (agevolazioni)',
    description: 'Calcolatore Tassazione per PMI Innovative (agevolazioni)',
    hasContent: true,
  },

  {
    slug: 'credito-imposta-rs-calcolatore',
    component: 'CreditoImpostaRsCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Credito d\'Imposta per Ricerca e Sviluppo',
    description: 'Calcolatore Credito d\'Imposta per Ricerca e Sviluppo',
    hasContent: true,
  },

  {
    slug: 'credito-imposta-formazione-40-calcolatore',
    component: 'CreditoImpostaFormazione40Calcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Credito d\'Imposta per Formazione 4.0',
    description: 'Calcolatore Credito d\'Imposta per Formazione 4.0',
    hasContent: true,
  },

  {
    slug: 'credito-imposta-pubblicita-calcolatore',
    component: 'CreditoImpostaPubblicitaCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Credito d\'Imposta per Pubblicità',
    description: 'Calcolatore Credito d\'Imposta per Pubblicità',
    hasContent: true,
  },

  {
    slug: 'patent-box-calcolatore',
    component: 'PatentBoxCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Patent Box',
    description: 'Calcolatore Patent Box',
    hasContent: true,
  },

  {
    slug: 'ace-calcolatore',
    component: 'AceCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore ACE (Aiuto alla Crescita Economica)',
    description: 'Calcolatore ACE (Aiuto alla Crescita Economica)',
    hasContent: true,
  },

  {
    slug: 'superammortamento-iperammortamento-calcolatore',
    component: 'SuperammortamentoIperammortamentoCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Superammortamento e Iperammortamento (storico)',
    description: 'Calcolatore Superammortamento e Iperammortamento (storico)',
    hasContent: true,
  },

  {
    slug: 'sabatini-calcolatore',
    component: 'SabatiniCalcolatore',
    category: 'fisco-e-lavoro-autonomo',
    lang: 'it',
    title: 'Calcolatore Sabatini (contributo in conto impianti)',
    description: 'Calcolatore Sabatini (contributo in conto impianti)',
    hasContent: true,
  },

  {
    slug: 'bonus-verde-calcolatore',
    component: 'BonusVerdeCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Bonus Verde (detrazione 36%)',
    description: 'Calcolatore Bonus Verde (detrazione 36%)',
    hasContent: true,
  },

  {
    slug: 'bonus-facciate-calcolatore',
    component: 'BonusFacciateCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Bonus Facciate (storico, 90%)',
    description: 'Calcolatore Bonus Facciate (storico, 90%)',
    hasContent: true,
  },

  {
    slug: 'sismabonus-calcolatore',
    component: 'SismabonusCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Sismabonus (detrazioni varie)',
    description: 'Calcolatore Sismabonus (detrazioni varie)',
    hasContent: true,
  },

  {
    slug: 'bonus-barriere-architettoniche-calcolatore',
    component: 'BonusBarriereArchitettonicheCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Bonus Barriere Architettoniche (75%)',
    description: 'Calcolatore Bonus Barriere Architettoniche (75%)',
    hasContent: true,
  },

  {
    slug: 'bonus-acqua-potabile-calcolatore',
    component: 'BonusAcquaPotabileCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Bonus Acqua Potabile',
    description: 'Calcolatore Bonus Acqua Potabile',
    hasContent: true,
  },

  {
    slug: 'detrazione-iva-casa-green-calcolatore',
    component: 'DetrazioneIvaCasaGreenCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Detrazione IVA per Acquisto Casa Green',
    description: 'Calcolatore Detrazione IVA per Acquisto Casa Green',
    hasContent: true,
  },

  {
    slug: 'tassazione-nuda-proprieta-usufrutto-calcolatore',
    component: 'TassazioneNudaProprietaUsufruttoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione Nuda Proprietà vs. Usufrutto',
    description: 'Calcolatore Tassazione Nuda Proprietà vs. Usufrutto',
    hasContent: true,
  },

  {
    slug: 'valore-usufrutto-nuda-proprieta-calcolatore',
    component: 'ValoreUsufruttoNudaProprietaCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Valore Usufrutto vs. Nuda Proprietà',
    description: 'Calcolatore Valore Usufrutto vs. Nuda Proprietà',
    hasContent: true,
  },

  {
    slug: 'tassazione-comodato-uso-calcolatore',
    component: 'TassazioneComodatoUsoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione Comodato d\'Uso Gratuito',
    description: 'Calcolatore Tassazione Comodato d\'Uso Gratuito',
    hasContent: true,
  },

  {
    slug: 'tassazione-affitto-con-riscatto-calcolatore',
    component: 'TassazioneAffittoConRiscattoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione Affitto con Riscatto',
    description: 'Calcolatore Tassazione Affitto con Riscatto',
    hasContent: true,
  },

  {
    slug: 'tassazione-sublocazione-calcolatore',
    component: 'TassazioneSublocazioneCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione per Sublocazione',
    description: 'Calcolatore Tassazione per Sublocazione',
    hasContent: true,
  },

  {
    slug: 'tassazione-cessione-contratto-locazione-calcolatore',
    component: 'TassazioneCessioneContrattoLocazioneCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione per Cessione di Contratto di Locazione',
    description: 'Calcolatore Tassazione per Cessione di Contratto di Locazione',
    hasContent: true,
  },

  {
    slug: 'tassazione-risoluzione-contratto-locazione-calcolatore',
    component: 'TassazioneRisoluzioneContrattoLocazioneCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione per Risoluzione Anticipata Contratto di Locazione',
    description: 'Calcolatore Tassazione per Risoluzione Anticipata Contratto di Locazione',
    hasContent: true,
  },

  {
    slug: 'imposta-registro-locazioni-calcolatore',
    component: 'ImpostaRegistroLocazioniCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Imposta di Registro per Contratti di Locazione',
    description: 'Calcolatore Imposta di Registro per Contratti di Locazione',
    hasContent: true,
  },

  {
    slug: 'aggiornamento-istat-locazioni-commerciali-calcolatore',
    component: 'AggiornamentoIstatLocazioniCommercialiCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Aggiornamento ISTAT per Locazioni Commerciali',
    description: 'Calcolatore Aggiornamento ISTAT per Locazioni Commerciali',
    hasContent: true,
  },

  {
    slug: 'spese-straordinarie-condominio-calcolatore',
    component: 'SpeseStraordinarieCondominioCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Spese Straordinarie Condominio (ripartizione proprietario/inquilino)',
    description: 'Calcolatore Spese Straordinarie Condominio (ripartizione proprietario/inquilino)',
    hasContent: true,
  },

  {
    slug: 'costo-allaccio-utenze-calcolatore',
    component: 'CostoAllaccioUtenzeCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Allaccio Utenze (acqua, luce, gas)',
    description: 'Calcolatore Costo Allaccio Utenze (acqua, luce, gas)',
    hasContent: true,
  },

  {
    slug: 'voltura-subentro-utenze-calcolatore',
    component: 'VolturaSubentroUtenzeCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Voltura vs. Subentro Utenze',
    description: 'Calcolatore Voltura vs. Subentro Utenze',
    hasContent: true,
  },

  {
    slug: 'costo-certificazione-energetica-ape-calcolatore',
    component: 'CostoCertificazioneEnergeticaApeCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Certificazione Energetica (APE)',
    description: 'Calcolatore Costo Certificazione Energetica (APE)',
    hasContent: true,
  },

  {
    slug: 'costo-conformita-impianti-calcolatore',
    component: 'CostoConformitaImpiantiCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Conformità Impianti (elettrico, gas)',
    description: 'Calcolatore Costo Conformità Impianti (elettrico, gas)',
    hasContent: true,
  },

  {
    slug: 'costo-pratica-cila-scia-calcolatore',
    component: 'CostoPraticaCilaSciaCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Pratica CILA/SCIA per ristrutturazione',
    description: 'Calcolatore Costo Pratica CILA/SCIA per ristrutturazione',
    hasContent: true,
  },

  {
    slug: 'oneri-urbanizzazione-calcolatore',
    component: 'OneriUrbanizzazioneCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Oneri di Urbanizzazione per Nuova Costruzione',
    description: 'Calcolatore Oneri di Urbanizzazione per Nuova Costruzione',
    hasContent: true,
  },

  {
    slug: 'costo-sanatoria-edilizia-calcolatore',
    component: 'CostoSanatoriaEdiliziaCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Sanatoria Edilizia',
    description: 'Calcolatore Costo Sanatoria Edilizia',
    hasContent: true,
  },

  {
    slug: 'tassazione-frazionamento-immobiliare-calcolatore',
    component: 'TassazioneFrazionamentoImmobiliareCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione per Frazionamento Immobiliare',
    description: 'Calcolatore Tassazione per Frazionamento Immobiliare',
    hasContent: true,
  },

  {
    slug: 'tassazione-cambio-destinazione-uso-calcolatore',
    component: 'TassazioneCambioDestinazioneUsoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione per Cambio di Destinazione d\'Uso',
    description: 'Calcolatore Tassazione per Cambio di Destinazione d\'Uso',
    hasContent: true,
  },

  {
    slug: 'tassazione-terreni-agricoli-calcolatore',
    component: 'TassazioneTerreniAgricoliCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione per Terreni Agricoli',
    description: 'Calcolatore Tassazione per Terreni Agricoli',
    hasContent: true,
  },

  {
    slug: 'prelazione-agraria-calcolatore',
    component: 'PrelazioneAgrariaCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Diritto di Prelazione Agraria',
    description: 'Calcolatore Diritto di Prelazione Agraria',
    hasContent: true,
  },

  {
    slug: 'tassazione-esproprio-calcolatore',
    component: 'TassazioneEsproprioCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Tassazione per Esproprio per Pubblica Utilità',
    description: 'Calcolatore Tassazione per Esproprio per Pubblica Utilità',
    hasContent: true,
  },

  {
    slug: 'indennita-occupazione-senza-titolo-calcolatore',
    component: 'IndennitaOccupazioneSenzaTitoloCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Indennità di Occupazione Senza Titolo',
    description: 'Calcolatore Indennità di Occupazione Senza Titolo',
    hasContent: true,
  },

  {
    slug: 'canone-rai-calcolatore',
    component: 'CanoneRaiCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Canone RAI (storico, in bolletta)',
    description: 'Calcolatore Canone RAI (storico, in bolletta)',
    hasContent: true,
  },

  {
    slug: 'bonus-elettrodomestici-calcolatore',
    component: 'BonusElettrodomesticiCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Bonus Elettrodomestici',
    description: 'Calcolatore Bonus Elettrodomestici',
    hasContent: true,
  },

  {
    slug: 'bonus-condizionatori-calcolatore',
    component: 'BonusCondizionatoriCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Bonus Condizionatori',
    description: 'Calcolatore Bonus Condizionatori',
    hasContent: true,
  },

  {
    slug: 'bonus-zanzariere-calcolatore',
    component: 'BonusZanzariereCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Bonus Zanzariere',
    description: 'Calcolatore Bonus Zanzariere',
    hasContent: true,
  },

  {
    slug: 'bonus-tende-sole-calcolatore',
    component: 'BonusTendeSoleCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Bonus Tende da Sole',
    description: 'Calcolatore Bonus Tende da Sole',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-casa-calcolatore',
    component: 'CostoAssicurazioneCasaCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione Casa (incendio, scoppio, furto)',
    description: 'Calcolatore Costo Assicurazione Casa (incendio, scoppio, furto)',
    hasContent: true,
  },

  {
    slug: 'costo-sistema-allarme-calcolatore',
    component: 'CostoSistemaAllarmeCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Sistema di Allarme',
    description: 'Calcolatore Costo Sistema di Allarme',
    hasContent: true,
  },

  {
    slug: 'costo-manutenzione-caldaia-calcolatore',
    component: 'CostoManutenzioneCaldaiaCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Manutenzione Caldaia',
    description: 'Calcolatore Costo Manutenzione Caldaia',
    hasContent: true,
  },

  {
    slug: 'costo-manutenzione-condizionatore-calcolatore',
    component: 'CostoManutenzioneCondizionatoreCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Manutenzione Condizionatore',
    description: 'Calcolatore Costo Manutenzione Condizionatore',
    hasContent: true,
  },

  {
    slug: 'costo-smaltimento-amianto-calcolatore',
    component: 'CostoSmaltimentoAmiantoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Smaltimento Amianto',
    description: 'Calcolatore Costo Smaltimento Amianto',
    hasContent: true,
  },

  {
    slug: 'costo-realizzazione-piscina-calcolatore',
    component: 'CostoRealizzazionePiscinaCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Piscina',
    description: 'Calcolatore Costo Realizzazione Piscina',
    hasContent: true,
  },

  {
    slug: 'costo-realizzazione-giardino-calcolatore',
    component: 'CostoRealizzazioneGiardinoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Giardino',
    description: 'Calcolatore Costo Realizzazione Giardino',
    hasContent: true,
  },

  {
    slug: 'costo-impianto-irrigazione-calcolatore',
    component: 'CostoImpiantoIrrigazioneCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Impianto di Irrigazione',
    description: 'Calcolatore Costo Realizzazione Impianto di Irrigazione',
    hasContent: true,
  },

  {
    slug: 'costo-pozzo-artesiano-calcolatore',
    component: 'CostoPozzoArtesianoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Pozzo Artesiano',
    description: 'Calcolatore Costo Realizzazione Pozzo Artesiano',
    hasContent: true,
  },

  {
    slug: 'costo-recinzione-calcolatore',
    component: 'CostoRecinzioneCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Recinzione',
    description: 'Calcolatore Costo Realizzazione Recinzione',
    hasContent: true,
  },

  {
    slug: 'costo-tettoia-pergolato-calcolatore',
    component: 'CostoTettoiaPergolatoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Tettoia/Pergolato',
    description: 'Calcolatore Costo Realizzazione Tettoia/Pergolato',
    hasContent: true,
  },

  {
    slug: 'costo-soppalco-calcolatore',
    component: 'CostoSoppalcoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Soppalco',
    description: 'Calcolatore Costo Realizzazione Soppalco',
    hasContent: true,
  },

  {
    slug: 'costo-camino-stufa-pellet-calcolatore',
    component: 'CostoCaminoStufaPelletCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Camino/Stufa a Pellet',
    description: 'Calcolatore Costo Realizzazione Camino/Stufa a Pellet',
    hasContent: true,
  },

  {
    slug: 'costo-sauna-bagno-turco-calcolatore',
    component: 'CostoSaunaBagnoTurcoCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Sauna/Bagno Turco',
    description: 'Calcolatore Costo Realizzazione Sauna/Bagno Turco',
    hasContent: true,
  },

  {
    slug: 'costo-campo-tennis-padel-calcolatore',
    component: 'CostoCampoTennisPadelCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Campo da Tennis/Padel',
    description: 'Calcolatore Costo Realizzazione Campo da Tennis/Padel',
    hasContent: true,
  },

  {
    slug: 'costo-home-cinema-calcolatore',
    component: 'CostoHomeCinemaCalcolatore',
    category: 'immobiliare-e-casa',
    lang: 'it',
    title: 'Calcolatore Costo Realizzazione Home Cinema',
    description: 'Calcolatore Costo Realizzazione Home Cinema',
    hasContent: true,
  },

  {
    slug: 'pir-calcolatore',
    component: 'PirCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore PIR (Piani Individuali di Risparmio) - Vantaggi Fiscali',
    description: 'Calcolatore PIR (Piani Individuali di Risparmio) - Vantaggi Fiscali',
    hasContent: true,
  },

  {
    slug: 'tassazione-interessi-conti-esteri-calcolatore',
    component: 'TassazioneInteressiContiEsteriCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Interessi da Conti Correnti Esteri (con monitoraggio fiscale)',
    description: 'Calcolatore Tassazione per Interessi da Conti Correnti Esteri (con monitoraggio fiscale)',
    hasContent: true,
  },

  {
    slug: 'tassazione-polizze-estere-calcolatore',
    component: 'TassazionePolizzeEstereCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Polizze Assicurative Estere (IVAFE)',
    description: 'Calcolatore Tassazione per Polizze Assicurative Estere (IVAFE)',
    hasContent: true,
  },

  {
    slug: 'tassazione-trust-calcolatore',
    component: 'TassazioneTrustCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Trust',
    description: 'Calcolatore Tassazione per Trust',
    hasContent: true,
  },

  {
    slug: 'tassazione-fondi-immobiliari-calcolatore',
    component: 'TassazioneFondiImmobiliariCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Fondi Immobiliari',
    description: 'Calcolatore Tassazione per Fondi Immobiliari',
    hasContent: true,
  },

  {
    slug: 'tassazione-private-equity-calcolatore',
    component: 'TassazionePrivateEquityCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Private Equity/Venture Capital',
    description: 'Calcolatore Tassazione per Private Equity/Venture Capital',
    hasContent: true,
  },

  {
    slug: 'tassazione-social-lending-calcolatore',
    component: 'TassazioneSocialLendingCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Social Lending',
    description: 'Calcolatore Tassazione per Social Lending',
    hasContent: true,
  },

  {
    slug: 'tassazione-opzioni-futures-calcolatore',
    component: 'TassazioneOpzioniFuturesCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Opzioni e Futures',
    description: 'Calcolatore Tassazione per Opzioni e Futures',
    hasContent: true,
  },

  {
    slug: 'tassazione-cfd-calcolatore',
    component: 'TassazioneCfdCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per CFD (Contracts for Difference)',
    description: 'Calcolatore Tassazione per CFD (Contracts for Difference)',
    hasContent: true,
  },

  {
    slug: 'tassazione-forex-trading-calcolatore',
    component: 'TassazioneForexTradingCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Forex Trading',
    description: 'Calcolatore Tassazione per Forex Trading',
    hasContent: true,
  },

  {
    slug: 'tassazione-oro-fisico-calcolatore',
    component: 'TassazioneOroFisicoCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Oro Fisico da Investimento',
    description: 'Calcolatore Tassazione per Oro Fisico da Investimento',
    hasContent: true,
  },

  {
    slug: 'tassazione-metalli-preziosi-calcolatore',
    component: 'TassazioneMetalliPreziosiCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Metalli Preziosi (diversi dall\'oro)',
    description: 'Calcolatore Tassazione per Metalli Preziosi (diversi dall\'oro)',
    hasContent: true,
  },

  {
    slug: 'tassazione-opere-arte-calcolatore',
    component: 'TassazioneOpereArteCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Opere d\'Arte e Collezionismo',
    description: 'Calcolatore Tassazione per Opere d\'Arte e Collezionismo',
    hasContent: true,
  },

  {
    slug: 'tassazione-vini-pregiati-calcolatore',
    component: 'TassazioneViniPregiatiCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Vini Pregiati da Investimento',
    description: 'Calcolatore Tassazione per Vini Pregiati da Investimento',
    hasContent: true,
  },

  {
    slug: 'tassazione-orologi-lusso-calcolatore',
    component: 'TassazioneOrologiLussoCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Orologi di Lusso da Investimento',
    description: 'Calcolatore Tassazione per Orologi di Lusso da Investimento',
    hasContent: true,
  },

  {
    slug: 'tassazione-auto-epoca-calcolatore',
    component: 'TassazioneAutoEpocaCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Auto d\'Epoca da Investimento',
    description: 'Calcolatore Tassazione per Auto d\'Epoca da Investimento',
    hasContent: true,
  },

  {
    slug: 'tassazione-francobolli-monete-calcolatore',
    component: 'TassazioneFrancobolliMoneteCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tassazione per Francobolli/Monete da Collezione',
    description: 'Calcolatore Tassazione per Francobolli/Monete da Collezione',
    hasContent: true,
  },

  {
    slug: 'rendimento-netto-affitto-garage-calcolatore',
    component: 'RendimentoNettoAffittoGarageCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Rendimento Netto da Affitto di Garage/Posto Auto',
    description: 'Calcolatore Rendimento Netto da Affitto di Garage/Posto Auto',
    hasContent: true,
  },

  {
    slug: 'rendimento-netto-affitto-terreno-calcolatore',
    component: 'RendimentoNettoAffittoTerrenoCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Rendimento Netto da Affitto di Terreno Agricolo',
    description: 'Calcolatore Rendimento Netto da Affitto di Terreno Agricolo',
    hasContent: true,
  },

  {
    slug: 'rendimento-netto-affitto-locale-commerciale-calcolatore',
    component: 'RendimentoNettoAffittoLocaleCommercialeCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Rendimento Netto da Affitto di Locale Commerciale',
    description: 'Calcolatore Rendimento Netto da Affitto di Locale Commerciale',
    hasContent: true,
  },

  {
    slug: 'costo-robo-advisor-calcolatore',
    component: 'CostoRoboAdvisorCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Costo di un Robo-Advisor',
    description: 'Calcolatore Costo di un Robo-Advisor',
    hasContent: true,
  },

  {
    slug: 'costo-family-office-calcolatore',
    component: 'CostoFamilyOfficeCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Costo di un Family Office',
    description: 'Calcolatore Costo di un Family Office',
    hasContent: true,
  },

  {
    slug: 'inflazione-personale-calcolatore',
    component: 'InflazionePersonaleCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Inflazione Personale (basato sulle proprie spese)',
    description: 'Calcolatore Inflazione Personale (basato sulle proprie spese)',
    hasContent: true,
  },

  {
    slug: 'obiettivo-fire-italia-calcolatore',
    component: 'ObiettivoFireItaliaCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Obiettivo FIRE (Financial Independence, Retire Early) in Italia',
    description: 'Calcolatore Obiettivo FIRE (Financial Independence, Retire Early) in Italia',
    hasContent: true,
  },

  {
    slug: 'regola-4-pensione-calcolatore',
    component: 'Regola4PensioneCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Regola del 4% per il Ritiro dal Capitale in Pensione',
    description: 'Calcolatore Regola del 4% per il Ritiro dal Capitale in Pensione',
    hasContent: true,
  },

  {
    slug: 'quota-risparmio-mensile-calcolatore',
    component: 'QuotaRisparmioMensileCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Quota di Risparmio Mensile per Obiettivo',
    description: 'Calcolatore Quota di Risparmio Mensile per Obiettivo',
    hasContent: true,
  },

  {
    slug: 'costo-opportunita-spesa-calcolatore',
    component: 'CostoOpportunitaSpesaCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Costo Opportunità di una Spesa',
    description: 'Calcolatore Costo Opportunità di una Spesa',
    hasContent: true,
  },

  {
    slug: 'valore-futuro-risparmio-calcolatore',
    component: 'ValoreFuturoRisparmioCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Valore Futuro di un Risparmio Periodico',
    description: 'Calcolatore Valore Futuro di un Risparmio Periodico',
    hasContent: true,
  },

  {
    slug: 'valore-attuale-rendita-calcolatore',
    component: 'ValoreAttualeRenditaCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Valore Attuale di una Rendita Futura',
    description: 'Calcolatore Valore Attuale di una Rendita Futura',
    hasContent: true,
  },

  {
    slug: 'tasso-interesse-reale-calcolatore',
    component: 'TassoInteresseRealeCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Tasso di Interesse Reale (nominale - inflazione)',
    description: 'Calcolatore Tasso di Interesse Reale (nominale - inflazione)',
    hasContent: true,
  },

  {
    slug: 'diversificazione-portafoglio-calcolatore',
    component: 'DiversificazionePortafoglioCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Diversificazione di Portafoglio (Asset Allocation)',
    description: 'Calcolatore Diversificazione di Portafoglio (Asset Allocation)',
    hasContent: true,
  },

  {
    slug: 'ribilanciamento-portafoglio-calcolatore',
    component: 'RibilanciamentoPortafoglioCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Ribilanciamento di Portafoglio',
    description: 'Calcolatore Ribilanciamento di Portafoglio',
    hasContent: true,
  },

  {
    slug: 'sharpe-ratio-portafoglio-calcolatore',
    component: 'SharpeRatioPortafoglioCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Sharpe Ratio di un Portafoglio',
    description: 'Calcolatore Sharpe Ratio di un Portafoglio',
    hasContent: true,
  },

  {
    slug: 'sortino-ratio-portafoglio-calcolatore',
    component: 'SortinoRatioPortafoglioCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Sortino Ratio di un Portafoglio',
    description: 'Calcolatore Sortino Ratio di un Portafoglio',
    hasContent: true,
  },

  {
    slug: 'drawdown-massimo-calcolatore',
    component: 'DrawdownMassimoCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Drawdown Massimo di un Investimento',
    description: 'Calcolatore Drawdown Massimo di un Investimento',
    hasContent: true,
  },

  {
    slug: 'volatilita-portafoglio-calcolatore',
    component: 'VolatilitaPortafoglioCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Volatilità di un Titolo/Portafoglio',
    description: 'Calcolatore Volatilità di un Titolo/Portafoglio',
    hasContent: true,
  },

  {
    slug: 'correlazione-asset-calcolatore',
    component: 'CorrelazioneAssetCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Correlazione tra Asset Finanziari',
    description: 'Calcolatore Correlazione tra Asset Finanziari',
    hasContent: true,
  },

  {
    slug: 'beta-azione-calcolatore',
    component: 'BetaAzioneCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Beta di un\'Azione',
    description: 'Calcolatore Beta di un\'Azione',
    hasContent: true,
  },

  {
    slug: 'alpha-fondo-calcolatore',
    component: 'AlphaFondoCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Alpha di un Fondo di Investimento',
    description: 'Calcolatore Alpha di un Fondo di Investimento',
    hasContent: true,
  }
,

  // Additional calculators from TSV (701-1100)
  {
    slug: 'valore-intrinseco-azione-calcolatore',
    component: 'ValoreIntrinsecoAzioneCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Valore Intrinseco di un\'Azione (DCF semplificato)',
    description: 'Calcolatore Valore Intrinseco di un\'Azione (DCF semplificato)',
    hasContent: true,
  },

  {
    slug: 'pe-ratio-calcolatore',
    component: 'PeRatioCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore P/E Ratio (Price/Earnings)',
    description: 'Calcolatore P/E Ratio (Price/Earnings)',
    hasContent: true,
  },

  {
    slug: 'pb-ratio-calcolatore',
    component: 'PbRatioCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore P/B Ratio (Price/Book)',
    description: 'Calcolatore P/B Ratio (Price/Book)',
    hasContent: true,
  },

  {
    slug: 'dividend-yield-calcolatore',
    component: 'DividendYieldCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Dividend Yield',
    description: 'Calcolatore Dividend Yield',
    hasContent: true,
  },

  {
    slug: 'eps-calcolatore',
    component: 'EpsCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore EPS (Earnings Per Share)',
    description: 'Calcolatore EPS (Earnings Per Share)',
    hasContent: true,
  },

  {
    slug: 'roe-calcolatore',
    component: 'RoeCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore ROE (Return on Equity)',
    description: 'Calcolatore ROE (Return on Equity)',
    hasContent: true,
  },

  {
    slug: 'roi-calcolatore',
    component: 'RoiCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore ROI (Return on Investment)',
    description: 'Calcolatore ROI (Return on Investment)',
    hasContent: true,
  },

  {
    slug: 'roa-calcolatore',
    component: 'RoaCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore ROA (Return on Assets)',
    description: 'Calcolatore ROA (Return on Assets)',
    hasContent: true,
  },

  {
    slug: 'wacc-calcolatore',
    component: 'WaccCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore WACC (Weighted Average Cost of Capital)',
    description: 'Calcolatore WACC (Weighted Average Cost of Capital)',
    hasContent: true,
  },

  {
    slug: 'capm-calcolatore',
    component: 'CapmCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore CAPM (Capital Asset Pricing Model)',
    description: 'Calcolatore CAPM (Capital Asset Pricing Model)',
    hasContent: true,
  },

  {
    slug: 'valore-obbligazione-calcolatore',
    component: 'ValoreObbligazioneCalcolatore',
    category: 'risparmio-e-investimenti',
    lang: 'it',
    title: 'Calcolatore Valore di un\'Obbligazione (Bond)',
    description: 'Calcolatore Valore di un\'Obbligazione (Bond)',
    hasContent: true,
  },

  {
    slug: 'ecobonus-auto-calcolatore',
    component: 'EcobonusAutoCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Ecobonus/Incentivi Auto per Regione',
    description: 'Calcolatore Ecobonus/Incentivi Auto per Regione',
    hasContent: true,
  },

  {
    slug: 'costo-impianto-gpl-metano-calcolatore',
    component: 'CostoImpiantoGplMetanoCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Installazione Impianto GPL/Metano',
    description: 'Calcolatore Costo Installazione Impianto GPL/Metano',
    hasContent: true,
  },

  {
    slug: 'ammortamento-impianto-gpl-metano-calcolatore',
    component: 'AmmortamentoImpiantoGplMetanoCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Ammortamento Impianto GPL/Metano',
    description: 'Calcolatore Ammortamento Impianto GPL/Metano',
    hasContent: true,
  },

  {
    slug: 'convenienza-carburanti-calcolatore',
    component: 'ConvenienzaCarburantiCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Convenienza Diesel vs. Benzina vs. GPL vs. Metano vs. Ibrido vs. Elettrico',
    description: 'Calcolatore Convenienza Diesel vs. Benzina vs. GPL vs. Metano vs. Ibrido vs. Elettrico',
    hasContent: true,
  },

  {
    slug: 'costo-ricarica-auto-elettrica-calcolatore',
    component: 'CostoRicaricaAutoElettricaCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Ricarica Auto Elettrica (domestica vs. colonnina pubblica)',
    description: 'Calcolatore Costo Ricarica Auto Elettrica (domestica vs. colonnina pubblica)',
    hasContent: true,
  },

  {
    slug: 'costo-installazione-wallbox-calcolatore',
    component: 'CostoInstallazioneWallboxCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Installazione Wallbox Domestica',
    description: 'Calcolatore Costo Installazione Wallbox Domestica',
    hasContent: true,
  },

  {
    slug: 'tassazione-auto-aziendale-calcolatore',
    component: 'TassazioneAutoAziendaleCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Tassazione Auto Aziendale in Uso Promiscuo (Fringe Benefit)',
    description: 'Calcolatore Tassazione Auto Aziendale in Uso Promiscuo (Fringe Benefit)',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-rca-calcolatore',
    component: 'CostoAssicurazioneRcaCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione RCA per Classe di Merito',
    description: 'Calcolatore Costo Assicurazione RCA per Classe di Merito',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-furto-incendio-calcolatore',
    component: 'CostoAssicurazioneFurtoIncendioCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione Furto e Incendio',
    description: 'Calcolatore Costo Assicurazione Furto e Incendio',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-kasko-calcolatore',
    component: 'CostoAssicurazioneKaskoCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione Kasko',
    description: 'Calcolatore Costo Assicurazione Kasko',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-eventi-calcolatore',
    component: 'CostoAssicurazioneEventiCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione Eventi Atmosferici/Atti Vandalici',
    description: 'Calcolatore Costo Assicurazione Eventi Atmosferici/Atti Vandalici',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-cristalli-calcolatore',
    component: 'CostoAssicurazioneCristalliCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione Cristalli',
    description: 'Calcolatore Costo Assicurazione Cristalli',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-assistenza-stradale-calcolatore',
    component: 'CostoAssicurazioneAssistenzaStradaleCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione Assistenza Stradale',
    description: 'Calcolatore Costo Assicurazione Assistenza Stradale',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-tutela-legale-calcolatore',
    component: 'CostoAssicurazioneTutelaLegaleCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione Tutela Legale',
    description: 'Calcolatore Costo Assicurazione Tutela Legale',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-infortuni-conducente-calcolatore',
    component: 'CostoAssicurazioneInfortuniConducenteCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione Infortuni del Conducente',
    description: 'Calcolatore Costo Assicurazione Infortuni del Conducente',
    hasContent: true,
  },

  {
    slug: 'costo-gomme-calcolatore',
    component: 'CostoGommeCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Gomme (estive/invernali/quattro stagioni)',
    description: 'Calcolatore Costo Gomme (estive/invernali/quattro stagioni)',
    hasContent: true,
  },

  {
    slug: 'costo-manutenzione-auto-calcolatore',
    component: 'CostoManutenzioneAutoCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Manutenzione Auto (tagliando)',
    description: 'Calcolatore Costo Manutenzione Auto (tagliando)',
    hasContent: true,
  },

  {
    slug: 'costo-carburante-viaggio-calcolatore',
    component: 'CostoCarburanteViaggioCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Carburante per Viaggio',
    description: 'Calcolatore Costo Carburante per Viaggio',
    hasContent: true,
  },

  {
    slug: 'pedaggio-autostradale-calcolatore',
    component: 'PedaggioAutostradaleCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Pedaggio Autostradale per Tratta',
    description: 'Calcolatore Pedaggio Autostradale per Tratta',
    hasContent: true,
  },

  {
    slug: 'costo-parcheggio-calcolatore',
    component: 'CostoParcheggioCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Parcheggio (strisce blu) per città',
    description: 'Calcolatore Costo Parcheggio (strisce blu) per città',
    hasContent: true,
  },

  {
    slug: 'costo-area-c-b-calcolatore',
    component: 'CostoAreaCBCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Area C/B (Milano)',
    description: 'Calcolatore Costo Area C/B (Milano)',
    hasContent: true,
  },

  {
    slug: 'costo-ztl-calcolatore',
    component: 'CostoZtlCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo ZTL per città',
    description: 'Calcolatore Costo ZTL per città',
    hasContent: true,
  },

  {
    slug: 'multa-eccesso-velocita-calcolatore',
    component: 'MultaEccessoVelocitaCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Multa per Eccesso di Velocità (con decurtazione punti)',
    description: 'Calcolatore Multa per Eccesso di Velocità (con decurtazione punti)',
    hasContent: true,
  },

  {
    slug: 'multa-divieto-sosta-calcolatore',
    component: 'MultaDivietoSostaCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Multa per Divieto di Sosta',
    description: 'Calcolatore Multa per Divieto di Sosta',
    hasContent: true,
  },

  {
    slug: 'multa-semaforo-rosso-calcolatore',
    component: 'MultaSemaforoRossoCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Multa per Passaggio con Semaforo Rosso',
    description: 'Calcolatore Multa per Passaggio con Semaforo Rosso',
    hasContent: true,
  },

  {
    slug: 'multa-guida-cellulare-calcolatore',
    component: 'MultaGuidaCellulareCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Multa per Guida con Cellulare',
    description: 'Calcolatore Multa per Guida con Cellulare',
    hasContent: true,
  },

  {
    slug: 'recupero-punti-patente-calcolatore',
    component: 'RecuperoPuntiPatenteCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Recupero Punti Patente',
    description: 'Calcolatore Recupero Punti Patente',
    hasContent: true,
  },

  {
    slug: 'costo-noleggio-auto-calcolatore',
    component: 'CostoNoleggioAutoCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Noleggio Auto a Breve Termine',
    description: 'Calcolatore Costo Noleggio Auto a Breve Termine',
    hasContent: true,
  },

  {
    slug: 'costo-car-sharing-calcolatore',
    component: 'CostoCarSharingCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Car Sharing (per minuto/km)',
    description: 'Calcolatore Costo Car Sharing (per minuto/km)',
    hasContent: true,
  },

  {
    slug: 'costo-scooter-sharing-calcolatore',
    component: 'CostoScooterSharingCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Scooter Sharing',
    description: 'Calcolatore Costo Scooter Sharing',
    hasContent: true,
  },

  {
    slug: 'costo-bike-sharing-calcolatore',
    component: 'CostoBikeSharingCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Bike Sharing',
    description: 'Calcolatore Costo Bike Sharing',
    hasContent: true,
  },

  {
    slug: 'costo-monopattino-elettrico-calcolatore',
    component: 'CostoMonopattinoElettricoCalcolatore',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Monopattino Elettrico (acquisto vs. sharing)',
    description: 'Calcolatore Costo Monopattino Elettrico (acquisto vs. sharing)',
    hasContent: true,
  },

  {
    slug: 'costo-abbonamento-trasporto-pubblico',
    component: 'CostoAbbonamentoTrasportoPubblico',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Abbonamento Trasporto Pubblico per città',
    description: 'Calcolatore Costo Abbonamento Trasporto Pubblico per città',
    hasContent: true,
  },

  {
    slug: 'convenienza-treno-vs-aereo-vs-auto',
    component: 'ConvenienzaTrenoVsAereoVsAuto',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Convenienza Treno vs. Aereo vs. Auto per tratta',
    description: 'Calcolatore Convenienza Treno vs. Aereo vs. Auto per tratta',
    hasContent: true,
  },

  {
    slug: 'costo-traghetto-isole',
    component: 'CostoTraghettoIsole',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Traghetto per Isole (con/senza auto)',
    description: 'Calcolatore Costo Traghetto per Isole (con/senza auto)',
    hasContent: true,
  },

  {
    slug: 'costo-patente-nautica',
    component: 'CostoPatenteNautica',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Patente Nautica',
    description: 'Calcolatore Costo Patente Nautica',
    hasContent: true,
  },

  {
    slug: 'costo-ormeggio-barca',
    component: 'CostoOrmeggioBarca',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Ormeggio Barca',
    description: 'Calcolatore Costo Ormeggio Barca',
    hasContent: true,
  },

  {
    slug: 'costo-brevetto-volo',
    component: 'CostoBrevettoVolo',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Brevetto di Volo (ultraleggero)',
    description: 'Calcolatore Costo Brevetto di Volo (ultraleggero)',
    hasContent: true,
  },

  {
    slug: 'costo-iscrizione-asi-fmi',
    component: 'CostoIscrizioneAsiFmi',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Iscrizione ASI/FMI per Veicoli Storici',
    description: 'Calcolatore Costo Iscrizione ASI/FMI per Veicoli Storici',
    hasContent: true,
  },

  {
    slug: 'tassazione-veicoli-storici',
    component: 'TassazioneVeicoliStorici',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Tassazione Veicoli Storici (bollo ridotto)',
    description: 'Calcolatore Tassazione Veicoli Storici (bollo ridotto)',
    hasContent: true,
  },

  {
    slug: 'assicurazione-veicoli-storici',
    component: 'AssicurazioneVeicoliStorici',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Assicurazione Veicoli Storici',
    description: 'Calcolatore Assicurazione Veicoli Storici',
    hasContent: true,
  },

  {
    slug: 'costo-restauro-auto-moto-epoca',
    component: 'CostoRestauroAutoMotoEpoca',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Restauro Auto/Moto d\'Epoca',
    description: 'Calcolatore Costo Restauro Auto/Moto d\'Epoca',
    hasContent: true,
  },

  {
    slug: 'valore-auto-usata',
    component: 'ValoreAutoUsata',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Valore di un\'Auto Usata (Eurotax/Quattroruote)',
    description: 'Calcolatore Valore di un\'Auto Usata (Eurotax/Quattroruote)',
    hasContent: true,
  },

  {
    slug: 'svalutazione-auto',
    component: 'SvalutazioneAuto',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Svalutazione Auto nel Tempo',
    description: 'Calcolatore Svalutazione Auto nel Tempo',
    hasContent: true,
  },

  {
    slug: 'finanziamento-auto',
    component: 'FinanziamentoAuto',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Finanziamento Auto (con TAN e TAEG)',
    description: 'Calcolatore Finanziamento Auto (con TAN e TAEG)',
    hasContent: true,
  },

  {
    slug: 'maxirata-finanziamento-auto',
    component: 'MaxirataFinanziamentoAuto',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Maxirata Finale Finanziamento Auto',
    description: 'Calcolatore Maxirata Finale Finanziamento Auto',
    hasContent: true,
  },

  {
    slug: 'riscatto-leasing-auto',
    component: 'RiscattoLeasingAuto',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Riscatto Leasing Auto',
    description: 'Calcolatore Riscatto Leasing Auto',
    hasContent: true,
  },

  {
    slug: 'costo-demolizione-auto',
    component: 'CostoDemolizioneAuto',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Demolizione Auto',
    description: 'Calcolatore Costo Demolizione Auto',
    hasContent: true,
  },

  {
    slug: 'costo-radiazione-esportazione',
    component: 'CostoRadiazioneEsportazione',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Radiazione per Esportazione',
    description: 'Calcolatore Costo Radiazione per Esportazione',
    hasContent: true,
  },

  {
    slug: 'costo-duplicato-libretto',
    component: 'CostoDuplicatoLibretto',
    category: 'auto-e-trasporti',
    lang: 'it',
    title: 'Calcolatore Costo Duplicato Libretto di Circolazione/CDP',
    description: 'Calcolatore Costo Duplicato Libretto di Circolazione/CDP',
    hasContent: true,
  },

  {
    slug: 'tasse-universitarie-isee',
    component: 'TasseUniversitarieIsee',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Tasse Universitarie basato su ISEE',
    description: 'Calcolatore Tasse Universitarie basato su ISEE',
    hasContent: true,
  },

  {
    slug: 'borsa-studio-dsu',
    component: 'BorsaStudioDsu',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Borsa di Studio DSU (Diritto allo Studio Universitario)',
    description: 'Calcolatore Borsa di Studio DSU (Diritto allo Studio Universitario)',
    hasContent: true,
  },

  {
    slug: 'costo-vita-studente-fuorisede',
    component: 'CostoVitaStudenteFuorisede',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Costo della Vita per Studente Fuorisede (per città)',
    description: 'Calcolatore Costo della Vita per Studente Fuorisede (per città)',
    hasContent: true,
  },

  {
    slug: 'costo-libri-universitari',
    component: 'CostoLibriUniversitari',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Costo Libri Universitari per Facoltà',
    description: 'Calcolatore Costo Libri Universitari per Facoltà',
    hasContent: true,
  },

  {
    slug: 'costo-master',
    component: 'CostoMaster',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Costo Master/Specializzazione',
    description: 'Calcolatore Costo Master/Specializzazione',
    hasContent: true,
  },

  {
    slug: 'prestito-onore-studenti',
    component: 'PrestitoOnoreStudenti',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Prestito d\'Onore per Studenti',
    description: 'Calcolatore Prestito d\'Onore per Studenti',
    hasContent: true,
  },

  {
    slug: 'detrazione-affitto-studenti-fuorisede',
    component: 'DetrazioneAffittoStudentiFuorisede',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Detrazione Affitto Studenti Fuorisede',
    description: 'Calcolatore Detrazione Affitto Studenti Fuorisede',
    hasContent: true,
  },

  {
    slug: 'detrazione-tasse-universitarie',
    component: 'DetrazioneTasseUniversitarie',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Detrazione Tasse Universitarie',
    description: 'Calcolatore Detrazione Tasse Universitarie',
    hasContent: true,
  },

  {
    slug: 'costo-erasmus',
    component: 'CostoErasmus',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Costo Erasmus/Scambio Internazionale',
    description: 'Calcolatore Costo Erasmus/Scambio Internazionale',
    hasContent: true,
  },

  {
    slug: 'costo-scuola-privata',
    component: 'CostoScuolaPrivata',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Costo Scuola Privata (dall\'infanzia al liceo)',
    description: 'Calcolatore Costo Scuola Privata (dall\'infanzia al liceo)',
    hasContent: true,
  },

  {
    slug: 'bonus-cultura-18app',
    component: 'BonusCultura18app',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Bonus Cultura (18app)',
    description: 'Calcolatore Bonus Cultura (18app)',
    hasContent: true,
  },

  {
    slug: 'carta-docente',
    component: 'CartaDocente',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Carta del Docente',
    description: 'Calcolatore Carta del Docente',
    hasContent: true,
  },

  {
    slug: 'punteggio-gps-docenti',
    component: 'PunteggioGpsDocenti',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Punteggio Graduatorie Docenti (GPS)',
    description: 'Calcolatore Punteggio Graduatorie Docenti (GPS)',
    hasContent: true,
  },

  {
    slug: 'punteggio-concorsi-pubblici',
    component: 'PunteggioConcorsiPubblici',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Punteggio Concorsi Pubblici',
    description: 'Calcolatore Punteggio Concorsi Pubblici',
    hasContent: true,
  },

  {
    slug: 'voto-laurea',
    component: 'VotoLaurea',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Voto di Laurea (ponderato vs. aritmetico)',
    description: 'Calcolatore Voto di Laurea (ponderato vs. aritmetico)',
    hasContent: true,
  },

  {
    slug: 'crediti-formativi-universitari',
    component: 'CreditiFormativiUniversitari',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Crediti Formativi Universitari (CFU)',
    description: 'Calcolatore Crediti Formativi Universitari (CFU)',
    hasContent: true,
  },

  {
    slug: 'costo-corsi-lingua',
    component: 'CostoCorsiLingua',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Costo Corsi di Lingua',
    description: 'Calcolatore Costo Corsi di Lingua',
    hasContent: true,
  },

  {
    slug: 'costo-certificazioni-informatiche',
    component: 'CostoCertificazioniInformatiche',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Costo Certificazioni Informatiche',
    description: 'Calcolatore Costo Certificazioni Informatiche',
    hasContent: true,
  },

  {
    slug: 'costo-corsi-formazione',
    component: 'CostoCorsiFormazione',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Costo Corsi di Formazione Professionale',
    description: 'Calcolatore Costo Corsi di Formazione Professionale',
    hasContent: true,
  },

  {
    slug: 'costo-iscrizione-albo',
    component: 'CostoIscrizioneAlbo',
    category: 'istruzione-e-università',
    lang: 'it',
    title: 'Calcolatore Costo Iscrizione Albo Professionale',
    description: 'Calcolatore Costo Iscrizione Albo Professionale',
    hasContent: true,
  },

  {
    slug: 'ticket-sanitario-regione',
    component: 'TicketSanitarioRegione',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Ticket Sanitario per Regione',
    description: 'Calcolatore Ticket Sanitario per Regione',
    hasContent: true,
  },

  {
    slug: 'esenzione-ticket',
    component: 'EsenzioneTicket',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Esenzione Ticket per Reddito/Patologia',
    description: 'Calcolatore Esenzione Ticket per Reddito/Patologia',
    hasContent: true,
  },

  {
    slug: 'costo-visita-specialistica',
    component: 'CostoVisitaSpecialistica',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Visita Specialistica Privata vs. SSN',
    description: 'Calcolatore Costo Visita Specialistica Privata vs. SSN',
    hasContent: true,
  },

  {
    slug: 'costo-lenti-occhiali',
    component: 'CostoLentiOcchiali',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Lenti a Contatto vs. Occhiali',
    description: 'Calcolatore Costo Lenti a Contatto vs. Occhiali',
    hasContent: true,
  },

  {
    slug: 'costo-apparecchio-ortodontico',
    component: 'CostoApparecchioOrtodontico',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Apparecchio Ortodontico',
    description: 'Calcolatore Costo Apparecchio Ortodontico',
    hasContent: true,
  },

  {
    slug: 'costo-sbiancamento-dentale',
    component: 'CostoSbiancamentoDentale',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Sbiancamento Dentale',
    description: 'Calcolatore Costo Sbiancamento Dentale',
    hasContent: true,
  },

  {
    slug: 'costo-impianto-dentale',
    component: 'CostoImpiantoDentale',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Impianto Dentale',
    description: 'Calcolatore Costo Impianto Dentale',
    hasContent: true,
  },

  {
    slug: 'costo-assicurazione-sanitaria',
    component: 'CostoAssicurazioneSanitaria',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Assicurazione Sanitaria Integrativa',
    description: 'Calcolatore Costo Assicurazione Sanitaria Integrativa',
    hasContent: true,
  },

  {
    slug: 'detrazione-dispositivi-medici',
    component: 'DetrazioneDispositiviMedici',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Detrazione Spese per Dispositivi Medici',
    description: 'Calcolatore Detrazione Spese per Dispositivi Medici',
    hasContent: true,
  },

  {
    slug: 'detrazione-assistenza-familiari',
    component: 'DetrazioneAssistenzaFamiliari',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Detrazione Spese per Assistenza a Familiari non Autosufficienti',
    description: 'Calcolatore Detrazione Spese per Assistenza a Familiari non Autosufficienti',
    hasContent: true,
  },

  {
    slug: 'costo-psicoterapia',
    component: 'CostoPsicoterapia',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Sedute di Psicoterapia (con Bonus Psicologo)',
    description: 'Calcolatore Costo Sedute di Psicoterapia (con Bonus Psicologo)',
    hasContent: true,
  },

  {
    slug: 'costo-abbonamento-palestra-piscina',
    component: 'CostoAbbonamentoPalestraPiscina',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Abbonamento Palestra/Piscina',
    description: 'Calcolatore Costo Abbonamento Palestra/Piscina',
    hasContent: true,
  },

  {
    slug: 'costo-personal-trainer',
    component: 'CostoPersonalTrainer',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Personal Trainer',
    description: 'Calcolatore Costo Personal Trainer',
    hasContent: true,
  },

  {
    slug: 'costo-trattamenti-estetici',
    component: 'CostoTrattamentiEstetici',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Trattamenti Estetici (es. laser, filler)',
    description: 'Calcolatore Costo Trattamenti Estetici (es. laser, filler)',
    hasContent: true,
  },

  {
    slug: 'costo-terme-benessere',
    component: 'CostoTermeBenessere',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Terme e Centri Benessere',
    description: 'Calcolatore Costo Terme e Centri Benessere',
    hasContent: true,
  },

  {
    slug: 'calorie-bruciate',
    component: 'CalorieBruciate',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Calorie Bruciate per Attività Fisica',
    description: 'Calcolatore Calorie Bruciate per Attività Fisica',
    hasContent: true,
  },

  {
    slug: 'fabbisogno-calorico',
    component: 'FabbisognoCalorico',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Fabbisogno Calorico Giornaliero',
    description: 'Calcolatore Fabbisogno Calorico Giornaliero',
    hasContent: true,
  },

  {
    slug: 'macronutrienti',
    component: 'Macronutrienti',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Macronutrienti (proteine, carboidrati, grassi)',
    description: 'Calcolatore Macronutrienti (proteine, carboidrati, grassi)',
    hasContent: true,
  },

  {
    slug: 'indice-massa-corporea',
    component: 'IndiceMassaCorporea',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Indice di Massa Corporea (IMC)',
    description: 'Calcolatore Indice di Massa Corporea (IMC)',
    hasContent: true,
  },

  {
    slug: 'massa-grassa-magra',
    component: 'MassaGrassaMagra',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Percentuale Massa Grassa/Magra',
    description: 'Calcolatore Percentuale Massa Grassa/Magra',
    hasContent: true,
  },

  {
    slug: 'frequenza-cardiaca-allenamento',
    component: 'FrequenzaCardiacaAllenamento',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Frequenza Cardiaca Massima e Zone di Allenamento',
    description: 'Calcolatore Frequenza Cardiaca Massima e Zone di Allenamento',
    hasContent: true,
  },

  {
    slug: 'consumo-acqua-giornaliero',
    component: 'ConsumoAcquaGiornaliero',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Consumo Acqua Giornaliero',
    description: 'Calcolatore Consumo Acqua Giornaliero',
    hasContent: true,
  },

  {
    slug: 'ciclo-mestruale-ovulazione',
    component: 'CicloMestrualeOvulazione',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Ciclo Mestruale e Ovulazione',
    description: 'Calcolatore Ciclo Mestruale e Ovulazione',
    hasContent: true,
  },

  {
    slug: 'data-parto',
    component: 'DataParto',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Data Presunta del Parto',
    description: 'Calcolatore Data Presunta del Parto',
    hasContent: true,
  },

  {
    slug: 'congedo-maternita-paternita',
    component: 'CongedoMaternitaPaternita',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Congedo di Maternità/Paternità',
    description: 'Calcolatore Congedo di Maternità/Paternità',
    hasContent: true,
  },

  {
    slug: 'costo-parto',
    component: 'CostoParto',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Parto (pubblico vs. privato)',
    description: 'Calcolatore Costo Parto (pubblico vs. privato)',
    hasContent: true,
  },

  {
    slug: 'costo-primo-anno-neonato',
    component: 'CostoPrimoAnnoNeonato',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Primo Anno di un Neonato',
    description: 'Calcolatore Costo Primo Anno di un Neonato',
    hasContent: true,
  },

  {
    slug: 'costo-fecondazione-assistita',
    component: 'CostoFecondazioneAssistita',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Costo Fecondazione Assistita (PMA)',
    description: 'Calcolatore Costo Fecondazione Assistita (PMA)',
    hasContent: true,
  },

  {
    slug: 'donazione-sangue',
    component: 'DonazioneSangue',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Donazione Sangue (frequenza e requisiti)',
    description: 'Calcolatore Donazione Sangue (frequenza e requisiti)',
    hasContent: true,
  },

  {
    slug: 'rischio-cardiovascolare',
    component: 'RischioCardiovascolare',
    category: 'salute-e-benessere',
    lang: 'it',
    title: 'Calcolatore Rischio Cardiovascolare (Punteggio del Rischio)',
    description: 'Calcolatore Rischio Cardiovascolare (Punteggio del Rischio)',
    hasContent: true,
  },

  {
    slug: 'contributo-unificato-atti-giudiziari',
    component: 'ContributoUnificatoAttiGiudiziari',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Contributo Unificato per Atti Giudiziari',
    description: 'Calcolatore Contributo Unificato per Atti Giudiziari',
    hasContent: true,
  },

  {
    slug: 'compenso-avvocato',
    component: 'CompensoAvvocato',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Compenso Avvocato (parametri forensi)',
    description: 'Calcolatore Compenso Avvocato (parametri forensi)',
    hasContent: true,
  },

  {
    slug: 'interessi-legali-moratori',
    component: 'InteressiLegaliMoratori',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Interessi Legali e Moratori',
    description: 'Calcolatore Interessi Legali e Moratori',
    hasContent: true,
  },

  {
    slug: 'rivalutazione-monetaria-istat',
    component: 'RivalutazioneMonetariaIstat',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Rivalutazione Monetaria ISTAT',
    description: 'Calcolatore Rivalutazione Monetaria ISTAT',
    hasContent: true,
  },

  {
    slug: 'danno-biologico',
    component: 'DannoBiologico',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Danno Biologico (Tabelle di Milano/Roma)',
    description: 'Calcolatore Danno Biologico (Tabelle di Milano/Roma)',
    hasContent: true,
  },

  {
    slug: 'usura-tassi-interesse',
    component: 'UsuraTassiInteresse',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Usura Tassi di Interesse (Banca d\'Italia)',
    description: 'Calcolatore Usura Tassi di Interesse (Banca d\'Italia)',
    hasContent: true,
  },

  {
    slug: 'termini-prescrizione',
    component: 'TerminiPrescrizione',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Termini di Prescrizione',
    description: 'Calcolatore Termini di Prescrizione',
    hasContent: true,
  },

  {
    slug: 'termini-processuali',
    component: 'TerminiProcessuali',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Termini Processuali (sospensione feriale)',
    description: 'Calcolatore Termini Processuali (sospensione feriale)',
    hasContent: true,
  },

  {
    slug: 'costo-separazione-divorzio',
    component: 'CostoSeparazioneDivorzio',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Pratica di Separazione/Divorzio',
    description: 'Calcolatore Costo Pratica di Separazione/Divorzio',
    hasContent: true,
  },

  {
    slug: 'costo-successione',
    component: 'CostoSuccessione',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Pratica di Successione',
    description: 'Calcolatore Costo Pratica di Successione',
    hasContent: true,
  },

  {
    slug: 'costo-atto-donazione',
    component: 'CostoAttoDonazione',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Atto di Donazione',
    description: 'Calcolatore Costo Atto di Donazione',
    hasContent: true,
  },

  {
    slug: 'costo-costituzione-societa',
    component: 'CostoCostituzioneSocieta',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Costituzione Società (SRL, SPA)',
    description: 'Calcolatore Costo Costituzione Società (SRL, SPA)',
    hasContent: true,
  },

  {
    slug: 'costo-deposito-marchio',
    component: 'CostoDepositoMarchio',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Deposito Marchio/Brevetto',
    description: 'Calcolatore Costo Deposito Marchio/Brevetto',
    hasContent: true,
  },

  {
    slug: 'costo-visura-catastale',
    component: 'CostoVisuraCatastale',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Visura Catastale/Ipotecaria',
    description: 'Calcolatore Costo Visura Catastale/Ipotecaria',
    hasContent: true,
  },

  {
    slug: 'costo-certificato-camera-commercio',
    component: 'CostoCertificatoCameraCommercio',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Certificato Camera di Commercio',
    description: 'Calcolatore Costo Certificato Camera di Commercio',
    hasContent: true,
  },

  {
    slug: 'costo-passaporto',
    component: 'CostoPassaporto',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Passaporto/Carta d\'Identità Elettronica',
    description: 'Calcolatore Costo Passaporto/Carta d\'Identità Elettronica',
    hasContent: true,
  },

  {
    slug: 'costo-rinnovo-patente',
    component: 'CostoRinnovoPatente',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Rinnovo Patente',
    description: 'Calcolatore Costo Rinnovo Patente',
    hasContent: true,
  },

  {
    slug: 'costo-porto-armi',
    component: 'CostoPortoArmi',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Costo Porto d\'Armi',
    description: 'Calcolatore Costo Porto d\'Armi',
    hasContent: true,
  },

  {
    slug: 'sanzioni-codice-strada',
    component: 'SanzioniCodiceStrada',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Sanzioni per Violazioni Codice della Strada',
    description: 'Calcolatore Sanzioni per Violazioni Codice della Strada',
    hasContent: true,
  },

  {
    slug: 'sanzioni-privacy-gdpr',
    component: 'SanzioniPrivacyGdpr',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Sanzioni per Violazioni Privacy (GDPR)',
    description: 'Calcolatore Sanzioni per Violazioni Privacy (GDPR)',
    hasContent: true,
  },

  {
    slug: 'diritto-annuale-camera-commercio',
    component: 'DirittoAnnualeCameraCommercio',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Diritto Annuale Camera di Commercio',
    description: 'Calcolatore Diritto Annuale Camera di Commercio',
    hasContent: true,
  },

  {
    slug: 'tassa-soggiorno',
    component: 'TassaSoggiorno',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Tassa di Soggiorno per Comune',
    description: 'Calcolatore Tassa di Soggiorno per Comune',
    hasContent: true,
  },

  {
    slug: 'canone-unico-patrimoniale',
    component: 'CanoneUnicoPatrimoniale',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Canone Unico Patrimoniale (ex COSAP/TOSAP)',
    description: 'Calcolatore Canone Unico Patrimoniale (ex COSAP/TOSAP)',
    hasContent: true,
  },

  {
    slug: 'imposta-pubblicita',
    component: 'ImpostaPubblicita',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Imposta sulla Pubblicità',
    description: 'Calcolatore Imposta sulla Pubblicità',
    hasContent: true,
  },

  {
    slug: 'diritti-siae',
    component: 'DirittiSiae',
    category: 'legale-e-amministrativo',
    lang: 'it',
    title: 'Calcolatore Diritti SIAE',
    description: 'Calcolatore Diritti SIAE',
    hasContent: true,
  },

  {
    slug: 'costo-matrimonio',
    component: 'CostoMatrimonio',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Matrimonio per Regione',
    description: 'Calcolatore Costo Matrimonio per Regione',
    hasContent: true,
  },

  {
    slug: 'costo-cerimonie-religiose',
    component: 'CostoCerimonieReligiose',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Battesimo/Comunione/Cresima',
    description: 'Calcolatore Costo Battesimo/Comunione/Cresima',
    hasContent: true,
  },

  {
    slug: 'costo-festa-laurea',
    component: 'CostoFestaLaurea',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Festa di Laurea',
    description: 'Calcolatore Costo Festa di Laurea',
    hasContent: true,
  },

  {
    slug: 'costo-festa-compleanno',
    component: 'CostoFestaCompleanno',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Festa di Compleanno (bambini/adulti)',
    description: 'Calcolatore Costo Festa di Compleanno (bambini/adulti)',
    hasContent: true,
  },

  {
    slug: 'costo-viaggio',
    component: 'CostoViaggio',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Viaggio (trasporto, alloggio, vitto)',
    description: 'Calcolatore Costo Viaggio (trasporto, alloggio, vitto)',
    hasContent: true,
  },

  {
    slug: 'costo-settimana-bianca',
    component: 'CostoSettimanaBianca',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Settimana Bianca',
    description: 'Calcolatore Costo Settimana Bianca',
    hasContent: true,
  },

  {
    slug: 'costo-vacanza-mare',
    component: 'CostoVacanzaMare',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Vacanza al Mare (stabilimento balneare)',
    description: 'Calcolatore Costo Vacanza al Mare (stabilimento balneare)',
    hasContent: true,
  },

  {
    slug: 'costo-biglietto-evento',
    component: 'CostoBigliettoEvento',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Biglietto Concerto/Evento Sportivo',
    description: 'Calcolatore Costo Biglietto Concerto/Evento Sportivo',
    hasContent: true,
  },

  {
    slug: 'costo-abbonamento-streaming',
    component: 'CostoAbbonamentoStreaming',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Abbonamento Streaming (Netflix, Prime, etc.)',
    description: 'Calcolatore Costo Abbonamento Streaming (Netflix, Prime, etc.)',
    hasContent: true,
  },

  {
    slug: 'costo-abbonamento-palestra-piscina',
    component: 'CostoAbbonamentoPalestraPiscina',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Abbonamento Palestra/Piscina',
    description: 'Calcolatore Costo Abbonamento Palestra/Piscina',
    hasContent: true,
  },

  {
    slug: 'costo-skipass',
    component: 'CostoSkipass',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Skipass per Comprensorio Sciistico',
    description: 'Calcolatore Costo Skipass per Comprensorio Sciistico',
    hasContent: true,
  },

  {
    slug: 'costo-cena-ristorante',
    component: 'CostoCenaRistorante',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Cena al Ristorante (con mancia)',
    description: 'Calcolatore Costo Cena al Ristorante (con mancia)',
    hasContent: true,
  },

  {
    slug: 'spesa-supermercato',
    component: 'SpesaSupermercato',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Spesa al Supermercato (per nucleo familiare)',
    description: 'Calcolatore Spesa al Supermercato (per nucleo familiare)',
    hasContent: true,
  },

  {
    slug: 'costo-caffe-bar',
    component: 'CostoCaffeBar',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Caffè al Bar (annuale)',
    description: 'Calcolatore Costo Caffè al Bar (annuale)',
    hasContent: true,
  },

  {
    slug: 'costo-sigarette',
    component: 'CostoSigarette',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Sigarette (e risparmio smettendo)',
    description: 'Calcolatore Costo Sigarette (e risparmio smettendo)',
    hasContent: true,
  },

  {
    slug: 'lotteria-probabilita',
    component: 'LotteriaProbabilita',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Lotteria (probabilità di vincita)',
    description: 'Calcolatore Lotteria (probabilità di vincita)',
    hasContent: true,
  },

  {
    slug: 'superenalotto-gratta-vinci',
    component: 'SuperenalottoGrattaVinci',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore SuperEnalotto/Gratta e Vinci',
    description: 'Calcolatore SuperEnalotto/Gratta e Vinci',
    hasContent: true,
  },

  {
    slug: 'scommesse-sportive',
    component: 'ScommesseSportive',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Scommesse Sportive (quota, vincita potenziale)',
    description: 'Calcolatore Scommesse Sportive (quota, vincita potenziale)',
    hasContent: true,
  },

  {
    slug: 'fantacalcio-budget',
    component: 'FantacalcioBudget',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Fantacalcio (asta, budget)',
    description: 'Calcolatore Fantacalcio (asta, budget)',
    hasContent: true,
  },

  {
    slug: 'costo-tatuaggio',
    component: 'CostoTatuaggio',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo di un Tatuaggio',
    description: 'Calcolatore Costo di un Tatuaggio',
    hasContent: true,
  },

  {
    slug: 'costo-piercing',
    component: 'CostoPiercing',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo di un Piercing',
    description: 'Calcolatore Costo di un Piercing',
    hasContent: true,
  },

  {
    slug: 'costo-parrucchiere',
    component: 'CostoParrucchiere',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Parrucchiere/Barbiere (annuale)',
    description: 'Calcolatore Costo Parrucchiere/Barbiere (annuale)',
    hasContent: true,
  },

  {
    slug: 'costo-estetista',
    component: 'CostoEstetista',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Estetista (ceretta, unghie)',
    description: 'Calcolatore Costo Estetista (ceretta, unghie)',
    hasContent: true,
  },

  {
    slug: 'costo-abbonamento-riviste',
    component: 'CostoAbbonamentoRiviste',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Abbonamento Riviste/Quotidiani',
    description: 'Calcolatore Costo Abbonamento Riviste/Quotidiani',
    hasContent: true,
  },

  {
    slug: 'costo-libri',
    component: 'CostoLibri',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Libri (cartacei vs. ebook)',
    description: 'Calcolatore Costo Libri (cartacei vs. ebook)',
    hasContent: true,
  },

  {
    slug: 'costo-videogiochi',
    component: 'CostoVideogiochi',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Videogiochi (acquisto vs. abbonamento)',
    description: 'Calcolatore Costo Videogiochi (acquisto vs. abbonamento)',
    hasContent: true,
  },

  {
    slug: 'costo-pc-gaming',
    component: 'CostoPcGaming',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo PC da Gaming (componenti)',
    description: 'Calcolatore Costo PC da Gaming (componenti)',
    hasContent: true,
  },

  {
    slug: 'costo-smartphone',
    component: 'CostoSmartphone',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Smartphone (acquisto vs. rate)',
    description: 'Calcolatore Costo Smartphone (acquisto vs. rate)',
    hasContent: true,
  },

  {
    slug: 'costo-piano-mobile',
    component: 'CostoPianoMobile',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Piano Tariffario Mobile',
    description: 'Calcolatore Costo Piano Tariffario Mobile',
    hasContent: true,
  },

  {
    slug: 'costo-internet-casa',
    component: 'CostoInternetCasa',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Connessione Internet Casa',
    description: 'Calcolatore Costo Connessione Internet Casa',
    hasContent: true,
  },

  {
    slug: 'consumo-elettrico-elettrodomestici',
    component: 'ConsumoElettricoElettrodomestici',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Consumo Elettrico Elettrodomestici',
    description: 'Calcolatore Consumo Elettrico Elettrodomestici',
    hasContent: true,
  },

  {
    slug: 'bolletta-luce',
    component: 'BollettaLuce',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Bolletta Luce (mercato libero vs. tutelato)',
    description: 'Calcolatore Bolletta Luce (mercato libero vs. tutelato)',
    hasContent: true,
  },

  {
    slug: 'bolletta-gas',
    component: 'BollettaGas',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Bolletta Gas',
    description: 'Calcolatore Bolletta Gas',
    hasContent: true,
  },

  {
    slug: 'bolletta-acqua',
    component: 'BollettaAcqua',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Bolletta Acqua',
    description: 'Calcolatore Bolletta Acqua',
    hasContent: true,
  },

  {
    slug: 'raccolta-differenziata',
    component: 'RaccoltaDifferenziata',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Raccolta Differenziata (impatto e risparmio)',
    description: 'Calcolatore Raccolta Differenziata (impatto e risparmio)',
    hasContent: true,
  },

  {
    slug: 'impronta-carbonica',
    component: 'ImprontaCarbonica',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Impronta Carbonica Personale',
    description: 'Calcolatore Impronta Carbonica Personale',
    hasContent: true,
  },

  {
    slug: 'risparmio-lampadine-led',
    component: 'RisparmioLampadineLed',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Risparmio Energetico con Lampadine LED',
    description: 'Calcolatore Risparmio Energetico con Lampadine LED',
    hasContent: true,
  },

  {
    slug: 'risparmio-acqua-riduttori',
    component: 'RisparmioAcquaRiduttori',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Risparmio Acqua con Riduttori di Flusso',
    description: 'Calcolatore Risparmio Acqua con Riduttori di Flusso',
    hasContent: true,
  },

  {
    slug: 'costo-pannelli-solari-termici',
    component: 'CostoPannelliSolariTermici',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Pannelli Solari Termici (acqua calda)',
    description: 'Calcolatore Costo Pannelli Solari Termici (acqua calda)',
    hasContent: true,
  },

  {
    slug: 'raccolta-acqua-piovana',
    component: 'RaccoltaAcquaPiovana',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Raccolta Acqua Piovana (risparmio)',
    description: 'Calcolatore Raccolta Acqua Piovana (risparmio)',
    hasContent: true,
  },

  {
    slug: 'costo-orto-domestico',
    component: 'CostoOrtoDomestico',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Orto Domestico (risparmio sulla spesa)',
    description: 'Calcolatore Costo Orto Domestico (risparmio sulla spesa)',
    hasContent: true,
  },

  {
    slug: 'costo-cibo-animali',
    component: 'CostoCiboAnimali',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Cibo per Animali Domestici',
    description: 'Calcolatore Costo Cibo per Animali Domestici',
    hasContent: true,
  },

  {
    slug: 'spese-veterinarie',
    component: 'SpeseVeterinarie',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Spese Veterinarie (vaccini, sterilizzazione)',
    description: 'Calcolatore Spese Veterinarie (vaccini, sterilizzazione)',
    hasContent: true,
  },

  {
    slug: 'costo-toelettatura-cane',
    component: 'CostoToelettaturaCane',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Toelettatura Cane',
    description: 'Calcolatore Costo Toelettatura Cane',
    hasContent: true,
  },

  {
    slug: 'costo-pensione-animali',
    component: 'CostoPensioneAnimali',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Pensione per Animali',
    description: 'Calcolatore Costo Pensione per Animali',
    hasContent: true,
  },

  {
    slug: 'costo-acquario',
    component: 'CostoAcquario',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Acquario (allestimento e manutenzione)',
    description: 'Calcolatore Costo Acquario (allestimento e manutenzione)',
    hasContent: true,
  },

  {
    slug: 'costo-attrezzatura-hobby',
    component: 'CostoAttrezzaturaHobby',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Attrezzatura per Hobby (pesca, pittura, etc.)',
    description: 'Calcolatore Costo Attrezzatura per Hobby (pesca, pittura, etc.)',
    hasContent: true,
  },

  {
    slug: 'costo-iscrizione-corsi',
    component: 'CostoIscrizioneCorsi',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Iscrizione a Corsi (cucina, ballo, etc.)',
    description: 'Calcolatore Costo Iscrizione a Corsi (cucina, ballo, etc.)',
    hasContent: true,
  },

  {
    slug: 'costo-volontariato',
    component: 'CostoVolontariato',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Volontariato (eventuali spese)',
    description: 'Calcolatore Costo Volontariato (eventuali spese)',
    hasContent: true,
  },

  {
    slug: 'donazioni-enti-benefici-calcolatore',
    component: 'DonazioniEntiBeneficiCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Donazioni a Enti Benefici (con detrazioni fiscali)',
    description: 'Calcolatore Donazioni a Enti Benefici (con detrazioni fiscali)',
    hasContent: true,
  },

  {
    slug: '8x1000-5x1000-2x1000-calcolatore',
    component: 'Calc8x10005x10002x1000',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore 8x5, 5x2, 2x1000 in Dichiarazione dei Redditi',
    description: 'Calcolatore 8x5, 5x2, 2x1000 in Dichiarazione dei Redditi',
    hasContent: true,
  },

  {
    slug: 'quota-iscrizione-partito-sindacato-calcolatore',
    component: 'QuotaIscrizionePartitoSindacatoCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Quota Iscrizione Partito/Sindacato (con detrazioni)',
    description: 'Calcolatore Quota Iscrizione Partito/Sindacato (con detrazioni)',
    hasContent: true,
  },

  {
    slug: 'costo-trasloco-calcolatore',
    component: 'CostoTraslocoCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo di un Trasloco',
    description: 'Calcolatore Costo di un Trasloco',
    hasContent: true,
  },

  {
    slug: 'costo-deposito-mobili-calcolatore',
    component: 'CostoDepositoMobiliCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Deposito Mobili (storage)',
    description: 'Calcolatore Costo Deposito Mobili (storage)',
    hasContent: true,
  },

  {
    slug: 'costo-giardinaggio-calcolatore',
    component: 'CostoGiardinaggioCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Lavori di Giardinaggio',
    description: 'Calcolatore Costo Lavori di Giardinaggio',
    hasContent: true,
  },

  {
    slug: 'costo-pulizie-domestiche-calcolatore',
    component: 'CostoPulizieDomesticheCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Pulizie Domestiche',
    description: 'Calcolatore Costo Pulizie Domestiche',
    hasContent: true,
  },

  {
    slug: 'costo-stiratura-domicilio-calcolatore',
    component: 'CostoStiraturaDomicilioCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Stiratura a Domicilio',
    description: 'Calcolatore Costo Stiratura a Domicilio',
    hasContent: true,
  },

  {
    slug: 'costo-babysitter-calcolatore',
    component: 'CostoBabysitterCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Babysitter',
    description: 'Calcolatore Costo Babysitter',
    hasContent: true,
  },

  {
    slug: 'costo-ripetizioni-scolastiche-calcolatore',
    component: 'CostoRipetizioniScolasticheCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Ripetizioni Scolastiche',
    description: 'Calcolatore Costo Ripetizioni Scolastiche',
    hasContent: true,
  },

  {
    slug: 'costo-centri-estivi-bambini-calcolatore',
    component: 'CostoCentriEstiviBambiniCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Centri Estivi per Bambini',
    description: 'Calcolatore Costo Centri Estivi per Bambini',
    hasContent: true,
  },

  {
    slug: 'costo-sport-bambini-calcolatore',
    component: 'CostoSportBambiniCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo Attività Sportiva per Bambini',
    description: 'Calcolatore Costo Attività Sportiva per Bambini',
    hasContent: true,
  },

  {
    slug: 'paghetta-figli-calcolatore',
    component: 'PaghettaFigliCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Paghetta Settimanale/Mensile per Figli',
    description: 'Calcolatore Paghetta Settimanale/Mensile per Figli',
    hasContent: true,
  },

  {
    slug: 'budget-regalo-nozze-compleanno-calcolatore',
    component: 'BudgetRegaloNozzeCompleannoCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Regalo di Nozze/Compleanno (budget)',
    description: 'Calcolatore Regalo di Nozze/Compleanno (budget)',
    hasContent: true,
  },

  {
    slug: 'lista-nascita-budget-calcolatore',
    component: 'ListaNascitaBudgetCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Lista Nascita (budget)',
    description: 'Calcolatore Lista Nascita (budget)',
    hasContent: true,
  },

  {
    slug: 'suddivisione-spese-coppia-calcolatore',
    component: 'SuddivisioneSpeseCoppiaCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Suddivisione Spese di Coppia',
    description: 'Calcolatore Suddivisione Spese di Coppia',
    hasContent: true,
  },

  {
    slug: 'gestione-budget-familiare-calcolatore',
    component: 'GestioneBudgetFamiliareCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Gestione Budget Familiare (regola 50/30/20)',
    description: 'Calcolatore Gestione Budget Familiare (regola 50/30/20)',
    hasContent: true,
  },

  {
    slug: 'fondo-emergenza-calcolatore',
    component: 'FondoEmergenzaCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Fondo di Emergenza (3-6 mesi di spese)',
    description: 'Calcolatore Fondo di Emergenza (3-6 mesi di spese)',
    hasContent: true,
  },

  {
    slug: 'debito-residuo-finanziamento-calcolatore',
    component: 'DebitoResiduoFinanziamentoCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Debito Residuo di un Finanziamento',
    description: 'Calcolatore Debito Residuo di un Finanziamento',
    hasContent: true,
  },

  {
    slug: 'estinzione-anticipata-prestito-calcolatore',
    component: 'EstinzioneAnticipataPrestitoCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Estinzione Anticipata di un Prestito',
    description: 'Calcolatore Estinzione Anticipata di un Prestito',
    hasContent: true,
  },

  {
    slug: 'consolidamento-debiti-calcolatore',
    component: 'ConsolidamentoDebitiCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Consolidamento Debiti',
    description: 'Calcolatore Consolidamento Debiti',
    hasContent: true,
  },

  {
    slug: 'pignoramento-quinto-stipendio-calcolatore',
    component: 'PignoramentoQuintoStipendioCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Pignoramento Quinto dello Stipendio',
    description: 'Calcolatore Pignoramento Quinto dello Stipendio',
    hasContent: true,
  },

  {
    slug: 'segnalazione-crif-calcolatore',
    component: 'SegnalazioneCrifCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Segnalazione CRIF (tempi di cancellazione)',
    description: 'Calcolatore Segnalazione CRIF (tempi di cancellazione)',
    hasContent: true,
  },

  {
    slug: 'protesto-cancellazione-calcolatore',
    component: 'ProtestoCancellazioneCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Protesto (tempi di cancellazione)',
    description: 'Calcolatore Protesto (tempi di cancellazione)',
    hasContent: true,
  },

  {
    slug: 'valore-legale-firma-elettronica-calcolatore',
    component: 'ValoreLegaleFirmaElettronicaCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Valore Legale di una Firma Elettronica',
    description: 'Calcolatore Valore Legale di una Firma Elettronica',
    hasContent: true,
  },

  {
    slug: 'costo-spid-pec-calcolatore',
    component: 'CostoSpidPecCalcolatore',
    category: 'varie-e-vita-quotidiana',
    lang: 'it',
    title: 'Calcolatore Costo SPID/PEC',
    description: 'Calcolatore Costo SPID/PEC',
    hasContent: true,
  },

  {
    slug: 'calculadora-declaracion-renta-deducciones',
    component: 'CalculadoraDeclaracionRentaDeducciones',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Declaración de la Renta (con todas las deducciones autonómicas)',
    description: 'Calculadora de la Declaración de la Renta (con todas las deducciones autonómicas)',
    hasContent: true,
  },

  {
    slug: 'calculadora-ley-startups',
    component: 'CalculadoraLeyStartups',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la "Ley de Startups" (incentivos fiscales)',
    description: 'Calculadora de la "Ley de Startups" (incentivos fiscales)',
    hasContent: true,
  },

  {
    slug: 'calculadora-impuestos-nomadas-digitales',
    component: 'CalculadoraImpuestosNomadasDigitales',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de Impuestos para Nómadas Digitales (con visado especial)',
    description: 'Calculadora de Impuestos para Nómadas Digitales (con visado especial)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasa-google',
    component: 'CalculadoraTasaGoogle',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la "Tasa Google" (Impuesto sobre Determinados Servicios Digitales)',
    description: 'Calculadora de la "Tasa Google" (Impuesto sobre Determinados Servicios Digitales)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasa-tobin',
    component: 'CalculadoraTasaTobin',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la "Tasa Tobin" (Impuesto sobre las Transacciones Financieras)',
    description: 'Calculadora de la "Tasa Tobin" (Impuesto sobre las Transacciones Financieras)',
    hasContent: true,
  },

  {
    slug: 'calculadora-amortizacion-acelerada-pymes',
    component: 'CalculadoraAmortizacionAceleradaPymes',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Amortización Acelerada para pymes',
    description: 'Calculadora de la Amortización Acelerada para pymes',
    hasContent: true,
  },

  {
    slug: 'calculadora-deduccion-inversion-empresas-nueva-creacion',
    component: 'CalculadoraDeduccionInversionEmpresasNuevaCreacion',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Deducción por Inversión en Empresas de Nueva Creación',
    description: 'Calculadora de la Deducción por Inversión en Empresas de Nueva Creación',
    hasContent: true,
  },

  {
    slug: 'calculadora-exencion-reinversion-vivienda',
    component: 'CalculadoraExencionReinversionVivienda',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Exención por Reinversión en Vivienda Habitual',
    description: 'Calculadora de la Exención por Reinversión en Vivienda Habitual',
    hasContent: true,
  },

  {
    slug: 'calculadora-exencion-venta-vivienda-mayores-65',
    component: 'CalculadoraExencionVentaViviendaMayores65',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Exención por Venta de Vivienda para Mayores de 65 años',
    description: 'Calculadora de la Exención por Venta de Vivienda para Mayores de 65 años',
    hasContent: true,
  },

  {
    slug: 'calculadora-ganancia-venta-acciones-fondos',
    component: 'CalculadoraGananciaVentaAccionesFondos',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Ganancia Patrimonial por Venta de Acciones/Fondos',
    description: 'Calculadora de la Ganancia Patrimonial por Venta de Acciones/Fondos',
    hasContent: true,
  },

  {
    slug: 'calculadora-ganancia-venta-criptomonedas',
    component: 'CalculadoraGananciaVentaCriptomonedas',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Ganancia Patrimonial por Venta de Criptomonedas',
    description: 'Calculadora de la Ganancia Patrimonial por Venta de Criptomonedas',
    hasContent: true,
  },

  {
    slug: 'calculadora-ganancia-venta-inmueble',
    component: 'CalculadoraGananciaVentaInmueble',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Ganancia Patrimonial por Venta de un Inmueble',
    description: 'Calculadora de la Ganancia Patrimonial por Venta de un Inmueble',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-stock-options',
    component: 'CalculadoraFiscalidadStockOptions',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los "Stock Options"',
    description: 'Calculadora de la Fiscalidad de los "Stock Options"',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-phantom-shares',
    component: 'CalculadoraFiscalidadPhantomShares',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los "Phantom Shares"',
    description: 'Calculadora de la Fiscalidad de los "Phantom Shares"',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-planes-pensiones',
    component: 'CalculadoraFiscalidadPlanesPensiones',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Planes de Pensiones (aportación vs. rescate)',
    description: 'Calculadora de la Fiscalidad de los Planes de Pensiones (aportación vs. rescate)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-pias',
    component: 'CalculadoraFiscalidadPias',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los PIAS (Planes Individuales de Ahorro Sistemático)',
    description: 'Calculadora de la Fiscalidad de los PIAS (Planes Individuales de Ahorro Sistemático)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-sialp',
    component: 'CalculadoraFiscalidadSialp',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los SIALP (Seguros Individuales de Ahorro a Largo Plazo)',
    description: 'Calculadora de la Fiscalidad de los SIALP (Seguros Individuales de Ahorro a Largo Plazo)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-unit-linked',
    component: 'CalculadoraFiscalidadUnitLinked',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los "Unit Linked"',
    description: 'Calculadora de la Fiscalidad de los "Unit Linked"',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-crowdfunding-inmobiliario',
    component: 'CalculadoraFiscalidadCrowdfundingInmobiliario',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad del Crowdfunding Inmobiliario',
    description: 'Calculadora de la Fiscalidad del Crowdfunding Inmobiliario',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-alquiler-larga-estancia',
    component: 'CalculadoraFiscalidadAlquilerLargaEstancia',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad del Alquiler de Larga Estancia (con reducción del 60%)',
    description: 'Calculadora de la Fiscalidad del Alquiler de Larga Estancia (con reducción del 60%)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-alquiler-local-comercial',
    component: 'CalculadoraFiscalidadAlquilerLocalComercial',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad del Alquiler de Local Comercial',
    description: 'Calculadora de la Fiscalidad del Alquiler de Local Comercial',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-twitch-youtube',
    component: 'CalculadoraFiscalidadTwitchYoutube',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Ingresos por Twitch/YouTube',
    description: 'Calculadora de la Fiscalidad de los Ingresos por Twitch/YouTube',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-onlyfans-patreon',
    component: 'CalculadoraFiscalidadOnlyfansPatreon',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Ingresos por OnlyFans/Patreon',
    description: 'Calculadora de la Fiscalidad de los Ingresos por OnlyFans/Patreon',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-wallapop-vinted',
    component: 'CalculadoraFiscalidadWallapopVinted',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de las Ventas en Wallapop/Vinted',
    description: 'Calculadora de la Fiscalidad de las Ventas en Wallapop/Vinted',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-apuestas-online',
    component: 'CalculadoraFiscalidadApuestasOnline',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de las Apuestas Deportivas y Juego Online',
    description: 'Calculadora de la Fiscalidad de las Apuestas Deportivas y Juego Online',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-premios-loteria',
    component: 'CalculadoraFiscalidadPremiosLoteria',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Premios de Lotería',
    description: 'Calculadora de la Fiscalidad de los Premios de Lotería',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-donaciones-ongs',
    component: 'CalculadoraFiscalidadDonacionesOngs',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de las Donaciones (a ONGs, partidos políticos)',
    description: 'Calculadora de la Fiscalidad de las Donaciones (a ONGs, partidos políticos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-herencias-vida',
    component: 'CalculadoraFiscalidadHerenciasVida',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de las Herencias en Vida (Pactos Sucesorios por C.A.)',
    description: 'Calculadora de la Fiscalidad de las Herencias en Vida (Pactos Sucesorios por C.A.)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-trust',
    component: 'CalculadoraFiscalidadTrust',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de un Trust (si aplica en España)',
    description: 'Calculadora de la Fiscalidad de un Trust (si aplica en España)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-trading-alta-frecuencia',
    component: 'CalculadoraFiscalidadTradingAltaFrecuencia',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de un "Trading" de alta frecuencia',
    description: 'Calculadora de la Fiscalidad de un "Trading" de alta frecuencia',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-staking-cripto',
    component: 'CalculadoraFiscalidadStakingCripto',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los "Staking Rewards" de criptomonedas',
    description: 'Calculadora de la Fiscalidad de los "Staking Rewards" de criptomonedas',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-airdrops-cripto',
    component: 'CalculadoraFiscalidadAirdropsCripto',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los "Airdrops" de criptomonedas',
    description: 'Calculadora de la Fiscalidad de los "Airdrops" de criptomonedas',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-farming-defi',
    component: 'CalculadoraFiscalidadFarmingDefi',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los "Farming" en DeFi',
    description: 'Calculadora de la Fiscalidad de los "Farming" en DeFi',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-arbitraje',
    component: 'CalculadoraFiscalidadArbitraje',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Ingresos por Arbitraje (deportivo, cripto)',
    description: 'Calculadora de la Fiscalidad de los Ingresos por Arbitraje (deportivo, cripto)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-venta-nfts',
    component: 'CalculadoraFiscalidadVentaNfts',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Ingresos por Venta de NFTs',
    description: 'Calculadora de la Fiscalidad de los Ingresos por Venta de NFTs',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-derechos-autor',
    component: 'CalculadoraFiscalidadDerechosAutor',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Ingresos por Derechos de Autor/Imagen',
    description: 'Calculadora de la Fiscalidad de los Ingresos por Derechos de Autor/Imagen',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-royalties-patentes',
    component: 'CalculadoraFiscalidadRoyaltiesPatentes',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Ingresos por Royalties y Patentes',
    description: 'Calculadora de la Fiscalidad de los Ingresos por Royalties y Patentes',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-ingresos-agricolas',
    component: 'CalculadoraFiscalidadIngresosAgricolas',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Ingresos Agrícolas (régimen especial)',
    description: 'Calculadora de la Fiscalidad de los Ingresos Agrícolas (régimen especial)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-ingresos-ganaderos',
    component: 'CalculadoraFiscalidadIngresosGanaderos',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Ingresos Ganaderos (régimen especial)',
    description: 'Calculadora de la Fiscalidad de los Ingresos Ganaderos (régimen especial)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-ingresos-forestales',
    component: 'CalculadoraFiscalidadIngresosForestales',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Ingresos Forestales',
    description: 'Calculadora de la Fiscalidad de los Ingresos Forestales',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-modulos',
    component: 'CalculadoraFiscalidadModulos',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Módulos (estimación objetiva)',
    description: 'Calculadora de la Fiscalidad de los Módulos (estimación objetiva)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-transportistas',
    component: 'CalculadoraFiscalidadTransportistas',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Transportistas (módulos)',
    description: 'Calculadora de la Fiscalidad de los Transportistas (módulos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-bares',
    component: 'CalculadoraFiscalidadBares',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Bares/Restaurantes (módulos)',
    description: 'Calculadora de la Fiscalidad de los Bares/Restaurantes (módulos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-peluquerias',
    component: 'CalculadoraFiscalidadPeluquerias',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de las Peluquerías (módulos)',
    description: 'Calculadora de la Fiscalidad de las Peluquerías (módulos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-taxis',
    component: 'CalculadoraFiscalidadTaxis',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de los Taxis (módulos)',
    description: 'Calculadora de la Fiscalidad de los Taxis (módulos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-iva-recargo-equivalencia',
    component: 'CalculadoraIvaRecargoEquivalencia',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del IVA en Régimen de Recargo de Equivalencia',
    description: 'Calculadora del IVA en Régimen de Recargo de Equivalencia',
    hasContent: true,
  },

  {
    slug: 'calculadora-iva-rebu',
    component: 'CalculadoraIvaRebu',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del IVA en Régimen Especial de Bienes Usados (REBU)',
    description: 'Calculadora del IVA en Régimen Especial de Bienes Usados (REBU)',
    hasContent: true,
  },

  {
    slug: 'calculadora-iva-agencias-viajes',
    component: 'CalculadoraIvaAgenciasViajes',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del IVA en Régimen Especial de Agencias de Viajes',
    description: 'Calculadora del IVA en Régimen Especial de Agencias de Viajes',
    hasContent: true,
  },

  {
    slug: 'calculadora-iva-intracomunitario',
    component: 'CalculadoraIvaIntracomunitario',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del IVA Intracomunitario (ROI)',
    description: 'Calculadora del IVA Intracomunitario (ROI)',
    hasContent: true,
  },

  {
    slug: 'calculadora-modelo-347',
    component: 'CalculadoraModelo347',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del Modelo 347 (operaciones con terceros)',
    description: 'Calculadora del Modelo 347 (operaciones con terceros)',
    hasContent: true,
  },

  {
    slug: 'calculadora-modelo-349',
    component: 'CalculadoraModelo349',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del Modelo 349 (operaciones intracomunitarias)',
    description: 'Calculadora del Modelo 349 (operaciones intracomunitarias)',
    hasContent: true,
  },

  {
    slug: 'calculadora-modelo-111',
    component: 'CalculadoraModelo111',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del Modelo 111 (retenciones de trabajadores)',
    description: 'Calculadora del Modelo 111 (retenciones de trabajadores)',
    hasContent: true,
  },

  {
    slug: 'calculadora-modelo-115',
    component: 'CalculadoraModelo115',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del Modelo 115 (retenciones de alquileres)',
    description: 'Calculadora del Modelo 115 (retenciones de alquileres)',
    hasContent: true,
  },

  {
    slug: 'calculadora-modelo-130',
    component: 'CalculadoraModelo130',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del Modelo 130 (pago fraccionado IRPF estimación directa)',
    description: 'Calculadora del Modelo 130 (pago fraccionado IRPF estimación directa)',
    hasContent: true,
  },

  {
    slug: 'calculadora-modelo-131',
    component: 'CalculadoraModelo131',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del Modelo 131 (pago fraccionado IRPF módulos)',
    description: 'Calculadora del Modelo 131 (pago fraccionado IRPF módulos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-impuesto-actividades-economicas',
    component: 'CalculadoraImpuestoActividadesEconomicas',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora del Impuesto de Actividades Económicas (IAE)',
    description: 'Calculadora del Impuesto de Actividades Económicas (IAE)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasa-solidaridad',
    component: 'CalculadoraTasaSolidaridad',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Tasa de Solidaridad para grandes fortunas',
    description: 'Calculadora de la Tasa de Solidaridad para grandes fortunas',
    hasContent: true,
  },

  {
    slug: 'calculadora-deduccion-maternidad',
    component: 'CalculadoraDeduccionMaternidad',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Deducción por Maternidad (y gastos de guardería)',
    description: 'Calculadora de la Deducción por Maternidad (y gastos de guardería)',
    hasContent: true,
  },

  {
    slug: 'calculadora-deduccion-familia-numerosa',
    component: 'CalculadoraDeduccionFamiliaNumerosa',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Deducción por Familia Numerosa',
    description: 'Calculadora de la Deducción por Familia Numerosa',
    hasContent: true,
  },

  {
    slug: 'calculadora-deduccion-ascendiente-discapacidad',
    component: 'CalculadoraDeduccionAscendienteDiscapacidad',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Deducción por Ascendiente con Discapacidad a Cargo',
    description: 'Calculadora de la Deducción por Ascendiente con Discapacidad a Cargo',
    hasContent: true,
  },

  {
    slug: 'calculadora-deduccion-conyuge-discapacidad',
    component: 'CalculadoraDeduccionConyugeDiscapacidad',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Deducción por Cónyuge con Discapacidad a Cargo',
    description: 'Calculadora de la Deducción por Cónyuge con Discapacidad a Cargo',
    hasContent: true,
  },

  {
    slug: 'calculadora-deduccion-eficiencia-energetica',
    component: 'CalculadoraDeduccionEficienciaEnergetica',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Deducción por Obras de Mejora de Eficiencia Energética',
    description: 'Calculadora de la Deducción por Obras de Mejora de Eficiencia Energética',
    hasContent: true,
  },

  {
    slug: 'calculadora-deduccion-vehiculos-electricos',
    component: 'CalculadoraDeduccionVehiculosElectricos',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Deducción por Adquisición de Vehículos Eléctricos',
    description: 'Calculadora de la Deducción por Adquisición de Vehículos Eléctricos',
    hasContent: true,
  },

  {
    slug: 'calculadora-deduccion-donativos',
    component: 'CalculadoraDeduccionDonativos',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Deducción por Donativos a Entidades Benéficas',
    description: 'Calculadora de la Deducción por Donativos a Entidades Benéficas',
    hasContent: true,
  },

  {
    slug: 'calculadora-deduccion-partidos-sindicatos',
    component: 'CalculadoraDeduccionPartidosSindicatos',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Deducción por Afiliación a Partidos Políticos/Sindicatos',
    description: 'Calculadora de la Deducción por Afiliación a Partidos Políticos/Sindicatos',
    hasContent: true,
  },

  {
    slug: 'calculadora-declaracion-complementaria',
    component: 'CalculadoraDeclaracionComplementaria',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la "Declaración Complementaria" (cuánto pagar de más)',
    description: 'Calculadora de la "Declaración Complementaria" (cuánto pagar de más)',
    hasContent: true,
  },

  {
    slug: 'calculadora-rectificacion-renta',
    component: 'CalculadoraRectificacionRenta',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Solicitud de Rectificación (cuánto te devolverán)',
    description: 'Calculadora de la Solicitud de Rectificación (cuánto te devolverán)',
    hasContent: true,
  },

  {
    slug: 'calculadora-intereses-demora-hacienda',
    component: 'CalculadoraInteresesDemoraHacienda',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de los Intereses de Demora de Hacienda',
    description: 'Calculadora de los Intereses de Demora de Hacienda',
    hasContent: true,
  },

  {
    slug: 'calculadora-sanciones-hacienda',
    component: 'CalculadoraSancionesHacienda',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de las Sanciones de Hacienda (reducciones por pronto pago)',
    description: 'Calculadora de las Sanciones de Hacienda (reducciones por pronto pago)',
    hasContent: true,
  },

  {
    slug: 'calculadora-devolucion-plusvalia-muerto',
    component: 'CalculadoraDevolucionPlusvaliaMuerto',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Devolución de la "Plusvalía del Muerto"',
    description: 'Calculadora de la Devolución de la "Plusvalía del Muerto"',
    hasContent: true,
  },

  {
    slug: 'calculadora-devolucion-prestacion-maternidad',
    component: 'CalculadoraDevolucionPrestacionMaternidad',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Devolución de la Prestación por Maternidad/Paternidad del IRPF',
    description: 'Calculadora de la Devolución de la Prestación por Maternidad/Paternidad del IRPF',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-venta-farmacia',
    component: 'CalculadoraFiscalidadVentaFarmacia',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de la Venta de una Farmacia',
    description: 'Calculadora de la Fiscalidad de la Venta de una Farmacia',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-venta-loterias',
    component: 'CalculadoraFiscalidadVentaLoterias',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de la Venta de una Administración de Loterías',
    description: 'Calculadora de la Fiscalidad de la Venta de una Administración de Loterías',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-venta-estanco',
    component: 'CalculadoraFiscalidadVentaEstanco',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de la Venta de un Estanco',
    description: 'Calculadora de la Fiscalidad de la Venta de un Estanco',
    hasContent: true,
  },

  {
    slug: 'calculadora-fiscalidad-venta-licencia-taxi',
    component: 'CalculadoraFiscalidadVentaLicenciaTaxi',
    category: 'impuestos-y-trabajo-autónomo',
    lang: 'es',
    title: 'Calculadora de la Fiscalidad de la Venta de una Licencia de Taxi',
    description: 'Calculadora de la Fiscalidad de la Venta de una Licencia de Taxi',
    hasContent: true,
  },

  {
    slug: 'calculadora-rentabilidad-coliving',
    component: 'CalculadoraRentabilidadColiving',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Rentabilidad de un "Coliving"',
    description: 'Calculadora de la Rentabilidad de un "Coliving"',
    hasContent: true,
  },

  {
    slug: 'calculadora-rentabilidad-coworking',
    component: 'CalculadoraRentabilidadCoworking',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Rentabilidad de un "Coworking"',
    description: 'Calculadora de la Rentabilidad de un "Coworking"',
    hasContent: true,
  },

  {
    slug: 'calculadora-rentabilidad-alquiler-habitaciones',
    component: 'CalculadoraRentabilidadAlquilerHabitaciones',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Rentabilidad de un Alquiler por Habitaciones',
    description: 'Calculadora de la Rentabilidad de un Alquiler por Habitaciones',
    hasContent: true,
  },

  {
    slug: 'calculadora-rentabilidad-alquiler-temporada',
    component: 'CalculadoraRentabilidadAlquilerTemporada',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Rentabilidad de un Alquiler de Temporada (estudiantes, trabajadores)',
    description: 'Calculadora de la Rentabilidad de un Alquiler de Temporada (estudiantes, trabajadores)',
    hasContent: true,
  },

  {
    slug: 'calculadora-rentabilidad-build-to-rent',
    component: 'CalculadoraRentabilidadBuildToRent',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Rentabilidad de un "Build to Rent"',
    description: 'Calculadora de la Rentabilidad de un "Build to Rent"',
    hasContent: true,
  },

  {
    slug: 'calculadora-rentabilidad-flipping-houses',
    component: 'CalculadoraRentabilidadFlippingHouses',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Rentabilidad de una Inversión en "Flipping Houses"',
    description: 'Calculadora de la Rentabilidad de una Inversión en "Flipping Houses"',
    hasContent: true,
  },

  {
    slug: 'calculadora-rentabilidad-socimi',
    component: 'CalculadoraRentabilidadSocimi',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Rentabilidad de una SOCIMI (Sociedad Cotizada de Inversión Inmobiliaria)',
    description: 'Calculadora de la Rentabilidad de una SOCIMI (Sociedad Cotizada de Inversión Inmobiliaria)',
    hasContent: true,
  },

  {
    slug: 'calculadora-golden-visa-inmobiliaria',
    component: 'CalculadoraGoldenVisaInmobiliaria',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la "Golden Visa" por Inversión Inmobiliaria',
    description: 'Calculadora de la "Golden Visa" por Inversión Inmobiliaria',
    hasContent: true,
  },

  {
    slug: 'calculadora-hipoteca-inversa',
    component: 'CalculadoraHipotecaInversa',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Hipoteca Inversa',
    description: 'Calculadora de la Hipoteca Inversa',
    hasContent: true,
  },

  {
    slug: 'calculadora-hipoteca-puente',
    component: 'CalculadoraHipotecaPuente',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Hipoteca "Puente"',
    description: 'Calculadora de la Hipoteca "Puente"',
    hasContent: true,
  },

  {
    slug: 'calculadora-hipoteca-no-residentes',
    component: 'CalculadoraHipotecaNoResidentes',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Hipoteca para No Residentes',
    description: 'Calculadora de la Hipoteca para No Residentes',
    hasContent: true,
  },

  {
    slug: 'calculadora-hipoteca-autoconstruccion',
    component: 'CalculadoraHipotecaAutoconstruccion',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Hipoteca para Autoconstrucción',
    description: 'Calculadora de la Hipoteca para Autoconstrucción',
    hasContent: true,
  },

  {
    slug: 'calculadora-subrogacion-hipoteca',
    component: 'CalculadoraSubrogacionHipoteca',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Subrogación de Hipoteca',
    description: 'Calculadora de la Subrogación de Hipoteca',
    hasContent: true,
  },

  {
    slug: 'calculadora-novacion-hipoteca',
    component: 'CalculadoraNovacionHipoteca',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Novación de Hipoteca',
    description: 'Calculadora de la Novación de Hipoteca',
    hasContent: true,
  },

  {
    slug: 'calculadora-cancelacion-hipoteca',
    component: 'CalculadoraCancelacionHipoteca',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Cancelación Registral de Hipoteca',
    description: 'Calculadora de la Cancelación Registral de Hipoteca',
    hasContent: true,
  },

  {
    slug: 'calculadora-clausula-suelo',
    component: 'CalculadoraClausulaSuelo',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Cláusula Suelo (cuánto te deben devolver)',
    description: 'Calculadora de la Cláusula Suelo (cuánto te deben devolver)',
    hasContent: true,
  },

  {
    slug: 'calculadora-gastos-hipotecarios',
    component: 'CalculadoraGastosHipotecarios',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de los Gastos Hipotecarios (cuánto te deben devolver)',
    description: 'Calculadora de los Gastos Hipotecarios (cuánto te deben devolver)',
    hasContent: true,
  },

  {
    slug: 'calculadora-irph',
    component: 'CalculadoraIrph',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del IRPH (cuánto te deben devolver)',
    description: 'Calculadora del IRPH (cuánto te deben devolver)',
    hasContent: true,
  },

  {
    slug: 'calculadora-dacion-en-pago',
    component: 'CalculadoraDacionEnPago',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la Dación en Pago',
    description: 'Calculadora de la Dación en Pago',
    hasContent: true,
  },

  {
    slug: 'calculadora-leasing-inmobiliario',
    component: 'CalculadoraLeasingInmobiliario',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Leasing" Inmobiliario',
    description: 'Calculadora del "Leasing" Inmobiliario',
    hasContent: true,
  },

  {
    slug: 'calculadora-lease-back-inmobiliario',
    component: 'CalculadoraLeaseBackInmobiliario',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Lease-Back" Inmobiliario',
    description: 'Calculadora del "Lease-Back" Inmobiliario',
    hasContent: true,
  },

  {
    slug: 'calculadora-usufructo-nuda-propiedad',
    component: 'CalculadoraUsufructoNudaPropiedad',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Usufructo" vs. "Nuda Propiedad"',
    description: 'Calculadora del "Usufructo" vs. "Nuda Propiedad"',
    hasContent: true,
  },

  {
    slug: 'calculadora-derecho-tanteo-retracto',
    component: 'CalculadoraDerechoTanteoRetracto',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Derecho de Tanteo y Retracto"',
    description: 'Calculadora del "Derecho de Tanteo y Retracto"',
    hasContent: true,
  },

  {
    slug: 'calculadora-contrato-arras',
    component: 'CalculadoraContratoArras',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Contrato de Arras" (penitenciales, confirmatorias, penales)',
    description: 'Calculadora del "Contrato de Arras" (penitenciales, confirmatorias, penales)',
    hasContent: true,
  },

  {
    slug: 'calculadora-aval-alquiler',
    component: 'CalculadoraAvalAlquiler',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Aval" Bancario para Alquiler',
    description: 'Calculadora del "Aval" Bancario para Alquiler',
    hasContent: true,
  },

  {
    slug: 'calculadora-seguro-impago-alquiler',
    component: 'CalculadoraSeguroImpagoAlquiler',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Seguro de Impago de Alquiler',
    description: 'Calculadora del Seguro de Impago de Alquiler',
    hasContent: true,
  },

  {
    slug: 'calculadora-seguro-hogar',
    component: 'CalculadoraSeguroHogar',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Seguro de Hogar (continente y contenido)',
    description: 'Calculadora del Seguro de Hogar (continente y contenido)',
    hasContent: true,
  },

  {
    slug: 'calculadora-seguro-decenal',
    component: 'CalculadoraSeguroDecenal',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Seguro Decenal para Obra Nueva',
    description: 'Calculadora del Seguro Decenal para Obra Nueva',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-cedula-habitabilidad',
    component: 'CalculadoraCosteCedulaHabitabilidad',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de una "Cédula de Habitabilidad" por C.A.',
    description: 'Calculadora del Coste de una "Cédula de Habitabilidad" por C.A.',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-certificado-energetico',
    component: 'CalculadoraCosteCertificadoEnergetico',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de un "Certificado Energético" por C.A.',
    description: 'Calculadora del Coste de un "Certificado Energético" por C.A.',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-ite',
    component: 'CalculadoraCosteIte',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de una "Inspección Técnica de Edificios" (ITE)',
    description: 'Calculadora del Coste de una "Inspección Técnica de Edificios" (ITE)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-tasacion',
    component: 'CalculadoraCosteTasacion',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de una "Tasación" Inmobiliaria',
    description: 'Calculadora del Coste de una "Tasación" Inmobiliaria',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-topografico',
    component: 'CalculadoraCosteTopografico',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de un "Levantamiento Topográfico"',
    description: 'Calculadora del Coste de un "Levantamiento Topográfico"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-geotecnico',
    component: 'CalculadoraCosteGeotecnico',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de un "Estudio Geotécnico"',
    description: 'Calculadora del Coste de un "Estudio Geotécnico"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-proyecto-arquitectura',
    component: 'CalculadoraCosteProyectoArquitectura',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de un "Proyecto de Arquitectura"',
    description: 'Calculadora del Coste de un "Proyecto de Arquitectura"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-licencia-obras',
    component: 'CalculadoraCosteLicenciaObras',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de una "Licencia de Obras"',
    description: 'Calculadora del Coste de una "Licencia de Obras"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-obra-nueva',
    component: 'CalculadoraCosteObraNueva',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de una "Declaración de Obra Nueva"',
    description: 'Calculadora del Coste de una "Declaración de Obra Nueva"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-division-horizontal',
    component: 'CalculadoraCosteDivisionHorizontal',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de una "División Horizontal"',
    description: 'Calculadora del Coste de una "División Horizontal"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-agregacion-segregacion',
    component: 'CalculadoraCosteAgregacionSegregacion',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de una "Agregación/Segregación" de Fincas',
    description: 'Calculadora del Coste de una "Agregación/Segregación" de Fincas',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-inmatricular-finca',
    component: 'CalculadoraCosteInmatricularFinca',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de "Inmatricular" una Finca',
    description: 'Calculadora del Coste de "Inmatricular" una Finca',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-georreferenciar-finca',
    component: 'CalculadoraCosteGeorreferenciarFinca',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de "Georreferenciar" una Finca',
    description: 'Calculadora del Coste de "Georreferenciar" una Finca',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-alta-suministros',
    component: 'CalculadoraCosteAltaSuministros',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de "Dar de Alta" los Suministros (agua, luz, gas)',
    description: 'Calculadora del Coste de "Dar de Alta" los Suministros (agua, luz, gas)',
    hasContent: true,
  },

  {
    slug: 'calculadora-bono-social-electrico',
    component: 'CalculadoraBonoSocialElectrico',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Bono Social" Eléctrico',
    description: 'Calculadora del "Bono Social" Eléctrico',
    hasContent: true,
  },

  {
    slug: 'calculadora-bono-social-termico',
    component: 'CalculadoraBonoSocialTermico',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Bono Social" Térmico',
    description: 'Calculadora del "Bono Social" Térmico',
    hasContent: true,
  },

  {
    slug: 'calculadora-plan-renove-electrodomesticos',
    component: 'CalculadoraPlanRenoveElectrodomesticos',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Plan Renove" de Electrodomésticos por C.A.',
    description: 'Calculadora del "Plan Renove" de Electrodomésticos por C.A.',
    hasContent: true,
  },

  {
    slug: 'calculadora-plan-renove-ventanas',
    component: 'CalculadoraPlanRenoveVentanas',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Plan Renove" de Ventanas por C.A.',
    description: 'Calculadora del "Plan Renove" de Ventanas por C.A.',
    hasContent: true,
  },

  {
    slug: 'calculadora-plan-renove-calderas',
    component: 'CalculadoraPlanRenoveCalderas',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del "Plan Renove" de Calderas por C.A.',
    description: 'Calculadora del "Plan Renove" de Calderas por C.A.',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-comunidad-propietarios',
    component: 'CalculadoraCosteComunidadPropietarios',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de una "Comunidad de Propietarios"',
    description: 'Calculadora del Coste de una "Comunidad de Propietarios"',
    hasContent: true,
  },

  {
    slug: 'calculadora-derrama-comunidad',
    component: 'CalculadoraDerramaComunidad',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora de la "Derrama" de una Comunidad',
    description: 'Calculadora de la "Derrama" de una Comunidad',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-desahucio',
    component: 'CalculadoraCosteDesahucio',
    category: 'bienes-raices-y-vivienda',
    lang: 'es',
    title: 'Calculadora del Coste de un "Desahucio"',
    description: 'Calculadora del Coste de un "Desahucio"',
    hasContent: true,
  },

  {
    slug: 'calculadora-tarifa-plana-cooperativas',
    component: 'CalculadoraTarifaPlanaCooperativas',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Tarifa Plana" para Socios de Cooperativas',
    description: 'Calculadora de la "Tarifa Plana" para Socios de Cooperativas',
    hasContent: true,
  },

  {
    slug: 'calculadora-bonificacion-contratacion-familiares',
    component: 'CalculadoraBonificacionContratacionFamiliares',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la Bonificación por Contratación de Familiares',
    description: 'Calculadora de la Bonificación por Contratación de Familiares',
    hasContent: true,
  },

  {
    slug: 'calculadora-bonificacion-contratacion-discapacitados',
    component: 'CalculadoraBonificacionContratacionDiscapacitados',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la Bonificación por Contratación de Personas con Discapacidad',
    description: 'Calculadora de la Bonificación por Contratación de Personas con Discapacidad',
    hasContent: true,
  },

  {
    slug: 'calculadora-bonificacion-indefinidos',
    component: 'CalculadoraBonificacionIndefinidos',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la Bonificación por Transformación de Contratos Temporales en Indefinidos',
    description: 'Calculadora de la Bonificación por Transformación de Contratos Temporales en Indefinidos',
    hasContent: true,
  },

  {
    slug: 'calculadora-indemnizacion-despido',
    component: 'CalculadoraIndemnizacionDespido',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la Indemnización por Despido (improcedente, objetivo, colectivo)',
    description: 'Calculadora de la Indemnización por Despido (improcedente, objetivo, colectivo)',
    hasContent: true,
  },

  {
    slug: 'calculadora-finiquito',
    component: 'CalculadoraFiniquito',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del Finiquito',
    description: 'Calculadora del Finiquito',
    hasContent: true,
  },

  {
    slug: 'calculadora-smi',
    component: 'CalculadoraSmi',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del Salario Mínimo Interprofesional (SMI)',
    description: 'Calculadora del Salario Mínimo Interprofesional (SMI)',
    hasContent: true,
  },

  {
    slug: 'calculadora-horas-extra',
    component: 'CalculadoraHorasExtra',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de las Horas Extra',
    description: 'Calculadora de las Horas Extra',
    hasContent: true,
  },

  {
    slug: 'calculadora-vacaciones-no-disfrutadas',
    component: 'CalculadoraVacacionesNoDisfrutadas',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de las Vacaciones No Disfrutadas',
    description: 'Calculadora de las Vacaciones No Disfrutadas',
    hasContent: true,
  },

  {
    slug: 'calculadora-incapacidad-temporal',
    component: 'CalculadoraIncapacidadTemporal',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la Incapacidad Temporal (baja por enfermedad)',
    description: 'Calculadora de la Incapacidad Temporal (baja por enfermedad)',
    hasContent: true,
  },

  {
    slug: 'calculadora-prestacion-maternidad',
    component: 'CalculadoraPrestacionMaternidad',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la Prestación por Maternidad/Paternidad',
    description: 'Calculadora de la Prestación por Maternidad/Paternidad',
    hasContent: true,
  },

  {
    slug: 'calculadora-reduccion-jornada',
    component: 'CalculadoraReduccionJornada',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la Reducción de Jornada por Cuidado de Hijos',
    description: 'Calculadora de la Reducción de Jornada por Cuidado de Hijos',
    hasContent: true,
  },

  {
    slug: 'calculadora-excedencia-voluntaria',
    component: 'CalculadoraExcedenciaVoluntaria',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la Excedencia Voluntaria',
    description: 'Calculadora de la Excedencia Voluntaria',
    hasContent: true,
  },

  {
    slug: 'calculadora-fogasa',
    component: 'CalculadoraFogasa',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Fogasa" (Fondo de Garantía Salarial)',
    description: 'Calculadora del "Fogasa" (Fondo de Garantía Salarial)',
    hasContent: true,
  },

  {
    slug: 'calculadora-concurso-acreedores',
    component: 'CalculadoraConcursoAcreedores',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Concurso de Acreedores" (simplificado)',
    description: 'Calculadora del "Concurso de Acreedores" (simplificado)',
    hasContent: true,
  },

  {
    slug: 'calculadora-segunda-oportunidad-empresas',
    component: 'CalculadoraSegundaOportunidadEmpresas',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Mecanismo de Segunda Oportunidad" para empresas',
    description: 'Calculadora del "Mecanismo de Segunda Oportunidad" para empresas',
    hasContent: true,
  },

  {
    slug: 'calculadora-kit-digital',
    component: 'CalculadoraKitDigital',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Kit Digital" (ayudas a la digitalización)',
    description: 'Calculadora del "Kit Digital" (ayudas a la digitalización)',
    hasContent: true,
  },

  {
    slug: 'calculadora-propiedad-industrial',
    component: 'CalculadoraPropiedadIndustrial',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Propiedad Industrial" (registro de marcas, patentes)',
    description: 'Calculadora de la "Propiedad Industrial" (registro de marcas, patentes)',
    hasContent: true,
  },

  {
    slug: 'calculadora-propiedad-intelectual',
    component: 'CalculadoraPropiedadIntelectual',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Propiedad Intelectual" (derechos de autor)',
    description: 'Calculadora de la "Propiedad Intelectual" (derechos de autor)',
    hasContent: true,
  },

  {
    slug: 'calculadora-lopd-rgpd',
    component: 'CalculadoraLopdRgpd',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Ley de Protección de Datos" (LOPD/RGPD) - coste de adaptación',
    description: 'Calculadora de la "Ley de Protección de Datos" (LOPD/RGPD) - coste de adaptación',
    hasContent: true,
  },

  {
    slug: 'calculadora-prl-coste',
    component: 'CalculadoraPrlCoste',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Prevención de Riesgos Laborales" (PRL) - coste de adaptación',
    description: 'Calculadora de la "Prevención de Riesgos Laborales" (PRL) - coste de adaptación',
    hasContent: true,
  },

  {
    slug: 'calculadora-registro-jornada-empresa',
    component: 'CalculadoraRegistroJornadaEmpresa',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Registro de Jornada" - coste de implementación',
    description: 'Calculadora del "Registro de Jornada" - coste de implementación',
    hasContent: true,
  },

  {
    slug: 'calculadora-canal-denuncias',
    component: 'CalculadoraCanalDenuncias',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Canal de Denuncias" - coste de implementación',
    description: 'Calculadora del "Canal de Denuncias" - coste de implementación',
    hasContent: true,
  },

  {
    slug: 'calculadora-plan-igualdad',
    component: 'CalculadoraPlanIgualdad',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Plan de Igualdad" - coste de implementación',
    description: 'Calculadora del "Plan de Igualdad" - coste de implementación',
    hasContent: true,
  },

  {
    slug: 'calculadora-huella-carbono-empresa',
    component: 'CalculadoraHuellaCarbonoEmpresa',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Huella de Carbono" de una empresa',
    description: 'Calculadora de la "Huella de Carbono" de una empresa',
    hasContent: true,
  },

  {
    slug: 'calculadora-rsc-presupuesto',
    component: 'CalculadoraRscPresupuesto',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Responsabilidad Social Corporativa" (RSC) - presupuesto',
    description: 'Calculadora de la "Responsabilidad Social Corporativa" (RSC) - presupuesto',
    hasContent: true,
  },

  {
    slug: 'calculadora-factoring-confirming',
    component: 'CalculadoraFactoringConfirming',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Factoring" y "Confirming"',
    description: 'Calculadora del "Factoring" y "Confirming"',
    hasContent: true,
  },

  {
    slug: 'calculadora-poliza-credito',
    component: 'CalculadoraPolizaCredito',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Póliza de Crédito"',
    description: 'Calculadora de la "Póliza de Crédito"',
    hasContent: true,
  },

  {
    slug: 'calculadora-prestamo-ico',
    component: 'CalculadoraPrestamoIco',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Préstamo ICO"',
    description: 'Calculadora del "Préstamo ICO"',
    hasContent: true,
  },

  {
    slug: 'calculadora-leasing-maquinaria',
    component: 'CalculadoraLeasingMaquinaria',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Leasing" de Maquinaria',
    description: 'Calculadora del "Leasing" de Maquinaria',
    hasContent: true,
  },

  {
    slug: 'calculadora-renting-equipos',
    component: 'CalculadoraRentingEquipos',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Renting" de Equipos Informáticos',
    description: 'Calculadora del "Renting" de Equipos Informáticos',
    hasContent: true,
  },

  {
    slug: 'calculadora-cash-flow',
    component: 'CalculadoraCashFlow',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Cash Flow" de un proyecto',
    description: 'Calculadora del "Cash Flow" de un proyecto',
    hasContent: true,
  },

  {
    slug: 'calculadora-van',
    component: 'CalculadoraVan',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "VAN" (Valor Actual Neto) de un proyecto',
    description: 'Calculadora del "VAN" (Valor Actual Neto) de un proyecto',
    hasContent: true,
  },

  {
    slug: 'calculadora-payback',
    component: 'CalculadoraPayback',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Payback" de una inversión',
    description: 'Calculadora del "Payback" de una inversión',
    hasContent: true,
  },

  {
    slug: 'calculadora-fondo-maniobra',
    component: 'CalculadoraFondoManiobra',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Fondo de Maniobra"',
    description: 'Calculadora del "Fondo de Maniobra"',
    hasContent: true,
  },

  {
    slug: 'calculadora-ratio-endeudamiento',
    component: 'CalculadoraRatioEndeudamiento',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Ratio de Endeudamiento"',
    description: 'Calculadora del "Ratio de Endeudamiento"',
    hasContent: true,
  },

  {
    slug: 'calculadora-ratio-liquidez',
    component: 'CalculadoraRatioLiquidez',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Ratio de Liquidez"',
    description: 'Calculadora del "Ratio de Liquidez"',
    hasContent: true,
  },

  {
    slug: 'calculadora-ratio-solvencia',
    component: 'CalculadoraRatioSolvencia',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Ratio de Solvencia"',
    description: 'Calculadora del "Ratio de Solvencia"',
    hasContent: true,
  },

  {
    slug: 'calculadora-ratio-rentabilidad',
    component: 'CalculadoraRatioRentabilidad',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Ratio de Rentabilidad" (ROE, ROI, ROA)',
    description: 'Calculadora del "Ratio de Rentabilidad" (ROE, ROI, ROA)',
    hasContent: true,
  },

  {
    slug: 'calculadora-ebitda',
    component: 'CalculadoraEbitda',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "EBITDA"',
    description: 'Calculadora del "EBITDA"',
    hasContent: true,
  },

  {
    slug: 'calculadora-balance-simplificado',
    component: 'CalculadoraBalanceSimplificado',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Balance de Situación" (simplificado)',
    description: 'Calculadora del "Balance de Situación" (simplificado)',
    hasContent: true,
  },

  {
    slug: 'calculadora-perdidas-ganancias',
    component: 'CalculadoraPerdidasGanancias',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Cuenta de Pérdidas y Ganancias" (simplificada)',
    description: 'Calculadora de la "Cuenta de Pérdidas y Ganancias" (simplificada)',
    hasContent: true,
  },

  {
    slug: 'calculadora-impuesto-sociedades-cooperativas',
    component: 'CalculadoraImpuestoSociedadesCooperativas',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Impuesto de Sociedades" para Cooperativas',
    description: 'Calculadora del "Impuesto de Sociedades" para Cooperativas',
    hasContent: true,
  },

  {
    slug: 'calculadora-impuesto-sociedades-fundaciones',
    component: 'CalculadoraImpuestoSociedadesFundaciones',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Impuesto de Sociedades" para Fundaciones/Asociaciones',
    description: 'Calculadora del "Impuesto de Sociedades" para Fundaciones/Asociaciones',
    hasContent: true,
  },

  {
    slug: 'calculadora-impuesto-sociedades-etve',
    component: 'CalculadoraImpuestoSociedadesEtve',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Impuesto de Sociedades" para Entidades de Tenencia de Valores Extranjeros (ETVE)',
    description: 'Calculadora del "Impuesto de Sociedades" para Entidades de Tenencia de Valores Extranjeros (ETVE)',
    hasContent: true,
  },

  {
    slug: 'calculadora-regimen-consolidacion-fiscal',
    component: 'CalculadoraRegimenConsolidacionFiscal',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora del "Régimen de Consolidación Fiscal"',
    description: 'Calculadora del "Régimen de Consolidación Fiscal"',
    hasContent: true,
  },

  {
    slug: 'calculadora-tributacion-canarias-igic-zec',
    component: 'CalculadoraTributacionCanariasIgicZec',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Tributación en Canarias" (IGIC, ZEC)',
    description: 'Calculadora de la "Tributación en Canarias" (IGIC, ZEC)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tributacion-ceuta-melilla-ipsi',
    component: 'CalculadoraTributacionCeutaMelillaIpsi',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Tributación en Ceuta y Melilla" (IPSI)',
    description: 'Calculadora de la "Tributación en Ceuta y Melilla" (IPSI)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tributacion-navarra-pais-vasco',
    component: 'CalculadoraTributacionNavarraPaisVasco',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Tributación en Navarra y País Vasco" (convenio/concierto económico)',
    description: 'Calculadora de la "Tributación en Navarra y País Vasco" (convenio/concierto económico)',
    hasContent: true,
  },

  {
    slug: 'calculadora-doble-imposicion-internacional',
    component: 'CalculadoraDobleImposicionInternacional',
    category: 'pymes-y-empresas',
    lang: 'es',
    title: 'Calculadora de la "Doble Imposición" internacional',
    description: 'Calculadora de la "Doble Imposición" internacional',
    hasContent: true,
  },

  {
    slug: 'calculadora-impuesto-matriculacion',
    component: 'CalculadoraImpuestoMatriculacion',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Impuesto de Matriculación',
    description: 'Calculadora del Impuesto de Matriculación',
    hasContent: true,
  },

  {
    slug: 'calculadora-etiqueta-medioambiental-dgt',
    component: 'CalculadoraEtiquetaMedioambientalDgt',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora de la Etiqueta Medioambiental de la DGT',
    description: 'Calculadora de la Etiqueta Medioambiental de la DGT',
    hasContent: true,
  },

  {
    slug: 'calculadora-restricciones-zbe',
    component: 'CalculadoraRestriccionesZbe',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora de las Restricciones de Tráfico por ZBE (Zonas de Bajas Emisiones)',
    description: 'Calculadora de las Restricciones de Tráfico por ZBE (Zonas de Bajas Emisiones)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-swap-motor',
    component: 'CalculadoraCosteSwapMotor',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Swap" de motor',
    description: 'Calculadora del Coste de un "Swap" de motor',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-reprogramacion-centralita',
    component: 'CalculadoraCosteReprogramacionCentralita',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de una "Reprogramación" de centralita',
    description: 'Calculadora del Coste de una "Reprogramación" de centralita',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-homologacion-reformas-vehiculo',
    component: 'CalculadoraCosteHomologacionReformasVehiculo',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de una "Homologación" de reformas en vehículo',
    description: 'Calculadora del Coste de una "Homologación" de reformas en vehículo',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-wrapping-coche',
    component: 'CalculadoraCosteWrappingCoche',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Wrapping" de coche',
    description: 'Calculadora del Coste de un "Wrapping" de coche',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-detailing-coche',
    component: 'CalculadoraCosteDetailingCoche',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Detailing" de coche',
    description: 'Calculadora del Coste de un "Detailing" de coche',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-neumatico-por-km',
    component: 'CalculadoraCosteNeumaticoPorKm',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Neumático" (por km)',
    description: 'Calculadora del Coste de un "Neumático" (por km)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-seguro-por-dias',
    component: 'CalculadoraCosteSeguroPorDias',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Seguro por Días"',
    description: 'Calculadora del Coste de un "Seguro por Días"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-seguro-coche-clasico',
    component: 'CalculadoraCosteSeguroCocheClasico',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Seguro de Coche Clásico"',
    description: 'Calculadora del Coste de un "Seguro de Coche Clásico"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-alquiler-coche',
    component: 'CalculadoraCosteAlquilerCoche',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Alquiler de Coche" (con/sin franquicia)',
    description: 'Calculadora del Coste de un "Alquiler de Coche" (con/sin franquicia)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-blablacar',
    component: 'CalculadoraCosteBlablacar',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Viaje en BlaBlaCar" (conductor/pasajero)',
    description: 'Calculadora del Coste de un "Viaje en BlaBlaCar" (conductor/pasajero)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-peaje-autopista',
    component: 'CalculadoraCostePeajeAutopista',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Peaje" en autopista',
    description: 'Calculadora del Coste de un "Peaje" en autopista',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-parking',
    component: 'CalculadoraCosteParking',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Parking" (aeropuerto, estación)',
    description: 'Calculadora del Coste de un "Parking" (aeropuerto, estación)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-tarjeta-transporte',
    component: 'CalculadoraCosteTarjetaTransporte',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de una "Tarjeta de Transporte" por ciudad',
    description: 'Calculadora del Coste de una "Tarjeta de Transporte" por ciudad',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-abono-renfe',
    component: 'CalculadoraCosteAbonoRenfe',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Abono Renfe" (Cercanías, Media Distancia)',
    description: 'Calculadora del Coste de un "Abono Renfe" (Cercanías, Media Distancia)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-ave',
    component: 'CalculadoraCosteAve',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "AVE" (con descuentos)',
    description: 'Calculadora del Coste de un "AVE" (con descuentos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-vuelo-low-cost',
    component: 'CalculadoraCosteVueloLowCost',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Vuelo Low Cost" (con extras)',
    description: 'Calculadora del Coste de un "Vuelo Low Cost" (con extras)',
    hasContent: true,
  },

  {
    slug: 'calculadora-compensacion-vuelo',
    component: 'CalculadoraCompensacionVuelo',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora de la "Compensación por Retraso/Cancelación" de vuelo',
    description: 'Calculadora de la "Compensación por Retraso/Cancelación" de vuelo',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-ferry-islas',
    component: 'CalculadoraCosteFerryIslas',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Ferry" a las islas (con/sin coche)',
    description: 'Calculadora del Coste de un "Ferry" a las islas (con/sin coche)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-carnet-moto',
    component: 'CalculadoraCosteCarnetMoto',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Carnet de Moto" (A1, A2, A)',
    description: 'Calculadora del Coste de un "Carnet de Moto" (A1, A2, A)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-seguro-moto',
    component: 'CalculadoraCosteSeguroMoto',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Seguro de Moto"',
    description: 'Calculadora del Coste de un "Seguro de Moto"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-carnet-camion-autobus',
    component: 'CalculadoraCosteCarnetCamionAutobus',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Carnet de Camión/Autobús" (C, D)',
    description: 'Calculadora del Coste de un "Carnet de Camión/Autobús" (C, D)',
    hasContent: true,
  },

  {
    slug: 'calculadora-cap',
    component: 'CalculadoraCap',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del "CAP" (Certificado de Aptitud Profesional)',
    description: 'Calculadora del "CAP" (Certificado de Aptitud Profesional)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tacografo-digital',
    component: 'CalculadoraTacografoDigital',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del "Tacógrafo Digital" (tiempos de conducción y descanso)',
    description: 'Calculadora del "Tacógrafo Digital" (tiempos de conducción y descanso)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-furgoneta-camper',
    component: 'CalculadoraCosteFurgonetaCamper',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de una "Furgoneta Camper" (compra vs. camperización)',
    description: 'Calculadora del Coste de una "Furgoneta Camper" (compra vs. camperización)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-amarre-barco',
    component: 'CalculadoraCosteAmarreBarco',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de un "Amarre" para barco',
    description: 'Calculadora del Coste de un "Amarre" para barco',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-licencia-navegacion',
    component: 'CalculadoraCosteLicenciaNavegacion',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de una "Licencia de Navegación"',
    description: 'Calculadora del Coste de una "Licencia de Navegación"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-licencia-piloto-dron',
    component: 'CalculadoraCosteLicenciaPilotoDron',
    category: 'automóviles-y-transporte',
    lang: 'es',
    title: 'Calculadora del Coste de una "Licencia de Piloto" de dron',
    description: 'Calculadora del Coste de una "Licencia de Piloto" de dron',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasas-universitarias-ca',
    component: 'CalculadoraTasasUniversitariasCa',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora de las Tasas Universitarias por Comunidad Autónoma',
    description: 'Calculadora de las Tasas Universitarias por Comunidad Autónoma',
    hasContent: true,
  },

  {
    slug: 'calculadora-beca-mec',
    component: 'CalculadoraBecaMec',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora de la Beca MEC (cuantía fija y variable)',
    description: 'Calculadora de la Beca MEC (cuantía fija y variable)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-master-oficial',
    component: 'CalculadoraCosteMasterOficial',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora del Coste de un Máster Oficial vs. Título Propio',
    description: 'Calculadora del Coste de un Máster Oficial vs. Título Propio',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-doctorado',
    component: 'CalculadoraCosteDoctorado',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora del Coste de un Doctorado',
    description: 'Calculadora del Coste de un Doctorado',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-residencia-estudiantes',
    component: 'CalculadoraCosteResidenciaEstudiantes',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora del Coste de una Residencia de Estudiantes vs. Piso Compartido',
    description: 'Calculadora del Coste de una Residencia de Estudiantes vs. Piso Compartido',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-ebau-selectividad',
    component: 'CalculadoraCosteEbauSelectividad',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora del Coste de la EBAU/Selectividad',
    description: 'Calculadora del Coste de la EBAU/Selectividad',
    hasContent: true,
  },

  {
    slug: 'calculadora-nota-corte-carrera',
    component: 'CalculadoraNotaCorteCarrera',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora de la Nota de Corte para una Carrera',
    description: 'Calculadora de la Nota de Corte para una Carrera',
    hasContent: true,
  },

  {
    slug: 'calculadora-ponderacion-ebau',
    component: 'CalculadoraPonderacionEbau',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora de la Ponderación de Asignaturas en la EBAU',
    description: 'Calculadora de la Ponderación de Asignaturas en la EBAU',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-colegio-privado',
    component: 'CalculadoraCosteColegioPrivado',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora del Coste de un Colegio Privado/Concertado',
    description: 'Calculadora del Coste de un Colegio Privado/Concertado',
    hasContent: true,
  },

  {
    slug: 'calculadora-cheque-guarderia-ca',
    component: 'CalculadoraChequeGuarderiaCa',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora del "Cheque Guardería" por Comunidad Autónoma',
    description: 'Calculadora del "Cheque Guardería" por Comunidad Autónoma',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-oposiciones',
    component: 'CalculadoraCosteOposiciones',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora de las Oposiciones (coste de preparación, ratio de plazas)',
    description: 'Calculadora de las Oposiciones (coste de preparación, ratio de plazas)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-curso-idiomas-extranjero',
    component: 'CalculadoraCosteCursoIdiomasExtranjero',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora del Coste de un Curso de Idiomas en el Extranjero',
    description: 'Calculadora del Coste de un Curso de Idiomas en el Extranjero',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-gap-year',
    component: 'CalculadoraCosteGapYear',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora del Coste de un "Gap Year"',
    description: 'Calculadora del Coste de un "Gap Year"',
    hasContent: true,
  },

  {
    slug: 'calculadora-devolucion-tasas-matricula-honor',
    component: 'CalculadoraDevolucionTasasMatriculaHonor',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora de la Devolución de las Tasas Universitarias por Matrícula de Honor',
    description: 'Calculadora de la Devolución de las Tasas Universitarias por Matrícula de Honor',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-libros-texto',
    component: 'CalculadoraCosteLibrosTexto',
    category: 'educacion-y-universidad',
    lang: 'es',
    title: 'Calculadora del Coste de los Libros de Texto ("cheque-libro")',
    description: 'Calculadora del Coste de los Libros de Texto ("cheque-libro")',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-seguro-medico-privado',
    component: 'CalculadoraCosteSeguroMedicoPrivado',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de un Seguro Médico Privado (con/sin copago)',
    description: 'Calculadora del Coste de un Seguro Médico Privado (con/sin copago)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-tratamiento-fertilidad',
    component: 'CalculadoraCosteTratamientoFertilidad',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de un Tratamiento de Fertilidad (público vs. privado)',
    description: 'Calculadora del Coste de un Tratamiento de Fertilidad (público vs. privado)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-cirugia-estetica',
    component: 'CalculadoraCosteCirugiaEstetica',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de una Operación de Cirugía Estética',
    description: 'Calculadora del Coste de una Operación de Cirugía Estética',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-operacion-miopia',
    component: 'CalculadoraCosteOperacionMiopia',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de una Operación de Miopía',
    description: 'Calculadora del Coste de una Operación de Miopía',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-tratamiento-dental',
    component: 'CalculadoraCosteTratamientoDental',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de un Tratamiento Dental (ortodoncia, implantes)',
    description: 'Calculadora del Coste de un Tratamiento Dental (ortodoncia, implantes)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-psicologo',
    component: 'CalculadoraCostePsicologo',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de un Psicólogo (privado vs. seguridad social)',
    description: 'Calculadora del Coste de un Psicólogo (privado vs. seguridad social)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-fisioterapeuta',
    component: 'CalculadoraCosteFisioterapeuta',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de un Fisioterapeuta',
    description: 'Calculadora del Coste de un Fisioterapeuta',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-nutricionista',
    component: 'CalculadoraCosteNutricionista',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de un Nutricionista',
    description: 'Calculadora del Coste de un Nutricionista',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-entrenador-personal',
    component: 'CalculadoraCosteEntrenadorPersonal',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de un Entrenador Personal',
    description: 'Calculadora del Coste de un Entrenador Personal',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-gimnasio',
    component: 'CalculadoraCosteGimnasio',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de un Gimnasio',
    description: 'Calculadora del Coste de un Gimnasio',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-balneario-spa',
    component: 'CalculadoraCosteBalnearioSpa',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de un Balneario/Spa',
    description: 'Calculadora del Coste de un Balneario/Spa',
    hasContent: true,
  },

  {
    slug: 'calculadora-dieta-mediterranea-coste-semanal',
    component: 'CalculadoraDietaMediterraneaCosteSemanal',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora de la Dieta Mediterránea (coste semanal)',
    description: 'Calculadora de la Dieta Mediterránea (coste semanal)',
    hasContent: true,
  },

  {
    slug: 'calculadora-imc',
    component: 'CalculadoraImc',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Índice de Masa Corporal (IMC)',
    description: 'Calculadora del Índice de Masa Corporal (IMC)',
    hasContent: true,
  },

  {
    slug: 'calculadora-metabolismo-basal',
    component: 'CalculadoraMetabolismoBasal',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Metabolismo Basal (TMB)',
    description: 'Calculadora del Metabolismo Basal (TMB)',
    hasContent: true,
  },

  {
    slug: 'calculadora-gasto-energetico-total',
    component: 'CalculadoraGastoEnergeticoTotal',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Gasto Energético Total (GET)',
    description: 'Calculadora del Gasto Energético Total (GET)',
    hasContent: true,
  },

  {
    slug: 'calculadora-pasos-diarios',
    component: 'CalculadoraPasosDiarios',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora de los "Pasos" Diarios (distancia y calorías)',
    description: 'Calculadora de los "Pasos" Diarios (distancia y calorías)',
    hasContent: true,
  },

  {
    slug: 'calculadora-frecuencia-cardiaca-entrenamiento',
    component: 'CalculadoraFrecuenciaCardiacaEntrenamiento',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora de la Frecuencia Cardíaca de Entrenamiento',
    description: 'Calculadora de la Frecuencia Cardíaca de Entrenamiento',
    hasContent: true,
  },

  {
    slug: 'calculadora-riesgo-cardiovascular',
    component: 'CalculadoraRiesgoCardiovascular',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Riesgo Cardiovascular (SCORE)',
    description: 'Calculadora del Riesgo Cardiovascular (SCORE)',
    hasContent: true,
  },

  {
    slug: 'calculadora-donacion-sangre',
    component: 'CalculadoraDonacionSangre',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora de la Donación de Sangre (cuándo puedes volver a donar)',
    description: 'Calculadora de la Donación de Sangre (cuándo puedes volver a donar)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-lentillas-vs-gafas',
    component: 'CalculadoraCosteLentillasVsGafas',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de las Lentillas vs. Gafas',
    description: 'Calculadora del Coste de las Lentillas vs. Gafas',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-medicamentos',
    component: 'CalculadoraCosteMedicamentos',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Coste de los Medicamentos (con/sin receta)',
    description: 'Calculadora del Coste de los Medicamentos (con/sin receta)',
    hasContent: true,
  },

  {
    slug: 'calculadora-copago-farmaceutico',
    component: 'CalculadoraCopagoFarmaceutico',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del "Copago" Farmacéutico',
    description: 'Calculadora del "Copago" Farmacéutico',
    hasContent: true,
  },

  {
    slug: 'calculadora-prestacion-incapacidad-permanente',
    component: 'CalculadoraPrestacionIncapacidadPermanente',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora de la Prestación por Incapacidad Permanente',
    description: 'Calculadora de la Prestación por Incapacidad Permanente',
    hasContent: true,
  },

  {
    slug: 'calculadora-grado-discapacidad',
    component: 'CalculadoraGradoDiscapacidad',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora del Grado de Discapacidad',
    description: 'Calculadora del Grado de Discapacidad',
    hasContent: true,
  },

  {
    slug: 'calculadora-ley-dependencia',
    component: 'CalculadoraLeyDependencia',
    category: 'salud-y-bienestar',
    lang: 'es',
    title: 'Calculadora de la Ley de Dependencia (ayudas)',
    description: 'Calculadora de la Ley de Dependencia (ayudas)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasas-judiciales',
    component: 'CalculadoraTasasJudiciales',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de las Tasas Judiciales',
    description: 'Calculadora de las Tasas Judiciales',
    hasContent: true,
  },

  {
    slug: 'calculadora-honorarios-abogado',
    component: 'CalculadoraHonorariosAbogado',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de los Honorarios de Abogado (criterios orientadores)',
    description: 'Calculadora de los Honorarios de Abogado (criterios orientadores)',
    hasContent: true,
  }
,

  // Additional calculators from CSV (1101-1300)
  {
    slug: 'calculadora-honorarios-procurador',
    component: 'CalculadoraHonorariosProcurador',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de los Honorarios de Procurador',
    description: 'Calculadora de los Honorarios de Procurador',
    hasContent: true,
  },

  {
    slug: 'calculadora-jura-cuentas',
    component: 'CalculadoraJuraCuentas',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Jura de Cuentas"',
    description: 'Calculadora de la "Jura de Cuentas"',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasacion-costas',
    component: 'CalculadoraTasacionCostas',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Tasación de Costas"',
    description: 'Calculadora de la "Tasación de Costas"',
    hasContent: true,
  },

  {
    slug: 'calculadora-intereses-legales-demora',
    component: 'CalculadoraInteresesLegalesDemora',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de los Intereses Legales y de Demora',
    description: 'Calculadora de los Intereses Legales y de Demora',
    hasContent: true,
  },

  {
    slug: 'calculadora-actualizacion-rentas-ipc',
    component: 'CalculadoraActualizacionRentasIpc',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la Actualización de Rentas (IPC)',
    description: 'Calculadora de la Actualización de Rentas (IPC)',
    hasContent: true,
  },

  {
    slug: 'calculadora-indemnizacion-accidente-trafico',
    component: 'CalculadoraIndemnizacionAccidenteTrafico',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la Indemnización por Accidente de Tráfico (baremo)',
    description: 'Calculadora de la Indemnización por Accidente de Tráfico (baremo)',
    hasContent: true,
  },

  {
    slug: 'calculadora-prescripcion-deudas-delitos',
    component: 'CalculadoraPrescripcionDeudasDelitos',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la Prescripción de Deudas y Delitos',
    description: 'Calculadora de la Prescripción de Deudas y Delitos',
    hasContent: true,
  },

  {
    slug: 'calculadora-plazos-procesales',
    component: 'CalculadoraPlazosProcesales',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de los Plazos Procesales (días hábiles/naturales)',
    description: 'Calculadora de los Plazos Procesales (días hábiles/naturales)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-divorcio',
    component: 'CalculadoraCosteDivorcio',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de un Divorcio (mutuo acuerdo vs. contencioso)',
    description: 'Calculadora del Coste de un Divorcio (mutuo acuerdo vs. contencioso)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-herencia',
    component: 'CalculadoraCosteHerencia',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de una Herencia (notaría, registro, impuestos)',
    description: 'Calculadora del Coste de una Herencia (notaría, registro, impuestos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-testamento',
    component: 'CalculadoraCosteTestamento',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de un Testamento',
    description: 'Calculadora del Coste de un Testamento',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-donacion',
    component: 'CalculadoraCosteDonacion',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de una Donación',
    description: 'Calculadora del Coste de una Donación',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-constitucion-sociedad',
    component: 'CalculadoraCosteConstitucionSociedad',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de Constituir una Sociedad',
    description: 'Calculadora del Coste de Constituir una Sociedad',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-registro-marca-patente',
    component: 'CalculadoraCosteRegistroMarcaPatente',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de Registrar una Marca/Patente',
    description: 'Calculadora del Coste de Registrar una Marca/Patente',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-nota-simple-registro-propiedad',
    component: 'CalculadoraCosteNotaSimpleRegistroPropiedad',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de una "Nota Simple" del Registro de la Propiedad',
    description: 'Calculadora del Coste de una "Nota Simple" del Registro de la Propiedad',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-certificado-antecedentes-penales',
    component: 'CalculadoraCosteCertificadoAntecedentesPenales',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de un "Certificado de Antecedentes Penales"',
    description: 'Calculadora del Coste de un "Certificado de Antecedentes Penales"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-renovar-dni-pasaporte',
    component: 'CalculadoraCosteRenovarDniPasaporte',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de Renovar el DNI/Pasaporte',
    description: 'Calculadora del Coste de Renovar el DNI/Pasaporte',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-nacionalidad-espanola',
    component: 'CalculadoraCosteNacionalidadEspanola',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de la "Nacionalidad Española"',
    description: 'Calculadora del Coste de la "Nacionalidad Española"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-tarjeta-residencia-tie',
    component: 'CalculadoraCosteTarjetaResidenciaTie',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de la "Tarjeta de Residencia" (TIE)',
    description: 'Calculadora del Coste de la "Tarjeta de Residencia" (TIE)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-empadronarse',
    component: 'CalculadoraCosteEmpadronarse',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora del Coste de "Empadronarse"',
    description: 'Calculadora del Coste de "Empadronarse"',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasa-extranjeria',
    component: 'CalculadoraTasaExtranjeria',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Tasa de Extranjería"',
    description: 'Calculadora de la "Tasa de Extranjería"',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasa-trafico',
    component: 'CalculadoraTasaTrafico',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Tasa de Tráfico" (renovación carnet, transferencia)',
    description: 'Calculadora de la "Tasa de Tráfico" (renovación carnet, transferencia)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasa-modelo-790',
    component: 'CalculadoraTasaModelo790',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Tasa Modelo 790" (para diversos trámites)',
    description: 'Calculadora de la "Tasa Modelo 790" (para diversos trámites)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasa-basuras',
    component: 'CalculadoraTasaBasuras',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Tasa de Basuras" por municipio',
    description: 'Calculadora de la "Tasa de Basuras" por municipio',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasa-vado',
    component: 'CalculadoraTasaVado',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Tasa de Vado" por municipio',
    description: 'Calculadora de la "Tasa de Vado" por municipio',
    hasContent: true,
  },

  {
    slug: 'calculadora-tasa-ocupacion-via-publica',
    component: 'CalculadoraTasaOcupacionViaPublica',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Tasa por Ocupación de Vía Pública"',
    description: 'Calculadora de la "Tasa por Ocupación de Vía Pública"',
    hasContent: true,
  },

  {
    slug: 'calculadora-licencia-apertura-negocio',
    component: 'CalculadoraLicenciaAperturaNegocio',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Licencia de Apertura" de un negocio',
    description: 'Calculadora de la "Licencia de Apertura" de un negocio',
    hasContent: true,
  },

  {
    slug: 'calculadora-licencia-terraza-bar',
    component: 'CalculadoraLicenciaTerrazaBar',
    category: 'legal-y-administrativo',
    lang: 'es',
    title: 'Calculadora de la "Licencia de Terraza" para un bar',
    description: 'Calculadora de la "Licencia de Terraza" para un bar',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-boda-ca',
    component: 'CalculadoraCosteBodaCa',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de una Boda por Comunidad Autónoma',
    description: 'Calculadora del Coste de una Boda por Comunidad Autónoma',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-bautizo-comunion',
    component: 'CalculadoraCosteBautizoComunion',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un Bautizo/Comunión',
    description: 'Calculadora del Coste de un Bautizo/Comunión',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-fiesta-cumpleanos',
    component: 'CalculadoraCosteFiestaCumpleanos',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de una Fiesta de Cumpleaños',
    description: 'Calculadora del Coste de una Fiesta de Cumpleaños',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-viaje',
    component: 'CalculadoraCosteViaje',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un Viaje (vuelos, hotel, actividades)',
    description: 'Calculadora del Coste de un Viaje (vuelos, hotel, actividades)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-festival-musica',
    component: 'CalculadoraCosteFestivalMusica',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un Festival de Música',
    description: 'Calculadora del Coste de un Festival de Música',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-abono-futbol',
    component: 'CalculadoraCosteAbonoFutbol',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un Abono de Fútbol',
    description: 'Calculadora del Coste de un Abono de Fútbol',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-corrida-toros',
    component: 'CalculadoraCosteCorridaToros',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de una Corrida de Toros',
    description: 'Calculadora del Coste de una Corrida de Toros',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-tablao-flamenco',
    component: 'CalculadoraCosteTablaoFlamenco',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Tablao" Flamenco',
    description: 'Calculadora del Coste de un "Tablao" Flamenco',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-tomatina-bunol',
    component: 'CalculadoraCosteTomatinaBunol',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de la "Tomatina" de Buñol',
    description: 'Calculadora del Coste de la "Tomatina" de Buñol',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-sanfermines',
    component: 'CalculadoraCosteSanfermines',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de los "Sanfermines" de Pamplona',
    description: 'Calculadora del Coste de los "Sanfermines" de Pamplona',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-fallas-valencia',
    component: 'CalculadoraCosteFallasValencia',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de las "Fallas" de Valencia',
    description: 'Calculadora del Coste de las "Fallas" de Valencia',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-feria-abril',
    component: 'CalculadoraCosteFeriaAbril',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de la "Feria de Abril" de Sevilla',
    description: 'Calculadora del Coste de la "Feria de Abril" de Sevilla',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-dia-playa',
    component: 'CalculadoraCosteDiaPlaya',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Día de Playa" (parking, sombrilla, comida)',
    description: 'Calculadora del Coste de un "Día de Playa" (parking, sombrilla, comida)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-dia-esqui',
    component: 'CalculadoraCosteDiaEsqui',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Día de Esquí" (forfait, alquiler, clases)',
    description: 'Calculadora del Coste de un "Día de Esquí" (forfait, alquiler, clases)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-cena-amigos',
    component: 'CalculadoraCosteCenaAmigos',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de una "Cena con Amigos" (dividir la cuenta)',
    description: 'Calculadora del Coste de una "Cena con Amigos" (dividir la cuenta)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-cesta-compra-supermercado',
    component: 'CalculadoraCosteCestaCompraSupermercado',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de la "Cesta de la Compra" (por supermercado)',
    description: 'Calculadora del Coste de la "Cesta de la Compra" (por supermercado)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-cafe-ciudad',
    component: 'CalculadoraCosteCafeCiudad',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Café" por ciudad',
    description: 'Calculadora del Coste de un "Café" por ciudad',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-tabaco-ahorro',
    component: 'CalculadoraCosteTabacoAhorro',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste del "Tabaco" (y ahorro al dejarlo)',
    description: 'Calculadora del Coste del "Tabaco" (y ahorro al dejarlo)',
    hasContent: true,
  },

  {
    slug: 'calculadora-loteria-navidad',
    component: 'CalculadoraLoteriaNavidad',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Lotería de Navidad" (probabilidad y reparto de premios)',
    description: 'Calculadora de la "Lotería de Navidad" (probabilidad y reparto de premios)',
    hasContent: true,
  },

  {
    slug: 'calculadora-quiniela',
    component: 'CalculadoraQuiniela',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Quiniela"',
    description: 'Calculadora de la "Quiniela"',
    hasContent: true,
  },

  {
    slug: 'calculadora-primitiva-euromillones',
    component: 'CalculadoraPrimitivaEuromillones',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Primitiva" / "Euromillones"',
    description: 'Calculadora de la "Primitiva" / "Euromillones"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-tatuaje',
    component: 'CalculadoraCosteTatuaje',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Tatuaje"',
    description: 'Calculadora del Coste de un "Tatuaje"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-mascota',
    component: 'CalculadoraCosteMascota',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de una "Mascota" (adopción, comida, veterinario)',
    description: 'Calculadora del Coste de una "Mascota" (adopción, comida, veterinario)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-paseador-perros',
    component: 'CalculadoraCostePaseadorPerros',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Paseador de Perros"',
    description: 'Calculadora del Coste de un "Paseador de Perros"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-guarderia-canina',
    component: 'CalculadoraCosteGuarderiaCanina',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de una "Guardería Canina"',
    description: 'Calculadora del Coste de una "Guardería Canina"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-libro',
    component: 'CalculadoraCosteLibro',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Libro" (papel vs. electrónico)',
    description: 'Calculadora del Coste de un "Libro" (papel vs. electrónico)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-suscripciones',
    component: 'CalculadoraCosteSuscripciones',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de las "Suscripciones" (Netflix, Spotify, etc.)',
    description: 'Calculadora del Coste de las "Suscripciones" (Netflix, Spotify, etc.)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-movil',
    component: 'CalculadoraCosteMovil',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Móvil" (compra vs. renting)',
    description: 'Calculadora del Coste de un "Móvil" (compra vs. renting)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tarifa-movil',
    component: 'CalculadoraTarifaMovil',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Tarifa de Móvil" (comparador)',
    description: 'Calculadora de la "Tarifa de Móvil" (comparador)',
    hasContent: true,
  },

  {
    slug: 'calculadora-tarifa-internet',
    component: 'CalculadoraTarifaInternet',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Tarifa de Internet" (comparador)',
    description: 'Calculadora de la "Tarifa de Internet" (comparador)',
    hasContent: true,
  },

  {
    slug: 'calculadora-consumo-electrico-electrodomesticos',
    component: 'CalculadoraConsumoElectricoElectrodomesticos',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Consumo Eléctrico" de electrodomésticos',
    description: 'Calculadora del "Consumo Eléctrico" de electrodomésticos',
    hasContent: true,
  },

  {
    slug: 'calculadora-factura-luz',
    component: 'CalculadoraFacturaLuz',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Factura de la Luz" (mercado regulado vs. libre)',
    description: 'Calculadora de la "Factura de la Luz" (mercado regulado vs. libre)',
    hasContent: true,
  },

  {
    slug: 'calculadora-factura-gas',
    component: 'CalculadoraFacturaGas',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Factura del Gas"',
    description: 'Calculadora de la "Factura del Gas"',
    hasContent: true,
  },

  {
    slug: 'calculadora-factura-agua',
    component: 'CalculadoraFacturaAgua',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Factura del Agua"',
    description: 'Calculadora de la "Factura del Agua"',
    hasContent: true,
  },

  {
    slug: 'calculadora-ahorro-energetico',
    component: 'CalculadoraAhorroEnergetico',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Ahorro Energético" (LEDs, electrodomésticos eficientes)',
    description: 'Calculadora del "Ahorro Energético" (LEDs, electrodomésticos eficientes)',
    hasContent: true,
  },

  {
    slug: 'calculadora-huella-hidrica',
    component: 'CalculadoraHuellaHidrica',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Huella Hídrica"',
    description: 'Calculadora de la "Huella Hídrica"',
    hasContent: true,
  },

  {
    slug: 'calculadora-reciclaje-ahorro',
    component: 'CalculadoraReciclajeAhorro',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Reciclaje" (cuánto ahorras)',
    description: 'Calculadora del "Reciclaje" (cuánto ahorras)',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-huerto-urbano',
    component: 'CalculadoraCosteHuertoUrbano',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Huerto Urbano"',
    description: 'Calculadora del Coste de un "Huerto Urbano"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-traslado',
    component: 'CalculadoraCosteTraslado',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Traslado"',
    description: 'Calculadora del Coste de un "Traslado"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-trastero',
    component: 'CalculadoraCosteTrastero',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Trastero"',
    description: 'Calculadora del Coste de un "Trastero"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-servicio-limpieza',
    component: 'CalculadoraCosteServicioLimpieza',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Servicio de Limpieza"',
    description: 'Calculadora del Coste de un "Servicio de Limpieza"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-canguro',
    component: 'CalculadoraCosteCanguro',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Canguro"',
    description: 'Calculadora del Coste de un "Canguro"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-actividades-extraescolares',
    component: 'CalculadoraCosteActividadesExtraescolares',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de las "Actividades Extraescolares" de los niños',
    description: 'Calculadora del Coste de las "Actividades Extraescolares" de los niños',
    hasContent: true,
  },

  {
    slug: 'calculadora-paga-hijos',
    component: 'CalculadoraPagaHijos',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Paga" Semanal/Mensual para los hijos',
    description: 'Calculadora de la "Paga" Semanal/Mensual para los hijos',
    hasContent: true,
  },

  {
    slug: 'calculadora-regalo-boda-cumpleanos',
    component: 'CalculadoraRegaloBodaCumpleanos',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Regalo" de Boda/Cumpleaños (presupuesto)',
    description: 'Calculadora del "Regalo" de Boda/Cumpleaños (presupuesto)',
    hasContent: true,
  },

  {
    slug: 'calculadora-lista-nacimiento',
    component: 'CalculadoraListaNacimiento',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Lista de Nacimiento" (presupuesto)',
    description: 'Calculadora de la "Lista de Nacimiento" (presupuesto)',
    hasContent: true,
  },

  {
    slug: 'calculadora-division-gastos-pareja',
    component: 'CalculadoraDivisionGastosPareja',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "División de Gastos" en pareja',
    description: 'Calculadora de la "División de Gastos" en pareja',
    hasContent: true,
  },

  {
    slug: 'calculadora-presupuesto-familiar',
    component: 'CalculadoraPresupuestoFamiliar',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Presupuesto Familiar" (regla 50/30/20)',
    description: 'Calculadora del "Presupuesto Familiar" (regla 50/30/20)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fondo-emergencia',
    component: 'CalculadoraFondoEmergencia',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Fondo de Emergencia"',
    description: 'Calculadora del "Fondo de Emergencia"',
    hasContent: true,
  },

  {
    slug: 'calculadora-amortizacion-anticipada-prestamo',
    component: 'CalculadoraAmortizacionAnticipadaPrestamo',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Amortización Anticipada" de un préstamo',
    description: 'Calculadora de la "Amortización Anticipada" de un préstamo',
    hasContent: true,
  },

  {
    slug: 'calculadora-reunificacion-deudas',
    component: 'CalculadoraReunificacionDeudas',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Reunificación de Deudas"',
    description: 'Calculadora de la "Reunificación de Deudas"',
    hasContent: true,
  },

  {
    slug: 'calculadora-embargo-nomina',
    component: 'CalculadoraEmbargoNomina',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Embargo" de la nómina',
    description: 'Calculadora del "Embargo" de la nómina',
    hasContent: true,
  },

  {
    slug: 'calculadora-lista-morosos',
    component: 'CalculadoraListaMorosos',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Lista de Morosos" (ASNEF, RAI) - cómo salir',
    description: 'Calculadora de la "Lista de Morosos" (ASNEF, RAI) - cómo salir',
    hasContent: true,
  },

  {
    slug: 'calculadora-derecho-al-olvido',
    component: 'CalculadoraDerechoAlOlvido',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Derecho al Olvido" en internet',
    description: 'Calculadora del "Derecho al Olvido" en internet',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-detective-privado',
    component: 'CalculadoraCosteDetectivePrivado',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Detective Privado"',
    description: 'Calculadora del Coste de un "Detective Privado"',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-notario',
    component: 'CalculadoraCosteNotario',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Notario" para diversos trámites',
    description: 'Calculadora del Coste de un "Notario" para diversos trámites',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-gestoria-autonomos',
    component: 'CalculadoraCosteGestoriaAutonomos',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de una "Gestoría" para autónomos',
    description: 'Calculadora del Coste de una "Gestoría" para autónomos',
    hasContent: true,
  },

  {
    slug: 'calculadora-coste-abogado-oficio',
    component: 'CalculadoraCosteAbogadoOficio',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del Coste de un "Abogado de Oficio"',
    description: 'Calculadora del Coste de un "Abogado de Oficio"',
    hasContent: true,
  },

  {
    slug: 'calculadora-justicia-gratuita',
    component: 'CalculadoraJusticiaGratuita',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Justicia Gratuita" (requisitos)',
    description: 'Calculadora de la "Justicia Gratuita" (requisitos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-propina-restaurante',
    component: 'CalculadoraPropinaRestaurante',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Propina" en un restaurante',
    description: 'Calculadora de la "Propina" en un restaurante',
    hasContent: true,
  },

  {
    slug: 'calculadora-menu-del-dia',
    component: 'CalculadoraMenuDelDia',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Menú del Día" (coste medio por ciudad)',
    description: 'Calculadora del "Menú del Día" (coste medio por ciudad)',
    hasContent: true,
  },

  {
    slug: 'calculadora-bono-cultural-joven',
    component: 'CalculadoraBonoCulturalJoven',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Bono Cultural Joven"',
    description: 'Calculadora del "Bono Cultural Joven"',
    hasContent: true,
  },

  {
    slug: 'calculadora-imv',
    component: 'CalculadoraImv',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "IMV" (Ingreso Mínimo Vital)',
    description: 'Calculadora del "IMV" (Ingreso Mínimo Vital)',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-nacimiento-adopcion',
    component: 'CalculadoraAyudasNacimientoAdopcion',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas por Nacimiento/Adopción"',
    description: 'Calculadora de las "Ayudas por Nacimiento/Adopción"',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-alquiler',
    component: 'CalculadoraAyudasAlquiler',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas al Alquiler" por C.A.',
    description: 'Calculadora de las "Ayudas al Alquiler" por C.A.',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-compra-vivienda-jovenes',
    component: 'CalculadoraAyudasCompraViviendaJovenes',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas para la Compra de Vivienda" para jóvenes',
    description: 'Calculadora de las "Ayudas para la Compra de Vivienda" para jóvenes',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-carnet-conducir',
    component: 'CalculadoraAyudasCarnetConducir',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas para el Carnet de Conducir"',
    description: 'Calculadora de las "Ayudas para el Carnet de Conducir"',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-eficiencia-energetica',
    component: 'CalculadoraAyudasEficienciaEnergetica',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas para la Eficiencia Energética"',
    description: 'Calculadora de las "Ayudas para la Eficiencia Energética"',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-autoconsumo',
    component: 'CalculadoraAyudasAutoconsumo',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas para el Autoconsumo" (placas solares)',
    description: 'Calculadora de las "Ayudas para el Autoconsumo" (placas solares)',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-contratacion',
    component: 'CalculadoraAyudasContratacion',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas para la Contratación" de empleados',
    description: 'Calculadora de las "Ayudas para la Contratación" de empleados',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-creacion-empresas',
    component: 'CalculadoraAyudasCreacionEmpresas',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas para la Creación de Empresas"',
    description: 'Calculadora de las "Ayudas para la Creación de Empresas"',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-pac',
    component: 'CalculadoraAyudasPac',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas de la PAC" (Política Agraria Común)',
    description: 'Calculadora de las "Ayudas de la PAC" (Política Agraria Común)',
    hasContent: true,
  },

  {
    slug: 'calculadora-ayudas-desempleo-mayores-52',
    component: 'CalculadoraAyudasDesempleoMayores52',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Ayudas por Desempleo" para mayores de 52 años',
    description: 'Calculadora de las "Ayudas por Desempleo" para mayores de 52 años',
    hasContent: true,
  },

  {
    slug: 'calculadora-renta-agraria',
    component: 'CalculadoraRentaAgraria',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Renta Agraria"',
    description: 'Calculadora de la "Renta Agraria"',
    hasContent: true,
  },

  {
    slug: 'calculadora-subsidio-empleadas-hogar',
    component: 'CalculadoraSubsidioEmpleadasHogar',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Subsidio para Empleadas de Hogar"',
    description: 'Calculadora del "Subsidio para Empleadas de Hogar"',
    hasContent: true,
  },

  {
    slug: 'calculadora-prestacion-riesgo-embarazo-lactancia',
    component: 'CalculadoraPrestacionRiesgoEmbarazoLactancia',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Prestación por Riesgo durante el Embarazo/Lactancia"',
    description: 'Calculadora de la "Prestación por Riesgo durante el Embarazo/Lactancia"',
    hasContent: true,
  },

  {
    slug: 'calculadora-prestacion-cuidado-menores-cancer',
    component: 'CalculadoraPrestacionCuidadoMenoresCancer',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Prestación por Cuidado de Menores con Cáncer"',
    description: 'Calculadora de la "Prestación por Cuidado de Menores con Cáncer"',
    hasContent: true,
  },

  {
    slug: 'calculadora-pension-no-contributiva',
    component: 'CalculadoraPensionNoContributiva',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Pensión No Contributiva" de jubilación/invalidez',
    description: 'Calculadora de la "Pensión No Contributiva" de jubilación/invalidez',
    hasContent: true,
  },

  {
    slug: 'calculadora-complemento-minimos',
    component: 'CalculadoraComplementoMinimos',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Complemento a Mínimos" de la pensión',
    description: 'Calculadora del "Complemento a Mínimos" de la pensión',
    hasContent: true,
  },

  {
    slug: 'calculadora-complemento-brecha-genero',
    component: 'CalculadoraComplementoBrechaGenero',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Complemento por Brecha de Género" en la pensión',
    description: 'Calculadora del "Complemento por Brecha de Género" en la pensión',
    hasContent: true,
  },

  {
    slug: 'calculadora-rescate-plan-pensiones',
    component: 'CalculadoraRescatePlanPensiones',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Rescate" de un Plan de Pensiones (forma de capital vs. renta)',
    description: 'Calculadora del "Rescate" de un Plan de Pensiones (forma de capital vs. renta)',
    hasContent: true,
  },

  {
    slug: 'calculadora-jubilacion-activa',
    component: 'CalculadoraJubilacionActiva',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Jubilación Activa" (compatibilizar pensión y trabajo)',
    description: 'Calculadora de la "Jubilación Activa" (compatibilizar pensión y trabajo)',
    hasContent: true,
  },

  {
    slug: 'calculadora-jubilacion-demorada',
    component: 'CalculadoraJubilacionDemorada',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Jubilación Demorada" (incentivos por retrasar la jubilación)',
    description: 'Calculadora de la "Jubilación Demorada" (incentivos por retrasar la jubilación)',
    hasContent: true,
  },

  {
    slug: 'calculadora-jubilacion-parcial',
    component: 'CalculadoraJubilacionParcial',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Jubilación Parcial"',
    description: 'Calculadora de la "Jubilación Parcial"',
    hasContent: true,
  },

  {
    slug: 'calculadora-jubilacion-anticipada',
    component: 'CalculadoraJubilacionAnticipada',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Jubilación Anticipada" (voluntaria e involuntaria)',
    description: 'Calculadora de la "Jubilación Anticipada" (voluntaria e involuntaria)',
    hasContent: true,
  },

  {
    slug: 'calculadora-edad-jubilacion',
    component: 'CalculadoraEdadJubilacion',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Edad de Jubilación" (según años cotizados)',
    description: 'Calculadora de la "Edad de Jubilación" (según años cotizados)',
    hasContent: true,
  },

  {
    slug: 'calculadora-base-reguladora-pension',
    component: 'CalculadoraBaseReguladoraPension',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Base Reguladora" de la pensión',
    description: 'Calculadora de la "Base Reguladora" de la pensión',
    hasContent: true,
  },

  {
    slug: 'calculadora-anos-cotizados',
    component: 'CalculadoraAnosCotizados',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de los "Años Cotizados" a la Seguridad Social (informe de vida laboral)',
    description: 'Calculadora de los "Años Cotizados" a la Seguridad Social (informe de vida laboral)',
    hasContent: true,
  },

  {
    slug: 'calculadora-lagunas-cotizacion',
    component: 'CalculadoraLagunasCotizacion',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de las "Lagunas de Cotización"',
    description: 'Calculadora de las "Lagunas de Cotización"',
    hasContent: true,
  },

  {
    slug: 'calculadora-convenio-especial-ss',
    component: 'CalculadoraConvenioEspecialSs',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Convenio Especial" con la Seguridad Social',
    description: 'Calculadora del "Convenio Especial" con la Seguridad Social',
    hasContent: true,
  },

  {
    slug: 'calculadora-compra-anos-cotizacion',
    component: 'CalculadoraCompraAnosCotizacion',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Compra de Años de Cotización" (si es posible)',
    description: 'Calculadora de la "Compra de Años de Cotización" (si es posible)',
    hasContent: true,
  },

  {
    slug: 'calculadora-pension-alimentos',
    component: 'CalculadoraPensionAlimentos',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Pensión de Alimentos" para hijos',
    description: 'Calculadora de la "Pensión de Alimentos" para hijos',
    hasContent: true,
  },

  {
    slug: 'calculadora-pension-compensatoria',
    component: 'CalculadoraPensionCompensatoria',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Pensión Compensatoria" para el cónyuge',
    description: 'Calculadora de la "Pensión Compensatoria" para el cónyuge',
    hasContent: true,
  },

  {
    slug: 'calculadora-liquidacion-gananciales',
    component: 'CalculadoraLiquidacionGananciales',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Liquidación de Gananciales" en un divorcio',
    description: 'Calculadora de la "Liquidación de Gananciales" en un divorcio',
    hasContent: true,
  },

  {
    slug: 'calculadora-herencia',
    component: 'CalculadoraHerencia',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Herencia" (cálculo de la legítima, mejora y libre disposición)',
    description: 'Calculadora de la "Herencia" (cálculo de la legítima, mejora y libre disposición)',
    hasContent: true,
  },

  {
    slug: 'calculadora-desheredacion',
    component: 'CalculadoraDesheredacion',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Desheredación" (causas y efectos)',
    description: 'Calculadora de la "Desheredación" (causas y efectos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-incapacitacion-judicial',
    component: 'CalculadoraIncapacitacionJudicial',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Incapacitación Judicial" (ahora "medidas de apoyo a personas con discapacidad")',
    description: 'Calculadora de la "Incapacitación Judicial" (ahora "medidas de apoyo a personas con discapacidad")',
    hasContent: true,
  },

  {
    slug: 'calculadora-tutela-curatela',
    component: 'CalculadoraTutelaCuratela',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Tutela/Curatela"',
    description: 'Calculadora de la "Tutela/Curatela"',
    hasContent: true,
  },

  {
    slug: 'calculadora-poder-notarial',
    component: 'CalculadoraPoderNotarial',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora del "Poder Notarial" (coste y tipos)',
    description: 'Calculadora del "Poder Notarial" (coste y tipos)',
    hasContent: true,
  },

  {
    slug: 'calculadora-fe-de-vida',
    component: 'CalculadoraFeDeVida',
    category: 'miscelánea-y-vida-cotidiana',
    lang: 'es',
    title: 'Calculadora de la "Fe de Vida" para pensionistas en el extranjero',
    description: 'Calculadora de la "Fe de Vida" para pensionistas en el extranjero',
    hasContent: true,
  },

  {
    slug: 'calculateur-flat-tax-pfu-plus-values',
    component: 'CalculateurFlatTaxPfuPlusValues',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Flat Tax" (PFU) sur les plus-values mobilières',
    description: 'Calculateur de la "Flat Tax" (PFU) sur les plus-values mobilières',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-stock-options-bspce',
    component: 'CalculateurFiscaliteStockOptionsBspce',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des Stock-Options et BSPCE',
    description: 'Calculateur de la fiscalité des Stock-Options et BSPCE',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-actions-gratuites-aga',
    component: 'CalculateurFiscaliteActionsGratuitesAga',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des Actions Gratuites (AGA)',
    description: 'Calculateur de la fiscalité des Actions Gratuites (AGA)',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-per',
    component: 'CalculateurFiscalitePer',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité du PER (Plan d\'Épargne Retraite) à l\'entrée et à la sortie',
    description: 'Calculateur de la fiscalité du PER (Plan d\'Épargne Retraite) à l\'entrée et à la sortie',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-pea',
    component: 'CalculateurFiscalitePea',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité du PEA (Plan d\'Épargne en Actions) et PEA-PME',
    description: 'Calculateur de la fiscalité du PEA (Plan d\'Épargne en Actions) et PEA-PME',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-assurance-vie',
    component: 'CalculateurFiscaliteAssuranceVie',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité de l\'Assurance-Vie (rachat avant/après 8 ans)',
    description: 'Calculateur de la fiscalité de l\'Assurance-Vie (rachat avant/après 8 ans)',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-revenus-fonciers',
    component: 'CalculateurFiscaliteRevenusFonciers',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des revenus fonciers (régime réel vs. micro-foncier)',
    description: 'Calculateur de la fiscalité des revenus fonciers (régime réel vs. micro-foncier)',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-location-meublee',
    component: 'CalculateurFiscaliteLocationMeublee',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité de la location meublée (LMNP/LMP)',
    description: 'Calculateur de la fiscalité de la location meublée (LMNP/LMP)',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-scpi',
    component: 'CalculateurFiscaliteScpi',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des SCPI (Sociétés Civiles de Placement Immobilier)',
    description: 'Calculateur de la fiscalité des SCPI (Sociétés Civiles de Placement Immobilier)',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-capitaux-mobiliers-etrangers',
    component: 'CalculateurFiscaliteCapitauxMobiliersEtrangers',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des revenus de capitaux mobiliers étrangers (avec crédit d\'impôt)',
    description: 'Calculateur de la fiscalité des revenus de capitaux mobiliers étrangers (avec crédit d\'impôt)',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-plus-values-crypto',
    component: 'CalculateurFiscalitePlusValuesCrypto',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des plus-values sur crypto-actifs',
    description: 'Calculateur de la fiscalité des plus-values sur crypto-actifs',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-staking-lending-crypto',
    component: 'CalculateurFiscaliteStakingLendingCrypto',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité du "staking" et "lending" de cryptomonnaies',
    description: 'Calculateur de la fiscalité du "staking" et "lending" de cryptomonnaies',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-revenus-twitch-youtube',
    component: 'CalculateurFiscaliteRevenusTwitchYoutube',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des revenus de Twitch/YouTube',
    description: 'Calculateur de la fiscalité des revenus de Twitch/YouTube',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-revenus-onlyfans-patreon',
    component: 'CalculateurFiscaliteRevenusOnlyfansPatreon',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des revenus de OnlyFans/Patreon',
    description: 'Calculateur de la fiscalité des revenus de OnlyFans/Patreon',
    hasContent: true,
  }
,

  // Additional calculators from CSV (1301-1600)
  {
    slug: 'calculateur-fiscalite-ventes-vinted-leboncoin',
    component: 'CalculateurFiscaliteVentesVintedLeboncoin',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des ventes sur Vinted/LeBonCoin',
    description: 'Calculateur de la fiscalité des ventes sur Vinted/LeBonCoin',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-nomades-digitaux-france',
    component: 'CalculateurFiscaliteNomadesDigitauxFrance',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des "Nomades Digitaux" résidents en France',
    description: 'Calculateur de la fiscalité des "Nomades Digitaux" résidents en France',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-impatries',
    component: 'CalculateurFiscaliteImpatries',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des "impatriés" (régime spécial)',
    description: 'Calculateur de la fiscalité des "impatriés" (régime spécial)',
    hasContent: true,
  },

  {
    slug: 'calculateur-fiscalite-travailleurs-frontaliers',
    component: 'CalculateurFiscaliteTravailleursFrontaliers',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la fiscalité des travailleurs frontaliers (Suisse, Allemagne, Belgique, etc.)',
    description: 'Calculateur de la fiscalité des travailleurs frontaliers (Suisse, Allemagne, Belgique, etc.)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-puma',
    component: 'CalculateurTaxePuma',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe PUMa" (Protection Universelle Maladie) pour rentiers',
    description: 'Calculateur de la "Taxe PUMa" (Protection Universelle Maladie) pour rentiers',
    hasContent: true,
  },

  {
    slug: 'calculateur-contribution-sociale-solidarite-societes',
    component: 'CalculateurContributionSocialeSolidariteSocietes',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Contribution Sociale de Solidarité des Sociétés" (C3S)',
    description: 'Calculateur de la "Contribution Sociale de Solidarité des Sociétés" (C3S)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-salaires',
    component: 'CalculateurTaxeSalaires',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe sur les Salaires"',
    description: 'Calculateur de la "Taxe sur les Salaires"',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-apprentissage',
    component: 'CalculateurTaxeApprentissage',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe d\'Apprentissage"',
    description: 'Calculateur de la "Taxe d\'Apprentissage"',
    hasContent: true,
  },

  {
    slug: 'calculateur-participation-formation-continue',
    component: 'CalculateurParticipationFormationContinue',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Participation à la Formation Professionnelle Continue"',
    description: 'Calculateur de la "Participation à la Formation Professionnelle Continue"',
    hasContent: true,
  },

  {
    slug: 'calculateur-tvs',
    component: 'CalculateurTvs',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe sur les Véhicules de Sociétés" (TVS)',
    description: 'Calculateur de la "Taxe sur les Véhicules de Sociétés" (TVS)',
    hasContent: true,
  },

  {
    slug: 'calculateur-amortissement-vehicule-societe',
    component: 'CalculateurAmortissementVehiculeSociete',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de l\'amortissement d\'un véhicule de société',
    description: 'Calculateur de l\'amortissement d\'un véhicule de société',
    hasContent: true,
  },

  {
    slug: 'calculateur-deductibilite-frais-repas-independants',
    component: 'CalculateurDeductibiliteFraisRepasIndependants',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la déductibilité des frais de repas pour indépendants',
    description: 'Calculateur de la déductibilité des frais de repas pour indépendants',
    hasContent: true,
  },

  {
    slug: 'calculateur-indemnites-kilometriques',
    component: 'CalculateurIndemnitesKilometriques',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur des indemnités kilométriques (barème fiscal)',
    description: 'Calculateur des indemnités kilométriques (barème fiscal)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cir',
    component: 'CalculateurCir',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Crédit d\'Impôt Recherche" (CIR)',
    description: 'Calculateur du "Crédit d\'Impôt Recherche" (CIR)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cii',
    component: 'CalculateurCii',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Crédit d\'Impôt Innovation" (CII)',
    description: 'Calculateur du "Crédit d\'Impôt Innovation" (CII)',
    hasContent: true,
  },

  {
    slug: 'calculateur-jei',
    component: 'CalculateurJei',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du statut de "Jeune Entreprise Innovante" (JEI)',
    description: 'Calculateur du statut de "Jeune Entreprise Innovante" (JEI)',
    hasContent: true,
  },

  {
    slug: 'calculateur-aides-creation-entreprise',
    component: 'CalculateurAidesCreationEntreprise',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur des aides à la création d\'entreprise (ARCE vs. maintien ARE)',
    description: 'Calculateur des aides à la création d\'entreprise (ARCE vs. maintien ARE)',
    hasContent: true,
  },

  {
    slug: 'calculateur-exonerations-charges-zfu',
    component: 'CalculateurExonerationsChargesZfu',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur des exonérations de charges en ZFU/ZRR/BER',
    description: 'Calculateur des exonérations de charges en ZFU/ZRR/BER',
    hasContent: true,
  },

  {
    slug: 'calculateur-tva-marge',
    component: 'CalculateurTvaMarge',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "TVA sur la Marge"',
    description: 'Calculateur de la "TVA sur la Marge"',
    hasContent: true,
  },

  {
    slug: 'calculateur-tva-intracommunautaire',
    component: 'CalculateurTvaIntracommunautaire',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "TVA Intracommunautaire" (autoliquidation)',
    description: 'Calculateur de la "TVA Intracommunautaire" (autoliquidation)',
    hasContent: true,
  },

  {
    slug: 'calculateur-prorata-deduction-tva',
    component: 'CalculateurProrataDeductionTva',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Prorata de déduction de TVA"',
    description: 'Calculateur du "Prorata de déduction de TVA"',
    hasContent: true,
  },

  {
    slug: 'calculateur-regularisation-tva-immobilisations',
    component: 'CalculateurRegularisationTvaImmobilisations',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la régularisation de TVA sur immobilisations',
    description: 'Calculateur de la régularisation de TVA sur immobilisations',
    hasContent: true,
  },

  {
    slug: 'calculateur-remboursement-credit-tva',
    component: 'CalculateurRemboursementCreditTva',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Remboursement de crédit de TVA"',
    description: 'Calculateur du "Remboursement de crédit de TVA"',
    hasContent: true,
  },

  {
    slug: 'calculateur-deb-des',
    component: 'CalculateurDebDes',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Déclaration d\'Échange de Biens/Services" (DEB/DES)',
    description: 'Calculateur de la "Déclaration d\'Échange de Biens/Services" (DEB/DES)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-transactions-financieres',
    component: 'CalculateurTaxeTransactionsFinancieres',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe sur les Transactions Financières" (TTF)',
    description: 'Calculateur de la "Taxe sur les Transactions Financières" (TTF)',
    hasContent: true,
  },

  {
    slug: 'calculateur-tascom',
    component: 'CalculateurTascom',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe sur les Surfaces Commerciales" (TASCOM)',
    description: 'Calculateur de la "Taxe sur les Surfaces Commerciales" (TASCOM)',
    hasContent: true,
  },

  {
    slug: 'calculateur-tlpe',
    component: 'CalculateurTlpe',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe sur la Publicité Extérieure" (TLPE)',
    description: 'Calculateur de la "Taxe sur la Publicité Extérieure" (TLPE)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-sejour',
    component: 'CalculateurTaxeSejour',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe de Séjour"',
    description: 'Calculateur de la "Taxe de Séjour"',
    hasContent: true,
  },

  {
    slug: 'calculateur-redevance-archeologie-preventive',
    component: 'CalculateurRedevanceArcheologiePreventive',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Redevance d\'Archéologie Préventive"',
    description: 'Calculateur de la "Redevance d\'Archéologie Préventive"',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-amenagement',
    component: 'CalculateurTaxeAmenagement',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe d\'Aménagement"',
    description: 'Calculateur de la "Taxe d\'Aménagement"',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-fonciere-baties-non-baties',
    component: 'CalculateurTaxeFonciereBatiesNonBaties',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe Foncière sur les Propriétés Bâties/Non Bâties"',
    description: 'Calculateur de la "Taxe Foncière sur les Propriétés Bâties/Non Bâties"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cvae',
    component: 'CalculateurCvae',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Cotisation sur la Valeur Ajoutée des Entreprises" (CVAE)',
    description: 'Calculateur de la "Cotisation sur la Valeur Ajoutée des Entreprises" (CVAE)',
    hasContent: true,
  },

  {
    slug: 'calculateur-reduction-impot-pme-madelin',
    component: 'CalculateurReductionImpotPmeMadelin',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Réduction d\'impôt pour souscription au capital de PME" (Madelin)',
    description: 'Calculateur de la "Réduction d\'impôt pour souscription au capital de PME" (Madelin)',
    hasContent: true,
  },

  {
    slug: 'calculateur-reduction-impot-dons',
    component: 'CalculateurReductionImpotDons',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Réduction d\'impôt pour dons" aux associations',
    description: 'Calculateur de la "Réduction d\'impôt pour dons" aux associations',
    hasContent: true,
  },

  {
    slug: 'calculateur-plafonnement-niches-fiscales',
    component: 'CalculateurPlafonnementNichesFiscales',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Plafonnement des niches fiscales"',
    description: 'Calculateur du "Plafonnement des niches fiscales"',
    hasContent: true,
  },

  {
    slug: 'calculateur-reste-a-vivre',
    component: 'CalculateurResteAVivre',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Reste à Vivre" après impôts et charges',
    description: 'Calculateur du "Reste à Vivre" après impôts et charges',
    hasContent: true,
  },

  {
    slug: 'calculateur-tmi',
    component: 'CalculateurTmi',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Taux Marginal d\'Imposition" (TMI)',
    description: 'Calculateur du "Taux Marginal d\'Imposition" (TMI)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taux-moyen-imposition',
    component: 'CalculateurTauxMoyenImposition',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Taux Moyen d\'Imposition"',
    description: 'Calculateur du "Taux Moyen d\'Imposition"',
    hasContent: true,
  },

  {
    slug: 'calculateur-decote-faibles-impots',
    component: 'CalculateurDecoteFaiblesImpots',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Décote" pour les faibles impôts',
    description: 'Calculateur de la "Décote" pour les faibles impôts',
    hasContent: true,
  },

  {
    slug: 'calculateur-plafonnement-quotient-familial',
    component: 'CalculateurPlafonnementQuotientFamilial',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Plafonnement du Quotient Familial"',
    description: 'Calculateur du "Plafonnement du Quotient Familial"',
    hasContent: true,
  },

  {
    slug: 'calculateur-demi-part-anciens-combattants',
    component: 'CalculateurDemiPartAnciensCombattants',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Demi-part des anciens combattants"',
    description: 'Calculateur de la "Demi-part des anciens combattants"',
    hasContent: true,
  },

  {
    slug: 'calculateur-pension-alimentaire',
    component: 'CalculateurPensionAlimentaire',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Pension alimentaire" versée/reçue (déduction/imposition)',
    description: 'Calculateur de la "Pension alimentaire" versée/reçue (déduction/imposition)',
    hasContent: true,
  },

  {
    slug: 'calculateur-prestation-compensatoire',
    component: 'CalculateurPrestationCompensatoire',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Prestation compensatoire" en cas de divorce',
    description: 'Calculateur de la "Prestation compensatoire" en cas de divorce',
    hasContent: true,
  },

  {
    slug: 'calculateur-rente-viagere',
    component: 'CalculateurRenteViagere',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Rente viagère" (part imposable)',
    description: 'Calculateur de la "Rente viagère" (part imposable)',
    hasContent: true,
  },

  {
    slug: 'calculateur-indemnites-licenciement',
    component: 'CalculateurIndemnitesLicenciement',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de l\'imposition des indemnités de licenciement',
    description: 'Calculateur de l\'imposition des indemnités de licenciement',
    hasContent: true,
  },

  {
    slug: 'calculateur-indemnites-rupture-conventionnelle',
    component: 'CalculateurIndemnitesRuptureConventionnelle',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de l\'imposition des indemnités de rupture conventionnelle',
    description: 'Calculateur de l\'imposition des indemnités de rupture conventionnelle',
    hasContent: true,
  },

  {
    slug: 'calculateur-indemnites-depart-retraite',
    component: 'CalculateurIndemnitesDepartRetraite',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de l\'imposition des indemnités de départ à la retraite',
    description: 'Calculateur de l\'imposition des indemnités de départ à la retraite',
    hasContent: true,
  },

  {
    slug: 'calculateur-cehr',
    component: 'CalculateurCehr',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Contribution Exceptionnelle sur les Hauts Revenus" (CEHR)',
    description: 'Calculateur de la "Contribution Exceptionnelle sur les Hauts Revenus" (CEHR)',
    hasContent: true,
  },

  {
    slug: 'calculateur-csg-deductible',
    component: 'CalculateurCsgDeductible',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "CSG déductible"',
    description: 'Calculateur de la "CSG déductible"',
    hasContent: true,
  },

  {
    slug: 'calculateur-declaration-comptes-etranger',
    component: 'CalculateurDeclarationComptesEtranger',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Déclaration des comptes à l\'étranger" (formulaire 3916)',
    description: 'Calculateur de la "Déclaration des comptes à l\'étranger" (formulaire 3916)',
    hasContent: true,
  },

  {
    slug: 'calculateur-declaration-contrats-assurance-vie-etranger',
    component: 'CalculateurDeclarationContratsAssuranceVieEtranger',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Déclaration des contrats d\'assurance-vie à l\'étranger"',
    description: 'Calculateur de la "Déclaration des contrats d\'assurance-vie à l\'étranger"',
    hasContent: true,
  },

  {
    slug: 'calculateur-declaration-trusts',
    component: 'CalculateurDeclarationTrusts',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Déclaration des trusts"',
    description: 'Calculateur de la "Déclaration des trusts"',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-3-pourcent-immeubles-etrangers',
    component: 'CalculateurTaxe3PourcentImmeublesEtrangers',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe de 3%" sur les immeubles détenus par des entités étrangères',
    description: 'Calculateur de la "Taxe de 3%" sur les immeubles détenus par des entités étrangères',
    hasContent: true,
  },

  {
    slug: 'calculateur-controle-fiscal',
    component: 'CalculateurControleFiscal',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur du "Contrôle Fiscal" (intérêts de retard et majorations)',
    description: 'Calculateur du "Contrôle Fiscal" (intérêts de retard et majorations)',
    hasContent: true,
  },

  {
    slug: 'calculateur-solidarite-voisinage',
    component: 'CalculateurSolidariteVoisinage',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Solidarité de Voisinage" (impôts locaux)',
    description: 'Calculateur de la "Solidarité de Voisinage" (impôts locaux)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-balayage',
    component: 'CalculateurTaxeBalayage',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe Balayage"',
    description: 'Calculateur de la "Taxe Balayage"',
    hasContent: true,
  },

  {
    slug: 'calculateur-teom',
    component: 'CalculateurTeom',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe d\'Enlèvement des Ordures Ménagères" (TEOM)',
    description: 'Calculateur de la "Taxe d\'Enlèvement des Ordures Ménagères" (TEOM)',
    hasContent: true,
  },

  {
    slug: 'calculateur-redevance-incitative-ordures',
    component: 'CalculateurRedevanceIncitativeOrdures',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Redevance Incitative" (ordures ménagères)',
    description: 'Calculateur de la "Redevance Incitative" (ordures ménagères)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-gemapi',
    component: 'CalculateurTaxeGemapi',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe GEMAPI" (Gestion des Milieux Aquatiques)',
    description: 'Calculateur de la "Taxe GEMAPI" (Gestion des Milieux Aquatiques)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-friches-commerciales',
    component: 'CalculateurTaxeFrichesCommerciales',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe sur les Friches Commerciales"',
    description: 'Calculateur de la "Taxe sur les Friches Commerciales"',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-logements-vacants',
    component: 'CalculateurTaxeLogementsVacants',
    category: 'fiscalité-et-travail-indépendant',
    lang: 'fr',
    title: 'Calculateur de la "Taxe sur les Logements Vacants"',
    description: 'Calculateur de la "Taxe sur les Logements Vacants"',
    hasContent: true,
  },

  {
    slug: 'calculateur-loi-pinel',
    component: 'CalculateurLoiPinel',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de la loi "Pinel" / "Pinel+" (réduction d\'impôt)',
    description: 'Calculateur de la loi "Pinel" / "Pinel+" (réduction d\'impôt)',
    hasContent: true,
  },

  {
    slug: 'calculateur-loi-denormandie',
    component: 'CalculateurLoiDenormandie',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de la loi "Denormandie" (investissement dans l\'ancien)',
    description: 'Calculateur de la loi "Denormandie" (investissement dans l\'ancien)',
    hasContent: true,
  },

  {
    slug: 'calculateur-loi-malraux',
    component: 'CalculateurLoiMalraux',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de la loi "Malraux" (restauration immobilière)',
    description: 'Calculateur de la loi "Malraux" (restauration immobilière)',
    hasContent: true,
  },

  {
    slug: 'calculateur-lmnp',
    component: 'CalculateurLmnp',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du statut "Loueur en Meublé Non Professionnel" (LMNP) - régime réel vs. micro-BIC',
    description: 'Calculateur du statut "Loueur en Meublé Non Professionnel" (LMNP) - régime réel vs. micro-BIC',
    hasContent: true,
  },

  {
    slug: 'calculateur-amortissement-lmnp',
    component: 'CalculateurAmortissementLmnp',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de l\'amortissement d\'un bien en LMNP',
    description: 'Calculateur de l\'amortissement d\'un bien en LMNP',
    hasContent: true,
  },

  {
    slug: 'calculateur-loi-censi-bouvard',
    component: 'CalculateurLoiCensiBouvard',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de la loi "Censi-Bouvard" (résidences de services)',
    description: 'Calculateur de la loi "Censi-Bouvard" (résidences de services)',
    hasContent: true,
  },

  {
    slug: 'calculateur-deficit-foncier',
    component: 'CalculateurDeficitFoncier',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Déficit Foncier"',
    description: 'Calculateur du "Déficit Foncier"',
    hasContent: true,
  },

  {
    slug: 'calculateur-pas',
    component: 'CalculateurPas',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Prêt à l\'Accession Sociale" (PAS)',
    description: 'Calculateur du "Prêt à l\'Accession Sociale" (PAS)',
    hasContent: true,
  },

  {
    slug: 'calculateur-pret-conventionne',
    component: 'CalculateurPretConventionne',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Prêt Conventionné" (PC)',
    description: 'Calculateur du "Prêt Conventionné" (PC)',
    hasContent: true,
  },

  {
    slug: 'calculateur-pret-action-logement',
    component: 'CalculateurPretActionLogement',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Prêt Action Logement" (ex 1% Logement)',
    description: 'Calculateur du "Prêt Action Logement" (ex 1% Logement)',
    hasContent: true,
  },

  {
    slug: 'calculateur-eco-ptz',
    component: 'CalculateurEcoPtz',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de l\'"Éco-Prêt à Taux Zéro" (Éco-PTZ)',
    description: 'Calculateur de l\'"Éco-Prêt à Taux Zéro" (Éco-PTZ)',
    hasContent: true,
  },

  {
    slug: 'calculateur-apl',
    component: 'CalculateurApl',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de l\'"Aide Personnalisée au Logement" (APL)',
    description: 'Calculateur de l\'"Aide Personnalisée au Logement" (APL)',
    hasContent: true,
  },

  {
    slug: 'calculateur-alf',
    component: 'CalculateurAlf',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de l\'"Allocation de Logement Familiale" (ALF)',
    description: 'Calculateur de l\'"Allocation de Logement Familiale" (ALF)',
    hasContent: true,
  },

  {
    slug: 'calculateur-als',
    component: 'CalculateurAls',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de l\'"Allocation de Logement Sociale" (ALS)',
    description: 'Calculateur de l\'"Allocation de Logement Sociale" (ALS)',
    hasContent: true,
  },

  {
    slug: 'calculateur-garantie-visale',
    component: 'CalculateurGarantieVisale',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de la "Garantie Visale"',
    description: 'Calculateur de la "Garantie Visale"',
    hasContent: true,
  },

  {
    slug: 'calculateur-bail-mobilite',
    component: 'CalculateurBailMobilite',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Bail Mobilité"',
    description: 'Calculateur du "Bail Mobilité"',
    hasContent: true,
  },

  {
    slug: 'calculateur-brs',
    component: 'CalculateurBrs',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Bail Réel Solidaire" (BRS)',
    description: 'Calculateur du "Bail Réel Solidaire" (BRS)',
    hasContent: true,
  },

  {
    slug: 'calculateur-viager',
    component: 'CalculateurViager',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Viager" (bouquet et rente)',
    description: 'Calculateur du "Viager" (bouquet et rente)',
    hasContent: true,
  },

  {
    slug: 'calculateur-vente-a-terme',
    component: 'CalculateurVenteATerme',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de la "Vente à terme"',
    description: 'Calculateur de la "Vente à terme"',
    hasContent: true,
  },

  {
    slug: 'calculateur-demembrement-propriete',
    component: 'CalculateurDemembrementPropriete',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Démembrement de propriété" (valeur usufruit/nue-propriété)',
    description: 'Calculateur du "Démembrement de propriété" (valeur usufruit/nue-propriété)',
    hasContent: true,
  },

  {
    slug: 'calculateur-frais-notaire-donation-succession',
    component: 'CalculateurFraisNotaireDonationSuccession',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur des "Frais de Notaire" pour une donation/succession',
    description: 'Calculateur des "Frais de Notaire" pour une donation/succession',
    hasContent: true,
  },

  {
    slug: 'calculateur-frais-agence-immobiliere',
    component: 'CalculateurFraisAgenceImmobiliere',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur des "Frais d\'Agence Immobilière"',
    description: 'Calculateur des "Frais d\'Agence Immobilière"',
    hasContent: true,
  },

  {
    slug: 'calculateur-depot-garantie',
    component: 'CalculateurDepotGarantie',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Dépôt de Garantie" (caution)',
    description: 'Calculateur du "Dépôt de Garantie" (caution)',
    hasContent: true,
  },

  {
    slug: 'calculateur-charges-recuperables',
    component: 'CalculateurChargesRecuperables',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur des "Charges Récupérables" sur le locataire',
    description: 'Calculateur des "Charges Récupérables" sur le locataire',
    hasContent: true,
  },

  {
    slug: 'calculateur-regularisation-charges',
    component: 'CalculateurRegularisationCharges',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de la "Régularisation des charges" locatives',
    description: 'Calculateur de la "Régularisation des charges" locatives',
    hasContent: true,
  },

  {
    slug: 'calculateur-preavis-location',
    component: 'CalculateurPreavisLocation',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Préavis" de location (locataire/bailleur)',
    description: 'Calculateur du "Préavis" de location (locataire/bailleur)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-demenagement',
    component: 'CalculateurCoutDemenagement',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Déménagement"',
    description: 'Calculateur du "Coût d\'un Déménagement"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-garde-meuble',
    component: 'CalculateurCoutGardeMeuble',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Garde-Meuble"',
    description: 'Calculateur du "Coût d\'un Garde-Meuble"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-assurance-habitation',
    component: 'CalculateurCoutAssuranceHabitation',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'une Assurance Habitation" (MRH)',
    description: 'Calculateur du "Coût d\'une Assurance Habitation" (MRH)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-assurance-pno',
    component: 'CalculateurCoutAssurancePno',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'une Assurance "Propriétaire Non Occupant" (PNO)',
    description: 'Calculateur du "Coût d\'une Assurance "Propriétaire Non Occupant" (PNO)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-assurance-gli',
    component: 'CalculateurCoutAssuranceGli',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'une Assurance "Garantie Loyers Impayés" (GLI)',
    description: 'Calculateur du "Coût d\'une Assurance "Garantie Loyers Impayés" (GLI)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-diagnostics-immobiliers',
    component: 'CalculateurCoutDiagnosticsImmobiliers',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût des Diagnostics Immobiliers" (DPE, amiante, plomb, etc.)',
    description: 'Calculateur du "Coût des Diagnostics Immobiliers" (DPE, amiante, plomb, etc.)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-raccordement',
    component: 'CalculateurCoutRaccordement',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Raccordement" (eau, électricité, gaz, fibre)',
    description: 'Calculateur du "Coût d\'un Raccordement" (eau, électricité, gaz, fibre)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-permis-construire',
    component: 'CalculateurCoutPermisConstruire',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Permis de Construire"',
    description: 'Calculateur du "Coût d\'un Permis de Construire"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-declaration-prealable-travaux',
    component: 'CalculateurCoutDeclarationPrealableTravaux',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'une Déclaration Préalable de Travaux"',
    description: 'Calculateur du "Coût d\'une Déclaration Préalable de Travaux"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-piscine',
    component: 'CalculateurCoutPiscine',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'une Piscine" (construction et taxes)',
    description: 'Calculateur du "Coût d\'une Piscine" (construction et taxes)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-veranda',
    component: 'CalculateurCoutVeranda',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'une Véranda"',
    description: 'Calculateur du "Coût d\'une Véranda"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-ravalement-facade',
    component: 'CalculateurCoutRavalementFacade',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Ravalement de Façade"',
    description: 'Calculateur du "Coût d\'un Ravalement de Façade"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-renovation-toiture',
    component: 'CalculateurCoutRenovationToiture',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'une Rénovation de Toiture"',
    description: 'Calculateur du "Coût d\'une Rénovation de Toiture"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-isolation',
    component: 'CalculateurCoutIsolation',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'une Isolation" (combles, murs)',
    description: 'Calculateur du "Coût d\'une Isolation" (combles, murs)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-changement-fenetres',
    component: 'CalculateurCoutChangementFenetres',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Changement de Fenêtres"',
    description: 'Calculateur du "Coût d\'un Changement de Fenêtres"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-systeme-chauffage',
    component: 'CalculateurCoutSystemeChauffage',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Système de Chauffage" (pompe à chaleur, chaudière)',
    description: 'Calculateur du "Coût d\'un Système de Chauffage" (pompe à chaleur, chaudière)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-installation-panneaux-solaires',
    component: 'CalculateurCoutInstallationPanneauxSolaires',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'une Installation de Panneaux Solaires"',
    description: 'Calculateur du "Coût d\'une Installation de Panneaux Solaires"',
    hasContent: true,
  },

  {
    slug: 'calculateur-rentabilite-panneaux-solaires',
    component: 'CalculateurRentabilitePanneauxSolaires',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur de la "Rentabilité" des panneaux solaires (autoconsommation vs. revente)',
    description: 'Calculateur de la "Rentabilité" des panneaux solaires (autoconsommation vs. revente)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-recuperation-eau-pluie',
    component: 'CalculateurCoutRecuperationEauPluie',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Système de Récupération d\'Eau de Pluie"',
    description: 'Calculateur du "Coût d\'un Système de Récupération d\'Eau de Pluie"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-poele-bois',
    component: 'CalculateurCoutPoeleBois',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Poêle à Bois/Granulés"',
    description: 'Calculateur du "Coût d\'un Poêle à Bois/Granulés"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-adoucisseur-eau',
    component: 'CalculateurCoutAdoucisseurEau',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Adoucisseur d\'Eau"',
    description: 'Calculateur du "Coût d\'un Adoucisseur d\'Eau"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-systeme-alarme',
    component: 'CalculateurCoutSystemeAlarme',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Système d\'Alarme"',
    description: 'Calculateur du "Coût d\'un Système d\'Alarme"',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-jardinier',
    component: 'CalculateurCoutJardinier',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Jardinier" (avec crédit d\'impôt)',
    description: 'Calculateur du "Coût d\'un Jardinier" (avec crédit d\'impôt)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-syndic-copropriete',
    component: 'CalculateurCoutSyndicCopropriete',
    category: 'fiscalité-et-emploi-indépendants',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'un Syndic de Copropriété"',
    description: 'Calculateur du "Coût d\'un Syndic de Copropriété"',
    hasContent: true,
  },

  {
    slug: 'calculateur-rupture-conventionnelle',
    component: 'CalculateurRuptureConventionnelle',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Rupture Conventionnelle" (indemnité minimale)',
    description: 'Calculateur de la "Rupture Conventionnelle" (indemnité minimale)',
    hasContent: true,
  },

  {
    slug: 'calculateur-indemnites-licenciement',
    component: 'CalculateurIndemnitesLicenciement',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de l\'indemnité de "Licenciement" (légale et conventionnelle)',
    description: 'Calculateur de l\'indemnité de "Licenciement" (légale et conventionnelle)',
    hasContent: true,
  },

  {
    slug: 'calculateur-solde-tout-compte',
    component: 'CalculateurSoldeToutCompte',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Solde de Tout Compte"',
    description: 'Calculateur du "Solde de Tout Compte"',
    hasContent: true,
  },

  {
    slug: 'calculateur-conges-payes',
    component: 'CalculateurCongesPayes',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur des "Congés Payés" (maintien vs. 1/10ème)',
    description: 'Calculateur des "Congés Payés" (maintien vs. 1/10ème)',
    hasContent: true,
  },

  {
    slug: 'calculateur-rtt',
    component: 'CalculateurRtt',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur des "RTT" (Réduction du Temps de Travail)',
    description: 'Calculateur des "RTT" (Réduction du Temps de Travail)',
    hasContent: true,
  },

  {
    slug: 'calculateur-compte-epargne-temps',
    component: 'CalculateurCompteEpargneTemps',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Compte Épargne-Temps" (CET)',
    description: 'Calculateur du "Compte Épargne-Temps" (CET)',
    hasContent: true,
  },

  {
    slug: 'calculateur-heures-supplementaires',
    component: 'CalculateurHeuresSupplementaires',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur des "Heures Supplémentaires" (majoration et défiscalisation)',
    description: 'Calculateur des "Heures Supplémentaires" (majoration et défiscalisation)',
    hasContent: true,
  },

  {
    slug: 'calculateur-travail-nuit-dimanche',
    component: 'CalculateurTravailNuitDimanche',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Travail de Nuit/Dimanche/Jours Fériés"',
    description: 'Calculateur du "Travail de Nuit/Dimanche/Jours Fériés"',
    hasContent: true,
  },

  {
    slug: 'calculateur-activite-partielle',
    component: 'CalculateurActivitePartielle',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de l\'"Activité Partielle" (chômage partiel)',
    description: 'Calculateur de l\'"Activité Partielle" (chômage partiel)',
    hasContent: true,
  },

  {
    slug: 'calculateur-prime-partage-valeur',
    component: 'CalculateurPrimePartageValeur',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Prime de Partage de la Valeur" (PPV)',
    description: 'Calculateur de la "Prime de Partage de la Valeur" (PPV)',
    hasContent: true,
  },

  {
    slug: 'calculateur-interessement-participation',
    component: 'CalculateurInteressementParticipation',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de l\'"Intéressement" et de la "Participation"',
    description: 'Calculateur de l\'"Intéressement" et de la "Participation"',
    hasContent: true,
  },

  {
    slug: 'calculateur-abondement-entreprise',
    component: 'CalculateurAbondementEntreprise',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de l\'"Abondement" de l\'entreprise sur PEE/PERCO',
    description: 'Calculateur de l\'"Abondement" de l\'entreprise sur PEE/PERCO',
    hasContent: true,
  },

  {
    slug: 'calculateur-titres-restaurant',
    component: 'CalculateurTitresRestaurant',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur des "Titres-Restaurant" (part patronale/salariale)',
    description: 'Calculateur des "Titres-Restaurant" (part patronale/salariale)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cheques-vacances',
    component: 'CalculateurChequesVacances',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur des "Chèques-Vacances"',
    description: 'Calculateur des "Chèques-Vacances"',
    hasContent: true,
  },

  {
    slug: 'calculateur-frais-transport-navigo',
    component: 'CalculateurFraisTransportNavigo',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur des "Frais de Transport" (remboursement 50% Navigo)',
    description: 'Calculateur des "Frais de Transport" (remboursement 50% Navigo)',
    hasContent: true,
  },

  {
    slug: 'calculateur-forfait-mobilites-durables',
    component: 'CalculateurForfaitMobilitesDurables',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Forfait Mobilités Durables"',
    description: 'Calculateur du "Forfait Mobilités Durables"',
    hasContent: true,
  },

  {
    slug: 'calculateur-mutuelle-entreprise',
    component: 'CalculateurMutuelleEntreprise',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Mutuelle d\'Entreprise" (coût et fiscalité)',
    description: 'Calculateur de la "Mutuelle d\'Entreprise" (coût et fiscalité)',
    hasContent: true,
  },

  {
    slug: 'calculateur-prevoyance-collective',
    component: 'CalculateurPrevoyanceCollective',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Prévoyance Collective"',
    description: 'Calculateur de la "Prévoyance Collective"',
    hasContent: true,
  },

  {
    slug: 'calculateur-medecine-travail',
    component: 'CalculateurMedecineTravail',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Médecine du Travail" (coût)',
    description: 'Calculateur de la "Médecine du Travail" (coût)',
    hasContent: true,
  },

  {
    slug: 'calculateur-duer',
    component: 'CalculateurDuer',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Document Unique d\'Évaluation des Risques" (DUER) - coût',
    description: 'Calculateur du "Document Unique d\'Évaluation des Risques" (DUER) - coût',
    hasContent: true,
  },

  {
    slug: 'calculateur-bilan-carbone-entreprise',
    component: 'CalculateurBilanCarboneEntreprise',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Bilan Carbone" d\'une entreprise',
    description: 'Calculateur du "Bilan Carbone" d\'une entreprise',
    hasContent: true,
  },

  {
    slug: 'calculateur-c3s',
    component: 'CalculateurC3s',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Contribution Sociale de Solidarité des Sociétés" (C3S)',
    description: 'Calculateur de la "Contribution Sociale de Solidarité des Sociétés" (C3S)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-salaires',
    component: 'CalculateurTaxeSalaires',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Taxe sur les Salaires"',
    description: 'Calculateur de la "Taxe sur les Salaires"',
    hasContent: true,
  },

  {
    slug: 'calculateur-taxe-apprentissage',
    component: 'CalculateurTaxeApprentissage',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Taxe d\'Apprentissage"',
    description: 'Calculateur de la "Taxe d\'Apprentissage"',
    hasContent: true,
  },

  {
    slug: 'calculateur-contribution-formation-professionnelle',
    component: 'CalculateurContributionFormationProfessionnelle',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Contribution à la Formation Professionnelle"',
    description: 'Calculateur de la "Contribution à la Formation Professionnelle"',
    hasContent: true,
  },

  {
    slug: 'calculateur-contribution-agefiph',
    component: 'CalculateurContributionAgefiph',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Contribution AGEFIPH" (emploi de personnes handicapées)',
    description: 'Calculateur de la "Contribution AGEFIPH" (emploi de personnes handicapées)',
    hasContent: true,
  },

  {
    slug: 'calculateur-seuil-rentabilite',
    component: 'CalculateurSeuilRentabilite',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Seuil de Rentabilité" (point mort)',
    description: 'Calculateur du "Seuil de Rentabilité" (point mort)',
    hasContent: true,
  },

  {
    slug: 'calculateur-bfr',
    component: 'CalculateurBfr',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Besoin en Fonds de Roulement" (BFR)',
    description: 'Calculateur du "Besoin en Fonds de Roulement" (BFR)',
    hasContent: true,
  },

  {
    slug: 'calculateur-tresorerie-nette',
    component: 'CalculateurTresorerieNette',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Trésorerie Nette"',
    description: 'Calculateur de la "Trésorerie Nette"',
    hasContent: true,
  },

  {
    slug: 'calculateur-caf',
    component: 'CalculateurCaf',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Capacité d\'Autofinancement" (CAF)',
    description: 'Calculateur de la "Capacité d\'Autofinancement" (CAF)',
    hasContent: true,
  },

  {
    slug: 'calculateur-ebe',
    component: 'CalculateurEbe',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de l\'"Excédent Brut d\'Exploitation" (EBE)',
    description: 'Calculateur de l\'"Excédent Brut d\'Exploitation" (EBE)',
    hasContent: true,
  },

  {
    slug: 'calculateur-valeur-ajoutee',
    component: 'CalculateurValeurAjoutee',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Valeur Ajoutée" (VA)',
    description: 'Calculateur de la "Valeur Ajoutée" (VA)',
    hasContent: true,
  },

  {
    slug: 'calculateur-ratios-financiers',
    component: 'CalculateurRatiosFinanciers',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur des "Ratios Financiers" (liquidité, solvabilité, rentabilité)',
    description: 'Calculateur des "Ratios Financiers" (liquidité, solvabilité, rentabilité)',
    hasContent: true,
  },

  {
    slug: 'calculateur-valorisation-entreprise',
    component: 'CalculateurValorisationEntreprise',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Valorisation d\'une Entreprise" (méthodes multiples)',
    description: 'Calculateur de la "Valorisation d\'une Entreprise" (méthodes multiples)',
    hasContent: true,
  },

  {
    slug: 'calculateur-business-plan',
    component: 'CalculateurBusinessPlan',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Business Plan" (prévisionnel financier)',
    description: 'Calculateur du "Business Plan" (prévisionnel financier)',
    hasContent: true,
  },

  {
    slug: 'calculateur-financement-startup',
    component: 'CalculateurFinancementStartup',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Financement d\'une Startup" (levée de fonds, dilution)',
    description: 'Calculateur du "Financement d\'une Startup" (levée de fonds, dilution)',
    hasContent: true,
  },

  {
    slug: 'calculateur-pge',
    component: 'CalculateurPge',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Prêt Garanti par l\'État" (PGE) - historique',
    description: 'Calculateur du "Prêt Garanti par l\'État" (PGE) - historique',
    hasContent: true,
  },

  {
    slug: 'calculateur-pret-honneur',
    component: 'CalculateurPretHonneur',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Prêt d\'Honneur"',
    description: 'Calculateur du "Prêt d\'Honneur"',
    hasContent: true,
  },

  {
    slug: 'calculateur-crowdfunding',
    component: 'CalculateurCrowdfunding',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Crowdfunding" (récompense, don, prêt, equity)',
    description: 'Calculateur du "Crowdfunding" (récompense, don, prêt, equity)',
    hasContent: true,
  },

  {
    slug: 'calculateur-credit-bail',
    component: 'CalculateurCreditBail',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Crédit-Bail" (leasing)',
    description: 'Calculateur du "Crédit-Bail" (leasing)',
    hasContent: true,
  },

  {
    slug: 'calculateur-affacturage',
    component: 'CalculateurAffacturage',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de l\'"Affacturage" (factoring)',
    description: 'Calculateur de l\'"Affacturage" (factoring)',
    hasContent: true,
  },

  {
    slug: 'calculateur-dso-dpo',
    component: 'CalculateurDsoDpo',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Délai de Paiement Client/Fournisseur" (DSO/DPO)',
    description: 'Calculateur du "Délai de Paiement Client/Fournisseur" (DSO/DPO)',
    hasContent: true,
  },

  {
    slug: 'calculateur-rotation-stocks',
    component: 'CalculateurRotationStocks',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Rotation des Stocks"',
    description: 'Calculateur de la "Rotation des Stocks"',
    hasContent: true,
  },

  {
    slug: 'calculateur-marge-commerciale',
    component: 'CalculateurMargeCommerciale',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Marge Commerciale"',
    description: 'Calculateur de la "Marge Commerciale"',
    hasContent: true,
  },

  {
    slug: 'calculateur-taux-marque',
    component: 'CalculateurTauxMarque',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Taux de Marque"',
    description: 'Calculateur du "Taux de Marque"',
    hasContent: true,
  },

  {
    slug: 'calculateur-prix-vente-psychologique',
    component: 'CalculateurPrixVentePsychologique',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Prix de Vente Psychologique"',
    description: 'Calculateur du "Prix de Vente Psychologique"',
    hasContent: true,
  },

  {
    slug: 'calculateur-elasticite-prix-demande',
    component: 'CalculateurElasticitePrixDemande',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de l\'"Élasticité-Prix de la Demande"',
    description: 'Calculateur de l\'"Élasticité-Prix de la Demande"',
    hasContent: true,
  },

  {
    slug: 'calculateur-clv',
    component: 'CalculateurClv',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Valeur Vie Client" (Customer Lifetime Value - CLV)',
    description: 'Calculateur de la "Valeur Vie Client" (Customer Lifetime Value - CLV)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cac',
    component: 'CalculateurCac',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'Acquisition Client" (CAC)',
    description: 'Calculateur du "Coût d\'Acquisition Client" (CAC)',
    hasContent: true,
  },

  {
    slug: 'calculateur-taux-conversion',
    component: 'CalculateurTauxConversion',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Taux de Conversion"',
    description: 'Calculateur du "Taux de Conversion"',
    hasContent: true,
  },

  {
    slug: 'calculateur-leasing-loa-vs-credit-lld',
    component: 'CalculateurLeasingLoaVsCreditLld',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Leasing" (LOA) vs. "Crédit Classique" vs. "LLD"',
    description: 'Calculateur du "Leasing" (LOA) vs. "Crédit Classique" vs. "LLD"',
    hasContent: true,
  },

  {
    slug: 'calculateur-valeur-rachat-loa',
    component: 'CalculateurValeurRachatLoa',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur de la "Valeur de Rachat" d\'un véhicule en LOA',
    description: 'Calculateur de la "Valeur de Rachat" d\'un véhicule en LOA',
    hasContent: true,
  },

  {
    slug: 'calculateur-tco-vehicule-electrique-thermique',
    component: 'CalculateurTcoVehiculeElectriqueThermique',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Coût Total de Possession" (TCO) d\'un véhicule électrique vs. thermique',
    description: 'Calculateur du "Coût Total de Possession" (TCO) d\'un véhicule électrique vs. thermique',
    hasContent: true,
  },

  {
    slug: 'calculateur-aides-achat-vehicule-electrique',
    component: 'CalculateurAidesAchatVehiculeElectrique',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur des "Aides à l\'Achat" d\'un véhicule électrique/hybride',
    description: 'Calculateur des "Aides à l\'Achat" d\'un véhicule électrique/hybride',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-recharge-vehicule-electrique',
    component: 'CalculateurCoutRechargeVehiculeElectrique',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Coût de la Recharge" d\'un véhicule électrique (domicile, travail, public)',
    description: 'Calculateur du "Coût de la Recharge" d\'un véhicule électrique (domicile, travail, public)',
    hasContent: true,
  },

  {
    slug: 'calculateur-cout-installation-borne-recharge',
    component: 'CalculateurCoutInstallationBorneRecharge',
    category: 'pme-et-entreprises',
    lang: 'fr',
    title: 'Calculateur du "Coût d\'Installation" d\'une borne de recharge',
    description: 'Calculateur du "Coût d\'Installation" d\'une borne de recharge',
    hasContent: true,
  },

  {
    slug: 'credit-card-payoff-optimizer',
    component: 'CreditCardPayoffOptimizer',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Credit Card Payoff Optimizer',
    description: 'Credit Card Payoff Optimizer',
    hasContent: true,
  },

  {
    slug: 'emergency-fund-calculator',
    component: 'EmergencyFundCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Emergency Fund Calculator',
    description: 'Emergency Fund Calculator',
    hasContent: true,
  },

  {
    slug: 'tax-loss-harvesting-calculator',
    component: 'TaxLossHarvestingCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Tax Loss Harvesting Calculator',
    description: 'Tax Loss Harvesting Calculator',
    hasContent: true,
  },

  {
    slug: 'pension-vs-401k-calculator',
    component: 'PensionVs401kCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Pension vs 401k Calculator',
    description: 'Pension vs 401k Calculator',
    hasContent: true,
  },

  {
    slug: 'inheritance-tax-calculator',
    component: 'InheritanceTaxCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Inheritance Tax Calculator',
    description: 'Inheritance Tax Calculator',
    hasContent: true,
  },

  {
    slug: 'freelancer-rate-calculator',
    component: 'FreelancerRateCalculator',
    category: 'finance-and-investment',
    lang: 'en',
    title: 'Freelancer Rate Calculator',
    description: 'Freelancer Rate Calculator',
    hasContent: true,
  },

  {
    slug: 'mental-health-days-calculator',
    component: 'MentalHealthDaysCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Mental Health Days Calculator',
    description: 'Mental Health Days Calculator',
    hasContent: true,
  },

  {
    slug: 'hydration-calculator',
    component: 'HydrationCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Hydration Calculator',
    description: 'Hydration Calculator',
    hasContent: true,
  },

  {
    slug: 'circadian-rhythm-calculator',
    component: 'CircadianRhythmCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Circadian Rhythm Calculator',
    description: 'Circadian Rhythm Calculator',
    hasContent: true,
  },

  {
    slug: 'meditation-benefits-calculator',
    component: 'MeditationBenefitsCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Meditation Benefits Calculator',
    description: 'Meditation Benefits Calculator',
    hasContent: true,
  },

  {
    slug: 'stress-level-calculator',
    component: 'StressLevelCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Stress Level Calculator',
    description: 'Stress Level Calculator',
    hasContent: true,
  },

  {
    slug: 'supplement-dosage-calculator',
    component: 'SupplementDosageCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Supplement Dosage Calculator',
    description: 'Supplement Dosage Calculator',
    hasContent: true,
  },

  {
    slug: 'air-quality-health-impact-calculator',
    component: 'AirQualityHealthImpactCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Air Quality Health Impact Calculator',
    description: 'Air Quality Health Impact Calculator',
    hasContent: true,
  },

  {
    slug: 'screen-time-health-calculator',
    component: 'ScreenTimeHealthCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Screen Time Health Calculator',
    description: 'Screen Time Health Calculator',
    hasContent: true,
  },

  {
    slug: 'posture-correction-calculator',
    component: 'PostureCorrectionCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Posture Correction Calculator',
    description: 'Posture Correction Calculator',
    hasContent: true,
  },

  {
    slug: 'longevity-calculator',
    component: 'LongevityCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Longevity Calculator',
    description: 'Longevity Calculator',
    hasContent: true,
  },

  {
    slug: 'hormone-balance-calculator',
    component: 'HormoneBalanceCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Hormone Balance Calculator',
    description: 'Hormone Balance Calculator',
    hasContent: true,
  },

  {
    slug: 'addiction-recovery-progress-calculator',
    component: 'AddictionRecoveryProgressCalculator',
    category: 'health-&-wellness',
    lang: 'en',
    title: 'Addiction Recovery Progress Calculator',
    description: 'Addiction Recovery Progress Calculator',
    hasContent: true,
  },

  {
    slug: 'gaming-setup-roi-calculator',
    component: 'GamingSetupRoiCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'Gaming Setup ROI Calculator',
    description: 'Gaming Setup ROI Calculator',
    hasContent: true,
  },

  {
    slug: 'streaming-revenue-calculator',
    component: 'StreamingRevenueCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'Streaming Revenue Calculator',
    description: 'Streaming Revenue Calculator',
    hasContent: true,
  },

  {
    slug: 'tournament-prize-pool-calculator',
    component: 'TournamentPrizePoolCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'Tournament Prize Pool Calculator',
    description: 'Tournament Prize Pool Calculator',
    hasContent: true,
  },

  {
    slug: 'gaming-time-optimization-calculator',
    component: 'GamingTimeOptimizationCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'Gaming Time Optimization Calculator',
    description: 'Gaming Time Optimization Calculator',
    hasContent: true,
  },

  {
    slug: 'esports-training-schedule-calculator',
    component: 'EsportsTrainingScheduleCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'eSports Training Schedule Calculator',
    description: 'eSports Training Schedule Calculator',
    hasContent: true,
  },

  {
    slug: 'game-development-cost-calculator',
    component: 'GameDevelopmentCostCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'Game Development Cost Calculator',
    description: 'Game Development Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'twitch-follower-growth-calculator',
    component: 'TwitchFollowerGrowthCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'Twitch Follower Growth Calculator',
    description: 'Twitch Follower Growth Calculator',
    hasContent: true,
  },

  {
    slug: 'gaming-addiction-calculator',
    component: 'GamingAddictionCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'Gaming Addiction Calculator',
    description: 'Gaming Addiction Calculator',
    hasContent: true,
  },

  {
    slug: 'console-vs-pc-cost-calculator',
    component: 'ConsoleVsPcCostCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'Console vs PC Cost Calculator',
    description: 'Console vs PC Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'game-collection-value-calculator',
    component: 'GameCollectionValueCalculator',
    category: 'gaming-&-esports',
    lang: 'en',
    title: 'Game Collection Value Calculator',
    description: 'Game Collection Value Calculator',
    hasContent: true,
  },

  {
    slug: 'personal-carbon-credit-calculator',
    component: 'PersonalCarbonCreditCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Personal Carbon Credit Calculator',
    description: 'Personal Carbon Credit Calculator',
    hasContent: true,
  },

  {
    slug: 'zero-waste-lifestyle-calculator',
    component: 'ZeroWasteLifestyleCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Zero Waste Lifestyle Calculator',
    description: 'Zero Waste Lifestyle Calculator',
    hasContent: true,
  },

  {
    slug: 'renewable-energy-savings-calculator',
    component: 'RenewableEnergySavingsCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Renewable Energy Savings Calculator',
    description: 'Renewable Energy Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'electric-vs-gas-car-calculator',
    component: 'ElectricVsGasCarCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Electric vs Gas Car Calculator',
    description: 'Electric vs Gas Car Calculator',
    hasContent: true,
  },

  {
    slug: 'sustainable-fashion-calculator',
    component: 'SustainableFashionCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Sustainable Fashion Calculator',
    description: 'Sustainable Fashion Calculator',
    hasContent: true,
  },

  {
    slug: 'food-waste-calculator',
    component: 'FoodWasteCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Food Waste Calculator',
    description: 'Food Waste Calculator',
    hasContent: true,
  },

  {
    slug: 'green-home-investment-calculator',
    component: 'GreenHomeInvestmentCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Green Home Investment Calculator',
    description: 'Green Home Investment Calculator',
    hasContent: true,
  },

  {
    slug: 'composting-benefits-calculator',
    component: 'CompostingBenefitsCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Composting Benefits Calculator',
    description: 'Composting Benefits Calculator',
    hasContent: true,
  },

  {
    slug: 'plastic-free-savings-calculator',
    component: 'PlasticFreeSavingsCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Plastic-Free Savings Calculator',
    description: 'Plastic-Free Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'urban-garden-yield-calculator',
    component: 'UrbanGardenYieldCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Urban Garden Yield Calculator',
    description: 'Urban Garden Yield Calculator',
    hasContent: true,
  },

  {
    slug: 'rainwater-harvesting-calculator',
    component: 'RainwaterHarvestingCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Rainwater Harvesting Calculator',
    description: 'Rainwater Harvesting Calculator',
    hasContent: true,
  },

  {
    slug: 'bike-vs-car-calculator',
    component: 'BikeVsCarCalculator',
    category: 'sustainability-&-environment',
    lang: 'en',
    title: 'Bike vs Car Calculator',
    description: 'Bike vs Car Calculator',
    hasContent: true,
  },

  {
    slug: 'smart-home-roi-calculator',
    component: 'SmartHomeRoiCalculator',
    category: 'smart-home-&-technology',
    lang: 'en',
    title: 'Smart Home ROI Calculator',
    description: 'Smart Home ROI Calculator',
    hasContent: true,
  },

  {
    slug: 'internet-speed-need-calculator',
    component: 'InternetSpeedNeedCalculator',
    category: 'smart-home-&-technology',
    lang: 'en',
    title: 'Internet Speed Need Calculator',
    description: 'Internet Speed Need Calculator',
    hasContent: true,
  },

  {
    slug: 'home-security-system-calculator',
    component: 'HomeSecuritySystemCalculator',
    category: 'smart-home-&-technology',
    lang: 'en',
    title: 'Home Security System Calculator',
    description: 'Home Security System Calculator',
    hasContent: true,
  },

  {
    slug: 'energy-monitor-savings-calculator',
    component: 'EnergyMonitorSavingsCalculator',
    category: 'smart-home-&-technology',
    lang: 'en',
    title: 'Energy Monitor Savings Calculator',
    description: 'Energy Monitor Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'home-automation-cost-calculator',
    component: 'HomeAutomationCostCalculator',
    category: 'smart-home-&-technology',
    lang: 'en',
    title: 'Home Automation Cost Calculator',
    description: 'Home Automation Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'wifi-coverage-calculator',
    component: 'WifiCoverageCalculator',
    category: 'smart-home-&-technology',
    lang: 'en',
    title: 'WiFi Coverage Calculator',
    description: 'WiFi Coverage Calculator',
    hasContent: true,
  },

  {
    slug: 'smart-thermostat-savings-calculator',
    component: 'SmartThermostatSavingsCalculator',
    category: 'smart-home-&-technology',
    lang: 'en',
    title: 'Smart Thermostat Savings Calculator',
    description: 'Smart Thermostat Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'home-office-setup-calculator',
    component: 'HomeOfficeSetupCalculator',
    category: 'smart-home-&-technology',
    lang: 'en',
    title: 'Home Office Setup Calculator',
    description: 'Home Office Setup Calculator',
    hasContent: true,
  },

  {
    slug: 'online-course-roi-calculator',
    component: 'OnlineCourseRoiCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Online Course ROI Calculator',
    description: 'Online Course ROI Calculator',
    hasContent: true,
  },

  {
    slug: 'skill-development-time-calculator',
    component: 'SkillDevelopmentTimeCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Skill Development Time Calculator',
    description: 'Skill Development Time Calculator',
    hasContent: true,
  },

  {
    slug: 'career-change-cost-calculator',
    component: 'CareerChangeCostCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Career Change Cost Calculator',
    description: 'Career Change Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'certification-value-calculator',
    component: 'CertificationValueCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Certification Value Calculator',
    description: 'Certification Value Calculator',
    hasContent: true,
  },

  {
    slug: 'study-abroad-cost-calculator',
    component: 'StudyAbroadCostCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Study Abroad Cost Calculator',
    description: 'Study Abroad Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'networking-events-roi-calculator',
    component: 'NetworkingEventsRoiCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Networking Events ROI Calculator',
    description: 'Networking Events ROI Calculator',
    hasContent: true,
  },

  {
    slug: 'professional-development-calculator',
    component: 'ProfessionalDevelopmentCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Professional Development Calculator',
    description: 'Professional Development Calculator',
    hasContent: true,
  },

  {
    slug: 'remote-work-savings-calculator',
    component: 'RemoteWorkSavingsCalculator',
    category: 'education-&-career',
    lang: 'en',
    title: 'Remote Work Savings Calculator',
    description: 'Remote Work Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'travel-carbon-offset-calculator',
    component: 'TravelCarbonOffsetCalculator',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'Travel Carbon Offset Calculator',
    description: 'Travel Carbon Offset Calculator',
    hasContent: true,
  },

  {
    slug: 'hobby-cost-calculator',
    component: 'HobbyCostCalculator',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'Hobby Cost Calculator',
    description: 'Hobby Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'pet-ownership-cost-calculator',
    component: 'PetOwnershipCostCalculator',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'Pet Ownership Cost Calculator',
    description: 'Pet Ownership Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'wedding-budget-optimizer',
    component: 'WeddingBudgetOptimizer',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'Wedding Budget Optimizer',
    description: 'Wedding Budget Optimizer',
    hasContent: true,
  },

  {
    slug: 'moving-cost-calculator',
    component: 'MovingCostCalculator',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'Moving Cost Calculator',
    description: 'Moving Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'minimalism-savings-calculator',
    component: 'MinimalismSavingsCalculator',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'Minimalism Savings Calculator',
    description: 'Minimalism Savings Calculator',
    hasContent: true,
  },

  {
    slug: 'subscription-audit-calculator',
    component: 'SubscriptionAuditCalculator',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'Subscription Audit Calculator',
    description: 'Subscription Audit Calculator',
    hasContent: true,
  },

  {
    slug: 'social-media-time-calculator',
    component: 'SocialMediaTimeCalculator',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'Social Media Time Calculator',
    description: 'Social Media Time Calculator',
    hasContent: true,
  },

  {
    slug: 'reading-goal-calculator',
    component: 'ReadingGoalCalculator',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'Reading Goal Calculator',
    description: 'Reading Goal Calculator',
    hasContent: true,
  },

  {
    slug: 'diy-project-cost-calculator',
    component: 'DiyProjectCostCalculator',
    category: 'lifestyle-&-entertainment',
    lang: 'en',
    title: 'DIY Project Cost Calculator',
    description: 'DIY Project Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'social-media-roi-calculator',
    component: 'SocialMediaRoiCalculator',
    category: 'business-&-marketing',
    lang: 'en',
    title: 'Social Media ROI Calculator',
    description: 'Social Media ROI Calculator',
    hasContent: true,
  },

  {
    slug: 'content-marketing-calculator',
    component: 'ContentMarketingCalculator',
    category: 'business-&-marketing',
    lang: 'en',
    title: 'Content Marketing Calculator',
    description: 'Content Marketing Calculator',
    hasContent: true,
  },

  {
    slug: 'customer-acquisition-cost-calculator',
    component: 'CustomerAcquisitionCostCalculator',
    category: 'business-&-marketing',
    lang: 'en',
    title: 'Customer Acquisition Cost Calculator',
    description: 'Customer Acquisition Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'influencer-campaign-calculator',
    component: 'InfluencerCampaignCalculator',
    category: 'business-&-marketing',
    lang: 'en',
    title: 'Influencer Campaign Calculator',
    description: 'Influencer Campaign Calculator',
    hasContent: true,
  },

  {
    slug: 'email-marketing-roi-calculator',
    component: 'EmailMarketingRoiCalculator',
    category: 'business-&-marketing',
    lang: 'en',
    title: 'Email Marketing ROI Calculator',
    description: 'Email Marketing ROI Calculator',
    hasContent: true,
  },

  {
    slug: 'seo-investment-calculator',
    component: 'SeoInvestmentCalculator',
    category: 'business-&-marketing',
    lang: 'en',
    title: 'SEO Investment Calculator',
    description: 'SEO Investment Calculator',
    hasContent: true,
  },

  {
    slug: 'brand-value-calculator',
    component: 'BrandValueCalculator',
    category: 'business-&-marketing',
    lang: 'en',
    title: 'Brand Value Calculator',
    description: 'Brand Value Calculator',
    hasContent: true,
  },

  {
    slug: 'startup-equity-calculator',
    component: 'StartupEquityCalculator',
    category: 'business-&-marketing',
    lang: 'en',
    title: 'Startup Equity Calculator',
    description: 'Startup Equity Calculator',
    hasContent: true,
  },

  {
    slug: 'digital-detox-calculator',
    component: 'DigitalDetoxCalculator',
    category: 'digital-health-&-wellbeing',
    lang: 'en',
    title: 'Digital Detox Calculator',
    description: 'Digital Detox Calculator',
    hasContent: true,
  },

  {
    slug: 'productivity-calculator',
    component: 'ProductivityCalculator',
    category: 'digital-health-&-wellbeing',
    lang: 'en',
    title: 'Productivity Calculator',
    description: 'Productivity Calculator',
    hasContent: true,
  },

  {
    slug: 'work-life-balance-calculator',
    component: 'WorkLifeBalanceCalculator',
    category: 'digital-health-&-wellbeing',
    lang: 'en',
    title: 'Work-Life Balance Calculator',
    description: 'Work-Life Balance Calculator',
    hasContent: true,
  },

  {
    slug: 'burnout-risk-calculator',
    component: 'BurnoutRiskCalculator',
    category: 'digital-health-&-wellbeing',
    lang: 'en',
    title: 'Burnout Risk Calculator',
    description: 'Burnout Risk Calculator',
    hasContent: true,
  },

  {
    slug: 'sleep-quality-calculator',
    component: 'SleepQualityCalculator',
    category: 'digital-health-&-wellbeing',
    lang: 'en',
    title: 'Sleep Quality Calculator',
    description: 'Sleep Quality Calculator',
    hasContent: true,
  },

  {
    slug: 'focus-time-calculator',
    component: 'FocusTimeCalculator',
    category: 'digital-health-&-wellbeing',
    lang: 'en',
    title: 'Focus Time Calculator',
    description: 'Focus Time Calculator',
    hasContent: true,
  },

  {
    slug: 'habit-formation-calculator',
    component: 'HabitFormationCalculator',
    category: 'digital-health-&-wellbeing',
    lang: 'en',
    title: 'Habit Formation Calculator',
    description: 'Habit Formation Calculator',
    hasContent: true,
  },

  {
    slug: 'legal-fee-calculator',
    component: 'LegalFeeCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Legal Fee Calculator',
    description: 'Legal Fee Calculator',
    hasContent: true,
  },

  {
    slug: 'patent-application-cost-calculator',
    component: 'PatentApplicationCostCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Patent Application Cost Calculator',
    description: 'Patent Application Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'insurance-claim-calculator',
    component: 'InsuranceClaimCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Insurance Claim Calculator',
    description: 'Insurance Claim Calculator',
    hasContent: true,
  },

  {
    slug: 'real-estate-commission-calculator',
    component: 'RealEstateCommissionCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Real Estate Commission Calculator',
    description: 'Real Estate Commission Calculator',
    hasContent: true,
  },

  {
    slug: 'contractor-bid-calculator',
    component: 'ContractorBidCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Contractor Bid Calculator',
    description: 'Contractor Bid Calculator',
    hasContent: true,
  },

  {
    slug: 'event-planning-cost-calculator',
    component: 'EventPlanningCostCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Event Planning Cost Calculator',
    description: 'Event Planning Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'graphic-design-pricing-calculator',
    component: 'GraphicDesignPricingCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Graphic Design Pricing Calculator',
    description: 'Graphic Design Pricing Calculator',
    hasContent: true,
  },

  {
    slug: 'translation-cost-calculator',
    component: 'TranslationCostCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Translation Cost Calculator',
    description: 'Translation Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'consulting-rate-calculator',
    component: 'ConsultingRateCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Consulting Rate Calculator',
    description: 'Consulting Rate Calculator',
    hasContent: true,
  },

  {
    slug: 'product-launch-cost-calculator',
    component: 'ProductLaunchCostCalculator',
    category: 'professional-&-specialized',
    lang: 'en',
    title: 'Product Launch Cost Calculator',
    description: 'Product Launch Cost Calculator',
    hasContent: true,
  },

  {
    slug: 'negoziazione-guide',
    component: 'NegoziazioneGuide',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Negoziazione Guide',
    description: 'Negoziazione Guide',
    hasContent: true,
  },

  {
    slug: 'irfep-cuneo-guide',
    component: 'IrfepCuneoGuide',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Guida alle Aliquote IRPEF e al Taglio del Cuneo Fiscale 2025',
    description: 'Guida alle Aliquote IRPEF e al Taglio del Cuneo Fiscale 2025',
    hasContent: true,
  },

  {
    slug: 'busta-paga-guide',
    component: 'BustaPagaGuide',
    category: 'pmi-e-impresa',
    lang: 'it',
    title: 'Addizionali Regionali e Comunali: La Geografia della Tassazione',
    description: 'Addizionali Regionali e Comunali: La Geografia della Tassazione',
    hasContent: true,
  }
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
