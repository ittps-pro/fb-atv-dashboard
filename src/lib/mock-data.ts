import { Youtube, Twitch, Film, Clapperboard, Gamepad2, Music } from 'lucide-react';

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

export const allStreams = [
  {
    id: 'bunny-mp4',
    name: 'Big Buck Bunny (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    category: 'VOD'
  },
  {
    id: 'sintel-mp4',
    name: 'Sintel (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    category: 'VOD'
  },
  {
    id: 'tears-of-steel-mp4',
    name: 'Tears of Steel (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    category: 'VOD'
  },
  {
      id: 'nasa-live',
      name: 'NASA TV',
      url: 'https://nasa-i.akamaihd.net/hls/live/253566/NASA-NTV1-Public/master.m3u8',
      category: 'Live TV'
  },
  {
      id: 'bunny-hls',
      name: 'Big Buck Bunny (HLS)',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      category: 'Live TV'
  },
  {
    id: 'france24-live',
    name: 'France 24 (Live)',
    url: 'https://f24.live.out.ovh/fr/master.m3u8',
    category: 'Live TV'
  }
];
