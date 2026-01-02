import { openDB, DBSchema, IDBPDatabase } from 'idb';
import bcrypt from 'bcryptjs';
import type { RadioStation, AnalyticsEvent, AnalyticsSummary, AdminCredentials, Favorite, StationStats } from '@/types/radio';

interface FastFitDB extends DBSchema {
  stations: {
    key: string;
    value: RadioStation;
    indexes: { 'name': string; 'genre': string };
  };
  admin: {
    key: string;
    value: AdminCredentials;
  };
  analytics: {
    key: number;
    value: AnalyticsEvent;
    indexes: { 'stationId': string; 'timestamp': number; 'eventType': string };
  };
  favorites: {
    key: string;
    value: Favorite;
  };
}

const DB_NAME = 'fast-fit-radio';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FastFitDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<FastFitDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<FastFitDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Stations store
      if (!db.objectStoreNames.contains('stations')) {
        const stationStore = db.createObjectStore('stations', { keyPath: 'id' });
        stationStore.createIndex('name', 'name');
        stationStore.createIndex('genre', 'genre');
      }

      // Admin store
      if (!db.objectStoreNames.contains('admin')) {
        db.createObjectStore('admin', { keyPath: 'id' });
      }

      // Analytics store
      if (!db.objectStoreNames.contains('analytics')) {
        const analyticsStore = db.createObjectStore('analytics', {
          keyPath: 'id',
          autoIncrement: true,
        });
        analyticsStore.createIndex('stationId', 'stationId');
        analyticsStore.createIndex('timestamp', 'timestamp');
        analyticsStore.createIndex('eventType', 'eventType');
      }

      // Favorites store
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'stationId' });
      }
    },
  });

  return dbInstance;
}

// ============ STATION OPERATIONS ============

export async function getStations(): Promise<RadioStation[]> {
  const db = await initDB();
  return db.getAll('stations');
}

export async function getStation(id: string): Promise<RadioStation | undefined> {
  const db = await initDB();
  return db.get('stations', id);
}

export async function addStation(station: RadioStation): Promise<void> {
  const db = await initDB();
  await db.add('stations', {
    ...station,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function updateStation(id: string, updates: Partial<RadioStation>): Promise<void> {
  const db = await initDB();
  const station = await db.get('stations', id);
  if (!station) {
    throw new Error('Station not found');
  }
  await db.put('stations', {
    ...station,
    ...updates,
    id, // Ensure ID doesn't change
    updatedAt: Date.now(),
  });
}

export async function deleteStation(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('stations', id);

  // Also delete associated favorites and analytics
  const favorites = await db.getAll('favorites');
  for (const fav of favorites) {
    if (fav.stationId === id) {
      await db.delete('favorites', fav.stationId);
    }
  }
}

// ============ ADMIN OPERATIONS ============

export async function checkAdminExists(): Promise<boolean> {
  const db = await initDB();
  const admin = await db.get('admin', 'admin');
  return !!admin;
}

export async function setPassword(password: string): Promise<void> {
  const db = await initDB();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const now = Date.now();
  await db.put('admin', {
    id: 'admin',
    passwordHash,
    createdAt: now,
    updatedAt: now,
  });
}

export async function verifyPassword(password: string): Promise<boolean> {
  const db = await initDB();
  const admin = await db.get('admin', 'admin');

  if (!admin) {
    return false;
  }

  return bcrypt.compare(password, admin.passwordHash);
}

// ============ ANALYTICS OPERATIONS ============

export async function trackEvent(
  stationId: string,
  eventType: 'play' | 'pause' | 'favorite' | 'unfavorite',
  metadata?: any
): Promise<void> {
  const db = await initDB();
  await db.add('analytics', {
    stationId,
    eventType,
    timestamp: Date.now(),
    metadata,
  });
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const db = await initDB();
  const events = await db.getAll('analytics');
  const stations = await db.getAll('stations');
  const favorites = await db.getAll('favorites');

  // Calculate totals
  const totalPlays = events.filter(e => e.eventType === 'play').length;
  const totalFavorites = favorites.length;

  // Calculate per-station stats
  const stationStatsMap = new Map<string, StationStats>();

  for (const station of stations) {
    stationStatsMap.set(station.id, {
      stationId: station.id,
      stationName: station.name,
      plays: 0,
      favorites: 0,
    });
  }

  for (const event of events) {
    if (event.eventType === 'play') {
      const stats = stationStatsMap.get(event.stationId);
      if (stats) {
        stats.plays++;
      }
    }
  }

  for (const fav of favorites) {
    const stats = stationStatsMap.get(fav.stationId);
    if (stats) {
      stats.favorites++;
    }
  }

  // Get recent events (last 50)
  const recentEvents = events
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 50);

  return {
    totalPlays,
    totalFavorites,
    stationStats: Array.from(stationStatsMap.values()),
    recentEvents,
  };
}

// ============ FAVORITES OPERATIONS ============

export async function toggleFavorite(stationId: string): Promise<boolean> {
  const db = await initDB();
  const existing = await db.get('favorites', stationId);

  if (existing) {
    // Remove favorite
    await db.delete('favorites', stationId);
    await trackEvent(stationId, 'unfavorite');
    return false;
  } else {
    // Add favorite
    await db.add('favorites', {
      stationId,
      addedAt: Date.now(),
    });
    await trackEvent(stationId, 'favorite');
    return true;
  }
}

export async function isFavorite(stationId: string): Promise<boolean> {
  const db = await initDB();
  const fav = await db.get('favorites', stationId);
  return !!fav;
}

export async function getFavorites(): Promise<string[]> {
  const db = await initDB();
  const favorites = await db.getAll('favorites');
  return favorites.map(f => f.stationId);
}
