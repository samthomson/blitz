import { describe, it, expect } from 'vitest';
import type { NostrEvent } from '@nostrify/nostrify';
import {
  validateDMEvent,
  getRecipientPubkey,
  getConversationPartner,
  formatConversationTime,
  formatFullDateTime,
  createConversationId,
  parseConversationId,
  getPubkeyColor,
  isGroupConversation,
} from './dmUtils';

describe('dmUtils', () => {
  describe('validateDMEvent', () => {
    it('validates a proper NIP-04 DM event', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'sender-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [['p', 'recipient-pubkey']],
        content: 'encrypted content',
        sig: 'test-sig',
      };

      expect(validateDMEvent(event)).toBe(true);
    });

    it('rejects events with wrong kind', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'sender-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 1, // wrong kind
        tags: [['p', 'recipient-pubkey']],
        content: 'encrypted content',
        sig: 'test-sig',
      };

      expect(validateDMEvent(event)).toBe(false);
    });

    it('rejects events without p tag', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'sender-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [], // no p tag
        content: 'encrypted content',
        sig: 'test-sig',
      };

      expect(validateDMEvent(event)).toBe(false);
    });

    it('rejects events without content', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'sender-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [['p', 'recipient-pubkey']],
        content: '', // empty content
        sig: 'test-sig',
      };

      expect(validateDMEvent(event)).toBe(false);
    });
  });

  describe('getRecipientPubkey', () => {
    it('extracts recipient pubkey from p tag', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'sender-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [['p', 'recipient-pubkey']],
        content: 'encrypted content',
        sig: 'test-sig',
      };

      expect(getRecipientPubkey(event)).toBe('recipient-pubkey');
    });

    it('returns undefined when no p tag exists', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'sender-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [],
        content: 'encrypted content',
        sig: 'test-sig',
      };

      expect(getRecipientPubkey(event)).toBeUndefined();
    });
  });

  describe('getConversationPartner', () => {
    it('returns recipient when user is sender', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'user-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [['p', 'other-pubkey']],
        content: 'encrypted content',
        sig: 'test-sig',
      };

      expect(getConversationPartner(event, 'user-pubkey')).toBe('other-pubkey');
    });

    it('returns sender when user is recipient', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'other-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [['p', 'user-pubkey']],
        content: 'encrypted content',
        sig: 'test-sig',
      };

      expect(getConversationPartner(event, 'user-pubkey')).toBe('other-pubkey');
    });

    it('returns undefined when no conversation partner found', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'other-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [], // no p tag
        content: 'encrypted content',
        sig: 'test-sig',
      };

      expect(getConversationPartner(event, 'user-pubkey')).toBeUndefined();
    });
  });

  describe('formatConversationTime', () => {
    it('shows time for messages today', () => {
      const todayTimestamp = Math.floor(new Date('2024-01-15T10:15:00').getTime() / 1000);
      const formatted = formatConversationTime(todayTimestamp);
      
      // Should show time like "10:15 AM"
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    it('shows "Yesterday" for messages from yesterday', () => {
      const yesterdayTimestamp = Math.floor(new Date('2024-01-14T20:00:00').getTime() / 1000);
      const formatted = formatConversationTime(yesterdayTimestamp);
      
      expect(formatted).toBe('Yesterday');
    });

    it('shows day name for messages this week', () => {
      const thisWeekTimestamp = Math.floor(new Date('2024-01-13T12:00:00').getTime() / 1000);
      const formatted = formatConversationTime(thisWeekTimestamp);
      
      // Should show day name like "Sat" or "Saturday"
      expect(formatted).toMatch(/\w{3}/);
    });

    it('shows month and day for messages this year', () => {
      const thisYearTimestamp = Math.floor(new Date('2024-01-01T12:00:00').getTime() / 1000);
      const formatted = formatConversationTime(thisYearTimestamp);
      
      // Should show like "Jan 1"
      expect(formatted).toMatch(/\w{3}\s+\d{1,2}/);
    });

    it('shows full date for messages from previous years', () => {
      const oldTimestamp = Math.floor(new Date('2023-12-25T12:00:00').getTime() / 1000);
      const formatted = formatConversationTime(oldTimestamp);
      
      // Should show like "Dec 25, 2023"
      expect(formatted).toMatch(/\w{3}\s+\d{1,2},\s+\d{4}/);
    });
  });

  describe('formatFullDateTime', () => {
    it('formats timestamp as full date and time', () => {
      const timestamp = Math.floor(new Date('2024-01-15T14:30:00').getTime() / 1000);
      const formatted = formatFullDateTime(timestamp);
      
      // Should include weekday, date, and time
      expect(formatted).toMatch(/\w{3}/); // Weekday
      expect(formatted).toMatch(/\d{4}/); // Year
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Time
    });
  });

  describe('createConversationId', () => {
    it('creates ID for self-messaging', () => {
      const id = createConversationId(['alice']);
      expect(id).toBe('group:alice');
    });

    it('creates ID for 1-on-1 conversation', () => {
      const id = createConversationId(['alice', 'bob']);
      // Should be sorted alphabetically
      expect(id).toBe('group:alice,bob');
    });

    it('creates ID for group conversation', () => {
      const id = createConversationId(['alice', 'bob', 'charlie']);
      expect(id).toBe('group:alice,bob,charlie');
    });

    it('sorts participants alphabetically', () => {
      const id1 = createConversationId(['charlie', 'alice', 'bob']);
      const id2 = createConversationId(['bob', 'alice', 'charlie']);
      
      expect(id1).toBe(id2);
      expect(id1).toBe('group:alice,bob,charlie');
    });

    it('removes duplicate participants', () => {
      const id = createConversationId(['alice', 'bob', 'alice', 'bob']);
      expect(id).toBe('group:alice,bob');
    });

    it('ensures same ID regardless of input order', () => {
      const id1 = createConversationId(['bob', 'alice']);
      const id2 = createConversationId(['alice', 'bob']);
      
      expect(id1).toBe(id2);
      expect(id1).toBe('group:alice,bob');
    });
  });

  describe('parseConversationId', () => {
    it('parses new format conversation ID', () => {
      const participants = parseConversationId('group:alice,bob,charlie');
      expect(participants).toEqual(['alice', 'bob', 'charlie']);
    });

    it('parses self-messaging ID', () => {
      const participants = parseConversationId('group:alice');
      expect(participants).toEqual(['alice']);
    });

    it('handles legacy format (bare pubkey)', () => {
      const participants = parseConversationId('bob-pubkey');
      expect(participants).toEqual(['bob-pubkey']);
    });

    it('parses 1-on-1 conversation ID', () => {
      const participants = parseConversationId('group:alice,bob');
      expect(participants).toEqual(['alice', 'bob']);
    });
  });

  describe('getPubkeyColor', () => {
    it('returns consistent color for same pubkey', () => {
      const pubkey = 'test-pubkey-123';
      const color1 = getPubkeyColor(pubkey);
      const color2 = getPubkeyColor(pubkey);
      
      expect(color1).toBe(color2);
    });

    it('returns valid hex color format', () => {
      const color = getPubkeyColor('test-pubkey');
      
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('generates different colors for different pubkeys', () => {
      const color1 = getPubkeyColor('pubkey1');
      const color2 = getPubkeyColor('pubkey2');
      const color3 = getPubkeyColor('pubkey3');
      
      // At least some should be different (extremely unlikely all 3 are same)
      const uniqueColors = new Set([color1, color2, color3]);
      expect(uniqueColors.size).toBeGreaterThan(1);
    });

    it('handles typical Nostr pubkey format', () => {
      const pubkey = 'e4690a13290739da123aa17d553851dec4cdd0e9d89aa18de3741c446caf8761';
      const color = getPubkeyColor(pubkey);
      
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('isGroupConversation', () => {
    it('returns false for self-messaging', () => {
      expect(isGroupConversation('group:alice')).toBe(false);
    });

    it('returns false for 1-on-1 conversation', () => {
      expect(isGroupConversation('group:alice,bob')).toBe(false);
    });

    it('returns true for 3+ participants', () => {
      expect(isGroupConversation('group:alice,bob,charlie')).toBe(true);
    });

    it('returns true for large groups', () => {
      expect(isGroupConversation('group:alice,bob,charlie,david,eve')).toBe(true);
    });

    it('handles legacy format (bare pubkey) as 1-on-1', () => {
      expect(isGroupConversation('bob-pubkey')).toBe(false);
    });
  });
});

