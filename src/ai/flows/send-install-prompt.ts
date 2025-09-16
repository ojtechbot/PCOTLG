
'use server';

/**
 * @fileOverview An AI flow to send a notification prompting the user to install the app.
 *
 * - sendInstallPrompt - A function that sends an installation prompt notification.
 * - InstallPromptInput - The input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createNotification } from '@/lib/database/notifications';
import { sendNotificationToUser } from '@/lib/server-actions/notifications';


const InstallPromptInputSchema = z.object({
  uid: z.string().describe('The user UID to send the notification to.'),
});
export type InstallPromptInput = z.infer<typeof InstallPromptInputSchema>;


export async function sendInstallPrompt(input: InstallPromptInput): Promise<void> {
  return sendInstallPromptFlow(input);
}

const sendInstallPromptFlow = ai.defineFlow(
  {
    name: 'sendInstallPromptFlow',
    inputSchema: InstallPromptInputSchema,
    outputSchema: z.void(),
  },
  async ({ uid }) => {
    const notification = {
        userId: uid,
        title: 'Install PCOTLG App!',
        body: 'For a better experience, add our app to your home screen. Tap here for more info.',
        link: '/about' // A safe link; browser handles install prompt.
    };

    try {
        // Create in-app notification
        await createNotification(notification);
        // Send email/push notification
        await sendNotificationToUser(notification);
    } catch (error) {
        console.error('Failed to send install prompt:', error);
        // Don't throw, as this is a non-critical flow.
    }
  }
);
