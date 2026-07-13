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

// Scattered positions for the faint decorative paws, facing many directions.
const PAWS: { top: string; left: string; size: number; rot: number; o: number; flip?: boolean }[] = [
  { top: "8%", left: "4%", size: 66, rot: -18, o: 0.06 },
  { top: "6%", left: "30%", size: 44, rot: 150, o: 0.05 },
  { top: "5%", left: "58%", size: 50, rot: 24, o: 0.05, flip: true },
  { top: "14%", left: "84%", size: 92, rot: 205, o: 0.06 },
  { top: "30%", left: "16%", size: 56, rot: 96, o: 0.05, flip: true },
  { top: "34%", left: "48%", size: 40, rot: -60, o: 0.045 },
  { top: "40%", left: "90%", size: 54, rot: 300, o: 0.05 },
  { top: "52%", left: "6%", size: 82, rot: 34, o: 0.055 },
  { top: "56%", left: "36%", size: 46, rot: 190, o: 0.045, flip: true },
  { top: "60%", left: "68%", size: 60, rot: -130, o: 0.05 },
  { top: "68%", left: "88%", size: 70, rot: 120, o: 0.055, flip: true },
  { top: "78%", left: "22%", size: 58, rot: -28, o: 0.05 },
  { top: "82%", left: "52%", size: 48, rot: 245, o: 0.045 },
  { top: "74%", left: "74%", size: 42, rot: 70, o: 0.05, flip: true },
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
            transform: `rotate(${p.rot}deg)${p.flip ? " scaleX(-1)" : ""}`,
          }}
        />
      ))}
    </div>
  );
}
