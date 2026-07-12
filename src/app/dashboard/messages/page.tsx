import Link from "next/link";
import { requireVetClinic } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardMessages() {
  const { clinic } = await requireVetClinic();
  const conversations = await prisma.conversation.findMany({
    where: { clinicId: clinic.id },
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Messages</h2>
      {conversations.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No client messages yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/messages/${c.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{c.client.name}</p>
                  <p className="truncate text-sm text-slate-500">{c.messages[0]?.body ?? "No messages yet"}</p>
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
