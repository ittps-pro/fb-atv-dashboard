"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

// Dynamically import webtorrent as it's a client-side library
type WebTorrentInstance = import('webtorrent').Instance;
type Torrent = import('webtorrent').Torrent;

interface VideoStreamWidgetProps {
  initialMagnetUri?: string;
}

export function VideoStreamWidget({ initialMagnetUri = '' }: VideoStreamWidgetProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [client, setClient] = useState<WebTorrentInstance | null>(null);
  const [magnetUri, setMagnetUri] = useState(initialMagnetUri);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    import('webtorrent').then((WebTorrentModule) => {
      const WebTorrent = WebTorrentModule.default;
      const wt = new WebTorrent();
      setClient(wt);

      const interval = setInterval(() => {
        setDownloadSpeed(wt.downloadSpeed);
        setUploadSpeed(wt.uploadSpeed);
        setProgress(wt.progress * 100);
      }, 1000);

      return () => {
        wt.destroy();
        clearInterval(interval);
      };
    });
  }, []);
  
  const stopStreaming = () => {
    if (client) {
      client.torrents.forEach(torrent => torrent.destroy());
    }
    if (videoRef.current) {
        videoRef.current.innerHTML = '';
    }
    setIsStreaming(false);
    setIsPreparing(false);
    setProgress(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
  }

  const startStreaming = () => {
    if (!client || !magnetUri) {
      toast({
        title: 'Invalid Magnet URI',
        description: 'Please enter a valid magnet URI to start streaming.',
        variant: 'destructive',
      });
      return;
    }
    
    stopStreaming(); // Stop any existing stream
    setIsPreparing(true);
    
    toast({
      title: 'Starting Stream',
      description: 'Fetching torrent metadata...',
    });

    client.add(magnetUri, (torrent: Torrent) => {
      setIsPreparing(false);
      setIsStreaming(true);
      
      toast({
        title: 'Stream Started',
        description: `Now streaming: ${torrent.name}`,
      });

      const file = torrent.files.find((f) => f.name.endsWith('.mp4') || f.name.endsWith('.mkv') || f.name.endsWith('.webm'));
      
      if (file && videoRef.current) {
        file.appendTo(videoRef.current, { autoplay: true, muted: false });
        // Make sure video has controls
        const videoElement = videoRef.current.querySelector('video');
        if (videoElement) {
          videoElement.controls = true;
          videoElement.classList.add('w-full', 'rounded-lg', 'max-h-[500px]');
        }
      } else {
        toast({
            title: 'No video file found',
            description: 'Could not find a playable video file in this torrent.',
            variant: 'destructive'
        });
        stopStreaming();
      }
      
      torrent.on('error', (err) => {
          console.error(err);
          toast({
            title: 'Torrent Error',
            description: typeof err === 'string' ? err : (err as Error).message,
            variant: 'destructive'
        });
        stopStreaming();
      });
    });
  };

  const formatSpeed = (speed: number) => {
    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let i = 0;
    while (speed >= 1024 && i < units.length - 1) {
      speed /= 1024;
      i++;
    }
    return `${speed.toFixed(2)} ${units[i]}`;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm col-span-12">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Video className="h-6 w-6 text-muted-foreground" />
          <CardTitle>WebTorrent Streamer</CardTitle>
        </div>
        <CardDescription>
            Stream videos directly from torrents. Enter a magnet URI below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
            <Input 
                placeholder="Enter magnet URI..."
                value={magnetUri}
                onChange={(e) => setMagnetUri(e.target.value)}
                disabled={isStreaming || isPreparing}
            />
            {isStreaming || isPreparing ? (
              <Button onClick={stopStreaming} variant="destructive">
                Stop
              </Button>
            ) : (
              <Button onClick={startStreaming} disabled={!magnetUri}>
                Stream
              </Button>
            )}
        </div>
        
        {isPreparing && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        <div ref={videoRef} className="aspect-video bg-black rounded-lg">
            {/* The video will be appended here by WebTorrent */}
        </div>

        {isStreaming && (
            <div className="space-y-2 pt-4">
                <Progress value={progress} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Download: {formatSpeed(downloadSpeed)}</span>
                    <span>Upload: {formatSpeed(uploadSpeed)}</span>
                    <span>Progress: {progress.toFixed(2)}%</span>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
