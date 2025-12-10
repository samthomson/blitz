/* eslint-disable */
// @ts-nocheck
import { createContext, useContext, ReactNode } from 'react';
import type { NostrEvent, NPool } from '@nostrify/nostrify';
import type {
  DMSettings,
  Participant,
  Message,
  CachedData,
  RelayMode,
  RelayListsResult,
} from '@/lib/dmTypes';

interface Signer {
  nip44?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    decrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
}

interface MessageWithMetadata {
  event: NostrEvent;
  senderPubkey?: string;
  participants?: string[];
  subject?: string;
}

enum StartupMode {
  COLD = 'cold',
  WARM = 'warm',
}

// ============================================================================
// Pure Functions
// ============================================================================

const extractBlockedRelays = (kind10006: NostrEvent | null): string[] => {}
const deriveRelaySet = (kind10002: NostrEvent | null, kind10050: NostrEvent | null, blockedRelays: string[], relayMode: RelayMode, discoveryRelays: string[]): string[] => {}
const getStaleParticipants = (participants: Record<string, Participant>, relayTTL: number, now: number): string[] => {}
const getNewPubkeys = (foundPubkeys: string[], existingPubkeys: string[]): string[] => {}
const extractPubkeysFromMessages = (messages: MessageWithMetadata[], myPubkey: string): string[] => {}
const buildMessageFilters = (myPubkey: string, since: number | null): Array<{ kinds: number[]; '#p'?: string[]; since?: number }> => {}
const dedupeMessages = (existing: Message[], incoming: Message[]): Message[] => {}
const computeConversationId = (participantPubkeys: string[], subject: string): string => {}
const groupMessagesIntoConversations = (messages: Message[], myPubkey: string): Record<string, Message[]> => {}
const buildRelayToUsersMap = (participants: Record<string, Participant>): Map<string, string[]> => {}
const filterNewRelayUserCombos = (relayUserMap: Map<string, string[]>, alreadyQueriedRelays: string[]): string[] => {}
const buildParticipant = (
  publicKey: string,
  lists: RelayListsResult | null,
  myBlockedRelays: string[],
  relayMode: RelayMode,
  discoveryRelays: string[]
): Participant => {}
const buildParticipantsMap = (
  pubkeys: string[],
  relayListsMap: Map<string, RelayListsResult>,
  myBlockedRelays: string[],
  relayMode: RelayMode,
  discoveryRelays: string[]
): Record<string, Participant> => {}
const mergeParticipants = (existing: Record<string, Participant>, incoming: Record<string, Participant>): Record<string, Participant> => {}
const computeSinceTimestamp = (lastCacheTime: number | null, nip17FuzzDays: number): number | null => {}
const determineNewPubkeys = (foundPubkeys: string[], existingPubkeys: string[], mode: StartupMode): string[] => {}
const buildCachedData = (participants: Record<string, Participant>, messages: Message[], queriedRelays: string[], queryLimitReached: boolean): CachedData => {}

// ============================================================================
// Impure Functions
// ============================================================================

const fetchRelayLists = async (nostr: NPool, discoveryRelays: string[], pubkeys: string[]): Promise<Map<string, RelayListsResult>> => {}
const fetchMessages = async (nostr: NPool, relays: string[], filters: Array<{ kinds: number[]; '#p'?: string[]; since?: number }>, queryLimit: number): Promise<{ messages: NostrEvent[]; limitReached: boolean }> => {}
const unwrapAllGiftWraps = async (messages: NostrEvent[], signer: Signer): Promise<MessageWithMetadata[]> => {}
const loadFromCache = async (myPubkey: string): Promise<CachedData | null> => {}
const saveToCache = async (myPubkey: string, data: CachedData): Promise<void> => {}
const refreshStaleParticipants = async (
  nostr: NPool,
  participants: Record<string, Participant>,
  myBlockedRelays: string[],
  relayMode: RelayMode,
  discoveryRelays: string[],
  relayTTL: number
): Promise<Record<string, Participant>> => {}

// ============================================================================
// Orchestrators
// ============================================================================

