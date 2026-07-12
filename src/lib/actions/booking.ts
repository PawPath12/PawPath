"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { bookingSchema } from "@/lib/validation";
import { isSlotBookable, type Window, type Busy } from "@/lib/slots";

/** Load a vet's availability windows and current bookings (for collision checks). */
async function loadVetSchedule(clinicId: string, vetId: string) {
  const [windows, busy] = await Promise.all([
    prisma.availability.findMany({
      where: { clinicId, OR: [{ vetId }, { vetId: null }] },
      select: { dayOfWeek: true, startTime: true, endTime: true },
    }),
    prisma.appointment.findMany({
      where: { vetId, status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] } },
      select: { startAt: true, endAt: true },
    }),
  ]);
  return { windows: windows as Window[], busy: busy as Busy[] };
}

export async function createBooking(formData: FormData) {
  const user = await requireClient();
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { clinicId, serviceId, vetId, petId, startAt, notes } = parsed.data;

  const [service, vet, pet] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.vet.findUnique({ where: { id: vetId } }),
    prisma.pet.findUnique({ where: { id: petId } }),
  ]);

  if (!service || service.clinicId !== clinicId) return { error: "Service not found." };
  if (!vet || vet.clinicId !== clinicId) return { error: "Vet not found." };
  if (!pet || pet.ownerId !== user.id) return { error: "Please choose one of your pets." };

  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return { error: "Invalid time." };
  const end = new Date(start.getTime() + service.durationMin * 60_000);

  // Re-validate the slot on the server to prevent double-booking.
  const { windows, busy } = await loadVetSchedule(clinicId, vetId);
  if (!isSlotBookable(start, service.durationMin, windows, busy)) {
    return { error: "Sorry, that time was just taken. Please pick another slot." };
  }

  const appt = await prisma.appointment.create({
    data: {
      clientId: user.id,
      petId,
      clinicId,
      vetId,
      serviceId,
      startAt: start,
      endAt: end,
      status: "PENDING",
      notes: notes ?? "",
    },
  });

  revalidatePath("/account/appointments");
  revalidatePath("/dashboard");
  return { ok: true, appointmentId: appt.id };
}

/** Client cancels their own upcoming appointment. */
export async function cancelAppointment(id: string) {
  const user = await requireClient();
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt || appt.clientId !== user.id) return { error: "Appointment not found." };
  if (appt.status === "COMPLETED") return { error: "Completed visits can't be cancelled." };
  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/account/appointments");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Clinic owner changes an appointment's status. */
export async function setAppointmentStatus(
  id: string,
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED",
) {
  const user = await requireUser();
  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { clinic: { select: { ownerUserId: true } } },
  });
  if (!appt || appt.clinic.ownerUserId !== user.id) return { error: "Not authorized." };
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard");
  revalidatePath("/account/appointments");
  return { ok: true };
}
