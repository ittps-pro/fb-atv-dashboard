"use client";

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Wifi } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

export function SettingsPanel() {
  const { 
    widgets, 
    toggleWidgetVisibility,
    atvDeviceIp,
    setAtvDeviceIp,
    addLog,
  } = useDashboardStore();

  const [ipAddress, setIpAddress] = useState(atvDeviceIp || '');
  const { toast } = useToast();

  useEffect(() => {
    setIpAddress(atvDeviceIp || '');
  }, [atvDeviceIp]);

  const handleSaveIp = () => {
    setAtvDeviceIp(ipAddress);
    addLog({ message: `Device IP set to ${ipAddress}`, type: 'info' });
    toast({
      title: 'Device IP Saved',
      description: `The Android TV IP address has been updated.`,
    });
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[350px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Visible Widgets</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(widgets).map((widgetKey) => (
                <div key={widgetKey} className="flex items-center space-x-2">
                  <Switch
                    id={widgetKey}
                    checked={widgets[widgetKey as keyof typeof widgets]}
                    onCheckedChange={() => toggleWidgetVisibility(widgetKey as keyof typeof widgets)}
                  />
                  <Label htmlFor={widgetKey} className="capitalize">{widgetKey.replace(/([A-Z])/g, ' $1')}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wifi size={20} /> Device Configuration</h3>
            <div className="space-y-2">
              <Label htmlFor="device-ip">Android TV IP Address</Label>
              <div className="flex gap-2">
                <Input 
                  id="device-ip" 
                  placeholder="e.g., 192.168.1.100"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
                <Button onClick={handleSaveIp}>Save</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the local IP address of your Android TV device. Ensure Network/ADB debugging is enabled.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
