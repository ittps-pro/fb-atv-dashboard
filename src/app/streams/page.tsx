"use client"

import { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/use-dashboard-store";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { VideoStreamWidget } from "@/components/dashboard/video-stream-widget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamDialog } from "@/components/dashboard/stream-dialog";
import type { Stream } from "@/types/streams";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { StreamCard } from "@/components/dashboard/stream-card";


export default function StreamsPage() {
    const { streams, torrentStream, fetchStreams, setStreams, checkAllStreamStatuses } = useDashboardStore();
    const { toast } = useToast();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [streamToEdit, setStreamToEdit] = useState<Stream | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStreams = async () => {
            setIsLoading(true);
            await fetchStreams();
            setIsLoading(false);
        }
        loadStreams();
    }, [fetchStreams]);
    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
          const oldIndex = streams.findIndex(s => s.id === active.id);
          const newIndex = streams.findIndex(s => s.id === over.id);
          setStreams(arrayMove(streams, oldIndex, newIndex));
        }
    };

    const handleAddStream = () => {
        setStreamToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEditStream = (stream: Stream) => {
        setStreamToEdit(stream);
        setIsDialogOpen(true);
    };
    
    const handleCheckStatuses = async () => {
        toast({ title: "Checking stream statuses..." });
        await checkAllStreamStatuses();
        toast({ title: "Status check complete." });
    }

    return (
        <>
          <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
          <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
            <DashboardHeader />

            <Tabs defaultValue="direct" className="flex-grow flex flex-col">
                <div className="flex justify-between items-center">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="direct">Direct & Live Streams</TabsTrigger>
                        <TabsTrigger value="torrent">Torrent Stream</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={handleCheckStatuses}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Check Statuses
                        </Button>
                        <Button onClick={handleAddStream}>
                            <Plus className="mr-2 h-4 w-4" /> Add Stream
                        </Button>
                    </div>
                </div>
                <TabsContent value="direct" className="mt-6 flex-grow">
                    {isLoading ? (
                         <div className="flex flex-col items-center justify-center text-center py-16 flex-grow">
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        </div>
                    ) : streams.length > 0 ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={streams} strategy={rectSortingStrategy}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {streams.map((stream) => (
                                        <StreamCard key={stream.id} stream={stream} onEdit={handleEditStream} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center py-16 flex-grow">
                            <h2 className="text-2xl font-semibold">No Streams Configured</h2>
                            <p className="mt-2 text-muted-foreground">Get started by adding a new video stream.</p>
                            <Button onClick={handleAddStream} className="mt-6">
                                <Plus className="mr-2 h-4 w-4" /> Add Stream
                            </Button>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="torrent" className="mt-6">
                    <VideoStreamWidget initialMagnetUri={torrentStream.magnetUri} />
                </TabsContent>
            </Tabs>
          </main>
          <StreamDialog 
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            streamToEdit={streamToEdit}
          />
        </>
    )
}
