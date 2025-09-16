
import { cookies } from 'next/headers';
import { initFirebaseAdmin } from './firebase-admin';
import * as admin from 'firebase-admin';
import { User } from '@/hooks/use-auth';

// Initialize Firebase Admin SDK
initFirebaseAdmin();

export async function getAuthenticatedUser(): Promise<User | null> {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // Verify the session cookie. This will also decode the claims.
    const decodedIdToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    // Fetch the corresponding user document from Firestore to get additional details like role.
    const userDocRef = admin.firestore().doc(`users/${decodedIdToken.uid}`);
    const userDoc = await userDocRef.get();

    let firestoreData: admin.firestore.DocumentData = {};
    if (userDoc.exists) {
        firestoreData = userDoc.data() || {};
    }

    // Ensure Timestamps are converted to serializable ISO strings
    const createdAt = firestoreData.createdAt?.toDate ? firestoreData.createdAt.toDate().toISOString() : new Date().toISOString();
    const lastLogin = firestoreData.lastLogin?.toDate ? firestoreData.lastLogin.toDate().toISOString() : null;

    // Combine data from the auth token and Firestore, prioritizing Firestore data where available.
    const user: User = {
        uid: decodedIdToken.uid,
        email: decodedIdToken.email || null, // Auth email is the source of truth
        name: firestoreData.name || decodedIdToken.name || null, // Firestore can override name
        photoURL: firestoreData.photoURL || decodedIdToken.picture || null, // Firestore can override photo
        role: firestoreData.role || 'user', // Firestore is source of truth for role
        createdAt: createdAt,
        lastLogin: lastLogin,
        bio: firestoreData.bio || "",
        dob: firestoreData.dob || undefined,
        country: firestoreData.country || "",
        phone: firestoreData.phone || "",
        state: firestoreData.state || "",
        zip: firestoreData.zip || "",
    };

    return user;

  } catch (error) {
    console.error('Error verifying session cookie or fetching user data:', error);
    // In case of error (e.g., expired cookie or DB issue), return null
    return null;
  }
}
