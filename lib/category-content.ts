/**
 * Category descriptions and FAQs for SEO
 * Add descriptions and FAQs for each category to improve SEO and user experience
 */

export interface CategoryContent {
  description: string;
  longDescription?: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

type CategoryContentMap = {
  [key: string]: {
    [lang: string]: CategoryContent;
  };
};

export const CATEGORY_CONTENT: CategoryContentMap = {
  // Italian Categories
  'fisco-e-lavoro-autonomo': {
    it: {
      description:
        'Calcolatori professionali per liberi professionisti e lavoratori autonomi: tasse, contributi INPS, regime forfettario e molto altro.',
      longDescription:
        'Gestire il fisco da lavoratore autonomo può essere complesso. I nostri calcolatori ti aiutano a simulare tasse, contributi previdenziali, acconti e saldo, permettendoti di pianificare con precisione le tue finanze e ottimizzare il carico fiscale.',
      faqs: [
        {
          question: 'Come si calcolano le tasse in regime forfettario?',
          answer:
            'Il regime forfettario prevede un\'imposta sostitutiva del 5% per i primi 5 anni (se rispetti i requisiti) o del 15% negli anni successivi. Si applica sul reddito imponibile, calcolato applicando il coefficiente di redditività al fatturato. A questo si aggiungono i contributi INPS nella gestione separata o nella cassa di appartenenza.',
        },
        {
          question: 'Quali sono i limiti del regime forfettario 2025?',
          answer:
            'Nel 2025, il limite di fatturato per il regime forfettario è di 85.000 euro annui. Ci sono anche altri requisiti da rispettare, come il limite di spese per collaboratori (20.000 euro) e l\'assenza di partecipazioni in società di capitali nel settore di attività.',
        },
        {
          question: 'Come funzionano i contributi INPS per i liberi professionisti?',
          answer:
            'I contributi INPS variano in base alla cassa previdenziale di appartenenza. Per chi è iscritto alla gestione separata INPS, l\'aliquota è circa il 26,23% sul reddito. Alcuni professionisti hanno casse private (ENPAM, ENPAP, INARCASSA, etc.) con aliquote diverse.',
        },
        {
          question: 'Quando si pagano gli acconti delle tasse?',
          answer:
            'Gli acconti si pagano in due rate: la prima entro il 30 giugno (eventualmente prorogata) e la seconda entro il 30 novembre. L\'importo è calcolato in base alle imposte dell\'anno precedente, con il metodo storico (100%) o previsionale (se prevedi un reddito inferiore).',
        },
        {
          question: 'Conviene il regime forfettario o ordinario?',
          answer:
            'Dipende dal tuo fatturato, dalle spese deducibili e dalla situazione personale. Il forfettario è vantaggioso per redditi medio-bassi e poche spese, mentre l\'ordinario può convenire con molte spese deducibili, redditi elevati o necessità di scaricare l\'IVA.',
        },
      ],
    },
  },

  'immobiliare-e-casa': {
    it: {
      description:
        'Calcolatori per immobiliare, mutui, affitti, ristrutturazioni e detrazioni fiscali per la casa.',
      longDescription:
        'Dall\'acquisto alla vendita, dalla locazione alle ristrutturazioni: i nostri calcolatori ti aiutano a gestire tutti gli aspetti economici e fiscali legati alla casa e agli immobili.',
      faqs: [
        {
          question: 'Come si calcola l\'IMU sulla seconda casa?',
          answer:
            'L\'IMU si calcola moltiplicando la rendita catastale rivalutata del 5%, per il coefficiente catastale della categoria (160 per abitazioni), per l\'aliquota comunale. L\'importo varia in base al comune e ad eventuali maggiorazioni.',
        },
        {
          question: 'Conviene la cedolare secca o la tassazione ordinaria?',
          answer:
            'La cedolare secca (21% per libero, 10% per concordato) è spesso conveniente perché sostituisce IRPEF, addizionali, imposte di registro e bollo. La tassazione ordinaria può convenire con redditi molto bassi o molte spese deducibili.',
        },
        {
          question: 'Come funzionano le detrazioni per ristrutturazione?',
          answer:
            'La detrazione è del 50% delle spese sostenute (massimo 96.000 euro per unità), ripartita in 10 quote annuali di pari importo. Si recupera tramite dichiarazione dei redditi. È necessario pagare con bonifico parlante.',
        },
        {
          question: 'Come si calcola la plusvalenza sulla vendita di un immobile?',
          answer:
            'La plusvalenza tassabile è la differenza tra prezzo di vendita e prezzo di acquisto (più spese). È esente se l\'immobile è prima casa da oltre 5 anni. Altrimenti si paga il 26% sulla plusvalenza o IRPEF a scelta.',
        },
        {
          question: 'Quanto costa un notaio per un mutuo?',
          answer:
            'Il costo del notaio per un mutuo varia da 1.500 a 3.000 euro circa, includendo onorario notarile, imposte ipotecarie e catastali (2% + 200 euro per prima casa), visure e pratiche. Il costo dipende dall\'importo del mutuo e dalla complessità.',
        },
      ],
    },
  },

  'pmi-e-impresa': {
    it: {
      description:
        'Strumenti per PMI e imprese: costi aziendali, buste paga, break-even, margini e indicatori finanziari.',
      longDescription:
        'Gestire un\'impresa richiede controllo costante dei numeri. I nostri calcolatori ti aiutano a monitorare costi, margini, flussi di cassa e indicatori chiave per decisioni informate.',
      faqs: [
        {
          question: 'Come si calcola il costo totale di un dipendente?',
          answer:
            'Il costo totale include RAL (Retribuzione Annua Lorda), contributi INPS a carico azienda (circa 30%), TFR (6,91%), INAIL e eventuali benefit. In media, il costo azienda è circa il 140-150% della RAL.',
        },
        {
          question: 'Cos\'è il break-even point?',
          answer:
            'Il break-even point è il fatturato necessario per coprire tutti i costi (fissi e variabili) senza generare né profitti né perdite. Si calcola dividendo i costi fissi per il margine di contribuzione percentuale.',
        },
        {
          question: 'Come si calcola il margine di contribuzione?',
          answer:
            'Il margine di contribuzione è il ricavo meno i costi variabili. Può essere espresso in valore assoluto o percentuale. Serve a capire quanto ogni vendita contribuisce a coprire i costi fissi e generare profitto.',
        },
        {
          question: 'Quali tasse paga una SRL?',
          answer:
            'Una SRL paga IRES (24% sull\'utile), IRAP (3,9% mediamente, varia per regione), e eventuali imposte locali. Poi i soci pagano imposte sui dividendi distribuiti (26%) o sui compensi da amministratore (IRPEF + INPS).',
        },
        {
          question: 'Come funziona la liquidazione IVA trimestrale?',
          answer:
            'Con la liquidazione trimestrale, l\'IVA si versa entro il 16 del secondo mese successivo al trimestre. Si calcola la differenza tra IVA a debito (su vendite) e IVA a credito (su acquisti). C\'è una maggiorazione dell\'1% sull\'importo da versare.',
        },
      ],
    },
  },

  'risparmio-e-investimenti': {
    it: {
      description:
        'Calcolatori per investimenti, rendimenti, tassazione capital gain, PAC, fondi pensione e gestione patrimonio.',
      longDescription:
        'Investire richiede pianificazione e comprensione della tassazione. I nostri strumenti ti aiutano a calcolare rendimenti netti, confrontare prodotti finanziari e ottimizzare il tuo portafoglio.',
      faqs: [
        {
          question: 'Come si tassa il capital gain in Italia?',
          answer:
            'Le plusvalenze finanziarie sono tassate al 26% (12,5% per titoli di stato). Si può optare per regime amministrato (banca calcola e versa), dichiarativo (dichiari tu) o gestito (per gestioni patrimoniali). Le minusvalenze si possono compensare con plusvalenze per 4 anni.',
        },
        {
          question: 'Conviene investire in un fondo pensione?',
          answer:
            'I fondi pensione offrono vantaggi fiscali: deduzione contributi fino a 5.164 euro/anno, tassazione agevolata (20% su rendimenti, 15% con sconti per anzianità su prestazioni). Sono ideali per il lungo termine, ma hanno vincoli di disinvestimento.',
        },
        {
          question: 'Come funziona un PAC (Piano di Accumulo)?',
          answer:
            'Un PAC prevede versamenti periodici (mensili/trimestrali) su fondi o ETF. Permette di mediare il prezzo di carico nel tempo, riducendo il rischio di timing. È ideale per investimenti di lungo termine con capitale limitato.',
        },
        {
          question: 'Gli ETF sono tassati come i fondi?',
          answer:
            'Gli ETF armonizzati (europei) sono tassati al 26% sul capital gain, come le azioni. I fondi comuni hanno tassazione simile ma con regime fiscale diverso sugli switch (passaggi tra fondi della stessa casa possono essere a realizzo controllato).',
        },
        {
          question: 'Come si calcola il rendimento netto di un BTP?',
          answer:
            'Il rendimento lordo del BTP va decurtato della tassazione (12,5% sulle cedole e sul capital gain), dell\'imposta di bollo (0,20% sul valore di mercato) e di eventuali costi di acquisto. Il rendimento netto è significativamente inferiore al lordo.',
        },
      ],
    },
  },

  // English Categories
  'finance-and-investment': {
    en: {
      description:
        'Professional calculators for investments, savings, retirement planning, and wealth management.',
      longDescription:
        'Make informed financial decisions with our comprehensive suite of investment and finance calculators. From FIRE planning to crypto portfolios, we help you optimize your financial future.',
      faqs: [
        {
          question: 'What is the FIRE movement?',
          answer:
            'FIRE (Financial Independence, Retire Early) is a movement focused on extreme savings and investments to retire much earlier than traditional retirement age. It typically requires saving 50-70% of income and achieving 25-30x annual expenses in investments.',
        },
        {
          question: 'How is capital gains tax calculated?',
          answer:
            'Capital gains tax varies by country. In the US, short-term gains (< 1 year) are taxed as ordinary income, while long-term gains have preferential rates (0%, 15%, or 20% depending on income). In the UK, CGT is 10% or 20% depending on income level.',
        },
        {
          question: 'What is dollar cost averaging?',
          answer:
            'Dollar cost averaging (DCA) is an investment strategy where you invest a fixed amount at regular intervals, regardless of market conditions. This reduces the impact of volatility and eliminates the need to time the market.',
        },
        {
          question: 'How do I calculate investment returns?',
          answer:
            'Investment returns can be calculated using simple return (ending value - beginning value / beginning value) or compound annual growth rate (CAGR). Always consider fees, taxes, and inflation for accurate real returns.',
        },
        {
          question: 'What fees should I watch out for in investments?',
          answer:
            'Key fees include expense ratios (ongoing fund fees), trading commissions, advisory fees (typically 0.25-1% AUM), platform fees, and tax inefficiencies. Even small differences in fees compound significantly over time.',
        },
      ],
    },
  },

  'tax-and-freelance-uk-us-ca': {
    en: {
      description:
        'Tax calculators for freelancers and self-employed professionals in UK, US, and Canada.',
      longDescription:
        'Navigate the complexities of self-employment taxes with our comprehensive calculators for UK, US, and Canadian tax systems.',
      faqs: [
        {
          question: 'How does UK VAT work for small businesses?',
          answer:
            'UK businesses must register for VAT when turnover exceeds £90,000 (as of 2024). The standard VAT rate is 20%. You can use the Flat Rate Scheme (simplified calculation) or standard VAT accounting. VAT is typically filed quarterly via Making Tax Digital.',
        },
        {
          question: 'What is the Flat Rate Scheme?',
          answer:
            'The Flat Rate Scheme is a simplified VAT calculation for UK businesses with turnover under £150,000. You charge VAT at 20% but pay HMRC a fixed percentage (varies by sector, 4-14.5%) of your gross turnover, keeping the difference.',
        },
        {
          question: 'How are self-employed taxes calculated in the US?',
          answer:
            'Self-employed individuals pay self-employment tax (15.3% for Social Security and Medicare) plus income tax on net profits. Quarterly estimated taxes are due. You can deduct business expenses and half of self-employment tax from income.',
        },
        {
          question: 'What is Making Tax Digital (MTD)?',
          answer:
            'MTD is a UK government initiative requiring businesses to keep digital records and file VAT returns using compatible software. It applies to VAT-registered businesses and will expand to income tax for self-employed and landlords.',
        },
        {
          question: 'Can I claim expenses as a freelancer?',
          answer:
            'Yes, freelancers can deduct ordinary and necessary business expenses including home office, equipment, software, travel, professional development, insurance, and marketing. Keep detailed records and receipts for all claims.',
        },
      ],
    },
  },

  // Spanish Categories
  'impuestos-y-trabajo-autonomo': {
    es: {
      description:
        'Calculadoras para autónomos: cuota de autónomos, IRPF, IVA, y modelos tributarios.',
      longDescription:
        'Gestiona tus impuestos como autónomo con nuestras calculadoras especializadas para el sistema fiscal español.',
      faqs: [
        {
          question: '¿Cómo se calcula la cuota de autónomos 2025?',
          answer:
            'En 2025, la cuota de autónomos se calcula por tramos de rendimientos netos. Va desde unos 225€/mes (rendimientos < 670€/mes) hasta más de 500€/mes para rendimientos altos. Es el nuevo sistema de cotización por ingresos reales.',
        },
        {
          question: '¿Qué es la tarifa plana de autónomos?',
          answer:
            'La tarifa plana permite pagar una cuota reducida (80€/mes aproximadamente) durante los primeros 12 meses como autónomo. Puede extenderse con bonificaciones decrecientes en años sucesivos bajo ciertas condiciones.',
        },
        {
          question: '¿Cómo funciona el IRPF para autónomos?',
          answer:
            'Los autónomos tributan por IRPF sobre el rendimiento neto (ingresos - gastos deducibles). Aplican retenciones trimestrales (modelo 130) del 20% sobre el beneficio. La declaración anual ajusta el impuesto definitivo con las retenciones ya pagadas.',
        },
        {
          question: '¿Qué gastos puede deducir un autónomo?',
          answer:
            'Puedes deducir gastos necesarios para la actividad: alquiler de local, suministros (% de uso profesional), material, vehículo (% profesional), formación, seguros, gestoría, marketing, y amortización de equipos. Deben estar justificados y vinculados a la actividad.',
        },
        {
          question: '¿Cómo se hace la declaración trimestral de IVA?',
          answer:
            'El modelo 303 se presenta trimestralmente (abril, julio, octubre, enero). Declaras IVA repercutido (ventas) menos IVA soportado (compras). El saldo a pagar o a devolver se liquida con Hacienda. También existe el modelo 390 resumen anual.',
        },
      ],
    },
  },

  // French Categories
  'fiscalite-et-travail-independant': {
    fr: {
      description:
        'Calculateurs pour indépendants et micro-entrepreneurs: cotisations URSSAF, TVA, CFE, impôts.',
      longDescription:
        'Gérez votre fiscalité d\'indépendant avec nos calculateurs spécialisés pour le système fiscal français.',
      faqs: [
        {
          question: 'Comment fonctionnent les cotisations URSSAF?',
          answer:
            'Les cotisations URSSAF représentent environ 22% du chiffre d\'affaires en micro-entreprise (activités libérales BNC), 12,8% pour les commerces, et 22% pour les services. Elles couvrent maladie, retraite, allocations familiales et CSG-CRDS.',
        },
        {
          question: 'Qu\'est-ce que la franchise en base de TVA?',
          answer:
            'La franchise en base de TVA dispense de facturer et déclarer la TVA si le CA ne dépasse pas 36.800€ (services) ou 91.900€ (commerce). Au-delà, vous devez facturer la TVA et la reverser, mais pouvez récupérer la TVA sur vos achats.',
        },
        {
          question: 'Comment est calculée la CFE?',
          answer:
            'La Cotisation Foncière des Entreprises est un impôt local basé sur la valeur locative de vos locaux professionnels. Les micro-entrepreneurs bénéficient d\'une exonération la première année, puis d\'une cotisation minimum selon la commune (200-2000€).',
        },
        {
          question: 'Micro-entreprise ou réel: que choisir?',
          answer:
            'La micro-entreprise convient si vos charges sont faibles (elles sont forfaitaires: 34% ou 50% selon activité). Le régime réel permet de déduire les vraies charges, donc convient mieux si vous avez beaucoup de dépenses professionnelles.',
        },
        {
          question: 'Qu\'est-ce que l\'ACRE?',
          answer:
            'L\'ACRE (Aide à la Création ou Reprise d\'Entreprise) est une exonération partielle des cotisations sociales la première année. En micro-entreprise, elle réduit les cotisations de 50% les 4 premiers trimestres pour les nouveaux entrepreneurs éligibles.',
        },
      ],
    },
  },
};

/**
 * Get content for a category and language
 */
export function getCategoryContent(
  category: string,
  lang: string
): CategoryContent | null {
  return CATEGORY_CONTENT[category]?.[lang] || null;
}

/**
 * Check if category has content
 */
export function hasCategoryContent(category: string, lang: string): boolean {
  return !!CATEGORY_CONTENT[category]?.[lang];
}
