"use client";

import React, { useEffect } from 'react';
import { FileText, Calculator, TrendingUp, Users, BookOpen, ExternalLink, Clock, Target, Award } from 'lucide-react';

const BustaPagaGuideCalculator = () => {
  const relatedArticles = [
    { title: "Guida alle Aliquote IRPEF e al Taglio del Cuneo Fiscale 2025", url: "#", icon: <Calculator /> },
    { title: "Negoziazione Salariale: Come Chiedere (e Ottenere) un Aumento", url: "#", icon: <TrendingUp /> },
    { title: "Dalla RAL al Potere d'Acquisto: Confrontare Offerte di Lavoro", url: "#", icon: <Target /> },
    { title: "Partita IVA Forfettaria: Guida Completa per Freelance", url: "#", icon: <BookOpen /> },
    { title: "Il Costo Reale di un Dipendente: Guida per HR e Manager", url: "#", icon: <Users /> }
  ];

  const cssVariables = {
    '--color-sunset-orange': '#F26B2E',
    '--color-golden-yellow': '#F9B934',
    '--color-light-sand': '#FCD96F',
    '--color-ocean-teal': '#3C9DA7',
    '--blue': '#3C9DA7',
    '--color-dark-brown': '#3A2A1A',
    '--color-cream-bg': '#F9F5E9',
    '--color-sunset-orange-light': '#F47E4A',
    '--color-sunset-orange-dark': '#D85C20',
    '--color-golden-yellow-light': '#FFD257',
    '--color-golden-yellow-dark': '#E1A500',
    '--color-ocean-teal-light': '#56B5BD',
    '--color-ocean-teal-dark': '#2C7A82',
    '--color-dark-brown-light': '#5A4632',
    '--color-dark-brown-dark': '#241810',
    '--color-cream-bg-dark': '#F0EDE5'
  };

  useEffect(() => {
    Object.entries(cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-cream-bg)] font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[var(--color-ocean-teal)] to-[var(--color-ocean-teal-dark)] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            {/* Last Updated Notice */}
            <div className="bg-[var(--color-golden-yellow)] text-[var(--color-dark-brown)] px-4 py-2 rounded-lg inline-flex items-center gap-2 mb-6 text-sm font-semibold">
              <Clock size={16} />
              Ultimo aggiornamento: 28 Agosto 2025 | Serie: Articolo 1 di 10
            </div>

        {/* Enhanced Regional/Municipal Tax Section */}
        <div className=" -2xl -lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-ocean-teal-dark)] rounded-full flex items-center justify-center text-white font-bold text-sm">📍</div>
            Addizionali Regionali e Comunali: La Geografia della Tassazione
          </h3>
          
          <p className="text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            Le addizionali IRPEF variano significativamente sul territorio italiano, creando differenze sostanziali nel netto finale. Un fenomeno che riflette il federalismo fiscale italiano e può influenzare le decisioni di mobilità professionale.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-[var(--color-ocean-teal-dark-bg)] rounded-lg p-4">
              <h4 className="font-bold text-[var(--color-sunset-orange)] mb-3">Nord Italia (esempi)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Lombardia:</span>
                  <span className="font-bold">1,23%</span>
                </div>
                <div className="flex justify-between">
                  <span>Milano:</span>
                  <span className="font-bold">0,90%</span>
                </div>
                <div className="flex justify-between">
                  <span>Torino:</span>
                  <span className="font-bold">0,80%</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-[var(--color-sunset-orange)] font-bold">
                  <span>Tot. Milano:</span>
                  <span>2,13%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--color-brown-bg-dark)] rounded-lg p-4">
              <h4 className="font-bold text-[var(--color-ocean-teal)] mb-3">Centro Italia (esempi)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Lazio:</span>
                  <span className="font-bold">1,23%</span>
                </div>
                <div className="flex justify-between">
                  <span>Roma:</span>
                  <span className="font-bold">0,90%</span>
                </div>
                <div className="flex justify-between">
                  <span>Firenze:</span>
                  <span className="font-bold">0,80%</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-[var(--color-ocean-teal)] font-bold">
                  <span>Tot. Roma:</span>
                  <span>2,13%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--color-light-sand)] bg-opacity-40 rounded-lg p-4">
              <h4 className="font-bold text-[var(--color-golden-yellow-dark)] mb-3">Sud Italia (esempi)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Campania:</span>
                  <span className="font-bold">1,23%</span>
                </div>
                <div className="flex justify-between">
                  <span>Napoli:</span>
                  <span className="font-bold">0,90%</span>
                </div>
                <div className="flex justify-between">
                  <span>Palermo:</span>
                  <span className="font-bold">0,80%</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-[var(--color-golden-yellow-dark)] font-bold">
                  <span>Tot. Napoli:</span>
                  <span>2,13%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6">
            <h4 className="font-bold text-[var(--color-dark-brown)] mb-4">🔍 Come Trovare le Tue Aliquote Esatte:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-[var(--color-sunset-orange)] mb-2">Addizionale Regionale:</p>
                <p className="text-[var(--color-dark-brown-light)]">
                  Consulta il sito della tua Regione o l'area "Normativa Fiscale" del portale della Regione. 
                  Le aliquote sono deliberate annualmente dai Consigli Regionali.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-ocean-teal)] mb-2">Addizionale Comunale:</p>
                <p className="text-[var(--color-dark-brown-light)]">
                  Verifica sul sito del tuo Comune di residenza, sezione "Tributi" o "Aliquote fiscali". 
                  Attenzione: può variare anche all'interno dello stesso comune per fasce di reddito.
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border-l-4 border-[var(--color-golden-yellow)]">
              <p className="text-xs text-[var(--color-dark-brown-light)]">
                <strong>💡 Pro Tip:</strong> Se stai valutando un trasferimento, una differenza dello 0,5% sulle addizionali 
                può significare €200-400 in più o in meno sul tuo netto annuo. Includilo sempre nei tuoi calcoli!
              </p>
            </div>
          </div>
        </div>

        {/* Glossary Section */}
        <div className=" -2xl -lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-dark-brown)] rounded-full flex items-center justify-center text-white font-bold text-sm">📖</div>
            Glossario degli Acronimi
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { term: "RAL", definition: "Retribuzione Annua Lorda - il totale lordo annuo pattuito" },
              { term: "IVS", definition: "Invalidità, Vecchiaia e Superstiti - contributi per pensioni e invalidità" },
              { term: "CUAF", definition: "Cassa Unica Assegni Familiari - contributi per gli assegni familiari" },
              { term: "IRPEF", definition: "Imposta sul Reddito delle Persone Fisiche - l'imposta principale sui redditi" },
              { term: "TFR", definition: "Trattamento di Fine Rapporto - accantonamento per la liquidazione" },
              { term: "CCNL", definition: "Contratto Collettivo Nazionale di Lavoro - contratto di categoria" },
              { term: "INAIL", definition: "Istituto Nazionale Assicurazione Infortuni sul Lavoro" },
              { term: "CUD/CU", definition: "Certificazione Unica - documento che attesta i redditi percepiti" },
              { term: "NASpI", definition: "Nuova Assicurazione Sociale per l'Impiego - indennità di disoccupazione" }
            ].map((item, index) => (
              <div key={index} className="bg-[var(--color-cream-bg)] p-4 rounded-lg">
                <h4 className="font-bold text-[var(--color-sunset-orange)] mb-2">{item.term}</h4>
                <p className="text-xs text-[var(--color-dark-brown-light)] leading-relaxed">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
            
            <div className="inline-flex items-center gap-3 mb-6">
              <FileText size={40} className="text-[var(--color-golden-yellow)]" />
              <span className="text-[var(--color-golden-yellow)] text-lg font-semibold tracking-wide">GUIDA FINANZIARIA</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Come Leggere la Tua Busta Paga
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-[var(--color-ocean-teal-light)] max-w-4xl mx-auto">
              Guida Semplice e Completa per Demistificare Ogni Voce del Tuo Stipendio
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Lettura: 18 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} />
                <span>Livello: Intermedio-Avanzato</span>
              </div>
            </div>
          </div>

          {/* Final Calculation for Marco */}
          <div className="bg-gradient-to-r from-[var(--color-sunset-orange)] to-[var(--color-sunset-orange-dark)] text-white rounded-lg p-6 mt-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              🎯 Calcolo Finale Completo: Marco
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 text-sm">
                <h5 className="font-semibold mb-2">Calcolo IRPEF Netta:</h5>
                <div className="bg-white bg-opacity-20 rounded p-3 font-mono text-xs space-y-1">
                  <div>IRPEF Lorda: €10.942,58</div>
                  <div>- Detrazione Lavoro Dipendente: €1.338,00</div>
                  <div className="border-t border-white border-opacity-40 pt-1">
                    <strong>IRPEF Netta: €9.604,58</strong>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <h5 className="font-semibold mb-2">Addizionali (Milano/Lombardia):</h5>
                <div className="bg-white bg-opacity-20 rounded p-3 font-mono text-xs space-y-1">
                  <div>Add. Regionale: €40.864,50 × 1,23% = €502,63</div>
                  <div>Add. Comunale: €40.864,50 × 0,90% = €367,78</div>
                  <div className="border-t border-white border-opacity-40 pt-1">
                    <strong>Totale Addizionali: €870,41</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white bg-opacity-20 rounded-lg p-4">
              <h5 className="font-bold text-center text-lg mb-2">RISULTATO FINALE</h5>
              <div className="font-mono text-center space-y-1">
                <div>RAL: €45.000</div>
                <div>- Contributi INPS: €4.135,50</div>
                <div>- IRPEF Netta: €9.604,58</div>
                <div>- Addizionali: €870,41</div>
                <div className="border-t border-white border-opacity-50 pt-2 text-xl font-bold">
                  <div>Netto Annuo: €30.389,51</div>
                  <div className="text-[var(--color-golden-yellow)] text-2xl">Netto Mensile: €2.765,41</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className=" -2xl -lg p-8 mb-12 border-l-4 border-[var(--color-sunset-orange)]">
          <h2 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6">L'Arte di Decifrare il Proprio Valore: Una Filosofia della Trasparenza Salariale</h2>
          
          <p className="text-lg text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            Nel 1776, Adam Smith scriveva ne "La Ricchezza delle Nazioni" che <em>"il lavoro è la misura reale del valore di scambio di tutte le merci"</em>. Oggi, 248 anni dopo, questa verità fondamentale si materializza ogni mese in un documento che dovrebbe essere cristallino nella sua chiarezza, ma che spesso appare come un enigma crittografico: la busta paga.
          </p>
          
          <p className="text-lg text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            La comprensione della propria busta paga non è semplicemente un esercizio contabile, ma un atto di <strong>empowerment economico</strong>. Come sosteneva Peter Drucker, "quello che viene misurato, viene gestito" – e il primo passo per gestire efficacemente la propria crescita professionale è comprendere appieno la struttura della propria remunerazione.
          </p>

          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6 border-left-4 border-[var(--color-golden-yellow)]">
            <p className="text-[var(--color-dark-brown)] font-semibold mb-2">🎯 Obiettivo di questa guida:</p>
            <p className="text-[var(--color-dark-brown-light)]">
              Trasformare la tua busta paga da documento opaco a strumento strategico di pianificazione finanziaria, 
              collegando ogni voce ai risultati del nostro <a href="/it/pmi-e-impresa/calcolo-stipendio-netto" className="text-[var(--color-ocean-teal)] font-semibold underline hover:text-[var(--color-ocean-teal-dark)]">Calcolatore Stipendio Netto</a>.
            </p>
          </div>
        </div>

        {/* Visual Flowchart */}
        <div className=" -2xl -lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-8 text-center">Il Percorso: Da RAL a Stipendio Netto</h2>
          
          <div className="relative">
            {/* Desktop Flow */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-[var(--color-sunset-orange)] rounded-full flex items-center justify-center text-white font-bold mb-3 mx-auto">
                  RAL
                </div>
                <p className="text-sm font-semibold text-[var(--color-dark-brown)]">€45.000</p>
                <p className="text-xs text-[var(--color-dark-brown-light)]">Retribuzione<br/>Annua Lorda</p>
              </div>
              
              <div className="flex items-center px-4">
                <div className="w-8 h-0.5 bg-[var(--color-golden-yellow)]"></div>
                <div className="text-[var(--color-golden-yellow)] mx-2 text-xs">-9.19%</div>
                <div className="w-8 h-0.5 bg-[var(--color-golden-yellow)]"></div>
              </div>
              
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-[var(--color-ocean-teal)] rounded-full flex items-center justify-center text-white font-bold mb-3 mx-auto">
                  INPS
                </div>
                <p className="text-sm font-semibold text-[var(--color-dark-brown)]">-€4.136</p>
                <p className="text-xs text-[var(--color-dark-brown-light)]">Contributi<br/>Previdenziali</p>
              </div>
              
              <div className="flex items-center px-4">
                <div className="w-8 h-0.5 bg-[var(--color-golden-yellow)]"></div>
                <div className="text-[var(--color-golden-yellow)] mx-2 text-xs">Base</div>
                <div className="w-8 h-0.5 bg-[var(--color-golden-yellow)]"></div>
              </div>
              
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-[var(--color-golden-yellow)] rounded-full flex items-center justify-center text-white font-bold mb-3 mx-auto">
                  IRPEF
                </div>
                <p className="text-sm font-semibold text-[var(--color-dark-brown)]">-€9.680</p>
                <p className="text-xs text-[var(--color-dark-brown-light)]">Imposta sul<br/>Reddito</p>
              </div>
              
              <div className="flex items-center px-4">
                <div className="w-8 h-0.5 bg-[var(--color-golden-yellow)]"></div>
                <div className="text-[var(--color-golden-yellow)] mx-2 text-xs">+Det</div>
                <div className="w-8 h-0.5 bg-[var(--color-golden-yellow)]"></div>
              </div>
              
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-[var(--color-dark-brown)] rounded-full flex items-center justify-center text-white font-bold mb-3 mx-auto">
                  NET
                </div>
                <p className="text-sm font-semibold text-[var(--color-sunset-orange)]">€2.765</p>
                <p className="text-xs text-[var(--color-dark-brown-light)]">Stipendio Netto<br/>Mensile</p>
              </div>
            </div>
            
            {/* Mobile Flow */}
            <div className="md:hidden space-y-6">
              {[
                { label: "RAL", amount: "€45.000", desc: "Retribuzione Annua Lorda", color: "bg-[var(--color-sunset-orange)]" },
                { label: "INPS", amount: "-€4.136", desc: "Contributi Previdenziali (-9.19%)", color: "bg-[var(--color-ocean-teal)]" },
                { label: "IRPEF", amount: "-€9.680", desc: "Imposta sul Reddito", color: "bg-[var(--color-golden-yellow)]" },
                { label: "NETTO", amount: "€2.765", desc: "Stipendio Netto Mensile", color: "bg-[var(--color-dark-brown)]" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center text-white font-bold`}>
                    {item.label}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-dark-brown)]">{item.amount}</p>
                    <p className="text-xs text-[var(--color-dark-brown-light)]">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="w-8 h-0.5 bg-[var(--color-golden-yellow)] ml-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Numbers Summary Table */}
        <div className=" -2xl -lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 text-center">Numeri Chiave 2025</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-[var(--color-sunset-orange)] mb-4 flex items-center gap-2">
                <div className="w-4 h-4 bg-[var(--color-sunset-orange)] rounded-full"></div>
                Aliquote e Contributi
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-[var(--color-cream-bg)] pb-2">
                  <span className="text-sm">Contributi INPS Dipendente</span>
                  <span className="font-bold text-[var(--color-ocean-teal)]">9,19%</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--color-cream-bg)] pb-2">
                  <span className="text-sm">Contributi INPS Datore</span>
                  <span className="font-bold text-[var(--color-sunset-orange)]">30,00%</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--color-cream-bg)] pb-2">
                  <span className="text-sm">Addizionale Regionale (es. Lombardia)</span>
                  <span className="font-bold">1,23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Addizionale Comunale (es. Milano)</span>
                  <span className="font-bold">0,90%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-[var(--color-ocean-teal)] mb-4 flex items-center gap-2">
                <div className="w-4 h-4 bg-[var(--color-ocean-teal)] rounded-full"></div>
                Scaglioni IRPEF e Detrazioni
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-[var(--color-cream-bg)] pb-2">
                  <span className="text-sm">Fino a €28.000</span>
                  <span className="font-bold text-[var(--color-ocean-teal)]">23%</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--color-cream-bg)] pb-2">
                  <span className="text-sm">€28.001 - €50.000</span>
                  <span className="font-bold text-[var(--color-golden-yellow)]">35%</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--color-cream-bg)] pb-2">
                  <span className="text-sm">Oltre €50.000</span>
                  <span className="font-bold text-[var(--color-sunset-orange)]">43%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Detrazione Lavoro Dipendente (max)</span>
                  <span className="font-bold">€1.880</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-[var(--color-cream-bg-dark)] rounded-lg p-4">
            <p className="text-center text-sm text-[var(--color-dark-brown-light)]">
              <strong>Esempio di riferimento utilizzato in questa guida:</strong> RAL €45.000 - Dipendente privato settore terziario - Lombardia/Milano
            </p>
          </div>
        </div>

        {/* RAL Section */}
        <div className=" -2xl -lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-sunset-orange)] rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
            RAL - Retribuzione Annua Lorda: La Base del Contratto Sociale
          </h3>
          
          <p className="text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            La RAL rappresenta il <strong>contratto sociale</strong> tra te e l'azienda, il valore lordo che l'organizzazione riconosce al tuo contributo professionale. Tuttavia, come osservava il sociologo Georg Simmel nella sua "Filosofia del Denaro", il denaro è sempre una mediazione tra valore soggettivo e oggettivo.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[var(--color-cream-bg)] rounded-lg p-6">
              <h4 className="font-bold text-[var(--color-dark-brown)] mb-3">Esempio Pratico: Manager IT</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>RAL Contrattuale:</span>
                  <span className="font-bold">€45.000</span>
                </div>
                <div className="flex justify-between">
                  <span>Tredicesima:</span>
                  <span className="font-bold">€3.750</span>
                </div>
                <div className="flex justify-between">
                  <span>Quattordicesima:</span>
                  <span className="font-bold">€3.750</span>
                </div>
                <hr className="border-[var(--color-ocean-teal)]" />
                <div className="flex justify-between font-bold text-[var(--color-ocean-teal)]">
                  <span>RAL Totale:</span>
                  <span>€52.500</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--color-light-sand)] bg-opacity-30 rounded-lg p-6">
              <h4 className="font-bold text-[var(--color-dark-brown)] mb-3">Casi Corporate: Tesla vs. Mercedes</h4>
              <p className="text-sm text-[var(--color-dark-brown-light)] mb-3">
                <strong>Tesla</strong> comunica la RAL come "Total Cash Compensation", includendo bonus variabili nel calcolo base.
              </p>
              <p className="text-sm text-[var(--color-dark-brown-light)]">
                <strong>Mercedes-Benz</strong> separa nettamente RAL fissa da componenti variabili, seguendo la tradizione industriale europea.
              </p>
            </div>
          </div>

          {/* Comprehensive Case Study Box */}
          <div className="bg-gradient-to-r from-[var(--color-sunset-orange-light)] to-[var(--color-sunset-orange)] text-white rounded-lg p-6 mb-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              🔍 Caso Studio Completo: Seguici attraverso tutta la guida
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>Profilo:</strong> Marco, Software Engineer, Milano</p>
                <p><strong>RAL:</strong> €45.000 + tredicesima e quattordicesima</p>
                <p><strong>Settore:</strong> Terziario (CCNL Commercio)</p>
              </div>
              <div className="space-y-2">
                <p><strong>Stato:</strong> Single, nessun figlio a carico</p>
                <p><strong>Residenza:</strong> Milano, Lombardia</p>
                <p><strong>Obiettivo:</strong> Calcolare lo stipendio netto mensile</p>
              </div>
            </div>
            <div className="mt-4 bg-white bg-opacity-20 rounded p-3 text-center">
              <p className="text-sm"><strong>Seguiremo Marco passo-passo attraverso ogni sezione per arrivare al risultato finale: €2.765/mese</strong></p>
            </div>
          </div>

          {/* Interactive Mini Calculator */}
          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6">
            <h4 className="font-bold text-[var(--color-dark-brown)] mb-4 flex items-center gap-2">
              <Calculator size={20} />
              Calcola la Tua Retribuzione Mensile
            </h4>
            <p className="text-sm text-[var(--color-dark-brown-light)] mb-4">
              Inserisci la tua RAL per vedere subito la retribuzione mensile lorda (considerando tredicesima e quattordicesima):
            </p>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--color-dark-brown)] mb-1">RAL Annua (€)</label>
                <input 
                  type="number" 
                  placeholder="45000" 
                  className="w-full px-4 py-2 border border-[var(--color-ocean-teal)] rounded-lg focus:outline-none focus:border-[var(--color-sunset-orange)]"
                  id="ralInput"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  className="bg-[var(--color-ocean-teal)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-ocean-teal-dark)] text-sm font-semibold"
                  onClick={() => {
                    const input = document.getElementById('ralInput') as HTMLInputElement;
                    const result = document.getElementById('monthlyResult');
                    if (input && result && input.value) {
                      const ral = parseFloat(input.value);
                      const monthly12 = (ral / 12).toFixed(0);
                      const monthly14 = (ral / 14).toFixed(0);
                      result.innerHTML = `
                        <div class="text-center">
                          <p class="text-lg font-bold text-[var(--color-sunset-orange)]">€${monthly12}/mese (su 12 mensilità)</p>
                          <p class="text-sm text-[var(--color-dark-brown-light)]">oppure €${monthly14}/mese (su 14 mensilità)</p>
                        </div>
                      `;
                    }
                  }}
                >
                  /12
                </button>
                <button 
                  className="bg-[var(--color-sunset-orange)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-sunset-orange-dark)] text-sm font-semibold"
                  onClick={() => {
                    const input = document.getElementById('ralInput') as HTMLInputElement;
                    const result = document.getElementById('monthlyResult');
                    if (input && result && input.value) {
                      const ral = parseFloat(input.value);
                      const monthly14 = (ral / 14).toFixed(0);
                      result.innerHTML = `
                        <div class="text-center">
                          <p class="text-lg font-bold text-[var(--color-sunset-orange)]">€${monthly14}/mese</p>
                          <p class="text-sm text-[var(--color-dark-brown-light)]">Distribuzione su 14 mensilità (include tredicesima e quattordicesima)</p>
                        </div>
                      `;
                    }
                  }}
                >
                  /14
                </button>
              </div>
            </div>
            <div id="monthlyResult" className="mt-4 bg-white rounded p-3 min-h-[60px] flex items-center justify-center text-[var(--color-dark-brown-light)]">
              Risultato apparirà qui
            </div>
          </div>
        </div>

        {/* Imponibile Fiscale Section */}
        <div className=" -2xl -lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-golden-yellow)] rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
            Imponibile Fiscale: Il Territorio dello Stato
          </h3>
          
          <p className="text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            L'imponibile fiscale rappresenta la quota della tua RAL su cui lo Stato calcola le imposte. È qui che la teoria economica di <strong>Arthur Laffer</strong> e la sua celebre "Curva di Laffer" trova applicazione pratica: qual è il punto di equilibrio ottimale tra pressione fiscale e crescita economica?
          </p>

          <div className="bg-[var(--color-cream-bg-dark)] rounded-lg p-6 mb-6">
            <h4 className="font-bold text-[var(--color-dark-brown)] mb-4">Formula di Calcolo:</h4>
            <div className="font-mono text-sm bg-white p-4 rounded border">
              Imponibile Fiscale = RAL - Contributi Previdenziali Dipendente
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[var(--color-sunset-orange-light)] to-[var(--color-sunset-orange)] text-white rounded-lg p-4">
              <h5 className="font-bold mb-2">Settore Bancario</h5>
              <p className="text-sm opacity-90">Imponibili elevati richiedono strategie fiscali sofisticate (welfare aziendale, stock options)</p>
            </div>
            <div className="bg-gradient-to-br from-[var(--color-ocean-teal-light)] to-[var(--color-ocean-teal)] text-white rounded-lg p-4">
              <h5 className="font-bold mb-2">Startup Tech</h5>
              <p className="text-sm opacity-90">Equity compensation riduce l'imponibile corrente, spostando la tassazione nel futuro</p>
            </div>
            <div className="bg-gradient-to-br from-[var(--color-golden-yellow)] to-[var(--color-golden-yellow-dark)] text-white rounded-lg p-4">
              <h5 className="font-bold mb-2">Multinazionali</h5>
              <p className="text-sm opacity-90">Piani di mobilità internazionale modificano l'imponibile con regimi speciali</p>
            </div>
          </div>
        </div>

        {/* INPS Section */}
        <div className=" -2xl -lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-ocean-teal)] rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
            Contributi INPS: L'Investimento nel Tuo Futuro
          </h3>
          
          <p className="text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            I contributi previdenziali incarnano la teoria del <strong>"contratto sociale intergenerazionale"</strong> di John Rawls. Non sono un costo, ma un investimento nel sistema che garantirà la tua pensione futura. Il sistema italiano segue il modello "a ripartizione", dove i contributi dei lavoratori attivi finanziano le pensioni di chi ha già smesso di lavorare.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-[var(--color-dark-brown)]">Aliquote Standard per Dipendenti Privati:</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-[var(--color-cream-bg)] p-3 rounded">
                  <span>Dipendente (IVS + CUAF + Disoccupazione)</span>
                  <span className="font-bold text-[var(--color-ocean-teal)]">9,19%</span>
                </div>
                <div className="flex justify-between items-center bg-[var(--color-cream-bg-dark)] p-3 rounded">
                  <span>Datore di Lavoro</span>
                  <span className="font-bold text-[var(--color-sunset-orange)]">30,00%</span>
                </div>
                <div className="flex justify-between items-center bg-[var(--color-light-sand)] bg-opacity-40 p-3 rounded">
                  <span><strong>Totale Sistema</strong></span>
                  <span className="font-bold text-[var(--color-dark-brown)]">39,19%</span>
                </div>
              </div>

              {/* Marco's Case Study Calculation */}
              <div className="bg-[var(--color-sunset-orange)] bg-opacity-10 border-l-4 border-[var(--color-sunset-orange)] p-4 rounded">
                <h5 className="font-bold text-[var(--color-sunset-orange)] mb-2">📊 Calcolo per Marco:</h5>
                <div className="space-y-1 text-sm font-mono">
                  <div>RAL: €45.000</div>
                  <div>Contributi INPS: €45.000 × 9,19% = <strong>€4.135,50</strong></div>
                  <div className="border-t border-[var(--color-sunset-orange)] pt-2 font-bold text-[var(--color-ocean-teal)]">
                    Imponibile Fiscale: €45.000 - €4.135,50 = €40.864,50
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--color-cream-bg)] rounded-lg p-6">
              <h4 className="font-bold text-[var(--color-dark-brown)] mb-4">Caso Studio: Unilever Italia</h4>
              <p className="text-sm text-[var(--color-dark-brown-light)] mb-3">
                La multinazionale ha implementato un sistema di <strong>Total Reward Statement</strong> che mostra ai dipendenti il valore complessivo dei contributi versati dall'azienda.
              </p>
              <div className="bg-white p-3 rounded border-l-4 border-[var(--color-ocean-teal)]">
                <p className="text-xs font-semibold">Innovazione HR:</p>
                <p className="text-xs">Dashboard personalizzata che proietta la pensione futura basata sui contributi attuali</p>
              </div>
            </div>
          </div>
        </div>

        {/* IRPEF Section */}
        <div className=" -2xl -lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-sunset-orange-dark)] rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
            IRPEF: La Progressività come Principio di Equità
          </h3>
          
          <p className="text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            L'IRPEF (Imposta sul Reddito delle Persone Fisiche) rappresenta l'applicazione pratica del principio di <strong>progressività fiscale</strong> teorizzato da economisti come Thomas Piketty. Il sistema a scaglioni riflette l'idea che chi guadagna di più debba contribuire in misura maggiore al bene comune.
          </p>

          <div className="bg-gradient-to-r from-[var(--color-cream-bg)] to-[var(--color-cream-bg-dark)] rounded-lg p-6 mb-6">
            <h4 className="font-bold text-[var(--color-dark-brown)] mb-4">Scaglioni IRPEF 2025:</h4>
            <div className="grid gap-3">
              <div className="flex justify-between items-center  p-3  -sm">
                <span>Fino a €28.000</span>
                <span className="bg-[var(--color-ocean-teal)] text-white px-3 py-1 rounded-full text-sm font-bold">23%</span>
              </div>
              <div className="flex justify-between items-center  p-3  -sm">
                <span>Da €28.001 a €50.000</span>
                <span className="bg-[var(--color-golden-yellow)] text-white px-3 py-1 rounded-full text-sm font-bold">35%</span>
              </div>
              <div className="flex justify-between items-center  p-3  -sm">
                <span>Oltre €50.000</span>
                <span className="bg-[var(--color-sunset-orange)] text-white px-3 py-1 rounded-full text-sm font-bold">43%</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-light-sand)] bg-opacity-30 rounded-lg p-6">
            <h4 className="font-bold text-[var(--color-dark-brown)] mb-3">Esempio Calcolo Completo (RAL €45.000):</h4>
            <div className="space-y-2 text-sm font-mono mb-4">
              <div>Primo scaglione: €28.000 × 23% = €6.440</div>
              <div>Secondo scaglione: €12.864,50 × 35% = €4.502,58</div>
              <div className="border-t border-[var(--color-dark-brown-light)] pt-2 font-bold">
                IRPEF Lorda Totale: €10.942,58
              </div>
            </div>

            {/* Marco's detailed calculation */}
            <div className="bg-[var(--color-sunset-orange)] bg-opacity-10 border-l-4 border-[var(--color-sunset-orange)] p-4 rounded">
              <h5 className="font-bold text-[var(--color-sunset-orange)] mb-2">📊 Calcolo dettagliato per Marco:</h5>
              <div className="space-y-1 text-xs font-mono">
                <div>Imponibile Fiscale: €40.864,50</div>
                <div>1° Scaglione: €28.000 × 23% = €6.440,00</div>
                <div>2° Scaglione: €12.864,50 × 35% = €4.502,58</div>
                <div className="border-t pt-1 font-bold text-[var(--color-ocean-teal)]">
                  IRPEF Lorda Marco: €10.942,58
                </div>
                <div className="text-[var(--color-dark-brown-light)] text-xs mt-2">
                  ⚠️ Questo è prima delle detrazioni - continua per vedere il calcolo finale
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detrazioni Section */}
        <div className=" -2xl -lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-golden-yellow-dark)] rounded-full flex items-center justify-center text-white font-bold text-sm">5</div>
            Detrazioni e Addizionali: Il Fine-Tuning del Sistema
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-bold text-[var(--color-dark-brown)] mb-4">Detrazioni Principali:</h4>
              <div className="space-y-3">
                <div className="bg-[var(--color-cream-bg)] p-4 rounded-lg">
                  <div className="font-bold text-[var(--color-ocean-teal)] mb-2">Detrazione Lavoro Dipendente</div>
                  <p className="text-sm text-[var(--color-dark-brown-light)]">
                    Fino a €1.880 per redditi fino a €28.000, decrescente fino ad azzerarsi per redditi oltre €55.000
                  </p>
                </div>
                <div className="bg-[var(--color-cream-bg-dark)] p-4 rounded-lg">
                  <div className="font-bold text-[var(--color-sunset-orange)] mb-2">Detrazioni per Carichi di Famiglia</div>
                  <p className="text-sm text-[var(--color-dark-brown-light)]">
                    Coniuge, figli e altri familiari a carico con soglie di reddito specifiche
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-[var(--color-dark-brown)] mb-4">Addizionali:</h4>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-[var(--color-sunset-orange-light)] to-[var(--color-sunset-orange)] text-white p-4 rounded-lg">
                  <div className="font-bold mb-2">Addizionale Regionale</div>
                  <p className="text-sm opacity-90">Variabile per regione (es. Lombardia 1,23%)</p>
                </div>
                <div className="bg-gradient-to-r from-[var(--color-ocean-teal-light)] to-[var(--color-ocean-teal)] text-white p-4 rounded-lg">
                  <div className="font-bold mb-2">Addizionale Comunale</div>
                  <p className="text-sm opacity-90">Variabile per comune (es. Milano 0,9%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bonus e Welfare Section */}
        <div className=" -2xl -lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-light-sand)] rounded-full flex items-center justify-center text-[var(--color-dark-brown)] font-bold text-sm">6</div>
            Bonus e Welfare: L'Evoluzione del Total Reward
          </h3>
          
          <p className="text-[var(--color-dark-brown-light)] mb-6 leading-relaxed">
            L'evoluzione verso il <strong>"Total Reward"</strong> riflette i cambiamenti sociologici del lavoro moderno. Come sosteneva Frederick Herzberg nella sua teoria della motivazione, la retribuzione non è solo denaro, ma un sistema complesso di riconoscimenti tangibili e intangibili.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--color-cream-bg)] p-6 rounded-lg">
              <h5 className="font-bold text-[var(--color-sunset-orange)] mb-3">Bonus Fiscalmente Vantaggiosi</h5>
              <ul className="text-sm space-y-2 text-[var(--color-dark-brown-light)]">
                <li>• Premio di Produttività (fino €3.000)</li>
                <li>• Welfare Aziendale (fino €3.000)</li>
                <li>• Buoni Pasto</li>
                <li>• Rimborsi Trasporti</li>
              </ul>
            </div>
            
            <div className="bg-[var(--color-cream-bg-dark)] p-6 rounded-lg">
              <h5 className="font-bold text-[var(--color-ocean-teal)] mb-3">Benefit a Lungo Termine</h5>
              <ul className="text-sm space-y-2 text-[var(--color-dark-brown-light)]">
                <li>• Stock Options</li>
                <li>• Fondi Pensione Integrativi</li>
                <li>• Assicurazioni Sanitarie</li>
                <li>• Formazione Continua</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-[var(--color-golden-yellow)] to-[var(--color-golden-yellow-dark)] text-white p-6 rounded-lg">
              <h5 className="font-bold mb-3">Caso Studio: Google Italia</h5>
              <p className="text-sm opacity-90">
                Il 40% del Total Reward è costituito da benefit non monetari: palestra, mensa, shuttle, corsi di lingua, sabbaticals.
              </p>
            </div>
          </div>
        </div>

        {/* Practical Calculator Connection */}
        <div className="bg-gradient-to-r from-[var(--color-ocean-teal)] to-[var(--color-ocean-teal-dark)] text-white rounded-2xl p-8 mb-12">
          <div className="text-center">
            <Calculator size={48} className="mx-auto mb-6 text-[var(--color-golden-yellow)]" />
            <h3 className="text-2xl font-bold mb-4">Metti in Pratica: Usa il Nostro Calcolatore</h3>
            <p className="text-xl mb-6 opacity-90">
              Ora che conosci ogni componente della tua busta paga, verifica i calcoli con il nostro strumento professionale
            </p>
            <a 
              href="/it/pmi-e-impresa/calcolo-stipendio-netto" 
              className="inline-flex items-center gap-3 bg-[var(--color-sunset-orange)] hover:bg-[var(--color-sunset-orange-dark)] px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              <Calculator size={24} />
              Calcola il Tuo Stipendio Netto
              <ExternalLink size={20} />
            </a>
          </div>
        </div>

        {/* Your Journey Continues Section */}
        <div className=" -2xl -lg p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-4">Il Tuo Percorso Continua: Prossimi Passi</h3>
            <p className="text-[var(--color-dark-brown-light)] max-w-2xl mx-auto">
              Hai appena completato il <strong>Passo 1 di 10</strong> del nostro percorso di mastery finanziaria. 
              Ogni guida si costruisce sulla precedente per darti una comprensione completa del sistema retributivo italiano.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[var(--color-sunset-orange)]">Progresso Serie</span>
              <span className="text-sm font-semibold text-[var(--color-sunset-orange)]">1/10</span>
            </div>
            <div className="w-full bg-[var(--color-cream-bg)] rounded-full h-2">
              <div className="bg-gradient-to-r from-[var(--color-sunset-orange)] to-[var(--color-golden-yellow)] h-2 rounded-full" style={{width: '10%'}}></div>
            </div>
          </div>

          {/* Next Article Spotlight */}
          <div className="bg-gradient-to-r from-[var(--color-ocean-teal)] to-[var(--color-ocean-teal-dark)] text-white rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--color-golden-yellow)] rounded-full flex items-center justify-center text-[var(--color-ocean-teal-dark)] font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2">Prossima Tappa: Guida alle Aliquote IRPEF e al Taglio del Cuneo Fiscale 2025</h4>
                <p className="text-[var(--color-ocean-teal-light)] text-sm mb-3">
                  Ora che comprendi la struttura della busta paga, è tempo di approfondire le leggi fiscali che la governano. 
                  Scopri come le recenti riforme fiscali impattano il tuo stipendio netto.
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center gap-2 bg-[var(--color-golden-yellow)] text-[var(--color-ocean-teal-dark)] px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-golden-yellow-light)] transition-colors text-sm"
                >
                  Continua il Percorso →
                </a>
              </div>
            </div>
          </div>

          {/* Series Overview Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                num: 3, 
                title: "Negoziazione Salariale: Come Chiedere un Aumento", 
                status: "coming", 
                description: "Strategie pratiche per la crescita retributiva" 
              },
              { 
                num: 4, 
                title: "Dalla RAL al Potere d'Acquisto", 
                status: "coming", 
                description: "Confrontare offerte in città diverse" 
              },
              { 
                num: 5, 
                title: "Partita IVA Forfettaria: Guida Completa", 
                status: "coming", 
                description: "Tutto sul regime agevolato per autonomi" 
              },
              { 
                num: 6, 
                title: "Rientro dei Cervelli 2025", 
                status: "coming", 
                description: "Vantaggi fiscali per i talenti di ritorno" 
              },
              { 
                num: 7, 
                title: "Welfare Aziendale e Benefit", 
                status: "coming", 
                description: "Massimizzare il valore non tassato" 
              },
              { 
                num: 8, 
                title: "Il Costo Reale di un Dipendente", 
                status: "coming", 
                description: "Guida per HR e manager" 
              }
            ].map((article, index) => (
              <div key={index} className="bg-[var(--color-cream-bg)] hover:bg-[var(--color-cream-bg-dark)] p-4 rounded-lg transition-colors border border-transparent hover:border-[var(--color-sunset-orange)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[var(--color-dark-brown-light)] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {article.num}
                  </div>
                  <span className="text-xs bg-[var(--color-golden-yellow)] text-[var(--color-dark-brown)] px-2 py-1 rounded-full font-semibold">
                    In Arrivo
                  </span>
                </div>
                <h4 className="font-bold text-[var(--color-dark-brown)] text-sm leading-tight mb-2">
                  {article.title}
                </h4>
                <p className="text-xs text-[var(--color-dark-brown-light)]">
                  {article.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--color-dark-brown-light)] mb-4">
              🎓 <strong>Perché una Serie di Guide?</strong> Ogni argomento si interconnette con gli altri. 
              La comprensione completa del sistema retributivo italiano richiede un approccio sistematico e progressivo.
            </p>
            <button className="bg-[var(--color-sunset-orange)] hover:bg-[var(--color-sunset-orange-dark)] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Notificami Nuove Guide
            </button>
          </div>
        </div>

        {/* External Resources */}
        <div className="bg-[var(--color-cream-bg-dark)] rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-[var(--color-dark-brown)] mb-6">Fonti Autorevoli e Approfondimenti</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-[var(--color-sunset-orange)]">Riferimenti Normativi Ufficiali:</h4>
              <div className="space-y-2">
                <a 
                  href="https://www.agenziaentrate.gov.it/portale/schede/agevolazioni/detrazione-lavoro-dipendente/cosa-det-lav-dip"
                  target="_blank"
                  className="flex items-center gap-2 text-[var(--color-ocean-teal)] hover:text-[var(--color-ocean-teal-dark)] text-sm"
                >
                  <ExternalLink size={16} />
                  Agenzia delle Entrate - Detrazioni Lavoro Dipendente
                </a>
                <a 
                  href="https://www.inps.it/prestazioni-e-servizi/contributi-e-aliquote"
                  target="_blank" 
                  className="flex items-center gap-2 text-[var(--color-ocean-teal)] hover:text-[var(--color-ocean-teal-dark)] text-sm"
                >
                  <ExternalLink size={16} />
                  INPS - Contributi e Aliquote Previdenziali
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-[var(--color-sunset-orange)]">Studi e Analisi Specializzate:</h4>
              <div className="space-y-2">
                <a 
                  href="https://www.oecd.org/tax/tax-policy/taxing-wages-20725124.htm"
                  target="_blank"
                  className="flex items-center gap-2 text-[var(--color-ocean-teal)] hover:text-[var(--color-ocean-teal-dark)] text-sm"
                >
                  <ExternalLink size={16} />
                  OCSE - Taxing Wages Report (Analisi Fiscalità Internazionale)
                </a>
                <a 
                  href="https://www.bancaditalia.it/pubblicazioni/indagine-famiglie/"
                  target="_blank"
                  className="flex items-center gap-2 text-[var(--color-ocean-teal)] hover:text-[var(--color-ocean-teal-dark)] text-sm"
                >
                  <ExternalLink size={16} />
                  Banca d'Italia - Indagine sui Bilanci delle Famiglie
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Author Bio */}
        <div className=" -2xl -lg p-8 border-l-4 border-[var(--color-golden-yellow)]">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-sunset-orange)] to-[var(--color-sunset-orange-dark)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              UC
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-[var(--color-dark-brown)] mb-2">U. Candido</h4>
              <p className="text-[var(--color-dark-brown-light)] mb-4 leading-relaxed">
                <strong>MBA - MIB Trieste School of Management (2009-2010)</strong><br/>
                Esperto responsabile operativo con una comprovata esperienza di oltre 10 anni come project manager e responsabile della funzione di project management in diversi settori e aziende italiane, cinesi e statunitensi. Nell'ambito delle sue responsabilità operative e di pianificazione finanziaria, ha sviluppato una profonda expertise nell'analisi delle strutture retributive e dei sistemi payroll in vari contesti internazionali. Comprovata capacità di leadership per lavorare efficacemente con diversi team funzionali provenienti da background diversi in diverse linee di business all'interno di un'organizzazione.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[var(--color-ocean-teal)] text-white px-3 py-1 rounded-full text-xs">MBA</span>
                <span className="bg-[var(--color-sunset-orange)] text-white px-3 py-1 rounded-full text-xs">Payroll Systems</span>
                <span className="bg-[var(--color-golden-yellow)] text-white px-3 py-1 rounded-full text-xs">Financial Planning</span>
                <span className="bg-[var(--color-dark-brown-light)] text-white px-3 py-1 rounded-full text-xs">International Compensation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-[var(--color-dark-brown)] text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">Hai Domande sulla Tua Busta Paga?</h3>
          <p className="text-[var(--color-cream-bg)] mb-6 max-w-2xl mx-auto">
            I nostri esperti sono a disposizione per consulenze personalizzate su stipendi, benefit e pianificazione finanziaria
          </p>
          <button className="bg-[var(--color-sunset-orange)] hover:bg-[var(--color-sunset-orange-dark)] px-8 py-3 rounded-lg font-bold transition-colors">
            Richiedi Consulenza Gratuita
          </button>
        </div>
      </div>
    </div>
  );
};

export default BustaPagaGuideCalculator;