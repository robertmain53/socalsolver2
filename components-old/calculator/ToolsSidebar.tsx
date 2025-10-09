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
