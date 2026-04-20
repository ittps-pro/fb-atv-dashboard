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
import { Play, Tv, GripVertical, Loader2, Pencil, Trash2, Wifi, WifiOff, HelpCircle } from "lucide-react";
import { useDashboardStore } from "@/store/use-dashboard-store";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Stream } from '@/types/streams';

interface StreamCardProps {
    stream: Stream;
    onEdit: (stream: Stream) => void;
}

const StatusIndicator = ({ status }: { status: 'online' | 'offline' | 'loading' | 'unknown' | undefined }) => {
    switch (status) {
        case 'online':
            return <div className="flex items-center gap-1 text-green-500"><Wifi className="h-4 w-4" /> Online</div>;
        case 'offline':
            return <div className="flex items-center gap-1 text-red-500"><WifiOff className="h-4 w-4" /> Offline</div>;
        case 'loading':
            return <div className="flex items-center gap-1 text-yellow-500"><Loader2 className="h-4 w-4 animate-spin" /> Checking</div>;
        default:
            return <div className="flex items-center gap-1 text-gray-500"><HelpCircle className="h-4 w-4" /> Unknown</div>;
    }
};

export function StreamCard({ stream, onEdit }: StreamCardProps) {
    const { removeStream, playStreamOnDevice, triggerAction, addLog, streamStatuses } = useDashboardStore();
    const { toast } = useToast();
    
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stream.id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 'auto', opacity: isDragging ? 0.7 : 1 };

    const handleDelete = async () => {
        await removeStream(stream.id);
        toast({ title: "Stream Removed", description: `${stream.name} has been deleted.` });
        addLog({ message: `Stream removed: ${stream.name}`, type: 'info' });
    }
    
    const handlePlayOnDevice = async (stream: Stream) => {
        if (stream.actionId) {
            addLog({ message: `Executing bound action for stream: ${stream.name}`, type: 'info' });
            try {
                const result = await triggerAction(stream.actionId, { streamUrl: stream.url });
                toast({ title: "Action Triggered", description: result.message });
            } catch (error: any) {
                toast({ title: 'Action Failed', description: error.message, variant: 'destructive' });
            }
        } else {
             addLog({ message: `Playing stream on device: ${stream.name}`, type: 'info' });
            try {
                const result = await playStreamOnDevice(stream.url);
                toast({ title: 'Sent to Device', description: result.message });
            } catch (error: any) {
                toast({ title: 'Failed to Play', description: error.message, variant: 'destructive' });
            }
        }
    };
    
    const streamStatus = streamStatuses[stream.id];

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="flex flex-col h-full group">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                               {stream.url.endsWith('m3u8') ? <Play className="h-5 w-5 text-muted-foreground" /> : <Tv className="h-5 w-5 text-muted-foreground" />}
                               <span className="truncate">{stream.name}</span>
                            </CardTitle>
                            <CardDescription className="capitalize mt-1">{stream.category}</CardDescription>
                        </div>
                         <div 
                            {...attributes}
                            {...listeners}
                            className="p-1.5 bg-secondary/50 border rounded-md cursor-grab active:cursor-grabbing"
                         >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                     <div className="text-sm font-medium">
                        <StatusIndicator status={streamStatus} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button onClick={() => handlePlayOnDevice(stream)}>
                        <Tv className="mr-2 h-4 w-4" /> Play on Device
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onEdit(stream)}><Pencil className="h-4 w-4" /></Button>
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
                                This will permanently delete the stream "{stream.name}".
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
        </div>
    )
}
