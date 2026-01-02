import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkState } from '@/hooks/useNetworkState';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkState();

  if (isOnline && !wasOffline) {
    return null; // Don't show anything when online and stable
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all",
        !isOnline
          ? "bg-destructive text-destructive-foreground"
          : "bg-green-500 text-white"
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You are offline. Messages will sync when connection is restored.</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" />
          <span>Connection restored. Reconnecting...</span>
        </>
      )}
    </div>
  );
}

