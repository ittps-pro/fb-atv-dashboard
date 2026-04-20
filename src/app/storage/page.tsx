"use client";

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { StorageDialog } from '@/components/dashboard/storage-dialog';
import { StorageCard } from '@/components/dashboard/storage-card';
import type { Storage } from '@/types/storage';

export default function StoragePage() {
    const { storages, fetchStorages } = useDashboardStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [storageToEdit, setStorageToEdit] = useState<Storage | null>(null);

    useEffect(() => {
        async function loadData() {
            await fetchStorages();
            setIsLoading(false);
        }
        loadData();
    }, [fetchStorages]);
    
    const handleAddStorage = () => {
        setStorageToEdit(null);
        setIsDialogOpen(true);
    }
    
    const handleEditStorage = (storage: Storage) => {
        setStorageToEdit(storage);
        setIsDialogOpen(true);
    }
    
    if (isLoading) {
        return (
            <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-4">Loading Storage Mounts...</p>
            </main>
        )
    }

    return (
        <>
            <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
            <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
                <div className="flex justify-between items-center">
                    <DashboardHeader />
                    <Button onClick={handleAddStorage}>
                        <Plus className="mr-2 h-4 w-4" /> Add Storage
                    </Button>
                </div>
                
                {storages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {storages.map(storage => (
                            <StorageCard key={storage.id} storage={storage} onEdit={handleEditStorage} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-16 flex-grow">
                        <h2 className="text-2xl font-semibold">No Remote Storage Configured</h2>
                        <p className="mt-2 text-muted-foreground">Add a remote storage mount to manage your files.</p>
                        <Button onClick={handleAddStorage} className="mt-6">
                            <Plus className="mr-2 h-4 w-4" /> Add Storage
                        </Button>
                    </div>
                )}
            </main>
            <StorageDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen}
                storageToEdit={storageToEdit}
            />
        </>
    )
}
