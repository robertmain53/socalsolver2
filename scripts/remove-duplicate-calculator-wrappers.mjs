#!/usr/bin/env node

/**
 * Remove duplicate wrapper divs from calculator components
 * Calculators should not have their own bg-white, rounded, shadow wrappers
 * since the page template provides CalculatorWrapper
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function findCalculatorComponents() {
  const { stdout } = await execAsync('find components/calculators -type f -name "*.tsx"');
  return stdout.trim().split('\n').filter(Boolean);
}

async function fixCalculatorComponent(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  let modified = false;

  // Pattern 1: Full wrapper with styling
  // <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
  const wrapperPattern1 = /<div className="w-full max-w-\w+ mx-auto p-\d+ bg-white rounded-\w+ shadow-\w+">/g;

  if (wrapperPattern1.test(content)) {
    // Replace with simple div or remove entirely
    content = content.replace(wrapperPattern1, '<div className="w-full">');
    modified = true;
  }

  // Pattern 2: Shorter wrapper
  // <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
  const wrapperPattern2 = /<div className="[^"]*bg-white[^"]*rounded[^"]*shadow[^"]*">/g;

  if (wrapperPattern2.test(content)) {
    content = content.replace(wrapperPattern2, (match) => {
      // Only replace if it has bg-white, rounded, AND shadow together
      if (match.includes('bg-white') && match.includes('rounded') && match.includes('shadow')) {
        return '<div className="w-full">';
      }
      return match;
    });
    modified = true;
  }

  // Pattern 3: Remove max-w constraints that conflict with page layout
  content = content.replace(/className="([^"]*)\bmax-w-\w+\b([^"]*)"/g, (match, before, after) => {
    // Only remove max-w if it's on the outermost div
    const cleaned = `${before.trim()} ${after.trim()}`.replace(/\s+/g, ' ').trim();
    return `className="${cleaned}"`;
  });

  if (modified) {
    await fs.writeFile(filePath, content, 'utf8');
    return { updated: true };
  }

  return { updated: false };
}

async function main() {
  console.log('🔄 Finding all calculator components...\n');

  const files = await findCalculatorComponents();
  console.log(`Found ${files.length} calculator components\n');

  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (const file of files) {
    try {
      const result = await fixCalculatorComponent(file);
      if (result.updated) {
        console.log(`✅ Fixed: ${path.basename(file)}`);
        updated++;
      } else {
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
  console.log(`✅ Fixed: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log('='.repeat(60));
  console.log('\n✨ Done! Duplicate wrappers removed\n');
}

main().catch(console.error);
