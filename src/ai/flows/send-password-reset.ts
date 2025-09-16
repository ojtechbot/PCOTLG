
'use server';

/**
 * @fileOverview AI agent to handle sending a password reset link.
 *
 * - sendPasswordReset - A function that simulates sending a password reset link.
 * - PasswordResetInput - The input type for the sendPasswordReset function.
 * - PasswordResetOutput - The return type for the sendPasswordReset function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';
import { getUserByEmail } from '@/lib/database/user-server';

const PasswordResetInputSchema = z.object({
  email: z.string().email().describe('The email address of the user requesting a password reset.'),
});
export type PasswordResetInput = z.infer<typeof PasswordResetInputSchema>;

const PasswordResetOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().describe('A confirmation message indicating the result of the operation.'),
});
export type PasswordResetOutput = z.infer<typeof PasswordResetOutputSchema>;

export async function sendPasswordReset(
  input: PasswordResetInput
): Promise<PasswordResetOutput> {
  return sendPasswordResetFlow(input);
}


const sendPasswordResetFlow = ai.defineFlow(
  {
    name: 'sendPasswordResetFlow',
    inputSchema: PasswordResetInputSchema,
    outputSchema: PasswordResetOutputSchema,
  },
  async ({ email }) => {
    initFirebaseAdmin(); // Ensure admin app is initialized
    
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            // To prevent email enumeration, we send a generic success message even if the user doesn't exist.
            return {
                success: true,
                message: `If an account exists for ${email}, a password reset link has been sent.`,
            };
        }

        const link = await getAuth().generatePasswordResetLink(email);

        await sendEmail({
            to: email,
            subject: 'Reset Your Password for PCOTLG',
            heading: `Hi, ${user.name || 'there'}!`,
            body: `
                <p>We received a request to reset your password. Please click the button below to choose a new one. This link is valid for one hour.</p>
                <p>If you did not request a password reset, you can safely ignore this email.</p>
            `,
            button: {
                text: 'Reset Your Password',
                url: link
            }
        });
        
        return {
            success: true,
            message: `If an account exists for ${email}, a password reset link has been sent.`,
        };

    } catch (error) {
        console.error("Error in sendPasswordResetFlow: ", error);
        // Return a generic success message to avoid leaking information about existing accounts.
        return {
            success: true,
            message: `If an account exists for ${email}, a password reset link has been sent.`,
        };
    }
  }
);
