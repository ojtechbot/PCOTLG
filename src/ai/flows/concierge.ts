
'use server';
/**
 * @fileOverview A conversational AI concierge with tool-calling capabilities.
 *
 * - concierge - A function that handles a user's chat message and conversation history.
 * - ConciergeInput - The input type for the concierge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { bibleSearchTool } from './bible-search';
import { searchEventsTool } from '../tools/events-tool';
import { searchSermonsTool } from '../tools/sermons-tool';
import { MessageSchema } from '@/lib/types';


const ConciergeInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  message: z.string().describe('The latest message from the user.'),
});
export type ConciergeInput = z.infer<typeof ConciergeInputSchema>;

export async function concierge(
  input: ConciergeInput
): Promise<string> {
  return conciergeFlow(input);
}

const conciergeFlow = ai.defineFlow(
  {
    name: 'conciergeFlow',
    inputSchema: ConciergeInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, message }) => {
    const systemPrompt = `You are a friendly and helpful "Church Concierge" for the Pentecostal Church app. Your goal is to assist users by answering their questions about the church, its events, sermons, and providing biblical guidance.

Use the provided tools to find information. If you use a tool to find information, clearly state that you've found results and present them in a clean, readable format.

When answering, maintain a warm and encouraging tone. If you don't know the answer or can't find information, say so politely.`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      tools: [bibleSearchTool, searchSermonsTool, searchEventsTool],
      system: systemPrompt,
      history: history, // Pass the existing conversation history
      prompt: message, // Pass the new user message
    });

    return response.text;
  }
);
