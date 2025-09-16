
"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import { DashboardLayout } from "@/components/dashboard-layout"
import PublicLayout from "@/app/(public)/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { db } from "@/lib/firebase";
import { type Sermon } from "@/lib/database/sermons";
import { HandDrawnSeparator } from "@/components/icons";
import { BookOpen, Calendar, User, Tag, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SermonDetailDialog } from "@/components/sermon-detail-dialog";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

function TeachingsPageContent() {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);

    useEffect(() => {
      const q = query(collection(db, "sermons"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sermonsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sermon));
        setSermons(sermonsData);
        setIsLoading(false);
      }, (error) => {
          console.error("Error fetching sermons:", error);
          setIsLoading(false);
      });
      return () => unsubscribe();
    }, []);

    return (
        <>
            <div className="flex-1 space-y-8 p-4 md:p-8">
                <div className="flex flex-col space-y-2">
                <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
                    Teachings & Articles
                </h1>
                <p className="text-muted-foreground">
                    Browse our collection of past sermons and teachings.
                </p>
                </div>

                <HandDrawnSeparator className="stroke-current text-border/50" />
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({length: 6}).map((_, i) => (
                        <Card key={i} className="border-border/50">
                            <Skeleton className="h-40 w-full" />
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </CardContent>
                        </Card>
                    ))
                ) : sermons.length === 0 ? (
                    <div className="md:col-span-3">
                        <Card className="border-border/50 text-center py-12">
                        <CardContent>
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">The sermon library is currently empty.</p>
                            <p className="text-sm text-muted-foreground">Check back soon for new content.</p>
                        </CardContent>
                        </Card>
                    </div>
                ) : (
                    sermons.map((sermon) => (
                        <Card key={sermon.id} className="border-border/50 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelectedSermon(sermon)}>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-headline text-xl">{sermon.title}</CardTitle>
                                {sermon.series && <CardDescription className="flex items-center gap-2 pt-1"><Tag className="w-4 h-4"/>{sermon.series}</CardDescription>}
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                                    {sermon.artworkUrl ? (
                                        <Image src={sermon.artworkUrl} alt={sermon.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-10 h-10 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col items-start text-sm text-muted-foreground pt-4">
                                <p className="flex items-center gap-2"><User className="w-4 h-4"/>{sermon.speaker}</p>
                                <p className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{new Date(sermon.date).toLocaleDateString()}</p>
                            </CardFooter>
                        </Card>
                    ))
                )}
                </div>
            </div>
            {selectedSermon && <SermonDetailDialog sermon={selectedSermon} onOpenChange={() => setSelectedSermon(null)} />}
        </>
    );
}


export default function TeachingsPage() {
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
            <TeachingsPageContent />
        </Layout>
    )
}

    