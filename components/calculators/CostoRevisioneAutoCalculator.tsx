import React, { useState } from 'react';

// Componente principale del calcolatore di revisione
const RevisioneCalculator: React.FC = () => {
  // Stati per gestire gli input dell'utente e i risultati
  const [tipoVeicolo, setTipoVeicolo] = useState<string>('standard');
  const [calculationMode, setCalculationMode] = useState<string>('immatricolazione');
  const [inputDate, setInputDate] = useState<string>('');
  const [scadenza, setScadenza] = useState<string | null>(null);
  const [costo, setCosto] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });
  const [showResult, setShowResult] = useState(false);
  const = useState<string>('standard');
  const [calculationMode, setCalculationMode] = useState<string>('immatricolazione');
  const = useState<string>('');
  const = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stili CSS-in-JS per il componente
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#333',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    header: {
      textAlign: 'center',
      borderBottom: '2px solid #007bff',
      paddingBottom: '10px',
      marginBottom: '20px',
    },
    h1: {
      color: '#0056b3',
      margin: '0',
    },
    h2: {
      color: '#0056b3',
      borderBottom: '1px solid #ddd',
      paddingBottom: '5px',
      marginTop: '30px',
    },
    section: {
      marginBottom: '25px',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '6px',
      border: '1px solid #eee',
    },
    inputGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    input: {
      width: 'calc(100% - 20px)',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '16px',
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '12px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      width: '100%',
      marginTop: '10px',
    },
    resultBox: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#e7f3ff',
      border: '1px solid #b3d7ff',
      borderRadius: '4px',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '1.2em',
    },
    errorBox: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#ffebe6',
      border: '1px solid #ffc9ba',
      color: '#d8000c',
      borderRadius: '4px',
      textAlign: 'center',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px',
    },
    th: {
      backgroundColor: '#f2f2f2',
      border: '1px solid #ddd',
      padding: '12px',
      textAlign: 'left',
      fontWeight: 'bold',
    },
    td: {
      border: '1px solid #ddd',
      padding: '12px',
    },
    warningBox: {
      padding: '15px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeeba',
      color: '#856404',
      borderRadius: '4px',
      marginTop: '15px',
    },
    infoList: {
      listStyleType: 'disc',
      paddingLeft: '20px',
    },
    radioGroup: {
      display: 'flex',
      gap: '15px',
      marginBottom: '10px',
    }
  };

  // Funzione per calcolare la data di scadenza della revisione
  const handleCalculateDueDate = () => {
    if (!inputDate) {
      setError('Per favore, inserisci una data valida.');
      setDueDate(null);
      return;
    }

    try {
      const date = new Date(inputDate);
      if (isNaN(date.getTime())) {
        throw new Error("Data non valida");
      }
      
      let scadenza = new Date(date);
      let yearsToAdd = 0;

      if (calculationMode === 'immatricolazione') {
        // Prima revisione
        yearsToAdd = vehicleType === 'professionale'? 1 : 4;
      } else {
        // Revisioni successive
        if (vehicleType === 'standard') yearsToAdd = 2;
        if (vehicleType === 'storico') yearsToAdd = 2;
        if (vehicleType === 'professionale') yearsToAdd = 1;
      }

      scadenza.setFullYear(scadenza.getFullYear() + yearsToAdd);

      const month = scadenza.toLocaleString('it-IT', { month: 'long' }).toUpperCase();
      const year = scadenza.getFullYear();
      
      // La scadenza è sempre l'ultimo giorno del mese
      const lastDayOfMonth = new Date(scadenza.getFullYear(), scadenza.getMonth() + 1, 0).getDate();

      setDueDate(`Entro il ${lastDayOfMonth} ${month} ${year}`);
      setError(null);
    } catch {
      setError('Formato data non valido. Usa il formato AAAA-MM-GG.');
      setDueDate(null);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Motore di Revisione SocalSolver: Il Tuo Consulente Definitivo</h1>
        <p>Uno strumento completo per calcolare scadenze e comprendere i costi della revisione, senza sorprese.</p>
      </header>

      {/* Sezione 1: Calcolo Scadenza */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Fase 1: Calcola la Scadenza della Tua Revisione</h2>
        <div style={styles.inputGroup}>
          <label style={styles.label}>1. Seleziona il Tipo di Veicolo:</label>
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={styles.input}>
            <option value="standard">Autovettura / Motoveicolo / Autocaravan (&lt; 3.5t)</option>
            <option value="storico">Veicolo d'interesse storico e collezionistico</option>
            <option value="professionale">Taxi / NCC / Ambulanza / Autobus</option>
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>2. Seleziona il tipo di calcolo:</label>
          <div style={styles.radioGroup}>
            <label><input type="radio" value="immatricolazione" checked={calculationMode === 'immatricolazione'} onChange={() => setCalculationMode('immatricolazione')} /> Prima Revisione</label>
            <label><input type="radio" value="ultima_revisione" checked={calculationMode === 'ultima_revisione'} onChange={() => setCalculationMode('ultima_revisione')} /> Revisione Successiva</label>
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            3. Inserisci la data di {calculationMode === 'immatricolazione'? 'Prima Immatricolazione' : 'Ultima Revisione'}:
          </label>
          <input
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            style={styles.input}
          />
        </div>
        <button onClick={handleCalculateDueDate} style={styles.button}>Calcola Scadenza</button>
        
        {error && <div style={styles.errorBox}>{error}</div>}
        {dueDate && <div style={styles.resultBox}>{dueDate}</div>}

        <div style={{marginTop: '20px'}}>
            <h4>Logica di Calcolo Applicata:</h4>
            <ul style={styles.infoList}>
                <li><b>Veicoli Standard:</b> Prima revisione dopo 4 anni, successive ogni 2 anni.[1, 2, 3, 4]</li>
                <li><b>Veicoli Storici:</b> Revisione con cadenza biennale.[2, 5]</li>
                <li><b>Usi Professionali (Taxi, NCC, etc.):</b> Revisione annuale.[1, 2, 6]</li>
            </ul>
        </div>
      </section>

      {/* Sezione 2: Trasparenza Costi */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Fase 2: Il Motore di Trasparenza - Analisi Dettagliata dei Costi</h2>
        <p>Il costo della revisione è fissato per legge. Ecco la scomposizione ufficiale per la massima trasparenza.</p>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Voce di Costo</th>
              <th style={styles.th}>Importo</th>
              <th style={styles.th}>Fonte Normativa / Spiegazione</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>Tariffa Obbligatoria</td>
              <td style={styles.td}>54,95 €</td>
              <td style={styles.td}>Fissata dal Decreto Ministeriale del 03.08.2021 n.129.[7]</td>
            </tr>
            <tr>
              <td style={styles.td}>IVA al 22%</td>
              <td style={styles.td}>12,09 €</td>
              <td style={styles.td}>Calcolata sulla tariffa obbligatoria.[7, 8, 9]</td>
            </tr>
            <tr>
              <td style={styles.td}>Diritti Motorizzazione (DMS)</td>
              <td style={styles.td}>10,20 €</td>
              <td style={styles.td}>Diritti fissi esenti IVA (ex art. 15 DPR n. 633/1972).[10, 7, 2]</td>
            </tr>
            <tr>
              <td style={styles.td}>Commissione Pagamento Diritti</td>
              <td style={styles.td}>~1,51 € - 1,78 €</td>
              <td style={styles.td}>Voce variabile per incasso tramite PagoPA, dipende dal provider del centro.[11, 9]</td>
            </tr>
            <tr style={{fontWeight: 'bold', backgroundColor: '#f2f2f2'}}>
              <td style={styles.td}>COSTO FINALE STIMATO</td>
              <td style={styles.td}>78,75 € - 79,02 €</td>
              <td style={styles.td}>Questa è la cifra corretta da pagare presso un centro autorizzato.[11, 1, 6]</td>
            </tr>
          </tbody>
        </table>
        <div style={styles.warningBox}>
          <h4 style={{marginTop: 0}}>ATTENZIONE AI COSTI NASCOSTI E ILLEGITTIMI</h4>
          <p style={{margin: 0}}>
            L'associazione <b>Assoutenti</b> ha segnalato pratiche illegittime come l'addebito di "Contributo smaltimento rifiuti" o "Spese Cancelleria".[10] Queste voci non sono dovute. Controlla sempre la fattura e contesta ogni costo non presente nella scomposizione ufficiale.
          </p>
        </div>
      </section>

      {/* Sezione 3: Hub Informativo */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Fase 3: Hub Informativo - Tutto Ciò che Devi Sapere</h2>
        
        <h4>Cosa Controllano Durante la Revisione?</h4>
        <p>I controlli principali riguardano sicurezza e impatto ambientale [2, 5, 4]:</p>
        <ul style={styles.infoList}>
          <li>Impianto Frenante e Sterzo</li>
          <li>Visibilità (vetri, specchietti, tergicristalli)</li>
          <li>Impianto Elettrico (luci, indicatori)</li>
          <li>Telaio, Carrozzeria e Pneumatici</li>
          <li>Emissioni inquinanti e Rumorosità</li>
          <li>Identificazione (targa, numero di telaio)</li>
        </ul>

        <h4>Sanzioni per Mancata Revisione</h4>
        <p>Circolare con la revisione scaduta comporta severe conseguenze [1, 4, 8]:</p>
        <ul style={styles.infoList}>
          <li><b>Multa:</b> Da 173 € a 694 €, raddoppiata in caso di recidiva.</li>
          <li><b>Sospensione dalla Circolazione:</b> Il veicolo non può circolare fino a revisione superata.</li>
          <li><b>Rivalsa Assicurativa:</b> In caso di incidente, l'assicurazione potrebbe rivalersi su di te.</li>
        </ul>

        <h4>Casi Particolari: GPL, Metano e Veicoli Storici</h4>
        <ul style={styles.infoList}>
          <li><b>Veicoli a GPL:</b> Sostituzione bombole ogni 10 anni.[2]</li>
          <li><b>Veicoli a Metano (CNG4):</b> Revisione bombole ogni 4 anni.[1]</li>
          <li><b>Veicoli Storici:</b> Revisione biennale presso centri autorizzati.[2, 5]</li>
        </ul>
      </section>

      {/* Sezione 4: Prossimamente */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Prossimamente: Funzionalità Avanzate</h2>
        <p>Stiamo lavorando per rendere questo strumento ancora più potente:</p>
        <ul style={styles.infoList}>
          <li><b>Mappa Interattiva</b> dei centri autorizzati con recensioni.</li>
          <li><b>Il Tuo Garage Virtuale</b> per monitorare le scadenze di più veicoli.</li>
          <li><b>Promemoria Automatici</b> via email o SMS 30 giorni prima della scadenza.</li>
        </ul>
      </section>
    </div>
  );
};

export default RevisioneCalculator;
