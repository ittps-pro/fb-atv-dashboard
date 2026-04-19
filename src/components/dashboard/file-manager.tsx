"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useDashboardStore } from '@/store/use-dashboard-store';


type Status = 'idle' | 'uploading' | 'installing' | 'success' | 'error';

export function FileManager() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { devices, activeDeviceId, addLog } = useDashboardStore();
  const activeDevice = devices.find(d => d.id === activeDeviceId);
  const atvDeviceIp = activeDevice?.ip;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (files[0].name.endsWith('.apk')) {
        setFile(files[0]);
        setStatus('idle');
        setProgress(0);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a .apk file.",
          variant: "destructive",
        });
        setFile(null);
      }
    }
  };

  const handleInstall = async () => {
    if (!atvDeviceIp) {
      const msg = "No active Android TV device selected.";
      addLog({ message: `Install failed: ${msg}`, type: 'error' });
      toast({ title: 'Installation Failed', description: msg, variant: "destructive" });
      return;
    }
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an APK file to install.",
        variant: "destructive",
      });
      return;
    }

    setStatus('uploading');
    setProgress(0);
    addLog({ message: `Starting upload of ${file.name}`, type: 'info' });
    
    const uploadInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
    }, 200);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('deviceIp', atvDeviceIp);

    try {
      const response = await fetch('/api/install', {
        method: 'POST',
        body: formData,
      });

      clearInterval(uploadInterval);
      setProgress(95);
      setStatus('installing');
      addLog({ message: `File uploaded, starting installation on ${activeDevice?.name}`, type: 'info' });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Installation failed on the server.');
      }
      
      setProgress(100);
      setStatus('success');
      addLog({ message: result.message, type: 'info' });
      toast({
        title: 'Installation Successful',
        description: result.message,
      });

    } catch (error: any) {
      clearInterval(uploadInterval);
      setStatus('error');
      setProgress(0);
      addLog({ message: `Installation failed: ${error.message}`, type: 'error' });
      toast({
        title: 'Installation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusContent = () => {
    switch(status) {
        case 'uploading':
        case 'installing':
            return (
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{status === 'uploading' ? 'Uploading...' : 'Installing...'}</span>
                </div>
            )
        case 'success':
            return (
                <div className="flex items-center space-x-2 text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <span>Success!</span>
                </div>
            )
        case 'error':
            return (
                <div className="flex items-center space-x-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Failed</span>
                </div>
            )
        default:
            return null;
    }
  }

  const isProcessing = status === 'uploading' || status === 'installing';

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <CardTitle>App Installer</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Input id="apk-file" type="file" accept=".apk" onChange={handleFileChange} disabled={isProcessing} />
            {file && <p className="text-sm text-muted-foreground truncate">Selected: {file.name}</p>}
        </div>
        
        { (progress > 0 || isProcessing) &&
            <div className="space-y-2">
                <Progress value={progress} className="w-full h-2" />
                <div className="h-5 text-sm">
                    {getStatusContent()}
                </div>
            </div>
        }

        <Button onClick={handleInstall} disabled={!file || isProcessing} className="w-full">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Install App
        </Button>
      </CardContent>
    </Card>
  );
}
