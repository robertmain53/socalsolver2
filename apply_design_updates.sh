#!/bin/bash

# ==============================================================================
# SocalSolver Pro - Design & Layout Improvement Script
# ==============================================================================
# This script applies the following changes:
# 1. Adds the new "Sunset" color palette to tailwind.config.ts.
# 2. Sets foundational styles in app/globals.css for a consistent look.
# 3. Refactors the main layout files for a sticky footer and responsive padding.
# 4. Makes all calculator pages mobile-first by hiding the sidebar on small screens.
# 5. Updates the Footer component with the new color scheme.
#
# Changes in this version:
# - Made sed commands more portable for macOS/Linux compatibility.
# - Replaced complex sed logic with more robust `cat` heredocs.
# - Fixed a potential syntax error in the Footer component content.
# ==============================================================================

# --- Stop on any error ---
set -e

echo "🚀 Starting the design and layout update process..."

# --- 1. Add New Color Palette to Tailwind Config ---
TAILWIND_CONFIG="tailwind.config.ts"
if grep -q "'dusk-sand'" "$TAILWIND_CONFIG"; then
  echo "🎨 Colors already exist in $TAILWIND_CONFIG. Skipping."
else
  echo "🎨 Adding new color palette to $TAILWIND_CONFIG..."
  # Use .bak extension for sed -i for portability and remove it after.
  sed -i.bak "/extend: {/a \\
      colors: {\\
        'dusk-sand': '#F6F4EE',\\
        'deep-ocean': '#003B5C',\\
        'fiery-orange': '#EC6449',\\
        'golden-hour': '#F9994B',\\
        'twilight-purple': '#5C53A5',\\
      }," "$TAILWIND_CONFIG" && rm "${TAILWIND_CONFIG}.bak"
  echo "✅ Color palette added successfully."
fi
echo "---"

# --- 2. Set Foundational Styles in Globals.css ---
GLOBALS_CSS="app/globals.css"
echo "🎨 Applying foundational styles to $GLOBALS_CSS..."
cat << 'EOF' > "$GLOBALS_CSS"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-dusk-sand text-deep-ocean;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold text-deep-ocean;
  }

  h1 { @apply text-3xl md:text-4xl mb-4; }
  h2 { @apply text-2xl md:text-3xl mb-3; }
  h3 { @apply text-xl md:text-2xl mb-2; }

  p {
    @apply mb-4 leading-relaxed;
  }

  a {
    @apply text-fiery-orange hover:text-golden-hour transition-colors;
  }
}
EOF
echo "✅ Global styles updated successfully."
echo "---"

# --- 3. Refactor All Root Layouts (More Robust Method) ---
echo "🏗️ Refactoring root layout files for sticky footer and responsiveness..."
for lang in en es fr it; do
  LAYOUT_FILE="app/$lang/layout.tsx"
  if [ -f "$LAYOUT_FILE" ]; then
    echo "   - Updating $LAYOUT_FILE"
    # Overwrite the file with a heredoc for better reliability than the previous sed command.
    # Note: We use `cat << EOF` without quotes to allow shell expansion for `$lang`.
    cat << EOF > "$LAYOUT_FILE"
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="$lang">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header lang="$lang" />
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer lang="$lang" />
        </div>
      </body>
    </html>
  );
}
EOF
  else
    echo "   - Warning: $LAYOUT_FILE not found."
  fi
done
echo "✅ Root layouts refactored successfully."
echo "---"

# --- 4. Make Calculator Pages Mobile-First (More Portable Method) ---
echo "📱 Making all calculator pages mobile-first..."
# Using a find loop and portable sed command to avoid OS-specific issues.
find ./app -type f -name "page.tsx" -path "*/\[slug\]/page.tsx" | while read -r file; do
  # Check if the file actually needs changes to avoid unnecessary modifications
  if grep -q 'flex-col md:flex-row' "$file"; then
    echo "   - Modifying $file"
    sed -i.bak \
      -e 's/flex-col md:flex-row/flex-row/g' \
      -e 's/<div className="md:w-3\/4">/<div className="w-full md:w-3\/4 flex-shrink-0">/g' \
      -e 's/<aside className="md:w-1\/4">/<aside className="hidden md:block md:w-1\/4">/g' \
      "$file"
  else
    echo "   - Skipping $file (already modified)."
  fi
