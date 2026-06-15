import { motion } from 'framer-motion';
import { BadgeCheck, Lock, Award, Star, Trophy, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { useBadgeUnlocks } from '../hooks/useBadgeUnlocks';
import { progressLabel } from '../lib/badges';
import type { BadgeDef, BadgeStatus, BadgeTier } from '../lib/badges';
import { fromISO } from '../lib/dates';

const MONTHS_SHORT = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

function formatEarned(iso: string): string {
  const d = fromISO(iso);
  return `EARNED ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** For now lets keep everything lime
const TIER_COLOR: Record<BadgeTier, string> = {
  bronze: 'text-amber-400',
  silver: 'text-ink-100',
  gold: 'text-lime-400',
  platinum: 'text-ice-200',
};

const TIER_BORDER: Record<BadgeTier, string> = {
  bronze: 'border-amber-400/40',
  silver: 'border-ink-100/30',
  gold: 'border-lime-400/40',
  platinum: 'border-ice-200/40',
};
 */

const TIER_COLOR: Record<BadgeTier, string> = {
  bronze: 'text-lime-400',
  silver: 'text-lime-400',
  gold: 'text-lime-400',
  platinum: 'text-lime-400',
};

const TIER_BORDER: Record<BadgeTier, string> = {
  bronze: 'border-lime-400/40',
  silver: 'border-lime-400/40',
  gold: 'border-lime-400/40',
  platinum: 'border-lime-400/40',
};

const TIER_NAME: Record<BadgeTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

function iconFor(def: BadgeDef): LucideIcon {
  if (def.kind === 'best-day') return Star;
  if (def.kind === 'lifetime') return Target;
  if (def.tier === 'platinum') return Trophy;
  return Award;
}

export default function Badges() {
  const { statuses, earned, unlockedCount, totalCount } = useBadgeUnlocks();
  const pct =
    totalCount === 0 ? 0 : Math.round((unlockedCount / totalCount) * 100);
  const unlocked = statuses.filter((s) => s.unlocked);
  const locked = statuses.filter((s) => !s.unlocked);

  return (
    <div className="pb-6">
      <Header />

      <div className="px-5 pt-5 space-y-6">
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-lime-400 mb-1">
            PERFORMANCE REWARDS
          </div>
          <h1 className="text-3xl font-extrabold text-ice-100">Your Badges</h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-ice-200" />
        </div>

        {/* Total unlocked summary */}
        <div className="rounded-2xl bg-[#0B1122] border border-ink-700/60 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">
              TOTAL UNLOCKED
            </div>
            <div className="text-4xl font-extrabold tabular-nums text-ice-100 mt-1">
              {unlockedCount}
            </div>
          </div>
          <RingPct pct={pct} />
        </div>

        {/* Unlocked */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck className="size-5 text-lime-400" strokeWidth={2.5} />
            <h2 className="text-xl font-extrabold text-ice-100">Unlocked</h2>
          </div>
          {unlocked.length === 0 ? (
            <EmptyHint label="No badges yet — start logging steps to earn your first." />
          ) : (
            <div className="space-y-3">
              {unlocked.map((s) => (
                <UnlockedCard
                  key={s.def.id}
                  status={s}
                  earnedISO={earned[s.def.id]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Locked */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="size-5 text-ink-300" strokeWidth={2.5} />
            <h2 className="text-xl font-extrabold text-ink-300">Locked</h2>
          </div>
          {locked.length === 0 ? (
            <EmptyHint label="Every badge is unlocked. Absolute legend." />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {locked.map((s) => (
                <LockedCard key={s.def.id} status={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RingPct({ pct }: { pct: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#1a1d24"
          fill="none"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#d4ff3a"
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 90, damping: 15 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-extrabold text-ice-100">
        {pct}%
      </div>
    </div>
  );
}

function UnlockedCard({
  status,
  earnedISO,
}: {
  status: BadgeStatus;
  earnedISO?: string;
}) {
  const { def } = status;
  const Icon = iconFor(def);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl bg-[#0B1122] border p-4 flex items-start gap-3 ${TIER_BORDER[def.tier]}`}
    >
      <div
        className={`size-12 rounded-xl border ${TIER_BORDER[def.tier]} bg-ink-900/60 grid place-items-center shrink-0 ${TIER_COLOR[def.tier]}`}
      >
        <Icon className="size-6" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-base font-extrabold ${TIER_COLOR[def.tier]}`}>
          {def.label}
        </div>
        <div className="text-sm text-ink-300 mt-0.5 leading-snug">
          {TIER_NAME[def.tier]} Achievement: {def.description}
        </div>
        {earnedISO && (
          <span className="inline-block mt-2 px-2 py-1 rounded-full bg-ink-900/80 border border-ink-700/60 text-[10px] font-bold tracking-wider text-ink-300">
            {formatEarned(earnedISO)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function LockedCard({ status }: { status: BadgeStatus }) {
  const { def, current } = status;
  const Icon = iconFor(def);
  const pct = Math.min(1, def.threshold === 0 ? 0 : current / def.threshold);
  return (
    <div className="rounded-2xl bg-[#0B1122] border border-ink-700/40 p-4 flex flex-col items-center text-center">
      <div className="size-12 rounded-full bg-ink-900/60 grid place-items-center text-ink-500 mb-3">
        <Icon className="size-6" strokeWidth={2} />
      </div>
      <div className="text-sm font-extrabold text-ink-300">{def.label}</div>
      <div className="text-[11px] text-ink-500 mt-1 leading-snug">
        {def.description}
      </div>
      <div className="mt-3 w-full h-1 rounded-full bg-ink-700/60 overflow-hidden">
        <div
          className="h-full bg-ink-300/60 rounded-full"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="text-[10px] font-bold tracking-wider text-ink-500 mt-2 tabular-nums">
        {progressLabel(def, current)}
      </div>
    </div>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-[#0B1122] border border-dashed border-ink-700/60 p-4 text-sm text-ink-300 text-center">
      {label}
    </div>
  );
}
