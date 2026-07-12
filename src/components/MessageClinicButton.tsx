"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { messageClinic } from "@/lib/actions/messages";

export function MessageClinicButton({
  clinicId,
  canMessage,
}: {
  clinicId: string;
  canMessage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canMessage) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="rounded-lg bg-white px-5 py-2.5 text-center font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-50"
      >
        Log in to message
      </button>
    );
  }

  function send() {
    setError(null);
    startTransition(async () => {
      const res = await messageClinic(clinicId, body);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push("/account/messages");
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-white px-5 py-2.5 font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-50"
        >
          Message clinic
        </button>
      ) : (
        <div className="w-full sm:w-72">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Ask a question…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700">
              Cancel
            </button>
            <button
              onClick={send}
              disabled={pending}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
