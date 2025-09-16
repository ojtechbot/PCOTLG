
"use client"

import { DashboardLayout } from "@/components/dashboard-layout";
import PublicLayout from "@/app/(public)/layout";
import { HandDrawnSeparator } from "@/components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactUsForm } from "@/components/contact-us-form";


function ContactPageContent() {
    return (
         <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="flex flex-col items-center text-center space-y-2">
            <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
                Get In Touch
            </h1>
            <p className="text-muted-foreground max-w-2xl">
                We'd love to hear from you. Send us a message, or find our location and service times below.
            </p>
            </div>

            <HandDrawnSeparator className="stroke-current text-border/50" />

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <ContactUsForm />
                </div>
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Service Times</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Sunday Morning</span>
                                <span className="font-semibold text-foreground">10:00 AM</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Wednesday Bible Study</span>
                                <span className="font-semibold text-foreground">7:00 PM</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Our Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Our Address</h3>
                                    <p>7409 Hancock Towns Ct, Chesterfield VA 23832</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Phone className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Phone</h3>
                                    <p>+1 (246) 267-4110</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Mail className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground">Email</h3>
                                    <p>info@pcotlg.org</p>
                                    <p>bishopjtosh@gmail.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Our Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video w-full">
                                <iframe
                                    src="https://maps.google.com/maps?q=7409%20Hancock%20Towns%20Ct%2C%20Chesterfield%20VA%2023832&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function ContactPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 space-y-4">
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-96 w-full max-w-5xl mx-auto mt-8" />
                </div>
            </DashboardLayout>
        )
    }

    if (user) {
        return (
            <DashboardLayout>
                <ContactPageContent />
            </DashboardLayout>
        )
    }

    return (
        <PublicLayout>
            <ContactPageContent />
        </PublicLayout>
    )
}
