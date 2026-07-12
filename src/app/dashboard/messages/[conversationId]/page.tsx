import Link from "next/link";
import { notFound } from "next/navigation";
import { requireVetClinic } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { MessageThread } from "@/components/MessageThread";

export const dynamic = "force-dynamic";

export default async function DashboardConversation({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const { user, clinic } = await requireVetClinic();

  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      client: { select: { name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!convo || convo.clinicId !== clinic.id) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href="/dashboard/messages" className="text-sm text-slate-500 hover:text-slate-800">
          ← All messages
        </Link>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{convo.client.name}</h2>
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
