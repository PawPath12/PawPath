import { requireVetClinic } from "@/lib/rbac";
import { SubNav } from "@/components/SubNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { clinic } = await requireVetClinic();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4">
        <p className="text-sm text-slate-400">Clinic dashboard</p>
        <h1 className="text-xl font-bold text-slate-900">{clinic.name}</h1>
      </div>
      <SubNav
        items={[
          { href: "/dashboard", label: "Bookings" },
          { href: "/dashboard/services", label: "Services" },
          { href: "/dashboard/availability", label: "Availability" },
          { href: "/dashboard/staff", label: "Staff" },
          { href: "/dashboard/messages", label: "Messages" },
          { href: "/dashboard/profile", label: "Profile" },
        ]}
      />
      <div className="mt-6">{children}</div>
    </div>
  );
}
