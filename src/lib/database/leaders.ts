
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Leader {
    id: string;
    name: string;
    title: string;
    bio: string;
    image: string;
    imageHint: string;
    order: number;
    createdAt?: string; // Add optional createdAt string
}

const leadersCollection = collection(db, 'leaders');

export const getLeaders = async (num?: number): Promise<Leader[]> => {
    let q;
    if (num) {
        q = query(leadersCollection, orderBy("order", "asc"), limit(num));
    } else {
        q = query(leadersCollection, orderBy("order", "asc"));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Timestamp to string if it exists
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined;
        return { 
            id: doc.id, 
            ...data,
            createdAt
        } as Leader;
    });
}

export const addLeader = async (leaderData: Omit<Leader, 'id'>) => {
    const newDoc = await addDoc(leadersCollection, {
        ...leaderData,
        createdAt: serverTimestamp()
    });
    return { ...leaderData, id: newDoc.id };
}

export const updateLeader = async (leaderData: Partial<Leader> & { id: string }) => {
    const leaderRef = doc(db, 'leaders', leaderData.id);
    await updateDoc(leaderRef, leaderData);
    return leaderData as Leader;
}

export const deleteLeader = async (leaderId: string) => {
    const leaderRef = doc(db, 'leaders', leaderId);
    await deleteDoc(leaderRef);
};
