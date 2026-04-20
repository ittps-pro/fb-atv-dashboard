"use client";

import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { DashboardHeader } from '@/components/dashboard/header';
import { WidgetRenderer } from '@/components/dashboard/widget-renderer';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function FullscreenViewPage() {
  const { fullscreenLayout, widgets } = useDashboardStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const visibleWidgets = fullscreenLayout.filter(id => widgets[id]);

  return (
    <>
      <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
      
      <main className="relative z-10 p-4 md:p-6 space-y-8">
        <DashboardHeader />
        
        <div className="grid grid-cols-12 gap-6">
          {visibleWidgets.map((widgetId) => {
            const isFullWidth = widgetId === 'recommendations';
            const isHalfWidth = ['news', 'videoStream'].includes(widgetId);
            const cardClassName = cn({
              'col-span-12': isFullWidth,
              'col-span-12 lg:col-span-8': isHalfWidth,
              'col-span-12 lg:col-span-4': !isFullWidth && !isHalfWidth,
            });

            return (
              <div key={widgetId} className={cardClassName}>
                <WidgetRenderer widgetId={widgetId} />
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
