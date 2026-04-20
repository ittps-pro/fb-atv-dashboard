"use client";

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { type Device } from '@/types/devices';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Wifi, Plus, Pencil, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { themes } from '@/lib/themes';
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
import { DeviceConnectionWizard } from './device-connection-wizard';
import { cn } from '@/lib/utils';


export function SettingsPanel() {
  const { 
    widgets, 
    toggleWidgetVisibility,
    devices,
    removeDevice,
    addLog,
    theme,
    setTheme,
    fetchDevices,
  } = useDashboardStore();
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleAddDeviceClick = () => {
    setDeviceToEdit(null);
    setIsWizardOpen(true);
  }

  const handleEditDeviceClick = (device: Device) => {
    setDeviceToEdit(device);
    setIsWizardOpen(true);
  }

  const handleDeleteDevice = async (device: Device) => {
    await removeDevice(device.id);
    addLog({ message: `Device removed: ${device.name}`, type: 'info' });
  }

  const getConnectionDetails = (device: Device) => {
    switch (device.connectionType) {
      case 'direct':
        return `${device.ip}:${device.port || 5555}`;
      case 'tunnel':
        return 'via Tunnel';
      case 'reverse-tunnel':
          return `via Reverse Tunnel`;
      default:
        return 'N/A';
    }
  }

  return (
    <>
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
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="space-y-2">
                <Label htmlFor="theme-select">Color Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme-select">
                      <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                      {themes.map((themeOption) => (
                          <SelectItem key={themeOption.name} value={themeOption.name}>
                              {themeOption.label}
                          </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Wifi size={20} /> Device Configuration</h3>
                  <Button size="sm" onClick={handleAddDeviceClick}>
                    <Plus className="mr-2 h-4 w-4" /> Add Device
                  </Button>
              </div>

              <div className="space-y-2">
                  {devices.length > 0 ? (
                      devices.map((device) => (
                          <div key={device.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                              <div>
                                  <p className="font-medium">{device.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    <span className={cn("capitalize p-1 rounded-md text-xs", {
                                      "bg-blue-500/10 text-blue-400": device.connectionType === 'direct',
                                      "bg-purple-500/10 text-purple-400": device.connectionType === 'tunnel',
                                      "bg-teal-500/10 text-teal-400": device.connectionType === 'reverse-tunnel',
                                    })}>{device.connectionType.replace('-', ' ')}</span>
                                    <span className="ml-2">{getConnectionDetails(device)}</span>
                                  </p>
                              </div>
                              <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditDeviceClick(device)}>
                                      <Pencil className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the device
                                          "{device.name}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteDevice(device)}>Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                              </div>
                          </div>
                      ))
                  ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No devices configured.</p>
                  )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                  Ensure Network/ADB debugging is enabled on your devices.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <DeviceConnectionWizard 
        open={isWizardOpen} 
        onOpenChange={setIsWizardOpen}
        deviceToEdit={deviceToEdit}
      />
    </>
  );
}
