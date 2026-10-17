import Link from "next/link";

const TABS = [
  { key: "home", href: "/dashboard", label: "Dukaan" },
  { key: "menu", href: "/dashboard/menu", label: "Menu" },
  { key: "orders", href: "/dashboard/orders", label: "Orders" },
];

export default function DashNav({ active }: { active: "home" | "menu" | "orders" }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 border-b pb-3">
      <Link href="/" className="mr-2 text-orange-600">
        &larr; Website
      </Link>
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={
            t.key === active
              ? "rounded bg-orange-600 px-3 py-1 text-white"
              : "rounded border px-3 py-1 hover:bg-orange-50"
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}