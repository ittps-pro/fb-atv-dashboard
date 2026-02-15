import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { sportsScore } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

export function SportsWidget() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{sportsScore.league} Score</CardTitle>
        <Trophy className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-lg font-semibold truncate">{sportsScore.teamA.name}</p>
                <p className="text-3xl font-bold">{sportsScore.teamA.score}</p>
            </div>
            <p className="text-muted-foreground text-sm">vs</p>
            <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-lg font-semibold truncate">{sportsScore.teamB.name}</p>
                <p className="text-3xl font-bold">{sportsScore.teamB.score}</p>
            </div>
        </div>
        <div className="text-center mt-3">
            <Badge variant="destructive">{sportsScore.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
