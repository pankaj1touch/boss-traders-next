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
    <div className={`space-y-3 ${className}`}>
      {/* Search and Filter */}
      {(showSearch || showFilter) && (
        <div className="space-y-2">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {showFilter && (
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Videos</option>
                <option value="free">Free Only</option>
                <option value="completed">Completed</option>
                {!hasAccess && <option value="locked">Locked</option>}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No videos match your search</p>
          {(searchQuery || filterType !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
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
                className={`w-full rounded-lg border p-3 text-left transition-all ${isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                    : 'border-border bg-card hover:bg-accent hover:border-primary-300'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Play className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium line-clamp-2 ${isSelected
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-foreground'
                        }`}
                    >
                      {video.title}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {video.duration && (
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                      {video.isFree && (
                        <Badge variant="success" className="text-xs py-0">
                          Free
                        </Badge>
                      )}
                      {isLocked && (
                        <Badge variant="secondary" className="text-xs py-0">
                          Locked
                        </Badge>
                      )}
                      {isCompleted && !isLocked && (
                        <Badge variant="secondary" className="text-xs py-0 text-green-600 border-green-600">
                          Completed
                        </Badge>
                      )}
                    </div>

                    {/* Video number */}
                    <div className="mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        Video {originalIndex + 1} of {videos.length}
                      </span>
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

