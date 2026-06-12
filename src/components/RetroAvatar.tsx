type Props = { size?: number };

// 8-bit walking-figure pixel sprite, lime-on-ink. Rendered as SVG so it scales crisply.
const SPRITE: number[][] = [
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,0],
  [0,1,1,0,0,1,1,0],
  [0,1,1,1,1,1,1,0],
  [0,0,0,1,1,0,0,0],
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,0],
  [0,1,0,1,1,0,1,0],
  [0,1,0,0,0,0,1,0],
  [1,1,0,0,0,0,1,1],
];

export function RetroAvatar({ size = 64 }: Props) {
  return (
    <div
      className="rounded-full bg-ink-900 border-2 border-lime-400 grid place-items-center shadow-glow-lime-soft overflow-hidden"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox={`0 0 ${SPRITE[0].length} ${SPRITE.length}`}
        shapeRendering="crispEdges"
      >
        {SPRITE.map((row, y) =>
          row.map((px, x) =>
            px ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#d4ff3a" /> : null
          )
        )}
      </svg>
    </div>
  );
}
