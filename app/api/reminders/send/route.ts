import { NextResponse } from 'next/server';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'; // Correzione qui: App -> FirebaseApp
import { getFirestore, collection, query, where, getDocs, Timestamp, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp; // Correzione qui: App -> FirebaseApp
if (!getApps().length) { app = initializeApp(firebaseConfig); } else { app = getApps()[0]; }
const db = getFirestore(app);

async function sendReminderEmail(email: string, reminderDate: Date) {
    const formattedDate = reminderDate.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' });
    console.log(`SIMULAZIONE INVIO EMAIL A: ${email} per scadenza ${formattedDate}`);
    // Qui andrebbe la logica REALE di invio email con un servizio come Resend, SendGrid, etc.
    return Promise.resolve();
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const now = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(now.getMonth() + 1);

        const remindersRef = collection(db, 'reminders');
        const q = query(remindersRef, 
            where('status', '==', 'pending'), 
            where('reminderDate', '<=', Timestamp.fromDate(oneMonthFromNow))
        );
        
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return NextResponse.json({ message: 'Nessun promemoria da inviare.' });
        }
        
        const batch = writeBatch(db);
        const emailPromises: Promise<void>[] = [];

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const reminderDate = (data.reminderDate as Timestamp).toDate();
            
            // Invia l'email e aggiorna lo stato
            emailPromises.push(sendReminderEmail(data.email, reminderDate));
            batch.update(doc.ref, { status: 'sent' });
        });

        await Promise.all(emailPromises);
        await batch.commit();

        return NextResponse.json({ message: `Processati ${querySnapshot.size} promemoria.` });

    } catch (error) {
        console.error('Errore nel task di invio promemoria:', error);
        return NextResponse.json({ error: 'Errore interno del server.' }, { status: 500 });
    }
}

