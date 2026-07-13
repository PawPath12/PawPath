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

// Scattered positions for the faint decorative paws.
const PAWS: { top: string; left: string; size: number; rot: number; o: number }[] = [
  { top: "10%", left: "5%", size: 70, rot: -18, o: 0.06 },
  { top: "18%", left: "84%", size: 96, rot: 20, o: 0.06 },
  { top: "58%", left: "10%", size: 84, rot: 28, o: 0.05 },
  { top: "66%", left: "80%", size: 64, rot: -12, o: 0.06 },
  { top: "40%", left: "90%", size: 52, rot: 8, o: 0.05 },
  { top: "78%", left: "44%", size: 60, rot: -24, o: 0.045 },
  { top: "6%", left: "52%", size: 46, rot: 14, o: 0.05 },
];

/** Faint paw prints scattered behind hero content. Purely decorative. */
export function PawsBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PAWS.map((p, i) => (
        <PawPrint
          key={i}
          className="absolute text-ink"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.o,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
