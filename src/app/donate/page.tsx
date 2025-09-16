
"use client"

import { DashboardLayout } from "@/components/dashboard-layout";
import PublicLayout from "@/app/(public)/layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { addDonation } from "@/lib/database/giving";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

function DonatePageContent() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [fund, setFund] = useState("Tithe");

    const handleQuickSelect = (value: number) => {
        setAmount(value.toString());
    }

    const handleDonate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        
        try {
            await addDonation({
                userId: user ? user.uid : null, // Ensure userId is null for guests, not undefined
                userName: name,
                userEmail: email,
                amount: parseFloat(amount),
                fund: fund,
            });

            toast({
                title: "Thank You!",
                description: "Your generous donation has been processed successfully. May God bless you!",
            });
            e.currentTarget.reset();
            setAmount("");

        } catch (error) {
            console.error("Donation failed:", error);
            toast({
                variant: "destructive",
                title: "Donation Failed",
                description: "We were unable to process your donation. Please try again.",
            })
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="flex flex-col items-center text-center space-y-2">
                <Heart className="w-16 h-16 text-primary" />
            <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
                Support Our Mission
            </h1>
            <p className="text-muted-foreground max-w-2xl">
                Your generosity enables us to continue our work in the community and spread the message of hope. Every gift, no matter the size, makes a difference.
            </p>
            </div>

            <HandDrawnSeparator className="stroke-current text-border/50" />

            <div className="max-w-xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Give Online</CardTitle>
                        <CardDescription>Securely make a one-time or recurring donation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleDonate} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (USD)</Label>
                                <Input id="amount" type="number" placeholder="50.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                                 <div className="flex flex-wrap gap-2 pt-2">
                                    {[25, 50, 100, 250].map(val => (
                                        <Button key={val} type="button" variant="outline" size="sm" onClick={() => handleQuickSelect(val)}>${val}</Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label>Select Fund</Label>
                                <RadioGroup defaultValue="Tithe" onValueChange={setFund} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Tithe" id="r1" />
                                        <Label htmlFor="r1">Tithe</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Offering" id="r2" />
                                        <Label htmlFor="r2">Offering</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Building Fund" id="r3" />
                                        <Label htmlFor="r3">Building Fund</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" defaultValue={user?.name || ''} placeholder="John Doe" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={user?.email || ''} placeholder="user@email.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="card">Card Information (Demo)</Label>
                                <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="card" placeholder="Card Number" className="pl-10" defaultValue="4242 4242 4242 4242" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry</Label>
                                    <Input id="expiry" placeholder="MM / YY" defaultValue="12 / 28" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" placeholder="123" defaultValue="123" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading || !amount}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Heart className="mr-2 h-4 w-4"/>}
                                {isLoading ? "Processing..." : `Give $${amount || '0.00'} Securely`}
                            </Button>
                        </form>
                        <p className="text-xs text-muted-foreground mt-4 text-center flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-600" /> All transactions are secure and encrypted.
                        </p>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}

export default function DonatePage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 space-y-4">
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-96 w-full max-w-xl mx-auto mt-8" />
                </div>
            </DashboardLayout>
        )
    }

    // This page is now available to both guests and logged-in users.
    // We select the layout based on the user's auth state.
    const Layout = user ? DashboardLayout : PublicLayout;

    return (
        <Layout>
            <DonatePageContent />
        </Layout>
    );
}
