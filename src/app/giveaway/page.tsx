import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giveaway — PawPath",
  description:
    "Enter the PawPath giveaway. Scan, enter, and you could win — from the team helping pet owners find and book trusted veterinary care.",
};

// Google Form embed (from the form's Send → <> embed code).
const FORM_SRC =
  "https://docs.google.com/forms/d/e/1FAIpQLSfmXnqiLeVjIhFlVqJdJ7AmEF8kozTx1HV-QvHgGS_CSiAtXw/viewform?embedded=true";

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
            Enter the PawPath giveaway
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Fill out the quick form below to enter. Winners will be contacted by email —
            good luck from the whole PawPath team!
          </p>
        </div>
      </section>

      {/* Embedded Google Form */}
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm sm:p-4">
          <iframe
            src={FORM_SRC}
            title="PawPath Giveaway entry form"
            className="mx-auto block w-full"
            style={{ height: 1800, border: 0, maxWidth: 640 }}
            loading="lazy"
          >
            Loading…
          </iframe>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Having trouble with the form?{" "}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfmXnqiLeVjIhFlVqJdJ7AmEF8kozTx1HV-QvHgGS_CSiAtXw/viewform"
            className="font-medium text-brand-700 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open it in a new tab →
          </a>
        </p>
      </section>
    </div>
  );
}
