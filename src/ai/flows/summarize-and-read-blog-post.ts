
'use server';
/**
 * @fileOverview An AI flow to summarize a blog post and convert it to speech.
 *
 * - summarizeAndReadBlogPost - Summarizes content and generates an audio version.
 * - SummarizeAndReadBlogPostInput - The input type for the function.
 * - SummarizeAndReadBlogPostOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import wav from 'wav';


const SummarizeAndReadBlogPostInputSchema = z.object({
    content: z.string().describe("The full content of the blog post to be summarized."),
});
export type SummarizeAndReadBlogPostInput = z.infer<typeof SummarizeAndReadBlogPostInputSchema>;

const SummarizeAndReadBlogPostOutputSchema = z.object({
  textSummary: z.string().describe("A concise, 1-2 paragraph summary of the blog post."),
  audioSummaryUrl: z.string().describe("A data URI of the audio summary in WAV format."),
});
export type SummarizeAndReadBlogPostOutput = z.infer<typeof SummarizeAndReadBlogPostOutputSchema>;


export async function summarizeAndReadBlogPost(
  input: SummarizeAndReadBlogPostInput
): Promise<SummarizeAndReadBlogPostOutput> {
  return summarizeAndReadBlogPostFlow(input);
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


const summarizeAndReadBlogPostFlow = ai.defineFlow(
  {
    name: 'summarizeAndReadBlogPostFlow',
    inputSchema: SummarizeAndReadBlogPostInputSchema,
    outputSchema: SummarizeAndReadBlogPostOutputSchema,
  },
  async ({ content }) => {
    
    // Step 1: Generate the text summary
    const summaryResponse = await ai.generate({
      prompt: `Please provide a concise, engaging, 1-2 paragraph summary of the following blog post content:\n\n---\n\n${content}`,
      model: 'googleai/gemini-2.0-flash',
    });
    const textSummary = summaryResponse.text;

    if (!textSummary) {
        throw new Error("Failed to generate a text summary.");
    }

    // Step 2: Convert the summary to speech
    const ttsResponse = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: textSummary,
    });
    
    const ttsMedia = ttsResponse.media;
    if (!ttsMedia) {
      throw new Error('No media returned from text-to-speech');
    }

    const audioBuffer = Buffer.from(
      ttsMedia.url.substring(ttsMedia.url.indexOf(',') + 1),
      'base64'
    );
    
    const audioSummaryUrl = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      textSummary,
      audioSummaryUrl,
    };
  }
);
