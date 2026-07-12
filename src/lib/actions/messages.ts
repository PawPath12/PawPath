"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/db";

/** Client sends an inquiry to a clinic from its profile; opens a conversation. */
export async function messageClinic(clinicId: string, body: string) {
  const user = await requireUser();
  if (user.role !== "CLIENT") return { error: "Only pet owners can message clinics." };
  const text = body.trim();
  if (!text) return { error: "Message can't be empty." };

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return { error: "Clinic not found." };

  const convo = await prisma.conversation.upsert({
    where: { clinicId_clientId: { clinicId, clientId: user.id } },
    create: { clinicId, clientId: user.id },
    update: { updatedAt: new Date() },
  });

  await prisma.message.create({
    data: { conversationId: convo.id, senderId: user.id, senderRole: "CLIENT", body: text },
  });

  revalidatePath("/account/messages");
  revalidatePath("/dashboard/messages");
  return { ok: true, conversationId: convo.id };
}

/** Reply within an existing conversation (either the client or the clinic owner). */
export async function sendMessage(conversationId: string, body: string) {
  const user = await requireUser();
  const text = body.trim();
  if (!text) return { error: "Message can't be empty." };

  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { clinic: { select: { ownerUserId: true } } },
  });
  if (!convo) return { error: "Conversation not found." };

  const isClient = convo.clientId === user.id;
  const isOwner = convo.clinic.ownerUserId === user.id;
  if (!isClient && !isOwner) return { error: "Not authorized." };

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        senderRole: isClient ? "CLIENT" : "VET",
        body: text,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  revalidatePath(`/account/messages/${conversationId}`);
  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath("/account/messages");
  revalidatePath("/dashboard/messages");
  return { ok: true };
}
