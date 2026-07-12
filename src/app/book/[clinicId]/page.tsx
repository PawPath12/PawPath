import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { BookingWizard } from "@/components/BookingWizard";
import type { Window } from "@/lib/slots";

export const dynamic = "force-dynamic";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ clinicId: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { clinicId } = await params;
  const { serviceId } = await searchParams;
  const user = await requireClient();

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      services: { orderBy: { priceCents: "asc" } },
      vets: { orderBy: { name: "asc" } },
      availability: { select: { vetId: true, dayOfWeek: true, startTime: true, endTime: true } },
    },
  });
  if (!clinic) notFound();

  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, species: true },
  });

  const busy = await prisma.appointment.findMany({
    where: {
      clinicId,
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    },
    select: { vetId: true, startAt: true, endAt: true },
  });

  // Group availability + busy times per vet (clinic-wide windows apply to all vets).
  const clinicWindows: Window[] = clinic.availability
    .filter((a) => a.vetId === null)
    .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }));

  const availabilityByVet: Record<string, Window[]> = {};
  const busyByVet: Record<string, { startAt: string; endAt: string }[]> = {};
  for (const v of clinic.vets) {
    availabilityByVet[v.id] = [
      ...clinicWindows,
      ...clinic.availability
        .filter((a) => a.vetId === v.id)
        .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime })),
    ];
    busyByVet[v.id] = busy
      .filter((b) => b.vetId === v.id)
      .map((b) => ({ startAt: b.startAt.toISOString(), endAt: b.endAt.toISOString() }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/vets/${clinic.id}`} className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to {clinic.name}
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Book an appointment</h1>
      <p className="mt-1 text-slate-500">{clinic.name} · 📍 {clinic.city}</p>

      {pets.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-lg font-medium text-amber-800">Add a pet first</p>
          <p className="mt-1 text-sm text-amber-700">You&apos;ll need at least one pet on file to book a visit.</p>
          <Link href="/account/pets" className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Add a pet
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <BookingWizard
            clinicId={clinic.id}
            services={clinic.services.map((s) => ({
              id: s.id,
              name: s.name,
              priceCents: s.priceCents,
              durationMin: s.durationMin,
            }))}
            vets={clinic.vets.map((v) => ({ id: v.id, name: v.name, specialties: v.specialties }))}
            pets={pets}
            availabilityByVet={availabilityByVet}
            busyByVet={busyByVet}
            preselectServiceId={serviceId ?? null}
          />
        </div>
      )}
    </div>
  );
}
