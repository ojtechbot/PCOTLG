import * as admin from 'firebase-admin';

const getServiceAccount = () => {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const parsedJson = JSON.parse(serviceAccountJson);
      // The private key from an environment variable often has its newlines escaped.
      // We need to replace these escaped newlines with actual newline characters.
      parsedJson.private_key = parsedJson.private_key.replace(/\\n/g, '\n');
      return parsedJson;
    }
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
  }
  return null; 
};


export const initFirebaseAdmin = () => {
    if (!admin.apps.length) {
        const serviceAccount = getServiceAccount();
        if(serviceAccount) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
            } catch (error) {
                console.error("Firebase Admin SDK initialization error:", error);
            }
        } else {
            console.warn("Firebase Admin SDK not initialized. Missing or invalid FIREBASE_SERVICE_ACCOUNT_JSON. Server-side features will not work.");
        }
    }
};
