
'use server';
/**
 * @fileOverview A tool for the AI concierge to search for church events.
 */
import { ai } from '@/ai/genkit';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type ChurchEvent, ChurchEventSchema } from '@/lib/database/events';
import { z } from 'genkit';

// We need a Zod schema for the tool definition
const SearchEventsOutputSchema = z.array(ChurchEventSchema);


async function findEvents(searchQuery: string): Promise<ChurchEvent[]> {
  // In a real-world scenario, you might use a more advanced search service like Algolia.
  // For this example, we'll fetch recent events and filter them client-side.
  const eventsQuery = query(collection(db, "events"), orderBy("date", "desc"), limit(50));
  const snapshot = await getDocs(eventsQuery);
  const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChurchEvent));

  const lowerCaseQuery = searchQuery.toLowerCase();
  
  return allEvents.filter(event => 
    event.title.toLowerCase().includes(lowerCaseQuery) ||
    event.description.toLowerCase().includes(lowerCaseQuery) ||
    event.location.toLowerCase().includes(lowerCaseQuery)
  );
}


export const searchEventsTool = ai.defineTool(
  {
    name: 'searchEvents',
    description: "Searches for upcoming church events. Use this when a user asks about events, activities, schedules, or what's happening at the church.",
    inputSchema: z.object({
        query: z.string().describe("A search query describing the event the user is looking for. Can be a name, topic, or type of event.")
    }),
    outputSchema: SearchEventsOutputSchema,
  },
  async (input) => {
    return await findEvents(input.query);
  }
);
