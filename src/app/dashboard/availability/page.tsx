import { requireVetClinic } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { AvailabilityManager, type SlotDTO } from "@/components/AvailabilityManager";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const { clinic } = await requireVetClinic();
  const [vets, slots] = await Promise.all([
    prisma.vet.findMany({ where: { clinicId: clinic.id }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.availability.findMany({
      where: { clinicId: clinic.id, vetId: { not: null } },
      select: { id: true, vetId: true, dayOfWeek: true, startTime: true, endTime: true },
    }),
  ]);

  const slotDto: SlotDTO[] = slots.map((s) => ({
    id: s.id,
    vetId: s.vetId as string,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Availability</h2>
      <p className="mt-1 text-sm text-slate-500">Set the weekly hours each vet is bookable. Clients can only book inside these windows.</p>
      <div className="mt-5">
        <AvailabilityManager vets={vets} slots={slotDto} />
      </div>
    </div>
  );
}
