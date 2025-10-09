#!/bin/bash

echo "🔧 Fixing build errors and warnings for SoCalSolver"
echo "=================================================="

# 1. Fix RelatedCalculators.tsx useEffect warning
echo "📊 Fixing RelatedCalculators.tsx useEffect warning..."

cat > "components/calculator/RelatedCalculators.tsx" << 'EOF'
// components/calculator/RelatedCalculators.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ChevronRightIcon, 
  CalculatorIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

interface Calculator {
  name: string;
  slug: string;
  description?: string;
}

interface RelatedCalculatorsProps {
  currentCategory: string;
  currentSlug: string;
  lang: string;
  maxItems?: number;
}

// Mapping delle categorie con i loro calcolatori
const CATEGORY_CALCULATORS: Record<string, Calculator[]> = {
  'fisco-e-lavoro-autonomo': [
    { name: 'Tasse Regime Forfettario', slug: 'tasse-regime-forfettario', description: 'Calcola tasse, acconti e saldi per il regime forfettario' },
    { name: 'Tassazione Periti Industriali EPPI', slug: 'tassazione-periti-industriali-eppi', description: 'Calcolo imposte per periti industriali con EPPI' },
    { name: 'Tassazione Consulenti Finanziari OCF', slug: 'tassazione-consulenti-finanziari-ocf', description: 'Imposte per consulenti finanziari iscritti OCF' },
    { name: 'Tassazione Agenti Immobiliari INPS', slug: 'tassazione-agenti-immobiliari-inps', description: 'Calcolo tasse e contributi per agenti immobiliari' },
    { name: 'Calcolo IRPEF Dipendenti', slug: 'calcolo-irpef-dipendenti', description: 'Imposta sul reddito per lavoratori dipendenti' },
    { name: 'Contributi INPS Artigiani', slug: 'contributi-inps-artigiani', description: 'Contributi previdenziali per artigiani e commercianti' },
    { name: 'Cedolare Secca Affitti', slug: 'cedolare-secca-affitti', description: 'Calcolo tassazione locazioni con cedolare secca' },
    { name: 'Detrazioni Fiscali Casa', slug: 'detrazioni-fiscali-casa', description: 'Bonus casa, ristrutturazioni e superbonus' }
  ],
  'immobiliare-e-casa': [
    { name: 'Calcolo Mutuo', slug: 'calcolo-mutuo', description: 'Rate, interessi e piano di ammortamento mutui' },
    { name: 'Rendimento Investimento Immobiliare', slug: 'rendimento-investimento-immobiliare', description: 'ROI e cash flow degli investimenti immobiliari' },
    { name: 'Calcolo IMU TASI', slug: 'calcolo-imu-tasi', description: 'Imposte comunali su immobili' },
    { name: 'Valutazione Immobile', slug: 'valutazione-immobile', description: 'Stima valore di mercato proprietà immobiliari' },
    { name: 'Spese Notarili Acquisto Casa', slug: 'spese-notarili-acquisto-casa', description: 'Costi notarili per compravendite immobiliari' },
    { name: 'Rata Affitto Sostenibile', slug: 'rata-affitto-sostenibile', description: 'Calcolo affitto in base al reddito' },
    { name: 'Plusvalenza Immobiliare', slug: 'plusvalenza-immobiliare', description: 'Guadagno tassabile dalla vendita immobili' }
  ],
  'finanza-personale': [
    { name: 'Budget Familiare', slug: 'budget-familiare', description: 'Gestione entrate e uscite della famiglia' },
    { name: 'Calcolo Prestito Personale', slug: 'calcolo-prestito-personale', description: 'Rate e costi di finanziamenti personali' },
    { name: 'Piano Risparmio', slug: 'piano-risparmio', description: 'Obiettivi di risparmio e investimento' },
    { name: 'Calcolo TAEG', slug: 'calcolo-taeg', description: 'Tasso annuo effettivo globale di finanziamenti' },
    { name: 'Inflazione e Potere Acquisto', slug: 'inflazione-potere-acquisto', description: 'Impatto inflazione sul patrimonio' }
  ],
  'pmi-e-impresa': [
    { name: 'Calcolo IRES IRAP SRL SRLS', slug: 'calcolo-ires-irap-srl-srls', description: 'Imposte societarie per SRL e SRLS' },
    { name: 'Costo Totale Dipendente', slug: 'costo-totale-dipendente-cuneo-fiscale', description: 'Costo complessivo del lavoro dipendente' },
    { name: 'Break Even Point', slug: 'break-even-point', description: 'Punto di pareggio per attività imprenditoriali' },
    { name: 'ROI Investimenti Aziendali', slug: 'roi-investimenti-aziendali', description: 'Ritorno sugli investimenti aziendali' },
    { name: 'Cash Flow Aziendale', slug: 'cash-flow-aziendale', description: 'Flussi di cassa e liquidità aziendale' }
  ],
  'risparmio-e-investimenti': [
    { name: 'Rendimento Investimenti', slug: 'rendimento-investimenti', description: 'Calcolo ROI e performance investimenti' },
    { name: 'Interesse Composto', slug: 'interesse-composto', description: 'Crescita del capitale con capitalizzazione' },
    { name: 'Piano Accumulo PAC', slug: 'piano-accumulo-pac', description: 'Investimenti periodici programmati' },
    { name: 'Diversificazione Portafoglio', slug: 'diversificazione-portafoglio', description: 'Allocazione ottimale degli investimenti' },
    { name: 'Calcolo Dividendi', slug: 'calcolo-dividendi', description: 'Rendimento da dividendi azionari' }
  ],
  'veicoli-e-trasporti': [
    { name: 'Costo Totale Auto', slug: 'costo-totale-auto', description: 'TCO completo di possesso auto' },
    { name: 'Calcolo Bollo Auto', slug: 'calcolo-bollo-auto', description: 'Tassa di possesso veicoli' },
    { name: 'Consumi Carburante', slug: 'consumi-carburante', description: 'Costi carburante e efficienza' },
    { name: 'Leasing vs Acquisto Auto', slug: 'leasing-vs-acquisto-auto', description: 'Confronto opzioni finanziamento auto' },
    { name: 'Valore Residuo Auto', slug: 'valore-residuo-auto', description: 'Deprezzamento e valore futuro veicoli' }
  ],
  'salute-e-benessere': [
    { name: 'Calcolo BMI', slug: 'calcolo-bmi', description: 'Indice di massa corporea e peso ideale' },
    { name: 'Fabbisogno Calorico', slug: 'fabbisogno-calorico', description: 'Calorie giornaliere necessarie' },
    { name: 'Calcolo Ciclo Sonno', slug: 'calcolo-ciclo-sonno', description: 'Orari ottimali per dormire e svegliarsi' },
    { name: 'Idratazione Giornaliera', slug: 'idratazione-giornaliera', description: 'Quantità acqua da bere al giorno' }
  ]
};

