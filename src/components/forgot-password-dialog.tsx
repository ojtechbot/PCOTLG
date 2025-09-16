
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
import { useState } from "react";
import { sendPasswordReset } from "@/ai/flows/send-password-reset";
import { Loader2, Mail } from "lucide-react";

interface ForgotPasswordDialogProps {
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ onOpenChange }: ForgotPasswordDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    
    try {
        const result = await sendPasswordReset({ email });
        toast({
            title: "Check Your Email",
            description: result.message,
        });
        onOpenChange(false);
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "An error occurred",
            description: "Failed to send reset link. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSendResetLink}>
            <DialogHeader>
              <DialogTitle>Forgot Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="relative col-span-3">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required className="pl-10" />
                </div>
              </div>
            </div>
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    "Send Reset Link"
                )}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

