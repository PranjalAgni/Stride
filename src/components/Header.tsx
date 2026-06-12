import { Flame, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-ink-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-md bg-lime-400/10 border border-lime-400/30 grid place-items-center">
          <Flame className="size-4 text-lime-400" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-extrabold text-ice-100 tracking-tight">Stride</span>
      </div>
      <button
        onClick={() => navigate('/settings')}
        aria-label="Settings"
        className="text-ink-300 hover:text-ice-100 transition-colors"
      >
        <UserCircle2 className="size-7" strokeWidth={1.5} />
      </button>
    </header>
  );
}
