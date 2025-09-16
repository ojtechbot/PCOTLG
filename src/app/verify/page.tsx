
"use client"

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { sendWelcomeEmail } from "@/ai/flows/send-welcome-email";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { sendOtp } from "@/ai/flows/send-otp";
import { doc, getDoc, deleteDoc, Timestamp, updateDoc } from 'firebase/firestore';

export default function VerifyOtpPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedEmail = sessionStorage.getItem('emailForVerification');
            if (storedEmail) {
                setEmail(storedEmail);
            } else {
                toast({ variant: "destructive", title: "Verification Error", description: "No email information found. Please start the sign-up process again."})
                router.replace('/login');
            }
        } catch (error) {
            router.replace('/login');
        }
    }, [router, toast]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (isResending) {
            setIsResending(false);
        }
        return () => clearTimeout(timer);
    }, [countdown, isResending]);

    const handleResendOtp = async () => {
        if (!email || isResending) return;
        setIsResending(true);
        setCountdown(60);

        try {
            // The name isn't critical here, so we can use a placeholder
            const result = await sendOtp({ name: "New User", email });
            if (result.success) {
                toast({
                    title: "OTP Resent!",
                    description: "A new code has been sent to your email.",
                });
            } else {
                toast({ variant: "destructive", title: "Resend Failed", description: result.message });
                setCountdown(0);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to resend OTP." });
        }
    }

    const verifyAndFinalizeAccount = useCallback(async () => {
        if (!email || otp.length !== 6 || isLoading) return;
        
        setIsLoading(true);

        try {
            const otpDocRef = doc(db, 'otps', email);
            const otpDoc = await getDoc(otpDocRef);

            if (!otpDoc.exists() || otpDoc.data().otp !== otp) {
                throw new Error("The OTP you entered is incorrect.");
            }

            const expires = (otpDoc.data().expires as Timestamp).toDate();
            if (expires < new Date()) {
                await deleteDoc(otpDocRef);
                throw new Error("Your OTP has expired. Please request a new one.");
            }
            
            const currentUser = auth.currentUser;
            if (!currentUser || currentUser.email !== email) {
                throw new Error("User mismatch. Please log in and try again.");
            }

            // Update user document to mark as verified
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, { emailVerified: true });
            
            // Clean up OTP and session storage
            await deleteDoc(otpDocRef);
            sessionStorage.removeItem('emailForVerification');
            
            // Send Welcome Email
            await sendWelcomeEmail({ name: currentUser.displayName || 'Friend', email });

            toast({
                title: "Account Verified!",
                description: "Welcome! You are now being redirected.",
            });

            router.push('/success');

        } catch (error: any) {
            toast({ 
                variant: "destructive", 
                title: "Verification Failed", 
                description: error.message || "An unknown error occurred." 
            });
        } finally {
            setIsLoading(false);
        }
    }, [email, otp, isLoading, router, toast]);
    
    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        verifyAndFinalizeAccount();
    };

    if (!email) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
        )
    }

    return (
         <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md mx-auto">
                 <CardHeader className="text-center">
                    <Link href="/home" className="inline-block justify-center items-center">
                        <Image src="/images/logo.png" alt="PCOTLG Logo" width={64} height={64} className="mx-auto mb-4" />
                    </Link>
                    <CardTitle className="text-2xl font-headline">Verify Your Email</CardTitle>
                    <CardDescription className="text-base">
                        We've sent a 6-digit code to <br /> <span className="font-semibold text-primary">{email}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify}>
                         <div className="flex justify-center py-8">
                            <InputOTP 
                                maxLength={6} 
                                value={otp} 
                                onChange={(value) => setOtp(value)}
                                onComplete={verifyAndFinalizeAccount}
                                autoFocus
                                disabled={isLoading}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? "Verifying..." : "Verify & Complete Sign Up"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Didn't receive the code?{' '}
                        <Button variant="link" className="p-0 h-auto" onClick={handleResendOtp} disabled={isResending}>
                            {isResending ? `Resend in ${countdown}s` : "Resend"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
