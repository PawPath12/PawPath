"use client";

import { useState, useTransition } from "react";
import { setAppointmentStatus } from "@/lib/actions/booking";

export function BookingControls({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function act(next: "CONFIRMED" | "COMPLETED" | "CANCELLED") {
    setErr(null);
    start(async () => {
      const res = await setAppointmentStatus(id, next);
      if (res?.error) setErr(res.error);
    });
  }

  const btn = "rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "PENDING" && (
        <>
          <button onClick={() => act("CONFIRMED")} disabled={pending} className={`${btn} bg-brand-600 text-white hover:bg-brand-700`}>
            Confirm
          </button>
          <button onClick={() => act("CANCELLED")} disabled={pending} className={`${btn} text-rose-600 hover:bg-rose-50`}>
            Decline
          </button>
        </>
      )}
      {status === "CONFIRMED" && (
        <>
          <button onClick={() => act("COMPLETED")} disabled={pending} className={`${btn} bg-sky-600 text-white hover:bg-sky-700`}>
            Mark completed
          </button>
          <button onClick={() => act("CANCELLED")} disabled={pending} className={`${btn} text-rose-600 hover:bg-rose-50`}>
            Cancel
          </button>
        </>
      )}
      {err && <span className="text-xs text-rose-600">{err}</span>}
    </div>
  );
}
