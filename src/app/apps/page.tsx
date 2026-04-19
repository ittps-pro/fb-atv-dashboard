"use client";

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { useDashboardStore, type AppConfig } from '@/store/use-dashboard-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Twitch, Film, Clapperboard, Gamepad2, Music, Tv, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Youtube,
  Twitch,
  Film,
  Clapperboard,
  Gamepad2,
  Music,
};

type Status = 'online' | 'offline' | 'issues';

const StatusIndicator = ({ status }: { status: Status }) => {
    const statusConfig = {
        online: { icon: CheckCircle, color: 'text-green-500', label: 'Online' },
        offline: { icon: XCircle, color: 'text-red-500', label: 'Offline' },
        issues: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Issues Detected' },
    };
    const { icon: Icon, color, label } = statusConfig[status];
    return (
        <div className={cn("flex items-center gap-2 text-sm", color)}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
    );
};


const AppStatusCard = ({ app }: { app: AppConfig }) => {
    const [status, setStatus] = useState<Status>('online');
    const Icon = iconMap[app.iconName] || Tv;

    useEffect(() => {
        // Simulate real-time status updates
        const interval = setInterval(() => {
            const randomStatus = Math.random();
            if (randomStatus > 0.9) setStatus('issues');
            else if (randomStatus > 0.95) setStatus('offline');
            else setStatus('online');
        }, 5000 + Math.random() * 5000); // Random interval between 5-10s

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{app.name}</CardTitle>
                <Icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <StatusIndicator status={status} />
            </CardContent>
        </Card>
    );
}

const DeviceStatusCard = () => {
    const { devices, activeDeviceId } = useDashboardStore();
    const activeDevice = devices.find(d => d.id === activeDeviceId);
    const [status, setStatus] = useState<Status>('offline');

    useEffect(() => {
        if (!activeDevice?.ip) {
            setStatus('offline');
            return;
        }

        const checkStatus = async () => {
            try {
                // This is a mock check. A real implementation would ping the device
                // or check an ADB connection status endpoint.
                const response = await fetch('/api/healthcheck/device', { 
                    method: 'POST', 
                    body: JSON.stringify({ ip: activeDevice.ip }),
                    headers: { 'Content-Type': 'application/json' },
                });
                
                if (response.ok) {
                    setStatus('online');
                } else {
                    setStatus('offline');
                }
            } catch (error) {
                setStatus('offline');
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 15000); // Check every 15 seconds

        return () => clearInterval(interval);
    }, [activeDevice]);


    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{activeDevice?.name || 'Device'}</CardTitle>
                <Tv className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <StatusIndicator status={status} />
                <p className="text-xs text-muted-foreground mt-1">{activeDevice?.ip || 'No active device'}</p>
            </CardContent>
        </Card>
    )
}

export default function AppsStatusPage() {
    const { apps } = useDashboardStore();

    return (
        <>
          <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
          <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
            <DashboardHeader />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <DeviceStatusCard />
                {apps.map(app => (
                    <AppStatusCard key={app.name} app={app} />
                ))}
            </div>
          </main>
        </>
    );
}
