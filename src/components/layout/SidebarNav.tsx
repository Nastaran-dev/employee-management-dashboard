import { Users } from 'lucide-react';

export function SidebarNav() {
  return (
    <div className="flex h-full flex-col bg-sidebar text-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-line px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-soft text-brand">
          <Users aria-hidden="true" className="h-4 w-4" />
        </span>
        <span className="text-base font-semibold tracking-tight">Roster</span>
      </div>

      <nav aria-label="Main" className="flex-1 px-3 py-4">
        <ul>
          <li>
            <a
              href="/"
              aria-current="page"
              className="flex items-center gap-3 rounded-md bg-white/10 px-3 py-2.5 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Users aria-hidden="true" className="h-4 w-4" />
              Employees
            </a>
          </li>
        </ul>
      </nav>

      <p className="border-t border-sidebar-line px-5 py-4 text-xs leading-relaxed text-white/70">
        Demo data is saved in this browser only.
      </p>
    </div>
  );
}
