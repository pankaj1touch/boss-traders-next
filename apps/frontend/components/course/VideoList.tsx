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
        <div className="space-y-2 mb-4">
          {showSearch && (
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-brand-blue transition-colors" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500 hover:border-brand-blue/30 focus-visible:border-brand-blue transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
                className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue hover:bg-black/40 transition-colors"
              >
                <option value="all">All Videos</option>
                <option value="free">Free Only</option>
                <option value="completed">Completed</option>
                {!hasAccess && <option value="locked">Locked</option>}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue hover:bg-black/40 transition-colors"
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
        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5 border-dashed">
          <p className="text-sm text-gray-400">No videos match your search</p>
          {(searchQuery || filterType !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-2 text-brand-blue hover:text-white"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
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
                className={`w-full rounded-xl border p-3 text-left transition-all duration-200 group relative overflow-hidden ${isSelected
                  ? 'border-brand-blue/50 bg-brand-blue/10 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                  : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue" />}

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`mt-0.5 flex-shrink-0 flex items-center justify-center p-1.5 rounded-full ${isSelected ? 'bg-brand-blue/20 text-brand-blue' : 'bg-black/20 text-gray-400'}`}>
                    {isLocked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Play className={`h-3.5 w-3.5 ${isSelected && 'fill-current'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium line-clamp-2 transition-colors ${isSelected
                        ? 'text-white'
                        : 'text-gray-300 group-hover:text-white'
                        }`}
                    >
                      {video.title}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {video.duration && (
                        <span className="text-xs text-gray-500 font-mono">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                      {!video.videoUrl || video.videoUrl.trim() === '' ? (
                        <Badge className="text-[10px] py-0 h-5 bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20">
                          Not Available
                        </Badge>
                      ) : null}
                      {video.isFree && (
                        <Badge className="text-[10px] py-0 h-5 bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
                          Free
                        </Badge>
                      )}
                      {isLocked && (
                        <Badge className="text-[10px] py-0 h-5 bg-gray-700/50 text-gray-400 border-gray-600">
                          Locked
                        </Badge>
                      )}
                      {isCompleted && !isLocked && (
                        <Badge className="text-[10px] py-0 h-5 bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                          Completed
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

