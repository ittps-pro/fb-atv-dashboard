
import { z } from 'zod';

export const TunnelProtocolSchema = z.enum(['ssh', 'wireguard', 'openvpn', 'vless', 'sstp', 'openconnect']);
export type TunnelProtocol = z.infer<typeof TunnelProtocolSchema>;

export const TunnelStatusSchema = z.enum(['connected', 'disconnected', 'connecting', 'disconnecting', 'error']);
export type TunnelStatus = z.infer<typeof TunnelStatusSchema>;

export const TunnelSchema = z.object({
  id: z.string(),
  name: z.string(),
  protocol: TunnelProtocolSchema,
  status: TunnelStatusSchema,
  config: z.record(z.any()),
});
export type Tunnel = z.infer<typeof TunnelSchema>;
