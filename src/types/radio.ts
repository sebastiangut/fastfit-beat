export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  coverImage: string;  // base64 data URL or regular URL
  isHls?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface AnalyticsEvent {
  id?: number;
  stationId: string;
  eventType: 'play' | 'pause' | 'favorite' | 'unfavorite';
  timestamp: number;
  metadata?: any;
}

export interface StationStats {
  stationId: string;
  stationName: string;
  plays: number;
  favorites: number;
}

export interface AnalyticsSummary {
  totalPlays: number;
  totalFavorites: number;
  stationStats: StationStats[];
  recentEvents: AnalyticsEvent[];
}

export interface AdminCredentials {
  id: string;
  passwordHash: string;
  createdAt: number;
  updatedAt: number;
}

export interface Favorite {
  stationId: string;
  addedAt: number;
}
