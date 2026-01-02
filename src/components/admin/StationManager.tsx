import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getStations, deleteStation } from '@/lib/db';
import type { RadioStation } from '@/types/radio';
import StationFormDialog from './StationFormDialog';

const StationManager: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<RadioStation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setIsLoading(true);
      const data = await getStations();
      setStations(data);
    } catch (error) {
      console.error('Failed to load stations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteStation(id);
      await loadStations();
      toast({
        title: 'Success',
        description: `Station "${name}" deleted successfully`,
      });
    } catch (error) {
      console.error('Failed to delete station:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete station',
        variant: 'destructive',
      });
    }
  };

  const handleAdd = () => {
    setEditingStation(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (station: RadioStation) => {
    setEditingStation(station);
    setIsDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    loadStations();
    setIsDialogOpen(false);
    setEditingStation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gym-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Manage Stations</h2>
          <p className="text-sm text-muted-foreground">Add, edit, or remove radio stations</p>
        </div>
        <Button onClick={handleAdd} className="bg-gradient-primary w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Station
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Cover</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Genre</TableHead>
                <TableHead className="hidden lg:table-cell max-w-xs">Stream URL</TableHead>
                <TableHead className="hidden sm:table-cell w-20">Type</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No stations found. Click "Add Station" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                stations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell>
                      <img
                        src={station.coverImage}
                        alt={station.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{station.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{station.genre}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{station.genre}</TableCell>
                    <TableCell className="hidden lg:table-cell max-w-xs truncate text-sm" title={station.streamUrl}>
                      {station.streamUrl}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={station.isHls ? 'default' : 'secondary'} className="text-xs">
                        {station.isHls ? 'HLS' : 'Direct'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(station)}
                          className="h-8 w-8 hover:bg-gym-primary/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(station.id, station.name)}
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <StationFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingStation(null);
        }}
        station={editingStation}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default StationManager;
