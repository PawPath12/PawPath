import type { CSSProperties } from "react";

function PawPrint({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden className={className} style={style}>
      <ellipse cx="176" cy="150" rx="54" ry="72" />
      <ellipse cx="336" cy="150" rx="54" ry="72" />
      <ellipse cx="84" cy="288" rx="48" ry="62" />
      <ellipse cx="428" cy="288" rx="48" ry="62" />
      <path d="M256 262c-74 0-138 58-138 128 0 47 42 74 84 74 27 0 37-13 54-13s27 13 54 13c42 0 84-27 84-74 0-70-64-128-138-128z" />
    </svg>
  );
}

// A jittered grid of paws covering the whole page — dense and evenly spread
// in every direction (SSR-safe — deterministic, no randomness).
const COLS = 6;
const ROWS = 14;
const colStep = 100 / COLS;
const rowStep = 100 / ROWS;
const PAWS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  const jx = (((i * 37) % 100) / 100 - 0.5) * colStep * 0.95;
  const jy = (((i * 53) % 100) / 100 - 0.5) * rowStep * 0.95;
  return {
    top: Math.min(98, Math.max(1, rowStep * (r + 0.5) + jy)),
    left: Math.min(93, Math.max(2, colStep * (c + 0.5) + jx)),
    size: 30 + ((i * 17) % 66),
    rot: (i * 47) % 360,
    flip: i % 2 === 0,
    o: 0.15 + ((i % 4) * 0.022),
  };
});

/** Faint paw prints bouncing across the whole page behind content. Decorative. */
export function PawsBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PAWS.map((p, i) => (
        <span
          key={i}
          className="animate-paw-float absolute text-ink"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.o,
            animationDuration: `${6 + (i % 7)}s`,
            animationDelay: `${(i % 9) * 0.5}s`,
          }}
        >
          <PawPrint
            className="h-full w-full"
            style={{ transform: `rotate(${p.rot}deg)${p.flip ? " scaleX(-1)" : ""}` }}
          />
        </span>
      ))}
    </div>
  );
}
