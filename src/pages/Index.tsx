import React, { useState } from 'react';
import { Music, Radio, User, Heart, Play } from 'lucide-react';
import RadioStationCard from '@/components/RadioStationCard';
import RadioPlayer from '@/components/RadioPlayer';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

// Import cover images
import hiitCover from '@/assets/hiit-cover.jpg';
import crosstrainCover from '@/assets/crosstrain-cover.jpg';
import yogaCover from '@/assets/yoga-cover.jpg';
import spinCover from '@/assets/spin-cover.jpg';
import highenergyCover from '@/assets/highenergy-cover.jpg';
import strengthCover from '@/assets/strength-cover.jpg';
interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  coverImage: string;
}
const radioStations: RadioStation[] = [{
  id: '1',
  name: 'HIIT',
  genre: 'EDM, Pop, Throwbacks, 140 Bpm',
  streamUrl: 'https://streams.radiomast.io/7b2f9c8a-e6b4-4b89-8a4c-6f1e2d3b4c5d',
  coverImage: hiitCover
}, {
  id: '2',
  name: 'Crosstrain',
  genre: '140 Bpm, Pop, Uptempo',
  streamUrl: 'https://streams.radiomast.io/a1b2c3d4-e5f6-7890-1234-567890abcdef',
  coverImage: crosstrainCover
}, {
  id: '3',
  name: 'YOGA',
  genre: 'Ambient, Chill, Meditation',
  streamUrl: 'https://streams.radiomast.io/f9e8d7c6-b5a4-9384-7261-504030201000',
  coverImage: yogaCover
}, {
  id: '4',
  name: 'SPIN',
  genre: 'High Energy, Electronic, Rock',
  streamUrl: 'https://streams.radiomast.io/1a2b3c4d-5e6f-7890-abcd-ef1234567890',
  coverImage: spinCover
}, {
  id: '5',
  name: 'High Energy',
  genre: 'EDM, Hardcore, 160+ Bpm',
  streamUrl: 'https://streams.radiomast.io/9f8e7d6c-5b4a-3928-1716-050403020100',
  coverImage: highenergyCover
}, {
  id: '6',
  name: 'Strength',
  genre: 'Rock, Metal, Power',
  streamUrl: 'https://streams.radiomast.io/aa1bb2cc-3dd4-ee55-ff66-778899aabbcc',
  coverImage: strengthCover
}];
const Index = () => {
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const handlePlayStation = (station: RadioStation) => {
    setSelectedStation(station);
    setIsPlayerOpen(true);
  };
  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedStation(null);
  };
  return <div className="min-h-screen bg-background">
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
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Fast Fit <span className="text-foreground">Radio
          </span>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-2">FEEL THE POWER</h2>
              <p className="text-lg text-muted-foreground mb-6">High Energy, Top 40, EDM</p>
              <Button variant="default" size="lg" className="bg-gradient-primary hover:scale-105 transition-transform shadow-glow" onClick={() => handlePlayStation(radioStations[4])}>
                <Play className="h-5 w-5 mr-2" />
                Start Listening
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {radioStations.map(station => <RadioStationCard key={station.id} station={station} onPlay={handlePlayStation} />)}
          </div>
        </section>

        {/* Bottom section */}
        <section className="text-center py-12">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Workout?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Choose your perfect workout soundtrack and let the music drive your fitness journey
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="lg">
              <Music className="h-5 w-5 mr-2" />
              Browse Genres
            </Button>
            <Button variant="default" size="lg" className="bg-gradient-primary">
              <Radio className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </section>
      </main>

      {/* Radio Player Modal */}
      <RadioPlayer station={selectedStation} isOpen={isPlayerOpen} onClose={handleClosePlayer} />
    </div>;
};
export default Index;