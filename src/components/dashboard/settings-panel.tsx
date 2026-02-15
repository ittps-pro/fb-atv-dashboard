"use client";

import { useDashboardStore } from '@/store/use-dashboard-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

export function SettingsPanel() {
  const { 
    widgets, 
    toggleWidgetVisibility,
  } = useDashboardStore();
  
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
        <div className="py-4 space-y-6">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
