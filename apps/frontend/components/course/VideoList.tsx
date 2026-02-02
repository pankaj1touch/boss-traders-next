'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Play, Lock, CheckCircle2, Video, Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Video as VideoType } from '@/store/api/courseApi';

interface VideoListProps {
  videos: VideoType[];
  currentVideoIndex: number;
  completedVideoIds: Set<string>;
  hasAccess: boolean;
  onVideoSelect: (index: number) => void;
  className?: string;
  showSearch?: boolean;
  showFilter?: boolean;
}

export default function VideoList({
  videos,
  currentVideoIndex,
  completedVideoIds,
  hasAccess,
  onVideoSelect,
  className = '',
  showSearch = true,
  showFilter = true,
}: VideoListProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'completed' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'duration' | 'title'>('order');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [durationFilter, setDurationFilter] = useState<{ min?: number; max?: number }>({});
  const [searchInDescription, setSearchInDescription] = useState(true);

  // Scroll to current video when it changes
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentVideoIndex]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let result = [...videos];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((video) =>
        video.title.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter((video) => {
        switch (filterType) {
          case 'free':
            return video.isFree;
          case 'completed':
            return video._id && completedVideoIds.has(video._id);
          case 'locked':
            return video.locked && !hasAccess;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'order':
        default:
          return (a.order || 0) - (b.order || 0);
      }
    });

    return result;
  }, [videos, searchQuery, filterType, sortBy, completedVideoIds, hasAccess]);

  // Find the index in original array for selected video
  const getOriginalIndex = (filteredIndex: number) => {
    const filteredVideo = filteredAndSortedVideos[filteredIndex];
    return videos.findIndex((v) => v._id === filteredVideo._id || v === filteredVideo);
  };

  if (videos.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No videos available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 sm:space-y-3 ${className}`}>
      {/* Search and Filter */}
      {(showSearch || showFilter) && (
        <div className="space-y-2 mb-3 sm:mb-4">
          {showSearch && (
            <div className="relative group">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-9 pr-8 sm:pr-9 h-9 sm:h-10 text-sm border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          )}

          {showFilter && (
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full sm:flex-1 rounded-lg border border-border bg-card px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Videos</option>
                <option value="free">Free Only</option>
                <option value="completed">Completed</option>
                {!hasAccess && <option value="locked">Locked</option>}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:flex-1 rounded-lg border border-border bg-card px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="order">By Order</option>
                <option value="title">By Title</option>
                <option value="duration">By Duration</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Video List */}
      {filteredAndSortedVideos.length === 0 ? (
        <div className="text-center py-4 sm:py-8 rounded-xl border border-border bg-muted/30 border-dashed">
          <p className="text-xs sm:text-sm text-muted-foreground">No videos match your search</p>
          {(searchQuery || filterType !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-2 text-primary hover:text-primary/90"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5 sm:space-y-2 overflow-y-auto pr-1 -mr-1">
          {filteredAndSortedVideos.map((video, filteredIndex) => {
            const originalIndex = getOriginalIndex(filteredIndex);
            const isSelected = originalIndex === currentVideoIndex;
            const isCompleted = video._id && completedVideoIds.has(video._id);
            const isLocked = video.locked && !hasAccess;

            return (
              <button
                key={video._id || originalIndex}
                ref={isSelected ? selectedRef : null}
                onClick={() => onVideoSelect(originalIndex)}
                disabled={isLocked}
                className={`w-full rounded-lg sm:rounded-xl border p-2 sm:p-3 text-left transition-all duration-200 group relative overflow-hidden ${isSelected
                  ? 'border-primary/50 bg-primary/10 shadow-sm'
                  : 'border-border bg-muted/30 hover:bg-muted/50 hover:border-border'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-primary rounded-l" />}

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`mt-0.5 flex-shrink-0 flex items-center justify-center p-1 sm:p-1.5 rounded-full ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {isLocked ? (
                      <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Play className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isSelected && 'fill-current'}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-medium line-clamp-2 transition-colors ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {video.title}
                    </p>
                    <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-2">
                      {video.duration && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                      {!video.videoUrl || video.videoUrl.trim() === '' ? (
                        <Badge className="text-[9px] sm:text-[10px] py-0 h-4 sm:h-5 px-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                          Not Available
                        </Badge>
                      ) : null}
                      {video.isFree && (
                        <Badge className="text-[9px] sm:text-[10px] py-0 h-4 sm:h-5 px-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          Free
                        </Badge>
                      )}
                      {isLocked && (
                        <Badge className="text-[9px] sm:text-[10px] py-0 h-4 sm:h-5 px-1.5 bg-muted text-muted-foreground">
                          Locked
                        </Badge>
                      )}
                      {isCompleted && !isLocked && (
                        <Badge className="text-[9px] sm:text-[10px] py-0 h-4 sm:h-5 px-1.5 bg-primary/10 text-primary border-primary/20">
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
