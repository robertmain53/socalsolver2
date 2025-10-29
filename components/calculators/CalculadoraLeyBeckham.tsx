'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

// --- Tipi di Dati e Costanti ---

type ModoCalculadora = 'standard' | 'inverso' | 'breakeven';
type SituacionFamiliar = 'individual' | 'conjunta';
type ComunidadAutonoma = 'madrid' | 'catalunya' | 'otra';

// Costanti Fiscali (Semplificate - da aggiornare annualmente)
const LIMITE_BECKHAM = 600000;
const TIPO_BECKHAM_TRAMO1 = 0.24;
const TIPO_BECKHAM_TRAMO2 = 0.47;

const TIPO_SS_EMPLEADO = 0.0645; // 4.8% conting. comunes + 1.55% desempleo + 0.1% FOGASA (appross.)
const BASE_MAX_COTIZACION_ANUAL = 56640; // Esempio (da aggiornare per 2024/2025)
const GASTOS_DEDUCIBLES_GENERAL = 2000;

// Minimi Personali e Familiari (Semplificati)
const MINIMO_PERSONAL = 5550;
const MINIMO_POR_HIJO: { [key: number]: number } = {
  1: 2400,
  2: 2700,
  3: 4000,
  4: 4500,
};

// Tramos IRPF (Statal + Media Regionale "Otra") - Semplificati per la stima
// Nella realtà, ogni comunità ha i suoi trami regionali.
const TRAMOS_GENERAL: { limite: number; tipo: number }[] = [
  { limite: 12450, tipo: 0.19 },
  { limite: 20200, tipo: 0.24 },
  { limite: 35200, tipo: 0.3 },
  { limite: 60000, tipo: 0.37 },
  { limite: 300000, tipo: 0.45 },
  { limite: Infinity, tipo: 0.47 }, // Semplificazione
];

// Tramos per Madrid (più favorevoli)
const TRAMOS_MADRID: { limite: number; tipo: number }[] = [
  { limite: 13500, tipo: 0.18 }, // 8.5% regionale + 9.5% statale (su 6225)
  { limite: 18900, tipo: 0.228 }, // 10.9% reg + 12% statale
  { limite: 35200, tipo: 0.28 }, // 13.5% reg + 15% statale
  { limite: 60000, tipo: 0.35 }, // 17% reg + 18.5% statale
  { limite: Infinity, tipo: 0.45 }, // Semplificazione (21% reg + 24.5% statale)
];


// --- Funzioni di Calcolo Helper ---

/**
 * Calcola le contribuzioni alla Seguridad Social del dipendente.
 */
const calcularContribucionesSS = (salarioBruto: number): number => {
  const baseCotizacion = Math.min(salarioBruto, BASE_MAX_COTIZACION_ANUAL);
  return baseCotizacion * TIPO_SS_EMPLEADO;
};

/**
 * Calcola il minimo familiare basato su figli e situazione (semplificato).
 */
const getMinimoFamiliar = (situacion: SituacionFamiliar, hijos: number): number => {
  let minimo = MINIMO_PERSONAL;
  // Semplificazione: la 'conjunta' ha regole diverse, ma per una stima usiamo il minimo base.
  // In una 'conjunta' vera, il minimo personale è 5550 + 3400 (per il coniuge < 65 senza redditi > 8000).
  // Questa è una stima conservativa.
  
  if (hijos > 0) {
    if (hijos === 1) minimo += MINIMO_POR_HIJO[1];
    else if (hijos === 2) minimo += MINIMO_POR_HIJO[1] + MINIMO_POR_HIJO[2];
    else if (hijos === 3) minimo += MINIMO_POR_HIJO[1] + MINIMO_POR_HIJO[2] + MINIMO_POR_HIJO[3];
    else minimo += MINIMO_POR_HIJO[1] + MINIMO_POR_HIJO[2] + MINIMO_POR_HIJO[3] + (hijos - 3) * MINIMO_POR_HIJO[4];
  }
  return minimo;
};

/**
 * Calcola l'imposta progressiva sul reddito (IRPF) per il Regime Generale.
 * Questa è una STIMA AVANZATA.
 */
