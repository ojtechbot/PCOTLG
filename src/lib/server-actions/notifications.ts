
'use server';

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { db } from '../firebase';
import { initFirebaseAdmin } from '../firebase-admin';
import { sendEmail } from '@/lib/email';
import { type User } from '@/hooks/use-auth';
import type { NotificationData } from '../database/notifications';

// Initialize Admin SDK to use server-side features like FCM
initFirebaseAdmin();

const sendNotificationEmail = async (user: User, data: NotificationData) => {
    // Check if the user wants email notifications (future feature)
    if (!user.email) return;

    try {
        await sendEmail({
            to: user.email,
            subject: data.title,
            heading: `Hello, ${user.name || 'friend'}!`,
            body: `<p>${data.body}</p>`,
            button: data.link ? { text: 'View Details', url: `${process.env.NEXT_PUBLIC_APP_URL || ''}${data.link}` } : undefined
        });
    } catch (emailError) {
        console.error(`Failed to send notification email to ${user.email}:`, emailError);
    }
}

const sendPushNotification = async (user: User & { fcmTokens?: string[] }, data: NotificationData) => {
    if (!user.fcmTokens || user.fcmTokens.length === 0) {
        return; // User has no tokens, can't send push
    }
    
    // Check if FCM is supported in the current environment
    const { getMessaging } = await import('firebase-admin/messaging');

    const messaging = getMessaging();
    const message = {
        notification: {
            title: data.title,
            body: data.body,
        },
        webpush: {
            notification: {
                icon: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png`,
            },
            fcmOptions: {
                link: data.link ? `${process.env.NEXT_PUBLIC_APP_URL}${data.link}` : process.env.NEXT_PUBLIC_APP_URL,
            },
        },
        tokens: user.fcmTokens,
    };

    try {
        const response = await messaging.sendEachForMulticast(message);
        console.log('Successfully sent push notification:', response);
        if (response.failureCount > 0) {
            console.error('Failed to send push notification to some devices:', response.responses);
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

/**
 * Handles sending email and push notifications to users.
 * This is a server-only function.
 */
export const sendNotificationToUser = async (data: NotificationData) => {
     try {
        if (data.userId) {
            // Send to a specific user
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            if (userDoc.exists()) {
                const user = userDoc.data() as User;
                await sendNotificationEmail(user, data);
                await sendPushNotification(user, data);
            }
        } else {
            // Send to all users (for global notifications like new blog posts)
            const usersSnapshot = await getDocs(collection(db, 'users'));
            for (const userDoc of usersSnapshot.docs) {
                const user = userDoc.data() as User;
                await sendNotificationEmail(user, data);
                await sendPushNotification(user, data);
            }
        }
    } catch (error) {
        console.error("Error sending user notifications:", error);
    }
}
