import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronUp, ChevronDown, Volume2, VolumeX, Play, Loader2 } from 'lucide-react';
import { useAuthor } from '@/hooks/useAuthor';
import { getDisplayName } from '@/lib/genUserName';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ShortVideo } from '@/hooks/useShorts';

interface ShortViewerModalProps {
  shorts: ShortVideo[];
  startIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SingleShortViewProps {
  short: ShortVideo;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

function SingleShortView({ short, isActive, isMuted, onToggleMute }: SingleShortViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const author = useAuthor(short.pubkey);
  const metadata = author.data?.metadata;
  const displayName = getDisplayName(short.pubkey, metadata);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  // Sync playing state with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
    };
  }, []);

  // Reset and try to play when becoming active
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      setIsLoading(true);
      videoRef.current.load();
      // Don't auto-play - let user tap to play (mobile requirement)
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="w-full h-full bg-black flex flex-col overflow-hidden">
      {/* Video container - takes available space */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center">
        <video
          ref={videoRef}
          src={short.videoUrl}
          className="max-w-full max-h-full object-contain"
          playsInline
          muted={isMuted}
          loop
          poster={short.thumbnailUrl}
          onClick={togglePlay}
        />

        {/* Big play button overlay - show when not playing */}
        {!isPlaying && !isLoading && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-10 w-10 text-white fill-white ml-1" />
            </div>
          </button>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
        )}

        {/* Mute button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Author info and title - fixed height at bottom */}
      <div className="shrink-0 p-3 bg-black border-t border-white/10">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-white/50">
            <AvatarImage src={metadata?.picture} />
            <AvatarFallback className="text-xs">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <span className="text-white font-medium text-sm">{displayName}</span>
            {(short.title || short.description) && (
              <p className="text-white/70 text-xs truncate">
                {short.title || short.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShortViewerModal({ shorts, startIndex = 0, open, onOpenChange }: ShortViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isMuted, setIsMuted] = useState(true);
  const touchStartY = useRef<number | null>(null);

  // Reset to start index when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(startIndex);
    }
  }, [open, startIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(shorts.length - 1, prev + 1));
  }, [shorts.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'm') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, goToPrevious, goToNext]);

  // Touch/swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const threshold = 50; // minimum swipe distance
    
    if (diff > threshold) {
      // Swiped up - go to next
      goToNext();
    } else if (diff < -threshold) {
      // Swiped down - go to previous
      goToPrevious();
    }
    
    touchStartY.current = null;
  }, [goToNext, goToPrevious]);

  if (shorts.length === 0) return null;

  const currentShort = shorts[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < shorts.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md w-full h-[80vh] max-h-[600px] p-0 bg-black border-0 overflow-hidden [&>button]:hidden flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header area for close button and progress */}
        <div className="shrink-0 p-3 flex items-center justify-between bg-black z-30">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white bg-black/50 hover:bg-black/70 h-10 w-10"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Progress indicator */}
          {shorts.length > 1 && (
            <div className="flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {shorts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex 
                      ? "bg-primary ring-2 ring-primary/50 scale-125" 
                      : "bg-white/30 hover:bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {/* Spacer for balance */}
          <div className="w-10" />
        </div>

        {/* Video area - takes remaining space */}
        <div className="flex-1 min-h-0 relative">
          {/* Navigation buttons - side positioned */}
          {shorts.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                disabled={!hasPrevious}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 left-2 z-20 flex items-center justify-center",
                  "w-10 h-10 rounded-full bg-black/50 text-white transition-all",
                  hasPrevious ? "hover:bg-black/70 active:scale-95" : "opacity-30 cursor-not-allowed"
                )}
              >
                <ChevronUp className="h-6 w-6" />
              </button>

              <button
                onClick={goToNext}
                disabled={!hasNext}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 right-2 z-20 flex items-center justify-center",
                  "w-10 h-10 rounded-full bg-black/50 text-white transition-all",
                  hasNext ? "hover:bg-black/70 active:scale-95" : "opacity-30 cursor-not-allowed"
                )}
              >
                <ChevronDown className="h-6 w-6" />
              </button>
            </>
          )}

          <SingleShortView
            short={currentShort}
            isActive={true}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

