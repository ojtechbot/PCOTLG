
"use client"

import { useEffect, useState, useRef, useCallback } from "react";
import { Send, LifeBuoy, MoreHorizontal, User } from "lucide-react";
import { format } from "date-fns";
import { debounce } from 'lodash';
import { useSearchParams } from 'next/navigation';


import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "@/lib/database/notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface SupportMessage {
  id: string;
  uid: string;
  name: string;
  photoURL: string;
  text: string;
  timestamp: any;
  isAdmin: boolean;
}

const getAdmins = async () => {
    // This now correctly queries the 'users' collection for admins.
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
}

function SupportChat() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const targetUid = searchParams.get('uid');

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [chatPartner, setChatPartner] = useState<{name: string, photoURL: string} | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const chatId = user?.role === 'admin' && targetUid ? targetUid : user?.uid;

  // --- Firestore Listeners ---
  useEffect(() => {
    if (!chatId) return;

    const fetchChatPartner = async () => {
        if(user?.role === 'admin' && targetUid) {
            const userDoc = await getDoc(doc(db, "users", targetUid));
            if(userDoc.exists()) {
                setChatPartner({name: userDoc.data().name, photoURL: userDoc.data().photoURL });
            }
        }
    }
    fetchChatPartner();
    
    // Listen for messages in the specific chat
    const chatRef = collection(db, "supportChats", chatId, "messages");
    const q = query(chatRef, orderBy("timestamp", "asc"));
    
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportMessage));
        setMessages(fetchedMessages);
        setIsLoading(false);
    });

    // Listen for typing status in the specific chat
    const typingRef = doc(db, "typingStatus", chatId);
    const unsubscribeTyping = onSnapshot(typingRef, (doc) => {
        if(doc.exists() && user) {
            const data = doc.data();
            delete data[user.uid]; // Filter out our own typing status
            setIsTyping(data);
        }
    });

    return () => {
        unsubscribeMessages();
        unsubscribeTyping();
    };
  }, [chatId, user, targetUid]);

  // --- Auto-scrolling ---
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isTyping]);


  // --- Typing Indicator Logic ---
  const sendTypingStatus = async (typing: boolean) => {
      if(!user || !chatId) return;
      const typingRef = doc(db, "typingStatus", chatId);
       try {
        await setDoc(typingRef, { [user.uid]: typing }, { merge: true });
      } catch (error) {
        console.error("Could not update typing status:", error);
      }
  };

  const debouncedStopTyping = useCallback(debounce(() => sendTypingStatus(false), 2000), [user, chatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    sendTypingStatus(true);
    debouncedStopTyping();
  }

  // --- Message Sending ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !user || !chatId) return;

    const messageText = newMessage;
    setNewMessage("");
    await sendTypingStatus(false);
    debouncedStopTyping.cancel();
    
    const chatRef = collection(db, "supportChats", chatId, "messages");
    await addDoc(chatRef, {
        uid: user.uid,
        name: user.name,
        photoURL: user.photoURL,
        text: messageText,
        timestamp: serverTimestamp(),
        isAdmin: user.role === 'admin'
    });

    // --- Send Notifications ---
    let recipients: { uid: string }[] = [];
    if(user.role === 'admin' && targetUid) {
        recipients = [{ uid: targetUid }]; // Admin sends to the specific user
    } else {
        recipients = await getAdmins(); // User sends to all admins
    }

    recipients.forEach(recipient => {
        if (recipient.uid !== user.uid) { // Don't send notification to self
             createNotification({
                userId: recipient.uid,
                title: `New Support Message from ${user.name}`,
                body: messageText,
                link: `/support${user.role !== 'admin' ? `?uid=${user.uid}` : ''}`
            });
        }
    });
  };
  
  const typingUsers = Object.keys(isTyping).filter(uid => isTyping[uid]);

  const headerTitle = user?.role === 'admin' && chatPartner ? `Chat with ${chatPartner.name}` : "Support Chat";
  const headerDescription = user?.role === 'admin' && targetUid ? `User ID: ${targetUid}` : "Have a question or need help? Chat with an admin directly.";


  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
             {user?.role === 'admin' && chatPartner ? <User className="w-10 h-10" /> : <LifeBuoy className="w-10 h-10" />}
             {headerTitle}
          </h1>
          <p className="text-muted-foreground">
            {headerDescription}
          </p>
        </div>

        <HandDrawnSeparator className="stroke-current text-border/50" />
        
        <div className="h-[60vh] flex flex-col max-w-4xl mx-auto w-full border rounded-lg">
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-6">
                {isLoading ? (
                    Array.from({length: 4}).map((_, i) => (
                        <div key={i} className={`flex items-start gap-4 ${i % 2 === 0 ? '' : 'justify-end'}`}>
                            {i % 2 === 0 && <Skeleton className="w-10 h-10 rounded-full" />}
                            <div className="flex-1 max-w-[70%] space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            {i % 2 !== 0 && <Skeleton className="w-10 h-10 rounded-full" />}
                        </div>
                    ))
                ) : messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-4 ${msg.uid === user?.uid ? 'justify-end' : ''}`}>
                         {msg.uid !== user?.uid && (
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={msg.photoURL || `https://placehold.co/40x40.png`} data-ai-hint="portrait" />
                                <AvatarFallback>{msg.name?.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                         )}
                        <div className={`flex-1 max-w-[70%] ${msg.uid === user?.uid ? 'text-right' : ''}`}>
                            <div className={`flex items-baseline gap-2 ${msg.uid === user?.uid ? 'justify-end' : ''}`}>
                                <p className="font-semibold">{msg.name} {msg.isAdmin && <span className="text-xs text-primary">(Admin)</span>}</p>
                                <p className="text-xs text-muted-foreground">
                                    {msg.timestamp ? format(msg.timestamp.toDate(), 'p, MMM dd') : 'sending...'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg mt-1 inline-block ${msg.uid === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="whitespace-pre-wrap text-left">{msg.text}</p>
                            </div>
                        </div>
                         {msg.uid === user?.uid && (
                             <Avatar className="w-10 h-10">
                                <AvatarImage src={msg.photoURL || `https://placehold.co/40x40.png`} data-ai-hint="portrait" />
                                <AvatarFallback>{msg.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                         )}
                    </div>
                ))}
                {typingUsers.length > 0 && (
                    <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                            <AvatarFallback><MoreHorizontal className="animate-pulse"/></AvatarFallback>
                        </Avatar>
                         <div className="p-3 rounded-lg mt-1 inline-block bg-muted">
                            <p className="text-sm text-muted-foreground italic">Typing...</p>
                        </div>
                    </div>
                )}
                {!isLoading && messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-16">
                        <p>No messages yet.</p>
                        <p className="text-sm">Send a message to start the conversation.</p>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                    <Input
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={!chatId}
                    />
                    <Button type="submit" size="icon" disabled={!chatId || !newMessage.trim()}>
                        <Send className="w-4 h-4" />
                        <span className="sr-only">Send Message</span>
                    </Button>
                </form>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SupportPageWrapper() {
    return (
        <SupportChat />
    );
}

    