'use server';
/**
 * @fileOverview An AI flow to search the Bible with natural language.
 *
 * - bibleSearch - Finds relevant scriptures for a given query.
 * - BibleSearchInput - The input type for the bibleSearch function.
 * - BibleSearchOutput - The return type for the bibleSearch function.
 * - bibleSearchTool - An AI tool for the concierge to use this flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BibleSearchInputSchema = z.string().describe("A natural language query about a topic to find in the Bible.");
export type BibleSearchInput = z.infer<typeof BibleSearchInputSchema>;

const BibleSearchOutputSchema = z.object({
    results: z.array(z.object({
        reference: z.string().describe("The Bible book, chapter, and verse reference (e.g., John 3:16)."),
        text: z.string().describe("The full text of the scripture verse."),
        explanation: z.string().describe("A brief, one-sentence explanation of why this verse is relevant to the user's query.")
    })).describe("An array of relevant scripture results.")
});
export type BibleSearchOutput = z.infer<typeof BibleSearchOutputSchema>;

export async function bibleSearch(
  query: BibleSearchInput
): Promise<BibleSearchOutput> {
  return bibleSearchFlow(query);
}

const prompt = ai.definePrompt({
    name: 'bibleSearchPrompt',
    input: { schema: z.object({ query: z.string() }) },
    output: { schema: BibleSearchOutputSchema },
    prompt: `You are a helpful and knowledgeable Bible study assistant. The user is looking for scriptures related to a specific topic. Your task is to find 3-5 relevant Bible verses that directly address their query.

    For each verse, provide:
    1. The exact book, chapter, and verse reference.
    2. The full text of the verse.
    3. A brief, one-sentence explanation of its relevance to the user's query.

    User's Query: "{{query}}"

    Return the results in the specified JSON format.
    `,
});


const bibleSearchFlow = ai.defineFlow(
  {
    name: 'bibleSearchFlow',
    inputSchema: BibleSearchInputSchema,
    outputSchema: BibleSearchOutputSchema,
  },
  async (query) => {
    const {output} = await prompt({ query });
    return output!;
  }
);


// Tool Definition
export const bibleSearchTool = ai.defineTool(
  {
    name: 'searchBible',
    description: "Searches the Bible for scriptures related to a user's query or topic. Use this when a user asks for verses, biblical perspectives, or what the Bible says about a certain subject.",
    inputSchema: z.object({
        query: BibleSearchInputSchema.describe("The user's question or topic to search for in the Bible.")
    }),
    outputSchema: BibleSearchOutputSchema,
  },
  async (input) => {
    return await bibleSearch(input.query);
  }
);
