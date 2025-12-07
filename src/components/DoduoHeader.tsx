import { MessageSquare, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoginArea } from '@/components/auth/LoginArea';
import { HelpDialog } from '@/components/HelpDialog';
import { SettingsModal } from '@/components/SettingsModal';

export function DoduoHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <MessageSquare className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Doduo
              </h1>
              <p className="text-xs text-muted-foreground">Private messaging</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LoginArea className="max-w-48" />

            <HelpDialog />

            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <SettingsModal 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
      />
    </>
  );
}
