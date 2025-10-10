#!/usr/bin/env node

/**
 * Fix content language - regenerate content in correct language
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Language-specific content templates
const templates = {
  it: {
    intro: (title, keyword) => `${title} è uno strumento professionale e gratuito che ti permette di calcolare in modo preciso e rapido ${keyword}.

Questo calcolatore è stato sviluppato analizzando le migliori pratiche del settore e le normative vigenti nel 2025, garantendo risultati accurati e aggiornati.`,
    features: {
      title: 'Caratteristiche Principali',
      list: [
        '**Calcolo Immediato**: Risultati in tempo reale senza attese',
        '**Sempre Aggiornato**: Normative e aliquote 2025',
        '**100% Gratuito**: Nessuna registrazione richiesta',
        '**Privacy Garantita**: I tuoi dati non vengono salvati'
      ]
    },
    method: {
      title: 'Metodo di Calcolo',
      steps: [
        '**Acquisizione Dati**: Inserisci le informazioni richieste nei campi del modulo',
        '**Elaborazione**: L\'algoritmo applica le formule specifiche e le normative vigenti',
        '**Risultati Dettagliati**: Ottieni un breakdown completo con tutti i valori calcolati',
        '**Interpretazione**: Ogni risultato è accompagnato da spiegazioni chiare'
      ]
    },
    advantages: {
      title: 'Vantaggi del Nostro Calcolatore',
      list: [
        { title: 'Precisione Garantita', desc: 'Formule verificate e normative 2025 integrate nel sistema di calcolo.' },
        { title: 'Facilità d\'Uso', desc: 'Interfaccia intuitiva progettata per essere utilizzata anche da chi non ha competenze tecniche.' },
        { title: 'Risultati Istantanei', desc: 'Non serve attendere: i calcoli vengono elaborati immediatamente mentre inserisci i dati.' },
        { title: 'Completamente Gratuito', desc: 'Accesso illimitato senza bisogno di registrazione o abbonamenti.' },
        { title: 'Mobile Friendly', desc: 'Funziona perfettamente su smartphone, tablet e computer.' }
      ]
    },
    guide: {
      title: 'Guida Passo-Passo',
      steps: [
        { title: 'Preparazione Dati', desc: 'Prima di utilizzare il calcolatore, assicurati di avere a portata di mano tutti i dati necessari. Questo renderà il processo più rapido ed efficiente.' },
        { title: 'Compilazione Campi', desc: 'Inserisci i valori richiesti nei campi del calcolatore. Ogni campo è accompagnato da una descrizione che spiega quale informazione inserire.' },
        { title: 'Calcolo', desc: 'Clicca sul pulsante "Calcola" per elaborare i dati. Il sistema genererà immediatamente i risultati.' },
        { title: 'Analisi Risultati', desc: 'Esamina attentamente i risultati forniti. Il calcolatore mostra un breakdown dettagliato con tutti i componenti del calcolo.' },
        { title: 'Salvataggio (Opzionale)', desc: 'Puoi salvare o stampare i risultati per conservarli o condividerli con il tuo commercialista.' }
      ]
    },
    faqs: [
      { q: 'I risultati sono vincolanti?', a: 'I risultati forniti dal calcolatore sono indicativi e basati sui dati inseriti e sulle normative vigenti. Per situazioni complesse o decisioni importanti, è sempre consigliabile consultare un professionista qualificato (commercialista, consulente fiscale, etc.).' },
      { q: 'Quanto sono aggiornati i dati?', a: 'Il calcolatore viene aggiornato regolarmente per riflettere le normative e le aliquote in vigore. Tutti i calcoli sono basati sulla legislazione 2025.' },
      { q: 'I miei dati vengono salvati?', a: 'No, tutti i calcoli vengono eseguiti localmente nel tuo browser. Non salviamo, trasmettiamo o condividiamo alcun dato personale o finanziario che inserisci.' },
      { q: 'Posso usare il calcolatore su mobile?', a: 'Sì, il calcolatore è completamente responsive e funziona perfettamente su smartphone, tablet e computer di qualsiasi dimensione.' },
      { q: 'Cosa devo fare se trovo un errore?', a: 'Se riscontri risultati inaspettati o errori, verifica prima di aver inserito correttamente tutti i dati. Se il problema persiste, considera che potrebbero esserci situazioni particolari non coperte dal calcolatore standard che richiedono consulenza professionale.' }
    ],
    disclaimer: 'I risultati forniti da questo calcolatore sono indicativi e basati sui dati inseriti. Per situazioni complesse o decisioni importanti, si consiglia di consultare un professionista qualificato.'
  },

  es: {
    intro: (title, keyword) => `${title} es una herramienta profesional y gratuita que te permite calcular de forma precisa y rápida ${keyword}.

Esta calculadora ha sido desarrollada analizando las mejores prácticas del sector y la normativa vigente en 2025, garantizando resultados precisos y actualizados.`,
    features: {
      title: 'Características Principales',
      list: [
        '**Cálculo Inmediato**: Resultados en tiempo real sin esperas',
        '**Siempre Actualizado**: Normativa y tipos 2025',
        '**100% Gratuito**: Sin registro requerido',
        '**Privacidad Garantizada**: Tus datos no se guardan'
      ]
    },
    method: {
      title: 'Método de Cálculo',
      steps: [
        '**Adquisición de Datos**: Introduce la información requerida en los campos del formulario',
        '**Procesamiento**: El algoritmo aplica las fórmulas específicas y la normativa vigente',
        '**Resultados Detallados**: Obtienes un desglose completo con todos los valores calculados',
        '**Interpretación**: Cada resultado viene acompañado de explicaciones claras'
      ]
    },
    advantages: {
      title: 'Ventajas de Nuestra Calculadora',
      list: [
        { title: 'Precisión Garantizada', desc: 'Fórmulas verificadas y normativa 2025 integradas en el sistema de cálculo.' },
        { title: 'Fácil de Usar', desc: 'Interfaz intuitiva diseñada para ser utilizada incluso por personas sin conocimientos técnicos.' },
        { title: 'Resultados Instantáneos', desc: 'No hace falta esperar: los cálculos se procesan inmediatamente mientras introduces los datos.' },
        { title: 'Completamente Gratuito', desc: 'Acceso ilimitado sin necesidad de registro ni suscripciones.' },
        { title: 'Compatible con Móviles', desc: 'Funciona perfectamente en smartphones, tablets y ordenadores.' }
      ]
    },
    guide: {
      title: 'Guía Paso a Paso',
      steps: [
        { title: 'Preparación de Datos', desc: 'Antes de utilizar la calculadora, asegúrate de tener a mano todos los datos necesarios. Esto hará el proceso más rápido y eficiente.' },
        { title: 'Rellenar Campos', desc: 'Introduce los valores requeridos en los campos de la calculadora. Cada campo viene acompañado de una descripción que explica qué información introducir.' },
        { title: 'Cálculo', desc: 'Haz clic en el botón "Calcular" para procesar los datos. El sistema generará inmediatamente los resultados.' },
        { title: 'Análisis de Resultados', desc: 'Examina atentamente los resultados proporcionados. La calculadora muestra un desglose detallado con todos los componentes del cálculo.' },
        { title: 'Guardar (Opcional)', desc: 'Puedes guardar o imprimir los resultados para conservarlos o compartirlos con tu asesor.' }
      ]
    },
    faqs: [
      { q: '¿Los resultados son vinculantes?', a: 'Los resultados proporcionados por la calculadora son orientativos y están basados en los datos introducidos y la normativa vigente. Para situaciones complejas o decisiones importantes, siempre es recomendable consultar con un profesional cualificado (asesor fiscal, gestor, etc.).' },
      { q: '¿Qué tan actualizados están los datos?', a: 'La calculadora se actualiza regularmente para reflejar la normativa y los tipos vigentes. Todos los cálculos están basados en la legislación de 2025.' },
      { q: '¿Se guardan mis datos?', a: 'No, todos los cálculos se realizan localmente en tu navegador. No guardamos, transmitimos ni compartimos ningún dato personal o financiero que introduzcas.' },
      { q: '¿Puedo usar la calculadora en el móvil?', a: 'Sí, la calculadora es completamente responsive y funciona perfectamente en smartphones, tablets y ordenadores de cualquier tamaño.' },
      { q: '¿Qué hago si encuentro un error?', a: 'Si encuentras resultados inesperados o errores, verifica primero que has introducido correctamente todos los datos. Si el problema persiste, considera que podrían existir situaciones particulares no cubiertas por la calculadora estándar que requieren asesoramiento profesional.' }
    ],
    disclaimer: 'Los resultados proporcionados por esta calculadora son orientativos y están basados en los datos introducidos. Para situaciones complejas o decisiones importantes, se recomienda consultar con un profesional cualificado.'
  },

  fr: {
    intro: (title, keyword) => `${title} est un outil professionnel et gratuit qui vous permet de calculer de manière précise et rapide ${keyword}.

Ce calculateur a été développé en analysant les meilleures pratiques du secteur et la réglementation en vigueur en 2025, garantissant des résultats précis et à jour.`,
    features: {
      title: 'Caractéristiques Principales',
      list: [
        '**Calcul Immédiat**: Résultats en temps réel sans attente',
        '**Toujours à Jour**: Réglementation et taux 2025',
        '**100% Gratuit**: Aucune inscription requise',
        '**Confidentialité Garantie**: Vos données ne sont pas sauvegardées'
      ]
    },
    method: {
      title: 'Méthode de Calcul',
      steps: [
        '**Acquisition de Données**: Saisissez les informations requises dans les champs du formulaire',
        '**Traitement**: L\'algorithme applique les formules spécifiques et la réglementation en vigueur',
        '**Résultats Détaillés**: Vous obtenez une ventilation complète avec toutes les valeurs calculées',
        '**Interprétation**: Chaque résultat est accompagné d\'explications claires'
      ]
    },
    advantages: {
      title: 'Avantages de Notre Calculateur',
      list: [
        { title: 'Précision Garantie', desc: 'Formules vérifiées et réglementation 2025 intégrées dans le système de calcul.' },
        { title: 'Facilité d\'Utilisation', desc: 'Interface intuitive conçue pour être utilisée même par ceux qui n\'ont pas de compétences techniques.' },
        { title: 'Résultats Instantanés', desc: 'Pas besoin d\'attendre: les calculs sont traités immédiatement pendant que vous saisissez les données.' },
        { title: 'Entièrement Gratuit', desc: 'Accès illimité sans besoin d\'inscription ou d\'abonnements.' },
        { title: 'Compatible Mobile', desc: 'Fonctionne parfaitement sur smartphones, tablettes et ordinateurs.' }
      ]
    },
    guide: {
      title: 'Guide Étape par Étape',
      steps: [
        { title: 'Préparation des Données', desc: 'Avant d\'utiliser le calculateur, assurez-vous d\'avoir toutes les données nécessaires à portée de main. Cela rendra le processus plus rapide et efficace.' },
        { title: 'Remplir les Champs', desc: 'Saisissez les valeurs requises dans les champs du calculateur. Chaque champ est accompagné d\'une description expliquant quelle information saisir.' },
        { title: 'Calcul', desc: 'Cliquez sur le bouton "Calculer" pour traiter les données. Le système générera immédiatement les résultats.' },
        { title: 'Analyse des Résultats', desc: 'Examinez attentivement les résultats fournis. Le calculateur affiche une ventilation détaillée avec tous les composants du calcul.' },
        { title: 'Sauvegarde (Optionnel)', desc: 'Vous pouvez sauvegarder ou imprimer les résultats pour les conserver ou les partager avec votre conseiller.' }
      ]
    },
    faqs: [
      { q: 'Les résultats sont-ils contraignants?', a: 'Les résultats fournis par le calculateur sont indicatifs et basés sur les données saisies et la réglementation en vigueur. Pour des situations complexes ou des décisions importantes, il est toujours conseillé de consulter un professionnel qualifié (expert-comptable, conseiller fiscal, etc.).' },
      { q: 'À quel point les données sont-elles à jour?', a: 'Le calculateur est mis à jour régulièrement pour refléter la réglementation et les taux en vigueur. Tous les calculs sont basés sur la législation de 2025.' },
      { q: 'Mes données sont-elles sauvegardées?', a: 'Non, tous les calculs sont effectués localement dans votre navigateur. Nous ne sauvegardons, ne transmettons ni ne partageons aucune donnée personnelle ou financière que vous saisissez.' },
      { q: 'Puis-je utiliser le calculateur sur mobile?', a: 'Oui, le calculateur est entièrement responsive et fonctionne parfaitement sur smartphones, tablettes et ordinateurs de toutes tailles.' },
      { q: 'Que faire si je trouve une erreur?', a: 'Si vous constatez des résultats inattendus ou des erreurs, vérifiez d\'abord que vous avez correctement saisi toutes les données. Si le problème persiste, considérez qu\'il pourrait y avoir des situations particulières non couvertes par le calculateur standard qui nécessitent un conseil professionnel.' }
    ],
    disclaimer: 'Les résultats fournis par ce calculateur sont indicatifs et basés sur les données saisies. Pour des situations complexes ou des décisions importantes, il est recommandé de consulter un professionnel qualifié.'
  },

  en: {
    intro: (title, keyword) => `${title} is a professional and free tool that allows you to accurately and quickly calculate ${keyword}.

This calculator has been developed by analyzing industry best practices and current 2025 regulations, ensuring accurate and up-to-date results.`,
    features: {
      title: 'Key Features',
      list: [
        '**Instant Calculation**: Real-time results without waiting',
        '**Always Updated**: 2025 regulations and rates',
        '**100% Free**: No registration required',
        '**Privacy Guaranteed**: Your data is not saved'
      ]
    },
    method: {
      title: 'Calculation Method',
      steps: [
        '**Data Input**: Enter the required information in the form fields',
        '**Processing**: The algorithm applies specific formulas and current regulations',
        '**Detailed Results**: Get a complete breakdown with all calculated values',
        '**Interpretation**: Each result comes with clear explanations'
      ]
    },
    advantages: {
      title: 'Advantages of Our Calculator',
      list: [
        { title: 'Guaranteed Accuracy', desc: 'Verified formulas and 2025 regulations integrated into the calculation system.' },
        { title: 'Easy to Use', desc: 'Intuitive interface designed to be used even by those without technical skills.' },
        { title: 'Instant Results', desc: 'No need to wait: calculations are processed immediately as you enter data.' },
        { title: 'Completely Free', desc: 'Unlimited access without need for registration or subscriptions.' },
        { title: 'Mobile Friendly', desc: 'Works perfectly on smartphones, tablets and computers.' }
      ]
    },
    guide: {
      title: 'Step-by-Step Guide',
      steps: [
        { title: 'Data Preparation', desc: 'Before using the calculator, make sure you have all necessary data at hand. This will make the process faster and more efficient.' },
        { title: 'Fill in Fields', desc: 'Enter the required values in the calculator fields. Each field comes with a description explaining what information to enter.' },
        { title: 'Calculate', desc: 'Click the "Calculate" button to process the data. The system will immediately generate results.' },
        { title: 'Results Analysis', desc: 'Carefully examine the provided results. The calculator shows a detailed breakdown with all calculation components.' },
        { title: 'Save (Optional)', desc: 'You can save or print the results to keep them or share them with your accountant.' }
      ]
    },
    faqs: [
      { q: 'Are the results binding?', a: 'The results provided by the calculator are indicative and based on the entered data and current regulations. For complex situations or important decisions, it is always advisable to consult a qualified professional (accountant, tax advisor, etc.).' },
      { q: 'How up-to-date is the data?', a: 'The calculator is regularly updated to reflect current regulations and rates. All calculations are based on 2025 legislation.' },
      { q: 'Is my data saved?', a: 'No, all calculations are performed locally in your browser. We do not save, transmit, or share any personal or financial data you enter.' },
      { q: 'Can I use the calculator on mobile?', a: 'Yes, the calculator is fully responsive and works perfectly on smartphones, tablets, and computers of any size.' },
      { q: 'What should I do if I find an error?', a: 'If you encounter unexpected results or errors, first verify that you have entered all data correctly. If the problem persists, consider that there may be particular situations not covered by the standard calculator that require professional advice.' }
    ],
    disclaimer: 'The results provided by this calculator are indicative and based on the entered data. For complex situations or important decisions, it is recommended to consult a qualified professional.'
  }
};

function generateContent(metadata, lang) {
  const t = templates[lang];
  const { title, description, keywords, category, slug, competitors, authorities } = metadata;

  const sections = {
    it: { whatIs: 'Cos\'è', howWorks: 'Come Funziona', whyUse: 'Perché Usare', howToUse: 'Come Utilizzarlo', faq: 'Domande Frequenti', sources: 'Fonti', updated: 'Ultimo Aggiornamento' },
    es: { whatIs: 'Qué Es', howWorks: 'Cómo Funciona', whyUse: 'Por Qué Usar', howToUse: 'Cómo Utilizarla', faq: 'Preguntas Frecuentes', sources: 'Fuentes', updated: 'Última Actualización' },
    fr: { whatIs: 'Qu\'est-ce que c\'est', howWorks: 'Comment ça Marche', whyUse: 'Pourquoi Utiliser', howToUse: 'Comment Utiliser', faq: 'Questions Fréquentes', sources: 'Sources', updated: 'Dernière Mise à Jour' },
    en: { whatIs: 'What Is It', howWorks: 'How It Works', whyUse: 'Why Use', howToUse: 'How to Use', faq: 'FAQ', sources: 'Sources', updated: 'Last Updated' }
  };

  const sec = sections[lang];
  const keyword = keywords[0] || description;

  const competitorsList = competitors && competitors.length > 0
    ? competitors.map((url, i) => `- [Competitor ${i + 1}](${url})`).join('\n')
    : '- No competitors analyzed';

  const authoritiesList = authorities && authorities.length > 0
    ? authorities.map((url, i) => `${i + 1}. [Official Source ${i + 1}](${url})`).join('\n')
    : '1. [Add authoritative source]\n2. [Add authoritative source]';

  return `---
title: "${title}"
description: "${description}"
keywords: ${JSON.stringify(keywords)}
lang: "${lang}"
category: "${category}"
slug: "${slug}"
---

# ${title}

${description}

## ${sec.whatIs}

${t.intro(title, keyword)}

### ${t.features.title}

${t.features.list.map(item => `- ${item}`).join('\n')}

## ${sec.howWorks}

${lang === 'it' ? 'Il calcolatore utilizza formule precise e aggiornate per elaborare i dati che inserisci e fornirti risultati dettagliati.' :
  lang === 'es' ? 'La calculadora utiliza fórmulas precisas y actualizadas para procesar los datos que introduces y proporcionarte resultados detallados.' :
  lang === 'fr' ? 'Le calculateur utilise des formules précises et à jour pour traiter les données que vous saisissez et vous fournir des résultats détaillés.' :
  'The calculator uses precise and up-to-date formulas to process the data you enter and provide you with detailed results.'}

### ${t.method.title}

${t.method.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## ${sec.whyUse}

### ${t.advantages.title}

${t.advantages.list.map(adv => `✅ **${adv.title}**\n${adv.desc}`).join('\n\n')}

## ${sec.howToUse}

### ${t.guide.title}

${t.guide.steps.map((step, i) => `#### ${lang === 'it' ? 'Passo' : lang === 'es' ? 'Paso' : lang === 'fr' ? 'Étape' : 'Step'} ${i + 1}: ${step.title}\n\n${step.desc}`).join('\n\n')}

## ${sec.faq}

${t.faqs.map((faq, i) => `### ${lang === 'it' ? 'Domanda' : lang === 'es' ? 'Pregunta' : lang === 'fr' ? 'Question' : 'Question'} ${i + 1}: ${faq.q}\n\n${faq.a}`).join('\n\n')}

## ${sec.sources}

${authoritiesList}

---

**${lang === 'it' ? 'Analisi Competitors Completata' : lang === 'es' ? 'Análisis de Competidores Completado' : lang === 'fr' ? 'Analyse des Concurrents Complétée' : 'Competitor Analysis Completed'}:**
${competitorsList}

**${sec.updated}:** ${new Date().toISOString().split('T')[0]}

---

*Disclaimer: ${t.disclaimer}*
`;
}

// Read CSV and process
const csvPath = path.join(process.cwd(), 'calculators-need-content.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

const records = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  if (values.length < 8 || !values[0] || !values[2]) continue;

  records.push({
    lang: values[0],
    category: values[1],
    slug: values[2],
    title: values[3],
    description: values[4],
    keywords: [values[5]],
    competitors: values.slice(8, 18).filter(Boolean),
    authorities: values.slice(18, 20).filter(Boolean)
  });
}

console.log(`\n🔄 Fixing language for ${records.length} content files...\n`);

let fixed = 0;
let errors = 0;

records.forEach((record, index) => {
  const filePath = path.join(process.cwd(), 'content', record.lang, record.category, `${record.slug}.md`);

  try {
    const content = generateContent(record, record.lang);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ [${index + 1}/${records.length}] Fixed: ${record.lang}/${record.category}/${record.slug}.md`);
    fixed++;
  } catch (error) {
    console.error(`❌ [${index + 1}/${records.length}] Error: ${record.slug} - ${error.message}`);
    errors++;
  }
});

console.log('\n' + '='.repeat(70));
console.log(`✅ Fixed: ${fixed} files`);
console.log(`❌ Errors: ${errors} files`);
console.log('='.repeat(70) + '\n');
