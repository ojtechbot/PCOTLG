
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addPrayerRequest } from "@/lib/database/prayers";
import { createNotification } from "@/lib/database/notifications";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  request: z.string().min(10, "Please describe your prayer request in a bit more detail."),
});

export function PrayerRequestForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to submit a prayer request." });
      return;
    }

    setIsLoading(true);
    try {
      await addPrayerRequest({ 
        ...values,
        name: user.name || 'Anonymous',
        userId: user.uid,
      });

      // Create a notification for all users about the new prayer request
      await createNotification({
        title: "New Prayer Request",
        body: `${user.name || 'A community member'} has submitted a new prayer request.`,
        link: "/prayer-network"
      });

      toast({
        title: "Request Submitted!",
        description: "Your prayer request has been posted to the prayer wall.",
      });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to submit your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="request"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prayer Request</FormLabel>
              <FormControl>
                <Textarea className="bg-background/50" placeholder="e.g., 'For strength and healing for my mother who is undergoing surgery...'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-px"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