const startup = async (nostr: NPool, signer: Signer, myPubkey: string, settings: DMSettings, mode: StartupMode, cached: CachedData | null): Promise<CachedData> => {
  // A. Fetch my relay lists
  const myRelayLists = await fetchRelayLists(nostr, settings.discoveryRelays, [myPubkey]);
  const myLists = myRelayLists.get(myPubkey)!;
  const myBlockedRelays = extractBlockedRelays(myLists.kind10006);

  // B. Derive my relay set
  const relaySet = deriveRelaySet(myLists.kind10002, myLists.kind10050, myBlockedRelays, settings.relayMode, settings.discoveryRelays);

  // B.2/B.3 Refresh stale participants (warm start only)
  const baseParticipants = mode === StartupMode.WARM 
    ? await refreshStaleParticipants(nostr, cached.participants, myBlockedRelays, settings.relayMode, settings.discoveryRelays, settings.relayTTL)
    : {};

  // C. Query messages
  const since = mode === StartupMode.WARM ? computeSinceTimestamp(cached.syncState.lastCacheTime, 2) : null;
  const filters = buildMessageFilters(myPubkey, since);
  const { messages: rawMessages, limitReached: limitReached1 } = await fetchMessages(nostr, relaySet, filters, settings.queryLimit);
  const messagesWithMetadata = await unwrapAllGiftWraps(rawMessages, signer);

  // D. Extract unique users
  const foundPubkeys = extractPubkeysFromMessages(messagesWithMetadata, myPubkey);
  const existingPubkeys = Object.keys(baseParticipants);
  const newPubkeys = determineNewPubkeys(foundPubkeys, existingPubkeys, mode);

  // E. Fetch relay lists for new users
  const participantRelayLists = await fetchRelayLists(nostr, settings.discoveryRelays, newPubkeys);

  // F. Build and merge participants
  const newParticipants = buildParticipantsMap(newPubkeys, participantRelayLists, myBlockedRelays, settings.relayMode, settings.discoveryRelays);
  const participants = mergeParticipants(baseParticipants, newParticipants);

  // H. Find new relays to query
  const relayUserMap = buildRelayToUsersMap(participants);
  const alreadyQueried = mode === StartupMode.WARM ? cached.syncState.queriedRelays : relaySet;
  const newRelays = filterNewRelayUserCombos(relayUserMap, alreadyQueried);

  // I. Query new relays (full history)
  const newRelayFilters = buildMessageFilters(myPubkey);
  const { messages: additionalMessages, limitReached: limitReached2 } = await fetchMessages(nostr, newRelays, newRelayFilters, settings.queryLimit);
  const additionalWithMetadata = await unwrapAllGiftWraps(additionalMessages, signer);
  const allMessages = [...messagesWithMetadata, ...additionalWithMetadata];

  // J. Build and save
  const allQueriedRelays = mode === StartupMode.WARM
    ? [...new Set([...cached.syncState.queriedRelays, ...newRelays])]
    : [...relaySet, ...newRelays];
  const cachedData = buildCachedData(participants, [], allQueriedRelays, limitReached1 || limitReached2);
  await saveToCache(myPubkey, cachedData);
  return cachedData;
}

const init = async (nostr: NPool, signer: Signer, myPubkey: string, settings: DMSettings): Promise<CachedData> => {
  const cached = await loadFromCache(myPubkey);
  // todo: have a const define a ttl and compare it here
  const mode = cached && cached.syncState.lastCacheTime ? StartupMode.WARM : StartupMode.COLD;
  return startup(nostr, signer, myPubkey, settings, mode, cached);
}

// ============================================================================
// React Context
// ============================================================================

type NewDMContextValue = object;

const NewDMContext = createContext<NewDMContextValue | undefined>(undefined);

export const NewDMProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NewDMContext.Provider value={{}}>
      {children}
    </NewDMContext.Provider>
  );
}

export const useNewDMContext = (): NewDMContextValue => {
  const context = useContext(NewDMContext);
  if (!context) {
    throw new Error('useNewDMContext must be used within a NewDMProvider');
  }
  return context;
}
