
"use client"

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Mail } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: { seconds: number; nanoseconds: number; } | null;
}

export default function AdminSubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "subscribers"), orderBy("subscribedAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subscribersData = snapshot.docs.map(doc => ({
                id: doc.id,
                email: doc.data().email,
                subscribedAt: doc.data().subscribedAt,
            } as Subscriber));
            setSubscribers(subscribersData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching subscribers:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Newsletter Subscribers</CardTitle>
                    <CardDescription>
                        A list of all users subscribed to the newsletter.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : subscribers.length === 0 ? (
                        <div className="text-center py-12">
                            <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No subscribers yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Once users subscribe, their emails will appear here.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Subscription Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscribers.map((subscriber) => (
                                    <TableRow key={subscriber.id}>
                                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                                        <TableCell className="text-right">
                                            {subscriber.subscribedAt ? format(new Date(subscriber.subscribedAt.seconds * 1000), 'PPP') : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
