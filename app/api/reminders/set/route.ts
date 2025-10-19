import { NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// --- Configurazione Firebase ---
// Le variabili d'ambiente verranno fornite dalla piattaforma di hosting (es. Vercel)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inizializza Firebase solo una volta
let app: App;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const db = getFirestore(app);

// --- Handler della Richiesta POST ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, reminderDate, vehicleType } = body;

    // --- Validazione dei dati ---
    if (!email || !reminderDate) {
      return NextResponse.json({ error: 'Email e data del promemoria sono obbligatori.' }, { status: 400 });
    }
    
    const reminderDateObj = new Date(reminderDate);
    if (isNaN(reminderDateObj.getTime())) {
        return NextResponse.json({ error: 'Formato data non valido.' }, { status: 400 });
    }

    // --- Salvataggio su Firestore ---
    await addDoc(collection(db, 'reminders'), {
      email,
      reminderDate: Timestamp.fromDate(reminderDateObj),
      vehicleType,
      status: 'pending', // Stato iniziale
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ message: 'Promemoria salvato con successo!' }, { status: 201 });

  } catch (error) {
    console.error('Errore API (Salvataggio Promemoria):', error);
    return NextResponse.json({ error: 'Errore interno del server.' }, { status: 500 });
  }
}
