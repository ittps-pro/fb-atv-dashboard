"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3x3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useDashboardStore } from '@/store/use-dashboard-store';
import { Youtube, Twitch, Film, Clapperboard, Gamepad2, Music } from 'lucide-react';

const iconMap = {
  Youtube,
  Twitch,
  Film,
  Clapperboard,
  Gamepad2,
  Music,
};

export function AppLauncher() {
  const { toast } = useToast();
  const { apps, atvDeviceIp, addLog } = useDashboardStore();

  const handleLaunch = async (appName: string, packageName: string | undefined) => {
    if (!atvDeviceIp) {
      const msg = "Android TV IP address not set.";
      addLog({ message: `App launch failed: ${msg}`, type: 'error' });
      toast({ title: 'Launch Failed', description: msg, variant: "destructive" });
      return;
    }
    
    if (!packageName) {
      const msg = `${appName} does not have a package name configured.`;
      addLog({ message: `App launch failed: ${msg}`, type: 'warning' });
      toast({ title: 'App Not Configured', description: msg, variant: "destructive" });
      return;
    }

    const launchMsg = `Attempting to launch ${appName} (${packageName})...`;
    addLog({ message: launchMsg, type: 'info' });
    toast({ title: 'Launching App', description: launchMsg });

    try {
      const response = await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName, deviceIp: atvDeviceIp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to launch app.');
      }
      
      addLog({ message: result.message, type: 'info' });
      toast({ title: 'Command Sent', description: result.message, variant: 'default' });

    } catch (error: any) {
      addLog({ message: `Launch failed: ${error.message}`, type: 'error' });
      toast({ title: 'Launch Failed', description: error.message, variant: "destructive" });
    }
  };
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Grid3x3 className="h-6 w-6 text-muted-foreground" />
          <CardTitle>App Launcher</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {apps.map((app) => {
            const Icon = iconMap[app.iconName];
            return (
              <Card 
                key={app.name}
                onClick={() => handleLaunch(app.name, app.packageName)}
                className="group cursor-pointer bg-secondary/40 hover:bg-accent/20 transition-all duration-300 flex flex-col items-center justify-center p-4 aspect-square"
              >
                  <div className="p-3 bg-secondary rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/30">
                    {Icon ? <Icon className="h-8 w-8 text-accent transition-colors duration-300 group-hover:text-primary-foreground" /> : <Gamepad2 className="h-8 w-8 text-accent transition-colors duration-300 group-hover:text-primary-foreground" />}
                  </div>
                  <p className="text-sm font-medium text-center mt-2 truncate">{app.name}</p>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}
