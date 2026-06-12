import { useEffect } from 'react';
import confetti from 'canvas-confetti';

type Props = { fire: boolean };

export function CelebrationBurst({ fire }: Props) {
  useEffect(() => {
    if (!fire) return;
    const end = Date.now() + 800;
    const colors = ['#34d399', '#a78bfa', '#fb923c', '#38bdf8'];
    (function frame() {
      confetti({ particleCount: 4, angle: 60,  spread: 55, origin: { x: 0 },   colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 },   colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [fire]);
  return null;
}
