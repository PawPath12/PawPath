"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { loginAction, type FormState } from "@/lib/actions/auth";

const initial: FormState = {};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const as = useSearchParams().get("as");
  const isVet = as === "vet";

  const accent = isVet
    ? { btn: "bg-brand-600 hover:bg-brand-700", ring: "focus:border-brand-500 focus:ring-brand-100", link: "text-brand-700" }
    : { btn: "bg-accent-600 hover:bg-accent-700", ring: "focus:border-accent-500 focus:ring-accent-100", link: "text-accent-700" };

  const inputCls = `rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 ${accent.ring}`;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isVet ? "bg-brand-50 text-brand-700" : "bg-accent-50 text-accent-700"
          }`}
        >
          {isVet ? "🏥 Vet & clinic" : "🐾 Pet owner"}
        </span>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {isVet ? "Clinic login" : "Owner login"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isVet ? "Manage your clinic, schedule, and bookings." : "Log in to manage your pets and appointments."}
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Email
          <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@example.com" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Password
          <input name="password" type="password" required autoComplete="current-password" className={inputCls} placeholder="••••••••" />
        </label>

        {state.error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`rounded-lg px-4 py-2.5 font-semibold text-white transition disabled:opacity-60 ${accent.btn}`}
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-500">
        <p className="font-medium text-slate-600">Demo login (password: <code>password123</code>)</p>
        <p className="mt-1">
          {isVet ? <>Vet: <code>happy@demo.com</code></> : <>Pet owner: <code>alice@demo.com</code></>}
        </p>
      </div>

      <div className="flex justify-center gap-4 text-sm text-slate-500">
        <Link href="/register" className={`font-semibold hover:underline ${accent.link}`}>
          Create an account
        </Link>
        <span className="text-slate-300">·</span>
        <Link href={isVet ? "/login?as=owner" : "/login?as=vet"} className="font-medium text-slate-500 hover:text-slate-800 hover:underline">
          {isVet ? "I'm a pet owner" : "I'm a vet / clinic"}
        </Link>
      </div>
    </div>
  );
}
