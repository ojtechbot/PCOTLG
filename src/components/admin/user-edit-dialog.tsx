
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/hooks/use-auth"
import { updateUserDocumentAdmin, updateUserPasswordAdmin } from "@/lib/database/users"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface UserEditDialogProps {
  user: User;
  onOpenChange: (open: boolean) => void;
}

export function UserEditDialog({ user, onOpenChange }: UserEditDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as "admin" | "user";

    try {
        await updateUserDocumentAdmin(user.uid, { name, email, role });
        
        if (newPassword) {
            await updateUserPasswordAdmin(user.uid, newPassword);
        }

        toast({ title: "User Updated", description: "The user's details have been saved." });
        onOpenChange(false);

    } catch (error: any) {
        console.error("Error updating user:", error);
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
          <DialogDescription>Modify the user's details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSaveChanges} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={user.name || ""} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={user.email || ""} required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={user.role}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="Leave blank to keep unchanged"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
