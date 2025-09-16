
"use client"

import { useEffect, useState, useMemo } from "react"
import { MoreHorizontal, Users, Shield, MessageSquare, Search } from "lucide-react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { format, formatDistanceToNow } from 'date-fns';

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/hooks/use-auth";
import { deleteUser } from "@/lib/database/users";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { UserDetailsDialog } from "@/components/admin/user-details-dialog";
import { UserEditDialog } from "@/components/admin/user-edit-dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const RoleIcon = ({ role }: { role: 'admin' | 'user' }) => {
  if (role === 'admin') {
    return <Shield className="h-4 w-4 text-primary" />;
  }
  return <Users className="h-4 w-4 text-muted-foreground" />;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    // State for dialogs
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToView, setUserToView] = useState<User | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    // State for filtering and searching
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                uid: doc.id,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
                lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate().toISOString() : null,
            } as User;
        });
        setUsers(usersData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching users:", error);
        toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load users. Please try again later.",
        });
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, [toast]);
    
    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete.uid);
            toast({ title: "User Deleted", description: `User ${userToDelete.name} has been removed.` });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete user."});
        } finally {
            setUserToDelete(null);
        }
    }
    
    const openEditDialog = (user: User) => {
        setUserToView(null); // Close view dialog if open
        setUserToEdit(user);
    }
    
    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                const query = searchQuery.toLowerCase();
                return user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
            })
            .filter(user => {
                if (roleFilter === "all") return true;
                return user.role === roleFilter;
            });
    }, [users, searchQuery, roleFilter]);


  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
                View, manage, and communicate with all registered users.
            </CardDescription>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or email..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
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
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No users found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Adjust your search or filter criteria.</p>
                </div>
            ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid} onClick={() => setUserToView(user)} className="cursor-pointer">
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.photoURL ?? undefined} data-ai-hint="user portrait" />
                                <AvatarFallback>{user.name ? user.name.charAt(0) : user.email?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize gap-1.5">
                            <RoleIcon role={user.role} />
                            {user.role}
                        </Badge>
                    </TableCell>
                    <TableCell>{user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : "Never"}</TableCell>
                    <TableCell>{user.createdAt ? format(new Date(user.createdAt), "PPP") : 'N/A'}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => openEditDialog(user)}>Edit User</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => router.push(`/support?uid=${user.uid}`)}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setUserToDelete(user)} className="text-destructive">Delete User</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </main>
      {/* Dialogs */}
      {userToDelete && (
        <DeleteConfirmationDialog 
            itemName={userToDelete.name || userToDelete.email || "this user"}
            itemType="user"
            onConfirm={handleDeleteUser}
            onOpenChange={() => setUserToDelete(null)}
            description="This will permanently delete the user's account and all associated data from Firebase Authentication and Firestore. This action cannot be undone."
        />
      )}
      {userToView && (
        <UserDetailsDialog 
            user={userToView}
            onOpenChange={() => setUserToView(null)}
            onEdit={() => openEditDialog(userToView)}
        />
      )}
       {userToEdit && (
        <UserEditDialog
            user={userToEdit}
            onOpenChange={() => setUserToEdit(null)}
        />
       )}
    </>
  )
}
