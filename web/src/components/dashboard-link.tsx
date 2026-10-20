import Link from "next/link";
import { getSession } from "@/lib/session";
import { getT } from "@/i18n/server";

// Header me: provider ko "Dashboard", admin ko "Admin", customer ko "Apni dukaan kholo"
export default async function DashboardLink() {
  const session = await getSession();
  if (session.status !== "user") return null;

  const { t } = await getT();
  const role = session.user.role;
  const href = role === "ADMIN" ? "/admin" : "/dashboard";
  const label =
    role === "ADMIN" ? t("nav.admin") : role === "PROVIDER" ? t("nav.dashboard") : t("nav.startShop");

  return (
    <Link href={href} className="text-orange-600">
      {label}
    </Link>
  );
}
