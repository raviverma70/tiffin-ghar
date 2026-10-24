import Link from "next/link";
import { getT } from "@/i18n/server";
import type { MessageKey } from "@/i18n/messages/hinglish";

type Tab = "orders" | "subs" | "favs";

const TABS: { key: Tab; href: string; label: MessageKey; icon: string }[] = [
  { key: "orders", href: "/orders", label: "cnav.orders", icon: "🧾" },
  { key: "subs", href: "/subscriptions", label: "cnav.subs", icon: "🗓️" },
  { key: "favs", href: "/favourites", label: "cnav.favs", icon: "♥" },
];

// Customer ke pages ke upar: Orders / Subscriptions / Pasandida
export default async function CustomerNav({ active }: { active: Tab }) {
  const { t } = await getT();
  return (
    <nav className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto whitespace-nowrap px-1 pb-1">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={
            tab.key === active
              ? "rounded-full bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm"
              : "rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-orange-50"
          }
        >
          <span aria-hidden>{tab.icon}</span> {t(tab.label)}
        </Link>
      ))}
    </nav>
  );
}
