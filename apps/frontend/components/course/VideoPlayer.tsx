'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, Settings, PictureInPicture, List, Monitor, Subtitles, Minimize2, Maximize2, LayoutTemplate, Share2 } from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement>(null);
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
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef<number>(0);

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

  // Handle controls visibility
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      setShowControls(false);
    }
  }, [isPlaying]);

  // Handle fullscreen change
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

  return (
    <div
      className={`relative w-full group ${isTheaterMode ? 'fixed inset-0 z-50 bg-black flex items-center justify-center p-10' : ''} ${className}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient Glow */}
      {!isTheaterMode && !isFullscreen && (
        <div className="absolute -inset-4 bg-brand-blue/20 blur-3xl opacity-50 rounded-[30px] -z-10 transition-opacity duration-1000 group-hover:opacity-80" />
      )}

      {/* Video Container */}
      <div className={`relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10 ${isTheaterMode ? 'max-w-7xl aspect-video' : 'aspect-video'}`}>
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
            <Loader2 className="h-12 w-12 animate-spin text-brand-blue" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/90 to-red-950/90 z-20">
            <div className="text-center p-8 max-w-md">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Failed to Load Video</h3>
              <p className="text-red-200 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}

        {/* Action Overlay (Play/Pause Animation) */}
        {!isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" onClick={togglePlay}>
            <div className={`transform transition-all duration-300 ${!isPlaying ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}`}>
              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-full border border-white/10">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={getVideoSource}
          className="h-full w-full object-contain cursor-pointer"
          playsInline
          preload="metadata"
          onClick={togglePlay}
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

        {/* Top Gradient Overlay */}
        <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-20 transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {title && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
            </div>
          )}
        </div>

        {/* Bottom Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12">

            {/* Progress Bar */}
            <div className="group/progress relative h-1.5 w-full cursor-pointer touch-none mb-4 flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 h-full w-full opacity-0 z-50 cursor-pointer"
              />
              <div className="relative h-1 w-full rounded-full bg-white/20 overflow-hidden group-hover/progress:h-1.5 transition-all">
                <div
                  className="absolute h-full bg-gradient-to-r from-brand-blue to-brand-neon transition-all"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
              </div>
              {/* Progress Handle */}
              <div
                className="absolute h-3 w-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${(currentTime / (duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
              />

              {/* Chapter Markers */}
              {chapters.length > 0 && duration > 0 && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-screen">
                  {chapters.map((chapter, index) => (
                    <div
                      key={index}
                      className="absolute h-full w-0.5 bg-brand-gold/50"
                      style={{
                        left: `${(chapter.timestamp / duration) * 100}%`,
                      }}
                      title={chapter.title}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Main Controls Row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="hover:text-brand-neon transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="h-6 w-6 fill-current" />
                  )}
                </button>

                <div className="flex items-center gap-2 group/volume">
                  <button onClick={toggleMute} className="hover:text-brand-blue transition-colors">
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>

                <div className="text-sm font-medium tracking-wide">
                  <span className="text-white">{formatTime(currentTime)}</span>
                  <span className="text-white/50 mx-1">/</span>
                  <span className="text-white/70">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Speed Toggle */}
                <div className="relative" ref={speedMenuRef}>
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-2 py-1 text-sm font-medium hover:text-brand-blue transition-colors rounded hover:bg-white/10"
                  >
                    {playbackRate}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-24 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                      {playbackSpeeds.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handlePlaybackRateChange(speed)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${playbackRate === speed ? 'text-brand-neon bg-white/5' : 'text-gray-300'}`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chapters Toggle */}
                {chapters.length > 0 && (
                  <div className="relative" ref={chaptersMenuRef}>
                    <button
                      onClick={() => setShowChapters(!showChapters)}
                      className="p-2 hover:text-brand-blue transition-colors rounded-lg hover:bg-white/10"
                      title="Chapters"
                    >
                      <List className="h-5 w-5" />
                    </button>
                    {showChapters && (
                      <div className="absolute bottom-full right-[-50px] mb-2 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-80 overflow-y-auto custom-scrollbar">
                        <div className="p-2 space-y-1">
                          {[...chapters]
                            .sort((a, b) => a.timestamp - b.timestamp)
                            .map((chapter, index) => {
                              const isActive = getCurrentChapter()?.timestamp === chapter.timestamp;
                              return (
                                <button
                                  key={index}
                                  onClick={() => jumpToChapter(chapter.timestamp)}
                                  className={`w-full px-3 py-3 text-left text-sm rounded-lg hover:bg-white/10 transition-colors flex items-center gap-3 ${isActive
                                    ? 'bg-brand-blue/10 border border-brand-blue/30'
                                    : 'border border-transparent'
                                    }`}
                                >
                                  <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-brand-neon' : 'bg-gray-600'}`} />
                                  <div>
                                    <div className={`font-medium ${isActive ? 'text-brand-blue' : 'text-gray-200'}`}>{chapter.title}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{formatTime(chapter.timestamp)}</div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="w-px h-6 bg-white/10 mx-2" />

                {/* Theater Mode */}
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="p-2 hover:text-brand-blue transition-colors rounded-lg hover:bg-white/10"
                  title={isTheaterMode ? "Exit Theater Mode" : "Theater Mode"}
                >
                  <LayoutTemplate className="h-5 w-5" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:text-brand-blue transition-colors rounded-lg hover:bg-white/10"
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Current Chapter Label */}
            {getCurrentChapter() && (
              <div className="mt-2 text-center">
                <span className="text-xs font-medium text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20 backdrop-blur-sm">
                  Now Playing: {getCurrentChapter()?.title}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Info (Only visible in normal mode, otherwise hides) */}
      {!isTheaterMode && title && (
        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{title}</h3>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

