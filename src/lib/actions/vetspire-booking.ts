"use server";

import { requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import {
  listOnlineAppointmentTypes,
  availableTimes,
  bookAppointment,
  type VetspireAppointmentType,
  type VetspireSlot,
} from "@/lib/vetspire";

/** Split a single display name into given / family for Vetspire. */
function splitName(name: string): { givenName: string; familyName: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { givenName: parts[0], familyName: parts[0] };
  return { givenName: parts.slice(0, -1).join(" "), familyName: parts[parts.length - 1] };
}

async function requireVetspireClinic(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { id: true, bookingProvider: true, vetspireLocationId: true },
  });
  if (!clinic || clinic.bookingProvider !== "VETSPIRE" || !clinic.vetspireLocationId) {
    throw new Error("This clinic is not configured for Vetspire booking.");
  }
  return clinic;
}

/** Appointment types for a Vetspire clinic (used to populate the "service" step). */
export async function getVetspireAppointmentTypes(clinicId: string): Promise<VetspireAppointmentType[]> {
  const clinic = await requireVetspireClinic(clinicId);
  return listOnlineAppointmentTypes(clinic.vetspireLocationId!);
}

/** Open slots for a given appointment type + date. Called from the booking UI. */
export async function getVetspireSlots(
  clinicId: string,
  appointmentTypeId: string,
  date: string,
): Promise<{ ok: true; slots: VetspireSlot[] } | { ok: false; error: string }> {
  try {
    await requireClient();
    const clinic = await requireVetspireClinic(clinicId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "Invalid date." };
    const slots = await availableTimes(clinic.vetspireLocationId!, appointmentTypeId, date);
    return { ok: true, slots };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Create a real appointment in the clinic's Vetspire from a PawPath booking. */
export async function createVetspireBooking(formData: FormData) {
  const user = await requireClient();
  const clinicId = String(formData.get("clinicId") ?? "");
  const appointmentTypeId = String(formData.get("appointmentTypeId") ?? "");
  const startISO = String(formData.get("startISO") ?? "");
  const durationMin = Number(formData.get("durationMin") ?? 30);
  const providerId = (formData.get("providerId") as string) || null;
  const petId = String(formData.get("petId") ?? "");
  const reason = (formData.get("reason") as string) || "";

  // Client contact details — required so the Vetspire chart is complete.
  const phone = String(formData.get("phone") ?? "").trim();
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const addressLine2 = String(formData.get("addressLine2") ?? "").trim();
  const addressCity = String(formData.get("addressCity") ?? "").trim();
  const addressState = String(formData.get("addressState") ?? "").trim();
  const addressPostal = String(formData.get("addressPostal") ?? "").trim();

  if (!clinicId || !appointmentTypeId || !startISO || !petId) {
    return { error: "Missing booking details. Please pick a service, pet, and time." };
  }
  if (Number.isNaN(new Date(startISO).getTime())) return { error: "Invalid time." };
  if (!phone || !addressLine1 || !addressCity || !addressState || !addressPostal) {
    return { error: "Please fill in your phone number and full address so the clinic can set up your chart." };
  }

  const clinic = await requireVetspireClinic(clinicId);

  const [pet, dbUser] = await Promise.all([
    prisma.pet.findUnique({ where: { id: petId } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true, email: true } }),
  ]);
  if (!pet || pet.ownerId !== user.id) return { error: "Please choose one of your pets." };
  if (!dbUser) return { error: "Your account could not be loaded. Please sign in again." };

  // Persist the contact details on the account so they're pre-filled next time.
  await prisma.user.update({
    where: { id: user.id },
    data: { phone, addressLine1, addressLine2: addressLine2 || null, addressCity, addressState, addressPostal },
  });

  try {
    const apptId = await bookAppointment({
      locationId: clinic.vetspireLocationId!,
      appointmentTypeId,
      startISO,
      durationMin: Number.isFinite(durationMin) && durationMin > 0 ? durationMin : 30,
      providerId,
      reason: reason || `PawPath booking for ${pet.name}`,
      client: {
        email: dbUser.email,
        ...splitName(dbUser.name),
        contact: {
          phone,
          address: {
            line1: addressLine1,
            line2: addressLine2 || null,
            city: addressCity,
            state: addressState,
            postalCode: addressPostal,
          },
        },
      },
      pet: { name: pet.name, species: pet.species, breed: pet.breed },
    });
    return { ok: true as const, vetspireAppointmentId: apptId };
  } catch (e) {
    return { error: `Couldn't complete the booking: ${(e as Error).message}` };
  }
}
