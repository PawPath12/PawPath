"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createVetspireBooking, getVetspireSlots } from "@/lib/actions/vetspire-booking";
import { SPECIES_EMOJI } from "@/lib/constants";

type AppointmentType = { id: string; name: string; duration: number | null };
type Pet = { id: string; name: string; species: string };
type Slot = { startISO: string; time: string; providerId: string | null };
type SavedContact = {
  phone: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressPostal: string;
};

/** Next `n` calendar dates as { iso: YYYY-MM-DD, label } for the date strip. */
function nextDates(n: number): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    out.push({
      iso,
      label: day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    });
  }
  return out;
}

export function VetspireBookingWizard({
  clinicId,
  appointmentTypes,
  pets,
  savedContact,
}: {
  clinicId: string;
  appointmentTypes: AppointmentType[];
  pets: Pet[];
  savedContact: SavedContact;
}) {
  const router = useRouter();
  const dates = nextDates(14);

  const [typeId, setTypeId] = useState(appointmentTypes[0]?.id ?? "");
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [contact, setContact] = useState<SavedContact>(savedContact);
  const [previousVet, setPreviousVet] = useState("");
  const [requestRecords, setRequestRecords] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSlots, loadSlots] = useTransition();
  const [booking, startBooking] = useTransition();

  const apptType = appointmentTypes.find((t) => t.id === typeId);

  function pickDate(iso: string) {
    setDateIso(iso);
    setSlot(null);
    setSlots([]);
    setError(null);
    loadSlots(async () => {
      const res = await getVetspireSlots(clinicId, typeId, iso);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSlots(res.slots);
    });
  }

  function setField(key: keyof SavedContact, value: string) {
    setContact((c) => ({ ...c, [key]: value }));
  }

  function confirm() {
    if (!apptType || !petId || !slot) {
      setError("Please choose a service, pet, and time.");
      return;
    }
    if (!contact.phone.trim() || !contact.addressLine1.trim() || !contact.addressCity.trim() || !contact.addressState.trim() || !contact.addressPostal.trim()) {
      setError("Please fill in your phone number and full address.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("clinicId", clinicId);
    fd.set("appointmentTypeId", typeId);
    fd.set("startISO", slot.startISO);
    fd.set("durationMin", String(apptType.duration ?? 30));
    fd.set("providerId", slot.providerId ?? "");
    fd.set("petId", petId);
    fd.set("phone", contact.phone.trim());
    fd.set("addressLine1", contact.addressLine1.trim());
    fd.set("addressLine2", contact.addressLine2.trim());
    fd.set("addressCity", contact.addressCity.trim());
    fd.set("addressState", contact.addressState.trim());
    fd.set("addressPostal", contact.addressPostal.trim());
    if (previousVet.trim()) fd.set("previousVet", previousVet.trim());
    if (requestRecords) fd.set("requestRecords", "on");
    for (const f of files) fd.append("records", f);
    startBooking(async () => {
      const res = await createVetspireBooking(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push("/account/appointments?booked=vetspire");
    });
  }

  const cardBase = "rounded-xl border p-3 text-left transition cursor-pointer";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-sky-800">
        🗓️ Appointments for this clinic are scheduled directly in their system — you&apos;ll get their confirmation.
      </div>

      {/* Step 1: Appointment type */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">1 · Reason for visit</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {appointmentTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTypeId(t.id);
                setDateIso(null);
                setSlots([]);
                setSlot(null);
              }}
              className={`${cardBase} ${typeId === t.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <span className="font-medium text-slate-800">{t.name}</span>
              {t.duration ? <span className="block text-xs text-slate-500">{t.duration} min</span> : null}
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: Pet */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">2 · Pet</h2>
        <div className="flex flex-wrap gap-2">
          {pets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPetId(p.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${petId === p.id ? "border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-200" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
            >
              {SPECIES_EMOJI[p.species] ?? "🐾"} {p.name}
            </button>
          ))}
        </div>
      </section>

      {/* Step 3: Contact & address (synced to the clinic's chart) */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">3 · Your contact &amp; address</h2>
        <p className="mb-3 text-xs text-slate-500">
          The clinic needs these to set up your chart. We&apos;ll save them for next time.
        </p>
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-slate-600">Phone number</span>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-500"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-slate-600">Street address</span>
            <input
              value={contact.addressLine1}
              onChange={(e) => setField("addressLine1", e.target.value)}
              placeholder="123 Main St"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-500"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-slate-600">Apt / unit (optional)</span>
            <input
              value={contact.addressLine2}
              onChange={(e) => setField("addressLine2", e.target.value)}
              placeholder="Apt 4B"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-500"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">City</span>
            <input
              value={contact.addressCity}
              onChange={(e) => setField("addressCity", e.target.value)}
              placeholder="Brooklyn"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-500"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">State</span>
              <input
                value={contact.addressState}
                onChange={(e) => setField("addressState", e.target.value)}
                placeholder="NY"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">ZIP</span>
              <input
                value={contact.addressPostal}
                onChange={(e) => setField("addressPostal", e.target.value)}
                placeholder="11235"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-500"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Optional: new-patient history — previous vet + records */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          New patient? <span className="text-slate-300">(optional)</span>
        </h2>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Previous vet clinic(s)</span>
            <input
              value={previousVet}
              onChange={(e) => setPreviousVet(e.target.value)}
              placeholder="e.g. Ocean Ave Animal Hospital, Brooklyn"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-500"
            />
          </label>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={requestRecords}
              onChange={(e) => setRequestRecords(e.target.checked)}
              className="mt-0.5"
            />
            <span>Please request my pet&apos;s records from my previous vet.</span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Upload records (PDF or photo)</span>
            <input
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
            />
            {files.length > 0 && (
              <span className="mt-1 block text-xs text-slate-500">
                {files.length} file{files.length > 1 ? "s" : ""} selected — sent straight to your pet&apos;s chart.
              </span>
            )}
          </label>
        </div>
      </section>

      {/* Step 4: Date */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">4 · Day</h2>
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <button
              key={d.iso}
              type="button"
              onClick={() => pickDate(d.iso)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${dateIso === d.iso ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-700 hover:border-brand-400"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {/* Step 4: Time */}
      {dateIso && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">5 · Pick a time</h2>
          {loadingSlots ? (
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading available times…</p>
          ) : slots.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              No open times on this day. Try another day.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
              {slots.map((s) => (
                <button
                  key={s.startISO}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`rounded-lg border px-3 py-1.5 text-sm tabular-nums transition ${slot?.startISO === s.startISO ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-700 hover:border-brand-400"}`}
                >
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-600">
          {apptType && slot ? (
            <>
              <span className="font-medium text-slate-800">{apptType.name}</span> ·{" "}
              {new Date(slot.startISO).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </>
          ) : (
            "Select a reason and time to continue"
          )}
        </div>
        <button
          onClick={confirm}
          disabled={booking || !slot}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {booking ? "Booking…" : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}
