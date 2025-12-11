/* eslint-disable */
// @ts-nocheck
import { describe, it, expect } from 'vitest';
import * as DMLib from './dmLib';

describe('DMLib', () => {
  describe('Pure', () => {
    describe('Relay', () => {
      it.todo('extractBlockedRelays');
      it.todo('deriveRelaySet');
      it.todo('findNewRelaysToQuery');
      it.todo('computeAllQueriedRelays');
      it.todo('buildRelayToUsersMap');
      it.todo('filterNewRelayUserCombos');
    });

    describe('Message', () => {
      it.todo('buildMessageFilters');
      it.todo('dedupeMessages');
      it.todo('extractPubkeysFromMessages');
    });

    describe('Participant', () => {
      it.todo('buildParticipant');
      it.todo('buildParticipantsMap');
      it.todo('mergeParticipants');
      it.todo('getStaleParticipants');
      it.todo('getNewPubkeys');
      it.todo('extractNewPubkeys');
      it.todo('determineNewPubkeys');
    });

    describe('Conversation', () => {
      it.todo('computeConversationId');
      it.todo('groupMessagesIntoConversations');
    });

    describe('Sync', () => {
      it.todo('computeSinceTimestamp');
      it.todo('buildCachedData');
    });
  });

  describe('Impure', () => {
    describe('Relay', () => {
      it.todo('fetchRelayLists');
      it.todo('fetchMyRelayInfo');
    });

    describe('Message', () => {
      it.todo('fetchMessages');
      it.todo('unwrapAllGiftWraps');
      it.todo('queryMessages');
      it.todo('queryNewRelays');
    });

    describe('Participant', () => {
      it.todo('refreshStaleParticipants');
      it.todo('fetchAndMergeParticipants');
    });

    describe('Cache', () => {
      it.todo('loadFromCache');
      it.todo('saveToCache');
      it.todo('buildAndSaveCache');
    });
  });
});

