import { z } from 'zod';

export const LaunchAppPayloadSchema = z.object({
  packageName: z.string().min(1, "Package name is required"),
});

export const ShellCommandPayloadSchema = z.object({
  command: z.string().min(1, "Command is required"),
});

const BaseActionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Action name is required"),
});

export const ActionSchema = z.discriminatedUnion("type", [
  BaseActionSchema.extend({
    type: z.literal('launch-app'),
    payload: LaunchAppPayloadSchema
  }),
  BaseActionSchema.extend({
    type: z.literal('shell-command'),
    payload: ShellCommandPayloadSchema
  })
]);

export type DashboardAction = z.infer<typeof ActionSchema>;
