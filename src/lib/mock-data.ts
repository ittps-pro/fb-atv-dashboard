import { Youtube, Twitch, Film, Clapperboard, Gamepad2, Music } from 'lucide-react';

export const apps = [
  { name: 'YouTube', icon: Youtube, href: '#' },
  { name: 'Twitch', icon: Twitch, href: '#' },
  { name: 'Plex', icon: Film, href: '#' },
  { name: 'Movies', icon: Clapperboard, href: '#' },
  { name: 'Games', icon: Gamepad2, href: '#' },
  { name: 'Music', icon: Music, href: '#' },
];

export const newsItems = [
    { id: 1, headline: 'Global Tech Summit Announces New AI Breakthroughs', source: 'Tech Today' },
    { id: 2, headline: 'Market Hits Record High Amidst Economic Optimism', source: 'Finance World' },
    { id: 3, headline: 'New Space Mission to Explore Martian Canyons', source: 'Science Universe' },
];

export const sportsScore = {
    teamA: { name: 'Lakers', score: 102 },
    teamB: { name: 'Warriors', score: 98 },
    league: 'NBA',
    status: 'Final'
};
