"use client";

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { ActionDialog } from '@/components/dashboard/action-dialog';
import { ActionCard } from '@/components/dashboard/action-card';
import type { DashboardAction } from '@/types/actions';

export default function ActionsPage() {
    const { actions, fetchActions } = useDashboardStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [actionToEdit, setActionToEdit] = useState<DashboardAction | null>(null);

    useEffect(() => {
        async function loadData() {
            await fetchActions();
            setIsLoading(false);
        }
        loadData();
    }, [fetchActions]);
    
    const handleAddAction = () => {
        setActionToEdit(null);
        setIsDialogOpen(true);
    }
    
    const handleEditAction = (action: DashboardAction) => {
        setActionToEdit(action);
        setIsDialogOpen(true);
    }
    
    if (isLoading) {
        return (
            <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-4">Loading Actions...</p>
            </main>
        )
    }

    return (
        <>
            <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
            <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
                <div className="flex justify-between items-center">
                    <DashboardHeader />
                    <Button onClick={handleAddAction}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Action
                    </Button>
                </div>
                
                {actions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {actions.map(action => (
                            <ActionCard key={action.id} action={action} onEdit={handleEditAction} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-16 flex-grow">
                        <h2 className="text-2xl font-semibold">No Actions Configured</h2>
                        <p className="mt-2 text-muted-foreground">Create reusable actions to launch apps or run commands.</p>
                        <Button onClick={handleAddAction} className="mt-6">
                            <Plus className="mr-2 h-4 w-4" /> Add Action
                        </Button>
                    </div>
                )}
            </main>
            <ActionDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen}
                actionToEdit={actionToEdit}
            />
        </>
    )
}
