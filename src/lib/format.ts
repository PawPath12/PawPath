// Small presentation helpers shared across server and client components.

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(d: Date | string): string {
  return `${formatDate(d)} · ${formatTime(d)}`;
}

export function petAge(birthdate: Date | string | null): string | null {
  if (!birthdate) return null;
  const b = typeof birthdate === "string" ? new Date(birthdate) : birthdate;
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) years--;
  if (years < 1) {
    const months = Math.max(
      0,
      years * 12 + (now.getMonth() - b.getMonth()) + (now.getDate() < b.getDate() ? -1 : 0),
    );
    return `${months} mo`;
  }
  return `${years} yr`;
}
