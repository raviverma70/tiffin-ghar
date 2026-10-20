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
      ? "flex-1 rounded bg-orange-600 px-3 py-2 text-center font-semibold text-white"
      : "flex-1 rounded border px-3 py-2 text-center hover:bg-orange-50";

  return (
    <main className="mx-auto max-w-md p-6">
      <Link href="/" className="text-orange-600">
        &larr; {t("nav.back")}
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{t("login.title")}</h1>

      <div className="mt-4 flex gap-2">
        <Link href={`/login?as=customer${keep}`} className={tab("customer")}>
          {t("login.tabCustomer")}
        </Link>
        <Link href={`/login?as=provider${keep}`} className={tab("provider")}>
          {t("login.tabProvider")}
        </Link>
      </div>

      <p className="mt-4 text-gray-600">
        {role === "provider" ? t("login.introProvider") : t("login.introCustomer")}
      </p>

      <LoginForm key={role} next={target} />
    </main>
  );
}
