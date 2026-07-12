import Link from "next/link";
import { requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { CancelButton, ReviewForm } from "@/components/AppointmentActions";
import { formatDateTime, formatPrice } from "@/lib/format";
import { SPECIES_EMOJI } from "@/lib/constants";
import { FEATURE_REVIEWS } from "@/lib/features";

export const dynamic = "force-dynamic";

type ApptRow = Awaited<ReturnType<typeof getData>>["appointments"][number];

async function getData(userId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId: userId },
    orderBy: { startAt: "desc" },
    include: {
      clinic: { select: { id: true, name: true, city: true } },
      service: { select: { name: true, priceCents: true } },
      vet: { select: { name: true } },
      pet: { select: { name: true, species: true } },
      review: { select: { id: true } },
    },
  });
  return { appointments };
}

function ApptCard({ a }: { a: ApptRow }) {
  const upcoming = new Date(a.startAt) >= new Date() && (a.status === "PENDING" || a.status === "CONFIRMED");
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/vets/${a.clinic.id}`} className="font-semibold text-slate-900 hover:text-brand-700">
              {a.clinic.name}
            </Link>
            <StatusBadge status={a.status} />
          </div>
          <p className="mt-1 text-sm text-slate-600">{a.service.name} · {formatPrice(a.service.priceCents)}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {SPECIES_EMOJI[a.pet.species] ?? "🐾"} {a.pet.name} · with {a.vet.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{formatDateTime(a.startAt)}</p>
          <p className="text-xs text-slate-400">📍 {a.clinic.city}</p>
        </div>
      </div>

      {a.notes && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{a.notes}</p>}

      {(upcoming || (FEATURE_REVIEWS && a.status === "COMPLETED")) && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
          {upcoming && <CancelButton appointmentId={a.id} />}
          {FEATURE_REVIEWS && a.status === "COMPLETED" && !a.review && <ReviewForm appointmentId={a.id} />}
          {FEATURE_REVIEWS && a.status === "COMPLETED" && a.review && (
            <span className="text-sm font-medium text-amber-600">★ Reviewed</span>
          )}
        </div>
      )}
    </li>
  );
}

export default async function AppointmentsPage() {
  const user = await requireClient();
  const { appointments } = await getData(user.id);

  const now = new Date();
  const upcoming = appointments
    .filter((a) => new Date(a.startAt) >= now && (a.status === "PENDING" || a.status === "CONFIRMED"))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const past = appointments.filter((a) => !upcoming.includes(a));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
        <Link href="/vets" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
          Book a visit
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-5xl">📅</p>
          <p className="mt-4 text-lg font-medium text-slate-700">No appointments yet</p>
          <Link href="/vets" className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
            Find a vet to book with →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming appointments.</p>
            ) : (
              <ul className="space-y-4">{upcoming.map((a) => <ApptCard key={a.id} a={a} />)}</ul>
            )}
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">History</h2>
              <ul className="space-y-4">{past.map((a) => <ApptCard key={a.id} a={a} />)}</ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
