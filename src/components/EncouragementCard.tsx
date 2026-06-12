import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = { steps: number; goal: number; headline: string };

const fmt = (n: number) => n.toLocaleString();

export function EncouragementCard({ steps, goal, headline }: Props) {
  const remaining = Math.max(0, goal - steps);
  const hit = remaining === 0;
  const body = hit
    ? "Goal smashed. Anything more is bonus territory."
    : `Only ${fmt(remaining)} more to go! You're crushing it today.`;

  return (
    <motion.div
      layout
      className="relative rounded-3xl bg-ink-800/70 border border-ink-700/60 p-4 pl-5 overflow-hidden"
    >
      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-lime-400 shadow-glow-lime-soft" />
      <div className="flex gap-3 items-start">
        <div className="size-10 rounded-full bg-lime-400/10 border border-lime-400/30 grid place-items-center shrink-0">
          <Zap className="size-5 text-lime-400" strokeWidth={2.5} fill="currentColor" />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold text-ice-100">{headline}</div>
          <div className="text-sm text-ink-300 mt-0.5 leading-snug">{body}</div>
        </div>
      </div>
    </motion.div>
  );
}
