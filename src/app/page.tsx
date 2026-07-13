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

  const steps = [
    { n: "01", title: "Search & compare", text: "Filter by city, specialty, and service to find the perfect match." },
    { n: "02", title: "Book instantly", text: "Pick an open time from real availability — no phone tag." },
    { n: "03", title: "Track & manage", text: "Keep your pet's whole appointment history in one place." },
  ];

  return (
    <div>
      {/* Hero — fades softly into the page below */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-cream to-cream">
        <PawsBackdrop />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-24 text-center">
          <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-700 shadow-sm ring-1 ring-accent-100">
            Trusted veterinary care, nationwide
          </span>
          <h1 className="mt-8 text-4xl font-bold leading-tight text-ink sm:text-6xl">
            Find &amp; book the right vet for your best friend
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-xl font-medium text-slate-700">
            Never feel lost when it matters most.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-slate-500">
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
              className="rounded-full px-7 py-3 font-semibold text-ink underline-offset-4 transition hover:underline"
            >
              List your clinic →
            </Link>
          </div>

          {/* Specialties woven right into the hero as a soft strip */}
          <div className="mt-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
              Find a specialist
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SPECIALTIES.map((s) => (
                <Link
                  key={s}
                  href={`/vets?specialty=${encodeURIComponent(s)}`}
                  className="rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-sm text-slate-600 transition hover:border-ink hover:text-ink"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Everything below flows on one continuous canvas */}
      <div className="mx-auto max-w-6xl px-4">
        {/* Featured clinics */}
        <section className="pt-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Featured</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                {FEATURE_REVIEWS ? "Top-rated clinics" : "Clinics you'll love"}
              </h2>
            </div>
            <Link href="/vets" className="text-sm font-semibold text-brand-700 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topClinics.map((c) => (
              <VetCard key={c.id} clinic={c} />
            ))}
          </div>
        </section>

        {/* How it works — airy, borderless, three quiet columns */}
        <section className="py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            Care for your pet in three simple steps
          </h2>
          <div className="mx-auto mt-14 grid max-w-4xl gap-12 text-left sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title}>
                <span className="font-display text-4xl font-semibold text-brand-600">{s.n}</span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
