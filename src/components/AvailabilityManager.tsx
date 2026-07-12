"use client";

import { useActionState, useTransition, useState } from "react";
import { addAvailability, deleteAvailability, type ActionState } from "@/lib/actions/clinic";
import { DAYS } from "@/lib/constants";

export type SlotDTO = {
  id: string;
  vetId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};
type VetOpt = { id: string; name: string };

const input =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function DeleteSlot({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => deleteAvailability(id).then(() => {}))}
      disabled={pending}
      className="text-slate-400 transition hover:text-rose-600 disabled:opacity-50"
      aria-label="Remove"
      title="Remove"
    >
      ✕
    </button>
  );
}

export function AvailabilityManager({ vets, slots }: { vets: VetOpt[]; slots: SlotDTO[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addAvailability, {});

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form action={action} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-5">
        <select name="vetId" className={input} defaultValue={vets[0]?.id}>
          {vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <select name="dayOfWeek" className={input} defaultValue="1">
          {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>
        <input name="startTime" type="time" defaultValue="09:00" className={input} required />
        <input name="endTime" type="time" defaultValue="17:00" className={input} required />
        <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending ? "Adding…" : "Add hours"}
        </button>
        {state.error && <p className="text-sm text-rose-600 sm:col-span-5">{state.error}</p>}
      </form>

      {/* Per-vet schedule */}
      <div className="space-y-4">
        {vets.map((v) => {
          const vetSlots = slots
            .filter((s) => s.vetId === v.id)
            .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));
          return (
            <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">🩺 {v.name}</h3>
              {vetSlots.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">No hours set — add some above.</p>
              ) : (
                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {vetSlots.map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm">
                      <span className="text-slate-700">
                        <span className="font-medium">{DAYS[s.dayOfWeek]}</span>{" "}
                        <span className="tabular-nums text-slate-500">{s.startTime}–{s.endTime}</span>
                      </span>
                      <DeleteSlot id={s.id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
