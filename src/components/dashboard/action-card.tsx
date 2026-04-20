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
import { Play, AppWindow, Terminal, Loader2, Pencil, Trash2 } from "lucide-react";
import { useDashboardStore } from "@/store/use-dashboard-store";
import { useToast } from '@/hooks/use-toast';
import type { DashboardAction } from '@/types/actions';

interface ActionCardProps {
    action: DashboardAction;
    onEdit: (action: DashboardAction) => void;
}

const actionIcons: Record<DashboardAction['type'], React.ComponentType<{ className?: string }>> = {
    'launch-app': AppWindow,
    'shell-command': Terminal,
};

export function ActionCard({ action, onEdit }: ActionCardProps) {
    const { removeAction, triggerAction, addLog } = useDashboardStore();
    const { toast } = useToast();
    const [isExecuting, setIsExecuting] = useState(false);
    const Icon = actionIcons[action.type] || AppWindow;
    
    const handleExecute = async () => {
        setIsExecuting(true);
        addLog({ message: `Executing action: ${action.name}`, type: 'info' });
        try {
            const result = await triggerAction(action.id);
            addLog({ message: `Action "${action.name}" executed. Output: ${result.stdout || 'N/A'}`, type: 'info' });
            toast({ title: 'Action Executed', description: result.message });
        } catch (error: any) {
            addLog({ message: `Failed to execute action ${action.name}: ${error.message}`, type: 'error' });
            toast({ title: 'Action Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsExecuting(false);
        }
    };
    
    const handleDelete = async () => {
        await removeAction(action.id);
        toast({ title: "Action Removed", description: `${action.name} has been deleted.` });
        addLog({ message: `Action removed: ${action.name}`, type: 'info' });
    }
    
    const getPayloadDescription = () => {
        if (action.type === 'launch-app') {
            return `Launch: ${action.payload.packageName}`;
        }
        if (action.type === 'shell-command') {
            return `Run: ${action.payload.command}`;
        }
        return '';
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <Icon className="h-5 w-5 text-muted-foreground" />
                           {action.name}
                        </CardTitle>
                        <CardDescription className="capitalize mt-1">{action.type.replace('-', ' ')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-xs font-mono text-muted-foreground bg-secondary p-2 rounded-md truncate">
                    {getPayloadDescription()}
                 </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button 
                    onClick={handleExecute}
                    disabled={isExecuting}
                >
                    {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Execute
                </Button>
                <Button variant="outline" size="icon" onClick={() => onEdit(action)}><Pencil className="h-4 w-4" /></Button>
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
                            This will permanently delete the action "{action.name}".
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
