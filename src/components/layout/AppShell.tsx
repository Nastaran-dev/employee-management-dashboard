import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { SidebarNav } from './SidebarNav';

interface AppShellProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, actions, children }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-dvh overflow-x-clip lg:pl-60 bg-black">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">
        <SidebarNav />
      </aside>

      <Dialog open={navOpen} onOpenChange={setNavOpen}>
        <DialogContent className="inset-y-0 left-0 w-64 animate-drawer-in lg:hidden">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">Main navigation menu</DialogDescription>
          <SidebarNav />
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              className="absolute right-2 top-3 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </Button>
          <p className="text-sm font-medium text-ink">{title}</p>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>

      <main  id="main" className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
