
import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Affiliate {
    id: string;
    name: string;
    location: string;
}

const affiliatesCollection = collection(db, 'affiliates');

export const getAffiliates = async (): Promise<Affiliate[]> => {
    const q = query(affiliatesCollection, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Affiliate));
}
