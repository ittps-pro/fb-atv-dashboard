import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';
import { newsItems } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

export function NewsWidget() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Top Headlines</CardTitle>
        <Newspaper className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {newsItems.map((item, index) => (
            <div key={item.id}>
              <a href="#" className="block">
                <div className="text-sm font-semibold leading-snug hover:text-accent transition-colors">{item.headline}</div>
                <p className="text-xs text-muted-foreground">{item.source}</p>
              </a>
              {index < newsItems.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
