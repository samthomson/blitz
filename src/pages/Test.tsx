import { NewDMMessagingInterface } from "@/components/dm/NewDMMessagingInterface";
import { useNewDMContext } from "@/contexts/NewDMContext";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";

export function Test() {
  const { messagingState, isLoading } = useNewDMContext();
  const [relayDetailsOpen, setRelayDetailsOpen] = useState(false);

  // Build relay-to-users mapping
  const relayData = useMemo(() => {
    if (!messagingState) return [];

    const relayMap = new Map<string, string[]>();
    
    for (const [pubkey, participant] of Object.entries(messagingState.participants)) {
      for (const relay of participant.derivedRelays) {
        if (!relayMap.has(relay)) {
          relayMap.set(relay, []);
        }
        relayMap.get(relay)!.push(pubkey);
      }
    }

    // Convert to array and sort by user count
    return Array.from(relayMap.entries())
      .map(([relay, users]) => ({ relay, users, count: users.length }))
      .sort((a, b) => b.count - a.count);
  }, [messagingState]);

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-4">DM System Test Page</h1>
      <p className="text-muted-foreground mb-4">
        This page is wrapped in NewDMProvider. Testing the new DM system.
      </p>
      
      {/* Debug Info */}
      <Card className="mb-4 bg-muted/50">
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Status:</span>{' '}
              <span className="font-mono">{isLoading ? '⏳ Loading...' : '✅ Ready'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Conversations:</span>{' '}
              <span className="font-mono">{messagingState ? Object.keys(messagingState.conversationMetadata).length : 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Participants:</span>{' '}
              <span className="font-mono">{messagingState ? Object.keys(messagingState.participants).length : 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Queried Relays:</span>{' '}
              <span className="font-mono">{messagingState?.syncState.queriedRelays.length || 0}</span>
            </div>
          </div>

          {/* Expandable Relay Details */}
          {messagingState && relayData.length > 0 && (
            <Collapsible open={relayDetailsOpen} onOpenChange={setRelayDetailsOpen} className="mt-4">
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
                <ChevronDown className={`h-4 w-4 transition-transform ${relayDetailsOpen ? 'rotate-180' : ''}`} />
                View Relay Details ({relayData.length} relays)
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {relayData.map(({ relay, users, count }) => {
                    const wasQueried = messagingState.syncState.queriedRelays.includes(relay);
                    
                    return (
                      <div key={relay} className="border rounded p-3 bg-background text-xs">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="font-mono text-xs break-all flex-1">
                            {wasQueried ? '✅' : '⚪'} {relay}
                          </div>
                          <div className="text-muted-foreground whitespace-nowrap">
                            {count} user{count !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <details className="text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">
                            Show participants ({users.length})
                          </summary>
                          <div className="mt-2 pl-4 space-y-1">
                            {users.map(pubkey => (
                              <div key={pubkey} className="font-mono text-xs">
                                {pubkey.substring(0, 16)}...{pubkey.substring(pubkey.length - 4)}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  ✅ = Queried in this session • ⚪ = Not queried (participant's relay but not needed)
                </p>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
      
      <hr className="mb-4" />
      <NewDMMessagingInterface className="h-full" />
    </div>
  );
}

export default Test;

