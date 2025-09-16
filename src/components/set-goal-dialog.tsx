
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

interface SetGoalDialogProps {
  onOpenChange: (open: boolean) => void;
  onSetGoal: (goal: string) => void;
}

export function SetGoalDialog({ onOpenChange, onSetGoal }: SetGoalDialogProps) {
  const { toast } = useToast();

  const handleSetGoal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const goal = formData.get("goal") as string;
    
    onSetGoal(goal);

    toast({
        title: "New Goal Set!",
        description: `Your new goal is: "${goal}"`,
    })
    onOpenChange(false);
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSetGoal}>
        <DialogHeader>
          <DialogTitle>Set a New Spiritual Goal</DialogTitle>
          <DialogDescription>
            What is a specific, measurable, achievable, relevant, and time-bound goal you want to pursue?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal" className="text-right">
              Goal
            </Label>
            <Input id="goal" name="goal" defaultValue="Read the Bible for 15 minutes daily" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Set Goal</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
