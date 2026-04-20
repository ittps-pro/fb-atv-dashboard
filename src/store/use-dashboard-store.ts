
"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { z } from 'zod';
import { apps as defaultApps, allStreams, videoStream as defaultTorrentStream } from '@/lib/mock-data';
import { Youtube, Twitch, Film, Clapperboard, Gamepad2, Music } from 'lucide-react';
import { type Tunnel } from '@/types/tunnels';
import { type Device } from '@/types/devices';


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

const StreamSchema = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    category: z.string(),
});
type Stream = z.infer<typeof StreamSchema>;

interface DashboardState {
  apps: AppConfig[];
  widgets: WidgetVisibility;
  devices: Device[];
  activeDeviceId: string | null;
  tunnels: Tunnel[];
  streams: Stream[];
  torrentStream: { name: string; magnetUri: string };
  logs: LogEntry[];
  notesContent: string;
  eventLogOpen: boolean;
  isCommandPaletteOpen: boolean;
  fullscreenLayout: (keyof WidgetVisibility)[];
  theme: string;
  setApps: (apps: AppConfig[]) => void;
  toggleWidgetVisibility: (widget: keyof WidgetVisibility) => void;
  
  fetchDevices: () => Promise<void>;
  addDevice: (device: Omit<Device, 'id'>) => Promise<void>;
  updateDevice: (device: Device) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  setActiveDeviceId: (id: string | null) => void;

  fetchTunnels: () => Promise<void>;
  addTunnel: (tunnel: Omit<Tunnel, 'id' | 'status'>) => Promise<void>;
  updateTunnel: (tunnel: Omit<Tunnel, 'id' | 'status'> & { id: string }) => Promise<void>;
  removeTunnel: (id: string) => Promise<void>;
  connectTunnel: (id: string) => Promise<void>;
  disconnectTunnel: (id: string) => Promise<void>;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  setNotesContent: (content: string) => void;
  setEventLogOpen: (open: boolean) => void;
  toggleEventLog: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
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
      devices: [],
      tunnels: [],
      streams: allStreams,
      torrentStream: defaultTorrentStream,
      activeDeviceId: null,
      logs: [],
      notesContent: '',
      eventLogOpen: false,
      isCommandPaletteOpen: false,
      theme: 'orange',
      setApps: (apps) => set({ apps }),
      toggleWidgetVisibility: (widget) => set((state) => ({
        widgets: {
          ...state.widgets,
          [widget]: !state.widgets[widget],
        },
      })),
      
      fetchDevices: async () => {
        try {
          const response = await fetch('/api/devices');
          if (response.ok) {
            const devices = await response.json();
            set({ devices });
             if (!get().activeDeviceId && devices.length > 0) {
              set({ activeDeviceId: devices[0].id });
            }
          }
        } catch (error) {
          console.error("Failed to fetch devices:", error);
        }
      },
      addDevice: async (device) => {
        await fetch('/api/devices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(device),
        });
        await get().fetchDevices();
      },
      updateDevice: async (device) => {
        await fetch(`/api/devices/${device.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(device),
        });
        await get().fetchDevices();
      },
      removeDevice: async (id) => {
        await fetch(`/api/devices/${id}`, { method: 'DELETE' });
        const currentActive = get().activeDeviceId;
        if (currentActive === id) {
            const remainingDevices = get().devices.filter(d => d.id !== id);
            set({ activeDeviceId: remainingDevices.length > 0 ? remainingDevices[0].id : null })
        }
        await get().fetchDevices();
      },
      setActiveDeviceId: (id) => set({ activeDeviceId: id }),
      
      fetchTunnels: async () => {
        try {
          const response = await fetch('/api/tunnels');
          if (response.ok) {
            const tunnels = await response.json();
            set({ tunnels });
          }
        } catch (error) {
          console.error("Failed to fetch tunnels:", error);
        }
      },
      addTunnel: async (tunnel) => {
        await fetch('/api/tunnels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tunnel),
        });
        await get().fetchTunnels();
      },
      updateTunnel: async (tunnel) => {
        await fetch(`/api/tunnels/${tunnel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tunnel),
        });
        await get().fetchTunnels();
      },
      removeTunnel: async (id) => {
        await fetch(`/api/tunnels/${id}`, { method: 'DELETE' });
        await get().fetchTunnels();
      },
      connectTunnel: async (id) => {
        set(state => ({ tunnels: state.tunnels.map(t => t.id === id ? { ...t, status: 'connecting' } : t) }));
        await fetch('/api/tunnels/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tunnelId: id }),
        });
        await get().fetchTunnels();
      },
      disconnectTunnel: async (id) => {
        set(state => ({ tunnels: state.tunnels.map(t => t.id === id ? { ...t, status: 'disconnecting' } : t) }));
        await fetch('/api/tunnels/disconnect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tunnelId: id }),
        });
        await get().fetchTunnels();
      },

      addLog: (log) => set((state) => ({
        logs: [
            { 
                ...log, 
                id: new Date().toISOString() + Math.random(), 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }, 
            ...state.logs
        ].slice(0, 100) // Keep last 100 logs
      })),
      setNotesContent: (content) => set({ notesContent: content }),
      setEventLogOpen: (open) => set({ eventLogOpen: open }),
      toggleEventLog: () => set((state) => ({ eventLogOpen: !state.eventLogOpen })),
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
      setFullscreenLayout: (layout) => set({ fullscreenLayout: layout }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['tunnels', 'devices', 'eventLogOpen', 'isCommandPaletteOpen'].includes(key))
        ),
    }
  )
);
