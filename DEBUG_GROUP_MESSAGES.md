# Debugging Group Message Duplication

I've added comprehensive logging to help diagnose the group messaging issue. Here's how to debug it:

## Steps to Reproduce and Capture Logs

1. **Open Browser Console** (F12 or Right Click → Inspect → Console)

2. **Clear Console** to start fresh

3. **Send a message to a group** with 2+ participants

4. **Check the console output** for these key log messages:

### Expected Log Sequence

When you send a message, you should see:

```
[DM] Sending message: {
  recipients: ["pubkey1", "pubkey2"],
  conversationId: "group:pubkey1,pubkey2",
  protocol: "NIP17",
  isGroup: true
}

[DM] 🆕 Creating new conversation: group:pubkey1,pubkey2
OR
[DM] Adding message to conversation: {
  conversationPartner: "group:pubkey1,pubkey2",
  messageId: "optimistic-...",
  isSending: true,
  isFromCurrentUser: true,
  optimisticIndex: -1,
  ...
}

[DM] ➕ Adding new message (no optimistic match)
```

Then when the subscription receives the message back:

```
[DM] Processing incoming NIP-17 message: {
  giftWrapId: "...",
  conversationPartner: "group:pubkey1,pubkey2",
  sealPubkey: "your-pubkey",
  userPubkey: "your-pubkey",
  isFromUser: true,
  ...
}

[DM] Adding message to conversation: {
  conversationPartner: "group:pubkey1,pubkey2",
  messageId: "gift-wrap-id",
  isSending: false,
  isFromCurrentUser: true,
  optimisticIndex: 0,  // Should match the optimistic message!
  ...
}

[DM] ✅ Replacing optimistic message at index: 0
```

## What to Look For

### Problem 1: Optimistic Message Not Being Replaced

If you see:
```
[DM] ➕ Adding new message (no optimistic match)
```
Instead of:
```
[DM] ✅ Replacing optimistic message at index: 0
```

**This means the deduplication failed.** Check:
- Is `optimisticIndex` showing `-1`?
- Is `optimisticMessages` count showing `> 0`?
- Is the timestamp difference between messages > 60 seconds?
- Is the content exactly the same?

### Problem 2: Different Conversation IDs

If the `conversationPartner` is different between sending and receiving:

```
// When sending
conversationId: "group:alice,bob"

// When receiving
conversationPartner: "group:bob,alice"  // WRONG! Different order
```

**This means the pubkeys are being sorted differently.** This would cause messages to appear in separate conversations.

### Problem 3: Gift Wrap Publishing Failures

Check for errors like:
```
[DM] Failed to publish X/Y gift wraps
[DM] Gift wrap 0 failed: ...
```

If you see this, it means the message wasn't delivered to some participants.

You should also see:
```
Error: Message may not have been delivered to recipients...
```

In the UI toast notification.

### Problem 4: Message Appears Twice

If you see the message duplicated in the UI, check:

1. **Are there two separate conversations?**
   - Look at the conversation list
   - Check if there are two entries with similar names
   - Compare the `conversationPartner` IDs in the logs

2. **Are there two messages in one conversation?**
   - Check the logs for duplicate `[DM] Adding message` entries
   - See if both have `isSending: false` (both are real messages)
   - Check if `optimisticIndex: -1` (optimistic not being matched)

## Common Scenarios

### Scenario A: Duplication Due to Failed Deduplication

**Symptoms:**
- Message appears twice in same conversation
- Both copies look identical

**Logs to check:**
```
[DM] Adding message to conversation: {
  optimisticIndex: -1,  // ❌ Should be 0 or higher
  isFromCurrentUser: true,
  isSending: false,
  optimisticMessages: 1,  // There IS an optimistic message!
}
[DM] ➕ Adding new message (no optimistic match)  // ❌ Should be replacing!
```

**Possible causes:**
- Content mismatch (whitespace, formatting)
- Timestamp difference > 60 seconds
- Optimistic message already replaced/removed

### Scenario B: Different Conversation IDs

**Symptoms:**
- Message appears in wrong conversation
- Two similar conversations in list

**Logs to check:**
```
// Sending
conversationId: "group:abc,def"

// Receiving  
conversationPartner: "group:def,abc"  // ❌ Different!
```

**Possible causes:**
- JavaScript `.sort()` behaving inconsistently
- Pubkeys not being normalized (uppercase/lowercase)
- Extra/missing pubkeys in the list

### Scenario C: Gift Wrap Failures

**Symptoms:**
- Sender sees message
- Others don't receive it
- No error shown (before my fix)

**Logs to check:**
```
[DM] Failed to publish X/Y gift wraps
[DM] Gift wrap 0 failed: ...
```

**Possible causes:**
- Relay connection issues
- Relay rejecting events
- Network timeout

## Share These Logs

When reporting the issue, please share:

1. **The full console output** from sending a message
2. **Screenshot of the UI** showing the duplication
3. **Number of participants** in the group
4. **Which protocol** you're using (NIP-04 or NIP-17)
5. **Relay URL** you're connected to

## Quick Test

Try this simple test:

1. Open console
2. Send message "test 1" to a group
3. Wait 5 seconds
4. Send message "test 2" to same group
5. Copy all console logs
6. Share the logs

This will show if the issue is consistent or intermittent.

## Temporary Workarounds

While we debug:

1. **Clear cache**: Ctrl+Shift+R (hard refresh) clears message cache
2. **Try different relay**: Use the relay selector to switch relays
3. **Use 1-on-1 chats**: Individual chats might work better
4. **Check browser console**: Errors might give clues

## Next Steps

Based on the logs, I can:
- Identify the exact failure point
- Determine if it's deduplication, sorting, or publishing
- Create a targeted fix for the specific issue
- Add better error handling and user feedback
