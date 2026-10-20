import Link from "next/link";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/login/actions";
import { getT } from "@/i18n/server";
import DashboardLink from "@/components/dashboard-link";
import LanguageSwitcher from "@/components/language-switcher";
import Logo from "@/components/logo";

export default async function SiteHeader() {
  const session = await getSession();
  const user = session.status === "user" ? session.user : null;
  const { t, locale } = await getT();

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="Tiffin Ghar">
          <Logo />
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <LanguageSwitcher locale={locale} />
          {user ? (
            <>
              <Link href="/orders" className="hover:text-orange-600">
                {t("nav.myOrders")}
              </Link>
              <DashboardLink />
              <span className="hidden text-gray-500 sm:inline">{user.phone}</span>
              <form action={logoutAction}>
                <button className="rounded border px-3 py-1 hover:bg-orange-50">{t("nav.logout")}</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login?as=provider" className="hover:text-orange-600">
                {t("nav.openShop")}
              </Link>
              <Link
                href="/login"
                className="rounded bg-orange-600 px-3 py-1.5 font-medium text-white hover:bg-orange-700"
              >
                {t("nav.login")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
