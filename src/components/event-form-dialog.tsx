
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { ChurchEvent } from "@/lib/database/events";
import { addEvent, updateEvent } from "@/lib/database/events";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface EventFormDialogProps {
  event: ChurchEvent | null;
  onOpenChange: (open: boolean) => void;
}

export function EventFormDialog({ event, onOpenChange }: EventFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Format date for the datetime-local input
  const defaultDate = event?.date ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm") : '';

  const handleSave = async (eventTarget: React.FormEvent<HTMLFormElement>) => {
    eventTarget.preventDefault();
    setIsLoading(true);
    const form = eventTarget.currentTarget;
    const formData = new FormData(form);
    
    const eventData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        location: formData.get("location") as string,
        date: new Date(formData.get("date") as string).toISOString(),
        image: formData.get("image") as string,
    }

    try {
        if (event) {
            await updateEvent({ ...event, ...eventData });
        } else {
            await addEvent(eventData);
        }
        
        toast({
            title: event ? "Event Updated!" : "Event Created!",
            description: `The event "${eventData.title}" has been successfully saved.`,
        })
        onOpenChange(false);

    } catch(error) {
        console.error("Failed to save event", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "An error occurred while saving the event."
        })
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>
                {event ? "Update the details for this event." : "Fill out the form to create a new event."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" name="title" defaultValue={event?.title} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea id="description" name="description" defaultValue={event?.description} className="col-span-3" required/>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input id="location" name="location" defaultValue={event?.location} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date & Time
                </Label>
                <Input id="date" name="date" type="datetime-local" defaultValue={defaultDate} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <Input id="image" name="image" defaultValue={event?.image ?? 'https://placehold.co/600x400.png'} className="col-span-3" required/>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
