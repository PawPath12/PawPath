import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

/** The role-appropriate set of links, reused for desktop and mobile layouts. */
function NavItems({ role, stacked }: { role?: string; stacked?: boolean }) {
  const linkClass = stacked
    ? "block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
    : "rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";

  return (
    <>
      <Link href="/vets" className={linkClass}>Find Vets</Link>

      {!role && (
        <>
          <Link
            href="/login?as=owner"
            className={stacked ? linkClass : "rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-ink"}
          >
            Owner Login
          </Link>
          <Link
            href="/login?as=vet"
            className={
              stacked
                ? "block rounded-lg bg-ink px-3 py-2 text-base font-semibold text-white"
                : "rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
            }
          >
            Vet Login
          </Link>
        </>
      )}

      {role === "CLIENT" && (
        <>
          <Link href="/account/pets" className={linkClass}>My Pets</Link>
          <Link href="/account/appointments" className={linkClass}>Appointments</Link>
          <Link href="/account/messages" className={linkClass}>Messages</Link>
          <SignOut stacked={stacked} />
        </>
      )}

      {role === "VET" && (
        <>
          <Link href="/dashboard" className={linkClass}>Dashboard</Link>
          <Link href="/dashboard/messages" className={linkClass}>Messages</Link>
          <SignOut stacked={stacked} />
        </>
      )}
    </>
  );
}

export async function Nav() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pawpath-logo.png" alt="PawPath" className="h-10 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1.5 md:flex">
          <NavItems role={role} />
        </div>

        {/* Mobile hamburger — pure-CSS disclosure, no client JS */}
        <details className="group relative md:hidden">
          <summary
            className="flex cursor-pointer list-none items-center rounded-md p-2 text-slate-700 hover:bg-slate-100 [&::-webkit-details-marker]:hidden"
            aria-label="Menu"
          >
            <svg className="h-6 w-6 group-open:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className="hidden h-6 w-6 group-open:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <NavItems role={role} stacked />
          </div>
        </details>
      </nav>
    </header>
  );
}

function SignOut({ stacked }: { stacked?: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
      className={stacked ? "block" : ""}
    >
      <button
        type="submit"
        className={
          stacked
            ? "w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-500 hover:bg-slate-100"
            : "rounded-md px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        }
      >
        Sign out
      </button>
    </form>
  );
}
