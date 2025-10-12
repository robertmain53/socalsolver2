#!/usr/bin/env node

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function findCalculatorComponents() {
  const { stdout } = await execAsync('find components/calculators -type f -name "*.tsx"');
  return stdout.trim().split('\n').filter(Boolean);
}

async function fixCalculator(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  const original = content;

  // Remove duplicate wrapper patterns
  // Pattern: <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
  content = content.replace(
    /<div className="w-full max-w-\w+ mx-auto p-\d+ bg-white rounded-\w+ shadow-\w+">/g,
    '<div>'
  );

  // Pattern: Any div with bg-white + rounded + shadow
  content = content.replace(
    /<div className="([^"]*)bg-white([^"]*)rounded([^"]*)shadow([^"]*)">/g,
    '<div className="$1$2$3$4">'.replace(/\s+/g, ' ')
  );

  if (content !== original) {
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  console.log('Finding calculator components...');

  const files = await findCalculatorComponents();
  console.log('Found ' + files.length + ' files');

  let fixed = 0;

  for (const file of files) {
    try {
      if (await fixCalculator(file)) {
        console.log('Fixed: ' + file);
        fixed++;
      }
    } catch (error) {
      console.error('Error: ' + file + ' - ' + error.message);
    }
  }

  console.log('\nFixed ' + fixed + ' calculators');
}

main().catch(console.error);
