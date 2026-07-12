"use client";

import { useState, useTransition } from "react";
import { cancelAppointment } from "@/lib/actions/booking";
import { submitReview } from "@/lib/actions/reviews";

export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <button
        onClick={() => {
          if (!confirm("Cancel this appointment?")) return;
          setErr(null);
          start(async () => {
            const res = await cancelAppointment(appointmentId);
            if (res?.error) setErr(res.error);
          });
        }}
        disabled={pending}
        className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-60"
      >
        {pending ? "Cancelling…" : "Cancel"}
      </button>
      {err && <p className="text-xs text-rose-600">{err}</p>}
    </div>
  );
}

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
      >
        ★ Leave a review
      </button>
    );
  }

  function submit() {
    setErr(null);
    const fd = new FormData();
    fd.set("appointmentId", appointmentId);
    fd.set("rating", String(rating));
    fd.set("comment", comment);
    start(async () => {
      const res = await submitReview(fd);
      if (res?.error) setErr(res.error);
      else setOpen(false);
    });
  }

  return (
    <div className="mt-2 w-full rounded-xl border border-amber-200 bg-amber-50/50 p-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
            className={`text-2xl leading-none ${i <= (hover || rating) ? "text-amber-400" : "text-slate-300"}`}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="How was your visit?"
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </div>
  );
}
