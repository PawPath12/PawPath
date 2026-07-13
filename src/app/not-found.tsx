import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="" className="h-16 w-16 opacity-80" />
      <h1 className="mt-6 font-display text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you&apos;re looking for wandered off.</p>
      <Link
        href="/"
        className="mt-7 rounded-full bg-ink px-6 py-2.5 font-semibold text-white transition hover:bg-ink/90"
      >
        Back home
      </Link>
    </div>
  );
}
