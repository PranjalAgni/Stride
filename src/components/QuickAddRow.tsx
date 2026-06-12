import { motion } from 'framer-motion';

const PRESETS = [100, 500, 1000, 2000] as const;

type Props = { onAdd: (n: number) => void };

const fmt = (n: number) => n.toLocaleString();

export function QuickAddRow({ onAdd }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {PRESETS.map(n => (
        <motion.button
          key={n}
          whileTap={{ scale: 0.94 }}
          onClick={() => onAdd(n)}
          className="rounded-2xl bg-white/70 dark:bg-ink-900/60 backdrop-blur py-3 font-semibold shadow-sm hover:shadow active:shadow-inner"
        >
          +{fmt(n)}
        </motion.button>
      ))}
    </div>
  );
}
