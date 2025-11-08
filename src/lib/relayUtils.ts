import type { NPool } from '@nostrify/nostrify';
import type { RelayEntry } from '@/hooks/useRelayList';

/**
 * Bulk fetch NIP-65 relay lists for multiple pubkeys
 * Returns a Map of pubkey -> relay list
 * More efficient than individual queries
 */
export async function fetchRelayListsBulk(
  nostr: NPool,
  discoveryRelays: string[],
  pubkeys: string[]
): Promise<Map<string, RelayEntry[]>> {
  if (pubkeys.length === 0) {
    return new Map();
  }

  const relayGroup = nostr.group(discoveryRelays);
  const results = new Map<string, RelayEntry[]>();

  try {
    // Single query for all pubkeys
    const events = await relayGroup.query(
      [{ kinds: [10002], authors: pubkeys }],
      { signal: AbortSignal.timeout(15000) }
    );

    // Parse each event and map to pubkey
    for (const event of events) {
      const relays: RelayEntry[] = [];

      for (const tag of event.tags) {
        if (tag[0] !== 'r') continue;
        const url = tag[1];
        const marker = tag[2];
        if (!url) continue;

        switch (marker) {
          case 'read':
            relays.push({ url, read: true, write: false });
            break;
          case 'write':
            relays.push({ url, read: false, write: true });
            break;
          default:
            relays.push({ url, read: true, write: true });
        }
      }

      if (relays.length > 0) {
        results.set(event.pubkey, relays);
      }
    }
  } catch (error) {
    console.error('[RelayUtils] Failed to fetch relay lists in bulk:', error);
  }

  return results;
}

/**
 * Batch process pubkeys in chunks to avoid overwhelming relays
 * Useful for large lists of participants
 */
export async function fetchRelayListsBatched(
  nostr: NPool,
  discoveryRelays: string[],
  pubkeys: string[],
  batchSize = 50
): Promise<Map<string, RelayEntry[]>> {
  const results = new Map<string, RelayEntry[]>();

  // Split into batches
  for (let i = 0; i < pubkeys.length; i += batchSize) {
    const batch = pubkeys.slice(i, i + batchSize);
    const batchResults = await fetchRelayListsBulk(nostr, discoveryRelays, batch);
    
    // Merge into results
    batchResults.forEach((relays, pubkey) => {
      results.set(pubkey, relays);
    });
  }

  return results;
}

/**
 * Extract read relays (inbox) from a relay list
 */
export function getInboxRelays(relays: RelayEntry[]): string[] {
  return relays.filter(r => r.read).map(r => r.url);
}

/**
 * Extract write relays (outbox) from a relay list
 */
export function getOutboxRelays(relays: RelayEntry[]): string[] {
  return relays.filter(r => r.write).map(r => r.url);
}

