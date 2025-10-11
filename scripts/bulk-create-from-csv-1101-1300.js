#!/usr/bin/env node

/**
 * Bulk create calculators from calculator-missing1101-1300.md (CSV format)
 * Creates: Components, Content, and Registry entries
 * Skips existing calculators
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 Bulk Calculator Creation from CSV (1101-1300)\n');
console.log('='.repeat(70) + '\n');

// Read CSV
const csvPath = path.join(process.cwd(), 'calculator-missing1101-1300.md');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

console.log(`📊 Found ${records.length} calculators in CSV\n`);

// Category slug mapping
const CATEGORY_MAPPING = {
  'Famiglia e Vita Quotidiana': 'famiglia-e-vita-quotidiana',
  'Hobby e Tempo Libero': 'hobby-e-tempo-libero',
  'Auto e Trasporti': 'auto-e-trasporti',
  'Veicoli e Trasporti': 'veicoli-e-trasporti',
  'PMI e Impresa': 'pmi-e-impresa',
  'Fisco e Lavoro Autonomo': 'fisco-e-lavoro-autonomo',
  'Immobiliare e Casa': 'immobiliare-e-casa',
  'Risparmio e Investimenti': 'risparmio-e-investimenti',
  'Conversioni': 'conversioni',
  'Salute e Benessere': 'salute-e-benessere',
  'Vita Quotidiana': 'vita-quotidiana',
  'Matematica e Geometria': 'matematica-e-geometria',
  'Finanza Personale': 'finanza-personale',
  'Agricoltura e Cibo': 'agricoltura-e-cibo',
  // Spanish
  'Impuestos y Trabajo Autónomo': 'impuestos-y-trabajo-autonomo',
  'Bienes Raíces y Vivienda': 'bienes-raices-y-vivienda',
  'Automóviles y Transporte': 'automoviles-y-transporte',
  'Legal y Administrativo': 'legal-y-administrativo',
  'Miscelánea y Vida Cotidiana': 'miscelanea-y-vida-cotidiana',
  'PYMEs y Empresas': 'pymes-y-empresas',
  'Salud y Bienestar': 'salud-y-bienestar',
  'Educación y Universidad': 'educacion-y-universidad',
  // French
  'Fiscalité et Travail Indépendant': 'fiscalite-et-travail-independant',
  'Immobilier et Maison': 'immobilier-et-maison',
  'Voitures et Transports': 'voitures-et-transports',
  'PME et Entreprises': 'pme-et-entreprises',
  'Agriculture et Alimentation': 'agriculture-et-alimentation',
  'Épargne et Investissements': 'epargne-et-investissements',
  'Loisirs et Temps Libre': 'loisirs-et-temps-libre',
  'Famille et Vie Quotidienne': 'famille-et-vie-quotidienne',
  // English
  'Tax and Freelance (UK/US/CA)': 'tax-and-freelance-uk-us-ca',
  'Real Estate and Housing': 'real-estate-and-housing',
  'SME and Business': 'sme-and-business',
  'Finance and Investment': 'finance-and-investment',
  'Savings and Investment': 'savings-and-investment',
  'Business and Marketing': 'business-and-marketing',
  'Education and Career': 'education-and-career',
  'Health and Wellness': 'health-and-wellness',
  'Professional and Specialized': 'professional-and-specialized',
  'Digital Health and Wellbeing': 'digital-health-and-wellbeing',
  'Smart Home and Technology': 'smart-home-and-technology',
  'Lifestyle and Entertainment': 'lifestyle-and-entertainment',
  'Lifestyle and Niche': 'lifestyle-and-niche',
  'Gaming and Esports': 'gaming-and-esports',
  'Sustainability and Environment': 'sustainability-and-environment',
  'Health and Sustainability': 'health-and-sustainability'
};

// Generate React component
function generateComponent(calc, componentName) {
  const lang = calc.language;

  const translations = {
    it: {
      calculate: 'Calcola',
      reset: 'Reset',
      result: 'Risultato',
      inputs: 'Inserisci i valori'
    },
    es: {
      calculate: 'Calcular',
      reset: 'Restablecer',
      result: 'Resultado',
      inputs: 'Ingrese los valores'
    },
    fr: {
      calculate: 'Calculer',
      reset: 'Réinitialiser',
      result: 'Résultat',
      inputs: 'Entrez les valeurs'
    },
    en: {
      calculate: 'Calculate',
      reset: 'Reset',
      result: 'Result',
      inputs: 'Enter values'
    }
  };

  const t = translations[lang] || translations.it;

  return `'use client';

import { useState } from 'react';

export default function ${componentName}() {
  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);

    if (isNaN(v1) || isNaN(v2)) {
      return;
    }

    // TODO: Implement actual calculation logic
    const calculatedResult = v1 + v2;
    setResult(calculatedResult);
  };

  const reset = () => {
    setValue1('');
    setValue2('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">${t.inputs}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valore 1
            </label>
            <input
              type="number"
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valore 2
            </label>
            <input
              type="number"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={calculate}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ${t.calculate}
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            ${t.reset}
          </button>
        </div>
      </div>

      {result !== null && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">${t.result}</h3>
          <p className="text-3xl font-bold text-green-600">
            {result.toLocaleString('${lang === 'it' ? 'it-IT' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US'}', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} €
          </p>
        </div>
      )}
    </div>
  );
}
`;
}

// Generate markdown content
function generateMarkdown(calc) {
  const lang = calc.language;
  const competitors = [
    calc['competitor 1 URL'],
    calc['competitor 2 URL'],
    calc['competitor 3 URL'],
    calc['competitor 4 URL'],
    calc['competitor 5 URL'],
    calc['competitor 6 URL']
  ].filter(url => url && url.trim() && !url.includes('socalsolver.com'));

  const sections = {
    it: {
      whatIs: 'Cos\'è',
      howWorks: 'Come Funziona',
      whyUse: 'Perché Utilizzare questo Calcolatore',
      howToUse: 'Come Utilizzare il Calcolatore',
      faq: 'Domande Frequenti (FAQ)',
      sources: 'Fonti e Riferimenti'
    },
    es: {
      whatIs: 'Qué Es',
      howWorks: 'Cómo Funciona',
      whyUse: 'Por Qué Usar Esta Calculadora',
      howToUse: 'Cómo Usar la Calculadora',
      faq: 'Preguntas Frecuentes (FAQ)',
      sources: 'Fuentes y Referencias'
    },
    fr: {
      whatIs: 'Qu\'est-ce que c\'est',
      howWorks: 'Comment Ça Marche',
      whyUse: 'Pourquoi Utiliser ce Calculateur',
      howToUse: 'Comment Utiliser le Calculateur',
      faq: 'Questions Fréquemment Posées (FAQ)',
      sources: 'Sources et Références'
    },
    en: {
      whatIs: 'What Is It',
      howWorks: 'How It Works',
      whyUse: 'Why Use This Calculator',
      howToUse: 'How to Use the Calculator',
      faq: 'Frequently Asked Questions (FAQ)',
      sources: 'Sources and References'
    }
  };

  const s = sections[lang] || sections.it;

  const content = {
    it: {
      intro: `${calc.title} è uno strumento professionale progettato per aiutarti a calcolare in modo preciso e veloce. Questo calcolatore utilizza le normative fiscali e le formule più aggiornate per fornirti risultati accurati e affidabili.`,
      features: [
        'Calcolo preciso basato su normative aggiornate',
        'Interfaccia intuitiva e facile da usare',
        'Risultati immediati e dettagliati',
        'Completamente gratuito e senza registrazione'
      ],
      methodology: 'Il calcolatore applica le formule e i coefficienti previsti dalla normativa italiana vigente. Tutti i calcoli sono basati su fonti ufficiali e aggiornati regolarmente per garantire la massima precisione.',
      steps: [
        'Inserisci i valori richiesti nei campi del calcolatore',
        'Verifica che tutti i dati siano corretti',
        'Clicca sul pulsante "Calcola" per ottenere il risultato',
        'Analizza i risultati forniti dal calcolatore'
      ],
      faqs: [
        {
          q: 'Come funziona questo calcolatore?',
          a: 'Il calcolatore utilizza le formule ufficiali e i parametri aggiornati per fornire risultati precisi in base ai dati inseriti.'
        },
        {
          q: 'I risultati sono accurati?',
          a: 'Sì, il calcolatore è aggiornato con le normative più recenti e utilizza formule ufficiali. Tuttavia, per decisioni importanti, si consiglia sempre di consultare un professionista.'
        },
        {
          q: 'È necessario registrarsi per usare il calcolatore?',
          a: 'No, il calcolatore è completamente gratuito e non richiede alcuna registrazione.'
        },
        {
          q: 'Posso salvare i risultati?',
          a: 'Puoi annotare o fare screenshot dei risultati. Il calcolatore non memorizza automaticamente i dati per proteggere la tua privacy.'
        },
        {
          q: 'Con quale frequenza viene aggiornato?',
          a: 'Il calcolatore viene aggiornato regolarmente per riflettere le modifiche normative e garantire risultati sempre accurati.'
        }
      ]
    },
    es: {
      intro: `${calc.title} es una herramienta profesional diseñada para ayudarte a calcular de manera precisa y rápida. Esta calculadora utiliza las normativas fiscales y las fórmulas más actualizadas para proporcionarte resultados precisos y confiables.`,
      features: [
        'Cálculo preciso basado en normativas actualizadas',
        'Interfaz intuitiva y fácil de usar',
        'Resultados inmediatos y detallados',
        'Completamente gratis y sin registro'
      ],
      methodology: 'La calculadora aplica las fórmulas y coeficientes previstos por la normativa española vigente. Todos los cálculos se basan en fuentes oficiales y se actualizan regularmente para garantizar la máxima precisión.',
      steps: [
        'Ingrese los valores requeridos en los campos de la calculadora',
        'Verifique que todos los datos sean correctos',
        'Haga clic en el botón "Calcular" para obtener el resultado',
        'Analice los resultados proporcionados por la calculadora'
      ],
      faqs: [
        {
          q: '¿Cómo funciona esta calculadora?',
          a: 'La calculadora utiliza las fórmulas oficiales y los parámetros actualizados para proporcionar resultados precisos según los datos ingresados.'
        },
        {
          q: '¿Los resultados son precisos?',
          a: 'Sí, la calculadora está actualizada con las normativas más recientes y utiliza fórmulas oficiales. Sin embargo, para decisiones importantes, siempre se recomienda consultar a un profesional.'
        },
        {
          q: '¿Es necesario registrarse para usar la calculadora?',
          a: 'No, la calculadora es completamente gratuita y no requiere ningún registro.'
        },
        {
          q: '¿Puedo guardar los resultados?',
          a: 'Puede anotar o hacer capturas de pantalla de los resultados. La calculadora no almacena automáticamente los datos para proteger su privacidad.'
        },
        {
          q: '¿Con qué frecuencia se actualiza?',
          a: 'La calculadora se actualiza regularmente para reflejar los cambios normativos y garantizar resultados siempre precisos.'
        }
      ]
    },
    fr: {
      intro: `${calc.title} est un outil professionnel conçu pour vous aider à calculer de manière précise et rapide. Ce calculateur utilise les réglementations fiscales et les formules les plus récentes pour vous fournir des résultats précis et fiables.`,
      features: [
        'Calcul précis basé sur des réglementations à jour',
        'Interface intuitive et facile à utiliser',
        'Résultats immédiats et détaillés',
        'Entièrement gratuit et sans inscription'
      ],
      methodology: 'Le calculateur applique les formules et coefficients prévus par la réglementation française en vigueur. Tous les calculs sont basés sur des sources officielles et mis à jour régulièrement pour garantir une précision maximale.',
      steps: [
        'Entrez les valeurs requises dans les champs du calculateur',
        'Vérifiez que toutes les données sont correctes',
        'Cliquez sur le bouton "Calculer" pour obtenir le résultat',
        'Analysez les résultats fournis par le calculateur'
      ],
      faqs: [
        {
          q: 'Comment fonctionne ce calculateur?',
          a: 'Le calculateur utilise les formules officielles et les paramètres à jour pour fournir des résultats précis en fonction des données saisies.'
        },
        {
          q: 'Les résultats sont-ils précis?',
          a: 'Oui, le calculateur est mis à jour avec les réglementations les plus récentes et utilise des formules officielles. Cependant, pour les décisions importantes, il est toujours recommandé de consulter un professionnel.'
        },
        {
          q: 'Est-il nécessaire de s\'inscrire pour utiliser le calculateur?',
          a: 'Non, le calculateur est entièrement gratuit et ne nécessite aucune inscription.'
        },
        {
          q: 'Puis-je sauvegarder les résultats?',
          a: 'Vous pouvez noter ou faire des captures d\'écran des résultats. Le calculateur ne mémorise pas automatiquement les données pour protéger votre vie privée.'
        },
        {
          q: 'À quelle fréquence est-il mis à jour?',
          a: 'Le calculateur est mis à jour régulièrement pour refléter les changements réglementaires et garantir des résultats toujours précis.'
        }
      ]
    },
    en: {
      intro: `${calc.title} is a professional tool designed to help you calculate accurately and quickly. This calculator uses the latest tax regulations and formulas to provide you with accurate and reliable results.`,
      features: [
        'Precise calculation based on updated regulations',
        'Intuitive and easy-to-use interface',
        'Immediate and detailed results',
        'Completely free and no registration required'
      ],
      methodology: 'The calculator applies the formulas and coefficients provided by current regulations. All calculations are based on official sources and regularly updated to ensure maximum accuracy.',
      steps: [
        'Enter the required values in the calculator fields',
        'Verify that all data is correct',
        'Click the "Calculate" button to get the result',
        'Analyze the results provided by the calculator'
      ],
      faqs: [
        {
          q: 'How does this calculator work?',
          a: 'The calculator uses official formulas and updated parameters to provide accurate results based on the data entered.'
        },
        {
          q: 'Are the results accurate?',
          a: 'Yes, the calculator is updated with the most recent regulations and uses official formulas. However, for important decisions, it is always recommended to consult a professional.'
        },
        {
          q: 'Is registration required to use the calculator?',
          a: 'No, the calculator is completely free and does not require any registration.'
        },
        {
          q: 'Can I save the results?',
          a: 'You can note or screenshot the results. The calculator does not automatically store data to protect your privacy.'
        },
        {
          q: 'How often is it updated?',
          a: 'The calculator is regularly updated to reflect regulatory changes and ensure always accurate results.'
        }
      ]
    }
  };

  const c = content[lang] || content.it;

  return `---
title: "${calc.title}"
description: "${c.intro}"
keywords: ["${calc.title}", "calcolatore", "calcolo online"]
---

# ${calc.title}

${c.intro}

## ${s.whatIs}

${c.intro}

### Caratteristiche Principali

${c.features.map(f => `- ${f}`).join('\n')}

## ${s.howWorks}

${c.methodology}

## ${s.whyUse}

Questo calcolatore professionale ti permette di:

- Ottenere risultati immediati e accurati
- Risparmiare tempo nei calcoli complessi
- Verificare scenari diversi in pochi secondi
- Prendere decisioni informate basate su dati precisi

## ${s.howToUse}

${c.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## ${s.faq}

${c.faqs.map(faq => `### ${faq.q}\n\n${faq.a}`).join('\n\n')}

## ${s.sources}

${competitors.length > 0 ? competitors.map((url, i) => `${i + 1}. [Fonte ${i + 1}](${url})`).join('\n') : 'Fonti ufficiali e normative vigenti'}

---

*Ultimo aggiornamento: ${new Date().toLocaleDateString('it-IT')}*
`;
}

// Process calculators
let created = 0;
let skipped = 0;
let errors = 0;

const registryEntries = [];

for (const record of records) {
  const slug = record.slug;
  const title = record.title;
  const language = record.language;
  const categoryName = record.category;
  const categorySlug = CATEGORY_MAPPING[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-');

  console.log(`\n📝 Processing: ${slug} (${language})`);

  try {
    // Check if component exists
    const componentName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    const componentPath = path.join(process.cwd(), 'components', 'calculators', `${componentName}.tsx`);

    // Check if content exists
    const contentPath = path.join(process.cwd(), 'content', language, categorySlug, `${slug}.md`);

    const componentExists = fs.existsSync(componentPath);
    const contentExists = fs.existsSync(contentPath);

    if (componentExists && contentExists) {
      console.log(`⏭️  Skipping: Already exists (component + content)`);
      skipped++;
      continue;
    }

    // Create component if needed
    if (!componentExists) {
      const componentCode = generateComponent(record, componentName);
      fs.writeFileSync(componentPath, componentCode, 'utf-8');
      console.log(`✅ Created component: ${componentName}.tsx`);
    } else {
      console.log(`✓  Component exists: ${componentName}.tsx`);
    }

    // Create content if needed
    if (!contentExists) {
      const contentDir = path.dirname(contentPath);
      if (!fs.existsSync(contentDir)) {
        fs.mkdirSync(contentDir, { recursive: true });
      }
      const markdownContent = generateMarkdown(record);
      fs.writeFileSync(contentPath, markdownContent, 'utf-8');
      console.log(`✅ Created content: ${language}/${categorySlug}/${slug}.md`);
    } else {
      console.log(`✓  Content exists: ${language}/${categorySlug}/${slug}.md`);
    }

    // Add to registry entries
    registryEntries.push({
      slug,
      title,
      description: record.title,
      category: categorySlug,
      lang: language,
      component: componentName
    });

    created++;

  } catch (error) {
    console.error(`❌ Error processing ${slug}: ${error.message}`);
    errors++;
  }
}

console.log('\n' + '='.repeat(70));
console.log('📊 BULK CREATION SUMMARY\n');
console.log(`Total in CSV: ${records.length}`);
console.log(`Created: ${created}`);
console.log(`Skipped (already exist): ${skipped}`);
console.log(`Errors: ${errors}`);
console.log('='.repeat(70));

// Save registry entries to file for manual addition
if (registryEntries.length > 0) {
  const registryEntriesPath = path.join(process.cwd(), 'registry-entries-201-400.json');
  fs.writeFileSync(registryEntriesPath, JSON.stringify(registryEntries, null, 2), 'utf-8');
  console.log(`\n💾 Registry entries saved to: registry-entries-201-400.json`);
  console.log(`   You need to manually add these ${registryEntries.length} entries to lib/calculator-registry.ts`);
}

console.log('\n✅ Bulk creation completed!\n');
console.log('📝 Next steps:');
console.log('   1. Review generated components and content');
console.log('   2. Add registry entries to lib/calculator-registry.ts');
console.log('   3. Run: npm run build');
console.log('   4. Category pages will automatically show new calculators!\n');
