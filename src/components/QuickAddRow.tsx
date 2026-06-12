import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Check, X } from 'lucide-react';

type Props = { onAdd: (n: number) => void; onSetSteps: (n: number) => void };

const fmt = (n: number) => n.toLocaleString();

export function QuickAddRow({ onAdd, onSetSteps }: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const [value, setValue] = useState('');

  const submitCustom = () => {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || n === 0) return;
    onSetSteps(n);
    setValue('');
    setCustomOpen(false);
  };

  return (
    <div>
      <div className="text-xs font-bold tracking-[0.2em] text-ink-300 mb-3">
        QUICK LOG
      </div>
      <div className="grid grid-cols-3 gap-3">
        <PresetTile amount={500} onClick={() => onAdd(500)} />
        <PresetTile amount={1000} onClick={() => onAdd(1000)} />
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setCustomOpen((o) => !o)}
          aria-label="Custom amount"
          className={`relative h-16 rounded-md flex flex-col items-center justify-center gap-1 transition-colors ${
            customOpen
              ? 'bg-lime-400 text-ink-900'
              : 'bg-ice-100 text-ink-900 shadow-glow-lime-soft'
          }`}
        >
          <Pencil className="size-4" strokeWidth={2.5} />
          <span className="text-[10px] font-bold tracking-wider">CUSTOM</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {customOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                autoFocus
                type="number"
                inputMode="numeric"
                placeholder="Enter steps"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitCustom()}
                className="flex-1 rounded-md bg-ink-800 border border-ink-700/60 px-4 py-3 text-ice-100 placeholder:text-ink-500 outline-none focus:border-lime-400/60"
              />
              <button
                onClick={submitCustom}
                className="rounded-md bg-lime-400 text-ink-900 px-4 grid place-items-center"
                aria-label="Add custom"
              >
                <Check className="size-5" strokeWidth={3} />
              </button>
              <button
                onClick={() => {
                  setCustomOpen(false);
                  setValue('');
                }}
                className="rounded-2xl bg-ink-800 border border-ink-700/60 px-3 grid place-items-center text-ink-300"
                aria-label="Cancel"
              >
                <X className="size-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PresetTile({
  amount,
  onClick,
}: {
  amount: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-label={`Add ${amount} steps`}
      className="h-16 rounded-sm bg-ink-800/70 border border-ink-700/60 flex flex-col items-center justify-center gap-0.5 text-ice-100 hover:border-lime-400/40 transition-colors bg-[#0B1122]"
    >
      <Plus className="size-4" strokeWidth={2} />
      <span className="text-sm font-bold tabular-nums">{fmt(amount)}</span>
    </motion.button>
  );
}
