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
import { HardDrive, Server, Plug, PlugZap, Loader2, Pencil, Trash2 } from "lucide-react";
import { useDashboardStore } from "@/store/use-dashboard-store";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Storage } from '@/types/storage';

interface StorageCardProps {
    storage: Storage;
    onEdit: (storage: Storage) => void;
}

const protocolIcons: Record<Storage['protocol'], React.ComponentType<{ className?: string }>> = {
    nfs: Server,
    cifs: Server,
    sshfs: Server,
    s3: HardDrive,
};

const statusConfig: Record<Storage['status'], { label: string; color: string; icon: React.ReactNode }> = {
    unmounted: { label: 'Unmounted', color: 'bg-gray-500', icon: <Plug className="h-4 w-4" /> },
    mounting: { label: 'Mounting...', color: 'bg-yellow-500 animate-pulse', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
    mounted: { label: 'Mounted', color: 'bg-green-500', icon: <PlugZap className="h-4 w-4" /> },
    unmounting: { label: 'Unmounting...', color: 'bg-yellow-500 animate-pulse', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
    error: { label: 'Error', color: 'bg-red-500', icon: <Plug className="h-4 w-4" /> },
}

export function StorageCard({ storage, onEdit }: StorageCardProps) {
    const { removeStorage, mountStorage, unmountStorage, addLog } = useDashboardStore();
    const { toast } = useToast();
    const Icon = protocolIcons[storage.protocol] || HardDrive;
    
    const handleMountToggle = async () => {
        const isMounting = storage.status === 'mounted';
        const actionText = isMounting ? 'Unmounting' : 'Mounting';

        addLog({ message: `${actionText} storage: ${storage.name}`, type: 'info' });
        
        try {
            if (isMounting) {
                await unmountStorage(storage.id);
            } else {
                await mountStorage(storage.id);
            }
        } catch (error: any) {
            addLog({ message: `Failed to ${actionText} storage ${storage.name}: ${error.message}`, type: 'error' });
            toast({ title: 'Operation Failed', description: error.message, variant: 'destructive' });
        }
    };
    
    const handleDelete = async () => {
        await removeStorage(storage.id);
        toast({ title: "Storage Removed", description: `${storage.name} has been deleted.` });
        addLog({ message: `Storage config removed: ${storage.name}`, type: 'info' });
    }

    const { label, color } = statusConfig[storage.status];

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <Icon className="h-5 w-5 text-muted-foreground" />
                           {storage.name}
                        </CardTitle>
                        <CardDescription className="capitalize mt-1">{storage.protocol}</CardDescription>
                    </div>
                     <div className="flex items-center gap-2 text-sm font-medium">
                        <div className={cn("h-2 w-2 rounded-full", color)}></div>
                        <span>{label}</span>
                     </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-xs text-muted-foreground truncate">
                    {Object.entries(storage.config).map(([key, value]) => `${key}: ${value}`).join(', ')}
                 </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button 
                    variant={storage.status === 'mounted' ? 'destructive' : 'default'}
                    onClick={handleMountToggle}
                    disabled={storage.status === 'mounting' || storage.status === 'unmounting'}
                >
                    {storage.status === 'mounting' || storage.status === 'unmounting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {storage.status === 'mounted' ? 'Unmount' : 'Mount'}
                </Button>
                <Button variant="outline" size="icon" onClick={() => onEdit(storage)}><Pencil className="h-4 w-4" /></Button>
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
                            This will permanently delete the storage configuration for "{storage.name}".
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
