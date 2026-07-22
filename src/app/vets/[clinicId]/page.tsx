import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Stars } from "@/components/Stars";
import { formatPrice, formatDate } from "@/lib/format";
import { DAYS } from "@/lib/constants";
import { FEATURE_REVIEWS } from "@/lib/features";
import { MessageClinicButton } from "@/components/MessageClinicButton";

export const dynamic = "force-dynamic";

export default async function ClinicProfile({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;
  const session = await auth();

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      vets: true,
      services: { orderBy: { priceCents: "asc" } },
      availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      reviews: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!clinic) notFound();

  // Distinct weekly hours across all staff (deduped by day+time).
  const seen = new Set<string>();
  const weekly = clinic.availability
    .filter((a) => {
      const k = `${a.dayOfWeek}-${a.startTime}-${a.endTime}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((a) => ({ day: DAYS[a.dayOfWeek], start: a.startTime, end: a.endTime }));

  const isClient = session?.user?.role === "CLIENT";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/vets" className="text-sm font-medium text-slate-500 hover:text-slate-800">
        ← Back to all vets
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-accent-50 font-display text-3xl font-semibold text-ink">
            {clinic.name.replace(/^(The |A )/, "").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ink">{clinic.name}</h1>
            <p className="mt-1 text-sm uppercase tracking-wide text-slate-400">
              {clinic.address || clinic.city}
            </p>
            {FEATURE_REVIEWS && (
              <div className="mt-2">
                <Stars value={clinic.avgRating} showValue count={clinic.reviewCount} size="md" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link
            href={`/book/${clinic.id}`}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-brand-700"
          >
            Book appointment
          </Link>
          <MessageClinicButton clinicId={clinic.id} canMessage={isClient} />
          {clinic.phone && (
            <p className="text-sm text-slate-500">
              <span className="text-slate-400">Call</span> {clinic.phone}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">About</h2>
            <p className="mt-2 text-slate-600">{clinic.description || "No description provided."}</p>
          </section>

          {/* Services */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Services &amp; pricing</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {clinic.services.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-slate-800">{s.name}</p>
                    <p className="text-sm text-slate-500">{s.description ? `${s.description} · ` : ""}{s.durationMin} min</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">
                      {s.priceCents > 0 ? formatPrice(s.priceCents) : "Contact for pricing"}
                    </span>
                    <Link
                      href={`/book/${clinic.id}?serviceId=${s.id}`}
                      className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                    >
                      Book
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Reviews */}
          {FEATURE_REVIEWS && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Reviews <span className="text-slate-400">({clinic.reviewCount})</span>
              </h2>
              {clinic.reviews.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No reviews yet — be the first!</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {clinic.reviews.map((r) => (
                    <li key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">{r.author.name}</span>
                        <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                      </div>
                      <div className="mt-1"><Stars value={r.rating} /></div>
                      {r.comment && <p className="mt-1.5 text-sm text-slate-600">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        {/* Sidebar: staff + hours */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Our team</h2>
            <ul className="mt-3 space-y-3">
              {clinic.vets.map((v) => {
                const initials = v.name
                  .replace(/^Dr\.?\s*/, "")
                  .split(",")[0]
                  .trim()
                  .split(/\s+/)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <li key={v.id} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 font-display text-sm font-semibold text-accent-700 ring-1 ring-inset ring-accent-100">
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{v.name}</p>
                      {v.specialties && <p className="text-xs text-accent-700">{v.specialties}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Weekly hours</h2>
            {weekly.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Hours not set.</p>
            ) : (
              <ul className="mt-3 space-y-1.5 text-sm">
                {weekly.map((w, i) => (
                  <li key={i} className="flex justify-between text-slate-600">
                    <span>{w.day}</span>
                    <span className="tabular-nums">{w.start} – {w.end}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
