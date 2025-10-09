#!/bin/bash

# ==============================================================================
# SOCALSOLVER PROFESSIONAL COMPLETE SETUP v2.0
# Setup completo da zero - Progetto Next.js Enterprise
# ==============================================================================

echo "🚀 SOCALSOLVER PROFESSIONAL - Setup Completo da Zero"
echo "===================================================="

# Verifica che siamo in una cartella vuota
if [ "$(ls -A . 2>/dev/null)" ]; then
    echo "⚠️  La cartella non è vuota. Continuare? (y/n)"
    read -r CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "❌ Setup annullato"
        exit 1
    fi
fi

echo "📁 Setup in: $(pwd)"
echo ""

# ========================================
# FASE 1: STRUTTURA BASE PROGETTO
# ========================================
echo "📁 FASE 1: Creazione struttura progetto..."

# Crea struttura directory principale
mkdir -p app/{it,es,en,fr} \
         components/{layout,ui,calculators,charts,forms} \
         content/{it,es,en,fr} \
         hooks \
         utils \
         public \
         scripts

echo "  ✅ Directory principali create"

# Crea struttura app multilingua
LANGUAGES=("it" "es" "en" "fr")
declare -A CATEGORIES_IT=(
    ["fisco-e-lavoro-autonomo"]="Fisco e Lavoro Autonomo"
    ["veicoli-e-trasporti"]="Veicoli e Trasporti"
    ["immobiliare-e-casa"]="Immobiliare e Casa"
    ["finanza-personale"]="Finanza Personale"
    ["salute-e-benessere"]="Salute e Benessere"
    ["matematica-e-geometria"]="Matematica e Geometria"
    ["conversioni"]="Conversioni"
    ["vita-quotidiana"]="Vita Quotidiana"
    ["risparmio-e-investimenti"]="Risparmio e Investimenti"
    ["famiglia-e-vita-quotidiana"]="Famiglia e Vita Quotidiana"
    ["agricoltura-e-cibo"]="Agricoltura e Cibo"
    ["pmi-e-impresa"]="PMI e Impresa"
)

# Crea struttura categorie per italiano (modello)
for category_slug in "${!CATEGORIES_IT[@]}"; do
    mkdir -p app/it/$category_slug/[slug]
    mkdir -p content/it/$category_slug
done

echo "  ✅ Struttura categorie create"

# ========================================
# FASE 2: FILE DI CONFIGURAZIONE
# ========================================
echo "⚙️  FASE 2: File di configurazione..."

# package.json COMPLETO
cat <<'EOF' > package.json
{
  "name": "socalsolver-pro",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "generate": "node automation.js",
    "postbuild": "next-sitemap --config next-sitemap.config.cjs"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "react-markdown": "^9.0.1",
    "recharts": "^2.12.7",
    "framer-motion": "^11.2.10",
    "react-hook-form": "^7.51.4",
    "@headlessui/react": "^1.7.19",
    "@heroicons/react": "^2.0.18",
    "date-fns": "^3.6.0",
    "numeral": "^2.0.6",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.13",
    "@tailwindcss/forms": "^0.5.7",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.19",
    "dotenv": "^16.4.5",
    "eslint": "^8",
    "eslint-config-next": "14.2.3",
    "googleapis": "^140.0.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5",
    "next-sitemap": "^4.2.3"
  }
}
EOF

# next.config.mjs
cat <<'EOF' > next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  }
    async redirects() {
        return [
            {
                source: '/',
                destination: '/it',
                permanent: true,
            },
        ]
    },
};

export default nextConfig;
EOF

# Tailwind config
cat <<'EOF' > tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
EOF

# Altri file config
cat <<'EOF' > postcss.config.cjs
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

cat <<'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cat <<'EOF' > .eslintrc.json
{
  "extends": "next/core-web-vitals"
}
EOF

echo "  ✅ File di configurazione creati"

# ========================================
# FASE 3: LAYOUT E STRUTTURA BASE
# ========================================
echo "🏗️  FASE 3: Layout e struttura base..."

# app/globals.css
cat <<'EOF' > app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Stili personalizzati */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
EOF

# app/layout.tsx (ROOT)
cat <<'EOF' > app/layout.tsx
import React from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
EOF

# app/it/layout.tsx
cat <<'EOF' > app/it/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: "SoCalSolver - Calcolatori Online Professionali",
    template: "%s | SoCalSolver",
  },
  description: "Calcolatori online per fisco, finanza, salute e molto altro.",
};

export default function ItalianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      <Header lang="it" />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer lang="it" />
    </div>
  );
}
EOF

# app/it/page.tsx (HOMEPAGE BASE)
cat <<'EOF' > app/it/page.tsx
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';

