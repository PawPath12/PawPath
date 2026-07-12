"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation";

export type FormState = { error?: string };

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, email, password, role, clinicName, city } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  if (role === "VET") {
    const clinic = await prisma.clinic.create({
      data: { name: clinicName!, city: city!, ownerUserId: user.id },
    });
    // The owner is also their clinic's first staff vet.
    await prisma.vet.create({
      data: { clinicId: clinic.id, name, userId: user.id },
    });
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/go" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created. Please log in." };
    }
    throw error; // re-throw the NEXT_REDIRECT
  }
  return {};
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/go",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error; // re-throw the NEXT_REDIRECT
  }
  return {};
}
