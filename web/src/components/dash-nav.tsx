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
    <nav className="-mx-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap border-b px-1 pb-3">
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
