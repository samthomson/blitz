import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Shield, Lock, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { APP_NAME } from '@/lib/constants';

interface HelpDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps = {}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!open && !onOpenChange && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Welcome to {APP_NAME}</DialogTitle>
          <DialogDescription>
            Your private, decentralized messaging app powered by Nostr
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Quick Start */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Login with your Nostr browser extension (nos2x, Alby, etc.)</li>
                <li>Click the <strong>+</strong> button to start a new conversation</li>
                <li>Enter a Nostr public key (npub or hex format)</li>
                <li>Start chatting - all messages are encrypted automatically!</li>
              </ol>
            </section>

            {/* Privacy Features */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Privacy & Security</h3>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">End-to-End Encrypted</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      NIP-44 encryption ensures only you and your recipient can read messages
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Metadata Private</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gift-wrapped messages hide your identity and timestamps from relays
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Decentralized</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      No central servers - your keys, your data, your freedom
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Active vs Requests */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Organizing Conversations</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Active:</strong> Conversations where you've sent at least one message
                </p>
                <p>
                  <strong className="text-foreground">Requests:</strong> New conversations from people you haven't replied to yet
                </p>
              </div>
            </section>

            {/* Tips */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Tips & Shortcuts</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to send a message</li>
                <li>• Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift+Enter</kbd> for a new line</li>
                <li>• Click 📎 to attach files or images</li>
                <li>• Use the ⚙️ menu to toggle dark mode or view status</li>
              </ul>
            </section>

            {/* Finding People */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Finding People</h3>
              <p className="text-sm text-muted-foreground mb-2">
                To message someone, you need their Nostr public key (npub). You can find people on:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <a href="https://primal.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">primal.net</a></li>
                <li>• <a href="https://snort.social" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">snort.social</a></li>
                <li>• <a href="https://iris.to" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">iris.to</a></li>
              </ul>
            </section>

            {/* Troubleshooting */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Troubleshooting</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Messages not sending?</strong><br />
                  Check your internet connection and try switching relays in settings
                </p>
                <p>
                  <strong className="text-foreground">Messages not loading?</strong><br />
                  Click the info icon (ⓘ) to view status, or try clearing cache
                </p>
                <p>
                  <strong className="text-foreground">Can't login?</strong><br />
                  Make sure your browser extension is unlocked and refresh the page
                </p>
              </div>
            </section>

            {/* Security Best Practices */}
            <section className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 text-destructive">Security Best Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Backup your private key (nsec) in a secure location</li>
                <li>✓ Never share your nsec with anyone</li>
                <li>✓ Always verify you're messaging the right person</li>
                <li>✓ Use hardware wallets for maximum security</li>
              </ul>
            </section>

            {/* Footer */}
            <section className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {APP_NAME} uses <strong>NIP-17</strong> for private messaging<br />
                Learn more at{' '}
                <a
                  href="https://github.com/nostr-protocol/nips/blob/master/17.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  NIP-17 Documentation
                </a>
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
