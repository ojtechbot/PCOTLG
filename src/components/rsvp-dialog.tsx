
"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin } from "lucide-react";
import type { ChurchEvent } from "@/lib/database/events";
import { format } from "date-fns";

interface RsvpDialogProps {
  event: ChurchEvent;
  onOpenChange: (open: boolean) => void;
}

export function RsvpDialog({ event, onOpenChange }: RsvpDialogProps) {
  const { toast } = useToast();

  const handleRsvp = () => {
    toast({
        title: "RSVP Confirmed!",
        description: `You've successfully RSVP'd for "${event.title}".`,
    })
    onOpenChange(false);
  };

  return (
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>RSVP for {event.title}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> {format(new Date(event.date), 'PPPP p')}
              </div>
              <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> {event.location}
              </div>
               <div className="pt-2">Confirm that you would like to attend this event.</div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRsvp}>Confirm RSVP</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
