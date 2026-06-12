type Props = {
  activeMinutes: number;
  weekSteps: number;
  weekGoal: number;
};

const fmt = (n: number) => n.toLocaleString();

export function StatTiles({ activeMinutes, weekSteps, weekGoal }: Props) {
  const weekPct = Math.min(1, weekGoal === 0 ? 0 : weekSteps / weekGoal);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-ink-800/70 border border-ink-700/60 p-4 bg-[#0B1122]">
        <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
          ACTIVE TIME
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tabular-nums text-ice-100">
            {activeMinutes}
          </span>
          <span className="text-xs font-semibold text-ink-300">MINS</span>
        </div>
      </div>

      <div className="rounded-2xl bg-ink-800/70 border border-ink-700/60 p-4 flex flex-col bg-[#0B1122]">
        <div className="h-1.5 w-full rounded-full bg-ink-700/70 overflow-hidden">
          <div
            className="h-full bg-lime-400 rounded-full transition-all duration-700"
            style={{
              width: `${weekPct * 100}%`,
              boxShadow: '0 0 8px rgba(212, 255, 58, 0.6)',
            }}
          />
        </div>
        <div className="mt-auto pt-2 text-[10px] font-bold tracking-[0.2em] text-ink-300">
          WEEKLY GOAL
        </div>
        <div className="text-xs text-ink-300 tabular-nums mt-0.5">
          {fmt(weekSteps)} / {fmt(weekGoal)}
        </div>
      </div>
    </div>
  );
}
