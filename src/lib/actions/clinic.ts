"use server";

import { revalidatePath } from "next/cache";
import { requireVetClinic } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import {
  clinicProfileSchema,
  serviceSchema,
  staffSchema,
  availabilitySchema,
} from "@/lib/validation";

export type ActionState = { error?: string; ok?: boolean };

// --- Clinic profile ---
export async function updateClinicProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { clinic } = await requireVetClinic();
  const parsed = clinicProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, city, address, phone, description } = parsed.data;
  await prisma.clinic.update({
    where: { id: clinic.id },
    data: { name, city, address: address ?? "", phone: phone ?? "", description: description ?? "" },
  });
  revalidatePath("/dashboard/profile");
  revalidatePath(`/vets/${clinic.id}`);
  return { ok: true };
}

// --- Services ---
export async function createService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { clinic } = await requireVetClinic();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, description, price, durationMin } = parsed.data;
  await prisma.service.create({
    data: {
      clinicId: clinic.id,
      name,
      description: description ?? "",
      priceCents: Math.round(price * 100),
      durationMin,
    },
  });
  revalidatePath("/dashboard/services");
  revalidatePath(`/vets/${clinic.id}`);
  return { ok: true };
}

export async function updateService(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { clinic } = await requireVetClinic();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing || existing.clinicId !== clinic.id) return { error: "Service not found." };
  const { name, description, price, durationMin } = parsed.data;
  await prisma.service.update({
    where: { id },
    data: { name, description: description ?? "", priceCents: Math.round(price * 100), durationMin },
  });
  revalidatePath("/dashboard/services");
  revalidatePath(`/vets/${clinic.id}`);
  return { ok: true };
}

export async function deleteService(id: string) {
  const { clinic } = await requireVetClinic();
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing || existing.clinicId !== clinic.id) return { error: "Service not found." };
  await prisma.service.delete({ where: { id } });
  revalidatePath("/dashboard/services");
  revalidatePath(`/vets/${clinic.id}`);
  return { ok: true };
}

// --- Staff (vets) ---
export async function createStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { clinic } = await requireVetClinic();
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, specialties, bio } = parsed.data;
  const vet = await prisma.vet.create({
    data: { clinicId: clinic.id, name, specialties: specialties ?? "", bio: bio ?? "" },
  });
  // New staff inherit the standard weekday schedule so they're bookable immediately.
  await prisma.availability.createMany({
    data: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      clinicId: clinic.id,
      vetId: vet.id,
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
    })),
  });
  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard/availability");
  revalidatePath(`/vets/${clinic.id}`);
  return { ok: true };
}

export async function updateStaff(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { clinic } = await requireVetClinic();
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const existing = await prisma.vet.findUnique({ where: { id } });
  if (!existing || existing.clinicId !== clinic.id) return { error: "Staff member not found." };
  const { name, specialties, bio } = parsed.data;
  await prisma.vet.update({
    where: { id },
    data: { name, specialties: specialties ?? "", bio: bio ?? "" },
  });
  revalidatePath("/dashboard/staff");
  revalidatePath(`/vets/${clinic.id}`);
  return { ok: true };
}

export async function deleteStaff(id: string) {
  const { clinic } = await requireVetClinic();
  const existing = await prisma.vet.findUnique({
    where: { id },
    include: { _count: { select: { appointments: true } } },
  });
  if (!existing || existing.clinicId !== clinic.id) return { error: "Staff member not found." };
  const staffCount = await prisma.vet.count({ where: { clinicId: clinic.id } });
  if (staffCount <= 1) return { error: "A clinic needs at least one vet." };
  if (existing._count.appointments > 0)
    return { error: "This vet has appointments and can't be removed." };
  await prisma.vet.delete({ where: { id } });
  revalidatePath("/dashboard/staff");
  revalidatePath(`/vets/${clinic.id}`);
  return { ok: true };
}

// --- Availability ---
export async function addAvailability(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { clinic } = await requireVetClinic();
  const parsed = availabilitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { vetId, dayOfWeek, startTime, endTime } = parsed.data;
  if (startTime >= endTime) return { error: "End time must be after start time." };
  const vet = await prisma.vet.findUnique({ where: { id: vetId } });
  if (!vet || vet.clinicId !== clinic.id) return { error: "Vet not found." };
  await prisma.availability.create({
    data: { clinicId: clinic.id, vetId, dayOfWeek, startTime, endTime },
  });
  revalidatePath("/dashboard/availability");
  revalidatePath(`/vets/${clinic.id}`);
  return { ok: true };
}

export async function deleteAvailability(id: string) {
  const { clinic } = await requireVetClinic();
  const existing = await prisma.availability.findUnique({ where: { id } });
  if (!existing || existing.clinicId !== clinic.id) return { error: "Not found." };
  await prisma.availability.delete({ where: { id } });
  revalidatePath("/dashboard/availability");
  revalidatePath(`/vets/${clinic.id}`);
  return { ok: true };
}
