
"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "./ui/badge";

export interface Pathway {
  title: string;
  description: string;
  progress: number;
  category: string;
}

interface PathwayDetailDialogProps {
  pathway: Pathway;
  onOpenChange: (open: boolean) => void;
}

export function PathwayDetailDialog({ pathway, onOpenChange }: PathwayDetailDialogProps) {
  return (
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
            <Badge variant="outline" className="border-primary/50 text-primary mb-2 w-fit">{pathway.category}</Badge>
            <AlertDialogTitle className="font-headline">{pathway.title}</AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
                {pathway.description}
            </AlertDialogDescription>
            <div className="pt-4">
                <p className="text-sm font-semibold mb-2">Your Progress: {pathway.progress}%</p>
                <div className="w-full bg-secondary rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{width: `${pathway.progress}%`}}></div>
                </div>
            </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
