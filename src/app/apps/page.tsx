"use client";

import React, { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { useDashboardStore, type AppConfig } from '@/store/use-dashboard-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Loader2, EyeOff, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { iconMap, IconName } from '@/lib/lucide-icons';
import { AppEditDialog } from '@/components/dashboard/app-edit-dialog';
import { Separator } from '@/components/ui/separator';

const AppCard = ({ app, onEdit }: { app: AppConfig; onEdit: (app: AppConfig) => void; }) => {
    const Icon = iconMap[app.iconName as IconName] || iconMap['AppWindow'];

    return (
        <Card className={cn("flex flex-col justify-between group relative", app.isHidden && "opacity-50")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold truncate">{app.name}</CardTitle>
                <Icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground truncate">{app.packageName}</p>
                 {app.isHidden && <div className="absolute top-2 left-2 flex items-center gap-1 text-xs text-muted-foreground"><EyeOff className="h-4 w-4" /> Hidden</div>}
            </CardContent>
            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => onEdit(app)}>
                <Pencil className="h-4 w-4"/>
            </Button>
        </Card>
    );
}

export default function AppsManagementPage() {
    const { apps, syncApps, addLog } = useDashboardStore();
    const [isSyncing, setIsSyncing] = useState(false);
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [appToEdit, setAppToEdit] = useState<AppConfig | null>(null);
    
    const handleEditApp = (app: AppConfig) => {
        setAppToEdit(app);
        setIsDialogOpen(true);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await syncApps();
            toast({
                title: "Sync Complete",
                description: "App list has been updated from the active device.",
            });
            addLog({ message: "App sync complete.", type: 'info' });
        } catch (error: any) {
            toast({
                title: "Sync Failed",
                description: error.message,
                variant: 'destructive',
            });
            addLog({ message: `App sync failed: ${error.message}`, type: 'error' });
        } finally {
            setIsSyncing(false);
        }
    };
    
    const groupedApps = useMemo(() => {
        return apps.reduce((acc, app) => {
            const group = app.group || 'Default';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(app);
            return acc;
        }, {} as Record<string, AppConfig[]>);
    }, [apps]);
    
    const sortedGroups = Object.keys(groupedApps).sort();


    return (
        <>
          <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
          <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
            <div className="flex justify-between items-center">
                <DashboardHeader />
                <Button onClick={handleSync} disabled={isSyncing}>
                    {isSyncing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sync Apps from Device
                </Button>
            </div>
            
            <div className="space-y-8">
                {sortedGroups.map((group, index) => (
                    <div key={group}>
                        <h2 className="text-2xl font-bold mb-4">{group}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {groupedApps[group].map(app => (
                                <AppCard key={app.packageName} app={app} onEdit={handleEditApp} />
                            ))}
                        </div>
                        {index < sortedGroups.length - 1 && <Separator className="my-8" />}
                    </div>
                ))}
            </div>

          </main>
          <AppEditDialog 
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            appToEdit={appToEdit}
          />
        </>
    );
}
