'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const meta = {
  title: "Calcolatore Costo Pannelli Fotovoltaici con Incentivi [2025]",
  description: "Stima il costo, il risparmio e i tempi di rientro di un impianto fotovoltaico con accumulo, inclusi gli incentivi fiscali (Bonus 50%). Calcola ora il tuo preventivo."
};

// --- Helper Components ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div>
    </div>
);

const FaqSchema = () => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": "Quanto costa un impianto fotovoltaico da 3 kWp con accumulo nel 2025?", "acceptedAnswer": { "@type": "Answer", "text": "Il costo di un impianto fotovoltaico da 3 kWp con sistema di accumulo si aggira indicativamente tra i 10.000€ e i 13.000€. Grazie al Bonus Ristrutturazione 50%, il costo effettivo per l'utente si riduce a 5.000€ - 6.500€, recuperati in 10 anni tramite detrazione fiscale."}},
            {"@type": "Question", "name": "Qual è il tempo di rientro di un investimento nel fotovoltaico?", "acceptedAnswer": { "@type": "Answer", "text": "Con gli attuali prezzi dell'energia e gli incentivi fiscali, il tempo di rientro medio per un impianto fotovoltaico residenziale in Italia varia dai 4 ai 7 anni. Dopo questo periodo, l'energia prodotta rappresenta un guadagno netto."}},
            {"@type": "Question", "name": "Il Bonus Fotovoltaico del 50% è uno sconto in fattura?", "acceptedAnswer": { "@type": "Answer", "text": "No, attualmente l'incentivo principale è il Bonus Ristrutturazione, che funziona come una detrazione fiscale IRPEF. L'importo pari al 50% della spesa viene restituito in 10 rate annuali di pari importo, riducendo le tasse da pagare. Lo sconto in fattura è una misura non più disponibile per i nuovi interventi."}}
        ]
    })}} />
);

const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
        {content.split('\n\n').map((block, index) => {
            const trimmedBlock = block.trim();
            if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
            if (trimmedBlock.startsWith('*')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
            if (trimmedBlock.includes("Caratteristica**")) {
                const rows = trimmedBlock.split('\n').slice(1);
                const headers = trimmedBlock.split('\n')[0].split('**').filter(h => h.trim());
                return (
                    <div key={index} className="overflow-x-auto my-4"><table className="min-w-full border text-sm">
                        <thead className="bg-gray-100"><tr>{headers.map((header, hIndex) => <th key={hIndex} className="p-2 border text-left">{header}</th>)}</tr></thead>
                        <tbody>{rows.map((row, rIndex) => { const cells = row.split('**').filter(c => c.trim()); return (<tr key={rIndex}><td className="p-2 border font-semibold">{cells[0]}</td><td className="p-2 border">{cells[1]}</td><td className="p-2 border">{cells[2]}</td></tr>); })}</tbody>
                    </table></div>
                );
            }
            if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
            return null;
        })}
        </div>
    );
};

