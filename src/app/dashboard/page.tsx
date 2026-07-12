import { requireVetClinic } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { BookingControls } from "@/components/BookingControls";
import { formatDateTime } from "@/lib/format";
import { SPECIES_EMOJI } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const { clinic } = await requireVetClinic();
  const appointments = await prisma.appointment.findMany({
    where: { clinicId: clinic.id },
    orderBy: { startAt: "asc" },
    include: {
      client: { select: { name: true } },
      pet: { select: { name: true, species: true } },
      service: { select: { name: true } },
      vet: { select: { name: true } },
    },
  });

  const now = new Date();
  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;
  const upcoming = appointments.filter(
    (a) => new Date(a.startAt) >= now && (a.status === "PENDING" || a.status === "CONFIRMED"),
  );
  const past = appointments.filter((a) => !upcoming.includes(a)).reverse();

  const stats = [
    { label: "Pending requests", value: pendingCount },
    { label: "Upcoming", value: upcoming.length },
    { label: "Total booked", value: appointments.length },
  ];

  function Row({ a }: { a: (typeof appointments)[number] }) {
    return (
      <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{a.client.name}</span>
            <StatusBadge status={a.status} />
          </div>
          <p className="text-sm text-slate-600">
            {SPECIES_EMOJI[a.pet.species] ?? "🐾"} {a.pet.name} · {a.service.name} · with {a.vet.name}
          </p>
          <p className="text-xs text-slate-400">{formatDateTime(a.startAt)}</p>
        </div>
        <BookingControls id={a.id} status={a.status} />
      </li>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Upcoming &amp; requests</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No upcoming appointments yet.
          </p>
        ) : (
          <ul className="space-y-3">{upcoming.map((a) => <Row key={a.id} a={a} />)}</ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">History</h2>
          <ul className="space-y-3">{past.map((a) => <Row key={a.id} a={a} />)}</ul>
        </section>
      )}
    </div>
  );
}
