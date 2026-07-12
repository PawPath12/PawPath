import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Returns the current session or null. */
export async function getSession() {
  return auth();
}

/** Requires any authenticated user; redirects to /login otherwise. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** Requires a CLIENT (pet owner). */
export async function requireClient() {
  const user = await requireUser();
  if (user.role !== "CLIENT") redirect("/dashboard");
  return user;
}

/**
 * Requires a VET and returns their owned clinic. Vets always have exactly one
 * clinic in the MVP (created at registration).
 */
export async function requireVetClinic() {
  const user = await requireUser();
  if (user.role !== "VET") redirect("/account/appointments");
  const clinic = await prisma.clinic.findUnique({
    where: { ownerUserId: user.id },
  });
  if (!clinic) redirect("/dashboard/profile");
  return { user, clinic };
}
