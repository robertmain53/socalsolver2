import { NextResponse } from 'next/server';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'; // Correzione qui: App -> FirebaseApp
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inizializza Firebase solo una volta
let app: FirebaseApp; // Correzione qui: App -> FirebaseApp
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, reminderDate, vehicleType } = body;

    if (!email || !reminderDate) {
      return NextResponse.json({ error: 'Email e data del promemoria sono obbligatori.' }, { status: 400 });
    }
    
    const reminderDateObj = new Date(reminderDate);
    if (isNaN(reminderDateObj.getTime())) {
        return NextResponse.json({ error: 'Formato data non valido.' }, { status: 400 });
    }

    await addDoc(collection(db, 'reminders'), {
      email,
      reminderDate: Timestamp.fromDate(reminderDateObj),
      vehicleType,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ message: 'Promemoria salvato con successo!' }, { status: 201 });

  } catch (error) {
    console.error('Errore API (Salvataggio Promemoria):', error);
    return NextResponse.json({ error: 'Errore interno del server.' }, { status: 500 });
  }
}