async function getCategories() {
    const categoriesPath = path.join(process.cwd(), 'app', 'it');
    try {
        const entries = await fs.readdir(categoriesPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory() && !entry.name.startsWith('[') && !entry.name.startsWith('('))
            .map(entry => {
                const name = entry.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return { name, slug: entry.name };
            });
    } catch (error) {
        return [];
    }
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-ocean-teal-dark to-ocean-teal text-white rounded-2xl">

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          SoCalSolver Professional
        </h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-8">
          Calcolatori professionali per fisco, finanza, immobiliare e molto altro
        </p>
        <div className="flex justify-center space-x-4">
          <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
            ✨ 1500+ Calcolatori
          </span>
          <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
            📊 Grafici Interattivi
          </span>
          <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
            🎯 Risultati Precisi
          </span>
        </div>
      </section>
      
      {/* Categories Grid */}
      <section>
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Esplora per Categoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
                 <Link 
                   key={cat.slug} 
                   href={`/it/${cat.slug}`} 
                   className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                 >
                    <div className="text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                      <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
EOF

echo "  ✅ Layout base creati"

# ========================================
# FASE 4: COMPONENTI LAYOUT
# ========================================
echo "🧩 FASE 4: Componenti layout..."

# Header
cat <<'EOF' > components/layout/Header.tsx
'use client';
import Link from "next/link";

export default function Header({ lang }: { lang: string }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/${lang}`} className="text-2xl font-bold text-blue-600">
          SoCalSolver
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link href={`/${lang}`} className="text-gray-700 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href={`/${lang}/fisco-e-lavoro-autonomo`} className="text-gray-700 hover:text-blue-600 transition-colors">
            Fisco
          </Link>
          <Link href={`/${lang}/immobiliare-e-casa`} className="text-gray-700 hover:text-blue-600 transition-colors">
            Immobiliare
          </Link>
        </div>
      </nav>
    </header>
  );
}
EOF

# Footer
cat <<'EOF' > components/layout/Footer.tsx
'use client';

export default function Footer({ lang }: { lang: string }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-800 text-slate-300 py-12 mt-12">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">SoCalSolver</h3>
          <p className="text-lg opacity-90">Calcolatori professionali per ogni esigenza</p>
        </div>
        <div className="border-t border-slate-700 pt-6">
          <p>© {currentYear} SoCalSolver. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}
EOF

# Breadcrumb
cat <<'EOF' > components/layout/Breadcrumb.tsx
import Link from 'next/link';

type Crumb = { name: string; path?: string; }

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
                {crumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center">
                        {crumb.path ? (
                            <Link href={crumb.path} className="text-blue-600 hover:underline">
                                {crumb.name}
                            </Link>
                        ) : (
                            <span className="text-gray-500">{crumb.name}</span>
                        )}
                        {index < crumbs.length - 1 && (
                            <svg className="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
EOF

echo "  ✅ Componenti layout creati"

# ========================================
# FASE 5: TEMPLATE PAGINE CATEGORIA
# ========================================
echo "📄 FASE 5: Template pagine categoria..."

# Template per pagina categoria
for category_slug in "${!CATEGORIES_IT[@]}"; do
    category_name=${CATEGORIES_IT[$category_slug]}
    
    cat <<EOF > app/it/$category_slug/page.tsx
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import Breadcrumb from '@/components/layout/Breadcrumb';

async function getCalculators() {
    const calculatorsPath = path.join(process.cwd(), 'content', 'it', '$category_slug');
    try {
        const entries = await fs.readdir(calculatorsPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
            .map(entry => {
                const slug = entry.name.replace('.md', '');
                const name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return { name, slug };
            });
    } catch (error) { return []; }
}

export default async function CategoryPage() {
  const calculators = await getCalculators();
  const categoryName = "$category_name";
  const crumbs = [{ name: "Home", path: "/it" }, { name: categoryName }];

  return (
    <div className="space-y-8">
      <Breadcrumb crumbs={crumbs} />
      
      {/* Hero Category */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">{categoryName}</h1>
        <p className="text-xl opacity-90">Calcolatori professionali per {categoryName.toLowerCase()}</p>
      </div>

      {/* Calculators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculators.map((calc) => (
            <Link 
              key={calc.slug} 
              href={\`/it/$category_slug/\${calc.slug}\`} 
              className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <h2 className="font-bold text-xl text-slate-800 mb-2 hover:text-blue-600 transition-colors">
                {calc.name}
              </h2>
              <p className="text-gray-600">Calcolo professionale per {calc.name.toLowerCase()}</p>
            </Link>
        ))}
      </div>
    </div>
  );
}
EOF

    # Template per pagina singolo calcolatore
    cat <<EOF > app/it/$category_slug/[slug]/page.tsx
import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Breadcrumb from '@/components/layout/Breadcrumb';

type Props = { params: { slug: string } };

async function getCalculatorComponent(slug: string) {
  try {
    const componentName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    return (await import(\`@/components/calculators/\${componentName}\`)).default;
  } catch (error) { return null; }
}

async function getContent(slug: string) {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'it', '$category_slug', \`\${slug}.md\`);
    return await fs.readFile(contentPath, 'utf8');
  } catch (error) { return null; }
}

export default async function CalculatorPage({ params }: Props) {
  const CalculatorComponent = await getCalculatorComponent(params.slug);
  const content = await getContent(params.slug);

  if (!CalculatorComponent) notFound();
  
  const calculatorName = params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const crumbs = [
      { name: "Home", path: "/it" },
      { name: "$category_name", path: "/it/$category_slug" },
      { name: calculatorName }
  ];

  return (
    <div className="space-y-8">
        <Breadcrumb crumbs={crumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg">
                <CalculatorComponent />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Strumenti</h3>
                    <div className="space-y-2">
                        <button className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                            📊 Salva Risultato
                        </button>
                        <button className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                            📄 Esporta PDF
                        </button>
                        <button className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                            🔗 Condividi
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Content */}
        {content && (
            <article className="prose lg:prose-xl max-w-none bg-white p-8 rounded-2xl shadow-lg">
                <ReactMarkdown>{content}</ReactMarkdown>
            </article>
        )}
    </div>
  );
}
EOF
done

echo "  ✅ Template pagine create"

# ========================================
# FASE 6: SCRIPT DI AUTOMAZIONE
# ========================================
echo "🤖 FASE 6: Script automazione..."

# automation.js BASE
cat <<'EOF' > automation.js
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🤖 SoCalSolver Professional - Script Automazione');

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// TODO: Implementare logica completa di automazione
console.log('⚠️  Configura .env e credentials.json per utilizzare l\'automazione');

async function main() {
    console.log('📋 Setup automazione completato');
    console.log('📝 Crea i file:');
    console.log('   - .env (con SHEET_ID, GEMINI_API_KEY, etc.)');
    console.log('   - credentials.json (Google Sheets API)');
    console.log('   - prompt_component.txt');
    console.log('   - prompt_content.txt');
}

main();
EOF

# File .env template
cat <<'EOF' > .env.example
# Copia questo file in .env e compila i valori

# Google Sheets
SHEET_ID=your_sheet_id_here
SHEET_NAME=calculators

# AI API Keys
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
EOF

echo "  ✅ Script automazione base creato"

# ========================================
# FASE 7: UTILITIES
# ========================================
echo "🛠️  FASE 7: Utilities..."

# Utilità matematiche
cat <<'EOF' > utils/math.ts
/**
 * Utilità matematiche per calcolatori professionali
 */

export const formatCurrency = (value: number, currency = 'EUR', locale = 'it-IT'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  periods: number
): number => {
  return principal * Math.pow(1 + rate, periods);
};
EOF

echo "  ✅ Utilities create"

# ========================================
# FASE 8: FINALIZE
# ========================================
echo "🎯 FASE 8: Finalizzazione..."

# .gitignore
cat <<'EOF' > .gitignore
# Dependencies
node_modules/
.pnpm-debug.log*

# Next.js
.next/
out/

# Environment variables
.env
.env.local
.env.production.local

# IDEs
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Credentials
credentials.json
EOF

# README
cat <<'EOF' > README.md
# 🚀 SoCalSolver Professional

Piattaforma di calcolatori online professionali di livello enterprise.

## 🎯 Features

- ✅ 1500+ Calcolatori professionali
- ✅ Grafici interat

- ✅ Export PDF/Excel
- ✅ Multilingua (IT/ES/EN/FR)
- ✅ SEO ottimizzato
- ✅ Automazione AI

## 🚀 Quick Start

```bash
# Installa dipendenze
npm install

# Avvia in sviluppo
npm run dev

# Build produzione
npm run build
```

## 📁 Struttura Progetto

```
├── app/                 # Next.js App Router
├── components/          # Componenti React
├── content/            # Contenuti Markdown
├── utils/              # Utilities
└── automation.js      # Script automazione AI
```

## ⚙️ Configurazione

1. Copia `.env.example` in `.env`
2. Configura le API keys
3. Aggiungi `credentials.json` per Google Sheets
4. Esegui `npm run generate` per l'automazione

## 📊 Tecnologie

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Google Sheets API
- AI Automation (Gemini/OpenAI)
EOF

echo "  ✅ File finali creati"

# ========================================
# REPORT FINALE
# ========================================
echo ""
echo "🎉 SETUP COMPLETO TERMINATO!"
echo "=========================="
echo ""
echo "📊 STRUTTURA CREATA:"
echo "  ✅ $(find app -type f | wc -l) file in /app"
echo "  ✅ $(find components -type f | wc -l) componenti"
echo "  ✅ $(find utils -type f | wc -l) utility"
echo "  ✅ $(ls -1 *.json *.js *.ts *.mjs | wc -l) file di configurazione"
echo ""
echo "🚀 PROSSIMI PASSI:"
echo "1. npm install                    # Installa dipendenze"
echo "2. cp .env.example .env          # Configura environment"  
echo "3. npm run dev                   # Avvia server sviluppo"
echo "4. Aggiungi credentials.json     # Per automazione"
echo "5. Crea prompt_component.txt     # Per AI generation"
echo ""
echo "📍 Il sito sarà disponibile su: http://localhost:3000"
echo ""
echo "✨ Buon lavoro con SoCalSolver Professional!"
EOF

chmod +x complete_setup_script.sh

echo "✅ Script setup completo creato!"
echo ""
echo "🎯 UTILIZZO:"
echo "1. mkdir socalsolver-pro"
echo "2. cd socalsolver-pro"  
echo "3. bash ../complete_setup_script.sh"
echo "4. npm install"
echo "5. npm run dev"
