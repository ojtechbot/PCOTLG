
"use client"

import { DashboardLayout } from "@/components/dashboard-layout";
import { HandDrawnSeparator } from "@/components/icons";
import { PrayerRequestForm } from "@/components/prayer-request-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake, Pin, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PrayConfirmationDialog } from "@/components/pray-confirmation-dialog";
import { type PrayerRequest, usePrayerRequests, incrementPrayerCount } from "@/lib/database/prayers";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";


export default function PrayerNetworkPage() {
  const { requests, loading } = usePrayerRequests();
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const { toast } = useToast();

  const handlePray = async (prayer: PrayerRequest) => {
    try {
        await incrementPrayerCount(prayer.id);
        setSelectedPrayer(prayer);
    } catch (error) {
        console.error("Failed to increment prayer count", error);
        toast({
            variant: "destructive",
            title: "An error occurred",
            description: "Could not record your prayer. Please try again.",
        })
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
            Prayer Network
          </h1>
          <p className="text-muted-foreground">
            Share, pray, and support one another in the community.
          </p>
        </div>

        <HandDrawnSeparator className="stroke-current text-border/50" />

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <h2 className="font-headline text-2xl text-primary">Prayer Wall</h2>
            <div className="space-y-6">
              {loading ? (
                Array.from({length: 3}).map((_, i) => (
                  <Card key={i} className="border-border/50">
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/6" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-1" />
                       <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))
              ) : requests.length === 0 ? (
                <Card className="border-border/50 text-center py-12">
                  <CardContent>
                    <HeartHandshake className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">The prayer wall is empty.</p>
                    <p className="text-sm text-muted-foreground">Be the first to share a request.</p>
                  </CardContent>
                </Card>
              ) : (
                requests.map((prayer) => (
                  <Card key={prayer.id} className="border-border/50">
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                      <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${prayer.name.charAt(0)}`} data-ai-hint="portrait" />
                        <AvatarFallback>{prayer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{prayer.name}</CardTitle>
                        <CardDescription>{prayer.createdAt ? formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true }) : 'just now'}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Pin className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="font-scripture italic text-lg">{prayer.request}</p>
                      <div className="flex justify-between items-center mt-4 text-muted-foreground text-sm">
                          <span>{prayer.prayerCount || 0} prayers</span>
                          <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handlePray(prayer)}><HeartHandshake className="mr-2 h-4 w-4"/>Pray</Button>
                              <Button variant="ghost" size="sm"><Share2 className="mr-2 h-4 w-4"/>Share</Button>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
          <div className="space-y-8">
             <h2 className="font-headline text-2xl text-primary">Submit a Request</h2>
            <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-background to-secondary/20">
              <CardHeader>
                  <CardTitle className="font-headline text-xl">
                    Share Your Heart
                  </CardTitle>
                  <CardDescription>
                    Post your prayer request for the community to see.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <PrayerRequestForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {selectedPrayer && <PrayConfirmationDialog request={selectedPrayer} onOpenChange={() => setSelectedPrayer(null)} />}
    </DashboardLayout>
  );
}
