import { useMemo } from 'react';
import { useNewDMContext } from '@/contexts/NewDMContext';
import { useAuthor } from '@/hooks/useAuthor';
import { getDisplayName } from '@/lib/genUserName';
import { ConversationSearchResult } from './ConversationSearchResult';
import { MessageSearchResult } from './MessageSearchResult';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchResultsProps {
  query: string;
  onSelectConversation: (conversationId: string, messageId?: string) => void;
}

// Helper component to filter conversations by participant names
// We need this as a component to use the useAuthor hook
const FilteredConversationResults = ({ 
  conversationResults, 
  query, 
  onSelectConversation 
}: { 
  conversationResults: ReturnType<ReturnType<typeof useNewDMContext>['searchConversations']>;
  query: string;
  onSelectConversation: (conversationId: string) => void;
}) => {
  const searchTerm = query.toLowerCase();
  
  // Filter and render conversations that match participant names
  const matchingResults = conversationResults.filter(result => {
    // Check each participant's display name
    for (const pubkey of result.participantPubkeys) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const author = useAuthor(pubkey);
      const metadata = author.data?.metadata;
      const displayName = getDisplayName(pubkey, metadata).toLowerCase();
      
      if (displayName.includes(searchTerm)) {
        return true;
      }
    }
    return false;
  });

  if (matchingResults.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
        Chats
      </h3>
      <div className="space-y-1">
        {matchingResults.slice(0, 10).map((result) => (
          <ConversationSearchResult
            key={result.conversationId}
            result={result}
            onClick={() => onSelectConversation(result.conversationId)}
          />
        ))}
      </div>
    </div>
  );
};

export const SearchResults = ({ query, onSelectConversation }: SearchResultsProps) => {
  const { searchMessages, searchConversations } = useNewDMContext();

  // Get search results
  const messageResults = useMemo(() => searchMessages(query), [query, searchMessages]);
  const conversationResults = useMemo(() => searchConversations(query), [query, searchConversations]);

  const hasAnyResults = messageResults.length > 0 || conversationResults.length > 0;

  if (!query.trim()) {
    return null;
  }

  return (
    <ScrollArea className="h-full block">
      <div className="block w-full px-2 py-2">
        {!hasAnyResults && (
          <div className="flex items-center justify-center h-32 text-center text-muted-foreground px-4">
            <p className="text-sm">No results found for "{query}"</p>
          </div>
        )}

        {/* Conversations Section - filtered by participant names */}
        <FilteredConversationResults 
          conversationResults={conversationResults}
          query={query}
          onSelectConversation={onSelectConversation}
        />

        {/* Messages Section */}
        {messageResults.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
              Messages
            </h3>
            <div className="space-y-1">
              {messageResults.slice(0, 50).map((result) => (
                <MessageSearchResult
                  key={result.message.id}
                  result={result}
                  onClick={() => onSelectConversation(result.conversationId, result.message.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
