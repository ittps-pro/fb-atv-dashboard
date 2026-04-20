"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

// Dynamically import hls.js to ensure it's only loaded on the client
import type Hls from 'hls.js';

interface VideoPlayerProps {
    src: string;
    title: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const playVideo = () => {
          video.play().catch(error => {
            console.warn("Autoplay was prevented:", error);
            // For this demo, we'll just log it. The user has controls to start playback.
          });
        };

        // Clean up previous HLS instance if it exists
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (src.endsWith('.m3u8')) {
            import('hls.js').then(({ default: Hls }) => {
                if (videoRef.current) { // Check again inside async callback
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hlsRef.current = hls;
                        hls.loadSource(src);
                        hls.attachMedia(videoRef.current);
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                           playVideo();
                        });
                    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                        // Native HLS support (e.g., Safari)
                        videoRef.current.src = src;
                        videoRef.current.addEventListener('loadedmetadata', playVideo);
                    }
                }
            });
        } else {
            // For regular MP4 files
            video.src = src;
            video.addEventListener('loadedmetadata', playVideo);
        }

        return () => {
             if (video) {
                video.removeEventListener('loadedmetadata', playVideo);
             }
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
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
                    controls
                    playsInline
                    className="w-full aspect-video rounded-lg bg-black"
                >
                    Your browser does not support the video tag.
                </video>
            </CardContent>
        </Card>
    )
}
