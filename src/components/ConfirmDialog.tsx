import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, body, confirmLabel = 'Confirm', onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-ink-900 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-1">{title}</h2>
              <p className="text-sm opacity-70 mb-5">{body}</p>
              <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 rounded-2xl bg-ink-50 dark:bg-ink-950 py-3">Cancel</button>
                <button onClick={onConfirm} className="flex-1 rounded-2xl bg-peach-400 text-white py-3 font-semibold">
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
