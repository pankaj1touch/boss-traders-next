'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, Settings, PictureInPicture, List, Monitor, Subtitles, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VideoChapter {
  title: string;
  timestamp: number;
  description?: string;
}

interface VideoQuality {
  quality: '360p' | '480p' | '720p' | '1080p' | 'auto';
  url: string;
}

interface VideoSubtitle {
  language: string;
  subtitleUrl: string;
  format: 'srt' | 'vtt' | 'ass';
  isDefault: boolean;
}

interface VideoPlayerProps {
  src: string;
  title?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  autoplay?: boolean;
  className?: string;
  startTime?: number; // Resume from this time
  chapters?: VideoChapter[];
  qualities?: VideoQuality[];
  subtitles?: VideoSubtitle[];
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function VideoPlayer({
  src,
  title,
  onProgress,
  onComplete,
  autoplay = false,
  className = '',
  startTime = 0,
  chapters = [],
  qualities = [],
  subtitles = [],
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const lastSavedTimeRef = useRef(0);

  // Load and save playback speed preference
  useEffect(() => {
    const savedSpeed = localStorage.getItem('video-playback-speed');
    if (savedSpeed) {
      const speed = parseFloat(savedSpeed);
      if (playbackSpeeds.includes(speed)) {
        setPlaybackRate(speed);
        if (videoRef.current) {
          videoRef.current.playbackRate = speed;
        }
      }
    }
  }, []);

  // Save playback speed when changed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      localStorage.setItem('video-playback-speed', playbackRate.toString());
    }
  }, [playbackRate]);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const chaptersMenuRef = useRef<HTMLDivElement>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const subtitleMenuRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);


  // Auto-adjust quality based on network
  useEffect(() => {
    if (!qualities || qualities.length === 0 || selectedQuality !== 'auto') return;

    const checkNetworkAndAdjust = async () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          let recommendedQuality = 'auto';

          // Adjust based on network speed
          if (effectiveType === '4g' || effectiveType === '3g') {
            recommendedQuality = '720p';
          } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
            recommendedQuality = '360p';
          } else {
            recommendedQuality = '480p';
          }

          // Check if recommended quality exists
          const hasQuality = qualities.some((q) => q.quality === recommendedQuality);
          if (hasQuality && recommendedQuality !== selectedQuality) {
            setSelectedQuality(recommendedQuality);
          }
        }
      }
    };

    checkNetworkAndAdjust();
  }, [qualities, selectedQuality]);

  // Get current video source based on quality
  const getVideoSource = useMemo(() => {
    if (!qualities || qualities.length === 0) return src;
    const qualityOption = qualities.find((q) => q.quality === selectedQuality);
    return qualityOption?.url || src;
  }, [qualities, selectedQuality, src]);

  // Load video and set start time
  useEffect(() => {
    if (videoRef.current && src) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        setIsLoading(false);
        if (startTime > 0) {
          video.currentTime = startTime;
        }
        setDuration(video.duration);
      };

      const handleTimeUpdate = () => {
        const current = video.currentTime;
        setCurrentTime(current);
        if (onProgress) {
          onProgress(current, video.duration);
        }

        // Save progress every 10 seconds
        const now = Date.now();
        if (now - lastSavedTimeRef.current >= 10000) {
          lastSavedTimeRef.current = now;
          // Progress will be saved by parent component
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        if (onComplete) {
          onComplete();
        }
      };

      const handleError = () => {
        setError('Failed to load video. Please try again.');
        setIsLoading(false);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('error', handleError);

      // Set autoplay
      if (autoplay) {
        video.play().catch(() => {
          // Autoplay blocked by browser
          setIsPlaying(false);
        });
      }

      // Set initial playback rate
      if (video.readyState >= 1) {
        video.playbackRate = playbackRate;
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('error', handleError);
      };
    }
  }, [src, startTime, autoplay, onProgress, onComplete, playbackRate]);

  // Handle fullscreen and picture-in-picture
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handlePictureInPictureChange = () => {
      setIsPictureInPicture(!!document.pictureInPictureElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('enterpictureinpicture', handlePictureInPictureChange);
    document.addEventListener('leavepictureinpicture', handlePictureInPictureChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('enterpictureinpicture', handlePictureInPictureChange);
      document.removeEventListener('leavepictureinpicture', handlePictureInPictureChange);
    };
  }, []);



  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
      if (chaptersMenuRef.current && !chaptersMenuRef.current.contains(event.target as Node)) {
        setShowChapters(false);
      }
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
      if (subtitleMenuRef.current && !subtitleMenuRef.current.contains(event.target as Node)) {
        setShowSubtitleMenu(false);
      }
    };

    if (showSpeedMenu || showChapters || showQualityMenu || showSubtitleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSpeedMenu, showChapters, showQualityMenu, showSubtitleMenu]);

  const jumpToChapter = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
      setShowChapters(false);
    }
  };

  const getCurrentChapter = () => {
    if (!chapters.length) return null;
    const sortedChapters = [...chapters].sort((a, b) => b.timestamp - a.timestamp);
    return sortedChapters.find((chapter) => currentTime >= chapter.timestamp) || null;
  };

  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing video:', error);
      setError('Failed to play video');
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      videoRef.current.requestFullscreen().catch(() => {
        setError('Failed to enter fullscreen');
      });
    } else {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const togglePictureInPicture = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isPictureInPicture) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-picture error:', error);
      // Feature might not be supported
    }
  }, [isPictureInPicture]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              videoRef.current.duration,
              videoRef.current.currentTime + 10
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.min(1, videoRef.current.volume + 0.1);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(false);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.max(0, videoRef.current.volume - 0.1);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
          }
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isMuted, isFullscreen, togglePlay, toggleMute, toggleFullscreen]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={`rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20 ${className}`}>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button
          className="mt-4"
          onClick={() => {
            setError(null);
            setIsLoading(true);
            if (videoRef.current) {
              videoRef.current.load();
            }
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        )}

        <video
          ref={videoRef}
          src={getVideoSource}
          className="h-full w-full"
          playsInline
          preload="metadata"
        >
          {qualities && qualities.length > 0 && (
            <>
              {qualities.map((quality) => (
                <source key={quality.quality} src={quality.url} type="video/mp4" />
              ))}
            </>
          )}
          {subtitles && subtitles.length > 0 && (
            <>
              {subtitles.map((subtitle, index) => (
                <track
                  key={index}
                  kind="subtitles"
                  srcLang={subtitle.language}
                  src={subtitle.subtitleUrl}
                  label={subtitle.language.toUpperCase()}
                  default={subtitle.isDefault}
                />
              ))}
            </>
          )}
        </video>

        {/* Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlay}
            className="rounded-full bg-black/50 p-4 text-white hover:bg-black/70"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </Button>
        </div>
      </div>

      {/* Video Info */}
      {title && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      )}

      {/* Controls Bar */}
      <div className="mt-4 space-y-3 rounded-xl border border-border bg-card p-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700 relative z-10"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`,
              }}
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={currentTime}
            />
            {/* Chapter Markers */}
            {chapters.length > 0 && duration > 0 && (
              <div className="absolute top-0 left-0 w-full h-2 pointer-events-none">
                {chapters.map((chapter, index) => (
                  <div
                    key={index}
                    className="absolute h-full w-0.5 bg-yellow-400"
                    style={{
                      left: `${(chapter.timestamp / duration) * 100}%`,
                    }}
                    title={chapter.title}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Current Chapter Display */}
          {getCurrentChapter() && (
            <div className="text-xs text-muted-foreground">
              Chapter: {getCurrentChapter()?.title}
            </div>
          )}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="rounded-lg"
              title="Play/Pause (Space)"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="rounded-lg"
                title="Mute (M)"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                title="Volume (↑/↓)"
              />
            </div>

            {/* Playback Speed */}
            <div className="relative" ref={speedMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="rounded-lg"
                title="Playback Speed"
              >
                {playbackRate}x
              </Button>
              {showSpeedMenu && (
                <div className="absolute bottom-full left-0 mb-2 rounded-lg border border-border bg-card shadow-lg z-10">
                  <div className="p-2 space-y-1">
                    {playbackSpeeds.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handlePlaybackRateChange(speed)}
                        className={`w-full px-3 py-1.5 text-left text-sm rounded hover:bg-accent ${playbackRate === speed
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground'
                          }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subtitles */}
            {subtitles && subtitles.length > 0 && (
              <div className="relative" ref={subtitleMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                  className="rounded-lg"
                  title="Subtitles"
                >
                  <Subtitles className="h-4 w-4" />
                </Button>
                {showSubtitleMenu && (
                  <div className="absolute bottom-full left-0 mb-2 rounded-lg border border-border bg-card shadow-lg z-10">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setSelectedSubtitle(null);
                          setShowSubtitleMenu(false);
                          if (videoRef.current) {
                            const tracks = videoRef.current.textTracks;
                            for (let i = 0; i < tracks.length; i++) {
                              tracks[i].mode = 'hidden';
                            }
                          }
                        }}
                        className={`w-full px-3 py-1.5 text-left text-sm rounded hover:bg-accent ${selectedSubtitle === null
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground'
                          }`}
                      >
                        Off
                      </button>
                      {subtitles.map((subtitle, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedSubtitle(subtitle.language);
                            setShowSubtitleMenu(false);
                            if (videoRef.current) {
                              const tracks = videoRef.current.textTracks;
                              for (let i = 0; i < tracks.length; i++) {
                                if (tracks[i].language === subtitle.language) {
                                  tracks[i].mode = 'showing';
                                } else {
                                  tracks[i].mode = 'hidden';
                                }
                              }
                            }
                          }}
                          className={`w-full px-3 py-1.5 text-left text-sm rounded hover:bg-accent ${selectedSubtitle === subtitle.language
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground'
                            }`}
                        >
                          {subtitle.language.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chapters */}
            {chapters.length > 0 && (
              <div className="relative" ref={chaptersMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChapters(!showChapters)}
                  className="rounded-lg"
                  title="Chapters"
                >
                  <List className="h-4 w-4" />
                </Button>
                {showChapters && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-border bg-card shadow-lg z-10 max-h-64 overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {chapters
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .map((chapter, index) => {
                          const isActive = getCurrentChapter()?.timestamp === chapter.timestamp;
                          const formatTime = (seconds: number) => {
                            const mins = Math.floor(seconds / 60);
                            const secs = Math.floor(seconds % 60);
                            return `${mins}:${secs.toString().padStart(2, '0')}`;
                          };
                          return (
                            <button
                              key={index}
                              onClick={() => jumpToChapter(chapter.timestamp)}
                              className={`w-full px-3 py-2 text-left text-sm rounded hover:bg-accent ${isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground'
                                }`}
                            >
                              <div className="font-medium">{chapter.title}</div>
                              <div className="text-xs opacity-75">{formatTime(chapter.timestamp)}</div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Picture-in-Picture */}
            {document.pictureInPictureEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePictureInPicture}
                className="rounded-lg"
                title="Picture-in-Picture"
              >
                <PictureInPicture className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="rounded-lg"
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">
            Shortcuts: Space (Play/Pause) • ← → (Seek ±10s) • ↑ ↓ (Volume) • M (Mute) • F (Fullscreen)
          </span>
        </div>
      </div>
    </div>
  );
}

