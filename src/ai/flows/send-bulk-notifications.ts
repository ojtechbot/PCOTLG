
'use server';

/**
 * @fileOverview An AI flow to send notifications to a list of specified users.
 *
 * - sendBulkNotifications - Handles sending email and in-app notifications to multiple users.
 * - BulkNotificationsInput - Input type for the flow.
 * - BulkNotificationsOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createNotification } from '@/lib/database/notifications';
import { sendNotificationToUser } from '@/lib/server-actions/notifications';
import type { User } from '@/hooks/use-auth';

const BulkNotificationsInputSchema = z.object({
  recipientUids: z.array(z.string()).describe('A list of user UIDs to send the notification to.'),
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main content/body of the notification (can be HTML for email).'),
  link: z.string().optional().describe('An optional link for the notification to point to within the app.'),
});
export type BulkNotificationsInput = z.infer<typeof BulkNotificationsInputSchema>;

const BulkNotificationsOutputSchema = z.object({
  success: z.boolean().describe('Whether the notifications were sent successfully.'),
  message: z.string().describe('A summary of the operation.'),
  sentCount: z.number().describe('Number of users notifications were sent to.'),
  failedCount: z.number().describe('Number of users notifications failed to send to.'),
});
export type BulkNotificationsOutput = z.infer<typeof BulkNotificationsOutputSchema>;

export async function sendBulkNotifications(input: BulkNotificationsInput): Promise<BulkNotificationsOutput> {
  return sendBulkNotificationsFlow(input);
}

const sendBulkNotificationsFlow = ai.defineFlow(
  {
    name: 'sendBulkNotificationsFlow',
    inputSchema: BulkNotificationsInputSchema,
    outputSchema: BulkNotificationsOutputSchema,
  },
  async ({ recipientUids, title, body, link }) => {
    let sentCount = 0;
    let failedCount = 0;

    for (const uid of recipientUids) {
      try {
          // Create the in-app notification first
          await createNotification({
            userId: uid,
            title: title,
            body: body,
            link: link,
          });

          // Then, trigger the email/push notification action
          await sendNotificationToUser({
            userId: uid,
            title: title,
            body: body,
            link: link,
          });
          
          sentCount++;
      } catch (error) {
        console.error(`Failed to send notification to UID ${uid}:`, error);
        failedCount++;
      }
    }

    if (failedCount > 0) {
        return {
            success: false,
            message: `Completed with errors. Sent: ${sentCount}, Failed: ${failedCount}.`,
            sentCount,
            failedCount,
        }
    }

    return {
      success: true,
      message: `Successfully sent notifications to ${sentCount} user(s).`,
      sentCount,
      failedCount,
    };
  }
);
