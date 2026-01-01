# Legacy DM System (Archived)

**Status:** DEPRECATED - Do not use

## What is this?

This folder contains the old direct messaging system that has been replaced by the new implementation:

- **Old:** `DMContext.tsx`, `DMMessagingInterface.tsx`, `DMConversationList.tsx`, `DMChatArea.tsx`, `DMStatusInfo.tsx`
- **New:** `NewDMContext.tsx`, `NewDMMessagingInterface.tsx`, `NewDMConversationList.tsx`, `NewDMChatArea.tsx` (located in `src/contexts/` and `src/components/dm/`)

## Why archived?

The legacy system has been completely rewritten with:
- Better architecture and data structures
- Improved relay management and failure handling
- Settings fingerprinting for cache invalidation
- Background relay list refresh
- Enhanced UI with relay failure indicators

## When to delete?

These files can be safely deleted once:
1. The new system has been in production for a reasonable period
2. No bugs requiring reference to the old implementation
3. Team is confident the new system is stable

## Date Archived

January 2, 2026

