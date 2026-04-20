import { z } from 'zod';

export const DeviceConnectionTypeSchema = z.enum(['direct', 'tunnel', 'reverse-tunnel']);
export type DeviceConnectionType = z.infer<typeof DeviceConnectionTypeSchema>;

export const DeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  ip: z.string(),
  port: z.coerce.number().optional(),
  connectionType: DeviceConnectionTypeSchema,
  tunnelId: z.string().optional(),
});
export type Device = z.infer<typeof DeviceSchema>;
