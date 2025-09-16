
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Preloader } from '@/components/preloader';
import { doc, onSnapshot } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  lastLogin?: string;
  createdAt: any;
  fcmTokens?: string[];
  // Extended profile fields
  bio?: string;
  dob?: string;
  country?: string;
  phone?: string;
  state?: string;
  zip?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is logged in via Firebase Auth, now listen for Firestore doc
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
              const firestoreData = docSnap.data();
              // Create a stable, complete user object by combining auth and firestore data
              const completeUser: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firestoreData.name || firebaseUser.displayName, // Prioritize Firestore name
                  photoURL: firestoreData.photoURL || firebaseUser.photoURL, // Prioritize Firestore photo
                  role: firestoreData.role || 'user',
                  createdAt: firestoreData.createdAt,
                  ...firestoreData
              };
              setUser(completeUser);
          } else {
             // Firestore doc doesn't exist yet, which can happen right after signup.
             // We create a temporary user object from auth data and wait for the doc to be created.
             setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: 'user',
                createdAt: new Date().toISOString()
             });
          }
          setLoading(false);
        }, (error) => {
            console.error("Firestore snapshot error:", error);
            // If Firestore fails, still provide basic user data from Auth
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: 'user',
                createdAt: new Date().toISOString()
            });
            setLoading(false);
        });

        return () => unsubscribeFirestore();

      } else {
        // User is logged out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? <Preloader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
