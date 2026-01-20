import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShortVideoPreviewProps {
  videoBlob: Blob;
  onPublish: (title: string, description: string) => Promise<void>;
  onBack: () => void;
  isPublishing?: boolean;
  className?: string;
}

export function ShortVideoPreview({ 
  videoBlob, 
  onPublish, 
  onBack, 
  isPublishing = false,
  className 
}: ShortVideoPreviewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(videoBlob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoBlob]);

  const togglePlayback = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onPublish(title.trim(), description.trim());
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={isPublishing}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Preview Short</h2>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Video preview */}
          <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
            {previewUrl && (
              <>
                <video
                  ref={videoRef}
                  src={previewUrl}
                  className="w-full h-full object-contain"
                  playsInline
                  onEnded={handleVideoEnded}
                  onClick={togglePlayback}
                />
                {!isPlaying && (
                  <button
                    onClick={togglePlayback}
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-8 w-8 text-black ml-1" />
                    </div>
                  </button>
                )}
                {isPlaying && (
                  <button
                    onClick={togglePlayback}
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                      <Pause className="h-8 w-8 text-white" />
                    </div>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your short a title"
                maxLength={100}
                disabled={isPublishing}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                rows={3}
                maxLength={500}
                disabled={isPublishing}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!title.trim() || isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Short
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

