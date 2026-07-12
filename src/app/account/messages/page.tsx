import Link from "next/link";
import { requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await requireClient();
  const conversations = await prisma.conversation.findMany({
    where: { clientId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      clinic: { select: { id: true, name: true, city: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
      {conversations.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-5xl">💬</p>
          <p className="mt-4 text-lg font-medium text-slate-700">No conversations yet</p>
          <Link href="/vets" className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
            Message a clinic from its profile →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/account/messages/${c.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{c.clinic.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {c.messages[0]?.body ?? "No messages yet"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{formatDateTime(c.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
