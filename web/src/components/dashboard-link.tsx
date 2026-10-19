import Link from "next/link";
import { getSession } from "@/lib/session";

// Home par: provider ko "Dashboard", admin ko "Admin", customer ko "Apni dukaan kholo"
export default async function DashboardLink() {
  const session = await getSession();
  if (session.status !== "user") return null;

  const role = session.user.role;
  const href = role === "ADMIN" ? "/admin" : "/dashboard";
  const label = role === "ADMIN" ? "Admin" : role === "PROVIDER" ? "Dashboard" : "Apni dukaan kholo";

  return (
    <Link href={href} className="text-orange-600">
      {label}
    </Link>
  );
}