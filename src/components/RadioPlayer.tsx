import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, X, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  coverImage: string;
}

interface RadioPlayerProps {
  station: RadioStation | null;
  isOpen: boolean;
  onClose: () => void;
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ station, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (station && isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(station.streamUrl);
      audioRef.current.volume = volume[0] / 100;
      
      audioRef.current.addEventListener('loadstart', () => {
        console.log('Loading started for:', station.name);
      });
      
      audioRef.current.addEventListener('canplay', () => {
        console.log('Can play:', station.name);
        if (isPlaying) {
          audioRef.current?.play().catch(console.error);
        }
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [station, isOpen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!station || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-player animate-fade-in">
        <div className="relative">
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-4 right-4 z-10 text-foreground hover:bg-secondary"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Cover image */}
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <img 
              src={station.coverImage} 
              alt={station.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Station info overlay */}
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold">{station.name}</h2>
              <p className="text-white/80">{station.genre}</p>
            </div>
          </div>

          {/* Player controls */}
          <div className="p-6 space-y-6">
            {/* Main controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full bg-gradient-primary hover:scale-105 transition-transform shadow-glow"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Volume control */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-muted-foreground hover:text-foreground"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              
              <span className="text-sm text-muted-foreground w-8">
                {isMuted ? 0 : volume[0]}
              </span>
            </div>

            {/* Now playing indicator */}
            {isPlaying && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Now Playing</p>
                <div className="flex justify-center space-x-1 mt-1">
                  <div className="w-1 h-3 bg-gym-primary rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-gym-primary rounded-full animate-pulse [animation-delay:0.2s]" />
                  <div className="w-1 h-2 bg-gym-primary rounded-full animate-pulse [animation-delay:0.4s]" />
                  <div className="w-1 h-5 bg-gym-primary rounded-full animate-pulse [animation-delay:0.6s]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RadioPlayer;