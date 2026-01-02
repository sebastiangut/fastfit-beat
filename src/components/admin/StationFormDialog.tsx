import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { addStation, updateStation } from '@/lib/db';
import type { RadioStation } from '@/types/radio';

interface StationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  station: RadioStation | null;
  onSuccess: () => void;
}

const isHlsStream = (url: string): boolean => {
  return url.includes('.m3u8') || url.includes('m3u');
};

const StationFormDialog: React.FC<StationFormDialogProps> = ({
  isOpen,
  onClose,
  station,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    streamUrl: '',
    coverImage: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (station && isOpen) {
      setFormData({
        name: station.name,
        genre: station.genre,
        streamUrl: station.streamUrl,
        coverImage: station.coverImage,
      });
      setImagePreview(station.coverImage);
    } else if (!isOpen) {
      // Reset form when dialog closes
      setFormData({
        name: '',
        genre: '',
        streamUrl: '',
        coverImage: '',
      });
      setImagePreview('');
    }
  }, [station, isOpen]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast({
        title: 'Image too large',
        description: 'Please use an image smaller than 500KB. Consider compressing it first.',
        variant: 'destructive',
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData({ ...formData, coverImage: base64 });
      setImagePreview(base64);
    };
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to read image file',
        variant: 'destructive',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.name || !formData.genre || !formData.streamUrl) {
        toast({
          title: 'Validation error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.coverImage) {
        toast({
          title: 'Validation error',
          description: 'Please upload a cover image',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const stationData = {
        ...formData,
        isHls: isHlsStream(formData.streamUrl),
      };

      if (station) {
        // Update existing station
        await updateStation(station.id, stationData);
        toast({
          title: 'Success',
          description: `Station "${formData.name}" updated successfully`,
        });
      } else {
        // Create new station
        await addStation({
          id: crypto.randomUUID(),
          ...stationData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as RadioStation);
        toast({
          title: 'Success',
          description: `Station "${formData.name}" created successfully`,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save station:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save station',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{station ? 'Edit Station' : 'Add New Station'}</DialogTitle>
          <DialogDescription>
            {station
              ? 'Update the station information below'
              : 'Fill in the details to create a new radio station'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Station Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mainstage"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="genre">Genre *</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="e.g., EDM, Top 40"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="streamUrl">Stream URL *</Label>
            <Input
              id="streamUrl"
              type="url"
              value={formData.streamUrl}
              onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
              placeholder="https://example.com/stream.m3u8"
              required
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Supports HLS (.m3u8) and direct streams (MP3, AAC)
            </p>
          </div>

          <div>
            <Label htmlFor="coverImage">Cover Image *</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isSubmitting}
            />
            {imagePreview && (
              <div className="mt-3 flex items-start space-x-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-border"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Preview</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Image looks good! This will be displayed as the station cover.
                  </p>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Max 500KB. Recommended: 500x500px square image (JPG, PNG, WebP, or SVG)
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : station ? 'Update Station' : 'Create Station'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StationFormDialog;
