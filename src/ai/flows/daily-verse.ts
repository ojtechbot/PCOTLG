
'use server';
/**
 * @fileOverview An AI flow to generate an encouraging daily Bible verse.
 *
 * - getDailyVerse - Generates a single Bible verse.
 * - DailyVerseOutput - The return type for the getDailyVerse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyVerseOutputSchema = z.object({
    reference: z.string().describe("The Bible book, chapter, and verse reference (e.g., John 3:16)."),
    text: z.string().describe("The full text of the scripture verse.")
});
export type DailyVerseOutput = z.infer<typeof DailyVerseOutputSchema>;

export async function getDailyVerse(): Promise<DailyVerseOutput> {
  return dailyVerseFlow();
}

const prompt = ai.definePrompt({
    name: 'dailyVersePrompt',
    output: { schema: DailyVerseOutputSchema },
    prompt: `You are a helpful assistant. Your task is to provide a single, encouraging, and well-known Bible verse that is suitable for a "Verse of the Day" feature.

    Please select a verse that is broadly applicable and uplifting.

    Return the result in the specified JSON format with the book, chapter, and verse reference, and the full text of the verse.
    `,
});

const dailyVerseFlow = ai.defineFlow(
  {
    name: 'dailyVerseFlow',
    outputSchema: DailyVerseOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
