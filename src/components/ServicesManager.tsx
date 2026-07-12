"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createService,
  updateService,
  deleteService,
  type ActionState,
} from "@/lib/actions/clinic";

export type ServiceDTO = {
  id: string;
  name: string;
  description: string;
  price: string; // dollars
  durationMin: number;
};

const input =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function Fields({ svc }: { svc?: ServiceDTO }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 sm:col-span-2">
        Name
        <input name="name" defaultValue={svc?.name} required className={input} placeholder="Wellness Exam" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Price (USD)
        <input name="price" type="number" step="0.01" min="0" defaultValue={svc?.price} required className={input} placeholder="65" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Duration (min)
        <input name="durationMin" type="number" min="10" max="480" step="5" defaultValue={svc?.durationMin ?? 30} required className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 sm:col-span-2">
        Description
        <input name="description" defaultValue={svc?.description} className={input} placeholder="What's included…" />
      </label>
    </div>
  );
}

function AddService() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(createService, {});
  if (state.ok && open) setOpen(false);

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-4 font-medium text-slate-500 transition hover:border-brand-400 hover:text-brand-700">
        + Add service
      </button>
    );

  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold text-slate-900">New service</h3>
      <Fields />
      {state.error && <p className="mt-2 text-sm text-rose-600">{state.error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
        <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending ? "Saving…" : "Add service"}
        </button>
      </div>
    </form>
  );
}

function ServiceRow({ svc }: { svc: ServiceDTO }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(updateService.bind(null, svc.id), {});
  const [deleting, startDelete] = useTransition();
  if (state.ok && editing) setEditing(false);

  if (editing)
    return (
      <form action={action} className="rounded-2xl border border-brand-200 bg-white p-5 shadow-sm">
        <Fields svc={svc} />
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
      <div>
        <p className="font-medium text-slate-800">{svc.name}</p>
        <p className="text-sm text-slate-500">${svc.price} · {svc.durationMin} min{svc.description ? ` · ${svc.description}` : ""}</p>
      </div>
      <div className="flex shrink-0 gap-3">
        <button onClick={() => setEditing(true)} className="text-sm font-medium text-brand-700 hover:underline">Edit</button>
        <button
          onClick={() => { if (confirm(`Delete "${svc.name}"?`)) startDelete(() => deleteService(svc.id).then(() => {})); }}
          disabled={deleting}
          className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-60"
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export function ServicesManager({ services }: { services: ServiceDTO[] }) {
  return (
    <div className="space-y-3">
      {services.map((s) => <ServiceRow key={s.id} svc={s} />)}
      <AddService />
    </div>
  );
}
