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

// Deterministically scatter paws across the full page height (SSR-safe — no randomness).
const COUNT = 40;
const SCATTER = Array.from({ length: COUNT }, (_, i) => ({
  top: ((i * 61) % 95) + 2.5,
  left: ((i * 43 + (i % 5) * 9) % 90) + 3,
  size: 30 + ((i * 17) % 74),
  rot: (i * 53) % 360,
  flip: i % 2 === 0,
  o: 0.045 + ((i % 4) * 0.008),
}));

// An extra dense band across the very top so the hero never looks empty.
const TOP_BAND = Array.from({ length: 10 }, (_, i) => ({
  top: 2 + ((i * 3) % 15),
  left: ((i * 41 + (i % 3) * 13) % 92) + 3,
  size: 32 + ((i * 13) % 58),
  rot: (i * 67) % 360,
  flip: i % 2 === 1,
  o: 0.05 + ((i % 3) * 0.008),
}));

const PAWS = [...TOP_BAND, ...SCATTER];

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
