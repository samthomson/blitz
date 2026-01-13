import { useMemo } from 'react';
import { useNewDMContext } from '@/contexts/NewDMContext';
import { ConversationSearchResult } from './ConversationSearchResult';
import { MessageSearchResult } from './MessageSearchResult';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchResultsProps {
  query: string;
  onSelectConversation: (conversationId: string, messageId?: string) => void;
}

export const SearchResults = ({ query, onSelectConversation }: SearchResultsProps) => {
  const { searchMessages, searchConversations } = useNewDMContext();

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

        {/* Conversations Section */}
        {conversationResults.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
              Chats
            </h3>
            <div className="space-y-1">
              {conversationResults.slice(0, 10).map((result) => (
                <ConversationSearchResult
                  key={result.conversationId}
                  result={result}
                  onClick={() => onSelectConversation(result.conversationId)}
                />
              ))}
            </div>
          </div>
        )}

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
