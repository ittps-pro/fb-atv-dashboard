"use client"

import { useState } from "react";
import { allStreams } from "@/lib/mock-data";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { VideoPlayer } from "@/components/dashboard/video-player";
import { Separator } from "@/components/ui/separator";

// Group streams by category
const streamGroups = allStreams.reduce((acc, stream) => {
    (acc[stream.category] = acc[stream.category] || []).push(stream);
    return acc;
}, {} as Record<string, typeof allStreams>);


export default function StreamsPage() {
    const [selectedStream, setSelectedStream] = useState(allStreams[0]);

    return (
        <>
          <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
          <main className="relative z-10 p-4 md:p-6 space-y-8">
            <DashboardHeader />
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8">
                    <VideoPlayer src={selectedStream.url} title={selectedStream.name} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Available Streams</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {Object.entries(streamGroups).map(([category, streams], index) => (
                                <div key={category}>
                                    {index > 0 && <Separator className="my-4" />}
                                    <h3 className="text-lg font-semibold mb-2 px-2">{category}</h3>
                                    {streams.map((stream) => (
                                        <Button
                                            key={stream.id}
                                            variant={selectedStream.id === stream.id ? "secondary" : "ghost"}
                                            onClick={() => setSelectedStream(stream)}
                                            className="justify-start gap-2 w-full"
                                        >
                                            <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                            <span>{stream.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
          </main>
        </>
    )
}
