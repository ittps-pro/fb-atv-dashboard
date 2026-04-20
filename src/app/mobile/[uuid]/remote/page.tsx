"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle, Home, ArrowLeft, Power, 
    Volume2, VolumeX, Volume1, Tv2, Loader2, AlertTriangle, AppWindow
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Device } from '@/types/devices';
import { useDashboardStore } from '@/store/use-dashboard-store';

export default function MobileRemotePage() {
    const params = useParams();
    const deviceId = params.uuid as string;
    
    const [device, setDevice] = useState<Device | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { apps } = useDashboardStore();

    useEffect(() => {
        if (deviceId) {
            fetch(`/api/devices/${deviceId}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Device not found or failed to load.');
                    }
                    return res.json();
                })
                .then(data => {
                    setDevice(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                });
        }
    }, [deviceId]);

    const sendKeyEvent = async (keyCode: string) => {
        if (!device) return;

        try {
            const response = await fetch('/api/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyCode, deviceIp: device.ip }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.details || result.error || 'Failed to send key.');
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };
    
    const launchApp = async (packageName: string | undefined) => {
        if (!device || !packageName) return;
        try {
             const response = await fetch('/api/launch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageName, deviceIp: device.ip }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.details || 'Failed to launch app.');
            toast({ title: 'Success', description: `Launched app on ${device.name}.` });
        } catch(err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    }

    const keyCodes = {
        UP: '19', DOWN: '20', LEFT: '21', RIGHT: '22', ENTER: '66',
        BACK: '4', HOME: '3', POWER: '26', INPUT: '178',
        VOLUME_UP: '24', VOLUME_DOWN: '25', VOLUME_MUTE: '164',
    };
    
    if (isLoading) {
        return <div className="flex h-screen w-screen items-center justify-center text-foreground"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }
    
    if (error || !device) {
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center text-destructive p-4 text-center">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <h1 className="text-xl font-bold">Error</h1>
                <p>{error || 'Device could not be loaded.'}</p>
            </div>
        )
    }

    return (
        <main className="w-full h-screen bg-background text-foreground flex flex-col p-4 pt-8 space-y-6">
            <header className="text-center">
                <h1 className="text-2xl font-bold">{device.name}</h1>
                <p className="text-muted-foreground">Remote Control</p>
            </header>

            <div className="flex-grow flex flex-col items-center justify-around">
                {/* D-Pad */}
                <div className="grid grid-cols-3 gap-3 w-64">
                    <div />
                    <Button variant="outline" className="h-20" onClick={() => sendKeyEvent(keyCodes.UP)}><ChevronUp size={32}/></Button>
                    <div />
                    <Button variant="outline" className="h-20" onClick={() => sendKeyEvent(keyCodes.LEFT)}><ChevronLeft size={32}/></Button>
                    <Button variant="outline" className="h-20" onClick={() => sendKeyEvent(keyCodes.ENTER)}><Circle size={24} className="fill-current"/></Button>
                    <Button variant="outline" className="h-20" onClick={() => sendKeyEvent(keyCodes.RIGHT)}><ChevronRight size={32}/></Button>
                    <div />
                    <Button variant="outline" className="h-20" onClick={() => sendKeyEvent(keyCodes.DOWN)}><ChevronDown size={32}/></Button>
                    <div />
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4 w-full max-w-xs">
                    <Button variant="secondary" size="lg" className="flex-1" onClick={() => sendKeyEvent(keyCodes.BACK)}><ArrowLeft /></Button>
                    <Button variant="secondary" size="lg" className="flex-1" onClick={() => sendKeyEvent(keyCodes.HOME)}><Home /></Button>
                    <Button variant="secondary" size="lg" className="flex-1" onClick={() => sendKeyEvent(keyCodes.INPUT)}><Tv2 /></Button>
                    <Button variant="destructive" size="lg" className="flex-1" onClick={() => sendKeyEvent(keyCodes.POWER)}><Power /></Button>
                </div>
                
                 {/* Volume */}
                <div className="flex justify-center items-center gap-4 w-full max-w-xs">
                    <Button variant="outline" size="lg" className="flex-1" onClick={() => sendKeyEvent(keyCodes.VOLUME_DOWN)}><Volume1 /></Button>
                    <Button variant="outline" size="lg" className="flex-1" onClick={() => sendKeyEvent(keyCodes.VOLUME_MUTE)}><VolumeX /></Button>
                    <Button variant="outline" size="lg" className="flex-1" onClick={() => sendKeyEvent(keyCodes.VOLUME_UP)}><Volume2 /></Button>
                </div>

                {/* App Shortcuts */}
                <div className="w-full max-w-xs space-y-2">
                    <h3 className="text-center text-muted-foreground font-semibold">App Shortcuts</h3>
                     <div className="grid grid-cols-3 gap-2">
                        {apps.slice(0, 3).map(app => (
                            <Button key={app.name} variant="outline" onClick={() => launchApp(app.packageName)} className="flex-col h-16">
                                <AppWindow />
                                <span className="text-xs truncate">{app.name}</span>
                            </Button>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}
