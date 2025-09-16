
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
import type { CommunityGroup } from "@/lib/database/community";
import { addCommunityGroup, updateCommunityGroup } from "@/lib/database/community";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CommunityGroupFormDialogProps {
  group: CommunityGroup | null;
  onOpenChange: (open: boolean) => void;
}

export function CommunityGroupFormDialog({ group, onOpenChange }: CommunityGroupFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as string;

    try {
        if (group) {
            await updateCommunityGroup({ ...group, name, description, image });
        } else {
            await addCommunityGroup({ name, description, image });
        }
        
        toast({
            title: group ? "Group Updated!" : "Group Created!",
            description: `The group "${name}" has been successfully saved.`,
        })
        onOpenChange(false);

    } catch(error) {
        console.error("Failed to save group", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "An error occurred while saving the group."
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
              <DialogTitle>{group ? "Edit Community Group" : "Create New Community Group"}</DialogTitle>
              <DialogDescription>
                {group ? "Update the details for this community group." : "Fill out the form to create a new group."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" defaultValue={group?.name} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea id="description" name="description" defaultValue={group?.description} className="col-span-3" required/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <Input id="image" name="image" defaultValue={group?.image ?? 'https://placehold.co/600x400.png'} className="col-span-3" required/>
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
