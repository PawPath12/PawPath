import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — PawPath for Clinics",
  description:
    "Simple monthly plans for veterinary clinics on PawPath. List your clinic, take bookings online, and get discovered — starting with 2 months free. Online booking included in every plan.",
};

type Tier = {
  name: string;
  icon: string;
  tagline: string;
  price: number;
  cta: string;
  featured?: boolean;
  featsLabel: string;
  feats: { text: string; on: boolean }[];
};

const TIERS: Tier[] = [
  {
    name: "Host",
    icon: "🐾",
    tagline: "Just get your clinic on PawPath",
    price: 99,
    cta: "Start free trial",
    featsLabel: "Includes",
    feats: [
      { text: "Public clinic profile", on: true },
      { text: "Show up in local search", on: true },
      { text: "Online booking built in", on: true },
      { text: "1 veterinarian", on: true },
      { text: "Up to 3 services", on: true },
      { text: "Client messaging", on: false },
      { text: "Reviews & ratings", on: false },
      { text: "Email support", on: true },
    ],
  },
  {
    name: "Grow",
    icon: "⭐",
    tagline: "Get & manage more clients",
    price: 179,
    cta: "Start free trial",
    featured: true,
    featsLabel: "Everything in Host, plus",
    feats: [
      { text: "Up to 5 veterinarians", on: true },
      { text: "Unlimited services", on: true },
      { text: "Client messaging", on: true },
      { text: "Reviews & ratings", on: true },
      { text: "Booking analytics", on: true },
      { text: "Boosted search placement", on: true },
      { text: "Priority support", on: true },
    ],
  },
  {
    name: "Pro",
    icon: "👑",
    tagline: "Full-scale & multi-doctor practices",
    price: 229,
    cta: "Start free trial",
    featsLabel: "Everything in Grow, plus",
    feats: [
      { text: "Unlimited veterinarians", on: true },
      { text: "Featured — top of search results", on: true },
      { text: "Practice-management integration (Vetspire)", on: true },
      { text: "Multiple locations", on: true },
      { text: "Monthly performance reports", on: true },
      { text: "Priority support + onboarding call", on: true },
    ],
  },
];

const FAQS = [
  {
    q: "Is it really free for 2 months?",
    a: "Yes. You won't be charged for the first two months. We ask for a card at signup so your service continues seamlessly — cancel anytime before the trial ends and pay nothing.",
  },
  {
    q: "Why do you need my card upfront?",
    a: "So there's no gap in your listing when the trial ends. Nothing is charged until day 61, and we'll remind you before that first payment.",
  },
  {
    q: "Can I change plans later?",
    a: "Anytime. Upgrade as your practice grows or downgrade if you need to — the change takes effect on your next billing date.",
  },
  {
    q: "Can I cancel whenever I want?",
    a: "Yes — no long-term contract. Cancel in a couple of clicks from your dashboard and you won't be billed again.",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink to-brand-900/40" />
        <div className="mx-auto max-w-3xl px-4 pb-44 pt-16 text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-inset ring-white/25 backdrop-blur">
            Plans for Clinics
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
            Pricing that pays for itself
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/80">
            List your clinic, get discovered by local pet owners, and take bookings online — for a
            fraction of what the big platforms charge. Online booking is included in every plan.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-400/15 px-5 py-2.5 text-sm font-medium text-brand-50">
            🐾 Every plan starts with 2 months free — cancel anytime before you&apos;re charged
          </div>
        </div>
      </section>

      {/* Cards */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="-mt-36 grid items-end gap-5 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={
                (t.featured
                  ? "border-2 border-brand-600 md:-translate-y-4 "
                  : "border border-slate-200 ") +
                "relative flex flex-col rounded-3xl bg-white p-7 shadow-xl shadow-ink/10"
              }
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                  Most Popular
                </span>
              )}
              <div className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                {t.icon} {t.name}
              </div>
              <p className="mt-1.5 min-h-[40px] text-sm text-slate-500">{t.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="self-start pt-1.5 text-2xl font-semibold text-ink">$</span>
                <span className="font-display text-5xl font-bold tabular-nums text-ink">{t.price}</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="mt-3 text-sm font-medium text-brand-700">First 2 months free</p>

              <Link
                href="/register"
                className={
                  (t.featured
                    ? "bg-brand-600 text-white hover:bg-brand-700 "
                    : "border border-slate-200 text-ink hover:border-brand-500 hover:text-brand-700 ") +
                  "mt-6 mb-6 block rounded-xl px-4 py-3 text-center font-semibold transition"
                }
              >
                {t.cta}
              </Link>

              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                {t.featsLabel}
              </p>
              <ul className="grid gap-2.5">
                {t.feats.map((f) => (
                  <li
                    key={f.text}
                    className={
                      "flex items-start gap-2.5 text-sm " +
                      (f.on ? "text-slate-700" : "text-slate-400")
                    }
                  >
                    <span
                      className={
                        "mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full text-[11px] font-bold " +
                        (f.on
                          ? "bg-brand-50 text-brand-700"
                          : "border border-slate-200 text-slate-300")
                      }
                    >
                      {f.on ? "✓" : "–"}
                    </span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Prices are in USD and subject to change. Current subscribers will be notified before any
          price change takes effect.
        </p>

        {/* Value strip */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-brand-50 p-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Online booking, included — not a $200 add-on
            </h2>
            <p className="mt-2 text-slate-600">
              Other platforms start around <strong>$249/month</strong> and charge roughly{" "}
              <strong>$200 more</strong> just to add online booking. On PawPath, taking appointments
              online is built into every plan — even your top tier costs less than their starting
              price.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-7 py-5 text-center">
            <div className="font-display text-3xl font-bold text-brand-700">$0</div>
            <div className="mt-1 text-xs text-slate-500">extra for online booking</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">
            Questions, answered
          </h2>
          <p className="mt-2 text-center text-slate-500">
            The stuff every clinic asks before signing up.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-ink">{f.q}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mb-20 mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-ink to-brand-900 p-12 text-center text-white">
          <h2 className="font-display text-3xl font-semibold">Ready to be found?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Join the clinics helping pet owners book care in seconds. Two months free — no risk.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 font-semibold text-brand-800 transition hover:bg-brand-50"
          >
            Start your free trial
          </Link>
          <p className="mt-6 font-display italic text-brand-100">
            Never feel lost when it matters most.
          </p>
        </div>
      </div>
    </div>
  );
}
