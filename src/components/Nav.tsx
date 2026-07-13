import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

export async function Nav() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pawpath-logo.png" alt="PawPath" className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-1.5">
          <NavLink href="/vets">Find Vets</NavLink>

          {!user && (
            <>
              <Link
                href="/login?as=owner"
                className="rounded-lg border border-accent-600 px-3.5 py-2 text-sm font-semibold text-accent-700 transition hover:bg-accent-50"
              >
                Owner Login
              </Link>
              <Link
                href="/login?as=vet"
                className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Vet Login
              </Link>
            </>
          )}

          {user?.role === "CLIENT" && (
            <>
              <NavLink href="/account/pets">My Pets</NavLink>
              <NavLink href="/account/appointments">Appointments</NavLink>
              <NavLink href="/account/messages">Messages</NavLink>
              <SignOut />
            </>
          )}

          {user?.role === "VET" && (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/dashboard/messages">Messages</NavLink>
              <SignOut />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="rounded-md px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        Sign out
      </button>
    </form>
  );
}
