"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction, type FormState } from "@/lib/actions/auth";

const initial: FormState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const [role, setRole] = useState<"CLIENT" | "VET">("CLIENT");

  const input =
    "rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join PawPath as a pet owner or a clinic.</p>
      </div>

      <form action={action} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {(["CLIENT", "VET"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                role === r ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r === "CLIENT" ? "🐾 Pet owner" : "🏥 Vet / clinic"}
            </button>
          ))}
        </div>
        <input type="hidden" name="role" value={role} />

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          {role === "VET" ? "Your name" : "Full name"}
          <input name="name" required className={input} placeholder="Jane Doe" />
        </label>

        {role === "VET" && (
          <>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Clinic name
              <input name="clinicName" required className={input} placeholder="Happy Paws Veterinary" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              City
              <input name="city" required className={input} placeholder="San Francisco" />
            </label>
          </>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Email
          <input name="email" type="email" required autoComplete="email" className={input} placeholder="you@example.com" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Password
          <input name="password" type="password" required minLength={6} autoComplete="new-password" className={input} placeholder="At least 6 characters" />
        </label>

        {state.error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
