import Link from "next/link";
import { Stars } from "@/components/Stars";
import { formatPrice } from "@/lib/format";
import { FEATURE_REVIEWS } from "@/lib/features";

export type ClinicCardData = {
  id: string;
  name: string;
  city: string;
  description: string;
  avgRating: number;
  reviewCount: number;
  vets: { name: string; specialties: string }[];
  services: { name: string; priceCents: number }[];
};

function distinctSpecialties(vets: { specialties: string }[]): string[] {
  const set = new Set<string>();
  for (const v of vets) {
    for (const s of v.specialties.split(",").map((x) => x.trim()).filter(Boolean)) {
      set.add(s);
    }
  }
  return [...set];
}

export function VetCard({ clinic }: { clinic: ClinicCardData }) {
  const fromPrice = clinic.services.length
    ? Math.min(...clinic.services.map((s) => s.priceCents))
    : null;
  const specialties = distinctSpecialties(clinic.vets);
  const monogram = clinic.name.replace(/^(The |A )/, "").charAt(0).toUpperCase();

  return (
    <Link
      href={`/vets/${clinic.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-brand-50 to-accent-50 font-display text-lg font-semibold text-accent-700">
          {monogram}
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900 group-hover:text-accent-700">
            {clinic.name}
          </h3>
          <p className="text-sm text-slate-500">{clinic.city}</p>
        </div>
      </div>

      {FEATURE_REVIEWS && (
        <div className="flex items-center gap-2">
          <Stars value={clinic.avgRating} showValue count={clinic.reviewCount} />
        </div>
      )}

      <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{clinic.description}</p>

      {specialties.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-700 ring-1 ring-inset ring-accent-100">
              {s}
            </span>
          ))}
          {specialties.length > 3 && (
            <span className="px-1 py-1 text-xs text-slate-400">+{specialties.length - 3} more</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-500">
          {clinic.vets.length} vet{clinic.vets.length === 1 ? "" : "s"}
        </span>
        {fromPrice !== null && (
          <span className="font-medium text-slate-700">from {formatPrice(fromPrice)}</span>
        )}
      </div>
    </Link>
  );
}
