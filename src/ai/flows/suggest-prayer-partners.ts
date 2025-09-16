'use server';

/**
 * @fileOverview AI agent to suggest potential prayer partners based on prayer request topics.
 *
 * - suggestPrayerPartners - A function that suggests prayer partners based on prayer request topics.
 * - SuggestPrayerPartnersInput - The input type for the suggestPrayerPartners function.
 * - SuggestPrayerPartnersOutput - The return type for the suggestPrayerPartners function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPrayerPartnersInputSchema = z.object({
  prayerRequestTopics: z
    .string()
    .describe('The topics included in the prayer request.'),
  userDescription: z
    .string()
    .describe('A short description of the user seeking a prayer partner.'),
});
export type SuggestPrayerPartnersInput = z.infer<typeof SuggestPrayerPartnersInputSchema>;

const SuggestPrayerPartnersOutputSchema = z.object({
  suggestedPartners: z
    .array(z.string())
    .describe('A list of suggested prayer partners based on the prayer request topics.'),
  reasoning: z.string().describe('The AI reasoning for suggesting these partners.'),
});
export type SuggestPrayerPartnersOutput = z.infer<typeof SuggestPrayerPartnersOutputSchema>;

export async function suggestPrayerPartners(
  input: SuggestPrayerPartnersInput
): Promise<SuggestPrayerPartnersOutput> {
  return suggestPrayerPartnersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPrayerPartnersPrompt',
  input: {schema: SuggestPrayerPartnersInputSchema},
  output: {schema: SuggestPrayerPartnersOutputSchema},
  prompt: `You are an AI assistant designed to suggest potential prayer partners based on the topics included in a user's prayer request.

Given the following prayer request topics and a description of the user, suggest a list of potential prayer partners who would be a good match. Explain your reasoning for each suggestion.

Prayer Request Topics: {{{prayerRequestTopics}}}
User Description: {{{userDescription}}}

Format your output as a JSON object with a 'suggestedPartners' array and a 'reasoning' field explaining the choices.
`,
});

const suggestPrayerPartnersFlow = ai.defineFlow(
  {
    name: 'suggestPrayerPartnersFlow',
    inputSchema: SuggestPrayerPartnersInputSchema,
    outputSchema: SuggestPrayerPartnersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
