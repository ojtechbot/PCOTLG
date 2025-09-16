
"use client";

import {
  Briefcase,
  HeartHandshake,
  Sprout,
  Users,
  BookOpen,
  MapPin,
  Calendar,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { PrayerRequestForm } from "@/components/prayer-request-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, onSnapshot, getDocs } from "firebase/firestore";
import type { SacredSpace } from "@/lib/database/community";
import type { Opportunity } from "@/lib/database/community";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyVerseCard } from "@/components/daily-verse-card";


export default function DashboardPage() {
    const { user } = useAuth();
    const [prayerRequestsCount, setPrayerRequestsCount] = useState(0);
    const [communityGroupsCount, setCommunityGroupsCount] = useState(0);
    const [sermonsCount, setSermonsCount] = useState(0);
    const [eventsCount, setEventsCount] = useState(0);
    const [ministryOpportunities, setMinistryOpportunities] = useState<Opportunity[]>([]);
    const [sacredSpaces, setSacredSpaces] = useState<SacredSpace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        
        // --- Single Firestore Read for initial counts ---
        const fetchInitialCounts = async () => {
            const [groupsSnapshot, sermonsSnapshot, eventsSnapshot] = await Promise.all([
                getDocs(collection(db, "communityGroups")),
                getDocs(collection(db, "sermons")),
                getDocs(collection(db, "events")),
            ]);
            setCommunityGroupsCount(groupsSnapshot.size);
            setSermonsCount(sermonsSnapshot.size);
            setEventsCount(eventsSnapshot.size);
        };
        fetchInitialCounts();

        // --- Real-time Firestore Listeners ---
        const prayerQuery = query(collection(db, "prayerRequests"), where("userId", "==", user.uid));
        const ministryQuery = query(collection(db, "ministryOpportunities"), limit(2));
        const spacesQuery = query(collection(db, "sacredSpaces"), limit(2));

        const unsubPrayer = onSnapshot(prayerQuery, (snap) => setPrayerRequestsCount(snap.size));
        const unsubMinistry = onSnapshot(ministryQuery, (snap) => {
            setMinistryOpportunities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity)));
        });
        const unsubSpaces = onSnapshot(spacesQuery, (snap) => {
            setSacredSpaces(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SacredSpace)));
            setLoading(false); // Set loading to false after the last query snapshot
        });
        
        return () => {
            unsubPrayer();
            unsubMinistry();
            unsubSpaces();
        };

    }, [user]);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
            Welcome, {user?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's a snapshot of your spiritual journey and community engagement.
          </p>
        </div>

        <HandDrawnSeparator className="stroke-current text-border/50" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Prayer Requests
              </CardTitle>
              <HeartHandshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prayerRequestsCount}</div>
              <p className="text-xs text-muted-foreground">
                Requests you've submitted.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Community Groups
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityGroupsCount}</div>
               <p className="text-xs text-muted-foreground">
                Active groups in the church.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventsCount}</div>
              <p className="text-xs text-muted-foreground">
                Total scheduled events.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sermon Library
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sermonsCount}</div>
              <p className="text-xs text-muted-foreground">
                Total available sermons.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Column */}
            <div className="flex-1 space-y-8">
                <DailyVerseCard />
                 <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-background to-secondary/20">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full border-2 border-primary/30">
                            <HeartHandshake className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-2xl">
                            Dynamic Prayer Network
                            </CardTitle>
                            <CardDescription>
                            Let our AI help you find prayer partners for your journey.
                            </CardDescription>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <PrayerRequestForm />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Engagement Overview</CardTitle>
                        <CardDescription>
                        Your activity in the last 6 months.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EngagementChart />
                    </CardContent>
                </Card>
            </div>
            {/* Sidebar Column */}
            <div className="w-full xl:w-96 space-y-8 flex-shrink-0">
                 <Card className="border-border/50">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full border-2 border-primary/30">
                            <Briefcase className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-2xl">
                            Ministry Opportunities
                            </CardTitle>
                            <CardDescription>
                            Use your gifts to serve the community.
                            </CardDescription>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? <Skeleton className="h-24 w-full"/> : ministryOpportunities.map((opp, index) => (
                            <div key={index} className="flex items-start gap-4 hover:bg-secondary/20 p-2 rounded-lg transition-colors">
                            <Image
                                src={opp.image}
                                alt={opp.title}
                                data-ai-hint={opp.imageHint}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover"
                            />
                            <div>
                                <h3 className="font-semibold">{opp.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                {opp.description}
                                </p>
                                <Badge variant="outline" className="mt-2 border-primary/50 text-primary">
                                    Compatibility: {opp.compatibility}%
                                </Badge>
                            </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/ministry">View All Opportunities</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full border-2 border-primary/30">
                            <MapPin className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-2xl">
                            Sacred Spaces
                            </CardTitle>
                            <CardDescription>
                            Find a quiet place for prayer and reflection.
                            </CardDescription>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? <Skeleton className="h-16 w-full"/> : sacredSpaces.map((space) => (
                            <div key={space.id} className="hover:bg-secondary/20 p-2 rounded-lg transition-colors">
                                <h3 className="font-semibold">{space.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                {space.status}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
