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

// Scattered decorative paws — many directions and a wide range of sizes.
const PAWS: { top: string; left: string; size: number; rot: number; o: number; flip?: boolean }[] = [
  { top: "7%", left: "3%", size: 72, rot: -18, o: 0.06 },
  { top: "4%", left: "20%", size: 30, rot: 150, o: 0.05 },
  { top: "9%", left: "38%", size: 52, rot: 24, o: 0.05, flip: true },
  { top: "3%", left: "60%", size: 38, rot: -40, o: 0.045 },
  { top: "11%", left: "72%", size: 64, rot: 118, o: 0.05 },
  { top: "13%", left: "90%", size: 100, rot: 205, o: 0.06 },
  { top: "24%", left: "10%", size: 44, rot: 96, o: 0.05, flip: true },
  { top: "22%", left: "30%", size: 28, rot: -70, o: 0.045 },
  { top: "30%", left: "50%", size: 34, rot: 260, o: 0.04 },
  { top: "26%", left: "80%", size: 56, rot: 300, o: 0.05, flip: true },
  { top: "38%", left: "4%", size: 90, rot: 34, o: 0.055 },
  { top: "42%", left: "24%", size: 32, rot: 190, o: 0.045, flip: true },
  { top: "40%", left: "64%", size: 48, rot: -110, o: 0.05 },
  { top: "44%", left: "92%", size: 68, rot: 20, o: 0.05 },
  { top: "56%", left: "14%", size: 54, rot: -30, o: 0.05, flip: true },
  { top: "58%", left: "42%", size: 38, rot: 210, o: 0.045 },
  { top: "54%", left: "72%", size: 30, rot: 90, o: 0.045 },
  { top: "62%", left: "88%", size: 82, rot: 130, o: 0.055, flip: true },
  { top: "72%", left: "6%", size: 60, rot: 55, o: 0.05 },
  { top: "76%", left: "28%", size: 44, rot: -22, o: 0.05, flip: true },
  { top: "80%", left: "50%", size: 34, rot: 245, o: 0.045 },
  { top: "70%", left: "62%", size: 26, rot: 15, o: 0.04 },
  { top: "78%", left: "80%", size: 72, rot: 108, o: 0.055, flip: true },
  { top: "88%", left: "16%", size: 40, rot: 165, o: 0.045 },
  { top: "86%", left: "68%", size: 50, rot: -75, o: 0.05 },
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