// --- Dati di Configurazione ---
const calculatorData = { "slug": "costo-pannelli-fotovoltaici-incentivi", "category": "Immobiliare e Casa", "title": "Calcolatore Costo Installazione Pannelli Fotovoltaici (con incentivi)", "lang": "it", "inputs": [{ "id": "consumoAnnuo", "label": "Consumo Elettrico Annuo", "type": "number", "unit": "kWh", "min": 1000, "step": 100, "tooltip": "Trovi questo dato sulla tua bolletta elettrica, solitamente nel riepilogo annuale. È il punto di partenza per dimensionare correttamente l'impianto." }, { "id": "posizioneGeografica", "label": "Posizione Geografica", "type": "select", "options": [{ "label": "Nord Italia", "value": 1100 }, { "label": "Centro Italia", "value": 1350 }, { "label": "Sud Italia e Isole", "value": 1500 }], "tooltip": "L'irraggiamento solare varia significativamente in base alla latitudine, influenzando la produzione energetica annuale per ogni kWp installato." }, { "id": "percentualeAutoconsumo", "label": "Profilo di Consumo Energetico", "type": "select", "options": [{ "label": "Consumi concentrati di giorno", "value": 0.45 }, { "label": "Consumi distribuiti durante la giornata", "value": 0.35 }, { "label": "Consumi concentrati la sera", "value": 0.25 }], "tooltip": "Indica quando usi maggiormente l'elettricità. Questo dato, senza un sistema di accumulo, determina la percentuale di energia autoprodotta che riesci a consumare istantaneamente." }, { "id": "includeBatteria", "label": "Includere un sistema di accumulo (batteria)?", "type": "boolean", "tooltip": "Una batteria permette di immagazzinare l'energia prodotta e non consumata di giorno per utilizzarla di sera/notte, aumentando drasticamente l'autoconsumo e l'indipendenza energetica." }, { "id": "capacitaBatteria", "label": "Capacità della Batteria", "type": "number", "unit": "kWh", "min": 2, "step": 1, "condition": "includeBatteria == true", "tooltip": "La dimensione consigliata è spesso 1.5-2 volte la potenza dell'impianto. Ad esempio, per un impianto da 3 kWp, una batteria da 5-6 kWh è una scelta comune." }, { "id": "usaBonus", "label": "Usufruire del Bonus Ristrutturazione 50%?", "type": "boolean", "tooltip": "Questo incentivo fiscale permette di detrarre dall'IRPEF il 50% del costo dell'impianto in 10 rate annuali di pari importo. È l'agevolazione principale per il fotovoltaico residenziale." }], "outputs": [{ "id": "rientroInvestimentoAnni", "label": "Rientro dell'Investimento Stimato", "unit": "anni" }, { "id": "risparmioAnnuoTotale", "label": "Risparmio Annuo Totale", "unit": "€" }, { "id": "costoNettoIncentivo", "label": "Costo Finale (al netto incentivi)", "unit": "€" }, { "id": "costoTotaleImpianto", "label": "Costo Totale Impianto (chiavi in mano)", "unit": "€" }, { "id": "potenzaImpiantoConsigliata", "label": "Potenza Impianto Consigliata", "unit": "kWp" }, { "id": "produzioneAnnuaStimata", "label": "Produzione Annua Stimata", "unit": "kWh" }], "content": "### **Guida Completa all'Investimento nel Fotovoltaico (2025)**\n\n**Analisi dei Costi, dei Benefici e degli Incentivi per un Impianto Residenziale**\n\nL'installazione di un impianto fotovoltaico rappresenta una delle scelte più strategiche per una famiglia moderna, un investimento che intreccia **risparmio economico**, **sostenibilità ambientale** e **indipendenza energetica**. Questo strumento di calcolo è progettato per offrire una stima realistica e dettagliata, aiutandoti a comprendere non solo *quanto costa*, ma soprattutto *quanto rende* un impianto fotovoltaico su misura per le tue esigenze.\n\n**Disclaimer**: Le stime fornite da questo calcolatore si basano su medie di mercato e parametri standard. Fattori specifici come la complessità dell'installazione, la qualità dei componenti e le fluttuazioni dei prezzi dell'energia possono influenzare i risultati finali. Questo strumento non sostituisce il sopralluogo e il preventivo di un tecnico qualificato.\n\n### **Parte 1: Come Dimensionare il Tuo Impianto Fotovoltaico**\n\nIl cuore di una stima accurata è il corretto dimensionamento dell'impianto, che si basa principalmente su due fattori: i tuoi consumi e la tua posizione geografica.\n\n* **Consumo Elettrico Annuo (kWh)**: È il dato più importante. Un impianto dovrebbe essere dimensionato per coprire la maggior parte, se non la totalità, del tuo fabbisogno energetico annuale. Trovi questo valore nelle pagine di riepilogo della tua bolletta.\n* **Posizione Geografica**: L'Italia ha un'ottima esposizione solare, ma la quantità di energia producibile (la \"producibilità\") varia. Un impianto da 1 kWp (kilowatt di picco) al Nord produce circa 1.100 kWh/anno, al Centro 1.350 kWh/anno e al Sud oltre 1.500 kWh/anno.\n* **Profilo di Consumo**: Capire *quando* consumi energia è fondamentale, specialmente se non installi una batteria. L'energia prodotta dai pannelli deve essere consumata istantaneamente (autoconsumo) per massimizzare il risparmio. L'energia non consumata viene immessa in rete.\n\n### **Parte 2: L'Incentivo Fiscale: Bonus Ristrutturazione al 50%**\n\nL'incentivo principale che rende l'investimento nel fotovoltaico così vantaggioso è il **Bonus Casa** (o Bonus Ristrutturazioni).\n\n**Come funziona?**\n\nPermette di portare in **detrazione dall'IRPEF il 50% della spesa** sostenuta per l'acquisto e l'installazione dell'impianto, fino a un massimale di spesa di 96.000 €. La detrazione viene ripartita in **10 rate annuali** di uguale importo.\n\nEsempio pratico:\n- **Costo impianto**: 10.000 €\n- **Bonus 50%**: 5.000 €\n- **Detrazione annuale (per 10 anni)**: 500 €/anno\n\nQuesto significa che per 10 anni pagherai 500 € di tasse in meno ogni anno, dimezzando di fatto il costo reale dell'investimento. **Importante**: la detrazione non è uno sconto in fattura, ma un credito d'imposta. È necessario avere capienza IRPEF sufficiente per beneficiarne.\n\n### **Parte 3: Con o Senza Batteria di Accumulo?**\n\nL'aggiunta di un sistema di accumulo è la vera rivoluzione per l'indipendenza energetica.\n\nCaratteristica**Senza Batteria** **Con Batteria**\n**Autoconsumo Stimato**30% - 40%70% - 90%\n**Funzionamento**Consumi l'energia mentre viene prodotta (di giorno). Il resto lo immetti in rete.Immagazzini l'energia prodotta in eccesso di giorno e la usi la sera/notte.\n**Convenienza**Ideale se i tuoi consumi sono prevalentemente diurni.Essenziale per chi consuma principalmente la sera o vuole massimizzare l'autonomia.\n**Costo**InferioreMaggiore, ma il costo aggiuntivo rientra nel bonus al 50%.\n\nUna batteria permette di passare da un semplice risparmio a una quasi totale autosufficienza, riducendo al minimo l'energia prelevata dalla rete.\n\n### **Parte 4: Gestione dell'Energia in Eccesso: lo Scambio sul Posto (SSP)**\n\nCosa succede all'energia che produci ma non consumi né accumuli? Viene immessa nella rete elettrica nazionale e gestita dal **GSE (Gestore dei Servizi Energetici)** tramite il meccanismo dello **Scambio sul Posto**.\n\nIn pratica, il GSE ti riconosce un **rimborso economico** per l'energia che hai immesso. Questo contributo non è pari al prezzo a cui acquisti l'energia, ma è comunque un'entrata economica che contribuisce ad accelerare il rientro dell'investimento. Il nostro calcolatore stima questo guadagno per darti una visione completa dei benefici economici.\n\n### **Parte 5: FAQ - Domande Frequenti**\n\n* **Quanto spazio serve sul tetto per un impianto da 3 kWp?**\n    Generalmente, sono necessari circa 15-20 metri quadrati di superficie libera e ben esposta al sole.\n\n* **Qual è la durata di un impianto fotovoltaico?**\n    I pannelli moderni hanno una garanzia di performance di 25 anni (con un calo di efficienza minimo). L'inverter, il cuore dell'impianto, ha una vita media di 10-12 anni e rappresenta il principale costo di manutenzione straordinaria da prevedere.\n\n* **Posso installare il fotovoltaico in un condominio?**\n    Sì, la legge lo consente. È possibile installare un impianto ad uso privato sul proprio tetto o su parti comuni, previa comunicazione all'amministratore e senza ledere i diritti degli altri condomini." };


