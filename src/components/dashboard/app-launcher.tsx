import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apps } from '@/lib/mock-data';
import { Grid3x3 } from 'lucide-react';

export function AppLauncher() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Grid3x3 className="h-6 w-6 text-muted-foreground" />
          <CardTitle>App Launcher</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.href}
              className="group flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-300 hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="p-4 bg-secondary rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/30">
                <app.icon className="h-8 w-8 text-accent transition-colors duration-300 group-hover:text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground truncate">{app.name}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
