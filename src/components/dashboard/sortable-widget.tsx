"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import type { WidgetVisibility } from '@/store/use-dashboard-store';
import { cn } from '@/lib/utils';

// Import all possible widget components
import { AppLauncher } from './app-launcher';
import { FileManager } from './file-manager';
import { NewsWidget } from './news-widget';
import { SportsWidget } from './sports-widget';
import { WeatherWidget } from './weather-widget';
import { VideoStreamWidget } from './video-stream-widget';
import { RemoteControlWidget } from './remote-control';
import { NotesWidget } from './notes-widget';
import { ContentRecommendations } from './content-recommendations';
import { Skeleton } from '../ui/skeleton';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { PersonalizedContentRecommendationsOutput } from "@/ai/flows/personalized-content-recommendations";
import { videoStream as webtorrentStream } from "@/lib/mock-data";


// A mapping from widget key to component
const widgetComponentMap: Record<keyof WidgetVisibility, React.ComponentType<any>> = {
  appLauncher: AppLauncher,
  fileManager: FileManager,
  news: NewsWidget,
  sports: SportsWidget,
  weather: WeatherWidget,
  videoStream: () => <VideoStreamWidget initialMagnetUri={webtorrentStream.magnetUri} />,
  remoteControl: RemoteControlWidget,
  notes: NotesWidget,
  recommendations: () => <RecommendationsLoader />,
};

// This is a temporary copy from page.tsx to avoid prop drilling issues in this example.
// In a real app, this data fetching logic might be moved to a custom hook or a higher-level component.
function RecommendationsLoader() {
  const [recommendations, setRecommendations] = React.useState<(PersonalizedContentRecommendationsOutput[0] & { imageUrl: string; imageHint: string })[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRecommendations() {
      // Fake delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      const augmented = PlaceHolderImages.map((placeholder, index) => ({
        type: 'movie',
        title: `Recommendation ${index + 1}`,
        genre: 'Action',
        description: placeholder.description,
        reason: 'Because you like similar items.',
        imageUrl: placeholder.imageUrl,
        imageHint: placeholder.imageHint,
      }));
      setRecommendations(augmented.slice(0, 4));
      setIsLoading(false);
    }
    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="col-span-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <ContentRecommendations recommendations={recommendations} />;
}


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

  const WidgetComponent = widgetComponentMap[id];

  if (!WidgetComponent) {
    return null; // Or a placeholder for an unknown widget
  }
  
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
                className="absolute top-2 right-2 p-1.5 bg-background/50 border rounded-md cursor-grab active:cursor-grabbing opacity-0 group-hover/widget:opacity-100 transition-opacity z-10"
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <WidgetComponent />
        </div>
    </div>
  );
}
