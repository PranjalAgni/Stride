import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import shareBg from '../assets/share-bg.png';

const MONTHS = [
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

function formatShareDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

export type ShareSheetProps = {
  open: boolean;
  onClose: () => void;
  iso: string;
  steps: number;
  goal: number;
};

export function ShareSheet({
  open,
  onClose,
  iso,
  steps,
  goal,
}: ShareSheetProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const pct = Math.round((steps / goal) * 100);
  const goalSmashed = steps >= goal;
  const ringPct = Math.min(100, pct);
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = (ringPct / 100) * c;

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#0B1122',
      });
      const link = document.createElement('a');
      link.download = `stride-${iso}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export share card', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-[#0B1122] rounded-t-3xl px-5 pt-3 pb-6 max-h-[92vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-ink-700/80 mb-5" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-extrabold text-ice-100">
                Share Activity
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="size-9 rounded-full bg-ink-800 border border-ink-700/60 grid place-items-center text-ice-100 hover:bg-ink-700 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="rounded-3xl border border-ink-700/60 p-3 bg-black/40">
              <div
                ref={cardRef}
                className="relative rounded-2xl overflow-hidden aspect-[9/14] bg-cover bg-center"
                style={{ backgroundImage: `url(${shareBg})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/70" />

                <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 grid place-items-center shadow-glow-lime-soft">
                      <svg
                        viewBox="0 0 24 24"
                        className="size-5 text-ink-900"
                        fill="currentColor"
                      >
                        <path d="M12 2 4 14h6l-2 8 8-12h-6z" />
                      </svg>
                    </div>
                    <span className="font-black italic tracking-wide text-white text-lg">
                      STRIDE
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold tracking-widest text-white/85">
                      {formatShareDate(iso)}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                  <div className="text-white text-6xl font-black tabular-nums leading-none drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)]">
                    {fmt(steps)}
                  </div>
                  <div className="mt-2 text-white/95 font-bold text-base tracking-[0.35em]">
                    STEPS COMPLETED
                  </div>
                </div>

                <div className="absolute left-3 right-3 bottom-3">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 flex items-center gap-3">
                    <div className="relative size-12 shrink-0">
                      <svg viewBox="0 0 56 56" className="size-12 -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r={r}
                          fill="none"
                          stroke="rgba(255,255,255,0.18)"
                          strokeWidth="5"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r={r}
                          fill="none"
                          stroke="#d4ff3a"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${c}`}
                        />
                      </svg>
                      <div className="absolute inset-0 grid place-items-center">
                        {goalSmashed ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="size-5 text-lime-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-extrabold text-white">
                            {pct}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-extrabold text-base leading-tight">
                        {goalSmashed ? 'GOAL SMASHED!' : 'KEEP GOING'}
                      </div>
                      <div className="text-white/80 text-[11px] font-semibold tracking-wider mt-0.5">
                        {pct}% OF DAILY TARGET
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="mt-6 w-full rounded-2xl bg-ice-300 hover:bg-ice-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-ink-900 font-extrabold tracking-wider py-4 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(143,200,255,0.4)]"
            >
              <Download className="size-5" strokeWidth={2.5} />
              {downloading ? 'SAVING…' : 'SAVE TO CAMERA ROLL'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
