
"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, PlusCircle, BookOpen } from "lucide-react"
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
import { SermonFormDialog } from "@/components/sermon-form-dialog"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/firebase";
import { type Sermon, deleteSermon } from "@/lib/database/sermons";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";


export default function AdminSermonsPage() {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
    const [sermonToDelete, setSermonToDelete] = useState<Sermon | null>(null);
    const { toast } = useToast();

    useEffect(() => {
      const q = query(collection(db, "sermons"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sermonsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sermon));
        setSermons(sermonsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching sermons:", error);
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load sermons. Please try again later.",
        });
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, [toast]);


    const handleEdit = (sermon: Sermon) => {
        setSelectedSermon(sermon);
        setIsFormOpen(true);
    }
    
    const handleCreate = () => {
        setSelectedSermon(null);
        setIsFormOpen(true);
    }
    
    const openDeleteConfirm = (sermon: Sermon) => {
        setSermonToDelete(sermon);
        setIsConfirmOpen(true);
    }

    const handleDelete = async () => {
        if (!sermonToDelete) return;

        try {
            await deleteSermon(sermonToDelete.id);
            toast({ title: "Sermon Deleted", description: "The sermon has been successfully removed." });
        } catch (error) {
            console.error("Error deleting sermon:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the sermon. Please try again." });
        } finally {
            setIsConfirmOpen(false);
            setSermonToDelete(null);
        }
    }

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Teachings & Articles</CardTitle>
                    <CardDescription>
                        Manage your church's sermon library.
                    </CardDescription>
                </div>
                 <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Teaching
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
            ) : sermons.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No teachings found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new sermon or article.</p>
                    <Button className="mt-4" onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Teaching
                    </Button>
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Series</TableHead>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sermons.map((sermon) => (
                    <TableRow key={sermon.id}>
                        <TableCell className="font-medium">{sermon.title}</TableCell>
                        <TableCell>
                        {sermon.series && <Badge variant="outline">{sermon.series}</Badge>}
                        </TableCell>
                        <TableCell>{sermon.speaker}</TableCell>
                        <TableCell>{new Date(sermon.date).toLocaleDateString()}</TableCell>
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
                            <DropdownMenuItem onSelect={() => handleEdit(sermon)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openDeleteConfirm(sermon)}>Delete</DropdownMenuItem>
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
      {isFormOpen && <SermonFormDialog sermon={selectedSermon} onOpenChange={setIsFormOpen} />}
      {isConfirmOpen && sermonToDelete && (
        <DeleteConfirmationDialog
            itemName={sermonToDelete.title}
            itemType="sermon"
            onConfirm={handleDelete}
            onOpenChange={setIsConfirmOpen}
        />
      )}
    </>
  )
}
