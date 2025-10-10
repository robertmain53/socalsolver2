#!/usr/bin/env node

/**
 * Generate SEO-optimized content from Excel file with competitor research
 * This script reads the CSV and creates markdown content files
 *
 * Usage: node scripts/generate-content-from-excel.js <csv-file> [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const CSV_FILE = process.argv[2] || 'calculators-need-content.csv';
const DRY_RUN = process.argv.includes('--dry-run');

if (!CSV_FILE) {
  console.error('Usage: node scripts/generate-content-from-excel.js <csv-file> [--dry-run]');
  process.exit(1);
}

// Read CSV
const csvPath = path.join(process.cwd(), CSV_FILE);
if (!fs.existsSync(csvPath)) {
  console.error(`❌ File not found: ${csvPath}`);
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

console.log(`\n📄 Loaded ${records.length} calculators from ${CSV_FILE}\n`);

// Function to generate content template
function generateContentTemplate(record) {
  const {
    Language,
    Category,
    Slug,
    Title,
    Description,
    'Main Keyword': mainKeyword,
    'Competitor URL 1': comp1,
    'Competitor URL 2': comp2,
    'Competitor URL 3': comp3,
    'Authority Source 1': auth1,
    'Authority Source 2': auth2
  } = record;

  // Get competitor URLs (non-empty)
  const competitorUrls = [comp1, comp2, comp3].filter(url => url && url.trim());
  const authoritySources = [auth1, auth2].filter(url => url && url.trim());

  // Language-specific sections
  const sections = {
    it: {
      whatIs: 'Cos\'è',
      howWorks: 'Come Funziona',
      whyUse: 'Perché Usare Questo Calcolatore',
      howToUse: 'Come Utilizzarlo',
      faq: 'Domande Frequenti',
      sources: 'Fonti e Riferimenti'
    },
    en: {
      whatIs: 'What is it',
      howWorks: 'How It Works',
      whyUse: 'Why Use This Calculator',
      howToUse: 'How to Use',
      faq: 'Frequently Asked Questions',
      sources: 'Sources and References'
    },
    es: {
      whatIs: 'Qué es',
      howWorks: 'Cómo Funciona',
      whyUse: 'Por Qué Usar Esta Calculadora',
      howToUse: 'Cómo Utilizarla',
      faq: 'Preguntas Frecuentes',
      sources: 'Fuentes y Referencias'
    },
    fr: {
      whatIs: 'Qu\'est-ce que c\'est',
      howWorks: 'Comment ça Marche',
      whyUse: 'Pourquoi Utiliser Ce Calculateur',
      howToUse: 'Comment l\'Utiliser',
      faq: 'Questions Fréquentes',
      sources: 'Sources et Références'
    }
  };

  const lang = Language.toLowerCase();
  const sec = sections[lang] || sections.en;

  const template = `---
title: "${Title}"
description: "${Description}"
keywords: ["${mainKeyword}"]
lang: "${lang}"
category: "${Category}"
slug: "${Slug}"
---

# ${Title}

${Description}

## ${sec.whatIs}

<!-- TODO: Add comprehensive explanation of what this calculator does.
     Reference competitors: ${competitorUrls.slice(0, 2).join(', ') || 'N/A'}
     Make it better by:
     - Being more comprehensive
     - Adding specific examples
     - Including recent data/regulations
     - Being more user-friendly
-->

[Write 2-3 paragraphs explaining what this calculator is and what problem it solves]

## ${sec.howWorks}

<!-- TODO: Explain the methodology and formulas used.
     Be transparent about calculations.
     Reference: ${authoritySources[0] || 'authoritative source'} -->

[Explain how the calculator works, what inputs are needed, and how results are calculated]

### Key Features

- **Feature 1**: [Description]
- **Feature 2**: [Description]
- **Feature 3**: [Description]
- **Feature 4**: [Description]

## ${sec.whyUse}

<!-- TODO: Explain unique benefits compared to competitors.
     Review: ${competitorUrls.join(', ') || 'competitor calculators'} -->

1. **Benefit 1**: [Explanation]
2. **Benefit 2**: [Explanation]
3. **Benefit 3**: [Explanation]
4. **Benefit 4**: [Explanation]

## ${sec.howToUse}

<!-- TODO: Step-by-step guide for users -->

### Step 1: [First Step]

[Detailed explanation]

### Step 2: [Second Step]

[Detailed explanation]

### Step 3: [Third Step]

[Detailed explanation]

### Step 4: [Interpret Results]

[How to read and use the results]

## ${sec.faq}

### Question 1: [Common question]?

[Detailed answer]

### Question 2: [Common question]?

[Detailed answer]

### Question 3: [Common question]?

[Detailed answer]

### Question 4: [Common question]?

[Detailed answer]

### Question 5: [Common question]?

[Detailed answer]

## ${sec.sources}

<!-- TODO: Add authoritative sources for credibility -->

${authoritySources.length > 0 ? authoritySources.map((source, i) => `${i + 1}. [Source ${i + 1}](${source})`).join('\n') : '1. [Add authoritative source]\n2. [Add authoritative source]'}

---

**Competitor Analysis Completed:**
${competitorUrls.length > 0 ? competitorUrls.map((url, i) => `- Competitor ${i + 1}: ${url}`).join('\n') : '- No competitors analyzed yet'}

**Last Updated**: ${new Date().toISOString().split('T')[0]}
`;

  return template;
}

// Process each record
let created = 0;
let skipped = 0;
let errors = 0;

records.forEach((record, index) => {
  const lang = record.Language.toLowerCase();
  const category = record.Category;
  const slug = record.Slug;

  // Create directory structure
  const contentDir = path.join(process.cwd(), 'content', lang, category);
  const filePath = path.join(contentDir, `${slug}.md`);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${lang}/${category}/${slug}.md (already exists)`);
    skipped++;
    return;
  }

  try {
    const content = generateContentTemplate(record);

    if (DRY_RUN) {
      console.log(`\n🔍 DRY RUN - Would create: ${lang}/${category}/${slug}.md`);
      console.log(`   Competitors: ${[record['Competitor URL 1'], record['Competitor URL 2'], record['Competitor URL 3']].filter(Boolean).length}`);
      console.log(`   Authority sources: ${[record['Authority Source 1'], record['Authority Source 2']].filter(Boolean).length}`);
    } else {
      // Create directory if it doesn't exist
      if (!fs.existsSync(contentDir)) {
        fs.mkdirSync(contentDir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Created: ${lang}/${category}/${slug}.md`);
    }

    created++;
  } catch (error) {
    console.error(`❌ Error creating ${lang}/${category}/${slug}.md:`, error.message);
    errors++;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Content Generation Summary\n');
console.log(`Total records processed: ${records.length}`);
console.log(`Files created: ${created}`);
console.log(`Files skipped (already exist): ${skipped}`);
console.log(`Errors: ${errors}`);

if (DRY_RUN) {
  console.log('\n⚠️  DRY RUN MODE - No files were created');
  console.log('   Remove --dry-run flag to create files');
}

console.log('\n📝 Next Steps:');
console.log('   1. Review the generated markdown files');
console.log('   2. Fill in the TODO sections with actual content');
console.log('   3. Use competitor URLs as inspiration (don\'t copy!)');
console.log('   4. Add citations to authority sources');
console.log('   5. Commit and deploy\n');
