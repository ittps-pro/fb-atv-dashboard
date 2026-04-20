"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Signal, SignalHigh, SignalLow, Server, Loader2, Pencil, Trash2 } from "lucide-react";
import { useDashboardStore, type Tunnel } from "@/store/use-dashboard-store";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TunnelCardProps {
    tunnel: Tunnel;
    onEdit: (tunnel: Tunnel) => void;
}

const protocolIcons: Record<Tunnel['protocol'], React.ComponentType<{ className?: string }>> = {
    ssh: Server,
    wireguard: Signal,
    openvpn: Signal,
    vless: Signal,
    sstp: Signal,
    openconnect: Signal,
};

const statusConfig: Record<Tunnel['status'], { label: string; color: string; icon: React.ReactNode }> = {
    disconnected: { label: 'Disconnected', color: 'bg-gray-500', icon: <SignalLow className="h-4 w-4" /> },
    connecting: { label: 'Connecting...', color: 'bg-yellow-500 animate-pulse', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
    connected: { label: 'Connected', color: 'bg-green-500', icon: <SignalHigh className="h-4 w-4" /> },
    disconnecting: { label: 'Disconnecting...', color: 'bg-yellow-500 animate-pulse', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
    error: { label: 'Error', color: 'bg-red-500', icon: <SignalLow className="h-4 w-4" /> },
}

export function TunnelCard({ tunnel, onEdit }: TunnelCardProps) {
    const { removeTunnel, setTunnelStatus, addLog } = useDashboardStore();
    const { toast } = useToast();
    const Icon = protocolIcons[tunnel.protocol] || Server;
    
    const handleConnectToggle = async () => {
        const isConnecting = tunnel.status === 'connected';
        const newStatus = isConnecting ? 'disconnecting' : 'connecting';
        const endpoint = isConnecting ? '/api/tunnels/disconnect' : '/api/tunnels/connect';
        const actionText = isConnecting ? 'Disconnecting' : 'Connecting';

        setTunnelStatus(tunnel.id, newStatus);
        addLog({ message: `${actionText} tunnel: ${tunnel.name}`, type: 'info' });

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ tunnelId: tunnel.id }),
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'API request failed');

            setTunnelStatus(tunnel.id, isConnecting ? 'disconnected' : 'connected');
            addLog({ message: `Tunnel ${tunnel.name} ${isConnecting ? 'disconnected' : 'connected'}.`, type: 'info' });
        } catch (error: any) {
            setTunnelStatus(tunnel.id, 'error');
            addLog({ message: `Failed to ${isConnecting ? 'disconnect' : 'connect'} tunnel ${tunnel.name}: ${error.message}`, type: 'error' });
            toast({ title: 'Operation Failed', description: error.message, variant: 'destructive' });
        }
    };
    
    const handleDelete = () => {
        removeTunnel(tunnel.id);
        toast({ title: "Tunnel Removed", description: `${tunnel.name} has been deleted.` });
        addLog({ message: `Tunnel removed: ${tunnel.name}`, type: 'info' });
    }

    const { label, color } = statusConfig[tunnel.status];

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <Icon className="h-5 w-5 text-muted-foreground" />
                           {tunnel.name}
                        </CardTitle>
                        <CardDescription className="capitalize mt-1">{tunnel.protocol}</CardDescription>
                    </div>
                     <div className="flex items-center gap-2 text-sm font-medium">
                        <div className={cn("h-2 w-2 rounded-full", color)}></div>
                        <span>{label}</span>
                     </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-xs text-muted-foreground truncate">
                    {Object.entries(tunnel.config).map(([key, value]) => `${key}: ${value}`).join(', ')}
                 </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button 
                    variant={tunnel.status === 'connected' ? 'destructive' : 'default'}
                    onClick={handleConnectToggle}
                    disabled={tunnel.status === 'connecting' || tunnel.status === 'disconnecting'}
                >
                    {tunnel.status === 'connecting' || tunnel.status === 'disconnecting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {tunnel.status === 'connected' ? 'Disconnect' : 'Connect'}
                </Button>
                <Button variant="outline" size="icon" onClick={() => onEdit(tunnel)}><Pencil className="h-4 w-4" /></Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the tunnel configuration for "{tunnel.name}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}
