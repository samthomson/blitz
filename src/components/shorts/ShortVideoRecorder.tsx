import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Square, SwitchCamera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_DURATION_MS = 10390; // 10.39 seconds
const MAX_DURATION_S = MAX_DURATION_MS / 1000;

interface ShortVideoRecorderProps {
  onVideoRecorded: (blob: Blob) => void;
  onCancel: () => void;
  className?: string;
}

export function ShortVideoRecorder({ onVideoRecorded, onCancel, className }: ShortVideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 9 / 16 },
        },
        audio: true,
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('ShortVideoRecorder: Camera access error', err);
      setHasPermission(false);
      setError(err instanceof Error ? err.message : 'Failed to access camera');
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [startCamera, stopStream]);

  const updateTimer = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    setElapsedTime(Math.min(elapsed, MAX_DURATION_S));

    if (elapsed < MAX_DURATION_S) {
      timerRef.current = requestAnimationFrame(updateTimer);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    
    // Determine supported mime type
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      onVideoRecorded(blob);
    };

    mediaRecorder.start(100); // Collect data every 100ms
    setIsRecording(true);
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    timerRef.current = requestAnimationFrame(updateTimer);

    // Auto-stop after max duration
    setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        stopRecording();
      }
    }, MAX_DURATION_MS);
  }, [onVideoRecorded, updateTimer]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const progress = (elapsedTime / MAX_DURATION_S) * 100;

  return (
    <div className={cn("flex flex-col h-full bg-black relative", className)}>
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onCancel}
        className="absolute top-4 left-4 z-20 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Camera switch button */}
      {hasPermission && (
        <Button
          variant="ghost"
          size="icon"
          onClick={switchCamera}
          disabled={isRecording}
          className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
        >
          <SwitchCamera className="h-6 w-6" />
        </Button>
      )}

      {/* Video preview */}
      <div className="flex-1 relative overflow-hidden">
        {hasPermission === false ? (
          <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
            <div>
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Camera access required</p>
              <p className="text-sm text-white/70 mt-2">{error || 'Please allow camera access to record shorts'}</p>
              <Button onClick={startCamera} className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        )}

        {/* Recording indicator and timer */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-mono text-sm">
              {elapsedTime.toFixed(1)}s / {MAX_DURATION_S}s
            </span>
          </div>
        )}

        {/* Progress bar */}
        {isRecording && (
          <div className="absolute bottom-24 left-4 right-4 z-20">
            <div className="h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Record button */}
      <div className="p-6 flex justify-center">
        {hasPermission && (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all",
              isRecording ? "bg-transparent" : "bg-red-500 hover:bg-red-600"
            )}
          >
            {isRecording ? (
              <Square className="h-8 w-8 text-red-500 fill-red-500" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-red-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

