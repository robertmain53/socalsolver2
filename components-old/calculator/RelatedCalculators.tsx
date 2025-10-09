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
