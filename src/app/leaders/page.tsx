
"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import PublicLayout from "@/app/(public)/layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { type Leader, getLeaders } from "@/lib/database/leaders";

function LeadersPageContent() {
    const router = useRouter();
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaders() {
            try {
                const fetchedLeaders = await getLeaders();
                setLeaders(fetchedLeaders);
            } catch (error) {
                console.error("Failed to fetch leaders:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLeaders();
    }, [])


    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-96 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                 <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="flex flex-col items-center text-center space-y-2">
                    <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
                        Our Leadership
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        God has raised up Justin Martin McIntosh as a pioneer for His people. He has played an instrumental role in planting several churches in Barbados. Currently, Bishop McIntosh serves as the presiding Bishop of three Pentecostal Church of the Living God congregations and is involved in the organization and structuring of other local churches.
                    </p>
                </div>

                <HandDrawnSeparator className="stroke-current text-border/50 my-8" />
                
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {leaders.map((leader) => (
                        <Card key={leader.id} className="border-border/50 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all overflow-hidden text-center items-center">
                            <Image src={leader.image} alt={leader.name} width={400} height={400} className="object-cover h-64 w-full" data-ai-hint={leader.imageHint} />
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">{leader.name}</CardTitle>
                                <p className="text-sm font-semibold text-primary">{leader.title}</p>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground">{leader.bio}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}


export default function LeadersPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 space-y-4">
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-96 w-full" />
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        )
    }
    
    if (user) {
        return (
            <DashboardLayout>
                <LeadersPageContent />
            </DashboardLayout>
        )
    }

    return (
        <PublicLayout>
            <LeadersPageContent />
        </PublicLayout>
    )
}
