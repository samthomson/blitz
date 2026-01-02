import { useState, useEffect, useRef } from 'react';

export interface NetworkState {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useNetworkState(): NetworkState {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const wasOfflineRef = useRef(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Connection restored');
      setIsOnline(true);
      
      if (wasOfflineRef.current) {
        setWasOffline(true);
        setTimeout(() => setWasOffline(false), 1000);
      }
      wasOfflineRef.current = false;
    };

    const handleOffline = () => {
      console.log('[Network] Connection lost');
      setIsOnline(false);
      wasOfflineRef.current = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}

