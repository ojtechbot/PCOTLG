
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
import { CommunityGroupFormDialog } from "@/components/community-group-form-dialog"
import { type CommunityGroup, deleteCommunityGroup } from "@/lib/database/community"
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";


export default function AdminCommunityPage() {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
    const [groupToDelete, setGroupToDelete] = useState<CommunityGroup | null>(null);
    const { toast } = useToast();

    useEffect(() => {
      const q = query(collection(db, "communityGroups"), orderBy("name"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityGroup));
        setGroups(groupsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching community groups:", error);
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load community groups. Please try again later.",
        });
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, [toast]);


    const handleEdit = (group: CommunityGroup) => {
        setSelectedGroup(group);
        setIsFormOpen(true);
    }
    
    const handleCreate = () => {
        setSelectedGroup(null);
        setIsFormOpen(true);
    }

    const openDeleteConfirm = (group: CommunityGroup) => {
        setGroupToDelete(group);
        setIsConfirmOpen(true);
    }

    const handleDelete = async () => {
        if (!groupToDelete) return;
        try {
            await deleteCommunityGroup(groupToDelete.id);
            toast({ title: "Group Deleted", description: "The community group has been successfully removed." });
        } catch (error) {
            console.error("Error deleting group:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the group. Please try again." });
        } finally {
            setIsConfirmOpen(false);
            setGroupToDelete(null);
        }
    }


  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Community Groups</CardTitle>
                    <CardDescription>
                    Manage your church's community groups.
                    </CardDescription>
                </div>
                 <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Group
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
            ) : groups.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No community groups found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new group.</p>
                    <Button className="mt-4" onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Group
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
                  <TableHead>Description</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt="Group image"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={group.image}
                        width="64"
                        data-ai-hint="group photo"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>{group.memberCount}</TableCell>
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
                          <DropdownMenuItem onSelect={() => handleEdit(group)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openDeleteConfirm(group)}>Delete</DropdownMenuItem>
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
      {isFormOpen && <CommunityGroupFormDialog group={selectedGroup} onOpenChange={setIsFormOpen} />}
      {isConfirmOpen && groupToDelete && (
        <DeleteConfirmationDialog
            itemName={groupToDelete.name}
            itemType="community group"
            onConfirm={handleDelete}
            onOpenChange={setIsConfirmOpen}
        />
      )}
    </>
  )
}
