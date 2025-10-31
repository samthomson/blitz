import { useState, useMemo } from 'react';
import { nip19 } from 'nostr-tools';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquarePlus, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useDMContext } from '@/contexts/DMContext';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewConversationDialogProps {
  onStartConversation: (pubkey: string) => void;
}

function ContactItem({ pubkey, onClick }: { pubkey: string; onClick: () => void }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(pubkey);
  const avatarUrl = metadata?.picture;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors text-left"
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{displayName}</div>
        <div className="text-xs text-muted-foreground truncate font-mono">
          {pubkey.slice(0, 8)}...{pubkey.slice(-8)}
        </div>
      </div>
    </button>
  );
}

function SelectedContact({ pubkey, onRemove }: { pubkey: string; onRemove: () => void }) {
  const author = useAuthor(pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(pubkey);

  return (
    <Badge variant="secondary" className="pl-3 pr-2 py-1.5 gap-2">
      <span className="truncate max-w-[150px]">{displayName}</span>
      <button
        onClick={onRemove}
        className="hover:bg-muted rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

export function NewConversationDialog({ onStartConversation }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedPubkeys, setSelectedPubkeys] = useState<string[]>([]);
  const { toast } = useToast();
  const { conversations } = useDMContext();

  // Get all existing conversation pubkeys for autocomplete
  const existingContacts = useMemo(() => {
    return conversations.map(c => c.pubkey);
  }, [conversations]);

  // Filter contacts based on input
  const filteredContacts = useMemo(() => {
    if (!input.trim()) return existingContacts;

    const searchTerm = input.toLowerCase();
    return existingContacts.filter(pubkey => {
      // Don't show already selected contacts
      if (selectedPubkeys.includes(pubkey)) return false;

      // Match against pubkey
      if (pubkey.toLowerCase().includes(searchTerm)) return true;

      return false;
    });
  }, [input, existingContacts, selectedPubkeys]);

  const handleAddPubkey = (pubkey: string) => {
    if (!selectedPubkeys.includes(pubkey)) {
      setSelectedPubkeys([...selectedPubkeys, pubkey]);
      setInput('');
    }
  };

  const handleRemovePubkey = (pubkey: string) => {
    setSelectedPubkeys(selectedPubkeys.filter(p => p !== pubkey));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If user presses Enter and there's a filtered contact, add the first one
    if (e.key === 'Enter' && filteredContacts.length > 0 && input.trim()) {
      e.preventDefault();
      handleAddPubkey(filteredContacts[0]);
      return;
    }

    // If user presses Backspace on empty input, remove last selected contact
    if (e.key === 'Backspace' && !input && selectedPubkeys.length > 0) {
      e.preventDefault();
      setSelectedPubkeys(selectedPubkeys.slice(0, -1));
    }
  };

  const handleManualAdd = () => {
    if (!input.trim()) return;

    try {
      let pubkey: string;

      // Check if input is already a hex pubkey (64 characters)
      if (/^[0-9a-f]{64}$/i.test(input)) {
        pubkey = input.toLowerCase();
      } else if (input.startsWith('npub1')) {
        // Decode npub
        const decoded = nip19.decode(input);
        if (decoded.type !== 'npub') {
          throw new Error('Invalid npub format');
        }
        pubkey = decoded.data;
      } else if (input.startsWith('nprofile1')) {
        // Decode nprofile
        const decoded = nip19.decode(input);
        if (decoded.type !== 'nprofile') {
          throw new Error('Invalid nprofile format');
        }
        pubkey = decoded.data.pubkey;
      } else {
        throw new Error('Please enter a valid npub, nprofile, or hex pubkey');
      }

      handleAddPubkey(pubkey);
    } catch (error) {
      toast({
        title: 'Invalid input',
        description: error instanceof Error ? error.message : 'Please enter a valid Nostr identifier',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPubkeys.length === 0) {
      toast({
        title: 'No contacts selected',
        description: 'Please select at least one contact to start a conversation',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPubkeys.length > 1) {
      toast({
        title: 'Group messaging not yet supported',
        description: 'Please select only one contact. Group messaging will be added in a future update.',
        variant: 'destructive',
      });
      return;
    }

    // Start conversation with the selected contact
    onStartConversation(selectedPubkeys[0]);
    setOpen(false);
    setSelectedPubkeys([]);
    setInput('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setSelectedPubkeys([]);
      setInput('');
    }
  };

  const showSuggestions = input.trim().length > 0 || filteredContacts.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Select contacts or enter a Nostr public key
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected Contacts */}
          {selectedPubkeys.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedPubkeys.map(pubkey => (
                <SelectedContact
                  key={pubkey}
                  pubkey={pubkey}
                  onRemove={() => handleRemovePubkey(pubkey)}
                />
              ))}
            </div>
          )}

          {/* Input Field */}
          <div className="space-y-2">
            <Label htmlFor="pubkey">Add Contact</Label>
            <div className="flex gap-2">
              <Input
                id="pubkey"
                placeholder="Search or enter npub1..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="font-mono text-sm"
              />
              {input.trim() && (
                <Button type="button" onClick={handleManualAdd} variant="outline">
                  Add
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {existingContacts.length > 0
                ? 'Select from your contacts or enter a new npub/hex pubkey'
                : 'Enter npub, nprofile, or hex format'
              }
            </p>
          </div>

          {/* Contact Suggestions */}
          {showSuggestions && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {input.trim() ? 'Matching Contacts' : 'Recent Contacts'}
              </Label>
              <ScrollArea className="h-[200px] rounded-lg border">
                <div className="p-2">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.slice(0, 10).map(pubkey => (
                      <ContactItem
                        key={pubkey}
                        pubkey={pubkey}
                        onClick={() => handleAddPubkey(pubkey)}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No matching contacts found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={selectedPubkeys.length === 0}>
              Start Chat {selectedPubkeys.length > 0 && `(${selectedPubkeys.length})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
