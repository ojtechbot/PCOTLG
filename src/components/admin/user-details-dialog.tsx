
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { User } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Badge } from "../ui/badge"
import { User as UserIcon, Mail, Calendar, Phone, Globe, MapPin, Edit } from "lucide-react"

interface UserDetailsDialogProps {
  user: User;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function UserDetailsDialog({ user, onOpenChange, onEdit }: UserDetailsDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="items-center text-center">
            <div className="relative">
                <Avatar className="w-24 h-24 text-4xl">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.name ?? "User"} />
                    <AvatarFallback>{user.name ? user.name.charAt(0) : user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8" onClick={onEdit}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit User</span>
                </Button>
            </div>
          <DialogTitle className="text-2xl pt-2">{user.name}</DialogTitle>
           <div className="pt-1">
             <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
           </div>
        </DialogHeader>
        <div className="py-4 grid gap-4">
            <div className="space-y-1">
                <h4 className="font-semibold text-sm">Bio</h4>
                <p className="text-muted-foreground text-sm">{user.bio || "No bio provided."}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{user.phone || "Not provided"}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Born {user.dob ? format(new Date(user.dob), "PPP") : "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>{user.country || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 col-span-full">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{user.state || "N/A"}, {user.zip || "N/A"}</span>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
