
'use server';

/**
 * @fileOverview AI flow to handle sending a one-time password (OTP) via email.
 *
 * - sendOtp - A function that generates and sends an OTP.
 * - OtpInput - The input type for the sendOtp function.
 * - OtpOutput - The return type for the sendOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail } from '@/lib/email';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// --- Input and Output Schemas ---

const OtpInputSchema = z.object({
  email: z.string().email().describe('The email address to send the OTP to.'),
  name: z.string().describe('The name of the recipient.'),
});
export type OtpInput = z.infer<typeof OtpInputSchema>;

const OtpOutputSchema = z.object({
  success: z.boolean().describe('Whether the OTP was sent successfully.'),
  message: z.string().describe('A confirmation or error message.'),
});
export type OtpOutput = z.infer<typeof OtpOutputSchema>;

// --- Main exported function ---

export async function sendOtp(input: OtpInput): Promise<OtpOutput> {
  return sendOtpFlow(input);
}


// --- Genkit Flow Definition ---

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: OtpInputSchema,
    outputSchema: OtpOutputSchema,
  },
  async ({ email, name }) => {
    // 1. Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Set an expiration time (e.g., 10 minutes from now)
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // 3. Save the OTP to Firestore with an expiry time.
    try {
        const otpDocRef = doc(db, 'otps', email);
        await setDoc(otpDocRef, {
            otp,
            email,
            expires: Timestamp.fromDate(expires),
            verified: false // Add a flag to prevent reuse
        });
    } catch (dbError) {
        console.error('Error saving OTP to Firestore:', dbError);
        return {
            success: false,
            message: 'Failed to generate OTP due to a database error. Please try again later.',
        };
    }

    // 4. Send the email
    try {
      await sendEmail({
          to: email,
          subject: 'Your Verification Code for PCOTLG',
          heading: `Here is your code, ${name}!`,
          body: `
            <p>Thank you for joining PCOTLG. To complete your registration, please use the verification code below. This code is valid for 10 minutes.</p>
            <div style="background-color: #f0f0f0; border-radius: 8px; padding: 12px 24px; margin: 24px 0; text-align: center;">
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1A1A2E; margin: 0;">${otp}</p>
            </div>
            <p>If you did not request this code, you can safely ignore this email.</p>
          `,
          button: {
            text: 'Go to App',
            url: process.env.NEXT_PUBLIC_APP_URL || '#'
          }
      });
      
      return {
        success: true,
        message: 'An OTP has been sent to your email address.',
      };
    } catch (error: any) {
      console.error('Error sending OTP email:', error.message);
      // Provide a more user-friendly error if it's a configuration issue.
      if (error.message.includes('Email service is not configured')) {
           return {
                success: false,
                message: 'The email service is not set up correctly. Please contact support.',
            };
      }
      return {
        success: false,
        message: 'Failed to send OTP due to an email server error. Please try again later.',
      };
    }
  }
);
