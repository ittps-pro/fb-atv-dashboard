
"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type AppConfig } from '@/types/apps';
import { allStreams, videoStream as defaultTorrentStream } from '@/lib/mock-data';
import { type Tunnel } from '@/types/tunnels';
import { type Device } from '@/types/devices';
import { type Stream } from '@/types/streams';
import { type Storage } from '@/types/storage';
import { LogEntry, LogEntrySchema } from '@/types/logs';


interface DashboardState {
  apps: AppConfig[];
  widgets: WidgetVisibility;
  devices: Device[];
  activeDeviceId: string | null;
  tunnels: Tunnel[];
  storages: Storage[];
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
  
  fetchApps: () => Promise<void>;
  syncApps: () => Promise<void>;

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
  
  fetchStorages: () => Promise<void>;
  addStorage: (storage: Omit<Storage, 'id' | 'status'>) => Promise<void>;
  updateStorage: (storage: Omit<Storage, 'id' | 'status'> & { id: string }) => Promise<void>;
  removeStorage: (id: string) => Promise<void>;
  mountStorage: (id: string) => Promise<void>;
  unmountStorage: (id: string) => Promise<void>;

  addStream: (stream: Omit<Stream, 'id'>) => void;
  updateStream: (stream: Stream) => void;
  removeStream: (id: string) => void;

  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  setNotesContent: (content: string) => void;
  setEventLogOpen: (open: boolean) => void;
  toggleEventLog: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setFullscreenLayout: (layout: (keyof WidgetVisibility)[]) => void;
  setTheme: (theme: string) => void;
}

export interface WidgetVisibility {
    recommendations: boolean;
    appLauncher: boolean;
    fileManager: boolean;
    videoStream: boolean;
    news: boolean;
    weather: boolean;
    sports: boolean;
    remoteControl: boolean;
    notes: boolean;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      apps: [],
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
      storages: [],
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
          [widget]: !state.widgets[widget as keyof WidgetVisibility],
        },
      })),
      
      fetchApps: async () => {
        try {
          const response = await fetch('/api/apps');
          if (!response.ok) throw new Error("Failed to fetch apps config");
          const apps = await response.json();
          set({ apps });
        } catch (error) {
          console.error("Failed to fetch apps:", error);
          get().addLog({ message: "Could not load apps from server.", type: 'error' });
        }
      },

      syncApps: async () => {
        const { activeDeviceId, devices, addLog, fetchApps } = get();
        const activeDevice = devices.find(d => d.id === activeDeviceId);

        if (!activeDevice) {
            throw new Error('No active device selected.');
        }
        if (activeDevice.connectionType !== 'direct') {
            throw new Error("App sync only works with direct device connections for now.");
        }

        addLog({ message: `Syncing apps from ${activeDevice.name}...`, type: 'info' });

        const response = await fetch('/api/apps/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceIp: activeDevice.ip, devicePort: activeDevice.port }),
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.details || 'Failed to sync apps.');
        }

        await fetchApps();
      },

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
      
      fetchStorages: async () => {
        try {
          const response = await fetch('/api/storages');
          if (response.ok) {
            const storages = await response.json();
            set({ storages });
          }
        } catch (error) {
          console.error("Failed to fetch storages:", error);
        }
      },
      addStorage: async (storage) => {
        await fetch('/api/storages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storage),
        });
        await get().fetchStorages();
      },
      updateStorage: async (storage) => {
        await fetch(`/api/storages/${storage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storage),
        });
        await get().fetchStorages();
      },
      removeStorage: async (id) => {
        await fetch(`/api/storages/${id}`, { method: 'DELETE' });
        await get().fetchStorages();
      },
      mountStorage: async (id) => {
        set(state => ({ storages: state.storages.map(s => s.id === id ? { ...s, status: 'mounting' } : s) }));
        await fetch('/api/storages/mount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storageId: id }),
        });
        await get().fetchStorages();
      },
      unmountStorage: async (id) => {
        set(state => ({ storages: state.storages.map(s => s.id === id ? { ...s, status: 'unmounting' } : s) }));
        await fetch('/api/storages/unmount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storageId: id }),
        });
        await get().fetchStorages();
      },

      addStream: (stream) => set((state) => ({
        streams: [...state.streams, { ...stream, id: new Date().toISOString() + Math.random() }]
      })),
      updateStream: (stream) => set((state) => ({
        streams: state.streams.map(s => s.id === stream.id ? stream : s)
      })),
      removeStream: (id) => set((state) => ({
        streams: state.streams.filter(s => s.id !== id)
      })),

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
          Object.entries(state).filter(([key]) => !['tunnels', 'devices', 'storages', 'eventLogOpen', 'isCommandPaletteOpen', 'logs'].includes(key))
        ),
    }
  )
);
