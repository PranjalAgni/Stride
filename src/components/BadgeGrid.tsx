import { BADGE_DEFS } from '../lib/badges';

type Props = { unlockedIds: string[] };

export function BadgeGrid({ unlockedIds }: Props) {
  const set = new Set(unlockedIds);
  return (
    <div className="grid grid-cols-3 gap-3">
      {BADGE_DEFS.map(b => {
        const unlocked = set.has(b.id);
        return (
          <div
            key={b.id}
            className={`rounded-2xl p-3 flex flex-col items-center gap-1 text-center ${
              unlocked
                ? 'bg-white/80 dark:bg-ink-900/70 shadow'
                : 'bg-white/30 dark:bg-ink-900/30 opacity-60'
            }`}
          >
            <div className="text-3xl">{b.emoji}</div>
            <div className="text-xs font-medium">{b.label}</div>
            <div className="text-[10px] opacity-60">{b.streakDays}d</div>
          </div>
        );
      })}
    </div>
  );
}
