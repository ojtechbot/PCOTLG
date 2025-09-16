
'use server';
/**
 * @fileOverview An AI flow to help admins write SEO-optimized blog posts.
 *
 * - writeBlogPost - A function that generates blog post content based on a topic.
 * - WriteBlogPostInput - The input type for the writeBlogPost function.
 * - WriteBlogPostOutput - The return type for the writeBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WriteBlogPostInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or title for the blog post.'),
});
export type WriteBlogPostInput = z.infer<typeof WriteBlogPostInputSchema>;

const WriteBlogPostOutputSchema = z.object({
    title: z.string().describe('A catchy, SEO-friendly title for the blog post.'),
    content: z.string().describe('The full content of the blog post, formatted in Markdown. It should be well-structured with headings, lists, and engaging paragraphs.'),
    metaDescription: z.string().describe('A brief, compelling meta description (max 160 characters) for SEO purposes.'),
    tags: z.array(z.string()).describe('An array of 3-5 relevant keywords or tags for the blog post.'),
});
export type WriteBlogPostOutput = z.infer<typeof WriteBlogPostOutputSchema>;


export async function writeBlogPost(
  input: WriteBlogPostInput
): Promise<WriteBlogPostOutput> {
  return writeBlogPostFlow(input);
}

const prompt = ai.definePrompt({
    name: 'writeBlogPostPrompt',
    input: {schema: WriteBlogPostInputSchema},
    output: {schema: WriteBlogPostOutputSchema},
    prompt: `You are an expert SEO content creator and copywriter for a faith-based community app. Your tone should be encouraging, thoughtful, and grounded in Christian theology, but accessible and optimized for search engines.

    The user wants to write a blog post about the following topic:
    "{{topic}}"

    Please generate the following:
    1.  A catchy, SEO-friendly title.
    2.  The full blog post content (about 500-700 words), formatted in Markdown. Structure it with H2/H3 headings, use bullet points or numbered lists where appropriate, and end with a question for reflection or a call to action.
    3.  A concise meta description (under 160 characters) that summarizes the post and entices users to click.
    4.  A list of 3-5 relevant tags or keywords.
    `,
});


const writeBlogPostFlow = ai.defineFlow(
  {
    name: 'writeBlogPostFlow',
    inputSchema: WriteBlogPostInputSchema,
    outputSchema: WriteBlogPostOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
