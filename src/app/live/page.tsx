
"use client"

import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoPlayer } from "@/components/video-player";
import { ChatBox } from "@/components/chat-box";
import { Loader2, Clapperboard } from "lucide-react";
import type { LiveStream } from "@/lib/database/live";

export default function LivePage() {
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
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full border-2 border-primary/30">
            <Clapperboard className={`w-8 h-8 ${liveStream?.isLive ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
          </div>
          <div>
            <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
              Live Stream
            </h1>
            <p className="text-muted-foreground">
              Join us for live services, events, and special announcements.
            </p>
          </div>
        </div>

        <HandDrawnSeparator className="stroke-current text-border/50" />

        {liveStream?.isLive ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{liveStream.title}</CardTitle>
                            <CardDescription>{liveStream.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VideoPlayer streamUrl={liveStream.streamUrl} />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Live Chat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChatBox />
                        </CardContent>
                    </Card>
                </div>
            </div>
        ) : (
            <Card className="text-center py-20 border-border/50">
                <CardContent>
                    <Clapperboard className="w-24 h-24 mx-auto text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-headline font-semibold text-primary">We're Not Live Right Now</h2>
                    <p className="mt-2 text-muted-foreground">Please check the schedule for our next broadcast. We look forward to seeing you!</p>
                </CardContent>
            </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
