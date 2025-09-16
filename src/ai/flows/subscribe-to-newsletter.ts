
'use server';

/**
 * @fileOverview AI flow to handle newsletter subscriptions.
 *
 * - subscribeToNewsletter - Saves email to Firestore and sends a confirmation email.
 * - SubscribeInput - The input type for the function.
 * - SubscribeOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { sendEmail } from '@/lib/email';
import { generateNewsletterSnippet } from './generate-newsletter-snippet';

const SubscribeInputSchema = z.object({
  email: z.string().email().describe('The email address to subscribe.'),
});
export type SubscribeInput = z.infer<typeof SubscribeInputSchema>;

const SubscribeOutputSchema = z.object({
  success: z.boolean().describe('Whether the subscription was successful.'),
  message: z.string().describe('A confirmation or error message.'),
});
export type SubscribeOutput = z.infer<typeof SubscribeOutputSchema>;

export async function subscribeToNewsletter(input: SubscribeInput): Promise<SubscribeOutput> {
  return subscribeToNewsletterFlow(input);
}

const subscribeToNewsletterFlow = ai.defineFlow(
  {
    name: 'subscribeToNewsletterFlow',
    inputSchema: SubscribeInputSchema,
    outputSchema: SubscribeOutputSchema,
  },
  async ({ email }) => {
    const subscriberRef = doc(db, 'subscribers', email);

    try {
      const docSnap = await getDoc(subscriberRef);
      if (docSnap.exists()) {
        return {
          success: false,
          message: 'This email is already subscribed to our newsletter.',
        };
      }

      // Save to Firestore
      await setDoc(subscriberRef, {
        email,
        subscribedAt: serverTimestamp(),
      });

      // Generate AI newsletter content
      const newsletterSnippet = await generateNewsletterSnippet();

      // Send confirmation email with newsletter content
      await sendEmail({
        to: email,
        subject: 'Subscription Confirmed! Welcome to the PCOTLG Newsletter',
        heading: 'You are now subscribed!',
        body: `
          <p>Thank you for joining our newsletter family. We're excited to share updates, event information, and words of encouragement with you.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <h2>${newsletterSnippet.title}</h2>
          ${newsletterSnippet.content}
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p>You can expect to hear from us periodically with more content that we hope will bless and inspire you.</p>
          <p>If you did not subscribe or wish to unsubscribe in the future, please contact our support.</p>
        `,
        button: {
          text: 'Visit Our Website',
          url: process.env.NEXT_PUBLIC_APP_URL || '#',
        },
      });

      return {
        success: true,
        message: 'Thank you for subscribing! A confirmation email has been sent.',
      };
    } catch (error) {
      console.error('Error in subscription flow:', error);
      // Ensure a consistent error message is returned on failure
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      };
    }
  }
);
