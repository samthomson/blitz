import { useState } from 'react';
import { Plus, Play, User } from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';
import { useShortsFromAuthors, useShorts } from '@/hooks/useShorts';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { RecordShortModal } from './RecordShortModal';
import { ShortViewerModal } from './ShortViewerModal';
import { MyShortsModal } from './MyShortsModal';
import type { ShortVideo } from '@/hooks/useShorts';

interface ShortThumbnailProps {
  short: ShortVideo;
  onClick: () => void;
}

function ShortThumbnail({ short, onClick }: ShortThumbnailProps) {
  const author = useAuthor(short.pubkey);
  const metadata = author.data?.metadata;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-1 group"
    >
      <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary/50 group-hover:ring-primary transition-all bg-muted">
        {/* Video thumbnail or first frame */}
        <video
          src={short.videoUrl}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
        {/* Play indicator overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
          <Play className="h-4 w-4 text-white fill-white opacity-80" />
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground truncate max-w-[56px] group-hover:text-foreground transition-colors">
        {metadata?.name || 'User'}
      </span>
    </button>
  );
}

interface ShortsStripProps {
  className?: string;
}

export function ShortsStrip({ className }: ShortsStripProps) {
  const { user, metadata } = useCurrentUser();
  const { data: follows } = useFollows();
  const { data: followedShorts, isLoading } = useShortsFromAuthors(follows, 20);
  const { data: myShorts } = useShorts({
    limit: 10,
    authors: user?.pubkey ? [user.pubkey] : undefined,
  });
  
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showMyShortsModal, setShowMyShortsModal] = useState(false);
  const [selectedShort, setSelectedShort] = useState<ShortVideo | null>(null);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  // Dedupe by author - show only the latest short per person
  const dedupedShorts = followedShorts?.reduce((acc, short) => {
    if (!acc.some(s => s.pubkey === short.pubkey)) {
      acc.push(short);
    }
    return acc;
  }, [] as typeof followedShorts) ?? [];

  const handleShortClick = (short: ShortVideo, index: number) => {
    setSelectedShort(short);
    setViewerStartIndex(index);
  };

  const hasMyShorts = myShorts && myShorts.length > 0;

  // Don't render if no follows or no shorts (and not logged in to add)
  if (!follows?.length && !isLoading && !user) return null;

  return (
    <>
      <div className={cn("py-3 border-b", className)}>
        <div className="px-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            {/* My Shorts / Add button - only show if logged in */}
            {user && (
              <button
                onClick={() => hasMyShorts ? setShowMyShortsModal(true) : setShowRecordModal(true)}
                className="flex-shrink-0 flex flex-col items-center gap-1 group relative"
              >
                {hasMyShorts ? (
                  <>
                    {/* Show latest short thumbnail with "You" label */}
                    <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary group-hover:ring-primary/80 transition-all bg-muted">
                      <video
                        src={myShorts[0].videoUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <Play className="h-4 w-4 text-white fill-white opacity-80" />
                      </div>
                    </div>
                    {/* Add badge */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRecordModal(true);
                      }}
                      className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-primary-foreground" />
                    </button>
                  </>
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors border-2 border-dashed border-primary/30 group-hover:border-primary/50">
                    <Plus className="h-6 w-6 text-primary/70 group-hover:text-primary transition-colors" />
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                  {hasMyShorts ? 'You' : 'Add'}
                </span>
              </button>
            )}

            {/* Loading state */}
            {isLoading && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <Skeleton className="h-2 w-10" />
                  </div>
                ))}
              </>
            )}

            {/* Shorts from followed users (deduped by author) */}
            {dedupedShorts.map((short, index) => (
              <ShortThumbnail 
                key={short.id} 
                short={short} 
                onClick={() => handleShortClick(short, index)}
              />
            ))}

            {/* Empty state - only show if not loading and has follows but no shorts */}
            {!isLoading && follows?.length && dedupedShorts.length === 0 && (
              <div className="flex-shrink-0 text-xs text-muted-foreground px-2">
                No shorts from people you follow
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Short Modal */}
      <RecordShortModal 
        open={showRecordModal} 
        onOpenChange={setShowRecordModal} 
      />

      {/* My Shorts Modal */}
      <MyShortsModal
        open={showMyShortsModal}
        onOpenChange={setShowMyShortsModal}
        onAddNew={() => {
          setShowMyShortsModal(false);
          setShowRecordModal(true);
        }}
      />

      {/* View Short Modal */}
      <ShortViewerModal
        shorts={dedupedShorts}
        startIndex={viewerStartIndex}
        open={!!selectedShort}
        onOpenChange={(open) => !open && setSelectedShort(null)}
      />
    </>
  );
}

