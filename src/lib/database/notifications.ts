
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  query,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { sendNotificationToUser } from '../server-actions/notifications';


export interface NotificationData {
    title: string;
    body: string;
    link?: string;
    userId?: string | null; // Optional: To target a specific user
}


export const createNotification = async (data: NotificationData) => {
    const notificationsRef = collection(db, 'notifications');
    try {
        if (data.userId === undefined) {
             // Global notification: Fetch all users
            const usersSnapshot = await getDocs(collection(db, "users"));
            const batch = writeBatch(db);
            usersSnapshot.forEach(userDoc => {
                const docData = {
                    ...data,
                    userId: userDoc.id, // Assign to each user
                    read: false,
                    createdAt: serverTimestamp(),
                };
                const newNotifRef = doc(collection(db, 'notifications'));
                batch.set(newNotifRef, docData);
            });
            await batch.commit();

        } else if (data.userId) {
            // Send to a specific user
            const docData = {
                ...data,
                read: false,
                createdAt: serverTimestamp(),
            };
            await addDoc(notificationsRef, docData);
        }

    } catch (error) {
        console.error("Error creating notification record:", error);
        throw error; // Re-throw to be handled by the caller
    }
};

export const deleteNotification = async (notificationId: string) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
};

export const deleteAllNotificationsForUser = async (userId: string) => {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}
