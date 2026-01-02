import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, Radio, User, Play, Settings } from 'lucide-react';
import RadioStationCard from '@/components/RadioStationCard';
import RadioPlayer from '@/components/RadioPlayer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initDB, getStations } from '@/lib/db';
import { migrateStations } from '@/lib/migration';
import type { RadioStation } from '@/types/radio';

const Index = () => {
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStations = async () => {
      try {
        await initDB();
        await migrateStations();
        const stations = await getStations();
        setRadioStations(stations);
      } catch (error) {
        console.error('Failed to load stations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, []);

  const handlePlayStation = (station: RadioStation) => {
    setSelectedStation(station);
    setIsPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedStation(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            FastFit <span className="text-foreground">Beat</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Energize your workout with our curated radio stations designed for every fitness routine
          </p>
        </div>

        {/* Featured station */}
        <div className="mb-8">
          <div className="relative bg-gradient-hero rounded-2xl p-8 md:p-12 overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <Radio className="h-6 w-6 text-gym-primary" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Featured Station
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">MAINSTAGE</h2>
              <p className="text-lg text-muted-foreground mb-6">Festival Hits, EDM, Top 40</p>
              <Button
                variant="default"
                size="lg"
                className="bg-gradient-primary hover:scale-105 transition-transform shadow-glow"
                onClick={() => radioStations.length > 0 && handlePlayStation(radioStations[0])}
                disabled={isLoading || radioStations.length === 0}
              >
                <Play className="h-5 w-5 mr-2" />
                {isLoading ? 'Loading...' : 'Start Listening'}
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gym-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gym-secondary/10 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Radio stations grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Music className="h-6 w-6 text-gym-primary" />
              <h2 className="text-2xl font-bold">FITNESS STATIONS</h2>
              <span className="bg-gym-accent text-black text-xs font-bold px-2 py-1 rounded-full">
                LIVE
              </span>
            </div>
            <Button variant="ghost" className="text-gym-primary hover:text-gym-primary-glow">
              VIEW ALL
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {radioStations.map((station) => (
                <RadioStationCard
                  key={station.id}
                  station={station}
                  onPlay={handlePlayStation}
                />
              ))}
            </div>
          )}
        </section>

        {/* Bottom section */}
        <section className="text-center py-12">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Workout?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Choose your perfect workout soundtrack and let the music drive your fitness journey
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="default" size="lg" className="bg-gradient-primary">
              <Radio className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </section>
      </main>

      {/* Radio Player Modal */}
      <RadioPlayer
        station={selectedStation}
        isOpen={isPlayerOpen}
        onClose={handleClosePlayer}
      />
    </div>
  );
};

export default Index;
