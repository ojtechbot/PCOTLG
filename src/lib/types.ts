import { z } from 'zod';

/**
 * @fileOverview This file contains shared Zod schemas and TypeScript types that can be safely
 * imported by both client-side and server-side code.
 */

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;
