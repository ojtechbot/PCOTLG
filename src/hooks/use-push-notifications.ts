
"use client";

import { useEffect, useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app, db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from './use-toast';

export const usePushNotifications = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [permission, setPermission] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        // This hook should only run in browsers
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const getFCMToken = useCallback(async (): Promise<string | null> => {
        if (!user) return null;
        try {
            const messaging = getMessaging(app);
            const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

            if (!VAPID_KEY) {
                throw new Error("VAPID key is not configured in environment variables.");
            }

            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            
            if (token && user) {
                // Save the new token to Firestore
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    fcmTokens: arrayUnion(token)
                });
                console.log('FCM Token registered:', token);
            }
            return token;
        } catch (error) {
            console.error('An error occurred while retrieving token. ', error);
            return null;
        }
    }, [user]);

    const requestPermissionAndGetToken = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator) || !user) {
            return null;
        }

        if (Notification.permission === 'granted') {
            return await getFCMToken();
        }

        if (Notification.permission === 'denied') {
            toast({
                variant: "destructive",
                title: "Permission Denied",
                description: "You have blocked notifications. Please enable them in your browser settings.",
            });
            return null;
        }

        const permissionResult = await Notification.requestPermission();
        setPermission(permissionResult);
        if (permissionResult === 'granted') {
            return await getFCMToken();
        }

        return null;
    }, [user, getFCMToken, toast]);
    
    // Listen for foreground messages
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const messaging = getMessaging(app);
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log('Foreground message received.', payload);
                toast({
                    title: payload.notification?.title,
                    description: payload.notification?.body,
                });
            });
            return () => unsubscribe();
        }
    }, [toast]);


    return { requestPermissionAndGetToken, permission };
};
