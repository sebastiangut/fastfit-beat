import { initDB, getStations, addStation } from './db';
import type { RadioStation } from '@/types/radio';

// Import cover images
import mainstageCover from '@/assets/mainstage-cover.svg';
import classicsCover from '@/assets/classics-cover.svg';
import chillCover from '@/assets/chill-cover.svg';
import organicCover from '@/assets/organic-cover.svg';
import afroCover from '@/assets/afro-cover.svg';
import houseCover from '@/assets/house-cover.svg';

const DEFAULT_STATIONS: Omit<RadioStation, 'createdAt' | 'updatedAt'>[] = [
  {
    id: '1',
    name: 'Mainstage',
    genre: 'Festival Hits, EDM, Top 40',
    streamUrl: 'https://dancewave.online/dance.aacp/playlist.m3u8',
    coverImage: mainstageCover,
    isHls: true,
  },
  {
    id: '2',
    name: 'Classics',
    genre: 'Timeless Hits, 80s, 90s',
    streamUrl: 'https://dancewave.online/dance.aacp/playlist.m3u8',
    coverImage: classicsCover,
    isHls: true,
  },
  {
    id: '3',
    name: 'Chill',
    genre: 'Ambient, Lounge, Downtempo',
    streamUrl: 'https://dancewave.online/dance.aacp/playlist.m3u8',
    coverImage: chillCover,
    isHls: true,
  },
  {
    id: '4',
    name: 'Organic',
    genre: 'Organic, Ambiental House',
    streamUrl: 'https://dancewave.online/dance.aacp/playlist.m3u8',
    coverImage: organicCover,
    isHls: true,
  },
  {
    id: '5',
    name: 'Afro',
    genre: 'Afro House',
    streamUrl: 'https://dancewave.online/dance.aacp/playlist.m3u8',
    coverImage: afroCover,
    isHls: true,
  },
  {
    id: '6',
    name: 'House',
    genre: 'Deep House, Electronic, Dance',
    streamUrl: 'https://dancewave.online/dance.aacp/playlist.m3u8',
    coverImage: houseCover,
    isHls: true,
  },
];

export async function migrateStations(): Promise<void> {
  await initDB();
  const existingStations = await getStations();

  // Only seed if database is empty
  if (existingStations.length === 0) {
    console.log('Database is empty. Seeding with default stations...');

    for (const station of DEFAULT_STATIONS) {
      await addStation(station as RadioStation);
    }

    console.log(`Successfully seeded ${DEFAULT_STATIONS.length} stations.`);
  }
}
