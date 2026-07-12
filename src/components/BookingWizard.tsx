"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createBooking } from "@/lib/actions/booking";
import { upcomingSlots, type Window } from "@/lib/slots";
import { formatPrice, formatTime } from "@/lib/format";
import { SPECIES_EMOJI } from "@/lib/constants";

type Service = { id: string; name: string; priceCents: number; durationMin: number };
type Vet = { id: string; name: string; specialties: string };
type Pet = { id: string; name: string; species: string };

export function BookingWizard({
  clinicId,
  services,
  vets,
  pets,
  availabilityByVet,
  busyByVet,
  preselectServiceId,
}: {
  clinicId: string;
  services: Service[];
  vets: Vet[];
  pets: Pet[];
  availabilityByVet: Record<string, Window[]>;
  busyByVet: Record<string, { startAt: string; endAt: string }[]>;
  preselectServiceId: string | null;
}) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(
    preselectServiceId && services.some((s) => s.id === preselectServiceId)
      ? preselectServiceId
      : (services[0]?.id ?? ""),
  );
  const [vetId, setVetId] = useState(vets[0]?.id ?? "");
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [slot, setSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const service = services.find((s) => s.id === serviceId);

  const days = useMemo(() => {
    if (!service || !vetId) return [];
    const windows = availabilityByVet[vetId] ?? [];
    const busy = (busyByVet[vetId] ?? []).map((b) => ({
      startAt: new Date(b.startAt),
      endAt: new Date(b.endAt),
    }));
    return upcomingSlots(windows, service.durationMin, busy, 21);
  }, [service, vetId, availabilityByVet, busyByVet]);

  // Selected slot is cleared whenever the vet/service context changes.
  const dayKeyRef = `${serviceId}:${vetId}`;
  const [ctx, setCtx] = useState(dayKeyRef);
  if (ctx !== dayKeyRef) {
    setCtx(dayKeyRef);
    setSlot(null);
  }

  function confirm() {
    if (!service || !vetId || !petId || !slot) {
      setError("Please choose a service, vet, pet, and time.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("clinicId", clinicId);
    fd.set("serviceId", serviceId);
    fd.set("vetId", vetId);
    fd.set("petId", petId);
    fd.set("startAt", slot);
    start(async () => {
      const res = await createBooking(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push("/account/appointments");
    });
  }

  const cardBase = "rounded-xl border p-3 text-left transition cursor-pointer";

  return (
    <div className="space-y-6">
      {/* Step 1: Service */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">1 · Service</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setServiceId(s.id)}
              className={`${cardBase} ${serviceId === s.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{s.name}</span>
                <span className="text-sm font-semibold text-slate-700">{formatPrice(s.priceCents)}</span>
              </div>
              <span className="text-xs text-slate-500">{s.durationMin} min</span>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: Vet */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">2 · Veterinarian</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {vets.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVetId(v.id)}
              className={`${cardBase} ${vetId === v.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <span className="font-medium text-slate-800">🩺 {v.name}</span>
              {v.specialties && <span className="block text-xs text-slate-500">{v.specialties}</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Step 3: Pet */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">3 · Pet</h2>
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

      {/* Step 4: Time */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">4 · Pick a time</h2>
        {days.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No open times for this vet in the next few weeks. Try another vet.
          </p>
        ) : (
          <div className="max-h-80 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 scroll-slim">
            {days.map((d) => (
              <div key={d.date.toISOString()}>
                <p className="mb-1.5 text-sm font-medium text-slate-700">
                  {d.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {d.slots.map((t) => {
                    const iso = t.toISOString();
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSlot(iso)}
                        className={`rounded-lg border px-3 py-1.5 text-sm tabular-nums transition ${slot === iso ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-700 hover:border-brand-400"}`}
                      >
                        {formatTime(t)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-600">
          {service && slot ? (
            <>
              <span className="font-medium text-slate-800">{service.name}</span> ·{" "}
              {new Date(slot).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </>
          ) : (
            "Select a service and time to continue"
          )}
        </div>
        <button
          onClick={confirm}
          disabled={pending || !slot}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Booking…" : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}
