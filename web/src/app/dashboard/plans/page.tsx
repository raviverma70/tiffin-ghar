import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import { MEAL_ICON, MEAL_SHORT_KEY, menuSlots, type ProviderPlan } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import PlanForm from "./plan-form";

export default async function PlansPage() {
  const { t } = await getT();
  await requireProviderUser("/dashboard/plans");

  const res = await providerFetch("/providers/me/plans", { mode: "page", returnTo: "/dashboard/plans" });
  const plans = res.ok ? ((await res.json()) as { items: ProviderPlan[] }).items : null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <DashNav active="plans" />

      <h1 className="mt-6 text-2xl font-bold text-gray-900">{t("plans.title")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t("plans.hint")}</p>

      {!plans && <p className="mt-4 text-red-600">{t("plans.loadFail")}</p>}
      {plans && plans.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed bg-white p-4 text-gray-600">{t("plans.empty")}</p>
      )}

      {plans && plans.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => {
            const total = menuSlots(plan);
            const done = plan.dayMenus.length;
            return (
              <li key={plan.id}>
                <Link
                  href={`/dashboard/plans/${plan.id}`}
                  className="block h-full rounded-xl border bg-white p-4 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-gray-900">{plan.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                        plan.isActive ? "bg-green-50 text-green-700 ring-green-200" : "bg-gray-100 text-gray-600 ring-gray-200"
                      }`}
                    >
                      {plan.isActive ? t("plans.active") : t("plans.inactive")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {t("plans.daysN", { n: plan.days })} ·{" "}
                    {plan.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}
                  </p>
                  <p className="mt-2 text-lg font-bold text-orange-700">{formatPrice(plan.pricePaise)}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100" aria-hidden>
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${(done / total) * 100}%` }} />
                  </div>
                  <p className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{t("plans.filled", { done, total })}</span>
                    <span>{t("plans.subs", { n: plan._count.subscriptions })}</span>
                  </p>
                  <p className="mt-3 text-sm font-medium text-orange-700">{t("plans.open")} &rarr;</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-10 text-lg font-semibold text-gray-900">{t("plans.new")}</h2>
      <div className="mt-3">
        <PlanForm />
      </div>
    </main>
  );
}
