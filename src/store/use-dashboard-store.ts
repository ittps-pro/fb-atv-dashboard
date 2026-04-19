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

interface DashboardState {
  apps: AppConfig[];
  widgets: WidgetVisibility;
  devices: Device[];
  activeDeviceId: string | null;
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
