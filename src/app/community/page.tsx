
"use client"

import Image from "next/image";
import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { JoinGroupDialog } from "@/components/join-group-dialog";
import { useEffect, useState } from "react";
import { RsvpDialog } from "@/components/rsvp-dialog";
import { type CommunityGroup } from "@/lib/database/community";
import { type ChurchEvent } from "@/lib/database/events";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";


export default function CommunityPage() {
  const { user } = useAuth();
  const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<ChurchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);

  useEffect(() => {
    const qGroups = query(collection(db, "communityGroups"), orderBy("name"));
    const unsubscribeGroups = onSnapshot(qGroups, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityGroup));
      setCommunityGroups(groupsData);
      setIsLoading(false);
    });

    const qEvents = query(collection(db, "events"), orderBy("date", "asc"), limit(3));
    const unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChurchEvent));
        setUpcomingEvents(eventsData);
        setIsLoadingEvents(false);
    });


    return () => {
        unsubscribeGroups();
        unsubscribeEvents();
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
            Community Hub
          </h1>
          <p className="text-muted-foreground">
            Find your people, get involved, and grow together.
          </p>
        </div>

        <HandDrawnSeparator className="stroke-current text-border/50" />
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <h2 className="font-headline text-3xl text-primary">Find Your Group</h2>
                <div className="grid gap-8 md:grid-cols-2">
                    {isLoading ? (
                      Array.from({length: 4}).map((_, i) => (
                        <Card key={i}>
                          <Skeleton className="h-[200px] w-full" />
                          <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full mt-2" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-8 w-1/2" />
                          </CardContent>
                        </Card>
                      ))
                    ) : communityGroups.length === 0 ? (
                         <div className="md:col-span-2 text-center">
                            <Card className="py-12">
                                <Users className="w-12 h-12 mx-auto text-muted-foreground"/>
                                <p className="mt-4 text-muted-foreground">No community groups available at this time.</p>
                            </Card>
                        </div>
                    ) : (
                        communityGroups.map(group => (
                            <Card key={group.name} className="flex flex-col border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all">
                                <Image src={group.image} alt={group.name} width={600} height={400} className="object-cover h-[200px]" data-ai-hint={group.imageHint} />
                                <CardHeader>
                                    <CardTitle className="font-headline">{group.name}</CardTitle>
                                    <CardDescription>{group.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-end">
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4"/>
                                            <span>{group.memberCount} Members</span>
                                        </div>
                                        <Button onClick={() => setSelectedGroup(group)}>Join</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="font-headline text-3xl text-primary">Upcoming Events</h2>
                 <Card className="border-border/50">
                     <CardContent className="p-0">
                         <div className="divide-y divide-border/50">
                         {isLoadingEvents ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start">
                                    <div className="flex-grow space-y-2">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-1/3" />
                                    </div>
                                    <Skeleton className="h-10 w-20" />
                                </div>
                            ))
                         ) : upcomingEvents.length > 0 ? (
                            upcomingEvents.map(event => (
                                <div key={event.id} className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start hover:bg-secondary/20 transition-colors">
                                    <div>
                                        <h3 className="font-semibold text-lg">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4" /> {format(new Date(event.date), 'PPPP p')}
                                        </p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                           <MapPin className="w-4 h-4" /> {event.location}
                                        </p>
                                    </div>
                                    {user ? (
                                        <Button variant="outline" className="mt-2 md:mt-0" onClick={() => setSelectedEvent(event)}>RSVP</Button>
                                    ) : (
                                        <Button variant="outline" asChild className="mt-2 md:mt-0"><Link href="/login">Login to RSVP</Link></Button>
                                    )}
                                </div>
                            ))
                         ) : (
                            <div className="p-8 text-center">
                                <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">No upcoming events right now.</p>
                            </div>
                         )}
                         </div>
                     </CardContent>
                     {upcomingEvents.length > 0 && (
                        <CardFooter className="pt-6">
                            <Button asChild variant="link" className="mx-auto">
                                <Link href="/events">View All Events</Link>
                            </Button>
                        </CardFooter>
                     )}
                 </Card>
            </div>
        </div>
      </div>
      {selectedGroup && <JoinGroupDialog group={selectedGroup} onOpenChange={() => setSelectedGroup(null)} />}
      {selectedEvent && <RsvpDialog event={selectedEvent} onOpenChange={() => setSelectedEvent(null)} />}
    </DashboardLayout>
  );
}
