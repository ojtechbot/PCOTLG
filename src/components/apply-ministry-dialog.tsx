
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
import { Badge } from "./ui/badge";

interface ApplyMinistryDialogProps {
  opportunity: { 
    title: string; 
    description: string;
    compatibility: number;
    tags: string[];
  };
  onOpenChange: (open: boolean) => void;
}

export function ApplyMinistryDialog({ opportunity, onOpenChange }: ApplyMinistryDialogProps) {
  const { toast } = useToast();

  const handleApply = () => {
    toast({
        title: "Application Submitted!",
        description: `Your application for "${opportunity.title}" has been sent.`,
    })
    onOpenChange(false);
  };

  return (
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{opportunity.title}</AlertDialogTitle>
          <div className="flex flex-wrap gap-2 pt-2">
              {opportunity.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          </div>
          <AlertDialogDescription className="pt-4">
            {opportunity.description}
          </AlertDialogDescription>
           <p className="text-sm font-semibold text-primary pt-2">Your Compatibility: {opportunity.compatibility}%</p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleApply}>Confirm & Apply</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
