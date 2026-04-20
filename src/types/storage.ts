import { z } from 'zod';

export const StorageProtocolSchema = z.enum(['nfs', 'cifs', 'sshfs', 's3']);
export type StorageProtocol = z.infer<typeof StorageProtocolSchema>;

export const StorageStatusSchema = z.enum(['mounted', 'unmounted', 'mounting', 'unmounting', 'error']);
export type StorageStatus = z.infer<typeof StorageStatusSchema>;

export const StorageSchema = z.object({
  id: z.string(),
  name: z.string(),
  protocol: StorageProtocolSchema,
  status: StorageStatusSchema,
  config: z.record(z.any()),
  tunnelId: z.string().optional(),
});
export type Storage = z.infer<typeof StorageSchema>;
