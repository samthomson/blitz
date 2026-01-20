import { useRef, useState, useEffect } from 'react';
import { useAuthor } from '@/hooks/useAuthor';
import { getDisplayName } from '@/lib/genUserName';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ShortVideo } from '@/hooks/useShorts';

interface ShortVideoCardProps {
  short: ShortVideo;
  isActive: boolean;
  className?: string;
}

export function ShortVideoCard({ short, isActive, className }: ShortVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const author = useAuthor(short.pubkey);
  const metadata = author.data?.metadata;
  const displayName = getDisplayName(short.pubkey, metadata);

  // Auto-play when active, pause when not
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, user needs to interact
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlayback = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoEnded = () => {
    // Loop the video
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full h-full bg-black flex items-center justify-center",
        className
      )}
      onClick={togglePlayback}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={short.videoUrl}
        className="max-w-full max-h-full object-contain"
        playsInline
        muted={isMuted}
        loop
        onEnded={handleVideoEnded}
        poster={short.thumbnailUrl}
      />

      {/* Play/Pause overlay */}
      {(!isPlaying || showControls) && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity",
          isPlaying && showControls ? "opacity-100" : "opacity-100"
        )}>
          {!isPlaying && (
            <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="h-10 w-10 text-white ml-1" />
            </div>
          )}
        </div>
      )}

      {/* Mute button */}
      <button
        onClick={toggleMute}
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

