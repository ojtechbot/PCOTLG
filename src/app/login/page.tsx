
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { updateUserLastLogin, createUserDocument } from "@/lib/database/users";
import { sendOtp } from "@/ai/flows/send-otp";
import { createNotification } from "@/lib/database/notifications";

export default function AuthPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
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
        
        await updateUserLastLogin(user.uid);

        await createNotification({
            userId: user.uid,
            title: "Security Alert: New Login",
            body: "We detected a new login to your account. If this was not you, please secure your account immediately.",
            link: "/settings"
        });

        router.push('/success');
    } catch (error: any) {
        let errorMessage = "Invalid credentials. Please try again.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: errorMessage,
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name-signup") as string;
    const email = formData.get("email-signup") as string;
    const password = formData.get("password-signup") as string;

    try {
      // 1. Check if email is already in use before attempting to create a user
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        toast({
          variant: "destructive",
          title: "Email Already In Use",
          description: "This email address is already registered. Please log in instead.",
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Create the user in Firebase Auth (client-side)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // 3. Create the user document in Firestore with 'unverified' status
      await createUserDocument(newUser, { name });

      // 4. Send the OTP for verification
      const otpResult = await sendOtp({ name, email });
      if (!otpResult.success) {
        throw new Error(otpResult.message || "Failed to send OTP.");
      }
      
      // 5. Store email in sessionStorage for the verify page
      sessionStorage.setItem('emailForVerification', email);

      toast({
        title: "Account Created! Please Verify.",
        description: "An OTP has been sent to your email. Please verify to complete your signup.",
      });

      router.push('/verify');

    } catch (error: any) {
        console.error("Signup error:", error);
        // Handle specific errors like 'auth/email-already-in-use' gracefully
        if (error.code === 'auth/email-already-in-use') {
             toast({
                variant: "destructive",
                title: "Email Already In Use",
                description: "This email address is already registered. Please log in instead.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Sign-up Failed",
                description: error.message || "An unexpected error occurred. Please try again.",
            });
        }
    } finally {
        setIsSubmitting(false);
    }
  }


  return (
    <>
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center p-6 py-12 lg:p-10">
        <div className="mx-auto grid w-[350px] gap-6">
           <div className="grid gap-2 text-center">
             <Link href="/home" className="inline-block justify-center items-center">
                <Image src="/images/logo.png" alt="PCOTLG Logo" width={64} height={64} className="mx-auto mb-4" />
             </Link>
            <h1 className="text-3xl font-bold font-headline text-primary">Welcome to PCOTLG</h1>
            <p className="text-balance text-muted-foreground">
              Sign in or create an account to join our community.
            </p>
          </div>
           <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card className="border-0 shadow-none">
                    <CardHeader className="p-0 pt-6">
                        <CardDescription>
                        Welcome back! Please enter your details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email-login">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="email-login" name="email-login" type="email" placeholder="User@email.com" required className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password-login">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="password-login" name="password-login" placeholder="Enter password" type={showLoginPassword ? 'text' : 'password'} required className="pl-10 pr-10" />
                                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                                        {showLoginPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            {isSubmitting ? 'Signing in...' : 'Login'}
                            </Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                        <button onClick={() => setIsForgotPasswordOpen(true)} className="underline text-muted-foreground">
                            Forgot your password?
                        </button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="signup">
                <Card className="border-0 shadow-none">
                    <CardHeader className="p-0 pt-6">
                        <CardDescription>
                        Create an account to join the community. We'll send you a code to verify your email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name-signup">Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="name-signup" name="name-signup" placeholder="Enter full name" required className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email-signup">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="email-signup" name="email-signup" type="email" placeholder="User@email.com" required className="pl-10"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password-signup">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="password-signup" name="password-signup" placeholder="Create password (min. 6 characters)" type={showSignupPassword ? 'text' : 'password'} required className="pl-10 pr-10"/>
                                    <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                                        {showSignupPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            {isSubmitting ? 'Creating Account...' : 'Sign Up & Verify'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/images/logo.png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
          data-ai-hint="church congregation"
        />
      </div>
    </div>
    {isForgotPasswordOpen && <ForgotPasswordDialog onOpenChange={setIsForgotPasswordOpen} />}
    </>
  );
}
