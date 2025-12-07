import { describe, it, expect } from 'vitest';
import type { NostrEvent } from '@nostrify/nostrify';
import {
  MESSAGE_PROTOCOL,
  getMessageProtocol,
  isValidSendProtocol,
} from './dmConstants';

describe('dmConstants', () => {
  describe('getMessageProtocol', () => {
    it('identifies NIP-04 messages (kind 4)', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'test-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [['p', 'recipient']],
        content: 'encrypted',
        sig: 'test-sig',
      };

      expect(getMessageProtocol(event)).toBe(MESSAGE_PROTOCOL.NIP04);
    });

    it('identifies NIP-17 messages (kind 1059)', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'test-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 1059,
        tags: [],
        content: 'encrypted',
        sig: 'test-sig',
      };

      expect(getMessageProtocol(event)).toBe(MESSAGE_PROTOCOL.NIP17);
    });

    it('returns unknown for non-message event kinds', () => {
      const event: NostrEvent = {
        id: 'test-id',
        pubkey: 'test-pubkey',
        created_at: Math.floor(Date.now() / 1000),
        kind: 1,
        tags: [],
        content: 'regular note',
        sig: 'test-sig',
      };

      expect(getMessageProtocol(event)).toBe(MESSAGE_PROTOCOL.UNKNOWN);
    });
  });

  describe('isValidSendProtocol', () => {
    it('returns true for NIP-04', () => {
      expect(isValidSendProtocol(MESSAGE_PROTOCOL.NIP04)).toBe(true);
    });

    it('returns true for NIP-17', () => {
      expect(isValidSendProtocol(MESSAGE_PROTOCOL.NIP17)).toBe(true);
    });

    it('returns false for UNKNOWN', () => {
      expect(isValidSendProtocol(MESSAGE_PROTOCOL.UNKNOWN)).toBe(false);
    });

    it('returns false for invalid protocol strings', () => {
      // @ts-expect-error Testing invalid input
      expect(isValidSendProtocol('invalid')).toBe(false);
    });
  });
});

