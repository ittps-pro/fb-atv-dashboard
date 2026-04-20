import { z } from 'zod';
import { iconNames } from '@/lib/lucide-icons';

export const AppConfigSchema = z.object({
  name: z.string(),
  iconName: z.enum(iconNames),
  packageName: z.string().optional(),
  group: z.string().optional().default('Default'),
  isHidden: z.boolean().optional().default(false),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
