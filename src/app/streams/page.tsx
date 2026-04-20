"use client"

import { useState } from "react";
import { useDashboardStore } from "@/store/use-dashboard-store";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { VideoPlayer } from "@/components/dashboard/video-player";
import { Separator } from "@/components/ui/separator";
import { VideoStreamWidget } from "@/components/dashboard/video-stream-widget";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamDialog } from "@/components/dashboard/stream-dialog";
import type { Stream } from "@/types/streams";
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
import { useToast } from "@/hooks/use-toast";


export default function StreamsPage() {
    const { streams, torrentStream, removeStream, addLog } = useDashboardStore();
    const { toast } = useToast();
    
    const [selectedStream, setSelectedStream] = useState(streams.length > 0 ? streams[0] : { id: 'placeholder', name: 'No Stream Selected', url: '', category: ''});
    const [customUrl, setCustomUrl] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [streamToEdit, setStreamToEdit] = useState<Stream | null>(null);

    // Group streams by category
    const streamGroups = streams.reduce((acc, stream) => {
        (acc[stream.category] = acc[stream.category] || []).push(stream);
        return acc;
    }, {} as Record<string, typeof streams>);


    const handlePlayCustomUrl = () => {
        if (customUrl.trim()) {
            setSelectedStream({
                id: 'custom-url',
                name: 'Custom Stream',
                url: customUrl,
                category: 'Custom'
            });
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

    const handleDeleteStream = (stream: Stream) => {
        removeStream(stream.id);
        toast({ title: "Stream Removed", description: `${stream.name} has been deleted.` });
        addLog({ message: `Stream removed: ${stream.name}`, type: 'info' });
        if (selectedStream.id === stream.id) {
            const newStreams = streams.filter(s => s.id !== stream.id);
            setSelectedStream(newStreams.length > 0 ? newStreams[0] : { id: 'placeholder', name: 'No Stream Selected', url: '', category: ''});
        }
    };

    return (
        <>
          <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
          <main className="relative z-10 p-4 md:p-6 space-y-8">
            <DashboardHeader />

            <Tabs defaultValue="direct">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="direct">Direct & Live Streams</TabsTrigger>
                    <TabsTrigger value="torrent">Torrent Stream</TabsTrigger>
                </TabsList>
                <TabsContent value="direct" className="mt-6">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8">
                            <VideoPlayer src={selectedStream.url} title={selectedStream.name} />
                        </div>
                        <div className="col-span-12 lg:col-span-4">
                            <Card className="bg-card/50 backdrop-blur-sm h-full max-h-[calc(100vh-12rem)] flex flex-col">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Available Streams</CardTitle>
                                    <Button size="sm" variant="ghost" onClick={handleAddStream}>
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-hidden flex flex-col gap-4">
                                     <div className="px-2 space-y-2 shrink-0">
                                        <h3 className="text-lg font-semibold">Play from URL</h3>
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="Enter stream URL (.mp4, .m3u8)"
                                                value={customUrl}
                                                onChange={(e) => setCustomUrl(e.target.value)}
                                            />
                                            <Button onClick={handlePlayCustomUrl}>Play</Button>
                                        </div>
                                     </div>
                                     <Separator className="shrink-0" />
                                     <ScrollArea className="pr-4">
                                        <div className="flex flex-col gap-2">
                                            {Object.entries(streamGroups).map(([category, streamsInCategory], index) => (
                                                <div key={category}>
                                                    <h3 className="text-lg font-semibold mb-2 px-2">{category}</h3>
                                                    {streamsInCategory.map((stream) => (
                                                        <div key={stream.id} className="flex items-center justify-between group rounded-md hover:bg-accent/50">
                                                            <Button
                                                                variant={selectedStream.id === stream.id ? "secondary" : "ghost"}
                                                                onClick={() => setSelectedStream(stream)}
                                                                className="justify-start gap-2 flex-grow bg-transparent hover:bg-transparent"
                                                            >
                                                                <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                                                <span>{stream.name}</span>
                                                            </Button>
                                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStream(stream)}><Pencil className="h-4 w-4" /></Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>This will permanently delete the stream "{stream.name}".</AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDeleteStream(stream)}>Delete</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {index < Object.keys(streamGroups).length - 1 && <Separator className="my-4" />}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
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
