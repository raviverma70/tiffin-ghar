import Link from "next/link";
import { getT } from "@/i18n/server";
import Logo from "@/components/logo";

export default async function SiteFooter() {
  const { t } = await getT();

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/orders", label: t("nav.myOrders") },
    { href: "/subscriptions", label: t("cnav.subs") },
    { href: "/login?as=provider", label: t("nav.openShop") },
  ];

  return (
    <footer className="mt-16 border-t border-orange-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2">
        <div>
          <Logo />
          <p className="mt-2 max-w-sm text-sm text-gray-600">{t("footer.tagline")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("footer.links")}</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-gray-700 hover:text-orange-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-gray-100 py-4 text-center text-xs text-gray-500">
        {t("footer.copy", { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
}
