'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Search, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGetVideoTranscriptionQuery, TranscriptionSegment } from '@/store/api/courseApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

interface VideoTranscriptionProps {
  courseId: string;
  videoId: string;
  currentTime: number;
  onSegmentClick?: (timestamp: number) => void;
}

export default function VideoTranscriptionComponent({
  courseId,
  videoId,
  currentTime,
  onSegmentClick,
}: VideoTranscriptionProps) {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetVideoTranscriptionQuery({ courseId, videoId });
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const transcription = data?.transcription;
  const segments = transcription?.segments || [];

  // Filter segments based on search
  const filteredSegments = segments.filter((segment: TranscriptionSegment) =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Highlight current segment
  const currentSegment = segments.find(
    (segment: TranscriptionSegment) =>
      currentTime >= segment.start && currentTime <= segment.end
  );

  // Scroll to current segment
  useEffect(() => {
    if (currentSegment && transcriptRef.current) {
      const segmentElement = transcriptRef.current.querySelector(
        `[data-segment-start="${currentSegment.start}"]`
      );
      if (segmentElement) {
        segmentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSegment, currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyFullText = () => {
    if (transcription?.fullText) {
      navigator.clipboard.writeText(transcription.fullText);
      setCopied(true);
      dispatch(addToast({ type: 'success', message: 'Transcription copied to clipboard!' }));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 text-center text-muted-foreground text-sm sm:text-base">
          Loading transcription...
        </CardContent>
      </Card>
    );
  }

  if (!transcription) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            Video Transcription
          </CardTitle>
          {transcription.fullText && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyFullText}
              className="flex items-center gap-2 w-full sm:w-auto shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 shrink-0" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 shrink-0" />
                  Copy All
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Search */}
        <div className="mb-3 sm:mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search in transcription..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 sm:pl-9 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Transcription Segments */}
        <div
          ref={transcriptRef}
          className="max-h-64 sm:max-h-96 overflow-y-auto space-y-1.5 sm:space-y-2"
          role="log"
          aria-label="Video transcription"
        >
          {filteredSegments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
              {searchQuery ? 'No matching segments found' : 'No transcription available'}
            </p>
          ) : (
            filteredSegments.map((segment: TranscriptionSegment, index: number) => {
              const isActive = currentSegment?.start === segment.start;
              const isHighlighted = searchQuery && segment.text.toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <div
                  key={index}
                  data-segment-start={segment.start}
                  className={`p-2.5 sm:p-3 rounded-lg border transition-colors cursor-pointer min-h-[44px] flex items-center ${
                    isActive
                      ? 'bg-primary/10 border-primary border-2'
                      : 'bg-card border-border hover:bg-accent/20'
                  }`}
                  onClick={() => onSegmentClick?.(segment.start)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSegmentClick?.(segment.start);
                    }
                  }}
                  aria-label={`Transcription segment at ${formatTime(segment.start)}`}
                >
                  <div className="flex items-start gap-2 sm:gap-3 w-full min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSegmentClick?.(segment.start);
                      }}
                      className="text-[10px] sm:text-xs font-mono text-primary hover:underline flex-shrink-0 mt-0.5 min-h-[32px] touch-manipulation"
                      aria-label={`Jump to ${formatTime(segment.start)}`}
                    >
                      {formatTime(segment.start)}
                    </button>
                    <p
                      className={`text-xs sm:text-sm text-foreground flex-1 min-w-0 break-words ${
                        isHighlighted ? 'bg-yellow-200 dark:bg-yellow-900/30 px-1 rounded' : ''
                      }`}
                    >
                      {segment.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Full Text (Collapsible) */}
        {transcription.fullText && (
          <details className="mt-3 sm:mt-4">
            <summary className="cursor-pointer text-xs sm:text-sm font-medium text-foreground hover:text-primary py-2">
              View Full Text
            </summary>
            <div className="mt-2 p-3 sm:p-4 rounded-lg bg-muted/50 max-h-40 sm:max-h-48 overflow-y-auto">
              <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap break-words">{transcription.fullText}</p>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}


