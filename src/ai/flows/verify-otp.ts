
'use server';

import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import { sendWelcomeEmail } from './send-welcome-email';
import { findUserByEmail } from '@/lib/database/users';

const VerifyOtpInputSchema = z.object({
  email: z.string().email().describe('The email address associated with the OTP.'),
  otp: z.string().length(6, "OTP must be 6 digits.").describe('The 6-digit one-time password.'),
});
export type VerifyOtpInput = z.infer<typeof VerifyOtpInputSchema>;

const VerifyOtpOutputSchema = z.object({
  success: z.boolean().describe('Whether the OTP was verified successfully.'),
  message: z.string().describe('A confirmation or error message.'),
});
export type VerifyOtpOutput = z.infer<typeof VerifyOtpOutputSchema>;


/**
 * Verifies an OTP against the code stored in Firestore.
 * This is a secure, server-only function.
 */
export const verifyOtp = async (input: VerifyOtpInput): Promise<VerifyOtpOutput> => {
    try {
        const { email, otp } = VerifyOtpInputSchema.parse(input);

        const otpDocRef = doc(db, 'otps', email);
        const otpDoc = await getDoc(otpDocRef);

        if (!otpDoc.exists()) {
            return { success: false, message: 'Invalid OTP or it has expired. Please try again.' };
        }
        
        const data = otpDoc.data();
        const expires = (data.expires as Timestamp).toDate();

        if (expires < new Date()) {
            await deleteDoc(otpDocRef);
            return { success: false, message: 'Your OTP has expired. Please request a new one.' };
        }

        if (data.otp !== otp) {
            return { success: false, message: 'The OTP you entered is incorrect.' };
        }

        // OTP is correct. Find the user and mark them as verified.
        const user = await findUserByEmail(email);
        if (!user) {
            // This case should be rare if the signup flow is correct
            throw new Error("Could not find user account to verify.");
        }

        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { emailVerified: true });
        
        // Clean up the used OTP
        await deleteDoc(otpDocRef);

        // Send a welcome email
        await sendWelcomeEmail({ name: user.name, email: user.email });

        return { success: true, message: 'Email verified successfully!' };
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown internal error occurred.';
        return { success: false, message: errorMessage };
    }
};
