import { useEffect, useRef, ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRelayLists } from '@/hooks/useRelayList';
import { useAppContext } from '@/hooks/useAppContext';
import { extractInboxRelays } from '@/lib/relayUtils';

interface RelayResolverProps {
  children: ReactNode;
  activeRelaysRef: React.MutableRefObject<string[]>;
}

export function RelayResolver({ children, activeRelaysRef }: RelayResolverProps) {
  const { user } = useCurrentUser();
  const { data: relayLists, isLoading } = useRelayLists();
  const { config } = useAppContext();
  const hasResolved = useRef(false);

  useEffect(() => {
    if (!user?.pubkey) {
      hasResolved.current = true;
      return;
    }

    if (isLoading) return;

    // Use shared utility to extract inbox relays (10050 > 10002 read > discovery)
    const inboxRelays = extractInboxRelays(relayLists, config.discoveryRelays);
    activeRelaysRef.current = inboxRelays;
    
    if (relayLists?.dmInbox?.relays && relayLists.dmInbox.relays.length > 0) {
      console.log('[RelayResolver] Using kind 10050 relays:', inboxRelays);
    } else if (relayLists?.nip65?.relays && relayLists.nip65.relays.length > 0) {
      console.log('[RelayResolver] Using kind 10002 read relays:', inboxRelays);
    } else {
      console.log('[RelayResolver] No relay lists found, using discovery relays:', inboxRelays);
    }

    if (!hasResolved.current) {
      hasResolved.current = true;
    }
  }, [user?.pubkey, relayLists, isLoading, activeRelaysRef, config.discoveryRelays]);

  if (user?.pubkey && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading relays...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

