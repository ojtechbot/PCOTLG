
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";

export interface LiveStream {
  title: string;
  description: string;
  isLive: boolean;
  streamUrl: string;
}

export const useLiveStream = () => {
    const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const liveStreamRef = doc(db, 'appState', 'liveStream');
        const unsubscribe = onSnapshot(liveStreamRef, (doc) => {
            if (doc.exists()) {
                setLiveStream(doc.data() as LiveStream);
            } else {
                setLiveStream(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching live stream state:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { liveStream, loading };
}

export const updateLiveStreamState = async (data: LiveStream) => {
    const liveStreamRef = doc(db, 'appState', 'liveStream');
    await setDoc(liveStreamRef, data, { merge: true });
};