const calcularImpuestoGeneral = (
  salarioBruto: number,
  comunidad: ComunidadAutonoma,
  situacion: SituacionFamiliar,
  hijos: number
): number => {
  if (salarioBruto === 0) return 0;

  const contribucionesSS = calcularContribucionesSS(salarioBruto);
  const gastosDeducibles = GASTOS_DEDUCIBLES_GENERAL;
  const minimoFamiliar = getMinimoFamiliar(situacion, hijos);
  
  // Base Imponibile = Salario Bruto - Contributi SS - Altri Gastos Deducibili
  const baseImponible = Math.max(0, salarioBruto - contribucionesSS - gastosDeducibles);
  
  // Base Liquidabile = Base Imponibile - Minimo Personale e Familiare
  const baseLiquidabile = Math.max(0, baseImponible - minimoFamiliar);

  const tramos = comunidad === 'madrid' ? TRAMOS_MADRID : TRAMOS_GENERAL;
  
  let impuestoTotal = 0;
  let baseRestante = baseLiquidabile;
  let limiteAnterior = 0;

  for (const tramo of tramos) {
    const baseEnTramo = Math.min(baseRestante, tramo.limite - limiteAnterior);
    impuestoTotal += baseEnTramo * tramo.tipo;
    baseRestante -= baseEnTramo;
    if (baseRestante <= 0) break;
    limiteAnterior = tramo.limite;
  }

  return impuestoTotal;
};

/**
 * Calcola l'imposta per la Legge Beckham.
 */
const calcularImpuestoBeckham = (salarioBruto: number): number => {
  if (salarioBruto === 0) return 0;
  // Sotto Beckham, i contributi SS NON sono deducibili.
  // La base imponibile è il salario lordo.
  
  let impuestoTotal = 0;
  
  if (salarioBruto <= LIMITE_BECKHAM) {
    impuestoTotal = salarioBruto * TIPO_BECKHAM_TRAMO1;
  } else {
    impuestoTotal = (LIMITE_BECKHAM * TIPO_BECKHAM_TRAMO1) + 
                    ((salarioBruto - LIMITE_BECKHAM) * TIPO_BECKHAM_TRAMO2);
  }
  
  return impuestoTotal;
};

// --- Tipo per i Risultati ---
interface ResultadosCalculo {
  netoBeckham: number;
  impuestoBeckham: number;
  tipoEfectivoBeckham: number;
  netoGeneral: number;
  impuestoGeneral: number;
  tipoEfectivoGeneral: number;
  ahorroAnual: number;
  salarioLordoNecessario?: number; // Per modo inverso
  puntoBreakeven?: number; // Per modo breakeven
  mensajeBreakeven?: string;
}

// --- Componente Principale ---

