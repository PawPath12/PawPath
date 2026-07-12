import Link from "next/link";
import { requireVetClinic } from "@/lib/rbac";
import { ClinicProfileForm } from "@/components/ClinicProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { clinic } = await requireVetClinic();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Clinic profile</h2>
        <Link href={`/vets/${clinic.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
          View public page →
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-500">This is what pet owners see when they find your clinic.</p>
      <div className="mt-5">
        <ClinicProfileForm
          clinic={{
            name: clinic.name,
            city: clinic.city,
            address: clinic.address,
            phone: clinic.phone,
            description: clinic.description,
          }}
        />
      </div>
    </div>
  );
}
