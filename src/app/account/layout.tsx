import { requireClient } from "@/lib/rbac";
import { SubNav } from "@/components/SubNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireClient();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SubNav
        items={[
          { href: "/account/pets", label: "My Pets" },
          { href: "/account/appointments", label: "Appointments" },
          { href: "/account/messages", label: "Messages" },
        ]}
      />
      <div className="mt-6">{children}</div>
    </div>
  );
}
