"use client";

import React, { useEffect } from 'react';
// 1. IMPORTANTE: Importa il componente Script da Next.js
import Script from 'next/script';
import { TrendingUp, Calculator, BarChart3, Users, BookOpen, ExternalLink, Clock, Target, Award, PieChart, AlertTriangle } from 'lucide-react';

const IrfepCuneoGuideCalculator = () => {
  
  // 2. Definisci i dati dello schema direttamente all'interno del componente
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Guida alle Aliquote IRPEF e al Taglio del Cuneo Fiscale 2025",
    "datePublished": "2025-09-04T08:30:00+02:00",
    "dateModified": "2025-09-04T08:30:00+02:00",
    "author": {
      "@type": "Person",
      "name": "Ugo Candido",
      "url": "https://www.linkedin.com/in/ugo-candido-582659a/"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Socalsolver",
      "logo": {
        "@type": "ImageObject",
        "url": "https://socalsolver.com/logo.png" // Assicurati che questo percorso sia corretto
      }
    },
    "description": "La guida definitiva e corretta alla riforma fiscale 2025 in Italia. Analisi dettagliata delle nuove aliquote IRPEF, del taglio del cuneo fiscale e strategie di ottimizzazione."
  };

  const cssVariables = {
    '--color-sunset-orange': '#F26B2E',
    '--color-golden-yellow': '#F9B934',
    '--color-light-sand': '#FCD96F',
    '--color-ocean-teal': '#3C9DA7',
    '--color-dark-brown': '#3A2A1A',
    '--color-cream-bg': '#F9F5E9',
    /* ... Aggiungi le altre variabili CSS qui se necessario ... */
  };

  useEffect(() => {
    Object.entries(cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  return (
    <>
      {/* 3. Inserisci lo Schema qui. Next.js lo posizionerà correttamente nell'head della pagina. */}
      <Script
        id="irpef-calculator-schema" // È buona pratica dare un ID univoco
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Da qui in poi inizia il JSX del tuo componente, che rimane invariato */}
      <div className="min-h-screen bg-[var(--color-cream-bg)] font-sans">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[var(--color-sunset-orange)] to-[var(--color-sunset-orange-dark)] text-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center">
              <div className="bg-[var(--color-golden-yellow)] text-[var(--color-dark-brown)] px-4 py-2 rounded-lg inline-flex items-center gap-2 mb-6 text-sm font-semibold">
                <Clock size={16} />
                Ultimo aggiornamento: 4 Settembre 2025 | Serie: Articolo 2 di 10
              </div>
              <div className="inline-flex items-center gap-3 mb-6">
                <BarChart3 size={40} className="text-[var(--color-golden-yellow)]" />
                <span className="text-[var(--color-golden-yellow)] text-lg font-semibold tracking-wide">GUIDA FISCALE AVANZATA</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">Guida alle Aliquote IRPEF e al Taglio del Cuneo Fiscale 2025</h1>
              <p className="text-xl lg:text-2xl mb-8 text-white max-w-4xl mx-auto">La Fonte di Verità sulla Normativa Fiscale Italiana e le Riforme che Impattano il Tuo Stipendio</p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2"><Clock size={16} /><span>Lettura: 20 min</span></div>
                <div className="flex items-center gap-2"><Award size={16} /><span>Livello: Avanzato</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Introduction */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-[var(--color-sunset-orange)]">
                <h2 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6">La Filosofia della Progressività: Dalla Teoria di Pigou alle Riforme 2025</h2>
                <p className="text-lg text-[var(--color-dark-brown)] mb-6 leading-relaxed">Nel 1920, l'economista Arthur Cecil Pigou formulò la teoria dell'"imposta progressiva ottimale", sostenendo che <em>"il sacrificio marginale dovrebbe essere uguale per tutti i contribuenti"</em>. Un secolo dopo, questa filosofia si incarna nell'IRPEF italiana, un sistema che nel biennio 2024-2025 ha subito trasformazioni significative.</p>
                <p className="text-lg text-[var(--color-dark-brown)] mb-6 leading-relaxed">La riforma non è solo una semplificazione: è anche una risposta parziale al "<strong>drenaggio fiscale</strong>" (fiscal drag), il fenomeno per cui l'inflazione spinge i redditi nominali in scaglioni fiscali più alti, erodendo il potere d'acquisto reale. Comprendere queste dinamiche non è un esercizio accademico, ma una competenza strategica fondamentale.</p>
                <div className="bg-[#F0EDE5] rounded-lg p-6 border-l-4 border-[var(--color-golden-yellow)]">
                    <p className="text-[var(--color-dark-brown)] font-semibold mb-2">🎯 Obiettivo di questa guida:</p>
                    <p className="text-[var(--color-dark-brown)]">Essere la tua fonte autorevole e corretta sulla normativa fiscale 2025, quantificare l'impatto reale delle riforme sul tuo stipendio netto e fornirti strategie di ottimizzazione legittime.</p>
                </div>
            </div>

            {/* ... TUTTO IL RESTO DEL CODICE DEL COMPONENTE CHE TI HO DATO PRIMA ... */}
            {/* ... E' STATO OMESSO QUI PER BREVITA', MA VA INCLUSO ... */}
             {/* Author Bio CORRETTO */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-[var(--color-golden-yellow)]">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-sunset-orange)] to-[var(--color-sunset-orange-dark)] rounded-full flex items-center justify-center text-white text-2xl font-bold">UC</div>
                    <div className="flex-1">
                        <h4 className="text-xl font-bold text-[var(--color-dark-brown)] mb-2"><a href="https://www.linkedin.com/in/ugo-candido-582659a/" target="_blank" rel="author noopener noreferrer" className="hover:underline">Ugo Candido</a></h4>
                        <p className="text-[var(--color-dark-brown)] mb-4 leading-relaxed"><strong>MBA - MIB Trieste School of Management</strong><br/>Esperto di Total Compensation e ottimizzazione retributiva con oltre 10 anni di esperienza in contesti multinazionali (Italia, Cina, USA). Specializzato nell'analisi di strutture salariali complesse e nell'adeguamento dei pacchetti retributivi alle riforme fiscali internazionali. Ha gestito l'implementazione delle strategie di compensazione post-riforma 2024-2025 per diverse aziende, massimizzando il netto in busta paga per i dipendenti a parità di costo aziendale.</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-[var(--color-ocean-teal)] text-white px-3 py-1 rounded-full text-xs">MBA</span>
                            <span className="bg-[var(--color-sunset-orange)] text-white px-3 py-1 rounded-full text-xs">Total Compensation</span>
                            <span className="bg-[var(--color-golden-yellow)] text-white px-3 py-1 rounded-full text-xs">Fiscal Optimization</span>
                            <span className="bg-[var(--color-dark-brown)] text-white px-3 py-1 rounded-full text-xs">Payroll Strategy</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </>
  );
};

export default IrfepCuneoGuideCalculator;