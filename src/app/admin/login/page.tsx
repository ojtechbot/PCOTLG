
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateUserLastLogin } from "@/lib/database/users";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";

export default function AdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email-login") as string;
    const password = formData.get("password-login") as string;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is an admin
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        await updateUserLastLogin(user.uid);
        router.push('/admin'); // Redirect to admin dashboard
      } else {
        await auth.signOut(); // Sign out non-admin user
        throw new Error("You do not have permission to access this page.");
      }

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "Invalid credentials or insufficient permissions.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
            <Image src="/images/logo.png" alt="Pentecostal Church Logo" width={80} height={80} className="mx-auto mb-4" />
            <h1 className="text-4xl font-headline font-bold text-primary">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">Please sign in to continue.</p>
        </div>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-headline">Admin Login</CardTitle>
            <CardDescription>
              Enter your administrator credentials below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email-login" name="email-login" type="email" placeholder="admin@email.com" required className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password-login" name="password-login" placeholder="Enter password" type={showPassword ? 'text' : 'password'} required className="pl-10 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                    </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Signing in...' : 'Login'}
                </Button>
            </form>
             <div className="text-center text-sm">
                  <button onClick={() => setIsForgotPasswordOpen(true)} className="underline text-muted-foreground">
                    Forgot your password?
                  </button>
                </div>
          </CardContent>
        </Card>
      </div>
    </div>
    {isForgotPasswordOpen && <ForgotPasswordDialog onOpenChange={setIsForgotPasswordOpen} />}
    </>
  );
}
