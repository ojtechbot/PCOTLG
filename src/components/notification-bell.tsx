
"use client"

import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Bell, BellRing, Trash, X } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, writeBatch, deleteDoc, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSound } from "@/hooks/use-sound";

interface Notification {
    id: string;
    title: string;
    body: string;
    createdAt: { seconds: number, nanoseconds: number };
    read: boolean;
    link?: string;
    userId?: string | null;
}

type FilterType = "all" | "unread" | "read";
type SortType = "newest" | "oldest";

export function NotificationBell() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { playSound } = useSound();

    const [filter, setFilter] = useState<FilterType>("all");
    const [sort, setSort] = useState<SortType>("newest");

    useEffect(() => {
        if (!user) return;
    
        // This simplified query fetches notifications specifically for the logged-in user.
        // It's more efficient and doesn't require a complex composite index.
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
    
        let isFirstLoad = true;

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && !isFirstLoad) {
                    playSound('notification');
                }
            });

            const newNotifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
            setAllNotifications(newNotifs);
            
            if (isFirstLoad) {
                isFirstLoad = false;
            }
        }, (error) => {
            console.error("Error fetching notifications: ", error);
        });

        return () => unsubscribe();
    }, [user, playSound]);


    const filteredAndSortedNotifications = useMemo(() => {
        return allNotifications
            .filter(n => {
                if (filter === 'unread') return !n.read;
                if (filter === 'read') return n.read;
                return true;
            })
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
                return sort === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
            });
    }, [allNotifications, filter, sort]);
    
    const unreadCount = useMemo(() => allNotifications.filter(n => !n.read).length, [allNotifications]);

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.read) {
            const notifRef = doc(db, 'notifications', notif.id);
            await updateDoc(notifRef, { read: true });
        }
        if (notif.link) {
            router.push(notif.link);
        }
        setIsOpen(false);
    };

    const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation(); 
        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await deleteDoc(notificationRef);
             setAllNotifications(prev => prev.filter(n => n.id !== notificationId));
            toast({
                title: "Notification Removed",
                description: "The notification has been deleted.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete notification.",
            });
        }
    };

    const handleClearAll = async () => {
        if (!user) return;
        const notifsToDelete = filteredAndSortedNotifications;
        if(notifsToDelete.length === 0) return;

        const batch = writeBatch(db);
        notifsToDelete.forEach(n => {
            batch.delete(doc(db, 'notifications', n.id));
        });
        await batch.commit();

        toast({
            title: "Notifications Cleared",
            description: "All visible notifications have been removed.",
        });
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {unreadCount > 0 ? <BellRing className="h-5 w-5 text-primary animate-pulse" /> : <Bell className="h-5 w-5" />}
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[90vw] sm:w-96 p-0">
                <div className="p-3 border-b flex justify-between items-center">
                    <h4 className="font-medium text-sm">Notifications</h4>
                    {filteredAndSortedNotifications.length > 0 && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Clear All</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all
                                    currently visible notifications.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                <div className="p-2 border-b flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-semibold">Filter:</span>
                     <Button size="sm" variant={filter === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilter('all')} className="text-xs h-7">All</Button>
                    <Button size="sm" variant={filter === 'unread' ? 'secondary' : 'ghost'} onClick={() => setFilter('unread')} className="text-xs h-7">Unread</Button>
                    <Button size="sm" variant={filter === 'read' ? 'secondary' : 'ghost'} onClick={() => setFilter('read')} className="text-xs h-7">Read</Button>
                    <Separator orientation="vertical" className="h-4 mx-2" />
                    <span className="font-semibold">Sort:</span>
                    <Button size="sm" variant={sort === 'newest' ? 'secondary' : 'ghost'} onClick={() => setSort('newest')} className="text-xs h-7">Newest</Button>
                    <Button size="sm" variant={sort === 'oldest' ? 'secondary' : 'ghost'} onClick={() => setSort('oldest')} className="text-xs h-7">Oldest</Button>
                </div>
                <div className="space-y-1 py-2 max-h-80 overflow-y-auto">
                    {filteredAndSortedNotifications.length > 0 ? (
                        filteredAndSortedNotifications.map(notif => (
                            <div 
                                key={notif.id} 
                                className={cn(
                                    "px-4 py-2 hover:bg-secondary/50 cursor-pointer group relative",
                                    !notif.read && "bg-primary/10"
                                )}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100"
                                    onClick={(e) => handleDelete(e, notif.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                <p className={cn("font-semibold text-sm", !notif.read && "text-primary")}>
                                  {notif.title}
                                </p>
                                <p className="text-xs text-muted-foreground font-normal pr-6">{notif.body}</p>
                                <p className="text-xs text-muted-foreground mt-1 font-normal">
                                    {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt.seconds * 1000), { addSuffix: true }) : 'just now'}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center p-4">No notifications match your current filter.</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
