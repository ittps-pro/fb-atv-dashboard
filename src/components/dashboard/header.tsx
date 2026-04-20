"use client";

import { useState } from 'react';
import { Mic, Zap, Activity, PanelLeft, Tv, Search, ChevronsUpDown, Check, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SettingsPanel } from './settings-panel';
import { useSidebar } from '../ui/sidebar';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';


const StatusIcon = ({ status }: { status: 'online' | 'offline' | 'loading' | undefined }) => {
    if (status === 'loading') return <Loader2 className="h-3 w-3 animate-spin" />;
    const color = status === 'online' ? 'bg-green-500' : 'bg-gray-500';
    return <div className={cn("h-2 w-2 rounded-full", color)}></div>;
}


export function DashboardHeader() {
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const { 
      toggleEventLog, 
      devices, 
      activeDeviceId, 
      setActiveDeviceId, 
      addLog, 
      toggleCommandPalette, 
      deviceStatuses, 
      checkDeviceStatus 
  } = useDashboardStore();
  const activeDevice = devices.find(d => d.id === activeDeviceId);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleVoiceControl = () => {
    toast({
      title: "Voice Control",
      description: "Voice control is not yet implemented.",
    });
  };
  
  const handleDeviceChange = (id: string | null) => {
    setActiveDeviceId(id);
    const deviceName = devices.find(d => d.id === id)?.name || 'None';
    addLog({ message: `Switched to device: ${deviceName}`, type: 'info' });
    setIsPopoverOpen(false);
  }

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <PanelLeft />
        </Button>
        <Zap className="h-8 w-8 text-accent hidden md:flex" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Action Dashboard</h1>
      </div>
       <div className="flex items-center gap-2">
        <Button 
            variant="outline"
            className="relative h-9 w-full justify-start rounded-[0.5rem] bg-secondary/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
            onClick={toggleCommandPalette}
        >
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline-flex">Search...</span>
            <span className="inline-flex lg:hidden">Search...</span>
            <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
            </kbd>
        </Button>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isPopoverOpen}
              className="w-48 justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                {activeDevice ? (
                  <>
                    <StatusIcon status={deviceStatuses[activeDevice.id]} />
                    <span className="truncate">{activeDevice.name}</span>
                  </>
                ) : "No Device"}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <div className="p-2 border-b">
                <p className="text-sm font-medium px-2">Available Devices</p>
            </div>
            <div className="flex flex-col p-1">
                {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-1 rounded-md hover:bg-accent/50 group">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 h-auto py-2"
                            onClick={() => handleDeviceChange(device.id)}
                        >
                            <StatusIcon status={deviceStatuses[device.id]} />
                            <span className="truncate">{device.name}</span>
                            {activeDeviceId === device.id && <Check className="ml-auto h-4 w-4" />}
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                        onClick={() => checkDeviceStatus(device)}
                                        disabled={deviceStatuses[device.id] === 'loading'}
                                    >
                                    {deviceStatuses[device.id] === 'loading' ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>Check Status</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ))}
                {devices.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No devices configured.</p>}
            </div>
          </PopoverContent>
        </Popover>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleVoiceControl} aria-label="Voice Control">
                <Mic className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voice Control</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleEventLog} aria-label="Event Log">
                <Activity className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Event Log</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <SettingsPanel />
       </div>
    </header>
  );
}
