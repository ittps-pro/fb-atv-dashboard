
"use client";

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { TunnelDialog } from '@/components/dashboard/tunnel-dialog';
import { TunnelCard } from '@/components/dashboard/tunnel-card';
import type { Tunnel } from '@/types/tunnels';

export default function TunnelsPage() {
    const { tunnels, fetchTunnels } = useDashboardStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [tunnelToEdit, setTunnelToEdit] = useState<Tunnel | null>(null);

    useEffect(() => {
        async function loadTunnels() {
            await fetchTunnels();
            setIsLoading(false);
        }
        loadTunnels();
    }, [fetchTunnels]);
    
    const handleAddTunnel = () => {
        setTunnelToEdit(null);
        setIsDialogOpen(true);
    }
    
    const handleEditTunnel = (tunnel: Tunnel) => {
        setTunnelToEdit(tunnel);
        setIsDialogOpen(true);
    }
    
    if (isLoading) {
        return (
            <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-4">Loading Tunnels...</p>
            </main>
        )
    }

    return (
        <>
            <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
            <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
                <div className="flex justify-between items-center">
                    <DashboardHeader />
                    <Button onClick={handleAddTunnel}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Tunnel
                    </Button>
                </div>
                
                {tunnels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tunnels.map(tunnel => (
                            <TunnelCard key={tunnel.id} tunnel={tunnel} onEdit={handleEditTunnel} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-16 flex-grow">
                        <h2 className="text-2xl font-semibold">No Tunnels Configured</h2>
                        <p className="mt-2 text-muted-foreground">Get started by adding a new tunnel connection.</p>
                        <Button onClick={handleAddTunnel} className="mt-6">
                            <Plus className="mr-2 h-4 w-4" /> Add Tunnel
                        </Button>
                    </div>
                )}
            </main>
            <TunnelDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen}
                tunnelToEdit={tunnelToEdit}
            />
        </>
    )
}
