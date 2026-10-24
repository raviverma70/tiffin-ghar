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
    <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5 sm:flex-nowrap">
        <Link href="/" aria-label="Tiffin Ghar" className="shrink-0">
          <Logo />
        </Link>

        {/* Phone par logo ke neeche ek line, side me scroll; PC par right me */}
        <nav className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] items-center gap-1 overflow-x-auto whitespace-nowrap px-4 text-sm sm:mx-0 sm:w-auto sm:justify-end sm:overflow-visible sm:px-0">
          <LanguageSwitcher locale={locale} />
          {user ? (
            <>
              <Link
                href="/orders"
                className="rounded-full px-3 py-1.5 font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
              >
                {t("nav.myOrders")}
              </Link>
              <DashboardLink />
              <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 md:inline">
                📱 {user.phone}
              </span>
              <form action={logoutAction}>
                <button className="rounded-full border border-gray-300 px-3 py-1.5 font-medium text-gray-700 transition hover:border-orange-300 hover:bg-orange-50">
                  {t("nav.logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login?as=provider"
                className="rounded-full px-3 py-1.5 font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
              >
                {t("nav.openShop")}
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-orange-600 px-4 py-1.5 font-semibold text-white shadow-sm transition hover:bg-orange-700"
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
