"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [torrentFile, setTorrentFile] = useState<File | null>(null);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (files[0].name.endsWith('.torrent')) {
        setTorrentFile(files[0]);
        setMagnetUri(''); // Clear magnet URI if a file is selected
        toast({ title: "File selected", description: files[0].name });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a .torrent file.",
          variant: "destructive",
        });
        setTorrentFile(null);
        event.target.value = ''; // Clear the input
      }
    }
  };

  const handleMagnetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setMagnetUri(event.target.value);
      if (event.target.value && torrentFile) {
          setTorrentFile(null); // Clear file if magnet URI is being entered
          // Also clear the file input visually
          const fileInput = document.getElementById('torrent-file') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
      }
  }
  
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
    const source = magnetUri || torrentFile;
    if (!client || !source) {
      toast({
        title: 'No source provided',
        description: 'Please enter a magnet URI or select a .torrent file.',
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

    client.add(source, (torrent: Torrent) => {
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
  
  const isProcessing = isStreaming || isPreparing;

  return (
    <Card className="bg-card/50 backdrop-blur-sm col-span-12">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Video className="h-6 w-6 text-muted-foreground" />
          <CardTitle>WebTorrent Streamer</CardTitle>
        </div>
        <CardDescription>
            Stream videos directly from torrents. Enter a magnet URI or upload a .torrent file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="magnet-uri">Magnet URI</Label>
            <Input 
                id="magnet-uri"
                placeholder="Enter magnet URI..."
                value={magnetUri}
                onChange={handleMagnetChange}
                disabled={isProcessing || !!torrentFile}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="torrent-file">Or Upload .torrent file</Label>
            <Input 
                id="torrent-file"
                type="file" 
                accept=".torrent" 
                onChange={handleFileChange} 
                disabled={isProcessing || !!magnetUri} 
            />
          </div>
        </div>

        <div className="flex justify-end">
            {isProcessing ? (
              <Button onClick={stopStreaming} variant="destructive">
                Stop Stream
              </Button>
            ) : (
              <Button onClick={startStreaming} disabled={!magnetUri && !torrentFile}>
                {isPreparing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
                Stream
              </Button>
            )}
        </div>
        
        {isPreparing && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        <div ref={videoRef} className="bg-black rounded-lg [&>video]:w-full [&>video]:rounded-lg [&>video]:max-h-[500px] [&>video]:aspect-video">
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
