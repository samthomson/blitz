import { nip19 } from 'nostr-tools';
import type { NostrMetadata } from '@nostrify/nostrify';

/** Generate a display name for a pubkey by showing truncated npub format. */
export function genUserName(pubkey: string): string {
  // Show truncated npub instead of fake generated name
  const npub = nip19.npubEncode(pubkey);
  return `${npub.slice(0, 8)}...${npub.slice(-4)}`;
}

/**
 * Get display name for a user from their metadata
 * Prioritizes: display_name > name > truncated npub
 */
export function getDisplayName(pubkey: string, metadata?: NostrMetadata): string {
  if (metadata?.display_name) {
    return metadata.display_name;
  }
  if (metadata?.name) {
    return metadata.name;
  }
  return genUserName(pubkey);
}