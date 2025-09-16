
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

interface JoinGroupDialogProps {
  group: { name: string };
  onOpenChange: (open: boolean) => void;
}

export function JoinGroupDialog({ group, onOpenChange }: JoinGroupDialogProps) {
  const { toast } = useToast();

  const handleJoin = () => {
    toast({
        title: "Successfully joined!",
        description: `You are now a member of ${group.name}.`,
    })
    onOpenChange(false);
  };

  return (
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Join "{group.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            You're about to join this community group. A notification will be sent to the group leader.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleJoin}>Confirm & Join</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
