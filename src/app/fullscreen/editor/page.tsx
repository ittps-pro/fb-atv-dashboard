"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useDashboardStore, type WidgetVisibility } from '@/store/use-dashboard-store';
import { DashboardHeader } from '@/components/dashboard/header';
import { SortableWidget } from '@/components/dashboard/sortable-widget';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { layoutTemplates } from '@/lib/layout-templates';
import { Label } from '@/components/ui/label';

export default function LayoutEditorPage() {
  const { fullscreenLayout, widgets, setFullscreenLayout } = useDashboardStore();
  const { toast } = useToast();

  const [orderedWidgets, setOrderedWidgets] = useState<(keyof WidgetVisibility)[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Filter layout by visibility and set initial order
    const visibleLayout = fullscreenLayout.filter(id => widgets[id]);
    const allVisibleWidgets = (Object.keys(widgets) as (keyof WidgetVisibility)[]).filter(id => widgets[id]);

    // Ensure all visible widgets are in the layout, even if new ones were enabled
    const newLayout = [...visibleLayout];
    allVisibleWidgets.forEach(id => {
      if (!newLayout.includes(id)) {
        newLayout.push(id);
      }
    });

    setOrderedWidgets(newLayout);
    setIsMounted(true);
  }, [fullscreenLayout, widgets]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedWidgets((items) => {
        const oldIndex = items.indexOf(active.id as keyof WidgetVisibility);
        const newIndex = items.indexOf(over.id as keyof WidgetVisibility);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveChanges = () => {
    setFullscreenLayout(orderedWidgets);
    toast({
      title: "Layout Saved",
      description: "Your new widget layout has been saved.",
    });
  }

  const handleTemplateChange = (templateId: string) => {
    const template = layoutTemplates.find(t => t.id === templateId);
    if (template) {
        setFullscreenLayout(template.layout);
        toast({
            title: "Template Applied",
            description: `The "${template.name}" layout has been applied.`
        });
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
      
      <main className="relative z-10 p-4 md:p-6 space-y-8">
        <div className="flex justify-between items-center">
            <DashboardHeader />
            <div className="flex items-center gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="layout-template">Grid Template</Label>
                <Select onValueChange={handleTemplateChange}>
                  <SelectTrigger id="layout-template" className="w-[180px]">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {layoutTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveChanges}>Save Layout</Button>
            </div>
        </div>
        
        <p className="text-muted-foreground">Drag and drop widgets to reorder them. Your layout is persisted automatically.</p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={orderedWidgets} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-12 gap-6">
              {orderedWidgets.map((id) => (
                <SortableWidget key={id} id={id} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>
    </>
  );
}
