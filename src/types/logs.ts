import { z } from 'zod';

export const LogEntrySchema = z.object({
    id: z.string(),
    timestamp: z.string(),
    message: z.string(),
    type: z.enum(['info', 'warning', 'error']),
});
  
export type LogEntry = z.infer<typeof LogEntrySchema>;
