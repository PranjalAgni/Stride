import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, BarChart3, Settings } from 'lucide-react';

const TABS = [
  { to: '/',         label: 'Today',    Icon: Home },
  { to: '/history',  label: 'History',  Icon: CalendarDays },
  { to: '/stats',    label: 'Stats',    Icon: BarChart3 },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export function BottomTabs() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="rounded-3xl bg-white/80 dark:bg-ink-900/70 backdrop-blur shadow-lg flex">
          {TABS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-mint-500' : 'opacity-60'
                }`
              }
            >
              <Icon className="size-5" aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
