// Read-only star rating display (server-safe).
export function Stars({
  value,
  size = "sm",
  showValue = false,
  count,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
}) {
  const sizes = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`${sizes[size]} leading-none tracking-tight`} aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= full ? "text-amber-400" : "text-slate-300"}>
            ★
          </span>
        ))}
      </span>
      {showValue && (
        <span className="text-sm font-medium text-slate-600">
          {value > 0 ? value.toFixed(1) : "New"}
          {typeof count === "number" && count > 0 && (
            <span className="font-normal text-slate-400"> ({count})</span>
          )}
        </span>
      )}
    </span>
  );
}
