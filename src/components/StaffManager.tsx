"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createStaff,
  updateStaff,
  deleteStaff,
  type ActionState,
} from "@/lib/actions/clinic";

export type StaffDTO = {
  id: string;
  name: string;
  specialties: string;
  bio: string;
};

const input =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function Fields({ s }: { s?: StaffDTO }) {
  return (
    <div className="grid gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Name
        <input name="name" defaultValue={s?.name} required className={input} placeholder="Dr. Jane Doe" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Specialties
        <input name="specialties" defaultValue={s?.specialties} className={input} placeholder="Surgery, Dentistry" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Bio
        <textarea name="bio" defaultValue={s?.bio} rows={2} className={input} placeholder="A short introduction…" />
      </label>
    </div>
  );
}

function AddStaff() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(createStaff, {});
  if (state.ok && open) setOpen(false);

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-4 font-medium text-slate-500 transition hover:border-brand-400 hover:text-brand-700">
        + Add staff member
      </button>
    );

  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold text-slate-900">New staff member</h3>
      <Fields />
      <p className="mt-2 text-xs text-slate-400">New staff start with a Mon–Fri 9–5 schedule you can adjust under Availability.</p>
      {state.error && <p className="mt-2 text-sm text-rose-600">{state.error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
        <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending ? "Saving…" : "Add"}
        </button>
      </div>
    </form>
  );
}

function StaffRow({ s }: { s: StaffDTO }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(updateStaff.bind(null, s.id), {});
  const [deleting, startDelete] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  if (state.ok && editing) setEditing(false);

  if (editing)
    return (
      <form action={action} className="rounded-2xl border border-brand-200 bg-white p-5 shadow-sm">
        <Fields s={s} />
        {state.error && <p className="mt-2 text-sm text-rose-600">{state.error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    );

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">🩺</div>
        <div>
          <p className="font-medium text-slate-800">{s.name}</p>
          {s.specialties && <p className="text-xs text-slate-500">{s.specialties}</p>}
          {err && <p className="text-xs text-rose-600">{err}</p>}
        </div>
      </div>
      <div className="flex shrink-0 gap-3">
        <button onClick={() => setEditing(true)} className="text-sm font-medium text-brand-700 hover:underline">Edit</button>
        <button
          onClick={() => {
            if (!confirm(`Remove ${s.name}?`)) return;
            setErr(null);
            startDelete(async () => {
              const res = await deleteStaff(s.id);
              if (res?.error) setErr(res.error);
            });
          }}
          disabled={deleting}
          className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-60"
        >
          {deleting ? "…" : "Remove"}
        </button>
      </div>
    </div>
  );
}

export function StaffManager({ staff }: { staff: StaffDTO[] }) {
  return (
    <div className="space-y-3">
      {staff.map((s) => <StaffRow key={s.id} s={s} />)}
      <AddStaff />
    </div>
  );
}
