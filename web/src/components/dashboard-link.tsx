import Link from "next/link";
import { getSession } from "@/lib/session";

// Home par: provider ko "Dashboard", customer ko "Apni dukaan kholo"
export default async function DashboardLink() {
  const session = await getSession();
  if (session.status !== "user") return null;

  const isProvider = session.user.role === "PROVIDER";
  return (
    <Link href="/dashboard" className="text-orange-600">
      {isProvider ? "Dashboard" : "Apni dukaan kholo"}
    </Link>
  );
}