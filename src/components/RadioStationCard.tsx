import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  coverImage: string;
}

interface RadioStationCardProps {
  station: RadioStation;
  onPlay: (station: RadioStation) => void;
}

const RadioStationCard: React.FC<RadioStationCardProps> = ({ station, onPlay }) => {
  return (
    <Card className="group relative overflow-hidden bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
      <div className="aspect-square relative">
        <img 
          src={station.coverImage} 
          alt={station.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="relative h-16 w-16 hover:scale-110 transition-transform shadow-glow"
            onClick={() => onPlay(station)}
          >
            {/* Background circle */}
            <svg className="w-full h-full" viewBox="0 0 64 64">
              <circle 
                cx="32" 
                cy="32" 
                r="32" 
                className="fill-gradient-primary"
                style={{ fill: 'url(#gradient)' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
                  <stop offset="100%" style={{ stopColor: 'hsl(var(--primary-glow))' }} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Play icon - white and smaller */}
            <Play className="absolute inset-0 m-auto h-8 w-8 text-white ml-1" />
          </button>
        </div>
        
        {/* Station info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-lg truncate">{station.name}</h3>
          <p className="text-white/80 text-sm truncate">{station.genre}</p>
        </div>
        
        {/* Pro badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-gym-accent text-black text-xs font-bold px-2 py-1 rounded-full">
            LIVE
          </span>
        </div>
      </div>
    </Card>
  );
};

export default RadioStationCard;