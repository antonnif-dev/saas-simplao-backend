import * as admin from "firebase-admin";

// Inicializa com credenciais de serviço para acesso total ao Firestore
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();
export const auth = admin.auth();