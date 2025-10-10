#!/usr/bin/env node

/**
 * Update calculator registry to mark calculators with content as hasContent: true
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registryPath = path.join(__dirname, '..', 'lib', 'calculator-registry.ts');
let registryContent = fs.readFileSync(registryPath, 'utf-8');

// List of slugs that now have content (from our generation)
const slugsWithContent = [
  // Italian
  'ritenuta-dacconto-fornitori',
  'imposta-successione-donazione',
  'bollo-auto-e-superbollo',
  'passaggio-proprieta-auto',
  'leasing-vs-noleggio-vs-acquisto',
  'costo-revisione-auto',
  'ammortamento-auto-agenti-commercio',
  'deducibilita-costi-auto-aziendale',
  'break-even-point',
  'ravvedimento-operoso-f24',
  'imposta-bollo-fatture',
  // Spanish
  'calculadora-coste-reforma-vivienda',
  'calculadora-coste-empleado',
  'calculadora-impuesto-sociedades',
  'calculadora-punto-equilibrio',
  'calculadora-amortizacion-activos',
  'calculadora-sucesiones-donaciones',
  'calculadora-ley-segunda-oportunidad',
  'calculadora-coste-okupacion',
  'calculadora-extincion-condominio',
  'calculadora-impuesto-patrimonio',
  'calculadora-amortizacion-vehiculo',
  'calculadora-impuestos-criptomonedas',
  'simulador-declaracion-renta',
  'calculadora-rendimiento-deposito',
  'calculadora-rendimiento-plan-indexado',
  'calculadora-impuestos-venta-vivienda-heredada',
  'calculadora-deducciones-autonomicas',
  // French
  'calculateur-tva',
  // English
  'rental-property-cash-flow-calculator',
  'break-even-point-startup',
  'severance-package-calculator'
];

console.log(`\n🔄 Updating registry for ${slugsWithContent.length} calculators...\n`);

let updated = 0;

slugsWithContent.forEach(slug => {
  // Find the calculator entry and update hasContent
  const regex = new RegExp(
    `(slug:\\s*'${slug}'[\\s\\S]*?hasContent:\\s*)false`,
    'g'
  );

  if (regex.test(registryContent)) {
    registryContent = registryContent.replace(regex, '$1true');
    console.log(`✅ Updated: ${slug}`);
    updated++;
  } else {
    // Check if it's already true or doesn't exist
    const checkRegex = new RegExp(`slug:\\s*'${slug}'[\\s\\S]*?hasContent:\\s*true`);
    if (checkRegex.test(registryContent)) {
      console.log(`⏭️  Already true: ${slug}`);
    } else {
      console.log(`⚠️  Not found: ${slug}`);
    }
  }
});

// Write updated registry
fs.writeFileSync(registryPath, registryContent, 'utf-8');

console.log(`\n✅ Updated ${updated} calculator entries in registry`);
console.log(`📄 Registry file: lib/calculator-registry.ts\n`);
