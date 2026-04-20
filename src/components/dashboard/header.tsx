
"use client";

import { Mic, Zap, Activity, PanelLeft, Tv, Search } from 'lucide-react';
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

export function DashboardHeader() {
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const { toggleEventLog, devices, activeDeviceId, setActiveDeviceId, addLog, toggleCommandPalette } = useDashboardStore();
  const activeDevice = devices.find(d => d.id === activeDeviceId);

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-40 justify-start">
              <Tv className="mr-2" />
              <span className="truncate">{activeDevice ? activeDevice.name : "No Device"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Select Device</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {devices.map(device => (
              <DropdownMenuItem key={device.id} onSelect={() => handleDeviceChange(device.id)}>
                {device.name}
              </DropdownMenuItem>
            ))}
            {devices.length === 0 && <DropdownMenuItem disabled>No devices configured</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>

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
