import React, { useState, useEffect } from 'react';
import { Play, Radio } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnalytics } from '@/lib/db';
import type { AnalyticsSummary } from '@/types/radio';

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventType = (type: string): string => {
    switch (type) {
      case 'play':
        return 'Played';
      case 'pause':
        return 'Paused';
      case 'favorite':
        return 'Favorited';
      case 'unfavorite':
        return 'Unfavorited';
      default:
        return type;
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Plays</p>
              <h3 className="text-2xl md:text-3xl font-bold">{analytics.totalPlays}</h3>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gym-primary/10 flex items-center justify-center">
              <Play className="h-5 w-5 md:h-6 md:w-6 text-gym-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Stations</p>
              <h3 className="text-2xl md:text-3xl font-bold">{analytics.stationStats.length}</h3>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gym-secondary/10 flex items-center justify-center">
              <Radio className="h-5 w-5 md:h-6 md:w-6 text-gym-secondary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Station Performance Table */}
      <Card>
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Station Performance</h3>
          {analytics.stationStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No station data available yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead className="text-right">Plays</TableHead>
                    <TableHead className="hidden md:table-cell">Engagement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.stationStats
                    .sort((a, b) => b.plays - a.plays)
                    .map((stat) => (
                      <TableRow key={stat.stationId}>
                        <TableCell className="font-medium text-sm">{stat.stationName}</TableCell>
                        <TableCell className="text-right text-sm">{stat.plays}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={analytics.totalPlays > 0 ? (stat.plays / analytics.totalPlays) * 100 : 0}
                              className="w-16 md:w-24"
                            />
                            <span className="text-xs text-muted-foreground">
                              {analytics.totalPlays > 0
                                ? Math.round((stat.plays / analytics.totalPlays) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Recent Activity</h3>
          {analytics.recentEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No activity yet</p>
          ) : (
            <ScrollArea className="h-60 md:h-80">
              <div className="space-y-2">
                {analytics.recentEvents.map((event) => {
                  const station = analytics.stationStats.find((s) => s.stationId === event.stationId);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gym-primary/10 flex items-center justify-center flex-shrink-0">
                          {(event.eventType === 'play' || event.eventType === 'favorite') && <Play className="h-3 w-3 md:h-4 md:w-4 text-gym-primary" />}
                          {(event.eventType === 'pause' || event.eventType === 'unfavorite') && <Play className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-medium">
                            {formatEventType(event.eventType)} {station?.stationName || 'Unknown Station'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
