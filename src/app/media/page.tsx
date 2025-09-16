
"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Clapperboard } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout"
import PublicLayout from "@/app/(public)/layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { RsvpDialog } from "@/components/rsvp-dialog"
import { db } from "@/lib/firebase";
import { type ChurchEvent } from "@/lib/database/events";
import { useAuth } from "@/hooks/use-auth";


function MediaPageContent() {
    const [events, setEvents] = useState<ChurchEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);

    useEffect(() => {
      const q = query(collection(db, "events"), orderBy("date", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChurchEvent));
        setEvents(eventsData);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, []);

    return (
        <>
            <div className="flex-1 space-y-8 p-4 md:p-8">
                <div className="flex flex-col space-y-2">
                <h1 className="text-4xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
                    <Clapperboard className="w-10 h-10" />
                    Media Hub
                </h1>
                <p className="text-muted-foreground">
                    Watch live streams, browse past services, and engage with our media content.
                </p>
                </div>

                <HandDrawnSeparator className="stroke-current text-border/50" />
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading ? (
                    Array.from({length: 8}).map((_, i) => (
                        <Card key={i} className="border-border/50">
                            <Skeleton className="h-[200px] w-full" />
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))
                ) : events.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                        <Card className="border-border/50 text-center py-12">
                        <CardContent>
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">There are no upcoming events.</p>
                            <p className="text-sm text-muted-foreground">Check back soon for new announcements.</p>
                        </CardContent>
                        </Card>
                    </div>
                ) : (
                    events.map((event) => (
                        <Card key={event.id} className="border-border/50 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all overflow-hidden">
                            <div className="relative h-[200px] w-full">
                            <Image src={event.image} alt={event.title} layout="fill" className="object-cover" data-ai-hint="event photo" />
                            <div className="absolute bottom-0 bg-black/50 text-white p-2 w-full text-center font-bold">
                                {format(new Date(event.date), "MMM dd")}
                            </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl">{event.title}</CardTitle>
                                <CardDescription className="line-clamp-3">{event.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2"><Clock className="w-4 h-4"/>{format(new Date(event.date), 'p')}</p>
                                <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/>{event.location}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => setSelectedEvent(event)}>RSVP</Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
                </div>
            </div>
            {selectedEvent && <RsvpDialog event={selectedEvent} onOpenChange={() => setSelectedEvent(null)} />}
        </>
    );
}

export default function MediaHubPage() {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 space-y-4">
                     <Skeleton className="h-96 w-full" />
                </div>
            </DashboardLayout>
        )
    }

    const Layout = user ? DashboardLayout : PublicLayout;

    return (
        <Layout>
            <MediaPageContent />
        </Layout>
    )
}

    