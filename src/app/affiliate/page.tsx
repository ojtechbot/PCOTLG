
"use client"

import PublicLayout from "@/app/(public)/layout";
import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { type Affiliate, getAffiliates } from "@/lib/database/affiliates";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, MapPin } from "lucide-react";

function AffiliatePageContent() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAffiliates = async () => {
            try {
                const data = await getAffiliates();
                setAffiliates(data);
            } catch (error) {
                console.error("Failed to fetch affiliates:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAffiliates();
    }, []);

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="flex flex-col items-center text-center space-y-2">
                <Handshake className="w-16 h-16 text-primary" />
                <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
                    Our Affiliates
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    We are proud to partner with organizations that share our values and mission, extending our reach and impact.
                </p>
            </div>

            <HandDrawnSeparator className="stroke-current text-border/50" />

            <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6">
                    {isLoading ? (
                        Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                    ) : affiliates.length === 0 ? (
                        <p className="md:col-span-2 text-center text-muted-foreground">Information about our affiliate partners will be available here soon.</p>
                    ) : (
                        affiliates.map(affiliate => (
                            <Card key={affiliate.id} className="border-border/50">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl">{affiliate.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <MapPin className="w-4 h-4"/>
                                        {affiliate.location}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AffiliatePage() {
    const { user, loading } = useAuth();

     if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 space-y-4">
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
                        {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (user) {
        return (
            <DashboardLayout>
                <AffiliatePageContent />
            </DashboardLayout>
        )
    }

    return (
        <PublicLayout>
            <AffiliatePageContent />
        </PublicLayout>
    )
}

    