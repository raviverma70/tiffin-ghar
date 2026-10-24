import Link from "next/link";
import { getT } from "@/i18n/server";
import type { MessageKey } from "@/i18n/messages/hinglish";

type Tab = "home" | "menu" | "plans" | "orders" | "subs" | "reviews";

const TABS: { key: Tab; href: string; label: MessageKey }[] = [
  { key: "home", href: "/dashboard", label: "dash.tabHome" },
  { key: "menu", href: "/dashboard/menu", label: "dash.tabMenu" },
  { key: "plans", href: "/dashboard/plans", label: "dash.tabPlans" },
  { key: "orders", href: "/dashboard/orders", label: "dash.tabOrders" },
  { key: "subs", href: "/dashboard/subscriptions", label: "dash.tabSubs" },
  { key: "reviews", href: "/dashboard/reviews", label: "dash.tabReviews" },
];

export default async function DashNav({
  active,
}: {
  active: Tab;
}) {
  const { t } = await getT();

  return (
    <nav className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap border-b px-1 pb-3">
      <Link href="/" className="mr-2 text-orange-600">
        &larr; {t("nav.website")}
      </Link>
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={
            tab.key === active
              ? "rounded-full bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm"
              : "rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-orange-50"
          }
        >
          {t(tab.label)}
        </Link>
      ))}
    </nav>
  );
}
