"use client";

import { useActionState } from "react";
import { updateClinicProfile, type ActionState } from "@/lib/actions/clinic";

export type ClinicDTO = {
  name: string;
  city: string;
  address: string;
  phone: string;
  description: string;
};

const input =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function ClinicProfileForm({ clinic }: { clinic: ClinicDTO }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateClinicProfile, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Clinic name
          <input name="name" defaultValue={clinic.name} required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          City
          <input name="city" defaultValue={clinic.city} required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Address
          <input name="address" defaultValue={clinic.address} className={input} placeholder="123 Market St" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Phone
          <input name="phone" defaultValue={clinic.phone} className={input} placeholder="(415) 555-0100" />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Description
        <textarea name="description" defaultValue={clinic.description} rows={4} className={input} placeholder="Tell pet owners about your clinic…" />
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
        {state.ok && <span className="text-sm font-medium text-brand-700">✓ Saved</span>}
        {state.error && <span className="text-sm text-rose-600">{state.error}</span>}
      </div>
    </form>
  );
}
