"use client";

import { useRef, useState } from "react";

// Posts directly into the clinic's existing Google Form so entries still land
// in its Responses / linked Sheet — but with a fully branded PawPath UI.
const FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSfmXnqiLeVjIhFlVqJdJ7AmEF8kozTx1HV-QvHgGS_CSiAtXw/formResponse";

const ROLES = [
  "Practice Owner",
  "Veterinarian",
  "Practice Manager",
  "Veterinary Technician/Nurse",
  "Veterinary Assistant",
];
const LUNCH = ["Yes", "Maybe, send me more information", "Not sure yet"];
const HEARD = ["New York Vet Show", "Colleague/Friend", "Social Media"];

const field =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const label = "block text-sm font-semibold text-ink";

export function GiveawayForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const pending = useRef(false);

  if (done) {
    return (
      <div className="rounded-3xl border border-brand-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
          🎉
        </div>
        <h2 className="mt-5 font-display text-3xl font-semibold text-ink">You&apos;re entered!</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Thanks for entering the PawPath giveaway. Winners will be contacted by email —
          good luck! 🐾
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-6 text-sm font-semibold text-brand-700 hover:underline"
        >
          Submit another entry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Hidden iframe catches Google's response so the page doesn't navigate away */}
      <iframe
        name="gform_sink"
        title="hidden"
        className="hidden"
        onLoad={() => {
          if (pending.current) {
            pending.current = false;
            setSubmitting(false);
            setDone(true);
          }
        }}
      />
      <form
        action={FORM_ACTION}
        method="POST"
        target="gform_sink"
        onSubmit={() => {
          pending.current = true;
          setSubmitting(true);
        }}
        className="grid gap-5"
      >
        <input type="hidden" name="fvv" value="1" />
        <input type="hidden" name="pageHistory" value="0" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="name">First &amp; Last Name <span className="text-rose-500">*</span></label>
            <input id="name" name="entry.1790717430" required className={field} placeholder="Jane Doe" />
          </div>
          <div>
            <label className={label} htmlFor="email">Email Address <span className="text-rose-500">*</span></label>
            <input id="email" name="entry.768808695" type="email" required className={field} placeholder="jane@clinic.com" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="clinic">Veterinary Practice / Company <span className="text-rose-500">*</span></label>
            <input id="clinic" name="entry.767591972" required className={field} placeholder="Central Park Animal Hospital" />
          </div>
          <div>
            <label className={label} htmlFor="phone">Phone Number</label>
            <input id="phone" name="entry.486267486" type="tel" className={field} placeholder="(212) 555-0100" />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="role">What is your role? <span className="text-rose-500">*</span></label>
          <select id="role" name="entry.1431472099" required defaultValue="" className={field}>
            <option value="" disabled>Select one…</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="lunch">
            Would your practice be interested in a complimentary Lunch &amp; Learn? <span className="text-rose-500">*</span>
          </label>
          <select id="lunch" name="entry.1419873777" required defaultValue="" className={field}>
            <option value="" disabled>Select one…</option>
            {LUNCH.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="heard">How did you hear about PawPath? <span className="text-rose-500">*</span></label>
          <select id="heard" name="entry.992234503" required defaultValue="" className={field}>
            <option value="" disabled>Select one…</option>
            {HEARD.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-brand-600 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Entering…" : "Enter the Giveaway 🎁"}
        </button>
        <p className="text-center text-xs text-slate-400">
          We&apos;ll only use your info to contact giveaway winners and about PawPath.
        </p>
      </form>
    </div>
  );
}
