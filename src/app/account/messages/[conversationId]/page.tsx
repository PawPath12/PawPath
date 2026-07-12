import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { MessageThread } from "@/components/MessageThread";

export const dynamic = "force-dynamic";

export default async function ClientConversation({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const user = await requireClient();

  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      clinic: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!convo || convo.clientId !== user.id) notFound();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href="/account/messages" className="text-sm text-slate-500 hover:text-slate-800">
            ← All messages
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{convo.clinic.name}</h1>
        </div>
        <Link href={`/vets/${convo.clinic.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
          View clinic
        </Link>
      </div>
      <MessageThread
        conversationId={convo.id}
        meId={user.id}
        messages={convo.messages.map((m) => ({
          id: m.id,
          body: m.body,
          senderId: m.senderId,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