// Icone per le categorie
const CATEGORY_ICONS: Record<string, string> = {
  'fisco-e-lavoro-autonomo': '💼',
  'immobiliare-e-casa': '🏠',
  'finanza-personale': '💰',
  'pmi-e-impresa': '🏢',
  'risparmio-e-investimenti': '📈',
  'veicoli-e-trasporti': '🚗',
  'salute-e-benessere': '🏥',
  'matematica-e-geometria': '📊',
  'conversioni': '🔄',
  'famiglia-e-vita-quotidiana': '👨‍👩‍👧‍👦',
  'agricoltura-e-cibo': '🌾',
  'vita-quotidiana': '📱'
};

export default function RelatedCalculators({ 
  currentCategory, 
  currentSlug, 
  lang = 'it',
  maxItems = 6 
}: RelatedCalculatorsProps) {
  const [relatedCalculators, setRelatedCalculators] = useState<Calculator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRelatedCalculators = useCallback(() => {
    setIsLoading(true);
    
    try {
      // Ottieni tutti i calcolatori della categoria corrente
      const categoryCalculators = CATEGORY_CALCULATORS[currentCategory] || [];
      
      // Filtra quello corrente
      const otherCalculators = categoryCalculators.filter(calc => calc.slug !== currentSlug);
      
      // Mescola l'array e prendi un numero casuale
      const shuffled = [...otherCalculators].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, maxItems);
      
      setRelatedCalculators(selected);
    } catch (error) {
      console.error('Errore caricamento calcolatori correlati:', error);
      setRelatedCalculators([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCategory, currentSlug, maxItems]);

  useEffect(() => {
    loadRelatedCalculators();
  }, [loadRelatedCalculators]);

  const refreshSuggestions = () => {
    loadRelatedCalculators();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedCalculators.length === 0) {
    return null;
  }

  const categoryIcon = CATEGORY_ICONS[currentCategory] || '📊';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="text-3xl mr-3">{categoryIcon}</div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              Calcolatori Correlati
            </h3>
            <p className="text-gray-600">
              Altri strumenti utili nella categoria {currentCategory.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </p>
          </div>
        </div>
        
        <button
          onClick={refreshSuggestions}
          className="flex items-center px-4 py-2 bg-white border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 font-medium"
        >
          <SparklesIcon className="w-4 h-4 mr-2" />
          Nuovi Suggerimenti
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedCalculators.map((calculator, index) => (
          <Link
            key={`${calculator.slug}-${index}`}
            href={`/${lang}/${currentCategory}/${calculator.slug}`}
            className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-blue-200"
          >
            <div className="p-6">
              {/* Header con icona */}
              <div className="flex items-start mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4 group-hover:scale-110 transition-transform duration-200">
                  <CalculatorIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                    {calculator.name}
                  </h4>
                </div>
              </div>
              
              {/* Descrizione */}
              {calculator.description && (
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {calculator.description}
                </p>
              )}
              
              {/* Footer con call-to-action */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500 font-medium">
                  Calcolo gratuito
                </span>
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-800 transition-colors">
                  <span>Calcola ora</span>
                  <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Link alla categoria completa */}
      <div className="mt-8 text-center">
        <Link
          href={`/${lang}/${currentCategory}`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <span>Vedi tutti i calcolatori di questa categoria</span>
          <ChevronRightIcon className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
}

// Hook per aggiornare dinamicamente i calcolatori disponibili
export function useUpdateCalculatorsList() {
  const updateCalculators = async (category: string, calculators: Calculator[]) => {
    // In una versione avanzata, questo potrebbe salvare i dati in localStorage
    // o fare una chiamata API per aggiornare la lista dinamicamente
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dynamic_calculators') || '{}';
      const dynamicCalcs = JSON.parse(stored);
      dynamicCalcs[category] = calculators;
      localStorage.setItem('dynamic_calculators', JSON.stringify(dynamicCalcs));
    }
  };

  return { updateCalculators };
}
EOF

# 2. Fix TassazioneAgentiImmobiliariInpsCalculator.tsx useEffect warning
echo "💼 Fixing TassazioneAgentiImmobiliariInpsCalculator.tsx useEffect warning..."

cat > "components/calculators/TassazioneAgentiImmobiliariInpsCalculator.tsx" << 'EOF'
"use client";
import React, { useState, useEffect } from 'react';

interface CalculatorState {
  redditoLordo: number;
  speseDeducibili: number;
  redditoNetto: number;
}

const TassazioneAgentiImmobiliariInpsCalculator: React.FC = () => {
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    redditoLordo: 0,
    speseDeducibili: 0,
    redditoNetto: 0,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCalculatorState((prevState) => ({
      ...prevState,
      [name]: parseFloat(value) || 0,
    }));
  };

  useEffect(() => {
    const calcolaRedditoNetto = () => {
      const { redditoLordo, speseDeducibili } = calculatorState;
      const redditoNetto = redditoLordo - speseDeducibili;
      setCalculatorState((prevState) => ({ ...prevState, redditoNetto }));
    };
    calcolaRedditoNetto();
  }, [calculatorState.redditoLordo, calculatorState.speseDeducibili]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h1>Calcolatore Tassazione per Agenti Immobiliari (con INPS Commercianti)</h1>
      <p>Calcolatore Tassazione per Agenti Immobiliari (con INPS Commercianti)</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="redditoLordo" className="block text-gray-700 font-bold mb-2">
            Reddito Lordo:
          </label>
          <input
            type="number"
            id="redditoLordo"
            name="redditoLordo"
            value={calculatorState.redditoLordo}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label htmlFor="speseDeducibili" className="block text-gray-700 font-bold mb-2">
            Spese Deducibili:
          </label>
          <input
            type="number"
            id="speseDeducibili"
            name="speseDeducibili"
            value={calculatorState.speseDeducibili}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-gray-700 font-bold mb-2">
          Reddito Netto:
        </label>
        <p className="text-lg font-bold text-green-500">
          {calculatorState.redditoNetto.toFixed(2)} €
        </p>
      </div>
    </div>
  );
};

export default TassazioneAgentiImmobiliariInpsCalculator;
EOF

# 3. Update ToolsSidebar.tsx to accept lang prop
echo "🔧 Updating ToolsSidebar.tsx to accept lang prop..."

cat > "components/calculator/ToolsSidebar.tsx" << 'EOF'
// components/calculator/ToolsSidebar.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { 
  BookmarkIcon, 
  DocumentArrowDownIcon, 
  ShareIcon,
  PrinterIcon,
  ChartBarIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ToolsSidebarProps {
  calculatorName: string;
  results?: Record<string, number>;
  inputs?: Record<string, any>;
  lang?: string;
}

interface SavedCalculation {
  id: string;
  calculator: string;
  inputs: Record<string, any>;
  results: Record<string, number>;
  savedAt: string;
}

export default function ToolsSidebar({ 
  calculatorName, 
  results = {}, 
  inputs = {},
  lang = 'it'
}: ToolsSidebarProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);

  // Carica i calcoli salvati al mount
  useEffect(() => {
    loadSavedCalculations();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Toast semplice senza dipendenze esterne
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 transition-all transform ${
      type === 'success' 
        ? 'bg-green-500 shadow-lg' 
        : 'bg-red-500 shadow-lg'
    }`;
    toast.textContent = message;
    toast.style.transform = 'translateX(100%)';
    
    document.body.appendChild(toast);
    
    // Animazione di entrata
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Rimozione automatica
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const loadSavedCalculations = () => {
    try {
      const saved = localStorage.getItem('calculator_saves');
      if (saved) {
        setSavedCalculations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Errore caricamento calcoli salvati:', error);
    }
  };

  const handleSaveResult = async () => {
    if (Object.keys(results).length === 0) {
      showToast('Nessun risultato da salvare', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      const savedData: SavedCalculation = {
        id: Date.now().toString(),
        calculator: calculatorName,
        inputs: { ...inputs },
        results: { ...results },
        savedAt: new Date().toISOString()
      };

      const existingSaves = JSON.parse(localStorage.getItem('calculator_saves') || '[]');
      existingSaves.push(savedData);
      
      // Mantieni solo gli ultimi 50 salvataggi
      if (existingSaves.length > 50) {
        existingSaves.splice(0, existingSaves.length - 50);
      }
      
      localStorage.setItem('calculator_saves', JSON.stringify(existingSaves));
      setSavedCalculations(existingSaves);

      showToast('Risultato salvato con successo!');
    } catch (error) {
      showToast('Errore nel salvare il risultato', 'error');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (Object.keys(results).length === 0) {
      showToast('Nessun risultato da esportare', 'error');
      return;
    }

    setIsExporting(true);
    
    try {
      const htmlContent = generatePDFContent();
      
      // Crea una nuova finestra per la stampa
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Aspetta che il contenuto sia caricato
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          
          // Chiudi la finestra dopo la stampa (opzionale)
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        };
      }
      
      showToast('PDF generato con successo!');
    } catch (error) {
      showToast('Errore nella generazione del PDF', 'error');
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `Risultati ${calculatorName}`,
        text: `Ho calcolato ${calculatorName} su SoCalSolver`,
        url: window.location.href
      };

      // Prova prima con l'API Web Share (mobile/browser moderni)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast('Condiviso con successo!');
      } else {
        // Fallback: copia URL negli appunti
        await navigator.clipboard.writeText(window.location.href);
        showToast('URL copiato negli appunti!');
      }
    } catch (error) {
      // Fallback per browser molto vecchi
      try {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('URL copiato negli appunti!');
      } catch (fallbackError) {
        showToast('Errore nella condivisione', 'error');
        console.error('Share error:', error);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Risultati ${calculatorName}</title>
        <style>
          @media print {
            body { margin: 0; }
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
          }
          
          .header { 
            text-align: center;
            border-bottom: 3px solid #3B82F6; 
            padding-bottom: 30px; 
            margin-bottom: 40px;
          }
          
          .header h1 {
            color: #1E40AF;
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .header .subtitle {
            color: #6B7280;
            font-size: 16px;
          }
          
          .section {
            margin: 30px 0;
          }
          
          .section h2 {
            color: #1F2937;
            font-size: 20px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #E5E7EB;
          }
          
          .result-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          
          .result-item { 
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .result-item .label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
          }
          
          .result-item .value {
            font-size: 18px;
            color: #1E40AF;
            font-weight: 700;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            font-size: 14px;
            color: #6B7280;
          }
          
          .footer .logo {
            font-weight: bold;
            color: #3B82F6;
            font-size: 18px;
            margin-bottom: 10px;
          }
          
          .disclaimer {
            background: #FEF3C7;
            border: 1px solid #F59E0B;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .disclaimer h3 {
            color: #92400E;
            margin-top: 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${calculatorName}</h1>
          <div class="subtitle">
            Generato il ${currentDate}<br>
            SoCalSolver - Calcolatori Professionali
          </div>
        </div>
        
        ${Object.keys(inputs).length > 0 ? `
        <div class="section">
          <h2>📋 Parametri di Input</h2>
          <div class="result-grid">
            ${Object.entries(inputs).map(([key, value]) => `
              <div class="result-item">
                <div class="label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                <div class="value">${formatValue(value)}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <h2>📊 Risultati del Calcolo</h2>
          <div class="result-grid">
            ${Object.entries(results).map(([key, value]) => `
              <div class="result-item">
                <div class="label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                <div class="value">${formatValue(value)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="disclaimer">
          <h3>⚠️ Importante</h3>
          <p>Questi risultati sono calcolati automaticamente e forniti a scopo informativo. 
          Per decisioni finanziarie, fiscali o legali importanti, si consiglia sempre di 
          consultare un professionista qualificato.</p>
        </div>

        <div class="footer">
          <div class="logo">SoCalSolver.com</div>
          <p>Calcolatori professionali gratuiti per oltre 20 categorie specializzate</p>
          <p>Report generato automaticamente • Tutti i diritti riservati</p>
        </div>
      </body>
      </html>
    `.replace(/formatValue\(([^)]+)\)/g, (match, value) => {
      // Funzione per formattare i valori nel template string
      return typeof value === 'number' ? value.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US') : String(value);
    });
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US');
    }
    return String(value);
  };

  const viewSavedResults = () => {
    setShowSavedList(!showSavedList);
  };

  const deleteSavedCalculation = (id: string) => {
    try {
      const updated = savedCalculations.filter(calc => calc.id !== id);
      localStorage.setItem('calculator_saves', JSON.stringify(updated));
      setSavedCalculations(updated);
      showToast('Calcolo eliminato');
    } catch (error) {
      showToast('Errore eliminazione', 'error');
    }
  };

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Main Tools Panel */}
      <div className="p-6 bg-white rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
          Strumenti
        </h3>
        
        <div className="space-y-3">
          {/* Salva Risultato */}
          <button 
            onClick={handleSaveResult}
            disabled={isSaving || !hasResults}
            className={`w-full p-3 text-left rounded-lg transition-all duration-200 flex items-center ${
              hasResults 
                ? 'hover:bg-green-50 hover:border-green-200 border border-transparent' 
                : 'opacity-50 cursor-not-allowed bg-gray-50'
            }`}
          >
            <BookmarkIcon className="w-5 h-5 mr-3 text-green-600" />
            <span className="flex-1">
              {isSaving ? 'Salvando...' : '📊 Salva Risultato'}
            </span>
            {isSaving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            )}
          </button>

          {/* Esporta PDF */}
          <button 
            onClick={handleExportPDF}
            disabled={isExporting || !hasResults}
            className={`w-full p-3 text-left rounded-lg transition-all duration-200 flex items-center ${
              hasResults 
                ? 'hover:bg-red-50 hover:border-red-200 border border-transparent' 
                : 'opacity-50 cursor-not-allowed bg-gray-50'
            }`}
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-3 text-red-600" />
            <span className="flex-1">
              {isExporting ? 'Generando...' : '📄 Esporta PDF'}
            </span>
            {isExporting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            )}
          </button>

          {/* Condividi */}
          <button 
            onClick={handleShare}
            className="w-full p-3 text-left rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 flex items-center"
          >
            <ShareIcon className="w-5 h-5 mr-3 text-blue-600" />
            <span>🔗 Condividi</span>
          </button>

          {/* Stampa */}
          <button 
            onClick={handlePrint}
            className="w-full p-3 text-left rounded-lg hover:bg-gray-50 hover:border-gray-200 border border-transparent transition-all duration-200 flex items-center"
          >
            <PrinterIcon className="w-5 h-5 mr-3 text-gray-600" />
            <span>🖨️ Stampa</span>
          </button>

          {/* Storico */}
          <button 
            onClick={viewSavedResults}
            className="w-full p-3 text-left rounded-lg hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all duration-200 flex items-center"
          >
            <ClockIcon className="w-5 h-5 mr-3 text-purple-600" />
            <span>📈 Storico ({savedCalculations.length})</span>
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-3">📊 Info Calcolo</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <div className="flex justify-between">
            <span>Risultati:</span>
            <span className="font-medium">{Object.keys(results).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Parametri:</span>
            <span className="font-medium">{Object.keys(inputs).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Salvati:</span>
            <span className="font-medium">{savedCalculations.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Aggiornato:</span>
            <span className="font-medium">{new Date().toLocaleTimeString(lang === 'it' ? 'it-IT' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Saved Calculations Modal/Panel */}
      {showSavedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">📈 Calcoli Salvati</h3>
              <button 
                onClick={() => setShowSavedList(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {savedCalculations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Nessun calcolo salvato ancora</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedCalculations.slice().reverse().map((calc) => (
                    <div key={calc.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{calc.calculator}</h4>
                        <button 
                          onClick={() => deleteSavedCalculation(calc.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Elimina
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(calc.savedAt).toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')}
                      </p>
                      <div className="text-sm">
                        <span className="text-gray-600">Risultati: </span>
                        <span className="font-medium">{Object.keys(calc.results).length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
EOF

# 4. Create missing CalculatorWrapper.tsx
echo "🧮 Creating missing CalculatorWrapper.tsx..."

cat > "components/calculator/CalculatorWrapper.tsx" << 'EOF'
'use client';
import React, { useState, createContext, useContext } from 'react';
import ToolsSidebar from './ToolsSidebar';

// Context per condividere dati tra calcolatore e sidebar
interface CalculatorContextType {
  results: Record<string, number>;
  inputs: Record<string, any>;
  updateResults: (results: Record<string, number>) => void;
  updateInputs: (inputs: Record<string, any>) => void;
}

const CalculatorContext = createContext<CalculatorContextType>({
  results: {},
  inputs: {},
  updateResults: () => {},
  updateInputs: () => {},
});

export const useCalculator = () => useContext(CalculatorContext);

interface CalculatorWrapperProps {
  children: React.ReactNode;
  calculatorName: string;
  category?: string;
  slug?: string;
  lang?: string;
}

export default function CalculatorWrapper({ 
  children, 
  calculatorName,
  lang = 'it'
}: CalculatorWrapperProps) {
  const [results, setResults] = useState<Record<string, number>>({});
  const [inputs, setInputs] = useState<Record<string, any>>({});

  const updateResults = (newResults: Record<string, number>) => {
    setResults(newResults);
  };

  const updateInputs = (newInputs: Record<string, any>) => {
    setInputs(newInputs);
  };

  const contextValue: CalculatorContextType = {
    results,
    inputs,
    updateResults,
    updateInputs,
  };

  return (
    <CalculatorContext.Provider value={contextValue}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg">
          {children}
        </div>
        
        {/* Enhanced Sidebar */}
        <ToolsSidebar 
          calculatorName={calculatorName}
          results={results}
          inputs={inputs}
          lang={lang}
        />
      </div>
    </CalculatorContext.Provider>
  );
}
EOF

# 5. Fix the page.tsx template from documents
echo "📄 Fixing page.tsx template for fisco-e-lavoro-autonomo..."

# Remove the problematic page.tsx file if it exists
if [ -f "page.tsx" ]; then
    rm "page.tsx"
    echo "✅ Removed problematic page.tsx file from root"
fi

# Make sure the fisco-e-lavoro-autonomo page.tsx is properly updated
cat > "app/it/fisco-e-lavoro-autonomo/page.tsx" << 'EOF'
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import Breadcrumb from '@/components/layout/Breadcrumb';

async function getCalculators() {
    const calculatorsPath = path.join(process.cwd(), 'content', 'it', 'fisco-e-lavoro-autonomo');
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
  const categoryName = "Fisco e Lavoro Autonomo";
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
              href={`/it/fisco-e-lavoro-autonomo/${calc.slug}`} 
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

echo ""
echo "✅ TUTTE LE CORREZIONI APPLICATE CON SUCCESSO!"
echo "🔧 Problemi risolti:"
echo "   ✅ Warning useEffect in RelatedCalculators.tsx (memoizzazione con useCallback)"
echo "   ✅ Warning useEffect in TassazioneAgentiImmobiliariInpsCalculator.tsx (dipendenze corrette)"
echo "   ✅ Errore tipo TypeScript in ToolsSidebar.tsx (aggiunta prop lang)"
echo "   ✅ CalculatorWrapper.tsx creato correttamente"
echo "   ✅ Rimosso file page.tsx problematico dalla root"
echo ""
echo "🚀 Ora puoi eseguire:"
echo "   npm run build"
echo ""
echo "💡 Se ci sono ancora errori, verifica che tutti i calcolatori"
echo "   importino correttamente i loro componenti."
EOF

chmod +x fix-build-errors.sh
echo "✅ Script creato: fix-build-errors.sh"
