
"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, PlusCircle, Calendar } from "lucide-react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import { EventFormDialog } from "@/components/event-form-dialog"
import { type ChurchEvent, deleteEvent } from "@/lib/database/events"
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";


export default function AdminEventsPage() {
    const [events, setEvents] = useState<ChurchEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
    const [eventToDelete, setEventToDelete] = useState<ChurchEvent | null>(null);
    const { toast } = useToast();

    useEffect(() => {
      const q = query(collection(db, "events"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChurchEvent));
        setEvents(eventsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching events:", error);
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load events. Please try again later.",
        });
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, [toast]);


    const handleEdit = (event: ChurchEvent) => {
        setSelectedEvent(event);
        setIsFormOpen(true);
    }
    
    const handleCreate = () => {
        setSelectedEvent(null);
        setIsFormOpen(true);
    }

    const openDeleteConfirm = (event: ChurchEvent) => {
        setEventToDelete(event);
        setIsConfirmOpen(true);
    }

    const handleDelete = async () => {
        if (!eventToDelete) return;
        try {
            await deleteEvent(eventToDelete.id);
            toast({ title: "Event Deleted", description: "The event has been successfully removed." });
        } catch (error) {
            console.error("Error deleting event:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the event. Please try again." });
        } finally {
            setIsConfirmOpen(false);
            setEventToDelete(null);
        }
    }


  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Church Events</CardTitle>
                    <CardDescription>
                    Manage your church's upcoming events.
                    </CardDescription>
                </div>
                 <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
               </div>
            ) : events.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No events found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new event.</p>
                    <Button className="mt-4" onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                    </Button>
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    Image
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt="Event image"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={event.image}
                        width="64"
                        data-ai-hint="event photo"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>{format(new Date(event.date), 'PPpp')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleEdit(event)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openDeleteConfirm(event)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </main>
      {isFormOpen && <EventFormDialog event={selectedEvent} onOpenChange={setIsFormOpen} />}
       {isConfirmOpen && eventToDelete && (
        <DeleteConfirmationDialog
            itemName={eventToDelete.title}
            itemType="event"
            onConfirm={handleDelete}
            onOpenChange={setIsConfirmOpen}
        />
      )}
    </>
  )
}
