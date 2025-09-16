
'use server';

/**
 * @fileOverview This file is now deprecated. Notification logic has been moved to a client-callable function in src/lib/data.ts for better reusability across the app. This flow is no longer used.
 */

// This entire flow is deprecated and its logic has been centralized in src/lib/data.ts.
// It is left here to avoid breaking existing imports but should not be used for new development.
// It will be removed in a future update.

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { createNotification as createNotificationInDb } from "@/lib/data";


const NotificationInputSchema = z.object({
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main content/body of the notification.'),
  link: z.string().optional().describe('An optional link for the notification to point to.'),
});
export type NotificationInput = z.infer<typeof NotificationInputSchema>;

const NotificationOutputSchema = z.object({
  success: z.boolean().describe('Whether the notification was sent successfully.'),
  message: z.string().describe('A confirmation or error message.'),
});
export type NotificationOutput = z.infer<typeof NotificationOutputSchema>;

export async function sendNotification(
  input: NotificationInput
): Promise<NotificationOutput> {
  console.warn("DEPRECATED: sendNotification AI flow is called. Use createNotification from @/lib/data instead.");
  return sendNotificationFlow(input);
}


const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: NotificationInputSchema,
    outputSchema: NotificationOutputSchema,
  },
  async (input) => {
    try {
        await createNotificationInDb({
            title: input.title,
            body: input.body,
            link: input.link,
        });

        return {
            success: true,
            message: 'Notification has been successfully sent to all users.',
        };
    } catch (error) {
        console.error("Error sending notification:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return {
            success: false,
            message: `An error occurred while sending the notification: ${errorMessage}`,
        }
    }
  }
);
