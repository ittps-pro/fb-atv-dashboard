"use client";

import type { PersonalizedContentRecommendationsOutput } from "@/ai/flows/personalized-content-recommendations";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { PlayCircle, Tv } from 'lucide-react';

type ContentRecommendationsProps = {
  recommendations: (PersonalizedContentRecommendationsOutput[0] & { imageUrl: string; imageHint: string })[];
};

export function ContentRecommendations({ recommendations }: ContentRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="col-span-12 h-full flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm py-12">
        <CardHeader>
          <CardTitle>No Recommendations Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">We couldn't generate recommendations at this time. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="col-span-12">
      <div className="flex items-center gap-3 mb-4 px-1">
        <Tv className="h-6 w-6 text-muted-foreground" />
        <h2 className="text-xl font-semibold">For You</h2>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {recommendations.map((item, index) => (
            <CarouselItem key={index} className="pl-2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1">
                <Card className="overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-accent/20 hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="p-0 relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={300}
                      height={450}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={item.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <CardTitle className="text-primary-foreground text-xl">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary">{item.genre}</Badge>
                        <Badge variant="outline" className="capitalize">{item.type.replace('_', ' ')}</Badge>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</CardDescription>
                    <p className="text-xs text-accent/80 italic">"{item.reason}"</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      <PlayCircle className="mr-2 h-4 w-4" /> Watch Now
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
