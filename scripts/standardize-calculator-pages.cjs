#!/usr/bin/env node

/**
 * Standardize all calculator page templates to use CalculatorWrapper
 * This ensures consistent styling across all calculators
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function findCalculatorPages() {
  const { stdout } = await execPromise('find app -type f -name "page.tsx" -path "*/\\[slug\\]/*"');
  return stdout.trim().split('\n').filter(Boolean);
}

function updatePageTemplate(filePath, content) {
  // Check if already using CalculatorWrapper
  if (content.includes('CalculatorWrapper')) {
    return { updated: false, reason: 'Already using CalculatorWrapper' };
  }

  // Add import if not present
  let updated = content;

  if (!updated.includes('import CalculatorWrapper')) {
    // Find the last import statement
    const importLines = updated.split('\n').filter(line => line.trim().startsWith('import'));
    const lastImportIndex = updated.lastIndexOf(importLines[importLines.length - 1]);
    const insertPosition = updated.indexOf('\n', lastImportIndex) + 1;

    updated =
      updated.slice(0, insertPosition) +
      "import CalculatorWrapper from '@/components/layout/CalculatorWrapper';\n" +
      updated.slice(insertPosition);
  }

  // Replace the calculator rendering section
  // Pattern 1: <div className="..."><CalculatorComponent /></div>
  updated = updated.replace(
    /<div className="[^"]*bg-white[^"]*rounded[^"]*">\s*<CalculatorComponent \/>\s*<\/div>/g,
    '<CalculatorWrapper>\n                <CalculatorComponent />\n            </CalculatorWrapper>'
  );

  // Pattern 2: Existing wrapper around calculator
  updated = updated.replace(
    /<div className="lg:col-span-\d+\s+bg-white rounded-2xl shadow-lg">\s*<CalculatorComponent \/>\s*<\/div>/g,
    '<CalculatorWrapper>\n                <CalculatorComponent />\n            </CalculatorWrapper>'
  );

  // Pattern 3: Simple calculator without wrapper
  updated = updated.replace(
    /(<div className="grid[^>]*>[\s\S]*?{\/\* Calculator \*\/}\s*)<CalculatorComponent \/>/g,
    '$1<CalculatorWrapper>\n                <CalculatorComponent />\n            </CalculatorWrapper>'
  );

  return { updated: content !== updated, content: updated };
}

async function main() {
  console.log('🔄 Finding all calculator page templates...\n');

  const pageFiles = await findCalculatorPages();
  console.log(`Found ${pageFiles.length} calculator page templates\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const filePath of pageFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = updatePageTemplate(filePath, content);

      if (result.updated) {
        fs.writeFileSync(filePath, result.content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: ${filePath} - ${result.reason || 'No changes needed'}`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      errors.push({ file: filePath, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updatedCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  console.log('\n✨ Done!\n');
}

main().catch(console.error);
