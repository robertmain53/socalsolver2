import { NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, Timestamp, writeBatch } from 'firebase/firestore';
// NOTA: Dovrai installare un pacchetto per inviare email, es: `npm install resend`
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// Inizializzazione Firebase (copia dal file precedente)
const firebaseConfig = { /* ... la tua config ... */ };
let app: App;
if (!getApps().length) { app = initializeApp(firebaseConfig); } else { app = getApps()[0]; }
const db = getFirestore(app);


// Funzione di invio email (Esempio con Resend, un servizio di email transazionale)
async function sendReminderEmail(email: string, reminderDate: Date) {
    const formattedDate = reminderDate.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' });
    console.log(`INVIO EMAIL A: ${email} per scadenza ${formattedDate}`);
    
    // Logica di invio REALE (qui è simulata)
    // await resend.emails.send({
    //     from: 'Promemoria Revisione <noreply@tuodominio.com>',
    //     to: email,
    //     subject: `Promemoria: Scadenza Revisione Veicolo`,
    //     html: `<p>Ciao! Ti ricordiamo che la revisione del tuo veicolo scade a <strong>${formattedDate}</strong>. Prenota per tempo un appuntamento!</p>`,
    // });

    return Promise.resolve(); // Simula successo
}


export async function GET(request: Request) {
    // Sicurezza: Proteggi l'endpoint da accessi non autorizzati
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const now = Timestamp.now();
        const remindersRef = collection(db, 'reminders');
        
        // Query: trova tutti i promemoria pendenti la cui data è passata
        const q = query(remindersRef, where('status', '==', 'pending'), where('reminderDate', '<=', now));
        
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return NextResponse.json({ message: 'Nessun promemoria da inviare.' });
        }
        
        const batch = writeBatch(db);
        const emailPromises: Promise<void>[] = [];

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const reminderDate = (data.reminderDate as Timestamp).toDate();
            
            // Aggiungi l'invio dell'email alla lista di promesse
            emailPromises.push(sendReminderEmail(data.email, reminderDate));
            
            // Aggiorna lo stato del documento a 'sent'
            batch.update(doc.ref, { status: 'sent' });
        });

        // Esegui tutte le promesse di invio email
        await Promise.all(emailPromises);
        
        // Esegui l'aggiornamento batch su Firestore
        await batch.commit();

        return NextResponse.json({ message: `Inviati ${querySnapshot.size} promemoria.` });

    } catch (error) {
        console.error('Errore nel task di invio promemoria:', error);
        return NextResponse.json({ error: 'Errore interno del server.' }, { status: 500 });
    }
}
