"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { petSchema } from "@/lib/validation";

export type PetFormState = { error?: string; ok?: boolean };

export async function createPet(_prev: PetFormState, formData: FormData): Promise<PetFormState> {
  const user = await requireClient();
  const parsed = petSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, species, breed, birthdate, notes } = parsed.data;

  await prisma.pet.create({
    data: {
      ownerId: user.id,
      name,
      species,
      breed: breed || null,
      birthdate: birthdate ? new Date(birthdate) : null,
      notes: notes ?? "",
    },
  });
  revalidatePath("/account/pets");
  return { ok: true };
}

export async function updatePet(id: string, _prev: PetFormState, formData: FormData): Promise<PetFormState> {
  const user = await requireClient();
  const parsed = petSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, species, breed, birthdate, notes } = parsed.data;

  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet || pet.ownerId !== user.id) return { error: "Pet not found." };

  await prisma.pet.update({
    where: { id },
    data: {
      name,
      species,
      breed: breed || null,
      birthdate: birthdate ? new Date(birthdate) : null,
      notes: notes ?? "",
    },
  });
  revalidatePath("/account/pets");
  return { ok: true };
}

export async function deletePet(id: string) {
  const user = await requireClient();
  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet || pet.ownerId !== user.id) return { error: "Pet not found." };
  await prisma.pet.delete({ where: { id } });
  revalidatePath("/account/pets");
  return { ok: true };
}
