
'use server';
/**
 * @fileOverview A simple conversational AI flow.
 *
 * This flow is now deprecated. Please use the more advanced `concierge` flow instead.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const ChatInputSchema = z.string();
export type ChatInput = z.infer<typeof ChatInputSchema>;


export async function chat(
  message: ChatInput
): Promise<string> {
  console.warn("DEPRECATED: `chat` flow is called. Use the `concierge` flow instead.");
  return chatFlow(message);
}

const prompt = ai.definePrompt({
    name: 'chatPrompt',
    input: { schema: z.object({ message: z.string() }) },
    prompt: `You are a friendly and helpful assistant for the Pentecostal Church app.
    
    The user is asking the following question:
    "{{{message}}}"

    Provide a concise and helpful response.
    `,
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (message) => {
    // The prompt expects an object { message: string }, so we wrap the input string here.
    const {output} = await prompt({message: message});
    return output!;
  }
);
