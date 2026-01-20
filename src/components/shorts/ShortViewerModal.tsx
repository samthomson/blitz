import { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
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

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={short.videoUrl}
        className="max-w-full max-h-full object-contain"
        playsInline
        muted={isMuted}
        loop
        poster={short.thumbnailUrl}
      />

      {/* Mute button */}
      <button
        onClick={onToggleMute}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>

      {/* Author info and title overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={metadata?.picture} />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-white font-medium">{displayName}</span>
        </div>
        <h3 className="text-white font-semibold text-lg">{short.title}</h3>
        {short.description && (
          <p className="text-white/80 text-sm mt-1 line-clamp-2">{short.description}</p>
        )}
      </div>
    </div>
  );
}

export function ShortViewerModal({ shorts, startIndex = 0, open, onOpenChange }: ShortViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isMuted, setIsMuted] = useState(true);

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

  if (shorts.length === 0) return null;

  const currentShort = shorts[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full h-[90vh] max-h-[800px] p-0 bg-black border-0 overflow-hidden [&>button]:hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 left-4 z-20 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation buttons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={cn(
              "text-white hover:bg-white/20",
              currentIndex === 0 && "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex === shorts.length - 1}
            className={cn(
              "text-white hover:bg-white/20",
              currentIndex === shorts.length - 1 && "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </div>

        {/* Current short */}
        <SingleShortView
          short={currentShort}
          isActive={true}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((prev) => !prev)}
        />

        {/* Progress indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-1">
          {shorts.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

