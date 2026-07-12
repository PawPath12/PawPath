import { requireVetClinic } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { ServicesManager, type ServiceDTO } from "@/components/ServicesManager";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const { clinic } = await requireVetClinic();
  const services = await prisma.service.findMany({
    where: { clinicId: clinic.id },
    orderBy: { priceCents: "asc" },
  });

  const dto: ServiceDTO[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: (s.priceCents / 100).toString(),
    durationMin: s.durationMin,
  }));

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Services &amp; pricing</h2>
      <p className="mt-1 text-sm text-slate-500">These appear on your public profile and in the booking flow.</p>
      <div className="mt-5">
        <ServicesManager services={dto} />
      </div>
    </div>
  );
}
