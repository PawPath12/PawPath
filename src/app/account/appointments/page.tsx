import Link from "next/link";
import { requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { CancelButton, ReviewForm } from "@/components/AppointmentActions";
import { formatDateTime, formatPrice } from "@/lib/format";
import { SPECIES_EMOJI } from "@/lib/constants";
import { FEATURE_REVIEWS } from "@/lib/features";
import { listUpcomingClientAppointments } from "@/lib/vetspire";

export const dynamic = "force-dynamic";

type VetspireRow = {
  id: string;
  startISO: string;
  status: string;
  petName: string | null;
  clinicId: string;
  clinicName: string;
  city: string;
};

/**
 * Upcoming appointments this user booked in a Vetspire-backed clinic. These live
 * in Vetspire (matched by email), not our DB — fetched so they still appear here.
 * Any Vetspire hiccup returns [] so the page never breaks.
 */
async function getVetspireUpcoming(email: string): Promise<VetspireRow[]> {
  try {
    const vetspireClinics = await prisma.clinic.findMany({
      where: { bookingProvider: "VETSPIRE", vetspireLocationId: { not: null } },
      select: { id: true, name: true, city: true, vetspireLocationId: true },
    });
    if (vetspireClinics.length === 0) return [];
    const byLocation = new Map(vetspireClinics.map((c) => [c.vetspireLocationId!, c]));

    const appts = await listUpcomingClientAppointments(email);
    return appts
      .filter((a) => a.locationId && byLocation.has(a.locationId) && a.status !== "CANCELLED")
      .map((a) => {
        const clinic = byLocation.get(a.locationId!)!;
        return {
          id: a.id,
          startISO: a.startISO,
          status: a.status,
          petName: a.petName,
          clinicId: clinic.id,
          clinicName: clinic.name,
          city: clinic.city,
        };
      })
      .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
  } catch (err) {
    console.error("Failed to load Vetspire appointments:", err);
    return [];
  }
}

function VetspireApptCard({ a }: { a: VetspireRow }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/vets/${a.clinicId}`} className="font-semibold text-slate-900 hover:text-brand-700">
              {a.clinicName}
            </Link>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
              {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            {a.petName ? `🐾 ${a.petName} · ` : ""}Managed by the clinic
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{formatDateTime(new Date(a.startISO))}</p>
          <p className="text-xs text-slate-400">📍 {a.city}</p>
        </div>
      </div>
      <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
        To change or cancel this visit, contact {a.clinicName} directly.
      </p>
    </li>
  );
}

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
  const [{ appointments }, dbUser] = await Promise.all([
    getData(user.id),
    prisma.user.findUnique({ where: { id: user.id }, select: { email: true } }),
  ]);
  const vetspireUpcoming = dbUser ? await getVetspireUpcoming(dbUser.email) : [];

  const now = new Date();
  const upcoming = appointments
    .filter((a) => new Date(a.startAt) >= now && (a.status === "PENDING" || a.status === "CONFIRMED"))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const past = appointments.filter((a) => !upcoming.includes(a));
  const hasAny = appointments.length > 0 || vetspireUpcoming.length > 0;
  const hasUpcoming = upcoming.length > 0 || vetspireUpcoming.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
        <Link href="/vets" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
          Book a visit
        </Link>
      </div>

      {!hasAny ? (
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
            {!hasUpcoming ? (
              <p className="text-sm text-slate-500">No upcoming appointments.</p>
            ) : (
              <ul className="space-y-4">
                {vetspireUpcoming.map((a) => <VetspireApptCard key={`vs-${a.id}`} a={a} />)}
                {upcoming.map((a) => <ApptCard key={a.id} a={a} />)}
              </ul>
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
