import { useState } from 'react';
import { X, Plus, Play, Trash2, Loader2 } from 'lucide-react';
import { useShorts } from '@/hooks/useShorts';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { ShortVideo } from '@/hooks/useShorts';

interface MyShortsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNew: () => void;
}

interface ShortDetailViewProps {
  short: ShortVideo;
  onBack: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function ShortDetailView({ short, onBack, onDelete, isDeleting }: ShortDetailViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>

        {/* Video */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <video
            src={short.videoUrl}
            className="max-w-full max-h-full object-contain"
            controls
            autoPlay
            playsInline
          />
        </div>

        {/* Info */}
        <div className="p-4 border-t">
          <h3 className="font-semibold">{short.title}</h3>
          {short.description && (
            <p className="text-sm text-muted-foreground mt-1">{short.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Posted {new Date(short.publishedAt * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this short?</AlertDialogTitle>
            <AlertDialogDescription>
              This will request deletion from relays. Some relays may not honor deletion requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function MyShortsModal({ open, onOpenChange, onAddNew }: MyShortsModalProps) {
  const { user } = useCurrentUser();
  const { data: myShorts, isLoading } = useShorts({
    limit: 50,
    authors: user?.pubkey ? [user.pubkey] : undefined,
  });
  const [selectedShort, setSelectedShort] = useState<ShortVideo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (short: ShortVideo) => {
    setDeletingId(short.id);
    try {
      // NIP-09: Event Deletion Request
      await publishEvent({
        kind: 5,
        content: 'Deleted by user',
        tags: [
          ['e', short.id],
          ['k', '34236'],
        ],
      });
      
      // Invalidate shorts queries to refresh
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
      
      toast({ title: 'Deletion requested' });
      setSelectedShort(null);
    } catch (error) {
      console.error('MyShortsModal: Failed to delete', error);
      toast({
        title: 'Failed to delete',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Reset selection when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedShort(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-full h-[80vh] max-h-[600px] p-0 flex flex-col overflow-hidden">
        {selectedShort ? (
          <ShortDetailView
            short={selectedShort}
            onBack={() => setSelectedShort(null)}
            onDelete={() => handleDelete(selectedShort)}
            isDeleting={deletingId === selectedShort.id}
          />
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle>My Shorts</DialogTitle>
                <Button size="sm" onClick={onAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Short
                </Button>
              </div>
            </DialogHeader>

            {/* Grid */}
            <div className="flex-1 overflow-auto p-4">
              {isLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="aspect-[9/16] rounded-md" />
                  ))}
                </div>
              ) : !myShorts?.length ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-muted-foreground">No shorts yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first short video!
                  </p>
                  <Button className="mt-4" onClick={onAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Short
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {myShorts.map((short) => (
                    <button
                      key={short.id}
                      onClick={() => setSelectedShort(short)}
                      disabled={deletingId === short.id}
                      className={cn(
                        "relative aspect-[9/16] rounded-md overflow-hidden bg-muted group",
                        deletingId === short.id && "opacity-50"
                      )}
                    >
                      <video
                        src={short.videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        {deletingId === short.id ? (
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : (
                          <Play className="h-6 w-6 text-white fill-white opacity-80" />
                        )}
                      </div>
                      {/* Title */}
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-[10px] truncate">{short.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

