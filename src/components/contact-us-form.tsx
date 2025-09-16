
"use client"

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { sendContactMessage } from "@/ai/flows/send-contact-message";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export function ContactUsForm() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;
        
        try {
            const result = await sendContactMessage({ name, email, message });
            if (result.success) {
                toast({
                    title: "Message Sent!",
                    description: result.message,
                });
                (e.target as HTMLFormElement).reset();
            } else {
                 toast({
                    variant: "destructive",
                    title: "Sending Failed",
                    description: result.message,
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "An Error Occurred",
                description: "Could not send your message. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    }

     return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Contact Us</CardTitle>
                <CardDescription>Have a question? Fill out the form below and we'll get back to you.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="name-contact">Name</Label>
                        <Input id="name-contact" name="name" defaultValue={user?.name || ''} placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email-contact">Email</Label>
                        <Input id="email-contact" name="email" type="email" defaultValue={user?.email || ''} placeholder="your.email@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message-contact">Message</Label>
                        <Textarea id="message-contact" name="message" placeholder="Your message here..." required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
                        {isLoading ? "Sending..." : "Send Message"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
