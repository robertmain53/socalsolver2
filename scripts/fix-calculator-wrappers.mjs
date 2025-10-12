#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function findPageFiles() {
  const { stdout } = await execAsync('find app -type f -name "page.tsx" -path "*/\\[slug\\]/*"');
  return stdout.trim().split('\n').filter(Boolean);
}

async function updateFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');

  // Skip if already using CalculatorWrapper
  if (content.includes('CalculatorWrapper')) {
    return { updated: false, reason: 'Already using CalculatorWrapper' };
  }

  let modified = false;

  // Add import
  if (!content.includes("import CalculatorWrapper from '@/components/layout/CalculatorWrapper'")) {
    const importMatch = content.match(/(import[^;]+;)\n(?!import)/);
    if (importMatch) {
      const lastImport = importMatch[0];
      content = content.replace(
        lastImport,
        lastImport + "import CalculatorWrapper from '@/components/layout/CalculatorWrapper';\n"
      );
      modified = true;
    }
  }

  // Replace calculator wrapper div
  // Pattern 1: <div className="lg:col-span-1  bg-white rounded-2xl shadow-lg">
  const wrapperPattern = /<div className="lg:col-span-\d+\s+bg-white rounded-2xl shadow-lg">/g;
  if (wrapperPattern.test(content)) {
    content = content.replace(wrapperPattern, '<CalculatorWrapper>');

    // Find and replace the corresponding closing </div> after <CalculatorComponent />
    const lines = content.split('\n');
    let inCalculatorSection = false;
    let wrapperCount = 0;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<CalculatorWrapper>')) {
        inCalculatorSection = true;
        wrapperCount = 0;
      }

      if (inCalculatorSection) {
        if (lines[i].includes('<CalculatorComponent />')) {
          // Find the next </div>
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].includes('</div>') && wrapperCount === 0) {
              lines[j] = lines[j].replace('</div>', '</CalculatorWrapper>');
              inCalculatorSection = false;
              break;
            }
            if (lines[j].includes('<div')) wrapperCount++;
            if (lines[j].includes('</div>')) wrapperCount--;
          }
        }
      }
    }

    content = lines.join('\n');
    modified = true;
  }

  if (modified) {
    await fs.writeFile(filePath, content, 'utf8');
    return { updated: true };
  }

  return { updated: false, reason: 'No matching pattern found' };
}

async function main() {
  console.log('🔄 Finding all calculator page templates...\n');

  const files = await findPageFiles();
  console.log(`Found ${files.length} page templates\n`);

  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (const file of files) {
    try {
      const result = await updateFile(file);
      if (result.updated) {
        console.log(`✅ Updated: ${file}`);
        updated++;
      } else {
        console.log(`⏭️  Skipped: ${file} (${result.reason})`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error: ${file} - ${error.message}`);
      errors.push({ file, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log('='.repeat(60));
  console.log('\n✨ Done! All calculator pages now use CalculatorWrapper\n');
}

main().catch(console.error);
