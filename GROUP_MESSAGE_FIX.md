# Group Messaging Duplication Fix

## Problem Description

Users reported that when posting messages to groups:
1. **Their own view**: Message appeared duplicated (shown twice)
2. **Other participants**: Could not see the message at all

## Root Cause Analysis

The issue had two interconnected causes:

### 1. Optimistic Message Deduplication Failure

When a user sends a group message via NIP-17:

1. **Optimistic message** is created and displayed immediately with `isSending: true`
2. **Multiple gift wraps** are published:
   - One to each recipient in the group
   - One to the sender (for message history)
3. **Real-time subscription** receives the gift wrap sent to the sender
4. **Deduplication logic** attempts to match the incoming message with the optimistic one

The deduplication was failing because:
- **30-second matching window** was too narrow for some edge cases
- **Matching logic** could incorrectly match optimistic messages with other optimistic messages
- When matching failed, both the optimistic and real message appeared

### 2. Silent Delivery Failures

When publishing gift wraps to the group:
- If gift wraps to **other participants failed** but the one to the **sender succeeded**
- The sender would see their message (via optimistic + subscription)
- But **other participants never received** the message
- **No error was shown** to the sender about the delivery failure

## Solution Implemented

### 1. Improved Deduplication Logic

**File**: `src/contexts/DMContext.tsx` (lines ~920-980)

Changes:
- **Increased matching window** from 30 seconds to 60 seconds
- **Added guard condition**: Only attempt optimistic matching for incoming messages (`!message.isSending`)
  - Prevents optimistic messages from matching with other optimistic messages
  - Only real incoming messages can replace optimistic ones
- **Better comments** explaining the deduplication strategy

```typescript
// Try to match with optimistic message
// For incoming messages from the user themselves, match against optimistic sends
const optimisticIndex = !message.isSending ? existing.messages.findIndex(msg =>
  msg.isSending &&
  msg.pubkey === message.pubkey &&
  msg.decryptedContent === message.decryptedContent &&
  Math.abs(msg.created_at - message.created_at) <= 60 // Increased to 60s
) : -1;
```

### 2. Enhanced Error Handling

**File**: `src/contexts/DMContext.tsx` (lines ~545-575)

Changes:
- **Detect partial failures**: Check if gift wraps to recipients failed while sender's succeeded
- **Throw descriptive error**: Notify user that message may not have been delivered
- **Prevent false success**: User is warned instead of seeing a "successful" send

```typescript
// Check if gift wraps to other participants failed (excluding sender's own gift wrap)
const recipientGiftWrapCount = giftWraps.length - 1; // Exclude sender's gift wrap
const recipientFailures = failures.length > 0 && failures.length >= recipientGiftWrapCount;

if (recipientFailures && recipients.length > 0) {
  // Only sender's gift wrap succeeded - warn user
  throw new Error(`Message may not have been delivered to recipients. Please check your relay connection and try again.`);
}
```

### 3. Added Documentation

**File**: `src/contexts/DMContext.tsx` (lines ~1145-1150)

Added comments explaining:
- Messages sent by the user are shown optimistically
- Real-time subscription deduplication prevents double-display
- How the seal pubkey indicates message authorship

## Testing Recommendations

To verify the fix works correctly, test these scenarios:

### Test 1: Normal Group Messaging
1. Create a group with 3+ participants
2. Send a message to the group
3. **Expected**: Message appears once in sender's view
4. **Expected**: All other participants see the message

### Test 2: Partial Relay Failure
1. Configure relay to reject some gift wraps (simulate network issues)
2. Send a group message
3. **Expected**: Error message appears if recipients didn't receive the message
4. **Expected**: User is prompted to retry

### Test 3: Optimistic Update Timing
1. Send a message with slow network
2. Wait for subscription to receive the gift wrap
3. **Expected**: Message appears once (optimistic is replaced by real)
4. **Expected**: No duplication even with 30-60 second delay

### Test 4: Rapid Consecutive Messages
1. Send multiple messages quickly to the same group
2. **Expected**: Each message appears exactly once
3. **Expected**: Messages appear in correct chronological order

## Technical Details

### NIP-17 Gift Wrap Flow

For group messages with recipients `[alice, bob]`:

1. **Inner message** (kind 14/15) created with p tags: `['p', alice], ['p', bob]`
2. **Seal events** (kind 13) created for each recipient + sender
3. **Gift wraps** (kind 1059) published:
   - To alice
   - To bob  
   - To sender (for message history)

### Conversation ID Generation

Group conversations are identified by sorted pubkey lists:

```typescript
// When sending
conversationId = `group:${[...recipients].sort().join(',')}`;

// When receiving
const sortedRecipients = [...allRecipients].sort();
conversationPartner = `group:${sortedRecipients.join(',')}`;
```

Both use the same sorting algorithm to ensure consistent IDs.

### Deduplication Strategy

Three levels of deduplication:

1. **Gift wrap ID**: Messages with same `originalGiftWrapId` are skipped
2. **Message ID**: Messages with same `id` are skipped  
3. **Optimistic matching**: Incoming messages replace optimistic ones based on:
   - Same author (`pubkey`)
   - Same content (`decryptedContent`)
   - Timestamp within 60 seconds

## Related Files

- `src/contexts/DMContext.tsx` - Main DM context with message handling
- `src/components/dm/DMChatArea.tsx` - Chat UI component
- `src/lib/dmConstants.ts` - DM configuration constants
- `src/lib/dmUtils.ts` - DM utility functions

## Future Improvements

Potential enhancements to consider:

1. **Retry mechanism**: Automatically retry failed gift wrap publishes
2. **Partial success UI**: Show which recipients received the message
3. **Delivery receipts**: Implement NIP-17 read receipts for confirmation
4. **Better error messages**: Specific errors for different failure types
5. **Optimistic timeout**: Remove optimistic messages that never get confirmed
