import { Youtube, Twitch, Film, Clapperboard, Gamepad2, Music } from 'lucide-react';
const streams = []
export const apps = [
  { name: 'YouTube', icon: Youtube, packageName: 'com.google.android.youtube.tv' },
  { name: 'Twitch', icon: Twitch, packageName: 'tv.twitch.android.app' },
  { name: 'Plex', icon: Film, packageName: 'com.plexapp.android' },
  { name: 'Movies', icon: Clapperboard, packageName: 'com.google.android.videos' },
  { name: 'Games', icon: Gamepad2, packageName: 'com.google.android.play.games' },
  { name: 'Music', icon: Music, packageName: 'com.spotify.tv.android' },
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

export const videoStream = {
  name: 'Big Buck Bunny',
  magnetUri: 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969'
};
