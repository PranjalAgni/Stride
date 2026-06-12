import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

type Props = {
  iso: string | null;
  steps: number;
  goal: number;
  onSave: (iso: string, n: number) => void;
  onClear: (iso: string) => void;
  onClose: () => void;
};

export function DayDetailSheet({ iso, steps, goal, onSave, onClear, onClose }: Props) {
  const [value, setValue] = useState(String(steps));
  useEffect(() => setValue(String(steps)), [steps, iso]);

  return (
    <AnimatePresence>
      {iso && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md p-5 rounded-t-4xl bg-ink-800 border-t border-ink-700/60 shadow-2xl"
          >
            <div className="mx-auto w-12 h-1.5 rounded-full bg-ink-700 mb-4" />
            <div className="text-lg font-bold text-ice-100">{iso}</div>
            <div className="text-xs text-ink-300 mt-0.5 mb-4">Goal: {goal.toLocaleString()}</div>
            <input
              type="number"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-2xl bg-ink-900 border border-ink-700/60 px-4 py-3 text-ice-100 placeholder:text-ink-500 outline-none focus:border-lime-400/60"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { onSave(iso, parseInt(value, 10) || 0); onClose(); }}
                className="flex-1 rounded-2xl bg-lime-400 text-ink-900 py-3 font-bold"
              >Save</button>
              <button
                onClick={() => { onClear(iso); onClose(); }}
                className="rounded-2xl bg-ink-900 border border-ink-700/60 px-5 py-3 text-ink-300"
              >Clear</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
