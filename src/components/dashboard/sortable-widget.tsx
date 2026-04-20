"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { type WidgetVisibility } from '@/store/use-dashboard-store';
import { cn } from '@/lib/utils';
import { WidgetRenderer } from './widget-renderer';


type SortableWidgetProps = {
  id: keyof WidgetVisibility;
};

export function SortableWidget({ id }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };
  
  const isFullWidth = id === 'recommendations';
  const isHalfWidth = ['news', 'videoStream'].includes(id);

  const cardClassName = cn({
      'col-span-12': isFullWidth,
      'col-span-12 lg:col-span-8': isHalfWidth,
      'col-span-12 lg:col-span-4': !isFullWidth && !isHalfWidth,
  });

  return (
    <div ref={setNodeRef} style={style} className={cardClassName}>
        <div className="relative group/widget h-full">
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 p-1.5 bg-secondary border rounded-md cursor-grab active:cursor-grabbing transition-opacity z-10"
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <WidgetRenderer widgetId={id} />
        </div>
    </div>
  );
}
