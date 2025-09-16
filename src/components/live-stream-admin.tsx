
"use client"

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Video, VideoOff } from "lucide-react";
import { createNotification } from "@/lib/database/notifications";
import { useLiveStream, updateLiveStreamState } from "@/lib/database/live";

export function LiveStreamAdmin() {
    const { liveStream, loading: isComponentLoading } = useLiveStream();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [streamUrl, setStreamUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if(liveStream) {
            setTitle(liveStream.title || "");
            setDescription(liveStream.description || "");
            setStreamUrl(liveStream.streamUrl || "");
        }
    }, [liveStream])

    const handleUpdateStreamState = async (liveState: boolean) => {
        if (!title || !streamUrl) {
            toast({ variant: "destructive", title: "Title and Stream URL are required" });
            return;
        }
        setIsLoading(true);
        try {
            await updateLiveStreamState({
                title,
                description,
                streamUrl,
                isLive: liveState,
            });

            if (liveState) {
                toast({ title: "Stream Started!", description: "Your live stream is now active." });
                 await createNotification({
                    title: `🔴 Live Now: ${title}`,
                    body: description || "Join us for our live broadcast!",
                    link: '/live'
                });
            } else {
                toast({ title: "Stream Stopped", description: "The live stream has been ended." });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Failed to update stream state." });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSendNotification = async () => {
        if (!title || !liveStream?.isLive) {
             toast({ variant: "destructive", title: "A live stream must be active to send a notification." });
            return;
        }
        setIsLoading(true);
        try {
            await createNotification({
                title: `🔴 Live Now: ${title}`,
                body: description || "Join us for our live broadcast!",
                link: '/live'
            });
            toast({ title: "Notification Sent!", description: "All users have been notified about the live stream." });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Failed to send notification." });
        } finally {
            setIsLoading(false);
        }
    };

    if (isComponentLoading) {
        return <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin" /></div>;
    }


    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="stream-title">Stream Title</Label>
                <Input 
                    id="stream-title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Sunday Morning Service"
                />
            </div>
            <div>
                <Label htmlFor="stream-url">YouTube Stream URL</Label>
                <Input 
                    id="stream-url" 
                    value={streamUrl} 
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                />
            </div>
            <div>
                <Label htmlFor="stream-description">Stream Description</Label>
                <Textarea 
                    id="stream-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Join Pastor Mike for a sermon on..."
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                {liveStream?.isLive ? (
                     <Button onClick={() => handleUpdateStreamState(false)} disabled={isLoading} className="w-full" variant="destructive">
                        {isLoading ? <Loader2 className="animate-spin" /> : <VideoOff className="mr-2" />}
                        Stop Stream
                    </Button>
                ) : (
                    <Button onClick={() => handleUpdateStreamState(true)} disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Video className="mr-2" />}
                        Start Stream
                    </Button>
                )}
               
                <Button onClick={handleSendNotification} variant="outline" disabled={isLoading || !liveStream?.isLive} className="w-full">
                     {isLoading ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />}
                    Send Notification
                </Button>
            </div>
        </div>
    );
}
