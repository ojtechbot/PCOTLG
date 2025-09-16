
'use server';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { initFirebaseAdmin } from '../firebase-admin';
import * as admin from 'firebase-admin';

/**
 * Fetches a user document by email from Firestore.
 * This function uses the Admin SDK and should only be called from the server.
 * @param email The user's email address.
 * @returns The user data or null if not found.
 */
export const getUserByEmail = async (email: string) => {
    initFirebaseAdmin();
    const usersRef = admin.firestore().collection('users');
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return null;
    }
    
    // Assuming email is unique, return the first result
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
};
