import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun } from 'lucide-react';

export function WeatherWidget() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Weather</CardTitle>
        <Sun className="h-4 w-4 text-yellow-400" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">72°F</div>
        <p className="text-xs text-muted-foreground">Partly Cloudy in San Francisco</p>
      </CardContent>
    </Card>
  );
}
