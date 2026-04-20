'use client';

import React from 'react';
import { useDashboardStore, type WidgetVisibility } from '@/store/use-dashboard-store';

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


const widgetComponentMap: Record<keyof WidgetVisibility, React.ComponentType<any>> = {
  appLauncher: AppLauncher,
  fileManager: FileManager,
  news: NewsWidget,
  sports: SportsWidget,
  weather: WeatherWidget,
  videoStream: VideoStreamWidget,
  remoteControl: RemoteControlWidget,
  notes: NotesWidget,
  recommendations: RecommendationsLoader,
};

interface WidgetRendererProps {
  widgetId: keyof WidgetVisibility;
}

export function WidgetRenderer({ widgetId }: WidgetRendererProps) {
    const { torrentStream } = useDashboardStore();
    const WidgetComponent = widgetComponentMap[widgetId];

    if (!WidgetComponent) {
        return null;
    }
    
    // Special case for components that need specific props
    if (widgetId === 'videoStream') {
        return <VideoStreamWidget initialMagnetUri={torrentStream.magnetUri} />;
    }

    return <WidgetComponent />;
}
