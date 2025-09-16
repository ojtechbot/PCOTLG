
"use client"

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export function ActiveUsersStat() {
    const { user, loading: authLoading } = useAuth();
    const [activeUsers, setActiveUsers] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) return;

        // Only run the query if the user is authenticated and is an admin
        if (user?.role !== 'admin') {
            setLoading(false);
            return;
        };

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeQuery = query(collection(db, "users"), where("lastLogin", ">=", Timestamp.fromDate(oneDayAgo)));
        
        const unsubscribe = onSnapshot(activeQuery, (snapshot) => {
            setActiveUsers(snapshot.size);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching active users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Active Users (24h)
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{activeUsers}</div>}
                <p className="text-xs text-muted-foreground">
                    Users active in the last day.
                </p>
            </CardContent>
        </Card>
    );
}