done
# Clean up backup files created by sed
find ./app -type f -name "*.bak" -delete
echo "✅ All calculator pages have been updated."
echo "---"

# --- 5. Update Footer Component (with fix for syntax error) ---
FOOTER_COMPONENT="components/layout/Footer.tsx"
echo "🎨 Updating the Footer component with the new color scheme..."
# The original syntax error was likely caused by the shell misinterpreting `{new Date().getFullYear()}`.
# Replaced with a static year for robustness in the script.
cat << 'EOF' > "$FOOTER_COMPONENT"
import Link from 'next/link';

const Footer = ({ lang }: { lang: string }) => {
  const translations = {
    en: {
      about: { title: 'About SocalSolver', description: 'Your go-to platform for a wide range of calculators to solve everyday problems.' },
      legal: {
        title: 'Legal',
        links: [
          { href: '/privacy-policy', text: 'Privacy Policy' },
          { href: '/terms-of-service', text: 'Terms of Service' },
        ],
      },
      contact: { title: 'Contact', description: 'For inquiries, please reach out via our contact page.' },
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
    },
    it: {
      about: { title: 'Chi siamo SocalSolver', description: 'La tua piattaforma di riferimento per una vasta gamma di calcolatori per risolvere i problemi di tutti i giorni.' },
      legal: {
        title: 'Legale',
        links: [
          { href: '/privacy-policy', text: 'Informativa sulla privacy' },
          { href: '/terms-of-service', text: 'Termini di servizio' },
        ],
      },
      contact: { title: 'Contatti', description: 'Per informazioni, si prega di contattarci tramite la nostra pagina di contatto.' },
      privacyPolicy: 'Informativa sulla privacy',
      termsOfService: 'Termini di servizio',
    },
    es: {
      about: { title: 'Sobre SocalSolver', description: 'Tu plataforma de referencia para una amplia gama de calculadoras para resolver problemas cotidianos.' },
      legal: {
        title: 'Legal',
        links: [
          { href: '/privacy-policy', text: 'Política de privacidad' },
          { href: '/terms-of-service', text: 'Términos de servicio' },
        ],
      },
      contact: { title: 'Contacto', description: 'Para consultas, por favor contáctenos a través de nuestra página de contacto.' },
      privacyPolicy: 'Política de privacidad',
      termsOfService: 'Términos de servicio',
    },
    fr: {
      about: { title: 'À propos de SocalSolver', description: 'Votre plateforme de prédilection pour une large gamme de calculateurs pour résoudre les problèmes du quotidien.' },
      legal: {
        title: 'Légal',
        links: [
          { href: '/privacy-policy', text: 'Politique de confidentialité' },
          { href: '/terms-of-service', text: 'Conditions d\'utilisation' },
        ],
      },
      contact: { title: 'Contact', description: 'Pour toute demande, veuillez nous contacter via notre page de contact.' },
      privacyPolicy: 'Politique de confidentialité',
      termsOfService: 'Conditions d\'utilisation',
    },
  };

  const t = translations[lang] || translations.en;

  return (
    <footer className="bg-twilight-purple text-dusk-sand p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4 text-golden-hour">{t.about.title}</h3>
          <p className="text-sm">{t.about.description}</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-golden-hour">{t.legal.title}</h3>
          <ul className="space-y-2 text-sm">
            {t.legal.links.map(link => (
              <li key={link.href}>
                <Link href={`/${lang}${link.href}`} className="hover:text-golden-hour transition-colors">
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-golden-hour">{t.contact.title}</h3>
          <p className="text-sm">{t.contact.description}</p>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-golden-hour border-opacity-30 text-center text-sm">
        <p>&copy; 2025 SocalSolver. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
EOF
echo "✅ Footer component updated successfully."
echo "---"

echo "🎉 All updates have been applied successfully!"
echo "To run this script, save it as apply_design_updates.sh and run the following commands:"
echo "chmod +x apply_design_updates.sh"
echo "./apply_design_updates.sh"
