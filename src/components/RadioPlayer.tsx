import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { trackEvent } from '@/lib/db';
import type { RadioStation } from '@/types/radio';

// Helper functions
const isHlsStream = (url: string): boolean => {
  return url.includes('.m3u8') || url.includes('m3u');
};

const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

interface RadioPlayerProps {
  station: RadioStation | null;
  isOpen: boolean;
  onClose: () => void;
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ station, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (station && isOpen) {
      // Cleanup previous audio/hls instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Create audio element
      audioRef.current = new Audio();
      audioRef.current.volume = volume[0] / 100;

      // Setup HLS or direct stream
      if (isHlsStream(station.streamUrl)) {
        // HLS stream
        if (isSafari()) {
          // Safari supports HLS natively
          audioRef.current.src = station.streamUrl;
          console.log('Using native HLS support (Safari) for:', station.name);
        } else if (Hls.isSupported()) {
          // Use hls.js for other browsers
          hlsRef.current = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsRef.current.loadSource(station.streamUrl);
          hlsRef.current.attachMedia(audioRef.current);

          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed for:', station.name);
            // Auto-start playback for HLS
            audioRef.current?.play().then(() => {
              console.log('HLS playback started successfully');
              setIsPlaying(true);
              trackEvent(station.id, 'play').catch(console.error);
            }).catch((err) => {
              console.error('HLS autoplay blocked by browser:', err);
              setIsPlaying(false);
            });
          });

          hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              setIsPlaying(false);
              console.error('Fatal HLS error, cannot continue');
            }
          });
        } else {
          console.error('HLS is not supported in this browser');
          setIsPlaying(false);
        }
      } else {
        // Direct stream (MP3, AAC, etc.)
        audioRef.current.src = station.streamUrl;
        console.log('Using direct stream for:', station.name);
      }

      // Audio event listeners (work for both HLS and direct streams)
      audioRef.current.addEventListener('loadstart', () => {
        console.log('Loading started for:', station.name);
      });

      audioRef.current.addEventListener('canplay', () => {
        console.log('Can play:', station.name);
        // Auto-start playback
        audioRef.current?.play().then(() => {
          console.log('Playback started successfully');
          setIsPlaying(true);
          trackEvent(station.id, 'play').catch(console.error);
        }).catch((err) => {
          console.error('Autoplay blocked by browser:', err);
          setIsPlaying(false);
        });
      });

      audioRef.current.addEventListener('playing', () => {
        console.log('Audio is playing');
        setIsPlaying(true);
      });

      audioRef.current.addEventListener('pause', () => {
        console.log('Audio paused');
        setIsPlaying(false);
      });

      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsPlaying(false);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
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
    if (!audioRef.current || !station) return;

    if (isPlaying) {
      audioRef.current.pause();
      trackEvent(station.id, 'pause').catch(console.error);
    } else {
      audioRef.current.play().then(() => {
        console.log('Manual play successful');
        trackEvent(station.id, 'play').catch(console.error);
      }).catch((err) => {
        console.error('Manual play failed:', err);
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!station || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center" style={{ height: '100dvh' }}>
      <Card className="w-full md:w-full md:h-auto md:max-w-[400px] md:m-4 bg-background shadow-player animate-fade-in md:rounded-lg rounded-none" style={{ height: '100dvh' }}>
        <div className="relative h-full md:h-auto flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {/* Header with Title and Close button */}
          <div className="relative flex items-center justify-center pt-12 pb-3 px-4">
            <div className="flex justify-center w-full">
              <img src="/fastfit_gold.png" alt="FastFit Beat" className="h-12 md:h-16 object-contain" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="h-7 w-7" strokeWidth={2.5} />
            </Button>
          </div>

          {/* Cover image */}
          <div className="w-full flex-shrink-0 py-5">
            <div className="mx-5">
              <div className="aspect-square relative w-full overflow-hidden rounded-lg">
                <img
                  src={station.coverImage}
                  alt={station.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />



                {/* Station info overlay */}
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl md:text-2xl font-bold">{station.name}</h2>
                  <p className="text-white/80">{station.genre}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Player controls */}
          <div className="px-6 py-6 space-y-6 flex-1 flex flex-col justify-center md:flex-initial md:justify-start">
            {/* Main controls */}
            <div className="flex items-center justify-center">
              <button
                className="relative h-24 w-24 hover:scale-105 transition-transform shadow-glow"
                onClick={togglePlayPause}
              >
                {/* Background circle */}
                <svg className="w-full h-full" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r="48"
                    style={{ fill: 'url(#gradient-player)' }}
                  />
                  <defs>
                    <linearGradient id="gradient-player" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: '1' }} />
                      <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: '0.8' }} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Play/Pause icon - white filled and centered */}
                {isPlaying ? (
                  <Pause className="absolute inset-0 m-auto h-12 w-12 text-white" fill="white" />
                ) : (
                  <Play className="absolute inset-0 m-auto h-12 w-12 text-white" fill="white" />
                )}
              </button>
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