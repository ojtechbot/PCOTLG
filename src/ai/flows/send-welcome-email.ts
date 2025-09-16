
'use server';

/**
 * @fileOverview An AI flow to send a welcome email to a new user.
 *
 * - sendWelcomeEmail - Sends a welcome email.
 * - WelcomeEmailInput - Input type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail } from '@/lib/email';


const WelcomeEmailInputSchema = z.object({
  name: z.string().describe('The name of the new user.'),
  email: z.string().email().describe('The email address of the new user.'),
});
export type WelcomeEmailInput = z.infer<typeof WelcomeEmailInputSchema>;


export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  await sendWelcomeEmailFlow(input);
}


const sendWelcomeEmailFlow = ai.defineFlow(
  {
    name: 'sendWelcomeEmailFlow',
    inputSchema: WelcomeEmailInputSchema,
    outputSchema: z.void(),
  },
  async ({ name, email }) => {
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to PCOTLG!',
        heading: `Welcome to the community, ${name}!`,
        body: `
          <p>We are so excited to have you join our digital home. Here, you can connect with our community, watch sermons, join groups, and so much more.</p>
          <p>We encourage you to explore the dashboard and complete your profile to get the most out of your experience.</p>
        `,
        button: {
          text: 'Explore Your Dashboard',
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      });
    } catch (error) {
      // We don't want to block the user's login if the welcome email fails.
      // Log the error for debugging, but don't throw.
      console.error('Failed to send welcome email:', error);
    }
  }
);
