import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Post-login dispatcher: sends each role to its home.
export default async function Go() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(session.user.role === "VET" ? "/dashboard" : "/account/pets");
}
