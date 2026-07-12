import { requireClient } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PetsManager, type PetDTO } from "@/components/PetsManager";

export const dynamic = "force-dynamic";

export default async function PetsPage() {
  const user = await requireClient();
  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const dto: PetDTO[] = pets.map((p) => ({
    id: p.id,
    name: p.name,
    species: p.species,
    breed: p.breed,
    birthdate: p.birthdate ? p.birthdate.toISOString().slice(0, 10) : null,
    notes: p.notes,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Pets</h1>
      <p className="mt-1 text-sm text-slate-500">Keep your companions&apos; details handy for every visit.</p>
      <div className="mt-6">
        <PetsManager pets={dto} />
      </div>
    </div>
  );
}
