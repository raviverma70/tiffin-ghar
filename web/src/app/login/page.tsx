import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, safeNext } from "@/lib/session";
import { getT } from "@/i18n/server";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; as?: string }>;
}) {
  const { next, as } = await searchParams;
  const nextPath = safeNext(next);
  const { t } = await getT();

  // Tab: ?as= se, nahi to next dekhkar tay karo
  const role: "customer" | "provider" =
    as === "provider" || as === "customer"
      ? as
      : nextPath.startsWith("/start") || nextPath.startsWith("/dashboard")
        ? "provider"
        : "customer";

  // Provider tab me jab tak koi khaas page (jaise /orders) na ho, login ke baad /start
  const target = role === "provider" && nextPath === "/" ? "/start" : nextPath;

  // Pehle se login hai to seedha aage bhejo
  const session = await getSession();
  if (session.status === "user") redirect(target);

  // Tab badalte waqt khaas page yaad rakho (provider ke apne raaste nahi)
  const keep =
    nextPath !== "/" && !nextPath.startsWith("/start") && !nextPath.startsWith("/dashboard")
      ? `&next=${encodeURIComponent(nextPath)}`
      : "";

  const tab = (r: "customer" | "provider") =>
    r === role
      ? "flex-1 rounded-lg bg-white px-3 py-2 text-center font-semibold text-orange-700 shadow-sm"
      : "flex-1 rounded-lg px-3 py-2 text-center font-medium text-gray-600 hover:text-gray-900";

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <Link href="/" className="text-sm text-orange-700 hover:underline">
        &larr; {t("nav.back")}
      </Link>

      <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-4xl" aria-hidden>
          {role === "provider" ? "🏪" : "🍱"}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{t("login.title")}</h1>

        <div className="mt-4 flex gap-1 rounded-xl bg-gray-100 p-1">
          <Link href={`/login?as=customer${keep}`} className={tab("customer")} aria-current={role === "customer" ? "page" : undefined}>
            {t("login.tabCustomer")}
          </Link>
          <Link href={`/login?as=provider${keep}`} className={tab("provider")} aria-current={role === "provider" ? "page" : undefined}>
            {t("login.tabProvider")}
          </Link>
        </div>

        <p className="mt-4 text-gray-600">
          {role === "provider" ? t("login.introProvider") : t("login.introCustomer")}
        </p>

        <LoginForm key={role} next={target} />

        <p className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">🔒 {t("login.secure")}</p>
      </div>
    </main>
  );
}
