
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
import { PrayerCandle } from "./icons";

interface PrayConfirmationDialogProps {
  request: { name: string; request: string };
  onOpenChange: (open: boolean) => void;
}

export function PrayConfirmationDialog({ request, onOpenChange }: PrayConfirmationDialogProps) {

  return (
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center items-center">
            <PrayerCandle className="w-16 h-16 text-primary mb-4" />
          <AlertDialogTitle>Thank you for your prayer</AlertDialogTitle>
          <AlertDialogDescription>
            You've joined in prayer for <span className="font-semibold text-primary">{request.name}</span>. May your support bring comfort and peace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
