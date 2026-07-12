import Link from "next/link";
import { prisma } from "@/lib/db";
import { VetCard } from "@/components/VetCard";
import { FEATURE_REVIEWS } from "@/lib/features";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  city?: string;
  service?: string;
  specialty?: string;
  minRating?: string;
  sort?: string;
}>;

export default async function VetsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const city = sp.city ?? "";
  const service = sp.service ?? "";
  const specialty = sp.specialty ?? "";
  const minRating = FEATURE_REVIEWS ? Number(sp.minRating ?? 0) || 0 : 0;
  const sort = sp.sort ?? (FEATURE_REVIEWS ? "rating" : "name");

  const where: Prisma.ClinicWhereInput = {};
  if (q) where.name = { contains: q };
  if (city) where.city = city;
  if (service) where.services = { some: { name: service } };
  if (specialty) where.vets = { some: { specialties: { contains: specialty } } };
  if (minRating > 0) where.avgRating = { gte: minRating };

  const orderBy: Prisma.ClinicOrderByWithRelationInput =
    sort === "name"
      ? { name: "asc" }
      : sort === "reviews"
        ? { reviewCount: "desc" }
        : { avgRating: "desc" };

  const [clinics, cities, services, allVetSpecialties] = await Promise.all([
    prisma.clinic.findMany({
      where,
      orderBy,
      include: {
        vets: { select: { name: true, specialties: true } },
        services: { select: { name: true, priceCents: true }, orderBy: { priceCents: "asc" } },
      },
    }),
    prisma.clinic.findMany({ select: { city: true }, distinct: ["city"], orderBy: { city: "asc" } }),
    prisma.service.findMany({ select: { name: true }, distinct: ["name"], orderBy: { name: "asc" } }),
    prisma.vet.findMany({ select: { specialties: true } }),
  ]);

  // Distinct specialty tokens across all vets (specialties are comma-separated).
  const specialties = [
    ...new Set(
      allVetSpecialties.flatMap((v) => v.specialties.split(",").map((s) => s.trim()).filter(Boolean)),
    ),
  ].sort();

  const select =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Find a veterinarian</h1>
      <p className="mt-2 text-slate-500">
        {clinics.length} clinic{clinics.length === 1 ? "" : "s"}
        {specialty ? ` offering ${specialty}` : ""} available
      </p>

      {/* Filter bar (plain GET form — no JS required) */}
      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className={`${select} sm:col-span-2 lg:col-span-1`}
        />
        <select name="city" defaultValue={city} className={select}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>{c.city}</option>
          ))}
        </select>
        <select name="specialty" defaultValue={specialty} className={select}>
          <option value="">All specialties</option>
          {specialties.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="service" defaultValue={service} className={select}>
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
        {FEATURE_REVIEWS && (
          <select name="minRating" defaultValue={String(minRating)} className={select}>
            <option value="0">Any rating</option>
            <option value="3">3★ &amp; up</option>
            <option value="4">4★ &amp; up</option>
            <option value="4.5">4.5★ &amp; up</option>
          </select>
        )}
        <div className="flex gap-2">
          <select name="sort" defaultValue={sort} className={`${select} flex-1`}>
            {FEATURE_REVIEWS && <option value="rating">Top rated</option>}
            {FEATURE_REVIEWS && <option value="reviews">Most reviewed</option>}
            <option value="name">Name (A–Z)</option>
          </select>
          <button type="submit" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700">
            Filter
          </button>
        </div>
      </form>

      {clinics.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-4 text-lg font-medium text-slate-700">No clinics match your filters</p>
          <Link href="/vets" className="mt-2 inline-block text-sm font-semibold text-accent-700 hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clinics.map((c) => (
            <VetCard key={c.id} clinic={c} />
          ))}
        </div>
      )}
    </div>
  );
}
