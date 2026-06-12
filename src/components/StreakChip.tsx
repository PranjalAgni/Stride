import { motion } from 'framer-motion';

type Props = { dayOfChallenge: number; streak: number };

export function StreakChip({ dayOfChallenge, streak }: Props) {
  return (
    <motion.div
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-ink-900/60 backdrop-blur px-4 py-2 shadow-sm"
    >
      <span className="text-sm font-medium opacity-80">Day {dayOfChallenge}</span>
      <span className="opacity-40">·</span>
      <span className="text-sm font-semibold">🔥 {streak} day streak</span>
    </motion.div>
  );
}
