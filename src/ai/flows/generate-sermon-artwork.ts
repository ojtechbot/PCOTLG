
'use server';
/**
 * @fileOverview An AI flow to generate abstract artwork for a sermon based on its title.
 *
 * - generateSermonArtwork - A function that generates an image data URI.
 * - GenerateSermonArtworkInput - The input type for the function.
 * - GenerateSermonArtworkOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSermonArtworkInputSchema = z.object({
  title: z.string().describe('The title of the sermon to generate artwork for.'),
});
export type GenerateSermonArtworkInput = z.infer<typeof GenerateSermonArtworkInputSchema>;

const GenerateSermonArtworkOutputSchema = z.object({
    artworkUrl: z.string().url().describe("The data URI of the generated artwork."),
});
export type GenerateSermonArtworkOutput = z.infer<typeof GenerateSermonArtworkOutputSchema>;


export async function generateSermonArtwork(
  input: GenerateSermonArtworkInput
): Promise<GenerateSermonArtworkOutput> {
  return generateSermonArtworkFlow(input);
}


const generateSermonArtworkFlow = ai.defineFlow(
  {
    name: 'generateSermonArtworkFlow',
    inputSchema: GenerateSermonArtworkInputSchema,
    outputSchema: GenerateSermonArtworkOutputSchema,
  },
  async ({ title }) => {
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a visually stunning, abstract, and thematic piece of digital art suitable for a sermon titled "${title}". The style should be modern, inspiring, and avoid clichés. Focus on concepts like light, hope, growth, and community. The final image should be visually balanced and work well as a background or feature image.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
        throw new Error("Image generation failed to produce an output URL.");
    }

    return {
      artworkUrl: media.url,
    };
  }
);