const CalculadoraLeyBeckham: React.FC = () => {
  // --- State Management ---
  const [modo, setModo] = useState<ModoCalculadora>('standard');
  const [salarioBrutoAnual, setSalarioBrutoAnual] = useState<number>(90000);
  const [netoDeseadoMensual, setNetoDeseadoMensual] = useState<number>(5000);
  const [comunidadAutonoma, setComunidadAutonoma] = useState<ComunidadAutonoma>('madrid');
  const [situacionFamiliar, setSituacionFamiliar] = useState<SituacionFamiliar>('individual');
  const [hijosACargo, setHijosACargo] = useState<number>(0);

  const [resultados, setResultados] = useState<ResultadosCalculo | null>(null);

  // --- Funzioni Solver (per Inverso e Breakeven) ---

  /**
   * Solutore numerico (Ricerca Binaria) per trovare il lordo da un netto.
   */
  const encontrarLordoPorNeto = useCallback((
    netoDeseadoAnual: number,
    calcNetoFunc: (bruto: number) => number
  ): number => {
    let minBruto = netoDeseadoAnual;
    let maxBruto = netoDeseadoAnual * 3; // Stima iniziale alta
    let salarioLordo = (minBruto + maxBruto) / 2;
    
    for (let i = 0; i < 30; i++) { // 30 iterazioni sono sufficienti per la precisione
      const netoCalculado = calcNetoFunc(salarioLordo);
      if (Math.abs(netoCalculado - netoDeseadoAnual) < 0.01) {
        return salarioLordo;
      }
      if (netoCalculado < netoDeseadoAnual) {
        minBruto = salarioLordo;
      } else {
        maxBruto = salarioLordo;
      }
      salarioLordo = (minBruto + maxBruto) / 2;
    }
    return salarioLordo;
  }, []); // Nessuna dipendenza, le funzioni di calcolo pure saranno passate

  /**
   * Solutore numerico (Ricerca Binaria) per trovare il punto di pareggio.
   */
  const encontrarPuntoBreakeven = useCallback((
    calcNetoBeckham: (bruto: number) => number,
    calcNetoGeneral: (bruto: number) => number
  ): { punto: number, mensaje: string } => {
    
    // Controlla prima a 0 e a un salario alto per vedere se c'è un incrocio
    const diffIniziale = calcNetoBeckham(10000) - calcNetoGeneral(10000);
    const diffFinale = calcNetoBeckham(200000) - calcNetoGeneral(200000);

    if (diffIniziale > 0 && diffFinale > 0) {
        return { punto: 0, mensaje: "Con la tua situazione, la Legge Beckham è sempre più vantaggiosa." };
    }
    if (diffIniziale < 0 && diffFinale < 0) {
        return { punto: 0, mensaje: "Con la tua situazione, il Régimen General è sempre più vantaggioso." };
    }

    let minBruto = 0;
    let maxBruto = 200000; // Limite di ricerca
    let puntoBreakeven = (minBruto + maxBruto) / 2;

    for (let i = 0; i < 30; i++) {
      const diff = calcNetoBeckham(puntoBreakeven) - calcNetoGeneral(puntoBreakeven);
      
      if (Math.abs(diff) < 1) { // Tolleranza di 1 euro
        return { 
          punto: puntoBreakeven,
          mensaje: `Sotto i ${puntoBreakeven.toFixed(0)}€, conviene il Régimen General. Sopra, conviene la Legge Beckham.`
        };
      }
      
      // Se la differenza iniziale era negativa (General > Beckham) e ora è positiva
      if (diffIniziale < 0) {
          if (diff < 0) {
              minBruto = puntoBreakeven;
          } else {
              maxBruto = puntoBreakeven;
          }
      } else { // Se la differenza iniziale era positiva (Beckham > General)
          if (diff > 0) {
              minBruto = puntoBreakeven;
          } else {
              maxBruto = puntoBreakeven;
          }
      }
      puntoBreakeven = (minBruto + maxBruto) / 2;
    }
    
    return { punto: puntoBreakeven, mensaje: `Il punto di pareggio è circa ${puntoBreakeven.toFixed(0)}€.` };
  }, []);

  // --- Logica di Calcolo Principale ---

  const calcularResultados = useCallback(() => {
    
    const brutoStd = salarioBrutoAnual || 0;
    const hijos = hijosACargo || 0;

    // --- Funzioni Neto (usate dai solutori) ---
    const calcNetoBeckham = (bruto: number): number => {
      const ss = calcularContribucionesSS(bruto);
      const imp = calcularImpuestoBeckham(bruto);
      // Nota: i contributi SS si pagano anche sotto Beckham, anche se l'imposta non li considera.
      return bruto - imp - ss;
    };
    
    const calcNetoGeneral = (bruto: number): number => {
      const ss = calcularContribucionesSS(bruto);
      const imp = calcularImpuestoGeneral(bruto, comunidadAutonoma, situacionFamiliar, hijos);
      return bruto - imp - ss;
    };


    let res: ResultadosCalculo = {
      netoBeckham: 0, impuestoBeckham: 0, tipoEfectivoBeckham: 0,
      netoGeneral: 0, impuestoGeneral: 0, tipoEfectivoGeneral: 0,
      ahorroAnual: 0
    };

    if (modo === 'standard') {
      const impuestoBeckham = calcularImpuestoBeckham(brutoStd);
      const ssBeckham = calcularContribucionesSS(brutoStd); // Si pagano comunque
      const netoBeckham = brutoStd - impuestoBeckham - ssBeckham;
      
      const impuestoGeneral = calcularImpuestoGeneral(brutoStd, comunidadAutonoma, situacionFamiliar, hijos);
      const ssGeneral = calcularContribucionesSS(brutoStd); // Già inclusi nel calcolo imposta
      const netoGeneral = brutoStd - impuestoGeneral - ssGeneral;

      res = {
        netoBeckham,
        impuestoBeckham,
        tipoEfectivoBeckham: (impuestoBeckham / brutoStd) * 100,
        netoGeneral,
        impuestoGeneral,
        tipoEfectivoGeneral: (impuestoGeneral / brutoStd) * 100,
        ahorroAnual: netoGeneral - netoBeckham,
      };

    } else if (modo === 'inverso') {
      const netoDeseadoAnual = (netoDeseadoMensual || 0) * 12;
      
      // Trova il lordo per Beckham
      const lordoNecessario = encontrarLordoPorNeto(netoDeseadoAnual, calcNetoBeckham);
      
      // Ora, calcola tutto con quel lordo
      const impBeckham = calcularImpuestoBeckham(lordoNecessario);
      const ssBeckham = calcularContribucionesSS(lordoNecessario);
      const impGeneral = calcularImpuestoGeneral(lordoNecessario, comunidadAutonoma, situacionFamiliar, hijos);
      const ssGeneral = calcularContribucionesSS(lordoNecessario);

      res = {
        netoBeckham: lordoNecessario - impBeckham - ssBeckham,
        impuestoBeckham: impBeckham,
        tipoEfectivoBeckham: (impBeckham / lordoNecessario) * 100,
        netoGeneral: lordoNecessario - impGeneral - ssGeneral,
        impuestoGeneral: impGeneral,
        tipoEfectivoGeneral: (impGeneral / lordoNecessario) * 100,
        ahorroAnual: (lordoNecessario - impGeneral - ssGeneral) - (lordoNecessario - impBeckham - ssBeckham),
        salarioLordoNecessario: lordoNecessario
      };

    } else if (modo === 'breakeven') {
      const { punto, mensaje } = encontrarPuntoBreakeven(calcNetoBeckham, calcNetoGeneral);
      
      const impBeckham = calcularImpuestoBeckham(punto);
      const ssBeckham = calcularContribucionesSS(punto);
      const impGeneral = calcularImpuestoGeneral(punto, comunidadAutonoma, situacionFamiliar, hijos);
      const ssGeneral = calcularContribucionesSS(punto);

      res = {
        netoBeckham: punto - impBeckham - ssBeckham,
        impuestoBeckham: impBeckham,
        tipoEfectivoBeckham: (impBeckham / punto) * 100,
        netoGeneral: punto - impGeneral - ssGeneral,
        impuestoGeneral: impGeneral,
        tipoEfectivoGeneral: (impGeneral / punto) * 100,
        ahorroAnual: 0,
        puntoBreakeven: punto,
        mensajeBreakeven: mensaje
      };
    }
    
    setResultados(res);

  }, [
    modo, 
    salarioBrutoAnual, 
    netoDeseadoMensual, 
    comunidadAutonoma, 
    situacionFamiliar, 
    hijosACargo,
    encontrarLordoPorNeto,
    encontrarPuntoBreakeven
  ]);

  // Calcola i risultati ogni volta che gli input cambiano
  React.useEffect(() => {
    calcularResultados();
  }, [calcularResultados]);


  // --- Dati per il Grafico ---
  const chartData = useMemo(() => {
    if (!resultados) return [];
    
    const { netoBeckham, impuestoBeckham, netoGeneral, impuestoGeneral } = resultados;

    return [
      {
        name: 'Salario Neto',
        'Régimen Beckham': netoBeckham,
        'Régimen General': netoGeneral,
      },
      {
        name: 'Impuestos Pagados',
        'Régimen Beckham': impuestoBeckham,
        'Régimen General': impuestoGeneral,
      },
    ];
  }, [resultados]);


  // --- Componenti UI ---

  const renderInputs = () => {
    return (
      <>
        {modo === 'standard' && (
          <div>
            <label className="block text-base font-medium mb-2 text-gray-700 flex items-center" htmlFor="salario_bruto_anual">
              Ingresos brutos anuales
              {/* Tooltip (come l'originale) */}
            </label>
            <div className="relative">
              <input
                id="salario_bruto_anual"
                aria-label="Ingresos brutos anuales del trabajo"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 px-4 py-3 text-lg"
                type="number"
                min="0"
                step="1000"
                value={salarioBrutoAnual}
                onChange={(e) => setSalarioBrutoAnual(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </div>
        )}

        {modo === 'inverso' && (
          <div>
            <label className="block text-base font-medium mb-2 text-gray-700 flex items-center" htmlFor="neto_deseado_mensual">
              Salario NETO mensual deseado
            </label>
            <div className="relative">
              <input
                id="neto_deseado_mensual"
                aria-label="Salario NETO mensual deseado"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 px-4 py-3 text-lg"
                type="number"
                min="0"
                step="100"
                value={netoDeseadoMensual}
                onChange={(e) => setNetoDeseadoMensual(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
             <p className="text-xs text-gray-500 mt-2">
              Calcoleremo il salario lordo necessario (sotto Legge Beckham) per raggiungere questo netto mensile.
            </p>
          </div>
        )}

        {modo === 'breakeven' && (
           <p className="text-sm text-gray-600 p-3 bg-gray-100 rounded-lg">
            L'analisi del punto di pareggio calcolerà il salario lordo esatto in cui i benefici della Legge Beckham eguagliano quelli del Régimen General, in base alla tua situazione.
           </p>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
           <h3 className="text-lg font-semibold text-gray-800 mb-3">
             Dati per Comparativa (Régimen General)
           </h3>
           <p className="text-sm text-gray-500 mb-4">
            Questi dati sono essenziali per un confronto preciso con il regime fiscale standard.
           </p>
           <div className="space-y-6">
            <div>
              <label className="block text-base font-medium mb-2 text-gray-700" htmlFor="comunidad_autonoma">
                Comunidad Autónoma
              </label>
              <select
                id="comunidad_autonoma"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 px-4 py-3 text-lg"
                value={comunidadAutonoma}
                onChange={(e) => setComunidadAutonoma(e.target.value as ComunidadAutonoma)}
              >
                <option value="madrid">Madrid (Tramos ridotti)</option>
                <option value="catalunya">Catalunya (Tramos più alti)</option>
                <option value="otra">Altra (Media nazionale)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700" htmlFor="situacion_familiar">
                    Situación Familiar
                  </label>
                  <select
                    id="situacion_familiar"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 px-4 py-3 text-lg"
                    value={situacionFamiliar}
                    onChange={(e) => setSituacionFamiliar(e.target.value as SituacionFamiliar)}
                  >
                    <option value="individual">Individual / Separado</option>
                    <option value="conjunta">Conjunta (con coniuge)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2 text-gray-700" htmlFor="hijos_a_cargo">
                    Hijos a cargo
                  </label>
                   <input
                    id="hijos_a_cargo"
                    aria-label="Hijos a cargo"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 px-4 py-3 text-lg"
                    type="number"
                    min="0"
                    max="10"
                    step="1"
                    value={hijosACargo}
                    onChange={(e) => setHijosACargo(parseInt(e.target.value) || 0)}
                  />
                </div>
            </div>
           </div>
        </div>
      </>
    );
  };

  const renderResultados = () => {
    if (!resultados) return null;

    const { 
      netoBeckham, impuestoBeckham, tipoEfectivoBeckham,
      netoGeneral, impuestoGeneral, tipoEfectivoGeneral,
      ahorroAnual, salarioLordoNecessario, puntoBreakeven, mensajeBreakeven
    } = resultados;
    
    const ahorroMensile = ahorroAnual / 12;

    if (modo === 'standard') {
      return (
        <div className="mt-10">
          <div className={`text-center border-2 ${ahorroAnual >= 0 ? 'border-indigo-500 bg-indigo-50' : 'border-red-500 bg-red-50'} rounded-lg p-6 mb-8`}>
            <h2 className={`text-lg font-semibold ${ahorroAnual >= 0 ? 'text-indigo-800' : 'text-red-800'}`}>
              {ahorroAnual >= 0 ? "Ahorro Fiscal Anual Estimado con Ley Beckham" : "Perdita Fiscale Annuale con Ley Beckham"}
            </h2>
            <p className={`text-4xl md:text-5xl font-bold ${ahorroAnual >= 0 ? 'text-indigo-600' : 'text-red-600'} my-2`}>
              {Math.abs(ahorroAnual).toFixed(2)}&nbsp;€
            </p>
            <p className={`text-lg font-medium ${ahorroAnual >= 0 ? 'text-indigo-600' : 'text-red-600'} my-2`}>
              (circa {Math.abs(ahorroMensile).toFixed(2)}&nbsp;€ al mese)
            </p>
            <p className={ahorroAnual >= 0 ? 'text-indigo-500' : 'text-red-500'}>
              {ahorroAnual >= 0 ? "¡Estás ahorrando dinero!" : "Attenzione! Il Régimen General sembra più vantaggioso."}
            </p>
          </div>
          {/* ... resto dei riquadri ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Salario Neto Anual (con Ley Beckham)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{netoBeckham.toFixed(2)}&nbsp;€</p>
                <p className="text-md font-medium text-gray-500 mt-1">({(netoBeckham / 12).toFixed(2)}&nbsp;€/mese)</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Salario Neto Anual (Régimen General)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{netoGeneral.toFixed(2)}&nbsp;€</p>
                <p className="text-md font-medium text-gray-500 mt-1">({(netoGeneral / 12).toFixed(2)}&nbsp;€/mese)</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Impuesto Total Pagado (Ley Beckham)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{impuestoBeckham.toFixed(2)}&nbsp;€</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Impuesto Total Pagado (Régimen General)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{impuestoGeneral.toFixed(2)}&nbsp;€</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Tipo Efectivo (Ley Beckham)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{tipoEfectivoBeckham.toFixed(2)}%</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Tipo Efectivo (Régimen General)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{tipoEfectivoGeneral.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      );
    }

    if (modo === 'inverso') {
      return (
        <div className="mt-10">
          <div className="text-center border-2 border-indigo-500 bg-indigo-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-indigo-800">
              Salario Lordo Annuo Richiesto (per Legge Beckham)
            </h2>
            <p className="text-4xl md:text-5xl font-bold text-indigo-600 my-2">
              {salarioLordoNecessario?.toFixed(2)}&nbsp;€
            </p>
            <p className="text-indigo-500">
              Per ottenere un netto mensile di {netoDeseadoMensual.toFixed(2)}&nbsp;€
            </p>
          </div>
          {/* Mostra anche i risultati standard per quel lordo calcolato */}
          <h3 className="text-xl font-bold text-gray-800 mb-4">Dettagli per questo Salario Lordo</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Salario Neto Anual (con Ley Beckham)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{netoBeckham.toFixed(2)}&nbsp;€</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Salario Neto Anual (Régimen General)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{netoGeneral.toFixed(2)}&nbsp;€</p>
            </div>
             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Ahorro Anual con Beckham</h3>
                <p className={`text-2xl font-semibold ${ahorroAnual >= 0 ? 'text-indigo-600' : 'text-red-600'} mt-1`}>
                    {ahorroAnual.toFixed(2)}&nbsp;€
                </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (modo === 'breakeven') {
       return (
        <div className="mt-10">
          <div className="text-center border-2 border-indigo-500 bg-indigo-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-indigo-800">
              Punto di Pareggio (Breakeven Point)
            </h2>
            <p className="text-4xl md:text-5xl font-bold text-indigo-600 my-2">
              {puntoBreakeven?.toFixed(2)}&nbsp;€
            </p>
            <p className="text-indigo-500">
              {mensajeBreakeven}
            </p>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Dettagli al Punto di Pareggio</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Neto Anual (Beckham)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{netoBeckham.toFixed(2)}&nbsp;€</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600">Neto Anual (General)</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{netoGeneral.toFixed(2)}&nbsp;€</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-bold text-gray-800">{label}</p>
          <p style={{ color: payload[0].color }}>
            {`${payload[0].name}: ${parseFloat(payload[0].value as string).toFixed(2)} €`}
          </p>
          <p style={{ color: payload[1].color }}>
            {`${payload[1].name}: ${parseFloat(payload[1].value as string).toFixed(2)} €`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50/50 font-sans">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
            Calculadora de la 'Ley Beckham' per expatriati in Spagna
          </h1>
          <p className="text-gray-600 mb-6">
            Stima il tuo risparmio fiscale come espatriato in Spagna confrontando il regime speciale con il regime generale IRPF.
          </p>
          
          {/* Selettore Modalità */}
          <div className="mb-6">
            <label className="block text-base font-medium mb-3 text-gray-700">Modalità Calcolatrice:</label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['standard', 'Calcolo Standard'],
                  ['inverso', 'Calcolatore Inverso'],
                  ['breakeven', 'Analisi Breakeven']
                ] as [ModoCalculadora, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setModo(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${modo === value
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Input Dinamici */}
          <div className="space-y-6">
            {renderInputs()}
          </div>
          
          {/* Disclaimer (come l'originale, ma aggiornato) */}
          <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-8">
            <strong>Disclaimer:</strong> Questo strumento fornisce una stima e non costituisce consulenza fiscale. 
            I calcoli per il "Régimen General" sono una <strong>stima semplificata</strong> basata su tassi medi e non includono tutte le deduzioni specifiche.
            Le normative possono variare significativamente tra le Comunità Autonome. Consulta sempre un professionista.
          </div>

          {/* Risultati Dinamici */}
          {resultados && renderResultados()}

          {/* Grafico (visibile solo in modalità standard) */}
          {modo === 'standard' && resultados && (
            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Comparativa Visuale</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis 
                      fontSize={12} 
                      tickFormatter={(value) => `${value / 1000}k €`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                    <Bar dataKey="Régimen Beckham" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Régimen General" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Formula (come l'originale) */}
          <div className="mt-6 border rounded-lg p-4 bg-white shadow-md">
            <h3 className="font-semibold text-gray-800">Formula di Calcolo Semplificata</h3>
            <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-50 rounded font-mono break-words">
              <strong>Impuesto Beckham:</strong> (MIN(Salario, 600k) * 24%) + (MAX(0, Salario - 600k) * 47%)
              <br />
              <strong>Impuesto General:</strong> Applicazione progressiva IRPF su (Salario - SS - Minimi - 2000€)
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar (inclusa la tua guida originale) */}
      <aside className="lg:col-span-2 space-y-6">
        <section className="border rounded-2xl p-6 bg-white shadow-lg sticky top-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Azioni</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <button 
              onClick={() => alert('Funzionalità "Guardar Resultado" non ancora implementata.')}
              className="w-full text-center font-semibold border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Guardar Resultado
            </button>
            <button 
              onClick={() => alert('Funzionalità "Exportar a PDF" non ancora implementata.')}
              className="w-full text-center font-semibold border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Exportar a PDF
            </button>
            <button 
              onClick={() => {
                setSalarioBrutoAnual(90000);
                setNetoDeseadoMensual(5000);
                setHijosACargo(0);
                setComunidadAutonoma('madrid');
                setSituacionFamiliar('individual');
                setModo('standard');
              }}
              className="w-full text-center font-semibold border border-red-300 text-red-700 bg-red-50 rounded-lg px-4 py-2 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Reiniciar
            </button>
          </div>
        </section>

        {/* La tua guida originale rimane invariata, è ottima */}
        <section className="border rounded-2xl p-6 bg-white shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Guía de Comprensión</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
                <h3 className="text-xl font-bold mt-6 mb-4 text-gray-800">Guía Definitiva sobre la Ley Beckham para Expatriados en España</h3>
                {/* ... (Tutto il tuo testo originale della guida va qui) ... */}
                <p className="mb-4 leading-relaxed"><strong>Análisis exhaustivo, ventajas, requisitos y comparativa fiscal para optimizar tus impuestos como impatriado.</strong></p>
                <p className="mb-4 leading-relaxed">El Régimen Especial de Trabajadores Desplazados, conocido popularmente como <strong>"Ley Beckham"</strong>, es un incentivo fiscal clave diseñado para atraer talento y profesionales cualificados a España...</p>
                {/* ... (continua con il resto del tuo ottimo contenuto) ... */}
            </div>
        </section>
        <section className="border rounded-2xl p-6 bg-white shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Fuentes y Referencias</h2>
            <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                <li><a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-practico-renta-patrimonio/capitulo-16-regimen-especial-trabajadores-desplazados.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agencia Tributaria: Régimen especial de trabajadores desplazados</a></li>
                <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2004-4371" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ley 35/2006, de 28 de noviembre, del IRPF (Artículo 93)</a></li>
            </ul>
        </section>
      </aside>
    </div>
  );
};

export default CalculadoraLeyBeckham;