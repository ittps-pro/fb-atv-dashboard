"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle, Home, ArrowLeft, Power,
    Volume2, VolumeX, Volume1, Tv2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Gamepad } from "lucide-react";
import { useDashboardStore } from "@/store/use-dashboard-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Youtube, Twitch, Film } from 'lucide-react';

const appIconMap: Record<string, React.FC<any>> = {
  Youtube,
  Twitch,
  Plex: Film,
};

export function RemoteControlWidget() {
    const { toast } = useToast();
    const { devices, activeDeviceId, setActiveDeviceId, addLog, apps } = useDashboardStore();
    const activeDevice = devices.find(d => d.id === activeDeviceId);

    const sendKeyEvent = async (keyCode: string) => {
        if (!activeDevice) {
            const msg = "No active Android TV device selected.";
            addLog({ message: `Remote control failed: ${msg}`, type: 'error' });
            toast({ title: 'Remote Failed', description: msg, variant: "destructive" });
            return;
        }

        if (activeDevice.connectionType !== 'direct') {
            const msg = "Remote control only works with direct device connections for now.";
            addLog({ message: `Remote control failed: ${msg}`, type: 'warning' });
            toast({ title: 'Remote Failed', description: msg, variant: "destructive" });
            return;
        }

        addLog({ message: `Sending key code ${keyCode} to ${activeDevice?.name}`, type: 'info' });

        try {
            const response = await fetch('/api/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyCode, deviceIp: activeDevice.ip }),
            });
            
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.details || result.error || 'Failed to send key event.');
            }
        } catch (error: any) {
            addLog({ message: `Remote key press failed: ${error.message}`, type: 'error' });
            toast({
                title: 'Remote Control Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    };
    
    const launchApp = async (appName: string, packageName: string | undefined) => {
        if (!activeDevice || !packageName) return;
        addLog({ message: `Launching ${appName} on ${activeDevice.name}`, type: 'info' });
        try {
             const response = await fetch('/api/launch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageName, deviceIp: activeDevice.ip }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.details || 'Failed to launch app.');
            toast({ title: 'Success', description: `Launched ${appName}.` });
        } catch(err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    }

    const keyCodes = {
        UP: '19', DOWN: '20', LEFT: '21', RIGHT: '22', ENTER: '66',
        BACK: '4', HOME: '3', POWER: '26', INPUT: '178',
        VOLUME_UP: '24', VOLUME_DOWN: '25', VOLUME_MUTE: '164',
    };
    
    const shortcutApps = apps.filter(app => ['YouTube', 'Plex', 'Twitch'].includes(app.name));

    return (
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                    <Gamepad className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Remote Control</CardTitle>
                </div>
                <Select value={activeDeviceId ?? ""} onValueChange={setActiveDeviceId}>
                    <SelectTrigger className="w-[180px] h-8">
                        <SelectValue placeholder="Select a device" />
                    </SelectTrigger>
                    <SelectContent>
                        {devices.length > 0 ? devices.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        )) : <div className="p-2 text-sm text-muted-foreground">No devices configured</div>}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center items-center">
                    <div className="grid grid-cols-3 gap-2 w-48">
                        <div />
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.UP)}><ChevronUp /></Button>
                        <div />
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.LEFT)}><ChevronLeft /></Button>
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.ENTER)}><Circle className="h-4 w-4 fill-current" /></Button>
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.RIGHT)}><ChevronRight /></Button>
                        <div />
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.DOWN)}><ChevronDown /></Button>
                        <div />
                    </div>
                </div>
                 <div className="flex justify-center gap-2">
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.BACK)}><ArrowLeft /></Button>
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.HOME)}><Home /></Button>
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.POWER)}><Power /></Button>
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.INPUT)}><Tv2 /></Button>
                </div>
                <div className="flex justify-center gap-2">
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.VOLUME_DOWN)}><Volume1 /></Button>
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.VOLUME_MUTE)}><VolumeX /></Button>
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.VOLUME_UP)}><Volume2 /></Button>
                </div>
                 <div className="flex justify-center gap-2">
                    {shortcutApps.map(app => {
                        const Icon = appIconMap[app.name];
                        return (
                            <Button key={app.name} variant="outline" size="icon" onClick={() => launchApp(app.name, app.packageName)}>
                                {Icon && <Icon className="h-5 w-5" />}
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
