import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Target, Sliders, Bell, AlertTriangle, Pencil, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RetroAvatar } from '../components/RetroAvatar';
import { useSettings } from '../hooks/useSettings';
import { useEntries } from '../hooks/useEntries';
import { useBadgeUnlocks } from '../hooks/useBadgeUnlocks';
import { fromISO } from '../lib/dates';
import { LOCALSTORAGE_KEY } from '../utils/constants';

const fmt = (n: number) => n.toLocaleString();

const APP_VERSION = 'Stride v0.1.0 (Build 1)';

export default function Settings() {
  const { settings, update } = useSettings();
  const { entries, clearAll } = useEntries();
  const { unlockedCount } = useBadgeUnlocks();
  const [confirmReset, setConfirmReset] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(settings.name);

  const totalSteps = useMemo(
    () => Object.values(entries).reduce((a, b) => a + b, 0),
    [entries],
  );
  const memberSinceYear = fromISO(settings.startDate).getFullYear();

  const saveName = () => {
    const v = draftName.trim();
    update({ name: v || 'Friend' });
    setEditingName(false);
  };

  return (
    <div className="pb-6">
      <Header />

      <div className="px-5 pt-5 space-y-6">
        {/* Profile */}
        <Section icon={User} title="Profile">
          <div className="rounded-2xl bg-ink-800/70 border border-ink-700/60 p-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <RetroAvatar size={68} />
              <button
                onClick={() => { setDraftName(settings.name); setEditingName(true); }}
                aria-label="Edit profile"
                className="absolute -bottom-1 -right-1 size-6 rounded-full bg-lime-400 grid place-items-center text-ink-900 shadow-glow-lime-soft"
              >
                <Pencil className="size-3" strokeWidth={3} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    maxLength={30}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    className="flex-1 min-w-0 rounded-md bg-ink-900 border border-ink-700/60 px-3 py-1.5 text-base font-bold text-ice-100 outline-none focus:border-lime-400/60"
                  />
                  <button
                    onClick={saveName}
                    aria-label="Save name"
                    className="size-8 rounded-md bg-lime-400 text-ink-900 grid place-items-center"
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <div className="text-lg font-extrabold text-ice-100 truncate">{settings.name}</div>
              )}
              <div className="text-[10px] font-bold tracking-[0.15em] text-ink-300 mt-0.5">
                MEMBER · SINCE {memberSinceYear}
              </div>
              <div className="mt-3 flex items-stretch gap-4">
                <div>
                  <div className="text-lg font-extrabold tabular-nums text-lime-400 leading-none">
                    {fmt(totalSteps)}
                  </div>
                  <div className="text-[10px] font-bold tracking-widest text-ink-300 mt-1">
                    TOTAL STEPS
                  </div>
                </div>
                <div className="w-px bg-ink-700/60" />
                <div>
                  <div className="text-lg font-extrabold tabular-nums text-ice-100 leading-none">
                    {unlockedCount}
                  </div>
                  <div className="text-[10px] font-bold tracking-widest text-ink-300 mt-1">
                    BADGES
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Goal Settings */}
        <Section icon={Target} title="Goal Settings">
          <div className="rounded-2xl bg-ink-800/70 border border-ink-700/60 p-4">
            <div className="text-[10px] font-bold tracking-[0.2em] text-ink-300">DAILY STEP GOAL</div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-4xl font-extrabold tabular-nums text-ice-100">
                {fmt(settings.goal)}
              </span>
              <span className="text-sm font-bold tracking-widest text-ice-200">STEPS</span>
            </div>

            <div className="mt-4">
              <input
                type="range"
                min={1000}
                max={25000}
                step={500}
                value={settings.goal}
                onChange={(e) => update({ goal: parseInt(e.target.value, 10) })}
                className="goal-range w-full"
                aria-label="Daily step goal"
              />
              <div className="flex justify-between text-[11px] tabular-nums text-ink-300 mt-1">
                <span>1,000</span>
                <span>12,500</span>
                <span>25,000</span>
              </div>
            </div>

            <p className="text-xs text-ink-300 mt-4 italic leading-snug">
              Stride recommends at least 8,000 steps for active recovery.
            </p>
          </div>
        </Section>

        {/* Preferences */}
        <Section icon={Sliders} title="Preferences">
          <div className="rounded-2xl bg-ink-800/70 border border-ink-700/60 px-4">
            <ToggleRow
              icon={Bell}
              title="Smart Notifications"
              subtitle="Daily progress & goal nudges"
              value={settings.notifications}
              onChange={(v) => update({ notifications: v })}
            />
          </div>
        </Section>

        {/* Danger Zone */}
        <Section icon={AlertTriangle} title="Danger Zone" titleColor="text-red-400">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.04] p-4">
            <p className="text-sm text-red-300/90">This action cannot be undone.</p>
            <button
              onClick={() => setConfirmReset(true)}
              className="mt-3 w-full rounded-md border border-red-500/50 text-red-400 py-3 text-sm font-bold tracking-wider hover:bg-red-500/10 transition-colors"
            >
              RESET ALL ACTIVITY DATA
            </button>
          </div>
        </Section>

        <div className="text-center text-[11px] text-ink-500 tabular-nums">{APP_VERSION}</div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all data?"
        body="This will delete all logged steps and unlocked badges. This cannot be undone."
        confirmLabel="Yes, reset"
        onConfirm={() => {
          clearAll();
          localStorage.removeItem(LOCALSTORAGE_KEY);
          localStorage.removeItem('dailysteps:badges');
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}

type SectionProps = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  titleColor?: string;
  children: React.ReactNode;
};
function Section({ icon: Icon, title, titleColor = 'text-ice-100', children }: SectionProps) {
  const isDanger = titleColor === 'text-red-400';
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`size-5 ${isDanger ? 'text-red-400' : 'text-lime-400'}`} strokeWidth={2.5} />
        <h2 className={`text-2xl font-extrabold ${titleColor}`}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

type ToggleRowProps = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
};
function ToggleRow({ icon: Icon, title, subtitle, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <Icon className="size-5 text-ink-300 shrink-0" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <div className="text-base font-bold text-ice-100">{title}</div>
        <div className="text-xs text-ink-300 mt-0.5">{subtitle}</div>
      </div>
      <ToggleSwitch value={value} onChange={onChange} ariaLabel={title} />
    </div>
  );
}

function ToggleSwitch({ value, onChange, ariaLabel }: { value: boolean; onChange: (v: boolean) => void; ariaLabel: string }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      onClick={() => onChange(!value)}
      className={`relative h-7 w-12 rounded-full transition-colors ${
        value ? 'bg-ice-300' : 'bg-ink-700'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`absolute top-0.5 size-6 rounded-full bg-white shadow ${
          value ? 'right-0.5' : 'left-0.5'
        }`}
      />
    </button>
  );
}
