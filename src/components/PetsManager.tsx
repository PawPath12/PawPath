"use client";

import { useActionState, useState, useTransition } from "react";
import { createPet, updatePet, deletePet, type PetFormState } from "@/lib/actions/pets";
import { SPECIES, SPECIES_EMOJI } from "@/lib/constants";

export type PetDTO = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthdate: string | null; // yyyy-mm-dd
  notes: string;
};

const inputCls =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function PetFields({ pet }: { pet?: PetDTO }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Name
        <input name="name" defaultValue={pet?.name} required className={inputCls} placeholder="Baxter" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Species
        <select name="species" defaultValue={pet?.species ?? "Dog"} className={inputCls}>
          {SPECIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Breed
        <input name="breed" defaultValue={pet?.breed ?? ""} className={inputCls} placeholder="Golden Retriever" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Birthdate
        <input name="birthdate" type="date" defaultValue={pet?.birthdate ?? ""} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 sm:col-span-2">
        Notes
        <textarea name="notes" defaultValue={pet?.notes ?? ""} rows={2} className={inputCls} placeholder="Allergies, temperament, medical history…" />
      </label>
    </div>
  );
}

function AddPet() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<PetFormState, FormData>(createPet, {});

  if (state.ok && open) setOpen(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-8 text-center font-medium text-slate-500 transition hover:border-brand-400 hover:text-brand-700"
      >
        + Add a pet
      </button>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold text-slate-900">Add a pet</h3>
      <PetFields />
      {state.error && <p className="mt-2 text-sm text-rose-600">{state.error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-700">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
          {pending ? "Saving…" : "Save pet"}
        </button>
      </div>
    </form>
  );
}

function PetCard({ pet }: { pet: PetDTO }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<PetFormState, FormData>(
    updatePet.bind(null, pet.id),
    {},
  );
  const [deleting, startDelete] = useTransition();

  if (state.ok && editing) setEditing(false);

  if (editing) {
    return (
      <form action={action} className="rounded-2xl border border-brand-200 bg-white p-5 shadow-sm">
        <PetFields pet={pet} />
        {state.error && <p className="mt-2 text-sm text-rose-600">{state.error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
          {SPECIES_EMOJI[pet.species] ?? "🐾"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{pet.name}</h3>
          <p className="text-sm text-slate-500">
            {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
          </p>
        </div>
      </div>
      {pet.notes && <p className="mt-3 text-sm text-slate-600">{pet.notes}</p>}
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
        <button onClick={() => setEditing(true)} className="text-sm font-medium text-brand-700 hover:underline">
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm(`Remove ${pet.name}?`)) startDelete(() => deletePet(pet.id).then(() => {}));
          }}
          disabled={deleting}
          className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-60"
        >
          {deleting ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}

export function PetsManager({ pets }: { pets: PetDTO[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {pets.map((p) => (
        <PetCard key={p.id} pet={p} />
      ))}
      <AddPet />
    </div>
  );
}
