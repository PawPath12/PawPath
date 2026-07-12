"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { reviewSchema } from "@/lib/validation";

/** Recompute a clinic's denormalized rating from its reviews. */
async function refreshClinicRating(clinicId: string) {
  const agg = await prisma.review.aggregate({
    where: { clinicId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.clinic.update({
    where: { id: clinicId },
    data: {
      avgRating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      reviewCount: agg._count,
    },
  });
}

export async function submitReview(formData: FormData) {
  const user = await requireClient();
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { appointmentId, rating, comment } = parsed.data;

  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { review: true },
  });
  if (!appt || appt.clientId !== user.id) return { error: "Appointment not found." };
  if (appt.status !== "COMPLETED") return { error: "You can only review completed visits." };
  if (appt.review) return { error: "You already reviewed this visit." };

  await prisma.review.create({
    data: {
      clinicId: appt.clinicId,
      authorId: user.id,
      appointmentId: appt.id,
      rating,
      comment: comment ?? "",
    },
  });
  await refreshClinicRating(appt.clinicId);

  revalidatePath("/account/appointments");
  revalidatePath(`/vets/${appt.clinicId}`);
  return { ok: true };
}
