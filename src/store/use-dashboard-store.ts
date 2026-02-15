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
});

type WidgetVisibility = z.infer<typeof WidgetVisibilitySchema>;

interface DashboardState {
  apps: AppConfig[];
  widgets: WidgetVisibility;
  setApps: (apps: AppConfig[]) => void;
  toggleWidgetVisibility: (widget: keyof WidgetVisibility) => void;
}

const initialApps = defaultApps.map(app => ({
    name: app.name,
    iconName: app.icon.name as keyof typeof iconMap,
    packageName: app.packageName,
}));

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
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
      },
      setApps: (apps) => set({ apps }),
      toggleWidgetVisibility: (widget) => set((state) => ({
        widgets: {
          ...state.widgets,
          [widget]: !state.widgets[widget],
        },
      })),
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
