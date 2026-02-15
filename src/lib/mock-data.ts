import { Youtube, Twitch, Film, Clapperboard, Gamepad2, Music } from 'lucide-react';

export const apps = [
  { name: 'YouTube', icon: Youtube, href: '#', packageName: 'com.google.android.youtube.tv' },
  { name: 'Twitch', icon: Twitch, href: '#', packageName: 'tv.twitch.android.app' },
  { name: 'Plex', icon: Film, href: '#', packageName: 'com.plexapp.android' },
  { name: 'Movies', icon: Clapperboard, href: '#', packageName: 'com.google.android.videos' },
  { name: 'Games', icon: Gamepad2, href: '#', packageName: 'com.google.android.play.games' },
  { name: 'Music', icon: Music, href: '#', packageName: 'com.spotify.tv.android' },
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
