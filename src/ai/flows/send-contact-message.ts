
'use server';

/**
 * @fileOverview An AI flow to handle sending a contact form message via email.
 *
 * - sendContactMessage - A function that sends the user's message to the admin and a confirmation to the user.
 * - ContactMessageInput - The input type for the sendContactMessage function.
 * - ContactMessageOutput - The return type for the sendContactMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendEmail } from '@/lib/email';

const ContactMessageInputSchema = z.object({
  name: z.string().describe('The name of the person sending the message.'),
  email: z.string().email().describe('The email address of the sender.'),
  message: z.string().min(10, 'Message must be at least 10 characters.').describe('The content of the message.'),
});
export type ContactMessageInput = z.infer<typeof ContactMessageInputSchema>;

const ContactMessageOutputSchema = z.object({
  success: z.boolean().describe('Whether the message was sent successfully.'),
  message: z.string().describe('A confirmation or error message.'),
});
export type ContactMessageOutput = z.infer<typeof ContactMessageOutputSchema>;

export async function sendContactMessage(
  input: ContactMessageInput
): Promise<ContactMessageOutput> {
  return sendContactMessageFlow(input);
}


const sendContactMessageFlow = ai.defineFlow(
  {
    name: 'sendContactMessageFlow',
    inputSchema: ContactMessageInputSchema,
    outputSchema: ContactMessageOutputSchema,
  },
  async ({name, email, message}) => {
    try {
        // Send email to the church admin
        await sendEmail({
            to: "info@pcotlg.org",
            subject: `New Contact Form Message from ${name}`,
            heading: "New Message Received",
            body: `
                <p>You have received a new message from the website contact form.</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p><strong>Message:</strong></p>
                <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 0;">${message}</blockquote>
            `,
        });

         // Send confirmation email to the user
        await sendEmail({
            to: email,
            subject: "We've received your message!",
            heading: `Thanks for reaching out, ${name}!`,
            body: `
                <p>This is a confirmation that we have successfully received your message. A member of our team will get back to you as soon as possible.</p>
                <p>For your records, here is a copy of your message:</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 0;">${message}</blockquote>
            `,
            button: {
                text: 'Return to Website',
                url: process.env.NEXT_PUBLIC_APP_URL || '#'
            }
        });
        
        return {
            success: true,
            message: "Your message has been sent successfully. We'll be in touch soon!",
        };

    } catch (error) {
        console.error("Error in sendContactMessageFlow: ", error);
        return {
            success: false,
            message: "Sorry, there was an error sending your message. Please try again later.",
        }
    }
  }
);
