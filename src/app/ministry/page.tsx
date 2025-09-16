
"use client"

import Image from "next/image";
import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Heart, Lightbulb, Users, Briefcase } from "lucide-react";
import { ApplyMinistryDialog } from "@/components/apply-ministry-dialog";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import type { Opportunity } from "@/lib/database/community";

const userSkills = ["Gardening", "Public Speaking", "Mentorship"];

export default function MinistryPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    const q = query(collection(db, "ministryOpportunities"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const oppsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        setOpportunities(oppsData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching opportunities:", error);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
            Ministry Opportunities
          </h1>
          <p className="text-muted-foreground">
            Use your God-given gifts to love and serve others.
          </p>
        </div>

        <HandDrawnSeparator className="stroke-current text-border/50" />

        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
                <h2 className="font-headline text-3xl text-primary">Find Your Fit</h2>
                <div className="grid gap-8 md:grid-cols-2">
                    {isLoading ? (
                        Array.from({length: 4}).map((_, i) => (
                           <Card key={i}><Skeleton className="h-96 w-full" /></Card>
                        ))
                    ) : opportunities.length === 0 ? (
                        <div className="md:col-span-2 text-center">
                            <Card className="py-12">
                                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground"/>
                                <p className="mt-4 text-muted-foreground">No ministry opportunities available at this time.</p>
                            </Card>
                        </div>
                    ) : (
                        opportunities.map(opp => (
                            <Card key={opp.id} className="flex flex-col border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all">
                                 <Image src={opp.image} alt={opp.title} width={600} height={400} className="object-cover" data-ai-hint={opp.imageHint} />
                                 <CardHeader>
                                    <CardTitle className="font-headline">{opp.title}</CardTitle>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {opp.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                 </CardHeader>
                                 <CardContent className="flex-grow flex flex-col">
                                    <p className="text-muted-foreground mb-4 line-clamp-3">{opp.description}</p>
                                    <div className="mt-auto">
                                        <p className="text-sm font-semibold text-primary">Compatibility: {opp.compatibility}%</p>
                                        <div className="w-full bg-secondary rounded-full h-2.5 mt-1">
                                            <div className="bg-primary h-2.5 rounded-full" style={{width: `${opp.compatibility}%`}}></div>
                                        </div>
                                        <Button className="w-full mt-4" onClick={() => setSelectedOpportunity(opp)}>Learn More & Apply</Button>
                                    </div>
                                 </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
            <div className="space-y-8">
                <h2 className="font-headline text-3xl text-primary">Your Profile</h2>
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>Spiritual Gifts Profile</CardTitle>
                        <CardDescription>Discover how you're uniquely wired to serve.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Top Gift: Service</h3>
                            <p className="text-sm text-muted-foreground">You find joy in meeting the practical needs of others.</p>
                        </div>
                         <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /> Your Skills:</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground list-none pl-2">
                               {userSkills.map(skill => (
                                <li key={skill} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {skill}</li>
                               ))}
                            </ul>
                        </div>
                        <Button className="w-full mt-2">Retake Assessment</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
      {selectedOpportunity && <ApplyMinistryDialog opportunity={selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)} />}
    </DashboardLayout>
  );
}
