"use client";

import { useEffect, useState } from "react";
import { personalizedContentRecommendations } from "@/ai/flows/personalized-content-recommendations";
import { AppLauncher } from "@/components/dashboard/app-launcher";
import { ContentRecommendations } from "@/components/dashboard/content-recommendations";
import { DashboardHeader } from "@/components/dashboard/header";
import { NewsWidget } from "@/components/dashboard/news-widget";
import { SportsWidget } from "@/components/dashboard/sports-widget";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";
import type { PersonalizedContentRecommendationsOutput } from "@/ai/flows/personalized-content-recommendations";
import { FileManager } from "@/components/dashboard/file-manager";
import { VideoStreamWidget } from "@/components/dashboard/video-stream-widget";
import { useDashboardStore } from "@/store/use-dashboard-store";
import { RemoteControlWidget } from "@/components/dashboard/remote-control";
import { Loader2 } from "lucide-react";
import { NotesWidget } from "@/components/dashboard/notes-widget";


function RecommendationsSkeleton() {
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
  )
}

function RecommendationsLoader() {
  const [recommendations, setRecommendations] = useState<(PersonalizedContentRecommendationsOutput[0] & { imageUrl: string; imageHint: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const viewingHistory = ["The Matrix", "Blade Runner 2049"];
        const preferences = ["sci-fi", "dystopian future", "action movies"];
        const rawRecommendations = await personalizedContentRecommendations({
          viewingHistory,
          preferences,
        });
        
        const augmented = rawRecommendations.map((rec, index) => {
          const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
          return {
            ...rec,
            imageUrl: placeholder.imageUrl,
            imageHint: placeholder.imageHint,
          };
        });
        setRecommendations(augmented);
      } catch (error) {
        console.error("Failed to get recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (isLoading) {
    return <RecommendationsSkeleton />;
  }

  return <ContentRecommendations recommendations={recommendations} />;
}


export default function Home() {
  const { widgets, torrentStream, fetchDevices, fetchTunnels } = useDashboardStore();
  
  // This state helps prevent hydration mismatches with persisted zustand state.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    fetchDevices();
    fetchTunnels();
  }, [fetchDevices, fetchTunnels]);

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
        <DashboardHeader />

        {widgets.recommendations && <RecommendationsLoader />}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {widgets.appLauncher && <AppLauncher />}
            {widgets.fileManager && <FileManager />}
            {widgets.notes && <NotesWidget />}
          </div>
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {widgets.videoStream && <VideoStreamWidget initialMagnetUri={torrentStream.magnetUri} />}
            {widgets.news && <div className="sm:col-span-2"><NewsWidget /></div>}
            {widgets.weather && <WeatherWidget />}
            {widgets.sports && <SportsWidget />}
            {widgets.remoteControl && <RemoteControlWidget />}
          </div>
        </div>
      </main>
    </>
  );
}
