import { Lock } from 'lucide-react';
import { Header } from '../components/Header';
import { BADGE_DEFS } from '../lib/badges';
import { computeUnlocks } from '../lib/badges';
import { useStreak } from '../hooks/useStreak';

export default function Badges() {
  const streak = useStreak();
  const unlocked = new Set(computeUnlocks(streak.longest));
  const unlockedCount = unlocked.size;

  return (
    <div className="pb-6">
      <Header />
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold text-ice-100">Badges</h1>
        <p className="text-sm text-ink-300 mt-1">
          {unlockedCount} of {BADGE_DEFS.length} unlocked · longest streak {streak.longest} days
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {BADGE_DEFS.map(b => {
            const isUnlocked = unlocked.has(b.id);
            return (
              <div
                key={b.id}
                className={`relative rounded-3xl p-5 flex flex-col items-center gap-2 text-center border ${
                  isUnlocked
                    ? 'bg-lime-400/5 border-lime-400/30 shadow-glow-lime-soft'
                    : 'bg-ink-800/60 border-ink-700/50'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="size-3.5 text-ink-500" />
                  </div>
                )}
                <div className={`text-5xl ${isUnlocked ? '' : 'grayscale opacity-40'}`}>
                  {b.emoji}
                </div>
                <div className={`text-sm font-bold ${isUnlocked ? 'text-ice-100' : 'text-ink-300'}`}>
                  {b.label}
                </div>
                <div className="text-[10px] font-bold tracking-widest text-ink-300">
                  {b.streakDays} DAYS
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
