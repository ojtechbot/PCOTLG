
'use server';
/**
 * @fileOverview A tool for the AI concierge to search for sermons.
 */
import { ai } from '@/ai/genkit';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Sermon, SermonSchema } from '@/lib/database/sermons';
import { z } from 'genkit';

// We need a Zod schema for the tool definition
const SearchSermonsOutputSchema = z.array(SermonSchema);

async function findSermons(searchQuery: string): Promise<Sermon[]> {
  const sermonsQuery = query(collection(db, "sermons"), orderBy("date", "desc"), limit(50));
  const snapshot = await getDocs(sermonsQuery);
  const allSermons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sermon));

  const lowerCaseQuery = searchQuery.toLowerCase();
  
  return allSermons.filter(sermon => 
    sermon.title.toLowerCase().includes(lowerCaseQuery) ||
    sermon.speaker.toLowerCase().includes(lowerCaseQuery) ||
    sermon.series?.toLowerCase().includes(lowerCaseQuery)
  );
}

export const searchSermonsTool = ai.defineTool(
  {
    name: 'searchSermons',
    description: "Searches the church's sermon library. Use this when a user asks for a sermon by title, speaker, or topic.",
    inputSchema: z.object({
        query: z.string().describe("A search query for the sermon. Can be a title, speaker name, or series.")
    }),
    outputSchema: SearchSermonsOutputSchema,
  },
  async (input) => {
    return await findSermons(input.query);
  }
);
