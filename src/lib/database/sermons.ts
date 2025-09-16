
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { z } from 'zod';
import { db } from '../firebase';
import { createNotification } from './notifications';


// Sermon Management
export const SermonSchema = z.object({
    id: z.string(),
    title: z.string(),
    speaker: z.string(),
    date: z.string(), // Changed to string to ensure serializability
    series: z.string().optional(),
    summary: z.string().optional(),
    scriptures: z.array(z.string()).optional(),
    discussionQuestions: z.array(z.string()).optional(),
    artworkUrl: z.string().url().optional(),
});
export type Sermon = z.infer<typeof SermonSchema>;

const sermonsCollection = collection(db, 'sermons');

export const addSermon = async (sermonData: Omit<Sermon, 'id'>) => {
    const newDoc = await addDoc(sermonsCollection, {
        ...sermonData,
        date: Timestamp.fromDate(new Date(sermonData.date)),
        createdAt: serverTimestamp()
    });
    
    await createNotification({
        title: "New Sermon Available",
        body: `A new sermon, "${sermonData.title}" by ${sermonData.speaker}, has been added to the library.`,
        link: "/sermons"
    });

    return { ...sermonData, id: newDoc.id };
}

export const updateSermon = async (sermonData: Partial<Sermon> & { id: string }) => {
    const sermonRef = doc(db, 'sermons', sermonData.id);
    const dataToUpdate: { [key: string]: any } = { ...sermonData };

    if (sermonData.date) {
        dataToUpdate.date = Timestamp.fromDate(new Date(sermonData.date));
    }

    await updateDoc(sermonRef, dataToUpdate);
    return dataToUpdate as Sermon;
}

export const deleteSermon = async (sermonId: string) => {
    const sermonRef = doc(db, 'sermons', sermonId);
    await deleteDoc(sermonRef);
};
