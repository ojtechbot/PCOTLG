
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { createNotification } from './notifications';
import { useEffect, useState } from 'react';

// Prayer Request Management
export interface PrayerRequest {
    id: string;
    name: string;
    request: string;
    createdAt: string;
    prayerCount: number;
    userId: string;
}

const prayerRequestsCollection = collection(db, 'prayerRequests');

export const addPrayerRequest = async (requestData: Omit<PrayerRequest, 'id' | 'createdAt' | 'prayerCount'>) => {
    const newDoc = await addDoc(prayerRequestsCollection, {
        ...requestData,
        prayerCount: 0,
        createdAt: serverTimestamp()
    });
    
    // Notify all users about the new prayer request
    await createNotification({
      title: "New Prayer Request",
      body: `${requestData.name} has submitted a new prayer request.`,
      link: "/prayer-network"
    });

    // The doc in the DB will have a server timestamp, but for immediate client-side update, we use ISO string
    return { ...requestData, id: newDoc.id, createdAt: new Date().toISOString(), prayerCount: 0 };
}

export const usePrayerRequests = () => {
    const [requests, setRequests] = useState<PrayerRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(prayerRequestsCollection, orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Firestore Timestamp to a string or Date object
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                } as PrayerRequest
            });
            setRequests(requestsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { requests, loading };
}

export const incrementPrayerCount = async (requestId: string) => {
    const requestRef = doc(db, 'prayerRequests', requestId);
    await updateDoc(requestRef, {
        prayerCount: increment(1)
    });
}
