import { useState, useCallback } from 'react';
import { ShortVideoRecorder } from './ShortVideoRecorder';
import { ShortVideoPreview } from './ShortVideoPreview';
import { usePublishShort } from '@/hooks/usePublishShort';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface RecordShortModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewState = 'recording' | 'preview';

export function RecordShortModal({ open, onOpenChange }: RecordShortModalProps) {
  const [viewState, setViewState] = useState<ViewState>('recording');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const { mutateAsync: publishShort, isPending: isPublishing } = usePublishShort();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleVideoRecorded = useCallback((blob: Blob) => {
    setRecordedBlob(blob);
    setViewState('preview');
  }, []);

  const handleCancel = useCallback(() => {
    setViewState('recording');
    setRecordedBlob(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleBackToRecording = useCallback(() => {
    setViewState('recording');
    setRecordedBlob(null);
  }, []);

  const handlePublish = useCallback(async (title: string, description: string) => {
    if (!recordedBlob) return;

    try {
      await publishShort({ videoBlob: recordedBlob, title, description });
      toast({ title: 'Short published successfully!' });
      
      // Invalidate shorts queries to refresh
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
      
      // Reset and close
      setViewState('recording');
      setRecordedBlob(null);
      onOpenChange(false);
    } catch (error) {
      console.error('RecordShortModal: Failed to publish', error);
      toast({
        title: 'Failed to publish',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  }, [recordedBlob, publishShort, toast, queryClient, onOpenChange]);

  // Reset state when modal closes
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setViewState('recording');
      setRecordedBlob(null);
    }
    onOpenChange(isOpen);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-full h-[90vh] max-h-[800px] p-0 bg-black border-0 overflow-hidden [&>button]:hidden">
        {viewState === 'recording' ? (
          <ShortVideoRecorder
            onVideoRecorded={handleVideoRecorded}
            onCancel={handleCancel}
          />
        ) : recordedBlob ? (
          <ShortVideoPreview
            videoBlob={recordedBlob}
            onPublish={handlePublish}
            onBack={handleBackToRecording}
            isPublishing={isPublishing}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

