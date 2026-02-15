"use client";

import { Mic, Zap, Activity, PanelLeft } from 'lucide-react';
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

export function DashboardHeader() {
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const { toggleEventLog } = useDashboardStore();

  const handleVoiceControl = () => {
    toast({
      title: "Voice Control",
      description: "Voice control is not yet implemented.",
    });
  };

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
