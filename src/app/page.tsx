import Link from "next/link";
import { prisma } from "@/lib/db";
import { VetCard } from "@/components/VetCard";
import { PawsBackdrop } from "@/components/Paws";
import { FEATURE_REVIEWS } from "@/lib/features";

const SPECIALTIES = [
  "Cardiology",
  "Oncology",
  "Neurology",
  "Dermatology",
  "Surgery",
  "Dentistry",
  "Ophthalmology",
  "Internal Medicine",
  "Behavior",
  "Emergency & Critical Care",
];

export default async function Home() {
  const topClinics = await prisma.clinic.findMany({
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: 3,
    include: {
      vets: { select: { name: true, specialties: true } },
      services: { select: { name: true, priceCents: true }, orderBy: { priceCents: "asc" } },
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-brand-50 via-white to-accent-50">
        <PawsBackdrop />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 text-center">
          <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-700 shadow-sm ring-1 ring-accent-100">
            Trusted veterinary care, nationwide
          </span>
          <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-6xl">
            Find &amp; book the right vet for your best friend
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-xl font-medium text-slate-700">
            Never feel lost when it matters most.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Search trusted clinics and board-certified specialists, compare services, and book
            appointments online — all in one place.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/vets"
              className="rounded-full bg-brand-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Browse veterinarians
            </Link>
            <Link
              href="/login?as=vet"
              className="rounded-full border border-accent-600 bg-white px-7 py-3 font-semibold text-accent-700 shadow-sm transition hover:bg-accent-50"
            >
              List your clinic
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: "🔍", title: "Search & compare", text: "Filter by city, specialty, and service to find the perfect match." },
            { icon: "📅", title: "Book instantly", text: "Pick an open time from real availability — no phone tag." },
            { icon: "🐶", title: "Track & manage", text: "Keep your pet's whole appointment history in one place." },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-3xl">{s.icon}</div>
              <h3 className="mt-4 font-display text-xl font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by specialty */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-700">
              Specialist care
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">
              Browse by specialty
            </h2>
            <p className="mt-2 text-slate-500">
              From cardiology to oncology — find the right expert for your pet.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {SPECIALTIES.map((s) => (
              <Link
                key={s}
                href={`/vets?specialty=${encodeURIComponent(s)}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured clinics */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-7 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold text-slate-900">
            {FEATURE_REVIEWS ? "Top-rated clinics" : "Featured clinics"}
          </h2>
          <Link href="/vets" className="text-sm font-semibold text-accent-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topClinics.map((c) => (
            <VetCard key={c.id} clinic={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
