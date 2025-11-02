import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Validate that an event is a proper DM event
 */
export function validateDMEvent(event: NostrEvent): boolean {
  // Must be kind 4 (NIP-04 DM)
  if (event.kind !== 4) return false;

  // Must have a 'p' tag
  const hasRecipient = event.tags?.some(([name]) => name === 'p');
  if (!hasRecipient) return false;

  // Must have content (even if encrypted)
  if (!event.content) return false;

  return true;
}

/**
 * Get the recipient pubkey from a DM event
 */
export function getRecipientPubkey(event: NostrEvent): string | undefined {
  return event.tags?.find(([name]) => name === 'p')?.[1];
}

/**
 * Get the conversation partner pubkey from a DM event
 * (the other person in the conversation, not the current user)
 */
export function getConversationPartner(event: NostrEvent, userPubkey: string): string | undefined {
  const isFromUser = event.pubkey === userPubkey;
  
  if (isFromUser) {
    // If we sent it, the partner is the recipient
    return getRecipientPubkey(event);
  } else {
    // If they sent it, the partner is the author
    return event.pubkey;
  }
}

/**
 * Format timestamp for display (matches Signal/WhatsApp/Telegram pattern)
 * Today: Show time (e.g., "2:45 PM")
 * Yesterday: "Yesterday"
 * This week: Day name (e.g., "Mon")
 * This year: Month and day (e.g., "Jan 15")
 * Older: Full date (e.g., "Jan 15, 2024")
 */
export function formatConversationTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  
  // Start of today (midnight)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Start of yesterday
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  
  // Start of this week (assuming week starts on Sunday, adjust if needed)
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  if (date >= todayStart) {
    // Today: Show time (e.g., "2:45 PM")
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } else if (date >= yesterdayStart) {
    // Yesterday
    return 'Yesterday';
  } else if (date >= weekStart) {
    // This week: Show day name (e.g., "Monday")
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  } else if (date.getFullYear() === now.getFullYear()) {
    // This year: Show month and day (e.g., "Jan 15")
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } else {
    // Older: Show full date (e.g., "Jan 15, 2024")
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Format timestamp as full date and time for tooltips
 * e.g., "Mon, Jan 15, 2024, 2:45 PM"
 */
export function formatFullDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString(undefined, { 
    weekday: 'short',
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit'
  });
}

/**
 * Create a consistent conversation ID from a set of participants
 * For 1-on-1: returns the single pubkey
 * For groups: returns "group:pubkey1,pubkey2,pubkey3" (sorted)
 * 
 * @param pubkeys - All participants (including sender and recipients)
 * @returns Conversation ID string
 */
export function createConversationId(pubkeys: string[]): string {
  // Remove duplicates and sort for consistency
  const uniqueSorted = [...new Set(pubkeys)].sort();
  
  // Single participant = 1-on-1 (return their pubkey)
  if (uniqueSorted.length === 1) {
    return uniqueSorted[0];
  }
  
  // Multiple participants = group chat
  return `group:${uniqueSorted.join(',')}`;
}

/**
 * Parse a conversation ID to get all participant pubkeys
 * 
 * @param conversationId - Either a pubkey or "group:pubkey1,pubkey2,pubkey3"
 * @returns Array of participant pubkeys
 */
export function parseConversationId(conversationId: string): string[] {
  if (conversationId.startsWith('group:')) {
    return conversationId.substring(6).split(',');
  }
  return [conversationId];
}

/**
 * Check if a conversation ID represents a group chat
 */
export function isGroupConversation(conversationId: string): boolean {
  return conversationId.startsWith('group:');
}
