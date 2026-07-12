// PawPath logo mark — thin line-art paw print with a dog's side profile forming
// the pad. Uses currentColor so it inherits the surrounding text color (brand navy).
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      role="img"
      aria-label="PawPath"
    >
      <g
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Toe beans */}
        <ellipse cx="30" cy="42" rx="6" ry="8.5" transform="rotate(-30 30 42)" />
        <ellipse cx="47" cy="30" rx="6.5" ry="9" transform="rotate(-12 47 30)" />
        <ellipse cx="66" cy="29" rx="6.5" ry="9" transform="rotate(9 66 29)" />
        <ellipse cx="84" cy="40" rx="6" ry="8.5" transform="rotate(28 84 40)" />
        {/* Pad drawn as a dog's head in profile, facing right */}
        <path d="M41 89 C32 79, 33 62, 43 57 C41 50, 46 45, 52 49 C56 51, 60 51, 63 53 C73 53, 86 59, 91 69 C93 74, 89 77, 84 75 C83 81, 75 83, 69 80 C62 87, 50 93, 41 89 Z" />
        {/* Ear + mouth */}
        <path d="M54 50 C55 41, 62 39, 66 46" />
        <path d="M84 74 C87 74, 89 73, 90 72" />
      </g>
      {/* Eye + nose */}
      <circle cx="60" cy="62" r="1.9" fill="currentColor" />
      <circle cx="88" cy="68" r="2" fill="currentColor" />
    </svg>
  );
}