const CostoPannelliFotovoltaiciIncentiviCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = { consumoAnnuo: 3200, posizioneGeografica: 1350, percentualeAutoconsumo: 0.35, includeBatteria: true, capacitaBatteria: 5, usaBonus: true };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { consumoAnnuo, posizioneGeografica, percentualeAutoconsumo, includeBatteria, capacitaBatteria, usaBonus } = states;
        
        const costoEnergiaAcquisto = 0.25, prezzoEnergiaVenditaSSP = 0.11, costoPerKwp = 2300, costoPerKwhBatteria = 800;

        const potenzaImpiantoConsigliata = Math.round(Math.max(3, consumoAnnuo / posizioneGeografica) * 2) / 2;
        const costoBaseImpianto = potenzaImpiantoConsigliata * costoPerKwp;
        const costoBatteria = includeBatteria ? capacitaBatteria * costoPerKwhBatteria : 0;
        const costoTotaleImpianto = costoBaseImpianto + costoBatteria;
        const incentivoFiscaleTotale = usaBonus ? costoTotaleImpianto * 0.5 : 0;
        const costoNettoIncentivo = costoTotaleImpianto - incentivoFiscaleTotale;
        const produzioneAnnuaStimata = potenzaImpiantoConsigliata * posizioneGeografica * 0.95; // 5% loss factor
        const autoconsumoEffettivo = includeBatteria ? Math.min(0.85, (consumoAnnuo / produzioneAnnuaStimata)) : percentualeAutoconsumo;
        const energiaAutoconsumata = Math.min(consumoAnnuo, produzioneAnnuaStimata * autoconsumoEffettivo);
        const risparmioDaAutoconsumo = energiaAutoconsumata * costoEnergiaAcquisto;
        const energiaImmessaInRete = produzioneAnnuaStimata - energiaAutoconsumata;
        const guadagnoSSP = energiaImmessaInRete > 0 ? energiaImmessaInRete * prezzoEnergiaVenditaSSP : 0;
        const risparmioAnnuoTotale = risparmioDaAutoconsumo + guadagnoSSP;
        const rientroInvestimentoAnni = (risparmioAnnuoTotale > 0) ? costoNettoIncentivo / risparmioAnnuoTotale : 0;

        return { rientroInvestimentoAnni, risparmioAnnuoTotale, costoNettoIncentivo, costoTotaleImpianto, potenzaImpiantoConsigliata, produzioneAnnuaStimata };
    }, [states]);

    const chartData = useMemo(() => {
        const data = [];
        let cumulativeSavings = 0;
        for (let year = 0; year <= 20; year++) {
            if (year > 0) cumulativeSavings += calculatedOutputs.risparmioAnnuoTotale;
            data.push({
                anno: `Anno ${year}`,
                'Risparmio Cumulato': cumulativeSavings,
                'Costo Netto': calculatedOutputs.costoNettoIncentivo
            });
        }
        return data;
    }, [calculatedOutputs]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatNumber = (value: number, decimals = 1) => new Intl.NumberFormat('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-lg" ref={calculatorRef}>
                        <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">Scopri la convenienza di un impianto fotovoltaico su misura per la tua casa.</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce un preventivo tecnico dettagliato.
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border">
                                {inputs.map(input => {
                                    const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                    if (!conditionMet) return null;

                                    const label = <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label} {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}</label>;

                                    if (input.type === 'boolean') return <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border self-center"><input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} /><label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label></div>;
                                    
                                    if (input.type === 'select') return <div key={input.id}>{label}<select id={input.id} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={states[input.id]} onChange={(e) => handleStateChange(input.id, Number(e.target.value))}>{input.options?.map(opt => <option key={opt.label} value={opt.value}>{opt.label}</option>)}</select></div>;

                                    return (<div key={input.id}>{label}<div className="flex items-center gap-2"><input id={input.id} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />{input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}</div></div>);
                                })}
                            </div>
                        </div>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultati della Simulazione</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {outputs.map(output => (
                                    <div key={output.id} className={`p-4 rounded-lg ${output.id === 'rientroInvestimentoAnni' ? 'sm:col-span-2 bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
                                        <div className="text-sm font-medium text-gray-600">{output.label}</div>
                                        <div className={`text-2xl font-bold ${output.id === 'rientroInvestimentoAnni' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? (output.unit === '€' ? formatCurrency(calculatedOutputs[output.id as keyof typeof calculatedOutputs]) : formatNumber(calculatedOutputs[output.id as keyof typeof calculatedOutputs])) : '...'}</span>
                                            <span className="text-lg ml-1">{output.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Proiezione di Rientro dell'Investimento</h3>
                                <div className="h-80 w-full bg-gray-50 p-4 rounded-lg border">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="anno" />
                                                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                                <Line type="monotone" dataKey="Risparmio Cumulato" stroke="#16a34a" strokeWidth={2} />
                                                <Line type="monotone" dataKey="Costo Netto" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Guida all'Investimento</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/bonus-ristrutturazioni" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Bonus Ristrutturazioni</a></li>
                            <li><a href="https://www.gse.it/servizi-per-te/fotovoltaico/scambio-sul-posto" target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-600 hover:underline">GSE - Scambio sul Posto</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CostoPannelliFotovoltaiciIncentiviCalculator;