"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { z } from 'zod';
import { apps as defaultApps } from '@/lib/mock-data';
import { Youtube, Twitch, Film, Clapperboard, Gamepad2, Music } from 'lucide-react';

const iconMap = {
  Youtube,
  Twitch,
  Film,
  Clapperboard,
  Gamepad2,
  Music,
};

const AppConfigSchema = z.object({
  name: z.string(),
  iconName: z.enum(['Youtube', 'Twitch', 'Film', 'Clapperboard', 'Gamepad2', 'Music']),
  packageName: z.string().optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

const WidgetVisibilitySchema = z.object({
  recommendations: z.boolean(),
  appLauncher: z.boolean(),
  fileManager: z.boolean(),
  videoStream: z.boolean(),
  news: z.boolean(),
  weather: z.boolean(),
  sports: z.boolean(),
  remoteControl: z.boolean(),
  notes: z.boolean(),
});

export type WidgetVisibility = z.infer<typeof WidgetVisibilitySchema>;

const LogEntrySchema = z.object({
    id: z.string(),
    timestamp: z.string(),
    message: z.string(),
    type: z.enum(['info', 'warning', 'error']),
});
  
export type LogEntry = z.infer<typeof LogEntrySchema>;

const DeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  ip: z.string(),
});
export type Device = z.infer<typeof DeviceSchema>;

const TunnelProtocolSchema = z.enum(['ssh', 'wireguard', 'openvpn', 'vless', 'sstp', 'openconnect']);
export type TunnelProtocol = z.infer<typeof TunnelProtocolSchema>;

const TunnelStatusSchema = z.enum(['connected', 'disconnected', 'connecting', 'disconnecting', 'error']);
export type TunnelStatus = z.infer<typeof TunnelStatusSchema>;

export const TunnelSchema = z.object({
  id: z.string(),
  name: z.string(),
  protocol: TunnelProtocolSchema,
  status: TunnelStatusSchema,
  config: z.record(z.any()),
});
export type Tunnel = z.infer<typeof TunnelSchema>;


interface DashboardState {
  apps: AppConfig[];
  widgets: WidgetVisibility;
  devices: Device[];
  activeDeviceId: string | null;
  tunnels: Tunnel[];
  logs: LogEntry[];
  notesContent: string;
  eventLogOpen: boolean;
  fullscreenLayout: (keyof WidgetVisibility)[];
  theme: string;
  setApps: (apps: AppConfig[]) => void;
  toggleWidgetVisibility: (widget: keyof WidgetVisibility) => void;
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Pick<Device, 'name' | 'ip'>) => void;
  updateDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
  setActiveDeviceId: (id: string | null) => void;
  addTunnel: (tunnel: Omit<Tunnel, 'id' | 'status'>) => void;
  updateTunnel: (tunnel: Omit<Tunnel, 'status'>) => void;
  removeTunnel: (id: string) => void;
  setTunnelStatus: (id: string, status: TunnelStatus) => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  setNotesContent: (content: string) => void;
  setEventLogOpen: (open: boolean) => void;
  toggleEventLog: () => void;
  setFullscreenLayout: (layout: (keyof WidgetVisibility)[]) => void;
  setTheme: (theme: string) => void;
}

const initialApps = defaultApps.map(app => ({
    name: app.name,
    iconName: app.icon.name as keyof typeof iconMap,
    packageName: app.packageName,
}));

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      apps: initialApps,
      widgets: {
        recommendations: true,
        appLauncher: true,
        fileManager: true,
        videoStream: true,
        news: true,
        weather: true,
        sports: true,
        remoteControl: true,
        notes: true,
      },
      fullscreenLayout: [
        'recommendations',
        'appLauncher',
        'fileManager',
        'notes',
        'videoStream',
        'news',
        'weather',
        'sports',
        'remoteControl',
      ],
      devices: [
        { id: '1', name: 'Living Room TV', ip: '192.168.1.101'},
        { id: '2', name: 'Bedroom TV', ip: '192.168.1.102'},
      ],
      tunnels: [
        {
          id: '1',
          name: 'My SSH Server',
          protocol: 'ssh',
          status: 'disconnected',
          config: { host: '192.168.1.50', port: 22, username: 'dev' },
        },
        {
          id: '2',
          name: 'Work VPN',
          protocol: 'wireguard',
          status: 'disconnected',
          config: { interfaceName: 'wg0' },
        }
      ],
      activeDeviceId: '1',
      logs: [],
      notesContent: '',
      eventLogOpen: false,
      theme: 'orange',
      setApps: (apps) => set({ apps }),
      toggleWidgetVisibility: (widget) => set((state) => ({
        widgets: {
          ...state.widgets,
          [widget]: !state.widgets[widget],
        },
      })),
      setDevices: (devices) => set({ devices }),
      addDevice: (device) => {
        const newDevice = { ...device, id: new Date().toISOString() + Math.random() };
        set((state) => ({ devices: [...state.devices, newDevice] }));
        if (get().devices.length === 1) {
            set({ activeDeviceId: newDevice.id });
        }
      },
      updateDevice: (device) => set((state) => ({
        devices: state.devices.map(d => d.id === device.id ? device : d)
      })),
      removeDevice: (id) => set((state) => {
        const newDevices = state.devices.filter(d => d.id !== id);
        let newActiveId = state.activeDeviceId;
        if (state.activeDeviceId === id) {
          newActiveId = newDevices.length > 0 ? newDevices[0].id : null;
        }
        return { devices: newDevices, activeDeviceId: newActiveId };
      }),
      setActiveDeviceId: (id) => set({ activeDeviceId: id }),
      addTunnel: (tunnel) => set((state) => ({
        tunnels: [...state.tunnels, { ...tunnel, id: new Date().toISOString(), status: 'disconnected' }]
      })),
      updateTunnel: (tunnel) => set((state) => ({
        tunnels: state.tunnels.map(t => t.id === tunnel.id ? { ...t, status: t.status, ...tunnel } : t)
      })),
      removeTunnel: (id) => set((state) => ({
        tunnels: state.tunnels.filter(t => t.id !== id)
      })),
      setTunnelStatus: (id, status) => set((state) => ({
        tunnels: state.tunnels.map(t => t.id === id ? { ...t, status } : t)
      })),
      addLog: (log) => set((state) => ({
        logs: [
            { 
                ...log, 
                id: new Date().toISOString() + Math.random(), 
                timestamp: new Date().toLocaleTimeString() 
            }, 
            ...state.logs
        ].slice(0, 100) // Keep last 100 logs
      })),
      setNotesContent: (content) => set({ notesContent: content }),
      setEventLogOpen: (open) => set({ eventLogOpen: open }),
      toggleEventLog: () => set((state) => ({ eventLogOpen: !state.eventLogOpen })),
      setFullscreenLayout: (layout) => set({ fullscreenLayout: layout }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
