
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
import type { Leader } from "@/lib/database/leaders";
import { addLeader, updateLeader } from "@/lib/database/leaders";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface LeaderFormDialogProps {
  leader: Leader | null;
  onOpenChange: (open: boolean) => void;
}

export function LeaderFormDialog({ leader, onOpenChange }: LeaderFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const leaderData = {
        name: formData.get("name") as string,
        title: formData.get("title") as string,
        bio: formData.get("bio") as string,
        image: formData.get("image") as string,
        imageHint: formData.get("imageHint") as string,
        order: parseInt(formData.get("order") as string, 10),
    }

    try {
        if (leader) {
            await updateLeader({ ...leader, ...leaderData });
        } else {
            await addLeader(leaderData);
        }
        
        toast({
            title: leader ? "Leader Updated!" : "Leader Created!",
            description: `The leader "${leaderData.name}" has been successfully saved.`,
        })
        onOpenChange(false);

    } catch(error) {
        console.error("Failed to save leader", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "An error occurred while saving the leader."
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
              <DialogTitle>{leader ? "Edit Leader" : "Add New Leader"}</DialogTitle>
              <DialogDescription>
                {leader ? "Update the details for this leader." : "Fill out the form to add a new leader."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" defaultValue={leader?.name} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" name="title" defaultValue={leader?.title} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="bio" className="text-right pt-2">
                  Bio
                </Label>
                <Textarea id="bio" name="bio" defaultValue={leader?.bio} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <Input id="image" name="image" defaultValue={leader?.image ?? 'https://placehold.co/400x400.png'} className="col-span-3" required/>
              </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageHint" className="text-right">
                    Image Hint
                </Label>
                <Input id="imageHint" name="imageHint" defaultValue={leader?.imageHint ?? 'portrait'} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right">
                  Order
                </Label>
                <Input id="order" name="order" type="number" defaultValue={leader?.order ?? 99} className="col-span-3" required/>
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
