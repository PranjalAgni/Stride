import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Award, Settings } from 'lucide-react';

const TABS = [
  { to: '/',         label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/history',  label: 'History',   Icon: History },
  { to: '/badges',   label: 'Badges',    Icon: Award },
  { to: '/settings', label: 'Settings',  Icon: Settings },
];

export function BottomTabs() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="rounded-3xl bg-ink-800/90 border border-ink-700/60 backdrop-blur-md shadow-xl flex">
          {TABS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  isActive ? 'text-lime-400' : 'text-ink-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`size-9 grid place-items-center rounded-xl transition-all ${
                    isActive ? 'bg-lime-400/10' : ''
                  }`}>
                    <Icon className="size-5" strokeWidth={2.25} />
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider ${
                    isActive ? '' : 'opacity-70'
                  }`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
