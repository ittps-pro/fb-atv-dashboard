"use client";

import { Mic, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DashboardHeader() {
  const { toast } = useToast();

  const handleVoiceControl = () => {
    toast({
      title: "Voice Control",
      description: "Voice control is not yet implemented.",
    });
  };

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8 text-accent" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Action Dashboard</h1>
      </div>
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
    </header>
  );
}
