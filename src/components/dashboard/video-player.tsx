"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface VideoPlayerProps {
    src: string;
    title: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // This helps in reloading the video source when the src prop changes.
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [src]);

    return (
        <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <video
                    ref={videoRef}
                    key={src} // Keying the video element to its source ensures it re-mounts on src change
                    controls
                    autoPlay
                    className="w-full aspect-video rounded-lg bg-black"
                >
                    <source src={src} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </CardContent>
        </Card>
    )
}
