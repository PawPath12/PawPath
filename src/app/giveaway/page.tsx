import type { Metadata } from "next";
import { GiveawayForm } from "@/components/GiveawayForm";

export const metadata: Metadata = {
  title: "Giveaway — PawPath",
  description:
    "Enter the PawPath giveaway. Enter in seconds — from the team helping pet owners find and book trusted veterinary care.",
};

export default function GiveawayPage() {
  return (
    <div className="bg-cream">
      {/* Branded intro */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink to-brand-900/40" />
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-inset ring-white/25 backdrop-blur">
            🐾 Giveaway
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
            Treat Yourself Giveaway
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Because you deserve a treat, too. 🐾 Enter below — winners will be
            contacted by email.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-6 py-3 text-base font-semibold text-amber-200">
            🎁 Grand prize: <span className="font-display text-xl">$500</span> self-care experience
          </div>
        </div>
      </section>

      {/* Branded entry form (posts into the Google Form behind the scenes) */}
      <section className="mx-auto max-w-2xl px-4 py-10">
        <GiveawayForm />
      </section>
    </div>
  );
}
