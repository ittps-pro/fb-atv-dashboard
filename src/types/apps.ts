import { z } from 'zod';

export const AppConfigSchema = z.object({
  name: z.string(),
  iconName: z.enum(['Youtube', 'Twitch', 'Film', 'Clapperboard', 'Gamepad2', 'Music', 'Tv']),
  packageName: z.string().optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
