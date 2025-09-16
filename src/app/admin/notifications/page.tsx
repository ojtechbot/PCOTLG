
"use client"

import { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendBulkNotifications } from "@/ai/flows/send-bulk-notifications";
import { MultiSelect, type SelectableItem } from "@/components/ui/multi-select";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminNotificationsPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [link, setLink] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingUsers, setIsFetchingUsers] = useState(true);
    const { toast } = useToast();

    // State for user selection
    const [allUsers, setAllUsers] = useState<SelectableItem[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<SelectableItem[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsFetchingUsers(true);
            try {
                const usersQuery = query(collection(db, "users"), orderBy("name"));
                const snapshot = await getDocs(usersQuery);
                const usersData = snapshot.docs.map(doc => ({
                    value: doc.id,
                    label: `${doc.data().name} (${doc.data().email})`,
                }));
                setAllUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                toast({
                    variant: "destructive",
                    title: "Failed to load users",
                    description: "Could not fetch the user list for selection.",
                });
            } finally {
                setIsFetchingUsers(false);
            }
        };
        fetchUsers();
    }, [toast]);
    
    useEffect(() => {
        if (selectAll) {
            setSelectedUsers(allUsers);
        } else {
            // This is to handle the case where the user unchecks "Select All"
            // We don't clear the list, allowing for manual deselection afterwards.
            // If you want it to clear, you would use: setSelectedUsers([]);
        }
    }, [selectAll, allUsers]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (selectedUsers.length === 0) {
            toast({
                variant: "destructive",
                title: "No Recipients",
                description: "Please select at least one user to notify.",
            });
            setIsLoading(false);
            return;
        }

        const recipientUids = selectedUsers.map(u => u.value);

        try {
            const result = await sendBulkNotifications({
                title,
                body,
                link,
                recipientUids,
            });

            if (result.success) {
                toast({
                    title: "Notifications Sent!",
                    description: result.message,
                });
                // Reset form
                setTitle("");
                setBody("");
                setLink("");
                setSelectedUsers([]);
                setSelectAll(false);
            } else {
                 toast({
                    variant: "destructive",
                    title: "Failed to Send",
                    description: result.message,
                });
            }
        } catch (error) {
             console.error("Error sending notification:", error);
             toast({
                variant: "destructive",
                title: "An Unexpected Error Occurred",
                description: "Could not send notifications. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="max-w-3xl mx-auto w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Send Targeted Notifications</CardTitle>
                        <CardDescription>
                            Compose and send email and in-app notifications to selected users.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="recipients">Recipients</Label>
                                {isFetchingUsers ? (
                                    <Skeleton className="h-10 w-full" />
                                ) : (
                                    <>
                                        <MultiSelect
                                            options={allUsers}
                                            selected={selectedUsers}
                                            onChange={setSelectedUsers}
                                            placeholder="Select users..."
                                            className="w-full"
                                            disabled={selectAll}
                                        />
                                        <div className="flex items-center space-x-2 pt-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectAll}
                                                onCheckedChange={(checked) => setSelectAll(!!checked)}
                                            />
                                            <Label htmlFor="select-all" className="text-sm font-medium leading-none">
                                                Send to all users ({allUsers.length})
                                            </Label>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input 
                                    id="title" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    required 
                                    placeholder="e.g., Special Event Tonight"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">Message Body (Supports HTML for emails)</Label>
                                <Textarea 
                                    id="body" 
                                    value={body} 
                                    onChange={(e) => setBody(e.target.value)} 
                                    required 
                                    placeholder="e.g., <h1>Reminder!</h1><p>Join us for a special worship night at <strong>7 PM</strong>.</p>"
                                    rows={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link">App Link (Optional)</Label>
                                <Input 
                                    id="link" 
                                    value={link} 
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="e.g., /events or /blog/post-id"
                                />
                                <p className="text-xs text-muted-foreground">
                                    A relative path in the app (e.g., /live). A button will be added to the email.
                                </p>
                            </div>
                        </CardContent>
                        <CardContent>
                            <Button type="submit" className="w-full" disabled={isLoading || isFetchingUsers || !title || !body || selectedUsers.length === 0}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {isLoading ? "Sending..." : `Send to ${selectedUsers.length} user(s)`}
                            </Button>
                        </CardContent>
                    </form>
                </Card>
            </div>
        </main>
    );
}
