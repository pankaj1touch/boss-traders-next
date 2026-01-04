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
        <CardContent className="p-6 text-center text-muted-foreground">
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Video Transcription
          </CardTitle>
          {transcription.fullText && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyFullText}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy All
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search in transcription..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Transcription Segments */}
        <div
          ref={transcriptRef}
          className="max-h-96 overflow-y-auto space-y-2"
          role="log"
          aria-label="Video transcription"
        >
          {filteredSegments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
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
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
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
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSegmentClick?.(segment.start);
                      }}
                      className="text-xs font-mono text-primary hover:underline flex-shrink-0 mt-1"
                      aria-label={`Jump to ${formatTime(segment.start)}`}
                    >
                      {formatTime(segment.start)}
                    </button>
                    <p
                      className={`text-sm text-foreground flex-1 ${
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
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary">
              View Full Text
            </summary>
            <div className="mt-2 p-4 rounded-lg bg-muted/50 max-h-48 overflow-y-auto">
              <p className="text-sm text-foreground whitespace-pre-wrap">{transcription.fullText}</p>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}


