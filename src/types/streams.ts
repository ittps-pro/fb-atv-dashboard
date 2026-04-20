import { z } from 'zod';

export const StreamSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  url: z.string().url({ message: "Please enter a valid URL." }),
  category: z.string().min(1, "Category is required"),
});

export type Stream = z.infer<typeof StreamSchema>;
