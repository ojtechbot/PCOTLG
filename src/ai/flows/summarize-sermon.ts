
'use server';
/**
 * @fileOverview An AI flow to generate summaries, key scriptures, and discussion questions for sermons.
 *
 * - summarizeSermon - Generates sermon insights based on title, speaker, and series.
 * - SermonSummaryInput - The input type for the summarizeSermon function.
 * - SermonSummaryOutput - The return type for the summarizeSermon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SermonSummaryInputSchema = z.object({
  title: z.string().describe('The title of the sermon.'),
  speaker: z.string().describe('The name of the person who delivered the sermon.'),
  series: z.string().optional().describe('The sermon series, if applicable.'),
});
export type SermonSummaryInput = z.infer<typeof SermonSummaryInputSchema>;

const SermonSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise, one-paragraph summary of the likely sermon content based on the title and speaker.'),
  scriptures: z.array(z.string()).describe('An array of 3-5 key scripture references (e.g., "John 3:16", "Ephesians 2:8-9") that are likely central to the sermon topic.'),
  discussionQuestions: z.array(z.string()).describe('An array of 3-4 thought-provoking discussion questions related to the sermon topic for personal reflection or group study.'),
});
export type SermonSummaryOutput = z.infer<typeof SermonSummaryOutputSchema>;

export async function summarizeSermon(
  input: SermonSummaryInput
): Promise<SermonSummaryOutput> {
  return summarizeSermonFlow(input);
}

const prompt = ai.definePrompt({
    name: 'summarizeSermonPrompt',
    input: {schema: SermonSummaryInputSchema},
    output: {schema: SermonSummaryOutputSchema},
    prompt: `You are an expert theological assistant. Your task is to generate insightful content based on a sermon's title, speaker, and series.

    Sermon Topic: "{{title}}"
    {{#if series}}Sermon Series: "{{series}}"{{/if}}
    Speaker: {{speaker}}

    Based on this information, please generate the following:
    1.  A concise, one-paragraph summary of the sermon's likely message.
    2.  A list of 3-5 key scripture references that would be foundational to this topic.
    3.  A list of 3-4 thought-provoking discussion questions for personal or group study.

    Assume the sermon aligns with standard Pentecostal theology.
    `,
});


const summarizeSermonFlow = ai.defineFlow(
  {
    name: 'summarizeSermonFlow',
    inputSchema: SermonSummaryInputSchema,
    outputSchema: SermonSummaryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
