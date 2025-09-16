
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { createNotification } from './notifications';

export interface Donation {
    id: string;
    userId: string | null;
    userName: string;
    userEmail: string;
    amount: number;
    fund: string;
    date: string; // ISO string
}

const donationsCollection = collection(db, 'donations');

export const addDonation = async (data: Omit<Donation, 'id' | 'date'>) => {
    const docRef = await addDoc(donationsCollection, {
        ...data,
        date: serverTimestamp(),
    });

    // Notify the user if they are logged in
    if (data.userId) {
        await createNotification({
            userId: data.userId,
            title: 'Donation Received!',
            body: `Thank you for your generous gift of $${data.amount.toFixed(2)}. May God bless you!`,
            link: '/settings',
        });
    }

    return { ...data, id: docRef.id, date: new Date().toISOString() };
}

export const getDonationsForUser = async (userId: string): Promise<Donation[]> => {
    const q = query(
        donationsCollection, 
        where("userId", "==", userId), 
        orderBy("date", "desc"),
        limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as any).toDate().toISOString(),
    } as Donation));
}

export const getAllDonations = async (): Promise<Donation[]> => {
    const q = query(donationsCollection, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as any).toDate().toISOString(),
    } as Donation));
};

export const getTotalDonations = async (): Promise<number> => {
    const snapshot = await getDocs(donationsCollection);
    return snapshot.docs.reduce((total, doc) => total + doc.data().amount, 0);
}
