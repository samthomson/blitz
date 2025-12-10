import type { NostrEvent } from '@nostrify/nostrify';

export const RELAY_MODE = {
  DISCOVERY: 'discovery',
  HYBRID: 'hybrid',
  STRICT_OUTBOX: 'strict_outbox',
} as const;

export type RelayMode = typeof RELAY_MODE[keyof typeof RELAY_MODE];

export interface DMSettings {
  discoveryRelays: string[];
  relayMode: RelayMode;
  relayTTL: number;
  queryLimit: number;
}

export interface Participant {
  pubkey: string;
  derivedRelays: string[];
  blockedRelays: string[];
  lastFetched: number;
}

export interface Conversation {
  id: string;
  participantPubkeys: string[];
  subject: string;
  lastActivity: number;
  lastReadAt: number;
  hasNIP04: boolean;
  hasNIP17: boolean;
}

export interface Message {
  id: string;
  event: NostrEvent;
  conversationId: string;
  protocol: 'nip04' | 'nip17';
  giftWrapId?: string;
}

export interface RelayInfo {
  lastQuerySucceeded: boolean;
  lastQueryError: string | null;
  isBlocked: boolean;
}

export interface SyncState {
  lastCacheTime: number | null;
  queriedRelays: string[];
  queryLimitReached: boolean;
}

export interface CachedData {
  participants: Record<string, Participant>;
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>;
  syncState: SyncState;
  relayInfo: Record<string, RelayInfo>;
}

