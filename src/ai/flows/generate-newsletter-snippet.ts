'use server';
/**
 * @fileOverview An AI flow to generate a short newsletter snippet.
 *
 * - generateNewsletterSnippet - A function that generates a short newsletter.
 * - GenerateNewsletterSnippetOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const GenerateNewsletterSnippetOutputSchema = z.object({
    title: z.string().describe('A catchy title for the newsletter snippet.'),
    content: z.string().describe('The content of the newsletter, formatted in basic HTML paragraphs.'),
});
export type GenerateNewsletterSnippetOutput = z.infer<typeof GenerateNewsletterSnippetOutputSchema>;


export async function generateNewsletterSnippet(): Promise<GenerateNewsletterSnippetOutput> {
  return generateNewsletterSnippetFlow();
}

const prompt = ai.definePrompt({
    name: 'generateNewsletterSnippetPrompt',
    output: {schema: GenerateNewsletterSnippetOutputSchema},
    prompt: `You are an expert copywriter for a faith-based community app. Your tone should be encouraging, thoughtful, and grounded in Christian theology.

    Please generate a short, engaging newsletter snippet (2-3 paragraphs) on the topic of "Finding Peace".
    
    Format the output as a JSON object with:
    1.  A catchy title.
    2.  The content formatted with simple HTML paragraph tags (<p>).
    `,
});


const generateNewsletterSnippetFlow = ai.defineFlow(
  {
    name: 'generateNewsletterSnippetFlow',
    outputSchema: GenerateNewsletterSnippetOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
