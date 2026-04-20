
"use client";

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
import { useDashboardStore } from "@/store/use-dashboard-store";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Tunnel } from '@/types/tunnels';

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
    const { removeTunnel, connectTunnel, disconnectTunnel, addLog } = useDashboardStore();
    const { toast } = useToast();
    const Icon = protocolIcons[tunnel.protocol] || Server;
    
    const handleConnectToggle = async () => {
        const isConnecting = tunnel.status === 'connected';
        const actionText = isConnecting ? 'Disconnecting' : 'Connecting';

        addLog({ message: `${actionText} tunnel: ${tunnel.name}`, type: 'info' });
        
        try {
            if (isConnecting) {
                await disconnectTunnel(tunnel.id);
            } else {
                await connectTunnel(tunnel.id);
            }
        } catch (error: any) {
            addLog({ message: `Failed to ${actionText} tunnel ${tunnel.name}: ${error.message}`, type: 'error' });
            toast({ title: 'Operation Failed', description: error.message, variant: 'destructive' });
        }
    };
    
    const handleDelete = async () => {
        await removeTunnel(tunnel.id);
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
