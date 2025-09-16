
'use server'

import { initFirebaseAdmin } from '../firebase-admin'
import * as admin from 'firebase-admin'

initFirebaseAdmin();

export const updateUser = async (uid: string, data: { name: string; email: string; role: 'admin' | 'user' }) => {
  try {
    // Update Firebase Auth
    await admin.auth().updateUser(uid, {
      email: data.email,
      displayName: data.name,
    });

    // Update Firestore document
    const userDocRef = admin.firestore().collection('users').doc(uid);
    await userDocRef.update({
      name: data.name,
      email: data.email,
      role: data.role,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user (server action):", error);
    return { success: false, error: error.message };
  }
};

export const updatePassword = async (uid: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await admin.auth().updateUser(uid, {
      password: newPassword,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating password (server action):", error);
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (uid: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Deleting the user from Firebase Authentication will trigger functions
    // (if set up) to delete associated data, or we can do it manually here.
    await admin.auth().deleteUser(uid);
    // The client-side call will handle deleting the Firestore document.
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user (server action):", error);
    return { success: false, error: error.message };
  }
};
