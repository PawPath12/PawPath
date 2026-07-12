import { requireVetClinic } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { StaffManager, type StaffDTO } from "@/components/StaffManager";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const { clinic } = await requireVetClinic();
  const staff = await prisma.vet.findMany({
    where: { clinicId: clinic.id },
    orderBy: { name: "asc" },
  });

  const dto: StaffDTO[] = staff.map((s) => ({
    id: s.id,
    name: s.name,
    specialties: s.specialties,
    bio: s.bio,
  }));

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Staff &amp; doctors</h2>
      <p className="mt-1 text-sm text-slate-500">Add the veterinarians clients can book with.</p>
      <div className="mt-5">
        <StaffManager staff={dto} />
      </div>
    </div>
  );
}
