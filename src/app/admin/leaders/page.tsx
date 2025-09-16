
"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, PlusCircle, Users } from "lucide-react"
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
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { LeaderFormDialog } from "@/components/leader-form-dialog";
import { type Leader, deleteLeader } from "@/lib/database/leaders";


export default function AdminLeadersPage() {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
    const [leaderToDelete, setLeaderToDelete] = useState<Leader | null>(null);
    const { toast } = useToast();

    useEffect(() => {
      const q = query(collection(db, "leaders"), orderBy("order"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const leadersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Leader));
        setLeaders(leadersData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching leaders:", error);
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load leaders. Please try again later.",
        });
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, [toast]);


    const handleEdit = (leader: Leader) => {
        setSelectedLeader(leader);
        setIsFormOpen(true);
    }
    
    const handleCreate = () => {
        setSelectedLeader(null);
        setIsFormOpen(true);
    }

    const openDeleteConfirm = (leader: Leader) => {
        setLeaderToDelete(leader);
        setIsConfirmOpen(true);
    }

    const handleDelete = async () => {
        if (!leaderToDelete) return;
        try {
            await deleteLeader(leaderToDelete.id);
            toast({ title: "Leader Deleted", description: "The leader has been successfully removed." });
        } catch (error) {
            console.error("Error deleting leader:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the leader. Please try again." });
        } finally {
            setIsConfirmOpen(false);
            setLeaderToDelete(null);
        }
    }


  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Church Leadership</CardTitle>
                    <CardDescription>
                    Manage your church's leadership team.
                    </CardDescription>
                </div>
                 <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Leader
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
            ) : leaders.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No leaders found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new leader.</p>
                    <Button className="mt-4" onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Leader
                    </Button>
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    Image
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaders.map((leader) => (
                  <TableRow key={leader.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt="Leader image"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={leader.image}
                        width="64"
                        data-ai-hint="portrait"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{leader.name}</TableCell>
                    <TableCell>{leader.title}</TableCell>
                    <TableCell>{leader.order}</TableCell>
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
                          <DropdownMenuItem onSelect={() => handleEdit(leader)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openDeleteConfirm(leader)}>Delete</DropdownMenuItem>
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
      {isFormOpen && <LeaderFormDialog leader={selectedLeader} onOpenChange={setIsFormOpen} />}
      {isConfirmOpen && leaderToDelete && (
        <DeleteConfirmationDialog
            itemName={leaderToDelete.name}
            itemType="leader"
            onConfirm={handleDelete}
            onOpenChange={setIsConfirmOpen}
        />
      )}
    </>
  )
}
