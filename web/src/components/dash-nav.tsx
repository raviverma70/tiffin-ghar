import Link from "next/link";
import { getT } from "@/i18n/server";
import type { MessageKey } from "@/i18n/messages/hinglish";

const TABS: { key: "home" | "menu" | "orders" | "reviews"; href: string; label: MessageKey }[] = [
  { key: "home", href: "/dashboard", label: "dash.tabHome" },
  { key: "menu", href: "/dashboard/menu", label: "dash.tabMenu" },
  { key: "orders", href: "/dashboard/orders", label: "dash.tabOrders" },
  { key: "reviews", href: "/dashboard/reviews", label: "dash.tabReviews" },
];

export default async function DashNav({
  active,
}: {
  active: "home" | "menu" | "orders" | "reviews";
}) {
  const { t } = await getT();

  return (
    <nav className="flex flex-wrap items-center gap-2 border-b pb-3">
      <Link href="/" className="mr-2 text-orange-600">
        &larr; {t("nav.website")}
      </Link>
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={
            tab.key === active
              ? "rounded bg-orange-600 px-3 py-1 text-white"
              : "rounded border px-3 py-1 hover:bg-orange-50"
          }
        >
          {t(tab.label)}
        </Link>
      ))}
    </nav>
  );
}
