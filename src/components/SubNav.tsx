"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SubNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  // Active = the item whose href is the longest prefix of the current path,
  // so "/dashboard" doesn't stay lit on "/dashboard/services".
  const bestHref = items
    .filter((it) => pathname === it.href || pathname.startsWith(it.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <nav className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {items.map((it) => {
        const active = it.href === bestHref;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              active ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
