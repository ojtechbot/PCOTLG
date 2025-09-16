
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

export const ChurchEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string(), // Changed to string
  location: z.string(),
  image: z.string().url(),
});

export type ChurchEvent = z.infer<typeof ChurchEventSchema>;


const eventsCollection = collection(db, 'events');

export const addEvent = async (eventData: Omit<ChurchEvent, 'id'>) => {
    const newDoc = await addDoc(eventsCollection, {
        ...eventData,
        date: Timestamp.fromDate(new Date(eventData.date)),
        createdAt: serverTimestamp()
    });
    return { ...eventData, id: newDoc.id };
}

export const updateEvent = async (eventData: Partial<ChurchEvent> & { id: string }) => {
    const eventRef = doc(db, 'events', eventData.id);
    const dataToUpdate: { [key: string]: any } = { ...eventData };
    if (eventData.date) {
        dataToUpdate.date = Timestamp.fromDate(new Date(eventData.date));
    }
    await updateDoc(eventRef, dataToUpdate);
    return dataToUpdate as ChurchEvent;
}

export const deleteEvent = async (eventId: string) => {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
};
